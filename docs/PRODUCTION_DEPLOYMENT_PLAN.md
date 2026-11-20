# DSP Power Infra — Production Deployment Plan

Status: draft for approval · Last updated: 2026-11-21
Target domain: `https://dsppowerinfra.com` (currently does not resolve; registration/ownership must be confirmed)
Scope: first production launch at initial scale. No production secrets are required to complete Phase 0.

---

## 1. Goal and constraints

Put the existing site and enquiry desk on one small server at `dsppowerinfra.com`, with HTTPS, working enquiry emails, daily backups and uptime monitoring. Keep the architecture as simple as the workload allows.

Capacity assumption:

- Up to 10,000 requests and 100 enquiries, whether per month or per day.
- At 10k/day this is roughly 7 requests/minute and one enquiry every 15 minutes; a single small VPS is comfortably sufficient.
- Database growth at 100 enquiries/day is about 36,500 rows/year, a few tens of megabytes.
- Revisit only if sustained CPU above 70%, memory swapping, p95 latency above one second, or a real availability requirement appears.

Costs at this scale:

| Item | Decision | Cost |
|---|---|---|
| Domain | Must be purchased/claimed | ₹900–1,300/year |
| Server | One VPS, India region, 2 vCPU / 2 GB minimum (4 GB optional) | ₹600–2,000/month |
| DNS, CDN, TLS | Cloudflare free DNS + Let's Encrypt | ₹0 |
| Database | MySQL 8.4 container on the same VPS | ₹0 |
| Email alerts | Brevo free, 300 sends/day | ₹0 |
| Backups | Cloudflare R2 or Backblaze B2, ~10 GB free | ₹0 |
| Monitoring | UptimeRobot free, 5-minute checks | ₹0 |
| CI/builds | GitHub Actions free minutes | ₹0 |

Mandatory run rate: approximately ₹1,100–1,900/month including the domain. A leaner 2 GB VPS brings it to roughly ₹800–1,200/month.

Deliberately out of scope for launch: managed database, load balancer, multiple app instances, Redis, Kubernetes, paid CDN/WAF, multi-region, autoscaling, SSO, a separate staging server, paid analytics.

---

## 2. Target architecture

```
Internet
   |
Cloudflare DNS (proxy optional; start DNS-only)
   |
VPS: Ubuntu 24.04, Docker Compose
   |
   +-- web (nginx:alpine)  :80/:443
   |     - serves frontend/dist
   |     - SPA fallback to index.html
   |     - immutable cache for /assets/*
   |     - proxies /api/* to api:8081
   |     - TLS via Let's Encrypt (Certbot) or Caddy
   |
   +-- api (Spring Boot 4, Java 21, non-root)
   |     - internal only, port 8081
   |     - Flyway migrates on startup
   |
   +-- db (mysql:8.4)
         - internal only, no published port
         - named volume dsp_mysql_data
         - healthcheck before api starts
```

Same origin for site and API means the frontend's relative `/api/...` calls keep working with no CORS changes. Only ports 22, 80 and 443 are public.

---

## 3. Repository additions

No production secret is needed to write or test any of these files; they use placeholders and read secrets at runtime.

```
backend/Dockerfile                         # multi-stage Maven build -> JRE 21 runtime
frontend/Dockerfile                        # Node build -> nginx runtime
deploy/compose.prod.yml                    # web + api + db, healthchecks, log rotation
deploy/compose.local-test.yml              # local-only override (HTTP :8080, throwaway values)
deploy/nginx/dsp.conf                      # server block: SPA, API proxy, headers, CSP
deploy/nginx/security-headers.conf         # shared header include
deploy/env/.env.production.example         # committed template with CHANGE_ME values
deploy/scripts/bootstrap-server.sh         # Ubuntu packages, Docker, firewall, deploy user
deploy/scripts/deploy.sh                   # pull image tag, backup, up -d, prune
deploy/scripts/backup-mysql.sh             # dump + gzip + off-site copy + retention
deploy/scripts/restore-mysql.sh            # documented restore path
deploy/scripts/verify-live.sh              # smoke checks without credentials
.github/workflows/release.yml              # tests + build/push images to GHCR
docs/PRODUCTION_DEPLOYMENT_PLAN.md         # this file
```

---

## 4. Configuration and secrets

### 4.1 Production environment file

Lives only on the server at `/opt/dsp-power-infra/.env`, owned `root:root`, mode `600`. Never committed, never pasted into chat or logs. A copy is kept in DSP's password manager.

| Variable | Secret | Purpose |
|---|---|---|
| `SPRING_PROFILES_ACTIVE=prod` | No | Activates the fail-fast guard |
| `DB_URL=jdbc:mysql://db:3306/dsp_power_infra?useSSL=false&allowPublicKeyRetrieval=true` | No | Container-to-container DB connection |
| `DB_USERNAME` | No | Application DB user, e.g. `dsp_app` |
| `DB_PASSWORD` | Yes | Application DB password |
| `DB_ROOT_PASSWORD` | Yes | MySQL root password inside the container |
| `ADMIN_USERNAME` | No | Desk login name |
| `ADMIN_PASSWORD` | Yes | Desk password; must not equal `local-dev-admin` |
| `ADMIN_LOGIN_MAX_ATTEMPTS=5` | No | Sign-in lockout threshold |
| `ADMIN_LOGIN_WINDOW_MS=900000` | No | Lockout window |
| `NOTIFY_ENABLED=true` | No | Turns enquiry emails on |
| `NOTIFY_FROM=alerts@dsppowerinfra.com` | No | Verified sender at Brevo |
| `NOTIFY_TO=` | No | Optional fallback recipient; recipients are managed in `/admin` |
| `SITE_URL=https://dsppowerinfra.com` | No | "Open enquiry desk" link in alert emails |
| `SMTP_HOST=smtp-relay.brevo.com` | No | Mail relay |
| `SMTP_PORT=587` | No | STARTTLS port |
| `SMTP_USERNAME` | Semi | Brevo SMTP login |
| `SMTP_PASSWORD` | Yes | Brevo SMTP key |
| `SERVER_FORWARD_HEADERS_STRATEGY=native` | No | Makes rate limiting and lockout see real client IPs behind nginx |
| `JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=65` | No | Keeps the JVM inside a 2 GB server |
| `TZ=Asia/Kolkata` | No | Server timezone; admin dates are already India-based |
| `VITE_SITE_URL=https://dsppowerinfra.com` | No | Build-time base for canonical, OG and sitemap URLs |
| `VITE_GA_MEASUREMENT_ID` | No | Optional GA4 ID; analytics stays off when empty |

`ProdConfigGuard` refuses to start with the local development admin or DB password when the `prod` profile is active. The preview-only `/admin?key=` gate in `C:/Users/ganesh/dsp-preview/preview-server.js` is not deployed.

### 4.2 Secrets handling rules

- Generate passwords on the server, for example `openssl rand -base64 24`, and store them in a password manager.
- GitHub Actions uses `GITHUB_TOKEN` to push images to GHCR; no production secrets are needed for that.
- Automated deploy later needs an SSH key stored as a GitHub secret. Until then, deploy manually over SSH.
- Secrets are never baked into images, committed, logged or shared in chat.

### 4.3 DNS records

| Record | Value | When |
|---|---|---|
| `A @` | VPS IPv4 | Phase 2 |
| `A www` | VPS IPv4 (or CNAME to apex) | Phase 2 |
| `AAAA` | VPS IPv6, if available | Optional |
| SPF TXT | `v=spf1 include:spf.brevo.com ~all` (confirm exact include with Brevo) | Phase 4 |
| DKIM | Brevo-provided selector records | Phase 4 |
| DMARC TXT | `v=DMARC1; p=none; rua=mailto:...` then tighten | Phase 4 |
| MX | Only if a mailbox is wanted; not needed just to send alerts | Optional |

Start Cloudflare in DNS-only mode to keep client-IP handling simple. If the orange-cloud proxy is enabled later, configure nginx real-IP handling for Cloudflare ranges and re-test rate limiting.

---

## 5. Phase plan

### Phase 0 — Buildable now, without production secrets

- [ ] Write the deployment bundle listed in section 3, using placeholders.
- [ ] Backend Dockerfile: Maven build stage, JRE 21 runtime, non-root user, `/api/health` healthcheck.
- [ ] Frontend Dockerfile: Node build stage with `VITE_SITE_URL` build arg, nginx runtime.
- [ ] Nginx config: SPA fallback, `/api` proxy, forwarded headers, gzip, immutable assets, no-store for index/API, CSP compatible with the inline theme script, HSTS and security headers.
- [ ] Compose file: internal network, no DB port published, healthchecks, `restart: unless-stopped`, log rotation, env file references.
- [ ] Server bootstrap script: Docker Engine + Compose plugin, UFW (22/80/443), unattended upgrades, deploy user, SSH hardening notes.
- [ ] Backup, restore, deploy and verify scripts.
- [ ] GitHub Actions release workflow that runs both test suites and pushes tagged images to GHCR.
- [ ] Absolute URL work: canonical/OG/JSON-LD/sitemap/robots use `VITE_SITE_URL` with `https://dsppowerinfra.com` as the default; tests updated.
- [ ] Production-like local run with `compose.local-test.yml`: HTTP on `localhost:8080`, throwaway DB/admin values, no email, verifying the three containers, SPA routes and lead flow.
- [ ] Document the runbook, rollback and go-live checklist (this file, plus a short `deploy/README.md` if useful).

### Phase 1 — Needs server access

- [ ] Purchase/claim the VPS; record the IP and provider.
- [ ] Run `bootstrap-server.sh`; confirm Docker, firewall and SSH access.
- [ ] Create `/opt/dsp-power-infra` layout and the production `.env` with real secrets.
- [ ] Pull images and start the stack with `NOTIFY_ENABLED=false` for the first boot.
- [ ] Verify migrations, `/api/health`, `/api/ready`, `/`, `/admin` login locally on the server.

### Phase 2 — Needs domain and DNS access

- [ ] Confirm ownership/registration of `dsppowerinfra.com`.
- [ ] Add A records for apex and `www`; wait for propagation.
- [ ] Issue the Let's Encrypt certificate; confirm auto-renewal.
- [ ] Redirect HTTP to HTTPS and `www` to apex.
- [ ] Enable HSTS only after HTTPS is verified.

### Phase 3 — Needs production secrets

- [ ] Set a strong `ADMIN_PASSWORD`, `DB_PASSWORD` and `DB_ROOT_PASSWORD`.
- [ ] Confirm `ProdConfigGuard` allows startup and default credentials are rejected.
- [ ] Create the DB user with rights only on `dsp_power_infra`.
- [ ] Log in to `/admin` over HTTPS, change/verify the password, and confirm wrong-password lockout.

### Phase 4 — Email and domain authentication

- [ ] Create the Brevo account and SMTP key.
- [ ] Verify the sender `alerts@dsppowerinfra.com`.
- [ ] Add SPF, DKIM and DMARC records and wait for DNS propagation.
- [ ] Set `NOTIFY_ENABLED=true`, `NOTIFY_FROM` and `SITE_URL`; restart the API.
- [ ] Add recipients in the desk and send a test email; confirm inbox placement.
- [ ] Submit a real smoke enquiry and confirm the branded alert, Reply-To and desk link.

### Phase 5 — Backups and monitoring

- [ ] Create an R2/B2 bucket and credentials; install `rclone` on the server.
- [ ] Schedule `backup-mysql.sh` daily; retain 30 days locally and off-site.
- [ ] Run a restore into a scratch database and verify row counts and login.
- [ ] Add UptimeRobot checks for `/api/health`, `/api/ready` and `/`.
- [ ] Add disk-space and TLS-expiry checks; decide who receives alerts.

### Phase 6 — Go-live verification

- [ ] `https://dsppowerinfra.com/` loads with a valid certificate; HTTP and `www` redirect.
- [ ] `/solar-calculator`, a results deep link, every primary route and the 404 page work directly.
- [ ] A calculator-sourced enquiry saves, appears in the desk and emails the team.
- [ ] `/admin` login works; unauthenticated admin API calls return 401; repeated failures return 429.
- [ ] `/api/health` is 200; `/api/ready` reports the database up; stopping the DB returns 503.
- [ ] Assets are cached as immutable; index and API responses are not cached.
- [ ] No mixed content, no console errors, no horizontal overflow at 390 px.
- [ ] `sitemap.xml`, `robots.txt` and OG tags use the production origin.
- [ ] Mobile Lighthouse on the live URL is comparable to the local 94/93 performance scores.
- [ ] Backups have run once and a restore has been tested.
- [ ] The preview server, ngrok tunnel and keyed admin gate are not part of production.

---

## 6. Deployment and rollback

Deployment flow:

1. Push to `main`; CI runs backend and frontend tests.
2. Release workflow builds images tagged with the commit SHA and pushes them to GHCR.
3. On the server, run `backup-mysql.sh`, then `deploy.sh <sha>`.
4. `deploy.sh` pulls the tag, runs `docker compose up -d`, waits for health and runs `verify-live.sh`.
5. Keep the previous two image tags for rollback.

Rollback:

- Set `IMAGE_TAG` to the previous SHA and run `docker compose up -d`.
- Flyway migrations are forward-only. Take a database dump before every deploy; restore it only if a release contained a destructive migration.
- Database restore procedure is defined in `restore-mysql.sh` and must be rehearsed before launch.

Operational notes:

- Brief downtime during `up -d` is acceptable at this scale; no zero-downtime requirement.
- Docker logs use `json-file` with `max-size=10m`, `max-file=3`.
- OS security updates run automatically; review container image updates monthly and redeploy.
- Current application logging covers failures, email delivery and cleanup, but not every desk action. Audit logging is a separate recommended improvement, not a launch blocker.
- In-memory rate limiting and sign-in lockout are per instance; fine for one server, revisit before running multiple instances.

---

## 7. Open inputs needed from DSP

1. Confirm the domain is owned or available; provide registrar access or transfer it to a known account.
2. Choose the VPS provider and India region; provide the IP and SSH access.
3. Choose the desk username and a strong password (stored in the password manager, not shared in chat).
4. Decide the alert inbox: existing Gmail or a new `alerts@dsppowerinfra.com` mailbox.
5. Decide whether GA4 is wanted before launch, and provide the measurement ID if so.
6. Decide who receives uptime and backup alerts.
7. Confirm the final WhatsApp number, business hours and experience-centre address for the public site (content, not deployment).

---

## 8. What can be implemented now without any production secret

Everything in Phase 0: Dockerfiles, compose files, nginx configuration, environment template with placeholders, bootstrap/deploy/backup/restore/verify scripts, GitHub Actions release workflow, absolute-URL support, production headers and CSP, forwarded-header configuration, local production-like smoke test, and the runbook. All of it can be built and verified on this machine with throwaway credentials.

Blocked only by external access or secrets: domain purchase and DNS, server provisioning and SSH, real admin/database passwords, Brevo SMTP key and sender verification, SPF/DKIM/DMARC records, backup storage credentials, TLS issuance, uptime-monitor accounts, and the final live smoke test with real email.
