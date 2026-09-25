import type { Token, TokenStats } from "@/types/token";
import { formatCompactUsd, formatPrice } from "@/lib/utils";

const STATS = [
  { key: "trackedWalletsActive", label: "Tracked wallets active" },
  { key: "buys", label: "Buys" },
  { key: "sells", label: "Sells" },
  { key: "trackedBuyVolumeUsd", label: "Tracked buy volume", format: true },
  { key: "trackedSellVolumeUsd", label: "Tracked sell volume", format: true },
] as const;

export function TokenStatsHeader({ token, stats }: { token: Token; stats: TokenStats }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="font-sans font-extrabold tracking-tight text-2xl text-ink sm:text-3xl">${token.symbol}</h1>
        <span className="text-sm text-ink-dim">{token.name}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm text-ink-muted">
        <span>{formatPrice(token.price)}</span>
        <span>mcap {formatCompactUsd(token.marketCap)}</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border border-border p-5 sm:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.key}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">{s.label}</p>
            <p className="mt-1 font-mono text-lg text-ink">
              {"format" in s && s.format ? formatCompactUsd(stats[s.key]) : stats[s.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
