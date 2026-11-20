package in.dsppowerinfra.website.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects admin requests from IPs that have failed Basic auth too often.
 * Runs before the security chain, so even correct credentials are refused
 * until the block expires. 401 responses on admin paths are counted;
 * successful admin responses reset the counter for that IP.
 */
public class AdminLoginThrottleFilter extends OncePerRequestFilter {

    private final AdminLoginThrottle throttle;

    public AdminLoginThrottleFilter(AdminLoginThrottle throttle) {
        this.throttle = throttle;
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
        String ip = request.getRemoteAddr();
        if (throttle.isBlocked(ip)) {
            long retryAfter = throttle.retryAfterSeconds(ip);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"code\":\"RATE_LIMITED\",\"message\":\"Too many failed sign-in attempts. Try again in "
                    + Math.max(1, Math.round(retryAfter / 60.0)) + " minutes.\",\"requestId\":\""
                    + String.valueOf(MDC.get("requestId")) + "\"}");
            return;
        }

        filterChain.doFilter(request, response);

        if (request.getHeader("Authorization") != null && request.getRequestURI().startsWith("/api/admin/")) {
            if (response.getStatus() == HttpServletResponse.SC_UNAUTHORIZED) {
                throttle.recordFailure(ip);
            } else if (response.getStatus() < 400) {
                throttle.recordSuccess(ip);
            }
        }
    }
}
