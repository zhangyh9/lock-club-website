#!/bin/bash
# 网站全面审查脚本 - 客观扫描，不依赖主观判断
REPO="/Users/hugo/.openclaw/workspace/lock-club-website/site"
REPORT="/tmp/site-audit-report-$(date '+%Y%m%d').txt"
echo "=== 网站全面审查报告 $(date '+%Y-%m-%d %H:%M') ===" > "$REPORT"
cd "$REPO"
ISSUES=0

echo "" >> "$REPORT"
echo "【SEO维度】" >> "$REPORT"
OG_COUNT=$(grep -c 'og:image' index.html)
echo "1. og:image数量: $OG_COUNT" >> "$REPORT"
OG_OLD=$(grep 'og:image.*lock.club\|og:image.*placeholder' index.html | wc -l | tr -d ' ')
[ "$OG_OLD" -gt 0 ] && echo "  ⚠️ og:image使用占位图或旧CDN" >> "$REPORT"

CAN_OLD=$(grep 'canonical.*lock.club' index.html | wc -l | tr -d ' ')
[ "$CAN_OLD" -gt 0 ] && echo "  ❌ canonical使用旧域名" >> "$REPORT" && ISSUES=$((ISSUES+1))

SITEMAP_OLD=$(grep 'lock.club' sitemap.xml | wc -l | tr -d ' ')
[ "$SITEMAP_OLD" -gt 0 ] && echo "  ❌ sitemap使用旧域名" >> "$REPORT" && ISSUES=$((ISSUES+1))

echo "" >> "$REPORT"
echo "【性能维度】" >> "$REPORT"
LAZY=$(grep -c 'loading="lazy"' index.html)
echo "2. lazy加载图片: $LAZY个" >> "$REPORT"
PRELOAD=$(grep -c 'rel="preload"' index.html)
echo "3. 预加载资源: $PRELOAD个" >> "$REPORT"

echo "" >> "$REPORT"
echo "【代码质量维度】" >> "$REPORT"
CONSOLE=$(grep -c "console.log" js/main.js)
echo "4. console.log数量: $CONSOLE" >> "$REPORT"
[ "$CONSOLE" -gt 1 ] && echo "  ❌ 存在console.log调试代码" >> "$REPORT" && ISSUES=$((ISSUES+1))

TODO_J=$(grep -c "TODO\|FIXME" js/main.js)
TODO_C=$(grep -c "TODO\|FIXME" css/style.css)
echo "5. TODO/FIXME标记: JS=$TODO_J CSS=$TODO_C" >> "$REPORT"
[ $((TODO_J+TODO_C)) -gt 5 ] && echo "  ⚠️ 标记过多" >> "$REPORT"

JS_SIZE=$(wc -c < js/main.js)
echo "6. JS文件: $((JS_SIZE/1024))KB" >> "$REPORT"
[ "$JS_SIZE" -gt 50000 ] && echo "  ⚠️ JS文件>50KB" >> "$REPORT"

echo "" >> "$REPORT"
echo "【内容维度】" >> "$REPORT"
ALT_EMPTY=$(grep -h 'alt=""' *.html 2>/dev/null | wc -l | tr -d ' ')
echo "7. 空alt标签: $ALT_EMPTY" >> "$REPORT"
[ "$ALT_EMPTY" -gt 0 ] && echo "  ❌ 存在空alt标签" >> "$REPORT" && ISSUES=$((ISSUES+1))

PLACEHOLDER_PAGES=$(grep -l 'placeholder\|case-example' *.html 2>/dev/null | wc -l | tr -d ' ')
echo "8. 使用占位图的页面: $PLACEHOLDER_PAGES个" >> "$REPORT"

echo "" >> "$REPORT"
echo "【结构维度】" >> "$REPORT"
HTTP=$(grep -h 'src="http://' *.html 2>/dev/null | wc -l | tr -d ' ')
echo "9. HTTP链接(应为HTTPS): $HTTP" >> "$REPORT"
[ "$HTTP" -gt 0 ] && echo "  ❌ 存在HTTP链接" >> "$REPORT" && ISSUES=$((ISSUES+1))

echo "" >> "$REPORT"
echo "【统计】" >> "$REPORT"
echo "发现的问题数量: $ISSUES" >> "$REPORT"

cat "$REPORT"
