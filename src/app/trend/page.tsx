"use client";

import { useSnapshot } from "@/components/ModeProvider";
import { TrendChart } from "@/components/TrendChart";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardBody, Eyebrow, Stat } from "@/components/ui/primitives";
import { trendMarkers } from "@/data/trend";
import { shortDate } from "@/lib/format";

export default function TrendPage() {
  const { snapshot, loading } = useSnapshot();
  if (loading || !snapshot) return <LoadingState />;

  const { trend } = snapshot;
  const first = trend[0];
  const latest = trend[trend.length - 1];
  const totals = trend.reduce(
    (a, d) => ({
      autoFixed: a.autoFixed + d.autoFixed,
      flagged: a.flagged + d.flagged,
      abstained: a.abstained + d.abstained,
      commits: a.commits + d.commits,
      escaped: a.escaped + d.escaped,
    }),
    { autoFixed: 0, flagged: 0, abstained: 0, commits: 0, escaped: 0 },
  );
  const handled = totals.autoFixed + totals.flagged + totals.abstained;
  const autonomousShare = Math.round((totals.autoFixed / handled) * 100);

  return (
    <div className="space-y-8">
      <header className="border-b border-hairline pb-5">
        <Eyebrow>Pipeline health · acme-payments/checkout-api</Eyebrow>
        <h1 className="mt-2 max-w-3xl text-heading-lg font-semibold leading-tight text-ink">
          Two weeks of a pipeline getting healthier, one commit at a time
        </h1>
        <p className="mt-2 max-w-2xl text-body-lg leading-relaxed text-mid">
          {totals.commits} commits, {handled} findings handled. The value is not the
          first scan — it is that the line keeps going down while the team keeps
          shipping.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Risk score", v: latest.riskScore, s: `down from ${first.riskScore} on ${shortDate(first.date)}` },
          { l: "Handled autonomously", v: `${autonomousShare}%`, s: `${totals.autoFixed} of ${handled} findings` },
          { l: "Escalated to a human", v: totals.flagged, s: "each with the trade-off written out" },
          { l: "Reached production", v: totals.escaped, s: "all before day 7 — none since" },
        ].map((s) => (
          <Card key={s.l} className="p-5">
            <Stat label={s.l} value={s.v} sub={s.s} />
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="pt-5">
          <TrendChart data={trend} markers={trendMarkers} />
        </CardBody>
      </Card>

      <section>
        <Eyebrow>What happened</Eyebrow>
        <ol className="mt-3 space-y-px overflow-hidden rounded-card border border-hairline">
          {trendMarkers.map((m, i) => {
            const point = trend.find((t) => t.date === m.date);
            return (
              <li
                key={m.date}
                className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 bg-card px-5 py-4"
                style={{ borderTop: i === 0 ? undefined : "1px solid rgb(var(--hairline))" }}
              >
                <span className="w-16 shrink-0 font-mono text-[12px] text-faint">
                  {shortDate(m.date)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-body font-medium text-ink">{m.label}</span>
                  <span className="mt-0.5 block text-body leading-relaxed text-mid">{m.detail}</span>
                </span>
                {point && (
                  <span className="shrink-0 font-mono text-[12px] text-mid tnum">
                    risk {point.riskScore}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
