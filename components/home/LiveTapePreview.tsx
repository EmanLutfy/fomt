"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLiveTrades } from "@/hooks/use-live-trades";
import { panel, container, eyebrow } from "@/lib/ui";
import { DemoDataBadge, LiveIndicator } from "@/components/ui/Badge";
import { TerminalTable } from "@/components/terminal/TerminalTable";
import { Pinned } from "@/components/scroll/Pinned";
import { ScrubText } from "@/components/scroll/ScrubText";
import { still } from "@/components/scroll/useReducedMotionSafe";
import { SiteBeam, beamReplacesBorder } from "@/components/ui/site-beam";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types/trade";

export function LiveTapePreview() {
  const { trades, latestId } = useLiveTrades();
  const preview = trades.slice(0, 8);

  return (
    <Pinned length={200} label="The tape" className="border-b border-border">
      {({ progress, enter, reduce }) => (
        <TapeStage
          p={progress}
          enter={enter}
          reduce={reduce}
          trades={preview}
          latestId={latestId}
        />
      )}
    </Pinned>
  );
}

function TapeStage({
  p,
  enter,
  reduce,
  trades,
  latestId,
}: {
  p: MotionValue<number>;
  enter: MotionValue<number>;
  reduce: boolean;
  trades: Trade[];
  latestId: string | null | undefined;
}) {
  const metaOpacity = useTransform(p, [0.08, 0.2], [0, 1]);

  // The panel rises while the section scrolls into view, settles once
  // pinned, then steps back slightly as the section hands off.
  const panelY = useTransform(enter, [0, 1], still(reduce, [140, 0]));
  const panelScale = useTransform(
    p,
    [0, 0.18, 0.86, 1],
    still(reduce, [0.95, 1, 1, 0.97], 1),
  );
  const panelOpacity = useTransform(p, [0.86, 1], [1, 0.55]);

  // Rows are uncovered top to bottom by a feathered mask sweeping down the
  // panel — one paint layer, and it works for both the desktop table and the
  // stacked mobile list without knowing row positions.
  const reveal = useTransform(p, [0.14, 0.62], [14, 118]);
  const mask = useMotionTemplate`linear-gradient(to bottom, black ${reveal}%, transparent calc(${reveal}% + 18%))`;

  const linkOpacity = useTransform(p, [0.6, 0.72], [0, 1]);

  return (
    <div
      className={`${container} flex h-full flex-col justify-center gap-6 pb-10 pt-24`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <motion.span style={{ opacity: metaOpacity }} className={eyebrow}>
            The tape
          </motion.span>
          <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            <ScrubText
              text="Trades as they land"
              progress={p}
              range={[0, 0.16]}
            />
          </h2>
        </div>
        <motion.div
          style={{ opacity: metaOpacity }}
          className="flex items-center gap-2"
        >
          <LiveIndicator />
          <DemoDataBadge />
        </motion.div>
      </div>

      <motion.div
        style={{ y: panelY, scale: panelScale, opacity: panelOpacity }}
        className="origin-top will-change-transform"
      >
        <SiteBeam>
          <motion.div
            style={{ maskImage: mask, WebkitMaskImage: mask }}
            // On phones the stacked rows run taller than one screen, so the
            // preview is capped to the space the pinned stage has left and fades
            // out at the bottom; the full list is one tap away via the link.
            className={cn(
              panel,
              "relative max-h-[calc(100svh-19rem)] overflow-hidden sm:max-h-none",
              beamReplacesBorder,
            )}
          >
            <TerminalTable trades={trades} latestId={latestId} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent sm:hidden"
            />
          </motion.div>
        </SiteBeam>
      </motion.div>

      <motion.div style={{ opacity: linkOpacity }}>
        <Link
          href="/terminal"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Open the full terminal →
        </Link>
      </motion.div>
    </div>
  );
}
