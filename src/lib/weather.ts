// MET Norway Locationforecast 2.0 Compact API integration

export interface WeatherData {
  time: string
  air_temperature: number
  wind_speed: number
  wind_direction: number
  relative_humidity: number
  cloud_area_fraction: number
  precipitation_amount: number
  symbol_code: string
}

export interface LocationForecast {
  type: string
  geometry: {
    type: string
    coordinates: [number, number, number]
  }
  properties: {
    meta: {
      updated_at: string
      units: Record<string, string>
    }
    timeseries: Array<{
      time: string
      data: {
        instant: {
          details: {
            air_temperature: number
            wind_speed: number
            wind_direction: number
            relative_humidity: number
            cloud_area_fraction: number
          }
        }
        next_1_hours?: {
          summary: {
            symbol_code: string
          }
          details: {
            precipitation_amount: number
          }
        }
      }
    }>
  }
}

export interface CityWeather {
  city: string
  coordinates: [number, number]
  current: WeatherData | null
  forecast: WeatherData[]
}

// Norwegian cities with their coordinates
export const NORWEGIAN_CITIES = [
  { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
  { name: 'Stavanger', lat: 58.9700, lng: 5.7331 },
  { name: 'Tromsø', lat: 69.6492, lng: 18.9553 },
  { name: 'Bodø', lat: 67.2804, lng: 14.4049 },
  { name: 'Ålesund', lat: 62.4722, lng: 6.1549 },
  { name: 'Kristiansand', lat: 58.1467, lng: 7.9956 }
]

export async function fetchWeatherData(
  lat: number,
  lng: number
): Promise<LocationForecast> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kystvern/1.0 (https://github.com/your-repo/kystvern)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

export function processWeatherData(forecast: LocationForecast): CityWeather {
  const timeseries = forecast.properties.timeseries
  const current = timeseries[0]
  
  const currentWeather: WeatherData = {
    time: current.time,
    air_temperature: current.data.instant.details.air_temperature,
    wind_speed: current.data.instant.details.wind_speed,
    wind_direction: current.data.instant.details.wind_direction,
    relative_humidity: current.data.instant.details.relative_humidity,
    cloud_area_fraction: current.data.instant.details.cloud_area_fraction,
    precipitation_amount: current.data.next_1_hours?.details.precipitation_amount || 0,
    symbol_code: current.data.next_1_hours?.summary.symbol_code || 'clearsky_day'
  }

  const forecastData: WeatherData[] = timeseries.slice(1, 25).map(item => ({
    time: item.time,
    air_temperature: item.data.instant.details.air_temperature,
    wind_speed: item.data.instant.details.wind_speed,
    wind_direction: item.data.instant.details.wind_direction,
    relative_humidity: item.data.instant.details.relative_humidity,
    cloud_area_fraction: item.data.instant.details.cloud_area_fraction,
    precipitation_amount: item.data.next_1_hours?.details.precipitation_amount || 0,
    symbol_code: item.data.next_1_hours?.summary.symbol_code || 'clearsky_day'
  }))

  return {
    city: 'Unknown', // Will be set by caller
    coordinates: forecast.geometry.coordinates as [number, number],
    current: currentWeather,
    forecast: forecastData
  }
}

export function calculateRiskLevel(weather: WeatherData): 'Low' | 'Medium' | 'High' | 'Critical' {
  let riskScore = 0

  // Wind speed risk (m/s)
  if (weather.wind_speed > 20) riskScore += 3
  else if (weather.wind_speed > 15) riskScore += 2
  else if (weather.wind_speed > 10) riskScore += 1

  // Precipitation risk (mm/h)
  if (weather.precipitation_amount > 5) riskScore += 3
  else if (weather.precipitation_amount > 2) riskScore += 2
  else if (weather.precipitation_amount > 0.5) riskScore += 1

  // Temperature risk (extreme cold)
  if (weather.air_temperature < -10) riskScore += 2
  else if (weather.air_temperature < -5) riskScore += 1

  // Cloud coverage (affects visibility)
  if (weather.cloud_area_fraction > 0.8) riskScore += 1

  if (riskScore >= 6) return 'Critical'
  if (riskScore >= 4) return 'High'
  if (riskScore >= 2) return 'Medium'
  return 'Low'
}
