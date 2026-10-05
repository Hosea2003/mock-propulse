import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TopTarget } from "@/features/dashboard/types"
import { formatCompact, formatNumber, formatPercent } from "@/features/dashboard/format"
import { Panel } from "@/features/dashboard/components/panel"

const cell = "border-r px-6 py-4 last:border-r-0"

export function TopTargets({ targets }: { targets: TopTarget[] }) {
  const maxFollowers = Math.max(1, ...targets.map((t) => t.followers))

  return (
    <Panel className="overflow-hidden">
      <Table className="text-base">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${cell} h-auto font-normal text-muted-foreground`}>Accounts</TableHead>
            <TableHead className={`${cell} h-auto font-normal text-muted-foreground`}>Interactions</TableHead>
            <TableHead className={`${cell} h-auto font-normal text-muted-foreground`}>Follow-backs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((target) => (
            <TableRow key={target.id}>
              <TableCell className={cell}>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-from to-brand-to text-sm font-semibold text-white uppercase">
                    {target.handle[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">@{target.handle}</div>
                    <div className="truncate text-xs text-muted-foreground">for @{target.campaignHandle}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={`${cell} tabular-nums`}>{formatCompact(target.interactions)}</TableCell>
              <TableCell className={`${cell} min-w-48`}>
                <div className="flex items-center gap-4">
                  <span className="w-8 tabular-nums" title={formatPercent(target.followBackRate)}>
                    {formatNumber(target.followers)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${(target.followers / maxFollowers) * 100}%` }}
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}
