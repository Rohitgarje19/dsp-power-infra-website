package in.dsppowerinfra.website.notify;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * End-to-end SMTP check: a real lead POST must produce a real message on the
 * configured SMTP server. GreenMail runs an in-process SMTP endpoint, so the
 * full JavaMail path (auto-configured sender, async executor, retry-free
 * delivery) is exercised without external services.
 */
@SpringBootTest(properties = {
    "app.notify.enabled=true",
    "app.notify.to=owner@example.com",
    "app.notify.from=alerts@dsppowerinfra.example",
    "spring.mail.properties.mail.smtp.auth=false",
    "spring.mail.properties.mail.smtp.starttls.enable=false"
})
@AutoConfigureMockMvc
class LeadEmailNotificationTests {

    private static final GreenMail GREEN_MAIL = new GreenMail(ServerSetupTest.SMTP);

    static {
        GREEN_MAIL.start();
    }

    @DynamicPropertySource
    static void mailProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", () -> "127.0.0.1");
        registry.add("spring.mail.port", () -> GREEN_MAIL.getSmtp().getPort());
    }

    @AfterAll
    static void stopMailServer() {
        GREEN_MAIL.stop();
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private NotificationRecipientRepository recipients;

    @BeforeEach
    void resetMailboxesAndRecipients() throws Exception {
        GREEN_MAIL.purgeEmailFromAllMailboxes();
        recipients.deleteAll();
    }

    @Test
    void newLeadSendsNotificationEmailOverSmtp() throws Exception {
        GREEN_MAIL.purgeEmailFromAllMailboxes();

        mvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"fullName":"Notify Email Test","phone":"9876543210","customerType":"residential",
                     "city":"Pune","pincode":"411046","monthlyBill":1800,"source":"contact"}
                    """)
                .with(request -> {
                    request.setRemoteAddr("10.99.1.1");
                    return request;
                }))
            .andExpect(status().isCreated());

        long deadline = System.currentTimeMillis() + 5_000;
        while (GREEN_MAIL.getReceivedMessages().length == 0 && System.currentTimeMillis() < deadline) {
            Thread.sleep(100);
        }

        MimeMessage[] messages = GREEN_MAIL.getReceivedMessages();
        assertThat(messages).hasSize(1);
        assertThat(messages[0].getAllRecipients()[0].toString()).isEqualTo("owner@example.com");
        assertThat(messages[0].getFrom()[0].toString()).isEqualTo("alerts@dsppowerinfra.example");
        assertThat(messages[0].getSubject()).contains("New solar enquiry").contains("Notify Email Test");
        assertThat(GreenMailUtil.getBody(messages[0]))
            .contains("Notify Email Test")
            .contains("9876543210")
            .contains("Pune");
    }

    @Test
    void newLeadNotifiesEveryActiveRecipientAndSkipsPausedOnes() throws Exception {
        recipients.save(new NotificationRecipient("sales@example.com", "Sales"));
        recipients.save(new NotificationRecipient("ops@example.com", "Operations"));
        NotificationRecipient paused = new NotificationRecipient("paused@example.com", null);
        paused.setActive(false);
        recipients.save(paused);

        mvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"fullName":"Multi Recipient Test","phone":"9876500001","customerType":"residential",
                     "city":"Pune","pincode":"411046","monthlyBill":1500,"source":"contact"}
                    """)
                .with(request -> {
                    request.setRemoteAddr("10.99.1.2");
                    return request;
                }))
            .andExpect(status().isCreated());

        MimeMessage[] messages = waitForMessages(3);

        Set<String> delivered = Arrays.stream(messages)
            .map(message -> {
                try {
                    return message.getAllRecipients()[0].toString();
                } catch (Exception ex) {
                    throw new IllegalStateException(ex);
                }
            })
            .collect(Collectors.toSet());

        assertThat(delivered).containsExactlyInAnyOrder(
            "owner@example.com", "sales@example.com", "ops@example.com");
        assertThat(messages).allSatisfy(message -> {
            try {
                assertThat(message.getAllRecipients()).hasSize(1);
            } catch (Exception ex) {
                throw new IllegalStateException(ex);
            }
        });
    }

    @Test
    void testEmailEndpointSendsToEveryActiveInbox() throws Exception {
        recipients.save(new NotificationRecipient("sales@example.com", "Sales"));

        mvc.perform(post("/api/admin/notification-recipients/test")
                .with(httpBasic("testadmin", "test-password-123")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sent").value(2))
            .andExpect(jsonPath("$.message").value("Test email sent to 2 addresses."));

        MimeMessage[] messages = waitForMessages(2);
        assertThat(messages).allSatisfy(message -> {
            try {
                assertThat(message.getSubject()).contains("Test email");
            } catch (Exception ex) {
                throw new IllegalStateException(ex);
            }
        });
    }

    private static MimeMessage[] waitForMessages(int count) throws InterruptedException {
        long deadline = System.currentTimeMillis() + 5_000;
        while (GREEN_MAIL.getReceivedMessages().length < count && System.currentTimeMillis() < deadline) {
            Thread.sleep(100);
        }
        MimeMessage[] messages = GREEN_MAIL.getReceivedMessages();
        assertThat(messages).hasSize(count);
        return messages;
    }
}
