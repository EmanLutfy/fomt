import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTrader, getTraderActivity, getTraderHoldings } from "@/lib/api";
import { container, sectionPad } from "@/lib/ui";
import { formatCompactUsd, truncateAddress } from "@/lib/utils";
import { DemoDataBadge, TrackedWalletBadge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { HoldingsTable } from "@/components/traders/HoldingsTable";
import { TerminalTable } from "@/components/terminal/TerminalTable";
import { EmptyState } from "@/components/ui/EmptyState";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function TraderProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const trader = await getTrader(handle);
  if (!trader) notFound();

  const [holdings, activity] = await Promise.all([
    getTraderHoldings(trader.handle),
    getTraderActivity(trader.handle),
  ]);

  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl text-ink sm:text-3xl">@{trader.handle}</h1>
              <TrackedWalletBadge />
            </div>
            <div className="mt-2">
              <CopyableValue
                value={trader.address}
                display={truncateAddress(trader.address, 6, 6)}
                label="wallet address"
                className="text-sm text-ink-muted"
              />
            </div>
          </div>
          <DemoDataBadge />
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 border border-border p-5 sm:w-fit sm:grid-cols-2 sm:gap-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Fills</p>
            <p className="mt-1 font-mono text-xl text-ink">{trader.fills}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Volume</p>
            <p className="mt-1 font-mono text-xl text-ink">{formatCompactUsd(trader.volumeUsd)}</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg text-ink">Holdings</h2>
          <div className="border border-border">
            <HoldingsTable holdings={holdings} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg text-ink">Recent activity</h2>
          <div className="border border-border">
            {activity.length === 0 ? (
              <EmptyState title="No recorded activity" description="This wallet has no tracked trades yet." />
            ) : (
              <TerminalTable trades={activity} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
