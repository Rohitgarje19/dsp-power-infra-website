import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BLOG_ARTICLES } from "../data/blog";
import { usePageMeta } from "../lib/seo";
import NotFound from "./NotFound";
import Picture from "../components/Picture";

export default function BlogPost() {
  const { slug } = useParams();
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  usePageMeta(article?.title || "Guide", article?.excerpt);
  if (!article) return <NotFound />;
  const others = BLOG_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);
  return (
    <>
      <section className="page-hero compact">
        <Picture className="page-hero-img" src={article.image} alt="" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="page-hero-scrim" />
        <div className="page-hero-copy">
          <Link className="back-link light" to="/blog"><ArrowLeft size={15} /> All guides</Link>
          <h1>{article.title}</h1>
          <p className="lede light">{article.excerpt}</p>
          <small className="post-meta">{new Date(article.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · <Clock size={13} /> {article.readMins} min read · DSP team</small>
        </div>
      </section>
      <article className="section post-body">
        {article.body.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
        <div className="post-cta">
          <div><h3>Want this applied to your roof?</h3><p>Run the calculator or send your bill — we'll come back with honest numbers.</p></div>
          <Link className="button primary" to="/solar-calculator">Calculate my estimate <ArrowRight size={16} /></Link>
        </div>
      </article>
      <section className="section more-posts">
        <span className="eyebrow">Keep reading</span>
        <div className="blog-grid two">
          {others.map((a) => (
            <Link className="blog-card" to={`/blog/${a.slug}`} key={a.slug}>
              <div className="blog-card-img"><Picture src={a.image} alt="" sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="blog-card-body"><h2>{a.title}</h2><p>{a.excerpt}</p><span className="blog-read">Read <ArrowRight size={15} /></span></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}