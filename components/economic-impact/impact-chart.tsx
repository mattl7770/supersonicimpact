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
import { formatUsdCompact } from "@/lib/format";

type ImpactChartProps = {
  subsonicTimeCost: number;
  supersonicTimeCost: number;
  multipliedGdpImpact: number;
};

export function ImpactChart({
  subsonicTimeCost,
  supersonicTimeCost,
  multipliedGdpImpact,
}: ImpactChartProps) {
  const data = [
    {
      name: "Subsonic",
      value: subsonicTimeCost,
      fill: "var(--muted)",
    },
    {
      name: "Supersonic",
      value: supersonicTimeCost,
      fill: "color-mix(in oklab, var(--accent) 55%, var(--muted))",
    },
    {
      name: "GDP impact",
      value: multipliedGdpImpact,
      fill: "var(--accent)",
    },
  ];

  return (
    <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 sm:p-8">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Productivity dollars in motion (annual)
        </h3>
        <span className="text-xs text-foreground/50">USD / year</span>
      </div>
      <p className="mb-5 text-xs text-foreground/55">
        The cost of time spent in air today vs. under widespread supersonic
        adoption, alongside the multiplied GDP contribution.
      </p>
      <div className="h-56">
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
              width={96}
            />
            <Tooltip
              cursor={{ fill: "var(--foreground)", opacity: 0.04 }}
              formatter={(value) => [formatUsdCompact(Number(value)), "USD/yr"]}
              contentStyle={{
                background: "var(--background)",
                border:
                  "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
                borderRadius: "0.75rem",
                fontSize: "0.75rem",
                padding: "0.5rem 0.75rem",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 500 }}
            />
            <Bar
              dataKey="value"
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
