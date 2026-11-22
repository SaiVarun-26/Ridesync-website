import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { experience, introFx, lockScroll, markIntroDone, phone, unlockScroll } from "@/lib/experience";
import { heroPose } from "@/lib/timelines/phoneScroll";

/**
 * Cinematic intro. One continuous shot, the camera never moves.
 *
 * The phone exists from the first frame. It lies almost flat, as if held in an
 * open hand, bottom edge nearest the camera and the screen facing up into the
 * distance. A purple rider with a GPS ring appears and starts to ride up the
 * dark map. While it rides, the phone is lifted: it tilts up and turns toward
 * the viewer until it stands upright, and the screen settles into the first
 * RideSync screen. The rider is intro artwork over a real screenshot.
 */
export default function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  // Once the intro has finished it is removed from the DOM entirely.
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const skip = skipRef.current!;

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
      introFx.active = false;
      phone.reveal = 1;
      finish();
      markIntroDone();
      return;
    }

    lockScroll();

    const hero = heroPose();
    // Opening pose: a big phone lying almost flat, low in the frame.
    const narrow = window.innerWidth < 768;
    const h0 = narrow ? 1.7 : 2.15;
    const tilt0 = -1.3; // radians. 0 is upright, -PI/2 is flat on its back.

    experience.introActive = true;
    introFx.active = true;
    introFx.appear = 0;
    introFx.p = 0;
    introFx.ringFade = 0;
    gsap.set(phone, {
      x: 0,
      y: 0.02,
      h: h0,
      rotX: tilt0,
      rotY: 0,
      rotZ: 0,
      opacity: 1,
      intro: 1,
      screen: 0,
      dip: 0,
      glow: 0.1,
      drift: 0,
      reveal: 0,
      parallax: 0,
    });
    let done = false;
    let handedOff = false;
    const ride = { p: 0 };

    const handoff = () => {
      if (handedOff) return;
      handedOff = true;
      markIntroDone();
      unlockScroll();
    };

    const complete = () => {
      if (done) return;
      done = true;
      introFx.active = false;
      phone.reveal = 1;
      experience.introActive = false;
      handoff();
      finish();
    };

    const tl = gsap.timeline({ onComplete: complete, defaults: { ease: "power2.inOut" } });

    // The rider and its ring appear on the map.
    tl.to(introFx, { appear: 1, duration: 0.5, ease: "power2.out" }, 0.15);

    // The rider rides up the map with a gentle ease. It never stops.
    tl.to(
      ride,
      {
        p: 1,
        duration: 2.3,
        ease: "power2.inOut",
        onUpdate: () => {
          introFx.p = ride.p;
        },
      },
      0.35,
    );

    // While it rides, the phone is lifted like it is being picked up:
    // tilts up, turns toward the viewer, comes to rest upright.
    const t0 = 0.95;
    tl.to(phone, { rotX: hero.rotX, duration: 2.1, ease: "power3.inOut" }, t0);
    tl.to(phone, { h: hero.h, y: hero.y, x: hero.x, duration: 2.1, ease: "power3.inOut" }, t0);
    // A small turn toward the viewer on the way up, settling back to the hero angle.
    tl.to(phone, { rotY: -0.16, duration: 1.0, ease: "sine.inOut" }, t0);
    tl.to(phone, { rotY: hero.rotY, duration: 1.1, ease: "sine.inOut" }, t0 + 1.0);

    // Before the phone finishes lifting, the ring lets go and the dark map
    // dissolves into the first RideSync screen.
    tl.to(introFx, { ringFade: 1, duration: 0.7, ease: "power2.in" }, t0 + 0.8);
    tl.to(phone, { reveal: 1, duration: 1.2, ease: "power2.inOut" }, t0 + 0.9);
    tl.to(phone, { glow: 0.25, duration: 1.2, ease: "power2.inOut" }, t0 + 0.9);
    tl.to(phone, { parallax: hero.parallax, duration: 0.6, ease: "power2.out" }, t0 + 1.6);
    tl.call(handoff, undefined, t0 + 2.1);
    tl.to({}, { duration: 0.05 }, t0 + 2.2);

    gsap.set(skip, { opacity: 0 });
    gsap.to(skip, { opacity: 0.4, duration: 0.6, delay: 0.5, ease: "power2.out" });
    gsap.to(skip, { opacity: 0, duration: 0.4, delay: 2.4, ease: "power2.out", overwrite: false });

    // Debug aid: /?introSeek=1.8 freezes the shot at 1.8 seconds.
    const seek = parseFloat(new URLSearchParams(window.location.search).get("introSeek") ?? "");
    if (Number.isFinite(seek)) {
      tl.pause();
      tl.time(seek);
    }

    const onSkip = () => {
      if (done) return;
      tl.kill();
      gsap.killTweensOf([skip, ride, phone, introFx]);
      gsap.to(skip, { opacity: 0, duration: 0.3 });
      const quick = gsap.timeline({ onComplete: complete, defaults: { ease: "power3.inOut" } });
      quick.to(phone, { rotZ: 0, rotX: hero.rotX, rotY: hero.rotY, h: hero.h, y: hero.y, x: hero.x, parallax: hero.parallax, duration: 0.8 }, 0);
      quick.to(introFx, { ringFade: 1, duration: 0.4 }, 0);
      quick.to(phone, { reveal: 1, glow: 0.25, duration: 0.7 }, 0.1);
      quick.call(handoff, undefined, 0.7);
    };
    skip.addEventListener("click", onSkip);

    return () => {
      skip.removeEventListener("click", onSkip);
      tl.kill();
      if (!done) {
        experience.introActive = false;
        introFx.active = false;
        phone.reveal = 1;
        unlockScroll();
      }
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-24">
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
