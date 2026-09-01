"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { Abstention } from "@/lib/types";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * The restraint screen.
 *
 * Everything here is dashed and achromatic on purpose. Elsewhere in the product
 * colour means the agent reached a conclusion; withholding colour is how the UI
 * says it did not. The panel answers three questions in order, because that is
 * the order a sceptical engineer asks them:
 *
 *   1. What exactly could you not establish?
 *   2. What were the possibilities, and how close were they?
 *   3. What would it take to settle it?
 *
 * Point 3 is the one that turns a refusal from a shrug into a work item.
 */
export function AbstentionPanel({ abstention, className }: { abstention: Abstention; className?: string }) {
  return (
    <div className={className}>
      <div className="rounded-nested border border-dashed border-mid/45 bg-nested/30 p-4">
        <Eyebrow>Unresolved</Eyebrow>
        <p className="mt-1.5 text-subheading font-medium leading-snug text-ink">
          {abstention.unresolved}
        </p>
        <p className="mt-2.5 text-body leading-relaxed text-mid">
          No severity is asserted and no patch is proposed. Both would be guesses,
          and a guess recorded as a finding costs more than a gap recorded as a gap.
        </p>
      </div>

      {/* Competing readings */}
      <div className="mt-4">
        <Eyebrow>Competing readings</Eyebrow>
        <div className="mt-2.5 space-y-2.5">
          {abstention.hypotheses.map((h) => (
            <div key={h.label} className="rounded-nested border border-hairline bg-card p-3.5">
              <div className="flex items-start justify-between gap-4">
                <span className="text-body font-medium text-ink">{h.label}</span>
                <span className="shrink-0 font-mono text-[12px] text-mid tnum">{h.likelihood}%</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-nested">
                <div className="h-full rounded-full bg-mid/70" style={{ width: `${h.likelihood}%` }} />
              </div>
              <p className="mt-2.5 text-body leading-relaxed text-mid">{h.support}</p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-caption tracking-normal text-faint">
          The two readings sit 12 points apart across four severity levels. Nothing
          observable separates them, so neither is reported.
        </p>
      </div>

      {/* The actionable half */}
      <div className="mt-4 rounded-nested border border-hairline bg-nested/40 p-4">
        <Eyebrow>What would resolve this</Eyebrow>
        <ol className="mt-2 space-y-2">
          {abstention.wouldResolve.map((w, i) => (
            <li key={w} className="flex gap-2.5">
              <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-hairline-strong font-mono text-[10px] text-mid">
                {i + 1}
              </span>
              <span className="text-body leading-relaxed text-ink-soft">{w}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
