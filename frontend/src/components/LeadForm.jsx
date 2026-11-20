import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { postLead, getErrorMessage, fieldErrors } from "../lib/api";
import { readUtm } from "../lib/seo";
import { checkPincode } from "../lib/serviceability";
import { useCityAutofill } from "../lib/useCityAutofill";

const BILL_OPTIONS = [
  ["", "Choose range"],
  ["1500", "Below ₹1,500"],
  ["3000", "₹1,500 – ₹4,000"],
  ["6000", "₹4,000 – ₹8,000"],
  ["10000", "Above ₹8,000"],
];

export default function LeadForm({ source = "website", defaults = {}, heading = "Start with a conversation.", eyebrow = "LET'S TALK SOLAR", intro = "Tell us about your project and our team will follow up." }) {
  const { pathname } = useLocation();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [pin, setPin] = useState(defaults.pincode || "");
  const { city, onCityChange, resetCity } = useCityAutofill(pin, defaults.city || "");

  const pinInfo = pin.length === 6 ? checkPincode(pin) : null;

  async function submit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    setFields({});
    try {
      await postLead({
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        customerType: d.customerType,
        city: d.city,
        pincode: d.pincode,
        monthlyBill: d.monthlyBill ? Number(d.monthlyBill) : null,
        message: d.message || null,
        source,
        sourcePage: pathname,
        website: d.website || "",
        ...readUtm(),
      });
      form.reset();
      setPin("");
      resetCity();
      setStatus("done");
    } catch (err) {
      setFields(fieldErrors(err));
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="form-card" role="status">
        <div className="success">
          <Check />
          <h4>Thanks, we have your enquiry.</h4>
          <p>The team will be in touch. Keep your phone handy — we usually call within a working day.</p>
          <button type="button" onClick={() => setStatus("idle")}>Send another enquiry</button>
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate={false}>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{heading}</h3>
      <p>{intro}</p>
      <div className="fields">
        <label>Full name
          <input required name="fullName" placeholder="Your name" minLength={2} maxLength={100} defaultValue={defaults.fullName || ""} />
          {fields.fullName && <small className="field-error">{fields.fullName}</small>}
        </label>
        <label>Phone
          <input required name="phone" pattern="[0-9+\(\)\- ]{10,20}" placeholder="+91 98765 43210" defaultValue={defaults.phone || ""} />
          {fields.phone && <small className="field-error">{fields.phone}</small>}
        </label>
        <label>Email
          <input name="email" type="email" placeholder="Optional" maxLength={160} defaultValue={defaults.email || ""} />
          {fields.email && <small className="field-error">{fields.email}</small>}
        </label>
        <label>Project type
          <select name="customerType" defaultValue={defaults.customerType || "Residential"}>
            <option>Residential</option><option>Commercial</option><option>Industrial</option>
            <option>Housing Society</option><option>Solar Products</option><option>Partnership</option>
          </select>
        </label>
        <label>City
          <input
            required
            name="city"
            placeholder="Pune"
            maxLength={100}
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
          {fields.city && <small className="field-error">{fields.city}</small>}
        </label>
        <label>PIN code
          <input required name="pincode" pattern="[0-9]{6}" inputMode="numeric" placeholder="6-digit PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          {fields.pincode && <small className="field-error">{fields.pincode}</small>}
        </label>
        <label className="wide">Monthly bill
          <select name="monthlyBill" defaultValue={defaults.monthlyBill || ""}>
            {BILL_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="wide">Project details
          <textarea name="message" rows={3} maxLength={1200} placeholder="Anything else we should know?" defaultValue={defaults.message || ""} />
        </label>
      </div>
      {pinInfo?.valid && (
        <p className={`pin-note ${pinInfo.serviceable ? "ok" : "check"}`}>
          <MapPin size={15} /> {pinInfo.message}
        </p>
      )}
      {/* Honeypot — humans never see or fill this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
      <label className="consent">
        <input required type="checkbox" />
        <span>I agree to the <Link to="/terms">Terms of Use</Link> and <Link to="/privacy">Privacy Policy</Link>, and allow DSP Power Infra to contact me about this enquiry.</span>
      </label>
      {status === "error" && <p className="error" role="alert">{error}</p>}
      <button className="button primary submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Request a consultation"} <ArrowRight size={17} />
      </button>
      <small className="privacy">Your details are used only to respond to this request.</small>
    </form>
  );
}