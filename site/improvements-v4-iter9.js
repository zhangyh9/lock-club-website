// ============================================================
// 【物联后台v4-第15轮】5个核心功能函数断裂修复
// ============================================================
// 本轮修复清单：
// 改进1: openAlertModal(idx) - 告警列表/设备详情的"处理告警"按钮调用
// 改进2: openUnlockModal() - 房间详情/设备详情的"远程开锁"按钮调用
// 改进3: openCompleteCheckinModal() - 房间详情的"办理入住"按钮调用
// 改进4: manualSync() - 看板统计页的"立即同步"按钮调用
// 改进5: manualRefreshDashboard() - 设备状态面板的"手动刷新"按钮调用

// ============================================================
// 【改进1】openAlertModal(idx) - 告警处理/查看弹窗
// 理由：page-alert和page-device-detail的"处理/查看"告警按钮调用openAlertModal(idx)但函数未定义
// 改进：打开告警详情弹窗，支持处理（确认/转交/忽略）并更新告警状态
// ============================================================
window.openAlertModal = function(idx) {
  // 模拟告警数据
  var alertData = [
    {
      id: 'ALT-2026032901',
      room: '303',
      device: '领握LH-807智能锁',
      type: 'device_offline',
      level: 'critical',
      message: '设备离线超过10小时',
      time: '2026-03-29 08:15:22',
      status: 'pending',
      handler: '',
      solution: ''
    },
    {
      id: 'ALT-2026032902',
      room: '305',
      device: '领握LH-807智能锁',
      type: 'low_battery',
      level: 'warning',
      message: '设备电量低于20%（当前28%）',
      time: '2026-03-29 10:30:00',
      status: 'pending',
      handler: '',
      solution: ''
    },
    {
      id: 'ALT-2026032903',
      room: '301',
      device: '小度音箱S1',
      type: 'offline',
      level: 'info',
      message: '小度设备连接异常',
      time: '2026-03-28 15:20:00',
      status: 'done',
      handler: '管理员',
      solution: '已重启设备，恢复正常'
    }
  ];

  var alert = alertData[idx] || alertData[0];
  var levelBadge = {
    critical: '<span style="background:var(--red-bg);color:var(--red);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🔴 紧急</span>',
    warning: '<span style="background:var(--orange-bg);color:var(--orange);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🟠 警告</span>',
    info: '<span style="background:var(--blue-bg);color:var(--blue);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">🔵 通知</span>'
  };
  var statusBadge = {
    pending: '<span style="background:var(--orange-bg);color:var(--orange);padding:2px 8px;border-radius:4px;font-size:11px;">⏳ 待处理</span>',
    done: '<span style="background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:4px;font-size:11px;">✅ 已处理</span>'
  };

  var existing = document.getElementById('modal-alert-detail');
  if (existing) existing.remove();

  var isDone = alert.status === 'done';
  var html = '<div id="modal-alert-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-alert-detail\').remove()">' +
    '<div style="background:white;border-radius:12px;width:520px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="font-size:28px;">' + (alert.type === 'device_offline' ? '📱' : alert.type === 'low_battery' ? '🔋' : 'ℹ️') + '</div>' +
    '<div style="flex:1;"><div style="font-size:15px;font-weight:700;">告警详情</div><div style="font-size:11px;color:var(--text-muted);">' + alert.id + '</div></div>' +
    levelBadge[alert.level] + statusBadge[alert.status] +
    '<button onclick="document.getElementById(\'modal-alert-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);margin-left:8px;">✕</button></div>' +
    '<div style="padding:20px 24px;overflow-y:auto;flex:1;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房间号</div><div style="font-size:14px;font-weight:600;">' + alert.room + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">设备</div><div style="font-size:14px;font-weight:600;">' + alert.device + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">告警类型</div><div style="font-size:14px;font-weight:600;">' + alert.message + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">发生时间</div><div style="font-size:14px;font-weight:600;">' + alert.time + '</div></div></div>' +
    '<div style="margin-bottom:16px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">处理方案</div>';

  if (isDone) {
    html += '<div style="padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;font-size:13px;">' +
      '<div style="font-weight:600;margin-bottom:4px;">✅ ' + alert.solution + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);">处理人：' + alert.handler + '</div></div>';
  } else {
    html += '<textarea id="alert-solution-input" placeholder="请输入处理方案..." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;resize:vertical;min-height:80px;box-sizing:border-box;"></textarea>';
  }

  html += '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-alert-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button>';

  if (!isDone) {
    html += '<button onclick="handleAlertAction(\'' + alert.id + '\', \'ignore\')" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text-light);">忽略</button>' +
      '<button onclick="handleAlertAction(\'' + alert.id + '\', \'transfer\')" style="padding:8px 20px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--orange);">转交</button>' +
      '<button onclick="handleAlertAction(\'' + alert.id + '\', \'confirm\')" style="padding:8px 20px;background:var(--green);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">确认处理</button>';
  }

  html += '</div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleAlertAction = function(alertId, action) {
  var solution = document.getElementById('alert-solution-input') ? document.getElementById('alert-solution-input').value.trim() : '';
  if (action === 'confirm' && !solution) {
    showToast('请输入处理方案', 'warning');
    return;
  }
  var msg = action === 'confirm' ? '告警已确认处理' : action === 'transfer' ? '告警已转交' : '告警已忽略';
  document.getElementById('modal-alert-detail') && document.getElementById('modal-alert-detail').remove();
  showToast('✅ ' + msg, 'success');
};

// ============================================================
// 【改进2】openUnlockModal() - 远程开锁确认弹窗
// 理由：房间详情和设备详情的"🔓 远程开锁"按钮调用openUnlockModal()但函数未定义
// 改进：弹出远程开锁确认，显示房间信息，发送开锁指令，2秒后显示成功
// ============================================================
window.openUnlockModal = function() {
  // 获取当前房间信息（从页面上下文）
  var roomNum = '301';
  var deviceName = '领握LH-807智能锁';
  var deviceStatus = '🟢 在线';

  // 尝试从页面获取房间号
  var rdTitle = document.getElementById('rd-page-title');
  if (rdTitle) {
    var match = rdTitle.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }

  var existing = document.getElementById('modal-unlock-confirm');
  if (existing) existing.remove();

  var html = '<div id="modal-unlock-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div style="background:white;border-radius:12px;width:400px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:48px;height:48px;background:var(--green-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">🔓</div>' +
    '<div><div style="font-size:15px;font-weight:700;">远程开锁</div><div style="font-size:12px;color:var(--text-muted);">房间号：' + roomNum + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-unlock-confirm\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">房间</span><br><strong>' + roomNum + '</strong></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">设备</span><br><strong>' + deviceName + '</strong></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">设备状态</span><br><strong style="color:var(--green);">' + deviceStatus + '</strong></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">开锁方式</span><br><strong>远程指令</strong></div></div>' +
    '<div id="unlock-progress" style="display:none;padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);margin-bottom:10px;">📡 正在发送开锁指令...</div>' +
    '<div id="unlock-success" style="display:none;padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;font-size:12px;color:var(--green);">✅ 开锁成功！门锁已打开</div>' +
    '<div style="font-size:11px;color:var(--text-muted);line-height:1.7;margin-top:8px;">' +
    '• 开锁指令将在3秒内送达设备<br>' +
    '• 如门锁离线，指令将在设备上线后自动重试<br>' +
    '• 开锁记录可在"开锁记录"中查看</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-unlock-confirm\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="executeUnlock()" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">🔓 确认开锁</button></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
};

window.executeUnlock = function() {
  var progress = document.getElementById('unlock-progress');
  var success = document.getElementById('unlock-success');
  var confirmBtn = document.querySelector('#modal-unlock-confirm button[onclick="executeUnlock()"]');
  if (confirmBtn) confirmBtn.disabled = true;

  if (progress) progress.style.display = 'block';
  showToast('📡 正在发送开锁指令...', 'info');

  setTimeout(function() {
    if (progress) progress.style.display = 'none';
    if (success) success.style.display = 'block';
    showToast('✅ 远程开锁成功！', 'success');
  }, 2000);
};

// ============================================================
// 【改进3】openCompleteCheckinModal() - 快速入住办理弹窗
// 理由：房间详情的"办理入住"按钮调用openCompleteCheckinModal()但函数未定义
// 改进：弹出快速入住表单，填写姓名/手机号，选择入住天数，确认后更新房间状态
// ============================================================
window.openCompleteCheckinModal = function() {
  var roomNum = '301';
  var rdTitle = document.getElementById('rd-page-title');
  if (rdTitle) {
    var match = rdTitle.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }

  var existing = document.getElementById('modal-checkin-wizard');
  if (existing) existing.remove();

  var html = '<div id="modal-checkin-wizard" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div style="background:white;border-radius:12px;width:480px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="font-size:28px;">🏨</div>' +
    '<div><div style="font-size:15px;font-weight:700;">快速入住办理</div><div style="font-size:12px;color:var(--text-muted);">房间号：' + roomNum + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-checkin-wizard\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;overflow-y:auto;flex:1;">' +
    '<div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">客人姓名 <span style="color:var(--red);">*</span></label>' +
    '<input type="text" id="ciw-name" placeholder="请输入客人姓名" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box;"></div>' +
    '<div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">手机号 <span style="color:var(--red);">*</span></label>' +
    '<input type="tel" id="ciw-phone" placeholder="请输入手机号" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box;"></div>' +
    '<div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">身份证号</label>' +
    '<input type="text" id="ciw-idcard" placeholder="请输入身份证号（可选）" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box;"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">入住天数</label>' +
    '<select id="ciw-days" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;">' +
    '<option value="1">1晚</option><option value="2" selected>2晚</option><option value="3">3晚</option><option value="5">5晚</option><option value="7">7晚</option></select></div>' +
    '<div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">入住人数</label>' +
    '<select id="ciw-guests" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;">' +
    '<option value="1" selected>1人</option><option value="2">2人</option><option value="3">3人</option><option value="4">4人</option></select></div></div>' +
    '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">备注</label>' +
    '<input type="text" id="ciw-note" placeholder="特殊要求（可选）" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box;"></div>' +
    '<div id="ciw-error" style="display:none;padding:10px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:12px;color:var(--red);margin-bottom:10px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-checkin-wizard\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="submitCheckinFromWizard(\'' + roomNum + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">🏨 确认入住</button></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitCheckinFromWizard = function(roomNum) {
  var name = document.getElementById('ciw-name') ? document.getElementById('ciw-name').value.trim() : '';
  var phone = document.getElementById('ciw-phone') ? document.getElementById('ciw-phone').value.trim() : '';
  var idcard = document.getElementById('ciw-idcard') ? document.getElementById('ciw-idcard').value.trim() : '';
  var days = document.getElementById('ciw-days') ? document.getElementById('ciw-days').value : '2';
  var guests = document.getElementById('ciw-guests') ? document.getElementById('ciw-guests').value : '1';
  var note = document.getElementById('ciw-note') ? document.getElementById('ciw-note').value.trim() : '';

  var errorEl = document.getElementById('ciw-error');
  if (!name) {
    if (errorEl) { errorEl.textContent = '请输入客人姓名'; errorEl.style.display = 'block'; }
    return;
  }
  if (!phone || !/^1\d{10}$/.test(phone)) {
    if (errorEl) { errorEl.textContent = '请输入正确的手机号'; errorEl.style.display = 'block'; }
    return;
  }

  document.getElementById('modal-checkin-wizard') && document.getElementById('modal-checkin-wizard').remove();
  showToast('🏨 房间 ' + roomNum + ' 入住成功！客人：' + name + '，入住' + days + '晚', 'success');
};

// ============================================================
// 【改进4】manualSync() - 立即同步数据
// 理由：看板统计页"立即同步"按钮调用manualSync()但函数未定义
// 改进：触发同步动画，更新进度条，3秒后显示同步完成
// ============================================================
window.manualSync = function() {
  var syncBar = document.getElementById('sync-bar-inner');
  var syncCountdown = document.getElementById('sync-countdown');
  var syncLastTime = document.getElementById('sync-last-time');

  if (syncBar) {
    syncBar.style.width = '0%';
    syncBar.style.transition = 'none';
    setTimeout(function() {
      syncBar.style.transition = 'width 3s linear';
      syncBar.style.width = '100%';
    }, 50);
  }

  if (syncCountdown) syncCountdown.textContent = '同步中...';
  showToast('📡 正在同步数据...', 'info');

  setTimeout(function() {
    if (syncBar) syncBar.style.width = '0%';
    if (syncCountdown) syncCountdown.textContent = '30s';
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0') + ':' +
      now.getSeconds().toString().padStart(2, '0');
    if (syncLastTime) syncLastTime.textContent = timeStr;
    showToast('✅ 数据同步完成', 'success');
  }, 3000);
};

// ============================================================
// 【改进5】manualRefreshDashboard() - 手动刷新设备状态
// 理由：设备状态面板的"手动刷新"按钮调用manualRefreshDashboard()但函数未定义
// 改进：触发设备列表刷新动画，更新"最后刷新"时间
// ============================================================
window.manualRefreshDashboard = function() {
  var statusEl = document.getElementById('dashboard-device-status');
  var lastUpdateEl = document.getElementById('dashboard-last-update');

  // 模拟刷新动画
  if (statusEl) {
    var original = statusEl.textContent;
    statusEl.textContent = '刷新中...';
    statusEl.style.color = 'var(--orange)';
    setTimeout(function() {
      statusEl.textContent = original;
      statusEl.style.color = 'var(--green)';
    }, 1500);
  }

  showToast('🔄 正在刷新设备状态...', 'info');

  setTimeout(function() {
    var now = new Date();
    var timeStr = (now.getMonth()+1) + '-' + now.getDate() + ' ' +
      now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0') + ':' +
      now.getSeconds().toString().padStart(2, '0');
    if (lastUpdateEl) lastUpdateEl.textContent = timeStr;
    showToast('✅ 设备状态已更新', 'success');
  }, 1500);
};
