"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useFomoData, useSettings } from "@/components/app/FomoProvider";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { TokenArt } from "@/components/app/TokenArt";
import { shortAddress } from "@/lib/fomo/format";
import { traderHref } from "@/components/app/ui";

interface Result {
  key: string;
  href: string;
  kind: "trader" | "token" | "tape";
  title: string;
  sub: string;
  avatar: React.ReactNode;
}

export function SearchBox({ className }: { className?: string }) {
  const { engine } = useFomoData();
  const { registerSearch } = useSettings();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!engine || !term) return [];
    const out: Result[] = [];
    for (const t of engine.tokens) {
      if (t.symbol.toLowerCase().includes(term) || t.name.toLowerCase().includes(term)) {
        out.push({
          key: "t" + t.symbol,
          href: `/tape?q=${encodeURIComponent(t.symbol)}`,
          kind: "token",
          title: t.symbol,
          sub: t.name,
          avatar: <TokenArt symbol={t.symbol} rounded="rounded-md" className="h-7 w-7" />,
        });
      }
      if (out.length >= 3) break;
    }
    for (const w of engine.wallets) {
      if (out.length >= 8) break;
      const hit =
        (w.handle && w.handle.toLowerCase().includes(term)) ||
        (w.name && w.name.toLowerCase().includes(term)) ||
        (term.startsWith("0x") && w.address.startsWith(term));
      if (hit) {
        out.push({
          key: "w" + w.address,
          href: traderHref(w),
          kind: "trader",
          title: w.handle ?? shortAddress(w.address),
          sub: w.handle ? (w.name ?? "") : "onchain-only",
          avatar: <TraderAvatar handle={w.handle ?? w.address} className="h-7 w-7" />,
        });
      }
    }
    out.push({
      key: "tape",
      href: `/tape?q=${encodeURIComponent(q.trim())}`,
      kind: "tape",
      title: `Search the tape for “${q.trim()}”`,
      sub: "handle, token or wallet",
      avatar: (
        <span className="grid h-7 w-7 place-items-center rounded-md bg-card-raised text-ink-muted">
          <MagnifyingGlass size={14} />
        </span>
      ),
    });
    return out;
  }, [engine, q]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    router.push(r.href);
    setOpen(false);
    setQ("");
  };

  return (
    <div className={cn("hb rounded-full", className)}>
      <MagnifyingGlass size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim" />
      <input
        ref={registerSearch}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter") go(results[active]);
        }}
        placeholder="Search handle, token or wallet"
        aria-label="Search handle, token or wallet"
        className="h-11 w-full rounded-full bg-transparent pl-11 pr-12 text-[14px] text-ink placeholder:text-ink-dim focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-px text-[11px] text-ink-dim sm:block">
        /
      </kbd>
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line-strong bg-card-raised p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          onMouseDown={() => clearTimeout(blurTimer.current)}
        >
          {results.map((r, i) => (
            <button
              key={r.key}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm",
                i === active ? "bg-white/[0.06]" : "",
              )}
            >
              {r.avatar}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{r.title}</span>
                <span className="block truncate text-xs text-ink-dim">{r.sub}</span>
              </span>
              <span className="text-[11px] uppercase tracking-wide text-ink-dim">{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
