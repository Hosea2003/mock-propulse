import { Panel, PanelLabel } from "@/features/dashboard/components/panel"

export function EmptyState() {
  return (
    <Panel className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <PanelLabel>No results yet</PanelLabel>
      <p className="text-muted-foreground">
        Create a campaign to start growing. Results show up here after the first daily run.
      </p>
    </Panel>
  )
}
