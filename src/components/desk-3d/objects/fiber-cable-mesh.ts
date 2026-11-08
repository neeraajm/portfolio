import * as THREE from "three";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * High-Speed FTTH (Fiber-to-the-Home) Single-Mode Optical Drop Cable
 * Originates from the infinite deep cyber horizon (Z = -220.0), winds across the cyber grid floor in natural organic serpentine S-curves, rises in a graceful slanting angle to the true rear edge of the desk (Z = -5.04), and connects directly into the Gateway Router's optical input port.
 * Features:
 * - Natural organic serpentine curves and gentle slack winding across the floor tiles into the void
 * - True horizon-length spline extending to Z = -220.0, completely eliminating any visible cutoff
 * - Runs fully across the tabletop to the true rear table edge (Z = -5.04) before falling
 * - Natural slanting slope (~45-degree diagonal catenary) from the rear table edge down to the floor grid (-5.35y)
 * - Prominent high-contrast optical connector head with ceramic ferrule, emerald green SC identifier ring, locking latch, and molded strain-relief boot
 * - Animated high-speed laser photon data pulse traveling along the fiber into the router
 * - Workstation Theme color synchronization
 */
export function createFiberCableMesh(): {
  group: THREE.Group;
  setTheme: (theme: WorkstationTheme) => void;
  updateFiber: (delta: number) => void;
} {
  const group = new THREE.Group();
  group.name = "ftth-fiber-optic-cable-system";

  // 1. FIBER OPTIC SPLINE WAYPOINTS (Endless Serpentine Void -> Floor -> Slanting Rise -> True Rear Desk Edge -> Router WAN Socket)
  const rot_y = -Math.PI / 8;

  // Router Socket & Outward Tangent Coordinates
  const wanSocket = new THREE.Vector3(-3.773, 0.250, -0.861);
  const wanBoot = new THREE.Vector3(-3.681, 0.250, -1.083);
  const wanTangent = new THREE.Vector3(-3.628, 0.225, -1.212);

  const splinePoints = [
    // A) Deep Endless Horizon & Organic Serpentine Floor Route (Floor level y = -5.35)
    new THREE.Vector3( -4.500, -5.350, -220.000), // Infinite horizon origin
    new THREE.Vector3( -7.800, -5.350, -150.000), // Wide outer sweep in deep void
    new THREE.Vector3( -1.500, -5.350, -105.000), // Gentle winding S-curve right
    new THREE.Vector3( -6.500, -5.350,  -72.000), // Sweeping curve left
    new THREE.Vector3( -2.800, -5.350,  -48.000), // Natural winding curve right
    new THREE.Vector3( -5.600, -5.350,  -30.000), // Organic floor slack bend left
    new THREE.Vector3( -3.800, -5.350,  -18.000), // Approaching workstation desk
    new THREE.Vector3( -4.200, -5.350,  -14.500), // Flat floor lane

    // B) Ultra-Smooth Physical Catenary Gravity Curve (Desk Rear Edge Z = -5.04 to Floor Y = -5.35)
    new THREE.Vector3( -4.240, -5.350,  -12.400), // Tangent merge with floor (Y = -5.350, zero slope)
    new THREE.Vector3( -4.240, -5.320,  -11.200), // Gentle floor flare
    new THREE.Vector3( -4.240, -5.100,  -10.100), // Smooth flare up
    new THREE.Vector3( -4.240, -4.650,   -9.100), // Lower catenary curve
    new THREE.Vector3( -4.240, -3.950,   -8.200), // Mid-lower fall
    new THREE.Vector3( -4.240, -3.100,   -7.400), // Mid-air center of gravity
    new THREE.Vector3( -4.240, -2.200,   -6.700), // Mid-upper fall
    new THREE.Vector3( -4.240, -1.350,   -6.100), // Upper descent
    new THREE.Vector3( -4.240, -0.650,   -5.600), // Initial droop off edge
    new THREE.Vector3( -4.240, -0.180,   -5.250), // Edge clearance
    new THREE.Vector3( -4.240,  0.015,   -5.040), // Wrapping over rear table edge (Z = -5.04)

    // C) Tabletop Routing (Runs flush on desk surface from rear edge directly to router)
    new THREE.Vector3( -4.220,  0.038,   -4.850), // Rear table surface contact
    new THREE.Vector3( -4.150,  0.038,   -4.200), // Outer table rim
    new THREE.Vector3( -4.000,  0.038,   -3.200), // Desktop surface lane
    new THREE.Vector3( -3.850,  0.038,   -2.300), // Mid-span behind router
    new THREE.Vector3( -3.750,  0.038,   -1.650), // Leading to router
    new THREE.Vector3( -3.680,  0.130,   -1.400), // Graceful rise to router optical port
    wanTangent,                                  // Straight backward tangent
    wanBoot,                                     // Exiting SC/APC strain relief boot
    wanSocket,                                   // Plugs directly into optical port
  ];

  const curve = new THREE.CatmullRomCurve3(splinePoints, false, "catmullrom", 0.35);

  // 2. OPTICAL FIBER TUBE GEOMETRY & MATERIALS
  const fiberRadius = 0.012; // Single-mode fiber optic drop cable
  const fiberGeo = new THREE.TubeGeometry(curve, 720, fiberRadius, 10, false);

  const fiberMat = new THREE.MeshStandardMaterial({
    color: 0x090f18,
    roughness: 0.35,
    metalness: 0.45,
  });

  const fiberMesh = new THREE.Mesh(fiberGeo, fiberMat);
  fiberMesh.castShadow = true;
  fiberMesh.receiveShadow = true;
  group.add(fiberMesh);

  // High-visibility OS2 optical yellow / neon cyber wireframe contour
  const wireMaterials: THREE.LineBasicMaterial[] = [];

  const fiberWireMat = new THREE.LineBasicMaterial({
    color: 0xf59e0b, // Single-mode Optical Yellow default
    transparent: true,
    opacity: 0.35,
  });
  wireMaterials.push(fiberWireMat);

  const fiberWire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(280).map((p) => p.clone().setY(p.y + fiberRadius * 0.8))
    ),
    fiberWireMat
  );
  group.add(fiberWire);

  // 3. PROMINENT FIBER OPTIC CONNECTOR HEAD (Pulled backward for clean exterior visibility)
  const scConnectorGroup = new THREE.Group();
  scConnectorGroup.position.set(-3.742, 0.250, -0.935);
  scConnectorGroup.rotation.y = rot_y;

  // A) Nickel / Zirconia Ceramic Insertion Ferrule Collar
  const ferruleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.06, 14);
  const ferruleMat = new THREE.MeshStandardMaterial({
    color: 0xd8e2ec,
    roughness: 0.2,
    metalness: 0.9,
  });
  const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferrule.rotation.x = Math.PI / 2;
  ferrule.position.set(0, 0, 0.04);
  scConnectorGroup.add(ferrule);

  // B) Main Connector Shroud Body (High-contrast dark stealth graphite)
  const scHousingMat = new THREE.MeshStandardMaterial({
    color: 0x162232,
    roughness: 0.25,
    metalness: 0.75,
  });

  const scHousingGeo = new THREE.BoxGeometry(0.068, 0.054, 0.12);
  const scHousing = new THREE.Mesh(scHousingGeo, scHousingMat);
  scHousing.position.set(0, 0, 0.00);
  scConnectorGroup.add(scHousing);

  const scHousingWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.50,
  });
  wireMaterials.push(scHousingWireMat);
  const scHousingWire = new THREE.LineSegments(new THREE.EdgesGeometry(scHousingGeo), scHousingWireMat);
  scHousingWire.position.set(0, 0, 0.00);
  scConnectorGroup.add(scHousingWire);

  // C) SC/APC Emerald Green Optical Identifier Ring / Collar
  const ringGeo = new THREE.BoxGeometry(0.072, 0.058, 0.024);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x10b981, // Emerald Green SC Optical Standard
    roughness: 0.25,
    metalness: 0.45,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, 0, 0.035);
  scConnectorGroup.add(ring);

  // D) Quick-Release Top Locking Latch Clip
  const scLatchGeo = new THREE.BoxGeometry(0.024, 0.018, 0.08);
  const scLatch = new THREE.Mesh(
    scLatchGeo,
    new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: 0.5, metalness: 0.3 })
  );
  scLatch.position.set(0, 0.030, 0.00);
  scConnectorGroup.add(scLatch);

  // E) Molded Flexible Strain-Relief Rubber Boot (Where fiber exits)
  const scBootGeo = new THREE.BoxGeometry(0.060, 0.048, 0.09);
  const scBoot = new THREE.Mesh(
    scBootGeo,
    new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: 0.6, metalness: 0.2 })
  );
  scBoot.position.set(0, 0, -0.085);
  scConnectorGroup.add(scBoot);

  const scBootWire = new THREE.LineSegments(new THREE.EdgesGeometry(scBootGeo), scHousingWireMat);
  scBootWire.position.set(0, 0, -0.085);
  scConnectorGroup.add(scBootWire);

  group.add(scConnectorGroup);

  // 4. WAN OPTICAL LINK & LASER ACTIVITY LED
  const wanLedGeo = new THREE.BoxGeometry(0.008, 0.012, 0.012);
  const wanLedMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff, // Laser Optical Cyan Link
    transparent: true,
    opacity: 0.95,
  });
  const wanLed = new THREE.Mesh(wanLedGeo, wanLedMat);
  wanLed.position.set(-3.773, 0.290, -0.861);
  group.add(wanLed);

  // 5. ANIMATED LASER PHOTON PULSE ENGINE
  let simTime = 0;
  const updateFiber = (delta: number) => {
    simTime += delta * 18;
    // High-speed photon flicker traveling into the router
    const pulse = Math.sin(simTime * 4.2) * Math.cos(simTime * 2.8);
    wanLedMat.opacity = pulse > 0.0 ? 0.95 : 0.35;
    fiberWireMat.opacity = 0.30 + (Math.sin(simTime * 2.0) + 1) * 0.15;
  };

  const setTheme = (theme: WorkstationTheme) => {
    // Synchronize wireframe glow with active theme
    wireMaterials.forEach((m) => m.color.setHex(theme.threeColor));
  };

  return {
    group,
    setTheme,
    updateFiber,
  };
}
