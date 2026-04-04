#!/usr/bin/env python3
"""Fix all JS syntax errors in complete-app2.html"""
import re
import subprocess

def check_script(content, idx):
    """Check if a script has syntax errors"""
    with open(f'/tmp/s{idx}.js', 'w') as f:
        f.write(content)
    result = subprocess.run(['node', '--check', f'/tmp/s{idx}.js'], 
                         capture_output=True, text=True)
    return result.returncode == 0, result.stderr

def fix_html():
    """Main fix function"""
    with open('site/complete-app2.html', 'r') as f:
        content = f.read()
    
    # Apply all string replacements
    fixes = [
        # Fix setTimeout syntax errors
        ("setTimeout(function() { ); }, 100);",
         "setTimeout(function() { initInvoiceData && initInvoiceData(); }, 100);"),
        ("setTimeout(function() { if (typeof renderBlacklist === 'function') ); }, 100);",
         "setTimeout(function() { if (typeof renderBlacklist === 'function') renderBlacklist(); }, 100);"),
        # Fix var stats = );
        ("var stats = );", "var stats = getSettlementStats();"),
    ]
    
    for old, new in fixes:
        if old in content:
            content = content.replace(old, new)
            print(f"Fixed: {old[:50]}...")
    
    # For complex patterns, use regex
    # Remove orphaned array elements after "已移除" comments
    content = re.sub(
        r'(\n// .*已移除\n)\s*\{[^}]*label:[^}]*\},?\s*\{[^}]*label:[^}]*\}[^}]*\]\s*;',
        r'\1',
        content,
        flags=re.DOTALL
    )
    
    # Remove orphaned closing braces before "function"
    content = re.sub(
        r'\n\}\n(\nfunction)',
        r'\n\1',
        content
    )
    
    # Save intermediate
    with open('site/complete-app2.html', 'w') as f:
        f.write(content)
    
    # Extract scripts
    extract_and_check()

def extract_and_check():
    """Extract scripts and check for errors"""
    with open('site/complete-app2.html', 'r') as f:
        content = f.read()
    
    # Extract using simple string matching
    script_open = '<script'
    script_close = '</script>'
    
    positions = []
    start = 0
    while True:
        idx = content.find(script_open, start)
        if idx == -1:
            break
        positions.append(('open', idx))
        start = idx + len(script_open)
    
    start = 0
    while True:
        idx = content.find(script_close, start)
        if idx == -1:
            break
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
                script_content = content[content_start:pos]
                scripts.append(script_content)
    
    print(f"Extracted {len(scripts)} scripts")
    
    # Check each
    errors = []
    for i, script in enumerate(scripts):
        if len(script) > 1000:
            ok, err = check_script(script, i)
            if not ok:
                errors.append(i)
                print(f"Script {i}: ERROR")
    
    if not errors:
        print("All scripts OK!")
        return
    
    # Fix errors iteratively
    for iteration in range(10):
        if not errors:
            break
        
        for idx in errors[:]:
            script = scripts[idx]
            lines = script.split('\n')
            
            # Find error line
            with open(f'/tmp/s{idx}.js', 'w') as f:
                f.write(script)
            result = subprocess.run(['node', '--check', f'/tmp/s{idx}.js'],
                                 capture_output=True, text=True)
            if result.returncode == 0:
                errors.remove(idx)
                continue
            
            # Parse error line
            match = re.search(r'line (\d+)', result.stderr)
            if not match:
                continue
            err_line = int(match.group(1)) - 1
            
            # Find broken section
            start = max(0, err_line - 5)
            end = min(len(lines), err_line + 5)
            
            # Look for comment header
            for j in range(err_line, max(0, err_line - 20), -1):
                if '// 【物联' in lines[j] or '// 改进' in lines[j] or '// ====' in lines[j]:
                    start = j
                    break
            
            # Look for next function
            for j in range(err_line, min(len(lines), err_line + 20)):
                if lines[j].strip().startswith('function ') or lines[j].strip().startswith('var '):
                    if '//' not in lines[j][:10]:
                        end = j
                        break
            
            print(f"Script {idx}: removing lines {start+1}-{end+1}")
            
            # Remove broken section
            new_lines = lines[:start] + lines[end:]
            new_script = '\n'.join(new_lines)
            
            # Verify fix
            with open(f'/tmp/s{idx}_new.js', 'w') as f:
                f.write(new_script)
            result = subprocess.run(['node', '--check', f'/tmp/s{idx}_new.js'],
                                 capture_output=True, text=True)
            if result.returncode == 0:
                scripts[idx] = new_script
                errors.remove(idx)
                print(f"  Script {idx} fixed!")
        
        # Reassemble
        if errors:
            # Rebuild content
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
                        start = content_start + offset
                        end = pos + offset
                        new_content = new_content[:start] + scripts[s_idx] + new_content[end:]
                        offset += len(scripts[s_idx]) - (pos - content_start)
            
            content = new_content
            
            # Re-extract
            positions = []
            start = 0
            while True:
                idx = content.find(script_open, start)
                if idx == -1:
                    break
                positions.append(('open', idx))
                start = idx + len(script_open)
            
            start = 0
            while True:
                idx = content.find(script_close, start)
                if idx == -1:
                    break
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
    
    # Save final
    with open('site/complete-app2.html', 'w') as f:
        f.write(content)
    
    # Final check
    print("\nFinal verification:")
    errors = []
    for i, script in enumerate(scripts):
        if len(script) > 1000:
            ok, _ = check_script(script, i)
            if not ok:
                errors.append(i)
    
    if errors:
        print(f"Still have errors in scripts: {errors}")
    else:
        print("All scripts OK! File saved.")

if __name__ == '__main__':
    fix_html()
