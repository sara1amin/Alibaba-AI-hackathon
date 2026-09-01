import type { Snapshot } from "./types";
import { snapshot as localSnapshot } from "@/data/snapshot";

/**
 * ── Live / replay parity ──────────────────────────────────────────────────
 *
 * The demo must survive the venue wifi. The usual failure of a "fallback mode"
 * is that it looks different: instant data, no latency, no streaming, an
 * obvious tell. So the fallback here is not a different screen — it is a
 * different *transport behind an identical timeline*.
 *
 * Both sources return the same `Snapshot` and both drive the reasoning stream
 * from the same recorded `durationMs` values on each step. Live mode reads
 * those from the gateway; replay reads them from the cassette. Every render
 * path, transition, and delay downstream is byte-for-byte the same code.
 *
 * Practically: replay is a recording of a real run, played at the speed the
 * real run took. It is not a mock of a run that never happened.
 */

export type Mode = "live" | "replay";

export interface DataSource {
  readonly mode: Mode;
  fetchSnapshot(signal?: AbortSignal): Promise<Snapshot>;
}

/** Artificial jitter so replay's timing feels sampled, not quantised. */
function jitter(baseMs: number, spread = 0.18): number {
  const delta = baseMs * spread;
  return Math.max(0, baseMs - delta + Math.random() * delta * 2);
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * Replay: the cassette recorded from a clean run. Reproduces the gateway's
 * observed latency before resolving, so the loading states that appear in live
 * mode also appear here — same skeletons, same duration.
 */
export class ReplaySource implements DataSource {
  readonly mode = "replay" as const;

  async fetchSnapshot(signal?: AbortSignal): Promise<Snapshot> {
    await sleep(jitter(localSnapshot.meta.gatewayLatencyMs), signal);
    return { ...localSnapshot, meta: { ...localSnapshot.meta, mode: "replay" } };
  }
}

/**
 * Live: polls the FastAPI gateway. Falls back to the cassette on any failure
 * rather than showing an error — a red toast mid-pitch is the thing we are
 * engineering against.
 */
export class GatewaySource implements DataSource {
  readonly mode = "live" as const;
  constructor(private baseUrl: string) {}

  async fetchSnapshot(signal?: AbortSignal): Promise<Snapshot> {
    const res = await fetch(`${this.baseUrl}/api/v1/snapshot`, {
      signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const body = (await res.json()) as Snapshot;
    return { ...body, meta: { ...body.meta, mode: "live" } };
  }
}

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL;

/** Resolves the source for a mode. Live without a configured gateway is replay. */
export function sourceFor(mode: Mode): DataSource {
  if (mode === "live" && GATEWAY) return new GatewaySource(GATEWAY);
  return new ReplaySource();
}

export const gatewayConfigured = Boolean(GATEWAY);
