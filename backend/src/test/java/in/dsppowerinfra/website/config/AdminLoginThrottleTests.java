package in.dsppowerinfra.website.config;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest(properties = {
    "app.admin.login.max-attempts=5",
    "app.admin.login.window-ms=900000"
})
@AutoConfigureMockMvc
class AdminLoginThrottleTests {

    private static final String ADMIN = "testadmin";
    private static final String PASSWORD = "test-password-123";
    private static final AtomicInteger IP_COUNTER = new AtomicInteger();

    @Autowired
    private MockMvc mvc;

    /** Unique IP per test so the shared limiter never leaks across tests. */
    private static String freshIp() {
        int n = IP_COUNTER.incrementAndGet();
        return "10.88." + (n / 250) + "." + (n % 250 + 1);
    }

    private ResultActions attempt(String ip, String password) throws Exception {
        return mvc.perform(get("/api/admin/leads")
            .with(request -> {
                request.setRemoteAddr(ip);
                return request;
            })
            .with(httpBasic(ADMIN, password)));
    }

    @Test
    void locksOutAfterFiveFailedAttempts() throws Exception {
        String ip = freshIp();
        for (int i = 0; i < 5; i++) {
            attempt(ip, "wrong-password").andExpect(status().isUnauthorized());
        }
        attempt(ip, "wrong-password")
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
            .andExpect(jsonPath("$.message", notNullValue()))
            .andExpect(jsonPath("$.requestId", notNullValue()));
        // Even the correct password is refused while the window is active.
        attempt(ip, PASSWORD).andExpect(status().isTooManyRequests());
    }

    @Test
    void successfulSignInClearsFailures() throws Exception {
        String ip = freshIp();
        for (int i = 0; i < 4; i++) {
            attempt(ip, "wrong-password").andExpect(status().isUnauthorized());
        }
        attempt(ip, PASSWORD).andExpect(status().isOk());

        for (int i = 0; i < 4; i++) {
            attempt(ip, "wrong-password").andExpect(status().isUnauthorized());
        }
        attempt(ip, PASSWORD).andExpect(status().isOk());
    }

    @Test
    void lockoutIsScopedToTheClientIp() throws Exception {
        String blockedIp = freshIp();
        String otherIp = freshIp();
        for (int i = 0; i < 5; i++) {
            attempt(blockedIp, "wrong-password").andExpect(status().isUnauthorized());
        }
        attempt(blockedIp, PASSWORD).andExpect(status().isTooManyRequests());
        attempt(otherIp, PASSWORD).andExpect(status().isOk());
    }

    @Test
    void requestsWithoutCredentialsAreNotCounted() throws Exception {
        String ip = freshIp();
        for (int i = 0; i < 6; i++) {
            mvc.perform(get("/api/admin/leads").with(request -> {
                request.setRemoteAddr(ip);
                return request;
            })).andExpect(status().isUnauthorized());
        }
        attempt(ip, PASSWORD).andExpect(status().isOk());
    }
}
