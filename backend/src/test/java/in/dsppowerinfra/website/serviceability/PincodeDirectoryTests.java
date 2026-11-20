package in.dsppowerinfra.website.serviceability;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class PincodeDirectoryTests {

    private static final String PUNE_JSON = """
        [{"Message":"Number of pincode(s) found:1","Status":"Success","PostOffice":[
        {"Name":"Katraj","District":"Pune","State":"Maharashtra","Block":"Pune City","Pincode":"411046"}]}]
        """;

    @Test
    void resolvesDistrictAndStateAndCachesTheResult() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/pincode/", exchange -> {
            calls.incrementAndGet();
            byte[] body = PUNE_JSON.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            PincodeDirectory directory = new PincodeDirectory(
                "http://127.0.0.1:" + server.getAddress().getPort() + "/pincode/%s"
            );
            Optional<PincodeDirectory.PincodeInfo> info = directory.lookup("411046");
            assertThat(info).isPresent();
            assertThat(info.get().city()).isEqualTo("Pune");
            assertThat(info.get().state()).isEqualTo("Maharashtra");
            assertThat(directory.lookup("411046")).isPresent();
            assertThat(calls).hasValue(1);
        } finally {
            server.stop(0);
        }
    }

    @Test
    void unknownPincodeReturnsEmpty() {
        assertThat(PincodeDirectory.parse("[{\"Status\":\"Error\",\"PostOffice\":null}]")).isEmpty();
    }

    @Test
    void malformedResponsesDegradeToEmpty() {
        assertThat(PincodeDirectory.parse("not json")).isEmpty();
        assertThat(PincodeDirectory.parse("[]")).isEmpty();
        assertThat(PincodeDirectory.parse("[{\"Status\":\"Success\",\"PostOffice\":[]}]")).isEmpty();
    }

    @Test
    void missingDistrictFallsBackToTheNextPostOffice() {
        String json = """
            [{"Status":"Success","PostOffice":[
            {"District":"NA","State":"Maharashtra"},
            {"District":"Mumbai","State":"Maharashtra"}]}]
            """;
        assertThat(PincodeDirectory.parse(json)).hasValueSatisfying(info -> {
            assertThat(info.city()).isEqualTo("Mumbai");
            assertThat(info.state()).isEqualTo("Maharashtra");
        });
    }

    @Test
    void blankLookupUrlDisablesTheDirectory() {
        PincodeDirectory directory = new PincodeDirectory("");
        assertThat(directory.lookup("411046")).isEmpty();
    }

    @Test
    void unreachableEndpointDegradesToEmpty() {
        PincodeDirectory directory = new PincodeDirectory("http://127.0.0.1:1/pincode/%s");
        assertThat(directory.lookup("411046")).isEmpty();
    }
}
