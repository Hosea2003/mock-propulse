"use client"

import { useFormStatus } from "react-dom"
import { Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CampaignStatusButton({ paused }: { paused: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-22">
      {paused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
      {paused ? "Resume" : "Pause"}
    </Button>
  )
}
