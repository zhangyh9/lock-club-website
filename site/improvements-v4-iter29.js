// ============================================================
// 【物联后台 v4 第29轮】7个断裂函数一次性补全
// 本轮聚焦：cancelDeviceConfirm / cancelUnlock / batchExport / batchRestart / bmmSelectFloor / backBatchStep1 / backBatchStep2 / cancelAddWorkorderRule
// ============================================================

// ============================================================
// 【修复1】cancelDeviceConfirm() - 设备操作二次确认弹窗的"取消"按钮
// 理由：modal-device-confirm弹窗的✕和"取消"按钮调用cancelDeviceConfirm()但从未定义
// 改进：关闭弹窗并清除倒计时
// ============================================================
window.cancelDeviceConfirm = function() {
  var modal = document.getElementById('modal-device-confirm');
  if (modal) {
    modal.classList.add('hidden');
    // 清除可能存在的倒计时
    if (window._devConfirmTimer) {
      clearInterval(window._devConfirmTimer);
      window._devConfirmTimer = null;
    }
  }
  showToast('已取消设备操作', 'info');
};

// ============================================================
// 【修复2】cancelUnlock() - 远程开锁确认弹窗的"取消开锁"按钮
// 理由：modal-unlock弹窗的"取消开锁"按钮调用cancelUnlock()但从未定义
// 改进：关闭开锁弹窗并清除倒计时
// ============================================================
window.cancelUnlock = function() {
  var modal = document.getElementById('modal-unlock');
  if (modal) {
    modal.classList.add('hidden');
    // 清除可能存在的倒计时
    if (window._unlockTimer) {
      clearInterval(window._unlockTimer);
      window._unlockTimer = null;
    }
    // 重置开锁结果状态
    var resultFeedback = document.getElementById('unlock-result-feedback');
    var failFeedback = document.getElementById('unlock-fail-feedback');
    if (resultFeedback) resultFeedback.style.display = 'none';
    if (failFeedback) failFeedback.style.display = 'none';
  }
  showToast('已取消远程开锁', 'info');
};

// ============================================================
// 【修复3】batchExport() - 设备列表页批量导出按钮
// 理由：设备列表页的"📤 导出"按钮调用batchExport()但从未定义
// 改进：导出当前筛选后的设备列表为CSV文件
// ============================================================
window.batchExport = function() {
  // 收集当前设备列表数据
  var deviceData = window._deviceList || [];
  if (!deviceData || deviceData.length === 0) {
    showToast('当前无设备数据可导出', 'warning');
    return;
  }
  // 构建CSV内容
  var csv = '房间号,设备UUID,设备名称,电量,信号强度,固件版本,在线状态,最后同步时间\n';
  deviceData.forEach(function(d) {
    var status = d.online === false ? '离线' : '在线';
    var signal = d.signal || '--';
    var battery = d.battery !== undefined ? d.battery + '%' : '--';
    var firmware = d.firmware || '--';
    var lastSync = d.lastSync || '--';
    var room = d.room || '--';
    var name = d.name || '--';
    var uuid = d.uuid || d.id || '--';
    csv += '"' + room + '","' + uuid + '","' + name + '","' + battery + '","' + signal + '","' + firmware + '","' + status + '","' + lastSync + '"\n';
  });
  // 下载CSV
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  var ts = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = '设备列表_' + ts + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('📤 已导出 ' + deviceData.length + ' 条设备数据', 'success');
};

// ============================================================
// 【修复4】batchRestart() - 设备列表页批量重启按钮
// 理由：设备列表页的"🔁 批量重启"按钮调用batchRestart()但从未定义
// 改进：弹出设备选择确认框，批量发送重启指令
// ============================================================
window.batchRestart = function() {
  var deviceData = window._deviceList || [];
  var onlineDevices = deviceData.filter(function(d) { return d.online !== false; });
  if (onlineDevices.length === 0) {
    showToast('当前无在线设备可重启', 'warning');
    return;
  }
  var existing = document.getElementById('modal-batch-restart');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-batch-restart" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-restart\').remove()">' +
    '<div class="modal" style="width:460px;max-height:80vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:22px;">🔁</div>' +
    '<div style="font-size:16px;font-weight:700;">批量重启设备</div>' +
    '<button onclick="document.getElementById(\'modal-batch-restart\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    '<div style="padding:12px 16px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--orange);">' +
    '⚠️ 将向 <strong id="br-device-count">' + onlineDevices.length + '</strong> 台在线设备发送重启指令</div>' +
    '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;">';
  onlineDevices.slice(0, 10).forEach(function(d) {
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;">' +
      '<span style="color:var(--green);">🟢</span>' +
      '<span style="font-weight:600;">' + (d.room || '--') + '</span>' +
      '<span style="color:var(--text-muted);flex:1;">' + (d.name || '--') + '</span>' +
      '<span style="font-size:11px;color:var(--text-muted);">' + (d.uuid || '').substring(0, 8) + '...</span></div>';
  });
  if (onlineDevices.length > 10) {
    html += '<div style="text-align:center;font-size:12px;color:var(--text-muted);padding:8px;">另有 ' + (onlineDevices.length - 10) + ' 台设备...</div>';
  }
  html += '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-restart\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="confirmBatchRestart()" style="background:var(--orange);color:white;border:none;">🔁 确认重启（' + onlineDevices.length + '台）</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmBatchRestart = function() {
  var deviceData = window._deviceList || [];
  var onlineDevices = deviceData.filter(function(d) { return d.online !== false; });
  document.getElementById('modal-batch-restart') && document.getElementById('modal-batch-restart').remove();
  var count = onlineDevices.length;
  // 模拟批量重启结果
  var successCount = Math.floor(count * 0.9);
  var failCount = count - successCount;
  setTimeout(function() {
    showToast('🔁 批量重启指令已发送（' + successCount + '成功/' + failCount + '失败）', 'success');
  }, 800);
};

// ============================================================
// 【修复5】bmmSelectFloor() - 批量入住"选中同状态"按钮
// 理由：批量入住流程中"选中同状态"按钮调用bmmSelectFloor()但从未定义
// 改进：自动选中当前筛选条件下同楼层的所有空房
// ============================================================
window.bmmSelectFloor = function() {
  // 获取当前批量入住选中的楼层/状态
  var floorSelect = document.getElementById('bmm-floor-select');
  var statusSelect = document.getElementById('bmm-status-select');
  var selectedFloor = floorSelect ? floorSelect.value : '';
  var selectedStatus = statusSelect ? statusSelect.value : '';
  if (!selectedFloor && !selectedStatus) {
    showToast('请先选择楼层或状态进行筛选', 'warning');
    return;
  }
  var allCards = document.querySelectorAll('.room-card');
  var count = 0;
  allCards.forEach(function(card) {
    var cardFloor = card.getAttribute('data-floor') || '';
    var cardStatus = card.getAttribute('data-status') || '';
    var checkbox = card.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    var match = (!selectedFloor || cardFloor === selectedFloor) && (!selectedStatus || cardStatus === selectedStatus);
    if (match) {
      checkbox.checked = true;
      card.classList.add('selected');
      count++;
    }
  });
  showToast('已选中 ' + count + ' 间同状态房间', 'success');
};

// ============================================================
// 【修复6】backBatchStep1() - 批量入住第3步返回第1步
// 理由：批量入住从第3步（确认信息）返回到第1步（房间选择）
// 改进：重置流程步骤，显示第1步界面
// ============================================================
window.backBatchStep1 = function() {
  var step2 = document.getElementById('batch-checkin-step2');
  var step3 = document.getElementById('batch-checkin-step3');
  var step1 = document.getElementById('batch-checkin-step1');
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'none';
  if (step1) step1.style.display = '';
  // 清除第2步和第3步的数据
  var selectedRoomsEl = document.getElementById('batch-selected-rooms');
  if (selectedRoomsEl) selectedRoomsEl.innerHTML = '<span style="color:var(--text-muted);">尚未选择房间</span>';
  showToast('已返回房间选择步骤', 'info');
};

// ============================================================
// 【修复7】backBatchStep2() - 批量入住第3步返回第2步
// 理由：批量入住从第3步（确认信息）返回到第2步（填写信息）
// 改进：返回第2步，保留已填写的数据
// ============================================================
window.backBatchStep2 = function() {
  var step2 = document.getElementById('batch-checkin-step2');
  var step3 = document.getElementById('batch-checkin-step3');
  if (step2) step2.style.display = '';
  if (step3) step3.style.display = 'none';
  showToast('已返回信息填写步骤', 'info');
};

// ============================================================
// 【修复8】cancelAddWorkorderRule() - 工单自动派发规则添加表单的"取消"按钮
// 理由：工单自动派发规则弹窗的取消按钮调用cancelAddWorkorderRule()但函数断裂
// 改进：隐藏添加表单，清空所有输入字段
// ============================================================
window.cancelAddWorkorderRule = function() {
  var addForm = document.getElementById('wo-rule-add-form');
  if (addForm) {
    addForm.style.display = 'none';
    // 清空表单字段
    var fields = ['woar-type', 'woar-assign', 'woar-urgent'];
    fields.forEach(function(fid) {
      var el = document.getElementById(fid);
      if (el) el.value = '';
    });
    var statusEl = document.getElementById('woar-status');
    if (statusEl) statusEl.value = 'enabled';
  }
  showToast('已取消添加规则', 'info');
};
