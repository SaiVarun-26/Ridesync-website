/**
 * Per-screen camera and light character. One entry per screen in SCREENS.
 *
 * The phone state's continuous `screen` index blends neighbouring entries with
 * triangular weights, so every move below eases in and out together with the
 * screen cross-fade. Nothing here ever snaps.
 */
export interface ScreenFx {
  /** Extra scale on the phone (1 = none). */
  scale: number;
  /** Extra yaw, radians. */
  rotY: number;
  /** Extra pitch, radians. */
  rotX: number;
  /** Extra horizontal pan, fraction of viewport width. */
  x: number;
  /** Extra vertical offset, fraction of viewport height (up is positive). */
  y: number;
  /** Purple ambient light, 0..1.3. */
  glow: number;
  /** Multiplier on pointer parallax. */
  parallax: number;
  /** Slow idle yaw sway amplitude, radians. */
  sway: number;
}

const fx = (p: Partial<ScreenFx> = {}): ScreenFx => ({
  scale: 1,
  rotY: 0,
  rotX: 0,
  x: 0,
  y: 0,
  glow: 0.35,
  parallax: 1,
  sway: 0,
  ...p,
});

/** Index of the screens that need time-based extras (see PhoneStage). */
export const FX_LOADING = 4;
export const FX_COMPLETE = 10;

export const SCREEN_FX: ScreenFx[] = [
  fx({ glow: 0.25 }), // 0  google_signin: calm, just floating
  fx({ scale: 1.07, glow: 0.35 }), // 1  home: the phone steps forward
  fx({ rotY: 0.052, x: 0.012, glow: 0.65 }), // 2  group_ride: 3 degree turn, slow pan, stronger purple
  fx({ scale: 1.02, glow: 0.55 }), // 3  join_ride: screen slides up like a page
  fx({ glow: 0.5 }), // 4  ride_loading: pulse and breathing glow (time based)
  fx({ scale: 1.16, glow: 0.5 }), // 5  pick location: slow zoom, the map takes over
  fx({ glow: 0.45, parallax: 1.9 }), // 6  guided or free: parallax
  fx({ scale: 1.1, glow: 0.8 }), // 7  route view: closer, more purple light
  fx({ scale: 1.13, y: 0.03, glow: 0.8 }), // 8  live ride: lifts a little, tiny dolly
  fx({ scale: 1.3, glow: 0.9 }), // 9  ride started: nearly fills the viewport
  fx({ scale: 1.06, glow: 1.1 }), // 10 ride complete: glow and a small bounce
  fx({ scale: 1.04, glow: 0.55 }), // 11 history
  fx({ scale: 1.04, glow: 0.55 }), // 12 more history
  fx({ rotY: 0.1, glow: 0.5 }), // 13 profile: turns, reflection travels
  fx({ sway: 0.22, glow: 1.25 }), // 14 flex card: slow rotation, brightest light
];
