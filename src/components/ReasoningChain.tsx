"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { EvidenceRef, ReasoningStep } from "@/lib/types";
import { ms, sourceKindLabel, stepKindLabel } from "@/lib/format";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * THE CENTREPIECE.
 *
 * Every step renders the same three-part grammar, because the claim of the
 * product is that the agent's judgement is *inspectable*:
 *
 *     CLAIM        — what the agent asserts
 *     BECAUSE      — why it holds
 *     SOURCES      — what it read to know that
 *
 * A step with no sources renders an explicit "unsourced" marker rather than
 * quietly omitting the row. If we ever ship a step that cannot show its work,
 * the UI says so out loud. That is the honesty the demo is selling.
 */

const kindAccent: Record<ReasoningStep["kind"], string> = {
  observation: "text-mid",
  cross_reference: "text-ink",
  hypothesis: "text-medium",
  validation: "text-verified",
  decision: "text-ink",
};

function SourceChip({ source }: { source: EvidenceRef }) {
  const [open, setOpen] = React.useState(false);
  const hasExcerpt = Boolean(source.excerpt);

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={!hasExcerpt}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex max-w-full items-center gap-1.5 rounded-small border border-hairline bg-nested/60 px-2 py-1",
          "text-micro text-mid transition-colors",
          hasExcerpt && "hover:border-hairline-strong hover:text-ink",
        )}
      >
        <span className="shrink-0 font-medium uppercase tracking-wider text-faint">
          {sourceKindLabel[source.kind]}
        </span>
        <span className="h-2.5 w-px shrink-0 bg-hairline-strong" aria-hidden />
        <span className="truncate font-mono text-[11px] tracking-tight">{source.ref}</span>
        {hasExcerpt && (
          <svg
            width="8" height="8" viewBox="0 0 8 8" aria-hidden
            className={cn("shrink-0 transition-transform duration-200", open && "rotate-90")}
          >
            <path d="M2.5 1 5.5 4 2.5 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && source.excerpt && (
        <pre className="mt-1.5 animate-fade-in overflow-x-auto rounded-small border border-hairline bg-canvas px-2.5 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
          {source.excerpt}
        </pre>
      )}
    </div>
  );
}

function StepNode({
  step, index, total, prevConfidence,
}: { step: ReasoningStep; index: number; total: number; prevConfidence: number | null }) {
  const isDecision = step.kind === "decision";
  const delta = prevConfidence === null ? null : step.confidence - prevConfidence;

  return (
    <li className="relative animate-step-in pl-9">
      {/* spine */}
      {index < total - 1 && (
        <span className="absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-hairline-strong/70" aria-hidden />
      )}

      {/* node marker — shape encodes step kind */}
      <span
        className={cn(
          "absolute left-0 top-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border bg-card",
          isDecision ? "border-ink" : "border-hairline",
        )}
        aria-hidden
      >
        {isDecision ? (
          <span className="h-2 w-2 rounded-full bg-ink" />
        ) : step.discarded ? (
          <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 1.5 7.5 7.5M7.5 1.5 1.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-faint" /></svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-mid" />
        )}
      </span>

      <div
        className={cn(
          "pb-6",
          isDecision && "rounded-nested border border-ink/25 bg-nested/50 p-4 pb-4",
        )}
      >
        {/* meta row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={cn("text-caption font-medium uppercase tracking-wider", kindAccent[step.kind])}>
            {stepKindLabel[step.kind]}
          </span>
          <span className="text-micro text-faint tnum">{ms(step.durationMs)}</span>
          {delta !== null && delta !== 0 && (
            <span className={cn("text-micro font-medium tnum", delta > 0 ? "text-verified" : "text-medium")}>
              {delta > 0 ? "+" : ""}{delta} conf
            </span>
          )}
          {step.discarded && (
            <span className="rounded-control border border-dashed border-mid/50 px-1.5 text-micro uppercase tracking-wider text-mid">
              discarded
            </span>
          )}
        </div>

        {/* CLAIM */}
        <p
          className={cn(
            "mt-1.5 text-body-lg font-medium leading-snug text-ink",
            step.discarded && "text-mid",
          )}
        >
          {step.claim}
        </p>

        {/* BECAUSE */}
        <div className="mt-2 flex gap-2.5">
          <span className="mt-[3px] shrink-0 text-caption font-medium uppercase tracking-wider text-faint">
            because
          </span>
          <p className="text-body leading-relaxed text-mid">{step.because}</p>
        </div>

        {step.discarded && (
          <div className="mt-2.5 flex gap-2.5 border-l-2 border-hairline-strong pl-3">
            <span className="mt-[3px] shrink-0 text-caption font-medium uppercase tracking-wider text-faint">
              rejected
            </span>
            <p className="text-body leading-relaxed text-ink-soft">{step.discarded.reason}</p>
          </div>
        )}

        {/* SOURCES */}
        <div className="mt-3">
          {step.sources.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {step.sources.map((s, i) => (
                <SourceChip key={`${s.ref}-${i}`} source={s} />
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-small border border-dashed border-medium/40 px-2 py-1 text-micro uppercase tracking-wider text-medium">
              unsourced — assertion not backed by evidence
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/** Skeleton shown while the next step is still "computing". */
function PendingStep() {
  return (
    <li className="relative pl-9" aria-live="polite" aria-label="Analysing">
      <span className="absolute left-0 top-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-hairline bg-card">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mid" />
      </span>
      <div className="pb-6">
        <div className="flex items-center gap-2">
          <span className="text-caption font-medium uppercase tracking-wider text-faint">
            reasoning
          </span>
        </div>
        <div className="mt-2 space-y-2">
          <div className="relative h-3.5 w-[62%] overflow-hidden rounded-full bg-nested">
            <span className="absolute inset-y-0 w-1/3 animate-sweep bg-hairline-strong/70" />
          </div>
          <div className="relative h-3 w-[84%] overflow-hidden rounded-full bg-nested">
            <span className="absolute inset-y-0 w-1/3 animate-sweep bg-hairline-strong/50" />
          </div>
        </div>
      </div>
    </li>
  );
}

export function ReasoningChain({
  steps, revealed, className,
}: { steps: ReasoningStep[]; revealed: number; className?: string }) {
  const shown = steps.slice(0, revealed);

  return (
    <div className={className}>
      <div className="mb-4 flex items-baseline justify-between">
        <Eyebrow>Reasoning chain</Eyebrow>
        <span className="text-micro text-faint tnum">
          {Math.min(revealed, steps.length)} / {steps.length} steps
        </span>
      </div>

      <ol className="relative">
        {shown.map((step, i) => (
          <StepNode
            key={step.id}
            step={step}
            index={i}
            total={steps.length}
            prevConfidence={i === 0 ? null : shown[i - 1].confidence}
          />
        ))}
        {revealed < steps.length && <PendingStep />}
      </ol>
    </div>
  );
}
