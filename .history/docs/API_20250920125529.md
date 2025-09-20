# 数字遗产托管员 API 文档

## 智能合约接口

### DigitalHeritageMVP 合约

#### 配置函数

##### configureHeritage
配置数字遗产信息

```solidity
function configureHeritage(
    address heir,
    address[] memory validators
) external
```

**参数：**
- `heir`: 继承人地址
- `validators`: 验证者地址数组（至少2个）

**要求：**
- 继承人不能是零地址
- 继承人不能是合约所有者
- 至少需要2个验证者
- 验证者不能是所有者或继承人

**事件：**
```solidity
event HeritageConfigured(address indexed owner, address indexed heir, address[] validators);
```

#### 活动管理函数

##### updateActivity
更新用户活动状态（心跳检测）

```solidity
function updateActivity() external
```

**要求：**
- 遗产必须已配置
- 继承流程未触发

**事件：**
```solidity
event ActivityUpdated(address indexed owner, uint256 timestamp);
```

##### checkInactivity
检查无活动状态

```solidity
function checkInactivity() external
```

**要求：**
- 遗产必须已配置
- 继承流程未触发
- 超过90天无活动

**事件：**
```solidity
event InactivityDetected(address indexed owner, uint256 lastActivity);
event InheritanceTriggered(address indexed owner, address indexed heir);
```

#### 继承管理函数

##### confirmInheritance
验证者确认继承

```solidity
function confirmInheritance(address owner) external
```

**参数：**
- `owner`: 遗产所有者地址

**要求：**
- 调用者必须是验证者
- 继承流程已触发
- 验证者未确认过

**事件：**
```solidity
event InheritanceConfirmed(address indexed owner, address indexed heir, uint256 amount);
```

##### transferTokenToHeir
转移ERC20代币给继承人

```solidity
function transferTokenToHeir(address token, uint256 amount) external
```

**参数：**
- `token`: 代币合约地址
- `amount`: 转移数量

**要求：**
- 遗产必须已配置
- 继承流程已触发
- 达到所需确认数量
- 代币已授权

#### 查询函数

##### getHeritageConfig
获取遗产配置信息

```solidity
function getHeritageConfig(address owner) external view returns (
    address heir,
    address[] memory validators,
    uint256 lastActivity,
    uint256 inactivityPeriod,
    bool isConfigured,
    bool isInheritanceTriggered,
    uint256 confirmations
)
```

**参数：**
- `owner`: 遗产所有者地址

**返回值：**
- `heir`: 继承人地址
- `validators`: 验证者地址数组
- `lastActivity`: 最后活动时间戳
- `inactivityPeriod`: 无活动期限（秒）
- `isConfigured`: 是否已配置
- `isInheritanceTriggered`: 是否已触发继承
- `confirmations`: 确认数量

##### isValidator
检查是否为验证者

```solidity
function isValidator(address owner, address validator) external view returns (bool)
```

**参数：**
- `owner`: 遗产所有者地址
- `validator`: 验证者地址

**返回值：**
- `bool`: 是否为验证者

##### getValidatorConfirmation
获取验证者确认状态

```solidity
function getValidatorConfirmation(address owner, address validator) external view returns (bool)
```

**参数：**
- `owner`: 遗产所有者地址
- `validator`: 验证者地址

**返回值：**
- `bool`: 是否已确认

### MockERC20 合约

#### 标准ERC20函数

##### mint
铸造代币（仅用于测试）

```solidity
function mint(address to, uint256 amount) external
```

**参数：**
- `to`: 接收者地址
- `amount`: 铸造数量

## 前端API

### useWeb3 Hook

#### 状态

```javascript
const {
  account,        // 当前账户地址
  provider,       // Web3 provider
  contract,       // 合约实例
  isConnected,    // 是否已连接
  loading,        // 加载状态
  connectWallet,  // 连接钱包函数
  disconnect      // 断开连接函数
} = useWeb3()
```

#### 方法

##### connectWallet
连接MetaMask钱包

```javascript
await connectWallet()
```

**功能：**
- 请求用户授权
- 切换到Monad测试网
- 初始化合约实例

##### disconnect
断开钱包连接

```javascript
disconnect()
```

**功能：**
- 清除连接状态
- 重置合约实例

### 组件Props

#### HeritageConfig

```javascript
<HeritageConfig
  contract={contract}           // 合约实例
  account={account}             // 当前账户
  onConfigComplete={callback}   // 配置完成回调
/>
```

#### HeritageStatus

```javascript
<HeritageStatus
  config={heritageConfig}       // 遗产配置
  contract={contract}           // 合约实例
  account={account}             // 当前账户
  onUpdate={callback}           // 更新回调
/>
```

#### ValidatorPanel

```javascript
<ValidatorPanel
  config={heritageConfig}       // 遗产配置
  contract={contract}           // 合约实例
  account={account}             // 当前账户
  onUpdate={callback}           // 更新回调
/>
```

## 事件监听

### 合约事件

```javascript
// 监听遗产配置事件
contract.on('HeritageConfigured', (owner, heir, validators) => {
  console.log('遗产已配置:', { owner, heir, validators })
})

// 监听活动更新事件
contract.on('ActivityUpdated', (owner, timestamp) => {
  console.log('活动已更新:', { owner, timestamp })
})

// 监听继承触发事件
contract.on('InheritanceTriggered', (owner, heir) => {
  console.log('继承已触发:', { owner, heir })
})

// 监听继承确认事件
contract.on('InheritanceConfirmed', (owner, heir, amount) => {
  console.log('继承已确认:', { owner, heir, amount })
})
```

### 钱包事件

```javascript
// 监听账户变化
window.ethereum.on('accountsChanged', (accounts) => {
  console.log('账户已变化:', accounts)
})

// 监听网络变化
window.ethereum.on('chainChanged', (chainId) => {
  console.log('网络已变化:', chainId)
})
```

## 错误处理

### 常见错误

#### 合约错误

```javascript
try {
  await contract.configureHeritage(heir, validators)
} catch (error) {
  if (error.message.includes('Invalid heir address')) {
    // 继承人地址无效
  } else if (error.message.includes('At least 2 validators required')) {
    // 验证者数量不足
  } else if (error.message.includes('Heir cannot be owner')) {
    // 继承人不能是所有者
  }
}
```

#### 钱包错误

```javascript
try {
  await connectWallet()
} catch (error) {
  if (error.code === 4001) {
    // 用户拒绝连接
  } else if (error.code === 4902) {
    // 网络不存在
  } else if (error.code === -32602) {
    // 无效参数
  }
}
```

## 最佳实践

### 合约交互

1. **检查连接状态**：确保钱包已连接
2. **验证输入**：检查地址格式和参数有效性
3. **处理错误**：捕获并处理所有可能的错误
4. **显示反馈**：向用户显示操作状态和结果

### 状态管理

1. **实时更新**：监听合约事件更新状态
2. **缓存数据**：避免重复查询合约
3. **错误恢复**：处理网络错误和重连
4. **用户友好**：提供清晰的错误信息

### 安全考虑

1. **私钥保护**：不在前端存储私钥
2. **输入验证**：验证所有用户输入
3. **网络检查**：确保连接到正确的网络
4. **权限控制**：检查用户权限和角色
