"use client";

import { useEffect, useRef } from "react";

/**
 * A 3D field of ASCII characters drifting slowly behind the hero, each one
 * a real canvas-drawn glyph (not a sprite), projected with simple
 * perspective so closer characters read bigger/brighter and farther ones
 * fade — the depth cue the reference image was built on. Kept abstract
 * (no recognizable shape) and character set stays data-relevant (digits +
 * a few terminal symbols) rather than a generic decorative glyph pile.
 */
export interface AsciiBackgroundProps {
  className?: string;
  /** Roughly how many characters populate the field. */
  density?: number;
  /** Idle rotation speed of the whole field, radians/second. */
  rotationSpeed?: number;
}

const CHARSET = "01234567890123456789+-*/%$#@<>[]{}";

interface Particle {
  x: number;
  y: number;
  z: number;
  char: string;
  accent: boolean;
}

export function AsciiBackground({ className = "", density = 420, rotationSpeed = 0.045 }: AsciiBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Deterministic-enough pseudo-random spawn — a fixed seed keeps the field
    // stable across re-renders within this mount rather than reshuffling.
    let seed = 1337;
    function rand() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    // Biased to the right half of the field — the headline, paragraph, and
    // CTAs live in the left column, and the reference image itself keeps its
    // cluster clear of the overlaid text rather than running full-bleed.
    const particles: Particle[] = Array.from({ length: density }, () => ({
      x: 0.15 + rand() * 1.55,
      y: (rand() - 0.5) * 1.7,
      z: 0.6 + rand() * 2.4,
      char: CHARSET[Math.floor(rand() * CHARSET.length)],
      accent: rand() < 0.14,
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = container!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let elapsed = 0;
    let raf = 0;
    let lastTime = performance.now();
    // A bounded sway, not a full orbit — a full rotation would eventually
    // swing the field's right-side bias back over the headline/paragraph.
    const maxSwing = 0.35;

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!reduceMotion) elapsed += dt;
      const angle = Math.sin(elapsed * rotationSpeed) * maxSwing;

      ctx!.clearRect(0, 0, width, height);

      // Canvas fillStyle/font can't parse CSS var() the way real elements
      // can — the theme's actual colors are resolved from <html> here,
      // every frame, so the field re-themes live when ThemeToggle flips
      // data-theme (cheap: two getPropertyValue reads, not per particle).
      const rootStyle = getComputedStyle(document.documentElement);
      const inkRgb = rootStyle.getPropertyValue("--color-ink").trim().split(/\s+/).join(",");
      const accentRgb = rootStyle.getPropertyValue("--color-accent").trim().split(/\s+/).join(",");

      const focal = Math.min(width, height) * 0.9;
      const cx = width / 2;
      const cy = height / 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Sort back-to-front so nearer glyphs draw over farther ones.
      const sorted = [...particles].sort((a, b) => b.z - a.z);

      for (const p of sorted) {
        // Rotate around the Y axis for a slow ambient turntable drift.
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;
        if (rz <= 0.05) continue;

        const scale = focal / (rz * focal * 0.3 + focal * 0.4);
        const screenX = cx + rx * scale * 120;
        const screenY = cy + p.y * scale * 120;
        if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) continue;

        const depthT = 1 - Math.min(Math.max((rz - 0.5) / 3, 0), 1);
        const fontSize = 9 + depthT * 15;
        const opacity = 0.12 + depthT * 0.55;

        ctx!.font = `${fontSize.toFixed(1)}px ui-monospace, "SF Mono", Menlo, monospace`;
        ctx!.fillStyle = p.accent
          ? `rgba(${accentRgb},${opacity.toFixed(2)})`
          : `rgba(${inkRgb},${opacity.toFixed(2)})`;
        ctx!.fillText(p.char, screenX, screenY);
      }

      // Reduced motion draws exactly one frame and stops — a live rAF loop
      // re-rendering an unmoving scene 60x/sec would still burn CPU for
      // nothing while technically "respecting" the preference.
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [density, rotationSpeed]);

  return (
    <div ref={containerRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
