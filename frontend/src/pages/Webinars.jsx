import { Bell, Presentation, Users, Video } from "lucide-react";
import PageHero from "../components/PageHero";
import LeadForm from "../components/LeadForm";
import { usePageMeta } from "../lib/seo";

const TOPICS = [
  [Presentation, "Solar system basics", "How panels, inverters and metering actually work — in plain language."],
  [Users, "Preparing for a survey", "What to check on your roof and bills before we visit, so the proposal is sharper."],
  [Video, "Understanding a proposal", "Read any solar quote like an engineer: sizes, assumptions, warranties, red flags."],
  [Bell, "Maintenance & monitoring", "Cleaning cycles, generation checks and the small habits that protect output."],
];

export default function Webinars() {
  usePageMeta("Solar webinars & sessions", "Practical solar sessions for customers and teams. Upcoming sessions are announced here; suggest a topic or request a discussion.");
  return (
    <>
      <PageHero
        eyebrow="Learn about solar"
        title="Practical solar sessions for customers and teams."
        lede="Short, honest sessions on how solar works and how to buy it well. Upcoming dates appear here once scheduled — join the notify list to hear first."
        image="/images/panels-sunset.jpg"
        imageAlt="Solar panels in evening light"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Session topics</span><h2>What we cover.</h2></div>
          <p>No upcoming sessions are scheduled right now. Request one below and we'll plan it around interest.</p>
        </div>
        <div className="benefit-grid">
          {TOPICS.map(([Icon, title, copy]) => (
            <article key={title}><span className="benefit-icon"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section contact solution-contact">
        <div>
          <span className="eyebrow">Stay in the loop</span>
          <h2>Get notified, or suggest a topic.</h2>
          <p>Leave your details and we'll message you when the next session is scheduled. Housing societies and businesses can request a private session for their committee or team.</p>
        </div>
        <LeadForm source="webinars" defaults={{ message: "Please notify me about upcoming solar sessions. Topic I'd like covered: " }} heading="Join the notify list." eyebrow="WEBINARS" />
      </section>
    </>
  );
}