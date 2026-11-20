import { usePageMeta } from "../lib/seo";
import { CONTACT } from "../data/content";

export default function Privacy() {
  usePageMeta("Privacy policy", "How DSP Power Infra collects, uses and protects the information you share through this website.");
  return (
    <section className="section legal">
      <div className="legal-inner">
        <span className="eyebrow">Legal</span>
        <h1>Privacy policy</h1>
        <p className="lede">Last updated: November 2026</p>

        <h2>What we collect</h2>
        <p>When you submit an enquiry through this website, we collect the details you provide: your name, phone number, email address (optional), customer type, city, PIN code, approximate monthly electricity bill and any message you write. We also record which page the enquiry came from and, if present in the link you followed, basic campaign tags (UTM source, medium and campaign) so we know which channel referred you.</p>
        <p>We do not run third-party advertising trackers on this site. The only data we hold about you is what you choose to share with us.</p>

        <h2>Why we collect it</h2>
        <ul>
          <li>To respond to your enquiry and prepare a solar proposal or estimate discussion.</li>
          <li>To contact you by phone, WhatsApp or email about your request.</li>
          <li>To check whether your PIN code falls within our current service region.</li>
          <li>To suggest your city from the PIN code you type, the PIN is looked up in the public India Post PIN directory (district and state only).</li>
          <li>To keep internal records of enquiries so our team can follow up consistently.</li>
        </ul>

        <h2>How it is stored</h2>
        <p>Enquiries are stored in our own database with access restricted to the DSP Power Infra team through a password-protected admin area. We do not sell, rent or trade your personal information with anyone.</p>

        <h2>How long we keep it</h2>
        <p>Enquiries we mark as handled are retained for our records. Enquiries our team deletes are removed from the active list and permanently erased after a 15-day recovery window. You can ask us to delete your data sooner at any time.</p>

        <h2>Your choices</h2>
        <ul>
          <li>You can ask what information we hold about you.</li>
          <li>You can ask us to correct or delete it.</li>
          <li>You can ask us to stop contacting you.</li>
        </ul>
        <p>To exercise any of these, email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.</p>

        <h2>Calculator and estimates</h2>
        <p>The solar calculator runs entirely in your browser. Bill values and PIN codes you enter there are not sent to our servers unless you choose to submit an enquiry. Any figures shown are estimates based on stated assumptions, not offers or guarantees.</p>

        <h2>Changes to this policy</h2>
        <p>If this policy changes, we will update this page and the date above. Questions are welcome at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
      </div>
    </section>
  );
}