"use client";

import { Button, Card, Eyebrow } from "@/components/ui/primitives";
import { org, plans, usage } from "@/data/tenant";
import { cn } from "@/lib/cn";

function Meter({ label, used, included }: { label: string; used: number; included: number | null }) {
  const pct = included ? Math.min(100, Math.round((used / included) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body text-ink">{label}</span>
        <span className="text-caption tracking-normal text-mid tnum">
          {used.toLocaleString()}
          {included ? ` / ${included.toLocaleString()}` : " · unlimited"}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-nested">
        <div
          className={cn("h-full rounded-full", pct > 85 ? "bg-medium" : "bg-ink")}
          style={{ width: included ? `${pct}%` : "100%" }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const current = plans.find((p) => p.id === org.plan)!;

  return (
    <div className="max-w-3xl space-y-8">
      <header className="border-b border-hairline pb-5">
        <h1 className="text-heading-lg font-semibold text-ink">Plan &amp; usage</h1>
        <p className="mt-1.5 text-body text-mid">
          Billed per repository. Seats are unlimited on every plan.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>Current plan</Eyebrow>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-heading font-semibold text-ink">{current.name}</span>
              <span className="text-body text-mid">
                {current.price} {current.cadence}
              </span>
            </div>
            <p className="mt-1.5 text-body text-mid">
              5 repositories × $29 —{" "}
              <span className="text-ink tnum">$145.00</span> next on 1 October 2026.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm">Invoices</Button>
            <Button variant="outline" size="sm">Payment method</Button>
          </div>
        </div>
      </Card>

      <section>
        <Eyebrow>This billing period</Eyebrow>
        <Card className="mt-3 space-y-5 p-5">
          <Meter label="Repositories" used={usage.repositories.used} included={usage.repositories.included} />
          <Meter label="Scans" used={usage.scansThisMonth.used} included={usage.scansThisMonth.included} />
          <Meter label="Autonomous fixes applied" used={usage.autonomousFixes.used} included={usage.autonomousFixes.included} />
        </Card>
      </section>

      <section>
        <Eyebrow>Change plan</Eyebrow>
        <div className="mt-3 grid gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.id === org.plan;
            return (
              <Card key={p.id} className={cn("flex flex-col p-5", isCurrent && "border-ink/25")}>
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium text-ink">{p.name}</span>
                  {isCurrent && (
                    <span className="rounded-control bg-ink px-2 py-0.5 text-micro font-medium uppercase tracking-wider text-inverse">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-heading-sm font-semibold text-ink tnum">{p.price}</span>
                </div>
                <span className="mt-0.5 text-caption tracking-normal text-faint">{p.cadence}</span>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.limits.map((l) => (
                    <li key={l} className="text-caption leading-relaxed tracking-normal text-mid">
                      {l}
                    </li>
                  ))}
                </ul>
                <Button variant={isCurrent ? "ghost" : "outline"} size="sm" className="mt-4 w-full" disabled={isCurrent}>
                  {isCurrent ? "Current plan" : p.id === "enterprise" ? "Talk to us" : "Switch"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
