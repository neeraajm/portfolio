import * as THREE from "three";
import { WorkstationTheme, DEFAULT_THEME, createTintedAvatarCanvas } from "@/lib/theme-colors";
import { DEVELOPER_PROFILE } from "@/lib/constants";

const MATRIX_CHARS = "0123456789ABCDEF$#%&*@!Ø§µΩΔΨXYZ";

function getRandomMatrixCode(): string {
  let res = "";
  for (let i = 0; i < 9; i++) {
    res += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
  }
  return res;
}

export function createIdCardMesh(): {
  group: THREE.Group;
  cardMesh: THREE.Mesh;
  updateCard: (delta: number) => void;
  setFacing: (facing: "front" | "back") => void;
  setTheme: (theme: WorkstationTheme) => void;
} {
  const group = new THREE.Group();
  group.name = "id-card-prop";
  group.position.set(4.2, 0.02, 1.6);
  group.rotation.y = -Math.PI / 14;

  let currentThemeHex = DEFAULT_THEME.hex;

  // 1. PROCEDURAL FRONT FACE CANVAS (Identity & Credentials)
  const frontCanvas = document.createElement("canvas");
  frontCanvas.width = 800;
  frontCanvas.height = 500;
  const fctx = frontCanvas.getContext("2d");

  const avatarImg = new Image();
  avatarImg.src = "/avatar-neeraj.png";

  const frontTexture = new THREE.CanvasTexture(frontCanvas);
  frontTexture.minFilter = THREE.LinearFilter;
  frontTexture.magFilter = THREE.LinearFilter;
  frontTexture.colorSpace = THREE.SRGBColorSpace;

  let currentExpiryCode = "0xØ9#F7!Ω";
  let matrixTimer = 0;

  const renderFrontCard = (themeHex: string = currentThemeHex) => {
    if (!fctx) return;

    // Background CRT Cyber Black
    fctx.fillStyle = "#06090e";
    fctx.fillRect(0, 0, 800, 500);

    // Scanlines
    fctx.fillStyle = `${themeHex}0a`;
    for (let y = 0; y < 500; y += 4) {
      fctx.fillRect(0, y, 800, 2);
    }

    // Outer & Inner Rounded Border
    fctx.strokeStyle = themeHex;
    fctx.lineWidth = 4;
    fctx.beginPath();
    fctx.roundRect(10, 10, 780, 480, 16);
    fctx.stroke();

    fctx.strokeStyle = `${themeHex}40`;
    fctx.lineWidth = 1.5;
    fctx.beginPath();
    fctx.roundRect(16, 16, 768, 468, 12);
    fctx.stroke();

    // Header
    fctx.fillStyle = themeHex;
    fctx.beginPath();
    fctx.arc(36, 42, 5, 0, Math.PI * 2);
    fctx.fill();

    fctx.font = "bold 20px monospace";
    fctx.fillText("USER PROFILE // NEERAJ.M", 52, 49);

    fctx.font = "bold 17px monospace";
    fctx.fillStyle = `${themeHex}b3`;
    fctx.textAlign = "right";
    fctx.fillText("SECTOR: 0xNEERAJ", 764, 49);
    fctx.textAlign = "left";

    fctx.strokeStyle = `${themeHex}66`;
    fctx.lineWidth = 2;
    fctx.beginPath();
    fctx.moveTo(24, 66);
    fctx.lineTo(776, 66);
    fctx.stroke();

    // Avatar Photo (Left Side)
    fctx.strokeStyle = themeHex;
    fctx.lineWidth = 2;
    fctx.fillStyle = "#000000";
    fctx.beginPath();
    fctx.roundRect(36, 85, 180, 180, 10);
    fctx.fill();
    fctx.stroke();

    if (avatarImg.complete && avatarImg.naturalWidth > 0) {
      const tinted = createTintedAvatarCanvas(avatarImg, themeHex, 172, 172);
      if (tinted) {
        fctx.save();
        fctx.beginPath();
        fctx.roundRect(40, 89, 172, 172, 8);
        fctx.clip();
        fctx.drawImage(tinted, 40, 89, 172, 172);
        fctx.restore();
      } else {
        fctx.drawImage(avatarImg, 40, 89, 172, 172);
      }
    } else {
      fctx.fillStyle = `${themeHex}33`;
      fctx.fillRect(40, 89, 172, 172);
      fctx.fillStyle = themeHex;
      fctx.font = "bold 16px monospace";
      fctx.fillText("[ AVATAR ]", 76, 180);
    }

    fctx.fillStyle = themeHex;
    fctx.font = "bold 14px monospace";
    fctx.textAlign = "center";
    fctx.fillText("[ 0xNEERAJ_AVATAR ]", 126, 288);
    fctx.textAlign = "left";

    // Credentials (Right Side)
    const fields = [
      ["NAME  :", "NEERAJ M"],
      ["ROLE  :", "DEVELOPER / BUILDER"],
      ["AGE   :", String(DEVELOPER_PROFILE.age)],
      ["BASE  :", "KOLLAM, KERALA"],
      ["STUDY :", "BCA @ SNCT"],
      ["EXPIRY:", currentExpiryCode],
    ];

    fields.forEach(([label, val], idx) => {
      const rowY = 112 + idx * 28;
      fctx.font = "bold 17px monospace";
      fctx.fillStyle = `${themeHex}80`;
      fctx.fillText(label, 240, rowY);

      if (label === "EXPIRY:") {
        fctx.fillStyle = themeHex;
        fctx.shadowColor = themeHex;
        fctx.shadowBlur = 6;
        fctx.fillText(val, 335, rowY);
        fctx.shadowBlur = 0;
      } else {
        fctx.fillStyle = themeHex;
        fctx.fillText(val, 335, rowY);
      }
    });

    // Bio / Mission Statement
    fctx.strokeStyle = `${themeHex}66`;
    fctx.lineWidth = 1.5;
    fctx.beginPath();
    fctx.moveTo(24, 308);
    fctx.lineTo(776, 308);
    fctx.stroke();

    fctx.fillStyle = `${themeHex}cc`;
    fctx.font = "bold 15px monospace";
    fctx.fillText("// CORE PRINCIPLE //", 36, 332);

    fctx.fillStyle = themeHex;
    fctx.font = "14px monospace";
    fctx.fillText("Solo Builder & Systems Engineer. Zero-cloud-cost specialist.", 36, 356);
    fctx.fillText("Building scalable full-stack Android, Web & Cloud architectures.", 36, 378);

    // Dynamic Live Cipher Strip
    fctx.strokeStyle = `${themeHex}66`;
    fctx.lineWidth = 1.5;
    fctx.beginPath();
    fctx.moveTo(24, 400);
    fctx.lineTo(776, 400);
    fctx.stroke();

    fctx.fillStyle = `${themeHex}66`;
    fctx.fillRect(24, 412, 752, 34);

    fctx.fillStyle = "#ffffff";
    fctx.shadowColor = themeHex;
    fctx.shadowBlur = 6;
    fctx.font = "bold 14px monospace";
    fctx.fillText(`CIPHER_KEY: ${currentExpiryCode} • SECURE PROTOCOL VERIFIED`, 36, 434);
    fctx.shadowBlur = 0;

    // Bottom Badge
    fctx.font = "bold 12px monospace";
    fctx.fillStyle = `${themeHex}b3`;
    fctx.fillText("ID: SNCT-2026-NM", 36, 474);

    fctx.textAlign = "right";
    fctx.fillText("[ ⟳ DOUBLE-CLICK TO FLIP ]", 764, 474);
    fctx.textAlign = "left";

    frontTexture.needsUpdate = true;
  };

  // 2. PROCEDURAL BACK FACE CANVAS (Artifacts, Tools, Socials & QR)
  const backCanvas = document.createElement("canvas");
  backCanvas.width = 800;
  backCanvas.height = 500;
  const bctx = backCanvas.getContext("2d");

  const backTexture = new THREE.CanvasTexture(backCanvas);
  backTexture.minFilter = THREE.LinearFilter;
  backTexture.magFilter = THREE.LinearFilter;
  backTexture.colorSpace = THREE.SRGBColorSpace;

  const renderBackCard = (themeHex: string = currentThemeHex) => {
    if (!bctx) return;

    bctx.fillStyle = "#06090e";
    bctx.fillRect(0, 0, 800, 500);

    // Scanlines
    bctx.fillStyle = `${themeHex}0a`;
    for (let y = 0; y < 500; y += 4) {
      bctx.fillRect(0, y, 800, 2);
    }

    // Outer & Inner Borders
    bctx.strokeStyle = themeHex;
    bctx.lineWidth = 4;
    bctx.beginPath();
    bctx.roundRect(10, 10, 780, 480, 16);
    bctx.stroke();

    bctx.strokeStyle = `${themeHex}40`;
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.roundRect(16, 16, 768, 468, 12);
    bctx.stroke();

    // Header
    bctx.fillStyle = themeHex;
    bctx.beginPath();
    bctx.arc(36, 42, 5, 0, Math.PI * 2);
    bctx.fill();

    bctx.font = "bold 20px monospace";
    bctx.fillText("0xNEERAJ // ARTIFACTS", 52, 49);

    bctx.font = "bold 17px monospace";
    bctx.fillStyle = `${themeHex}b3`;
    bctx.textAlign = "right";
    bctx.fillText("SPEC: PRODUCTION", 764, 49);
    bctx.textAlign = "left";

    bctx.strokeStyle = `${themeHex}66`;
    bctx.lineWidth = 2;
    bctx.beginPath();
    bctx.moveTo(24, 66);
    bctx.lineTo(776, 66);
    bctx.stroke();

    // 01 — BUILDING
    bctx.fillStyle = `${themeHex}8c`;
    bctx.font = "bold 14px monospace";
    bctx.fillText("01 — BUILDING (ACTUAL PROJECTS)", 36, 92);

    const projects = [
      ["• KTCC", "TOURNAMENT PLATFORM (APK/WEB)"],
      ["• BROTORAISE", "COMPLAINT MANAGEMENT SYSTEM"],
      ["• TIMEBOX", "GAMIFIED FOCUS (DEV)"],
      ["• INKLAVE", "DOCUMENT READER (DEV)"],
    ];

    projects.forEach(([pName, pDesc], idx) => {
      const rowY = 116 + idx * 24;
      bctx.fillStyle = themeHex;
      bctx.font = "bold 16px monospace";
      bctx.fillText(pName, 36, rowY);

      bctx.fillStyle = `${themeHex}bf`;
      bctx.font = "14px monospace";
      bctx.textAlign = "right";
      bctx.fillText(pDesc, 764, rowY);
      bctx.textAlign = "left";
    });

    // 02 — TOOLS
    bctx.strokeStyle = `${themeHex}4d`;
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.moveTo(24, 218);
    bctx.lineTo(776, 218);
    bctx.stroke();

    bctx.fillStyle = `${themeHex}8c`;
    bctx.font = "bold 14px monospace";
    bctx.fillText("02 — TOOLS (BATTLE-TESTED)", 36, 238);

    bctx.fillStyle = themeHex;
    bctx.font = "bold 15px monospace";
    bctx.fillText("NEXT.JS 15 • TYPESCRIPT • SUPABASE • ANDROID • LINUX • R2", 36, 262);

    // 03 — CONNECT & QR CODE
    bctx.strokeStyle = `${themeHex}4d`;
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.moveTo(24, 282);
    bctx.lineTo(776, 282);
    bctx.stroke();

    bctx.fillStyle = `${themeHex}8c`;
    bctx.font = "bold 14px monospace";
    bctx.fillText("03 — CONNECT", 36, 304);

    bctx.fillStyle = themeHex;
    bctx.font = "15px monospace";
    bctx.fillText("• GITHUB: @neeraajm", 36, 328);
    bctx.fillText("• INSTA:  @neeraajm", 36, 352);
    bctx.fillText("• EMAIL:  hi.neerajm@gmail.com", 36, 376);

    // QR Code Box (Right Side)
    const qrX = 650;
    const qrY = 296;
    const qrS = 96;

    bctx.fillStyle = "#000000";
    bctx.fillRect(qrX, qrY, qrS, qrS);
    bctx.strokeStyle = themeHex;
    bctx.lineWidth = 2;
    bctx.strokeRect(qrX, qrY, qrS, qrS);

    // QR Pattern
    bctx.fillStyle = themeHex;
    const drawQRFinder = (fx: number, fy: number) => {
      bctx.fillRect(fx, fy, 24, 24);
      bctx.clearRect(fx + 4, fy + 4, 16, 16);
      bctx.fillRect(fx + 7, fy + 7, 10, 10);
    };

    drawQRFinder(qrX + 6, qrY + 6);
    drawQRFinder(qrX + qrS - 30, qrY + 6);
    drawQRFinder(qrX + 6, qrY + qrS - 30);

    // Seeded Matrix dots
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if ((row * col + row + col) % 2 === 0) {
          bctx.fillRect(qrX + 34 + col * 5, qrY + 34 + row * 5, 4, 4);
        }
      }
    }

    // Bottom Badge
    bctx.strokeStyle = `${themeHex}4d`;
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.moveTo(24, 412);
    bctx.lineTo(776, 412);
    bctx.stroke();

    bctx.font = "bold 13px monospace";
    bctx.fillStyle = `${themeHex}b3`;
    bctx.fillText("STATUS: ACTIVE // VERIFIED DEVELOPER", 36, 442);

    bctx.textAlign = "right";
    bctx.fillText("[ ⟳ DOUBLE-CLICK TO FLIP ]", 764, 442);
    bctx.textAlign = "left";

    backTexture.needsUpdate = true;
  };

  avatarImg.onload = () => {
    renderFrontCard(currentThemeHex);
  };

  renderFrontCard(DEFAULT_THEME.hex);
  renderBackCard(DEFAULT_THEME.hex);

  // 3. CARD MESH WITH 3D BEVELED SLAB (Credit Card ISO 85.6mm x 53.98mm Proportions)
  const cw = 0.96;
  const ch = 0.60;
  const cRad = 0.036;
  const cDepth = 0.009;

  const halfW = cw / 2;
  const halfH = ch / 2;

  const cardShape = new THREE.Shape();
  cardShape.moveTo(-halfW + cRad, -halfH);
  cardShape.lineTo(halfW - cRad, -halfH);
  cardShape.absarc(halfW - cRad, -halfH + cRad, cRad, -Math.PI / 2, 0, false);
  cardShape.lineTo(halfW, halfH - cRad);
  cardShape.absarc(halfW - cRad, halfH - cRad, cRad, 0, Math.PI / 2, false);
  cardShape.lineTo(-halfW + cRad, halfH);
  cardShape.absarc(-halfW + cRad, halfH - cRad, cRad, Math.PI / 2, Math.PI, false);
  cardShape.lineTo(-halfW, -halfH + cRad);
  cardShape.absarc(-halfW + cRad, -halfH + cRad, cRad, Math.PI, Math.PI * 1.5, false);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: cDepth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.003,
    bevelThickness: 0.003,
  };

  const cardGeo = new THREE.ExtrudeGeometry(cardShape, extrudeSettings);
  const cardMat = new THREE.MeshStandardMaterial({
    color: 0x000803,
    roughness: 0.4,
    metalness: 0.25,
  });

  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  cardMesh.userData = { id: "id-card", interactive: true };

  // Front Face Screen Mesh (Side A)
  const faceGeo = new THREE.ShapeGeometry(cardShape);
  const posAttr = faceGeo.getAttribute("position");
  const uvs: number[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    const u = (px + halfW) / (2 * halfW);
    const v = (py + halfH) / (2 * halfH);
    uvs.push(u, v);
  }
  faceGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  const frontMat = new THREE.MeshBasicMaterial({
    map: frontTexture,
    toneMapped: false,
  });
  const frontMesh = new THREE.Mesh(faceGeo, frontMat);
  frontMesh.position.set(0, 0, cDepth + 0.008);
  cardMesh.add(frontMesh);

  // Back Face Screen Mesh (Side B)
  const backFaceGeo = new THREE.ShapeGeometry(cardShape);
  const backUvs: number[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    const u = 1 - (px + halfW) / (2 * halfW);
    const v = (py + halfH) / (2 * halfH);
    backUvs.push(u, v);
  }
  backFaceGeo.setAttribute("uv", new THREE.Float32BufferAttribute(backUvs, 2));

  const backMat = new THREE.MeshBasicMaterial({
    map: backTexture,
    toneMapped: false,
  });
  const backMesh = new THREE.Mesh(backFaceGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.set(0, 0, -0.008);
  cardMesh.add(backMesh);

  // Wireframe Edge Highlight with rounded filleted contours
  const cardEdges = new THREE.EdgesGeometry(cardGeo, 20);
  const edgeMat = new THREE.LineBasicMaterial({
    color: DEFAULT_THEME.threeColor,
    transparent: true,
    opacity: 0.8,
  });
  const wire = new THREE.LineSegments(cardEdges, edgeMat);
  cardMesh.add(wire);

  // Place card flat on table surface with flip rotation state
  cardMesh.rotation.x = -Math.PI / 2;
  cardMesh.position.set(0, 0.012, 0);
  group.add(cardMesh);

  let targetFlip = 0; // 0 for front, Math.PI for back
  let currentFlip = 0;

  const setFacing = (facing: "front" | "back") => {
    targetFlip = facing === "back" ? Math.PI : 0;
  };

  const updateCard = (delta: number) => {
    // Only cycle cipher code every 2.8s when front face is visible, avoiding continuous GPU texture stalls
    if (currentFlip < Math.PI / 3) {
      matrixTimer += delta;
      if (matrixTimer > 2.8) {
        matrixTimer = 0;
        currentExpiryCode = getRandomMatrixCode();
        renderFrontCard(currentThemeHex);
      }
    }

    // Smooth physical turnover flip animation over the horizontal axis
    if (Math.abs(targetFlip - currentFlip) > 0.001) {
      currentFlip += (targetFlip - currentFlip) * 0.14;
      cardMesh.rotation.x = -Math.PI / 2 + currentFlip;
      const liftProgress = Math.sin((currentFlip / Math.PI) * Math.PI);
      cardMesh.position.y = 0.012 + liftProgress * 0.45;
    }
  };

  const setTheme = (theme: WorkstationTheme) => {
    currentThemeHex = theme.hex;
    edgeMat.color.setHex(theme.threeColor);
    renderFrontCard(theme.hex);
    renderBackCard(theme.hex);
  };

  return { group, cardMesh, updateCard, setFacing, setTheme };
}
