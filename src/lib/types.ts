/**
 * PipelineGuard wire types.
 *
 * This is the contract the FastAPI gateway (Workstream 3) is expected to
 * satisfy. Everything the UI renders comes from these shapes — swapping the
 * mock source for the real gateway should require no component changes.
 * If the gateway's field names differ, adapt in `src/lib/adapters.ts` only.
 */

export type Verdict = "auto_fix" | "flag_for_review" | "abstain";
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** Where a reasoning step got its evidence. Drives the source chips in the UI. */
export type SourceKind =
  | "file"        /* a line range in the repository        */
  | "job"         /* a CI job / workflow node              */
  | "graph"       /* an edge in the pipeline dependency graph */
  | "policy"      /* an organisation policy rule           */
  | "advisory"    /* an external CVE / advisory record     */
  | "runtime";    /* an observed value from a previous run */

export interface EvidenceRef {
  kind: SourceKind;
  /** Human label, e.g. ".github/workflows/deploy.yml:42" or "job:deploy-prod" */
  ref: string;
  /** Verbatim excerpt. Kept short — the UI truncates past ~3 lines. */
  excerpt?: string;
  /** Optional deep link once the gateway can resolve one. */
  href?: string;
}

/**
 * One link in the agent's reasoning chain.
 *
 * The UI's central claim is that each step is falsifiable: every `claim` has a
 * `because`, and every `because` is backed by `sources`. A step with no sources
 * renders with a visible "unsourced" marker rather than being hidden.
 */
export interface ReasoningStep {
  id: string;
  kind:
    | "observation"     /* something read directly out of the repo    */
    | "cross_reference" /* two facts joined, usually via the graph    */
    | "hypothesis"      /* a candidate explanation, may be discarded  */
    | "validation"      /* a check run to confirm or kill a hypothesis*/
    | "decision";       /* the verdict and why it was chosen          */
  /** The assertion this step makes. One sentence, present tense. */
  claim: string;
  /** Why the claim holds. This is the "because" half of the UI's core pattern. */
  because: string;
  sources: EvidenceRef[];
  /** Agent confidence *after* this step, 0–100. Charted as a running line. */
  confidence: number;
  /** Wall-clock cost of the step. Replay reuses these verbatim. */
  durationMs: number;
  /** Set when a hypothesis was considered and rejected — shown struck through. */
  discarded?: { reason: string };
}

/** A node in the pipeline dependency graph, as rendered in the graph panel. */
export interface GraphNode {
  id: string;
  label: string;
  kind: "trigger" | "job" | "workflow" | "secret" | "environment" | "action";
  /** Marks the nodes the finding actually implicates. */
  implicated?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  /** e.g. "inherits secrets", "needs", "assumes role" */
  label?: string;
  implicated?: boolean;
}

/** The patch, plus the thing a judge actually remembers: what it prevents. */
export interface ProposedFix {
  /** Unified diff. Rendered by our own parser — no highlighter dependency. */
  diff: string;
  /** One sentence, consequence-first. Rendered larger than the diff itself. */
  prevents: string;
  /** Why this patch is safe to apply automatically, or why it is not. */
  blastRadius: string;
  /** Checks the agent ran before proposing. Empty for abstain. */
  validation: { label: string; passed: boolean; detail?: string }[];
  /** True once applied (auto_fix path only). */
  applied?: boolean;
}

/** Populated only on the abstain path. This is the restraint the demo sells. */
export interface Abstention {
  /** Plain statement of what could not be established. */
  unresolved: string;
  /** The competing readings the agent could not choose between. */
  hypotheses: { label: string; support: string; likelihood: number }[];
  /** Concrete things that would let the agent decide. Actionable, not vague. */
  wouldResolve: string[];
}

export interface Finding {
  id: string;
  repo: string;
  commit: string;
  commitMessage: string;
  author: string;
  file: string;
  line: number;
  rule: string;
  title: string;
  severity: Severity;
  verdict: Verdict;
  /** Final confidence. Compared against `threshold` to justify the verdict. */
  confidence: number;
  /** The action threshold in force. Below it the agent must abstain. */
  threshold: number;
  /** One-sentence summary of the decision, shown under the verdict chip. */
  decisionRationale: string;
  reasoning: ReasoningStep[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  fix?: ProposedFix;
  abstention?: Abstention;
  detectedAt: string;
  /** Total agent wall-clock, ms. Shown in the run header. */
  analysisMs: number;
}

/** A scan of one commit. The demo walks a single run containing all 3 verdicts. */
export interface PipelineRun {
  id: string;
  repo: string;
  commit: string;
  branch: string;
  startedAt: string;
  status: "queued" | "analyzing" | "complete";
  findingIds: string[];
}

/** One point on the 14-day health trend. */
export interface TrendPoint {
  date: string;
  commits: number;
  riskScore: number;      /* 0–100, lower is healthier */
  autoFixed: number;
  flagged: number;
  abstained: number;
  escaped: number;        /* issues that reached production undetected */
}

export interface Snapshot {
  run: PipelineRun;
  findings: Finding[];
  trend: TrendPoint[];
  meta: {
    /** Drives the LIVE / REPLAY pill. */
    mode: "live" | "replay";
    gatewayLatencyMs: number;
    modelId: string;
    scannedFiles: number;
    graphNodes: number;
  };
}
