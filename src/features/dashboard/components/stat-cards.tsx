import { PERIOD_DAYS, type Stats } from "@/features/dashboard/types"
import { formatNumber, formatPercent } from "@/features/dashboard/format"
import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

export function StatCards({ stats }: { stats: Stats }) {
  const items = [
    { label: `Followers · ${PERIOD_DAYS}d`, value: formatNumber(stats.followers) },
    { label: `Interactions · ${PERIOD_DAYS}d`, value: formatNumber(stats.interactions) },
    { label: "Follow-back rate", value: formatPercent(stats.followBackRate) },
    { label: "Active campaigns", value: formatNumber(stats.activeCampaigns) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Panel key={item.label} className="flex flex-col gap-3 p-5">
          <PanelLabel>{item.label}</PanelLabel>
          <p className="text-3xl font-semibold tabular-nums">{item.value}</p>
        </Panel>
      ))}
    </div>
  )
}
