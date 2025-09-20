// 合约配置文件
// 注意：在实际部署后，请更新为真实的合约地址

// 方法1：直接在此处更新合约地址
// 方法2：部署合约后，会自动生成deployment.json文件
// 方法3：通过控制台设置localStorage: localStorage.setItem('contractConfig', JSON.stringify({DIGITAL_HERITAGE_ADDRESS: '你的合约地址', MOCK_TOKEN_ADDRESS: '你的代币地址'}))

export const CONTRACT_CONFIG = {
  // 默认使用一个测试地址，实际部署后需要替换
  // 注意：下面是示例地址，请替换为实际部署的合约地址
  DIGITAL_HERITAGE_ADDRESS: '0x0000000000000000000000000000000000000000',
  MOCK_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000'
}

// 尝试从localStorage或环境变量中获取实际地址
export const getContractAddress = () => {
  try {
    // 开发环境下，检查localStorage中是否有保存的合约地址
    const storedConfig = localStorage.getItem('contractConfig')
    if (storedConfig) {
      return JSON.parse(storedConfig)
    }
  } catch (error) {
    console.warn('读取保存的合约地址失败:', error)
  }
  
  return CONTRACT_CONFIG
}