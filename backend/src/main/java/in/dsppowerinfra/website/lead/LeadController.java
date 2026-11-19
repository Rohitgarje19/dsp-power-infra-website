package in.dsppowerinfra.website.lead;

import in.dsppowerinfra.website.notify.LeadNotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LeadController {

    private static final Logger logger = LoggerFactory.getLogger(LeadController.class);

    private static final String CSV_HEADER =
        "id,createdAt,fullName,phone,email,customerType,city,pincode,monthlyBill,message,"
            + "source,sourcePage,utmSource,utmMedium,utmCampaign,status,resolvedAt,deleted,deletedAt,notes";

    private final LeadRepository leads;
    private final LeadNotificationService notifications;

    public LeadController(LeadRepository leads, LeadNotificationService notifications) {
        this.leads = leads;
        this.notifications = notifications;
    }

    @GetMapping("/health")
    public Health health() {
        return new Health("ok");
    }

    @PostMapping("/leads")
    @ResponseStatus(HttpStatus.CREATED)
    public Lead create(@Valid @RequestBody LeadRequest request) {
        Lead lead = new Lead(
            request.fullName().trim(),
            request.phone().trim(),
            empty(request.email()),
            request.customerType().trim(),
            request.city().trim(),
            request.pincode().trim(),
            request.monthlyBill(),
            empty(request.message()),
            request.source(),
            empty(request.sourcePage()),
            empty(request.utmSource()),
            empty(request.utmMedium()),
            empty(request.utmCampaign())
        );

        // Honeypot: bots fill the hidden "website" field. Pretend success but
        // never persist (and never notify).
        if (request.website() != null && !request.website().isBlank()) {
            return lead;
        }

        Lead saved = leads.save(lead);
        try {
            notifications.notifyNewLead(saved);
        } catch (Exception ex) {
            // Notification dispatch must never break lead creation.
            logger.warn("Notification dispatch failed for leadId={}", saved.getId());
        }
        return saved;
    }

    @GetMapping("/admin/leads")
    public List<Lead> list() {
        return leads.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/admin/leads/{id}/notes")
    public Lead updateNotes(@PathVariable Long id, @Valid @RequestBody NotesRequest request) {
        Lead lead = findLead(id);
        lead.setNotes(request.notes());
        return leads.save(lead);
    }

    @GetMapping(value = "/admin/leads/export.csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv() {
        StringBuilder csv = new StringBuilder(CSV_HEADER).append('\n');
        for (Lead lead : leads.findAllByOrderByCreatedAtDesc()) {
            csv.append(csvField(lead.getId())).append(',')
                .append(csvField(lead.getCreatedAt())).append(',')
                .append(csvField(lead.getFullName())).append(',')
                .append(csvField(lead.getPhone())).append(',')
                .append(csvField(lead.getEmail())).append(',')
                .append(csvField(lead.getCustomerType())).append(',')
                .append(csvField(lead.getCity())).append(',')
                .append(csvField(lead.getPincode())).append(',')
                .append(csvField(lead.getMonthlyBill())).append(',')
                .append(csvField(lead.getMessage())).append(',')
                .append(csvField(lead.getSource())).append(',')
                .append(csvField(lead.getSourcePage())).append(',')
                .append(csvField(lead.getUtmSource())).append(',')
                .append(csvField(lead.getUtmMedium())).append(',')
                .append(csvField(lead.getUtmCampaign())).append(',')
                .append(csvField(lead.getStatus())).append(',')
                .append(csvField(lead.getResolvedAt())).append(',')
                .append(csvField(lead.isDeleted())).append(',')
                .append(csvField(lead.getDeletedAt())).append(',')
                .append(csvField(lead.getNotes())).append('\n');
        }
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dsp-leads.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv.toString());
    }

    @PutMapping("/admin/leads/{id}/resolve")
    public Lead resolve(@PathVariable Long id) {
        Lead lead = findLead(id);
        lead.resolve();
        return leads.save(lead);
    }

    @PutMapping("/admin/leads/{id}/restore")
    public Lead restore(@PathVariable Long id) {
        Lead lead = findLead(id);
        lead.restore();
        return leads.save(lead);
    }

    @PutMapping("/admin/leads/{id}/delete")
    public Lead moveToDeleted(@PathVariable Long id) {
        Lead lead = findLead(id);
        lead.moveToDeleted();
        return leads.save(lead);
    }

    @DeleteMapping("/admin/leads/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void permanentlyDelete(@PathVariable Long id) {
        leads.delete(findLead(id));
    }

    private Lead findLead(Long id) {
        return leads.findById(id)
            .orElseThrow(() -> new LeadNotFoundException(id));
    }

    private String empty(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    /** RFC-4180 style escaping: quote when needed, double internal quotes. */
    private static String csvField(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            return '"' + text.replace("\"", "\"\"") + '"';
        }
        return text;
    }

    public record Health(String status) {
    }

    public record NotesRequest(@Size(max = 2000) String notes) {
    }
}