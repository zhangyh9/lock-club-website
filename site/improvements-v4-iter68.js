// ============================================================
// 【物联后台v4-第68轮】5个关键缺失函数修复
// 修复日期：2026-03-30
// 本轮修复：confirmSync | cancelDeviceConfirm | batchDelete | switchDashboardView | openChangeRoomModal
// ============================================================

// ============================================================
// 【改进1】设备同步确认（confirmSync）
// 理由：设备同步弹窗"确认同步"按钮 onclick="confirmSync()" 从未定义
// 业务逻辑：点击后显示同步中状态，2秒后模拟同步完成，Toast反馈
// ============================================================
window.confirmSync = function() {
  var syncModal = document.getElementById('modal-sync');
  if (!syncModal) {
    // Try generic close
    closeModal('sync');
    return;
  }
  // Find the modal and show loading state
  var modalBody = syncModal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = '<div style="text-align:center;padding:32px 0;">' +
      '<div style="font-size:48px;margin-bottom:16px;animation:spin 1s linear infinite;">🔄</div>' +
      '<div style="font-size:15px;font-weight:600;margin-bottom:8px;">正在同步设备数据...</div>' +
      '<div style="font-size:12px;color:var(--text-muted);">预计需要10-30秒，请稍候</div>' +
      '<div style="height:4px;background:var(--border);border-radius:2px;margin-top:16px;overflow:hidden;">' +
      '<div style="height:100%;width:30%;background:var(--blue);border-radius:2px;animation:loadingBar 2s ease-in-out infinite;"></div></div>' +
      '</div>';
  }
  
  // Add animation style if not exists
  if (!document.getElementById('sync-anim-style')) {
    var style = document.createElement('style');
    style.id = 'sync-anim-style';
    style.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes loadingBar{0%{width:0%}50%{width:70%}100%{width:100%}}';
    document.head.appendChild(style);
  }
  
  // Close modal after sync completes
  setTimeout(function() {
    closeModal('sync');
    showToast('✅ 设备数据同步完成，最新状态已刷新', 'success');
  }, 2500);
};

// ============================================================
// 【改进2】设备操作确认弹窗关闭（cancelDeviceConfirm）
// 理由：设备操作确认弹窗（重启/同步/固件升级）的取消按钮 onclick="cancelDeviceConfirm()" 从未定义
// 业务逻辑：关闭确认弹窗，清除倒计时状态
// ============================================================
window.cancelDeviceConfirm = function() {
  var modal = document.getElementById('modal-device-confirm');
  if (modal) {
    modal.classList.add('hidden');
  }
  // Also close unlock modal if open
  var unlockModal = document.getElementById('modal-unlock');
  if (unlockModal) {
    unlockModal.classList.add('hidden');
  }
  // Reset countdown if running
  if (window._devConfirmTimer) {
    clearInterval(window._devConfirmTimer);
    window._devConfirmTimer = null;
  }
  // Reset confirm button
  var btn = document.getElementById('dev-confirm-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = '确认执行';
  }
};

// ============================================================
// 【改进3】批量删除设备确认（batchDelete）
// 理由：设备批量删除确认弹窗的"确认删除"按钮 onclick="batchDelete()" 从未定义
// 业务逻辑：删除选中设备，刷新设备列表，Toast反馈，显示删除统计
// ============================================================
window.batchDelete = function() {
  var modal = document.getElementById('modal-batch-delete-confirm');
  if (!modal) {
    // Try alternate modal id
    modal = document.getElementById('batch-delete-confirm');
  }
  
  // Get selected devices from the batch modal if open
  var selectedCount = 0;
  var deviceListEl = document.getElementById('db-device-list');
  if (deviceListEl) {
    var items = deviceListEl.querySelectorAll('.batch-device-item');
    selectedCount = items.length;
    // Remove items visually
    items.forEach(function(item) { item.remove(); });
  }
  
  // Try to get count from batch modal
  var countEl = document.getElementById('db-batch-count');
  if (countEl) {
    var text = countEl.textContent;
    var match = text.match(/\d+/);
    if (match) selectedCount = parseInt(match[0]);
  }
  
  // Close modal
  if (modal) {
    modal.classList.add('hidden');
  }
  closeModal('batch-delete-confirm');
  closeModal('device-batch');
  
  // Show toast
  if (selectedCount > 0) {
    showToast('🗑️ 已删除 ' + selectedCount + ' 台设备', 'success');
  } else {
    showToast('🗑️ 设备批量删除完成', 'success');
  }
  
  // Refresh device list if function exists
  if (typeof renderDeviceList === 'function') {
    renderDeviceList();
  } else if (typeof refreshDeviceList === 'function') {
    refreshDeviceList();
  }
};

// ============================================================
// 【改进4】看板视图切换（switchDashboardView）
// 理由：首页看板统计的4个Tab按钮（实时概览/入住分析/设备状态/收入统计）onclick="switchDashboardView(...)" 从未定义
// 业务逻辑：切换看板Tab视图，切换对应内容面板，更新按钮激活状态
// ============================================================
window.switchDashboardView = function(view) {
  // Tab button states
  var tabs = [
    {id: 'dvtab-overview', view: 'overview', label: '实时概览'},
    {id: 'dvtab-checkin', view: 'checkin', label: '入住分析'},
    {id: 'dvtab-device', view: 'device', label: '设备状态'},
    {id: 'dvtab-revenue', view: 'revenue', label: '收入统计'}
  ];
  
  // Update tab button styles
  tabs.forEach(function(t) {
    var btn = document.getElementById(t.id);
    if (btn) {
      if (t.view === view) {
        btn.style.background = 'var(--blue)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--blue)';
        btn.style.fontWeight = '600';
      } else {
        btn.style.background = 'var(--white)';
        btn.style.color = 'var(--text)';
        btn.style.borderColor = 'var(--border)';
        btn.style.fontWeight = '600';
      }
    }
  });
  
  // Show/hide content panels
  var panels = ['dashboard-overview', 'dashboard-checkin', 'dashboard-device', 'dashboard-revenue'];
  var panelMap = {
    'overview': 'dashboard-overview',
    'checkin': 'dashboard-checkin',
    'device': 'dashboard-device',
    'revenue': 'dashboard-revenue'
  };
  
  var targetPanel = panelMap[view];
  panels.forEach(function(pid) {
    var panel = document.getElementById(pid);
    if (panel) {
      panel.style.display = pid === targetPanel ? 'block' : 'none';
    }
  });
  
  // If switching to a panel that needs data loading, trigger load
  if (view === 'checkin' && typeof loadCheckinDashboard === 'function') {
    loadCheckinDashboard();
  } else if (view === 'device' && typeof loadDeviceDashboard === 'function') {
    loadDeviceDashboard();
  } else if (view === 'revenue' && typeof loadRevenueDashboard === 'function') {
    loadRevenueDashboard();
  }
};

// ============================================================
// 【改进5】换房弹窗（openChangeRoomModal）
// 理由：房间详情页办理记录Tab的"换房"按钮 onclick="openChangeRoomModal" 从未定义
// 业务逻辑：打开换房弹窗，显示可选房间列表，选择后执行换房操作
// ============================================================
window.openChangeRoomModal = function() {
  // Check if modal already exists
  var existing = document.getElementById('modal-change-room');
  if (existing) {
    existing.classList.remove('hidden');
    return;
  }
  
  // Get current room info from page context
  var currentRoom = window._currentRoomNum || '301';
  var currentRoomType = window._currentRoomType || '标准间';
  
  // Build available rooms (simulate - in real system would come from API)
  var rooms = [
    {num: '302', type: '标准间', floor: 3, status: '空房'},
    {num: '303', type: '大床房', floor: 3, status: '空房'},
    {num: '304', type: '标准间', floor: 3, status: '空房'},
    {num: '401', type: '亲子间', floor: 4, status: '空房'},
    {num: '402', type: '大床房', floor: 4, status: '空房'}
  ].filter(function(r) { return r.num !== currentRoom; });
  
  var roomOptions = rooms.map(function(r) {
    return '<div class="change-room-item" onclick="selectChangeRoom(\'' + r.num + '\', \'' + r.type + '\')" style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.2s;">' +
      '<div>' +
      '<div style="font-weight:600;font-size:14px;">' + r.num + ' <span style="font-size:11px;padding:2px 6px;background:var(--blue-bg);color:var(--blue);border-radius:4px;margin-left:6px;">' + r.type + '</span></div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + r.floor + '层 · ' + r.status + '</div>' +
      '</div>' +
      '<div style="font-size:11px;padding:4px 10px;background:var(--green-bg);color:var(--green);border-radius:4px;">可选</div>' +
      '</div>';
  }).join('');
  
  var html = '<div class="modal-overlay" id="modal-change-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)closeChangeRoomModal()">' +
    '<div class="modal" style="width:90%;max-width:460px;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">🔄 换房 - 当前房间：' + currentRoom + '（' + currentRoomType + '）</div>' +
    '<button class="modal-close" onclick="closeChangeRoomModal()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div style="margin-bottom:16px;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">请选择目标房间（已过滤同类型空房）</div>' +
    '<div id="change-room-list">' + roomOptions + '</div>' +
    '</div>' +
    '<div id="change-room-selected" style="display:none;padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:12px;">' +
    '<div style="font-size:13px;font-weight:600;">已选：<span id="crs-room-num" style="color:var(--blue);"></span> <span id="crs-room-type" style="font-size:12px;color:var(--text-muted);"></span></div>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">换房将自动完成：原房间退房 → 新房间入住，费用多退少补</div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="modal-btn secondary" onclick="closeChangeRoomModal()">取消</button>' +
    '<button class="modal-btn primary" id="crs-confirm-btn" onclick="confirmChangeRoom()" disabled style="opacity:0.5;cursor:not-allowed;">✅ 确认换房</button>' +
    '</div></div></div>';
  
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

window.selectChangeRoom = function(roomNum, roomType) {
  // Highlight selected item
  var items = document.querySelectorAll('.change-room-item');
  items.forEach(function(item) {
    item.style.borderColor = 'var(--border)';
    item.style.background = 'white';
  });
  event.currentTarget.style.borderColor = 'var(--blue)';
  event.currentTarget.style.background = 'var(--blue-bg)';
  
  // Show selected panel
  var selectedPanel = document.getElementById('change-room-selected');
  if (selectedPanel) selectedPanel.style.display = 'block';
  
  var roomNumEl = document.getElementById('crs-room-num');
  var roomTypeEl = document.getElementById('crs-room-type');
  if (roomNumEl) roomNumEl.textContent = roomNum;
  if (roomTypeEl) roomTypeEl.textContent = roomType;
  
  // Enable confirm button
  var confirmBtn = document.getElementById('crs-confirm-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
    confirmBtn.style.cursor = 'pointer';
  }
  
  // Store selected room
  window._selectedChangeRoom = roomNum;
};

window.confirmChangeRoom = function() {
  var targetRoom = window._selectedChangeRoom;
  var currentRoom = window._currentRoomNum || '301';
  
  if (!targetRoom) {
    showToast('请先选择目标房间', 'warning');
    return;
  }
  
  closeChangeRoomModal();
  showToast('🔄 已从 ' + currentRoom + ' 换房至 ' + targetRoom + '，入住手续已自动办理', 'success');
  
  // Refresh room records if function exists
  if (typeof renderRoomRecords === 'function') {
    renderRoomRecords();
  }
  
  // Reset
  window._selectedChangeRoom = null;
};

window.closeChangeRoomModal = function() {
  var modal = document.getElementById('modal-change-room');
  if (modal) modal.remove();
  window._selectedChangeRoom = null;
};

console.log('[iter68] 5个关键缺失函数修复完成：confirmSync / cancelDeviceConfirm / batchDelete / switchDashboardView / openChangeRoomModal');
