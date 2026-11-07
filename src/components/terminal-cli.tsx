"use client";

import { useState, useRef, useEffect } from "react";
import { sound } from "@/lib/sound";
import { DecodeText } from "./ui/decode-text";
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles, Copy, Check, Trash2, Volume2 } from "lucide-react";
import { DEVELOPER_PROFILE } from "@/lib/constants";

interface LogEntry {
  id: string;
  type: "command" | "output" | "error" | "matrix";
  content: string | React.ReactNode;
}

const INITIAL_COMMANDS = [
  "help",
  "whoami",
  "architecture",
  "ktcc",
  "stack",
  "lab",
  "matrix",
  "credits",
  "license",
  "socials",
  "sound",
  "clear",
];

export function TerminalCli() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "welcome",
      type: "output",
      content: (
        <div className="text-gray-300 space-y-1 font-mono text-xs md:text-sm">
          <div className="text-[#00f0ff] font-bold">
            NEERAJ_OS v2.4.0 (x86_64-linux-gnu // TokyoNight Kernel)
          </div>
          <div className="text-gray-400 text-xs">
            Type <span className="text-[#10b981] font-bold">help</span> to view available system commands or click the chips below.
          </div>
        </div>
      ),
    },
  ]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const executeCommand = (cmdStr: string) => {
    const cleanCmd = cmdStr.trim().toLowerCase();
    if (!cleanCmd) return;

    sound.playClick(1.2);

    const cmdEntry: LogEntry = {
      id: Math.random().toString(),
      type: "command",
      content: cmdStr,
    };

    setHistory((prev) => [...prev, cmdStr]);
    setHistoryIndex(-1);

    let outputEntry: LogEntry;

    switch (cleanCmd) {
      case "help":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-white font-bold mb-1">AVAILABLE COMMANDS:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <div><span className="text-[#00f0ff] font-bold">whoami</span> — Developer credentials & philosophy</div>
                <div><span className="text-[#00f0ff] font-bold">architecture</span> — 5-Layer cloud blueprint</div>
                <div><span className="text-[#00f0ff] font-bold">ktcc</span> — Flagship tournament platform details</div>
                <div><span className="text-[#00f0ff] font-bold">stack</span> — $0.00/mo cloud infrastructure breakdown</div>
                <div><span className="text-[#00f0ff] font-bold">lab</span> — Jump to ACID SQL Ledger Sandbox</div>
                <div><span className="text-[#00f0ff] font-bold">matrix</span> — Stream green cyber ASCII matrix</div>
                <div><span className="text-[#00f0ff] font-bold">credits</span> — 3D Workstation author & asset credits</div>
                <div><span className="text-[#00f0ff] font-bold">license</span> — Open-source license & attribution terms</div>
                <div><span className="text-[#00f0ff] font-bold">socials</span> — Direct GitHub, Instagram & Email links</div>
                <div><span className="text-[#00f0ff] font-bold">sound</span> — Toggle Web Audio synthesized SFX</div>
                <div><span className="text-[#00f0ff] font-bold">clear</span> — Wipe terminal logs</div>
              </div>
            </div>
          ),
        };
        break;

      case "whoami":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#00f0ff] font-bold">NAME: Neeraj M</div>
              <div>ROLE: Solo Builder & Systems Engineer (Age {DEVELOPER_PROFILE.age})</div>
              <div>EDUCATION: Pursuing BCA @ Sree Narayana College of Technology (SNCT), Kollam</div>
              <div>FOCUS: Next.js 15, Android Hybrid Engines, PostgreSQL RLS & $0 Cloud Infrastructure</div>
              <div className="text-[#10b981] font-bold mt-1">
                &quot;The Extended Mind: Architecture is born when human taste meets autonomous AI execution.&quot;
              </div>
            </div>
          ),
        };
        break;

      case "architecture":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#f59e0b] font-bold">5-LAYER ZERO-COST CLOUD ARCHITECTURE:</div>
              <div>1. [CLIENT] Next.js 15 PWA + Capacitor Android Release APK</div>
              <div>2. [ROUTING] Vercel Edge SSR with Turbopack (187ms hot reload)</div>
              <div>3. [AUTH & FIREWALL] Supabase GoTrue + Zero-Trust PostgreSQL RLS</div>
              <div>4. [LEDGER] Immutable double-entry SQL transactions (100% ACID)</div>
              <div>5. [EDGE CDN] Cloudflare R2 APAC bucket ($0.00 permanent egress)</div>
            </div>
          ),
        };
        break;

      case "ktcc":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#00f0ff] font-bold">KTCC (KERALA TOURERS COMMUNITY CHAMPIONSHIP)</div>
              <div>• Live Platform: https://ktccofficial.vercel.app</div>
              <div>• Scale: 12 Active Tournament Teams, 100+ Match Events</div>
              <div>• Engine: Immutable SQL point ledger, zero duplicate claims</div>
              <div>• Mobile: Signed Android APK with native in-app auto-updater</div>
              <div>• Cost: $0.00/month permanent hosting across 1,000+ daily requests</div>
            </div>
          ),
        };
        break;

      case "stack":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#10b981] font-bold">TECHNICAL STACK & TOOLCHAIN:</div>
              <div>• Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4</div>
              <div>• Mobile: Capacitor 7 Android Native Bridge, Java OTA Bridge</div>
              <div>• Backend: Supabase (PostgreSQL, Edge Functions, RLS, Storage)</div>
              <div>• CDN & Edge: Cloudflare R2 APAC, Cloudflare Workers</div>
              <div>• CI/CD: GitHub Actions (Automated Gradle Keystore Builds)</div>
              <div>• AI Tooling: Antigravity IDE, Claude 3.7, Gemini 2.5 Pro</div>
            </div>
          ),
        };
        break;

      case "lab":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#10b981] font-bold">REDIRECTING TO LAB SANDBOX...</div>
              <div>Scroll to the ACID SQL Ledger Sandbox below to simulate database double-spend attacks!</div>
            </div>
          ),
        };
        const labElem = document.getElementById("lab");
        labElem?.scrollIntoView({ behavior: "smooth" });
        break;

      case "matrix":
        sound.playSuccess();
        outputEntry = {
          id: Math.random().toString(),
          type: "matrix",
          content: (
            <div className="text-[#10b981] font-mono text-xs leading-none tracking-widest break-all select-none animate-pulse">
              {Array.from({ length: 8 })
                .map(() => "01010110 01001001 01010011 01001001 01001111 01001110 0xNEERAJ λ§#░█*+~ 01010011 01010100 01000001 01000011 01001011")
                .join("\n")}
            </div>
          ),
        };
        break;

      case "socials":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div>• GitHub: <a href="https://github.com/neeraajm" target="_blank" className="text-[#00f0ff] underline">github.com/neeraajm</a></div>
              <div>• Instagram: <a href="https://instagram.com/neeraajm" target="_blank" className="text-[#00f0ff] underline">@neeraajm</a></div>
              <div>• Email: <span className="text-[#10b981]">hi.neerajm@gmail.com</span></div>
              <div>• Portfolio: <a href="https://neerajm.pages.dev" target="_blank" className="text-[#00f0ff] underline">neerajm.pages.dev</a></div>
            </div>
          ),
        };
        break;

      case "credits":
      case "attribution":
      case "author":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#00f0ff] font-bold">3D WORKSTATION & PORTFOLIO CREDITS</div>
              <div>• Original Architecture & Design: <a href="https://github.com/neeraajm" target="_blank" className="text-[#10b981] font-bold underline">Neeraj M (@neeraajm)</a></div>
              <div>• 3D Gaming Mouse: <span className="text-gray-400">jerard27 (Sketchfab • CC BY 4.0)</span></div>
              <div>• 3D Smartphone: <span className="text-gray-400">Alain Sorazu (Sketchfab • CC BY-SA 4.0)</span></div>
              <div>• 3D Digital Watch: <span className="text-gray-400">SpatialNeglect / Mateusz Woliński (Sketchfab • CC BY 4.0)</span></div>
              <div>• 3D Battlestation Router: <span className="text-gray-400">SanForge Studio (Sketchfab • CC BY 4.0)</span></div>
              <div>• 3D Digital Clock: <span className="text-gray-400">In-house procedural model by Neeraj M</span></div>
            </div>
          ),
        };
        break;

      case "license":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs md:text-sm font-mono text-gray-300">
              <div className="text-[#00f0ff] font-bold">OPEN SOURCE LICENSE & BRAND PROTECTION</div>
              <div>• License Type: <span className="text-white font-bold">MIT with Non-Commercial & Brand Protection Clause</span></div>
              <div>• Mandatory UI Attribution: Any public web deployment derived from this codebase MUST keep visible footer credit to <a href="https://github.com/neeraajm" target="_blank" className="text-[#10b981] underline font-bold">@neeraajm</a>.</div>
              <div>• Commercial Resale: <span className="text-red-400 font-bold">Strictly prohibited</span> as a paid theme or template.</div>
            </div>
          ),
        };
        break;

      case "sound":
        const enabled = sound.toggle();
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="text-xs md:text-sm font-mono text-gray-300">
              Web Audio Synthesizer: <span className={enabled ? "text-[#10b981] font-bold" : "text-red-400 font-bold"}>
                {enabled ? "ENABLED (SFX ON)" : "MUTED (SFX OFF)"}
              </span>
            </div>
          ),
        };
        break;

      case "clear":
        setLogs([]);
        return;

      default:
        sound.playError();
        outputEntry = {
          id: Math.random().toString(),
          type: "error",
          content: (
            <div className="text-red-400 text-xs md:text-sm font-mono">
              Command not recognized: &quot;{cmdStr}&quot;. Type <span className="text-[#00f0ff] font-bold">help</span> to view available commands.
            </div>
          ),
        };
        break;
    }

    setLogs((prev) => [...prev, cmdEntry, outputEntry]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playClick(0.9 + Math.random() * 0.3);

    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    }
  };

  const handleCopyLogs = () => {
    sound.playSuccess();
    const textLogs = logs.map((l) => (typeof l.content === "string" ? l.content : `[${l.type}]`)).join("\n");
    navigator.clipboard.writeText(textLogs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cli" className="relative py-20 px-4 max-w-5xl mx-auto z-10 font-mono">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1117] border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs mb-3 shadow-inner">
          <TerminalIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>// INTERACTIVE WEB WORKSTATION</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-sans uppercase">
          <DecodeText text="Cyberdeck Terminal CLI" />
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mt-2 font-mono">
          An embedded command engine. Type commands with your keyboard or tap the quick-action chips below.
        </p>
      </div>

      {/* Terminal Window Box */}
      <div className="rounded-2xl border border-white/15 bg-[#05070a] shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Title Bar */}
        <div className="h-10 bg-[#0d1117] border-b border-white/10 px-4 flex items-center justify-between text-xs text-gray-400 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 font-bold text-gray-300">neeraj@cyberdeck:~ (zsh)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              onMouseEnter={() => sound.playHover()}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Copy Terminal Logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setLogs([]);
              }}
              onMouseEnter={() => sound.playHover()}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Clear Terminal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          className="p-5 min-h-[300px] max-h-[460px] overflow-y-auto space-y-3 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {logs.map((log) => (
            <div key={log.id} className="leading-relaxed">
              {log.type === "command" ? (
                <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-xs md:text-sm">
                  <span className="text-[#10b981]">neeraj@cyberdeck:~$</span>
                  <span>{log.content}</span>
                </div>
              ) : (
                <div className="pl-4 border-l border-white/10">{log.content}</div>
              )}
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-2 text-xs md:text-sm pt-1">
            <span className="text-[#10b981] font-bold">neeraj@cyberdeck:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs md:text-sm caret-[#00f0ff]"
              autoFocus
              placeholder="type 'help' or click buttons below..."
            />
            <button
              onClick={() => {
                executeCommand(input);
                setInput("");
              }}
              className="text-gray-500 hover:text-[#00f0ff] p-1"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div ref={terminalEndRef} />
        </div>

        {/* Quick-Action Chips Footer */}
        <div className="p-3 bg-[#080b10] border-t border-white/10 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-gray-500 mr-1 font-bold">QUICK EXEC:</span>
          {INITIAL_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => sound.playHover()}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-[#00f0ff]/15 hover:border-[#00f0ff]/40 border border-white/8 text-gray-300 hover:text-[#00f0ff] text-[11px] font-mono transition-all active:scale-95 cursor-pointer"
            >
              ${cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
