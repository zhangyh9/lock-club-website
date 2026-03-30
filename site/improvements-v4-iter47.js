// ============================================================
// 【物联后台 v4 第47轮】节能风控页面 - 5个缺失函数补全
// 改进点：节能风控页面按钮已绑定但函数未定义
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：openEnergyAnalysisModal - 详细数据分析 ----------
  window.openEnergyAnalysisModal = function(roomFilter) {
    var existing = document.getElementById('modal-energy-analysis');
    if (existing) existing.remove();
    var roomData = [
      {room:'301', type:'亲子间', kwh:8.6, water:120, cost:4.30, status:'异常偏高', trend:'up', pct:92},
      {room:'304', type:'亲子间', kwh:7.1, water:95, cost:3.55, status:'偏高', trend:'up', pct:76},
      {room:'201', type:'标准间', kwh:5.2, water:68, cost:2.60, status:'正常', trend:'stable', pct:55},
      {room:'302', type:'大床房', kwh:1.2, water:28, cost:0.60, status:'正常', trend:'down', pct:15},
      {room:'303', type:'标准间', kwh:0.8, water:15, cost:0.40, status:'偏低', trend:'down', pct:8}
    ];
    var totalKwh = roomData.reduce(function(s, r){ return s + r.kwh; }, 0);
    var totalCost = roomData.reduce(function(s, r){ return s + r.cost; }, 0);
    var anomalyCount = roomData.filter(function(r){ return r.status.indexOf('异常') >= 0 || r.status.indexOf('偏高') >= 0; }).length;
    var trendIcon = {up:'📈', down:'📉', stable:'➡️'};
    var statusColor = {异常偏高:'var(--red)', 偏高:'var(--orange)', 正常:'var(--green)', 偏低:'var(--blue)'};
    var rows = roomData.map(function(r) {
      return '<tr style="cursor:pointer;" onclick="openEnergyDetailModal(\'' + r.room + '\')">' +
        '<td style="font-weight:600;">' + r.room + '</td>' +
        '<td>' + r.type + '</td>' +
        '<td><span style="color:' + statusColor[r.status] + ';font-weight:600;">' + r.status + '</span></td>' +
        '<td style="font-weight:600;color:var(--blue);">' + r.kwh.toFixed(1) + ' kWh</td>' +
        '<td>' + r.water + ' L</td>' +
        '<td style="color:var(--green);">¥' + r.cost.toFixed(2) + '</td>' +
        '<td>' + trendIcon[r.trend] + '</td>' +
        '<td><div style="width:60px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + r.pct + '%;background:' + statusColor[r.status] + ';border-radius:3px;"></div></div></td>' +
        '<td><button class="action-btn small" onclick="event.stopPropagation();openEnergyAnomalyControlModal(\'' + r.room + '\', ' + r.kwh + ', \'' + r.status + '\')" style="padding:2px 6px;font-size:10px;">⚠️</button></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-energy-analysis" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-analysis\').remove()">' +
      '<div class="modal" style="width:800px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📊</div><div><div style="font-size:15px;font-weight:700;">详细数据分析</div><div style="font-size:11px;color:var(--text-muted);">能耗分布 · 异常检测 · 节能建议</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-analysis\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + totalKwh.toFixed(1) + '</div><div style="font-size:11px;color:var(--text-muted);">总用电(kWh)</div></div>' +
      '<div style="text-align:center;padding:12px;background:var(--green-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--green);">¥' + totalCost.toFixed(2) + '</div><div style="font-size:11px;color:var(--text-muted);">总电费(¥)</div></div>' +
      '<div style="text-align:center;padding:12px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + anomalyCount + '</div><div style="font-size:11px;color:var(--text-muted);">异常房间</div></div>' +
      '<div style="text-align:center;padding:12px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--purple);">' + roomData.length + '</div><div style="font-size:11px;color:var(--text-muted);">监控房间</div></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 6px;text-align:left;font-weight:600;color:var(--text-muted);">房间</th><th style="padding:8px 6px;text-align:left;font-weight:600;color:var(--text-muted);">房型</th><th style="padding:8px 6px;text-align:left;font-weight:600;color:var(--text-muted);">状态</th><th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--text-muted);">用电(kWh)</th><th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--text-muted);">用水(L)</th><th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--text-muted);">电费</th><th style="padding:8px 6px;text-align:center;font-weight:600;color:var(--text-muted);">趋势</th><th style="padding:8px 6px;text-align:center;font-weight:600;color:var(--text-muted);">占比</th><th style="padding:8px 6px;text-align:center;font-weight:600;color:var(--text-muted);">操作</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="exportEnergyData();showToast(\'📊 能耗分析报告已导出\',\'success\');" style="padding:8px 16px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:8px;font-size:12px;cursor:pointer;">📤 导出分析报告</button>' +
      '<button onclick="document.getElementById(\'modal-energy-analysis\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进2：openEnergyForecastModal - 能耗预测 ----------
  window.openEnergyForecastModal = function() {
    var existing = document.getElementById('modal-energy-forecast');
    if (existing) existing.remove();
    var days = ['今天', '明天', '本周三', '本周四', '本周五', '本周六', '本周日'];
    var forecasts = [
      {day:'今天', kwh:48.2, cost:24.10, tip:'与昨日持平'},
      {day:'明天', kwh:52.0, cost:26.00, tip:'预计增长8%，注意空调使用'},
      {day:'本周三', kwh:50.5, cost:25.25, tip:'维持稳定'},
      {day:'本周四', kwh:55.0, cost:27.50, tip:'预计阴天，照明用电增加'},
      {day:'本周五', kwh:62.0, cost:31.00, tip:'周末入住率上升，用电增加'},
      {day:'本周六', kwh:68.0, cost:34.00, tip:'周末峰值，注意超额风险'},
      {day:'本周日', kwh:58.0, cost:29.00, tip:'周日回落，提前调整策略'}
    ];
    var weekTotal = forecasts.reduce(function(s, f){ return s + f.kwh; }, 0);
    var weekCost = forecasts.reduce(function(s, f){ return s + f.cost; }, 0);
    var maxKwh = Math.max.apply(null, forecasts.map(function(f){ return f.kwh; }));
    var bars = forecasts.map(function(f, i) {
      var h = Math.round((f.kwh / maxKwh) * 120);
      var isWeekend = i >= 4;
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
        '<div style="font-size:11px;font-weight:600;color:var(--blue);">' + f.kwh.toFixed(1) + '</div>' +
        '<div style="width:28px;background:' + (isWeekend ? 'var(--orange)' : 'var(--blue)') + ';border-radius:4px 4px 0 0;height:' + h + 'px;min-height:8px;"></div>' +
        '<div style="font-size:10px;color:var(--text-muted);text-align:center;">' + f.day + '</div></div>';
    }).join('');
    var tips = forecasts.map(function(f) {
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;">' +
        '<span style="color:var(--text-muted);">' + f.day + '</span><span style="color:var(--blue);font-weight:600;">' + f.kwh + ' kWh</span>' +
        '<span style="color:var(--text-light);">' + f.tip + '</span></div>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-energy-forecast" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-forecast\').remove()">' +
      '<div class="modal" style="width:620px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📈</div><div><div style="font-size:15px;font-weight:700;">能耗预测</div><div style="font-size:11px;color:var(--text-muted);">未来7天能耗趋势 · 费用预估</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-forecast\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + weekTotal.toFixed(0) + '</div><div style="font-size:11px;color:var(--text-muted);">本周预计(kWh)</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">¥' + weekCost.toFixed(0) + '</div><div style="font-size:11px;color:var(--text-muted);">本周预计电费</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">¥' + (weekCost * 1.15).toFixed(0) + '</div><div style="font-size:11px;color:var(--text-muted);">月度预算参考</div></div></div>' +
      '<div style="padding:20px 24px 8px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:12px;">📊 近7天能耗趋势预测</div>' +
      '<div style="display:flex;align-items:flex-end;gap:8px;height:140px;padding:0 4px;">' + bars + '</div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:8px 24px 16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">💡 每日提示</div>' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;">' + tips + '</div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-energy-forecast\').remove()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进3：openBatchEnergyControlModal - 批量通断电 ----------
  window.openBatchEnergyControlModal = function() {
    var existing = document.getElementById('modal-batch-energy');
    if (existing) existing.remove();
    var rooms = [
      {room:'301', floor:'3层', type:'亲子间', status:'在住', power:true},
      {room:'302', floor:'3层', type:'大床房', status:'在住', power:true},
      {room:'303', floor:'3层', type:'标准间', status:'空房', power:false},
      {room:'304', floor:'3层', type:'亲子间', status:'在住', power:true},
      {room:'201', floor:'2层', type:'标准间', status:'在住', power:true},
      {room:'202', floor:'2层', type:'大床房', status:'空房', power:false},
      {room:'203', floor:'2层', type:'标准间', status:'维修', power:false}
    ];
    var rows = rooms.map(function(r, i) {
      var checked = r.power ? 'checked' : '';
      var bg = r.status === '在住' ? 'var(--green-bg)' : r.status === '空房' ? 'var(--bg)' : 'var(--orange-bg)';
      return '<tr style="background:' + bg + ';">' +
        '<td style="padding:8px 10px;"><input type="checkbox" ' + checked + ' id="bec-' + i + '" style="accent-color:var(--blue);"></td>' +
        '<td style="padding:8px 10px;font-weight:600;">' + r.room + '</td>' +
        '<td style="padding:8px 10px;font-size:11px;color:var(--text-muted);">' + r.floor + '</td>' +
        '<td style="padding:8px 10px;">' + r.type + '</td>' +
        '<td style="padding:8px 10px;"><span class="tbadge ' + (r.status === '在住' ? 'green' : r.status === '空房' ? 'gray' : 'orange') + '">' + r.status + '</span></td>' +
        '<td style="padding:8px 10px;"><span style="color:' + (r.power ? 'var(--green)' : 'var(--red)') + ';font-size:16px;">' + (r.power ? '●' : '○') + '</span></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-batch-energy" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-energy\').remove()">' +
      '<div class="modal" style="width:560px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">⚡</div><div><div style="font-size:15px;font-weight:700;">批量通断电控制</div><div style="font-size:11px;color:var(--text-muted);">选中房间统一发送通电/断电指令</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-batch-energy\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;">' +
      '<select id="bec-action" style="padding:7px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="on">⚡ 批量通电</option><option value="off">⭘ 批量断电</option></select>' +
      '<span style="font-size:11px;color:var(--text-muted);">已选 <span id="bec-count" style="color:var(--blue);font-weight:600;">0</span> 个房间</span>' +
      '<button onclick="var all=document.querySelectorAll(\'#bec-table input[type=checkbox]\');all.forEach(function(c){c.checked=true;});document.getElementById(\'bec-count\').textContent=all.length;" style="margin-left:auto;padding:5px 10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:11px;cursor:pointer;">全选</button>' +
      '<button onclick="var all=document.querySelectorAll(\'#bec-table input[type=checkbox]\');all.forEach(function(c){c.checked=false;});document.getElementById(\'bec-count\').textContent=0;" style="padding:5px 10px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:11px;cursor:pointer;">取消</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;" id="bec-table">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 10px;width:30px;"></th><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);">房间</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);">楼层</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);">房型</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);">状态</th><th style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);">当前</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-batch-energy\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer;">取消</button>' +
      '<button onclick="var selected=[];document.querySelectorAll(\'#bec-table input[type=checkbox]:checked\').forEach(function(c){var row=c.closest(\'tr\');var room=row.cells[1].textContent;selected.push(room);});if(selected.length===0){showToast(\'请先选择至少一个房间\',\'warning\');return;}var action=document.getElementById(\'bec-action\').value;document.getElementById(\'modal-batch-energy\').remove();showToast(\'⚡ 已向 \' + selected.length + \' 个房间发送\' + (action===\'on\'?\'通电\':\'断电\') + \'指令\',\'success\');" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;">⚡ 确认执行</button></div></div></div>';
    // Add checkbox listener after render
    setTimeout(function() {
      var checkboxes = document.querySelectorAll('#bec-table input[type=checkbox]');
      checkboxes.forEach(function(cb) {
        cb.addEventListener('change', function() {
          var count = document.querySelectorAll('#bec-table input[type=checkbox]:checked').length;
          var countEl = document.getElementById('bec-count');
          if (countEl) countEl.textContent = count;
        });
      });
    }, 100);
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进4：openEnergyBudgetConfigModalV2 - 预算配置 ----------
  window.openEnergyBudgetConfigModalV2 = function() {
    var existing = document.getElementById('modal-energy-budget');
    if (existing) existing.remove();
    var budgets = [
      {floor:'3层', dailyLimit:45, monthlyLimit:1200, current:780, alertThreshold:80},
      {floor:'2层', dailyLimit:40, monthlyLimit:1000, current:620, alertThreshold:75},
      {floor:'1层', dailyLimit:35, monthlyLimit:900, current:410, alertThreshold:80}
    ];
    var rows = budgets.map(function(b, i) {
      var pct = Math.round((b.current / b.monthlyLimit) * 100);
      var color = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--orange)' : 'var(--green)';
      return '<tr>' +
        '<td style="padding:10px;font-weight:600;">' + b.floor + '</td>' +
        '<td style="padding:10px;"><input type="number" id="eb-daily-' + i + '" value="' + b.dailyLimit + '" style="width:70px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:12px;text-align:center;"></td>' +
        '<td style="padding:10px;"><input type="number" id="eb-monthly-' + i + '" value="' + b.monthlyLimit + '" style="width:80px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:12px;text-align:center;"></td>' +
        '<td style="padding:10px;"><span style="color:' + color + ';font-weight:600;">' + b.current + '</span><span style="color:var(--text-muted);font-size:11px;"> / ' + b.monthlyLimit + '</span></td>' +
        '<td style="padding:10px;"><div style="width:80px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;"></div></div><span style="font-size:10px;color:var(--text-muted);">' + pct + '%</span></td>' +
        '<td style="padding:10px;"><select id="eb-alert-' + i + '" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:11px;">' +
        '<option value="70"' + (b.alertThreshold === 70 ? ' selected' : '') + '>70%</option>' +
        '<option value="80"' + (b.alertThreshold === 80 ? ' selected' : '') + '>80%</option>' +
        '<option value="90"' + (b.alertThreshold === 90 ? ' selected' : '') + '>90%</option></select></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-energy-budget" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-budget\').remove()">' +
      '<div class="modal" style="width:640px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">💰</div><div><div style="font-size:15px;font-weight:700;">能耗预算配置</div><div style="font-size:11px;color:var(--text-muted);">楼层级别日/月度用电预算设置</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-budget\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 24px;border-bottom:1px solid var(--border);background:var(--orange-bg);font-size:11px;color:var(--orange);">⚠️ 预算设置仅用于告警提醒，不会自动限制用电</div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:10px;text-align:left;font-weight:600;color:var(--text-muted);">楼层</th><th style="padding:10px;text-align:center;font-weight:600;color:var(--text-muted);">日限额(kWh)</th><th style="padding:10px;text-align:center;font-weight:600;color:var(--text-muted);">月限额(kWh)</th><th style="padding:10px;text-align:left;font-weight:600;color:var(--text-muted);">本月使用</th><th style="padding:10px;text-align:center;font-weight:600;color:var(--text-muted);">使用率</th><th style="padding:10px;text-align:center;font-weight:600;color:var(--text-muted);">告警阈值</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-energy-budget\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer;">取消</button>' +
      '<button onclick="document.getElementById(\'modal-energy-budget\').remove();showToast(\'✅ 能耗预算配置已保存\',\'success\');" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;">💾 保存配置</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进5：openEnergyAnomalyControlModal - 能耗异常处理 ----------
  window.openEnergyAnomalyControlModal = function(room, kwh, reason) {
    var existing = document.getElementById('modal-energy-anomaly');
    if (existing) existing.remove();
    var reason = reason || '能耗异常偏高';
    var html = '<div class="modal-overlay" id="modal-energy-anomaly" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-anomaly\').remove()">' +
      '<div class="modal" style="width:460px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">⚠️</div><div><div style="font-size:15px;font-weight:700;">能耗异常处理</div><div style="font-size:11px;color:var(--text-muted);">房间 ' + room + '</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-anomaly\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div style="padding:12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:16px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">当前用电量</div>' +
      '<div style="font-size:32px;font-weight:700;color:var(--red);">' + kwh.toFixed(1) + ' <span style="font-size:14px;font-weight:normal;">kWh</span></div></div>' +
      '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--text-light);">⚠️ ' + reason + '</div>' +
      '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">选择处理方式</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';">' +
      '<input type="radio" name="eac-action" value="notify" checked style="accent-color:var(--blue);"><div><div style="font-size:13px;font-weight:600;">📱 发送告警通知</div><div style="font-size:11px;color:var(--text-muted);">通知前台该房间能耗异常</div></div></label>' +
      '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';">' +
      '<input type="radio" name="eac-action" value="cut" style="accent-color:var(--blue);"><div><div style="font-size:13px;font-weight:600;">⭘ 临时断电保护</div><div style="font-size:11px;color:var(--text-muted);">远程断开该房间电源（15分钟后自动恢复）</div></div></label>' +
      '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';">' +
      '<input type="radio" name="eac-action" value="workorder" style="accent-color:var(--blue);"><div><div style="font-size:13px;font-weight:600;">🛠️ 创建巡检工单</div><div style="font-size:11px;color:var(--text-muted);">派发工程部上门检查设备</div></div></label>' +
      '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';">' +
      '<input type="radio" name="eac-action" value="ignore" style="accent-color:var(--blue);"><div><div style="font-size:13px;font-weight:600;">➡️ 标记正常（忽略）</div><div style="font-size:11px;color:var(--text-muted);">该房间确实需要长时间使用空调</div></div></label></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-energy-anomaly\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer;">取消</button>' +
      '<button onclick="var action=document.querySelector(\'input[name=eac-action]:checked\').value;var msgs={\'notify\':\'📱 告警通知已发送\',\'cut\':\'⭘ 已向房间 \'+\'' + room + '\'+\' 发送断电指令\',\'workorder\':\'🛠️ 巡检工单已创建\',\'ignore\':\'➡️ 已标记为正常\'];document.getElementById(\'modal-energy-anomaly\').remove();showToast(msgs[action]+\'（房间 \'+ \'' + room + '\' + \'）\',\'success\');" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;">✅ 确认处理</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  console.log('[iter47] 节能风控页面5个缺失函数补全完成：openEnergyAnalysisModal / openEnergyForecastModal / openBatchEnergyControlModal / openEnergyBudgetConfigModalV2 / openEnergyAnomalyControlModal');
})();
