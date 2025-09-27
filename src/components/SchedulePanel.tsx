import { useState } from 'react'
import { Plus, Calendar, Clock, MoveVertical as MoreVertical, CreditCard as Edit, Trash2, Power } from 'lucide-react'
import { Schedule } from '../types'
import { cn } from '../utils/cn'

interface SchedulePanelProps {
  schedules: Schedule[]
  onScheduleChange: (schedules: Schedule[]) => void
}

export default function SchedulePanel({ schedules, onScheduleChange }: SchedulePanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    day: '',
    time: '',
    enabled: true
  })

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  const handleAddSchedule = () => {
    if (newSchedule.name && newSchedule.day && newSchedule.time) {
      const schedule: Schedule = {
        id: Date.now().toString(),
        ...newSchedule
      }
      onScheduleChange([...schedules, schedule])
      setNewSchedule({ name: '', day: '', time: '', enabled: true })
      setShowAddForm(false)
    }
  }

  const handleDeleteSchedule = (id: string) => {
    onScheduleChange(schedules.filter(s => s.id !== id))
  }

  const handleToggleSchedule = (id: string) => {
    onScheduleChange(
      schedules.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    )
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Class Schedule</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Add Schedule Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Add New Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Class Name</label>
              <input
                type="text"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                className="input"
                placeholder="e.g., Algoritma Pemrograman"
              />
            </div>
            <div>
              <label className="label">Day</label>
              <select
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                className="input"
              >
                <option value="">Select day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSchedule}
              className="btn-primary"
            >
              Add Schedule
            </button>
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No schedules configured</p>
            <p className="text-sm text-gray-400">Add your class schedules to enable automatic attendance</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
                schedule.enabled 
                  ? "bg-white border-gray-200 hover:border-primary-300" 
                  : "bg-gray-50 border-gray-200 opacity-60"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  schedule.enabled ? "bg-primary-100 text-primary-600" : "bg-gray-200 text-gray-400"
                )}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {schedule.day}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(schedule.time)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleSchedule(schedule.id)}
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    schedule.enabled 
                      ? "text-success-600 hover:bg-success-50" 
                      : "text-gray-400 hover:bg-gray-100"
                  )}
                  title={schedule.enabled ? "Disable schedule" : "Enable schedule"}
                >
                  <Power className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setEditingSchedule(schedule)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Edit schedule"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-2 text-error-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}