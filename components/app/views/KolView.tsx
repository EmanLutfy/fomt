"use client";

import { useMemo, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useFomoData } from "@/components/app/FomoProvider";
import { Card, CheckBadge, Empty, PageTitle, Pager, Pills, Pnl, Skeleton, WalletChip, table } from "@/components/app/ui";
import { ROSTER_NAMED, ROSTER_SIZE } from "@/lib/fomo/engine";
import { count, usd } from "@/lib/fomo/format";

type Who = "all" | "named" | "anon";
const PER_PAGE = 50;

export function KolView() {
  const { engine } = useFomoData();
  const [who, setWho] = useState<Who>("all");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    if (!engine) return null;
    const t = term.trim().toLowerCase();
    return engine.wallets.filter(
      (w) =>
        (who === "all" || (who === "named" ? w.handle : !w.handle)) &&
        (!t ||
          w.handle?.toLowerCase().includes(t) ||
          w.name?.toLowerCase().includes(t) ||
          w.address.includes(t)),
    );
  }, [engine, who, term]);

  const pages = list ? Math.ceil(list.length / PER_PAGE) : 0;
  const slice = list?.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const exportJson = () => {
    if (!list) return;
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fomotrenches-kols-${who}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageTitle
        title="KOL List"
        sub={`${ROSTER_SIZE} wallets · ${ROSTER_NAMED} named (handle published by a source + fomo wallet verified on-chain) · ${
          ROSTER_SIZE - ROSTER_NAMED
        } anon (fomo wallets found on-chain, top by 24h volume).`}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <Pills<Who>
            value={who}
            onChange={(v) => {
              setWho(v);
              setPage(0);
            }}
            options={[
              { value: "all", label: `All ${ROSTER_SIZE}` },
              { value: "named", label: `Named ${ROSTER_NAMED}` },
              { value: "anon", label: `Anon ${ROSTER_SIZE - ROSTER_NAMED}` },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Search handle / wallet"
              className="h-9 w-56 rounded-full border border-line-strong bg-transparent px-4 text-[13px] text-ink placeholder:text-ink-dim focus:border-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={exportJson}
              className="flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              <DownloadSimple size={14} /> JSON
            </button>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        </div>

        {!slice ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : slice.length === 0 ? (
          <Empty>No wallets match.</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>#</th>
                  <th className={table.th}>Handle</th>
                  <th className={table.th}>Name</th>
                  <th className={table.th}>EVM wallet (Robinhood Chain)</th>
                  <th className={cn(table.th, table.thNum)}>Followers</th>
                  <th className={cn(table.th, table.thNum)}>fomo p/l</th>
                  <th className={cn(table.th, table.thNum)}>24h vol</th>
                  <th className={table.th}>Check</th>
                  <th className={table.th}>Sources</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((w, i) => (
                  <tr key={w.address} className={table.tr}>
                    <td className={cn(table.td, "text-ink-dim tabular")}>{page * PER_PAGE + i + 1}</td>
                    <td className={cn(table.td, "max-w-[220px]")}>
                      <span className="flex items-center gap-2">
                        <WalletChip wallet={w} size={22} />
                        {w.aka && (
                          <span className="rounded-full border border-line px-1.5 text-[10px] text-ink-dim">aka {w.aka}</span>
                        )}
                      </span>
                    </td>
                    <td className={cn(table.td, "max-w-[160px] truncate text-ink-muted")}>{w.name ?? ""}</td>
                    <td className={cn(table.td, "font-mono text-[12px] text-ink-muted")}>{w.address}</td>
                    <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{w.followers ? count(w.followers) : ""}</td>
                    <td className={cn(table.td, table.tdNum, "font-medium")}>
                      <Pnl value={w.fomoPnl} />
                    </td>
                    <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{w.vol24h ? usd(w.vol24h) : "—"}</td>
                    <td className={table.td}>
                      <CheckBadge check={w.check} />
                    </td>
                    <td className={cn(table.td, "text-[12px] text-ink-dim")}>{w.sources.join(" ")}</td>
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
