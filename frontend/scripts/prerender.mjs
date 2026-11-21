// Static-site generation for the public routes.
//
// Run after `vite build` (client) and `vite build --ssr src/entry-server.jsx`.
// Writes dist/<route>/index.html with the rendered body plus a complete,
// route-specific <head>, dist/404.html, an absolute sitemap.xml and robots.txt.
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { allRoutes, SITE_URL } from "./seo-routes.mjs";
import { ogImageMeta } from "../src/lib/og-images.js";

const root = path.resolve(import.meta.dirname, "..");
const distDir = path.join(root, "dist");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

const DEFAULT_DESCRIPTION =
  "DSP Power Infra — solar EPC for homes, housing societies and businesses in Pune. Survey-first design, PM Surya Ghar subsidy support, installation and maintenance.";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const jsonLd = (payload) => JSON.stringify(payload).replace(/</g, "\\u003c");

const canonicalFor = (routePath) =>
  routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;

function stripRouteTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta name="description"[^>]*>/gi, "")
    .replace(/<meta name="robots"[^>]*>/gi, "")
    .replace(/<link rel="canonical"[^>]*>/gi, "")
    .replace(/<meta (?:property|name)="(?:og:(?:title|description|url|type|image|image:alt|image:width|image:height|image:type)|twitter:(?:title|description|image|image:alt))"[^>]*>/gi, "");
}

function breadcrumbFor(routePath, title) {
  if (routePath === "/") return null;
  const parts = routePath.split("/").filter(Boolean);
  const pageName = (title || "").split(" | ")[0] || parts[0];
  const crumbs = [{ name: "Home", url: `${SITE_URL}/` }];
  if (parts[0] === "service-areas" && parts[1]) {
    crumbs.push({ name: "Service areas", url: `${SITE_URL}/service-areas` });
    crumbs.push({ name: pageName.replace(/\s+solar$/i, ""), url: canonicalFor(routePath) });
  } else if (parts[0] === "blog" && parts[1]) {
    crumbs.push({ name: "Solar guides", url: `${SITE_URL}/blog` });
    crumbs.push({ name: pageName, url: canonicalFor(routePath) });
  } else {
    crumbs.push({ name: pageName, url: canonicalFor(routePath) });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function headBlock(routePath, meta, schemas, { noindex = false } = {}) {
  const title = meta.title || "DSP Power Infra | Solar EPC, Pune";
  const description = meta.description || DEFAULT_DESCRIPTION;
  const url = canonicalFor(routePath);
  const imagePath = meta.image || "/images/hero-family.jpg";
  const image = /^https?:\/\//i.test(imagePath)
    ? imagePath
    : `${SITE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  const type = meta.type || "website";
  const imageAlt = meta.imageAlt || `${title.replace(/\s*\|\s*DSP Power Infra\s*$/, "")} — DSP Power Infra`;
  const dimensions = ogImageMeta(imagePath);

  const blocks = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}"/>`,
  ];
  if (!noindex && !meta.noindex) blocks.push(`<link rel="canonical" href="${esc(url)}"/>`);
  blocks.push(
    `<meta property="og:title" content="${esc(title)}"/>`,
    `<meta property="og:description" content="${esc(description)}"/>`,
    `<meta property="og:url" content="${esc(url)}"/>`,
    `<meta property="og:type" content="${esc(type)}"/>`,
    `<meta property="og:image" content="${esc(image)}"/>`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}"/>`,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
    `<meta name="twitter:image" content="${esc(image)}"/>`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}"/>`,
  );
  if (dimensions) {
    blocks.push(
      `<meta property="og:image:width" content="${dimensions.width}"/>`,
      `<meta property="og:image:height" content="${dimensions.height}"/>`,
      `<meta property="og:image:type" content="${esc(dimensions.type)}"/>`,
    );
  }
  if (noindex || meta.noindex) blocks.push('<meta name="robots" content="noindex, nofollow"/>');

  const attrsFor = (kind) => (kind === "faq" ? ' data-faq-schema="true"' : ` data-seo="${kind}"`);
  const scripts = schemas
    .filter((schema) => schema.payload)
    .map((schema) => `<script type="application/ld+json"${attrsFor(schema.kind)}>${jsonLd(schema.payload)}</script>`);
  const breadcrumb = breadcrumbFor(routePath, title);
  if (breadcrumb) scripts.push(`<script type="application/ld+json" data-seo="breadcrumb">${jsonLd(breadcrumb)}</script>`);

  return `${blocks.join("\n")}\n${scripts.join("\n")}`;
}

function injectHead(template, block) {
  return template.replace("</head>", `${block}\n</head>`);
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function main() {
  if (!(await exists(ssrEntry))) {
    throw new Error("dist-ssr/entry-server.js is missing — run `vite build --ssr src/entry-server.jsx --outDir dist-ssr` first.");
  }
  const { render } = await import(pathToFileURL(ssrEntry).href + `?t=${Date.now()}`);
  const template = await readFile(path.join(distDir, "index.html"), "utf8");
  const clean = stripRouteTags(template);

  const routes = allRoutes();
  const warnings = [];
  const written = [];

  for (const route of routes) {
    const { html, meta, schemas } = render(route.path);
    if (!meta.title) warnings.push(`${route.path}: no usePageMeta title collected`);
    if (!meta.description) warnings.push(`${route.path}: no description collected`);

    // The hero image preload only earns its keep on the home page.
    let shell = clean;
    if (route.path !== "/") shell = shell.replace(/<link rel="preload" as="image"[\s\S]*?>/i, "");

    const page = injectHead(shell, headBlock(route.path, meta, schemas))
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    if (!page.includes(`<div id="root">${html.slice(0, 40)}`)) {
      throw new Error(`Could not place rendered HTML for ${route.path} — #root marker missing or duplicated.`);
    }

    const outFile = route.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.path.slice(1), "index.html");
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, page, "utf8");
    written.push(route.path);
  }

  // 404: real status page, excluded from the index.
  const notFound = render("/404");
  const notFoundPage = injectHead(
    stripRouteTags(template).replace(/<link rel="preload" as="image"[\s\S]*?>/i, ""),
    headBlock("/404", { ...notFound.meta, title: "Page not found | DSP Power Infra" }, notFound.schemas, { noindex: true }),
  ).replace('<div id="root"></div>', `<div id="root">${notFound.html}</div>`);
  await writeFile(path.join(distDir, "404.html"), notFoundPage, "utf8");

  // Client-only routes (/admin, /solar-calculator/results) get an empty shell
  // so React mounts fresh instead of hydrating another page's markup. They are
  // written as real files so a plain `try_files $uri $uri/ =404` nginx rule
  // serves them without a catch-all SPA fallback.
  const shellPage = injectHead(
    stripRouteTags(template).replace(/<link rel="preload" as="image"[\s\S]*?>/i, ""),
    headBlock("/", { title: "DSP Power Infra", description: DEFAULT_DESCRIPTION }, [], { noindex: true }),
  );
  await writeFile(path.join(distDir, "_shell.html"), shellPage, "utf8");

  const clientOnly = [
    ["/admin", "Enquiry dashboard | DSP Power Infra", "Private enquiry management desk for the DSP Power Infra team."],
    ["/solar-calculator/results", "Your solar estimate | DSP Power Infra", "Your indicative rooftop solar estimate with every assumption shown."],
  ];
  for (const [routePath, title, description] of clientOnly) {
    const page = injectHead(
      stripRouteTags(template).replace(/<link rel="preload" as="image"[\s\S]*?>/i, ""),
      headBlock(routePath, { title, description }, [], { noindex: true }),
    );
    const outFile = path.join(distDir, routePath.slice(1), "index.html");
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, page, "utf8");
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => {
      const lastmod = route.lastmod || BUILD_DATE;
      return `  <url><loc>${esc(canonicalFor(route.path))}</loc><lastmod>${lastmod}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");

  const AI_CRAWLERS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Google-Extended",
    "PerplexityBot",
    "CCBot",
  ];
  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /solar-calculator/results",
    "Disallow: /_shell.html",
    ...AI_CRAWLERS.flatMap((agent) => [
      "",
      `User-agent: ${agent}`,
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /solar-calculator/results",
      "Disallow: /_shell.html",
    ]),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  await writeFile(path.join(distDir, "robots.txt"), robots, "utf8");

  const llms = [
    "# DSP Power Infra",
    "",
    "> Solar EPC company based in Pune, Maharashtra, India. Survey-first rooftop solar design, supply, installation and maintenance for homes, housing societies and businesses, with PM Surya Ghar subsidy guidance.",
    "",
    "## Public pages",
    ...routes.map((route) => {
      const label = route.path === "/" ? "Home" : route.path.split("/").filter(Boolean).join(" / ");
      return `- [${label}](${canonicalFor(route.path)})`;
    }),
    "",
    "## Contact",
    "- Phone: +91 91464 67074",
    "- Email: dsp.powerinfra@gmail.com",
    `- Website: ${SITE_URL}/`,
    "",
  ].join("\n");
  await writeFile(path.join(distDir, "llms.txt"), llms, "utf8");

  console.log(`Prerendered ${written.length} routes + 404.html + _shell.html`);
  console.log(`Sitemap: ${routes.length} URLs · robots points at ${SITE_URL}/sitemap.xml`);
  for (const warning of warnings) console.warn(`Warning: ${warning}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
