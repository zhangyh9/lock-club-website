// ============================================================
// 【物联后台 v4 第49轮】5个断裂函数补全（全面检查修复）
// ============================================================
// 改进1: openRoleAuditLogModal() - 角色权限变更日志（页面有按钮但函数缺失）
// 改进2: openBatchEnergyControlModal() - 批量通断电控制（页面有按钮但函数缺失）
// 改进3: openEnergyAnomalyControlModal() - 能耗异常自动调控（页面有按钮但函数缺失）
// 改进4: openEnergyForecastModal() - 能耗预测分析（页面有按钮但函数缺失）
// 改进5: openEnergyAnalysisModal() - 能耗详细数据分析（页面有按钮但函数缺失）
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：openRoleAuditLogModal - 角色权限变更日志 ----------
  window.openRoleAuditLogModal = function() {
    var existing = document.getElementById('modal-role-audit-log');
    if (existing) existing.remove();
    var logs = [
      {time:'2026-03-30 09:15', operator:'李婷', action:'修改', target:'前台角色', before:'只读', after:'可办理入住', module:'角色权限'},
      {time:'2026-03-29 16:42', operator:'王芳', action:'新增', target:'运维角色', before:'-', after:'运维人员（自定义）', module:'角色权限'},
      {time:'2026-03-29 11:20', operator:'李婷', action:'删除', target:'临时角色', before:'临时访客权限', after:'-', module:'角色权限'},
      {time:'2026-03-28 14:08', operator:'系统', action:'启用', target:'管理员角色', before:'禁用', after:'启用', module:'角色权限'},
      {time:'2026-03-27 10:33', operator:'王芳', action:'修改', target:'前台角色', before:'无设备权限', after:'含设备查看权限', module:'角色权限'},
      {time:'2026-03-26 15:55', operator:'李婷', action:'新增', target:'客房角色', before:'-', after:'客房人员（自定义）', module:'角色权限'}
    ];
    var actionColor = {新增:'green', 修改:'blue', 删除:'red', 启用:'purple', 禁用:'orange'};
    var rows = logs.map(function(l) {
      var color = actionColor[l.action] || 'gray';
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 12px;font-size:12px;color:var(--text-muted);">' + l.time + '</td>' +
        '<td style="padding:10px 12px;font-size:12px;font-weight:600;">' + l.operator + '</td>' +
        '<td style="padding:10px 12px;"><span class="tbadge" style="background:var(--' + color + '-bg);color:var(--' + color + ');font-size:11px;padding:2px 8px;border-radius:10px;">' + l.action + '</span></td>' +
        '<td style="padding:10px 12px;font-size:12px;font-weight:600;">' + l.target + '</td>' +
        '<td style="padding:10px 12px;font-size:11px;color:var(--text-muted);">' + l.before + '</td>' +
        '<td style="padding:10px 12px;font-size:11px;color:var(--green);">→ ' + l.after + '</td>' +
        '<td style="padding:10px 12px;font-size:11px;color:var(--purple);">' + l.module + '</td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-role-audit-log" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-role-audit-log\').remove()">' +
      '<div class="modal" style="width:780px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
      '<div style="font-size:24px;">📜</div><div><div style="font-size:15px;font-weight:700;">权限变更日志</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">记录所有角色权限的修改操作</div></div>' +
      '<button onclick="document.getElementById(\'modal-role-audit-log\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="overflow-y:auto;flex:1;">' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<thead style="background:var(--bg);position:sticky;top:0;z-index:1;"><tr>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">时间</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">操作人</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">操作</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">对象</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">变更前</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">变更后</th>' +
      '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">模块</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;flex-shrink:0;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-role-audit-log\').remove()">关闭</button>' +
      '<button class="modal-btn" onclick="exportRoleAuditLog()" style="background:var(--green);color:white;border:none;">📤 导出日志</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // exportRoleAuditLog - 导出权限变更日志
  window.exportRoleAuditLog = function() {
    showToast('📤 权限变更日志已导出（6条记录）', 'success');
  };

  // ---------- 改进2：openBatchEnergyControlModal - 批量通断电控制 ----------
  window.openBatchEnergyControlModal = function() {
    var existing = document.getElementById('modal-batch-energy');
    if (existing) existing.remove();
    var rooms = [
      {num:'301', type:'亲子间', status:'on', power:8.6}, {num:'302', type:'大床房', status:'on', power:6.2},
      {num:'303', type:'标准间', status:'off', power:0}, {num:'305', type:'商务房', status:'on', power:7.1},
      {num:'306', type:'大床房', status:'on', power:5.8}, {num:'307', type:'标准间', status:'off', power:0}
    ];
    var rows = rooms.map(function(r, i) {
      var checked = r.status === 'on' ? 'checked' : '';
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 12px;"><div style="font-weight:700;color:var(--blue);">' + r.num + '</div><div style="font-size:10px;color:var(--text-muted);">' + r.type + '</div></td>' +
        '<td style="padding:10px 12px;"><span class="tbadge ' + (r.status === 'on' ? 'green' : 'gray') + '">' + (r.status === 'on' ? '通电' : '断电') + '</span></td>' +
        '<td style="padding:10px 12px;font-size:12px;color:var(--text-muted);">' + (r.status === 'on' ? r.power + ' kW' : '-') + '</td>' +
        '<td style="padding:10px 12px;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;font-weight:600;"><input type="checkbox" id="bec-' + i + '" ' + checked + ' style="accent-color:var(--blue);transform:scale(1.2);"> 选择</label></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-batch-energy" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-energy\').remove()">' +
      '<div class="modal" style="width:560px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:24px;">⚡</div><div><div style="font-size:15px;font-weight:700;">批量通断电控制</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">批量控制房间电源，支持定时任务</div></div>' +
      '<button onclick="document.getElementById(\'modal-batch-energy\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 20px;">' +
      '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
      '<button class="modal-btn secondary" onclick="batchPowerOn()" style="flex:1;padding:8px;">🔌 批量通电</button>' +
      '<button class="modal-btn" onclick="batchPowerOff()" style="flex:1;padding:8px;background:var(--orange);color:white;border:none;">⚠️ 批量断电</button>' +
      '</div>' +
      '<div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-muted);">' +
      '<input type="checkbox" id="bec-select-all" onchange="toggleAllBatchEnergy(this.checked)" style="accent-color:var(--blue);"> 全选/取消全选' +
      '<span style="margin-left:auto;">已选 <span id="bec-count" style="color:var(--blue);font-weight:700;">0</span> 个房间</span></div>' +
      '<div style="max-height:280px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;">' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<thead style="background:var(--bg);position:sticky;top:0;"><tr><th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">房间</th><th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">状态</th><th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">功率</th><th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">操作</th></tr></thead>' +
      '<tbody id="bec-rooms-body">' + rows + '</tbody></table></div>' +
      '</div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-energy\').remove()">取消</button>' +
      '<button class="modal-btn primary" onclick="confirmBatchEnergyControl()">✅ 确认执行</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.toggleAllBatchEnergy = function(checked) {
    document.querySelectorAll('#bec-rooms-body input[type="checkbox"]').forEach(function(el) { el.checked = checked; });
    updateBatchEnergyCount();
  };

  window.updateBatchEnergyCount = function() {
    var count = document.querySelectorAll('#bec-rooms-body input[type="checkbox"]:checked').length;
    var el = document.getElementById('bec-count');
    if (el) el.textContent = count;
  };

  window.batchPowerOn = function() {
    document.querySelectorAll('#bec-rooms-body input[type="checkbox"]').forEach(function(el) { el.checked = true; });
    updateBatchEnergyCount();
    showToast('⚡ 已选中所有房间，待执行通电', 'info');
  };

  window.batchPowerOff = function() {
    document.querySelectorAll('#bec-rooms-body input[type="checkbox"]').forEach(function(el) { el.checked = false; });
    updateBatchEnergyCount();
    showToast('⚠️ 已取消全选，请手动选择需要断电的房间', 'warning');
  };

  window.confirmBatchEnergyControl = function() {
    var selected = document.querySelectorAll('#bec-rooms-body input[type="checkbox"]:checked');
    if (selected.length === 0) {
      showToast('请至少选择一个房间', 'error');
      return;
    }
    document.getElementById('modal-batch-energy').remove();
    showToast('⚡ 批量控制指令已下发（' + selected.length + '个房间），预计10秒内生效', 'success');
  };

  // ---------- 改进3：openEnergyAnomalyControlModal - 能耗异常调控 ----------
  window.openEnergyAnomalyControlModal = function(room, power, reason) {
    var existing = document.getElementById('modal-energy-anomaly');
    if (existing) existing.remove();
    var room = room || '301';
    var power = power || 8.6;
    var reason = reason || '空调持续运行，耗电异常偏高';
    var html = '<div class="modal-overlay" id="modal-energy-anomaly" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-anomaly\').remove()">' +
      '<div class="modal" style="width:480px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:24px;">⚠️</div><div><div style="font-size:15px;font-weight:700;">能耗异常调控 - ' + room + '房间</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">检测到异常高耗能设备，自动生成调控策略</div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-anomaly\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div style="background:var(--red-bg);border:1px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">' +
      '<div style="font-size:12px;color:var(--red);font-weight:600;margin-bottom:4px;">⚠️ 异常详情</div>' +
      '<div style="font-size:13px;color:var(--text);">房间号：' + room + '</div>' +
      '<div style="font-size:13px;color:var(--text);">当前功率：<span style="color:var(--red);font-weight:700;">' + power + ' kW</span></div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">原因：' + reason + '</div></div>' +
      '<div class="form-group"><label class="form-label">调控策略</label>' +
      '<select class="form-select" id="eac-strategy" style="width:100%;">' +
      '<option value="temp_off">⏱️ 临时断电（30分钟后自动恢复）</option>' +
      '<option value="temp_set">🌡️ 温度上调2℃（节能模式）</option>' +
      '<option value="schedule_off">📅 定时断电（22:00自动断电）</option>' +
      '<option value="notify">🔔 发送告警通知给住户</option>' +
      '</select></div>' +
      '<div class="form-group"><label class="form-label">执行时间</label>' +
      '<select class="form-select" id="eac-time" style="width:100%;">' +
      '<option value="now">立即执行</option>' +
      '<option value="5min">5分钟后执行</option>' +
      '<option value="30min">30分钟后执行</option>' +
      '</select></div>' +
      '<div class="form-group"><label class="form-label">备注</label>' +
      '<textarea class="form-input" id="eac-remark" style="resize:vertical;min-height:60px;" placeholder="可选备注..."></textarea></div>' +
      '</div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-anomaly\').remove()">取消</button>' +
      '<button class="modal-btn primary" onclick="confirmEnergyAnomalyControl(\'' + room + '\')" style="background:var(--orange);border-color:var(--orange);">⚠️ 确认调控</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.confirmEnergyAnomalyControl = function(room) {
    var strategy = document.getElementById('eac-strategy') ? document.getElementById('eac-strategy').value : 'temp_set';
    var strategyMap = {temp_off:'临时断电', temp_set:'温度节能', schedule_off:'定时断电', notify:'发送通知'};
    document.getElementById('modal-energy-anomaly').remove();
    showToast('⚠️ 房间' + room + '调控策略"' + (strategyMap[strategy] || strategy) + '"已下发，预计1分钟内生效', 'success');
  };

  // ---------- 改进4：openEnergyForecastModal - 能耗预测分析 ----------
  window.openEnergyForecastModal = function() {
    var existing = document.getElementById('modal-energy-forecast');
    if (existing) existing.remove();
    var days = ['今天', '明天', '后天', '大后天', '周五', '周六', '周日'];
    var forecasts = [
      {day:'今天', temp:24, humidity:65, power:48.2, cost:25.1, trend:'up', trendText:'较昨日+6%'},
      {day:'明天', temp:25, humidity:62, power:52.0, cost:27.0, trend:'up', trendText:'较昨日+12%'},
      {day:'后天', temp:26, humidity:60, power:55.5, cost:28.9, trend:'up', trendText:'较昨日+15%'},
      {day:'大后天', temp:24, humidity:64, power:49.0, cost:25.5, trend:'down', trendText:'较昨日-6%'},
      {day:'周五', temp:23, humidity:68, power:45.0, cost:23.4, trend:'down', trendText:'较昨日-12%'},
      {day:'周六', temp:22, humidity:70, power:42.0, cost:21.8, trend:'down', trendText:'较昨日-15%'},
      {day:'周日', temp:22, humidity:69, power:43.0, cost:22.4, trend:'down', trendText:'较昨日-5%'}
    ];
    var rows = forecasts.map(function(f, i) {
      var trendIcon = f.trend === 'up' ? '📈' : '📉';
      var trendColor = f.trend === 'up' ? 'var(--red)' : 'var(--green)';
      return '<tr style="border-bottom:1px solid var(--border);' + (i === 0 ? 'background:var(--blue-bg);' : '') + '">' +
        '<td style="padding:10px 12px;font-weight:700;' + (i === 0 ? 'color:var(--blue);' : '') + '">' + f.day + '</td>' +
        '<td style="padding:10px 12px;font-size:12px;">' + f.temp + '°C</td>' +
        '<td style="padding:10px 12px;font-size:12px;">' + f.humidity + '%</td>' +
        '<td style="padding:10px 12px;font-weight:700;">' + f.power + ' kWh</td>' +
        '<td style="padding:10px 12px;color:var(--orange);font-weight:600;">¥' + f.cost + '</td>' +
        '<td style="padding:10px 12px;font-size:12px;color:' + trendColor + ';">' + trendIcon + ' ' + f.trendText + '</td></tr>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-energy-forecast" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-forecast\').remove()">' +
      '<div class="modal" style="width:600px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
      '<div style="font-size:24px;">📈</div><div><div style="font-size:15px;font-weight:700;">能耗预测分析</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">基于历史数据和天气趋势的7天能耗预测</div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-forecast\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;gap:12px;flex-shrink:0;">' +
      '<div style="flex:1;background:var(--blue-bg);border-radius:8px;padding:10px 14px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--blue);margin-bottom:4px;">预测周总用电</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--blue);">334.7 kWh</div></div>' +
      '<div style="flex:1;background:var(--orange-bg);border-radius:8px;padding:10px 14px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--orange);margin-bottom:4px;">预测周总费用</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--orange);">¥174.1</div></div>' +
      '<div style="flex:1;background:var(--green-bg);border-radius:8px;padding:10px 14px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--green);margin-bottom:4px;">节能空间</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--green);">12%</div></div></div>' +
      '<div style="overflow-y:auto;flex:1;padding:0 4px;">' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<thead style="background:var(--bg);position:sticky;top:0;z-index:1;"><tr>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">日期</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">温度</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">湿度</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">预测用电</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">预测费用</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">趋势</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-forecast\').remove()">关闭</button>' +
      '<button class="modal-btn" onclick="applyEnergySavingPlan()" style="background:var(--green);color:white;border:none;">🌿 应用节能方案</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.applyEnergySavingPlan = function() {
    document.getElementById('modal-energy-forecast').remove();
    showToast('🌿 节能方案已应用，预计本周节电12%（约40 kWh，节省¥21）', 'success');
  };

  // ---------- 改进5：openEnergyAnalysisModal - 能耗详细数据分析 ----------
  window.openEnergyAnalysisModal = function(room) {
    var existing = document.getElementById('modal-energy-analysis');
    if (existing) existing.remove();
    var room = room || '全部房间';
    var equipData = [
      {name:'空调', power:28.5, percent:59, color:'#1890ff', status:'运行中'},
      {name:'照明', power:8.2, percent:17, color:'#fa8c16', status:'正常'},
      {name:'热水器', power:6.8, percent:14, color:'#52c41a', status:'运行中'},
      {name:'电视/插座', power:4.7, percent:10, color:'#722ed1', status:'正常'}
    ];
    var pieRows = equipData.map(function(e) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + e.color + ';flex-shrink:0;"></div>' +
        '<div style="flex:1;font-size:12px;font-weight:600;">' + e.name + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + e.power + ' kW</div>' +
        '<div style="width:60px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">' +
        '<div style="width:' + e.percent + '%;height:100%;background:' + e.color + ';border-radius:3px;"></div></div>' +
        '<div style="font-size:11px;color:var(--text-muted);width:30px;text-align:right;">' + e.percent + '%</div></div>';
    }).join('');
    var html = '<div class="modal-overlay" id="modal-energy-analysis" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-analysis\').remove()">' +
      '<div class="modal" style="width:580px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
      '<div style="font-size:24px;">📊</div><div><div style="font-size:15px;font-weight:700;">能耗详细数据分析</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + room + ' · 今日实时数据</div></div>' +
      '<button onclick="document.getElementById(\'modal-energy-analysis\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="overflow-y:auto;flex:1;padding:16px 20px;">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">' +
      '<div style="background:var(--blue-bg);border-radius:8px;padding:12px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--blue);margin-bottom:4px;">今日用电</div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--blue);">48.2 kWh</div></div>' +
      '<div style="background:var(--orange-bg);border-radius:8px;padding:12px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--orange);margin-bottom:4px;">今日费用</div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--orange);">¥25.1</div></div>' +
      '<div style="background:var(--green-bg);border-radius:8px;padding:12px;text-align:center;">' +
      '<div style="font-size:11px;color:var(--green);margin-bottom:4px;">房间均耗</div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--green);">6.0 kWh</div></div></div>' +
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">⚡ 设备用电分布</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--bg);">' + pieRows + '</div></div>' +
      '<div>' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">💡 节能建议</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<div style="display:flex;align-items:flex-start;gap:8px;padding:10px;background:var(--green-bg);border-radius:8px;border:1px solid var(--green);">' +
      '<span style="font-size:16px;flex-shrink:0;">🌡️</span><div><div style="font-size:12px;font-weight:600;color:var(--green);">空调温度优化</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">建议将温度从24°C调至26°C，预期节电15%（约7 kWh/天）</div></div></div>' +
      '<div style="display:flex;align-items:flex-start;gap:8px;padding:10px;background:var(--blue-bg);border-radius:8px;border:1px solid var(--blue);">' +
      '<span style="font-size:16px;flex-shrink:0;">⏰</span><div><div style="font-size:12px;font-weight:600;color:var(--blue);">定时开关策略</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">在23:00-07:00设置节能模式，预期节电8%（约4 kWh/天）</div></div></div></div></div></div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-analysis\').remove()">关闭</button>' +
      '<button class="modal-btn" onclick="exportEnergyAnalysis()" style="background:var(--green);color:white;border:none;">📤 导出分析报告</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.exportEnergyAnalysis = function() {
    showToast('📤 能耗分析报告已导出（PDF格式）', 'success');
  };

})();
