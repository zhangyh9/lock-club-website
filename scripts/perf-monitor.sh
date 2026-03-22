#!/bin/bash
# 网站性能监控脚本
# 功能：监控 lockclub.wangjile.cn 加载速度并记录到日志

LOG_FILE="/Users/hugo/.openclaw/workspace/lock-club-website/notes/perf-monitor.log"
URL="https://lockclub.wangjile.cn"
THRESHOLD=3.0  # 加载时间阈值（秒），超过则告警

# 执行 curl 测试
RESULT=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}|%{speed_download}" "$URL" 2>/dev/null)

if [ -z "$RESULT" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ERROR | Site unreachable" >> "$LOG_FILE"
    echo "ERROR: Site unreachable"
    exit 1
fi

IFS='|' read -r HTTP_CODE TIME_TOTAL SIZE_SPEED SPEED_DOWNLOAD <<< "$RESULT"

# 解析数据
TIME_MS=$(awk "BEGIN {printf \"%.0f\", $TIME_TOTAL * 1000}")
SPEED_KBS=$(awk "BEGIN {printf \"%.1f\", $SPEED_DOWNLOAD / 1024}")

# 记录日志
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "$TIMESTAMP | $HTTP_CODE | ${TIME_MS}ms | ${SPEED_KBS}KB/s" >> "$LOG_FILE"

# 输出结果
echo "HTTP: $HTTP_CODE | Time: ${TIME_MS}ms | Speed: ${SPEED_KBS}KB/s"

# 超过阈值告警
TIME_SEC=$(awk "BEGIN {printf \"%.2f\", $TIME_TOTAL}")
if (( $(echo "$TIME_TOTAL > $THRESHOLD" | bc -l) )); then
    echo "⚠️  WARNING: Load time ${TIME_SEC}s exceeds threshold ${THRESHOLD}s"
fi

# 保留最近1000条日志
tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
