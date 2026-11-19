import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "../data/content";

export default function Footer() {
  return (
    <footer>
      <div className="footer-main footer-cols">
        <div className="footer-about">
          <div className="brand"><img src="/dsp-logo.jpg" alt="" /> DSP POWER INFRA</div>
          <p>Solar EPC for homes, societies and businesses. Design, supply, installation and support — one accountable team, based in Pune.</p>
          <span className="footer-made">Proudly made in India</span>
        </div>
        <div>
          <b>OFFERINGS</b>
          <Link to="/homes">Homes</Link>
          <Link to="/housing-societies">Housing societies</Link>
          <Link to="/commercial">Commercial & industrial</Link>
        </div>
        <div>
          <b>SOLUTIONS</b>
          <Link to="/on-grid-solar">On-grid solar</Link>
          <Link to="/hybrid-solar">Hybrid solar</Link>
          <Link to="/off-grid-solar">Off-grid solar</Link>
          <Link to="/subsidy-guide">PM Surya Ghar subsidy</Link>
        </div>
        <div>
          <b>QUICK LINKS</b>
          <Link to="/solar-calculator">Solar calculator</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Solar guides</Link>
          <Link to="/service-areas">Service areas</Link>
          <Link to="/refer-a-friend">Refer a friend</Link>
          <Link to="/about">About DSP</Link>
        </div>
        <div>
          <b>CONTACT</b>
          <a href={CONTACT.phoneHref}><Phone size={14} /> {CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}><Mail size={14} /> {CONTACT.email}</a>
          <span><MapPin size={14} /> {CONTACT.city}</span>
          <Link to="/experience-centre">Book a consultation</Link>
          <Link to="/solar-partners">Partner with us</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} DSP Power Infra. Estimates are indicative, not offers.</span>
        <span className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/admin">Team sign in <ArrowUpRight size={13} /></Link>
        </span>
      </div>
    </footer>
  );
}