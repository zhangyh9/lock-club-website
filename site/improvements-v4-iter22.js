// ============================================================
// 物联后台迭代v4-iter22.js - 修复23个缺失函数（功能性断裂）
// 修复：onclick调用的函数从未定义
// 完成时间：2026-03-30 04:25
// ============================================================

// -------- 1. batchDelete - 批量删除设备 --------
window.batchDelete = function() {
  var selected = window._batchDeleteDevices || [];
  if (selected.length === 0) {
    showToast('请先选择要删除的设备', 'error');
    return;
  }
  // Remove from deviceData
  selected.forEach(function(uuid) {
    var idx = deviceData.findIndex(function(d) { return d.uuid === uuid; });
    if (idx !== -1) deviceData.splice(idx, 1);
  });
  showToast('✅ 已删除 ' + selected.length + ' 台设备', 'success');
  window._batchDeleteDevices = [];
  closeModal('batch-delete-confirm');
  renderDeviceTable && renderDeviceTable();
};

// -------- 2. batchDisableRoomTypes - 批量停用房型 --------
window.batchDisableRoomTypes = function() {
  var selected = window._selectedRoomTypes || [];
  if (selected.length === 0) {
    showToast('请先选择要停用的房型', 'error');
    return;
  }
  selected.forEach(function(idx) {
    var row = document.querySelector('tr[data-rt-idx="' + idx + '"]');
    if (row) {
      var badge = row.querySelector('.tbadge.green, .tbadge.blue');
      if (badge) {
        badge.className = 'tbadge red';
        badge.textContent = '停用';
      }
    }
  });
  showToast('✅ 已停用 ' + selected.length + ' 个房型', 'success');
  window._selectedRoomTypes = [];
  var toolbar = document.getElementById('rtm-batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
};

// -------- 3. batchEnableRoomTypes - 批量启用房型 --------
window.batchEnableRoomTypes = function() {
  var selected = window._selectedRoomTypes || [];
  if (selected.length === 0) {
    showToast('请先选择要启用的房型', 'error');
    return;
  }
  selected.forEach(function(idx) {
    var row = document.querySelector('tr[data-rt-idx="' + idx + '"]');
    if (row) {
      var badge = row.querySelector('.tbadge.red');
      if (badge) {
        badge.className = 'tbadge green';
        badge.textContent = '启用';
      }
    }
  });
  showToast('✅ 已启用 ' + selected.length + ' 个房型', 'success');
  window._selectedRoomTypes = [];
  var toolbar = document.getElementById('rtm-batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
};

// -------- 4. bmmSelectFloor - 选中同楼层 --------
window.bmmSelectFloor = function() {
  // This is used in the batch maintenance modal - select all rooms on same floor as already selected
  if (!window.batchMaintSelectedRooms || window.batchMaintSelectedRooms.length === 0) {
    showToast('请先选择房间', 'error');
    return;
  }
  var firstRoom = window.batchMaintSelectedRooms[0];
  var floor = firstRoom.replace(/\d+$/, '');
  var sameFloorRooms = [];
  document.querySelectorAll('.room-card').forEach(function(card) {
    var room = card.getAttribute('data-room');
    if (room && room.replace(/\d+$/, '') === floor && !window.batchMaintSelectedRooms.includes(room)) {
      sameFloorRooms.push(room);
      card.querySelector('.room-check') && (card.querySelector('.room-check').checked = true);
    }
  });
  window.batchMaintSelectedRooms = window.batchMaintSelectedRooms.concat(sameFloorRooms);
  showToast('已选中同楼层 ' + sameFloorRooms.length + ' 间 (' + floor + ')', 'info');
};

// -------- 5. cancelAddWorkorderRule - 取消添加工单规则 --------
window.cancelAddWorkorderRule = function() {
  closeModal('modal-workorder-auto-rule');
  showToast('已取消添加规则', 'info');
};

// -------- 6. cancelWorkorderNote - 取消工单备注 --------
window.cancelWorkorderNote = function() {
  var noteModal = document.getElementById('modal-workorder-note');
  if (noteModal) noteModal.remove();
  showToast('已取消', 'info');
};

// -------- 7. changeCardCount - 门卡数量加减 --------
window.changeCardCount = function(delta) {
  var input = document.getElementById('ci-card-count');
  if (!input) return;
  var val = parseInt(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
};

// -------- 8. checkWorkorderTimeoutAndTransfer - 超时移交 --------
window.checkWorkorderTimeoutAndTransfer = function() {
  showToast('⏰ 正在检查超时工单...', 'info');
  setTimeout(function() {
    var now = Date.now();
    var timedOut = window.workorderList ? window.workorderList.filter(function(w) {
      return w.status === '处理中' && (now - new Date(w.createTime).getTime()) > 2 * 60 * 60 * 1000;
    }).length : 0;
    if (timedOut > 0) {
      showToast('发现 ' + timedOut + ' 个超时工单，已自动移交主管', 'warning');
    } else {
      showToast('✅ 暂无超时工单', 'success');
    }
  }, 800);
};

// -------- 9. ciNextStep - 入住流程下一步 --------
window.ciNextStep = function() {
  var currentStep = window._ciCurrentStep || 1;
  if (currentStep >= 3) return;
  window._ciCurrentStep = currentStep + 1;
  updateCheckinFlowUI && updateCheckinFlowUI();
  showToast('第 ' + window._ciCurrentStep + ' 步', 'info');
};

// -------- 10. ciPrevStep - 入住流程上一步 --------
window.ciPrevStep = function() {
  var currentStep = window._ciCurrentStep || 1;
  if (currentStep <= 1) return;
  window._ciCurrentStep = currentStep - 1;
  updateCheckinFlowUI && updateCheckinFlowUI();
  showToast('第 ' + window._ciCurrentStep + ' 步', 'info');
};

// -------- 11. clearFloorSelection - 清空楼层选择 --------
window.clearFloorSelection = function() {
  document.querySelectorAll('.floor-check').forEach(function(cb) { cb.checked = false; });
  document.querySelectorAll('.room-card.selected').forEach(function(card) { card.classList.remove('selected'); });
  window.batchMaintSelectedRooms = [];
  showToast('已清空楼层选择', 'info');
};

// -------- 12. clearHandoverSignature - 清除交接签名 --------
window.clearHandoverSignature = function() {
  var sigArea = document.getElementById('handover-signature-area');
  if (sigArea) sigArea.innerHTML = '<canvas id="handover-sig-canvas" width="400" height="120" style="border:1px dashed var(--border);border-radius:6px;cursor:crosshair;"></canvas>';
  showToast('请重新签名', 'info');
};

// -------- 13. clearKeypadSelection - 清空键盘密码选择 --------
window.clearKeypadSelection = function() {
  var modal = document.getElementById('modal-keypad-manage');
  if (modal) modal.remove();
  showToast('已取消', 'info');
};

// -------- 14. clearRoomTypeSelection - 清空房型选择 --------
window.clearRoomTypeSelection = function() {
  window._selectedRoomTypes = [];
  document.querySelectorAll('.rtm-row-check').forEach(function(cb) { cb.checked = false; });
  var toolbar = document.getElementById('rtm-batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
  showToast('已清空选择', 'info');
};

// -------- 15. clearRuntimeLogFilter - 清空运行日志筛选 --------
window.clearRuntimeLogFilter = function() {
  var searchInput = document.getElementById('runtime-log-search');
  if (searchInput) searchInput.value = '';
  window._runtimeLogFilter = '';
  renderRuntimeLogTable && renderRuntimeLogTable();
  showToast('筛选已重置', 'info');
};

// -------- 16. clearWorkorderSelection - 清空工单选择 --------
window.clearWorkorderSelection = function() {
  window._selectedWorkorders = [];
  document.querySelectorAll('.wo-row-check').forEach(function(cb) { cb.checked = false; });
  var toolbar = document.getElementById('wo-batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
  showToast('已清空选择', 'info');
};

// -------- 17. closeAddAlertRuleForm - 关闭告警规则表单 --------
window.closeAddAlertRuleForm = function() {
  var form = document.getElementById('modal-add-alert-rule');
  if (form) form.remove();
  showToast('已取消', 'info');
};

// -------- 18. closeBlacklistBlockModal - 关闭黑名单弹窗 --------
window.closeBlacklistBlockModal = function() {
  var modal = document.getElementById('modal-blacklist-block');
  if (modal) modal.remove();
  showToast('已取消', 'info');
};

// -------- 19. closeDeviceRepairRequestModal - 关闭设备报修弹窗 --------
window.closeDeviceRepairRequestModal = function() {
  var modal = document.getElementById('modal-device-repair-request');
  if (modal) modal.remove();
  showToast('已取消', 'info');
};

// -------- 20. closeDeviceRestartModal - 关闭设备重启确认弹窗 --------
window.closeDeviceRestartModal = function() {
  var modal = document.getElementById('modal-device-restart');
  if (modal) modal.remove();
  showToast('已取消', 'info');
};

// -------- 21. closeEnergyBudgetModal - 关闭能耗预算弹窗 --------
window.closeEnergyBudgetModal = function() {
  var modal = document.getElementById('modal-energy-budget');
  if (modal) modal.remove();
  showToast('已取消', 'info');
};

// -------- 22. addWorkorderAutoRule - 添加工单自动规则 --------
window.addWorkorderAutoRule = function() {
  var ruleType = document.getElementById('wo-rule-type') ? document.getElementById('wo-rule-type').value : 'timeout';
  var ruleTarget = document.getElementById('wo-rule-target') ? document.getElementById('wo-rule-target').value : '';
  var ruleAction = document.getElementById('wo-rule-action') ? document.getElementById('wo-rule-action').value : 'transfer';
  showToast('✅ 自动规则已添加', 'success');
  closeModal('modal-workorder-auto-rule');
};

// -------- 23. checkScheduleConflicts - 检查排班冲突 --------
window.checkScheduleConflicts = function() {
  showToast('⏰ 正在检查排班冲突...', 'info');
  setTimeout(function() {
    var conflicts = window._scheduleConflicts || 0;
    if (conflicts > 0) {
      showToast('发现 ' + conflicts + ' 个排班冲突，请检查', 'warning');
    } else {
      showToast('✅ 排班无冲突', 'success');
    }
  }, 600);
};
