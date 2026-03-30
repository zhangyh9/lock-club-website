// ========== 【v4-iter35】全面检查修复第3批：缺失函数补全 ==========
// 修复内容：
// 1. filterDevUnlockLog - 设备详情页开锁记录筛选函数缺失
// 2. showRemoteOpLogDetail - 设备详情页远程操作日志详情函数缺失
// 3. updateUrgentWODisplay - 工单页SLA紧急度实时显示函数缺失
// 4. submitInvoiceEdit - 发票编辑提交函数缺失
// 5. exportDevUnlockLog - 设备开锁记录导出函数缺失

// ========== 修复1：filterDevUnlockLog - 设备详情页开锁记录筛选 ==========
// 理由：设备详情页有日期筛选和方式筛选下拉框，但filterDevUnlockLog函数不存在
// 业务影响：设备详情页的开锁记录无法按日期/方式筛选
window.filterDevUnlockLog = function() {
  var dateFrom = document.getElementById('dev-ulog-date-from');
  var dateTo = document.getElementById('dev-ulog-date-to');
  var methodFilter = document.getElementById('dev-ulog-method-filter');
  var tbody = document.getElementById('dev-unlock-log-body');
  if (!tbody) return;
  var fromVal = dateFrom ? dateFrom.value : '';
  var toVal = dateTo ? dateTo.value : '';
  var methodVal = methodFilter ? methodFilter.value : 'all';
  var rows = tbody.querySelectorAll('tr');
  var visibleCount = 0;
  rows.forEach(function(row) {
    var show = true;
    var tds = row.querySelectorAll('td');
    if (tds.length < 1) return;
    // Date filter
    if (fromVal || toVal) {
      var rowDate = tds[0].textContent.trim().substring(0, 10);
      if (fromVal && rowDate < fromVal) show = false;
      if (toVal && rowDate > toVal) show = false;
    }
    // Method filter
    if (methodVal !== 'all') {
      var methodAttr = row.getAttribute('data-method');
      if (methodAttr !== methodVal) show = false;
    }
    row.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });
  var countEl = document.getElementById('dev-ulog-count');
  if (countEl) countEl.textContent = '共 ' + visibleCount + ' 条记录（已筛选）';
};

// ========== 修复2：showRemoteOpLogDetail - 远程操作日志详情函数 ==========
// 理由：设备详情页远程操作日志表有详情按钮，但showRemoteOpLogDetail函数不存在
// 业务影响：点击远程操作日志详情按钮无响应
window.showRemoteOpLogDetail = function(idx) {
  var logs = [
    {type:'立即同步', operator:'系统', time:'2026-03-26 10:32:08', result:'成功', detail:'设备301房 · 领握LH-807智能锁 · 心跳同步完成'},
    {type:'远程开锁', operator:'赵飞', time:'2026-03-25 22:15:00', result:'成功', detail:'设备301房 · 领握LH-807智能锁 · 开锁响应23ms'},
    {type:'远程重启', operator:'系统', time:'2026-03-25 03:00:00', result:'成功', detail:'设备301房 · 领握LH-807智能锁 · 重启后自动重连'},
    {type:'固件升级', operator:'系统', time:'2026-03-20 02:00:00', result:'成功', detail:'设备301房 · 领握LH-807智能锁 · v2.3.0→v2.3.1'}
  ];
  var log = logs[idx];
  if (!log) return;
  var resultColor = log.result === '成功' ? 'var(--green)' : 'var(--red)';
  var existing = document.getElementById('modal-remote-op-detail');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-remote-op-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-remote-op-detail\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📋</div><div><div style="font-size:15px;font-weight:700;">操作详情</div><div style="font-size:11px;color:var(--text-muted);">' + log.type + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-remote-op-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作类型</div><div style="font-size:13px;font-weight:700;">' + log.type + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作结果</div><div style="font-size:13px;font-weight:700;color:' + resultColor + ';">' + log.result + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作人</div><div style="font-size:13px;font-weight:600;">' + log.operator + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作时间</div><div style="font-size:12px;font-weight:600;">' + log.time + '</div></div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">详细信息</div><div style="font-size:12px;line-height:1.6;">' + log.detail + '</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-remote-op-detail\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// ========== 修复3：updateUrgentWODisplay - SLA紧急度实时显示函数 ==========
// 理由：工单页有SLA紧急度监控面板但updateUrgentWODisplay函数不存在
// 业务影响：SLA紧急度监控面板无法动态更新
window.updateUrgentWODisplay = function() {
  var display = document.getElementById('urgent-wo-display');
  if (!display) return;
  if (typeof _woList === 'undefined' || !_woList) return;
  var urgent = _woList.filter(function(wo) {
    return wo.status !== 'done' && wo.priority === 'urgent';
  });
  var overdue = _woList.filter(function(wo) {
    if (wo.status === 'done') return false;
    if (!wo.sla || wo.sla === '--') return false;
    var now = Date.now();
    var createTime = new Date(wo.createTime || wo.create || Date.now()).getTime();
    var elapsed = (now - createTime) / 60000;
    return wo.slaMinutes && elapsed > wo.slaMinutes;
  });
  if (urgent.length === 0 && overdue.length === 0) {
    display.textContent = '✅ 当前无紧急/超时工单';
    display.style.color = 'var(--green)';
  } else {
    var parts = [];
    if (urgent.length > 0) parts.push(urgent.length + '个紧急');
    if (overdue.length > 0) parts.push(overdue.length + '个已超时');
    display.textContent = '⚠️ ' + parts.join(' + ');
    display.style.color = 'var(--red)';
  }
  // Also update SLA mini list
  if (typeof renderWorkorderSLAMiniList === 'function') {
    renderWorkorderSLAMiniList();
  }
};

// 启动SLA紧急度实时更新（每秒）
window.startUrgentWOWatchdog = function() {
  if (window._urgentWoTimer) clearInterval(window._urgentWoTimer);
  updateUrgentWODisplay();
  window._urgentWoTimer = setInterval(updateUrgentWODisplay, 1000);
};

// ========== 修复4：submitInvoiceEdit - 发票编辑提交函数 ==========
// 理由：openInvoiceEditModal打开编辑弹窗，提交按钮调用submitInvoiceEdit但函数不存在
// 业务影响：发票编辑后无法保存
window.submitInvoiceEdit = function() {
  var id = document.getElementById('ie-id');
  var company = document.getElementById('ie-company');
  var tax = document.getElementById('ie-tax');
  var amount = document.getElementById('ie-amount');
  var type = document.getElementById('ie-type');
  var status = document.getElementById('ie-status');
  var email = document.getElementById('ie-email');
  if (!company || !company.value.trim()) { showToast('请填写购方名称', 'error'); return; }
  if (!amount || !amount.value || parseFloat(amount.value) <= 0) { showToast('请填写有效发票金额', 'error'); return; }
  var inv = invoiceStore.find(function(i){ return i.id === id.value; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  inv.company = company.value.trim();
  inv.tax = tax ? tax.value.trim() : '';
  inv.amount = parseFloat(amount.value);
  inv.type = type ? type.value : inv.type;
  inv.status = status ? status.value : inv.status;
  inv.email = email ? email.value.trim() : '';
  document.getElementById('modal-invoice-edit') && document.getElementById('modal-invoice-edit').remove();
  showToast('🧾 发票 ' + inv.id + ' 已保存', 'success');
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
};

// ========== 修复5：exportDevUnlockLog - 设备开锁记录导出函数 ==========
// 理由：设备详情页开锁记录工具栏有导出CSV按钮，但exportDevUnlockLog函数不存在
// 业务影响：无法导出设备开锁记录
window.exportDevUnlockLog = function() {
  var tbody = document.getElementById('dev-unlock-log-body');
  if (!tbody) { showToast('未找到开锁记录', 'error'); return; }
  var rows = tbody.querySelectorAll('tr');
  var visibleRows = Array.from(rows).filter(function(r){ return r.style.display !== 'none'; });
  if (visibleRows.length === 0) { showToast('暂无开锁记录可导出', 'error'); return; }
  var csv = '开锁时间,开锁方式,开锁人,设备响应,剩余电量\n';
  visibleRows.forEach(function(row) {
    var tds = row.querySelectorAll('td');
    if (tds.length < 5) return;
    var cols = Array.from(tds).slice(0, 5).map(function(td){ return '"' + td.textContent.trim().replace(/"/g, '""') + '"'; });
    csv += cols.join(',') + '\n';
  });
  var blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '设备开锁记录_' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📤 已导出 ' + visibleRows.length + ' 条开锁记录', 'success');
};

// 初始化：启动SLA监控
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startUrgentWOWatchdog);
} else {
  setTimeout(startUrgentWOWatchdog, 500);
}

console.log('[v4-iter35] 全面检查修复第3批加载完成：5个缺失函数补全');
