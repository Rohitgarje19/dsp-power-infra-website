// Post-build SEO gate. Fails the build when a prerendered route loses its
// title budget, canonical, structured data or sitemap coverage.
import fs from "node:fs";
import path from "node:path";
import { allRoutes, SITE_URL } from "./seo-routes.mjs";

const distDir = path.resolve(import.meta.dirname, "..", "dist");
const errors = [];

const read = (file) => fs.readFileSync(file, "utf8");
const fileFor = (routePath) =>
  routePath === "/" ? path.join(distDir, "index.html") : path.join(distDir, routePath.slice(1), "index.html");

const routes = allRoutes();
const seenTitles = new Map();
const seenDescriptions = new Map();
for (const route of routes) {
  const file = fileFor(route.path);
  if (!fs.existsSync(file)) {
    errors.push(`${route.path}: prerendered file missing`);
    continue;
  }
  const html = read(file);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  const expectedCanonical = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;

  if (!title || title.length > 60) errors.push(`${route.path}: title length ${title.length}`);
  if (title.includes("undefined")) errors.push(`${route.path}: title contains undefined`);
  if (title.split("DSP Power Infra").length > 2) errors.push(`${route.path}: brand repeated in title`);
  if (!description || description.length > 160) errors.push(`${route.path}: description length ${description.length}`);
  if (description.includes("undefined")) errors.push(`${route.path}: description contains undefined`);
  if (seenTitles.has(title)) errors.push(`${route.path}: title duplicates ${seenTitles.get(title)}`);
  else seenTitles.set(title, route.path);
  if (seenDescriptions.has(description)) errors.push(`${route.path}: description duplicates ${seenDescriptions.get(description)}`);
  else seenDescriptions.set(description, route.path);
  if (canonicals.length !== 1 || canonicals[0] !== expectedCanonical) {
    errors.push(`${route.path}: canonical ${JSON.stringify(canonicals)} expected ${expectedCanonical}`);
  }
  if (h1Count !== 1) errors.push(`${route.path}: ${h1Count} H1 headings`);
  if (/<meta name="robots"/i.test(html)) errors.push(`${route.path}: unexpected robots meta`);

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const types = new Set();
  const counts = {};
  for (const raw of jsonLd) {
    try {
      const data = JSON.parse(raw);
      types.add(data["@type"]);
      counts[data["@type"]] = (counts[data["@type"]] || 0) + 1;
    } catch {
      errors.push(`${route.path}: invalid JSON-LD`);
    }
  }
  for (const [type, count] of Object.entries(counts)) {
    if (count > 1) errors.push(`${route.path}: duplicate ${type} schema (${count})`);
  }
  const isBlog = route.path.startsWith("/blog/");
  const isCity = route.path.startsWith("/service-areas/") && route.path !== "/service-areas";
  const isSolution = ["/homes", "/housing-societies", "/commercial", "/on-grid-solar", "/hybrid-solar", "/off-grid-solar"].includes(route.path);
  if (isBlog && !types.has("Article")) errors.push(`${route.path}: missing Article schema`);
  if ((isBlog || isCity || isSolution) && !types.has("FAQPage")) errors.push(`${route.path}: missing FAQPage schema`);
  if (isSolution && !types.has("Service")) errors.push(`${route.path}: missing Service schema`);
  if (route.path !== "/" && !types.has("BreadcrumbList")) errors.push(`${route.path}: missing BreadcrumbList`);

  const words = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < 250) errors.push(`${route.path}: only ${words} words`);
}

const notFound = path.join(distDir, "404.html");
if (!fs.existsSync(notFound)) {
  errors.push("404.html missing");
} else if (!/<meta name="robots" content="noindex/.test(read(notFound))) {
  errors.push("404.html is not noindex");
}

const shell = path.join(distDir, "_shell.html");
if (!fs.existsSync(shell)) {
  errors.push("_shell.html missing");
} else {
  const html = read(shell);
  if (!/<div id="root"><\/div>/.test(html)) errors.push("_shell.html should mount an empty root");
  if (!/<meta name="robots" content="noindex/.test(html)) errors.push("_shell.html is not noindex");
}

const sitemapFile = path.join(distDir, "sitemap.xml");
if (!fs.existsSync(sitemapFile)) {
  errors.push("sitemap.xml missing");
} else {
  const sitemap = read(sitemapFile);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length !== routes.length) errors.push(`sitemap has ${locs.length} URLs, expected ${routes.length}`);
  for (const loc of locs) {
    if (!loc.startsWith("https://")) errors.push(`sitemap URL is not absolute: ${loc}`);
  }
}

const robotsFile = path.join(distDir, "robots.txt");
if (!fs.existsSync(robotsFile)) {
  errors.push("robots.txt missing");
} else if (!read(robotsFile).includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  errors.push("robots.txt has no absolute sitemap line");
}

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log(`SEO check passed: ${routes.length} routes, unique titles/descriptions, absolute canonicals, schema and sitemap present.`);
