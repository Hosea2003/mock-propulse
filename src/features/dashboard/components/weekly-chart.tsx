"use client"

import { Bar, BarChart, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { WEEKS, type WeeklyPoint } from "@/features/dashboard/types"
import { formatDay } from "@/features/dashboard/format"
import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

const chartConfig = {
  current: { label: "This week", color: "var(--brand-via)" },
  previous: { label: "Week before", color: "color-mix(in oklch, var(--muted-foreground) 25%, transparent)" },
} satisfies ChartConfig

// Followers gained each week, next to the week before
export function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <Panel className="flex h-full flex-col gap-4 p-6">
      <PanelLabel>Followers · last {WEEKS} weeks</PanelLabel>
      <ChartContainer config={chartConfig} className="aspect-auto min-h-48 w-full flex-1">
        <BarChart data={data} barGap={8} barCategoryGap="20%">
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(day) => formatDay(day)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(day) => `Week of ${formatDay(String(day))}`} />}
          />
          <Bar dataKey="current" fill="var(--color-current)" radius={14} />
          <Bar dataKey="previous" fill="var(--color-previous)" radius={14} />
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}
