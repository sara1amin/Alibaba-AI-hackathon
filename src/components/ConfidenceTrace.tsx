"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { ReasoningStep } from "@/lib/types";

/**
 * Confidence as it moved across the chain, against the action threshold.
 *
 * The point of charting it rather than printing a final number: you can see
 * where the agent gained conviction and where it stalled. On the abstain path
 * the line goes flat and never crosses the bar — the picture makes the refusal
 * self-evident before anyone reads a word.
 */
export function ConfidenceTrace({
  steps, revealed, threshold, className,
}: { steps: ReasoningStep[]; revealed: number; threshold: number; className?: string }) {
  const W = 100;
  const H = 56;
  const shown = steps.slice(0, Math.max(revealed, 1));

  const pts = shown.map((s, i) => {
    const x = steps.length === 1 ? 0 : (i / (steps.length - 1)) * W;
    const y = H - (s.confidence / 100) * H;
    return { x, y, c: s.confidence };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const area = pts.length > 1 ? `${line} L${pts[pts.length - 1].x.toFixed(2)} ${H} L0 ${H} Z` : "";
  const thresholdY = H - (threshold / 100) * H;
  const last = pts[pts.length - 1];
  const clears = (last?.c ?? 0) >= threshold;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        className="h-[56px] w-full overflow-visible"
        role="img" aria-label={`Confidence trace, currently ${last?.c ?? 0} percent against a ${threshold} percent threshold`}
      >
        <line
          x1="0" y1={thresholdY} x2={W} y2={thresholdY}
          className="stroke-ink/35" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke"
        />
        {/* currentColor throughout: one colour decision, inherited by every mark */}
        <g className={clears ? "text-verified" : "text-mid"}>
          {area && <path d={area} fill="currentColor" fillOpacity={0.13} />}
          <path
            d={line} fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
          {last && <circle cx={last.x} cy={last.y} r="2" fill="currentColor" vectorEffect="non-scaling-stroke" />}
        </g>
      </svg>
      <div className="mt-1 flex justify-between text-micro text-faint tnum">
        <span>first observation</span>
        <span>decision</span>
      </div>
    </div>
  );
}
