import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/seo";

export default function NotFound() {
  usePageMeta("Page not found", "The page you were looking for doesn't exist on the DSP Power Infra website.");
  return (
    <section className="section notfound">
      <span className="eyebrow">404</span>
      <h1>That page has moved into the shade.</h1>
      <p className="lede">The link may be old or mistyped. Try the calculator, or head back home.</p>
      <div className="hero-actions">
        <Link className="button gold" to="/solar-calculator">Open the solar calculator</Link>
        <Link className="button ghost" to="/">Back to home</Link>
      </div>
    </section>
  );
}