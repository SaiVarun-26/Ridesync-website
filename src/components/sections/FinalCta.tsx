import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { splitReveal } from "@/lib/timelines/textReveal";
import { cta } from "@/config/content";
import { site } from "@/config/site";
import Button, { DownloadIcon, GithubIcon } from "@/components/ui/Button";

/** Closing call to action. Heading and two buttons on black, nothing decorative. */
export default function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const items = [...Array.from(actionsRef.current!.children), footerRef.current!];

      if (reduced) {
        gsap.set([titleRef.current, ...items], { visibility: "visible", opacity: 1, y: 0 });
        return;
      }

      gsap.set(items, { visibility: "visible", opacity: 0, y: 24 });
      splitReveal(titleRef.current!, { trigger: sectionRef.current, start: "top 55%", stagger: 0.12, duration: 1.5 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.1,
        delay: 0.35,
        ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 50%", toggleActions: "play none none reverse" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="download"
      data-pose="cta"
      className="relative flex h-svh min-h-[680px] flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
        <img
          src="/ridesync_logo.png"
          alt=""
          width={991}
          height={991}
          loading="lazy"
          decoding="async"
          className="block shrink-0 select-none object-contain"
          style={{ width: "clamp(52px, 6.4vw, 96px)", height: "auto" }}
        />
        <h2
          ref={titleRef}
          data-reveal
          className="max-w-[16ch] text-balance text-[clamp(2.4rem,6vw,5.6rem)] font-semibold leading-[1] tracking-[-0.04em] sm:text-left"
        >
          {cta.title}
        </h2>
      </div>
      <div ref={actionsRef} className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button href={site.apkUrl} variant="primary" className="invisible">
          <DownloadIcon />
          Download RideSync
        </Button>
        <Button href={site.githubUrl} variant="secondary" className="invisible">
          <GithubIcon />
          GitHub
        </Button>
      </div>
      <p ref={footerRef} className="invisible mt-12 text-xs text-white/35">
        RideSync is open source. Ride safe.
      </p>
    </section>
  );
}
