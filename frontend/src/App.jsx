import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import SolutionPage from "./components/SolutionPage";
import { SOLUTION_PAGES } from "./data/content";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Results from "./pages/Results";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import SubsidyGuide from "./pages/SubsidyGuide";
import ServiceAreas from "./pages/ServiceAreas";
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

function PublicLayout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
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
          {Object.entries(SOLUTION_PAGES).map(([path, data]) => (
            <Route key={path} path={path} element={<SolutionPage data={data} />} />
          ))}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/solar-calculator" element={<Calculator />} />
          <Route path="/solar-calculator/results" element={<Results />} />
          <Route path="/subsidy-guide" element={<SubsidyGuide />} />
          <Route path="/service-areas" element={<ServiceAreas />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/refer-a-friend" element={<Refer />} />
          <Route path="/experience-centre" element={<ExperienceCentre />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/solar-partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}