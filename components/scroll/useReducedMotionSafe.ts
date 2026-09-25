"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// useReducedMotion() is null on the server but already resolved on the
// client's first render, so using it directly makes hydrated motion styles
// disagree with the server's (React doesn't patch those up). Both renders
// start in full-motion mode here and flip after mount.
export function useReducedMotionSafe(): boolean {
  const prefersReduced = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(!!prefersReduced), [prefersReduced]);
  return reduce;
}

// Under reduced motion a travel/scale/blur range collapses to its neutral
// value (0 for movement and blur, 1 for scale), leaving opacity changes only.
export function still(reduce: boolean, values: number[], rest = 0): number[] {
  return reduce ? values.map(() => rest) : values;
}
