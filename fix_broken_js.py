#!/usr/bin/env python3
"""Fix broken JS syntax in complete-app2.html"""
import re
import subprocess

def fix_file():
    with open('site/complete-app2.html', 'r') as f:
        content = f.read()
    
    # String fixes
    content = content.replace('var stats = );', 'var stats = getSettlementStats();')
    content = content.replace("setTimeout(function() { ); }, 100);",
                           "setTimeout(function() { initInvoiceData && initInvoiceData(); }, 100);")
    content = content.replace("setTimeout(function() { if (typeof renderBlacklist === 'function') ); }, 100);",
                           "setTimeout(function() { if (typeof renderBlacklist === 'function') renderBlacklist(); }, 100);")
    
    with open('site/complete-app2.html', 'w') as f:
        f.write(content)
    
    # Now extract scripts and fix iteratively
    for iteration in range(20):
        scripts = extract_scripts(content)
        errors = find_errors(scripts)
        if not errors:
            print("All fixed!")
            return
        
        for idx in errors:
            script = scripts[idx]
            fixed = fix_script_iteratively(script)
            if fixed:
                scripts[idx] = fixed
        
        # Reassemble
        content = reassemble(content, scripts)
        
        with open('site/complete-app2.html', 'w') as f:
            f.write(content)
        
        print(f"Iteration {iteration+1}: errors = {errors}")
    
    print("Done with iterations")

def extract_scripts(content):
    """Extract scripts from HTML"""
    scripts = []
    pattern = re.compile(r'<script[^>]*>(.*?)</script>', re.DOTALL)
    for m in pattern.finditer(content):
        scripts.append(m.group(1))
    return scripts

def reassemble(content, scripts):
    """Replace scripts in HTML with fixed versions"""
    pattern = re.compile(r'(<script[^>]*>)(.*?)(</script>)')
    
    def replacer(m):
        if scripts:
            return m.group(1) + scripts.pop(0) + m.group(3)
        return m.group(0)
    
    return pattern.sub(replacer, content)

def find_errors(scripts):
    """Find which scripts have errors"""
    errors = []
    for i, script in enumerate(scripts):
        if len(script) > 1000:
            with open(f'/tmp/s{i}.js', 'w') as f:
                f.write(script)
            r = subprocess.run(['node', '--check', f'/tmp/s{i}.js'], 
                             capture_output=True, text=True)
            if r.returncode != 0:
                errors.append(i)
    return errors

def fix_script_iteratively(script):
    """Fix a single script by removing broken sections"""
    lines = script.split('\n')
    
    for iteration in range(30):
        with open('/tmp/check.js', 'w') as f:
            f.write('\n'.join(lines))
        r = subprocess.run(['node', '--check', '/tmp/check.js'], 
                         capture_output=True, text=True)
        if r.returncode == 0:
            return '\n'.join(lines)
        
        # Parse error
        match = re.search(r'line (\d+)', r.stderr)
        if not match:
            return None
        err_line = int(match.group(1)) - 1
        
        # Find broken section boundaries
        start = max(0, err_line - 10)
        end = min(len(lines), err_line + 10)
        
        # Look for comment header
        for i in range(err_line, max(0, err_line - 30), -1):
            if '// 【物联' in lines[i] or '// 改进' in lines[i] or '// ====' in lines[i]:
                start = i
                break
        
        # Look for next function
        for i in range(err_line, min(len(lines), err_line + 30)):
            if lines[i].strip().startswith('function ') or lines[i].strip().startswith('var '):
                if '//' not in lines[i][:10]:
                    end = i
                    break
        
        # Remove broken section
        lines = lines[:start] + lines[end:]
    
    return None

if __name__ == '__main__':
    fix_file()
