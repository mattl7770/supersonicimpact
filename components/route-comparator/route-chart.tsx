"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatHours } from "@/lib/format";
import type { Route } from "@/lib/types";

type RouteChartProps = {
  route: Route;
  roundTrip: boolean;
};

export function RouteChart({ route, roundTrip }: RouteChartProps) {
  const multiplier = roundTrip ? 2 : 1;
  const data = [
    {
      name: "Subsonic",
      hours: route.subsonicHours * multiplier,
      fill: "var(--muted)",
    },
    {
      name: "Supersonic",
      hours: route.supersonicHours * multiplier,
      fill: "var(--accent)",
    },
  ];

  const ratio = route.subsonicHours / route.supersonicHours;

  return (
    <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Time compression
        </h3>
        <span className="text-xs font-medium tabular-nums text-accent">
          {ratio.toFixed(1)}× faster
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted)" }}
              width={88}
            />
            <Tooltip
              cursor={{ fill: "var(--foreground)", opacity: 0.04 }}
              formatter={(value) => [
                formatHours(Number(value)),
                "Flight time",
              ]}
              contentStyle={{
                background: "var(--background)",
                border: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
                borderRadius: "0.75rem",
                fontSize: "0.75rem",
                padding: "0.5rem 0.75rem",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 500 }}
            />
            <Bar
              dataKey="hours"
              radius={[6, 6, 6, 6]}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
