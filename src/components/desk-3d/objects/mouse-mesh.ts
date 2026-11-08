import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * 3D Tactical Gaming Mouse (Zeb-Transformer Edition)
 * Features Dynamic Elastic Bounded Mousepad Motion, Inertial Hand Tilt,
 * Tension-Coupled Cable Bundle Drift, Coil Breathing, and Tactile Micro-Click Ripple
 * Model Attribution: "Gaming Mouse" (https://skfb.ly/p8Gty) by jerard27 licensed under CC BY 4.0
 */
export function createMouseMesh(): {
  group: THREE.Group;
  mouseHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
  triggerClick: () => void;
  onPointerMove: (dx: number, dy: number) => void;
  updateMouse: (delta: number) => void;
} {
  const group = new THREE.Group();
  group.name = "gaming-mouse-system";

  // 1. MOUSE BASE RESTING POSITION & ERGONOMIC ANGLE
  const MOUSE_POS = new THREE.Vector3(3.58, 0.028, 3.42);
  const MOUSE_ROT_Y = -Math.PI / 16; // Natural ~11° ergonomic wrist angle

  const mouseAnchor = new THREE.Group();
  mouseAnchor.position.copy(MOUSE_POS);
  mouseAnchor.rotation.y = MOUSE_ROT_Y;
  group.add(mouseAnchor);

  // 2. INVISIBLE HITBOX FOR FAST RAYCASTING & INTERACTION
  const hitboxGeo = new THREE.BoxGeometry(0.95, 0.60, 1.45);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const mouseHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  mouseHitbox.position.set(0, 0.25, 0);
  mouseHitbox.userData = { id: "mouse", interactive: true };
  mouseAnchor.add(mouseHitbox);

  // 3. TACTICAL MOUSE CHASSIS (Loaded via GLTFLoader with procedural fallback)
  const modelContainer = new THREE.Group();
  mouseAnchor.add(modelContainer);

  const glowMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
  const bodyMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

  // Procedural Fallback Mesh while GLB loads asynchronously
  const fallbackGeo = new THREE.BoxGeometry(0.68, 0.40, 1.20);
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: 0x090f18,
    roughness: 0.45,
    metalness: 0.35,
  });
  const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
  fallbackMesh.position.set(0, 0.20, 0);
  modelContainer.add(fallbackMesh);

  const loader = new GLTFLoader();
  loader.load(
    "/models/mouse.glb",
    (gltf) => {
      modelContainer.remove(fallbackMesh);
      fallbackGeo.dispose();
      fallbackMat.dispose();

      const mouseScene = gltf.scene;

      // Scale model to match realistic scale relative to ASUS TUF 15.6" chassis
      const MOUSE_SCALE = 5.0;
      mouseScene.scale.set(MOUSE_SCALE, MOUSE_SCALE, MOUSE_SCALE);
      mouseScene.position.set(0, 0, 0);
      mouseScene.rotation.y = Math.PI; // Face forward towards laptop screen

      mouseScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
          if (mat) {
            // Glowing RGB LED strip channels
            if (
              mat.name.toLowerCase().includes("standardsurface2") ||
              mat.name.toLowerCase().includes("glow") ||
              mat.name.toLowerCase().includes("led")
            ) {
              mat.color = new THREE.Color(DEFAULT_THEME.threeColor);
              mat.emissive = new THREE.Color(DEFAULT_THEME.threeColor);
              mat.emissiveIntensity = 1.6;
              glowMaterials.push(mat);
            } else {
              mat.roughness = Math.max(0.35, mat.roughness);
              bodyMaterials.push(mat);
            }
          }
        }
      });

      modelContainer.add(mouseScene);
    },
    undefined,
    (error) => {
      console.warn("Could not load /models/mouse.glb, using procedural fallback.", error);
    }
  );

  // 4. BULKY ZEB-TRANSFORMER CUSTOM USB-A CONNECTOR & STRAIN RELIEF
  const LAPTOP_USB_PORT = new THREE.Vector3(2.235, 0.097, 1.97);

  const usbConnectorGroup = new THREE.Group();
  usbConnectorGroup.position.copy(LAPTOP_USB_PORT);
  usbConnectorGroup.rotation.y = Math.PI / 2;

  // Gold-Plated USB-A Metal Plug Connector Head
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xdeb841,
    metalness: 0.95,
    roughness: 0.18,
    emissive: 0x52400e,
    emissiveIntensity: 0.20,
  });

  const usbPlugGeo = new THREE.BoxGeometry(0.095, 0.042, 0.11);
  const usbPlugMesh = new THREE.Mesh(usbPlugGeo, goldMat);
  usbPlugMesh.position.set(0, 0, -0.045);
  usbConnectorGroup.add(usbPlugMesh);

  // USB Plug Contact Pins & Interior Insulator Tongue
  const pinMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
  const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.008, 0.022), pinMat);
  pin1.position.set(-0.024, 0.0215, -0.055);
  usbConnectorGroup.add(pin1);
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.008, 0.022), pinMat);
  pin2.position.set(0.024, 0.0215, -0.055);
  usbConnectorGroup.add(pin2);

  // Heavy-Duty Armored Mecha Housing
  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x0c1118,
    roughness: 0.50,
    metalness: 0.45,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x16202c,
    roughness: 0.40,
    metalness: 0.65,
  });

  // Front Collar Shell
  const frontCollarGeo = new THREE.BoxGeometry(0.125, 0.062, 0.12);
  const frontCollarMesh = new THREE.Mesh(frontCollarGeo, housingMat);
  frontCollarMesh.position.set(0, 0, 0.060);
  usbConnectorGroup.add(frontCollarMesh);

  // Main Wide Diamond Transformer Faceted Mecha Shell
  const midFacetedGeo = new THREE.BoxGeometry(0.160, 0.076, 0.16);
  const midFacetedMesh = new THREE.Mesh(midFacetedGeo, housingMat);
  midFacetedMesh.position.set(0, 0, 0.180);
  usbConnectorGroup.add(midFacetedMesh);

  // Side Angular Mecha Wing Chamfers
  const wingGeo = new THREE.CylinderGeometry(0.060, 0.045, 0.14, 6);
  wingGeo.rotateZ(Math.PI / 2);
  wingGeo.rotateY(Math.PI / 2);
  const leftWing = new THREE.Mesh(wingGeo, accentMat);
  leftWing.position.set(0, 0, 0.185);
  usbConnectorGroup.add(leftWing);

  // Top Sculpted Ridge & Raised Armor Crest
  const crestGeo = new THREE.BoxGeometry(0.070, 0.018, 0.13);
  const crestMesh = new THREE.Mesh(crestGeo, accentMat);
  crestMesh.position.set(0, 0.042, 0.180);
  usbConnectorGroup.add(crestMesh);

  // Embossed USB Trident Emblem on Top Face
  const tridentMat = new THREE.MeshStandardMaterial({
    color: DEFAULT_THEME.threeColor,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });
  const tridentGeo = new THREE.BoxGeometry(0.032, 0.005, 0.065);
  const tridentMesh = new THREE.Mesh(tridentGeo, tridentMat);
  tridentMesh.position.set(0, 0.052, 0.180);
  usbConnectorGroup.add(tridentMesh);

  // Back Taper Section
  const backTaperGeo = new THREE.CylinderGeometry(0.042, 0.068, 0.08, 8);
  backTaperGeo.rotateX(Math.PI / 2);
  const backTaperMesh = new THREE.Mesh(backTaperGeo, housingMat);
  backTaperMesh.position.set(0, 0, 0.290);
  usbConnectorGroup.add(backTaperMesh);

  // 4-Segment Ribbed Strain Relief Boot
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x090d13,
    roughness: 0.85,
    metalness: 0.20,
  });

  const ribGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const w = 0.060 - i * 0.006;
    const h = 0.046 - i * 0.005;
    const ribMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.018), bootMat);
    ribMesh.position.set(0, 0, 0.345 + i * 0.026);
    ribGroup.add(ribMesh);

    if (i < 3) {
      const slotMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, h * 0.72, 0.012), bootMat);
      slotMesh.position.set(0, 0, 0.358 + i * 0.026);
      ribGroup.add(slotMesh);
    }
  }
  usbConnectorGroup.add(ribGroup);

  // Glowing Cyber Edge Accents on USB Armor Shell
  const housingWireGeo = new THREE.EdgesGeometry(midFacetedGeo);
  const housingWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.65,
  });
  const housingWire = new THREE.LineSegments(housingWireGeo, housingWireMat);
  housingWire.position.set(0, 0, 0.180);
  usbConnectorGroup.add(housingWire);

  const frontWireGeo = new THREE.EdgesGeometry(frontCollarGeo);
  const frontWire = new THREE.LineSegments(frontWireGeo, housingWireMat);
  frontWire.position.set(0, 0, 0.060);
  usbConnectorGroup.add(frontWire);

  group.add(usbConnectorGroup);

  // 5. MOUSE NOSE STRAIN RELIEF BUSHING
  const mouseNoseLocal = new THREE.Vector3(-0.10, 0.058, -0.42);
  const forwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), MOUSE_ROT_Y);
  const cableStartWorld = new THREE.Vector3(-0.10, 0.058, -0.47)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), MOUSE_ROT_Y)
    .add(MOUSE_POS);

  const noseBootGroup = new THREE.Group();
  noseBootGroup.position.copy(mouseNoseLocal);

  const noseBootGeo = new THREE.CylinderGeometry(0.030, 0.046, 0.10, 8);
  noseBootGeo.rotateX(Math.PI / 2);
  const noseBootMesh = new THREE.Mesh(noseBootGeo, bootMat);
  noseBootMesh.position.set(0, 0, -0.025);
  noseBootGroup.add(noseBootMesh);
  mouseAnchor.add(noseBootGroup);

  // 6. BUNDLED CABLE MANAGEMENT SYSTEM & VELCRO STRAP (WITH DYNAMIC SWIVEL & SLIDE)
  const BUNDLE_BASE_POS = new THREE.Vector3(3.12, 0.032, 1.55);
  const BUNDLE_BASE_ROT_Y = Math.PI / 12;

  const strapGroup = new THREE.Group();
  strapGroup.position.copy(BUNDLE_BASE_POS);
  strapGroup.rotation.y = BUNDLE_BASE_ROT_Y;

  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x121924,
    roughness: 0.90,
    metalness: 0.15,
  });

  const strapTagMat = new THREE.MeshStandardMaterial({
    color: DEFAULT_THEME.threeColor,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.35,
    roughness: 0.40,
  });

  const strapBandGeo = new THREE.BoxGeometry(0.120, 0.065, 0.075);
  const strapBandMesh = new THREE.Mesh(strapBandGeo, strapMat);
  strapBandMesh.position.set(0, 0.024, 0);
  strapGroup.add(strapBandMesh);

  const strapTabGeo = new THREE.BoxGeometry(0.124, 0.015, 0.038);
  const strapTabMesh = new THREE.Mesh(strapTabGeo, strapMat);
  strapTabMesh.position.set(0, 0.058, 0.012);
  strapGroup.add(strapTabMesh);

  const strapTagGeo = new THREE.BoxGeometry(0.045, 0.008, 0.020);
  const strapTagMesh = new THREE.Mesh(strapTagGeo, strapTagMat);
  strapTagMesh.position.set(0, 0.028, 0.066);
  strapGroup.add(strapTagMesh);

  const strapWireGeo = new THREE.EdgesGeometry(strapBandGeo);
  const strapWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.45,
  });
  const strapWire = new THREE.LineSegments(strapWireGeo, strapWireMat);
  strapWire.position.set(0, 0.024, 0);
  strapGroup.add(strapWire);

  group.add(strapGroup);

  // 7. CONTINUOUS PROCEDURAL BRAIDED USB CABLE WITH BUNDLED LOOPS
  const cableEntryWorld = new THREE.Vector3(2.235 + 0.445, 0.097, 1.97);

  const cablePoints = [
    // 7a. Left-Click Nose Lead-out (Index 0..5)
    cableStartWorld.clone(),
    cableStartWorld.clone().add(forwardDir.clone().multiplyScalar(0.08)),
    cableStartWorld.clone().add(forwardDir.clone().multiplyScalar(0.24)).add(new THREE.Vector3(0.02, -0.025, 0)),
    new THREE.Vector3(3.48, 0.032, 2.45),
    new THREE.Vector3(3.38, 0.032, 2.05),
    new THREE.Vector3(3.24, 0.032, 1.75),

    // 7b. First Loop through Velcro Strap (Index 6..10)
    new THREE.Vector3(3.12, 0.032, 1.55),
    new THREE.Vector3(2.96, 0.034, 1.30),
    new THREE.Vector3(3.06, 0.038, 1.18),
    new THREE.Vector3(3.18, 0.042, 1.32),
    new THREE.Vector3(3.14, 0.045, 1.55),

    // 7c. Second Reverse Loop through Velcro Strap (Index 11..14)
    new THREE.Vector3(3.24, 0.045, 1.75),
    new THREE.Vector3(3.12, 0.048, 1.82),
    new THREE.Vector3(3.02, 0.050, 1.72),
    new THREE.Vector3(3.10, 0.052, 1.55),

    // 7d. Third Loop through Velcro Strap (Index 15..18)
    new THREE.Vector3(2.92, 0.044, 1.25),
    new THREE.Vector3(3.00, 0.038, 1.14),
    new THREE.Vector3(3.10, 0.036, 1.28),
    new THREE.Vector3(3.12, 0.038, 1.55),

    // 7e. Curved Exit Lead-in Aligning to USB-A Connector Axis (Index 19..23)
    new THREE.Vector3(3.16, 0.038, 1.68),
    new THREE.Vector3(3.20, 0.065, 1.82),
    new THREE.Vector3(3.08, 0.088, 1.94),
    new THREE.Vector3(2.88, 0.097, 1.97),
    cableEntryWorld.clone(),
  ];

  const cableCurve = new THREE.CatmullRomCurve3(cablePoints, false, "centripetal", 0.45);
  let cableGeo = new THREE.TubeGeometry(cableCurve, 56, 0.022, 6, false);

  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x070a0f,
    roughness: 0.85,
    metalness: 0.25,
  });

  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  cableMesh.castShadow = true;
  group.add(cableMesh);

  // Cable TokyoNight Neon Centerline Accent (cheap Line instead of EdgesGeometry)
  const cableWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.35,
  });

  const CABLE_ACCENT_SEGMENTS = 56;
  const cableAccentPositions = new Float32Array((CABLE_ACCENT_SEGMENTS + 1) * 3);
  const cableAccentGeo = new THREE.BufferGeometry();
  cableAccentGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(cableAccentPositions, 3)
  );
  const cableAccent = new THREE.Line(cableAccentGeo, cableWireMat);
  cableAccent.frustumCulled = false;
  group.add(cableAccent);

  const syncCableAccent = () => {
    const points = cableCurve.getPoints(CABLE_ACCENT_SEGMENTS);
    for (let i = 0; i <= CABLE_ACCENT_SEGMENTS; i++) {
      const p = points[i];
      cableAccentPositions[i * 3] = p.x;
      cableAccentPositions[i * 3 + 1] = p.y + 0.023;
      cableAccentPositions[i * 3 + 2] = p.z;
    }
    cableAccentGeo.getAttribute("position").needsUpdate = true;
  };
  syncCableAccent();

  // 8. ELASTIC BOUNDED MOUSEPAD & CABLE BUNDLE PHYSICS STATE
  let targetOffsetX = 0;
  let targetOffsetZ = 0;
  let targetRotYaw = 0;

  let currentOffsetX = 0;
  let currentOffsetZ = 0;
  let currentRotYaw = 0;

  let currentBundleX = 0;
  let currentBundleZ = 0;
  let currentBundleYaw = 0;

  let jiggleAmp = 0;
  let jiggleTime = 0;

  let lastCableSyncDist = 0;
  let cableRebuildAccumulator = 0;

  const onPointerMove = (dx: number, dy: number) => {
    // Physical translation bounds on virtual mousepad
    const SENS_X = 0.0016;
    const SENS_Z = 0.0016;

    targetOffsetX = Math.max(-0.32, Math.min(0.32, targetOffsetX + dx * SENS_X));
    targetOffsetZ = Math.max(-0.28, Math.min(0.28, targetOffsetZ + dy * SENS_Z));

    // Natural wrist yaw rotation
    targetRotYaw = Math.max(-0.08, Math.min(0.08, -dx * 0.004));
  };

  // 9. TACTILE CLICK ANIMATION & CABLE RIPPLE IMPULSE
  let clickTime = 0;
  let isClicking = false;

  const triggerClick = () => {
    isClicking = true;
    clickTime = 0;
    jiggleAmp = 0.006; // Ripple through cable bundle
    jiggleTime = 0;
  };

  const updateMouse = (delta: number) => {
    // A. Elastic Spring Return for Mouse
    const springDecay = Math.pow(0.90, delta * 60);
    targetOffsetX *= springDecay;
    targetOffsetZ *= springDecay;
    targetRotYaw *= Math.pow(0.82, delta * 60);

    // B. Smooth Inertial Lerp for Mouse
    currentOffsetX += (targetOffsetX - currentOffsetX) * Math.min(1, delta * 16);
    currentOffsetZ += (targetOffsetZ - currentOffsetZ) * Math.min(1, delta * 16);
    currentRotYaw += (targetRotYaw - currentRotYaw) * Math.min(1, delta * 18);

    // C. Apply Positional & Rotational Transform to Mouse
    mouseAnchor.position.x = MOUSE_POS.x + currentOffsetX;
    mouseAnchor.position.z = MOUSE_POS.z + currentOffsetZ;
    mouseAnchor.rotation.y = MOUSE_ROT_Y + currentRotYaw;

    // D. Tension-Coupled Drift & Swivel for Cable Bundle (Heavy Friction / Lag)
    const targetBundleX = currentOffsetX * 0.20;
    const targetBundleZ = currentOffsetZ * 0.18;
    const targetBundleYaw = currentOffsetX * 0.10 - currentOffsetZ * 0.06;

    currentBundleX += (targetBundleX - currentBundleX) * Math.min(1, delta * 8);
    currentBundleZ += (targetBundleZ - currentBundleZ) * Math.min(1, delta * 8);
    currentBundleYaw += (targetBundleYaw - currentBundleYaw) * Math.min(1, delta * 10);

    // E. Click Jiggle Harmonic Vibration
    let jiggleOffset = 0;
    if (jiggleAmp > 0.0002) {
      jiggleTime += delta;
      jiggleOffset = Math.sin(jiggleTime * 32) * jiggleAmp;
      jiggleAmp *= Math.pow(0.70, delta * 60);
    }

    // Apply Transform to Velcro Strap Group
    strapGroup.position.set(
      BUNDLE_BASE_POS.x + currentBundleX + jiggleOffset * 0.6,
      BUNDLE_BASE_POS.y,
      BUNDLE_BASE_POS.z + currentBundleZ
    );
    strapGroup.rotation.y = BUNDLE_BASE_ROT_Y + currentBundleYaw;

    // F. Click Depression Physics
    if (isClicking) {
      clickTime += delta * 24;
      const dip = Math.sin(clickTime) * 0.012;
      mouseAnchor.position.y = MOUSE_POS.y - Math.max(0, dip);
      mouseAnchor.rotation.x = -Math.max(0, dip * 0.8);

      if (clickTime >= Math.PI) {
        isClicking = false;
        mouseAnchor.position.y = MOUSE_POS.y;
        mouseAnchor.rotation.x = 0;
      }
    }

    // G. Dynamic Full-Chain Cable Flex & Coil Breathing
    // Rebuilding the tube is expensive, so cap it at ~14 Hz while the line
    // accent follows the same spline every rebuild.
    cableRebuildAccumulator += delta;
    const motionDist = Math.hypot(currentOffsetX, currentOffsetZ) + Math.hypot(currentBundleX, currentBundleZ);
    const cableNeedsSync =
      Math.abs(motionDist - lastCableSyncDist) > 0.004 || jiggleAmp > 0.0005;
    if (cableNeedsSync && cableRebuildAccumulator >= 0.07) {
      cableRebuildAccumulator = 0;
      lastCableSyncDist = motionDist;

      const dynamicCableStart = new THREE.Vector3(-0.10, 0.058, -0.47)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), MOUSE_ROT_Y + currentRotYaw)
        .add(mouseAnchor.position);

      const dynForwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        MOUSE_ROT_Y + currentRotYaw
      );

      // Tension factor for loop expansion/compression (breathing)
      const tension = Math.min(1, Math.hypot(currentOffsetX, currentOffsetZ) / 0.35);
      const loopExpansion = (1 - tension) * 0.028;

      const bX = currentBundleX + jiggleOffset * 0.5;
      const bZ = currentBundleZ;

      // 7a. Lead-out from Mouse
      cablePoints[0].copy(dynamicCableStart);
      cablePoints[1].copy(dynamicCableStart.clone().add(dynForwardDir.clone().multiplyScalar(0.08)));
      cablePoints[2].copy(
        dynamicCableStart.clone().add(dynForwardDir.clone().multiplyScalar(0.24)).add(new THREE.Vector3(0.02, -0.025, 0))
      );
      cablePoints[3].set(3.48 + currentOffsetX * 0.35 + bX * 0.3, 0.032, 2.45 + currentOffsetZ * 0.35 + bZ * 0.3);
      cablePoints[4].set(3.38 + currentOffsetX * 0.20 + bX * 0.5, 0.032, 2.05 + currentOffsetZ * 0.20 + bZ * 0.5);
      cablePoints[5].set(3.24 + bX * 0.8, 0.032, 1.75 + bZ * 0.8);

      // 7b. First Loop through Velcro Strap (Coil Breathing)
      cablePoints[6].set(3.12 + bX, 0.032, 1.55 + bZ);
      cablePoints[7].set(2.96 + bX * 0.9 - loopExpansion, 0.034, 1.30 + bZ * 0.9);
      cablePoints[8].set(3.06 + bX * 0.9 - loopExpansion * 0.5, 0.038, 1.18 + bZ * 0.9);
      cablePoints[9].set(3.18 + bX * 0.95, 0.042, 1.32 + bZ * 0.95);
      cablePoints[10].set(3.14 + bX, 0.045, 1.55 + bZ);

      // 7c. Second Reverse Loop through Velcro Strap
      cablePoints[11].set(3.24 + bX * 0.95 + loopExpansion * 0.6, 0.045, 1.75 + bZ * 0.95);
      cablePoints[12].set(3.12 + bX * 0.95 + loopExpansion * 0.8, 0.048, 1.82 + bZ * 0.95);
      cablePoints[13].set(3.02 + bX * 0.9, 0.050, 1.72 + bZ * 0.9);
      cablePoints[14].set(3.10 + bX, 0.052, 1.55 + bZ);

      // 7d. Third Loop through Velcro Strap
      cablePoints[15].set(2.92 + bX * 0.9 - loopExpansion * 0.7, 0.044, 1.25 + bZ * 0.9);
      cablePoints[16].set(3.00 + bX * 0.9, 0.038, 1.14 + bZ * 0.9);
      cablePoints[17].set(3.10 + bX * 0.95, 0.036, 1.28 + bZ * 0.95);
      cablePoints[18].set(3.12 + bX, 0.038, 1.55 + bZ);

      // 7e. Lead-in Ascending to Laptop USB Port
      cablePoints[19].set(3.16 + bX * 0.7, 0.038, 1.68 + bZ * 0.7);
      cablePoints[20].set(3.20 + bX * 0.4, 0.065, 1.82 + bZ * 0.4);
      cablePoints[21].set(3.08 + bX * 0.2, 0.088, 1.94 + bZ * 0.2);
      cablePoints[22].set(2.88 + bX * 0.05, 0.097, 1.97);

      cableCurve.points = cablePoints;

      // Smooth procedural tube (56 segments, 6 radial) + centerline accent
      const newGeo = new THREE.TubeGeometry(cableCurve, 56, 0.022, 6, false);
      cableMesh.geometry.dispose();
      cableMesh.geometry = newGeo;
      syncCableAccent();
    }
  };

  const setTheme = (theme: WorkstationTheme) => {
    glowMaterials.forEach((mat) => {
      mat.color.setHex(theme.threeColor);
      mat.emissive.setHex(theme.threeColor);
    });
    tridentMat.color.setHex(theme.threeColor);
    tridentMat.emissive.setHex(theme.threeColor);
    strapTagMat.color.setHex(theme.threeColor);
    strapTagMat.emissive.setHex(theme.threeColor);
    strapWireMat.color.setHex(theme.threeColor);
    cableWireMat.color.setHex(theme.threeColor);
    housingWireMat.color.setHex(theme.threeColor);
  };

  return {
    group,
    mouseHitbox,
    setTheme,
    triggerClick,
    onPointerMove,
    updateMouse,
  };
}
