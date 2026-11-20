package in.dsppowerinfra.website.notify;

import in.dsppowerinfra.website.lead.Lead;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends an HTML enquiry alert (with a plain-text twin) when a new lead is saved.
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
    private final String siteUrl;

    public LeadNotificationService(
        ObjectProvider<JavaMailSender> mailSenders,
        NotificationRecipientRepository recipients,
        @Value("${app.notify.enabled:false}") boolean enabled,
        @Value("${app.notify.to:}") String to,
        @Value("${spring.mail.host:}") String mailHost,
        @Value("${app.notify.from:}") String from,
        @Value("${spring.mail.username:}") String mailUsername,
        @Value("${app.site.url:}") String siteUrl
    ) {
        this.mailSenders = mailSenders;
        this.recipients = recipients;
        this.enabled = enabled;
        this.fallbackRecipient = isBlank(to) ? null : to.trim();
        this.mailHost = mailHost;
        this.from = !isBlank(from) ? from.trim() : (isBlank(mailUsername) ? null : mailUsername.trim());
        this.siteUrl = isBlank(siteUrl) ? null : siteUrl.trim();
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
                    sender.send(messageFor(sender, lead, address));
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
        List<String> addresses;
        try {
            addresses = alertAddresses();
        } catch (Exception ex) {
            // The desk button should explain the outage, not show a server error.
            logger.error(
                "Could not read notification recipients for a test email ({})",
                ex.getClass().getSimpleName());
            return new TestResult(0, "Could not read the recipient list right now. Please try again in a moment.");
        }
        if (addresses.isEmpty()) {
            return new TestResult(0, "Add at least one recipient first.");
        }
        int sent = 0;
        String failure = null;
        for (String address : addresses) {
            try {
                sender.send(testMessage(sender, address));
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

    private MimeMessage messageFor(JavaMailSender sender, Lead lead, String address) throws MessagingException {
        EnquiryEmailTemplate.Enquiry enquiry = new EnquiryEmailTemplate.Enquiry(
            lead.getId(),
            lead.getFullName(),
            lead.getPhone(),
            lead.getEmail(),
            lead.getCity(),
            lead.getPincode(),
            lead.getMonthlyBill() == null ? null : String.valueOf(lead.getMonthlyBill()),
            lead.getSource(),
            lead.getCreatedAt(),
            siteUrl);
        return envelope(
            sender,
            address,
            EnquiryEmailTemplate.subject(enquiry),
            EnquiryEmailTemplate.plainText(enquiry),
            EnquiryEmailTemplate.html(enquiry),
            isBlank(lead.getEmail()) ? null : lead.getEmail().trim());
    }

    private MimeMessage testMessage(JavaMailSender sender, String address) throws MessagingException {
        return envelope(
            sender,
            address,
            "Test email — DSP enquiry alerts",
            EnquiryEmailTemplate.testPlainText(siteUrl),
            EnquiryEmailTemplate.testHtml(siteUrl),
            null);
    }

    /** Multipart/alternative: HTML for modern clients, identical plain text for the rest. */
    private MimeMessage envelope(
        JavaMailSender sender,
        String to,
        String subject,
        String text,
        String html,
        String replyTo
    ) throws MessagingException {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        if (from != null) {
            try {
                helper.setFrom(from, "DSP Power Infra");
            } catch (java.io.UnsupportedEncodingException ex) {
                helper.setFrom(from);
            }
        }
        helper.setTo(to);
        if (replyTo != null) {
            helper.setReplyTo(replyTo);
        }
        helper.setSubject(subject);
        helper.setText(text, html);
        return message;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record TestResult(int sent, String message) {
    }
}
