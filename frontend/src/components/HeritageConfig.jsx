import React, { useState } from 'react'
import { User, Users, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function HeritageConfig({ contract, account, onConfigComplete }) {
  const [heir, setHeir] = useState('')
  const [validators, setValidators] = useState(['', ''])
  const [loading, setLoading] = useState(false)

  const addValidator = () => {
    if (validators.length < 5) {
      setValidators([...validators, ''])
    }
  }

  const removeValidator = (index) => {
    if (validators.length > 2) {
      setValidators(validators.filter((_, i) => i !== index))
    }
  }

  const updateValidator = (index, value) => {
    const newValidators = [...validators]
    newValidators[index] = value
    setValidators(newValidators)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!heir || !validators.every(v => v.trim())) {
      toast.error('请填写所有必填字段')
      return
    }

    if (heir === account) {
      toast.error('继承人不能是您自己')
      return
    }

    if (validators.includes(heir)) {
      toast.error('验证者不能是继承人')
      return
    }

    if (validators.includes(account)) {
      toast.error('验证者不能是您自己')
      return
    }

    try {
      setLoading(true)
      
      // 过滤空字符串
      const validValidators = validators.filter(v => v.trim())
      
      const tx = await contract.configureHeritage(heir, validValidators)
      await tx.wait()
      
      toast.success('遗产配置成功！')
      onConfigComplete()
    } catch (error) {
      console.error('配置失败:', error)
      toast.error('配置失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">配置数字遗产</h2>
        <p className="text-gray-600">
          设置继承人地址和验证者，确保您的数字资产能够安全转移
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 继承人地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            继承人地址 *
          </label>
          <input
            type="text"
            value={heir}
            onChange={(e) => setHeir(e.target.value)}
            placeholder="0x..."
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            将接收您数字资产的地址
          </p>
        </div>

        {/* 验证者地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            验证者地址 * (至少2个)
          </label>
          <div className="space-y-3">
            {validators.map((validator, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={validator}
                  onChange={(e) => updateValidator(index, e.target.value)}
                  placeholder="0x..."
                  className="input-field flex-1"
                  required
                />
                {validators.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeValidator(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {validators.length < 5 && (
            <button
              type="button"
              onClick={addValidator}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              + 添加验证者
            </button>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            验证者将确认您的死亡状态并启动继承流程
          </p>
        </div>

        {/* 配置说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">配置说明</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 90天无活动将自动触发继承流程</li>
            <li>• 需要至少2个验证者确认才能执行继承</li>
            <li>• 配置后可以随时更新活动状态</li>
            <li>• 建议选择可信的家人或朋友作为验证者</li>
          </ul>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>确认配置</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default HeritageConfig
