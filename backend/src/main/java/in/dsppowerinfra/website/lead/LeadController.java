package in.dsppowerinfra.website.lead;

import in.dsppowerinfra.website.notify.LeadNotificationService;
import in.dsppowerinfra.website.shared.ApiValidationException;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LeadController {

    private static final Logger logger = LoggerFactory.getLogger(LeadController.class);

    private static final String CSV_HEADER =
        "id,createdAt,fullName,phone,email,customerType,city,pincode,monthlyBill,message,"
            + "source,sourcePage,utmSource,utmMedium,utmCampaign,status,resolvedAt,deleted,deletedAt,notes";

    /** Admin-facing days are India days, regardless of where the API runs. */
    private static final ZoneId ADMIN_ZONE = ZoneId.of("Asia/Kolkata");

    private static final Set<String> STATUSES = Set.of("all", "active", "resolved", "deleted");
    private static final Set<String> BULK_ACTIONS = Set.of("resolve", "restore", "delete", "purge");
    private static final Sort NEWEST_FIRST =
        Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));

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

    /**
     * Server-side list: status tab, free-text search, source and date filters,
     * plus offset paging. Tab counts are global so the desk can show totals
     * even while a search narrows the visible rows.
     */
    @GetMapping("/admin/leads")
    public LeadPage list(
        @RequestParam(defaultValue = "all") String status,
        @RequestParam(defaultValue = "") String q,
        @RequestParam(defaultValue = "") String source,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        String normalizedStatus = normalizeStatus(status);
        LocalDate fromDate = parseDate(from, "from");
        LocalDate toDate = parseDate(to, "to");
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new ApiValidationException("to", "must be on or after the start date");
        }
        int safePage = Math.max(1, page);
        int safeSize = Math.min(200, Math.max(1, size));

        Page<Lead> result = leads.findAll(
            filterSpec(normalizedStatus, q, source, fromDate, toDate),
            PageRequest.of(safePage - 1, safeSize, NEWEST_FIRST));

        return new LeadPage(
            result.getContent(),
            result.getTotalElements(),
            safePage,
            safeSize,
            new Counts(
                leads.countByDeletedFalseAndResolvedAtIsNull(),
                leads.countByDeletedFalseAndResolvedAtIsNotNull(),
                leads.countByDeletedTrue()),
            leads.findDistinctSources());
    }

    @PatchMapping("/admin/leads/{id}/notes")
    public Lead updateNotes(@PathVariable Long id, @Valid @RequestBody NotesRequest request) {
        Lead lead = findLead(id);
        lead.setNotes(request.notes());
        return leads.save(lead);
    }

    /** Exports the same filtered view (minus paging) as the desk is showing. */
    @GetMapping(value = "/admin/leads/export.csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
        @RequestParam(defaultValue = "all") String status,
        @RequestParam(defaultValue = "") String q,
        @RequestParam(defaultValue = "") String source,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to
    ) {
        Specification<Lead> spec = filterSpec(
            normalizeStatus(status),
            q,
            source,
            parseDate(from, "from"),
            parseDate(to, "to"));

        StringBuilder csv = new StringBuilder(CSV_HEADER).append('\n');
        for (Lead lead : leads.findAll(spec, NEWEST_FIRST)) {
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

    /** Applies one lifecycle action to many selected enquiries. */
    @PostMapping("/admin/leads/bulk")
    public BulkResponse bulk(@Valid @RequestBody BulkRequest request) {
        String action = request.action().trim().toLowerCase();
        if (!BULK_ACTIONS.contains(action)) {
            throw new ApiValidationException("action", "must be one of resolve, restore, delete, purge");
        }
        List<Lead> found = leads.findAllById(request.ids());
        for (Lead lead : found) {
            switch (action) {
                case "resolve" -> lead.resolve();
                case "restore" -> lead.restore();
                case "delete" -> lead.moveToDeleted();
                default -> { /* purge is a hard delete below */ }
            }
        }
        if ("purge".equals(action)) {
            leads.deleteAll(found);
        } else {
            leads.saveAll(found);
        }
        return new BulkResponse(found.size());
    }

    private Lead findLead(Long id) {
        return leads.findById(id)
            .orElseThrow(() -> new LeadNotFoundException(id));
    }

    private static String normalizeStatus(String status) {
        String normalized = status == null ? "all" : status.trim().toLowerCase();
        if (!STATUSES.contains(normalized)) {
            throw new ApiValidationException("status", "must be one of all, active, resolved, deleted");
        }
        return normalized;
    }

    private static LocalDate parseDate(String value, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new ApiValidationException(field, "must be a date in YYYY-MM-DD format");
        }
    }

    private static Specification<Lead> filterSpec(
        String status, String q, String source, LocalDate from, LocalDate to
    ) {
        String needle = q == null ? "" : q.trim().toLowerCase();
        String sourceFilter = source == null ? "" : source.trim();

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            switch (status) {
                case "active" -> {
                    predicates.add(cb.isFalse(root.get("deleted")));
                    predicates.add(cb.isNull(root.get("resolvedAt")));
                }
                case "resolved" -> {
                    predicates.add(cb.isFalse(root.get("deleted")));
                    predicates.add(cb.isNotNull(root.get("resolvedAt")));
                }
                case "deleted" -> predicates.add(cb.isTrue(root.get("deleted")));
                default -> { /* all */ }
            }

            if (!needle.isEmpty()) {
                String pattern = "%" + needle + "%";
                List<String> searchable = List.of(
                    "fullName", "phone", "email", "city", "pincode",
                    "customerType", "message", "source", "sourcePage", "utmCampaign");
                predicates.add(cb.or(searchable.stream()
                    .map(field -> cb.like(cb.lower(cb.coalesce(root.<String>get(field), "")), pattern))
                    .toArray(Predicate[]::new)));
            }
            if (!sourceFilter.isEmpty()) {
                predicates.add(cb.equal(root.get("source"), sourceFilter));
            }
            if (from != null) {
                Instant start = from.atStartOfDay(ADMIN_ZONE).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (to != null) {
                Instant endExclusive = to.plusDays(1).atStartOfDay(ADMIN_ZONE).toInstant();
                predicates.add(cb.lessThan(root.get("createdAt"), endExclusive));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
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

    public record Counts(long active, long resolved, long deleted) {
    }

    public record LeadPage(
        List<Lead> items,
        long total,
        int page,
        int size,
        Counts counts,
        List<String> sources
    ) {
    }

    public record BulkRequest(
        @NotEmpty(message = "ids must contain at least one lead") @Size(max = 500) List<Long> ids,
        @NotBlank(message = "action is required") String action
    ) {
    }

    public record BulkResponse(int updated) {
    }
}
