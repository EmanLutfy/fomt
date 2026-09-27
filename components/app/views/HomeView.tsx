"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDerived, useFomoData, useSettings } from "@/components/app/FomoProvider";
import {
  CheckBadge,
  Pager,
  PreviewCard,
  SectionHeader,
  Skeleton,
  traderHref,
} from "@/components/app/ui";
import { Odometer, Sparkline } from "@/components/app/Odometer";
import { TokenArt } from "@/components/app/TokenArt";
import { BlurReveal } from "@/components/app/BlurReveal";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { ClosedCard } from "@/components/app/views/ClosedView";
import { AvatarStack, TokenCard } from "@/components/app/views/TokensView";
import { closedTrades, tapeFills, tokenFlows, traderRows, volumeSeries } from "@/lib/fomo/derive";
import { ROSTER_NAMED, ROSTER_SIZE } from "@/lib/fomo/engine";
import { ago, count, pnl, toneOf, usd, usdWhole, walletLabel } from "@/lib/fomo/format";

function Hero() {
  return (
    <section className="mx-auto max-w-[760px] pb-10 pt-6 text-center sm:pt-10">
      <h1 className="text-balance text-[2.6rem] font-medium leading-[1.05] tracking-[-0.045em] sm:text-[3.75rem]">
        <BlurReveal delay={0.15}>Every trade by the wallets that move first</BlurReveal>
      </h1>
      <p className="mx-auto mt-4 max-w-[560px] text-balance text-[16px] leading-relaxed text-ink-dim sm:text-[17px]">
        {/* A line break instead of punctuation between the two halves. */}
        Tracked trader and KOL wallets
        <br />
        what they buy, what they sell, and who&apos;s actually making money.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/tape" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-bg transition-transform active:scale-[0.97]">
          Open the live tape
        </Link>
        <Link
          href="/kols"
          className="rounded-full border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-card"
        >
          Browse {ROSTER_SIZE} wallets
        </Link>
      </div>
    </section>
  );
}

function TapePreview() {
  const { engine, now } = useFomoData();
  const fills = useDerived((e, win, n) => tapeFills(e, "all", n).slice(0, 5));
  return (
    <PreviewCard label="Live Tape" href="/tape" className="h-[300px]">
      <div className="space-y-2 p-3 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
        {!fills || !engine
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[58px] rounded-2xl" />)
          : fills.map((f) => {
              const w = engine.byAddress.get(f.wallet)!;
              return (
                <div key={f.id} className="flex animate-row-in items-center gap-3 rounded-2xl bg-card-raised px-3.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] tabular", f.side === "buy" ? "text-up" : "text-down")}>
                      {usd(f.sizeUsd)}
                    </div>
                    <div className="truncate text-[12.5px] text-ink-dim">
                      {f.side === "buy" ? "bought" : "sold"} <span className="font-medium text-ink">{f.token}</span> ·{" "}
                      {walletLabel(w)}
                    </div>
                  </div>
                  <TraderAvatar handle={w.handle ?? w.address} className="h-8 w-8" />
                  <TokenArt symbol={f.token} rounded="rounded-lg" className="h-8 w-8" />
                  <span className="w-8 text-right text-[11px] text-ink-dim tabular">{ago(f.t, now)}</span>
                </div>
              );
            })}
      </div>
    </PreviewCard>
  );
}

function TokensPreview() {
  const flows = useDerived((e, win, n) => tokenFlows(e, win, n).slice(0, 9));
  // Three columns drifting upward, like a slow feed of token art.
  const cols = flows ? [0, 1, 2].map((c) => flows.filter((_, i) => i % 3 === c)) : null;
  return (
    <PreviewCard label="Tokens Being Bought" href="/tokens" className="h-[300px]">
      <div className="grid h-[250px] grid-cols-3 gap-2.5 overflow-hidden px-3 pt-3 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]">
        {!cols
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-full rounded-2xl" />)
          : cols.map((col, c) => (
              <div key={c} className={cn("space-y-2.5", c === 1 && "mt-8")}>
                {col.map((t) => (
                  <div key={t.symbol} className="rounded-2xl bg-card-raised p-1.5">
                    <TokenArt symbol={t.symbol} rounded="rounded-xl" className="aspect-[4/3] w-full" />
                    <div className="px-1 pb-0.5 pt-1.5 text-[11.5px]">
                      <div className="truncate font-medium text-ink">{t.name}</div>
                      <div className="flex justify-between text-ink-dim tabular">
                        <span>{usd(t.mcap)}</span>
                        <span>{t.kols} KOLs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
      </div>
    </PreviewCard>
  );
}

function VolumePreview() {
  const { window: win } = useSettings();
  const series = useDerived((e, w, n) => volumeSeries(e, w, n));
  const total = series?.reduce((a, b) => a + b, 0) ?? null;
  return (
    <PreviewCard label="Volume" href="/tape" className="h-[230px]">
      <div className="flex items-start justify-between px-4 pt-4">
        <span className="text-[12px] text-ink-dim">Tracked volume</span>
        <span className="text-[12px] uppercase text-ink-dim">{win}</span>
      </div>
      <div className="px-4 pt-2 text-[2.1rem] font-medium tracking-[-0.03em]">
        {total === null ? <Skeleton className="h-9 w-40" /> : <Odometer value={usdWhole(total)} />}
      </div>
      {series && <Sparkline values={series} className="absolute inset-x-0 bottom-0 h-[92px] w-full" />}
    </PreviewCard>
  );
}

function TopTraderPreview() {
  const rows = useDerived((e, win, n) => traderRows(e, win, n).filter((r) => r.fills > 0).slice(0, 3));
  const top = rows?.[0];
  return (
    <PreviewCard label="Traders" href="/traders" className="h-[230px]">
      <div className="px-4 pt-4">
        <span className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Top trader right now</span>
        {!top ? (
          <Skeleton className="mt-3 h-12 rounded-full" />
        ) : (
          <>
            <div className="mt-3 flex items-center gap-2.5 rounded-full border border-line-strong py-1.5 pl-1.5 pr-4">
              <TraderAvatar handle={top.wallet.handle ?? top.wallet.address} className="h-8 w-8" />
              <span className="min-w-0 flex-1 truncate font-medium">{walletLabel(top.wallet)}</span>
              <CheckBadge check={top.wallet.check} />
            </div>
            <div className={cn("mt-4 text-[2.1rem] font-medium leading-none tracking-[-0.03em] tabular", toneOf(top.pnlSells))}>
              {pnl(top.pnlSells)}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-dim">p/l on sells · {top.fills} fills</div>
          </>
        )}
      </div>
    </PreviewCard>
  );
}

function KolPreview() {
  const { engine } = useFomoData();
  const faces = engine?.wallets.slice(0, 18) ?? [];
  return (
    <PreviewCard label="KOL List" href="/kols" className="h-[230px]">
      <div className="px-4 pt-4">
        <span className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">Tracking</span>
        <div className="mt-1 text-[2.1rem] font-medium leading-none tracking-[-0.03em] tabular">{ROSTER_SIZE} wallets</div>
        <div className="mt-1.5 text-[12px] text-ink-dim">
          {ROSTER_NAMED} named · {ROSTER_SIZE - ROSTER_NAMED} anon
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 [mask-image:linear-gradient(to_right,black_70%,transparent)]">
          {faces.map((w) => (
            <TraderAvatar key={w.address} handle={w.handle ?? w.address} className="h-7 w-7" />
          ))}
        </div>
      </div>
    </PreviewCard>
  );
}

function TopTokens() {
  const { now } = useFomoData();
  const flows = useDerived((e, win, n) => tokenFlows(e, win, n));
  const [page, setPage] = useState(0);
  const per = 6;
  const pages = flows ? Math.min(5, Math.ceil(flows.length / per)) : 0;
  return (
    <section className="min-w-0">
      <SectionHeader title="Tokens being bought" right={<Pager page={page} pages={pages} onChange={setPage} />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
        {!flows
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-card" />)
          : flows.slice(page * per, (page + 1) * per).map((t) => <TokenCard key={t.symbol} t={t} now={now} />)}
      </div>
    </section>
  );
}

function TopTraders() {
  const rows = useDerived((e, win, n) => traderRows(e, win, n).filter((r) => r.fills > 0 && r.wallet.handle));
  const [page, setPage] = useState(0);
  const per = 3;
  const pages = rows ? Math.min(5, Math.ceil(rows.length / per)) : 0;
  return (
    <section className="min-w-0">
      <SectionHeader title="Top traders" right={<Pager page={page} pages={pages} onChange={setPage} />} />
      <div className="space-y-3">
        {!rows
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[196px] rounded-card" />)
          : rows.slice(page * per, (page + 1) * per).map((r) => {
              let h = 0;
              for (const ch of r.wallet.address) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
              const hue = h % 360;
              return (
                <Link
                  key={r.wallet.address}
                  href={traderHref(r.wallet)}
                  className="block overflow-hidden rounded-card border border-line bg-card transition-colors hover:border-line-strong"
                >
                  <div
                    className="h-[72px]"
                    style={{
                      background: `radial-gradient(120% 160% at 10% 0%, hsl(${hue} 60% 42% / 0.9), transparent 60%), radial-gradient(90% 140% at 95% 40%, hsl(${(hue + 70) % 360} 55% 32% / 0.9), transparent 65%), #181818`,
                    }}
                  />
                  <div className="px-4 pb-4">
                    <TraderAvatar handle={r.wallet.handle ?? r.wallet.address} className="-mt-7 h-14 w-14 ring-4 ring-card" />
                    <div className="mt-2 flex items-center gap-2">
                      <span className="truncate text-[17px] font-semibold">{walletLabel(r.wallet)}</span>
                      <CheckBadge check={r.wallet.check} />
                    </div>
                    <div className="text-[13px] text-ink-dim">
                      {r.wallet.followers ? `${count(r.wallet.followers)} followers` : r.wallet.name}
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-4 text-[13px] text-ink-dim">
                      <span>
                        <span className="text-[15px] font-semibold text-ink tabular">{r.fills}</span> fills
                      </span>
                      <span>
                        <span className={cn("text-[15px] font-semibold tabular", toneOf(r.total))}>{pnl(r.total)}</span> total p/l
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}

function RecentClosed() {
  const { engine, now } = useFomoData();
  const closed = useDerived((e, win, n) => closedTrades(e, win, n));
  const [page, setPage] = useState(0);
  const per = 6;
  const pages = closed ? Math.min(5, Math.ceil(closed.length / per)) : 0;
  return (
    <section className="min-w-0">
      <SectionHeader title="Recent closed trades" right={<Pager page={page} pages={pages} onChange={setPage} />} />
      <div className="grid gap-3 sm:grid-cols-2">
        {!closed || !engine
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[132px] rounded-2xl" />)
          : closed.slice(page * per, (page + 1) * per).map((c) => <ClosedCard key={c.id} c={c} engine={engine} now={now} />)}
      </div>
    </section>
  );
}

function MostProfitable() {
  const rows = useDerived((e, win, n) => traderRows(e, win, n).filter((r) => r.fills > 0));
  const [page, setPage] = useState(0);
  const per = 6;
  const sorted = useMemo(() => rows && [...rows].sort((a, b) => b.total - a.total), [rows]);
  const pages = sorted ? Math.min(5, Math.ceil(sorted.length / per)) : 0;
  return (
    <section className="min-w-0">
      <SectionHeader title="Most profitable" right={<Pager page={page} pages={pages} onChange={setPage} />} />
      <div className="space-y-2">
        {!sorted
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[62px] rounded-2xl" />)
          : sorted.slice(page * per, (page + 1) * per).map((r, i) => (
              <Link
                key={r.wallet.address}
                href={traderHref(r.wallet)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3.5 py-3 transition-colors hover:border-line-strong"
              >
                <span className="w-5 text-[12px] text-ink-dim tabular">{page * per + i + 1}</span>
                <TraderAvatar handle={r.wallet.handle ?? r.wallet.address} className="h-9 w-9" />
                <span className={cn("min-w-0 flex-1 truncate", r.wallet.handle ? "font-medium" : "font-mono text-[13px] text-ink-muted")}>
                  {walletLabel(r.wallet)}
                </span>
                <span className={cn("text-[1.15rem] font-semibold tracking-[-0.02em] tabular", toneOf(r.total))}>{pnl(r.total)}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}

function RecentBuyersStrip() {
  const { engine, now } = useFomoData();
  const buys = useDerived((e, win, n) => tapeFills(e, "all", n).filter((f) => f.side === "buy").slice(0, 10));
  if (!buys || !engine || !buys.length) return <div className="mb-8 h-6" />;
  const last = buys[0];
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-ink-dim">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-up" /> buying now
      </span>
      <AvatarStack wallets={buys.map((f) => engine.byAddress.get(f.wallet)!)} max={8} size={24} more={false} />
      <span>
        latest: <span className="font-medium text-ink">{walletLabel(engine.byAddress.get(last.wallet)!)}</span> bought{" "}
        <span className="font-medium text-up">{usd(last.sizeUsd)}</span> of{" "}
        <span className="font-medium text-ink">{last.token}</span> · {ago(last.t, now)} ago
      </span>
    </div>
  );
}

export function HomeView() {
  return (
    <div>
      <Hero />
      <RecentBuyersStrip />

      <div className="grid gap-3 lg:grid-cols-2">
        <TapePreview />
        <TokensPreview />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <VolumePreview />
        <TopTraderPreview />
        <KolPreview />
      </div>

      <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <TopTokens />
        <TopTraders />
      </div>

      <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <RecentClosed />
        <MostProfitable />
      </div>
    </div>
  );
}
