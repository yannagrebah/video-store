"use client";

import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type schema from "~/lib/db/schema/d1";

type Invoice = typeof schema.invoices.$inferSelect;

interface GrossRevenueChartProps {
  invoices: Invoice[];
}

export function GrossRevenueChart({ invoices }: GrossRevenueChartProps) {
  const chartData = useMemo(() => {
    const grouped = invoices.reduce(
      (acc, invoice) => {
        if (!invoice.createdAt) return acc;

        const date = new Date(invoice.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        acc[date] ??= 0;
        acc[date] += invoice.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([date, gross]) => ({ date, gross }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [invoices]);

  const chartConfig = {
    gross: {
      label: "Gross Revenue",
      color: "var(--color-primary)",
    },
  };

  return (
    <Card className="col-span-full shadow-sm lg:col-span-3">
      <CardHeader>
        <CardTitle>Gross Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-75 w-full">
          <LineChart data={chartData} margin={{ top: 20, left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="gross"
              stroke="var(--color-gross)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
