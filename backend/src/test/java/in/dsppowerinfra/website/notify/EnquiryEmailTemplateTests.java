package in.dsppowerinfra.website.notify;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

/** The alert email must be safe to render and usable on a phone. */
class EnquiryEmailTemplateTests {

    private static EnquiryEmailTemplate.Enquiry enquiry(String name, String email) {
        return new EnquiryEmailTemplate.Enquiry(
            42,
            name,
            "9876543210",
            email,
            "Pune",
            "411046",
            "2500",
            "contact",
            Instant.parse("2026-11-20T16:51:41Z"),
            "https://desk.example.test/");
    }

    @Test
    void escapesCustomerSuppliedMarkup() {
        String html = EnquiryEmailTemplate.html(enquiry("<b>Asha</b> & Sons \"Solar\"", "asha@example.com"));
        assertThat(html)
            .contains("&lt;b&gt;Asha&lt;/b&gt; &amp; Sons &quot;Solar&quot;")
            .doesNotContain("<b>Asha</b>");
    }

    @Test
    void includesContactActionsAndDeskButton() {
        String html = EnquiryEmailTemplate.html(enquiry("Asha Patil", "asha@example.com"));
        assertThat(html)
            .contains("DSP POWER INFRA")
            .contains("New enquiry")
            .contains("tel:+919876543210")
            .contains("mailto:asha@example.com")
            .contains("https://desk.example.test/admin")
            .contains("Hit Reply to answer Asha Patil directly");
    }

    @Test
    void fallsBackWhenEmailIsMissing() {
        String html = EnquiryEmailTemplate.html(enquiry("Asha Patil", null));
        assertThat(html)
            .contains("Not provided")
            .contains("Reply to this message or call the number above");
    }

    @Test
    void testEmailIsClearlyATestWithoutCustomerData() {
        String html = EnquiryEmailTemplate.testHtml("https://desk.example.test/");
        assertThat(html)
            .contains("Test message")
            .contains("Alerts are working")
            .contains("https://desk.example.test/admin")
            .doesNotContain("9876543210");
        assertThat(EnquiryEmailTemplate.testPlainText("https://desk.example.test/"))
            .contains("This is a test message")
            .doesNotContain("9876543210");
    }

    @Test
    void stackedMobileGridDropsColumnIndentSoEveryFieldAligns() {
        String html = EnquiryEmailTemplate.html(enquiry("Asha Patil", "asha@example.com"));
        assertThat(html)
            .contains(".detail{display:block!important;width:100%!important;padding:0 0 14px 0!important}")
            .contains(".stack{display:block!important;width:100%!important;padding:0 0 10px 0!important}")
            .contains(".btn{display:block!important;width:100%!important}");
    }
}
