import * as THREE from "three";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * High-Performance Cat7 5-Meter Heavy-Duty Shielded Ethernet Cable with Volumetric Desktop Slack Bundle
 * Connects the Gateway Router LAN1 Gigabit port to the ASUS TUF Gaming F15 RJ-45 Ethernet port.
 * Features:
 * - 5-Meter continuous parametric Catmull-Rom spline with high-volume 5-loop circular slack coil placed right & backward behind router
 * - Dual reinforced hook-and-loop Velcro cable management ties securing the circular coil bundle
 * - 8P8C Snagless strain-relief molded RJ-45 boot connectors on both ends
 * - Live Ethernet link & activity LED indicators (1000 Mbps Link Solid / Activity Blink)
 * - Workstation Theme color synchronization
 */
export function createEthernetCableMesh(): {
  group: THREE.Group;
  setTheme: (theme: WorkstationTheme) => void;
  updateCable: (delta: number) => void;
} {
  const group = new THREE.Group();
  group.name = "ethernet-cat7-cable-system";

  // 1. GENERATE CONTINUOUS 5-METER PARAMETRIC SPLINE WITH HIGH-VOLUME SMOOTH COIL BEHIND ROUTER
  const coilCenter = new THREE.Vector3(-3.05, 0.038, -1.82);
  const coilRadius = 0.30;
  const numLoops = 4.5;
  const totalCoilSteps = 144;
  const thetaStart = Math.PI; // Join at left side of coil heading along -Z

  const splinePoints: THREE.Vector3[] = [
    // A) Router LAN1 Port Connection & Tangent Drop Behind Router
    new THREE.Vector3(-3.910, 0.245, -0.920), // Inside Router LAN1 socket
    new THREE.Vector3(-3.826, 0.245, -1.123), // Exiting rubber boot
    new THREE.Vector3(-3.720, 0.190, -1.300), // Drop behind router
    new THREE.Vector3(-3.560, 0.110, -1.520), // Heading right toward coil
    new THREE.Vector3(-3.380, 0.052, -1.700), // Table approach
    new THREE.Vector3(-3.350, 0.038, -1.820), // Seamless tangential join at left of coil (th = PI)
  ];

  // B) Ultra-Smooth Multi-Layer Circular Desktop Coil Loops (Zero Jagged Kinks)
  for (let i = 1; i <= totalCoilSteps; i++) {
    const frac = i / totalCoilSteps;
    const th = thetaStart + frac * numLoops * 2 * Math.PI;
    // Smooth, organic radial variations across continuous turns (no sawtooth noise)
    const r = coilRadius + 0.015 * Math.sin(th * 2) + 0.008 * Math.cos(th * 3) + (frac - 0.5) * 0.014;
    const x = coilCenter.x + r * Math.cos(th);
    const z = coilCenter.z + r * Math.sin(th);
    // Smooth vertical stacking so loops build realistic 3D cable bundle volume
    const y = coilCenter.y + 0.008 + frac * 0.028 + 0.006 * Math.sin(frac * Math.PI);
    splinePoints.push(new THREE.Vector3(x, y, z));
  }

  // C) Lead-out from Coil Around Router to Laptop RJ-45 Port (Exiting Right Flank Tangentially along +Z)
  // Exact Laptop RJ-45 Boot Axis: Y = 0.097, Z = 0.950, pointing along -X
  splinePoints.push(
    new THREE.Vector3(-2.750, 0.050, -1.700), // Exiting coil right flank tangentially heading +Z
    new THREE.Vector3(-2.740, 0.038, -1.400), // Smooth touchdown on desk mat
    new THREE.Vector3(-2.700, 0.038, -1.050),
    new THREE.Vector3(-2.660, 0.038, -0.650),
    new THREE.Vector3(-2.650, 0.038, -0.200),
    new THREE.Vector3(-2.650, 0.038,  0.250), // Outer lane on desk mat
    new THREE.Vector3(-2.650, 0.038,  0.600), // Desk mat lane
    new THREE.Vector3(-2.620, 0.060,  0.800), // Smooth catenary rise towards RJ-45 height
    new THREE.Vector3(-2.550, 0.085,  0.920), // Aligning onto RJ-45 insertion axis
    new THREE.Vector3(-2.450, 0.097,  0.950), // Straight coaxial lead-in along -X
    new THREE.Vector3(-2.370, 0.097,  0.950), // Enters center tip of RJ-45 strain-relief boot
    new THREE.Vector3(-2.210, 0.097,  0.950)  // Submerged inside RJ-45 connector body in socket
  );

  const curve = new THREE.CatmullRomCurve3(splinePoints, false, "catmullrom", 0.35);

  // 2. CABLE TUBE GEOMETRY & MATERIALS
  const cableRadius = 0.016; // Heavy-Duty Cat7 industrial shielded cable
  const cableGeo = new THREE.TubeGeometry(curve, 320, cableRadius, 10, false);

  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x090f17,
    roughness: 0.35,
    metalness: 0.45,
  });

  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  cableMesh.castShadow = true;
  cableMesh.receiveShadow = true;
  group.add(cableMesh);

  // Neon wireframe contour accent along cable
  const wireMaterials: THREE.LineBasicMaterial[] = [];

  const cableWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.30,
  });
  wireMaterials.push(cableWireMat);

  const cableWire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(200).map((p) => p.clone().setY(p.y + cableRadius * 0.8))
    ),
    cableWireMat
  );
  group.add(cableWire);

  // 3. VELCRO CABLE TIE WRAPS (Securing the high-volume coil bundle)
  const velcroMat = new THREE.MeshStandardMaterial({
    color: 0x121a24,
    roughness: 0.85,
    metalness: 0.15,
  });

  const strapGeo = new THREE.BoxGeometry(0.060, 0.065, 0.095);
  const strapWireGeo = new THREE.EdgesGeometry(strapGeo);

  // Left Strap
  const strapL = new THREE.Mesh(strapGeo, velcroMat);
  strapL.position.set(coilCenter.x - coilRadius, coilCenter.y + 0.024, coilCenter.z);
  group.add(strapL);

  const strapLWire = new THREE.LineSegments(strapWireGeo, cableWireMat);
  strapLWire.position.copy(strapL.position);
  group.add(strapLWire);

  // Right Strap
  const strapR = new THREE.Mesh(strapGeo, velcroMat);
  strapR.position.set(coilCenter.x + coilRadius, coilCenter.y + 0.024, coilCenter.z);
  group.add(strapR);

  const strapRWire = new THREE.LineSegments(strapWireGeo, cableWireMat);
  strapRWire.position.copy(strapR.position);
  group.add(strapRWire);

  // 4. RJ-45 MODULAR CONNECTORS & SNAGLESS BOOTS
  const plugMat = new THREE.MeshStandardMaterial({
    color: 0x182434,
    roughness: 0.25,
    metalness: 0.75,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x0a1018,
    roughness: 0.5,
    metalness: 0.3,
  });

  // A) Laptop RJ-45 Connector (Plugs into Left Flank at X = -2.21, Y = 0.097, Z = 0.95)
  const laptopPlugGroup = new THREE.Group();
  laptopPlugGroup.position.set(-2.27, 0.097, 0.95);

  // RJ-45 Housing
  const rj45HeadGeo = new THREE.BoxGeometry(0.10, 0.048, 0.072);
  const rj45Laptop = new THREE.Mesh(rj45HeadGeo, plugMat);
  laptopPlugGroup.add(rj45Laptop);

  // Latch release clip (top)
  const clipGeo = new THREE.BoxGeometry(0.07, 0.016, 0.024);
  const latchClip = new THREE.Mesh(clipGeo, bootMat);
  latchClip.position.set(-0.01, 0.026, 0);
  laptopPlugGroup.add(latchClip);

  // Molded strain-relief rubber boot
  const bootGeo = new THREE.BoxGeometry(0.06, 0.042, 0.06);
  const bootLaptop = new THREE.Mesh(bootGeo, bootMat);
  bootLaptop.position.set(-0.07, 0, 0);
  laptopPlugGroup.add(bootLaptop);

  group.add(laptopPlugGroup);

  // B) Router RJ-45 Connector (Positioned at Y=0.245, pulled backward outside LAN1 socket)
  const routerPlugGroup = new THREE.Group();
  routerPlugGroup.position.set(-3.879, 0.245, -0.994);
  routerPlugGroup.rotation.y = -Math.PI / 8;

  // RJ-45 Modular Crystal Plug Body (extends from socket z=0.08 outward to z=-0.04)
  const rj45RouterGeo = new THREE.BoxGeometry(0.082, 0.054, 0.12);
  const rj45Router = new THREE.Mesh(rj45RouterGeo, plugMat);
  rj45Router.position.set(0, 0, 0.02);
  routerPlugGroup.add(rj45Router);

  // Plug wireframe
  const plugWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.45,
  });
  wireMaterials.push(plugWireMat);
  const plugWire = new THREE.LineSegments(new THREE.EdgesGeometry(rj45RouterGeo), plugWireMat);
  plugWire.position.set(0, 0, 0.02);
  routerPlugGroup.add(plugWire);

  // Latch release clip (on top of modular plug)
  const latchRouter = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.018, 0.08), bootMat);
  latchRouter.position.set(0, 0.030, 0.02);
  routerPlugGroup.add(latchRouter);

  // Molded strain-relief rubber boot (sits behind the crystal plug from z=-0.025 to -0.115)
  const bootRouterGeo = new THREE.BoxGeometry(0.074, 0.050, 0.09);
  const bootRouter = new THREE.Mesh(bootRouterGeo, bootMat);
  bootRouter.position.set(0, 0, -0.07);
  routerPlugGroup.add(bootRouter);

  const bootWire = new THREE.LineSegments(new THREE.EdgesGeometry(bootRouterGeo), plugWireMat);
  bootWire.position.set(0, 0, -0.07);
  routerPlugGroup.add(bootWire);

  group.add(routerPlugGroup);

  // 5. RJ-45 HARDWARE LINK & ACTIVITY LEDs (On Laptop Flank)
  // Green LED = 1 Gbps Link Active (Solid)
  // Amber LED = Data Packet Transmission (High-speed pulse)
  const ledGeo = new THREE.BoxGeometry(0.008, 0.012, 0.012);

  const linkLedMat = new THREE.MeshBasicMaterial({
    color: 0x10b981, // Emerald Gigabit Green
    transparent: true,
    opacity: 0.95,
  });
  const linkLed = new THREE.Mesh(ledGeo, linkLedMat);
  linkLed.position.set(-2.215, 0.122, 0.932);
  group.add(linkLed);

  const actLedMat = new THREE.MeshBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.85,
  });
  const actLed = new THREE.Mesh(ledGeo, actLedMat);
  actLed.position.set(-2.215, 0.122, 0.968);
  group.add(actLed);

  // 6. ANIMATION & THEME SYNC
  let simTime = 0;
  const updateCable = (delta: number) => {
    simTime += delta * 14;
    // Activity LED packet flicker
    const actFlicker = Math.sin(simTime * 3.7) * Math.cos(simTime * 2.3);
    actLedMat.opacity = actFlicker > 0.05 ? 0.95 : 0.25;
  };

  const setTheme = (theme: WorkstationTheme) => {
    wireMaterials.forEach((m) => m.color.setHex(theme.threeColor));
    actLedMat.color.setHex(theme.threeColor);
  };

  return {
    group,
    setTheme,
    updateCable,
  };
}
