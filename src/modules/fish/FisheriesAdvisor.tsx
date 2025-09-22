import { useMemo, useState } from 'react'
import { useAppStore } from '../../state/store'
import { scoreRisk } from '../../utils/risk'

const RECOMMENDATION_STYLES: Record<string, string> = {
  Excellent: 'bg-green-200 text-green-800',
  Good: 'bg-blue-200 text-blue-800',
  Fair: 'bg-yellow-200 text-yellow-800',
  Poor: 'bg-red-200 text-red-800'
}

const riskBoost: Record<NonNullable<ReturnType<typeof scoreRisk>>, number> = {
  low: 12,
  moderate: -10,
  high: -28,
  severe: -45
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const speciesProfiles = [
  { key: 'cod', label: 'Cod', windTolerance: 1.05, precipTolerance: 1.0, note: 'Cod tolerate some chop and turbidity.' },
  { key: 'salmon', label: 'Salmon', windTolerance: 0.85, precipTolerance: 0.9, note: 'Salmon runs prefer calmer, clearer water.' },
  { key: 'mackerel', label: 'Mackerel', windTolerance: 1.1, precipTolerance: 1.15, note: 'Mackerel schooling improves with mild agitation.' }
]

type Recommendation = 'Excellent' | 'Good' | 'Fair' | 'Poor'

interface AdviceFactor {
  label: string
  detail: string
  tone: 'positive' | 'negative' | 'neutral'
}

interface FishingAdvice {
  location: string
  score: number
  recommendation: Recommendation
  riskLevel?: 'low' | 'moderate' | 'high' | 'severe'
  windowHours: number
  factors: AdviceFactor[]
  summary: string
}

function recommendationFromScore(score: number): Recommendation {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

function createAdvice(
  params: {
    locationName: string
    wind: number
    gust?: number
    precip: number
    baseRisk?: 'low' | 'moderate' | 'high' | 'severe'
  },
  hours: number,
  speciesLabel: string
): FishingAdvice {
  const { locationName, wind, gust = wind, precip, baseRisk } = params
  const factors: AdviceFactor[] = []
  let score = 72

  if (baseRisk) {
    score += riskBoost[baseRisk]
    factors.push({
      label: 'MET risk profile',
      detail: `${baseRisk.replace(/^./, (c) => c.toUpperCase())} risk reported by MET.`,
      tone: baseRisk === 'low' ? 'positive' : 'negative'
    })
  }

  if (wind <= 5) {
    score += 8
    factors.push({ label: 'Wind', detail: 'Calm seas — easy vessel handling.', tone: 'positive' })
  } else if (wind <= 9) {
    factors.push({ label: 'Wind', detail: 'Light breeze; manageable drift.', tone: 'neutral' })
  } else if (wind <= 14) {
    score -= 18
    factors.push({ label: 'Wind', detail: 'Fresh breeze brings chop; secure gear.', tone: 'negative' })
  } else {
    score -= 36
    factors.push({ label: 'Wind', detail: 'Strong wind — postpone if possible.', tone: 'negative' })
  }

  if (gust >= 18 && gust < 24) {
    score -= 12
    factors.push({ label: 'Gusts', detail: 'Gusty pulses could upset smaller craft.', tone: 'negative' })
  } else if (gust >= 24) {
    score -= 22
    factors.push({ label: 'Gusts', detail: 'Severe gusts — high capsize risk.', tone: 'negative' })
  } else if (gust <= 12) {
    score += 4
    factors.push({ label: 'Gusts', detail: 'Stable air mass, predictable drift.', tone: 'positive' })
  }

  if (precip <= 1) {
    score += 6
    factors.push({ label: 'Precipitation', detail: 'Clear visibility keeps spotting easy.', tone: 'positive' })
  } else if (precip <= 3) {
    factors.push({ label: 'Precipitation', detail: 'Light rain — plan for slick decks.', tone: 'neutral' })
  } else if (precip <= 6) {
    score -= 12
    factors.push({ label: 'Precipitation', detail: 'Sustained rain reduces surface visibility.', tone: 'negative' })
  } else {
    score -= 20
    factors.push({ label: 'Precipitation', detail: 'Heavy rain compromises safety and catch quality.', tone: 'negative' })
  }

  const profile = speciesProfiles.find((p) => speciesLabel.toLowerCase().includes(p.key))
  if (profile) {
    const speciesFactor: AdviceFactor[] = []
    const windAdjustment = wind * profile.windTolerance
    if (windAdjustment <= 8) {
      score += 6
      speciesFactor.push({
        label: `${profile.label} behaviour`,
        detail: profile.note,
        tone: 'positive'
      })
    } else if (windAdjustment >= 14) {
      score -= 8
      speciesFactor.push({
        label: `${profile.label} behaviour`,
        detail: `${profile.label} prefer calmer seas than current forecast.`,
        tone: 'negative'
      })
    }

    const precipAdjustment = precip * profile.precipTolerance
    if (precipAdjustment >= 6) {
      score -= 6
      speciesFactor.push({
        label: `${profile.label} clarity`,
        detail: `${profile.label} catches fall in turbid runoff.`,
        tone: 'negative'
      })
    }

    factors.push(...speciesFactor)
  }

  if (hours > 12) {
    score -= 10
    factors.push({
      label: 'Trip duration',
      detail: 'Long outings expand exposure window — consider staggered shifts.',
      tone: 'negative'
    })
  } else if (hours <= 4) {
    score += 4
    factors.push({ label: 'Trip duration', detail: 'Short window keeps conditions predictable.', tone: 'positive' })
  }

  score = clamp(score)
  const recommendation = recommendationFromScore(score)

  const highlights = factors
    .filter((factor) => factor.tone !== 'neutral')
    .map((factor) => factor.detail)
    .slice(0, 2)

  const summary = highlights.join(' ') || 'Weather looks workable; maintain standard watch and catch limits.'

  return {
    location: locationName,
    score,
    recommendation,
    riskLevel: baseRisk,
    windowHours: hours,
    factors,
    summary
  }
}

export function FisheriesAdvisor() {
  const { cities, userLocation } = useAppStore()
  const [targetSpecies, setTargetSpecies] = useState('')
  const [timeWindow, setTimeWindow] = useState('6')
  const [selectedLocation, setSelectedLocation] = useState('')

  const locations = useMemo(() => {
    const base = [...cities]
    if (userLocation) {
      base.unshift(userLocation)
    }
    return base
      .filter((loc) => loc.weather)
      .map((loc) => ({
        key: loc.name,
        label: loc.name,
        weather: loc.weather!,
        risk: loc.riskLevel ?? scoreRisk({
          wind: loc.weather!.wind,
          gust: loc.weather!.gust ?? loc.weather!.wind,
          precip: loc.weather!.precip
        })
      }))
  }, [cities, userLocation])

  const hours = Number.parseInt(timeWindow, 10) || 6
  const speciesLabel = targetSpecies.trim().toLowerCase()

  const adviceList = useMemo(() => {
    if (locations.length === 0) {
      return []
    }

    if (selectedLocation) {
      const match = locations.find((loc) => loc.key === selectedLocation)
      if (!match) {
        return []
      }
      const { weather, risk, label } = match
      return [
        createAdvice(
          {
            locationName: label,
            wind: weather.wind,
            gust: weather.gust,
            precip: weather.precip,
            baseRisk: risk
          },
          hours,
          speciesLabel
        )
      ]
    }

    return locations
      .map((loc) =>
        createAdvice(
          {
            locationName: loc.label,
            wind: loc.weather.wind,
            gust: loc.weather.gust,
            precip: loc.weather.precip,
            baseRisk: loc.risk
          },
          hours,
          speciesLabel
        )
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [hours, locations, selectedLocation, speciesLabel])

  const hasSelection = Boolean(selectedLocation)

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Fisheries Advisor</h3>
        <p className="text-sm text-gray-600">
          Combine MET risk, wind and precipitation heuristics to plan safer catches. Choose a location to drill in or
          leave it blank to see the top opportunities.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Best available across all monitored areas</option>
            {locations.map((loc) => (
              <option key={loc.key} value={loc.key}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target species</label>
          <input
            type="text"
            value={targetSpecies}
            onChange={(event) => setTargetSpecies(event.target.value)}
            placeholder="Cod, salmon, mackerel…"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip window (hours)</label>
          <select
            value={timeWindow}
            onChange={(event) => setTimeWindow(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['2', '4', '6', '8', '12', '18', '24'].map((value) => (
              <option key={value} value={value}>
                {value} hours
              </option>
            ))}
          </select>
        </div>
      </div>

      {locations.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Weather data is still loading — refresh forecasts to receive fishing guidance.
        </div>
      )}

      {adviceList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {adviceList.map((advice) => (
            <article key={`${advice.location}-${advice.score}`} className="border border-blue-100 rounded-xl bg-blue-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">{advice.location}</h4>
                  <p className="text-xs text-blue-700">
                    {hasSelection ? `Forecast window: ${advice.windowHours}h` : 'Top pick based on current snapshot'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${RECOMMENDATION_STYLES[advice.recommendation]}`}>
                    {advice.recommendation}
                  </span>
                  <span className="text-xl font-bold text-blue-900">{advice.score}</span>
                </div>
              </div>

              {advice.riskLevel && (
                <p className="text-xs uppercase tracking-wide text-blue-800">
                  MET risk: <span className="font-semibold">{advice.riskLevel}</span>
                </p>
              )}

              <p className="text-sm text-blue-900">{advice.summary}</p>

              <ul className="space-y-1 text-sm text-blue-900">
                {advice.factors.map((factor, idx) => (
                  <li key={`${advice.location}-${factor.label}-${idx}`} className="flex items-start space-x-2">
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${
                        factor.tone === 'positive'
                          ? 'bg-green-500'
                          : factor.tone === 'negative'
                          ? 'bg-red-500'
                          : 'bg-blue-400'
                      }`}
                    ></span>
                    <div>
                      <p className="font-medium text-xs uppercase text-blue-700">{factor.label}</p>
                      <p>{factor.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {selectedLocation && adviceList.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          No weather data is available for {selectedLocation}. Try refreshing the forecasts.
        </div>
      )}
    </div>
  )
}
