import { useState, useEffect } from 'react'
import { useAppStore } from '../../state/store'
import { scoreRisk } from '../../utils/risk'

interface ScenarioSettings {
  seaLevelRise: number // meters
  stormFrequency: number // multiplier (1.0 = normal, 2.0 = double frequency)
  temperatureRise: number // degrees Celsius
  precipitationChange: number // percentage change
}

interface ScenarioRisk {
  city: string
  currentRisk: string
  scenarioRisk: string
  riskChange: string
  impact: string
}

export function ScenarioSimulator() {
  const { cities } = useAppStore()
  const [settings, setSettings] = useState<ScenarioSettings>({
    seaLevelRise: 0.5,
    stormFrequency: 1.5,
    temperatureRise: 2.0,
    precipitationChange: 20
  })
  const [scenarioRisks, setScenarioRisks] = useState<ScenarioRisk[]>([])

  const calculateScenarioRisk = (city: any, settings: ScenarioSettings) => {
    if (!city.weather) return null

    const { wind, gust, precip } = city.weather
    
    // Apply climate change multipliers
    const adjustedWind = wind * settings.stormFrequency
    const adjustedGust = (gust || wind * 1.3) * settings.stormFrequency
    const adjustedPrecip = precip * (1 + settings.precipitationChange / 100)

    // Calculate current and scenario risk levels
    const currentRisk = scoreRisk({ wind, gust: gust || wind * 1.3, precip })
    const scenarioRisk = scoreRisk({ 
      wind: adjustedWind, 
      gust: adjustedGust, 
      precip: adjustedPrecip 
    })

    // Determine risk change and impact
    const riskLevels = ['low', 'moderate', 'high', 'severe']
    const currentIndex = riskLevels.indexOf(currentRisk)
    const scenarioIndex = riskLevels.indexOf(scenarioRisk)
    const change = scenarioIndex - currentIndex

    let riskChange = 'No change'
    let impact = 'Minimal impact'

    if (change > 0) {
      riskChange = `+${change} level${change > 1 ? 's' : ''}`
      if (change === 1) impact = 'Moderate impact'
      else if (change === 2) impact = 'Significant impact'
      else if (change >= 3) impact = 'Severe impact'
    } else if (change < 0) {
      riskChange = `${change} level${change < -1 ? 's' : ''}`
      impact = 'Reduced risk'
    }

    return {
      city: city.name,
      currentRisk,
      scenarioRisk,
      riskChange,
      impact
    }
  }

  useEffect(() => {
    const risks = cities
      .map(city => calculateScenarioRisk(city, settings))
      .filter(Boolean) as ScenarioRisk[]
    setScenarioRisks(risks)
  }, [cities, settings])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-200 text-green-800'
      case 'moderate': return 'bg-yellow-200 text-yellow-800'
      case 'high': return 'bg-orange-200 text-orange-800'
      case 'severe': return 'bg-red-200 text-red-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    if (impact.includes('Severe')) return 'bg-red-100 text-red-800 border-red-200'
    if (impact.includes('Significant')) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (impact.includes('Moderate')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (impact.includes('Reduced')) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const updateSetting = (key: keyof ScenarioSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefault = () => {
    setSettings({
      seaLevelRise: 0.5,
      stormFrequency: 1.5,
      temperatureRise: 2.0,
      precipitationChange: 20
    })
  }

  const getScenarioDescription = () => {
    const { seaLevelRise, stormFrequency, temperatureRise, precipitationChange } = settings
    
    let description = 'Climate scenario: '
    const changes = []
    
    if (seaLevelRise > 0) changes.push(`${seaLevelRise}m sea level rise`)
    if (stormFrequency > 1) changes.push(`${(stormFrequency - 1) * 100}% more storms`)
    if (temperatureRise > 0) changes.push(`${temperatureRise}°C warmer`)
    if (precipitationChange > 0) changes.push(`${precipitationChange}% more precipitation`)
    
    return description + changes.join(', ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Climate Scenario Simulator</h3>
        <p className="text-sm text-gray-600 mb-4">
          Explore how climate change scenarios affect coastal risk levels. Adjust parameters to see projected impacts.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800 font-medium">{getScenarioDescription()}</p>
        </div>
      </div>

      {/* Climate Parameters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Climate Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sea Level Rise: {settings.seaLevelRise}m
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.seaLevelRise}
                onChange={(e) => updateSetting('seaLevelRise', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0m</span>
                <span>1m</span>
                <span>2m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storm Frequency: {((settings.stormFrequency - 1) * 100).toFixed(0)}% increase
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={settings.stormFrequency}
                onChange={(e) => updateSetting('stormFrequency', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Normal</span>
                <span>+100%</span>
                <span>+200%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature Rise: {settings.temperatureRise}°C
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={settings.temperatureRise}
                onChange={(e) => updateSetting('temperatureRise', parseFloat(e.target.value))}
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
                Precipitation Change: {settings.precipitationChange > 0 ? '+' : ''}{settings.precipitationChange}%
              </label>
              <input
                type="range"
                min="-50"
                max="100"
                step="10"
                value={settings.precipitationChange}
                onChange={(e) => updateSetting('precipitationChange', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-50%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetToDefault}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Reset to Default Scenario
          </button>
        </div>
      </div>

      {/* Risk Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Risk Impact Analysis</h4>
        {scenarioRisks.length > 0 ? (
          <div className="space-y-3">
            {scenarioRisks.map((risk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{risk.city}</h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Current:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.currentRisk)}`}>
                      {risk.currentRisk}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.scenarioRisk)}`}>
                      {risk.scenarioRisk}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Change:</span>
                    <span className="text-sm font-medium text-gray-900">{risk.riskChange}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(risk.impact)}`}>
                    {risk.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No weather data available for risk analysis</p>
          </div>
        )}
      </div>

      {/* Climate Impact Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Climate Impact Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Coastal Vulnerabilities</h5>
            <ul className="space-y-1 text-gray-700">
              <li>• Sea level rise increases flooding risk</li>
              <li>• Higher storm frequency amplifies wind damage</li>
              <li>• Increased precipitation raises flood potential</li>
              <li>• Temperature rise affects marine ecosystems</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Adaptation Strategies</h5>
            <ul className="space-y-1 text-gray-700">
              <li>• Enhanced coastal protection systems</li>
              <li>• Improved early warning systems</li>
              <li>• Ecosystem-based adaptation measures</li>
              <li>• Community resilience planning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
