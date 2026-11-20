# DSP Power Infra — Test Cases (written alongside implementation)

Rule: every feature is merged **with its tests in the same commit**. IDs below map to the day in `IMPLEMENTATION_PLAN.md`.
Tooling: Backend → JUnit 5 + Spring Boot Test + MockMvc + H2 (MySQL mode) · Frontend → Vitest + React Testing Library · E2E → Playwright.

Status legend: ☐ not written · ◐ written, failing · ✅ passing

**Status snapshot (2026-11-20):** Backend 90/90 JUnit tests pass (`mvn test`), frontend 127/127 Vitest tests pass (`npm test`), Playwright E2E 6/6 specs pass (`npm run test:e2e`), production build clean, mobile Lighthouse home 94/100/100/100 and calculator 93/100/100/100 (performance/accessibility/best-practices/SEO). The Day 1–4 tables below are the original planning catalogue; implemented test IDs live in `backend/src/test`, `frontend/src/**/__tests__` and `frontend/e2e` (some IDs evolved during implementation — the test files are the source of truth). Day 3 (Playwright E2E) is now implemented for TC-E2E-01…06 on the public site + admin desk; TC-E2E-07 and Day 4 (deployment) remain open.

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
| TC-E2E-01 ✅ | Visitor → lead | home → hero CTA → fill form → submit | success message; row in DB via admin API |
| TC-E2E-02 ✅ | Calculator journey | home quick-estimate (PIN+bill) → calculator → adjust assumptions → results → "Discuss this estimate" | results math matches inputs; form prefilled; lead source=calculator |
| TC-E2E-03 ✅ | Shareable results | copy results URL, open in new context | identical numbers rendered |
| TC-E2E-04 ✅ | Admin lifecycle | login → see E2E-01 lead → add note → resolve → restore → delete → restore → purge | each state visible in correct tab; gone after purge |
| TC-E2E-05 ✅ | Mobile viewport (390×844) | nav drawer, calculator sliders, form submit, sticky CTA, admin table | no overflow/overlap; all controls reachable |
| TC-E2E-06 ✅ | Resilience | stop API container, submit form; restart, submit again | clear "not saved" error then success; no duplicate lead on retry |
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

## SolarSquare parity round (2026-11-20) — all ✅ passing

### TC-MODAL — quick-quote modal (`components/QuoteModal.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-MODAL-01 ✅ | Closed state | renders nothing when `open=false` |
| TC-MODAL-02 ✅ | Open state | accessible dialog (`role=dialog`, `aria-modal`, labelled) containing the lead form |
| TC-MODAL-03 ✅ | Escape key | calls `onClose` |
| TC-MODAL-04 ✅ | Backdrop click | closes on overlay click, NOT on inner panel click |
| TC-MODAL-05 ✅ | Close button | calls `onClose` |
| TC-MODAL-06 ✅ | Scroll lock | `body.overflow` hidden while open, restored on close |
| TC-MODAL-07 ✅ | Custom copy | heading/eyebrow props passed through to the form |

### TC-NAV — header CTA + mobile menu (`components/Header.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-NAV-01 ✅ | Header quote CTA | "Get a free consultation" opens the quote dialog |
| TC-NAV-02 ✅ | Escape from header modal | dialog closes |
| TC-NAV-03 ✅ | Mobile menu | toggles open and closes after navigation |
| TC-NAV-04 ✅ | Mobile Solutions group | accordion toggles `aria-expanded`, collapses when the drawer closes |
| TC-NAV-05 ✅ | Theme toggle | switches `data-theme` + palette, persists to `localStorage`, flips `aria-pressed` and the accessible name, and switches back |

### TC-VISIT — free-visit booking page (`pages/BookVisit.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-VISIT-01 ✅ | Page render | survey headings + form with prefilled "free site survey" message |
| TC-VISIT-02 ✅ | Submit | posts lead with `source="free-visit"`, `sourcePage="/book-visit"` |

### TC-CAREERS / TC-SITEMAP — careers + HTML sitemap
| ID | Case | Expected |
|---|---|---|
| TC-CAREERS-01 ✅ | Apply by email | mailto links carry CONTACT.email + "Careers" subject |
| TC-CAREERS-02 ✅ | Honesty copy | "not a list of fixed vacancies" disclaimer present (no fabricated openings) |
| TC-SITEMAP-01 ✅ | Link coverage | 22 primary public paths linked in 6 groups; `/admin` excluded |

### TC-FAQ — homepage FAQ depth (`data/content.js`, `components/Faq.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-FAQ-01 ✅ | Depth + quality | ≥15 questions (18 shipped), unique, complete answers |
| TC-FAQ-02 ✅ | Render | every homepage question renders as an accordion button |

Browser smoke (same round): hero modal open → focus first field → Escape closes → scroll restored → focus returned to trigger; `/book-visit` lead submitted and persisted (`source=free-visit` visible via admin API); `/careers` and `/sitemap` render; console clean.

---

## Design-fix round (2026-11-20) — accessibility, contrast, admin density, photo backgrounds

Shared dialog behavior extracted to `lib/useDialog.js` (Escape, Tab/Shift+Tab focus trap, body scroll lock, initial focus, focus restore with a connected-target fallback) and reused by `QuoteModal` and the admin detail modal. Global `:focus-visible` system (green on light surfaces, gold on dark), `.money:focus-within` ring, footer clearance under the fixed mobile CTA bar, nine low-contrast text colors raised to ≥4.5:1, admin type raised to ≥12px, compact admin metrics strip, lifecycle actions inside the admin detail modal, admin page title, and SolarSquare-style photo backgrounds on Contact / Calculator / Results heroes and the home consultation band (reusing the existing `/images` banners).

### TC-MODAL (extended) — focus containment (`components/QuoteModal.jsx`, `lib/useDialog.js`)
| ID | Case | Expected |
|---|---|---|
| TC-MODAL-08 ✅ | Initial focus | lands on first form field, not the background |
| TC-MODAL-09 ✅ | Tab / Shift+Tab trap | wraps last→first and first→last; focus never leaves the panel |
| TC-MODAL-10 ✅ | Focus restore | returns to the trigger element on close |

### TC-ADMIN — enquiry desk (`pages/Admin.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-ADMIN-01 ✅ | Page title | login + dashboard set "Enquiry dashboard \| DSP Power Infra" |
| TC-ADMIN-02 ✅ | Bad credentials | clear "Username or password was not accepted." error |
| TC-ADMIN-03 ✅ | Sign-in | loads enquiries with HTTP Basic `Authorization` header |
| TC-ADMIN-04 ✅ | Detail modal | opens labelled dialog, locks scroll, Escape closes + restores |
| TC-ADMIN-05 ✅ | Tab trap | focus stays contained inside the detail modal |
| TC-ADMIN-06 ✅ | Lifecycle in modal | "Mark resolved" / "Move to deleted" present; resolve issues `PUT …/resolve` |
| TC-ADMIN-07 ✅ | Deleted record | modal offers "Restore enquiry" + "Delete permanently", no resolve |

Browser smoke (same round): footer legal links reachable above the fixed mobile bar at ≤980px; quote modal initial focus + Tab/Shift+Tab containment + Escape + scroll restore; admin modal focus inside + Escape + lifecycle buttons + compact metrics + ≥12px type at ≥5.3:1; EMI loan input shows a focus ring; Contact/Calculator/Results/home photo backgrounds load with correct scrim layering and readable text; console clean.

---

## Editorial hero round (2026-11-20) — reference-matched sunset hero + transparent header

Home hero rebuilt to match the supplied reference: full-bleed sunset-over-panels photo (`/images/panels-sunset.jpg`) with a warm scrim, Playfair Display serif headline "Power your home with / *the sun.*" (italic sun-yellow on its own line), gold square-bullet eyebrow, warm cream lede, sun-yellow pill CTA + white ghost pill, and an honesty caption. The header is transparent over the home hero (white wordmark/nav, amber pill CTA) and solidifies on scroll; it stays solid on every other route and whenever the mobile menu is open. Page heroes adopt the same serif display face.

### TC-HERO — editorial home hero (`pages/Home.jsx`, `components/Header.jsx`, `styles.css`)
| ID | Case | Expected |
|---|---|---|
| TC-HERO-01 ✅ | Serif display headline | h1 uses Playfair Display; `em` renders italic, block-level, sun-yellow on its own line |
| TC-HERO-02 ✅ | Pill CTAs | primary CTA is sun-yellow with 999px radius; secondary is a white ghost pill |
| TC-HERO-03 ✅ | Square eyebrow bullet | eyebrow marker is a 2px-radius gold square, not a circle |
| TC-HERO-04 ✅ | Transparent header at top | on `/` at scrollY 0 the header carries `.overlay`: gradient scrim, white brand/nav, amber pill CTA |
| TC-HERO-05 ✅ | Header solidifies on scroll | scrolling past 24px removes `.overlay`; white blurred header + dark nav return |
| TC-HERO-06 ✅ | Header solid off-home / menu open | non-`/` routes and an open mobile menu always render the solid header |
| TC-HERO-07 ✅ | Hero sits under the header | negative margin-top equals header height (84 desktop / 72 ≤980) with matching padding-top; no content hidden behind the header |

Browser smoke (same round, 754px viewport): at top the header is `.overlay` (transparent gradient, white brand/nav/menu, amber 999px CTA) and the hero starts at y=0 with the headline clear of the header; scrolling to 400px returns the solid white blurred header; opening the mobile menu forces the solid header + scroll lock and closing restores `.overlay`; hero copy, both pill CTAs and the caption fit inside the hero with no horizontal overflow; the sunset photo loads (naturalWidth 1640); the sun CTA opens the quote dialog with initial focus on Full name and Escape closes + restores scroll; `/homes` and `/solar-calculator` keep solid headers, serif page-hero and loaded band imagery with no overflow; console clean. Desktop-width pixel QA remains deferred (in-app browser viewport is locked to 754px and was hidden this round, so verification used computed styles + geometry rather than screenshots).

---

## Implementation backlog round (2026-11-20)

### TC-ADMIN-08…11 — server-driven lead desk (`pages/Admin.jsx`, `Admin.test.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-ADMIN-08 ✅ | Server filters | source + date-range filters request `?source=&from=&to=` and reset to page 1 |
| TC-ADMIN-09 ✅ | Pagination | "Showing X–Y of N" and Previous/Next request the right page/size |
| TC-ADMIN-10 ✅ | Bulk actions | selecting a row and Resolve posts `{ ids: [7], action: "resolve" }` |
| TC-ADMIN-11 ✅ | Login throttling | a 429 sign-in shows the retry-later message |
| TC-ADMIN-12 ✅ | Password reveal | Eye toggle switches `type` password ↔ text; `aria-pressed` and the accessible label track the state |

### TC-CITY-01…04 — ten Maharashtra city guides (`pages/CitySolar.jsx`, `data/cities.js`)
| ID | Case | Expected |
|---|---|---|
| TC-CITY-01 ✅ | Data completeness | exactly 10 unique cities, each with 3 local notes, 3 FAQs and 3 valid neighbours |
| TC-CITY-02 ✅ | City render | requested city shows its own H1, local context, FAQ heading and prefilled enquiry form heading |
| TC-CITY-03 ✅ | Unknown slug | redirects to `/service-areas` instead of rendering broken content |
| TC-CITY-04 ✅ | Directory links | the Service Areas page links every city guide |

### TC-CONTENT-01…03 — blog + gallery (`data/blog.js`, `data/projects.js`, `pages/Projects.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-CONTENT-01 ✅ | Six articles | unique slugs, ≥4 sections each, valid dates, no positive guarantee claims |
| TC-CONTENT-02 ✅ | Blog index | all six guides are linked |
| TC-CONTENT-03 ✅ | Gallery filter | "representative imagery" label present; tag buttons filter the 6 labelled entries with `aria-pressed` |

### TC-ANALYTICS-01…06 — consent-aware GA4 (`lib/analytics.js`, `components/CookieConsent.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-ANALYTICS-01 ✅ | No ID | nothing loads, no dataLayer entries even after init/track |
| TC-ANALYTICS-02 ✅ | Accept | loads gtag once with `send_page_view:false`, `anonymize_ip:true`; router page views queue with `page_path` |
| TC-ANALYTICS-03 ✅ | Decline / revoke | decline loads nothing; revoking stops further page views |
| TC-ANALYTICS-04 ✅ | Banner visibility | hidden without a measurement ID or when a choice is already stored |
| TC-ANALYTICS-05 ✅ | Accept button | stores `granted`, closes the banner and loads GA4 |
| TC-ANALYTICS-06 ✅ | Decline button | stores `denied`, closes the banner and loads nothing |

### Backend additions
| ID | Case | Expected |
|---|---|---|
| TC-LEAD-40…45 ✅ | Filtered list | status/search/source/date filters, pagination, 422 on bad status/date, newest-first ordering |
| TC-LEAD-46…47 ✅ | Bulk actions | resolve/delete/purge update only matching ids; unknown action → 422; non-admin → 401 |
| TC-LEAD-48 ✅ | CSV | export honours the active filters |
| TC-AUTH-03…04 ✅ | Login throttle | blocked IP gets 429 even with the right password; success resets the counter |
| TC-MAIL-02 ✅ | SMTP delivery | GreenMail receives the new-lead message with recipient, subject and body |

Performance: built site measured under Lighthouse mobile (gzip like production) — home 94/100/100/100, calculator 93/100/100/100; LCP improved by self-hosted variable fonts, WebP picture sets and the hero preload.

## Admin email recipients round (2026-11-20)

### TC-NOTIFY-01…06 — desk panel (`pages/Admin.jsx`, `Admin.test.jsx`)
| ID | Case | Expected |
|---|---|---|
| TC-NOTIFY-01 ✅ | Panel states | opening "Email recipients" lists inboxes and explains that alerts are not switched on while mail is unconfigured; test button disabled |
| TC-NOTIFY-02 ✅ | Add inbox | submitting an email + optional name POSTs it and confirms that inbox will get every new enquiry |
| TC-NOTIFY-03 ✅ | Duplicate | a 422 field error shows the server explanation ("already on the list") |
| TC-NOTIFY-04 ✅ | Pause | Pause PATCHes `{ active: false }` and the row flips to Paused |
| TC-NOTIFY-05 ✅ | Remove | Remove asks for confirmation, DELETEs, and drops the row |
| TC-NOTIFY-06 ✅ | Test email | when mail is on, "Send test email" reports delivery to the active addresses |

### TC-NOTIFY-API-01…10 — recipient API (`NotificationRecipientApiTests`)
| ID | Case | Expected |
|---|---|---|
| TC-NOTIFY-API-01 ✅ | Auth | list requires an ADMIN role |
| TC-NOTIFY-API-02 ✅ | Status | empty list reports `notificationsEnabled=false`, `smtpConfigured=false`, max 20 |
| TC-NOTIFY-API-03 ✅ | Add | email is trimmed/lower-cased, label kept, active by default, appears in the list |
| TC-NOTIFY-API-04 ✅ | Invalid email | 422 on the `email` field |
| TC-NOTIFY-API-05 ✅ | Duplicate | case-insensitive duplicate → 422 "already on the list" |
| TC-NOTIFY-API-06 ✅ | Pause/resume | PATCH toggles `active` both ways |
| TC-NOTIFY-API-07 ✅ | Remove | DELETE returns 204 and the list is empty |
| TC-NOTIFY-API-08 ✅ | Unknown id | DELETE 999999 → 404 |
| TC-NOTIFY-API-09 ✅ | Limit | a 21st recipient is rejected with the 20-address explanation |
| TC-NOTIFY-API-10 ✅ | Test while off | test endpoint returns `sent=0` and says sending is switched off |
| TC-NOTIFY-API-11 ✅ | Same-origin write | POST with the site's own `Origin` is accepted (browser POST/PATCH/DELETE always send it) |
| TC-NOTIFY-API-12 ✅ | Foreign origin | POST with another site's `Origin` is rejected with 403 |

### TC-NOTIFY-MAIL-01…03 — delivery (`LeadEmailNotificationTests`)
| ID | Case | Expected |
|---|---|---|
| TC-NOTIFY-MAIL-01 ✅ | Fallback | with no desk recipients, a new lead emails `NOTIFY_TO` once (GreenMail) |
| TC-NOTIFY-MAIL-02 ✅ | Every active inbox | owner fallback + two desk recipients each get one individual message; a paused recipient is skipped |
| TC-NOTIFY-MAIL-03 ✅ | Test endpoint | test email reaches every active inbox and reports the count |

## Branded enquiry email round (2026-11-20)

### TC-NOTIFY-EMAIL-01…05 — HTML alert template (`EnquiryEmailTemplateTests`, `LeadEmailNotificationTests`)
| ID | Case | Expected |
|---|---|---|
| TC-NOTIFY-EMAIL-01 ✅ | Escaping | a name containing `<b>`, `&`, quotes renders as escaped text, never markup |
| TC-NOTIFY-EMAIL-02 ✅ | Contact actions | brand header, `tel:+91…`, `mailto:`, `SITE_URL` + `/admin` desk button, and the reply hint are present |
| TC-NOTIFY-EMAIL-03 ✅ | Missing email | the detail grid shows "Not provided" and the reply note tells the reader to reply or call |
| TC-NOTIFY-EMAIL-04 ✅ | Test message | the test email uses the same design, says "Alerts are working", and contains no customer phone number |
| TC-NOTIFY-EMAIL-05 ✅ | Multipart twin | the real GreenMail message carries both plain text and the HTML part with the brand, desk link and `tel:` link |

## Exception resilience round (2026-11-20)

### TC-RES-01…05 — HTTP error mapping (`ExceptionResilienceTests`)
| ID | Case | Expected |
|---|---|---|
| TC-RES-01 ✅ | Wrong HTTP method | `PUT /api/leads` → 405 `METHOD_NOT_ALLOWED` with `Allow: POST` (not 500) |
| TC-RES-02 ✅ | Wrong content type | `POST /api/leads` as text/plain → 415 `UNSUPPORTED_MEDIA_TYPE` |
| TC-RES-03 ✅ | Bad query parameter | `GET /api/admin/leads?page=abc` → 400 `VALIDATION_ERROR` naming `page` |
| TC-RES-04 ✅ | Database outage | `DataAccessException` → 503 `SERVICE_UNAVAILABLE` with a retry message |
| TC-RES-05 ✅ | Malformed JSON | unreadable body → 400 `BAD_REQUEST` with request id |

### TC-RES-06…09 — fail-safe background and best-effort paths
| ID | Case | Expected |
|---|---|---|
| TC-RES-06 ✅ | Scheduled cleanup | repository failure is logged and swallowed; the app stays up and retries on the next run (`DeletedLeadCleanup`) |
| TC-RES-07 ✅ | PIN lookup | malformed lookup template or null PIN returns empty instead of throwing (`PincodeDirectory`) |
| TC-RES-08 ✅ | Bad serviceability config | malformed, reversed and oversized ranges are skipped with a warning; valid `400-445` still serves |
| TC-RES-09 ✅ | Test email | unreadable recipient list returns `sent=0` and "try again in a moment" instead of a 500 |

### TC-RES-FE-01…02 — frontend crash safety (`ErrorBoundary.test.jsx`, `api.test.js`)
| ID | Case | Expected |
|---|---|---|
| TC-RES-FE-01 ✅ | Render error | a throwing page shows the recovery screen (role=alert, reload button, home link) and children render normally when nothing fails |
| TC-RES-FE-02 ✅ | Malformed 2xx body | non-JSON success response becomes a typed `ApiError` 502 and maps to a friendly message |

---

## Feature-branch port round (2026-11-20) — theme toggle + sign-in lockout

Hand-ported from `feature/next-steps` onto the current main (no merge). Theme preference lives in `lib/theme.js` (`localStorage` key `dsp-theme`, falling back to `prefers-color-scheme`); the saved theme is applied by an inline script in `index.html` before first paint. `dark.css` maps the palette onto the current tokens. Sign-in failures are counted by `AdminLoginAttemptLimiter` in a sliding window per IP and per IP+username (`ADMIN_LOGIN_MAX_ATTEMPTS`, default 5; `ADMIN_LOGIN_WINDOW_MS`, default 15 min) and enforced before password verification.

| ID | Case | Expected |
|---|---|---|
| TC-THEME-01 ✅ | Stored choice wins | `localStorage` `dark`/`light` returned as-is |
| TC-THEME-02 ✅ | System fallback | no stored value → `prefers-color-scheme` result |
| TC-THEME-03 ✅ | Unknown value | any non-`dark`/`light` value falls back to the system preference |
| TC-THEME-04 ✅ | Apply + persist | `applyTheme` sets `data-theme`/`color-scheme`, writes `localStorage` and returns the theme |
| TC-LOGIN-01 ✅ | Lockout threshold | five failed attempts from one IP return 401, the next returns 429 with `Retry-After` and a `RATE_LIMITED` body plus request id |
| TC-LOGIN-02 ✅ | Correct password while locked | still 429 until the window expires |
| TC-LOGIN-03 ✅ | Reset on success | a successful sign-in clears earlier failures for that IP/username |
| TC-LOGIN-04 ✅ | Per-IP scoping | a locked IP does not block another IP |
| TC-LOGIN-05 ✅ | Requests without credentials | 401s with no Authorization header do not consume the failure budget |
| TC-LOGIN-06 ✅ | Window expiry + key isolation (unit) | counter unblocks after the window, keys are independent, `clear` resets |

Browser smoke (Playwright, 1440 px + 390 px): home, calculator, admin login/dashboard and the mobile drawer in light and dark; theme persists across reload, no horizontal overflow, no console errors.

---

## Regression rule
Before every deploy: run all three suites (`mvn test`, `npm test`, `npx playwright test`). Any ☐ on a shipped feature or any failing test blocks the deploy. Update statuses in this file in the same PR as the implementation.