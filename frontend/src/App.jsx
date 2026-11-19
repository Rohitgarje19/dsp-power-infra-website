import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, ClipboardCheck, Compass, Factory,
  FileText, House, Layers, LifeBuoy, MapPin, Menu, Phone, RefreshCw, Ruler, ShieldCheck, Sun, Trees, Users, Wrench, X, Zap
} from "lucide-react";

const pct = (v, min, max) => Math.max(0, Math.min(100, ((Number(v) - min) / (max - min)) * 100)) + "%";

const segments = [
  ["Residential", "Home", "A rooftop system designed around your energy use and property.", House, "/homes"],
  ["Shared spaces", "Housing societies", "Solar planning for common-area loads and suitable residential rooftops.", Users, "/housing-societies"],
  ["Commercial", "Business", "Engineering and installation shaped for offices, shops and warehouses.", Building2, "/commercial"],
  ["Industrial", "Solar EPC", "Planning and delivery for larger energy needs.", Factory, "/commercial"]
];

const solutionLinks = [
  ["Home", "/homes", House, "Rooftop solar for your home"],
  ["Housing societies", "/housing-societies", Users, "Shared and common-area loads"],
  ["Commercial", "/commercial", Building2, "Offices, shops and warehouses"],
  ["On-grid solar", "/on-grid-solar", Zap, "Works alongside your utility supply"],
  ["Hybrid solar", "/hybrid-solar", Layers, "Solar, grid and storage options"],
  ["Off-grid solar", "/off-grid-solar", Sun, "Designed around actual loads"]
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="/"><img src="/dsp-logo.jpg" alt="DSP Power Infra" /><span>DSP <b>POWER INFRA</b><small>SOLAR EPC SOLUTIONS</small></span></a>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      <nav className={open ? "open" : ""}>
        <a href="/homes">Home</a>
        <div className="dd">
          <button type="button" className="dd-btn">Solutions <ChevronDown size={15} /></button>
          <div className="dd-menu">
            {solutionLinks.map(([name, url, Icon, desc]) => (
              <a href={url} key={name}><i><Icon /></i><span><b>{name}</b><small>{desc}</small></span></a>
            ))}
          </div>
        </div>
        <a href="/how-it-works">How it works</a>
        <a href="/solar-calculator">Solar tools</a>
        <a href="/service-areas">Service areas</a>
        <a href="/contact" className="nav-cta">Talk to an expert <ArrowUpRight size={15} /></a>
      </nav>
    </header>
  );
}

function HeroArt() {
  const A = [110, 275], rise = [80, -50];
  const pt = (u, v) => [A[0] + u * 360 + v * rise[0], A[1] + v * rise[1]];
  const cols = 6, rows = 3, cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = 0.05 + c * (0.9 / cols) + 0.012, u1 = 0.05 + (c + 1) * (0.9 / cols) - 0.012;
      const v0 = 0.12 + r * (0.76 / rows) + 0.02, v1 = 0.12 + (r + 1) * (0.76 / rows) - 0.02;
      cells.push([pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)].map(p => p.map(n => n.toFixed(1)).join(",")).join(" "));
    }
  }
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, cx = 470, cy = 110;
    return [cx + Math.cos(a) * 62, cy + Math.sin(a) * 62, cx + Math.cos(a) * 82, cy + Math.sin(a) * 82];
  });
  return (
    <svg viewBox="0 0 620 520" role="img" aria-label="Illustration of a house with rooftop solar panels">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdf0cf" /><stop offset="1" stopColor="#e3f1e8" /></linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2b6685" /><stop offset="1" stopColor="#123a52" /></linearGradient>
      </defs>
      <rect width="620" height="520" fill="url(#sky)" />
      {rays.map((r, i) => <line key={i} x1={r[0]} y1={r[1]} x2={r[2]} y2={r[3]} stroke="#e0a82e" strokeWidth="5" strokeLinecap="round" opacity=".55" />)}
      <circle cx="470" cy="110" r="96" fill="#e0a82e" opacity=".12" />
      <circle cx="470" cy="110" r="46" fill="#f2c24f" />
      <g fill="#fff" opacity=".85"><ellipse cx="120" cy="100" rx="52" ry="15" /><ellipse cx="160" cy="88" rx="34" ry="14" /><ellipse cx="300" cy="150" rx="44" ry="12" /><ellipse cx="330" cy="140" rx="26" ry="11" /></g>
      <path d="M0 400 Q120 330 250 380 T500 360 T620 380 V440 H0Z" fill="#b9d8c5" />
      <path d="M0 430 Q160 385 320 420 T620 410 V520 H0Z" fill="#7db592" />
      <rect y="435" width="620" height="85" fill="#5f9d79" />
      <polygon points="300,520 340,520 372,435 330,435" fill="#e9dfc2" opacity=".85" />
      <polygon points="110,275 470,275 470,435 110,435" fill="#fbf7ea" />
      <polygon points="470,275 550,225 550,385 470,435" fill="#e6dec3" />
      <polygon points="110,275 470,275 550,225 190,225" fill="#2c5f4d" />
      <polygon points="110,275 470,275 470,285 110,285" fill="#1d4637" />
      {cells.map((p, i) => <polygon key={i} points={p} fill="url(#panel)" stroke="#a9c7d4" strokeWidth="1" />)}
      <rect x="150" y="318" width="70" height="62" rx="4" fill="#7fb2ad" stroke="#fff" strokeWidth="5" />
      <rect x="260" y="318" width="70" height="62" rx="4" fill="#7fb2ad" stroke="#fff" strokeWidth="5" />
      <rect x="370" y="340" width="62" height="95" rx="4" fill="#9a6e48" stroke="#fff" strokeWidth="5" />
      <circle cx="420" cy="390" r="3" fill="#f2c24f" />
      <polygon points="490,350 530,328 530,368 490,392" fill="#9fc8c2" opacity=".8" />
      <g><rect x="52" y="360" width="10" height="76" fill="#6b4e37" /><circle cx="57" cy="345" r="38" fill="#3f8a63" /><circle cx="40" cy="365" r="26" fill="#4d9a72" /></g>
      <g><rect x="576" y="372" width="9" height="64" fill="#6b4e37" /><circle cx="580" cy="358" r="30" fill="#3f8a63" /></g>
    </svg>
  );
}

function QuickEstimate() {
  const [pin, setPin] = useState(""), [bill, setBill] = useState(3000);
  function go(e) {
    e.preventDefault();
    const p = new URLSearchParams({ pincode: pin, billValue: bill });
    location.href = "/solar-calculator?" + p.toString();
  }
  return (
    <form className="quick-form" onSubmit={go}>
      <label>PIN code<input required pattern="[0-9]{6}" inputMode="numeric" placeholder="e.g. 411046" value={pin} onChange={e => setPin(e.target.value)} /></label>
      <label><b><span>Average monthly bill</span><span>₹{Number(bill).toLocaleString("en-IN")}</span></b>
        <input className="fill" style={{ "--pct": pct(bill, 500, 10000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="10000" step="100" value={bill} onChange={e => setBill(e.target.value)} />
      </label>
      <button className="button primary">Calculate now <ArrowRight size={17} /></button>
    </form>
  );
}

function Enquiry() {
  const [status, setStatus] = useState("idle"), [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();

    // Keep a reference to the form before awaiting the network request.
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: d.fullName,
          phone: d.phone,
          email: d.email || null,
          customerType: d.customerType,
          city: d.city,
          pincode: d.pincode,
          monthlyBill: d.monthlyBill ? Number(d.monthlyBill) : null,
          message: d.message || null,
          source: "website",
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || "We couldn't submit your enquiry. Please try again."
        );
      }

      form.reset();
      setStatus("done");
    } catch (err) {
      console.error("Enquiry submission error:", err);

      setError(
        err instanceof TypeError
          ? "Could not reach the local lead service. This enquiry was not saved. Start the backend and MySQL, then try again."
          : err.message || "This enquiry was not saved. Please try again."
      );

      setStatus("error");
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <span className="eyebrow">LET'S TALK SOLAR</span>
      <h3>Start with a conversation.</h3>
      <p>Tell us about your project and our team will follow up.</p>
      {status === "done" ? (
        <div className="success"><Check /><h4>Thanks, we have your enquiry.</h4><p>The team will be in touch.</p><button type="button" onClick={() => setStatus("idle")}>Send another enquiry</button></div>
      ) : (
        <>
          <div className="fields">
            <label>Full name<input required name="fullName" placeholder="Your name" minLength="2" maxLength="100" /></label>
            <label>Phone<input required name="phone" pattern="[-+0-9 ()]{10,20}" placeholder="+91 98765 43210" /></label>
            <label>Email<input name="email" type="email" placeholder="Optional" maxLength="160" /></label>
            <label>Project type<select name="customerType"><option>Residential</option><option>Commercial</option><option>Industrial</option><option>Housing Society</option><option>Solar Products</option><option>Partnership</option></select></label>
            <label>City<input required name="city" placeholder="Pune" maxLength="100" /></label>
            <label>PIN code<input required name="pincode" pattern="[0-9]{6}" placeholder="6-digit PIN" /></label>
            <label className="wide">Monthly bill<select name="monthlyBill" defaultValue=""><option value="">Choose range</option><option value="1500">Below ₹1,500</option><option value="3000">₹1,500–₹4,000</option><option value="6000">₹4,000–₹8,000</option><option value="10000">Above ₹8,000</option></select></label>
            <label className="wide">Project details<textarea name="message" rows="3" maxLength="1200" placeholder="Anything else we should know?" /></label>
          </div>
          <label className="consent"><input required type="checkbox" /> DSP Power Infra may contact me about this enquiry.</label>
          {status === "error" && <p className="error">{error}</p>}
          <button className="button primary submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Request a consultation"} <ArrowRight size={17} /></button>
          <small className="privacy">Your details will be used to respond to this request.</small>
        </>
      )}
    </form>
  );
}

function Calculator() {
  const [p, P] = useState(250000), [rate, R] = useState(10), [months, M] = useState(60);
  const [emi, total] = useMemo(() => {
    let r = Number(rate) / 1200, n = Number(months), a = Number(p), x = r ? a * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : a / n;
    return [Math.round(x), Math.round(x * n)];
  }, [p, rate, months]);
  return (
    <div className="calculator">
      <div><span className="eyebrow">PLAN AHEAD</span><h3>Estimate a possible solar EMI.</h3><p>Use your own amount, rate and term. This is a loan calculation, not an offer.</p></div>
      <div className="calc-fields">
        <label>Loan amount<div className="money">₹ <input type="number" min="10000" step="5000" value={p} onChange={e => P(e.target.value)} /></div></label>
        <label>Annual interest<div className="range"><input className="fill" style={{ "--pct": pct(rate, 0, 24) }} type="range" min="0" max="24" step=".25" value={rate} onChange={e => R(e.target.value)} /><b>{rate}%</b></div></label>
        <label>Tenure<div className="range"><input className="fill" style={{ "--pct": pct(months, 6, 120) }} type="range" min="6" max="120" step="6" value={months} onChange={e => M(e.target.value)} /><b>{months} mo</b></div></label>
        <div className="answer"><small>Approx. monthly payment</small><strong>₹{emi.toLocaleString("en-IN")}<i>/mo</i></strong><small>Total repayment: ₹{total.toLocaleString("en-IN")}</small></div>
      </div>
      <small className="calc-disclaimer">Indicative only. Final design, price and financing depend on site assessment and lender approval.</small>
    </div>
  );
}

const AUTO_DELETE_DAYS = 15;

function autoDeleteInfo(deletedAt) {
  if (!deletedAt) return null;

  const deletedTime = new Date(deletedAt).getTime();
  if (Number.isNaN(deletedTime)) return null;

  const msLeft = deletedTime + AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000 - Date.now();
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

  if (msLeft <= 0) return { text: "Deleting soon", urgent: true };
  if (daysLeft === 1) return { text: "Auto-deletes in 1 day", urgent: true };

  return { text: `Auto-deletes in ${daysLeft} days`, urgent: daysLeft <= 3 };
}


function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [auth, setAuth] = useState("");

  const [copiedField, setCopiedField] = useState("");

  const [pendingKey, setPendingKey] = useState("");
  const [leavingId, setLeavingId] = useState(null);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const actionLabel = (id, action, idle, busy) =>
    pendingKey === `${id}:${action}` ? (
      <><RefreshCw size={12} className="refresh-spin" /> {busy}</>
    ) : idle;

  async function copyToClipboard(value, field) {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);

    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  } catch (error) {
    setError(`Could not copy ${field}. Please copy it manually.`);
  }
  }

  async function request(path, method = "GET") {
    const response = await fetch(path, {
      method,
      headers: { Authorization: auth, "Content-Type": "application/json" }
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
  }

  async function login(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const credentials = `Basic ${btoa(`${username}:${password}`)}`;
    try {
      const response = await fetch("/api/admin/leads", {
        headers: { Authorization: credentials }
      });
      if (!response.ok) {
        throw new Error(response.status === 401
          ? "Username or password was not accepted."
          : "Admin API is unavailable. Check that the backend and database are running.");
      }
      setAuth(credentials);
      setRows(await response.json());
    } catch (exception) {
      setError(exception.message || "Could not connect to the admin API.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh(showFeedback = true) {
  const started = Date.now();
  if (showFeedback) {
    setRefreshing(true);
  }

  try {
      const latestRows = await request("/api/admin/leads");


      if (showFeedback) {
        const remaining = 700 - (Date.now() - started);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
      }

      setRows(latestRows);

      if (showFeedback) {
        setSelected(null);
      }
    } catch (exception) {
    if (showFeedback) {
      setError(exception.message || "Could not refresh enquiries.");
    }
  } finally {
    if (showFeedback) {
      setRefreshing(false);
    }
  }
  }
  useEffect(() => {
  if (!auth) return;

  const interval = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      refresh(false);
    }
  }, 15000);

  return () => window.clearInterval(interval);
  }, [auth]);

    async function updateLead(id, action) {
    const confirmation = action === "delete"
      ? window.confirm("Move this enquiry to the deleted area? It will remain in the database.")
      : true;
    if (!confirmation) return;

    const started = Date.now();
    setPendingKey(`${id}:${action}`);

    try {
      await request(`/api/admin/leads/${id}/${action}`, "PUT");

      const remaining = 500 - (Date.now() - started);
      if (remaining > 0) await wait(remaining);

      setLeavingId(id);
      await wait(350);
      await refresh(false);
    } catch (exception) {
      setError(exception.message || "Could not update the enquiry.");
    } finally {
      setPendingKey("");
      setLeavingId(null);
    }
  }

  async function permanentlyDelete(id) {
    if (!window.confirm("Permanently delete this enquiry? This cannot be undone.")) return;

    const started = Date.now();
    setPendingKey(`${id}:purge`);

    try {
      await request(`/api/admin/leads/${id}`, "DELETE");

      const remaining = 500 - (Date.now() - started);
      if (remaining > 0) await wait(remaining);

      setLeavingId(id);
      await wait(350);
      await refresh(false);
    } catch (exception) {
      setError(exception.message || "Could not delete the enquiry.");
    } finally {
      setPendingKey("");
      setLeavingId(null);
    }
  }

  const visibleRows = (rows || []).filter((row) => {
    const status = String(row.status || "").toUpperCase();
    const deleted = Boolean(row.deleted);
    const resolved = Boolean(row.resolvedAt) || status.includes("RESOLVED");
    const matchesTab = tab === "active" ? !deleted && !resolved
      : tab === "resolved" ? !deleted && resolved : deleted;
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || [row.fullName, row.email, row.phone, row.city,
      row.customerType, row.message].some((value) => String(value || "").toLowerCase().includes(needle));
    return matchesTab && matchesSearch;
  });

  if (rows === null) {
    return (
      <main className="admin admin-login">
        <a className="admin-back" href="/">← Back to website</a>
        <section className="admin-login-card">
          <img src="/dsp-logo.jpg" alt="DSP Power Infra" />
          <span className="eyebrow">AUTHORIZED TEAM ONLY</span>
          <h1>Enquiry management</h1>
          <p>Sign in using the admin credentials configured for your local environment.</p>
          <form onSubmit={login}>
            <label>Username<input required value={username} autoComplete="username" onChange={(event) => setUsername(event.target.value)} /></label>
            <label>Password<input required type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <p className="error">{error}</p>}
            <button className="button primary" disabled={busy}>{busy ? "Connecting…" : "Sign in securely"} <ArrowRight size={16} /></button>
          </form>
        </section>
      </main>
    );
  }

  const activeCount = rows.filter((row) => !row.deleted && !row.resolvedAt && !String(row.status || "").toUpperCase().includes("RESOLVED")).length;
  const resolvedCount = rows.filter((row) => !row.deleted && (row.resolvedAt || String(row.status || "").toUpperCase().includes("RESOLVED"))).length;
  const deletedCount = rows.filter((row) => row.deleted).length;

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <a href="/" className="admin-brand"><img src="/dsp-logo.jpg" alt="DSP Power Infra" /><span>DSP POWER INFRA<small>ENQUIRY DESK</small></span></a>
        <div><a href="/">Back to website</a><button className="admin-logout" onClick={() => { setRows(null); setPassword(""); setAuth(""); }}>Sign out</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">AUTHORIZED TEAM ONLY</span><h1>Enquiry dashboard</h1><p>Review incoming requests and keep their status up to date.</p></div><button
  className="admin-refresh"
  onClick={() => refresh()}
  disabled={refreshing}
>
  <RefreshCw
    size={15}
    className={refreshing ? "refresh-spin" : ""}
  />
  {refreshing ? "Refreshing..." : "Refresh"}
</button></div>
        <div className="admin-metrics">
          <article><span>Active enquiries</span><strong>{activeCount}</strong><small>Needs follow-up</small></article>
          <article><span>Resolved</span><strong>{resolvedCount}</strong><small>Completed enquiries</small></article>
          <article><span>Deleted</span><strong>{deletedCount}</strong><small>Moved to deleted area</small></article>
          <article><span>Total records</span><strong>{rows.length}</strong><small>Saved in database</small></article>
        </div>
        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>Enquiries</h2><p>Open a record to review its details and contact the customer.</p></div><input className="admin-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, city…" /></div>
          <div className="admin-tabs"><button className={tab === "active" ? "selected" : ""} onClick={() => setTab("active")}>Active <b>{activeCount}</b></button><button className={tab === "resolved" ? "selected" : ""} onClick={() => setTab("resolved")}>Resolved <b>{resolvedCount}</b></button><button className={tab === "deleted" ? "selected" : ""} onClick={() => setTab("deleted")}>Deleted <b>{deletedCount}</b></button></div>
          {tab === "deleted" && (
  <p className="admin-note">
    Deleted enquiries are removed permanently after {AUTO_DELETE_DAYS} days. Restore an enquiry before then to keep it.
  </p>
)}
          {error && <p className="error admin-error">{error}</p>}
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Project</th><th>Location</th><th>Received</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {visibleRows.map((row) => <tr key={row.id} className={leavingId === row.id ? "row-leaving" : ""}>
              <td><button className="admin-customer" onClick={() => setSelected(row)}>{row.fullName || "Unnamed"}</button><small>{row.email || row.phone || "No contact details"}</small></td>
              <td>{row.customerType || "—"}</td><td>{[row.city, row.pincode].filter(Boolean).join(" · ") || "—"}</td>
              <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "—"}</td>
              <td>
  <span className={`admin-status ${row.deleted ? "deleted" : (row.resolvedAt || String(row.status || "").toUpperCase().includes("RESOLVED")) ? "resolved" : "active"}`}>{row.deleted ? "Deleted" : (row.resolvedAt || String(row.status || "").toUpperCase().includes("RESOLVED")) ? "Resolved" : "Active"}</span>
  {tab === "deleted" && autoDeleteInfo(row.deletedAt) && (
    <span className={"auto-delete" + (autoDeleteInfo(row.deletedAt).urgent ? " urgent" : "")}>
      {autoDeleteInfo(row.deletedAt).text}
    </span>
  )}
</td>
              <td><div className="admin-actions"> 
                
                <div className="admin-actions">
  <button onClick={() => setSelected(row)}>Details</button>

  {tab === "active" && (
    <button
      className={pendingKey === `${row.id}:resolve` ? "is-pending" : ""}
      disabled={Boolean(pendingKey)}
      onClick={() => updateLead(row.id, "resolve")}
    >
      {actionLabel(row.id, "resolve", "Resolve", "Resolving...")}
    </button>
  )}

  {(tab === "resolved" || tab === "deleted") && (
    <button
      className={pendingKey === `${row.id}:restore` ? "is-pending" : ""}
      disabled={Boolean(pendingKey)}
      onClick={() => updateLead(row.id, "restore")}
    >
      {actionLabel(row.id, "restore", "Restore", "Restoring...")}
    </button>
  )}

  {tab !== "deleted" && (
    <button
      className={"danger" + (pendingKey === `${row.id}:delete` ? " is-pending" : "")}
      disabled={Boolean(pendingKey)}
      onClick={() => updateLead(row.id, "delete")}
    >
      {actionLabel(row.id, "delete", "Delete", "Deleting...")}
    </button>
  )}

  {tab === "deleted" && (
    <button
      className={"danger" + (pendingKey === `${row.id}:purge` ? " is-pending" : "")}
      disabled={Boolean(pendingKey)}
      onClick={() => permanentlyDelete(row.id)}
    >
      {actionLabel(row.id, "purge", "Delete permanently", "Deleting...")}
    </button>
  )}
</div>
           
                    
              </div></td>
            </tr>)}
            {visibleRows.length === 0 && <tr><td colSpan="6" className="admin-empty">No enquiries found in this section.</td></tr>}
          </tbody></table></div>
        </section>
      </section>
      {selected && <div className="admin-modal-backdrop" onClick={() => setSelected(null)}><section className="admin-detail-modal" onClick={(event) => event.stopPropagation()}><button className="admin-modal-close" onClick={() => setSelected(null)}>×</button><span className="eyebrow">ENQUIRY DETAILS</span><h2>{selected.fullName}</h2><dl>
        <dt>Phone</dt><dd>{selected.phone || "—"}</dd><dt>Email</dt><dd>{selected.email || "—"}</dd><dt>Project type</dt><dd>{selected.customerType || "—"}</dd><dt>Location</dt><dd>{[selected.city, selected.pincode].filter(Boolean).join(", ") || "—"}</dd><dt>Monthly electricity bill</dt><dd>{selected.monthlyBill ? `₹${Number(selected.monthlyBill).toLocaleString("en-IN")}` : "Not provided"}</dd><dt>Project details</dt><dd>{selected.message || "No additional message"}</dd><dt>Source</dt><dd>{selected.source || "Website"}</dd><dt>Received</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-IN") : "—"}</dd>
      </dl>
        <div className="admin-contact-actions">
  {selected.phone && (
    <>
      <a href={`tel:${selected.phone}`}>Call</a>

      <a
        href={`https://wa.me/${normalizePhone(selected.phone)}?text=${encodeURIComponent(
          createCustomerMessage(selected)
        )}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-action"
      >
        WhatsApp
      </a>

      <button
        type="button"
        onClick={() => copyToClipboard(selected.phone, "Phone")}
      >
        {copiedField === "Phone" ? "Copied!" : "Copy phone"}
      </button>
    </>
  )}

  {selected.email && (
    <>
      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          selected.email
        )}&su=${encodeURIComponent(
          "Your enquiry - DSP Power Infra"
        )}&body=${encodeURIComponent(
          createCustomerMessage(selected)
        )}`}
        target="_blank"
        rel="noreferrer"
        className="email-action"
      >
        Open Gmail
      </a>

      <button
        type="button"
        onClick={() => copyToClipboard(selected.email, "Email")}
      >
        {copiedField === "Email" ? "Copied!" : "Copy email"}
      </button>
    </>
  )}
  </div>
      </section></div>}
    </main>
  );
}

const whyItems = [
  [Compass, "Guidance first", "Recommendations based on your needs, with products and costs explained clearly."],
  [Wrench, "One team, start to finish", "Design, supply and installation brought together so you are not juggling vendors."],
  [Ruler, "Planned for your site", "Your roof, shade and energy use shape the system rather than a one-size template."],
  [LifeBuoy, "Support through the project", "A team to guide you and keep you informed from enquiry through installation."]
];

const journey = [
  ["01", "Tell us about your site", "Share your location, bill and goals so we can understand what you need."],
  ["02", "Get a site assessment", "We look at your roof and requirements before recommending anything."],
  ["03", "Review your proposal", "See the scope, assumptions and costs explained clearly, and ask questions."],
  ["04", "Installation and support", "Your project is installed and you stay informed through the project."]
];

function ProcessCard() {
  const move = e => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
    el.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
  };
  const leave = e => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", 0);
    el.style.setProperty("--my", 0);
    el.style.setProperty("--gx", "50%");
    el.style.setProperty("--gy", "50%");
  };
  return (
    <div className="process-card" onMouseMove={move} onMouseLeave={leave}>
      <div className="pc-glow" />
      <div className="pc-layer"><i className="ring r3" /><i className="ring r1" /><i className="ring r2" /></div>
      <div className="pc-sun"><Sun /></div>
      <div className="pc-info">Based in Pune, Maharashtra<small>Design · supply · installation · support</small></div>
    </div>
  );
}

function normalizePhone(phone) {
  let number = String(phone || "").replace(/\D/g, "");

  // Add India's country code when a 10-digit number is provided.
  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
}

function createCustomerMessage(customer) {
  return [
    `Hello ${customer.fullName || "there"},`,
    "",
    "Thank you for contacting DSP Power Infra.",
    "We have received your solar enquiry and our team would be happy to assist you.",
    "",
    "Your enquiry details:",
    `Project type: ${customer.customerType || "Not provided"}`,
    `Location: ${[customer.city, customer.pincode].filter(Boolean).join(", ") || "Not provided"}`,
    `Monthly electricity bill: ${
      customer.monthlyBill
        ? `₹${Number(customer.monthlyBill).toLocaleString("en-IN")}`
        : "Not provided"
    }`,
    `Project details: ${customer.message || "Not provided"}`,
    "",
    "Please let us know a convenient time to discuss your requirements.",
    "",
    "Regards,",
    "DSP Power Infra"
  ].join("\n");
}

function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Solar EPC · Pune, Maharashtra</span>
            <h1>Solar that’s planned around <em>your roof.</em></h1>
            <p className="lede">Solar solutions made clearer, from the first site visit to the day your system goes live.</p>
            <div className="actions"><a className="button primary" href="#contact">Plan your solar project <ArrowRight size={17} /></a><a className="button quiet" href="#solutions">Explore solutions</a></div>
            <p className="caption"><ShieldCheck size={18} /> Clear recommendations. A real team. Support through the journey.</p>
          </div>
          <div className="hero-art">
            <HeroArt />
            <div className="chip chip-a"><i><Zap /></i><b>Made for your roof<small>Designed around your needs</small></b></div>
            <div className="chip chip-b"><i><Check /></i><b>Survey to switch-on<small>One team, every step</small></b></div>
          </div>
        </section>

        <section className="estimate-band">
          <div><span className="eyebrow">Solar planning estimate</span><h2>Calculate your solar numbers</h2><p>Enter your PIN code and average monthly bill to get started.</p></div>
          <QuickEstimate />
        </section>

        <section className="proof">
          <span><i><Sun /></i> Solar products & EPC</span>
          <span><i><Building2 /></i> Residential to industrial</span>
          <span><i><Trees /></i> Design · supply · installation</span>
          <span><i><ShieldCheck /></i> Support through the project</span>
        </section>

        <section className="section" id="solutions">
          <div className="section-head"><div><span className="eyebrow">Solutions for every kind of site</span><h2>Get solar for</h2></div><p>We bring products, engineering and installation together, then shape the system around the people and place using it.</p></div>
          <div className="service-grid">{segments.map(([tag, title, copy, Icon, url]) => (
            <article className="service" key={title}><span className="service-icon"><Icon /></span><small>{tag}</small><h3>{title}</h3><p>{copy}</p><a href={url}>Learn more <ArrowUpRight size={15} /></a></article>
          ))}</div>
        </section>

        <section className="section why-section">
          <div className="section-head"><div><span className="eyebrow">Why DSP Power Infra</span><h2>Why customers choose us</h2></div><p>Going solar is a long-term decision. We make the process easier to understand and keep you informed.</p></div>
          <div className="why-grid">{whyItems.map(([Icon, title, copy]) => (
            <article key={title}><div className="why-art"><Icon /></div><h3>{title}</h3><p>{copy}</p></article>
          ))}</div>
        </section>

        <section className="approach-section" id="about">
          <div className="approach">
            <div><span className="eyebrow">The DSP approach</span><h2>Good decisions come from <em>good guidance.</em></h2><p>We give you a clear view of your options and keep you informed from enquiry through installation.</p><a className="button primary" href="/how-it-works">See how it works <ArrowRight size={16} /></a></div>
            <div className="approach-points">
              <div><i><ClipboardCheck /></i><b>Recommendations based on your needs</b></div>
              <div><i><FileText /></i><b>Product and cost details explained clearly</b></div>
              <div><i><Users /></i><b>A team to guide your project</b></div>
              <div><i><Layers /></i><b>Assumptions shown, never hidden</b></div>
            </div>
            <div className="shield"><ShieldCheck /></div>
          </div>
        </section>

        <section className="section process" id="process">
          <div className="process-layout">
            <div>
              <div className="section-head" style={{ display: "block" }}><span className="eyebrow">From first chat to switch-on</span><h2>We guide the journey. You stay informed.</h2></div>
              <div className="timeline">{journey.map(([n, t, d]) => (
                <article className="tl-step" key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></article>
              ))}</div>
            </div>
            <ProcessCard />
          </div>
        </section>

        <section className="section tools" id="tools">
          <div className="section-head"><div><span className="eyebrow">Solar tools</span><h2>Know your numbers.</h2></div><p>Try a simple EMI estimate. Personalized solar savings will use verified pricing and local policy information.</p></div>
          <Calculator />
          <div className="calc-cta"><a className="button primary" href="/solar-calculator">Estimate solar savings <ArrowRight size={16} /></a><p>Enter your PIN code and monthly bill to see an estimate with adjustable assumptions.</p></div>
        </section>

        <section className="visit-section" style={{ paddingTop: 96 }}>
          <div className="visit">
            <div>
              <span className="eyebrow">Before you decide</span>
              <h2>Talk it through before you commit.</h2>
              <p>Ask questions, understand your options and clear every doubt with the DSP team.</p>
              <ul>
                <li><Check /> Discuss your roof and energy needs</li>
                <li><Check /> Understand product and system options</li>
                <li><Check /> See the assumptions behind every estimate</li>
                <li><Check /> Know the next steps before you proceed</li>
              </ul>
              <a className="button" href="#contact">Book a consultation <ArrowRight size={16} /></a>
            </div>
            <div className="visit-card">
              <h3>What your consultation covers</h3>
              <div className="visit-row"><i><MapPin /></i><b>Your site and location<small>Roof, shade and access</small></b></div>
              <div className="visit-row"><i><Ruler /></i><b>System planning<small>Sizing based on your usage</small></b></div>
              <div className="visit-row"><i><FileText /></i><b>Your proposal<small>Scope, costs and assumptions</small></b></div>
              <div className="visit-row"><i><LifeBuoy /></i><b>Support<small>Guidance through the project</small></b></div>
            </div>
          </div>
        </section>

        <section className="areas">
          <div><span className="eyebrow">Where we work</span><h2>Based in Pune.</h2><p>Coverage depends on project type, team availability and site location. Share your PIN code and we will confirm.</p></div>
          <div className="area-chips"><span><MapPin /> Pune</span><span><MapPin /> Maharashtra</span><span><MapPin /> Other locations</span><a href="/service-areas">Check your area <ArrowRight /></a></div>
        </section>

        <section className="banner"><div><span className="eyebrow">Your next step</span><h2>Start with your roof.<br /><em>We’ll help with the rest.</em></h2></div><a className="button light" href="#contact">Talk to our team <ArrowRight size={16} /></a></section>

        <section className="section contact" id="contact"><div><span className="eyebrow">Tell us what you need</span><h2>Let’s explore what solar can <em>do for you.</em></h2><p>Share a few details and our team will learn about your site and answer your questions.</p><div className="contact-row"><Phone /><a href="tel:+919146467074">+91 91464 67074</a></div><div className="contact-row"><ArrowUpRight /><a href="mailto:dsp.powerinfra@gmail.com">dsp.powerinfra@gmail.com</a></div><p className="availability">Based in Pune. Share your PIN code and we’ll confirm service availability for your location.</p></div><Enquiry /></section>
      </main>
    </>
  );
}

const pageData = {
  "/homes": ["RESIDENTIAL ROOFTOP SOLAR", "Solar for your home, planned around your life.", "Understand your options, share your roof and energy needs, and get a clear next step from the DSP team.", "Start with your bill|Assess the roof|Review the proposal|Plan installation"],
  "/commercial": ["COMMERCIAL SOLAR EPC", "A practical solar plan for your business.", "Explore rooftop and on-site solar for offices, shops, warehouses and other commercial properties.", "Understand demand|Check the site|Review engineering|Plan delivery"],
  "/housing-societies": ["APARTMENTS & HOUSING SOCIETIES", "Solar planning for shared spaces.", "Explore solar for common-area loads, society facilities and suitable residential rooftops—with clear steps for residents.", "Map shared usage|Assess rooftops|Share a clear proposal|Coordinate the project"],
  "/on-grid-solar": ["GRID-CONNECTED SYSTEMS", "On-grid solar, explained clearly.", "A grid-connected system works alongside your utility supply. The right configuration depends on local rules, site conditions and usage.", "Solar panels|Inverter|Utility connection|Site-specific design"],
  "/hybrid-solar": ["SOLAR WITH STORAGE OPTIONS", "Hybrid solar for flexible power planning.", "Hybrid systems combine solar, grid and battery components. Assess backup needs and compatibility before selecting a system.", "Define backup needs|Size storage carefully|Review operating modes|Confirm compatibility"],
  "/off-grid-solar": ["INDEPENDENT POWER SYSTEMS", "Off-grid solar designed around actual loads.", "Off-grid systems need careful demand and storage planning because there is no utility grid acting as backup.", "List daily loads|Plan for low-sun periods|Check site conditions|Review the design"],
  "/how-it-works": ["THE PROJECT JOURNEY", "Clear steps from first enquiry to handover.", "A solar project is easier when decisions, site requirements and next steps are visible from the beginning.", "1 · Tell us about the site|2 · Initial discussion|3 · Survey & proposal|4 · Installation & handover"],
  "/solar-calculator": ["SOLAR PLANNING TOOL", "Start with a simple finance estimate.", "Use this loan estimate to explore monthly repayments. It is not a solar quote or a prediction of savings.", "System price depends on site|Savings depend on generation|Policy can change|Confirm before purchase"],
  "/subsidy-guide": ["SUBSIDY INFORMATION", "Understand the steps before applying.", "Eligibility, approved products and amounts can change. Confirm current requirements before making a purchase decision.", "Check eligibility|Use official channels|Keep project records|Confirm current rules"],
  "/about": ["ABOUT DSP POWER INFRA", "Solar EPC guidance with a local team.", "DSP Power Infra helps customers explore solar products and rooftop EPC solutions with clear conversations and responsible planning.", "Listen first|Explain options|Plan responsibly|Stay in touch"],
  "/projects": ["PROJECTS & WORK", "A growing portfolio, documented honestly.", "Project stories will be added as DSP completes installations and receives approval to share customer details and images.", "Residential rooftops|Business installations|Project lessons|Share your project"],
  "/blog": ["SOLAR RESOURCE LIBRARY", "Useful solar guides, without the guesswork.", "A practical library for understanding systems, project steps, maintenance and current policy. Articles will be reviewed before publication.", "Solar basics|Planning & sizing|Care & maintenance|Policy updates"],
  "/refer-a-friend": ["DSP REFERRALS", "Know someone planning a solar project?", "Tell us who may be interested and ask the DSP team about current referral details. No reward is promised until a program is confirmed.", "Share a referral|Ask permission first|DSP follows up|Any reward terms confirmed directly"],
  "/experience-centre": ["VISIT & CONSULTATION", "See the options and ask your questions.", "Contact DSP to ask about a consultation, product discussion or site visit. Availability and location are confirmed by the team.", "Tell us what you want to see|Choose a suitable time|Discuss your site|Agree next steps"],
  "/webinars": ["LEARN ABOUT SOLAR", "Practical solar sessions for customers and teams.", "Upcoming sessions will appear here once DSP schedules them. Contact us to suggest a topic or request a discussion.", "Solar system basics|How to prepare for a survey|Understanding a proposal|Maintenance and monitoring"],
  "/solar-partners": ["SOLAR PARTNERS", "Work with DSP on solar opportunities.", "For installers, suppliers, professionals and referral partners interested in discussing potential collaboration.", "Introduce your organization|Describe your experience|Share the opportunity|Discuss terms with DSP"],
  "/service-areas": ["SERVICE AREAS", "Check whether DSP can serve your location.", "DSP is based in Pune. Coverage depends on project type, team availability and site location; share your PIN code for confirmation.", "Pune|Maharashtra|Other locations|Availability confirmed case by case"]
};



function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div className="brand"><img src="/dsp-logo.jpg" alt="" /> DSP POWER INFRA</div>
        <div><b>EXPLORE</b><a href="/homes">Home</a><a href="/commercial">Commercial</a><a href="/housing-societies">Housing societies</a><a href="/solar-calculator">Solar calculator</a><a href="/blog">Solar guides</a></div>
        <div><b>CONTACT</b><a href="tel:+919146467074">+91 91464 67074</a><a href="mailto:dsp.powerinfra@gmail.com">dsp.powerinfra@gmail.com</a><span>Pune, Maharashtra</span></div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} DSP Power Infra <a href="/admin">Team sign in <ArrowUpRight size={13} /></a></div>
    </footer>
  );
}

function SavingsCalculator() {
  const q = new URLSearchParams(location.search);
  const [pin, setPin] = useState(q.get("pincode") || ""), [city, setCity] = useState(q.get("city") || ""), [bill, setBill] = useState(q.get("billValue") || "2500"), [tariff, setTariff] = useState(q.get("tariff") || "8"), [yieldRate, setYieldRate] = useState(q.get("yield") || "120"), [cost, setCost] = useState(q.get("costPerKw") || "60000"), [area, setArea] = useState(q.get("areaPerKw") || "80");
  function calculate(e) {
    e.preventDefault();
    const params = new URLSearchParams({ pincode: pin, billValue: bill, city, tariff, yield: yieldRate, costPerKw: cost, areaPerKw: area });
    location.href = "/solar-calculator/results?" + params.toString();
  }
  const usage = Number(bill || 0) / Math.max(1, Number(tariff) || 8);
  const kw = Math.max(0.5, Math.ceil((usage / Math.max(1, Number(yieldRate) || 120)) * 2) / 2);
  const roof = kw * (Number(area) || 80);
  return (
    <form className="savings-card" onSubmit={calculate}>
      <div>
        <div className="savings-intro"><span className="eyebrow">DSP solar planning estimate</span><h2>Explore your solar numbers.</h2><p>Enter your PIN code and average monthly bill. Your result will show the assumptions used so you can adjust them.</p></div>
        <div className="savings-inputs">
          <label>PIN code<input required pattern="[0-9]{6}" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="e.g. 411046" /></label>
          <label>City<input required value={city} onChange={e => setCity(e.target.value)} placeholder="Pune" /></label>
          <label className="bill-control">Average monthly electricity bill <strong>₹{Number(bill || 0).toLocaleString("en-IN")}</strong><input className="fill" style={{ "--pct": pct(bill, 500, 50000) }} aria-label="Average monthly electricity bill" type="range" min="500" max="50000" step="100" value={bill} onChange={e => setBill(e.target.value)} /><small>Use a 12-month average if available.</small></label>
          <details className="assumption-editor"><summary>Adjust the estimate assumptions</summary><div className="assumption-fields"><label>Average tariff (₹/kWh)<input type="number" min="1" max="100" step="0.5" value={tariff} onChange={e => setTariff(e.target.value)} /></label><label>Solar output (kWh/kW/month)<input type="number" min="20" max="250" step="5" value={yieldRate} onChange={e => setYieldRate(e.target.value)} /></label><label>Indicative system cost (₹/kW)<input type="number" min="10000" max="200000" step="1000" value={cost} onChange={e => setCost(e.target.value)} /></label><label>Roof area (sq ft/kW)<input type="number" min="20" max="200" step="5" value={area} onChange={e => setArea(e.target.value)} /></label></div></details>
          <button className="button primary submit">Calculate my estimate <ArrowRight size={17} /></button>
          <p className="estimate-note">Planning estimate only—not a quote, savings guarantee, subsidy decision or service availability confirmation.</p>
        </div>
      </div>
      <aside className="savings-preview">
        <span className="eyebrow">Live preview</span>
        <h3>Indicative system size</h3>
        <div className="preview-stat"><small>System size</small><strong>{kw.toFixed(1)} <span>kW</span></strong></div>
        <div className="preview-stat"><small>Roof area needed</small><strong>{Math.round(roof)} <span>sq. ft.</span></strong></div>
        <div className="preview-stat"><small>Estimated monthly use</small><strong>{Math.round(usage)} <span>kWh</span></strong></div>
        <p>Updates as you change your bill or assumptions. A site visit is needed to confirm what fits your roof.</p>
      </aside>
    </form>
  );
}

function SavingsResults() {
  const q = new URLSearchParams(location.search), bill = Math.max(0, Number(q.get("billValue") || 2500)), tariff = Math.max(1, Number(q.get("tariff") || 8)), yieldRate = Math.max(1, Number(q.get("yield") || 120)), costPerKw = Math.max(0, Number(q.get("costPerKw") || 60000)), areaPerKw = Math.max(0, Number(q.get("areaPerKw") || 80)), usage = bill / tariff, rawKw = usage / yieldRate, capacity = Math.max(.5, Math.ceil(rawKw * 2) / 2), generation = capacity * yieldRate, offset = Math.min(bill, generation * tariff), yearly = offset * 12, investment = capacity * costPerKw, roof = capacity * areaPerKw, payback = yearly ? investment / yearly : 0, scale = Math.min(100, generation / Math.max(usage, generation) * 100), city = q.get("city") || "your location", pin = q.get("pincode") || "";
  return (
    <>
      <Header />
      <main className="results-main">
        <a className="back-link" href={'/solar-calculator?' + q.toString()}>← Edit estimate</a>
        <section className="results-hero">
          <span className="eyebrow">Your solar estimate · {city}{pin ? ' · ' + pin : ''}</span>
          <h1>Here’s a starting point for your roof.</h1>
          <p>These figures are calculated from your bill and the assumptions shown below. A site visit and current local tariff details are needed for a real proposal.</p>
          <div className="result-stats">
            <article><small>Suggested system size</small><strong>{capacity.toFixed(1)} kW</strong><span>Indicative capacity</span></article>
            <article><small>Estimated roof area</small><strong>{Math.round(roof)} sq ft</strong><span>Unshaded area assumption</span></article>
            <article><small>Indicative system cost</small><strong>₹{Math.round(investment).toLocaleString("en-IN")}</strong><span>Before any eligible support</span></article>
          </div>
        </section>
        <section className="results-grid">
          <article className="result-card"><span className="eyebrow">Monthly energy picture</span><h2>Estimated bill offset</h2><div className="energy-bars"><div><span>Current use (estimated)</span><b>{Math.round(usage)} kWh / month</b><i style={{ "--bar": 100 + "%" }} /></div><div><span>Solar generation (estimated)</span><b>{Math.round(generation)} kWh / month</b><i style={{ "--bar": scale + "%" }} /></div></div><p>At the entered tariff, this estimate could offset up to <strong>₹{Math.round(offset).toLocaleString("en-IN")}/month</strong> of the entered bill, before fixed charges, export rules or actual system performance.</p></article>
          <article className="result-card"><span className="eyebrow">Indicative financial view</span><h2>Estimated payback</h2><strong className="payback">About {payback.toFixed(1)} years</strong><p>Simple payback uses the indicative system cost divided by estimated annual bill offset. It excludes financing, maintenance, degradation, tariff changes and taxes.</p><a className="button primary" href="/contact">Discuss this estimate <ArrowRight size={16} /></a></article>
        </section>
        <section className="assumptions result-card"><span className="eyebrow">Assumptions used</span><h2>Change these after a real site review.</h2><div className="assumption-chips"><span>Electricity tariff <b>₹{tariff}/kWh</b></span><span>Solar output <b>{yieldRate} kWh/kW/month</b></span><span>System cost <b>₹{Number(costPerKw).toLocaleString("en-IN")}/kW</b></span><span>Roof area <b>{areaPerKw} sq ft/kW</b></span></div><p>We have not applied a subsidy amount. Eligibility and current rules must be checked for your project. This result does not confirm service coverage.</p></section>
      </main>
      <Footer />
    </>
  );
}

function RoutePage({ data }) {
  const [eyebrow, title, intro, items] = data;
  if (location.pathname === "/solar-calculator") {
    return (
      <>
        <Header />
        <main className="calculator-page">
          <section className="calculator-heading"><span className="eyebrow">{eyebrow}</span><h1>Calculate a solar estimate for your home.</h1><p>Start with your location and average electricity bill. We’ll show you the estimate inputs and what needs to be verified.</p></section>
          <SavingsCalculator />
          <section className="calculator-how"><span className="eyebrow">How this estimate works</span><div className="route-grid">
            <article><span>01</span><h3>Estimate usage</h3><p>Your bill and the tariff assumption estimate monthly electricity consumption.</p></article>
            <article><span>02</span><h3>Size the system</h3><p>The generation assumption estimates a rounded system capacity and roof area.</p></article>
            <article><span>03</span><h3>Review costs</h3><p>Indicative cost and payback use the assumptions displayed in your results.</p></article>
            <article><span>04</span><h3>Confirm on site</h3><p>Actual design needs a roof survey, utility details and a confirmed quote.</p></article>
          </div></section>
          <div className="consult-bar"><p>Have questions about your estimate? Talk to our team.</p><a className="button primary" href="/contact">Request a consultation <ArrowRight size={16} /></a></div>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <main>
        <section className="route-hero">
          <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="lede">{intro}</p><div className="actions"><a className="button primary" href="/contact">Talk to our team <ArrowRight size={16} /></a><a className="button quiet" href="/how-it-works">How it works</a></div></div>
          <div className="route-art"><div className="route-sun" /><div className="route-panel"><i /><i /><i /><i /><i /><i /></div><span>Thoughtful solar planning<small>Design · delivery · support</small></span></div>
        </section>
        <section className="section route-content">
          <div className="section-head"><div><span className="eyebrow">What to expect</span><h2>Make the next decision<br />with better information.</h2></div><p>{intro}</p></div>
          <div className="route-grid">{items.split("|").map((item, i) => <article key={item}><span>0{i + 1}</span><h3>{item}</h3><p>{["Start with the property, energy use and project priorities.", "Site conditions and requirements shape the right next step.", "We explain the assumptions and scope for your review.", "Confirm details and availability with the team before proceeding."][i]}</p></article>)}</div>
        </section>
        <section className="banner"><div><span className="eyebrow">Have a project in mind?</span><h2>Let’s talk through<br /><em>your site and needs.</em></h2></div><a className="button light" href="/contact">Request a consultation <ArrowRight size={16} /></a></section>
      </main>
      <Footer />
    </>
  );
}

function ContactRoute() {
  return (
    <>
      <Header />
      <main>
        <section className="section contact route-contact"><div><span className="eyebrow">Tell us what you need</span><h2>Let’s explore what solar can <em>do for you.</em></h2><p>Share a few details and our team will learn about your site and answer your questions.</p><div className="contact-row"><Phone /><a href="tel:+919146467074">+91 91464 67074</a></div><div className="contact-row"><ArrowUpRight /><a href="mailto:dsp.powerinfra@gmail.com">dsp.powerinfra@gmail.com</a></div><p className="availability">Based in Pune. Share your PIN code and we’ll confirm service availability for your location.</p></div><Enquiry /></section>
      </main>
      <Footer />
    </>
  );
}

function HomeRoute() {
  return (
    <>
      <Home />
      <section className="route-links"><b>EXPLORE DSP POWER INFRA</b><div>{[["Home", "/homes"], ["Commercial", "/commercial"], ["Housing societies", "/housing-societies"], ["On-grid solar", "/on-grid-solar"], ["Hybrid solar", "/hybrid-solar"], ["Off-grid solar", "/off-grid-solar"], ["How it works", "/how-it-works"], ["Solar calculator", "/solar-calculator"], ["Subsidy guide", "/subsidy-guide"], ["Projects", "/projects"], ["Service areas", "/service-areas"], ["Solar guides", "/blog"], ["Refer a friend", "/refer-a-friend"], ["Experience centre", "/experience-centre"], ["Webinars", "/webinars"], ["Solar partners", "/solar-partners"], ["About DSP", "/about"], ["Contact", "/contact"]].map(([n, u]) => <a href={u} key={u}>{n}<ArrowUpRight size={14} /></a>)}</div></section>
      <Footer />
    </>
  );
}

export default function App() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  useEffect(() => {
    const nodes = document.querySelectorAll("main section,.service,.route-grid article");
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    nodes.forEach(node => { node.classList.add("reveal"); observer.observe(node); });
    return () => observer.disconnect();
  }, [path]);
  if (path === "/admin") return <Admin />;
  if (path === "/contact") return <ContactRoute />;
  if (path === "/solar-calculator/results") return <SavingsResults />;
  if (pageData[path]) return <RoutePage data={pageData[path]} />;
  if (path === "/") return <HomeRoute />;
  return <><Header /><main><section className="route-hero"><div><span className="eyebrow">PAGE NOT FOUND</span><h1>Let’s get you back on track.</h1><a className="button primary" href="/">Go to home <ArrowRight size={16} /></a></div></section></main><Footer /></>;
}
