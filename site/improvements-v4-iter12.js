// ============================================================
// 【物联后台v4-第18轮】5个缺失功能性断裂修复
// ============================================================
// 本轮修复清单（按业务影响排序）：
// 改进1: resetLogFilter - 开锁记录筛选"重置"按钮（高频操作）
// 改进2: applyLogFilter - 开锁记录筛选"应用筛选"按钮（高频操作）
// 改进3: backBatchStep2 - 批量入住步骤2→步骤1回退按钮（步骤流断裂）
// 改进4: addPricePeriod - 房型价格时段"添加时段"按钮（价格管理断裂）
// 改进5: applyOplogFilterV2 - 操作日志V2"搜索"按钮（审计功能断裂）

// ============================================================
// 【改进1+2】resetLogFilter / applyLogFilter - 开锁记录筛选
// 理由：开锁记录Tab有"应用筛选"和"重置"按钮但函数从未定义，导致筛选功能无效
// 业务逻辑：
//   - 按日期范围筛选（log-date-start / log-date-end）
//   - 按开锁方式筛选（log-method-filter: all/phone/card/master/remote）
//   - 重置后恢复默认显示全部记录
// ============================================================
window.resetLogFilter = function() {
  var startInput = document.getElementById('log-date-start');
  var endInput = document.getElementById('log-date-end');
  var methodSelect = document.getElementById('log-method-filter');
  if (startInput) startInput.value = '2026-03-26';
  if (endInput) endInput.value = '2026-03-26';
  if (methodSelect) methodSelect.value = 'all';
  // Reset stats panel and log list
  var statsPanel = document.getElementById('unlock-log-stats-panel');
  if (statsPanel) {
    statsPanel.innerHTML = '<div class="card-body" style="padding:12px 20px;display:flex;gap:24px;flex-wrap:wrap;">' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">12</div><div style="font-size:11px;color:var(--text-muted);">今日开锁</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--green);">8</div><div style="font-size:11px;color:var(--text-muted);">成功</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">3</div><div style="font-size:11px;color:var(--text-muted);">异常</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--red);">1</div><div style="font-size:11px;color:var(--text-muted);">失败</div></div></div>';
  }
  var resultSpan = document.getElementById('log-filter-result');
  if (resultSpan) resultSpan.textContent = '共 12 条记录';
  showToast('筛选条件已重置，显示全部记录', 'info');
};

window.applyLogFilter = function() {
  var startDate = document.getElementById('log-date-start') ? document.getElementById('log-date-start').value : '';
  var endDate = document.getElementById('log-date-end') ? document.getElementById('log-date-end').value : '';
  var method = document.getElementById('log-method-filter') ? document.getElementById('log-method-filter').value : 'all';
  // Validate dates
  if (startDate && endDate && startDate > endDate) {
    showToast('开始日期不能晚于结束日期', 'error');
    return;
  }
  // Mock filtered data based on filter values
  var totalRecords = 12;
  var filteredRecords = totalRecords;
  if (method !== 'all') {
    filteredRecords = Math.floor(totalRecords * 0.6);
  }
  if (startDate || endDate) {
    filteredRecords = Math.floor(filteredRecords * 0.7);
  }
  // Update stats panel
  var statsPanel = document.getElementById('unlock-log-stats-panel');
  if (statsPanel) {
    var successCount = Math.floor(filteredRecords * 0.67);
    var anomalyCount = Math.floor(filteredRecords * 0.25);
    var failCount = filteredRecords - successCount - anomalyCount;
    statsPanel.innerHTML = '<div class="card-body" style="padding:12px 20px;display:flex;gap:24px;flex-wrap:wrap;">' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + filteredRecords + '</div><div style="font-size:11px;color:var(--text-muted);">符合条件</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--green);">' + successCount + '</div><div style="font-size:11px;color:var(--text-muted);">成功</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">' + anomalyCount + '</div><div style="font-size:11px;color:var(--text-muted);">异常</div></div>' +
      '<div style="text-align:center;padding:8px 16px;"><div style="font-size:20px;font-weight:700;color:var(--red);">' + failCount + '</div><div style="font-size:11px;color:var(--text-muted);">失败</div></div></div>';
  }
  var resultSpan = document.getElementById('log-filter-result');
  if (resultSpan) resultSpan.textContent = '共 ' + filteredRecords + ' 条记录';
  var filterDesc = [];
  if (method !== 'all') filterDesc.push('方式=' + method);
  if (startDate) filterDesc.push('开始:' + startDate);
  if (endDate) filterDesc.push('结束:' + endDate);
  var desc = filterDesc.length > 0 ? '（' + filterDesc.join(', ') + '）' : '';
  showToast('已筛选' + filteredRecords + '条记录' + desc, 'success');
};

// ============================================================
// 【改进3】backBatchStep2 - 批量入住步骤2→步骤1回退
// 理由：批量入住步骤3有"返回修改信息"按钮调用backBatchStep2()但函数从未定义
// 业务逻辑：步骤3 → 点击返回 → 步骤2（修改信息）重新显示，保留已填数据
// ============================================================
window.backBatchStep2 = function() {
  var step1 = document.getElementById('batch-step-1');
  var step2 = document.getElementById('batch-step-2');
  var step3 = document.getElementById('batch-step-3');
  var summary = document.getElementById('batch-summary-card');
  if (!step2) { showToast('步骤2页面不存在', 'error'); return; }
  if (step1) step1.style.display = 'none';
  if (step3) step3.style.display = 'none';
  if (summary) summary.style.display = 'none';
  step2.style.display = 'block';
  // Scroll to top of batch checkin section
  var batchSection = document.getElementById('batch-checkin-section');
  if (batchSection) batchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('已返回到信息录入步骤，请修改入住信息', 'info');
};

// ============================================================
// 【改进4】addPricePeriod - 房型价格时段添加
// 理由：房型价格弹窗有"添加时段"按钮但函数从未定义，导致无法添加新的价格时段
// 业务逻辑：
//   - 读取 rtp-new-start / rtp-new-end / rtp-new-price 输入值
//   - 校验时间格式和价格
//   - 动态添加到 rtp-period-list-body 列表
//   - 清空输入框准备下一个时段
// ============================================================
window.addPricePeriod = function() {
  var startTime = document.getElementById('rtp-new-start') ? document.getElementById('rtp-new-start').value : '';
  var endTime = document.getElementById('rtp-new-end') ? document.getElementById('rtp-new-end').value : '';
  var price = document.getElementById('rtp-new-price') ? parseFloat(document.getElementById('rtp-new-price').value) : 0;
  // Validate inputs
  if (!startTime || !endTime) {
    showToast('请填写开始时间和结束时间', 'error');
    return;
  }
  if (startTime >= endTime) {
    showToast('开始时间必须早于结束时间', 'error');
    return;
  }
  if (!price || price <= 0) {
    showToast('请填写正确的价格（大于0）', 'error');
    return;
  }
  // Get existing periods count for ID
  var listBody = document.getElementById('rtp-period-list-body');
  var existingCount = listBody ? listBody.querySelectorAll('.rtp-period-item').length : 0;
  var periodId = 'rtp-period-' + (existingCount + 1);
  // Create period item HTML
  var periodItem = document.createElement('div');
  periodItem.className = 'rtp-period-item';
  periodItem.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg);border-radius:6px;margin-bottom:6px;gap:12px;';
  periodItem.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;flex:1;">' +
      '<span style="font-size:12px;font-weight:600;color:var(--blue);min-width:50px;">' + startTime + '</span>' +
      '<span style="color:var(--text-muted);font-size:11px;">至</span>' +
      '<span style="font-size:12px;font-weight:600;color:var(--blue);min-width:50px;">' + endTime + '</span>' +
    '</div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--red);">¥' + price.toFixed(0) + '</div>' +
    '<button onclick="removePricePeriod(this, \'' + periodId + '\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;padding:2px 6px;" title="删除时段">✕</button>';
  if (listBody) {
    listBody.appendChild(periodItem);
  }
  // Clear inputs for next entry
  if (document.getElementById('rtp-new-price')) document.getElementById('rtp-new-price').value = '';
  showToast('时段 ' + startTime + '-' + endTime + '（¥' + price + '）已添加', 'success');
};

window.removePricePeriod = function(btn, periodId) {
  if (btn && btn.parentElement) {
    btn.parentElement.remove();
    showToast('时段已移除', 'info');
  }
};

// ============================================================
// 【改进5】applyOplogFilterV2 - 操作日志V2搜索
// 理由：操作日志Tab有"搜索"按钮调用applyOplogFilterV2()但函数从未定义
// 业务逻辑：
//   - 读取 oplog-date-start / oplog-date-end 日期范围
//   - 读取 oplog-user-filter / oplog-type-filter / oplog-status-filter 下拉筛选
//   - 读取 oplog-target（操作对象）和 oplog-ip（IP地址）文本筛选
//   - 显示筛选结果数量
// ============================================================
window.applyOplogFilterV2 = function() {
  var startDate = document.getElementById('oplog-date-start') ? document.getElementById('oplog-date-start').value : '';
  var endDate = document.getElementById('oplog-date-end') ? document.getElementById('oplog-date-end').value : '';
  var userFilter = document.getElementById('oplog-user-filter') ? document.getElementById('oplog-user-filter').value : 'all';
  var typeFilter = document.getElementById('oplog-type-filter') ? document.getElementById('oplog-type-filter').value : 'all';
  var statusFilter = document.getElementById('oplog-status-filter') ? document.getElementById('oplog-status-filter').value : 'all';
  var targetFilter = document.getElementById('oplog-target') ? document.getElementById('oplog-target').value.trim() : '';
  var ipFilter = document.getElementById('oplog-ip') ? document.getElementById('oplog-ip').value.trim() : '';
  // Validate dates
  if (startDate && endDate && startDate > endDate) {
    showToast('开始日期不能晚于结束日期', 'error');
    return;
  }
  // Build filter description
  var filters = [];
  if (userFilter !== 'all') filters.push('用户=' + userFilter);
  if (typeFilter !== 'all') filters.push('类型=' + typeFilter);
  if (statusFilter !== 'all') filters.push('结果=' + statusFilter);
  if (targetFilter) filters.push('对象=' + targetFilter);
  if (ipFilter) filters.push('IP=' + ipFilter);
  if (startDate) filters.push('开始:' + startDate);
  if (endDate) filters.push('结束:' + endDate);
  // Mock filtered result count
  var totalLogs = 156;
  var filteredCount = Math.max(1, Math.floor(totalLogs * (filters.length > 0 ? 0.15 : 1)));
  // Update result count display
  var resultEl = document.getElementById('oplog-filter-result');
  if (resultEl) {
    resultEl.textContent = '符合条件：' + filteredCount + ' 条';
  }
  var filterDesc = filters.length > 0 ? '（' + filters.slice(0, 3).join(', ') + (filters.length > 3 ? '...' : '') + '）' : '';
  showToast('筛选完成，符合条件 ' + filteredCount + ' 条记录' + filterDesc, 'success');
};

// Bonus: resetOplogFilterV2 (used alongside applyOplogFilterV2)
window.resetOplogFilterV2 = function() {
  var ids = ['oplog-date-start', 'oplog-date-end', 'oplog-target', 'oplog-ip'];
  var selects = ['oplog-user-filter', 'oplog-type-filter', 'oplog-status-filter'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  selects.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = 'all';
  });
  var resultEl = document.getElementById('oplog-filter-result');
  if (resultEl) resultEl.textContent = '符合条件：156 条';
  showToast('操作日志筛选条件已重置', 'info');
};
