import { FRONT_Z, SCREEN_H, SCREEN_W } from "@/lib/phone/model";

/**
 * Where the RideSync logo sits on the sign-in screenshot (google_signin.jpeg,
 * 738 x 1600). Measured from the image: the ring spans x 54..161 and y 584..691.
 * Expressed in the phone's own model units, relative to the centre of the glass.
 */
const IMG_W = 738;
const IMG_H = 1600;
const RING_CX = 107.5;
const RING_CY = 637.5;
const RING_D = 108;

export const LOGO_SPOT = {
  /** Centre of the ring, right of centre is positive. */
  dx: (RING_CX / IMG_W - 0.5) * SCREEN_W,
  /** Centre of the ring, up is positive. */
  dy: (0.5 - RING_CY / IMG_H) * SCREEN_H,
  /** Outer diameter of the ring. */
  diam: (RING_D / IMG_W) * SCREEN_W,
  /** Depth of the glass in front of the phone centre. */
  z: FRONT_Z,
};