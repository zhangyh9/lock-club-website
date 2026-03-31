#!/usr/bin/env python3
"""任务追踪器 - 标准JSON格式"""
import json
from datetime import datetime

POOL_FILE = "/Users/hugo/.openclaw/workspace/lock-club-website/scripts/iot-optimizer/tasks-pool.json"

def load():
    with open(POOL_FILE, 'r') as f:
        return json.load(f)

def save(data):
    with open(POOL_FILE, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_next_task():
    """获取下一个待执行任务"""
    data = load()
    pending = [(tid, t) for tid, t in data['tasks'].items() if t.get('status', 'pending') == 'pending']
    pending.sort(key=lambda x: x[1]['priority'])
    return pending[0] if pending else (None, None)

def mark_done(task_id):
    """标记任务完成（从列表中移除）"""
    data = load()
    if task_id in data['tasks']:
        del data['tasks'][task_id]
        data['doneCount'] = data.get('doneCount', 0) + 1
        data['updatedAt'] = datetime.now().isoformat()
        save(data)

def get_stats():
    """获取统计"""
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
    
    tid, task = get_next_task()
    if tid:
        print(f"   下个任务: {tid} [{task.get('priority', 'P0')}]")

if __name__ == '__main__':
    report()
