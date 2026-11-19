import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Faq({ items, title = "Frequently asked questions", lede }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq-section">
      <div className="section-head">
        <div><span className="eyebrow">Good to know</span><h2>{title}</h2></div>
        {lede && <p>{lede}</p>}
      </div>
      <div className="faq-list">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <article className={`faq-item ${isOpen ? "open" : ""}`} key={item.q}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{item.q}</span>
                <ChevronDown size={19} className="faq-chev" />
              </button>
              <div className="faq-body" hidden={!isOpen}>
                <p>{item.a}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}