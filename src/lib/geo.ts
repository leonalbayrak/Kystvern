const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export const haversineKm = (
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number => {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const sinHalfLat = Math.sin(dLat / 2)
  const sinHalfLon = Math.sin(dLon / 2)

  const h = sinHalfLat * sinHalfLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))

  return EARTH_RADIUS_KM * c
}

export const nearestCity = (
  lat: number,
  lon: number,
  cities: { name: string; lat: number; lng: number }[]
): { name: string; distanceKm: number } | undefined => {
  if (!Array.isArray(cities) || cities.length === 0) {
    return undefined
  }

  const origin = { lat, lon }
  let closest = cities[0]
  let minDistance = haversineKm(origin, { lat: closest.lat, lon: closest.lng })

  for (let i = 1; i < cities.length; i += 1) {
    const city = cities[i]
    const distance = haversineKm(origin, { lat: city.lat, lon: city.lng })
    if (distance < minDistance) {
      minDistance = distance
      closest = city
    }
  }

  return {
    name: closest.name,
    distanceKm: minDistance
  }
}
