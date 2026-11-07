"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sound } from "@/lib/sound";
import { GithubIcon, InstagramIcon } from "./icons";
import { Volume2, VolumeX, Menu, X } from "lucide-react";

export function Navbar() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSoundEnabled(sound.getEnabled());
    const handleToggle = (e: CustomEvent<boolean>) => {
      setSoundEnabled(e.detail);
    };
    window.addEventListener("sound_toggle", handleToggle as EventListener);
    return () => window.removeEventListener("sound_toggle", handleToggle as EventListener);
  }, []);

  const toggleAudio = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const navLinks = [
    { label: "01 // OVERVIEW", href: "#overview" },
    { label: "02 // ARCHITECTURE", href: "#architecture" },
    { label: "03 // PILLARS", href: "#projects" },
    { label: "04 // CLI", href: "#cli" },
    { label: "05 // LAB", href: "#lab" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 font-mono">
        {/* Left: Brand / Avatar Glitch Badge */}
        <Link
          href="#overview"
          onClick={() => sound.playClick()}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0d1117] border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] font-bold text-xs shadow-lg group-hover:border-[#00f0ff] group-hover:shadow-[#00f0ff]/30 transition-all">
            NM
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>NEERAJ M</span>
              <span className="text-[10px] text-gray-500 hidden sm:inline">// 0xNEERAJ</span>
            </div>
            <div className="text-[9px] text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-[#10b981] font-bold">AVAILABLE FOR BUILDS</span>
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => sound.playClick()}
              onMouseEnter={() => sound.playHover()}
              className="px-3 py-1 rounded-lg text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Audio Synthesizer Toggle & Social Action */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleAudio}
            onMouseEnter={() => sound.playHover()}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              soundEnabled
                ? "bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff] shadow-lg shadow-[#00f0ff]/10"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Toggle Web Audio Synthesizer SFX"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? "SFX: ON" : "SFX: MUTED"}</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/neeraajm"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="GitHub @neeraajm"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* Instagram Link */}
          <a
            href="https://instagram.com/neeraajm"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="Instagram @neeraajm"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#080b10] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 rounded-lg text-xs font-mono text-gray-300 hover:text-[#00f0ff] hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
