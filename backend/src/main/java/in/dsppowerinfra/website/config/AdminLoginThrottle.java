package in.dsppowerinfra.website.config;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Tracks failed admin Basic-auth attempts per client IP. A short run of
 * failures temporarily blocks that IP so the single admin password cannot be
 * brute-forced cheaply. Successful authentication clears the counter.
 */
@Component
public class AdminLoginThrottle {

    private static final int MAX_TRACKED_IPS = 10_000;

    private final int maxFailures;
    private final Duration blockDuration;
    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public AdminLoginThrottle(
        @Value("${app.admin.login.max-failures:8}") int maxFailures,
        @Value("${app.admin.login.block-minutes:15}") long blockMinutes
    ) {
        this.maxFailures = Math.max(1, maxFailures);
        this.blockDuration = Duration.ofMinutes(Math.max(1, blockMinutes));
    }

    public boolean isBlocked(String ip) {
        Attempt attempt = attempts.get(ip);
        if (attempt == null || attempt.blockedUntil == null) {
            return false;
        }
        if (Instant.now().isBefore(attempt.blockedUntil)) {
            return true;
        }
        attempts.remove(ip);
        return false;
    }

    /** Seconds until the current block expires, for the Retry-After header. */
    public long retryAfterSeconds(String ip) {
        Attempt attempt = attempts.get(ip);
        if (attempt == null || attempt.blockedUntil == null) {
            return 0;
        }
        long seconds = Duration.between(Instant.now(), attempt.blockedUntil).toSeconds();
        return Math.max(1, seconds);
    }

    public void recordFailure(String ip) {
        if (attempts.size() > MAX_TRACKED_IPS) {
            attempts.clear();
        }
        attempts.compute(ip, (key, current) -> {
            int failures = (current == null ? 0 : current.failures) + 1;
            if (failures >= maxFailures) {
                return new Attempt(0, Instant.now().plus(blockDuration));
            }
            return new Attempt(failures, null);
        });
    }

    public void recordSuccess(String ip) {
        attempts.remove(ip);
    }

    private record Attempt(int failures, Instant blockedUntil) {
    }
}
