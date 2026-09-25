"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { TRADERS } from "@/lib/mock-data";
import { container, eyebrow } from "@/lib/ui";
import { TraderCard } from "@/components/traders/TraderCard";
import { Pinned } from "@/components/scroll/Pinned";
import { ScrubText } from "@/components/scroll/ScrubText";
import { ScrollRail } from "@/components/scroll/ScrollRail";
import { still } from "@/components/scroll/useReducedMotionSafe";
import { SiteBeam, beamReplacesBorder } from "@/components/ui/site-beam";
import type { Trader } from "@/types/trader";

const TOP = TRADERS.slice(0, 3);

export function HomeTraders() {
  return (
    <Pinned
      length={260}
      label="Tracked traders"
      className="border-b border-border"
    >
      {({ progress, reduce }) => <TradersStage p={progress} reduce={reduce} />}
    </Pinned>
  );
}

function TradersStage({
  p,
  reduce,
}: {
  p: MotionValue<number>;
  reduce: boolean;
}) {
  const metaOpacity = useTransform(p, [0.06, 0.18], [0, 1]);
  const exit = useTransform(p, [0.9, 1], [1, 0.55]);

  return (
    <motion.div
      style={{ opacity: exit }}
      className={`${container} flex h-full flex-col justify-center pb-10 pt-24`}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <motion.span style={{ opacity: metaOpacity }} className={eyebrow}>
            Wallets
          </motion.span>
          <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            <ScrubText text="Tracked traders" progress={p} range={[0, 0.12]} />
          </h2>
        </div>
        <motion.div style={{ opacity: metaOpacity }}>
          <Link
            href="/traders"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all traders →
          </Link>
        </motion.div>
      </div>
      <div className="hidden grid-cols-3 gap-4 sm:grid">
        {TOP.map((t, i) => (
          <SlidingCard
            key={t.handle}
            trader={t}
            index={i}
            p={p}
            reduce={reduce}
          />
        ))}
      </div>
      <div className="sm:hidden">
        <ScrollRail progress={p} range={[0.14, 0.84]} reduce={reduce}>
          {TOP.map((t) => (
            <SiteBeam key={t.handle}>
              <TraderCard trader={t} className={beamReplacesBorder} />
            </SiteBeam>
          ))}
        </ScrollRail>
      </div>
    </motion.div>
  );
}

// Cards travel in from the right on vertical scroll, each over its own
// stretch and distance, so they arrive staggered like layers at different
// depths rather than as one block.
function SlidingCard({
  trader,
  index,
  p,
  reduce,
}: {
  trader: Trader;
  index: number;
  p: MotionValue<number>;
  reduce: boolean;
}) {
  const start = 0.14 + index * 0.12;
  const end = start + 0.32;
  const x = useTransform(
    p,
    [start, end],
    still(reduce, [240 + index * 120, 0]),
  );
  const opacity = useTransform(p, [start, start + 0.14], [0, 1]);
  return (
    <motion.div style={{ x, opacity }} className="will-change-transform">
      <SiteBeam>
        <TraderCard trader={trader} className={beamReplacesBorder} />
      </SiteBeam>
    </motion.div>
  );
}
