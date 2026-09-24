"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

// Plain <video autoPlay> already respects most reduced-motion setups in
// practice, but pausing it explicitly when the OS asks for less motion
// keeps the hero from being the one place on the site that ignores that
// preference. It still needs an explicit pause control regardless of that
// preference — continuous auto-playing content isn't exempt just because
// it also honors prefers-reduced-motion.
export function HeroVideo({
  src,
  playbackRate = 1,
  videoClassName = "",
}: {
  src: string;
  playbackRate?: number;
  videoClassName?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      video.pause();
      video.removeAttribute("autoplay");
      setPlaying(false);
      return;
    }

    // This footage wasn't shot as a seamless loop, so the native `loop`
    // attribute produced a visible jump cut every cycle. Ping-pong instead:
    // play forward natively (cheap), then on `ended` step currentTime back
    // down to 0 by hand and resume forward play — the two ends always match
    // exactly because they're the same frame, so there's nothing to cut.
    video.loop = false;
    video.playbackRate = playbackRate;

    let reversing = false;
    let raf = 0;
    let lastTime = 0;

    function stepReverse(now: number) {
      if (!reversing) return;
      const dt = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;
      const next = video!.currentTime - dt * playbackRate;
      if (next <= 0.02) {
        video!.currentTime = 0;
        reversing = false;
        lastTime = 0;
        video!.play().catch(() => {});
        return;
      }
      video!.currentTime = next;
      raf = requestAnimationFrame(stepReverse);
    }

    function onEnded() {
      reversing = true;
      lastTime = 0;
      raf = requestAnimationFrame(stepReverse);
    }

    function onLoadedMetadata() {
      video!.playbackRate = playbackRate;
    }

    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      cancelAnimationFrame(raf);
    };
  }, [playbackRate]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => {});
      setPlaying(true);
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover [filter:brightness(0.7)] ${videoClassName}`}
        src={src}
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />
      {/* Kept outside the video's own opacity so the control stays fully legible
          regardless of how faint the backdrop reads. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute bottom-6 right-6 z-10 rounded-full border border-border-strong bg-bg-deep/80 p-2.5 text-ink-muted backdrop-blur-md transition hover:text-ink active:scale-[0.96]"
      >
        {playing ? <Pause size={15} weight="bold" /> : <Play size={15} weight="bold" />}
      </button>
    </>
  );
}
