"use client";

import * as React from "react";
import { Avatar } from "@/components/Avatar";
import { Button, Card, Divider, Eyebrow, Mono } from "@/components/ui/primitives";
import { members, org } from "@/data/tenant";
import { cn } from "@/lib/cn";

/**
 * Policy & team.
 *
 * The most important screen in the shell after the reasoning view, because it
 * makes the numbers in the chain into things you own. "Confidence 96% clears
 * the 70% action threshold" is a much stronger claim once the reader can see
 * the threshold is a setting they control, and that autonomous authority is
 * granted per change-class rather than as one on/off switch.
 */

const POLICIES = [
  {
    id: "PG-POLICY-14",
    name: "Behaviour-preserving rewrites",
    detail:
      "Pin a mutable reference to the SHA it already resolves to. The agent must prove the resulting tree is byte-identical before applying.",
    granted: true,
    autonomous: true,
  },
  {
    id: "PG-POLICY-22",
    name: "Changes to workflow triggers",
    detail:
      "Any edit altering who or what can start a workflow. Withheld from autonomous application — these change product behaviour, not just security posture.",
    granted: false,
    autonomous: false,
  },
  {
    id: "PG-POLICY-03",
    name: "Untrusted execution paths",
    detail:
      "Detection and escalation of pull_request_target and equivalent privileged-context execution. Reporting only.",
    granted: true,
    autonomous: false,
  },
  {
    id: "PG-POLICY-01",
    name: "Abstain below threshold",
    detail:
      "Below the action threshold the agent must report the gap rather than assert a severity. Cannot be disabled.",
    granted: true,
    autonomous: false,
    locked: true,
  },
];

function Toggle({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange?: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-ink" : "bg-hairline-strong",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-card transition-transform",
          on ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [threshold, setThreshold] = React.useState(70);
  const [policies, setPolicies] = React.useState(POLICIES);

  return (
    <div className="max-w-3xl space-y-8">
      <header className="border-b border-hairline pb-5">
        <h1 className="text-heading-lg font-semibold text-ink">Policy &amp; team</h1>
        <p className="mt-1.5 text-body text-mid">
          What the agent is allowed to decide on its own, and who can change that.
        </p>
      </header>

      {/* Threshold */}
      <Card className="p-5">
        <Eyebrow>Action threshold</Eyebrow>
        <h2 className="mt-1.5 text-subheading font-medium text-ink">
          Below this confidence, the agent abstains
        </h2>
        <p className="mt-2 text-body leading-relaxed text-mid">
          Clearing the threshold authorises the agent to <em className="not-italic text-ink">assert</em> a
          finding. Whether it may also edit a file is a separate grant, below.
          Lowering this produces more findings and more noise; raising it produces
          more abstentions.
        </p>

        <div className="mt-5 flex items-center gap-5">
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            aria-label="Action threshold"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-nested accent-ink"
          />
          <span className="w-16 shrink-0 text-right text-heading-sm font-semibold text-ink tnum">
            {threshold}%
          </span>
        </div>

        <p className="mt-3 text-caption leading-relaxed tracking-normal text-faint">
          {threshold <= 60
            ? "Aggressive. The agent will assert findings it is not confident in — expect false positives."
            : threshold >= 85
              ? "Conservative. Genuine issues will be reported as abstentions rather than findings."
              : "Balanced. Today's run abstained once, at 44% — well below this bar."}
        </p>
      </Card>

      {/* Policies */}
      <section>
        <Eyebrow>Autonomous authority</Eyebrow>
        <p className="mt-1.5 max-w-2xl text-body leading-relaxed text-mid">
          Authority is granted per change-class, never as a single switch. The agent
          may apply a class only when it can prove the change belongs to it.
        </p>

        <Card className="mt-4 overflow-hidden p-0">
          {policies.map((p, i) => (
            <div key={p.id} className={cn("flex items-start gap-4 px-5 py-4", i > 0 && "border-t border-hairline")}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body font-medium text-ink">{p.name}</span>
                  <Mono className="text-faint">{p.id}</Mono>
                  {p.locked && (
                    <span className="rounded-control border border-hairline px-1.5 text-micro uppercase tracking-wider text-faint">
                      locked
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-body leading-relaxed text-mid">{p.detail}</p>
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-control border px-2 py-0.5 text-micro font-medium uppercase tracking-wider",
                    p.autonomous ? "border-verified/40 text-verified" : "border-hairline text-mid",
                  )}
                >
                  {p.autonomous ? "applies autonomously" : "reports only"}
                </span>
              </div>
              <div className="pt-1">
                <Toggle
                  on={p.granted}
                  disabled={p.locked}
                  onChange={() =>
                    setPolicies((ps) =>
                      ps.map((x) => (x.id === p.id ? { ...x, granted: !x.granted } : x)),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Team */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Team</Eyebrow>
            <p className="mt-1.5 text-body text-mid">
              {members.length} members in {org.name}.
            </p>
          </div>
          <Button variant="outline" size="sm">Invite member</Button>
        </div>

        <Card className="mt-4 overflow-hidden p-0">
          {members.map((m, i) => (
            <div key={m.id} className={cn("flex items-center gap-3.5 px-5 py-3.5", i > 0 && "border-t border-hairline")}>
              <Avatar name={m.name} hue={m.avatarHue} size={30} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-body text-ink">{m.name}</span>
                <span className="block truncate text-caption tracking-normal text-faint">{m.email}</span>
              </div>
              <span className="hidden w-28 shrink-0 text-caption tracking-normal text-faint sm:block">
                {m.lastActive}
              </span>
              <span className="w-20 shrink-0 text-right text-caption capitalize tracking-normal text-mid">
                {m.role}
              </span>
            </div>
          ))}
        </Card>
      </section>

      {/* Integration */}
      <section>
        <Eyebrow>Integration</Eyebrow>
        <Card className="mt-3 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden fill="currentColor" className="text-ink">
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="block text-body font-medium text-ink">GitHub App installed</span>
              <span className="block text-caption tracking-normal text-mid">
                Installation <Mono className="text-ink">{org.githubInstallId}</Mono> ·{" "}
                <Mono>contents: read</Mono>, <Mono>actions: read</Mono>
              </span>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <Divider className="my-4" />
          <p className="text-caption leading-relaxed tracking-normal text-faint">
            Write access is requested per pull request, at the moment a policy grants
            an autonomous fix — never held standing.
          </p>
        </Card>
      </section>
    </div>
  );
}
