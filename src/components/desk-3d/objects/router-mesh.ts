import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";

/**
 * 3D Cyber Battlestation Gateway Router (Gigabit Dual-Band AC2600)
 * Features Dynamic Texture-Based LED Activity:
 * - First 4 active lights from the left remain completely STATIC (solid online power/link).
 * - Remaining lights on the right actively blink/flicker with real network packet throughput.
 */
export function createRouterMesh(): {
  group: THREE.Group;
  routerHitbox: THREE.Mesh;
  setTheme: (theme: WorkstationTheme) => void;
  updateRouter: (delta: number) => void;
} {
  const group = new THREE.Group();
  group.name = "gateway-router-system";

  // 1. POSITIONING ON MID-LEFT DESK AREA
  const ROUTER_POS = new THREE.Vector3(-4.4, 0.028, -0.6);
  const ROUTER_ROT_Y = -Math.PI / 8; // Angled facing inward towards the operator

  group.position.copy(ROUTER_POS);
  group.rotation.y = ROUTER_ROT_Y;

  // 2. HITBOX FOR RAYCASTING
  const hitboxGeo = new THREE.BoxGeometry(2.0, 1.8, 1.8);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const routerHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  routerHitbox.position.set(0, 0.85, 0);
  routerHitbox.userData = { id: "router", interactive: true };
  group.add(routerHitbox);

  // 3. DYNAMIC EMISSIVE CANVAS TEXTURE (512x512, patch-only updates)
  // Drawn in 1024-space coordinates with a 0.5 transform so existing patch
  // geometry is preserved at half the texel cost.
  const EMISSIVE_SIZE = 512;
  const emissiveCanvas = document.createElement("canvas");
  emissiveCanvas.width = EMISSIVE_SIZE;
  emissiveCanvas.height = EMISSIVE_SIZE;
  const eCtx = emissiveCanvas.getContext("2d");
  if (eCtx) {
    eCtx.setTransform(EMISSIVE_SIZE / 1024, 0, 0, EMISSIVE_SIZE / 1024, 0, 0);
    eCtx.fillStyle = "#000000";
    eCtx.fillRect(0, 0, 1024, 1024);
  }

  const dynamicEmissiveTexture = new THREE.CanvasTexture(emissiveCanvas);
  dynamicEmissiveTexture.flipY = false;
  dynamicEmissiveTexture.colorSpace = THREE.SRGBColorSpace;

  let currentThemeHex = DEFAULT_THEME.hex;
  let sourceEmissiveImg: CanvasImageSource | null = null;
  let routerMaterial: THREE.MeshStandardMaterial | null = null;
  const wireMaterials: THREE.LineBasicMaterial[] = [];

  // A) First 4 lights from the left: STATIC ON (Solid Power, SYS, WAN, 2.4G)
  const staticPatches = [
    { x: 92, y: 581, w: 29, h: 20 },      // 0: Power Icon
    { x: 630, y: 77, w: 31, h: 31 },      // 1: Status LED 1 (SYS)
    { x: 454, y: 581, w: 25, h: 19 },     // 2: Status LED 2 (WAN / Internet Link)
    { x: 928, y: 934, w: 22, h: 33 },     // 3: Status LED 3 (2.4GHz Wi-Fi Solid Link)
  ];

  // B) Remaining lights on the right: DYNAMIC PACKET ACTIVITY (LAN & 5G Shimmer)
  const dynamicPatches = [
    { x: 479, y: 581, w: 24, h: 19, type: "lan_burst" },  // LAN Active Data Stream
    { x: 898, y: 155, w: 44, h: 33, type: "wifi_pulse" }, // 5GHz Wi-Fi Packet Shimmer
    { x: 950, y: 934, w: 21, h: 33, type: "probe_ping" }, // Probe / Activity Blip
  ];

  // Procedural Fallback while loading
  const modelContainer = new THREE.Group();
  group.add(modelContainer);

  const fallbackGeo = new THREE.BoxGeometry(1.4, 0.25, 1.0);
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: 0x070c14,
    roughness: 0.5,
    metalness: 0.4,
  });
  const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
  fallbackMesh.position.set(0, 0.12, 0);
  modelContainer.add(fallbackMesh);

  const ROUTER_SCALE = 8.5;
  const ROUTER_ELEVATION = 0.288;

  const loader = new GLTFLoader();
  loader.load(
    "/models/router.glb",
    (gltf) => {
      modelContainer.remove(fallbackMesh);
      fallbackGeo.dispose();
      fallbackMat.dispose();

      const routerScene = gltf.scene;
      routerScene.scale.set(ROUTER_SCALE, ROUTER_SCALE, ROUTER_SCALE);
      routerScene.position.set(0, ROUTER_ELEVATION, 0);

      routerScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const origMat = mesh.material as THREE.MeshStandardMaterial;
          if (origMat) {
            // Grab the original GLTF emissive texture image for dynamic canvas drawing
            if (origMat.emissiveMap && origMat.emissiveMap.image) {
              sourceEmissiveImg = origMat.emissiveMap.image as CanvasImageSource;
            }

            const clonedMat = origMat.clone();
            clonedMat.emissive = new THREE.Color(currentThemeHex);
            clonedMat.emissiveMap = dynamicEmissiveTexture;
            clonedMat.emissiveIntensity = 2.8;
            mesh.material = clonedMat;
            routerMaterial = clonedMat;
          }

          // Cyber wireframe edges
          const edges = new THREE.EdgesGeometry(mesh.geometry, 26);
          const wireMat = new THREE.LineBasicMaterial({
            color: DEFAULT_THEME.threeColor,
            transparent: true,
            opacity: 0.35,
          });
          const wire = new THREE.LineSegments(edges, wireMat);
          mesh.add(wire);
          wireMaterials.push(wireMat);
        }
      });

      modelContainer.add(routerScene);
      // Static LED patches now have access to the source emissive image.
      renderStaticPatches();
      renderDynamicPatches();
    },
    undefined,
    (err) => console.warn("Could not load /models/router.glb:", err)
  );

  // 4. ANIMATE INDEPENDENT TEXTURE PATCHES DIRECTLY ON THE ROUTER'S MATERIAL
  let time = 0;
  let textureAccumulator = 0;

  const paintPatch = (
    p: { x: number; y: number; w: number; h: number },
    alpha: number
  ) => {
    if (!eCtx) return;
    eCtx.save();
    eCtx.globalAlpha = alpha;
    eCtx.clearRect(p.x, p.y, p.w, p.h);
    if (sourceEmissiveImg) {
      eCtx.drawImage(sourceEmissiveImg, p.x, p.y, p.w, p.h, p.x, p.y, p.w, p.h);
    } else {
      eCtx.fillStyle = currentThemeHex;
      eCtx.fillRect(p.x, p.y, p.w, p.h);
    }
    eCtx.restore();
  };

  const renderStaticPatches = () => {
    staticPatches.forEach((p) => paintPatch(p, 1.0));
    dynamicEmissiveTexture.needsUpdate = true;
  };

  const renderDynamicPatches = () => {
    const lanBurst = (Math.sin(time * 4.6) > -0.6) ? (Math.sin(time * 26.0) > 0.0 ? 1.0 : 0.12) : 0.18;
    const wifiShimmer = 0.35 + Math.sin(time * 16.5) * 0.65;
    const pingCycle = (time * 1.6) % 3.0;
    const probePing = (pingCycle < 0.14 || (pingCycle > 0.24 && pingCycle < 0.38)) ? 1.0 : 0.12;

    dynamicPatches.forEach((p) => {
      let a = 1.0;
      if (p.type === "lan_burst") a = lanBurst;
      else if (p.type === "wifi_pulse") a = wifiShimmer;
      else if (p.type === "probe_ping") a = probePing;

      // Repaint every dynamic patch (clearing stale brightness) but only
      // touch the small patch rectangles instead of the full canvas.
      paintPatch(p, Math.max(0, Math.min(1, a)));
    });

    dynamicEmissiveTexture.needsUpdate = true;
  };

  renderStaticPatches();
  renderDynamicPatches();

  const updateRouter = (delta: number) => {
    time += delta;
    if (!eCtx) return;

    // LEDs do not need per-frame texture uploads: ~20 Hz is visually smooth
    // while cutting canvas work and GPU uploads by an order of magnitude.
    textureAccumulator += delta;
    if (textureAccumulator < 0.05) return;
    textureAccumulator = 0;

    renderDynamicPatches();
  };

  const setTheme = (theme: WorkstationTheme) => {
    currentThemeHex = theme.hex;
    if (routerMaterial) {
      routerMaterial.emissive.setHex(theme.threeColor);
    }
    wireMaterials.forEach((m) => {
      m.color.setHex(theme.threeColor);
    });
    // Fallback patches are painted with the raw theme color.
    if (!sourceEmissiveImg) {
      renderStaticPatches();
      renderDynamicPatches();
    }
  };

  return {
    group,
    routerHitbox,
    setTheme,
    updateRouter,
  };
}
