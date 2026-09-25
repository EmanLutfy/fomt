import { cn } from "@/lib/utils";

// Placeholder profile pictures for the demo wallets: a small illustrated face
// generated from the handle, so each trader gets their own stable picture with
// no image files or third-party avatar service. Same handle, same face.

const PALETTE = [
  "#F4845F", // coral
  "#F7B267", // apricot
  "#7FC4EE", // sky
  "#9D8CF5", // lavender
  "#6FCF97", // mint
  "#F28DB2", // rose
  "#5B8DEF", // cobalt
  "#E9C46A", // mustard
];

function hash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Pull a different small integer out of the same hash for each feature.
const pick = (h: number, shift: number, range: number) =>
  Math.floor(h / 7 ** shift) % range;

export function TraderAvatar({
  handle,
  className,
}: {
  handle: string;
  className?: string;
}) {
  const h = hash(handle);
  const bg = PALETTE[h % PALETTE.length];
  // Head colour is always a different swatch from the background.
  const head = PALETTE[(h + 1 + pick(h, 1, PALETTE.length - 1)) % PALETTE.length];

  const tilt = pick(h, 2, 31) - 15; // -15..15deg
  const dx = pick(h, 3, 9) - 4; // head sits slightly off-centre
  const dy = pick(h, 4, 7) - 2;
  const round = pick(h, 5, 2) === 0 ? 18 : 7; // circle or rounded-square head
  const smile = pick(h, 6, 2) === 0;
  const eyeGap = 4 + pick(h, 7, 3);

  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={cn("shrink-0 overflow-hidden rounded-full", className)}
    >
      <rect width="36" height="36" fill={bg} />
      <g transform={`translate(${dx} ${dy}) rotate(${tilt} 18 18)`}>
        <rect x="6" y="7" width="24" height="24" rx={round} fill={head} />
        <g fill="#141414">
          <rect x={18 - eyeGap - 1} y="16" width="2" height="3" rx="1" />
          <rect x={18 + eyeGap - 1} y="16" width="2" height="3" rx="1" />
        </g>
        {smile ? (
          <path
            d="M14 22 Q18 26 22 22"
            fill="none"
            stroke="#141414"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M15 23.5 H21"
            stroke="#141414"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}
