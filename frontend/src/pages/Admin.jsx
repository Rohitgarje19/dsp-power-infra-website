import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Download, Eye, EyeOff, Mail, RefreshCw, Save, Send, Trash2 } from "lucide-react";
import { useDialog } from "../lib/useDialog";
import { usePageMeta } from "../lib/seo";

const AUTO_DELETE_DAYS = 15;
const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

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

function notificationStatus(settings) {
  if (!settings) return null;
  if (!settings.smtpConfigured) {
    return {
      tone: "warn",
      title: "Email alerts are not switched on yet.",
      text: "You can add inboxes now. A developer still needs to add the mail server details on the server before messages can be delivered.",
    };
  }
  if (!settings.notificationsEnabled) {
    return {
      tone: "warn",
      title: "Email alerts are switched off on the server.",
      text: "The mail server is set up, but sending is turned off. Ask a developer to enable it.",
    };
  }
  return {
    tone: "ok",
    title: "Email alerts are on.",
    text: "Every new enquiry is emailed to each active address below.",
  };
}

export default function Admin() {
  usePageMeta("Enquiry dashboard", "Private enquiry management desk for the DSP Power Infra team.", { noindex: true });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ active: 0, resolved: 0, deleted: 0 });
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [auth, setAuth] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const [leavingId, setLeavingId] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifySettings, setNotifySettings] = useState(null);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState("");
  const [notifyNotice, setNotifyNotice] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientLabel, setRecipientLabel] = useState("");
  const [addingRecipient, setAddingRecipient] = useState(false);
  const [recipientBusyId, setRecipientBusyId] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const detailRef = useRef(null);
  const notesLeadIdRef = useRef(null);
  const closeDetail = useCallback(() => setSelected(null), []);
  useDialog(Boolean(selected), closeDetail, detailRef);

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

  async function request(path, method = "GET", body, credentials = auth) {
    const response = await fetch(path, {
      method,
      headers: {
        ...(credentials ? { Authorization: credentials } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      let message = "";
      try {
        const data = await response.json();
        message = data.errors?.[0]?.message || data.message || "";
      } catch { /* non-JSON error */ }
      throw new Error(message || `Request failed (${response.status})`);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function filterParams({ paged = true } = {}) {
    const params = new URLSearchParams();
    params.set("status", tab);
    if (search.trim()) params.set("q", search.trim());
    if (source) params.set("source", source);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (paged) {
      params.set("page", String(page));
      params.set("size", String(PAGE_SIZE));
    }
    return params;
  }

  function applyPayload(data, { keepSelection = false } = {}) {
    setRows(Array.isArray(data?.items) ? data.items : []);
    setTotal(Number(data?.total) || 0);
    setCounts(data?.counts || { active: 0, resolved: 0, deleted: 0 });
    setSources(Array.isArray(data?.sources) ? data.sources : []);
    if (!keepSelection) setSelectedIds(new Set());
  }

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!auth) return;
    try {
      const data = await request("/api/admin/leads?" + filterParams().toString());
      // An action emptied the last page — step back instead of showing a blank table.
      if (Array.isArray(data?.items) && data.items.length === 0 && Number(data.total) > 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      applyPayload(data);
      if (!silent) setError("");
    } catch (exception) {
      if (!silent) setError(exception.message || "Could not refresh enquiries.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, tab, search, source, from, to, page]);

  useEffect(() => {
    if (!auth) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, tab, search, source, from, to, page]);

  useEffect(() => {
    if (!auth) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true });
    }, 15000);
    return () => window.clearInterval(interval);
  }, [auth, load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setNotes(selected?.notes || "");
    // Saving notes refreshes `selected` with the same lead; keep the "Saved" cue in that case.
    const nextId = selected?.id ?? null;
    if (notesLeadIdRef.current !== nextId) {
      notesLeadIdRef.current = nextId;
      setNotesSaved(false);
    }
  }, [selected]);

  async function login(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const credentials = `Basic ${btoa(`${username}:${password}`)}`;
    try {
      const response = await fetch(`/api/admin/leads?status=active&page=1&size=${PAGE_SIZE}`, {
        headers: { Authorization: credentials },
      });
      if (!response.ok) {
        let message = "";
        try { message = (await response.json()).message || ""; } catch { /* non-JSON error */ }
        if (response.status === 401) {
          throw new Error("Username or password was not accepted.");
        }
        if (response.status === 429) {
          throw new Error(message || "Too many failed sign-in attempts. Please wait and try again.");
        }
        throw new Error("Admin API is unavailable. Check that the backend and database are running.");
      }
      const data = await response.json();
      setTab("active");
      setPage(1);
      setAuth(credentials);
      applyPayload(data);
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
      await load({ silent: !showFeedback });
      if (showFeedback) {
        const remaining = 700 - (Date.now() - started);
        if (remaining > 0) await wait(remaining);
        setSelected(null);
      }
    } catch (exception) {
      if (showFeedback) setError(exception.message || "Could not refresh enquiries.");
    } finally {
      if (showFeedback) setRefreshing(false);
    }
  }

  function changeTab(next) {
    setTab(next);
    setPage(1);
    setSelectedIds(new Set());
    setNotice("");
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSource("");
    setFrom("");
    setTo("");
    setPage(1);
  }

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
      await load({ silent: true });
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
      await load({ silent: true });
    } catch (exception) {
      setError(exception.message || "Could not delete the enquiry.");
    } finally {
      setPendingKey("");
      setLeavingId(null);
    }
  }

  async function applyBulk(action) {
    if (selectedIds.size === 0) return;
    const label = {
      resolve: "resolved",
      restore: "restored",
      delete: "moved to deleted",
      purge: "permanently deleted",
    }[action];
    if (action === "delete" && !window.confirm(`Move ${selectedIds.size} enquiries to the deleted area? They can be restored within 15 days.`)) return;
    if (action === "purge" && !window.confirm(`Permanently delete ${selectedIds.size} enquiries? This cannot be undone.`)) return;
    setBulkBusy(true);
    setError("");
    try {
      const result = await request("/api/admin/leads/bulk", "POST", { ids: [...selectedIds], action });
      setNotice(`${result.updated} ${result.updated === 1 ? "enquiry" : "enquiries"} ${label}.`);
      setTimeout(() => setNotice(""), 4000);
      setSelectedIds(new Set());
      await load({ silent: true });
    } catch (exception) {
      setError(exception.message || "Could not update the selected enquiries.");
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleAll() {
    if (!rows) return;
    setSelectedIds((previous) => {
      const allSelected = rows.length > 0 && rows.every((row) => previous.has(row.id));
      return allSelected ? new Set() : new Set(rows.map((row) => row.id));
    });
  }

  function toggleOne(id) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
      const response = await fetch("/api/admin/leads/export.csv?" + filterParams({ paged: false }).toString(), {
        headers: { Authorization: auth },
      });
      if (!response.ok) throw new Error(`Export failed (${response.status})`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dsp-leads-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
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

  async function loadNotifySettings() {
    setNotifyLoading(true);
    setNotifyError("");
    try {
      const data = await request("/api/admin/notification-recipients");
      setNotifySettings({
        items: Array.isArray(data?.items) ? data.items : [],
        notificationsEnabled: Boolean(data?.notificationsEnabled),
        smtpConfigured: Boolean(data?.smtpConfigured),
        fallbackRecipient: data?.fallbackRecipient || null,
        maxRecipients: Number(data?.maxRecipients) || 20,
      });
    } catch (exception) {
      setNotifyError(exception.message || "Could not load the email recipients.");
    } finally {
      setNotifyLoading(false);
    }
  }

  function toggleNotifyPanel() {
    const next = !notifyOpen;
    setNotifyOpen(next);
    setNotifyError("");
    setNotifyNotice("");
    if (next && !notifySettings) loadNotifySettings();
  }

  async function addRecipient(event) {
    event.preventDefault();
    const email = recipientEmail.trim();
    if (!email) return;
    setAddingRecipient(true);
    setNotifyError("");
    setNotifyNotice("");
    try {
      const created = await request("/api/admin/notification-recipients", "POST", {
        email,
        label: recipientLabel.trim() || null,
      });
      setNotifySettings((previous) => ({
        ...(previous || { items: [], maxRecipients: 20 }),
        items: [...(previous?.items || []), created],
      }));
      setRecipientEmail("");
      setRecipientLabel("");
      setNotifyNotice(`${created.email} will get an email for every new enquiry.`);
    } catch (exception) {
      setNotifyError(exception.message || "Could not add this email address.");
    } finally {
      setAddingRecipient(false);
    }
  }

  async function toggleRecipient(recipient) {
    setRecipientBusyId(recipient.id);
    setNotifyError("");
    setNotifyNotice("");
    try {
      const updated = await request(`/api/admin/notification-recipients/${recipient.id}`, "PATCH", {
        active: !recipient.active,
      });
      setNotifySettings((previous) => ({
        ...previous,
        items: (previous?.items || []).map((item) => (item.id === updated.id ? updated : item)),
      }));
      setNotifyNotice(
        updated.active
          ? `${updated.email} will get new enquiry emails again.`
          : `${updated.email} will stop receiving new enquiry emails.`,
      );
    } catch (exception) {
      setNotifyError(exception.message || "Could not update this recipient.");
    } finally {
      setRecipientBusyId(null);
    }
  }

  async function removeRecipient(recipient) {
    if (!window.confirm(`Stop sending enquiry emails to ${recipient.email}?`)) return;
    setRecipientBusyId(recipient.id);
    setNotifyError("");
    setNotifyNotice("");
    try {
      await request(`/api/admin/notification-recipients/${recipient.id}`, "DELETE");
      setNotifySettings((previous) => ({
        ...previous,
        items: (previous?.items || []).filter((item) => item.id !== recipient.id),
      }));
      setNotifyNotice(`${recipient.email} was removed from enquiry emails.`);
    } catch (exception) {
      setNotifyError(exception.message || "Could not remove this recipient.");
    } finally {
      setRecipientBusyId(null);
    }
  }

  async function sendTestEmail() {
    setTestingEmail(true);
    setNotifyError("");
    setNotifyNotice("");
    try {
      const result = await request("/api/admin/notification-recipients/test", "POST");
      if (Number(result?.sent) > 0) {
        setNotifyNotice(result.message || "Test email sent.");
      } else {
        setNotifyError(result?.message || "No test email was sent.");
      }
    } catch (exception) {
      setNotifyError(exception.message || "Could not send a test email.");
    } finally {
      setTestingEmail(false);
    }
  }

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
            <div className="password-field">
              <label htmlFor="admin-password">Password</label>
              <span className="password-control">
                <input id="admin-password" required type={showPassword ? "text" : "password"} value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </div>
            {error && <p className="error">{error}</p>}
            <button className="button primary" disabled={busy}>{busy ? "Connecting…" : "Sign in securely"} <ArrowRight size={16} /></button>
          </form>
        </section>
      </main>
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastIndex = Math.min(total, page * PAGE_SIZE);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const hasFilters = Boolean(search.trim() || source || from || to);
  const emailStatus = notificationStatus(notifySettings);

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <Link to="/" className="admin-brand"><img src="/dsp-logo.jpg" alt="DSP Power Infra" /><span>DSP POWER INFRA<small>ENQUIRY DESK</small></span></Link>
        <div><Link to="/">Back to website</Link><button className="admin-logout" onClick={() => { setRows(null); setPassword(""); setAuth(""); setNotifyOpen(false); setNotifySettings(null); setNotifyError(""); setNotifyNotice(""); }}>Sign out</button></div>
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
          <article><span>Active enquiries</span><strong>{counts.active}</strong><small>Needs follow-up</small></article>
          <article><span>Resolved</span><strong>{counts.resolved}</strong><small>Completed enquiries</small></article>
          <article><span>Deleted</span><strong>{counts.deleted}</strong><small>Moved to deleted area</small></article>
          <article><span>Total records</span><strong>{counts.active + counts.resolved + counts.deleted}</strong><small>Saved in database</small></article>
        </div>
        <section className="admin-panel admin-notify">
          <div className="admin-panel-head">
            <div>
              <h2>Email alerts for new enquiries</h2>
              <p>Choose which inboxes receive every new enquiry — add a Gmail or company address for each person who should know.</p>
            </div>
            <button type="button" className="admin-refresh" onClick={toggleNotifyPanel} aria-expanded={notifyOpen} aria-controls="email-recipients">
              <Mail size={15} /> {notifyOpen ? "Hide recipients" : "Email recipients"}
            </button>
          </div>
          {notifyOpen && (
            <div id="email-recipients" className="admin-notify-body">
              {notifyLoading && !notifySettings && <p className="admin-empty">Loading email settings…</p>}
              {notifyError && <p className="error admin-error" role="alert">{notifyError}</p>}
              {notifyNotice && <p className="admin-notice" role="status">{notifyNotice}</p>}
              {notifySettings && (
                <>
                  {emailStatus && (
                    <div className={`notify-status ${emailStatus.tone}`} role="status">
                      <b>{emailStatus.title}</b>
                      <p>{emailStatus.text}</p>
                    </div>
                  )}
                  {notifySettings.fallbackRecipient && (
                    <p className="notify-fallback">Server default inbox: <b>{notifySettings.fallbackRecipient}</b> — always included.</p>
                  )}
                  <ul className="recipient-list" aria-label="Email recipients">
                    {notifySettings.items.map((recipient) => (
                      <li key={recipient.id}>
                        <div className="recipient-who">
                          <b>{recipient.email}</b>
                          {recipient.label && <span>{recipient.label}</span>}
                        </div>
                        <span className={`recipient-state ${recipient.active ? "" : "off"}`}>
                          {recipient.active ? "Active" : "Paused"}
                        </span>
                        <div className="recipient-actions">
                          <button type="button" onClick={() => toggleRecipient(recipient)} disabled={recipientBusyId === recipient.id}>
                            {recipientBusyId === recipient.id ? "Saving…" : recipient.active ? "Pause" : "Resume"}
                          </button>
                          <button type="button" className="danger" onClick={() => removeRecipient(recipient)} disabled={recipientBusyId === recipient.id} aria-label={`Remove ${recipient.email}`}>
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </li>
                    ))}
                    {notifySettings.items.length === 0 && (
                      <li className="recipient-empty">No inboxes added yet. Add the first one below.</li>
                    )}
                  </ul>
                  <form className="recipient-form" onSubmit={addRecipient}>
                    <label>Email address
                      <input type="email" required maxLength={254} value={recipientEmail} placeholder="name@example.com" onChange={(event) => setRecipientEmail(event.target.value)} />
                    </label>
                    <label>Who is this? (optional)
                      <input maxLength={80} value={recipientLabel} placeholder="e.g. Rohit — sales" onChange={(event) => setRecipientLabel(event.target.value)} />
                    </label>
                    <button className="button primary" disabled={addingRecipient}>{addingRecipient ? "Adding…" : "Add recipient"}</button>
                  </form>
                  <p className="notify-help">Up to {notifySettings.maxRecipients} addresses. Each one gets its own copy of every new enquiry. You can pause someone without deleting their address.</p>
                  <div className="notify-test">
                    <button type="button" className="admin-refresh" onClick={sendTestEmail} disabled={testingEmail || !notifySettings.smtpConfigured || !notifySettings.notificationsEnabled}>
                      <Send size={14} /> {testingEmail ? "Sending…" : "Send test email"}
                    </button>
                    <span>
                      {notifySettings.smtpConfigured && notifySettings.notificationsEnabled
                        ? "Confirms delivery to the active addresses above."
                        : "Available once the mail server is switched on."}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>Enquiries</h2><p>Open a record to review its details and contact the customer.</p></div><input className="admin-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, phone, city, source…" aria-label="Search enquiries" /></div>
          <div className="admin-tabs">
            <button className={tab === "active" ? "selected" : ""} onClick={() => changeTab("active")}>Active <b>{counts.active}</b></button>
            <button className={tab === "resolved" ? "selected" : ""} onClick={() => changeTab("resolved")}>Resolved <b>{counts.resolved}</b></button>
            <button className={tab === "deleted" ? "selected" : ""} onClick={() => changeTab("deleted")}>Deleted <b>{counts.deleted}</b></button>
          </div>
          <div className="admin-filters">
            <label>Source
              <select value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} aria-label="Filter by source">
                <option value="">All sources</option>
                {sources.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>From
              <input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} aria-label="Received from date" />
            </label>
            <label>To
              <input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} aria-label="Received to date" />
            </label>
            {hasFilters && <button type="button" className="admin-filter-clear" onClick={clearFilters}>Clear filters</button>}
          </div>
          {tab === "deleted" && (
            <p className="admin-note">Deleted enquiries are removed permanently after {AUTO_DELETE_DAYS} days. Restore an enquiry before then to keep it.</p>
          )}
          {error && <p className="error admin-error" role="alert">{error}</p>}
          {notice && <p className="admin-notice" role="status">{notice}</p>}
          {selectedIds.size > 0 && (
            <div className="admin-bulk" role="region" aria-label="Bulk actions">
              <span>{selectedIds.size} selected</span>
              <div>
                {tab === "active" && (
                  <button onClick={() => applyBulk("resolve")} disabled={bulkBusy}>Resolve selected</button>
                )}
                {tab !== "active" && (
                  <button onClick={() => applyBulk("restore")} disabled={bulkBusy}>Restore selected</button>
                )}
                {tab !== "deleted" && (
                  <button className="danger" onClick={() => applyBulk("delete")} disabled={bulkBusy}>Move to deleted</button>
                )}
                {tab === "deleted" && (
                  <button className="danger" onClick={() => applyBulk("purge")} disabled={bulkBusy}>Delete permanently</button>
                )}
                <button onClick={() => setSelectedIds(new Set())} disabled={bulkBusy}>Clear selection</button>
              </div>
            </div>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-select-col">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all enquiries on this page" />
                  </th>
                  <th>Customer</th><th>Project</th><th>Location</th><th>Source</th><th>Received</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={leavingId === row.id ? "row-leaving" : ""}>
                    <td className="admin-select-col">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} aria-label={`Select ${row.fullName || "enquiry"}`} />
                    </td>
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
                {rows.length === 0 && <tr><td colSpan="8" className="admin-empty">No enquiries found in this section{hasFilters ? " for these filters" : ""}.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <span>Showing {firstIndex}–{lastIndex} of {total}</span>
            <div>
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
              <span>Page {page} of {pageCount}</span>
              <button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} aria-label="Next page"><ChevronRight size={15} /></button>
            </div>
          </div>
        </section>
      </section>
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="admin-detail-modal" ref={detailRef} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Enquiry details">
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
            <div className="admin-lifecycle">
              <span>Enquiry status</span>
              <div>
                {!selected.deleted && !isResolved(selected) && (
                  <button type="button" disabled={Boolean(pendingKey)} onClick={() => updateLead(selected.id, "resolve")}>
                    {actionLabel(selected.id, "resolve", "Mark resolved", "Resolving...")}
                  </button>
                )}
                {(selected.deleted || isResolved(selected)) && (
                  <button type="button" disabled={Boolean(pendingKey)} onClick={() => updateLead(selected.id, "restore")}>
                    {actionLabel(selected.id, "restore", selected.deleted ? "Restore enquiry" : "Reopen enquiry", "Restoring...")}
                  </button>
                )}
                {selected.deleted ? (
                  <button type="button" className="danger" disabled={Boolean(pendingKey)} onClick={() => permanentlyDelete(selected.id)}>
                    {actionLabel(selected.id, "purge", "Delete permanently", "Deleting...")}
                  </button>
                ) : (
                  <button type="button" className="danger" disabled={Boolean(pendingKey)} onClick={() => updateLead(selected.id, "delete")}>
                    {actionLabel(selected.id, "delete", "Move to deleted", "Deleting...")}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
