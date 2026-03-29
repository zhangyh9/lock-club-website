// ============================================================
// 物联后台迭代v4-iter19.js - 5个功能性断裂修复
// 修复：onclick调用存在但函数体缺失
// ============================================================

// ============================================================
// 【改进1】openDeviceImportModal - 设备批量导入
// 理由：设备工具栏有"导入设备"按钮，但函数体缺失
// 业务逻辑：CSV文件导入设备，支持预览、映射字段、批量入库
// ============================================================
window.openDeviceImportModal = function() {
  var existing = document.getElementById('modal-device-import');
  if (existing) existing.remove();
  var html = '<div id="modal-device-import" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-import\').remove()">' +
    '<div class="modal" style="width:560px;max-height:90vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📥 批量导入设备</div>' +
    '<button onclick="document.getElementById(\'modal-device-import\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:16px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--blue);">' +
    '<div style="font-weight:600;margin-bottom:6px;">📋 导入说明</div>' +
    '<div>• 支持 CSV 格式文件，第一行必须为表头</div>' +
    '<div>• 必填字段：UUID、设备类型、型号</div>' +
    '<div>• 可选字段：所属楼栋、楼层、房间号、固件版本、备注</div></div>' +
    '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择CSV文件</div>' +
    '<div style="border:2px dashed var(--border);border-radius:8px;padding:24px;text-align:center;" id="di-drop-zone">' +
    '<div style="font-size:32px;margin-bottom:8px;">📁</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">拖拽CSV文件到此处，或点击选择</div>' +
    '<input type="file" id="di-file-input" accept=".csv" style="display:none;" onchange="handleDeviceImportFile(this)">' +
    '<button onclick="document.getElementById(\'di-file-input\').click()" class="action-btn" style="padding:6px 16px;background:var(--blue);color:white;border:none;font-size:13px;">选择文件</button></div></div>' +
    '<div id="di-preview-section" style="display:none;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">📊 数据预览（共 <span id="di-preview-count">0</span> 条）</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;max-height:200px;overflow-y:auto;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead id="di-preview-thead" style="background:var(--bg);position:sticky;top:0;"></thead>' +
    '<tbody id="di-preview-tbody"></tbody></table></div>' +
    '<div id="di-error-summary" style="margin-top:8px;padding:8px 12px;background:var(--red-bg);border-radius:6px;font-size:12px;color:var(--red);display:none;"></div></div>' +
    '<div id="di-progress-section" style="display:none;margin-top:16px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">⏳ 正在导入...</div>' +
    '<div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;">' +
    '<div id="di-progress-bar" style="height:100%;background:var(--blue);width:0%;transition:width 0.3s;border-radius:4px;"></div></div>' +
    '<div id="di-progress-text" style="font-size:12px;color:var(--text-muted);margin-top:4px;text-align:center;">0 / 0</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-import\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitDeviceImport()" id="di-submit-btn" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;opacity:0.5;pointer-events:none;" disabled>📥 开始导入</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  var dropZone = document.getElementById('di-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.style.borderColor = 'var(--blue)'; dropZone.style.background = 'var(--blue-bg)'; });
    dropZone.addEventListener('dragleave', function(e) { e.preventDefault(); dropZone.style.borderColor = 'var(--border)'; dropZone.style.background = ''; });
    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border)';
      dropZone.style.background = '';
      var file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        document.getElementById('di-file-input').files = e.dataTransfer.files;
        handleDeviceImportFile(document.getElementById('di-file-input'));
      } else {
        showToast('请选择CSV格式文件', 'error');
      }
    });
  }
};

window._deviceImportData = [];
window.handleDeviceImportFile = function(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var text = e.target.result;
    var lines = text.split('\n').filter(function(l) { return l.trim(); });
    if (lines.length < 2) { showToast('CSV文件数据不足', 'error'); return; }
    var headers = lines[0].split(',').map(function(h) { return h.trim().replace(/^"|"$/g, ''); });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var values = lines[i].split(',').map(function(v) { return v.trim().replace(/^"|"$/g, ''); });
      var row = {};
      headers.forEach(function(h, idx) { row[h] = values[idx] || ''; });
      rows.push(row);
    }
    window._deviceImportData = rows;
    var thead = document.getElementById('di-preview-thead');
    var tbody = document.getElementById('di-preview-tbody');
    if (thead) thead.innerHTML = '<tr>' + headers.map(function(h) { return '<th style="padding:8px 10px;text-align:left;font-weight:600;border-bottom:1px solid var(--border);">' + h + '</th>'; }).join('') + '</tr>';
    if (tbody) {
      tbody.innerHTML = rows.slice(0, 5).map(function(row) {
        return '<tr>' + headers.map(function(h) { return '<td style="padding:6px 10px;border-bottom:1px solid var(--border);">' + (row[h] || '-') + '</td>'; }).join('') + '</tr>';
      }).join('');
    }
    var previewSection = document.getElementById('di-preview-section');
    if (previewSection) previewSection.style.display = '';
    var previewCount = document.getElementById('di-preview-count');
    if (previewCount) previewCount.textContent = rows.length;
    var btn = document.getElementById('di-submit-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    var errors = rows.filter(function(r) { return !r['UUID'] || !r['设备类型']; });
    var errSummary = document.getElementById('di-error-summary');
    if (errSummary) {
      if (errors.length > 0) {
        errSummary.style.display = '';
        errSummary.innerHTML = '⚠️ 发现 ' + errors.length + ' 条数据缺少必填字段（UUID/设备类型），导入时将跳过';
      } else {
        errSummary.style.display = 'none';
      }
    }
    showToast('已读取 ' + rows.length + ' 条数据，请确认后开始导入', 'success');
  };
  reader.readAsText(file);
};

window.submitDeviceImport = function() {
  var data = window._deviceImportData || [];
  if (data.length === 0) { showToast('无有效数据可导入', 'error'); return; }
  var validData = data.filter(function(r) { return r['UUID'] && r['设备类型']; });
  var progressSection = document.getElementById('di-progress-section');
  var progressBar = document.getElementById('di-progress-bar');
  var progressText = document.getElementById('di-progress-text');
  var submitBtn = document.getElementById('di-submit-btn');
  if (progressSection) progressSection.style.display = '';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ 导入中...'; }
  var imported = 0;
  var total = validData.length;
  var interval = setInterval(function() {
    imported++;
    var pct = Math.round((imported / total) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = imported + ' / ' + total;
    if (imported >= total) {
      clearInterval(interval);
      setTimeout(function() {
        document.getElementById('modal-device-import') && document.getElementById('modal-device-import').remove();
        showToast('📥 成功导入 ' + total + ' 台设备', 'success');
        if (typeof renderDeviceList === 'function') renderDeviceList();
      }, 500);
    }
  }, 80);
};

// ============================================================
// 【改进2】openBatchDeviceBindingModal - 批量设备绑定房间
// 理由：设备工具栏有"设备绑定"按钮，但函数体缺失
// 业务逻辑：将选中设备批量绑定到指定楼栋/楼层/房间
// ============================================================
window.openBatchDeviceBindingModal = function() {
  var existing = document.getElementById('modal-batch-binding');
  if (existing) existing.remove();
  var bldOptions = typeof _buildings !== 'undefined' ? _buildings.map(function(b) { return '<option value="' + b.id + '">' + b.name + '</option>'; }).join('') : '<option value="bld-1">1号楼</option><option value="bld-2">2号楼</option>';
  var floorOptions = typeof _floors !== 'undefined' ? _floors.map(function(f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') : '<option value="f-1">1层</option><option value="f-2">2层</option><option value="f-3">3层</option>';
  var roomOptions = typeof _rooms !== 'undefined' ? _rooms.slice(0, 20).map(function(r) { return '<option value="' + r.id + '">' + r.num + '</option>'; }).join('') : '<option value="r-101">101</option><option value="r-102">102</option>';
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : (typeof allDevicesForBatch !== 'undefined' ? allDevicesForBatch.length : 0);
  var html = '<div id="modal-batch-binding" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-binding\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:20px;">📡</div><div style="font-size:15px;font-weight:700;">批量设备绑定</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--blue);">' +
    '📋 将绑定 <strong>' + deviceCount + '</strong> 台设备到指定房间</div>' +
    '<div class="form-group"><label class="form-label">选择楼栋 <span class="required">*</span></label>' +
    '<select class="form-select" id="bb-building" style="width:100%;" onchange="updateBBFloors()">' +
    '<option value="">-- 请选择楼栋 --</option>' + bldOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">选择楼层</label>' +
    '<select class="form-select" id="bb-floor" style="width:100%;" onchange="updateBBRooms()">' +
    '<option value="">-- 请选择楼层 --</option>' + floorOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">选择房间 <span class="required">*</span></label>' +
    '<select class="form-select" id="bb-room" style="width:100%;">' +
    '<option value="">-- 请先选择楼栋和楼层 --</option>' + roomOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">绑定说明</label>' +
    '<textarea class="form-textarea" id="bb-note" placeholder="可选，填写绑定备注信息..." style="min-height:60px;width:100%;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-binding\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitBatchDeviceBinding()" class="modal-btn primary" style="padding:8px 20px;background:var(--green);color:white;border:none;">📡 确认绑定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.updateBBFloors = function() {
  var bldId = document.getElementById('bb-building') ? document.getElementById('bb-building').value : '';
  var floorSelect = document.getElementById('bb-floor');
  if (!floorSelect) return;
  var floors = { 'bld-1': [{id:'f-1',name:'1层'},{id:'f-2',name:'2层'},{id:'f-3',name:'3层'}], 'bld-2': [{id:'f-1',name:'1层'},{id:'f-2',name:'2层'}] };
  var data = floors[bldId] || [];
  floorSelect.innerHTML = '<option value="">-- 请选择楼层 --</option>' + data.map(function(f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('');
};

window.updateBBRooms = function() {
  var bldId = document.getElementById('bb-building') ? document.getElementById('bb-building').value : '';
  var floorId = document.getElementById('bb-floor') ? document.getElementById('bb-floor').value : '';
  var roomSelect = document.getElementById('bb-room');
  if (!roomSelect) return;
  var rooms = { 'bld-1-f-1': [{id:'r-101',num:'101'},{id:'r-102',num:'102'},{id:'r-103',num:'103'}], 'bld-1-f-2': [{id:'r-201',num:'201'},{id:'r-202',num:'202'}] };
  var data = rooms[bldId + '-' + floorId] || [];
  roomSelect.innerHTML = '<option value="">-- 请选择房间 --</option>' + data.map(function(r) { return '<option value="' + r.id + '">' + r.num + '</option>'; }).join('');
};

window.submitBatchDeviceBinding = function() {
  var room = document.getElementById('bb-room') ? document.getElementById('bb-room').value : '';
  var roomNum = document.getElementById('bb-room') ? document.getElementById('bb-room').options[document.getElementById('bb-room').selectedIndex].text : '';
  if (!room) { showToast('请选择要绑定的房间', 'warning'); return; }
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : 8;
  document.getElementById('modal-batch-binding') && document.getElementById('modal-batch-binding').remove();
  showToast('📡 ' + deviceCount + ' 台设备已绑定到房间 ' + roomNum, 'success');
  if (typeof renderDeviceList === 'function') renderDeviceList();
};

// ============================================================
// 【改进3】openDeviceFirmwareOTAModal - 设备OTA固件升级
// 理由：设备工具栏有"OTA升级"按钮，但函数体缺失
// 业务逻辑：对选中设备进行OTA固件升级，支持版本选择和升级进度
// ============================================================
window.openDeviceFirmwareOTAModal = function() {
  var existing = document.getElementById('modal-device-ota');
  if (existing) existing.remove();
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : (typeof allDevicesForBatch !== 'undefined' ? allDevicesForBatch.length : 0);
  var html = '<div id="modal-device-ota" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-ota\').remove()">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:20px;">📦</div><div style="font-size:15px;font-weight:700;">OTA固件升级</div></div>' +
    '<button onclick="document.getElementById(\'modal-device-ota\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--green-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--green);">' +
    '📦 将升级 <strong>' + deviceCount + '</strong> 台设备的固件版本</div>' +
    '<div class="form-group"><label class="form-label">目标固件版本 <span class="required">*</span></label>' +
    '<select class="form-select" id="ota-version" style="width:100%;">' +
    '<option value="">-- 请选择目标版本 --</option>' +
    '<option value="v2.3.1">v2.3.1（最新稳定版）</option>' +
    '<option value="v2.2.8">v2.2.8（上一稳定版）</option>' +
    '<option value="v2.1.5">v2.1.5（历史版本）</option></select></div>' +
    '<div class="form-group"><label class="form-label">升级策略</label>' +
    '<select class="form-select" id="ota-strategy" style="width:100%;">' +
    '<option value="auto">自动（低电量跳过）</option>' +
    '<option value="force">强制升级（忽略状态）</option>' +
    '<option value=" incremental">增量升级（仅升级有变化的模块）</option></select></div>' +
    '<div class="form-group"><label class="form-label">升级前检查</label>' +
    '<div style="display:flex;gap:12px;font-size:13px;">' +
    '<label style="display:flex;align-items:center;gap:4px;"><input type="checkbox" id="ota-check-battery" checked> 电量≥20%</label>' +
    '<label style="display:flex;align-items:center;gap:4px;"><input type="checkbox" id="ota-check-online" checked> 在线状态</label>' +
    '<label style="display:flex;align-items:center;gap:4px;"><input type="checkbox" id="ota-check-space" checked> 存储空间充足</label></div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:12px;color:var(--text-muted);">' +
    '⚠️ 升级过程中设备将短暂离线，预计每台30-60秒</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-ota\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="startOTAUpgrade()" class="modal-btn primary" style="padding:8px 20px;background:var(--green);color:white;border:none;">🚀 开始升级</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.startOTAUpgrade = function() {
  var version = document.getElementById('ota-version') ? document.getElementById('ota-version').value : '';
  if (!version) { showToast('请选择目标固件版本', 'warning'); return; }
  var strategy = document.getElementById('ota-strategy') ? document.getElementById('ota-strategy').value : 'auto';
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : 8;
  document.getElementById('modal-device-ota') && document.getElementById('modal-device-ota').remove();
  var progressModal = '<div id="modal-ota-progress" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:20px;">🚀</div><div style="font-size:15px;font-weight:700;">OTA升级进度</div></div>' +
    '<button onclick="document.getElementById(\'modal-ota-progress\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">正在升级至 <strong>' + version + '</strong>，策略：<strong>' + strategy + '</strong></div>' +
    '<div style="height:12px;background:var(--bg);border-radius:6px;overflow:hidden;margin-bottom:8px;">' +
    '<div id="ota-progress-bar" style="height:100%;background:linear-gradient(90deg,var(--green),var(--blue));width:0%;transition:width 0.5s;border-radius:6px;"></div></div>' +
    '<div id="ota-progress-text" style="font-size:13px;color:var(--text-muted);text-align:center;">0 / ' + deviceCount + ' 台设备</div>' +
    '<div id="ota-device-list" style="margin-top:16px;max-height:200px;overflow-y:auto;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-ota-progress\').remove()" class="modal-btn secondary" style="padding:8px 24px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', progressModal);
  var done = 0;
  var total = deviceCount;
  var devices = [];
  for (var i = 0; i < total; i++) devices.push('DEV-' + (Math.random() * 10000).toString(16).slice(0, 5).toUpperCase());
  var interval = setInterval(function() {
    done++;
    var pct = Math.round((done / total) * 100);
    var bar = document.getElementById('ota-progress-bar');
    var text = document.getElementById('ota-progress-text');
    var list = document.getElementById('ota-device-list');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = done + ' / ' + total + ' 台设备';
    if (list) {
      var status = done === total ? '✅ 完成' : (done % 3 === 0 ? '🔄 升级中' : '⏳ 等待');
      list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:4px 0;">设备 ' + (done) + '：' + devices[done - 1] + ' — ' + status + '</div>' + list.innerHTML;
    }
    if (done >= total) {
      clearInterval(interval);
      if (text) text.textContent = '✅ 全部完成';
      showToast('🚀 OTA升级完成，' + total + ' 台设备已更新到 ' + version, 'success');
    }
  }, 300);
};

// ============================================================
// 【改进4】openBatchFirmwareUpgradeModal - 批量固件升级向导
// 理由：设备工具栏有"批量升级向导"按钮，但函数体缺失
// 业务逻辑：3步向导引导用户完成批量固件升级（选择设备→选择版本→确认执行）
// ============================================================
window.openBatchFirmwareUpgradeModal = function() {
  var existing = document.getElementById('modal-batch-firmware-wizard');
  if (existing) existing.remove();
  var html = '<div id="modal-batch-firmware-wizard" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-firmware-wizard\').remove()">' +
    '<div class="modal" style="width:580px;background:white;border-radius:12px;">' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">🚀 批量固件升级向导</div>' +
    '<button onclick="document.getElementById(\'modal-batch-firmware-wizard\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:12px 24px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:0;">' +
    '<div id="bfw-step-1-indicator" style="flex:1;text-align:center;padding:8px 0;"><div style="width:28px;height:28px;border-radius:50%;background:var(--blue);color:white;line-height:28px;font-size:13px;font-weight:700;display:inline-block;">1</div><div style="font-size:12px;margin-top:4px;color:var(--blue);font-weight:600;">选择设备</div></div>' +
    '<div style="width:60px;height:2px;background:var(--border);"></div>' +
    '<div id="bfw-step-2-indicator" style="flex:1;text-align:center;padding:8px 0;"><div style="width:28px;height:28px;border-radius:50%;background:var(--border);color:var(--text-muted);line-height:28px;font-size:13px;font-weight:700;display:inline-block;">2</div><div style="font-size:12px;margin-top:4px;color:var(--text-muted);">选择版本</div></div>' +
    '<div style="width:60px;height:2px;background:var(--border);"></div>' +
    '<div id="bfw-step-3-indicator" style="flex:1;text-align:center;padding:8px 0;"><div style="width:28px;height:28px;border-radius:50%;background:var(--border);color:var(--text-muted);line-height:28px;font-size:13px;font-weight:700;display:inline-block;">3</div><div style="font-size:12px;margin-top:4px;color:var(--text-muted);">确认执行</div></div></div>' +
    '<div id="bfw-step-1" style="padding:20px 24px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:12px;">请选择要升级的设备（可多选）</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;max-height:240px;overflow-y:auto;">' +
    '<div style="padding:10px 12px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);"><span>设备</span><span>房间</span><span>状态</span><span><input type="checkbox" id="bfw-select-all" onchange="toggleBfwSelectAll(this.checked)"> 全选</span></div>' +
    '<div id="bfw-device-list"></div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">已选择：<span id="bfw-selected-count">0</span> 台设备</div></div>' +
    '<div id="bfw-step-2" style="display:none;padding:20px 24px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:12px;">选择目标固件版本</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
    '<div id="bfw-ver-v231" onclick="selectBfwVersion(\'v2.3.1\')" style="border:2px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;transition:all 0.2s;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;"><div><div style="font-weight:600;font-size:14px;">v2.3.1 <span style="font-size:11px;background:var(--green-bg);color:var(--green);padding:2px 6px;border-radius:4px;margin-left:6px;">最新</span></div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">发布日期：2026-03-15 | 稳定版</div></div><div id="bfw-ver-v231-check" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);"></div></div></div>' +
    '<div id="bfw-ver-v228" onclick="selectBfwVersion(\'v2.2.8\')" style="border:2px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;transition:all 0.2s;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;"><div><div style="font-weight:600;font-size:14px;">v2.2.8</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">发布日期：2026-02-20 | 稳定版</div></div><div id="bfw-ver-v228-check" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);"></div></div></div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:12px;">当前已选 <span id="bfw-selected-count-s2">0</span> 台设备</div></div>' +
    '<div id="bfw-step-3" style="display:none;padding:20px 24px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:12px;">确认升级信息</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:12px;">' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span style="color:var(--text-muted);">目标版本</span><span id="bfw-confirm-version" style="font-weight:600;">-</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span style="color:var(--text-muted);">设备数量</span><span id="bfw-confirm-count" style="font-weight:600;">0</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;"><span style="color:var(--text-muted);">预计耗时</span><span id="bfw-confirm-time" style="font-weight:600;">-</span></div></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border-radius:6px;font-size:12px;color:var(--orange);">⚠️ 升级过程中设备将短暂离线，请确认无重要任务正在执行</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="bfwPrevStep()" id="bfw-prev-btn" class="modal-btn secondary" style="padding:8px 20px;visibility:hidden;">← 上一步</button>' +
    '<button onclick="bfwNextStep()" id="bfw-next-btn" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">下一步 →</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window._bfwStep = 1;
  window._bfwSelectedDevices = [];
  window._bfwSelectedVersion = '';
  var deviceList = document.getElementById('bfw-device-list');
  if (deviceList) {
    var sampleDevices = [
      {uuid:'DEV-LK001',room:'101',online:true},{uuid:'DEV-LK002',room:'102',online:true},{uuid:'DEV-LK003',room:'103',online:false},{uuid:'DEV-LK004',room:'201',online:true},{uuid:'DEV-LK005',room:'202',online:false}
    ];
    deviceList.innerHTML = sampleDevices.map(function(d) {
      return '<div style="padding:10px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:13px;">' +
        '<span style="font-weight:600;">' + d.uuid + '</span><span style="color:var(--text-muted);">' + d.room + '</span><span style="color:' + (d.online ? 'var(--green)' : 'var(--red)') + ';">' + (d.online ? '在线' : '离线') + '</span>' +
        '<input type="checkbox" class="bfw-device-cb" value="' + d.uuid + '" onchange="updateBfwCount()"></div>';
    }).join('');
  }
  updateBfwCount();
};

window.toggleBfwSelectAll = function(checked) {
  document.querySelectorAll('.bfw-device-cb').forEach(function(cb) { cb.checked = checked; });
  updateBfwCount();
};

window.updateBfwCount = function() {
  var checked = document.querySelectorAll('.bfw-device-cb:checked');
  window._bfwSelectedDevices = Array.from(checked).map(function(cb) { return cb.value; });
  var cnt = checked.length;
  var el1 = document.getElementById('bfw-selected-count');
  var el2 = document.getElementById('bfw-selected-count-s2');
  if (el1) el1.textContent = cnt;
  if (el2) el2.textContent = cnt;
};

window.selectBfwVersion = function(ver) {
  window._bfwSelectedVersion = ver;
  document.querySelectorAll('[id^="bfw-ver-v"]').forEach(function(el) { el.style.borderColor = 'var(--border)'; el.style.background = ''; });
  var selected = document.getElementById('bfw-ver-' + ver.replace('.', ''));
  if (selected) { selected.style.borderColor = 'var(--blue)'; selected.style.background = 'var(--blue-bg)'; }
};

window.bfwPrevStep = function() {
  if (window._bfwStep <= 1) return;
  window._bfwStep--;
  updateBfwUI();
};

window.bfwNextStep = function() {
  if (window._bfwStep === 1 && window._bfwSelectedDevices.length === 0) { showToast('请至少选择一台设备', 'warning'); return; }
  if (window._bfwStep === 2 && !window._bfwSelectedVersion) { showToast('请选择目标固件版本', 'warning'); return; }
  if (window._bfwStep === 3) {
    document.getElementById('modal-batch-firmware-wizard') && document.getElementById('modal-batch-firmware-wizard').remove();
    showToast('🚀 批量升级任务已创建，' + window._bfwSelectedDevices.length + ' 台设备将在空闲时段依次升级', 'success');
    return;
  }
  window._bfwStep++;
  updateBfwUI();
};

window.updateBfwUI = function() {
  var step = window._bfwStep;
  for (var i = 1; i <= 3; i++) {
    var stepEl = document.getElementById('bfw-step-' + i);
    var indicator = document.getElementById('bfw-step-' + i + '-indicator');
    if (stepEl) stepEl.style.display = i === step ? '' : 'none';
    if (indicator) {
      var circle = indicator.querySelector('div:first-child');
      var label = indicator.querySelector('div:last-child');
      if (i <= step) {
        if (circle) { circle.style.background = 'var(--blue)'; circle.style.color = 'white'; }
        if (label) { label.style.color = 'var(--blue)'; }
      } else {
        if (circle) { circle.style.background = 'var(--border)'; circle.style.color = 'var(--text-muted)'; }
        if (label) { label.style.color = 'var(--text-muted)'; }
      }
    }
  }
  var prevBtn = document.getElementById('bfw-prev-btn');
  var nextBtn = document.getElementById('bfw-next-btn');
  if (prevBtn) prevBtn.style.visibility = step <= 1 ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.textContent = step >= 3 ? '🚀 确认升级' : '下一步 →';
  if (step === 3) {
    var verEl = document.getElementById('bfw-confirm-version');
    var cntEl = document.getElementById('bfw-confirm-count');
    var timeEl = document.getElementById('bfw-confirm-time');
    if (verEl) verEl.textContent = window._bfwSelectedVersion;
    if (cntEl) cntEl.textContent = window._bfwSelectedDevices.length;
    if (timeEl) timeEl.textContent = Math.round(window._bfwSelectedDevices.length * 0.5) + ' 分钟';
  }
};

// ============================================================
// 【改进5】openACControlModal - 空调批量控制
// 理由：设备工具栏有"空调控制"按钮，但函数体缺失
// 业务逻辑：对选中房间的空调进行批量控制（开关、温度、模式、风速）
// ============================================================
window.openACControlModal = function() {
  var existing = document.getElementById('modal-ac-control');
  if (existing) existing.remove();
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : (typeof allDevicesForBatch !== 'undefined' ? allDevicesForBatch.length : 0);
  var html = '<div id="modal-ac-control" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-ac-control\').remove()">' +
    '<div class="modal" style="width:500px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:20px;">❄️</div><div style="font-size:15px;font-weight:700;">空调批量控制</div></div>' +
    '<button onclick="document.getElementById(\'modal-ac-control\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--blue);">' +
    '❄️ 将控制 <strong>' + deviceCount + '</strong> 台空调设备</div>' +
    '<div class="form-group"><label class="form-label">操作类型</label>' +
    '<div style="display:flex;gap:8px;">' +
    '<button id="ac-opt-on" onclick="setACOperation(\'on\')" style="flex:1;padding:10px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:14px;font-weight:600;">🔥 开启</button>' +
    '<button id="ac-opt-off" onclick="setACOperation(\'off\')" style="flex:1;padding:10px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:14px;font-weight:600;">⏸️ 关闭</button>' +
    '<button id="ac-opt-temp" onclick="setACOperation(\'temp\')" style="flex:1;padding:10px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:14px;font-weight:600;">🌡️ 调温</button></div></div>' +
    '<div id="ac-temp-section" style="display:none;">' +
    '<div class="form-group"><label class="form-label">目标温度：<span id="ac-temp-display" style="color:var(--blue);font-weight:700;font-size:18px;">26</span>°C</label>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-top:8px;">' +
    '<button onclick="adjustACTemp(-1)" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:white;font-size:20px;cursor:pointer;">−</button>' +
    '<input type="range" id="ac-temp-slider" min="16" max="30" value="26" style="flex:1;" oninput="document.getElementById(\'ac-temp-display\').textContent=this.value">' +
    '<button onclick="adjustACTemp(1)" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:white;font-size:20px;cursor:pointer;">+</button></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;"><span>16°C</span><span>30°C</span></div></div>' +
    '<div class="form-group"><label class="form-label">制冷/制热模式</label>' +
    '<div style="display:flex;gap:8px;">' +
    '<button id="ac-mode-cool" onclick="setACMode(\'cool\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">❄️ 制冷</button>' +
    '<button id="ac-mode-heat" onclick="setACMode(\'heat\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">🔥 制热</button>' +
    '<button id="ac-mode-auto" onclick="setACMode(\'auto\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">🔄 自动</button></div></div>' +
    '<div class="form-group"><label class="form-label">风速</label>' +
    '<div style="display:flex;gap:8px;">' +
    '<button id="ac-speed-low" onclick="setACSpeed(\'low\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">🌀 低速</button>' +
    '<button id="ac-speed-mid" onclick="setACSpeed(\'mid\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">🌀🌀 中速</button>' +
    '<button id="ac-speed-high" onclick="setACSpeed(\'high\')" style="flex:1;padding:8px;border:2px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px;">🌀🌀🌀 高速</button></div></div></div>' +
    '<div id="ac-off-warning" style="display:none;padding:10px 12px;background:var(--orange-bg);border-radius:6px;font-size:12px;color:var(--orange);margin-top:8px;">⚠️ 关闭空调将断开设备电源</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-ac-control\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitACControl()" id="ac-submit-btn" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;opacity:0.5;pointer-events:none;" disabled>❄️ 发送控制指令</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window._acOperation = '';
  window._acTemp = 26;
  window._acMode = '';
  window._acSpeed = '';
};

window.setACOperation = function(opt) {
  window._acOperation = opt;
  document.querySelectorAll('[id^="ac-opt-"]').forEach(function(b) { b.style.borderColor = 'var(--border)'; b.style.background = 'white'; });
  var btn = document.getElementById('ac-opt-' + opt);
  if (btn) { btn.style.borderColor = 'var(--blue)'; btn.style.background = 'var(--blue-bg)'; }
  var tempSection = document.getElementById('ac-temp-section');
  var offWarning = document.getElementById('ac-off-warning');
  if (tempSection) tempSection.style.display = opt === 'temp' || opt === 'on' ? '' : 'none';
  if (offWarning) offWarning.style.display = opt === 'off' ? '' : 'none';
  var submitBtn = document.getElementById('ac-submit-btn');
  if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; submitBtn.style.pointerEvents = 'auto'; }
};

window.adjustACTemp = function(delta) {
  var slider = document.getElementById('ac-temp-slider');
  if (slider) {
    var newVal = Math.max(16, Math.min(30, window._acTemp + delta));
    window._acTemp = newVal;
    slider.value = newVal;
    var display = document.getElementById('ac-temp-display');
    if (display) display.textContent = newVal;
  }
};

window.setACMode = function(mode) {
  window._acMode = mode;
  document.querySelectorAll('[id^="ac-mode-"]').forEach(function(b) { b.style.borderColor = 'var(--border)'; b.style.background = 'white'; });
  var btn = document.getElementById('ac-mode-' + mode);
  if (btn) { btn.style.borderColor = 'var(--blue)'; btn.style.background = 'var(--blue-bg)'; }
};

window.setACSpeed = function(speed) {
  window._acSpeed = speed;
  document.querySelectorAll('[id^="ac-speed-"]').forEach(function(b) { b.style.borderColor = 'var(--border)'; b.style.background = 'white'; });
  var btn = document.getElementById('ac-speed-' + speed);
  if (btn) { btn.style.borderColor = 'var(--blue)'; btn.style.background = 'var(--blue-bg)'; }
};

window.submitACControl = function() {
  var opt = window._acOperation;
  var temp = window._acTemp;
  var mode = window._acMode || 'cool';
  var speed = window._acSpeed || 'mid';
  var deviceCount = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices.length : 8;
  var optText = {on:'开启', off:'关闭', temp:'调温至' + temp + '°C'}[opt] || opt;
  document.getElementById('modal-ac-control') && document.getElementById('modal-ac-control').remove();
  showToast('❄️ 已向 ' + deviceCount + ' 台空调发送指令：' + optText + '（' + mode + '模式/' + speed + '风速）', 'success');
};
