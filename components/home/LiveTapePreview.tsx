"use client";

import Link from "next/link";
import { useLiveTrades } from "@/hooks/use-live-trades";
import { panel, container, eyebrow } from "@/lib/ui";
import { DemoDataBadge, LiveIndicator } from "@/components/ui/Badge";
import { TerminalTable } from "@/components/terminal/TerminalTable";

export function LiveTapePreview() {
  const { trades, latestId } = useLiveTrades();
  const preview = trades.slice(0, 8);

  return (
    <section className="border-b border-border">
      <div className={`${container} py-16 sm:py-24`}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className={eyebrow}>The tape</span>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Trades as they land</h2>
          </div>
          <div className="flex items-center gap-2">
            <LiveIndicator />
            <DemoDataBadge />
          </div>
        </div>

        <div className={`${panel} overflow-hidden`}>
          <TerminalTable trades={preview} latestId={latestId} />
        </div>

        <Link href="/terminal" className="mt-5 inline-block text-sm font-medium text-accent hover:underline">
          Open the full terminal →
        </Link>
      </div>
    </section>
  );
}
