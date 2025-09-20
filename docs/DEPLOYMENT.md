# 部署指南

## 环境准备

### 1. 系统要求

- **Node.js**: 16.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Git**: 用于版本控制
- **MetaMask**: 浏览器钱包扩展

### 2. 账户准备

- **Monad测试网账户**: 用于部署合约
- **测试代币**: 用于支付Gas费用
- **私钥**: 用于签名交易

## 部署步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd digital-heritage-custodian
```

### 2. 安装依赖

```bash
# 运行自动设置脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 或手动安装
npm install
cd contracts && npm install
cd ../frontend && npm install
cd ..
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp contracts/env.example contracts/.env

# 编辑环境变量
nano contracts/.env
```

在 `contracts/.env` 中设置：

```env
# Monad测试网私钥（请替换为您的私钥）
PRIVATE_KEY=your_private_key_here

# Monad测试网RPC URL
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# 部署者地址（可选）
DEPLOYER_ADDRESS=0x...
```

### 4. 编译合约

```bash
cd contracts
npm run compile
```

### 5. 运行测试

```bash
npm run test
```

### 6. 部署合约

```bash
# 使用部署脚本（推荐）
cd ..
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 或手动部署
cd contracts
npm run deploy
```

### 7. 验证合约

```bash
npm run verify
```

### 8. 测试部署

```bash
node scripts/test-deployment.js
```

## 部署配置

### Hardhat配置

```javascript
// contracts/hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "monad-testnet": {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 420,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    }
  }
}
```

### 网络配置

#### Monad测试网

- **Chain ID**: 420
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet-explorer.monad.xyz
- **Gas Price**: 1 gwei

#### 添加网络到MetaMask

```javascript
// 网络配置
const monadTestnet = {
  chainId: '0x1a4', // 420
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
}
```

## 部署脚本

### 自动部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 开始部署数字遗产托管员到Monad测试网..."

# 检查环境变量
if [ ! -f "contracts/.env" ]; then
    echo "❌ 请先创建 contracts/.env 文件并设置私钥"
    exit 1
fi

# 进入合约目录
cd contracts

# 编译合约
echo "🔨 编译智能合约..."
npm run compile

# 运行测试
echo "🧪 运行测试..."
npm run test

# 部署合约
echo "📤 部署合约到Monad测试网..."
npm run deploy

# 验证合约
echo "🔍 验证合约..."
npm run verify

# 测试部署
echo "🧪 测试部署的合约..."
node scripts/test-deployment.js

echo "✅ 部署完成！"
```

### 手动部署步骤

```bash
# 1. 编译合约
cd contracts
npx hardhat compile

# 2. 运行测试
npx hardhat test

# 3. 部署合约
npx hardhat run scripts/deploy.js --network monad-testnet

# 4. 验证合约
npx hardhat verify --network monad-testnet <CONTRACT_ADDRESS>

# 5. 测试部署
node scripts/test-deployment.js
```

## 部署后配置

### 1. 更新前端配置

部署完成后，需要更新前端中的合约地址：

```javascript
// frontend/src/hooks/useWeb3.js
const contractAddress = '0x...' // 替换为实际部署的合约地址
```

### 2. 配置网络

确保MetaMask已添加Monad测试网：

1. 打开MetaMask
2. 点击网络选择器
3. 选择"添加网络"
4. 输入Monad测试网配置

### 3. 获取测试代币

1. 访问Monad测试网水龙头
2. 输入您的钱包地址
3. 获取测试代币

## 故障排除

### 常见问题

#### 1. 部署失败

**问题**: 合约部署失败
**解决方案**:
- 检查私钥是否正确
- 确认账户余额是否足够
- 验证RPC URL是否可访问

#### 2. 验证失败

**问题**: 合约验证失败
**解决方案**:
- 检查合约地址是否正确
- 确认构造函数参数
- 验证网络配置

#### 3. 测试失败

**问题**: 部署测试失败
**解决方案**:
- 检查合约是否正确部署
- 验证ABI是否匹配
- 确认网络连接正常

### 调试技巧

#### 1. 查看部署日志

```bash
# 查看详细部署日志
npx hardhat run scripts/deploy.js --network monad-testnet --verbose
```

#### 2. 检查合约状态

```bash
# 使用Hardhat控制台
npx hardhat console --network monad-testnet
```

#### 3. 查看交易详情

```bash
# 查看交易详情
npx hardhat verify --network monad-testnet <CONTRACT_ADDRESS> --show-stack-traces
```

## 生产环境部署

### 1. 安全检查

- [ ] 合约代码审计
- [ ] 测试覆盖率达到100%
- [ ] 安全漏洞扫描
- [ ] 性能测试

### 2. 配置优化

```javascript
// 生产环境配置
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000 // 增加优化次数
      }
    }
  },
  networks: {
    "monad-mainnet": {
      url: "https://rpc.monad.xyz",
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2000000000, // 2 gwei
    }
  }
}
```

### 3. 监控设置

- 设置合约事件监控
- 配置错误告警
- 监控Gas使用情况
- 跟踪用户活动

## 维护和更新

### 1. 合约升级

由于智能合约不可更改，升级需要部署新合约：

1. 部署新版本合约
2. 迁移用户数据
3. 更新前端配置
4. 通知用户迁移

### 2. 监控和维护

- 定期检查合约状态
- 监控异常活动
- 更新依赖库
- 修复安全漏洞

### 3. 用户支持

- 提供使用文档
- 建立支持渠道
- 收集用户反馈
- 持续改进产品
