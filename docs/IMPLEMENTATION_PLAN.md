# DSP Power Infra — Two-Phase Implementation & 4-Day Deployment Plan

Reference: https://www.solarsquare.in/ · Repo: `Rohitgarje19/dsp-power-infra-website`
Stack (already chosen, keep it): React 19 + Vite 7 frontend · Java 21 + Spring Boot backend · MySQL 8.4 · REST

---

## 1. Architecture decisions (locked for the 4-day build)

| Decision | Choice | Why |
|---|---|---|
| Project structure | Feature-first (already: `lead/` module). Add `serviceability/`, `content/`, `notify/` modules the same way | Matches existing code, no restructure cost |
| Routing | Add `react-router-dom` (replace pathname `if/else` + full page reloads) | Client-side nav, scroll restoration, active nav state, 404 handling |
| API client | Typed fetch wrapper `src/lib/api.js` with central error mapping | Small app; React Query is overkill for 4 days |
| Auth | Keep HTTP Basic + ADMIN role for `/admin` (single team user), HTTPS mandatory in prod | Already works; JWT/refresh is a post-launch upgrade |
| DB migrations | Flyway, replace `ddl-auto=update` with `validate` | Safe schema changes on a live DB |
| Real-time | Keep 15s admin polling | <10 admin users; SSE not worth it now |
| Error handling | `@RestControllerAdvice` global handler → consistent `{code,message,requestId}` JSON; typed `ApiError` on frontend | Currently raw text errors leak to UI |
| Deployment | Single VPS + Docker Compose: **nginx** (serves built frontend + proxies `/api`) → **Spring Boot jar** → **MySQL**, Let's Encrypt HTTPS | Same-origin (zero CORS issues), one server to manage, fits 4 days. Alternative: Vercel (frontend) + Render/Railway (API) + managed MySQL — only if no VPS access |

---

## 2. Gap analysis — what exists vs. what SolarSquare has

### ✅ Already implemented (verified in code)

| Area | Status |
|---|---|
| Home page: hero, quick-estimate band (PIN + bill), solutions grid, why-us, approach, 4-step process, EMI calculator, consultation CTA, contact + lead form | Working |
| Solar savings calculator `/solar-calculator` → shareable `/solar-calculator/results` with adjustable tariff/yield/cost/area assumptions, live preview, payback | Working |
| Lead pipeline: form → `POST /api/leads` (validated both sides) → MySQL | Working |
| Admin `/admin`: Basic-auth login, Active/Resolved/Deleted tabs, search, detail modal, resolve/restore/soft-delete/permanent-delete, 15-day auto-purge (`DeletedLeadCleanup`), 15s polling, copy phone/email, WhatsApp + Gmail deep links with prefilled message | Working |
| Backend: Bean Validation on `LeadRequest`, role-secured admin endpoints, `/api/health`, dev CORS, BCrypt | Working |
| 18 routed pages (homes, commercial, societies, on/hybrid/off-grid, how-it-works, subsidy-guide, about, projects, blog, refer, experience-centre, webinars, partners, service-areas, contact, 404) | **Routes exist but are generic template shells** — same 4 boilerplate cards on every page |
| Photos (`hero.jpg`, `banner-a/b/c.jpg`, `house-dusk.jpg`, `panels-sunset.jpg`, `sunrise-roof.jpg`) | **Present in `public/images/` but unused** — hero is an SVG illustration |

### ❌ Remaining (the actual work)

**A. Content & conversion (biggest gap vs SolarSquare)**
1. Real, distinct content on Homes / Commercial / Housing-society pages (SolarSquare's are full landing pages: benefits, system sizes & indicative pricing, process, financing, FAQ, lead form per page).
2. Real content on On-grid / Hybrid / Off-grid pages (comparison table, components, who-it's-for, FAQ).
3. Homepage additions: photo hero (assets already exist), animated stats band, FAQ accordion, testimonials/ratings **only with real DSP data**, media/certifications strip **only if real**.
4. **Subsidy (PM Surya Ghar) integration**: subsidy slab logic in calculator results (₹30k/kW × first 2 kW + ₹18k for 3rd kW, cap ₹78k — verify current rules), net cost + payback-after-subsidy, real `/subsidy-guide` content with steps & eligibility.
5. **PIN-code serviceability**: serviceable-area list (Pune + confirmed areas), calculator + lead form show "we'll confirm availability" state for unknown PINs instead of silently accepting.
6. Lead capture from calculator results (prefill bill/PIN/city into form — currently context is lost), sticky mobile "Get Free Quote" bar, floating WhatsApp button.
7. Lead source tracking: page path, UTM params, calculator context sent with each lead; shown in admin detail.
8. Projects gallery page (real photos/captions), About page (real team/story), Contact page polish (map embed, hours).
9. Blog: 4–6 real starter articles (solar basics, sizing, subsidy steps, maintenance, on-grid vs hybrid, financing) as static MD/JSON content with list + article routes.
10. Refer-a-friend: working referral form (reuses lead API with `source=referral` + referrer fields).
11. **Privacy Policy + Terms pages** (legally required before collecting leads publicly) and consent checkbox linking to them.
12. Full footer: link columns (Offerings / Solutions / Quick links / Contact), socials, city links.

**B. Frontend engineering**
13. `react-router-dom` migration; scroll-to-top on route change; active nav state; sticky header; anchor offsets.
14. SEO: per-route `<title>`/meta description, Open Graph, `sitemap.xml`, `robots.txt`, LocalBusiness JSON-LD, semantic headings, image `alt`/lazy loading, favicon set.
15. Split the 961-line `App.jsx` into `pages/`, `components/`, `lib/` (required to keep tests + parallel work sane).
16. Loading/error/empty states everywhere; human-readable API error mapping; form field-level errors.
17. Mobile QA pass on every page (nav drawer, calculator sliders, admin table → cards).

**C. Backend engineering**
18. Global exception handler + consistent error JSON + request-ID logging (structured).
19. Rate limiting on `POST /api/leads` (e.g. Bucket4j, 5/min per IP) + honeypot field.
20. **New-lead notification** to team (email via SMTP; WhatsApp click-to-chat is already there for follow-up).
21. Flyway migrations (`V1__leads.sql` from current entity, `V2__lead_source_fields.sql`).
22. Lead API additions: `GET /api/admin/leads?status=&q=&page=` (pagination + server filter), `GET /api/admin/leads/export.csv`, `PATCH /api/admin/leads/{id}/notes`.
23. `GET /api/serviceability/{pincode}` + configurable serviceable PIN prefixes.
24. Actuator `/health` + `/ready`; graceful shutdown; `.env.example`; prod config profile (no default passwords — fail fast if `ADMIN_PASSWORD` unset in prod).
25. Dockerfiles (frontend build → nginx image; backend jar image) + full `docker-compose.yml` (nginx + api + mysql) + nginx conf (SPA fallback, gzip, cache headers, `/api` proxy, HTTPS redirect).

**D. Quality & deployment**
26. **Zero tests exist today.** Backend: JUnit 5 + MockMvc + H2. Frontend: Vitest + React Testing Library. E2E: Playwright (see `TEST_CASES.md`).
27. Deploy to VPS: DNS → server, compose up, certbot HTTPS, smoke test, DB backup cron, uptime check.
28. Lighthouse pass (perf/SEO/a11y ≥ 90 target on home + calculator).

**Explicitly out of scope for 4 days** (SolarSquare has them; needs business data/integrations): live inverter monitoring app, customer portal, city-wise landing page fleet (31 cities), webinars platform, EMI/lender integration, Hindi localization, GoodZero-style savings guarantee (legal commitment — never fabricate).

---

## 3. Phase 1 — Days 1–2: "Conversion-ready public site + hardened lead pipeline"

Goal: a visitor can land, understand the offer, calculate savings **with subsidy**, and submit a lead from any page; the team is notified and can manage it. Everything shipped with tests.

### Day 1 (frontend structure + content + calculator)
- [ ] Install `react-router-dom`, `vitest`, `@testing-library/react`; split `App.jsx` → `components/` (Header, Footer, LeadForm, Calculator, FAQ, Stats, WhatsAppButton, StickyCTA), `pages/`, `lib/api.js`, `lib/solar.js` (pure calc functions), `lib/subsidy.js`
- [ ] Photo hero + stats band + FAQ accordion on Home (use existing images; stats/testimonials only from real DSP data — else omit, never fabricate)
- [ ] Real content: Homes, Commercial, Housing Societies, On-grid, Hybrid, Off-grid (shared rich-page template + per-page data: benefits, sizing/pricing table if verified, comparison, FAQ, embedded lead form)
- [ ] `lib/subsidy.js` + results page: subsidy amount, net cost, payback after subsidy, "verify current rules" disclaimer; real `/subsidy-guide` page
- [ ] Serviceability check in calculator + lead form (config-driven PIN prefix list)
- [ ] Lead form v2: source page + UTM + calculator context, field-level errors, consent → Privacy/Terms links; results-page CTA prefills form
- [ ] Privacy Policy + Terms pages, full footer, WhatsApp float + sticky mobile CTA
- **Tests written same day:** TC-CALC-01…08, TC-SUB-01…06, TC-SVC-01…04, TC-FORM-01…08 (see TEST_CASES.md)

### Day 2 (backend hardening + admin upgrades + SEO)
- [ ] Flyway V1/V2; `ddl-auto=validate`; prod profile fails fast on missing secrets
- [ ] Global error handler + request-ID structured logging; rate limit + honeypot on lead POST
- [ ] Lead source/UTM/context columns + notes column; pagination/filter on admin list; CSV export; admin notes UI
- [ ] Email notification on new lead (SMTP env config; log-and-continue if SMTP down — never lose the lead)
- [ ] `/api/serviceability/{pincode}`; Actuator health/ready; graceful shutdown; `.env.example`
- [ ] SEO: per-route meta, sitemap.xml, robots.txt, JSON-LD, OG tags
- [ ] Blog engine (static content) + first 2 articles; referral form (`source=referral`)
- **Tests written same day:** TC-API-01…14, TC-ADM-01…08, TC-NOTIF-01…03, TC-SEO-01…04
- **End of Day 2 gate:** full Phase-1 test suite green; complete lead journey works locally end-to-end.

## 4. Phase 2 — Days 3–4: "Complete content, E2E quality, production deployment"

### Day 3 (remaining content + E2E + production packaging)
- [ ] Remaining blog articles (4–6 total), Projects gallery, About, Experience-centre/Consultation, Webinars (honest "upcoming" + notify-me lead capture), Partners page with form
- [ ] Mobile QA pass on all routes; a11y pass (focus, contrast, labels, keyboard nav for menus/accordion/modal)
- [ ] Playwright E2E: TC-E2E-01…06 (visit → calculate → lead → admin sees it → resolve → restore → delete)
- [ ] Dockerfiles + full compose (nginx/api/mysql) + nginx conf; build both images locally and smoke test the composed stack
- [ ] Lighthouse + fixes (image sizes/webp, lazy load, font display)
- **Gate:** E2E green against the Dockerized stack, not just dev servers.

### Day 4 (deploy + verify + handover)
- [ ] Provision VPS (2 vCPU / 4 GB is enough), install Docker, point DNS A record
- [ ] `docker compose up -d`, certbot HTTPS, HTTP→HTTPS redirect, secure admin password, MySQL volume + nightly `mysqldump` cron
- [ ] Production smoke: TC-DEP-01…08 (health, lead submit from phone + desktop, admin login over HTTPS, rate limit, static caching, SPA deep links, sitemap/robots, backup restore drill)
- [ ] Uptime check (free tier UptimeRobot / cron curl), error-log review
- [ ] Fix anything the smoke tests surface; final full-suite run; tag `v1.0.0`; update README run/deploy instructions
- **Buffer:** keep last half-day free — it always gets used.

### Inputs needed from you (blocking items — collect on Day 1)
1. **Domain + VPS access** (or tell us to use Vercel+Render instead).
2. **Real business data**: installations count / kW done (or permission to omit stats), real customer testimonials + photos, certifications, confirmed service areas/PIN list, indicative pricing per kW (or keep "assumptions adjustable" approach), team photos for About.
3. **SMTP credentials** for lead notifications (e.g. Gmail app password or Zoho) + WhatsApp business number (currently +91 91464 67074 — confirm).
4. Confirm current PM Surya Ghar subsidy slabs before we publish numbers.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Real content/data arrives late | Pages built data-driven; ship with honest placeholders removed (omit section) — never fake stats/testimonials |
| VPS/DNS delays | Dockerized stack is host-agnostic; fallback Vercel+Render deploy in ~2h |
| Scope creep (monitoring app, portal, 31 city pages) | Explicitly post-launch; listed out of scope above |
| Subsidy rules wrong | Central `subsidy.js` config + disclaimer + verify-before-launch checklist item |

---

## 5. Definition of done (launch checklist)

- [ ] Every nav/footer link leads to a real, distinct, mobile-clean page (no template shells)
- [ ] Lead can be submitted from home, any solution page, calculator results, contact, referral — all land in MySQL with source context, team gets email
- [ ] Calculator: bill → kW → generation → subsidy → net cost → payback, all assumptions visible/adjustable; shareable URL reproduces results
- [ ] Admin: login, search, filter tabs, details, notes, resolve/restore/delete/purge, CSV export — over HTTPS only
- [ ] Privacy/Terms live and linked from every form
- [ ] All test suites green: backend (JUnit/MockMvc), frontend (Vitest/RTL), E2E (Playwright) — see `docs/TEST_CASES.md`
- [ ] Lighthouse ≥ 90 perf/SEO/a11y on home + calculator (mobile)
- [ ] HTTPS, rate limiting, no default credentials, DB backups, uptime monitor