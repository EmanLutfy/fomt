"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDerived } from "@/components/app/FomoProvider";
import {
  Card,
  CheckBadge,
  Empty,
  PageTitle,
  Pager,
  Pnl,
  Skeleton,
  WalletChip,
  table,
  traderHref,
} from "@/components/app/ui";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { traderRows, type TraderRow } from "@/lib/fomo/derive";
import { count, pct, pnl, shortAddress, toneOf, usd, walletLabel } from "@/lib/fomo/format";

const PER_PAGE = 50;

function Podium({ rows }: { rows: TraderRow[] }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {rows.slice(0, 3).map((r, i) => (
        <Link
          key={r.wallet.address}
          href={traderHref(r.wallet)}
          className="group rounded-card border border-line bg-card p-5 transition-colors hover:border-line-strong"
        >
          <div className="flex items-center justify-between">
            <TraderAvatar handle={r.wallet.handle ?? r.wallet.address} className="h-12 w-12" />
            <span className="text-[13px] text-ink-dim tabular">#{i + 1}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={cn("truncate text-[17px] font-semibold", !r.wallet.handle && "font-mono text-[15px]")}>
              {walletLabel(r.wallet)}
            </span>
            <CheckBadge check={r.wallet.check} />
          </div>
          <div className="mt-3 text-[1.9rem] font-medium leading-none tracking-[-0.03em] tabular">
            <span className={toneOf(r.pnlSells)}>{pnl(r.pnlSells)}</span>
          </div>
          <div className="mt-1.5 text-[13px] text-ink-dim">p/l on sells this window</div>
          <div className="mt-4 flex gap-4 border-t border-line pt-3 text-[12.5px] text-ink-muted tabular">
            <span>{r.fills} fills</span>
            <span>{usd(r.volume)} vol</span>
            <span>{r.won === null ? "no closes" : `${pct(r.won, false)} won`}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TradersView() {
  const rows = useDerived((e, win, now) => traderRows(e, win, now));
  const [activeOnly, setActiveOnly] = useState(true);
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = term.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!activeOnly || r.fills > 0) &&
        (!t || r.wallet.handle?.toLowerCase().includes(t) || r.wallet.address.startsWith(t)),
    );
  }, [rows, activeOnly, term]);

  const pages = filtered ? Math.ceil(filtered.length / PER_PAGE) : 0;
  const slice = filtered?.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <PageTitle
        title="Traders"
        sub="Who is actually making money — P/L measured from this tape's own fills."
      />

      {!rows ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[210px] rounded-card" />
          ))}
        </div>
      ) : (
        <Podium rows={rows.filter((r) => r.fills > 0)} />
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-muted">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(0);
              }}
              className="h-4 w-4 accent-white"
            />
            Traded this window only
          </label>
          <div className="flex items-center gap-3">
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Filter handle / wallet"
              className="h-9 w-56 rounded-full border border-line-strong bg-transparent px-4 text-[13px] text-ink placeholder:text-ink-dim focus:border-white/30 focus:outline-none"
            />
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        </div>

        {!slice ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : slice.length === 0 ? (
          <Empty>No traders match.</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>#</th>
                  <th className={table.th}>Trader</th>
                  <th className={cn(table.th, table.thNum)}>Followers</th>
                  <th className={cn(table.th, table.thNum)}>Fills</th>
                  <th className={cn(table.th, table.thNum)}>Volume</th>
                  <th className={cn(table.th, table.thNum, "text-ink")}>P/L on sells</th>
                  <th className={cn(table.th, table.thNum)}>P/L open bags</th>
                  <th className={cn(table.th, table.thNum)}>Total P/L</th>
                  <th className={cn(table.th, table.thNum)}>Won</th>
                  <th className={cn(table.th, table.thNum)}>Closed</th>
                  <th className={cn(table.th, table.thNum)}>Best</th>
                  <th className={cn(table.th, table.thNum)}>Worst</th>
                  <th className={table.th}>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r, i) => (
                  <tr key={r.wallet.address} className={table.tr}>
                    <td className={cn(table.td, "text-ink-dim tabular")}>{page * PER_PAGE + i + 1}</td>
                    <td className={cn(table.td, "max-w-[260px]")}>
                      <WalletChip wallet={r.wallet} size={22} showCheck />
                    </td>
                    <td className={cn(table.td, table.tdNum, "text-ink-muted")}>
                      {r.wallet.followers ? count(r.wallet.followers) : ""}
                    </td>
                    <td className={cn(table.td, table.tdNum)}>{r.fills}</td>
                    <td className={cn(table.td, table.tdNum)}>{usd(r.volume)}</td>
                    <td className={cn(table.td, table.tdNum, "font-medium")}>
                      <Pnl value={r.pnlSells} />
                    </td>
                    <td className={cn(table.td, table.tdNum)}>
                      <Pnl value={r.pnlOpen} />
                    </td>
                    <td className={cn(table.td, table.tdNum)}>
                      <Pnl value={r.total} />
                    </td>
                    <td className={cn(table.td, table.tdNum, "text-ink-muted")}>
                      {r.won === null ? "—" : pct(r.won, false)}
                    </td>
                    <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{r.closed}</td>
                    <td className={cn(table.td, table.tdNum)}>
                      <Pnl value={r.best} />
                    </td>
                    <td className={cn(table.td, table.tdNum)}>
                      <Pnl value={r.worst} />
                    </td>
                    <td className={cn(table.td, "font-mono text-[12px] text-ink-dim")}>{shortAddress(r.wallet.address)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
