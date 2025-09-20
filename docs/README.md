# 数字遗产托管员 - 完整文档

## 项目概述

数字遗产托管员是一个基于区块链的数字资产继承系统，让用户安全、自动地将数字资产转移给指定继承人。

## 功能特性

- **链上心跳检测**：监控用户90天无活动自动触发继承
- **多重签名验证**：白名单验证者确认继承流程
- **资产自动转移**：将ERC-20代币转移给继承人
- **Monad网络支持**：部署到Monad测试网络
- **现代化UI**：React + Tailwind CSS构建的用户界面

## 技术架构

### 智能合约层
- **DigitalHeritageMVP.sol**：主合约，管理继承流程
- **MockERC20.sol**：测试代币合约
- **Solidity 0.8.19**：智能合约开发语言
- **OpenZeppelin**：安全合约库

### 前端应用层
- **React 18**：前端框架
- **Vite**：构建工具
- **Tailwind CSS**：样式框架
- **Ethers.js 6**：区块链交互库

### 区块链网络
- **Monad测试网**：开发和测试环境
- **Monad主网**：生产环境（未来）

## 项目结构

```
digital-heritage-custodian/
├── contracts/                 # 智能合约
│   ├── contracts/            # 合约源码
│   ├── test/                 # 测试文件
│   ├── scripts/              # 部署脚本
│   ├── hardhat.config.js     # Hardhat配置
│   └── package.json          # 合约依赖
├── frontend/                 # 前端应用
│   ├── src/                  # 源码
│   ├── public/               # 静态资源
│   ├── vite.config.js        # Vite配置
│   └── package.json          # 前端依赖
├── docs/                     # 文档
├── scripts/                  # 项目脚本
└── README.md                 # 项目说明
```

## 快速开始

### 1. 环境要求

- Node.js 16+ 
- npm 或 yarn
- MetaMask钱包
- Monad测试网访问权限

### 2. 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd digital-heritage-custodian

# 运行设置脚本
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. 配置环境

```bash
# 复制环境变量文件
cp contracts/env.example contracts/.env

# 编辑环境变量
nano contracts/.env
```

在 `contracts/.env` 中设置：
```
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 4. 启动开发环境

```bash
# 启动完整开发环境
npm run dev

# 或分别启动
npm run dev:contracts  # 启动合约开发
npm run dev:frontend  # 启动前端开发
```

### 5. 部署到Monad测试网

```bash
# 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 使用指南

### 配置数字遗产

1. **连接钱包**：使用MetaMask连接Monad测试网
2. **设置继承人**：输入继承人钱包地址
3. **添加验证者**：添加2-5个验证者地址
4. **确认配置**：提交配置到区块链

### 监控活动状态

1. **更新活动**：定期更新活动状态
2. **检查无活动**：检查是否超过90天无活动
3. **查看状态**：实时查看遗产配置状态

### 验证者操作

1. **确认继承**：当继承流程触发时确认
2. **查看进度**：查看其他验证者确认状态
3. **执行转移**：达到确认数量后自动转移资产

## 智能合约API

### 主要函数

```solidity
// 配置遗产
function configureHeritage(address heir, address[] memory validators) external

// 更新活动状态
function updateActivity() external

// 检查无活动状态
function checkInactivity() external

// 确认继承
function confirmInheritance(address owner) external

// 转移代币
function transferTokenToHeir(address token, uint256 amount) external

// 获取配置信息
function getHeritageConfig(address owner) external view returns (...)
```

### 事件

```solidity
event HeritageConfigured(address indexed owner, address indexed heir, address[] validators);
event InactivityDetected(address indexed owner, uint256 lastActivity);
event InheritanceTriggered(address indexed owner, address indexed heir);
event InheritanceConfirmed(address indexed owner, address indexed heir, uint256 amount);
event ActivityUpdated(address indexed owner, uint256 timestamp);
```

## 前端组件

### 主要组件

- **Header**：页面头部
- **WalletConnect**：钱包连接
- **HeritageConfig**：遗产配置
- **HeritageStatus**：遗产状态
- **ValidatorPanel**：验证者面板

### 自定义Hook

- **useWeb3**：Web3连接管理

## 测试

### 运行测试

```bash
# 运行合约测试
cd contracts
npm run test

# 运行部署测试
node scripts/test-deployment.js
```

### 测试覆盖

- 遗产配置测试
- 心跳检测测试
- 继承流程测试
- 代币转移测试
- 验证者确认测试

## 部署

### 部署到Monad测试网

1. **准备环境**：设置私钥和RPC URL
2. **编译合约**：确保合约编译成功
3. **运行测试**：确保所有测试通过
4. **部署合约**：部署到Monad测试网
5. **验证合约**：验证合约源码
6. **测试部署**：测试部署的合约

### 部署脚本

```bash
# 自动部署
./scripts/deploy.sh

# 手动部署
cd contracts
npm run deploy
npm run verify
```

## 安全考虑

### 智能合约安全

- 使用OpenZeppelin安全库
- 实现重入攻击保护
- 输入验证和边界检查
- 事件记录和监控

### 前端安全

- 私钥不存储在本地
- 使用MetaMask安全连接
- 输入验证和错误处理
- 网络切换保护

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查MetaMask是否安装
   - 确认网络切换到Monad测试网
   - 检查账户是否有足够余额

2. **合约部署失败**
   - 检查私钥是否正确
   - 确认RPC URL可访问
   - 检查账户余额是否足够

3. **前端无法加载**
   - 检查合约地址是否正确
   - 确认网络连接正常
   - 查看浏览器控制台错误

### 调试技巧

- 使用Hardhat控制台调试
- 查看合约事件日志
- 使用浏览器开发者工具
- 检查网络请求状态

## 贡献指南

### 开发流程

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 代码规范

- 使用ESLint检查代码
- 遵循Solidity最佳实践
- 编写单元测试
- 更新文档

## 许可证

MIT License

## 联系方式

- 项目地址：https://github.com/your-org/digital-heritage-custodian
- 问题反馈：https://github.com/your-org/digital-heritage-custodian/issues
- 邮箱：contact@example.com

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础继承功能
- Monad测试网支持
- React前端应用
