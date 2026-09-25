"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import BeamBorder from "@/components/ui/border-beam";

// BeamBorder's own "auto" theme follows the OS colour scheme, but FOMT has its
// own toggle (data-theme on <html>). Mirror that instead so the beam's
// light/dark treatment always matches what the page is actually showing.
// Starts at "light" on both server and first client render (no hydration
// mismatch), then syncs after mount.
function useSiteTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

const DARK_LIFT = {
  "--rim-stroke-opacity": 3,
  "--rim-inner-opacity": 1.6,
  "--rim-bloom-opacity": 2,
} as CSSProperties;

// The site's animated card border: one place for size, palette and pace so
// every card/panel below the hero reads as the same system. "mono" keeps it a
// white/silver light rather than a coloured one. `className` lands on the beam
// wrapper — put outer shadows here, since the wrapper clips (overflow: hidden)
// anything the card itself casts outside its edge.
export function SiteBeam({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useSiteTheme();
  return (
    <BeamBorder
      size="md"
      colorVariant="mono"
      theme={theme}
      // Mono is drawn at half opacity, and the md dark preset is faint to begin
      // with (stroke 0.26 vs 0.8 light), so on dark cards the white light all
      // but vanishes. Lift it there through the component's opacity hooks
      // (plain multipliers, not clamped like `strength`).
      style={theme === "dark" ? DARK_LIFT : undefined}
      duration={3.3}
      beamWidth={1.5}
      className={className}
    >
      {children}
    </BeamBorder>
  );
}

// Pass to a wrapped card so the beam *replaces* its static border rather than
// sitting on top of it (twMerge in `cn` lets these win over the card defaults).
// `h-full` makes the card fill the beam: in a stretched row or grid the beam
// grows to the tallest sibling, and without it the card would stop short and
// leave an empty ring hanging below.
export const beamReplacesBorder = "h-full border-transparent hover:border-transparent";
