"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { sound } from "@/lib/sound";
import { GithubIcon, InstagramIcon } from "@/components/icons";
import { Copy, Check, Mail, Sparkles } from "lucide-react";

export function IslandComms() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    sound.playSuccess();
    navigator.clipboard.writeText("hi.neerajm@gmail.com");
    setCopied(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ["#00f0ff", "#10b981", "#818cf8"],
    });

    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-[360px] sm:w-[420px] rounded-3xl border border-white/20 bg-[#080b10]/95 p-6 shadow-2xl backdrop-blur-2xl font-mono text-center relative overflow-hidden">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">// 05</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/20 font-bold">
            TRANSMISSION DOCK
          </span>
        </div>
        <span className="text-[10px] text-[#10b981] font-bold">● ACTIVE LINK</span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-black text-white font-sans uppercase">
        Connect & Collaborate
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Open for high-impact software architect & full-stack roles.
      </p>

      {/* Actions */}
      <div className="my-5 space-y-2">
        <button
          onClick={handleCopy}
          onMouseEnter={() => sound.playHover()}
          className="w-full p-3 rounded-xl bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg"
        >
          {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "EMAIL COPIED TO CLIPBOARD!" : "$ COPY hi.neerajm@gmail.com"}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://github.com/neeraajm"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GITHUB</span>
          </a>

          <a
            href="https://instagram.com/neeraajm"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>INSTAGRAM</span>
          </a>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-[#10b981]" />
        <span>10-Day Onam Challenge • Day 2 Build</span>
      </div>
    </div>
  );
}
