import { useMemo, useState } from 'react'
import { useAppStore } from '../../state/store'
import { haversineKm } from '../../lib/geo'
import { scoreRisk } from '../../utils/risk'

const KILOMETRE_PER_NAUTICAL_MILE = 1.852

const EVENT_PROFILES = {
  storm: {
    label: 'Severe Storm',
    cruiseKnots: 14,
    baseChecklist: [
      'Activate severe weather protocol and incident command structure',
      'Issue marine weather bulletin to civilian vessels',
      'Stage evacuation transport near vulnerable coastal assets',
      'Maintain hourly liaison with MET office for forecast updates'
    ],
    recommendedResources: ['Coast Guard Vessel', 'Rescue Helicopter', 'Weather Monitoring Station']
  },
  oil: {
    label: 'Oil Spill',
    cruiseKnots: 10,
    baseChecklist: [
      'Map spill perimeter and drift trajectory',
      'Deploy containment booms down-current first',
      'Notify environmental directorate and fisheries authorities',
      'Initiate wildlife impact monitoring and rehabilitation teams'
    ],
    recommendedResources: ['Oil Spill Response Unit', 'Diving Team', 'Communication Equipment']
  },
  search: {
    label: 'Search & Rescue',
    cruiseKnots: 16,
    baseChecklist: [
      'Assign on-scene commander and rescue sectors',
      'Broadcast PAN-PAN / MAYDAY relay as appropriate',
      'Coordinate air and surface search patterns',
      'Establish medevac staging with local hospitals'
    ],
    recommendedResources: ['Rescue Helicopter', 'Coast Guard Vessel', 'Emergency Medical Team']
  },
  medical: {
    label: 'Medical Emergency',
    cruiseKnots: 15,
    baseChecklist: [
      'Confirm casualty status and required medical support',
      'Prepare triage area and medevac transport',
      'Coordinate with nearest hospital for intake readiness',
      'Ensure redundancy for critical communications'
    ],
    recommendedResources: ['Emergency Medical Team', 'Rescue Helicopter', 'Communication Equipment']
  }
} as const

type EventKey = keyof typeof EVENT_PROFILES

type EmergencyPlan = {
  eventKey: EventKey
  eventLabel: string
  startPoint: string
  resources: string[]
  suggestedResources: string[]
  route: string[]
  checklist: string[]
  distanceNm: number
  cruiseKnots: number
  etaHours: number
  etaHuman: string
}

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

function formatDuration(hours: number): string {
  const totalMinutes = Math.max(1, Math.round(hours * 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) {
    return `${m} min`
  }
  if (m === 0) {
    return `${h} h`
  }
  return `${h} h ${m} min`
}

function summaryChecklist(
  base: string[],
  resources: string[],
  eventKey: EventKey
): string[] {
  const targetedSteps: string[] = []

  if (eventKey === 'storm') {
    if (resources.includes('Rescue Helicopter')) {
      targetedSteps.push('Deploy rotary wing unit to perform aerial damage reconnaissance')
    }
    if (resources.includes('Emergency Medical Team')) {
      targetedSteps.push('Pre-position EMT near evacuation shelters for rapid response')
    }
  }

  if (eventKey === 'oil') {
    if (resources.includes('Oil Spill Response Unit')) {
      targetedSteps.push('Mobilise skimmers and sorbent teams to high-risk shoreline sectors')
    }
    if (resources.includes('Diving Team')) {
      targetedSteps.push('Assign dive team to inspect sub-surface leak source and valves')
    }
  }

  if (eventKey === 'search') {
    if (resources.includes('Rescue Helicopter')) {
      targetedSteps.push('Brief aircrew on expanding square search pattern over incident datum')
    }
    if (resources.includes('Coast Guard Vessel')) {
      targetedSteps.push('Task lead vessel with on-scene coordination channel and SAR patterns')
    }
  }

  if (eventKey === 'medical') {
    if (resources.includes('Emergency Medical Team')) {
      targetedSteps.push('Configure forward triage post with ALS capability')
    }
    if (resources.includes('Rescue Helicopter')) {
      targetedSteps.push('Schedule medevac rotation slots with hospital helipad liaison')
    }
  }

  return [...base, ...targetedSteps, 'Document actions and maintain unified communications log']
}

function computeRoute(start: { lat: number; lng: number; name: string }, others: typeof start[], limit = 2) {
  const sorted = others
    .map((city) => ({
      city,
      distanceKm: haversineKm({ lat: start.lat, lon: start.lng }, { lat: city.lat, lon: city.lng })
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)

  const route = [start.name, ...sorted.map((entry) => entry.city.name)]
  const totalDistanceKm = sorted.reduce((sum, entry, index) => {
    const from = index === 0 ? start : sorted[index - 1].city
    const to = entry.city
    return sum + haversineKm({ lat: from.lat, lon: from.lng }, { lat: to.lat, lon: to.lng })
  }, 0)

  return {
    route,
    totalDistanceKm
  }
}

function kmToNm(km: number): number {
  return km / KILOMETRE_PER_NAUTICAL_MILE
}

export function ResponsePlanner() {
  const { cities } = useAppStore()
  const [eventKey, setEventKey] = useState<EventKey | ''>('')
  const [startPoint, setStartPoint] = useState('')
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [plan, setPlan] = useState<EmergencyPlan | null>(null)

  const cityLookup = useMemo(() => {
    return new Map(cities.map((city) => [city.name, city]))
  }, [cities])

  const generatePlan = () => {
    if (!eventKey || !startPoint) {
      return
    }

    const profile = EVENT_PROFILES[eventKey]
    const startCity = cityLookup.get(startPoint)
    if (!startCity) {
      return
    }

    const otherCities = cities.filter((city) => city.name !== startPoint)
    const { route, totalDistanceKm } = computeRoute(startCity, otherCities)

    const distanceNm = kmToNm(totalDistanceKm)
    const speedKnots = profile.cruiseKnots
    const etaHours = distanceNm === 0 ? 0.5 : distanceNm / speedKnots

    const checklist = summaryChecklist(profile.baseChecklist, selectedResources, eventKey)

    const suggestedResources = profile.recommendedResources.filter((resource) => !selectedResources.includes(resource))

    setPlan({
      eventKey,
      eventLabel: profile.label,
      startPoint,
      resources: selectedResources,
      suggestedResources,
      route,
      checklist,
      distanceNm,
      cruiseKnots: speedKnots,
      etaHours,
      etaHuman: formatDuration(etaHours)
    })
  }

  const toggleResource = (resource: string) => {
    setSelectedResources((previous) =>
      previous.includes(resource)
        ? previous.filter((item) => item !== resource)
        : [...previous, resource]
    )
  }

  const routeRiskSummary = useMemo(() => {
    if (!plan) {
      return null
    }
    const risks = plan.route
      .map((name) => cityLookup.get(name))
      .filter(Boolean)
      .map((city) => {
        const weather = city!.weather
        if (!weather) {
          return 'unknown'
        }
        return scoreRisk({
          wind: weather.wind,
          gust: weather.gust ?? weather.wind,
          precip: weather.precip
        })
      })
    return risks
  }, [plan, cityLookup])

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Response Planner</h3>
        <p className="text-sm text-gray-600">
          Configure rapid-response routes, estimate arrival windows, and tailor action checklists for coastal incidents.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={eventKey}
              onChange={(event) => setEventKey(event.target.value as EventKey | '')}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Point</label>
            <select
              value={startPoint}
              onChange={(event) => setStartPoint(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select staging location</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Resources</label>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-gray-300 rounded-md p-3">
            {resourceOptions.map((resource) => (
              <label key={resource} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(resource)}
                  onChange={() => toggleResource(resource)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{resource}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          onClick={generatePlan}
          disabled={!eventKey || !startPoint}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Generate Emergency Plan
        </button>
      </div>

      {plan && (
        <section className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-red-900">{plan.eventLabel}</h4>
              <p className="text-sm text-red-800">
                Launching from <span className="font-semibold">{plan.startPoint}</span> • Cruise speed {plan.cruiseKnots} kn
              </p>
              <p className="text-sm text-red-800">
                Estimated arrival in <span className="font-semibold">{plan.etaHuman}</span> (≈{plan.distanceNm.toFixed(1)} nm total)
              </p>
            </div>
            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium uppercase">
              {plan.eventLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-red-900 mb-2">Route Plan</h5>
                <div className="space-y-2">
                  {plan.route.map((point, index) => (
                    <div key={point} className="flex items-center text-sm text-red-800">
                      <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="ml-3">{point}</span>
                    </div>
                  ))}
                </div>
                {routeRiskSummary && (
                  <p className="mt-2 text-xs text-red-700">
                    Segment risks: {routeRiskSummary.join(' → ')}
                  </p>
                )}
              </div>

              <div>
                <h5 className="font-medium text-red-900 mb-2">Resources</h5>
                <div className="space-y-1">
                  {plan.resources.length > 0 ? (
                    plan.resources.map((resource) => (
                      <div key={resource} className="flex items-center space-x-2 text-sm text-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{resource}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-red-700">No assets selected yet — consider adding the recommended capabilities below.</p>
                  )}
                </div>

                {plan.suggestedResources.length > 0 && (
                  <div className="mt-3 bg-white/70 border border-red-100 rounded-md p-3">
                    <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Suggested additions</p>
                    <ul className="mt-1 space-y-1 text-xs text-red-700">
                      {plan.suggestedResources.map((resource) => (
                        <li key={resource}>• {resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-red-900 mb-2">Action Checklist</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {plan.checklist.map((item, index) => (
                  <label key={`${item}-${index}`} className="flex items-start space-x-2 text-sm text-red-800">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
