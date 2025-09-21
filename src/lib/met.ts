export type Forecast = { wind: number; gust?: number; precip: number }

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KystVern AI / https://github.com/kystvern (coastal-risk-assessment@example.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`MET API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data?.properties?.timeseries || !Array.isArray(data.properties.timeseries)) {
      throw new Error('Invalid API response structure')
    }

    const firstItem = data.properties.timeseries[0]
    
    if (!firstItem?.data?.instant?.details) {
      throw new Error('No forecast data available in timeseries')
    }

    const instant = firstItem.data.instant.details
    const wind = instant.wind_speed ?? 0
    const gust = instant.wind_speed_of_gust
    
    // Get precipitation with multiple fallbacks
    let precip = 0
    if (firstItem.data.next_1_hours?.details?.precipitation_amount !== undefined) {
      precip = firstItem.data.next_1_hours.details.precipitation_amount
    } else if (firstItem.data.next_6_hours?.details?.precipitation_amount !== undefined) {
      precip = firstItem.data.next_6_hours.details.precipitation_amount
    } else if (firstItem.data.next_12_hours?.details?.precipitation_amount !== undefined) {
      precip = firstItem.data.next_12_hours.details.precipitation_amount
    }

    return { wind, gust, precip }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch forecast for ${lat},${lon}: ${error.message}`)
    }
    throw new Error(`Failed to fetch forecast for ${lat},${lon}: Unknown error`)
  }
}
