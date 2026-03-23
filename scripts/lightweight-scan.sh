#!/bin/bash
# 网站轻量扫描 - 发现问题才触发我
# 每30分钟执行，发现问题写入flag文件

SCAN_LOG="/tmp/site-scan-trigger.txt"
REPO="/Users/hugo/.openclaw/workspace/lock-club-website/site"

cd "$REPO"

ISSUES=0
FOUND=""

# 检查1: 占位图
if grep -q "case-example.jpg" "$REPO"/*.html 2>/dev/null; then
    ISSUES=$((ISSUES+1))
    FOUND="${FOUND}[占位图残留] "
fi

# 检查2: og:image占位图
if grep -q 'og:image.*placeholder' "$REPO/index.html" 2>/dev/null; then
    ISSUES=$((ISSUES+1))
    FOUND="${FOUND}[og:image占位图] "
fi

# 检查3: sitemap旧域名
if grep -q "lock.club" "$REPO/sitemap.xml" 2>/dev/null; then
    ISSUES=$((ISSUES+1))
    FOUND="${FOUND}[sitemap旧域名] "
fi

# 检查4: robots.txt配置
if grep -q "lock.club" "$REPO/robots.txt" 2>/dev/null; then
    ISSUES=$((ISSUES+1))
    FOUND="${FOUND}[robots.txt旧域名] "
fi

# 检查5: 代码是否落后于远程
LOCAL=$(git -C "$REPO" rev-parse HEAD 2>/dev/null)
REMOTE=$(git -C "$REPO" ls-remote origin refs/heads/master 2>/dev/null | cut -f1)
if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
    ISSUES=$((ISSUES+1))
    FOUND="${FOUND}[代码落后远程] "
fi

# 写flag
echo "$(date '+%Y-%m-%d %H:%M')|${ISSUES}|${FOUND}" > "$SCAN_LOG"

if [ "$ISSUES" -gt 0 ]; then
    echo "⚠️ 发现 ${ISSUES} 个问题: ${FOUND}"
else
    echo "✅ 无问题"
fi
