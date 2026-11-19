package in.dsppowerinfra.website.shared;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ReadinessTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void readyIsPublicAndReportsDatabaseUp() throws Exception {
        mvc.perform(get("/api/ready"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ok"))
            .andExpect(jsonPath("$.database").value("up"));
    }

    @Test
    void healthRemainsStaticLiveness() throws Exception {
        mvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void returns503WhenDatabaseIsUnreachable() throws Exception {
        DataSource broken = mock(DataSource.class);
        when(broken.getConnection()).thenThrow(new SQLException("connection refused"));
        ReadinessController controller = new ReadinessController(broken);

        ResponseEntity<ReadinessController.Readiness> response = controller.ready();

        assertThat(response.getStatusCode().value()).isEqualTo(503);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo("degraded");
        assertThat(response.getBody().database()).isEqualTo("down");
    }

    @Test
    void returns503WhenConnectionIsValidCheckFails() throws Exception {
        DataSource stale = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        when(stale.getConnection()).thenReturn(connection);
        when(connection.isValid(anyInt())).thenReturn(false);
        ReadinessController controller = new ReadinessController(stale);

        ResponseEntity<ReadinessController.Readiness> response = controller.ready();

        assertThat(response.getStatusCode().value()).isEqualTo(503);
        assertThat(response.getBody().database()).isEqualTo("down");
    }
}