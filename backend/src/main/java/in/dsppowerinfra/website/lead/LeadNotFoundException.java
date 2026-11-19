package in.dsppowerinfra.website.lead;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class LeadNotFoundException extends RuntimeException {

    public LeadNotFoundException(Long id) {
        super("Enquiry not found: " + id);
    }
}
