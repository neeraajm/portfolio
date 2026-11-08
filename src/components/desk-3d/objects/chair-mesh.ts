import * as THREE from "three";
import { DEFAULT_THEME } from "@/lib/theme-colors";
import { mergeStaticMeshes } from "../utils/merge-static";

/**
 * Procedural Cyberpunk Ergonomic Battle-Station Chair
 * Orientation:
 * - Front of seat faces `-Z` (toward the desk/laptop)
 * - Backrest is positioned at `+Z` (rear of chair)
 * - Base casters rest at floor level `y = -5.40`
 * - Seat sits comfortably at `y = -2.20`
 */
export function createChairMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = "cyberpunk-chair";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x080c14,
    roughness: 0.7,
    metalness: 0.3,
  });

  const bolsterMat = new THREE.MeshStandardMaterial({
    color: 0x0c101c,
    roughness: 0.55,
    metalness: 0.4,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x141a28,
    roughness: 0.3,
    metalness: 0.85,
  });

  const wireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.45,
  });

  const neonAccentMat = new THREE.MeshStandardMaterial({
    color: DEFAULT_THEME.threeColor,
    emissive: DEFAULT_THEME.threeColor,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  // 1. 5-STAR CASTER WHEELBASE (Elevated steel legs with vertical caster stems underneath)
  const baseHubGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.32, 14);
  const baseHub = new THREE.Mesh(baseHubGeo, metalMat);
  baseHub.position.set(0, -4.88, 0);
  group.add(baseHub);

  const hubCapGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 16);
  const hubCap = new THREE.Mesh(hubCapGeo, neonAccentMat);
  hubCap.rotation.x = Math.PI / 2;
  hubCap.position.set(0, -4.74, 0);
  group.add(hubCap);

  const spokeRadius = 1.85;
  const spokeLen = spokeRadius;
  const spokeGeo = new THREE.BoxGeometry(0.18, 0.18, spokeLen);
  const spokeEdges = new THREE.EdgesGeometry(spokeGeo);

  // Vertical Swivel Socket Stem (Directly UNDER the end of each spoke)
  const stemSocketGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.10, 10);
  const stemSocketEdges = new THREE.EdgesGeometry(stemSocketGeo);

  // Caster Shroud Hood
  const casterHoodGeo = new THREE.BoxGeometry(0.20, 0.11, 0.18);
  const casterHoodEdges = new THREE.EdgesGeometry(casterHoodGeo);

  // Twin Roller Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.055, 14);
  const wheelEdges = new THREE.EdgesGeometry(wheelGeo);
  const wheelRimGeo = new THREE.TorusGeometry(0.11, 0.012, 6, 12);
  const hubDomeGeo = new THREE.SphereGeometry(0.045, 8, 6);

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;

    // 🟢 Elevated Horizontal Steel Spoke (Elevated off the floor with ~0.35 gap underneath)
    const spoke = new THREE.Mesh(spokeGeo, metalMat);
    spoke.position.set(
      (Math.sin(angle) * spokeLen) / 2,
      -4.96,
      (Math.cos(angle) * spokeLen) / 2
    );
    spoke.rotation.y = angle;
    group.add(spoke);

    const spokeWire = new THREE.LineSegments(spokeEdges, wireMat);
    spokeWire.position.copy(spoke.position);
    spokeWire.rotation.copy(spoke.rotation);
    group.add(spokeWire);

    // Socket Stem Location: Located UNDER the tip of the steel spoke
    const socketX = Math.sin(angle) * (spokeLen - 0.18);
    const socketZ = Math.cos(angle) * (spokeLen - 0.18);

    // 1. Vertical Cylindrical Swivel Socket (Extends down from underneath the spoke)
    const socketMesh = new THREE.Mesh(stemSocketGeo, metalMat);
    socketMesh.position.set(socketX, -5.09, socketZ);
    group.add(socketMesh);

    const socketWire = new THREE.LineSegments(stemSocketEdges, wireMat);
    socketWire.position.set(socketX, -5.09, socketZ);
    group.add(socketWire);

    // 2. Swiveling Caster Assembly (Hanging underneath the stem socket)
    const casterGroup = new THREE.Group();
    casterGroup.position.set(socketX, -5.16, socketZ);
    // Slight trailing caster swivel angle for realistic posture
    casterGroup.rotation.y = angle + Math.PI / 2 + 0.25;

    // Caster Shroud / Fork Hood (Sits over the twin wheels)
    const hood = new THREE.Mesh(casterHoodGeo, metalMat);
    hood.position.set(0, 0.03, 0);
    casterGroup.add(hood);
    const hoodWire = new THREE.LineSegments(casterHoodEdges, wireMat);
    hoodWire.position.set(0, 0.03, 0);
    casterGroup.add(hoodWire);

    // 3. Left Twin Wheel
    const wheelL = new THREE.Mesh(wheelGeo, carbonMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(-0.062, -0.08, 0);
    casterGroup.add(wheelL);

    const wheelLWire = new THREE.LineSegments(wheelEdges, wireMat);
    wheelLWire.rotation.z = Math.PI / 2;
    wheelLWire.position.set(-0.062, -0.08, 0);
    casterGroup.add(wheelLWire);

    const rimL = new THREE.Mesh(wheelRimGeo, neonAccentMat);
    rimL.rotation.y = Math.PI / 2;
    rimL.position.set(-0.095, -0.08, 0);
    casterGroup.add(rimL);

    const domeL = new THREE.Mesh(hubDomeGeo, metalMat);
    domeL.position.set(-0.092, -0.08, 0);
    casterGroup.add(domeL);

    // 4. Right Twin Wheel
    const wheelR = new THREE.Mesh(wheelGeo, carbonMat);
    wheelR.rotation.z = Math.PI / 2;
    wheelR.position.set(0.062, -0.08, 0);
    casterGroup.add(wheelR);

    const wheelRWire = new THREE.LineSegments(wheelEdges, wireMat);
    wheelRWire.rotation.z = Math.PI / 2;
    wheelRWire.position.set(0.062, -0.08, 0);
    casterGroup.add(wheelRWire);

    const rimR = new THREE.Mesh(wheelRimGeo, neonAccentMat);
    rimR.rotation.y = Math.PI / 2;
    rimR.position.set(0.095, -0.08, 0);
    casterGroup.add(rimR);

    const domeR = new THREE.Mesh(hubDomeGeo, metalMat);
    domeR.position.set(0.092, -0.08, 0);
    casterGroup.add(domeR);

    group.add(casterGroup);
  }

  // 2. TELESCOPING HYDRAULIC GAS LIFT PISTON
  const pistonGeo = new THREE.CylinderGeometry(0.15, 0.18, 2.8, 12);
  const piston = new THREE.Mesh(pistonGeo, metalMat);
  piston.position.set(0, -3.7, 0);
  group.add(piston);

  const pistonRingGeo = new THREE.TorusGeometry(0.20, 0.03, 8, 16);
  const pistonRing = new THREE.Mesh(pistonRingGeo, neonAccentMat);
  pistonRing.rotation.x = Math.PI / 2;
  pistonRing.position.set(0, -2.5, 0);
  group.add(pistonRing);

  // 3. SEAT BASE & THIGH RACING BOLSTERS (y ≈ -2.2)
  const seatGeo = new THREE.BoxGeometry(2.3, 0.32, 2.2);
  const seatMesh = new THREE.Mesh(seatGeo, carbonMat);
  seatMesh.position.set(0, -2.25, 0);
  seatMesh.castShadow = true;
  seatMesh.receiveShadow = true;
  group.add(seatMesh);

  const seatWire = new THREE.LineSegments(new THREE.EdgesGeometry(seatGeo), wireMat);
  seatWire.position.set(0, -2.25, 0);
  group.add(seatWire);

  // Left Thigh Bolster
  const bolsterLGeo = new THREE.BoxGeometry(0.35, 0.38, 2.1);
  const bolsterL = new THREE.Mesh(bolsterLGeo, bolsterMat);
  bolsterL.position.set(-1.18, -2.12, 0);
  bolsterL.rotation.z = 0.22;
  group.add(bolsterL);
  const bolsterLWire = new THREE.LineSegments(new THREE.EdgesGeometry(bolsterLGeo), wireMat);
  bolsterLWire.position.copy(bolsterL.position);
  bolsterLWire.rotation.copy(bolsterL.rotation);
  group.add(bolsterLWire);

  // Right Thigh Bolster
  const bolsterRGeo = new THREE.BoxGeometry(0.35, 0.38, 2.1);
  const bolsterR = new THREE.Mesh(bolsterRGeo, bolsterMat);
  bolsterR.position.set(1.18, -2.12, 0);
  bolsterR.rotation.z = -0.22;
  group.add(bolsterR);
  const bolsterRWire = new THREE.LineSegments(new THREE.EdgesGeometry(bolsterRGeo), wireMat);
  bolsterRWire.position.copy(bolsterR.position);
  bolsterRWire.rotation.copy(bolsterR.rotation);
  group.add(bolsterRWire);

  // 4. HIGH-BACK RACING BACKREST & HEADREST (Positioned at +Z, facing toward -Z / Desk)
  const backPivot = new THREE.Group();
  backPivot.position.set(0, -2.1, 1.0); // Rear of seat cushion
  backPivot.rotation.x = 0.08; // Natural slight ergonomic recline toward +Z
  group.add(backPivot);

  // Main Lumbar / Torso Backrest
  const backGeo = new THREE.BoxGeometry(2.1, 2.3, 0.26);
  const backMesh = new THREE.Mesh(backGeo, carbonMat);
  backMesh.position.set(0, 1.15, 0);
  backMesh.castShadow = true;
  backMesh.receiveShadow = true;
  backPivot.add(backMesh);

  const backWire = new THREE.LineSegments(new THREE.EdgesGeometry(backGeo), wireMat);
  backWire.position.set(0, 1.15, 0);
  backPivot.add(backWire);

  // Shoulder Wings (Left & Right)
  const wingLGeo = new THREE.BoxGeometry(0.32, 1.5, 0.35);
  const wingL = new THREE.Mesh(wingLGeo, bolsterMat);
  wingL.position.set(-1.1, 1.3, -0.1);
  wingL.rotation.y = -0.35;
  backPivot.add(wingL);

  const wingRGeo = new THREE.BoxGeometry(0.32, 1.5, 0.35);
  const wingR = new THREE.Mesh(wingRGeo, bolsterMat);
  wingR.position.set(1.1, 1.3, -0.1);
  wingR.rotation.y = 0.35;
  backPivot.add(wingR);

  // Integrated Tapered Headrest
  const headrestGeo = new THREE.BoxGeometry(1.4, 0.85, 0.30);
  const headrest = new THREE.Mesh(headrestGeo, bolsterMat);
  headrest.position.set(0, 2.55, -0.02);
  backPivot.add(headrest);

  const headrestWire = new THREE.LineSegments(new THREE.EdgesGeometry(headrestGeo), wireMat);
  headrestWire.position.set(0, 2.55, -0.02);
  backPivot.add(headrestWire);

  // Dual Harness Cutout Holes (Accent Neon Insets)
  const cutoutGeo = new THREE.BoxGeometry(0.24, 0.14, 0.32);
  const cutoutL = new THREE.Mesh(cutoutGeo, neonAccentMat);
  cutoutL.position.set(-0.38, 2.1, 0);
  backPivot.add(cutoutL);

  const cutoutR = new THREE.Mesh(cutoutGeo, neonAccentMat);
  cutoutR.position.set(0.38, 2.1, 0);
  backPivot.add(cutoutR);

  // Lumbar Support Pillow
  const lumbarGeo = new THREE.BoxGeometry(1.5, 0.45, 0.20);
  const lumbar = new THREE.Mesh(lumbarGeo, bolsterMat);
  lumbar.position.set(0, 0.45, -0.16);
  backPivot.add(lumbar);

  // 5. 3D ADJUSTABLE PADDED ARMRESTS (Left & Right)
  const armBracketGeo = new THREE.BoxGeometry(0.12, 1.1, 0.15);
  const armPadGeo = new THREE.BoxGeometry(0.32, 0.10, 1.1);

  // Left Armrest
  const armBracketL = new THREE.Mesh(armBracketGeo, metalMat);
  armBracketL.position.set(-1.32, -1.65, 0);
  group.add(armBracketL);

  const armPadL = new THREE.Mesh(armPadGeo, carbonMat);
  armPadL.position.set(-1.32, -1.05, -0.1);
  group.add(armPadL);
  const armPadLWire = new THREE.LineSegments(new THREE.EdgesGeometry(armPadGeo), wireMat);
  armPadLWire.position.set(-1.32, -1.05, -0.1);
  group.add(armPadLWire);

  // Right Armrest
  const armBracketR = new THREE.Mesh(armBracketGeo, metalMat);
  armBracketR.position.set(1.32, -1.65, 0);
  group.add(armBracketR);

  const armPadR = new THREE.Mesh(armPadGeo, carbonMat);
  armPadR.position.set(1.32, -1.05, -0.1);
  group.add(armPadR);
  const armPadRWire = new THREE.LineSegments(new THREE.EdgesGeometry(armPadGeo), wireMat);
  armPadRWire.position.set(1.32, -1.05, -0.1);
  group.add(armPadRWire);

  // The chair is a fully static prop: bake its ~95 parts down to one draw
  // call per unique material/line style.
  mergeStaticMeshes(group, { name: "chair" });

  return group;
}
