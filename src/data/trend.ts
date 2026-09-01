import type { TrendPoint } from "@/lib/types";

/**
 * 14 days on acme-payments/checkout-api, from PipelineGuard's first scan.
 *
 * The shape is the story: risk falls as the backlog is worked down, auto-fixes
 * rise as the agent earns authority on behaviour-preserving classes, and
 * `escaped` (issues that reached production undetected) goes to zero and stays
 * there. Day 6 ticks back up — a dependency bump reintroduced two findings —
 * because a monotonic line looks fabricated and real pipelines are not monotonic.
 */
export const trend: TrendPoint[] = [
  { date: "2026-08-19", commits: 14, riskScore: 78, autoFixed: 0, flagged: 9, abstained: 3, escaped: 2 },
  { date: "2026-08-20", commits: 11, riskScore: 74, autoFixed: 3, flagged: 8, abstained: 2, escaped: 1 },
  { date: "2026-08-21", commits: 17, riskScore: 69, autoFixed: 6, flagged: 7, abstained: 3, escaped: 1 },
  { date: "2026-08-22", commits: 6, riskScore: 66, autoFixed: 4, flagged: 6, abstained: 1, escaped: 0 },
  { date: "2026-08-23", commits: 3, riskScore: 65, autoFixed: 2, flagged: 6, abstained: 1, escaped: 0 },
  { date: "2026-08-24", commits: 19, riskScore: 58, autoFixed: 9, flagged: 5, abstained: 2, escaped: 0 },
  { date: "2026-08-25", commits: 22, riskScore: 63, autoFixed: 7, flagged: 8, abstained: 4, escaped: 1 },
  { date: "2026-08-26", commits: 16, riskScore: 54, autoFixed: 11, flagged: 5, abstained: 2, escaped: 0 },
  { date: "2026-08-27", commits: 21, riskScore: 47, autoFixed: 14, flagged: 4, abstained: 3, escaped: 0 },
  { date: "2026-08-28", commits: 18, riskScore: 41, autoFixed: 13, flagged: 3, abstained: 2, escaped: 0 },
  { date: "2026-08-29", commits: 9, riskScore: 38, autoFixed: 8, flagged: 3, abstained: 1, escaped: 0 },
  { date: "2026-08-30", commits: 5, riskScore: 35, autoFixed: 5, flagged: 2, abstained: 1, escaped: 0 },
  { date: "2026-08-31", commits: 20, riskScore: 30, autoFixed: 16, flagged: 2, abstained: 2, escaped: 0 },
  { date: "2026-09-01", commits: 12, riskScore: 27, autoFixed: 11, flagged: 1, abstained: 1, escaped: 0 },
];

/** Narrative pins rendered as annotations on the chart. */
export const trendMarkers: { date: string; label: string; detail: string }[] = [
  {
    date: "2026-08-19",
    label: "PipelineGuard enabled",
    detail: "First full scan: 12 findings across 9 workflows, 2 already in production.",
  },
  {
    date: "2026-08-24",
    label: "Autonomous pinning authorised",
    detail: "Owner granted PG-POLICY-14 — behaviour-preserving rewrites apply without review.",
  },
  {
    date: "2026-08-25",
    label: "Dependency bump regression",
    detail: "A bulk action upgrade reintroduced 2 unpinned refs. Caught same day, not in production.",
  },
  {
    date: "2026-09-01",
    label: "Today's run",
    detail: "3 findings on 9f4c1ab — one applied, one flagged, one abstained.",
  },
];
