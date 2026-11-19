import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Photo-backed page hero used across subpages. Pass `actions` to override the default CTAs (null hides them). */
export default function PageHero({ eyebrow, title, lede, image, imageAlt, actions, compact = false, children }) {
  return (
    <section className={"page-hero" + (compact ? " compact" : "")}>
      <img className="page-hero-img" src={image} alt={imageAlt || ""} loading="eager" />
      <div className="page-hero-scrim" />
      <div className="page-hero-copy">
        <span className="eyebrow light">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lede light">{lede}</p>
        {actions === undefined ? (
          <div className="actions">
            <Link className="button gold pill" to="/contact">Talk to our team <ArrowRight size={16} /></Link>
            <Link className="button ghost-light pill" to="/how-it-works">How it works</Link>
          </div>
        ) : actions}
        {children}
      </div>
    </section>
  );
}