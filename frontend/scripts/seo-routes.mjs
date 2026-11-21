// Single source of truth for prerendered routes and sitemap entries.
import { CITIES } from "../src/data/cities.js";
import { BLOG_ARTICLES } from "../src/data/blog.js";

export const SITE_URL = (process.env.VITE_SITE_URL || "https://dsppowerinfra.com").replace(/\/+$/, "");

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/homes", priority: "0.9", changefreq: "monthly" },
  { path: "/housing-societies", priority: "0.9", changefreq: "monthly" },
  { path: "/commercial", priority: "0.9", changefreq: "monthly" },
  { path: "/on-grid-solar", priority: "0.8", changefreq: "monthly" },
  { path: "/hybrid-solar", priority: "0.8", changefreq: "monthly" },
  { path: "/off-grid-solar", priority: "0.8", changefreq: "monthly" },
  { path: "/solar-calculator", priority: "0.9", changefreq: "monthly" },
  { path: "/subsidy-guide", priority: "0.8", changefreq: "monthly" },
  { path: "/how-it-works", priority: "0.7", changefreq: "monthly" },
  { path: "/service-areas", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/projects", priority: "0.7", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/contact", priority: "0.8", changefreq: "yearly" },
  { path: "/book-visit", priority: "0.8", changefreq: "yearly" },
  { path: "/experience-centre", priority: "0.6", changefreq: "monthly" },
  { path: "/webinars", priority: "0.5", changefreq: "monthly" },
  { path: "/solar-partners", priority: "0.5", changefreq: "monthly" },
  { path: "/refer-a-friend", priority: "0.6", changefreq: "monthly" },
  { path: "/careers", priority: "0.4", changefreq: "monthly" },
  { path: "/sitemap", priority: "0.3", changefreq: "monthly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
];

export function allRoutes() {
  const cities = CITIES.map((city) => ({
    path: `/service-areas/${city.slug}`,
    priority: city.slug === "pune" ? "0.8" : "0.6",
    changefreq: "monthly",
  }));
  const posts = BLOG_ARTICLES.map((article) => ({
    path: `/blog/${article.slug}`,
    priority: "0.6",
    changefreq: "monthly",
    lastmod: article.date,
  }));
  return [...STATIC_ROUTES, ...cities, ...posts];
}
