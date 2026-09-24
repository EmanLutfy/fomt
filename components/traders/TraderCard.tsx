import Link from "next/link";
import type { Trader } from "@/types/trader";
import { card, data } from "@/lib/ui";
import { formatCompactUsd, truncateAddress } from "@/lib/utils";
import { TrackedWalletBadge } from "@/components/ui/Badge";

export function TraderCard({ trader }: { trader: Trader }) {
  return (
    <Link href={`/traders/${trader.handle}`} className={`${card} flex flex-col gap-4 p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-ink">@{trader.handle}</p>
          <p className={`${data} mt-1 text-xs text-ink-dim`}>{truncateAddress(trader.address)}</p>
        </div>
        <TrackedWalletBadge />
      </div>
      <div className="flex items-center gap-6 border-t border-border pt-4 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Fills</p>
          <p className={`${data} mt-1 text-ink`}>{trader.fills}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Volume</p>
          <p className={`${data} mt-1 text-ink`}>{formatCompactUsd(trader.volumeUsd)}</p>
        </div>
      </div>
    </Link>
  );
}
