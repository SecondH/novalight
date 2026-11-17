'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  /** False renders the full text immediately (reduced motion, tests). */
  animate: boolean;
  /** Characters revealed per tick; the reveal takes roughly text.length / step * tickMs. */
  step?: number;
  tickMs?: number;
}

/**
 * Reveals `text` progressively, like a streaming AI response. Splits on grapheme clusters so
 * emoji and Persian ligatures (ZWNJ joins) are never cut in half mid-reveal. Purely visual:
 * callers provide the full text to assistive tech separately and mark this aria-hidden.
 */
export function TypewriterText({ text, animate, step = 2, tickMs = 28 }: TypewriterTextProps) {
  const [graphemes] = useState(() => splitGraphemes(text));
  const [revealed, setRevealed] = useState(0);
  // When animation is off (or switched off after hydration), show everything at once.
  const shown = animate ? revealed : graphemes.length;

  useEffect(() => {
    if (!animate || revealed >= graphemes.length) return;
    const timer = window.setTimeout(
      () => setRevealed((count) => Math.min(count + step, graphemes.length)),
      tickMs,
    );
    return () => window.clearTimeout(timer);
  }, [animate, revealed, graphemes.length, step, tickMs]);

  const done = shown >= graphemes.length;
  return (
    <>
      {graphemes.slice(0, shown).join('')}
      {!done && (
        <span className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary align-baseline" />
      )}
    </>
  );
}

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}
