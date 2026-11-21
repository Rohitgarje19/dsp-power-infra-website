import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, FileText, Hammer, LifeBuoy, MessageSquare, Ruler } from "lucide-react";
import PageHero from "../components/PageHero";
import { usePageMeta } from "../lib/seo";

const STEPS = [
  [MessageSquare, "Tell us about the site", "Share your PIN code, average bill and goals through the form, phone or WhatsApp. We reply with first questions and a rough size range — no commitment.", "Output: a short brief and next-step call."],
  [Ruler, "Free site survey", "We measure usable roof, map shadows, check structure and your meter connection, and photograph everything relevant.", "Output: survey notes and usable-area map."],
  [FileText, "Written proposal", "System design, component brands and warranties, cost, subsidy position, timeline and every assumption — in one document you can question.", "Output: a proposal you can compare."],
  [ClipboardCheck, "Approvals & paperwork", "Net-metering application, subsidy portal steps and utility coordination handled by us, with status updates you can see.", "Output: approvals in place."],
  [Hammer, "Installation & commissioning", "Our own team installs, tests and commissions. Site left clean; you get a walkthrough of the system and monitoring.", "Output: a live, tested system."],
  [LifeBuoy, "Handover & support", "Documentation, warranty records, maintenance options and a team that answers when you call — year after year.", "Output: generation you can track."],
];

export default function HowItWorks() {
  usePageMeta("How solar installation works", "The DSP solar project journey: enquiry, survey, written proposal, approvals, installation and long-term support.");
  return (
    <>
      <PageHero
        eyebrow="The project journey"
        title="Clear steps from first enquiry to handover."
        lede="A solar project is easier when decisions, site requirements and next steps are visible from the beginning. Here is exactly what happens, and what you get at each stage."
        image="/images/sunrise-roof.jpg"
        imageAlt="Sunrise over a rooftop"
      />
      <section className="section">
        <div className="journey-grid">
          {STEPS.map(([Icon, title, copy, output], i) => (
            <article key={title}>
              <div className="journey-head"><i><Icon /></i><b>{String(i + 1).padStart(2, "0")}</b></div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <small>{output}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="banner">
        <div><span className="eyebrow">Start at step one</span><h2>Tell us about your site.</h2></div>
        <Link className="button light" to="/contact">Begin the conversation <ArrowRight size={16} /></Link>
      </section>
    </>
  );
}