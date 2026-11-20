package in.dsppowerinfra.website.lead;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface LeadRepository extends JpaRepository<Lead, Long>, JpaSpecificationExecutor<Lead> {

    List<Lead> findAllByOrderByCreatedAtDesc();

    long countByDeletedFalseAndResolvedAtIsNull();

    long countByDeletedFalseAndResolvedAtIsNotNull();

    long countByDeletedTrue();

    @Query("select distinct l.source from Lead l order by l.source")
    List<String> findDistinctSources();

    long deleteAllByDeletedTrueAndDeletedAtBefore(Instant cutoff);
}
