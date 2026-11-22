import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { experience, logoTrack, lockScroll, markIntroDone, phone, unlockScroll } from "@/lib/experience";
import { PHONE_HEIGHT } from "@/lib/phone/model";
import { LOGO_SPOT } from "@/lib/phone/logoSpot";
import { heroPose } from "@/lib/timelines/phoneScroll";

/** Must match the camera in PhoneStage. */
const FOV = 18;
const CAM_Z = 16;
const VISIBLE_H = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z;

/**
 * The logo, measured from the official artwork. All numbers are fractions of the
 * square image (ridesync_logo.png, 991 x 991): the ring's outer diameter is 0.8588.
 */
const LOGO_PURPLE = "#7f1afa";
const RING_OUTER = 0.8588;
const RING_R = 0.388; // centre line of the ring stroke
const RING_STROKE = 0.0827;
const RING_START = -15; // degrees, the round end of the ring
const RING_SWEEP = 296; // the ring is open at the top right
const BALL_R = 0.0797;
const BALL_DIST = 0.366;
const BALL_ANGLE = -71; // where the white dot rests
const CORE_R = 0.0727;
const CORE_DX = -0.011;
const CORE_DY = 0.014;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rad = (d: number) => (d * Math.PI) / 180;
const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const N = 120; // points in the trail
const FOLD_STAGGER = 0.6;

/**
 * The opening, one continuous shot with no cuts.
 *
 *  1. A single rider appears on black and rides. The camera follows. A trail grows
 *     behind it because the dot moves.
 *  2. The rider arrives. The trail folds into itself and becomes the RideSync logo,
 *     and the rider becomes the white dot that orbits it.
 *  3. The dot makes one revolution and stops. The logo is the real artwork now.
 *  4. The camera pulls back. The logo is the one on the sign in screen of the app,
 *     and the phone has been there all along. The screen fades in under the logo and
 *     the camera keeps pulling back until the phone sits in the hero.
 *  5. Hero text, navbar and buttons fade in. The page is interactive.
 *
 * Alignment of the logo and the screenshot is exact: the phone is placed from the
 * logo's measured position, and the intro logo follows the phone every frame.
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  // Once the intro has finished it is removed from the DOM entirely.
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const logo = logoRef.current!;
    const skip = skipRef.current!;
    const ctx = canvas.getContext("2d")!;

    // The page always starts at the top, whatever the browser restored.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const finish = () => {
      gsap.to(root, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          root.style.display = "none";
          setGone(true);
        },
      });
      unlockScroll();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      phone.intro = 1;
      phone.lock = 0;
      finish();
      markIntroDone();
      return;
    }

    lockScroll();

    /* ---------------- sizes ---------------- */
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    const fit = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    fit();
    window.addEventListener("resize", fit);

    const u = clamp(Math.min(W, H) / 900, 0.7, 1.3);
    const D = 0.42 * Math.min(W, H); // outer diameter of the logo, px
    const M = D / RING_OUTER; // side of the logo image, px

    /* ---------------- the phone, placed from the logo ---------------- */
    const hero = heroPose();
    const aspect = W / H;
    const visibleW = VISIBLE_H * aspect;
    // Size of the phone so the ring inside the app is D pixels across (perspective included).
    const Dw = (D / H) * VISIBLE_H;
    const s0 = (Dw * CAM_Z) / (LOGO_SPOT.diam * CAM_Z + Dw * LOGO_SPOT.z);
    const h0 = (s0 * PHONE_HEIGHT) / VISIBLE_H;
    const alignedX = (hh: number) => (-((hh * VISIBLE_H) / PHONE_HEIGHT) * LOGO_SPOT.dx) / visibleW;
    const alignedY = (hh: number) => (-((hh * VISIBLE_H) / PHONE_HEIGHT) * LOGO_SPOT.dy) / VISIBLE_H;

    experience.introActive = true;
    gsap.set(phone, {
      x: alignedX(h0),
      y: alignedY(h0),
      h: h0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      opacity: 1,
      intro: 0,
      screen: 0,
      dip: 0,
      glow: 0.1,
      drift: 0,
      lock: 1,
      parallax: 0,
    });

    /* ---------------- the story ---------------- */
    const S = {
      appear: 0, // rider visible
      s: 0, // distance ridden
      arrive: 0, // camera settles on the final frame
      ping: 0, // arrival ripple
      m: 0, // trail folds into the logo
      core: 0, // centre dot of the logo
      orb: 0, // the one revolution
      png: 0, // the real artwork takes over
    };
    const SEND = 1.9 * H;

    // The road the rider follows: a calm, slightly wandering line.
    const roadX = (q: number) =>
      W / 2 + 0.15 * Math.min(W, H) * Math.sin(q / (0.55 * Math.min(W, H)) + 0.4) + 0.035 * Math.min(W, H) * Math.sin(q / (0.17 * Math.min(W, H)) + 1.2);
    const roadY = (q: number) => -q;

    const [pr, pg, pb] = hexToRgb(LOGO_PURPLE);
    const purple = (a: number) => `rgba(${pr},${pg},${pb},${a})`;
    const ballCol = (e: number) => {
      const c = [lerp(176, 250, e), lerp(124, 250, e), lerp(255, 250, e)];
      return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    };

    const ringPos = (uu: number, cx: number, cy: number): [number, number] => {
      const a = rad(RING_START + uu * RING_SWEEP);
      return [cx + RING_R * M * Math.cos(a), cy + RING_R * M * Math.sin(a)];
    };

    let canvasOn = true;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (S.appear < 0.002 || !canvasOn) return;

      const cx = W / 2;
      const cy = H / 2;
      const ang = rad(BALL_ANGLE + 360 * S.orb);
      const ballX = cx + BALL_DIST * M * Math.cos(ang);
      const ballY = cy + BALL_DIST * M * Math.sin(ang);
      const restA = rad(BALL_ANGLE);
      const restX = cx + BALL_DIST * M * Math.cos(restA);
      const restY = cy + BALL_DIST * M * Math.sin(restA);

      // The camera keeps the rider at a fixed spot, then settles on the final frame.
      const arr = easeInOut(clamp(S.arrive, 0, 1));
      const tx = lerp(cx, restX, arr);
      const ty = lerp(H * 0.64, restY, arr);
      const camX = roadX(S.s) - tx;
      const camY = roadY(S.s) - ty;

      const L = Math.min(S.s, H);
      const folded = S.m >= 0.999;

      ctx.lineJoin = "round";

      // ---- trail (becomes the ring) ----
      if (!folded && L > 1) {
        const pts: [number, number][] = [];
        for (let i = 0; i < N; i++) {
          const uu = i / (N - 1);
          const q = S.s - L + L * uu;
          const sx = roadX(q) - camX;
          const sy = roadY(q) - camY;
          const e = easeInOut(clamp(S.m * (1 + FOLD_STAGGER) - (1 - uu) * FOLD_STAGGER, 0, 1));
          const [rx, ry] = ringPos(uu, cx, cy);
          pts.push([lerp(sx, rx, e), lerp(sy, ry, e)]);
        }
        for (let i = 1; i < N; i++) {
          const um = (i - 0.5) / (N - 1);
          const e = easeInOut(clamp(S.m * (1 + FOLD_STAGGER) - (1 - um) * FOLD_STAGGER, 0, 1));
          const fade = Math.pow(um, 1.4) * 0.95;
          const a = lerp(fade, 1, e) * S.appear;
          const wd = lerp(8.5 * u * (0.5 + 0.5 * um), RING_STROKE * M, e);
          ctx.lineCap = e > 0.5 ? "round" : "butt";
          ctx.beginPath();
          ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
          ctx.lineTo(pts[i][0], pts[i][1]);
          if (e < 0.5) {
            // A faint wider pass, only while it is still a trail.
            ctx.strokeStyle = purple(0.1 * a * (1 - e * 2));
            ctx.lineWidth = wd * 2.4;
            ctx.stroke();
          }
          ctx.strokeStyle = purple(a);
          ctx.lineWidth = wd;
          ctx.stroke();
        }
      } else if (folded) {
        ctx.lineCap = "round";
        ctx.strokeStyle = purple(1);
        ctx.lineWidth = RING_STROKE * M;
        ctx.beginPath();
        ctx.arc(cx, cy, RING_R * M, rad(RING_START), rad(RING_START + RING_SWEEP));
        ctx.stroke();
      }

      // ---- the rider, which becomes the white dot ----
      const eHead = easeInOut(clamp(S.m * (1 + FOLD_STAGGER), 0, 1));
      const headTravelX = tx; // the camera holds the rider here
      const headTravelY = ty;
      const hx = lerp(headTravelX, ballX, eHead);
      const hy = lerp(headTravelY, ballY, eHead);
      const hr = lerp(6.5 * u, BALL_R * M, eHead);

      // Arrival ripple.
      if (S.ping > 0.001 && S.ping < 0.999) {
        ctx.strokeStyle = purple((1 - S.ping) * 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(headTravelX, headTravelY, lerp(10 * u, 48 * u, S.ping), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Soft light around the rider while it is a rider.
      const gl = 1 - eHead;
      if (gl > 0.01) {
        const gr = 30 * u;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, gr);
        g.addColorStop(0, purple(0.4 * gl * S.appear));
        g.addColorStop(1, purple(0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hx, hy, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = S.appear;
      ctx.fillStyle = ballCol(eHead);
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fill();
      if (eHead < 0.5) {
        ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - eHead * 2)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, hr * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ---- the dot in the middle of the logo ----
      if (S.core > 0.001) {
        ctx.fillStyle = purple(1);
        ctx.beginPath();
        ctx.arc(cx + CORE_DX * M, cy + CORE_DY * M, CORE_R * M * S.core, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // The real logo follows the logo inside the phone. Same asset as everywhere else.
    logo.style.width = `${M}px`;
    logo.style.height = `${M}px`;
    const place = () => {
      const d = logoTrack.d > 1 ? logoTrack.d : D;
      const px = logoTrack.d > 1 ? logoTrack.x : W / 2;
      const py = logoTrack.d > 1 ? logoTrack.y : H / 2;
      const sc = d / RING_OUTER / M;
      logo.style.transform = `translate3d(${px - M / 2}px, ${py - M / 2}px, 0) scale(${sc})`;
    };

    const frame = () => {
      draw();
      place();
      if (canvasOn && S.png >= 0.999) {
        canvasOn = false;
        canvas.style.opacity = "0";
      }
    };
    gsap.ticker.add(frame);

    let done = false;
    let handedOff = false;
    const handoff = () => {
      if (handedOff) return;
      handedOff = true;
      markIntroDone();
      unlockScroll();
    };
    const complete = () => {
      if (done) return;
      done = true;
      gsap.ticker.remove(frame);
      phone.lock = 0;
      experience.introActive = false;
      handoff();
      finish();
    };

    gsap.set(logo, { opacity: 0 });
    const tl = gsap.timeline({ onComplete: complete, defaults: { ease: "power2.inOut" } });

    // 1. A single rider appears, and rides. Half a second of black first.
    tl.to(S, { appear: 1, duration: 0.5, ease: "power2.out" }, 0.45);
    tl.to(S, { s: SEND, duration: 2.3, ease: "power2.inOut" }, 0.95);
    // 2. It arrives, the camera settles, the trail folds into itself.
    tl.to(S, { arrive: 1, duration: 0.8, ease: "power2.inOut" }, 2.75);
    tl.to(S, { ping: 1, duration: 0.55, ease: "power2.out" }, 3.05);
    tl.to(S, { m: 1, duration: 1.0, ease: "none" }, 3.2);
    tl.to(S, { core: 1, duration: 0.4, ease: "expo.out" }, 3.95);
    // 3. One revolution. Smooth start, smooth stop.
    tl.to(S, { orb: 1, duration: 1.25, ease: "power2.inOut" }, 4.2);
    // The real artwork takes over from the drawn logo.
    tl.to(S, { png: 1, duration: 0.3, ease: "none" }, 5.5);
    tl.to(logo, { opacity: 1, duration: 0.3, ease: "none" }, 5.5);

    // 4. The camera pulls back. The phone was there all along.
    const Z0 = 6.0;
    const z = { v: 0 };
    tl.to(phone, { intro: 1, duration: 0.9, ease: "power2.out" }, Z0 + 0.1);
    tl.to(
      z,
      {
        v: 1,
        duration: 2.0,
        ease: "power3.inOut",
        onUpdate: () => {
          const ez = z.v;
          const hh = h0 * Math.pow(hero.h / h0, ez);
          const w = ez * ez * (3 - 2 * ez);
          phone.h = hh;
          phone.x = lerp(alignedX(hh), hero.x, w);
          phone.y = lerp(alignedY(hh), hero.y, w);
        },
      },
      Z0,
    );
    tl.to(logo, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, Z0 + 1.15);
    tl.to(phone, { lock: 0, duration: 0.6, ease: "power2.out" }, Z0 + 1.4);
    tl.to(phone, { glow: 0.12, duration: 1.0 }, Z0 + 0.8);
    tl.to(phone, { parallax: hero.parallax, duration: 0.6, ease: "power2.out" }, Z0 + 1.5);

    // 5. Hero text, navbar and buttons fade in (they listen for this).
    tl.call(handoff, undefined, Z0 + 1.55);
    tl.to({}, { duration: 0.05 }, Z0 + 2.1);

    gsap.set(skip, { opacity: 0 });
    gsap.to(skip, { opacity: 0.4, duration: 0.6, delay: 0.6, ease: "power2.out" });
    gsap.to(skip, { opacity: 0, duration: 0.4, delay: Z0 + 0.2, ease: "power2.out", overwrite: false });

    // Debug aid: /?introSeek=3.5 freezes the shot at 3.5 seconds.
    const seek = parseFloat(new URLSearchParams(window.location.search).get("introSeek") ?? "");
    if (Number.isFinite(seek)) {
      tl.pause();
      tl.time(seek);
    }

    const onSkip = () => {
      if (done) return;
      tl.kill();
      gsap.killTweensOf([skip, S, z, phone, logo]);
      canvasOn = false;
      canvas.style.opacity = "0";
      gsap.to([skip, logo], { opacity: 0, duration: 0.3 });
      const quick = gsap.timeline({ onComplete: complete, defaults: { ease: "power3.inOut" } });
      quick.to(phone, { intro: 1, h: hero.h, y: hero.y, x: hero.x, lock: 0, parallax: hero.parallax, duration: 0.8 }, 0);
      quick.call(handoff, undefined, 0.5);
    };
    skip.addEventListener("click", onSkip);

    return () => {
      skip.removeEventListener("click", onSkip);
      window.removeEventListener("resize", fit);
      gsap.ticker.remove(frame);
      tl.kill();
      if (!done) {
        experience.introActive = false;
        phone.lock = 0;
        phone.intro = 1;
        unlockScroll();
      }
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-50">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <img
        ref={logoRef}
        src="/ridesync_logo.png"
        alt=""
        width={991}
        height={991}
        decoding="async"
        className="absolute left-0 top-0 block select-none object-contain will-change-transform"
        style={{ opacity: 0, transformOrigin: "50% 50%" }}
      />
      <button
        ref={skipRef}
        type="button"
        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-100!"
        style={{ opacity: 0 }}
      >
        Skip intro
      </button>
    </div>
  );
}
