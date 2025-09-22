import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../state/store'
import { badgeClasses } from '../../utils/risk'

const severityCard = {
  severe: 'border-red-200 bg-red-50',
  high: 'border-orange-200 bg-orange-50'
} as const

const severityIcon = {
  severe: 'text-red-500',
  high: 'text-orange-500'
} as const

const localeOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: 'short'
}

export function AlertPanel() {
  const { alerts } = useAppStore()
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof Notification === 'undefined') {
      return 'denied'
    }
    return Notification.permission
  })
  const seenIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  useEffect(() => {
    if (typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((status) => {
        setPermission(status)
      })
    } else {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (typeof Notification === 'undefined' || permission !== 'granted') {
      return
    }

    const current = seenIds.current
    const newAlerts = alerts.filter((alert) => !current.has(alert.id))

    if (!initialized.current) {
      newAlerts.forEach((alert) => current.add(alert.id))
      initialized.current = true
      return
    }

    newAlerts.forEach((alert) => {
      current.add(alert.id)
      new Notification(`KystVern Alert: ${alert.city}`, {
        body: alert.message,
        tag: alert.id,
        requireInteraction: alert.level === 'severe'
      })
    })
  }, [alerts, permission])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Risk Alerts</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-500">{alerts.length} active</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No active alerts</p>
          <p className="text-sm text-gray-400">All monitored areas look stable</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const accent = severityCard[alert.level]
            const iconTint = severityIcon[alert.level]

            return (
              <div key={alert.id} className={`border rounded-lg p-4 bg-white ${accent}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(alert.level)}`}>
                        {alert.level.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{alert.city}</span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString(undefined, localeOptions)}
                    </p>
                  </div>
                  <div className={`ml-4 ${iconTint}`}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
