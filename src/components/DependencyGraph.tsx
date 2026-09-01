"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { GraphEdge, GraphNode } from "@/lib/types";

/**
 * The pipeline dependency graph, restricted to the sub-graph a finding touches.
 *
 * This exists because "cross-referenced with job Z via the dependency graph" is
 * a claim, and a claim the audience cannot see is a claim they have to take on
 * faith. Rendering the actual traversed path turns the reasoning step's
 * `graph:` sources into something a judge can point at.
 *
 * Layout is a deterministic longest-path layering — no force simulation, no
 * animation settling. The graph looks identical every run, which matters when
 * you are demoing it live.
 */

const nodeGlyph: Record<GraphNode["kind"], string> = {
  trigger: "▷",
  job: "▣",
  workflow: "◫",
  secret: "◆",
  environment: "⬡",
  action: "◇",
};

/**
 * Laid out top-to-bottom, not left-to-right. The sub-graphs are near-linear
 * chains and this panel lives in a ~300px rail, so vertical is the axis with
 * room. Horizontal layering overflowed and collided.
 */
const COL_W = 152;
const ROW_H = 64;
const NODE_W = 142;
const NODE_H = 30;

function layer(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const depth = new Map<string, number>();
  nodes.forEach((n) => depth.set(n.id, 0));

  // Longest-path layering, capped to avoid cycles running away.
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false;
    for (const e of edges) {
      const from = depth.get(e.from) ?? 0;
      const to = depth.get(e.to) ?? 0;
      if (to < from + 1) {
        depth.set(e.to, from + 1);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return depth;
}

export function DependencyGraph({
  nodes, edges, className,
}: { nodes: GraphNode[]; edges: GraphEdge[]; className?: string }) {
  const { positions, width, height } = React.useMemo(() => {
    const depth = layer(nodes, edges);
    const byRow = new Map<number, GraphNode[]>();
    nodes.forEach((n) => {
      const r = depth.get(n.id) ?? 0;
      byRow.set(r, [...(byRow.get(r) ?? []), n]);
    });

    const rows = Math.max(...Array.from(byRow.keys())) + 1;
    const maxCols = Math.max(...Array.from(byRow.values()).map((v) => v.length));
    const pos = new Map<string, { x: number; y: number }>();

    byRow.forEach((rowNodes, r) => {
      // Centre each row against the widest one, so the chain reads as a spine.
      const offset = (maxCols - rowNodes.length) / 2;
      rowNodes.forEach((n, c) => {
        pos.set(n.id, { x: (c + offset) * COL_W + 4, y: r * ROW_H + 6 });
      });
    });

    return {
      positions: pos,
      width: maxCols * COL_W - (COL_W - NODE_W) + 8,
      height: rows * ROW_H - (ROW_H - NODE_H) + 12,
    };
  }, [nodes, edges]);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Pipeline dependency sub-graph for this finding"
        className="h-auto w-full"
        style={{ maxHeight: height }}
      >
        <defs>
          <marker id="pg-arrow-imp" markerWidth="4" markerHeight="4" refX="3.4" refY="2" orient="auto">
            <path d="M0 0.35 L3.6 2 L0 3.65 Z" className="fill-critical" />
          </marker>
          <marker id="pg-arrow-dim" markerWidth="4" markerHeight="4" refX="3.4" refY="2" orient="auto">
            <path d="M0 0.35 L3.6 2 L0 3.65 Z" className="fill-hairline-strong" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const a = positions.get(e.from);
          const b = positions.get(e.to);
          if (!a || !b) return null;
          const x1 = a.x + NODE_W / 2;
          const y1 = a.y + NODE_H;
          const x2 = b.x + NODE_W / 2;
          const y2 = b.y;
          const mid = y1 + (y2 - y1) / 2;

          return (
            <g key={`${e.from}-${e.to}-${i}`} className={e.implicated ? "text-critical" : "text-hairline-strong"}>
              <path
                d={`M${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2 - 4}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={e.implicated ? 1.4 : 1}
                strokeDasharray={e.implicated ? undefined : "3 3"}
                markerEnd={`url(#pg-arrow-${e.implicated ? "imp" : "dim"})`}
                opacity={e.implicated ? 0.85 : 0.5}
              />
              {e.label && e.implicated && (
                <text
                  x={(x1 + x2) / 2 + (x1 === x2 ? 5 : 0)}
                  y={mid + 3}
                  textAnchor={x1 === x2 ? "start" : "middle"}
                  className={cn("font-mono", e.implicated ? "fill-critical" : "fill-faint")}
                  style={{
                    fontSize: 8.5,
                    paintOrder: "stroke",
                    stroke: "rgb(var(--card))",
                    strokeWidth: 3.5,
                    strokeLinejoin: "round",
                  }}
                  opacity={e.implicated ? 0.95 : 0.7}
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          return (
            <g key={n.id}>
              <rect
                x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={10}
                className={cn(
                  n.implicated ? "fill-critical/10 stroke-critical/45" : "fill-nested stroke-hairline",
                )}
                strokeWidth={1}
              />
              <text
                x={p.x + 10} y={p.y + NODE_H / 2 + 3.5}
                className={cn(n.implicated ? "fill-critical" : "fill-faint")}
                style={{ fontSize: 10 }}
              >
                {nodeGlyph[n.kind]}
              </text>
              <text
                x={p.x + 25} y={p.y + NODE_H / 2 + 3.5}
                className={cn("font-mono", n.implicated ? "fill-ink" : "fill-mid")}
                style={{ fontSize: 9.8 }}
              >
                {n.label.length > 20 ? `${n.label.slice(0, 19)}…` : n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
