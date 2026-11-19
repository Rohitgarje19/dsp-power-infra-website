import { CalendarCheck, Eye, MessageSquare, Ruler } from "lucide-react";
import PageHero from "../components/PageHero";
import LeadForm from "../components/LeadForm";
import { usePageMeta } from "../lib/seo";

const COVERS = [
  [Eye, "See real components", "Panels, inverters, mounting and protection hardware — touch and compare, not just brochures."],
  [Ruler, "Understand your roof", "Bring photos or drawings; we sketch how an array would sit on your site."],
  [MessageSquare, "Clear every doubt", "Subsidy steps, metering, backup, maintenance — asked and answered without sales pressure."],
  [CalendarCheck, "Agree next steps", "If it makes sense, we schedule the survey. If not, you leave better informed either way."],
];

export default function ExperienceCentre() {
  usePageMeta("Visit & consultation", "Book a consultation with DSP Power Infra: see components, discuss your roof and clear every doubt before you decide.");
  return (
    <>
      <PageHero
        eyebrow="Visit & consultation"
        title="See the options and ask your questions."
        lede="A consultation is a conversation, not a pitch. See hardware, discuss your site, and leave with a clear view of what solar would mean for you."
        image="/images/house-dusk.jpg"
        imageAlt="Home at dusk"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">What a visit covers</span><h2>One sitting, every doubt.</h2></div>
          <p>Availability and location are confirmed by the team when you book.</p>
        </div>
        <div className="benefit-grid">
          {COVERS.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section contact solution-contact">
        <div>
          <span className="eyebrow">Book your slot</span>
          <h2>Pick a time that suits you.</h2>
          <p>Tell us what you want to see and when you're free. We confirm the arrangement by phone — evenings and weekends possible for working households.</p>
        </div>
        <LeadForm source="experience-centre" defaults={{ message: "I'd like to book a consultation / visit. Preferred days/times: " }} heading="Request a consultation." eyebrow="BOOK A VISIT" />
      </section>
    </>
  );
}