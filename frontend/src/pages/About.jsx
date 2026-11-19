import { Link } from "react-router-dom";
import { ArrowRight, Compass, Handshake, Ruler, ShieldCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import { usePageMeta } from "../lib/seo";

const VALUES = [
  [Compass, "Guidance before sales", "We recommend what your site needs. If solar is not the right answer yet, we say that too."],
  [Ruler, "Engineering, not templates", "Every design starts from a survey: roof, shade, loads, metering rules. No copy-paste systems."],
  [Handshake, "One accountable team", "Design, supply, installation and support under one roof — you never coordinate our vendors for us."],
  [ShieldCheck, "Honest numbers", "Estimates show their assumptions. No fabricated statistics, no guaranteed-savings theatre."],
];

export default function About() {
  usePageMeta("About DSP Power Infra", "DSP Power Infra is a Pune-based solar EPC company: survey-first design, honest proposals, one accountable team from enquiry to maintenance.");
  return (
    <>
      <PageHero
        eyebrow="About DSP Power Infra"
        title="Solar EPC guidance with a local team."
        lede="We help homes, societies and businesses explore rooftop solar with clear conversations and responsible planning — from the first bill you share to the system you live with for 25 years."
        image="/images/banner-c.jpg"
        imageAlt="Solar panels over a residential landscape"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">What we stand for</span><h2>Four commitments we keep.</h2></div>
          <p>Solar is a long-term relationship. These are the rules we work by, on every project.</p>
        </div>
        <div className="benefit-grid">
          {VALUES.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section steps-band">
        <div className="about-story">
          <div>
            <span className="eyebrow">Our approach in one paragraph</span>
            <h2>We'd rather lose a sale than oversell a roof.</h2>
            <p>Most solar disappointment comes from systems sized to a sales target instead of a site: oversized arrays on shaded roofs, subsidy promises that never land, installers who vanish after commissioning. DSP was built to do the opposite — survey first, show the math, install with our own team, and stay reachable afterwards.</p>
            <p>That means our proposals sometimes say "smaller than you asked" or "not yet worth it." Customers stay because the numbers hold up year after year.</p>
            <Link className="button primary" to="/how-it-works">See the project journey <ArrowRight size={16} /></Link>
          </div>
          <img src="/images/house-dusk.jpg" alt="A home at dusk, the kind of site we plan for" loading="lazy" />
        </div>
      </section>
      <section className="banner">
        <div><span className="eyebrow">Work with us</span><h2>Start with a conversation.</h2></div>
        <Link className="button light" to="/contact">Talk to the team <ArrowRight size={16} /></Link>
      </section>
    </>
  );
}