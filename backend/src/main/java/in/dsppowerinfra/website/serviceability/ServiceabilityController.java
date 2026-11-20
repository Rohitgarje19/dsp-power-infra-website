package in.dsppowerinfra.website.serviceability;

import in.dsppowerinfra.website.shared.ApiValidationException;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ServiceabilityController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceabilityController.class);
    /** Guard against a typo like "1-999999999" exhausting memory at startup. */
    private static final long MAX_RANGE_SIZE = 10_000;

    private final List<String> prefixes;
    private final List<String> excludedPrefixes;
    private final PincodeDirectory directory;

    public ServiceabilityController(
        @Value("${app.serviceability.prefixes:400-445}") String prefixesProperty,
        @Value("${app.serviceability.excluded-prefixes:403}") String excludedProperty,
        PincodeDirectory directory
    ) {
        this.prefixes = expand(prefixesProperty);
        this.excludedPrefixes = expand(excludedProperty);
        this.directory = directory;
    }

    /**
     * Accepts a comma-separated list of prefixes and inclusive ranges ("400-445").
     * Malformed entries are skipped with a warning so a bad environment variable
     * cannot stop the application from booting; the remaining entries still work.
     */
    private static List<String> expand(String property) {
        List<String> result = new ArrayList<>();
        if (property == null || property.isBlank()) {
            return List.of();
        }
        for (String token : property.split(",")) {
            String entry = token.trim();
            if (entry.isEmpty()) {
                continue;
            }
            int dash = entry.indexOf('-');
            if (dash <= 0) {
                result.add(entry);
                continue;
            }
            try {
                int from = Integer.parseInt(entry.substring(0, dash).trim());
                int to = Integer.parseInt(entry.substring(dash + 1).trim());
                if (from > to) {
                    logger.warn("Ignoring reversed serviceability range '{}'.", entry);
                    continue;
                }
                if ((long) to - from >= MAX_RANGE_SIZE) {
                    logger.warn("Ignoring oversized serviceability range '{}'.", entry);
                    continue;
                }
                for (int prefix = from; prefix <= to; prefix++) {
                    result.add(String.valueOf(prefix));
                }
            } catch (NumberFormatException ex) {
                logger.warn("Ignoring malformed serviceability range '{}'.", entry);
            }
        }
        return List.copyOf(result);
    }

    @GetMapping("/api/serviceability/{pincode}")
    public ServiceabilityResponse check(@PathVariable String pincode) {
        if (pincode == null || !pincode.matches("[0-9]{6}")) {
            throw new ApiValidationException("pincode", "must be a 6-digit pincode");
        }
        boolean serviceable = prefixes.stream().anyMatch(pincode::startsWith)
            && excludedPrefixes.stream().noneMatch(pincode::startsWith);
        // Directory lookup is best-effort; it never blocks a valid response.
        var info = directory.lookup(pincode);
        return new ServiceabilityResponse(
            pincode,
            serviceable,
            serviceable ? "Maharashtra" : null,
            info.map(PincodeDirectory.PincodeInfo::city).orElse(null),
            info.map(PincodeDirectory.PincodeInfo::state).orElse(null)
        );
    }

    public record ServiceabilityResponse(
        String pincode,
        boolean serviceable,
        String area,
        String city,
        String state
    ) {
    }
}