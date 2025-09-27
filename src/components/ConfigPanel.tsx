import { useState } from 'react'
import { Eye, EyeOff, Save, TestTube, User, Lock, Settings } from 'lucide-react'
import { Config } from '../types'
import { cn } from '../utils/cn'

interface ConfigPanelProps {
  config: Config
  onConfigChange: (config: Config) => void
  onTestConnection: () => void
  isTestingConnection: boolean
}

export default function ConfigPanel({ 
  config, 
  onConfigChange, 
  onTestConnection, 
  isTestingConnection 
}: ConfigPanelProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleInputChange = (field: keyof Config, value: string | number | boolean) => {
    onConfigChange({
      ...config,
      [field]: value
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Credentials Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-4 h-4 mr-2" />
            SIM Kuliah Credentials
          </h4>
          <div className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="input"
                placeholder="Enter your SIM Kuliah username"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your SIM Kuliah password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Browser Settings
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Headless Mode</label>
                <p className="text-xs text-gray-500">Run browser in background without UI</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.headless}
                  onChange={(e) => handleInputChange('headless', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div>
              <label className="label">Retry Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.retryAttempts}
                onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value))}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">Timeout (seconds)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={config.timeout}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "btn-primary flex-1",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          
          <button
            onClick={onTestConnection}
            disabled={isTestingConnection || !config.username || !config.password}
            className={cn(
              "btn-secondary",
              (isTestingConnection || !config.username || !config.password) && "opacity-50 cursor-not-allowed"
            )}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingConnection ? 'Testing...' : 'Test'}
          </button>
        </div>
      </div>
    </div>
  )
}