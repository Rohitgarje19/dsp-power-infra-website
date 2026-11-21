import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import PageHero from "../components/PageHero";
import { checkPincode, resolveCity } from "../lib/serviceability";
import { usePageMeta } from "../lib/seo";
import { CITIES } from "../data/cities";

export default function ServiceAreas() {
  usePageMeta("Service areas", "DSP Power Infra covers Maharashtra. Check your PIN code against our service region — other states confirmed case by case.");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [city, setCity] = useState("");
  const request = useRef(0);
  async function check(e) {
    e.preventDefault();
    const value = pin;
    const id = ++request.current;
    const next = checkPincode(value);
    setResult(next);
    setCity("");
    if (!next.valid) return;
    const resolved = await resolveCity(value);
    if (id === request.current) setCity(resolved || "");
  }
  const contactHref = `/contact?pincode=${pin}${city ? `&city=${encodeURIComponent(city)}` : ""}`;
  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title="Check whether DSP can serve your location."
        lede="We are based in Pune and serve all of Maharashtra. Coverage depends on project type, team availability and site conditions — share your PIN code for a straight answer."
        image="/images/house-dusk.jpg"
        imageAlt="Homes at dusk in the service region"
      />
      <section className="section">
        <div className="svc-layout">
          <form className="form-card svc-card" onSubmit={check}>
            <span className="eyebrow">PIN code check</span>
            <h3>Is your roof in our region?</h3>
            <label className="svc-input">PIN code
              <input required pattern="[0-9]{6}" inputMode="numeric" placeholder="e.g. 411046" value={pin} onChange={(e) => { request.current += 1; setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); setCity(""); }} />
            </label>
            <button className="button primary submit"><Search size={16} /> Check availability</button>
            {result && !result.valid && <p className="error" role="alert">{result.message}</p>}
            {result?.valid && (
              <div className={`svc-result ${result.serviceable ? "ok" : "check"}`} role="status">
                <MapPin size={20} />
                <div>
                  <b>{result.serviceable ? "Yes — in our service region." : "Not confirmed yet."}</b>
                  {city && <p className="svc-city">PIN {pin} · {city}</p>}
                  <p>{result.message}</p>
                  <Link to={contactHref}>{result.serviceable ? "Book a survey" : "Ask the team to confirm"} <ArrowRight size={14} /></Link>
                </div>
              </div>
            )}
          </form>
          <div className="svc-info">
            <span className="eyebrow">How coverage works</span>
            <h2>Maharashtra wide, then case by case.</h2>
            <p>Our service region covers all of Maharashtra (PIN prefixes 400–445, excluding Goa's 403). Outside the state, we take projects where team availability, site access and project size make sense — and we say so honestly before you commit.</p>
            <ul className="check-list">
              <li><MapPin /> Residential: all of Maharashtra</li>
              <li><MapPin /> Commercial/industrial: Maharashtra, other states case by case</li>
              <li><MapPin /> Other states: larger projects considered</li>
            </ul>
            <p className="table-note">A PIN check is a planning aid, not a commitment. Final availability is confirmed after a brief call.</p>
          </div>
        </div>
      </section>
      <section className="section city-directory">
        <div className="section-head">
          <div><span className="eyebrow">City guides</span><h2>Solar where you live.</h2></div>
          <p>Local context for the Maharashtra cities we hear from most — from coastal high-rises to Marathwada bungalows.</p>
        </div>
        <div className="city-grid">
          {CITIES.map((city) => (
            <Link className="city-card" key={city.slug} to={`/service-areas/${city.slug}`}>
              <MapPin size={18} />
              <b>{city.name}</b>
              <span>{city.region}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}