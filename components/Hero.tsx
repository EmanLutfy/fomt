import Image from "next/image";
import Link from "next/link";
import { container } from "@/lib/ui";

// Apple-style "liquid glass" — translucent, blurred, with a bright inner
// top edge to fake the highlight a real glass bevel would catch. Kept local
// to the hero (not lib/ui's shared btnPrimary/btnGhost) since it only reads
// correctly over a busy image backdrop; the flat pages elsewhere have none.
const glassBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-[#F7F6F3] [backdrop-filter:blur(20px)_saturate(180%)] transition [box-shadow:inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-white/[0.16] active:scale-[0.96]";

export function Hero() {
  return (
    <section className="relative -mt-20 min-h-screen overflow-hidden bg-[#111110] sm:-mt-24">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.6] [filter:brightness(0.3)]"
        />
      </div>
      {/* -mt above pulls this section back up under the fixed navbar; this top
          padding then reproduces the same header clearance for the actual content. */}
      <div
        className={`${container} relative flex min-h-screen flex-col items-center justify-center pb-16 pt-32 text-center sm:pb-24 sm:pt-40 lg:pb-32 lg:pt-48`}
      >
        {/* Bold sans, centered — not the editorial serif used elsewhere on the page.
            Fluid size (not fixed breakpoints) so it's always as large as the
            viewport allows while staying on one line: scales with vw, floor and
            ceiling are the measured widths that still fit at 320px and at the
            container's own max width (1240px), both with a 16px safety margin.
            Colors are fixed (not the theme-reactive text-ink), because the photo
            behind this section is always dark regardless of the site's light/dark
            toggle — inverting to dark text in light mode would fail contrast
            against it (verified: gray-on-gray reads at ~1.6:1). */}
        <h1 className="whitespace-nowrap font-sans text-[clamp(1.4rem,calc(7.8vw_-_2.5px),5.5rem)] font-extrabold leading-[1.1] tracking-tight text-[#F7F6F3]">
          {/* Each word fades/rises in on its own, staggered ~350ms apart — the
              project's existing fade-up keyframe (globals.css), slowed from its
              0.6s default via an inline override so the shared token itself
              stays untouched for other, faster uses elsewhere. The sitewide
              prefers-reduced-motion rule in globals.css collapses this to
              instant for anyone who's asked for less motion. */}
          {["Fear", "Of", "Missing", "Trenches"].map((word, i) => (
            <span
              key={word}
              className="inline-block animate-fade-up"
              style={{ animationDelay: `${i * 0.35}s`, animationDuration: "1s" }}
            >
              {word}
              {i < 3 ? " " : ""}
            </span>
          ))}
        </h1>
        {/* Small and muted, like the reference — a subhead, not competing with the headline.
            Neither balance nor pretty guaranteed line one stays the widest (both measured
            with line two wider), so below lg the break is manual — picked by measuring real
            glyph widths so line one is provably >= line two. That split needs room for a
            700px+ first line, so it's two separate paragraphs rather than one <br> toggled
            by a responsive class: a display:none <br> still perturbed Chrome's line breaks
            here (measured a stray isolated word), so the safe fix avoids the node outright. */}
        <p className="mt-4 hidden max-w-[46rem] text-sm leading-relaxed text-[#A8A6A0] sm:text-base lg:block">
          Watches a set of tracked trader and KOL wallets on Robinhood Chain and shows exactly
          <br />
          what they buy and sell, as it happens. No trading, no custody, just the tape.
        </p>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[#A8A6A0] sm:text-base lg:hidden">
          Watches a set of tracked trader and KOL wallets on Robinhood Chain and shows exactly what they buy and
          sell, as it happens. No trading, no custody, just the tape.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/terminal" className={glassBtn}>
            Open the terminal
          </Link>
          <Link href="/traders" className={glassBtn}>
            View tracked traders
          </Link>
        </div>
      </div>
    </section>
  );
}
