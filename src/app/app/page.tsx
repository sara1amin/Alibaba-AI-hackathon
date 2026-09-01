"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { repos, fleetTotals, type RepoSummary } from "@/data/repos";
import { Button, Card, Eyebrow, Mono, SeverityChip } from "@/components/ui/primitives";

/**
 * The fleet.
 *
 * This is the screen that separates a platform from a dashboard: the agent
 * watches many repositories, each with its own health, and one of them is
 * mid-scan. Only `checkout-api` has a full recorded run behind it, and the list
 * says so rather than pretending every row drills down.
 */

function RiskDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-caption text-faint tnum">no change</span>;
  const better = delta < 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-caption font-medium tracking-normal tnum", better ? "text-verified" : "text-high")}>
      {/* Arrow follows the number, colour follows the meaning: risk falling is
          a down arrow AND green, because lower risk is better. */}
      <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden className={better ? "rotate-180" : ""}>
        <path d="M4.5 7.5V1.5M1.8 4.2 4.5 1.5l2.7 2.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {Math.abs(delta)}
    </span>
  );
}

function RepoRow({ repo }: { repo: RepoSummary }) {
  const body = (
    <>
      <div className="flex min-w-0 flex-[2] items-center gap-3">
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            repo.status === "scanning" ? "animate-pulse-dot bg-medium"
              : repo.status === "paused" ? "bg-faint"
              : repo.riskScore > 50 ? "bg-high" : "bg-verified",
          )}
          aria-hidden
        />
        <span className="min-w-0">
          <Mono className="block truncate text-body text-ink">{repo.name}</Mono>
          <span className="mt-0.5 block truncate text-caption tracking-normal text-faint">
            {repo.language} · {repo.workflows} workflows · {repo.lastScan}
          </span>
        </span>
      </div>

      <div className="flex w-24 shrink-0 flex-col items-start">
        <span className="text-subheading font-semibold text-ink tnum">{repo.riskScore}</span>
        <RiskDelta delta={repo.riskDelta} />
      </div>

      <div className="w-32 shrink-0">
        {repo.openFindings > 0 ? (
          <span className="flex flex-col items-start gap-1">
            <span className="text-body text-ink tnum">{repo.openFindings} open</span>
            {repo.topSeverity && <SeverityChip severity={repo.topSeverity} />}
          </span>
        ) : (
          <span className="text-body text-mid">clear</span>
        )}
      </div>

      <div className="hidden w-28 shrink-0 xl:block">
        <span className="text-body text-ink tnum">{repo.autoFixed14d}</span>
        <span className="mt-0.5 block text-caption tracking-normal text-faint">auto-fixed 14d</span>
      </div>

      <div className="w-28 shrink-0 text-right">
        {repo.hasRun ? (
          <span className="inline-flex items-center gap-1.5 text-caption font-medium tracking-normal text-ink">
            Open
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 5h7M5.6 2.1 8.5 5 5.6 7.9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="text-caption tracking-normal text-faint">
            {repo.status === "scanning" ? "scanning…" : "summary only"}
          </span>
        )}
      </div>
    </>
  );

  return (
    <li className="border-t border-hairline first:border-t-0">
      <Link
        href={`/app/repos/${repo.name}`}
        className="flex items-center gap-5 px-5 py-4 transition-colors hover:bg-nested/50"
      >
        {body}
      </Link>
    </li>
  );
}

export default function RepositoriesPage() {
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-5">
        <div>
          <h1 className="text-heading-lg font-semibold text-ink">Repositories</h1>
          <p className="mt-1.5 max-w-2xl text-body text-mid">
            {fleetTotals.repos} connected · {fleetTotals.openFindings} open findings ·{" "}
            {fleetTotals.autoFixed14d} fixed autonomously in the last 14 days.
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="primary">Connect repository</Button>
        </Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Average risk", v: fleetTotals.avgRisk, s: "across the fleet" },
          { l: "Open findings", v: fleetTotals.openFindings, s: "needing a decision" },
          { l: "Auto-fixed", v: fleetTotals.autoFixed14d, s: "last 14 days" },
          { l: "Reached production", v: 0, s: "since 25 August" },
        ].map((s) => (
          <Card key={s.l} className="p-5">
            <Eyebrow>{s.l}</Eyebrow>
            <div className="mt-1 text-heading-sm font-semibold text-ink tnum">{s.v}</div>
            <div className="mt-0.5 text-caption tracking-normal text-faint">{s.s}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-5 border-b border-hairline bg-nested/40 px-5 py-2.5">
          <span className="flex-[2] text-micro font-medium uppercase tracking-wider text-faint">Repository</span>
          <span className="w-24 shrink-0 text-micro font-medium uppercase tracking-wider text-faint">Risk</span>
          <span className="w-32 shrink-0 text-micro font-medium uppercase tracking-wider text-faint">Findings</span>
          <span className="hidden w-28 shrink-0 text-micro font-medium uppercase tracking-wider text-faint xl:block">Autonomous</span>
          <span className="w-28 shrink-0" />
        </div>
        <ul>
          {repos.map((r) => (
            <RepoRow key={r.id} repo={r} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
