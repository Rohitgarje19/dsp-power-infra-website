package in.dsppowerinfra.website.lead;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LeadApiTests {

    private static final String ADMIN = "testadmin";
    private static final String PASSWORD = "test-password-123";
    private static final AtomicInteger IP_COUNTER = new AtomicInteger();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private LeadRepository leads;

    // ---------- helpers ----------

    /** Unique IP per call so the shared rate limiter never leaks across tests. */
    private static String freshIp() {
        int n = IP_COUNTER.incrementAndGet();
        return "10.77." + (n / 250) + "." + (n % 250 + 1);
    }

    private static Map<String, Object> validLead() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("fullName", "Ganesh Patil");
        body.put("phone", "9876543210");
        body.put("email", "ganesh@example.com");
        body.put("customerType", "residential");
        body.put("city", "Pune");
        body.put("pincode", "411046");
        body.put("monthlyBill", 2500);
        body.put("message", "Interested in rooftop solar");
        body.put("source", "website");
        body.put("sourcePage", "/contact");
        body.put("utmSource", "google");
        body.put("utmMedium", "cpc");
        body.put("utmCampaign", "rooftop-2026");
        return body;
    }

    private static String toJson(Map<String, Object> body) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append('"').append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value == null) {
                json.append("null");
            } else if (value instanceof Number || value instanceof Boolean) {
                json.append(value);
            } else {
                json.append('"').append(escape(String.valueOf(value))).append('"');
            }
        }
        return json.append('}').toString();
    }

    private static String escape(String text) {
        return text.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder postLead(
        Map<String, Object> body, String ip
    ) {
        return post("/api/leads")
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(body))
            .with(request -> {
                request.setRemoteAddr(ip);
                return request;
            });
    }

    private long createLeadAndGetId(Map<String, Object> body) throws Exception {
        MvcResult result = mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated())
            .andReturn();
        String content = result.getResponse().getContentAsString();
        int start = content.indexOf("\"id\":") + 5;
        int end = content.indexOf(',', start);
        if (end < 0) {
            end = content.indexOf('}', start);
        }
        return Long.parseLong(content.substring(start, end).trim());
    }

    // ---------- public lead creation ----------

    @Test
    void validLeadIsPersistedWithSourceAndUtmFields() throws Exception {
        mvc.perform(postLead(validLead(), freshIp()))
            .andExpect(status().isCreated())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.status").value("NEW_ENQUIRY"))
            .andExpect(jsonPath("$.createdAt", notNullValue()));

        Lead saved = leads.findAll().get(0);
        assertThat(saved.getFullName()).isEqualTo("Ganesh Patil");
        assertThat(saved.getSourcePage()).isEqualTo("/contact");
        assertThat(saved.getUtmSource()).isEqualTo("google");
        assertThat(saved.getUtmMedium()).isEqualTo("cpc");
        assertThat(saved.getUtmCampaign()).isEqualTo("rooftop-2026");
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void blankFullNameIsRejectedWithTypedValidationError() throws Exception {
        Map<String, Object> body = validLead();
        body.put("fullName", "  ");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.message").value("Validation failed"))
            .andExpect(jsonPath("$.errors[*].field", hasItem("fullName")))
            .andExpect(jsonPath("$.requestId", notNullValue()));
    }

    @Test
    void badPhoneIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("phone", "not-a-phone");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[*].field", hasItem("phone")));
    }

    @Test
    void badPincodeIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("pincode", "41104");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[*].field", hasItem("pincode")));
    }

    @Test
    void badEmailIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("email", "not-an-email");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[*].field", hasItem("email")));
    }

    @Test
    void optionalFieldsMayBeOmitted() throws Exception {
        Map<String, Object> body = validLead();
        body.remove("email");
        body.remove("message");
        body.remove("monthlyBill");
        body.remove("sourcePage");
        body.remove("utmSource");
        body.remove("utmMedium");
        body.remove("utmCampaign");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value(nullValue()))
            .andExpect(jsonPath("$.message").value(nullValue()))
            .andExpect(jsonPath("$.monthlyBill").value(nullValue()));
    }

    @Test
    void fullNameOf100CharsIsAccepted() throws Exception {
        Map<String, Object> body = validLead();
        body.put("fullName", "a".repeat(100));
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated());
    }

    @Test
    void fullNameOf101CharsIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("fullName", "a".repeat(101));
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[*].field", hasItem("fullName")));
    }

    @Test
    void messageOf1200CharsIsAccepted() throws Exception {
        Map<String, Object> body = validLead();
        body.put("message", "m".repeat(1200));
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated());
    }

    @Test
    void messageOf1201CharsIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("message", "m".repeat(1201));
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[*].field", hasItem("message")));
    }

    @Test
    void negativeMonthlyBillIsRejected() throws Exception {
        Map<String, Object> body = validLead();
        body.put("monthlyBill", -1);
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.errors[*].field", hasItem("monthlyBill")));
    }

    @Test
    void zeroMonthlyBillIsAccepted() throws Exception {
        Map<String, Object> body = validLead();
        body.put("monthlyBill", 0);
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.monthlyBill").value(0));
    }

    @Test
    void honeypotWebsiteIsSilentlyDropped() throws Exception {
        long before = leads.count();
        Map<String, Object> body = validLead();
        body.put("website", "http://spam.example.com");
        mvc.perform(postLead(body, freshIp()))
            .andExpect(status().isCreated());
        assertThat(leads.count()).isEqualTo(before);
    }

    @Test
    void malformedJsonBodyReturns400TypedError() throws Exception {
        mvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{not json")
                .with(request -> {
                    request.setRemoteAddr(freshIp());
                    return request;
                }))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.requestId", notNullValue()));
    }

    // ---------- rate limiting ----------

    @Test
    void sixthRapidPostFromSameIpIsRateLimited() throws Exception {
        String ip = freshIp();
        for (int i = 0; i < 5; i++) {
            mvc.perform(postLead(validLead(), ip))
                .andExpect(status().isCreated());
        }
        mvc.perform(postLead(validLead(), ip))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
            .andExpect(jsonPath("$.message").value("Too many requests. Please wait a minute and try again."))
            .andExpect(jsonPath("$.requestId", notNullValue()));

        // A different client IP is unaffected.
        mvc.perform(postLead(validLead(), freshIp()))
            .andExpect(status().isCreated());
    }

    // ---------- admin auth + listing ----------

    @Test
    void adminListRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/admin/leads"))
            .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, "wrong-password")))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void adminListReturnsNewestFirst() throws Exception {
        long firstId = createLeadAndGetId(validLead());
        Map<String, Object> second = validLead();
        second.put("fullName", "Second Enquiry");
        long secondId = createLeadAndGetId(second);

        mvc.perform(get("/api/admin/leads").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(secondId))
            .andExpect(jsonPath("$[1].id").value(firstId));
    }

    // ---------- lifecycle ----------

    @Test
    void resolveRestoreDeleteAndPermanentDeleteLifecycle() throws Exception {
        long id = createLeadAndGetId(validLead());

        mvc.perform(put("/api/admin/leads/" + id + "/resolve").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RESOLVED"))
            .andExpect(jsonPath("$.resolvedAt", notNullValue()));
        assertThat(leads.findById(id).orElseThrow().getResolvedAt()).isNotNull();

        mvc.perform(put("/api/admin/leads/" + id + "/restore").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("NEW_ENQUIRY"))
            .andExpect(jsonPath("$.resolvedAt").value(nullValue()));
        assertThat(leads.findById(id).orElseThrow().getResolvedAt()).isNull();

        mvc.perform(put("/api/admin/leads/" + id + "/delete").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.deleted").value(true))
            .andExpect(jsonPath("$.deletedAt", notNullValue()));

        mvc.perform(put("/api/admin/leads/" + id + "/restore").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.deleted").value(false))
            .andExpect(jsonPath("$.deletedAt").value(nullValue()));

        mvc.perform(delete("/api/admin/leads/" + id).with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isNoContent());
        assertThat(leads.findById(id)).isEmpty();

        mvc.perform(put("/api/admin/leads/" + id + "/resolve").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"))
            .andExpect(jsonPath("$.requestId", notNullValue()));
    }

    @Test
    void resolveMissingLeadReturnsTyped404() throws Exception {
        mvc.perform(put("/api/admin/leads/999999/resolve").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"))
            .andExpect(jsonPath("$.message", notNullValue()))
            .andExpect(jsonPath("$.requestId", notNullValue()));
    }

    // ---------- notes ----------

    @Test
    void patchNotesPersistsAndReturnsUpdatedLead() throws Exception {
        long id = createLeadAndGetId(validLead());
        Map<String, Object> notes = new LinkedHashMap<>();
        notes.put("notes", "Call after 6pm. Interested in 5kW hybrid system.");

        mvc.perform(patch("/api/admin/leads/" + id + "/notes")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(notes)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.notes").value("Call after 6pm. Interested in 5kW hybrid system."));

        assertThat(leads.findById(id).orElseThrow().getNotes())
            .isEqualTo("Call after 6pm. Interested in 5kW hybrid system.");
    }

    @Test
    void notesLongerThan2000CharsAreRejected() throws Exception {
        long id = createLeadAndGetId(validLead());
        Map<String, Object> notes = new LinkedHashMap<>();
        notes.put("notes", "n".repeat(2001));

        mvc.perform(patch("/api/admin/leads/" + id + "/notes")
                .with(httpBasic(ADMIN, PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(notes)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[*].field", hasItem("notes")));
    }

    @Test
    void patchNotesRequiresAdmin() throws Exception {
        mvc.perform(patch("/api/admin/leads/1/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"notes\":\"x\"}"))
            .andExpect(status().isUnauthorized());
    }

    // ---------- CSV export ----------

    @Test
    void csvExportContainsHeaderAndProperlyEscapedFields() throws Exception {
        Map<String, Object> body = validLead();
        body.put("message", "Hello, \"solar\" world\nsecond line");
        createLeadAndGetId(body);

        String csv = mvc.perform(get("/api/admin/leads/export.csv").with(httpBasic(ADMIN, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("text/csv"))
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"dsp-leads.csv\""))
            .andReturn()
            .getResponse()
            .getContentAsString();

        String[] lines = csv.split("\n", 2);
        assertThat(lines[0]).isEqualTo(
            "id,createdAt,fullName,phone,email,customerType,city,pincode,monthlyBill,message,"
                + "source,sourcePage,utmSource,utmMedium,utmCampaign,status,resolvedAt,deleted,deletedAt,notes");
        assertThat(csv).contains("\"Hello, \"\"solar\"\" world\nsecond line\"");
    }

    @Test
    void csvExportRequiresAdmin() throws Exception {
        mvc.perform(get("/api/admin/leads/export.csv"))
            .andExpect(status().isUnauthorized());
    }

    // ---------- serviceability ----------

    @Test
    void serviceablePincodeReturnsPuneRegion() throws Exception {
        mvc.perform(get("/api/serviceability/411046"))
            .andExpect(status().isOk())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.pincode").value("411046"))
            .andExpect(jsonPath("$.serviceable").value(true))
            .andExpect(jsonPath("$.area").value("Pune region"));
    }

    @Test
    void unserviceablePincodeReturnsFalseWithNullArea() throws Exception {
        mvc.perform(get("/api/serviceability/999999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.serviceable").value(false))
            .andExpect(jsonPath("$.area").value(nullValue()));
    }

    @Test
    void invalidPincodePathVariableReturns422() throws Exception {
        mvc.perform(get("/api/serviceability/12345"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[*].field", hasItem("pincode")))
            .andExpect(jsonPath("$.requestId", notNullValue()));
    }

    // ---------- health ----------

    @Test
    void healthEndpointIsPublic() throws Exception {
        mvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.status").value("ok"));
    }
}