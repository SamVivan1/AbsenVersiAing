import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'

function App() {
  const [isSystemRunning, setIsSystemRunning] = useState(false)

  const handleToggleSystem = () => {
    setIsSystemRunning(!isSystemRunning)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isRunning={isSystemRunning} 
        onToggleSystem={handleToggleSystem} 
      />
      <Dashboard isRunning={isSystemRunning} />
    </div>
  )
}

export default App