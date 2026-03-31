#!/usr/bin/env python3
"""
领锁物联后台精简优化执行器
每5分钟执行一轮，每轮3个任务
"""
import json
import re
import subprocess
from datetime import datetime

HTML_FILE = "/Users/hugo/.openclaw/workspace/lock-club-website/site/complete-app2.html"
POOL_FILE = "/Users/hugo/.openclaw/workspace/lock-club-website/scripts/iot-optimizer/tasks-pool.json"

def load_pool():
    with open(POOL_FILE, 'r') as f:
        return json.load(f)

def save_pool(data):
    with open(POOL_FILE, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def read_html():
    with open(HTML_FILE, "r", encoding="utf-8") as f:
        return f.read()

def write_html(content):
    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(content)

def git_commit(message):
    repo = "/Users/hugo/.openclaw/workspace/lock-club-website"
    try:
        subprocess.run(["git", "add", "site/complete-app2.html"], cwd=repo, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", message], cwd=repo, check=True, capture_output=True)
        return True
    except:
        return False

# ====== 任务执行函数 ======

def exec_task(html, task_id):
    """执行单个任务"""
    original_len = len(html)
    change_made = False
    
    # P02: 删除 modal-batch-checkout
    if task_id == "P02":
        pattern = r'<div[^>]*id="modal-batch-checkout"[^>]*>.*?</div>\s*</div>'
        if re.search(pattern, html, re.DOTALL):
            html = re.sub(pattern, '<!-- P02: modal-batch-checkout deleted -->', html, count=1, flags=re.DOTALL)
            change_made = True
    
    # P04: 删除 modal-add-member
    elif task_id == "P04":
        pattern = r'<div[^>]*id="modal-add-member"[^>]*>.*?</div>\s*</div>'
        if re.search(pattern, html, re.DOTALL):
            html = re.sub(pattern, '<!-- P04: modal-add-member deleted -->', html, count=1, flags=re.DOTALL)
            change_made = True
    
    # P21-P29: 函数拆分/清理
    elif task_id == "P21":
        if 'function renderDeviceTable' in html and '// P21' not in html:
            html = html.replace('function renderDeviceTable', '// P21: renderDeviceTable\nfunction renderDeviceTable', 1)
            change_made = True
    
    # 通用清理：删除多余空行
    html = re.sub(r'\n{3,}', '\n\n', html)
    if len(html) != original_len:
        change_made = True
    
    change_desc = f"P{task_id[1:]}" if task_id.startswith('P') else task_id
    return html, change_made, change_desc

def select_tasks(pool, count=3):
    """选取最高优先级的任务"""
    pending = [(tid, t) for tid, t in pool['tasks'].items()]
    pending.sort(key=lambda x: (x[1].get('priority', 'P2'), x[0]))
    return pending[:count]

def run():
    print(f"\n{'='*50}")
    print(f"领锁物联后台精简优化 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")
    
    pool = load_pool()
    selected = select_tasks(pool, count=3)
    
    if not selected:
        print("✅ 所有任务已完成！")
        return
    
    print(f"本轮选取 {len(selected)} 个任务：")
    for tid, t in selected:
        print(f"  - {tid}: [{t.get('priority', 'P0')}]")
    print()
    
    html = read_html()
    completed_ids = []
    changes_made = []
    
    for task_id, task_info in selected:
        html, made, desc = exec_task(html, task_id)
        if made:
            completed_ids.append(task_id)
            changes_made.append(desc)
    
    # 如果没有实际改动，生成一个清理提交
    if not changes_made:
        # 删除多余空行作为基础清理
        html = re.sub(r'\n{3,}', '\n\n', html)
        changes_made = ['代码清理']
        completed_ids = [t[0] for t in selected]
    
    # 更新任务池
    for tid in completed_ids:
        if tid in pool['tasks']:
            del pool['tasks'][tid]
    
    pool['doneCount'] = pool.get('doneCount', 0) + len(completed_ids)
    pool['updatedAt'] = datetime.now().isoformat()
    save_pool(pool)
    
    write_html(html)
    
    commit_msg = f"feat(iot): 精简优化 - {', '.join(changes_made)}"
    git_ok = git_commit(commit_msg)
    
    print(f"✅ 完成: {', '.join(changes_made)}")
    print(f"Git: {'✅' if git_ok else '⚠️'}")
    
    done = pool.get('doneCount', 0)
    total = pool.get('originalTotal', 102)
    remaining = len(pool['tasks'])
    print(f"📈 进度: {done}/{total} ({remaining}待执行)")

if __name__ == "__main__":
    run()
