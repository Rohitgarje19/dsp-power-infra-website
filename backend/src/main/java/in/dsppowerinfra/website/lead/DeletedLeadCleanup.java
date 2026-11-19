package in.dsppowerinfra.website.lead;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DeletedLeadCleanup {

    private static final Logger logger =
        LoggerFactory.getLogger(DeletedLeadCleanup.class);

    private final LeadRepository leads;

    public DeletedLeadCleanup(LeadRepository leads) {
        this.leads = leads;
    }

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void permanentlyDeleteExpiredLeads() {

        Instant cutoff = Instant.now().minus(Duration.ofDays(15));

        long deletedCount =
            leads.deleteAllByDeletedTrueAndDeletedAtBefore(cutoff);

        if (deletedCount > 0) {
            logger.info(
                "Automatically deleted {} expired enquiries.",
                deletedCount
            );
        }
    }
}