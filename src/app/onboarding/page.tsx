"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button, Card, Eyebrow, Mono } from "@/components/ui/primitives";
import { useSession } from "@/components/session/SessionProvider";
import { repos, availableRepos } from "@/data/repos";
import { cn } from "@/lib/cn";

/**
 * Connect repositories.
 *
 * Two beats: pick what to watch, then a scan that visibly runs. The scan matters
 * — it is the first moment the product does something rather than describing
 * itself, and it sets the expectation that findings arrive with reasoning
 * attached rather than as a list.
 */

const ALL = [
  ...repos.map((r) => ({ fullName: r.fullName, language: r.language, workflows: r.workflows, private: true })),
  ...availableRepos,
];

const SCAN_STEPS = [
  "Installing read-only GitHub App",
  "Enumerating workflows and reusable calls",
  "Building the pipeline dependency graph",
  "Resolving secrets, roles and trust policies",
  "Running the first analysis pass",
];

export default function OnboardingPage() {
  const { status, completeOnboarding } = useSession();
  const router = useRouter();

  const [selected, setSelected] = React.useState<string[]>(
    repos.slice(0, 3).map((r) => r.fullName),
  );
  const [phase, setPhase] = React.useState<"pick" | "scanning">("pick");
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/signin");
  }, [status, router]);

  // Scan progression. Timings are uneven on purpose — a uniform tick reads fake.
  React.useEffect(() => {
    if (phase !== "scanning") return;
    if (step >= SCAN_STEPS.length) {
      const done = window.setTimeout(() => {
        completeOnboarding();
        router.push("/app");
      }, 700);
      return () => window.clearTimeout(done);
    }
    const delays = [620, 940, 1380, 1120, 1540];
    const t = window.setTimeout(() => setStep((s) => s + 1), delays[step]);
    return () => window.clearTimeout(t);
  }, [phase, step, completeOnboarding, router]);

  function toggle(fullName: string) {
    setSelected((s) =>
      s.includes(fullName) ? s.filter((n) => n !== fullName) : [...s, fullName],
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between border-b border-hairline px-5">
        <div className="flex items-center gap-2.5">
          <Mark />
          <span className="text-body font-semibold tracking-tight text-ink">PipelineGuard</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        {phase === "pick" ? (
          <>
            <Eyebrow>Step 1 of 1 · Acme Payments</Eyebrow>
            <h1 className="mt-2.5 text-heading font-semibold leading-tight text-ink">
              Which repositories should PipelineGuard watch?
            </h1>
            <p className="mt-2.5 text-body-lg leading-relaxed text-mid">
              It reads workflow definitions and their dependency graph. It does not
              read application source, and it cannot write anything until you grant
              a policy that allows it.
            </p>

            <Card className="mt-6 overflow-hidden p-0">
              <ul>
                {ALL.map((r, i) => {
                  const on = selected.includes(r.fullName);
                  return (
                    <li key={r.fullName} className={cn(i > 0 && "border-t border-hairline")}>
                      <button
                        type="button"
                        onClick={() => toggle(r.fullName)}
                        aria-pressed={on}
                        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-nested/50"
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-small border transition-colors",
                            on ? "border-ink bg-ink text-inverse" : "border-hairline-strong",
                          )}
                          aria-hidden
                        >
                          {on && (
                            <svg width="10" height="10" viewBox="0 0 10 10">
                              <path d="M1.6 5.2 3.9 7.5 8.4 2.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <Mono className="block truncate text-ink">{r.fullName}</Mono>
                          <span className="mt-0.5 block text-caption tracking-normal text-faint">
                            {r.language} · {r.workflows} workflows
                          </span>
                        </span>
                        {r.private && (
                          <span className="shrink-0 rounded-control border border-hairline px-2 py-0.5 text-micro uppercase tracking-wider text-faint">
                            private
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <span className="text-caption tracking-normal text-mid tnum">
                {selected.length} of {ALL.length} selected
              </span>
              <Button
                variant="primary"
                disabled={selected.length === 0}
                onClick={() => setPhase("scanning")}
              >
                Start first scan
              </Button>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>Scanning {selected.length} repositories</Eyebrow>
            <h1 className="mt-2.5 text-heading font-semibold leading-tight text-ink">
              Building the dependency graph
            </h1>
            <p className="mt-2.5 text-body-lg leading-relaxed text-mid">
              The first pass is the slow one — it resolves every workflow, reusable
              call and secret edge. Later scans are incremental.
            </p>

            <Card className="mt-6 p-5">
              <ol className="space-y-3.5">
                {SCAN_STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
                          done ? "border-verified/50 text-verified"
                            : active ? "border-ink/40 text-ink"
                            : "border-hairline text-faint",
                        )}
                        aria-hidden
                      >
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <path d="M1.6 5.2 3.9 7.5 8.4 2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : active ? (
                          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
                        ) : null}
                      </span>
                      <span className={cn("text-body", done ? "text-mid" : active ? "text-ink" : "text-faint")}>
                        {s}
                      </span>
                      {active && (
                        <span className="relative ml-auto h-1 w-20 overflow-hidden rounded-full bg-nested">
                          <span className="absolute inset-y-0 w-1/3 animate-sweep rounded-full bg-hairline-strong" />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Card>

            <p className="mt-5 text-caption leading-relaxed tracking-normal text-faint">
              You can leave this page — scanning continues and you will be notified
              when the first findings are ready.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
