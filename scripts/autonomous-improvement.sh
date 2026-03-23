#!/bin/bash
# 自主改进代理 - 每次执行一个可优化的点
# 发现问题 → 修复 → commit → 静默结束

REPO="/Users/hugo/.openclaw/workspace/lock-club-website/site"
LOG="/tmp/autonomous-improvement.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始自主改进扫描..." >> "$LOG"

cd "$REPO"

# 只检查少量关键项，快速执行
ISSUE_FOUND=""
ACTION_TAKEN=""

# 检查1: canonical旧域名
if grep -q "https://lock.club" index.html 2>/dev/null; then
    ISSUE_FOUND="canonical旧域名"
    sed -i '' 's|https://lock\.club|https://lockclub.wangjile.cn|g' index.html
    ACTION_TAKEN="修复index.html canonical"
fi

# 检查2: og:image占位图
if grep -q 'og:image.*placeholder' index.html 2>/dev/null; then
    ISSUE_FOUND="og:image占位图"
    sed -i '' 's|/images/placeholder-banner-1.png|https://lockclub.wangjile.cn/领锁-三大核心价值长图.png|g' index.html
    ACTION_TAKEN="修复og:image占位图"
fi

# 检查3: 死代码注释（简单清理）
DEAD_CODE=$(grep -cE "TODO|FIXME|XXX" js/main.js 2>/dev/null || echo "0")
DEAD_CODE=$(echo "$DEAD_CODE" | tr -d '\n')
if [ -n "$DEAD_CODE" ] && [ "$DEAD_CODE" -gt 5 ] 2>/dev/null; then
    ISSUE_FOUND="TODO/FIXME注释($DEAD_CODE处)"
    ACTION_TAKEN="发现死代码注释需人工审核"
fi

# 检查4: 空alt标签
EMPTY_ALT=$(grep -c 'alt=""' index.html 2>/dev/null || echo "0")
if [ "$EMPTY_ALT" -gt 0 ]; then
    ISSUE_FOUND="空alt标签($EMPTY_ALT处)"
    ACTION_TAKEN="发现空alt标签需人工审核"
fi

# 如果有修复，提交（排除需人工审核的情况）
if [ -n "$ACTION_TAKEN" ] && [[ "$ACTION_TAKEN" != *"需人工审核"* ]]; then
    cd /Users/hugo/.openclaw/workspace/lock-club-website
    git add -A
    git commit -m "fix(自主改进): $ACTION_TAKEN

- 自主改进代理自动修复
- 发现时间: $(date '+%Y-%m-%d %H:%M')" >> "$LOG" 2>&1
    git push >> "$LOG" 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 已修复: $ISSUE_FOUND → $ACTION_TAKEN" >> "$LOG"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 无需改进，继续监控" >> "$LOG"
fi
