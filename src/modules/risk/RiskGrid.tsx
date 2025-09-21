import { useEffect } from 'react'
import { useWeatherStore } from '../../state/weatherStore'
import { NORWEGIAN_CITIES } from '../../lib/weather'

interface RiskGridProps {
  selectedCity: string | null
  onCitySelect: (city: string) => void
}

export function RiskGrid({ selectedCity, onCitySelect }: RiskGridProps) {
  const { cities, loading, error, fetchAllCities, getRiskLevel } = useWeatherStore()

  useEffect(() => {
    fetchAllCities()
  }, [fetchAllCities])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-500'
      case 'Medium': return 'bg-yellow-500'
      case 'High': return 'bg-orange-500'
      case 'Critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRiskDescription = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'Minimal risk'
      case 'Medium': return 'Moderate risk'
      case 'High': return 'High risk'
      case 'Critical': return 'Critical risk'
      default: return 'Unknown risk'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading weather data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
      <div className="space-y-3">
        {NORWEGIAN_CITIES.map((city) => {
          const riskLevel = getRiskLevel(city.name)
          const weatherData = cities[city.name]
          
          return (
            <div
              key={city.name}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedCity === city.name ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onCitySelect(city.name)}
            >
              <div className="flex-1">
                <span className="font-medium text-gray-900">{city.name}</span>
                {weatherData?.current && (
                  <div className="text-xs text-gray-500 mt-1">
                    {weatherData.current.air_temperature.toFixed(1)}°C, 
                    {weatherData.current.wind_speed.toFixed(1)} m/s wind
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(riskLevel)}`}>
                  {riskLevel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Levels</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['Low', 'Medium', 'High', 'Critical'].map(level => (
            <div key={level} className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${getRiskColor(level)}`}></span>
              <span className="text-gray-600">{getRiskDescription(level)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
