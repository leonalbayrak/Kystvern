import { useMemo, useState } from 'react'
import { useAppStore } from '../../state/store'
import { scoreRisk } from '../../utils/risk'

type RiskLevel = ReturnType<typeof scoreRisk>

type ScenarioSettings = {
  seaLevelRise: number // metres
  stormIntensity: number // multiplier
  precipitationDelta: number // percentage change
  temperatureRise: number // degrees Celsius
}

type ScenarioResult = {
  name: string
  currentRisk: RiskLevel
  scenarioRisk: RiskLevel
  delta: number
  narrative: string
}

type AggregateSummary = {
  higher: number
  unchanged: number
  lower: number
}

const RISK_SEQUENCE: RiskLevel[] = ['low', 'moderate', 'high', 'severe']

const DEFAULT_SETTINGS: ScenarioSettings = {
  seaLevelRise: 0.6,
  stormIntensity: 1.3,
  precipitationDelta: 20,
  temperatureRise: 1.8
}

function clampIndex(index: number): number {
  if (index < 0) return 0
  if (index > RISK_SEQUENCE.length - 1) return RISK_SEQUENCE.length - 1
  return index
}

function riskToIndex(risk: RiskLevel): number {
  return RISK_SEQUENCE.indexOf(risk)
}

function describeDelta(delta: number): string {
  if (delta === 0) return 'No change expected'
  const prefix = delta > 0 ? '+' : ''
  const word = Math.abs(delta) === 1 ? 'level' : 'levels'
  return `${prefix}${delta} ${word}`
}

function composeNarrative(delta: number, settings: ScenarioSettings): string {
  if (delta > 0) {
    if (settings.stormIntensity >= 1.4 && settings.precipitationDelta >= 30) {
      return 'Stronger storms and heavier rain magnify exposure.'
    }
    if (settings.seaLevelRise >= 0.9) {
      return 'Sea-level rise compounds surge and harbour flooding risk.'
    }
    return 'A modest uptick driven by more frequent extreme weather.'
  }
  if (delta < 0) {
    return 'Scenario eases risk for this location under the chosen inputs.'
  }
  return 'Climate adjustments keep risk steady for current parameters.'
}

function applyScenarioRisk(
  weather: { wind: number; gust?: number; precip: number },
  settings: ScenarioSettings
): RiskLevel {
  const gustBase = weather.gust ?? weather.wind
  const adjustedWind = weather.wind * settings.stormIntensity
  const adjustedGust = gustBase * (settings.stormIntensity + 0.1)
  const adjustedPrecip = weather.precip * (1 + settings.precipitationDelta / 100)

  const baseline = scoreRisk({
    wind: adjustedWind,
    gust: adjustedGust,
    precip: adjustedPrecip
  })

  let riskScore = riskToIndex(baseline)
  if (settings.seaLevelRise >= 1.2) {
    riskScore += 1
  } else if (settings.seaLevelRise >= 0.7) {
    riskScore += 0.5
  }

  if (settings.temperatureRise >= 2.5) {
    riskScore += 0.5
  } else if (settings.temperatureRise <= 1) {
    riskScore -= 0.25
  }

  return RISK_SEQUENCE[clampIndex(Math.round(riskScore))]
}

export function ScenarioSimulator() {
  const { cities, userLocation } = useAppStore()
  const [settings, setSettings] = useState<ScenarioSettings>(DEFAULT_SETTINGS)

  const locations = useMemo(() => {
    const base = [...cities]
    if (userLocation) {
      base.unshift(userLocation)
    }
    return base.filter((location) => Boolean(location.weather))
  }, [cities, userLocation])

  const results = useMemo<ScenarioResult[]>(() => {
    return locations
      .map((location) => {
        const weather = location.weather
        if (!weather) {
          return null
        }
        const currentRisk = scoreRisk({
          wind: weather.wind,
          gust: weather.gust ?? weather.wind,
          precip: weather.precip
        })
        const scenarioRisk = applyScenarioRisk(weather, settings)
        const delta = riskToIndex(scenarioRisk) - riskToIndex(currentRisk)

        return {
          name: location.name,
          currentRisk,
          scenarioRisk,
          delta,
          narrative: composeNarrative(delta, settings)
        }
      })
      .filter((item): item is ScenarioResult => Boolean(item))
  }, [locations, settings])

  const aggregates = useMemo<AggregateSummary>(() => {
    return results.reduce<AggregateSummary>(
      (acc, item) => {
        if (item.delta > 0) acc.higher += 1
        else if (item.delta < 0) acc.lower += 1
        else acc.unchanged += 1
        return acc
      },
      { higher: 0, unchanged: 0, lower: 0 }
    )
  }, [results])

  const updateSetting = (key: keyof ScenarioSettings) => (value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => setSettings(DEFAULT_SETTINGS)

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Climate Scenario Simulator</h3>
        <p className="text-sm text-gray-600">
          Stress-test coastal risk exposure by scaling storms, rainfall, temperature, and sea-level rise. Results compare
          live MET-derived risk with the simulated climate pathway.
        </p>
      </header>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sea-level rise (metres): {settings.seaLevelRise.toFixed(1)}
              </label>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.1}
                value={settings.seaLevelRise}
                onChange={(event) => updateSetting('seaLevelRise')(Number(event.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.0 m</span>
                <span>0.8 m</span>
                <span>1.5 m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storm intensity multiplier: {settings.stormIntensity.toFixed(1)}×
              </label>
              <input
                type="range"
                min={1}
                max={2}
                step={0.1}
                value={settings.stormIntensity}
                onChange={(event) => updateSetting('stormIntensity')(Number(event.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0×</span>
                <span>1.5×</span>
                <span>2.0×</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature rise (°C): {settings.temperatureRise.toFixed(1)}
              </label>
              <input
                type="range"
                min={0}
                max={4}
                step={0.2}
                value={settings.temperatureRise}
                onChange={(event) => updateSetting('temperatureRise')(Number(event.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0°C</span>
                <span>2°C</span>
                <span>4°C</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precipitation change: {settings.precipitationDelta >= 0 ? '+' : ''}
                {settings.precipitationDelta}%
              </label>
              <input
                type="range"
                min={-40}
                max={100}
                step={5}
                value={settings.precipitationDelta}
                onChange={(event) => updateSetting('precipitationDelta')(Number(event.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-40%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Scenario summary:</span>{' '}
            {`${settings.seaLevelRise.toFixed(1)} m sea-level rise, ${settings.stormIntensity.toFixed(1)}× storms, `}
            {`${settings.temperatureRise.toFixed(1)}°C warmer, ${settings.precipitationDelta >= 0 ? '+' : ''}${settings.precipitationDelta}% precipitation.`}
          </div>
          <button
            type="button"
            onClick={resetSettings}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset to default scenario
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-md font-semibold text-gray-900">Risk impact analysis</h4>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Higher risk: {aggregates.higher}</span>
            <span>Unchanged: {aggregates.unchanged}</span>
            <span>Lower risk: {aggregates.lower}</span>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No weather data available to simulate this scenario yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <article key={result.name} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-medium text-gray-900">{result.name}</h5>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Current</span>
                    <span className={`px-2 py-1 rounded-full font-semibold ${badgeClass(result.currentRisk)}`}>
                      {result.currentRisk}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`px-2 py-1 rounded-full font-semibold ${badgeClass(result.scenarioRisk)}`}>
                      {result.scenarioRisk}
                    </span>
                  </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="font-medium text-gray-800">{describeDelta(result.delta)}</div>
                  <div className="text-xs text-gray-600">{result.narrative}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function badgeClass(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'bg-green-200 text-green-800'
    case 'moderate':
      return 'bg-yellow-200 text-yellow-800'
    case 'high':
      return 'bg-orange-200 text-orange-800'
    case 'severe':
      return 'bg-red-200 text-red-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}
