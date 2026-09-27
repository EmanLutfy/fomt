"use client";

import { useEffect } from "react";

/**
 * Flags <html data-page-scrolling> while the page is scrolling, so animated
 * borders (.hb) can hold still and leave every frame to the scroll.
 */
export function usePageScrollFlag() {
  useEffect(() => {
    const root = document.documentElement;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (!idle) root.setAttribute("data-page-scrolling", "");
      clearTimeout(idle);
      idle = setTimeout(() => {
        idle = undefined;
        root.removeAttribute("data-page-scrolling");
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
    };
  }, []);
}
