# EmailJS 表单配置指南

> 完成以下 4 步，让网站联系表单真正发出邮件！

---

## 第一步：注册 EmailJS（3分钟）

1. 打开 [https://www.emailjs.com](https://www.emailjs.com)
2. 点击 **Sign Up** 免费注册（支持 Google 登录）
3. 免费计划：**200 封邮件/月**，完全够用

---

## 第二步：创建 Email Service（发件服务）

1. 登录后进入 **Email Services** 页面
2. 点击 **Add Email Service** → 选择 **Gmail** 或 **Outlook**
3. 按照提示授权 Gmail/Outlook 账号
4. 授权完成后，记录下 **Service ID**（格式类似 `service_xxxxx`）

> 💡 **推荐用 Gmail**：如果老板有 Gmail 账号，直接授权最简单。
> 发件人显示为你的 Gmail 邮箱，收件人也回复到这个邮箱。

---

## 第三步：创建 Email Template（邮件模板）

1. 进入 **Email Templates** → **Create New Template**
2. 编辑模板内容，变量用 `{{var_name}}` 格式：

```
Subject: 【领锁官网新咨询】{{from_name}} - {{hotel_name}}

姓名：{{from_name}}
酒店：{{hotel_name}}
联系方式：{{contact_info}}
邮箱：{{reply_to}}
咨询类型：{{inquiry_type}}
留言：{{message}}
```

3. 保存后，记录下 **Template ID**（格式类似 `template_xxxxx`）

---

## 第四步：获取 Public Key 并填入代码

1. 进入 **Account** → **General** 页面
2. 找到 **User ID（Public Key）**，格式类似 `user_xxxxx`
3. 打开文件 `site/contact.html`，找到 `<head>` 中的这段配置：

```javascript
var EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';
var EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

4. 替换为真实的三个值：

```javascript
var EMAILJS_USER_ID = 'user_xxxxxxxxxxxxx';      // ← 你的 Public Key
var EMAILJS_SERVICE_ID = 'service_xxxxxxxx';     // ← 你的 Service ID
var EMAILJS_TEMPLATE_ID = 'template_xxxxxxxx';    // ← 你的 Template ID
```

5. 保存后提交 GitHub，Cloudflare 自动发布

---

## 验证是否生效

1. 打开网站联系页，填写表单测试
2. 点击提交，如果邮箱收到邮件 → 配置成功 ✅
3. 如果失败 → 浏览器按 F12 看 Console 错误信息

---

## 常见问题

**Q: 收件箱没收到？**
检查 EmailJS Dashboard 的 **Logs** 页面，看发送记录是成功还是失败。

**Q: 报错 "域未验证"？**
在 EmailJS 的 **Account → Security** 里，把你的网站域名加入白名单。

**Q: 想改收件邮箱？**
在 Email Service 设置里修改，或在 Template 里直接写死收件人邮箱。
