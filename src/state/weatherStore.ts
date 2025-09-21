import { create } from 'zustand'
import { CityWeather, NORWEGIAN_CITIES, fetchWeatherData, processWeatherData, calculateRiskLevel } from '../lib/weather'

interface WeatherState {
  cities: Record<string, CityWeather>
  loading: boolean
  error: string | null
  fetchWeatherForCity: (cityName: string) => Promise<void>
  fetchAllCities: () => Promise<void>
  getRiskLevel: (cityName: string) => 'Low' | 'Medium' | 'High' | 'Critical'
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  cities: {},
  loading: false,
  error: null,

  fetchWeatherForCity: async (cityName: string) => {
    const city = NORWEGIAN_CITIES.find(c => c.name === cityName)
    if (!city) {
      set({ error: `City ${cityName} not found` })
      return
    }

    set({ loading: true, error: null })

    try {
      const forecast = await fetchWeatherData(city.lat, city.lng)
      const weatherData = processWeatherData(forecast)
      weatherData.city = cityName

      set(state => ({
        cities: {
          ...state.cities,
          [cityName]: weatherData
        },
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
        loading: false 
      })
    }
  },

  fetchAllCities: async () => {
    set({ loading: true, error: null })

    try {
      const promises = NORWEGIAN_CITIES.map(async (city) => {
        try {
          const forecast = await fetchWeatherData(city.lat, city.lng)
          const weatherData = processWeatherData(forecast)
          weatherData.city = city.name
          return { cityName: city.name, weatherData }
        } catch (error) {
          console.error(`Failed to fetch weather for ${city.name}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      const cities: Record<string, CityWeather> = {}

      results.forEach(result => {
        if (result) {
          cities[result.cityName] = result.weatherData
        }
      })

      set({ cities, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
        loading: false 
      })
    }
  },

  getRiskLevel: (cityName: string) => {
    const city = get().cities[cityName]
    if (!city || !city.current) return 'Low'
    return calculateRiskLevel(city.current)
  }
}))
