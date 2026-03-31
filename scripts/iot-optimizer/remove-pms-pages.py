#!/usr/bin/env python3
"""Remove PMS-related pages from complete-app2.html"""

import re

filepath = 'site/complete-app2.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
print(f"Original file: {original_len} chars, {content.count(chr(10))} lines")

# 1. Remove keypad page div (lines 11206-11548, ~343 lines)
# Pattern: from <div class="page" id="page-keypad"> to just before <div class="page" id="page-building">
content = re.sub(
    r'\n<!-- Page: Keypad Management[^\n]*\n.*?<div class="page" id="page-keypad">.*?(?=<div class="page" id="page-building">)',
    '\n<!-- Page: Keypad Management (P09 删除 - PMS密码管理非物联核心) -->\n<!-- 已移除 -->',
    content,
    flags=re.DOTALL
)
print(f"After keypad page removal: {len(content)} chars")

# 2. Remove staffschedule page div (lines 6502-7334, ~833 lines)
content = re.sub(
    r'\n<!-- \[改进v3-4\]员工排班日历完整页面[^\n]*\n.*?<div class="page" id="page-staffschedule">.*?(?=\n<div class="page" id="page-floor">)',
    '\n<!-- Page: Staff Schedule (P18 删除 - PMS员工排班非物联核心) -->\n<!-- 已移除 -->',
    content,
    flags=re.DOTALL
)
print(f"After staffschedule removal: {len(content)} chars")

# 3. Remove 'keypad' from search index (line 538 area)
content = re.sub(r",\s*'keypad'\s*:\s*'keypad'\s*'", '', content)
print(f"After search index cleanup: {len(content)} chars")

# 4. Remove staffschedule showPage block (line 551 area)
content = re.sub(
    r"if\s*\(\s*pageName\s*===\s*'staffschedule'\s*\)\s*\{\s*setTimeout\s*\([^)]*renderStaffSchedule[^)]*\)\s*\}\s*",
    '',
    content
)
print(f"After staffschedule showPage removal: {len(content)} chars")

# 5. Remove showPage('staffschedule') call (line 614 area)
content = re.sub(r"\s*showPage\s*\(\s*'staffschedule'\s*\)\s*;", '', content)
print(f"After showPage('staffschedule') removal: {len(content)} chars")

# 6. Remove keypad role permission check (lines 7673-7674 area)
content = re.sub(
    r'<input[^>]*id="rperm-keypad"[^>]*>.*?<label[^>]*for="rperm-keypad"[^>]*>.*?</label>',
    '<!-- keypad permission removed (P09) -->',
    content
)
print(f"After keypad permission removal: {len(content)} chars")

# 7. Remove renderStaffSchedule alias (line 23197 area)
content = re.sub(
    r"// 【修复1】renderStaffSchedule 别名[^\n]*\nfunction renderStaffSchedule\(\)[^\n]*\n",
    '',
    content
)
print(f"After renderStaffSchedule alias removal: {len(content)} chars")

# 8. Remove keypadStore and renderKeypadTable functions (lines 23197-23258 area)
content = re.sub(
    r"// 【修复2】renderKeypadTable 函数缺失[^\n]*\nvar keypadStore = \[.*?\];\s*function renderKeypadTable\(\)[^}]+\}\s*function copyKeypadPassword[^{]+\{[^}]+\}\s*function copyKeypadPasswordCell[^{]+\{[^}]+\}\s*function invalidateKeypad[^{]+\{[^}]+\}\s*function deleteKeypad[^{]+\{[^}]+\}\s*function applyKeypadSearch[^{]+\{[^}]+\}\s*function resetKeypadSearch[^{]+\{[^}]+\}\s*function filterKeypadByStatus[^{]+\{[^}]+\}\s*",
    '',
    content,
    flags=re.DOTALL
)
print(f"After keypadStore/renderKeypadTable removal: {len(content)} chars")

# 9. Remove 'keypad' from search index object - fix any remaining 'keypad' entries
content = re.sub(r",\s*'keypad'\s*:\s*'keypad'", '', content)
print(f"After final keypad cleanup: {len(content)} chars")

print(f"\nTotal removed: {original_len - len(content)} chars ({(original_len - len(content))/original_len*100:.1f}%)")
print(f"Final size: {len(content)} chars, {content.count(chr(10))} lines")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! File saved.")
