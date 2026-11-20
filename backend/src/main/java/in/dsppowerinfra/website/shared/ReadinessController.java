package in.dsppowerinfra.website.shared;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Readiness probe: unlike /api/health (static liveness), this checks that the
 * database actually answers. Returns 503 while the DB is unreachable so load
 * balancers and orchestrators stop routing traffic here.
 */
@RestController
public class ReadinessController {

    private static final Logger logger = LoggerFactory.getLogger(ReadinessController.class);

    private final DataSource dataSource;

    public ReadinessController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/api/ready")
    public ResponseEntity<Readiness> ready() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return ResponseEntity.ok(new Readiness("ok", "up"));
            }
        } catch (SQLException ex) {
            logger.warn("Readiness check failed: database unreachable ({})", ex.getMessage());
        } catch (RuntimeException ex) {
            // A closed or misconfigured pool can throw unchecked exceptions too;
            // the probe must always answer with a status, never a stack trace.
            logger.warn("Readiness check failed: {}", ex.getClass().getSimpleName());
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(new Readiness("degraded", "down"));
    }

    public record Readiness(String status, String database) {
    }
}