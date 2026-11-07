"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";
import { QrCode } from "@/components/ui/qr-code";
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

interface AsciiIdCardProps {
  initialFacing?: "front" | "back";
  onFacingChange?: (facing: "front" | "back") => void;
  theme?: WorkstationTheme;
}

export function AsciiIdCard({
  initialFacing = "front",
  onFacingChange,
  theme = DEFAULT_THEME,
}: AsciiIdCardProps) {
  const [expiryCode, setExpiryCode] = useState("0xØ9#F7!Ω");
  const [copied, setCopied] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(initialFacing === "back" ? 180 : 0);

  const [scale, setScale] = useState(1.0);

  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const startRot = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const prevPinchDist = useRef(0);

  const themeHex = theme.hex;

  const notifyFacing = (yAngle: number) => {
    const normalized = Math.abs(((yAngle % 360) + 360) % 360 - 180);
    const facing = normalized < 90 ? "back" : "front";
    onFacingChange?.(facing);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setExpiryCode(getRandomMatrixCode());
    }, 90);
    return () => clearInterval(interval);
  }, []);

  // Dynamically tint avatar on canvas
  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.src = "/avatar-neeraj.png";
    const draw = () => {
      const tinted = createTintedAvatarCanvas(img, themeHex, 88, 88);
      ctx.clearRect(0, 0, 88, 88);
      if (tinted) {
        ctx.drawImage(tinted, 0, 0, 88, 88);
      } else {
        ctx.drawImage(img, 0, 0, 88, 88);
      }
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, [themeHex]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const zoomDelta = -e.deltaY * 0.0015;
    setScale((prev) => Math.max(0.65, Math.min(1.80, +(prev + zoomDelta).toFixed(3))));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch-to-Zoom on Mobile
    if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      prevPinchDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      return;
    }

    if (activePointers.current.size === 1) {
      isDragging.current = true;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      startRot.current = { x: rotX, y: rotY };
      dragDistance.current = 0;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Handle 2-Finger Pinch-to-Zoom on Mobile
    if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      const currPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (prevPinchDist.current > 0) {
        const deltaDist = currPinchDist - prevPinchDist.current;
        setScale((prev) => Math.max(0.65, Math.min(1.80, +(prev + deltaDist * 0.005).toFixed(3))));
      }
      prevPinchDist.current = currPinchDist;
      return;
    }

    if (!isDragging.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    dragDistance.current = Math.hypot(dx, dy);

    // Freeform 360 horizontal spin + constrained vertical tilt (-35 deg to +35 deg)
    const newY = startRot.current.y + dx * 0.65;
    const newX = Math.max(-35, Math.min(35, startRot.current.x - dy * 0.65));
    setRotY(newY);
    setRotX(newX);
    notifyFacing(newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      prevPinchDist.current = 0;
    }

    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // If dragged less than 6px, treat as a single click to flip 180 deg
    if (dragDistance.current < 6) {
      sound.playNodePulse();
      const currentNormalized = Math.round(rotY / 180) * 180;
      const targetY = currentNormalized + 180;
      setRotY(targetY);
      setRotX(0);
      notifyFacing(targetY);
    } else {
      notifyFacing(rotY);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setRotX(0);
    setRotY(0);
    setScale(1.0);
    notifyFacing(0);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSuccess();
    navigator.clipboard.writeText("hi.neerajm@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-[92vw] sm:w-[520px] h-[325px] mx-auto select-none [perspective:1200px] shrink-0 touch-none"
      onClick={(e) => e.stopPropagation()}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      title="Drag to rotate in 3D • Scroll/pinch to zoom • Click to flip • Double-click to reset"
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: isDragging.current ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="w-full h-full relative [transform-style:preserve-3d]"
      >
        {/* ========================================================================= */}
        {/* 🟢 SIDE A: FRONT FACE (Identity & Credentials)                           */}
        {/* ========================================================================= */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg) translateZ(1px)",
            borderColor: themeHex,
            color: themeHex,
            boxShadow: `0 0 35px ${themeHex}40, inset 0 0 25px ${themeHex}1a`,
          }}
          className="absolute inset-0 w-full h-full bg-[#06090e] border-2 rounded-[8px] p-4 sm:p-5 font-mono overflow-hidden flex flex-col justify-between"
        >
          {/* CRT Background Overlays */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(ellipse at center, ${themeHex}1f 0%, rgba(0,0,0,0.88) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.55)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60 z-20" />

          {/* Front Content */}
          <div className="relative z-30 space-y-3">
            {/* Header */}
            <div
              className="flex items-center justify-between border-b pb-2 text-[10px] sm:text-[11px] font-bold tracking-wider"
              style={{ borderColor: `${themeHex}66` }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: themeHex }}
                />
                <span style={{ textShadow: `0 0 8px ${themeHex}` }}>
                  USER PROFILE // NEERAJ.M
                </span>
              </div>
              <div style={{ color: `${themeHex}b3` }}>SECTOR: 0xNEERAJ</div>
            </div>

            {/* Main Body */}
            <div className="grid grid-cols-12 gap-3.5 items-center">
              {/* Photo */}
              <div className="col-span-4 flex flex-col items-center">
                <div
                  className="border rounded-[6px] p-1 bg-black relative overflow-hidden"
                  style={{
                    borderColor: themeHex,
                    boxShadow: `0 0 12px ${themeHex}40`,
                  }}
                >
                  <div className="w-20 h-20 sm:w-22 sm:h-22 relative bg-black overflow-hidden rounded-[4px]">
                    <canvas
                      ref={avatarCanvasRef}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                </div>
                <div
                  className="text-[8px] mt-1 font-bold tracking-tighter"
                  style={{ color: themeHex }}
                >
                  [ 0xNEERAJ_AVATAR ]
                </div>
              </div>

              {/* Credentials */}
              <div className="col-span-8 space-y-1 text-[10px] sm:text-[11px] leading-tight font-mono">
                <div>
                  <span style={{ color: `${themeHex}80` }}>NAME  : </span>
                  <span className="font-bold" style={{ textShadow: `0 0 6px ${themeHex}` }}>
                    NEERAJ M
                  </span>
                </div>
                <div>
                  <span style={{ color: `${themeHex}80` }}>ROLE  : </span>
                  <span className="font-bold">DEVELOPER / BUILDER</span>
                </div>
                <div>
                  <span style={{ color: `${themeHex}80` }}>AGE   : </span>
                  <span className="font-bold">{DEVELOPER_PROFILE.age}</span>
                </div>
                <div>
                  <span style={{ color: `${themeHex}80` }}>BASE  : </span>
                  <span className="font-bold">KOLLAM, KERALA</span>
                </div>
                <div>
                  <span style={{ color: `${themeHex}80` }}>STUDY : </span>
                  <span>BCA @ SNCT</span>
                </div>
                <div>
                  <span style={{ color: `${themeHex}80` }}>EXPIRY: </span>
                  <span
                    className="font-bold tracking-wider font-mono"
                    style={{ textShadow: `0 0 8px ${themeHex}` }}
                  >
                    {expiryCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Human Bio */}
            <div
              className="p-2 border rounded-[4px] text-[10px] sm:text-[10.5px] italic leading-snug"
              style={{
                borderColor: `${themeHex}4d`,
                backgroundColor: `${themeHex}0d`,
                color: `${themeHex}e6`,
              }}
            >
              &quot;I build software, break things, figure out why, and occasionally ship them.&quot;
            </div>
          </div>

          {/* Front Footer */}
          <div
            className="relative z-30 pt-2 border-t flex items-center justify-between text-[9px] sm:text-[10px]"
            style={{ borderColor: `${themeHex}4d` }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="border rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold"
                style={{
                  borderColor: themeHex,
                  backgroundColor: `${themeHex}1a`,
                }}
              >
                [ ▓▓▓▓ ] 64-BIT
              </div>
              <span className="font-bold" style={{ color: `${themeHex}cc` }}>
                SOLO BUILDER
              </span>
            </div>

            <div className="text-[9px] font-mono" style={{ color: `${themeHex}80` }}>
              [ ✦ DRAG 360° // DBL-CLICK RESET ]
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🟢 SIDE B: BACK FACE (Building, Tools, Connect & QR Code)                */}
        {/* ========================================================================= */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)",
            borderColor: themeHex,
            color: themeHex,
            boxShadow: `0 0 35px ${themeHex}40, inset 0 0 25px ${themeHex}1a`,
          }}
          className="absolute inset-0 w-full h-full bg-[#06090e] border-2 rounded-[8px] p-4 sm:p-5 font-mono overflow-hidden flex flex-col justify-between"
        >
          {/* CRT Background Overlays */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(ellipse at center, ${themeHex}1f 0%, rgba(0,0,0,0.88) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.55)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60 z-20" />

          {/* Back Content */}
          <div className="relative z-30 space-y-2.5">
            {/* Header */}
            <div
              className="flex items-center justify-between border-b pb-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider"
              style={{ borderColor: `${themeHex}66` }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeHex }} />
                <span style={{ textShadow: `0 0 8px ${themeHex}` }}>0xNEERAJ // ARTIFACTS</span>
              </div>
              <div style={{ color: `${themeHex}b3` }}>SPEC: PRODUCTION</div>
            </div>

            {/* 01 — BUILDING */}
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: `${themeHex}80` }}
              >
                01 — BUILDING (ACTUAL PROJECTS)
              </div>
              <div className="space-y-0.5 text-[10px] sm:text-[10.5px]">
                <div className="flex justify-between items-center">
                  <a
                    href="https://ktccofficial.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="font-bold hover:underline"
                    style={{ color: themeHex }}
                  >
                    • KTCC
                  </a>
                  <span className="text-[9px]" style={{ color: `${themeHex}b3` }}>
                    TOURNAMENT PLATFORM (APK/WEB)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href="https://github.com/neeraajm/broto-raise"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="font-bold hover:underline"
                    style={{ color: themeHex }}
                  >
                    • BROTORAISE
                  </a>
                  <span className="text-[9px]" style={{ color: `${themeHex}b3` }}>
                    COMPLAINT MANAGEMENT SYSTEM
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold">• TIMEBOX</span>
                  <span className="text-[9px]" style={{ color: `${themeHex}99` }}>
                    GAMIFIED FOCUS (DEV)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold">• INKLAVE</span>
                  <span className="text-[9px]" style={{ color: `${themeHex}99` }}>
                    DOCUMENT READER (DEV)
                  </span>
                </div>
              </div>
            </div>

            {/* 02 — TOOLS */}
            <div className="pt-1 border-t" style={{ borderColor: `${themeHex}33` }}>
              <div
                className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: `${themeHex}80` }}
              >
                02 — TOOLS (BATTLE-TESTED)
              </div>
              <div
                className="text-[9.5px] sm:text-[10px] font-bold tracking-tight"
                style={{ color: themeHex }}
              >
                NEXT.JS 15 • TYPESCRIPT • SUPABASE • ANDROID • LINUX • R2
              </div>
            </div>

            {/* 03 — CONNECT & QR CODE */}
            <div className="pt-1 border-t flex items-center justify-between gap-3" style={{ borderColor: `${themeHex}33` }}>
              <div className="space-y-0.5 text-[9px] sm:text-[9.5px]">
                <div className="text-[8.5px] font-bold uppercase" style={{ color: `${themeHex}80` }}>
                  03 — CONNECT
                </div>
                <div>• GITHUB: <a href="https://github.com/neeraajm" target="_blank" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="font-bold underline">@neeraajm</a></div>
                <div>• INSTA: <a href="https://instagram.com/neeraajm" target="_blank" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="font-bold underline">@neeraajm</a></div>
                <div>• EMAIL: <span className="font-bold">hi.neerajm@gmail.com</span></div>
              </div>

              {/* Scannable Vector QR Code Box */}
              <a
                href="https://neerajm.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                title="Scan or visit neerajm.pages.dev"
                className="border p-1 bg-black shrink-0 rounded-[4px] transition-all flex items-center justify-center cursor-pointer"
                style={{
                  borderColor: themeHex,
                  boxShadow: `0 0 10px ${themeHex}40`,
                }}
              >
                <QrCode value="https://neerajm.pages.dev" size={54} fgColor={themeHex} centerLogo={true} />
              </a>
            </div>
          </div>

          {/* Back Footer */}
          <div
            className="relative z-30 pt-1.5 border-t flex items-center justify-between text-[9px] sm:text-[10px]"
            style={{ borderColor: `${themeHex}4d` }}
          >
            <button
              onClick={handleCopyEmail}
              onPointerDown={(e) => e.stopPropagation()}
              className="border rounded-[4px] px-2 py-0.5 font-bold transition-all active:scale-95 cursor-pointer"
              style={{
                borderColor: themeHex,
                color: themeHex,
                boxShadow: `0 0 8px ${themeHex}33`,
              }}
            >
              {copied ? "[ ✓ COPIED ]" : "[ $ COPY EMAIL ]"}
            </button>

            <div className="text-[9px] font-mono" style={{ color: `${themeHex}80` }}>
              [ ✦ DRAG 360° // DBL-CLICK RESET ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
