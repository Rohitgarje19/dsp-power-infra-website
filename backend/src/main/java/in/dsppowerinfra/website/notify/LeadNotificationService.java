package in.dsppowerinfra.website.notify;

import in.dsppowerinfra.website.lead.Lead;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends a plain-text notification email when a new lead is saved.
 * Default OFF. Recipients come from the admin desk (notification_recipients)
 * plus the optional server-level NOTIFY_TO fallback, de-duplicated.
 * Entirely fail-safe: any problem here is logged (leadId and counts only,
 * never personal contact data) and never propagates to lead creation.
 */
@Service
public class LeadNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(LeadNotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenders;
    private final NotificationRecipientRepository recipients;
    private final boolean enabled;
    private final String fallbackRecipient;
    private final String mailHost;
    private final String from;

    public LeadNotificationService(
        ObjectProvider<JavaMailSender> mailSenders,
        NotificationRecipientRepository recipients,
        @Value("${app.notify.enabled:false}") boolean enabled,
        @Value("${app.notify.to:}") String to,
        @Value("${spring.mail.host:}") String mailHost,
        @Value("${app.notify.from:}") String from,
        @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.mailSenders = mailSenders;
        this.recipients = recipients;
        this.enabled = enabled;
        this.fallbackRecipient = isBlank(to) ? null : to.trim();
        this.mailHost = mailHost;
        this.from = !isBlank(from) ? from.trim() : (isBlank(mailUsername) ? null : mailUsername.trim());
    }

    public boolean notificationsEnabled() {
        return enabled;
    }

    public boolean smtpConfigured() {
        return !isBlank(mailHost);
    }

    public String fallbackRecipient() {
        return fallbackRecipient;
    }

    @Async("notifyExecutor")
    public void notifyNewLead(Lead lead) {
        try {
            if (!enabled) {
                logger.info(
                    "New-lead notification skipped for leadId={}: sending is switched off (NOTIFY_ENABLED=false)",
                    lead.getId());
                return;
            }
            if (!smtpConfigured()) {
                logger.warn(
                    "New-lead notification skipped for leadId={}: SMTP_HOST is not set",
                    lead.getId());
                return;
            }
            JavaMailSender sender = mailSenders.getIfAvailable();
            if (sender == null) {
                logger.warn(
                    "New-lead notification skipped for leadId={}: mail sender is unavailable",
                    lead.getId());
                return;
            }
            List<String> addresses = alertAddresses();
            if (addresses.isEmpty()) {
                return;
            }
            int sent = 0;
            for (String address : addresses) {
                try {
                    sender.send(messageFor(lead, address));
                    sent += 1;
                } catch (Exception ex) {
                    // Never log the address itself; one bad inbox must not stop the rest.
                    logger.error(
                        "Lead notification to one recipient failed for leadId={} ({})",
                        lead.getId(),
                        ex.getClass().getSimpleName());
                }
            }
            logger.info(
                "Sent new-lead notification for leadId={} to {} of {} recipients",
                lead.getId(),
                sent,
                addresses.size());
        } catch (Exception ex) {
            // Never log phone/email; exception messages may contain addresses.
            logger.error(
                "Lead notification failed for leadId={} ({})",
                lead.getId(),
                ex.getClass().getSimpleName());
        }
    }

    /** Synchronous check used by the admin desk's "Send test email" button. */
    public TestResult sendTestEmail() {
        if (!enabled) {
            return new TestResult(0, "Email sending is switched off on the server.");
        }
        if (!smtpConfigured()) {
            return new TestResult(0, "Mail server details are not configured yet.");
        }
        JavaMailSender sender = mailSenders.getIfAvailable();
        if (sender == null) {
            return new TestResult(0, "The mail sender is not available.");
        }
        List<String> addresses = alertAddresses();
        if (addresses.isEmpty()) {
            return new TestResult(0, "Add at least one recipient first.");
        }
        int sent = 0;
        String failure = null;
        for (String address : addresses) {
            try {
                sender.send(testMessage(address));
                sent += 1;
            } catch (Exception ex) {
                failure = describeFailure(ex);
                logger.error(
                    "Test notification to one recipient failed ({})",
                    ex.getClass().getSimpleName());
            }
        }
        if (sent == 0) {
            return new TestResult(0, failure == null
                ? "The mail server did not accept the test email."
                : "The mail server did not accept the test email: " + failure);
        }
        return new TestResult(sent, "Test email sent to " + sent + (sent == 1 ? " address." : " addresses."));
    }

    /** Active desk recipients plus the NOTIFY_TO fallback, de-duplicated by address. */
    private List<String> alertAddresses() {
        Map<String, String> unique = new LinkedHashMap<>();
        if (fallbackRecipient != null) {
            unique.putIfAbsent(fallbackRecipient.toLowerCase(Locale.ROOT), fallbackRecipient);
        }
        for (NotificationRecipient recipient : recipients.findByActiveTrueOrderByIdAsc()) {
            String email = recipient.getEmail();
            if (!isBlank(email)) {
                unique.putIfAbsent(email.trim().toLowerCase(Locale.ROOT), email.trim());
            }
        }
        return new ArrayList<>(unique.values());
    }

    /**
     * Plain-language reason for the desk, so a non-technical owner knows what to fix.
     * Never includes the SMTP password; the provider's own wording is capped in length.
     */
    private static String describeFailure(Exception ex) {
        if (ex instanceof MailAuthenticationException) {
            return "the mail server rejected the login — check SMTP_USERNAME and SMTP_PASSWORD (or app password).";
        }
        Throwable cause = ex instanceof MailException mail ? mail.getMostSpecificCause() : ex;
        String detail = cause.getMessage();
        if (detail == null || detail.isBlank()) {
            return "the mail server gave no detail.";
        }
        detail = detail.replaceAll("\\s+", " ").trim();
        return detail.length() > 160 ? detail.substring(0, 157) + "..." : detail;
    }

    private SimpleMailMessage messageFor(Lead lead, String address) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null) {
            message.setFrom(from);
        }
        message.setTo(address);
        if (!isBlank(lead.getEmail())) {
            message.setReplyTo(lead.getEmail().trim());
        }
        message.setSubject("New solar enquiry — " + lead.getFullName());
        message.setText(buildBody(lead));
        return message;
    }

    private SimpleMailMessage testMessage(String address) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null) {
            message.setFrom(from);
        }
        message.setTo(address);
        message.setSubject("Test email — DSP enquiry alerts");
        message.setText("""
            This is a test message from the DSP Power Infra enquiry desk.

            If you received it, this inbox is set up to receive an alert for every new enquiry.

            You can change recipients in the enquiry desk under "Email recipients".
            """);
        return message;
    }

    private String buildBody(Lead lead) {
        return "New solar enquiry received.\n\n"
            + "Name: " + lead.getFullName() + "\n"
            + "Phone: " + lead.getPhone() + "\n"
            + (isBlank(lead.getEmail()) ? "" : "Email: " + lead.getEmail() + "\n")
            + "City: " + lead.getCity() + "\n"
            + "Pincode: " + lead.getPincode() + "\n"
            + "Monthly bill: " + (lead.getMonthlyBill() == null ? "not provided" : "Rs " + lead.getMonthlyBill()) + "\n"
            + "Source: " + lead.getSource() + "\n\n"
            + "Lead ID: " + lead.getId() + "\n"
            + "Open the enquiry desk to see full details and notes.\n";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record TestResult(int sent, String message) {
    }
}
