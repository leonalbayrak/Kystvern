import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useAppStore } from '../../state/store'
import { scoreRisk, badgeClasses } from '../../utils/risk'

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
})

export function MapPanel() {
  const { cities, userLocation } = useAppStore()

  // Calculate bounds to fit all markers
  const allLocations = [
    ...cities,
    ...(userLocation ? [userLocation] : [])
  ]

  const bounds = allLocations.length > 0 ? allLocations.map(loc => [loc.lat, loc.lng]) : [[65.0, 12.0]]

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-96">
        <MapContainer
          center={[65.0, 12.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          bounds={bounds}
          boundsOptions={{ padding: [20, 20] }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* City markers */}
          {cities.map((city) => {
            const riskLevel = city.weather ? scoreRisk({
              wind: city.weather.wind_speed,
              gust: city.weather.wind_gust,
              precip: city.weather.precipitation
            }) : 'low'

            return (
              <Marker
                key={city.name}
                position={[city.lat, city.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{city.name}</h3>
                    
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(riskLevel)}`}>
                        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                      </span>
                    </div>
                    
                    {city.weather ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wind:</span>
                          <span className="font-medium">{city.weather.wind_speed.toFixed(1)} m/s</span>
                        </div>
                        {city.weather.wind_gust > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gust:</span>
                            <span className="font-medium">{city.weather.wind_gust.toFixed(1)} m/s</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precip:</span>
                          <span className="font-medium">{city.weather.precipitation.toFixed(1)} mm</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No weather data available</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
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
              icon={new Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">Your Location</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
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
