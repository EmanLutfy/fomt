"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { container } from "@/lib/ui";
import { Pinned } from "@/components/scroll/Pinned";
import { still } from "@/components/scroll/useReducedMotionSafe";
import { BlurReveal } from "@/components/ui/blur-reveal";

// The scene ships its own WebGL SDK (~240 kB), so it's split into a separate
// chunk loaded after first paint instead of weighing down the page's initial
// JS. Client-only: it has nothing to render on the server.
const BloimBackground = dynamic(
  () => import("@/components/ui/bloim-animation-background").then((m) => m.Component),
  { ssr: false },
);

// Apple-style "liquid glass" — translucent, blurred, with a bright inner
// top edge to fake the highlight a real glass bevel would catch. Kept local
// to the hero (not lib/ui's shared btnPrimary/btnGhost) since its white-on-
// translucent treatment is tuned for the hero's fixed dark backdrop.
const glassBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-[#F7F6F3] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] [backdrop-filter:blur(20px)_saturate(180%)] transition [box-shadow:inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-white/[0.16] active:scale-[0.96]";

export function Hero() {
  return (
    // -mt pulls the pinned stage back up under the fixed navbar so the
    // background runs edge-to-edge from the true top of the page.
    <Pinned
      length={170}
      label="Fear Of Missing Trenches"
      className="-mt-20 bg-black sm:-mt-24"
    >
      {({ progress, reduce }) => <HeroStage p={progress} reduce={reduce} />}
    </Pinned>
  );
}

function HeroStage({ p, reduce }: { p: MotionValue<number>; reduce: boolean }) {
  // Depth: each layer travels a different distance for the same scroll, the
  // background least, the buttons most.
  const bgScale = useTransform(p, [0, 1], still(reduce, [1, 1.12], 1));
  const bgY = useTransform(p, [0, 1], still(reduce, [0, -30]));

  const titleY = useTransform(p, [0, 1], still(reduce, [0, -110]));
  const titleScale = useTransform(p, [0, 1], still(reduce, [1, 0.92], 1));
  const titleOpacity = useTransform(p, [0.55, 0.92], [1, 0]);
  const titleBlur = useTransform(p, [0.55, 0.92], still(reduce, [0, 8]));
  const titleFilter = useMotionTemplate`blur(${titleBlur}px)`;

  const bodyY = useTransform(p, [0, 1], still(reduce, [0, -160]));
  const bodyOpacity = useTransform(p, [0.3, 0.7], [1, 0]);

  const ctaY = useTransform(p, [0, 1], still(reduce, [0, -200]));
  const ctaOpacity = useTransform(p, [0.2, 0.6], [1, 0]);
  const ctaPointer = useTransform(p, (v) => (v > 0.55 ? "none" : "auto"));

  // The scene renders on the GPU every frame, so it's only mounted while the
  // hero is (nearly) on screen. Reduced motion keeps it as a still frame.
  const bgRef = useRef<HTMLDivElement>(null);
  const bgInView = useInView(bgRef, { margin: "200px 0px" });

  return (
    <>
      <motion.div
        ref={bgRef}
        style={{ scale: bgScale, y: bgY }}
        aria-hidden="true"
        className="absolute inset-0 will-change-transform"
      >
        {/* Full resolution (lower render scales smeared the bloom's fine
            rays), but held still while the page scrolls: rendering it during
            scroll alone held this section to ~30fps. */}
        {bgInView && (
          <BloimBackground fill paused={reduce} pauseWhileScrolling />
        )}
        {/* The bloom's core runs near-white right behind the copy, so the
            text carries its own dark halo (text-shadow) rather than dimming
            the whole scene with a scrim. */}
      </motion.div>

      <div
        className={`${container} relative flex h-full flex-col items-center justify-center pb-10 pt-24 text-center`}
      >
        {/* Bold sans, centered — not the editorial serif used elsewhere on the page.
            Fluid size (not fixed breakpoints) so it's always as large as the
            viewport allows while staying on one line: scales with vw, floor and
            ceiling are the measured widths that still fit at 320px and at the
            container's own max width (1240px), both with a 16px safety margin.
            Colors are fixed (not the theme-reactive text-ink), because the
            backdrop behind this section is always dark regardless of the
            site's light/dark toggle. Face, weight, tracking and colour match
            the reference: SF Pro Display semibold, tight, #FAFAFA on black. */}
        <motion.h1
          style={{
            y: titleY,
            scale: titleScale,
            opacity: titleOpacity,
            filter: titleFilter,
          }}
          className="whitespace-nowrap font-hero text-[clamp(1.4rem,calc(7.8vw_-_2.5px),5.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-[#FAFAFA] [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] will-change-transform"
        >
          {/* Letters sharpen in from a blur, one after another, on load. The
              h1 stays the outer element so the scroll parallax above still
              drives the whole line. Reduced motion gets the plain text. */}
          {reduce ? (
            "Fear Of Missing Trenches."
          ) : (
            <BlurReveal as="span" delay={0.2}>
              Fear Of Missing Trenches.
            </BlurReveal>
          )}
        </motion.h1>

        <motion.div
          style={{ y: bodyY, opacity: bodyOpacity }}
          className="will-change-transform"
        >
          {/* Two paragraphs rather than one <br> toggled by a responsive class:
              a display:none <br> still perturbed Chrome's line breaks here. The
              lg version's manual break keeps line one provably >= line two
              (measured glyph widths). */}
          <p className="mt-4 hidden max-w-[46rem] text-sm leading-relaxed text-[#E4E2DD] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_14px_rgba(0,0,0,0.85)] sm:text-base lg:block">
            Watches a set of tracked trader and KOL wallets on Robinhood Chain
            and shows exactly
            <br />
            what they buy and sell, as it happens. No trading, no custody, just
            the tape.
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[#E4E2DD] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_14px_rgba(0,0,0,0.85)] sm:text-base lg:hidden">
            Watches a set of tracked trader and KOL wallets on Robinhood Chain
            and shows exactly what they buy and sell, as it happens. No trading,
            no custody, just the tape.
          </p>
        </motion.div>

        <motion.div
          style={{ y: ctaY, opacity: ctaOpacity, pointerEvents: ctaPointer }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3 will-change-transform"
        >
          <Link href="/terminal" className={glassBtn}>
            Open the terminal
          </Link>
          <Link href="/traders" className={glassBtn}>
            View tracked traders
          </Link>
        </motion.div>
      </div>
    </>
  );
}
