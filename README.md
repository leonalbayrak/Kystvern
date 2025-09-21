# Kystvern - Coastal Risk Assessment

A modern React application for coastal risk assessment in Norwegian cities, providing real-time weather data and risk analysis.

## Features

- **Real-time Weather Data**: Integration with MET Norway's Locationforecast 2.0 API
- **Risk Assessment**: Automated risk calculation based on weather conditions
- **Interactive Map**: Leaflet-powered map with city markers and popups
- **Location Services**: "My Location" button for user positioning
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Modular Architecture**: Clean separation of concerns with TypeScript

## Supported Cities

- Bergen
- Stavanger
- Tromsø
- Bodø
- Ålesund
- Kristiansand

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Leaflet + React-Leaflet
- **Weather API**: MET Norway Locationforecast 2.0
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kystvern
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── app/          # App-level components
│   ├── map/          # Map-related components
│   └── risk/         # Risk assessment components
├── state/            # Zustand stores
├── lib/              # Utility libraries
├── utils/            # Helper functions
└── styles/           # CSS and styling
```

## Risk Assessment

The application calculates risk levels based on:

- **Wind Speed**: Higher wind speeds increase risk
- **Precipitation**: Heavy rainfall increases risk
- **Temperature**: Extreme cold increases risk
- **Cloud Coverage**: Affects visibility and conditions

Risk levels: Low, Medium, High, Critical

## Deployment

The application is configured for GitHub Pages deployment:

1. Build the project: `npm run build`
2. Copy `dist/*` to `docs/` directory
3. Push to GitHub - Pages will be served from the `docs/` folder

## API Usage

This application uses the MET Norway Locationforecast 2.0 API:
- **Endpoint**: `https://api.met.no/weatherapi/locationforecast/2.0/compact`
- **Documentation**: [MET Norway API Docs](https://api.met.no/weatherapi/locationforecast/2.0/documentation)
- **Rate Limits**: Please respect the API terms of service

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MET Norway for providing the weather data API
- OpenStreetMap for map tiles
- The React and TypeScript communities
