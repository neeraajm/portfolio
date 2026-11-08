import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * 3D Digital Alarm Clock with Live IST (Indian Standard Time) Display
 * Features 7-Segment LED Canvas Screen, Pulsing Colon, Workstation RGB Theme Sync,
 * Pill-Shaped Top Control Buttons (MODE, ALARM, SNZ/LIGHT, UP, DOWN) with Labels,
 * and Interactive 12H/24H Format Toggle.
 */
export function createClockMesh(): {
  group: THREE.Group;
  clockHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
  updateClock: (delta: number) => void;
  toggleFormat: () => boolean;
  getIs24Hour: () => boolean;
} {
  const group = new THREE.Group();
  group.name = "digital-clock-system";

  // 1. POSITIONING & ORIENTATION ON DESK
  const CLOCK_POS = new THREE.Vector3(-4.2, 0.028, 0.9);
  const CLOCK_ROT_Y = Math.PI / 8; // ~22.5° angle towards chair

  group.position.copy(CLOCK_POS);
  group.rotation.y = CLOCK_ROT_Y;
  group.scale.set(1.2, 1.2, 1.2);

  // 2. INVISIBLE HITBOX FOR FAST RAYCASTING & CLICK INTERACTION
  const hitboxGeo = new THREE.BoxGeometry(1.6, 0.75, 0.55);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const clockHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  clockHitbox.position.set(0, 0.35, 0);
  clockHitbox.userData = { id: "clock", interactive: true };
  group.add(clockHitbox);

  // 3. LIVE 7-SEGMENT DYNAMIC CANVAS TEXTURE (Clean - No top/bottom text)
  // Authored in 1024x512 coordinates but rendered at 512x256 to quarter the
  // fill cost and texture upload bandwidth.
  const DISPLAY_SCALE = 0.5;
  const canvas = document.createElement("canvas");
  canvas.width = 1024 * DISPLAY_SCALE;
  canvas.height = 512 * DISPLAY_SCALE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(DISPLAY_SCALE, 0, 0, DISPLAY_SCALE, 0, 0);
  }

  const displayTexture = new THREE.CanvasTexture(canvas);
  displayTexture.flipY = false;
  displayTexture.minFilter = THREE.LinearFilter;
  displayTexture.magFilter = THREE.LinearFilter;
  displayTexture.colorSpace = THREE.SRGBColorSpace;

  let currentThemeHex = DEFAULT_THEME.hex;
  let use24Hour = true;
  let pulseTime = 0;
  let lastSecond = -1;

  // Helper to draw clean 7-segment digit on 2D canvas
  const draw7Segment = (
    c: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    w: number,
    h: number,
    t: number,
    digit: number | string,
    colorHex: string,
    unlitHex: string,
    slant = 0.08
  ) => {
    const hw = w / 2;
    const hh = h / 2;

    const pt = (px: number, py: number): [number, number] => {
      const sx = px - (py - hh) * slant;
      return [x0 + sx, y0 + py];
    };

    const segmentsMap: Record<string, boolean[]> = {
      "0": [true, true, true, true, true, true, false],
      "1": [false, true, true, false, false, false, false],
      "2": [true, true, false, true, true, false, true],
      "3": [true, true, true, true, false, false, true],
      "4": [false, true, true, false, false, true, true],
      "5": [true, false, true, true, false, true, true],
      "6": [true, false, true, true, true, true, true],
      "7": [true, true, true, false, false, false, false],
      "8": [true, true, true, true, true, true, true],
      "9": [true, true, true, true, false, true, true],
      "A": [true, true, true, false, true, true, true],
      "P": [true, true, false, false, true, true, true],
      "H": [false, true, true, false, true, true, true],
      "R": [true, true, false, false, true, true, true],
      "M": [true, true, true, false, true, true, false],
      "-": [false, false, false, false, false, false, true],
      " ": [false, false, false, false, false, false, false],
    };

    const lit = segmentsMap[String(digit)] || segmentsMap[" "];
    const gap = t * 0.22;

    const drawPoly = (pts: [number, number][], isLit: boolean) => {
      c.fillStyle = isLit ? colorHex : unlitHex;
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        c.lineTo(pts[i][0], pts[i][1]);
      }
      c.closePath();
      c.fill();
    };

    // a: top horizontal
    drawPoly(
      [
        pt(t + gap, 0),
        pt(w - t - gap, 0),
        pt(w - t * 1.5 - gap, t),
        pt(t * 1.5 + gap, t),
      ],
      lit[0]
    );

    // b: top-right vertical
    drawPoly(
      [
        pt(w, t + gap),
        pt(w, hh - t * 0.5 - gap),
        pt(w - t, hh - t * 0.1 - gap),
        pt(w - t, t * 1.5 + gap),
      ],
      lit[1]
    );

    // c: bottom-right vertical
    drawPoly(
      [
        pt(w, hh + t * 0.5 + gap),
        pt(w, h - t - gap),
        pt(w - t, h - t * 1.5 - gap),
        pt(w - t, hh + t * 0.1 + gap),
      ],
      lit[2]
    );

    // d: bottom horizontal
    drawPoly(
      [
        pt(t * 1.5 + gap, h - t),
        pt(w - t * 1.5 - gap, h - t),
        pt(w - t - gap, h),
        pt(t + gap, h),
      ],
      lit[3]
    );

    // e: bottom-left vertical
    drawPoly(
      [
        pt(0, hh + t * 0.5 + gap),
        pt(t, hh + t * 0.1 + gap),
        pt(t, h - t * 1.5 - gap),
        pt(0, h - t - gap),
      ],
      lit[4]
    );

    // f: top-left vertical
    drawPoly(
      [
        pt(0, t + gap),
        pt(t, t * 1.5 + gap),
        pt(t, hh - t * 0.1 - gap),
        pt(0, hh - t * 0.5 - gap),
      ],
      lit[5]
    );

    // g: middle horizontal
    drawPoly(
      [
        pt(t * 1.2 + gap, hh),
        pt(t * 1.8 + gap, hh - t * 0.5),
        pt(w - t * 1.8 - gap, hh - t * 0.5),
        pt(w - t * 1.2 - gap, hh),
        pt(w - t * 1.8 - gap, hh + t * 0.5),
        pt(t * 1.8 + gap, hh + t * 0.5),
      ],
      lit[6]
    );

    // Custom digital center segment for 'M'
    if (String(digit) === "M") {
      drawPoly(
        [
          pt(hw - t * 0.5, t + gap),
          pt(hw + t * 0.5, t + gap),
          pt(hw + t * 0.5, hh),
          pt(hw - t * 0.5, hh),
        ],
        lit[0]
      );
    }

    // Custom digital diagonal leg for 'R'
    if (String(digit) === "R") {
      drawPoly(
        [
          pt(hw - t * 0.2, hh + gap),
          pt(hw + t * 0.8, hh + gap),
          pt(w, h - gap),
          pt(w - t * 1.1, h - gap),
        ],
        lit[0]
      );
    }
  };

  const renderDisplay = (colonPulseAlpha = 1.0) => {
    if (!ctx) return;

    // Dark mirror glass face background
    ctx.fillStyle = "#06090e";
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle scanline texture
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 1024, 2);
    }

    // Read current live IST time (UTC+5:30) without Intl formatting overhead
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const rawHours = istNow.getUTCHours();
    const minsStr = String(istNow.getUTCMinutes()).padStart(2, "0");
    const secsStr = String(istNow.getUTCSeconds()).padStart(2, "0");

    const isPM = rawHours >= 12;
    let displayHours = rawHours;
    if (!use24Hour) {
      displayHours = rawHours % 12 || 12;
    }
    const hoursStr = String(displayHours).padStart(2, use24Hour ? "0" : " ");

    // Top Right Corner Clean Digital Format Indicator (AM / PM / 24 HR)
    ctx.save();
    ctx.font = "900 26px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.shadowColor = currentThemeHex;
    ctx.shadowBlur = 16;
    ctx.fillStyle = currentThemeHex;
    const modeLabel = use24Hour ? "24 HR" : (isPM ? "PM" : "AM");
    ctx.fillText(modeLabel, 928, 105);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(modeLabel, 928, 105);
    ctx.restore();

    const litColor = currentThemeHex;
    const unlitColor = "rgba(20, 30, 42, 0.35)";

    // Perfectly Centered 7-Segment Main Digits: [H1] [H2] : [M1] [M2]
    const digitW = 125;
    const digitH = 240;
    const segT = 26;
    const yPos = 136; // Vertically centered on 512px canvas (136px top & bottom margins)

    // Hours
    draw7Segment(ctx, 85, yPos, digitW, digitH, segT, hoursStr[0], litColor, unlitColor);
    draw7Segment(ctx, 235, yPos, digitW, digitH, segT, hoursStr[1], litColor, unlitColor);

    // Pulsing Colon Dots ':'
    const colonX = 400;
    const dotR = 15;
    const dotY1 = yPos + digitH * 0.33;
    const dotY2 = yPos + digitH * 0.67;

    ctx.fillStyle = currentThemeHex;
    ctx.globalAlpha = Math.max(0.2, colonPulseAlpha);
    ctx.beginPath();
    ctx.arc(colonX, dotY1, dotR, 0, Math.PI * 2);
    ctx.arc(colonX, dotY2, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Minutes
    draw7Segment(ctx, 445, yPos, digitW, digitH, segT, minsStr[0], litColor, unlitColor);
    draw7Segment(ctx, 595, yPos, digitW, digitH, segT, minsStr[1], litColor, unlitColor);

    // Seconds (smaller 7-segment digits on the right)
    const secW = 78;
    const secH = 155;
    const secT = 16;
    const secY = yPos + 80;

    ctx.font = "bold 18px monospace";
    ctx.fillStyle = `${currentThemeHex}99`;
    ctx.textAlign = "left";
    ctx.fillText("SEC", 755, secY - 14);

    draw7Segment(ctx, 755, secY, secW, secH, secT, secsStr[0], litColor, unlitColor);
    draw7Segment(ctx, 850, secY, secW, secH, secT, secsStr[1], litColor, unlitColor);

    displayTexture.needsUpdate = true;
  };

  // Patch-only colon pulse: repaints a tiny window around the two dots so the
  // display can animate between second ticks without a full 512x256 redraw.
  const COLON_REGION = { x: 376, y: 190, w: 50, h: 132 };
  const renderColonPatch = (colonPulseAlpha: number) => {
    if (!ctx) return;
    const { x, y, w, h } = COLON_REGION;
    ctx.clearRect(x, y, w, h);
    ctx.fillStyle = "#06090e";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for (let sy = Math.ceil(y / 4) * 4; sy < y + h; sy += 4) {
      ctx.fillRect(x, sy, w, 2);
    }

    ctx.save();
    ctx.fillStyle = currentThemeHex;
    ctx.globalAlpha = Math.max(0.2, colonPulseAlpha);
    ctx.beginPath();
    ctx.arc(400, 136 + 240 * 0.33, 15, 0, Math.PI * 2);
    ctx.arc(400, 136 + 240 * 0.67, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    displayTexture.needsUpdate = true;
  };

  renderDisplay(1.0);

  // 4. TOP BUTTONS & PRINTED LABELS
  const topLabelsCanvas = document.createElement("canvas");
  topLabelsCanvas.width = 1024;
  topLabelsCanvas.height = 256;
  const tlCtx = topLabelsCanvas.getContext("2d");

  const topLabelsTexture = new THREE.CanvasTexture(topLabelsCanvas);
  topLabelsTexture.minFilter = THREE.LinearFilter;
  topLabelsTexture.magFilter = THREE.LinearFilter;
  topLabelsTexture.colorSpace = THREE.SRGBColorSpace;

  const renderTopLabels = (themeHex: string) => {
    if (!tlCtx) return;
    tlCtx.clearRect(0, 0, 1024, 256);

    tlCtx.textAlign = "center";
    tlCtx.textBaseline = "middle";

    // 5 Button Positions in Canvas Space (Mapping to X = -0.42, -0.21, 0.00, +0.21, +0.42)
    const buttons = [
      { label: "MODE", cx: 160 },
      { label: "ALARM", cx: 335 },
      { label: "SNZ/LIGHT", cx: 512 },
      { label: "UP", cx: 689 },
      { label: "DOWN", cx: 864 },
    ];

    buttons.forEach(({ label, cx }) => {
      // Printed text label above button in adaptive workstation theme color
      tlCtx.font = label === "SNZ/LIGHT" ? "bold 32px monospace" : "bold 30px monospace";
      tlCtx.fillStyle = themeHex;
      tlCtx.shadowColor = themeHex;
      tlCtx.shadowBlur = 6;
      tlCtx.fillText(label, cx, 65);
      tlCtx.shadowBlur = 0;
    });

    topLabelsTexture.needsUpdate = true;
  };

  renderTopLabels(DEFAULT_THEME.hex);

  // Helper to create true pill-shaped geometry
  function createPillGeometry(width: number, height: number, radius: number, depth: number) {
    const shape = new THREE.Shape();
    const hw = (width - 2 * radius) / 2;
    const hh = height / 2;
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.absarc(hw, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-hw, hh);
    shape.absarc(-hw, 0, radius, Math.PI / 2, Math.PI * 1.5, false);

    return new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    });
  }

  // 5. LOAD 3D DIGITAL ALARM CLOCK GLB & MOUNT PILL BUTTONS
  const modelContainer = new THREE.Group();
  group.add(modelContainer);

  let screenMaterial: THREE.MeshStandardMaterial | null = null;
  const wireMaterials: THREE.LineBasicMaterial[] = [];

  // Fallback while loading
  const fallbackGeo = new THREE.BoxGeometry(1.4, 0.56, 0.36);
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: 0x0a1018,
    roughness: 0.5,
  });
  const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
  fallbackMesh.position.set(0, 0.28, 0);
  modelContainer.add(fallbackMesh);

  const loader = new GLTFLoader();
  loader.load(
    "/models/digital_clock.glb",
    (gltf) => {
      modelContainer.remove(fallbackMesh);
      fallbackGeo.dispose();
      fallbackMat.dispose();

      const clockScene = gltf.scene;
      clockScene.position.set(0, 0.295, 0);

      clockScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.name === "Clock_Buttons" || mesh.name.toLowerCase().includes("button")) {
            // Hide the old square/raw GLB buttons in favor of our high-precision pill buttons
            mesh.visible = false;
          } else if (
            mesh.name.toLowerCase().includes("screen") ||
            (mesh.material && (mesh.material as THREE.Material).name.toLowerCase().includes("screen"))
          ) {
            const mat = new THREE.MeshStandardMaterial({
              map: displayTexture,
              emissiveMap: displayTexture,
              emissive: new THREE.Color(currentThemeHex),
              emissiveIntensity: 1.4,
              roughness: 0.12,
              metalness: 0.85,
            });
            mesh.material = mat;
            screenMaterial = mat;
          } else if (mesh.name.toLowerCase().includes("body") || mesh.name.toLowerCase().includes("chassis")) {
            const bodyMat = new THREE.MeshStandardMaterial({
              color: 0x090e16,
              roughness: 0.45,
              metalness: 0.35,
            });
            mesh.material = bodyMat;

            // Wireframe contour
            const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
            const wireMat = new THREE.LineBasicMaterial({
              color: DEFAULT_THEME.threeColor,
              transparent: true,
              opacity: 0.35,
            });
            const wire = new THREE.LineSegments(edges, wireMat);
            mesh.add(wire);
            wireMaterials.push(wireMat);
          }
        }
      });

      // 6. MOUNT PILL BUTTONS & LABELS ON TOP SURFACE OF CLOCK
      const topPanelGroup = new THREE.Group();
      topPanelGroup.position.set(0, 0.280, 0); // Flush on top of chassis
      clockScene.add(topPanelGroup);

      // A) Top Printed Labels Plane (Z = -0.16..+0.16)
      const labelsPlaneGeo = new THREE.PlaneGeometry(1.36, 0.32);
      const labelsPlaneMat = new THREE.MeshBasicMaterial({
        map: topLabelsTexture,
        transparent: true,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      const labelsPlaneMesh = new THREE.Mesh(labelsPlaneGeo, labelsPlaneMat);
      labelsPlaneMesh.rotation.x = -Math.PI / 2;
      labelsPlaneMesh.position.set(0, 0.002, 0); // Hover 2mm above top surface
      topPanelGroup.add(labelsPlaneMesh);

      // B) 5 Pill-Shaped Extruded Buttons
      const btnMat = new THREE.MeshStandardMaterial({
        color: 0x121922,
        roughness: 0.38,
        metalness: 0.65,
      });

      const btnWireMat = new THREE.LineBasicMaterial({
        color: DEFAULT_THEME.threeColor,
        transparent: true,
        opacity: 0.45,
      });
      wireMaterials.push(btnWireMat);

      // Button specs: [Label, X Position, Width, Height, Radius, Extrude Depth]
      const buttonSpecs = [
        { label: "MODE", x: -0.420, w: 0.125, h: 0.052, r: 0.026, d: 0.015 },
        { label: "ALARM", x: -0.210, w: 0.125, h: 0.052, r: 0.026, d: 0.015 },
        { label: "SNZ/LIGHT", x: 0.000, w: 0.205, h: 0.068, r: 0.034, d: 0.018 }, // Large center snooze pill
        { label: "UP", x: 0.210, w: 0.125, h: 0.052, r: 0.026, d: 0.015 },
        { label: "DOWN", x: 0.420, w: 0.125, h: 0.052, r: 0.026, d: 0.015 },
      ];

      buttonSpecs.forEach(({ x, w, h, r, d }) => {
        const pillGeo = createPillGeometry(w, h, r, d);
        const pillMesh = new THREE.Mesh(pillGeo, btnMat);
        pillMesh.rotation.x = -Math.PI / 2;
        // Positioned at Z = 0.038 on top panel
        pillMesh.position.set(x, 0.003, 0.038);
        pillMesh.castShadow = true;
        pillMesh.receiveShadow = true;
        topPanelGroup.add(pillMesh);
      });

      modelContainer.add(clockScene);
    },
    undefined,
    (err) => console.warn("Could not load /models/digital_clock.glb:", err)
  );

  // 7. UPDATE TICK & THEME LOGIC
  let lastColonDraw = 0;
  const updateClock = (delta: number) => {
    pulseTime += delta * 3.5;
    // Smooth sine wave pulse for colon ':'
    const colonAlpha = (Math.sin(pulseTime) + 1.0) / 2.0;
    lastColonDraw += delta;

    const currentSec = new Date().getSeconds();
    if (currentSec !== lastSecond) {
      lastSecond = currentSec;
      lastColonDraw = 0;
      renderDisplay(colonAlpha);
    } else if (lastColonDraw >= 0.12) {
      // ~8 Hz patch redraw keeps the pulse smooth without full-screen uploads.
      lastColonDraw = 0;
      renderColonPatch(colonAlpha);
    }
  };

  const setTheme = (theme: WorkstationTheme) => {
    currentThemeHex = theme.hex;
    wireMaterials.forEach((m) => m.color.setHex(theme.threeColor));
    if (screenMaterial) {
      screenMaterial.emissive.setHex(theme.threeColor);
    }
    renderDisplay(1.0);
    renderTopLabels(theme.hex);
  };

  const toggleFormat = () => {
    use24Hour = !use24Hour;
    renderDisplay(1.0);
    return use24Hour;
  };

  const getIs24Hour = () => use24Hour;

  return {
    group,
    clockHitbox,
    setTheme,
    updateClock,
    toggleFormat,
    getIs24Hour,
  };
}
