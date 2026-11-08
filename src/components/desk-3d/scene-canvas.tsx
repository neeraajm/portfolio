"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sound } from "@/lib/sound";

import { createDeskSurface } from "./objects/desk-surface";
import { createLaptopMesh } from "./objects/laptop-mesh";
import { createIdCardMesh } from "./objects/id-card-mesh";
import { createPhoneMesh } from "./objects/phone-mesh";
import { createCoffeeMesh } from "./objects/coffee-mesh";
import { createChairMesh } from "./objects/chair-mesh";
import { createHologramSphere } from "./objects/hologram-sphere";
import { createMouseMesh } from "./objects/mouse-mesh";
import { createClockMesh } from "./objects/clock-mesh";
import { createRouterMesh } from "./objects/router-mesh";
import { createWatchMesh } from "./objects/watch-mesh";
import { createEthernetCableMesh } from "./objects/ethernet-cable-mesh";
import { createFiberCableMesh } from "./objects/fiber-cable-mesh";
import { createExtensionBoardMesh } from "./objects/extension-board-mesh";

import { WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";
import { TerminalFont, DEFAULT_TERMINAL_FONT } from "@/lib/terminal-fonts";

export type InteractivePropId =
  | "id-card"
  | "laptop"
  | "phone"
  | "coffee"
  | "hologram"
  | "mouse"
  | "clock"
  | "router"
  | "watch"
  | "power-board";

interface SceneCanvasProps {
  onSelectObject: (id: InteractivePropId) => void;
  onReady?: () => void;
  terminalLines?: string[];
  currentInput?: string;
  isPaused?: boolean;
  idCardFacing?: "front" | "back";
  cameraResetCount?: number;
  sipTriggerCount?: number;
  mouseTriggerCount?: number;
  theme?: WorkstationTheme;
  caffeineLevel?: number;
  activeFont?: TerminalFont;
  isPickerActive?: boolean;
}

const getAdaptiveCameraParams = (aspect: number) => {
  if (aspect < 0.65) {
    // Tall mobile portrait (e.g., iPhone 14/15/16 Pro, Galaxy S24, Pixel 8/9)
    return { fov: 58, baseDist: 15.5, minDist: 5.5, maxDist: 38.0, targetElevation: 0.72 };
  } else if (aspect < 0.85) {
    // Standard mobile / tablet portrait
    return { fov: 52, baseDist: 13.0, minDist: 5.0, maxDist: 40.0, targetElevation: 0.66 };
  } else if (aspect < 1.15) {
    // Square / iPad portrait
    return { fov: 47, baseDist: 11.2, minDist: 4.8, maxDist: 42.0, targetElevation: 0.62 };
  } else {
    // Desktop / Landscape
    return { fov: 42, baseDist: 9.4, minDist: 4.6, maxDist: 46.0, targetElevation: 0.58 };
  }
};

export function SceneCanvas({
  onSelectObject,
  onReady,
  terminalLines,
  currentInput = "",
  isPaused = false,
  idCardFacing = "front",
  cameraResetCount = 0,
  sipTriggerCount = 0,
  mouseTriggerCount = 0,
  theme = DEFAULT_THEME,
  caffeineLevel = 100,
  activeFont = DEFAULT_TERMINAL_FONT,
  isPickerActive = false,
}: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const updateScreenRef = useRef<
    (
      lines?: string[],
      currentInput?: string,
      themeHex?: string,
      font?: TerminalFont,
      isPickerActive?: boolean
    ) => void
  >(null);
  const setCardFacingRef = useRef<((facing: "front" | "back") => void) | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);
  const updateThemeRef = useRef<((theme: WorkstationTheme) => void) | null>(null);
  const setCoffeeLevelRef = useRef<((level: number) => void) | null>(null);
  const triggerCoffeeSipRef = useRef<(() => void) | null>(null);
  const triggerMouseClickRef = useRef<(() => void) | null>(null);
  const isPausedRef = useRef(isPaused);
  const onSelectObjectRef = useRef(onSelectObject);
  const onReadyRef = useRef(onReady);
  const terminalLinesRef = useRef(terminalLines);
  const currentInputRef = useRef(currentInput);
  const idCardFacingRef = useRef(idCardFacing);
  const themeRef = useRef(theme);
  const activeFontRef = useRef(activeFont);
  const isPickerActiveRef = useRef(isPickerActive);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (mouseTriggerCount > 0 && triggerMouseClickRef.current) {
      triggerMouseClickRef.current();
    }
  }, [mouseTriggerCount]);

  useEffect(() => {
    if (sipTriggerCount > 0 && triggerCoffeeSipRef.current) {
      triggerCoffeeSipRef.current();
    }
  }, [sipTriggerCount]);

  useEffect(() => {
    themeRef.current = theme;
    if (updateThemeRef.current) {
      updateThemeRef.current(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (setCoffeeLevelRef.current && caffeineLevel !== undefined) {
      setCoffeeLevelRef.current(caffeineLevel);
    }
  }, [caffeineLevel]);

  useEffect(() => {
    if (cameraResetCount > 0 && resetCameraRef.current) {
      resetCameraRef.current();
    }
  }, [cameraResetCount]);

  useEffect(() => {
    idCardFacingRef.current = idCardFacing;
    if (setCardFacingRef.current) {
      setCardFacingRef.current(idCardFacing);
    }
  }, [idCardFacing]);

  useEffect(() => {
    terminalLinesRef.current = terminalLines;
    currentInputRef.current = currentInput;
    activeFontRef.current = activeFont;
    isPickerActiveRef.current = isPickerActive;
    if (updateScreenRef.current) {
      updateScreenRef.current(
        terminalLines,
        currentInput,
        themeRef.current.hex,
        activeFontRef.current,
        isPickerActive
      );
    }
  }, [terminalLines, currentInput, activeFont, isPickerActive]);

  useEffect(() => {
    onSelectObjectRef.current = onSelectObject;
  }, [onSelectObject]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. OPTIMIZED SCENE & RENDERER SETUP (Gentle on GPU with High-Precision Depth)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // Atmospheric exponential distance fog
    scene.fog = new THREE.FogExp2(0x000000, 0.016);

    const initialWidth = Math.max(1, container.clientWidth || window.innerWidth || 1920);
    const initialHeight = Math.max(1, container.clientHeight || window.innerHeight || 1080);
    const initialAspect = initialWidth / initialHeight;
    const initialParams = getAdaptiveCameraParams(initialAspect);

    // Tight clipping planes (0.4 to 140) dramatically improve mobile depth buffer accuracy and eliminate z-fighting
    const camera = new THREE.PerspectiveCamera(
      initialParams.fov,
      initialAspect,
      0.4,
      140
    );
    const initialCamPos = new THREE.Vector3(0, 5.6, 7.6);
    const initialTarget = new THREE.Vector3(0, 0.8, -0.4);
    camera.position.copy(initialCamPos);
    camera.lookAt(initialTarget);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        precision: "highp",
        depth: true,
        stencil: false,
      });
    } catch {
      // Fallback if WebGL context creation fails
      return;
    }

    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.shadowMap.enabled = false;
    renderer.info.autoReset = true;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // 2. STUDIO 4-POINT CYBER ATMOSPHERE LIGHTING (Balanced fill, key, rim & CRT glow)
    const ambientLight = new THREE.AmbientLight(0x0a1420, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x162636, 0x03060a, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xe2f8f0, 0.95);
    dirLight.position.set(6, 11, 7);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(theme.threeColor, 1.3);
    rimLight.position.set(-6, 8, -7);
    scene.add(rimLight);

    const screenLight = new THREE.PointLight(theme.threeColor, 1.5, 8);
    screenLight.position.set(0, 2.0, 0.4);
    scene.add(screenLight);

    // 3. MOUNT PROCEDURAL 3D OBJECTS & INFINITE GRID FLOOR
    // Infinite Dark Cyber Ground Plane (Physical separation at y = -5.48 prevents z-fighting with grid at -5.38)
    // The plane is effectively a near-black backdrop; a Basic material avoids
    // paying the full PBR light loop for ~2 full-screen megapixels.
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x030508,
      fog: true,
    });
    const floorGeo = new THREE.PlaneGeometry(420, 420);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -5.48, 0);
    scene.add(floorMesh);

    // Infinite Cyberpunk Neon Floor Grid (Elevated cleanly 10cm above ground plane)
    const floorGridDivisions = 190;
    const floorGrid = new THREE.GridHelper(380, floorGridDivisions, theme.threeColor, 0x222222);
    floorGrid.position.set(0, -5.38, 0);
    if (Array.isArray(floorGrid.material)) {
      floorGrid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.38;
      });
    } else {
      floorGrid.material.transparent = true;
      floorGrid.material.opacity = 0.38;
    }
    scene.add(floorGrid);

    const updateGridColors = (grid: THREE.GridHelper, themeColorHex: number) => {
      const colorAttr = grid.geometry.attributes.color as THREE.BufferAttribute;
      if (!colorAttr) return;
      const primaryColor = new THREE.Color(themeColorHex);
      const secondaryColor = new THREE.Color(themeColorHex).multiplyScalar(0.22);
      const array = colorAttr.array as Float32Array;

      const center = floorGridDivisions / 2;
      let j = 0;

      for (let i = 0; i <= floorGridDivisions; i++) {
        const c = i === center ? primaryColor : secondaryColor;
        for (let v = 0; v < 4; v++) {
          if (j + 2 < array.length) {
            array[j] = c.r;
            array[j + 1] = c.g;
            array[j + 2] = c.b;
            j += 3;
          }
        }
      }

      colorAttr.needsUpdate = true;
    };

    const deskSurface = createDeskSurface();
    scene.add(deskSurface);

    const laptop = createLaptopMesh();
    laptop.group.position.set(0, 0.02, 1.75);
    scene.add(laptop.group);
    updateScreenRef.current = laptop.updateScreenTexture;
    laptop.updateScreenTexture(
      terminalLinesRef.current,
      currentInputRef.current,
      themeRef.current.hex,
      activeFontRef.current
    );

    const idCard = createIdCardMesh();
    idCard.group.position.set(-3.8, 0.028, 2.6);
    idCard.group.rotation.y = Math.PI / 16;
    scene.add(idCard.group);
    setCardFacingRef.current = idCard.setFacing;
    idCard.setFacing(idCardFacingRef.current);

    const mouse = createMouseMesh();
    scene.add(mouse.group);
    triggerMouseClickRef.current = mouse.triggerClick;

    const phone = createPhoneMesh();
    phone.group.position.set(3.96, 0.028, 0.88);
    phone.group.scale.set(0.80, 0.80, 0.80);
    phone.group.rotation.y = -Math.PI / 16;
    scene.add(phone.group);

    const coffee = createCoffeeMesh(caffeineLevel);
    coffee.group.position.set(5.50, 0, 2.65);
    scene.add(coffee.group);
    setCoffeeLevelRef.current = coffee.setCoffeeLevel;
    triggerCoffeeSipRef.current = coffee.triggerSipAnimation;
    coffee.setCoffeeLevel(caffeineLevel, true);

    const clock = createClockMesh();
    scene.add(clock.group);

    const router = createRouterMesh();
    scene.add(router.group);

    const watch = createWatchMesh();
    scene.add(watch.group);

    const ethernetCable = createEthernetCableMesh();
    scene.add(ethernetCable.group);

    const fiberCable = createFiberCableMesh();
    scene.add(fiberCable.group);

    const extensionBoard = createExtensionBoardMesh();
    scene.add(extensionBoard.group);

    const hologram = createHologramSphere();
    scene.add(hologram.group);

    const chair = createChairMesh();
    chair.position.set(0.15, 0, 5.5);
    chair.rotation.y = 0.32;
    scene.add(chair);

    // Live Dynamic Workstation Theme Updater
    const updateTheme = (newTheme: WorkstationTheme) => {
      const themeCol = new THREE.Color(newTheme.threeColor);

      hemiLight.color.copy(themeCol).multiplyScalar(0.35).add(new THREE.Color(0x0e1824));
      dirLight.color.copy(themeCol).multiplyScalar(0.25).add(new THREE.Color(0xdce7ef));
      rimLight.color.setHex(newTheme.threeColor);
      screenLight.color.setHex(newTheme.threeColor);

      updateGridColors(floorGrid, newTheme.threeColor);

      scene.traverse((obj) => {
        const anyObj = obj as unknown as {
          material?: THREE.Material | THREE.Material[];
        };
        if (!anyObj.material) return;
        const mats = Array.isArray(anyObj.material) ? anyObj.material : [anyObj.material];
        mats.forEach((m) => {
          if (m instanceof THREE.LineBasicMaterial || m instanceof THREE.LineDashedMaterial) {
            m.color.setHex(newTheme.threeColor);
          } else if ("emissive" in m && m.emissive && (m.emissive as THREE.Color).getHex() !== 0) {
            (m.emissive as THREE.Color).setHex(newTheme.threeColor);
          }
        });
      });

      // Synchronize all procedural canvas textures & shader props
      laptop.setTheme(newTheme);
      idCard.setTheme(newTheme);
      mouse.setTheme(newTheme);
      phone.setTheme(newTheme);
      coffee.setTheme(newTheme);
      clock.setTheme(newTheme);
      router.setTheme(newTheme);
      watch.setTheme(newTheme);
      ethernetCable.setTheme(newTheme);
      fiberCable.setTheme(newTheme);
      extensionBoard.setTheme(newTheme);
      hologram.setTheme(newTheme);
    };

    updateThemeRef.current = updateTheme;
    updateTheme(themeRef.current);

    // 4. INVISIBLE HITBOXES FOR RAYCASTING
    const hitboxMat = new THREE.MeshBasicMaterial({
      visible: false,
    });

    const createHitbox = (
      id: InteractivePropId,
      size: [number, number, number],
      pos: [number, number, number]
    ) => {
      const geo = new THREE.BoxGeometry(...size);
      const mesh = new THREE.Mesh(geo, hitboxMat);
      mesh.position.set(...pos);
      mesh.userData = { id };
      scene.add(mesh);
      return mesh;
    };

    const hitboxes: THREE.Mesh[] = [
      createHitbox("laptop", [4.6, 2.6, 3.0], [0, 1.2, 1.55]),
      createHitbox("id-card", [1.3, 0.35, 0.9], [-3.8, 0.08, 2.6]),
      mouse.mouseHitbox,
      createHitbox("phone", [1.10, 0.35, 1.80], [3.70, 0.1, 0.90]),
      createHitbox("coffee", [1.2, 1.2, 1.2], [5.50, 0.5, 2.65]),
      clock.clockHitbox,
      router.routerHitbox,
      watch.watchHitbox,
      extensionBoard.boardHitbox,
      hologram.holoMesh,
    ];

    // 5. EVENT-DRIVEN SPHERICAL 3D ORBIT, PINCH-TO-ZOOM & INTERACTION
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let containerRect = container.getBoundingClientRect();
    let lastHoverCheck = 0;
    let lastHoverValue = false;
    let minCamDist = initialParams.minDist;
    let maxCamDist = initialParams.maxDist;
    const lookTarget = new THREE.Vector3(0, 0.85, 1.0);

    let targetCamDist = initialParams.baseDist;
    let targetAzimuth = 0;
    let targetElevation = initialParams.targetElevation;
    let currentCamDist = initialParams.baseDist;
    let currentAzimuth = 0;
    let currentElevation = initialParams.targetElevation;

    let isDragging = false;
    let isSpinningHolo = false;
    let dragStartPointerX = 0;
    let dragStartPointerY = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let dragStartTime = 0;
    let totalTravelDist = 0;
    let prevPinchDist = 0;
    let maxPointersInGesture = 0;

    // Multi-touch tracking for pinch-to-zoom
    const activePointers = new Map<number, { x: number; y: number }>();

    const resetCamera = () => {
      const currentParams = getAdaptiveCameraParams(camera.aspect);
      targetCamDist = currentParams.baseDist;
      targetAzimuth = 0;
      targetElevation = currentParams.targetElevation;
      minCamDist = currentParams.minDist;
      maxCamDist = currentParams.maxDist;
    };
    resetCameraRef.current = resetCamera;

    const handlePointerDown = (e: PointerEvent) => {
      if (isPausedRef.current) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      maxPointersInGesture = Math.max(maxPointersInGesture, activePointers.size);

      if (activePointers.size === 2) {
        // Initialize 2-finger Pinch-to-Zoom
        const pts = Array.from(activePointers.values());
        prevPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        totalTravelDist += 100; // Flag as multi-touch gesture
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        return;
      }

      if (activePointers.size === 1) {
        isDragging = true;
        dragStartTime = performance.now();
        dragStartPointerX = e.clientX;
        dragStartPointerY = e.clientY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
        totalTravelDist = 0;
        maxPointersInGesture = 1;

        // Check if the user pressed down directly on the expanded hologram
        const rect = containerRect;
        const startX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const startY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerNdc.set(startX, startY);
        raycaster.setFromCamera(pointerNdc, camera);
        const downHits = raycaster.intersectObjects(hitboxes, false);
        isSpinningHolo = hologram.getIsExpanded() && downHits.length > 0 && downHits[0].object.userData.id === "hologram";

        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          // Pointer capture fallback
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPausedRef.current) return;
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      maxPointersInGesture = Math.max(maxPointersInGesture, activePointers.size);

      // Handle 2-Finger Pinch-to-Zoom on Mobile / Tablets
      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const currPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (prevPinchDist > 0) {
          const deltaDist = currPinchDist - prevPinchDist;
          // Smooth responsive pinch zoom for mobile touchscreens
          targetCamDist = Math.max(
            minCamDist,
            Math.min(maxCamDist, targetCamDist - deltaDist * 0.045)
          );
        }
        prevPinchDist = currPinchDist;
        totalTravelDist += 50;
        return;
      }

      const rect = containerRect;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging && activePointers.size === 1) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        const moveDist = Math.hypot(deltaX, deltaY);
        totalTravelDist += moveDist;

        if (isSpinningHolo) {
          // Direct drag-rotation on the expanded holographic sphere
          hologram.addRotation(deltaX, deltaY);
        } else {
          // Touch devices have smaller viewports and higher DPI: calibrated sensitivity
          const isTouch = e.pointerType === "touch";
          const rotSensX = isTouch ? 0.0075 : 0.0065;
          const rotSensY = isTouch ? 0.0055 : 0.0045;

          // True horizontal 360° orbital rotation (dragging right rotates camera clockwise)
          targetAzimuth -= deltaX * rotSensX;
          // Vertical pitch angle clamped between 0.18 rad (low angle) and 1.22 rad (top-down)
          targetElevation = Math.max(
            0.18,
            Math.min(1.22, targetElevation + deltaY * rotSensY)
          );
        }

        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      } else {
        // Hover raycasting is capped at ~20 Hz; pointer moves are far more
        // frequent than the hit targets can visually change.
        const hoverNow = performance.now();
        if (hoverNow - lastHoverCheck < 50) return;
        lastHoverCheck = hoverNow;

        pointerNdc.set(x, y);
        raycaster.setFromCamera(pointerNdc, camera);
        const hovered = raycaster.intersectObjects(hitboxes, false);
        const isInteractiveHover = hovered.length > 0;
        if (isInteractiveHover !== lastHoverValue) {
          lastHoverValue = isInteractiveHover;
          document.documentElement.setAttribute(
            "data-cursor-hover",
            isInteractiveHover ? "true" : "false"
          );
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);

      if (activePointers.size < 2) {
        prevPinchDist = 0;
      }

      const wasDragging = isDragging;
      if (activePointers.size === 0) {
        isDragging = false;
        isSpinningHolo = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {
          // Pointer capture fallback
        }
      }

      // Strict Disambiguation: Only trigger selection on intentional, deliberate single taps
      // Ensures rotating or pinch-zooming never accidentally triggers the laptop / modals
      const tapDuration = performance.now() - dragStartTime;
      const displacement = Math.hypot(e.clientX - dragStartPointerX, e.clientY - dragStartPointerY);
      const isCleanTap =
        wasDragging &&
        maxPointersInGesture === 1 &&
        activePointers.size === 0 &&
        totalTravelDist < 12 &&
        displacement < 12 &&
        tapDuration < 450;

      if (isCleanTap && !isPausedRef.current) {
        const rect = containerRect;
        const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        pointerNdc.set(clickX, clickY);
        raycaster.setFromCamera(pointerNdc, camera);
        const intersects = raycaster.intersectObjects(hitboxes, false);

        if (intersects.length > 0) {
          const propId = intersects[0].object.userData.id as InteractivePropId;
          if (propId === "laptop") {
            sound.playClick(1.5);
          } else if (propId === "hologram") {
            hologram.toggleExpand();
            sound.playNodePulse();
          } else if (propId === "power-board") {
            extensionBoard.toggleMasterPower();
          } else if (propId === "clock") {
            clock.toggleFormat();
            sound.playClick(1.6);
          } else if (propId !== "coffee") {
            sound.playNodePulse();
          }
          onSelectObjectRef.current(propId);
        }
      }

      if (activePointers.size === 0) {
        maxPointersInGesture = 0;
        totalTravelDist = 0;
      }
    };

    // Desktop Mouse Wheel Zoom Handler
    const handleWheel = (e: WheelEvent) => {
      if (isPausedRef.current) return;
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.007;
      targetCamDist = Math.max(
        minCamDist,
        Math.min(maxCamDist, targetCamDist + zoomDelta)
      );
    };

    let lastGlobalPointerX = 0;
    let lastGlobalPointerY = 0;
    let hasGlobalPointerInit = false;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!hasGlobalPointerInit) {
        lastGlobalPointerX = e.clientX;
        lastGlobalPointerY = e.clientY;
        hasGlobalPointerInit = true;
        return;
      }
      const dx = e.movementX !== undefined && e.movementX !== 0 ? e.movementX : e.clientX - lastGlobalPointerX;
      const dy = e.movementY !== undefined && e.movementY !== 0 ? e.movementY : e.clientY - lastGlobalPointerY;
      lastGlobalPointerX = e.clientX;
      lastGlobalPointerY = e.clientY;

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        mouse.onPointerMove(dx, dy);
      }
    };
    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });

    const handleGlobalPointerDown = () => {
      mouse.triggerClick();
    };
    window.addEventListener("pointerdown", handleGlobalPointerDown, { passive: true });

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    // 6. WEBGL CONTEXT LOSS & RESTORE HANDLERS
    const canvasElement = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      if (!container || !renderer) return;
      const w = Math.max(1, container.clientWidth || window.innerWidth);
      const h = Math.max(1, container.clientHeight || window.innerHeight);
      const newAspect = w / h;
      const params = getAdaptiveCameraParams(newAspect);
      camera.aspect = newAspect;
      camera.fov = params.fov;
      minCamDist = params.minDist;
      maxCamDist = params.maxDist;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    canvasElement.addEventListener("webglcontextlost", handleContextLost, false);
    canvasElement.addEventListener("webglcontextrestored", handleContextRestored, false);

    // 7. ROBUST RESIZE OBSERVER (Handles container dimension changes reliably without address bar jitter or fullscreen black flicker)
    let lastObservedW = initialWidth;
    let lastObservedH = initialHeight;
    let resizeRafId: number | null = null;

    const performResize = (w: number, h: number) => {
      if (!renderer || !container || w <= 32 || h <= 32) return;
      lastObservedW = w;
      lastObservedH = h;
      containerRect = container.getBoundingClientRect();

      const newAspect = w / h;
      const params = getAdaptiveCameraParams(newAspect);
      camera.aspect = newAspect;
      camera.fov = params.fov;
      minCamDist = params.minDist;
      maxCamDist = params.maxDist;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      // 🟢 Immediate synchronous render in the resize frame so the canvas never flashes black
      renderer.render(scene, camera);
    };

    const updateDimensions = (w: number, h: number) => {
      if (!renderer || w <= 32 || h <= 32) return;
      // Ignore micro height shifts (< 14px) caused by mobile browser address bar sliding
      const dw = Math.abs(w - lastObservedW);
      const dh = Math.abs(h - lastObservedH);
      if (dw === 0 && dh < 14) return;

      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        performResize(w, h);
      });
    };

    const handleWindowResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth || window.innerWidth);
      const h = Math.max(1, container.clientHeight || window.innerHeight);
      updateDimensions(w, h);
    };
    window.addEventListener("resize", handleWindowResize);
    document.addEventListener("fullscreenchange", handleWindowResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.max(1, entry.contentRect.width || container.clientWidth || window.innerWidth);
          const h = Math.max(1, entry.contentRect.height || container.clientHeight || window.innerHeight);
          updateDimensions(w, h);
        }
      });
      resizeObserver.observe(container);
    }

    // 8. VISIBILITY CHANGE HANDLING (Pause GPU when tab is hidden)
    let isTabVisible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;

    const handleVisibilityChange = () => {
      isTabVisible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 9. NATIVE DISPLAY REFRESH RATE ANIMATION LOOP (120FPS+ Fluidity & Direct Engine Telemetry)
    let animationFrameId: number;
    let lastDeltaTime = performance.now();
    let hasNotifiedReady = false;
    let fpsFrameCount = 0;
    let fpsLastTime = performance.now();

    // Adaptive render resolution: trades pixel density for frame headroom,
    // never scene detail. Only adapts while the tab is focused so background
    // rAF throttling is not mistaken for a slow scene.
    const baseDpr = Math.min(window.devicePixelRatio || 1, 2.0);
    const maxDpr = Math.min(window.devicePixelRatio || 1, 2.0);
    const minDpr = 1.0;
    let currentDpr = baseDpr;
    let renderCostEma = 0;
    let lastDprCheck = performance.now();
    let lastDprChange = performance.now();
    // Only step down if the CPU/GPU is genuinely suffocating (> 15 ms, i.e. drops below 60fps)
    // Never downscale on high-refresh (120/144/240Hz) monitors where frame budget is naturally short.
    const dprLowerThresholdMs = 15.0;
    const dprRaiseThresholdMs = 7.0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip GPU render when tab is completely hidden
      if (!isTabVisible) {
        lastDeltaTime = now;
        return;
      }

      fpsFrameCount++;
      const fpsElapsed = now - fpsLastTime;
      if (fpsElapsed >= 400) {
        const engineFps = Math.min(240, Math.max(1, Math.round((fpsFrameCount * 1000) / fpsElapsed)));
        const frameTime = +(1000 / engineFps).toFixed(1);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("neeraj:engine-fps", {
              detail: { fps: engineFps, frameTime },
            })
          );
        }
        fpsFrameCount = 0;
        fpsLastTime = now;
      }

      const delta = Math.min((now - lastDeltaTime) / 1000, 0.05);
      lastDeltaTime = now;

      // 🟢 Mouse physics always runs in real-time (even during modal inspection)
      mouse.updateMouse(delta);

      // 🟢 Keep all lively workstation prop animations running fluidly in real-time (never freeze on inspection)
      coffee.updateSteam(delta);
      idCard.updateCard(delta);
      hologram.updateHolo(delta);
      clock.updateClock(delta);
      router.updateRouter(delta);
      watch.updateWatch(delta);
      ethernetCable.updateCable(delta);
      fiberCable.updateFiber(delta);
      extensionBoard.updatePower(delta);

      // Smooth horizontal, vertical & zoom distance interpolation (Spherical Coordinates)
      currentCamDist += (targetCamDist - currentCamDist) * 0.10;
      currentAzimuth += (targetAzimuth - currentAzimuth) * 0.09;
      currentElevation += (targetElevation - currentElevation) * 0.09;

      const camX =
        lookTarget.x +
        currentCamDist * Math.sin(currentAzimuth) * Math.cos(currentElevation);
      const camY = lookTarget.y + currentCamDist * Math.sin(currentElevation);
      const camZ =
        lookTarget.z +
        currentCamDist * Math.cos(currentAzimuth) * Math.cos(currentElevation);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(lookTarget);

      if (renderer) {
        const renderStarted = performance.now();
        renderer.render(scene, camera);
        const renderCost = performance.now() - renderStarted;
        renderCostEma =
          renderCostEma === 0 ? renderCost : renderCostEma * 0.95 + renderCost * 0.05;

        if (
          now - lastDprCheck > 3000 &&
          document.visibilityState === "visible" &&
          document.hasFocus()
        ) {
          lastDprCheck = now;
          if (renderCostEma > dprLowerThresholdMs && currentDpr > minDpr) {
            currentDpr = Math.max(minDpr, Number((currentDpr - 0.25).toFixed(2)));
            renderer.setPixelRatio(currentDpr);
            renderCostEma = 0;
            lastDprChange = now;
          } else if (
            renderCostEma < dprRaiseThresholdMs &&
            currentDpr < maxDpr &&
            now - lastDprChange > 6000
          ) {
            currentDpr = Math.min(maxDpr, Number((currentDpr + 0.25).toFixed(2)));
            renderer.setPixelRatio(currentDpr);
            renderCostEma = 0;
            lastDprChange = now;
          }
        }

        if (!hasNotifiedReady) {
          hasNotifiedReady = true;
          requestAnimationFrame(() => {
            onReadyRef.current?.();
          });
        }
      }
    };

    // Pre-warm and compile all WebGL shader programs before starting render loop
    // to eliminate frame-one shader compilation stutter
    if (renderer) {
      try {
        renderer.compile(scene, camera);
      } catch {
        // Safe fallback
      }
    }

    animate(performance.now());

    // 9b. DEV-ONLY RENDER DIAGNOSTICS (synchronous, GPU-synced benchmark)
    let disposeDebugApi: (() => void) | null = null;
    if (process.env.NODE_ENV !== "production") {
      const gl = renderer.getContext();
      const syncPixel = new Uint8Array(4);
      const debugWindow = window as unknown as {
        __deskDebug?: {
          renderer: THREE.WebGLRenderer;
          scene: THREE.Scene;
          camera: THREE.PerspectiveCamera;
          benchmark: (frames?: number) => Record<string, number>;
          setPixelRatio: (ratio: number) => void;
        };
      };
      const benchmark = (frames = 120) => {
        for (let i = 0; i < 24; i++) renderer!.render(scene, camera);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel);
        const started = performance.now();
        for (let i = 0; i < frames; i++) renderer!.render(scene, camera);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel);
        const elapsed = performance.now() - started;
        const info = renderer!.info.render;
        return {
          frames,
          elapsedMs: +elapsed.toFixed(2),
          avgFrameMs: +(elapsed / frames).toFixed(3),
          fps: Math.round((frames * 1000) / elapsed),
          drawCalls: info.calls,
          triangles: info.triangles,
          lines: info.lines,
          geometries: renderer!.info.memory.geometries,
          textures: renderer!.info.memory.textures,
          pixelRatio: renderer!.getPixelRatio(),
        };
      };
      debugWindow.__deskDebug = {
        renderer,
        scene,
        camera,
        benchmark,
        setPixelRatio: (ratio: number) => {
          renderer!.setPixelRatio(ratio);
        },
      };
      disposeDebugApi = () => {
        delete debugWindow.__deskDebug;
      };
    }

    // 10. THOROUGH CLEANUP TO PREVENT FAST-REFRESH VRAM / CONTEXT LEAKS
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      disposeDebugApi?.();
      if (resizeObserver) resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleWindowResize);
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("wheel", handleWheel);
      canvasElement.removeEventListener("webglcontextlost", handleContextLost);
      canvasElement.removeEventListener("webglcontextrestored", handleContextRestored);

      // Deep recursive disposal of geometries, materials, and textures
      scene.traverse((obj) => {
        const anyObj = obj as unknown as {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        if (anyObj.geometry) {
          anyObj.geometry.dispose();
        }
        if (anyObj.material) {
          if (Array.isArray(anyObj.material)) {
            anyObj.material.forEach((mat) => {
              const withMap = mat as THREE.MeshBasicMaterial;
              if (withMap.map) withMap.map.dispose();
              mat.dispose();
            });
          } else {
            const withMap = anyObj.material as THREE.MeshBasicMaterial;
            if (withMap.map) withMap.map.dispose();
            anyObj.material.dispose();
          }
        }
      });

      hitboxMat.dispose();
      scene.clear();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative touch-none select-none" />;
}
