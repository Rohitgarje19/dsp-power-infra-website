import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CONTACT } from "../data/content";

/** Floating WhatsApp button + sticky mobile quote bar (public pages only). */
export default function FloatingActions() {
  const { pathname } = useLocation();
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const hideOn = ["/contact", "/admin"].includes(pathname);
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
          <div><b>Planning solar?</b><small>Free consultation · Pune & nearby</small></div>
          <Link className="button gold" to="/contact">Get free quote <ArrowRight size={15} /></Link>
        </div>
      )}
    </>
  );
}