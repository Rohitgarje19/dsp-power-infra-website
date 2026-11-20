package in.dsppowerinfra.website.serviceability;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Resolves an Indian PIN code to its postal district and state using the India
 * Post PIN directory. Results are cached in memory for a week and any failure
 * (offline, timeout, unknown PIN) degrades to an empty result, so the enquiry
 * flow never depends on this lookup.
 */
@Component
public class PincodeDirectory {

    public record PincodeInfo(String city, String state) {
    }

    private static final Logger log = LoggerFactory.getLogger(PincodeDirectory.class);
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final int MAX_CACHE_ENTRIES = 20_000;
    private static final Duration POSITIVE_TTL = Duration.ofDays(7);
    private static final Duration NEGATIVE_TTL = Duration.ofHours(1);

    private final String lookupUrlTemplate;
    private final HttpClient http;
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    public PincodeDirectory(
        @Value("${app.pincode.lookup-url:https://api.postalpincode.in/pincode/%s}") String lookupUrlTemplate
    ) {
        this.lookupUrlTemplate = lookupUrlTemplate;
        // The India Post API resets HTTP/2 streams ("RST_STREAM"), so stay on 1.1.
        this.http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(2))
            .build();
    }

    public Optional<PincodeInfo> lookup(String pincode) {
        if (pincode == null || lookupUrlTemplate == null || lookupUrlTemplate.isBlank()) {
            return Optional.empty();
        }
        // Best-effort by contract: cache bookkeeping or a malformed lookup URL
        // must never turn a valid serviceability answer into a 500.
        try {
            Cached cached = cache.get(pincode);
            if (cached != null && cached.expiresAt().isAfter(Instant.now())) {
                return cached.info();
            }
            Optional<PincodeInfo> info = fetch(pincode);
            if (cache.size() >= MAX_CACHE_ENTRIES) {
                cache.clear();
            }
            Duration ttl = info.isPresent() ? POSITIVE_TTL : NEGATIVE_TTL;
            cache.put(pincode, new Cached(info, Instant.now().plus(ttl)));
            return info;
        } catch (RuntimeException e) {
            log.warn("PIN lookup skipped for {}: {}", pincode, e.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    private Optional<PincodeInfo> fetch(String pincode) {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(lookupUrlTemplate.formatted(pincode)))
                .timeout(Duration.ofSeconds(4))
                .header("Accept", "application/json")
                // The postal API drops requests carrying Java's default UA.
                .header("User-Agent", "DspPowerInfraWebsite/1.0")
                .GET()
                .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return Optional.empty();
            }
            return parse(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } catch (java.io.IOException e) {
            log.warn("PIN lookup failed for {}: {}", pincode, e.getMessage());
            return Optional.empty();
        } catch (RuntimeException e) {
            log.warn("PIN lookup failed for {}: {}", pincode, e.getMessage());
            return Optional.empty();
        }
    }

    static Optional<PincodeInfo> parse(String json) {
        try {
            JsonNode root = JSON.readTree(json);
            if (!root.isArray() || root.isEmpty()) {
                return Optional.empty();
            }
            JsonNode first = root.get(0);
            if (!"Success".equals(first.path("Status").asText())) {
                return Optional.empty();
            }
            JsonNode offices = first.path("PostOffice");
            if (!offices.isArray()) {
                return Optional.empty();
            }
            for (JsonNode office : offices) {
                String city = text(office, "District");
                if (city != null) {
                    return Optional.of(new PincodeInfo(city, text(office, "State")));
                }
            }
            return Optional.empty();
        } catch (RuntimeException e) {
            log.warn("Unparseable PIN lookup response: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private static String text(JsonNode node, String field) {
        String value = node.path(field).asText("").trim();
        return value.isEmpty() || "NA".equalsIgnoreCase(value) ? null : value;
    }

    private record Cached(Optional<PincodeInfo> info, Instant expiresAt) {
    }
}
