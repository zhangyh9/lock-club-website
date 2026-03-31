#!/bin/bash
# 领锁物联后台精简优化执行脚本
# 每10分钟自动执行一轮优化

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/optimizer.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行物联后台优化..." >> "$LOG_FILE"

cd "$PROJECT_DIR" || exit 1

python3 "$SCRIPT_DIR/run-optimizer.py" 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}
if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 优化执行完成" >> "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 优化执行失败，退出码: $EXIT_CODE" >> "$LOG_FILE"
fi

exit $EXIT_CODE
