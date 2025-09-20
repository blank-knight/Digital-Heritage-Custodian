import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// 合约ABI（简化版）
const CONTRACT_ABI = [
  "function configureHeritage(address heir, address[] memory validators) external",
  "function updateActivity() external",
  "function checkInactivity() external",
  "function confirmInheritance(address owner) external",
  "function transferTokenToHeir(address token, uint256 amount) external",
  "function getHeritageConfig(address owner) external view returns (address heir, address[] memory validators, uint256 lastActivity, uint256 inactivityPeriod, bool isConfigured, bool isInheritanceTriggered, uint256 confirmations)",
  "function isValidator(address owner, address validator) external view returns (bool)",
  "function getValidatorConfirmation(address owner, address validator) external view returns (bool)"
]

// 本地Hardhat网络配置
const LOCAL_NETWORK = {
  chainId: '0x7a69', // 31337
  chainName: 'Hardhat Local',
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: []
}

export function useWeb3() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  // 检查是否已连接钱包
  useEffect(() => {
    if (window.ethereum) {
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        await connectWallet()
      }
    } catch (error) {
      console.error('检查连接失败:', error)
    }
  }

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('请安装MetaMask钱包')
      return
    }

    try {
      setLoading(true)
      
      // 请求连接钱包
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length === 0) {
        toast.error('未选择账户')
        return
      }

      // 检查网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== MONAD_TESTNET.chainId) {
        await switchToMonadTestnet()
      }

      // 设置provider和合约
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // 这里需要替换为实际的合约地址
      const contractAddress = '0x...' // 部署后更新
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

      setAccount(accounts[0])
      setProvider(provider)
      setContract(contract)
      setIsConnected(true)
      
      toast.success('钱包连接成功')
    } catch (error) {
      console.error('连接钱包失败:', error)
      toast.error('连接钱包失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const switchToMonadTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      })
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          })
        } catch (addError) {
          throw new Error('添加Monad测试网失败')
        }
      } else {
        throw switchError
      }
    }
  }

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setContract(null)
    setIsConnected(false)
    toast.success('钱包已断开')
  }, [])

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          connectWallet()
        }
      }

      const handleChainChanged = (chainId) => {
        if (chainId !== MONAD_TESTNET.chainId) {
          toast.error('请切换到Monad测试网')
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [connectWallet, disconnect])

  return {
    account,
    provider,
    contract,
    isConnected,
    loading,
    connectWallet,
    disconnect
  }
}
