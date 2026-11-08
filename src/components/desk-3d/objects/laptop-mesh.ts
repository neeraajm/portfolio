import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";
import { TerminalFont, DEFAULT_TERMINAL_FONT, TERMINAL_FONTS } from "@/lib/terminal-fonts";
import { mergeStaticMeshes } from "../utils/merge-static";

/**
 * High-Resolution Procedural TUF Gaming F15 (FX506HC) Lid Back Texture
 * Features:
 * - Iconic TUF Mecha Wings Emblem with subtle neon backglow
 * - 4-point faceted diagonal X-relief crease lines
 * - Honeycomb micro-grid corner grip patterns
 * - Stealth brushed titanium metal finish
 */
function createTufLidBackTexture(): {
  texture: THREE.CanvasTexture;
  renderLidBack: (themeHex: string) => void;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const renderLidBack = (themeHex: string = DEFAULT_THEME.hex) => {
    if (!ctx) return;
    const pad = 12;
    const chamferPx = 44;
    const camLeft = 405;
    const camRight = 619;
    const camSlope = 22;
    const camRise = 8;

    // 🟢 Clip all rendering to the exact chamfered display lid outline with webcam notch
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pad, 640 - pad);
    ctx.lineTo(pad, pad + chamferPx);
    ctx.lineTo(pad + chamferPx, pad);
    ctx.lineTo(camLeft, pad);
    ctx.lineTo(camLeft + camSlope, pad - camRise);
    ctx.lineTo(camRight - camSlope, pad - camRise);
    ctx.lineTo(camRight, pad);
    ctx.lineTo(1024 - pad - chamferPx, pad);
    ctx.lineTo(1024 - pad, pad + chamferPx);
    ctx.lineTo(1024 - pad, 640 - pad);
    ctx.closePath();
    ctx.clip();

    // 1. Brushed Gunmetal / Stealth Graphite Background
    const grad = ctx.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, "#05080c");
    grad.addColorStop(0.5, "#0d131a");
    grad.addColorStop(1, "#04070a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Diagonal Brushed Metal Hairlines
    ctx.strokeStyle = `${themeHex}05`;
    ctx.lineWidth = 1;
    for (let i = -640; i < 1024; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 640, 640);
      ctx.stroke();
    }

    // 2. The 4 Iconic TUF Faceted Diagonal Relief X-Lines (Aligned with Chamfered Corners)
    ctx.strokeStyle = `${themeHex}66`;
    ctx.lineWidth = 2.5;

    // Diagonal crease lines from corners converging into the center mecha core
    ctx.beginPath();
    // Top-Left to Center Box
    ctx.moveTo(pad + chamferPx, pad + chamferPx);
    ctx.lineTo(340, 230);
    ctx.lineTo(340, 410);
    ctx.lineTo(pad, 640 - pad);

    // Top-Right to Center Box
    ctx.moveTo(1024 - pad - chamferPx, pad + chamferPx);
    ctx.lineTo(684, 230);
    ctx.lineTo(684, 410);
    ctx.lineTo(1024 - pad, 640 - pad);
    ctx.stroke();

    // Center Core Framing
    ctx.strokeStyle = `${themeHex}8c`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(340, 230);
    ctx.lineTo(684, 230);
    ctx.moveTo(340, 410);
    ctx.lineTo(684, 410);
    ctx.stroke();

    // Shaded Geometric Facet Fill
    ctx.fillStyle = `${themeHex}0a`;
    ctx.beginPath();
    ctx.moveTo(340, 230);
    ctx.lineTo(684, 230);
    ctx.lineTo(1024 - pad - chamferPx, pad);
    ctx.lineTo(camRight, pad);
    ctx.lineTo(camRight - camSlope, pad - camRise);
    ctx.lineTo(camLeft + camSlope, pad - camRise);
    ctx.lineTo(camLeft, pad);
    ctx.lineTo(pad + chamferPx, pad);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.moveTo(340, 410);
    ctx.lineTo(684, 410);
    ctx.lineTo(1024 - pad, 640 - pad);
    ctx.lineTo(pad, 640 - pad);
    ctx.closePath();
    ctx.fill();

    // 3. Honeycomb / Micro-dot tactical corner grip textures
    ctx.fillStyle = `${themeHex}73`;
    for (let x = 40; x < 260; x += 16) {
      for (let y = 460; y < 600; y += 16) {
        if ((x - 40) + (y - 460) > 80) {
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (let x = 764; x < 984; x += 16) {
      for (let y = 460; y < 600; y += 16) {
        if ((984 - x) + (y - 460) > 80) {
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 4. Luminous Neon Cyber Triangle Emblem (Centered inside Core Box at 512, 320)
    ctx.save();
    ctx.translate(512, 320);

    ctx.shadowColor = themeHex;
    ctx.shadowBlur = 36;

    const outerTop = { x: 0, y: -65 };
    const outerLeft = { x: -75, y: 55 };
    const outerRight = { x: 75, y: 55 };

    const innerTop = { x: 0, y: -30 };
    const innerLeft = { x: -38, y: 32 };
    const innerRight = { x: 38, y: 32 };

    // A. Outer Glowing Triangle Ring with Inner Cutout
    const triGrad = ctx.createLinearGradient(0, -65, 0, 55);
    triGrad.addColorStop(0, "#ffffff");
    triGrad.addColorStop(0.5, themeHex);
    triGrad.addColorStop(1, `${themeHex}b3`);

    ctx.fillStyle = triGrad;
    ctx.beginPath();
    ctx.moveTo(outerTop.x, outerTop.y);
    ctx.lineTo(outerRight.x, outerRight.y);
    ctx.lineTo(outerLeft.x, outerLeft.y);
    ctx.closePath();

    ctx.moveTo(innerTop.x, innerTop.y);
    ctx.lineTo(innerLeft.x, innerLeft.y);
    ctx.lineTo(innerRight.x, innerRight.y);
    ctx.closePath();
    ctx.fill("evenodd");

    // B. Outer Neon Border Stroke
    ctx.strokeStyle = themeHex;
    ctx.lineWidth = 3.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(outerTop.x, outerTop.y);
    ctx.lineTo(outerRight.x, outerRight.y);
    ctx.lineTo(outerLeft.x, outerLeft.y);
    ctx.closePath();
    ctx.stroke();

    // C. Inner Frame Border Stroke
    ctx.strokeStyle = `${themeHex}d9`;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(innerTop.x, innerTop.y);
    ctx.lineTo(innerRight.x, innerRight.y);
    ctx.lineTo(innerLeft.x, innerLeft.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    // Outer Armored Border with Matching 45° Chamfered Top Corners & Center Webcam Tab
    ctx.strokeStyle = themeHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pad, 640 - pad);
    ctx.lineTo(pad, pad + chamferPx);
    ctx.lineTo(pad + chamferPx, pad);
    ctx.lineTo(camLeft, pad);
    ctx.lineTo(camLeft + camSlope, pad - camRise);
    ctx.lineTo(camRight - camSlope, pad - camRise);
    ctx.lineTo(camRight, pad);
    ctx.lineTo(1024 - pad - chamferPx, pad);
    ctx.lineTo(1024 - pad, pad + chamferPx);
    ctx.lineTo(1024 - pad, 640 - pad);
    ctx.lineTo(pad, 640 - pad);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    texture.needsUpdate = true;
  };

  renderLidBack(DEFAULT_THEME.hex);

  return { texture, renderLidBack };
}

/**
 * High-Performance Shared Keycap Atlas
 * Every key legend is baked into a single 2048x2048 canvas so the entire
 * keyboard can be rendered with a handful of draw calls instead of ~700.
 */
const KEY_CELL_SIZE = 128;
const KEY_ATLAS_COLS = 16;
const KEY_ATLAS_ROWS = 16;

interface KeyAtlasEntry {
  u0: number;
  v0: number;
  uSize: number;
  vSize: number;
}

interface KeyAtlas {
  texture: THREE.CanvasTexture;
  entries: Map<string, KeyAtlasEntry>;
}

function paintKeyCell(
  ctx: CanvasRenderingContext2D,
  label: string,
  subLabel: string,
  isWASD: boolean
) {
  if (isWASD) {
    // Frosted Translucent WASD Top
    ctx.fillStyle = "#ecfdf5";
    ctx.fillRect(0, 0, KEY_CELL_SIZE, KEY_CELL_SIZE);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, 122, 122);

    const wasdGrad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    wasdGrad.addColorStop(0, "#ffffff");
    wasdGrad.addColorStop(1, "#d1fae5");
    ctx.fillStyle = wasdGrad;
    ctx.fillRect(5, 5, 118, 118);

    ctx.fillStyle = "#021208";
    ctx.font = "900 65px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 64, 67);
    return;
  }

  // Dark Matte Chiclet Top with High-Contrast White Legend
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, KEY_CELL_SIZE, KEY_CELL_SIZE);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 122, 122);

  // Caps Lock Status LED indicator square on the right side
  if (label.includes("CAPS")) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(106, 58, 12, 12);
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (subLabel) {
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(subLabel, 64, 38);

    ctx.font = "bold 31px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, 64, 84);
  } else {
    ctx.font =
      label.length > 6
        ? "bold 18px monospace"
        : label.length > 4
        ? "bold 22px monospace"
        : label.length > 2
        ? "bold 28px monospace"
        : label.length > 1
        ? "bold 34px monospace"
        : "bold 48px monospace";
    ctx.fillText(label, 64, 64);
  }

  // Tactile homing notch underline on F, J, and Numpad 5
  if (label === "F" || label === "J" || (label === "5" && !subLabel)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(44, 102, 40, 5);
  }
}

function createKeyTopAtlas(
  keys: { label: string; sub?: string; isWASD?: boolean }[]
): KeyAtlas {
  const canvas = document.createElement("canvas");
  canvas.width = KEY_CELL_SIZE * KEY_ATLAS_COLS;
  canvas.height = KEY_CELL_SIZE * KEY_ATLAS_ROWS;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const entries = new Map<string, KeyAtlasEntry>();
  if (!ctx) return { texture, entries };

  const uSize = 1 / KEY_ATLAS_COLS;
  const vSize = 1 / KEY_ATLAS_ROWS;
  let cellIndex = 0;

  keys.forEach((key) => {
    const cacheKey = `${key.label}|${key.sub ?? ""}|${key.isWASD ? 1 : 0}`;
    if (entries.has(cacheKey)) return;

    const col = cellIndex % KEY_ATLAS_COLS;
    const row = Math.floor(cellIndex / KEY_ATLAS_COLS);
    if (row >= KEY_ATLAS_ROWS) return;

    ctx.save();
    ctx.translate(col * KEY_CELL_SIZE, row * KEY_CELL_SIZE);
    paintKeyCell(ctx, key.label, key.sub ?? "", Boolean(key.isWASD));
    ctx.restore();

    entries.set(cacheKey, {
      u0: col * uSize,
      // Canvas y grows downwards while WebGL v grows upwards.
      v0: 1 - (row + 1) * vSize,
      uSize,
      vSize,
    });
    cellIndex++;
  });

  texture.needsUpdate = true;
  return { texture, entries };
}

/**
 * Exact Faceted 6-Sided ASUS TUF Power Button with Status LED & Power Symbol
 */
function createTufPowerButtonMesh(wireMat: THREE.Material): {
  group: THREE.Group;
  topMat: THREE.MeshBasicMaterial;
} {
  const pwrGroup = new THREE.Group();

  // Compact Faceted 6-sided TUF Shield Polygon
  const pShape = new THREE.Shape();
  const halfW = 0.075; // width = 0.15
  const topH = 0.065;  // upper slope height
  const botH = 0.065;  // lower slope height

  // 1. Top flat horizontal edge
  pShape.moveTo(-halfW * 0.45, -topH);
  pShape.lineTo(halfW * 0.45, -topH);
  // 2. Upper-right 45° slope outwards
  pShape.lineTo(halfW, -topH * 0.15);
  // 3. Lower-right 45° slope inwards to bottom
  pShape.lineTo(halfW * 0.65, botH);
  // 4. Bottom flat horizontal edge
  pShape.lineTo(-halfW * 0.65, botH);
  // 5. Lower-left 45° slope outwards
  pShape.lineTo(-halfW, -topH * 0.15);
  // 6. Upper-left 45° slope inwards to top
  pShape.lineTo(-halfW * 0.45, -topH);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.016,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.003,
    bevelThickness: 0.003,
  };

  const pwrGeo = new THREE.ExtrudeGeometry(pShape, extrudeSettings);
  pwrGeo.rotateX(Math.PI / 2);

  // Dedicated High-Resolution Power Button Canvas Texture (Rendered once in White)
  const pwrCanvas = document.createElement("canvas");
  pwrCanvas.width = 256;
  pwrCanvas.height = 256;
  const pCtx = pwrCanvas.getContext("2d");

  const pwrTexture = new THREE.CanvasTexture(pwrCanvas);
  pwrTexture.colorSpace = THREE.SRGBColorSpace;

  if (pCtx) {
    pCtx.fillStyle = "#000000";
    pCtx.fillRect(0, 0, 256, 256);

    // Faceted border glow
    pCtx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    pCtx.lineWidth = 8;
    pCtx.beginPath();
    pCtx.moveTo(68, 24);
    pCtx.lineTo(188, 24);
    pCtx.lineTo(240, 105);
    pCtx.lineTo(195, 232);
    pCtx.lineTo(61, 232);
    pCtx.lineTo(16, 105);
    pCtx.closePath();
    pCtx.stroke();

    // 1. Horizontal Status LED Slit (Top)
    pCtx.fillStyle = "#ffffff";
    pCtx.shadowColor = "#ffffff";
    pCtx.shadowBlur = 14;
    pCtx.fillRect(92, 44, 72, 12);

    // 2. Power Symbol (⏻)
    pCtx.strokeStyle = "#ffffff";
    pCtx.lineWidth = 14;
    pCtx.lineCap = "round";

    // Power Arc
    pCtx.beginPath();
    pCtx.arc(128, 148, 48, -Math.PI * 0.75, -Math.PI * 0.25, true);
    pCtx.stroke();

    // Power Center Vertical Stroke
    pCtx.beginPath();
    pCtx.moveTo(128, 92);
    pCtx.lineTo(128, 148);
    pCtx.stroke();
    pCtx.shadowBlur = 0;

    pwrTexture.needsUpdate = true;
  }

  const pwrSideMat = new THREE.MeshStandardMaterial({
    color: 0x000603,
    roughness: 0.5,
    metalness: 0.4,
  });

  const pwrTopMat = new THREE.MeshBasicMaterial({
    map: pwrTexture,
    color: DEFAULT_THEME.threeColor,
    toneMapped: false,
  });

  const pwrMesh = new THREE.Mesh(pwrGeo, [pwrTopMat, pwrSideMat]);
  pwrGroup.add(pwrMesh);

  // Wireframe highlight on power button edges
  const pwrWire = new THREE.LineSegments(new THREE.EdgesGeometry(pwrGeo, 15), wireMat);
  pwrGroup.add(pwrWire);

  return { group: pwrGroup, topMat: pwrTopMat };
}

interface Key3DDef {
  x: number;
  z: number;
  w: number;
  d: number;
  label: string;
  sub?: string;
  isWASD?: boolean;
  isSpace?: boolean;
  isSpecial?: boolean;
}

interface KeycapData {
  label: string;
  subLabel?: string;
  w?: number;
  d?: number;
  isSpace?: boolean;
  isEnter?: boolean;
  isWASD?: boolean;
  isSpecial?: boolean;
}

export function createLaptopMesh(): {
  group: THREE.Group;
  updateScreenTexture: (
    textLines?: string[],
    currentInput?: string,
    themeHex?: string,
    font?: TerminalFont,
    isPickerActive?: boolean
  ) => void;
  setTheme: (theme: WorkstationTheme) => void;
} {
  const group = new THREE.Group();
  group.name = "asus-tuf-f15-laptop";

  const wireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.6,
  });

  // 1. TUF F15 SCULPTED BASE CHASSIS WITH 45° CHAMFERED FRONT CORNERS
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x090f17,
    roughness: 0.42,
    metalness: 0.65,
  });

  const halfW = 2.2;
  const halfD = 1.45;
  const chamfer = 0.24;

  const baseShape = new THREE.Shape();
  baseShape.moveTo(-halfW, -halfD);
  baseShape.lineTo(halfW, -halfD);
  baseShape.lineTo(halfW, halfD - chamfer);
  baseShape.lineTo(halfW - chamfer, halfD);
  baseShape.lineTo(-(halfW - chamfer), halfD);
  baseShape.lineTo(-halfW, halfD - chamfer);
  baseShape.lineTo(-halfW, -halfD);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.13,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  };

  const baseGeo = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
  baseGeo.rotateX(Math.PI / 2);
  baseGeo.center();

  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.set(0, 0.065, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Base Edge Wireframe Glow
  const baseEdges = new THREE.EdgesGeometry(baseGeo, 15);
  const baseWire = new THREE.LineSegments(baseEdges, wireMat);
  baseWire.position.set(0, 0.065, 0);
  group.add(baseWire);

  // Palm Rest Diagonal Faceted Crease Lines
  const palmCreaseGeo = new THREE.BufferGeometry();
  const creasePositions = new Float32Array([
    -1.92, 0.149, -0.45,
    -halfW, 0.149, halfD - chamfer,
    1.92, 0.149, -0.45,
    halfW, 0.149, halfD - chamfer,
  ]);
  palmCreaseGeo.setAttribute("position", new THREE.BufferAttribute(creasePositions, 3));
  const palmCreaseLines = new THREE.LineSegments(palmCreaseGeo, wireMat);
  group.add(palmCreaseLines);

  // 2. TUF DUAL REAR HONEYCOMB EXHAUST VENTS (Left & Right)
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x000301,
    roughness: 0.9,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.15,
  });

  const createRearVent = (xPos: number) => {
    const ventGeo = new THREE.BoxGeometry(1.25, 0.09, 0.12);
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(xPos, 0.065, -1.44);
    group.add(vent);

    const ventWire = new THREE.LineSegments(new THREE.EdgesGeometry(ventGeo), wireMat);
    ventWire.position.set(xPos, 0.065, -1.44);
    group.add(ventWire);
  };

  createRearVent(-1.3);
  createRearVent(1.3);

  // 2b. EXACT TACTICAL SIDE I/O PORTS & SIDE EXHAUSTS (Left & Right Flanks - User Manual Blueprints)
  const portMat = new THREE.MeshStandardMaterial({
    color: 0x000201,
    roughness: 0.85,
    metalness: 0.9,
  });

  const portAccentMat = new THREE.MeshStandardMaterial({
    color: DEFAULT_THEME.threeColor,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.45,
    roughness: 0.25,
  });

  const speakerSlotMat = new THREE.MeshStandardMaterial({
    color: 0x000402,
    roughness: 0.9,
    metalness: 0.5,
  });

  // ---------------- LEFT VIEW (From Rear to Front) ----------------
  const leftPortGroup = new THREE.Group();
  leftPortGroup.position.set(-halfW - 0.005, 0.065, 0);

  // 1. Power (DC) Input Barrel Port (Callout 1)
  const dcOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.035, 16), portMat);
  dcOuter.rotation.z = Math.PI / 2;
  dcOuter.position.set(0, 0.015, -1.05);
  leftPortGroup.add(dcOuter);

  const dcPin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.042, 12), portAccentMat);
  dcPin.rotation.z = Math.PI / 2;
  dcPin.position.set(0, 0.015, -1.05);
  leftPortGroup.add(dcPin);

  // 2. LAN RJ-45 Ethernet Port with Drop-Jaw (Callout 2)
  const rj45 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.09), portMat);
  rj45.position.set(0, 0.012, -0.80);
  leftPortGroup.add(rj45);
  const rj45Wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.04, 0.06, 0.09)), wireMat);
  rj45Wire.position.set(0, 0.012, -0.80);
  leftPortGroup.add(rj45Wire);

  // 3. HDMI 2.0b Port (Callout 3)
  const hdmi = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.036, 0.082), portMat);
  hdmi.position.set(0, 0.012, -0.58);
  leftPortGroup.add(hdmi);

  // 4. Dual USB 3.2 Gen 1 Type-A Ports (Callout 4)
  const usbL1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.034, 0.068), portAccentMat);
  usbL1.position.set(0, 0.012, -0.36);
  leftPortGroup.add(usbL1);

  const usbL2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.034, 0.068), portAccentMat);
  usbL2.position.set(0, 0.012, -0.16);
  leftPortGroup.add(usbL2);

  // 5. USB Type-C Thunderbolt 4 Port (Callout 5)
  const usbC = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 10), portMat);
  usbC.rotation.z = Math.PI / 2;
  usbC.position.set(0, 0.012, 0.06);
  leftPortGroup.add(usbC);

  // 6. 3.5mm Headphone / Mic Combo Audio Jack (Callout 6)
  const audioJack = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 14), portMat);
  audioJack.rotation.z = Math.PI / 2;
  audioJack.position.set(0, 0.012, 0.24);
  leftPortGroup.add(audioJack);

  // 7. Left Audio Speaker Cutout (Callout 7)
  const speakerL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.28), speakerSlotMat);
  speakerL.position.set(0, 0.005, 0.72);
  leftPortGroup.add(speakerL);
  const speakerLWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.035, 0.025, 0.28)), wireMat);
  speakerLWire.position.set(0, 0.005, 0.72);
  leftPortGroup.add(speakerLWire);

  group.add(leftPortGroup);

  // ---------------- RIGHT VIEW (From Front to Rear) ----------------
  const rightPortGroup = new THREE.Group();
  rightPortGroup.position.set(halfW + 0.005, 0.065, 0);

  // 1. Right Audio Speaker Cutout (Callout 1)
  const speakerR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.28), speakerSlotMat);
  speakerR.position.set(0, 0.005, 0.72);
  rightPortGroup.add(speakerR);
  const speakerRWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.035, 0.025, 0.28)), wireMat);
  speakerRWire.position.set(0, 0.005, 0.72);
  rightPortGroup.add(speakerRWire);

  // 2. USB 2.0 Type-A Port (Callout 2)
  const usbR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.034, 0.068), portMat);
  usbR.position.set(0, 0.012, 0.22);
  rightPortGroup.add(usbR);

  // 3. 16-Slit Side Exhaust Vent Grid (2 Rows of 8 Slots - Callout 3)
  const ventSlotGeo = new THREE.BoxGeometry(0.035, 0.018, 0.06);
  const ventSlotMat = new THREE.MeshStandardMaterial({
    color: 0x000301,
    roughness: 0.95,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.18,
  });

  const ventSlotEdges = new THREE.EdgesGeometry(ventSlotGeo);
  const ventSlotWireMat = new THREE.LineBasicMaterial({ color: DEFAULT_THEME.threeColor, transparent: true, opacity: 0.4 });

  // 2 horizontal rows x 8 columns = 16 distinct side exhaust vents
  for (let row = 0; row < 2; row++) {
    const vy = 0.024 - row * 0.024;
    for (let col = 0; col < 8; col++) {
      const vz = -0.32 - col * 0.075;
      const vMesh = new THREE.Mesh(ventSlotGeo, ventSlotMat);
      vMesh.position.set(0, vy, vz);
      rightPortGroup.add(vMesh);

      const vWire = new THREE.LineSegments(ventSlotEdges, ventSlotWireMat);
      vWire.position.set(0, vy, vz);
      rightPortGroup.add(vWire);
    }
  }

  // 4. Kensington Security Lock Slot (Callout 4)
  const lockSlot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.044, 0.044), portMat);
  lockSlot.position.set(0, 0.012, -1.08);
  rightPortGroup.add(lockSlot);
  const lockSlotWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.04, 0.044, 0.044)), wireMat);
  lockSlotWire.position.set(0, 0.012, -1.08);
  rightPortGroup.add(lockSlotWire);

  group.add(rightPortGroup);

  // Bottom Anti-Slip Rubber Feet Pads (Front & Rear on Both Sides)
  const footPadGeo = new THREE.BoxGeometry(0.18, 0.02, 0.12);
  const footPadMat = new THREE.MeshStandardMaterial({ color: 0x000603, roughness: 0.9 });
  const footPadEdges = new THREE.EdgesGeometry(footPadGeo);

  const footPositions: [number, number, number][] = [
    [-halfW + 0.22, 0.005, 1.22],  // Front-Left
    [halfW - 0.22, 0.005, 1.22],   // Front-Right
    [-halfW + 0.22, 0.005, -1.25], // Rear-Left
    [halfW - 0.22, 0.005, -1.25],  // Rear-Right
  ];

  footPositions.forEach(([fx, fy, fz]) => {
    const fMesh = new THREE.Mesh(footPadGeo, footPadMat);
    fMesh.position.set(fx, fy, fz);
    group.add(fMesh);

    const fWire = new THREE.LineSegments(footPadEdges, wireMat);
    fWire.position.set(fx, fy, fz);
    group.add(fWire);
  });

  // 2c. 4 SYSTEM STATUS INDICATOR LEDS ON HINGE DECK (Callout 8)
  const statusLedsGroup = new THREE.Group();
  statusLedsGroup.position.set(-0.75, 0.145, -1.24);

  const ledGeo = new THREE.SphereGeometry(0.012, 6, 6);
  // Power Status LED
  const pwrStatusLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x00ff66 }));
  pwrStatusLed.position.set(-0.15, 0, 0);
  statusLedsGroup.add(pwrStatusLed);

  // Battery / Charging Status LED
  const batLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  batLed.position.set(-0.05, 0, 0);
  statusLedsGroup.add(batLed);

  // Storage Drive Activity LED
  const driveLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  driveLed.position.set(0.05, 0, 0);
  statusLedsGroup.add(driveLed);

  // Airplane Mode Status LED
  const airLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  airLed.position.set(0.15, 0, 0);
  statusLedsGroup.add(airLed);

  group.add(statusLedsGroup);



  // 3. RECESSED 3D KEYBOARD WELL TRAY
  const wellGeo = new THREE.BoxGeometry(3.85, 0.02, 1.48);
  const wellMat = new THREE.MeshStandardMaterial({
    color: 0x060b11,
    roughness: 0.65,
    metalness: 0.35,
  });
  const wellMesh = new THREE.Mesh(wellGeo, wellMat);
  wellMesh.position.set(0, 0.138, -0.45);
  group.add(wellMesh);

  const wellWire = new THREE.LineSegments(new THREE.EdgesGeometry(wellGeo), wireMat);
  wellWire.position.set(0, 0.138, -0.45);
  group.add(wellWire);

  // 24 Diagonal Slanted Intake Vents Above Keyboard Deck (Callout 6)
  const slitMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.55,
  });
  const slitPositions: number[] = [];
  for (let i = 0; i < 24; i++) {
    const sx = -1.15 + i * 0.10;
    slitPositions.push(sx, 0.148, -1.24, sx + 0.06, 0.148, -1.18);
  }
  const slitGeo = new THREE.BufferGeometry();
  slitGeo.setAttribute("position", new THREE.Float32BufferAttribute(slitPositions, 3));
  const slitLines = new THREE.LineSegments(slitGeo, slitMat);
  group.add(slitLines);

  // 4. INDIVIDUAL 3D PHYSICAL CHICLET KEYS (EXACT ASUS TUF GAMING F15 BLUEPRINT)
  const keySideMat = new THREE.MeshStandardMaterial({
    color: 0x0d1521,
    roughness: 0.48,
    metalness: 0.45,
  });

  const wasdSideMat = new THREE.MeshStandardMaterial({
    color: 0x00ffaa,
    emissive: 0x00ff88,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const keys3D: Key3DDef[] = [
    // ---------------- Row 0: Function Row (z = -1.04, d = 0.11) ----------------
    { x: -1.70, z: -1.04, w: 0.16, d: 0.11, label: "ESC", isSpecial: true },
    // F1-F4 Block (Audio & Mic Controls)
    { x: -1.46, z: -1.04, w: 0.13, d: 0.11, label: "F1", sub: "🔇" },
    { x: -1.31, z: -1.04, w: 0.13, d: 0.11, label: "F2", sub: "🔉" },
    { x: -1.16, z: -1.04, w: 0.13, d: 0.11, label: "F3", sub: "🔊" },
    { x: -1.01, z: -1.04, w: 0.13, d: 0.11, label: "F4", sub: "🎙" },
    // F5-F8 Block (Fan, Screen & Display Brightness)
    { x: -0.80, z: -1.04, w: 0.13, d: 0.11, label: "F5", sub: "💨" },
    { x: -0.65, z: -1.04, w: 0.13, d: 0.11, label: "F6", sub: "✂" },
    { x: -0.50, z: -1.04, w: 0.13, d: 0.11, label: "F7", sub: "🔅" },
    { x: -0.35, z: -1.04, w: 0.13, d: 0.11, label: "F8", sub: "🔆" },
    // F9-F12 Block (Display, Touchpad, Sleep, Airplane)
    { x: -0.14, z: -1.04, w: 0.13, d: 0.11, label: "F9", sub: "🖵" },
    { x: 0.01, z: -1.04, w: 0.13, d: 0.11, label: "F10", sub: "🖲" },
    { x: 0.16, z: -1.04, w: 0.13, d: 0.11, label: "F11", sub: "💤" },
    { x: 0.31, z: -1.04, w: 0.13, d: 0.11, label: "F12", sub: "✈" },
    // Top-Right Numpad Function Row (Aligned with Numpad columns)
    { x: 1.08, z: -1.04, w: 0.16, d: 0.11, label: "DELETE", sub: "INS" },
    { x: 1.26, z: -1.04, w: 0.16, d: 0.11, label: "PAUSE", sub: "BRK" },
    { x: 1.44, z: -1.04, w: 0.16, d: 0.11, label: "PRTSC", sub: "SYS" },
    { x: 1.62, z: -1.04, w: 0.16, d: 0.11, label: "HOME", sub: "END" },

    // ---------------- Row 1: Number Row (z = -0.82, d = 0.165) ----------------
    { x: -1.70, z: -0.82, w: 0.15, d: 0.165, label: "`", sub: "~" },
    { x: -1.53, z: -0.82, w: 0.15, d: 0.165, label: "1", sub: "!" },
    { x: -1.36, z: -0.82, w: 0.15, d: 0.165, label: "2", sub: "@" },
    { x: -1.19, z: -0.82, w: 0.15, d: 0.165, label: "3", sub: "#" },
    { x: -1.02, z: -0.82, w: 0.15, d: 0.165, label: "4", sub: "$" },
    { x: -0.85, z: -0.82, w: 0.15, d: 0.165, label: "5", sub: "%" },
    { x: -0.68, z: -0.82, w: 0.15, d: 0.165, label: "6", sub: "^" },
    { x: -0.51, z: -0.82, w: 0.15, d: 0.165, label: "7", sub: "&" },
    { x: -0.34, z: -0.82, w: 0.15, d: 0.165, label: "8", sub: "*" },
    { x: -0.17, z: -0.82, w: 0.15, d: 0.165, label: "9", sub: "(" },
    { x: 0.00, z: -0.82, w: 0.15, d: 0.165, label: "0", sub: ")" },
    { x: 0.17, z: -0.82, w: 0.15, d: 0.165, label: "-", sub: "_" },
    { x: 0.34, z: -0.82, w: 0.15, d: 0.165, label: "=", sub: "+" },
    { x: 0.56, z: -0.82, w: 0.26, d: 0.165, label: "BACK ⌫", isSpecial: true },
    // Numpad Row 1
    { x: 1.08, z: -0.82, w: 0.16, d: 0.165, label: "NUM LK" },
    { x: 1.26, z: -0.82, w: 0.16, d: 0.165, label: "/" },
    { x: 1.44, z: -0.82, w: 0.16, d: 0.165, label: "*" },
    { x: 1.62, z: -0.82, w: 0.16, d: 0.165, label: "-" },

    // ---------------- Row 2: QWERTY Row (z = -0.61, d = 0.165) ----------------
    { x: -1.67, z: -0.61, w: 0.21, d: 0.165, label: "TAB ⇥", isSpecial: true },
    { x: -1.46, z: -0.61, w: 0.15, d: 0.165, label: "Q" },
    // 🟢 3D FROSTED 'W' KEY
    { x: -1.29, z: -0.61, w: 0.15, d: 0.165, label: "W", isWASD: true },
    { x: -1.12, z: -0.61, w: 0.15, d: 0.165, label: "E" },
    { x: -0.95, z: -0.61, w: 0.15, d: 0.165, label: "R" },
    { x: -0.78, z: -0.61, w: 0.15, d: 0.165, label: "T" },
    { x: -0.61, z: -0.61, w: 0.15, d: 0.165, label: "Y" },
    { x: -0.44, z: -0.61, w: 0.15, d: 0.165, label: "U" },
    { x: -0.27, z: -0.61, w: 0.15, d: 0.165, label: "I" },
    { x: -0.10, z: -0.61, w: 0.15, d: 0.165, label: "O" },
    { x: 0.07, z: -0.61, w: 0.15, d: 0.165, label: "P" },
    { x: 0.24, z: -0.61, w: 0.15, d: 0.165, label: "[ {" },
    { x: 0.41, z: -0.61, w: 0.15, d: 0.165, label: "] }" },
    { x: 0.58, z: -0.61, w: 0.18, d: 0.165, label: "\\ |" },
    // Numpad Row 2
    { x: 1.08, z: -0.61, w: 0.16, d: 0.165, label: "7", sub: "HOME" },
    { x: 1.26, z: -0.61, w: 0.16, d: 0.165, label: "8", sub: "▲" },
    { x: 1.44, z: -0.61, w: 0.16, d: 0.165, label: "9", sub: "PGUP" },
    { x: 1.62, z: -0.505, w: 0.16, d: 0.355, label: "+" }, // Tall + key

    // ---------------- Row 3: Home Row (z = -0.40, d = 0.165) ----------------
    { x: -1.64, z: -0.40, w: 0.27, d: 0.165, label: "CAPS LOCK", isSpecial: true },
    // 🟢 3D FROSTED 'A', 'S', 'D' KEYS
    { x: -1.41, z: -0.40, w: 0.15, d: 0.165, label: "A", isWASD: true },
    { x: -1.24, z: -0.40, w: 0.15, d: 0.165, label: "S", isWASD: true },
    { x: -1.07, z: -0.40, w: 0.15, d: 0.165, label: "D", isWASD: true },
    { x: -0.90, z: -0.40, w: 0.15, d: 0.165, label: "F" },
    { x: -0.73, z: -0.40, w: 0.15, d: 0.165, label: "G" },
    { x: -0.56, z: -0.40, w: 0.15, d: 0.165, label: "H" },
    { x: -0.39, z: -0.40, w: 0.15, d: 0.165, label: "J" },
    { x: -0.22, z: -0.40, w: 0.15, d: 0.165, label: "K" },
    { x: -0.05, z: -0.40, w: 0.15, d: 0.165, label: "L" },
    { x: 0.12, z: -0.40, w: 0.15, d: 0.165, label: "; :" },
    { x: 0.29, z: -0.40, w: 0.15, d: 0.165, label: "' \"" },
    { x: 0.52, z: -0.40, w: 0.30, d: 0.165, label: "ENTER ↵", isSpecial: true },
    // Numpad Row 3
    { x: 1.08, z: -0.40, w: 0.16, d: 0.165, label: "4", sub: "◄" },
    { x: 1.26, z: -0.40, w: 0.16, d: 0.165, label: "5" },
    { x: 1.44, z: -0.40, w: 0.16, d: 0.165, label: "6", sub: "►" },

    // ---------------- Row 4: Shift Row (z = -0.19, d = 0.165) ----------------
    { x: -1.60, z: -0.19, w: 0.35, d: 0.165, label: "SHIFT ⇧", isSpecial: true },
    { x: -1.33, z: -0.19, w: 0.15, d: 0.165, label: "Z" },
    { x: -1.16, z: -0.19, w: 0.15, d: 0.165, label: "X" },
    { x: -0.99, z: -0.19, w: 0.15, d: 0.165, label: "C" },
    { x: -0.82, z: -0.19, w: 0.15, d: 0.165, label: "V" },
    { x: -0.65, z: -0.19, w: 0.15, d: 0.165, label: "B" },
    { x: -0.48, z: -0.19, w: 0.15, d: 0.165, label: "N" },
    { x: -0.31, z: -0.19, w: 0.15, d: 0.165, label: "M", sub: "μ" },
    { x: -0.14, z: -0.19, w: 0.15, d: 0.165, label: ", <" },
    { x: 0.03, z: -0.19, w: 0.15, d: 0.165, label: ". >" },
    { x: 0.20, z: -0.19, w: 0.15, d: 0.165, label: "/ ?" },
    { x: 0.48, z: -0.19, w: 0.39, d: 0.165, label: "SHIFT ⇧", isSpecial: true },
    // Numpad Row 4
    { x: 1.08, z: -0.19, w: 0.16, d: 0.165, label: "1", sub: "END" },
    { x: 1.26, z: -0.19, w: 0.16, d: 0.165, label: "2", sub: "▼" },
    { x: 1.44, z: -0.19, w: 0.16, d: 0.165, label: "3", sub: "PGDN" },
    { x: 1.62, z: -0.085, w: 0.16, d: 0.355, label: "ENTER", sub: "⏎", isSpecial: true }, // Tall Numpad Enter

    // ---------------- Row 5: Bottom Modifier & Dropped Arrows (z = +0.02, d = 0.165) ----------------
    { x: -1.69, z: 0.02, w: 0.17, d: 0.165, label: "CTRL", isSpecial: true },
    { x: -1.50, z: 0.02, w: 0.15, d: 0.165, label: "FN" },
    { x: -1.33, z: 0.02, w: 0.15, d: 0.165, label: "⊞ WIN", sub: "🔒" },
    { x: -1.16, z: 0.02, w: 0.15, d: 0.165, label: "ALT" },
    // (ASUS TUF Spacebar is custom sculpted below at x = -0.54)
    { x: 0.08, z: 0.02, w: 0.15, d: 0.165, label: "ALT" },
    { x: 0.25, z: 0.02, w: 0.15, d: 0.165, label: "FN" },
    { x: 0.42, z: 0.02, w: 0.15, d: 0.165, label: "CTRL", sub: "▤", isSpecial: true },
    // Dropped Arrow Cluster
    { x: 0.60, z: 0.05, w: 0.14, d: 0.11, label: "◀", sub: "AURA" },
    { x: 0.76, z: -0.005, w: 0.14, d: 0.075, label: "▲" },
    { x: 0.76, z: 0.075, w: 0.14, d: 0.075, label: "▼" },
    { x: 0.92, z: 0.05, w: 0.14, d: 0.11, label: "▶", sub: "AURA" },
    // Numpad Bottom (Wide 0 & .)
    { x: 1.17, z: 0.02, w: 0.34, d: 0.165, label: "0", sub: "INS" },
    { x: 1.44, z: 0.02, w: 0.16, d: 0.165, label: ".", sub: "DEL" },
  ];

  // Render all standard 3D physical keys as merged batches.
  // Total draw calls for the ~100-key deck: standard bodies, WASD bodies,
  // standard legends, WASD legends, and a single merged wireframe.
  const keyHeight = 0.024;
  const keyY = 0.154;

  const keyAtlas = createKeyTopAtlas(
    keys3D.map((k) => ({ label: k.label, sub: k.sub, isWASD: k.isWASD }))
  );

  const standardBodies: THREE.BufferGeometry[] = [];
  const wasdBodies: THREE.BufferGeometry[] = [];
  const standardTops: THREE.BufferGeometry[] = [];
  const wasdTops: THREE.BufferGeometry[] = [];

  keys3D.forEach((k) => {
    const bodyGeo = new THREE.BoxGeometry(k.w, keyHeight, k.d);
    bodyGeo.translate(k.x, keyY, k.z);
    (k.isWASD ? wasdBodies : standardBodies).push(bodyGeo);

    const entry = keyAtlas.entries.get(
      `${k.label}|${k.sub ?? ""}|${k.isWASD ? 1 : 0}`
    );
    if (!entry) return;

    // Thin legend plane hovering just above the keycap body.
    const topGeo = new THREE.PlaneGeometry(k.w, k.d);
    topGeo.rotateX(-Math.PI / 2);

    const uv = topGeo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        entry.u0 + uv.getX(i) * entry.uSize,
        entry.v0 + uv.getY(i) * entry.vSize
      );
    }
    uv.needsUpdate = true;

    topGeo.translate(k.x, keyY + keyHeight / 2 + 0.0004, k.z);
    (k.isWASD ? wasdTops : standardTops).push(topGeo);
  });

  const standardBodyGeo = mergeGeometries(standardBodies, false);
  const wasdBodyGeo = mergeGeometries(wasdBodies, false);
  const standardTopGeo = mergeGeometries(standardTops, false);
  const wasdTopGeo = mergeGeometries(wasdTops, false);

  const standardTopMat = new THREE.MeshBasicMaterial({
    map: keyAtlas.texture,
    color: DEFAULT_THEME.threeColor,
    toneMapped: false,
  });
  const wasdTopMat = new THREE.MeshBasicMaterial({
    map: keyAtlas.texture,
    color: 0xffffff,
    toneMapped: false,
  });

  if (standardBodyGeo) {
    const mesh = new THREE.Mesh(standardBodyGeo, keySideMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (wasdBodyGeo) {
    const mesh = new THREE.Mesh(wasdBodyGeo, wasdSideMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (standardTopGeo) {
    const mesh = new THREE.Mesh(standardTopGeo, standardTopMat);
    group.add(mesh);
  }
  if (wasdTopGeo) {
    const mesh = new THREE.Mesh(wasdTopGeo, wasdTopMat);
    group.add(mesh);
  }

  // One merged wireframe for every keycap (was ~100 separate LineSegments).
  const allKeyGeos = [...standardBodies, ...wasdBodies];
  const mergedKeyGeo = mergeGeometries(allKeyGeos, false);
  if (mergedKeyGeo) {
    const mergedKeyWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(mergedKeyGeo),
      wireMat
    );
    group.add(mergedKeyWire);
    mergedKeyGeo.dispose();
  }
  [...standardBodies, ...wasdBodies, ...standardTops, ...wasdTops].forEach((g) =>
    g.dispose()
  );

  // ---------------- UNIQUE 3D SCULPTED ASUS TUF SPACEBAR ----------------
  // Distinct ASUS TUF spacebar profile with thumb extension & bottom-left 45° chamfer
  const sbShape = new THREE.Shape();
  const sbHalfW = 0.48; // Total width 0.96
  const sbTopZ = -0.08;
  const sbNormBottomZ = 0.08;
  const sbThumbBottomZ = 0.14;
  const sbChamfer = 0.04;

  // 1. Top-Left
  sbShape.moveTo(-sbHalfW, sbTopZ);
  // 2. Top Edge across to Top-Right
  sbShape.lineTo(sbHalfW, sbTopZ);
  // 3. Right Edge down to standard bottom
  sbShape.lineTo(sbHalfW, sbNormBottomZ);
  // 4. Standard bottom edge across to transition point
  sbShape.lineTo(0.04, sbNormBottomZ);
  // 5. 45-degree diagonal step down to extended thumb rest
  sbShape.lineTo(-0.04, sbThumbBottomZ);
  // 6. Thumb rest bottom edge across to chamfer cut start
  sbShape.lineTo(-sbHalfW + sbChamfer, sbThumbBottomZ);
  // 7. 45-degree chamfer cut on bottom-left corner
  sbShape.lineTo(-sbHalfW, sbThumbBottomZ - sbChamfer);
  // 8. Left Edge up to Top-Left
  sbShape.lineTo(-sbHalfW, sbTopZ);

  const sbExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.024,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.005,
    bevelThickness: 0.005,
  };

  const sbGeo = new THREE.ExtrudeGeometry(sbShape, sbExtrudeSettings);
  sbGeo.rotateX(Math.PI / 2); // Rotate so height is in Y

  const sbMesh = new THREE.Mesh(sbGeo, keySideMat);
  sbMesh.position.set(-0.54, 0.166, 0);
  sbMesh.castShadow = true;
  sbMesh.receiveShadow = true;
  group.add(sbMesh);

  // Wireframe outlines tracing the iconic TUF spacebar geometry
  const sbWire = new THREE.LineSegments(new THREE.EdgesGeometry(sbGeo, 15), wireMat);
  sbWire.position.set(-0.54, 0.166, 0);
  group.add(sbWire);

  // Spacebar Center Laser Bar Stripe
  const sbStripeGeo = new THREE.PlaneGeometry(0.24, 0.02);
  const sbStripeMat = new THREE.MeshBasicMaterial({ color: DEFAULT_THEME.threeColor });
  const sbStripe = new THREE.Mesh(sbStripeGeo, sbStripeMat);
  sbStripe.rotation.x = -Math.PI / 2;
  sbStripe.position.set(-0.54, 0.172, 0);
  group.add(sbStripe);

  // 4b. TUF GAMING TOUCHPAD WITH 4 CORNER CROSSHAIRS & DUAL PHYSICAL BUTTONS
  const touchCanvas = document.createElement("canvas");
  touchCanvas.width = 512;
  touchCanvas.height = 320;
  const touchCtx = touchCanvas.getContext("2d");

  const touchTexture = new THREE.CanvasTexture(touchCanvas);
  touchTexture.colorSpace = THREE.SRGBColorSpace;

  if (touchCtx) {
    touchCtx.fillStyle = "#000000";
    touchCtx.fillRect(0, 0, 512, 320);

    touchCtx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 0; x < 512; x += 16) {
      for (let y = 0; y < 320; y += 16) {
        touchCtx.fillRect(x, y, 1.5, 1.5);
      }
    }

    touchCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    touchCtx.lineWidth = 4;
    touchCtx.strokeRect(6, 6, 500, 308);

    // 4 Corner Targeting Crosshairs
    touchCtx.strokeStyle = "#ffffff";
    touchCtx.lineWidth = 3;
    const tick = 18;
    // Top-Left
    touchCtx.beginPath();
    touchCtx.moveTo(24, 24); touchCtx.lineTo(24 + tick, 24);
    touchCtx.moveTo(24, 24); touchCtx.lineTo(24, 24 + tick);
    // Top-Right
    touchCtx.moveTo(488, 24); touchCtx.lineTo(488 - tick, 24);
    touchCtx.moveTo(488, 24); touchCtx.lineTo(488, 24 + tick);
    // Bottom-Left
    touchCtx.moveTo(24, 296); touchCtx.lineTo(24 + tick, 296);
    touchCtx.moveTo(24, 296); touchCtx.lineTo(24, 296 - tick);
    // Bottom-Right
    touchCtx.moveTo(488, 296); touchCtx.lineTo(488 - tick, 296);
    touchCtx.moveTo(488, 296); touchCtx.lineTo(488, 296 - tick);
    touchCtx.stroke();

    touchTexture.needsUpdate = true;
  }

  const touchFaceMat = new THREE.MeshBasicMaterial({
    map: touchTexture,
    color: DEFAULT_THEME.threeColor,
    toneMapped: false,
  });

  const touchBodyMat = new THREE.MeshStandardMaterial({
    color: 0x090f17,
    roughness: 0.42,
    metalness: 0.55,
  });

  const touchMaterials = [
    touchBodyMat, // right
    touchBodyMat, // left
    touchFaceMat, // top (+Y face with corner crosshairs texture)
    touchBodyMat, // bottom
    touchBodyMat, // front
    touchBodyMat, // back
  ];

  // Main Touchpad Surface
  const touchGeo = new THREE.BoxGeometry(1.42, 0.015, 0.65);
  const touchMesh = new THREE.Mesh(touchGeo, touchMaterials);
  touchMesh.position.set(-0.1, 0.149, 0.68);
  group.add(touchMesh);

  const touchWire = new THREE.LineSegments(new THREE.EdgesGeometry(touchGeo), wireMat);
  touchWire.position.set(-0.1, 0.149, 0.68);
  group.add(touchWire);

  // Discrete Physical Left & Right Click Buttons
  const btnMat = new THREE.MeshStandardMaterial({
    color: 0x0c141e,
    roughness: 0.35,
    metalness: 0.6,
  });

  const btnLGeo = new THREE.BoxGeometry(0.69, 0.015, 0.22);
  const btnL = new THREE.Mesh(btnLGeo, btnMat);
  btnL.position.set(-0.46, 0.149, 1.13);
  group.add(btnL);

  const btnLWire = new THREE.LineSegments(new THREE.EdgesGeometry(btnLGeo), wireMat);
  btnLWire.position.set(-0.46, 0.149, 1.13);
  group.add(btnLWire);

  const btnRGeo = new THREE.BoxGeometry(0.69, 0.015, 0.22);
  const btnR = new THREE.Mesh(btnRGeo, btnMat);
  btnR.position.set(0.26, 0.149, 1.13);
  group.add(btnR);

  const btnRWire = new THREE.LineSegments(new THREE.EdgesGeometry(btnRGeo), wireMat);
  btnRWire.position.set(0.26, 0.149, 1.13);
  group.add(btnRWire);

  // 5. EXACT ASUS TUF FACETED SHIELD POWER BUTTON WITH STATUS LED & POWER ICON (Callout 10)
  const pwrButton = createTufPowerButtonMesh(wireMat);
  pwrButton.group.position.set(2.06, 0.154, -1.34);
  group.add(pwrButton.group);

  // 6. DISPLAY LID PIVOT (ANGLED UPRIGHT FACING USER)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.13, -1.38);
  lidPivot.rotation.x = -0.22; // ~102 degree natural gaming laptop viewing angle
  group.add(lidPivot);

  // 7. PROCEDURAL CRT TERMINAL SCREEN TEXTURE (FRONT FACE)
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  const screenCtx = screenCanvas.getContext("2d");

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.minFilter = THREE.LinearFilter;
      screenTexture.magFilter = THREE.LinearFilter;
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  // Preload Neeraj M avatar image for in-terminal display
  let avatarImg: HTMLImageElement | null = null;
  if (typeof window !== "undefined") {
    avatarImg = new Image();
    avatarImg.src = "/avatar-neeraj.png";
  }

  let lastRenderLines: string[] | undefined = undefined;
  let lastRenderInput: string = "";
  let lastRenderTheme: string = "#00ff66";
  let lastRenderFont: TerminalFont = DEFAULT_TERMINAL_FONT;
  let lastRenderPickerActive: boolean = false;

  const renderScreen = (
    lines?: string[],
    currentInput: string = "",
    themeHex: string = "#00ff66",
    font: TerminalFont = lastRenderFont,
    isPickerActive: boolean = lastRenderPickerActive
  ) => {
    lastRenderLines = lines;
    lastRenderInput = currentInput;
    lastRenderTheme = themeHex;
    lastRenderFont = font || DEFAULT_TERMINAL_FONT;
    lastRenderPickerActive = isPickerActive;
    if (!screenCtx) return;

    // Deep CRT Green-Black background
    screenCtx.fillStyle = "#000803";
    screenCtx.fillRect(0, 0, 1024, 640);

    // Subtle CRT Scanline Overlay
    screenCtx.fillStyle = `${themeHex}08`;
    for (let y = 0; y < 640; y += 6) {
      screenCtx.fillRect(0, y, 1024, 3);
    }

    // Command History
    const history = lines || [];
    const visibleLines = history.slice(-14);
    let startY = 44;

    const fontStyle = lastRenderFont.canvasFontSize || "bold 19px";
    screenCtx.font = `${fontStyle} ${lastRenderFont.family}`;
    visibleLines.forEach((line) => {
      if (line.startsWith("[FONT_ROW:")) {
        const match = line.match(/^\[FONT_ROW:([^:]+):([01]):([01])\](.*)$/);
        if (match) {
          const fontId = match[1];
          const isSelected = match[2] === "1";
          const isActive = match[3] === "1";
          const itemFont = TERMINAL_FONTS.find((f) => f.id === fontId);

          if (isSelected) {
            screenCtx.fillStyle = `${themeHex}25`;
            screenCtx.fillRect(32, startY - 20, 960, 28);
            screenCtx.strokeStyle = themeHex;
            screenCtx.lineWidth = 1.5;
            screenCtx.strokeRect(32, startY - 20, 960, 28);
          }

          if (itemFont) {
            const fontIdx = TERMINAL_FONTS.indexOf(itemFont) + 1;
            const marker = isSelected ? "●" : " ";
            const numStr = `  ${marker} ${String(fontIdx).padStart(2, " ")}. `;

            // 1. Draw prefix (marker + number) in active terminal UI font
            screenCtx.font = `${fontStyle} ${lastRenderFont.family}`;
            screenCtx.fillStyle = isSelected ? "#ffffff" : themeHex;
            screenCtx.fillText(numStr, 36, startY);

            // 2. Draw Font Name in ITS OWN SPECIFIC FONT!
            const itemStyle = itemFont.canvasFontSize || "bold 19px";
            screenCtx.font = `${itemStyle} ${itemFont.family}`;
            screenCtx.fillStyle = isSelected ? "#ffffff" : themeHex;
            if (isSelected) {
              screenCtx.shadowColor = themeHex;
              screenCtx.shadowBlur = 8;
            }
            screenCtx.fillText(itemFont.name, 36 + 82, startY);
            screenCtx.shadowBlur = 0;

            // 3. Draw Instant Apply Command in active terminal font
            screenCtx.font = `${fontStyle} ${lastRenderFont.family}`;
            screenCtx.fillStyle = isSelected ? "#ffffff" : `${themeHex}99`;
            screenCtx.fillText(`→  ${itemFont.commandAlias}`, 36 + 320, startY);

            // 4. Draw [ACTIVE] badge if currently active
            if (isActive) {
              screenCtx.fillStyle = isSelected ? "#ffffff" : "#ffffff";
              screenCtx.shadowColor = themeHex;
              screenCtx.shadowBlur = 6;
              screenCtx.fillText("[ACTIVE]", 36 + 550, startY);
              screenCtx.shadowBlur = 0;
            }
          }

          startY += 30;
          return;
        }
      }

      if (line === "[IMG:avatar]" || line.startsWith("[IMG:avatar]")) {
        // Draw the avatar image directly on the CRT terminal without outer borders
        const imgSize = 136;
        if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
          screenCtx.drawImage(avatarImg, 36, startY, imgSize, imgSize);
        } else {
          screenCtx.fillStyle = themeHex;
          screenCtx.fillText("[AVATAR: NEERAJ M]", 36, startY + 70);
        }
        startY += imgSize + 16;
      } else if (line.startsWith("[ERR]")) {
        screenCtx.fillStyle = "#ff4444";
        screenCtx.fillText(line, 36, startY);
        startY += 30;
      } else if (line.startsWith("  ●") || line.startsWith("  >")) {
        // Active selected item in interactive picker menu
        screenCtx.fillStyle = `${themeHex}25`;
        screenCtx.fillRect(32, startY - 20, 960, 28);
        screenCtx.strokeStyle = themeHex;
        screenCtx.lineWidth = 1.5;
        screenCtx.strokeRect(32, startY - 20, 960, 28);

        screenCtx.fillStyle = "#ffffff";
        screenCtx.shadowColor = themeHex;
        screenCtx.shadowBlur = 8;
        screenCtx.fillText(line, 36, startY);
        screenCtx.shadowBlur = 0;
        startY += 30;
      } else if (line.startsWith("┌") || line.startsWith("└") || line.startsWith("│") || line.startsWith("├")) {
        // Menu borders
        screenCtx.fillStyle = themeHex;
        screenCtx.fillText(line, 36, startY);
        startY += 28;
      } else if (line.startsWith("[OK]")) {
        screenCtx.fillStyle = "#ffffff";
        screenCtx.shadowColor = themeHex;
        screenCtx.shadowBlur = 6;
        screenCtx.fillText(line, 36, startY);
        screenCtx.shadowBlur = 0;
        startY += 30;
      } else {
        screenCtx.fillStyle = themeHex;
        screenCtx.fillText(line, 36, startY);
        startY += 30;
      }
    });

    // Check if an interactive picker is open (hide prompt while navigating menu)
    const isPickerOpen =
      isPickerActive ||
      (visibleLines.some(
        (l) =>
          l.includes("[FONT_ROW:") ||
          l.includes("WORKSTATION RGB PROFILE") ||
          l.includes("TERMINAL MONOSPACE FONT") ||
          l.includes("Use [↑ / ↓] to live-preview")
      ) &&
        !visibleLines.slice(-3).some((l) => l.startsWith("[OK]") || l.startsWith("[CANCEL]")));

    // Active Live Typing Prompt Line ([neeraj@sys ~]$) - only render if not navigating a picker menu
    if (!isPickerOpen) {
      const promptY = Math.min(startY, 606);
      screenCtx.fillStyle = themeHex;
      screenCtx.font = `${fontStyle} ${lastRenderFont.family}`;
      screenCtx.fillText("[neeraj@sys ~]$ ", 36, promptY);

      const prefixWidth = screenCtx.measureText("[neeraj@sys ~]$ ").width;
      screenCtx.fillStyle = themeHex;
      screenCtx.fillText(currentInput, 36 + prefixWidth, promptY);

      // Glowing Block Cursor
      const inputWidth = screenCtx.measureText(currentInput).width;
      screenCtx.fillStyle = themeHex;
      screenCtx.shadowColor = themeHex;
      screenCtx.shadowBlur = 8;
      screenCtx.fillRect(36 + prefixWidth + inputWidth + 2, promptY - 17, 11, 21);
      screenCtx.shadowBlur = 0;
    }

    screenTexture.needsUpdate = true;
  };

  if (avatarImg && !avatarImg.complete) {
    avatarImg.onload = () => {
      renderScreen(lastRenderLines, lastRenderInput, lastRenderTheme, lastRenderFont, lastRenderPickerActive);
    };
  }

  renderScreen();

  const screenFrontMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
    side: THREE.FrontSide,
  });

  // 8. PROCEDURAL TUF LID BACK TEXTURE (REAR FACE)
  const tufLidBack = createTufLidBackTexture();
  const tufBackMat = new THREE.MeshBasicMaterial({
    map: tufLidBack.texture,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  // 9. SCULPTED TUF DISPLAY LID WITH 45° TOP CHAMFER CUTS & CENTER WEBCAM TAB
  const lw = 2.2; // half width
  const lh = 2.75; // height
  const topChamfer = 0.18; // 45-degree top corner cuts

  const lidShape = new THREE.Shape();
  // Bottom-Left
  lidShape.moveTo(-lw, 0);
  // Left Edge up to top-left chamfer
  lidShape.lineTo(-lw, lh - topChamfer);
  // 🟢 Top-Left 45° Chamfer Cut
  lidShape.lineTo(-lw + topChamfer, lh);
  // Top Edge up to camera tab
  lidShape.lineTo(-0.48, lh);
  lidShape.lineTo(-0.40, lh + 0.06); // Camera notch slope
  lidShape.lineTo(0.40, lh + 0.06);  // Camera notch top
  lidShape.lineTo(0.48, lh);         // Camera notch right slope
  // Top Edge to top-right chamfer
  lidShape.lineTo(lw - topChamfer, lh);
  // 🟢 Top-Right 45° Chamfer Cut
  lidShape.lineTo(lw, lh - topChamfer);
  // Right Edge down to bottom
  lidShape.lineTo(lw, 0);
  // Bottom Edge with signature TUF trapezoid hinge opening
  lidShape.lineTo(1.15, 0);
  lidShape.lineTo(0.95, 0.12);
  lidShape.lineTo(-0.95, 0.12);
  lidShape.lineTo(-1.15, 0);
  lidShape.lineTo(-lw, 0);

  const lidExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.07,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.008,
    bevelThickness: 0.008,
  };

  const lidGeo = new THREE.ExtrudeGeometry(lidShape, lidExtrudeSettings);
  lidGeo.translate(0, 0, -0.07 / 2); // Center thickness at Z=0

  const lidMesh = new THREE.Mesh(lidGeo, baseMat);
  lidMesh.position.set(0, 0, 0);
  lidMesh.castShadow = true;
  lidMesh.receiveShadow = true;
  lidPivot.add(lidMesh);

  // Screen Lid Edge Wireframe Glow (Outlines the 45° top chamfer cuts)
  const lidEdges = new THREE.EdgesGeometry(lidGeo, 15);
  const lidWire = new THREE.LineSegments(lidEdges, wireMat);
  lidWire.position.set(0, 0, 0);
  lidPivot.add(lidWire);

  // 10. INNER CRT DISPLAY SCREEN (FRONT FACE - POSITIONED FLUSH ON BEZEL)
  const screenPlaneGeo = new THREE.PlaneGeometry(4.16, 2.45);
  const screenMesh = new THREE.Mesh(screenPlaneGeo, screenFrontMat);
  screenMesh.position.set(0, 1.42, 0.052);
  lidPivot.add(screenMesh);

  // 11. REAR TUF LID ARMOR BACKPLATE WITH CYBER TRIANGLE EMBLEM (EXACT CHAMFERED SHAPE)
  const tufBackGeo = new THREE.ShapeGeometry(lidShape);
  const posAttr = tufBackGeo.getAttribute("position");
  const uvs: number[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    // Since back face is rotated 180° around Y, invert U so the texture is not mirrored
    const u = 1.0 - (x + lw) / (2 * lw);
    const v = y / (lh + 0.06);
    uvs.push(u, v);
  }
  tufBackGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  const tufBackMesh = new THREE.Mesh(tufBackGeo, tufBackMat);
  tufBackMesh.position.set(0, 0, -0.050);
  tufBackMesh.rotation.y = Math.PI; // Face outwards to the back
  lidPivot.add(tufBackMesh);

  // 12. TOP BEZEL DETAILS: WEBCAM, CAMERA LED, ARRAY MICS & BUMPERS (Callouts 1, 2, 3, 4)
  // Webcam Glass Lens (Callout 4)
  const camLensGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const camLensMat = new THREE.MeshStandardMaterial({
    color: 0x010804,
    roughness: 0.1,
    metalness: 0.9,
  });
  const camLens = new THREE.Mesh(camLensGeo, camLensMat);
  camLens.position.set(0, 2.73, 0.052);
  lidPivot.add(camLens);

  // Camera Status Indicator LED (Callout 3)
  const camLedGeo = new THREE.SphereGeometry(0.007, 6, 6);
  const camLedMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const camLed = new THREE.Mesh(camLedGeo, camLedMat);
  camLed.position.set(0.048, 2.73, 0.052);
  lidPivot.add(camLed);

  // Dual Array Beamforming Stereo Microphones (Callouts 1 & 2)
  const micMat = new THREE.MeshBasicMaterial({ color: 0x00220a });
  const micGeo = new THREE.BoxGeometry(0.024, 0.012, 0.01);
  const micL = new THREE.Mesh(micGeo, micMat);
  micL.position.set(-0.16, 2.73, 0.052);
  lidPivot.add(micL);

  const micR = new THREE.Mesh(micGeo, micMat);
  micR.position.set(0.16, 2.73, 0.052);
  lidPivot.add(micR);

  // Dual Rubber Pill Cushions / Bumpers
  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0x000502,
    roughness: 0.9,
  });
  const bumperGeo = new THREE.BoxGeometry(0.38, 0.015, 0.012);

  const bumperL = new THREE.Mesh(bumperGeo, bumperMat);
  bumperL.position.set(-1.0, 2.68, 0.050);
  lidPivot.add(bumperL);

  const bumperR = new THREE.Mesh(bumperGeo, bumperMat);
  bumperR.position.set(1.0, 2.68, 0.050);
  lidPivot.add(bumperR);

  // Collapse the chassis, ports, deck and lid into one submission per
  // material; only the multi-material power/touchpad faces stay separate.
  mergeStaticMeshes(group, { name: "laptop" });

  return {
    group,
    updateScreenTexture: renderScreen,
    setTheme: (theme: WorkstationTheme) => {
      standardTopMat.color.setHex(theme.threeColor);
      touchFaceMat.color.setHex(theme.threeColor);
      pwrButton.topMat.color.setHex(theme.threeColor);
      wireMat.color.setHex(theme.threeColor);
      sbStripeMat.color.setHex(theme.threeColor);
      tufLidBack.renderLidBack(theme.hex);
      renderScreen(lastRenderLines, lastRenderInput, theme.hex, lastRenderFont);
    },
  };
}
