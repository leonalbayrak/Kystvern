import { create } from 'zustand'
import { getForecast } from '../lib/met'
import { nearestCity } from '../lib/geo'
import { scoreRisk } from '../utils/risk'

export interface City {
  name: string
  lat: number
  lng: number
}

export interface WeatherData {
  wind: number
  gust?: number
  precip: number
  timeISO: string
}

export interface CityWeather extends City {
  weather?: WeatherData
  riskLevel?: 'low' | 'moderate' | 'high' | 'severe'
  nearestCity?: { name: string; distanceKm: number }
}

export interface Alert {
  id: string
  city: string
  level: 'high' | 'severe'
  message: string
  timestamp: string
}

interface AppState {
  cities: CityWeather[]
  userLocation: CityWeather | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  alerts: Alert[]
  pollInterval: number | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setUserLocation: (location: CityWeather | null) => void
  updateCityWeather: (cityName: string, weather: WeatherData) => void
  refreshAll: () => Promise<void>
  poll: (intervalMs: number) => void
  stopPoll: () => void
  generateAlerts: () => void
  getNearestCityLabel: (c: CityWeather) => string
}

export const CITIES: City[] = [
  { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
  { name: 'Stavanger', lat: 58.9700, lng: 5.7331 },
  { name: 'Tromsø', lat: 69.6492, lng: 18.9553 },
  { name: 'Bodø', lat: 67.2804, lng: 14.4049 },
  { name: 'Ålesund', lat: 62.4722, lng: 6.1549 },
  { name: 'Kristiansand', lat: 58.1467, lng: 7.9956 }
]

export const useAppStore = create<AppState>((set, get) => ({
  cities: CITIES.map(city => ({ ...city })),
  userLocation: null,
  loading: false,
  error: null,
  lastUpdated: null,
  alerts: [],
  pollInterval: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setUserLocation: (userLocation) => set({ userLocation }),
  getNearestCityLabel: (c: CityWeather): string => {
    if (!c.nearestCity) return c.name
    return `${c.nearestCity.name} area • ${c.nearestCity.distanceKm.toFixed(1)} km`
  },
  updateCityWeather: (cityName, weather) => set((state) => {
    const riskLevel = scoreRisk({
      wind: weather.wind,
      gust: weather.gust ?? weather.wind,
      precip: weather.precip
    })
    
    return {
      cities: state.cities.map(city =>
        city.name === cityName ? { ...city, weather, riskLevel } : city
      )
    }
  }),
  refreshAll: async () => {
    const state = get()
    set({ loading: true, error: null })
    
    try {
      const promises = state.cities.map(async (city) => {
        try {
          const forecast = await getForecast(city.lat, city.lng)
          get().updateCityWeather(city.name, forecast)
        } catch (err) {
          console.error(`Failed to fetch weather for ${city.name}:`, err)
        }
      })
      
      await Promise.all(promises)
      set({ lastUpdated: new Date().toISOString() })
      get().generateAlerts()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to refresh weather data' })
    } finally {
      set({ loading: false })
    }
  },
  poll: (intervalMs: number) => {
    const state = get()
    if (state.pollInterval) {
      clearInterval(state.pollInterval)
    }
    
    const interval = setInterval(() => {
      get().refreshAll()
    }, intervalMs)
    
    set({ pollInterval: interval })
  },
  stopPoll: () => {
    const state = get()
    if (state.pollInterval) {
      clearInterval(state.pollInterval)
      set({ pollInterval: null })
    }
  },
  generateAlerts: () => {
    const state = get()
    const locations = [
      ...state.cities,
      ...(state.userLocation ? [state.userLocation] : [])
    ]

    const alerts = locations.reduce<Alert[]>((acc, location) => {
      const weather = location.weather
      if (!weather) {
        return acc
      }

      const riskLevel = location.riskLevel ?? scoreRisk({
        wind: weather.wind,
        gust: weather.gust ?? weather.wind,
        precip: weather.precip
      })

      if (riskLevel !== "high" && riskLevel !== "severe") {
        return acc
      }

      acc.push({
        id: `${location.name}-${weather.timeISO ?? Date.now()}`,
        city: location.name,
        level: riskLevel,
        message: `${location.name}: ${riskLevel.toUpperCase()} risk - Wind: ${weather.wind.toFixed(1)} m/s, Precip: ${weather.precip.toFixed(1)} mm`,
        timestamp: weather.timeISO ?? new Date().toISOString()
      })
      return acc
    }, [])

    alerts.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level === "severe" ? -1 : 1
      }
      return b.timestamp.localeCompare(a.timestamp)
    })

    set({ alerts })
  }
}))

// Add prependMyLocation function
export const prependMyLocation = async (lat: number, lon: number) => {
  const { setUserLocation } = useAppStore.getState()
  
  // Find nearest city
  const nearest = nearestCity(lat, lon, CITIES)
  
  // Fetch forecast
  const forecast = await getForecast(lat, lon)
  const riskLevel = scoreRisk({
    wind: forecast.wind,
    gust: forecast.gust ?? forecast.wind,
    precip: forecast.precip
  })
  
  // Create user location with nearest city info
  const userLocation: CityWeather = {
    name: 'My Location',
    lat,
    lng: lon,
    weather: forecast,
    riskLevel,
    nearestCity: nearest
  }
  
  setUserLocation(userLocation)
}


