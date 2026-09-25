"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

// Words brighten from dim to full, one after another, as `progress` moves
// through `range`. Opacity only, so it stays legible under reduced motion and
// the text is still one readable string for screen readers.
export function ScrubText({
  text,
  progress,
  range,
  dim = 0.16,
}: {
  text: string;
  progress: MotionValue<number>;
  range: [number, number];
  dim?: number;
}) {
  const words = text.split(" ");
  const [start, end] = range;
  const slot = (end - start) / words.length;

  return (
    <>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          word={word}
          progress={progress}
          from={start + slot * i}
          to={start + slot * (i + 1.6)}
          dim={dim}
          trailingSpace={i < words.length - 1}
        />
      ))}
    </>
  );
}

function Word({
  word,
  progress,
  from,
  to,
  dim,
  trailingSpace,
}: {
  word: string;
  progress: MotionValue<number>;
  from: number;
  to: number;
  dim: number;
  trailingSpace: boolean;
}) {
  const opacity = useTransform(progress, [from, to], [dim, 1]);
  return (
    <motion.span style={{ opacity }}>
      {word}
      {trailingSpace ? " " : ""}
    </motion.span>
  );
}
