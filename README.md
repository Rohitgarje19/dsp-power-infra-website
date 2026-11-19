# DSP Power Infra website

Local workspace for the DSP Power Infra solar platform — an original, DSP-branded site inspired by the customer journeys of reference solar sites (e.g. SolarSquare), built and verified to run fully functional locally.

## Stack
- React 19 + Vite 7 frontend (react-router, 24 public routes + admin desk)
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
- Frontend: `cd frontend && npm test` — 46 Vitest + Testing Library tests (solar math, subsidy slabs, serviceability, API client/error mapping, lead form, FAQ, calculator results).

## Status — what is done ✅

### Public website (Phase 1 complete)
- Routed pages: home, residential, commercial, housing societies, grid-connected, hybrid and off-grid solar, how-it-works, projects, about, blog + article pages, service areas, refer-a-friend, experience centre, webinars, partners, contact, privacy, terms, 404.
- Solar calculator (`/solar-calculator`) with live preview and shareable results (`/solar-calculator/results`): system size, roof area, PM Surya Ghar subsidy (₹30k/kW first 2 kW + ₹18k third kW, capped ₹78k, residential only), net cost, payback and EMI — every assumption visible and adjustable, results labelled as planning estimates.
- Calculator → results → prefilled contact enquiry flow; leads carry source page and UTM attribution.
- Serviceability PIN check (Pune prefixes 411/412; unknown PINs accepted and flagged, never rejected).
- SEO: per-route titles/descriptions, Open Graph, JSON-LD LocalBusiness, robots.txt, sitemap.xml.

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

### Deployment (deferred by decision — site runs fully locally first)
- Production hosting, HTTPS, domain + absolute sitemap URLs.
- Env-driven CORS origins for the production domain (currently dev origins only).
- Production secrets + `SPRING_PROFILES_ACTIVE=prod`, DB backups, monitoring/alerting.
- CI running both test suites on push; optional E2E (Playwright) suite.
- Nice-to-haves: 5xx retry in the API client, CSP/HSTS headers, desktop-width visual QA pass.

## Content rules (must always hold)
Do not publish unverified pricing, subsidy amounts, service coverage, guarantees, certifications or testimonials. Representative imagery must be labelled as such. Estimates must show their assumptions and carry no savings or subsidy guarantee. Live generation data requires a real inverter/monitoring integration and must never be fabricated.

## Key docs
- `docs/IMPLEMENTATION_PLAN.md` — two-phase plan and gap analysis.
- `docs/TEST_CASES.md` — test case catalogue synced with the suites above.