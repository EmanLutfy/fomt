"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useFomoData } from "@/components/app/FomoProvider";
import {
  Card,
  CheckBadge,
  Empty,
  Pnl,
  PreTapeTag,
  SectionHeader,
  SideTag,
  Skeleton,
  TokenChip,
  table,
} from "@/components/app/ui";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import { walletView } from "@/lib/fomo/derive";
import { amount, clock, count, duration, pct, price, toneOf, usd, walletLabel } from "@/lib/fomo/format";

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

function CopyAddress({ address }: { address: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(address).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[12px] text-ink-muted transition-colors hover:text-ink"
      title="Copy wallet address"
    >
      <span className="truncate">{address}</span>
      {done ? <Check size={12} className="shrink-0 text-up" /> : <Copy size={12} className="shrink-0" />}
    </button>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-[12px] text-ink-dim">{label}</div>
      <div className="mt-1.5 text-[1.35rem] font-medium tracking-[-0.02em] tabular">{children}</div>
    </Card>
  );
}

export function TraderView({ id }: { id: string }) {
  const { engine, version, now } = useFomoData();

  const view = useMemo(() => {
    if (!engine) return undefined;
    const key = decodeURIComponent(id);
    const w = engine.byHandle.get(key.toLowerCase()) ?? engine.byAddress.get(key.toLowerCase());
    return w ? walletView(engine, w.address, now) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, version, id]);

  if (view === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-card" />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-card" />
          ))}
        </div>
      </div>
    );
  }
  if (view === null) {
    return (
      <Card className="p-10 text-center">
        <p className="text-lg font-medium">No tracked wallet called “{decodeURIComponent(id)}”.</p>
        <Link href="/traders" className="mt-3 inline-block text-sm text-ink-muted underline">
          Back to traders
        </Link>
      </Card>
    );
  }

  const w = view.wallet;
  const hue = hashHue(w.address);
  const fills = view.fills;

  return (
    <div>
      <Link href="/traders" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-ink">
        <ArrowLeft size={14} /> Traders
      </Link>

      <Card className="overflow-hidden">
        <div
          className="h-28 sm:h-36"
          style={{
            background: `radial-gradient(120% 140% at 15% 0%, hsl(${hue} 60% 40% / 0.9), transparent 60%), radial-gradient(90% 120% at 90% 30%, hsl(${(hue + 60) % 360} 55% 30% / 0.9), transparent 65%), #161616`,
          }}
        />
        <div className="px-5 pb-5 sm:px-6">
          <TraderAvatar
            handle={w.handle ?? w.address}
            className="-mt-10 h-20 w-20 ring-4 ring-card sm:-mt-12 sm:h-24 sm:w-24"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <h1 className={cn("text-[1.7rem] font-semibold tracking-[-0.03em]", !w.handle && "font-mono text-[1.3rem]")}>
              {walletLabel(w)}
            </h1>
            <CheckBadge check={w.check} />
          </div>
          {w.name && <div className="text-ink-dim">{w.name}{w.aka ? ` · aka ${w.aka}` : ""}</div>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-muted">
            <CopyAddress address={w.address} />
            {w.followers !== null && (
              <span>
                <span className="font-medium text-ink tabular">{count(w.followers)}</span> followers
              </span>
            )}
            {w.sources.length > 0 && <span>sources: {w.sources.join(", ")}</span>}
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="fomo p/l (all chains)">
          <Pnl value={w.fomoPnl} />
        </Stat>
        <Stat label="Tape p/l on sells">
          <Pnl value={view.pnlSells} />
        </Stat>
        <Stat label="Open bags">
          <Pnl value={view.bags.length ? view.pnlOpen : null} />
        </Stat>
        <Stat label="Fills">{view.fills.length}</Stat>
        <Stat label="Volume">{usd(view.volume)}</Stat>
        <Stat label="Won">
          {view.won} <span className="text-base text-ink-dim">of {view.closed.length}</span>
        </Stat>
      </div>

      <section className="mt-10">
        <SectionHeader title={`Open bags (${view.bags.length})`} />
        <Card className="overflow-hidden">
          {view.bags.length === 0 ? (
            <Empty>No open bags.</Empty>
          ) : (
            <div className={table.wrap}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Token</th>
                    <th className={cn(table.th, table.thNum)}>Tokens</th>
                    <th className={cn(table.th, table.thNum)}>Cost</th>
                    <th className={cn(table.th, table.thNum)}>Value</th>
                    <th className={cn(table.th, table.thNum)}>P/L</th>
                    <th className={cn(table.th, table.thNum)}>Mcap</th>
                    <th className={cn(table.th, table.thNum)}>Held</th>
                  </tr>
                </thead>
                <tbody>
                  {view.bags.map((b) => (
                    <tr key={b.token} className={table.tr}>
                      <td className={table.td}>
                        <Link href={`/tape?q=${b.token}`}>
                          <TokenChip symbol={b.token} size={22} />
                        </Link>
                      </td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{amount(b.amount)}</td>
                      <td className={cn(table.td, table.tdNum)}>{usd(b.cost)}</td>
                      <td className={cn(table.td, table.tdNum)}>{usd(b.value)}</td>
                      <td className={cn(table.td, table.tdNum, "font-medium")}>
                        <Pnl value={b.pnl} />
                      </td>
                      <td className={cn(table.td, table.tdNum)}>{usd(b.mcap)}</td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{duration(b.heldMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader title={`Closed (${view.closed.length})`} sub="Positions taken from flat back to flat, seen by this tape." />
        <Card className="overflow-hidden">
          {view.closed.length === 0 ? (
            <Empty>None yet.</Empty>
          ) : (
            <div className={cn(table.wrap, "max-h-[420px] overflow-y-auto")}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Closed</th>
                    <th className={table.th}>Token</th>
                    <th className={cn(table.th, table.thNum)}>Paid in</th>
                    <th className={cn(table.th, table.thNum)}>Got out</th>
                    <th className={cn(table.th, table.thNum)}>Made</th>
                    <th className={cn(table.th, table.thNum)}>Return</th>
                    <th className={cn(table.th, table.thNum)}>Held</th>
                    <th className={cn(table.th, table.thNum)}>Fills</th>
                  </tr>
                </thead>
                <tbody>
                  {view.closed.map((c) => (
                    <tr key={c.id} className={table.tr}>
                      <td className={cn(table.td, "tabular text-ink-dim")}>{clock(c.closedAt)}</td>
                      <td className={table.td}>
                        <TokenChip symbol={c.token} size={20} />
                      </td>
                      <td className={cn(table.td, table.tdNum)}>{usd(c.paidIn)}</td>
                      <td className={cn(table.td, table.tdNum)}>{usd(c.gotOut)}</td>
                      <td className={cn(table.td, table.tdNum, "font-medium")}>
                        <Pnl value={c.made} />
                      </td>
                      <td className={cn(table.td, table.tdNum, toneOf(c.ret))}>{pct(c.ret)}</td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{duration(c.closedAt - c.openedAt)}</td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{c.fills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader title={`Fills (${fills.length})`} />
        <Card className="overflow-hidden">
          {fills.length === 0 ? (
            <Empty>No fills.</Empty>
          ) : (
            <div className={cn(table.wrap, "max-h-[520px] overflow-y-auto")}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Time</th>
                    <th className={table.th}>Side</th>
                    <th className={table.th}>Token</th>
                    <th className={cn(table.th, table.thNum)}>Size</th>
                    <th className={cn(table.th, table.thNum)}>Price</th>
                    <th className={cn(table.th, table.thNum)}>Mcap</th>
                    <th className={cn(table.th, table.thNum)}>Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {fills.slice(0, 300).map((f) => (
                    <tr key={f.id} className={table.tr}>
                      <td className={cn(table.td, "tabular text-ink-dim")}>{clock(f.t)}</td>
                      <td className={table.td}>
                        <SideTag side={f.side} />
                      </td>
                      <td className={table.td}>
                        <span className="flex items-center gap-2">
                          <TokenChip symbol={f.token} size={20} />
                          {f.preTape && <PreTapeTag />}
                        </span>
                      </td>
                      <td className={cn(table.td, table.tdNum, "font-medium", f.side === "buy" ? "text-up" : "text-down")}>
                        {usd(f.sizeUsd)}
                      </td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{price(f.price)}</td>
                      <td className={cn(table.td, table.tdNum)}>{usd(f.mcap)}</td>
                      <td className={cn(table.td, table.tdNum, "text-ink-muted")}>{amount(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
