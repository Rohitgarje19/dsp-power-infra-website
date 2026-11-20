import { PM_SURYA_GHAR, PM_SURYA_GHAR_METRICS } from "../data/impact";

export default function TrackRecord() {
  return (
    <section className="track-record" aria-labelledby="track-record-title">
      <div className="track-record-inner">
        <div className="track-record-head">
          <span className="eyebrow">{PM_SURYA_GHAR.scheme}</span>
          <h2 id="track-record-title">Our PM Surya Ghar track record.</h2>
          <p>
            Applications, installations, inspections and subsidies approved under the national rooftop solar scheme.
            Totals from our vendor dashboard as of {PM_SURYA_GHAR.asOf} — scheme work only.
          </p>
        </div>
        <div className="track-record-grid">
          {PM_SURYA_GHAR_METRICS.map(({ key, value, label }) => (
            <article key={key}>
              <strong>{value.toLocaleString("en-IN")}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
