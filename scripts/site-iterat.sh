#!/bin/bash
# site-iterat.sh — 领锁官网自动迭代脚本
# 每次执行一个迭代任务，发现→执行→commit→报告
# 由 cron 每6小时自动触发一次

REPO="/Users/hugo/.openclaw/workspace/lock-club-website"
SITE="$REPO/site"
LOG="$REPO/notes/iteration-$(date '+%Y%m').log"
TODAY=$(date '+%Y-%m-%d %H:%M')

mkdir -p "$REPO/notes"

log() { echo "[$TODAY] $1" | tee -a "$LOG"; }

# ========== 任务库 ==========
TASKS=(
  "check_facts:检查数据一致性"
  "check_images:检查图片404"
  "check_links:检查死链"
  "check_seo:SEO基础检查"
  "check_contrast:检查色彩对比度"
  "check_perf:性能建议"
)

TOTAL=${#TASKS[@]}

# 取当天日期作为随机种子，决定今天执行哪个任务（均匀分布）
DAY_NUM=$(date '+%j')
TASK_IDX=$((DAY_NUM % TOTAL))
SELECTED_TASK="${TASKS[$TASK_IDX]}"
TASK_NAME="${SELECTED_TASK%%:*}"
TASK_DESC="${SELECTED_TASK##*:}"

log "==== 自动迭代 #$(date '+%Y%m%d%H%M') ===="
log "今日任务: $TASK_NAME - $TASK_DESC"

cd "$REPO"

case "$TASK_NAME" in

  check_facts)
    # 飞房率一致性检查
    ISSUES=$(grep -c '飞房率 0\.' "$SITE/index.html" 2>/dev/null || echo 0)
    if [ "$ISSUES" -gt 0 ]; then
      log "⚠️ 发现飞房率数字残留 $ISSUES 处，自动修复"
      # 已经在上一轮修复，这里只是检测
      git pull origin master >> "$LOG" 2>&1
      REMAIN=$(grep -c '飞房率 0\.' "$SITE/index.html" 2>/dev/null || echo 0)
      if [ "$REMAIN" -gt 0 ]; then
        sed -i '' 's/飞房率 0\.[0-9]%/飞房率 100% 防止/g' "$SITE/index.html"
        git add "$SITE/index.html"
        git commit -m "fix(自动): 飞房率数字一致性修复
- 自动迭代任务: check_facts
- $(date '+%Y-%m-%d %H:%M')" >> "$LOG" 2>&1
        git push >> "$LOG" 2>&1
        log "✅ 已修复并推送"
      fi
    else
      log "✅ 飞房率数据一致，无需改动"
    fi
    ;;

  check_images)
    # 统计占位图
    PLACEHOLDERS=$(grep -c 'placeholder\|PLACEHOLDER' "$SITE/index.html" 2>/dev/null || echo 0)
    IMAGES_MISSING=$(grep -oh 'images/[^"]*' "$SITE/index.html" | sort -u | while read img; do
      [ ! -f "$SITE/$img" ] && echo "$img"
    done | wc -l | tr -d ' ')
    log "占位图: $PLACEHOLDERS 处, 缺失图片: $IMAGES_MISSING 个"
    if [ "$PLACEHOLDERS" -gt 5 ]; then
      log "⚠️ 占位图过多($PLACEHOLDERS处)，建议优先替换"
    fi
    ;;

  check_links)
    # 内部链接一致性
    DEAD=$(grep -oh 'href="[^"]*\.html[^"]*"' "$SITE/index.html" | sort -u | while read link; do
      target=${link#href=\"}
      target=${target%?}
      [ -n "$target" ] && [ ! -f "$SITE/$target" ] && echo "$target"
    done | head -5)
    if [ -n "$DEAD" ]; then
      log "⚠️ 疑似死链: $DEAD"
    else
      log "✅ 内部链接检查通过"
    fi
    ;;

  check_seo)
    # SEO基础三项
    TITLE_LEN=$(grep -o '<title>[^<]*</title>' "$SITE/index.html" | wc -c)
    DESC_LEN=$(grep -o 'meta name="description"[^>]*' "$SITE/index.html" | grep -o 'content="[^"]*' | wc -c)
    H1_COUNT=$(grep -oc '<h1[^>]*>' "$SITE/index.html" 2>/dev/null || echo 0)
    log "SEO检查: title长度=${TITLE_LEN} desc长度=${DESC_LEN} h1数量=${H1_COUNT}"
    [ "$H1_COUNT" -gt 1 ] && log "⚠️ H1多于1个，建议检查"
    [ "$DESC_LEN" -lt 50 ] && log "⚠️ meta description过短"
    ;;

  check_contrast)
    # 检查文字色彩对比（简单正则：白底浅色文字）
    WARNINGS=$(grep -c 'color:rgba(255,255,255,0\.[0-5][^)]*' "$SITE/index.html" 2>/dev/null || echo 0)
    log "低对比度文字: $WARNINGS 处"
    [ "$WARNINGS" -gt 10 ] && log "⚠️ 低对比度文字过多，建议优化"
    ;;

  check_perf)
    # 检查大图
    HEAVY_IMGS=$(find "$SITE/images" -name '*.jpg' -o -name '*.png' 2>/dev/null | while read f; do
      size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
      [ "$size" -gt 500000 ] && echo "$(basename $f):$((size/1024))KB"
    done | head -5)
    if [ -n "$HEAVY_IMGS" ]; then
      log "⚠️ 大图(>500KB): $HEAVY_IMGS"
    else
      log "✅ 图片大小正常"
    fi
    ;;
esac

log "==== 完成 ===="
echo ""
