"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";
import { GithubIcon, InstagramIcon } from "./icons";
import { Copy, Check, ArrowUp, Sparkles } from "lucide-react";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    sound.playSuccess();
    navigator.clipboard.writeText("hi.neerajm@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#05070a] pt-16 pb-12 px-4 z-10 font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Brand & Bio */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="text-base font-black text-white font-sans tracking-wide">
              NEERAJ M // 0xNEERAJ
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Solo Builder & Systems Engineer. Passionate about multi-platform Android engines, Next.js 15, and $0 cloud infrastructure.
          </p>
          <div className="text-[11px] text-gray-500 font-mono">
            Location: Kollam, Kerala, India (IST) • BCA @ SNCT
          </div>
        </div>

        {/* Center Column: Quick Navigation */}
        <div className="md:col-span-3 space-y-2 text-xs">
          <div className="text-white font-bold tracking-wider mb-2">// QUICK JUMPS</div>
          <div><a href="#overview" onClick={() => sound.playClick()} className="text-gray-400 hover:text-[#00f0ff] transition-colors">01 // Overview</a></div>
          <div><a href="#architecture" onClick={() => sound.playClick()} className="text-gray-400 hover:text-[#00f0ff] transition-colors">02 // 3D Nodal Blueprint</a></div>
          <div><a href="#projects" onClick={() => sound.playClick()} className="text-gray-400 hover:text-[#00f0ff] transition-colors">03 // 4-Pillar Arsenal</a></div>
          <div><a href="#cli" onClick={() => sound.playClick()} className="text-gray-400 hover:text-[#00f0ff] transition-colors">04 // Cyberdeck CLI</a></div>
          <div><a href="#lab" onClick={() => sound.playClick()} className="text-gray-400 hover:text-[#00f0ff] transition-colors">05 // ACID SQL Sandbox</a></div>
        </div>

        {/* Right Column: Connect & Direct Actions */}
        <div className="md:col-span-4 space-y-3">
          <div className="text-white font-bold text-xs tracking-wider">// CONNECT & COLLABORATE</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyEmail}
              onMouseEnter={() => sound.playHover()}
              className="px-3 py-2 rounded-xl bg-[#0d1117] hover:bg-white/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED!" : "hi.neerajm@gmail.com"}</span>
            </button>

            <a
              href="https://github.com/neeraajm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href="https://instagram.com/neeraajm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              title="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="text-[10px] text-[#10b981] font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Built during the 10-Day Onam Vacation Challenge</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Watermark Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          <span>© {new Date().getFullYear()} Neeraj M. All Rights Reserved.</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>
            Original 3D Workstation Architecture by{" "}
            <a
              href="https://github.com/neeraajm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#00f0ff] font-semibold underline underline-offset-2 transition-colors"
            >
              Neeraj M (@neeraajm)
            </a>
          </span>
        </div>

        <button
          onClick={scrollToTop}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-[#00f0ff] transition-colors cursor-pointer"
        >
          <span>[ TOP ]</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}
