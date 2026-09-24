/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Re-skinned per the installed "minimalist-ui" skill (Premium
        // Utilitarian Minimalism & Editorial protocol): warm off-white
        // canvas, off-black ink (never pure #000/#FFF), color reserved for
        // semantic meaning only. Every value still reads from a CSS custom
        // property (globals.css) so ThemeToggle keeps working — the skill
        // itself only specifies a light palette, so dark is this session's
        // own same-philosophy extrapolation (off-black canvas instead of
        // off-white, brightened pastels for contrast), not part of the skill.
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        "bg-deep": "rgb(var(--color-bg-deep) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--color-surface-hover) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--color-border-base) / 0.06)",
          strong: "rgb(var(--color-border-base) / 0.12)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          dim: "rgb(var(--color-ink-dim) / <alpha-value>)",
        },
        // Three distinct semantic pastels, not one all-purpose accent — the
        // skill treats color as "a scarce resource, utilized only for
        // semantic meaning": blue for info/live/tracked/links, green for
        // buy, red for sell. None of them are the page's "brand color";
        // there isn't one — primary CTAs use plain ink (see lib/ui.ts).
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          bright: "rgb(var(--color-accent-bright) / <alpha-value>)",
        },
        buy: {
          DEFAULT: "rgb(var(--color-buy) / <alpha-value>)",
        },
        sell: {
          DEFAULT: "rgb(var(--color-sell) / <alpha-value>)",
        },
      },
      fontFamily: {
        // Montserrat: body copy and UI labels — not one of the skill's
        // banned defaults (Inter/Roboto/Open Sans), so kept as-is.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Instrument Serif: the skill's own "Editorial Serif" target list
        // (Lyon Text / Newsreader / Playfair Display / Instrument Serif) —
        // swapped from Bodoni Moda for a closer match to the spec.
        display: ["var(--font-display)", "serif"],
        // Geist Mono: the skill's own suggested monospace target.
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        container: "1240px",
      },
      keyframes: {
        "row-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)", backgroundColor: "rgb(var(--color-accent) / 0.08)" },
          "60%": { backgroundColor: "rgb(var(--color-accent) / 0.08)" },
          "100%": { opacity: "1", transform: "translateY(0)", backgroundColor: "transparent" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "row-in": "row-in 0.5s ease-out",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "loading-bar": "loading-bar 1.1s ease-in-out infinite",
        // The skill's own scroll-entry spec: translateY(12px)+opacity 0,
        // 600ms, cubic-bezier(0.16,1,0.3,1).
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
