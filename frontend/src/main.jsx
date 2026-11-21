import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.css";
import "./theme.css";

const container = document.getElementById("root");
const tree = (
  <React.StrictMode>
    {/* Last line of defence: a failure in the shell (header, footer, consent
        banner) still shows a recovery screen instead of a blank document. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Prerendered pages arrive with markup already in #root; hydrate them so the
// crawlable HTML is reused instead of thrown away. The plain build (no
// prerender) still mounts from an empty root.
if (container.hasChildNodes()) hydrateRoot(container, tree);
else createRoot(container).render(tree);
