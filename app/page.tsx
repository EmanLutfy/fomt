import Link from "next/link";
import { TRADERS, TOKENS } from "@/lib/mock-data";
import { container, eyebrow } from "@/lib/ui";
import { Hero } from "@/components/Hero";
import { LiveTapePreview } from "@/components/home/LiveTapePreview";
import { TraderCard } from "@/components/traders/TraderCard";
import { TokenCard } from "@/components/tokens/TokenCard";
import { Reveal } from "@/components/Reveal";

export default function HomePage() {
  const topTraders = TRADERS.slice(0, 3);
  const topTokens = [...TOKENS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 3);

  return (
    <>
      <Hero />
      <LiveTapePreview />

      <Reveal>
        <section className="border-b border-border">
          <div className={`${container} py-16 sm:py-24`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className={eyebrow}>Wallets</span>
                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Tracked traders</h2>
              </div>
              <Link href="/traders" className="text-sm font-medium text-accent hover:underline">
                View all traders →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {topTraders.map((t) => (
                <TraderCard key={t.handle} trader={t} />
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <div className={`${container} py-16 sm:py-24`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className={eyebrow}>Tokens</span>
                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Most active by mcap</h2>
              </div>
              <Link href="/tokens" className="text-sm font-medium text-accent hover:underline">
                View all tokens →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {topTokens.map((t) => (
                <TokenCard key={t.symbol} token={t} />
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
