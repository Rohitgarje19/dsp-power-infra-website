package in.dsppowerinfra.website.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ProdConfigGuardTests {

    @Test
    void rejectsDefaultAdminPassword() {
        assertThatThrownBy(() -> new ProdConfigGuard("local-dev-admin", "strong-db-secret"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("ADMIN_PASSWORD");
    }

    @Test
    void rejectsDefaultDbPassword() {
        assertThatThrownBy(() -> new ProdConfigGuard("strong-admin-secret", "local-dev-only"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("DB_PASSWORD");
    }

    @Test
    void rejectsBlankSecrets() {
        assertThatThrownBy(() -> new ProdConfigGuard("", "strong-db-secret"))
            .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new ProdConfigGuard("strong-admin-secret", "  "))
            .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void acceptsNonDefaultSecrets() {
        assertThatCode(() -> new ProdConfigGuard("strong-admin-secret", "strong-db-secret"))
            .doesNotThrowAnyException();
    }
}