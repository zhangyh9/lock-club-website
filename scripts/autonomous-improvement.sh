#!/bin/bash
# 自主改进代理 v2.0 - 优化版
# 每次扫描所有HTML页面，发现问题自动修复或记录待办
# 每日只push一次，避免噪音

REPO="/Users/hugo/.openclaw/workspace/lock-club-website/site"
LOG="/tmp/autonomous-improvement.log"
STATE_FILE="/tmp/ai-improvements-state.json"
PENDING_FILE="/tmp/ai-improvements-pending.txt"

TODAY=$(date '+%Y-%m-%d')
LAST_PUSH_DATE=$(cat "$STATE_FILE" 2>/dev/null | grep '"last_push"' | cut -d'"' -f4 || echo "")
LAST_PUSH_DATE=${LAST_PUSH_DATE:-"1970-01-01"}

mkdir -p "$REPO"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

# 初始化状态文件
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        echo '{"last_push": "1970-01-01", "fixed": [], "pending": []}' > "$STATE_FILE"
    fi
    if [ ! -f "$PENDING_FILE" ]; then
        touch "$PENDING_FILE"
    fi
}

# 检查是否已修复过
was_fixed() {
    local issue="$1"
    grep -q "\"$issue\"" "$STATE_FILE" 2>/dev/null && return 0 || return 1
}

# 标记已修复
mark_fixed() {
    local issue="$1"
    if ! was_fixed "$issue"; then
        sed -i '' "s/\(\"fixed\": \[)/\1\"$issue\",/g" "$STATE_FILE" 2>/dev/null
    fi
}

# 添加到待办
add_pending() {
    local desc="$1"
    if ! grep -q "$desc" "$PENDING_FILE" 2>/dev/null; then
        echo "[$TODAY] $desc" >> "$PENDING_FILE"
    fi
}

# 自动修复函数
fix_canonical() {
    local file="$1"
    if grep -q "https://lock\.club" "$file" 2>/dev/null; then
        sed -i '' 's|https://lock\.club|https://lockclub.wangjile.cn|g' "$file"
        log "✅ 修复canonical: $file"
        return 0
    fi
    return 1
}

fix_og_image() {
    local file="$1"
    if grep -q 'placeholder-og-image.png' "$file" 2>/dev/null; then
        sed -i '' 's|/images/placeholder-og-image.png|https://lockclub.wangjile.cn/领锁-三大核心价值长图.png|g' "$file"
        log "✅ 修复og:image占位图: $file"
        return 0
    fi
    return 1
}

fix_empty_alt() {
    local file="$1"
    local count=$(grep -c 'alt=""' "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt 0 ]; then
        # 自动补上描述性alt
        sed -i '' 's|alt=""|alt="领锁智能锁产品图片"|g' "$file"
        log "✅ 修复空alt标签($count处): $file"
        return 0
    fi
    return 1
}

fix_viewport() {
    local file="$1"
    if ! grep -q 'viewport' "$file" 2>/dev/null; then
        sed -i '' 's|<head>|<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">|g' "$file"
        log "✅ 补加viewport meta: $file"
        return 0
    fi
    return 1
}

fix_description() {
    local file="$1"
    if ! grep -q '<meta name="description"' "$file" 2>/dev/null; then
        sed -i '' 's|<head>|<head>\n    <meta name="description" content="领锁智能锁，酒店智能门锁专家，提供安全、节能、省心的智能锁解决方案。">|g' "$file"
        log "✅ 补加description meta: $file"
        return 0
    fi
    return 1
}

# ===== 主程序 =====
init_state
log "=== 自主改进代理 v2.0 开始扫描 ==="

cd "$REPO"
FIXED_COUNT=0
SCAN_COUNT=0

# 扫描所有HTML文件
for file in $(find . -name "*.html" -type f 2>/dev/null); do
    SCAN_COUNT=$((SCAN_COUNT + 1))
    
    # 检查1: canonical旧域名
    fix_canonical "$file" && FIXED_COUNT=$((FIXED_COUNT + 1)) && mark_fixed "canonical_$(basename $file)"
    
    # 检查2: og:image占位图
    fix_og_image "$file" && FIXED_COUNT=$((FIXED_COUNT + 1)) && mark_fixed "og_image_$(basename $file)"
    
    # 检查3: 空alt标签
    fix_empty_alt "$file" && FIXED_COUNT=$((FIXED_COUNT + 1)) && mark_fixed "empty_alt_$(basename $file)"
    
    # 检查4: viewport缺失
    fix_viewport "$file" && FIXED_COUNT=$((FIXED_COUNT + 1)) && mark_fixed "viewport_$(basename $file)"
    
    # 检查5: description缺失
    fix_description "$file" && FIXED_COUNT=$((FIXED_COUNT + 1)) && mark_fixed "description_$(basename $file)"
    
done

log "扫描完成: 检查了 $SCAN_COUNT 个HTML文件，修复 $FIXED_COUNT 处"

# 汇总待人工处理的问题
TODO_COUNT=$(grep -cE "TODO|FIXME|XXX" $(find . -name "*.js" -o -name "*.html") 2>/dev/null || echo 0)
if [ "$TODO_COUNT" -gt 0 ]; then
    add_pending "代码注释TODO/FIXME: $TODO_COUNT 处待人工审核"
fi

# ===== Git提交逻辑 =====
cd /Users/hugo/.openclaw/workspace/lock-club-website

# 有修改才提交
if git diff --quiet 2>/dev/null; then
    log "✅ 无需改进，继续监控"
else
    # 检查是否今天已push
    if [ "$LAST_PUSH_DATE" != "$TODAY" ]; then
        git add -A
        git commit -m "fix(自主改进): 自动化修复 $FIXED_COUNT 处问题

- 扫描范围: $SCAN_COUNT 个HTML文件
- 自动修复: 死链/占位图/空alt/viewport/description
- 执行时间: $(date '+%Y-%m-%d %H:%M')
- [skip-ci]" >> "$LOG" 2>&1
        
        # 尝试push，失败不重复尝试
        if git push >> "$LOG" 2>&1; then
            log "✅ 已修复并推送: $FIXED_COUNT 处更新"
            # 更新最后push日期
            sed -i '' "s/\"last_push\": \"[^\"]*\"/\"last_push\": \"$TODAY\"/g" "$STATE_FILE"
        else
            log "⚠️ Git推送失败，下次重试"
        fi
    else
        log "⚠️ 今日已推送，静默积累"
    fi
fi

# 输出最终状态
if [ "$FIXED_COUNT" -gt 0 ]; then
    echo "已修复: $FIXED_COUNT 处"
else
    echo "无需改进，继续监控"
fi
