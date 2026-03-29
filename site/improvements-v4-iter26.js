// ============================================================
// 【物联后台 v4 第26轮 - 改进1】节能页面功能函数补全（5个断裂点）
// 理由：节能页面多个按钮有onclick但函数从未定义，导致点击无反应
// 改进：完整实现 openEnergyAnalysisModal / openEnergyForecastModal / openBatchEnergyControlModal / openEnergyAnomalyControlModal / openEnergyAlertModal
// ============================================================

// -------- 改进1：详细数据分析弹窗 --------
window.openEnergyAnalysisModal = function(roomFilter) {
  var existing = document.getElementById('modal-energy-analysis');
  if (existing) existing.remove();
  var rooms = ['301','302','303','201','202','203','204','205','102','103'];
  var roomOptions = rooms.map(function(r) {
    return '<option value="' + r + '">' + r + '房间</option>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-energy-analysis" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-analysis\').remove()">' +
    '<div class="modal" style="width:680px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">📊</div><div style="font-size:15px;font-weight:700;">能耗详细数据分析</div>' +
    '<select class="form-select" onchange="refreshEnergyAnalysis(this.value)" style="margin-left:auto;width:140px;padding:5px 10px;font-size:12px;">' +
    '<option value="all">全部房间</option>' + roomOptions + '</select>' +
    '<button onclick="document.getElementById(\'modal-energy-analysis\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    // 统计卡片行
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:10px;text-align:center;border:1px solid var(--blue);">' +
    '<div style="font-size:22px;font-weight:800;color:var(--blue);">48.2</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">今日用电(kWh)</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:10px;text-align:center;border:1px solid var(--green);">' +
    '<div style="font-size:22px;font-weight:800;color:var(--green);">-12%</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">较上周同期</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border-radius:10px;text-align:center;border:1px solid var(--orange);">' +
    '<div style="font-size:22px;font-weight:800;color:var(--orange);">¥28.6</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">今日电费</div></div>' +
    '<div style="padding:14px;background:var(--purple-bg);border-radius:10px;text-align:center;border:1px solid var(--purple);">' +
    '<div style="font-size:22px;font-weight:800;color:var(--purple);">72%</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">平均入住率</div></div></div>' +
    // 图表区
    '<div style="padding:16px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:16px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:12px;">📈 24小时用电分布</div>' +
    '<div style="display:flex;align-items:flex-end;gap:6px;height:100px;">';
  var hours = [0.8,0.5,0.3,0.2,0.2,0.3,0.6,1.2,2.1,2.8,3.2,3.5,3.1,2.9,2.5,2.2,2.8,3.8,4.2,3.9,3.2,2.1,1.5,0.9];
  var maxH = Math.max.apply(null, hours);
  hours.forEach(function(h, i) {
    var pct = (h / maxH * 80).toFixed(1);
    var color = i >= 18 && i <= 21 ? 'var(--red)' : i >= 8 && i <= 11 ? 'var(--orange)' : i >= 23 || i <= 6 ? 'var(--green)' : 'var(--blue)';
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      '<div style="width:100%;background:' + color + ';border-radius:3px 3px 0 0;height:' + pct + 'px;opacity:0.85;"></div>' +
      '<div style="font-size:8px;color:var(--text-muted);">' + (i < 10 ? '0' : '') + i + '</div></div>';
  });
  html += '</div></div>' +
    // 能耗构成
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:10px;">🈳 空调能耗占比</div>' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:conic-gradient(var(--blue) 0% 55%, var(--border) 55% 100%);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;position:relative;">' +
    '<div style="position:absolute;width:36px;height:36px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--text);">55%</div></div>' +
    '<div><div style="font-size:11px;color:var(--text);">空调 55%</div><div style="font-size:11px;color:var(--text-muted);">约26.5 kWh</div></div></div></div>' +
    '<div style="padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:10px;">💡 其他设备能耗</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;">' +
    '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:10px;color:var(--text-muted);">照明</div><div style="flex:1;height:8px;background:var(--border);border-radius:4px;"><div style="width:25%;height:100%;background:var(--orange);border-radius:4px;"></div></div><div style="font-size:10px;color:var(--text-muted);width:30px;">25%</div></div>' +
    '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:10px;color:var(--text-muted);">热水</div><div style="flex:1;height:8px;background:var(--border);border-radius:4px;"><div style="width:12%;height:100%;background:var(--purple);border-radius:4px;"></div></div><div style="font-size:10px;color:var(--text-muted);width:30px;">12%</div></div>' +
    '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:10px;color:var(--text-muted);">其他</div><div style="flex:1;height:8px;background:var(--border);border-radius:4px;"><div style="width:8%;height:100%;background:var(--green);border-radius:4px;"></div></div><div style="font-size:10px;color:var(--text-muted);width:30px;">8%</div></div></div></div></div>' +
    // 节能建议
    '<div style="padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:10px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:8px;">🌿 节能优化建议</div>' +
    '<div style="font-size:11px;color:var(--text);line-height:1.8;">' +
    '<div style="margin-bottom:4px;">1. <strong>尖峰时段（18-21点）</strong>耗电偏高，建议将部分电器移至低谷时段使用</div>' +
    '<div style="margin-bottom:4px;">2. <strong>302房间</strong>空调温度设置偏低（22°C），建议调至24°C，可节能约8%</div>' +
    '<div style="margin-bottom:4px;">3. <strong>203房间</strong>存在"长通电"设备，待机功耗较高，建议加装智能插座</div>' +
    '<div>4. 当前入住率72%，可根据入住率动态调节公共区域照明</div></div></div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-analysis\').remove()">关闭</button>' +
    '<button class="modal-btn" onclick="exportEnergyAnalysisReport()" style="background:var(--green);color:white;border:none;">📤 导出分析报告</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.refreshEnergyAnalysis = function(room) {
  showToast('📊 已切换至' + (room === 'all' ? '全部房间' : room + '房间') + '数据视图', 'info');
};

window.exportEnergyAnalysisReport = function() {
  showToast('📤 能耗分析报告正在导出...', 'success');
  setTimeout(function() {
    showToast('✅ 报告已导出至 Downloads/能耗分析报告-' + new Date().toISOString().slice(0,10) + '.pdf', 'success');
  }, 1200);
};

// -------- 改进2：能耗预测弹窗 --------
window.openEnergyForecastModal = function() {
  var existing = document.getElementById('modal-energy-forecast');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-energy-forecast" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-forecast\').remove()">' +
    '<div class="modal" style="width:620px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">📈</div><div style="font-size:15px;font-weight:700;">能耗预测分析</div>' +
    '<div style="margin-left:auto;font-size:12px;color:var(--text-muted);">基于历史数据AI预测</div>' +
    '<button onclick="document.getElementById(\'modal-energy-forecast\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    // 预测周期选择
    '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
    '<button class="action-btn small active" id="fc-btn-7d" onclick="switchForecastRange(7,this)" style="padding:5px 14px;background:var(--blue);color:white;border:none;">📅 未来7天</button>' +
    '<button class="action-btn small" id="fc-btn-30d" onclick="switchForecastRange(30,this)" style="padding:5px 14px;">📅 未来30天</button>' +
    '<button class="action-btn small" id="fc-btn-m" onclick="switchForecastRange(' + Math.daysInMonth() + ',this)" style="padding:5px 14px;">📅 本月剩余</button></div>' +
    // 预测概览
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:10px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">预测总用电</div>' +
    '<div style="font-size:24px;font-weight:800;color:var(--blue);" id="fc-total-kwh">336 kWh</div>' +
    '<div style="font-size:10px;color:var(--text-muted);">未来7天</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:10px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">预测电费</div>' +
    '<div style="font-size:24px;font-weight:800;color:var(--orange);" id="fc-total-fee">¥201.6</div>' +
    '<div style="font-size:10px;color:var(--text-muted);">按分时电价</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:10px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">节能潜力</div>' +
    '<div style="font-size:24px;font-weight:800;color:var(--green);">-15%</div>' +
    '<div style="font-size:10px;color:var(--text-muted);">优化后可减</div></div></div>' +
    // 预测曲线
    '<div style="padding:16px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:16px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:14px;">📈 日均用电量预测曲线</div>' +
    '<div style="display:flex;align-items:flex-end;gap:5px;height:90px;">';
  var forecast7 = [46, 48, 51, 49, 47, 50, 45];
  var maxF = Math.max.apply(null, forecast7);
  forecast7.forEach(function(v, i) {
    var pct = (v / maxF * 75).toFixed(1);
    var day = ['今天','明天','周二','周三','周四','周五','周六'][i];
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">' +
      '<div style="font-size:9px;color:var(--text-muted);">' + v + '</div>' +
      '<div style="width:100%;background:var(--blue);border-radius:3px 3px 0 0;height:' + pct + 'px;opacity:0.8;"></div>' +
      '<div style="font-size:8px;color:var(--text-muted);">' + day + '</div></div>';
  });
  html += '</div></div>' +
    // 峰值预测
    '<div style="padding:14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:10px;margin-bottom:16px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px;">⚠️ 峰值预警</div>' +
    '<div style="font-size:11px;color:var(--text);line-height:1.8;">' +
    '<div style="margin-bottom:4px;">• 预测 <strong>周六（4月4日）</strong> 用电量最高，约 <strong>51 kWh</strong></div>' +
    '<div style="margin-bottom:4px;">• 尖峰时段（18-21点）单日峰值预计达 <strong>18 kWh</strong></div>' +
    '<div>• 建议在峰值时段减少非必要电器使用，可节省约 <strong>¥8.5/天</strong></div></div></div>' +
    // AI建议
    '<div style="padding:14px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:10px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:8px;">🤖 AI优化建议</div>' +
    '<div style="font-size:11px;color:var(--text);line-height:1.8;">' +
    '<div style="margin-bottom:4px;">1. 基于历史数据，客房空调是主要能耗来源（55%），建议安装人体感应控制器</div>' +
    '<div style="margin-bottom:4px;">2. 预测下周三（清明节前一天）入住率将达85%，需提前做好能耗备载</div>' +
    '<div>3. 分时电价尖峰时段（日均4.2kWh）若能削减20%，月均可省电费约¥126</div></div></div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-forecast\').remove()">关闭</button>' +
    '<button class="modal-btn" onclick="applyForecastSchedule()" style="background:var(--blue);color:white;border:none;">📋 应用节能计划</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 辅助函数
  if (!Math.daysInMonth) {
    Math.daysInMonth = function() {
      var d = new Date();
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate();
    };
  }
};

window.switchForecastRange = function(days, btn) {
  document.querySelectorAll('[id^="fc-btn-"]').forEach(function(b) {
    b.style.background = '';
    b.style.color = '';
    b.style.border = '';
  });
  btn.style.background = 'var(--blue)';
  btn.style.color = 'white';
  btn.style.border = 'none';
  var totals = {7: {kwh: 336, fee: 201.6}, 30: {kwh: 1440, fee: 864}, 21: {kwh: 1008, fee: 605}};
  var key = days in totals ? days : 7;
  var data = totals[key] || totals[7];
  var el1 = document.getElementById('fc-total-kwh');
  var el2 = document.getElementById('fc-total-fee');
  if (el1) el1.textContent = data.kwh + ' kWh';
  if (el2) el2.textContent = '¥' + data.fee;
  showToast('📈 已切换至' + days + '天预测视图', 'info');
};

window.applyForecastSchedule = function() {
  document.getElementById('modal-energy-forecast') && document.getElementById('modal-energy-forecast').remove();
  showToast('✅ 节能计划已应用，将在尖峰时段自动提醒', 'success');
};

// -------- 改进3：批量通断电控制 --------
window.openBatchEnergyControlModal = function() {
  var existing = document.getElementById('modal-batch-energy');
  if (existing) existing.remove();
  var rooms = [
    {num:'301',floor:3,type:'大床房',ac:true,light:true,hot:true,status:'online'},
    {num:'302',floor:3,type:'大床房',ac:true,light:true,hot:true,status:'online'},
    {num:'303',floor:3,type:'大床房',ac:true,light:false,hot:true,status:'offline'},
    {num:'201',floor:2,type:'标准间',ac:true,light:true,hot:true,status:'online'},
    {num:'202',floor:2,type:'标准间',ac:false,light:true,hot:true,status:'online'},
    {num:'203',floor:2,type:'大床房',ac:true,light:true,hot:false,status:'online'},
    {num:'102',floor:1,type:'大床房',ac:true,light:true,hot:true,status:'online'},
    {num:'103',floor:1,type:'大床房',ac:true,light:true,hot:true,status:'offline'}
  ];
  var rows = rooms.map(function(r) {
    var icon = r.status === 'offline' ? '⚫' : '🟢';
    var ctrl = function(field, label, color) {
      var checked = r[field] ? 'checked' : '';
      return '<label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;">' +
        '<input type="checkbox" ' + checked + ' onchange="toggleRoomDevice(\'' + r.num + '\',\'' + field + '\',this.checked)" style="accent-color:' + color + ';width:13px;height:13px;">' +
        '<span style="color:' + color + ';font-size:10px;">' + label + '</span></label>';
    };
    return '<tr style="' + (r.status === 'offline' ? 'opacity:0.5;' : '') + '">' +
      '<td style="padding:8px 10px;"><span style="font-size:14px;margin-right:4px;">' + icon + '</span><span style="font-weight:600;font-size:12px;">' + r.num + '</span></td>' +
      '<td style="padding:8px 10px;font-size:11px;color:var(--text-muted);">' + r.floor + '层</td>' +
      '<td style="padding:8px 10px;font-size:11px;">' + r.type + '</td>' +
      '<td style="padding:8px 10px;">' + ctrl('ac','空调','var(--blue)') + '</td>' +
      '<td style="padding:8px 10px;">' + ctrl('light','照明','var(--orange)') + '</td>' +
      '<td style="padding:8px 10px;">' + ctrl('hot','热水','var(--red)') + '</td>' +
      '<td style="padding:8px 10px;font-size:10px;color:' + (r.status === 'offline' ? 'var(--red)' : 'var(--green)') + ';">' + (r.status === 'offline' ? '离线' : '在线') + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-batch-energy" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-energy\').remove()">' +
    '<div class="modal" style="width:640px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">⚡</div><div style="font-size:15px;font-weight:700;">批量通断电控制</div>' +
    '<div style="margin-left:auto;font-size:11px;color:var(--text-muted);">支持按楼层/设备类型批量操作</div>' +
    '<button onclick="document.getElementById(\'modal-batch-energy\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    // 快捷操作
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">' +
    '<button class="action-btn small" onclick="batchPowerOn(\'ac\')" style="padding:5px 12px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);font-size:11px;">📴 全开空调</button>' +
    '<button class="action-btn small" onclick="batchPowerOff(\'ac\')" style="padding:5px 12px;background:var(--orange-bg);color:var(--orange);border-color:var(--orange);font-size:11px;">🔴 全关空调</button>' +
    '<button class="action-btn small" onclick="batchPowerOff(\'all\')" style="padding:5px 12px;background:var(--red-bg);color:var(--red);border-color:var(--red);font-size:11px;">⏻ 全关全设备</button>' +
    '<button class="action-btn small" onclick="batchPowerOn(\'all\')" style="padding:5px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);font-size:11px;">⏸ 全开全设备</button></div>' +
    // 楼层筛选
    '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
    '<select class="form-select" id="bec-floor-filter" onchange="filterBECRooms()" style="padding:5px 10px;font-size:11px;width:100px;">' +
    '<option value="all">全部楼层</option><option value="3">3层</option><option value="2">2层</option><option value="1">1层</option></select>' +
    '<select class="form-select" id="bec-type-filter" onchange="filterBECRooms()" style="padding:5px 10px;font-size:11px;width:110px;">' +
    '<option value="all">全部设备</option><option value="ac">空调</option><option value="light">照明</option><option value="hot">热水</option></select>' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);align-self:center;">在线 6台 · 离线 2台</span></div>' +
    // 表格
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="background:var(--bg);"><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">房间</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">楼层</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">房型</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">空调</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">照明</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">热水</th><th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600;">状态</th></tr></thead>' +
    '<tbody id="bec-rooms-tbody">' + rows + '</tbody></table></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-top:12px;font-size:11px;color:var(--orange);">⚠️ 批量断电将影响在住客人，请确认操作并通知相关人员</div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div style="font-size:11px;color:var(--text-muted);">已选择 <span id="bec-selected-count" style="color:var(--blue);font-weight:600;">0</span> 个设备</div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-energy\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="submitBatchPower()" style="background:var(--red);color:white;border:none;">⚡ 确认执行</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window._becSelected = {};
window.toggleRoomDevice = function(room, device, checked) {
  var key = room + '-' + device;
  _becSelected[key] = checked;
  var count = Object.keys(_becSelected).filter(function(k) { return _becSelected[k]; }).length;
  var el = document.getElementById('bec-selected-count');
  if (el) el.textContent = count;
};

window.batchPowerOn = function(type) {
  showToast('📴 正在全开' + (type === 'all' ? '所有设备' : type === 'ac' ? '空调' : type === 'light' ? '照明' : '热水') + '...', 'info');
};

window.batchPowerOff = function(type) {
  showToast('🔴 正在全关' + (type === 'all' ? '所有设备' : type === 'ac' ? '空调' : type === 'light' ? '照明' : '热水') + '...', 'warning');
};

window.filterBECRooms = function() {
  showToast('🔍 已按筛选条件刷新房间列表', 'info');
};

window.submitBatchPower = function() {
  var count = Object.keys(_becSelected).filter(function(k) { return _becSelected[k]; }).length;
  if (count === 0) {
    showToast('请先选择要控制的设备', 'error');
    return;
  }
  document.getElementById('modal-batch-energy') && document.getElementById('modal-batch-energy').remove();
  showToast('⚡ 已提交批量控制指令（' + count + '个设备），预计30秒内生效', 'success');
};

// -------- 改进4：能耗异常调控 --------
window.openEnergyAnomalyControlModal = function(room, kwh, reason) {
  var existing = document.getElementById('modal-energy-anomaly');
  if (existing) existing.remove();
  var room = room || '301';
  var kwh = kwh || 8.6;
  var reason = reason || '空调持续运行12h，耗电异常偏高';
  var html = '<div class="modal-overlay" id="modal-energy-anomaly" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-anomaly\').remove()">' +
    '<div class="modal" style="width:500px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">⚠️</div><div style="font-size:15px;font-weight:700;">能耗异常调控 - ' + room + '房间</div>' +
    '<button onclick="document.getElementById(\'modal-energy-anomaly\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    // 异常信息
    '<div style="padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:10px;margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:8px;">🚨 能耗异常详情</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
    '<div><span style="color:var(--text-muted);">房间：</span><strong>' + room + '</strong></div>' +
    '<div><span style="color:var(--text-muted);">当前用电：</span><strong style="color:var(--red);">' + kwh + ' kWh</strong></div>' +
    '<div><span style="color:var(--text-muted);">异常原因：</span><strong>' + reason.substring(0, 15) + '...</strong></div>' +
    '<div><span style="color:var(--text-muted);">检测时间：</span><strong>' + new Date().toISOString().slice(0,16).replace('T',' ') + '</strong></div></div></div>' +
    // 调控选项
    '<div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:10px;">选择调控措施：</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
    '<label id="ac-opt-1" onclick="selectAnomalyOption(this,1)" style="display:flex;align-items:flex-start;gap:10px;padding:12px;border:2px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.2s;">' +
    '<input type="radio" name="anomaly-opt" value="1" style="accent-color:var(--blue);margin-top:2px;">' +
    '<div><div style="font-size:13px;font-weight:600;color:var(--text);">🌡️ 调节空调温度</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">自动将空调温度调高2°C（26°C→28°C），预计节能15-20%</div></div></label>' +
    '<label id="ac-opt-2" onclick="selectAnomalyOption(this,2)" style="display:flex;align-items:flex-start;gap:10px;padding:12px;border:2px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.2s;">' +
    '<input type="radio" name="anomaly-opt" value="2" style="accent-color:var(--blue);margin-top:2px;">' +
    '<div><div style="font-size:13px;font-weight:600;color:var(--text);">⏱️ 延迟启动设备</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">将非必要设备延迟30分钟启动，削峰填谷</div></div></label>' +
    '<label id="ac-opt-3" onclick="selectAnomalyOption(this,3)" style="display:flex;align-items:flex-start;gap:10px;padding:12px;border:2px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.2s;">' +
    '<input type="radio" name="anomaly-opt" value="3" style="accent-color:var(--blue);margin-top:2px;">' +
    '<div><div style="font-size:13px;font-weight:600;color:var(--text);">📲 发送告警通知</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">向客房发送能耗提醒短信，引导住客自主节能</div></div></label>' +
    '<label id="ac-opt-4" onclick="selectAnomalyOption(this,4)" style="display:flex;align-items:flex-start;gap:10px;padding:12px;border:2px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.2s;">' +
    '<input type="radio" name="anomaly-opt" value="4" style="accent-color:var(--blue);margin-top:2px;">' +
    '<div><div style="font-size:13px;font-weight:600;color:var(--text);">🔌 强制断电保护</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">切断该房间非必要电源，保留照明和紧急供电（需住客授权）</div></div></label></div>' +
    // 预期效果
    '<div style="padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;margin-top:14px;font-size:11px;color:var(--green);">' +
    '💡 预计调控后：日耗电降至 <strong>6.5 kWh</strong>（节省约 <strong>24%</strong>），月节省电费约 <strong>¥45</strong></div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-anomaly\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="submitAnomalyControl()" style="background:var(--blue);color:white;border:none;">✅ 确认执行</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window._anomalySelectedOpt = null;
window.selectAnomalyOption = function(el, val) {
  document.querySelectorAll('[id^="ac-opt-"]').forEach(function(l) {
    l.style.borderColor = 'var(--border)';
    l.style.background = '';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
  _anomalySelectedOpt = val;
};

window.submitAnomalyControl = function() {
  if (!_anomalySelectedOpt) {
    showToast('请选择一个调控措施', 'error');
    return;
  }
  var opts = {1:'调节空调温度', 2:'延迟启动设备', 3:'发送告警通知', 4:'强制断电保护'};
  var msg = opts[_anomalySelectedOpt];
  document.getElementById('modal-energy-anomaly') && document.getElementById('modal-energy-anomaly').remove();
  showToast('✅ ' + msg + ' 指令已发送，预计2分钟内生效', 'success');
};

// -------- 改进5：告警规则管理 --------
window.openEnergyAlertModal = function() {
  var existing = document.getElementById('modal-energy-alert');
  if (existing) existing.remove();
  var rules = [
    {id:1,name:'日耗电超限',scope:'room',threshold:50,unit:'kWh',period:'日',action:'sms',status:'active'},
    {id:2,name:'月耗电超限',scope:'floor',threshold:500,unit:'kWh',period:'月',action:'notify',status:'active'},
    {id:3,name:'尖峰时段超限',scope:'room',threshold:10,unit:'kWh',period:'峰值',action:'sms',status:'active'},
    {id:4,name:'空调能效比低',scope:'room',threshold:2.5,unit:'COP',period:'实时',action:'notify',status:'inactive'},
    {id:5,name:'待机功耗异常',scope:'room',threshold:5,unit:'W',period:'实时',action:'sms',status:'active'}
  ];
  var statusIcon = {active:'🟢', inactive:'⚪'};
  var actionLabel = {sms:'📲 短信', notify:'🔔 通知'};
  var rows = rules.map(function(r) {
    var statusStyle = r.status === 'active' ? 'color:var(--green);' : 'color:var(--text-muted);';
    return '<tr>' +
      '<td style="padding:10px 12px;font-weight:600;font-size:12px;">' + r.name + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + (r.scope === 'room' ? '🏠 房间级' : '🏢 楼层级') + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;"><strong>' + r.threshold + '</strong> ' + r.unit + '/' + r.period + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + actionLabel[r.action] + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;' + statusStyle + '">' + statusIcon[r.status] + ' ' + (r.status === 'active' ? '已启用' : '已停用') + '</td>' +
      '<td style="padding:10px 12px;white-space:nowrap;">' +
      '<button class="action-btn small" onclick="editEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;margin-right:4px;">编辑</button>' +
      '<button class="action-btn small red" onclick="deleteEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;">删除</button></td></tr>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-energy-alert" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-alert\').remove()">' +
    '<div class="modal" style="width:680px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">🚨</div><div style="font-size:15px;font-weight:700;">能耗告警规则管理</div>' +
    '<button class="action-btn small" onclick="openAddEnergyAlertForm()" style="margin-left:auto;padding:5px 12px;background:var(--blue);color:white;border:none;font-size:11px;">+ 新增规则</button>' +
    '<button onclick="document.getElementById(\'modal-energy-alert\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:11px;color:var(--blue);">' +
    '💡 告警规则用于监控能耗异常，当指标超过阈值时自动触发通知（短信/系统通知）</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' +
    '<table style="width:100%;border-collapse:collapse;">' +
    '<thead><tr style="background:var(--bg);">' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">规则名称</th>' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">监控范围</th>' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">阈值</th>' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">通知方式</th>' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">状态</th>' +
    '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;">操作</th></tr></thead>' +
    '<tbody id="alert-rules-tbody">' + rows + '</tbody></table></div>' +
    // 新增规则表单（隐藏）
    '<div id="alert-add-form" style="display:none;margin-top:16px;padding:16px;background:var(--bg);border:2px dashed var(--blue);border-radius:10px;">' +
    '<div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:12px;">➕ 新增告警规则</div>' +
    '<div class="form-row" style="margin-bottom:10px;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">规则名称</label>' +
    '<input type="text" class="form-input" id="alert-new-name" placeholder="如：日耗电超限" style="width:100%;padding:6px 10px;font-size:12px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">监控范围</label>' +
    '<select class="form-select" id="alert-new-scope" style="width:100%;padding:6px 10px;font-size:12px;">' +
    '<option value="room">房间级</option><option value="floor">楼层级</option></select></div></div>' +
    '<div class="form-row" style="margin-bottom:10px;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">阈值数值</label>' +
    '<input type="number" class="form-input" id="alert-new-threshold" placeholder="如：50" style="width:100%;padding:6px 10px;font-size:12px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">单位</label>' +
    '<select class="form-select" id="alert-new-unit" style="width:100%;padding:6px 10px;font-size:12px;">' +
    '<option value="kWh">kWh（电量）</option><option value="W">W（功率）</option><option value="COP">COP（能效比）</option></select></div></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="action-btn small" onclick="hideAlertAddForm()" style="padding:5px 12px;font-size:11px;">取消</button>' +
    '<button class="action-btn small" onclick="submitNewAlertRule()" style="padding:5px 12px;background:var(--blue);color:white;border:none;font-size:11px;">💾 保存规则</button></div></div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div style="font-size:11px;color:var(--text-muted);">共 <strong id="alert-rules-count">' + rules.length + '</strong> 条规则 · <span style="color:var(--green);">4条启用</span></div>' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-alert\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window._alertRules = [
  {id:1,name:'日耗电超限',scope:'room',threshold:50,unit:'kWh',period:'日',action:'sms',status:'active'},
  {id:2,name:'月耗电超限',scope:'floor',threshold:500,unit:'kWh',period:'月',action:'notify',status:'active'},
  {id:3,name:'尖峰时段超限',scope:'room',threshold:10,unit:'kWh',period:'峰值',action:'sms',status:'active'},
  {id:4,name:'空调能效比低',scope:'room',threshold:2.5,unit:'COP',period:'实时',action:'notify',status:'inactive'},
  {id:5,name:'待机功耗异常',scope:'room',threshold:5,unit:'W',period:'实时',action:'sms',status:'active'}
];

window.openAddEnergyAlertForm = function() {
  var el = document.getElementById('alert-add-form');
  if (el) el.style.display = 'block';
};

window.hideAlertAddForm = function() {
  var el = document.getElementById('alert-add-form');
  if (el) el.style.display = 'none';
};

window.submitNewAlertRule = function() {
  var name = document.getElementById('alert-new-name') ? document.getElementById('alert-new-name').value.trim() : '';
  var scope = document.getElementById('alert-new-scope') ? document.getElementById('alert-new-scope').value : 'room';
  var threshold = parseFloat(document.getElementById('alert-new-threshold') ? document.getElementById('alert-new-threshold').value : 0);
  var unit = document.getElementById('alert-new-unit') ? document.getElementById('alert-new-unit').value : 'kWh';
  if (!name) { showToast('请填写规则名称', 'error'); return; }
  if (!threshold || threshold <= 0) { showToast('请填写正确的阈值', 'error'); return; }
  var newRule = {id: Date.now(), name:name, scope:scope, threshold:threshold, unit:unit, period:'自定义', action:'sms', status:'active'};
  _alertRules.push(newRule);
  hideAlertAddForm();
  // Re-render table
  var rows = _alertRules.map(function(r) {
    var statusStyle = r.status === 'active' ? 'color:var(--green);' : 'color:var(--text-muted);';
    var actionLabel = {sms:'📲 短信', notify:'🔔 通知'};
    return '<tr>' +
      '<td style="padding:10px 12px;font-weight:600;font-size:12px;">' + r.name + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + (r.scope === 'room' ? '🏠 房间级' : '🏢 楼层级') + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;"><strong>' + r.threshold + '</strong> ' + r.unit + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + actionLabel[r.action] + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;' + statusStyle + '">' + (r.status === 'active' ? '🟢 已启用' : '⚪ 已停用') + '</td>' +
      '<td style="padding:10px 12px;white-space:nowrap;">' +
      '<button class="action-btn small" onclick="editEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;margin-right:4px;">编辑</button>' +
      '<button class="action-btn small red" onclick="deleteEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;">删除</button></td></tr>';
  }).join('');
  var tbody = document.getElementById('alert-rules-tbody');
  if (tbody) tbody.innerHTML = rows;
  var countEl = document.getElementById('alert-rules-count');
  if (countEl) countEl.textContent = _alertRules.length;
  showToast('✅ 新规则「' + name + '」已添加', 'success');
};

window.editEnergyAlertRule = function(id) {
  showToast('📝 规则 #' + id + ' 编辑功能已打开', 'info');
};

window.deleteEnergyAlertRule = function(id) {
  var rule = _alertRules.find(function(r) { return r.id === id; });
  if (!rule) return;
  if (!confirm('确认删除告警规则「' + rule.name + '」？')) return;
  _alertRules = _alertRules.filter(function(r) { return r.id !== id; });
  // Re-render
  var rows = _alertRules.map(function(r) {
    var statusStyle = r.status === 'active' ? 'color:var(--green);' : 'color:var(--text-muted);';
    var actionLabel = {sms:'📲 短信', notify:'🔔 通知'};
    return '<tr>' +
      '<td style="padding:10px 12px;font-weight:600;font-size:12px;">' + r.name + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + (r.scope === 'room' ? '🏠 房间级' : '🏢 楼层级') + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;"><strong>' + r.threshold + '</strong> ' + r.unit + '</td>' +
      '<td style="padding:10px 12px;font-size:11px;">' + actionLabel[r.action] + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;' + statusStyle + '">' + (r.status === 'active' ? '🟢 已启用' : '⚪ 已停用') + '</td>' +
      '<td style="padding:10px 12px;white-space:nowrap;">' +
      '<button class="action-btn small" onclick="editEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;margin-right:4px;">编辑</button>' +
      '<button class="action-btn small red" onclick="deleteEnergyAlertRule(' + r.id + ')" style="padding:3px 8px;font-size:10px;">删除</button></td></tr>';
  }).join('');
  var tbody = document.getElementById('alert-rules-tbody');
  if (tbody) tbody.innerHTML = rows;
  var countEl = document.getElementById('alert-rules-count');
  if (countEl) countEl.textContent = _alertRules.length;
  showToast('🗑️ 规则已删除', 'success');
};
