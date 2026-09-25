"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  transform,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { HOLDINGS, TOKENS, TRADERS, TRADE_LOG } from "@/lib/mock-data";
import { card, container, data, eyebrow, panel } from "@/lib/ui";
import {
  cn,
  formatCompactUsd,
  formatTimeHms,
  formatUsd,
  truncateAddress,
} from "@/lib/utils";
import {
  DemoDataBadge,
  LiveIndicator,
  SidePill,
  TrackedWalletBadge,
} from "@/components/ui/Badge";
import { ScrubText } from "@/components/scroll/ScrubText";
import { SiteBeam, beamReplacesBorder } from "@/components/ui/site-beam";
import { TraderAvatar } from "@/components/traders/TraderAvatar";
import {
  still,
  useReducedMotionSafe,
} from "@/components/scroll/useReducedMotionSafe";
import type { Trade } from "@/types/trade";

// ---------------------------------------------------------------------------
// Story data — all derived from the same deterministic mock layer the rest of
// the site renders, so it matches /traders and /tokens and is SSR-safe.
// ---------------------------------------------------------------------------

const FOCUS_TRADER =
  TRADERS.find((t) => HOLDINGS[t.handle].length >= 3) ?? TRADERS[0];
const FOCUS_HOLDINGS = HOLDINGS[FOCUS_TRADER.handle].slice(0, 3);
const FOCUS_TOKEN = FOCUS_HOLDINGS[0]?.token ?? TOKENS[0].symbol;
const FOCUS_TOKEN_INFO = TOKENS.find((t) => t.symbol === FOCUS_TOKEN)!;

const tokenFills = TRADE_LOG.filter((t) => t.token === FOCUS_TOKEN);
const focusFills = tokenFills.filter(
  (t) => t.traderHandle === FOCUS_TRADER.handle,
);
const otherTokenFills = tokenFills.filter(
  (t) => t.traderHandle !== FOCUS_TRADER.handle,
);
const unrelated = TRADE_LOG.filter((t) => t.token !== FOCUS_TOKEN);

// Focused-token rows are the top three so the token card, which docks over the
// panel's bottom edge in Discover, only ever covers rows that are dimmed —
// including on short phones where the card reaches higher up the panel.
const TAPE: Trade[] = [
  focusFills[0],
  otherTokenFills[0],
  focusFills[1] ?? otherTokenFills[1],
  unrelated[0],
  unrelated[1],
  unrelated[2],
].filter(Boolean);

const tokenBuys = tokenFills.filter((t) => t.side === "BUY");
const TOKEN_STATS = {
  wallets: new Set(tokenFills.map((t) => t.traderHandle)).size,
  buys: tokenBuys.length,
  boughtUsd: tokenBuys.reduce((s, t) => s + t.sizeUsd, 0),
};

const ownFills = TRADE_LOG.filter(
  (t) => t.traderHandle === FOCUS_TRADER.handle,
);
const bookValue = HOLDINGS[FOCUS_TRADER.handle].reduce(
  (s, h) => s + h.valueUsd,
  0,
);
const netCost = ownFills.reduce(
  (s, t) => s + (t.side === "BUY" ? t.sizeUsd : -t.sizeUsd),
  0,
);
const PROFILE = {
  bookValue,
  pnl: bookValue - netCost,
  fills: ownFills.length,
  recent: ownFills.slice(0, 2),
};

const RAIL = TRADERS.slice(0, 6);

// Each chapter owns a quarter of the pinned scroll distance.
const CHAPTERS = [
  {
    n: "01",
    label: "Track",
    title: "Track the wallets that move first.",
    body: "A curated set of trader and KOL wallets on Robinhood Chain. Nothing to connect, nothing to sign.",
    range: [0, 0.25],
  },
  {
    n: "02",
    label: "Watch",
    title: "Watch every fill as it lands.",
    body: "Buys and sells stream in the moment they settle on-chain, sized, priced and timestamped.",
    range: [0.25, 0.5],
  },
  {
    n: "03",
    label: "Discover",
    title: "See where the size is going.",
    body: "Narrow the tape to one token and see which tracked wallets are buying it, and how much.",
    range: [0.5, 0.75],
  },
  {
    n: "04",
    label: "Follow",
    title: "Follow one wallet all the way down.",
    body: "Open any trader to inspect their holdings, their latest fills and how their book is doing.",
    range: [0.75, 1],
  },
] as const;

type P = MotionValue<number>;

export function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();

  // One scroll source for the whole sequence. 0 = section top hits the top of
  // the viewport (pin starts), 1 = section bottom hits the bottom (pin ends).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // A light spring gives the scrubbing a little weight without drifting from
  // the scroll position — it settles exactly where the user stopped.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 34,
    mass: 0.3,
    restDelta: 0.0005,
  });
  const p = reduce ? scrollYProgress : smooth;

  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    setActive(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3);
  });

  // Ambient glow: follows a fine pointer with inertia; on touch (or reduced
  // motion) it drifts with scroll progress instead, so there's no per-frame
  // pointer work on phones.
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  const pointerX = useMotionValue(900);
  const pointerY = useMotionValue(380);
  const glowPointerX = useSpring(pointerX, {
    stiffness: 35,
    damping: 18,
    mass: 1,
  });
  const glowPointerY = useSpring(pointerY, {
    stiffness: 35,
    damping: 18,
    mass: 1,
  });
  const glowScrollX = useTransform(
    p,
    [0, 1],
    reduce ? ["40vw", "40vw"] : ["58vw", "18vw"],
  );
  const glowScrollY = useTransform(
    p,
    [0, 1],
    reduce ? ["40svh", "40svh"] : ["22svh", "62svh"],
  );

  function onPointerMove(e: React.PointerEvent) {
    if (!finePointer || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    pointerX.set(e.clientX - r.left);
    pointerY.set(e.clientY - r.top);
  }

  return (
    <section
      ref={sectionRef}
      aria-label="How FOMT works"
      className="relative h-[420svh] border-b border-border"
    >
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        className="sticky top-0 h-svh overflow-hidden"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 -ml-[320px] -mt-[320px] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--color-accent)/0.09),transparent)] will-change-transform"
          style={{
            x: finePointer ? glowPointerX : glowScrollX,
            y: finePointer ? glowPointerY : glowScrollY,
          }}
        />
        <div
          className={`${container} relative flex h-full flex-col justify-center gap-6 pb-8 pt-24 sm:gap-8 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16 lg:pt-28`}
        >
          <div className="flex flex-col gap-5 lg:gap-10">
            <div className="relative h-[188px] sm:h-[196px] lg:h-[220px]">
              {CHAPTERS.map((c, i) => (
                <ChapterText key={c.n} p={p} index={i} reduce={reduce} />
              ))}
            </div>
            <ProgressRail p={p} active={active} />
          </div>

          <Stage p={p} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Left column
// ---------------------------------------------------------------------------

function ChapterText({
  p,
  index,
  reduce,
}: {
  p: P;
  index: number;
  reduce: boolean;
}) {
  const c = CHAPTERS[index];
  const [a, b] = c.range;
  const first = index === 0;
  const last = index === CHAPTERS.length - 1;

  // Outgoing and incoming chapters overlap slightly, moving in the same
  // direction, so it reads as one continuous line of text being pushed up.
  const input = first
    ? [0, b - 0.04, b + 0.01]
    : last
      ? [a - 0.04, a + 0.02, 1]
      : [a - 0.04, a + 0.02, b - 0.04, b + 0.01];
  const opacityOut = first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0];
  const yOut = first ? [0, 0, -40] : last ? [40, 0, 0] : [40, 0, 0, -40];
  const blurOut = first ? [0, 0, 10] : last ? [10, 0, 0] : [10, 0, 0, 10];

  const opacity = useTransform(p, input, opacityOut);
  const y = useTransform(p, input, reduce ? yOut.map(() => 0) : yOut);
  const blur = useTransform(p, input, reduce ? blurOut.map(() => 0) : blurOut);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="absolute inset-x-0 top-0 will-change-transform"
    >
      <span className={eyebrow}>
        {c.n} · {c.label}
      </span>
      {/* Same face as the hero headline (Montserrat ExtraBold), a step
          smaller since it's a section title and runs much wider than the serif. */}
      <h2 className="mt-3 max-w-[20ch] text-balance font-sans text-[1.625rem]/[1.15] font-extrabold tracking-tight text-ink sm:text-4xl/[1.15] lg:text-[2.75rem]/[1.15]">
        {c.title}
      </h2>
      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-ink-muted sm:mt-5 sm:text-base">
        {/* Body copy fills in word by word across the first part of its
            chapter, after the title has landed. */}
        <ScrubText
          text={c.body}
          progress={p}
          range={[a + 0.01, a + 0.13]}
          dim={0.22}
        />
      </p>
    </motion.div>
  );
}

function ProgressRail({ p, active }: { p: P; active: number }) {
  return (
    <ol className="relative grid grid-cols-4 gap-3" aria-label="Story progress">
      {CHAPTERS.map((c, i) => (
        <RailSegment key={c.n} p={p} index={i} isActive={active === i} />
      ))}
    </ol>
  );
}

function RailSegment({
  p,
  index,
  isActive,
}: {
  p: P;
  index: number;
  isActive: boolean;
}) {
  const [a, b] = CHAPTERS[index].range;
  const fill = useTransform(p, [a, b], [0, 1]);
  return (
    <li
      className="flex flex-col gap-2"
      aria-current={isActive ? "step" : undefined}
    >
      <span
        className={`text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
          isActive ? "text-ink" : "text-ink-dim"
        }`}
      >
        {CHAPTERS[index].label}
      </span>
      <span className="relative h-px w-full overflow-hidden bg-border-strong">
        <motion.span
          style={{ scaleX: fill }}
          className="absolute inset-0 origin-left bg-ink"
        />
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Right column: one stage whose layers hand off to each other
// ---------------------------------------------------------------------------

function Stage({ p, reduce }: { p: P; reduce: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-[min(330px,46svh)] w-full sm:h-[420px] lg:h-[500px]"
    >
      <WalletRail p={p} reduce={reduce} />
      <Terminal p={p} reduce={reduce} />
      <TokenFocus p={p} reduce={reduce} />
      <TraderProfile p={p} reduce={reduce} />
    </div>
  );
}

// 01 — a row of tracked wallets that pans left as the page scrolls down.
function WalletRail({ p, reduce }: { p: P; reduce: boolean }) {
  const opacity = useTransform(p, [0, 0.19, 0.27], [1, 1, 0]);
  const scale = useTransform(p, [0.17, 0.27], still(reduce, [1, 0.94], 1));
  const x = useTransform(p, [0, 0.25], reduce ? ["0%", "0%"] : ["6%", "-44%"]);

  return (
    // Clipped to the stage with feathered edges so cards slide out of view
    // instead of across the headline column.
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex items-center overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_7%,black_90%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_7%,black_90%,transparent)]"
    >
      <motion.div style={{ x }} className="flex gap-3 will-change-transform">
        {RAIL.map((t, i) => (
          <SiteBeam key={t.handle} className="w-[168px] shrink-0 sm:w-[200px]">
            <div className={cn(card, "p-4 sm:p-5", beamReplacesBorder)}>
              <div className="flex items-center gap-2.5">
                <TraderAvatar handle={t.handle} className="h-8 w-8" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    @{t.handle}
                  </p>
                  <p className={`${data} truncate text-[11px] text-ink-dim`}>
                    {truncateAddress(t.address)}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">
                    Volume
                  </p>
                  <p className={`${data} mt-1 text-sm text-ink`}>
                    {formatCompactUsd(t.volumeUsd)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">
                    Fills
                  </p>
                  <p className={`${data} mt-1 text-sm text-ink`}>{t.fills}</p>
                </div>
              </div>
              {i === 0 && <TrackedWalletBadge className="mt-4" />}
            </div>
          </SiteBeam>
        ))}
      </motion.div>
    </motion.div>
  );
}

// 02 + 03 — the tape. Rows arrive with the scroll; in Discover, everything
// except the focused token steps back.
function Terminal({ p, reduce }: { p: P; reduce: boolean }) {
  const opacity = useTransform(
    p,
    [0.2, 0.29, 0.74, 0.8],
    [0, 1, 1, reduce ? 0 : 0.1],
  );
  const y = useTransform(p, [0.2, 0.31], still(reduce, [56, 0]));
  const scale = useTransform(
    p,
    [0.2, 0.31, 0.74, 0.86],
    still(reduce, [0.94, 1, 1, 0.92], 1),
  );
  // Recedes out of focus as the profile comes forward, so the two layers
  // never read as one muddy overlap mid-handoff.
  const blur = useTransform(p, [0.74, 0.84], still(reduce, [0, 6]));
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <div className="absolute inset-0 flex items-start sm:items-center">
      <motion.div
        style={{ opacity, y, scale, filter }}
        className="w-full origin-center will-change-transform"
      >
        <SiteBeam>
          <div className={cn(panel, "overflow-hidden", beamReplacesBorder)}>
            <div className="flex h-10 items-center justify-between gap-3 border-b border-border px-4 sm:h-12">
              <div className="flex items-center gap-2.5">
                <LiveIndicator />
                <span className="hidden text-xs font-medium text-ink-muted sm:inline">
                  Tracked tape
                </span>
              </div>
              <DemoDataBadge />
            </div>
            {TAPE.map((t, i) => (
              <TapeRow key={t.id} p={p} trade={t} index={i} reduce={reduce} />
            ))}
          </div>
        </SiteBeam>
      </motion.div>
    </div>
  );
}

function TapeRow({
  p,
  trade,
  index,
  reduce,
}: {
  p: P;
  trade: Trade;
  index: number;
  reduce: boolean;
}) {
  const start = 0.27 + index * 0.024;
  const end = start + 0.045;
  const isFocus = trade.token === FOCUS_TOKEN;

  const opacity = useTransform(p, (v) => {
    const reveal = transform(v, [start, end], [0, 1]);
    const dim = isFocus ? 1 : transform(v, [0.5, 0.57], [1, 0.26]);
    return reveal * dim;
  });
  const y = useTransform(p, [start, end], still(reduce, [10, 0]));
  const highlight = useTransform(p, [0.5, 0.57], [0, isFocus ? 1 : 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={`relative grid h-9 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 text-xs last:border-b-0 sm:h-11 sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:text-[13px] ${
        index === 5 ? "hidden sm:grid" : ""
      }`}
    >
      <motion.span
        style={{ opacity: highlight }}
        className="absolute inset-0 bg-accent/[0.07]"
      />
      <span className="relative">
        <SidePill side={trade.side} />
      </span>
      <span className={`${data} relative truncate font-medium text-ink`}>
        ${trade.token}
      </span>
      <span className="relative hidden truncate text-ink-muted sm:block">
        @{trade.traderHandle}
      </span>
      <span className={`${data} relative text-right text-ink`}>
        {formatUsd(trade.sizeUsd)}
      </span>
    </motion.div>
  );
}

// 03 — the focused token's summary slides in from the right.
function TokenFocus({ p, reduce }: { p: P; reduce: boolean }) {
  const opacity = useTransform(p, [0.52, 0.6, 0.74, 0.8], [0, 1, 1, 0]);
  const x = useTransform(p, [0.52, 0.63], still(reduce, [72, 0]));

  return (
    <motion.div
      style={{ opacity, x }}
      className="absolute bottom-0 right-0 w-[min(100%,340px)] will-change-transform lg:-right-4 lg:bottom-4"
    >
      <SiteBeam className="shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
        <div className={cn(panel, "p-4 sm:p-5", beamReplacesBorder)}>
          <div className="flex items-baseline justify-between gap-3">
            <span className={`${data} text-lg font-semibold text-ink`}>
              ${FOCUS_TOKEN}
            </span>
            <span className="truncate text-xs text-ink-dim">
              {FOCUS_TOKEN_INFO.name}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat
              label="Mcap"
              value={formatCompactUsd(FOCUS_TOKEN_INFO.marketCap)}
            />
            <Stat label="Wallets" value={String(TOKEN_STATS.wallets)} />
            <Stat
              label="Bought"
              value={formatCompactUsd(TOKEN_STATS.boughtUsd)}
            />
          </div>
        </div>
      </SiteBeam>
    </motion.div>
  );
}

// 04 — the tape recedes and one wallet's profile comes forward, as if the
// view pushed into the row it came from.
function TraderProfile({ p, reduce }: { p: P; reduce: boolean }) {
  const opacity = useTransform(p, [0.76, 0.81], [0, 1]);
  const scale = useTransform(p, [0.76, 0.9], still(reduce, [0.86, 1], 1));
  const y = useTransform(p, [0.76, 0.9], still(reduce, [28, 0]));
  const up = PROFILE.pnl >= 0;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center sm:items-center">
      <motion.div
        style={{ opacity, scale, y }}
        className="w-full max-w-[460px] origin-[50%_20%] will-change-transform"
      >
        <SiteBeam className="shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <div className={cn(panel, "p-4 sm:p-6", beamReplacesBorder)}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <TraderAvatar handle={FOCUS_TRADER.handle} className="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">
                    @{FOCUS_TRADER.handle}
                  </p>
                  <p className={`${data} truncate text-xs text-ink-dim`}>
                    {truncateAddress(FOCUS_TRADER.address, 6, 4)}
                  </p>
                </div>
              </div>
              <TrackedWalletBadge className="hidden sm:inline-flex" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-3 sm:mt-5 sm:py-4">
              <Stat label="Book" value={formatCompactUsd(PROFILE.bookValue)} />
              <Stat
                label="Net P&L"
                value={`${up ? "+" : "−"}${formatCompactUsd(Math.abs(PROFILE.pnl))}`}
                tone={up ? "text-buy" : "text-sell"}
              />
              <Stat label="Fills" value={String(PROFILE.fills)} />
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">
              Holdings
            </p>
            <div className="mt-1.5">
              {FOCUS_HOLDINGS.map((h, i) => (
                <ProfileRow key={h.token} p={p} index={i} reduce={reduce}>
                  <span className={`${data} font-medium text-ink`}>
                    ${h.token}
                  </span>
                  <span className={`${data} text-right text-ink`}>
                    {formatUsd(h.valueUsd)}
                  </span>
                </ProfileRow>
              ))}
            </div>

            <div className="hidden sm:block">
              <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">
                Recent activity
              </p>
              <div className="mt-1.5">
                {PROFILE.recent.map((t, i) => (
                  <ProfileRow
                    key={t.id}
                    p={p}
                    index={i + FOCUS_HOLDINGS.length}
                    reduce={reduce}
                  >
                    <span className="flex items-center gap-2.5">
                      <SidePill side={t.side} />
                      <span className={`${data} text-ink`}>${t.token}</span>
                    </span>
                    <span className={`${data} text-right text-ink-muted`}>
                      {formatUsd(t.sizeUsd)} · {formatTimeHms(t.timestamp)}
                    </span>
                  </ProfileRow>
                ))}
              </div>
            </div>
          </div>
        </SiteBeam>
      </motion.div>
    </div>
  );
}

function ProfileRow({
  p,
  index,
  reduce,
  children,
}: {
  p: P;
  index: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const start = 0.83 + index * 0.018;
  const opacity = useTransform(p, [start, start + 0.04], [0, 1]);
  const x = useTransform(p, [start, start + 0.04], still(reduce, [14, 0]));
  return (
    <motion.div
      style={{ opacity, x }}
      className="flex h-8 items-center justify-between gap-3 border-b border-border text-xs last:border-b-0 sm:h-9 sm:text-[13px]"
    >
      {children}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  tone = "text-ink",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">
        {label}
      </p>
      <p className={`${data} mt-1 truncate text-sm ${tone}`}>{value}</p>
    </div>
  );
}
