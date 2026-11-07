"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";

import { SceneCanvas, InteractivePropId } from "./scene-canvas";
import { AsciiIdCard } from "@/components/ascii/ascii-id-card";
import { PhoneModal } from "@/components/desk/modals/phone-modal";
import { NotesModal } from "@/components/desk/modals/notes-modal";
import { CoffeeModal } from "@/components/desk/modals/coffee-modal";

import { Volume2, VolumeX, X, HelpCircle, Terminal, CornerDownLeft, Sparkles, RotateCcw, Palette, Smartphone, Keyboard, Type } from "lucide-react";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { WORKSTATION_THEMES, WorkstationTheme, DEFAULT_THEME } from "@/lib/theme-colors";
import {
  TERMINAL_FONTS,
  DEFAULT_TERMINAL_FONT,
  TerminalFont,
  buildFontPickerLines,
  findTerminalFont,
} from "@/lib/terminal-fonts";
import { DEVELOPER_PROFILE } from "@/lib/constants";

type ModalType = "none" | "id-card" | "phone" | "sticky-note" | "coffee";

const QUICK_COMMANDS = [
  "help",
  "whoami",
  "ktcc",
  "coffee",
  "mouse",
  "font",
  "color",
  "credits",
  "license",
  "stack",
  "socials",
  "reset",
  "clear",
];
const DPI_PRESETS = [800, 1600, 2400, 3200, 6400];

const buildColorPickerLines = (selectedIndex: number, currentActiveId: string): string[] => {
  const lines = [
    "┌── [ WORKSTATION RGB PROFILE SELECTOR ] ─────────────────────────┐",
    "│  Use [↑ / ↓] to live-preview, [ENTER] to save, [ESC] to cancel  │",
    "├─────────────────────────────────────────────────────────────────┤",
  ];

  WORKSTATION_THEMES.forEach((thm, idx) => {
    const isSelected = idx === selectedIndex;
    const isActive = thm.id === currentActiveId;
    const marker = isSelected ? "  ●" : "   ";
    const activeTag = isActive ? " [ACTIVE]" : "";
    const num = idx + 1;
    lines.push(`${marker} ${num}. ${thm.name.padEnd(18)} [${thm.hex}]${activeTag}`);
  });

  lines.push("└─────────────────────────────────────────────────────────────────┘");
  return lines;
};

const EMPTY_TAP_MESSAGES = [
  "Tryna steal the cup now or what?",
  "Bro. It's still empty.",
  "Wasn't one whole cup enough for ya?",
  "Tapping harder won't make coffee materialize.",
  "Nice try. Settle the tab or check out KTCC! ☕😂",
];

const THEFT_UNRESOLVED_MESSAGES = [
  "You stole my coffee and left. We need to talk.",
  "Coffee: stolen. Debt: unpaid. Incident: logged.",
  "Left the crime scene without paying. Operating on pure spite now. ☕💀",
  "Cold. Didn't even leave a single rupee for the beans.",
];

const REFILL_CONFIRMED_MESSAGES = [
  "Alright. We're cool. ☕",
  "Debt settled. Coffee restored. Back to work. ☕",
  "Coffee's back. Crisis averted.",
];

function LiveClock({ themeHex }: { themeHex: string }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      setTime(`${timeStr}.${ms}`);

      setDate(
        now.toLocaleDateString("en-GB", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).toUpperCase()
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-transparent px-1.5 py-1 flex items-center gap-2.5 text-[10px] sm:text-xs select-none">
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: themeHex }}
        />
        <span className="font-bold hidden sm:inline" style={{ color: `${themeHex}99` }}>
          KERALA, IN
        </span>
        <span className="font-bold tracking-wider font-mono tabular-nums" style={{ color: themeHex }}>
          {time || "19:00:00.000"} IST
        </span>
      </div>
      <div className="hidden sm:inline-flex items-center gap-2.5">
        <span style={{ color: `${themeHex}4d` }}>|</span>
        <span className="font-bold text-[9px] sm:text-[10px]" style={{ color: `${themeHex}cc` }}>
          {date || "22 AUG 2026"}
        </span>
      </div>
    </div>
  );
}

function FpsSparkline({ themeHex }: { themeHex: string }) {
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>([
    60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60,
  ]);

  useEffect(() => {
    // 1. Direct Three.js Engine Telemetry Listener
    const handleEngineFps = (e: Event) => {
      const customEvent = e as CustomEvent<{ fps: number; frameTime: number }>;
      if (customEvent.detail?.fps) {
        const liveFps = customEvent.detail.fps;
        setFps(liveFps);
        setFpsHistory((prev) => [...prev.slice(1), liveFps]);
      }
    };

    window.addEventListener("neeraj:engine-fps", handleEngineFps);

    // 2. Client-side fallback measurement
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      const elapsed = now - lastTime;

      if (elapsed >= 500) {
        const measuredFps = Math.min(240, Math.max(1, Math.round((frameCount * 1000) / elapsed)));
        // Only update if no direct engine telemetry received in the last 1.5s
        setFps((prev) => (Math.abs(prev - measuredFps) > 15 ? measuredFps : prev));
        frameCount = 0;
        lastTime = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("neeraj:engine-fps", handleEngineFps);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Determine baseline target refresh rate (60Hz, 90Hz, 120Hz, 144Hz)
  const maxRecordedFps = Math.max(...fpsHistory, fps);
  const targetBaseline = maxRecordedFps > 105 ? 120 : maxRecordedFps > 75 ? 90 : 60;

  return (
    <div
      className="bg-transparent px-1.5 py-1 flex items-center gap-2 select-none"
      title={`3D Spatial Engine: ${fps} FPS // Target Baseline: ${targetBaseline}Hz`}
    >
      <svg width="34" height="13" className="overflow-visible">
        <defs>
          <linearGradient id="fps-spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeHex} stopOpacity="0.45" />
            <stop offset="100%" stopColor={themeHex} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,13 ${fpsHistory
            .map((val, idx) => {
              const x = (idx / (fpsHistory.length - 1)) * 34;
              const ratio = Math.max(0.1, Math.min(1.0, val / targetBaseline));
              const y = 11 - ratio * 8.5; // Steady line at y = 2.5 when solid
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")} 34,13`}
          fill="url(#fps-spark-grad)"
        />
        <polyline
          fill="none"
          stroke={themeHex}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={fpsHistory
            .map((val, idx) => {
              const x = (idx / (fpsHistory.length - 1)) * 34;
              const ratio = Math.max(0.1, Math.min(1.0, val / targetBaseline));
              const y = 11 - ratio * 8.5;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
        />
      </svg>
      <div className="flex items-center gap-1 font-mono text-[10px] font-bold tabular-nums" style={{ color: themeHex }}>
        <span>{fps}</span>
        <span className="text-[9px] opacity-70 font-semibold">FPS</span>
      </div>
    </div>
  );
}

export function DeveloperDesk3D() {
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<"touch" | "desktop">("desktop");
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [caffeine, setCaffeine] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("neeraj_workstation_caffeine");
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return 100;
  });
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [idCardFacing, setIdCardFacing] = useState<"front" | "back">("front");
  const [cameraResetCount, setCameraResetCount] = useState(0);
  const [sipTriggerCount, setSipTriggerCount] = useState(0);
  const [mouseTriggerCount, setMouseTriggerCount] = useState(0);
  const [isSceneReady, setIsSceneReady] = useState(false);

  const mouseClicksRef = useRef(0);
  const dpiIndexRef = useRef(3); // Default 3200 DPI

  const [activeTheme, setActiveTheme] = useState<WorkstationTheme>(DEFAULT_THEME);
  const [activeFont, setActiveFont] = useState<TerminalFont>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("neeraj_workstation_font");
        if (saved) {
          const matched = findTerminalFont(saved);
          if (matched) return matched;
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_TERMINAL_FONT;
  });
  const previousFontRef = useRef<TerminalFont>(DEFAULT_TERMINAL_FONT);
  const [pickerMode, setPickerMode] = useState<"none" | "color" | "font">("none");
  const [pickerIndex, setPickerIndex] = useState(0);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const previousThemeRef = useRef<WorkstationTheme>(DEFAULT_THEME);
  const hasDonatedOrInteractedRef = useRef(false);

  const emptyTapIndexRef = useRef(0);
  const theftExitIndexRef = useRef(0);
  const refillIndexRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0) {
        setHelpTab("touch");
      }

      // Show the reload callout if caffeine was 0 in storage
      try {
        const saved = localStorage.getItem("neeraj_workstation_caffeine");
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed <= 0) {
            setTerminalLines([
              "[BOOT] NEERAJ_OS v2.4 (x86_64-workstation)",
              "[ALERT] UNRESOLVED CRIME DETECTED IN LOCAL STORAGE",
              "[SYS] CAFFEINE: 0% // Nice try refreshing the page. The cup is still empty. ☕💀",
            ]);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("neeraj_workstation_caffeine", String(caffeine));
      } catch {
        // ignore
      }
    }
  }, [caffeine]);



  const handleResetCamera = useCallback(() => {
    setCameraResetCount((c) => c + 1);
    sound.playClick(1.2);
  }, []);

  const handleCommand = useCallback((cmdStr: string) => {
    const clean = cmdStr.trim().toLowerCase();
    if (!clean) return;

    sound.playClick(1.2);

    const tokens = clean.split(/\s+/);
    const primary = tokens[0];
    const arg = tokens.slice(1).join(" ").trim();

    let responseLine = "";

    if (primary === "color" || primary === "theme") {
      if (!arg) {
        // Enter interactive picker mode with live preview
        previousThemeRef.current = activeTheme;
        const currIdx = Math.max(0, WORKSTATION_THEMES.findIndex((t) => t.id === activeTheme.id));
        setPickerIndex(currIdx);
        setPickerMode("color");
        const menuLines = buildColorPickerLines(currIdx, activeTheme.id);
        setTerminalLines((prev) => [
          ...prev.slice(-6),
          `[neeraj@sys ~]$ ${cmdStr}`,
          ...menuLines,
        ]);
        setInput("");
        return;
      } else {
        // Direct command: color <name> or color <hex>
        const matched = WORKSTATION_THEMES.find(
          (t) => t.id === arg || t.name.toLowerCase().includes(arg) || t.hex.toLowerCase() === arg
        );
        if (matched) {
          setActiveTheme(matched);
          responseLine = `[OK] Theme accent changed to ${matched.name.toUpperCase()} (${matched.hex})`;
        } else {
          responseLine = `[ERR] Unknown color: "${arg}". Available: ${WORKSTATION_THEMES.map((t) => t.id).join(", ")}. Or type 'color' for interactive menu.`;
        }
      }
    } else if (primary === "font" || primary === "typography") {
      if (!arg) {
        // Enter interactive font picker mode with live preview
        previousFontRef.current = activeFont;
        const currIdx = Math.max(0, TERMINAL_FONTS.findIndex((f) => f.id === activeFont.id));
        setPickerIndex(currIdx);
        setPickerMode("font");
        const menuLines = buildFontPickerLines(currIdx, activeFont.id);
        setTerminalLines((prev) => [
          ...prev.slice(-6),
          `[neeraj@sys ~]$ ${cmdStr}`,
          ...menuLines,
        ]);
        setInput("");
        return;
      } else {
        // Direct command: font <name>
        const matched = findTerminalFont(arg);
        if (matched) {
          setActiveFont(matched);
          try {
            localStorage.setItem("neeraj_workstation_font", matched.id);
          } catch {}
          responseLine = `[OK] Terminal font changed to ${matched.name.toUpperCase()} (${matched.personality})`;
        } else {
          responseLine = `[ERR] Unknown font: "${arg}". Available: ${TERMINAL_FONTS.map((f) => f.id).join(", ")}. Or type 'font' for interactive menu.`;
        }
      }
    } else {
      switch (clean) {
        case "help":
          responseLine = "[HELP] Commands: whoami, avatar, ktcc, coffee, mouse, font, color, credits, license, brotoraise, stack, socials, reset, clear";
          break;
        case "whoami":
          responseLine = `[WHOAMI] Neeraj M (${DEVELOPER_PROFILE.age}yo) // BCA @ SNCT Kollam, Kerala`;
          break;
        case "avatar":
        case "neeraj":
          responseLine = "[IMG:avatar]";
          break;
        case "mouse":
        case "dpi":
          responseLine = `[MOUSE] Tactical Gaming Mouse // ${DPI_PRESETS[dpiIndexRef.current % DPI_PRESETS.length]} DPI // 1000Hz Optical Sensor // Braided USB-A (3D Model by jerard27, CC BY 4.0)`;
          break;
        case "credits":
        case "attribution":
        case "author":
          responseLine = "[CREDITS] 3D Workstation Architecture by Neeraj M (@neeraajm) // 3D Models: Gaming Mouse (jerard27), Phone (Alain Sorazu), Watch (Mateusz Woliński), Router (SanForge Studio) [CC BY 4.0]";
          break;
        case "license":
          responseLine = "[LICENSE] MIT License + Non-Commercial & Mandatory Visible UI Attribution Clause (@neeraajm)";
          break;
        case "ktcc":
        case "phone":
        case "mobile":
        case "smartphone":
          responseLine = "[PHONE] Launching interactive 3D smartphone & KTCC platform...";
          setActiveModal("phone");
          break;
        case "coffee":
        case "sponsor":
        case "donate":
        case "caffeine":
        case "kofi":
        case "upi":
          responseLine = "[CAFFEINE] Dispensing sponsor & coffee channels (UPI & Ko-fi)...";
          setActiveModal("coffee");
          break;
        case "refill":
          setCaffeine(100);
          responseLine = "[OK] Emergency barista protocol invoked. Caffeine restored to 100%! ☕✨";
          break;
        case "brotoraise":
          responseLine = "[BROTORAISE] Complaint Management System // Next.js + Postgres";
          break;
        case "stack":
          responseLine = "[STACK] Cloudflare Pages + Supabase ACID + Cloudflare R2 + GitHub Actions";
          break;
        case "socials":
          responseLine = "[LINKS] GitHub: neeraajm | IG: @neeraajm | Ko-fi: neerajm | Mail: hi.neerajm@gmail.com";
          break;
        case "reset":
        case "home":
          responseLine = "[OK] Camera view restored to origin";
          handleResetCamera();
          break;
        case "clear":
          setTerminalLines([]);
          setInput("");
          setHistoryIndex(-1);
          return;
        default:
          responseLine = `[ERR] Unknown command: "${clean}". Type 'help'.`;
          break;
      }
    }

    setTerminalLines((prev) => [
      ...prev.slice(-12),
      `[neeraj@sys ~]$ ${cmdStr}`,
      responseLine,
    ]);
    setCommandHistory((prev) => [...prev, cmdStr]);
    setHistoryIndex(-1);
    setInput("");
  }, [activeTheme, activeFont, handleResetCamera]);

  // Global Keyboard Listener — Streams every keypress directly into the 3D laptop screen
  useEffect(() => {
    setSoundEnabled(sound.getEnabled());

    const handleKeyDown = (e: KeyboardEvent) => {
      // If help dialog is open
      if (showHelp) {
        if (e.key === "Escape" || e.key === "?") {
          setShowHelp(false);
          sound.playClick();
        }
        return;
      }

      // 0. Interactive CLI Color Picker Mode (Works seamlessly in full desk view or while inspecting phone)
      if (pickerMode === "color") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const nextIdx = (pickerIndex - 1 + WORKSTATION_THEMES.length) % WORKSTATION_THEMES.length;
          setPickerIndex(nextIdx);
          const nextTheme = WORKSTATION_THEMES[nextIdx];
          setActiveTheme(nextTheme); // Live preview instantaneously!
          sound.playClick(1.3);
          const menuLines = buildColorPickerLines(nextIdx, previousThemeRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIdx = (pickerIndex + 1) % WORKSTATION_THEMES.length;
          setPickerIndex(nextIdx);
          const nextTheme = WORKSTATION_THEMES[nextIdx];
          setActiveTheme(nextTheme); // Live preview instantaneously!
          sound.playClick(1.3);
          const menuLines = buildColorPickerLines(nextIdx, previousThemeRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= WORKSTATION_THEMES.length) {
          e.preventDefault();
          const nextIdx = keyNum - 1;
          setPickerIndex(nextIdx);
          const nextTheme = WORKSTATION_THEMES[nextIdx];
          setActiveTheme(nextTheme);
          sound.playClick(1.3);
          const menuLines = buildColorPickerLines(nextIdx, previousThemeRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          const chosen = WORKSTATION_THEMES[pickerIndex];
          setActiveTheme(chosen);
          setPickerMode("none");
          sound.playNodePulse();
          setTerminalLines((prev) => [
            ...prev,
            `[OK] Profile saved: ${chosen.name.toUpperCase()} (${chosen.hex})`,
          ]);
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          const reverted = previousThemeRef.current;
          setActiveTheme(reverted);
          setPickerMode("none");
          sound.playClick();
          setTerminalLines((prev) => [
            ...prev,
            `[CANCEL] Restored previous profile: ${reverted.name.toUpperCase()}`,
          ]);
          return;
        }

        return;
      }

      // 0b. Interactive CLI Font Picker Mode
      if (pickerMode === "font") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const nextIdx = (pickerIndex - 1 + TERMINAL_FONTS.length) % TERMINAL_FONTS.length;
          setPickerIndex(nextIdx);
          const nextFont = TERMINAL_FONTS[nextIdx];
          setActiveFont(nextFont); // Live preview instantaneously on the 3D screen!
          sound.playClick(1.3);
          const menuLines = buildFontPickerLines(nextIdx, previousFontRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIdx = (pickerIndex + 1) % TERMINAL_FONTS.length;
          setPickerIndex(nextIdx);
          const nextFont = TERMINAL_FONTS[nextIdx];
          setActiveFont(nextFont); // Live preview instantaneously on the 3D screen!
          sound.playClick(1.3);
          const menuLines = buildFontPickerLines(nextIdx, previousFontRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= TERMINAL_FONTS.length) {
          e.preventDefault();
          const nextIdx = keyNum - 1;
          setPickerIndex(nextIdx);
          const nextFont = TERMINAL_FONTS[nextIdx];
          setActiveFont(nextFont);
          sound.playClick(1.3);
          const menuLines = buildFontPickerLines(nextIdx, previousFontRef.current.id);
          setTerminalLines((prev) => [
            ...prev.slice(0, -menuLines.length),
            ...menuLines,
          ]);
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          const chosen = TERMINAL_FONTS[pickerIndex];
          setActiveFont(chosen);
          try {
            localStorage.setItem("neeraj_workstation_font", chosen.id);
          } catch {
            // ignore
          }
          setPickerMode("none");
          sound.playNodePulse();
          setTerminalLines((prev) => [
            ...prev,
            `[OK] Font saved: ${chosen.name.toUpperCase()} (${chosen.personality})`,
          ]);
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          const reverted = previousFontRef.current;
          setActiveFont(reverted);
          setPickerMode("none");
          sound.playClick();
          setTerminalLines((prev) => [
            ...prev,
            `[CANCEL] Restored previous font: ${reverted.name.toUpperCase()}`,
          ]);
          return;
        }

        return;
      }

      // If inspecting a non-phone modal (e.g. ID card, notes, coffee) while not in picker mode, only handle Escape
      if (activeModal !== "none" && activeModal !== "phone") {
        if (e.key === "Escape") {
          setActiveModal("none");
          sound.playClick();
        }
        return;
      }

      // If typing inside our input element, let the input tag handle text input natively for virtual keyboards
      if (document.activeElement === inputRef.current) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCommand(input);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowMobileInput(false);
          inputRef.current?.blur();
          setInput("");
          sound.playClick();
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (commandHistory.length > 0) {
            const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(nextIdx);
            setInput(commandHistory[nextIdx]);
            sound.playHover();
          }
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (historyIndex !== -1) {
            const nextIdx = historyIndex + 1;
            if (nextIdx >= commandHistory.length) {
              setHistoryIndex(-1);
              setInput("");
            } else {
              setHistoryIndex(nextIdx);
              setInput(commandHistory[nextIdx]);
            }
            sound.playHover();
          }
          return;
        }
        return;
      }

      // Don't intercept browser system shortcuts (Ctrl+R, Ctrl+Shift+R, Cmd+R, Ctrl+C, F5, F12, etc.)
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      // 0. Pure Shift+R or Alt+R -> Reset 3D Camera View
      if ((e.shiftKey && e.key.toLowerCase() === "r") || (e.altKey && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        handleResetCamera();
        return;
      }

      // 1. Enter key -> Execute Command on Laptop Screen
      if (e.key === "Enter") {
        e.preventDefault();
        handleCommand(input);
        return;
      }

      // 2. Backspace key -> Delete character
      if (e.key === "Backspace") {
        e.preventDefault();
        sound.playClick(1.8);
        setInput((prev) => prev.slice(0, -1));
        return;
      }

      // 3. Tab key -> Auto-complete
      if (e.key === "Tab") {
        e.preventDefault();
        const matching = QUICK_COMMANDS.find((cmd) => cmd.startsWith(input.toLowerCase()));
        if (matching) {
          sound.playNodePulse();
          setInput(matching);
        }
        return;
      }

      // 4. ArrowUp -> Previous command in history
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(nextIdx);
          setInput(commandHistory[nextIdx]);
          sound.playHover();
        }
        return;
      }

      // 5. ArrowDown -> Next command in history
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const nextIdx = historyIndex + 1;
          if (nextIdx >= commandHistory.length) {
            setHistoryIndex(-1);
            setInput("");
          } else {
            setHistoryIndex(nextIdx);
            setInput(commandHistory[nextIdx]);
          }
          sound.playHover();
        }
        return;
      }

      // 6. Escape -> Close modal if open, otherwise clear typing input
      if (e.key === "Escape") {
        e.preventDefault();
        if (activeModal !== "none") {
          setActiveModal("none");
          setInput("");
          sound.playClick();
          return;
        }
        setInput("");
        setHistoryIndex(-1);
        sound.playClick();
        return;
      }

      // 7. Regular printable characters -> Append directly to input
      if (e.key.length === 1) {
        e.preventDefault();
        sound.playClick(1.3 + Math.random() * 0.4);
        setInput((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, showHelp, input, commandHistory, historyIndex, pickerMode, pickerIndex, handleCommand]);

  const handleSelectObject = useCallback((id: InteractivePropId) => {
    switch (id) {
      case "id-card":
        setActiveModal("id-card");
        break;
      case "laptop":
        sound.playClick(1.5);
        if (typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0)) {
          setShowMobileInput(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 60);
        }
        break;
      case "phone":
        setActiveModal("phone");
        break;
      case "mouse": {
        sound.playClick(1.8);
        setMouseTriggerCount((c) => c + 1);
        mouseClicksRef.current += 1;

        if (mouseClicksRef.current % 4 === 0) {
          dpiIndexRef.current += 1;
          const newDpi = DPI_PRESETS[dpiIndexRef.current % DPI_PRESETS.length];
          setTerminalLines((lines) => [
            ...lines.slice(-6),
            `[neeraj@sys ~]$ [EVENT] OPTICAL SENSOR: DPI PRESET SWITCH`,
            `[SYS] MOUSE: ${newDpi} DPI // 1000Hz POLLING // TOTAL CLICKS: ${mouseClicksRef.current} 🖱️`,
          ]);
        } else {
          const currentDpi = DPI_PRESETS[dpiIndexRef.current % DPI_PRESETS.length];
          setTerminalLines((lines) => [
            ...lines.slice(-6),
            `[neeraj@sys ~]$ [EVENT] OPTICAL MICRO-SWITCH CLICK`,
            `[SYS] MOUSE: ${currentDpi} DPI // 1000Hz // CLICKS: ${mouseClicksRef.current} 🖱️`,
          ]);
        }
        break;
      }
      case "hologram":
        sound.playNodePulse();
        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [EVENT] HOLOGRAM: STARK_PROJECTION_TOGGLE`,
          `[SYS] TOPOLOGY: FIBONACCI_SPHERE // 280 NODES // 3.6x ORBITAL_GRID`,
        ]);
        break;
      case "coffee": {
        if (caffeine <= 0) {
          sound.playClink();
          const emptyMsg = EMPTY_TAP_MESSAGES[emptyTapIndexRef.current % EMPTY_TAP_MESSAGES.length];
          emptyTapIndexRef.current += 1;

          setTerminalLines((lines) => [
            ...lines.slice(-6),
            `[neeraj@sys ~]$ [EVENT] DESK_SENSOR: EMPTY MUG TAPPED`,
            `[SYS] CAFFEINE: 0% // ${emptyMsg}`,
            `[SYS] REFILL: DENIED. 🪫`,
          ]);

          setTimeout(() => {
            setActiveModal("coffee");
          }, 320);
          break;
        }

        // Active coffee present: Trigger procedural 3D lift animation and synthesized sip
        sound.playSip();
        setSipTriggerCount((prev) => prev + 1);

        let nextLevel = 65;
        let eventTag = "[EVENT] DESK_SENSOR: MUG SENSOR ACTIVE";
        let sysMsg = "[SYS] CAFFEINE: 65% // Hey... that's my coffee.";
        let shouldOpenModal = false;

        if (caffeine > 65) {
          nextLevel = 65;
          eventTag = "[EVENT] DESK_SENSOR: MUG SENSOR ACTIVE";
          sysMsg = "[SYS] CAFFEINE: 65% // Hey... that's my coffee.";
        } else if (caffeine > 35) {
          nextLevel = 35;
          eventTag = "[EVENT] DESK_SENSOR: MUG SENSOR ACTIVE";
          sysMsg = "[SYS] CAFFEINE: 35% // Seriously?";
        } else if (caffeine > 12) {
          nextLevel = 12;
          eventTag = "[EVENT] DESK_SENSOR: MUG SENSOR ACTIVE";
          sysMsg = "[SYS] CAFFEINE: 12% // You're really finishing the whole thing?";
        } else {
          nextLevel = 0;
          eventTag = "[EVENT] DESK_SENSOR: MUG SENSOR ACTIVE";
          sysMsg = "[SYS] CAFFEINE: 0% // THAT WAS MY COFFEE!! ☕";
          shouldOpenModal = true;
        }

        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ ${eventTag}`,
          sysMsg,
        ]);

        setCaffeine(nextLevel);
        try {
          localStorage.setItem("neeraj_workstation_caffeine", String(nextLevel));
        } catch {
          // ignore
        }

        if (shouldOpenModal) {
          setTimeout(() => {
            sound.playSuccess();
            setActiveModal("coffee");
          }, 950);
        }
        break;
      }
      case "clock": {
        const now = new Date();
        const ist24 = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const ist12 = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        });
        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [EVENT] ATOMIC_CLOCK: FORMAT_TOGGLED (12H ⟷ 24H)`,
          `[SYS] IST TIME: ${ist24} / ${ist12} // 7-SEGMENT LED DISPLAY // ASIA/KOLKATA ⏰`,
        ]);
        break;
      }
      case "router": {
        sound.playNodePulse();
        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [EVENT] GATEWAY_ROUTER: GIGABIT_AC2600`,
          `[SYS] LINK: ACTIVE // LATENCY: 4ms // BANDWIDTH: 1.0 Gbps // STATUS: 100% HEALTHY 🌐`,
        ]);
        break;
      }
      case "watch": {
        sound.playClick(1.8);
        const now = new Date();
        const istStr = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [EVENT] TACTICAL_CHRONO: ATOMIC_CALIBRATION`,
          `[SYS] WRISTWATCH TIME: ${istStr} // WR 50M // BATTLESTATION_SYNCED ⌚`,
        ]);
        break;
      }
      case "power-board": {
        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [EVENT] POWER_DELIVERY: 4-SOCKET SURGE PROTECTOR`,
          `[SYS] MAINS: 240V AC 50Hz // ASUS TUF 200W + ROUTER 12V DC // STATUS: SURGE PROTECTED ⚡`,
        ]);
        break;
      }
    }
  }, [caffeine]);

  const closeModal = () => {
    sound.playClick();
    if (activeModal === "coffee") {
      if (hasDonatedOrInteractedRef.current) {
        setCaffeine(100);
        hasDonatedOrInteractedRef.current = false;
        const refillMsg = REFILL_CONFIRMED_MESSAGES[refillIndexRef.current % REFILL_CONFIRMED_MESSAGES.length];
        refillIndexRef.current += 1;

        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [SYS_LOG] REFILL CONFIRMED`,
          `[SYS] CAFFEINE: 100% // ${refillMsg}`,
        ]);
      } else if (caffeine <= 0) {
        const theftMsg = THEFT_UNRESOLVED_MESSAGES[theftExitIndexRef.current % THEFT_UNRESOLVED_MESSAGES.length];
        theftExitIndexRef.current += 1;

        setTerminalLines((lines) => [
          ...lines.slice(-6),
          `[neeraj@sys ~]$ [SYS_LOG] THEFT UNRESOLVED`,
          `[SYS] COFFEE: STOLEN // DEBT: UNPAID`,
          `[SYS] CAFFEINE: 0% // ${theftMsg}`,
        ]);
      }
    }
    setActiveModal("none");
  };

  const isBlurred = activeModal !== "none";

  return (
    <div
      className="fixed inset-0 w-screen h-[100dvh] bg-black font-mono overflow-hidden select-none touch-none"
      style={{ color: activeTheme.hex }}
    >
      {/* 🎯 FUTURISTIC PRECISION HUD CUSTOM CURSOR */}
      <CustomCursor themeHex={activeTheme.hex} />

      {/* 🟢 ATMOSPHERIC CYBERPUNK SCENE LOADER & BLUR TRANSITION */}
      <AnimatePresence>
        {!isSceneReady && (
          <motion.div
            key="scene-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.03 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#04070b] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
          >
            {/* Background Cyber Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${activeTheme.hex}18 0%, rgba(3,6,10,0.95) 70%, #020407 100%)`,
              }}
            />
            {/* CRT Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4 max-w-sm">
              {/* Glowing Pulse Glyph */}
              <motion.div
                animate={{ scale: [0.96, 1.04, 0.96], rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative"
                style={{
                  borderColor: activeTheme.hex,
                  boxShadow: `0 0 30px ${activeTheme.hex}40, inset 0 0 15px ${activeTheme.hex}20`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs"
                  style={{ borderColor: `${activeTheme.hex}88`, color: activeTheme.hex }}
                >
                  0x
                </div>
              </motion.div>

              {/* Title & Telemetry */}
              <div className="space-y-1">
                <div className="font-bold text-sm tracking-wider text-white">
                  NEERAJ_OS // 3D WORKSTATION
                </div>
                <div
                  className="text-[11px] font-mono tracking-widest uppercase flex items-center justify-center gap-1.5"
                  style={{ color: activeTheme.hex }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeTheme.hex }} />
                  <span>INITIALIZING SPATIAL ENGINE...</span>
                </div>
              </div>

              {/* Loading Bar */}
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: activeTheme.hex,
                    boxShadow: `0 0 10px ${activeTheme.hex}`,
                  }}
                />
              </div>

              <div className="text-[9px] text-neutral-500 font-mono">
                COMPILING OPTICAL DEPTH BUFFERS & SHADERS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 FULL VIEWPORT 3D WEBGL WORKSTATION SCENE */}
      <motion.div
        initial={{ filter: "blur(20px)", scale: 0.98, opacity: 0.6 }}
        animate={{
          filter: isSceneReady
            ? isBlurred
              ? "blur(0px) brightness(0.75)"
              : "blur(0px) brightness(1)"
            : "blur(20px) brightness(0.8)",
          scale: isSceneReady ? (isBlurred ? 0.995 : 1) : 0.98,
          opacity: 1,
        }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full h-full relative ${
          isBlurred ? "pointer-events-none" : ""
        }`}
      >
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25 z-10" />

        {/* 3D WebGL Canvas */}
        <SceneCanvas
          onSelectObject={handleSelectObject}
          onReady={() => setIsSceneReady(true)}
          terminalLines={terminalLines}
          currentInput={input}
          isPaused={isBlurred || showHelp}
          idCardFacing={idCardFacing}
          cameraResetCount={cameraResetCount}
          sipTriggerCount={sipTriggerCount}
          mouseTriggerCount={mouseTriggerCount}
          theme={activeTheme}
          caffeineLevel={caffeine}
          activeFont={activeFont}
          isPickerActive={pickerMode !== "none"}
        />
      </motion.div>

      {/* 🟢 TOP-LEFT LIVE TELEMETRY HUD (LOCATION, TIME & DATE) - ALWAYS CRISP & VISIBLE */}
      <div className="fixed top-3 left-3 z-[60] flex items-center pointer-events-auto">
        <LiveClock themeHex={activeTheme.hex} />
      </div>

      {/* 🟢 TOP-RIGHT WORKSPACE CONTROLS (FPS SPARKLINE, RESET, SFX & GUIDE) - ALWAYS ACCESSIBLE */}
      <div className="fixed top-3 right-3 z-[60] flex items-center gap-2 pointer-events-auto">
        {/* Real-time Render & FPS Telemetry Sparkline */}
        <FpsSparkline themeHex={activeTheme.hex} />

        {/* Reset Camera View Button */}
        <button
          onClick={handleResetCamera}
          className="bg-transparent hover:bg-white/10 p-1.5 rounded-[4px] transition-all cursor-pointer flex items-center justify-center active:scale-95"
          style={{
            color: activeTheme.hex,
          }}
          title="Reset 3D Camera View (Shift+R / 'reset')"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* SFX Audio Toggle */}
        <button
          onClick={() => {
            const next = sound.toggle();
            setSoundEnabled(next);
          }}
          className="bg-transparent hover:bg-white/10 p-1.5 rounded-[4px] transition-all cursor-pointer flex items-center justify-center active:scale-95"
          style={{
            color: activeTheme.hex,
          }}
          title={soundEnabled ? "Mute Web Audio SFX" : "Enable Web Audio SFX"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
        </button>

        {/* Guide / Help Button */}
        <button
          onClick={() => setShowHelp((prev) => !prev)}
          className="bg-transparent hover:bg-white/10 p-1.5 rounded-[4px] transition-all cursor-pointer flex items-center justify-center active:scale-95"
          style={{
            color: activeTheme.hex,
          }}
          title="Controls Guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 🟢 FOCUSED MODAL OVERLAYS (HIGH-PERFORMANCE ZERO-BLUR SCRIM) */}
      <AnimatePresence>
        {activeModal !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className={`fixed inset-0 z-50 ${
              activeModal === "phone" ? "bg-black/25 backdrop-blur-[0.5px]" : "bg-black/60"
            } flex flex-col items-center justify-center p-3 sm:p-6`}
          >
            {/* Selected Modal */}
            {activeModal === "phone" ? (
              <PhoneModal
                onClose={closeModal}
                theme={activeTheme}
                onOpenTerminal={() => {
                  closeModal();
                  handleSelectObject("laptop");
                }}
                onOpenIdCard={() => {
                  setActiveModal("id-card");
                }}
              />
            ) : (
              <div className="w-full flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  {activeModal === "id-card" && (
                    <AsciiIdCard
                      initialFacing={idCardFacing}
                      onFacingChange={setIdCardFacing}
                      theme={activeTheme}
                    />
                  )}
                  {activeModal === "sticky-note" && (
                    <NotesModal onClose={closeModal} theme={activeTheme} />
                  )}
                  {activeModal === "coffee" && (
                    <CoffeeModal
                      onClose={closeModal}
                      theme={activeTheme}
                      onInteracted={() => {
                        hasDonatedOrInteractedRef.current = true;
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 GUIDE / SHORTCUTS MODAL (RESPONSIVE TOUCH & KEYBOARD) */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] max-h-[88vh] flex flex-col bg-[#000803] border-2 rounded-[10px] p-3.5 sm:p-4 font-mono shadow-2xl space-y-3 overflow-hidden"
              style={{
                borderColor: activeTheme.hex,
                color: activeTheme.hex,
                boxShadow: `0 0 35px ${activeTheme.hex}40`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between border-b pb-2 font-bold text-xs"
                style={{ borderColor: `${activeTheme.hex}4d` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.hex }} />
                  <span className="tracking-wider">// WORKSTATION GUIDE</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHelp(false);
                    sound.playClick();
                  }}
                  className="px-2 py-0.5 rounded border border-white/20 hover:bg-white/10 active:scale-95 transition-all text-xs cursor-pointer font-bold"
                >
                  [ ✕ CLOSE ]
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded bg-black/60 border text-xs" style={{ borderColor: `${activeTheme.hex}33` }}>
                <button
                  type="button"
                  onClick={() => {
                    setHelpTab("touch");
                    sound.playClick();
                  }}
                  className={`py-1.5 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    helpTab === "touch"
                      ? "border shadow"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: helpTab === "touch" ? `${activeTheme.hex}26` : undefined,
                    borderColor: helpTab === "touch" ? activeTheme.hex : "transparent",
                    color: helpTab === "touch" ? activeTheme.hex : "#ffffff",
                  }}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>MOBILE / TOUCH</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHelpTab("desktop");
                    sound.playClick();
                  }}
                  className={`py-1.5 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    helpTab === "desktop"
                      ? "border shadow"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: helpTab === "desktop" ? `${activeTheme.hex}26` : undefined,
                    borderColor: helpTab === "desktop" ? activeTheme.hex : "transparent",
                    color: helpTab === "desktop" ? activeTheme.hex : "#ffffff",
                  }}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>DESKTOP / KEYS</span>
                </button>
              </div>

              {/* Body Content */}
              <div className="overflow-y-auto max-h-[48vh] pr-1 space-y-2 text-xs">
                {helpTab === "touch" ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>👆 1-Finger Drag</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Orbit &amp; Rotate 3D Desk</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>🤏 2-Finger Pinch</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Zoom In / Zoom Out</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>💻 Tap Laptop</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Open Virtual Keyboard &amp; CLI</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>🪪 Tap ID Card</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Inspect Verified Profile</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>📱 Tap Phone</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Launch KTCC Showcase</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>☕ Tap Mug</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>Sponsor &amp; Caffeine Modal</span>
                    </div>

                    <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>📼 Tap Cassette</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>SFX Audio Toggle</span>
                    </div>

                    <div className="flex items-center justify-between" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold flex items-center gap-1.5 text-white">
                        <span>⚡ Bottom CLI Dock</span>
                      </span>
                      <span style={{ color: activeTheme.hex }}>1-Tap Quick Commands</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">Mouse Drag</span>
                      <span style={{ color: activeTheme.hex }}>Orbit 3D Desk</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">Mouse Wheel</span>
                      <span style={{ color: activeTheme.hex }}>Zoom In / Out</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">Any Keyboard Key</span>
                      <span style={{ color: activeTheme.hex }}>Type on Laptop Screen</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[ENTER]</span>
                      <span style={{ color: activeTheme.hex }}>Execute Command</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[TAB]</span>
                      <span style={{ color: activeTheme.hex }}>Auto-Complete Command</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[↑ / ↓]</span>
                      <span style={{ color: activeTheme.hex }}>History / Live Theme Preview</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[font / typography]</span>
                      <span style={{ color: activeTheme.hex }}>Monospace Font Switcher</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[color / theme]</span>
                      <span style={{ color: activeTheme.hex }}>Interactive RGB Theme Picker</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${activeTheme.hex}26` }}>
                      <span className="font-bold text-white">[Shift + R]</span>
                      <span style={{ color: activeTheme.hex }}>Reset Camera View</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-white">[ESC]</span>
                      <span style={{ color: activeTheme.hex }}>Back to Desk / Cancel</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Try Command Chips (Interactive Direct Execution) */}
              <div className="pt-2 border-t space-y-1.5" style={{ borderColor: `${activeTheme.hex}33` }}>
                <div className="text-[10px] font-bold opacity-75 uppercase tracking-wider" style={{ color: activeTheme.hex }}>
                  // TRY INSTANT COMMANDS:
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {["whoami", "ktcc", "mouse", "font", "color", "stack", "socials", "reset", "clear"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        handleCommand(c);
                        setShowHelp(false);
                      }}
                      className="px-2 py-0.5 rounded border bg-black/60 hover:bg-white/15 active:scale-95 transition-all cursor-pointer font-bold font-mono"
                      style={{
                        borderColor: `${activeTheme.hex}4d`,
                        color: activeTheme.hex,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 MOBILE ONLY CYBER TERMINAL COMMAND BAR (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 pointer-events-auto font-mono pb-[env(safe-area-inset-bottom,0px)]">
        <AnimatePresence>
          {showMobileInput && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-[#000803]/95 backdrop-blur-xl border rounded-[8px] p-2 sm:p-2.5 shadow-2xl space-y-2"
              style={{
                borderColor: `${activeTheme.hex}80`,
                boxShadow: `0 0 25px ${activeTheme.hex}33`,
              }}
            >
              {/* Quick Command Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px] sm:text-xs">
                <span className="text-[9px] font-bold opacity-60 shrink-0 uppercase tracking-wider" style={{ color: activeTheme.hex }}>
                  // QUICK:
                </span>
                {QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => {
                      handleCommand(cmd);
                      if (window.innerWidth < 768) {
                        inputRef.current?.focus();
                      }
                    }}
                    className="px-2 py-0.5 rounded-[3px] border bg-black/60 hover:bg-white/10 active:scale-95 transition-all shrink-0 cursor-pointer font-mono"
                    style={{
                      borderColor: `${activeTheme.hex}4d`,
                      color: activeTheme.hex,
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Input Form Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommand(input);
                }}
                className="flex items-center gap-2 bg-black/80 border rounded-[5px] px-2.5 py-1.5"
                style={{ borderColor: `${activeTheme.hex}4d` }}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.hex }} />
                <span className="text-[11px] font-bold shrink-0 hidden xs:inline" style={{ color: `${activeTheme.hex}cc` }}>
                  neeraj@sys:~$
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    sound.playClick(1.3 + Math.random() * 0.4);
                    setInput(e.target.value);
                  }}
                  placeholder="Type command (whoami, ktcc, stack, color...)"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-xs font-mono outline-none text-white placeholder:text-gray-500 placeholder:text-[10px] sm:placeholder:text-xs min-w-0"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-[3px] border font-bold text-[10px] sm:text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                  style={{
                    borderColor: activeTheme.hex,
                    backgroundColor: `${activeTheme.hex}26`,
                    color: activeTheme.hex,
                  }}
                >
                  <span>RUN</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileInput(false);
                    inputRef.current?.blur();
                    sound.playClick();
                  }}
                  className="p-1 rounded-[3px] text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Close Command Bar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
