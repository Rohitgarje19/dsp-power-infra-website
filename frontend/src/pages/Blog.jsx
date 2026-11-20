import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { BLOG_ARTICLES } from "../data/blog";
import { usePageMeta } from "../lib/seo";
import Picture from "../components/Picture";

export default function Blog() {
  usePageMeta("Solar guides", "Practical, honest guides on sizing rooftop solar, the PM Surya Ghar subsidy, system types and maintenance — from the DSP team.");
  return (
    <>
      <section className="page-hero compact">
        <Picture className="page-hero-img" src="/images/panels-sunset.jpg" alt="" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="page-hero-scrim" />
        <div className="page-hero-copy">
          <span className="eyebrow light">Solar resource library</span>
          <h1>Useful solar guides, without the guesswork.</h1>
          <p className="lede light">Plain-language articles on sizing, subsidy, system types and care — written by the team that installs them.</p>
        </div>
      </section>
      <section className="section">
        <div className="blog-grid">
          {BLOG_ARTICLES.map((a) => (
            <Link className="blog-card" to={`/blog/${a.slug}`} key={a.slug}>
              <div className="blog-card-img"><Picture src={a.image} alt="" sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="blog-card-body">
                <small>{new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · <Clock size={12} /> {a.readMins} min read</small>
                <h2>{a.title}</h2>
                <p>{a.excerpt}</p>
                <span className="blog-read">Read the guide <ArrowRight size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}