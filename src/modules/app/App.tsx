import { useAppStore } from '../../state/store'
import { RiskGrid } from '../risk/RiskGrid'
import { MapPanel } from '../map/MapPanel'
import { AlertPanel } from '../alerts/AlertPanel'
import { FisheriesAdvisor } from '../fish/FisheriesAdvisor'
import { ResponsePlanner } from '../emergency/ResponsePlanner'
import { ReportForm } from '../report/ReportForm'
import { ScenarioSimulator } from '../scenario/ScenarioSimulator'
import { Card } from '../../components/Card'
import { useState } from 'react'

function App() {
  const { loading, error, setUserLocation } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            name: 'My Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'fisheries', label: 'Fisheries', icon: '🐟' },
    { id: 'emergency', label: 'Emergency', icon: '🚑' },
    { id: 'reporting', label: 'Reporting', icon: '📝' },
    { id: 'scenario', label: 'Climate', icon: '🌊' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card title="Risk & Alerts">
                <RiskGrid />
              </Card>
              <Card title="Active Alerts">
                <AlertPanel />
              </Card>
            </div>
            <div className="space-y-6">
              <Card title="Map & Tools">
                <MapPanel />
              </Card>
            </div>
          </div>
        )
      case 'alerts':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="Risk Alerts & Notifications">
              <AlertPanel />
            </Card>
          </div>
        )
      case 'fisheries':
        return (
          <div className="max-w-6xl mx-auto">
            <Card title="Fisheries Advisor">
              <FisheriesAdvisor />
            </Card>
          </div>
        )
      case 'emergency':
        return (
          <div className="max-w-6xl mx-auto">
            <Card title="Emergency Response Planner">
              <ResponsePlanner />
            </Card>
          </div>
        )
      case 'reporting':
        return (
          <div className="max-w-6xl mx-auto">
            <Card title="Citizen Reporting">
              <ReportForm />
            </Card>
          </div>
        )
      case 'scenario':
        return (
          <div className="max-w-6xl mx-auto">
            <Card title="Climate Scenario Simulator">
              <ScenarioSimulator />
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <h1 className="text-xl font-bold text-white">KystVern AI</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMyLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>My Location</span>
              </button>
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="border-t border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700">Loading weather data...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}

export default App
