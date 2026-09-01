"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Finding } from "@/lib/types";
import { verdictShort } from "@/lib/format";
import { VerdictGlyph } from "@/components/ui/primitives";

/**
 * The three-outcome sequence, always visible.
 *
 * This is what keeps the demo from reading as three disconnected screens. The
 * rail is a numbered path with a spine, present on every analysis view, so the
 * audience can see at all times that they are one step inside a three-step
 * argument — and can see the remaining step is the one marked "abstain".
 */
export function DemoRail({ findings, activeId }: { findings: Finding[]; activeId: string }) {
  return (
    <nav aria-label="Demo sequence" className="relative">
      <div className="mb-3 text-caption font-medium uppercase tracking-wider text-mid">
        Run sequence
      </div>
      <ol className="relative space-y-1">
        <span className="absolute left-[13px] top-3 bottom-3 w-px bg-hairline" aria-hidden />
        {findings.map((f, i) => {
          const active = f.id === activeId;
          return (
            <li key={f.id} className="relative">
              <Link
                href={`/app/analysis/${f.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-start gap-2.5 rounded-nested px-1.5 py-2 transition-colors",
                  active ? "bg-nested" : "hover:bg-nested/60",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 mt-px flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border text-[10px] font-medium tnum",
                    active
                      ? "border-ink bg-ink text-inverse"
                      : "border-hairline bg-card text-mid",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-caption font-medium tracking-normal",
                      active ? "text-ink" : "text-mid",
                    )}
                  >
                    <VerdictGlyph verdict={f.verdict} size={9} />
                    {verdictShort[f.verdict]}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-micro leading-snug tracking-normal",
                      active ? "text-mid" : "text-faint",
                    )}
                  >
                    {f.rule.split("·")[0].trim()}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 border-t border-hairline pt-3 text-micro leading-relaxed tracking-normal text-faint">
        Use ← → to move through the sequence.
      </p>
    </nav>
  );
}
