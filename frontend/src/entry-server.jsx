import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "./AppRoutes";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
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
import SolutionPage from "./components/SolutionPage";
import { readCollectedMeta, readCollectedSchemas, resetCollectedMeta, resetCollectedSchemas } from "./lib/seo";

const SOLUTION_PATHS = ["/homes", "/housing-societies", "/commercial", "/on-grid-solar", "/hybrid-solar", "/off-grid-solar"];

// Eager route table for static rendering. React.lazy never resolves during
// renderToString, so the server tree imports every page directly.
function ServerRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        {SOLUTION_PATHS.map((path) => (
          <Route key={path} path={path} element={<SolutionPage />} />
        ))}
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/solar-calculator" element={<Calculator />} />
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
    </Routes>
  );
}

/** Render one URL to HTML and return the page's collected head metadata. */
export function render(url) {
  resetCollectedMeta();
  resetCollectedSchemas();
  const html = renderToString(
    <StaticRouter location={url}>
      <ServerRoutes />
    </StaticRouter>,
  );
  const meta = readCollectedMeta() || {};
  const schemas = readCollectedSchemas();
  return { html, meta, schemas };
}
