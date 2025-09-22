import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAppStore } from '../../state/store'
import { ReportList, ReportRecord, ReportStatus } from './ReportList'

const CATEGORY_OPTIONS = [
  { value: 'litter', label: 'Marine Litter', icon: '🗑️' },
  { value: 'damage', label: 'Environmental Damage', icon: '🌊' },
  { value: 'wildlife', label: 'Wildlife Sighting', icon: '🐬' },
  { value: 'pollution', label: 'Pollution', icon: '🛢️' },
  { value: 'safety', label: 'Safety Hazard', icon: '⚠️' },
  { value: 'other', label: 'Other', icon: '📌' }
]

const STATUS_OPTIONS: ReportStatus[] = ['pending', 'verified', 'resolved']

function classifyReport(category: string, description: string): string {
  const text = description.toLowerCase()

  switch (category) {
    case 'litter':
      if (text.includes('plastic') || text.includes('bottle')) return 'High Priority — Plastic Pollution'
      if (text.includes('fishing') || text.includes('net')) return 'Medium Priority — Fishing Gear'
      return 'Low Priority — General Litter'
    case 'wildlife':
      if (text.includes('injured') || text.includes('stranded')) return 'URGENT — Injured Wildlife'
      if (text.includes('whale') || text.includes('dolphin')) return 'High Priority — Marine Mammal'
      return 'Medium Priority — Wildlife Observation'
    case 'pollution':
      if (text.includes('oil') || text.includes('chemical')) return 'URGENT — Chemical Pollution'
      if (text.includes('sewage') || text.includes('waste')) return 'High Priority — Waste Discharge'
      return 'Medium Priority — General Pollution'
    case 'damage':
      return 'High Priority — Environmental Impact'
    case 'safety':
      return 'URGENT — Safety Risk'
    default:
      return 'Medium Priority — General Report'
  }
}

function derivePriority(classification: string): 'urgent' | 'high' | 'medium' | 'low' {
  if (classification.includes('URGENT')) return 'urgent'
  if (classification.includes('High Priority')) return 'high'
  if (classification.includes('Medium Priority')) return 'medium'
  return 'low'
}

function buildLocationLabel(userLocationName?: string): string {
  if (!userLocationName) {
    return 'Unknown location'
  }
  return `Near ${userLocationName}`
}

export function ReportForm() {
  const { userLocation } = useAppStore()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPhotoName('')
      setPhotoDataUrl(null)
      return
    }
    setPhotoName(file.name)

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!category || !description) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 900))

    const classification = classifyReport(category, description)
    const priority = derivePriority(classification)

    const newReport: ReportRecord = {
      id: `report-${Date.now()}`,
      category,
      description,
      location: buildLocationLabel(userLocation?.nearestCity?.name),
      coordinates: userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : undefined,
      timestamp: new Date().toISOString(),
      aiClassification: classification,
      status: 'pending',
      priority,
      photoUrl: photoDataUrl ?? undefined
    }

    setReports((prev) => [newReport, ...prev])
    setCategory('')
    setDescription('')
    setPhotoDataUrl(null)
    setPhotoName('')
    setIsSubmitting(false)
  }

  const handleStatusChange = (id: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, status } : report))
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Citizen Reporting</h3>
        <p className="text-sm text-gray-600">
          Submit coastal incidents, environmental concerns, or wildlife encounters. Reports are auto-tagged with your
          position and prioritised with a lightweight AI classifier.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what you observed in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo Upload (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {photoName ? `Selected: ${photoName}` : 'Click to upload photo evidence'}
                  </p>
                </label>
                {photoDataUrl && (
                  <img
                    src={photoDataUrl}
                    alt="Report preview"
                    className="mt-4 h-32 w-full object-cover rounded-md border border-gray-200"
                  />
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-900">Auto geotagging</span>
              </div>
              <p className="text-xs text-blue-800">
                {userLocation
                  ? `Coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'Enable location access to attach coordinates automatically.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!category || !description || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Classifying…</span>
              </>
            ) : (
              <span>Submit report</span>
            )}
          </button>
        </div>
      </form>

      <ReportList
        categories={CATEGORY_OPTIONS}
        reports={reports}
        statusOptions={STATUS_OPTIONS}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
