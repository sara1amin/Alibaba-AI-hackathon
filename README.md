# PipelineGuard — dashboard

A CI/CD supply-chain agent that reads your pipeline, **shows its reasoning**,
fixes what is provably safe, escalates what is a judgement call, and refuses
what it cannot establish.

Built for the Alibaba Cloud AI Hackathon Pakistan 2026.

**Live:** https://sara1amin.github.io/Alibaba-AI-hackathon/

> The demo script — what to say and click, second by second — is in
> **[DEMO-SCRIPT.md](./DEMO-SCRIPT.md)**.
> The design system and its deviations are in **[DESIGN-NOTES.md](./DESIGN-NOTES.md)**.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm run start   # production build, what you should demo on
npm run typecheck                # tsc --noEmit
```

No backend is required. With no gateway configured the app serves the recorded
run, which is the same path the live fallback uses.

---

## The thesis

Detection is the easy half. Any regex can flag `pull_request_target`. The claim
this dashboard is built to demonstrate is **judgement**: the same agent, applying
the same threshold to one commit, reaching three different answers because the
evidence differed.

| Outcome | Finding | What the agent did |
|---|---|---|
| **Auto-fix** | Mutable action tag inside an OIDC-privileged job | Applied the patch. Provably behaviour-preserving, one line, reversible. |
| **Flag** | `pull_request_target` + inherited live Stripe key | Wrote the patch and refused to apply it. The safe fix changes who can run CI — a product decision. |
| **Abstain** | `curl $DEPLOY_HOOK \| bash` with an org-scoped variable | Asserted no severity and proposed no patch. 44% confidence against a 70% bar. |

The abstain path is the point. A tool that always answers is easy to build and
impossible to trust.

---

## Screens

**Marketing**

| Route | What it is |
|---|---|
| `/` | Landing page — the pitch, the three outcomes, how it works, pricing. |
| `/signin` | Sign in. The GitHub button is mocked and the page says so. |
| `/onboarding` | Pick repositories, watch the first scan build the dependency graph. |

**Product** (behind the session guard)

| Route | What it is |
|---|---|
| `/app` | Repositories — the fleet, with risk, open findings and autonomous share. |
| `/app/repos/[repo]` | One repository. `checkout-api` carries the full recorded run; the others show an honest pending state rather than invented findings. |
| `/app/analysis/[id]` | **The centrepiece.** The reasoning chain, streamed step by step, with the traversed sub-graph, the confidence trace against the threshold, and either the patch or the abstention. |
| `/app/trend` | Two weeks of pipeline health with the narrative markers behind each move. |
| `/app/settings` | Policy and team — the action threshold and the per-change-class autonomous grants that the reasoning chain cites. |
| `/app/billing` | Plan, usage meters, and plan comparison. |

`←` / `→` walk the three outcomes. `⌘⇧R` / `Ctrl+Shift+R` toggles live/replay.

Opens in **light** — `DESIGN.md`'s palette, unmodified. The header button
switches to dark and the choice persists per browser.

### What is mocked, and what that means

Authentication is a flag in `localStorage` and the route guard is client-side,
because the site ships as a static export with no server. There is no security
claim here and none is implied — the session exists so the product *navigates*
like a SaaS. `SessionProvider` is shaped like a real one (`{ status, user, org }`
moving through loading → signed-out → signed-in), so replacing it with NextAuth,
Clerk or a custom JWT means changing that one file, and moving the guard into
middleware. Screens never read storage directly.

---

## Architecture

```
src/
  app/                     routes (App Router, all client-rendered)
    page.tsx               landing
    signin/ onboarding/    acquisition funnel
    app/                   the product, behind the session guard
  components/
    session/               mocked auth, shaped for a real provider
    AppSidebar.tsx         product nav, org switcher, the connected fleet
    ReasoningChain.tsx     ← the centrepiece: claim / because / sources, per step
    DependencyGraph.tsx    the sub-graph a finding actually traversed
    ConfidenceTrace.tsx    confidence across the chain vs. the action threshold
    FixViewer.tsx          consequence first, unified diff second
    AbstentionPanel.tsx    the restraint path
    TrendChart.tsx         Recharts composed chart, tokens sampled from CSS
    ModeProvider.tsx       live/replay, polling, silent fallback
  lib/
    types.ts               ← the gateway contract
    source.ts              DataSource: GatewaySource | ReplaySource
    useReasoningStream.ts  step reveal driven by recorded per-step latency
  data/                    the recorded run (findings, trend, snapshot)
```

### The reasoning chain is the product

Every step renders the same grammar, because the claim is that the agent's
judgement is *inspectable*:

- **CLAIM** — what it asserts
- **BECAUSE** — why that holds
- **SOURCES** — what it read, each expanding to the verbatim excerpt

A step with no sources renders an explicit `unsourced` marker rather than
quietly omitting the row. If the agent ever asserts something it cannot back,
the UI says so out loud.

Discarded hypotheses are shown, struck through, with the reason they were
rejected. Showing the path not taken is most of what separates reasoning from
narration.

---

## Wiring the FastAPI gateway (Workstream 3)

Set the base URL and the app polls it every 15s:

```bash
echo 'NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000' > .env.local
```

It expects **`GET /api/v1/snapshot`** returning the `Snapshot` shape in
[`src/lib/types.ts`](./src/lib/types.ts) — that file is the contract, and it is
commented field by field.

If your field names differ, **do not change the components**. Add an adapter:

```ts
// src/lib/adapters.ts
export function fromGateway(raw: GatewayPayload): Snapshot { /* map here */ }
```

and call it in `GatewaySource.fetchSnapshot`. That keeps the swap to one file.

The two fields that matter most for the demo:

- `reasoning[].durationMs` — drives the streaming reveal. Send the *real*
  per-step latency; the UI replays it faithfully.
- `confidence` and `threshold` — the UI renders confidence *against* the bar,
  never alone. A bare percentage is not an argument.

### Live / replay parity

The usual failure of a fallback mode is that it looks different — instant data,
no latency, no streaming, an obvious tell. Here the fallback is not a different
screen, it is a **different transport behind an identical timeline**. Both
sources return the same `Snapshot` and both drive the reveal from the same
recorded `durationMs`, so every transition, skeleton and delay is the same code.

A live fetch that fails does not raise an error. It falls back to the recording
and the run keeps going — a red toast mid-pitch is the thing this is engineered
against.

**The mode pill still tells the truth.** It reads `Replay` in replay mode,
quietly, at 11px. Hiding it would mean claiming a live result that was not
computed, and being caught doing that in a *security* product costs more than
the demo is worth. Small and honest beats invisible and brittle — and it gives
you a straight answer when a judge asks.

To re-record once the gateway is live: capture a clean `GET /api/v1/snapshot`
response and replace `src/data/snapshot.ts` with it. The timings come along in
the payload.

---

## Deploying

The site is a **static export** — no server, no runtime data fetching that has
to succeed. `.github/workflows/deploy.yml` builds it and publishes to GitHub
Pages on every push to the default branch, and can be re-run by hand from the
Actions tab.

One setting has to be right, once:

> **Settings → Pages → Build and deployment → Source: GitHub Actions**

The workflow passes `enablement: true` so it will try to turn Pages on itself,
but that only works if the repository allows it — check the setting if the first
run fails at the *Configure Pages* step.

A project site is served from `/<repo>`, not the domain root, so the app is
built with `NEXT_PUBLIC_BASE_PATH` set to the repository name. The workflow
takes it from `actions/configure-pages` rather than hard-coding it, so renaming
the repo does not break the build. Locally the variable is unset and the app
serves from `/`.

To reproduce the exact Pages build:

```bash
NEXT_PUBLIC_BASE_PATH=/Alibaba-AI-hackathon npm run build   # writes ./out
```

`out/.nojekyll` is required — without it Pages runs Jekyll, which drops every
path beginning with an underscore, which is all of Next's `_next/` bundle.

## Stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS 3 · Recharts 2 ·
Geist Sans + Geist Mono, self-hosted.

No component library, no syntax highlighter, no icon package — the diff parser
is 20 lines and every icon is inline SVG. First load is ~121 kB on the heaviest
route.

### A note on `npm audit`

`npm audit` reports advisories against the Next.js 14 line, which is where this
project is pinned by choice of stack. None are reachable here: this app has no
Server Actions, no image optimizer, no rewrites, no middleware, and no custom
server — it is a client-rendered dashboard behind a read-only gateway. Every
listed advisory targets a surface this app does not have.

Pinned at `14.2.35`, the newest 14.x. Upgrading to Next 16 clears the report and
is a near-no-op for this codebase (the App Router code is unchanged; React 19
is the only real migration). Worth doing before this is anything other than a
demo.
