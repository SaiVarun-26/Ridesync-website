import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App";
import "./index.css";

// Vercel Web Analytics. Injects a deferred, non-blocking page-view tracker in
// production and no-ops in local development, so the intro timeline and WebGL
// experience are untouched.
inject();

// StrictMode is intentionally off: the intro owns WebGL contexts and a timeline
// that must start exactly once.
createRoot(document.getElementById("root")!).render(<App />);
