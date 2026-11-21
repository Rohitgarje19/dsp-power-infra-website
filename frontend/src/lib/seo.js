import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "DSP Power Infra";
const BASE_HOME_TITLE = "Rooftop solar plants in Pune | DSP Power Infra";
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://dsppowerinfra.com").replace(/\/+$/, "");
export const DEFAULT_DESCRIPTION =
  "DSP Power Infra — solar EPC for homes, housing societies and businesses in Pune. Survey-first design, PM Surya Ghar subsidy support, installation and maintenance.";
export const DEFAULT_IMAGE = "/images/hero-family.jpg";

export function absoluteUrl(path) {
  if (!path) return SITE_URL + "/";
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/** Keep composed titles inside a ~60 character SERP budget. */
export function composeTitle(title) {
  if (!title) return BASE_HOME_TITLE;
  if (title.includes(BASE_TITLE)) return title;
  const full = `${title} | ${BASE_TITLE}`;
  return full.length <= 60 ? full : title;
}

// Build-time collection: usePageMeta runs during server rendering, where
// effects do not, so the prerenderer reads the title/description from here.
let collected = null;
function recordMeta(meta) {
  if (typeof window === "undefined") collected = meta;
}
export function resetCollectedMeta() {
  collected = null;
}
export function readCollectedMeta() {
  const value = collected;
  collected = null;
  return value;
}

// Same idea for JSON-LD: page components register their structured data during
// the server render so the prerenderer can emit it into static HTML.
let collectedSchemas = [];
function recordSchema(kind, payload) {
  if (typeof window !== "undefined") return;
  collectedSchemas = collectedSchemas.filter((s) => s.kind !== kind);
  if (payload) collectedSchemas.push({ kind, payload });
}
export function resetCollectedSchemas() {
  collectedSchemas = [];
}
export function readCollectedSchemas() {
  const value = collectedSchemas;
  collectedSchemas = [];
  return value;
}

function upsertMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/** Per-route title, description, canonical and social metadata (SPA fallback). */
export function usePageMeta(title, description, options = {}) {
  const { image = DEFAULT_IMAGE, noindex = false, type = "website" } = options;
  const composed = composeTitle(title);
  const desc = description || DEFAULT_DESCRIPTION;

  recordMeta({ title: composed, description: desc, image, type, noindex });

  useEffect(() => {
    document.title = composed;
    upsertMeta("name", "description", desc);
    const path = window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/+$/, "");
    const canonical = absoluteUrl(path);
    if (noindex) {
      document.querySelectorAll('link[rel="canonical"]').forEach((node) => node.remove());
    } else {
      upsertLink("canonical", canonical);
    }
    upsertMeta("property", "og:title", composed);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", absoluteUrl(image));
    upsertMeta("name", "twitter:title", composed);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", absoluteUrl(image));

    let robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
    } else if (robots) {
      robots.remove();
    }
  }, [composed, desc, image, type, noindex]);
}

/** Inject FAQPage JSON-LD for a page's FAQ items; removed on unmount. */
export function useFaqSchema(items) {
  recordSchema("faq", items && items.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  } : null);
  useEffect(() => {
    document.querySelectorAll('script[data-faq-schema]').forEach((node) => node.remove());
    if (!items || items.length === 0) return undefined;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.faqSchema = "true";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [items]);
}

function useSeoJsonLd(kind, payload) {
  recordSchema(kind, payload);
  const serialized = payload ? JSON.stringify(payload) : "";
  useEffect(() => {
    document.querySelectorAll(`script[data-seo="${kind}"]`).forEach((node) => node.remove());
    if (!serialized) return undefined;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seo = kind;
    script.textContent = serialized;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [kind, serialized]);
}

/** Article structured data for a guide page. */
export function useArticleSchema(article) {
  const { pathname } = useLocation();
  useSeoJsonLd("article", article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    image: absoluteUrl(article.image),
    author: { "@type": "Organization", name: BASE_TITLE, url: `${SITE_URL}/about` },
    publisher: {
      "@type": "Organization",
      name: BASE_TITLE,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(pathname) },
  } : null);
}

/** Service structured data for a solution page. */
export function useServiceSchema(page) {
  const { pathname } = useLocation();
  useSeoJsonLd("service", page ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.lede,
    serviceType: page.eyebrow,
    url: absoluteUrl(pathname),
    provider: {
      "@type": "LocalBusiness",
      name: BASE_TITLE,
      url: `${SITE_URL}/`,
      telephone: "+919146467074",
    },
    areaServed: [
      { "@type": "City", name: "Pune" },
      { "@type": "State", name: "Maharashtra" },
    ],
  } : null);
}

/** BreadcrumbList for the current route, matching the prerendered version. */
export function useBreadcrumbSchema() {
  const { pathname } = useLocation();
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  useEffect(() => {
    document.querySelectorAll('script[data-seo="breadcrumb"]').forEach((node) => node.remove());
    if (path === "/") return undefined;
    const pageTitle = (document.title || "").split(" | ")[0];
    const crumbs = [{ name: "Home", url: `${SITE_URL}/` }];
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "service-areas" && parts[1]) {
      crumbs.push({ name: "Service areas", url: `${SITE_URL}/service-areas` });
      crumbs.push({ name: pageTitle.replace(/\s+solar$/i, ""), url: absoluteUrl(path) });
    } else if (parts[0] === "blog" && parts[1]) {
      crumbs.push({ name: "Solar guides", url: `${SITE_URL}/blog` });
      crumbs.push({ name: pageTitle, url: absoluteUrl(path) });
    } else {
      crumbs.push({ name: pageTitle || parts[0], url: absoluteUrl(path) });
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seo = "breadcrumb";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [path]);
}

/** Capture UTM params once per session so every lead carries attribution. */
export function readUtm() {
  try {
    const q = new URLSearchParams(window.location.search);
    const stored = JSON.parse(sessionStorage.getItem("dsp_utm") || "{}");
    const fresh = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = q.get(key);
      if (v) fresh[key] = v.slice(0, 100);
    }
    const merged = { ...stored, ...fresh };
    sessionStorage.setItem("dsp_utm", JSON.stringify(merged));
    return {
      utmSource: merged.utm_source || null,
      utmMedium: merged.utm_medium || null,
      utmCampaign: merged.utm_campaign || null,
    };
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null };
  }
}
