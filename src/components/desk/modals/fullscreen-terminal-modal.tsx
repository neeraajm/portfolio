"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { sound } from "@/lib/sound";
import { X, Trash2, CornerDownLeft } from "lucide-react";
import { DEVELOPER_PROFILE } from "@/lib/constants";

interface FullscreenTerminalModalProps {
  onClose: () => void;
}

interface LogEntry {
  id: string;
  type: "command" | "output" | "error";
  content: React.ReactNode;
}

const COMMANDS = ["help", "whoami", "ktcc", "brotoraise", "stack", "stats", "socials", "clear"];

export function FullscreenTerminalModal({ onClose }: FullscreenTerminalModalProps) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      type: "output",
      content: (
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="text-[#00ff66] font-bold">
            &gt; NEERAJ_OS v2.4.0 (x86_64 // $0 Cloud Infrastructure Kernel) [FULLSCREEN MODE]
          </div>
          <div className="text-[#00ff66]/70 text-xs">
            Type <span className="text-[#00ff66] font-bold underline">help</span> or click suggestions below to execute commands.
          </div>
        </div>
      ),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (cmdStr: string) => {
    const cleanCmd = cmdStr.trim().toLowerCase();
    if (!cleanCmd) return;

    sound.playClick(1.2);

    const cmdEntry: LogEntry = {
      id: Math.random().toString(),
      type: "command",
      content: (
        <div className="text-[#00ff66] font-bold text-xs sm:text-sm">
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
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">AVAILABLE COMMANDS:</div>
              <div>• <span className="font-bold underline">whoami</span> — Developer identity &amp; credentials</div>
              <div>• <span className="font-bold underline">ktcc</span> — Tournament platform flagship breakdown</div>
              <div>• <span className="font-bold underline">brotoraise</span> — Complaint management system</div>
              <div>• <span className="font-bold underline">stack</span> — Strict $0.00 cloud infrastructure stack</div>
              <div>• <span className="font-bold underline">stats</span> — APAC latency &amp; ledger metrics</div>
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
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">NAME: NEERAJ M</div>
              <div>ROLE: Solo Builder &amp; Systems Engineer ({DEVELOPER_PROFILE.age} years old)</div>
              <div>EDUCATION: Pursuing BCA @ SNCT (Kerala, India 🇮🇳)</div>
              <div>SPECIALTY: $0 Cloud Platforms, Next.js 15, Android Hybrid Engines, Supabase PostgreSQL</div>
              <div className="font-bold text-[#00ff66] mt-1">&quot;The Extended Mind: Architecture is born when human taste meets autonomous AI execution.&quot;</div>
            </div>
          ),
        };
        break;

      case "ktcc":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">KTCC (KERALA TOURERS COMMUNITY CHAMPIONSHIP)</div>
              <div>• Live URL: <a href="https://ktccofficial.vercel.app" target="_blank" rel="noopener noreferrer" className="underline font-bold">https://ktccofficial.vercel.app</a></div>
              <div>• Double-entry ledger prevents point race conditions in tournament transactions</div>
              <div>• Automated Android APK builds triggered directly from GitHub repo commits</div>
              <div>• Zero-egress APAC asset distribution via Cloudflare R2 bucket proxy</div>
              <div>• Total Hosting Cost: $0.00/month</div>
            </div>
          ),
        };
        break;

      case "brotoraise":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">BROTORAISE // COMPLAINT MANAGEMENT SYSTEM</div>
              <div>• Issue escalation and resolution lifecycle engine</div>
              <div>• Repo: <a href="https://github.com/neeraajm/broto-raise" target="_blank" rel="noopener noreferrer" className="underline font-bold">github.com/neeraajm/broto-raise</a></div>
              <div>• Engineered with Next.js &amp; PostgreSQL</div>
            </div>
          ),
        };
        break;

      case "stack":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">STRICT $0.00/MO INFRASTRUCTURE ARCHITECTURE:</div>
              <div>1. [COMPUTE] Vercel Hobby Edge (Next.js 15 App Router) [$0.00]</div>
              <div>2. [DATABASE] Supabase PostgreSQL (ACID Double-Entry Ledger) [$0.00]</div>
              <div>3. [STORAGE] Cloudflare R2 Object Bucket (Zero Egress) [$0.00]</div>
              <div>4. [CI/CD] GitHub Actions Headless Android APK Builder [$0.00]</div>
              <div>5. [TOTAL RECURRING MONTHLY BILL] $0.00/month Forever</div>
            </div>
          ),
        };
        break;

      case "stats":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">SYSTEM TELEMETRY:</div>
              <div>• APAC Edge Latency: &lt; 18ms (Cloudflare Edge)</div>
              <div>• Ledger Double-Entry Consistency: 100% ACID</div>
              <div>• Tournaments Managed: 50+ Events</div>
              <div>• Uptime Goal: 99.98% High Availability</div>
            </div>
          ),
        };
        break;

      case "socials":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs sm:text-sm text-[#00ff66]/90">
              <div className="text-[#00ff66] font-bold">CONNECT WITH NEERAJ M:</div>
              <div>• Instagram: <a href="https://instagram.com/neeraajm" target="_blank" rel="noopener noreferrer" className="underline font-bold">@neeraajm</a></div>
              <div>• GitHub: <a href="https://github.com/neeraajm" target="_blank" rel="noopener noreferrer" className="underline font-bold">@neeraajm</a></div>
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
            <div className="text-[#00ff66]/60 text-xs sm:text-sm">
              Command not recognized: &quot;{cmdStr}&quot;. Type <span className="text-[#00ff66] font-bold">help</span> to list commands.
            </div>
          ),
        };
        break;
    }

    setLogs((prev) => [...prev, cmdEntry, outputEntry]);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[760px] h-[520px] bg-[#000803] border-2 border-[#00ff66] rounded-[10px] p-4 sm:p-5 font-mono text-[#00ff66] shadow-[0_0_50px_rgba(0,255,102,0.35),inset_0_0_30px_rgba(0,255,102,0.1)] relative overflow-hidden flex flex-col justify-between"
      onClick={(e) => {
        e.stopPropagation();
        inputRef.current?.focus();
      }}
    >
      {/* CRT Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0)_50%,rgba(0,0,0,0.55)_50%)] bg-[length:100%_3px] pointer-events-none opacity-40 z-10" />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between border-b border-[#00ff66]/40 pb-2 mb-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span>NEERAJ_OS // SYSTEM_TERMINAL [ACTIVE]</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            title="Clear Terminal Buffer"
            className="flex items-center gap-1 border border-[#00ff66]/40 hover:border-[#00ff66] px-2 py-0.5 rounded-[4px] text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1 border border-[#00ff66] bg-[#00ff66]/15 hover:bg-[#00ff66]/30 px-2 py-0.5 rounded-[4px] font-bold text-xs transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,102,0.25)]"
          >
            <X className="w-3.5 h-3.5" />
            <span>[ ESC ]</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto space-y-2 relative z-20 pr-1 text-left scrollbar-thin scrollbar-thumb-[#00ff66]/30 my-2">
        {logs.map((log) => (
          <div key={log.id} className="break-words">
            {log.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input & Chips */}
      <div className="relative z-20 pt-2 border-t border-[#00ff66]/30 space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-[#00ff66] shrink-0">[neeraj@sys ~]$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommand(input)}
            placeholder="type 'help' or any command..."
            className="flex-1 bg-transparent border-none outline-none text-[#00ff66] placeholder-[#00ff66]/40 font-mono font-bold text-xs sm:text-sm caret-[#00ff66]"
          />
          <button
            onClick={() => handleCommand(input)}
            className="px-2 py-1 border border-[#00ff66]/50 hover:border-[#00ff66] rounded-[4px] text-xs font-bold text-[#00ff66] hover:bg-[#00ff66]/15 transition-all cursor-pointer shrink-0"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px]">
          <span className="text-[#00ff66]/50 font-bold">SUGGESTIONS:</span>
          {COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="px-2 py-0.5 border border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]/90 hover:text-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/25 rounded-[3px] font-bold transition-all cursor-pointer"
            >
              ${cmd}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
