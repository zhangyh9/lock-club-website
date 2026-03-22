# 领锁网站技术优化报告

> 检查时间：2026-03-22 18:04
> 检查目录：/Users/hugo/.openclaw/workspace/lock-club-website/site/

---

## 一、文件行数统计

### HTML 文件
| 文件 | 行数 |
|------|------|
| index.html | 7,977 ⚠️ 过大 |
| products.html | 2,306 |
| tech.html | 1,750 |
| contact.html | 1,735 |
| cases.html | 1,467 |
| journal.html | 752 |
| privacy.html | 144 |
| en/index.html | 1,651 |
| en/products.html | 606 |
| en/cases.html | 409 |
| en/contact.html | 345 |
| en/journal.html | 451 |
| **总计** | **19,593** |

### CSS / JS
| 文件 | 行数 |
|------|------|
| css/style.css | 2,186 |
| js/main.js | 753 |

**⚠️ 问题**：index.html 高达 7,977 行，单个文件过大，建议按功能模块拆分为多个 HTML 片段后动态加载。

---

## 二、HTML 优化检查

### 2.1 内联 CSS / JS 情况
- **内联 style 块**：index.html 中存在 **2 处内联 style**（第 23 行、第 1121 行）
- **内联 script 块**：index.html 中存在 **大量内联 script**（约 20+ 个 `<script>` 块，含 `application/ld+json` 结构化数据）
- **结构化数据**：大量 JSON-LD 分散在 HTML 中，虽为 SEO 友好，但 7 个 `<script type="application/ld+json">` 块可考虑合并

**建议**：
1. 将内联 style 内容合并到 `css/style.css`
2. 将多个 JSON-LD `<script>` 块合并为单个 `<script type="application/ld+json">`
3. index.html 中有大量 `<script>` 块在 HTML 中分散，建议将非关键 JS 移至 `js/main.js` 末尾或外部文件

### 2.2 重复 meta 标签
- **charset**：`UTF-8` 定义正常，无重复 ✅
- **viewport**：正常，无重复 ✅
- **theme-color**：存在 ✅（第 10 行）
- **description/keywords/author/robots**：在 `<head>` 区域（第 827-830 行）有正确定义 ✅
- **OG/Twitter meta**：完整 ✅
- **apple-mobile-web-app-***：在 `<head>` 有定义 ✅

**结论**：meta 标签结构规范，无重复定义问题 ✅

---

## 三、CSS 优化检查（css/style.css）

### 3.1 重复样式
通过代码审查发现以下潜在重复/可优化项：

| 序号 | 问题 | 说明 |
|------|------|------|
| 1 | **重复媒体查询块** | `@media (max-width: 992px)` 出现 **2 次**（第 1523 行、第 1975 行）；`@media (max-width: 640px)` 出现 **2 次**（第 1558 行、第 1981 行） |
| 2 | **重复选择器** | `.hero-title` 在多个媒体查询中重复定义字体大小 |
| 3 | **.hero-title 字体大小定义** | 主样式中定义为 `48px`，在 `@media (max-width: 992px)` 和 `@media (max-width: 640px)` 中重复覆盖 |
| 4 | **冗余注释块** | CSS 中存在大量版本标记注释（如 `/* V45: */`, `/* V54: */`），可清理旧版本注释 |
| 5 | **冗余空规则** | 第 1257 行附近存在 `}` 空规则 `}`，疑似结构错误 |

### 3.2 样式块结构问题
```
⚠️ 第 1257 行附近：疑似多余的闭合大括号
@media (max-width: 768px) {
    ...
    }  ← 多余的闭合括号
}
```

### 3.3 优化建议
1. **合并重复媒体查询**：将相同断点的样式块合并
2. **清理版本注释**：移除旧版本标记注释（如 V31/V39/V45 等）
3. **检查空规则**：第 1257 行附近有空规则，需修复
4. **提取公共样式**：`.section-title`、`cta-button` 等在多处重复，可提取为变量或合并

---

## 四、JS 优化检查（js/main.js）

### 4.1 冗余代码分析（753 行）

| 序号 | 问题 | 说明 |
|------|------|------|
| 1 | **重复计数器逻辑** | `initNumberCounters()` 和 `initHeroStatsCounter()` 和 `initWhyChooseNumbers()` 三个函数逻辑高度相似，存在代码重复 |
| 2 | **重复观察器创建** | 多处使用 `IntersectionObserver`，逻辑几乎相同，可抽象为通用函数 |
| 3 | **硬编码选择器** | 大量硬编码选择器如 `section[style*="background:#1a1a2e"]`，维护性差 |
| 4 | **重复 CSS 样式注入** | `initBackToTop()` 和 `initStickyMobileBar()` 直接通过 JS 注入 CSS 样式，应统一到 CSS 文件 |
| 5 | **函数注释版本标记** | 注释中有 V47/V54 等版本号，长期积累应清理 |
| 6 | **全局函数污染** | `window.showWechatQR` 定义为全局函数，可封装在 IIFE 内 |

### 4.2 优化建议
1. 将三个计数器函数合并为一个 `initCounters()`
2. 将 `IntersectionObserver` 创建逻辑抽象为 `createObserver(options)`
3. 将 JS 注入的内联样式移至 CSS 文件（如 backToTop 按钮、stickyMobileBar）
4. 清理版本标记注释
5. 将 `showWechatQR` 封装到 IIFE 内

---

## 五、PWA 检查

### 5.1 manifest.json
**路径**：`/site/manifest.json`

```json
{
  "name": "领锁智能 lock.club",
  "short_name": "领锁智能",
  "description": "领锁智能专注酒店智能门锁完整解决方案...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a1628",
  "theme_color": "#0a1628",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "https://lockclub.wangjile.cn/lingsuo_logo_1.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "https://lockclub.wangjile.cn/lingsuo_logo_1.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["business", "productivity"],
  "lang": "zh-CN",
  "scope": "/"
}
```

**评估**：✅ 配置完整，包含 name/short_name/description/start_url/display/icons/categories

**建议**：
- 图标缺少 144x144 尺寸（iPad 适配）
- icons 使用 CDN 链接，建议同时提供本地图标

### 5.2 sw.js（Service Worker）
**路径**：`/site/sw.js`（1,884 字节）

**功能**：
- ✅ 缓存静态资源列表（STATIC_ASSETS）
- ✅ Install 事件：缓存静态资源
- ✅ Activate 事件：清理旧缓存
- ✅ Fetch 事件：CacheFirst（图片/字体）/ NetworkFirst（HTML/JS/CSS）
- ✅ 跨域过滤（只缓存 lockclub.wangjile.cn / lock.club / localhost）

**评估**：
- ✅ Service Worker 基本功能完整
- ⚠️ `cache.addAll(STATIC_ASSETS)` 无条件成功回调，万一失败静默忽略
- ⚠️ HTML/JS/CSS 使用 NetworkFirst 策略，缓存过期时间未控制，可能积累过多缓存
- ⚠️ 缺少预缓存关键路径（如 manifest.json）

### 5.3 PWA 总体评估

| 项目 | 状态 |
|------|------|
| manifest.json | ✅ 完整 |
| Service Worker 注册 | ✅ 已注册（index.html 第 1631 行） |
| sw.js 功能 | ✅ 基本完整 |
| PWA 图标 | ⚠️ 缺少中间尺寸（144x144 等） |
| 离线支持 | ⚠️ 缓存策略可进一步优化 |

---

## 六、优先级优化建议汇总

### 🔴 高优先级（建议立即修复）
1. **index.html 过大**（7,977 行）：按模块拆分为多个 HTML partial
2. **CSS 空规则**：style.css 第 1257 行附近有空规则需修复
3. **重复媒体查询块**：合并相同断点的 @media

### 🟡 中优先级（建议近期优化）
4. **JS 计数器函数重复**：三个计数器逻辑合并
5. **内联 style/script**：合并到外部 CSS/JS 文件
6. **多个 JSON-LD script 块**：合并为单个
7. **JS 注入的内联样式**（backToTop/stickyBar）：移至 CSS 文件

### 🟢 低优先级（建议后续迭代）
8. 清理 CSS/JS 中的版本注释（V31/V39/V45 等）
9. PWA 图标添加 144x144 尺寸
10. Service Worker 添加缓存大小限制/过期策略

---

*报告由领锁码农自动生成*
