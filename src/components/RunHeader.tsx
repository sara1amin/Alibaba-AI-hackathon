"use client";

import type { PipelineRun, Snapshot } from "@/lib/types";
import { clockTime } from "@/lib/format";
import { Eyebrow, Mono } from "@/components/ui/primitives";

export function RunHeader({ run, meta }: { run: PipelineRun; meta: Snapshot["meta"] }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption tracking-normal text-mid">
          <Mono className="text-mid">{run.repo}</Mono>
          <span className="text-faint" aria-hidden>›</span>
          <Mono className="text-mid">{run.branch}</Mono>
          <span className="text-faint" aria-hidden>›</span>
          <Mono className="text-ink">{run.commit}</Mono>
        </div>
        <h1 className="mt-2 text-heading-lg font-semibold text-ink">
          Run {run.id.replace("run-", "#")}
        </h1>
        <p className="mt-1.5 max-w-2xl text-body text-mid">
          {meta.scannedFiles} files and {meta.graphNodes} pipeline graph nodes analysed
          at {clockTime(run.startedAt)} UTC by <span className="text-ink-soft">{meta.modelId}</span>.
        </p>
      </div>

      <dl className="flex shrink-0 flex-wrap gap-x-8 gap-y-3">
        {[
          { l: "Gateway", v: `${meta.gatewayLatencyMs}ms` },
          { l: "Findings", v: run.findingIds.length },
          { l: "Status", v: run.status === "complete" ? "Complete" : "Analysing" },
        ].map((s) => (
          <div key={s.l}>
            <Eyebrow>{s.l}</Eyebrow>
            <dd className="mt-1 text-subheading font-medium text-ink tnum">{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
