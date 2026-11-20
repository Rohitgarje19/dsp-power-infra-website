package in.dsppowerinfra.website.config;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/**
 * With the threshold lowered to 3 failures, a burst of bad Basic-auth attempts
 * must lock that IP out temporarily — even for the correct password — and must
 * not affect other clients.
 */
@SpringBootTest(properties = {
    "app.admin.login.max-failures=3",
    "app.admin.login.block-minutes=15"
})
@AutoConfigureMockMvc
class AdminLoginThrottleTests {

    private static final String ADMIN = "testadmin";
    private static final String PASSWORD = "test-password-123";

    @Autowired
    private MockMvc mvc;

    private static RequestPostProcessor from(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    private void wrongCredentials(String ip) throws Exception {
        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, "wrong-password")).with(from(ip)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void repeatedFailuresBlockTheIpEvenWithCorrectCredentials() throws Exception {
        String blockedIp = "10.210.0.1";
        wrongCredentials(blockedIp);
        wrongCredentials(blockedIp);
        wrongCredentials(blockedIp);

        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, PASSWORD)).with(from(blockedIp)))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
            .andExpect(jsonPath("$.message", notNullValue()))
            .andExpect(jsonPath("$.requestId", notNullValue()));

        // A different client is unaffected.
        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, PASSWORD)).with(from("10.210.0.2")))
            .andExpect(status().isOk());
    }

    @Test
    void successfulSignInResetsTheFailureCounter() throws Exception {
        String ip = "10.210.0.3";
        wrongCredentials(ip);
        wrongCredentials(ip);

        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, PASSWORD)).with(from(ip)))
            .andExpect(status().isOk());

        // Counter starts again from zero after the success.
        wrongCredentials(ip);
        wrongCredentials(ip);
        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, PASSWORD)).with(from(ip)))
            .andExpect(status().isOk());
    }
}
