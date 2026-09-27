"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDerived, useFomoData } from "@/components/app/FomoProvider";
import {
  Card,
  Empty,
  PageTitle,
  Pills,
  PreTapeTag,
  SideTag,
  Skeleton,
  TokenChip,
  WalletChip,
  table,
} from "@/components/app/ui";
import { tapeFills } from "@/lib/fomo/derive";
import { amount, clock, count, price, usd } from "@/lib/fomo/format";
import type { Engine } from "@/lib/fomo/engine";
import type { Fill } from "@/lib/fomo/types";

type SideFilter = "all" | "buy" | "sell";
type WhoFilter = "all" | "named";

const PAGE = 200;

function matches(engine: Engine, f: Fill, term: string) {
  if (!term) return true;
  const w = engine.byAddress.get(f.wallet)!;
  const token = engine.bySymbol.get(f.token)!;
  return (
    f.token.toLowerCase().includes(term) ||
    token.name.toLowerCase().includes(term) ||
    (w.handle?.toLowerCase().includes(term) ?? false) ||
    f.wallet.startsWith(term)
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-full border border-line-strong px-3 text-[12.5px] text-ink-dim">
      {label}
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        placeholder="any"
        className="w-14 bg-transparent text-ink tabular placeholder:text-ink-dim focus:outline-none"
      />
    </label>
  );
}

export function TapeView() {
  const params = useSearchParams();
  const { engine, now } = useFomoData();
  const fills = useDerived((e, win, n) => tapeFills(e, win, n));

  const [side, setSide] = useState<SideFilter>("all");
  const [who, setWho] = useState<WhoFilter>("all");
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [minMcap, setMinMcap] = useState("");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => setTerm(params.get("q") ?? ""), [params]);

  const filtered = useMemo(() => {
    if (!engine || !fills) return null;
    const t = term.trim().toLowerCase();
    const lo = minSize ? Number(minSize) : 0;
    const hi = maxSize ? Number(maxSize) : Infinity;
    const mc = minMcap ? Number(minMcap) * 1000 : 0;
    return fills.filter(
      (f) =>
        (side === "all" || f.side === side) &&
        (who === "all" || engine.byAddress.get(f.wallet)!.handle) &&
        f.sizeUsd >= lo &&
        f.sizeUsd <= hi &&
        f.mcap >= mc &&
        matches(engine, f, t),
    );
  }, [engine, fills, side, who, term, minSize, maxSize, minMcap]);

  const visible = filtered;

  // Only rows that land after the page opened get the arrival highlight.
  const openedAt = useRef(0);
  if (!openedAt.current && now) openedAt.current = now;

  const volume = visible?.reduce((s, f) => s + f.sizeUsd, 0) ?? 0;

  return (
    <div>
      <PageTitle title="Live Tape" sub="Every buy and sell by the tracked wallets, as it lands." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pills<SideFilter>
          value={side}
          onChange={setSide}
          options={[
            { value: "all", label: "All" },
            { value: "buy", label: "Buys" },
            { value: "sell", label: "Sells" },
          ]}
        />
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <Pills<WhoFilter>
          value={who}
          onChange={setWho}
          options={[
            { value: "all", label: "All wallets" },
            { value: "named", label: "Named" },
          ]}
        />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Filter handle / token / wallet"
          className="h-9 min-w-[200px] flex-1 rounded-full border border-line-strong bg-transparent px-4 text-[13px] text-ink placeholder:text-ink-dim focus:border-white/30 focus:outline-none sm:max-w-[280px]"
        />
        <NumberInput label="min $" value={minSize} onChange={setMinSize} />
        <NumberInput label="max $" value={maxSize} onChange={setMaxSize} />
        <NumberInput label="mcap ≥ $K" value={minMcap} onChange={setMinMcap} />
      </div>

      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] text-ink-dim">
          <span className="tabular">
            {visible ? `${visible.length.toLocaleString("en-US")} fills · ${usd(volume)} volume` : "Loading…"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-up" />
            live
          </span>
        </div>

        {!visible ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <Empty>No fills match these filters in this window.</Empty>
        ) : (
          <>
            {/* Desktop table */}
            <div className={cn(table.wrap, "hidden max-h-[72vh] overflow-y-auto md:block")}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Time</th>
                    <th className={table.th}>Side</th>
                    <th className={table.th}>Token</th>
                    <th className={cn(table.th, table.thNum)}>Size</th>
                    <th className={cn(table.th, table.thNum)}>Price</th>
                    <th className={cn(table.th, table.thNum)}>Mcap</th>
                    <th className={cn(table.th, table.thNum)}>Tokens</th>
                    <th className={table.th}>Trader</th>
                    <th className={cn(table.th, table.thNum)}>Followers</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.slice(0, shown).map((f) => {
                    const w = engine!.byAddress.get(f.wallet)!;
                    return (
                      <tr key={f.id} className={cn(table.tr, f.t > openedAt.current && "animate-row-in")}>
                        <td className={cn(table.td, "tabular text-ink-dim")}>{clock(f.t)}</td>
                        <td className={table.td}>
                          <SideTag side={f.side} />
                        </td>
                        <td className={table.td}>
                          <span className="flex items-center gap-2">
                            <TokenChip symbol={f.token} size={20} />
                            {f.preTape && <PreTapeTag />}
                          </span>
                        </td>
                        <td className={cn(table.td, table.tdNum, "font-medium", f.side === "buy" ? "text-up" : "text-down")}>
                          {usd(f.sizeUsd)}
                        </td>
                        <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{price(f.price)}</td>
                        <td className={cn(table.td, table.tdNum)}>{usd(f.mcap)}</td>
                        <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{amount(f.amount)}</td>
                        <td className={cn(table.td, "max-w-[200px]")}>
                          <WalletChip wallet={w} size={20} />
                        </td>
                        <td className={cn(table.td, table.tdNum, "text-ink-muted")}>
                          {w.followers ? count(w.followers) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phone list */}
            <ul className="divide-y divide-line md:hidden">
              {visible.slice(0, shown).map((f) => {
                const w = engine!.byAddress.get(f.wallet)!;
                return (
                  <li key={f.id} className={cn("px-4 py-3", f.t > openedAt.current && "animate-row-in")}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <SideTag side={f.side} />
                        <TokenChip symbol={f.token} size={20} />
                        {f.preTape && <PreTapeTag />}
                      </span>
                      <span className={cn("text-[15px] font-medium tabular", f.side === "buy" ? "text-up" : "text-down")}>
                        {usd(f.sizeUsd)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3 text-[12.5px] text-ink-dim">
                      <WalletChip wallet={w} size={18} className="text-[13px]" />
                      <span className="shrink-0 tabular">
                        {usd(f.mcap)} mcap · {clock(f.t)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {visible.length > shown && (
              <div className="border-t border-line p-3 text-center">
                <button
                  type="button"
                  onClick={() => setShown((s) => s + PAGE)}
                  className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
                >
                  Show more ({(visible.length - shown).toLocaleString("en-US")} older)
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
