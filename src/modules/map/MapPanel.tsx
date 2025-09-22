import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useAppStore } from '../../state/store'
import { scoreRisk, badgeClasses } from '../../utils/risk'
import { fmt1 } from '../../utils/num'

const CITY_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
})

const USER_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
})

type LatLng = [number, number]

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()

  if (points.length <= 1) {
    return null
  }

  map.fitBounds(points, { padding: [20, 20] })
  return null
}

function riskLabel(riskLevel: string) {
  return `${riskLevel.charAt(0).toUpperCase()}${riskLevel.slice(1)} Risk`
}

export function MapPanel() {
  const { cities, userLocation } = useAppStore()

  const locations = [
    ...cities,
    ...(userLocation ? [userLocation] : [])
  ]

  const points: LatLng[] = locations.map((loc) => [loc.lat, loc.lng])

  const initialCenter: LatLng = userLocation
    ? [userLocation.lat, userLocation.lng]
    : points[0] ?? [65, 12]

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-96">
        <MapContainer
          center={initialCenter}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={points} />

          {cities.map((city) => {
            const weather = city.weather
            const riskLevel = city.riskLevel ?? (weather
              ? scoreRisk({
                  wind: weather.wind,
                  gust: weather.gust ?? weather.wind,
                  precip: weather.precip
                })
              : 'low')

            return (
              <Marker key={city.name} position={[city.lat, city.lng]} icon={CITY_ICON}>
                <Popup>
                  <div className="p-2 min-w-[200px] space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-lg">{city.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(riskLevel)}`}>
                        {riskLabel(riskLevel)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wind</span>
                        <span className="font-medium">{fmt1(weather?.wind)} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gust</span>
                        <span className="font-medium">{fmt1(weather?.gust)} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precip</span>
                        <span className="font-medium">{fmt1(weather?.precip)} mm</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON}>
              <Popup>
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">My Location</h3>
                    {userLocation.nearestCity && (
                      <span className="text-xs text-gray-500">
                        {userLocation.nearestCity.name} \u2022 {userLocation.nearestCity.distanceKm.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind</span>
                      <span className="font-medium">{fmt1(userLocation.weather?.wind)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gust</span>
                      <span className="font-medium">{fmt1(userLocation.weather?.gust)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precip</span>
                      <span className="font-medium">{fmt1(userLocation.weather?.precip)} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk</span>
                      <span className={`font-medium ${badgeClasses(userLocation.riskLevel ?? 'low')}`}>
                        {riskLabel(userLocation.riskLevel ?? 'low')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
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
