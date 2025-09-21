import { useState } from 'react'
import { useAppStore } from '../../state/store'

interface EmergencyPlan {
  eventType: string
  startPoint: string
  resources: string[]
  route: string[]
  checklist: string[]
  estimatedTime: string
}

export function ResponsePlanner() {
  const { cities } = useAppStore()
  const [eventType, setEventType] = useState('')
  const [startPoint, setStartPoint] = useState('')
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [plan, setPlan] = useState<EmergencyPlan | null>(null)

  const resourceOptions = [
    'Coast Guard Vessel',
    'Rescue Helicopter',
    'Emergency Medical Team',
    'Oil Spill Response Unit',
    'Diving Team',
    'Communication Equipment',
    'Weather Monitoring Station',
    'Evacuation Boats'
  ]

  const generatePlan = () => {
    if (!eventType || !startPoint) return

    // Simple route calculation (nearest cities)
    const startCity = cities.find(c => c.name === startPoint)
    if (!startCity) return

    // Find nearest cities for route planning
    const otherCities = cities.filter(c => c.name !== startPoint)
    const route = [startPoint, ...otherCities.slice(0, 2).map(c => c.name)]

    // Generate checklist based on event type and resources
    const checklist: string[] = []
    
    if (eventType === 'storm') {
      checklist.push('Monitor weather conditions continuously')
      checklist.push('Establish communication with affected vessels')
      checklist.push('Prepare evacuation procedures')
      checklist.push('Coordinate with meteorological services')
      if (selectedResources.includes('Rescue Helicopter')) {
        checklist.push('Deploy rescue helicopter for aerial assessment')
      }
      if (selectedResources.includes('Emergency Medical Team')) {
        checklist.push('Position medical teams at safe locations')
      }
    } else if (eventType === 'oil') {
      checklist.push('Assess oil spill extent and direction')
      checklist.push('Deploy containment booms')
      checklist.push('Notify environmental agencies')
      checklist.push('Monitor wildlife impact')
      if (selectedResources.includes('Oil Spill Response Unit')) {
        checklist.push('Deploy specialized oil spill response equipment')
      }
      if (selectedResources.includes('Diving Team')) {
        checklist.push('Prepare diving team for underwater assessment')
      }
    }

    // Add common emergency procedures
    checklist.push('Establish incident command center')
    checklist.push('Notify relevant authorities')
    checklist.push('Document all actions and communications')
    checklist.push('Prepare public communication materials')

    // Estimate time based on resources and event type
    let estimatedTime = '2-4 hours'
    if (selectedResources.length > 4) estimatedTime = '4-6 hours'
    if (eventType === 'oil') estimatedTime = '6-12 hours'

    setPlan({
      eventType,
      startPoint,
      resources: selectedResources,
      route,
      checklist,
      estimatedTime
    })
  }

  const toggleResource = (resource: string) => {
    setSelectedResources(prev => 
      prev.includes(resource) 
        ? prev.filter(r => r !== resource)
        : [...prev, resource]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Response Planner</h3>
        <p className="text-sm text-gray-600 mb-4">
          Plan emergency response operations for coastal incidents with AI-powered route optimization and resource allocation.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select event type</option>
              <option value="storm">Severe Storm</option>
              <option value="oil">Oil Spill</option>
              <option value="search">Search & Rescue</option>
              <option value="medical">Medical Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Point
            </label>
            <select
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select starting location</option>
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Resources
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
            {resourceOptions.map(resource => (
              <label key={resource} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(resource)}
                  onChange={() => toggleResource(resource)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{resource}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Plan Button */}
      <div className="flex justify-center">
        <button
          onClick={generatePlan}
          disabled={!eventType || !startPoint}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Generate Emergency Plan
        </button>
      </div>

      {/* Generated Plan */}
      {plan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-red-900">Emergency Response Plan</h4>
            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {plan.eventType.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-red-900 mb-2">Route Plan</h5>
                <div className="flex items-center space-x-2">
                  {plan.route.map((point, index) => (
                    <div key={point} className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm text-red-800">{point}</span>
                      {index < plan.route.length - 1 && (
                        <svg className="w-4 h-4 text-red-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-red-900 mb-2">Resources</h5>
                <div className="space-y-1">
                  {plan.resources.map(resource => (
                    <div key={resource} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-800">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-red-900 mb-2">Estimated Response Time</h5>
                <p className="text-sm text-red-800">{plan.estimatedTime}</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-red-900 mb-2">Action Checklist</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {plan.checklist.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm text-red-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
