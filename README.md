# FOMT: Fear Of Missing Trenches

FOMT is a read-only on-chain intelligence terminal that tracks what a set of
trader and KOL wallets are doing on Robinhood Chain: buys, sells, holdings,
and history. It is not a DEX, not a trading platform, and does not custody
funds. It only surfaces public on-chain activity.

Built on:

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Phosphor icons
- TanStack Query (drives the mock service layer's loading states)

All data in this build is simulated/mock data, clearly labeled "Demo data"
throughout the UI. See "Before connecting a real backend" below for how to
connect a real data source.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing homepage: hero, live tape preview, tracked traders, tokens |
| `/terminal` | Live terminal: full buy/sell tape with filters and search |
| `/traders` | Tracked trader list, searchable |
| `/traders/[handle]` | Trader profile: holdings, recent activity |
| `/tokens` | Tracked token list, searchable |
| `/tokens/[symbol]` | Token activity: tracked-wallet stats and recent trades |

## Structure

- `app/`: routes (see table above)
- `components/`: one component per feature (`terminal/`, `traders/`,
  `tokens/`, `navbar/`, `search/`, `ui/` primitives)
- `types/`: `Trade`, `Trader`, `Holding`, `Token`, `TokenStats`
- `lib/mock-data.ts`: the single source of fictional trader/token/trade
  data, generated deterministically (same output on server and client)
- `lib/api.ts`: the service layer every component reads through; swapping
  its function bodies for real fetch/WebSocket calls is the entire backend
  migration path
- `hooks/use-live-trades.ts`: client-only hook that appends freshly
  generated trades on an interval, simulating a live feed
- `lib/ui.ts`: shared Tailwind class tokens (container, card, buttons, pills)

## Design system

Re-skinned to follow the "minimalist-ui" skill (`~/.agents/skills/minimalist-ui`,
installed from `github.com/leonxlnx/taste-skill`): a warm, off-white
editorial palette with color reserved strictly for semantic meaning. Tokens
live in `tailwind.config.js` + `app/globals.css` as CSS custom properties, so
`ThemeToggle` can flip `data-theme` on `<html>` and re-theme everything live:

- **Light** (default): canvas `#FBFBFA`, cards `#FFFFFF`, ink `#111111`
  (never pure black). **Dark**: canvas `#111111`, ink `#F7F6F3` (never pure
  white) — this session's own same-philosophy extrapolation, since the skill
  itself only specifies a light palette.
- **Color is semantic, not decorative**: blue (`accent`) for info/live/
  tracked/links, green (`buy`) for buy fills, red (`sell`) for sell fills.
  There is no "brand color" — primary buttons are solid `ink`/`bg` (inverts
  cleanly between themes since those two tokens are always opposite
  polarity), per the skill's own CTA spec.
- **Typography**: Instrument Serif for display headlines (the skill's own
  named target, swapped in from Bodoni Moda), Montserrat for body, Geist
  Mono for tabular data.
- **Radius**: Tailwind's default scale is already the skill's numbers —
  `rounded-md` (6px) for buttons, `rounded-lg`/`rounded-xl` (8/12px) for
  cards, `rounded-full` reserved for small tags/badges only, never large
  containers (the nav bar is a rectangle, not a pill, for this reason).
- **Icons**: Phosphor (bold weight), swapped from Lucide per the skill's
  explicit ban on "generic thin-line icon libraries."
- **Shadows**: near-zero (`rgba(0,0,0,0.04-0.05)`) or none — the skill treats
  heavy drop shadows as a banned default; borders carry depth instead.

The hero's background video is intentionally very low opacity (`~7%`) rather
than a dominant visual, per the skill's "no primary colored backgrounds for
large sections" rule — it reads as a faint texture, not a foreground element.

That video is a local asset under `public/video/` — worth compressing or
moving to a CDN before this repo is pushed anywhere, since it's sizeable for
a git-tracked binary.

Installed skills run with full agent permissions — `minimalist-ui`'s content
was read and applied as design direction (like a `DESIGN.md`), not executed
as code; nothing in it requests credentials, secrets, or network access.

## Before connecting a real backend

1. **Replace `lib/mock-data.ts` and the delay in `lib/api.ts`.** Every UI
   component calls through `lib/api.ts`, so swapping its function bodies for
   real fetch/WebSocket/subgraph calls (and `hooks/use-live-trades.ts`'s
   `generateLiveTrade` for a real subscription) is the whole migration.
2. **Remove the "Demo data" badges** (`components/ui/Badge.tsx`,
   `DemoDataBadge`) once the terminal is backed by live data. They exist
   specifically so mock data is never mistaken for a live feed.
3. **Wire a real chain explorer for tx hashes** if one becomes available for
   Robinhood Chain. `CopyableValue` currently copies the hash to the
   clipboard instead of linking out, since a link to a fictional hash would
   be a dead/misleading control.
