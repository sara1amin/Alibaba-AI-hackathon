"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useSnapshot } from "@/components/ModeProvider";
import { RunHeader } from "@/components/RunHeader";
import { VerdictCard } from "@/components/VerdictCard";
import { TrendChart } from "@/components/TrendChart";
import { LoadingState } from "@/components/LoadingState";
import { Button, Card, CardBody, Eyebrow, Mono } from "@/components/ui/primitives";
import { trendMarkers } from "@/data/trend";
import { repos } from "@/data/repos";

const ORDER = ["auto_fix", "flag_for_review", "abstain"] as const;

/**
 * A single repository.
 *
 * Only `checkout-api` has a recorded run behind it. The others render an honest
 * pending state rather than fabricated findings — inventing three outcomes for
 * every repo would undercut the one claim the product actually makes.
 */
export function RepoOverview({ repoName }: { repoName: string }) {
  const { snapshot, loading } = useSnapshot();
  const repo = repos.find((r) => r.name === repoName);

  if (!repo) notFound();
  if (!repo.hasRun) return <PendingRepo name={repo.name} status={repo.status} findings={repo.openFindings} />;
  if (loading || !snapshot) return <LoadingState />;

  const { run, findings, trend, meta } = snapshot;
  const ordered = [...findings].sort(
    (a, b) => ORDER.indexOf(a.verdict as never) - ORDER.indexOf(b.verdict as never),
  );
  const latest = trend[trend.length - 1];
  const first = trend[0];

  return (
    <div className="space-y-9">
      <RunHeader run={run} meta={meta} />

      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Eyebrow>One commit · one decision procedure · three answers</Eyebrow>
            <h2 className="mt-2 text-heading font-semibold leading-tight text-ink">
              The same agent, the same 70% threshold, three different outcomes —
              because the evidence differed.
            </h2>
            <p className="mt-2.5 text-body-lg leading-relaxed text-mid">
              A tool that always says yes is easy to build and impossible to trust.
              PipelineGuard acts only where the change is provably safe, escalates
              where the fix is a judgement call, and says so plainly when it cannot
              establish the facts.
            </p>
          </div>
          <Link href={`/app/analysis/${ordered[0].id}`}>
            <Button variant="primary">Walk the three outcomes</Button>
          </Link>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {ordered.map((f, i) => (
            <VerdictCard key={f.id} finding={f} index={i} />
          ))}
        </div>
      </section>

      <section>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-6 px-5 pt-5">
            <div className="max-w-xl">
              <Eyebrow>Pipeline health · 14 days</Eyebrow>
              <h2 className="mt-1.5 text-heading-sm font-semibold text-ink">
                Risk down {first.riskScore - latest.riskScore} points since PipelineGuard was enabled
              </h2>
              <p className="mt-1.5 text-body leading-relaxed text-mid">
                Not a snapshot. Two weeks of commits, with the agent&apos;s autonomous
                share growing as it earned authority — and nothing reaching production
                undetected since 25 August.
              </p>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { l: "Risk today", v: latest.riskScore, s: `from ${first.riskScore}` },
                { l: "Auto-fixed", v: trend.reduce((a, d) => a + d.autoFixed, 0), s: "14 days" },
                { l: "Reached prod", v: trend.reduce((a, d) => a + d.escaped, 0), s: "all in week one — none since" },
              ].map((s) => (
                <div key={s.l}>
                  <Eyebrow>{s.l}</Eyebrow>
                  <dd className="mt-1 text-heading-sm font-semibold text-ink tnum">{s.v}</dd>
                  <dd className="text-caption tracking-normal text-faint">{s.s}</dd>
                </div>
              ))}
            </dl>
          </div>
          <CardBody className="mt-5">
            <TrendChart data={trend} markers={trendMarkers} />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

/** Repos connected but without a deep run yet. Honest empty state. */
function PendingRepo({
  name, status, findings,
}: { name: string; status: string; findings: number }) {
  const scanning = status === "scanning";
  return (
    <div className="space-y-7">
      <header className="border-b border-hairline pb-5">
        <Mono className="text-mid">acme-payments/{name}</Mono>
        <h1 className="mt-2 text-heading-lg font-semibold text-ink">{name}</h1>
      </header>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-md">
          <span
            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border ${
              scanning ? "border-medium/40 text-medium" : "border-hairline text-mid"
            }`}
            aria-hidden
          >
            {scanning ? (
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-current" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M12 12l3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
          </span>

          <h2 className="mt-4 text-subheading font-medium text-ink">
            {scanning ? "First deep scan in progress" : "Summary monitoring only"}
          </h2>
          <p className="mt-2 text-body leading-relaxed text-mid">
            {scanning
              ? `Building the dependency graph for ${name}. Reasoning chains appear here as each finding completes.`
              : `${name} is monitored for risk scoring, and ${findings} finding${findings === 1 ? "" : "s"} ${findings === 1 ? "is" : "are"} open. Full reasoning chains are recorded for repositories on continuous analysis.`}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/app/repos/checkout-api">
              <Button variant="primary">See a completed run</Button>
            </Link>
            <Link href="/app">
              <Button variant="outline">Back to repositories</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
