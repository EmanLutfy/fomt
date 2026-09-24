import { demoBadge, buyPill, sellPill } from "@/lib/ui";
import type { TradeSide } from "@/types/trade";

// Marks every mock feed so nobody mistakes it for a live backend connection.
export function DemoDataBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`${demoBadge} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-ink-dim" />
      Demo data
    </span>
  );
}

// The pulse marks a real state: the interval in useLiveTrades is actually
// running and rows are actually being appended.
export function LiveIndicator({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-accent ${className}`}
    >
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
      Live
    </span>
  );
}

export function TrackedWalletBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-accent ${className}`}
    >
      Tracked wallet
    </span>
  );
}

export function SidePill({ side }: { side: TradeSide }) {
  const cls = side === "BUY" ? buyPill : sellPill;
  return (
    <span className={`inline-flex w-14 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.06em] ${cls}`}>
      {side}
    </span>
  );
}
