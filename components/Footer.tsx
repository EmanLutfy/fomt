import Link from "next/link";
import { container } from "@/lib/ui";
import { DemoDataBadge } from "@/components/ui/Badge";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className={`${container} flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="flex max-w-sm flex-col gap-3">
          <span className="font-display text-xl font-normal tracking-tight text-ink">FOMT</span>
          <p className="text-sm leading-relaxed text-ink-muted">
            Fear Of Missing Trenches is a read-only intelligence terminal for Robinhood Chain. It surfaces
            what tracked wallets are doing on-chain and makes no trades on your behalf.
          </p>
          <DemoDataBadge />
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim">Product</span>
          <Link href="/terminal" className="text-ink-muted transition hover:text-ink">
            Terminal
          </Link>
          <Link href="/traders" className="text-ink-muted transition hover:text-ink">
            Traders
          </Link>
          <Link href="/tokens" className="text-ink-muted transition hover:text-ink">
            Tokens
          </Link>
        </div>
      </div>
      <div className={`${container} border-t border-border py-5`}>
        <p className="text-xs leading-relaxed text-ink-dim">
          FOMT displays public on-chain activity for informational purposes only. It is not investment advice,
          not a trading platform, and does not custody funds. All data on this build is simulated demo data.
        </p>
      </div>
    </footer>
  );
}
