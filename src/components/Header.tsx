import { Bot, Settings, Play, Square } from 'lucide-react'
import { cn } from '../utils/cn'

interface HeaderProps {
  isRunning: boolean
  onToggleSystem: () => void
}

export default function Header({ isRunning, onToggleSystem }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AbsenVersiAing</h1>
              <p className="text-sm text-gray-500">Attendance Automation System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-success-500 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-sm font-medium text-gray-700">
                {isRunning ? 'System Active' : 'System Inactive'}
              </span>
            </div>
            
            <button
              onClick={onToggleSystem}
              className={cn(
                "btn",
                isRunning 
                  ? "bg-error-600 hover:bg-error-700 text-white focus:ring-error-500" 
                  : "bg-success-600 hover:bg-success-700 text-white focus:ring-success-500"
              )}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop System
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start System
                </>
              )}
            </button>
            
            <button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}