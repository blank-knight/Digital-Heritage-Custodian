#!/bin/bash

# 数字遗产托管员项目设置脚本

echo "🚀 开始设置数字遗产托管员项目..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js版本: $node_version"
else
    echo "❌ 请先安装Node.js (https://nodejs.org/)"
    exit 1
fi

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装合约依赖
echo "📦 安装合约依赖..."
cd contracts
npm install

# 编译合约
echo "🔨 编译智能合约..."
npm run compile

# 返回根目录
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install

# 返回根目录
cd ..

echo "✅ 项目设置完成！"
echo ""
echo "📝 下一步操作："
echo "1. 复制 contracts/env.example 到 contracts/.env"
echo "2. 在 contracts/.env 中设置您的私钥"
echo "3. 运行 'npm run dev' 启动开发环境"
echo "4. 运行 'npm run deploy' 部署到Monad测试网"
echo ""
echo "🔗 有用的命令："
echo "  npm run dev          # 启动开发环境"
echo "  npm run build        # 构建项目"
echo "  npm run deploy       # 部署合约"
echo "  npm run test         # 运行测试"
echo ""
echo "🎉 祝您使用愉快！"
