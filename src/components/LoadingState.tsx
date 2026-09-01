"use client";

/** Shared skeleton. Live and replay both pass through it, for the same duration. */
export function LoadingState() {
  return (
    <div className="animate-fade-in space-y-6" aria-busy="true" aria-label="Loading run">
      <div className="space-y-3 border-b border-hairline pb-5">
        <div className="h-3 w-52 rounded-full bg-nested" />
        <div className="h-8 w-40 rounded-full bg-nested" />
        <div className="h-3 w-96 max-w-full rounded-full bg-nested" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 rounded-card border border-hairline bg-card p-5">
            <div className="relative h-3 w-24 overflow-hidden rounded-full bg-nested">
              <span className="absolute inset-y-0 w-1/3 animate-sweep bg-hairline-strong/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
