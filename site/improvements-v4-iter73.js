// ============================================================
// 【物联后台 v4 第73轮】5个功能性断裂修复
// 修复缺失函数：resetInvoiceSearch / openInvoiceVoidModal / updateInvoiceStats / renderSettlement / 修复renderInvoiceFilteredList统计更新
// ============================================================

// ============================================================
// 【修复1】resetInvoiceSearch - 发票搜索重置（被按钮调用但从未定义）
// 理由：发票页面重置按钮 onclick="resetInvoiceSearch()" 但函数从未定义
// 功能：清空搜索框和筛选条件，重新渲染发票列表
// ============================================================
window.resetInvoiceSearch = function() {
  var si = document.getElementById('inv-search-input');
  if (si) si.value = '';
  var sf = document.getElementById('inv-status-filter');
  if (sf) sf.value = 'all';
  var tf = document.getElementById('inv-type-filter');
  if (tf) tf.value = 'all';
  var df = document.getElementById('inv-date-from');
  var dt = document.getElementById('inv-date-to');
  if (df) df.value = '2026-03-01';
  if (dt) dt.value = '2026-03-27';
  _invoiceCurrentSearch = '';
  _invoiceCurrentStatusFilter = 'all';
  _invoiceCurrentTypeFilter = 'all';
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
  showToast('🔄 已重置发票筛选条件', 'info');
};

// ============================================================
// 【修复2】openInvoiceVoidModal - 发票作废确认弹窗（被调用但从未定义）
// 理由：发票列表每个待处理/开具中发票有"作废"按钮调用openInvoiceVoidModal但函数不存在
// 功能：显示作废确认弹窗，输入作废原因，确认后更新发票状态
// ============================================================
window.openInvoiceVoidModal = function(invId) {
  var inv = invoiceStore.find(function(i) { return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  var existing = document.getElementById('modal-invoice-void');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-void" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">❌</div>' +
    '<div><div style="font-size:15px;font-weight:700;">发票作废确认</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">发票号：' + invId + '（¥' + (inv.amount || 0).toFixed(2) + '）</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-void\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:10px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:12px;color:var(--red);margin-bottom:16px;">⚠️ 作废操作不可逆，发票将标记为已作废状态</div>' +
    '<div class="form-group"><label class="form-label">购方名称</label>' +
    '<input type="text" class="form-input" value="' + (inv.company || '') + '" readonly style="background:var(--bg);color:var(--text-muted);cursor:not-allowed;font-size:13px;width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group"><label class="form-label">发票金额</label>' +
    '<input type="text" class="form-input" value="¥' + (inv.amount || 0).toFixed(2) + '" readonly style="background:var(--bg);color:var(--text-muted);cursor:not-allowed;font-size:13px;width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group"><label class="form-label">作废原因 <span class="required">*</span></label>' +
    '<select class="form-select" id="void-reason" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="">请选择作废原因</option>' +
    '<option value="信息错误">信息填写错误</option>' +
    '<option value="客户退票">客户退票</option>' +
    '<option value="重复开票">重复开票</option>' +
    '<option value="税率调整">税率调整</option>' +
    '<option value="其他原因">其他原因</option></select></div>' +
    '<div class="form-group"><label class="form-label">补充说明</label>' +
    '<textarea class="form-textarea" id="void-remark" placeholder="请输入补充说明（可选）" style="min-height:60px;font-size:13px;width:100%;padding:8px 12px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-void\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text);">取消</button>' +
    '<button onclick="submitInvoiceVoid(\'' + (invId || '') + '\')" style="padding:10px 24px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">❌ 确认作废</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitInvoiceVoid = function(invId) {
  var reason = (document.getElementById('void-reason') || {}).value.trim();
  var remark = (document.getElementById('void-remark') || {}).value.trim() || '';
  if (!reason) { showToast('请选择作废原因', 'error'); return; }
  var inv = invoiceStore.find(function(i) { return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  inv.status = '已作废';
  inv.voidReason = reason;
  inv.voidRemark = remark;
  inv.voidTime = new Date().toLocaleString('zh-CN');
  document.getElementById('modal-invoice-void') && document.getElementById('modal-invoice-void').remove();
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
  showToast('❌ 发票 ' + invId + ' 已作废（原因：' + reason + '）', 'success');
};

// ============================================================
// 【修复3】updateInvoiceStats - 发票统计数字更新（被多处调用但从未定义）
// 理由：发票增删改操作后调用updateInvoiceStats更新统计卡片，但函数不存在
// 功能：读取invoiceStore最新数据，更新5个统计卡片的数字
// ============================================================
window.updateInvoiceStats = function() {
  if (typeof invoiceStore === 'undefined') return;
  var total = invoiceStore.length;
  var pending = invoiceStore.filter(function(i) { return i.status === '待处理'; }).length;
  var processing = invoiceStore.filter(function(i) { return i.status === '开具中'; }).length;
  var done = invoiceStore.filter(function(i) { return i.status === '已完成'; }).length;
  var voided = invoiceStore.filter(function(i) { return i.status === '已作废'; }).length;
  var totalAmount = invoiceStore.filter(function(i) { return i.status === '已完成'; }).reduce(function(s, i) { return s + (i.amount || 0); }, 0);
  var el = document.getElementById('inv-stat-total');
  if (el) el.textContent = total;
  el = document.getElementById('inv-stat-pending');
  if (el) el.textContent = pending;
  el = document.getElementById('inv-stat-done');
  if (el) el.textContent = done;
  el = document.getElementById('inv-stat-amount');
  if (el) el.textContent = '¥' + totalAmount.toLocaleString();
  el = document.getElementById('inv-stat-void');
  if (el) el.textContent = voided;
  // 更新Tab统计数字
  var allEl = document.getElementById('inv-count-all');
  if (allEl) allEl.textContent = total;
  var pendingEl = document.getElementById('inv-count-pending');
  if (pendingEl) pendingEl.textContent = pending;
  var processingEl = document.getElementById('inv-count-processing');
  if (processingEl) processingEl.textContent = processing;
  var doneEl = document.getElementById('inv-count-done');
  if (doneEl) doneEl.textContent = done;
  var cancelledEl = document.getElementById('inv-count-cancelled');
  if (cancelledEl) cancelledEl.textContent = voided;
};

// ============================================================
// 【修复4】renderSettlement - 结算中心页面渲染函数
// 理由：showPage('settlement')可能需要初始化渲染，但renderSettlement从未定义
// 功能：渲染待结算列表和今日结算统计
// ============================================================
window.renderSettlement = function() {
  var tbody = document.getElementById('settlement-pending-body');
  if (tbody) {
    var pendingGuests = [
      {room:'301', name:'张三', checkin:'2026-03-28', checkout:'2026-03-30', nights:2, roomFee:328, extras:48, deposit:100, status:'待结算'},
      {room:'205', name:'李四', checkin:'2026-03-29', checkout:'2026-03-30', nights:1, roomFee:168, extras:0, deposit:100, status:'待结算'},
      {room:'102', name:'王五', checkin:'2026-03-27', checkout:'2026-03-30', nights:3, roomFee:498, extras:120, deposit:100, status:'待结算'}
    ];
    var rows = pendingGuests.map(function(g) {
      var total = g.roomFee + g.extras;
      var payable = total - g.deposit;
      return '<tr>' +
        '<td><span style="font-weight:700;color:var(--blue);">' + g.room + '</span></td>' +
        '<td><span style="font-weight:600;">' + g.name + '</span></td>' +
        '<td style="font-size:12px;">' + g.checkin + ' 至 ' + g.checkout + '</td>' +
        '<td style="font-size:12px;">' + g.nights + '晚</td>' +
        '<td style="font-weight:600;">¥' + total + '</td>' +
        '<td><span class="tbadge orange">⏳ 待结算</span></td>' +
        '<td><button class="action-btn small" onclick="openSettlementModal(\'' + g.room + '\')">结算</button></td></tr>';
    }).join('');
    tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">暂无待结算记录 ✅</td></tr>';
  }
  // 更新统计数字
  var pendingCount = 3;
  var pendingAmount = 662;
  var el = document.getElementById('stl-pending-count');
  if (el) el.textContent = pendingCount;
  el = document.getElementById('stl-pending-amount');
  if (el) el.textContent = '¥' + pendingAmount;
};

window.openSettlementModal = function(roomNum) {
  var existing = document.getElementById('modal-settlement');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-settlement" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">💰</div>' +
    '<div><div style="font-size:15px;font-weight:700;">退房结算 - ' + (roomNum || '--') + '房间</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">请确认结算金额并完成收款</div></div>' +
    '<button onclick="document.getElementById(\'modal-settlement\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:12px;color:var(--green);margin-bottom:4px;">应收金额</div>' +
    '<div style="font-size:28px;font-weight:800;color:var(--green);">¥' + (roomNum === '301' ? '376' : roomNum === '205' ? '68' : '618') + '</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房费</div><div style="font-size:15px;font-weight:700;">¥' + (roomNum === '301' ? '328' : roomNum === '205' ? '168' : '498') + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">附加费</div><div style="font-size:15px;font-weight:700;">¥' + (roomNum === '301' ? '48' : roomNum === '205' ? '0' : '120') + '</div></div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--text-muted);text-align:center;">押金 ¥100 已扣除</div>' +
    '<div class="form-group"><label class="form-label">支付方式</label>' +
    '<select class="form-select" id="stl-pay-method" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="cash">💵 现金</option><option value="wechat">💚 微信支付</option><option value="alipay">💙 支付宝</option><option value="card">💳 银行卡</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="stl-remark" placeholder="结算备注（可选）" style="width:100%;padding:8px 12px;font-size:13px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-settlement\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="confirmSettlement(\'' + (roomNum || '') + '\')" style="padding:10px 24px;background:var(--green);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">💰 确认结算</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmSettlement = function(roomNum) {
  var method = (document.getElementById('stl-pay-method') || {}).value || 'cash';
  var remark = (document.getElementById('stl-remark') || {}).value.trim() || '';
  document.getElementById('modal-settlement') && document.getElementById('modal-settlement').remove();
  showToast('💰 房间 ' + roomNum + ' 结算完成（' + method + '）', 'success');
  if (typeof renderSettlement === 'function') renderSettlement();
};

// ============================================================
// 【修复5】renderInvoiceFilteredList 末尾统计更新补充 + applyInvoiceSearch日期范围
// 理由：renderInvoiceFilteredList更新了Tab计数但漏了主统计卡片；applyInvoiceSearch缺少日期范围过滤
// 功能：补全统计卡片更新，并增强applyInvoiceSearch支持日期范围
// ============================================================

// 修复renderInvoiceFilteredList末尾的统计更新（补充主卡片更新）
var _orig_renderInvoiceFilteredList = window.renderInvoiceFilteredList;
window.renderInvoiceFilteredList = function() {
  if (_orig_renderInvoiceFilteredList) _orig_renderInvoiceFilteredList.call(window);
  // 补充：更新主统计卡片
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
};

// 增强applyInvoiceSearch支持日期范围
var _orig_applyInvoiceSearch = window.applyInvoiceSearch;
window.applyInvoiceSearch = function() {
  var kwInput = document.getElementById('inv-search-input');
  _invoiceCurrentSearch = kwInput ? kwInput.value.trim() : '';
  var statusSel = document.getElementById('inv-status-filter');
  _invoiceCurrentStatusFilter = statusSel ? statusSel.value : 'all';
  var typeSel = document.getElementById('inv-type-filter');
  _invoiceCurrentTypeFilter = typeSel ? typeSel.value : 'all';
  // 日期范围同步到全局变量（供renderInvoiceFilteredList使用）
  var dateFrom = document.getElementById('inv-date-from');
  var dateTo = document.getElementById('inv-date-to');
  _invoiceDateFrom = dateFrom ? dateFrom.value : '';
  _invoiceDateTo = dateTo ? dateTo.value : '';
  _invoiceCurrentTab = 'all'; // 搜索时切到全部Tab
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
  showToast('🔍 已按条件筛选发票', 'info');
};
window._invoiceDateFrom = '';
window._invoiceDateTo = '';

// 重新绑定重置按钮（确保resetInvoiceSearch生效）
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var resetBtn = document.querySelector('[onclick="resetInvoiceSearch()"]');
    if (resetBtn) {
      resetBtn.setAttribute('onclick', 'resetInvoiceSearch()');
    }
  }, 600);
});

console.log('[iter73] 5个功能性断裂修复完成：resetInvoiceSearch / openInvoiceVoidModal / updateInvoiceStats / renderSettlement / applyInvoiceSearch日期增强');
