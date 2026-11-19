import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { usePageMeta } from "../lib/seo";

const GROUPS = [
  ["Offerings", [
    ["/homes", "Solar for homes"],
    ["/housing-societies", "Housing societies"],
    ["/commercial", "Commercial & industrial"],
  ]],
  ["Solar solutions", [
    ["/on-grid-solar", "On-grid solar"],
    ["/hybrid-solar", "Hybrid solar"],
    ["/off-grid-solar", "Off-grid solar"],
  ]],
  ["Tools & planning", [
    ["/solar-calculator", "Solar calculator"],
    ["/subsidy-guide", "PM Surya Ghar subsidy guide"],
    ["/how-it-works", "How it works"],
    ["/book-visit", "Book a free site visit"],
    ["/service-areas", "Service areas & PIN check"],
  ]],
  ["Company", [
    ["/about", "About DSP Power Infra"],
    ["/projects", "Projects"],
    ["/experience-centre", "Visit & consultation"],
    ["/webinars", "Webinars"],
    ["/solar-partners", "Partner with us"],
    ["/refer-a-friend", "Refer a friend"],
    ["/careers", "Careers"],
  ]],
  ["Resources", [
    ["/blog", "Solar guides & articles"],
    ["/contact", "Contact & free consultation"],
  ]],
  ["Legal", [
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Use"],
  ]],
];

export default function Sitemap() {
  usePageMeta("Sitemap", "Every public page on the DSP Power Infra website — offerings, solar solutions, tools, company information, guides and legal pages.");
  return (
    <main>
      <section className="section sitemap-page">
        <span className="eyebrow">Site directory</span>
        <h1>Every page, one place.</h1>
        <p className="lede">A human-readable map of the DSP Power Infra website. Looking for numbers instead? Try the <Link to="/solar-calculator">solar calculator</Link>.</p>
        <div className="sitemap-groups">
          {GROUPS.map(([title, links]) => (
            <div key={title}>
              <b>{title}</b>
              {links.map(([to, label]) => (
                <Link key={to} to={to}>{label} <ArrowUpRight size={14} /></Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}