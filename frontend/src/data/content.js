// Core site copy: contact details, navigation, home FAQs and subsidy guidance.
// Larger page datasets live in data/solutions.js, data/blog.js and data/projects.js.
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
    a: "Maharashtra is our core service area. For other locations, share your PIN code — coverage depends on project size, team availability and site conditions, and we confirm case by case before committing.",
  },
  {
    q: "What exactly is a rooftop solar system made of?",
    a: "Solar panels (PV modules) that convert sunlight to DC electricity, an inverter that converts it to usable AC power, a mounting structure fixed to your roof, AC/DC cables and combiner boxes, earthing and protection devices, and a bi-directional meter for grid-connected systems. Hybrid and off-grid setups add batteries and a compatible inverter.",
  },
  {
    q: "How does rooftop solar work?",
    a: "Sunlight hits the PV cells in the panels and generates DC electricity through the photovoltaic effect. The inverter converts it to AC power your home uses. Solar serves your loads first; a grid-connected system exports surplus through a bi-directional meter and imports from the grid when solar isn't enough — the two are netted under your state's metering rules.",
  },
  {
    q: "Is solar power safe?",
    a: "Yes. The electricity a solar system produces is the same AC power you get from the grid — only the source differs. A properly designed installation includes earthing, surge protection, isolators and anti-islanding protection, and the structure is anchored for your roof type. Safety comes from design and installation quality, which is why a survey precedes every proposal.",
  },
  {
    q: "How high should my electricity bill be for solar to make sense?",
    a: "As a planning guideline, bills above roughly ₹1,500 a month usually justify a closer look, because fixed system costs spread over more units. Below that, a smaller system or a hybrid for backup may still fit your goals. Run your numbers through our calculator — it shows the assumptions, so you can judge for your tariff and usage.",
  },
  {
    q: "Do panels generate electricity in monsoon and winter?",
    a: "Yes, with reduced output on cloudy or rainy days. Generation estimates for a project are built on annual averages that already account for low-sun months — not just peak summer performance. Winter sun can actually be efficient for panels; it's cloud cover and shorter days that lower output.",
  },
  {
    q: "Does solar work during a power cut?",
    a: "A standard on-grid system shuts down during outages — feeding a dead grid could endanger line workers (anti-islanding protection). If backup matters, a hybrid system with batteries safely powers selected loads through cuts. We size storage around your essential loads and runtime, and show that cost openly.",
  },
  {
    q: "What appliances can I run on solar?",
    a: "All of them — lights, fans, fridge, TV, ACs, pumps and machinery. A grid-connected system runs everything as usual because solar and the grid supply your home together. For backup or off-grid, the question is energy budget: heavy loads like ACs and pumps dominate it, so we inventory your appliances before sizing anything.",
  },
  {
    q: "Do I need to clean the solar panels?",
    a: "Yes — dust, bird droppings and pollen can shave a noticeable slice off generation. In Pune's dry months, cleaning every 2–4 weeks with plain water and a soft cloth or brush keeps output close to spec. Avoid abrasives and detergents, and clean early morning or evening when panels are cool. Ask us about maintenance support if you'd rather not do it yourself.",
  },
  {
    q: "My roof isn't concrete — can I still go solar?",
    a: "Usually yes. Metal-sheet (GI/color-coated) roofs use clamped or penetrated fixings suited to the profile; RCC roofs use anchored foundations. Brittle roofs (like old asbestos) or structurally weak roofs need repair or replacement first — the survey checks condition before any design, and we say so honestly if a roof isn't ready.",
  },
  {
    q: "How long does a solar system last?",
    a: "Quality panels carry performance warranties of 25 years or more, with slow degradation (around 0.5% a year is typical). Inverters usually carry 5–10 year warranties with extendable options, and batteries (in hybrid/off-grid systems) have shorter lives quoted separately. The structure and protection gear last decades when installed and inspected properly.",
  },
  {
    q: "What do I need to install rooftop solar?",
    a: "Unshaded roof space you own or have rights over, access for the installation team, and — for grid-connected systems — an electricity connection in your name with a sanctioned load that supports the size. The survey confirms all three. From there, one accountable team handles design, supply, installation and the metering/subsidy paperwork.",
  },
  {
    q: "How soon do I recover the investment?",
    a: "Payback depends on your tariff, consumption pattern, system cost, subsidy eligibility and export rules — there is no single honest number for everyone. Our calculator estimates it with every assumption visible and adjustable, and your site-specific proposal replaces the estimates with real figures. Treat any guaranteed payback promise from anyone as a sales claim, not engineering.",
  },
];

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
