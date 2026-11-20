package in.dsppowerinfra.website.config;

import in.dsppowerinfra.website.shared.RequestIdFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects repeated failed HTTP Basic attempts on /api/admin/** before
 * BasicAuthenticationFilter verifies them again. Only requests that actually
 * present credentials are counted, so unauthenticated probes always get the
 * normal 401 and never consume the lockout budget.
 */
public class AdminLoginThrottleFilter extends OncePerRequestFilter {

    private static final String RATE_LIMITED_BODY =
        "{\"code\":\"RATE_LIMITED\",\"message\":\"Too many failed sign-in attempts. Try again later.\"";

    private final AdminLoginAttemptLimiter limiter;

    public AdminLoginThrottleFilter(AdminLoginAttemptLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/admin/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String username = basicUsername(request);
        if (username == null) {
            filterChain.doFilter(request, response);
            return;
        }
        String ipKey = "ip:" + request.getRemoteAddr();
        String userKey = ipKey + "|user:" + username;
        String blockedKey = limiter.isBlocked(ipKey) ? ipKey
            : limiter.isBlocked(userKey) ? userKey
            : null;
        if (blockedKey != null) {
            writeRateLimited(response, limiter.retryAfterSeconds(blockedKey));
            return;
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (response.getStatus() == HttpServletResponse.SC_UNAUTHORIZED) {
                limiter.recordFailure(ipKey);
                limiter.recordFailure(userKey);
            } else if (response.getStatus() < 400) {
                limiter.clear(ipKey);
                limiter.clear(userKey);
            }
        }
    }

    private static String basicUsername(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.regionMatches(true, 0, "Basic ", 0, 6)) {
            return null;
        }
        try {
            String decoded = new String(
                Base64.getDecoder().decode(header.substring(6).trim()),
                StandardCharsets.UTF_8);
            int separator = decoded.indexOf(':');
            return separator > 0 ? decoded.substring(0, separator) : null;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static void writeRateLimited(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Cache-Control", "no-store");
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        String suffix = requestId == null ? "" : ",\"requestId\":\"" + requestId + "\"";
        response.getWriter().write(RATE_LIMITED_BODY + suffix + "}");
    }
}
