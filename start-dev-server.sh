#!/bin/bash
# 本地开发服务器启动脚本 - 禁用浏览器缓存
cd "$(dirname "$0")/site"
echo "🚀 启动本地服务器: http://localhost:8080"
echo "📝 访问地址: http://localhost:8080/index.html"
echo "⚠️  缓存已禁用，确保始终看到最新代码"
python3 -m http.server 8080 --bind 127.0.0.1
