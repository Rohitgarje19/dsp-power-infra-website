import { useMemo, useState } from "react";
import { emi, inr } from "../lib/solar";
import { pct } from "../lib/format";

export default function EmiCalculator() {
  const [p, setP] = useState(250000);
  const [rate, setRate] = useState(10);
  const [months, setMonths] = useState(60);
  const { monthly, total } = useMemo(() => emi(p, rate, months), [p, rate, months]);
  return (
    <div className="calculator">
      <div>
        <span className="eyebrow">Plan ahead</span>
        <h3>Estimate a possible solar EMI.</h3>
        <p>Use your own amount, rate and term. This is a loan calculation, not an offer.</p>
      </div>
      <div className="calc-fields">
        <label>Loan amount
          <div className="money">₹ <input type="number" min="10000" step="5000" value={p} onChange={(e) => setP(e.target.value)} aria-label="Loan amount" /></div>
        </label>
        <label>Annual interest
          <div className="range">
            <input className="fill" style={{ "--pct": pct(rate, 0, 24) }} type="range" min="0" max="24" step=".25" value={rate} onChange={(e) => setRate(e.target.value)} aria-label="Annual interest rate" />
            <b>{rate}%</b>
          </div>
        </label>
        <label>Tenure
          <div className="range">
            <input className="fill" style={{ "--pct": pct(months, 6, 120) }} type="range" min="6" max="120" step="6" value={months} onChange={(e) => setMonths(e.target.value)} aria-label="Tenure in months" />
            <b>{months} mo</b>
          </div>
        </label>
        <div className="answer">
          <small>Approx. monthly payment</small>
          <strong>{inr(monthly)}<i>/mo</i></strong>
          <small>Total repayment: {inr(total)}</small>
        </div>
      </div>
      <small className="calc-disclaimer">Indicative only. Final design, price and financing depend on site assessment and lender approval.</small>
    </div>
  );
}