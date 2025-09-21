export type Forecast = { wind: number; gust?: number; precip: number }

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kystvern Dev / https://github.com/kystvern'
      }
    })

    if (!response.ok) {
      throw new Error(`MET API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const firstItem = data.properties.timeseries[0]
    
    if (!firstItem) {
      throw new Error('No forecast data available')
    }

    const instant = firstItem.data.instant.details
    const wind = instant.wind_speed
    const gust = instant.wind_speed_of_gust
    
    // Get precipitation from next_1_hours or fallback to next_6_hours
    const next1h = firstItem.data.next_1_hours?.details.precipitation_amount
    const next6h = firstItem.data.next_6_hours?.details.precipitation_amount
    const precip = next1h ?? next6h ?? 0

    return { wind, gust, precip }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch forecast: ${error.message}`)
    }
    throw new Error('Failed to fetch forecast: Unknown error')
  }
}
