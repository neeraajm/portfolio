import * as THREE from "three";
import { DEFAULT_THEME } from "@/lib/theme-colors";

export function createDeskSurface(): THREE.Group {
  const group = new THREE.Group();
  group.name = "desk-surface";

  // 1. Sleek Chamfered Tabletop Slab (8-sided polygon with 45-degree clipped corners)
  const tw = 16.0;
  const td = 10.0;
  const th = 0.4;
  const tCut = 0.8; // 45-deg corner chamfer
  const thw = tw / 2;
  const thd = td / 2;

  const tableShape = new THREE.Shape();
  tableShape.moveTo(-thw + tCut, -thd);
  tableShape.lineTo(thw - tCut, -thd);
  tableShape.lineTo(thw, -thd + tCut);
  tableShape.lineTo(thw, thd - tCut);
  tableShape.lineTo(thw - tCut, thd);
  // Ergonomic Cockpit Cut-in on Front Edge (Facing Operator)
  tableShape.lineTo(3.4, thd);
  tableShape.lineTo(2.4, thd - 0.75);
  tableShape.lineTo(-2.4, thd - 0.75);
  tableShape.lineTo(-3.4, thd);
  tableShape.lineTo(-thw + tCut, thd);
  tableShape.lineTo(-thw, thd - tCut);
  tableShape.lineTo(-thw, -thd + tCut);
  tableShape.closePath();

  const tableExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: th,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  };

  const tableGeo = new THREE.ExtrudeGeometry(tableShape, tableExtrudeSettings);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x070c14,
    roughness: 0.75,
    metalness: 0.28,
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.rotation.x = Math.PI / 2;
  tableMesh.position.y = -0.03;
  tableMesh.receiveShadow = true;
  group.add(tableMesh);

  // Tabletop Edge Glow & Facet Highlighting
  const tableEdges = new THREE.EdgesGeometry(tableGeo, 15);
  const tableLineMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.4,
  });
  const tableWire = new THREE.LineSegments(tableEdges, tableLineMat);
  tableWire.rotation.x = Math.PI / 2;
  tableWire.position.y = -0.03;
  group.add(tableWire);

  // 2. Matching Chamfered Desk Pad / Mat (Resting flush on table)
  const pw = 13.5;
  const pd = 7.5;
  const ph = 0.015;
  const pCut = 0.6;
  const phw = pw / 2;
  const phd = pd / 2;

  const padShape = new THREE.Shape();
  padShape.moveTo(-phw + pCut, -phd);
  padShape.lineTo(phw - pCut, -phd);
  padShape.lineTo(phw, -phd + pCut);
  padShape.lineTo(phw, phd - pCut);
  padShape.lineTo(phw - pCut, phd);
  // Matching Ergonomic Front Pad Contour
  padShape.lineTo(3.2, phd);
  padShape.lineTo(2.2, phd - 0.65);
  padShape.lineTo(-2.2, phd - 0.65);
  padShape.lineTo(-3.2, phd);
  padShape.lineTo(-phw + pCut, phd);
  padShape.lineTo(-phw, phd - pCut);
  padShape.lineTo(-phw, -phd + pCut);
  padShape.closePath();

  const padExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: ph,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  };

  const padGeo = new THREE.ExtrudeGeometry(padShape, padExtrudeSettings);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x050a11,
    roughness: 0.82,
    metalness: 0.2,
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.rotation.x = Math.PI / 2;
  padMesh.position.y = 0.012;
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // Pad Border Wireframe
  const padEdges = new THREE.EdgesGeometry(padGeo, 15);
  const padLineMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.75,
  });
  const padWire = new THREE.LineSegments(padEdges, padLineMat);
  padWire.rotation.x = Math.PI / 2;
  padWire.position.y = 0.012;
  group.add(padWire);

  // 3. Ambient Grid Lines on Desk Surface (Bounded within pad interior)
  const gridW = 12.0;
  const gridD = 5.2;
  const step = 0.5;
  const gridPositions: number[] = [];

  // Lines along X (running horizontally)
  for (let z = -gridD / 2; z <= gridD / 2 + 0.001; z += step) {
    gridPositions.push(-gridW / 2, 0, z, gridW / 2, 0, z);
  }

  // Lines along Z (running vertically)
  for (let x = -gridW / 2; x <= gridW / 2 + 0.001; x += step) {
    gridPositions.push(x, 0, -gridD / 2, x, 0, gridD / 2);
  }

  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
  const gridMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.16,
  });
  const padGrid = new THREE.LineSegments(gridGeo, gridMat);
  padGrid.position.set(0, 0.022, 0);
  group.add(padGrid);

  // 4. Heavy-Duty Industrial Cyberpunk Desk Legs & Support Frame
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x06090e,
    roughness: 0.7,
    metalness: 0.4,
  });

  const legWireMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.4,
  });

  const legGeo = new THREE.BoxGeometry(0.45, 5.0, 0.45);
  const legEdges = new THREE.EdgesGeometry(legGeo);

  const legPositions: [number, number, number][] = [
    [-7.2, -2.9, 4.2],  // Front-Left
    [7.2, -2.9, 4.2],   // Front-Right
    [-7.2, -2.9, -4.2], // Back-Left
    [7.2, -2.9, -4.2],  // Back-Right
  ];

  legPositions.forEach(([lx, ly, lz]) => {
    // Vertical Steel Column
    const legMesh = new THREE.Mesh(legGeo, legMat);
    legMesh.position.set(lx, ly, lz);
    legMesh.castShadow = true;
    legMesh.receiveShadow = true;
    group.add(legMesh);

    const legWire = new THREE.LineSegments(legEdges, legWireMat);
    legWire.position.set(lx, ly, lz);
    group.add(legWire);
  });

  // Left & Right Horizontal Structural Side Crossbars
  const sideBarGeo = new THREE.BoxGeometry(0.3, 0.3, 8.4);
  const sideBarEdges = new THREE.EdgesGeometry(sideBarGeo);

  const leftSideBar = new THREE.Mesh(sideBarGeo, legMat);
  leftSideBar.position.set(-7.2, -4.2, 0);
  group.add(leftSideBar);
  const leftSideWire = new THREE.LineSegments(sideBarEdges, legWireMat);
  leftSideWire.position.set(-7.2, -4.2, 0);
  group.add(leftSideWire);

  const rightSideBar = new THREE.Mesh(sideBarGeo, legMat);
  rightSideBar.position.set(7.2, -4.2, 0);
  group.add(rightSideBar);
  const rightSideWire = new THREE.LineSegments(sideBarEdges, legWireMat);
  rightSideWire.position.set(7.2, -4.2, 0);
  group.add(rightSideWire);

  // Rear Cable Channel & Stability Spine Bar
  const rearSpineGeo = new THREE.BoxGeometry(14.4, 0.35, 0.3);
  const rearSpine = new THREE.Mesh(rearSpineGeo, legMat);
  rearSpine.position.set(0, -2.2, -4.2);
  group.add(rearSpine);
  const rearSpineWire = new THREE.LineSegments(new THREE.EdgesGeometry(rearSpineGeo), legWireMat);
  rearSpineWire.position.set(0, -2.2, -4.2);
  group.add(rearSpineWire);

  return group;
}
