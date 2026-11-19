package in.dsppowerinfra.website.shared;

/**
 * Typed validation failure for inputs that cannot be expressed with Bean
 * Validation annotations (e.g. path variables). Mapped to HTTP 422.
 */
public class ApiValidationException extends RuntimeException {

    private final String field;

    public ApiValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}