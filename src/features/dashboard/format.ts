const number = new Intl.NumberFormat("en-US")
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 })

export const formatNumber = (value: number) => number.format(value)
export const formatCompact = (value: number) => compact.format(value)
export const formatPercent = (value: number) => percent.format(value)
export const formatDay = (day: string) =>
  new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
