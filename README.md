# DSP Power Infra website

Local workspace for the DSP Power Infra solar platform — an original, DSP-branded site inspired by the customer journeys of reference solar sites (e.g. SolarSquare), built and verified to run fully functional locally.

## Stack
- React 19 + Vite 7 frontend (react-router, 27 public routes + 10 city landing pages + admin desk)
- Java 21 + Spring Boot 4.1.2 REST API (feature-first packages)
- MySQL 8.4 (Docker) with Flyway-managed schema
- Private leads API protected with an ADMIN role (HTTP Basic)

## Start locally
1. Start Docker Desktop, then run `docker compose up -d mysql` from the project root. This creates the local `dsp_power_infra` database and `dsp_dev` user.
2. In PowerShell, configure local DB and admin credentials, then run the backend:
   `cd backend`
   `$env:DB_URL="jdbc:mysql://localhost:3306/dsp_power_infra"`
   `$env:DB_USERNAME="dsp_dev"`
   `$env:DB_PASSWORD="local-dev-only"`
   `$env:SERVER_PORT="8081"`
   `$env:ADMIN_USERNAME="admin"`
   `$env:ADMIN_PASSWORD="choose-a-strong-local-password"`
   `mvn spring-boot:run`
   (Java 21 required. All variables have local-dev defaults; see `.env.example` for the full list.)
3. In a second terminal, run the frontend:
   `cd frontend`
   `npm install`
   `npm run dev`
4. Visit http://127.0.0.1:5173. The Vite development server proxies `/api` requests to the backend on port 8081. The private team area is at http://127.0.0.1:5173/admin.

## Run the tests
- Backend: `cd backend && mvn test` — 91 JUnit/MockMvc tests on H2 (lead API incl. filtered pagination, bulk actions and CSV filters, validation, rate limiting, admin sign-in throttling/lockout per IP and IP+username, honeypot, cleanup job, email delivery over a real GreenMail SMTP server, multi-recipient alerts, recipient API, branded HTML alert template incl. escaping, contact links and mobile alignment, notification fail-safe, security headers, PIN directory parsing/caching, Maharashtra serviceability, readiness, prod secret guard, and exception resilience: 405/415/400 mapping, database-outage 503, fail-safe cleanup/PIN/test-email paths).
- Frontend: `cd frontend && npm test` — 147 Vitest + Testing Library tests (solar math + DSP rate card incl. height surcharge, 1 kW floor and the above-200 kW proposal cutoff, PM Surya Ghar track record with verified counts and as-of date, subsidy slabs incl. society ₹18,000/kW, serviceability + PIN→city hints, theme preference + dark palette, API client/error mapping/retry policy incl. malformed success bodies, lead form incl. city autofill, quote modal + focus trap, header/mobile nav + Solutions accordion + theme toggle, free-visit booking, FAQ depth, careers, HTML sitemap, calculator results + connection pricing + autofill, server-driven admin desk incl. filters/pagination/bulk actions/login throttling/password reveal/email recipients, city landing pages, blog + projects gallery, consent-aware analytics, and the render-error boundary).
- E2E: with MySQL, the backend and Vite running, `cd frontend && npm run test:e2e` — 6 Playwright specs (TC-E2E-01…06) covering the hero quote lead, the hero-estimate → calculator → results → calculator-sourced lead flow, shareable-results parity across contexts, the full admin lifecycle (note → resolve → restore → delete → restore → purge), a 390 px mobile pass without horizontal overflow, and an API-outage-then-clean-retry check. First run needs `npx playwright install chromium`. Admin credentials default to the local-dev values; override with `E2E_ADMIN_USER` / `E2E_ADMIN_PASSWORD`.

## Status — what is done ✅

### SolarSquare-style redesign round (2026-11-21)
1. **White-first design system** — `theme.css` is re-authored around a single palette: white surfaces, navy ink (`#182150`), one green accent for icons/links/tints, one solid navy button style, pale blue section tints, soft radii and shadows. Charcoal/champagne editorial blocks, multiple golds and heavy gradients are gone; `styles.css` class names remain the structural contract, so every test selector, aria label and copy string is unchanged.
2. **Home journey** — the hero is now a two-column layout (copy + live estimate panel) matching the reference flow: understand the offer → see an instant estimate → explore solutions → proof → process → FAQs → enquiry. The PM Surya Ghar track record moved below the "why" section so the first two screens stay focused on the offering.
3. **Cross-page consistency** — photo page-heroes, solution templates, calculator, results, subsidy, service areas, city guides, about, projects, blog, refer, contact, book-visit, careers, sitemap, legal, 404 and admin were swept at 1440 px, 834 px and 390 px. Dark mode (`dark.css`) is re-authored as the deep-navy counterpart with its own CTA and accent tokens.
4. **Defects fixed during the sweep** — calculator photo-hero no longer clips under the sticky header; white CTAs keep dark text in dark mode; the projects filter chips regained their base pill layout (counts were rendering as `All6`); the phone `pattern` used a `-` that Chromium's `v`-flag rejects, silently disabling browser-level phone validation (now escaped, and verified invalid input blocks submission).
5. **Verification** — 147 Vitest tests green, zero console/page errors across the sweep, and the enquiry flow was exercised with the API mocked: 201 → success card, 422 → field error + alert, 500 → generic alert with a single POST (no retry), correct `sourcePage`/honeypot/payload. Playwright E2E and a real database enquiry still need Docker/MySQL running.

### Customer-confirmed rate answers (2026-11-21)
1. **Above 200 kW → proposal** — `quoteFor` now flags systems above the 200 kW ladder with `needsProposal` instead of silently capping the price. The calculator preview and results page show “Site-specific” with a survey-first message, and the contact link deliberately omits `estimateCost` so a proposal enquiry is not anchored to a fake number. Housing societies and special structures follow the same proposal route.
2. **Why commercial is cheaper** — copy now explains that commercial and industrial rooftops use Non-DCR modules (roughly half the cost of DCR), while DCR modules are reserved for subsidy-eligible residential and society work. The rationale sits in the calculator assumptions and results notes, not in a marketing claim.
3. **Pricing terms** — every rate is full turnkey (supply, structure, wiring, commissioning, DISCOM liaison), includes GST, and carries no separate transport charge. The 20 m height allowance is measured from ground level and applies to all three connection types; ₹1,000/m applies above it. The sheet's 10 corrupt residential cells and flat ₹7,80,000 subsidy column were confirmed as typing errors; the site keeps the formulas and the PM Surya Ghar slabs.
4. **Society subsidy** — housing society common areas use the separate group-housing route at ₹18,000/kW (customer-confirmed), with eligibility verified before quoting. Shared in the subsidy guide, FAQs, city FAQ and society solution note; individual flats remain ineligible.
5. **Verification** — 5 new/updated Vitest cases (147 frontend total), production build clean, and a live sweep of the calculator and results at desktop and mobile widths.

### PM Surya Ghar proof section (2026-11-21)
1. **Track record band** — Home and About now show the PM Surya Ghar: Muft Bijli Yojana totals from DSP's vendor dashboard: 468 applications approved, 368 installations completed, 362 inspections approved and 325 subsidies approved, with an explicit “as of 20 November 2026 — scheme work only” line. The source is `frontend/src/data/impact.js`; refreshing the counts is a one-file change, deliberately static for now with no backend edit screen.
2. **Hero proof** — the ambiguous “3 / Homes · societies · business” stat is replaced by “368 / PM Surya Ghar installations”, sourced from the same file.
3. **Deliberate label** — the portal's 345 “redeemed” total includes claims still pending, so the site publishes the 325 approved subsidy figure instead; the distinction is documented in the data file.
4. **Verification** — 2 new component tests (142 frontend total at that point), production build clean, and a live 1440 px / 390 px sweep of Home and About with zero horizontal overflow and no console errors.

### Feature-branch port round (2026-11-20)
`feature/next-steps` was eight commits ahead but four thousand lines behind main, so its two useful enhancements were hand-ported onto the current design instead of merged. The six README-only commits were skipped as superseded.
1. **Light/dark theme** — a header and mobile-drawer toggle (`lib/theme.js`) saves the choice to `localStorage`, follows `prefers-color-scheme` on first visit, and an inline script applies it before first paint. `dark.css` maps the palette onto the current editorial tokens (`--night`, `--champagne`, `--cream`, `--paper`), including the hero glass bar and the admin desk; the feature branch's older token overrides were re-authored. Deployment note: the production CSP must allow the inline theme bootstrap (hash or `'unsafe-inline'`), otherwise the first paint falls back to light until React loads.
2. **Stronger sign-in lockout** — replacing the IP-only fixed block, `AdminLoginAttemptLimiter` keeps a sliding window per client IP **and** per IP+username (default 5 failures / 15 min, `ADMIN_LOGIN_MAX_ATTEMPTS` / `ADMIN_LOGIN_WINDOW_MS`). The filter refuses with 429 + `Retry-After` before password verification, clears on success, and ignores requests without credentials. The desk login also gains an accessible password show/hide toggle.
3. **Verification** — 86 backend / 127 frontend tests green, production build clean, and a live Playwright sweep of home, calculator, admin login/dashboard and the 390 px drawer in both themes (no console errors, no horizontal overflow, theme persists across reload).

### Exception resilience round (2026-11-20)
1. **Client mistakes stay 4xx** — wrong HTTP method now returns 405 with an `Allow` header, a non-JSON body returns 415, and invalid query parameters (for example `page=abc`) return 400 with the offending field. Previously all three fell through the catch-all and were reported as 500.
2. **Database outages stay recoverable** — `DataAccessException` now returns 503 `SERVICE_UNAVAILABLE` with a retry message instead of an opaque 500, so the API client's existing 5xx retry policy applies. Readiness also answers 503 when the pool throws unchecked exceptions.
3. **Background and best-effort paths never propagate** — the hourly expired-lead cleanup logs and retries instead of failing (and no longer runs inside an outer transaction that could throw after the catch), the PIN directory returns “no city” on a malformed lookup, and invalid `SERVICEABLE_PREFIXES` entries (malformed, reversed or oversized ranges) are skipped with a warning so a bad environment variable cannot stop startup. The desk's test-email action explains an unreadable recipient list instead of returning 500.
4. **Frontend cannot white-screen** — a new `ErrorBoundary` wraps each public page (header/footer stay usable), the admin desk, and the app shell; a render or lazy-chunk failure shows a plain-language recovery screen with reload and home links. A malformed 2xx response body is now a typed `ApiError` 502 rather than an uncaught `SyntaxError`.
5. **Verification** — 8 new backend tests and 3 new frontend tests (82 backend / 121 frontend, all green, production build clean). Live smoke against a temporary instance: `PUT /api/leads` → 405 + `Allow: POST`, text/plain → 415, `page=abc` → 400 naming `page`, malformed JSON → 400, `/api/ready` and `/api/serviceability/411046` → 200.

### Admin email recipients round (2026-11-20)
1. **Who gets alerts** — every new enquiry is emailed to each active recipient added in the desk, plus the optional server-level `NOTIFY_TO` fallback (de-duplicated). Each recipient gets an individual plain-text message; when the enquirer supplied an email, it is set as `Reply-To` so the team can reply directly.
2. **Desk panel** — `/admin` now has an “Email alerts for new enquiries” panel: plain-language delivery status, add a Gmail/company inbox (name optional), pause/resume without deleting, remove with confirmation, and a “Send test email” button. Addresses are normalised and capped at 20; duplicates are rejected.
3. **API + schema** — `GET/POST/PATCH/DELETE /api/admin/notification-recipients` and `POST /api/admin/notification-recipients/test`, Flyway `V2__create_notification_recipients.sql`, all ADMIN-only. The status response tells the UI whether the mail server is configured so it can explain why alerts are not going out yet.
4. **CORS for desk writes** — the API now accepts writes from the site's own host (browser POST/PATCH/DELETE send an `Origin` header even same-origin) while still rejecting foreign origins; the local preview proxy forwards no `Origin`/`Referer`, so desk writes work through the tunnel too.
5. **Sender + free provider setup** — `NOTIFY_FROM` sets the From address (falls back to the SMTP username); skipped notifications log why, and a failed test email now reports the provider's reason in plain words. Free Brevo setup is documented step by step in [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md). The local backend now sends through Brevo (settings in gitignored `backend/.env.local`, loaded by `scripts/start-backend.ps1`): the desk reports alerts on, a test email was accepted by Brevo, and a smoke enquiry produced one notification. Production needs the same environment values.
6. **Tests** — 14 new backend tests (recipient API, same-origin vs foreign-origin CORS, multi-recipient delivery, paused-recipient skip, test email over GreenMail) and 6 new frontend tests; suites now 74 backend / 118 frontend.

### Branded enquiry email round (2026-11-20)
1. **Modern HTML alert** — new-enquiry alerts are now a table-based, inline-styled HTML email: 600 px card on desktop that fills the phone width, DSP header, serif customer name, a six-field detail grid that stacks on small screens with every field flush left, and a plain-text twin for clients that block HTML. No external images, and every customer-supplied value is escaped.
2. **Actions in the inbox** — an "Open enquiry desk" button uses the new `SITE_URL` setting, a "Call" button dials the customer (`tel:`, +91 added when missing), and the customer's email address becomes `Reply-To` so hitting reply answers them directly.
3. **Test email** — "Send test email" now arrives in the same design with a three-point checklist of what a real alert contains and no customer data.
4. **Verification** — 5 template tests (markup escaping, phone/email/desk links, missing-email fallback, no customer data in the test message, mobile padding reset so stacked fields and buttons align); suites now 91 backend / 127 frontend, E2E 6/6 green. The rendered card was checked at 360/390/600 px with zero horizontal overflow, then sent live through Brevo as both a test email and a real smoke enquiry.

### Implementation completion round (2026-11-20)
1. **Performance & Lighthouse** — self-hosted variable fonts (Archivo, DM Sans) with preload; WebP `<picture>` sets for every photo; route-level code splitting (home 101 KB gzip entry; admin 6.6 KB, solution template 6.9 KB, other pages 1–3 KB each); hero preload; home widget chunks deferred. Measured mobile Lighthouse on the built site (gzip like production): **home 94 / 100 / 100 / 100**, **calculator 93 / 100 / 100 / 100** (performance / accessibility / best-practices / SEO), CLS 0.
2. **Lead desk scale-up** — server-side pagination (`page`, `size`), status/search/source/date filters, filtered CSV export, bulk resolve/restore/delete/purge (max 500 ids) with tab counts, and admin login throttling (429 + `Retry-After` after repeated failures, scoped per IP and IP+username). The desk now holds only the current page.
3. **Email notifications** — verified end-to-end by `LeadEmailNotificationTests`, which delivers a real message to an embedded GreenMail SMTP server and asserts recipient, subject and body.
4. **City landing pages** — ten honest, locally specific pages at `/service-areas/:slug` (Pune, Pimpri-Chinchwad, Mumbai, Thane, Navi Mumbai, Nashik, Nagpur, Chhatrapati Sambhajinagar, Kolhapur, Solapur), each with local constraints, FAQ schema, calculator/visit CTAs, enquiry form and nearby-city links; linked from Service Areas, the HTML sitemap and `sitemap.xml`.
5. **Content depth** — six claim-safe articles (new: housing-society checklist, monsoon readiness) and a Projects gallery with representative-imagery labels, segment tags and an accessible filter.
6. **Consent-aware analytics** — GA4 loads only when `VITE_GA_MEASUREMENT_ID` is set **and** the visitor accepts the cookie banner; router-driven page views, honour revocation, footer “Cookie settings”, privacy-policy section, CSP allow-list and `.env.example`. With no ID configured (the default) nothing loads.

### Public website (Phase 1 complete)
- Routed pages: home, residential, commercial, housing societies, grid-connected, hybrid and off-grid solar, how-it-works, projects, about, blog + article pages, service areas + ten city guides, refer-a-friend, experience centre, webinars, partners, contact, privacy, terms, 404.
- Solar calculator (`/solar-calculator`) with live preview and shareable results (`/solar-calculator/results`): system size, roof area, DSP turnkey rate (residential ₹70,000/kW, commercial ₹35,000/kW, industrial ₹32,000/kW for 1–200 kW, GST included, height from ground level, +₹1,000/m above 20 m; above 200 kW a site-specific proposal), PM Surya Ghar subsidy (₹30k/kW first 2 kW + ₹18k third kW, capped ₹78k, residential only; society common areas ₹18k/kW), net cost, payback and EMI — every assumption visible and adjustable, results labelled as planning estimates.
- Calculator → results → prefilled contact enquiry flow; leads carry source page and UTM attribution.
- Serviceability PIN check (all Maharashtra prefixes 400–445, excluding Goa's 403; other PINs accepted and flagged, never rejected).
- SEO: per-route titles/descriptions, Open Graph, JSON-LD LocalBusiness + FAQPage (homepage and city pages), robots.txt, sitemap.xml (including city guides), HTML sitemap page.

### SolarSquare parity round (2026-11-20)
- Quick-quote modal on the hero, header and mobile-bar CTAs — full lead form in an accessible dialog (Escape/backdrop close, scroll lock, focus management); submits with `source=quick-quote`.
- `/book-visit` — free site-visit booking page (what the survey covers + prefilled enquiry form, `source=free-visit`).
- Homepage FAQ expanded to 18 claim-safe questions with FAQPage structured data.
- `/careers` — honest work-areas overview + apply-by-email (no fabricated vacancies).
- `/sitemap` — grouped HTML sitemap of all primary public pages (admin excluded); footer links updated.

### Design & accessibility fix round (2026-11-20)
- Shared dialog hook (`lib/useDialog.js`): Escape, Tab/Shift+Tab focus trap, scroll lock, initial focus and focus restore — reused by the quote modal and the admin detail modal.
- Global `:focus-visible` system (bronze on light surfaces, champagne on dark) and a focus ring on the EMI loan input; footer links no longer hidden under the fixed mobile quote bar.
- Nine low-contrast text colors raised to ≥4.5:1; admin table/label type raised to ≥12px; admin metrics compacted into a single strip so the enquiry table sits higher.
- Admin detail modal now carries lifecycle actions (resolve / reopen / restore / delete / permanent delete) and sets its own page title.
- SolarSquare-style photo backgrounds (existing `/images` banners) on the Contact, Calculator and Results heroes and the home consultation band, each with a warm charcoal scrim for readable text.

### Editorial site-wide re-skin round (2026-11-20)
- New shared design system applied to every public page, the header/footer and the admin desk: warm charcoal ink (`#17130d`), night (`#0e0b07`), cream (`#f3ede2`) and champagne (`#d8b489`) surfaces; Archivo display type with uppercase negative-tracked headings; DM Sans body; pill buttons; diamond eyebrows; glass panels (`frontend/src/theme.css` layers over the base layout).
- Home hero rebuilt to the approved reference: cinematic sunset-over-panels photo, glass "Solar EPC · Pune, Maharashtra" badge, three-line "Power your home with **the sun.**" headline with champagne last line, champagne + ghost-light pill CTAs, a floating glass estimate bar (PIN code + monthly bill → solar calculator), and an overlapping glass fact strip — using only verified facts (Pune / 3 customer segments / 1 team), never invented statistics.
- All page heroes share the dark photo + scrim treatment; solution, calculator, results, service-area, subsidy, blog, refer, partner, visit/careers pages and legal/404/sitemap all inherit the new palette and type.
- Header is solid translucent charcoal site-wide (transparent only over the home hero, solidifying on scroll); champagne nav CTA; mobile drawer is opaque charcoal with a proper Solutions accordion (chevron, `aria-expanded`, resets on close).
- Sticky bottom bars reconciled: the calculator consult bar gets its own dark treatment and clears the WhatsApp float (chat float raised above the bar); the mobile "Planning solar?" quote bar is suppressed on the calculator, which already carries a consult CTA.
- QA: captured every route at 1440 px and key routes at 390 px via Playwright + installed Chrome; mobile scroll width confirmed 390 px (no horizontal overflow) on home, solutions, calculator and contact; fixed a leftover green consultation-band scrim and a stray-orphan heading.
- Header CTA renamed to "Get a free consultation"; tests cover the header CTA, mobile drawer and the new Solutions accordion (74 tests).

### Testing & security hardening round (2026-11-20)
- Playwright E2E suite (`frontend/e2e`, `npm run test:e2e`) — TC-E2E-01…06 green against the local stack: hero quote-modal lead, hero-estimate → calculator → results → calculator-sourced lead, shared-results parity across browser contexts, admin note/resolve/restore/delete/purge lifecycle, 390 px mobile pass (no horizontal overflow), and API-outage error + exactly-one-lead retry. Each spec cleans up its lead through the admin API.
- Security headers: the API sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` plus a deny-all CSP (`default-src 'none'; frame-ancestors 'none'; base-uri 'none'`), `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and HSTS (1 year, includeSubDomains) on HTTPS requests only — covered by `SecurityHeadersTests` (3 MockMvc tests). Vite dev/preview serves a site CSP compatible with HMR, self-hosted fonts and the consent-gated GA4 endpoints, with frame-ancestors/base-uri/form-action locked down.
- E2E testing found and fixed a real admin bug: the "Saved" note confirmation was wiped immediately because refreshing the selected lead re-ran the reset effect.
- Vitest scoped to `src/**` so it no longer collects the Playwright specs.

### Form UX round (2026-11-20)
- PIN → City autofill: entering a PIN fills the City field on the enquiry form (quick-quote modal, contact, book-visit, calculator-sourced lead) and on the solar calculator, including shared `?pincode=` links. Every Indian PIN is resolved through the backend's cached India Post directory lookup (`GET /api/serviceability/{pin}` now returns `city`/`state` as the postal district and state); 411/412 still fill "Pune" instantly from the local confirmed-region hint when the lookup is slow or offline. A city the visitor types is never overwritten. `PincodeDirectory` caches results for a week, never blocks a response (failures return null), and is disabled in tests (`app.pincode.lookup-url=`).

### Lead desk (`/admin`)
- Active / resolved / deleted tabs, search, lead detail modal, internal notes, resolve / restore / soft-delete / permanent delete, CSV export, 15-day auto-delete of soft-deleted leads.

### Backend API
- `POST /api/leads` (public, validated, rate-limited 5/min/IP, honeypot silently dropped), `GET /api/serviceability/{pincode}`, `GET /api/health` (liveness), `GET /api/ready` (DB readiness, 503 when down).
- Admin: filtered paginated list (`?status=&q=&source=&from=&to=&page=&size=`), notes PATCH, resolve/restore/delete, permanent DELETE, bulk actions, filtered `export.csv`; repeated Basic-auth failures are throttled per IP and IP+username.
- Admin notifications: recipient list/add/pause/remove (`/api/admin/notification-recipients`), a test-email action, and delivery status (`smtpConfigured`, `notificationsEnabled`, `fallbackRecipient`) for the desk panel.
- Typed error responses with request IDs; every log line carries the same `X-Request-Id`.
- Optional fail-safe email notifications on new leads (off by default; recipients managed in the desk, `NOTIFY_TO` still works as a server fallback).

### Production hardening (local-verified)
- Flyway migrations (`V1__create_leads.sql`); Hibernate set to `validate`. Verified on both a fresh and the existing database.
- Graceful shutdown (20s drain), readiness probe, request-ID log correlation.
- `ProdConfigGuard`: with `SPRING_PROFILES_ACTIVE=prod` the app refuses to boot with default dev credentials.
- `.env.example` committed; no real secrets in the repo.
- API client retries transient 5xx and network failures on idempotent requests only (3 attempts, backoff); lead POSTs are never retried so an enquiry cannot be duplicated.
- CI workflow (`.github/workflows/ci.yml`) runs both test suites on every push/PR — activates on the next push.
- Full local smoke test passed: calculator → enquiry → admin → notes/resolve/export, both PIN branches, mobile navigation.

## Status — what remains ⏳

Order of work (decided 2026-11-20): implementation is now complete; production and deployment are the last phase. The six-item implementation backlog (performance, lead-desk scale-up, SMTP verification, city pages, content depth, analytics) shipped on 2026-11-20 — details above.

### Finishing touches that need DSP input (content, not build)
- Real project photos, case studies, testimonials and certifications — publish only with permission and proof.
- Confirm the WhatsApp number, business hours and experience-centre address.
- SMTP credentials for go-live (recipient inboxes can already be added in `/admin`, but nothing is delivered until `SMTP_HOST`/`SMTP_USERNAME`/`SMTP_PASSWORD` and `NOTIFY_ENABLED=true` are set on the server) and a GA4 measurement ID if analytics is wanted (set `VITE_GA_MEASUREMENT_ID` at build time; see `frontend/.env.example`).

### Deployment — next phase
- Dockerfiles + full compose stack: nginx serving the built frontend and proxying `/api`, the Spring Boot jar, and MySQL; nginx config for SPA fallback, gzip, immutable asset caching and HTTPS redirect.
- Domain, HTTPS (Let's Encrypt), absolute `sitemap.xml`/OG URLs, env-driven CORS origins for the production domain (currently dev origins only).
- Production secrets + `SPRING_PROFILES_ACTIVE=prod`, MySQL volume + nightly backups, uptime monitoring/alerting.
- Playwright in CI on top of the existing unit-suite workflow (needs a MySQL service job).
- Serving production CSP/HSTS from nginx or the host (the API already sends them).

### Post-launch product phase (needs business decisions or third-party integrations)
- Customer portal and live inverter/generation monitoring (requires a real monitoring integration — never fabricate data).
- Advanced lead workflows (team assignment, pipelines, WhatsApp/email automation).
- City-page fleet beyond the launch ten, richer blog content, multi-language.

## Content rules (must always hold)
Do not publish unverified pricing, subsidy amounts, service coverage, guarantees, certifications or testimonials. Representative imagery must be labelled as such. Estimates must show their assumptions and carry no savings or subsidy guarantee. Live generation data requires a real inverter/monitoring integration and must never be fabricated.

## Key docs
- `docs/IMPLEMENTATION_PLAN.md` — two-phase plan and gap analysis.
- `docs/TEST_CASES.md` — test case catalogue synced with the suites above.