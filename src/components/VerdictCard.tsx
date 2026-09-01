"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Finding } from "@/lib/types";
import { verdictBlurb } from "@/lib/format";
import { ConfidenceMeter, Eyebrow, Mono, SeverityChip, VerdictChip } from "@/components/ui/primitives";

/**
 * One of the three outcomes, as a card on the overview.
 *
 * Ordering on the overview is auto-fix → flag → abstain, which is also the
 * demo's running order: increasing agent restraint. The row reads left to
 * right as "did it itself / asked a human / admitted it did not know".
 */
export function VerdictCard({ finding, index }: { finding: Finding; index: number }) {
  const abstained = finding.verdict === "abstain";

  return (
    <Link
      href={`/app/analysis/${finding.id}`}
      className={cn(
        "group flex flex-col rounded-card border bg-card p-5 shadow-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lifted",
        abstained ? "border-dashed border-mid/40" : "border-hairline",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>Outcome {index + 1} of 3</Eyebrow>
        <Mono className="text-faint">{finding.id}</Mono>
      </div>

      <div className="mt-3">
        <VerdictChip verdict={finding.verdict} />
      </div>

      <p className="mt-3 text-body leading-relaxed text-mid">{verdictBlurb[finding.verdict]}</p>

      <div className="mt-4 border-t border-hairline pt-4">
        <h3 className="text-body-lg font-medium leading-snug text-ink">{finding.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {abstained ? (
            <span className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-mid/50 px-2 py-0.5 text-caption font-medium uppercase text-mid">
              severity withheld
            </span>
          ) : (
            <SeverityChip severity={finding.severity} />
          )}
          <Mono className="text-faint">
            {finding.file}:{finding.line}
          </Mono>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <ConfidenceMeter value={finding.confidence} threshold={finding.threshold} />
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-caption font-medium tracking-normal text-ink">
        See the reasoning
        <svg
          width="10" height="10" viewBox="0 0 10 10" aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path d="M1.5 5h7M5.6 2.1 8.5 5 5.6 7.9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
