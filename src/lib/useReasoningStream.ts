"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReasoningStep } from "./types";

/**
 * Drives the step-by-step reveal of a reasoning chain.
 *
 * Timing comes from each step's recorded `durationMs`. In live mode those are
 * the gateway's real per-step latencies; in replay they are the same numbers
 * read from the cassette. That is the whole trick behind fallback parity —
 * this hook cannot tell the difference, so neither can the audience.
 *
 * `speed` exists only for the presenter: 1× for the pitch, higher when
 * rehearsing. It is never surfaced in the demo path.
 */
export function useReasoningStream(
  steps: ReasoningStep[],
  opts: { autoplay?: boolean; speed?: number } = {},
) {
  const { autoplay = true, speed = 1 } = opts;

  const [revealed, setRevealed] = useState(autoplay ? 0 : steps.length);
  const [running, setRunning] = useState(autoplay);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    setRevealed(autoplay ? 0 : steps.length);
    setRunning(autoplay);
    return clear;
    // Re-arm whenever the chain itself changes (i.e. a different finding).
  }, [steps, autoplay, clear]);

  useEffect(() => {
    if (!running || revealed >= steps.length) {
      if (revealed >= steps.length) setRunning(false);
      return;
    }
    // The decision step has durationMs 0 — give it a beat so it lands.
    const raw = steps[revealed].durationMs || 520;
    timer.current = setTimeout(() => setRevealed((n) => n + 1), raw / speed);
    return clear;
  }, [running, revealed, steps, speed, clear]);

  const complete = revealed >= steps.length;

  return {
    revealed,
    complete,
    running,
    /** Show every step at once — used by the "skip" control while presenting. */
    finish: useCallback(() => {
      clear();
      setRunning(false);
      setRevealed(steps.length);
    }, [steps.length, clear]),
    replay: useCallback(() => {
      clear();
      setRevealed(0);
      setRunning(true);
    }, [clear]),
    elapsedMs: steps.slice(0, revealed).reduce((a, s) => a + s.durationMs, 0),
  };
}
