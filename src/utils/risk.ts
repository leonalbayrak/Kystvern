export type RiskLevel = "low" | "moderate" | "high" | "severe"

export function scoreRisk({ wind, gust, precip }: { wind: number; gust: number; precip: number }): RiskLevel {
  if (wind > 20 || gust > 25 || precip > 50) {
    return "severe"
  } else if (wind > 15 || gust > 20 || precip > 30) {
    return "high"
  } else if (wind > 10 || gust > 15 || precip > 10) {
    return "moderate"
  } else {
    return "low"
  }
}

export function badgeClasses(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "bg-green-200 text-green-800"
    case "moderate":
      return "bg-yellow-200 text-yellow-800"
    case "high":
      return "bg-orange-200 text-orange-800"
    case "severe":
      return "bg-red-200 text-red-800"
    default:
      return "bg-gray-200 text-gray-800"
  }
}
