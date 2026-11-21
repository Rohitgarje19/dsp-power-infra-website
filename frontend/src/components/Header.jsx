import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Building2, ChevronDown, House, Layers, Menu, Sun, Users, X, Zap } from "lucide-react";
import { NAV_SOLUTIONS } from "../data/content";
import QuoteModal from "./QuoteModal";

const ICONS = { "/homes": House, "/housing-societies": Users, "/commercial": Building2, "/on-grid-solar": Zap, "/hybrid-solar": Layers, "/off-grid-solar": Sun };

export default function Header() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const overlay = pathname === "/" && !scrolled && !open;

  useEffect(() => { setOpen(false); setSolutionsOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={"site-header" + (overlay ? " overlay" : "") + (scrolled ? " scrolled" : "")}>
      <Link className="brand" to="/" aria-label="DSP Power Infra Solar EPC Solutions — home">
        <img src="/dsp-logo.jpg" alt="" />
        <span><b>DSP POWER INFRA</b><small>SOLAR EPC SOLUTIONS</small></span>
      </Link>
      <button className="menu" onClick={() => { setOpen(!open); setSolutionsOpen(false); }} aria-label="Toggle menu" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "open" : ""} aria-label="Main">
        <NavLink to="/homes">Homes</NavLink>
        <div className={"dd" + (solutionsOpen ? " open" : "")}>
          <button type="button" className="dd-btn" aria-haspopup="true" aria-expanded={solutionsOpen} onClick={() => setSolutionsOpen(!solutionsOpen)}>Solutions <ChevronDown size={15} /></button>
          <div className="dd-menu">
            {NAV_SOLUTIONS.map(({ name, url, desc }) => {
              const Icon = ICONS[url] || Sun;
              return (
                <Link to={url} key={url}>
                  <i><Icon /></i>
                  <span><b>{name}</b><small>{desc}</small></span>
                </Link>
              );
            })}
          </div>
        </div>
        <NavLink to="/how-it-works">How it works</NavLink>
        <NavLink to="/solar-calculator">Solar calculator</NavLink>
        <NavLink to="/blog">Guides</NavLink>
        <button
          type="button"
          className="nav-cta nav-quote"
          onClick={() => { setOpen(false); setQuoteOpen(true); }}
        >
          Get a Free Consultation <ArrowUpRight size={15} />
        </button>
      </nav>
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </header>
  );
}