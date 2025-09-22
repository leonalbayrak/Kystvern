export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180

  const a1 = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1))

  return R * c
}

export function nearestCity(
  lat: number, 
  lon: number, 
  cities: { name: string; lat: number; lng: number }[]
): { name: string; distanceKm: number } {
  let nearest = cities[0]
  let minDistance = haversineKm({ lat, lon }, { lat: nearest.lat, lon: nearest.lng })

  for (let i = 1; i < cities.length; i++) {
    const city = cities[i]
    const distance = haversineKm({ lat, lon }, { lat: city.lat, lon: city.lng })
    if (distance < minDistance) {
      minDistance = distance
      nearest = city
    }
  }

  return { name: nearest.name, distanceKm: minDistance }
}
