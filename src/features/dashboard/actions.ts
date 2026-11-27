"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { CAMPAIGN_STATUSES } from "@/features/dashboard/types"

const setCampaignStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(CAMPAIGN_STATUSES),
})

export async function setCampaignStatus(formData: FormData) {
  const parsed = setCampaignStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) throw new Error("Invalid campaign status")
  const { id, status } = parsed.data

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/auth/login")

  // RLS limits the update to the signed-in user's own campaigns
  const { error } = await supabase.from("campaigns").update({ status }).eq("id", id)
  if (error) throw error

  revalidatePath("/")
}
