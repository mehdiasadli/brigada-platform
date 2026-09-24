"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@brigada/ui/components/chart";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import type { RatingBucket } from "../lib/rating-buckets";

const chartConfig = {
  count: {
    label: "Reviews",
  },
} satisfies ChartConfig;

export function RatingChart({ rows }: { rows: RatingBucket[] }) {
  if (rows.every((row) => row.count === 0)) {
    return null;
  }

  return (
    <ChartContainer
      className="aspect-auto h-56 w-full max-w-md"
      config={chartConfig}
    >
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <XAxis allowDecimals={false} hide type="number" />
        <YAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          type="category"
          width={28}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={0}>
          {rows.map((row) => (
            <Cell
              fill={row.lead ? "var(--primary)" : "var(--foreground)"}
              fillOpacity={row.lead ? 1 : 0.2}
              key={row.label}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
