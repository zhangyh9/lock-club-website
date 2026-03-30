// ============================================================
// 【物联后台v4-第61轮】5个功能性改进
// ============================================================

// ============================================================
// 【改进1】能源管理 - 楼层用电阈值告警配置
// 理由：能源管理仅有数据展示，缺少楼层用电阈值设置和超标告警功能
// 改进：可设置每个楼层的用电阈值，超标时在卡片上显示红色告警标识，触发Toast提示
// ============================================================
var _energyFloorThresholds = { 'all': 500, '1': 120, '2': 150, '3': 180 };

function openEnergyThresholdModal() {
  var existing = document.getElementById('modal-energy-threshold');
  if (existing) existing.remove();
  var floors = [
    {id: 'all', label: '全部楼层'},
    {id: '1', label: '1层'},
    {id: '2', label: '2层'},
    {id: '3', label: '3层'}
  ];
  var rows = floors.map(function(f) {
    var val = _energyFloorThresholds[f.id] || 0;
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">' +
      '<span style="font-size:13px;font-weight:600;">' + f.label + '</span>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<input id="et-' + f.id + '" type="number" value="' + val + '" style="width:80px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;text-align:center;" placeholder="kWh"/>' +
      '<span style="font-size:11px;color:var(--text-muted);">kWh/日</span></div></div>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-energy-threshold" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-threshold\').remove()">' +
    '<div class="modal" style="width:380px;">' +
    '<div class="modal-header"><div class="modal-title">⚡ 用电阈值配置</div><button class="modal-close" onclick="document.getElementById(\'modal-energy-threshold\').remove()">✕</button></div>' +
    '<div class="modal-body" style="padding:16px 20px;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">设置各楼层日均用电上限，超标将在能源看板显示告警</div>' +
    rows +
    '</div>' +
    '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-threshold\').remove()">取消</button><button class="modal-btn primary" onclick="saveEnergyThresholds()">💾 保存配置</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveEnergyThresholds() {
  ['all', '1', '2', '3'].forEach(function(f) {
    var input = document.getElementById('et-' + f);
    if (input) {
      _energyFloorThresholds[f] = parseInt(input.value) || 0;
    }
  });
  document.getElementById('modal-energy-threshold').remove();
  showToast('✅ 用电阈值配置已保存', 'success');
  // Refresh energy KPI cards to show alert status
  if (typeof renderEnergyChart === 'function') renderEnergyChart();
  // Update energy cards with threshold alert indicators
  document.querySelectorAll('.energy-floor-card').forEach(function(card) {
    var floor = card.dataset.floor || 'all';
    var threshold = _energyFloorThresholds[floor] || 500;
    var current = parseInt(card.dataset.current) || 0;
    var alertEl = card.querySelector('.threshold-alert');
    if (current > threshold) {
      if (!alertEl) {
        var badge = document.createElement('span');
        badge.className = 'threshold-alert';
        badge.style.cssText = 'padding:2px 6px;background:var(--red-bg);color:var(--red);border-radius:8px;font-size:10px;font-weight:600;margin-left:6px;';
        badge.textContent = '⚠️ 超标';
        var title = card.querySelector('.floor-label');
        if (title) title.insertAdjacentElement('afterend', badge);
      }
    } else if (alertEl) {
      alertEl.remove();
    }
  });
}

// ============================================================
// 【改进2】日报表 - 新增日报记录表单+历史记录删除
// 理由：日报表仅有查看和导出，缺少新增日报和删除历史记录的功能
// 改进：实现新增日报表单提交和历史记录删除确认，形成完整增删闭环
// ============================================================
function openAddDailyReportModal() {
  var existing = document.getElementById('modal-add-daily-report');
  if (existing) existing.remove();
  var today = new Date().toISOString().slice(0, 10);
  var html = '<div class="modal-overlay hidden" id="modal-add-daily-report" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-daily-report\').remove()">' +
    '<div class="modal" style="width:420px;">' +
    '<div class="modal-header"><div class="modal-title">📝 新增日报</div><button class="modal-close" onclick="document.getElementById(\'modal-add-daily-report\').remove()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label class="form-label">日期 <span class="required">*</span></label><input class="form-input" id="dr-date" type="date" value="' + today + '"/></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">入住房间数</label><input class="form-input" id="dr-checkin" type="number" value="0" placeholder="入住数"/></div><div class="form-group"><label class="form-label">退房数</label><input class="form-input" id="dr-checkout" type="number" value="0" placeholder="退房数"/></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">在住房间数</label><input class="form-input" id="dr-occupied" type="number" value="0" placeholder="在住数"/></div><div class="form-group"><label class="form-label">入住率(%)</label><input class="form-input" id="dr-rate" type="number" value="0" placeholder="入住率"/></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">维修房数</label><input class="form-input" id="dr-maint" type="number" value="0" placeholder="维修房"/></div><div class="form-group"><label class="form-label">总收入(元)</label><input class="form-input" id="dr-income" type="number" value="0" placeholder="收入"/></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label><textarea class="form-input" id="dr-notes" rows="2" placeholder="当日备注信息（可选）"></textarea></div>' +
    '</div>' +
    '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-daily-report\').remove()">取消</button><button class="modal-btn primary" onclick="submitAddDailyReport()">💾 保存日报</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitAddDailyReport() {
  var date = document.getElementById('dr-date').value;
  if (!date) { showToast('请选择日期', 'error'); return; }
  var checkin = parseInt(document.getElementById('dr-checkin').value) || 0;
  var checkout = parseInt(document.getElementById('dr-checkout').value) || 0;
  var occupied = parseInt(document.getElementById('dr-occupied').value) || 0;
  var rate = parseInt(document.getElementById('dr-rate').value) || 0;
  var maint = parseInt(document.getElementById('dr-maint').value) || 0;
  var income = parseInt(document.getElementById('dr-income').value) || 0;
  var notes = document.getElementById('dr-notes').value.trim();
  // Add to report data if store exists
  if (typeof _reportData !== 'undefined' && _reportData.unshift) {
    _reportData.unshift({date: date, checkin: checkin, checkout: checkout, occupied: occupied, rate: rate, maint: maint, income: income, notes: notes});
  }
  document.getElementById('modal-add-daily-report').remove();
  showToast('✅ 日报已保存（' + date + '）', 'success');
  // Refresh table if available
  if (typeof renderReportTable === 'function') renderReportTable();
}

function deleteDailyReport(idx) {
  var rows = document.querySelectorAll('#report-table-body tr');
  if (rows.length <= idx) return;
  var row = rows[idx];
  var dateCell = row.querySelector('td:first-child');
  var dateText = dateCell ? dateCell.textContent.trim() : ('第' + idx + '条');
  if (!confirm('确定删除 ' + dateText + ' 的日报记录？')) return;
  if (typeof _reportData !== 'undefined' && _reportData.splice) {
    _reportData.splice(idx, 1);
  }
  showToast('🗑️ 日报记录已删除', 'success');
  if (typeof renderReportTable === 'function') renderReportTable();
}

// ============================================================
// 【改进3】设备管理 - 设备备注名称编辑
// 理由：设备列表仅有UUID显示，管理员无法为设备设置易识别的别名/位置备注
// 改进：在设备详情弹窗中增加"设备备注"字段，支持编辑保存，设备卡片同步更新显示备注
// ============================================================
var _deviceNicknames = {}; // uuid -> nickname

function openDeviceNicknameModal(uuid) {
  var existing = document.getElementById('modal-device-nickname');
  if (existing) existing.remove();
  var nickname = _deviceNicknames[uuid] || '';
  var device = deviceList ? deviceList.find(function(d){ return d.uuid === uuid; }) : null;
  var deviceLabel = device ? (device.room ? device.room + ' · ' : '') + device.uuid.slice(0,8) : uuid.slice(0,8);
  var html = '<div class="modal-overlay hidden" id="modal-device-nickname" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-nickname\').remove()">' +
    '<div class="modal" style="width:360px;">' +
    '<div class="modal-header"><div class="modal-title">🏷️ 设备备注</div><button class="modal-close" onclick="document.getElementById(\'modal-device-nickname\').remove()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div style="padding:10px;background:var(--blue-bg);border-radius:8px;margin-bottom:14px;font-size:12px;"><span style="color:var(--text-muted);">设备：</span><span style="font-weight:600;color:var(--blue);">' + deviceLabel + '</span></div>' +
    '<div class="form-group"><label class="form-label">备注名称</label><input class="form-input" id="device-nickname-input" value="' + nickname + '" placeholder="例如：301门口、202床头、厨房温控" maxlength="20"/><div class="form-hint">最多20个字符，用于快速识别设备位置</div></div>' +
    '</div>' +
    '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-device-nickname\').remove()">取消</button><button class="modal-btn primary" onclick="saveDeviceNickname(\'' + uuid + '\')">💾 保存</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('device-nickname-input').focus();
}

function saveDeviceNickname(uuid) {
  var nickname = document.getElementById('device-nickname-input').value.trim();
  _deviceNicknames[uuid] = nickname;
  document.getElementById('modal-device-nickname').remove();
  showToast('🏷️ 设备备注已保存' + (nickname ? '：「' + nickname + '」' : ''), 'success');
  // Update device list card if nickname exists
  var card = document.querySelector('.device-card[data-uuid="' + uuid + '"]');
  if (card) {
    var nameEl = card.querySelector('.device-nickname');
    if (nameEl) {
      nameEl.textContent = nickname || '';
      nameEl.style.display = nickname ? '' : 'none';
    }
    var uuidEl = card.querySelector('.device-uuid-label');
    if (uuidEl && nickname) {
      uuidEl.textContent = uuid.slice(0,8);
      uuidEl.style.fontSize = '10px';
    }
  }
}

// ============================================================
// 【改进4】服务工单 - 紧急标记与优先级筛选
// 理由：工单列表缺少紧急程度标记，管理员无法快速识别和处理紧急工单
// 改进：工单可标记为紧急，紧急工单在列表中红色高亮显示，支持按紧急程度筛选
// ============================================================
var _workorderUrgency = {}; // woId -> boolean

function toggleWorkorderUrgency(woId, el) {
  var isUrgent = _workorderUrgency[woId];
  _workorderUrgency[woId] = !isUrgent;
  if (el) {
    el.style.background = !isUrgent ? 'var(--red)' : '';
    el.style.color = !isUrgent ? 'white' : '';
    el.textContent = !isUrgent ? '🔥 紧急' : '○ 紧急';
  }
  showToast(!isUrgent ? '🔥 工单 ' + woId + ' 已标记为紧急' : '工单 ' + woId + ' 已取消紧急标记', !isUrgent ? 'warning' : 'info');
  if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
}

function filterWorkorderByUrgency(showUrgentOnly, el) {
  var tabs = el && el.closest ? el.closest('.card-tabs') : null;
  if (tabs) {
    tabs.querySelectorAll('.card-tab').forEach(function(t) {
      t.classList.remove('active');
      t.style.background = '';
      t.style.color = '';
    });
    el.classList.add('active');
    el.style.background = 'var(--red)';
    el.style.color = 'white';
  }
  if (typeof _woList === 'undefined') return;
  var tbody = document.getElementById('workorder-table-body');
  if (!tbody) return;
  var filtered = _woList.filter(function(wo) {
    if (showUrgentOnly) return _workorderUrgency[wo.id] === true;
    return true;
  });
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">' + (showUrgentOnly ? '暂无紧急工单' : '暂无工单数据') + '</td></tr>';
    return;
  }
  var rows = filtered.map(function(wo, i) {
    var isUrgent = _workorderUrgency[wo.id];
    var statusBg = wo.status === 'pending' || wo.status === 'new' ? 'var(--orange-bg)' : wo.status === 'processing' ? 'var(--blue-bg)' : 'var(--green-bg)';
    var statusColor = wo.status === 'pending' || wo.status === 'new' ? 'var(--orange)' : wo.status === 'processing' ? 'var(--blue)' : 'var(--green)';
    var statusText = wo.status === 'pending' || wo.status === 'new' ? '待处理' : wo.status === 'processing' ? '处理中' : '已完成';
    var urgencyBtn = '<button class="action-btn small" onclick="toggleWorkorderUrgency(\'' + wo.id + '\',this)" style="padding:2px 8px;font-size:10px;' + (isUrgent ? 'background:var(--red);color:white;' : '') + '">' + (isUrgent ? '🔥 紧急' : '○ 紧急') + '</button>';
    var rowBg = isUrgent ? 'background:var(--red-bg);' : '';
    return '<tr style="' + rowBg + '">' +
      '<td style="font-size:12px;font-weight:600;">' + (wo.id || 'WO' + i) + '</td>' +
      '<td style="font-size:12px;">' + (wo.title || wo.desc || '工单') + '</td>' +
      '<td style="font-size:11px;">' + (wo.room || '-') + '</td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + (wo.customer || '-') + '</td>' +
      '<td><span style="padding:2px 8px;background:' + statusBg + ';color:' + statusColor + ';border-radius:10px;font-size:11px;">' + statusText + '</span></td>' +
      '<td style="font-size:11px;color:var(--text-muted);">' + (wo.time || '-') + '</td>' +
      '<td>' + urgencyBtn + '<button class="action-btn small" onclick="showToast(\'查看工单详情\',\'info\');" style="padding:2px 8px;font-size:10px;margin-left:4px;">详情</button></td></tr>';
  }).join('');
  tbody.innerHTML = rows;
  var countEl = document.getElementById('wo-count-all');
  if (countEl) countEl.textContent = showUrgentOnly ? filtered.length : _woList.length;
}

// ============================================================
// 【改进5】会员管理 - 余额不足提醒阈值设置
// 理由：会员余额告警仅在页面加载时检查一次，后续修改阈值后不会重新检查
// 改进：实现余额告警阈值可配置化，保存后立即对所有会员重新计算并显示告警卡片
// ============================================================
var _memberBalanceThreshold = 100; // default

function openMemberBalanceThresholdModal() {
  var existing = document.getElementById('modal-member-balance-threshold');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-member-balance-threshold" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-balance-threshold\').remove()">' +
    '<div class="modal" style="width:340px;">' +
    '<div class="modal-header"><div class="modal-title">💰 余额告警阈值</div><button class="modal-close" onclick="document.getElementById(\'modal-member-balance-threshold\').remove()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label class="form-label">余额下限 <span class="required">*</span></label><input class="form-input" id="mbt-threshold" type="number" value="' + _memberBalanceThreshold + '" placeholder="低于此余额将收到提醒"/><div class="form-hint">单位：元，默认为100元</div></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);line-height:1.6;">会员余额低于此阈值时，会员卡片将显示余额不足提醒，并计入系统告警统计</div>' +
    '</div>' +
    '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-member-balance-threshold\').remove()">取消</button><button class="modal-btn primary" onclick="saveMemberBalanceThreshold()">💾 保存并检查</button></div>' +
    '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveMemberBalanceThreshold() {
  var val = parseInt(document.getElementById('mbt-threshold').value);
  if (isNaN(val) || val < 0) { showToast('请输入有效的金额', 'error'); return; }
  _memberBalanceThreshold = val;
  document.getElementById('modal-member-balance-threshold').remove();
  showToast('✅ 余额告警阈值已设为 ¥' + val, 'success');
  // Re-render member cards with updated threshold
  if (typeof renderMemberCards === 'function') renderMemberCards();
  else if (typeof renderMemberTable === 'function') renderMemberTable();
  // Also refresh dashboard member alerts count
  var alertCount = document.getElementById('member-alert-count');
  if (alertCount && typeof memberList !== 'undefined') {
    var lowBalance = memberList.filter(function(m){ return (m.balance || 0) < _memberBalanceThreshold; }).length;
    alertCount.textContent = lowBalance;
    alertCount.style.display = lowBalance > 0 ? '' : 'none';
  }
}

console.log('[iter61] 5个功能性改进已加载：能源阈值配置/日报增删/设备备注/工单紧急标记/会员余额告警阈值');
