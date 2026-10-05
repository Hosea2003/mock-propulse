import "server-only"
import { createClient } from "@/lib/supabase/server"
import {
  PERIOD_DAYS,
  WEEKS,
  type DailyPoint,
  type TopTarget,
  type WeeklyPoint,
} from "@/features/dashboard/types"

// One extra week so the oldest week in the bar chart has a "previous" to compare with
const HISTORY_DAYS = (WEEKS + 1) * 7
const DAY_MS = 86_400_000

type DailyRow = { day: string | null; followers_gained: number | null; interactions: number | null }

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

// The view only has rows for days with results: fill the gaps with zeros
function fillDays(rows: DailyRow[], days: number) {
  const byDay = new Map(rows.map((r) => [r.day, r]))
  return Array.from({ length: days }, (_, i) => {
    const day = toIsoDate(new Date(Date.now() - (days - 1 - i) * DAY_MS))
    const row = byDay.get(day)
    return { day, followers: row?.followers_gained ?? 0, interactions: row?.interactions ?? 0 }
  })
}

export async function getDashboardData() {
  const supabase = await createClient()
  const since = toIsoDate(new Date(Date.now() - (HISTORY_DAYS - 1) * DAY_MS))

  const [quota, daily, targets, campaigns] = await Promise.all([
    supabase.from("my_quota").select("plan_name, quota, used").maybeSingle(),
    supabase
      .from("daily_followers")
      .select("day, followers_gained, interactions")
      .gte("day", since)
      .order("day"),
    supabase
      .from("target_performance")
      .select("target_id, handle, campaign_handle, interactions, followers_gained, follow_back_rate")
      .order("followers_gained", { ascending: false })
      .limit(5),
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ])

  const error = quota.error ?? daily.error ?? targets.error ?? campaigns.error
  if (error) throw error

  const history = fillDays(daily.data ?? [], HISTORY_DAYS)
  const period = history.slice(-PERIOD_DAYS)

  let total = 0
  const series: DailyPoint[] = period.map((p) => {
    total += p.followers
    return { day: p.day, followers: p.followers, total }
  })

  const weekTotals = Array.from({ length: WEEKS + 1 }, (_, w) => {
    const days = history.slice(w * 7, w * 7 + 7)
    return { weekStart: days[0].day, followers: days.reduce((sum, d) => sum + d.followers, 0) }
  })
  const weekly: WeeklyPoint[] = weekTotals.slice(1).map((week, i) => ({
    weekStart: week.weekStart,
    current: week.followers,
    previous: weekTotals[i].followers,
  }))

  const interactions = period.reduce((sum, p) => sum + p.interactions, 0)

  return {
    quota: {
      planName: quota.data?.plan_name ?? "",
      limit: quota.data?.quota ?? 0,
      used: quota.data?.used ?? 0,
    },
    stats: {
      followers: total,
      interactions,
      followBackRate: interactions ? total / interactions : 0,
      activeCampaigns: campaigns.count ?? 0,
    },
    series,
    weekly,
    topTargets: (targets.data ?? []).map(
      (t): TopTarget => ({
        id: t.target_id!,
        handle: t.handle!,
        campaignHandle: t.campaign_handle!,
        interactions: t.interactions ?? 0,
        followers: t.followers_gained ?? 0,
        followBackRate: t.follow_back_rate ?? 0,
      })
    ),
  }
}
