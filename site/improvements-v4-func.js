// ============================================================
// 【物联后台 v4 第1轮】功能性修复 - 5大闭环改进
// 本轮聚焦：发票管理闭环 + 告警列表入口 + 配置Tab切换 + 黑名单/发票页面初始化
// ============================================================

// ============================================================
// 【改进1】发票管理 - filterInvoiceTab（Tab状态筛选）
// 理由：发票列表有Tab但filterInvoiceTab函数缺失，点击Tab无响应
// 改进：根据Tab状态过滤发票列表，更新计数，同步列表显示
// ============================================================
var _invoiceCurrentTab = 'all';
var _invoiceCurrentSearch = '';
var _invoiceCurrentStatusFilter = 'all';
var _invoiceCurrentTypeFilter = 'all';

function filterInvoiceTab(tab, el) {
  _invoiceCurrentTab = tab;
  // 更新Tab激活状态
  document.querySelectorAll('.card-tabs .card-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = '';
    t.style.color = '';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
  }
  renderInvoiceFilteredList();
}

function renderInvoiceFilteredList() {
  var tbody = document.getElementById('invoice-table-body');
  if (!tbody) return;
  var kw = _invoiceCurrentSearch.toLowerCase();
  var rows = invoiceStore.filter(function(inv) {
    var matchTab = _invoiceCurrentTab === 'all' ? true
      : _invoiceCurrentTab === 'pending' ? inv.status === '待处理'
      : _invoiceCurrentTab === 'processing' ? inv.status === '开具中'
      : _invoiceCurrentTab === 'done' ? inv.status === '已完成'
      : _invoiceCurrentTab === 'cancelled' ? inv.status === '已作废' : true;
    var matchSearch = !kw || inv.id.toLowerCase().indexOf(kw) >= 0
      || inv.company.toLowerCase().indexOf(kw) >= 0
      || (inv.email && inv.email.toLowerCase().indexOf(kw) >= 0);
    var matchStatus = _invoiceCurrentStatusFilter === 'all' || inv.status === _invoiceCurrentStatusFilter;
    var matchType = _invoiceCurrentTypeFilter === 'all' || inv.type === _invoiceCurrentTypeFilter;
    return matchTab && matchSearch && matchStatus && matchType;
  });
  var html = rows.length === 0
    ? '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted);">暂无发票记录</td></tr>'
    : rows.map(function(inv) {
      var statusBadge = inv.status === '已完成' ? '<span class="tbadge green">✅ 已完成</span>'
        : inv.status === '待处理' ? '<span class="tbadge orange">⏳ 待处理</span>'
        : inv.status === '开具中' ? '<span class="tbadge blue">🔄 开具中</span>'
        : '<span class="tbadge gray">❌ 已作废</span>';
      var typeBadge = inv.type === '普通发票' ? '<span class="tbadge blue">📄 普通发票</span>'
        : inv.type === '增值税专用' ? '<span class="tbadge purple">🧾 增值税专用</span>'
        : '<span class="tbadge green">📱 电子发票</span>';
      var actionBtns = inv.status === '已完成'
        ? '<button class="action-btn small" onclick="openInvoiceDetailModal(\'' + inv.id + '\')">详情</button><button class="action-btn small" onclick="reissueInvoice(\'' + inv.id + '\')">重开</button>'
        : inv.status === '待处理' || inv.status === '开具中'
        ? '<button class="action-btn small" onclick="processInvoice(\'' + inv.id + '\')">处理</button><button class="action-btn small" onclick="openInvoiceDetailModal(\'' + inv.id + '\')">详情</button><button class="action-btn small red" onclick="cancelInvoice(\'' + inv.id + '\')">作废</button>'
        : '<button class="action-btn small" onclick="openInvoiceDetailModal(\'' + inv.id + '\')">详情</button>';
      return '<tr>' +
        '<td><span style="font-size:11px;font-family:monospace;color:var(--blue);">' + inv.id + '</span></td>' +
        '<td><span style="font-weight:600;">' + inv.company + '</span></td>' +
        '<td>' + (inv.email || '--') + '</td>' +
        '<td>--</td>' +
        '<td>' + typeBadge + '</td>' +
        '<td><span style="font-weight:600;color:var(--green);">¥' + inv.amount.toFixed(0) + '</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td style="font-size:11px;">' + inv.date + '</td>' +
        '<td>' + actionBtns + '</td></tr>';
    }).join('');
  tbody.innerHTML = html;
  // 更新Tab计数
  var allCount = invoiceStore.length;
  var pendingCount = invoiceStore.filter(function(i){ return i.status === '待处理'; }).length;
  var processingCount = invoiceStore.filter(function(i){ return i.status === '开具中'; }).length;
  var doneCount = invoiceStore.filter(function(i){ return i.status === '已完成'; }).length;
  var cancelledCount = invoiceStore.filter(function(i){ return i.status === '已作废'; }).length;
  var countEl = document.getElementById('inv-filter-count');
  if (countEl) countEl.textContent = '共 ' + rows.length + ' 条发票';
  var el = document.getElementById('inv-tab-all');
  if (el) el.innerHTML = '全部 <span>' + allCount + '</span>';
  el = document.getElementById('inv-tab-pending');
  if (el) el.innerHTML = '待处理 <span>' + pendingCount + '</span>';
  el = document.getElementById('inv-tab-processing');
  if (el) el.innerHTML = '开具中 <span>' + processingCount + '</span>';
  el = document.getElementById('inv-tab-done');
  if (el) el.innerHTML = '已完成 <span>' + doneCount + '</span>';
  el = document.getElementById('inv-tab-cancelled');
  if (el) el.innerHTML = '已作废 <span>' + cancelledCount + '</span>';
  // 更新统计卡片
  var totalEl = document.getElementById('inv-stat-total');
  if (totalEl) totalEl.textContent = allCount;
  var pendingEl = document.getElementById('inv-stat-pending');
  if (pendingEl) pendingEl.textContent = pendingCount;
  var doneEl = document.getElementById('inv-stat-done');
  if (doneEl) doneEl.textContent = doneCount;
  var voidEl = document.getElementById('inv-stat-void');
  if (voidEl) voidEl.textContent = cancelledCount;
  var amountEl = document.getElementById('inv-stat-amount');
  if (amountEl) {
    var totalAmt = invoiceStore.filter(function(i){ return i.status === '已完成'; }).reduce(function(s,i){ return s + i.amount; }, 0);
    amountEl.textContent = '¥' + totalAmt.toFixed(0);
  }
}

// ============================================================
// 【改进2】发票管理 - applyInvoiceSearch（关键词+状态+类型综合搜索）
// 理由：applyInvoiceSearch有调用但函数体缺失
// 改进：实现多条件组合筛选，更新列表和统计
// ============================================================
function applyInvoiceSearch() {
  var searchInput = document.getElementById('inv-search-input');
  _invoiceCurrentSearch = searchInput ? searchInput.value.trim() : '';
  var statusFilter = document.getElementById('inv-status-filter');
  _invoiceCurrentStatusFilter = statusFilter ? statusFilter.value : 'all';
  var typeFilter = document.getElementById('inv-type-filter');
  _invoiceCurrentTypeFilter = typeFilter ? typeFilter.value : 'all';
  // 状态筛选映射
  var statusMap = {pending:'待处理', processing:'开具中', done:'已完成', cancelled:'已作废'};
  if (_invoiceCurrentStatusFilter !== 'all') {
    _invoiceCurrentStatusFilter = statusMap[_invoiceCurrentStatusFilter] || _invoiceCurrentStatusFilter;
  }
  renderInvoiceFilteredList();
  var count = document.querySelectorAll('#invoice-table-body tr:not([style*="display: none"])').length;
  showToast('🔍 搜索完成，找到 ' + count + ' 条发票', 'info');
}

// ============================================================
// 【改进3】发票管理 - openInvoiceIssueModal / openInvoiceCreateModal / openInvoiceBatchModal
// 理由：开具发票按钮有onclick但函数缺失，点击报错
// 改进：实现完整发票开具弹窗（支持草稿保存+快速填充）
// ============================================================
function openInvoiceIssueModal() { openInvoiceCreateModal(); }

function openInvoiceCreateModal() {
  var existing = document.getElementById('modal-invoice-create');
  if (existing) { existing.classList.remove('hidden'); return; }
  var html = '<div class="modal-overlay" id="modal-invoice-create">' +
    '<div class="modal" style="width:600px;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">🧾 开具发票</div>' +
    '<button class="modal-close" onclick="closeModal(\'invoice-create\')">✕</button></div>' +
    '<div class="modal-body" style="max-height:520px;overflow-y:auto;">' +
    // 快速检索区
    '<div style="padding:10px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:14px;">' +
    '<div style="font-size:12px;font-weight:600;color:var(--blue);margin-bottom:8px;">🔍 快速检索入住客人（自动填充）</div>' +
    '<select class="form-select" id="inv-quick-guest" onchange="fillInvFromGuest(this.value)" style="width:100%;padding:6px 10px;font-size:12px;">' +
    '<option value="">-- 选择入住客人 --</option>' +
    '<option value="张三|138****8888|301">张三 · 138****8888 · 301（入住中）</option>' +
    '<option value="李四|139****6666|203">李四 · 139****6666 · 203（入住中）</option>' +
    '<option value="王五|137****5555|304">王五 · 137****5555 · 304（入住中）</option></select></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">发票类型 <span class="required">*</span></label>' +
    '<select class="form-select" id="inv-f-type" style="width:100%;">' +
    '<option value="普通发票">📄 普通发票</option>' +
    '<option value="增值税专用">🧾 增值税专用发票</option>' +
    '<option value="电子发票">📱 电子发票</option></select></div>' +
    '<div class="form-group"><label class="form-label">关联房间</label>' +
    '<select class="form-select" id="inv-f-room" style="width:100%;">' +
    '<option value="">-- 选择房间 --</option>' +
    '<option value="301">301</option><option value="203">203</option><option value="304">304</option></select></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">购方名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="inv-f-company" placeholder="请输入购方名称/姓名"></div>' +
    '<div class="form-group"><label class="form-label">电子邮箱</label>' +
    '<input type="email" class="form-input" id="inv-f-email" placeholder="用于接收电子发票"></input></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">纳税人识别号</label>' +
    '<input type="text" class="form-input" id="inv-f-tax" placeholder="请输入纳税人识别号（増值税专用必填）"></div>' +
    '<div class="form-group"><label class="form-label">发票金额(元) <span class="required">*</span></label>' +
    '<input type="number" class="form-input" id="inv-f-amount" placeholder="请输入金额" value="0"></div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-top:8px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">💡 开票说明</div>' +
    '<div style="font-size:11px;color:var(--text-muted);line-height:1.6;">' +
    '• 普通发票：1个工作日内开具完成<br>' +
    '• 增值税专用发票：3-5个工作日，需提供完整资质<br>' +
    '• 电子发票：开具后自动发送到邮箱</div></div></div>' +
    '<div class="modal-footer" style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="action-btn" onclick="saveInvoiceDraft()" style="background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">📝 保存草稿</button>' +
    '<button class="action-btn secondary" onclick="closeModal(\'invoice-create\')">取消</button>' +
    '<button class="action-btn primary" onclick="submitInvoiceCreate()" style="background:var(--blue);color:white;border:none;">🧾 提交开具</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function fillInvFromGuest(val) {
  if (!val) return;
  var parts = val.split('|');
  if (parts.length >= 3) {
    var companyInput = document.getElementById('inv-f-company');
    if (companyInput) companyInput.value = parts[0];
    var roomSelect = document.getElementById('inv-f-room');
    if (roomSelect) roomSelect.value = parts[2];
  }
}

function saveInvoiceDraft() {
  var draft = {
    company: document.getElementById('inv-f-company') ? document.getElementById('inv-f-company').value : '',
    email: document.getElementById('inv-f-email') ? document.getElementById('inv-f-email').value : '',
    tax: document.getElementById('inv-f-tax') ? document.getElementById('inv-f-tax').value : '',
    type: document.getElementById('inv-f-type') ? document.getElementById('inv-f-type').value : '普通发票',
    amount: document.getElementById('inv-f-amount') ? parseFloat(document.getElementById('inv-f-amount').value) : 0,
    room: document.getElementById('inv-f-room') ? document.getElementById('inv-f-room').value : '',
    time: new Date().toLocaleString('zh-CN')
  };
  try { localStorage.setItem('inv_draft', JSON.stringify(draft)); } catch(e) {}
  showToast('📝 草稿已保存，下次打开自动恢复', 'success');
}

function loadInvoiceDraft() {
  try {
    var draft = JSON.parse(localStorage.getItem('inv_draft') || '{}');
    if (!draft.company) { showToast('无草稿可恢复', 'info'); return; }
    var fields = ['company','email','tax','type','amount','room'];
    fields.forEach(function(f) {
      var el = document.getElementById('inv-f-' + f);
      if (el && draft[f]) {
        if (f === 'amount') el.value = draft[f];
        else el.value = draft[f];
      }
    });
    var tip = document.getElementById('inv-create-draft-tip');
    if (tip) { tip.style.display = 'none'; }
    showToast('📝 草稿已恢复：' + draft.company, 'success');
  } catch(e) { showToast('草稿恢复失败', 'error'); }
}

function submitInvoiceCreate() {
  var company = document.getElementById('inv-f-company') ? document.getElementById('inv-f-company').value.trim() : '';
  var amount = parseFloat(document.getElementById('inv-f-amount') ? document.getElementById('inv-f-amount').value : 0);
  if (!company) { showToast('请填写购方名称', 'error'); return; }
  if (!amount || amount <= 0) { showToast('请填写正确的发票金额', 'error'); return; }
  var inv = {
    id: 'INV-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(invoiceStore.length + 1).padStart(2,'0'),
    company: company,
    tax: document.getElementById('inv-f-tax') ? document.getElementById('inv-f-tax').value.trim() : '--',
    type: document.getElementById('inv-f-type') ? document.getElementById('inv-f-type').value : '普通发票',
    amount: amount,
    date: new Date().toISOString().slice(0,10),
    status: '待处理',
    email: document.getElementById('inv-f-email') ? document.getElementById('inv-f-email').value.trim() : ''
  };
  invoiceStore.unshift(inv);
  try { localStorage.removeItem('inv_draft'); } catch(e) {}
  closeModal('invoice-create');
  renderInvoiceFilteredList();
  showToast('✅ 发票已提交：' + inv.id + '（¥' + amount + '）', 'success');
}

function openInvoiceBatchModal() {
  var existing = document.getElementById('modal-invoice-batch');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-invoice-batch" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-batch\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🧾</div><div style="font-size:15px;font-weight:700;">批量开具发票</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-batch\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--orange);">⚠️ 批量开具前请确保已收集所有购方的完整开票信息</div>' +
    '<div class="form-group"><label class="form-label">批量开票数量</label>' +
    '<select class="form-select" id="batch-count" style="width:100%;">' +
    '<option value="5">5 张</option><option value="10">10 张</option><option value="20">20 张</option><option value="50">50 张</option></select></div>' +
    '<div class="form-group"><label class="form-label">统一发票类型</label>' +
    '<select class="form-select" id="batch-type" style="width:100%;">' +
    '<option value="普通发票">📄 普通发票</option><option value="电子发票">📱 电子发票</option></select></div>' +
    '<div class="form-group"><label class="form-label">统一金额（元）</label>' +
    '<input type="number" class="form-input" id="batch-amount" placeholder="留空则从列表读取" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="batch-note" placeholder="可选，填写批量开票说明..." style="min-height:60px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-invoice-batch\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="submitBatchInvoice()" style="background:var(--blue);color:white;border:none;">🧾 确认批量开具</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitBatchInvoice() {
  var count = parseInt(document.getElementById('batch-count') ? document.getElementById('batch-count').value : 5);
  var type = document.getElementById('batch-type') ? document.getElementById('batch-type').value : '普通发票';
  var baseAmt = parseFloat(document.getElementById('batch-amount') ? document.getElementById('batch-amount').value : 0);
  var today = new Date().toISOString().slice(0,10).replace(/-/g,'');
  for (var i = 0; i < count; i++) {
    var amt = baseAmt > 0 ? baseAmt : Math.floor(100 + Math.random() * 900);
    invoiceStore.unshift({
      id: 'INV-' + today + String(invoiceStore.length + 1).padStart(2,'0'),
      company: '批量客户-' + (i + 1),
      tax: '--',
      type: type,
      amount: amt,
      date: new Date().toISOString().slice(0,10),
      status: '待处理',
      email: ''
    });
  }
  document.getElementById('modal-invoice-batch') && document.getElementById('modal-invoice-batch').remove();
  renderInvoiceFilteredList();
  showToast('✅ 成功开具 ' + count + ' 张发票（类型：' + type + '）', 'success');
}

// ============================================================
// 【改进4】发票管理 - exportInvoiceCSV / cancelInvoice
// 理由：导出按钮和作废按钮有onclick但函数缺失
// 改进：实现CSV导出和发票作废功能
// ============================================================
function exportInvoiceCSV() {
  var headers = ['发票号','购方名称','纳税人识别号','发票类型','金额','状态','申请时间','邮箱'];
  var rows = invoiceStore.map(function(inv) {
    return [inv.id, inv.company, inv.tax || '', inv.type, inv.amount.toFixed(2), inv.status, inv.date, inv.email || ''];
  });
  var csvContent = '\uFEFF' + headers.join(',') + '\n' +
    rows.map(function(r) { return r.join(','); }).join('\n');
  var blob = new Blob([csvContent], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '发票列表_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click();
  showToast('📤 已导出 ' + invoiceStore.length + ' 条发票记录', 'success');
}

function cancelInvoice(invId) {
  var inv = invoiceStore.find(function(i){ return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  if (inv.status === '已作废') { showToast('该发票已作废', 'warning'); return; }
  inv.status = '已作废';
  renderInvoiceFilteredList();
  showToast('❌ 发票已作废：' + invId, 'success');
}

// ============================================================
// 【改进5】告警列表 - 注入详情按钮入口（injectAlertDetailButton）
// 理由：告警列表每行只有"处理"按钮，缺少查看详情入口
// 改进：在处理按钮旁注入"详情"按钮，点击打开openAlertDetailFullModal
// ============================================================
function injectAlertDetailButton() {
  var alertPage = document.getElementById('page-alert');
  if (!alertPage) return;
  var tbody = document.getElementById('alert-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row, idx) {
    var lastCell = row.querySelector('td:last-child');
    if (!lastCell) return;
    if (lastCell.textContent.indexOf('详情') >= 0) return;
    var detailBtn = document.createElement('button');
    detailBtn.className = 'action-btn small';
    detailBtn.style.cssText = 'padding:3px 8px;font-size:11px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);margin-right:4px;';
    detailBtn.textContent = '详情';
    detailBtn.onclick = function(e) {
      e.stopPropagation();
      var rowIdx = Array.from(tbody.querySelectorAll('tr')).indexOf(row);
      openAlertDetailFullModal(rowIdx);
    };
    var firstBtn = lastCell.querySelector('button, a');
    if (firstBtn) {
      lastCell.insertBefore(detailBtn, firstBtn);
    } else {
      lastCell.insertBefore(detailBtn, lastCell.firstChild);
    }
  });
}

// Hook到showPage，在切换到告警页时自动注入
function _hookShowPageForAlert() {
  if (typeof showPage === 'function') {
    var originalShowPage = showPage;
    showPage = function(pageName) {
      originalShowPage(pageName);
      if (pageName === 'alert') {
        setTimeout(injectAlertDetailButton, 200);
      }
      // 初始化黑名单页面
      if (pageName === 'blacklist') {
        setTimeout(function() {
          if (document.getElementById('bl-table-body')) renderBlacklist && renderBlacklist();
        }, 200);
      }
      // 初始化发票页面
      if (pageName === 'invoice') {
        setTimeout(function() {
          renderInvoiceFilteredList();
          try {
            var draft = JSON.parse(localStorage.getItem('inv_draft') || '{}');
            if (draft.company) {
              var tip = document.getElementById('inv-create-draft-tip');
              var timeEl = document.getElementById('inv-draft-time');
              if (tip) tip.style.display = '';
              if (timeEl) timeEl.textContent = draft.time || '';
            }
          } catch(e) {}
        }, 200);
      }
    };
  }
}

// ============================================================
// 【改进6】配置页面 - switchConfigTab（Tab切换）
// 理由：配置页面有9个Tab但switchConfigTab函数缺失，点击Tab报错
// 改进：实现Tab切换逻辑，隐藏/显示对应内容区
// ============================================================
function switchConfigTab(tabName, el) {
  document.querySelectorAll('.config-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = 'var(--bg)';
    t.style.color = 'var(--text)';
    t.style.borderColor = 'var(--border)';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
    el.style.borderColor = 'var(--blue)';
  }
  var contentIds = ['cfg-content-basic','cfg-content-notify','cfg-content-device',
    'cfg-content-security','cfg-content-oplog','cfg-content-building',
    'cfg-content-greeting','cfg-content-roles','cfg-content-backup'];
  contentIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var targetId = 'cfg-content-' + tabName;
  var target = document.getElementById(targetId);
  if (target) target.style.display = '';
  if (tabName === 'oplog') {
    setTimeout(function() {
      var oplogTbody = document.getElementById('oplog-table-body');
      if (oplogTbody && oplogTbody.children.length === 0) renderOplogTable && renderOplogTable();
    }, 100);
  }
}

function saveConfigTab(tabName) {
  showToast('✅ ' + tabName + ' 配置已保存', 'success');
  applyConfigToSystem();
}

function resetConfigTab(tabName) {
  showToast('🔄 ' + tabName + ' 配置已重置为默认值', 'info');
}

function applyConfigToSystem() {
  var hotelName = document.getElementById('cfg-hotel-name');
  var hotelPhone = document.getElementById('cfg-hotel-phone');
  var checkinTime = document.getElementById('cfg-checkin-time');
  var checkoutTime = document.getElementById('cfg-checkout-time');
  var deposit = document.getElementById('cfg-deposit');
  var summary = [];
  if (hotelName && hotelName.value) summary.push('酒店名称:' + hotelName.value);
  if (hotelPhone && hotelPhone.value) summary.push('电话:' + hotelPhone.value);
  if (checkinTime && checkinTime.value) summary.push('入住时间:' + checkinTime.value);
  if (checkoutTime && checkoutTime.value) summary.push('退房时间:' + checkoutTime.value);
  if (deposit && deposit.value) summary.push('押金:' + deposit.value + '元');
  showToast('✅ 系统配置已更新' + (summary.length > 0 ? '：' + summary.slice(0,3).join('、') : ''), 'success');
}

function exportSystemConfig() {
  var config = {
    hotel: {
      name: document.getElementById('cfg-hotel-name') ? document.getElementById('cfg-hotel-name').value : '',
      address: document.getElementById('cfg-hotel-addr') ? document.getElementById('cfg-hotel-addr').value : '',
      phone: document.getElementById('cfg-hotel-phone') ? document.getElementById('cfg-hotel-phone').value : '',
      email: document.getElementById('cfg-hotel-email') ? document.getElementById('cfg-hotel-email').value : ''
    },
    operation: {
      checkinTime: document.getElementById('cfg-checkin-time') ? document.getElementById('cfg-checkin-time').value : '',
      checkoutTime: document.getElementById('cfg-checkout-time') ? document.getElementById('cfg-checkout-time').value : '',
      lateCheckin: document.getElementById('cfg-late-checkin') ? document.getElementById('cfg-late-checkin').value : '',
      deposit: document.getElementById('cfg-deposit') ? document.getElementById('cfg-deposit').value : ''
    },
    notify: {
      offline: document.getElementById('cfg-notify-offline') ? document.getElementById('cfg-notify-offline').checked : true,
      battery: document.getElementById('cfg-notify-battery') ? document.getElementById('cfg-notify-battery').checked : true
    },
    version: '1.0',
    exportTime: new Date().toISOString()
  };
  var blob = new Blob([JSON.stringify(config, null, 2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lockclub_config_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.json';
  a.click();
  showToast('📤 配置文件已导出', 'success');
}

function importSystemConfig(fileInput) {
  var file = fileInput.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var config = JSON.parse(e.target.result);
      if (config.hotel) {
        var el = document.getElementById('cfg-hotel-name');
        if (el && config.hotel.name) el.value = config.hotel.name;
        el = document.getElementById('cfg-hotel-addr');
        if (el && config.hotel.address) el.value = config.hotel.address;
        el = document.getElementById('cfg-hotel-phone');
        if (el && config.hotel.phone) el.value = config.hotel.phone;
        el = document.getElementById('cfg-hotel-email');
        if (el && config.hotel.email) el.value = config.hotel.email;
      }
      if (config.operation) {
        var el = document.getElementById('cfg-checkin-time');
        if (el && config.operation.checkinTime) el.value = config.operation.checkinTime;
        el = document.getElementById('cfg-checkout-time');
        if (el && config.operation.checkoutTime) el.value = config.operation.checkoutTime;
        el = document.getElementById('cfg-deposit');
        if (el && config.operation.deposit) el.value = config.operation.deposit;
      }
      showToast('📥 配置文件导入成功', 'success');
    } catch(err) {
      showToast('❌ 配置文件格式错误', 'error');
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
}

function openResetConfigConfirmModal() {
  if (!confirm('确定要恢复所有配置为系统默认值吗？')) return;
  var defaultCfg = {
    'cfg-hotel-name': '小度语音智慧房体验店',
    'cfg-hotel-addr': '北京市朝阳区某街道1号',
    'cfg-hotel-phone': '010-12345678',
    'cfg-hotel-email': 'contact@lockclub.cn',
    'cfg-checkin-time': '14:00',
    'cfg-checkout-time': '12:00',
    'cfg-late-checkin': '22:00',
    'cfg-deposit': '100'
  };
  Object.keys(defaultCfg).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = defaultCfg[id];
  });
  showToast('🔄 所有配置已恢复默认值', 'success');
}

// ============================================================
// 【改进7】操作日志Tab渲染 - renderOplogTable
// 理由：cfg-content-oplog有结构但无renderOplogTable函数
// 改进：实现操作日志列表渲染
// ============================================================
function renderOplogTable() {
  var tbody = document.getElementById('oplog-table-body');
  if (!tbody) return;
  var typeFilter = document.getElementById('oplog-module-filter');
  var typeVal = typeFilter ? typeFilter.value : 'all';
  var userFilter = document.getElementById('oplog-user-filter');
  var userVal = userFilter ? userFilter.value : 'all';
  var statusFilter = document.getElementById('oplog-type-filter');
  var statusVal = statusFilter ? statusFilter.value : 'all';
  var targetVal = document.getElementById('oplog-target') ? document.getElementById('oplog-target').value.trim() : '';
  var searchVal = document.getElementById('oplog-keyword') ? document.getElementById('oplog-keyword').value.trim().toLowerCase() : '';
  var mockLogs = [
    {time:'2026-03-29 10:30', user:'管理员', module:'设备管理', action:'设备重启', target:'301', status:'成功', detail:'远程重启设备成功'},
    {time:'2026-03-29 10:15', user:'前台小王', module:'入住管理', action:'办理入住', target:'203', status:'成功', detail:'客人：李四'},
    {time:'2026-03-29 09:50', user:'管理员', module:'系统设置', action:'修改配置', target:'通知设置', status:'成功', detail:'开启设备离线告警'},
    {time:'2026-03-29 09:30', user:'前台小李', module:'工单管理', action:'创建工单', target:'305', status:'成功', detail:'低电量告警工单'},
    {time:'2026-03-29 09:00', user:'管理员', module:'房态管理', action:'修改房态', target:'302', status:'成功', detail:'房态改为入住中'},
    {time:'2026-03-28 22:00', user:'系统', module:'系统', action:'自动巡检', target:'全部设备', status:'成功', detail:'巡检12台设备，0异常'},
    {time:'2026-03-28 18:30', user:'管理员', module:'发票管理', action:'开具发票', target:'INV-2026032701', status:'成功', detail:'开具普通发票¥368'},
    {time:'2026-03-28 15:00', user:'前台小王', module:'入住管理', action:'办理退房', target:'301', status:'成功', detail:'押金已退'}
  ];
  var filtered = mockLogs.filter(function(log) {
    var matchType = typeVal === 'all' || log.module === typeVal;
    var matchUser = userVal === 'all' || log.user === userVal;
    var matchStatus = statusVal === 'all' || log.status === statusVal;
    var matchTarget = !targetVal || log.target.indexOf(targetVal) >= 0;
    var matchSearch = !searchVal || log.action.toLowerCase().indexOf(searchVal) >= 0
      || log.detail.toLowerCase().indexOf(searchVal) >= 0
      || log.user.toLowerCase().indexOf(searchVal) >= 0;
    return matchType && matchUser && matchStatus && matchTarget && matchSearch;
  });
  var rows = filtered.map(function(log) {
    var statusColor = log.status === '成功' ? 'var(--green)' : 'var(--red)';
    var moduleColor = {设备管理:'var(--blue)',入住管理:'var(--green)',系统设置:'var(--purple)',
      工单管理:'var(--orange)',房态管理:'var(--blue)',系统:'var(--text-muted)',发票管理:'var(--orange)'}[log.module] || 'var(--text)';
    return '<tr>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + log.time + '</td>' +
      '<td style="font-size:12px;font-weight:600;">' + log.user + '</td>' +
      '<td><span style="font-size:11px;padding:2px 6px;background:rgba(0,0,0,0.05);color:' + moduleColor + ';border-radius:4px;">' + log.module + '</span></td>' +
      '<td style="font-size:12px;font-weight:600;">' + log.action + '</td>' +
      '<td style="font-size:12px;">' + log.target + '</td>' +
      '<td style="font-size:12px;color:' + statusColor + ';">' + (log.status === '成功' ? '✅ ' : '❌ ') + log.status + '</td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + log.detail + '</td></tr>';
  }).join('');
  tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">暂无操作日志</td></tr>';
  var countEl = document.getElementById('oplog-count-label');
  if (countEl) countEl.textContent = '共 ' + filtered.length + ' 条记录';
}

function applyOplogFilter() {
  renderOplogTable();
}

// ============================================================
// 初始化：自动注入所有缺失功能
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  _hookShowPageForAlert();
  setTimeout(function() {
    renderInvoiceFilteredList();
    try {
      var draft = JSON.parse(localStorage.getItem('inv_draft') || '{}');
      if (draft.company) {
        var tip = document.getElementById('inv-create-draft-tip');
        var timeEl = document.getElementById('inv-draft-time');
        if (tip) tip.style.display = '';
        if (timeEl) timeEl.textContent = draft.time || '';
      }
    } catch(e) {}
  }, 300);
  setTimeout(function() {
    if (document.getElementById('bl-table-body')) renderBlacklist && renderBlacklist();
  }, 300);
  setTimeout(function() {
    injectAlertDetailButton();
  }, 500);
  setTimeout(function() {
    switchConfigTab('basic', document.getElementById('cfg-tab-basic'));
    var oplogModule = document.getElementById('oplog-module-filter');
    if (oplogModule) oplogModule.addEventListener('change', applyOplogFilter);
    var oplogUser = document.getElementById('oplog-user-filter');
    if (oplogUser) oplogUser.addEventListener('change', applyOplogFilter);
    var oplogType = document.getElementById('oplog-type-filter');
    if (oplogType) oplogType.addEventListener('change', applyOplogFilter);
    var oplogDateStart = document.getElementById('oplog-date-start');
    if (oplogDateStart) oplogDateStart.addEventListener('change', applyOplogFilter);
    var oplogDateEnd = document.getElementById('oplog-date-end');
    if (oplogDateEnd) oplogDateEnd.addEventListener('change', applyOplogFilter);
  }, 300);
});

// ============================================================
// 【物联后台 v4 第2轮】功能性修复 - 5大缺失函数
// 1. filterAlertTable - 告警Tab状态筛选
// 2. openAlertModalV2 - 告警处理弹窗
// 3. filterNotifCategory - 通知Tab分类筛选
// 4. resetInvoiceSearch - 发票搜索重置
// 5. openInvoiceDeleteModal - 发票删除确认弹窗
// ============================================================

// 【改进1】告警列表 - filterAlertTable（Tab状态筛选）
var _alertCurrentTab = 'all';
function filterAlertTable(tab, el) {
  _alertCurrentTab = tab;
  document.querySelectorAll('#page-alert .card-tabs .card-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = '';
    t.style.color = '';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
  }
  var tbody = document.getElementById('alert-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var status = row.getAttribute('data-status') || '';
    var show = tab === 'all'
      || (tab === 'pending' && status === 'pending')
      || (tab === 'done' && (status === 'done' || status === 'resolved' || status === 'recovered' || status === 'ignored'));
    row.style.display = show ? '' : 'none';
  });
  var shown = Array.from(rows).filter(function(r){ return r.style.display !== 'none'; }).length;
  var countEl = document.getElementById('alert-filter-count');
  if (countEl) countEl.textContent = '共 ' + shown + ' 条告警';
}

// 【改进2】告警列表 - openAlertModalV2（处理告警弹窗）
function openAlertModalV2(idx) {
  var d = alertData[idx];
  if (!d) { showToast('未找到告警记录', 'error'); return; }
  var existing = document.getElementById('modal-alert-process');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-alert-process" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-alert-process\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:90vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="width:44px;height:44px;background:var(--red-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">⚠️</div>' +
    '<div><div style="font-size:15px;font-weight:700;">告警处理</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + d.type + ' · ' + d.room + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-alert-process\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="font-size:12px;color:var(--text-light);line-height:1.8;">' +
    '<div><span style="color:var(--text-muted);">设备/房间：</span><strong>' + d.room + '</strong></div>' +
    '<div><span style="color:var(--text-muted);">告警详情：</span>' + d.detail + '</div>' +
    '<div><span style="color:var(--text-muted);">发生时间：</span>' + d.time + '</div>' +
    '<div><span style="color:var(--text-muted);">当前状态：</span><span class="tbadge orange">' + d.status + '</span></div></div></div>' +
    '<div class="form-group"><label class="form-label">处理方式 <span class="required">*</span></label>' +
    '<select class="form-select" id="ap-action" style="width:100%;">' +
    '<option value="resolved">✅ 标记已处理</option>' +
    '<option value="ignored">👁️ 标记已忽略</option>' +
    '<option value="repair">🔧 联系维修</option></select></div>' +
    '<div class="form-group"><label class="form-label">处理备注</label>' +
    '<textarea class="form-textarea" id="ap-note" placeholder="可选，填写处理说明..." style="min-height:70px;width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 12px;font-size:13px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-alert-process\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="submitAlertProcessV2(' + idx + ')" style="background:var(--blue);color:white;border:none;">✅ 确认处理</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitAlertProcessV2(idx) {
  var action = document.getElementById('ap-action') ? document.getElementById('ap-action').value : '';
  var note = document.getElementById('ap-note') ? document.getElementById('ap-note').value.trim() : '';
  var d = alertData[idx];
  if (!d) { showToast('未找到告警记录', 'error'); return; }
  var statusMap = {resolved:'已处理', ignored:'已忽略', repair:'维修中'};
  var labelMap = {resolved:'✅ 已标记处理', ignored:'👁️ 已标记忽略', repair:'🔧 已提交维修'};
  d.status = statusMap[action] || d.status;
  if (note) d.note = note;
  d.resolvedTime = new Date().toLocaleString('zh-CN');
  var tbody = document.getElementById('alert-table-body');
  if (tbody) {
    var rows = tbody.querySelectorAll('tr');
    if (rows[idx]) {
      var row = rows[idx];
      row.setAttribute('data-status', action === 'resolved' ? 'done' : action);
      var cells = row.querySelectorAll('td');
      if (cells[4]) {
        var statusColors = {resolved:['green-bg','green','✅ '], ignored:['bg','text-muted','👁️ '], repair:['orange-bg','orange','🔧 ']};
        var sc = statusColors[action] || ['bg','text-muted',''];
        cells[4].innerHTML = '<span class="tbadge" style="background:var(' + sc[0] + ');color:var(' + sc[1] + ');">' + sc[2] + statusMap[action] + '</span>';
      }
      if (cells[5]) {
        cells[5].innerHTML = '<button class="action-btn small" onclick="openAlertDetailFullModal(' + idx + ')">详情</button>';
      }
    }
  }
  document.getElementById('modal-alert-process') && document.getElementById('modal-alert-process').remove();
  showToast(labelMap[action] || '✅ 告警已处理', 'success');
}

// 【改进3】通知管理 - filterNotifCategory（通知Tab分类筛选）
var _notifCurrentCategory = 'all';
function filterNotifCategory(category, el) {
  _notifCurrentCategory = category;
  document.querySelectorAll('#page-notif .card-tabs .card-tab').forEach(function(t) {
    if (t.getAttribute('data-cat') === category) {
      t.classList.add('active');
      t.style.background = 'var(--blue)';
      t.style.color = 'white';
    } else {
      t.classList.remove('active');
      t.style.background = '';
      t.style.color = '';
    }
  });
  var cards = document.querySelectorAll('#page-notif .card');
  cards.forEach(function(card) {
    var notifCat = card.getAttribute('data-category') || '';
    card.style.display = (category === 'all' || notifCat === category) ? '' : 'none';
  });
}

// 【改进4】发票管理 - resetInvoiceSearch（重置搜索筛选）
function resetInvoiceSearch() {
  var searchInput = document.getElementById('inv-search-input');
  if (searchInput) searchInput.value = '';
  var statusFilter = document.getElementById('inv-status-filter');
  if (statusFilter) statusFilter.value = 'all';
  var typeFilter = document.getElementById('inv-type-filter');
  if (typeFilter) typeFilter.value = 'all';
  var dateFrom = document.getElementById('inv-date-from');
  if (dateFrom) dateFrom.value = '2026-03-01';
  var dateTo = document.getElementById('inv-date-to');
  if (dateTo) dateTo.value = new Date().toISOString().slice(0,10);
  _invoiceCurrentSearch = '';
  _invoiceCurrentStatusFilter = 'all';
  _invoiceCurrentTypeFilter = 'all';
  filterInvoiceTab('all', document.getElementById('inv-tab-all'));
  showToast('🔄 搜索条件已重置', 'info');
}

// 【改进5】发票管理 - openInvoiceDeleteModal（删除确认弹窗）
function openInvoiceDeleteModal(invId) {
  var inv = invoiceStore.find(function(i){ return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  var existing = document.getElementById('modal-invoice-delete');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-invoice-delete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-delete\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;">🗑️</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--text);">确认删除发票</div>' +
    '<div style="font-size:13px;color:var(--text-light);line-height:1.6;">确定要删除发票 <strong style="color:var(--blue);">' + invId + '</strong> 吗？<br>该操作不可撤销。</div>' +
    '<div style="margin-top:12px;padding:10px;background:var(--bg);border-radius:8px;text-align:left;font-size:12px;">' +
    '<div><span style="color:var(--text-muted);">购方：</span>' + inv.company + '</div>' +
    '<div><span style="color:var(--text-muted);">金额：</span>¥' + inv.amount.toFixed(2) + '</div>' +
    '<div><span style="color:var(--text-muted);">类型：</span>' + inv.type + '</div>' +
    '<div><span style="color:var(--text-muted);">状态：</span>' + inv.status + '</div></div></div>' +
    '<div style="padding:0 24px 24px;display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-invoice-delete\').remove()" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);">取消</button>' +
    '<button onclick="doInvoiceDelete(\'' + invId + '\')" style="flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:white;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doInvoiceDelete(invId) {
  document.getElementById('modal-invoice-delete') && document.getElementById('modal-invoice-delete').remove();
  var idx = invoiceStore.findIndex(function(i){ return i.id === invId; });
  if (idx >= 0) {
    invoiceStore.splice(idx, 1);
    showToast('🗑️ 发票 ' + invId + ' 已删除', 'success');
  } else {
    showToast('未找到发票记录', 'error');
  }
  if (typeof applyInvoiceSearch === 'function') applyInvoiceSearch();
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
}

// 初始化：注册页面切换钩子
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (document.getElementById('alert-table-body')) {
      filterAlertTable('all', document.querySelector('#page-alert .card-tab'));
    }
    if (document.getElementById('page-notif')) {
      filterNotifCategory('all', document.querySelector('#page-notif .card-tab'));
    }
  }, 400);
});

// ============================================================
// 【物联后台 v4 第3轮】功能性修复 - 5大缺失函数
// 1. cancelDeviceConfirm / confirmDeviceAction - 设备操作确认弹窗
// 2. addCheckoutItem - 退房消费项目添加
// 3. cancelWorkorderById - 工单作废
// 4. confirmPointsExchange - 积分兑换确认
// 5. applyLogFilter - 操作日志筛选
// ============================================================

// 【改进1】设备操作确认弹窗 - cancelDeviceConfirm / confirmDeviceAction
// 理由：modal-device-confirm 有关闭按钮调用 cancelDeviceConfirm，确认按钮调用 confirmDeviceAction，但函数不存在
var _deviceConfirmAction = null;
var _deviceConfirmTarget = null;
var _deviceConfirmCountdown = null;

function cancelDeviceConfirm() {
  if (_deviceConfirmCountdown) {
    clearInterval(_deviceConfirmCountdown);
    _deviceConfirmCountdown = null;
  }
  var modal = document.getElementById('modal-device-confirm');
  if (modal) modal.classList.add('hidden');
  _deviceConfirmAction = null;
  _deviceConfirmTarget = null;
}

function confirmDeviceAction() {
  if (_deviceConfirmCountdown) {
    clearInterval(_deviceConfirmCountdown);
    _deviceConfirmCountdown = null;
  }
  var modal = document.getElementById('modal-device-confirm');
  if (modal) modal.classList.add('hidden');
  if (!_deviceConfirmAction) {
    showToast('操作类型未知', 'error');
    return;
  }
  var action = _deviceConfirmAction;
  var target = _deviceConfirmTarget || '';
  var actionLabels = {unlock:'开锁', restart:'重启', battery_check:'电池检测', sync:'状态同步'};
  showToast('⚡ ' + (actionLabels[action] || action) + '指令已发送' + (target ? '：' + target : ''), 'success');
  // Refresh device list if on device page
  if (typeof refreshDeviceTable === 'function') refreshDeviceTable();
  _deviceConfirmAction = null;
  _deviceConfirmTarget = null;
}

function openDeviceConfirmModal(action, target, msg) {
  _deviceConfirmAction = action;
  _deviceConfirmTarget = target || '';
  var modal = document.getElementById('modal-device-confirm');
  if (!modal) return;
  var iconMap = {unlock:'🔓', restart:'🔄', battery_check:'🔋', sync:'🔍'};
  var msgMap = {unlock:'确认要远程开锁吗？', restart:'确认要重启该设备吗？', battery_check:'确认要进行电池检测吗？', sync:'确认要同步设备状态吗？'};
  var titleMap = {unlock:'🔓 远程开锁确认', restart:'🔄 重启设备确认', battery_check:'🔋 电池检测确认', sync:'🔍 状态同步确认'};
  var warnMap = {unlock:'开锁操作将解除门锁锁定，请确认安全', restart:'重启期间设备将短暂离线', battery_check:'电池检测约需10秒', sync:'将立即同步最新状态'};
  var iconEl = document.getElementById('dev-confirm-icon');
  var titleEl = document.getElementById('dev-confirm-title');
  var msgEl = document.getElementById('dev-confirm-msg');
  var warnEl = document.getElementById('dev-confirm-warn');
  if (iconEl) iconEl.textContent = iconMap[action] || '⚡';
  if (titleEl) titleEl.textContent = titleMap[action] || '⚠️ 操作确认';
  if (msgEl) msgEl.textContent = msg || msgMap[action] || '确认执行此操作？';
  if (warnEl) warnEl.textContent = warnMap[action] || '';
  modal.classList.remove('hidden');
  var countEl = document.getElementById('dev-confirm-countdown');
  if (countEl) countEl.textContent = '5';
  var count = 5;
  if (_deviceConfirmCountdown) clearInterval(_deviceConfirmCountdown);
  _deviceConfirmCountdown = setInterval(function() {
    count--;
    var cEl = document.getElementById('dev-confirm-countdown');
    if (cEl) cEl.textContent = count;
    if (count <= 0) {
      clearInterval(_deviceConfirmCountdown);
      _deviceConfirmCountdown = null;
      confirmDeviceAction();
    }
  }, 1000);
}

// 【改进2】退房消费项目添加 - addCheckoutItem
// 理由：退房弹窗有"+ 添加"按钮调用 addCheckoutItem() 但函数不存在
var _checkoutItemCount = 0;
function addCheckoutItem() {
  _checkoutItemCount++;
  var container = document.getElementById('co-consumption-items');
  var noItems = document.getElementById('co-no-items');
  if (noItems) noItems.style.display = 'none';
  if (!container) return;
  var itemHtml = '<div class="co-item-row" id="co-item-' + _checkoutItemCount + '" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;padding:8px;background:var(--bg);border-radius:6px;">' +
    '<input type="text" class="form-input" id="co-item-name-' + _checkoutItemCount + '" placeholder="项目名称" style="flex:2;padding:5px 8px;font-size:12px;">' +
    '<input type="number" class="form-input" id="co-item-qty-' + _checkoutItemCount + '" placeholder="数量" value="1" min="1" style="flex:1;padding:5px 8px;font-size:12px;text-align:center;" oninput="updateCheckoutSummary()">' +
    '<input type="number" class="form-input" id="co-item-price-' + _checkoutItemCount + '" placeholder="单价" value="0" min="0" style="flex:1;padding:5px 8px;font-size:12px;" oninput="updateCheckoutSummary()">' +
    '<span style="font-size:12px;color:var(--text-muted);white-space:nowrap;" id="co-item-total-' + _checkoutItemCount + '">¥0.00</span>' +
    '<button onclick="removeCheckoutItem(' + _checkoutItemCount + ')" style="background:none;border:none;font-size:14px;cursor:pointer;color:var(--red);padding:2px 4px;">✕</button></div>';
  container.insertAdjacentHTML('beforeend', itemHtml);
  // Bind input events
  ['co-item-qty-' + _checkoutItemCount, 'co-item-price-' + _checkoutItemCount].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCheckoutSummary);
  });
}

function removeCheckoutItem(id) {
  var el = document.getElementById('co-item-' + id);
  if (el) el.remove();
  updateCheckoutSummary();
}

function getCheckoutItemsTotal() {
  var total = 0;
  document.querySelectorAll('[id^="co-item-"]').forEach(function(el) {
    var id = el.id;
    if (id.indexOf('qty-') === 0 || id.indexOf('price-') === 0) {
      var numId = id.replace('co-item-qty-', '').replace('co-item-price-', '');
      if (id.indexOf('qty-') === 0) {
        var qty = parseFloat(document.getElementById('co-item-qty-' + numId) ? document.getElementById('co-item-qty-' + numId).value : 0) || 0;
        var price = parseFloat(document.getElementById('co-item-price-' + numId) ? document.getElementById('co-item-price-' + numId).value : 0) || 0;
        total += qty * price;
        var totalEl = document.getElementById('co-item-total-' + numId);
        if (totalEl) totalEl.textContent = '¥' + (qty * price).toFixed(2);
      }
    }
  });
  return total;
}

function updateCheckoutSummary() {
  var roomFee = parseFloat(document.getElementById('co-room-fee') ? document.getElementById('co-room-fee').textContent.replace(/[^0-9.]/g, '') : 0) || 0;
  var deposit = parseFloat(document.getElementById('co-deposit-val') ? document.getElementById('co-deposit-val').textContent.replace(/[^0-9.]/g, '') : 0) || 0;
  var itemTotal = getCheckoutItemsTotal();
  var total = roomFee + itemTotal;
  var refund = deposit - total;
  var consumptionEl = document.getElementById('co-consumption');
  if (consumptionEl) consumptionEl.textContent = '¥' + itemTotal.toFixed(2);
  var totalEl = document.getElementById('co-total');
  if (totalEl) totalEl.textContent = '¥' + total.toFixed(2);
  var refundEl = document.getElementById('co-refund');
  if (refundEl) {
    refundEl.textContent = (refund >= 0 ? '¥' + refund.toFixed(2) : '需补 ¥' + Math.abs(refund).toFixed(2));
    refundEl.style.color = refund >= 0 ? 'var(--green)' : 'var(--red)';
  }
}

// 【改进3】工单作废 - cancelWorkorderById
// 理由：工单列表"作废"按钮调用 cancelWorkorderById 但函数不存在
function cancelWorkorderById(woId) {
  var wo = workorderStore.find(function(w) { return w.id === woId; });
  if (!wo) {
    showToast('未找到工单：' + woId, 'error');
    return;
  }
  if (wo.status === '已完成') {
    showToast('已完成工单无法作废', 'warning');
    return;
  }
  var existing = document.getElementById('modal-wo-cancel');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-wo-cancel" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;">⚠️</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px;">确认作废工单</div>' +
    '<div style="font-size:13px;color:var(--text-light);line-height:1.6;">确定要作废工单 <strong style="color:var(--red);">' + woId + '</strong> 吗？<br>作废后无法恢复。</div></div>' +
    '<div style="padding:0 24px 24px;display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-wo-cancel\').remove()" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);">取消</button>' +
    '<button onclick="doCancelWorkorder(\'' + woId + '\')" style="flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:white;">🗑️ 确认作废</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doCancelWorkorder(woId) {
  document.getElementById('modal-wo-cancel') && document.getElementById('modal-wo-cancel').remove();
  var idx = workorderStore.findIndex(function(w) { return w.id === woId; });
  if (idx >= 0) {
    workorderStore[idx].status = '已取消';
    workorderStore[idx].cancelTime = new Date().toLocaleString('zh-CN');
    showToast('🗑️ 工单 ' + woId + ' 已作废', 'success');
  }
  if (typeof applyWorkorderSearch === 'function') applyWorkorderSearch();
  if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
}

// 【改进4】积分兑换确认 - confirmPointsExchange
// 理由：积分兑换弹窗有确认按钮调用 confirmPointsExchange 但函数不存在
var _pendingPointsExchange = null;
function confirmPointsExchange() {
  var pwd = document.getElementById('pex-pwd');
  if (!pwd || !pwd.value) {
    showToast('请输入登录密码确认兑换', 'error');
    return;
  }
  if (pwd.value.length < 6) {
    showToast('密码长度不足6位', 'error');
    return;
  }
  if (!_pendingPointsExchange) {
    showToast('兑换信息异常，请重试', 'error');
    return;
  }
  var info = _pendingPointsExchange;
  document.getElementById('modal-points-exchange') && document.getElementById('modal-points-exchange').remove();
  showToast('✅ ' + info.name + ' 积分兑换成功！获得 ' + info.points + ' 积分（-' + info.cost + '余额）', 'success');
  _pendingPointsExchange = null;
  // Update member points display if on member page
  if (typeof renderMemberConsumptionTable === 'function') renderMemberConsumptionTable();
}

function openPointsExchangeConfirmModal(memberIdx, exchangeInfo) {
  _pendingPointsExchange = exchangeInfo;
  var modal = document.getElementById('modal-points-exchange');
  if (!modal) return;
  var nameEl = document.getElementById('pex-member-name');
  var pointsEl = document.getElementById('pex-points');
  var costEl = document.getElementById('pex-cost');
  if (nameEl) nameEl.textContent = exchangeInfo.name;
  if (pointsEl) pointsEl.textContent = '+' + exchangeInfo.points + ' 积分';
  if (costEl) costEl.textContent = '-' + exchangeInfo.cost + '元余额';
  modal.classList.remove('hidden');
  var pwdEl = document.getElementById('pex-pwd');
  if (pwdEl) pwdEl.value = '';
}

// 【改进5】操作日志筛选 - applyLogFilter
// 理由：操作日志页面的筛选按钮调用 applyLogFilter 但函数不存在
function applyLogFilter() {
  var tbody = document.getElementById('oplog-table-body');
  if (!tbody) return;
  // Trigger the existing filter logic if available
  if (typeof renderOplogTable === 'function') {
    renderOplogTable();
  }
  // Also filter by date range if available
  var dateStart = document.getElementById('oplog-date-start') ? document.getElementById('oplog-date-start').value : '';
  var dateEnd = document.getElementById('oplog-date-end') ? document.getElementById('oplog-date-end').value : '';
  var rows = tbody.querySelectorAll('tr');
  var matchCount = 0;
  rows.forEach(function(row) {
    var timeCell = row.querySelector('td:first-child');
    if (!timeCell) return;
    var rowDate = timeCell.textContent.trim().slice(0, 10);
    var show = true;
    if (dateStart && rowDate < dateStart) show = false;
    if (dateEnd && rowDate > dateEnd) show = false;
    row.style.display = show ? '' : 'none';
    if (show) matchCount++;
  });
  var countEl = document.getElementById('oplog-count-label');
  if (countEl) countEl.textContent = '共 ' + matchCount + ' 条记录';
  showToast('🔍 筛选完成，找到 ' + matchCount + ' 条记录', 'info');
}

// 【改进6】黑名单管理 - renderBlacklist
// 理由：黑名单页面加载时 renderBlacklist 未定义
function renderBlacklist() {
  var tbody = document.getElementById('bl-table-body');
  if (!tbody) return;
  var searchKw = document.getElementById('bl-search') ? document.getElementById('bl-search').value.toLowerCase().trim() : '';
  var filtered = (window.blacklistStore || []).filter(function(b) {
    return !searchKw || (b.name + b.phone + b.id).toLowerCase().indexOf(searchKw) >= 0;
  });
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">暂无黑名单记录</td></tr>';
    return;
  }
  var html = filtered.map(function(b) {
    return '<tr>' +
      '<td><input type="checkbox" style="accent-color:var(--blue);"></td>' +
      '<td><strong>' + b.name + '</strong></td>' +
      '<td>' + b.phone + '</td>' +
      '<td>' + (b.idType || '身份证') + '</td>' +
      '<td><span class="tbadge red">🚫 黑名单</span></td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + (b.addTime || '--') + '</td>' +
      '<td><button class="action-btn small" onclick="openBlacklistDetail(\'' + b.id + '\')">详情</button> ' +
      '<button class="action-btn small green" onclick="removeBlacklistEntry(\'' + b.id + '\')">移除</button></td></tr>';
  }).join('');
  tbody.innerHTML = html;
  var countEl = document.getElementById('bl-filter-count');
  if (countEl) countEl.textContent = '共 ' + filtered.length + ' 条记录';
}

function removeBlacklistEntry(id) {
  var idx = (window.blacklistStore || []).findIndex(function(b) { return b.id === id; });
  if (idx >= 0) {
    window.blacklistStore.splice(idx, 1);
    showToast('✅ 已从黑名单移除', 'success');
    renderBlacklist();
  }
}

// ============================================================
// 【物联后台 v4 第4轮】初始化增强
// ============================================================

// 初始化黑名单数据
if (!window.blacklistStore) {
  window.blacklistStore = [
    {id:'BL001', name:'测试用户A', phone:'138****1111', idType:'身份证', addTime:'2026-03-20', reason:'恶意破坏公物'},
    {id:'BL002', name:'测试用户B', phone:'139****2222', idType:'身份证', addTime:'2026-03-18', reason:'多次投诉骚扰'}
  ];
}

// 初始化告警数据
if (!window.alertData) {
  window.alertData = [
    {type:'🔋 低电量告警', room:'305室', detail:'电池电量低于20%', time:'2026-03-29 08:30', status:'待处理'},
    {type:'📶 设备离线', room:'203室', detail:'设备网络中断超过30分钟', time:'2026-03-29 07:15', status:'待处理'},
    {type:'🔓 门锁异常', room:'301室', detail:'门锁尝试次数异常', time:'2026-03-28 22:00', status:'已处理'}
  ];
}

// 初始化工单Store
if (!window.workorderStore) {
  window.workorderStore = [
    {id:'WO-2026032901', type:'repair', room:'305', guest:'张三', content:'房间门锁故障', priority:'urgent', status:'待接受', createTime:'2026-03-29 10:32', handler:'', doneTime:''},
    {id:'WO-2026032902', type:'delivery', room:'203', guest:'李四', content:'需要送物服务', priority:'normal', status:'处理中', createTime:'2026-03-29 09:20', handler:'前台小王', doneTime:''},
    {id:'WO-2026032801', type:'complaint', room:'301', guest:'王五', content:'房间空调噪音过大', priority:'high', status:'已完成', createTime:'2026-03-28 14:00', handler:'维修员老张', doneTime:'2026-03-28 16:30'}
  ];
}

// Hook showPage for alert detail button injection
(function() {
  if (typeof showPage === 'function') {
    var _originalShowPage = showPage;
    showPage = function(pageName) {
      _originalShowPage(pageName);
      if (pageName === 'alert') {
        setTimeout(function() {
          var tbody = document.getElementById('alert-table-body');
          if (tbody && tbody.querySelectorAll('tr').length > 0) {
            if (typeof injectAlertDetailButton === 'function') injectAlertDetailButton();
          }
        }, 300);
      }
      if (pageName === 'blacklist') {
        setTimeout(function() {
          if (typeof renderBlacklist === 'function') renderBlacklist();
        }, 200);
      }
    };
  }
})();

// ============================================================
// 【物联后台 v4-第5轮】房间记录CRUD闭环 + 审计日志筛选 + 房间详情Tab增强
// ============================================================

// 初始化房间记录数据
if (!window.roomRecordData) {
  window.roomRecordData = [
    {id:'rec-001', type:'in', name:'张三', phone:'138****8888', method:'phone', room:'301', roomType:'亲子间', status:'active', time:'今天 10:32', note:'', fromRoom:'', changeReason:''},
    {id:'rec-002', type:'out', name:'李四', phone:'139****6666', method:'card', room:'301', roomType:'亲子间', status:'done', time:'昨天 14:20', note:'', fromRoom:'', changeReason:'', depositReturned:true},
    {id:'rec-003', type:'change', name:'钱七', phone:'137****7777', method:'phone', room:'301', roomType:'亲子间', status:'done', time:'03-25 16:00', note:'', fromRoom:'203', changeReason:'房间噪音大'},
    {id:'rec-004', type:'out', name:'王五', phone:'137****5555', method:'phone', room:'301', roomType:'亲子间', status:'done', time:'03-24 12:00', note:'', fromRoom:'', changeReason:''}
  ];
}

// 审计日志数据
if (!window.auditLogData) {
  window.auditLogData = [
    {time:'2026-03-27 10:32:08', type:'config', desc:'修改房间301门锁灵敏度从「高」调整为「中」', operator:'赵飞', ip:'192.168.1.101', result:'成功'},
    {time:'2026-03-27 10:30:15', type:'key', desc:'为张三添加手机开锁权限，有效期至 2026-03-28 12:00', operator:'赵飞', ip:'192.168.1.101', result:'成功'},
    {time:'2026-03-27 10:30:10', type:'key', desc:'自动清除离店客人李四的门卡权限（入住状态变更触发）', operator:'系统', ip:'--', result:'成功'},
    {time:'2026-03-27 10:15:33', type:'unlock', desc:'手机蓝牙开锁，响应时间 23ms，设备电量 88%', operator:'张三', ip:'--', result:'成功'},
    {time:'2026-03-26 16:20:05', type:'config', desc:'修改房间301温控策略从「自动」切换为「节能模式」', operator:'周敏', ip:'192.168.1.102', result:'成功'},
    {time:'2026-03-26 14:00:00', type:'auth', desc:'为张三创建会员卡，卡号 8888 6666 7777 9999', operator:'赵飞', ip:'192.168.1.101', result:'成功'},
    {time:'2026-03-26 11:30:00', type:'device', desc:'远程重启设备 A84F1AF2，门锁响应正常', operator:'系统', ip:'--', result:'成功'},
    {time:'2026-03-25 18:00:00', type:'key', desc:'为钱七生成临时密码，有效期 2026-03-25 18:00 至 2026-03-26 12:00', operator:'赵飞', ip:'192.168.1.101', result:'成功'},
    {time:'2026-03-25 16:00:00', type:'config', desc:'房间换房：钱七从 203 换至 301，原因：房间噪音大', operator:'赵飞', ip:'192.168.1.101', result:'成功'},
    {time:'2026-03-24 12:00:00', type:'out', desc:'王五退房，押金 ¥200 已退还', operator:'系统', ip:'--', result:'成功'}
  ];
}

// ============================================================
// 【改进3】filterRoomRecords - 房间记录Tab状态筛选
// 理由：房间记录Tab有「全部/入住/退房/换房」但函数缺失，点击无响应
// 改进：根据rtype过滤记录，更新Tab激活状态和计数
// ============================================================
function filterRoomRecords(status, el) {
  // 更新Tab激活状态
  var tabs = document.querySelectorAll('#room-records-list');
  if (el) {
    var parent = el.closest('.card-tabs') || el.closest('#room-content-records');
    if (parent) {
      parent.querySelectorAll('.card-tab').forEach(function(t) {
        t.classList.remove('active');
        t.style.background = '';
        t.style.color = '';
      });
      el.classList.add('active');
      el.style.background = 'var(--blue)';
      el.style.color = 'white';
    }
  }
  // 过滤记录
  var container = document.getElementById('room-records-list');
  if (!container) return;
  var records = container.querySelectorAll('.checkin-record');
  records.forEach(function(rec) {
    var rtype = rec.getAttribute('data-rtype') || '';
    var show = status === 'all' || rtype === status;
    rec.style.display = show ? '' : 'none';
  });
  // 更新计数
  var allCount = container.querySelectorAll('.checkin-record').length;
  var inCount = container.querySelectorAll('.checkin-record[data-rtype="in"]').length;
  var outCount = container.querySelectorAll('.checkin-record[data-rtype="out"]').length;
  var changeCount = container.querySelectorAll('.checkin-record[data-rtype="change"]').length;
  var elAll = document.getElementById('rr-count-all');
  var elIn = document.getElementById('rr-count-in');
  var elOut = document.getElementById('rr-count-out');
  var elChange = document.getElementById('rr-count-change');
  if (elAll) elAll.textContent = allCount;
  if (elIn) elIn.textContent = inCount;
  if (elOut) elOut.textContent = outCount;
  if (elChange) elChange.textContent = changeCount;
}

// ============================================================
// 【改进3】openAddRoomRecordModal - 打开添加房间记录弹窗
// ============================================================
function openAddRoomRecordModal() {
  var modal = document.getElementById('modal-room-record-form');
  if (!modal) {
    showToast('房间记录表单未找到', 'error');
    return;
  }
  // 重置表单
  document.getElementById('rrf-title').textContent = '✏️ 添加记录';
  document.getElementById('rrf-type').value = 'in';
  document.getElementById('rrf-name').value = '';
  document.getElementById('rrf-phone').value = '';
  document.getElementById('rrf-method').value = 'phone';
  document.getElementById('rrf-note').value = '';
  document.getElementById('rrf-from-room').value = '';
  document.getElementById('rrf-change-reason').value = '';
  document.getElementById('rrf-change-fields').style.display = 'none';
  document.getElementById('rrf-submit-btn').setAttribute('data-edit-id', '');
  modal.classList.remove('hidden');
}

// ============================================================
// 【改进3】editRoomRecord - 编辑房间记录
// ============================================================
function editRoomRecord(recordId) {
  var record = (window.roomRecordData || []).find(function(r) { return r.id === recordId; });
  if (!record) {
    showToast('记录不存在', 'error');
    return;
  }
  var modal = document.getElementById('modal-room-record-form');
  if (!modal) return;
  document.getElementById('rrf-title').textContent = '✏️ 编辑记录';
  document.getElementById('rrf-type').value = record.type;
  document.getElementById('rrf-name').value = record.name;
  document.getElementById('rrf-phone').value = record.phone || '';
  document.getElementById('rrf-method').value = record.method || 'phone';
  document.getElementById('rrf-note').value = record.note || '';
  document.getElementById('rrf-from-room').value = record.fromRoom || '';
  document.getElementById('rrf-change-reason').value = record.changeReason || '';
  document.getElementById('rrf-change-fields').style.display = record.type === 'change' ? '' : 'none';
  document.getElementById('rrf-submit-btn').setAttribute('data-edit-id', recordId);
  modal.classList.remove('hidden');
}

// ============================================================
// 【改进3】deleteRoomRecord - 删除房间记录（先弹确认）
// ============================================================
function deleteRoomRecord(recordId) {
  var record = (window.roomRecordData || []).find(function(r) { return r.id === recordId; });
  var detailEl = document.getElementById('rr-del-detail');
  if (detailEl) detailEl.textContent = '删除「' + (record ? record.name : recordId) + '」的记录？删除后将无法恢复。';
  var confirmBtn = document.getElementById('rr-del-confirm-btn');
  if (confirmBtn) confirmBtn.setAttribute('data-delete-id', recordId);
  var modal = document.getElementById('modal-rr-delete-confirm');
  if (modal) modal.classList.remove('hidden');
}

// ============================================================
// 【改进3】confirmDeleteRoomRecord - 确认删除
// ============================================================
function confirmDeleteRoomRecord() {
  var confirmBtn = document.getElementById('rr-del-confirm-btn');
  var recordId = confirmBtn ? confirmBtn.getAttribute('data-delete-id') : '';
  if (!recordId) return;
  var idx = (window.roomRecordData || []).findIndex(function(r) { return r.id === recordId; });
  if (idx >= 0) {
    window.roomRecordData.splice(idx, 1);
    showToast('✅ 记录已删除', 'success');
  }
  closeModal('rr-delete-confirm');
  // 从DOM移除
  var domRec = document.querySelector('.checkin-record[data-record-id="' + recordId + '"]');
  if (domRec) domRec.remove();
  // 更新计数
  filterRoomRecords('all', document.querySelector('#room-content-records .card-tab'));
}

// ============================================================
// 【改进3】submitRoomRecord - 提交房间记录（新增/编辑）
// ============================================================
function submitRoomRecord() {
  var submitBtn = document.getElementById('rrf-submit-btn');
  var editId = submitBtn ? submitBtn.getAttribute('data-edit-id') : '';
  var rtype = document.getElementById('rrf-type').value;
  var name = document.getElementById('rrf-name').value.trim();
  var phone = document.getElementById('rrf-phone').value.trim();
  var method = document.getElementById('rrf-method').value;
  var note = document.getElementById('rrf-note').value.trim();
  if (!name) {
    showToast('请输入客人姓名', 'error');
    return;
  }
  var now = new Date();
  var timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  var today = '今天';
  if (editId) {
    var idx = (window.roomRecordData || []).findIndex(function(r) { return r.id === editId; });
    if (idx >= 0) {
      window.roomRecordData[idx] = Object.assign({}, window.roomRecordData[idx], {
        type: rtype, name: name, phone: phone, method: method, note: note,
        fromRoom: rtype === 'change' ? document.getElementById('rrf-from-room').value : '',
        changeReason: rtype === 'change' ? document.getElementById('rrf-change-reason').value : ''
      });
      showToast('✅ 记录已更新', 'success');
    }
  } else {
    var newId = 'rec-' + Date.now();
    window.roomRecordData.push({
      id: newId, type: rtype, name: name, phone: phone, method: method,
      room: '301', roomType: '亲子间', status: rtype === 'out' ? 'done' : 'active',
      time: today + ' ' + timeStr, note: note,
      fromRoom: rtype === 'change' ? document.getElementById('rrf-from-room').value : '',
      changeReason: rtype === 'change' ? document.getElementById('rrf-change-reason').value : ''
    });
    showToast('✅ 记录已添加', 'success');
  }
  closeModal('room-record-form');
  // 刷新列表（简单刷新当前Tab）
  filterRoomRecords('all', document.querySelector('#room-content-records .card-tab'));
}

// ============================================================
// 【改进3】openChangeRoomModal - 打开换房弹窗
// ============================================================
function openChangeRoomModal() {
  var modal = document.getElementById('modal-change-room-record');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('crr-name').textContent = '张三';
    document.getElementById('crr-from-room').textContent = '301';
    document.getElementById('crr-target-room').value = '';
    document.getElementById('crr-reason').value = '';
    document.getElementById('crr-note').value = '';
  } else {
    showToast('换房功能开发中', 'info');
  }
}

// ============================================================
// 【改进3】openEarlyCheckoutModal - 打开退房弹窗
// ============================================================
function openEarlyCheckoutModal() {
  showToast('🚪 早退功能已打开，请在房间记录中编辑退房状态', 'info');
}

// ============================================================
// 【改进3】submitChangeRoomRecord - 确认换房
// ============================================================
function submitChangeRoomRecord() {
  var targetRoom = document.getElementById('crr-target-room').value.trim();
  var reason = document.getElementById('crr-reason').value;
  if (!targetRoom) {
    showToast('请输入目标房间号', 'error');
    return;
  }
  if (!reason) {
    showToast('请选择换房原因', 'error');
    return;
  }
  showToast('✅ 换房成功：301 → ' + targetRoom, 'success');
  closeModal('change-room-record');
}

// ============================================================
// 【改进3】exportRoomRevenueReport - 导出入账报告
// ============================================================
function exportRoomRevenueReport() {
  showToast('💰 正在生成入账报告…', 'info');
  setTimeout(function() {
    var csv = '日期,房间,客人,类型,金额\n';
    csv += '2026-03-29,301,张三,入住,¥0\n';
    csv += '2026-03-28,301,李四,退房,¥200\n';
    csv += '2026-03-25,301,钱七,换房,¥0\n';
    csv += '2026-03-24,301,王五,退房,¥200\n';
    var blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '入账报告_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ 入账报告已导出', 'success');
  }, 800);
}

// ============================================================
// 【改进3】exportRoomAuditLog - 导出房间审计日志
// ============================================================
function exportRoomAuditLog() {
  showToast('📤 正在导出审计日志…', 'info');
  setTimeout(function() {
    var data = window.auditLogData || [];
    var csv = '\uFEFF时间,类型,操作描述,操作者,IP地址,结果\n';
    data.forEach(function(row) {
      csv += row.time + ',' + row.type + ',' + row.desc.replace(/,/g,'，') + ',' + row.operator + ',' + row.ip + ',' + row.result + '\n';
    });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '审计日志_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ 审计日志已导出', 'success');
  }, 600);
}

// ============================================================
// 【改进3】filterAuditLog - 审计日志搜索/筛选
// ============================================================
function filterAuditLog(keyword) {
  var typeFilter = document.getElementById('audit-type-filter');
  var opFilter = document.getElementById('audit-operator-filter');
  var typeVal = typeFilter ? typeFilter.value : 'all';
  var opVal = opFilter ? opFilter.value : 'all';
  var kw = keyword ? keyword.toLowerCase() : '';
  var data = window.auditLogData || [];
  var filtered = data.filter(function(row) {
    var matchType = typeVal === 'all' || row.type === typeVal;
    var matchOp = opVal === 'all' || row.operator === opVal;
    var matchKw = !kw || row.desc.toLowerCase().indexOf(kw) >= 0 || row.operator.toLowerCase().indexOf(kw) >= 0;
    return matchType && matchOp && matchKw;
  });
  var tbody = document.getElementById('audit-log-body');
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">暂无审计日志</td></tr>';
    return;
  }
  var typeLabels = {config:'⚙️ 配置', key:'🔑 钥匙', unlock:'🔓 开锁', auth:'🔐 权限', device:'📱 设备', out:'🚪 退房'};
  tbody.innerHTML = filtered.map(function(row) {
    var badgeStyle = row.type === 'config' ? 'var(--purple-bg)' : row.type === 'key' || row.type === 'auth' ? 'var(--green-bg)' : row.type === 'unlock' ? 'var(--blue-bg)' : 'var(--orange-bg)';
    var badgeColor = row.type === 'config' ? 'var(--purple)' : row.type === 'key' || row.type === 'auth' ? 'var(--green)' : row.type === 'unlock' ? 'var(--blue)' : 'var(--orange)';
    return '<tr data-type="' + row.type + '" data-operator="' + row.operator + '">' +
      '<td style="font-size:11px;color:var(--text-muted);font-family:monospace;">' + row.time + '</td>' +
      '<td><span class="tbadge" style="background:' + badgeStyle + ';color:' + badgeColor + ';font-size:10px;padding:2px 6px;">' + (typeLabels[row.type] || row.type) + '</span></td>' +
      '<td style="font-size:12px;">' + row.desc + '</td>' +
      '<td style="font-size:11px;font-weight:600;">' + row.operator + '</td>' +
      '<td style="font-size:11px;color:var(--text-muted);font-family:monospace;">' + row.ip + '</td>' +
      '<td><span class="tbadge ' + (row.result === '成功' ? 'green' : 'red') + '" style="font-size:10px;">' + row.result + '</span></td>' +
    '</tr>';
  }).join('');
  var countEl = document.getElementById('audit-record-count');
  if (countEl) countEl.textContent = '共 ' + filtered.length + ' 条记录';
}

// ============================================================
// 【补充】closeModal辅助函数（防止外部引用报错）
// ============================================================
if (typeof closeModal !== 'function') {
  window.closeModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  };
}

// 初始化房间记录Tab点击
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var firstTab = document.querySelector('#room-content-records .card-tab');
    if (firstTab && typeof filterRoomRecords === 'function') {
      filterRoomRecords('all', firstTab);
    }
  }, 500);
});

// ============================================================
// 【物联后台 v4 - 第6轮】5个缺失功能性改进
// ============================================================

// 【改进1】openBatchUpgradeModal - 批量升级固件弹窗（UI按钮存在但函数缺失）
// 理由：设备管理工具栏有"批量升级固件"按钮onclick="openBatchUpgradeModal()"但函数体缺失
function openBatchUpgradeModal() {
  var existing = document.getElementById('modal-batch-upgrade');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-batch-upgrade" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-upgrade\').remove()">' +
    '<div class="modal" style="width:580px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📦</div><div><div style="font-size:15px;font-weight:700;">批量固件升级</div><div style="font-size:11px;color:var(--text-muted);">支持多设备同时升级固件</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-upgrade\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--purple);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">💡</div><div><strong>升级说明：</strong>批量升级将同时向选中设备推送固件包，升级过程中设备将暂时离线，预计每台设备耗时30-60秒</div></div>' +
    '<div class="form-group"><label class="form-label">选择目标版本</label>' +
    '<select class="form-select" id="bu-version" style="width:100%;">' +
    '<option value="v3.2.1">v3.2.1（最新稳定版，推荐）</option>' +
    '<option value="v3.2.0">v3.2.0（上一稳定版）</option>' +
    '<option value="v3.1.5">v3.1.5（历史版本）</option></select></div>' +
    '<div class="form-group"><label class="form-label">升级策略</label>' +
    '<select class="form-select" id="bu-strategy" style="width:100%;">' +
    '<option value="auto">🔄 自动（依次升级）</option>' +
    '<option value="parallel">⚡ 并行（同时升级所有设备）</option>' +
    '<option value="batch">📦 分批（每批3台）</option></select></div>' +
    '<div class="form-group"><label class="form-label">已选设备（<span id="bu-device-count">0</span> 台）</label>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;max-height:120px;overflow-y:auto;font-size:12px;color:var(--text-muted);" id="bu-device-list">请从左侧设备列表勾选要升级的设备</div></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">⚠️ 升级过程中请勿断开设备电源，升级完成后设备将自动重启</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-upgrade\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="confirmBatchUpgrade()" style="background:var(--purple);color:white;border:none;">📦 开始批量升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 更新已选设备数量
  var selectedDevices = window._selectedDevicesForBatch || [];
  var countEl = document.getElementById('bu-device-count');
  if (countEl) countEl.textContent = selectedDevices.length;
  var listEl = document.getElementById('bu-device-list');
  if (listEl && selectedDevices.length > 0) {
    listEl.innerHTML = selectedDevices.map(function(d) { return '<div>• ' + d + '</div>'; }).join('');
    listEl.style.color = 'var(--text)';
  }
}

function confirmBatchUpgrade() {
  var version = document.getElementById('bu-version') ? document.getElementById('bu-version').value : 'v3.2.1';
  var strategy = document.getElementById('bu-strategy') ? document.getElementById('bu-strategy').value : 'auto';
  var selectedDevices = window._selectedDevicesForBatch || [];
  var count = selectedDevices.length;
  if (count === 0) { showToast('请先勾选要升级的设备', 'error'); return; }
  document.getElementById('modal-batch-upgrade') && document.getElementById('modal-batch-upgrade').remove();
  showToast('📦 批量升级已启动（目标版本：' + version + '，策略：' + (strategy === 'auto' ? '自动' : strategy === 'parallel' ? '并行' : '分批') + '）', 'success');
  setTimeout(function() {
    showToast('✅ 批量升级完成：' + count + ' 台设备已全部升级到 ' + version, 'success');
  }, 3000);
}

// 【改进2】openBatchDeviceBindingModal - 批量设备绑定弹窗（UI按钮存在但函数缺失）
function openBatchDeviceBindingModal() {
  var existing = document.getElementById('modal-batch-binding');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-batch-binding" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-binding\').remove()">' +
    '<div class="modal" style="width:500px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📡</div><div><div style="font-size:15px;font-weight:700;">批量设备绑定</div><div style="font-size:11px;color:var(--text-muted);">将设备批量绑定到房间或楼栋</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">绑定类型</label>' +
    '<select class="form-select" id="bbb-type" style="width:100%;" onchange="updateBBBOptions()">' +
    '<option value="room">🏠 绑定到房间</option>' +
    '<option value="floor">🏢 绑定到楼层</option>' +
    '<option value="building">🏗️ 绑定到楼栋</option></select></div>' +
    '<div class="form-group"><label class="form-label">目标位置</label>' +
    '<select class="form-select" id="bbb-target" style="width:100%;">' +
    '<option value="">请先选择绑定类型</option></select></div>' +
    '<div class="form-group"><label class="form-label">待绑定设备（<span id="bbb-count">0</span> 台）</label>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;max-height:100px;overflow-y:auto;font-size:12px;color:var(--text-muted);" id="bbb-device-list">从设备列表勾选设备后在此显示</div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-binding\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="confirmBatchBinding()" style="background:var(--orange);color:white;border:none;">📡 确认绑定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  updateBBBOptions();
  var selectedDevices = window._selectedDevicesForBatch || [];
  var countEl = document.getElementById('bbb-count');
  if (countEl) countEl.textContent = selectedDevices.length;
  var listEl = document.getElementById('bbb-device-list');
  if (listEl && selectedDevices.length > 0) {
    listEl.innerHTML = selectedDevices.map(function(d) { return '<div>• ' + d + '</div>'; }).join('');
    listEl.style.color = 'var(--text)';
  }
}

function updateBBBOptions() {
  var type = document.getElementById('bbb-type') ? document.getElementById('bbb-type').value : 'room';
  var targetSelect = document.getElementById('bbb-target');
  if (!targetSelect) return;
  var options = {
    'room': [
      {v:'101',n:'101室'},{v:'102',n:'102室'},{v:'201',n:'201室'},{v:'202',n:'202室'},
      {v:'301',n:'301室'},{v:'302',n:'302室'},{v:'401',n:'401室'},{v:'402',n:'402室'}
    ],
    'floor': [
      {v:'1F',n:'1层'},{v:'2F',n:'2层'},{v:'3F',n:'3层'},{v:'4F',n:'4层'}
    ],
    'building': [
      {v:'MAIN',n:'主楼'},{v:'EAST',n:'东配楼'},{v:'WEST',n:'西配楼'}
    ]
  };
  var opts = options[type] || [];
  targetSelect.innerHTML = '<option value="">请选择</option>' + opts.map(function(o) {
    return '<option value="' + o.v + '">' + o.n + '</option>';
  }).join('');
}

function confirmBatchBinding() {
  var type = document.getElementById('bbb-type') ? document.getElementById('bbb-type').value : '';
  var target = document.getElementById('bbb-target') ? document.getElementById('bbb-target').value : '';
  var selectedDevices = window._selectedDevicesForBatch || [];
  if (!type || !target) { showToast('请选择绑定类型和目标位置', 'error'); return; }
  if (selectedDevices.length === 0) { showToast('请先勾选要绑定的设备', 'error'); return; }
  var typeLabel = {room:'房间',floor:'楼层',building:'楼栋'}[type] || type;
  document.getElementById('modal-batch-binding') && document.getElementById('modal-batch-binding').remove();
  showToast('📡 批量绑定成功：' + selectedDevices.length + ' 台设备已绑定到' + typeLabel, 'success');
}

// 【改进3】openFirmwareOTAModal - OTA固件升级弹窗（UI按钮存在但函数缺失）
function openFirmwareOTAModal() {
  var existing = document.getElementById('modal-firmware-ota');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-firmware-ota" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-ota\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📦</div><div><div style="font-size:15px;font-weight:700;">OTA 在线升级</div><div style="font-size:11px;color:var(--text-muted);">通过OTA方式远程推送固件</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-ota\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--green);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">🌐</div><div><strong>OTA优势：</strong>支持差分升级，包体积小，升级速度快，断点续传</div></div>' +
    '<div class="form-group"><label class="form-label">固件来源</label>' +
    '<select class="form-select" id="ota-source" style="width:100%;">' +
    '<option value="cloud">☁️ 云端最新固件库</option>' +
    '<option value="custom">📁 自定义固件包上传</option></select></div>' +
    '<div class="form-group"><label class="form-label">目标固件版本</label>' +
    '<select class="form-select" id="ota-version" style="width:100%;">' +
    '<option value="v3.2.1">v3.2.1（最新）</option>' +
    '<option value="v3.2.0">v3.2.0</option>' +
    '<option value="v3.1.8">v3.1.8</option></select></div>' +
    '<div class="form-group"><label class="form-label">升级设备</label>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--text-muted);">从左侧设备列表选择，或输入设备UUID（多个用逗号分隔）</div>' +
    '<input type="text" class="form-input" id="ota-devices" placeholder="DEV-LK01, DEV-LK02, DEV-LK03" style="margin-top:8px;"></div>' +
    '<div style="padding:10px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);">📶 OTA升级需要设备在线，建议在低峰期操作</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-ota\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="startOTAUpgrade()" style="background:var(--green);color:white;border:none;">🌐 开始OTA升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function startOTAUpgrade() {
  var version = document.getElementById('ota-version') ? document.getElementById('ota-version').value : '';
  var devices = document.getElementById('ota-devices') ? document.getElementById('ota-devices').value.trim() : '';
  if (!devices) { showToast('请输入目标设备UUID', 'error'); return; }
  document.getElementById('modal-firmware-ota') && document.getElementById('modal-firmware-ota').remove();
  showToast('🌐 OTA升级已启动，目标版本：' + version, 'success');
  setTimeout(function() {
    showToast('✅ OTA升级完成！设备正在重启...', 'success');
  }, 2500);
}

// 【改进4】openFirmwareVersionTrackerModal - 固件版本跟踪器弹窗（UI按钮存在但函数缺失）
function openFirmwareVersionTrackerModal() {
  var existing = document.getElementById('modal-firmware-tracker');
  if (existing) existing.remove();
  var versions = [
    {v:'v3.2.1', date:'2026-03-25', status:'stable', devices:12, desc:'最新稳定版，修复了若干Bug'},
    {v:'v3.2.0', date:'2026-03-20', status:'stable', devices:8, desc:'新增节能模式'},
    {v:'v3.1.8', date:'2026-03-15', status:'stable', devices:5, desc:'修复低电量告警延迟'},
    {v:'v3.1.5', date:'2026-03-01', status:'old', devices:2, desc:'历史版本'}
  ];
  var rows = versions.map(function(v) {
    var statusBadge = v.status === 'stable' ? '<span style="background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:10px;font-size:10px;">稳定</span>' :
                       v.status === 'old' ? '<span style="background:var(--bg);color:var(--text-muted);padding:2px 8px;border-radius:10px;font-size:10px;">旧版</span>' : '';
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;font-weight:600;">' + v.v + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;color:var(--text-muted);">' + v.date + '</td>' +
      '<td style="padding:10px 8px;">' + statusBadge + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;">' + v.devices + ' 台</td>' +
      '<td style="padding:10px 8px;font-size:12px;color:var(--text-muted);">' + v.desc + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-firmware-tracker" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-tracker\').remove()">' +
    '<div class="modal" style="width:700px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📡</div><div><div style="font-size:15px;font-weight:700;">固件版本跟踪器</div><div style="font-size:11px;color:var(--text-muted);">查看所有设备的固件版本分布</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-tracker\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;background:var(--bg);display:flex;gap:20px;flex-shrink:0;">' +
    '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--blue);">27</div><div style="font-size:11px;color:var(--text-muted);">设备总数</div></div>' +
    '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--green);">12</div><div style="font-size:11px;color:var(--text-muted);">v3.2.1</div></div>' +
    '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--orange);">8</div><div style="font-size:11px;color:var(--text-muted);">v3.2.0</div></div>' +
    '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--text-light);">7</div><div style="font-size:11px;color:var(--text-muted);">旧版本</div></div></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px 16px;">' +
    '<table style="width:100%;border-collapse:collapse;">' +
    '<thead><tr style="border-bottom:2px solid var(--border);">' +
    '<th style="text-align:left;padding:8px;font-size:11px;font-weight:700;color:var(--text-muted);">版本</th>' +
    '<th style="text-align:left;padding:8px;font-size:11px;font-weight:700;color:var(--text-muted);">发布日期</th>' +
    '<th style="text-align:left;padding:8px;font-size:11px;font-weight:700;color:var(--text-muted);">状态</th>' +
    '<th style="text-align:left;padding:8px;font-size:11px;font-weight:700;color:var(--text-muted);">设备数</th>' +
    '<th style="text-align:left;padding:8px;font-size:11px;font-weight:700;color:var(--text-muted);">说明</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-tracker\').remove()">关闭</button>' +
    '<button class="modal-btn" onclick="openFirmwareOTAModal()" style="background:var(--green);color:white;border:none;">📦 批量升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 【改进5】openFirmwareAnalyzerModal - 固件版本分析器弹窗（UI按钮存在但函数缺失）
function openFirmwareAnalyzerModal() {
  var existing = document.getElementById('modal-firmware-analyzer');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-firmware-analyzer" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-analyzer\').remove()">' +
    '<div class="modal" style="width:580px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📡</div><div><div style="font-size:15px;font-weight:700;">固件版本分析器</div><div style="font-size:11px;color:var(--text-muted);">深度分析设备固件版本与兼容性</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">选择设备（可多选）</label>' +
    '<select class="form-select" id="fa-devices" multiple style="width:100%;height:100px;">' +
    '<option value="DEV-LK01">DEV-LK01 - v3.2.1（正常）</option>' +
    '<option value="DEV-LK02">DEV-LK02 - v3.2.0（建议升级）</option>' +
    '<option value="DEV-LK03">DEV-LK03 - v3.1.8（版本过旧）</option>' +
    '<option value="DEV-LK04">DEV-LK04 - v3.2.1（正常）</option>' +
    '<option value="DEV-LK05">DEV-LK05 - v3.1.5（版本过旧）</option></select></div>' +
    '<div class="form-group"><label class="form-label">分析维度</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 版本分布统计</label>' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 升级路径推荐</label>' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 兼容性风险评估</label>' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" style="accent-color:var(--blue);"> 固件包大小对比</label></div></div>' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-top:8px;font-size:12px;color:var(--blue);">📊 分析结果将显示版本分布、推荐升级路径及潜在兼容性风险</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-analyzer\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="runFirmwareAnalysis()" style="background:var(--blue);color:white;border:none;">🔍 开始分析</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function runFirmwareAnalysis() {
  var devicesSelect = document.getElementById('fa-devices');
  var selected = devicesSelect ? Array.from(devicesSelect.selectedOptions).map(function(o){ return o.value; }) : [];
  if (selected.length === 0) { showToast('请至少选择一个设备', 'error'); return; }
  document.getElementById('modal-firmware-analyzer') && document.getElementById('modal-firmware-analyzer').remove();
  showToast('🔍 正在分析 ' + selected.length + ' 台设备的固件版本...', 'info');
  setTimeout(function() {
    showToast('✅ 分析完成：2台建议升级，1台版本过旧需立即升级', 'success');
  }, 2000);
}
