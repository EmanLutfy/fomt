"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { TOKENS } from "@/lib/mock-data";
import { container, eyebrow } from "@/lib/ui";
import { TokenCard } from "@/components/tokens/TokenCard";
import { Pinned } from "@/components/scroll/Pinned";
import { ScrubText } from "@/components/scroll/ScrubText";
import { ScrollRail } from "@/components/scroll/ScrollRail";
import { still } from "@/components/scroll/useReducedMotionSafe";
import { SiteBeam, beamReplacesBorder } from "@/components/ui/site-beam";
import type { Token } from "@/types/token";

const TOP = [...TOKENS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 3);

export function HomeTokens() {
  return (
    <Pinned length={160} label="Most active tokens">
      {({ progress, reduce }) => <TokensStage p={progress} reduce={reduce} />}
    </Pinned>
  );
}

function TokensStage({
  p,
  reduce,
}: {
  p: MotionValue<number>;
  reduce: boolean;
}) {
  const metaOpacity = useTransform(p, [0.06, 0.18], [0, 1]);

  return (
    <div
      className={`${container} flex h-full flex-col justify-center pb-10 pt-24`}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <motion.span style={{ opacity: metaOpacity }} className={eyebrow}>
            Tokens
          </motion.span>
          <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            <ScrubText
              text="Most active by mcap"
              progress={p}
              range={[0, 0.16]}
            />
          </h2>
        </div>
        <motion.div style={{ opacity: metaOpacity }}>
          <Link
            href="/tokens"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all tokens →
          </Link>
        </motion.div>
      </div>
      <div className="hidden grid-cols-3 gap-4 sm:grid">
        {TOP.map((t, i) => (
          <RisingCard
            key={t.symbol}
            token={t}
            index={i}
            p={p}
            reduce={reduce}
          />
        ))}
      </div>
      <div className="sm:hidden">
        <ScrollRail progress={p} range={[0.12, 0.82]} reduce={reduce}>
          {TOP.map((t) => (
            <SiteBeam key={t.symbol}>
              <TokenCard token={t} className={beamReplacesBorder} />
            </SiteBeam>
          ))}
        </ScrollRail>
      </div>
    </div>
  );
}

// Parallax rise: every card finishes in the same place, but the later ones
// start further down and travel faster, so the row assembles with depth.
function RisingCard({
  token,
  index,
  p,
  reduce,
}: {
  token: Token;
  index: number;
  p: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(
    p,
    [0.08, 0.5 + index * 0.06],
    still(reduce, [160 + index * 90, 0]),
  );
  const scale = useTransform(
    p,
    [0.08, 0.5 + index * 0.06],
    still(reduce, [0.94, 1], 1),
  );
  const opacity = useTransform(
    p,
    [0.08 + index * 0.05, 0.24 + index * 0.05],
    [0, 1],
  );
  return (
    <motion.div style={{ y, scale, opacity }} className="will-change-transform">
      <SiteBeam>
        <TokenCard token={token} className={beamReplacesBorder} />
      </SiteBeam>
    </motion.div>
  );
}
