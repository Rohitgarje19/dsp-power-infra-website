import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BadgeIndianRupee, ShieldCheck } from "lucide-react";
import { estimate, inr } from "../lib/solar";
import { afterSubsidy, isSubsidyEligible } from "../lib/subsidy";
import { RATE_CARD, normalizeConnectionType, rateFor } from "../data/rates";
import { usePageMeta } from "../lib/seo";
import Picture from "../components/Picture";

export default function Results() {
  usePageMeta("Your solar estimate", "Your indicative rooftop solar estimate: system size, DSP rate, subsidy position, cost, bill offset and payback — with all assumptions shown.");
  const [q] = useSearchParams();
  const requestedType = q.get("customerType") || "Residential";
  const customerType = normalizeConnectionType(requestedType) || requestedType;
  const e = estimate({
    bill: q.get("billValue") || 2500,
    tariff: q.get("tariff") || 8,
    yieldPerKw: q.get("yield") || 120,
    costPerKw: q.get("costPerKw") || undefined,
    areaPerKw: q.get("areaPerKw") || 80,
    connectionType: customerType,
    heightM: q.get("height") || RATE_CARD.heightIncludedM,
  });
  const rate = rateFor(customerType);
  const rateAdjusted = Boolean(rate) && Math.round(e.costPerKw) !== rate.perKw;
  const sub = afterSubsidy(e.cost, e.kw, e.yearly, customerType);
  const city = q.get("city") || "your location";
  const pin = q.get("pincode") || "";
  const scale = Math.min(100, (e.generation / Math.max(e.usage, e.generation)) * 100);

  const contactParams = new URLSearchParams({
    pincode: pin,
    city: q.get("city") || "",
    billValue: String(Math.round(e.bill)),
    source: "calculator",
    customerType,
    systemKw: e.kw.toFixed(1),
    estimateCost: String(Math.round(e.cost)),
  });

  return (
    <div className="results-main">
      <Link className="back-link" to={"/solar-calculator?" + q.toString()}>← Edit estimate</Link>
      <section className="results-hero photo-band">
        <Picture className="band-img" src="/images/banner-c.jpg" alt="" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="band-scrim" />
        <div className="band-copy">
          <span className="eyebrow light">Your solar estimate · {city}{pin ? " · " + pin : ""}</span>
          <h1>Here's a starting point for your roof.</h1>
          <p>These figures are calculated from your bill, connection type and the assumptions shown below. A site visit and current local tariff details are needed for a real proposal.</p>
          <div className="result-stats">
            <article><small>Suggested system size</small><strong>{e.kw.toFixed(1)} kW</strong><span>Indicative capacity</span></article>
            <article><small>Estimated roof area</small><strong>{Math.round(e.roof)} sq ft</strong><span>Unshaded area assumption</span></article>
            <article><small>Indicative system cost</small><strong>{inr(e.cost)}</strong><span>{e.rateSupported ? e.connectionType + " rate" : "Custom rate"} · before support</span></article>
          </div>
        </div>
      </section>

      <section className="results-grid">
        <article className="result-card">
          <span className="eyebrow">Monthly energy picture</span>
          <h2>Estimated bill offset</h2>
          <div className="energy-bars">
            <div><span>Current use (estimated)</span><b>{Math.round(e.usage)} kWh / month</b><i style={{ "--bar": "100%" }} /></div>
            <div><span>Solar generation (estimated)</span><b>{Math.round(e.generation)} kWh / month</b><i style={{ "--bar": scale + "%" }} /></div>
          </div>
          <p>At the entered tariff, this estimate could offset up to <strong>{inr(e.offset)}/month</strong> of the entered bill, before fixed charges, export rules or actual system performance.</p>
        </article>

        <article className="result-card subsidy-card">
          <span className="eyebrow"><BadgeIndianRupee size={14} /> PM Surya Ghar</span>
          <h2>{isSubsidyEligible(customerType) ? "Estimated subsidy" : "Subsidy position"}</h2>
          {isSubsidyEligible(customerType) ? (
            <>
              <strong className="payback subsidy-amount">{inr(sub.subsidy)}</strong>
              <dl className="subsidy-math">
                <div><dt>Indicative cost</dt><dd>{inr(e.cost)}</dd></div>
                {e.heightSurcharge > 0 && <div><dt>Height above 20 m</dt><dd>+ {inr(e.heightSurcharge)}</dd></div>}
                <div><dt>Estimated subsidy</dt><dd>− {inr(sub.subsidy)}</dd></div>
                <div><dt>Net cost after subsidy</dt><dd>{inr(sub.net)}</dd></div>
                <div><dt>Payback on net cost</dt><dd>About {sub.payback.toFixed(1)} years</dd></div>
              </dl>
              <p className="subsidy-note"><ShieldCheck size={15} /> Slabs: ₹30,000/kW for the first 2 kW + ₹18,000 for the third kW, capped at ₹78,000. Eligibility and current rules must be verified on the official portal — this is not a sanction.</p>
            </>
          ) : (
            <p>The PM Surya Ghar residential subsidy does not apply to {customerType.toLowerCase()} projects. {rate ? `This estimate uses the DSP ${customerType.toLowerCase()} turnkey rate of ${inr(rate.perKw)}/kW.` : "Pricing for this project type is confirmed in a custom proposal."} Your savings come from self-consumption; ask us about applicable commercial benefits.</p>
          )}
        </article>
      </section>

      <section className="results-grid">
        <article className="result-card">
          <span className="eyebrow">Indicative financial view</span>
          <h2>Estimated payback (gross)</h2>
          <strong className="payback">About {e.payback.toFixed(1)} years</strong>
          <dl className="subsidy-math cost-math">
            <div><dt>{e.rateSupported ? e.connectionType + " rate" : "System rate"}</dt><dd>{inr(e.costPerKw)}/kW</dd></div>
            <div><dt>Billable capacity</dt><dd>{e.billableKw.toFixed(1)} kW</dd></div>
            {e.heightSurcharge > 0 && <div><dt>Height above 20 m</dt><dd>+ {inr(e.heightSurcharge)}</dd></div>}
            <div><dt>Indicative system cost</dt><dd>{inr(e.cost)}</dd></div>
          </dl>
          <p>Simple payback uses the indicative system cost divided by estimated annual bill offset. It excludes financing, maintenance, degradation, tariff changes and taxes.</p>
          <Link className="button primary" to={"/contact?" + contactParams.toString()}>Discuss this estimate <ArrowRight size={16} /></Link>
        </article>
        <article className="result-card">
          <span className="eyebrow">Next step</span>
          <h2>Turn the estimate into a proposal.</h2>
          <p>A survey confirms roof area, shadows, sanctioned load and metering rules — then you get a written proposal with real components and prices. Your estimate details travel with your enquiry.</p>
          <Link className="button quiet" to="/subsidy-guide">Read the subsidy guide <ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="assumptions result-card">
        <span className="eyebrow">Assumptions used</span>
        <h2>Change these after a real site review.</h2>
        <div className="assumption-chips">
          <span>Connection <b>{e.connectionType}</b></span>
          <span>System rate <b>{inr(e.costPerKw)}/kW</b></span>
          <span>Electricity tariff <b>₹{e.tariff}/kWh</b></span>
          <span>Solar output <b>{e.yieldPerKw} kWh/kW/month</b></span>
          <span>Roof area <b>{e.areaPerKw} sq ft/kW</b></span>
          {e.heightSurcharge > 0 && <span>Installation height <b>{e.heightM} m (+{inr(e.heightSurcharge)})</b></span>}
        </div>
        <p>Turnkey rates come from DSP's current per-kW rate sheet and apply up to 20 m height; above that ₹1,000 per extra metre. {rateAdjusted ? `The rate was manually adjusted from the DSP ${customerType.toLowerCase()} rate of ${inr(rate.perKw)}/kW. ` : ""}Planning estimate — eligibility and current rules must be checked for your project. This result does not confirm service coverage.</p>
      </section>
    </div>
  );
}
