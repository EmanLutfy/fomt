"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsLeftRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  Coins,
  Drop,
  House,
  Pulse,
  TreeStructure,
  Trophy,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useStatus } from "@/components/app/FomoProvider";
import { clock, duration, usd } from "@/lib/fomo/format";
import { ROSTER_NAMED, ROSTER_SIZE } from "@/lib/fomo/engine";

export const NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/tape", label: "Live Tape", icon: Pulse },
  { href: "/traders", label: "Traders", icon: Trophy },
  { href: "/closed", label: "Closed Trades", icon: ArrowsLeftRight },
  { href: "/tokens", label: "Tokens", icon: Coins },
  { href: "/kols", label: "KOL List", icon: UsersThree },
  { href: "/follows", label: "Who Followed Who", icon: TreeStructure },
  { href: "/pools", label: "Fresh Pools", icon: Drop },
] as const;

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="fomotrenches home">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-ink text-[15px] font-semibold text-bg">f</span>
      {!compact && <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">fomotrenches</span>}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function StatusCard({ compact }: { compact: boolean }) {
  const s = useStatus();
  if (compact) {
    return (
      <div className="flex justify-center py-2" title={`live · lag ${s.lag}s`}>
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-up" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-card p-3.5 text-[12px] leading-relaxed text-ink-dim">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-up" />
          live · lag {s.lag}s
        </span>
        <span className="tabular">{s.clock ? clock(s.clock) : "--.--.--"}</span>
      </div>
      <div className="tabular">robinhood chain · head {s.head ? s.head.toLocaleString("en-US") : "—"}</div>
      <div>
        tracking {ROSTER_SIZE} wallets ({ROSTER_NAMED} named)
      </div>
      <div className="tabular">
        eth {s.eth ? usd(s.eth) : "—"} · {s.viewers} viewer{s.viewers === 1 ? "" : "s"}
      </div>
      <div className="mt-1.5 border-t border-line pt-1.5 tabular">
        session {usd(s.session.volume)} · {s.session.fills} fills ·{" "}
        {s.session.startedAt ? duration(Math.max(1000, s.clock - s.session.startedAt)) : "0s"}
      </div>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  const nav = (compact: boolean, onNavigate?: () => void) => (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={compact ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-xl py-2.5 text-[16px] transition-colors",
              compact ? "justify-center px-0" : "px-3",
              active ? "font-semibold text-ink" : "text-ink-muted hover:bg-card hover:text-ink",
            )}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} className="shrink-0" />
            {!compact && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-bg transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-[272px]",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center", collapsed ? "justify-center" : "px-6")}>
          <Wordmark compact={collapsed} />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-[18px] grid h-7 w-7 place-items-center rounded-full border border-line-strong bg-bg text-ink-muted transition-colors hover:text-ink"
        >
          {collapsed ? <CaretDoubleRight size={13} /> : <CaretDoubleLeft size={13} />}
        </button>
        <div className={cn("mt-4 flex-1 overflow-y-auto", collapsed ? "px-2.5" : "px-3.5")}>{nav(collapsed)}</div>
        <div className={cn("shrink-0 pb-4", collapsed ? "px-2.5" : "px-3.5")}>
          <StatusCard compact={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onCloseMobile}
          className={cn("absolute inset-0 bg-black/60 transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col border-r border-line bg-bg transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            <Wordmark />
            <button type="button" onClick={onCloseMobile} aria-label="Close menu" className="p-2 text-ink-muted">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3.5 pt-2">{nav(false, onCloseMobile)}</div>
          <div className="px-3.5 pb-5">
            <StatusCard compact={false} />
          </div>
        </aside>
      </div>
    </>
  );
}
