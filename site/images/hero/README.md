# Hero 轮播图片目录

## 存放位置
- `slide1.jpg` — Slide 1 背景图（品牌定位）
- `slide2.jpg` — Slide 2 背景图（营收守护）
- `slide3.jpg` — Slide 3 背景图（降本增效）
- `slide1.mp4` — Slide 1 背景视频（可选，优先于图片）
- `slide2.mp4` — Slide 2 背景视频（可选）
- `slide3.mp4` — Slide 3 背景视频（可选）

## 图片规格建议
| 属性 | 推荐值 |
|------|--------|
| 尺寸 | 1920×1080px（16:9） |
| 格式 | JPG（照片）或 WebP（更小） |
| 大小 | 每张 < 300KB |
| 风格 | 酒店大堂/客房/门锁特写，暗色调为主 |

## 视频规格建议
| 属性 | 推荐值 |
|------|--------|
| 格式 | MP4 (H.264) 或 WebM |
| 分辨率 | 1920×1080 |
| 时长 | 10-30秒循环素材 |
| 大小 | 每条 < 5MB |
| 必须 | `autoplay muted loop playsinline` 属性已预设 |

## 使用方法
1. 将图片放入本目录
2. 打开 `index.html` 第 2261、2308、2349 行
3. 去掉对应注释，填入文件名，例如：
   ```html
   <img class="hero-slide-bg" src="images/hero/slide1.jpg" alt="">
   ```
4. 视频同理，去掉注释并填入路径即可
