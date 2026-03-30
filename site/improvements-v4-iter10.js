// ============================================================
// 【物联后台v4-第16轮】5个功能性断裂修复
// ============================================================
// 本轮修复清单：
// 改进1: resetInvoiceSearch() - 发票搜索重置按钮（发票页）
// 改进2: clearBatch() - 批量操作工具栏取消按钮（设备页）
// 改进3: clearBatchRooms() - 批量入住房间选择清空（批量入住页）
// 改进4: resetInvoiceForm() - 发票创建表单重置按钮
// 改进5: openAlertModal(idx) - 旧版告警处理（兼容openAlertModalV2）

// ============================================================
// 【改进1】resetInvoiceSearch() - 发票搜索重置
// 理由：发票管理页搜索栏的"重置"按钮调用resetInvoiceSearch()但从未定义，点击无响应
// 改进：清空所有筛选条件+日期范围+搜索框，重置统计计数
// ============================================================
window.resetInvoiceSearch = function() {
  var si = document.getElementById('inv-search-input');
  if (si) si.value = '';
  var sf = document.getElementById('inv-status-filter');
  if (sf) sf.value = 'all';
  var tf = document.getElementById('inv-type-filter');
  if (tf) tf.value = 'all';
  var df = document.getElementById('inv-date-from');
  if (df) df.value = '2026-03-01';
  var dt = document.getElementById('inv-date-to');
  if (dt) dt.value = '2026-03-27';
  if (typeof _invoiceCurrentSearch !== 'undefined') _invoiceCurrentSearch = '';
  if (typeof _invoiceCurrentStatusFilter !== 'undefined') _invoiceCurrentStatusFilter = 'all';
  if (typeof _invoiceCurrentTypeFilter !== 'undefined') _invoiceCurrentTypeFilter = 'all';
  if (typeof renderInvoiceFilteredList === 'function') {
    renderInvoiceFilteredList();
  } else if (typeof renderInvoiceTable === 'function') {
    renderInvoiceTable();
  }
  showToast('🔄 已重置发票筛选条件', 'info');
};

// ============================================================
// 【改进2】clearBatch() - 批量操作工具栏取消
// 理由：设备页面批量操作工具栏的"取消"按钮调用clearBatch()但从未定义，点击无响应
// 改进：隐藏批量工具栏，清空设备选择状态，更新页面遮罩
// ============================================================
window.clearBatch = function() {
  var toolbar = document.getElementById('batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
  if (typeof batchSelectedDevices !== 'undefined') {
    batchSelectedDevices = [];
  }
  if (typeof renderBatchDeviceList === 'function') {
    renderBatchDeviceList();
  }
  // Remove dim overlay from selected devices
  document.querySelectorAll('.batch-device-selected').forEach(function(el) {
    el.classList.remove('batch-device-selected');
    el.style.opacity = '';
  });
  showToast('已取消批量操作', 'info');
};

// ============================================================
// 【改进3】clearBatchRooms() - 批量入住房间选择清空
// 理由：批量入住页面房间选择区的"清空"按钮调用clearBatchRooms()但从未定义
// 改进：取消所有房间选中状态，更新已选数量显示，重置房间网格样式
// ============================================================
window.clearBatchRooms = function() {
  document.querySelectorAll('.batch-room-chip.selected').forEach(function(chip) {
    chip.classList.remove('selected');
    chip.style.background = '';
    chip.style.borderColor = '';
    chip.style.color = '';
  });
  var countEl = document.getElementById('batch-room-count');
  if (countEl) countEl.textContent = '0';
  if (typeof _bciSelectedRooms !== 'undefined') {
    _bciSelectedRooms = [];
  }
  showToast('🏠 已清空已选房间', 'info');
};

// ============================================================
// 【改进4】resetInvoiceForm() - 发票创建表单重置
// 理由：发票创建弹窗的"重置表单"按钮调用resetInvoiceForm()但从未定义
// 改进：清空表单所有字段，重置下拉选项，恢复默认值
// ============================================================
window.resetInvoiceForm = function() {
  var fields = [
    'inv-f-company', 'inv-f-email', 'inv-f-tax', 'inv-f-amount',
    'inv-create-note'
  ];
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = '';
      }
    }
  });
  var typeSelect = document.getElementById('inv-f-type');
  if (typeSelect) typeSelect.selectedIndex = 0;
  var roomSelect = document.getElementById('inv-f-room');
  if (roomSelect) roomSelect.selectedIndex = 0;
  var guestSelect = document.getElementById('inv-quick-guest');
  if (guestSelect) guestSelect.selectedIndex = 0;
  var statusEl = document.getElementById('inv-form-status');
  if (statusEl) statusEl.textContent = '表单已重置';
  showToast('🔄 发票表单已重置', 'info');
};

// ============================================================
// 【改进5】openAlertModal(idx) - 旧版告警处理弹窗
// 理由：告警列表部分行使用openAlertModal(idx)，但该函数从未定义（仅openAlertModalV2有定义）
// 改进：兼容旧调用方式，若idx在范围内则调用openAlertModalV2，否则显示通用告警详情
// ============================================================
window.openAlertModal = function(idx) {
  // 优先使用新版V2函数（已在iter9中定义）
  if (typeof openAlertModalV2 === 'function') {
    openAlertModalV2(idx);
    return;
  }
  // 兜底：通用告警详情弹窗
  var alertList = document.querySelectorAll('#alert-table-body tr');
  if (!alertList || idx >= alertList.length) {
    showToast('未找到告警记录 #' + idx, 'error');
    return;
  }
  var row = alertList[idx];
  var cells = row.querySelectorAll('td');
  if (!cells || cells.length < 4) {
    showToast('告警数据不完整', 'error');
    return;
  }
  var alertType = cells[0] ? cells[0].textContent.trim() : '未知告警';
  var alertRoom = cells[1] ? cells[1].textContent.trim() : '--';
  var alertTime = cells[2] ? cells[2].textContent.trim() : '--';
  var alertStatus = cells[3] ? cells[3].textContent.trim() : '待处理';

  var existing = document.getElementById('modal-alert-generic');
  if (existing) existing.remove();

  var statusColor = alertStatus.indexOf('已处理') >= 0 || alertStatus.indexOf('恢复') >= 0
    ? 'var(--green)' : 'var(--orange)';

  var html = '<div class="modal-overlay hidden" id="modal-alert-generic" ' +
    'style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);' +
    'display:flex;align-items:center;justify-content:center;z-index:99999;" ' +
    'onclick="if(event.target===this)document.getElementById(\'modal-alert-generic\').remove()">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;max-height:90vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="width:44px;height:44px;background:var(--red-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">⚠️</div>' +
    '<div><div style="font-size:15px;font-weight:700;">告警详情</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">#' + idx + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-alert-generic\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">告警类型</div><div style="font-size:13px;font-weight:600;">' + alertType + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">关联房间</div><div style="font-size:13px;font-weight:600;">' + alertRoom + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">告警时间</div><div style="font-size:13px;font-weight:600;">' + alertTime + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">当前状态</div><div style="font-size:13px;font-weight:600;color:' + statusColor + ';">' + alertStatus + '</div></div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">' +
    '💡 提示：此为旧版告警格式，建议在告警列表中刷新获取最新数据</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-alert-generic\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button>' +
    '<button onclick="if(typeof handleAlertAction===\'function\')handleAlertAction(' + idx + ',\'resolved\');document.getElementById(\'modal-alert-generic\').remove();showToast(\'✅ 告警已处理\',\'success\');" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 标记已处理</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};
