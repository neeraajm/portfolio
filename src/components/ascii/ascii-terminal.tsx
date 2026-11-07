"use client";

import { useState, useRef, useEffect } from "react";
import { sound } from "@/lib/sound";
import { DEVELOPER_PROFILE } from "@/lib/constants";

interface LogEntry {
  id: string;
  type: "command" | "output" | "error";
  content: string | React.ReactNode;
}

const COMMANDS = ["whoami", "architecture", "stack", "lab", "matrix", "socials", "clear"];

export function AsciiTerminal() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      type: "output",
      content: (
        <div className="space-y-1">
          <div className="font-bold">&gt; NEERAJ_OS KERNEL // PURE ASCII TERMINAL [ONLINE]</div>
          <div className="text-[#00ff66]/70">Type &apos;help&apos;, &apos;whoami&apos;, &apos;stack&apos; or click chips below.</div>
        </div>
      ),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommand = (cmdStr: string) => {
    const cleanCmd = cmdStr.trim().toLowerCase();
    if (!cleanCmd) return;

    sound.playClick(1.2);

    const cmdEntry: LogEntry = {
      id: Math.random().toString(),
      type: "command",
      content: cmdStr,
    };

    let outputEntry: LogEntry;

    switch (cleanCmd) {
      case "help":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs">
              <div className="font-bold">AVAILABLE COMMANDS:</div>
              <div>• whoami — Developer identity &amp; background</div>
              <div>• architecture — 5-Layer zero-cost cloud map</div>
              <div>• stack — Full toolchain &amp; technology stack</div>
              <div>• lab — Jump to ACID SQL sandbox</div>
              <div>• matrix — Stream green ASCII stream</div>
              <div>• socials — Direct GitHub, Instagram &amp; Email</div>
              <div>• clear — Wipe terminal buffer</div>
            </div>
          ),
        };
        break;

      case "whoami":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs">
              <div>NAME: Neeraj M ({DEVELOPER_PROFILE.age}yo Solo Builder & Systems Engineer)</div>
              <div>EDUCATION: BCA @ Sree Narayana College of Technology, Kollam, Kerala</div>
              <div>SPECIALTY: $0 Cloud Platforms, Next.js 15, Android Hybrid Engines, PostgreSQL RLS</div>
              <div className="font-bold mt-1">&quot;The Extended Mind: Architecture is born when human taste meets autonomous AI execution.&quot;</div>
            </div>
          ),
        };
        break;

      case "architecture":
      case "stack":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs">
              <div className="font-bold">ZERO-COST PRODUCTION TOOLCHAIN:</div>
              <div>1. [CLIENT] Next.js 15 PWA + Capacitor Android Release APK</div>
              <div>2. [ROUTING] Vercel Edge SSR &amp; Turbopack (187ms hot reload)</div>
              <div>3. [AUTH &amp; RLS] Supabase GoTrue + Zero-Trust PostgreSQL Security</div>
              <div>4. [LEDGER] Immutable double-entry SQL transactions (100% ACID)</div>
              <div>5. [EDGE CDN] Cloudflare R2 APAC bucket ($0.00 permanent egress)</div>
            </div>
          ),
        };
        break;

      case "lab":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: <div className="text-xs">Scroll to ACID SQL Sandbox below to simulate double-claim constraint locks!</div>,
        };
        break;

      case "matrix":
        sound.playSuccess();
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="text-[10px] leading-none tracking-widest break-all select-none animate-pulse">
              01001110 01000101 01000101 01010010 01000001 01010010 0xNEERAJ λ§#░█*+~ 01010011 01010100 01000001 01000011 01001011
            </div>
          ),
        };
        break;

      case "socials":
        outputEntry = {
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="space-y-1 text-xs">
              <div>• GitHub: <a href="https://github.com/neeraajm" target="_blank" className="underline font-bold">github.com/neeraajm</a></div>
              <div>• Instagram: <a href="https://instagram.com/neeraajm" target="_blank" className="underline font-bold">@neeraajm</a></div>
              <div>• Email: <span className="font-bold">hi.neerajm@gmail.com</span></div>
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
          content: <div className="text-xs text-[#00ff66]/70">Unknown: &quot;{cmdStr}&quot;. Type &apos;help&apos; for commands.</div>,
        };
        break;
    }

    setLogs((prev) => [...prev, cmdEntry, outputEntry]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playClick(0.9 + Math.random() * 0.3);
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="border border-[#00ff66]/40 bg-black p-4 sm:p-6 font-mono text-[#00ff66] shadow-[0_0_25px_rgba(0,255,102,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2 mb-3 text-xs">
        <div className="font-bold tracking-wider">// 02: CYBERDECK WORKSTATION CLI</div>
        <button
          onClick={() => {
            sound.playClick();
            setLogs([]);
          }}
          className="text-[#00ff66]/60 hover:text-[#00ff66] text-[10px] border border-[#00ff66]/20 px-2 py-0.5"
        >
          [ CLEAR ]
        </button>
      </div>

      {/* Terminal View */}
      <div
        className="h-56 overflow-y-auto space-y-2 text-xs border border-[#00ff66]/20 p-3 bg-black cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((log) => (
          <div key={log.id}>
            {log.type === "command" ? (
              <div className="font-bold">
                <span>neeraj@deck:~$ </span>
                <span>{log.content}</span>
              </div>
            ) : (
              <div className="pl-2 border-l border-[#00ff66]/40 text-[#00ff66]/90">{log.content}</div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1">
          <span className="font-bold">neeraj@deck:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[#00ff66] font-mono text-xs caret-[#00ff66]"
            placeholder="type command..."
          />
        </div>
        <div ref={endRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#00ff66]/20 text-[10px]">
        <span className="text-[#00ff66]/50 font-bold self-center mr-1">QUICK_RUN:</span>
        {COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleCommand(cmd)}
            onMouseEnter={() => sound.playHover()}
            className="px-2 py-0.5 border border-[#00ff66]/30 hover:border-[#00ff66] hover:bg-[#00ff66]/20 text-[#00ff66] transition-all cursor-pointer"
          >
            ${cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
