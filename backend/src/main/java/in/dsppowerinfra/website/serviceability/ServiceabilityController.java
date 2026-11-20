package in.dsppowerinfra.website.serviceability;

import in.dsppowerinfra.website.shared.ApiValidationException;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ServiceabilityController {

    private final List<String> prefixes;
    private final PincodeDirectory directory;

    public ServiceabilityController(
        @Value("${app.serviceability.prefixes:411,412}") String prefixesProperty,
        PincodeDirectory directory
    ) {
        this.prefixes = Arrays.stream(prefixesProperty.split(","))
            .map(String::trim)
            .filter(prefix -> !prefix.isEmpty())
            .toList();
        this.directory = directory;
    }

    @GetMapping("/api/serviceability/{pincode}")
    public ServiceabilityResponse check(@PathVariable String pincode) {
        if (pincode == null || !pincode.matches("[0-9]{6}")) {
            throw new ApiValidationException("pincode", "must be a 6-digit pincode");
        }
        boolean serviceable = prefixes.stream().anyMatch(pincode::startsWith);
        // Directory lookup is best-effort; it never blocks a valid response.
        var info = directory.lookup(pincode);
        return new ServiceabilityResponse(
            pincode,
            serviceable,
            serviceable ? "Pune region" : null,
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