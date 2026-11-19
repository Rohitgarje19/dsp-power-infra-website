package in.dsppowerinfra.website.shared;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Uniform error envelope returned by {@link GlobalExceptionHandler}. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String code, String message, List<FieldIssue> errors, String requestId) {

    public record FieldIssue(String field, String message) {
    }

    public static ApiError of(String code, String message, String requestId) {
        return new ApiError(code, message, null, requestId);
    }

    public static ApiError validation(List<FieldIssue> errors, String requestId) {
        return new ApiError("VALIDATION_ERROR", "Validation failed", errors, requestId);
    }
}