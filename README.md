# DSP Power Infra website

Local workspace for the DSP Power Infra solar platform.

## Stack
- React + Vite frontend
- Java 21 + Spring Boot 4.1.2 REST API
- MySQL database
- Private leads API protected with an ADMIN role

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
3. In a second terminal, run the frontend:
   `cd frontend`
   `npm install`
   `npm run dev`
4. Visit http://127.0.0.1:5173. The Vite development server proxies `/api` requests to the backend on port 8081. The private team area is at http://127.0.0.1:5173/admin.

## Current scope
The local website now has routed public pages for home, residential, commercial, housing societies, grid-connected, hybrid and off-grid solar, project process, EMI estimate, subsidy information, projects, service areas, solar guides, referrals, consultations, webinars, partners and company information. The private team area is at `/admin`.

The consultation form sends leads to `POST /api/leads`. Leads are stored in the MySQL `dsp_power_infra` database and can be viewed through the authenticated `GET /api/admin/leads` endpoint. The database and backend must be running for a submission to save. If the service is unavailable, the form reports that the lead was not saved.

The solar calculator has an input route at `/solar-calculator` and a shareable results route at `/solar-calculator/results`. Results use visible, adjustable assumptions for tariff, monthly solar generation, system cost and roof area; they are illustrative and do not include subsidy or guarantee claims. These assumptions need review against DSP's actual pricing and service data before client use.

These pages are an original DSP-branded foundation inspired by the kinds of customer journeys on the reference site. They do not claim SolarSquare's project statistics, guarantees, coverage, testimonials or policy figures. Detailed savings estimates, article content, city landing pages, customer portals, live inverter monitoring and advanced lead workflows still require company data, business rules and the relevant integrations.

Do not publish unverified pricing, subsidy amounts, service coverage, guarantees, certifications or testimonials. Live generation data requires a compatible inverter/monitoring integration and must never be fabricated.

For production, configure HTTPS, backups, rate limiting, email delivery, secure user management, privacy/consent handling and deployment monitoring.
