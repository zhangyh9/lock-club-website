#!/usr/bin/env python3
"""任务追踪器"""
import json
from datetime import datetime

POOL_FILE = "/Users/hugo/.openclaw/workspace/lock-club-website/scripts/iot-optimizer/tasks-pool.json"

def load():
    with open(POOL_FILE, 'r') as f:
        return json.load(f)

def save(data):
    with open(POOL_FILE, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_next_tasks(count=3):
    """获取下N个待执行任务"""
    data = load()
    pending = [(tid, t) for tid, t in data['tasks'].items() if t.get('status', 'pending') == 'pending']
    pending.sort(key=lambda x: x[1]['priority'])
    return pending[:count]

def mark_done(task_ids):
    """标记任务完成"""
    data = load()
    for tid in task_ids:
        if tid in data['tasks']:
            del data['tasks'][tid]
    data['doneCount'] = data.get('doneCount', 0) + len(task_ids)
    data['updatedAt'] = datetime.now().isoformat()
    save(data)

def get_stats():
    data = load()
    original_total = data.get('originalTotal', 102)
    done = data.get('doneCount', 0)
    remaining = len(data['tasks'])
    return {
        'originalTotal': original_total,
        'done': done,
        'remaining': remaining,
        'percent': round(done / original_total * 100, 1)
    }

def report():
    stats = get_stats()
    bar_len = int(stats['percent'] / 5)
    bar = '█' * bar_len + '░' * (20 - bar_len)
    print(f"📊 精简进度: [{bar}] {stats['percent']}% ({stats['done']}/{stats['originalTotal']})")
    print(f"   已完成: {stats['done']} | 待执行: {stats['remaining']}")
    
    tasks = get_next_tasks(3)
    if tasks:
        print(f"   下批任务: {', '.join([t[0] for t in tasks])}")

if __name__ == '__main__':
    report()
