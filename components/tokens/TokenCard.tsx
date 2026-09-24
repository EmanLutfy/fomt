import Link from "next/link";
import type { Token } from "@/types/token";
import { card, data } from "@/lib/ui";
import { formatCompactUsd, formatPrice } from "@/lib/utils";

export function TokenCard({ token }: { token: Token }) {
  return (
    <Link href={`/tokens/${token.symbol.toLowerCase()}`} className={`${card} flex flex-col gap-4 p-5`}>
      <div>
        <p className="font-display text-lg text-ink">${token.symbol}</p>
        <p className="mt-1 text-xs text-ink-dim">{token.name}</p>
      </div>
      <div className="flex items-center gap-6 border-t border-border pt-4 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Price</p>
          <p className={`${data} mt-1 text-ink`}>{formatPrice(token.price)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Mcap</p>
          <p className={`${data} mt-1 text-ink`}>{formatCompactUsd(token.marketCap)}</p>
        </div>
      </div>
    </Link>
  );
}
