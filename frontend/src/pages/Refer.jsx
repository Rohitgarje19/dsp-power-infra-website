import { Link } from "react-router-dom";
import { ArrowRight, Gift, HeartHandshake, Share2 } from "lucide-react";
import PageHero from "../components/PageHero";
import LeadForm from "../components/LeadForm";
import { usePageMeta } from "../lib/seo";

export default function Refer() {
  usePageMeta("Refer a friend", "Know someone planning rooftop solar? Introduce them to DSP Power Infra. Referral rewards are confirmed directly by the team.");
  return (
    <>
      <PageHero
        eyebrow="DSP referrals"
        title="Know someone planning a solar project?"
        lede="Introduce them to a team that surveys first and shows the math. Ask us about current referral terms — no reward is promised until the program is confirmed in writing."
        image="/images/banner-a.jpg"
        imageAlt="Rooftop solar at sunset"
      />
      <section className="section">
        <div className="refer-layout">
          <div className="refer-steps">
            <span className="eyebrow">How it works</span>
            <h2>Three simple steps.</h2>
            <article><i><Share2 /></i><div><h3>Share the referral</h3><p>Send us their name and number using the form — with their permission, always.</p></div></article>
            <article><i><HeartHandshake /></i><div><h3>We reach out gently</h3><p>A friendly introduction call, no pressure. They get the same honest process as every customer.</p></div></article>
            <article><i><Gift /></i><div><h3>Terms confirmed directly</h3><p>If a referral program is running, the team confirms your reward terms in writing before anything is promised.</p></div></article>
            <Link className="button quiet" to="/contact">Questions? Talk to us <ArrowRight size={15} /></Link>
          </div>
          <LeadForm
            source="referral"
            defaults={{ customerType: "Partnership", message: "Referral: I'd like to introduce someone planning a solar project. Their details (with permission): " }}
            eyebrow="REFERRAL DETAILS"
            heading="Introduce a friend."
            intro="Your details plus theirs (with permission). We'll take it from there."
          />
        </div>
      </section>
    </>
  );
}