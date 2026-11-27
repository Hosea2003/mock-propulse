"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CAMPAIGN_STATUSES, type CampaignStatus } from "@/features/dashboard/types"

export async function setCampaignStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as CampaignStatus
  if (!id || !CAMPAIGN_STATUSES.includes(status)) throw new Error("Invalid campaign status")

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/auth/login")

  // RLS limits the update to the signed-in user's own campaigns
  const { error } = await supabase.from("campaigns").update({ status }).eq("id", id)
  if (error) throw error

  revalidatePath("/")
}
