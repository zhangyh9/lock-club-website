// ============================================================
// 物联后台迭代v4-iter20.js - 7个功能性修复
// 修复：onclick调用的函数存在但函数体缺失
// 完成时间：2026-03-30 03:40
// ============================================================

// -------- 改进1：openBatchDeviceDiagnosticModal（设备批量诊断，1处调用）--------
window.openBatchDeviceDiagnosticModal = function() {
  var existing = document.getElementById('modal-batch-diag');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-batch-diag" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-diag\').remove()">' +
    '<div class="modal" style="width:560px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🌐</div><div style="font-size:15px;font-weight:700;">多设备同时Ping诊断</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-diag\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="margin-bottom:16px;padding:12px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);">💡 将同时对选中的多台设备发送Ping命令，汇总在线状态、响应时间、丢包率</div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">待诊断设备（<span id="diag-selected-count">0</span> 台）</div>' +
    '<div id="diag-device-list" style="max-height:160px;overflow-y:auto;padding:8px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--text-muted);">请从设备列表勾选要诊断的设备</div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--green);" id="diag-online">0</div><div style="font-size:11px;color:var(--text-muted);">在线</div></div>' +
    '<div style="padding:10px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--red);" id="diag-offline">0</div><div style="font-size:11px;color:var(--text-muted);">离线</div></div>' +
    '<div style="padding:10px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--blue);" id="diag-time">-</div><div style="font-size:11px;color:var(--text-muted);">平均响应</div></div></div>' +
    '<div id="diag-progress" style="display:none;margin-bottom:14px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:6px;">诊断进度...</div>' +
    '<div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;"><div id="diag-progress-bar" style="height:100%;background:var(--blue);width:0%;transition:width 0.3s;"></div></div></div>' +
    '<div id="diag-results" style="display:none;max-height:200px;overflow-y:auto;background:var(--bg);border-radius:8px;padding:10px;font-size:12px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-diag\').remove()">关闭</button>' +
    '<button class="modal-btn primary" id="diag-start-btn" onclick="startBatchDiagnostic()" style="background:var(--purple);color:white;border:none;">🔍 开始诊断</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 填充已选设备
  var selDevs = typeof window._selectedDevices !== 'undefined' ? window._selectedDevices : [];
  var listEl = document.getElementById('diag-device-list');
  var countEl = document.getElementById('diag-selected-count');
  if (countEl) countEl.textContent = selDevs.length;
  if (listEl) {
    if (selDevs.length > 0) {
      var devs = selDevs.map(function(uuid) {
        var d = (typeof deviceData !== 'undefined') && deviceData.find ? deviceData.find(function(x){return x.uuid===uuid;}) : null;
        return d ? d.room + '室 (' + d.uuid + ')' : uuid;
      });
      listEl.innerHTML = devs.join('<br>');
      listEl.style.color = 'var(--text)';
    } else {
      // 如果没有选中，使用deviceData前5台演示
      var demoDevs = (typeof deviceData !== 'undefined') ? deviceData.slice(0,5).map(function(d){return d.room+'室 ('+d.uuid+')';}) : ['DEV-LK01 (301室)','DEV-LK02 (302室)','DEV-LK03 (303室)'];
      listEl.innerHTML = demoDevs.join('<br>') + '<br><span style="color:var(--orange);">（演示数据，请从设备列表勾选实际设备）</span>';
      listEl.style.color = 'var(--text)';
    }
  }
};

window.startBatchDiagnostic = function() {
  var progressDiv = document.getElementById('diag-progress');
  var resultsDiv = document.getElementById('diag-results');
  var progressBar = document.getElementById('diag-progress-bar');
  var startBtn = document.getElementById('diag-start-btn');
  if (progressDiv) progressDiv.style.display = 'block';
  if (resultsDiv) { resultsDiv.style.display = 'block'; resultsDiv.innerHTML = ''; }
  if (startBtn) startBtn.disabled = true;
  var devs = (typeof window._selectedDevices !== 'undefined' && window._selectedDevices.length > 0) ? window._selectedDevices : (typeof deviceData !== 'undefined' ? deviceData.slice(0,5).map(function(d){return d.uuid;}) : ['DEV-LK01','DEV-LK02','DEV-LK03','DEV-LK04','DEV-LK05']);
  var total = devs.length;
  var done = 0;
  var onlineCount = 0;
  var offlineCount = 0;
  var results = [];
  devs.forEach(function(uuid, i) {
    setTimeout(function() {
      var isOnline = Math.random() > 0.2;
      var responseTime = Math.floor(Math.random() * 200) + 10;
      if (isOnline) { onlineCount++; } else { offlineCount++; }
      results.push({uuid: uuid, online: isOnline, time: responseTime});
      done++;
      var pct = Math.round((done / total) * 100);
      if (progressBar) progressBar.style.width = pct + '%';
      var onlineEl = document.getElementById('diag-online');
      var offlineEl = document.getElementById('diag-offline');
      var timeEl = document.getElementById('diag-time');
      if (onlineEl) onlineEl.textContent = onlineCount;
      if (offlineEl) offlineEl.textContent = offlineCount;
      if (timeEl) {
        var avgTime = results.filter(function(r){return r.online;}).reduce(function(s,r){return s+r.time;},0) / Math.max(1, results.filter(function(r){return r.online;}).length);
        timeEl.textContent = Math.round(avgTime) + 'ms';
      }
      var resultsEl = document.getElementById('diag-results');
      if (resultsEl) {
        var rows = results.map(function(r){
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">' +
            '<span style="font-weight:600;">' + r.uuid + '</span>' +
            '<span style="color:' + (r.online ? 'var(--green)' : 'var(--red)') + ';font-weight:600;">' + (r.online ? '🟢 在线 ' + r.time + 'ms' : '🔴 离线') + '</span></div>';
        }).join('');
        resultsEl.innerHTML = rows;
      }
      if (done === total) {
        if (startBtn) startBtn.disabled = false;
        var summary = '<div style="margin-top:10px;padding:10px;background:' + (offlineCount === 0 ? 'var(--green-bg)' : 'var(--orange-bg)') + ';border-radius:8px;font-size:12px;color:' + (offlineCount === 0 ? 'var(--green)' : 'var(--orange)') + ';">';
        if (offlineCount === 0) {
          summary += '✅ 全部 ' + total + ' 台设备在线，诊断通过';
        } else {
          summary += '⚠️ ' + offlineCount + ' 台设备离线，请检查网络';
        }
        summary += '</div>';
        var resultsEl2 = document.getElementById('diag-results');
        if (resultsEl2) resultsEl2.innerHTML += summary;
      }
    }, i * 400);
  });
};

// -------- 改进2：openBatchBatteryCheck（批量电池检测，1处调用）--------
window.openBatchBatteryCheck = function() {
  var existing = document.getElementById('modal-batch-battery');
  if (existing) existing.remove();
  var devs = (typeof deviceData !== 'undefined') ? deviceData : [];
  var lowBatt = devs.filter(function(d){ return d.battery < 30; });
  var midBatt = devs.filter(function(d){ return d.battery >= 30 && d.battery < 60; });
  var goodBatt = devs.filter(function(d){ return d.battery >= 60; });
  var html = '<div class="modal-overlay" id="modal-batch-battery" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-battery\').remove()">' +
    '<div class="modal" style="width:520px;max-height:80vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🔋</div><div style="font-size:15px;font-weight:700;">低电量批量检测</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-battery\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--red);">' + lowBatt.length + '</div><div style="font-size:11px;color:var(--red);font-weight:600;">严重不足</div><div style="font-size:10px;color:var(--text-muted);">&lt;30%</div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + midBatt.length + '</div><div style="font-size:11px;color:var(--orange);font-weight:600;">电量偏低</div><div style="font-size:10px;color:var(--text-muted);">30-59%</div></div>' +
    '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + goodBatt.length + '</div><div style="font-size:11px;color:var(--green);font-weight:600;">电量正常</div><div style="font-size:10px;color:var(--text-muted);">≥60%</div></div></div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">⚠️ 需更换电池设备（' + lowBatt.length + ' 台）</div>';
  if (lowBatt.length > 0) {
    html += '<div style="max-height:150px;overflow-y:auto;">';
    lowBatt.forEach(function(d) {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--red-bg);border-radius:6px;margin-bottom:6px;">' +
        '<div><div style="font-size:12px;font-weight:600;color:var(--red);">' + d.room + '室</div><div style="font-size:10px;color:var(--text-muted);">' + d.uuid + '</div></div>' +
        '<div style="text-align:right;"><div style="font-size:14px;font-weight:700;color:var(--red);">🔋 ' + d.battery + '%</div>' +
        '<button class="action-btn small" onclick="showToast(\'换电池工单已创建：' + d.room + '室\',\'success\')" style="padding:2px 8px;font-size:10px;background:var(--red);color:white;border:none;">创建工单</button></div></div>';
    });
    html += '</div>';
  } else {
    html += '<div style="padding:16px;text-align:center;color:var(--green);font-size:13px;">🎉 所有设备电量充足，无需更换</div>';
  }
  html += '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-battery\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="showToast(\'已为 ' + lowBatt.length + ' 台低电量设备创建换电池工单\',\'success\');document.getElementById(\'modal-batch-battery\').remove();" style="background:var(--orange);color:white;border:none;">📋 批量创建换电池工单</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进3：openMaintenancePlanModal（维护计划，1处调用）--------
window.openMaintenancePlanModal = function() {
  var existing = document.getElementById('modal-maintenance-plan');
  if (existing) existing.remove();
  var plans = [
    {room:'301',type:'门锁',status:'pending',next:'2026-04-05',interval:'90天'},
    {room:'302',type:'门锁',status:'done',next:'2026-04-10',interval:'90天'},
    {room:'203',type:'空调',status:'pending',next:'2026-04-01',interval:'180天'},
    {room:'205',type:'门锁',status:'overdue',next:'2026-03-20',interval:'90天'}
  ];
  var html = '<div class="modal-overlay" id="modal-maintenance-plan" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-maintenance-plan\').remove()">' +
    '<div class="modal" style="width:600px;max-height:80vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🔧</div><div style="font-size:15px;font-weight:700;">设备维护计划</div></div>' +
    '<button onclick="document.getElementById(\'modal-maintenance-plan\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
    '<div style="flex:1;padding:10px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--orange);">2</div><div style="font-size:11px;color:var(--orange);">待执行</div></div>' +
    '<div style="flex:1;padding:10px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--red);">1</div><div style="font-size:11px;color:var(--red);">已逾期</div></div>' +
    '<div style="flex:1;padding:10px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--green);">1</div><div style="font-size:11px;color:var(--green);">已完成</div></div></div>' +
    '<table class="table" style="font-size:12px;"><thead><tr><th>房间</th><th>设备类型</th><th>状态</th><th>下次维护</th><th>周期</th><th>操作</th></tr></thead><tbody>';
  plans.forEach(function(p) {
    var statusBadge = {pending:'<span style="padding:2px 6px;background:var(--orange-bg);color:var(--orange);border-radius:4px;font-size:10px;">待执行</span>',done:'<span style="padding:2px 6px;background:var(--green-bg);color:var(--green);border-radius:4px;font-size:10px;">已完成</span>',overdue:'<span style="padding:2px 6px;background:var(--red-bg);color:var(--red);border-radius:4px;font-size:10px;">已逾期</span>'}[p.status];
    html += '<tr>' +
      '<td style="font-weight:600;">' + p.room + '</td>' +
      '<td>' + p.type + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' + p.next + '</td>' +
      '<td>' + p.interval + '</td>' +
      '<td><button class="action-btn small" onclick="showToast(\'维护记录已更新：' + p.room + '\',\'success\')" style="padding:2px 8px;font-size:11px;">标记完成</button></td></tr>';
  });
  html += '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-maintenance-plan\').remove()">关闭</button>' +
    '<button class="modal-btn primary" onclick="showToast(\'新维护计划已创建\',\'success\');document.getElementById(\'modal-maintenance-plan\').remove();" style="background:var(--blue);color:white;border:none;">+ 新建计划</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进4：openAutoMaintenanceGenerator（AI维护计划，1处调用）--------
window.openAutoMaintenanceGenerator = function() {
  var existing = document.getElementById('modal-auto-maint');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-auto-maint" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-auto-maint\').remove()">' +
    '<div class="modal" style="width:500px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🤖</div><div style="font-size:15px;font-weight:700;">AI智能维护计划生成</div></div>' +
    '<button onclick="document.getElementById(\'modal-auto-maint\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="margin-bottom:14px;padding:12px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:8px;font-size:12px;color:var(--purple);">🤖 AI将根据设备使用频率、电池电量、固件版本、故障历史综合分析，生成最优维护计划</div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择生成范围</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
    '<label style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;"><input type="checkbox" checked style="accent-color:var(--blue);">门锁设备</label>' +
    '<label style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;"><input type="checkbox" style="accent-color:var(--blue);">空调设备</label>' +
    '<label style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;"><input type="checkbox" style="accent-color:var(--blue);">所有设备</label></div></div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">计划周期</div>' +
    '<select class="form-select" style="width:100%;padding:8px 12px;font-size:12px;"><option>未来30天</option><option selected>未来90天</option><option>未来180天</option></select></div>' +
    '<div id="maint-generating" style="display:none;text-align:center;padding:20px;">' +
    '<div style="font-size:32px;margin-bottom:10px;">⚙️</div><div style="font-size:14px;font-weight:600;margin-bottom:6px;">AI分析中...</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">正在分析12台设备的维护需求</div></div>' +
    '<div id="maint-result" style="display:none;padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;font-size:12px;color:var(--green);">' +
    '✅ AI维护计划已生成！共 4 项维护任务，已按优先级排序</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-auto-maint\').remove()">关闭</button>' +
    '<button class="modal-btn primary" id="maint-gen-btn" onclick="runAutoMaintGen()" style="background:var(--purple);color:white;border:none;">🚀 开始生成</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.runAutoMaintGen = function() {
  var genDiv = document.getElementById('maint-generating');
  var resultDiv = document.getElementById('maint-result');
  var genBtn = document.getElementById('maint-gen-btn');
  if (genDiv) genDiv.style.display = 'block';
  if (resultDiv) resultDiv.style.display = 'none';
  if (genBtn) genBtn.disabled = true;
  setTimeout(function() {
    if (genDiv) genDiv.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'block';
    if (genBtn) { genBtn.disabled = false; genBtn.textContent = '✅ 已生成'; }
    showToast('🤖 AI维护计划已生成，共 4 项任务', 'success');
  }, 2000);
};

// -------- 改进5：openAddFloorForm（新增楼层，1处调用）--------
window.openAddFloorForm = function() {
  var existing = document.getElementById('modal-add-floor');
  if (existing) existing.remove();
  var buildingSelect = document.getElementById('bld-bldg-filter') || document.getElementById('bldg-select');
  var building = buildingSelect ? buildingSelect.value : 'main';
  var nextFloor = 4;
  if (typeof floorData !== 'undefined' && floorData.length > 0) {
    var maxFloor = Math.max.apply(null, floorData.filter(function(f){return f.building === building;}).map(function(f){return parseInt(f.floor) || 0;}));
    nextFloor = maxFloor + 1;
  }
  var html = '<div class="modal-overlay" id="modal-add-floor" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-floor\').remove()">' +
    '<div class="modal" style="width:420px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🏢</div><div style="font-size:15px;font-weight:700;">新增楼层</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-floor\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">所属楼栋</label>' +
    '<select class="form-select" id="floor-building" style="width:100%;padding:8px 12px;">' +
    '<option value="main">主楼</option><option value="east">东配楼</option></select></div>' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">楼层名称/编号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="floor-name" placeholder="如：3层 / 3F / B1" value="' + nextFloor + '层" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">楼层描述</label>' +
    '<input type="text" class="form-input" id="floor-desc" placeholder="可选，如：客房区/公共区" style="width:100%;padding:8px 12px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-floor\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddFloor()" style="background:var(--blue);color:white;border:none;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddFloor = function() {
  var building = document.getElementById('floor-building') ? document.getElementById('floor-building').value : 'main';
  var name = document.getElementById('floor-name') ? document.getElementById('floor-name').value.trim() : '';
  var desc = document.getElementById('floor-desc') ? document.getElementById('floor-desc').value.trim() : '';
  if (!name) { showToast('请填写楼层名称', 'error'); return; }
  if (typeof floorData !== 'undefined') {
    floorData.push({floor: name, building: building, desc: desc, rooms: []});
  }
  document.getElementById('modal-add-floor') && document.getElementById('modal-add-floor').remove();
  showToast('✅ 楼层 ' + name + ' 已新增', 'success');
  if (typeof renderFloorList === 'function') renderFloorList();
  if (typeof refreshBuildingDetail === 'function') refreshBuildingDetail();
};

// -------- 改进6：openAddRoomForm（新增房间，2处调用）--------
window.openAddRoomForm = function() {
  var existing = document.getElementById('modal-add-room');
  if (existing) existing.remove();
  var bldgSelect = document.getElementById('bld-bldg-filter');
  var floorSelect = document.getElementById('bld-floor-filter');
  var building = bldgSelect ? bldgSelect.value : 'main';
  var floor = floorSelect ? floorSelect.value : '';
  var nextRoomNum = 401;
  if (typeof floorData !== 'undefined') {
    var maxRoom = Math.max.apply(null, floorData.filter(function(f){return f.building === building;}).map(function(f){return parseInt(f.rooms && f.rooms.length > 0 ? f.rooms[f.rooms.length-1] : 0);}));
    if (maxRoom > 0) nextRoomNum = maxRoom + 1;
  }
  var html = '<div class="modal-overlay" id="modal-add-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-room\').remove()">' +
    '<div class="modal" style="width:480px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🚪</div><div style="font-size:15px;font-weight:700;">快速添加房间</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-room\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group" style="flex:1;"><label class="form-label">房间号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="room-num" value="' + nextRoomNum + '" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group" style="flex:1;"><label class="form-label">所属楼层</label>' +
    '<select class="form-select" id="room-floor" style="width:100%;padding:8px 12px;">' +
    '<option value="">-- 选择楼层 --</option>' +
    '<option value="1层">1层</option><option value="2层">2层</option><option value="3层">3层</option></select></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group" style="flex:1;"><label class="form-label">房型</label>' +
    '<select class="form-select" id="room-type" style="width:100%;padding:8px 12px;">' +
    '<option value="标准间">标准间</option><option value="大床房">大床房</option><option value="亲子间">亲子间</option><option value="套房">套房</option></select></div>' +
    '<div class="form-group" style="flex:1;"><label class="form-label">房间状态</label>' +
    '<select class="form-select" id="room-status" style="width:100%;padding:8px 12px;">' +
    '<option value="empty">🟢 空房</option><option value="in">🔵 入住</option><option value="maintain">🟠 维修</option><option value="disable">🔴 停用</option></select></div></div>' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="room-note" placeholder="可选备注" style="width:100%;padding:8px 12px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-room\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddRoom()" style="background:var(--blue);color:white;border:none;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddRoom = function() {
  var num = document.getElementById('room-num') ? document.getElementById('room-num').value.trim() : '';
  var floor = document.getElementById('room-floor') ? document.getElementById('room-floor').value : '';
  var type = document.getElementById('room-type') ? document.getElementById('room-type').value : '标准间';
  var status = document.getElementById('room-status') ? document.getElementById('room-status').value : 'empty';
  var note = document.getElementById('room-note') ? document.getElementById('room-note').value.trim() : '';
  if (!num) { showToast('请填写房间号', 'error'); return; }
  document.getElementById('modal-add-room') && document.getElementById('modal-add-room').remove();
  showToast('✅ 房间 ' + num + ' 已添加（' + type + '）', 'success');
  if (typeof refreshBuildingDetail === 'function') refreshBuildingDetail();
  if (typeof renderBuildingDetail === 'function') renderBuildingDetail();
};

// -------- 改进7：openAddEmployeeFullModal（新增员工，1处调用）--------
window.openAddEmployeeFullModal = function() {
  var existing = document.getElementById('modal-add-employee');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-add-employee" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-employee\').remove()">' +
    '<div class="modal" style="width:520px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">👨💼</div><div style="font-size:15px;font-weight:700;">新增员工</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-employee\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group" style="flex:1;"><label class="form-label">姓名 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="emp-name" placeholder="员工姓名" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group" style="flex:1;"><label class="form-label">工号</label>' +
    '<input type="text" class="form-input" id="emp-code" placeholder="自动生成" style="width:100%;padding:8px 12px;background:var(--bg);color:var(--text-muted);" disabled></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group" style="flex:1;"><label class="form-label">手机号</label>' +
    '<input type="tel" class="form-input" id="emp-phone" placeholder="手机号" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group" style="flex:1;"><label class="form-label">职位</label>' +
    '<select class="form-select" id="emp-role" style="width:100%;padding:8px 12px;">' +
    '<option value="前台">前厅员工</option><option value="主管">客房主管</option><option value="经理">前厅经理</option><option value="保洁">保洁人员</option><option value="工程">工程师</option><option value="admin">管理员</option></select></div></div>' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">入职日期</label>' +
    '<input type="date" class="form-input" id="emp-date" value="2026-03-30" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group" style="margin-bottom:14px;"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="emp-note" placeholder="可选备注信息" style="width:100%;min-height:60px;padding:8px 12px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-employee\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitAddEmployee()" style="background:var(--blue);color:white;border:none;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddEmployee = function() {
  var name = document.getElementById('emp-name') ? document.getElementById('emp-name').value.trim() : '';
  var phone = document.getElementById('emp-phone') ? document.getElementById('emp-phone').value.trim() : '';
  var role = document.getElementById('emp-role') ? document.getElementById('emp-role').value : '前台';
  var note = document.getElementById('emp-note') ? document.getElementById('emp-note').value.trim() : '';
  if (!name) { showToast('请填写员工姓名', 'error'); return; }
  document.getElementById('modal-add-employee') && document.getElementById('modal-add-employee').remove();
  showToast('✅ 员工 ' + name + ' 已新增（' + role + '）', 'success');
  if (typeof renderStaffList === 'function') renderStaffList();
  else if (typeof refreshStaffTable === 'function') refreshStaffTable();
};
