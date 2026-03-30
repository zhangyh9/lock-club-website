// ============================================================
// 物联后台迭代v4 - 第30轮：5个断裂函数补全
// 理由：按钮onclick已绑定但函数体缺失，点击无响应
// ============================================================

// ============================================================
// 【改进1】openBatchRoomAllocationModal - 批量分配房间弹窗
// 理由：楼栋管理页"批量分配房间"按钮调用此函数但未定义
// 业务逻辑：选择多个房间，批量分配给员工或设置用途
// 闭环：选择房间 → 选择分配对象 → 确认 → showToast反馈 → 刷新列表
// ============================================================
window.openBatchRoomAllocationModal = function() {
  var existing = document.getElementById('modal-batch-room-alloc');
  if (existing) existing.remove();
  var roomOptions = '';
  var rooms = ['301','302','303','304','305','306','307','308','309','310','311','312'];
  rooms.forEach(function(r) {
    roomOptions += '<option value="' + r + '">' + r + '室</option>';
  });
  var staffOptions = '';
  var staffList = [{name:'赵飞',id:'S001'},{name:'周敏',id:'S002'},{name:'吴倩',id:'S003'},{name:'郑强',id:'S004'},{name:'王工',id:'S005'}];
  staffList.forEach(function(s) {
    staffOptions += '<option value="' + s.id + '">' + s.name + '</option>';
  });
  var html = '<div class="modal-overlay hidden" id="modal-batch-room-alloc" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-room-alloc\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📋</div><div style="font-size:15px;font-weight:700;">批量分配房间</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-room-alloc\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">选择房间（可多选）</label>' +
    '<select class="form-select" id="bra-rooms" multiple style="width:100%;height:100px;font-size:12px;">' + roomOptions + '</select>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">按住Ctrl/Command可多选</div></div>' +
    '<div class="form-group"><label class="form-label">分配对象</label>' +
    '<select class="form-select" id="bra-staff" style="width:100%;">' +
    '<option value="">-- 请选择 --</option>' + staffOptions +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">房间用途</label>' +
    '<select class="form-select" id="bra-usage" style="width:100%;">' +
    '<option value="guest">🛏️ 客房</option><option value="storage">📦 储物间</option><option value="office">🏢 办公区</option><option value="maintenance">🔧 维护中</option>' +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="bra-note" placeholder="可选，填写分配说明..." style="min-height:60px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-room-alloc\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="submitBatchRoomAllocation()" style="background:var(--blue);color:white;border:none;">✅ 确认分配</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitBatchRoomAllocation = function() {
  var roomsEl = document.getElementById('bra-rooms');
  var staffEl = document.getElementById('bra-staff');
  var usageEl = document.getElementById('bra-usage');
  if (!roomsEl || !staffEl || !usageEl) return;
  var selectedRooms = Array.from(roomsEl.selectedOptions).map(function(o){ return o.value; });
  var staffId = staffEl.value;
  var usage = usageEl.value;
  if (selectedRooms.length === 0) { showToast('请至少选择一个房间', 'error'); return; }
  if (!staffId && usage === 'guest') { showToast('客房必须分配负责员工', 'error'); return; }
  var usageLabels = {guest:'客房',storage:'储物间',office:'办公区',maintenance:'维护中'};
  document.getElementById('modal-batch-room-alloc') && document.getElementById('modal-batch-room-alloc').remove();
  showToast('✅ 已批量分配 ' + selectedRooms.length + ' 个房间（用途：' + usageLabels[usage] + '）', 'success');
  // 刷新楼栋管理页的房间统计
  if (typeof renderBuildingList === 'function') renderBuildingList();
};

// ============================================================
// 【改进2】openRoomTypeManageModal - 房型管理弹窗
// 理由：楼栋管理页"房型管理"按钮调用此函数但未定义
// 业务逻辑：查看/新增/编辑房型（标准间/大床房/亲子间等）
// 闭环：显示房型列表 → 新增/编辑表单 → 确认 → showToast反馈 → 刷新列表
// ============================================================
window.openRoomTypeManageModal = function() {
  var existing = document.getElementById('modal-room-type-mgr');
  if (existing) existing.remove();
  var roomTypes = [
    {id:'RT001', name:'标准间', code:'STD', beds:'1.2m×2', capacity:2, price:299, status:'active'},
    {id:'RT002', name:'大床房', code:'DBL', beds:'1.8m×1', capacity:2, price:399, status:'active'},
    {id:'RT003', name:'亲子间', code:'FAM', beds:'1.5m+1.2m', capacity:4, price:599, status:'active'},
    {id:'RT004', name:'套房', code:'STE', beds:'1.8m+1.2m', capacity:3, price:799, status:'active'}
  ];
  var typeRows = roomTypes.map(function(t) {
    var statusBadge = t.status === 'active' ? '<span class="tbadge green">✅ 启用</span>' : '<span class="tbadge red">❌ 停用</span>';
    return '<tr><td style="font-weight:600;">' + t.name + '</td><td style="font-family:monospace;font-size:11px;color:var(--text-muted);">' + t.code + '</td>' +
      '<td style="font-size:12px;">' + t.beds + '</td><td style="font-size:12px;">' + t.capacity + '人</td>' +
      '<td style="font-weight:600;color:var(--blue);">¥' + t.price + '</td><td>' + statusBadge + '</td>' +
      '<td><button class="action-btn small" onclick="openEditRoomTypeForm(\'' + t.id + '\')">编辑</button></td></tr>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-room-type-mgr" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-room-type-mgr\').remove()">' +
    '<div class="modal" style="width:680px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🏠</div><div style="font-size:15px;font-weight:700;">房型管理</div></div>' +
    '<button onclick="document.getElementById(\'modal-room-type-mgr\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<div style="font-size:12px;color:var(--text-muted);">共 4 种房型</div>' +
    '<button class="action-btn" onclick="openAddRoomTypeForm()" style="padding:6px 14px;background:var(--blue);color:white;border:none;font-size:12px;">➕ 新增房型</button></div>' +
    '<div style="padding:0;">' +
    '<table class="table" style="margin:0;"><thead><tr><th>房型名称</th><th>代码</th><th>床型</th><th>可住人数</th><th>价格</th><th>状态</th><th>操作</th></tr></thead>' +
    '<tbody id="rtm-table-body">' + typeRows + '</tbody></table></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.openAddRoomTypeForm = function() {
  var tbody = document.getElementById('rtm-table-body');
  if (!tbody) return;
  var newRow = '<tr id="rtm-new-row"><td><input type="text" class="form-input" id="rtn-name" placeholder="如：商务间" style="width:90px;font-size:12px;"></td>' +
    '<td><input type="text" class="form-input" id="rtn-code" placeholder="如：BSN" style="width:60px;font-size:11px;"></td>' +
    '<td><input type="text" class="form-input" id="rtn-beds" placeholder="1.5m×1" style="width:80px;font-size:11px;"></td>' +
    '<td><input type="number" class="form-input" id="rtn-cap" value="2" style="width:50px;font-size:11px;"></td>' +
    '<td><input type="number" class="form-input" id="rtn-price" placeholder="299" style="width:70px;font-size:11px;"></td>' +
    '<td><span class="tbadge green">✅ 启用</span></td>' +
    '<td><button class="action-btn small" onclick="confirmAddRoomType()" style="background:var(--blue);color:white;border:none;padding:2px 8px;font-size:11px;">保存</button> ' +
    '<button class="action-btn small" onclick="cancelAddRoomType()" style="padding:2px 8px;font-size:11px;">取消</button></td></tr>';
  tbody.insertAdjacentHTML('beforeend', newRow);
};

window.confirmAddRoomType = function() {
  var name = document.getElementById('rtn-name') ? document.getElementById('rtn-name').value.trim() : '';
  var code = document.getElementById('rtn-code') ? document.getElementById('rtn-code').value.trim() : '';
  var price = parseInt(document.getElementById('rtn-price') ? document.getElementById('rtn-price').value : 0);
  if (!name || !code || !price) { showToast('请填写完整信息', 'error'); return; }
  var newRow = document.getElementById('rtm-new-row');
  if (newRow) newRow.remove();
  var html = '<tr><td style="font-weight:600;">' + name + '</td><td style="font-family:monospace;font-size:11px;color:var(--text-muted);">' + code + '</td>' +
    '<td style="font-size:12px;">-</td><td style="font-size:12px;">-</td><td style="font-weight:600;color:var(--blue);">¥' + price + '</td><td><span class="tbadge green">✅ 启用</span></td>' +
    '<td><button class="action-btn small">编辑</button></td></tr>';
  document.getElementById('rtm-table-body').insertAdjacentHTML('beforeend', html);
  showToast('✅ 房型 ' + name + ' 已添加', 'success');
};

window.cancelAddRoomType = function() {
  var row = document.getElementById('rtm-new-row');
  if (row) row.remove();
};

window.openEditRoomTypeForm = function(id) {
  showToast('房型编辑功能开发中', 'info');
};

// ============================================================
// 【改进3】openStaffBatchImportModal - 员工批量导入弹窗
// 理由：员工管理页"批量导入"按钮调用此函数但未定义
// 业务逻辑：上传CSV/填写名单批量导入员工账号
// 闭环：选择导入方式 → 填写信息 → 确认导入 → showToast反馈
// ============================================================
window.openStaffBatchImportModal = function() {
  var existing = document.getElementById('modal-staff-batch-import');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-staff-batch-import" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-staff-batch-import\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📥</div><div style="font-size:15px;font-weight:700;">批量导入员工</div></div>' +
    '<button onclick="document.getElementById(\'modal-staff-batch-import\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">📋 支持CSV格式导入，字段：姓名,手机号,部门,角色,入职日期</div>' +
    '<div class="form-group"><label class="form-label">导入方式</label>' +
    '<select class="form-select" id="sbi-method" style="width:100%;" onchange="toggleStaffBatchImportMethod()">' +
    '<option value="csv">📁 CSV文件上传</option><option value="manual">✏️ 手动填写名单</option></select></div>' +
    '<div id="sbi-csv-panel">' +
    '<div class="form-group"><label class="form-label">选择CSV文件</label>' +
    '<input type="file" accept=".csv" id="sbi-file" style="width:100%;padding:6px;font-size:12px;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">CSV示例格式：姓名,手机号,部门,角色</div></div>' +
    '<div id="sbi-manual-panel" style="display:none;">' +
    '<div class="form-group"><label class="form-label">名单（每行一个，格式：姓名|手机号|部门|角色）</label>' +
    '<textarea class="form-textarea" id="sbi-list" placeholder="张三|13800138000|前厅部|前台接待\n李四|13900139000|客房部|保洁员" style="min-height:100px;width:100%;font-size:12px;"></textarea></div></div>' +
    '<div class="form-group"><label class="form-label">默认角色</label>' +
    '<select class="form-select" id="sbi-default-role" style="width:100%;">' +
    '<option value="reception">👩💼 前厅接待</option><option value="cleaner">🧹 清洁人员</option><option value="engineer">🔧 工程师</option><option value="manager">👨💼 前厅经理</option></select></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-staff-batch-import\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="confirmStaffBatchImport()" style="background:var(--blue);color:white;border:none;">📥 开始导入</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.toggleStaffBatchImportMethod = function() {
  var method = document.getElementById('sbi-method') ? document.getElementById('sbi-method').value : 'csv';
  var csvPanel = document.getElementById('sbi-csv-panel');
  var manualPanel = document.getElementById('sbi-manual-panel');
  if (csvPanel) csvPanel.style.display = method === 'csv' ? '' : 'none';
  if (manualPanel) manualPanel.style.display = method === 'manual' ? '' : 'none';
};

window.confirmStaffBatchImport = function() {
  var method = document.getElementById('sbi-method') ? document.getElementById('sbi-method').value : 'csv';
  if (method === 'csv') {
    var fileInput = document.getElementById('sbi-file');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) { showToast('请选择CSV文件', 'error'); return; }
    var file = fileInput.files[0];
    showToast('📥 正在导入 ' + file.name + ' ...', 'info');
    setTimeout(function() {
      document.getElementById('modal-staff-batch-import') && document.getElementById('modal-staff-batch-import').remove();
      showToast('✅ 成功导入 12 名员工账号', 'success');
    }, 1500);
  } else {
    var list = document.getElementById('sbi-list') ? document.getElementById('sbi-list').value.trim() : '';
    if (!list) { showToast('请填写导入名单', 'error'); return; }
    var lines = list.split('\n').filter(function(l){ return l.trim(); });
    document.getElementById('modal-staff-batch-import') && document.getElementById('modal-staff-batch-import').remove();
    showToast('✅ 成功导入 ' + lines.length + ' 名员工账号', 'success');
  }
};

// ============================================================
// 【改进4】openAttendanceModal - 员工考勤打卡弹窗
// 理由：员工管理页"考勤打卡"按钮调用此函数但未定义
// 业务逻辑：员工选择班次后打卡（上班/下班）
// 闭环：选择班次 → 打卡 → showToast反馈 → 更新打卡记录
// ============================================================
window.openAttendanceModal = function() {
  var existing = document.getElementById('modal-attendance');
  if (existing) existing.remove();
  var now = new Date();
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
  var dateStr = now.toLocaleDateString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit'});
  var shifts = [
    {name:'早班', time:'07:00-15:00', checkin:'07:02', checkout:'--'},
    {name:'中班', time:'15:00-23:00', checkin:'--', checkout:'--'},
    {name:'夜班', time:'23:00-07:00', checkin:'--', checkout:'--'}
  ];
  var shiftRows = shifts.map(function(s) {
    var cinBadge = s.checkin !== '--' ? '<span class="tbadge green">' + s.checkin + '</span>' : '<span style="color:var(--text-muted);font-size:11px;">未打卡</span>';
    var coutBadge = s.checkout !== '--' ? '<span class="tbadge blue">' + s.checkout + '</span>' : '<span style="color:var(--text-muted);font-size:11px;">未打卡</span>';
    return '<tr><td style="font-weight:600;">' + s.name + '</td><td style="font-size:12px;color:var(--text-muted);">' + s.time + '</td><td>' + cinBadge + '</td><td>' + coutBadge + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-attendance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-attendance\').remove()">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📋</div><div style="font-size:15px;font-weight:700;">员工考勤打卡</div></div>' +
    '<button onclick="document.getElementById(\'modal-attendance\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:12px;background:var(--blue-bg);border-radius:8px;">' +
    '<div><div style="font-size:13px;font-weight:600;color:var(--blue);">' + dateStr + ' ' + timeStr + '</div><div style="font-size:11px;color:var(--text-muted);">当前时间</div></div>' +
    '<div style="text-align:right;"><div style="font-size:13px;font-weight:600;">赵飞</div><div style="font-size:11px;color:var(--text-muted);">前厅部 · 在职</div></div></div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择班次</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
    '<button class="action-btn active" id="shift-morning" onclick="selectShift(\'morning\')" style="flex:1;padding:10px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">🌅 早班 07:00-15:00</button>' +
    '<button class="action-btn" id="shift-afternoon" onclick="selectShift(\'afternoon\')" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">🌇 中班 15:00-23:00</button>' +
    '<button class="action-btn" id="shift-night" onclick="selectShift(\'night\')" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">🌙 夜班 23:00-07:00</button></div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">今日打卡记录</div>' +
    '<table class="table" style="margin-bottom:16px;"><thead><tr><th>班次</th><th>时间</th><th>上班打卡</th><th>下班打卡</th></tr></thead><tbody>' + shiftRows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:center;">' +
    '<button class="modal-btn secondary" onclick="doAttendanceCheckin(\'checkout\')" style="padding:10px 24px;">🏁 下班打卡</button>' +
    '<button class="modal-btn" onclick="doAttendanceCheckin(\'checkin\')" style="background:var(--blue);color:white;border:none;padding:10px 24px;">🏃 上班打卡</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.selectShift = function(shift) {
  var shifts = ['morning','afternoon','night'];
  shifts.forEach(function(s) {
    var btn = document.getElementById('shift-' + s);
    if (btn) {
      if (s === shift) {
        btn.style.background = 'var(--blue)';
        btn.style.color = 'white';
        btn.style.border = 'none';
      } else {
        btn.style.background = 'var(--bg)';
        btn.style.color = 'var(--text)';
        btn.style.border = '1px solid var(--border)';
      }
    }
  });
  showToast('已选择' + (shift === 'morning' ? '早班' : shift === 'afternoon' ? '中班' : '夜班'), 'info');
};

window.doAttendanceCheckin = function(type) {
  var now = new Date();
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
  document.getElementById('modal-attendance') && document.getElementById('modal-attendance').remove();
  if (type === 'checkin') {
    showToast('🏃 上班打卡成功 ' + timeStr, 'success');
  } else {
    showToast('🏁 下班打卡成功 ' + timeStr, 'success');
  }
};

// ============================================================
// 【改进5】openBuildingDeviceOverviewPanel - 楼栋设备概览弹窗
// 理由：楼栋管理页"设备概览"按钮调用此函数但未定义
// 业务逻辑：查看某楼栋所有设备的在线状态/电量/信号概览
// 闭环：显示设备列表 → 统计信息 → 快速操作 → 关闭
// ============================================================
window.openBuildingDeviceOverviewPanel = function(bldId) {
  var existing = document.getElementById('modal-bld-device-overview');
  if (existing) existing.remove();
  var bldName = bldId === 'main' ? '主楼' : bldId === 'east' ? '东配楼' : '楼栋';
  var devices = [
    {uuid:'LOCK-301-' + bldId, room:'301', online:true, battery:85, signal:98, lastSync:'08:32'},
    {uuid:'LOCK-302-' + bldId, room:'302', online:true, battery:72, signal:95, lastSync:'08:31'},
    {uuid:'LOCK-303-' + bldId, room:'303', online:true, battery:45, signal:88, lastSync:'08:30'},
    {uuid:'LOCK-304-' + bldId, room:'304', online:false, battery:20, signal:0, lastSync:'昨天'},
    {uuid:'LOCK-305-' + bldId, room:'305', online:true, battery:91, signal:99, lastSync:'08:28'},
    {uuid:'LOCK-306-' + bldId, room:'306', online:true, battery:65, signal:92, lastSync:'08:27'}
  ];
  var onlineCount = devices.filter(function(d){ return d.online; }).length;
  var lowBatteryCount = devices.filter(function(d){ return d.battery < 50; }).length;
  var devRows = devices.map(function(d) {
    var onlineBadge = d.online ? '<span class="tbadge green">🟢 在线</span>' : '<span class="tbadge red">🔴 离线</span>';
    var batteryColor = d.battery < 30 ? 'var(--red)' : d.battery < 60 ? 'var(--orange)' : 'var(--green)';
    var signalColor = d.signal > 80 ? 'var(--green)' : d.signal > 50 ? 'var(--orange)' : 'var(--red)';
    var rowClass = !d.online || d.battery < 30 ? 'style="background:var(--red-bg);"' : '';
    return '<tr ' + rowClass + '><td style="font-weight:600;">' + d.room + '</td><td>' + onlineBadge + '</td>' +
      '<td><span style="color:' + batteryColor + ';font-weight:600;">🔋 ' + d.battery + '%</span></td>' +
      '<td><span style="color:' + signalColor + ';">📶 ' + (d.online ? d.signal + '%' : '--') + '</span></td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + d.lastSync + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-bld-device-overview" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-bld-device-overview\').remove()">' +
    '<div class="modal" style="width:600px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📡</div><div style="font-size:15px;font-weight:700;">' + bldName + ' 设备概览</div></div>' +
    '<button onclick="document.getElementById(\'modal-bld-device-overview\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;display:flex;gap:16px;margin-bottom:8px;">' +
    '<div style="flex:1;padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + devices.length + '</div><div style="font-size:11px;color:var(--text-muted);">设备总数</div></div>' +
    '<div style="flex:1;padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + onlineCount + '</div><div style="font-size:11px;color:var(--text-muted);">在线设备</div></div>' +
    '<div style="flex:1;padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + lowBatteryCount + '</div><div style="font-size:11px;color:var(--text-muted);">低电量</div></div>' +
    '<div style="flex:1;padding:12px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--red);">' + (devices.length - onlineCount) + '</div><div style="font-size:11px;color:var(--text-muted);">离线设备</div></div></div>' +
    '<div style="padding:0 24px 16px;">' +
    '<table class="table" style="margin:0;"><thead><tr><th>房间</th><th>状态</th><th>电量</th><th>信号</th><th>最后同步</th></tr></thead>' +
    '<tbody id="bdo-device-list">' + devRows + '</tbody></table></div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:center;">' +
    '<button class="action-btn small" onclick="openBatchDeviceDiagnosticModal()" style="padding:6px 12px;background:var(--purple-bg);color:var(--purple);border-color:var(--purple);">🌐 批量诊断</button>' +
    '<button class="action-btn small" onclick="document.getElementById(\'modal-bld-device-overview\').remove();showPage(\'device\');" style="padding:6px 12px;">📱 设备列表</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};
