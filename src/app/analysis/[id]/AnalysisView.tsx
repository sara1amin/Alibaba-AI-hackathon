"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSnapshot } from "@/components/ModeProvider";
import { useReasoningStream } from "@/lib/useReasoningStream";
import { ReasoningChain } from "@/components/ReasoningChain";
import { ConfidenceTrace } from "@/components/ConfidenceTrace";
import { DependencyGraph } from "@/components/DependencyGraph";
import { FixViewer } from "@/components/FixViewer";
import { AbstentionPanel } from "@/components/AbstentionPanel";
import { DemoRail } from "@/components/DemoRail";
import { LoadingState } from "@/components/LoadingState";
import {
  Button, Card, ConfidenceMeter, Divider, Eyebrow, Mono,
  SeverityChip, VerdictChip,
} from "@/components/ui/primitives";
import { ms, verdictBlurb } from "@/lib/format";
import { cn } from "@/lib/cn";

const ORDER = ["auto_fix", "flag_for_review", "abstain"] as const;

/** Copy for the "what comes next" CTA — this is what carries the demo forward. */
const NEXT_CUE: Record<string, string> = {
  flag_for_review: "Next: the one it would not fix by itself",
  abstain: "Next: the one it refused to score",
};

export function AnalysisView({ id }: { id: string }) {
  const { snapshot, loading } = useSnapshot();
  const router = useRouter();

  const ordered = React.useMemo(
    () =>
      snapshot
        ? [...snapshot.findings].sort(
            (a, b) => ORDER.indexOf(a.verdict as never) - ORDER.indexOf(b.verdict as never),
          )
        : [],
    [snapshot],
  );

  const finding = ordered.find((f) => f.id === id) ?? ordered[0];
  const index = finding ? ordered.indexOf(finding) : 0;
  const next = ordered[index + 1];
  const prev = ordered[index - 1];

  const stream = useReasoningStream(finding?.reasoning ?? [], { autoplay: true });

  // Arrow-key navigation through the sequence — the presenter never hunts for a link.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" && next) router.push(`/analysis/${next.id}`);
      if (e.key === "ArrowLeft" && prev) router.push(`/analysis/${prev.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  if (loading || !snapshot || !finding) return <LoadingState />;

  const abstained = finding.verdict === "abstain";

  return (
    <div className="grid gap-8 lg:grid-cols-[176px_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1fr)_336px]">
      {/* ── sequence rail ── */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <DemoRail findings={ordered} activeId={finding.id} />
      </aside>

      {/* ── main column: the reasoning ── */}
      <div className="min-w-0">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Mono className="text-faint">{finding.id}</Mono>
            <span className="text-faint" aria-hidden>·</span>
            <Mono className="text-mid">{finding.rule}</Mono>
          </div>

          <h1 className="mt-2.5 max-w-3xl text-heading font-semibold leading-tight text-ink">
            {finding.title}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <VerdictChip verdict={finding.verdict} />
            {abstained ? (
              <span className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-mid/50 px-2 py-0.5 text-caption font-medium uppercase text-mid">
                severity withheld
              </span>
            ) : (
              <SeverityChip severity={finding.severity} />
            )}
            <Mono className="text-faint">{finding.file}:{finding.line}</Mono>
            <span className="text-faint" aria-hidden>·</span>
            <span className="text-caption tracking-normal text-faint tnum">
              {ms(finding.analysisMs)} of agent time
            </span>
          </div>

          {/* The decision sentence, given real weight */}
          <div
            className={cn(
              "mt-5 rounded-nested border-l-2 bg-nested/40 py-3 pl-4 pr-4",
              abstained ? "border-mid/50" :
              finding.verdict === "auto_fix" ? "border-verified/60" : "border-medium/60",
            )}
          >
            <Eyebrow>Decision</Eyebrow>
            <p className="mt-1.5 text-body-lg leading-relaxed text-ink">
              {finding.decisionRationale}
            </p>
          </div>
        </header>

        <Divider className="my-7" />

        {/* THE REASONING CHAIN — the reason this product exists */}
        <ReasoningChain steps={finding.reasoning} revealed={stream.revealed} />

        {!stream.complete && (
          <div className="-mt-2 mb-6">
            <Button size="sm" variant="ghost" onClick={stream.finish}>
              Show all steps
            </Button>
          </div>
        )}

        {stream.complete && (
          <div className="animate-fade-in">
            <Divider className="mb-7" />
            <div className="mb-4 flex items-center justify-between gap-4">
              <Eyebrow>{abstained ? "Why no patch was written" : "The change and what it prevents"}</Eyebrow>
              <Button size="sm" variant="ghost" onClick={stream.replay}>
                Replay reasoning
              </Button>
            </div>

            {abstained && finding.abstention ? (
              <AbstentionPanel abstention={finding.abstention} />
            ) : finding.fix ? (
              <FixViewer fix={finding.fix} />
            ) : null}

            {/* Sequence CTA — this is what makes three screens feel like one argument */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline bg-card p-5">
              <div className="max-w-lg">
                <Eyebrow>{next ? `Outcome ${index + 2} of 3` : "End of run"}</Eyebrow>
                <p className="mt-1.5 text-body-lg font-medium text-ink">
                  {next
                    ? verdictBlurb[next.verdict]
                    : "Three findings, three different answers, one decision procedure."}
                </p>
              </div>
              {next ? (
                <Link href={`/analysis/${next.id}`}>
                  <Button variant="primary">{NEXT_CUE[next.verdict] ?? "Next outcome"}</Button>
                </Link>
              ) : (
                <Link href="/trend">
                  <Button variant="primary">See two weeks of this</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── evidence rail ── */}
      <aside className="min-w-0 space-y-5 xl:sticky xl:top-20 xl:self-start">
        <Card className="p-5">
          <Eyebrow>Confidence across the chain</Eyebrow>
          <div className="mt-3">
            <ConfidenceTrace
              steps={finding.reasoning}
              revealed={stream.revealed}
              threshold={finding.threshold}
            />
          </div>
          <div className="mt-4">
            <ConfidenceMeter value={finding.confidence} threshold={finding.threshold} />
          </div>
          <p className="mt-3 text-caption leading-relaxed tracking-normal text-mid">
            {finding.confidence >= finding.threshold
              ? "Above the threshold the agent may assert the finding. Whether it may also edit the file is a separate policy question."
              : "Below the threshold the agent is required to abstain. It does not round up."}
          </p>
        </Card>

        <Card className="p-5">
          <Eyebrow>Traversed sub-graph</Eyebrow>
          <p className="mt-1.5 text-caption leading-relaxed tracking-normal text-mid">
            The path the cross-reference steps actually walked. Solid edges are implicated.
          </p>
          <div className="mt-3">
            <DependencyGraph nodes={finding.graph.nodes} edges={finding.graph.edges} />
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow>Commit</Eyebrow>
          <div className="mt-2 space-y-2 text-caption tracking-normal">
            {[
              ["Repository", finding.repo],
              ["Commit", finding.commit],
              ["Message", finding.commitMessage],
              ["Author", finding.author],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="shrink-0 text-faint">{l}</span>
                <span className="truncate text-right text-ink-soft">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}
