#!/bin/bash

# 数字遗产托管员部署脚本

echo "🚀 开始部署数字遗产托管员到Monad测试网..."

# 检查环境变量
if [ ! -f "contracts/.env" ]; then
    echo "❌ 请先创建 contracts/.env 文件并设置私钥"
    echo "   复制 contracts/env.example 到 contracts/.env"
    exit 1
fi

# 检查私钥是否设置
source contracts/.env
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo "❌ 请在 contracts/.env 中设置您的私钥"
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

# 返回根目录
cd ..

echo "✅ 部署完成！"
echo ""
echo "📋 部署信息："
if [ -f "contracts/deployment.json" ]; then
    echo "合约地址信息已保存到 contracts/deployment.json"
    cat contracts/deployment.json
fi
echo ""
echo "🌐 前端应用："
echo "1. 更新 frontend/src/hooks/useWeb3.js 中的合约地址"
echo "2. 运行 'npm run dev' 启动前端应用"
echo "3. 在浏览器中访问 http://localhost:3000"
echo ""
echo "🎉 部署成功！"
