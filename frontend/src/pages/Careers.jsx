import { Link } from "react-router-dom";
import { ArrowRight, Compass, HardHat, Mail, Users, Wrench } from "lucide-react";
import PageHero from "../components/PageHero";
import { CONTACT } from "../data/content";
import { usePageMeta } from "../lib/seo";

const WORK_AREAS = [
  [Compass, "Design & engineering", "Site surveys, system sizing, layouts and proposals — turning roofs and bills into honest engineering."],
  [HardHat, "Installation & commissioning", "Structure, panels, inverters, protection and testing — delivered safely, on real sites around Pune."],
  [Wrench, "Service & maintenance", "Cleaning schedules, inspections and generation reviews that keep customer systems performing."],
  [Users, "Customer guidance", "Consultations, subsidy paperwork and clear communication — helping people decide with real numbers."],
];

export default function Careers() {
  usePageMeta("Careers", "Careers at DSP Power Infra, a Pune-based solar EPC company. Design, installation, service and customer guidance roles open as projects grow — send us your CV.");
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Careers at DSP Power Infra")}`;
  return (
    <>
      <PageHero
        eyebrow="Careers at DSP"
        title="Build a career in solar, close to home."
        lede="We're a Pune-based solar EPC team — design, supply, installation and support under one roof. If you want practical clean-energy work with real responsibility, we'd like to hear from you."
        image="/images/banner-b.jpg"
        imageAlt="Large rooftop solar array"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">The work we do</span><h2>Where you could contribute.</h2></div>
          <p>These are the kinds of work our team covers — not a list of fixed vacancies. Roles open as projects grow.</p>
        </div>
        <div className="benefit-grid">
          {WORK_AREAS.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section contact solution-contact">
        <div>
          <span className="eyebrow">How to apply</span>
          <h2>Send your CV and a short note.</h2>
          <p>Tell us the kind of work you're looking for, your experience and where you're based. We review every application and reply when there's a fit — no false promises about openings we don't have.</p>
          <div className="contact-row"><Mail /><a href={mailto}>{CONTACT.email}</a></div>
          <p className="availability">Based in {CONTACT.city}. Site roles involve travel within the service region.</p>
        </div>
        <div className="form-card careers-card">
          <span className="eyebrow">NEXT STEP</span>
          <h3>Apply by email.</h3>
          <p>Attach your CV and mention the area you're interested in — design, installation, service or customer guidance.</p>
          <a className="button primary" href={mailto}>Email your CV <ArrowRight size={17} /></a>
          <p className="privacy">Prefer to talk first? <Link to="/contact">Reach the team here</Link> and mention careers.</p>
        </div>
      </section>
    </>
  );
}