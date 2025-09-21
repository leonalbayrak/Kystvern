import { useAppStore } from '../../state/store'
import { scoreRisk, badgeClasses, type RiskLevel } from '../../utils/risk'
import { getForecast } from '../../lib/met'

export function RiskGrid() {
  const { cities, loading, error, setLoading, setError, updateCityWeather } = useAppStore()

  const refreshAll = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const promises = cities.map(async (city) => {
        try {
          const forecast = await getForecast(city.lat, city.lng)
          const riskLevel = scoreRisk({
            wind: forecast.wind,
            gust: forecast.gust ?? 0,
            precip: forecast.precip
          })
          updateCityWeather(city.name, {
            time: new Date().toISOString(),
            wind_speed: forecast.wind,
            wind_gust: forecast.gust ?? 0,
            precipitation: forecast.precip,
            temperature: 0 // Not used in current implementation
          })
        } catch (err) {
          console.error(`Failed to fetch weather for ${city.name}:`, err)
        }
      })
      
      await Promise.all(promises)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh weather data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Risk Outlook</h2>
        <button
          onClick={refreshAll}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading weather data...</span>
        </div>
      )}

      <div className="space-y-3">
        {cities.map((city) => {
          const riskLevel = city.weather ? scoreRisk({
            wind: city.weather.wind_speed,
            gust: city.weather.wind_gust,
            precip: city.weather.precipitation
          }) : 'low'

          return (
            <div key={city.name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{city.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(riskLevel)}`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                </span>
              </div>
              
              {city.weather ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Wind:</span>
                    <span className="font-medium">{city.weather.wind_speed.toFixed(1)} m/s</span>
                  </div>
                  {city.weather.wind_gust > 0 && (
                    <div className="flex justify-between">
                      <span>Gust:</span>
                      <span className="font-medium">{city.weather.wind_gust.toFixed(1)} m/s</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Precip:</span>
                    <span className="font-medium">{city.weather.precipitation.toFixed(1)} mm</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No weather data available</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}