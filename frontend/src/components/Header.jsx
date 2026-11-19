import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Building2, ChevronDown, House, Layers, Menu, Sun, Users, X, Zap } from "lucide-react";
import { NAV_SOLUTIONS } from "../data/content";

const ICONS = { "/homes": House, "/housing-societies": Users, "/commercial": Building2, "/on-grid-solar": Zap, "/hybrid-solar": Layers, "/off-grid-solar": Sun };

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="DSP Power Infra home">
        <img src="/dsp-logo.jpg" alt="" />
        <span>DSP <b>POWER INFRA</b><small>SOLAR EPC SOLUTIONS</small></span>
      </Link>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "open" : ""} aria-label="Main">
        <NavLink to="/homes">Homes</NavLink>
        <div className="dd">
          <button type="button" className="dd-btn" aria-haspopup="true">Solutions <ChevronDown size={15} /></button>
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
        <NavLink to="/contact" className="nav-cta">Talk to an expert <ArrowUpRight size={15} /></NavLink>
      </nav>
    </header>
  );
}