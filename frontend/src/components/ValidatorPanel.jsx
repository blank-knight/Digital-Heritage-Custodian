import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function ValidatorPanel({ config, contract, account, onUpdate }) {
  const [isValidator, setIsValidator] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkValidatorStatus()
  }, [config, account])

  const checkValidatorStatus = async () => {
    if (!contract || !config) return

    try {
      const isVal = await contract.isValidator(account, account)
      setIsValidator(isVal)

      if (isVal && config.isInheritanceTriggered) {
        const confirmed = await contract.getValidatorConfirmation(account, account)
        setHasConfirmed(confirmed)
      }
    } catch (error) {
      console.error('检查验证者状态失败:', error)
    }
  }

  const confirmInheritance = async () => {
    try {
      setLoading(true)
      const tx = await contract.confirmInheritance(account)
      await tx.wait()
      toast.success('继承确认成功')
      setHasConfirmed(true)
      onUpdate()
    } catch (error) {
      console.error('确认继承失败:', error)
      toast.error('确认继承失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isValidator) {
    return (
      <div className="card">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">验证者面板</h3>
          <p className="text-gray-600">
            您不是任何遗产的验证者
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">验证者面板</h2>
        <p className="text-gray-600">
          作为验证者，您可以确认继承流程
        </p>
      </div>

      <div className="space-y-6">
        {/* 验证者状态 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">验证者身份</span>
          </div>
          <p className="text-sm text-blue-800 mt-1">
            您已被授权为遗产验证者
          </p>
        </div>

        {/* 继承状态 */}
        {config.isInheritanceTriggered ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-900">继承流程已触发</span>
              </div>
              <p className="text-sm text-red-800 mt-1">
                需要验证者确认才能执行继承
              </p>
            </div>

            {/* 确认状态 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">确认状态</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">您的确认状态:</span>
                <div className="flex items-center">
                  {hasConfirmed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">已确认</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">未确认</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>总体确认进度</span>
                  <span>{config.confirmations} / {config.validators.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(config.confirmations / config.validators.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 确认按钮 */}
            {!hasConfirmed && (
              <button
                onClick={confirmInheritance}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>确认继承</span>
                  </>
                )}
              </button>
            )}

            {hasConfirmed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">您已确认继承</span>
                </div>
                <p className="text-sm text-green-800 mt-1">
                  等待其他验证者确认
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">继承流程未触发</span>
            </div>
            <p className="text-sm text-green-800 mt-1">
              遗产配置正常运行中
            </p>
          </div>
        )}

        {/* 说明信息 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">验证者说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 验证者负责确认遗产所有者的死亡状态</li>
            <li>• 需要至少2个验证者确认才能执行继承</li>
            <li>• 确认后无法撤销，请谨慎操作</li>
            <li>• 如有疑问，请联系其他验证者</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ValidatorPanel
