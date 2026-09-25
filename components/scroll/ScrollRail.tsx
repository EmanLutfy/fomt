"use client";

import { Children, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

const CARD_VW = 78;
const GAP_VW = 4;

// Phone layout for a row of cards inside a pinned section: stacked, they'd
// run taller than one screen and the pinned stage would cut them off, so
// they sit side by side and pan left as the page scrolls down.
//
// Under reduced motion there's no pan; the row becomes a normal, swipeable
// horizontal scroller instead, so every card is still reachable.
export function ScrollRail({
  progress,
  range,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  reduce: boolean;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const travel = (items.length - 1) * (CARD_VW + GAP_VW);
  const x = useTransform(progress, range, ["0vw", `-${travel}vw`]);

  // Cards are links. If one gets keyboard focus while it's panned out of view,
  // scroll the page to the point in the section where that card is centred.
  function revealCard(index: number, el: HTMLElement) {
    if (reduce) return;
    const section = el.closest("section");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const dist = section.offsetHeight - window.innerHeight;
    const at = range[0] + (range[1] - range[0]) * (items.length > 1 ? index / (items.length - 1) : 0);
    window.scrollTo({ top: top + dist * at, behavior: "smooth" });
  }

  if (reduce) {
    return (
      <div className="-mx-5 flex snap-x snap-mandatory gap-[4vw] overflow-x-auto px-5 pb-2">
        {items.map((child, i) => (
          <div key={i} className="w-[78vw] shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div style={{ x }} className="flex gap-[4vw] will-change-transform">
      {items.map((child, i) => (
        <div key={i} className="w-[78vw] shrink-0" onFocusCapture={(e) => revealCard(i, e.currentTarget)}>
          {child}
        </div>
      ))}
    </motion.div>
  );
}
