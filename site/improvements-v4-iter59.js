// ============================================================
// 【物联后台v4-第59轮】功能性断裂修复
// 修复清单（5个功能性断裂）：
// 改进1: filterKeypad - 密码管理Tab切换筛选函数缺失（card-tab调用但从未定义）
// 改进2: openKeypadProgrammingModal - 密码编程按钮点击无反应
// 改进3: filterNightAuditByDate - 夜审报表日期快速筛选
// 改进4: deleteNightAudit - 夜审记录删除函数缺失
// 改进5: submitNightAuditCreate - 夜审新增表单提交函数缺失（openNightAuditCreateModal存在但提交函数断裂）
// ============================================================

// -------- 改进1: filterKeypad - 密码管理Tab切换筛选 --------
window.filterKeypad = function(status, el) {
  // 更新Tab高亮
  document.querySelectorAll('#page-keypad .card-tabs .card-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = '';
    t.style.color = '';
    t.style.fontWeight = '';
    t.style.border = '1px solid var(--border)';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
    el.style.fontWeight = '600';
    el.style.border = 'none';
  }
  // 筛选表格行
  var tbody = document.getElementById('keypad-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var count = 0;
  rows.forEach(function(row) {
    var rowStatus = row.getAttribute ? row.getAttribute('data-status') : '';
    if (!status || status === 'all' || rowStatus === status) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });
  showToast('筛选：' + (status === 'all' ? '全部' : status) + '，共 ' + count + ' 条', 'info');
};

// -------- 改进2: openKeypadProgrammingModal - 密码编程弹窗 --------
window.openKeypadProgrammingModal = function() {
  var existing = document.getElementById('modal-keypad-program');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-keypad-program" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-keypad-program\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🔐</div><div style="font-size:15px;font-weight:700;">密码编程</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-left:8px;">设置密码有效期和使用次数</div>' +
    '<button onclick="document.getElementById(\'modal-keypad-program\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房间号</label>' +
    '<select class="form-select" id="kp-prog-room" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="301">301</option><option value="302">302</option><option value="303">303</option><option value="201">201</option><option value="202">202</option><option value="101">101</option></select></div>' +
    '<div class="form-group"><label class="form-label">密码用途</label>' +
    '<input type="text" class="form-input" id="kp-prog-purpose" placeholder="如：客人入住/保洁" style="padding:8px 12px;font-size:13px;"></div></div>' +
    '<div class="form-group"><label class="form-label">密码格式</label>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="radio" name="kp-prog-format" value="dynamic" checked style="accent-color:var(--blue);"> 动态密码（6位数字）</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="radio" name="kp-prog-format" value="fixed" style="accent-color:var(--blue);"> 固定密码（自定义）</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="radio" name="kp-prog-format" value="pattern" style="accent-color:var(--blue);"> 模式密码（*#格式）</label></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">生效时间</label>' +
    '<input type="datetime-local" class="form-input" id="kp-prog-start" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">失效时间</label>' +
    '<input type="datetime-local" class="form-input" id="kp-prog-end" style="padding:8px 12px;font-size:13px;width:100%;"></div></div>' +
    '<div class="form-group"><label class="form-label">使用次数限制</label>' +
    '<select class="form-select" id="kp-prog-uselimit" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="0">不限制</option><option value="1">仅限1次</option><option value="3">最多3次</option><option value="5">最多5次</option><option value="10">最多10次</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="kp-prog-note" placeholder="可选备注" style="min-height:60px;font-size:13px;padding:8px 12px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-keypad-program\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitKeypadProgramming()" style="padding:8px 20px;background:var(--purple);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">🔐 生成编程密码</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 设置默认时间
  var now = new Date();
  var tomorrow = new Date(now.getTime() + 86400000);
  var fmt = function(d) { return d.toISOString().slice(0,16); };
  var startEl = document.getElementById('kp-prog-start');
  var endEl = document.getElementById('kp-prog-end');
  if (startEl) startEl.value = fmt(now);
  if (endEl) endEl.value = fmt(tomorrow);
};

window.submitKeypadProgramming = function() {
  var room = document.getElementById('kp-prog-room');
  var purpose = document.getElementById('kp-prog-purpose');
  var start = document.getElementById('kp-prog-start');
  var end = document.getElementById('kp-prog-end');
  if (!room || !room.value) { showToast('请选择房间号', 'warning'); return; }
  var formats = document.getElementsByName('kp-prog-format');
  var formatVal = 'dynamic';
  for (var i = 0; i < formats.length; i++) { if (formats[i].checked) { formatVal = formats[i].value; break; } }
  var pwdMap = {dynamic: Math.floor(100000 + Math.random() * 900000).toString(), fixed:'******', pattern:'*#8#0*'};
  var typeMap = {dynamic:'动态密码', fixed:'固定密码', pattern:'模式密码'};
  var newPwd = pwdMap[formatVal] || pwdMap.dynamic;
  var newEntry = {
    id: 'KP-' + new Date().getTime().toString().slice(-8),
    room: room.value,
    type: typeMap[formatVal] || '动态密码',
    pwd: newPwd,
    validFrom: start ? start.value.replace('T', ' ') : '',
    validTo: end ? end.value.replace('T', ' ') : '',
    status: '待生效',
    creator: '管理员',
    note: (purpose ? purpose.value : ''),
    purpose: purpose ? purpose.value : '密码编程'
  };
  keypadStore.unshift(newEntry);
  renderKeypadTable();
  showToast('✅ 编程密码已生成：' + newPwd, 'success');
  var m = document.getElementById('modal-keypad-program');
  if (m) m.remove();
};

// -------- 改进3: filterNightAuditByDate - 夜审日期快速筛选 --------
window.filterNightAuditByDate = function(el, date) {
  document.querySelectorAll('#modal-night-audit .card-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = 'var(--bg)';
    t.style.border = '1px solid var(--border)';
    t.style.color = 'var(--text)';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
    el.style.border = 'none';
  }
  var tbody = document.getElementById('na-table-body');
  if (!tbody) return;
  var filtered = date ? _nightAuditData.filter(function(n) { return n.date === date; }) : _nightAuditData;
  var rows = filtered.map(function(n, i) {
    var realIdx = _nightAuditData.indexOf(n);
    return '<tr onclick="openNightAuditDetail(' + realIdx + ')" style="cursor:pointer;">' +
      '<td style="font-size:12px;font-weight:600;">' + n.date + '</td>' +
      '<td><span style="font-size:12px;font-weight:600;">' + n.auditor + '</span></td>' +
      '<td><span style="font-weight:600;color:var(--green);">¥' + n.income.toLocaleString() + '</span></td>' +
      '<td><span style="font-weight:600;color:var(--red);">¥' + n.expense.toLocaleString() + '</span></td>' +
      '<td><span style="font-weight:600;color:var(--blue);">¥' + n.net.toLocaleString() + '</span></td>' +
      '<td><span class="tbadge blue">' + n.rooms + '间</span></td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + n.notes + '</td>' +
      '<td><button class="action-btn small" onclick="event.stopPropagation();openNightAuditDetail(' + realIdx + ')">详情</button></td></tr>';
  }).join('');
  tbody.innerHTML = rows || '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted);">暂无夜审记录</td></tr>';
  showToast('已筛选：' + (date || '全部日期') + '，共 ' + filtered.length + ' 条', 'info');
};

// -------- 改进4: deleteNightAudit - 夜审记录删除 --------
window.deleteNightAudit = function(idx) {
  var n = _nightAuditData[idx];
  if (!n) return;
  if (!confirm('确定删除 ' + n.date + ' 的夜审记录？')) return;
  _nightAuditData.splice(idx, 1);
  document.getElementById('modal-na-detail') && document.getElementById('modal-na-detail').remove();
  showToast('🗑️ 夜审记录已删除', 'success');
  openNightAuditFullModal();
};

// -------- 改进5: submitNightAuditCreate - 夜审新增表单提交 --------
window.submitNightAuditCreate = function() {
  var date = document.getElementById('na-date');
  var auditor = document.getElementById('na-auditor');
  var income = document.getElementById('na-income');
  var expense = document.getElementById('na-expense');
  var rooms = document.getElementById('na-rooms');
  var checkins = document.getElementById('na-checkins');
  var checkouts = document.getElementById('na-checkouts');
  var notes = document.getElementById('na-notes');
  if (!date || !date.value || !auditor || !auditor.value) {
    showToast('请填写日期和审核人', 'error');
    return;
  }
  var incomeVal = parseInt(income && income.value ? income.value : 0);
  var expenseVal = parseInt(expense && expense.value ? expense.value : 0);
  _nightAuditData.unshift({
    date: date.value,
    auditor: auditor.value,
    income: incomeVal,
    expense: expenseVal,
    net: incomeVal - expenseVal,
    rooms: parseInt(rooms && rooms.value ? rooms.value : 0),
    checkins: parseInt(checkins && checkins.value ? checkins.value : 0),
    checkouts: parseInt(checkouts && checkouts.value ? checkouts.value : 0),
    notes: notes && notes.value.trim() ? notes.value.trim() : '正常'
  });
  document.getElementById('modal-na-create') && document.getElementById('modal-na-create').remove();
  showToast('✅ 夜审记录已保存', 'success');
  openNightAuditFullModal();
};

console.log('[iter59] 5个功能性断裂修复完成：filterKeypad / openKeypadProgrammingModal / filterNightAuditByDate / deleteNightAudit / submitNightAuditCreate');
