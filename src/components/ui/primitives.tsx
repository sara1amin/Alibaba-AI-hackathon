import * as React from "react";
import { cn } from "@/lib/cn";
import type { Severity, Verdict } from "@/lib/types";
import { severityLabel, verdictLabel, verdictShort } from "@/lib/format";

/* ── Card ─────────────────────────────────────────────────────────────────
 * DESIGN.md: 24px radius, 1px hairline, whisper-quiet stacked shadow.
 * The hairline is never dropped — the shadow alone does not define the edge.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-hairline bg-card shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-4 px-5 py-4", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

/** Section eyebrow. 12px uppercase, +0.05em — the doc's caption role. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-caption font-medium uppercase text-mid", className)}
      {...props}
    />
  );
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
};

export function Button({
  className, variant = "outline", size = "md", ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium",
        "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-8 px-3 text-caption tracking-normal" : "h-9 px-4 text-body",
        variant === "primary" && "bg-ink text-inverse hover:bg-ink/90",
        variant === "ghost" && "bg-nested text-ink hover:bg-hairline",
        variant === "outline" && "border border-hairline bg-transparent text-ink hover:bg-nested",
        className,
      )}
      {...props}
    />
  );
}

/* ── Badges ───────────────────────────────────────────────────────────── */

export function Badge({
  className, tone = "soft", ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "solid" | "soft" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control px-2 py-0.5 text-caption font-medium",
        tone === "solid" && "bg-ink-soft text-inverse",
        tone === "soft" && "bg-nested text-ink-soft",
        tone === "outline" && "border border-hairline text-ink",
        className,
      )}
      {...props}
    />
  );
}

/* ── Severity ─────────────────────────────────────────────────────────────
 * Severity and verdict are ORTHOGONAL encodings and never share a colour
 * family. Severity answers "how bad if true"; verdict answers "what did the
 * agent do about it". A critical finding can be abstained on.
 */
const severityStyle: Record<Severity, string> = {
  critical: "border-critical/35 bg-critical/10 text-critical",
  high: "border-high/35 bg-high/10 text-high",
  medium: "border-medium/35 bg-medium/10 text-medium",
  low: "border-hairline bg-nested text-mid",
  info: "border-hairline bg-nested text-mid",
};

export function SeverityChip({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control border px-2 py-0.5 text-caption font-medium uppercase",
        severityStyle[severity],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {severityLabel[severity]}
    </span>
  );
}

/* ── Verdict ──────────────────────────────────────────────────────────────
 * Abstain is intentionally the only achromatic verdict, and the only one
 * with a dashed border: the system declines to colour what it declines to
 * judge. That reads instantly as "this one is different" without inventing
 * a fifth hue.
 */
const verdictStyle: Record<Verdict, string> = {
  auto_fix: "border-verified/40 bg-verified/10 text-verified",
  flag_for_review: "border-medium/40 bg-medium/10 text-medium",
  abstain: "border-dashed border-mid/50 bg-transparent text-mid",
};

export function VerdictChip({
  verdict, short = false, className,
}: { verdict: Verdict; short?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control border px-2.5 py-0.5 text-caption font-medium",
        verdictStyle[verdict],
        className,
      )}
    >
      <VerdictGlyph verdict={verdict} />
      {short ? verdictShort[verdict] : verdictLabel[verdict]}
    </span>
  );
}

/** Shape carries the verdict too, so it survives greyscale and colour-blindness. */
export function VerdictGlyph({ verdict, size = 10 }: { verdict: Verdict; size?: number }) {
  if (verdict === "auto_fix") {
    return (
      <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="shrink-0">
        <path d="M1.5 5.2 3.9 7.6 8.5 2.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (verdict === "flag_for_review") {
    return (
      <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="shrink-0">
        <path d="M5 1.2 9.2 8.6H0.8L5 1.2Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M5 4.2v1.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="5" cy="7.1" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="shrink-0">
      <circle cx="5" cy="5" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1.6" />
    </svg>
  );
}

/* ── Confidence ───────────────────────────────────────────────────────────
 * Rendered against the threshold, never alone. A bare "44%" means nothing;
 * "44% against a 70% bar" is the entire argument for abstaining.
 */
export function ConfidenceMeter({
  value, threshold, className, showScale = true,
}: { value: number; threshold: number; className?: string; showScale?: boolean }) {
  const clears = value >= threshold;
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-nested">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", clears ? "bg-verified" : "bg-mid")}
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute inset-y-0 w-px bg-ink/50"
          style={{ left: `${threshold}%` }}
          aria-hidden
        />
      </div>
      {showScale && (
        <div className="mt-1.5 flex items-center justify-between text-micro text-mid tnum">
          <span className={cn("font-medium", clears ? "text-verified" : "text-ink")}>
            {value}% confidence
          </span>
          <span>
            {clears ? "clears" : "below"} {threshold}% threshold
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Misc ─────────────────────────────────────────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-hairline", className)} />;
}

export function Mono({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("font-mono text-[12px] tracking-tight", className)} {...props} />;
}

/** Label / value pair used across the run header and stat rails. */
export function Stat({
  label, value, sub, accent,
}: { label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: string }) {
  return (
    <div className="min-w-0">
      <Eyebrow>{label}</Eyebrow>
      <div className={cn("mt-1 text-heading-sm font-semibold tnum", accent ?? "text-ink")}>{value}</div>
      {sub && <div className="mt-0.5 truncate text-caption tracking-normal text-mid">{sub}</div>}
    </div>
  );
}
