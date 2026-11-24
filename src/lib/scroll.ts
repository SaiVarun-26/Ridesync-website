import { scroller } from "@/lib/experience";

/** Smooth scroll to a section, through Lenis when it is running. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  if (scroller.lenis) {
    scroller.lenis.scrollTo(el, { duration: 1.4 });
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
