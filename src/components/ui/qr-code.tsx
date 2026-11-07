"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  margin?: number;
  centerLogo?: boolean;
  className?: string;
}

interface BadgeData {
  cx: number;
  cy: number;
  bw: number;
  bh: number;
  midX: number;
  midY: number;
  outerTri: string;
  innerTri: string;
  dotY: string;
  dotR: string;
}

interface QrRenderResult {
  pathData: string;
  totalSize: number;
  badge: BadgeData | null;
}

export function QrCode({
  value,
  size = 140,
  fgColor = "#ffffff",
  bgColor = "transparent",
  margin = 1,
  centerLogo = false,
  className = "",
}: QrCodeProps) {
  const result: QrRenderResult = useMemo(() => {
    try {
      // Use 'H' level error correction (30% recovery) when center logo is embedded
      const qr = QRCode.create(value, {
        errorCorrectionLevel: centerLogo ? "H" : "M",
      });
      const moduleCount = qr.modules.size;
      const total = moduleCount + margin * 2;

      const badgeSize = centerLogo ? Math.max(7, Math.round(moduleCount * 0.26)) : 0;
      const badgeStart = centerLogo ? Math.floor((total - badgeSize) / 2) : -1;
      const badgeEnd = centerLogo ? badgeStart + badgeSize : -1;

      let path = "";

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          const qrX = c + margin;
          const qrY = r + margin;

          // If center logo is enabled, avoid placing QR module paths inside badge area
          if (
            centerLogo &&
            qrX >= badgeStart &&
            qrX < badgeEnd &&
            qrY >= badgeStart &&
            qrY < badgeEnd
          ) {
            continue;
          }

          if (qr.modules.get(r, c)) {
            path += `M${qrX} ${qrY}h1v1h-1z `;
          }
        }
      }

      let badgeData: BadgeData | null = null;
      if (centerLogo) {
        const cx = badgeStart;
        const cy = badgeStart;
        const bw = badgeSize;
        const bh = badgeSize;
        const midX = cx + bw / 2;
        const midY = cy + bh / 2;
        const triSize = bw * 0.58;

        const pTop = `${midX},${(midY - triSize * 0.50).toFixed(2)}`;
        const pBL = `${(midX - triSize * 0.46).toFixed(2)},${(midY + triSize * 0.38).toFixed(2)}`;
        const pBR = `${(midX + triSize * 0.46).toFixed(2)},${(midY + triSize * 0.38).toFixed(2)}`;

        const pInTL = `${(midX - triSize * 0.23).toFixed(2)},${(midY - triSize * 0.06).toFixed(2)}`;
        const pInTR = `${(midX + triSize * 0.23).toFixed(2)},${(midY - triSize * 0.06).toFixed(2)}`;
        const pInB = `${midX},${(midY + triSize * 0.38).toFixed(2)}`;

        badgeData = {
          cx,
          cy,
          bw,
          bh,
          midX,
          midY,
          outerTri: `${pTop} ${pBL} ${pBR}`,
          innerTri: `${pInTL} ${pInTR} ${pInB}`,
          dotY: (midY + triSize * 0.08).toFixed(2),
          dotR: (bw * 0.045).toFixed(2),
        };
      }

      return { pathData: path, totalSize: total, badge: badgeData };
    } catch {
      return { pathData: "", totalSize: 25, badge: null };
    }
  }, [value, margin, centerLogo]);

  const { pathData, totalSize, badge } = result;

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="geometricPrecision"
    >
      {bgColor !== "transparent" && (
        <rect width={totalSize} height={totalSize} fill={bgColor} />
      )}

      {/* QR Code Matrix Cells */}
      <path d={pathData} fill={fgColor} shapeRendering="crispEdges" />

      {/* Cyber Center Emblem Badge */}
      {badge && (
        <g>
          {/* Badge Background with rounded bezel */}
          <rect
            x={badge.cx}
            y={badge.cy}
            width={badge.bw}
            height={badge.bh}
            rx={badge.bw * 0.22}
            fill="#03060a"
            stroke={fgColor}
            strokeWidth={0.35}
            strokeOpacity={0.9}
          />

          {/* Glowing Ambient Fill */}
          <rect
            x={badge.cx + 0.3}
            y={badge.cy + 0.3}
            width={badge.bw - 0.6}
            height={badge.bh - 0.6}
            rx={badge.bw * 0.18}
            fill={fgColor}
            fillOpacity={0.08}
          />

          {/* Outer Cyber Delta Triangle */}
          <polygon
            points={badge.outerTri}
            fill="none"
            stroke={fgColor}
            strokeWidth={0.36}
            strokeLinejoin="round"
          />

          {/* Inner Inverted Triangle */}
          <polygon
            points={badge.innerTri}
            fill="none"
            stroke={fgColor}
            strokeWidth={0.25}
            strokeLinejoin="round"
          />

          {/* Center Power Nucleus Dot */}
          <circle
            cx={badge.midX}
            cy={Number(badge.dotY)}
            r={Number(badge.dotR)}
            fill="#ffffff"
          />
        </g>
      )}
    </svg>
  );
}
