import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Placeholder token artwork, generated from the ticker: a two-tone gradient
// tile with a soft shape and the ticker's initial. Stands in for real token
// images until the feed provides them. Same ticker, same art.

const HUES = [4, 22, 38, 52, 96, 142, 168, 190, 208, 226, 252, 274, 296, 318, 340];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function tokenHue(symbol: string) {
  return HUES[hash(symbol) % HUES.length];
}

export function TokenArt({
  symbol,
  className,
  rounded = "rounded-xl",
  showInitial = true,
  style,
}: {
  symbol: string;
  className?: string;
  rounded?: string;
  showInitial?: boolean;
  style?: CSSProperties;
}) {
  const h = hash(symbol);
  const hue = HUES[h % HUES.length];
  const hue2 = (hue + 30 + (h % 60)) % 360;
  const shape = (h >> 4) % 3;
  const cx = 30 + ((h >> 8) % 40);
  const cy = 30 + ((h >> 12) % 40);
  const id = `ta-${symbol}`;

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("shrink-0 overflow-hidden", rounded, className)} style={style}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 70% 58%)`} />
          <stop offset="1" stopColor={`hsl(${hue2} 65% 30%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
      {shape === 0 && <circle cx={cx} cy={cy} r="34" fill="white" opacity="0.14" />}
      {shape === 1 && <rect x={cx - 30} y={cy - 30} width="60" height="60" rx="16" fill="white" opacity="0.12" transform={`rotate(${h % 45} ${cx} ${cy})`} />}
      {shape === 2 && <path d={`M0 ${cy + 20} Q50 ${cy - 30} 100 ${cy + 10} V100 H0 Z`} fill="black" opacity="0.18" />}
      {showInitial && (
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="44"
          fontWeight="600"
          fill="white"
          fillOpacity="0.92"
          fontFamily="var(--font-sans), system-ui, sans-serif"
        >
          {symbol[0]}
        </text>
      )}
    </svg>
  );
}
