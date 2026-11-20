import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CONTACT } from "../data/content";
import QuoteModal from "./QuoteModal";

/** Floating WhatsApp button + sticky mobile quote bar (public pages only). */
export default function FloatingActions() {
  const { pathname } = useLocation();
  const [showBar, setShowBar] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Keep the sticky quote bar off pages that carry their own bottom CTA.
  const hideOn = ["/contact", "/book-visit", "/solar-calculator", "/admin"].includes(pathname);
  const waText = encodeURIComponent("Hello DSP Power Infra, I'd like to know more about rooftop solar for my site.");

  return (
    <>
      <a
        className="wa-float"
        href={`https://wa.me/${CONTACT.whatsapp}?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with DSP Power Infra on WhatsApp"
      >
        <MessageCircle size={26} />
        <span>Chat with us</span>
      </a>
      {!hideOn && (
        <div className={`mobile-cta ${showBar ? "show" : ""}`}>
          <div><b>Planning solar?</b><small>Free consultation · Maharashtra</small></div>
          <button type="button" className="button gold" onClick={() => setQuoteOpen(true)}>Get free quote <ArrowRight size={15} /></button>
        </div>
      )}
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}