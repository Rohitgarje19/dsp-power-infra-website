package in.dsppowerinfra.website.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class AdminLoginAttemptLimiterTests {

    private final AtomicLong now = new AtomicLong(1_000_000L);

    private AdminLoginAttemptLimiter limiter(int maxAttempts, long windowMillis) {
        return new AdminLoginAttemptLimiter(maxAttempts, windowMillis, now::get);
    }

    @Test
    void blocksAtTheLimitAndRecoversAfterTheWindow() {
        AdminLoginAttemptLimiter limiter = limiter(2, 60_000);

        limiter.recordFailure("ip:a");
        assertThat(limiter.isBlocked("ip:a")).isFalse();
        limiter.recordFailure("ip:a");

        assertThat(limiter.isBlocked("ip:a")).isTrue();
        assertThat(limiter.retryAfterSeconds("ip:a")).isEqualTo(60);

        now.addAndGet(60_000);
        assertThat(limiter.isBlocked("ip:a")).isFalse();
        assertThat(limiter.retryAfterSeconds("ip:a")).isZero();
    }

    @Test
    void keysAreIndependentAndClearResetsTheWindow() {
        AdminLoginAttemptLimiter limiter = limiter(2, 60_000);
        limiter.recordFailure("ip:a");
        limiter.recordFailure("ip:a");
        limiter.recordFailure("ip:b");

        assertThat(limiter.isBlocked("ip:a")).isTrue();
        assertThat(limiter.isBlocked("ip:b")).isFalse();

        limiter.clear("ip:a");
        assertThat(limiter.isBlocked("ip:a")).isFalse();
    }
}
