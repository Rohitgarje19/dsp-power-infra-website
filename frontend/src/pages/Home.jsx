import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Building2, Check, ClipboardCheck, Compass, Factory, FileText,
  House, Layers, LifeBuoy, MapPin, Phone, Ruler, ShieldCheck, Sparkles, Sun, Trees, Users, Wrench, Zap,
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
  ["Residential", "Homes", "A rooftop system designed around your energy use and property.", House, "/homes", "homes"],
  ["Shared spaces", "Housing societies", "Solar planning for common-area loads and suitable residential rooftops.", Users, "/housing-societies", "housing societies"],
  ["Commercial", "Business", "Engineering and installation shaped for offices, shops and warehouses.", Building2, "/commercial", "businesses"],
  ["Industrial", "Solar EPC", "Planning and delivery for larger energy needs.", Factory, "/commercial", "solar EPC"],
];

const whyItems = [
  [Compass, "Guidance first", "Recommendations based on your needs, with products and costs explained clearly."],
  [Wrench, "One team, start to finish", "Design, supply and installation brought together so you are not juggling vendors."],
  [Ruler, "Planned for your site", "Your roof, shade and energy use shape the system rather than a one-size template."],
  [LifeBuoy, "Support through the project", "A team to guide you and keep you informed from enquiry through installation."],
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
        <Picture className="hero-photo" src="/images/sunrise-roof.jpg" alt="Rooftop solar panels on a family home at sunrise" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <span className="hero-kicker">Solar EPC · Pune, Maharashtra</span>
          <h1>Power your home<br />with <em>the sun.</em></h1>
          <p className="lede light">Cleaner energy. Lower bills. A more independent home — planned around your roof by one accountable team.</p>
          <div className="actions">
            <button type="button" className="button light pill" onClick={() => setQuoteOpen(true)}>Get a free solar consultation <ArrowRight size={17} /></button>
            <Link className="button ghost-light pill" to="/solar-calculator">Calculate your savings</Link>
          </div>
          <p className="hero-meta"><span>Pune-based team</span><span>Survey-first design</span><span>Subsidy support</span></p>
        </div>
      </section>

      <section className="proof">
        <span><i><Sun /></i> Solar products & EPC</span>
        <span><i><Building2 /></i> Residential to industrial</span>
        <span><i><Trees /></i> Design · supply · installation</span>
        <span><i><ShieldCheck /></i> Support through the project</span>
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
          <div><span className="eyebrow">What we do</span><h2>Solar for every kind of site.</h2></div>
          <p>We bring products, engineering and installation together, then shape the system around the people and place using it.</p>
        </div>
        <div className="service-grid">
          {segments.map(([tag, title, copy, Icon, url, label]) => (
            <article className="service" key={title}>
              <span className="service-icon"><Icon /></span>
              <small>{tag}</small><h3>{title}</h3><p>{copy}</p>
              <Link to={url}>Learn more about {label} <ArrowUpRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section why-section">
        <div className="section-head">
          <div><span className="eyebrow">Why DSP Power Infra</span><h2>Why customers choose us</h2></div>
          <p>Going solar is a long-term decision. We make the process easier to understand and keep you informed.</p>
        </div>
        <div className="why-grid">
          {whyItems.map(([Icon, title, copy]) => (
            <article key={title}><div className="why-art"><Icon /></div><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <TrackRecord />

      <section className="approach-section" id="about">
        <div className="approach">
          <div>
            <span className="eyebrow">The DSP approach</span>
            <h2>Good decisions come from <em>good guidance.</em></h2>
            <p>We give you a clear view of your options and keep you informed from enquiry through installation.</p>
            <Link className="button primary" to="/how-it-works">See how it works <ArrowRight size={16} /></Link>
          </div>
          <div className="approach-points">
            <div><i><ClipboardCheck /></i><b>Recommendations based on your needs</b></div>
            <div><i><FileText /></i><b>Product and cost details explained clearly</b></div>
            <div><i><Users /></i><b>A team to guide your project</b></div>
            <div><i><Layers /></i><b>Assumptions shown, never hidden</b></div>
          </div>
          <div className="shield"><ShieldCheck /></div>
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
        <a className="button light" href="#contact">Talk to our team <ArrowRight size={16} /></a>
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