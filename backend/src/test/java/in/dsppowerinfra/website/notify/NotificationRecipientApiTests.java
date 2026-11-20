package in.dsppowerinfra.website.notify;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * The admin desk owns the notification list: these tests cover auth, adding
 * (normalised + validated), duplicates, pausing, removal and the status the
 * UI uses to explain whether mail is actually switched on.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationRecipientApiTests {

    private static final String ADMIN = "testadmin";
    private static final String PASSWORD = "test-password-123";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private NotificationRecipientRepository recipients;

    private static String body(String email, String label) {
        return "{\"email\":\"" + email + "\"" + (label == null ? "" : ",\"label\":\"" + label + "\"") + "}";
    }

    @Test
    void requiresAdminAuthentication() throws Exception {
        mvc.perform(get("/api/admin/notification-recipients"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void reportsSettingsBeforeAnythingIsAdded() throws Exception {
        mvc.perform(get("/api/admin/notification-recipients").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items", hasSize(0)))
            .andExpect(jsonPath("$.notificationsEnabled").value(false))
            .andExpect(jsonPath("$.smtpConfigured").value(false))
            .andExpect(jsonPath("$.maxRecipients").value(20));
    }

    @Test
    void addsAndListsRecipientsWithNormalisedEmail() throws Exception {
        mvc.perform(post("/api/admin/notification-recipients")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("  Sales@Example.COM  ", "Sales team")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("sales@example.com"))
            .andExpect(jsonPath("$.label").value("Sales team"))
            .andExpect(jsonPath("$.active").value(true));

        mvc.perform(get("/api/admin/notification-recipients").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(jsonPath("$.items", hasSize(1)))
            .andExpect(jsonPath("$.items[0].email").value("sales@example.com"));
    }

    @Test
    void rejectsInvalidEmail() throws Exception {
        mvc.perform(post("/api/admin/notification-recipients")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("not-an-email", null)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[0].field").value("email"));
    }

    @Test
    void rejectsDuplicateAddressIgnoringCase() throws Exception {
        mvc.perform(post("/api/admin/notification-recipients")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("owner@example.com", null)))
            .andExpect(status().isCreated());

        mvc.perform(post("/api/admin/notification-recipients")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("OWNER@example.com", "Again")))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[0].message").value(containsString("already on the list")));
    }

    @Test
    void pausesAndResumesARecipient() throws Exception {
        NotificationRecipient saved = recipients.save(new NotificationRecipient("ops@example.com", null));

        mvc.perform(patch("/api/admin/notification-recipients/" + saved.getId())
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"active\":false}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.active").value(false));

        mvc.perform(patch("/api/admin/notification-recipients/" + saved.getId())
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"active\":true}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void removesARecipient() throws Exception {
        NotificationRecipient saved = recipients.save(new NotificationRecipient("remove@example.com", null));

        mvc.perform(delete("/api/admin/notification-recipients/" + saved.getId())
                .with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isNoContent());

        mvc.perform(get("/api/admin/notification-recipients").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    void unknownRecipientIdIsNotFound() throws Exception {
        mvc.perform(delete("/api/admin/notification-recipients/999999")
                .with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isNotFound());
    }

    @Test
    void enforcesTheRecipientLimit() throws Exception {
        for (int i = 0; i < 20; i++) {
            recipients.save(new NotificationRecipient("person" + i + "@example.com", null));
        }

        mvc.perform(post("/api/admin/notification-recipients")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("one-too-many@example.com", null)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[0].message").value(containsString("up to 20")));
    }

    @Test
    void acceptsWritesFromTheSitesOwnOrigin() throws Exception {
        // Browsers attach an Origin header to POST/PATCH/DELETE, including same-origin calls.
        mvc.perform(post("/api/admin/notification-recipients")
                .header("Origin", "http://localhost")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("origin@example.com", null)))
            .andExpect(status().isCreated());
    }

    @Test
    void rejectsWritesFromAForeignOrigin() throws Exception {
        mvc.perform(post("/api/admin/notification-recipients")
                .header("Origin", "https://evil.example")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body("origin@example.com", null)))
            .andExpect(status().isForbidden());
    }

    @Test
    void testEmailExplainsThatSendingIsSwitchedOff() throws Exception {
        mvc.perform(post("/api/admin/notification-recipients/test")
                .with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sent").value(0))
            .andExpect(jsonPath("$.message").value(containsString("switched off")));
    }
}
