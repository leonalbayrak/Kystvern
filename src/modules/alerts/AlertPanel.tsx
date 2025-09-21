import { useAppStore } from '../../state/store'
import { badgeClasses } from '../../utils/risk'
import { useEffect, useState } from 'react'

export function AlertPanel() {
  const { alerts } = useAppStore()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission)
        })
      } else {
        setNotificationPermission(Notification.permission)
      }
    }
  }, [])

  // Show browser notifications for new alerts
  useEffect(() => {
    if (notificationPermission === 'granted' && alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1]
      if (latestAlert.level === 'severe' || latestAlert.level === 'high') {
        new Notification(`KystVern Alert: ${latestAlert.city}`, {
          body: latestAlert.message,
          icon: '/vite.svg',
          tag: latestAlert.id,
          requireInteraction: true
        })
      }
    }
  }, [alerts, notificationPermission])

  // Sort alerts by risk level (severe first, then high)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const levelOrder = { severe: 0, high: 1 }
    return levelOrder[a.level] - levelOrder[b.level]
  })

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
          <p className="text-sm text-gray-400">All coastal areas are safe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAlerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(alert.level)}`}>
                      {alert.level.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{alert.city}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4">
                  {alert.level === 'severe' ? (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
