# DSP Power Infra — Test Cases (written alongside implementation)

Rule: every feature is merged **with its tests in the same commit**. IDs below map to the day in `IMPLEMENTATION_PLAN.md`.
Tooling: Backend → JUnit 5 + Spring Boot Test + MockMvc + H2 (MySQL mode) · Frontend → Vitest + React Testing Library · E2E → Playwright.

Status legend: ☐ not written · ◐ written, failing · ✅ passing

---

## Day 1 — Calculator, subsidy, serviceability, lead form (frontend unit/component)

### TC-CALC — solar math (`lib/solar.js`, pure functions)
| ID | Case | Input | Expected |
|---|---|---|---|
| TC-CALC-01 ☐ | Usage from bill | bill ₹2400, tariff ₹8/kWh | 300 kWh/month |
| TC-CALC-02 ☐ | System sizing rounds up to 0.5 kW | 300 kWh, yield 120 kWh/kW/mo | 2.5 kW |
| TC-CALC-03 ☐ | Minimum capacity floor | bill ₹500, tariff ₹10 | ≥ 0.5 kW, never 0/negative |
| TC-CALC-04 ☐ | Bill offset capped at bill | generation×tariff > bill | offset = bill (no negative bills) |
| TC-CALC-05 ☐ | Payback | cost ₹60k/kW, 2.5 kW, offset ₹2400/mo | 150000 / 28800 ≈ 5.2 years |
| TC-CALC-06 ☐ | Zero/invalid inputs | bill=0, tariff=0, yield="" | no NaN/Infinity rendered; safe defaults |
| TC-CALC-07 ☐ | EMI formula | ₹250000, 10%, 60 mo | ₹5,312/mo (±1), total ≈ ₹3,18,708 |
| TC-CALC-08 ☐ | EMI zero interest | ₹120000, 0%, 60 mo | ₹2,000/mo exactly |

### TC-SUB — PM Surya Ghar subsidy (`lib/subsidy.js`) — *verify slabs before launch*
| ID | Case | Input | Expected |
|---|---|---|---|
| TC-SUB-01 ☐ | 1 kW residential | 1 kW | ₹30,000 |
| TC-SUB-02 ☐ | 2 kW residential | 2 kW | ₹60,000 |
| TC-SUB-03 ☐ | 3 kW residential | 3 kW | ₹78,000 (cap) |
| TC-SUB-04 ☐ | Above cap | 5 kW, 10 kW | ₹78,000 (cap) |
| TC-SUB-05 ☐ | Non-residential | commercial/society segment | ₹0 + "not eligible" note shown |
| TC-SUB-06 ☐ | Results page integration | 3 kW, ₹60k/kW | net cost ₹1,02,000; payback recomputed on net cost; disclaimer visible |

### TC-SVC — serviceability
| ID | Case | Input | Expected |
|---|---|---|---|
| TC-SVC-01 ☐ | Serviceable PIN | 411046 (Pune prefix configured) | "Serviceable" state, CTA enabled |
| TC-SVC-02 ☐ | Unknown PIN | 999999 | "We'll confirm availability" state — lead still submittable, flagged |
| TC-SVC-03 ☐ | Invalid PIN | 12345, abcdef, empty | inline validation error, no API call |
| TC-SVC-04 ☐ | API down | fetch rejects | graceful fallback message, form not blocked |

### TC-FORM — lead form component
| ID | Case | Steps | Expected |
|---|---|---|---|
| TC-FORM-01 ☐ | Happy path | fill valid fields + consent, mock 201 | success state, form reset, POST body has all fields + source |
| TC-FORM-02 ☐ | Required validation | submit empty | native/field errors; no fetch |
| TC-FORM-03 ☐ | Phone pattern | "12345", "abcdefghij" | rejected; "+91 98765 43210" accepted |
| TC-FORM-04 ☐ | PIN pattern | 5 digits / letters | rejected |
| TC-FORM-05 ☐ | Consent required | valid fields, unchecked consent | blocked |
| TC-FORM-06 ☐ | Server 422 | mock 422 with field errors | field-level messages, no raw JSON shown |
| TC-FORM-07 ☐ | Network failure | mock fetch TypeError | human message "not saved, try again", data NOT cleared |
| TC-FORM-08 ☐ | Double submit | click twice while sending | button disabled, exactly 1 POST |
| TC-FORM-09 ☐ | Context prefill | arrive from calculator results | bill/PIN/city prefilled; source=`calculator` in payload |
| TC-FORM-10 ☐ | UTM capture | URL has utm_source/medium/campaign | included in payload |

---

## Day 2 — Backend API + admin + notifications + SEO

### TC-API — lead REST API (MockMvc + H2)
| ID | Case | Request | Expected |
|---|---|---|---|
| TC-API-01 ☐ | Create lead | valid POST /api/leads | 201, persisted row, createdAt set, status ACTIVE |
| TC-API-02 ☐ | Validation: blank name | fullName="" | 422 + `{code:"VALIDATION_ERROR", errors:[...]}` |
| TC-API-03 ☐ | Validation: bad phone/pin/email | each invalid | 422 with field name in error |
| TC-API-04 ☐ | Optional fields | email/message/monthlyBill null | 201, nulls stored |
| TC-API-05 ☐ | Boundary sizes | name 100 chars ok / 101 fail; message 1200 ok / 1201 fail | per constraint |
| TC-API-06 ☐ | monthlyBill bounds | -1 → 422; 10,000,001 → 422; 0 → 201 |
| TC-API-07 ☐ | Trim + normalize | "  Name  ", " 411046 " | trimmed values stored |
| TC-API-08 ☐ | Honeypot filled | hidden field non-empty | 201-looking response but NOT persisted (silent drop) |
| TC-API-09 ☐ | Rate limit | 6+ POSTs/min same IP | 429 with retry hint; other IPs unaffected |
| TC-API-10 ☐ | Admin list unauthenticated | GET /api/admin/leads no auth | 401 |
| TC-API-11 ☐ | Admin list wrong role/password | bad Basic creds | 401, no data leak |
| TC-API-12 ☐ | Admin list + filter + pagination | ?status=ACTIVE&page=0&size=20 | 200, correct slice, newest first, total count |
| TC-API-13 ☐ | State transitions | resolve → restore → delete → restore → DELETE | resolvedAt set/cleared, deleted flag + deletedAt set/cleared, final purge 204 then 404 |
| TC-API-14 ☐ | Unknown id | PUT/DELETE /api/admin/leads/999999/* | 404 typed error, consistent JSON |
| TC-API-15 ☐ | CSV export | GET /api/admin/leads/export.csv as admin | 200 text/csv, header row + all rows, proper escaping of commas/quotes |
| TC-API-16 ☐ | Notes | PATCH notes then GET | note persisted, length-capped |
| TC-API-17 ☐ | Auto-purge job | seed lead deletedAt = 16 days ago, run `DeletedLeadCleanup` | purged; 14-day-old kept; active/resolved untouched |
| TC-API-18 ☐ | Health/ready | GET /api/health, actuator health | 200 `{"status":"ok"}`; ready reflects DB |

### TC-NOTIF — new-lead email
| ID | Case | Expected |
|---|---|---|
| TC-NOTIF-01 ☐ | SMTP ok (mocked sender) | one email with name/phone/city/bill/source |
| TC-NOTIF-02 ☐ | SMTP failure | lead STILL saved (201), error logged, no user-facing failure |
| TC-NOTIF-03 ☐ | No PII in logs | notification log line has leadId only, not phone/email |

### TC-ADM — admin UI (RTL, mocked API)
| ID | Case | Expected |
|---|---|---|
| TC-ADM-01 ☐ | Login success/failure | success → dashboard; 401 → "not accepted" message, stays on login |
| TC-ADM-02 ☐ | Tabs + counts | Active/Resolved/Deleted partition rows correctly incl. legacy RESOLVED status |
| TC-ADM-03 ☐ | Search | matches name/phone/city/type/message, case-insensitive; empty state row |
| TC-ADM-04 ☐ | Resolve/restore/delete/purge | correct endpoint+method called, confirm dialog on destructive ops, row moves tab |
| TC-ADM-05 ☐ | Detail modal | all fields shown; WhatsApp link = wa.me/91XXXXXXXXXX with prefilled text; tel: and Gmail links correct; copy buttons |
| TC-ADM-06 ☐ | Auto-delete badge | deletedAt 14 days ago → "1 day", urgent styling; 16 days ago → "Deleting soon" |
| TC-ADM-07 ☐ | Polling | interval fires only when tab visible; cleared on sign-out (no leak/duplicate timers) |
| TC-ADM-08 ☐ | Sign out | credentials cleared, login screen, subsequent fetches unauthenticated |
| TC-ADM-09 ☐ | Notes + export | note save round-trip; export button hits CSV endpoint |

### TC-SEO
| ID | Case | Expected |
|---|---|---|
| TC-SEO-01 ☐ | Per-route meta | each route sets unique title + description |
| TC-SEO-02 ☐ | sitemap.xml / robots.txt | served, lists all public routes, excludes /admin |
| TC-SEO-03 ☐ | JSON-LD | valid LocalBusiness schema on home/contact |
| TC-SEO-04 ☐ | SPA deep links | direct load of /homes, /solar-calculator/results?... returns app (nginx fallback) — verified again in TC-DEP-05 |

---

## Day 3 — End-to-end (Playwright, against Dockerized stack)

| ID | Journey | Steps | Expected |
|---|---|---|---|
| TC-E2E-01 ☐ | Visitor → lead | home → hero CTA → fill form → submit | success message; row in DB via admin API |
| TC-E2E-02 ☐ | Calculator journey | home quick-estimate (PIN+bill) → calculator → adjust assumptions → results → "Discuss this estimate" | results math matches inputs; form prefilled; lead source=calculator |
| TC-E2E-03 ☐ | Shareable results | copy results URL, open in new context | identical numbers rendered |
| TC-E2E-04 ☐ | Admin lifecycle | login → see E2E-01 lead → add note → resolve → restore → delete → restore → purge | each state visible in correct tab; gone after purge |
| TC-E2E-05 ☐ | Mobile viewport (390×844) | nav drawer, calculator sliders, form submit, sticky CTA, admin table | no overflow/overlap; all controls reachable |
| TC-E2E-06 ☐ | Resilience | stop API container, submit form; restart, submit again | clear "not saved" error then success; no duplicate lead on retry |
| TC-E2E-07 ☐ | Repeated navigation | visit all 18+ routes twice via nav links | no console errors, no duplicate observers/timers, scroll resets |

---

## Day 4 — Deployment smoke (production)

| ID | Check | Expected |
|---|---|---|
| TC-DEP-01 ☐ | HTTPS + redirect | http→https 301; valid cert; HSTS header |
| TC-DEP-02 ☐ | Health | /api/health 200 from public URL |
| TC-DEP-03 ☐ | Real lead from phone (mobile data) + desktop | both saved, team email received |
| TC-DEP-04 ☐ | Admin over HTTPS | login works; http admin blocked; wrong password 401; default dev password rejected |
| TC-DEP-05 ☐ | SPA deep links + assets | /homes, /blog/x, /solar-calculator/results load; images/fonts cached (cache headers), gzip/brotli on |
| TC-DEP-06 ☐ | Rate limit live | burst POSTs → 429 |
| TC-DEP-07 ☐ | Backup + restore drill | nightly dump exists; restore into scratch DB, row counts match |
| TC-DEP-08 ☐ | Restart resilience | `docker compose restart` → site back <60s, data intact; uptime monitor alerts on down |

---

## Regression rule
Before every deploy: run all three suites (`mvn test`, `npm test`, `npx playwright test`). Any ☐ on a shipped feature or any failing test blocks the deploy. Update statuses in this file in the same PR as the implementation.