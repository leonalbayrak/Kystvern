# Source Code Documentation

This directory contains the source code for the Kystvern application.

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Modules (`src/modules/`)

- **`app/`**: Application-level components and layouts
- **`map/`**: Map-related components using Leaflet
- **`risk/`**: Risk assessment and display components

### State Management (`src/state/`)

- **`weatherStore.ts`**: Zustand store for weather data and API calls

### Libraries (`src/lib/`)

- **`weather.ts`**: MET Norway API integration and weather data processing

### Utilities (`src/utils/`)

- Helper functions and utilities (to be expanded)

### Styles (`src/styles/`)

- **`index.css`**: Global styles and Tailwind imports
- **`App.css`**: Application-specific styles

## Key Components

### RiskGrid Component

Located in `src/modules/risk/RiskGrid.tsx`

- Displays risk assessment for all Norwegian cities
- Shows real-time weather data
- Handles city selection
- Includes loading and error states

### WeatherMap Component

Located in `src/modules/map/WeatherMap.tsx`

- Interactive Leaflet map
- City markers with weather popups
- User location marker
- Dynamic map centering based on selection

### Weather Store

Located in `src/state/weatherStore.ts`

- Manages weather data state
- Handles API calls to MET Norway
- Provides risk level calculations
- Error handling and loading states

## Data Flow

1. **Initialization**: App loads and fetches weather data for all cities
2. **User Interaction**: User selects city or requests location
3. **State Updates**: Zustand store updates with new data
4. **UI Updates**: Components re-render with new data
5. **Map Updates**: Map centers on selected city and shows updated markers

## API Integration

The application integrates with MET Norway's Locationforecast 2.0 API:

- **Base URL**: `https://api.met.no/weatherapi/locationforecast/2.0/compact`
- **Parameters**: `lat` and `lon` for coordinates
- **Headers**: User-Agent required for API access
- **Response**: JSON with weather timeseries data

## Risk Calculation

Risk levels are calculated based on multiple weather factors:

```typescript
function calculateRiskLevel(weather: WeatherData): RiskLevel {
  let riskScore = 0
  
  // Wind speed risk
  if (weather.wind_speed > 20) riskScore += 3
  else if (weather.wind_speed > 15) riskScore += 2
  else if (weather.wind_speed > 10) riskScore += 1
  
  // Precipitation risk
  if (weather.precipitation_amount > 5) riskScore += 3
  else if (weather.precipitation_amount > 2) riskScore += 2
  else if (weather.precipitation_amount > 0.5) riskScore += 1
  
  // Temperature risk
  if (weather.air_temperature < -10) riskScore += 2
  else if (weather.air_temperature < -5) riskScore += 1
  
  // Cloud coverage
  if (weather.cloud_area_fraction > 0.8) riskScore += 1
  
  return riskScore >= 6 ? 'Critical' : 
         riskScore >= 4 ? 'High' : 
         riskScore >= 2 ? 'Medium' : 'Low'
}
```

## Development Guidelines

### Component Structure

- Use functional components with hooks
- Implement proper TypeScript types
- Follow React best practices
- Use Tailwind for styling

### State Management

- Use Zustand for global state
- Keep local state minimal
- Implement proper error handling
- Use loading states for async operations

### API Calls

- Handle errors gracefully
- Implement retry logic where appropriate
- Use proper loading states
- Respect API rate limits

## Testing

Testing setup to be implemented:

- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests for user workflows
