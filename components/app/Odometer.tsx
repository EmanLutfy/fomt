"use client";

import { cn } from "@/lib/utils";

// Rolling-digit number: each digit is a 0–9 column that slides to its value,
// so changes roll instead of snapping. Non-digits ($ , .) render as-is.
export function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex overflow-hidden leading-none tabular", className)} aria-label={value}>
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden">
            <span
              className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ transform: `translateY(-${Number(ch)}em)` }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} className="block h-[1em]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true" className="inline-block h-[1em]">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/** Soft area sparkline for the bento cards. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  const w = 100;
  const h = 40;
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - (v / max) * (h - 4) - 2] as const);
  // Smooth with midpoint quadratic curves.
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
  }
  d += ` T ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.16" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#spark-fill)" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
