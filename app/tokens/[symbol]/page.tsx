import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToken, getTokenActivity, getTokenStats } from "@/lib/api";
import { container, sectionPad } from "@/lib/ui";
import { DemoDataBadge } from "@/components/ui/Badge";
import { TokenStatsHeader } from "@/components/tokens/TokenStatsHeader";
import { TerminalTable } from "@/components/terminal/TerminalTable";
import { EmptyState } from "@/components/ui/EmptyState";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: `$${symbol.toUpperCase()}` };
}

export default async function TokenActivityPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const token = await getToken(symbol);
  if (!token) notFound();

  const [stats, activity] = await Promise.all([
    getTokenStats(token.symbol),
    getTokenActivity(token.symbol),
  ]);

  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <div className="mb-8 flex items-start justify-between gap-4">
          <TokenStatsHeader token={token} stats={stats} />
          <DemoDataBadge />
        </div>

        <section>
          <h2 className="mb-4 font-display text-lg text-ink">Tracked-wallet activity</h2>
          <div className="border border-border">
            {activity.length === 0 ? (
              <EmptyState title="No recorded activity" description="No tracked wallet has traded this token yet." />
            ) : (
              <TerminalTable trades={activity} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
