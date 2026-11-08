import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * 3D Tactical Digital Wristwatch with Dynamic IST Canvas Display
 * Laid down casually on the front-left corner of the desk, showing synchronized IST time.
 * Corrected right-side-up, centered, un-mirrored UV texture mapping.
 */
export function createWatchMesh(): {
  group: THREE.Group;
  watchHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
  updateWatch: (delta: number) => void;
} {
  const group = new THREE.Group();
  group.name = "digital-watch-system";

  // 1. CASUAL LAY-DOWN POSITION ON FRONT-LEFT DESK WING
  const WATCH_POS = new THREE.Vector3(-5.2, 0.028, 3.6);
  const WATCH_ROT_Y = Math.PI / 5; // Casual ~36° angle towards operator
  const WATCH_ROT_X = 0.08; // Subtle ergonomic tilt

  group.position.copy(WATCH_POS);
  group.rotation.y = WATCH_ROT_Y;
  group.rotation.x = WATCH_ROT_X;

  // 2. HITBOX FOR RAYCASTING
  const hitboxGeo = new THREE.BoxGeometry(1.0, 0.5, 1.0);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const watchHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  watchHitbox.position.set(0, 0.25, 0);
  watchHitbox.userData = { id: "watch", interactive: true };
  group.add(watchHitbox);

  // 3. DYNAMIC LCD CANVAS TEXTURE (256x256 authored in 512-space)
  const WATCH_SCALE_TEX = 0.5;
  const canvas = document.createElement("canvas");
  canvas.width = 512 * WATCH_SCALE_TEX;
  canvas.height = 512 * WATCH_SCALE_TEX;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(WATCH_SCALE_TEX, 0, 0, WATCH_SCALE_TEX, 0, 0);
  }

  // Correct texture orientation: Rotate 90° to the left (counter-clockwise) from previous angle
  const watchTexture = new THREE.CanvasTexture(canvas);
  watchTexture.center.set(0.5, 0.5);
  watchTexture.rotation = Math.PI;
  watchTexture.repeat.set(-1, 1);
  watchTexture.flipY = false;
  watchTexture.minFilter = THREE.LinearFilter;
  watchTexture.magFilter = THREE.LinearFilter;
  watchTexture.colorSpace = THREE.SRGBColorSpace;

  let currentThemeHex = DEFAULT_THEME.hex;
  let lastSec = -1;

  const renderWatchFace = () => {
    if (!ctx) return;

    // Dark LCD backlight background
    ctx.fillStyle = "#04080e";
    ctx.fillRect(0, 0, 512, 512);

    // Subtle LCD matrix grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Manual IST formatting (UTC+5:30) avoids costly Intl lookups every tick
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const istTimeStr = `${String(istNow.getUTCHours()).padStart(2, "0")}:${String(
      istNow.getUTCMinutes()
    ).padStart(2, "0")}:${String(istNow.getUTCSeconds()).padStart(2, "0")}`;

    const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
      istNow.getUTCDay()
    ];

    const monthDay = `${istNow.getUTCMonth() + 1}/${istNow.getUTCDate()}`;

    // Center all text horizontally inside the circular LCD bezel
    ctx.textAlign = "center";

    // Top Header: DAY & DATE • IST 24H
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = `${currentThemeHex}cc`;
    ctx.fillText(`${dayName}  ${monthDay} • 24H`, 256, 125);

    // Decorative top divider line
    ctx.strokeStyle = `${currentThemeHex}66`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(75, 155);
    ctx.lineTo(437, 155);
    ctx.stroke();

    // Main Time: HH:MM:SS
    ctx.font = "bold 68px monospace";
    ctx.fillStyle = currentThemeHex;
    ctx.fillText(istTimeStr, 256, 255);

    // Decorative bottom divider line
    ctx.beginPath();
    ctx.moveTo(90, 295);
    ctx.lineTo(422, 295);
    ctx.stroke();

    // Sub-text: WATER RESIST / CHRONO
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = `${currentThemeHex}99`;
    ctx.fillText("WR 50M • TACTICAL CHRONO", 256, 345);

    ctx.font = "bold 18px monospace";
    ctx.fillStyle = `${currentThemeHex}80`;
    ctx.fillText("NEERAJ_M // ATOMIC_SYNC", 256, 395);

    watchTexture.needsUpdate = true;
  };

  renderWatchFace();

  // 4. MODEL LOADING WITH PROCEDURAL FALLBACK
  const modelContainer = new THREE.Group();
  group.add(modelContainer);

  let faceMaterial: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null = null;
  const wireMaterials: THREE.LineBasicMaterial[] = [];

  // Realistic watch dimensions: 12.5x scale brings model to sleek ~0.9 units across desk
  const WATCH_SCALE = 12.5;

  // Fallback while loading
  const fallbackGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 16);
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: 0x0c121a,
    roughness: 0.4,
    metalness: 0.5,
  });
  const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
  fallbackMesh.position.set(0, 0.09, 0);
  modelContainer.add(fallbackMesh);

  const loader = new GLTFLoader();
  loader.load(
    "/models/digital_watch.glb",
    (gltf) => {
      modelContainer.remove(fallbackMesh);
      fallbackGeo.dispose();
      fallbackMat.dispose();

      const watchScene = gltf.scene;
      watchScene.scale.set(WATCH_SCALE, WATCH_SCALE, WATCH_SCALE);

      // Lay down flat on its side/strap with face tilted up towards user
      watchScene.rotation.set(-0.25, 0.35, -Math.PI / 2);
      watchScene.position.set(0, 0.16, 0); // Elevation so side rests flush on tabletop

      watchScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (
            mesh.name.toLowerCase().includes("face") ||
            (mesh.material && (mesh.material as THREE.Material).name.toLowerCase().includes("face"))
          ) {
            const mat = new THREE.MeshStandardMaterial({
              map: watchTexture,
              emissiveMap: watchTexture,
              emissive: new THREE.Color(currentThemeHex),
              emissiveIntensity: 1.4,
              roughness: 0.15,
              metalness: 0.6,
            });
            mesh.material = mat;
            faceMaterial = mat;
          }

          // Subtle neon wireframe contour
          const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
          const wireMat = new THREE.LineBasicMaterial({
            color: DEFAULT_THEME.threeColor,
            transparent: true,
            opacity: 0.3,
          });
          const wire = new THREE.LineSegments(edges, wireMat);
          mesh.add(wire);
          wireMaterials.push(wireMat);
        }
      });

      modelContainer.add(watchScene);
    },
    undefined,
    (err) => console.warn("Could not load /models/digital_watch.glb:", err)
  );

  // 5. UPDATE TICK
  const updateWatch = () => {
    const currentSec = new Date().getSeconds();
    if (currentSec !== lastSec) {
      lastSec = currentSec;
      renderWatchFace();
    }
  };

  const setTheme = (theme: WorkstationTheme) => {
    currentThemeHex = theme.hex;
    wireMaterials.forEach((m) => m.color.setHex(theme.threeColor));
    if (faceMaterial) {
      faceMaterial.emissive.setHex(theme.threeColor);
    }
    renderWatchFace();
  };

  return {
    group,
    watchHitbox,
    setTheme,
    updateWatch,
  };
}
