import { create } from 'zustand'
import { getForecast } from '../lib/met'
import { scoreRisk } from '../utils/risk'

export interface City {
  name: string
  lat: number
  lng: number
}

export interface WeatherData {
  time: string
  wind_speed: number
  wind_gust: number
  precipitation: number
  temperature: number
}

export interface CityWeather extends City {
  weather?: WeatherData
  riskLevel?: 'low' | 'moderate' | 'high' | 'severe'
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
  userLocation: City | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  alerts: Alert[]
  pollInterval: NodeJS.Timeout | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setUserLocation: (location: City | null) => void
  updateCityWeather: (cityName: string, weather: WeatherData) => void
  refreshAll: () => Promise<void>
  poll: (intervalMs: number) => void
  stopPoll: () => void
  generateAlerts: () => void
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
  updateCityWeather: (cityName, weather) => set((state) => ({
    cities: state.cities.map(city => 
      city.name === cityName ? { ...city, weather } : city
    )
  })),
  refreshAll: async () => {
    const state = get()
    set({ loading: true, error: null })
    
    try {
      const promises = state.cities.map(async (city) => {
        try {
          const forecast = await getForecast(city.lat, city.lng)
          const riskLevel = scoreRisk({
            wind: forecast.wind,
            gust: forecast.gust ?? 0,
            precip: forecast.precip
          })
          get().updateCityWeather(city.name, {
            time: new Date().toISOString(),
            wind_speed: forecast.wind,
            wind_gust: forecast.gust ?? 0,
            precipitation: forecast.precip,
            temperature: 0
          })
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
    const newAlerts: Alert[] = []
    
    state.cities.forEach(city => {
      if (city.weather) {
        const riskLevel = scoreRisk({
          wind: city.weather.wind_speed,
          gust: city.weather.wind_gust,
          precip: city.weather.precipitation
        })
        
        if (riskLevel === 'high' || riskLevel === 'severe') {
          newAlerts.push({
            id: `${city.name}-${Date.now()}`,
            city: city.name,
            level: riskLevel,
            message: `${city.name}: ${riskLevel.toUpperCase()} risk - Wind: ${city.weather.wind_speed.toFixed(1)} m/s, Precip: ${city.weather.precipitation.toFixed(1)} mm`,
            timestamp: new Date().toISOString()
          })
        }
      }
    })
    
    set({ alerts: newAlerts })
  }
}))
