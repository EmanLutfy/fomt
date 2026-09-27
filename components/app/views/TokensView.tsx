"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDerived, useFomoData } from "@/components/app/FomoProvider";
import { Card, Empty, PageTitle, Pager, Pills, Skeleton } from "@/components/app/ui";
import { TokenArt } from "@/components/app/TokenArt";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { tokenFlows, type TokenFlow } from "@/lib/fomo/derive";
import { ago, pct, pnl, toneOf, usd, walletLabel } from "@/lib/fomo/format";

type Sort = "kols" | "net" | "change";
const PER_PAGE = 16;

export function AvatarStack({
  wallets,
  max = 4,
  size = 22,
  more: showMore = true,
}: {
  wallets: { handle: string | null; address: string }[];
  max?: number;
  size?: number;
  more?: boolean;
}) {
  const shown = wallets.slice(0, max);
  const more = wallets.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((w, i) => (
        <TraderAvatar
          key={w.address}
          handle={w.handle ?? w.address}
          className="ring-2 ring-card"
          style={{ width: size, height: size, marginLeft: i ? -size * 0.3 : 0 }}
        />
      ))}
      {showMore && more > 0 && <span className="ml-1.5 text-[12px] text-ink-dim tabular">+{more}</span>}
    </span>
  );
}

/** Big token card, in the style of a "top tokens" grid. */
export function TokenCard({ t, now }: { t: TokenFlow; now: number }) {
  return (
    <Link
      href={`/tape?q=${t.symbol}`}
      className="group rounded-card border border-line bg-card p-2.5 transition-colors hover:border-line-strong"
    >
      <div className="relative">
        <TokenArt symbol={t.symbol} rounded="rounded-[14px]" className="aspect-square w-full" />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm tabular">
          {ago(t.lastAt, now)}
        </span>
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 py-1 pl-1 pr-2.5 text-[12px] font-medium text-white backdrop-blur-sm">
          <AvatarStack wallets={t.who} max={2} size={20} more={false} />
          <span className="tabular">
            {t.kols} KOL{t.kols === 1 ? "" : "s"}
          </span>
        </span>
      </div>
      <div className="px-1.5 pb-1.5 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[15px] font-medium text-ink">{t.name}</span>
          <span className="shrink-0 text-[11px] uppercase tracking-wide text-ink-dim">{t.symbol}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[1.25rem] font-semibold tracking-[-0.02em] tabular">{usd(t.mcap)}</span>
          <span className="text-[11px] text-ink-dim">MC</span>
          <span className={cn("ml-auto text-[12.5px] font-medium tabular", toneOf(t.change24h))}>{pct(t.change24h)}</span>
        </div>
        <div className="mt-2 space-y-0.5 border-t border-line pt-2 text-[12px] text-ink-dim">
          <div className="flex justify-between gap-2">
            <span>net inflow</span>
            <span className={cn("font-medium tabular", toneOf(t.net))}>{pnl(t.net)}</span>
          </div>
          <div className="truncate">
            first in <span className="text-ink-muted">{walletLabel(t.firstIn)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TokensView() {
  const { now } = useFomoData();
  const flows = useDerived((e, win, n) => tokenFlows(e, win, n));
  const [sort, setSort] = useState<Sort>("kols");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!flows) return null;
    const list = [...flows];
    if (sort === "net") list.sort((a, b) => b.net - a.net);
    if (sort === "change") list.sort((a, b) => b.change24h - a.change24h);
    return list;
  }, [flows, sort]);

  const pages = sorted ? Math.ceil(sorted.length / PER_PAGE) : 0;
  const slice = sorted?.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <PageTitle title="Tokens Being Bought" sub="What the tracked wallets are piling into — and who got in first." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Pills<Sort>
          value={sort}
          onChange={(s) => {
            setSort(s);
            setPage(0);
          }}
          options={[
            { value: "kols", label: "Most KOLs" },
            { value: "net", label: "Net inflow" },
            { value: "change", label: "24h change" },
          ]}
        />
        <Pager page={page} pages={pages} onChange={setPage} />
      </div>
      {!slice ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-card" />
          ))}
        </div>
      ) : slice.length === 0 ? (
        <Card>
          <Empty>Nothing bought in this window.</Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {slice.map((t) => (
            <TokenCard key={t.symbol} t={t} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
