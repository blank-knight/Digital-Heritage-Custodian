import React from 'react'
import { Shield, Wallet } from 'lucide-react'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">数字遗产托管员</h1>
              <p className="text-sm text-gray-500">Digital Heritage Custodian</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Hardhat本地网络</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
