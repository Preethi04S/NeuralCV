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
}

export function RadarChart({ dimensions, size = 260 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.72;
  const levels = 4;
  const n = dimensions.length;

  // Angle for each axis (start from top, go clockwise)
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  // Point on a given level and axis
  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  // Grid polygon for a given level
  const gridPolygon = (level: number) => {
    const r = (maxR * level) / levels;
    return Array.from({ length: n }, (_, i) => {
      const p = point(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
  };

  // Data polygon
  const dataPolygon = dimensions.map((d, i) => {
    const r = (maxR * Math.min(d.value, 100)) / 100;
    const p = point(i, r);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {Array.from({ length: levels }, (_, lvl) => (
        <polygon
          key={lvl}
          points={gridPolygon(lvl + 1)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const outer = point(i, maxR);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={dataPolygon}
        fill="rgba(0,212,170,0.12)"
        stroke="#00d4aa"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {dimensions.map((d, i) => {
        const r = (maxR * Math.min(d.value, 100)) / 100;
        const p = point(i, r);
        return (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r={4}
            fill={d.color}
            stroke="#0b0f1a"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
          />
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.15)" />

      {/* Axis labels */}
      {dimensions.map((d, i) => {
        const labelR = maxR + 22;
        const p = point(i, labelR);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        return (
          <g key={i}>
            <text
              x={p.x} y={p.y + 4}
              textAnchor={anchor}
              fontSize="10"
              fill="rgba(255,255,255,0.45)"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {d.label}
            </text>
            <text
              x={p.x} y={p.y + 15}
              textAnchor={anchor}
              fontSize="10"
              fill={d.color}
              fontFamily="Inter, sans-serif"
              fontWeight="700"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
