// ============================================================
// 物联后台迭代v4-iter18.js - 5个功能性断裂修复
// 修复：onclick调用存在但函数体缺失
// ============================================================

// ============================================================
// 【改进1】backBatchStep1 / backBatchStep2 - 批量入住向导返回
// 理由：批量入住3步向导（房间选择→信息填写→确认提交），点"返回"按钮报错
// 业务逻辑：批量入住向导返回上一步
// ============================================================
window.backBatchStep1 = function() {
  var step2 = document.getElementById('batch-step-2');
  var step1 = document.getElementById('batch-step-1');
  if (step2) step2.style.display = 'none';
  if (step1) step1.style.display = '';
  showToast('已返回房间选择步骤', 'info');
};

window.backBatchStep2 = function() {
  var step3 = document.getElementById('batch-step-3');
  var step2 = document.getElementById('batch-step-2');
  if (step3) step3.style.display = 'none';
  if (step2) step2.style.display = '';
  showToast('已返回信息填写步骤', 'info');
};

// ============================================================
// 【改进2】batchExport - 批量设备导出CSV
// 理由：设备批量操作工具栏有"导出"按钮，但函数体缺失
// 业务逻辑：导出已选设备列表为CSV文件
// ============================================================
window.batchExport = function() {
  var selected = window._selectedDevices || [];
  if (selected.length === 0) {
    showToast('请先选择要导出的设备', 'warning');
    return;
  }
  var csv = 'UUID,房间号,设备类型,型号,固件版本,状态,最后在线时间\n';
  selected.forEach(function(d) {
    csv += d.uuid + ',' + (d.room || '-') + ',' + (d.type || '-') + ',' + (d.model || '-') + ',' + (d.fw || '-') + ',' + (d.online ? '在线' : '离线') + ',' + (d.lastSeen || '-') + '\n';
  });
  var blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '批量设备导出_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 已导出 ' + selected.length + ' 台设备', 'success');
};

// ============================================================
// 【改进3】batchRestart - 批量重启设备
// 理由：设备批量操作工具栏有"批量重启"按钮，但函数体缺失
// 业务逻辑：模拟批量重启已选中的设备，显示进度和结果
// ============================================================
window.batchRestart = function() {
  var selected = window._selectedDevices || [];
  if (selected.length === 0) {
    showToast('请先选择要重启的设备', 'warning');
    return;
  }
  var existing = document.getElementById('modal-batch-restart');
  if (existing) existing.remove();
  var html = '<div id="modal-batch-restart" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-restart\').remove()">' +
    '<div class="modal" style="width:500px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">🔁 批量重启设备</div>' +
    '<button onclick="document.getElementById(\'modal-batch-restart\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--orange-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--orange);">⚠️ 将重启 <strong id="br-count">' + selected.length + '</strong> 台设备，请确保设备当前无重要任务。</div>' +
    '<div id="br-progress-list" style="max-height:200px;overflow-y:auto;"></div></div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-restart\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button>' +
    '<button onclick="startBatchRestart()" id="br-start-btn" class="modal-btn primary" style="padding:8px 20px;background:var(--orange);color:white;border:none;">🚀 开始重启</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  var list = document.getElementById('br-progress-list');
  if (list) {
    list.innerHTML = selected.map(function(d) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">' +
        '<span style="font-weight:600;">' + d.uuid + '</span><span style="color:var(--text-muted);font-size:12px;">' + (d.room || '-') + '</span><span id="br-status-' + d.uuid.replace(/[^a-zA-Z0-9]/g,'') + '" style="color:var(--blue);font-size:12px;">⏳ 等待</span></div>';
    }).join('');
  }
};

window.startBatchRestart = function() {
  var selected = window._selectedDevices || [];
  var btn = document.getElementById('br-start-btn');
  if (btn) btn.disabled = true;
  var done = 0;
  var total = selected.length;
  selected.forEach(function(d, i) {
    var id = 'br-status-' + d.uuid.replace(/[^a-zA-Z0-9]/g, '');
    var el = document.getElementById(id);
    setTimeout(function() {
      if (el) { el.textContent = '🔄 重启中'; el.style.color = 'var(--orange)'; }
      setTimeout(function() {
        if (el) { el.textContent = '✅ 已重启'; el.style.color = 'var(--green)'; }
        done++;
        if (done === total) {
          if (btn) { btn.textContent = '✅ 全部完成'; btn.style.background = 'var(--green)'; }
          showToast('🔁 ' + total + ' 台设备已全部重启', 'success');
        }
      }, 1000 + Math.random() * 500);
    }, i * 300);
  });
};

// ============================================================
// 【改进4】applyOplogFilterV2 - 操作日志高级筛选应用
// 理由：操作日志页面有高级筛选按钮，但applyOplogFilterV2函数缺失
// 业务逻辑：应用操作日志高级筛选条件，刷新列表
// ============================================================
window.applyOplogFilterV2 = function() {
  // Read filter values from DOM elements and re-render
  if (typeof renderOplogTable === 'function') {
    renderOplogTable();
  }
  var module = document.getElementById('oplog-module-filter');
  var action = document.getElementById('oplog-action-filter');
  var operator = document.getElementById('oplog-operator-filter');
  var dateFrom = document.getElementById('oplog-date-from');
  var dateTo = document.getElementById('oplog-date-to');
  var hasFilter = (module && module.value !== 'all') || (action && action.value !== 'all') ||
    (operator && operator.value.trim() !== '') || (dateFrom && dateFrom.value !== '') || (dateTo && dateTo.value !== '');
  showToast('🔍 ' + (hasFilter ? '已应用筛选条件' : '已清除筛选条件'), 'info');
};

// ============================================================
// 【改进5】cancelDeleteBuilding - 取消删除楼栋
// 理由：楼栋删除确认弹窗有"取消"按钮，但cancelDeleteBuilding函数缺失
// 业务逻辑：关闭楼栋删除确认弹窗，无任何操作
// ============================================================
window.cancelDeleteBuilding = function() {
  var modal = document.getElementById('modal-building-delete-confirm');
  if (modal) modal.remove();
  showToast('已取消删除操作', 'info');
};
