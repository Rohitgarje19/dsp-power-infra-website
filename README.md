# DSP Power Infra website

Local workspace for the DSP Power Infra solar platform — an original, DSP-branded site inspired by the customer journeys of reference solar sites (e.g. SolarSquare), built and verified to run fully functional locally.

## Stack
- React 19 + Vite 7 frontend (react-router, 27 public routes + admin desk)
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
- Backend: `cd backend && mvn test` — 38 JUnit/MockMvc tests on H2 (lead API, validation, rate limiting, honeypot, admin workflows, CSV, cleanup job, notification fail-safe, readiness, prod secret guard).
- Frontend: `cd frontend && npm test` — 74 Vitest + Testing Library tests (solar math, subsidy slabs, serviceability, API client/error mapping, lead form, quote modal + focus trap, header/mobile nav + Solutions accordion, free-visit booking, FAQ depth, careers, HTML sitemap, calculator results, admin desk + detail-modal lifecycle).

## Status — what is done ✅

### Public website (Phase 1 complete)
- Routed pages: home, residential, commercial, housing societies, grid-connected, hybrid and off-grid solar, how-it-works, projects, about, blog + article pages, service areas, refer-a-friend, experience centre, webinars, partners, contact, privacy, terms, 404.
- Solar calculator (`/solar-calculator`) with live preview and shareable results (`/solar-calculator/results`): system size, roof area, PM Surya Ghar subsidy (₹30k/kW first 2 kW + ₹18k third kW, capped ₹78k, residential only), net cost, payback and EMI — every assumption visible and adjustable, results labelled as planning estimates.
- Calculator → results → prefilled contact enquiry flow; leads carry source page and UTM attribution.
- Serviceability PIN check (Pune prefixes 411/412; unknown PINs accepted and flagged, never rejected).
- SEO: per-route titles/descriptions, Open Graph, JSON-LD LocalBusiness + FAQPage (homepage), robots.txt, sitemap.xml, HTML sitemap page.

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

### Lead desk (`/admin`)
- Active / resolved / deleted tabs, search, lead detail modal, internal notes, resolve / restore / soft-delete / permanent delete, CSV export, 15-day auto-delete of soft-deleted leads.

### Backend API
- `POST /api/leads` (public, validated, rate-limited 5/min/IP, honeypot silently dropped), `GET /api/serviceability/{pincode}`, `GET /api/health` (liveness), `GET /api/ready` (DB readiness, 503 when down).
- Admin: list, notes PATCH, resolve/restore/delete, permanent DELETE, `export.csv`.
- Typed error responses with request IDs; every log line carries the same `X-Request-Id`.
- Optional fail-safe email notification on new leads (off by default).

### Production hardening (local-verified)
- Flyway migrations (`V1__create_leads.sql`); Hibernate set to `validate`. Verified on both a fresh and the existing database.
- Graceful shutdown (20s drain), readiness probe, request-ID log correlation.
- `ProdConfigGuard`: with `SPRING_PROFILES_ACTIVE=prod` the app refuses to boot with default dev credentials.
- `.env.example` committed; no real secrets in the repo.
- API client retries transient 5xx and network failures on idempotent requests only (3 attempts, backoff); lead POSTs are never retried so an enquiry cannot be duplicated.
- CI workflow (`.github/workflows/ci.yml`) runs both test suites on every push/PR — activates on the next push.
- Full local smoke test passed: calculator → enquiry → admin → notes/resolve/export, both PIN branches, mobile navigation.

## Status — what remains ⏳

### Phase 2 — needs company data / integrations (not buildable without DSP input)
- Verified pricing, tariff and generation assumptions (current calculator defaults are illustrative and must be reviewed before client use).
- Real project photos/case studies, customer testimonials, certifications (only with permission and proof).
- City/area landing pages beyond the Pune region once service coverage is confirmed.
- Richer blog/article content and solar guides.
- Customer portal, live inverter/generation monitoring (requires a compatible monitoring integration — never fabricate data).
- Advanced lead workflows (assignment, pipelines, WhatsApp/email automation).
- Email notification delivery (wired, off by default — needs SMTP credentials).
- Analytics/marketing pixels (needs DSP's own GA/measurement ID — nothing third-party is embedded by default).

### Deployment (deferred by decision — site runs fully locally first)
- Production hosting, HTTPS, domain + absolute sitemap URLs.
- Env-driven CORS origins for the production domain (currently dev origins only).
- Production secrets + `SPRING_PROFILES_ACTIVE=prod`, DB backups, monitoring/alerting.
- CI workflow runs both suites on push/PR; optional E2E (Playwright) suite remains open.
- Nice-to-haves: CSP/HSTS headers, desktop-width visual QA pass.

## Content rules (must always hold)
Do not publish unverified pricing, subsidy amounts, service coverage, guarantees, certifications or testimonials. Representative imagery must be labelled as such. Estimates must show their assumptions and carry no savings or subsidy guarantee. Live generation data requires a real inverter/monitoring integration and must never be fabricated.

## Key docs
- `docs/IMPLEMENTATION_PLAN.md` — two-phase plan and gap analysis.
- `docs/TEST_CASES.md` — test case catalogue synced with the suites above.