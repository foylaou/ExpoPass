#!/bin/bash

echo "🚀 開始建立 ExpoPass 專案 (TypeScript + pnpm)..."

# 檢查是否安裝 pnpm
if ! command -v pnpm &> /dev/null
then
    echo "📦 安裝 pnpm..."
    npm install -g pnpm
fi

# 建立 Frontend (React + TypeScript)
echo "📱 建立 Frontend..."
pnpm create vite frontend --template react-ts
cd frontend
pnpm install
pnpm add react-router-dom @tanstack/react-query axios
pnpm add tailwindcss postcss autoprefixer
pnpm add qrcode.react html5-qrcode
pnpm add -D vite-plugin-pwa @types/qrcode.react
pnpx tailwindcss init -p
cd ..

# 建立 Backend (Node.js + TypeScript + Express)
echo "⚙️  建立 Backend..."
mkdir backend
cd backend
pnpm init
pnpm add express pg dotenv cors uuid qrcode helmet express-validator morgan
pnpm add -D typescript @types/node @types/express @types/cors @types/uuid @types/qrcode @types/morgan nodemon ts-node tsx
cd ..

# 建立 monorepo 配置
echo "📦 建立 monorepo 配置..."
cat > pnpm-workspace.yaml << EOF
packages:
  - 'frontend'
  - 'backend'
EOF

# 建立根目錄 package.json
cat > package.json << EOF
{
  "name": "expo-pass",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm -r build",
    "build:frontend": "pnpm --filter frontend build",
    "build:backend": "pnpm --filter backend build"
  }
}
EOF

echo "✅ ExpoPass 專案初始化完成！"
echo ""
echo "📁 專案結構："
echo "ExpoPass/"
echo "├── frontend/    (React + TypeScript + Vite)"
echo "├── backend/     (Node.js + TypeScript + Express)"
echo "└── package.json (Monorepo 根配置)"
echo ""
echo "🎯 下一步："
echo "1. cd backend && 建立 tsconfig.json"
echo "2. 建立資料庫配置"
echo "3. 執行 pnpm dev 啟動開發環境"
