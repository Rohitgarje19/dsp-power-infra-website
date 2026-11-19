package in.dsppowerinfra.website.lead;

import in.dsppowerinfra.website.shared.RateLimitException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * In-memory rolling-window rate limiter for public lead submissions:
 * at most {@value #MAX_REQUESTS} POSTs per {@value #WINDOW_MS} ms per client IP.
 * Registered only for /api/leads (see WebConfig). Thread-safe: all mutation of
 * a given IP's window happens inside ConcurrentHashMap#compute.
 */
@Component
public class LeadRateLimitInterceptor implements HandlerInterceptor {

    static final int MAX_REQUESTS = 5;
    static final long WINDOW_MS = 60_000L;

    private final ConcurrentHashMap<String, Deque<Long>> hitsByIp = new ConcurrentHashMap<>();
    private final AtomicLong lastSweep = new AtomicLong(System.currentTimeMillis());

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();
        sweepStaleEntries(now);

        boolean[] allowed = {false};
        hitsByIp.compute(ip, (key, window) -> {
            Deque<Long> hits = window == null ? new ArrayDeque<>() : window;
            while (!hits.isEmpty() && now - hits.peekFirst() >= WINDOW_MS) {
                hits.pollFirst();
            }
            if (hits.size() < MAX_REQUESTS) {
                hits.addLast(now);
                allowed[0] = true;
            }
            return hits.isEmpty() ? null : hits;
        });

        if (!allowed[0]) {
            throw new RateLimitException();
        }
        return true;
    }

    /** Periodically drop entries whose entire window has expired. */
    private void sweepStaleEntries(long now) {
        long previous = lastSweep.get();
        if (now - previous < WINDOW_MS || !lastSweep.compareAndSet(previous, now)) {
            return;
        }
        for (String ip : hitsByIp.keySet()) {
            hitsByIp.compute(ip, (key, window) -> {
                if (window == null) {
                    return null;
                }
                while (!window.isEmpty() && now - window.peekFirst() >= WINDOW_MS) {
                    window.pollFirst();
                }
                return window.isEmpty() ? null : window;
            });
        }
    }
}