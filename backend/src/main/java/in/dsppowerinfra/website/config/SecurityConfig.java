package in.dsppowerinfra.website.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService users(
            PasswordEncoder encoder,
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.password}") String password) {

        return new InMemoryUserDetailsManager(
                User.withUsername(username)
                        .password(encoder.encode(password))
                        .roles("ADMIN")
                        .build()
        );
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, AdminLoginThrottle throttle) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .addFilterBefore(new AdminLoginThrottleFilter(throttle),
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(frame -> frame.deny())
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Sent on HTTPS requests only; the API serves JSON, so the
                        // policy can be maximally restrictive. The SPA's own CSP is
                        // delivered by whatever serves the built frontend.
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'none'; frame-ancestors 'none'; base-uri 'none'"))
                        .permissionsPolicyHeader(permissions -> permissions
                                .policy("camera=(), microphone=(), geolocation=(), payment=()")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/ready", "/api/leads", "/api/serviceability/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().denyAll()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        // Same-origin browser calls (POST/PATCH/DELETE send an Origin header) plus the
        // Vite dev servers. Matching on host keeps one deployed build working whether the
        // site is served from a domain, a preview host or a tunnel.
        List<String> devOrigins = List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174"
        );

        return request -> {
            String origin = request.getHeader("Origin");
            List<String> allowed = new ArrayList<>(devOrigins);
            if (origin != null && sameHost(origin, request) && !allowed.contains(origin)) {
                allowed.add(origin);
            }

            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOrigins(allowed);
            configuration.setAllowedMethods(List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
            ));
            configuration.setAllowedHeaders(List.of(
                    "Authorization",
                    "Content-Type"
            ));
            return configuration;
        };
    }

    /** True when the browser origin host matches the host this request reached us on. */
    private static boolean sameHost(String origin, HttpServletRequest request) {
        try {
            URI uri = URI.create(origin);
            String originHost = uri.getHost();
            if (originHost == null) {
                return false;
            }
            String forwardedHost = request.getHeader("X-Forwarded-Host");
            String host = (forwardedHost == null || forwardedHost.isBlank())
                    ? request.getHeader("Host")
                    : forwardedHost.split(",")[0].trim();
            if (host == null || host.isBlank()) {
                host = request.getServerName();
            }
            host = host.split(",")[0].trim();
            String hostOnly = host.startsWith("[")
                    ? host.substring(0, host.indexOf(']') + 1)
                    : host.split(":")[0];
            return originHost.equalsIgnoreCase(hostOnly);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}