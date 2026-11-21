import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Results from "./pages/Results";
import Contact from "./pages/Contact";
import BookVisit from "./pages/BookVisit";
import Careers from "./pages/Careers";
import Sitemap from "./pages/Sitemap";
import HowItWorks from "./pages/HowItWorks";
import SubsidyGuide from "./pages/SubsidyGuide";
import ServiceAreas from "./pages/ServiceAreas";
import CitySolar from "./pages/CitySolar";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Refer from "./pages/Refer";
import ExperienceCentre from "./pages/ExperienceCentre";
import Webinars from "./pages/Webinars";
import Partners from "./pages/Partners";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SolutionPage from "./components/SolutionPage";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";
import { initAnalytics, trackPageview } from "./lib/analytics";
import { useBreadcrumbSchema } from "./lib/seo";

// Every public route is imported eagerly so the client hydrates exactly the
// markup the prerenderer emitted (a lazy route would suspend and discard the
// server HTML). Prerendered pages paint before this bundle executes anyway.
const SOLUTION_PATHS = ["/homes", "/housing-societies", "/commercial", "/on-grid-solar", "/hybrid-solar", "/off-grid-solar"];

function ScrollAndReveal() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

function AnalyticsPageviews() {
  const { pathname, search } = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageview(pathname + search); }, [pathname, search]);
  return null;
}

function BreadcrumbSchema() {
  useBreadcrumbSchema();
  return null;
}

export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        {/* Keeps the header/footer usable if a single page fails to render. */}
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {/* Rendered after the page so its effect reads the page's new title. */}
      <BreadcrumbSchema />
      <Footer />
      <FloatingActions />
    </>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollAndReveal />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          {SOLUTION_PATHS.map((path) => (
            <Route key={path} path={path} element={<SolutionPage />} />
          ))}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/solar-calculator" element={<Calculator />} />
          <Route path="/solar-calculator/results" element={<Results />} />
          <Route path="/subsidy-guide" element={<SubsidyGuide />} />
          <Route path="/service-areas" element={<ServiceAreas />} />
          <Route path="/service-areas/:slug" element={<CitySolar />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/refer-a-friend" element={<Refer />} />
          <Route path="/experience-centre" element={<ExperienceCentre />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/solar-partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-visit" element={<BookVisit />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ErrorBoundary>
              <Admin />
            </ErrorBoundary>
          }
        />
      </Routes>
      <CookieConsent />
    </>
  );
}
