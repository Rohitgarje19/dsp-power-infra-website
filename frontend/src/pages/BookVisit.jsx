import { ClipboardCheck, Compass, FileText, Ruler } from "lucide-react";
import PageHero from "../components/PageHero";
import LeadForm from "../components/LeadForm";
import { usePageMeta } from "../lib/seo";

const SURVEY_COVERS = [
  [Ruler, "Measure your roof", "Usable unshaded area, orientation and obstacles — the real numbers behind system sizing."],
  [Compass, "Check shadows & structure", "Water tanks, neighbouring buildings, roof type and condition — mapped before any design."],
  [ClipboardCheck, "Review your connection", "Sanctioned load, meter type and net-metering feasibility for your utility."],
  [FileText, "Agree the next step", "A sensible size and configuration discussed on site — you decide afterwards, with no pressure."],
];

export default function BookVisit() {
  usePageMeta("Book a free site visit", "Schedule a free rooftop solar site survey with DSP Power Infra in Pune. Roof measurement, shadow check and honest sizing advice — no obligation.");
  return (
    <>
      <PageHero
        eyebrow="Free site survey"
        title="Book a free visit. Know your roof's potential."
        lede="Every good solar project starts with a real look at your site. Our team measures, checks and explains — you get honest numbers before you decide anything."
        image="/images/sunrise-roof.jpg"
        imageAlt="Sunrise over a rooftop suitable for solar"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">What the visit covers</span><h2>A survey, not a sales pitch.</h2></div>
          <p>The visit is free and carries no obligation. Slots are confirmed by phone based on your location and the team's schedule.</p>
        </div>
        <div className="benefit-grid">
          {SURVEY_COVERS.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section contact solution-contact">
        <div>
          <span className="eyebrow">Pick your slot</span>
          <h2>Tell us when you're free.</h2>
          <p>Share your details and preferred days or times. We call to confirm the visit — evenings and weekends can be arranged for working households.</p>
          <p className="availability">Based in Pune. Share your PIN code and we'll confirm service availability for your location.</p>
        </div>
        <LeadForm
          source="free-visit"
          defaults={{ message: "I'd like to book a free site survey. Preferred days/times: " }}
          heading="Book your free site visit."
          eyebrow="FREE SITE VISIT"
          intro="Our team will call to confirm a slot and tell you exactly what to expect."
        />
      </section>
    </>
  );
}