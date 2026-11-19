import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { estimate, inr, DEFAULTS } from "../lib/solar";
import { pct } from "../lib/format";
import { checkPincode } from "../lib/serviceability";
import { usePageMeta } from "../lib/seo";

export default function Calculator() {
  usePageMeta("Solar calculator", "Estimate your rooftop solar system size, subsidy, cost and payback from your PIN code and monthly bill — with every assumption adjustable.");
  const [q] = useSearchParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(q.get("pincode") || "");
  const [city, setCity] = useState(q.get("city") || "");
  const [bill, setBill] = useState(q.get("billValue") || "2500");
  const [tariff, setTariff] = useState(q.get("tariff") || String(DEFAULTS.tariff));
  const [yieldRate, setYieldRate] = useState(q.get("yield") || String(DEFAULTS.yieldPerKw));
  const [cost, setCost] = useState(q.get("costPerKw") || String(DEFAULTS.costPerKw));
  const [area, setArea] = useState(q.get("areaPerKw") || String(DEFAULTS.areaPerKw));

  const live = estimate({ bill, tariff, yieldPerKw: yieldRate, costPerKw: cost, areaPerKw: area });
  const pinInfo = pin.length === 6 ? checkPincode(pin) : null;

  function calculate(e) {
    e.preventDefault();
    const params = new URLSearchParams({ pincode: pin, billValue: bill, city, tariff, yield: yieldRate, costPerKw: cost, areaPerKw: area });
    navigate("/solar-calculator/results?" + params.toString());
  }

  return (
    <main className="calculator-page">
      <section className="calculator-heading">
        <span className="eyebrow">Solar planning tool</span>
        <h1>Calculate a solar estimate for your home.</h1>
        <p>Start with your location and average electricity bill. We'll show system size, PM Surya Ghar subsidy, indicative cost and payback — with every assumption visible and adjustable.</p>
      </section>
      <form className="savings-card" onSubmit={calculate}>
        <div>
          <div className="savings-intro">
            <span className="eyebrow">DSP solar planning estimate</span>
            <h2>Explore your solar numbers.</h2>
            <p>Enter your PIN code and average monthly bill. Your result will show the assumptions used so you can adjust them.</p>
          </div>
          <div className="savings-inputs">
            <label>PIN code
              <input required pattern="[0-9]{6}" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 411046" />
            </label>
            <label>City
              <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pune" maxLength={100} />
            </label>
            {pinInfo?.valid && <p className={`pin-note span2 ${pinInfo.serviceable ? "ok" : "check"}`}>{pinInfo.message}</p>}
            <label className="bill-control">Average monthly electricity bill <strong>{inr(bill)}</strong>
              <input className="fill" style={{ "--pct": pct(bill, 500, 50000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="50000" step="100" value={bill} onChange={(e) => setBill(e.target.value)} />
              <small>Use a 12-month average if available.</small>
            </label>
            <details className="assumption-editor">
              <summary>Adjust the estimate assumptions</summary>
              <div className="assumption-fields">
                <label>Average tariff (₹/kWh)<input type="number" min="1" max="100" step="0.5" value={tariff} onChange={(e) => setTariff(e.target.value)} /></label>
                <label>Solar output (kWh/kW/month)<input type="number" min="20" max="250" step="5" value={yieldRate} onChange={(e) => setYieldRate(e.target.value)} /></label>
                <label>Indicative system cost (₹/kW)<input type="number" min="10000" max="200000" step="1000" value={cost} onChange={(e) => setCost(e.target.value)} /></label>
                <label>Roof area (sq ft/kW)<input type="number" min="20" max="200" step="5" value={area} onChange={(e) => setArea(e.target.value)} /></label>
              </div>
            </details>
            <button className="button primary submit">Calculate my estimate <ArrowRight size={17} /></button>
            <p className="estimate-note">Planning estimate only — not a quote, savings guarantee, subsidy decision or service availability confirmation.</p>
          </div>
        </div>
        <aside className="savings-preview">
          <span className="eyebrow">Live preview</span>
          <h3>Indicative system size</h3>
          <div className="preview-stat"><small>System size</small><strong>{live.kw.toFixed(1)} <span>kW</span></strong></div>
          <div className="preview-stat"><small>Roof area needed</small><strong>{Math.round(live.roof)} <span>sq. ft.</span></strong></div>
          <div className="preview-stat"><small>Estimated monthly use</small><strong>{Math.round(live.usage)} <span>kWh</span></strong></div>
          <p>Updates as you change your bill or assumptions. A site visit is needed to confirm what fits your roof.</p>
        </aside>
      </form>
      <section className="calculator-how">
        <span className="eyebrow">How this estimate works</span>
        <div className="route-grid">
          <article><span>01</span><h3>Estimate usage</h3><p>Your bill and the tariff assumption estimate monthly electricity consumption.</p></article>
          <article><span>02</span><h3>Size the system</h3><p>The generation assumption estimates a rounded system capacity and roof area.</p></article>
          <article><span>03</span><h3>Apply subsidy</h3><p>Eligible residential systems show the PM Surya Ghar amount and net cost.</p></article>
          <article><span>04</span><h3>Confirm on site</h3><p>Actual design needs a roof survey, utility details and a confirmed quote.</p></article>
        </div>
      </section>
      <div className="consult-bar">
        <p>Have questions about your estimate? Talk to our team.</p>
        <a className="button primary" href="/contact">Request a consultation <ArrowRight size={16} /></a>
      </div>
    </main>
  );
}