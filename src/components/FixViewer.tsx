"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { ProposedFix } from "@/lib/types";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * Before/after with consequence.
 *
 * Deliberate hierarchy inversion: the consequence sentence is set at 18px and
 * sits ABOVE the patch; the diff is 12px mono below it. A judge watching from
 * four metres away cannot read a diff, and would not remember it if they could.
 * They remember "prevents an external contributor from reading a live Stripe
 * key". So that line gets the typographic weight, and the patch plays support.
 */

type Line = { kind: "add" | "del" | "ctx" | "meta" | "hunk"; text: string };

/** Minimal unified-diff parser. No highlighter dependency — 20 lines beats 200KB. */
function parseDiff(diff: string): Line[] {
  return diff.split("\n").map((raw) => {
    if (raw.startsWith("+++") || raw.startsWith("---")) return { kind: "meta", text: raw };
    if (raw.startsWith("@@")) return { kind: "hunk", text: raw };
    if (raw.startsWith("+")) return { kind: "add", text: raw.slice(1) };
    if (raw.startsWith("-")) return { kind: "del", text: raw.slice(1) };
    return { kind: "ctx", text: raw.startsWith(" ") ? raw.slice(1) : raw };
  });
}

function CheckRow({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) {
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span
        className={cn(
          "mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
          passed ? "border-verified/50 text-verified" : "border-medium/50 text-medium",
        )}
        aria-hidden
      >
        {passed ? (
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.2 4.2 3 6 6.8 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 1.6v2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="4" cy="6.2" r="0.7" fill="currentColor" /></svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <span className={cn("text-body", passed ? "text-ink-soft" : "text-ink")}>{label}</span>
        {detail && <span className="ml-2 font-mono text-[11px] text-mid">{detail}</span>}
      </div>
    </li>
  );
}

export function FixViewer({ fix, className }: { fix: ProposedFix; className?: string }) {
  const lines = React.useMemo(() => parseDiff(fix.diff), [fix.diff]);
  const added = lines.filter((l) => l.kind === "add").length;
  const removed = lines.filter((l) => l.kind === "del").length;

  return (
    <div className={className}>
      {/* CONSEQUENCE — the thing that gets remembered */}
      <div
        className={cn(
          "rounded-nested border p-4",
          fix.applied ? "border-verified/30 bg-verified/[0.07]" : "border-medium/30 bg-medium/[0.07]",
        )}
      >
        <Eyebrow className={fix.applied ? "text-verified" : "text-medium"}>
          {fix.applied ? "What this prevented" : "What this would prevent"}
        </Eyebrow>
        <p className="mt-1.5 text-subheading font-medium leading-snug text-ink">
          {fix.prevents}
        </p>
      </div>

      {/* PATCH */}
      <div className="mt-4 overflow-hidden rounded-nested border border-hairline">
        <div className="flex items-center justify-between gap-3 border-b border-hairline bg-nested/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-caption font-medium uppercase tracking-wider text-mid">
              {fix.applied ? "Applied patch" : "Proposed patch — not applied"}
            </span>
          </div>
          <span className="shrink-0 font-mono text-[11px] tnum">
            <span className="text-verified">+{added}</span>
            <span className="mx-1 text-faint">/</span>
            <span className="text-critical">−{removed}</span>
          </span>
        </div>

        <div className="overflow-x-auto bg-card">
          <table className="w-full border-collapse font-mono text-[12px] leading-[1.65]">
            <tbody>
              {lines.map((l, i) => (
                <tr
                  key={i}
                  className={cn(
                    l.kind === "add" && "bg-verified/[0.09]",
                    l.kind === "del" && "bg-critical/[0.09]",
                    l.kind === "hunk" && "bg-nested/70",
                  )}
                >
                  <td
                    className={cn(
                      "w-7 select-none border-r border-hairline px-2 text-center align-top",
                      l.kind === "add" ? "text-verified" : l.kind === "del" ? "text-critical" : "text-faint",
                    )}
                  >
                    {l.kind === "add" ? "+" : l.kind === "del" ? "−" : ""}
                  </td>
                  <td
                    className={cn(
                      "whitespace-pre px-3 align-top",
                      l.kind === "meta" && "text-faint",
                      l.kind === "hunk" && "text-mid",
                      l.kind === "ctx" && "text-mid",
                      l.kind === "add" && "text-ink",
                      l.kind === "del" && "text-ink-soft line-through decoration-critical/40",
                    )}
                  >
                    {l.text || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLAST RADIUS + VALIDATION */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-nested border border-hairline bg-nested/40 p-4">
          <Eyebrow>Blast radius</Eyebrow>
          <p className="mt-1.5 text-body leading-relaxed text-mid">{fix.blastRadius}</p>
        </div>
        <div className="rounded-nested border border-hairline bg-nested/40 p-4">
          <Eyebrow>Pre-flight checks</Eyebrow>
          <ul className="mt-1">
            {fix.validation.map((v) => (
              <CheckRow key={v.label} {...v} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
