import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { phone } from "@/lib/experience";
import { fadeUp, splitReveal } from "@/lib/timelines/textReveal";
import type { PoseId } from "@/lib/timelines/phoneScroll";
import type { Chapter } from "@/config/content";

interface FeatureProps {
  pose: PoseId;
  chapter: Chapter;
  /** Optional call to action under the line. */
  children?: ReactNode;
  /** Section height in viewport units. This is how long the phone animates. */
  heightVh?: number;
}

/**
 * One chapter of the story: a short headline and one line.
 *
 * The phone is not rendered here, it lives in the fixed PhoneStage. This
 * section only owns the copy and reports its scroll progress, which the
 * phone screen uses to animate (riders move, cards slide, numbers count).
 */
export default function Feature({ pose, chapter, children, heightVh }: FeatureProps) {
  // One screen of scrolling to arrive, plus a bit more for every extra screen.
  const height = heightVh ?? 150 + 120 * (chapter.screens.length - 1);
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Progress through this chapter steps the phone through its screens.
      // Each screen holds, then eases to the next one. Nothing snaps.
      const list = chapter.screens;
      const last = list.length - 1;
      const showScreen = (p: number) => {
        if (last === 0) return;
        const t = Math.min(1, Math.max(0, (p - 0.1) / 0.8)) * last;
        const k = Math.min(Math.floor(t), last - 1);
        const f = t - k;
        const e = f < 0.3 ? 0 : f > 0.7 ? 1 : (f - 0.3) / 0.4;
        phone.screen = list[k] + (list[k + 1] - list[k]) * (e * e * (3 - 2 * e));
        // Caption follows the screen that is closest.
        const idx = Math.round(t);
        if (captionRef.current && idx !== shown) {
          shown = idx;
          const el = captionRef.current;
          gsap.killTweensOf(el);
          gsap.to(el, {
            opacity: 0,
            y: -8,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
              el.textContent = chapter.captions?.[idx] ?? "";
              gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" });
            },
          });
        }
      };
      let shown = 0;
      if (captionRef.current) captionRef.current.textContent = chapter.captions?.[0] ?? "";

      ScrollTrigger.create({
        trigger: section,
        start: "top 12%",
        end: "bottom 92%",
        onUpdate: (self) => {
          showScreen(self.progress);
          if (chapter.drift) phone.drift = self.progress * chapter.drift;
        },
      });

      if (reduced) {
        gsap.set([eyebrowRef.current, titleRef.current, lineRef.current, extraRef.current].filter(Boolean), {
          visibility: "visible",
        });
        return;
      }

      const start = "top 55%";
      fadeUp(eyebrowRef.current, section, { start, y: 14 });
      splitReveal(titleRef.current!, { trigger: section, start, stagger: 0.1, duration: 1.4 });
      fadeUp(lineRef.current, section, { start: "top 50%", y: 20, delay: 0.25 });
      if (extraRef.current) fadeUp(extraRef.current, section, { start: "top 46%", y: 24, delay: 0.4 });
    }, sectionRef);

    return () => ctx.revert();
  }, [chapter]);

  return (
    <section ref={sectionRef} id={pose} data-pose={pose} className="relative" style={{ height: `${height}vh` }}>
      <div className="sticky top-0 h-svh">
        <div className="mx-auto flex h-full max-w-[1400px] items-end px-6 pb-[6vh] lg:items-center lg:px-16 lg:pb-0">
          <div className="w-full lg:w-[50%]">
            <p
              ref={eyebrowRef}
              data-reveal
              className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50 sm:text-sm lg:mb-6"
            >
              {chapter.eyebrow}
            </p>
            <h2
              ref={titleRef}
              data-reveal
              className="max-w-[14ch] text-balance text-[clamp(2.2rem,6vw,5.6rem)] font-semibold leading-[1] tracking-[-0.04em]"
            >
              {chapter.title}
            </h2>
            <p ref={lineRef} data-reveal className="mt-4 text-[15px] text-white/60 sm:text-lg lg:mt-7 lg:text-xl">
              {chapter.line}
            </p>
            {chapter.captions && (
              <p
                ref={captionRef}
                aria-live="polite"
                className="mt-6 h-6 text-sm uppercase tracking-[0.18em] text-brand lg:mt-8"
              />
            )}
            {children && (
              <div ref={extraRef} data-reveal className="mt-6 lg:mt-9">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
