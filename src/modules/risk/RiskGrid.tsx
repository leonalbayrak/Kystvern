import { useAppStore } from '../../state/store'
import { scoreRisk, badgeClasses } from '../../utils/risk'

export function RiskGrid() {
  const { cities, userLocation, loading, error, lastUpdated, refreshAll } = useAppStore()

  const allLocations = [
    ...cities,
    ...(userLocation ? [{ ...userLocation, weather: undefined }] : [])
  ]

  return (
    <div className="space-y-4">
      {/* Header with Refresh and Status */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          {lastUpdated && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={refreshAll}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading weather data...</span>
        </div>
      )}

      {/* Cities Grid */}
      <div className="space-y-3">
        {allLocations.map((location) => {
          const riskLevel = location.weather ? scoreRisk({
            wind: location.weather.wind_speed,
            gust: location.weather.wind_gust,
            precip: location.weather.precipitation
          }) : 'low'

          return (
            <div key={location.name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{location.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(riskLevel)}`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                </span>
              </div>
              
              {location.weather ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Wind:</span>
                    <span className="font-medium">{location.weather.wind_speed.toFixed(1)} m/s</span>
                  </div>
                  {location.weather.wind_gust > 0 && (
                    <div className="flex justify-between">
                      <span>Gust:</span>
                      <span className="font-medium">{location.weather.wind_gust.toFixed(1)} m/s</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Precip:</span>
                    <span className="font-medium">{location.weather.precipitation.toFixed(1)} mm</span>
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