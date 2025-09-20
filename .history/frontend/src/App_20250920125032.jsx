import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import WalletConnect from './components/WalletConnect'
import HeritageConfig from './components/HeritageConfig'
import HeritageStatus from './components/HeritageStatus'
import ValidatorPanel from './components/ValidatorPanel'
import { useWeb3 } from './hooks/useWeb3'
import './App.css'

function App() {
  const { account, provider, contract, isConnected } = useWeb3()
  const [heritageConfig, setHeritageConfig] = useState(null)
  const [loading, setLoading] = useState(false)

  // 加载遗产配置
  const loadHeritageConfig = async () => {
    if (!contract || !account) return

    try {
      setLoading(true)
      const config = await contract.getHeritageConfig(account)
      
      if (config.isConfigured) {
        setHeritageConfig({
          heir: config.heir,
          validators: config.validators,
          lastActivity: config.lastActivity,
          inactivityPeriod: config.inactivityPeriod,
          isConfigured: config.isConfigured,
          isInheritanceTriggered: config.isInheritanceTriggered,
          confirmations: config.confirmations
        })
      }
    } catch (error) {
      console.error('加载遗产配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      loadHeritageConfig()
    }
  }, [isConnected, account])

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-8">
            {!heritageConfig ? (
              <HeritageConfig 
                contract={contract}
                account={account}
                onConfigComplete={loadHeritageConfig}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HeritageStatus 
                  config={heritageConfig}
                  contract={contract}
                  account={account}
                  onUpdate={loadHeritageConfig}
                />
                
                <ValidatorPanel 
                  config={heritageConfig}
                  contract={contract}
                  account={account}
                  onUpdate={loadHeritageConfig}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
