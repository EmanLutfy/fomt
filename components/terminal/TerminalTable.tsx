import Link from "next/link";
import type { Trade } from "@/types/trade";
import { data } from "@/lib/ui";
import { formatCompactUsd, formatPrice, formatTimeHms, truncateAddress } from "@/lib/utils";
import { SidePill } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/ui/CopyableValue";

const COLUMNS = ["Time", "Side", "Token", "Size", "Price", "Mcap", "Trader", "Tx"];

export function TerminalTable({ trades, latestId }: { trades: Trade[]; latestId?: string | null }) {
  return (
    <div className="w-full">
      {/* Desktop / tablet: dense data table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {COLUMNS.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim first:pl-4 last:pr-4"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr
                key={t.id}
                className={`border-b border-border hover:bg-surface ${
                  t.id === latestId ? "animate-row-in" : ""
                }`}
              >
                <td className={`whitespace-nowrap px-3 py-2.5 pl-4 ${data} text-ink-muted`}>
                  {formatTimeHms(t.timestamp)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <SidePill side={t.side} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link href={`/tokens/${t.token.toLowerCase()}`} className="font-medium text-ink hover:text-accent">
                    ${t.token}
                  </Link>
                </td>
                <td className={`whitespace-nowrap px-3 py-2.5 ${data} text-ink`}>{formatCompactUsd(t.sizeUsd)}</td>
                <td className={`whitespace-nowrap px-3 py-2.5 ${data} text-ink-muted`}>{formatPrice(t.price)}</td>
                <td className={`whitespace-nowrap px-3 py-2.5 ${data} text-ink-muted`}>
                  {formatCompactUsd(t.marketCap)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link href={`/traders/${t.traderHandle}`} className="font-medium text-ink hover:text-accent">
                    @{t.traderHandle}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 pr-4 text-ink-dim">
                  <CopyableValue value={t.txHash} display={truncateAddress(t.txHash, 4, 4)} label="transaction hash" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact cards, same fields, stacked instead of scrolled */}
      <ul className="flex flex-col divide-y divide-border sm:hidden">
        {trades.map((t) => (
          <li key={t.id} className={`flex flex-col gap-2 px-4 py-3 ${t.id === latestId ? "animate-row-in" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidePill side={t.side} />
                <Link href={`/tokens/${t.token.toLowerCase()}`} className="font-medium text-ink">
                  ${t.token}
                </Link>
              </div>
              <span className={`${data} text-xs text-ink-dim`}>{formatTimeHms(t.timestamp)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link href={`/traders/${t.traderHandle}`} className="text-ink-muted hover:text-accent">
                @{t.traderHandle}
              </Link>
              <span className={`${data} text-ink`}>{formatCompactUsd(t.sizeUsd)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-dim">
              <span className={data}>{formatPrice(t.price)}</span>
              <span className={data}>mcap {formatCompactUsd(t.marketCap)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
