import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Photo-backed page hero used across subpages. */
export default function PageHero({ eyebrow, title, lede, image, imageAlt, children }) {
  return (
    <section className="page-hero">
      <img className="page-hero-img" src={image} alt={imageAlt || ""} loading="eager" />
      <div className="page-hero-scrim" />
      <div className="page-hero-copy">
        <span className="eyebrow light">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lede light">{lede}</p>
        <div className="actions">
          <Link className="button gold" to="/contact">Talk to our team <ArrowRight size={16} /></Link>
          <Link className="button ghost-light" to="/how-it-works">How it works</Link>
        </div>
        {children}
      </div>
    </section>
  );
}