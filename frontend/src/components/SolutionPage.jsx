import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import PageHero from "./PageHero";
import Faq from "./Faq";
import LeadForm from "./LeadForm";
import { useFaqSchema, usePageMeta, useServiceSchema } from "../lib/seo";
import { SOLUTION_PAGES } from "../data/solutions";

/** Rich, data-driven template for all six solution pages. */
export default function SolutionPage({ data }) {
  const { pathname } = useLocation();
  const page = data || SOLUTION_PAGES[pathname];
  usePageMeta(page.seoTitle || page.title, page.lede, { image: page.image });
  useServiceSchema(page);
  useFaqSchema(page.faqs);
  const customerType = pathname === "/commercial" ? "Commercial" : pathname === "/housing-societies" ? "Housing Society" : "Residential";

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} lede={page.lede} image={page.image} imageAlt={page.imageAlt} />

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Why it works</span><h2>Built around your site,<br />not a sales package.</h2></div>
          <p>{page.lede}</p>
        </div>
        <div className="benefit-grid">
          {page.benefits.map(([title, copy], i) => (
            <article key={title}>
              <span className="benefit-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section steps-band">
        <div className="section-head">
          <div><span className="eyebrow">The journey</span><h2>Four steps, no surprises.</h2></div>
          <p>Every step has a clear output you can review before the next one begins.</p>
        </div>
        <div className="steps-row">
          {page.steps.map(([title, copy], i) => (
            <article key={title}>
              <b>{i + 1}</b>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {page.table && (
        <section className="section">
          <div className="section-head">
            <div><span className="eyebrow">Planning guide</span><h2>{page.table.title}</h2></div>
          </div>
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead><tr>{page.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{page.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="table-note">{page.table.note}</p>
        </section>
      )}

      <Faq items={page.faqs} title="Questions we hear on this page" />

      <section className="section contact solution-contact" id="enquire">
        <div>
          <span className="eyebrow">Your next step</span>
          <h2>Let's look at <em>your site.</em></h2>
          <p>Share a few details and we'll come back with honest numbers — size, cost, subsidy position and what needs verifying on site.</p>
          <ul className="check-list">
            <li><Check /> Free initial consultation</li>
            <li><Check /> Survey before any quote</li>
            <li><Check /> Assumptions shown in writing</li>
          </ul>
          <Link className="button quiet" to="/solar-calculator">Try the calculator first <ArrowRight size={16} /></Link>
        </div>
        <LeadForm source={`solution:${pathname}`} defaults={{ customerType }} heading="Get a site-specific proposal." />
      </section>
    </>
  );
}