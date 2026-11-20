package in.dsppowerinfra.website.shared;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import in.dsppowerinfra.website.lead.DeletedLeadCleanup;
import in.dsppowerinfra.website.lead.LeadRepository;
import in.dsppowerinfra.website.notify.LeadNotificationService;
import in.dsppowerinfra.website.notify.NotificationRecipientRepository;
import in.dsppowerinfra.website.serviceability.PincodeDirectory;
import in.dsppowerinfra.website.serviceability.ServiceabilityController;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Guards the "never crash a request" contract: client mistakes stay 4xx,
 * infrastructure failures stay 5xx with a typed envelope, and best-effort
 * helpers (PIN lookup, scheduled cleanup, test email) swallow and log instead
 * of propagating.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ExceptionResilienceTests {

    private static final String ADMIN = "testadmin";
    private static final String PASSWORD = "test-password-123";

    @Autowired
    private MockMvc mvc;

    // ---------- HTTP status mapping ----------

    @Test
    void wrongMethodIsRejectedAs405Not500() throws Exception {
        mvc.perform(put("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isMethodNotAllowed())
            .andExpect(header().exists("Allow"))
            .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"))
            .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    @Test
    void nonJsonBodyIsRejectedAs415Not500() throws Exception {
        mvc.perform(post("/api/leads")
                .contentType(MediaType.TEXT_PLAIN)
                .content("fullName=Asha")
                .with(request -> {
                    request.setRemoteAddr("10.90.0.1");
                    return request;
                }))
            .andExpect(status().isUnsupportedMediaType())
            .andExpect(jsonPath("$.code").value("UNSUPPORTED_MEDIA_TYPE"));
    }

    @Test
    void unparseablePagingParameterIsA400Not500() throws Exception {
        mvc.perform(get("/api/admin/leads")
                .param("page", "abc")
                .with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].field").value("page"));
    }

    @Test
    void databaseOutageMapsTo503WithAFriendlyMessage() {
        ResponseEntity<ApiError> response = new GlobalExceptionHandler()
            .handleDataAccess(new DataAccessResourceFailureException("connection refused"));

        assertThat(response.getStatusCode().value()).isEqualTo(503);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("SERVICE_UNAVAILABLE");
        assertThat(response.getBody().message()).contains("try again");
    }

    // ---------- Background and best-effort paths ----------

    @Test
    void scheduledCleanupSurvivesADatabaseFailure() {
        LeadRepository repository = mock(LeadRepository.class);
        when(repository.deleteAllByDeletedTrueAndDeletedAtBefore(any(Instant.class)))
            .thenThrow(new DataAccessResourceFailureException("connection refused"));
        DeletedLeadCleanup cleanup = new DeletedLeadCleanup(repository);

        assertThatCode(cleanup::permanentlyDeleteExpiredLeads)
            .doesNotThrowAnyException();
    }

    @Test
    void pincodeLookupReturnsEmptyOnAMalformedTemplateInsteadOfThrowing() {
        PincodeDirectory directory = new PincodeDirectory("https://example.test/%d%s");

        assertThat(directory.lookup("411046")).isEmpty();
        assertThat(directory.lookup(null)).isEmpty();
    }

    @Test
    void serviceabilityStillWorksWhenPrefixConfigHasBadEntries() {
        PincodeDirectory directory = mock(PincodeDirectory.class);
        when(directory.lookup(any())).thenReturn(Optional.empty());
        ServiceabilityController controller = new ServiceabilityController(
            "400-445,abc-def,450-440,1-999999999", "403", directory);

        ServiceabilityController.ServiceabilityResponse pune = controller.check("411046");

        assertThat(pune.serviceable()).isTrue();
        assertThat(pune.city()).isNull();
    }

    @Test
    void testEmailExplainsAnUnreadableRecipientListInsteadOfThrowing() {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> senders = mock(ObjectProvider.class);
        when(senders.getIfAvailable()).thenReturn(mock(JavaMailSender.class));
        NotificationRecipientRepository recipients = mock(NotificationRecipientRepository.class);
        when(recipients.findByActiveTrueOrderByIdAsc())
            .thenThrow(new DataAccessResourceFailureException("connection refused"));
        LeadNotificationService service = new LeadNotificationService(
            senders, recipients, true, "", "smtp.example.test", "", "", "");

        LeadNotificationService.TestResult result = service.sendTestEmail();

        assertThat(result.sent()).isZero();
        assertThat(result.message()).containsIgnoringCase("try again");
    }
}
