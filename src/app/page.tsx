"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { Button, Card, Eyebrow, Mono, VerdictChip } from "@/components/ui/primitives";
import { plans } from "@/data/tenant";
import { cn } from "@/lib/cn";

/**
 * The front door.
 *
 * The pitch is restraint, so the page has to demonstrate it rather than claim
 * it: the hero states what the agent refuses to do, and the outcome cards give
 * the abstain path equal billing with the fix. A landing page that only sells
 * "we catch everything" would contradict the product.
 */

const STEPS = [
  {
    n: "01",
    title: "Connect a repository",
    body: "A GitHub App with read access to your workflows. No runner changes, no secrets shared, nothing installed in your pipeline.",
  },
  {
    n: "02",
    title: "It builds the dependency graph",
    body: "Triggers, jobs, reusable workflows, secrets, roles and the edges between them — the structure that turns an isolated line of YAML into a credential path.",
  },
  {
    n: "03",
    title: "It decides, and shows you why",
    body: "Every finding carries the chain that produced it: what it observed, what it cross-referenced, what it ruled out, and the confidence it reached.",
  },
];

const OUTCOMES = [
  {
    verdict: "auto_fix" as const,
    title: "It fixes what is provably safe",
    body: "A mutable action tag inside a job that can mint production AWS credentials. The pinned SHA resolves to the tree already running, so the rewrite changes nothing except the ability to change it silently. Applied without asking.",
    stat: "96%",
    statLabel: "confidence · threshold 70%",
  },
  {
    verdict: "flag_for_review" as const,
    title: "It escalates judgement calls",
    body: "An external contributor's code running with a live Stripe key in scope. Real, reachable, critical — and the only safe fix changes who is allowed to run your test suite. That is a product decision, so it goes to a human with the trade-off written out.",
    stat: "91%",
    statLabel: "confident, and still did not edit",
  },
  {
    verdict: "abstain" as const,
    title: "It refuses when it cannot know",
    body: "A deploy script piping a URL into bash, where the URL resolves at organisation scope and is masked in every log. Two readings, four severity levels apart, nothing to separate them. No score invented, no patch guessed.",
    stat: "44%",
    statLabel: "below threshold — abstained",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />

      {/* Hero */}
      <section className="blueprint-grid border-b border-hairline">
        <div className="mx-auto max-w-page px-5 py-18">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-control border border-hairline bg-card px-2.5 py-1 text-caption tracking-normal text-mid">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-verified" aria-hidden />
              Reasoning by Qwen on Alibaba Cloud Model Studio
            </span>

            <h1 className="mt-5 text-display font-semibold text-ink">
              Your CI pipeline runs arbitrary code with production credentials.
            </h1>

            <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-mid">
              PipelineGuard is an agent that reads it, and then does something most
              security tools will not: tells you what it is <em className="not-italic text-ink">not</em> sure
              about. It fixes what is provably safe, escalates what is a judgement
              call, and refuses to score what it cannot establish.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signin">
                <Button variant="primary">Connect a repository</Button>
              </Link>
              <a href="#outcomes">
                <Button variant="outline">See all three outcomes</Button>
              </a>
            </div>

            <p className="mt-4 text-caption tracking-normal text-faint">
              Free for one repository. No card. Read-only GitHub App.
            </p>
          </div>

          {/* Reasoning teaser — the product's actual differentiator, shown not told */}
          <Card className="mt-12 max-w-3xl p-5">
            <Eyebrow>A step from a real reasoning chain</Eyebrow>
            <p className="mt-2.5 text-body-lg font-medium leading-snug text-ink">
              That job holds an OIDC identity token, so the mutable action runs with
              credential-minting authority.
            </p>
            <div className="mt-2.5 flex gap-2.5">
              <span className="mt-[3px] shrink-0 text-caption font-medium uppercase tracking-wider text-faint">
                because
              </span>
              <p className="text-body leading-relaxed text-mid">
                Walking the dependency graph from the step to its enclosing job:
                <Mono className="mx-1 text-ink">load-test</Mono>
                declares <Mono className="text-ink">permissions: id-token: write</Mono>.
                Any code in this job can exchange the token for real AWS credentials.
              </p>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {["job:load-test", "graph:load-test → sts:AssumeRoleWithWebIdentity"].map((s) => (
                <span key={s} className="rounded-small border border-hairline bg-nested/60 px-2 py-1 font-mono text-[11px] text-mid">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Three outcomes */}
      <section id="outcomes" className="border-b border-hairline">
        <div className="mx-auto max-w-page px-5 py-18">
          <Eyebrow>One commit · one decision procedure · three answers</Eyebrow>
          <h2 className="mt-2.5 max-w-3xl text-heading-lg font-semibold leading-tight text-ink">
            A tool that always says yes is easy to build and impossible to trust.
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg leading-relaxed text-mid">
            These three findings came from the same commit, scanned by the same agent
            against the same 70% threshold. It reached three different answers, because
            the evidence differed.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {OUTCOMES.map((o) => (
              <div
                key={o.verdict}
                className={cn(
                  "flex flex-col rounded-card border bg-card p-5 shadow-card",
                  o.verdict === "abstain" ? "border-dashed border-mid/40" : "border-hairline",
                )}
              >
                <VerdictChip verdict={o.verdict} />
                <h3 className="mt-3.5 text-subheading font-medium leading-snug text-ink">{o.title}</h3>
                <p className="mt-2.5 flex-1 text-body leading-relaxed text-mid">{o.body}</p>
                <div className="mt-5 border-t border-hairline pt-4">
                  <div className="text-heading-sm font-semibold text-ink tnum">{o.stat}</div>
                  <div className="mt-0.5 text-caption tracking-normal text-faint">{o.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-hairline">
        <div className="mx-auto max-w-page px-5 py-18">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-2.5 max-w-2xl text-heading-lg font-semibold leading-tight text-ink">
            Three steps, and none of them involve changing your pipeline.
          </h2>

          <div className="mt-8 grid gap-x-8 gap-y-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border-t border-hairline pt-5">
                <Mono className="text-faint">{s.n}</Mono>
                <h3 className="mt-2 text-subheading font-medium text-ink">{s.title}</h3>
                <p className="mt-2 text-body leading-relaxed text-mid">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-hairline">
        <div className="mx-auto max-w-page px-5 py-18">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-2.5 text-heading-lg font-semibold leading-tight text-ink">
            Priced per repository, not per seat.
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg leading-relaxed text-mid">
            Security tooling that charges per seat gets rolled out to one team and
            stops there. Everyone who can read your pipeline should be able to read
            its findings.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id} className={cn("flex flex-col p-5", p.id === "team" && "border-ink/25")}>
                <div className="flex items-center justify-between">
                  <span className="text-subheading font-medium text-ink">{p.name}</span>
                  {p.id === "team" && (
                    <span className="rounded-control bg-ink px-2 py-0.5 text-micro font-medium uppercase tracking-wider text-inverse">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-heading font-semibold text-ink tnum">{p.price}</span>
                  <span className="text-caption tracking-normal text-mid">{p.cadence}</span>
                </div>
                <p className="mt-2.5 text-body leading-relaxed text-mid">{p.blurb}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.limits.map((l) => (
                    <li key={l} className="flex gap-2.5 text-body text-ink-soft">
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="mt-1 shrink-0 text-verified">
                        <path d="M2 6.2 4.6 8.8 10 3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {l}
                    </li>
                  ))}
                </ul>
                <Link href="/signin" className="mt-5">
                  <Button variant={p.id === "team" ? "primary" : "outline"} className="w-full">
                    {p.id === "enterprise" ? "Talk to us" : "Start free"}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto max-w-page px-5 py-18">
          <div className="max-w-2xl">
            <h2 className="text-heading-lg font-semibold leading-tight text-ink">
              See the reasoning before you trust the verdict.
            </h2>
            <p className="mt-3 text-body-lg leading-relaxed text-mid">
              Connect one repository and read the first chain it produces. If the
              argument does not hold up, you will be able to tell — which is rather
              the point.
            </p>
            <Link href="/signin" className="mt-6 inline-block">
              <Button variant="primary">Connect a repository</Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
