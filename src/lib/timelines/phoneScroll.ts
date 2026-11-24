import { gsap, ScrollTrigger } from "@/lib/gsap";
import { experience, phone } from "@/lib/experience";
import { chapters } from "@/config/content";

/** The last screen a chapter shows, so the next chapter starts from exactly there. */
function lastScreen(id: PoseId, fallback: number) {
  const ch = (chapters as Record<string, { screens: number[] }>)[id];
  return ch ? ch.screens[ch.screens.length - 1] : fallback;
}

/**
 * Scroll choreography for the phone.
 *
 * Each section in the page carries a `data-pose="<id>"` attribute. When a
 * section scrolls in, the phone travels from the previous pose to this one,
 * scrubbed by the scroll position. Position, rotation and the screen
 * cross-fade all live on the same timeline, so they stay in sync.
 */

export type PoseId = "hero" | "home" | "group" | "solo" | "complete" | "history" | "profile" | "flex" | "open" | "cta";

interface Pose {
  x: number;
  y: number;
  h: number;
  rotY: number;
  rotX: number;
  opacity: number;
  screen: number;
  parallax: number;
}

export const POSE_ORDER: PoseId[] = ["hero", "home", "group", "solo", "complete", "history", "profile", "flex", "open", "cta"];

const pose = (p: Partial<Pose> & Pick<Pose, "screen">): Pose => ({
  x: 0,
  y: 0,
  h: 0.76,
  rotY: 0,
  rotX: 0,
  opacity: 1,
  parallax: 0.35,
  ...p,
});

/**
 * The phone stays pinned on the right through the whole showcase. Each chapter
 * only changes its angle and which screen it starts on. Screens inside a chapter
 * are stepped by the chapter's own scroll progress (see Feature.tsx).
 */
const desktop: Record<PoseId, Pose> = {
  hero: pose({ screen: 0, h: 0.47, y: -0.03, parallax: 1 }),
  home: pose({ screen: 1, x: 0.2, rotY: -0.45, rotX: 0.05 }),
  group: pose({ screen: 2, x: 0.2, rotY: -0.12, rotX: -0.03 }),
  solo: pose({ screen: 5, x: 0.2, rotY: -0.4, rotX: 0.04 }),
  complete: pose({ screen: 10, x: 0.2, rotY: -0.15, rotX: 0 }),
  history: pose({ screen: 11, x: 0.2, rotY: -0.4, rotX: 0.04 }),
  profile: pose({ screen: 13, x: 0.2, rotY: -0.2, rotX: -0.02 }),
  flex: pose({ screen: 14, x: 0.2, rotY: -0.3, rotX: 0.03 }),
  open: pose({ screen: 14, x: 0.2, rotY: -0.2, rotX: 0 }),
  cta: pose({ screen: 14, x: 0, h: 0.34, y: 0.06, rotY: 3.4, rotX: 0.2, opacity: 0, parallax: 0 }),
};

/** Phone above, text below. Used for tablets and phones. */
const STACKED_H = 0.41;
const stackedHero = pose({ screen: 0, h: 0.36, parallax: 1 });

/**
 * Vertical offset for the stacked layout, in viewport fractions (positive is
 * up). The phone is centred in the band between the fixed navbar and the copy
 * block, so it keeps equal breathing room above and below on any screen height
 * and never sits underneath the navbar.
 *
 * The band is read from the real layout: the header's measured height and the
 * tallest copy column (bottom aligned, with the section's 6vh padding), not a
 * fixed translate that only suits one device.
 */
function stackedY(): number {
  const vh = window.innerHeight || 1;
  const navH = document.querySelector("header")?.getBoundingClientRect().height ?? 0;

  let copyH = 0;
  document.querySelectorAll<HTMLElement>("[data-pose] .sticky > div > div").forEach((el) => {
    copyH = Math.max(copyH, el.getBoundingClientRect().height);
  });
  if (!copyH) copyH = vh * 0.28;

  const stage = document.querySelector<HTMLElement>("[data-pose] .sticky");
  const stageH = stage?.getBoundingClientRect().height || vh;
  const copyTop = stageH - copyH - vh * 0.06;

  // Equal gaps when the band fits the phone. On very short viewports it cannot,
  // so the navbar clearance wins over the copy gap instead of hiding the phone.
  const phoneH = STACKED_H * vh;
  const gap = Math.min(vh * 0.02, 18);
  const fits = copyTop - navH - phoneH >= gap * 2;
  const center = fits ? (navH + copyTop) / 2 : navH + gap + phoneH / 2;

  return (vh / 2 - center) / vh;
}

/** The showcase poses, with the offset computed from the live layout. */
function stackedPoses(): Record<PoseId, Pose> {
  const y = stackedY();
  const chapter = (screen: number, rotY: number) => pose({ screen, y, h: STACKED_H, rotY });

  return {
    hero: stackedHero,
    home: chapter(1, -0.3),
    group: chapter(2, 0.2),
    solo: chapter(5, -0.3),
    complete: chapter(10, 0.2),
    history: chapter(11, -0.3),
    profile: chapter(13, 0.2),
    flex: chapter(14, -0.3),
    open: chapter(14, 0.2),
    cta: pose({ screen: 14, h: 0.26, y: 0.2, rotY: 3.4, rotX: 0.2, opacity: 0, parallax: 0 }),
  };
}

/** The pose the phone settles into at the end of the intro. */
export function heroPose() {
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  return wide ? desktop.hero : stackedHero;
}

function flatten(p: Pose): Pose {
  return { ...p, rotY: 0, rotX: 0, parallax: 0 };
}

/** Applies a pose instantly (used when the intro finishes or for reduced motion). */
export function setPose(p: Pose) {
  gsap.set(phone, { ...p });
}

export function initPhoneScroll() {
  const mm = gsap.matchMedia();

  const build = (poses: Record<PoseId, Pose>, reduced: boolean) => {
    const table = reduced
      ? (Object.fromEntries(
          (Object.keys(poses) as PoseId[]).map((k) => [k, flatten(poses[k])]),
        ) as Record<PoseId, Pose>)
      : poses;

    // The intro owns the phone until it hands over.
    if (!experience.introActive) gsap.set(phone, { ...table.hero });

    for (let i = 1; i < POSE_ORDER.length; i++) {
      const from = table[POSE_ORDER[i - 1]];
      const to = table[POSE_ORDER[i]];
      const section = document.querySelector(`[data-pose="${POSE_ORDER[i]}"]`);
      if (!section) continue;

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          end: "top 12%",
          scrub: reduced ? true : 1.2,
        },
      });

      const start = { ...from, screen: lastScreen(POSE_ORDER[i - 1], from.screen) };
      tl.fromTo(phone, start, { ...to, drift: 0, duration: 1, immediateRender: false }, 0);

      if (!reduced) {
        // A small physical dip while the screen changes.
        tl.fromTo(phone, { dip: 0 }, { dip: 1, duration: 0.5, ease: "sine.out", immediateRender: false }, 0);
        tl.to(phone, { dip: 0, duration: 0.5, ease: "sine.in" }, 0.5);
      }
    }
  };

  mm.add(
    {
      wide: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      narrow: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      wideReduced: "(min-width: 1024px) and (prefers-reduced-motion: reduce)",
      narrowReduced: "(max-width: 1023px) and (prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const c = ctx.conditions as Record<string, boolean>;
      if (c.wide) build(desktop, false);
      else if (c.narrow) build(stackedPoses(), false);
      else if (c.wideReduced) build(desktop, true);
      else build(stackedPoses(), true);
    },
  );

  // Poses depend on final layout, so refresh once everything has settled.
  ScrollTrigger.refresh();

  return () => mm.revert();
}
