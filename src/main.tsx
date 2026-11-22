import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// StrictMode is intentionally off: the intro owns WebGL contexts and a timeline
// that must start exactly once.
createRoot(document.getElementById("root")!).render(<App />);
