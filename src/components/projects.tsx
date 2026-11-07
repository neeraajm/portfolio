"use client";

import { motion } from "framer-motion";
import { sound } from "@/lib/sound";
import { DecodeText } from "./ui/decode-text";
import { GithubIcon } from "./icons";
import { ArrowUpRight, Layers } from "lucide-react";

interface ProjectPillar {
  number: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

const PILLARS: ProjectPillar[] = [
  {
    number: "01",
    badge: "FLAGSHIP // LIVE PRODUCTION",
    badgeColor: "#00f0ff",
    title: "KTCC Community Tournament Platform",
    tagline: "Full-Stack Car Parking Multiplayer Competition System",
    description: "A production community tournament platform built with a single Next.js 15 App Router codebase serving Web, PWA, and Capacitor Android release APKs. Features an immutable double-entry SQL ledger, automated GitHub Actions release keystores, and zero-egress Cloudflare R2 edge distribution.",
    tags: ["Next.js 15", "Supabase PostgreSQL", "Capacitor Android", "Cloudflare R2", "Tailwind CSS 4", "GitHub Actions CI/CD"],
    metrics: [
      { label: "CLOUD BILLS", value: "$0.00 / MO" },
      { label: "EDGE SPEED", value: "<18ms APAC" },
      { label: "LEDGER INTEGRITY", value: "100% ACID" },
    ],
    liveUrl: "https://ktccofficial.vercel.app",
    githubUrl: "https://github.com/ktcc-ofc",
    featured: true,
  },
  {
    number: "02",
    badge: "DEV TOOLING // INTERACTIVE OS",
    badgeColor: "#10b981",
    title: "Cyberdeck Web CLI & AI Workflow",
    tagline: "In-Browser Command Execution & Autonomous Pairing System",
    description: "An embedded interactive developer workstation running directly inside the browser with custom command evaluation (`whoami`, `stack`, `matrix`, `lab`), keyboard history, synthesized Web Audio tactile feedback, and autonomous AI pair programming orchestration.",
    tags: ["Web Audio API", "Framer Motion", "TypeScript", "Cloudflare Pages", "ASCII Engine"],
    metrics: [
      { label: "SFX LATENCY", value: "0ms NATIVE" },
      { label: "INTERACTIONS", value: "8+ COMMANDS" },
      { label: "AUDIO WEIGHT", value: "0 KB ASSETS" },
    ],
    liveUrl: "#cli",
    githubUrl: "https://github.com/neeraajm/portfolio",
  },
  {
    number: "03",
    badge: "CLOUD ARCHITECTURE // RECIPES",
    badgeColor: "#f59e0b",
    title: "Zero-Egress $0 Cloud Infrastructure Blueprint",
    tagline: "Production Enterprise Recipes for 100% Free Tiers",
    description: "Battle-tested cloud blueprints that eliminate ongoing SaaS fees. Combines Supabase Postgres RLS, Cloudflare R2 APAC buckets, Cloudflare Pages Anycast edge, and GitHub Actions release pipelines to run high-traffic applications permanently at $0.00 cloud cost.",
    tags: ["Cloudflare R2", "Supabase RLS", "GitHub Actions", "Cloudflare Pages", "PostgreSQL"],
    metrics: [
      { label: "EGRESS FEES", value: "$0 PERMANENT" },
      { label: "UPTIME", value: "99.99% EDGE" },
      { label: "SECURITY", value: "ZERO-TRUST RLS" },
    ],
    liveUrl: "https://ktccofficial.vercel.app/blueprint",
  },
  {
    number: "04",
    badge: "CREATIVE LAB // SHADERS & AUDIO",
    badgeColor: "#818cf8",
    title: "Living ASCII Shaders & Web Audio Lab",
    tagline: "Client-Side Creative Web Engineering & Micro-Interactions",
    description: "Interactive canvas experiments, mathematical character shaders, sound synthesis algorithms, and kinetic typography engines designed to deliver top 0.01% Awwwards-tier visual fidelity with zero bundle weight.",
    tags: ["HTML5 Canvas", "Web Audio API", "Kinetic Physics", "TokyoNight Tokens"],
    metrics: [
      { label: "RENDER RATE", value: "60 FPS FLUID" },
      { label: "CANVAS TYPE", value: "GRAVITY MESH" },
      { label: "DEPENDENCIES", value: "0 HEAVY 3D" },
    ],
    liveUrl: "#lab",
  },
];

export function Projects() {
  return (
    <section id="projects" className="relative py-24 px-4 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1117] border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs mb-3 shadow-inner">
          <Layers className="w-3.5 h-3.5" />
          <span>// MULTI-PILLAR SYSTEMS SHOWCASE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-sans uppercase">
          <DecodeText text="Engineering Arsenal & Case Studies" />
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto mt-3 font-mono">
          Architecting full-stack cloud platforms, native Android engines, and interactive developer tooling with $0 infrastructure overhead.
        </p>
      </div>

      {/* Grid of 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PILLARS.map((pillar, index) => {
          return (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onMouseEnter={() => sound.playHover()}
              className={`group relative rounded-2xl border transition-all duration-300 p-6 md:p-8 flex flex-col justify-between backdrop-blur-xl ${
                pillar.featured
                  ? "bg-[#0d1117]/90 border-[#00f0ff]/40 shadow-2xl shadow-[#00f0ff]/10"
                  : "bg-[#080b10]/90 border-white/10 hover:border-white/25 hover:bg-[#0d1117]/70"
              }`}
            >
              {/* Top Meta Line */}
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 font-mono">
                      // PILLAR {pillar.number}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${pillar.badgeColor}40`,
                        color: pillar.badgeColor,
                        backgroundColor: `${pillar.badgeColor}15`,
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-2">
                    {pillar.githubUrl && (
                      <a
                        href={pillar.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                        title="View GitHub Repository"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {pillar.liveUrl && (
                      <a
                        href={pillar.liveUrl}
                        target={pillar.liveUrl.startsWith("#") ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="p-1.5 rounded-lg border border-white/10 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/40 transition-colors flex items-center gap-1 text-xs font-mono font-bold"
                      >
                        <span>LAUNCH</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl md:text-2xl font-black text-white font-sans group-hover:text-[#00f0ff] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1 font-semibold">
                  {pillar.tagline}
                </p>

                {/* Description */}
                <p className="text-gray-300 text-xs md:text-sm mt-3 leading-relaxed font-mono">
                  {pillar.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-mono text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 font-mono text-center">
                {pillar.metrics.map((m) => (
                  <div key={m.label} className="p-2 rounded-lg bg-[#05070a] border border-white/5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase">{m.label}</div>
                    <div className="text-xs font-bold text-white mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
