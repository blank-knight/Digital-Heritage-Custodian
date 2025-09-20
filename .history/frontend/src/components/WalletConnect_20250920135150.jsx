import React from 'react'
import { Wallet, ExternalLink } from 'lucide-react'

function WalletConnect({ connectWallet, loading }) {
  return (
    <div className="card text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">连接钱包</h2>
        <p className="text-gray-600">
          请连接您的MetaMask钱包以开始使用数字遗产托管服务
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={connectWallet}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              <span>连接MetaMask</span>
            </>
          )}
        </button>

        <div className="text-sm text-gray-500">
          <p className="mb-2">使用前请确保：</p>
          <ul className="text-left space-y-1">
            <li>• 已安装MetaMask钱包</li>
            <li>• 已切换到Monad测试网</li>
            <li>• 钱包中有测试代币</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <a
            href="https://hardhat.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            了解Hardhat网络
          </a>
        </div>
      </div>
    </div>
  )
}

export default WalletConnect
