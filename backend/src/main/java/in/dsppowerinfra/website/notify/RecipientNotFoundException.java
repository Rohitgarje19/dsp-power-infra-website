package in.dsppowerinfra.website.notify;

/** Raised when a notification recipient id does not exist. */
public class RecipientNotFoundException extends RuntimeException {

    public RecipientNotFoundException(Long id) {
        super("Notification recipient " + id + " was not found.");
    }
}
