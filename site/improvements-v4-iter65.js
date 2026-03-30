// ============================================================
// 【物联后台v4-第65轮】5个功能性断裂修复
// 修复日期：2026-03-30
// 本轮修复：searchByCardNumber | switchLogView | showDoorLogDetail | openFirmwareVersionTrackerModal | openDeviceGroupManageModal
// ============================================================

// ============================================================
// 【改进1】开锁记录-按卡号搜索（searchByCardNumber）
// 理由：按卡查Tab的搜索按钮 onclick="searchByCardNumber()" 未定义
// 业务逻辑：根据卡号/会员号搜索开锁记录，支持模糊匹配
// ============================================================
window.searchByCardNumber = function() {
  var cardInput = document.getElementById('log-card-number');
  var typeFilter = document.getElementById('log-card-type-filter');
  if (!cardInput) { showToast('未找到搜索框', 'error'); return; }
  var keyword = cardInput.value.trim();
  var cardType = typeFilter ? typeFilter.value : 'all';
  var tbody = document.getElementById('log-table-body');
  if (!tbody) { showToast('未找到记录表格', 'error'); return; }
  var rows = tbody.querySelectorAll('tr[data-type]');
  var found = 0;
  rows.forEach(function(row) {
    var cardNum = (row.dataset.cardnum || '').toLowerCase();
    var cardtype = row.dataset.cardtype || '';
    var typeMatch = cardType === 'all' || cardtype === cardType;
    var keywordMatch = !keyword || cardNum.indexOf(keyword.toLowerCase()) >= 0;
    var show = typeMatch && keywordMatch;
    row.style.display = show ? '' : 'none';
    if (show) found++;
  });
  var resultEl = document.getElementById('log-filter-result');
  if (resultEl) resultEl.textContent = '共 ' + found + ' 条记录';
  if (found === 0 && keyword) {
    showToast('未找到包含 "' + keyword + '" 的记录', 'warning');
  } else {
    showToast('找到 ' + found + ' 条记录', 'success');
  }
};

// 搜索框实时预览（回车前）
window.cardNumberSearchPreview = function(val) {
  // 实时高亮匹配行
  var tbody = document.getElementById('log-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr[data-type]');
  var keyword = val.trim().toLowerCase();
  rows.forEach(function(row) {
    var cardNum = (row.dataset.cardnum || '').toLowerCase();
    row.style.background = '';
    if (keyword && cardNum.indexOf(keyword) >= 0) {
      row.style.background = 'var(--blue-bg)';
    }
  });
};

// ============================================================
// 【改进2】开锁记录视图切换（switchLogView）
// 理由：开锁记录页面"按卡查/按门查"Tab onclick="switchLogView()" 未定义
// 业务逻辑：切换开锁记录的展示视图（按卡号/按门牌号）
// ============================================================
window.switchLogView = function(view, el) {
  if (!el) return;
  // Update tab styling
  var tabs = document.querySelectorAll('.card-tab');
  tabs.forEach(function(tab) {
    tab.style.fontWeight = '';
    tab.style.color = '';
    tab.style.borderBottom = '';
  });
  el.style.fontWeight = '600';
  el.style.color = 'var(--blue)';
  el.style.borderBottom = '2px solid var(--blue)';
  // Hide both tables
  var cardTable = document.getElementById('log-card-view');
  var doorTable = document.getElementById('log-door-view');
  if (cardTable) cardTable.style.display = 'none';
  if (doorTable) doorTable.style.display = 'none';
  // Show selected view
  if (view === 'card') {
    if (cardTable) cardTable.style.display = '';
    showToast('已切换至按卡号查看', 'info');
  } else if (view === 'door') {
    if (doorTable) doorTable.style.display = '';
    showToast('已切换至按门牌查看', 'info');
  }
};

// ============================================================
// 【改进3】按门查看-详情弹窗（showDoorLogDetail）
// 理由：按门查看表格的"详情"按钮 onclick="showDoorLogDetail(room)" 未定义
// 业务逻辑：展示指定房间的全部开锁记录详情弹窗
// ============================================================
window.showDoorLogDetail = function(roomNum) {
  var existing = document.getElementById('modal-door-log-detail');
  if (existing) existing.remove();

  // Mock data for door log
  var doorLogData = {
    '301': [
      {time:'10:32:08', type:'phone', typeName:'手机开锁', cardNum:'M138****8888', operator:'张三', cardtype:'会员'},
      {time:'09:15:30', type:'card', typeName:'客户卡', cardNum:'C2026***101', operator:'李四', cardtype:'会员'},
      {time:'08:45:12', type:'master', typeName:'通卡', cardNum:'MASTER001', operator:'赵管家', cardtype:'员工'},
      {time:'08:30:00', type:'password', typeName:'密码开锁', cardNum:'PASS-301-01', operator:'王五', cardtype:'访客'},
      {time:'08:00:55', type:'finger', typeName:'指纹开锁', cardNum:'F301-01', operator:'张三', cardtype:'会员'}
    ],
    '203': [
      {time:'10:15:22', type:'card', typeName:'客户卡', cardNum:'C2026***101', operator:'李四', cardtype:'会员'},
      {time:'09:00:10', type:'phone', typeName:'手机开锁', cardNum:'M139****6666', operator:'孙六', cardtype:'会员'},
      {time:'08:20:33', type:'master', typeName:'通卡', cardNum:'MASTER001', operator:'赵管家', cardtype:'员工'}
    ],
    '304': [
      {time:'09:48:05', type:'phone', typeName:'手机开锁', cardNum:'M137****5555', operator:'王五', cardtype:'会员'},
      {time:'08:10:44', type:'card', typeName:'客户卡', cardNum:'C2026***102', operator:'钱七', cardtype:'会员'}
    ],
    '102': [
      {time:'09:30:18', type:'master', typeName:'通卡', cardNum:'MASTER001', operator:'赵飞', cardtype:'员工'},
      {time:'08:05:22', type:'finger', typeName:'指纹开锁', cardNum:'F102-01', operator:'孙九', cardtype:'会员'}
    ],
    '201': [
      {time:'09:12:44', type:'card', typeName:'员工卡', cardNum:'E001', operator:'钱七', cardtype:'员工'},
      {time:'08:00:11', type:'phone', typeName:'手机开锁', cardNum:'M136****3333', operator:'周十', cardtype:'会员'},
      {time:'07:45:00', type:'master', typeName:'通卡', cardNum:'MASTER001', operator:'系统', cardtype:'系统'}
    ],
    '202': [
      {time:'22:05:00', type:'phone', typeName:'手机开锁', cardNum:'M135****7777', operator:'孙九', cardtype:'会员'},
      {time:'08:30:15', type:'card', typeName:'客户卡', cardNum:'C2026***105', operator:'吴一', cardtype:'会员'}
    ]
  };

  var logs = doorLogData[roomNum] || [];
  var typeIcon = {phone:'📱', card:'💳', master:'🔑', password:'🔐', finger:'👆'};
  var typeColor = {phone:'var(--green)', card:'var(--blue)', master:'var(--orange)', password:'var(--purple)', finger:'var(--blue)'};

  var logItems = logs.map(function(log) {
    var icon = typeIcon[log.type] || '🔐';
    var color = typeColor[log.type] || 'var(--text)';
    return '<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);gap:10px;">' +
      '<div style="font-size:20px;width:30px;text-align:center;">' + icon + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:13px;font-weight:600;">' + log.typeName + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">操作人：' + log.operator + ' · ' + log.cardtype + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);font-family:monospace;">' + log.cardNum + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);">' + log.time + '</div>' +
    '</div>';
  }).join('');

  var html = '<div class="modal-overlay hidden" id="modal-door-log-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-door-log-detail\').remove()">' +
    '<div class="modal" style="width:480px;max-height:80vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🚪</div><div><div style="font-size:15px;font-weight:700;">房间 ' + roomNum + ' 开锁记录</div><div style="font-size:11px;color:var(--text-muted);">共 ' + logs.length + ' 条记录</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-door-log-detail\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    (logItems || '<div style="text-align:center;padding:30px;color:var(--text-muted);">暂无记录</div>') +
    '</div>' +
    '<div style="padding:12px 24px 20px;border-top:1px solid var(--border);display:flex;gap:10px;">' +
    '<button class="action-btn" onclick="showToast(\'正在导出房间 ' + roomNum + ' 的记录...\',\'info\')" style="flex:1;padding:8px;">📤 导出记录</button>' +
    '<button class="action-btn" onclick="document.getElementById(\'modal-door-log-detail\').remove()" style="flex:1;padding:8px;background:var(--bg);color:var(--text);">关闭</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// ============================================================
// 【改进4】固件版本跟踪器弹窗（openFirmwareVersionTrackerModal）
// 理由：设备管理工具栏"版本跟踪器"按钮 onclick="openFirmwareVersionTrackerModal()" 未定义
// 业务逻辑：展示所有设备固件版本的升级历史和时间线
// ============================================================
window.openFirmwareVersionTrackerModal = function() {
  var existing = document.getElementById('modal-firmware-tracker');
  if (existing) existing.remove();

  // Mock firmware version history data
  var versionData = [
    {device:'DEV-LK01', room:'301', current:'v2.8.5', latest:'v2.8.5', lastUpdate:'2026-03-28', history:['v2.8.4 → v2.8.5','v2.8.3 → v2.8.4','v2.8.2 → v2.8.3']},
    {device:'DEV-LK02', room:'302', current:'v2.8.5', latest:'v2.8.5', lastUpdate:'2026-03-28', history:['v2.8.4 → v2.8.5','v2.8.3 → v2.8.4']},
    {device:'DEV-LK03', room:'303', current:'v2.8.4', latest:'v2.8.5', lastUpdate:'2026-03-20', history:['v2.8.3 → v2.8.4','v2.8.2 → v2.8.3']},
    {device:'DEV-LK04', room:'304', current:'v2.8.2', latest:'v2.8.5', lastUpdate:'2026-03-15', history:['v2.8.1 → v2.8.2']},
    {device:'DEV-LK05', room:'305', current:'v2.8.5', latest:'v2.8.5', lastUpdate:'2026-03-28', history:['v2.8.4 → v2.8.5']},
    {device:'DEV-LK06', room:'306', current:'v2.8.3', latest:'v2.8.5', lastUpdate:'2026-03-22', history:['v2.8.2 → v2.8.3','v2.8.1 → v2.8.2']}
  ];

  var rows = versionData.map(function(d, i) {
    var needsUpgrade = d.current !== d.latest;
    var statusColor = needsUpgrade ? 'var(--orange)' : 'var(--green)';
    var statusBg = needsUpgrade ? 'var(--orange-bg)' : 'var(--green-bg)';
    var statusText = needsUpgrade ? '需升级' : '已是最新';
    var historyItems = d.history.slice(-2).map(function(h) {
      return '<div style="font-size:10px;color:var(--text-muted);padding:2px 0;">' + h + '</div>';
    }).join('');
    return '<tr style="font-size:12px;">' +
      '<td style="padding:8px;font-weight:600;">' + d.device + '</td>' +
      '<td style="padding:8px;color:var(--blue);">' + d.room + '</td>' +
      '<td style="padding:8px;"><span style="background:var(--blue-bg);color:var(--blue);padding:2px 6px;border-radius:4px;font-size:11px;">' + d.current + '</span></td>' +
      '<td style="padding:8px;"><span style="background:var(--green-bg);color:var(--green);padding:2px 6px;border-radius:4px;font-size:11px;">' + d.latest + '</span></td>' +
      '<td style="padding:8px;">' + d.lastUpdate + '</td>' +
      '<td style="padding:8px;"><span style="background:' + statusBg + ';color:' + statusColor + ';padding:2px 6px;border-radius:4px;font-size:10px;">' + statusText + '</span></td>' +
      '<td style="padding:8px;">' + (needsUpgrade ? '<button class="action-btn" onclick="showToast(\'开始升级 ' + d.device + '...\');document.getElementById(\'modal-firmware-tracker\').remove();" style="padding:3px 8px;font-size:10px;background:var(--blue);color:white;border:none;">📦 升级</button>' : '—') + '</td>' +
    '</tr>';
  }).join('');

  var html = '<div class="modal-overlay hidden" id="modal-firmware-tracker" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-tracker\').remove()">' +
    '<div class="modal" style="width:720px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:24px;">📡</div><div><div style="font-size:15px;font-weight:700;">固件版本跟踪器</div><div style="font-size:11px;color:var(--text-muted);">追踪所有设备固件版本升级历史</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-tracker\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
    '<div style="flex:1;padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--blue);">6</div><div style="font-size:11px;color:var(--text-muted);">设备总数</div></div>' +
    '<div style="flex:1;padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--green);">3</div><div style="font-size:11px;color:var(--text-muted);">已是最新</div></div>' +
    '<div style="flex:1;padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--orange);">3</div><div style="font-size:11px;color:var(--text-muted);">待升级</div></div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;">' +
    '<thead><tr style="background:var(--bg);font-size:11px;color:var(--text-muted);"><th style="padding:8px;text-align:left;">设备ID</th><th style="padding:8px;text-align:left;">房间</th><th style="padding:8px;text-align:left;">当前版本</th><th style="padding:8px;text-align:left;">最新版本</th><th style="padding:8px;text-align:left;">最近升级</th><th style="padding:8px;text-align:left;">状态</th><th style="padding:8px;text-align:left;">操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +
    '</div>' +
    '<div style="padding:12px 24px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="action-btn" onclick="showToast(\'正在导出版本跟踪报告...\',\'info\')" style="padding:8px 16px;">📤 导出报告</button>' +
    '<button class="action-btn" onclick="document.getElementById(\'modal-firmware-tracker\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);">关闭</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// ============================================================
// 【改进5】设备分组管理弹窗（openDeviceGroupManageModal）
// 理由：设备管理工具栏"管理分组"按钮 onclick="openDeviceGroupManageModal()" 未定义
// 业务逻辑：管理设备分组（新增/编辑/删除分组，分配设备到分组）
// ============================================================
window.openDeviceGroupManageModal = function() {
  var existing = document.getElementById('modal-device-group-manage');
  if (existing) existing.remove();

  // Mock group data
  var groups = [
    {name:'主楼', icon:'🏢', count:12, devices:['DEV-LK01','DEV-LK02','DEV-LK03','DEV-LK04','DEV-LK05','DEV-LK06','DEV-LK07','DEV-LK08','DEV-LK09','DEV-LK10','DEV-LK11','DEV-LK12']},
    {name:'东配楼', icon:'🏢', count:6, devices:['DEV-LK13','DEV-LK14','DEV-LK15','DEV-LK16','DEV-LK17','DEV-LK18']},
    {name:'VIP专区', icon:'⭐', count:4, devices:['DEV-LK19','DEV-LK20','DEV-LK21','DEV-LK22']},
    {name:'低电量告警', icon:'🔋', count:2, devices:['DEV-LK05','DEV-LK07']}
  ];

  var groupCards = groups.map(function(g, i) {
    return '<div style="padding:14px;background:var(--bg);border-radius:8px;margin-bottom:8px;" id="dg-group-' + i + '">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
      '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">' + g.icon + '</span><span style="font-weight:600;font-size:13px;">' + g.name + '</span><span style="font-size:11px;color:var(--text-muted);background:white;padding:2px 6px;border-radius:10px;">' + g.count + '台</span></div>' +
      '<div style="display:flex;gap:4px;">' +
      '<button onclick="editDeviceGroup(' + i + ',\'' + g.name + '\')" style="padding:3px 8px;background:var(--blue-bg);color:var(--blue);border:none;border-radius:4px;cursor:pointer;font-size:10px;">✏️ 编辑</button>' +
      '<button onclick="deleteDeviceGroup(' + i + ',\'' + g.name + '\')" style="padding:3px 8px;background:var(--red-bg);color:var(--red);border:none;border-radius:4px;cursor:pointer;font-size:10px;">🗑️ 删除</button>' +
      '</div></div>' +
      '<div style="font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">设备：' + g.devices.join(', ') + '</div>' +
    '</div>';
  }).join('');

  var html = '<div class="modal-overlay hidden" id="modal-device-group-manage" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-group-manage\').remove()">' +
    '<div class="modal" style="width:520px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:24px;">⚙️</div><div><div style="font-size:15px;font-weight:700;">设备分组管理</div><div style="font-size:11px;color:var(--text-muted);">管理设备分组，分配设备归属</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-device-group-manage\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    '<div style="margin-bottom:16px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-light);">已有分组</div>' +
    groupCards +
    '</div>' +
    '<div style="border-top:1px solid var(--border);padding-top:16px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-light);">新增分组</div>' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<input id="dg-new-name" class="form-input" placeholder="分组名称，如：1号楼" style="flex:1;padding:8px 10px;font-size:12px;" />' +
    '<input id="dg-new-icon" class="form-input" placeholder="图标，如：🏢" style="width:60px;padding:8px 10px;font-size:12px;text-align:center;" />' +
    '<button onclick="addNewDeviceGroup()" style="padding:8px 14px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">➕ 添加</button>' +
    '</div></div>' +
    '</div>' +
    '<div style="padding:12px 24px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="action-btn" onclick="document.getElementById(\'modal-device-group-manage\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);">关闭</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// 辅助函数：编辑分组
window.editDeviceGroup = function(idx, name) {
  showToast('编辑分组：' + name + '（功能演示）', 'info');
};

// 辅助函数：删除分组
window.deleteDeviceGroup = function(idx, name) {
  if (!confirm('确定删除分组 "' + name + '" 吗？设备不会被删除。')) return;
  var el = document.getElementById('dg-group-' + idx);
  if (el) {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(function() { el.remove(); showToast('分组 "' + name + '" 已删除', 'success'); }, 300);
  }
};

// 辅助函数：添加新分组
window.addNewDeviceGroup = function() {
  var nameInput = document.getElementById('dg-new-name');
  var iconInput = document.getElementById('dg-new-icon');
  var name = nameInput ? nameInput.value.trim() : '';
  var icon = iconInput ? iconInput.value.trim() : '📦';
  if (!name) { showToast('请输入分组名称', 'warning'); return; }
  showToast('已添加分组：' + icon + ' ' + name, 'success');
  if (nameInput) nameInput.value = '';
  if (iconInput) iconInput.value = '';
};

console.log('[iter65] 5个功能性断裂修复完成：searchByCardNumber / switchLogView / showDoorLogDetail / openFirmwareVersionTrackerModal / openDeviceGroupManageModal');
