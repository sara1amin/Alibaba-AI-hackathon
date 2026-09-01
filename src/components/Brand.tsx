import Link from "next/link";
import { cn } from "@/lib/cn";

/** Shield built from a pipeline check. Geometric, no gradient, no emoji. */
export function Mark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={cn("shrink-0", className)}>
      <path
        d="M10 1.6 17 4.1v5.6c0 4.1-2.8 7.2-7 8.7-4.2-1.5-7-4.6-7-8.7V4.1L10 1.6Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="text-ink"
      />
      <path
        d="M6.4 9.9 9 12.4l4.6-4.8"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" className="text-critical"
      />
    </svg>
  );
}

export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <Mark />
      <span className="text-body font-semibold tracking-tight text-ink">PipelineGuard</span>
    </Link>
  );
}
