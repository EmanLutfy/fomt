import { useId } from "react";

// The "portal" mark from the brand sheet — the glowing doorway from the
// hero photo, reduced to one shape. Gradient id is per-instance (useId)
// since this renders more than once on a page (desktop nav + mobile menu)
// and duplicate SVG ids break `url(#id)` fills in some browsers.
export function Logo({ className = "", size = 24 }: { className?: string; size?: number }) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dcae" />
          <stop offset="0.45" stopColor="#d9a257" />
          <stop offset="1" stopColor="#5b3a15" />
        </linearGradient>
      </defs>
      <path
        d="M18 58V22C18 13.163 25.163 6 34 6C42.837 6 50 13.163 50 22V58H18Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
