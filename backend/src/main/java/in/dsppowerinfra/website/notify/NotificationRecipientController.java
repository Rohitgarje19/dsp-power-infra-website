package in.dsppowerinfra.website.notify;

import in.dsppowerinfra.website.shared.ApiValidationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Inboxes that receive an email for every new enquiry. Managed from the
 * admin desk so a non-technical owner can add a colleague or Gmail address
 * without touching server configuration.
 */
@RestController
@RequestMapping("/api/admin/notification-recipients")
public class NotificationRecipientController {

    static final int MAX_RECIPIENTS = 20;

    private final NotificationRecipientRepository recipients;
    private final LeadNotificationService notifications;

    public NotificationRecipientController(
        NotificationRecipientRepository recipients,
        LeadNotificationService notifications
    ) {
        this.recipients = recipients;
        this.notifications = notifications;
    }

    @GetMapping
    public Settings settings() {
        return new Settings(
            recipients.findAllByOrderByIdAsc(),
            notifications.notificationsEnabled(),
            notifications.smtpConfigured(),
            notifications.fallbackRecipient(),
            MAX_RECIPIENTS);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationRecipient add(@Valid @RequestBody RecipientRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (recipients.existsByEmailIgnoreCase(email)) {
            throw new ApiValidationException("email", "this address is already on the list");
        }
        if (recipients.count() >= MAX_RECIPIENTS) {
            throw new ApiValidationException(
                "email", "you can add up to " + MAX_RECIPIENTS + " recipients");
        }
        String label = request.label() == null || request.label().isBlank()
            ? null
            : request.label().trim();
        try {
            return recipients.save(new NotificationRecipient(email, label));
        } catch (DataIntegrityViolationException ex) {
            throw new ApiValidationException("email", "this address is already on the list");
        }
    }

    @PatchMapping("/{id}")
    public NotificationRecipient update(
        @PathVariable Long id,
        @Valid @RequestBody ActiveRequest request
    ) {
        NotificationRecipient recipient = find(id);
        recipient.setActive(request.active());
        return recipients.save(recipient);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long id) {
        recipients.delete(find(id));
    }

    /** Sends a test message to every active recipient so the team can verify setup. */
    @PostMapping("/test")
    public LeadNotificationService.TestResult test() {
        return notifications.sendTestEmail();
    }

    private NotificationRecipient find(Long id) {
        return recipients.findById(id).orElseThrow(() -> new RecipientNotFoundException(id));
    }

    public record RecipientRequest(
        @NotBlank(message = "email is required")
        @Email(message = "enter a valid email address")
        @Size(max = 254, message = "email is too long")
        String email,
        @Size(max = 80, message = "name must be 80 characters or fewer")
        String label
    ) {
        public RecipientRequest {
            email = email == null ? null : email.trim();
            label = label == null ? null : label.trim();
        }
    }

    public record ActiveRequest(
        @NotNull(message = "active is required") Boolean active
    ) {
    }

    public record Settings(
        List<NotificationRecipient> items,
        boolean notificationsEnabled,
        boolean smtpConfigured,
        String fallbackRecipient,
        int maxRecipients
    ) {
    }
}
