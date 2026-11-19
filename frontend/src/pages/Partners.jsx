import { Factory, Handshake, Store, Truck } from "lucide-react";
import PageHero from "../components/PageHero";
import LeadForm from "../components/LeadForm";
import { usePageMeta } from "../lib/seo";

const PARTNERS = [
  [Store, "Installers & electricians", "Work with DSP on installation delivery under shared quality and safety standards."],
  [Truck, "Suppliers & distributors", "Panels, inverters, structures and BOS components — verified quality, fair terms."],
  [Factory, "Channel & EPC partners", "Co-deliver commercial and industrial projects where our capabilities complement."],
  [Handshake, "Referral partners", "Architects, builders, CAs and community leaders who meet people planning solar."],
];

export default function Partners() {
  usePageMeta("Solar partners", "Installers, suppliers, channel partners and referral partners: explore collaboration with DSP Power Infra.");
  return (
    <>
      <PageHero
        eyebrow="Solar partners"
        title="Work with DSP on solar opportunities."
        lede="For installers, suppliers, professionals and referral partners interested in discussing potential collaboration. Terms are agreed directly, in writing."
        image="/images/banner-b.jpg"
        imageAlt="Large rooftop solar array"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Who we work with</span><h2>Four kinds of partnership.</h2></div>
        </div>
        <div className="benefit-grid">
          {PARTNERS.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section contact solution-contact">
        <div>
          <span className="eyebrow">Introduce yourself</span>
          <h2>Tell us what you bring.</h2>
          <p>Your organization, experience and the opportunity you see. We reply to every serious introduction.</p>
        </div>
        <LeadForm source="partners" defaults={{ customerType: "Partnership", message: "Partnership introduction — organization, experience and opportunity: " }} heading="Start a partnership conversation." eyebrow="PARTNERS" />
      </section>
    </>
  );
}