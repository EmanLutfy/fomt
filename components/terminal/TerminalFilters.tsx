"use client";

import type { TradeFilters } from "@/types/trade";

const SIDE_OPTIONS: { value: TradeFilters["side"]; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "BUY", label: "Buys" },
  { value: "SELL", label: "Sells" },
];

const TIME_OPTIONS: { value: number | undefined; label: string }[] = [
  { value: undefined, label: "All time" },
  { value: 5, label: "Last 5 min" },
  { value: 15, label: "Last 15 min" },
  { value: 60, label: "Last hour" },
];

const SIZE_PRESETS = [
  { value: undefined, label: "Any size" },
  { value: 1000, label: "$1K+" },
  { value: 5000, label: "$5K+" },
  { value: 10000, label: "$10K+" },
];

export function TerminalFilters({
  filters,
  onChange,
}: {
  filters: TradeFilters;
  onChange: (filters: TradeFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-full border border-border">
        {SIDE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange({ ...filters, side: opt.value })}
            aria-pressed={filters.side === opt.value}
            className={`px-3.5 py-2 text-xs font-medium uppercase tracking-[0.06em] transition ${
              filters.side === opt.value
                ? "bg-accent text-bg-deep"
                : "text-ink-muted hover:bg-surface hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select
        aria-label="Minimum trade size"
        value={filters.minSizeUsd ?? ""}
        onChange={(e) => onChange({ ...filters, minSizeUsd: e.target.value ? Number(e.target.value) : undefined })}
        className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-ink-muted outline-none transition hover:border-border-strong focus-visible:border-accent"
      >
        {SIZE_PRESETS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Time range"
        value={filters.sinceMinutes ?? ""}
        onChange={(e) => onChange({ ...filters, sinceMinutes: e.target.value ? Number(e.target.value) : undefined })}
        className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-ink-muted outline-none transition hover:border-border-strong focus-visible:border-accent"
      >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      {(filters.side !== "ALL" || filters.minSizeUsd || filters.sinceMinutes || filters.query) && (
        <button
          type="button"
          onClick={() => onChange({ side: "ALL" })}
          className="px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-ink-dim underline-offset-4 hover:text-accent hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
