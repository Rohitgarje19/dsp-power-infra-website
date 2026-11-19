package in.dsppowerinfra.website.notify;

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
 * Notifications enabled but no SMTP host configured: no JavaMailSender bean
 * exists, and lead creation must still succeed (fail-safe requirement).
 */
@SpringBootTest(properties = {
    "app.notify.enabled=true",
    "app.notify.to=owner@example.com",
    "spring.mail.host="
})
@AutoConfigureMockMvc
@Transactional
class LeadNotificationFailSafeTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void leadCreationSucceedsWhenNotifyEnabledButMailNotConfigured() throws Exception {
        mvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"fullName":"Notify Test","phone":"9876543210","customerType":"residential",
                     "city":"Pune","pincode":"411046","monthlyBill":1500}
                    """)
                .with(request -> {
                    request.setRemoteAddr("10.99.0.1");
                    return request;
                }))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists());
    }
}