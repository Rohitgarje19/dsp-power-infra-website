import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import PageHero from "../components/PageHero";
import { checkPincode, SERVICEABLE_PREFIXES } from "../lib/serviceability";
import { usePageMeta } from "../lib/seo";

export default function ServiceAreas() {
  usePageMeta("Service areas", "DSP Power Infra is based in Pune. Check your PIN code against our core service region — other locations confirmed case by case.");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  function check(e) {
    e.preventDefault();
    setResult(checkPincode(pin));
  }
  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title="Check whether DSP can serve your location."
        lede="We are based in Pune. Coverage depends on project type, team availability and site conditions — share your PIN code for a straight answer."
        image="/images/house-dusk.jpg"
        imageAlt="Homes at dusk in the service region"
      />
      <section className="section">
        <div className="svc-layout">
          <form className="form-card svc-card" onSubmit={check}>
            <span className="eyebrow">PIN code check</span>
            <h3>Is your roof in our region?</h3>
            <label className="svc-input">PIN code
              <input required pattern="[0-9]{6}" inputMode="numeric" placeholder="e.g. 411046" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); }} />
            </label>
            <button className="button primary submit"><Search size={16} /> Check availability</button>
            {result && !result.valid && <p className="error" role="alert">{result.message}</p>}
            {result?.valid && (
              <div className={`svc-result ${result.serviceable ? "ok" : "check"}`} role="status">
                <MapPin size={20} />
                <div>
                  <b>{result.serviceable ? "Yes — core service region." : "Not confirmed yet."}</b>
                  <p>{result.message}</p>
                  <Link to={`/contact?pincode=${pin}`}>{result.serviceable ? "Book a survey" : "Ask the team to confirm"} <ArrowRight size={14} /></Link>
                </div>
              </div>
            )}
          </form>
          <div className="svc-info">
            <span className="eyebrow">How coverage works</span>
            <h2>Pune first, then case by case.</h2>
            <p>Our core region covers Pune and nearby PIN prefixes ({SERVICEABLE_PREFIXES.join(", ")}…). Outside it, we take projects where team availability, site access and project size make sense — and we say so honestly before you commit.</p>
            <ul className="check-list">
              <li><MapPin /> Residential: Pune & nearby regions</li>
              <li><MapPin /> Commercial/industrial: wider Maharashtra, case by case</li>
              <li><MapPin /> Other states: larger projects considered</li>
            </ul>
            <p className="table-note">A PIN check is a planning aid, not a commitment. Final availability is confirmed after a brief call.</p>
          </div>
        </div>
      </section>
    </>
  );
}