"use client";

import React, { useEffect, useRef, useState } from "react";

interface CustomCursorProps {
  themeHex?: string;
}

export function CustomCursor({ themeHex = "#ffffff" }: CustomCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Physics animation state
  const mousePos = useRef({ x: -100, y: -100 });
  const velocity = useRef(0);
  const isHoveredRef = useRef(false);
  const isDownRef = useRef(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isDownRef.current = isDown;
  }, [isDown]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    let rafId: number;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let downStartTime = 0;

    const checkHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isHtmlInteractive = Boolean(
        target &&
          target.closest(
            'button, a, input, textarea, select, [role="button"], [data-interactive="true"], .cursor-pointer'
          )
      );
      const is3dInteractive =
        document.documentElement.getAttribute("data-cursor-hover") === "true";

      const nextHover = isHtmlInteractive || is3dInteractive;
      if (nextHover !== isHoveredRef.current) {
        setIsHovered(nextHover);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      velocity.current = Math.min(20, Math.hypot(dx, dy));

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Instant 0ms latency update for the unified cursor container
      if (cursorContainerRef.current) {
        const velScale = 1.0 + velocity.current * 0.012;
        const baseScale = isDownRef.current ? 0.85 : isHoveredRef.current ? 1.25 : 1.0;
        cursorContainerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(${baseScale * velScale})`;
      }

      checkHoverState(e);

      // Check for dragging movement when pointer is down
      if (isDownRef.current) {
        const downDuration = performance.now() - downStartTime;
        if (downDuration > 100) {
          setIsDragging(true);
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsDown(true);
      downStartTime = performance.now();

      // Trigger micro ripple effect on click
      if (rippleRef.current) {
        rippleRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(1)`;
        rippleRef.current.style.opacity = "0.8";
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(2.4)`;
            rippleRef.current.style.opacity = "0";
          }
        }, 10);
      }
    };

    const onMouseUp = () => {
      setIsDown(false);
      setIsDragging(false);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // MutationObserver to immediately catch 3D canvas raycasting hover state changes & hidden state
    const observer = new MutationObserver(() => {
      const is3d = document.documentElement.getAttribute("data-cursor-hover") === "true";
      const hidden = document.documentElement.getAttribute("data-cursor-hidden") === "true";
      setIsHidden(hidden);
      setIsHovered((prev) => {
        const isHtml = Boolean(
          document.querySelector(':hover:is(button, a, input, textarea, select, [role="button"], .cursor-pointer)')
        );
        return is3d || isHtml;
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cursor-hover", "data-cursor-hidden"],
    });

    // Velocity decay loop
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      velocity.current *= 0.85;

      if (cursorContainerRef.current) {
        const velScale = 1.0 + velocity.current * 0.012;
        const baseScale = isDownRef.current ? 0.85 : isHoveredRef.current ? 1.25 : 1.0;
        cursorContainerRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) scale(${baseScale * velScale})`;
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none transition-opacity duration-150 ${
        isHidden ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* CLICK RIPPLE PING WAVE */}
      <div
        ref={rippleRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border border-dashed transition-all duration-300 ease-out will-change-transform opacity-0 pointer-events-none"
        style={{
          borderColor: themeHex,
          boxShadow: `0 0 12px ${themeHex}`,
          transform: `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) scale(0.2)`,
        }}
      />

      {/* UNIFIED ZERO-SEPARATION HUD RETICLE & CENTER DOT CONTAINER */}
      <div
        ref={cursorContainerRef}
        className="fixed top-0 left-0 -ml-6 -mt-6 w-12 h-12 will-change-transform flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`,
        }}
      >
        {/* 1. SHARP NEON CENTER DOT (Strictly dead-center) */}
        <div
          className="absolute w-[6px] h-[6px] rounded-full pointer-events-none"
          style={{
            backgroundColor: themeHex,
            boxShadow: `0 0 10px ${themeHex}, 0 0 4px #ffffff`,
          }}
        />

        {/* 2. ROTATING DOTTED RADAR CIRCLE AROUND THE DOT (Shown when hovering interactive items) */}
        {isHovered && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-spin"
            style={{ animationDuration: "3.5s" }}
          >
            <svg viewBox="0 0 48 48" className="w-12 h-12">
              <circle
                cx="24"
                cy="24"
                r="10"
                fill="none"
                stroke={themeHex}
                strokeWidth="1.5"
                strokeDasharray="2.5 3.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </div>
        )}

        {/* 3. HUD CORNER ANGLE BRACKETS */}
        <svg
          viewBox="0 0 48 48"
          className={`w-12 h-12 transition-transform duration-200 pointer-events-none ${
            isHovered ? "rotate-45" : isDragging ? "rotate-90" : "rotate-0"
          }`}
        >
          {/* Top-Left Bracket */}
          <path
            d="M 10 16 L 10 10 L 16 10"
            fill="none"
            stroke={themeHex}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isHovered ? 0.95 : 0.65}
          />
          {/* Top-Right Bracket */}
          <path
            d="M 32 10 L 38 10 L 38 16"
            fill="none"
            stroke={themeHex}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isHovered ? 0.95 : 0.65}
          />
          {/* Bottom-Right Bracket */}
          <path
            d="M 38 32 L 38 38 L 32 38"
            fill="none"
            stroke={themeHex}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isHovered ? 0.95 : 0.65}
          />
          {/* Bottom-Left Bracket */}
          <path
            d="M 16 38 L 10 38 L 10 32"
            fill="none"
            stroke={themeHex}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isHovered ? 0.95 : 0.65}
          />

          {/* 4-Axis Orbital Compass Indicators when Dragging / Grabbing */}
          {isDragging && (
            <>
              <line x1="24" y1="4" x2="24" y2="9" stroke={themeHex} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="24" y1="39" x2="24" y2="44" stroke={themeHex} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1="24" x2="9" y2="24" stroke={themeHex} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="39" y1="24" x2="44" y2="24" stroke={themeHex} strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
