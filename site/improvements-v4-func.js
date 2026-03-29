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
