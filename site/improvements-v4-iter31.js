// ============================================================
// 【物联后台 v4 全面检查修复 - iter31】
// 理由：按钮 onclick 调用的函数从未定义，导致点击无响应
// 修复：实现 5 个缺失函数的完整业务逻辑
// ============================================================

// ============================================================
// 【修复1】角色权限变更日志
// 理由：角色管理页面点击"📜 权限变更日志"按钮调用 openRoleAuditLogModal() 但函数不存在
// 闭环：查看权限变更历史记录，支持按角色/时间筛选
// ============================================================
function openRoleAuditLogModal() {
  var existing = document.getElementById('modal-role-audit-log');
  if (existing) existing.remove();

  var auditData = [
    {time: '2026-03-29 14:32', operator: '赵飞', role: '管理员', action: '修改权限', target: '客房人员', before: '工单查看', after: '工单查看+工单处理', result: '成功'},
    {time: '2026-03-29 10:15', operator: '赵飞', role: '管理员', action: '新增角色', target: '运维人员', before: '--', after: '🔧 自定义角色', result: '成功'},
    {time: '2026-03-28 16:45', operator: '周敏', role: '管理员', action: '禁用角色', target: '前台只读', before: '启用', after: '禁用', result: '成功'},
    {time: '2026-03-28 11:20', operator: '赵飞', role: '管理员', action: '修改权限', target: '运维人员', before: '设备重启', after: '设备重启+固件升级', result: '成功'},
    {time: '2026-03-27 09:00', operator: '赵飞', role: '管理员', action: '新增角色', target: '客房人员', before: '--', after: '🔧 自定义角色', result: '成功'},
    {time: '2026-03-25 15:30', operator: '吴倩', role: '客房人员', action: '申请权限', target: '设备远程开锁', before: '无权限', after: '待审批', result: '待审批'},
    {time: '2026-03-24 13:00', operator: '郑强', role: '客房人员', action: '修改权限', target: '客房人员', before: '工单处理', after: '工单查看', result: '成功'}
  ];

  var html = '<div class="modal-overlay" id="modal-role-audit-log" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-role-audit-log\').remove()">' +
    '<div style="background:white;border-radius:12px;width:780px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div><div style="font-size:15px;font-weight:700;">📜 权限变更日志</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">记录所有角色权限的变更操作 · 共 ' + auditData.length + ' 条</div></div>' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<select id="audit-role-filter" onchange="filterAuditLog()" style="padding:6px 10px;font-size:12px;border:1px solid var(--border);border-radius:6px;"><option value="all">全部角色</option><option value="管理员">管理员</option><option value="运维人员">运维人员</option><option value="客房人员">客房人员</option><option value="前台只读">前台只读</option></select>' +
    '<button onclick="document.getElementById(\'modal-role-audit-log\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div></div>' +
    '<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--bg);">' +
    '<input type="text" id="audit-search" oninput="filterAuditLog()" placeholder="🔍 搜索操作人/目标角色..." style="flex:1;padding:7px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
    '<select id="audit-action-filter" onchange="filterAuditLog()" style="padding:6px 10px;font-size:12px;border:1px solid var(--border);border-radius:6px;"><option value="all">全部操作</option><option value="修改权限">修改权限</option><option value="新增角色">新增角色</option><option value="禁用角色">禁用角色</option><option value="申请权限">申请权限</option></select>' +
    '</div>' +
    '<div style="padding:12px 20px;overflow-y:auto;flex:1;">' +
    '<table class="table" style="font-size:12px;">' +
    '<thead><tr><th>时间</th><th>操作人</th><th>操作类型</th><th>目标角色</th><th>变更内容</th><th>结果</th></tr></thead>' +
    '<tbody id="audit-log-body">' +
    '</tbody></table></div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div style="font-size:11px;color:var(--text-muted);">显示 <span id="audit-count">' + auditData.length + '</span> 条记录</div>' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-role-audit-log\').remove()" style="padding:6px 16px;font-size:12px;">关闭</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);

  window._auditData = auditData;
  filterAuditLog();
}

function filterAuditLog() {
  var tbody = document.getElementById('audit-log-body');
  if (!tbody || !window._auditData) return;

  var search = (document.getElementById('audit-search') || {value: ''}).value.toLowerCase();
  var roleFilter = (document.getElementById('audit-role-filter') || {value: 'all'}).value;
  var actionFilter = (document.getElementById('audit-action-filter') || {value: 'all'}).value;

  var filtered = window._auditData.filter(function(item) {
    var matchSearch = !search || item.operator.toLowerCase().indexOf(search) !== -1 || item.target.toLowerCase().indexOf(search) !== -1 || item.action.toLowerCase().indexOf(search) !== -1;
    var matchRole = roleFilter === 'all' || item.target === roleFilter;
    var matchAction = actionFilter === 'all' || item.action === actionFilter;
    return matchSearch && matchRole && matchAction;
  });

  var resultBadge = {成功: '<span class="tbadge green">成功</span>', 待审批: '<span class="tbadge orange">待审批</span>'};
  tbody.innerHTML = filtered.map(function(item) {
    return '<tr>' +
      '<td style="color:var(--text-muted);font-size:11px;">' + item.time + '</td>' +
      '<td><strong>' + item.operator + '</strong></td>' +
      '<td><span class="tbadge blue">' + item.action + '</span></td>' +
      '<td>' + item.target + '</td>' +
      '<td style="font-size:11px;color:var(--text);"><span style="color:var(--red);text-decoration:line-through;">' + item.before + '</span> → <span style="color:var(--green);">' + item.after + '</span></td>' +
      '<td>' + (resultBadge[item.result] || item.result) + '</td></tr>';
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">暂无符合条件的记录</td></tr>';

  var countEl = document.getElementById('audit-count');
  if (countEl) countEl.textContent = filtered.length;
}

// ============================================================
// 【修复2】楼栋新增/编辑表单
// 理由：系统设置-楼栋管理点击"添加楼栋"调用 openAddBuildingForm() 但函数不存在
// 闭环：新增楼栋（名称/楼层数/地址/负责人/电话）→ 列表刷新 → Toast反馈
// ============================================================
function openAddBuildingForm() {
  openBuildingCRUDModal(null);
}

// ============================================================
// 【修复3】新增房间表单
// 理由：系统设置-楼栋管理点击"新增房间"按钮调用 openAddRoomForm() 但函数不存在
// 闭环：选择楼层 → 填写房间号/类型/状态 → 列表刷新 → Toast反馈
// ============================================================
function openAddRoomForm() {
  var existing = document.getElementById('modal-add-room');
  if (existing) existing.remove();

  var floorOptions = '';
  var floors = [1, 2, 3];
  floors.forEach(function(f) {
    floorOptions += '<option value="' + f + '">' + f + '层</option>';
  });

  var html = '<div class="modal-overlay" id="modal-add-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-add-room\').remove()">' +
    '<div style="background:white;border-radius:12px;width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:15px;font-weight:700;">🚪 新增房间</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">将新房间添加到楼栋管理系统</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-room\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">所属楼层 <span class="required">*</span></label>' +
    '<select class="form-select" id="room-floor-select" style="width:100%;">' + floorOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="room-num-input" placeholder="如：301、101、202" maxlength="10"></div>' +
    '<div class="form-group"><label class="form-label">房间类型</label>' +
    '<select class="form-select" id="room-type-select" style="width:100%;">' +
    '<option value="大床房">大床房</option><option value="双床房">双床房</option>' +
    '<option value="亲子间">亲子间</option><option value="套房">套房</option>' +
    '<option value="豪华套房">豪华套房</option></select></div>' +
    '<div class="form-group"><label class="form-label">初始状态</label>' +
    '<select class="form-select" id="room-status-select" style="width:100%;">' +
    '<option value="empty">🟢 空房</option><option value="maintenance">🟡 维修中</option>' +
    '<option value="occupied">🔵 已入住</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="room-remark-input" placeholder="可选备注"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-room\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddRoom()" style="background:var(--blue);color:white;border:none;">➕ 添加房间</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitAddRoom() {
  var floor = document.getElementById('room-floor-select') ? document.getElementById('room-floor-select').value : '';
  var roomNum = document.getElementById('room-num-input') ? document.getElementById('room-num-input').value.trim() : '';
  var roomType = document.getElementById('room-type-select') ? document.getElementById('room-type-select').value : '大床房';
  var status = document.getElementById('room-status-select') ? document.getElementById('room-status-select').value : 'empty';
  var remark = document.getElementById('room-remark-input') ? document.getElementById('room-remark-input').value.trim() : '';

  if (!floor || !roomNum) { showToast('请填写楼层和房间号', 'error'); return; }
  if (!/^\d+$/.test(roomNum)) { showToast('房间号只能为数字', 'error'); return; }

  var statusLabels = {empty: '空房', maintenance: '维修中', occupied: '已入住'};
  document.getElementById('modal-add-room') && document.getElementById('modal-add-room').remove();

  // 刷新房间列表（如果存在相关函数）
  var gridEl = document.getElementById('bldg-rooms-grid');
  if (gridEl) {
    var statusIcon = status === 'empty' ? '🟢' : status === 'maintenance' ? '🟡' : '🔵';
    var newCard = '<div class="room-card" data-floor="' + floor + '" data-status="' + status + '" onclick="showPage(\'room-detail\')" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;border:1px solid var(--border);border-radius:8px;background:white;">' +
      '<div style="font-size:24px;margin-bottom:4px;">🚪</div>' +
      '<div style="font-size:13px;font-weight:700;">' + roomNum + '</div>' +
      '<div style="font-size:10px;color:var(--text-muted);">' + roomType + '</div>' +
      '<div style="font-size:10px;margin-top:4px;">' + statusIcon + ' ' + statusLabels[status] + '</div></div>';
    gridEl.insertAdjacentHTML('beforeend', newCard);
  }

  showToast('✅ 房间「' + roomNum + '」（' + floor + '层·' + roomType + '）添加成功', 'success');
}

// ============================================================
// 【修复4】新增房型表单
// 理由：房型管理点击"+ 新增房型"按钮调用 openRoomTypeAddForm() 但函数不存在
// 闭环：新增房型（名称/编码/床型/价格/容纳人数）→ 房型列表刷新 → Toast反馈
// ============================================================
function openRoomTypeAddForm() {
  var existing = document.getElementById('modal-rt-add-form');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-rt-add-form" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-rt-add-form\').remove()">' +
    '<div style="background:white;border-radius:12px;width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:15px;font-weight:700;">🏠 新增房型</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">创建新房型供入住使用</div></div>' +
    '<button onclick="document.getElementById(\'modal-rt-add-form\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房型名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="rt-add-name" placeholder="如：亲子间/大床房/标准间/豪华套房"></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">编码 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="rt-add-code" placeholder="如：KIDS/DOUBLE" style="text-transform:uppercase;"></div>' +
    '<div class="form-group"><label class="form-label">容纳人数</label>' +
    '<input type="number" class="form-input" id="rt-add-cap" placeholder="如：2" min="1" max="10"></div></div>' +
    '<div class="form-group"><label class="form-label">床型配置</label>' +
    '<select class="form-select" id="rt-add-bed" style="width:100%;">' +
    '<option value="1.8m大床">1.8m大床</option><option value="1.5m大床+1.2m小床">1.5m大床+1.2m小床</option>' +
    '<option value="1.2m单人床x2">1.2m单人床x2</option><option value="2m超大床">2m超大床</option></select></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">标准价(元/晚)</label>' +
    '<input type="number" class="form-input" id="rt-add-price" placeholder="如：298" min="0"></div>' +
    '<div class="form-group"><label class="form-label">定价模式</label>' +
    '<select class="form-select" id="rt-add-pricemode" style="width:100%;">' +
    '<option value="standard">标准定价</option><option value="weekend">周末浮动(+20%)</option>' +
    '<option value="season">淡旺季浮动</option></select></div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-rt-add-form\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddRoomType()" style="background:var(--blue);color:white;border:none;">💾 创建房型</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitAddRoomType() {
  var name = document.getElementById('rt-add-name') ? document.getElementById('rt-add-name').value.trim() : '';
  var code = document.getElementById('rt-add-code') ? document.getElementById('rt-add-code').value.trim().toUpperCase() : '';
  var cap = parseInt(document.getElementById('rt-add-cap') ? document.getElementById('rt-add-cap').value : 2) || 2;
  var bed = document.getElementById('rt-add-bed') ? document.getElementById('rt-add-bed').value : '1.8m大床';
  var price = parseFloat(document.getElementById('rt-add-price') ? document.getElementById('rt-add-price').value : 0) || 0;
  var pricemode = document.getElementById('rt-add-pricemode') ? document.getElementById('rt-add-pricemode').value : 'standard';

  if (!name || !code) { showToast('请填写房型名称和编码', 'error'); return; }
  if (price <= 0) { showToast('请填写正确的价格', 'error'); return; }

  // 房型数据存储
  if (typeof _roomTypeV2List !== 'undefined') {
    var newType = {
      id: 'rt' + Date.now(),
      name: name,
      code: code,
      bed: bed,
      cap: cap,
      price: price,
      pricemode: pricemode,
      count: 0,
      occupied: 0,
      status: 'enabled'
    };
    _roomTypeV2List.push(newType);
  }

  document.getElementById('modal-rt-add-form') && document.getElementById('modal-rt-add-form').remove();

  // 刷新房型表格
  if (typeof renderRoomTypeV2Table === 'function') renderRoomTypeV2Table();

  showToast('✅ 房型「' + name + '」（¥' + price + '/晚）创建成功', 'success');
}

// ============================================================
// 【修复5】新增会员等级
// 理由：会员等级权益管理点击"+ 新增等级"按钮调用 openAddTierModal() 但函数缺失
// 闭环：新增等级（名称/图标/积分门槛/折扣/权益）→ 权益配置刷新 → Toast反馈
// ============================================================
function openAddTierModal() {
  var existing = document.getElementById('modal-add-tier');
  if (existing) existing.remove();

  var icons = ['🟢','🔘','🌟','💎','👑','🏆','⭐','🔱'];
  var iconHtml = icons.map(function(icon, i) {
    var selected = i === 0 ? 'border-color:var(--blue);background:var(--blue-bg);' : '';
    return '<div onclick="selectTierIcon(this)" class="tier-icon-opt" data-icon="' + icon + '" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid var(--border);border-radius:8px;cursor:pointer;' + selected + '">' + icon + '</div>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-add-tier" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-add-tier\').remove()">' +
    '<div style="background:white;border-radius:12px;width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">🏆 新增会员等级</div>' +
    '<button onclick="document.getElementById(\'modal-add-tier\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div class="form-group"><label class="form-label">等级名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="tier-name" placeholder="如：钻石会员"></div>' +
    '<div class="form-group"><label class="form-label">等级图标</label>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + iconHtml + '</div></div>' +
    '<div class="form-group"><label class="form-label">所需积分门槛 <span class="required">*</span></label>' +
    '<input type="number" class="form-input" id="tier-points" placeholder="达到此积分自动升级" value="15000" min="0"></div>' +
    '<div class="form-group"><label class="form-label">会员折扣</label>' +
    '<select class="form-select" id="tier-discount" style="width:100%;">' +
    '<option value="无">无折扣</option><option value="9.8折">9.8折</option><option value="9.5折">9.5折</option>' +
    '<option value="9折">9折</option><option value="8.5折">8.5折</option><option value="8折">8折</option><option value="7折">7折</option></select></div>' +
    '<div class="form-group"><label class="form-label">等级权益</label>' +
    '<div style="display:flex;flex-direction:column;gap:6px;">' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;"><input type="checkbox" id="tier-breakfast" style="accent-color:var(--blue);"> 免费早餐</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;"><input type="checkbox" id="tier-checkout" style="accent-color:var(--blue);"> 延迟退房（14:00前）</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;"><input type="checkbox" id="tier-priority" style="accent-color:var(--blue);"> 优先客服通道</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;"><input type="checkbox" id="tier-upgrade" style="accent-color:var(--blue);"> 免费升房特权</label>' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">每月免费服务次数限制</label>' +
    '<input type="number" class="form-input" id="tier-monthly" value="10" placeholder="0表示无限制"></div>' +
    '<div class="form-group"><label class="form-label">等级描述</label>' +
    '<textarea id="tier-desc" class="form-input" rows="2" placeholder="简短描述该等级会员的特权..."></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-tier\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddTier()" style="background:var(--blue);color:white;border:none;">💾 创建等级</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function selectTierIcon(el) {
  document.querySelectorAll('.tier-icon-opt').forEach(function(d) {
    d.style.borderColor = 'var(--border)';
    d.style.background = '';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
}

function submitAddTier() {
  var name = document.getElementById('tier-name') ? document.getElementById('tier-name').value.trim() : '';
  var points = parseInt(document.getElementById('tier-points') ? document.getElementById('tier-points').value : 0) || 0;
  var discount = document.getElementById('tier-discount') ? document.getElementById('tier-discount').value : '无';
  var monthly = parseInt(document.getElementById('tier-monthly') ? document.getElementById('tier-monthly').value : 10) || 0;
  var desc = document.getElementById('tier-desc') ? document.getElementById('tier-desc').value.trim() : '新增会员等级';

  var selectedIcon = document.querySelector('.tier-icon-opt[style*="var(--blue)"]') || document.querySelector('.tier-icon-opt');
  var icon = selectedIcon ? selectedIcon.textContent : '🟢';

  if (!name) { showToast('请填写等级名称', 'error'); return; }
  if (points <= 0) { showToast('请填写正确的积分门槛', 'error'); return; }

  var benefits = [];
  if (document.getElementById('tier-breakfast') && document.getElementById('tier-breakfast').checked) benefits.push('免费早餐');
  if (document.getElementById('tier-checkout') && document.getElementById('tier-checkout').checked) benefits.push('延迟退房');
  if (document.getElementById('tier-priority') && document.getElementById('tier-priority').checked) benefits.push('优先客服');
  if (document.getElementById('tier-upgrade') && document.getElementById('tier-upgrade').checked) benefits.push('免费升房');

  // 更新会员等级数据（如果存在）
  if (typeof memberLevelData !== 'undefined') {
    var newLevel = {
      level: 'custom_' + Date.now(),
      name: name,
      discount: discount === '无' ? 100 : parseInt(discount),
      cardDiscount: 100,
      birthday: 'none',
      upgrade: 'none',
      vip: 'none',
      points: 1.0,
      threshold: points
    };
    memberLevelData.push(newLevel);
  }

  document.getElementById('modal-add-tier') && document.getElementById('modal-add-tier').remove();

  // 刷新会员等级表格
  var tbody = document.getElementById('member-level-table-body');
  if (tbody) {
    var newRow = '<tr><td><span class="tbadge">' + icon + ' ' + name + '</span></td>' +
      '<td>' + (discount === '无' ? '原价' : discount) + '</td>' +
      '<td>' + (discount === '无' ? '原价' : discount) + '</td>' +
      '<td>' + (benefits.length > 0 ? benefits.join('、') : '-') + '</td>' +
      '<td>-</td><td>-</td>' +
      '<td><button class="action-btn small" onclick="openEditMemberLevelModalV2(' + (memberLevelData ? memberLevelData.length - 1 : 0) + ')">编辑</button></td></tr>';
    tbody.insertAdjacentHTML('beforeend', newRow);
  }

  showToast('✅ 会员等级「' + icon + ' ' + name + '」（门槛：' + points.toLocaleString() + '积分）创建成功', 'success');
}
