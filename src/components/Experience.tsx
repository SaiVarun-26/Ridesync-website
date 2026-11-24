import { useEffect, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { experience, INTRO_DONE_EVENT, scroller } from "@/lib/experience";
import { initPhoneScroll } from "@/lib/timelines/phoneScroll";
import SmoothScroll from "@/components/SmoothScroll";
import PhoneStage from "@/components/phone/PhoneStage";
import Intro from "@/components/intro/Intro";
import Header from "@/components/layout/Header";

/**
 * Client shell. Mounts the fixed layers (Lenis, phone, intro, header) and wires
 * the phone to the scroll position once the sections exist.
 */
export default function Experience({ children }: { children: ReactNode }) {
  useEffect(() => {
    const cleanup = initPhoneScroll();

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    // Footer links from a document page arrive as /#section. Wait for the intro
    // before travelling, so the target section is already laid out.
    const hash = window.location.hash.slice(1);
    const goToHash = () => {
      const el = document.getElementById(hash);
      if (el) scroller.lenis?.scrollTo(el, { duration: 1.4 });
    };
    let hashTimer: number | undefined;
    if (hash) {
      if (experience.introDone) hashTimer = window.setTimeout(goToHash, 150);
      else window.addEventListener(INTRO_DONE_EVENT, goToHash, { once: true });
    }

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener(INTRO_DONE_EVENT, goToHash);
      if (hashTimer) window.clearTimeout(hashTimer);
      cleanup();
    };
  }, []);

  return (
    <>
      <SmoothScroll />
      <PhoneStage />
      <Header />
      <main className="relative z-[2]">{children}</main>
      <Intro />
    </>
  );
}
