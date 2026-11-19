package in.dsppowerinfra.website.notify;

import in.dsppowerinfra.website.lead.Lead;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends a plain-text notification email when a new lead is saved.
 * Default OFF. Entirely fail-safe: any problem here is logged (leadId only,
 * never personal contact data) and never propagates to lead creation.
 */
@Service
public class LeadNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(LeadNotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenders;
    private final boolean enabled;
    private final String to;
    private final String mailHost;

    public LeadNotificationService(
        ObjectProvider<JavaMailSender> mailSenders,
        @Value("${app.notify.enabled:false}") boolean enabled,
        @Value("${app.notify.to:}") String to,
        @Value("${spring.mail.host:}") String mailHost
    ) {
        this.mailSenders = mailSenders;
        this.enabled = enabled;
        this.to = to;
        this.mailHost = mailHost;
    }

    @Async("notifyExecutor")
    public void notifyNewLead(Lead lead) {
        try {
            if (!enabled || isBlank(mailHost) || isBlank(to)) {
                return;
            }
            JavaMailSender sender = mailSenders.getIfAvailable();
            if (sender == null) {
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("New solar enquiry — " + lead.getFullName());
            message.setText(buildBody(lead));
            sender.send(message);
            logger.info("Sent new-lead notification for leadId={}", lead.getId());
        } catch (Exception ex) {
            // Never log phone/email; exception messages may contain addresses.
            logger.error(
                "Lead notification failed for leadId={} ({})",
                lead.getId(),
                ex.getClass().getSimpleName()
            );
        }
    }

    private String buildBody(Lead lead) {
        return "New solar enquiry received.\n\n"
            + "Name: " + lead.getFullName() + "\n"
            + "Phone: " + lead.getPhone() + "\n"
            + "City: " + lead.getCity() + "\n"
            + "Pincode: " + lead.getPincode() + "\n"
            + "Monthly bill: " + (lead.getMonthlyBill() == null ? "not provided" : "Rs " + lead.getMonthlyBill()) + "\n"
            + "Source: " + lead.getSource() + "\n\n"
            + "Lead ID: " + lead.getId() + "\n";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}