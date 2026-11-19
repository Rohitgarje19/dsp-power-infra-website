package in.dsppowerinfra.website.lead;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class DeletedLeadCleanupTests {

    @Autowired
    private DeletedLeadCleanup cleanup;

    @Autowired
    private LeadRepository leads;

    private Lead seed(String name) {
        return leads.save(new Lead(
            name, "9876543210", null, "residential", "Pune", "411046",
            2500, "cleanup test", "website"));
    }

    private Lead seedDeletedDaysAgo(String name, long days) {
        Lead lead = seed(name);
        lead.moveToDeleted();
        ReflectionTestUtils.setField(lead, "deletedAt", Instant.now().minus(Duration.ofDays(days)));
        return leads.save(lead);
    }

    @Test
    void purgesOnlyLeadsDeletedMoreThan15DaysAgo() {
        Lead expired = seedDeletedDaysAgo("Expired Enquiry", 16);
        Lead recent = seedDeletedDaysAgo("Recent Enquiry", 14);
        Lead active = seed("Active Enquiry");

        cleanup.permanentlyDeleteExpiredLeads();

        assertThat(leads.findById(expired.getId())).isEmpty();
        assertThat(leads.findById(recent.getId())).isPresent();
        assertThat(leads.findById(active.getId())).isPresent();
        assertThat(leads.findById(active.getId()).orElseThrow().isDeleted()).isFalse();
    }
}