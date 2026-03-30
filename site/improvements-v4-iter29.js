// ============================================================
// 【物联后台 v4 第29轮】5个缺失函数修复
// 修复缺失函数：openBatchDeviceBindingModal / openFirmwareAnalyzerModal / openFirmwareVersionTrackerModal / openBatchDeviceDiagnosticModal / openBatchBatteryCheck
// ============================================================

// ============================================================
// 【修复1】openBatchDeviceBindingModal - 设备绑定弹窗
// 理由：设备管理工具栏"设备绑定"按钮调用openBatchDeviceBindingModal但从未定义
// 功能：批量绑定设备到房间，支持扫码/手动输入/解绑
// ============================================================
window.openBatchDeviceBindingModal = function() {
  var existing = document.getElementById('modal-batch-binding');
  if (existing) existing.remove();

  var devices = [
    {uuid:'DEV-LK01-301', room:'301', model:'领握LH-807', status:'已绑定', bindTime:'2026-03-10'},
    {uuid:'DEV-LK02-302', room:'302', model:'领握LH-807', status:'已绑定', bindTime:'2026-03-10'},
    {uuid:'DEV-LK03-303', room:'-', model:'领握LH-807', status:'未绑定', bindTime:'-'},
    {uuid:'DEV-LK04-304', room:'304', model:'领握LH-807', status:'已绑定', bindTime:'2026-03-12'},
    {uuid:'DEV-LK05-305', room:'-', model:'领握LH-807', status:'未绑定', bindTime:'-'},
    {uuid:'DEV-LK06-306', room:'306', model:'领握LH-807', status:'已绑定', bindTime:'2026-03-15'}
  ];

  var unboundCount = devices.filter(function(d){ return d.status === '未绑定'; }).length;
  var boundCount = devices.filter(function(d){ return d.status === '已绑定'; }).length;

  var rows = devices.map(function(d, i) {
    var bindColor = d.status === '已绑定' ? 'var(--green)' : 'var(--text-muted)';
    var bg = d.status === '已绑定' ? 'var(--green-bg)' : 'var(--bg)';
    return '<tr style="background:' + bg + ';">' +
      '<td><span style="font-size:11px;font-weight:600;">' + d.uuid + '</span></td>' +
      '<td><span style="font-size:12px;">' + d.model + '</span></td>' +
      '<td><span style="font-size:12px;font-weight:700;color:' + (d.room === '-' ? 'var(--red)' : 'var(--blue)') + ';">' + d.room + '</span></td>' +
      '<td><span class="tbadge ' + (d.status === '已绑定' ? 'green' : 'gray') + '">' + d.status + '</span></td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + d.bindTime + '</td>' +
      '<td>' +
        (d.status === '已绑定'
          ? '<button class="action-btn small orange" onclick="confirmUnbindDeviceBinding(\'' + d.uuid + '\')">解除绑定</button>'
          : '<button class="action-btn small green" onclick="openBindRoomToDevice(\'' + d.uuid + '\')">绑定房间</button>') +
      '</td></tr>';
  }).join('');

  var html = '<div class="hidden modal-overlay" id="modal-batch-binding" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-binding\').remove()">' +
    '<div class="modal" style="width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">📡</div>' +
    '<div style="font-size:15px;font-weight:700;">设备批量绑定管理</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">已绑定 ' + boundCount + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--orange-bg);color:var(--orange);border-radius:10px;font-size:11px;font-weight:600;">待绑定 ' + unboundCount + ' 台</span>' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
    '<input class="form-input" id="binding-search" oninput="filterBindingTable()" placeholder="🔍 搜索设备UUID/房间号" style="flex:1;min-width:200px;padding:7px 12px;font-size:12px;"/>' +
    '<select class="form-select" id="binding-status-filter" onchange="filterBindingTable()" style="padding:7px 10px;font-size:12px;width:130px;">' +
    '<option value="all">全部状态</option>' +
    '<option value="bound">已绑定</option>' +
    '<option value="unbound">未绑定</option></select>' +
    '<button class="action-btn small" onclick="openScanQRBindModal()" style="padding:6px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);">📷 扫码绑定</button>' +
    '<button class="action-btn small" onclick="openBatchImportBindModal()" style="padding:6px 12px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">📥 批量导入</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>设备UUID</th><th>设备型号</th><th>绑定房间</th><th>状态</th><th>绑定时间</th><th>操作</th></tr></thead>' +
    '<tbody id="binding-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-binding\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="exportBindingReport()" style="background:var(--green);border-color:var(--green);">📤 导出绑定表</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.filterBindingTable = function() {
  var query = document.getElementById('binding-search') ? document.getElementById('binding-search').value.trim().toLowerCase() : '';
  var status = document.getElementById('binding-status-filter') ? document.getElementById('binding-status-filter').value : 'all';
  var rows = document.querySelectorAll('#binding-table-body tr');
  var visible = 0;
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var isBound = row.textContent.indexOf('已绑定') >= 0;
    var match = (!query || text.indexOf(query) >= 0) && (status === 'all' || (status === 'bound' && isBound) || (status === 'unbound' && !isBound));
    row.style.display = match ? '' : 'none';
    if (match) visible++;
  });
};

window.confirmUnbindDeviceBinding = function(uuid) {
  var confirmed = confirm('确定要解除设备 ' + uuid + ' 的绑定吗？\n解除后该设备可重新绑定到其他房间。');
  if (!confirmed) return;
  showToast('✅ 设备 ' + uuid + ' 已解除绑定', 'success');
};

window.openBindRoomToDevice = function(uuid) {
  var room = prompt('请输入要绑定到的房间号（如：301）：');
  if (!room || !room.trim()) return;
  room = room.trim();
  if (!/^\d{3}$/.test(room)) { showToast('房间号格式错误，请输入3位数字（如301）', 'error'); return; }
  showToast('✅ 设备 ' + uuid + ' 已绑定到房间 ' + room, 'success');
};

window.openScanQRBindModal = function() {
  var existing = document.getElementById('modal-scan-qr-bind');
  if (existing) existing.remove();
  var html = '<div class="hidden modal-overlay" id="modal-scan-qr-bind" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-scan-qr-bind\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">📷</div><div style="font-size:15px;font-weight:700;">扫码绑定设备</div>' +
    '<button onclick="document.getElementById(\'modal-scan-qr-bind\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:24px;text-align:center;">' +
    '<div style="width:200px;height:200px;background:var(--bg);border:2px dashed var(--border);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">' +
    '<div style="font-size:48px;">📷</div><div style="font-size:12px;color:var(--text-muted);">摄像头取景框</div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">将设备上的二维码对准扫描框</div>' +
    '<div class="form-group"><label class="form-label">或手动输入设备UUID</label>' +
    '<input type="text" class="form-input" id="scan-uuid-input" placeholder="DEV-LKXX-XXX"></input></div>' +
    '<div class="form-group"><label class="form-label">绑定到房间</label>' +
    '<input type="text" class="form-input" id="scan-room-input" placeholder="房间号，如：301"></input></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-scan-qr-bind\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitScanBind()" style="background:var(--green);border-color:var(--green);">✅ 确认绑定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitScanBind = function() {
  var uuid = document.getElementById('scan-uuid-input') ? document.getElementById('scan-uuid-input').value.trim() : '';
  var room = document.getElementById('scan-room-input') ? document.getElementById('scan-room-input').value.trim() : '';
  if (!uuid) { showToast('请输入设备UUID', 'error'); return; }
  if (!room || !/^\d{3}$/.test(room)) { showToast('请输入正确的房间号（3位数字）', 'error'); return; }
  document.getElementById('modal-scan-qr-bind') && document.getElementById('modal-scan-qr-bind').remove();
  document.getElementById('modal-batch-binding') && document.getElementById('modal-batch-binding').remove();
  showToast('✅ 设备 ' + uuid + ' 已绑定到房间 ' + room, 'success');
};

window.openBatchImportBindModal = function() {
  var existing = document.getElementById('modal-batch-import-bind');
  if (existing) existing.remove();
  var html = '<div class="hidden modal-overlay" id="modal-batch-import-bind" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-import-bind\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">📥</div><div style="font-size:15px;font-weight:700;">批量导入设备绑定</div>' +
    '<button onclick="document.getElementById(\'modal-batch-import-bind\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">' +
    '💡 支持 CSV 格式，每行一个设备：设备UUID,房间号<br>示例：<br>DEV-LK07-307,307<br>DEV-LK08-308,308</div>' +
    '<div class="form-group"><label class="form-label">粘贴 CSV 数据</label>' +
    '<textarea class="form-textarea" id="bind-import-data" placeholder="DEV-LK07-307,307&#10;DEV-LK08-308,308" style="min-height:120px;font-family:monospace;font-size:12px;"></textarea></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">或 <a href="#" onclick="downloadBindTemplate()" style="color:var(--blue);">下载CSV模板</a></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-import-bind\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitBatchImportBind()" style="background:var(--green);border-color:var(--green);">📥 开始导入</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.downloadBindTemplate = function() {
  var csv = '\uFEFF设备UUID,房间号\nDEV-LK07-307,307\nDEV-LK08-308,308';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '设备绑定模板.csv'; a.click();
  showToast('📥 模板已下载', 'success');
};

window.submitBatchImportBind = function() {
  var data = document.getElementById('bind-import-data') ? document.getElementById('bind-import-data').value.trim() : '';
  if (!data) { showToast('请粘贴导入数据', 'error'); return; }
  var lines = data.split('\n').filter(function(l){ return l.trim(); });
  if (lines.length === 0) { showToast('未检测到有效数据', 'error'); return; }
  document.getElementById('modal-batch-import-bind') && document.getElementById('modal-batch-import-bind').remove();
  showToast('📥 成功导入 ' + lines.length + ' 条设备绑定记录', 'success');
};

window.exportBindingReport = function() {
  var csv = '\uFEFF设备UUID,设备型号,绑定房间,状态,绑定时间\nDEV-LK01-301,领握LH-807,301,已绑定,2026-03-10\nDEV-LK02-302,领握LH-807,302,已绑定,2026-03-10\nDEV-LK03-303,领握LH-807,-,未绑定,-\nDEV-LK04-304,领握LH-807,304,已绑定,2026-03-12';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '设备绑定表_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click(); showToast('📤 绑定表已导出', 'success');
};

// ============================================================
// 【修复2】openFirmwareAnalyzerModal - 固件版本分析器
// 理由：设备固件升级工具栏调用openFirmwareAnalyzerModal但从未定义
// 功能：分析所有设备固件版本分布，找出可升级/异常版本设备
// ============================================================
window.openFirmwareAnalyzerModal = function() {
  var existing = document.getElementById('modal-firmware-analyzer');
  if (existing) existing.remove();

  var devices = [
    {room:'301', uuid:'DEV-LK01-301', version:'v2.3.1', latest:'v2.3.1', status:'最新', battery:88},
    {room:'302', uuid:'DEV-LK02-302', version:'v2.3.0', latest:'v2.3.1', status:'可升级', battery:92},
    {room:'303', uuid:'DEV-LK03-303', version:'v2.2.8', latest:'v2.3.1', status:'落后2代', battery:0},
    {room:'304', uuid:'DEV-LK04-304', version:'v2.3.1', latest:'v2.3.1', status:'最新', battery:78},
    {room:'305', uuid:'DEV-LK05-305', version:'v2.3.1', latest:'v2.3.1', status:'最新', battery:28},
    {room:'201', uuid:'DEV-LK07-201', version:'v2.3.0', latest:'v2.3.1', status:'可升级', battery:85},
    {room:'202', uuid:'DEV-LK08-202', version:'v2.1.5', latest:'v2.3.1', status:'落后3代', battery:35}
  ];

  var latest = devices.filter(function(d){ return d.status === '最新'; }).length;
  var upgradable = devices.filter(function(d){ return d.status === '可升级'; }).length;
  var outdated = devices.filter(function(d){ return d.status.indexOf('落后') >= 0; }).length;

  var versionGroups = {};
  devices.forEach(function(d) {
    if (!versionGroups[d.version]) versionGroups[d.version] = [];
    versionGroups[d.version].push(d);
  });

  var versionBars = Object.keys(versionGroups).map(function(ver) {
    var count = versionGroups[ver].length;
    var pct = Math.round((count / devices.length) * 100);
    var isLatest = ver === 'v2.3.1';
    return '<div style="margin-bottom:8px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">' +
      '<span style="font-weight:600;color:' + (isLatest ? 'var(--green)' : 'var(--text)') + ';">' + ver + (isLatest ? ' ✅' : '') + '</span>' +
      '<span style="color:var(--text-muted);">' + count + '台 (' + pct + '%)</span></div>' +
      '<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">' +
      '<div style="height:100%;width:' + pct + '%;background:' + (isLatest ? 'var(--green)' : (pct > 30 ? 'var(--orange)' : 'var(--blue)')) + ';border-radius:4px;"></div></div></div>';
  }).join('');

  var rows = devices.map(function(d) {
    var statusClass = d.status === '最新' ? 'green' : d.status === '可升级' ? 'blue' : 'red';
    var rowBg = d.status.indexOf('落后') >= 0 ? 'var(--red-bg)' : '';
    return '<tr style="' + rowBg + ';">' +
      '<td><span style="font-weight:700;">' + d.room + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + d.uuid + '</span></td>' +
      '<td><span class="tbadge ' + statusClass + '">' + d.status + '</span></td>' +
      '<td><span style="font-weight:600;">' + d.version + '</span></td>' +
      '<td><span style="color:var(--green);">v2.3.1</span></td>' +
      '<td><span style="font-size:11px;color:' + (d.battery === 0 ? 'var(--red)' : d.battery < 30 ? 'var(--orange)' : 'var(--text-muted)') + ';">' + (d.battery === 0 ? '离线' : d.battery + '%') + '</span></td>' +
      '<td>' + (d.status !== '最新' ? '<button class="action-btn small green" onclick="showToast(\'设备 ' + d.room + ' 固件升级请求已发送\',\'success\')">📦 升级</button>' : '<span style="font-size:11px;color:var(--text-muted);">—</span>') + '</td></tr>';
  }).join('');

  var html = '<div class="hidden modal-overlay" id="modal-firmware-analyzer" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-analyzer\').remove()">' +
    '<div class="modal" style="width:800px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">📡</div>' +
    '<div style="font-size:15px;font-weight:700;">固件版本分析器</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">最新 ' + latest + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--blue-bg);color:var(--blue);border-radius:10px;font-size:11px;font-weight:600;">可升级 ' + upgradable + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--red-bg);color:var(--red);border-radius:10px;font-size:11px;font-weight:600;">落后 ' + outdated + ' 台</span>' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border);">' +
    '<div style="padding:14px;background:var(--bg);border-radius:8px;">' +
    '<div style="font-size:12px;font-weight:700;margin-bottom:10px;">📊 版本分布</div>' + versionBars + '</div>' +
    '<div style="padding:14px;background:var(--bg);border-radius:8px;">' +
    '<div style="font-size:12px;font-weight:700;margin-bottom:10px;">⚠️ 异常检测</div>' +
    '<div style="font-size:12px;color:var(--red);margin-bottom:8px;">🔴 ' + outdated + ' 台设备固件落后2代以上</div>' +
    '<div style="font-size:12px;color:var(--orange);margin-bottom:8px;">🟡 ' + upgradable + ' 台可升级到最新版本</div>' +
    '<div style="font-size:12px;color:var(--green);margin-bottom:8px;">🟢 ' + latest + ' 台已是最新版本</div>' +
    '<div style="margin-top:12px;padding:10px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:6px;font-size:11px;color:var(--orange);">⚡ 建议优先升级落后2代以上的设备，升级前请确保设备在线且电量>50%</div></div></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>房间</th><th>设备UUID</th><th>状态</th><th>当前版本</th><th>最新版本</th><th>电量</th><th>操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-analyzer\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="batchUpgradeOutdated()" style="background:var(--orange);border-color:var(--orange);">🚀 一键升级所有可升级设备</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.batchUpgradeOutdated = function() {
  var confirmed = confirm('确定要批量升级所有可升级设备吗？\n升级过程设备将暂时离线，预计每台30秒。');
  if (!confirmed) return;
  showToast('🚀 批量升级任务已创建，共 ' + 2 + ' 台设备排队中', 'success');
  document.getElementById('modal-firmware-analyzer') && document.getElementById('modal-firmware-analyzer').remove();
};

// ============================================================
// 【修复3】openFirmwareVersionTrackerModal - 固件版本跟踪器
// 理由：设备固件工具栏调用openFirmwareVersionTrackerModal但从未定义
// 功能：追踪固件版本历史，记录每次升级时间/结果/操作人
// ============================================================
window.openFirmwareVersionTrackerModal = function() {
  var existing = document.getElementById('modal-firmware-tracker');
  if (existing) existing.remove();

  var history = [
    {room:'302', uuid:'DEV-LK02-302', fromVer:'v2.3.0', toVer:'v2.3.1', time:'2026-03-28 14:30', result:'成功', operator:'系统管理员'},
    {room:'304', uuid:'DEV-LK04-304', fromVer:'v2.2.9', toVer:'v2.3.1', time:'2026-03-27 10:15', result:'成功', operator:'王工'},
    {room:'303', uuid:'DEV-LK03-303', fromVer:'v2.2.8', toVer:'v2.3.0', time:'2026-03-25 16:45', result:'失败', operator:'系统管理员'},
    {room:'305', uuid:'DEV-LK05-305', fromVer:'v2.3.0', toVer:'v2.3.1', time:'2026-03-24 09:20', result:'成功', operator:'系统管理员'},
    {room:'201', uuid:'DEV-LK07-201', fromVer:'v2.2.5', toVer:'v2.3.0', time:'2026-03-20 11:00', result:'成功', operator:'王工'},
    {room:'202', uuid:'DEV-LK08-202', fromVer:'v2.1.5', toVer:'v2.2.5', time:'2026-03-18 15:30', result:'成功', operator:'系统管理员'}
  ];

  var rows = history.map(function(h) {
    var resultClass = h.result === '成功' ? 'green' : 'red';
    var resultBg = h.result === '成功' ? 'var(--green-bg)' : 'var(--red-bg)';
    return '<tr>' +
      '<td><span style="font-weight:700;">' + h.room + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + h.uuid + '</span></td>' +
      '<td><span style="font-size:12px;color:var(--text-muted);">' + h.fromVer + '</span></td>' +
      '<td style="text-align:center;"><span style="font-size:14px;">→</span></td>' +
      '<td><span style="font-weight:600;color:var(--green);">' + h.toVer + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + h.time + '</span></td>' +
      '<td><span class="tbadge ' + resultClass + '" style="background:' + resultBg + ';">' + h.result + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + h.operator + '</span></td></tr>';
  }).join('');

  var successRate = Math.round((history.filter(function(h){ return h.result === '成功'; }).length / history.length) * 100);

  var html = '<div class="hidden modal-overlay" id="modal-firmware-tracker" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-tracker\').remove()">' +
    '<div class="modal" style="width:820px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">📡</div>' +
    '<div style="font-size:15px;font-weight:700;">固件版本跟踪器</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">成功率 ' + successRate + '%</span>' +
    '<span style="padding:2px 8px;background:var(--blue-bg);color:var(--blue);border-radius:10px;font-size:11px;font-weight:600;">累计升级 ' + history.length + ' 次</span>' +
    '<button onclick="document.getElementById(\'modal-firmware-tracker\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
    '<input class="form-input" id="tracker-search" oninput="filterTrackerTable()" placeholder="🔍 搜索房间/UUID" style="width:180px;padding:7px 12px;font-size:12px;"/>' +
    '<select class="form-select" id="tracker-result-filter" onchange="filterTrackerTable()" style="padding:7px 10px;font-size:12px;width:120px;">' +
    '<option value="all">全部结果</option>' +
    '<option value="success">成功</option>' +
    '<option value="fail">失败</option></select>' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">共 <b id="tracker-count">' + history.length + '</b> 条记录</span></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>房间</th><th>设备UUID</th><th>原版本</th><th></th><th>升级版本</th><th>升级时间</th><th>结果</th><th>操作人</th></tr></thead>' +
    '<tbody id="tracker-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-tracker\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="exportFirmwareHistory()" style="background:var(--green);border-color:var(--green);">📤 导出版本历史</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.filterTrackerTable = function() {
  var query = document.getElementById('tracker-search') ? document.getElementById('tracker-search').value.trim().toLowerCase() : '';
  var result = document.getElementById('tracker-result-filter') ? document.getElementById('tracker-result-filter').value : 'all';
  var rows = document.querySelectorAll('#tracker-table-body tr');
  var visible = 0;
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var isSuccess = row.textContent.indexOf('成功') >= 0;
    var match = (!query || text.indexOf(query) >= 0) && (result === 'all' || (result === 'success' && isSuccess) || (result === 'fail' && !isSuccess));
    row.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  var countEl = document.getElementById('tracker-count');
  if (countEl) countEl.textContent = visible;
};

window.exportFirmwareHistory = function() {
  var csv = '\uFEFF房间,设备UUID,原版本,升级版本,升级时间,结果,操作人\n302,DEV-LK02-302,v2.3.0,v2.3.1,2026-03-28 14:30,成功,系统管理员\n304,DEV-LK04-304,v2.2.9,v2.3.1,2026-03-27 10:15,成功,王工';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '固件升级历史_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click(); showToast('📤 固件升级历史已导出', 'success');
};

// ============================================================
// 【修复4】openBatchDeviceDiagnosticModal - 多设备同时Ping弹窗
// 理由：设备管理工具栏"多设备同时Ping"按钮调用openBatchDeviceDiagnosticModal但从未定义
// 功能：对选中/全部设备同时发送Ping命令，汇总响应时间和丢包率
// ============================================================
window.openBatchDeviceDiagnosticModal = function() {
  var existing = document.getElementById('modal-batch-diagnostic');
  if (existing) existing.remove();

  var devices = [
    {room:'301', uuid:'DEV-LK01-301', ip:'192.168.1.101', status:'在线', rtt:45, loss:'0%'},
    {room:'302', uuid:'DEV-LK02-302', ip:'192.168.1.102', status:'在线', rtt:62, loss:'0%'},
    {room:'303', uuid:'DEV-LK03-303', ip:'192.168.1.103', status:'离线', rtt:'-', loss:'100%'},
    {room:'304', uuid:'DEV-LK04-304', ip:'192.168.1.104', status:'在线', rtt:38, loss:'0%'},
    {room:'305', uuid:'DEV-LK05-305', ip:'192.168.1.105', status:'在线', rtt:71, loss:'0%'},
    {room:'201', uuid:'DEV-LK07-201', ip:'192.168.1.201', status:'在线', rtt:55, loss:'0%'}
  ];

  var rows = devices.map(function(d) {
    var rttColor = d.rtt === '-' ? 'var(--red)' : d.rtt > 60 ? 'var(--orange)' : 'var(--green)';
    var rttBg = d.rtt === '-' ? 'var(--red-bg)' : d.rtt > 60 ? 'var(--orange-bg)' : 'var(--green-bg)';
    var lossColor = d.loss === '0%' ? 'var(--green)' : 'var(--red)';
    return '<tr>' +
      '<td><span style="font-weight:700;">' + d.room + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + d.uuid + '</span></td>' +
      '<td><span style="font-size:11px;font-family:monospace;">' + d.ip + '</span></td>' +
      '<td><span class="tbadge ' + (d.status === '在线' ? 'green' : 'red') + '">' + d.status + '</span></td>' +
      '<td><span style="padding:2px 8px;background:' + rttBg + ';color:' + rttColor + ';border-radius:4px;font-weight:600;font-size:12px;">' + (d.rtt === '-' ? '-' : d.rtt + 'ms') + '</span></td>' +
      '<td><span style="font-weight:600;color:' + lossColor + ';">' + d.loss + '</span></td>' +
      '<td><button class="action-btn small" onclick="pingSingleDevice(\'' + d.uuid + '\')">🔄 重新Ping</button></td></tr>';
  }).join('');

  var onlineCount = devices.filter(function(d){ return d.status === '在线'; }).length;
  var avgRtt = Math.round(devices.filter(function(d){ return d.rtt !== '-'; }).reduce(function(s, d){ return s + d.rtt; }, 0) / onlineCount);

  var html = '<div class="hidden modal-overlay" id="modal-batch-diagnostic" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-diagnostic\').remove()">' +
    '<div class="modal" style="width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">🌐</div>' +
    '<div style="font-size:15px;font-weight:700;">多设备同时Ping诊断</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">在线 ' + onlineCount + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--blue-bg);color:var(--blue);border-radius:10px;font-size:11px;font-weight:600;">平均延迟 ' + avgRtt + 'ms</span>' +
    '<button onclick="document.getElementById(\'modal-batch-diagnostic\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;">' +
    '<button class="action-btn primary" onclick="startBatchPing()" style="padding:8px 16px;background:var(--blue);color:white;border:none;">🚀 开始批量Ping</button>' +
    '<button class="action-btn" onclick="exportPingResults()" style="padding:8px 16px;background:var(--green-bg);color:var(--green);border-color:var(--green);">📤 导出结果</button>' +
    '<span id="ping-progress" style="margin-left:auto;font-size:12px;color:var(--text-muted);">最后检测：2分钟前 · 点击"开始批量Ping"刷新</span></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>房间</th><th>设备UUID</th><th>IP地址</th><th>状态</th><th>延迟</th><th>丢包率</th><th>操作</th></tr></thead>' +
    '<tbody id="ping-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-diagnostic\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.startBatchPing = function() {
  var btn = document.querySelector('#modal-batch-diagnostic .action-btn.primary');
  if (btn) { btn.textContent = '⏳ 检测中...'; btn.disabled = true; }
  showToast('🔄 正在对 6 台设备发送Ping命令...', 'info');
  setTimeout(function() {
    var btn = document.querySelector('#modal-batch-diagnostic .action-btn.primary');
    if (btn) { btn.textContent = '🚀 开始批量Ping'; btn.disabled = false; }
    var progress = document.getElementById('ping-progress');
    if (progress) progress.textContent = '最后检测：刚刚 · 全部在线';
    showToast('✅ 批量Ping完成：6台设备响应正常，平均延迟 54ms', 'success');
  }, 2000);
};

window.pingSingleDevice = function(uuid) {
  showToast('🔄 正在 Ping ' + uuid + '...', 'info');
  setTimeout(function() {
    showToast('✅ ' + uuid + ' 响应正常，延迟 48ms', 'success');
  }, 1000);
};

window.exportPingResults = function() {
  var csv = '\uFEFF房间,设备UUID,IP地址,状态,延迟,丢包率\n301,DEV-LK01-301,192.168.1.101,在线,45ms,0%\n302,DEV-LK02-302,192.168.1.102,在线,62ms,0%\n303,DEV-LK03-303,192.168.1.103,离线,-,100%';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'Ping诊断结果_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click(); showToast('📤 Ping结果已导出', 'success');
};

// ============================================================
// 【修复5】openBatchBatteryCheck - 低电量批量检测弹窗
// 理由：设备管理工具栏"电池检测"按钮调用openBatchBatteryCheck但从未定义
// 功能：对所有设备发起电池检测，汇总低电量设备清单，支持一键报修
// ============================================================
window.openBatchBatteryCheck = function() {
  var existing = document.getElementById('modal-batch-battery');
  if (existing) existing.remove();

  var devices = [
    {room:'301', uuid:'DEV-LK01-301', battery:88, status:'正常', lastCheck:'今天 10:32'},
    {room:'302', uuid:'DEV-LK02-302', battery:92, status:'正常', lastCheck:'今天 10:30'},
    {room:'303', uuid:'DEV-LK03-303', battery:0, status:'离线(无法检测)', lastCheck:'昨天 14:05'},
    {room:'304', uuid:'DEV-LK04-304', battery:78, status:'正常', lastCheck:'今天 10:28'},
    {room:'305', uuid:'DEV-LK05-305', battery:28, status:'⚠️ 偏低', lastCheck:'今天 09:50'},
    {room:'306', uuid:'DEV-LK06-306', battery:15, status:'🔴 严重不足', lastCheck:'今天 09:45'},
    {room:'201', uuid:'DEV-LK07-201', battery:85, status:'正常', lastCheck:'今天 10:20'},
    {room:'202', uuid:'DEV-LK08-202', battery:35, status:'⚠️ 偏低', lastCheck:'今天 10:15'},
    {room:'203', uuid:'DEV-LK09-203', battery:55, status:'正常', lastCheck:'今天 10:10'},
    {room:'204', uuid:'DEV-LK10-204', battery:20, status:'🔴 严重不足', lastCheck:'今天 09:55'}
  ];

  var lowBattery = devices.filter(function(d){ return d.battery < 50 && d.battery > 0; });
  var critical = devices.filter(function(d){ return d.battery > 0 && d.battery < 20; });
  var normal = devices.filter(function(d){ return d.battery >= 50; });
  var offline = devices.filter(function(d){ return d.battery === 0; });

  var rows = devices.map(function(d) {
    var battColor = d.battery === 0 ? 'var(--text-muted)' : d.battery < 20 ? 'var(--red)' : d.battery < 50 ? 'var(--orange)' : 'var(--green)';
    var battBg = d.battery === 0 ? 'var(--bg)' : d.battery < 20 ? 'var(--red-bg)' : d.battery < 50 ? 'var(--orange-bg)' : 'var(--green-bg)';
    var statusColor = d.status.indexOf('严重') >= 0 ? 'var(--red)' : d.status.indexOf('偏低') >= 0 ? 'var(--orange)' : 'var(--green)';
    var battBar = d.battery === 0 ? '<span style="color:var(--text-muted);">离线</span>'
      : '<div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;max-width:80px;"><div style="height:100%;width:' + d.battery + '%;background:' + battColor + ';border-radius:3px;"></div></div><span style="font-weight:700;color:' + battColor + ';font-size:12px;">' + d.battery + '%</span></div>';
    return '<tr>' +
      '<td><span style="font-weight:700;">' + d.room + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + d.uuid + '</span></td>' +
      '<td style="min-width:120px;">' + battBar + '</td>' +
      '<td><span style="font-size:11px;font-weight:600;color:' + statusColor + ';">' + d.status + '</span></td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + d.lastCheck + '</span></td>' +
      '<td>' + (d.battery > 0 && d.battery < 50 ? '<button class="action-btn small orange" onclick="createBatteryRepairOrder(\'' + d.room + '\',\'' + d.uuid + '\',' + d.battery + ')">🔋 报修</button>' : '<span style="font-size:11px;color:var(--text-muted);">—</span>') + '</td></tr>';
  }).join('');

  var html = '<div class="hidden modal-overlay" id="modal-batch-battery" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-battery\').remove()">' +
    '<div class="modal" style="width:780px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">🔋</div>' +
    '<div style="font-size:15px;font-weight:700;">电池批量检测</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">正常 ' + normal.length + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--orange-bg);color:var(--orange);border-radius:10px;font-size:11px;font-weight:600;">偏低 ' + lowBattery.length + ' 台</span>' +
    '<span style="padding:2px 8px;background:var(--red-bg);color:var(--red);border-radius:10px;font-size:11px;font-weight:600;">严重 ' + critical.length + ' 台</span>' +
    '<button onclick="document.getElementById(\'modal-batch-battery\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:16px 24px;border-bottom:1px solid var(--border);">' +
    '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--green);">' + normal.length + '</div><div style="font-size:11px;color:var(--green);">正常 (≥50%)</div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--orange);">' + lowBattery.length + '</div><div style="font-size:11px;color:var(--orange);">偏低 (20-49%)</div></div>' +
    '<div style="padding:12px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--red);">' + critical.length + '</div><div style="font-size:11px;color:var(--red);">严重 (<20%)</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--text-muted);">' + offline.length + '</div><div style="font-size:11px;color:var(--text-muted);">离线无法检测</div></div></div>' +
    '<div style="padding:12px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;">' +
    '<button class="action-btn primary" onclick="startBatteryCheckAll()" style="padding:7px 14px;background:var(--blue);color:white;border:none;">🔄 对全部在线设备检测电池</button>' +
    (lowBattery.length > 0 ? '<button class="action-btn" onclick="batchCreateBatteryOrders()" style="padding:7px 14px;background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">🔋 批量报修 (' + lowBattery.length + '台)</button>' : '') +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">点击设备行「报修」可单独创建换电池工单</span></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>房间</th><th>设备UUID</th><th>电量</th><th>状态</th><th>最后检测</th><th>操作</th></tr></thead>' +
    '<tbody id="battery-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-battery\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="exportBatteryReport()" style="background:var(--green);border-color:var(--green);">📤 导出电池报告</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.startBatteryCheckAll = function() {
  showToast('🔄 正在对全部在线设备发送电池检测命令...', 'info');
  setTimeout(function() {
    showToast('✅ 电池检测完成，8台在线设备全部响应', 'success');
  }, 2000);
};

window.createBatteryRepairOrder = function(room, uuid, battery) {
  showToast('🔋 已为 ' + room + ' (电量' + battery + '%) 创建换电池工单', 'success');
};

window.batchCreateBatteryOrders = function() {
  var confirmed = confirm('确定要批量为 ' + 4 + ' 台低电量设备创建换电池工单吗？');
  if (!confirmed) return;
  showToast('🔋 已批量创建 ' + 4 + ' 个换电池工单，请前往服务工单页面处理', 'success');
};

window.exportBatteryReport = function() {
  var csv = '\uFEFF房间,设备UUID,电量,状态,最后检测时间\n301,DEV-LK01-301,88%,正常,今天 10:32\n305,DEV-LK05-305,28%,偏低,今天 09:50\n306,DEV-LK06-306,15%,严重不足,今天 09:45\n202,DEV-LK08-202,35%,偏低,今天 10:15';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '电池检测报告_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click(); showToast('📤 电池报告已导出', 'success');
};
