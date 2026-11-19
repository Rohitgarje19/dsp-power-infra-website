package in.dsppowerinfra.website.lead;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    private final LeadRepository leads;

    public LeadController(LeadRepository leads) {
        this.leads = leads;
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
            request.source()
        );
        return leads.save(lead);
    }

    @GetMapping("/admin/leads")
    public List<Lead> list() {
        return leads.findAllByOrderByCreatedAtDesc();
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

    public record Health(String status) {
    }
}
