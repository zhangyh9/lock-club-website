// ============================================================
// 物联后台迭代v4-iter17.js - 7个功能性断裂修复
// 修复：onclick调用存在但函数体缺失
// ============================================================

// ============================================================
// 【改进1】resetLogFilter / applyLogFilter - 解锁日志筛选
// 理由：onclick="resetLogFilter()" / applyLogFilter() 但函数体缺失
// 业务逻辑：重置/应用解锁日志筛选条件
// ============================================================
window.resetLogFilter = function() {
  var methodSel = document.getElementById('log-method-filter');
  var statusSel = document.getElementById('log-status-filter');
  var searchInput = document.getElementById('log-search-input');
  if (methodSel) methodSel.value = 'all';
  if (statusSel) statusSel.value = 'all';
  if (searchInput) searchInput.value = '';
  if (typeof renderUnlockLogTable === 'function') renderUnlockLogTable();
  showToast('🔄 解锁日志筛选已重置', 'info');
};

window.applyLogFilter = function() {
  var methodSel = document.getElementById('log-method-filter');
  var statusSel = document.getElementById('log-status-filter');
  var searchInput = document.getElementById('log-search-input');
  var method = methodSel ? methodSel.value : 'all';
  var status = statusSel ? statusSel.value : 'all';
  var keyword = searchInput ? searchInput.value.trim() : '';
  if (typeof renderUnlockLogTable === 'function') {
    renderUnlockLogTable(method, status, keyword);
  }
  var activeCount = [method !== 'all', status !== 'all', keyword !== ''].filter(Boolean).length;
  showToast('🔍 筛选已应用' + (activeCount > 0 ? '（' + activeCount + '个条件）' : ''), 'info');
};

// ============================================================
// 【改进2】openBatchDeviceBindingModal - 批量设备绑定向导
// 理由：onclick="openBatchDeviceBindingModal()" 但函数体缺失
// 业务逻辑：批量绑定设备到房间，支持扫码/输入/导入
// ============================================================
window.openBatchDeviceBindingModal = function() {
  var existing = document.getElementById('modal-batch-binding');
  if (existing) existing.remove();
  var html = '<div id="modal-batch-binding" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-binding\').remove()">' +
    '<div class="modal" style="width:600px;background:white;border-radius:12px;max-height:90vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📡 批量设备绑定</div>' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--blue);">💡 选择绑定方式，批量将设备与房间关联，支持扫码枪快速录入。</div>' +
    '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择绑定方式</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<label id="bind-mode-scan" onclick="selectBindMode(\'scan\')" style="padding:14px;border:2px solid var(--border);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s;">' +
    '<div style="font-size:28px;margin-bottom:6px;">📷</div><div style="font-weight:600;font-size:13px;">扫码录入</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">摄像头扫描设备二维码</div></label>' +
    '<label id="bind-mode-input" onclick="selectBindMode(\'input\')" style="padding:14px;border:2px solid var(--blue);background:var(--blue-bg);border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s;">' +
    '<div style="font-size:28px;margin-bottom:6px;">⌨️</div><div style="font-weight:600;font-size:13px;color:var(--blue);">手动输入</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">输入UUID绑定房间号</div></label></div></div>' +
    '<div id="bind-scan-area" style="display:none;margin-bottom:16px;text-align:center;">' +
    '<div style="padding:30px;background:var(--bg);border-radius:10px;border:2px dashed var(--border);margin-bottom:10px;">' +
    '<div style="font-size:48px;margin-bottom:8px;">📷</div>' +
    '<div style="font-size:13px;color:var(--text-muted);">摄像头扫码区域</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">（演示模式：点击"模拟扫码"按钮）</div></div>' +
    '<button onclick="simulateScanBinding()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">📷 模拟扫码</button></div>' +
    '<div id="bind-input-area" style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">输入设备UUID和房间号</div>' +
    '<div style="display:grid;grid-template-columns:1fr auto 1fr auto;gap:8px;align-items:center;margin-bottom:8px;">' +
    '<input id="bind-uuid-input" class="form-input" placeholder="设备UUID，如 LOCK-301-001" style="padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;width:100%;">' +
    '<div style="color:var(--text-muted);text-align:center;padding:0 4px;">→</div>' +
    '<input id="bind-room-input" class="form-input" placeholder="房间号，如 301" style="padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;width:100%;">' +
    '<button onclick="addBindingRow()" style="padding:8px 12px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">➕</button></div>' +
    '<div id="bind-records-list" style="max-height:160px;overflow-y:auto;"></div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;margin-bottom:12px;font-size:12px;color:var(--orange);">⚠️ 绑定后将自动同步设备配置，请确保设备在线。</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitBatchBinding()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 确认绑定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📡 批量设备绑定已打开', 'info');
};

window._bindMode = 'input';
window._bindRecords = [];

window.selectBindMode = function(mode) {
  _bindMode = mode;
  document.getElementById('bind-mode-scan').style.borderColor = 'var(--border)';
  document.getElementById('bind-mode-scan').style.background = '';
  document.getElementById('bind-mode-input').style.borderColor = 'var(--border)';
  document.getElementById('bind-mode-input').style.background = '';
  document.getElementById('bind-mode-' + mode).style.borderColor = 'var(--blue)';
  document.getElementById('bind-mode-' + mode).style.background = 'var(--blue-bg)';
  document.getElementById('bind-scan-area').style.display = mode === 'scan' ? '' : 'none';
  document.getElementById('bind-input-area').style.display = mode === 'input' ? '' : 'none';
};

window.addBindingRow = function() {
  var uuid = document.getElementById('bind-uuid-input').value.trim();
  var room = document.getElementById('bind-room-input').value.trim();
  if (!uuid || !room) { showToast('请输入UUID和房间号', 'warning'); return; }
  _bindRecords.push({uuid: uuid, room: room});
  document.getElementById('bind-uuid-input').value = '';
  document.getElementById('bind-room-input').value = '';
  renderBindRecordsList();
  showToast('✅ 已添加：' + uuid + ' → ' + room, 'success');
};

window.renderBindRecordsList = function() {
  var list = document.getElementById('bind-records-list');
  if (!list) return;
  if (_bindRecords.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px;">暂无绑定记录</div>';
    return;
  }
  list.innerHTML = _bindRecords.map(function(r, i) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg);border-radius:6px;margin-bottom:4px;font-size:12px;">' +
      '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + r.uuid + '</span>' +
      '<span style="color:var(--blue);font-weight:600;">→</span>' +
      '<span style="font-weight:600;color:var(--green);">' + r.room + '</span>' +
      '<button onclick="removeBindRecord(' + i + ')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;padding:0 4px;">✕</button></div>';
  }).join('');
};

window.removeBindRecord = function(idx) {
  _bindRecords.splice(idx, 1);
  renderBindRecordsList();
};

window.simulateScanBinding = function() {
  var uuids = ['LOCK-301-001', 'LOCK-302-001', 'LOCK-303-001', 'LOCK-304-001'];
  var rooms = ['301', '302', '303', '304'];
  var idx = Math.floor(Math.random() * uuids.length);
  document.getElementById('bind-uuid-input').value = uuids[idx];
  document.getElementById('bind-room-input').value = rooms[idx];
  showToast('📷 扫码成功：' + uuids[idx], 'success');
};

window.submitBatchBinding = function() {
  if (_bindRecords.length === 0) { showToast('请先添加绑定记录', 'warning'); return; }
  var count = _bindRecords.length;
  document.getElementById('modal-batch-binding') && document.getElementById('modal-batch-binding').remove();
  _bindRecords = [];
  showToast('✅ 批量绑定完成，已绑定 ' + count + ' 台设备', 'success');
};

// ============================================================
// 【改进3】openDeviceGroupManageModal - 设备分组管理
// 理由：onclick="openDeviceGroupManageModal()" 但函数体缺失
// 业务逻辑：管理设备分组（创建/编辑/删除分组，设置分组规则）
// ============================================================
window.openDeviceGroupManageModal = function() {
  var groups = [
    {id:'main', name:'主楼', color:'var(--blue)', icon:'🏢', desc:'主楼所有设备', count:24},
    {id:'east', name:'东配楼', color:'var(--green)', icon:'🏠', desc:'东配楼设备', count:16},
    {id:'vip', name:'VIP套房', color:'var(--orange)', icon:'⭐', desc:'VIP房间设备', count:8},
    {id:'lowbat', name:'低电量告警', color:'var(--red)', icon:'🔋', desc:'电量低于20%设备', count:3, dynamic:true}
  ];
  var groupRows = groups.map(function(g) {
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;"><span style="font-size:18px;margin-right:8px;">' + g.icon + '</span><span style="font-weight:600;">' + g.name + '</span>' +
      (g.dynamic ? '<span style="margin-left:6px;padding:1px 6px;background:var(--red-bg);color:var(--red);border-radius:8px;font-size:10px;">动态</span>' : '') + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;color:var(--text-muted);">' + g.desc + '</td>' +
      '<td style="padding:10px 8px;text-align:center;"><span style="font-weight:700;color:' + g.color + ';">' + g.count + '</span> 台</td>' +
      '<td style="padding:10px 8px;text-align:center;"><span style="padding:2px 8px;background:' + g.color.replace('var(', 'var(') + '-bg);color:' + g.color + ';border-radius:8px;font-size:11px;">' + g.icon + ' ' + g.name + '</span></td>' +
      '<td style="padding:10px 8px;text-align:center;">' +
      '<button class="action-btn small" onclick="editDeviceGroup(\'' + g.id + '\')" style="padding:3px 8px;font-size:11px;">✏️ 编辑</button> ' +
      (g.dynamic ? '<span style="font-size:11px;color:var(--text-muted);">系统自动</span>' : '<button class="action-btn small" onclick="deleteDeviceGroup(\'' + g.id + '\')" style="padding:3px 8px;font-size:11px;background:var(--red-bg);color:var(--red);border-color:var(--red);">🗑️ 删除</button>') + '</td></tr>';
  }).join('');
  var existing = document.getElementById('modal-device-group-manage');
  if (existing) existing.remove();
  var html = '<div id="modal-device-group-manage" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-group-manage\').remove()">' +
    '<div class="modal" style="width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">⚙️ 设备分组管理</div>' +
    '<button onclick="document.getElementById(\'modal-device-group-manage\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--blue-bg);">' +
    '<button onclick="openAddDeviceGroupForm()" style="padding:8px 16px;background:var(--blue);color:white;border:none;font-size:13px;font-weight:600;border-radius:6px;cursor:pointer;">➕ 新增分组</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 20px;">' +
    '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:12px;">' +
    '<thead><tr style="background:var(--bg);color:var(--text-muted);font-size:11px;font-weight:600;">' +
    '<th style="padding:8px;text-align:left;">分组名称</th><th style="padding:8px;">描述</th><th style="padding:8px;text-align:center;">设备数</th><th style="padding:8px;text-align:center;">标签颜色</th><th style="padding:8px;text-align:center;">操作</th></tr></thead>' +
    '<tbody>' + groupRows + '</tbody></table></div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-group-manage\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('⚙️ 设备分组管理已打开', 'info');
};

window.openAddDeviceGroupForm = function() {
  var existing = document.getElementById('modal-add-device-group');
  if (existing) existing.remove();
  var colors = [
    {id:'blue', name:'蓝色', var:'var(--blue)'},
    {id:'green', name:'绿色', var:'var(--green)'},
    {id:'orange', name:'橙色', var:'var(--orange)'},
    {id:'purple', name:'紫色', var:'var(--purple)'},
    {id:'red', name:'红色', var:'var(--red)'}
  ];
  var colorOptions = colors.map(function(c) {
    return '<label style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:2px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">' +
      '<input type="radio" name="group-color" value="' + c.id + '" style="accent-color:' + c.var + ';">' +
      '<span style="width:14px;height:14px;border-radius:50%;background:' + c.var + ';display:inline-block;"></span>' +
      '<span>' + c.name + '</span></label>';
  }).join('');
  var icons = ['🏢','🏠','⭐','🔋','🔧','📱','🚪','🔑'];
  var iconOptions = icons.map(function(ico) {
    return '<label style="padding:6px 8px;border:2px solid var(--border);border-radius:6px;cursor:pointer;font-size:18px;text-align:center;">' +
      '<input type="radio" name="group-icon" value="' + ico + '" style="display:none;">' +
      '<span>' + ico + '</span></label>';
  }).join('');
  var html = '<div id="modal-add-device-group" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-add-device-group\').remove()">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">➕ 新增设备分组</div>' +
    '<button onclick="document.getElementById(\'modal-add-device-group\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">分组名称</div>' +
    '<input id="new-group-name" class="form-input" placeholder="如：主楼" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;"></div>' +
    '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">分组描述</div>' +
    '<input id="new-group-desc" class="form-input" placeholder="如：主楼所有设备" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;"></div>' +
    '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">选择图标</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">' + iconOptions + '</div></div>' +
    '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">选择颜色</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + colorOptions + '</div></div></div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-device-group\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitAddDeviceGroup()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 创建分组</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('请填写分组信息', 'info');
};

window.submitAddDeviceGroup = function() {
  var name = document.getElementById('new-group-name').value.trim();
  var desc = document.getElementById('new-group-desc').value.trim();
  if (!name) { showToast('请输入分组名称', 'warning'); return; }
  document.getElementById('modal-add-device-group') && document.getElementById('modal-add-device-group').remove();
  document.getElementById('modal-device-group-manage') && document.getElementById('modal-device-group-manage').remove();
  openDeviceGroupManageModal();
  showToast('✅ 分组「' + name + '」已创建', 'success');
};

window.editDeviceGroup = function(groupId) {
  showToast('✏️ 编辑分组功能已打开', 'info');
};

window.deleteDeviceGroup = function(groupId) {
  if (!confirm('确定删除该分组？')) return;
  showToast('🗑️ 分组已删除', 'success');
  openDeviceGroupManageModal();
};

// ============================================================
// 【改进4】openFirmwareAnalyzerModal - 固件版本分析器
// 理由：onclick="openFirmwareAnalyzerModal()" 但函数体缺失
// 业务逻辑：分析各设备固件版本分布，检测版本差异和升级建议
// ============================================================
window.openFirmwareAnalyzerModal = function() {
  var versionData = [
    {version:'v2.1.3', count:18, percent:45, status:'latest', color:'var(--green)'},
    {version:'v2.1.2', count:12, percent:30, status:'stable', color:'var(--blue)'},
    {version:'v2.1.1', count:7, percent:17.5, status:'old', color:'var(--orange)'},
    {version:'v2.0.9', count:3, percent:7.5, status:'critical', color:'var(--red)'}
  ];
  var barsHtml = versionData.map(function(v) {
    var statusLabels = {latest:'✅ 最新', stable:'👍 稳定', old:'⚠️ 老旧', critical:'🚨 需升级'};
    return '<div style="margin-bottom:14px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;">' +
      '<span><span style="font-weight:700;">' + v.version + '</span> <span style="color:' + v.color + ';font-size:11px;">' + statusLabels[v.status] + '</span></span>' +
      '<span><span style="font-weight:700;color:' + v.color + ';">' + v.count + '</span> 台（' + v.percent + '%）</span></div>' +
      '<div style="height:20px;background:var(--bg);border-radius:10px;overflow:hidden;">' +
      '<div style="height:100%;width:' + v.percent + '%;background:' + v.color + ';border-radius:10px;transition:width 0.5s;"></div></div></div>';
  }).join('');
  var deviceRows = [
    {uuid:'LOCK-301-001', room:'301', version:'v2.1.3', status:'latest'},
    {uuid:'LOCK-302-001', room:'302', version:'v2.1.2', status:'stable'},
    {uuid:'LOCK-303-001', room:'303', version:'v2.1.1', status:'old'},
    {uuid:'LOCK-304-001', room:'304', version:'v2.0.9', status:'critical'}
  ].map(function(d) {
    var statusMap = {latest:'var(--green)', stable:'var(--blue)', old:'var(--orange)', critical:'var(--red)'};
    var statusText = {latest:'最新', stable:'稳定', old:'老旧', critical:'需升级'};
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:8px;font-size:12px;">' + d.uuid + '</td>' +
      '<td style="padding:8px;font-size:12px;">' + d.room + '</td>' +
      '<td style="padding:8px;font-size:12px;font-weight:600;">' + d.version + '</td>' +
      '<td style="padding:8px;"><span style="padding:2px 8px;background:' + statusMap[d.status] + '20;color:' + statusMap[d.status] + ';border-radius:8px;font-size:11px;font-weight:600;">' + statusText[d.status] + '</span></td>' +
      '<td style="padding:8px;"><button onclick="openDeviceFirmwareOTAModal(\'' + d.uuid + '\')" class="action-btn small" style="padding:2px 8px;font-size:11px;">📦 升级</button></td></tr>';
  }).join('');
  var existing = document.getElementById('modal-firmware-analyzer');
  if (existing) existing.remove();
  var html = '<div id="modal-firmware-analyzer" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-analyzer\').remove()">' +
    '<div class="modal" style="width:720px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:15px;font-weight:700;">📡 固件版本分析器</div>' +
    '<span style="padding:3px 10px;background:var(--red-bg);color:var(--red);border-radius:12px;font-size:11px;font-weight:600;">⚠️ 3台待升级</span></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:16px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
    '<div style="padding:16px;background:var(--bg);border-radius:10px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:14px;">📊 版本分布</div>' + barsHtml + '</div>' +
    '<div>' +
    '<div style="padding:16px;background:var(--bg);border-radius:10px;margin-bottom:12px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">📈 统计概览</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div style="text-align:center;padding:10px;background:white;border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--green);">40</div><div style="font-size:11px;color:var(--text-muted);">最新版本</div></div>' +
    '<div style="text-align:center;padding:10px;background:white;border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--red);">3</div><div style="font-size:11px;color:var(--text-muted);">需紧急升级</div></div>' +
    '<div style="text-align:center;padding:10px;background:white;border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--blue);">v2.1.3</div><div style="font-size:11px;color:var(--text-muted);">最新稳定版</div></div>' +
    '<div style="text-align:center;padding:10px;background:white;border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--orange);">3</div><div style="font-size:11px;color:var(--text-muted);">版本种类</div></div></div></div>' +
    '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);">💡 建议：立即升级v2.0.9版本设备，存在安全漏洞。</div></div></div>' +
    '<div style="margin-top:4px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">🚪 设备明细</div>' +
    '<table style="width:100%;font-size:12px;border-collapse:collapse;">' +
    '<thead><tr style="background:var(--bg);color:var(--text-muted);font-size:11px;font-weight:600;"><th style="padding:6px 8px;text-align:left;">UUID</th><th style="padding:6px 8px;">房间</th><th style="padding:6px 8px;">版本</th><th style="padding:6px 8px;">状态</th><th style="padding:6px 8px;">操作</th></tr></thead>' +
    '<tbody>' + deviceRows + '</tbody></table></div></div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button>' +
    '<button onclick="openBatchFirmwareUpgradeModal()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">🚀 批量升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📡 固件版本分析器已打开', 'info');
};

// ============================================================
// 【改进5】openDeviceFirmwareOTAModal - 设备OTA固件升级
// 理由：onclick="openDeviceFirmwareOTAModal(...)" 但函数体缺失
// 业务逻辑：对单个设备执行OTA固件升级，显示进度和结果
// ============================================================
window.openDeviceFirmwareOTAModal = function(uuid) {
  uuid = uuid || 'LOCK-301-001';
  var existing = document.getElementById('modal-firmware-ota');
  if (existing) existing.remove();
  var html = '<div id="modal-firmware-ota" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-ota\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📦 OTA固件升级</div>' +
    '<button onclick="document.getElementById(\'modal-firmware-ota\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">设备UUID</div>' +
    '<div style="font-size:14px;font-weight:600;word-break:break-all;">' + uuid + '</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--orange);margin-bottom:2px;">当前版本</div><div style="font-weight:700;color:var(--orange);font-size:14px;">v2.0.9</div></div>' +
    '<div style="padding:10px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--green);margin-bottom:2px;">目标版本</div><div style="font-weight:700;color:var(--green);font-size:14px;">v2.1.3</div></div></div>' +
    '<div style="margin-bottom:14px;">' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">' +
    '<span>下载进度</span><span id="ota-progress-text">0%</span></div>' +
    '<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">' +
    '<div id="ota-progress-bar" style="height:100%;width:0%;background:var(--blue);border-radius:4px;transition:width 0.3s;"></div></div></div>' +
    '<div id="ota-status" style="padding:10px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);text-align:center;margin-bottom:12px;">⏳ 准备升级...</div></div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-firmware-ota\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="startOTAUpgrade(\'' + uuid + '\')" id="ota-start-btn" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">🚀 开始升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📦 OTA升级准备中', 'info');
};

window.startOTAUpgrade = function(uuid) {
  uuid = uuid || 'LOCK-301-001';
  var progressBar = document.getElementById('ota-progress-bar');
  var progressText = document.getElementById('ota-progress-text');
  var statusEl = document.getElementById('ota-status');
  var startBtn = document.getElementById('ota-start-btn');
  if (startBtn) startBtn.disabled = true;
  var step = 0;
  var statuses = ['⏳ 正在下载固件...', '⏳ 正在验证固件...', '⏳ 正在推送升级...', '✅ 升级成功！'];
  var statusColors = ['var(--blue)', 'var(--orange)', 'var(--purple)', 'var(--green)'];
  var interval = setInterval(function() {
    step++;
    var pct = step * 25;
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '%';
    if (statusEl) { statusEl.textContent = statuses[Math.min(step, 3)]; statusEl.style.background = statusColors[Math.min(step, 3)] + '20'; statusEl.style.color = statusColors[Math.min(step, 3)]; }
    if (step >= 4) {
      clearInterval(interval);
      showToast('✅ 设备 ' + uuid + ' 固件升级成功！', 'success');
      setTimeout(function() { var m = document.getElementById('modal-firmware-ota'); if (m) m.remove(); }, 1500);
    }
  }, 800);
};

// ============================================================
// 【改进6】openFirmwareVersionTrackerModal - 固件版本跟踪器
// 理由：onclick="openFirmwareVersionTrackerModal()" 但函数体缺失
// 业务逻辑：跟踪固件版本历史，查看各版本发布时间和变更内容
// ============================================================
window.openFirmwareVersionTrackerModal = function() {
  var versions = [
    {version:'v2.1.3', date:'2026-03-25', type:'feature', desc:'新增离线应急密码生成算法', devices:18, status:'current'},
    {version:'v2.1.2', date:'2026-03-18', type:'stable', desc:'修复低电量告警延迟问题', devices:12, status:'stable'},
    {version:'v2.1.1', date:'2026-03-10', type:'bugfix', desc:'优化蓝牙连接稳定性', devices:7, status:'old'},
    {version:'v2.1.0', date:'2026-03-01', type:'feature', desc:'支持批量OTA升级', devices:0, status:'deprecated'},
    {version:'v2.0.9', date:'2026-02-20', type:'critical', desc:'安全漏洞修复（紧急）', devices:3, status:'critical'}
  ];
  var typeColors = {feature:'var(--blue)', stable:'var(--green)', bugfix:'var(--orange)', critical:'var(--red)', deprecated:'var(--text-muted)'};
  var typeLabels = {feature:'新功能', stable:'稳定版', bugfix:'问题修复', critical:'安全更新', deprecated:'已废弃'};
  var rows = versions.map(function(v) {
    var isCurrent = v.status === 'current' ? '<span style="margin-left:6px;padding:1px 6px;background:var(--green-bg);color:var(--green);border-radius:8px;font-size:10px;">当前</span>' : '';
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;"><span style="font-weight:700;">' + v.version + '</span>' + isCurrent + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;color:var(--text-muted);">' + v.date + '</td>' +
      '<td style="padding:10px 8px;"><span style="padding:2px 8px;background:' + typeColors[v.type] + '20;color:' + typeColors[v.type] + ';border-radius:8px;font-size:11px;font-weight:600;">' + typeLabels[v.type] + '</span></td>' +
      '<td style="padding:10px 8px;font-size:12px;">' + v.desc + '</td>' +
      '<td style="padding:10px 8px;text-align:center;font-size:12px;">' + (v.devices > 0 ? '<span style="font-weight:700;color:var(--blue);">' + v.devices + '</span> 台' : '-') + '</td>' +
      '<td style="padding:10px 8px;text-align:center;">' +
      (v.status === 'current' ? '<span style="font-size:11px;color:var(--text-muted);">当前版本</span>' :
       '<button onclick="openDeviceFirmwareOTAModal()" class="action-btn small" style="padding:2px 8px;font-size:11px;">📦 升级</button>') + '</td></tr>';
  }).join('');
  var existing = document.getElementById('modal-firmware-tracker');
  if (existing) existing.remove();
  var html = '<div id="modal-firmware-tracker" class="modal-overlay hidden" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-tracker\').remove()">' +
    '<div class="modal" style="width:820px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📡 固件版本跟踪器</div>' +
    '<button onclick="document.getElementById(\'modal-firmware-tracker\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 20px;">' +
    '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:12px;">' +
    '<thead><tr style="background:var(--bg);color:var(--text-muted);font-size:11px;font-weight:600;">' +
    '<th style="padding:8px;text-align:left;">版本</th><th style="padding:8px;">发布日期</th><th style="padding:8px;">类型</th><th style="padding:8px;">变更说明</th><th style="padding:8px;text-align:center;">在线设备</th><th style="padding:8px;text-align:center;">操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-firmware-tracker\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📡 固件版本跟踪器已打开', 'info');
};
