import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.css";
import "./theme.css";
import "./dark.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Last line of defence: a failure in the shell (header, footer, consent
        banner) still shows a recovery screen instead of a blank document. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
