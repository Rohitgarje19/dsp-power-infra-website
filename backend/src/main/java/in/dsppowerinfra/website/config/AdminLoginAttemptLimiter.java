package in.dsppowerinfra.website.config;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Sliding-window counter for failed admin sign-ins. Keys are scoped to the
 * client IP and to IP+username, so one source cannot lock the desk out for
 * everyone and a username alone cannot be locked out from another network.
 */
@Component
public class AdminLoginAttemptLimiter {

    // Bound memory if a large number of distinct clients fail sign-in.
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final int maxAttempts;
    private final long windowMillis;
    private final LongSupplier clock;
    private final ConcurrentHashMap<String, ArrayDeque<Long>> failures = new ConcurrentHashMap<>();

    @Autowired
    public AdminLoginAttemptLimiter(
            @Value("${app.admin.login.max-attempts:5}") int maxAttempts,
            @Value("${app.admin.login.window-ms:900000}") long windowMillis) {
        this(maxAttempts, windowMillis, System::currentTimeMillis);
    }

    AdminLoginAttemptLimiter(int maxAttempts, long windowMillis, LongSupplier clock) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.windowMillis = Math.max(1, windowMillis);
        this.clock = clock;
    }

    public boolean isBlocked(String key) {
        prune(key);
        Deque<Long> hits = failures.get(key);
        return hits != null && hits.size() >= maxAttempts;
    }

    public void recordFailure(String key) {
        if (failures.size() > MAX_TRACKED_KEYS) {
            failures.clear();
        }
        long now = clock.getAsLong();
        failures.compute(key, (ignored, hits) -> {
            ArrayDeque<Long> window = hits == null ? new ArrayDeque<>() : hits;
            prune(window, now);
            window.addLast(now);
            return window;
        });
    }

    public void clear(String key) {
        failures.remove(key);
    }

    public long retryAfterSeconds(String key) {
        prune(key);
        Deque<Long> hits = failures.get(key);
        if (hits == null || hits.isEmpty()) {
            return 0;
        }
        long remaining = hits.peekFirst() + windowMillis - clock.getAsLong();
        return Math.max(1, (remaining + 999) / 1000);
    }

    private void prune(String key) {
        long now = clock.getAsLong();
        failures.computeIfPresent(key, (ignored, hits) -> {
            prune(hits, now);
            return hits.isEmpty() ? null : hits;
        });
    }

    private void prune(Deque<Long> hits, long now) {
        while (!hits.isEmpty() && now - hits.peekFirst() >= windowMillis) {
            hits.pollFirst();
        }
    }
}
