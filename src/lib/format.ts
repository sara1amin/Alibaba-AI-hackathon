import type { Severity, Verdict } from "./types";

export const verdictLabel: Record<Verdict, string> = {
  auto_fix: "Auto-fixed",
  flag_for_review: "Flagged for review",
  abstain: "Abstained",
};

/** Short form for dense contexts (queue rail, tabs). */
export const verdictShort: Record<Verdict, string> = {
  auto_fix: "Auto-fix",
  flag_for_review: "Flag",
  abstain: "Abstain",
};

/**
 * One line per verdict, written for someone who has never seen the tool.
 * These carry the pitch, so they are content, not chrome.
 */
export const verdictBlurb: Record<Verdict, string> = {
  auto_fix: "Provably safe to apply. Applied without asking.",
  flag_for_review: "Real and reachable, but the fix is a judgement call. Escalated with the trade-off spelled out.",
  abstain: "Evidence was insufficient. No score invented, no patch guessed.",
};

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const severityRank: Record<Severity, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4,
};

export const stepKindLabel: Record<string, string> = {
  observation: "Observation",
  cross_reference: "Cross-reference",
  hypothesis: "Hypothesis",
  validation: "Validation",
  decision: "Decision",
};

export const sourceKindLabel: Record<string, string> = {
  file: "file",
  job: "job",
  graph: "graph",
  policy: "policy",
  advisory: "advisory",
  runtime: "runtime",
};

export function ms(n: number): string {
  if (n === 0) return "—";
  if (n < 1000) return `${n}ms`;
  return `${(n / 1000).toFixed(2)}s`;
}

export function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC",
  });
}
