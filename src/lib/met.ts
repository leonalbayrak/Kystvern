export type Forecast = { wind: number; gust?: number; precip: number; timeISO: string }

const USER_AGENT = 'KystVern AI / demo (github pages)'
const BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact'
const MAX_SCAN = 6

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return undefined
}

function extractPrecip(series: any): number | undefined {
  const windows = ['next_1_hours', 'next_6_hours', 'next_12_hours']
  for (const key of windows) {
    const amount = series?.data?.[key]?.details?.precipitation_amount
    const parsed = toNumber(amount)
    if (parsed !== undefined) {
      return parsed
    }
  }
  return undefined
}

function extractForecast(series: any): Forecast | undefined {
  const wind = toNumber(series?.data?.instant?.details?.wind_speed)
  if (wind === undefined) {
    return undefined
  }

  const precip = extractPrecip(series)
  if (precip === undefined) {
    return undefined
  }

  const gust = toNumber(series?.data?.instant?.details?.wind_speed_of_gust)
  const timeISO = typeof series?.time === 'string' ? series.time : undefined
  if (!timeISO) {
    return undefined
  }

  return { wind, gust, precip, timeISO }
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}`
  let response: Response

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    })
  } catch (error) {
    throw new Error(`Network error while fetching forecast: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!response.ok) {
    throw new Error(`MET API responded with ${response.status} ${response.statusText}`)
  }

  let payload: any
  try {
    payload = await response.json()
  } catch (error) {
    throw new Error('Failed to parse MET API response as JSON')
  }

  const series: any[] = Array.isArray(payload?.properties?.timeseries) ? payload.properties.timeseries : []
  if (series.length === 0) {
    throw new Error('MET API response missing timeseries data')
  }

  for (let i = 0; i < Math.min(MAX_SCAN, series.length); i += 1) {
    const forecast = extractForecast(series[i])
    if (forecast) {
      return forecast
    }
  }

  throw new Error('Unable to find suitable forecast data in MET response')
}
