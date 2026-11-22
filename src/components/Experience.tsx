import { useEffect, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
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

    return () => {
      window.removeEventListener("load", refresh);
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
