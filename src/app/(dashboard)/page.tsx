import { getDashboardData } from "@/features/dashboard/queries"
import { EmptyState } from "@/features/dashboard/components/empty-state"
import { FollowersChart } from "@/features/dashboard/components/followers-chart"
import { QuotaCard } from "@/features/dashboard/components/quota-card"
import { StatCards } from "@/features/dashboard/components/stat-cards"
import { TopTargets } from "@/features/dashboard/components/top-targets"
import { WeeklyChart } from "@/features/dashboard/components/weekly-chart"

export default async function DashboardPage() {
  const { quota, stats, series, weekly, topTargets } = await getDashboardData()
  const hasResults = topTargets.some((t) => t.interactions > 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">How your campaigns are performing.</p>
      </div>

      {hasResults ? (
        <>
          <StatCards stats={stats} />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <TopTargets targets={topTargets} />
            </div>
            <div className="lg:col-span-2">
              <FollowersChart data={series} />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <WeeklyChart data={weekly} />
            </div>
            <div className="lg:col-span-2">
              <QuotaCard quota={quota} />
            </div>
          </div>
        </>
      ) : (
        <>
          <QuotaCard quota={quota} />
          <EmptyState />
        </>
      )}
    </div>
  )
}
