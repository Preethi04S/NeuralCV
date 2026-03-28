"use client";
import { motion } from "framer-motion";

interface Dimension {
  label: string;
  value: number; // 0-100
  color: string;
}

interface Props {
  dimensions: Dimension[];
  size?: number;
  isDark?: boolean;
}

export function RadarChart({ dimensions, size = 260, isDark = true }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.68;
  const levels = 4;
  const n = dimensions.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const gridPolygon = (level: number) => {
    const r = (maxR * level) / levels;
    return Array.from({ length: n }, (_, i) => {
      const p = point(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
  };

  const dataPolygon = dimensions.map((d, i) => {
    const r = (maxR * Math.min(d.value, 100)) / 100;
    const p = point(i, r);
    return `${p.x},${p.y}`;
  }).join(" ");

  const gridStroke   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const axisStroke   = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const labelColor   = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.82)";
  const centerDot    = isDark ? "rgba(255,255,255,0.2)"  : "rgba(0,0,0,0.15)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid polygons */}
      {Array.from({ length: levels }, (_, lvl) => (
        <polygon key={lvl} points={gridPolygon(lvl + 1)} fill="none" stroke={gridStroke} strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const outer = point(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={axisStroke} strokeWidth="1" />;
      })}

      {/* Data polygon fill */}
      <motion.polygon
        points={dataPolygon}
        fill="rgba(0,212,170,0.12)"
        stroke="#00d4aa"
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data point dots */}
      {dimensions.map((d, i) => {
        const r = (maxR * Math.min(d.value, 100)) / 100;
        const p = point(i, r);
        return (
          <motion.circle key={i} cx={p.x} cy={p.y} r={5}
            fill={d.color} stroke={isDark ? "#060a12" : "#ffffff"} strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
          />
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={centerDot} />

      {/* Axis labels — bold, high contrast */}
      {dimensions.map((d, i) => {
        const labelR = maxR + 24;
        const p = point(i, labelR);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        return (
          <g key={i}>
            <text x={p.x} y={p.y + 3} textAnchor={anchor}
              fontSize="11" fill={labelColor}
              fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontWeight="700">
              {d.label}
            </text>
            <text x={p.x} y={p.y + 16} textAnchor={anchor}
              fontSize="12" fill={d.color}
              fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontWeight="800">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
