"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function TopMoviesChart({
  data,
}: {
  data: {
    title: string;
    count: number;
    fill?: string;
  }[];
}) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill ?? COLORS[index % COLORS.length],
  }));

  const chartConfig = {
    count: {
      label: "Requests",
    },
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Most Requested Movies</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="min-h-75">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="title"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry: (typeof chartData)[number]) => entry.title}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
