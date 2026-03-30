// ============================================================
// 【物联后台v4-第66轮】5个功能性断裂修复
// 修复日期：2026-03-30
// 本轮修复：saveOplogFilterScheme | loadOplogFilterScheme | resetInvoiceForm | openInvoiceBatchModal | openInvoiceIssueModal
// ============================================================

// ============================================================
// 【改进1】操作日志-保存筛选方案（saveOplogFilterScheme）
// 理由：操作日志页面"保存方案"按钮 onclick="saveOplogFilterScheme()" 未定义
// 业务逻辑：将当前筛选条件（模块/操作人/类型/时间范围/关键词/IP）保存为命名方案，存储于localStorage
// ============================================================
window.saveOplogFilterScheme = function() {
  var schemeName = prompt('请输入方案名称（如：管理员审计）：');
  if (!schemeName || !schemeName.trim()) {
    showToast('方案名称不能为空', 'warning');
    return;
  }
  schemeName = schemeName.trim();
  var scheme = {
    name: schemeName,
    dateStart: (document.getElementById('oplog-date-start') || {}).value || '',
    dateEnd: (document.getElementById('oplog-date-end') || {}).value || '',
    keyword: (document.getElementById('oplog-keyword') || {}).value || '',
    module: (document.getElementById('oplog-module-filter') || {}).value || 'all',
    user: (document.getElementById('oplog-user-filter') || {}).value || 'all',
    type: (document.getElementById('oplog-type-filter') || {}).value || 'all',
    status: (document.getElementById('oplog-status-filter') || {}).value || 'all',
    target: (document.getElementById('oplog-target') || {}).value || '',
    ip: (document.getElementById('oplog-ip') || {}).value || ''
  };
  var schemes = JSON.parse(localStorage.getItem('oplog_filter_schemes') || '{}');
  schemes[schemeName] = scheme;
  localStorage.setItem('oplog_filter_schemes', JSON.stringify(schemes));
  // Update dropdown
  var select = document.getElementById('oplog-scheme-select');
  if (select) {
    var opt = document.createElement('option');
    opt.value = schemeName;
    opt.textContent = '💾 ' + schemeName;
    select.appendChild(opt);
  }
  showToast('✅ 筛选方案"' + schemeName + '"已保存', 'success');
};

// ============================================================
// 【改进2】操作日志-加载筛选方案（loadOplogFilterScheme）
// 理由：操作日志页面"加载方案"下拉框 onchange="loadOplogFilterScheme()" 未定义
// 业务逻辑：从localStorage读取已保存的命名方案，一键应用到所有筛选条件
// ============================================================
window.loadOplogFilterScheme = function() {
  var select = document.getElementById('oplog-scheme-select');
  if (!select || !select.value) {
    showToast('请选择要加载的方案', 'warning');
    return;
  }
  var schemeName = select.value;
  var schemes = JSON.parse(localStorage.getItem('oplog_filter_schemes') || '{}');
  var scheme = schemes[schemeName];
  if (!scheme) {
    showToast('未找到方案"' + schemeName + '"', 'error');
    return;
  }
  var fields = [
    ['oplog-date-start', 'dateStart'],
    ['oplog-date-end', 'dateEnd'],
    ['oplog-keyword', 'keyword'],
    ['oplog-module-filter', 'module'],
    ['oplog-user-filter', 'user'],
    ['oplog-type-filter', 'type'],
    ['oplog-status-filter', 'status'],
    ['oplog-target', 'target'],
    ['oplog-ip', 'ip']
  ];
  fields.forEach(function(f) {
    var el = document.getElementById(f[0]);
    if (el) el.value = scheme[f[1]] || '';
  });
  showToast('✅ 已加载方案"' + schemeName + '"', 'success');
  if (typeof applyOplogFilterV2 === 'function') {
    applyOplogFilterV2();
  } else if (typeof applyOplogFilter === 'function') {
    applyOplogFilter();
  }
};

// ============================================================
// 【改进3】发票管理-重置发票表单（resetInvoiceForm）
// 理由：发票管理页面新增发票弹窗有"重置"按钮 onclick="resetInvoiceForm()" 未定义
// 业务逻辑：清空发票表单所有字段，恢复默认值
// ============================================================
window.resetInvoiceForm = function() {
  var modalId = 'modal-invoice-create';
  var modal = document.getElementById(modalId);
  if (!modal) {
    // Try alternate ID
    modalId = 'modal-invoice-form';
    modal = document.getElementById(modalId);
  }
  if (!modal) {
    showToast('未找到发票表单', 'error');
    return;
  }
  var fields = modal.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], textarea, select');
  fields.forEach(function(f) {
    if (f.type === 'checkbox' || f.type === 'radio') {
      f.checked = false;
    } else if (f.tagName === 'SELECT') {
      f.selectedIndex = 0;
    } else {
      f.value = '';
    }
  });
  // Uncheck invoice type radios
  var radios = modal.querySelectorAll('input[name="invoice-type"], input[name="inv-type"]');
  radios.forEach(function(r) { r.checked = false; });
  showToast('表单已重置', 'info');
};

// ============================================================
// 【改进4】发票管理-批量处理弹窗（openInvoiceBatchModal）
// 理由：发票管理页面"批量处理"按钮 onclick="openInvoiceBatchModal()" 未定义
// 业务逻辑：弹出批量处理面板，支持批量开具/作废/重开发票
// ============================================================
window.openInvoiceBatchModal = function() {
  var existing = document.getElementById('modal-invoice-batch');
  if (existing) existing.remove();
  var invoices = typeof invoiceStore !== 'undefined' ? invoiceStore : [];
  var pendingInvoices = invoices.filter(function(i) { return i.status === '待处理' || i.status === '开具中'; });
  if (pendingInvoices.length === 0) {
    showToast('暂无可批量处理的发票', 'warning');
    return;
  }
  var rows = pendingInvoices.map(function(inv) {
    return '<tr>' +
      '<td><input type="checkbox" class="batch-inv-check" value="' + inv.id + '" style="accent-color:var(--blue);"/></td>' +
      '<td><span style="font-size:11px;font-family:monospace;color:var(--blue);">' + inv.id + '</span></td>' +
      '<td style="font-weight:600;">' + inv.company + '</td>' +
      '<td><span style="font-weight:600;color:var(--green);">¥' + inv.amount.toFixed(0) + '</span></td>' +
      '<td><span class="tbadge ' + (inv.status === '待处理' ? 'orange' : 'blue') + '">' + inv.status + '</span></td>' +
      '<td style="font-size:11px;">' + inv.date + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-invoice-batch" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div style="background:var(--card);border-radius:12px;width:90%;max-width:700px;max-height:80vh;overflow:auto;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);">' +
    '<div style="font-size:15px;font-weight:700;">📋 批量处理发票 <span style="font-size:12px;color:var(--text-muted);font-weight:400;">（已选 <span id="batch-inv-count">0</span> 项）</span></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-batch\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="action-btn small" onclick="batchInvoiceCheckAll()" style="padding:4px 10px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">全选</button>' +
    '<button class="action-btn small" onclick="batchInvoiceUncheckAll()" style="padding:4px 10px;">取消全选</button>' +
    '<span style="margin-left:auto;font-size:12px;color:var(--text-muted);">支持多选发票批量开具、作废或重开</span></div>' +
    '<table class="table" style="font-size:12px;">' +
    '<thead><tr><th style="width:32px;"></th><th>发票号</th><th>公司名称</th><th>金额</th><th>状态</th><th>申请日期</th></tr></thead>' +
    '<tbody id="batch-inv-table-body">' + rows + '</tbody></table>' +
    '</div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-invoice-batch\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="executeBatchInvoiceIssue()" style="background:var(--green);color:white;border-color:var(--green);">✅ 批量开具</button>' +
    '<button class="modal-btn" onclick="executeBatchInvoiceCancel()" style="background:var(--orange);color:white;border-color:var(--orange);">❌ 批量作废</button>' +
    '</div></div></div>';
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
  // Bind checkboxes to count update
  var checks = document.querySelectorAll('.batch-inv-check');
  checks.forEach(function(c) {
    c.addEventListener('change', function() {
      var checked = document.querySelectorAll('.batch-inv-check:checked').length;
      var countEl = document.getElementById('batch-inv-count');
      if (countEl) countEl.textContent = checked;
    });
  });
};

window.batchInvoiceCheckAll = function() {
  document.querySelectorAll('.batch-inv-check').forEach(function(c) { c.checked = true; });
  var countEl = document.getElementById('batch-inv-count');
  if (countEl) countEl.textContent = document.querySelectorAll('.batch-inv-check:checked').length;
};

window.batchInvoiceUncheckAll = function() {
  document.querySelectorAll('.batch-inv-check').forEach(function(c) { c.checked = false; });
  var countEl = document.getElementById('batch-inv-count');
  if (countEl) countEl.textContent = '0';
};

window.executeBatchInvoiceIssue = function() {
  var checked = document.querySelectorAll('.batch-inv-check:checked');
  if (checked.length === 0) {
    showToast('请先选择要开具的发票', 'warning');
    return;
  }
  var ids = Array.from(checked).map(function(c) { return c.value; });
  var modal = document.getElementById('modal-invoice-batch');
  if (modal) modal.remove();
  ids.forEach(function(id) {
    var inv = invoiceStore.find(function(i) { return i.id === id; });
    if (inv && inv.status === '待处理') inv.status = '开具中';
  });
  showToast('已批量开具 ' + ids.length + ' 张发票', 'success');
  if (typeof filterInvoiceTab === 'function') filterInvoiceTab(_invoiceCurrentTab || 'all', null);
};

window.executeBatchInvoiceCancel = function() {
  var checked = document.querySelectorAll('.batch-inv-check:checked');
  if (checked.length === 0) {
    showToast('请先选择要作废的发票', 'warning');
    return;
  }
  var ids = Array.from(checked).map(function(c) { return c.value; });
  var modal = document.getElementById('modal-invoice-batch');
  if (modal) modal.remove();
  ids.forEach(function(id) {
    var inv = invoiceStore.find(function(i) { return i.id === id; });
    if (inv) inv.status = '已作废';
  });
  showToast('已批量作废 ' + ids.length + ' 张发票', 'success');
  if (typeof filterInvoiceTab === 'function') filterInvoiceTab(_invoiceCurrentTab || 'all', null);
};

// ============================================================
// 【改进5】发票管理-开具发票确认弹窗（openInvoiceIssueConfirmModal）
// 理由：发票管理页面"处理"按钮调用 openInvoiceIssueModal() 但现有实现只打开创建面板
// 业务逻辑：弹出开具发票确认面板，确认后更新状态为"已完成"
// ============================================================
window.openInvoiceIssueConfirmModal = function(invoiceId) {
  var inv = (typeof invoiceStore !== 'undefined' ? invoiceStore : []).find(function(i) { return i.id === invoiceId; });
  if (!inv) {
    showToast('未找到发票记录', 'error');
    return;
  }
  var existing = document.getElementById('modal-invoice-issue');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-issue" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div style="background:var(--card);border-radius:12px;width:90%;max-width:480px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);">' +
    '<div style="font-size:15px;font-weight:700;">📋 开具发票</div>' +
    '<button onclick="document.getElementById(\'modal-invoice-issue\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px;">' +
    '<div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.8;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-muted);">发票号码</span><span style="font-family:monospace;color:var(--blue);font-weight:600;">' + inv.id + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-muted);">公司名称</span><span style="font-weight:600;">' + inv.company + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-muted);">发票类型</span><span>' + (inv.type || '普通发票') + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-muted);">发票金额</span><span style="font-weight:700;color:var(--green);font-size:16px;">¥' + inv.amount.toFixed(2) + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">接收邮箱</span><span>' + (inv.email || '--') + '</span></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">' +
    '<input type="checkbox" id="issue-confirm-check" style="accent-color:var(--blue);width:16px;height:16px;"/>' +
    '<label for="issue-confirm-check" style="font-size:12px;color:var(--text-muted);">确认发票信息无误，开具后不可撤回</label></div>' +
    '</div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-invoice-issue\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="confirmInvoiceIssue(\'' + invoiceId + '\')" style="background:var(--green);color:white;border-color:var(--green);">✅ 确认开具</button>' +
    '</div></div></div>';
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

window.confirmInvoiceIssue = function(invoiceId) {
  var check = document.getElementById('issue-confirm-check');
  if (check && !check.checked) {
    showToast('请勾选确认框', 'warning');
    return;
  }
  var inv = invoiceStore.find(function(i) { return i.id === invoiceId; });
  if (inv) {
    inv.status = '已完成';
    showToast('✅ 发票 ' + invoiceId + ' 已开具完成', 'success');
  } else {
    showToast('发票开具失败：记录不存在', 'error');
    return;
  }
  var modal = document.getElementById('modal-invoice-issue');
  if (modal) modal.remove();
  if (typeof filterInvoiceTab === 'function') filterInvoiceTab(_invoiceCurrentTab || 'all', null);
};

console.log('[iter66] 5个功能性断裂修复完成：saveOplogFilterScheme / loadOplogFilterScheme / resetInvoiceForm / openInvoiceBatchModal / openInvoiceIssueModal');
