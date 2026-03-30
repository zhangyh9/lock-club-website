// ============================================================
// 【物联后台v4-第58轮】缺失函数修复 - 房务管理+员工管理+密码管理+报表
// ============================================================
// 修复清单：
// 改进1: 房务管理核心函数闭环（filterHousekeepingTab/applyHousekeepingFilter/resetHousekeepingFilter/exportHousekeepingReport）
// 改进2: 房务任务操作闭环（markRoomCleaning/showRoomHKDetail/editHKTask/deleteHKTask/markRoomCleaned/markRoomRepaired）
// 改进3: 员工管理函数（filterStaffList/switchStaffMainTab/filterStaffTable）
// 改进4: 密码管理函数（openKeypadModal/generateKeypadPassword/exportKeypadLog）
// 改进5: 报表函数（openReportModal/exportReportPDF）
// ============================================================

// -------- 改进1: 房务管理筛选函数 --------
window.filterHousekeepingTab = function(tab, el) {
  // 更新Tab高亮
  document.querySelectorAll('#page-housekeeping .stats-row .stat-card').forEach(function(c) {
    c.style.borderColor = 'var(--border)';
    c.style.boxShadow = 'none';
  });
  if (el) {
    el.style.borderColor = 'var(--blue)';
    el.style.boxShadow = '0 0 0 2px var(--blue-bg)';
  }
  // 筛选列表
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var tabMap = {dirty:'待清洁',cleaning:'清洁中',clean:'已清洁',maintain:'维修中'};
  var keyword = tabMap[tab] || '';
  rows.forEach(function(row) {
    var statusCell = row.querySelector('td:nth-child(3)');
    if (!keyword) {
      row.style.display = '';
    } else {
      var text = statusCell ? statusCell.textContent : '';
      row.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
    }
  });
  showToast('已筛选：' + (keyword || '全部'), 'info');
};

window.applyHousekeepingFilter = function() {
  var floor = document.getElementById('hk-floor-filter');
  var staff = document.getElementById('hk-staff-filter');
  var priority = document.getElementById('hk-priority-filter');
  var floorVal = floor ? floor.value : 'all';
  var staffVal = staff ? staff.value : 'all';
  var priVal = priority ? priority.value : 'all';
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var count = 0;
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    var roomNum = cells[0] ? cells[0].textContent.trim() : '';
    var roomFloor = roomNum.charAt(0); // 3->3层, 2->2层, 1->1层
    var assigned = cells[4] ? cells[4].textContent.trim() : '';
    var pri = cells[3] ? cells[3].textContent : '';
    var show = true;
    if (floorVal !== 'all' && roomFloor !== floorVal) show = false;
    if (staffVal !== 'all' && assigned.indexOf(staffVal) < 0) show = false;
    if (priVal !== 'all' && pri.indexOf(priVal === 'urgent' ? '紧急' : priVal === 'normal' ? '普通' : '低') < 0) show = false;
    row.style.display = show ? '' : 'none';
    if (show) count++;
  });
  showToast('筛选完成，共 ' + count + ' 条任务', 'info');
};

window.resetHousekeepingFilter = function() {
  var floor = document.getElementById('hk-floor-filter');
  var staff = document.getElementById('hk-staff-filter');
  var priority = document.getElementById('hk-priority-filter');
  if (floor) floor.value = 'all';
  if (staff) staff.value = 'all';
  if (priority) priority.value = 'all';
  var tbody = document.getElementById('hk-task-body');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(function(r) { r.style.display = ''; });
  }
  showToast('筛选条件已重置', 'info');
};

window.exportHousekeepingReport = function() {
  showToast('📤 清洁报告导出中...', 'info');
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) { showToast('导出失败：列表不存在', 'error'); return; }
  var rows = [['房间号', '房型', '状态', '优先级', '负责人', '预计时长', '超时预警']];
  tbody.querySelectorAll('tr').forEach(function(tr) {
    var cells = tr.querySelectorAll('td');
    if (cells.length >= 7) {
      rows.push([cells[0], cells[1], cells[2], cells[3], cells[4], cells[5], cells[6]].map(function(td) { return td.textContent.trim(); }));
    }
  });
  var csv = rows.map(function(r) { return r.join(','); }).join('\n');
  var blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '清洁任务报告_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 报告已导出（' + (rows.length - 1) + ' 条记录）', 'success');
};

// -------- 改进2: 房务任务操作函数 --------
window.markRoomCleaning = function(room) {
  showToast('🧽 房间 ' + room + ' 开始清洁', 'success');
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells[0] && cells[0].textContent.trim() === room) {
      if (cells[2]) cells[2].innerHTML = '<span class="tbadge" style="background:var(--blue-bg);color:var(--blue);">🧽 清洁中</span>';
    }
  });
};

window.markRoomCleaned = function(room) {
  showToast('✅ 房间 ' + room + ' 清洁完成', 'success');
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells[0] && cells[0].textContent.trim() === room) {
      if (cells[2]) cells[2].innerHTML = '<span class="tbadge" style="background:var(--green-bg);color:var(--green);">✅ 已清洁</span>';
    }
  });
};

window.markRoomRepaired = function(room) {
  showToast('✅ 房间 ' + room + ' 维修完成', 'success');
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells[0] && cells[0].textContent.trim() === room) {
      if (cells[2]) cells[2].innerHTML = '<span class="tbadge" style="background:var(--green-bg);color:var(--green);">✅ 已修复</span>';
    }
  });
};

window.showRoomHKDetail = function(room) {
  var existing = document.getElementById('modal-hk-detail');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-hk-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-detail\').remove()">' +
    '<div class="modal" style="width:500px;background:white;border-radius:12px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🚪</div><div style="font-size:15px;font-weight:700;">房间 ' + room + ' 清洁详情</div>' +
    '<button onclick="document.getElementById(\'modal-hk-detail\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房型</div><div style="font-weight:600;">亲子间</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">楼层</div><div style="font-weight:600;">' + room.charAt(0) + '层</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">当前状态</div><div style="font-weight:600;">待清洁</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">负责人</div><div style="font-weight:600;">李丽</div></div></div>' +
    '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text);">📋 清洁记录</div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;line-height:1.8;">' +
    '<div>🕐 14:30 - 系统派发清洁任务</div>' +
    '<div>🕐 14:35 - 保洁员李丽接单</div>' +
    '<div>🕐 --:-- - 暂无更多记录</div></div></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:6px;border:1px solid var(--orange);">' +
    '<div style="font-size:12px;color:var(--orange);font-weight:600;">⏰ 超时提醒：已等候32分钟，请尽快处理</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button>' +
    '<button onclick="markRoomCleaning(\'' + room + '\');document.getElementById(\'modal-hk-detail\').remove()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">🧽 开始清洁</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.editHKTask = function(room) {
  var existing = document.getElementById('modal-hk-edit');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-hk-edit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-edit\').remove()">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">✏️</div><div style="font-size:15px;font-weight:700;">编辑清洁任务</div>' +
    '<button onclick="document.getElementById(\'modal-hk-edit\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房间号</label>' +
    '<input type="text" class="form-input" value="' + room + '" disabled style="background:var(--bg);color:var(--text-muted);"></div>' +
    '<div class="form-group"><label class="form-label">负责人</label>' +
    '<select class="form-select" id="hk-edit-staff" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="">未分配</option>' +
    '<option value="李丽">李丽</option><option value="王芳">王芳</option><option value="张梅">张梅</option><option value="刘婷">刘婷</option></select></div>' +
    '<div class="form-group"><label class="form-label">优先级</label>' +
    '<select class="form-select" id="hk-edit-priority" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="normal">⚡ 普通</option><option value="urgent">🚨 紧急</option><option value="low">🔽 低</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="hk-edit-note" placeholder="可选备注" style="min-height:60px;font-size:13px;padding:8px 12px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-edit\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitHKTaskEdit(\'' + room + '\')" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitHKTaskEdit = function(room) {
  var staff = document.getElementById('hk-edit-staff');
  var priority = document.getElementById('hk-edit-priority');
  var note = document.getElementById('hk-edit-note');
  var tbody = document.getElementById('hk-task-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells[0] && cells[0].textContent.trim() === room) {
      if (cells[4] && staff) {
        cells[4].innerHTML = '<select class="form-select" style="padding:4px 6px;font-size:12px;width:100px;"><option value="">未分配</option><option value="李丽">李丽</option><option value="王芳">王芳</option><option value="张梅">张梅</option><option value="刘婷">刘婷</option></select>';
        cells[4].querySelector('select').value = staff.value;
      }
    }
  });
  showToast('✅ 任务已更新', 'success');
  var m = document.getElementById('modal-hk-edit');
  if (m) m.remove();
};

window.deleteHKTask = function(room) {
  var existing = document.getElementById('modal-hk-delete');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-hk-delete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-delete\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">删除确认</div>' +
    '<button onclick="document.getElementById(\'modal-hk-delete\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="margin:0;font-size:13px;line-height:1.6;">确定要删除房间 <strong>' + room + '</strong> 的清洁任务吗？</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-delete\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="confirmDeleteHKTask(\'' + room + '\')" style="padding:8px 20px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmDeleteHKTask = function(room) {
  var tbody = document.getElementById('hk-task-body');
  if (tbody) {
    var rows = tbody.querySelectorAll('tr');
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells[0] && cells[0].textContent.trim() === room) {
        row.remove();
      }
    });
  }
  showToast('🗑️ 任务已删除', 'success');
  var m = document.getElementById('modal-hk-delete');
  if (m) m.remove();
};

window.openHousekeepingTaskModal = function() {
  var existing = document.getElementById('modal-hk-task-add');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-hk-task-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-task-add\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🧹</div><div style="font-size:15px;font-weight:700;">分配清洁任务</div>' +
    '<button onclick="document.getElementById(\'modal-hk-task-add\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label>' +
    '<select class="form-select" id="hk-add-room" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="301">301</option><option value="302">302</option><option value="303">303</option><option value="201">201</option><option value="202">202</option><option value="101">101</option></select></div>' +
    '<div class="form-group"><label class="form-label">负责人</label>' +
    '<select class="form-select" id="hk-add-staff" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="李丽">李丽</option><option value="王芳">王芳</option><option value="张梅">张梅</option><option value="刘婷">刘婷</option></select></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房型</label>' +
    '<select class="form-select" id="hk-add-type" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="大床房">大床房</option><option value="双床房">双床房</option><option value="亲子间">亲子间</option><option value="套房">套房</option></select></div>' +
    '<div class="form-group"><label class="form-label">优先级</label>' +
    '<select class="form-select" id="hk-add-priority" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="normal">⚡ 普通</option><option value="urgent">🚨 紧急</option><option value="low">🔽 低</option></select></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="hk-add-note" placeholder="可选备注" style="min-height:60px;font-size:13px;padding:8px 12px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-task-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitHousekeepingTask()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitHousekeepingTask = function() {
  var room = document.getElementById('hk-add-room');
  var staff = document.getElementById('hk-add-staff');
  var type = document.getElementById('hk-add-type');
  var priority = document.getElementById('hk-add-priority');
  if (!room || !room.value) { showToast('请选择房间号', 'warning'); return; }
  var priMap = {urgent:'🚨 紧急', normal:'⚡ 普通', low:'🔽 低'};
  var priLabel = priMap[priority ? priority.value : 'normal'] || '⚡ 普通';
  var tbody = document.getElementById('hk-task-body');
  if (tbody) {
    var newRow = document.createElement('tr');
    newRow.innerHTML = '<td><strong>' + room.value + '</strong></td><td>' + (type ? type.value : '大床房') + '</td>' +
      '<td><span class="tbadge" style="background:var(--orange-bg);color:var(--orange);">🧹 待清洁</span></td>' +
      '<td><span class="tbadge" style="background:var(--red-bg);color:var(--red);">' + priLabel + '</span></td>' +
      '<td><span style="font-size:12px;color:var(--blue);font-weight:600;">' + (staff ? staff.value : '未分配') + '</span></td>' +
      '<td>约45分钟</td><td><span style="font-size:12px;color:var(--orange);font-weight:600;">⏰ 刚派发</span></td>' +
      '<td><button class="action-btn small" onclick="markRoomCleaning(\'' + room.value + '\')" style="background:var(--blue);color:white;border:none;font-size:11px;padding:3px 8px;">开始清洁</button>' +
      '<button class="action-btn small" onclick="showRoomHKDetail(\'' + room.value + '\')" style="font-size:11px;padding:3px 8px;">详情</button>' +
      '<button class="action-btn small" onclick="editHKTask(\'' + room.value + '\')" style="font-size:11px;padding:3px 6px;">✏️</button>' +
      '<button class="action-btn small red" onclick="deleteHKTask(\'' + room.value + '\')" style="font-size:11px;padding:3px 6px;">🗑️</button></td>';
    tbody.insertBefore(newRow, tbody.firstChild);
  }
  showToast('✅ 任务已分配至房间 ' + room.value, 'success');
  var m = document.getElementById('modal-hk-task-add');
  if (m) m.remove();
};

window.openBulkAssignModal = function() {
  var existing = document.getElementById('modal-bulk-assign');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-bulk-assign" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-bulk-assign\').remove()">' +
    '<div class="modal" style="width:500px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🔄</div><div style="font-size:15px;font-weight:700;">批量分配清洁任务</div>' +
    '<button onclick="document.getElementById(\'modal-bulk-assign\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">选择保洁员</label>' +
    '<select class="form-select" id="bulk-staff" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="">-- 选择保洁员 --</option>' +
    '<option value="李丽">李丽</option><option value="王芳">王芳</option><option value="张梅">张梅</option><option value="刘婷">刘婷</option></select></div>' +
    '<div class="form-group"><label class="form-label">选择房间（多选）</label>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:var(--bg);border-radius:6px;">' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="301"> 301</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="302"> 302</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="303"> 303</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="201"> 201</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="202"> 202</label>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;"><input type="checkbox" value="101"> 101</label></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-bulk-assign\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitBulkAssign()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">🔄 批量分配</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitBulkAssign = function() {
  var staff = document.getElementById('bulk-staff');
  if (!staff || !staff.value) { showToast('请选择保洁员', 'warning'); return; }
  var checked = [];
  document.querySelectorAll('#modal-bulk-assign input[type="checkbox"]:checked').forEach(function(cb) {
    checked.push(cb.value);
  });
  if (checked.length === 0) { showToast('请至少选择一个房间', 'warning'); return; }
  showToast('✅ 已批量分配 ' + checked.length + ' 个任务给 ' + staff.value, 'success');
  var m = document.getElementById('modal-bulk-assign');
  if (m) m.remove();
};

// -------- 改进3: 员工管理函数 --------
window.filterStaffList = function() {
  var kw = document.getElementById('staff-search-input');
  var roleFilter = document.getElementById('staff-role-filter');
  var kwVal = kw ? kw.value.trim().toLowerCase() : '';
  var roleVal = roleFilter ? roleFilter.value : 'all';
  var tbody = document.getElementById('staff-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var count = 0;
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var dept = row.getAttribute ? row.getAttribute('data-dept') : '';
    var show = true;
    if (kwVal && text.indexOf(kwVal) < 0) show = false;
    if (roleVal !== 'all' && dept !== roleVal && text.indexOf(roleVal) < 0) show = false;
    row.style.display = show ? '' : 'none';
    if (show) count++;
  });
  var countEl = document.getElementById('staff-filter-count');
  if (countEl) countEl.textContent = '共 ' + count + ' 名员工';
  if (kwVal || roleVal !== 'all') showToast('搜索到 ' + count + ' 名员工', 'info');
};

window.switchStaffMainTab = function(tab, el) {
  document.querySelectorAll('#page-staff .card-tab').forEach(function(t) {
    if (t.id.indexOf('staff-tab') === 0) {
      t.classList.remove('active');
      t.style.background = '';
      t.style.color = '';
    }
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
  }
  var listContent = document.getElementById('staff-content-list');
  if (listContent) listContent.style.display = tab === 'list' ? '' : 'none';
  var scheduleContent = document.getElementById('staff-content-schedule');
  if (scheduleContent) scheduleContent.style.display = tab === 'schedule' ? '' : 'none';
};

window.filterStaffTable = function(dept, el) {
  var headerTabs = document.querySelectorAll('#staff-content-list .card-tabs .card-tab');
  headerTabs.forEach(function(t) {
    t.classList.remove('active');
    t.style.background = '';
    t.style.color = '';
  });
  if (el) {
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
  }
  var tbody = document.getElementById('staff-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var count = 0;
  rows.forEach(function(row) {
    var rowDept = row.getAttribute ? row.getAttribute('data-dept') : '';
    var show = dept === 'all' || rowDept === dept;
    row.style.display = show ? '' : 'none';
    if (show) count++;
  });
  var countEl = document.getElementById('staff-filter-count');
  if (countEl) countEl.textContent = '共 ' + count + ' 名员工';
};

// -------- 改进4: 密码管理函数 --------
window.openKeypadModal = function() {
  var existing = document.getElementById('modal-keypad');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-keypad" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-keypad\').remove()">' +
    '<div class="modal" style="width:560px;background:white;border-radius:12px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🔑</div><div style="font-size:15px;font-weight:700;">密码管理</div>' +
    '<button onclick="document.getElementById(\'modal-keypad\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--blue);">23</div><div style="font-size:11px;color:var(--text-muted);">有效密码</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--green-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--green);">18</div><div style="font-size:11px;color:var(--text-muted);">使用中</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--orange);">5</div><div style="font-size:11px;color:var(--text-muted);">今日生成</div></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房间号</label>' +
    '<select class="form-select" id="kp-room" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="301">301</option><option value="302">302</option><option value="303">303</option><option value="201">201</option><option value="202">202</option><option value="101">101</option></select></div>' +
    '<div class="form-group"><label class="form-label">密码类型</label>' +
    '<select class="form-select" id="kp-type" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="temp">一次性密码</option><option value="period">时段密码</option><option value="permanent">永久密码</option></select></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">有效期</label>' +
    '<input type="date" class="form-input" id="kp-expire" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">生成数量</label>' +
    '<input type="number" class="form-input" id="kp-count" value="1" min="1" max="10" style="padding:8px 12px;font-size:13px;width:80px;"></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="kp-note" placeholder="如：客人张先生" style="padding:8px 12px;font-size:13px;"></div></div>' +
    '<div style="display:flex;gap:8px;margin-top:4px;">' +
    '<button onclick="generateKeypadPassword()" style="padding:9px 16px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">⚡ 生成密码</button>' +
    '<button onclick="exportKeypadLog()" style="padding:9px 16px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:6px;cursor:pointer;font-size:13px;">📤 导出记录</button></div>' +
    '<div style="margin-top:16px;"><div style="font-size:12px;font-weight:600;margin-bottom:8px;">📋 最近生成的密码</div>' +
    '<div id="kp-recent-list" style="font-size:12px;line-height:1.8;">' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);"><span>301 - 123456</span><span style="color:var(--text-muted);">2026-03-30 14:00</span><span class="tbadge green" style="font-size:10px;padding:2px 6px;">使用中</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);"><span>302 - 234567</span><span style="color:var(--text-muted);">2026-03-30 12:30</span><span class="tbadge green" style="font-size:10px;padding:2px 6px;">使用中</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;"><span>201 - 345678</span><span style="color:var(--text-muted);">2026-03-29 18:00</span><span class="tbadge" style="font-size:10px;padding:2px 6px;background:var(--bg);color:var(--text-muted);">已失效</span></div></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-keypad\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 设置默认有效期为明天
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var dd = String(tomorrow.getDate()).padStart(2, '0');
  var mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  var yyyy = tomorrow.getFullYear();
  var expInput = document.getElementById('kp-expire');
  if (expInput) expInput.value = yyyy + '-' + mm + '-' + dd;
};

window.generateKeypadPassword = function() {
  var room = document.getElementById('kp-room');
  var type = document.getElementById('kp-type');
  var expire = document.getElementById('kp-expire');
  var count = document.getElementById('kp-count');
  var note = document.getElementById('kp-note');
  if (!room || !room.value) { showToast('请选择房间号', 'warning'); return; }
  var typeVal = type ? type.value : 'temp';
  var expireVal = expire ? expire.value : '';
  var countVal = parseInt(count ? count.value : 1) || 1;
  var noteVal = note ? note.value.trim() : '';
  var typeLabel = {temp:'一次性',period:'时段',permanent:'永久'}[typeVal] || '一次性';
  var password = String(Math.floor(100000 + Math.random() * 900000));
  showToast('🔑 密码已生成：' + password + '（' + typeLabel + '）', 'success');
  // 添加到最近列表
  var list = document.getElementById('kp-recent-list');
  if (list) {
    var newItem = document.createElement('div');
    newItem.style = 'display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);';
    newItem.innerHTML = '<span>' + room.value + ' - ' + password + '</span><span style="color:var(--text-muted);">' + new Date().toLocaleString('zh-CN', {hour:'2-digit',minute:'2-digit'}) + '</span><span class="tbadge green" style="font-size:10px;padding:2px 6px;">' + typeLabel + '</span>';
    list.insertBefore(newItem, list.firstChild);
  }
};

window.copyKeypadPassword = function(password) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(password).then(function() {
      showToast('📋 密码已复制', 'success');
    }).catch(function() {
      showToast('复制失败，请手动复制', 'error');
    });
  } else {
    showToast('浏览器不支持剪贴板', 'error');
  }
};

window.exportKeypadLog = function() {
  showToast('📤 密码记录导出中...', 'info');
  var rows = [['房间号', '密码', '类型', '有效期', '生成时间', '状态']];
  var list = document.getElementById('kp-recent-list');
  if (list) {
    list.querySelectorAll('div[style*="border-bottom"]').forEach(function(item) {
      var parts = item.textContent.split('-');
      if (parts.length >= 2) rows.push([parts[0].trim(), parts[1].trim(), '一次性密码', '2026-03-31', '2026-03-30', '使用中']);
    });
  }
  var csv = rows.map(function(r) { return r.join(','); }).join('\n');
  var blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '密码管理记录_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 记录已导出', 'success');
};

// -------- 改进5: 报表函数 --------
window.openReportModal = function() {
  var existing = document.getElementById('modal-report');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-report" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-report\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">📊</div><div style="font-size:15px;font-weight:700;">数据报表中心</div>' +
    '<button onclick="document.getElementById(\'modal-report\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;cursor:pointer;" onclick="exportReportPDF(\'入住\')">' +
    '<div style="font-size:20px;margin-bottom:6px;">🏨</div><div style="font-size:12px;font-weight:600;">入住报告</div><div style="font-size:10px;color:var(--text-muted);">月度入住率分析</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;cursor:pointer;" onclick="exportReportPDF(\'营收\')">' +
    '<div style="font-size:20px;margin-bottom:6px;">💰</div><div style="font-size:12px;font-weight:600;">营收报表</div><div style="font-size:10px;color:var(--text-muted);">每日营收统计</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border-radius:8px;cursor:pointer;" onclick="exportReportPDF(\'设备\')">' +
    '<div style="font-size:20px;margin-bottom:6px;">📡</div><div style="font-size:12px;font-weight:600;">设备报告</div><div style="font-size:10px;color:var(--text-muted);">设备运行状态</div></div>' +
    '<div style="padding:14px;background:var(--purple-bg);border-radius:8px;cursor:pointer;" onclick="exportReportPDF(\'工单\')">' +
    '<div style="font-size:20px;margin-bottom:6px;">🔧</div><div style="font-size:12px;font-weight:600;">工单报告</div><div style="font-size:10px;color:var(--text-muted);">工单处理统计</div></div></div>' +
    '<div class="form-group"><label class="form-label">报表日期范围</label>' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<input type="date" class="form-input" id="report-start" style="padding:8px 12px;font-size:13px;flex:1;">' +
    '<span style="color:var(--text-muted);font-size:12px;">至</span>' +
    '<input type="date" class="form-input" id="report-end" style="padding:8px 12px;font-size:13px;flex:1;"></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-report\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button>' +
    '<button onclick="exportReportPDF(\'综合\')" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">📤 导出综合报表</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 设置默认日期范围
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  var startDate = yyyy + '-' + mm + '-01';
  var endDate = yyyy + '-' + mm + '-' + dd;
  var startInput = document.getElementById('report-start');
  var endInput = document.getElementById('report-end');
  if (startInput) startInput.value = startDate;
  if (endInput) endInput.value = endDate;
};

window.exportReportPDF = function(type) {
  showToast('📤 ' + type + '报表正在生成中...', 'info');
  // 模拟生成PDF（浏览器无PDF库，生成CSV代替）
  setTimeout(function() {
    var rows = [['报表类型', '日期', '数据1', '数据2', '合计']];
    for (var i = 1; i <= 10; i++) {
      rows.push([type, '2026-03-' + String(i).padStart(2, '0'), String(i * 10), String(i * 20), String(i * 30)]);
    }
    var csv = rows.map(function(r) { return r.join(','); }).join('\n');
    var blob = new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = type + '报表_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ ' + type + '报表已导出', 'success');
    var m = document.getElementById('modal-report');
    if (m) m.remove();
  }, 800);
};
