import { create } from 'zustand'

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
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Severe'
}

interface AppState {
  cities: CityWeather[]
  userLocation: City | null
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setUserLocation: (location: City | null) => void
  updateCityWeather: (cityName: string, weather: WeatherData) => void
}

export const CITIES: City[] = [
  { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
  { name: 'Stavanger', lat: 58.9700, lng: 5.7331 },
  { name: 'Tromsø', lat: 69.6492, lng: 18.9553 },
  { name: 'Bodø', lat: 67.2804, lng: 14.4049 },
  { name: 'Ålesund', lat: 62.4722, lng: 6.1549 },
  { name: 'Kristiansand', lat: 58.1467, lng: 7.9956 }
]

export const useAppStore = create<AppState>((set) => ({
  cities: CITIES.map(city => ({ ...city })),
  userLocation: null,
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setUserLocation: (userLocation) => set({ userLocation }),
  updateCityWeather: (cityName, weather) => set((state) => ({
    cities: state.cities.map(city => 
      city.name === cityName ? { ...city, weather } : city
    )
  }))
}))
