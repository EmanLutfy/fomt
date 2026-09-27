/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Dark-only app palette: near-black canvas, graphite cards with hairline
      // borders, white as the only "brand" colour. Green/red are reserved for
      // money moving (buy / profit vs sell / loss), amber for "medium" checks.
      colors: {
        bg: "#0a0a0a",
        card: {
          DEFAULT: "#141414",
          hover: "#1a1a1a",
          raised: "#1f1f1f",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#fafafa",
          muted: "#a3a3a3",
          // ~5.3:1 on the card colour — the dimmest text still allowed.
          dim: "#8a8a8a",
        },
        up: "#4ade80",
        down: "#f87171",
        warn: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "20px",
      },
      keyframes: {
        "row-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)", backgroundColor: "rgba(255,255,255,0.06)" },
          "60%": { backgroundColor: "rgba(255,255,255,0.06)" },
          "100%": { opacity: "1", transform: "translateY(0)", backgroundColor: "transparent" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blur-in": {
          "0%": { opacity: "0", filter: "blur(12px)", transform: "translateY(10px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
      },
      animation: {
        "row-in": "row-in 0.6s ease-out",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        // Duration/delay are set per letter inline (see BlurReveal).
        "blur-in": "blur-in 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
