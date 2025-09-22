import { useAppStore } from '../../state/store'
import { scoreRisk, badgeClasses } from '../../utils/risk'
import { fmt1 } from '../../utils/num'

export function RiskGrid() {
  const { cities, userLocation, loading, error, lastUpdated, refreshAll } = useAppStore()
  const allLocations = [
    ...cities,
    ...(userLocation ? [userLocation] : [])
  ]

  return (
    <div className="space-y-4">
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="space-y-3">
        {allLocations.map((location) => {
          const riskLevel = location.weather ? scoreRisk({
            wind: location.weather.wind,
            gust: location.weather.gust ?? 0,
            precip: location.weather.precip
          }) : 'low'

          return (
            <div key={location.name} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{location.name}</h4>
                  {location.nearestCity && (
                    <p className="text-xs text-gray-500 mt-1">
                      Nearest city: {location.nearestCity.name} • {location.nearestCity.distanceKm.toFixed(1)} km
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(riskLevel)}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Wind:</span>
                  <span className="ml-2 font-medium">{fmt1(location.weather?.wind)} m/s</span>
                </div>
                <div>
                  <span className="text-gray-500">Gust:</span>
                  <span className="ml-2 font-medium">{fmt1(location.weather?.gust)} m/s</span>
                </div>
                <div>
                  <span className="text-gray-500">Precip:</span>
                  <span className="ml-2 font-medium">{fmt1(location.weather?.precip)} mm</span>
                </div>
                <div>
                  <span className="text-gray-500">Valid at:</span>
                  <span className="ml-2 font-medium">
                    {location.weather?.timeISO 
                      ? new Date(location.weather.timeISO).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })
                      : '—'
                    }
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}