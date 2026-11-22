import * as THREE from "three";

/**
 * Phone screens.
 *
 * Only real RideSync screenshots are shown. They live in /screenshots at the
 * project root and are bundled by Vite. To change the story, edit the order
 * here (and the chapters in config/content.ts) and drop new files into the
 * folder. Portrait, any size. 738x1600 is what the model is tuned for.
 *
 * `kind` is how the phone arrives at a screen from the previous one:
 *   fade   cross-fade with a subtle zoom, vertical drift and blur
 *   slide  the new screen slides up over the old one, like switching pages
 */
export type ArrivalKind = "fade" | "slide";

export const SCREENS = [
  { id: "google_signin", file: "google_signin.jpeg", kind: "fade" },
  { id: "home", file: "home.jpeg", kind: "fade" },
  { id: "group_ride", file: "group_ride.jpeg", kind: "fade" },
  { id: "join_ride", file: "join_ride.jpeg", kind: "slide" },
  { id: "ride_loading", file: "ride_loading.jpeg", kind: "fade" },
  { id: "guided_roam_pick_location", file: "guided_roam_pick_location.jpeg", kind: "fade" },
  { id: "guided_or_free_roam", file: "guided_or_free_roam.jpeg", kind: "fade" },
  { id: "guided_route", file: "guided_route.jpeg", kind: "fade" },
  { id: "guided_route_2", file: "guided_route_2.jpeg", kind: "fade" },
  { id: "start_guided_ride", file: "start_guided_ride.jpeg", kind: "fade" },
  { id: "ride_complete", file: "ride_complete.jpeg", kind: "fade" },
  { id: "history_card", file: "history_card.jpeg", kind: "fade" },
  { id: "history_card_2", file: "history_card_2.jpeg", kind: "fade" },
  { id: "profile", file: "profile.jpeg", kind: "fade" },
  { id: "flex_card", file: "flex_card.jpeg", kind: "fade" },
] as const;

const urls = import.meta.glob("/screenshots/*.jpeg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const urlFor = (file: string) => urls[`/screenshots/${file}`];

function configure(tex: THREE.Texture, maxAnisotropy: number) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
}

/**
 * Textures start as a near-black pixel (the app background), so there is never
 * a flash of anything fake. Screenshots load on demand: `ensure(i)` starts a
 * load, and `warm()` loads the rest one by one when the browser is idle.
 */
export function createScreenTextures(maxAnisotropy: number) {
  const placeholder = () => {
    const t = new THREE.DataTexture(new Uint8Array([5, 5, 7, 255]), 1, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };

  const textures: THREE.Texture[] = SCREENS.map(placeholder);
  const state: ("idle" | "loading" | "ready")[] = SCREENS.map(() => "idle");
  const loader = new THREE.TextureLoader();
  let disposed = false;

  const ensure = (i: number) => {
    if (i < 0 || i >= SCREENS.length || state[i] !== "idle") return;
    const url = urlFor(SCREENS[i].file);
    if (!url) return;
    state[i] = "loading";
    loader.load(
      url,
      (tex) => {
        if (disposed) return tex.dispose();
        configure(tex, maxAnisotropy);
        textures[i].dispose();
        textures[i] = tex;
        state[i] = "ready";
      },
      undefined,
      () => {
        state[i] = "idle";
      },
    );
  };

  /** Loads everything else, one screenshot at a time, when the browser is idle. */
  const warm = () => {
    let next = 0;
    const step = () => {
      if (disposed) return;
      while (next < SCREENS.length && state[next] !== "idle") next++;
      if (next >= SCREENS.length) return;
      ensure(next);
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => void };
      (w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250)))(step);
    };
    step();
  };

  const dispose = () => {
    disposed = true;
    textures.forEach((t) => t.dispose());
  };

  return { textures, ensure, warm, isReady: (i: number) => state[i] === "ready", dispose };
}
