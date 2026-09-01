# PipelineGuard — 3-minute demo script

**Alibaba Cloud AI Hackathon Pakistan 2026**

Total spoken words: ~440, which is 180 seconds at a normal pitch pace (150 wpm).
It is written to be *under* time — if you land at 2:45 you have 15 seconds of
buffer for a judge interrupting, which they will.

**The argument you are making:** anyone can build a scanner that flags things.
The hard part is judgement — knowing when to act, when to ask, and when to admit
you don't know. All three appear in one run, in under three minutes.

**Rule for the whole demo: never read the screen aloud.** The judges can read.
Your voice supplies what the screen cannot — why it matters.

---

## Before you start

- [ ] Browser at **1440×900 or larger**, zoom 100%, full screen (F11).
- [ ] **Pick a theme and stay in it.** Light is the default and reads better on
      a bright projector; dark reads better in a dim room. The header button is
      labelled with the mode it switches to.
- [ ] **Sign in once before the pitch** and complete onboarding, so the demo does
      not spend 40 of its 180 seconds on a scan animation. Land on
      `/app/repos/checkout-api` and leave it there.
- [ ] Open `/` in a **second tab** — you open on the landing page, then switch.
- [ ] Third tab on `/app/analysis/PG-1041` as a hot spare.
- [ ] Check the mode pill, top right. **Live** (green) or **Replay** (grey) — either
      is fine, but *know which one you are in before you start talking*.
- [ ] Close Slack, email, notifications. Do not screen-share a second monitor.

---

## 0:00 – 0:22 · The problem (landing page, then switch to the app)

> **SAY:** "Every CI pipeline runs arbitrary code with production credentials.
> Most teams have never audited theirs, and the tools that exist flag two
> hundred things and leave you to sort it out."
>
> *(beat)*
>
> "PipelineGuard decides what to do about what it finds. One commit, three
> findings, three different answers."

**DO:** Nothing for the first sentence — the landing page headline is doing the
work. Then **switch to the app tab** (`/app/repos/checkout-api`) and let them
read the three outcome cards. Point with your hand, not the cursor.

> **SAY:** "Same agent, same seventy-percent threshold. It fixed one, escalated
> one, refused the third. Here's why."

**DO:** Click **outcome 1 — Auto-fixed**.

---

## 0:22 – 1:00 · Outcome 1 — it acted (`/app/analysis/PG-1041`)

The reasoning chain streams in on its own. **Do not click anything while it
streams** — the streaming is the point.

> **SAY:** "A GitHub Action pinned to a mutable tag. On its own, boring — every
> linter catches that."

**DO:** Point at the **second step**, the cross-reference.

> **SAY:** "Here's what a linter can't do. It walked the dependency graph and
> found that job can mint production AWS credentials. Not a style problem — a
> credential boundary."

**DO:** Point at the **hypothesis step, marked discarded**.

> **SAY:** "It also considered the tag might be safe, checked, and threw that
> out. You see what it ruled out, not just what it concluded."

**DO:** Scroll to the consequence panel.

> **SAY:** "Ninety-six percent, and the patch is provably identical to what's
> already running. So it applied it — and tells you what that bought you."

*(Read the "prevents" line aloud — this one line only.)*

**DO:** Click **Next: the one it would not fix by itself**.

---

## 1:00 – 1:48 · Outcome 2 — it escalated (`/app/analysis/PG-1042`)

> **SAY:** "Same run, worse finding — external contributors' code running with
> the repo's secrets inherited. It traced the graph to a live Stripe key."

**DO:** Point at the **third step**, the STRIPE_LIVE_KEY cross-reference.

> **SAY:** "Ninety-one percent. Over the threshold. It could have fixed this."

*(beat — this pause is doing real work)*

> **SAY:** "It didn't. The only safe fix changes who's allowed to run your test
> suite — that's a product decision, not a security one, and the agent doesn't
> get to make it."

**DO:** Scroll to the pre-flight checks. Point at the **failing fourth check**.

> **SAY:** "It wrote the patch, ran the checks, and surfaced the one that fails.
> Everything a maintainer needs to decide in a minute — then it stopped."

**DO:** Click **Next: the one it refused to score**.

---

## 1:48 – 2:32 · Outcome 3 — it refused (`/app/analysis/PG-1043`) ⭐

**This is the moment the demo is built around. Slow down.**

> **SAY:** "A deploy script pipes a URL straight into bash. That's either
> completely fine, or remote code execution on a box holding your production
> keys. It depends on one variable."

**DO:** Point at the **two hypothesis steps**.

> **SAY:** "That variable is org-scoped. The agent's token can't read it, and
> it's masked in every log. Two readings, both consistent with everything it can
> see, four severity levels apart."

**DO:** Point at the confidence panel in the right rail — the flat line under
the dashed threshold.

> **SAY:** "Forty-four percent. Under the bar. So it abstained — no severity, no
> patch, no guess."

*(beat)*

> **SAY:** "A tool that always has an answer is easy. This is the harder thing —
> it names what it couldn't establish."

**DO:** Point at **What would resolve this**.

> **SAY:** "One API scope, or one sentence from the owner. That's a work item,
> not a shrug."

**DO:** Click **See two weeks of this**.

---

## 2:32 – 2:55 · It compounds (`/app/trend`)

> **SAY:** "Two weeks on one repo. Risk down from seventy-eight to twenty-seven,
> and its autonomous share grew as it earned it."

**DO:** If a judge glances at the sidebar, note in passing: "five repositories
connected — this one is the deep dive." Then point at the **day-7 bump**.

> **SAY:** "That bump is an upgrade that reintroduced two problems. Caught the
> same day. Nothing has reached production since."

---

## 2:55 – 3:00 · Close

> **SAY:** "Reasoning you can audit, action only where it's earned, and a
> refusal when it hasn't been. That's PipelineGuard."

**DO:** Stop talking. Do not add anything.

---

## If it breaks

**The demo does not have a failure mode you need to narrate.** If the gateway
is unreachable, the UI falls back to the recorded run automatically, with the
same step timings and the same transitions. Keep going.

- The pill flips to **Replay**. Nothing else changes.
- To force it before you start: **⌘⇧R** (Mac) / **Ctrl+Shift+R**.
- **If a judge asks whether it's live:** tell them the truth — "we're on the
  recorded run, the gateway's behind conference wifi; the timings are the real
  ones from that run." That answer costs you nothing. Being caught claiming
  otherwise, in a security product, costs you everything.

Other recoveries:

| Problem | Fix |
|---|---|
| Reasoning already finished streaming | Click **Replay reasoning** at the bottom |
| Wrong page / lost | `←` `→` move through the three outcomes |
| Browser wedged | Second tab is already on `/app/analysis/PG-1041` |
| Running long at 2:00 | Skip the trend page, go straight to the close |

---

## Questions they will ask

**"Is the reasoning real, or is it a template?"**
> The chain is what the model produced — claim, justification, and the sources it
> read, per step. Every source chip expands to the actual excerpt. If a step
> can't cite anything, the UI marks it unsourced rather than hiding it.

**"How do you stop it auto-fixing something it shouldn't?"**
> Two separate gates. Confidence over threshold lets it *assert* a finding.
> Applying an edit needs a policy that names the change class — behaviour-preserving
> rewrites only. Anything that changes semantics goes to a human by construction,
> which is exactly what you saw in outcome two.

**"What's the false-positive rate?"**
> We don't have a number we'd defend on fourteen days of one repo, and we're not
> going to make one up. What we can show you is the abstain path — the design
> choice that trades recall for not crying wolf.

**"Why Alibaba Cloud?"**
> Qwen through Model Studio does the reasoning; the FastAPI gateway and the graph
> builder run alongside it. The chain you saw is model output, structured — not
> post-hoc narration of a rules engine.

**"Could this run on every PR?"**
> That's the intent — it's a few seconds of agent time per commit, and the
> scan is incremental against the dependency graph.
