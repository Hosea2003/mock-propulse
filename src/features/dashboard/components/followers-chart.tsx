"use client"

import { Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PERIOD_DAYS, type DailyPoint } from "@/features/dashboard/types"
import { formatDay, formatNumber } from "@/features/dashboard/format"
import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

const chartConfig = {
  total: { label: "Followers", color: "var(--brand-via)" },
} satisfies ChartConfig

// Cumulative followers gained over the period
export function FollowersChart({ data }: { data: DailyPoint[] }) {
  const total = data.at(-1)?.total ?? 0

  return (
    <Panel className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <PanelLabel>Followers · last {PERIOD_DAYS} days</PanelLabel>
        <span className="text-sm font-medium tabular-nums">+{formatNumber(total)}</span>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto min-h-48 w-full flex-1">
        <AreaChart data={data} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-total)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(_, payload) => formatDay(payload[0]?.payload.day)} />}
          />
          <Area
            dataKey="total"
            type="monotone"
            fill="url(#fillTotal)"
            stroke="var(--color-total)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  )
}
