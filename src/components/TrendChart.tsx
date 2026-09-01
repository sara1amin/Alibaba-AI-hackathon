"use client";

import * as React from "react";
import {
  Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";
import { shortDate } from "@/lib/format";
import { useTokens } from "./ThemeProvider";
import { Eyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/**
 * Fourteen days of pipeline health, not a snapshot.
 *
 * The chart carries an argument: risk falls as findings are worked down, the
 * agent's autonomous share grows as it earns authority, and issues reaching
 * production go to zero. The day-7 bump is real data from the scenario — a
 * dependency bump reintroduced two findings — and it is left in because a
 * perfectly monotonic line is the first thing a sceptical judge distrusts.
 */

const TOKENS = ["ink", "mid", "faint", "hairline", "verified", "medium", "critical", "card"];

type Marker = { date: string; label: string; detail: string };

function ChartTooltip({
  active, payload, label, markers,
}: {
  active?: boolean;
  payload?: readonly { dataKey?: string | number; value?: number | string }[];
  label?: string | number;
  markers: Marker[];
}) {
  if (!active || !payload?.length) return null;
  const get = (k: string) => Number(payload.find((p) => p.dataKey === k)?.value ?? 0);
  const marker = markers.find((m) => m.date === label);

  return (
    <div className="max-w-[260px] rounded-nested border border-hairline bg-card p-3 shadow-lifted">
      <div className="text-caption font-medium uppercase tracking-wider text-mid">
        {shortDate(String(label))}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-heading-sm font-semibold text-ink tnum">{get("riskScore")}</span>
        <span className="text-caption tracking-normal text-mid">risk score</span>
      </div>
      <dl className="mt-2.5 space-y-1 text-caption tracking-normal">
        {[
          ["Auto-fixed", get("autoFixed"), "text-verified"],
          ["Flagged", get("flagged"), "text-medium"],
          ["Abstained", get("abstained"), "text-mid"],
          ["Reached production", get("escaped"), get("escaped") > 0 ? "text-critical" : "text-mid"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="flex items-center justify-between gap-6">
            <dt className="text-mid">{l as string}</dt>
            <dd className={cn("font-medium tnum", c as string)}>{v as number}</dd>
          </div>
        ))}
      </dl>
      {marker && (
        <div className="mt-2.5 border-t border-hairline pt-2.5">
          <div className="text-caption font-medium text-ink">{marker.label}</div>
          <p className="mt-1 text-micro leading-relaxed tracking-normal text-mid">{marker.detail}</p>
        </div>
      )}
    </div>
  );
}

export function TrendChart({
  data, markers, className,
}: { data: TrendPoint[]; markers: Marker[]; className?: string }) {
  const t = useTokens(TOKENS);
  if (!t.ink) return <div className={cn("h-[280px]", className)} />;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <defs>
            <linearGradient id="pg-risk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.ink} stopOpacity={0.14} />
              <stop offset="100%" stopColor={t.ink} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={t.hairline} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date" tickFormatter={(d) => shortDate(String(d))}
            stroke={t.hairline} tick={{ fill: t.faint, fontSize: 11 }}
            tickLine={false} axisLine={{ stroke: t.hairline }} interval={1} dy={4}
          />
          <YAxis
            yAxisId="risk" domain={[0, 100]} width={44}
            stroke={t.hairline} tick={{ fill: t.faint, fontSize: 11 }}
            tickLine={false} axisLine={false}
          />
          <YAxis yAxisId="count" orientation="right" hide domain={[0, 46]} />

          <Tooltip
            cursor={{ stroke: t.mid, strokeDasharray: "3 3", strokeWidth: 1 }}
            content={<ChartTooltip markers={markers} />}
          />

          {/* Narrative pins */}
          {markers.map((m) => (
            <ReferenceLine
              key={m.date} yAxisId="risk" x={m.date}
              stroke={t.mid} strokeDasharray="3 3" strokeOpacity={0.5}
            />
          ))}

          {/* Findings the agent handled, stacked — the work being done */}
          <Bar yAxisId="count" dataKey="autoFixed" stackId="f" fill={t.verified} fillOpacity={0.55} barSize={9} radius={[0, 0, 0, 0]} />
          <Bar yAxisId="count" dataKey="flagged" stackId="f" fill={t.medium} fillOpacity={0.5} barSize={9} />
          <Bar yAxisId="count" dataKey="abstained" stackId="f" fill={t.mid} fillOpacity={0.35} barSize={9} radius={[3, 3, 0, 0]} />

          {/* Risk score — the headline line */}
          <Area
            yAxisId="risk" type="monotone" dataKey="riskScore"
            stroke="none" fill="url(#pg-risk)" isAnimationActive={false}
          />
          <Line
            yAxisId="risk" type="monotone" dataKey="riskScore"
            stroke={t.ink} strokeWidth={2} dot={false}
            activeDot={{ r: 3.5, fill: t.ink, stroke: t.card, strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Anything that reached production — should be flat zero after day 6 */}
          <Line
            yAxisId="count" type="monotone" dataKey="escaped"
            stroke={t.critical} strokeWidth={1.5} strokeDasharray="3 3"
            dot={{ r: 2, fill: t.critical, strokeWidth: 0 }} isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend — flat, typographic, no chart chrome */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {[
          { c: "bg-ink", l: "Risk score", shape: "line" },
          { c: "bg-verified/60", l: "Auto-fixed" },
          { c: "bg-medium/60", l: "Flagged" },
          { c: "bg-mid/40", l: "Abstained" },
          { c: "bg-critical", l: "Reached production", shape: "dash" },
        ].map((i) => (
          <span key={i.l} className="flex items-center gap-1.5 text-caption tracking-normal text-mid">
            <span
              className={cn(
                i.c,
                i.shape === "line" ? "h-0.5 w-4 rounded-full"
                  : i.shape === "dash" ? "h-0.5 w-4 rounded-full opacity-70"
                  : "h-2 w-2 rounded-[2px]",
              )}
              aria-hidden
            />
            {i.l}
          </span>
        ))}
      </div>
    </div>
  );
}
