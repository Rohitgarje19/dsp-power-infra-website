import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Building2, Check, ClipboardCheck, Compass, Factory, FileText,
  House, Layers, LifeBuoy, MapPin, Phone, Ruler, ShieldCheck, Sun, Trees, Users, Wrench, Zap,
} from "lucide-react";
import LeadForm from "../components/LeadForm";
import Faq from "../components/Faq";
import { HOME_FAQS, CONTACT } from "../data/content";
import { usePageMeta } from "../lib/seo";
import { pct } from "../lib/format";
import EmiCalculator from "../components/EmiCalculator";

const segments = [
  ["Residential", "Homes", "A rooftop system designed around your energy use and property.", House, "/homes"],
  ["Shared spaces", "Housing societies", "Solar planning for common-area loads and suitable residential rooftops.", Users, "/housing-societies"],
  ["Commercial", "Business", "Engineering and installation shaped for offices, shops and warehouses.", Building2, "/commercial"],
  ["Industrial", "Solar EPC", "Planning and delivery for larger energy needs.", Factory, "/commercial"],
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

function QuickEstimate() {
  const [pin, setPin] = useState("");
  const [bill, setBill] = useState(3000);
  function go(e) {
    e.preventDefault();
    const p = new URLSearchParams({ pincode: pin, billValue: bill });
    window.location.href = "/solar-calculator?" + p.toString();
  }
  return (
    <form className="quick-form" onSubmit={go}>
      <label>PIN code
        <input required pattern="[0-9]{6}" inputMode="numeric" placeholder="e.g. 411046" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      </label>
      <label>
        <b><span>Average monthly bill</span><span>₹{Number(bill).toLocaleString("en-IN")}</span></b>
        <input className="fill" style={{ "--pct": pct(bill, 500, 10000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="10000" step="100" value={bill} onChange={(e) => setBill(e.target.value)} />
      </label>
      <button className="button primary">Calculate now <ArrowRight size={17} /></button>
    </form>
  );
}

function ProcessCard() {
  const move = (e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
    el.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
  };
  const leave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", 0); el.style.setProperty("--my", 0);
    el.style.setProperty("--gx", "50%"); el.style.setProperty("--gy", "50%");
  };
  return (
    <div className="process-card" onMouseMove={move} onMouseLeave={leave}>
      <div className="pc-glow" />
      <div className="pc-layer"><i className="ring r3" /><i className="ring r1" /><i className="ring r2" /></div>
      <div className="pc-sun"><Sun /></div>
      <div className="pc-info">Based in Pune, Maharashtra<small>Design · supply · installation · support</small></div>
    </div>
  );
}

export default function Home() {
  usePageMeta(null, "DSP Power Infra — solar EPC for homes, housing societies and businesses in Pune. Survey-first design, subsidy support, installation and maintenance.");
  return (
    <main>
      <section className="hero photo-hero">
        <img className="hero-photo" src="/images/hero.jpg" alt="Rooftop solar panels catching the evening sun" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <span className="eyebrow light">Solar EPC · Pune, Maharashtra</span>
          <h1>Solar that's planned around <em>your roof.</em></h1>
          <p className="lede light">From the first site visit to the day your system goes live — clear numbers, one accountable team, support that stays.</p>
          <div className="actions">
            <a className="button gold" href="#contact">Plan your solar project <ArrowRight size={17} /></a>
            <a className="button ghost-light" href="#solutions">Explore solutions</a>
          </div>
          <p className="caption light"><ShieldCheck size={18} /> Clear recommendations. A real team. Support through the journey.</p>
        </div>
        <div className="hero-chips">
          <div className="chip chip-a"><i><Zap /></i><b>Made for your roof<small>Designed around your needs</small></b></div>
          <div className="chip chip-b"><i><Check /></i><b>Survey to switch-on<small>One team, every step</small></b></div>
        </div>
      </section>

      <section className="estimate-band">
        <div><span className="eyebrow">Solar planning estimate</span><h2>Calculate your solar numbers</h2><p>Enter your PIN code and average monthly bill to get started.</p></div>
        <QuickEstimate />
      </section>

      <section className="proof">
        <span><i><Sun /></i> Solar products & EPC</span>
        <span><i><Building2 /></i> Residential to industrial</span>
        <span><i><Trees /></i> Design · supply · installation</span>
        <span><i><ShieldCheck /></i> Support through the project</span>
      </section>

      <section className="section" id="solutions">
        <div className="section-head">
          <div><span className="eyebrow">Solutions for every kind of site</span><h2>Get solar for</h2></div>
          <p>We bring products, engineering and installation together, then shape the system around the people and place using it.</p>
        </div>
        <div className="service-grid">
          {segments.map(([tag, title, copy, Icon, url]) => (
            <article className="service" key={title}>
              <span className="service-icon"><Icon /></span>
              <small>{tag}</small><h3>{title}</h3><p>{copy}</p>
              <Link to={url}>Learn more <ArrowUpRight size={15} /></Link>
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
          <ProcessCard />
        </div>
      </section>

      <section className="section tools" id="tools">
        <div className="section-head">
          <div><span className="eyebrow">Solar tools</span><h2>Know your numbers.</h2></div>
          <p>Try a simple EMI estimate, or run the full savings calculator with subsidy and adjustable assumptions.</p>
        </div>
        <EmiCalculator />
        <div className="calc-cta">
          <Link className="button primary" to="/solar-calculator">Estimate solar savings <ArrowRight size={16} /></Link>
          <p>Enter your PIN code and monthly bill to see system size, subsidy, cost and payback — with every assumption visible.</p>
        </div>
      </section>

      <Faq items={HOME_FAQS} lede="Straight answers about sizing, subsidy, backup and what happens after installation." />

      <section className="visit-section">
        <div className="visit">
          <div>
            <span className="eyebrow">Before you decide</span>
            <h2>Talk it through before you commit.</h2>
            <p>Ask questions, understand your options and clear every doubt with the DSP team.</p>
            <ul>
              <li><Check /> Discuss your roof and energy needs</li>
              <li><Check /> Understand product and system options</li>
              <li><Check /> See the assumptions behind every estimate</li>
              <li><Check /> Know the next steps before you proceed</li>
            </ul>
            <a className="button" href="#contact">Book a consultation <ArrowRight size={16} /></a>
          </div>
          <div className="visit-card">
            <h3>What your consultation covers</h3>
            <div className="visit-row"><i><MapPin /></i><b>Your site and location<small>Roof, shade and access</small></b></div>
            <div className="visit-row"><i><Ruler /></i><b>System planning<small>Sizing based on your usage</small></b></div>
            <div className="visit-row"><i><FileText /></i><b>Your proposal<small>Scope, costs and assumptions</small></b></div>
            <div className="visit-row"><i><LifeBuoy /></i><b>Support<small>Guidance through the project</small></b></div>
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
    </main>
  );
}