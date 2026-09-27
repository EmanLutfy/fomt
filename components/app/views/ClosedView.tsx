"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useDerived, useFomoData } from "@/components/app/FomoProvider";
import { Card, Empty, PageTitle, Pager, Pills, Skeleton, TokenChip, WalletChip } from "@/components/app/ui";
import { closedTrades } from "@/lib/fomo/derive";
import { ago, duration, pct, pnl, toneOf, usd } from "@/lib/fomo/format";
import type { ClosedTrade } from "@/lib/fomo/types";
import type { Engine } from "@/lib/fomo/engine";

type Filter = "all" | "won" | "lost";
const PER_PAGE = 24;

/** One closed position as a card: big "made", then who / what / how long. */
export function ClosedCard({ c, engine, now }: { c: ClosedTrade; engine: Engine; now: number }) {
  const w = engine.byAddress.get(c.wallet)!;
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3.5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-[1.65rem] font-medium leading-none tracking-[-0.03em] tabular", toneOf(c.made))}>
            {pnl(c.made)}
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[13px] text-ink-dim">
            made by <WalletChip wallet={w} size={18} className="text-ink" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[12px] font-medium tabular",
              c.made >= 0 ? "border-up/30 bg-up/10 text-up" : "border-down/30 bg-down/10 text-down",
            )}
          >
            {pct(c.ret)}
          </span>
          <span className="text-[12px] text-ink-dim tabular">{ago(c.closedAt, now)} ago</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[12.5px] text-ink-muted">
        <Link href={`/tape?q=${c.token}`} className="hover:underline">
          <TokenChip symbol={c.token} size={20} />
        </Link>
        <span className="flex items-center gap-1.5 tabular">
          {usd(c.paidIn)} <ArrowRight size={11} className="text-ink-dim" /> {usd(c.gotOut)}
          <span className="text-ink-dim">· held {duration(c.closedAt - c.openedAt)} · {c.fills} fills</span>
        </span>
      </div>
    </div>
  );
}

export function ClosedView() {
  const { engine, now } = useFomoData();
  const closed = useDerived((e, win, n) => closedTrades(e, win, n));
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => closed?.filter((c) => filter === "all" || (filter === "won" ? c.made > 0 : c.made <= 0)) ?? null,
    [closed, filter],
  );
  const stats = useMemo(() => {
    if (!closed) return null;
    const won = closed.filter((c) => c.made > 0).length;
    return {
      n: closed.length,
      won,
      made: closed.reduce((s, c) => s + c.made, 0),
      paidIn: closed.reduce((s, c) => s + c.paidIn, 0),
    };
  }, [closed]);

  const pages = filtered ? Math.ceil(filtered.length / PER_PAGE) : 0;
  const slice = filtered?.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <PageTitle
        title="Closed Trades"
        sub="Positions taken from flat back to flat, seen by this tape — one card per position."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Closed", stats ? stats.n.toLocaleString("en-US") : null, ""],
          ["Won", stats ? (stats.n ? pct(stats.won / stats.n, false) : "—") : null, ""],
          ["Net made", stats ? pnl(stats.made) : null, stats ? toneOf(stats.made) : ""],
          ["Paid in", stats ? usd(stats.paidIn) : null, ""],
        ].map(([label, value, tone]) => (
          <Card key={label} className="p-4">
            <div className="text-[12px] text-ink-dim">{label}</div>
            {value === null ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <div className={cn("mt-1.5 text-[1.5rem] font-medium tracking-[-0.02em] tabular", tone)}>{value}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Pills<Filter>
          value={filter}
          onChange={(f) => {
            setFilter(f);
            setPage(0);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "won", label: "Winners" },
            { value: "lost", label: "Losers" },
          ]}
        />
        <Pager page={page} pages={pages} onChange={setPage} />
      </div>

      {!slice || !engine ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : slice.length === 0 ? (
        <Card>
          <Empty>No closed positions in this window.</Empty>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {slice.map((c) => (
            <ClosedCard key={c.id} c={c} engine={engine} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
