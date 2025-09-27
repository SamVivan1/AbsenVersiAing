import { useState, useEffect } from 'react'
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import StatsCard from './StatsCard'
import RecentActivity from './RecentActivity'
import ConfigPanel from './ConfigPanel'
import SchedulePanel from './SchedulePanel'
import LogsPanel from './LogsPanel'
import { AttendanceLog, Schedule, Config, Stats } from '../types'

interface DashboardProps {
  isRunning: boolean
}

export default function Dashboard({ isRunning }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'schedule' | 'logs'>('overview')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  
  // Mock data - in real app, this would come from your backend
  const [stats] = useState<Stats>({
    totalAttempts: 156,
    successfulAttempts: 142,
    failedAttempts: 14,
    lastRun: '2025-01-27T08:30:00Z',
    uptime: '7 days, 14 hours'
  })

  const [logs, setLogs] = useState<AttendanceLog[]>([
    {
      id: '1',
      timestamp: '2025-01-27T08:30:00Z',
      type: 'success',
      message: 'Attendance marked successfully',
      details: 'Algoritma Pemrograman - Monday 08:30'
    },
    {
      id: '2',
      timestamp: '2025-01-27T08:29:45Z',
      type: 'info',
      message: 'Starting attendance process',
      details: 'Checking for active schedules...'
    },
    {
      id: '3',
      timestamp: '2025-01-26T14:15:30Z',
      type: 'warning',
      message: 'Login attempt took longer than expected',
      details: 'Connection timeout increased to 30 seconds'
    },
    {
      id: '4',
      timestamp: '2025-01-26T10:00:15Z',
      type: 'error',
      message: 'Failed to mark attendance',
      details: 'No attendance button found - possibly no active schedule'
    },
    {
      id: '5',
      timestamp: '2025-01-26T09:59:50Z',
      type: 'success',
      message: 'Login successful',
      details: 'Connected to SIM Kuliah USK'
    }
  ])

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Algoritma Pemrograman',
      day: 'Monday',
      time: '08:30',
      enabled: true
    },
    {
      id: '2',
      name: 'Basis Data',
      day: 'Tuesday',
      time: '10:00',
      enabled: true
    },
    {
      id: '3',
      name: 'Rekayasa Perangkat Lunak',
      day: 'Wednesday',
      time: '13:30',
      enabled: false
    }
  ])

  const [config, setConfig] = useState<Config>({
    username: '',
    password: '',
    headless: true,
    retryAttempts: 3,
    timeout: 10
  })

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newLog: AttendanceLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: config.username && config.password ? 'success' : 'error',
      message: config.username && config.password 
        ? 'Connection test successful' 
        : 'Connection test failed',
      details: config.username && config.password 
        ? 'Successfully connected to SIM Kuliah USK'
        : 'Please check your credentials'
    }
    
    setLogs(prev => [newLog, ...prev])
    setIsTestingConnection(false)
  }

  const successRate = stats.totalAttempts > 0 
    ? Math.round((stats.successfulAttempts / stats.totalAttempts) * 100)
    : 0

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'config', label: 'Configuration', icon: Zap },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'logs', label: 'Logs', icon: CheckCircle }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Attempts"
                value={stats.totalAttempts}
                icon={Activity}
                color="primary"
              />
              <StatsCard
                title="Successful"
                value={stats.successfulAttempts}
                icon={CheckCircle}
                color="success"
                trend={{ value: 5.2, isPositive: true }}
              />
              <StatsCard
                title="Failed"
                value={stats.failedAttempts}
                icon={XCircle}
                color="error"
                trend={{ value: -2.1, isPositive: true }}
              />
              <StatsCard
                title="Success Rate"
                value={`${successRate}%`}
                icon={Zap}
                color="primary"
                trend={{ value: 3.1, isPositive: true }}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentActivity logs={logs} />
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">System Status</span>
                    <span className={`badge ${isRunning ? 'badge-success' : 'badge-error'}`}>
                      {isRunning ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Active Schedules</span>
                    <span className="badge badge-info">
                      {schedules.filter(s => s.enabled).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Last Run</span>
                    <span className="text-sm text-gray-600">
                      {stats.lastRun ? new Date(stats.lastRun).toLocaleString('id-ID') : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Uptime</span>
                    <span className="text-sm text-gray-600">{stats.uptime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-2xl">
            <ConfigPanel
              config={config}
              onConfigChange={setConfig}
              onTestConnection={handleTestConnection}
              isTestingConnection={isTestingConnection}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-4xl">
            <SchedulePanel
              schedules={schedules}
              onScheduleChange={setSchedules}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl">
            <LogsPanel logs={logs} />
          </div>
        )}
      </div>
    </div>
  )
}