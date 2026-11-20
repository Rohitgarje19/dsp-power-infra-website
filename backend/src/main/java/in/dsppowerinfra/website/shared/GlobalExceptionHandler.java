package in.dsppowerinfra.website.shared;

import in.dsppowerinfra.website.lead.LeadNotFoundException;
import in.dsppowerinfra.website.notify.RecipientNotFoundException;
import jakarta.validation.ConstraintViolationException;
import java.util.Arrays;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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

    @ExceptionHandler(RecipientNotFoundException.class)
    public ResponseEntity<ApiError> handleRecipientNotFound(RecipientNotFoundException ex) {
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

    /**
     * Wrong verb (for example GET on /api/leads) is a client mistake, not a
     * server fault. Without this handler it would fall through to
     * {@link #handleUnexpected} and be reported as a 500.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        ResponseEntity.BodyBuilder response = ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED);
        String[] supported = ex.getSupportedMethods();
        if (supported != null && supported.length > 0) {
            response.header(HttpHeaders.ALLOW, String.join(", ", Arrays.asList(supported)));
        }
        return response.body(ApiError.of(
            "METHOD_NOT_ALLOWED",
            "This action is not supported for this address.",
            requestId()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body(ApiError.of(
                "UNSUPPORTED_MEDIA_TYPE",
                "Send this request as JSON (Content-Type: application/json).",
                requestId()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParameter(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest()
            .body(ApiError.validation(
                List.of(new ApiError.FieldIssue(ex.getParameterName(), "is required")),
                requestId()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest()
            .body(ApiError.validation(
                List.of(new ApiError.FieldIssue(ex.getName(), "has an invalid value")),
                requestId()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
        List<ApiError.FieldIssue> issues = ex.getConstraintViolations().stream()
            .map(violation -> new ApiError.FieldIssue(
                violation.getPropertyPath() == null ? null : violation.getPropertyPath().toString(),
                violation.getMessage()))
            .toList();
        return ResponseEntity.unprocessableEntity()
            .body(ApiError.validation(issues, requestId()));
    }

    /**
     * A database outage is temporary and recoverable, so it is reported as
     * 503 (the frontend already retries 5xx on idempotent calls) instead of an
     * opaque 500. The stack trace stays in the server log.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex) {
        logger.error("Database error while processing request", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ApiError.of(
                "SERVICE_UNAVAILABLE",
                "The service is temporarily unavailable. Please try again in a moment.",
                requestId()));
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