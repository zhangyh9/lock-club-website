# 网站性能监控方案

> 创建时间：2026-03-22 | 负责人：领锁优化

---

## 一、监控目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| HTTP 响应状态 | 200 | 正常访问 |
| 加载时间 | < 3s | 超过3s触发告警 |
| 下载速度 | > 50KB/s | 网络通畅指标 |

---

## 二、监控脚本

**位置**：`scripts/perf-monitor.sh`

**功能**：
- 检测 HTTP 状态码
- 测量加载时间（毫秒）
- 计算下载速度（KB/s）
- 超过阈值自动告警
- 日志保留最近1000条

**使用方式**：
```bash
# 手动执行
./scripts/perf-monitor.sh

# 定时监控（每小时）
crontab -e
0 * * * * /Users/hugo/.openclaw/workspace/lock-club-website/scripts/perf-monitor.sh
```

**日志文件**：`notes/perf-monitor.log`

---

## 三、当前性能状态（2026-03-22）

| 指标 | 当前值 | 状态 |
|------|--------|------|
| HTTP 状态 | 000 | 🔴 无法访问 |
| 加载时间 | 5001ms | 🔴 超限 |
| 下载速度 | 0 KB/s | 🔴 无法传输 |

**说明**：Vercel 免费版每日部署限额（100次）已用尽，需24小时后恢复。

---

## 四、历史性能基准（参考PERF_ANALYSIS.md）

| 指标 | 预估基准 | 优化目标 |
|------|----------|----------|
| HTML 文件大小 | 632KB | < 400KB |
| 内联样式数 | 2598个 | < 500个 |
| FCP | ~2.5s | < 1.8s |
| LCP | ~3.2s | < 2.5s |
| 图片懒加载 | 仅1个 | 全部添加 |

---

## 五、优化建议（来自PERF_ANALYSIS.md）

### P0 紧急
1. 所有 `<img>` 添加 `loading="lazy" decoding="async"`
2. 提取 Hero 区域 ~800+ 内联样式到 `<style>` 块

### P1 重要
3. 提取 30+ 公共样式类（字体、颜色、间距）
4. 合并结构化数据 JSON-LD 为 `@graph` 数组

### P2 改进
5. WhatsApp/Toast 浮层改用 IntersectionObserver
6. 品牌墙动画加 `will-change: transform`

---

## 六、部署后验证

Vercel 部署恢复后，执行以下验证：

```bash
# 1. 运行监控脚本
./scripts/perf-monitor.sh

# 2. 验证关键资源
curl -I https://lockclub.wangjile.cn

# 3. 检查 LCP 图片
curl -I https://lockclub.wangjile.cn/images/product-quiet.jpg
```
