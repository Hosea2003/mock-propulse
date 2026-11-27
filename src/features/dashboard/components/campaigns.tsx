import type { Campaign } from "@/features/dashboard/types"
import { setCampaignStatus } from "@/features/dashboard/actions"
import { cn } from "@/lib/utils"
import { CampaignStatusButton } from "@/features/dashboard/components/campaign-status-button"
import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

export function Campaigns({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <Panel className="flex flex-col gap-2 p-6">
      <PanelLabel>Campaigns</PanelLabel>
      <ul className="divide-y">
        {campaigns.map((campaign) => {
          const paused = campaign.status === "paused"
          return (
            <li key={campaign.id} className="flex items-center gap-3 py-3 last:pb-0">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-from to-brand-to text-sm font-semibold text-white uppercase",
                  paused && "grayscale"
                )}
              >
                {campaign.handle[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate">@{campaign.handle}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {campaign.targets} target {campaign.targets === 1 ? "account" : "accounts"}
                </div>
              </div>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", paused ? "bg-muted-foreground/40" : "bg-success")}
                />
                {paused ? "Paused" : "Active"}
              </span>
              <form action={setCampaignStatus}>
                <input type="hidden" name="id" value={campaign.id} />
                <input type="hidden" name="status" value={paused ? "active" : "paused"} />
                <CampaignStatusButton paused={paused} />
              </form>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
