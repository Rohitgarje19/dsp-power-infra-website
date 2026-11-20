package in.dsppowerinfra.website.config;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityHeadersTests {

    private static final String HSTS = "Strict-Transport-Security";

    @Autowired
    private MockMvc mvc;

    @Test
    void apiResponsesCarryHardeningHeaders() throws Exception {
        mvc.perform(get("/api/health").secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Content-Security-Policy",
                        allOf(containsString("default-src 'none'"), containsString("frame-ancestors 'none'"))))
                .andExpect(header().string("Permissions-Policy", containsString("camera=()")))
                .andExpect(header().string(HSTS, allOf(
                        containsString("max-age=31536000"), containsString("includeSubDomains"))));
    }

    @Test
    void hstsIsOnlySentOverHttps() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(HSTS));
    }

    @Test
    void headersAlsoApplyToAdminResponses() throws Exception {
        mvc.perform(get("/api/admin/leads")
                        .secure(true)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .httpBasic("testadmin", "test-password-123")))
                .andExpect(status().isOk())
                .andExpect(header().string(HSTS, containsString("max-age=31536000")))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }
}
