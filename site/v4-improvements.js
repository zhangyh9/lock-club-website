// ============================================================
// 【物联后台 v4 全面检查改进】
// 5个功能性闭环缺失修复
// ============================================================

// -------- 改进1：楼栋管理完整CRUD --------
// 楼栋数据存储（基于页面现有2条数据）
var _bldMgrList = [
  {id:'MAIN', name:'主楼', floors:3, rooms:16, status:'enabled'},
  {id:'EAST', name:'东配楼', floors:2, rooms:8, status:'enabled'}
];
var _bldMgrEditIdx = null;

function openBldMgrAddModal() {
  _bldMgrEditIdx = null;
  document.getElementById('bldmgr-form-title') && (document.getElementById('bldmgr-form-title').textContent = '🏢 新增楼栋');
  document.getElementById('bldmgr-name') && (document.getElementById('bldmgr-name').value = '');
  document.getElementById('bldmgr-id') && (document.getElementById('bldmgr-id').value = '');
  document.getElementById('bldmgr-floors') && (document.getElementById('bldmgr-floors').value = '');
  document.getElementById('bldmgr-rooms') && (document.getElementById('bldmgr-rooms').value = '');
  openModal('bldmgr-form');
}

function openBldMgrEditModal(idx) {
  var b = _bldMgrList[idx];
  if (!b) return;
  _bldMgrEditIdx = idx;
  document.getElementById('bldmgr-form-title') && (document.getElementById('bldmgr-form-title').textContent = '✏️ 编辑楼栋 - ' + b.name);
  document.getElementById('bldmgr-name') && (document.getElementById('bldmgr-name').value = b.name);
  document.getElementById('bldmgr-id') && (document.getElementById('bldmgr-id').value = b.id);
  document.getElementById('bldmgr-floors') && (document.getElementById('bldmgr-floors').value = b.floors);
  document.getElementById('bldmgr-rooms') && (document.getElementById('bldmgr-rooms').value = b.rooms);
  openModal('bldmgr-form');
}

function submitBldMgrForm() {
  var name = document.getElementById('bldmgr-name') ? document.getElementById('bldmgr-name').value.trim() : '';
  var id = document.getElementById('bldmgr-id') ? document.getElementById('bldmgr-id').value.trim() : '';
  var floors = parseInt(document.getElementById('bldmgr-floors') ? document.getElementById('bldmgr-floors').value : '0');
  var rooms = parseInt(document.getElementById('bldmgr-rooms') ? document.getElementById('bldmgr-rooms').value : '0');
  if (!name || !id) { showToast('请填写楼栋名称和编号', 'error'); return; }
  if (floors <= 0 || rooms <= 0) { showToast('楼层数和房间数必须大于0', 'error'); return; }
  if (_bldMgrEditIdx !== null) {
    _bldMgrList[_bldMgrEditIdx] = {id:id, name:name, floors:floors, rooms:rooms, status:'enabled'};
    showToast('楼栋 ' + name + ' 已更新', 'success');
  } else {
    _bldMgrList.push({id:id, name:name, floors:floors, rooms:rooms, status:'enabled'});
    showToast('楼栋 ' + name + ' 已添加', 'success');
  }
  closeModal('bldmgr-form');
  renderBldMgrTable();
}

function openBldMgrDisableModal(idx) {
  var b = _bldMgrList[idx];
  if (!b) return;
  var newStatus = b.status === 'enabled' ? 'disabled' : 'enabled';
  var action = newStatus === 'disabled' ? '停用' : '启用';
  _bldMgrList[idx].status = newStatus;
  showToast('楼栋 ' + b.name + ' 已' + action, newStatus === 'disabled' ? 'warning' : 'success');
  renderBldMgrTable();
}

function deleteBldMgrBuilding(idx) {
  var b = _bldMgrList[idx];
  if (!b) return;
  var existing = document.getElementById('modal-bldmgr-confirm');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-bldmgr-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">确认删除楼栋</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="font-size:13px;color:var(--text);margin-bottom:16px;">确定要删除楼栋 <strong style="color:var(--red);">' + b.name + '</strong> 吗？</p>' +
    '<p style="font-size:12px;color:var(--orange);padding:10px;background:var(--orange-bg);border-radius:6px;">⚠️ 删除后，该楼栋下所有楼层和房间数据将一并清除，请谨慎操作。</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'bldmgr-confirm\')">取消</button>' +
    '<button class="modal-btn red" onclick="doDeleteBldMgr(' + idx + ')" style="background:var(--red);color:white;border:none;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doDeleteBldMgr(idx) {
  var b = _bldMgrList[idx];
  closeModal('bldmgr-confirm');
  _bldMgrList.splice(idx, 1);
  showToast('楼栋 ' + b.name + ' 已删除', 'success');
  renderBldMgrTable();
}

function renderBldMgrTable() {
  var tbody = document.getElementById('bldm-table-body');
  if (!tbody) return;
  var totalFloors = _bldMgrList.reduce(function(s, b){ return s + b.floors; }, 0);
  var totalRooms = _bldMgrList.reduce(function(s, b){ return s + b.rooms; }, 0);
  var onlineDevices = 11; // placeholder
  var statTotal = document.getElementById('bldm-stat-total');
  var statFloors = document.getElementById('bldm-stat-floors');
  var statRooms = document.getElementById('bldm-stat-rooms');
  if (statTotal) statTotal.textContent = _bldMgrList.length;
  if (statFloors) statFloors.textContent = totalFloors;
  if (statRooms) statRooms.textContent = totalRooms;
  var rows = '';
  _bldMgrList.forEach(function(b, i) {
    var statusBadge = b.status === 'enabled' ? '<span class="tbadge green">启用</span>' : '<span class="tbadge gray">停用</span>';
    var disableLabel = b.status === 'enabled' ? '停用' : '启用';
    rows += '<tr data-bld-idx="' + i + '" style="cursor:pointer;" onclick="openBuildingDetailModal(' + i + ')" title="点击查看楼栋详情">' +
      '<td><span style="font-weight:600;">🏢 ' + b.name + '</span> <span style="font-size:10px;color:var(--blue);">🔍详情</span></td>' +
      '<td><span class="tbadge blue">' + b.id + '</span></td>' +
      '<td>' + b.floors + '层</td>' +
      '<td>' + b.rooms + '间</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td onclick="event.stopPropagation()">' +
        '<button class="action-btn small" onclick="openBldMgrEditModal(' + i + ')">编辑</button> ' +
        '<button class="action-btn small orange" onclick="openBldMgrDisableModal(' + i + ')">' + disableLabel + '</button> ' +
        '<button class="action-btn small red" onclick="deleteBldMgrBuilding(' + i + ')">删除</button>' +
      '</td></tr>';
  });
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">暂无楼栋数据</td></tr>';
}

// -------- 改进2：房型管理完整CRUD --------
var _roomTypeV2List = [
  {id:0, name:'标准间', bed:'大床1.8m', price:98, count:0, occupied:0, status:'disabled'},
  {id:1, name:'大床房', bed:'大床1.5m', price:108, count:2, occupied:1, status:'enabled'},
  {id:2, name:'亲子间', bed:'多床（1大+1小）', price:128, count:6, occupied:4, status:'enabled'},
  {id:3, name:'家庭套房', bed:'子母床', price:198, count:2, occupied:2, status:'enabled'}
];
var _roomTypeEditIdx = null;

function submitRoomTypeForm() {
  var name = document.getElementById('rt-name') ? document.getElementById('rt-name').value.trim() : '';
  var bed = document.getElementById('rt-bed') ? document.getElementById('rt-bed').value.trim() : '';
  var price = parseInt(document.getElementById('rt-price') ? document.getElementById('rt-price').value : '0');
  var status = document.getElementById('rt-status') ? document.getElementById('rt-status').value : 'enabled';
  if (!name) { showToast('请填写房型名称', 'error'); return; }
  if (_roomTypeEditIdx !== null) {
    var r = _roomTypeV2List[_roomTypeEditIdx];
    r.name = name; r.bed = bed; r.price = price; r.status = status;
    showToast('房型 ' + name + ' 已更新', 'success');
  } else {
    _roomTypeV2List.push({id:_roomTypeV2List.length, name:name, bed:bed, price:price, count:0, occupied:0, status:status});
    showToast('房型 ' + name + ' 已添加', 'success');
  }
  closeModal('roomtype-form');
  renderRoomTypeV2Table();
}

function openEditRoomTypeModalV2(idx) {
  var r = _roomTypeV2List[idx];
  if (!r) return;
  _roomTypeEditIdx = idx;
  document.getElementById('rt-form-title') && (document.getElementById('rt-form-title').textContent = '✏️ 编辑房型 - ' + r.name);
  if (document.getElementById('rt-name')) document.getElementById('rt-name').value = r.name;
  if (document.getElementById('rt-bed')) document.getElementById('rt-bed').value = r.bed;
  if (document.getElementById('rt-price')) document.getElementById('rt-price').value = r.price;
  if (document.getElementById('rt-status')) document.getElementById('rt-status').value = r.status;
  openModal('roomtype-form');
}

function deleteRoomTypeV2(idx) {
  var r = _roomTypeV2List[idx];
  if (!r) return;
  var existing = document.getElementById('modal-roomtype-confirm');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-roomtype-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">确认删除房型</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="font-size:13px;">确定要删除房型 <strong style="color:var(--red);">' + r.name + '</strong> 吗？</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'roomtype-confirm\')">取消</button>' +
    '<button class="modal-btn red" onclick="doDeleteRoomTypeV2(' + idx + ')" style="background:var(--red);color:white;border:none;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doDeleteRoomTypeV2(idx) {
  var r = _roomTypeV2List[idx];
  closeModal('roomtype-confirm');
  _roomTypeV2List.splice(idx, 1);
  showToast('房型 ' + r.name + ' 已删除', 'success');
  renderRoomTypeV2Table();
}

function toggleRoomTypeStatus(idx) {
  var r = _roomTypeV2List[idx];
  if (!r) return;
  r.status = r.status === 'enabled' ? 'disabled' : 'enabled';
  showToast('房型 ' + r.name + ' 已' + (r.status === 'enabled' ? '启用' : '停用'), r.status === 'disabled' ? 'warning' : 'success');
  renderRoomTypeV2Table();
}

function openRoomCountAdjustModal(idx) {
  var r = _roomTypeV2List[idx];
  if (!r) return;
  var existing = document.getElementById('modal-roomtype-count');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-roomtype-count" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:380px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">🏠 调整房间数 - ' + r.name + '</div>' +
    '<button onclick="closeModal(\'roomtype-count\')" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);">总房间数</div><div style="font-size:24px;font-weight:700;color:var(--blue);">' + r.count + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);">已入住</div><div style="font-size:24px;font-weight:700;color:var(--green);">' + r.occupied + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);">空房数</div><div style="font-size:24px;font-weight:700;color:var(--orange);">' + (r.count - r.occupied) + '</div></div></div>' +
    '<div class="form-group"><label class="form-label">房间数量</label>' +
    '<input type="number" class="form-input" id="rt-count-input" value="' + r.count + '" min="' + r.occupied + '" style="font-size:18px;text-align:center;padding:10px;"></div>' +
    '<p style="font-size:11px;color:var(--text-muted);">* 房间数不能少于已入住数量（' + r.occupied + '间）</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'roomtype-count\')">取消</button>' +
    '<button class="modal-btn primary" onclick="submitRoomCountAdjust(' + idx + ')" style="background:var(--blue);color:white;border:none;">✅ 确认调整</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitRoomCountAdjust(idx) {
  var r = _roomTypeV2List[idx];
  var newCount = parseInt(document.getElementById('rt-count-input') ? document.getElementById('rt-count-input').value : '0');
  if (!r || newCount < r.occupied) { showToast('房间数不能少于已入住数量', 'error'); return; }
  r.count = newCount;
  closeModal('roomtype-count');
  showToast('房型 ' + r.name + ' 房间数已调整为 ' + newCount + ' 间', 'success');
  renderRoomTypeV2Table();
}

function openRoomTypePriceModal(idx) {
  var r = _roomTypeV2List[idx];
  if (!r) return;
  var existing = document.getElementById('modal-roomtype-price-v2');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-roomtype-price-v2" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:380px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">💰 房型价格 - ' + r.name + '</div>' +
    '<button onclick="closeModal(\'roomtype-price-v2\')" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">当前价格（元/12小时）</label>' +
    '<div style="font-size:32px;font-weight:800;color:var(--blue);margin:8px 0;">¥' + r.price + '</div></div>' +
    '<div class="form-group"><label class="form-label">调整价格（元/12小时）</label>' +
    '<input type="number" class="form-input" id="rt-price-new" value="' + r.price + '" min="0" style="font-size:18px;text-align:center;padding:10px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'roomtype-price-v2\')">取消</button>' +
    '<button class="modal-btn primary" onclick="submitRoomTypePrice(' + idx + ')" style="background:var(--blue);color:white;border:none;">✅ 确认调价</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitRoomTypePrice(idx) {
  var r = _roomTypeV2List[idx];
  var newPrice = parseInt(document.getElementById('rt-price-new') ? document.getElementById('rt-price-new').value : '0');
  if (!r || newPrice <= 0) { showToast('请输入有效的价格', 'error'); return; }
  r.price = newPrice;
  closeModal('roomtype-price-v2');
  showToast('房型 ' + r.name + ' 价格已调整为 ¥' + newPrice + '/12h', 'success');
  renderRoomTypeV2Table();
}

function renderRoomTypeV2Table() {
  var tbody = document.getElementById('rt-v2-table-body');
  if (!tbody) return;
  var rows = '';
  _roomTypeV2List.forEach(function(r, i) {
    var occRate = r.count > 0 ? Math.round(r.occupied / r.count * 100) : 0;
    var occRateColor = occRate >= 80 ? 'var(--red)' : occRate >= 50 ? 'var(--orange)' : 'var(--green)';
    var statusBadge = r.status === 'enabled' ? '<span class="tbadge green">启用</span>' : '<span class="tbadge gray">关闭</span>';
    var countBadge = r.count === 0 ? '<span class="tbadge gray">' + r.count + '间</span>' : '<span class="tbadge blue">' + r.count + '间</span>';
    var rateBadge = r.count === 0 ? '--' : '<span class="tbadge" style="color:' + occRateColor + ';background:transparent;font-size:12px;font-weight:700;">' + occRate + '%</span>';
    var toggleLabel = r.status === 'enabled' ? '关闭' : '启用';
    rows += '<tr>' +
      '<td><span style="font-weight:600;">' + r.name + '</span></td>' +
      '<td>' + r.bed + '</td>' +
      '<td><span style="color:var(--blue);font-weight:700;">¥' + r.price + '/12h</span></td>' +
      '<td>' + countBadge + '</td>' +
      '<td>' + rateBadge + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
        '<button class="action-btn small" onclick="openEditRoomTypeModalV2(' + i + ')">编辑</button> ' +
        '<button class="action-btn small orange" onclick="openRoomCountAdjustModal(' + i + ')" style="padding:3px 6px;" title="调整房间数">🏠</button> ' +
        '<button class="action-btn small orange" onclick="openRoomTypePriceModal(' + i + ')" style="padding:3px 6px;">💰</button> ' +
        '<button class="action-btn small ' + (r.status==='enabled'?'red':'green') + '" onclick="toggleRoomTypeStatus(' + i + ')">' + toggleLabel + '</button> ' +
        '<button class="action-btn small red" onclick="deleteRoomTypeV2(' + i + ')">删除</button>' +
      '</td></tr>';
  });
  tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">暂无房型数据</td></tr>';
}

// -------- 改进3：系统设置编辑弹窗完整内容 --------
function openConfigEditModal() {
  // 填充当前值
  var sidebarBrand = document.getElementById('sidebar-brand-text');
  var currentName = sidebarBrand ? sidebarBrand.textContent : '小度语音智慧房体验店';
  var nameInput = document.getElementById('cfg-hotel-name-input');
  if (!nameInput) return;
  nameInput.value = currentName;
  openModal('config-edit');
}

function saveSystemConfig() {
  var hotelName = document.getElementById('cfg-hotel-name-input');
  if (!hotelName) return;
  var name = hotelName.value.trim();
  if (!name) { showToast('请输入酒店名称', 'error'); return; }
  var sidebarBrand = document.getElementById('sidebar-brand-text');
  if (sidebarBrand) sidebarBrand.textContent = name;
  var sidebarSubbrand = document.getElementById('sidebar-brand-sub');
  closeModal('config-edit');
  showToast('系统设置已保存，所有变更已生效', 'success');
}

// -------- 改进4：钥匙管理搜索过滤 --------
function filterKeyLog() {
  var q = document.getElementById('key-log-search') ? document.getElementById('key-log-search').value.toLowerCase() : '';
  var typeFilter = document.getElementById('key-log-type') ? document.getElementById('key-log-type').value : 'all';
  var tbody = document.getElementById('key-log-table-body');
  if (!tbody || typeof keyLogData === 'undefined') return;
  var rows = '';
  keyLogData.forEach(function(k, i) {
    var matchQ = !q || k.room.toLowerCase().indexOf(q) !== -1 || (k.guest || '').toLowerCase().indexOf(q) !== -1 || (k.method || '').toLowerCase().indexOf(q) !== -1 || (k.operator || '').toLowerCase().indexOf(q) !== -1;
    var matchType = typeFilter === 'all' || k.type === typeFilter;
    if (matchQ && matchType) {
      var typeBadge = k.type === 'card' ? '<span class="tbadge purple">👤员工卡</span>' : k.type === 'app' ? '<span class="tbadge blue">📱APP</span>' : '<span class="tbadge green">🔑密码</span>';
      rows += '<tr>' +
        '<td style="font-size:12px;color:var(--text-muted);">' + k.time + '</td>' +
        '<td style="font-weight:600;">' + k.room + '</td>' +
        '<td>' + typeBadge + '</td>' +
        '<td><span style="font-size:11px;color:var(--purple);font-weight:600;">' + (k.cardNum || '--') + '</span></td>' +
        '<td>' + (k.guest || '--') + '</td>' +
        '<td><button class="action-btn" onclick="showLogDetailModal(\'' + k.type + '\',' + i + ')">详情</button></td></tr>';
    }
  });
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">无匹配记录</td></tr>';
}

// -------- 改进5：员工删除确认弹窗 --------
var _staffDeleteId = null;
function openDeleteStaffModal(idx) {
  var s = _staffList[idx];
  if (!s) return;
  _staffDeleteId = idx;
  var existing = document.getElementById('modal-staff-delete');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-staff-delete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div><div style="font-size:15px;font-weight:700;">确认删除员工</div><div style="font-size:11px;color:var(--text-muted);">' + s.name + ' - ' + s.code + '</div></div></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">删除原因 <span class="required">*</span></label>' +
    '<select class="form-select" id="staff-del-reason" style="width:100%;">' +
      '<option value="">请选择删除原因</option>' +
      '<option value="resigned">👋 员工离职</option>' +
      '<option value="transferred">🔄 岗位调动</option>' +
      '<option value="probation">⚠️ 试用期未通过</option>' +
      '<option value="other">📋 其他原因</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="staff-del-note" placeholder="可选，填写删除说明..." style="min-height:50px;"></textarea></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:6px;font-size:12px;color:var(--orange);">' +
    '⚠️ 删除后，该员工账户将立即失效，所有操作日志将保留。' + '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'staff-delete\')">取消</button>' +
    '<button class="modal-btn red" onclick="doDeleteStaff()" style="background:var(--red);color:white;border:none;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doDeleteStaff() {
  var reason = document.getElementById('staff-del-reason') ? document.getElementById('staff-del-reason').value : '';
  if (!reason) { showToast('请选择删除原因', 'error'); return; }
  var note = document.getElementById('staff-del-note') ? document.getElementById('staff-del-note').value.trim() : '';
  var staff = _staffList[_staffDeleteId];
  _staffList.splice(_staffDeleteId, 1);
  closeModal('staff-delete');
  showToast('员工 ' + (staff ? staff.name : '') + ' 已删除（' + reason + '）', 'success');
  renderStaffTable();
  _staffDeleteId = null;
}

// 初始化：页面加载后自动渲染楼栋表格
document.addEventListener('DOMContentLoaded', function() {
  // 确保楼栋管理表格被渲染
  setTimeout(function() {
    if (typeof renderBldMgrTable === 'function') renderBldMgrTable();
    if (typeof renderRoomTypeV2Table === 'function') renderRoomTypeV2Table();
  }, 200);
});
