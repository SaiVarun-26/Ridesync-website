import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scroller } from "@/lib/experience";

/** Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
    });
    scroller.lenis = lenis;
    if (scroller.locked) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, []);

  return null;
}
