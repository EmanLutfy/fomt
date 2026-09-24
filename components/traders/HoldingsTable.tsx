import Link from "next/link";
import type { Holding } from "@/types/trader";
import { data } from "@/lib/ui";
import { formatAmount, formatCompactUsd, formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <EmptyState
        title="No open holdings"
        description="This wallet's tracked buys have been fully offset by sells, so there's nothing currently held."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim first:pl-4">
              Token
            </th>
            <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim">Amount</th>
            <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim">Price</th>
            <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-dim last:pr-4">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.token} className="border-b border-border/60">
              <td className="px-3 py-2.5 pl-4">
                <Link href={`/tokens/${h.token.toLowerCase()}`} className="font-medium text-ink hover:text-accent">
                  ${h.token}
                </Link>
              </td>
              <td className={`px-3 py-2.5 ${data} text-ink-muted`}>{formatAmount(h.amount)}</td>
              <td className={`px-3 py-2.5 ${data} text-ink-muted`}>{formatPrice(h.price)}</td>
              <td className={`px-3 py-2.5 pr-4 ${data} text-ink`}>{formatCompactUsd(h.valueUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
