"use client";

import { useMemo, useState } from "react";
import type { TradeFilters } from "@/types/trade";
import { useLiveTrades } from "@/hooks/use-live-trades";
import { filterTrades } from "@/lib/api";
import { container, sectionPad } from "@/lib/ui";
import { DemoDataBadge, LiveIndicator } from "@/components/ui/Badge";
import { TerminalFilters } from "@/components/terminal/TerminalFilters";
import { TerminalTable } from "@/components/terminal/TerminalTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TerminalPage() {
  const { trades, latestId } = useLiveTrades();
  const [filters, setFilters] = useState<TradeFilters>({ side: "ALL" });

  const filtered = useMemo(() => filterTrades(trades, filters), [trades, filters]);

  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-sans font-extrabold tracking-tight text-2xl text-ink sm:text-3xl">Live terminal</h1>
            <p className="mt-1 text-sm text-ink-muted">Buy and sell activity from tracked wallets on Robinhood Chain.</p>
          </div>
          <div className="flex items-center gap-2">
            <LiveIndicator />
            <DemoDataBadge />
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TerminalFilters filters={filters} onChange={setFilters} />
          <SearchInput
            value={filters.query ?? ""}
            onChange={(v) => setFilters({ ...filters, query: v || undefined })}
            placeholder="Filter by trader, wallet, or token"
            className="sm:w-72"
          />
        </div>

        <div className="border border-border">
          {filtered.length === 0 ? (
            <EmptyState
              title="No trades match these filters"
              description="Try widening your size range, clearing the time window, or searching a different trader or token."
              action={
                <button
                  type="button"
                  onClick={() => setFilters({ side: "ALL" })}
                  className="mt-1 text-sm font-medium text-accent hover:underline"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <TerminalTable trades={filtered} latestId={latestId} />
          )}
        </div>
      </div>
    </div>
  );
}
