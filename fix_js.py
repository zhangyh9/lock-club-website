#!/usr/bin/env python3
import re
import subprocess

# Read file
with open('site/complete-app2.html', 'r') as f:
    content = f.read()

# Extract scripts properly
script_open = '<script'
script_close = '</script>'

positions = []
start = 0
while True:
    idx = content.find(script_open, start)
    if idx == -1: break
    positions.append(('open', idx))
    start = idx + len(script_open)

start = 0
while True:
    idx = content.find(script_close, start)
    if idx == -1: break
    positions.append(('close', idx))
    start = idx + len(script_close)

positions.sort(key=lambda x: x[1])

scripts = []
stack = []
for ptype, pos in positions:
    if ptype == 'open':
        stack.append(pos)
    else:
        if stack:
            open_pos = stack.pop()
            content_start = content.find('>', open_pos) + 1
            scripts.append(content[content_start:pos])

# Fix each problematic script
def fix_script(script):
    lines = script.split('\n')
    new_lines = []
    skip_until_next_func = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Skip empty lines at the start
        if not new_lines and not stripped:
            continue
            
        # Skip orphaned fragments after broken comments
        if stripped in ['', ');', '},', '};', '//', ',', "// '];"]:
            if new_lines and new_lines[-1].strip() in ['{', '(', '[', ',']:
                continue
            if new_lines and ('// 【物联' in new_lines[-1] or '// 改进' in new_lines[-1]):
                continue
        
        # Skip lines starting with orphan patterns
        if stripped.startswith('[a.type]') or stripped.startswith("'"):
            continue
        if '.type] ||' in stripped:
            continue
        if '$1msg' in stripped or 'msg, type)' in stripped and not 'function' in stripped:
            continue
        if '.replace(/' in stripped and not 'var ' in stripped:
            continue
            
        # Start skipping at broken improvement comments
        if '// 改进5：系统公告发布管理弹窗' in line:
            skip_until_next_func = True
            continue
        if '// 【物联后台 v4 改进4】发票打印预览闭环' in line:
            skip_until_next_func = True
            continue
        if '// 【物联后台 v4 改进-缺失函数2】' in line:
            skip_until_next_func = True
            continue
        if '【P29改进】renderSettlement子函数拆分' in line:
            skip_until_next_func = True
            continue
            
        # Stop skipping when we hit a proper function definition
        if skip_until_next_func and stripped.startswith('function '):
            skip_until_next_func = False
        
        if not skip_until_next_func:
            new_lines.append(line)
    
    return '\n'.join(new_lines)

# Fix scripts 0, 11, 12, 13
for idx in [0, 11, 12, 13]:
    if len(scripts[idx]) > 1000:
        fixed = fix_script(scripts[idx])
        scripts[idx] = fixed
        print(f"Script {idx}: {len(scripts[idx])} -> {len(fixed)} chars")

# Reassemble
new_content = content
offset = 0
script_idx = 0
for ptype, pos in positions:
    if ptype == 'open':
        stack.append((pos, script_idx))
        script_idx += 1
    else:
        if stack:
            open_pos, s_idx = stack.pop()
            content_start = content.find('>', open_pos) + 1
            # Calculate position with offset
            start = content_start + offset
            end = pos + offset
            new_content = new_content[:start] + scripts[s_idx] + new_content[end:]
            offset += len(scripts[s_idx]) - (pos - content_start)

# Write file
with open('site/complete-app2.html', 'w') as f:
    f.write(new_content)

print("File saved!")

# Verify
with open('site/complete-app2.html', 'r') as f:
    verify_content = f.read()

verify_scripts = []
start = 0
while True:
    idx = verify_content.find(script_open, start)
    if idx == -1: break
    start = idx + len(script_open)

start = 0
while True:
    idx = verify_content.find(script_close, start)
    if idx == -1: break
    start = idx + len(script_close)

start = 0
positions = []
while True:
    idx = verify_content.find(script_open, start)
    if idx == -1: break
    positions.append(('open', idx))
    start = idx + len(script_open)

start = 0
while True:
    idx = verify_content.find(script_close, start)
    if idx == -1: break
    positions.append(('close', idx))
    start = idx + len(script_close)

positions.sort(key=lambda x: x[1])

stack = []
for ptype, pos in positions:
    if ptype == 'open':
        stack.append(pos)
    else:
        if stack:
            open_pos = stack.pop()
            content_start = verify_content.find('>', open_pos) + 1
            verify_scripts.append(verify_content[content_start:pos])

errors = []
for i, s in enumerate(verify_scripts):
    if len(s) > 1000:
        with open(f'/tmp/v{i}.js', 'w') as f: f.write(s)
        r = subprocess.run(['node', '--check', f'/tmp/v{i}.js'], capture_output=True, text=True)
        if r.returncode != 0:
            errors.append(i)

if errors:
    print(f"Still have errors: {errors}")
else:
    print("All OK!")
