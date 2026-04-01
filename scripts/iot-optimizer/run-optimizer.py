#!/usr/bin/env python3
"""
物联后台自精简脚本 v2.0
- 读取 task-status-phase2.json 获取最高优先级pending任务
- 正则定位目标代码并执行修改
- 更新phase2.json并git commit
- 提交信息格式：🎯 第{round}轮：{任务名}
"""
import json
import re
import subprocess
import os
from datetime import datetime

# ============ 配置 ============
HTML_FILE = "/Users/hugo/.openclaw/workspace/lock-club-website/site/complete-app2.html"
PHASE2_JSON = "/Users/hugo/.openclaw/workspace/lock-club-website/scripts/iot-optimizer/task-status-phase2.json"
REPO_DIR = "/Users/hugo/.openclaw/workspace/lock-club-website"
CURRENT_ROUND = 34  # 下一轮（第34轮）

# ============ 工具函数 ============

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def git_commit(msg):
    try:
        subprocess.run(["git", "add", "site/complete-app2.html"], cwd=REPO_DIR, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", msg], cwd=REPO_DIR, check=True, capture_output=True)
        return True
    except Exception as e:
        print(f"  ⚠️ git commit失败: {e}")
        return False

def get_current_round():
    """从git log获取当前轮次"""
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-20"],
            cwd=REPO_DIR, capture_output=True, text=True
        )
        for line in result.stdout.split("\n"):
            m = re.search(r'第(\d+)轮', line)
            if m:
                return int(m.group(1))
    except:
        pass
    return CURRENT_ROUND

# ============ 任务执行器 ============

class TaskExecutor:
    """任务执行器基类"""
    def __init__(self, task_id, name, html):
        self.task_id = task_id
        self.name = name
        self.html = html
        self.modified = False
        
    def find(self, pattern, flags=re.MULTILINE):
        """在HTML中查找模式"""
        return re.findall(pattern, self.html, flags)
    
    def exists(self, pattern, flags=re.MULTILINE):
        """检查模式是否存在"""
        return bool(re.search(pattern, self.html, flags))
    
    def sub(self, pattern, repl, flags=re.MULTILINE):
        """替换"""
        new_html, n = re.subn(pattern, repl, self.html, flags=flags)
        if n > 0:
            self.html = new_html
            self.modified = True
        return n
    
    def delete_js_function(self, func_name):
        """删除JS函数"""
        # 匹配函数定义（多行）
        pattern = rf'function\s+{re.escape(func_name)}\s*\([^)]*\)\s*\{{[^}}]*\}}'
        n = self.sub(pattern, '', flags=re.DOTALL)
        if n > 0:
            # 也删除开头的函数声明
            self.sub(rf'const\s+{re.escape(func_name)}\s*=.*?;', '', flags=re.DOTALL)
        return n
    
    def delete_dom_by_id(self, element_id):
        """删除带特定id的DOM元素"""
        pattern = rf'<(\w+)[^>]*id="[^"]*{re.escape(element_id)}[^"]*"[^>]*>.*?</\1>'
        n = self.sub(pattern, '', flags=re.DOTALL)
        if n == 0:
            # 尝试更通用的匹配
            pattern = rf'<[^>]*id="[^"]*{re.escape(element_id)}[^"]*"[^>]*>.*?</[^>]+>'
            n = self.sub(pattern, '', flags=re.DOTALL)
        return n
    
    def delete_button_by_attr(self, attr_name, attr_value):
        """删除带特定属性的按钮"""
        pattern = rf'<button[^>]*{attr_name}="[^"]*{re.escape(attr_value)}[^"]*"[^>]*>.*?</button>'
        return self.sub(pattern, '', flags=re.DOTALL)
    
    def delete_comments(self, comment_text):
        """删除包含特定文本的注释"""
        pattern = rf'<!--\s*【[^】]*{re.escape(comment_text)}[^】]*】.*?-->'
        n = self.sub(pattern, '', flags=re.DOTALL)
        if n == 0:
            pattern = rf'//\s*\[[^\]]*{re.escape(comment_text)}[^\]]*\]'
            n = self.sub(pattern, '', flags=re.MULTILINE)
        return n
    
    def execute(self):
        """执行任务，返回(bool, str) - 是否修改了html, 说明"""
        raise NotImplementedError

# ============ 具体任务执行器 ============

class P11_AddRemoveEventListener(TaskExecutor):
    """P11: 为addEventListener添加removeEventListener清理"""
    
    def execute(self):
        changes = []
        
        # 1. 查找所有带id的DOM元素
        dom_with_id = re.findall(r'<(\w+)[^>]*id="([^"]+)"[^>]*>', self.html)
        id_map = {id_: tag for tag, id_ in dom_with_id}
        
        # 2. 查找所有addEventListener调用
        # 格式: element.addEventListener('event', handler)
        listener_calls = re.findall(
            r'(\w+)\.addEventListener\s*\(\s*[\'"](\w+)[\'"]\s*,\s*(\w+)\s*\)',
            self.html
        )
        
        # 3. 查找已有的removeEventListener
        existing_removes = set(re.findall(
            r'\.removeEventListener\s*\(\s*[\'"](\w+)[\'"]\s*,\s*(\w+)\s*\)',
            self.html
        ))
        
        # 4. 统计需要添加removeEventListener的情况
        # 这里我们只做统计分析，不做修改（因为涉及复杂的函数引用）
        unremoved = []
        for element_id, event, handler in listener_calls:
            if (event, handler) not in existing_removes:
                unremoved.append((element_id, event, handler))
        
        # 由于自动添加removeEventListener可能破坏功能，我们只做简单场景
        # 检查是否有简单的页面切换监听器没有清理
        changes.append(f"addEventListener {len(listener_calls)}处，removeEventListener {len(existing_removes)}处")
        changes.append(f"未清理监听器约 {len(unremoved)} 处（P11需要人工审查）")
        
        # P11是复杂任务，我们只报告情况
        return False, "; ".join(changes)

class P13_KeydownListenerLeak(TaskExecutor):
    """P13: 键盘快捷键事件监听器泄漏修复"""
    
    def execute(self):
        # 查找keydown/keyup监听器
        key_listeners = re.findall(
            r'\.addEventListener\s*\(\s*[\'"]key(down|up)[\'"]\s*,\s*(\w+)\s*\)',
            self.html
        )
        
        # 查找对应的removeEventListener
        key_removes = set(re.findall(
            r'\.removeEventListener\s*\(\s*[\'"]key(down|up)[\'"]\s*,\s*(\w+)\s*\)',
            self.html
        ))
        
        if len(key_listeners) == len(key_removes):
            return False, f"键盘监听器已全部配套清理"
        
        unremoved = [k for k in key_listeners if (k[0], k[1]) not in key_removes]
        return False, f"键盘监听器 {len(key_listeners)}处，已清理 {len(key_removes)}处，未清理 {len(unremoved)}处（P13需人工审查）"

class P18_DeleteStaffManagement(TaskExecutor):
    """P18: 删除员工管理分组全部"""
    
    def execute(self):
        changes = []
        
        # 查找员工管理相关元素
        # 1. 侧边栏菜单项
        staff_menu = re.findall(r'<div[^>]*class="[^"]*menu-item[^"]*"[^>]*onclick="[^"]*staff[^"]*"[^>]*>.*?</div>', self.html, re.DOTALL)
        if staff_menu:
            for menu in staff_menu:
                if '员工' in menu or 'staff' in menu.lower():
                    tag = re.match(r'<(\w+)', menu).group(1)
                    pattern = rf'<{tag}[^>]*onclick="[^"]*(?:staff|员工)[^"]*"[^>]*>.*?</{tag}>'
                    n = self.sub(pattern, '', re.DOTALL)
                    if n > 0:
                        changes.append(f"删除员工菜单项")
        
        # 2. 页面容器
        for page_id in ['page-staff', 'staff-page', 'staff-management']:
            n = self.delete_dom_by_id(page_id)
            if n > 0:
                changes.append(f"删除页面容器 #{page_id}")
        
        # 3. 注释标记删除
        n = self.delete_comments('员工管理')
        if n > 0:
            changes.append(f"删除员工管理注释 {n}处")
        
        # 4. 相关函数
        for func in ['renderStaffTable', 'openStaffModal', 'confirmDeleteStaff', 'openStaffDetailModal']:
            n = self.delete_js_function(func)
            if n > 0:
                changes.append(f"删除函数 {func}")
        
        if changes:
            return True, f"P18: {'; '.join(changes)}"
        return False, "P18: 未发现员工管理残留"

class P20_SidebarRestructure(TaskExecutor):
    """P20: 侧边栏重整为3分组"""
    
    def execute(self):
        # 查找侧边栏菜单结构
        sidebar = re.search(r'<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>(.*?)</div>\s*</div>', self.html, re.DOTALL)
        if not sidebar:
            return False, "P20: 未找到侧边栏结构"
        
        # 统计当前菜单项数量
        menu_items = re.findall(r'class="[^"]*menu-item[^"]*"', sidebar.group(1))
        return False, f"P20: 当前菜单项 {len(menu_items)} 个，需重整为3分组（复杂任务，待人工处理）"

class P31_MockDataToIoT_DeviceList(TaskExecutor):
    """P31: 设备列表Mock数据→物联设备池数据"""
    
    def execute(self):
        # 查找mock数据
        mock_patterns = [
            r'const\s+MOCK_\w+\s*=\s*\[',
            r'let\s+MOCK_\w+\s*=\s*\[',
            r'var\s+MOCK_\w+\s*=\s*\[',
            r'var\s+mockData\s*=\s*\[',
            r'let\s+deviceList\s*=\s*\[',
        ]
        
        found = []
        for p in mock_patterns:
            matches = re.finditer(p, self.html)
            for m in matches:
                found.append((m.start(), p))
        
        if found:
            return False, f"P31: 发现Mock数据 {len(found)}处，需物联化（复杂任务，待人工处理）"
        return False, "P31: 未发现Mock数据"

class P36_ExtractCardStyles(TaskExecutor):
    """P36: 提取通用卡片样式→CSS类"""
    
    def execute(self):
        # 查找重复的内联style模式
        # 统计常见style组合
        style_patterns = re.findall(
            r'style="([^"]*(?:background|padding|border-radius|margin)[^"]*)"',
            self.html
        )
        
        # 统计出现次数
        style_counts = {}
        for s in style_patterns:
            # 简化样式字符串
            simplified = re.sub(r'#[a-fA-F0-9]{3,6}', '#', s)
            simplified = re.sub(r'\d+px', 'Xpx', simplified)
            simplified = re.sub(r'\d+', 'N', simplified)
            style_counts[simplified] = style_counts.get(simplified, 0) + 1
        
        # 找出重复次数多的
        repeated = [(k, v) for k, v in style_counts.items() if v > 3]
        if repeated:
            repeated.sort(key=lambda x: -x[1])
            top = repeated[:5]
            info = ", ".join([f"{v}次" for _, v in top])
            return False, f"P36: 发现重复样式模式 {len(repeated)}种，最常见: {info}（可自动化提取）"
        return False, "P36: 未发现明显重复样式"

class P96_DeleteConsoleLogs(TaskExecutor):
    """P96: 删除所有console.log调试语句"""
    
    def execute(self):
        changes = []
        
        # 1. 删除console.log
        count1 = self.sub(r'console\.log\s*\([^)]*\)\s*;?\s*', '')
        if count1 > 0:
            changes.append(f"console.log {count1}处")
        
        # 2. 删除console.warn
        count2 = self.sub(r'console\.warn\s*\([^)]*\)\s*;?\s*', '')
        if count2 > 0:
            changes.append(f"console.warn {count2}处")
        
        # 3. 删除console.error
        count3 = self.sub(r'console\.error\s*\([^)]*\)\s*;?\s*', '')
        if count3 > 0:
            changes.append(f"console.error {count3}处")
        
        # 4. 删除debugger
        count4 = self.sub(r'debugger;?\s*', '')
        if count4 > 0:
            changes.append(f"debugger {count4}处")
        
        # 5. 删除调试注释
        count5 = self.sub(r'//\s*(DEBUG|TODO|FIXME|XXX):[^\n]*\n', '\n')
        if count5 > 0:
            changes.append(f"调试注释 {count5}处")
        
        if changes:
            return True, f"P96: {'; '.join(changes)}"
        return False, "P96: 无console.log等调试语句"

class SimpleDeleteTask(TaskExecutor):
    """通用删除任务"""
    
    def __init__(self, task_id, name, html, patterns):
        super().__init__(task_id, name, html)
        self.patterns = patterns  # list of (pattern, flags, description)
    
    def execute(self):
        changes = []
        for pattern, flags, desc in self.patterns:
            n = self.sub(pattern, '', flags)
            if n > 0:
                changes.append(f"{desc} {n}处")
        
        if changes:
            return True, f"{self.task_id}: {'; '.join(changes)}"
        return False, f"{self.task_id}: 无变化"

# ============ 任务映射 ============

def get_task_executor(task_id, name, html):
    """根据任务ID返回对应的执行器"""
    
    executors = {
        "P11": P11_AddRemoveEventListener,
        "P13": P13_KeydownListenerLeak,
        "P18": P18_DeleteStaffManagement,
        "P20": P20_SidebarRestructure,
        "P31": P31_MockDataToIoT_DeviceList,
        "P36": P36_ExtractCardStyles,
        "P96": P96_DeleteConsoleLogs,
    }
    
    if task_id in executors:
        return executors[task_id](task_id, name, html)
    
    # 默认返回简单删除任务
    return None

# ============ 主流程 ============

def load_phase2_status():
    """加载phase2状态"""
    try:
        with open(PHASE2_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ 加载phase2.json失败: {e}")
        return None

def save_phase2_status(status):
    """保存phase2状态"""
    status["lastRun"] = datetime.now().isoformat()
    try:
        with open(PHASE2_JSON, "w", encoding="utf-8") as f:
            json.dump(status, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"⚠️ 保存phase2.json失败: {e}")
        return False

def get_next_task(status, pool_v2=None):
    """获取下一个最高优先级可执行任务"""
    tasks = status.get("tasks", {})
    
    # 按优先级排序
    priority_order = {"P0": 0, "P1": 1, "P2": 2}
    
    pending = []
    for task_id, task in tasks.items():
        if task.get("status") == "pending":
            priority = task.get("priority", "P2")
            
            # 检查是否可自动执行（从pool_v2读取）
            auto_exec = True
            if pool_v2:
                v2_task = pool_v2.get("tasks", {}).get(task_id, {})
                if not v2_task.get("autoExecutable", True):
                    auto_exec = False
            
            pending.append((priority_order.get(priority, 3), task_id, task, auto_exec))
    
    # 按优先级排序，只取可执行的
    pending.sort(key=lambda x: x[0])
    
    # 找第一个可执行的
    for item in pending:
        if item[3]:  # auto_exec
            return item[1], item[2]
    
    return None, None

def main():
    print(f"🚀 物联后台精简 v2.0 - 第{CURRENT_ROUND}轮")
    print("=" * 50)
    
    # 1. 加载phase2状态和pool_v2
    status = load_phase2_status()
    if not status:
        print("❌ 无法加载phase2.json")
        return False
    
    pool_v2_path = os.path.join(os.path.dirname(PHASE2_JSON), "tasks-pool-v2.json")
    pool_v2 = None
    try:
        pool_v2 = json.loads(read_file(pool_v2_path))
    except:
        pass
    
    # 2. 获取下一个任务
    task_id, task = get_next_task(status, pool_v2)
    if not task_id:
        print("✅ 所有任务已完成！")
        return False
    
    print(f"📋 执行任务: {task_id} - {task['name']}")
    print(f"   优先级: {task.get('priority', 'P2')}")
    
    # 3. 读取HTML
    html = read_file(HTML_FILE)
    original_len = len(html)
    
    # 4. 执行任务
    executor = get_task_executor(task_id, task["name"], html)
    
    if executor:
        modified, info = executor.execute()
        html = executor.html
        print(f"   结果: {info}")
    else:
        # 默认执行简单的删除任务
        modified = False
        print(f"   ⚠️ 未知任务类型: {task_id}")
    
    if not modified:
        print("   ⏭️  无需修改（可能已处理或复杂任务）")
        
        # 如果是复杂任务但确实需要处理，可以标记为稍后处理
        # 这里我们只是报告，不改变状态
    
    # 5. 如果有修改，保存并提交
    if modified:
        new_len = len(html)
        delta = original_len - new_len
        
        # 保存HTML
        write_file(HTML_FILE, html)
        print(f"   📝 HTML精简: -{delta} bytes ({original_len:,} → {new_len:,})")
        
        # 更新phase2状态
        task["status"] = "completed"
        task["completedRound"] = CURRENT_ROUND
        task["completedAt"] = datetime.now().isoformat()
        save_phase2_status(status)
        
        # Git提交
        msg = f"🎯 第{CURRENT_ROUND}轮：{task['name']}（{task_id}）"
        if git_commit(msg):
            print(f"   ✅ Git提交成功")
        else:
            print(f"   ⚠️ Git提交失败（可能没有变更）")
    else:
        print("   ⏭️  跳过提交")
    
    print("=" * 50)
    print(f"📊 当前进度: {sum(1 for t in status['tasks'].values() if t.get('status')=='completed')}/{status['totalTasks']}")
    
    return True

if __name__ == "__main__":
    main()
