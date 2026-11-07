<div align="center">

```text
 _   _ _____ _____ ____     _        _   __  __ 
| \ | | ____| ____|  _ \   / \      | | |  \/  |
|  \| |  _| |  _| | |_) | / _ \  _  | | | |\/| |
| |\  | |___| |___|  _ < / ___ \| |_| | | |  | |
|_| \_|_____|_____|_| \_/_/   \_\___ /  |_|  |_|
```

# 3D Developer Workspace & Portfolio

An interactive 3D spatial developer environment and terminal built with Next.js, Three.js, and WebGL.

[![Live Demo](https://img.shields.io/badge/Live_Demo-neerajm.pages.dev-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://neerajm.pages.dev)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![React](https://img.shields.io/badge/React_19-black?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=black)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT_Attribution--NC-black?style=for-the-badge&logo=open-source-initiative&logoColor=00ff66)](LICENSE)

</div>

---

## Overview

This repository contains the source code for [neerajm.pages.dev](https://neerajm.pages.dev), an interactive 3D spatial developer portfolio. Built with Next.js 16 and Three.js, the application presents a navigable 3D developer desk environment in place of a traditional flat scroll layout.

Visitors can orbit around the scene, inspect detailed 3D hardware components and desk peripherals, execute commands in an operable in-browser terminal, switch phosphor theme palettes in real time, and review featured software projects via an interactive ID card.

---

## Features

| Feature | Description |
| :--- | :--- |
| **Interactive 3D Workspace** | Real-time WebGL scene with orbit camera controls, perspective projection, dynamic lighting, and custom procedural/GLTF models. |
| **Integrated Screen Terminal** | Operable command-line interface running on the laptop display supporting commands such as `help`, `whoami`, `projects`, `color`, `stack`, and `clear`. |
| **Dynamic Phosphor Themes** | Real-time palette engine supporting 7 theme presets (`Matrix Green`, `Cyber Cyan`, `Pure White`, `Solar Amber`, `Synthwave Purple`, `Tokyo Red`, `Ice Titanium`). |
| **Interactive ID Badge** | Inspectable 3D developer credential card with smooth flip animations detailing active software projects and technical achievements. |
| **Procedural Audio Engine** | Native Web Audio API synthesizer generating real-time keystroke clicks and interface sound effects with zero external audio assets. |
| **Performance Optimization** | Low-poly asset decimation, procedural geometries, offscreen canvas tint caching, and responsive viewport scaling. |

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Core web application framework and build pipeline |
| **Runtime / UI** | React 19, TypeScript | Strict-typed component state and interface logic |
| **3D & Graphics** | Three.js, WebGL, Canvas API | 3D scene graph, procedural geometry, lighting, and textures |
| **Animation** | Framer Motion | Smooth UI modal transitions and 3D card flips |
| **Styling** | Tailwind CSS 4 | Responsive layouts and design token system |
| **Audio** | Web Audio API | Procedural sound synthesis via native oscillators |
| **Deployment** | Vercel Edge Network | Global static edge distribution and telemetry |

---

## Project Structure

```text
portfolio/
├── public/
│   └── models/                      # Optimized GLTF/GLB 3D assets
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout, font definitions, metadata
│   │   ├── page.tsx                 # Application entry point
│   │   └── globals.css              # Global styles and Tailwind v4 setup
│   ├── components/
│   │   └── desk-3d/
│   │       ├── developer-desk-3d.tsx # Main 3D scene controller & terminal state
│   │       ├── scene-canvas.tsx      # Three.js canvas, lighting, and render loop
│   │       └── objects/              # Procedural and GLTF mesh components
│   │           ├── laptop-mesh.ts    # Laptop body, screen canvas, keyboard
│   │           ├── extension-board-mesh.ts # Power strip, LED indicators, cables
│   │           ├── ethernet-cable-mesh.ts  # Spline-curved cable routing
│   │           ├── id-card-mesh.ts   # 3D flippable credential badge
│   │           ├── coffee-mesh.ts    # Coffee mug with steam particle system
│   │           └── ...               # Clock, router, watch, phone, peripherals
│   ├── lib/
│   │   ├── theme-colors.ts          # Color palettes and dynamic avatar tinting
│   │   ├── sound.ts                 # Web Audio API oscillator synthesis
│   │   └── constants.ts             # Developer bio, project details, social links
│   └── types/                       # TypeScript definitions and interfaces
├── LICENSE                          # License terms and model attributions
└── package.json
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (version 20.x or later)
- [npm](https://www.npmjs.com/) or any compatible package manager (`pnpm`, `yarn`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/neeraajm/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build

To test the production build locally:

```bash
npm run build
npm run start
```

---

## License & Attribution

This project is licensed under a custom **MIT License with Non-Commercial & Mandatory Public UI Attribution Clauses**.

- **Educational & Personal Use:** You are welcome to inspect, study, and fork the code for non-commercial educational purposes.
- **Attribution:** Any public deployment utilizing this 3D workstation architecture must retain a visible, clickable attribution link to [@neeraajm](https://github.com/neeraajm).
- **Brand Protection:** Personal branding assets (including `avatar-neeraj.png`, personal credentials, and identity copy) are strictly reserved.

Refer to [`LICENSE`](LICENSE) for full terms.

### Third-Party 3D Assets

The following 3D assets used in the scene are licensed under Creative Commons Attribution licenses:

| Asset | Creator | Source & License |
| :--- | :--- | :--- |
| **3D Router** | SanForge Studio / Grand Dog Studio | [Sketchfab (o7Ipv)](https://skfb.ly/o7Ipv) • [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| **Notepad** | FractalSpace | [Sketchfab (oPNXP)](https://skfb.ly/oPNXP) • [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| **Digital Watch** | SpatialNeglect / Mateusz Woliński | [Sketchfab (oxPtV)](https://skfb.ly/oxPtV) • [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| **Gaming Mouse** | jerard27 | [Sketchfab (p8Gty)](https://skfb.ly/p8Gty) • [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| **Mobile Phone** | Alain Sorazu | [Sketchfab (6S6wG)](https://skfb.ly/6S6wG) • [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) |
| **Digital Alarm Clock** | Neeraj M | Custom modeled in-house (`public/models/digital_clock.glb`) |

---

## Author

**Neeraj M**  
Full-Stack & Systems Developer  
- Website: [neerajm.pages.dev](https://neerajm.pages.dev)  
- GitHub: [@neeraajm](https://github.com/neeraajm)  
- Email: [hi.neerajm@gmail.com](mailto:hi.neerajm@gmail.com)  
- Instagram: [@neeraajm](https://instagram.com/neeraajm)
