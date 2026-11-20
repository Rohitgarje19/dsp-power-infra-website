import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
// The home page stays in the initial bundle; every other route is split so
// the first visit downloads only what it renders.
import Home from "./pages/Home";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";
import { initAnalytics, trackPageview } from "./lib/analytics";

// Solution pages all render the same data-driven template; the copy for each
// route is fetched in that route's lazy chunk.
const SOLUTION_PATHS = ["/homes", "/housing-societies", "/commercial", "/on-grid-solar", "/hybrid-solar", "/off-grid-solar"];

const SolutionPage = lazy(() => import("./components/SolutionPage"));

const Calculator = lazy(() => import("./pages/Calculator"));
const Results = lazy(() => import("./pages/Results"));
const Contact = lazy(() => import("./pages/Contact"));
const BookVisit = lazy(() => import("./pages/BookVisit"));
const Careers = lazy(() => import("./pages/Careers"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const SubsidyGuide = lazy(() => import("./pages/SubsidyGuide"));
const ServiceAreas = lazy(() => import("./pages/ServiceAreas"));
const CitySolar = lazy(() => import("./pages/CitySolar"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Refer = lazy(() => import("./pages/Refer"));
const ExperienceCentre = lazy(() => import("./pages/ExperienceCentre"));
const Webinars = lazy(() => import("./pages/Webinars"));
const Partners = lazy(() => import("./pages/Partners"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));

function RouteFallback() {
  return <div className="route-loading" role="status" aria-live="polite">Loading…</div>;
}

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
    if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-visible")); return; }
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

function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        {/* Keeps the header/footer usable if a single page fails to render. */}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
              <Suspense fallback={<RouteFallback />}><Admin /></Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
      <CookieConsent />
    </BrowserRouter>
  );
}