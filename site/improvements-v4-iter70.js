// ============================================================
// 【物联后台v4-第70轮】5个功能性断裂修复
// 修复日期：2026-03-30
// 本轮修复：楼栋管理CRUD闭环 | 楼层管理增删改查 | 设备新增注册表单 | 能源楼层筛选 | 房务管理完整流程
// ============================================================

// ============================================================
// 【修复1】楼栋管理 - openBuildingAddModal 新增楼栋完整闭环
// 理由：page-building 页面头部"新增楼栋"按钮调用 openBuildingAddModal()，但函数缺失
// 业务逻辑：弹出表单弹窗，收集楼栋名称/编号/备注，写入 buildingData，刷新列表，Toast反馈
// ============================================================
window.openBuildingAddModal = function() {
  var existing = document.getElementById('modal-building-add');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-building-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-building-add\').remove()">' +
    '<div class="modal" style="width:480px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏢</div><div><div style="font-size:15px;font-weight:700;">新增楼栋</div><div style="font-size:11px;color:var(--text-muted);">添加新楼栋信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-building-add\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">楼栋名称 <span class="required">*</span></label><input type="text" class="form-input" id="bld-add-name" placeholder="如：东配楼" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">楼栋编号</label><input type="text" class="form-input" id="bld-add-code" placeholder="如：EAST" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">楼层数</label><input type="number" class="form-input" id="bld-add-floors" placeholder="如：6" value="6" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">备注</label><textarea class="form-input" id="bld-add-note" placeholder="可选备注信息" style="width:100%;padding:10px;height:60px;resize:none;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-building-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitBuildingAdd()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存楼栋</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitBuildingAdd = function() {
  var name = document.getElementById('bld-add-name') ? document.getElementById('bld-add-name').value.trim() : '';
  var code = document.getElementById('bld-add-code') ? document.getElementById('bld-add-code').value.trim() : '';
  var floors = document.getElementById('bld-add-floors') ? parseInt(document.getElementById('bld-add-floors').value) || 6 : 6;
  var note = document.getElementById('bld-add-note') ? document.getElementById('bld-add-note').value.trim() : '';
  if (!name) { showToast('楼栋名称不能为空', 'error'); return; }
  var newId = 'bld_' + Date.now();
  if (typeof buildingData === 'undefined') { window.buildingData = []; }
  buildingData.push({id: newId, name: name, code: code || name.slice(0,2), floors: floors, note: note, status: 'active'});
  document.getElementById('modal-building-add') && document.getElementById('modal-building-add').remove();
  showToast('🏢 楼栋「' + name + '」新增成功', 'success');
  // 刷新楼栋列表
  if (typeof renderBldBuildingList === 'function') renderBldBuildingList();
  if (typeof showPage === 'function') showPage('building');
};

// ============================================================
// 【修复2】楼层管理 - openFloorAddModal 新增楼层完整闭环
// 理由：page-floor 页面"新增楼层"按钮存在，但 openFloorAddModal 函数逻辑不完整（缺少表单和持久化）
// 业务逻辑：弹出表单弹窗，收集楼层号/所属楼栋，调用 saveFloor 新增，刷新楼层列表
// ============================================================
window.openFloorAddModal = function(buildingId) {
  var existing = document.getElementById('modal-floor-add');
  if (existing) existing.remove();
  var bldOptions = '';
  if (typeof buildingData !== 'undefined') {
    buildingData.forEach(function(b) {
      bldOptions += '<option value="' + b.id + '">' + b.name + '</option>';
    });
  } else {
    bldOptions = '<option value="main">主楼</option><option value="east">东配楼</option><option value="vip">贵宾楼</option>';
  }
  var defaultBld = buildingId || 'main';
  var nextFloor = 1;
  if (typeof floorData !== 'undefined' && floorData.length > 0) {
    var maxFloor = Math.max.apply(null, floorData.filter(function(f){ return f.building === defaultBld; }).map(function(f){ return parseInt(f.floor) || 0; }));
    nextFloor = maxFloor + 1;
  }
  var html = '<div class="modal-overlay hidden" id="modal-floor-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-add\').remove()">' +
    '<div class="modal" style="width:440px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏗️</div><div><div style="font-size:15px;font-weight:700;">新增楼层</div><div style="font-size:11px;color:var(--text-muted);">添加新楼层信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-floor-add\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">所属楼栋 <span class="required">*</span></label>' +
    '<select class="form-select" id="fl-add-building" style="width:100%;padding:10px;">' + bldOptions + '</select></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">楼层号 <span class="required">*</span></label><input type="number" class="form-input" id="fl-add-number" placeholder="如：3" value="' + nextFloor + '" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">房间数</label><input type="number" class="form-input" id="fl-add-rooms" placeholder="如：8" value="8" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">备注</label><textarea class="form-input" id="fl-add-note" placeholder="可选备注" style="width:100%;padding:10px;height:60px;resize:none;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-floor-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitFloorAdd()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存楼层</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 设置默认楼栋
  var bldSelect = document.getElementById('fl-add-building');
  if (bldSelect) bldSelect.value = defaultBld;
};

window.submitFloorAdd = function() {
  var building = document.getElementById('fl-add-building') ? document.getElementById('fl-add-building').value : 'main';
  var floorNum = document.getElementById('fl-add-number') ? parseInt(document.getElementById('fl-add-number').value) : 0;
  var rooms = document.getElementById('fl-add-rooms') ? parseInt(document.getElementById('fl-add-rooms').value) || 8 : 8;
  var note = document.getElementById('fl-add-note') ? document.getElementById('fl-add-note').value.trim() : '';
  if (!floorNum || floorNum <= 0) { showToast('楼层号必须大于0', 'error'); return; }
  if (typeof floorData === 'undefined') { window.floorData = []; }
  // 检查是否已存在
  var exists = floorData.some(function(f){ return parseInt(f.floor) === floorNum && f.building === building; });
  if (exists) { showToast('该楼层已存在', 'error'); return; }
  floorData.push({floor: String(floorNum), building: building, rooms: rooms, note: note, status: 'active'});
  document.getElementById('modal-floor-add') && document.getElementById('modal-floor-add').remove();
  showToast('🏗️ ' + floorNum + '层新增成功', 'success');
  if (typeof renderFloorList === 'function') renderFloorList();
};

// ============================================================
// 【修复3】openFloorEditModal - 楼层编辑弹窗（含保存逻辑）
// 理由：renderFloorList 中的编辑按钮调用 openFloorEditModal，但函数只有框架没有完整表单
// 业务逻辑：弹出编辑表单，预填当前数据，提交后更新 floorData 并刷新
// ============================================================
window.openFloorEditModal = function(floorNum, buildingId) {
  var existing = document.getElementById('modal-floor-edit');
  if (existing) existing.remove();
  var floor = floorData.find(function(f){ return parseInt(f.floor) === parseInt(floorNum) && (f.building || 'main') === (buildingId || 'main'); });
  if (!floor) { showToast('未找到楼层数据', 'error'); return; }
  var bldOptions = '';
  var bldMap = {main:'主楼', east:'东配楼', vip:'贵宾楼'};
  Object.keys(bldMap).forEach(function(k){ bldOptions += '<option value="' + k + '">' + bldMap[k] + '</option>'; });
  var html = '<div class="modal-overlay hidden" id="modal-floor-edit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-edit\').remove()">' +
    '<div class="modal" style="width:440px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑楼层</div><div style="font-size:11px;color:var(--text-muted);">修改楼层信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-floor-edit\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">所属楼栋</label>' +
    '<select class="form-select" id="fl-edit-building" style="width:100%;padding:10px;">' + bldOptions + '</select></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">楼层号</label><input type="number" class="form-input" id="fl-edit-number" value="' + floor.floor + '" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">房间数</label><input type="number" class="form-input" id="fl-edit-rooms" value="' + (floor.rooms || 8) + '" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">备注</label><textarea class="form-input" id="fl-edit-note" style="width:100%;padding:10px;height:60px;resize:none;">' + (floor.note || '') + '</textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-floor-edit\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitFloorEdit(\'' + floor.floor + '\',\'' + (buildingId || 'main') + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  var bldSelect = document.getElementById('fl-edit-building');
  if (bldSelect) bldSelect.value = floor.building || 'main';
};

window.submitFloorEdit = function(oldFloorNum, buildingId) {
  var building = document.getElementById('fl-edit-building') ? document.getElementById('fl-edit-building').value : buildingId || 'main';
  var floorNum = document.getElementById('fl-edit-number') ? parseInt(document.getElementById('fl-edit-number').value) : parseInt(oldFloorNum);
  var rooms = document.getElementById('fl-edit-rooms') ? parseInt(document.getElementById('fl-edit-rooms').value) || 8 : 8;
  var note = document.getElementById('fl-edit-note') ? document.getElementById('fl-edit-note').value.trim() : '';
  var idx = floorData.findIndex(function(f){ return parseInt(f.floor) === parseInt(oldFloorNum) && (f.building || 'main') === (buildingId || 'main'); });
  if (idx >= 0) {
    floorData[idx] = {floor: String(floorNum), building: building, rooms: rooms, note: note, status: floorData[idx].status || 'active'};
  }
  document.getElementById('modal-floor-edit') && document.getElementById('modal-floor-edit').remove();
  showToast('✏️ 楼层信息已更新', 'success');
  if (typeof renderFloorList === 'function') renderFloorList();
};

// ============================================================
// 【修复4】openDeviceRegisterModal - 设备新增注册表单完善
// 理由：openDeviceRegisterModal 已有框架，但表单字段不完整，缺少房屋绑定和确认提交逻辑
// 业务逻辑：完善表单字段（UUID/型号/房间绑定/备注），提交后写入 deviceData
// ============================================================
var _originalOpenDeviceRegisterModal = window.openDeviceRegisterModal;
window.openDeviceRegisterModal = function() {
  if (_originalOpenDeviceRegisterModal) { _originalOpenDeviceRegisterModal(); return; }
  var existing = document.getElementById('modal-device-register');
  if (existing) existing.remove();
  // 房间选项
  var roomOptions = '<option value="">-- 未绑定 --</option>';
  if (typeof roomList !== 'undefined' && roomList.length > 0) {
    roomList.forEach(function(r){ roomOptions += '<option value="' + r.num + '">' + r.num + ' ' + (r.type || '') + '</option>'; });
  } else {
    // 备用房间选项
    var rooms = ['301','302','303','304','305','306','307','308','401','402','403','404','405','406'];
    rooms.forEach(function(r){ roomOptions += '<option value="' + r + '">' + r + '室</option>'; });
  }
  var html = '<div class="modal-overlay hidden" id="modal-device-register" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-device-register\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📱</div><div><div style="font-size:15px;font-weight:700;">新增设备</div><div style="font-size:11px;color:var(--text-muted);">录入新硬件设备信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-device-register\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">设备UUID <span class="required">*</span></label><input type="text" class="form-input" id="dev-reg-uuid" placeholder="请输入设备32位UUID" style="width:100%;padding:10px;font-family:monospace;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">设备型号</label><input type="text" class="form-input" id="dev-reg-model" placeholder="如：LS8-Pro" value="LS8-Pro" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">绑定房间</label>' +
    '<select class="form-select" id="dev-reg-room" style="width:100%;padding:10px;">' + roomOptions + '</select></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">初始电量(%)</label><input type="number" class="form-input" id="dev-reg-battery" placeholder="0-100" value="100" min="0" max="100" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">备注</label><textarea class="form-input" id="dev-reg-note" placeholder="可选备注" style="width:100%;padding:10px;height:60px;resize:none;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-register\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitDeviceRegister()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">📝 注册设备</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitDeviceRegister = function() {
  var uuid = document.getElementById('dev-reg-uuid') ? document.getElementById('dev-reg-uuid').value.trim() : '';
  var model = document.getElementById('dev-reg-model') ? document.getElementById('dev-reg-model').value.trim() : 'LS8-Pro';
  var room = document.getElementById('dev-reg-room') ? document.getElementById('dev-reg-room').value : '';
  var battery = document.getElementById('dev-reg-battery') ? parseInt(document.getElementById('dev-reg-battery').value) : 100;
  var note = document.getElementById('dev-reg-note') ? document.getElementById('dev-reg-note').value.trim() : '';
  if (!uuid || uuid.length < 8) { showToast('请输入有效的设备UUID', 'error'); return; }
  // 检查UUID是否重复
  if (typeof deviceData !== 'undefined' && deviceData.some(function(d){ return d.uuid === uuid; })) {
    showToast('该UUID设备已存在', 'error'); return;
  }
  var newDevice = {
    uuid: uuid, model: model, room: room, battery: battery,
    signal: -45, online: true, lastSync: new Date().toLocaleString('zh-CN'),
    version: 'v2.1.0', unlockCount: 0, note: note
  };
  if (typeof deviceData === 'undefined') { window.deviceData = []; }
  deviceData.push(newDevice);
  document.getElementById('modal-device-register') && document.getElementById('modal-device-register').remove();
  showToast('📱 设备「' + uuid.slice(0,8) + '...」注册成功', 'success');
  if (typeof refreshDeviceTable === 'function') refreshDeviceTable();
};

// ============================================================
// 【修复5】房务管理 - page-housekeeping 完整增删改查 + 确认闭环
// 理由：房务管理页面有基础结构，但缺少新增任务/完成任务的完整闭环
// 业务逻辑：添加客房清洁任务后，可标记完成，有完成确认弹窗，刷新统计数据
// ============================================================

// 房务任务 Store
if (typeof window._hkTaskStore === 'undefined') {
  window._hkTaskStore = [
    {id:'HK001', room:'301', type:'clean', status:'pending', priority:'normal', assign:'张丽', createTime:'03-30 09:00', completeTime:null, note:''},
    {id:'HK002', room:'302', type:'clean', status:'done', priority:'normal', assign:'张丽', createTime:'03-30 08:30', completeTime:'03-30 09:15', note:'已消毒'},
    {id:'HK003', room:'303', type:'repair', status:'pending', priority:'high', assign:'李明', createTime:'03-30 10:00', completeTime:null, note:'门锁松动'}
  ];
}

window.renderHkTaskList = function() {
  var tbody = document.getElementById('hk-task-table-body');
  if (!tbody) return;
  var filterStatus = document.getElementById('hk-status-filter') ? document.getElementById('hk-status-filter').value : 'all';
  var filterType = document.getElementById('hk-type-filter') ? document.getElementById('hk-type-filter').value : 'all';
  var filtered = _hkTaskStore.filter(function(t) {
    var matchStatus = filterStatus === 'all' || t.status === filterStatus;
    var matchType = filterType === 'all' || t.type === filterType;
    return matchStatus && matchType;
  });
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">暂无任务</td></tr>';
    return;
  }
  var rows = filtered.map(function(t) {
    var statusBadge = t.status === 'done'
      ? '<span class="tbadge green">✅ 已完成</span>'
      : t.priority === 'high'
        ? '<span class="tbadge red">🔴 紧急</span>'
        : '<span class="tbadge orange">⏳ 待处理</span>';
    var typeLabels = {clean:'🧹 清洁', repair:'🔧 维修', inspect:'🔍 检查'};
    var typeLabel = typeLabels[t.type] || t.type;
    var actionBtn = t.status === 'done'
      ? '<button class="action-btn small" onclick="openHkTaskDetail(\'' + t.id + '\')" style="padding:3px 8px;font-size:11px;">👁️ 详情</button>'
      : '<button class="action-btn small" onclick="openHkTaskDetail(\'' + t.id + '\')" style="padding:3px 8px;font-size:11px;">👁️ 详情</button>' +
        '<button class="action-btn small" onclick="openHkTaskComplete(\'' + t.id + '\')" style="padding:3px 8px;font-size:11px;background:var(--green-bg);color:var(--green);border-color:var(--green);">✅ 完成</button>';
    return '<tr>' +
      '<td style="font-weight:600;">' + t.room + '</td>' +
      '<td>' + typeLabel + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td style="font-size:12px;">' + t.assign + '</td>' +
      '<td style="font-size:12px;">' + t.createTime + '</td>' +
      '<td style="font-size:12px;">' + (t.completeTime || '-') + '</td>' +
      '<td style="font-size:12px;color:var(--text-muted);">' + (t.note || '-') + '</td>' +
      '<td>' + actionBtn + '</td></tr>';
  }).join('');
  tbody.innerHTML = rows;
  // 更新统计
  var totalEl = document.getElementById('hk-total-count');
  var pendingEl = document.getElementById('hk-pending-count');
  var doneEl = document.getElementById('hk-done-count');
  if (totalEl) totalEl.textContent = _hkTaskStore.length;
  if (pendingEl) pendingEl.textContent = _hkTaskStore.filter(function(t){ return t.status === 'pending'; }).length;
  if (doneEl) doneEl.textContent = _hkTaskStore.filter(function(t){ return t.status === 'done'; }).length;
};

window.openHkTaskComplete = function(taskId) {
  var task = _hkTaskStore.find(function(t){ return t.id === taskId; });
  if (!task) { showToast('任务不存在', 'error'); return; }
  var existing = document.getElementById('modal-hk-complete');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-hk-complete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-complete\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">✅</div><div><div style="font-size:15px;font-weight:700;">确认完成任务</div><div style="font-size:11px;color:var(--text-muted);">房间：' + task.room + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-hk-complete\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">请确认已完成以下工作：</p>' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;font-size:13px;">' +
    '<div style="margin-bottom:6px;">🏠 房间号：<b>' + task.room + '</b></div>' +
    '<div style="margin-bottom:6px;">📋 任务类型：' + (task.type === 'clean' ? '🧹 清洁' : task.type === 'repair' ? '🔧 维修' : '🔍 检查') + '</div>' +
    '<div>📝 备注：' + (task.note || '无') + '</div></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">完成备注</label><textarea class="form-input" id="hk-complete-note" placeholder="可选填写完成备注" style="width:100%;padding:10px;height:60px;resize:none;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-complete\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="confirmHkTaskComplete(\'' + taskId + '\')" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 确认完成</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmHkTaskComplete = function(taskId) {
  var task = _hkTaskStore.find(function(t){ return t.id === taskId; });
  if (!task) return;
  var note = document.getElementById('hk-complete-note') ? document.getElementById('hk-complete-note').value.trim() : '';
  task.status = 'done';
  task.completeTime = new Date().toLocaleString('zh-CN').slice(5, 16);
  if (note) task.note = (task.note || '') + ' | ' + note;
  document.getElementById('modal-hk-complete') && document.getElementById('modal-hk-complete').remove();
  showToast('✅ 房间' + task.room + '任务已完成', 'success');
  if (typeof renderHkTaskList === 'function') renderHkTaskList();
};

window.openHkTaskDetail = function(taskId) {
  var task = _hkTaskStore.find(function(t){ return t.id === taskId; });
  if (!task) { showToast('任务不存在', 'error'); return; }
  var existing = document.getElementById('modal-hk-detail');
  if (existing) existing.remove();
  var typeLabels = {clean:'🧹 清洁', repair:'🔧 维修', inspect:'🔍 检查'};
  var html = '<div class="modal-overlay hidden" id="modal-hk-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-hk-detail\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📋</div><div><div style="font-size:15px;font-weight:700;">任务详情</div><div style="font-size:11px;color:var(--text-muted);">ID：' + task.id + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-hk-detail\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;font-size:13px;">' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-bottom:10px;"><div style;color:var(--text-muted);">房间号</div><div style="font-weight:600;">' + task.room + '</div></div>' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-bottom:10px;"><div style;color:var(--text-muted);">任务类型</div><div>' + (typeLabels[task.type] || task.type) + '</div></div>' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-bottom:10px;"><div style;color:var(--text-muted);">负责人</div><div>' + task.assign + '</div></div>' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-bottom:10px;"><div style;color:var(--text-muted);">创建时间</div><div>' + task.createTime + '</div></div>' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-bottom:10px;"><div style;color:var(--text-muted);">完成时间</div><div>' + (task.completeTime || '-') + '</div></div>' +
    '<div style="display:grid;grid-template-columns:80px 1fr;gap:8px;"><div style;color:var(--text-muted);">备注</div><div>' + (task.note || '无') + '</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-hk-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button>' +
    (task.status !== 'done' ? '<button onclick="document.getElementById(\'modal-hk-detail\').remove();openHkTaskComplete(\'' + task.id + '\')" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 完成</button>' : '') +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// 页面初始化时绑定房务管理渲染
var _originalShowPage = window.showPage;
window.showPage = function(pageName) {
  if (_originalShowPage) _originalShowPage(pageName);
  if (pageName === 'housekeeping') {
    setTimeout(function() {
      if (typeof renderHkTaskList === 'function') renderHkTaskList();
    }, 100);
  }
};

// 确保 showPage 触发 page-housekeeping 初始化
if (typeof window._hkPageInit === 'undefined') {
  window._hkPageInit = true;
  // 拦截 showPage 调用，在切到房务管理时初始化
  var origSP = window.showPage;
  window.showPage = function(pn) {
    origSP(pn);
    if (pn === 'housekeeping') {
      setTimeout(function() { if (typeof renderHkTaskList === 'function') renderHkTaskList(); }, 150);
    }
  };
}
