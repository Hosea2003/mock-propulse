import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Quota } from "@/features/dashboard/types"
import { formatNumber } from "@/features/dashboard/format"
import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

export function QuotaCard({ quota }: { quota: Quota }) {
  const percent = quota.limit ? Math.min(100, (quota.used / quota.limit) * 100) : 0

  return (
    <Panel className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <PanelLabel>Interactions this month</PanelLabel>
        <Badge variant="secondary">{quota.planName}</Badge>
      </div>
      <p className="text-3xl font-semibold tabular-nums">
        {formatNumber(quota.used)}
        <span className="text-base font-normal text-muted-foreground"> / {formatNumber(quota.limit)}</span>
      </p>
      <Progress value={percent} aria-label="Monthly interaction quota" />
    </Panel>
  )
}
