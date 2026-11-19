package in.dsppowerinfra.website.shared;

import in.dsppowerinfra.website.lead.LeadNotFoundException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldIssue> issues = ex.getBindingResult().getFieldErrors().stream()
            .map(error -> new ApiError.FieldIssue(error.getField(), error.getDefaultMessage()))
            .toList();
        return ResponseEntity.unprocessableEntity()
            .body(ApiError.validation(issues, requestId()));
    }

    @ExceptionHandler(ApiValidationException.class)
    public ResponseEntity<ApiError> handleTypedValidation(ApiValidationException ex) {
        return ResponseEntity.unprocessableEntity()
            .body(ApiError.validation(
                List.of(new ApiError.FieldIssue(ex.getField(), ex.getMessage())),
                requestId()));
    }

    @ExceptionHandler(LeadNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(LeadNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("NOT_FOUND", ex.getMessage(), requestId()));
    }

    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<ApiError> handleRateLimit(RateLimitException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ApiError.of("RATE_LIMITED", ex.getMessage(), requestId()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        logger.warn("Unreadable request body: {}", ex.getMessage());
        return ResponseEntity.badRequest()
            .body(ApiError.of("BAD_REQUEST", "Malformed or unreadable request body.", requestId()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        logger.error("Unhandled exception while processing request", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError.of("INTERNAL_ERROR", "Something went wrong. Please try again.", requestId()));
    }

    private String requestId() {
        return MDC.get(RequestIdFilter.MDC_KEY);
    }
}