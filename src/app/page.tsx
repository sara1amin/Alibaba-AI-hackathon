"use client";

import Link from "next/link";
import { useSnapshot } from "@/components/ModeProvider";
import { RunHeader } from "@/components/RunHeader";
import { VerdictCard } from "@/components/VerdictCard";
import { TrendChart } from "@/components/TrendChart";
import { LoadingState } from "@/components/LoadingState";
import { Button, Card, CardBody, Eyebrow } from "@/components/ui/primitives";
import { trendMarkers } from "@/data/trend";

const ORDER = ["auto_fix", "flag_for_review", "abstain"] as const;

export default function OverviewPage() {
  const { snapshot, loading } = useSnapshot();

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

      {/* The thesis. Stated once, in plain words, above everything else. */}
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
          <Link href={`/analysis/${ordered[0].id}`}>
            <Button variant="primary">Walk the three outcomes</Button>
          </Link>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {ordered.map((f, i) => (
            <VerdictCard key={f.id} finding={f} index={i} />
          ))}
        </div>
      </section>

      {/* Trend */}
      <section>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-6 px-5 pt-5">
            <div className="max-w-xl">
              <Eyebrow>Pipeline health · 14 days</Eyebrow>
              <h2 className="mt-1.5 text-heading-sm font-semibold text-ink">
                Risk down {first.riskScore - latest.riskScore} points since PipelineGuard was enabled
              </h2>
              <p className="mt-1.5 text-body leading-relaxed text-mid">
                Not a snapshot. Two weeks of commits on one repository, with the
                agent&apos;s autonomous share growing as it earned authority — and
                nothing reaching production undetected since 25 August.
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
