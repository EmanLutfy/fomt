import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Letters sharpen in from a blur, one after another, left to right — the
// same effect as the shadcn BlurReveal (12px blur, 10px rise, 0.6s per
// letter, 20ms apart), done in CSS so it needs no animation library and
// starts on first paint instead of waiting for hydration. Screen readers get
// the plain sentence; the per-letter spans are hidden from them.
export function BlurReveal({
  children,
  className,
  delay = 0,
  stagger = 0.02,
  duration = 0.6,
}: {
  children: string;
  className?: string;
  /** seconds before the first letter starts */
  delay?: number;
  /** seconds between letters */
  stagger?: number;
  /** seconds each letter takes */
  duration?: number;
}) {
  let i = 0;
  const letter = (): CSSProperties => ({
    animationDelay: `${delay + i++ * stagger}s`,
    animationDuration: `${duration}s`,
  });
  const words = children.split(" ");

  return (
    <span className={className}>
      <span className="sr-only">{children}</span>
      {words.map((word, w) => (
        // Each word stays whole so lines only break between words.
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {word.split("").map((ch, c) => (
            <span key={c} className="inline-block animate-blur-in" style={letter()}>
              {ch}
            </span>
          ))}
          {w < words.length - 1 && (
            <span className="inline-block animate-blur-in" style={letter()}>
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
