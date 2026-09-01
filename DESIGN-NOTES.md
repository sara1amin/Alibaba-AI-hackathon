# Design notes

The base is the monochrome "clinical blueprint" system in `DESIGN.md`:
a three-tone surface stack, hairline borders, radius encoding hierarchy
(18px interactive / 24px container), and type carrying the hierarchy rather
than chrome.

Three things had to change to make it a security console. Each is deliberate,
and each is listed here so a reviewer can argue with it.

---

## 1. A dark theme, and dark is the default

`DESIGN.md` specifies light only. A CISO-facing tool is used in a dark room, on
a projector, next to a terminal — and this is being demoed on a stage.

The dark palette is derived by inverting the stack's *logic*, not its hex codes:
canvas darkest, card brightest, one hairline that never disappears at either end.

| Role | Light (`DESIGN.md` verbatim) | Dark |
|---|---|---|
| Canvas | `#f5f5f5` | `#0a0a0b` |
| Elevated / sidebar | `#fafafa` | `#0f0f11` |
| Card | `#ffffff` | `#141417` |
| Nested | `#f5f5f5` | `#1a1a1e` |
| Hairline | `#e5e5e5` | `#232327` |
| Ink | `#0a0a0a` | `#fafafa` |
| Mid | `#737373` | `#8b8b93` |

Light mode is the spec's palette, unmodified. Toggle in the header; the choice
persists per browser.

---

## 2. A four-family functional colour budget

`DESIGN.md` says: *do not introduce chromatic brand colours beyond `#e7000b`.*
That rule survives — **colour is never decorative here** — but a security tool
cannot encode severity in greyscale alone. Four families, all functional:

| Family | Dark | Light | Used for, and only for |
|---|---|---|---|
| Ember (the spec's red) | `#f5333f` | `#e7000b` | Critical severity, deletions, implicated graph edges |
| High | `#fb923c` | `#c2410c` | High severity |
| Medium | `#eab308` | `#a16207` | Medium severity, the `flag_for_review` verdict, failing pre-flight checks |
| Verified | `#22c55e` | `#15803d` | The `auto_fix` verdict, additions, passing checks, confidence over threshold |

The spec's own copy is contradictory on the red — the colour table calls it "a
decorative accent … not a status color", the Do's/Don'ts and the Destructive
component say "exclusively destructive, never decorates". This build takes the
second reading, which is stated twice and is the only one compatible with a
severity ramp.

### Severity and verdict are orthogonal

They never share a colour family, because they answer different questions:

- **Severity** — how bad this is if true (ember → high → medium → grey)
- **Verdict** — what the agent did about it (verified / medium / achromatic)

A critical finding can be abstained on. Outcome 3 in the demo is exactly that,
and the UI has to be able to say it without contradicting itself.

### Abstain is the only achromatic verdict

`abstain` gets no hue and a **dashed** border, everywhere it appears — chip,
card, panel, graph. Elsewhere colour means the agent reached a conclusion;
withholding colour is how the interface says it did not. It reads instantly as
"this one is different" without inventing a fifth hue, and it survives greyscale
printing and colour-blindness because the shape carries it too (check / triangle
/ dashed circle).

---

## 3. Interaction states, which the spec does not define

`DESIGN.md` has no hover, focus, active, or disabled states. Added, minimally:

- **Focus** — one system-wide ring, `2px solid ink/55` at `2px` offset. Not per-component.
- **Hover** — one tonal step only (`nested` → `hairline`). No lifts except on cards that navigate, which get `-translate-y-0.5` and the lifted shadow.
- **Disabled** — `opacity: 0.4`, pointer events off. No separate colour.
- **Reduced motion** — all animation collapses to ~0ms under `prefers-reduced-motion`. The reasoning stream still reveals; it just stops animating.

---

## Corrections to the spec's token block

Three values in `DESIGN.md`'s Quick Start do not work as written:

- `--section-gap: 48-80px` is not valid CSS. Split into real spacing steps.
- `--shadow-subtle-2: lab(2.75381 0 0) 0px 0px 0px 0px` is a zero-size no-op — a
  scrape artifact. Dropped.
- The card shadow's `oklab(0.145 …)` is the same colour as the `rgba()` form
  given in the Elevation section. The `rgba()` form is used, for compatibility.

Also: the spec's `Don't` forbidding any radius but 18/24px contradicts its own
tokens (6px small, 10px nested) and its own components, which use them. Read as:
**18px interactive, 24px container, 6/10px for small and nested chrome.**

`cv11` is an Inter feature, not a Geist one. Kept in `font-feature-settings`
because it only takes effect on the declared fallback, where it is correct.

---

## Typography

Geist Sans and Geist Mono, self-hosted via the `geist` package — no runtime
font fetch, so the demo does not depend on Google Fonts being reachable.

The spec's scale is used as given. Two additions:

- **`micro`, 11px/0.06em** — for source chips and graph labels, where 12px
  crowded the dense evidence rows. The spec's "no body text below 14px" is
  about body copy; these are labels.
- **Geist Mono** everywhere an identifier appears — file paths, commit SHAs,
  secret names, graph nodes, diffs. In a security tool the difference between
  `sk_live_` and `sk_test_` has to be unmissable, which is a typographic job.

Tabular figures (`tnum`) are on for every number that gets compared to another
number, so confidence percentages and risk scores do not shift width as they
animate.

---

## What is deliberately absent

- **No gradients, no glows, no glass.** Every surface is a solid tone.
- **No icon library.** Every glyph is inline SVG at 1.3–1.5px stroke.
- **No syntax highlighter.** The unified-diff parser is 20 lines; a highlighter
  would have added ~200 kB to colour four line types.
- **No component library.** ~120 lines of primitives cover the whole app.
- **No emoji, anywhere.**
