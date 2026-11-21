import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera } from "lucide-react";
import PageHero from "../components/PageHero";
import { PROJECT_GALLERY, PROJECT_TAGS } from "../data/projects";
import { usePageMeta } from "../lib/seo";
import Picture from "../components/Picture";

export default function Projects() {
  usePageMeta("Solar projects & capability", "DSP Power Infra project gallery and capability overview across homes, societies and businesses. Customer project stories are published only with permission.");
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? PROJECT_GALLERY : PROJECT_GALLERY.filter((p) => p.tag === filter);
  return (
    <>
      <PageHero
        eyebrow="Projects & work"
        title="A growing portfolio, documented honestly."
        lede="Customer project stories appear here as installations complete and owners approve sharing. Until then, this gallery shows the design and mounting style we work to — clearly labelled as representative imagery."
        image="/images/hero.jpg"
        imageAlt="Rooftop solar array in evening light"
      />
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Design references</span><h2>The style we build to.</h2></div>
          <p><Camera size={15} style={{ verticalAlign: "-2px" }} /> Representative imagery — not claimed DSP installations.</p>
        </div>
        <div className="project-filters" role="group" aria-label="Filter gallery by project type">
          {["All", ...PROJECT_TAGS].map((tag) => (
            <button
              key={tag}
              type="button"
              className={"project-filter" + (filter === tag ? " active" : "")}
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
            >
              {tag}
              <span>{tag === "All" ? PROJECT_GALLERY.length : PROJECT_GALLERY.filter((p) => p.tag === tag).length}</span>
            </button>
          ))}
        </div>
        <div className="project-grid">
          {shown.map((p) => (
            <figure key={p.title}>
              <Picture src={p.image} alt={p.title} sizes="(max-width: 700px) 100vw, 50vw" />
              <figcaption><b>{p.title}</b><small>{p.caption}</small><span className="project-tag">{p.tag}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="section steps-band">
        <div className="section-head">
          <div><span className="eyebrow">Capability</span><h2>What we deliver today.</h2></div>
        </div>
        <div className="route-grid">
          <article><span>01</span><h3>Residential rooftops</h3><p>1–10 kW home systems with subsidy support and net-metering coordination.</p></article>
          <article><span>02</span><h3>Society common areas</h3><p>Shared-load systems for lifts, pumps and lighting, with committee-ready proposals.</p></article>
          <article><span>03</span><h3>Commercial & industrial</h3><p>Engineered systems for offices, shops, warehouses and small industry.</p></article>
          <article><span>04</span><h3>Hybrid & off-grid</h3><p>Storage-backed and independent systems where the site demands them.</p></article>
        </div>
      </section>
      <section className="banner">
        <div><span className="eyebrow">Your project next</span><h2>Let's add your roof to the list.</h2></div>
        <Link className="button light" to="/contact">Share your site <ArrowRight size={16} /></Link>
      </section>
    </>
  );
}