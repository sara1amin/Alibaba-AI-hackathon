import type { PipelineRun, Snapshot } from "@/lib/types";
import { findings } from "./findings";
import { trend } from "./trend";

export const run: PipelineRun = {
  id: "run-2192",
  repo: "acme-payments/checkout-api",
  commit: "9f4c1ab",
  branch: "main",
  startedAt: "2026-09-01T09:14:00Z",
  status: "complete",
  findingIds: findings.map((f) => f.id),
};

export const snapshot: Snapshot = {
  run,
  findings,
  trend,
  meta: {
    mode: "live",
    gatewayLatencyMs: 84,
    modelId: "qwen-max · Alibaba Cloud Model Studio",
    scannedFiles: 412,
    graphNodes: 137,
  },
};
