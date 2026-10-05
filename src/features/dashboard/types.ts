// Shared between server queries and client components: no server imports here.

export const PERIOD_DAYS = 30
export const WEEKS = 4

export type DailyPoint = { day: string; followers: number; total: number }

export type WeeklyPoint = { weekStart: string; current: number; previous: number }

export type TopTarget = {
  id: string
  handle: string
  campaignHandle: string
  interactions: number
  followers: number
  followBackRate: number
}

export type Quota = { planName: string; limit: number; used: number }

export type Stats = {
  followers: number
  interactions: number
  followBackRate: number
  activeCampaigns: number
}
