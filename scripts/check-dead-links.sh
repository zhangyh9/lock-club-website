#!/bin/bash
# 死链检测脚本
# 用法: bash check-dead-links.sh

echo "🔍 开始死链检测..."
echo "========================"

FAILED=0
PASSED=0

# 检测内部链接
check_url() {
    local url="$1"
    local name="$2"
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "✅ $name ($status)"
        PASSED=$((PASSED + 1))
    else
        echo "❌ $name ($status)"
        FAILED=$((FAILED + 1))
    fi
}

# 基础页面
check_url "http://localhost:8080/" "首页"
check_url "http://localhost:8080/products.html" "产品页"
check_url "http://localhost:8080/cases.html" "案例页"
check_url "http://localhost:8080/contact.html" "联系页"
check_url "http://localhost:8080/tech.html" "技术页"
check_url "http://localhost:8080/about.html" "关于页"
check_url "http://localhost:8080/journal.html" "品牌日记"
check_url "http://localhost:8080/privacy.html" "隐私政策"
check_url "http://localhost:8080/404.html" "404页面"

echo ""
echo "========================"
echo "📊 检测完成: ✅$PASSED ❌$FAILED"
echo "💡 提示: 确保本地服务器在 localhost:8080 运行"

if [ $FAILED -gt 0 ]; then
    echo "⚠️  有 $FAILED 个链接失败，请检查"
    exit 1
else
    echo "✅  所有链接正常"
fi
