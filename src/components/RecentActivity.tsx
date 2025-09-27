import { Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Info } from 'lucide-react'
import { AttendanceLog } from '../types'
import { cn } from '../utils/cn'

interface RecentActivityProps {
  logs: AttendanceLog[]
}

export default function RecentActivity({ logs }: RecentActivityProps) {
  const getIcon = (type: AttendanceLog['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'error':
        return XCircle
      case 'warning':
        return AlertCircle
      case 'info':
      default:
        return Info
    }
  }

  const getIconColor = (type: AttendanceLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-success-500'
      case 'error':
        return 'text-error-500'
      case 'warning':
        return 'text-warning-500'
      case 'info':
      default:
        return 'text-primary-500'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">Activity logs will appear here</p>
          </div>
        ) : (
          logs.slice(0, 5).map((log) => {
            const Icon = getIcon(log.type)
            return (
              <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full bg-gray-100",
                  getIconColor(log.type)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {log.message}
                  </p>
                  {log.details && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {log.details}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(log.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {logs.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  )
}