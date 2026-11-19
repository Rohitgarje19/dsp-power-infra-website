package in.dsppowerinfra.website.shared;

/** Thrown when a client exceeds the per-IP request budget. Mapped to HTTP 429. */
public class RateLimitException extends RuntimeException {

    public RateLimitException() {
        super("Too many requests. Please wait a minute and try again.");
    }
}