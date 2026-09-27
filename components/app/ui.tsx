"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { TokenArt } from "@/components/app/TokenArt";
import { toneOf, pnl as fmtPnl, walletLabel } from "@/lib/fomo/format";
import type { Check, Wallet } from "@/lib/fomo/types";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-card border border-line bg-card", className)}>{children}</div>;
}

/** Bento preview tile: content up top, "Label ... Open →" along the bottom. */
export function PreviewCard({
  label,
  href,
  className,
  children,
}: {
  label: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-line bg-card transition-colors hover:border-line-strong",
        className,
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      <div className="relative z-10 flex items-center justify-between px-4 pb-3.5 pt-2 text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="flex items-center gap-1 text-ink-muted transition-colors group-hover:text-ink">
          Open <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

export function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[1.6rem] font-medium leading-tight tracking-[-0.03em] text-ink">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink-dim">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[2rem] font-medium leading-tight tracking-[-0.035em] text-ink sm:text-[2.4rem]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-dim">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/** Segmented pill group, e.g. all / buys / sells. */
export function Pills<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: ReactNode; hint?: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.hint}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-full border transition-colors",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-[13px]",
            value === o.value
              ? "border-line-strong bg-card-raised text-ink"
              : "border-transparent text-ink-dim hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-3 text-[13px] text-ink-dim tabular">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className="rounded-full p-1.5 transition-colors hover:text-ink disabled:opacity-30"
      >
        <CaretLeft size={15} />
      </button>
      <span>
        {page + 1} / {pages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pages - 1}
        onClick={() => onChange(page + 1)}
        className="rounded-full p-1.5 transition-colors hover:text-ink disabled:opacity-30"
      >
        <CaretRight size={15} />
      </button>
    </div>
  );
}

export function CheckBadge({ check, className }: { check: Check | null; className?: string }) {
  const style =
    check === "high"
      ? "border-up/30 bg-up/10 text-up"
      : check === "medium"
        ? "border-warn/30 bg-warn/10 text-warn"
        : check === "low"
          ? "border-line-strong text-ink-dim"
          : "border-line text-ink-dim";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center rounded-full border px-2 py-px text-[11px] font-medium", style, className)}
      title={check ? `Handle↔wallet check: ${check}` : "No published handle — found on-chain only"}
    >
      {check ?? "onchain-only"}
    </span>
  );
}

export function SideTag({ side }: { side: "buy" | "sell" }) {
  return (
    <span
      className={cn(
        "inline-flex w-[42px] shrink-0 justify-center rounded-full py-px text-[11px] font-semibold uppercase tracking-wide",
        side === "buy" ? "bg-up/15 text-up" : "bg-down/15 text-down",
      )}
    >
      {side}
    </span>
  );
}

export function PreTapeTag() {
  return (
    <span
      className="inline-flex shrink-0 rounded-full border border-line px-1.5 text-[10px] text-ink-dim"
      title="Sold from a bag bought before the tape started — its cost is unknown, so it's left out of P/L"
    >
      pre-tape
    </span>
  );
}

export function Pnl({ value, className }: { value: number | null; className?: string }) {
  if (value === null) return <span className={cn("text-ink-dim", className)}>—</span>;
  return <span className={cn("tabular", toneOf(value), className)}>{fmtPnl(value)}</span>;
}

export function traderHref(w: Wallet) {
  return `/traders/${encodeURIComponent(w.handle ?? w.address)}`;
}

/** Avatar + handle (or short address) linking to the trader's profile. */
export function WalletChip({
  wallet,
  size = 24,
  showCheck = false,
  className,
  bold = true,
}: {
  wallet: Wallet;
  size?: number;
  showCheck?: boolean;
  className?: string;
  bold?: boolean;
}) {
  return (
    <Link
      href={traderHref(wallet)}
      className={cn("inline-flex min-w-0 items-center gap-2 hover:underline", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <TraderAvatar handle={wallet.handle ?? wallet.address} className="shrink-0" style={{ width: size, height: size }} />
      <span
        className={cn(
          "truncate",
          wallet.handle ? (bold ? "font-medium text-ink" : "text-ink") : "font-mono text-[0.92em] text-ink-muted",
        )}
      >
        {walletLabel(wallet)}
      </span>
      {showCheck && <CheckBadge check={wallet.check} />}
    </Link>
  );
}

export function TokenChip({ symbol, name, size = 24 }: { symbol: string; name?: string; size?: number }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <TokenArt symbol={symbol} rounded="rounded-md" style={{ width: size, height: size }} />
      <span className="truncate font-medium text-ink">{symbol}</span>
      {name && <span className="truncate text-ink-dim">{name}</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,#141414_0%,#1c1c1c_50%,#141414_100%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-ink-dim">{children}</div>;
}

/** Shared table styling: sticky header, hairline rows. */
export const table = {
  wrap: "overflow-x-auto",
  table: "w-full min-w-max border-collapse text-[13px]",
  th: "sticky top-0 z-10 whitespace-nowrap bg-card px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-ink-dim first:pl-4 last:pr-4",
  thNum: "text-right",
  tr: "border-t border-line transition-colors hover:bg-card-hover",
  td: "whitespace-nowrap px-3 py-2.5 first:pl-4 last:pr-4",
  tdNum: "text-right tabular",
};
