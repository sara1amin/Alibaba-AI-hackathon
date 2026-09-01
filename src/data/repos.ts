import type { Severity } from "@/lib/types";

/**
 * The org's connected repositories.
 *
 * `checkout-api` is the one with the full recorded run behind it — the others
 * carry summary state only. That asymmetry is deliberate and honest: the demo
 * drills into one repository, and the list makes clear the product watches a
 * fleet rather than a single project.
 */
export interface RepoSummary {
  id: string;
  name: string;
  fullName: string;
  language: string;
  defaultBranch: string;
  /** 0–100, lower is healthier. Same scale as the trend chart. */
  riskScore: number;
  /** Change over the last 14 days. Negative is improvement. */
  riskDelta: number;
  openFindings: number;
  topSeverity: Severity | null;
  autoFixed14d: number;
  lastScan: string;
  status: "active" | "scanning" | "paused";
  /** Only this repo has a full recorded run to drill into. */
  hasRun: boolean;
  workflows: number;
}

export const repos: RepoSummary[] = [
  {
    id: "repo_01",
    name: "checkout-api",
    fullName: "acme-payments/checkout-api",
    language: "TypeScript",
    defaultBranch: "main",
    riskScore: 27,
    riskDelta: -51,
    openFindings: 3,
    topSeverity: "critical",
    autoFixed14d: 109,
    lastScan: "2 minutes ago",
    status: "active",
    hasRun: true,
    workflows: 9,
  },
  {
    id: "repo_02",
    name: "ledger-service",
    fullName: "acme-payments/ledger-service",
    language: "Go",
    defaultBranch: "main",
    riskScore: 19,
    riskDelta: -22,
    openFindings: 1,
    topSeverity: "medium",
    autoFixed14d: 41,
    lastScan: "18 minutes ago",
    status: "active",
    hasRun: false,
    workflows: 6,
  },
  {
    id: "repo_03",
    name: "merchant-dashboard",
    fullName: "acme-payments/merchant-dashboard",
    language: "TypeScript",
    defaultBranch: "main",
    riskScore: 44,
    riskDelta: -8,
    openFindings: 6,
    topSeverity: "high",
    autoFixed14d: 27,
    lastScan: "1 hour ago",
    status: "active",
    hasRun: false,
    workflows: 12,
  },
  {
    id: "repo_04",
    name: "fraud-rules",
    fullName: "acme-payments/fraud-rules",
    language: "Python",
    defaultBranch: "main",
    riskScore: 61,
    riskDelta: 4,
    openFindings: 9,
    topSeverity: "critical",
    autoFixed14d: 12,
    lastScan: "scanning…",
    status: "scanning",
    hasRun: false,
    workflows: 4,
  },
  {
    id: "repo_05",
    name: "infra-terraform",
    fullName: "acme-payments/infra-terraform",
    language: "HCL",
    defaultBranch: "main",
    riskScore: 33,
    riskDelta: -15,
    openFindings: 2,
    topSeverity: "medium",
    autoFixed14d: 18,
    lastScan: "4 hours ago",
    status: "paused",
    hasRun: false,
    workflows: 7,
  },
];

/** Repositories offered during onboarding that are not yet connected. */
export const availableRepos = [
  { fullName: "acme-payments/webhooks-relay", language: "Go", workflows: 3, private: true },
  { fullName: "acme-payments/settlement-batch", language: "Java", workflows: 5, private: true },
  { fullName: "acme-payments/docs-site", language: "MDX", workflows: 2, private: false },
];

export const fleetTotals = {
  repos: repos.length,
  openFindings: repos.reduce((a, r) => a + r.openFindings, 0),
  autoFixed14d: repos.reduce((a, r) => a + r.autoFixed14d, 0),
  avgRisk: Math.round(repos.reduce((a, r) => a + r.riskScore, 0) / repos.length),
};
