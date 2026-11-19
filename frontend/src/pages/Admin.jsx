import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, RefreshCw, Save } from "lucide-react";

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

function normalizePhone(phone) {
  let number = String(phone || "").replace(/\D/g, "");
  if (number.length === 10) number = `91${number}`;
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
    `Monthly electricity bill: ${customer.monthlyBill ? `₹${Number(customer.monthlyBill).toLocaleString("en-IN")}` : "Not provided"}`,
    `Project details: ${customer.message || "Not provided"}`,
    "",
    "Please let us know a convenient time to discuss your requirements.",
    "",
    "Regards,",
    "DSP Power Infra",
  ].join("\n");
}

const isResolved = (row) => Boolean(row.resolvedAt) || String(row.status || "").toUpperCase().includes("RESOLVED");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [auth, setAuth] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const [leavingId, setLeavingId] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const actionLabel = (id, action, idle, busyText) =>
    pendingKey === `${id}:${action}` ? (<><RefreshCw size={12} className="refresh-spin" /> {busyText}</>) : idle;

  async function copyToClipboard(value, field) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      setError(`Could not copy ${field}. Please copy it manually.`);
    }
  }

  async function request(path, method = "GET", body) {
    const response = await fetch(path, {
      method,
      headers: { Authorization: auth, "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      let message = "";
      try { const data = await response.json(); message = data.message || ""; } catch { /* non-JSON error */ }
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
      const response = await fetch("/api/admin/leads", { headers: { Authorization: credentials } });
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
    if (showFeedback) setRefreshing(true);
    try {
      const latestRows = await request("/api/admin/leads");
      if (showFeedback) {
        const remaining = 700 - (Date.now() - started);
        if (remaining > 0) await wait(remaining);
      }
      setRows(latestRows);
      if (showFeedback) setSelected(null);
    } catch (exception) {
      if (showFeedback) setError(exception.message || "Could not refresh enquiries.");
    } finally {
      if (showFeedback) setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!auth) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh(false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [auth]);

  useEffect(() => {
    setNotes(selected?.notes || "");
    setNotesSaved(false);
  }, [selected]);

  async function updateLead(id, action) {
    const confirmation = action === "delete"
      ? window.confirm("Move this enquiry to the deleted area? It can be restored within 15 days.")
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
      setSelected(null);
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
      setSelected(null);
      await refresh(false);
    } catch (exception) {
      setError(exception.message || "Could not delete the enquiry.");
    } finally {
      setPendingKey("");
      setLeavingId(null);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    setError("");
    try {
      const updated = await request(`/api/admin/leads/${selected.id}/notes`, "PATCH", { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
      if (updated) {
        setRows((prev) => (prev || []).map((row) => (row.id === updated.id ? updated : row)));
        setSelected(updated);
        setNotes(updated.notes || "");
      }
    } catch (exception) {
      setError(exception.message || "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads/export.csv", { headers: { Authorization: auth } });
      if (!response.ok) throw new Error(`Export failed (${response.status})`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dsp-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (exception) {
      setError(exception.message || "Could not export enquiries.");
    } finally {
      setExporting(false);
    }
  }

  const visibleRows = (rows || []).filter((row) => {
    const deleted = Boolean(row.deleted);
    const resolved = isResolved(row);
    const matchesTab = tab === "active" ? !deleted && !resolved
      : tab === "resolved" ? !deleted && resolved : deleted;
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || [row.fullName, row.email, row.phone, row.city,
      row.customerType, row.message, row.source].some((value) => String(value || "").toLowerCase().includes(needle));
    return matchesTab && matchesSearch;
  });

  if (rows === null) {
    return (
      <main className="admin admin-login">
        <Link className="admin-back" to="/">← Back to website</Link>
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

  const activeCount = rows.filter((row) => !row.deleted && !isResolved(row)).length;
  const resolvedCount = rows.filter((row) => !row.deleted && isResolved(row)).length;
  const deletedCount = rows.filter((row) => row.deleted).length;

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <Link to="/" className="admin-brand"><img src="/dsp-logo.jpg" alt="DSP Power Infra" /><span>DSP POWER INFRA<small>ENQUIRY DESK</small></span></Link>
        <div><Link to="/">Back to website</Link><button className="admin-logout" onClick={() => { setRows(null); setPassword(""); setAuth(""); }}>Sign out</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-heading">
          <div><span className="eyebrow">AUTHORIZED TEAM ONLY</span><h1>Enquiry dashboard</h1><p>Review incoming requests and keep their status up to date.</p></div>
          <div className="admin-heading-actions">
            <button className="admin-refresh" onClick={exportCsv} disabled={exporting}>
              <Download size={15} /> {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button className="admin-refresh" onClick={() => refresh()} disabled={refreshing}>
              <RefreshCw size={15} className={refreshing ? "refresh-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="admin-metrics">
          <article><span>Active enquiries</span><strong>{activeCount}</strong><small>Needs follow-up</small></article>
          <article><span>Resolved</span><strong>{resolvedCount}</strong><small>Completed enquiries</small></article>
          <article><span>Deleted</span><strong>{deletedCount}</strong><small>Moved to deleted area</small></article>
          <article><span>Total records</span><strong>{rows.length}</strong><small>Saved in database</small></article>
        </div>
        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>Enquiries</h2><p>Open a record to review its details and contact the customer.</p></div><input className="admin-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, city, source…" aria-label="Search enquiries" /></div>
          <div className="admin-tabs">
            <button className={tab === "active" ? "selected" : ""} onClick={() => setTab("active")}>Active <b>{activeCount}</b></button>
            <button className={tab === "resolved" ? "selected" : ""} onClick={() => setTab("resolved")}>Resolved <b>{resolvedCount}</b></button>
            <button className={tab === "deleted" ? "selected" : ""} onClick={() => setTab("deleted")}>Deleted <b>{deletedCount}</b></button>
          </div>
          {tab === "deleted" && (
            <p className="admin-note">Deleted enquiries are removed permanently after {AUTO_DELETE_DAYS} days. Restore an enquiry before then to keep it.</p>
          )}
          {error && <p className="error admin-error">{error}</p>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Customer</th><th>Project</th><th>Location</th><th>Source</th><th>Received</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className={leavingId === row.id ? "row-leaving" : ""}>
                    <td><button className="admin-customer" onClick={() => setSelected(row)}>{row.fullName || "Unnamed"}</button><small>{row.email || row.phone || "No contact details"}</small></td>
                    <td>{row.customerType || "—"}</td>
                    <td>{[row.city, row.pincode].filter(Boolean).join(" · ") || "—"}</td>
                    <td><span className="admin-source">{row.source || "website"}</span></td>
                    <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td>
                      <span className={`admin-status ${row.deleted ? "deleted" : isResolved(row) ? "resolved" : "active"}`}>{row.deleted ? "Deleted" : isResolved(row) ? "Resolved" : "Active"}</span>
                      {tab === "deleted" && autoDeleteInfo(row.deletedAt) && (
                        <span className={"auto-delete" + (autoDeleteInfo(row.deletedAt).urgent ? " urgent" : "")}>{autoDeleteInfo(row.deletedAt).text}</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button onClick={() => setSelected(row)}>Details</button>
                        {tab === "active" && (
                          <button className={pendingKey === `${row.id}:resolve` ? "is-pending" : ""} disabled={Boolean(pendingKey)} onClick={() => updateLead(row.id, "resolve")}>
                            {actionLabel(row.id, "resolve", "Resolve", "Resolving...")}
                          </button>
                        )}
                        {(tab === "resolved" || tab === "deleted") && (
                          <button className={pendingKey === `${row.id}:restore` ? "is-pending" : ""} disabled={Boolean(pendingKey)} onClick={() => updateLead(row.id, "restore")}>
                            {actionLabel(row.id, "restore", "Restore", "Restoring...")}
                          </button>
                        )}
                        {tab !== "deleted" && (
                          <button className={"danger" + (pendingKey === `${row.id}:delete` ? " is-pending" : "")} disabled={Boolean(pendingKey)} onClick={() => updateLead(row.id, "delete")}>
                            {actionLabel(row.id, "delete", "Delete", "Deleting...")}
                          </button>
                        )}
                        {tab === "deleted" && (
                          <button className={"danger" + (pendingKey === `${row.id}:purge` ? " is-pending" : "")} disabled={Boolean(pendingKey)} onClick={() => permanentlyDelete(row.id)}>
                            {actionLabel(row.id, "purge", "Delete permanently", "Deleting...")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && <tr><td colSpan="7" className="admin-empty">No enquiries found in this section.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="admin-detail-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Enquiry details">
            <button className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <span className="eyebrow">ENQUIRY DETAILS</span>
            <h2>{selected.fullName}</h2>
            <dl>
              <dt>Phone</dt><dd>{selected.phone || "—"}</dd>
              <dt>Email</dt><dd>{selected.email || "—"}</dd>
              <dt>Project type</dt><dd>{selected.customerType || "—"}</dd>
              <dt>Location</dt><dd>{[selected.city, selected.pincode].filter(Boolean).join(", ") || "—"}</dd>
              <dt>Monthly electricity bill</dt><dd>{selected.monthlyBill ? `₹${Number(selected.monthlyBill).toLocaleString("en-IN")}` : "Not provided"}</dd>
              <dt>Project details</dt><dd>{selected.message || "No additional message"}</dd>
              <dt>Source</dt><dd>{selected.source || "Website"}{selected.sourcePage ? ` · ${selected.sourcePage}` : ""}</dd>
              {(selected.utmSource || selected.utmMedium || selected.utmCampaign) && (
                <><dt>Campaign</dt><dd>{[selected.utmSource, selected.utmMedium, selected.utmCampaign].filter(Boolean).join(" / ")}</dd></>
              )}
              <dt>Received</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-IN") : "—"}</dd>
            </dl>
            <div className="admin-notes">
              <label htmlFor="lead-notes">Internal notes</label>
              <textarea id="lead-notes" rows={3} maxLength={2000} value={notes} placeholder="Call outcomes, follow-up dates, site details…" onChange={(event) => setNotes(event.target.value)} />
              <button type="button" className="admin-notes-save" onClick={saveNotes} disabled={savingNotes}>
                <Save size={14} /> {savingNotes ? "Saving…" : notesSaved ? "Saved" : "Save notes"}
              </button>
            </div>
            <div className="admin-contact-actions">
              {selected.phone && (
                <>
                  <a href={`tel:${selected.phone}`}>Call</a>
                  <a href={`https://wa.me/${normalizePhone(selected.phone)}?text=${encodeURIComponent(createCustomerMessage(selected))}`} target="_blank" rel="noreferrer" className="whatsapp-action">WhatsApp</a>
                  <button type="button" onClick={() => copyToClipboard(selected.phone, "Phone")}>{copiedField === "Phone" ? "Copied!" : "Copy phone"}</button>
                </>
              )}
              {selected.email && (
                <>
                  <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selected.email)}&su=${encodeURIComponent("Your enquiry - DSP Power Infra")}&body=${encodeURIComponent(createCustomerMessage(selected))}`} target="_blank" rel="noreferrer" className="email-action">Open Gmail</a>
                  <button type="button" onClick={() => copyToClipboard(selected.email, "Email")}>{copiedField === "Email" ? "Copied!" : "Copy email"}</button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}