import * as THREE from "three";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";
import { sound } from "@/lib/sound";
import { mergeStaticMeshes } from "../utils/merge-static";

/**
 * 3D Cyber Battlestation 4-Socket Heavy-Duty Surge Protector & ASUS TUF 180W Power Delivery System
 * - 180W Brick: Features Luminous Neon Cyber Triangle Emblem on the right half (matching the laptop lid logo)
 * - Dynamic Theme Synchronization: Triangle emblem updates dynamically to match the active Workstation RGB theme
 * - Router Adapter: Connected to the LEFTMOST socket (Socket 4 at X = -1.59, closest to the router)
 * - Laptop AC Plug: Connected to the RIGHTMOST socket (Socket 1 at X = +0.15, next to switch)
 * - Plug Bush: Faces FORWARD (+Z), cable exits over the front edge of the board with zero submerging
 * - AC Cable: Graceful sweeping curve dropping to desk mat and entering rear AC inlet of 180W brick collinear (0° angle, perfectly coaxial)
 * - 180W Brick: Aligned vertically at Z = -1.30 with debossed "180w" logo and racetrack coil
 * - Infinite Mains Power Cord: Extends into deep horizon (Z = -220.0) from right end
 */
export function createExtensionBoardMesh(): {
  group: THREE.Group;
  boardHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
  updatePower: (delta: number) => void;
  toggleMasterPower: () => void;
} {
  const group = new THREE.Group();
  group.name = "extension-power-delivery-system";

  // 1. BOARD PLACEMENT: ROTATED 180° (BOARD_ROT_Y = -Math.PI / 2)
  const BOARD_POS = new THREE.Vector3(-0.35, 0.028, -3.20);
  const BOARD_ROT_Y = -Math.PI / 2; // 180° flipped orientation

  let isPowerOn = true;

  // 2. INVISIBLE RAYCASTING HITBOX FOR INTERACTION (Enlarged bounds)
  const hitboxGeo = new THREE.BoxGeometry(3.50, 0.60, 0.95);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const boardHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  boardHitbox.position.copy(BOARD_POS);
  boardHitbox.position.y += 0.25;
  boardHitbox.userData = { id: "power-board", interactive: true };
  group.add(boardHitbox);

  // 3. EXTENSION BOARD CHASSIS GROUP (Extended length bl = 3.30)
  const boardChassisGroup = new THREE.Group();
  boardChassisGroup.position.copy(BOARD_POS);
  boardChassisGroup.rotation.y = BOARD_ROT_Y;
  group.add(boardChassisGroup);

  const bw = 0.70; // Width
  const bl = 3.30; // Length
  const bh = 0.155; // Height
  const bRad = 0.060;

  const shape = new THREE.Shape();
  const hw = bw / 2 - bRad;
  const hl = bl / 2 - bRad;

  shape.moveTo(-hw, -hl - bRad);
  shape.lineTo(hw, -hl - bRad);
  shape.absarc(hw, -hl, bRad, -Math.PI / 2, 0, false);
  shape.lineTo(hw + bRad, hl);
  shape.absarc(hw, hl, bRad, 0, Math.PI / 2, false);
  shape.lineTo(-hw, hl + bRad);
  shape.absarc(-hw, hl, bRad, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw - bRad, -hl);
  shape.absarc(-hw, -hl, bRad, Math.PI, Math.PI * 1.5, false);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: bh,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.016,
    bevelThickness: 0.016,
  };

  const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x090e16,
    roughness: 0.42,
    metalness: 0.40,
  });

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.rotation.x = -Math.PI / 2;
  bodyMesh.position.set(0, 0.002, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  boardChassisGroup.add(bodyMesh);

  // Cyber wireframe contour
  const wireMaterials: THREE.LineBasicMaterial[] = [];
  const bodyWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.30,
  });
  wireMaterials.push(bodyWireMat);

  const bodyWire = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 24), bodyWireMat);
  bodyWire.rotation.x = -Math.PI / 2;
  bodyWire.position.copy(bodyMesh.position);
  boardChassisGroup.add(bodyWire);

  // 4. MASTER ROCKER SWITCH & SURGE STATUS LEDS (Right End)
  const switchGroup = new THREE.Group();
  switchGroup.position.set(0, bh + 0.014, -1.15);

  const switchBezelMat = new THREE.MeshStandardMaterial({
    color: 0x141c26,
    roughness: 0.35,
    metalness: 0.70,
  });
  const switchBezel = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.032, 0.32), switchBezelMat);
  switchGroup.add(switchBezel);

  const switchRockerMat = new THREE.MeshStandardMaterial({
    color: 0x111724, // Sleek dark industrial rocker body
    roughness: 0.35,
    metalness: 0.50,
  });
  const switchRocker = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.048, 0.24), switchRockerMat);
  switchRocker.position.set(0, 0.024, 0);
  switchRocker.rotation.x = 0.12; // On position
  switchGroup.add(switchRocker);

  // Glowing neon power bar indicator on the switch (Adaptive Workstation Theme Color)
  const switchNeonMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor),
    transparent: true,
    opacity: 0.95,
  });
  const switchNeon = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.030), switchNeonMat);
  switchNeon.position.set(0, 0.048, 0.06);
  switchGroup.add(switchNeon);

  boardChassisGroup.add(switchGroup);

  // Surge Protection & Earth Ground Status LEDs
  const ledGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.026, 16);
  const surgeLedMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor),
    transparent: true,
    opacity: 0.95,
  });
  const surgeLed = new THREE.Mesh(ledGeo, surgeLedMat);
  surgeLed.position.set(-0.13, bh + 0.020, -0.85);
  boardChassisGroup.add(surgeLed);

  const earthLedMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor), // Adaptive theme color
    transparent: true,
    opacity: 0.90,
  });
  const earthLed = new THREE.Mesh(ledGeo, earthLedMat);
  earthLed.position.set(0.13, bh + 0.020, -0.85);
  boardChassisGroup.add(earthLed);

  // 5. FOUR UNIVERSAL SOCKET BAYS (Adaptive Workstation Theme Color)
  const socketCentersZ = [-0.50, 0.08, 0.66, 1.24];
  const socketRimMat = new THREE.MeshStandardMaterial({
    color: 0x05090f,
    roughness: 0.5,
    metalness: 0.3,
  });
  const brassContactMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor),
    roughness: 0.30,
    metalness: 0.85,
  });
  const shutterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor),
    roughness: 0.40,
    metalness: 0.50,
  });

  socketCentersZ.forEach((sz) => {
    // Outer circular socket bay recess
    const bayGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.010, 32);
    const bayMesh = new THREE.Mesh(bayGeo, socketRimMat);
    bayMesh.position.set(0, bh + 0.015, sz);
    boardChassisGroup.add(bayMesh);

    // Grounding hole (top)
    const groundGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.020, 16);
    const groundHole = new THREE.Mesh(groundGeo, brassContactMat);
    groundHole.position.set(0, bh + 0.018, sz - 0.090);
    boardChassisGroup.add(groundHole);

    // Live & Neutral pin slots with safety shutters (bottom left & right)
    [-0.070, 0.070].forEach((sx) => {
      const slotGeo = new THREE.BoxGeometry(0.024, 0.020, 0.070);
      const slotMesh = new THREE.Mesh(slotGeo, shutterMat);
      slotMesh.position.set(sx, bh + 0.018, sz + 0.050);
      boardChassisGroup.add(slotMesh);
    });
  });

  // Shared Rubber & Molded Plastic Materials
  const plugMoldedMat = new THREE.MeshStandardMaterial({
    color: 0x111722,
    roughness: 0.40,
    metalness: 0.45,
  });

  const plugRubberMat = new THREE.MeshStandardMaterial({
    color: 0x141b25,
    roughness: 0.75,
    metalness: 0.20,
  });

  const dcCableMat = new THREE.MeshStandardMaterial({
    color: 0x080c14,
    roughness: 0.45,
  });

  // 6. ROUTER 12V DC POWER ADAPTER IN LEFTMOST SOCKET (socketCentersZ[3] = 1.24 -> World X = -1.59)
  const routerAdapterGroup = new THREE.Group();
  routerAdapterGroup.position.set(0, bh + 0.008, socketCentersZ[3]);

  // A) Clean Wall-Wart Adapter Body
  const adapterBodyMat = new THREE.MeshStandardMaterial({
    color: 0x0b111a,
    roughness: 0.32,
    metalness: 0.50,
  });
  const adapterBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.22, 0.32),
    adapterBodyMat
  );
  adapterBody.position.set(0, 0.110, 0);
  adapterBody.castShadow = true;
  routerAdapterGroup.add(adapterBody);

  // Status LED on top of adapter
  const adapterLedMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(DEFAULT_THEME.threeColor),
    transparent: true,
    opacity: 0.9,
  });
  const adapterLed = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), adapterLedMat);
  adapterLed.position.set(0, 0.222, -0.08);
  routerAdapterGroup.add(adapterLed);

  // Molded Ribbed Strain-Relief Bush on the NEXT SIDE facing the router (Local +Z = World -X)
  const adapterBushGroup = new THREE.Group();
  adapterBushGroup.position.set(0, 0.055, 0.150); // Left side face at local +Z

  // 1) Base Collar
  const bushCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.030, 0.020, 16),
    plugRubberMat
  );
  bushCollar.rotation.x = Math.PI / 2; // Aligned along local Z (World -X towards router)
  bushCollar.position.set(0, 0, 0.010);
  adapterBushGroup.add(bushCollar);

  // 2) 4 Stepped Flexible Annular Ribs (as per reference image)
  const adapterBushRibs = [
    { r1: 0.022, r2: 0.025, h: 0.016, z: 0.026 },
    { r1: 0.019, r2: 0.022, h: 0.016, z: 0.042 },
    { r1: 0.016, r2: 0.019, h: 0.016, z: 0.058 },
    { r1: 0.013, r2: 0.016, h: 0.016, z: 0.074 },
  ];

  adapterBushRibs.forEach(({ r1, r2, h, z }) => {
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r2, h, 16),
      plugRubberMat
    );
    rib.rotation.x = Math.PI / 2;
    rib.position.set(0, 0, z);
    rib.castShadow = true;
    adapterBushGroup.add(rib);
  });

  routerAdapterGroup.add(adapterBushGroup);
  boardChassisGroup.add(routerAdapterGroup);

  // Global Cables Container
  const worldCablesGroup = new THREE.Group();
  group.add(worldCablesGroup);

  // B) Molded 12V DC Barrel Connector Plug Head at Router DC-IN Jack (Pulled Back & Shifted Right to DC Icon)
  const routerDcPlugGroup = new THREE.Group();
  routerDcPlugGroup.position.set(-4.550, 0.235, -1.275); // Positioned at DC power socket on right side of rear panel
  routerDcPlugGroup.rotation.y = Math.PI - Math.PI / 8;  // Pointing outward into open desk space

  // 1) Silver Chrome/Nickel Barrel Tip with Black Inner Dielectric Ring (Inserted into socket)
  const dcTipMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.12,
    metalness: 0.98,
  });
  const dcTip = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.065, 16), dcTipMat);
  dcTip.rotation.x = Math.PI / 2;
  dcTip.position.set(0, 0, -0.035); // Reaching inside the socket
  routerDcPlugGroup.add(dcTip);

  const dcInnerCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.068, 16),
    new THREE.MeshStandardMaterial({ color: 0x05080d, roughness: 0.9 })
  );
  dcInnerCore.rotation.x = Math.PI / 2;
  dcInnerCore.position.set(0, 0, -0.035);
  routerDcPlugGroup.add(dcInnerCore);

  // 2) Molded Black PVC Cylindrical Barrel Grip Body with 6 Tactile Concentric Rings
  const dcGripMat = new THREE.MeshStandardMaterial({
    color: 0x111724,
    roughness: 0.40,
    metalness: 0.45,
  });
  const dcGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.100, 16),
    dcGripMat
  );
  dcGrip.rotation.x = Math.PI / 2;
  dcGrip.position.set(0, 0, 0.050);
  dcGrip.castShadow = true;
  routerDcPlugGroup.add(dcGrip);

  for (let g = 0; g < 6; g++) {
    const gripRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.005, 16),
      dcGripMat
    );
    gripRing.rotation.x = Math.PI / 2;
    gripRing.position.set(0, 0, 0.022 + g * 0.011);
    routerDcPlugGroup.add(gripRing);
  }

  // 3) Stepped Flexible Rubber Strain-Relief Boot (6 ribs tapering down to cable, matching reference image)
  const barrelBootRibs = [
    { r1: 0.030, r2: 0.033, h: 0.016, z: 0.108 },
    { r1: 0.026, r2: 0.029, h: 0.016, z: 0.126 },
    { r1: 0.023, r2: 0.026, h: 0.016, z: 0.144 },
    { r1: 0.020, r2: 0.023, h: 0.016, z: 0.162 },
    { r1: 0.017, r2: 0.020, h: 0.016, z: 0.180 },
    { r1: 0.014, r2: 0.017, h: 0.020, z: 0.198 },
  ];

  barrelBootRibs.forEach(({ r1, r2, h, z }) => {
    const bootRib = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r2, h, 16),
      plugRubberMat
    );
    bootRib.rotation.x = Math.PI / 2;
    bootRib.position.set(0, 0, z);
    bootRib.castShadow = true;
    routerDcPlugGroup.add(bootRib);
  });

  worldCablesGroup.add(routerDcPlugGroup);

  // C) Flexible 12V DC Cable Spline from Adapter Side Bush to Router DC Jack
  // Exact Adapter Bush Axis in World: Y = 0.246, Z = -3.200, pointing along -X
  // Tip of the Router DC Barrel Boot is at World X = -4.475, Y = 0.235, Z = -1.458
  // Arches smoothly over the WAN Fiber Cable at (X = -3.80, Z = -1.90) at Y = 0.068
  const routerDcPoints = [
    new THREE.Vector3(-1.650, 0.246, -3.200), // Inside adapter body along bush axis
    new THREE.Vector3(-1.740, 0.246, -3.200), // Inside bush base collar
    new THREE.Vector3(-1.822, 0.246, -3.200), // Exactly at the tip of the strain-relief bush
    new THREE.Vector3(-1.950, 0.246, -3.200), // Straight coaxial lead-out along bush axis
    new THREE.Vector3(-2.120, 0.240, -3.190), // Clearing board left end cap elevated in open air
    new THREE.Vector3(-2.300, 0.170, -3.100), // Smooth open-air catenary descent
    new THREE.Vector3(-2.500, 0.085, -2.950), // Approaching desk mat
    new THREE.Vector3(-2.700, 0.038, -2.720), // Touchdown onto desk mat (Y = 0.038)
    new THREE.Vector3(-3.150, 0.038, -2.380), // Flowing smoothly across desk mat
    new THREE.Vector3(-3.500, 0.046, -2.120), // Graceful rise before fiber cable crossing
    new THREE.Vector3(-3.800, 0.068, -1.900), // Physical bridge smoothly crossing OVER WAN Fiber Cable (Y = 0.068 > 0.050)
    new THREE.Vector3(-4.080, 0.048, -1.720), // Smooth descent past fiber cable
    new THREE.Vector3(-4.280, 0.100, -1.620), // Transitioning into catenary rise to DC port
    new THREE.Vector3(-4.400, 0.175, -1.540), // Aligning with boot insertion tangent
    new THREE.Vector3(-4.475, 0.235, -1.458), // Enters center tip of DC barrel boot (0° coaxial)
    new THREE.Vector3(-4.510, 0.235, -1.370), // Submerged inside molded barrel grip body
  ];
  const routerDcCurve = new THREE.CatmullRomCurve3(routerDcPoints, false, "catmullrom", 0.4);
  const routerDcGeo = new THREE.TubeGeometry(routerDcCurve, 160, 0.012, 8, false);
  const routerDcMesh = new THREE.Mesh(routerDcGeo, dcCableMat);
  routerDcMesh.castShadow = true;
  worldCablesGroup.add(routerDcMesh);

  // 7. ASUS TUF 180W LAPTOP PLUG IN RIGHTMOST SOCKET (socketCentersZ[0] = -0.50 -> World X = +0.15)
  // A) Authentic 3-Pin Triangular Plug aligned with socket pin layout:
  //    - Apex (ground pin) → local -Z → towards ground hole at sz - 0.090
  //    - Flat base (live/neutral) → local +Z → towards two slots at sz + 0.050
  //    - Cable exits from flat base side → local +Z → World -X (leftward towards brick)
  const triPlugGroup = new THREE.Group();
  triPlugGroup.position.set(0, bh + 0.008, socketCentersZ[0]);

  // Scaled Triangular Plug Body
  const triShape = new THREE.Shape();
  const trW = 0.24; // Width of flat base
  const trH = 0.24; // Height from apex to base
  const trRad = 0.035;

  triShape.moveTo(-trW / 2 + trRad, -trH / 2);
  triShape.lineTo(trW / 2 - trRad, -trH / 2);
  triShape.absarc(trW / 2 - trRad, -trH / 2 + trRad, trRad, -Math.PI / 2, 0, false);
  triShape.lineTo(trRad, trH / 2 - trRad);
  triShape.absarc(0, trH / 2 - trRad, trRad, 0, Math.PI, false);
  triShape.lineTo(-trW / 2, -trH / 2 + trRad);
  triShape.absarc(-trW / 2 + trRad, -trH / 2 + trRad, trRad, Math.PI, Math.PI * 1.5, false);
  triShape.closePath();

  const triExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.095,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.008,
    bevelThickness: 0.008,
  };

  const triPlugMat = new THREE.MeshStandardMaterial({
    color: 0x111722,
    roughness: 0.35,
    metalness: 0.55,
  });
  const triPlugMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(triShape, triExtrudeSettings),
    triPlugMat
  );
  // rotation.x lays the plug flat: original +Y (apex) → local -Z (towards ground hole)
  // No rotation.z — triangle base spans along local X, matching live/neutral slot spread at ±0.070 X
  triPlugMesh.rotation.x = -Math.PI / 2;
  triPlugMesh.position.set(0, 0, 0);
  triPlugMesh.castShadow = true;
  triPlugGroup.add(triPlugMesh);

  // Flexible Rubber Strain Relief Bush exiting from flat base side (local +Z = World -X, leftward towards brick)
  const rubberBootMat = new THREE.MeshStandardMaterial({
    color: 0x141a24,
    roughness: 0.80,
    metalness: 0.15,
  });

  const bootCollarGroup = new THREE.Group();
  bootCollarGroup.position.set(0, 0.048, 0.130); // Flat base side at local +Z
  bootCollarGroup.rotation.x = Math.PI / 2; // Tiers extend along local +Z (World -X, leftward)

  const bootTiers = [
    { r: 0.038, h: 0.024, y: 0.012 },
    { r: 0.032, h: 0.022, y: 0.032 },
    { r: 0.026, h: 0.024, y: 0.052 },
  ];

  bootTiers.forEach(({ r, h, y }) => {
    const tierMesh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 16), rubberBootMat);
    tierMesh.position.set(0, y, 0);
    tierMesh.castShadow = true;
    bootCollarGroup.add(tierMesh);
  });

  triPlugGroup.add(bootCollarGroup);
  boardChassisGroup.add(triPlugGroup);

  // B) ASUS TUF 180W Power Brick Texture with Luminous Cyber Triangle Emblem on Right Half
  const brickCanvas = document.createElement("canvas");
  brickCanvas.width = 1024;
  brickCanvas.height = 512;
  const bCtx = brickCanvas.getContext("2d");

  const drawBrickTexture = (themeHex: string) => {
    if (!bCtx) return;
    bCtx.clearRect(0, 0, 1024, 512);

    // Dark matte chassis base
    bCtx.fillStyle = "#0c1118";
    bCtx.fillRect(0, 0, 1024, 512);

    // Micro-dot matrix grid across the entire top surface
    bCtx.fillStyle = "rgba(255, 255, 255, 0.035)";
    for (let x = 20; x < 1004; x += 14) {
      for (let y = 20; y < 492; y += 14) {
        bCtx.fillRect(x, y, 3, 3);
      }
    }

    // Debossed Geometric "180w" Logo on the Left Half (X = 90..400)
    bCtx.font = "900 120px monospace";
    bCtx.textAlign = "left";
    bCtx.textBaseline = "alphabetic";

    // Dark inset shadow
    bCtx.fillStyle = "rgba(0, 0, 0, 0.85)";
    bCtx.fillText("180w", 95, 310);

    // Subtle edge highlight outline
    bCtx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    bCtx.lineWidth = 3.5;
    bCtx.strokeText("180w", 93, 308);

    // Face fill
    bCtx.fillStyle = "#111823";
    bCtx.fillText("180w", 93, 308);

    // Luminous Neon Cyber Triangle Emblem on the Right Half (Center: 740, 256)
    bCtx.save();
    bCtx.translate(740, 256);

    bCtx.shadowColor = themeHex;
    bCtx.shadowBlur = 32;

    const outerTop = { x: 0, y: -72 };
    const outerLeft = { x: -82, y: 60 };
    const outerRight = { x: 82, y: 60 };

    const innerTop = { x: 0, y: -34 };
    const innerLeft = { x: -42, y: 36 };
    const innerRight = { x: 42, y: 36 };

    // Outer Glowing Triangle Ring with Inner Cutout
    const triGrad = bCtx.createLinearGradient(0, -72, 0, 60);
    triGrad.addColorStop(0, "#ffffff");
    triGrad.addColorStop(0.5, themeHex);
    triGrad.addColorStop(1, `${themeHex}b3`);

    bCtx.fillStyle = triGrad;
    bCtx.beginPath();
    bCtx.moveTo(outerTop.x, outerTop.y);
    bCtx.lineTo(outerRight.x, outerRight.y);
    bCtx.lineTo(outerLeft.x, outerLeft.y);
    bCtx.closePath();

    bCtx.moveTo(innerTop.x, innerTop.y);
    bCtx.lineTo(innerLeft.x, innerLeft.y);
    bCtx.lineTo(innerRight.x, innerRight.y);
    bCtx.closePath();
    bCtx.fill("evenodd");

    // Outer Neon Border Stroke
    bCtx.strokeStyle = themeHex;
    bCtx.lineWidth = 4.0;
    bCtx.lineJoin = "round";
    bCtx.beginPath();
    bCtx.moveTo(outerTop.x, outerTop.y);
    bCtx.lineTo(outerRight.x, outerRight.y);
    bCtx.lineTo(outerLeft.x, outerLeft.y);
    bCtx.closePath();
    bCtx.stroke();

    // Inner Neon Border Stroke
    bCtx.beginPath();
    bCtx.moveTo(innerTop.x, innerTop.y);
    bCtx.lineTo(innerRight.x, innerRight.y);
    bCtx.lineTo(innerLeft.x, innerLeft.y);
    bCtx.closePath();
    bCtx.stroke();

    bCtx.restore();
  };

  drawBrickTexture(DEFAULT_THEME.hex);

  const brickTexture = new THREE.CanvasTexture(brickCanvas);
  brickTexture.colorSpace = THREE.SRGBColorSpace;

  // B) ENLARGED ASUS TUF 180W Power Brick (1.18m length x 0.145m height x 0.60m depth)
  const brickGroup = new THREE.Group();
  brickGroup.position.set(-0.25, 0.072, -1.30);
  brickGroup.rotation.y = -Math.PI / 2; // Aligned vertically along Z

  const brickMat = new THREE.MeshStandardMaterial({
    color: 0x0a1017,
    map: brickTexture,
    roughness: 0.38,
    metalness: 0.35,
  });
  const brickBody = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.145, 0.60), brickMat);
  brickBody.castShadow = true;
  brickGroup.add(brickBody);

  // Rear Authentic Molded IEC AC Connector & Segmented Strain-Relief Boot (Facing -Z in World)
  const acInletGroup = new THREE.Group();
  acInletGroup.position.set(-0.59, 0, 0); // Positioned at rear face of brick (x = -0.59)

  // 1. Recessed Socket Bay cutout in brick face
  const socketRecess = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.088, 0.160),
    new THREE.MeshStandardMaterial({ color: 0x06090e, roughness: 0.8 })
  );
  socketRecess.position.set(0.005, 0, 0);
  acInletGroup.add(socketRecess);

  // 2. Chamfered/Tapered Molded Plug Body (Plugs into brick, extends rearward from x = 0 to x = -0.135)
  const plugBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.135, 0.076, 0.135),
    plugMoldedMat
  );
  plugBody.position.set(-0.068, 0, 0);
  plugBody.castShadow = true;
  acInletGroup.add(plugBody);

  // 3. Molded Grip Ridges on Top and Bottom Faces of the Plug Body
  [-1, 1].forEach((side) => {
    for (let r = 0; r < 3; r++) {
      const gripRidge = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.005, 0.075),
        plugMoldedMat
      );
      gripRidge.position.set(-0.050 - r * 0.024, side * 0.039, 0);
      acInletGroup.add(gripRidge);
    }
  });

  // 4. Prominent Rectangular Flange Collar / Stop Lip (At x = -0.140)
  const flangeCollar = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.092, 0.148),
    plugRubberMat
  );
  flangeCollar.position.set(-0.140, 0, 0);
  flangeCollar.castShadow = true;
  acInletGroup.add(flangeCollar);

  // 5. Segmented Flexible Rubber Strain-Relief Boot (4 ribbed tiers with annular grooves)
  const bootSegments = [
    { r1: 0.038, r2: 0.041, h: 0.030, x: -0.166 }, // Tier 1 (near flange)
    { r1: 0.028, r2: 0.028, h: 0.009, x: -0.185 }, // Annular Groove 1
    { r1: 0.033, r2: 0.036, h: 0.030, x: -0.204 }, // Tier 2
    { r1: 0.025, r2: 0.025, h: 0.009, x: -0.223 }, // Annular Groove 2
    { r1: 0.029, r2: 0.032, h: 0.030, x: -0.242 }, // Tier 3
    { r1: 0.022, r2: 0.022, h: 0.009, x: -0.261 }, // Annular Groove 3
    { r1: 0.025, r2: 0.028, h: 0.030, x: -0.280 }, // Tier 4 (tip where cable emerges)
  ];

  bootSegments.forEach(({ r1, r2, h, x }) => {
    const segMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r2, h, 16),
      plugRubberMat
    );
    segMesh.rotation.z = Math.PI / 2; // Aligned horizontally along local X
    segMesh.position.set(x, 0, 0);
    segMesh.castShadow = true;
    acInletGroup.add(segMesh);
  });

  brickGroup.add(acInletGroup);

  // Authentic DC Output Bracket on Shorter Face with Parallel Sleeve (Centered at x = 0.59, z = 0)
  const dcOutletGroup = new THREE.Group();
  dcOutletGroup.position.set(0.59, 0, 0); // Centered on the front shorter face

  // 1. Molded Mounting Bracket extending forward from the center of the shorter face
  const sideBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.068, 0.088),
    plugRubberMat
  );
  sideBracket.position.set(0.028, 0, 0);
  sideBracket.castShadow = true;
  dcOutletGroup.add(sideBracket);

  // 2. Long Cylindrical Strain-Relief Sleeve running PARALLEL along the shorter face (Local Z / World X)
  const sideSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.18, 16),
    plugRubberMat
  );
  sideSleeve.rotation.x = Math.PI / 2; // Aligned along local Z (World X)
  sideSleeve.position.set(0.055, 0, -0.045);
  sideSleeve.castShadow = true;
  dcOutletGroup.add(sideSleeve);

  // Decorative flex collar ring on the sleeve
  const sleeveCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.027, 0.027, 0.024, 16),
    plugRubberMat
  );
  sleeveCollar.rotation.x = Math.PI / 2;
  sleeveCollar.position.set(0.055, 0, 0.040);
  dcOutletGroup.add(sleeveCollar);

  brickGroup.add(dcOutletGroup);

  // TUF wireframe accent
  const brickWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.30,
  });
  wireMaterials.push(brickWireMat);
  const brickWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.18, 0.145, 0.60)), brickWireMat);
  brickGroup.add(brickWire);

  worldCablesGroup.add(brickGroup);

  // C) Heavy AC Input Cord — Guaranteed zero chassis clipping (stays high Y >= 0.225 until past front edge Z > -2.80)
  const acCordPoints = [
    new THREE.Vector3(-0.050, 0.235, -3.200), // Inside plug bush tip (bush exits along World -X)
    new THREE.Vector3(-0.160, 0.235, -3.200), // Collinear straight exit from plug bush
    new THREE.Vector3(-0.350, 0.232, -3.120), // Turning forward, elevated high above board top (Y = 0.232)
    new THREE.Vector3(-0.520, 0.228, -2.950), // Sweeping forward towards front edge, elevated (Y = 0.228)
    new THREE.Vector3(-0.620, 0.225, -2.780), // Safely cleared board front edge (Z = -2.85) in open air (Y = 0.225)
    new THREE.Vector3(-0.680, 0.160, -2.620), // Smooth open-air catenary droop in free space
    new THREE.Vector3(-0.680, 0.070, -2.500), // Approaching desk surface in open air
    new THREE.Vector3(-0.620, 0.038, -2.420), // Smooth touchdown onto desk mat (Y = 0.038)
    new THREE.Vector3(-0.500, 0.038, -2.380), // Gentle curve sweeping towards brick center axis
    new THREE.Vector3(-0.360, 0.038, -2.360), // Broad progressive turn on desk mat
    new THREE.Vector3(-0.250, 0.050, -2.320), // On inlet axis X = -0.250, rising gently
    new THREE.Vector3(-0.250, 0.072, -2.250), // Coaxial lead-in straight along +Z
    new THREE.Vector3(-0.250, 0.072, -2.185), // Enters center hole of segmented strain-relief boot (0° coaxial)
    new THREE.Vector3(-0.250, 0.072, -1.950), // Submerged inside molded plug head
  ];
  const acCurve = new THREE.CatmullRomCurve3(acCordPoints, false, "catmullrom", 0.45);
  const acCordGeo = new THREE.TubeGeometry(acCurve, 180, 0.024, 10, false);
  const acCordMesh = new THREE.Mesh(acCordGeo, dcCableMat);
  acCordMesh.castShadow = true;
  worldCablesGroup.add(acCordMesh);

  // D) FOLDED RACETRACK SLACK COIL WITH FABRIC VELCRO STRAP (Placed to the right of the front DC outlet)
  const coilCenter = new THREE.Vector3(0.58, 0.038, -0.75);
  const coilLength = 0.42; // Racetrack width
  const coilDepth = 0.13;  // Loop height

  // 1) Continuous Parametric Racetrack Fold Spline — Emerges from centered front sleeve
  const coilPoints: THREE.Vector3[] = [
    new THREE.Vector3(-0.250, 0.072, -0.655), // Submerged inside centered sleeve on shorter face
    new THREE.Vector3(-0.115, 0.072, -0.655), // Exiting sleeve tip parallel to shorter edge (World +X)
    new THREE.Vector3( 0.050, 0.072, -0.655), // Straight coaxial lead-out heading +X
    new THREE.Vector3( 0.200, 0.068, -0.665), // Smooth lead-out continuation
    new THREE.Vector3( 0.350, 0.048, -0.690), // Gentle catenary descent towards table
    new THREE.Vector3( 0.460, 0.038, -0.720), // Smooth touchdown on desk mat
    new THREE.Vector3( 0.580, 0.038, -0.750), // Enters racetrack slack coil
  ];

  // 4 Folded Racetrack Loops (stacked figure-8 loops)
  for (let loop = 0; loop < 4; loop++) {
    const yOff = 0.038 + loop * 0.016;
    const xSpread = 0.016 * ((loop % 2) - 0.5);

    // Left turn
    coilPoints.push(
      new THREE.Vector3(coilCenter.x - coilLength / 2, yOff, coilCenter.z - coilDepth / 2 + xSpread),
      new THREE.Vector3(coilCenter.x - coilLength / 2 - 0.07, yOff, coilCenter.z),
      new THREE.Vector3(coilCenter.x - coilLength / 2, yOff, coilCenter.z + coilDepth / 2 + xSpread),
      // Straight run right
      new THREE.Vector3(coilCenter.x + coilLength / 2, yOff, coilCenter.z + coilDepth / 2 - xSpread),
      // Right turn
      new THREE.Vector3(coilCenter.x + coilLength / 2 + 0.07, yOff, coilCenter.z),
      new THREE.Vector3(coilCenter.x + coilLength / 2, yOff, coilCenter.z - coilDepth / 2 - xSpread)
    );
  }

  // Lead-out from coil towards laptop left charging port (Heading to backward-pointing right-angle plug)
  coilPoints.push(
    new THREE.Vector3(coilCenter.x - coilLength / 2 - 0.09, 0.042, coilCenter.z + 0.03),
    new THREE.Vector3( 0.150, 0.038, -0.600),
    new THREE.Vector3(-0.950, 0.038, -0.460),
    new THREE.Vector3(-1.750, 0.038, -0.280), // Flowing along desk behind laptop
    new THREE.Vector3(-2.200, 0.038, -0.080), // Touchdown lane along laptop left flank
    new THREE.Vector3(-2.250, 0.065,  0.060), // Smooth catenary rise
    new THREE.Vector3(-2.255, 0.088,  0.180), // Straight coaxial approach heading into plug stem
    new THREE.Vector3(-2.255, 0.088,  0.288)  // Enters strain-relief collar of right-angle plug
  );

  const coilCurve = new THREE.CatmullRomCurve3(coilPoints, false, "catmullrom", 0.35);
  const coilGeo = new THREE.TubeGeometry(coilCurve, 340, 0.016, 8, false);
  const coilMesh = new THREE.Mesh(coilGeo, dcCableMat);
  coilMesh.castShadow = true;
  worldCablesGroup.add(coilMesh);

  // 2) Fabric Textured Black Velcro Strap Wrap in the Center of the Coil
  const velcroGroup = new THREE.Group();
  velcroGroup.position.set(coilCenter.x, 0.068, coilCenter.z);

  const velcroMat = new THREE.MeshStandardMaterial({
    color: 0x11161d,
    roughness: 0.90,
    metalness: 0.10,
  });
  const velcroStrap = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.085, 0.18),
    velcroMat
  );
  velcroStrap.castShadow = true;
  velcroGroup.add(velcroStrap);

  const velcroTab = new THREE.Mesh(
    new THREE.BoxGeometry(0.122, 0.016, 0.07),
    velcroMat
  );
  velcroTab.position.set(0, 0.048, 0.05);
  velcroGroup.add(velcroTab);

  worldCablesGroup.add(velcroGroup);

  // E) OFFICIAL ASUS 90-DEGREE RIGHT-ANGLED DC BARREL CONNECTOR HEAD (AT -2.21, 0.088, 0.42)
  // Matching user reference photo: Horizontal barrel into port, long tapered stem pointing backward with debossed slot & clip
  const lPlugGroup = new THREE.Group();
  lPlugGroup.position.set(-2.21, 0.088, 0.42);

  const lPlugMat = new THREE.MeshStandardMaterial({
    color: 0x111620,
    roughness: 0.40,
    metalness: 0.45,
  });

  // 1) Silver Chrome/Nickel Barrel Tip (inserted into port along +X)
  const barrelTipMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.96,
  });
  const barrelTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.040, 16),
    barrelTipMat
  );
  barrelTip.rotation.z = Math.PI / 2;
  barrelTip.position.set(0.020, 0, 0); // Inside port
  lPlugGroup.add(barrelTip);

  // 2) Stepped Inner Contact Collar
  const barrelCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.016, 16),
    lPlugMat
  );
  barrelCollar.rotation.z = Math.PI / 2;
  barrelCollar.position.set(-0.008, 0, 0);
  lPlugGroup.add(barrelCollar);

  // 3) Molded 90-Degree Horizontal Elbow Neck & Outer End Cap
  const elbowHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.045, 16),
    lPlugMat
  );
  elbowHub.rotation.z = Math.PI / 2;
  elbowHub.position.set(-0.032, 0, 0);
  elbowHub.castShadow = true;
  lPlugGroup.add(elbowHub);

  const elbowCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 16, 8),
    lPlugMat
  );
  elbowCap.position.set(-0.054, 0, 0);
  lPlugGroup.add(elbowCap);

  // 4) Tapered Long Vertical Grip Stem (Pointing backward towards -Z along laptop flank)
  const stemMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.026, 0.125, 16),
    lPlugMat
  );
  stemMesh.rotation.x = Math.PI / 2;
  stemMesh.position.set(-0.045, 0, -0.065);
  stemMesh.castShadow = true;
  lPlugGroup.add(stemMesh);

  // Inset Debossed Pill/Capsule Groove on Top Face
  const grooveMat = new THREE.MeshStandardMaterial({
    color: 0x06090e,
    roughness: 0.85,
  });
  const grooveMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.005, 0.055),
    grooveMat
  );
  grooveMesh.position.set(-0.045, 0.024, -0.060);
  lPlugGroup.add(grooveMesh);

  // Integrated Molded Cable Clip Bracket (on inner flank facing laptop chassis at +X)
  const clipBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.028, 0.026),
    lPlugMat
  );
  clipBracket.position.set(-0.026, 0, -0.098);
  lPlugGroup.add(clipBracket);

  const clipLoop = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, 0.022, 0.014),
    new THREE.MeshStandardMaterial({ color: 0x080c14, roughness: 0.8 })
  );
  clipLoop.position.set(-0.018, 0, -0.098);
  lPlugGroup.add(clipLoop);

  // Strain-Relief Ring Collar before cable exit
  const stemCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.023, 0.023, 0.014, 16),
    plugRubberMat
  );
  stemCollar.rotation.x = Math.PI / 2;
  stemCollar.position.set(-0.045, 0, -0.125);
  lPlugGroup.add(stemCollar);

  worldCablesGroup.add(lPlugGroup);

  // 8. HEAVY-DUTY SOURCE MAINS CABLE & END-CAP STRAIN-RELIEF GLAND
  // A) Molded Rubber Strain-Relief Gland on Extension Board Right End Face (Local z = -1.65 -> World X = +1.30)
  const mainsGlandGroup = new THREE.Group();
  mainsGlandGroup.position.set(0, bh / 2, -1.65);
  mainsGlandGroup.rotation.x = -Math.PI / 2; // Pointing along local -Z (World +X)

  const mainsGlandTiers = [
    { r1: 0.048, r2: 0.056, h: 0.028, y: 0.014 },
    { r1: 0.042, r2: 0.046, h: 0.028, y: 0.042 },
    { r1: 0.038, r2: 0.040, h: 0.028, y: 0.070 },
  ];

  mainsGlandTiers.forEach(({ r1, r2, h, y }) => {
    const glandTier = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r2, h, 16),
      plugRubberMat
    );
    glandTier.position.set(0, y, 0);
    glandTier.castShadow = true;
    mainsGlandGroup.add(glandTier);
  });

  boardChassisGroup.add(mainsGlandGroup);

  // B) Heavy-Duty Mains Cable Spline (Originates from Deep Infinity Z = -220.0 to 90° Perpendicular Board Connection)
  const mainsSplinePoints = [
    // 1) Deep Endless Horizon & Cyber Floor Routing (Floor level y = -5.35)
    new THREE.Vector3(  1.800, -5.350, -220.000), // Infinite horizon origin
    new THREE.Vector3(  4.000, -5.350, -145.000), // Serpentine bend in void
    new THREE.Vector3(  0.800, -5.350, -100.000), // Serpentine bend left
    new THREE.Vector3(  3.200, -5.350,  -68.000),
    new THREE.Vector3(  1.100, -5.350,  -44.000),
    new THREE.Vector3(  2.600, -5.350,  -26.000),
    new THREE.Vector3(  1.850, -5.350,  -18.000),
    new THREE.Vector3(  1.850, -5.350,  -14.500),

    // 2) Ultra-Smooth Physical Catenary Gravity Curve from Desk Rear Edge (Z = -5.04) to Floor (Y = -5.35)
    new THREE.Vector3(  1.850, -5.350,  -12.400), // Tangent merge with floor (Y = -5.350, zero slope)
    new THREE.Vector3(  1.850, -5.320,  -11.200), // Gentle floor flare
    new THREE.Vector3(  1.850, -5.100,  -10.100), // Smooth flare up
    new THREE.Vector3(  1.850, -4.650,   -9.100), // Lower catenary curve
    new THREE.Vector3(  1.850, -3.950,   -8.200), // Mid-lower fall
    new THREE.Vector3(  1.850, -3.100,   -7.400), // Mid-air center of gravity
    new THREE.Vector3(  1.850, -2.200,   -6.700), // Mid-upper fall
    new THREE.Vector3(  1.850, -1.350,   -6.100), // Upper descent
    new THREE.Vector3(  1.850, -0.650,   -5.600), // Initial droop off edge
    new THREE.Vector3(  1.850, -0.180,   -5.250), // Edge clearance
    new THREE.Vector3(  1.850,  0.015,   -5.040), // Wrapping over rear table edge (Z = -5.04)

    // 3) Tabletop Routing with 90° Perpendicular Exit from End Face and Smooth Outward Curve
    new THREE.Vector3(  1.850,  0.038,   -4.500),
    new THREE.Vector3(  1.850,  0.038,   -3.900),
    new THREE.Vector3(  1.840,  0.038,   -3.550), // Tabletop arc
    new THREE.Vector3(  1.780,  0.052,   -3.350), // Rising gently from tabletop
    new THREE.Vector3(  1.660,  0.072,   -3.230), // Sweeping into perpendicular tangent
    new THREE.Vector3(  1.520,  0.078,   -3.200), // Straight coaxial lead-out at 90° (along +X)
    new THREE.Vector3(  1.400,  0.078,   -3.200), // Exiting tip of rubber strain-relief gland
    new THREE.Vector3(  1.260,  0.078,   -3.200), // Submerged inside board chassis
  ];

  const mainsCurve = new THREE.CatmullRomCurve3(mainsSplinePoints, false, "catmullrom", 0.35);
  const mainsGeo = new THREE.TubeGeometry(mainsCurve, 680, 0.038, 10, false); // Heavy 3-core 16A mains cable
  const mainsMat = new THREE.MeshStandardMaterial({
    color: 0x080d16,
    roughness: 0.40,
    metalness: 0.35,
  });
  const mainsMesh = new THREE.Mesh(mainsGeo, mainsMat);
  mainsMesh.castShadow = true;
  worldCablesGroup.add(mainsMesh);

  // Mains cable wireframe
  const mainsWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.30,
  });
  wireMaterials.push(mainsWireMat);
  const mainsWire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      mainsCurve.getPoints(260).map((p) => p.clone().setY(p.y + 0.030))
    ),
    mainsWireMat
  );
  worldCablesGroup.add(mainsWire);

  // Collapse the static chassis and cable assemblies into one draw call per
  // material. The rocker is animated, so it keeps its own mesh/transform.
  mergeStaticMeshes(boardChassisGroup, {
    exclude: new Set<THREE.Object3D>([switchRocker]),
    name: "chassis",
  });
  mergeStaticMeshes(worldCablesGroup, { name: "cables" });

  // 9. UPDATE & THEME LOGIC
  let time = 0;
  const updatePower = (delta: number) => {
    time += delta;
    if (isPowerOn) {
      // Subtle heartbeat pulse on surge protection LED
      surgeLedMat.opacity = 0.80 + Math.sin(time * 2.0) * 0.20;
      adapterLedMat.opacity = 0.90 + Math.sin(time * 1.5) * 0.10;
    } else {
      surgeLedMat.opacity = 0.05;
      adapterLedMat.opacity = 0.05;
      switchNeonMat.opacity = 0.05;
    }
  };

  const setTheme = (theme: WorkstationTheme) => {
    drawBrickTexture(theme.hex);
    brickTexture.needsUpdate = true;
    switchNeonMat.color.setHex(theme.threeColor);
    surgeLedMat.color.setHex(theme.threeColor);
    earthLedMat.color.setHex(theme.threeColor);
    adapterLedMat.color.setHex(theme.threeColor);
    brassContactMat.color.setHex(theme.threeColor);
    shutterMat.color.setHex(theme.threeColor);
    wireMaterials.forEach((m) => m.color.setHex(theme.threeColor));
  };

  const toggleMasterPower = () => {
    isPowerOn = !isPowerOn;
    switchRocker.rotation.x = isPowerOn ? 0.12 : -0.12;
    switchNeonMat.opacity = isPowerOn ? 0.95 : 0.05;
    sound.playClick(isPowerOn ? 1.4 : 0.8);
  };

  return {
    group,
    boardHitbox,
    setTheme,
    updatePower,
    toggleMasterPower,
  };
}
