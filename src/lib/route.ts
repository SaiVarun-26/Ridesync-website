/**
 * Tiny path router. The site is a static Vite build, so the deployed host
 * rewrites the document routes to index.html and this decides what to render.
 */
export type Route = "home" | "privacy" | "terms" | "faq";

export function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  if (path === "/privacy") return "privacy";
  if (path === "/terms") return "terms";
  if (path === "/faq") return "faq";
  return "home";
}
