import { useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './styles/App.css'
import { RiskGrid } from './modules/risk/RiskGrid'
import { WeatherMap } from './modules/map/WeatherMap'

function App() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Kystvern</h1>
            <button
              onClick={handleMyLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Location
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Grid */}
          <div className="lg:col-span-1">
            <RiskGrid 
              selectedCity={selectedCity} 
              onCitySelect={setSelectedCity} 
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <WeatherMap 
              selectedCity={selectedCity} 
              userLocation={userLocation} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
