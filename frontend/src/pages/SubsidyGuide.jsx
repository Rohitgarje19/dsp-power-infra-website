import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import PageHero from "../components/PageHero";
import Faq from "../components/Faq";
import { SUBSIDY_STEPS, SUBSIDY_FAQS } from "../data/content";
import { usePageMeta } from "../lib/seo";

export default function SubsidyGuide() {
  usePageMeta("PM Surya Ghar subsidy guide", "How the PM Surya Ghar rooftop solar subsidy works: amounts, eligibility and the five steps from registration to bank credit.");
  return (
    <>
      <PageHero
        eyebrow="Subsidy information"
        title="PM Surya Ghar, explained step by step."
        lede="Up to ₹78,000 for eligible residential rooftops. Here is the honest process — amounts, eligibility, paperwork and realistic timelines."
        image="/images/banner-b.jpg"
        imageAlt="Rooftop solar installation"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">The amounts</span><h2>What the scheme pays.</h2></div>
          <p>Residential slabs as published. Verify current rules on the official portal before deciding.</p>
        </div>
        <div className="subsidy-slabs">
          <article><small>First 2 kW</small><strong>₹30,000<span>/kW</span></strong><p>1 kW → ₹30,000 · 2 kW → ₹60,000</p></article>
          <article><small>Third kW</small><strong>₹18,000<span>/kW</span></strong><p>Added on top of the first slab</p></article>
          <article className="cap"><small>Maximum</small><strong>₹78,000</strong><p>3 kW and above all reach the cap</p></article>
        </div>
        <p className="table-note">Commercial, industrial and typically off-grid systems are not eligible. Housing societies follow a separate group-housing scheme with different per-kW amounts.</p>
      </section>
      <section className="section steps-band">
        <div className="section-head">
          <div><span className="eyebrow">The process</span><h2>Five steps to the bank credit.</h2></div>
          <p>DSP handles installation and documents; government approvals set the pace.</p>
        </div>
        <div className="subsidy-steps">
          {SUBSIDY_STEPS.map(([title, copy], i) => (
            <article key={title}><b>{i + 1}</b><div><h3>{title}</h3><p>{copy}</p></div></article>
          ))}
        </div>
        <a className="button quiet" href="https://pmsuryaghar.gov.in" target="_blank" rel="noreferrer">Open the official portal <ExternalLink size={15} /></a>
      </section>
      <Faq items={SUBSIDY_FAQS} title="Subsidy questions, answered honestly" />
      <section className="banner">
        <div><span className="eyebrow">See your number</span><h2>What would your roof get?</h2></div>
        <Link className="button light" to="/solar-calculator">Calculate with subsidy <ArrowRight size={16} /></Link>
      </section>
    </>
  );
}