import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useWeatherStore } from '../../state/weatherStore'
import { NORWEGIAN_CITIES } from '../../lib/weather'

interface WeatherMapProps {
  selectedCity: string | null
  userLocation: { lat: number; lng: number } | null
}

export function WeatherMap({ selectedCity, userLocation }: WeatherMapProps) {
  const { cities, getRiskLevel } = useWeatherStore()
  const [mapCenter, setMapCenter] = useState<[number, number]>([65.0, 12.0])

  useEffect(() => {
    if (selectedCity) {
      const city = NORWEGIAN_CITIES.find(c => c.name === selectedCity)
      if (city) {
        setMapCenter([city.lat, city.lng])
      }
    }
  }, [selectedCity])

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

  // Custom marker icon
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  })

  // User location icon
  const userLocationIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  })

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-96">
        <MapContainer
          center={mapCenter}
          zoom={selectedCity ? 8 : 5}
          style={{ height: '100%', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}-${selectedCity}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* City markers */}
          {NORWEGIAN_CITIES.map((city) => {
            const riskLevel = getRiskLevel(city.name)
            const weatherData = cities[city.name]
            
            return (
              <Marker
                key={city.name}
                position={[city.lat, city.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 text-lg">{city.name}</h3>
                    
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(riskLevel)}`}>
                        {riskLevel} Risk
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">{getRiskDescription(riskLevel)}</p>
                    
                    {weatherData?.current && (
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temperature:</span>
                          <span className="font-medium">{weatherData.current.air_temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wind Speed:</span>
                          <span className="font-medium">{weatherData.current.wind_speed.toFixed(1)} m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Humidity:</span>
                          <span className="font-medium">{weatherData.current.relative_humidity.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precipitation:</span>
                          <span className="font-medium">{weatherData.current.precipitation_amount.toFixed(1)} mm/h</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">Your Location</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
