import { cn } from "@/lib/utils"

// Rounded surface shared by every dashboard block
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/5",
        className
      )}
      {...props}
    />
  )
}

export function PanelLabel({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("font-mono text-xs tracking-widest text-muted-foreground uppercase", className)}
      {...props}
    />
  )
}
