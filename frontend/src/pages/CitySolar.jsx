import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import PageHero from "../components/PageHero";
import Faq from "../components/Faq";
import LeadForm from "../components/LeadForm";
import { CITY_BY_SLUG } from "../data/cities";
import { usePageMeta, useFaqSchema } from "../lib/seo";

/** City landing page for one Maharashtra service area. */
export default function CitySolar() {
  const { slug } = useParams();
  const city = CITY_BY_SLUG[slug];
  if (!city) return <Navigate to="/service-areas" replace />;
  return <CityContent city={city} />;
}

function CityContent({ city }) {
  usePageMeta(`${city.name} solar`, city.lede, { image: city.image });
  useFaqSchema(city.faqs);

  return (
    <>
      <PageHero
        eyebrow={`Solar in ${city.name}`}
        title={city.title}
        lede={city.lede}
        image={city.image}
        imageAlt={city.imageAlt}
      />

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Local context</span><h2>What matters on a {city.name} roof.</h2></div>
          <p>{city.intro[0]}</p>
        </div>
        <p className="city-intro">{city.intro[1]}</p>
        {city.detail && <p className="city-intro">{city.detail}</p>}
        <p className="city-pin"><MapPin size={15} /> {city.pinNote}. <Link to="/service-areas">Check your PIN code</Link> to confirm scheduling.</p>
        <div className="benefit-grid">
          {city.local.map(([title, copy], i) => (
            <article key={title}>
              <span className="benefit-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section city-cta">
        <div>
          <span className="eyebrow">Plan the numbers</span>
          <h2>Start with your bill and PIN code.</h2>
          <p>The calculator shows system size, subsidy position and payback with every assumption visible. Prefer a person? Book a free site visit.</p>
        </div>
        <div className="city-cta-actions">
          <Link className="button primary" to="/solar-calculator">Try the solar calculator <ArrowRight size={16} /></Link>
          <Link className="button quiet" to="/book-visit">Book a free site visit</Link>
        </div>
      </section>

      <Faq items={city.faqs} title={`Questions we hear in ${city.name}`} />

      <section className="section contact solution-contact" id="enquire">
        <div>
          <span className="eyebrow">Your next step</span>
          <h2>Let's look at <em>your {city.name} site.</em></h2>
          <p>Share a few details and we'll come back with honest numbers — size, cost, subsidy position and what needs verifying on site.</p>
          <ul className="check-list">
            <li><MapPin /> Serving all of Maharashtra</li>
            <li><MapPin /> Survey before any quote</li>
            <li><MapPin /> Assumptions shown in writing</li>
          </ul>
          <Link className="button quiet" to="/solar-calculator">Try the calculator first <ArrowRight size={16} /></Link>
        </div>
        <LeadForm
          source={`city:${city.slug}`}
          defaults={{ city: city.name }}
          heading={`Get a ${city.name} site survey.`}
        />
      </section>

      <section className="section city-nearby">
        <span className="eyebrow">Nearby service areas</span>
        <h2>Also serving</h2>
        <div className="city-links">
          {city.nearby.map((slug) => {
            const other = CITY_BY_SLUG[slug];
            return <Link key={slug} to={`/service-areas/${slug}`}>{other.name} <ArrowRight size={14} /></Link>;
          })}
          <Link to="/service-areas">All of Maharashtra <ArrowRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}
