"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFomoData } from "@/components/app/FomoProvider";
import { Card, Empty, PageTitle, Skeleton, WalletChip } from "@/components/app/ui";
import { TokenArt } from "@/components/app/TokenArt";
import { PreviewNote } from "@/components/app/views/FollowsView";
import { freshPools } from "@/lib/fomo/derive";
import { useMemo } from "react";
import { ago, duration, pct, shortAddress, toneOf, usd } from "@/lib/fomo/format";

export function PoolsView() {
  const { engine, version, now } = useFomoData();
  const pools = useMemo(
    () => (engine ? freshPools(engine, now) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, version],
  );

  return (
    <div>
      <PageTitle title="Fresh Pools" sub="New pools from the last 7 days, and which tracked wallets got in early." />
      <PreviewNote>
        Preview layout. This tab wasn&apos;t opened in the backend recording, so it&apos;s built from its name: pools created in
        the last 7 days, with liquidity, market cap and the first tracked wallet in. Adjust once the backend format is
        confirmed.
      </PreviewNote>

      {!pools ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-card" />
          ))}
        </div>
      ) : pools.length === 0 ? (
        <Card>
          <Empty>No new pools in the last 7 days.</Empty>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pools.map((p) => (
            <Card key={p.symbol} className="p-4 transition-colors hover:border-line-strong">
              <div className="flex items-center gap-3">
                <TokenArt symbol={p.symbol} rounded="rounded-2xl" className="h-14 w-14" />
                <div className="min-w-0 flex-1">
                  <Link href={`/tape?q=${p.symbol}`} className="block truncate text-[16px] font-medium hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-[12px] text-ink-dim">
                    {p.symbol} · <span className="font-mono">{shortAddress(p.address)}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-card-raised px-2.5 py-1 text-[12px] font-medium text-ink tabular">
                  {ago(p.createdAt, now)} old
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                {[
                  ["Mcap", usd(p.mcap), ""],
                  ["Liquidity", usd(p.liquidity), ""],
                  ["Since launch", pct(p.sinceLaunch), toneOf(p.sinceLaunch)],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-xl bg-card-raised px-2.5 py-2">
                    <div className="text-ink-dim">{label}</div>
                    <div className={cn("mt-0.5 text-[14px] font-medium tabular", tone)}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-[12.5px] text-ink-dim">
                {p.firstKol ? (
                  <>
                    <span className="flex min-w-0 items-center gap-1.5">
                      first in <WalletChip wallet={p.firstKol} size={18} className="text-ink" />
                    </span>
                    <span className="shrink-0 tabular">
                      +{duration(p.firstKolDelayMs!)} · {p.kolsIn} in
                    </span>
                  </>
                ) : (
                  <span>No tracked wallet in yet</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
