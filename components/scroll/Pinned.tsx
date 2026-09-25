"use client";

import { useRef, type ReactNode } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/components/scroll/useReducedMotionSafe";

export type PinnedState = {
  // 0 → 1 while the stage is pinned (section top at viewport top → section
  // bottom at viewport bottom).
  progress: MotionValue<number>;
  // 0 → 1 while the section scrolls up into view, before the pin engages.
  enter: MotionValue<number>;
  reduce: boolean;
};

// A light spring gives scrubbing some weight but always settles exactly where
// the scroll stopped, so pausing mid-section holds that frame.
const SPRING = { stiffness: 170, damping: 34, mass: 0.3, restDelta: 0.0005 };

// A tall section whose full-screen stage sticks to the viewport for
// `length` svh of scrolling, then releases into the next section. Native
// sticky positioning only — no wheel/touch interception, no scroll-snap — so
// the page always scrolls the way the browser normally does.
export function Pinned({
  length,
  label,
  className = "",
  children,
}: {
  length: number;
  label?: string;
  className?: string;
  children: (state: PinnedState) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: enterRaw } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const progressSmooth = useSpring(scrollYProgress, SPRING);
  const enterSmooth = useSpring(enterRaw, SPRING);

  return (
    <section
      ref={ref}
      aria-label={label}
      className={`relative ${className}`}
      style={{ height: `${length}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {children({
          progress: reduce ? scrollYProgress : progressSmooth,
          enter: reduce ? enterRaw : enterSmooth,
          reduce,
        })}
      </div>
    </section>
  );
}
