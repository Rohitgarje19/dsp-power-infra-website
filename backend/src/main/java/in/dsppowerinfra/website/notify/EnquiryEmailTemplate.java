package in.dsppowerinfra.website.notify;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Table-based HTML email for enquiry alerts: no external images, inline styles,
 * 600 px desktop card that stacks cleanly on a phone, plus a plain-text twin.
 * Every customer-supplied value is escaped before it reaches the markup.
 */
public final class EnquiryEmailTemplate {

    private static final String INK = "#1d1c1a";
    private static final String MUTED = "#6f6a61";
    private static final String LINE = "#e7e0d1";
    private static final String CARD = "#fffdf8";
    private static final String PAGE = "#efe9dd";
    private static final String DARK = "#171614";
    private static final String CHAMPAGNE = "#c3a36a";
    private static final String FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    private static final String SERIF = "Georgia,'Times New Roman',serif";
    private static final DateTimeFormatter STAMP =
        DateTimeFormatter.ofPattern("d MMM yyyy, h:mm a", Locale.ENGLISH).withZone(ZoneId.of("Asia/Kolkata"));

    private EnquiryEmailTemplate() {
    }

    public record Enquiry(
        long id,
        String name,
        String phone,
        String email,
        String city,
        String pincode,
        String monthlyBill,
        String source,
        Instant receivedAt,
        String siteUrl
    ) {
    }

    public static String subject(Enquiry enquiry) {
        return "New solar enquiry — " + enquiry.name();
    }

    public static String plainText(Enquiry enquiry) {
        String emailLine = isBlank(enquiry.email()) ? "" : "Email: " + enquiry.email() + "\n";
        String desk = isBlank(enquiry.siteUrl()) ? "" : "\nOpen the desk: " + enquiry.siteUrl() + "/admin\n";
        String reply = isBlank(enquiry.email())
            ? "Reply to this message, or call the number above."
            : "Hit Reply to answer " + enquiry.name() + " directly.";
        return "New solar enquiry received.\n\n"
            + "Name: " + enquiry.name() + "\n"
            + "Phone: " + enquiry.phone() + "\n"
            + emailLine
            + "City: " + enquiry.city() + "\n"
            + "Pincode: " + enquiry.pincode() + "\n"
            + "Monthly bill: " + (isBlank(enquiry.monthlyBill()) ? "not provided" : "Rs " + enquiry.monthlyBill()) + "\n"
            + "Source: " + enquiry.source() + "\n"
            + "Received: " + STAMP.format(enquiry.receivedAt()) + " IST\n\n"
            + reply + "\n"
            + desk
            + "\nLead ID: " + enquiry.id() + "\n";
    }

    public static String html(Enquiry enquiry) {
        String deskUrl = deskUrl(enquiry.siteUrl());
        String bill = isBlank(enquiry.monthlyBill()) ? "Not provided" : "Rs " + enquiry.monthlyBill();
        String email = isBlank(enquiry.email()) ? "Not provided" : emailLink(enquiry.email());
        String replyNote = isBlank(enquiry.email())
            ? "Reply to this message or call the number above to reach the customer."
            : "Hit Reply to answer " + escape(enquiry.name()) + " directly.";

        String callHref = telHref(enquiry.phone());
        String callButton = callHref == null ? "" : button(callHref, "Call " + enquiry.phone(), false);
        String deskButton = isBlank(deskUrl) ? "" : button(deskUrl, "Open enquiry desk", true);

        return "<!doctype html><html lang=\"en\"><head>"
            + "<meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + "<meta name=\"color-scheme\" content=\"light only\">"
            + "<title>" + escape(subject(enquiry)) + "</title>"
            + "<style>"
            + "@media only screen and (max-width:480px){"
            + ".wrap{width:100%!important}.pad{padding:22px!important}.h1{font-size:24px!important}"
            + ".stack{display:block!important;width:100%!important}.stack-gap{padding:0 0 10px 0!important}"
            + ".detail{display:block!important;width:100%!important}.detail-gap{padding:0 0 14px 0!important}"
            + "}"
            + "</style></head><body style=\"margin:0;padding:0;background:" + PAGE + ";\">"
            + "<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">"
            + "New enquiry from " + escape(enquiry.name()) + " in " + escape(enquiry.city())
            + " · bill " + escape(bill) + "</div>"
            + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"background:" + PAGE + ";padding:26px 12px;\"><tr><td align=\"center\">"
            + "<table role=\"presentation\" class=\"wrap\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"width:100%;max-width:600px;background:" + CARD + ";border-radius:18px;overflow:hidden;"
            + "box-shadow:0 10px 30px rgba(28,26,22,.10);font-family:" + FONT + ";\">"
            + header()
            + "<tr><td class=\"pad\" style=\"padding:30px 34px 8px 34px;\">"
            + eyebrow("New enquiry")
            + "<div class=\"h1\" style=\"font-family:" + SERIF + ";font-size:30px;line-height:1.2;color:" + INK
            + ";font-weight:700;margin:8px 0 6px 0;\">" + escape(enquiry.name()) + "</div>"
            + "<div style=\"font-size:14px;color:" + MUTED + ";line-height:1.5;\">"
            + escape(enquiry.city()) + " · " + escape(enquiry.pincode()) + " · " + escape(enquiry.source())
            + "</div></td></tr>"
            + "<tr><td class=\"pad\" style=\"padding:18px 34px 0 34px;\">"
            + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"background:#f7f2e7;border:1px solid " + LINE + ";border-radius:14px;\"><tr><td style=\"padding:20px 22px;\">"
            + detailsGrid(enquiry, email, bill)
            + "</td></tr></table></td></tr>"
            + "<tr><td class=\"pad\" style=\"padding:22px 34px 6px 34px;\">"
            + "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr>"
            + "<td class=\"stack stack-gap\" style=\"padding-right:10px;\">" + deskButton + "</td>"
            + "<td class=\"stack\" style=\"padding-left:10px;\">" + callButton + "</td>"
            + "</tr></table></td></tr>"
            + "<tr><td class=\"pad\" style=\"padding:14px 34px 26px 34px;font-size:13px;line-height:1.6;color:" + MUTED + ";\">"
            + replyNote + "</td></tr>"
            + footer("Received " + STAMP.format(enquiry.receivedAt()) + " IST · Lead #" + enquiry.id(), deskUrl)
            + "</table>"
            + "<div style=\"font-size:11px;color:#8d8577;padding:14px 8px 0 8px;font-family:" + FONT + ";\">"
            + "You receive this because your address is on the DSP Power Infra enquiry alert list.</div>"
            + "</td></tr></table></body></html>";
    }

    public static String testPlainText(String siteUrl) {
        String desk = isBlank(siteUrl) ? "" : "\nOpen the desk: " + deskUrl(siteUrl) + "\n";
        return "This is a test message from the DSP Power Infra enquiry desk.\n\n"
            + "If you received it, this inbox is set up to receive an alert for every new enquiry.\n\n"
            + "A real alert shows the customer's name, phone, email, city, PIN, monthly bill and source,\n"
            + "with buttons to call them or open the desk.\n"
            + desk
            + "\nYou can change recipients in the enquiry desk under \"Email recipients\".\n";
    }

    public static String testHtml(String siteUrl) {
        String deskUrl = deskUrl(siteUrl);
        String deskButton = isBlank(deskUrl) ? "" : button(deskUrl, "Open enquiry desk", true);
        return "<!doctype html><html lang=\"en\"><head>"
            + "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + "<meta name=\"color-scheme\" content=\"light only\">"
            + "<title>Test email — DSP enquiry alerts</title>"
            + "<style>@media only screen and (max-width:480px){.wrap{width:100%!important}.pad{padding:22px!important}.h1{font-size:24px!important}}</style>"
            + "</head><body style=\"margin:0;padding:0;background:" + PAGE + ";\">"
            + "<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">"
            + "Test message — your enquiry alerts are working.</div>"
            + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"background:" + PAGE + ";padding:26px 12px;\"><tr><td align=\"center\">"
            + "<table role=\"presentation\" class=\"wrap\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"width:100%;max-width:600px;background:" + CARD + ";border-radius:18px;overflow:hidden;"
            + "box-shadow:0 10px 30px rgba(28,26,22,.10);font-family:" + FONT + ";\">"
            + header()
            + "<tr><td class=\"pad\" style=\"padding:30px 34px 4px 34px;\">"
            + eyebrow("Test message")
            + "<div class=\"h1\" style=\"font-family:" + SERIF + ";font-size:30px;line-height:1.2;color:" + INK
            + ";font-weight:700;margin:8px 0 6px 0;\">Alerts are working</div>"
            + "<div style=\"font-size:15px;color:" + MUTED + ";line-height:1.6;\">"
            + "This is a test, not a customer enquiry. Every new enquiry will arrive in this design.</div>"
            + "</td></tr>"
            + "<tr><td class=\"pad\" style=\"padding:18px 34px 0 34px;\">"
            + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"background:#f7f2e7;border:1px solid " + LINE + ";border-radius:14px;\"><tr><td style=\"padding:20px 22px;\">"
            + check("Customer contact", "Name, phone and (when given) email, with a one-tap call button")
            + check("Site details", "City, PIN code and monthly bill")
            + check("Where it came from", "Source label and received time in IST")
            + "</td></tr></table></td></tr>"
            + "<tr><td class=\"pad\" style=\"padding:22px 34px 28px 34px;\">" + deskButton + "</td></tr>"
            + footer("No customer data is included in this test message.", deskUrl)
            + "</table></td></tr></table></body></html>";
    }

    static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    private static String header() {
        return "<tr><td style=\"background:" + DARK + ";padding:24px 34px;\">"
            + "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\"><tr>"
            + "<td width=\"46\" valign=\"middle\">"
            + "<div style=\"width:40px;height:40px;border-radius:10px;background:" + CHAMPAGNE
            + ";color:" + DARK + ";font-size:13px;font-weight:700;line-height:40px;text-align:center;"
            + "letter-spacing:.5px;font-family:" + FONT + ";\">DSP</div></td>"
            + "<td valign=\"middle\" style=\"padding-left:12px;font-family:" + FONT + ";\">"
            + "<div style=\"font-size:13px;font-weight:700;letter-spacing:2.4px;color:#f4efe4;\">DSP POWER INFRA</div>"
            + "<div style=\"font-size:10px;letter-spacing:2.8px;color:" + CHAMPAGNE + ";padding-top:4px;\">ENQUIRY DESK</div>"
            + "</td></tr></table></td></tr>";
    }

    private static String detailsGrid(Enquiry enquiry, String emailHtml, String bill) {
        return "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
            + "<tr>"
            + "<td class=\"detail detail-gap\" width=\"50%\" valign=\"top\" style=\"padding:0 12px 16px 0;\">"
            + label("Phone") + "<div style=\"font-size:16px;color:" + INK + ";line-height:1.4;\">"
            + phoneLink(enquiry.phone()) + "</div></td>"
            + "<td class=\"detail\" width=\"50%\" valign=\"top\" style=\"padding:0 0 16px 12px;\">"
            + label("Email") + "<div style=\"font-size:16px;color:" + INK + ";line-height:1.4;word-break:break-all;\">"
            + emailHtml + "</div></td></tr>"
            + "<tr>"
            + "<td class=\"detail detail-gap\" width=\"50%\" valign=\"top\" style=\"padding:0 12px 16px 0;\">"
            + label("City") + value(escape(enquiry.city())) + "</td>"
            + "<td class=\"detail\" width=\"50%\" valign=\"top\" style=\"padding:0 0 16px 12px;\">"
            + label("PIN code") + value(escape(enquiry.pincode())) + "</td></tr>"
            + "<tr>"
            + "<td class=\"detail detail-gap\" width=\"50%\" valign=\"top\" style=\"padding:0 12px 0 0;\">"
            + label("Monthly bill") + value(escape(bill)) + "</td>"
            + "<td class=\"detail\" width=\"50%\" valign=\"top\" style=\"padding:0 0 0 12px;\">"
            + label("Source") + value(escape(enquiry.source())) + "</td></tr>"
            + "</table>";
    }

    private static String check(String title, String text) {
        return "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" "
            + "style=\"margin:0 0 14px 0;\"><tr>"
            + "<td width=\"26\" valign=\"top\" style=\"font-size:15px;color:" + CHAMPAGNE + ";line-height:1.5;\">&#10003;</td>"
            + "<td valign=\"top\" style=\"font-size:14px;line-height:1.55;color:" + INK + ";\">"
            + "<b>" + escape(title) + "</b><br><span style=\"color:" + MUTED + ";\">" + escape(text) + "</span></td>"
            + "</tr></table>";
    }

    private static String footer(String meta, String deskUrl) {
        String manage = isBlank(deskUrl)
            ? "Manage recipients in the enquiry desk under Email recipients."
            : "Manage recipients in the <a href=\"" + escape(deskUrl) + "\" style=\"color:" + INK + ";\">enquiry desk</a> under Email recipients.";
        return "<tr><td style=\"border-top:1px solid " + LINE + ";background:#faf6ec;padding:18px 34px 22px 34px;"
            + "font-size:11px;line-height:1.6;color:" + MUTED + ";font-family:" + FONT + ";\">"
            + escape(meta) + "<br>" + manage + "</td></tr>";
    }

    private static String label(String text) {
        return "<div style=\"font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:" + MUTED
            + ";padding-bottom:4px;font-weight:700;\">" + escape(text) + "</div>";
    }

    private static String value(String escaped) {
        return "<div style=\"font-size:16px;color:" + INK + ";line-height:1.4;\">" + escaped + "</div>";
    }

    private static String eyebrow(String text) {
        return "<div style=\"font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:" + CHAMPAGNE
            + ";font-weight:700;\">" + escape(text) + "</div>";
    }

    private static String phoneLink(String phone) {
        String dial = telHref(phone);
        String display = escape(phone);
        if (dial == null) {
            return display;
        }
        return "<a href=\"" + dial + "\" style=\"color:" + INK + ";text-decoration:none;"
            + "border-bottom:1px solid " + CHAMPAGNE + ";\">" + display + "</a>";
    }

    private static String telHref(String phone) {
        String digits = phone == null ? "" : phone.replaceAll("[^0-9+]", "");
        if (digits.isBlank()) {
            return null;
        }
        return "tel:" + (digits.startsWith("+") ? digits : "+91" + digits);
    }

    private static String emailLink(String email) {
        String safe = escape(email);
        return "<a href=\"mailto:" + safe + "\" style=\"color:" + INK + ";text-decoration:none;"
            + "border-bottom:1px solid " + CHAMPAGNE + ";\">" + safe + "</a>";
    }

    private static String button(String href, String text, boolean primary) {
        String bg = primary ? DARK : "#fffdf8";
        String fg = primary ? "#ffffff" : INK;
        String border = primary ? DARK : "#cfc6b3";
        return "<a href=\"" + escape(href) + "\" class=\"stack\" style=\"display:inline-block;"
            + "padding:12px 22px;border-radius:999px;background:" + bg + ";color:" + fg
            + ";border:1px solid " + border + ";font-size:14px;font-weight:600;text-decoration:none;"
            + "font-family:" + FONT + ";\">" + escape(text) + "</a>";
    }

    private static String deskUrl(String siteUrl) {
        if (isBlank(siteUrl)) {
            return "";
        }
        String base = siteUrl.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/admin";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
