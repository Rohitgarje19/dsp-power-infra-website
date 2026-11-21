import { usePageMeta } from "../lib/seo";
import { CONTACT } from "../data/content";

export default function Terms() {
  usePageMeta("Terms of use", "The terms that apply when you use the DSP Power Infra website, solar calculators, enquiry forms and consultation services.");
  return (
    <section className="section legal">
      <div className="legal-inner">
        <span className="eyebrow">Legal</span>
        <h1>Terms of use</h1>
        <p className="lede">Last updated: November 2026</p>

        <h2>About this website</h2>
        <p>This website is operated by DSP Power Infra, Pune, Maharashtra. It describes our solar offerings and lets you send enquiries. By using the site you agree to these terms.</p>

        <h2>Estimates are not offers</h2>
        <p>All calculator outputs — system size, generation, savings, costs, payback periods and subsidy figures — are indicative estimates based on the assumptions shown alongside them. Actual results depend on your roof, shading, sanctioned load, DISCOM processes, equipment selection and consumption patterns. A binding proposal is only made after a site survey and a written quotation.</p>

        <h2>Government subsidy</h2>
        <p>Subsidy information reflects our understanding of the PM Surya Ghar scheme rules at the time of writing (₹30,000/kW for the first 2 kW and ₹18,000 for the third kW, capped at ₹78,000 for eligible residential systems). Scheme rules, amounts and eligibility are set by the government and can change. Approval and disbursement are decided by the relevant authorities, not by us. We do not guarantee subsidy approval, amounts or timelines. Always verify current rules on the official portal, pmsuryaghar.gov.in.</p>

        <h2>Service area</h2>
        <p>We currently focus on Maharashtra (PIN prefixes 400–445, excluding Goa's 403). A PIN code check on this site indicates likely serviceability only; final confirmation happens when our team reviews your enquiry.</p>

        <h2>Enquiries and contact</h2>
        <p>By submitting an enquiry you consent to being contacted about your request by phone, WhatsApp or email. You can ask us to stop at any time. Please provide accurate details so our proposals are meaningful.</p>

        <h2>Content and imagery</h2>
        <p>Text, design and code on this site belong to DSP Power Infra. Some photographs are representative imagery and are labelled as such; they illustrate the kind of work involved and are not claims about specific completed projects. Project statistics, testimonials or certifications will only ever appear here when they are real and verifiable.</p>

        <h2>Liability</h2>
        <p>We work to keep this site accurate and available, but provide it "as is". To the extent permitted by law, we are not liable for decisions made solely on the basis of website estimates. Your statutory consumer rights are unaffected.</p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India, with courts at Pune, Maharashtra having jurisdiction.</p>

        <h2>Contact</h2>
        <p>Questions about these terms: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.</p>
      </div>
    </section>
  );
}