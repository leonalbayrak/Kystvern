import { useState } from 'react'
import { useAppStore } from '../../state/store'

interface Report {
  id: string
  category: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  timestamp: string
  aiClassification: string
  status: 'pending' | 'verified' | 'resolved'
}

export function ReportForm() {
  const { userLocation } = useAppStore()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { value: 'litter', label: 'Marine Litter', icon: '🗑️' },
    { value: 'damage', label: 'Environmental Damage', icon: '⚠️' },
    { value: 'wildlife', label: 'Wildlife Sighting', icon: '🐋' },
    { value: 'pollution', label: 'Pollution', icon: '☠️' },
    { value: 'safety', label: 'Safety Hazard', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '📝' }
  ]

  const getAIClassification = (category: string, description: string): string => {
    // Simple AI classification placeholder
    const keywords = description.toLowerCase()
    
    if (category === 'litter') {
      if (keywords.includes('plastic') || keywords.includes('bottle')) {
        return 'High Priority - Plastic Pollution'
      } else if (keywords.includes('fishing') || keywords.includes('net')) {
        return 'Medium Priority - Fishing Gear'
      } else {
        return 'Low Priority - General Litter'
      }
    } else if (category === 'wildlife') {
      if (keywords.includes('injured') || keywords.includes('stranded')) {
        return 'URGENT - Injured Wildlife'
      } else if (keywords.includes('whale') || keywords.includes('dolphin')) {
        return 'High Priority - Marine Mammal'
      } else {
        return 'Medium Priority - Wildlife Observation'
      }
    } else if (category === 'pollution') {
      if (keywords.includes('oil') || keywords.includes('chemical')) {
        return 'URGENT - Chemical Pollution'
      } else if (keywords.includes('sewage') || keywords.includes('waste')) {
        return 'High Priority - Waste Discharge'
      } else {
        return 'Medium Priority - General Pollution'
      }
    } else if (category === 'damage') {
      return 'High Priority - Environmental Impact'
    } else if (category === 'safety') {
      return 'URGENT - Safety Risk'
    } else {
      return 'Medium Priority - General Report'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !description) return

    setIsSubmitting(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newReport: Report = {
      id: `report-${Date.now()}`,
      category,
      description,
      location: userLocation ? 'User Location' : 'Unknown Location',
      coordinates: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 0, lng: 0 },
      timestamp: new Date().toISOString(),
      aiClassification: getAIClassification(category, description),
      status: 'pending'
    }

    setReports(prev => [newReport, ...prev])
    setCategory('')
    setDescription('')
    setSelectedFile(null)
    setIsSubmitting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800'
      case 'verified': return 'bg-blue-200 text-blue-800'
      case 'resolved': return 'bg-green-200 text-green-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getPriorityColor = (classification: string) => {
    if (classification.includes('URGENT')) return 'bg-red-200 text-red-800'
    if (classification.includes('High Priority')) return 'bg-orange-200 text-orange-800'
    if (classification.includes('Medium Priority')) return 'bg-yellow-200 text-yellow-800'
    return 'bg-green-200 text-green-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Citizen Reporting</h3>
        <p className="text-sm text-gray-600 mb-4">
          Report coastal incidents, environmental issues, or wildlife sightings. AI-powered classification helps prioritize responses.
        </p>
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <label key={cat.value} className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Upload (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to upload photo'}
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Auto Geotagging</span>
              </div>
              <p className="text-xs text-blue-800">
                {userLocation 
                  ? `Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'Enable location access for automatic geotagging'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!category || !description || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing with AI...</span>
              </>
            ) : (
              <span>Submit Report</span>
            )}
          </button>
        </div>
      </form>

      {/* Reports List */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Recent Reports</h4>
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {categories.find(c => c.value === report.category)?.icon}
                    </span>
                    <span className="font-medium text-gray-900">
                      {categories.find(c => c.value === report.category)?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">{report.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">AI Classification:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.aiClassification)}`}>
                      {report.aiClassification}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{report.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
