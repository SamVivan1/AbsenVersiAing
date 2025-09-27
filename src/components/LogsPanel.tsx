import { useState } from 'react'
import { Search, Download, Filter, FileText, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { AttendanceLog } from '../types'
import { cn } from '../utils/cn'

interface LogsPanelProps {
  logs: AttendanceLog[]
}

export default function LogsPanel({ logs }: LogsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<AttendanceLog['type'] | 'all'>('all')

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'all' || log.type === filterType
    return matchesSearch && matchesFilter
  })

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

  const getBadgeClass = (type: AttendanceLog['type']) => {
    switch (type) {
      case 'success':
        return 'badge-success'
      case 'error':
        return 'badge-error'
      case 'warning':
        return 'badge-warning'
      case 'info':
      default:
        return 'badge-info'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Message', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.type,
        log.message,
        log.details || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
        <button
          onClick={exportLogs}
          className="btn-secondary"
          disabled={filteredLogs.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AttendanceLog['type'] | 'all')}
            className="input pl-10 pr-8"
          >
            <option value="all">All Types</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {logs.length === 0 ? 'No logs available' : 'No logs match your search'}
            </p>
            <p className="text-sm text-gray-400">
              {logs.length === 0 
                ? 'System logs will appear here when the automation runs'
                : 'Try adjusting your search terms or filters'
              }
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const Icon = getIcon(log.type)
            return (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 border border-gray-100"
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 mt-0.5",
                  getIconColor(log.type)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={cn("badge", getBadgeClass(log.type))}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.message}
                  </p>
                  {log.details && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}