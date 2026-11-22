import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { experience, INTRO_DONE_EVENT } from "@/lib/experience";
import { splitReveal } from "@/lib/timelines/textReveal";
import { hero } from "@/config/content";
import { site } from "@/config/site";
import Button, { DownloadIcon, GithubIcon } from "@/components/ui/Button";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const title = splitReveal(titleRef.current!, { by: "lines", stagger: 0.14, duration: 1.5 });
      const body = splitReveal(bodyRef.current!, { by: "lines", stagger: 0.08, duration: 1.3, delay: 0.25 });
      gsap.set(actionsRef.current!.children, { opacity: 0, y: 24, visibility: "visible" });

      // Hidden until the intro has fully left, then a soft fade and 20px rise.
      if (!reduced && !experience.introDone) gsap.set(contentRef.current, { opacity: 0, y: 20 });

      const play = () => {
        gsap.to(contentRef.current, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" });
        title.play();
        body.play();
        gsap.to(actionsRef.current!.children, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          delay: 0.8,
          ease: "expo.out",
        });
      };

      if (reduced) {
        title.play();
        body.play();
        gsap.set(actionsRef.current!.children, { opacity: 1, y: 0 });
      } else if (experience.introDone) {
        play();
      } else {
        window.addEventListener(INTRO_DONE_EVENT, play, { once: true });
      }

      // The hero copy leaves as the story begins.
      if (!reduced) {
        const fade = {
          ease: "power2.in",
          immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "55% top", scrub: true },
        };
        gsap.fromTo(topRef.current, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -30, ...fade });
        gsap.fromTo(bottomRef.current, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: 30, ...fade });
      }

      return () => window.removeEventListener(INTRO_DONE_EVENT, play);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="top" data-pose="hero" className="relative h-svh min-h-[620px] overflow-visible">
      {/* Heading top, copy bottom, phone in the middle. Top padding clears the fixed navbar. */}
      <div
        ref={contentRef}
        className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-between px-6 pb-[5vh] pt-[max(96px,11vh)]"
      >
        <div ref={topRef} className="text-center will-transform">
          <h1
            ref={titleRef}
            data-reveal
            className="text-balance text-[clamp(2rem,4.4vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
          >
            <span className="block">{hero.titleTop}</span>
            <span className="block text-white/55">{hero.titleBottom}</span>
          </h1>
        </div>

        <div ref={bottomRef} className="pointer-events-auto mx-auto flex max-w-2xl flex-col items-center gap-6 text-center will-transform">
          <p
            ref={bodyRef}
            data-reveal
            className="text-pretty text-[15px] leading-relaxed text-white/65 sm:text-lg"
          >
            {hero.body}
          </p>
          <div ref={actionsRef} className="flex flex-wrap items-center justify-center gap-3">
            <Button href={site.apkUrl} variant="primary" className="invisible">
              <DownloadIcon />
              Download App
            </Button>
            <Button href={site.githubUrl} variant="secondary" className="invisible">
              <GithubIcon />
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
