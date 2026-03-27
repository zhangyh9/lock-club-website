#!/bin/bash
# 百度sitemap提交状态检测
# 使用百度搜索资源平台API检查sitemap状态

# 百度API配置（从环境变量读取，禁止硬编码）
BAIDU_API_KEY="${BAIDU_BCE_ACCESS_KEY}"
SITEMAP_URL="https://lockclub.wangjile.cn/sitemap.xml"

if [ -z "$BAIDU_API_KEY" ]; then
    echo "⚠️  错误：未设置环境变量 BAIDU_BCE_ACCESS_KEY"
    echo "   请在 ~/.bashrc 或 ~/.zshrc 中添加："
    echo "   export BAIDU_BCE_ACCESS_KEY='your_access_key_here'"
    exit 1
fi

echo "🔍 百度sitemap状态检测"
echo "========================"

# 1. 检查sitemap文件是否存在
echo ""
echo "1️⃣ Sitemap文件检查:"
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITEMAP_URL" | grep -q "200"; then
    echo "✅ Sitemap可访问: $SITEMAP_URL"
    URL_COUNT=$(curl -s "$SITEMAP_URL" | grep -c "<loc>")
    echo "   包含 $URL_COUNT 个URL"
else
    echo "❌ Sitemap无法访问"
fi

# 2. 检查主要页面是否被收录
echo ""
echo "2️⃣ 百度收录检查:"
BaiduCheck() {
    local url="$1"
    local name="$2"
    local encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$url'))")
    local result=$(curl -s -L --max-time 15 "https://www.baidu.com/s?wd=site:$encoded" 2>/dev/null | grep -o "[0-9,]*条结果" | head -1)
    if [ -n "$result" ]; then
        echo "   $name: $result"
    else
        echo "   $name: 未收录或无法检测"
    fi
}

BaiduCheck "lockclub.wangjile.cn" "官网首页"
BaiduCheck "lockclub.wangjile.cn/products.html" "产品页"

# 3. 手动操作指引
echo ""
echo "3️⃣ 百度搜索资源平台 - 手动操作步骤:"
echo "   访问: https://ziyuan.baidu.com"
echo "   1. 登录百度账号"
echo "   2. 添加网站: lockclub.wangjile.cn"
echo "   3. 选择验证方式(推荐HTML文件验证)"
echo "   4. 下载验证文件上传到site目录"
echo "   5. 验证通过后提交sitemap"
echo ""
echo "4️⃣ Google Search Console - 手动操作步骤:"
echo "   访问: https://search.google.com/search-console"
echo "   1. 添加网站属性"
echo "   2. 选择HTML元标签验证方式"
echo "   3. 将提供的meta标签添加到index.html"
echo "   4. 验证通过后提交sitemap"

echo ""
echo "========================"
echo "📝 注意: 百度/GSC需要 Hugo 手动验证网站所有权"
echo "   API无法自动化处理首次验证"
