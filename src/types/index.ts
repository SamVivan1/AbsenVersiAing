export interface AttendanceLog {
  id: string
  timestamp: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  details?: string
}

export interface Schedule {
  id: string
  name: string
  day: string
  time: string
  enabled: boolean
}

export interface Config {
  username: string
  password: string
  headless: boolean
  retryAttempts: number
  timeout: number
}

export interface Stats {
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  lastRun: string | null
  uptime: string
}