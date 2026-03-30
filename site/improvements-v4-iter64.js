// ========== 【物联后台 v4 第64轮】5个功能性断裂修复 ==========
// 修复日期：2026-03-30
// 本轮修复：applyLogFilter | filterRoomRecords | editRoomRecord | deleteRoomRecord | openFirmwareAnalyzerModal

// ============================================================
// 【改进1】开锁记录筛选功能（applyLogFilter）
// 理由：开锁记录页面筛选按钮 onclick="applyLogFilter()" 未定义
// 业务逻辑：根据日期范围和开锁方式筛选记录，更新结果统计
// ============================================================
function applyLogFilter() {
  var dateStart = document.getElementById('log-date-start');
  var dateEnd = document.getElementById('log-date-end');
  var methodFilter = document.getElementById('log-method-filter');
  var start = dateStart ? dateStart.value : '';
  var end = dateEnd ? dateEnd.value : '';
  var method = methodFilter ? methodFilter.value : 'all';
  var tbody = document.getElementById('log-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr[data-type]');
  var visibleCount = 0;
  rows.forEach(function(row) {
    var rowDate = row.dataset.date || '';
    var rowType = row.dataset.type || '';
    var typeMatch = method === 'all' || rowType === method;
    var dateMatch = (!start || rowDate >= start) && (!end || rowDate <= end);
    var show = typeMatch && dateMatch;
    row.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });
  var resultEl = document.getElementById('log-filter-result');
  if (resultEl) resultEl.textContent = '共 ' + visibleCount + ' 条记录';
  showToast('筛选完成，共 ' + visibleCount + ' 条记录', 'info');
}

function resetLogFilter() {
  var dateStart = document.getElementById('log-date-start');
  var dateEnd = document.getElementById('log-date-end');
  var methodFilter = document.getElementById('log-method-filter');
  if (dateStart) dateStart.value = '';
  if (dateEnd) dateEnd.value = '';
  if (methodFilter) methodFilter.value = 'all';
  var tbody = document.getElementById('log-table-body');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(function(r) { r.style.display = ''; });
  }
  var resultEl = document.getElementById('log-filter-result');
  if (resultEl) resultEl.textContent = '共 5 条记录';
  showToast('筛选条件已重置', 'info');
}

// ============================================================
// 【改进2】办理记录Tab筛选（filterRoomRecords）
// 理由：办理记录页面Tab切换 onclick="filterRoomRecords()" 未定义
// 业务逻辑：根据记录类型（全部/入住/退房/换房）筛选显示记录
// ============================================================
function filterRoomRecords(type, el) {
  if (!el) return;
  // Update tab active state
  document.querySelectorAll('[id^="rr-tab-"]').forEach(function(t) {
    t.classList.remove('active');
    t.style.fontWeight = '';
    t.style.color = '';
    t.style.borderBottom = '';
  });
  el.classList.add('active');
  el.style.fontWeight = '600';
  el.style.color = 'var(--blue)';
  el.style.borderBottom = '2px solid var(--blue)';
  // Filter records
  var records = document.querySelectorAll('.checkin-record[data-rtype]');
  var count = 0;
  records.forEach(function(rec) {
    var rtype = rec.dataset.rtype || '';
    var show = type === 'all' || rtype === type;
    rec.style.display = show ? '' : 'none';
    if (show) count++;
  });
  showToast('已筛选：' + (type === 'all' ? '全部' : (type === 'in' ? '入住' : type === 'out' ? '退房' : '换房')) + '记录（' + count + '条）', 'info');
}

// ============================================================
// 【改进3】办理记录编辑（editRoomRecord）
// 理由：办理记录列表"编辑"按钮 onclick="editRoomRecord(id)" 未定义
// 业务逻辑：打开编辑弹窗，填充当前记录数据，支持修改
// ============================================================
function editRoomRecord(recordId) {
  var modal = document.getElementById('modal-room-record-form');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  var title = document.getElementById('rrf-title');
  if (title) title.textContent = '✏️ 编辑记录';
  // Find record data
  var recordMap = {
    'rec-001': {type:'in', name:'张三', room:'301', phone:'138****8888', method:'手机开锁'},
    'rec-002': {type:'in', name:'李四', room:'203', phone:'139****6666', method:'客户卡'},
    'rec-003': {type:'change', name:'钱七', room:'203→301', phone:'138****1234', method:'换房', changeReason:'房间噪音大'},
    'rec-004': {type:'out', name:'王五', room:'304', phone:'137****5555', method:'手机开锁'}
  };
  var rec = recordMap[recordId] || {type:'in', name:'', room:'', phone:'', method:'手机开锁'};
  var typeSelect = document.getElementById('rrf-type');
  if (typeSelect) typeSelect.value = rec.type;
  var nameInput = document.getElementById('rrf-name');
  if (nameInput) nameInput.value = rec.name;
  var phoneInput = document.getElementById('rrf-phone');
  if (phoneInput) phoneInput.value = rec.phone;
  var roomInput = document.getElementById('rrf-room');
  if (roomInput) roomInput.value = rec.room;
  var methodInput = document.getElementById('rrf-method');
  if (methodInput) methodInput.value = rec.method;
  var reasonInput = document.getElementById('rrf-change-reason');
  if (reasonInput) reasonInput.value = rec.changeReason || '';
  // Show/hide change reason field
  var changeRow = document.getElementById('rrf-change-row');
  if (changeRow) changeRow.style.display = rec.type === 'change' ? '' : 'none';
  window._editingRecordId = recordId;
  showToast('已加载记录数据，可进行修改', 'info');
}

// ============================================================
// 【改进4】办理记录删除（deleteRoomRecord）
// 理由：办理记录列表"删除"按钮 onclick="deleteRoomRecord(id)" 未定义
// 业务逻辑：二次确认后删除记录，更新列表，刷新统计
// ============================================================
function deleteRoomRecord(recordId) {
  var confirmMsg = '确定要删除这条办理记录吗？此操作不可撤销。';
  if (!confirm(confirmMsg)) return;
  // Find and hide the record element
  var recordEl = document.querySelector('[data-record-id="' + recordId + '"]');
  if (recordEl) {
    recordEl.style.transition = 'opacity 0.3s, transform 0.3s';
    recordEl.style.opacity = '0';
    recordEl.style.transform = 'translateX(20px)';
    setTimeout(function() {
      recordEl.remove();
      showToast('✅ 记录已删除', 'success');
      // Update counts
      updateRecordCounts();
    }, 300);
  } else {
    showToast('记录不存在或已删除', 'warning');
  }
}

function updateRecordCounts() {
  var records = document.querySelectorAll('.checkin-record[data-rtype]');
  var counts = {all: records.length, in: 0, out: 0, change: 0};
  records.forEach(function(r) {
    var t = r.dataset.rtype || '';
    if (t === 'in') counts.in++;
    else if (t === 'out') counts.out++;
    else if (t === 'change') counts.change++;
  });
  ['all','in','out','change'].forEach(function(type) {
    var el = document.getElementById('rr-count-' + type);
    if (el) el.textContent = counts[type];
  });
}

// ============================================================
// 【改进5】固件版本分析器弹窗（openFirmwareAnalyzerModal）
// 理由：设备管理页面"版本分析器"按钮调用但函数未定义
// 业务逻辑：展示所有设备固件版本分布统计，支持版本对比
// ============================================================
function openFirmwareAnalyzerModal() {
  var existing = document.getElementById('modal-firmware-analyzer');
  if (existing) existing.remove();
  var devices = [
    {uuid:'DEV-LK01-301', room:'301', firmware:'v2.3.1', battery:88, lastSync:'今天 10:32', status:'在线'},
    {uuid:'DEV-LK02-302', room:'302', firmware:'v2.3.1', battery:92, lastSync:'今天 10:30', status:'在线'},
    {uuid:'DEV-LK03-303', room:'303', firmware:'v2.2.8', battery:0, lastSync:'昨天 14:05', status:'离线'},
    {uuid:'DEV-LK04-304', room:'304', firmware:'v2.3.1', battery:78, lastSync:'今天 10:28', status:'在线'},
    {uuid:'DEV-LK05-305', room:'305', firmware:'v2.3.0', battery:28, lastSync:'今天 09:50', status:'在线'},
    {uuid:'DEV-LK06-306', room:'306', firmware:'v2.3.0', battery:15, lastSync:'今天 09:45', status:'在线'},
    {uuid:'DEV-LK07-201', room:'201', firmware:'v2.3.1', battery:85, lastSync:'今天 10:20', status:'在线'},
    {uuid:'DEV-LK08-202', room:'202', firmware:'v2.2.8', battery:90, lastSync:'今天 10:15', status:'在线'},
    {uuid:'DEV-LK09-203', room:'203', firmware:'v2.3.1', battery:55, lastSync:'今天 10:10', status:'在线'},
    {uuid:'DEV-LK10-204', room:'204', firmware:'v2.3.0', battery:35, lastSync:'今天 09:55', status:'在线'},
    {uuid:'DEV-LK11-205', room:'205', firmware:'v2.3.1', battery:82, lastSync:'今天 10:25', status:'在线'},
    {uuid:'DEV-LK12-206', room:'206', firmware:'v2.2.8', battery:0, lastSync:'昨天 22:30', status:'离线'},
    {uuid:'DEV-LK13-101', room:'101', firmware:'v2.3.1', battery:76, lastSync:'今天 10:18', status:'在线'},
    {uuid:'DEV-LK14-102', room:'102', firmware:'v2.3.1', battery:65, lastSync:'今天 10:12', status:'在线'},
    {uuid:'DEV-LK15-103', room:'103', firmware:'v2.3.0', battery:48, lastSync:'今天 10:05', status:'在线'},
    {uuid:'DEV-LK16-104', room:'104', firmware:'v2.3.1', battery:20, lastSync:'今天 09:40', status:'在线'}
  ];
  var versionStats = {};
  var latest = 'v2.3.1';
  devices.forEach(function(d) {
    if (!versionStats[d.firmware]) versionStats[d.firmware] = {count: 0, devices: [], outdated: d.firmware !== latest};
    versionStats[d.firmware].count++;
    versionStats[d.firmware].devices.push(d.room);
  });
  var statsArr = Object.keys(versionStats).map(function(v) {
    return {version: v, count: versionStats[v].count, devices: versionStats[v].devices, outdated: versionStats[v].outdated};
  });
  statsArr.sort(function(a, b) { return b.count - a.count; });
  var total = devices.length;
  var latestCount = versionStats[latest] ? versionStats[latest].count : 0;
  var outdatedCount = total - latestCount;
  var colorMap = {'v2.3.1':'var(--green)', 'v2.3.0':'var(--orange)', 'v2.2.8':'var(--red)'};
  var bgMap = {'v2.3.1':'var(--green-bg)', 'v2.3.0':'var(--orange-bg)', 'v2.2.8':'var(--red-bg)'};
  var statsHtml = statsArr.map(function(s) {
    var color = colorMap[s.version] || 'var(--text)';
    var bg = bgMap[s.version] || 'var(--bg)';
    var pct = Math.round(s.count / total * 100);
    var outdatedTag = s.outdated ? '<span style="padding:1px 6px;background:var(--red-bg);color:var(--red);border-radius:8px;font-size:10px;font-weight:600;margin-left:6px;">需升级</span>' : '<span style="padding:1px 6px;background:var(--green-bg);color:var(--green);border-radius:8px;font-size:10px;font-weight:600;margin-left:6px;">最新</span>';
    return '<div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
      '<div style="width:80px;font-weight:700;font-size:13px;color:' + color + ';">' + s.version + '</div>' +
      '<div style="flex:1;height:20px;background:' + bg + ';border-radius:6px;overflow:hidden;">' +
      '<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:6px;display:flex;align-items:center;justify-content:center;">' +
      '<span style="font-size:11px;color:white;font-weight:600;">' + s.count + '台</span></div></div>' +
      '<div style="width:50px;text-align:right;font-size:12px;color:var(--text-muted);">' + pct + '%</div>' +
      '<div style="min-width:140px;font-size:11px;color:var(--text-muted);">' + s.devices.slice(0,3).join(', ') + (s.devices.length > 3 ? '...' : '') + '</div>' +
      outdatedTag + '</div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-firmware-analyzer" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-analyzer\').remove()">' +
    '<div class="modal" style="width:700px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:15px;font-weight:700;">📡 固件版本分析器</div>' +
    '<span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;font-weight:600;">最新 v2.3.1</span></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + total + '</div><div style="font-size:11px;color:var(--blue);">总设备</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + latestCount + '</div><div style="font-size:11px;color:var(--green);">最新版本</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + outdatedCount + '</div><div style="font-size:11px;color:var(--orange);">待升级</div></div>' +
    '<div style="padding:14px;background:var(--purple-bg);border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--purple);">' + Object.keys(versionStats).length + '</div><div style="font-size:11px;color:var(--purple);">版本数量</div></div></div>' +
    '<div style="margin-bottom:16px;"><div style="font-size:13px;font-weight:700;margin-bottom:8px;">📊 各版本设备分布</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' + statsHtml + '</div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:12px;">⚠️ v2.2.8 及以下版本存在安全漏洞，建议尽快升级至 v2.3.1</div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-firmware-analyzer\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="openBatchFirmwareUpgradeModal();document.getElementById(\'modal-firmware-analyzer\').remove();" style="background:var(--blue);border-color:var(--blue);">🚀 批量升级</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}
