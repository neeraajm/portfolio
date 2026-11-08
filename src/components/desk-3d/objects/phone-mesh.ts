import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";
import {
  PHONE_WALLPAPERS,
  getStoredWallpaperId,
  getWallpaperById,
  createTintedWallpaperCanvas,
  onWallpaperChange,
} from "@/lib/phone-wallpapers";

/**
 * 3D Modern Smartphone Prop (Realme / Android Quad-Camera Form Factor)
 * Custom Standby OLED Screen with Dynamic Tinted Wallpaper & Live Telemetry
 * Model Attribution: "Mobile phone" (https://skfb.ly/ouyRM) by Alain Sorazu licensed under CC BY-SA 4.0
 */
export function createPhoneMesh(): {
  group: THREE.Group;
  phoneHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
} {
  const group = new THREE.Group();
  group.name = "phone-prop-system";

  const phoneAnchor = new THREE.Group();
  group.add(phoneAnchor);

  // 1. INVISIBLE HITBOX FOR FAST RAYCASTING & INTERACTION
  const hitboxGeo = new THREE.BoxGeometry(1.10, 0.40, 1.95);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const phoneHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  phoneHitbox.position.set(0, 0.10, 0);
  phoneHitbox.userData = { id: "phone", interactive: true };
  phoneAnchor.add(phoneHitbox);

  // 2. SLEEK DARK STANDBY OLED SCREEN CANVAS TEXTURE
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");

  let currentThemeHex = DEFAULT_THEME.hex;
  let currentWallpaperId = getStoredWallpaperId();

  // Preload KTCC App Icon once
  const ktccLogoImg = new Image();
  ktccLogoImg.src = "/phone/icons/logo-rounded.png";
  ktccLogoImg.onload = () => {
    renderPhoneScreen();
    screenTexture.needsUpdate = true;
  };

  // Cache loaded wallpaper images
  const loadedImages = new Map<string, HTMLImageElement>();
  PHONE_WALLPAPERS.forEach((wp) => {
    const img = new Image();
    img.src = wp.src;
    img.onload = () => {
      loadedImages.set(wp.id, img);
      if (wp.id === currentWallpaperId) {
        renderPhoneScreen();
        screenTexture.needsUpdate = true;
      }
    };
  });

  const getLiveTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  const renderPhoneScreen = (
    themeHex: string = currentThemeHex,
    timeStr: string = getLiveTime(),
    wallpaperId: string = currentWallpaperId
  ) => {
    if (!ctx) return;
    currentThemeHex = themeHex;
    currentWallpaperId = wallpaperId;

    ctx.clearRect(0, 0, 480, 960);

    const activeWp = getWallpaperById(currentWallpaperId);
    const bgImg = loadedImages.get(currentWallpaperId);

    if (bgImg) {
      const tintedCanvas = createTintedWallpaperCanvas(bgImg, themeHex, 480, 960, activeWp);
      ctx.drawImage(tintedCanvas, 0, 0, 480, 960);
    } else {
      // Deep OLED True Black background
      ctx.fillStyle = "#020509";
      ctx.fillRect(0, 0, 480, 960);
    }

    // Subtle Cyber Grid Matrix Overlay
    ctx.strokeStyle = `${themeHex}10`;
    ctx.lineWidth = 1;
    for (let x = 0; x < 480; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 960);
      ctx.stroke();
    }

    // Teardrop Camera Notch Housing (Top Center)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(240, 24, 18, 0, Math.PI);
    ctx.fill();

    // Camera Lens Dot & Sensor
    ctx.fillStyle = "#050d18";
    ctx.beginPath();
    ctx.arc(240, 18, 7, 0, Math.PI * 2);
    ctx.fill();

    // Status Bar Telemetry - Left Time (Orbitron 700)
    ctx.textAlign = "left";
    ctx.font = "700 20px Orbitron, monospace";
    ctx.fillStyle = "#e4e4e7";
    ctx.fillText(timeStr, 36, 48);

    // Status Bar - Right: Wi-Fi Icon + 100% Battery (Orbitron 700)
    const wx = 345;
    const wy = 48;
    ctx.fillStyle = themeHex;
    ctx.strokeStyle = themeHex;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.arc(wx, wy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(wx, wy - 3, 8, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(wx, wy - 3, 14, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 17px Orbitron, monospace";
    ctx.fillStyle = themeHex;
    ctx.fillText("100%", 372, 48);

    // 🟢 UPPER APP GRID (y: 200)
    // 1. KTCC Flagship App (Real logo-rounded.png)
    drawDeskKtccIcon(ctx, 95, 200, ktccLogoImg, themeHex);

    // 🟢 BOTTOM QUICK ACCESS DOCK (y: 780)
    drawDeskAppIcon(ctx, 165, 780, "Wallpapers", themeHex, "palette");
    drawDeskAppIcon(ctx, 315, 780, "Terminal", themeHex, "terminal");

    // Bottom 3-Button Mobile Navigation Bar (Back ◀, Home ○, Recents □)
    const navY = 900;
    const navH = 60;

    ctx.fillStyle = "rgba(4, 7, 13, 0.95)";
    ctx.fillRect(0, navY, 480, navH);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, navY);
    ctx.lineTo(480, navY);
    ctx.stroke();

    // 1. Back Button (Left: Triangle ◀)
    ctx.fillStyle = "#a1a1aa";
    ctx.beginPath();
    ctx.moveTo(92, 930 - 9);
    ctx.lineTo(80, 930);
    ctx.lineTo(92, 930 + 9);
    ctx.closePath();
    ctx.fill();

    // 2. Home Button (Center: Circle ○)
    ctx.strokeStyle = "#a1a1aa";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(240, 930, 9, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Recents Button (Right: Square □)
    ctx.strokeStyle = "#a1a1aa";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(388 - 7, 930 - 7, 15, 15, 2);
    ctx.stroke();
    ctx.textAlign = "left";
  };

  const screenTexture = new THREE.CanvasTexture(canvas);
  screenTexture.minFilter = THREE.LinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  renderPhoneScreen();

  // Listen to wallpaper changes from inspect modal
  const unsubscribeWallpaper = onWallpaperChange((newId) => {
    currentWallpaperId = newId;
    renderPhoneScreen(currentThemeHex, getLiveTime(), newId);
    screenTexture.needsUpdate = true;
  });

  // Ensure Orbitron font is loaded and triggers texture re-render
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      renderPhoneScreen();
      screenTexture.needsUpdate = true;
    });
  }

  // Live time updater on table desk phone screen: the visible clock only shows
  // HH:MM, so repaint once per minute instead of every second.
  let lastRenderedTime = getLiveTime();
  const timeInterval = setInterval(() => {
    const nowTime = getLiveTime();
    if (nowTime === lastRenderedTime) return;
    lastRenderedTime = nowTime;
    renderPhoneScreen(currentThemeHex, nowTime);
    screenTexture.needsUpdate = true;
  }, 1000);

  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
  });

  // 3. PROCEDURAL FALLBACK MESH (Displayed while GLB is loading)
  const modelContainer = new THREE.Group();
  phoneAnchor.add(modelContainer);

  const fallbackGeo = new THREE.BoxGeometry(0.95, 0.08, 1.86);
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: 0x080c14,
    roughness: 0.35,
    metalness: 0.85,
  });
  const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
  fallbackMesh.position.set(0, 0.04, 0);
  modelContainer.add(fallbackMesh);

  // 4. LOAD REALISTIC 3D SMARTPHONE GLB MODEL
  const loader = new GLTFLoader();
  loader.load(
    "/models/phone.glb",
    (gltf) => {
      modelContainer.remove(fallbackMesh);
      fallbackGeo.dispose();
      fallbackMat.dispose();

      const phoneScene = gltf.scene;

      // Scale model to match realistic scale relative to ASUS TUF 15.6" chassis
      const PHONE_SCALE = 9.8;
      phoneScene.scale.set(PHONE_SCALE, PHONE_SCALE, PHONE_SCALE);
      phoneScene.rotation.x = -Math.PI / 2; // Lay flat on desk surface
      phoneScene.position.set(0, 0.052, 0.93); // Center origin along Z

      phoneScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const matName = (mesh.material as THREE.Material)?.name || "";

          // Screen Mesh Surface: Remap UVs & assign OLED screen texture
          if (matName.toLowerCase().includes("screen") || mesh.name === "Object_9") {
            const pos = mesh.geometry.getAttribute("position");
            if (pos) {
              const minX = -1.2117, maxX = 1.2132;
              const minZ = -5.1522, maxZ = -0.0973;
              const uvs: number[] = [];
              for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const z = pos.getZ(i);
                const u = (x - minX) / (maxX - minX);
                const v = (maxZ - z) / (maxZ - minZ);
                uvs.push(u, v);
              }
              mesh.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
            }
            mesh.material = screenMat;
            screenTexture.needsUpdate = true;
          } else if (matName.toLowerCase().includes("case") || mesh.name === "Object_8") {
            // Sleek dark space-gray / titanium chassis with satin sheen
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x1a2432,
              roughness: 0.28,
              metalness: 0.70,
            });
          } else if (matName.toLowerCase().includes("white") || mesh.name === "Object_4") {
            // Precision CNC diamond-cut gunmetal titanium camera bezel rings
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x2e3c50,
              roughness: 0.22,
              metalness: 0.88,
            });
          } else if (mesh.name === "Object_5" || matName === "Camera.001") {
            // Deep dark optical lens core and aperture
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x060b14,
              roughness: 0.12,
              metalness: 0.90,
            });
          } else if (mesh.name === "Object_6" || matName === "Camera.002") {
            // High-gloss optical sapphire camera glass (fast MeshStandardMaterial without transmission pass)
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x121e30,
              roughness: 0.08,
              metalness: 0.85,
            });
          } else if (matName.toLowerCase().includes("black") || mesh.name === "Object_10") {
            // Dark glossy camera island bump backing plate
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x0d1420,
              roughness: 0.18,
              metalness: 0.75,
            });
          } else if (matName.toLowerCase().includes("flash") || mesh.name === "Object_7") {
            // Dual-tone camera LED flash
            mesh.material = new THREE.MeshBasicMaterial({
              color: 0xfffaed,
            });
          } else if (matName.toLowerCase().includes("button") || mesh.name === "Object_11") {
            // Metallic power/volume buttons
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x1a2332,
              roughness: 0.4,
              metalness: 0.8,
            });
          }
        }
      });

      modelContainer.add(phoneScene);
    },
    undefined,
    (error) => {
      console.warn("Failed to load /models/phone.glb, using procedural fallback:", error);
    }
  );

  return {
    group,
    phoneHitbox,
    setTheme: (theme: WorkstationTheme) => {
      renderPhoneScreen(theme.hex);
      screenTexture.needsUpdate = true;
    },
  };
}

function drawDeskAppIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  themeHex: string,
  iconType: "palette" | "game" | "terminal"
) {
  const iconSize = 68;
  const ix = x - iconSize / 2;
  const iy = y - iconSize / 2;

  ctx.save();
  ctx.fillStyle = "rgba(6, 10, 18, 0.85)";
  ctx.strokeStyle = `${themeHex}99`;
  ctx.lineWidth = 2;
  ctx.shadowColor = `${themeHex}66`;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(ix, iy, iconSize, iconSize, 16);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = themeHex;
  ctx.fillStyle = themeHex;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (iconType === "palette") {
    ctx.beginPath();
    ctx.arc(x, y - 2, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - 6, y - 8, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 8, 3, 0, Math.PI * 2);
    ctx.arc(x - 8, y + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconType === "game") {
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 10, 28, 18, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 8, y - 1);
    ctx.lineTo(x - 4, y - 1);
    ctx.moveTo(x - 6, y - 3);
    ctx.lineTo(x - 6, y + 1);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 6, y - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconType === "terminal") {
    ctx.beginPath();
    ctx.roundRect(x - 15, y - 12, 30, 22, 4);
    ctx.stroke();

    ctx.font = "900 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(">_", x, y + 3);
  }

  ctx.restore();

  ctx.textAlign = "center";
  ctx.font = "700 11px Orbitron, monospace";
  ctx.fillStyle = "#e4e4e7";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 4;
  ctx.fillText(label, x, y + iconSize / 2 + 16);
  ctx.shadowBlur = 0;
}

/**
 * Draws real KTCC App Icon on the desk prop screen
 */
function drawDeskKtccIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  img: HTMLImageElement,
  themeHex: string
) {
  const iconSize = 68;
  const ix = x - iconSize / 2;
  const iy = y - iconSize / 2;

  ctx.save();
  ctx.fillStyle = "rgba(6, 10, 18, 0.92)";
  ctx.strokeStyle = `${themeHex}aa`;
  ctx.lineWidth = 2;
  ctx.shadowColor = `${themeHex}66`;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(ix, iy, iconSize, iconSize, 16);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(ix + 2, iy + 2, iconSize - 4, iconSize - 4, 14);
    ctx.clip();
    ctx.drawImage(img, ix + 2, iy + 2, iconSize - 4, iconSize - 4);
    ctx.restore();
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.font = "700 12px Orbitron, monospace";
  ctx.fillStyle = "#e4e4e7";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 4;
  ctx.fillText("KTCC", x, y + iconSize / 2 + 16);
  ctx.shadowBlur = 0;
}

/**
 * Draws placeholder app icon on the desk prop screen
 */
function drawDeskPlaceholderIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  themeHex: string
) {
  const iconSize = 68;
  const ix = x - iconSize / 2;
  const iy = y - iconSize / 2;

  ctx.save();
  ctx.fillStyle = "rgba(8, 12, 20, 0.75)";
  ctx.strokeStyle = `${themeHex}44`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.roundRect(ix, iy, iconSize, iconSize, 16);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = `${themeHex}88`;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 8);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.font = "700 9.5px Orbitron, monospace";
  ctx.fillStyle = "#9ca3af";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 4;
  ctx.fillText(label, x, y + iconSize / 2 + 16);
  ctx.shadowBlur = 0;
}
