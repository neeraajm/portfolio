"use client";

import { useState, useRef, useEffect } from "react";
import { sound } from "@/lib/sound";
import { Maximize2, Trash2, CornerDownLeft, Sparkles } from "lucide-react";
import { DEVELOPER_PROFILE } from "@/lib/constants";

interface LogEntry {
  id: string;
  type: "command" | "output" | "error";
  content: React.ReactNode;
}

interface LaptopPropProps {
  onExpand: () => void;
}

const QUICK_COMMANDS = ["help", "whoami", "ktcc", "brotoraise", "stack", "clear"];

export function LaptopProp({ onExpand }: LaptopPropProps) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      type: "output",
      content: (
        <div className="space-y-0.5 text-[10px] sm:text-[11px] leading-relaxed">
          <div className="text-[#00ff66] font-bold">
            NEERAJ_OS v2.4.0 (x86_64 // $0 Cloud Kernel)
          </div>
          <div className="text-[#00ff66]/70">
            Type <span className="text-[#00ff66] font-bold underline">help</span> or click command chips below to execute.
          </div>
        </div>
      ),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      content: (
        <div className="text-[#00ff66] font-bold text-[10px] sm:text-[11px]">
          [neeraj@sys ~]$ {cmdStr}
        </div>
      ),
    };

    let outputEntry: LogEntry;

    switch (cleanCmd) {
      case "help":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">SYSTEM COMMANDS:</div>
              <div>• <span className="font-bold underline">whoami</span> — Developer background &amp; ethos</div>
              <div>• <span className="font-bold underline">ktcc</span> — Tournament platform flagship breakdown</div>
              <div>• <span className="font-bold underline">brotoraise</span> — Complaint management system</div>
              <div>• <span className="font-bold underline">stack</span> — Strict $0.00 cloud architecture breakdown</div>
              <div>• <span className="font-bold underline">stats</span> — APAC latency &amp; ledger telemetry</div>
              <div>• <span className="font-bold underline">socials</span> — GitHub, Instagram, &amp; Email direct links</div>
              <div>• <span className="font-bold underline">clear</span> — Wipe terminal display buffer</div>
            </div>
          ),
        };
        break;

      case "whoami":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">NAME: NEERAJ M</div>
              <div>ROLE: Solo Builder &amp; Systems Engineer ({DEVELOPER_PROFILE.age}yo)</div>
              <div>EDUCATION: Pursuing BCA @ SNCT (Kerala, India 🇮🇳)</div>
              <div>FOCUS: Next.js 15, Android Hybrid Engines, Supabase PostgreSQL</div>
              <div>BUDGET: Strict $0.00/mo Cloud Infrastructure Specialist</div>
            </div>
          ),
        };
        break;

      case "ktcc":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">KTCC PLATFORM (FLAGSHIP SHOWCASE)</div>
              <div>• Live URL: <a href="https://ktccofficial.vercel.app" target="_blank" rel="noopener noreferrer" className="underline font-bold">https://ktccofficial.vercel.app</a></div>
              <div>• Engine: Double-entry immutable SQL point ledger</div>
              <div>• Mobile: Automated GitHub Actions Headless APK CI/CD pipeline</div>
              <div>• Storage: Cloudflare R2 zero-egress APAC CDN bucket</div>
              <div>• Cost: $0.00/mo permanent recurring cost</div>
            </div>
          ),
        };
        break;

      case "brotoraise":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">BROTORAISE // COMPLAINT MANAGEMENT SYSTEM</div>
              <div>• Type: Full-Stack Issue Resolution &amp; Escalation Engine</div>
              <div>• Repo: <a href="https://github.com/neeraajm/broto-raise" target="_blank" rel="noopener noreferrer" className="underline font-bold">github.com/neeraajm/broto-raise</a></div>
              <div>• Architecture: Next.js + PostgreSQL ticket lifecycle management</div>
            </div>
          ),
        };
        break;

      case "stack":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">$0.00 CLOUD INFRASTRUCTURE STACK:</div>
              <div>1. [EDGE] Vercel Hobby Free Tier (Next.js 15 App Router)</div>
              <div>2. [DATABASE] Supabase PostgreSQL (ACID Ledger &amp; RLS)</div>
              <div>3. [STORAGE] Cloudflare R2 (10GB/mo free, 0 egress charges)</div>
              <div>4. [CI/CD] GitHub Actions (2,000 free runner min/mo)</div>
              <div>5. [TOTAL RECURRING BILL] $0.00/month Forever</div>
            </div>
          ),
        };
        break;

      case "stats":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">SYSTEM TELEMETRY:</div>
              <div>• APAC P99 Edge Latency: &lt; 18ms</div>
              <div>• Ledger Double-Entry Consistency: 100% ACID</div>
              <div>• Tournaments Managed: 50+ Events</div>
              <div>• Uptime Target: 99.98% High Availability</div>
            </div>
          ),
        };
        break;

      case "socials":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-0.5 text-[9.5px] sm:text-[10.5px] text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">DEVELOPER SOCIALS:</div>
              <div>• GitHub: <a href="https://github.com/neeraajm" target="_blank" rel="noopener noreferrer" className="underline font-bold">@neeraajm</a></div>
              <div>• Instagram: <a href="https://instagram.com/neeraajm" target="_blank" rel="noopener noreferrer" className="underline font-bold">@neeraajm</a></div>
              <div>• Email: <a href="mailto:hi.neerajm@gmail.com" className="underline font-bold">hi.neerajm@gmail.com</a></div>
            </div>
          ),
        };
        break;

      case "clear":
        setLogs([]);
        setInput("");
        return;

      default:
        outputEntry = {
          id: Math.random().toString(),
          type: "error",
          content: (
            <div className="text-[#00ff66]/60 text-[9.5px] sm:text-[10.5px]">
              Command not recognized: &quot;{cmdStr}&quot;. Type <span className="text-[#00ff66] font-bold">help</span> to list available commands.
            </div>
          ),
        };
        break;
    }

    setLogs((prev) => [...prev, cmdEntry, outputEntry]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto flex flex-col items-center select-none font-mono">
      {/* 🟢 LAPTOP SCREEN (LID) */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full bg-[#000803] border-2 border-[#00ff66] rounded-t-[10px] rounded-b-[3px] p-2.5 sm:p-3 shadow-[0_0_30px_rgba(0,255,102,0.25),inset_0_0_20px_rgba(0,255,102,0.08)] relative overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(0,255,102,0.35)]"
      >
        {/* CRT Scanline effect on screen */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_3px] pointer-events-none opacity-40 z-10" />

        {/* Screen Header Bar */}
        <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-1.5 mb-2 relative z-20 text-[9px] sm:text-[10px] text-[#00ff66]">
          <div className="flex items-center gap-1.5 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            <span>NEERAJ_LAPTOP // CLI_v2.4</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLogs([]);
              }}
              title="Clear Terminal"
              className="p-1 border border-[#00ff66]/30 hover:border-[#00ff66] rounded-[3px] text-[#00ff66]/70 hover:text-[#00ff66] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick(1.4);
                onExpand();
              }}
              title="Fullscreen Terminal"
              className="flex items-center gap-1 px-1.5 py-0.5 border border-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/25 rounded-[3px] text-[8px] sm:text-[9px] font-bold text-[#00ff66] transition-all active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(0,255,102,0.2)]"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>EXPAND</span>
            </button>
          </div>
        </div>

        {/* Terminal Logs Container */}
        <div className="h-[140px] sm:h-[160px] overflow-y-auto space-y-1.5 text-[#00ff66] relative z-20 pr-1 text-left scrollbar-thin scrollbar-thumb-[#00ff66]/30">
          {logs.map((log) => (
            <div key={log.id} className="break-words">
              {log.content}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Interactive Input Line */}
        <div className="pt-2 border-t border-[#00ff66]/30 flex items-center gap-1.5 relative z-20 text-[10px] sm:text-[11px] text-[#00ff66]">
          <span className="font-bold text-[#00ff66] shrink-0">[neeraj@sys ~]$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type 'help' or command..."
            className="flex-1 bg-transparent border-none outline-none text-[#00ff66] placeholder-[#00ff66]/40 font-mono font-bold text-[10px] sm:text-[11px] caret-[#00ff66]"
          />
          <button
            onClick={() => executeCommand(input)}
            className="px-1.5 py-0.5 border border-[#00ff66]/50 hover:border-[#00ff66] rounded-[3px] text-[9px] font-bold text-[#00ff66] hover:bg-[#00ff66]/15 transition-all cursor-pointer shrink-0"
          >
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="pt-1.5 flex flex-wrap items-center gap-1 relative z-20 text-[8px] sm:text-[9px]">
          <span className="text-[#00ff66]/50 font-bold mr-0.5">RUN:</span>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={(e) => {
                e.stopPropagation();
                executeCommand(cmd);
              }}
              className="px-1.5 py-0.2 border border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]/80 hover:text-[#00ff66] bg-[#00ff66]/5 hover:bg-[#00ff66]/20 rounded-[2px] font-bold transition-all cursor-pointer"
            >
              ${cmd}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 LAPTOP HINGE & LOWER DECK */}
      <div className="w-[104%] bg-[#000803] border-x-2 border-b-2 border-[#00ff66] rounded-b-[10px] p-2 sm:p-2.5 shadow-[0_8px_20px_rgba(0,255,102,0.15)] relative">
        {/* Hinge Line */}
        <div className="w-16 h-1 mx-auto bg-[#00ff66]/40 rounded-full mb-1.5" />

        {/* Keyboard Wireframe Grid */}
        <div className="w-[94%] mx-auto bg-black/80 border border-[#00ff66]/30 rounded-[4px] p-1 space-y-0.5">
          {/* Key Rows Simulation */}
          <div className="flex gap-0.5 justify-between">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 border border-[#00ff66]/20 rounded-[1px] bg-[#00ff66]/5" />
            ))}
          </div>
          <div className="flex gap-0.5 justify-between">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 border border-[#00ff66]/20 rounded-[1px] bg-[#00ff66]/5" />
            ))}
          </div>
          <div className="flex gap-0.5 justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 border border-[#00ff66]/20 rounded-[1px] bg-[#00ff66]/5" />
            ))}
          </div>
          {/* Spacebar Row */}
          <div className="flex gap-1 items-center justify-center pt-0.5">
            <div className="w-6 h-1.5 border border-[#00ff66]/20 rounded-[1px] bg-[#00ff66]/5" />
            <div className="w-28 h-1.5 border border-[#00ff66]/40 rounded-[1px] bg-[#00ff66]/10" />
            <div className="w-6 h-1.5 border border-[#00ff66]/20 rounded-[1px] bg-[#00ff66]/5" />
          </div>
        </div>

        {/* Trackpad */}
        <div className="w-20 h-6 mx-auto mt-1.5 border border-[#00ff66]/30 rounded-[3px] bg-black/60 relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#00ff66]/20" />
        </div>
      </div>
    </div>
  );
}
