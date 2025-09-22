export type Forecast = { wind: number; gust?: number; precip: number; timeISO: string }

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KystVern AI / demo (github pages)'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    if (!data?.properties?.timeseries || !Array.isArray(data.properties.timeseries)) {
      throw new Error('Invalid API response structure')
    }

    const timeseries = data.properties.timeseries
    let selectedItem = null

    // Find the first timeseries item that has both wind_speed and precipitation
    for (let i = 0; i < Math.min(6, timeseries.length); i++) {
      const item = timeseries[i]
      if (!item?.data?.instant?.details?.wind_speed) continue

      // Check for precipitation in any of the time windows
      if (item.data.next_1_hours?.details?.precipitation_amount !== undefined ||
          item.data.next_6_hours?.details?.precipitation_amount !== undefined ||
          item.data.next_12_hours?.details?.precipitation_amount !== undefined) {
        // Found precipitation data, use this item
      } else {
        continue // Skip this item if no precipitation data
      }

      selectedItem = item
      break
    }

    if (!selectedItem) {
      throw new Error('No timeseries item found with both wind and precipitation data')
    }

    const instant = selectedItem.data.instant.details
    const wind = instant.wind_speed ?? 0
    const gust = instant.wind_speed_of_gust
    let precip = 0

    // Get precipitation from the selected item
    if (selectedItem.data.next_1_hours?.details?.precipitation_amount !== undefined) {
      precip = selectedItem.data.next_1_hours.details.precipitation_amount
    } else if (selectedItem.data.next_6_hours?.details?.precipitation_amount !== undefined) {
      precip = selectedItem.data.next_6_hours.details.precipitation_amount
    } else if (selectedItem.data.next_12_hours?.details?.precipitation_amount !== undefined) {
      precip = selectedItem.data.next_12_hours.details.precipitation_amount
    }

    return { 
      wind, 
      gust, 
      precip, 
      timeISO: selectedItem.time 
    }
  } catch (error) {
    throw new Error(`Failed to fetch forecast for ${lat},${lon}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}