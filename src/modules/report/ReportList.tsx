import { useMemo, useState } from 'react'

export type ReportStatus = 'pending' | 'verified' | 'resolved'
export type ReportPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface ReportRecord {
  id: string
  category: string
  description: string
  location: string
  coordinates?: { lat: number; lng: number }
  timestamp: string
  aiClassification: string
  status: ReportStatus
  priority: ReportPriority
  photoUrl?: string
}

interface CategoryOption {
  value: string
  label: string
  icon: string
}

interface ReportListProps {
  categories: CategoryOption[]
  reports: ReportRecord[]
  statusOptions: ReportStatus[]
  onStatusChange: (id: string, status: ReportStatus) => void
}

const PRIORITY_LABEL: Record<ReportPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}

const PRIORITY_STYLES: Record<ReportPriority, string> = {
  urgent: 'bg-red-200 text-red-800',
  high: 'bg-orange-200 text-orange-800',
  medium: 'bg-yellow-200 text-yellow-800',
  low: 'bg-green-200 text-green-800'
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  verified: 'bg-blue-200 text-blue-800',
  resolved: 'bg-green-200 text-green-800'
}

export function ReportList({ categories, reports, statusOptions, onStatusChange }: ReportListProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | ReportPriority>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categoryMap = useMemo(() => {
    return new Map(categories.map((option) => [option.value, option]))
  }, [categories])

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return reports
      .filter((report) => (categoryFilter === 'all' ? true : report.category === categoryFilter))
      .filter((report) => (statusFilter === 'all' ? true : report.status === statusFilter))
      .filter((report) => (priorityFilter === 'all' ? true : report.priority === priorityFilter))
      .filter((report) => {
        if (!term) return true
        return (
          report.description.toLowerCase().includes(term) ||
          report.aiClassification.toLowerCase().includes(term) ||
          report.location.toLowerCase().includes(term)
        )
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [categoryFilter, priorityFilter, reports, searchTerm, statusFilter])

  if (reports.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
        Submitted reports appear here once logged.
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Recent reports</h4>
          <p className="text-xs text-gray-500">Filter by category, status, or AI-priority to triage incoming signals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search description or classification"
            className="w-full md:w-56 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All categories</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All priorities</option>
          {(['urgent', 'high', 'medium', 'low'] as ReportPriority[]).map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter('all')
            setStatusFilter('all')
            setPriorityFilter('all')
            setSearchTerm('')
          }}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear filters
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-700">
          No reports match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const categoryMeta = categoryMap.get(report.category)

            return (
              <article key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{categoryMeta?.icon ?? '📌'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{categoryMeta?.label ?? report.category}</p>
                      <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
                      {report.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_STYLES[report.priority]}`}>
                      {PRIORITY_LABEL[report.priority]}
                    </span>
                    <select
                      value={report.status}
                      onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          Mark {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </header>

                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt={`Report evidence ${report.id}`}
                    className="h-40 w-full object-cover rounded-md border border-gray-200"
                  />
                )}

                <p className="text-sm text-gray-700 whitespace-pre-line">{report.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">AI classification:</span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {report.aiClassification}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{report.location}</span>
                    {report.coordinates && (
                      <span>
                        ({report.coordinates.lat.toFixed(4)}, {report.coordinates.lng.toFixed(4)})
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
