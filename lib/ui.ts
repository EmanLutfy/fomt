export const container = "mx-auto max-w-container px-5 sm:px-8";
export const sectionPad = "py-20 sm:py-28";
export const divider = "border-t border-border";

// Editorial minimalism per the installed "minimalist-ui" skill: hairline
// 1px border, crisp 8-12px radius, generous padding, never a heavy shadow.
export const card = "rounded-2xl border border-border bg-surface transition hover:border-border-strong";
export const panel = "rounded-2xl border border-border bg-surface";

export const eyebrow =
  "inline-flex items-center text-[11px] font-medium tracking-[0.14em] uppercase text-ink-dim";

// Tabular, monospaced: use on every price/size/mcap/address/timestamp.
export const data = "font-mono tabular-nums";

// Primary CTA per the minimalist-ui skill: solid ink fill, canvas-colored
// text, no color, no shadow. `ink`/`bg` are always opposite-polarity tokens,
// so `bg-ink text-bg` inverts correctly in both themes with no dedicated
// "inverse" token. Press feedback follows apple-design's rule: :active
// already fires on pointer-down (not click/release) so this was correct in
// spirit, but 100ms is the concrete "instant" duration the skill asks for —
// the previous unspecified `transition` defaulted to Tailwind's 150ms.
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-transform duration-100 ease-out hover:scale-[0.98] active:scale-[0.96]";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-ink transition-[transform,border-color] duration-100 ease-out hover:scale-[0.98] hover:border-ink active:scale-[0.96]";

// Three distinct semantic pastels, not one all-purpose accent — color is
// reserved for meaning: buy is positive/green, sell is negative/red, the
// page has no "brand color" beyond plain ink (see btnPrimary above).
export const buyPill = "text-buy bg-buy/10 border border-buy/25";
export const sellPill = "text-sell bg-sell/10 border border-sell/25";

export const demoBadge =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong bg-surface px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-dim";
