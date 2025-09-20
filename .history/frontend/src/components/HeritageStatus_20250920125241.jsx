import React, { useState } from 'react'
import { Clock, Users, User, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function HeritageStatus({ config, contract, account, onUpdate }) {
  const [loading, setLoading] = useState(false)

  const updateActivity = async () => {
    try {
      setLoading(true)
      const tx = await contract.updateActivity()
      await tx.wait()
      toast.success('活动状态已更新')
      onUpdate()
    } catch (error) {
      console.error('更新活动失败:', error)
      toast.error('更新活动失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkInactivity = async () => {
    try {
      setLoading(true)
      const tx = await contract.checkInactivity()
      await tx.wait()
      toast.success('已检查无活动状态')
      onUpdate()
    } catch (error) {
      console.error('检查无活动失败:', error)
      toast.error('检查无活动失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('zh-CN')
  }

  const getTimeRemaining = () => {
    const lastActivity = Number(config.lastActivity)
    const inactivityPeriod = Number(config.inactivityPeriod)
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = lastActivity + inactivityPeriod - now
    
    if (timeRemaining <= 0) {
      return '已超过无活动期限'
    }
    
    const days = Math.floor(timeRemaining / (24 * 60 * 60))
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
    
    return `${days}天${hours}小时`
  }

  const getStatusColor = () => {
    if (config.isInheritanceTriggered) {
      return 'text-red-600 bg-red-50'
    }
    
    const lastActivity = Number(config.lastActivity)
    const inactivityPeriod = Number(config.inactivityPeriod)
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = lastActivity + inactivityPeriod - now
    
    if (timeRemaining <= 0) {
      return 'text-orange-600 bg-orange-50'
    }
    
    return 'text-green-600 bg-green-50'
  }

  const getStatusText = () => {
    if (config.isInheritanceTriggered) {
      return '继承流程已触发'
    }
    
    const lastActivity = Number(config.lastActivity)
    const inactivityPeriod = Number(config.inactivityPeriod)
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = lastActivity + inactivityPeriod - now
    
    if (timeRemaining <= 0) {
      return '可触发继承流程'
    }
    
    return '正常运行中'
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">遗产状态</h2>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {config.isInheritanceTriggered ? (
            <AlertTriangle className="h-4 w-4 mr-1" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-6">
        {/* 继承人信息 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <User className="h-4 w-4 mr-1" />
            继承人
          </h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-mono text-sm text-gray-900">{config.heir}</p>
          </div>
        </div>

        {/* 验证者信息 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            验证者 ({config.validators.length}个)
          </h3>
          <div className="space-y-2">
            {config.validators.map((validator, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="font-mono text-sm text-gray-900">{validator}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 时间信息 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            时间信息
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">最后活动时间:</span>
              <span className="text-sm text-gray-900">{formatTime(config.lastActivity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">无活动期限:</span>
              <span className="text-sm text-gray-900">{Number(config.inactivityPeriod) / (24 * 60 * 60)}天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">剩余时间:</span>
              <span className="text-sm text-gray-900">{getTimeRemaining()}</span>
            </div>
          </div>
        </div>

        {/* 确认状态 */}
        {config.isInheritanceTriggered && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              验证者确认状态
            </h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                已确认: {config.confirmations} / {config.validators.length}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(config.confirmations / config.validators.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={updateActivity}
            disabled={loading || config.isInheritanceTriggered}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>更新活动状态</span>
              </>
            )}
          </button>

          {!config.isInheritanceTriggered && (
            <button
              onClick={checkInactivity}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <span>检查无活动状态</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeritageStatus
