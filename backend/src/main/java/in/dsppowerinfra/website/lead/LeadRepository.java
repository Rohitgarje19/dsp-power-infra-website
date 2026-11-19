package in.dsppowerinfra.website.lead;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findAllByOrderByCreatedAtDesc();

    long deleteAllByDeletedTrueAndDeletedAtBefore(Instant cutoff);
}