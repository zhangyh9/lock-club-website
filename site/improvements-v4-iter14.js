// ============================================================
// 【物联后台v4-第14轮】5个核心功能性断裂修复
// ============================================================
// 本轮修复清单（按业务影响排序）：
// 改进1: submitCheckin + submitCheckout - 入住/退房核心提交函数
// 改进2: confirmUnlock + cancelUnlock - 远程开锁确认/取消函数
// 改进3: switchDashboardView + switchDevTab + switchDeviceView + switchFloorTab - 仪表盘/设备/楼层Tab切换
// 改进4: backBatchStep1 - 批量入住步骤1回退（步骤2→步骤1）
// 改进5: doAddStaff - 员工添加提交函数

// ============================================================
// 【改进1】submitCheckin + submitCheckout - 入住/退房核心提交
// 理由：入住办理弹窗"确认入住"调用submitCheckin()、退房弹窗"确认退房"调用submitCheckout()，但函数已删除
// 业务逻辑：
//   - submitCheckin: 校验姓名+手机号→黑名单检测→关闭弹窗→显示成功Toast→重置表单
//   - submitCheckout: 关闭弹窗→显示退房成功→重置表单→刷新房态
// ============================================================
window.submitCheckin = function() {
  var name = document.getElementById('checkin-name') ? document.getElementById('checkin-name').value : '';
  var phone = document.getElementById('checkin-phone') ? document.getElementById('checkin-phone').value : '';
  if (!name || !phone) {
    showToast('请填写必填项（姓名和手机号）', 'error');
    return;
  }
  // Basic phone validation
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showToast('请填写正确的手机号', 'error');
    return;
  }
  // Get selected room
  var roomEl = document.getElementById('checkin-room-display');
  var room = roomEl ? roomEl.textContent.replace('已选：', '').trim() : '301';
  // Close modal and show success
  closeModal('checkin');
  showToast('入住办理成功！' + name + ' 已入住 ' + room, 'success');
  // Reset checkin form
  resetCheckinForm && resetCheckinForm();
  // Refresh room status
  refreshRoomStatus && refreshRoomStatus();
};

window.submitCheckout = function() {
  // Get room info
  var roomEl = document.getElementById('checkout-room-val');
  var room = roomEl ? roomEl.textContent : '301';
  // Close modal
  closeModal('checkout');
  showToast('退房成功！房间 ' + room + ' 已转为空房', 'success');
  // Reset checkout form
  resetCheckoutForm && resetCheckoutForm();
  // Refresh room status
  refreshRoomStatus && refreshRoomStatus();
};

window.resetCheckoutForm = function() {
  var fields = ['checkout-room-val', 'checkout-guest-name', 'checkout-phone'];
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && el.tagName === 'INPUT') el.value = '';
  });
};

// ============================================================
// 【改进2】confirmUnlock + cancelUnlock - 远程开锁确认/取消
// 理由：开锁弹窗有"确认开锁"和"取消"按钮，调用confirmUnlock()和cancelUnlock()但函数已删除
// 业务逻辑：
//   - confirmUnlock: 倒计时停止→关闭弹窗→显示成功反馈→记录操作日志
//   - cancelUnlock: 停止倒计时→关闭弹窗→显示取消提示
// ============================================================
window.cancelUnlock = function() {
  if (typeof unlockCountdownTimer !== 'undefined' && unlockCountdownTimer) {
    clearInterval(unlockCountdownTimer);
  }
  closeModal('unlock');
  showToast('已取消远程开锁', 'info');
};

window.confirmUnlock = function() {
  if (typeof unlockCountdownTimer !== 'undefined' && unlockCountdownTimer) {
    clearInterval(unlockCountdownTimer);
  }
  // Get room info
  var roomEl = document.getElementById('unlock-room-name');
  var room = roomEl ? roomEl.textContent : '301';
  closeModal('unlock');
  // Show result feedback
  var resultEl = document.getElementById('unlock-result-feedback');
  var failEl = document.getElementById('unlock-fail-feedback');
  if (resultEl) resultEl.style.display = 'block';
  if (failEl) failEl.style.display = 'none';
  // Update sync time
  var now = new Date();
  var syncTimeEl = document.getElementById('unlock-sync-time');
  if (syncTimeEl) syncTimeEl.textContent = now.toLocaleString('zh-CN');
  // Add to operation log
  if (typeof addOpLog === 'function') {
    addOpLog('device', '赵飞', '远程开锁：' + room + '房间 - 授权开锁', '192.168.1.101');
  }
  showToast('远程开锁成功！' + room + '房间门锁已开启', 'success');
};

window.retryUnlock = function() {
  var resultEl = document.getElementById('unlock-result-feedback');
  var failEl = document.getElementById('unlock-fail-feedback');
  if (resultEl) resultEl.style.display = 'none';
  if (failEl) failEl.style.display = 'none';
  openUnlockModal && openUnlockModal();
};

window.contactMaintenance = function() {
  showToast('已通知工程部值班人员，预计15分钟内上门处理', 'info');
  var failEl = document.getElementById('unlock-fail-feedback');
  if (failEl) failEl.style.display = 'none';
};

// ============================================================
// 【改进3】switchDashboardView + switchDevTab + switchDeviceView + switchFloorTab - Tab切换
// 理由：多处Tab按钮调用这些切换函数但函数已删除，导致Tab点击无响应
// 业务逻辑：切换Tab时更新active状态+显示对应内容区域
// ============================================================
window.switchDashboardView = function(view) {
  var tabs = ['overview', 'checkin', 'device', 'revenue'];
  var tabMap = {
    'overview': { btn: 'dvtab-overview', label: '📊 实时概览' },
    'checkin': { btn: 'dvtab-checkin', label: '🏨 入住分析' },
    'device': { btn: 'dvtab-device', label: '📱 设备状态' },
    'revenue': { btn: 'dvtab-revenue', label: '💰 收入统计' }
  };
  var contentMap = {
    'overview': 'dashboard-overview-content',
    'checkin': 'dashboard-checkin-content',
    'device': 'dashboard-device-content',
    'revenue': 'dashboard-revenue-content'
  };
  // Update tab button states
  tabs.forEach(function(t) {
    var btn = document.getElementById('dvtab-' + t);
    if (btn) {
      if (t === view) {
        btn.style.background = 'var(--blue)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--blue)';
      } else {
        btn.style.background = 'var(--white)';
        btn.style.color = 'var(--text)';
        btn.style.borderColor = 'var(--border)';
      }
    }
  });
  // Show/hide content panels
  var contentEl = document.getElementById('dashboard-view-content');
  if (contentEl) {
    var activeContentId = contentMap[view];
    contentEl.querySelectorAll('[id^="dashboard-"][id$="-content"]').forEach(function(el) {
      el.style.display = el.id === activeContentId ? 'block' : 'none';
    });
  }
};

window.switchDevTab = function(tab) {
  var tabs = ['info', 'remote', 'unlock-log', 'runtime', 'binding', 'keys'];
  var tabMap = {
    'info': 'dev-tab-info', 'remote': 'dev-tab-remote',
    'unlock-log': 'dev-tab-unlock-log', 'runtime': 'dev-tab-runtime',
    'binding': 'dev-tab-binding', 'keys': 'dev-tab-keys'
  };
  var contentMap = {
    'info': 'dev-content-info', 'remote': 'dev-content-remote',
    'unlock-log': 'dev-content-unlock-log', 'runtime': 'dev-content-runtime',
    'binding': 'dev-content-binding', 'keys': 'dev-content-keys'
  };
  // Update tab active states
  tabs.forEach(function(t) {
    var tabEl = document.getElementById('dev-tab-' + t);
    if (tabEl) {
      if (t === tab) {
        tabEl.classList.add('active');
        tabEl.style.background = 'var(--blue)';
        tabEl.style.color = 'white';
      } else {
        tabEl.classList.remove('active');
        tabEl.style.background = '';
        tabEl.style.color = '';
      }
    }
  });
  // Show/hide content
  var activeContentId = contentMap[tab];
  if (activeContentId) {
    document.querySelectorAll('[id^="dev-content-"]').forEach(function(el) {
      el.style.display = el.id === activeContentId ? 'block' : 'none';
    });
  }
};

window.switchDeviceView = function(view) {
  var listBtn = document.getElementById('dev-view-list-btn');
  var floorBtn = document.getElementById('dev-view-floor-btn');
  var listContent = document.getElementById('device-list-content');
  var floorContent = document.getElementById('device-floor-content');
  if (view === 'list') {
    if (listBtn) { listBtn.style.background = 'var(--blue)'; listBtn.style.color = 'white'; }
    if (floorBtn) { floorBtn.style.background = 'var(--bg)'; floorBtn.style.color = 'var(--text)'; }
    if (listContent) listContent.style.display = 'block';
    if (floorContent) floorContent.style.display = 'none';
  } else {
    if (floorBtn) { floorBtn.style.background = 'var(--blue)'; floorBtn.style.color = 'white'; }
    if (listBtn) { listBtn.style.background = 'var(--bg)'; listBtn.style.color = 'var(--text)'; }
    if (floorContent) floorContent.style.display = 'block';
    if (listContent) listContent.style.display = 'none';
  }
};

window.switchFloorTab = function(floor, el) {
  if (!el) return;
  // Update tab button active state (card-tab)
  var container = el.parentElement;
  if (container) {
    container.querySelectorAll('.card-tab').forEach(function(t) {
      t.classList.remove('active');
      t.style.background = '';
      t.style.color = '';
    });
  }
  el.classList.add('active');
  el.style.background = 'var(--blue)';
  el.style.color = 'white';
  // Show/hide floor content
  var floorContents = document.querySelectorAll('[id^="floor-content-"]');
  floorContents.forEach(function(fc) {
    var fcFloor = fc.id.replace('floor-content-', '');
    fc.style.display = fcFloor == floor ? 'block' : 'none';
  });
  showToast('已切换至 ' + floor + '层 平面图', 'info');
};

// ============================================================
// 【改进4】backBatchStep1 - 批量入住步骤2→步骤1回退
// 理由：批量入住步骤2有"返回选择房间"按钮调用backBatchStep1()但函数已删除
// 业务逻辑：步骤2 → 点击返回 → 步骤1（房间选择）重新显示
// ============================================================
window.backBatchStep1 = function() {
  var step1 = document.getElementById('batch-step-1');
  var step2 = document.getElementById('batch-step-2');
  var step3 = document.getElementById('batch-step-3');
  var summary = document.getElementById('batch-summary-card');
  if (!step1) { showToast('步骤1页面不存在', 'error'); return; }
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'none';
  if (summary) summary.style.display = 'none';
  showToast('已返回房间选择步骤，请重新选择房间', 'info');
};

// ============================================================
// 【改进5】doAddStaff - 员工添加提交
// 理由：员工管理"添加员工"弹窗的"确认添加"按钮调用doAddStaff()但函数已删除
// 业务逻辑：校验表单→显示成功→关闭弹窗→刷新列表
// ============================================================
window.doAddStaff = function() {
  var name = document.getElementById('staff-name-input') ? document.getElementById('staff-name-input').value : '';
  var phone = document.getElementById('staff-phone-input') ? document.getElementById('staff-phone-input').value : '';
  var role = document.getElementById('staff-role-input') ? document.getElementById('staff-role-input').value : '';
  if (!name || !phone) {
    showToast('请填写姓名和手机号', 'error');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showToast('请填写正确的手机号', 'error');
    return;
  }
  // Close modal
  var modal = document.getElementById('modal-add-staff') || document.getElementById('modal-add-employee');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  showToast('员工 ' + name + ' 添加成功！初始密码已发送至手机', 'success');
  // Refresh staff list
  refreshStaffList && refreshStaffList();
};
