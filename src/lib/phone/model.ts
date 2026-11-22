import * as THREE from "three";

/** Phone body dimensions in scene units. Height is ~2 so scaling is easy to reason about. */
const BODY_W = 0.96;
const BODY_H = 2;
const BODY_R = 0.17;
const DEPTH = 0.1;
const BEVEL = 0.012;

export const PHONE_HEIGHT = BODY_H + BEVEL * 2;
/** Screen glass size and its distance in front of the phone centre, in model units. */
const BEZEL = 0.045;
export const SCREEN_W = BODY_W + BEVEL * 2 - BEZEL * 2;
export const SCREEN_H = BODY_H + BEVEL * 2 - BEZEL * 2;
export const FRONT_Z = DEPTH / 2 + BEVEL + 0.0015;
export const PHONE_WIDTH = BODY_W + BEVEL * 2;
/** Width / height. The intro morph uses this to match the 3D phone exactly. */
export const PHONE_ASPECT = PHONE_WIDTH / PHONE_HEIGHT;
/** Corner radius relative to phone width. */
export const PHONE_RADIUS_RATIO = (BODY_R + BEVEL) / PHONE_WIDTH;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

const SCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Screen shader. Two textures are blended with a physical feeling transition:
 *   fade   outgoing screen drifts up and softens, incoming one settles in
 *          from slightly smaller and blurred
 *   slide  incoming screen slides up over the outgoing one, like switching pages
 * Blur uses mip bias, so it costs nothing extra. A soft glass reflection is added
 * on top. Corners are cut with a signed distance field so the screen matches the body.
 */
const SCREEN_FRAG = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;
  uniform float uKind;
  uniform float uDimA;
  uniform float uDrift;
  uniform float uShine;
  uniform vec2 uSize;
  uniform float uRadius;
  varying vec2 vUv;

  vec4 samp(sampler2D t, vec2 uv, float scale, float dy, float bias) {
    vec2 p = (uv - 0.5) / scale + 0.5 - vec2(0.0, dy);
    vec4 c = texture2D(t, p, bias);
    float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
    return vec4(c.rgb * inside, inside);
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 q = abs(p) - uSize * 0.5 + uRadius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float a = 1.0 - smoothstep(-0.004, 0.0, d);

    // Slow upward drift of the content inside the glass (parallax).
    float ds = 1.0 + uDrift;
    float dd = uDrift * 0.5;

    float t = uMix;
    vec3 col;
    if (uKind > 0.5) {
      vec4 sa = samp(uA, vUv, ds, dd + 0.22 * t, 0.0);
      sa.rgb *= mix(1.0, 0.45, t);
      vec4 sb = samp(uB, vUv, ds, dd - (1.0 - t), 0.0);
      col = mix(sa.rgb, sb.rgb, sb.a);
    } else {
      vec4 sa = samp(uA, vUv, ds * (1.0 + 0.045 * t), dd + 0.018 * t, 3.2 * t);
      sa.rgb *= uDimA;
      vec4 sb = samp(uB, vUv, ds * (0.955 + 0.045 * t), dd - 0.022 * (1.0 - t), 3.2 * (1.0 - t));
      col = mix(sa.rgb, sb.rgb, t);
    }

    // Glass: a faint diagonal reflection that travels with the phone's rotation.
    float diag = vUv.x * 0.8 + vUv.y * 0.6;
    float band = exp(-pow((diag - uShine) * 5.0, 2.0));
    col += vec3(0.0035) * band;

    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;
export interface PhoneModel {
  group: THREE.Group;
  screen: THREE.ShaderMaterial;
  dispose: () => void;
}

export function createPhoneModel(initial: THREE.Texture): PhoneModel {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  // Body
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(BODY_W, BODY_H, BODY_R), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelSegments: 5,
    curveSegments: 28,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    metalness: 0.85,
    roughness: 0.32,
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));
  disposables.push(bodyGeo, bodyMat);

  const front = DEPTH / 2 + BEVEL;

  // Screen
  const bezel = 0.045;
  const sw = BODY_W + BEVEL * 2 - bezel * 2;
  const sh = BODY_H + BEVEL * 2 - bezel * 2;
  const screenGeo = new THREE.PlaneGeometry(sw, sh);
  const screen = new THREE.ShaderMaterial({
    vertexShader: SCREEN_VERT,
    fragmentShader: SCREEN_FRAG,
    transparent: true,
    toneMapped: false,
    uniforms: {
      uA: { value: initial },
      uB: { value: initial },
      uMix: { value: 0 },
      uKind: { value: 0 },
      uDimA: { value: 1 },
      uDrift: { value: 0 },
      uShine: { value: 0.3 },
      uSize: { value: new THREE.Vector2(sw, sh) },
      uRadius: { value: BODY_R - bezel * 0.35 },
    },
  });
  const screenMesh = new THREE.Mesh(screenGeo, screen);
  screenMesh.position.z = front + 0.0015;
  group.add(screenMesh);
  disposables.push(screenGeo, screen);

  // Dynamic island
  const islandGeo = new THREE.CapsuleGeometry(0.03, 0.12, 4, 14);
  islandGeo.rotateZ(Math.PI / 2);
  const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.set(0, sh / 2 - 0.085, front + 0.003);
  island.scale.z = 0.2;
  group.add(island);
  disposables.push(islandGeo, islandMat);

  // Back camera plate and lenses, visible when the phone rotates away.
  const plateShape = roundedRect(0.4, 0.4, 0.09);
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 0.012, bevelEnabled: false, curveSegments: 16 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x151518, metalness: 0.7, roughness: 0.4 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(-0.2, 0.74, -front - 0.012);
  group.add(plate);
  disposables.push(plateGeo, plateMat);

  const lensGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.014, 32);
  lensGeo.rotateX(Math.PI / 2);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x020203, metalness: 1, roughness: 0.12 });
  for (const [lx, ly] of [
    [-0.28, 0.82],
    [-0.12, 0.66],
  ] as const) {
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(lx, ly, -front - 0.016);
    group.add(lens);
  }
  disposables.push(lensGeo, lensMat);

  // Side buttons
  const btnGeo = new THREE.BoxGeometry(0.014, 0.2, 0.05);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, metalness: 0.9, roughness: 0.3 });
  const power = new THREE.Mesh(btnGeo, btnMat);
  power.position.set(PHONE_WIDTH / 2 + 0.004, 0.35, 0);
  const vol = new THREE.Mesh(btnGeo, btnMat);
  vol.position.set(-PHONE_WIDTH / 2 - 0.004, 0.42, 0);
  group.add(power, vol);
  disposables.push(btnGeo, btnMat);

  return {
    group,
    screen,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
