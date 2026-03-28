# 领锁物联后台 - 迭代指南

> 版本：v2.0 | 更新：2026-03-29
> 必读：《Vue3重构全面检查标准》已发布：
> https://pq1dheaf25k.feishu.cn/wiki/Ui9NwZjzTicNJLkn1VCc6hkynzg

## 核心原则

1. **参考原系统逻辑**：所有截图位于 `site/screenshots-v2/` 目录，对照参考
2. **遵循原系统功能**：不能凭空创造功能，必须基于截图里的真实业务逻辑
3. **逻辑完整性**：每个功能要有增删改查，不能只有展示
4. **交互闭环**：有点击反馈、有弹窗确认、有表单填写
5. **全面检查**：每次迭代合并代码前，完成全面检查清单（见下方）
6. **20秒规则**：不等待用户，直接执行

## 全面检查标准（每次迭代必须完成）

### 代码风格
- ✅ 使用 Vue3 Composition API + `<script setup>`
- ✅ 组件文件 `PascalCase` 命名
- ✅ 样式使用 `<style scoped>`

### 响应式自适应（5个断点必须验证）
| 屏幕宽度 | 效果 |
|------|------|
| >1280px | 完整双栏布局 |
| ≤1280px | 侧边面板收窄至280px |
| ≤1024px | 侧边栏折叠、卡片2列 |
| ≤768px | 汉堡菜单出现 |
| ≤640px | 卡片进一步缩小 |

### Git 提交规范
- `feat:` 新功能、`fix:` Bug修复、`style:` 样式、`refactor:` 重构
- 禁止提交 `console.log`、临时文件 `.bak`/`.tmp`
- 单次提交不超过5个文件

### 功能检查
- [ ] console.error = 0
- [ ] 资源404 = 0
- [ ] 增删改查闭环完整
- [ ] 操作有Toast反馈
- [ ] 删除有二次确认

### 禁止的改进
- ❌ 纯样式美化
- ❌ 破坏现有功能的"优化"
- ❌ 5分钟无法完成的复杂功能

## 原系统功能模块（必须参考）

### 首页/入住/钥匙
- 入住办理：入住/退房/清洁按钮
- 办理记录：开锁人/方式/时间
- 房态记录：入住/退房/换房完整记录
- 楼栋楼层：楼栋配置、楼层管理
- 房型管理：标准间/大床房/亲子间
- 房间管理：房间号/楼层/状态

### 硬件物联
- 楼层平面图：在线/离线状态
- 设备列表：UUID/电量/信号/同步时间
- 设备详情弹窗：固件版本/累计开锁次数/远程操作
- 房间详情：房间信息+门锁信息+钥匙信息

### 服务工单
- 工单类型：客户投诉/点评/发票/送物等
- 状态标签：待接受/处理中/已完成

### 管理配置
- 系统设置：Logo/名称/地址/电话
- 房型管理：增删改查
- 员工管理：增删改查/重置密码
- 角色管理：权限细分
- 会员管理：等级权益

## 迭代方向

### 高优先级
- 补全原系统有但Demo没有的功能（如办理记录、房态记录）
- 增加表单填写+确认弹窗
- 增加增删改查的完整闭环
- 增加状态筛选/Tab切换

### 中优先级
- 详情页的历史记录Tab
- 操作成功/失败的Toast提示
- 分页加载
- 数据为空时的占位状态

## 部署规范

```bash
cd ~/.openclaw/workspace/lock-club-website/site
vercel --prod --token vcp_2kXDRctSLBM2EYSvrTv4DehCWz6OLmf38QjlC7jjuURcr80ZEn2akrVg --yes
```

## 截图目录
- `site/screenshots-v2/01-homepage-xbd.jpg` - 首页
- `site/screenshots-v2/02-hardware-xbd.jpg` - 硬件物联
- `site/screenshots-v2/03-service-xbd.jpg` - 服务工单
- `site/screenshots-v2/04-energy-xbd.jpg` - 节能风控
- `site/screenshots-v2/05-config-xbd.jpg` - 管理配置

## 预览链接
- Cloudflare：https://lock-club-website.zhangyh9.workers.dev/complete-app2.html
- 本地：http://192.168.100.63:3000/complete-app2.html
