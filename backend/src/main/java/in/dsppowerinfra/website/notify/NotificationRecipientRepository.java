package in.dsppowerinfra.website.notify;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {

    List<NotificationRecipient> findAllByOrderByIdAsc();

    List<NotificationRecipient> findByActiveTrueOrderByIdAsc();

    boolean existsByEmailIgnoreCase(String email);
}
