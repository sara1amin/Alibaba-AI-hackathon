"use client";

import { cn } from "@/lib/cn";
import { useSnapshot } from "./ModeProvider";

/**
 * Small, honest status. Reads LIVE when the gateway answered, REPLAY when the
 * cassette did. Sized at 11px so it registers to the presenter without
 * announcing itself to the room.
 */
export function ModePill() {
  const { mode, degraded, loading } = useSnapshot();
  const live = mode === "live" && !degraded;

  return (
    <span
      title={
        live
          ? "Live — polling the PipelineGuard gateway"
          : degraded
            ? "Gateway unreachable — serving the recorded clean run at its original timings"
            : "Replay — recorded clean run, original timings"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control border px-2 py-1 text-micro font-medium uppercase tracking-wider",
        live ? "border-verified/35 text-verified" : "border-hairline text-mid",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          loading ? "animate-pulse-dot bg-mid" : live ? "animate-pulse-dot bg-verified" : "bg-mid",
        )}
        aria-hidden
      />
      {live ? "Live" : "Replay"}
    </span>
  );
}
