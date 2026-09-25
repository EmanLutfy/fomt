"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
// The Next.js build of the same component (App Router friendly).
import UnicornScene, { type UnicornStudioScene } from "unicornstudio-react/next";

// Starts at 0×0 on both the server and the first client render so hydration
// matches; the effect fills in the real size right after mount.
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// Unicorn Studio scene. With `fill`, it sizes to its parent (100% × 100%)
// instead of the window, for use as a section background.
// `scale` renders the scene at a fraction of its display size (0.25–1) and
// `dpi` caps the pixel ratio — both cut GPU work per frame; the library's
// defaults are scale 1, dpi 1.5. `pauseWhileScrolling` holds the scene still
// while the page scrolls, so full-resolution rendering never competes with
// scroll frames; it resumes once scrolling has been idle briefly.
const SCROLL_IDLE_MS = 160;

export const Component = ({
  className,
  fill = false,
  paused = false,
  scale,
  dpi,
  pauseWhileScrolling = false,
}: {
  className?: string;
  fill?: boolean;
  paused?: boolean;
  scale?: number;
  dpi?: number;
  pauseWhileScrolling?: boolean;
}) => {
  const { width, height } = useWindowSize();
  // unicornstudio-react only forwards `paused` when the prop *changes*, not
  // when the scene is first created — so a scene mounted already-paused would
  // still animate. Re-apply it once the scene has loaded.
  const sceneRef = useRef<UnicornStudioScene | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (!pauseWhileScrolling) return;
    let idle: ReturnType<typeof setTimeout> | null = null;
    let scrolling = false;
    const onScroll = () => {
      const scene = sceneRef.current;
      if (!scrolling && scene) {
        scrolling = true;
        scene.paused = true;
      }
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        scrolling = false;
        if (sceneRef.current) sceneRef.current.paused = pausedRef.current;
      }, SCROLL_IDLE_MS);
    };
    // wheel/touchstart fire before the first scroll event, so the scene is
    // already paused by the time the first scrolled frame is drawn.
    const events = ["wheel", "touchstart", "scroll"] as const;
    for (const e of events) window.addEventListener(e, onScroll, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, onScroll);
      if (idle) clearTimeout(idle);
    };
  }, [pauseWhileScrolling]);

  return (
    <div className={cn("flex flex-col items-center", fill && "h-full w-full", className)}>
      <UnicornScene
        production={true}
        projectId="9tVO0xGS8DIar1DF4Sqc"
        width={fill ? "100%" : width}
        height={fill ? "100%" : height}
        paused={paused}
        scale={scale}
        dpi={dpi}
        sceneRef={sceneRef}
        onLoad={() => {
          if (sceneRef.current) sceneRef.current.paused = pausedRef.current;
        }}
      />
    </div>
  );
};
