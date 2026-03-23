#!/bin/bash
# 生成占位图 - 带尺寸和内容标注
mkdir -p /Users/hugo/.openclaw/workspace/lock-club-website/site/images/placeholder

# 颜色配置
PURPLE="#886cff"
GRAY="#f0f0f0"
DARK="#1a1a24"
WHITE="#ffffff"
RED="#ff6b6b"

python3 << 'EOF'
from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(filename, width, height, label, color, text_color=(255,255,255)):
    path = f"/Users/hugo/.openclaw/workspace/lock-club-website/site/images/{filename}"
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # 计算中心位置
    text = f"{label}\n{width}×{height}"
    
    # 尝试加载字体
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", min(width//10, 48))
        font_small = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", min(width//15, 28))
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # 绘制标签
    bbox = draw.textbbox((0, 0), label, font=font_large)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (width - text_w) // 2
    y = (height - text_h) // 2 - 20
    draw.text((x, y), label, fill=text_color, font=font_large)
    
    # 绘制尺寸
    size_text = f"{width}×{height}"
    bbox2 = draw.textbbox((0, 0), size_text, font=font_small)
    tw = bbox2[2] - bbox2[0]
    th = bbox2[3] - bbox2[1]
    draw.text(((width-tw)//2, y+text_h+10), size_text, fill=(200,200,200), font=font_small)
    
    # 边框
    draw.rectangle([0, 0, width-1, height-1], outline=text_color, width=3)
    
    img.save(path, quality=85)
    print(f"✅ {filename} ({width}×{height})")

# 生成占位图
placeholders = [
    # (文件名, 宽, 高, 标签, 背景色)
    ("placeholder-og-image.png", 1200, 630, "OG图片\n社交分享用", "#1a1a24"),
    ("placeholder-hero-logo.png", 1920, 600, "Hero区域Logo", "#0a1628"),
    ("placeholder-nav-logo.png", 200, 80, "导航栏Logo", "#0a1628"),
    ("placeholder-contact-qr.png", 200, 200, "联系页二维码", "#0a1628"),
    ("placeholder-wechat-qr.png", 200, 200, "微信二维码", "#0a1628"),
    ("placeholder-journal-2023q1.jpg", 400, 300, "期刊封面\n2023Q1", "#1a1a24"),
    ("placeholder-journal-2023q3.jpg", 400, 300, "期刊封面\n2023Q3", "#1a1a24"),
    ("placeholder-journal-2024q1.jpg", 400, 300, "期刊封面\n2024Q1", "#1a1a24"),
    ("placeholder-journal-2024q4.jpg", 400, 300, "期刊封面\n2024Q4", "#1a1a24"),
    ("placeholder-journal-2025q2.jpg", 400, 300, "期刊封面\n2025Q2", "#1a1a24"),
    ("placeholder-product-hero.jpg", 460, 400, "产品主图", "#1a1a24"),
    ("placeholder-case-1.jpg", 400, 300, "案例图片①", "#1a1a24"),
    ("placeholder-case-2.jpg", 400, 300, "案例图片②", "#1a1a24"),
    ("placeholder-case-3.jpg", 400, 300, "案例图片③", "#1a1a24"),
]

for args in placeholders:
    create_placeholder(*args)

print("\n✅ 全部占位图生成完成")
EOF
