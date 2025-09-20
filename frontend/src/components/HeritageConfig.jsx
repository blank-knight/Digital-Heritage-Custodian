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

    // 检查验证者地址是否重复
    const uniqueValidators = [...new Set(validators)]
    if (uniqueValidators.length !== validators.length) {
      toast.error('验证者地址不能重复')
      return
    }

    // 检查验证者地址格式
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(heir)) {
      toast.error('继承人地址格式不正确')
      return
    }

    for (const validator of validators) {
      if (!addressRegex.test(validator)) {
        toast.error('验证者地址格式不正确')
        return
      }
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
      // 增强错误处理，提供更具体的错误信息
      let errorMessage = '配置失败: ' + error.message
      if (error.message.includes('require(false)')) {
        errorMessage += '\n可能的原因：\n1. 验证者数量不足（至少需要2个）\n2. 继承人或验证者地址格式不正确\n3. 您选择了自己作为验证者\n4. 您选择了继承人作为验证者\n5. 验证者地址有重复'
      }
      toast.error(errorMessage)
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
                  className="input-field flex-grow"
                  required
                />
                {validators.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeValidator(index)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    移除
                  </button>
                )}
              </div>
            ))}
            {validators.length < 5 && (
              <button
                type="button"
                onClick={addValidator}
                className="btn-secondary"
              >
                添加验证者
              </button>
            )}
          </div>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• 至少需要2个验证者</li>
            <li>• 验证者不能是您自己或继承人</li>
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
