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
  const { account, provider, contract, isConnected, connectWallet, loading } = useWeb3()
  const [heritageConfig, setHeritageConfig] = useState(null)

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
      toast.error('加载遗产配置失败: ' + error.message)
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
            <WalletConnect connectWallet={connectWallet} loading={loading} />
          </div>
        ) : (
          <div className="space-y-8">
            {!contract ? (
              <div className="max-w-md mx-auto">
                <div className="card text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">合约地址未配置</h2>
                    <p className="text-gray-600">
                      系统无法连接到智能合约，请联系管理员配置合约地址。
                    </p>
                    <p className="text-gray-500 mt-2 text-sm">
                      提示：您仍然可以连接钱包，但无法使用数字遗产托管功能。
                    </p>
                  </div>
                </div>
              </div>
            ) : !heritageConfig ? (
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
