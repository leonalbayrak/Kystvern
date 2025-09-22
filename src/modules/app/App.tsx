import { Fragment, useMemo, useState } from 'react'
import { prependMyLocation, useAppStore } from '../../state/store'
import { RiskGrid } from '../risk/RiskGrid'
import { AlertPanel } from '../alerts/AlertPanel'
import { MapPanel } from '../map/MapPanel'
import { FisheriesAdvisor } from '../fish/FisheriesAdvisor'
import { ResponsePlanner } from '../emergency/ResponsePlanner'
import { ReportForm } from '../report/ReportForm'
import { ScenarioSimulator } from '../scenario/ScenarioSimulator'
import { Card } from '../../components/Card'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'map', label: 'Map' },
  { id: 'fisheries', label: 'Fisheries' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'scenario', label: 'Climate' }
] as const

export function App() {
  const { loading, error, userLocation } = useAppStore()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('overview')

  const locationLabel = useMemo(() => {
    if (!userLocation) {
      return 'My location'
    }
    if (userLocation.nearestCity) {
      const { name, distanceKm } = userLocation.nearestCity
      return `${name} • ${distanceKm.toFixed(1)} km`
    }
    return `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`
  }, [userLocation])

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        prependMyLocation(position.coords.latitude, position.coords.longitude)
      },
      (geoError) => {
        console.error('Geolocation error', geoError)
      }
    )
  }

  const overview = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Risk assessment">
          <RiskGrid />
        </Card>
        <Card title="Active alerts">
          <AlertPanel />
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Operations map">
          <MapPanel />
        </Card>
        <Card title="Fisheries snapshot">
          <FisheriesAdvisor />
        </Card>
      </div>
    </div>
  )

  const panels: Record<(typeof TABS)[number]['id'], JSX.Element> = {
    overview,
    alerts: (
      <div className="max-w-5xl mx-auto">
        <Card title="Alert management">
          <AlertPanel />
        </Card>
      </div>
    ),
    map: (
      <div className="max-w-5xl mx-auto">
        <Card title="Map operations">
          <MapPanel />
        </Card>
      </div>
    ),
    fisheries: (
      <div className="max-w-6xl mx-auto">
        <Card title="Fisheries advisor">
          <FisheriesAdvisor />
        </Card>
      </div>
    ),
    emergency: (
      <div className="max-w-6xl mx-auto">
        <Card title="Emergency response planner">
          <ResponsePlanner />
        </Card>
      </div>
    ),
    reporting: (
      <div className="max-w-6xl mx-auto">
        <Card title="Citizen reporting">
          <ReportForm />
        </Card>
      </div>
    ),
    scenario: (
      <div className="max-w-6xl mx-auto">
        <Card title="Climate scenario simulator">
          <ScenarioSimulator />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                KV
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-300">Norway coastal intelligence</p>
                <h1 className="text-xl font-semibold text-white">KystVern AI</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMyLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {userLocation ? 'Refresh my location' : 'Locate me'}
              </button>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  {locationLabel}
                </span>
              </div>
            </div>
          </div>
          <nav className="border-t border-gray-700 flex flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              <span className="text-gray-700">Loading weather data…</span>
            </div>
          </div>
        )}

        <Fragment>{panels[activeTab]}</Fragment>
      </main>
    </div>
  )
}

export default App
