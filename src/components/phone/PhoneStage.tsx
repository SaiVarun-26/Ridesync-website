import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "@/lib/gsap";
import { introFx, phone, pointer } from "@/lib/experience";
import { createPhoneModel, PHONE_HEIGHT } from "@/lib/phone/model";
import { createScreenTextures, INTRO_SCREEN, SCREENS } from "@/lib/phone/screens";
import { createIntroOverlay } from "@/lib/phone/introOverlay";
import { FX_COMPLETE, FX_LOADING, SCREEN_FX } from "@/lib/phone/screenFx";

const FOV = 18;
const CAM_Z = 16;
const BRAND = 0x7c4dff;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.28)");
  g.addColorStop(0.7, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/**
 * One fixed WebGL canvas for the whole site. The phone never unmounts, it is
 * moved, rotated and re-skinned by the scroll timelines through `phone` state.
 * Every pixel on the screen comes from a real RideSync screenshot.
 */
export default function PhoneStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // No WebGL: the rest of the site still works.
    }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.6;

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 6);
    scene.add(key);

    // Purple rim light that follows the glow level.
    const rim = new THREE.PointLight(BRAND, 0, 0, 2);
    rim.position.set(0, 0.6, 4.5);
    scene.add(rim);

    // Soft purple halo behind the phone.
    const haloTex = glowTexture();
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: haloTex, color: BRAND, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    halo.renderOrder = -1;
    scene.add(halo);

    const screens = createScreenTextures(renderer.capabilities.getMaxAnisotropy());
    const { textures } = screens;
    const overlay = createIntroOverlay();
    const model = createPhoneModel(textures[0], overlay.texture);
    scene.add(model.group);

    // The first screens load immediately, the rest when the browser is idle.
    screens.ensure(INTRO_SCREEN);
    screens.ensure(0);
    screens.ensure(1);
    const warm = window.setTimeout(screens.warm, 1200);

    const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
    let w = 1;
    let h = 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 768 ? 1.75 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let targetX = 0;
    let targetY = 0;
    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const max = SCREENS.length - 1;
    let elapsed = 0;
    let bounceStart = -1;
    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 0.05);
      elapsed += dt;

      const visible = phone.opacity * phone.intro;
      canvas.style.opacity = String(visible);
      if (visible < 0.003) return; // Nothing to draw.

      // Frame-rate independent pointer smoothing.
      const k = 1 - Math.exp(-dt * 4);
      pointer.x += (targetX - pointer.x) * k;
      pointer.y += (targetY - pointer.y) * k;

      const wide = w >= 1024;
      const visibleW = visibleH * camera.aspect;

      // Which screen(s) are showing.
      const sc = clamp(phone.screen, 0, max);
      const i = Math.min(Math.floor(sc), max);
      const frac = sc - i;
      for (let n = i - 1; n <= i + 2; n++) screens.ensure(n); // preload ahead of the transition

      // Blend the per-screen character of the two neighbouring screens.
      const wA = 1 - frac;
      const wB = frac;
      const fxA = SCREEN_FX[i];
      const fxB = SCREEN_FX[Math.min(i + 1, max)];
      const mixFx = (key: keyof typeof fxA) => fxA[key] * wA + fxB[key] * wB;

      // Time based extras: the loading pulse, and a small bounce on completion.
      const wLoad = (i === FX_LOADING ? wA : 0) + (i + 1 === FX_LOADING ? wB : 0);
      const wDone = (i === FX_COMPLETE ? wA : 0) + (i + 1 === FX_COMPLETE ? wB : 0);
      if (wDone > 0.9) {
        if (bounceStart < 0) bounceStart = elapsed;
      } else if (wDone < 0.05) {
        bounceStart = -1;
      }
      const bt = bounceStart < 0 ? 0 : elapsed - bounceStart;
      const bounce = bounceStart < 0 ? 0 : 0.03 * Math.exp(-bt * 3.4) * Math.sin(bt * 13) * wDone;
      const pulse = wLoad * 0.012 * Math.sin(elapsed * 3.2);

      const scaleFx = 1 + (mixFx("scale") - 1) * (wide ? 1 : 0.35);
      const glow = clamp(phone.glow + mixFx("glow") + wLoad * 0.2 * Math.sin(elapsed * 1.6), 0, 1.4);
      const par = phone.parallax * mixFx("parallax");

      const s = ((phone.h * visibleH) / PHONE_HEIGHT) * scaleFx * (1 + bounce + pulse);
      const g = model.group;
      const float = Math.sin(elapsed * 0.9) * 0.012 * visibleH;

      // The phone settles from 96% to 100% as it fades in.
      g.scale.setScalar(s * (1 - 0.07 * phone.dip) * (0.96 + 0.04 * phone.intro));
      const px = (phone.x + mixFx("x")) * visibleW;
      const py = (phone.y + mixFx("y")) * visibleH + float;
      g.position.set(px, py, -phone.dip * 0.5);

      // Idle life: tiny roll, pitch and yaw that never stop.
      const sway = Math.sin(elapsed * 0.45) * mixFx("sway");
      const yaw = phone.rotY + mixFx("rotY") + sway + Math.sin(elapsed * 0.37) * 0.014 * (phone.parallax > 0 ? 1 : 0.4);
      const pitch = phone.rotX + mixFx("rotX") + Math.sin(elapsed * 0.52 + 1) * 0.01;
      g.rotation.set(
        pitch + pointer.y * 0.12 * par - phone.dip * 0.14,
        yaw + pointer.x * 0.24 * par,
        phone.rotZ + Math.sin(elapsed * 0.6) * 0.012 + phone.dip * 0.03,
      );

      // Purple light: a halo behind the phone and a rim light on the frame.
      const phoneH = PHONE_HEIGHT * g.scale.x;
      halo.position.set(px, py, -0.8);
      halo.scale.setScalar(phoneH * 1.9);
      (halo.material as THREE.SpriteMaterial).opacity = 0.07 + 0.34 * glow;
      rim.position.set(px - 1.2, py + 0.8, 4.2);
      rim.intensity = glow * 55;

      // Screen material.
      const u = model.screen.uniforms;
      if (phone.reveal < 1) {
        // The intro: the dark map with the rider overlay, dissolving into the first screen.
        screens.ensure(INTRO_SCREEN);
        u.uA.value = textures[INTRO_SCREEN];
        u.uB.value = textures[i];
        u.uKind.value = 0;
        u.uMix.value = smooth(0, 1, phone.reveal);
        u.uDimA.value = 0.5;
        u.uOverlayAmt.value = 1 - smooth(0, 0.7, phone.reveal);
      } else {
        const slide = SCREENS[Math.min(i + 1, max)].kind === "slide";
        u.uA.value = textures[i];
        u.uB.value = textures[Math.min(i + 1, max)];
        u.uKind.value = slide ? 1 : 0;
        u.uMix.value = slide ? smooth(0.04, 0.96, frac) : smooth(0.08, 0.92, frac);
        u.uDimA.value = 1;
        u.uOverlayAmt.value = 0;
      }
      u.uDrift.value = phone.drift;
      u.uShine.value = 0.5 - yaw * 0.7 - pointer.x * 0.25 + 0.14 * Math.sin(elapsed * 0.4);
      if (introFx.active) overlay.draw(elapsed);

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      window.clearTimeout(warm);
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      screens.dispose();
      overlay.dispose();
      haloTex.dispose();
      (halo.material as THREE.Material).dispose();
      model.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      style={{ opacity: 0 }}
    />
  );
}
