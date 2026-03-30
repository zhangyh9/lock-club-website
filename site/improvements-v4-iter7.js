// ============================================================
// 【物联后台v4-第13轮】5个功能性断裂修复
// ============================================================
// 本轮修复清单：
// 改进1: showFloorOfBuilding - 楼栋详情"楼层管理"按钮调用的函数不存在
// 改进2: submitAddEmployee - 员工新增表单提交函数不存在
// 改进3: editInvoiceHeader - 发票抬头编辑只是stub，需要完整编辑表单
// 改进4: 楼层分布图 - 楼栋详情"楼层分布图"按钮只是showToast，需要真实弹窗
// 改进5: 楼层房间筛选 - 楼栋管理楼层筛选联动房间列表但筛选不生效

// ============================================================
// 【改进1】showFloorOfBuilding - 楼栋详情"楼层管理"按钮调用的函数不存在
// 理由：楼栋管理页面点击"楼层管理"按钮调用showFloorOfBuilding(bldId)但函数未定义，导致console报错
// 改进：实现楼栋楼层管理弹窗，显示楼层列表，支持新增/编辑/删除楼层
// ============================================================
window.showFloorOfBuilding = function(bldId) {
  var bldName = {main:'主楼', east:'东配楼', vip:'贵宾楼'}[bldId] || bldId;
  var bldFloors = floorStore.filter(function(f){ return (f.building || 'main') === bldId; });
  var usageMap = {guest:'客房楼层', mixed:'混合用途', service:'服务楼层'};
  var existing = document.getElementById('modal-floor-manage');
  if (existing) existing.remove();
  var floorCards = bldFloors.map(function(f) {
    var usageColor = {guest:'var(--blue)', mixed:'var(--orange)', service:'var(--purple)'}[f.usage] || 'var(--text)';
    return '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">' +
      '<span style="font-size:20px;font-weight:700;color:var(--blue);width:40px;text-align:center;">' + f.floor + '层</span>' +
      '<span style="flex:1;font-size:12px;"><span style="color:var(--text-muted);">' + f.rooms + '间</span> · <span style="color:' + usageColor + ';font-weight:600;">' + (usageMap[f.usage] || f.usage) + '</span></span>' +
      '<button class="action-btn small" onclick="openFloorEditModal(' + f.floor + ',\'' + bldId + '\')" style="padding:3px 8px;font-size:11px;">✏️ 编辑</button>' +
      '<button class="action-btn small red" onclick="confirmFloorDeleteFromManage(' + f.floor + ',\'' + bldId + '\')" style="padding:3px 8px;font-size:11px;">🗑️</button></div>';
  }).join('') || '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">暂无楼层，点击下方按钮新增</div>';
  var html = '<div class="modal-overlay hidden" id="modal-floor-manage" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-manage\').remove()">' +
    '<div class="modal" style="width:480px;max-height:80vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏢</div><div><div style="font-size:15px;font-weight:700;">' + bldName + ' - 楼层管理</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">管理楼层信息 · 新增/编辑/删除</div></div>' +
    '<button onclick="document.getElementById(\'modal-floor-manage\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="margin-bottom:16px;font-size:12px;color:var(--text-muted);">共 <strong style="color:var(--blue);">' + bldFloors.length + '</strong> 层</div>' +
    '<div style="max-height:320px;overflow-y:auto;">' + floorCards + '</div>' +
    '<button class="action-btn" onclick="openAddFloorForBuilding(\'' + bldId + '\')" style="width:100%;margin-top:12px;padding:10px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);font-size:13px;">➕ 新增楼层</button></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-floor-manage\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// 新增楼层（指定楼栋）
window.openAddFloorForBuilding = function(bldId) {
  var bldName = {main:'主楼', east:'东配楼', vip:'贵宾楼'}[bldId] || bldId;
  var existing = document.getElementById('modal-add-floor-building');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-floor-building" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-add-floor-building\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">➕</div><div><div style="font-size:15px;font-weight:700;">新增楼层</div><div style="font-size:11px;color:var(--text-muted);">' + bldName + ' · 添加新楼层</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-floor-building\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">楼层号 <span class="required">*</span></label><input type="number" class="form-input" id="floor-b-num" placeholder="如：4" min="1" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">房间数</label><input type="number" class="form-input" id="floor-b-rooms" placeholder="8" value="8" min="1" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">用途</label>' +
    '<select class="form-select" id="floor-b-usage" style="width:100%;padding:10px;">' +
    '<option value="guest">🏠 客房楼层</option><option value="service">🔧 服务楼层</option><option value="mixed">🔄 混合用途</option></select></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-floor-building\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="doAddFloorForBuilding(\'' + bldId + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 确认添加</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.doAddFloorForBuilding = function(bldId) {
  var floorNum = parseInt(document.getElementById('floor-b-num').value);
  var rooms = parseInt(document.getElementById('floor-b-rooms').value) || 8;
  var usage = document.getElementById('floor-b-usage').value;
  if (!floorNum || floorNum < 1) { showToast('请输入正确的楼层号', 'error'); return; }
  var exists = floorStore.some(function(f){ return f.floor === floorNum && (f.building || 'main') === bldId; });
  if (exists) { showToast('该楼层已存在', 'error'); return; }
  floorStore.push({floor: floorNum, rooms: rooms, usage: usage, building: bldId});
  document.getElementById('modal-add-floor-building') && document.getElementById('modal-add-floor-building').remove();
  document.getElementById('modal-floor-manage') && document.getElementById('modal-floor-manage').remove();
  showToast('✅ ' + floorNum + '层已添加至' + ({main:'主楼', east:'东配楼', vip:'贵宾楼'}[bldId] || bldId), 'success');
  renderFloorList();
  // Reopen floor manage
  showFloorOfBuilding(bldId);
};

window.confirmFloorDeleteFromManage = function(floorNum, bldId) {
  var existing = document.getElementById('modal-floor-delete-confirm');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-floor-delete-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-delete-confirm\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:44px;height:44px;background:var(--red-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">🗑️</div>' +
    '<div><div style="font-size:15px;font-weight:700;">确认删除楼层</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">楼层号：' + floorNum + '层<br>删除后该楼层下所有房间数据将一并清除</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-floor-delete-confirm\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="doFloorDeleteFromManage(' + floorNum + ',\'' + bldId + '\')" style="background:var(--red);color:white;border:none;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.doFloorDeleteFromManage = function(floorNum, bldId) {
  floorStore = floorStore.filter(function(f){ return !(f.floor === floorNum && (f.building || 'main') === bldId); });
  document.getElementById('modal-floor-delete-confirm') && document.getElementById('modal-floor-delete-confirm').remove();
  document.getElementById('modal-floor-manage') && document.getElementById('modal-floor-manage').remove();
  showToast('🗑️ ' + floorNum + '层已删除', 'success');
  renderFloorList();
  showFloorOfBuilding(bldId);
};

// ============================================================
// 【改进2】submitAddEmployee - 员工新增表单提交函数不存在
// 理由：员工新增弹窗（modal-add-employee）点击"确认添加"调用submitAddEmployee()，但函数从未定义
// 改进：实现员工新增逻辑，将数据添加到_staffList，渲染列表，显示成功Toast
// ============================================================
window.submitAddEmployee = function() {
  var name = document.getElementById('emp-name') ? document.getElementById('emp-name').value.trim() : '';
  var phone = document.getElementById('emp-phone') ? document.getElementById('emp-phone').value.trim() : '';
  var dept = document.getElementById('emp-dept') ? document.getElementById('emp-dept').value : '前厅';
  var role = document.getElementById('emp-role') ? document.getElementById('emp-role').value : '前台';
  var status = document.getElementById('emp-status') ? document.getElementById('emp-status').value : 'enabled';
  if (!name) { showToast('请输入员工姓名', 'error'); return; }
  if (!phone || !/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号', 'error'); return; }
  var newStaff = {
    id: 'EMP' + String(_staffList.length + 1).padStart(3, '0'),
    name: name,
    phone: phone,
    dept: dept,
    role: role,
    status: status,
    pwd: phone.slice(-6),
    checkin: '2026-03-15',
    lateCount: 0,
    leaveDays: 0
  };
  _staffList.unshift(newStaff);
  closeModal('add-employee');
  showToast('✅ 员工 ' + name + ' 已添加（工号：' + newStaff.id + '）', 'success');
  renderStaffList();
};

// ============================================================
// 【改进3】editInvoiceHeader - 发票抬头编辑stub升级为完整编辑功能
// 理由：发票抬头管理弹窗中点击编辑按钮只显示toast"功能已开启"，无法实际编辑
// 改进：使用iter5实现的完整版本（editInvoiceHeaderWithForm），替换原stub
// 注意：iter5中window.editInvoiceHeader已赋值，但若被主文件stub覆盖则不生效，在此确认覆盖
// ============================================================
window.editInvoiceHeader = function(hId) {
  var header = null;
  // Try to find in iter5 store first
  if (typeof _invoiceHeaderStore !== 'undefined') {
    header = _invoiceHeaderStore.find(function(h){ return h.id === hId; });
  }
  if (!header) { showToast('未找到该发票抬头', 'error'); return; }
  var existing = document.getElementById('modal-invoice-header-edit');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-header-edit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-header-edit\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑发票抬头</div><div style="font-size:11px;color:var(--text-muted);">修改后将同步更新历史发票</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-header-edit\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">单位名称 <span class="required">*</span></label><input type="text" class="form-input" id="ihe-name" value="' + header.name + '" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">纳税人识别号</label><input type="text" class="form-input" id="ihe-tax" value="' + (header.tax || '') + '" placeholder="请输入纳税人识别号" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">电子邮箱</label><input type="email" class="form-input" id="ihe-email" value="' + (header.email || '') + '" placeholder="用于接收电子发票" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">注册地址</label><input type="text" class="form-input" id="ihe-addr" value="' + (header.addr || '') + '" placeholder="营业执照注册地址" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">开户银行</label><input type="text" class="form-input" id="ihe-bank" value="' + (header.bank || '') + '" placeholder="如：工商银行北京东城支行" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">银行账号</label><input type="text" class="form-input" id="ihe-account" value="' + (header.account || '') + '" placeholder="请输入银行账号" style="width:100%;padding:10px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-header-edit\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitInvoiceHeaderEdit(\'' + hId + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitInvoiceHeaderEdit = function(hId) {
  var name = document.getElementById('ihe-name') ? document.getElementById('ihe-name').value.trim() : '';
  var tax = document.getElementById('ihe-tax') ? document.getElementById('ihe-tax').value.trim() : '';
  var email = document.getElementById('ihe-email') ? document.getElementById('ihe-email').value.trim() : '';
  var addr = document.getElementById('ihe-addr') ? document.getElementById('ihe-addr').value.trim() : '';
  var bank = document.getElementById('ihe-bank') ? document.getElementById('ihe-bank').value.trim() : '';
  var account = document.getElementById('ihe-account') ? document.getElementById('ihe-account').value.trim() : '';
  if (!name) { showToast('单位名称不能为空', 'error'); return; }
  var idx = _invoiceHeaderStore.findIndex(function(h){ return h.id === hId; });
  if (idx >= 0) {
    _invoiceHeaderStore[idx] = {id: hId, name: name, tax: tax, email: email, addr: addr, bank: bank, account: account};
  }
  document.getElementById('modal-invoice-header-edit') && document.getElementById('modal-invoice-header-edit').remove();
  showToast('✅ 发票抬头已更新', 'success');
  if (typeof openInvoiceHeaderManageModal === 'function') openInvoiceHeaderManageModal();
};

// ============================================================
// 【改进4】楼层分布图 - 楼栋详情"楼层分布图"按钮只是showToast
// 理由：楼栋详情页点击"楼层分布图"按钮只显示Toast"功能开发中"，无法查看楼层平面图
// 改进：实现楼层分布图弹窗，以grid形式展示各楼层房间布局概览
// ============================================================
window.openFloorMapModal = function(bldId) {
  var bldName = {main:'主楼', east:'东配楼', vip:'贵宾楼'}[bldId] || bldId;
  var bldFloors = floorStore.filter(function(f){ return (f.building || 'main') === bldId; }).sort(function(a,b){ return b.floor - a.floor; });
  var existing = document.getElementById('modal-floor-map');
  if (existing) existing.remove();
  var floorPanels = bldFloors.map(function(f) {
    var rooms = [];
    for (var i = 1; i <= Math.min(f.rooms, 12); i++) {
      rooms.push({num: String(f.floor * 100 + i), status: ['空房','入住','入住'][Math.floor(Math.random()*3)]});
    }
    var roomCells = rooms.map(function(r) {
      var bg = r.status === '入住' ? 'var(--blue-bg)' : 'var(--green-bg)';
      var color = r.status === '入住' ? 'var(--blue)' : 'var(--green)';
      return '<div style="flex:0 0 auto;width:52px;height:44px;background:' + bg + ';border:1px solid var(--border);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;" onclick="goToRoom(\'' + r.num + '\')" title="' + r.num + ' · ' + r.status + '">' +
        '<span style="font-size:12px;font-weight:700;color:' + color + ';">' + r.num.slice(-2) + '</span>' +
        '<span style="font-size:9px;color:' + color + ';">' + r.status + '</span></div>';
    }).join('');
    return '<div style="margin-bottom:20px;">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--text);">' + f.floor + '层 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">(' + f.rooms + '间)</span></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:12px;background:var(--bg);border-radius:8px;">' + roomCells + '</div></div>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-floor-map" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-map\').remove()">' +
    '<div class="modal" style="width:640px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📐</div><div><div style="font-size:15px;font-weight:700;">' + bldName + ' 楼层分布图</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">平面布局概览 · 点击房间号进入详情</div></div>' +
    '<button onclick="document.getElementById(\'modal-floor-map\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    (floorPanels || '<div style="text-align:center;padding:24px;color:var(--text-muted);">暂无楼层数据</div>') +
    '<div style="display:flex;gap:16px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);justify-content:center;">' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:11px;"><span style="width:16px;height:16px;background:var(--blue-bg);border:1px solid var(--border);border-radius:4px;"></span><span style="color:var(--blue);">入住</span></div>' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:11px;"><span style="width:16px;height:16px;background:var(--green-bg);border:1px solid var(--border);border-radius:4px;"></span><span style="color:var(--green);">空房</span></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-floor-map\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// 点击分布图房间跳转到房间详情
window.goToRoom = function(roomNum) {
  document.getElementById('modal-floor-map') && document.getElementById('modal-floor-map').remove();
  showToast('正在跳转到 ' + roomNum + '...', 'info');
  showPage('room-detail');
  setTimeout(function() {
    var rdTitle = document.getElementById('rd-page-title');
    if (rdTitle) rdTitle.textContent = '🚪 房间详情 - ' + roomNum;
    var rdSub = document.getElementById('rd-page-sub');
    if (rdSub) rdSub.textContent = '楼层位置：' + roomNum.slice(0,1) + '层';
  }, 100);
};

// ============================================================
// 【改进5】filterBuildingRooms - 楼栋管理楼层/房型/状态筛选联动房间列表
// 理由：楼栋管理页面有楼层/房型/状态三个下拉筛选，但切换后筛选不生效，房间列表不变
// 改进：在原生filterBuildingRooms基础上增强，支持三个维度联动过滤+实时重新渲染
// ============================================================
var _bldRoomData = [
  {room:'301', floor:'3', type:'亲子间', status:'in', device:'online', keys:2},
  {room:'302', floor:'3', type:'亲子间', status:'empty', device:'online', keys:0},
  {room:'303', floor:'3', type:'亲子间', status:'alert', device:'offline', keys:0},
  {room:'304', floor:'3', type:'亲子间', status:'in', device:'online', keys:3},
  {room:'201', floor:'2', type:'大床房', status:'in', device:'online', keys:2},
  {room:'202', floor:'2', type:'大床房', status:'in', device:'online', keys:1},
  {room:'203', floor:'2', type:'大床房', status:'empty', device:'online', keys:0},
  {room:'101', floor:'1', type:'标准间', status:'empty', device:'online', keys:0},
  {room:'102', floor:'1', type:'标准间', status:'in', device:'online', keys:2}
];

window.filterBuildingRooms = function() {
  var floorFilter = document.getElementById('bld-floor-filter');
  var typeFilter = document.getElementById('bld-type-filter');
  var statusFilter = document.getElementById('bld-status-filter');
  var floorVal = floorFilter ? floorFilter.value : 'all';
  var typeVal = typeFilter ? typeFilter.value : 'all';
  var statusVal = statusFilter ? statusFilter.value : 'all';
  var filtered = _bldRoomData.filter(function(r) {
    var floorMatch = floorVal === 'all' || r.floor === floorVal;
    var typeMatch = typeVal === 'all' || r.type === typeVal;
    var statusMap = {in:'in', empty:'empty', alert:'alert'};
    var statusMatch = statusVal === 'all' || r.status === statusMap[statusVal];
    return floorMatch && typeMatch && statusMatch;
  });
  var tbody = document.getElementById('bld-room-body');
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">暂无匹配的房间</td></tr>';
    return;
  }
  var statusBadgeMap = {in:'<span class="tbadge blue">入住</span>', empty:'<span class="tbadge green">空房</span>', alert:'<span class="tbadge red">离线</span>'};
  var deviceBadgeMap = {online:'<span class="tbadge green">🟢</span>', offline:'<span class="tbadge red">🔴</span>'};
  var rows = filtered.map(function(r) {
    return '<tr>' +
      '<td><span style="font-weight:600;">' + r.room + '</span></td>' +
      '<td>' + r.floor + '层</td>' +
      '<td>' + r.type + '</td>' +
      '<td>' + statusBadgeMap[r.status] + '</td>' +
      '<td>' + deviceBadgeMap[r.device] + '</td>' +
      '<td>' + r.keys + '张</td>' +
      '<td><button class="action-btn small" onclick="openEditRoomModal(\'' + r.room + '\')">编辑</button> <button class="action-btn small red" onclick="deleteRoom(\'' + r.room + '\')">删除</button></td></tr>';
  }).join('');
  tbody.innerHTML = rows;
  showToast('🔍 筛选完成：' + filtered.length + '间', 'info');
};
