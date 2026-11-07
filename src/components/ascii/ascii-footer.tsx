"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";

export function AsciiFooter() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sound.playSuccess();
    navigator.clipboard.writeText("hi.neerajm@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="border border-[#00ff66]/40 bg-black p-4 sm:p-6 font-mono text-[#00ff66] shadow-[0_0_25px_rgba(0,255,102,0.15)] text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2 mb-4 font-mono">
        <div className="font-bold tracking-wider">// 04: DIRECT TRANSMISSION &amp; CONNECTIVITY</div>
        <div className="text-[10px] text-[#00ff66]/60">OPEN FOR HIGH-IMPACT ROLES</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: 1-Tap Copy Email */}
        <div className="md:col-span-6 space-y-2">
          <div className="text-[11px] text-[#00ff66]/80 font-bold">PRIMARY COMMUNICATION CHANNEL:</div>
          <button
            onClick={handleCopy}
            onMouseEnter={() => sound.playHover()}
            className="w-full p-3 border border-[#00ff66] hover:bg-[#00ff66]/20 font-bold text-center transition-all cursor-pointer text-xs"
          >
            {copied ? "[ ✓ ] EMAIL COPIED: hi.neerajm@gmail.com" : "[ $ COPY EMAIL: hi.neerajm@gmail.com ]"}
          </button>
        </div>

        {/* Right: Direct Social Hyperlinks */}
        <div className="md:col-span-6 space-y-2">
          <div className="text-[11px] text-[#00ff66]/80 font-bold">VERIFIED REPOSITORIES &amp; CHANNELS:</div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://github.com/neeraajm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="p-3 border border-[#00ff66]/40 hover:border-[#00ff66] hover:bg-[#00ff66]/10 text-center font-bold transition-all text-xs"
            >
              [ &gt; GITHUB ]
            </a>

            <a
              href="https://instagram.com/neeraajm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="p-3 border border-[#00ff66]/40 hover:border-[#00ff66] hover:bg-[#00ff66]/10 text-center font-bold transition-all text-xs"
            >
              [ &gt; INSTAGRAM ]
            </a>
          </div>
        </div>
      </div>

      {/* Bottom ASCII Signature */}
      <div className="mt-6 pt-3 border-t border-[#00ff66]/20 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#00ff66]/60">
        <div>© {new Date().getFullYear()} NEERAJ M • EXTENDED MIND ARCHITECTURE • ONAM CHALLENGE</div>
        <div>RENDER_MODE: PURE_ASCII_MONOCHROMATIC</div>
      </div>
    </footer>
  );
}
