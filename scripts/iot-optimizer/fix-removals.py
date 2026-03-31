#!/usr/bin/env python3
"""Fix incomplete removals and clean up PMS pages properly"""

filepath = '/Users/hugo/.openclaw/workspace/lock-club-website/site/complete-app2.html'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

original_count = len(lines)
print(f"Original: {original_count} lines")

# Remove staffschedule page (lines 6501-7433, inclusive, 0-indexed: 6500-7432)
# Line 6501: <div class="page" id="page-staffschedule">
# Line 7434: <div class="page" id="page-roomtypemgr">
# So we remove lines 6500 to 7432 (0-indexed), which is 933 lines
staffschedule_start = 6500  # 0-indexed (line 6501 in 1-indexed)
staffschedule_end = 7433    # 0-indexed (line 7434 in 1-indexed) - exclusive

# Remove keypad page comment (line 11204 area)
# The comment says "<!-- Page: Keypad Management (P09 删除..."
# Lines around 11203-11205 contain the closing of previous section and the comment
# Let me find exact lines
keypad_comment_line = None
for i, line in enumerate(lines):
    if 'Page: Keypad Management (P09 删除' in line:
        keypad_comment_line = i
        break

if keypad_comment_line:
    print(f"Found keypad comment at line {keypad_comment_line+1}")
    # Remove the comment line (11204)
    lines.pop(keypad_comment_line)
    # Now re-find since line numbers shifted
    for i, line in enumerate(lines):
        if 'page-building' in line and 'page' in line:
            print(f"Found page-building at line {i+1}")
            break

# Now remove staffschedule page
print(f"Removing staffschedule page: lines {staffschedule_start+1}-{staffschedule_end} (0-indexed: {staffschedule_start}-{staffschedule_end-1})")
removed_staff = lines[staffschedule_start:staffschedule_end]
lines = lines[:staffschedule_start] + lines[staffschedule_end:]
print(f"Removed {len(removed_staff)} lines of staffschedule content")

print(f"After staffschedule removal: {len(lines)} lines")

# Now find and remove keypad functions
# Search for keypadStore definition
keypad_func_start = None
keypad_func_end = None
for i, line in enumerate(lines):
    if 'var keypadStore = [' in line:
        keypad_func_start = i
    if keypad_func_start and 'function filterKeypadByStatus' in line:
        keypad_func_end = i
        break

if keypad_func_start and keypad_func_end:
    print(f"Removing keypadStore/functions: lines {keypad_func_start+1}-{keypad_func_end+1}")
    lines = lines[:keypad_func_start] + lines[keypad_func_end+1:]
    print(f"After keypad function removal: {len(lines)} lines")

# Remove 'keypad' from search index (around line 538 area)
for i, line in enumerate(lines):
    if "'keypad'" in line and 'history' in line:
        # Remove 'keypad': 'keypad' from the object
        lines[i] = line.replace(", 'keypad':'keypad'", "")
        lines[i] = lines[i].replace("'keypad':'keypad',", "")
        print(f"Cleaned search index at line {i+1}")
        break

# Remove showPage('staffschedule') call
new_lines = []
for i, line in enumerate(lines):
    if "showPage('staffschedule')" in line:
        print(f"Removing showPage('staffschedule') at line {i+1}")
        continue
    new_lines.append(line)
lines = new_lines

# Remove renderStaffSchedule alias
new_lines = []
for i, line in enumerate(lines):
    if 'renderStaffSchedule' in line and '别名' in line:
        print(f"Removing renderStaffSchedule alias at line {i+1}")
        continue
    if 'function renderStaffSchedule()' in line:
        print(f"Removing renderStaffSchedule function at line {i+1}")
        continue
    new_lines.append(line)
lines = new_lines

# Remove keypad permission checkbox
new_lines = []
for i, line in enumerate(lines):
    if 'rperm-keypad' in line:
        print(f"Removing keypad permission at line {i+1}")
        continue
    new_lines.append(line)
lines = new_lines

print(f"\nFinal: {len(lines)} lines (removed {original_count - len(lines)} lines, {(original_count - len(lines))/original_count*100:.1f}%)")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Saved!")
