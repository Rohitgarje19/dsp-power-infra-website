package in.dsppowerinfra.website.serviceability;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceabilityEndpointTests {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private PincodeDirectory directory;

    @Test
    void resolvesCityForAnyIndianPincode() throws Exception {
        when(directory.lookup("400001"))
            .thenReturn(Optional.of(new PincodeDirectory.PincodeInfo("Mumbai", "Maharashtra")));
        mvc.perform(get("/api/serviceability/400001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serviceable").value(false))
            .andExpect(jsonPath("$.city").value("Mumbai"))
            .andExpect(jsonPath("$.state").value("Maharashtra"));
    }

    @Test
    void keepsServiceableFlagsWhileResolvingTheCity() throws Exception {
        when(directory.lookup("411046"))
            .thenReturn(Optional.of(new PincodeDirectory.PincodeInfo("Pune", "Maharashtra")));
        mvc.perform(get("/api/serviceability/411046"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serviceable").value(true))
            .andExpect(jsonPath("$.area").value("Pune region"))
            .andExpect(jsonPath("$.city").value("Pune"))
            .andExpect(jsonPath("$.state").value("Maharashtra"));
    }

    @Test
    void lookupFailureStillReturnsAValidResponse() throws Exception {
        when(directory.lookup("411046")).thenReturn(Optional.empty());
        mvc.perform(get("/api/serviceability/411046"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serviceable").value(true))
            .andExpect(jsonPath("$.city").doesNotExist())
            .andExpect(jsonPath("$.state").doesNotExist());
    }
}
