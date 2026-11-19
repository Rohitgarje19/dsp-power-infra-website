// All site copy lives here so pages stay thin and content stays reviewable.
// Rule: no fabricated statistics, testimonials, guarantees or certifications.

export const CONTACT = {
  phone: "+91 91464 67074",
  phoneHref: "tel:+919146467074",
  whatsapp: "919146467074",
  email: "dsp.powerinfra@gmail.com",
  city: "Pune, Maharashtra",
};

export const NAV_SOLUTIONS = [
  { name: "Homes", url: "/homes", desc: "Rooftop solar for your home" },
  { name: "Housing societies", url: "/housing-societies", desc: "Shared and common-area loads" },
  { name: "Commercial", url: "/commercial", desc: "Offices, shops and warehouses" },
  { name: "On-grid solar", url: "/on-grid-solar", desc: "Works alongside your utility supply" },
  { name: "Hybrid solar", url: "/hybrid-solar", desc: "Solar, grid and storage options" },
  { name: "Off-grid solar", url: "/off-grid-solar", desc: "Designed around actual loads" },
];

export const HOME_FAQS = [
  {
    q: "What does DSP Power Infra actually do?",
    a: "We are a solar EPC company based in Pune. EPC means engineering, procurement and construction — we design your system, supply the panels, inverter and structure, install everything, and support you after switch-on. One team handles the whole project instead of you coordinating separate vendors.",
  },
  {
    q: "How much roof space do I need?",
    a: "A rough planning figure is 80 sq ft of unshaded roof per kW. A typical 3 kW home system therefore needs about 240 sq ft. The exact layout depends on your roof shape, shadows from water tanks or neighbouring buildings, and panel orientation — which is why we survey before quoting.",
  },
  {
    q: "Will solar really cut my electricity bill?",
    a: "A correctly sized on-grid system offsets the energy you generate and use (or export under net metering). Savings depend on your tariff, daytime usage, roof conditions and local export rules. Our calculator shows an estimate with every assumption visible — treat it as a starting point, not a promise.",
  },
  {
    q: "Is there a government subsidy for home solar?",
    a: "Under the PM Surya Ghar scheme, eligible residential rooftops can receive ₹30,000 per kW for the first 2 kW and ₹18,000 for the third kW — up to ₹78,000. Eligibility, approved equipment and the application process matter, and rules can change. We guide you through the current process; see our subsidy guide.",
  },
  {
    q: "What happens after installation?",
    a: "We hand over documentation, explain monitoring, and stay available for maintenance and questions. Panel cleaning, connection checks and generation reviews keep a system performing year after year. Ask us about maintenance options for your site.",
  },
  {
    q: "Do you work outside Pune?",
    a: "Pune and nearby regions are our core service area. For other locations, share your PIN code — coverage depends on project size, team availability and site conditions, and we confirm case by case before committing.",
  },
];

export const SOLUTION_PAGES = {
  "/homes": {
    eyebrow: "Residential rooftop solar",
    title: "Solar for your home, planned around your life.",
    lede: "Your roof, your bill and your routine decide the right system. We survey first, explain every option, and handle installation and subsidy paperwork end to end.",
    image: "/images/banner-a.jpg",
    imageAlt: "Rooftop solar panels at sunset",
    benefits: [
      ["Lower bills", "Generate your own power through the day and offset what you buy from the grid. The size is matched to your actual consumption, not a sales target."],
      ["Subsidy support", "Eligible homes can claim up to ₹78,000 under PM Surya Ghar. We help with the portal application, approvals and inspections so you don't chase paperwork."],
      ["One responsible team", "Survey, design, supply, installation and commissioning by DSP — no juggling panel sellers, electricians and installers."],
      ["Built for Indian weather", "Mounting structure, anchoring and cable routing planned for monsoon, heat and wind at your specific site."],
    ],
    steps: [
      ["Share your bill", "Send your average monthly bill and PIN code. We estimate consumption and a sensible system size."],
      ["Free site survey", "We measure usable roof area, check shadows, structure and your meter connection."],
      ["Clear proposal", "You see the design, components, cost, subsidy estimate and assumptions — in writing."],
      ["Install & switch on", "Our team installs, commissions and helps with net metering and subsidy steps."],
    ],
    table: {
      title: "Typical home system sizes (planning guide)",
      head: ["System", "Monthly bill it suits", "Roof area (approx.)", "PM Surya Ghar subsidy*"],
      rows: [
        ["1 kW", "Up to ₹1,200", "80 sq ft", "₹30,000"],
        ["2 kW", "₹1,200 – ₹2,400", "160 sq ft", "₹60,000"],
        ["3 kW", "₹2,400 – ₹4,000", "240 sq ft", "₹78,000 (cap)"],
        ["5 kW", "₹4,000 – ₹7,000", "400 sq ft", "₹78,000 (cap)"],
      ],
      note: "*Subsidy slabs as published under PM Surya Ghar; eligibility and current rules must be verified. Bill ranges assume ~₹8/unit and ~120 kWh/kW/month — your survey confirms the real size.",
    },
    faqs: [
      { q: "Will my roof be damaged during installation?", a: "Anchoring points are planned on your roof type (RCC or metal sheet) and sealed properly. We inspect the structure before design and leave the site clean." },
      { q: "What if there is a power cut?", a: "A standard on-grid system shuts down during outages for safety (anti-islanding). If you need backup, ask us about hybrid configurations with batteries." },
      { q: "How long does a home installation take?", a: "Typically a few working days on site once material is ready and approvals are in place. The survey-to-switch-on timeline depends on net metering and subsidy approvals." },
      { q: "Can I finance the system?", a: "Many banks and NBFCs offer solar loans, and some offer EMI options. Use our EMI tool to explore repayments; final terms come from the lender." },
    ],
  },
  "/commercial": {
    eyebrow: "Commercial & industrial solar EPC",
    title: "A practical solar plan for your business.",
    lede: "Offices, shops, warehouses and factories run on daytime loads — exactly when solar generates. We engineer systems around your demand profile, roof and budget.",
    image: "/images/banner-b.jpg",
    imageAlt: "Solar array on a large rooftop",
    benefits: [
      ["Daytime load match", "Businesses consume power when the sun shines, so self-consumption is high and payback is usually faster than homes."],
      ["Engineering first", "Load study, shadow analysis, structural check and single-line diagrams before any quote — sized for your demand, not a catalogue."],
      ["Depreciation & cost control", "Commercial solar can carry tax depreciation benefits; we provide the documentation your accountant needs (confirm with your advisor)."],
      ["Minimal disruption", "Installation planned around your operations, with safety protocols for occupied buildings and working sites."],
    ],
    steps: [
      ["Understand demand", "Share bills and load patterns; we identify the right capacity and connection approach."],
      ["Site engineering", "Roof/ground assessment, structural review, shadow and access study."],
      ["Proposal & business case", "Capex, generation estimate, payback and O&M scope in a clear document."],
      ["Delivery & handover", "Procurement, installation, commissioning, testing records and team handover."],
    ],
    table: {
      title: "Where commercial solar fits",
      head: ["Site type", "Typical loads", "What we check first"],
      rows: [
        ["Offices & IT parks", "AC, lighting, workstations", "Daytime profile, roof rights, DG sync"],
        ["Shops & showrooms", "Refrigeration, lighting, AC", "Sanctioned load, metering, roof access"],
        ["Warehouses", "Lighting, fans, charging", "Large roof spans, sheet condition, fire norms"],
        ["Small industry", "Machines, pumps, compressors", "Load factor, power quality, expansion plans"],
      ],
      note: "Every commercial site is engineered individually — there is no one-size price list.",
    },
    faqs: [
      { q: "Is there a subsidy for commercial solar?", a: "PM Surya Ghar residential subsidy does not apply to commercial installations. Businesses instead benefit from self-consumption savings and, where applicable, accelerated depreciation — confirm with your tax advisor." },
      { q: "Can solar run our machinery?", a: "Solar offsets grid consumption; heavy or sensitive loads need proper design of inverter capacity, protection and sometimes DG coordination. We study your loads before proposing." },
      { q: "Who maintains the plant?", a: "We offer maintenance support — cleaning, inspection and generation review. Scope and frequency are agreed in the proposal." },
    ],
  },
  "/housing-societies": {
    eyebrow: "Apartments & housing societies",
    title: "Solar planning for shared spaces.",
    lede: "Common-area loads — lifts, pumps, corridor lighting, clubhouses — run all day. Solar on society rooftops can cut the maintenance bill every member pays.",
    image: "/images/banner-c.jpg",
    imageAlt: "Residential buildings with rooftop solar potential",
    benefits: [
      ["Lower maintenance bills", "Offset common-area consumption so monthly society charges ease for every flat."],
      ["Consensus made easy", "We present a clear proposal with numbers, visuals and assumptions that committees can review and approve."],
      ["Common metering expertise", "Society systems connect to the common meter; we handle the utility coordination and documentation."],
      ["Phased options", "Start with the loads that matter most and expand later — the design keeps future capacity in mind."],
    ],
    steps: [
      ["Map shared usage", "Collect common-area bills and identify which loads solar should serve."],
      ["Assess rooftops", "Check terrace area, shadows, structural condition and access for installation."],
      ["Committee proposal", "A transparent document: size, cost, savings estimate, subsidy position and timeline."],
      ["Coordinate delivery", "Installation planned around residents, with safety and clean handover."],
    ],
    table: {
      title: "Common-area loads solar serves well",
      head: ["Load", "Runs when", "Solar fit"],
      rows: [
        ["Water pumps", "Daytime top-ups", "Excellent — direct daytime match"],
        ["Lifts", "All day", "Good — steady common load"],
        ["Corridor & garden lighting", "Evening/night", "Via net metering credit"],
        ["Clubhouse / gym AC", "Day & evening", "Good daytime overlap"],
      ],
      note: "Society subsidy rules differ from individual homes (a separate per-kW scheme exists for group housing). We verify current eligibility before promising any amount.",
    },
    faqs: [
      { q: "Who owns the system?", a: "The society owns it; the proposal documents ownership, maintenance responsibility and how savings flow into society accounts." },
      { q: "Do individual flats get separate benefits?", a: "Common-area solar reduces shared bills. Individual flat owners can separately explore rooftop rights and their own PM Surya Ghar eligibility where the terrace allocation allows." },
      { q: "What approvals are needed?", a: "Typically a committee resolution, utility approval for the common meter connection, and structural safety confirmation. We list every approval in the proposal." },
    ],
  },
  "/on-grid-solar": {
    eyebrow: "Grid-connected systems",
    title: "On-grid solar, explained clearly.",
    lede: "The most common and cost-effective setup: panels feed your loads first, surplus exports to the grid under net metering, and the grid fills any gap. No batteries needed.",
    image: "/images/panels-sunset.jpg",
    imageAlt: "Grid-connected rooftop panels in evening light",
    benefits: [
      ["Lowest cost per kW", "No battery bank means lower upfront cost and simpler maintenance — ideal where grid supply is reliable."],
      ["Net metering", "Exported units are credited against imported units as per your state's rules, so daytime generation offsets night usage."],
      ["Subsidy eligible", "On-grid residential systems are the configuration PM Surya Ghar supports."],
      ["Proven & simple", "Panels, string inverter, protection and a bi-directional meter — fewer components, fewer failure points."],
    ],
    steps: [
      ["Check your connection", "Sanctioned load, meter type and state net-metering rules decide feasibility."],
      ["Design the array", "Panel layout, inverter sizing and protection per site conditions."],
      ["Utility coordination", "Application, inspection and bi-directional meter installation."],
      ["Commission & monitor", "Testing, handover and generation tracking."],
    ],
    table: {
      title: "On-grid vs hybrid vs off-grid",
      head: ["", "On-grid", "Hybrid", "Off-grid"],
      rows: [
        ["Needs grid", "Yes", "Yes (optional backup)", "No"],
        ["Battery", "No", "Optional", "Required"],
        ["Works in power cut", "No", "Yes (backup loads)", "Yes"],
        ["Relative cost", "Lowest", "Higher", "Highest per usable kWh"],
        ["Best for", "Reliable-grid homes & businesses", "Backup needs + savings", "No-grid sites"],
      ],
      note: "We recommend the configuration your site actually needs — not the most expensive one.",
    },
    faqs: [
      { q: "Why does on-grid solar switch off in a power cut?", a: "Anti-islanding protection: feeding a dead grid could electrocute line workers. Hybrid systems with batteries can island safely and power selected loads." },
      { q: "What is net metering?", a: "A bi-directional meter records import and export; your bill nets the two under state rules. Some states use net billing or gross metering — we confirm your local rule before design." },
      { q: "How long do panels last?", a: "Quality panels carry 25-year performance warranties; inverters typically 5–10 years with extendable options. We specify brands and warranty terms in the proposal." },
    ],
  },
  "/hybrid-solar": {
    eyebrow: "Solar with storage options",
    title: "Hybrid solar for flexible power planning.",
    lede: "Solar plus grid plus battery: save on bills like on-grid, and keep essential loads running through outages. Storage is sized to your real backup needs — not oversold.",
    image: "/images/house-dusk.jpg",
    imageAlt: "Home at dusk with solar and storage potential",
    benefits: [
      ["Backup without a generator", "Batteries carry selected loads — lights, fans, fridge, Wi-Fi, work laptop — through outages, silently."],
      ["Still bill-saving", "Daytime solar serves loads and charges storage; grid interaction follows your metering rules."],
      ["Right-sized storage", "We list your essential loads and runtime targets, then size the battery honestly — autonomy has a cost, and we show it."],
      ["Future-ready", "Hybrid inverters accept battery expansion later, so you can start small."],
    ],
    steps: [
      ["Define backup needs", "Which loads must run, and for how long? This decides battery capacity."],
      ["Size storage carefully", "kWh needed = load × hours ÷ usable depth — shown in your proposal."],
      ["Review operating modes", "Self-consumption, backup reserve and grid-charge behaviour explained."],
      ["Confirm compatibility", "Inverter, battery chemistry and warranty terms matched before purchase."],
    ],
    table: {
      title: "Backup planning example",
      head: ["Essential load", "Power", "4-hour runtime needs"],
      rows: [
        ["4 LED lights + 2 fans", "~200 W", "~0.8 kWh"],
        ["+ Fridge", "~350 W avg", "~1.4 kWh"],
        ["+ Wi-Fi & laptop", "~450 W", "~1.8 kWh"],
        ["+ 1 AC (1 ton, inverter)", "~1.2 kW", "~4.8 kWh"],
      ],
      note: "Illustrative planning figures. Real battery sizing uses your measured loads and the battery's usable capacity.",
    },
    faqs: [
      { q: "Is hybrid worth it over on-grid?", a: "If outages are rare, on-grid usually wins on cost. If backup matters, hybrid replaces a generator/inverter setup with one integrated system. We compare both for your site." },
      { q: "How long do batteries last?", a: "Lithium (LFP) batteries typically carry 5–10 year warranties with thousands of cycles; lead-acid is cheaper upfront but shorter-lived. We quote both honestly." },
      { q: "Does hybrid get the subsidy?", a: "Subsidy rules focus on grid-connected residential systems; storage eligibility can vary. We verify the current position before including any subsidy in a hybrid quote." },
    ],
  },
  "/off-grid-solar": {
    eyebrow: "Independent power systems",
    title: "Off-grid solar designed around actual loads.",
    lede: "For sites without a utility connection — farmhouses, remote facilities, telecom and rural projects. Every watt must be earned and stored, so load discipline comes first.",
    image: "/images/sunrise-roof.jpg",
    imageAlt: "Sunrise over an independent rooftop installation",
    benefits: [
      ["Power where there is none", "No grid required — solar and storage run the site independently."],
      ["Load-first engineering", "We inventory every appliance and its daily hours; the system is built from that list, not from guesswork."],
      ["Low-sun planning", "Battery autonomy covers cloudy days; we show the worst-case math openly."],
      ["Diesel replacement", "Often cheaper over the life of the site than running a generator on fuel."],
    ],
    steps: [
      ["List daily loads", "Appliance × watts × hours = daily kWh. This sheet drives everything."],
      ["Plan for low sun", "Autonomy days and usable battery depth decide storage size."],
      ["Check site conditions", "Sun path, shading, temperature and ventilation for batteries."],
      ["Review the design", "Array, controller/inverter, storage and protection — with the energy balance shown."],
    ],
    table: {
      title: "A day's energy budget (example)",
      head: ["Load", "Watts", "Hours/day", "Wh/day"],
      rows: [
        ["Lights (6 LED)", "60", "6", "360"],
        ["Fans (2)", "120", "10", "1,200"],
        ["Fridge", "150 avg", "8 equiv.", "1,200"],
        ["TV + Wi-Fi", "120", "5", "600"],
        ["Water pump", "750", "1", "750"],
      ],
      note: "Total ≈ 4.1 kWh/day → array and battery sized with margin for losses and cloudy days. Your real sheet replaces this example.",
    },
    faqs: [
      { q: "Can off-grid run an AC?", a: "Yes, but ACs dominate the energy budget and can double system cost. We model it explicitly so you decide with real numbers." },
      { q: "What about long cloudy stretches?", a: "Autonomy days are designed into storage; for critical sites we discuss a small backup generator input. Honesty about limits is part of the design." },
      { q: "Is off-grid subsidy eligible?", a: "PM Surya Ghar targets grid-connected residential rooftops; off-grid generally does not qualify. We confirm current rules for your case." },
    ],
  },
};

export const SUBSIDY_STEPS = [
  ["Check eligibility", "You need a residential connection, ownership or rights over the roof, and a system within scheme limits. Group housing societies have a separate scheme."],
  ["Register on the portal", "Create an account at pmsuryaghar.gov.in with your electricity consumer number and mobile. Apply for rooftop solar and wait for feasibility approval."],
  ["Install with a registered vendor", "Installation must be by a registered vendor with approved equipment (ALMM-listed modules). DSP handles design and installation to scheme requirements."],
  ["Apply for net metering", "After installation, apply for net metering through the portal; the DISCOM inspects and installs the bi-directional meter."],
  ["Submit for subsidy", "Upload installation details, bank account and documents. After inspection, the subsidy is credited directly to your bank account."],
];

export const SUBSIDY_FAQS = [
  { q: "How much subsidy will I get?", a: "For eligible residential systems: ₹30,000/kW for the first 2 kW plus ₹18,000 for the third kW, capped at ₹78,000. A 1 kW system gets ₹30,000; 2 kW gets ₹60,000; 3 kW or more gets ₹78,000." },
  { q: "Who is not eligible?", a: "Commercial and industrial installations, and typically off-grid systems. Housing societies follow a separate group-housing scheme with different per-kW amounts." },
  { q: "How long does the subsidy take?", a: "It depends on portal feasibility approval, DISCOM inspection and verification — commonly several weeks after commissioning. We track the steps with you but cannot control government timelines." },
  { q: "Do rules change?", a: "Yes. Amounts, equipment lists and processes are revised periodically. Always verify on the official portal before deciding — our figures are a planning guide, not a guarantee." },
];

export const BLOG_ARTICLES = [
  {
    slug: "how-much-solar-does-my-home-need",
    title: "How much solar does my home actually need?",
    excerpt: "Sizing starts with your bill, not a sales package. Here is the honest math we use on every survey.",
    date: "2026-11-10",
    readMins: 5,
    image: "/images/banner-a.jpg",
    body: [
      ["Start with units, not rupees", "Your bill amount divided by your average tariff gives monthly consumption in kWh (units). A ₹2,400 bill at ₹8/unit means about 300 units a month. Use a 12-month average — summer AC months can double winter usage."],
      ["Divide by what a kW produces", "In Maharashtra, a well-oriented 1 kW array generates roughly 110–130 units a month across the year. 300 units ÷ 120 ≈ 2.5 kW. We round up to the nearest half kW, then check the roof."],
      ["The roof gets a vote", "Allow about 80 sq ft of unshaded area per kW. Water tanks, stair cabins and neighbouring buildings cast shadows that move through the day — a survey maps them. If the roof fits less than the bill suggests, we size to the roof and say so."],
      ["Sanctioned load matters", "Your utility connection has a sanctioned load; net metering rules usually cap system size against it. Raising sanctioned load is possible but adds steps — we check this before quoting."],
      ["Bigger is not always better", "Oversizing exports more at lower export tariffs in some states, while subsidy caps at 3 kW. The right size balances consumption, roof, rules and budget — which is exactly what our proposal shows."],
    ],
  },
  {
    slug: "pm-surya-ghar-subsidy-explained",
    title: "PM Surya Ghar subsidy, explained without the hype",
    excerpt: "What the scheme pays, who qualifies, and the five steps between your roof and the bank credit.",
    date: "2026-11-04",
    readMins: 6,
    image: "/images/banner-b.jpg",
    body: [
      ["The numbers", "Eligible residential rooftops receive ₹30,000 per kW for the first 2 kW and ₹18,000 for the next 1 kW — a maximum of ₹78,000. So 1 kW → ₹30,000, 2 kW → ₹60,000, 3 kW and above → ₹78,000."],
      ["Who qualifies", "Households with a grid connection and roof rights, installing through a registered vendor with approved (ALMM-listed) modules. Commercial and industrial roofs do not qualify; societies have a separate group-housing scheme."],
      ["The process", "Register on pmsuryaghar.gov.in → feasibility approval → installation by a registered vendor → net-metering application and DISCOM inspection → subsidy claim with bank details. The credit lands directly in your account after verification."],
      ["Where people get stuck", "Mismatched consumer numbers, incomplete documents, unregistered vendors and non-approved modules are the common rejection reasons. Using one accountable EPC team removes most of them."],
      ["Keep expectations honest", "Timelines depend on the DISCOM and portal verification — often weeks. Rules and amounts are revised periodically, so verify on the official portal before you commit. Anyone promising a guaranteed date or amount is selling, not informing."],
    ],
  },
  {
    slug: "on-grid-vs-hybrid-vs-off-grid",
    title: "On-grid vs hybrid vs off-grid: pick by need, not by price",
    excerpt: "Three configurations, three jobs. The cheapest system is the one that matches your site.",
    date: "2026-10-27",
    readMins: 5,
    image: "/images/panels-sunset.jpg",
    body: [
      ["On-grid: the savings workhorse", "Panels + inverter + bi-directional meter. Lowest cost per kW, subsidy eligible, minimal maintenance. It shuts down in a power cut for safety. Choose it when your grid is reliable and the goal is bill savings."],
      ["Hybrid: savings plus backup", "Adds a battery and a hybrid inverter. Essential loads keep running through outages; you can reserve charge for evenings. Costs more per kW and batteries need replacement within the system's life. Choose it when outages hurt your work or comfort."],
      ["Off-grid: independence", "No utility at all. Every kWh is generated and stored, so loads must be inventoried and disciplined. Highest cost per usable kWh. Choose it only where there is no grid — farmhouses, remote sites."],
      ["The honest comparison", "For most Pune homes, on-grid wins. For homes with frequent cuts and work-from-home needs, hybrid earns its premium. Off-grid is a different project category, not an upgrade path."],
      ["What we do", "We ask about your outage history, essential loads and budget, then show both configurations side by side with real costs. The recommendation follows your answers."],
    ],
  },
  {
    slug: "keeping-solar-performing",
    title: "Keeping your solar performing: the maintenance truth",
    excerpt: "Panels are low-maintenance, not no-maintenance. What actually protects your generation year after year.",
    date: "2026-10-18",
    readMins: 4,
    image: "/images/sunrise-roof.jpg",
    body: [
      ["Cleaning is the big one", "Dust, bird droppings and pollen can shave 5–15% off generation. In Pune's dry months, cleaning every 2–4 weeks keeps output close to spec. Use plain water and soft tools — abrasives damage the glass coating."],
      ["Watch the numbers", "A monitoring app or inverter display shows daily generation. Compare against the same month last year and against nearby systems. A slow decline is normal degradation (~0.5%/year); a sudden drop is a fault worth calling about."],
      ["Connections and structure", "Thermal cycling loosens terminals; monsoon tests every seal. An annual professional inspection checks torque, earthing, cable condition, mounting corrosion and inverter filters/fans."],
      ["Shadows grow", "Trees grow, neighbours build. A shade that didn't exist at installation can cost a string's output. Re-check the array each year and prune or re-route where possible."],
      ["What DSP offers", "Maintenance support with cleaning schedules, inspection checklists and generation reviews — agreed in writing so 'after-sales' is a service, not a slogan."],
    ],
  },
];

export const PROJECT_GALLERY = [
  { image: "/images/hero.jpg", title: "Rooftop array, evening light", caption: "Representative imagery of the mounting and layout style we design to." },
  { image: "/images/banner-b.jpg", title: "Large-format roof coverage", caption: "Representative imagery — commercial-scale planning reference." },
  { image: "/images/house-dusk.jpg", title: "Home integration at dusk", caption: "Representative imagery — residential aesthetic reference." },
  { image: "/images/sunrise-roof.jpg", title: "Morning generation start", caption: "Representative imagery — orientation and tilt reference." },
];