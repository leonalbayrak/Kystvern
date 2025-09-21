import { useState } from 'react'
import { useAppStore } from '../../state/store'
import { scoreRisk } from '../../utils/risk'

interface FishingAdvice {
  city: string
  score: number
  recommendation: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  reasoning: string
}

export function FisheriesAdvisor() {
  const { cities } = useAppStore()
  const [targetSpecies, setTargetSpecies] = useState('')
  const [timeWindow, setTimeWindow] = useState('6')
  const [selectedCity, setSelectedCity] = useState('')

  const getFishingAdvice = (): FishingAdvice[] => {
    if (!selectedCity) return []

    const city = cities.find(c => c.name === selectedCity)
    if (!city?.weather) return []

    const riskLevel = scoreRisk({
      wind: city.weather.wind_speed,
      gust: city.weather.wind_gust,
      precip: city.weather.precipitation
    })

    // Simple heuristic: lower risk = better fishing
    let score = 100
    let reasoning = ''

    // Wind penalty
    if (city.weather.wind_speed > 15) {
      score -= 40
      reasoning += 'High winds make fishing dangerous. '
    } else if (city.weather.wind_speed > 10) {
      score -= 20
      reasoning += 'Moderate winds may affect fishing. '
    }

    // Gust penalty
    if (city.weather.wind_gust > 20) {
      score -= 30
      reasoning += 'Strong gusts create hazardous conditions. '
    } else if (city.weather.wind_gust > 15) {
      score -= 15
      reasoning += 'Gusty conditions may impact fishing. '
    }

    // Precipitation penalty
    if (city.weather.precipitation > 5) {
      score -= 25
      reasoning += 'Heavy precipitation reduces visibility and safety. '
    } else if (city.weather.precipitation > 2) {
      score -= 10
      reasoning += 'Light precipitation may affect fishing comfort. '
    }

    // Species-specific adjustments
    if (targetSpecies.toLowerCase().includes('cod')) {
      score += 5 // Cod prefer slightly rougher conditions
      reasoning += 'Cod fishing may be slightly better in these conditions. '
    } else if (targetSpecies.toLowerCase().includes('salmon')) {
      score -= 5 // Salmon prefer calmer conditions
      reasoning += 'Salmon fishing prefers calmer conditions. '
    }

    // Time window adjustments
    const hours = parseInt(timeWindow)
    if (hours > 12) {
      score -= 10 // Longer trips are riskier
      reasoning += 'Extended fishing trips increase risk exposure. '
    }

    score = Math.max(0, Math.min(100, score))

    let recommendation: 'Excellent' | 'Good' | 'Fair' | 'Poor'
    if (score >= 80) recommendation = 'Excellent'
    else if (score >= 60) recommendation = 'Good'
    else if (score >= 40) recommendation = 'Fair'
    else recommendation = 'Poor'

    if (!reasoning) {
      reasoning = 'Conditions are favorable for fishing.'
    }

    return [{
      city: city.name,
      score,
      recommendation,
      reasoning
    }]
  }

  const advice = getFishingAdvice()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fisheries Advisor</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get AI-powered fishing recommendations based on current weather conditions and risk assessment.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Species
          </label>
          <input
            type="text"
            value={targetSpecies}
            onChange={(e) => setTargetSpecies(e.target.value)}
            placeholder="e.g., Cod, Salmon, Mackerel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Window (hours)
          </label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2">2 hours</option>
            <option value="4">4 hours</option>
            <option value="6">6 hours</option>
            <option value="8">8 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a city</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {advice.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">Fishing Recommendation</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                advice[0].recommendation === 'Excellent' ? 'bg-green-200 text-green-800' :
                advice[0].recommendation === 'Good' ? 'bg-blue-200 text-blue-800' :
                advice[0].recommendation === 'Fair' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {advice[0].recommendation}
              </span>
              <span className="text-2xl font-bold text-blue-900">{advice[0].score}/100</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Location:</strong> {advice[0].city}
            </p>
            {targetSpecies && (
              <p className="text-sm text-blue-800">
                <strong>Target Species:</strong> {targetSpecies}
              </p>
            )}
            <p className="text-sm text-blue-800">
              <strong>Time Window:</strong> {timeWindow} hours
            </p>
            <p className="text-sm text-blue-800">
              <strong>Reasoning:</strong> {advice[0].reasoning}
            </p>
          </div>
        </div>
      )}

      {selectedCity && !advice.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            No weather data available for {selectedCity}. Please refresh the weather data first.
          </p>
        </div>
      )}
    </div>
  )
}
