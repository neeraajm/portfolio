# Neeraj M Developer Portfolio — Rules & Project Context

## Critical: Questions vs. Actions

**When the user asks a question, ANSWER THE QUESTION. Do NOT edit any files.**

If the user's message is investigatory — asking "how does X work?", "where is Y?", "why did Z happen?", "what would be the best approach for...?", "explain this..." — respond with a clear, direct answer. Do not touch any source files, create artifacts, or run modifying commands. Read-only operations (viewing files, searching, listing directories) are acceptable when needed to formulate your answer.

Only edit files, create files, or run modifying commands when the user explicitly asks you to **build**, **fix**, **change**, **create**, **add**, **remove**, **update**, or **implement** something.

When in doubt, **answer first, act later** — ask if the user wants you to make the change.

---

## Developer Persona & Project Context

- **Developer:** **Neeraj M**
- **Role:** Solo Builder & Systems Engineer
- **Profile / Credentials:**
  - 19 years old, pursuing BCA @ SNCT (Kerala, India)
  - Full-Stack Android & Cloud Platforms Builder
  - $0 Cloud Infrastructure Specialist
- **Socials & Links:**
  - **Instagram:** `@neeraajm`
  - **GitHub:** `neeraajm` / `Neeraj M`
  - **Email:** `hi.neerajm@gmail.com`
  - **Live Flagship:** `https://ktccofficial.vercel.app`
  - **Portfolio Live Domain:** `https://neerajm.pages.dev` (Future custom domain: `https://neerajm.in`)
- **The Challenge Origin:**
  - Built from scratch during the **Onam Vacation Build-in-Public Portfolio Challenge**.
  - Documented daily across social media as a real-time showcase of paired AI systems architecture.

---

## Core Engineering Pillars & Budget Rule

1. **Strict $0 Cloud Infrastructure Budget (Non-Negotiable):**
   - Every single service, host, database, API, and tool must use **100% free tiers permanently**.
   - Zero paid subscriptions, zero credit card requirements, $0/month ongoing bills.
2. **High-Signal Visual Excellence:**
   - Deep TokyoNight dark palette (`#05070a` base canvas, `#0d1117` surface cards, `#161b22` borders).
   - Vibrant neon cyan (`#00f0ff` / `#38bdf8`), emerald green (`#10b981`), amber gold (`#f59e0b`), and purple (`#818cf8`) accents.
   - Glassmorphism, subtle scanline/grid overlays, micro-animations, and custom monospace telemetry.
3. **Flagship Project:**
   - **KTCC (Kerala Tourers Community Championship):** Full-stack Car Parking Multiplayer tournament platform with double-entry immutable point ledger, Supabase PostgreSQL, automated GitHub Actions Android APK build pipeline, and Cloudflare R2 zero-egress APAC CDN distribution.
4. **Interactive Creative Engineering Flexes:**
   - **Interactive Terminal CLI Widget:** Real working terminal executing custom commands (`help`, `ktcc`, `stack`, `whoami`, `socials`, `clear`).
   - **Live GitHub Telemetry:** Live commit streaming, streaks, and repo telemetry.
   - **3D Canvas & Particle Shaders:** Client-side WebGL / Three.js.
   - **Soundscape Engine:** Web Audio API synthesized click/hover micro-SFX.
   - **"Ask My AI Twin" Assistant:** Embedded zero-cost Gemini Flash chatbot.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, Turbopack
- **Language:** TypeScript (strict mode, zero `any` types)
- **Styling:** Tailwind CSS 4 + TokyoNight custom design tokens
- **Icons:** Lucide React (`lucide-react`)
- **Motion & Interactions:** Framer Motion (`framer-motion`), Canvas Confetti (`canvas-confetti`)
- **Hosting:** Cloudflare Pages Free Tier (`$0/month`)
- **Typography:**
  - `Outfit` (Display & Headings)
  - `JetBrains Mono` / `Space Mono` (Code, Telemetry, and Terminal CLI)
  - `Inter` (Body text)

---

## Code Conventions

### React / Next.js
- Use Server Components by default; add `'use client'` only when client-side state, browser APIs, or interactivity are strictly needed.
- Colocate route-specific components inside their route folders; shared components go in `src/components/shared/` or `src/components/ui/`.
- Mobile-first responsive design — design for **375px mobile viewport** first, then adapt for tablet (`md:`) and desktop (`lg:`).
- Touch targets must be at least 44×44px with active tap states (`active:scale-95`).
- Ensure all interactive elements have semantic HTML tags and accessible labels.

### Styling & Aesthetics
- Use Tailwind utility classes with defined design tokens.
- No generic plain white cards or unstyled placeholders — every component must feel polished, high-tech, and intentional.

---

## File Organization

```
/home/neeraj/Dev/portfolio/
├── AGENTS.md                  → This project rules and context document
├── src/
│   ├── app/
│   │   ├── layout.tsx         → Root layout with fonts, metadata & providers
│   │   ├── page.tsx           → Main single-page interactive showcase
│   │   └── globals.css        → TokyoNight design system, scanlines & tokens
│   ├── components/
│   │   ├── navbar.tsx         → Live telemetry status bar & nav
│   │   ├── hero.tsx           → Hero stage with stats & CTAs
│   │   ├── terminal-cli.tsx   → Interactive working macOS/Linux CLI
│   │   ├── projects.tsx       → KTCC case study & flagship showcase
│   │   ├── stack.tsx          → $0 Cloud infrastructure breakdown
│   │   ├── telemetry.tsx      → Live GitHub activity & stats
│   │   └── footer.tsx         → Footer, socials & copy-email action
│   ├── lib/
│   │   ├── constants.ts       → Bio, stats, projects, and social links
│   │   └── utils.ts           → Tailwind merge & utility functions
│   └── types/
│       └── index.ts           → TypeScript types and interfaces
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
