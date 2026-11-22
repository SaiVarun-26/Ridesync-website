import { gsap, SplitText } from "@/lib/gsap";

export interface RevealOptions {
  /** Scroll trigger element. When omitted the tween is returned paused and must be played manually. */
  trigger?: Element | null;
  start?: string;
  by?: "lines" | "words";
  stagger?: number;
  duration?: number;
  delay?: number;
}

/**
 * Masked SplitText reveal. Lines (or words) rise from behind a baseline with
 * expo easing. Re-splits automatically on resize and when fonts finish loading.
 */
export function splitReveal(el: HTMLElement, opts: RevealOptions = {}) {
  const { trigger, start = "top 82%", by = "lines", stagger = 0.09, duration = 1.3, delay = 0 } = opts;
  let tween: gsap.core.Tween | undefined;
  // Once play() has been called, a re-split (font load, resize) must not leave
  // the new tween paused, or the text would freeze half revealed.
  let started = false;

  SplitText.create(el, {
    type: "lines,words",
    mask: "lines",
    autoSplit: true,
    linesClass: "split-line",
    onSplit(self) {
      gsap.set(el, { visibility: "visible" });
      tween = gsap.from(by === "lines" ? self.lines : self.words, {
        yPercent: 115,
        rotate: 0.001,
        duration,
        delay,
        stagger,
        ease: "expo.out",
        paused: !trigger && !started,
        scrollTrigger: trigger
          ? { trigger, start, toggleActions: "play none none reverse" }
          : undefined,
      });
      return tween;
    },
  });

  return {
    play: () => {
      started = true;
      tween?.play();
    },
    reverse: () => tween?.reverse(),
  };
}

/** Staggered fade and rise for a set of elements. */
export function fadeUp(
  targets: gsap.TweenTarget,
  trigger: Element | null,
  opts: { start?: string; stagger?: number; y?: number; delay?: number } = {},
) {
  const { start = "top 80%", stagger = 0.07, y = 36, delay = 0 } = opts;
  gsap.set(targets, { visibility: "visible" });
  return gsap.from(targets, {
    y,
    opacity: 0,
    duration: 1.2,
    delay,
    stagger,
    ease: "expo.out",
    scrollTrigger: trigger ? { trigger, start, toggleActions: "play none none reverse" } : undefined,
  });
}
