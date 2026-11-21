import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { estimate, inr, DEFAULTS } from "../lib/solar";
import { pct } from "../lib/format";
import { CONNECTION_TYPES, RATE_CARD, normalizeConnectionType, rateFor } from "../data/rates";
import { checkPincode } from "../lib/serviceability";
import { useCityAutofill } from "../lib/useCityAutofill";
import { usePageMeta } from "../lib/seo";
import Picture from "../components/Picture";

export default function Calculator() {
  usePageMeta("Solar calculator", "Estimate your rooftop solar system size, DSP turnkey cost and payback from your PIN code, connection type and monthly bill — with every assumption adjustable.");
  const [q] = useSearchParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(q.get("pincode") || "");
  const { city, onCityChange, suggestion } = useCityAutofill(pin, q.get("city") || "");
  const initialType = normalizeConnectionType(q.get("customerType")) || "Residential";
  const [customerType, setCustomerType] = useState(initialType);
  const sheetRate = rateFor(customerType);
  const [bill, setBill] = useState(q.get("billValue") || "2500");
  const [tariff, setTariff] = useState(q.get("tariff") || String(DEFAULTS.tariff));
  const [yieldRate, setYieldRate] = useState(q.get("yield") || String(DEFAULTS.yieldPerKw));
  const [cost, setCost] = useState(q.get("costPerKw") || String(sheetRate?.perKw ?? DEFAULTS.costPerKw));
  const [area, setArea] = useState(q.get("areaPerKw") || String(DEFAULTS.areaPerKw));
  const [height, setHeight] = useState(q.get("height") || String(RATE_CARD.heightIncludedM));

  const live = estimate({ bill, tariff, yieldPerKw: yieldRate, costPerKw: cost, areaPerKw: area, connectionType: customerType, heightM: height });
  const pinInfo = pin.length === 6 ? checkPincode(pin) : null;
  const rateAdjusted = Boolean(sheetRate) && Math.round(Number(cost)) !== sheetRate.perKw;

  function changeConnectionType(e) {
    const next = e.target.value;
    setCustomerType(next);
    const nextRate = rateFor(next);
    if (nextRate) setCost(String(nextRate.perKw));
  }

  function resetRate() {
    if (sheetRate) setCost(String(sheetRate.perKw));
  }

  function calculate(e) {
    e.preventDefault();
    const params = new URLSearchParams({ pincode: pin, billValue: bill, city, tariff, yield: yieldRate, costPerKw: cost, areaPerKw: area, customerType, height });
    navigate("/solar-calculator/results?" + params.toString());
  }

  return (
    <div className="calculator-page">
      <section className="calculator-heading photo-band">
        <Picture className="band-img" src="/images/banner-a.jpg" alt="" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="band-scrim" />
        <div className="band-copy">
          <span className="eyebrow light">Solar planning tool</span>
          <h1>Calculate a solar estimate for your property.</h1>
          <p>Start with your location, connection type and average electricity bill. We'll show system size, indicative DSP cost, subsidy position for homes and payback — with every assumption visible and adjustable.</p>
        </div>
      </section>
      <form className="savings-card" onSubmit={calculate}>
        <div>
          <div className="savings-intro">
            <span className="eyebrow">DSP solar planning estimate</span>
            <h2>Explore your solar numbers.</h2>
            <p>Enter your PIN code, connection type and average monthly bill. Costs start from DSP's current per-kW rate sheet and stay adjustable.</p>
          </div>
          <div className="savings-inputs">
            <label>PIN code
              <input required pattern="[0-9]{6}" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 411046" />
            </label>
            <label>City
              <input required value={city} onChange={(e) => onCityChange(e.target.value)} placeholder="Auto-fills from PIN" maxLength={100} />
              {suggestion && <small className="field-hint">Filled from PIN {pin} — edit if it's different.</small>}
            </label>
            {pinInfo?.valid && <p className={`pin-note span2 ${pinInfo.serviceable ? "ok" : "check"}`}>{pinInfo.message}</p>}
            <label>Connection type
              <select value={customerType} onChange={changeConnectionType}>
                {CONNECTION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <div className="rate-badge">
              <small>DSP {customerType.toLowerCase()} rate · turnkey, incl. GST</small>
              <strong>{inr(sheetRate?.perKw ?? live.costPerKw)}<span> /kW</span></strong>
            </div>
            <label className="bill-control">Average monthly electricity bill <strong>{inr(bill)}</strong>
              <input className="fill" style={{ "--pct": pct(bill, 500, 50000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="50000" step="100" value={bill} onChange={(e) => setBill(e.target.value)} />
              <small>Use a 12-month average if available.</small>
            </label>
            <details className="assumption-editor">
              <summary>Adjust the estimate assumptions</summary>
              <div className="assumption-fields">
                <label>Average tariff (₹/kWh)<input type="number" min="1" max="100" step="0.5" value={tariff} onChange={(e) => setTariff(e.target.value)} /></label>
                <label>Solar output (kWh/kW/month)<input type="number" min="20" max="250" step="5" value={yieldRate} onChange={(e) => setYieldRate(e.target.value)} /></label>
                <label>System cost (₹/kW)<input type="number" min="10000" max="200000" step="1000" value={cost} onChange={(e) => setCost(e.target.value)} /><small>From the DSP rate sheet; editable for planning.</small></label>
                <label>Roof area (sq ft/kW)<input type="number" min="20" max="200" step="5" value={area} onChange={(e) => setArea(e.target.value)} /></label>
                <label>Installation height (m)<input type="number" min="0" max="120" step="1" value={height} onChange={(e) => setHeight(e.target.value)} /><small>Measured from ground level. Rates include up to 20 m; ₹1,000 per extra metre.</small></label>
                {rateAdjusted && (
                  <button type="button" className="rate-reset" onClick={resetRate}>Reset to DSP rate ({inr(sheetRate.perKw)}/kW)</button>
                )}
                <p className="rate-explainer">Rates are full turnkey — supply, installation, wiring, commissioning and DISCOM liaison — and include GST. Commercial and industrial rooftops use Non-DCR modules, which is why their rate is lower; DCR modules are reserved for subsidy-eligible work.</p>
              </div>
            </details>
            <button className="button primary submit">Calculate my estimate <ArrowRight size={17} /></button>
            <p className="estimate-note">Planning estimate at DSP's current rate sheet — not a quote, savings guarantee, subsidy decision or service availability confirmation. Rates are turnkey and include GST, with no separate transport charge.</p>
          </div>
        </div>
        <aside className="savings-preview">
          <span className="eyebrow">Live preview</span>
          <h3>Indicative system size</h3>
          <div className="preview-stat"><small>System size</small><strong>{live.kw.toFixed(1)} <span>kW</span></strong></div>
          <div className="preview-stat"><small>Roof area needed</small><strong>{Math.round(live.roof)} <span>sq. ft.</span></strong></div>
          <div className="preview-stat"><small>Estimated monthly use</small><strong>{Math.round(live.usage)} <span>kWh</span></strong></div>
          <div className="preview-stat"><small>Indicative turnkey cost</small>{live.needsProposal ? <strong>Site-specific</strong> : <strong>{inr(live.cost)}</strong>}{!live.needsProposal && live.heightSurcharge > 0 && <small className="surcharge-note">includes {inr(live.heightSurcharge)} height charge</small>}</div>
          <p>{live.needsProposal ? "This system is above 200 kW, so DSP prices it in a site-specific proposal after a site review. Your size, usage and roof area above are still planning estimates." : "Updates as you change your bill or assumptions. A site visit is needed to confirm what fits your roof."}</p>
        </aside>
      </form>
      <section className="calculator-how">
        <span className="eyebrow">How this estimate works</span>
        <div className="route-grid">
          <article><span>01</span><h3>Estimate usage</h3><p>Your bill and the tariff assumption estimate monthly electricity consumption.</p></article>
          <article><span>02</span><h3>Size and price</h3><p>The generation assumption sizes the system; the DSP per-kW rate prices it.</p></article>
          <article><span>03</span><h3>Apply subsidy</h3><p>Eligible residential systems show the PM Surya Ghar amount and net cost.</p></article>
          <article><span>04</span><h3>Confirm on site</h3><p>Actual design needs a roof survey, utility details and a confirmed quote.</p></article>
        </div>
      </section>
      <div className="consult-bar">
        <p>Have questions about your estimate? Get a free consultation.</p>
        <a className="button primary" href="/contact">Request a consultation <ArrowRight size={16} /></a>
      </div>
    </div>
  );
}
