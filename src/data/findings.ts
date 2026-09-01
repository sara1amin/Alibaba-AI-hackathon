import type { Finding } from "@/lib/types";

/**
 * The three-verdict demo scenario, all from ONE commit on ONE repo.
 *
 * They are deliberately one run rather than three demos: the pitch is that a
 * single agent applied a single decision procedure and reached three different
 * answers, because the evidence differed. Same threshold, same chain shape,
 * three outcomes.
 */

const REPO = "acme-payments/checkout-api";
const COMMIT = "9f4c1ab";

/* ---------------------------------------------------------------- 1 / AUTO-FIX */

export const autoFixFinding: Finding = {
  id: "PG-1041",
  repo: REPO,
  commit: COMMIT,
  commitMessage: "ci: add nightly load test workflow",
  author: "d.raza",
  file: ".github/workflows/load-test.yml",
  line: 34,
  rule: "PG-SUPPLY-002 · mutable third-party action reference",
  title: "Third-party action resolved by mutable tag inside an OIDC-privileged job",
  severity: "high",
  verdict: "auto_fix",
  confidence: 96,
  threshold: 70,
  decisionRationale:
    "Applied automatically: the rewrite is provably behaviour-preserving (same tree SHA), reversible in one revert, and the job is covered by existing CI.",
  analysisMs: 4120,
  detectedAt: "2026-09-01T09:14:02Z",
  reasoning: [
    {
      id: "s1",
      kind: "observation",
      claim: "Step 4 of job `load-test` pins a third-party action to a mutable tag.",
      because:
        "`aws-actions/configure-aws-credentials@v2` is a branch-style tag, not a 40-character commit SHA. The owner can repoint `v2` at any commit at any time, and the next run would silently execute the new code.",
      sources: [
        {
          kind: "file",
          ref: ".github/workflows/load-test.yml:34",
          excerpt: "      - uses: aws-actions/configure-aws-credentials@v2\n        with:\n          role-to-assume: ${{ secrets.AWS_LOADTEST_ROLE }}",
        },
      ],
      confidence: 61,
      durationMs: 180,
    },
    {
      id: "s2",
      kind: "cross_reference",
      claim:
        "That job holds an OIDC identity token, so the mutable action runs with credential-minting authority.",
      because:
        "Walking the dependency graph from the step to its enclosing job: `load-test` declares `permissions: id-token: write`. Any code in this job can exchange the token for real AWS credentials — a mutable reference here is not a style issue, it is a credential-boundary issue.",
      sources: [
        { kind: "job", ref: "job:load-test", excerpt: "permissions:\n  id-token: write\n  contents: read" },
        { kind: "graph", ref: "load-test → sts:AssumeRoleWithWebIdentity", excerpt: "edge kind: assumes-role" },
      ],
      confidence: 84,
      durationMs: 640,
    },
    {
      id: "s3",
      kind: "cross_reference",
      claim: "The role reachable from this job is not scoped to non-production.",
      because:
        "`AWS_LOADTEST_ROLE` resolves to a repository secret whose trust policy was captured on the previous run. It permits `s3:*` on `acme-payments-artifacts`, a bucket the production deploy job also reads from. The 'load test' name implies isolation the IAM policy does not provide.",
      sources: [
        { kind: "runtime", ref: "run #2181 · resolved role ARN", excerpt: "arn:aws:iam::4417…:role/gha-loadtest\n  s3:* on arn:aws:s3:::acme-payments-artifacts/*" },
        { kind: "graph", ref: "deploy-prod → acme-payments-artifacts", excerpt: "edge kind: reads-artifact" },
      ],
      confidence: 90,
      durationMs: 810,
    },
    {
      id: "s4",
      kind: "hypothesis",
      claim: "Considered: the tag may already be immutable in practice.",
      because:
        "If the publisher signed and protected `v2`, the mutability risk would be theoretical. Checked the upstream release metadata — `v2` was repointed twice in the last 90 days, most recently 11 days ago. The tag is actively moving.",
      sources: [
        { kind: "advisory", ref: "upstream tag history · aws-actions/configure-aws-credentials", excerpt: "v2 → 010d0da (11d ago)\nv2 → e3dd6a4 (68d ago)" },
      ],
      confidence: 93,
      durationMs: 1120,
      discarded: { reason: "Tag moved twice in 90 days — mutability is active, not theoretical." },
    },
    {
      id: "s5",
      kind: "validation",
      claim: "The proposed SHA is byte-identical to what the pipeline runs today.",
      because:
        "Resolved `v2` at scan time to `010d0da6df6c98e0d0b9b1f0bcdbb0a3cbc21b53` and diffed the resulting action tree against the tree the last green run executed. Identical. Pinning therefore changes nothing about current behaviour — it only removes the ability to change it silently.",
      sources: [
        { kind: "runtime", ref: "tree diff · v2 vs 010d0da", excerpt: "0 files changed — trees match" },
        { kind: "policy", ref: "PG-POLICY-14 · behaviour-preserving rewrites are auto-appliable" },
      ],
      confidence: 96,
      durationMs: 1370,
    },
    {
      id: "s6",
      kind: "decision",
      claim: "Auto-fix. Pin to the resolved SHA and open the change on the branch.",
      because:
        "Confidence 96% clears the 70% action threshold, the rewrite is provably behaviour-preserving, the blast radius is one line in one job, and a revert restores the prior state exactly. Under PG-POLICY-14 this is the class of change the agent is authorised to apply without a human in the loop.",
      sources: [{ kind: "policy", ref: "PG-POLICY-14 · autonomous rewrite authority" }],
      confidence: 96,
      durationMs: 0,
    },
  ],
  graph: {
    nodes: [
      { id: "trg", label: "schedule: nightly", kind: "trigger" },
      { id: "job", label: "load-test", kind: "job", implicated: true },
      { id: "act", label: "configure-aws-credentials@v2", kind: "action", implicated: true },
      { id: "oidc", label: "id-token: write", kind: "secret", implicated: true },
      { id: "role", label: "role/gha-loadtest", kind: "environment", implicated: true },
      { id: "buck", label: "s3: artifacts bucket", kind: "environment", implicated: true },
      { id: "prod", label: "deploy-prod", kind: "job" },
    ],
    edges: [
      { from: "trg", to: "job" },
      { from: "job", to: "act", label: "runs", implicated: true },
      { from: "job", to: "oidc", label: "holds", implicated: true },
      { from: "oidc", to: "role", label: "assumes", implicated: true },
      { from: "role", to: "buck", label: "s3:*", implicated: true },
      { from: "prod", to: "buck", label: "reads" },
    ],
  },
  fix: {
    prevents:
      "Prevents a compromised upstream tag from silently gaining production AWS credentials on the next nightly run.",
    blastRadius:
      "One line, one job. The pinned SHA resolves to the exact tree already running, so no behavioural change. Reversible with a single revert.",
    applied: true,
    diff: `--- a/.github/workflows/load-test.yml
+++ b/.github/workflows/load-test.yml
@@ -31,7 +31,8 @@ jobs:
       - uses: actions/checkout@v4
 
-      - uses: aws-actions/configure-aws-credentials@v2
+      # pinned by PipelineGuard · v2 == 010d0da at 2026-09-01T09:14Z
+      - uses: aws-actions/configure-aws-credentials@010d0da6df6c98e0d0b9b1f0bcdbb0a3cbc21b53
         with:
           role-to-assume: \${{ secrets.AWS_LOADTEST_ROLE }}
           aws-region: ap-southeast-1`,
    validation: [
      { label: "Resolved tag → SHA", passed: true, detail: "v2 → 010d0da6" },
      { label: "Action tree unchanged", passed: true, detail: "0 files differ" },
      { label: "Workflow schema valid", passed: true, detail: "actionlint clean" },
      { label: "Dry-run job plan", passed: true, detail: "6 steps, unchanged" },
    ],
  },
};

/* --------------------------------------------------------- 2 / FLAG FOR REVIEW */

export const flagFinding: Finding = {
  id: "PG-1042",
  repo: REPO,
  commit: COMMIT,
  commitMessage: "ci: add nightly load test workflow",
  author: "d.raza",
  file: ".github/workflows/e2e.yml",
  line: 7,
  rule: "PG-EXEC-001 · untrusted checkout under privileged trigger",
  title: "pull_request_target checks out untrusted head with live payment secrets in scope",
  severity: "critical",
  verdict: "flag_for_review",
  confidence: 91,
  threshold: 70,
  decisionRationale:
    "Not auto-fixed. The only safe rewrite changes who can run E2E tests — that is a product decision about external contributors, not a security one. Patch is prepared and waiting for an owner.",
  analysisMs: 6890,
  detectedAt: "2026-09-01T09:14:09Z",
  reasoning: [
    {
      id: "s1",
      kind: "observation",
      claim: "`e2e.yml` triggers on `pull_request_target` and then checks out the pull request's head.",
      because:
        "`pull_request_target` runs in the context of the base repository — with its secrets — but the checkout explicitly overrides the ref to `github.event.pull_request.head.sha`. That combination executes contributor-authored code inside a trusted context. It is the single most exploited GitHub Actions pattern.",
      sources: [
        { kind: "file", ref: ".github/workflows/e2e.yml:7", excerpt: "on:\n  pull_request_target:\n    types: [opened, synchronize]" },
        { kind: "file", ref: ".github/workflows/e2e.yml:19", excerpt: "      - uses: actions/checkout@v4\n        with:\n          ref: \${{ github.event.pull_request.head.sha }}" },
      ],
      confidence: 72,
      durationMs: 240,
    },
    {
      id: "s2",
      kind: "cross_reference",
      claim: "The untrusted code is not sandboxed — the job calls a reusable workflow with `secrets: inherit`.",
      because:
        "Following the graph edge `e2e → _test.yml`: the caller passes `secrets: inherit`, which forwards every repository secret into the reusable workflow, including any the E2E suite never uses. Inheritance is all-or-nothing; there is no per-secret filter on this edge.",
      sources: [
        { kind: "file", ref: ".github/workflows/e2e.yml:24", excerpt: "    uses: ./.github/workflows/_test.yml\n    secrets: inherit" },
        { kind: "graph", ref: "e2e → _test.yml", excerpt: "edge kind: inherits-secrets (unfiltered)" },
      ],
      confidence: 83,
      durationMs: 1180,
    },
    {
      id: "s3",
      kind: "cross_reference",
      claim: "`STRIPE_LIVE_KEY` is inside the inherited set, and it is a live-mode credential.",
      because:
        "Enumerating repository secrets reachable across that edge yields 11 secrets. One is `STRIPE_LIVE_KEY`. Its prefix on the last run was `sk_live_` — Stripe's live-mode prefix, not `sk_test_`. Arbitrary code in this job can read it from the environment and exfiltrate it in a single step.",
      sources: [
        { kind: "runtime", ref: "run #2179 · masked env manifest", excerpt: "STRIPE_LIVE_KEY=sk_live_**** (len 107)\nSTRIPE_WEBHOOK_SECRET=whsec_****" },
        { kind: "graph", ref: "_test.yml → STRIPE_LIVE_KEY", excerpt: "11 secrets reachable via inherit" },
      ],
      confidence: 91,
      durationMs: 1640,
    },
    {
      id: "s4",
      kind: "hypothesis",
      claim: "Considered: an approval gate may already block untrusted runs.",
      because:
        "If the repository required approval for first-time contributors, exploitation would need a merged PR first. Checked the environment protection rules on `_test.yml` — it targets no environment, so no reviewer gate applies. Checked repository settings captured last run: `require approval for all outside collaborators` is off.",
      sources: [
        { kind: "runtime", ref: "repo settings snapshot · actions.approval", excerpt: "outside_collaborator_approval: false" },
        { kind: "policy", ref: "PG-POLICY-03 · unapproved untrusted execution" },
      ],
      confidence: 91,
      durationMs: 2210,
      discarded: { reason: "No approval gate configured — the path is reachable by any external contributor." },
    },
    {
      id: "s5",
      kind: "validation",
      claim: "A safe rewrite exists, but it changes the trigger's semantics.",
      because:
        "The correct fix is `pull_request` plus a label-gated privileged job. That is sound security — and it also stops external contributor PRs from getting E2E results until a maintainer labels them. Three downstream workflows consume this job's status, and one is a required check on `main`. Whether that trade is acceptable is a product call about contributor experience, which the agent has no standing to make.",
      sources: [
        { kind: "graph", ref: "e2e → 3 downstream consumers", excerpt: "required check on main: e2e / summary" },
        { kind: "policy", ref: "PG-POLICY-22 · semantic changes require an owner" },
      ],
      confidence: 91,
      durationMs: 1620,
    },
    {
      id: "s6",
      kind: "decision",
      claim: "Flag for review. Patch prepared, deliberately not applied.",
      because:
        "Confidence 91% clears the threshold, so the finding is asserted with no hedging — this is a real, reachable, critical exposure. But clearing the threshold authorises the *claim*, not the *edit*. PG-POLICY-22 withholds autonomous application from any change that alters who can trigger a workflow. The agent's job here is to make the trade-off legible to an owner in under a minute, not to make it for them.",
      sources: [{ kind: "policy", ref: "PG-POLICY-22 · semantic changes require an owner" }],
      confidence: 91,
      durationMs: 0,
    },
  ],
  graph: {
    nodes: [
      { id: "pr", label: "pull_request_target", kind: "trigger", implicated: true },
      { id: "ext", label: "contributor head SHA", kind: "action", implicated: true },
      { id: "e2e", label: "e2e", kind: "job", implicated: true },
      { id: "reuse", label: "_test.yml", kind: "workflow", implicated: true },
      { id: "sec", label: "secrets: inherit ×11", kind: "secret", implicated: true },
      { id: "stripe", label: "STRIPE_LIVE_KEY", kind: "secret", implicated: true },
      { id: "req", label: "required check: main", kind: "environment" },
    ],
    edges: [
      { from: "pr", to: "e2e", label: "base context", implicated: true },
      { from: "ext", to: "e2e", label: "checked out", implicated: true },
      { from: "e2e", to: "reuse", label: "secrets: inherit", implicated: true },
      { from: "reuse", to: "sec", label: "resolves", implicated: true },
      { from: "sec", to: "stripe", label: "includes", implicated: true },
      { from: "e2e", to: "req", label: "gates" },
    ],
  },
  fix: {
    prevents:
      "Prevents any external contributor from reading a live Stripe key by opening a pull request.",
    blastRadius:
      "Changes the trigger contract. External PRs would no longer get E2E results automatically, and `e2e / summary` is a required check on main — three downstream workflows and the merge queue are affected. Needs an owner's call, not an agent's.",
    applied: false,
    diff: `--- a/.github/workflows/e2e.yml
+++ b/.github/workflows/e2e.yml
@@ -5,9 +5,12 @@ name: e2e
 
 on:
-  pull_request_target:
-    types: [opened, synchronize]
+  pull_request:
+    types: [opened, synchronize]
+  # privileged path is opt-in and maintainer-gated
+  pull_request_target:
+    types: [labeled]
 
 jobs:
   e2e:
+    if: >-
+      github.event_name == 'pull_request' ||
+      github.event.label.name == 'safe-to-test'
     uses: ./.github/workflows/_test.yml
-    secrets: inherit
+    secrets:
+      STRIPE_TEST_KEY: \${{ secrets.STRIPE_TEST_KEY }}`,
    validation: [
      { label: "Patch applies cleanly", passed: true, detail: "3 hunks, no conflict" },
      { label: "Workflow schema valid", passed: true, detail: "actionlint clean" },
      { label: "Secret set sufficient for suite", passed: true, detail: "E2E reads only STRIPE_TEST_KEY" },
      { label: "Preserves external contributor UX", passed: false, detail: "requires `safe-to-test` label — owner decision" },
    ],
  },
};

/* ---------------------------------------------------------------- 3 / ABSTAIN */

export const abstainFinding: Finding = {
  id: "PG-1043",
  repo: REPO,
  commit: COMMIT,
  commitMessage: "ci: add nightly load test workflow",
  author: "d.raza",
  file: "scripts/deploy.sh",
  line: 58,
  rule: "PG-EXEC-004 · remote code execution from unresolved variable",
  title: "Deploy script pipes an unresolvable remote URL into a shell",
  severity: "medium",
  verdict: "abstain",
  confidence: 44,
  threshold: 70,
  decisionRationale:
    "Insufficient evidence. `$DEPLOY_HOOK` resolves outside the scan boundary, and the two readings differ by four severity levels. Reporting a guess as a finding would be worse than reporting nothing.",
  analysisMs: 5240,
  detectedAt: "2026-09-01T09:14:15Z",
  reasoning: [
    {
      id: "s1",
      kind: "observation",
      claim: "`deploy.sh` pipes the body of a fetched URL directly into bash.",
      because:
        "Line 58 is `curl -fsSL \"$DEPLOY_HOOK\" | bash`. Whoever controls the response body controls execution on the deploy runner. The pattern is unambiguous; what it *means* depends entirely on where `$DEPLOY_HOOK` points.",
      sources: [
        { kind: "file", ref: "scripts/deploy.sh:58", excerpt: '  curl -fsSL "$DEPLOY_HOOK" | bash' },
      ],
      confidence: 55,
      durationMs: 190,
    },
    {
      id: "s2",
      kind: "validation",
      claim: "`DEPLOY_HOOK` cannot be resolved from anything inside the scan boundary.",
      because:
        "Searched, in order: the workflow `env:` block, the job `env:`, repository variables, repository secrets, and every `.env*` file in the tree. No definition. The variable is referenced but never bound locally, which means it is supplied at organisation scope — and the agent's token is repository-scoped, so that value is not readable.",
      sources: [
        { kind: "file", ref: "grep · DEPLOY_HOOK across 412 files", excerpt: "1 reference, 0 definitions" },
        { kind: "runtime", ref: "token scope", excerpt: "repo:read — org-level variables not readable" },
      ],
      confidence: 44,
      durationMs: 1980,
    },
    {
      id: "s3",
      kind: "hypothesis",
      claim: "Reading A — an internal artefact host. Severity would be low.",
      because:
        "The surrounding lines fetch from `artifacts.internal.acme` by hard-coded hostname, so the team clearly has an internal host convention. If `DEPLOY_HOOK` follows it, this is normal internal tooling and flagging it would be noise.",
      sources: [
        { kind: "file", ref: "scripts/deploy.sh:41-46", excerpt: "  curl -fsSL https://artifacts.internal.acme/checkout/latest.tar.gz \\\n    -o /tmp/release.tgz" },
      ],
      confidence: 44,
      durationMs: 720,
    },
    {
      id: "s4",
      kind: "hypothesis",
      claim: "Reading B — an externally-settable webhook. Severity would be critical.",
      because:
        "Organisation variables are editable by any org owner and are not change-controlled in this repository's review process. If `DEPLOY_HOOK` is external or ever repointed, this line is unauthenticated remote code execution on a runner that holds production deploy credentials.",
      sources: [
        { kind: "graph", ref: "deploy job → prod deploy role", excerpt: "edge kind: assumes-role (production)" },
        { kind: "policy", ref: "PG-POLICY-07 · org-scope values are not change-controlled" },
      ],
      confidence: 44,
      durationMs: 860,
    },
    {
      id: "s5",
      kind: "validation",
      claim: "No available evidence separates the two readings.",
      because:
        "Checked prior run logs for a resolved URL — `DEPLOY_HOOK` is registered as masked, so it is redacted in every log line. Checked outbound network records — not collected for this repository. Both readings remain fully consistent with everything observable. Confidence stays at 44%, well under the 70% threshold.",
      sources: [
        { kind: "runtime", ref: "runs #2170–2181 · log scan", excerpt: "DEPLOY_HOOK masked in 12/12 runs" },
      ],
      confidence: 44,
      durationMs: 1490,
    },
    {
      id: "s6",
      kind: "decision",
      claim: "Abstain. Report the gap, assert no severity, propose no patch.",
      because:
        "The honest answer is that the agent does not know. Guessing 'critical' would generate an alert an owner cannot act on and would cost trust on the next real critical; guessing 'low' would suppress a genuine RCE. Two questions resolve this in under a minute for someone with org access — so the useful output is those questions, not a fabricated score.",
      sources: [{ kind: "policy", ref: "PG-POLICY-01 · abstain below threshold" }],
      confidence: 44,
      durationMs: 0,
    },
  ],
  graph: {
    nodes: [
      { id: "dep", label: "deploy", kind: "job", implicated: true },
      { id: "scr", label: "scripts/deploy.sh", kind: "action", implicated: true },
      { id: "hook", label: "$DEPLOY_HOOK", kind: "secret", implicated: true },
      { id: "org", label: "org-scope variable", kind: "environment", implicated: true },
      { id: "role", label: "role/prod-deploy", kind: "environment" },
    ],
    edges: [
      { from: "dep", to: "scr", label: "runs", implicated: true },
      { from: "scr", to: "hook", label: "pipes to bash", implicated: true },
      { from: "hook", to: "org", label: "resolves at", implicated: true },
      { from: "dep", to: "role", label: "assumes" },
    ],
  },
  abstention: {
    unresolved:
      "Where $DEPLOY_HOOK points. It is defined at organisation scope, which this agent's repository-scoped token cannot read, and it is masked in every run log.",
    hypotheses: [
      {
        label: "Internal artefact host — severity low",
        support:
          "Adjacent lines fetch from a hard-coded internal host, so an internal convention exists and this likely follows it.",
        likelihood: 56,
      },
      {
        label: "Externally-settable webhook — severity critical",
        support:
          "Org variables are editable outside this repo's review process, and the runner holds production deploy credentials.",
        likelihood: 44,
      },
    ],
    wouldResolve: [
      "Read access to organisation-level variables for acme-payments (one API scope).",
      "The pipeline owner confirming the host in one sentence.",
      "Egress logs from any past deploy run, which would show the resolved destination.",
    ],
  },
};

export const findings: Finding[] = [autoFixFinding, flagFinding, abstainFinding];
