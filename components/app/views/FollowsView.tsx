"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useDerived, useFomoData } from "@/components/app/FomoProvider";
import { Card, Empty, PageTitle, Pager, Pills, Skeleton, TokenChip, WalletChip } from "@/components/app/ui";
import { followChains } from "@/lib/fomo/derive";
import { ago, duration, pct, toneOf, usd } from "@/lib/fomo/format";

const SPANS = { "30m": 30 * 60_000, "2h": 2 * 3_600_000, "6h": 6 * 3_600_000 } as const;
type Span = keyof typeof SPANS;
const PER_PAGE = 12;

export function PreviewNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-line bg-card px-4 py-3 text-[13px] text-ink-muted">
      <Info size={16} className="mt-px shrink-0 text-ink-dim" />
      <p>{children}</p>
    </div>
  );
}

export function FollowsView() {
  const { now } = useFomoData();
  const [span, setSpan] = useState<Span>("2h");
  const [page, setPage] = useState(0);
  const chains = useDerived((e, win, n) => followChains(e, win, n, SPANS[span]), [span]);

  const pages = chains ? Math.ceil(chains.length / PER_PAGE) : 0;
  const slice = chains?.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <PageTitle title="Who Followed Who" sub="A wallet buys first — then who piled into the same token after them, and how fast." />
      <PreviewNote>
        Preview layout. This tab wasn&apos;t opened in the backend recording, so it&apos;s built from its name: the first buyer of a
        token, then every tracked wallet that bought the same token within the follow window. Adjust once the backend
        format is confirmed.
      </PreviewNote>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-ink-dim">
          followed within
          <Pills<Span>
            value={span}
            onChange={(s) => {
              setSpan(s);
              setPage(0);
            }}
            options={[
              { value: "30m", label: "30m" },
              { value: "2h", label: "2h" },
              { value: "6h", label: "6h" },
            ]}
          />
        </div>
        <Pager page={page} pages={pages} onChange={setPage} />
      </div>

      {!slice ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-card" />
          ))}
        </div>
      ) : slice.length === 0 ? (
        <Card>
          <Empty>No follow chains in this window.</Empty>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {slice.map((c) => (
            <Card key={c.token + c.leaderAt} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] uppercase tracking-[0.08em] text-ink-dim">Led by</div>
                  <WalletChip wallet={c.leader} size={30} showCheck className="mt-1.5 text-[16px]" />
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-muted">
                    bought
                    <Link href={`/tape?q=${c.token}`} className="hover:underline">
                      <TokenChip symbol={c.token} size={20} />
                    </Link>
                    <span className="text-ink-dim">{ago(c.leaderAt, now)} ago</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={cn("text-[1.5rem] font-medium leading-none tracking-[-0.02em] tabular", toneOf(c.since))}>
                    {pct(c.since)}
                  </div>
                  <div className="mt-1 text-[12px] text-ink-dim">since their entry</div>
                </div>
              </div>

              <ol className="mt-4 space-y-1.5 border-t border-line pt-3">
                {c.followers.slice(0, 6).map((f) => (
                  <li key={f.wallet.address} className="flex items-center justify-between gap-3 text-[13px]">
                    <WalletChip wallet={f.wallet} size={20} bold={false} />
                    <span className="shrink-0 text-ink-dim tabular">
                      {usd(f.sizeUsd)} · <span className="text-ink-muted">+{duration(f.delayMs)}</span>
                    </span>
                  </li>
                ))}
                {c.followers.length > 6 && (
                  <li className="text-[12px] text-ink-dim">+{c.followers.length - 6} more followed</li>
                )}
              </ol>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
