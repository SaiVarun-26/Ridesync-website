/**
 * Shared, mutable experience state.
 *
 * GSAP tweens these plain objects, the Three.js render loop reads them every
 * frame. No React state is involved, so nothing re-renders at 60fps.
 */

export interface PhoneState {
  /** Horizontal offset, fraction of viewport width from centre. */
  x: number;
  /** Vertical offset, fraction of viewport height from centre (up is positive). */
  y: number;
  /** Phone height as a fraction of viewport height. */
  h: number;
  rotY: number;
  rotX: number;
  /** Roll around the screen normal. -PI/2 lays the phone on its side. */
  rotZ: number;
  /** Scroll driven opacity. */
  opacity: number;
  /** Continuous screen index. 1.5 is halfway between screen 1 and 2. */
  screen: number;
  /** 0..1 pulse used while the screen changes to make the phone feel physical. */
  dip: number;
  /** Mouse parallax strength. */
  parallax: number;
  /** 0..1 reveal at the end of the intro. */
  intro: number;
  /** 0..1 purple ambient light around the phone. */
  glow: number;
  /**
   * 0..1. While below 1 the intro owns the screen: it shows the dark map with
   * the rider overlay and cross-fades into the normal screen sequence.
   */
  reveal: number;
  /** 0..1 slow upward drift of the screen content (parallax inside the glass). */
  drift: number;
}

export const phone: PhoneState = {
  x: 0,
  y: 0,
  h: 0.5,
  rotY: 0,
  rotX: 0,
  rotZ: 0,
  opacity: 1,
  screen: 0,
  dip: 0,
  parallax: 1,
  intro: 0,
  glow: 0,
  reveal: 1,
  drift: 0,
};

/**
 * Intro overlay state: a purple rider, its spinning GPS ring and its trail are
 * drawn on top of the phone screen while the phone lies flat.
 */
export const introFx = {
  /** 0..1 rider and ring visibility. */
  appear: 0,
  /** 0..1 rider travel along the road. */
  p: 0,
  /** 0..1 how much the GPS ring has faded away. */
  ringFade: 0,
  /** True while the overlay is drawn. */
  active: false,
};
/** Normalised pointer, -1..1. */
export const pointer = { x: 0, y: 0 };

export const INTRO_DONE_EVENT = "ridesync:intro-done";

export const experience = {
  introDone: false,
  /** True while the intro timeline is driving the phone pose. */
  introActive: false,
};

export function markIntroDone() {
  experience.introDone = true;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

/** Minimal handle on Lenis so the intro can pause scrolling. */
export const scroller: { lenis: { stop: () => void; start: () => void } | null; locked: boolean } = {
  lenis: null,
  locked: false,
};

export function lockScroll() {
  scroller.locked = true;
  document.documentElement.style.overflow = "hidden";
  scroller.lenis?.stop();
}

export function unlockScroll() {
  scroller.locked = false;
  document.documentElement.style.overflow = "";
  scroller.lenis?.start();
}
