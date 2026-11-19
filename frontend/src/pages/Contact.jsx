import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import LeadForm from "../components/LeadForm";
import { CONTACT } from "../data/content";
import { usePageMeta } from "../lib/seo";

function billToOption(bill) {
  const b = Number(bill);
  if (!Number.isFinite(b) || b <= 0) return "";
  if (b < 1500) return "1500";
  if (b < 4000) return "3000";
  if (b < 8000) return "6000";
  return "10000";
}

export default function Contact() {
  usePageMeta("Contact & free consultation", "Talk to DSP Power Infra about rooftop solar for your home, society or business. Free consultation, survey-first proposals.");
  const [q] = useSearchParams();
  const fromCalculator = q.get("source") === "calculator";
  const defaults = {
    pincode: q.get("pincode") || "",
    city: q.get("city") || "",
    monthlyBill: billToOption(q.get("billValue")),
    message: fromCalculator
      ? `I used the solar calculator (bill ≈ ₹${Number(q.get("billValue") || 0).toLocaleString("en-IN")}/month) and would like a site-specific proposal.`
      : "",
  };
  return (
    <main>
      <section className="section contact route-contact">
        <div>
          <span className="eyebrow">Tell us what you need</span>
          <h2>Let's explore what solar can <em>do for you.</em></h2>
          <p>Share a few details and our team will learn about your site and answer your questions.</p>
          <div className="contact-row"><Phone /><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></div>
          <div className="contact-row"><Mail /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
          <div className="contact-row"><MapPin /><span>{CONTACT.city}</span></div>
          <div className="contact-row"><Clock /><span>Mon–Sat, 10:00–19:00 IST</span></div>
          <p className="availability">Based in Pune. Share your PIN code and we'll confirm service availability for your location.</p>
          {fromCalculator && <p className="pin-note ok"><ArrowUpRight size={15} /> Your calculator estimate is attached to this enquiry.</p>}
        </div>
        <LeadForm source={fromCalculator ? "calculator" : "contact"} defaults={defaults} heading={fromCalculator ? "Get a proposal for your estimate." : "Start with a conversation."} />
      </section>
    </main>
  );
}