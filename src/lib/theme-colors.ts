export interface WorkstationTheme {
  id: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
  threeColor: number;
}

export const WORKSTATION_THEMES: WorkstationTheme[] = [
  { id: "white", name: "Pure White", hex: "#ffffff", rgb: [255, 255, 255], threeColor: 0xffffff },
  { id: "green", name: "Matrix Green", hex: "#00ff66", rgb: [0, 255, 102], threeColor: 0x00ff66 },
  { id: "cyan", name: "Cyber Cyan", hex: "#00f0ff", rgb: [0, 240, 255], threeColor: 0x00f0ff },
  { id: "amber", name: "Solar Amber", hex: "#f59e0b", rgb: [245, 158, 11], threeColor: 0xf59e0b },
  { id: "purple", name: "Synthwave Purple", hex: "#c084fc", rgb: [192, 132, 252], threeColor: 0xc084fc },
  { id: "red", name: "Tokyo Red", hex: "#ff0055", rgb: [255, 0, 85], threeColor: 0xff0055 },
  { id: "ice", name: "Ice Titanium", hex: "#38bdf8", rgb: [56, 189, 248], threeColor: 0x38bdf8 },
];

export const DEFAULT_THEME = WORKSTATION_THEMES[0];

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

const tintCache = new Map<string, HTMLCanvasElement>();

/**
 * Dynamically recolor ASCII avatar image pixels to match any theme hex with caching
 */
export function createTintedAvatarCanvas(
  img: HTMLImageElement,
  themeHex: string,
  w: number,
  h: number
): HTMLCanvasElement | null {
  if (typeof document === "undefined" || !img || !img.complete || img.naturalWidth === 0) return null;
  const cacheKey = `${themeHex}_${w}_${h}_${img.src}`;
  const cached = tintCache.get(cacheKey);
  if (cached) return cached;

  try {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) return null;

    offCtx.drawImage(img, 0, 0, w, h);
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const [tr, tg, tb] = hexToRgb(themeHex);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Compute luminance from original ASCII pixels
      const brightness = Math.max(r, g, b) / 255;
      data[i] = Math.round(tr * brightness);
      data[i + 1] = Math.round(tg * brightness);
      data[i + 2] = Math.round(tb * brightness);
      data[i + 3] = a;
    }

    offCtx.putImageData(imgData, 0, 0);
    tintCache.set(cacheKey, offCanvas);
    return offCanvas;
  } catch {
    return null;
  }
}
