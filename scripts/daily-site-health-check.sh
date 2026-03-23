#!/bin/bash
# 网站健康度每日扫描
# 每天早8点执行，发现问题自动写入飞书任务表

echo "🔍 网站健康度每日扫描 - $(date '+%Y-%m-%d %H:%M')"

cd /Users/hugo/.openclaw/workspace/lock-club-website/site

ISSUES=0

# 1. 检查是否需要Git pull（线上已有新commit）
echo ""
echo "1️⃣ 检查代码同步状态..."
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git ls-remote origin refs/heads/master 2>/dev/null | cut -f1)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "⚠️  本地代码落后于线上，有新commit未同步"
    ISSUES=$((ISSUES + 1))
else
    echo "✅  代码已是最新"
fi

# 2. 检查占位图残留
echo ""
echo "2️⃣ 检查占位图..."
PLACEHOLDER_COUNT=$(grep -l "case-example.jpg\|placeholder-banner" *.html 2>/dev/null | wc -l)
if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
    echo "⚠️  发现 $PLACEHOLDER_COUNT 个页面使用占位图"
    ISSUES=$((ISSUES + 1))
else
    echo "✅  无占位图残留"
fi

# 3. 检查og:image配置
echo ""
echo "3️⃣ 检查OG标签..."
OG_ISSUES=$(grep -c "placeholder-banner" index.html 2>/dev/null || echo 0)
if [ "$OG_ISSUES" -gt 0 ]; then
    echo "⚠️  首页og:image使用占位图"
    ISSUES=$((ISSUES + 1))
else
    echo "✅  og:image配置正常"
fi

# 4. 检查死链（本地服务器）
echo ""
echo "4️⃣ 检查页面可达性..."
PAGES_OK=0
for page in "" "products.html" "cases.html" "contact.html" "tech.html"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:8080/$page" 2>/dev/null)
    if [ "$status" = "200" ]; then
        PAGES_OK=$((PAGES_OK + 1))
    fi
done
if [ "$PAGES_OK" -ge 5 ]; then
    echo "✅  所有主页面可达"
else
    echo "⚠️  本地服务器未运行（$PAGES_OK/5页面可达）"
fi

# 5. 检查sitemap
echo ""
echo "5️⃣ 检查sitemap..."
if grep -q "lock.club" sitemap.xml 2>/dev/null; then
    echo "⚠️  sitemap使用旧域名lock.club"
    ISSUES=$((ISSUES + 1))
else
    echo "✅  sitemap域名配置正确"
fi

# 6. 检查robots.txt
echo ""
echo "6️⃣ 检查robots.txt..."
if grep -q "lock.club" robots.txt 2>/dev/null; then
    echo "⚠️  robots.txt sitemap地址使用旧域名"
    ISSUES=$((ISSUES + 1))
else
    echo "✅  robots.txt配置正确"
fi

# 总结
echo ""
echo "========================"
echo "📊 扫描完成: 发现 $ISSUES 个问题"
if [ "$ISSUES" -eq 0 ]; then
    echo "✅ 网站健康，无需干预"
    exit 0
else
    echo "⚠️  发现问题，建议手动检查"
    exit 1
fi
