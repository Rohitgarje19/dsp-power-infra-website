package in.dsppowerinfra.website.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Fail-fast guard for the "prod" profile: refuses to boot when the local-dev
 * default credentials are still in place. Development and test profiles are
 * unaffected. Activate with SPRING_PROFILES_ACTIVE=prod.
 */
@Component
@Profile("prod")
public class ProdConfigGuard {

    static final String DEFAULT_ADMIN_PASSWORD = "local-dev-admin";
    static final String DEFAULT_DB_PASSWORD = "local-dev-only";

    public ProdConfigGuard(
            @Value("${app.admin.password}") String adminPassword,
            @Value("${spring.datasource.password}") String dbPassword) {
        requireSecret(adminPassword, DEFAULT_ADMIN_PASSWORD, "ADMIN_PASSWORD");
        requireSecret(dbPassword, DEFAULT_DB_PASSWORD, "DB_PASSWORD");
    }

    private static void requireSecret(String value, String devDefault, String envVar) {
        if (value == null || value.isBlank() || value.equals(devDefault)) {
            throw new IllegalStateException(
                envVar + " must be set to a non-default value when running with the prod profile.");
        }
    }
}