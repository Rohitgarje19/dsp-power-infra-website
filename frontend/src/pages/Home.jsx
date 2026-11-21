import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Building2, Check, Factory, House, Layers, MapPin, Phone,
  ShieldCheck, Sparkles, Sun, Users,
} from "lucide-react";
import LeadForm from "../components/LeadForm";
import Faq from "../components/Faq";
const QuoteModal = lazy(() => import("../components/QuoteModal"));
import { HOME_FAQS, CONTACT } from "../data/content";
import { usePageMeta, useFaqSchema } from "../lib/seo";
import { pct } from "../lib/format";
const EmiCalculator = lazy(() => import("../components/EmiCalculator"));
import Picture from "../components/Picture";
import TrackRecord from "../components/TrackRecord";
import { PM_SURYA_GHAR } from "../data/impact";

const segments = [
  ["Residential", "Homes", "A rooftop system planned around your energy use, roof and, where eligible, PM Surya Ghar assistance.", House, "/homes", "homes"],
  ["Shared spaces", "Housing societies", "Common-area solar with load planning and a proposal built for committee review.", Users, "/housing-societies", "housing societies"],
  ["Commercial", "Businesses", "Rooftop solar for offices, shops and warehouses, engineered around your working hours.", Building2, "/commercial", "businesses"],
  ["Industrial", "Industrial EPC", "Larger rooftop projects with design, procurement and installation handled end to end.", Factory, "/commercial", "industrial EPC"],
];

const proofItems = [
  [Sun, "Design, supply, installation"],
  [Building2, "Homes to industrial"],
  [MapPin, "Pune-based team"],
  [ShieldCheck, "Support after switch-on"],
];

const trustItems = [
  ["01", "A survey, not a sales call", "Roof condition, shade, structure and meter connection are checked before we recommend a size.", "/images/trust-survey.jpg"],
  ["02", "One team through the project", "Design, supply and installation are coordinated by the same team instead of separate vendors.", "/images/trust-install.jpg"],
  ["03", "Mounting planned for monsoon", "Rails, clamps, drainage and cable routing are detailed for Indian weather and your roof type.", "/images/trust-mounting.jpg"],
  ["04", "Reachable after switch-on", "Cleaning guidance, performance questions and service requests stay with a team you can call.", "/images/trust-service.jpg"],
];

const checks = [
  ["01", "Roof condition and usable area", "What the structure can carry, where the array fits and how access will work."],
  ["02", "Shade and generation", "How trees, water tanks and neighbouring buildings affect the output we can promise."],
  ["03", "Structure and cable route", "Rails, clamps, drainage and a tidy cable path planned for your roof."],
  ["04", "Subsidy and paperwork", "Eligibility, the PM Surya Ghar route and what you need to submit, explained up front."],
];

const journey = [
  ["01", "Tell us about your site", "Share your location, bill and goals so we can understand what you need."],
  ["02", "Get a site assessment", "We look at your roof and requirements before recommending anything."],
  ["03", "Review your proposal", "See the scope, assumptions and costs explained clearly, and ask questions."],
  ["04", "Installation and support", "Your project is installed and you stay informed through the project."],
];

function HeroEstimate() {
  const [pin, setPin] = useState("");
  const [bill, setBill] = useState(3000);
  function go(e) {
    e.preventDefault();
    const p = new URLSearchParams({ pincode: pin, billValue: bill });
    window.location.href = "/solar-calculator?" + p.toString();
  }
  return (
    <form className="hero-search" onSubmit={go} aria-label="Quick solar estimate">
      <span className="hs-spark" aria-hidden="true"><Sparkles size={19} /></span>
      <label className="hs-pin">
        <span>Your PIN code</span>
        <input required pattern="[0-9]{6}" inputMode="numeric" placeholder="e.g. 411046" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-label="Your PIN code" />
      </label>
      <span className="hs-divider" aria-hidden="true" />
      <label className="hs-bill">
        <span>Monthly bill</span>
        <b>₹{Number(bill).toLocaleString("en-IN")}</b>
        <input className="fill" style={{ "--pct": pct(bill, 500, 10000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="10000" step="100" value={bill} onChange={(e) => setBill(e.target.value)} />
      </label>
      <button className="hs-submit" type="submit">Calculate <ArrowRight size={16} /></button>
    </form>
  );
}

function ProcessPhoto() {
  return (
    <div className="process-photo">
      <Picture src="/images/house-dusk.jpg" alt="Modern family home with rooftop solar panels at dusk" sizes="(max-width: 980px) 100vw, 45vw" />
      <div className="pp-caption">
        <b>Based in Pune, Maharashtra</b>
        <span>Design · supply · installation · support</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  usePageMeta(null, "DSP Power Infra — solar EPC for homes, housing societies and businesses in Pune. Survey-first design, subsidy support, installation and maintenance.");
  useFaqSchema(HOME_FAQS);
  return (
    <>
      <section className="hero photo-hero">
        <Picture className="hero-photo" src="/images/hero-family.jpg" alt="An Indian family on the terrace of their home with rooftop solar panels at golden hour" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <span className="hero-kicker">Solar EPC · Pune, Maharashtra</span>
          <h1>Power your home<br />with <em>the sun.</em></h1>
          <p className="lede light">Cleaner energy, lower bills, and a system planned around your roof — by one accountable team.</p>
          <div className="actions">
            <button type="button" className="button sun pill" onClick={() => setQuoteOpen(true)}>Get a free solar consultation <ArrowRight size={17} /></button>
            <Link className="button ghost-light pill" to="/solar-calculator">Calculate your savings</Link>
          </div>
          <p className="hero-meta"><span>Pune-based team</span><span>Survey-first design</span><span>Subsidy support</span></p>
        </div>
        <aside className="hero-proof" aria-label="Scheme track record">
          <span className="hp-eyebrow">PM Surya Ghar</span>
          <strong>{PM_SURYA_GHAR.installationsCompleted.toLocaleString("en-IN")}</strong>
          <span className="hp-label">installations completed</span>
          <small>Scheme work only · as of {PM_SURYA_GHAR.asOf}</small>
        </aside>
      </section>

      <section className="proof" aria-label="What DSP Power Infra provides">
        {proofItems.map(([Icon, label]) => (
          <span key={label}><i><Icon /></i> {label}</span>
        ))}
      </section>

      <section className="calc-band" id="estimate">
        <div className="calc-band-grid">
          <div className="cb-copy">
            <span className="eyebrow">Free solar estimate</span>
            <h2>Calculate your savings.</h2>
            <p>Your PIN code and monthly bill are enough to see system size, subsidy, payback and an indicative cost — with every assumption shown.</p>
            <Link className="text-link" to="/solar-calculator">Open the full calculator <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-panel calc-panel">
            <h2>What could solar save you?</h2>
            <p>Enter your PIN code and monthly bill to see an instant estimate.</p>
            <HeroEstimate />
            <div className="hero-stats">
              <article><strong>Pune</strong><span>Based in Maharashtra</span></article>
              <article><strong>{PM_SURYA_GHAR.installationsCompleted.toLocaleString("en-IN")}</strong><span>PM Surya Ghar installations</span></article>
              <article><strong>1 team</strong><span>Enquiry to switch-on</span></article>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="solutions">
        <div className="section-head">
          <div><span className="eyebrow">What we do</span><h2>Solar for every kind of roof.</h2></div>
          <p>Products, engineering and installation brought together, then shaped around the people and place using them.</p>
        </div>
        <div className="service-grid">
          {segments.map(([tag, title, copy, Icon, url, label]) => (
            <article className="service" key={title}>
              <span className="service-icon"><Icon /></span>
              <small>{tag}</small><h3>{title}</h3><p>{copy}</p>
              <Link to={url} aria-label={`Learn more about ${label}`}>Explore {label} <ArrowUpRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section trust-section" id="why">
        <div className="section-head">
          <div><span className="eyebrow">Built right, before it is switched on</span><h2>What a proper solar project looks like.</h2></div>
          <p>Going solar is a long-term decision. These are the parts we refuse to skip.</p>
        </div>
        <div className="trust-grid">
          {trustItems.map(([n, title, copy, img]) => (
            <article className="trust-card" key={title}>
              <div className="trust-photo">
                <Picture src={img} alt={title} widths={[640, 1024]} sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 25vw" />
                <span className="trust-num">{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <p className="image-note">Representative imagery. Every installation is planned to the site.</p>
      </section>

      <TrackRecord />

      <section className="standards" id="about">
        <div className="standards-inner">
          <div className="standards-copy">
            <span className="eyebrow">Before we quote</span>
            <h2>Four checks that shape an honest proposal.</h2>
            <p>A solar system is only as good as the survey behind it. We inspect first, then put the numbers in writing.</p>
            <ul className="standards-list">
              {checks.map(([n, title, copy]) => (
                <li key={n}><span>{n}</span><div><b>{title}</b><small>{copy}</small></div></li>
              ))}
            </ul>
            <Link className="button light" to="/how-it-works">See how it works <ArrowRight size={16} /></Link>
          </div>
          <aside className="standards-card">
            <span className="sc-eyebrow">In your written proposal</span>
            <div><b>System size</b><span>kW, module count and layout</span></div>
            <div><b>Generation estimate</b><span>Units per month, with the basis stated</span></div>
            <div><b>Cost and subsidy position</b><span>Turnkey cost and what you may be eligible for</span></div>
            <div><b>Assumptions</b><span>Tariff, usage and roof conditions, never hidden</span></div>
            <p>Every number traces back to a stated assumption.</p>
          </aside>
        </div>
      </section>

      <section className="section process" id="process">
        <div className="process-layout">
          <div>
            <div className="section-head" style={{ display: "block" }}>
              <span className="eyebrow">From first chat to switch-on</span>
              <h2>We guide the journey. You stay informed.</h2>
            </div>
            <div className="timeline">
              {journey.map(([n, t, d]) => (
                <article className="tl-step" key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></article>
              ))}
            </div>
          </div>
          <ProcessPhoto />
        </div>
      </section>

      <section className="section tools" id="tools">
        <div className="section-head">
          <div><span className="eyebrow">Solar tools</span><h2>Know your numbers.</h2></div>
          <p>Try a simple EMI estimate, or run the full savings calculator with subsidy and adjustable assumptions.</p>
        </div>
        <Suspense fallback={<div className="emi-skeleton" aria-hidden="true" />}>
          <EmiCalculator />
        </Suspense>
        <div className="calc-cta">
          <Link className="button primary" to="/solar-calculator">Estimate solar savings <ArrowRight size={16} /></Link>
          <p>Enter your PIN code and monthly bill to see system size, subsidy, cost and payback — with every assumption visible.</p>
        </div>
      </section>

      <Faq items={HOME_FAQS} lede="Straight answers about sizing, subsidy, backup and what happens after installation." />

      <section className="visit-section">
        <div className="visit">
          <div className="visit-copy">
            <span className="eyebrow">Before you decide</span>
            <h2>Talk it through before you commit.</h2>
            <p>Ask questions, understand your options and clear every doubt with the DSP team.</p>
            <ul>
              <li><Check /> Discuss your roof and energy needs</li>
              <li><Check /> Understand product and system options</li>
              <li><Check /> See the assumptions behind every estimate</li>
              <li><Check /> Know the next steps before you proceed</li>
            </ul>
            <Link className="button primary" to="/book-visit">Book a free site visit <ArrowRight size={16} /></Link>
          </div>
          <div className="visit-media">
            <Picture className="visit-img" src="/images/banner-b.jpg" alt="Home with rooftop solar panels at dusk" sizes="(max-width: 900px) 100vw, 48vw" />
            <div className="visit-caption">
              <b>What your consultation covers</b>
              <span>Site &amp; location · System planning · Proposal · Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="areas">
        <div>
          <span className="eyebrow">Where we work</span>
          <h2>Based in Pune.</h2>
          <p>Coverage depends on project type, team availability and site location. Share your PIN code and we will confirm.</p>
        </div>
        <div className="area-chips">
          <span><MapPin /> Pune</span><span><MapPin /> Maharashtra</span><span><MapPin /> Other locations</span>
          <Link to="/service-areas">Check your area <ArrowRight /></Link>
        </div>
      </section>

      <section className="banner">
        <div><span className="eyebrow">Your next step</span><h2>Start with your roof.<br /><em>We'll help with the rest.</em></h2></div>
        <a className="button sun" href="#contact">Talk to our team <ArrowRight size={16} /></a>
      </section>

      <section className="section contact" id="contact">
        <div>
          <span className="eyebrow">Tell us what you need</span>
          <h2>Let's explore what solar can <em>do for you.</em></h2>
          <p>Share a few details and our team will learn about your site and answer your questions.</p>
          <div className="contact-row"><Phone /><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></div>
          <div className="contact-row"><ArrowUpRight /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
          <p className="availability">Based in Pune. Share your PIN code and we'll confirm service availability for your location.</p>
        </div>
        <LeadForm source="home" />
      </section>
      {quoteOpen && (
        <Suspense fallback={null}>
          <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
