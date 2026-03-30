// ============================================================
// 物联后台迭代v4-iter16.js - 5个功能性断裂修复
// 修复：高频onclick调用函数存在但函数体缺失
// ============================================================

// ============================================================
// 【改进1】hmClickRoom - 首页房间卡片点击函数（13处调用）
// 理由：line多处 onclick="hmClickRoom(...)" 但函数体缺失
// 业务逻辑：点击首页房间卡片→打开房间详情或执行快速操作
// ============================================================
window.hmClickRoom = function(roomNum, el) {
  if (!roomNum) return;
  // Highlight selected
  var cards = document.querySelectorAll('.hm-room-card, .room-card, [data-room]');
  cards.forEach(function(c) { c.style.outline = ''; c.style.boxShadow = ''; });
  if (el) { el.style.outline = '2px solid var(--blue)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }
  // Show room detail modal
  var roomData = {
    num: roomNum,
    floor: Math.floor(roomNum / 100) || 3,
    type: '标准间',
    status: '空房',
    lock: { uuid: 'LOCK-' + roomNum + '-001', battery: 85, signal: -45, lastUnlock: '10:32' }
  };
  // Try to find in local data
  if (typeof roomStore !== 'undefined' && Array.isArray(roomStore)) {
    var r = roomStore.find(function(x) { return x.num == roomNum || x.id == roomNum; });
    if (r) { roomData = Object.assign(roomData, r); }
  }
  var statusMap = {vacant:'空房', occupied:'入住', maintenance:'维修', cleaning:'清洁'};
  var statusColor = {vacant:'var(--green)', occupied:'var(--blue)', maintenance:'var(--orange)', cleaning:'var(--purple)'};
  var statusBg = {vacant:'var(--green-bg)', occupied:'var(--blue-bg)', maintenance:'var(--orange-bg)', cleaning:'var(--purple-bg)'};
  var status = roomData.status || 'vacant';
  var existing = document.getElementById('modal-hm-room-detail');
  if (existing) existing.remove();
  var html = '<div id="modal-hm-room-detail" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:90vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">🚪 房间 ' + roomNum + ' 详情</div>' +
    '<button onclick="document.getElementById(\'modal-hm-room-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房型</div><div style="font-weight:600;font-size:14px;">' + (roomData.type || '标准间') + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">状态</div><div style="font-weight:600;font-size:14px;"><span style="padding:2px 8px;background:' + (statusBg[status]||'var(--gray-bg)') + ';color:' + (statusColor[status]||'var(--gray)') + ';border-radius:10px;">' + (statusMap[status]||status) + '</span></div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">楼层</div><div style="font-weight:600;font-size:14px;">' + (roomData.floor || Math.floor(roomNum/100)) + '层</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">门锁电量</div><div style="font-weight:600;font-size:14px;color:' + (roomData.lock && roomData.lock.battery < 20 ? 'var(--red)' : 'var(--green)') + ';">' + (roomData.lock ? roomData.lock.battery + '%' : '85%') + '</div></div></div>' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">门锁UUID</div>' +
    '<div style="font-size:13px;font-weight:500;word-break:break-all;">' + (roomData.lock ? roomData.lock.uuid : 'LOCK-' + roomNum + '-001') + '</div></div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">快捷操作</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
    '<button onclick="doQuickUnlock(\'' + roomNum + '\');document.getElementById(\'modal-hm-room-detail\').remove()" style="padding:10px 8px;background:white;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;display:flex;flex-direction:column;align-items:center;gap:4px;">🔓<span>远程开锁</span></button>' +
    '<button onclick="goToRoomDetail(\'' + roomNum + '\');document.getElementById(\'modal-hm-room-detail\').remove()" style="padding:10px 8px;background:white;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;display:flex;flex-direction:column;align-items:center;gap:4px;">📋<span>房间详情</span></button>' +
    '<button onclick="doQuickTempPwd(\'' + roomNum + '\');document.getElementById(\'modal-hm-room-detail\').remove()" style="padding:10px 8px;background:white;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;display:flex;flex-direction:column;align-items:center;gap:4px;">🔑<span>临时密码</span></button></div></div>' +
    '<div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hm-room-detail\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📍 已打开房间 ' + roomNum + ' 详情', 'info');
};

// ============================================================
// 【改进2】openScheduleCellEdit - 排班表格单元格编辑函数（35处调用，全局最高）
// 理由：35处 onclick="openScheduleCellEdit(...)" 调用但函数体缺失
// 业务逻辑：点击排班单元格→打开编辑弹窗选择班次/人员
// ============================================================
window.openScheduleCellEdit = function(dateStr, staffId, staffName, shiftType) {
  var shiftTypes = [
    {id:'morning', name:'早班', color:'var(--blue)', bg:'var(--blue-bg)', time:'08:00-16:00'},
    {id:'afternoon', name:'中班', color:'var(--orange)', bg:'var(--orange-bg)', time:'16:00-24:00'},
    {id:'night', name:'夜班', color:'var(--purple)', bg:'var(--purple-bg)', time:'00:00-08:00'},
    {id:'off', name:'休息', color:'var(--green)', bg:'var(--green-bg)', time:'-'},
    {id:'leave', name:'请假', color:'var(--red)', bg:'var(--red-bg)', time:'-'}
  ];
  var currentShift = shiftType || 'off';
  var shiftsHtml = shiftTypes.map(function(s) {
    var checked = s.id === currentShift ? 'checked' : '';
    var style = s.id === currentShift ? 'border-color:' + s.color + ';background:' + s.bg + ';' : '';
    return '<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:2px solid var(--border);border-radius:8px;cursor:pointer;margin-bottom:6px;' + style + '">' +
      '<input type="radio" name="shift-type" value="' + s.id + '" ' + checked + ' style="accent-color:' + s.color + ';">' +
      '<span style="font-weight:600;color:' + s.color + ';">' + s.name + '</span>' +
      '<span style="flex:1;"></span>' +
      '<span style="font-size:11px;color:var(--text-muted);">' + s.time + '</span></label>';
  }).join('');
  var existing = document.getElementById('modal-schedule-cell-edit');
  if (existing) existing.remove();
  var html = '<div id="modal-schedule-cell-edit" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-schedule-cell-edit\').remove()">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📅 排班编辑</div>' +
    '<button onclick="document.getElementById(\'modal-schedule-cell-edit\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="padding:10px 14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:12px;color:var(--blue);margin-bottom:2px;">📆 排班日期</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--blue);">' + dateStr + '</div></div>' +
    '<div style="padding:10px 14px;background:var(--bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">👤 员工</div>' +
    '<div style="font-size:14px;font-weight:600;">' + (staffName || '未分配') + '</div></div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择班次</div>' +
    '<div id="shift-options">' + shiftsHtml + '</div>' +
    '<div style="margin-top:12px;font-size:12px;color:var(--text-muted);">💡 点击班次选项即可直接保存</div></div>' +
    '<div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-schedule-cell-edit\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="saveScheduleCell(\'' + dateStr + '\',\'' + staffId + '\')" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 保存班次</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // Add radio change listeners to update style
  setTimeout(function() {
    var radios = document.querySelectorAll('input[name="shift-type"]');
    radios.forEach(function(r) {
      r.addEventListener('change', function() {
        var opts = document.querySelectorAll('#shift-options label');
        opts.forEach(function(lbl) { lbl.style.borderColor = 'var(--border)'; lbl.style.background = ''; });
        r.closest('label').style.borderColor = r.value && {'morning':'var(--blue)','afternoon':'var(--orange)','night':'var(--purple)','off':'var(--green)','leave':'var(--red)'}[r.value] || 'var(--blue)';
        r.closest('label').style.background = r.value && {'morning':'var(--blue-bg)','afternoon':'var(--orange-bg)','night':'var(--purple-bg)','off':'var(--green-bg)','leave':'var(--red-bg)'}[r.value] || '';
      });
    });
  }, 100);
};

window.saveScheduleCell = function(dateStr, staffId) {
  var radios = document.querySelectorAll('input[name="shift-type"]');
  var selected = null;
  radios.forEach(function(r) { if (r.checked) selected = r.value; });
  if (!selected) { showToast('请选择一个班次', 'warning'); return; }
  var shiftNames = {morning:'早班', afternoon:'中班', night:'夜班', off:'休息', leave:'请假'};
  document.getElementById('modal-schedule-cell-edit') && document.getElementById('modal-schedule-cell-edit').remove();
  showToast('✅ ' + dateStr + ' 班次已更新为「' + shiftNames[selected] + '」', 'success');
  // Try to update the cell in the schedule grid if render function exists
  if (typeof renderScheduleCell === 'function') renderScheduleCell(dateStr, staffId, selected);
};

// ============================================================
// 【改进3】openBuildingManagementModal - 楼栋管理总览弹窗（1处调用）
// 理由：onclick="openBuildingManagementModal()" 但函数体缺失
// 业务逻辑：打开楼栋总览弹窗，显示所有楼栋列表和统计数据
// ============================================================
window.openBuildingManagementModal = function() {
  var buildings = [
    {id:'main', name:'主楼', code:'A', floors:3, rooms:24, online:22, offline:2, alarm:1},
    {id:'east', name:'东配楼', code:'B', floors:2, rooms:16, online:15, offline:1, alarm:0}
  ];
  if (typeof buildingStore !== 'undefined' && Array.isArray(buildingStore) && buildingStore.length > 0) {
    buildings = buildingStore;
  }
  var rows = buildings.map(function(b) {
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;"><span style="font-weight:600;">' + b.name + '</span><br><span style="font-size:11px;color:var(--text-muted);">' + b.code + '栋</span></td>' +
      '<td style="padding:10px 8px;text-align:center;">' + b.floors + '层</td>' +
      '<td style="padding:10px 8px;text-align:center;">' + b.rooms + '间</td>' +
      '<td style="padding:10px 8px;text-align:center;"><span style="color:var(--green);">' + (b.online||0) + '台</span></td>' +
      '<td style="padding:10px 8px;text-align:center;"><span style="color:' + ((b.offline||0)>0?'var(--red)':'var(--text-muted)') + ';">' + (b.offline||0) + '台</span></td>' +
      '<td style="padding:10px 8px;text-align:center;"><span style="color:' + ((b.alarm||0)>0?'var(--orange)':'var(--text-muted)') + ';">' + (b.alarm||0) + '个</span></td>' +
      '<td style="padding:10px 8px;text-align:center;">' +
      '<button class="action-btn small" onclick="openBuildingDeviceOverviewPanel(\'' + b.id + '\')" style="padding:3px 8px;font-size:11px;">📶 设备</button> ' +
      '<button class="action-btn small" onclick="openBuildingFloorManage(\'' + b.id + '\')" style="padding:3px 8px;font-size:11px;">🏠 楼层</button></td></tr>';
  }).join('');
  var existing = document.getElementById('modal-building-manage');
  if (existing) existing.remove();
  var html = '<div id="modal-building-manage" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-building-manage\').remove()">' +
    '<div class="modal" style="width:800px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">🏢 楼栋管理总览</div>' +
    '<button onclick="document.getElementById(\'modal-building-manage\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--blue-bg);">' +
    '<button class="action-btn" onclick="openAddBuildingForm()" style="padding:8px 16px;background:var(--blue);color:white;border:none;font-size:13px;font-weight:600;border-radius:6px;">➕ 新增楼栋</button>' +
    '<button class="action-btn" onclick="openBuildingCRUDForm()" style="padding:8px 16px;background:white;border:1px solid var(--border);font-size:13px;border-radius:6px;">🏗️ 批量楼栋配置</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 20px;">' +
    '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:12px;">' +
    '<thead><tr style="background:var(--bg);color:var(--text-muted);font-size:11px;font-weight:600;text-align:center;">' +
    '<th style="padding:8px;text-align:left;">楼栋</th><th style="padding:8px;">楼层</th><th style="padding:8px;">房间</th><th style="padding:8px;">在线</th><th style="padding:8px;">离线</th><th style="padding:8px;">告警</th><th style="padding:8px;">操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-building-manage\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('🏢 已打开楼栋管理总览（共' + buildings.length + '栋）', 'info');
};

// ============================================================
// 【改进4】openFloorSyncAllModal - 楼层全量同步弹窗（1处调用）
// 理由：onclick="openFloorSyncAllModal()" 但函数体缺失
// 业务逻辑：打开楼层全量同步弹窗，可对整层楼设备执行同步/开锁等操作
// ============================================================
window.openFloorSyncAllModal = function(floorNum, buildingId) {
  floorNum = floorNum || 3;
  buildingId = buildingId || 'main';
  var rooms = ['301','302','303','304','305','306','307','308'];
  if (typeof floorRoomsMap !== 'undefined' && floorRoomsMap[floorNum]) {
    rooms = floorRoomsMap[floorNum];
  }
  var roomCheckboxes = rooms.map(function(r) {
    return '<label style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg);border-radius:6px;cursor:pointer;font-size:13px;">' +
      '<input type="checkbox" checked class="fsync-room" value="' + r + '" style="accent-color:var(--blue);">' +
      '<span>🚪 ' + r + '</span></label>';
  }).join('');
  var existing = document.getElementById('modal-floor-sync-all');
  if (existing) existing.remove();
  var html = '<div id="modal-floor-sync-all" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-sync-all\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">🔄 楼层全量同步 - ' + floorNum + '层</div>' +
    '<button onclick="document.getElementById(\'modal-floor-sync-all\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
    '<div style="font-size:13px;font-weight:600;">选择房间（' + rooms.length + '间）</div>' +
    '<button onclick="var cbs=document.querySelectorAll(\'.fsync-room\');cbs.forEach(function(c){c.checked=true;})" style="background:none;border:none;color:var(--blue);cursor:pointer;font-size:12px;">全选</button></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;max-height:200px;overflow-y:auto;padding:4px;">' + roomCheckboxes + '</div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">选择操作</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<button onclick="executeFloorSyncAll(\'sync\')" style="padding:12px;background:var(--blue);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🔄 设备状态同步</button>' +
    '<button onclick="executeFloorSyncAll(\'unlock\')" style="padding:12px;background:var(--orange);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🔓 批量远程开锁</button>' +
    '<button onclick="executeFloorSyncAll(\'battery\')" style="padding:12px;background:var(--green);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🔋 电量检测</button>' +
    '<button onclick="executeFloorSyncAll(\'alarm\')" style="padding:12px;background:var(--red);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🚨 告警检查</button></div></div>' +
    '<div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-floor-sync-all\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.executeFloorSyncAll = function(op) {
  var rooms = [];
  document.querySelectorAll('.fsync-room:checked').forEach(function(cb) { rooms.push(cb.value); });
  if (rooms.length === 0) { showToast('请先选择房间', 'warning'); return; }
  var opNames = {sync:'设备状态同步', unlock:'批量远程开锁', battery:'电量检测', alarm:'告警检查'};
  document.getElementById('modal-floor-sync-all') && document.getElementById('modal-floor-sync-all').remove();
  showToast('✅ ' + opNames[op] + '已触发（' + rooms.length + '间）', 'success');
};

// ============================================================
// 【改进5】openWorkorderKanbanModal - 工单看板视图弹窗（1处调用）
// 理由：onclick="openWorkorderKanbanModal()" 但函数体缺失
// 业务逻辑：打开工单看板视图，以看板形式展示工单状态分布
// ============================================================
window.openWorkorderKanbanModal = function() {
  var kanbanData = {
    pending: {name:'待处理', color:'var(--orange)', bg:'var(--orange-bg)', count:3, items:[
      {id:'WO2026032901', type:'客户投诉', room:'301', desc:'水龙头漏水', time:'10:30'},
      {id:'WO2026032902', type:'设备故障', room:'305', desc:'门锁无法上锁', time:'09:15'},
      {id:'WO2026032903', type:'送物服务', room:'208', desc:'需要毛巾两件', time:'11:00'}
    ]},
    processing: {name:'处理中', color:'var(--blue)', bg:'var(--blue-bg)', count:2, items:[
      {id:'WO2026032801', type:'退房检查', room:'302', desc:'客人退房需检查', time:'08:00'},
      {id:'WO2026032802', type:'点评回复', room:'206', desc:'客人差评需回复', time:'07:30'}
    ]},
    completed: {name:'已完成', color:'var(--green)', bg:'var(--green-bg)', count:5, items:[
      {id:'WO2026032701', type:'发票开具', room:'303', desc:'已开具增值税发票', time:'昨日'},
      {id:'WO2026032702', type:'换房', room:'401', desc:'已换至402', time:'昨日'}
    ]}
  };
  var typeIcons = {'客户投诉':'😤','设备故障':'🔧','送物服务':'📦','退房检查':'🛏️','点评回复':'💬','发票开具':'🧾','换房':'🔄'};
  var columns = Object.keys(kanbanData).map(function(col) {
    var colData = kanbanData[col];
    var cards = colData.items.map(function(item) {
      return '<div style="padding:10px;background:white;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;cursor:pointer;" onclick="openWorkorderDetailAndUpdate(\'' + item.id + '\')">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">' +
        '<span style="font-size:12px;">' + (typeIcons[item.type]||'📋') + '</span>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + item.type + '</span></div>' +
        '<div style="font-size:12px;font-weight:600;margin-bottom:2px;">' + item.id + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">🚪 ' + item.room + ' · ' + item.time + '</div>' +
        '<div style="font-size:11px;color:var(--text-light);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + item.desc + '</div></div>';
    }).join('');
    return '<div style="flex:1;min-width:200px;max-width:280px;">' +
      '<div style="padding:8px 10px;background:' + colData.bg + ';border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:space-between;margin-bottom:0;">' +
      '<span style="font-weight:600;font-size:13px;color:' + colData.color + ';">' + colData.name + '</span>' +
      '<span style="background:' + colData.color + ';color:white;border-radius:10px;padding:1px 8px;font-size:11px;font-weight:700;">' + colData.count + '</span></div>' +
      '<div style="padding:8px;background:var(--bg);border-radius:0 0 8px 8px;min-height:200px;">' + cards + '</div></div>';
  }).join('');
  var existing = document.getElementById('modal-workorder-kanban');
  if (existing) existing.remove();
  var html = '<div id="modal-workorder-kanban" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-workorder-kanban\').remove()">' +
    '<div style="width:100%;max-width:960px;max-height:90vh;background:white;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📋 工单看板视图</div>' +
    '<button onclick="document.getElementById(\'modal-workorder-kanban\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-x:auto;padding:16px 20px;display:flex;gap:12px;align-items:flex-start;">' + columns + '</div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:space-between;align-items:center;">' +
    '<div style="font-size:12px;color:var(--text-muted);">💡 点击卡片可查看工单详情</div>' +
    '<button onclick="document.getElementById(\'modal-workorder-kanban\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📋 已打开工单看板视图', 'info');
};
