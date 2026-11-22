import * as THREE from "three";
import { colors } from "@/config/site";
import { introFx } from "@/lib/experience";

/**
 * The intro rider: a purple dot with a rotating GPS ring and a trail that
 * grows behind it, drawn on a transparent canvas that the phone shader lays on
 * top of the screen. It is intro artwork, not app UI: the screen underneath is
 * always a real screenshot.
 */
const W = 540;
const H = 1170;

type Pt = [number, number];

const pos = (s: number): Pt => [270 + 24 * Math.sin(s * 5 + 1.7), 1010 - s * 850];
const S_START = -0.14;
const S_END = 0.5;

export function createIntroOverlay() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const draw = (t: number) => {
    c.clearRect(0, 0, W, H);
    if (!introFx.active || introFx.appear < 0.001) return;
    const fx = introFx;

    const headS = S_START + (S_END - S_START) * fx.p;
    const len = Math.min(headS - S_START, 0.72);
    const n = Math.max(2, Math.round((60 * Math.max(len, 0.02)) / 0.38));
    const wob = (s: number, pt: Pt): Pt => [pt[0] + 1.4 * Math.sin(s * 11 + 1.1), pt[1]];

    c.save();
    c.globalAlpha = fx.appear;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = colors.purple;

    // Trail: rounded caps, a soft outer glow, and a tail that fades.
    const pts: Pt[] = [];
    for (let k = 0; k < n; k++) {
      const s = headS - len + (len * k) / (n - 1);
      pts.push(wob(s, pos(s)));
    }
    for (const layer of [{ w: 26, a: 0.12 }, { w: 11, a: 1 }]) {
      for (let i = 1; i < pts.length; i++) {
        const u = i / (pts.length - 1);
        c.globalAlpha = fx.appear * layer.a * (0.08 + 0.92 * u * u);
        c.lineWidth = layer.w * (0.45 + 0.55 * u);
        c.beginPath();
        c.moveTo(pts[i - 1][0], pts[i - 1][1]);
        c.lineTo(pts[i][0], pts[i][1]);
        c.stroke();
      }
    }

    // Rider glow, pulse and the rotating ring.
    const [hx, hy] = wob(headS, pos(headS));
    const pulse = 1 + 0.1 * Math.sin(t * 6.5);
    const g = c.createRadialGradient(hx, hy, 0, hx, hy, 76 * pulse);
    g.addColorStop(0, "rgba(176,124,255,0.6)");
    g.addColorStop(1, "rgba(176,124,255,0)");
    c.globalAlpha = fx.appear;
    c.fillStyle = g;
    c.beginPath();
    c.arc(hx, hy, 76 * pulse, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = colors.purple;
    c.beginPath();
    c.arc(hx, hy, 12 * pulse, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(hx, hy, 5 * pulse, 0, Math.PI * 2);
    c.fill();

    const ringA = (1 - fx.ringFade) * fx.appear;
    c.strokeStyle = colors.purple;
    c.globalAlpha = ringA * 0.25;
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(hx, hy, 46, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = ringA;
    c.lineWidth = 4.5;
    for (let k = 0; k < 3; k++) {
      const a0 = t * 1.7 + (k / 3) * Math.PI * 2;
      c.beginPath();
      c.arc(hx, hy, 46, a0, a0 + 0.9);
      c.stroke();
    }
    c.restore();
  };

  return {
    texture,
    draw: (t: number) => {
      draw(t);
      texture.needsUpdate = true;
    },
    dispose: () => texture.dispose(),
  };
}
