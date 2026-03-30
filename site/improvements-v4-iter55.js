// ============================================================
// 【物联后台v4-第55轮】5个功能性断裂修复
// 本轮修复：结算中心3个断裂函数 + 工单SLA告警缺失函数
// ============================================================

// ============================================================
// 改进1: 结算中心 - toggleAllSettlementSelect（全选/取消全选）
// 理由：page-settlement 表格表头有全选checkbox调用toggleAllSettlementSelect，函数缺失
// 业务逻辑：勾选则选中有data-settlement-id属性的tr行，取消勾选则清空选择
// ============================================================
function toggleAllSettlementSelect(checked) {
  var checks = document.querySelectorAll('.stl-row-check');
  checks.forEach(function(c) { c.checked = checked; });
  var count = checked ? checks.length : 0;
  var toolbar = document.getElementById('wo-batch-toolbar');
  if (toolbar) {
    toolbar.style.display = count > 0 ? 'flex' : 'none';
    var countEl = document.getElementById('wo-batch-count');
    if (countEl) countEl.textContent = '已选择 ' + count + ' 项';
  }
  showToast((checked ? '✅ 已选中 ' : '✕ 已取消 ') + count + ' 条待结算记录', count > 0 ? 'success' : 'info');
}

// ============================================================
// 改进2: 结算中心 - onSettlementRowCheck（行checkbox变化时更新计数工具栏）
// 理由：每行checkbox触发onSettlementRowCheck，但函数缺失
// 业务逻辑：计算当前选中行数，更新工具栏显示
// ============================================================
function onSettlementRowCheck() {
  var checks = document.querySelectorAll('.stl-row-check');
  var checkedOnes = document.querySelectorAll('.stl-row-check:checked');
  var count = checkedOnes.length;
  var toolbar = document.getElementById('wo-batch-toolbar');
  if (toolbar) {
    toolbar.style.display = count > 0 ? 'flex' : 'none';
    var countEl = document.getElementById('wo-batch-count');
    if (countEl) countEl.textContent = '已选择 ' + count + ' 项';
  }
  // 同步全选checkbox状态
  var allCheck = document.getElementById('stl-select-all');
  if (allCheck) allCheck.checked = count > 0 && count === checks.length;
}

// ============================================================
// 改进3: 结算中心 - openBatchSettlementModal（批量结算确认弹窗）
// 理由：结算中心有"批量结算"按钮，但函数缺失
// 业务逻辑：收集已选中行的结算数据，弹出确认框展示汇总金额
// ============================================================
function openBatchSettlementModal() {
  var checkedOnes = document.querySelectorAll('.stl-row-check:checked');
  if (checkedOnes.length === 0) {
    showToast('请先选择要批量结算的记录', 'warn');
    return;
  }
  var existing = document.getElementById('modal-batch-settlement');
  if (existing) existing.remove();

  var rows = [];
  checkedOnes.forEach(function(cb) {
    var tr = cb.closest('tr');
    if (!tr) return;
    var room = tr.querySelector('td:nth-child(2)') ? tr.querySelector('td:nth-child(2)').textContent.trim() : '';
    var name = tr.querySelector('td:nth-child(3)') ? tr.querySelector('td:nth-child(3)').textContent.trim() : '';
    var payableText = tr.querySelector('td:nth-child(9)') ? tr.querySelector('td:nth-child(9)').textContent.trim().replace('¥', '') : '0';
    rows.push({ room: room, name: name, payable: parseFloat(payableText) || 0 });
  });

  var totalAmount = rows.reduce(function(s, r) { return s + r.payable; }, 0);
  var rowsHtml = rows.map(function(r) {
    return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">' +
      '<span>' + r.room + ' · ' + r.name + '</span>' +
      '<span style="font-weight:600;color:var(--orange);">¥' + r.payable.toFixed(0) + '</span></div>';
  }).join('');

  var html = '<div class="modal-overlay hidden" id="modal-batch-settlement" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-settlement\').remove()">' +
    '<div class="modal" style="width:420px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🔄</div><div><div style="font-size:15px;font-weight:700;">批量结算确认</div><div style="font-size:11px;color:var(--text-muted);">已选 ' + rows.length + ' 条记录</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-settlement\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    '<div style="max-height:200px;overflow-y:auto;margin-bottom:14px;border:1px solid var(--border);border-radius:8px;padding:8px 12px;">' + rowsHtml + '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:14px;">' +
    '<span style="font-size:13px;font-weight:600;color:var(--blue);">合计应付总额</span>' +
    '<span style="font-size:22px;font-weight:800;color:var(--blue);">¥' + totalAmount.toFixed(0) + '</span></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:12px;">⚠️ 批量结算将自动完成退房手续，确认前请确保所有费用已结清</div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-settlement\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="confirmBatchSettlement()" style="background:var(--blue);color:white;border:none;">💰 确认批量结算（' + rows.length + '笔）</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function confirmBatchSettlement() {
  var checkedOnes = document.querySelectorAll('.stl-row-check:checked');
  var count = checkedOnes.length;
  checkedOnes.forEach(function(cb) {
    var tr = cb.closest('tr');
    if (tr) {
      tr.style.opacity = '0.4';
      var btn = tr.querySelector('button.primary');
      if (btn) btn.textContent = '已结算';
    }
  });
  document.getElementById('modal-batch-settlement') && document.getElementById('modal-batch-settlement').remove();
  showToast('✅ 批量结算完成！' + count + ' 笔结算成功', 'success');
  // 清空选择
  var toolbar = document.getElementById('wo-batch-toolbar');
  if (toolbar) toolbar.style.display = 'none';
  var allCheck = document.getElementById('stl-select-all');
  if (allCheck) allCheck.checked = false;
}

// ============================================================
// 改进4: 结算中心 - openSettlementHistoryModal（结算历史记录弹窗）
// 理由：结算中心有"结算历史"按钮，函数缺失
// 业务逻辑：显示历史已结算记录（模拟数据），支持分页查看
// ============================================================
var _settlementHistoryPage = 1;
var _settlementHistoryData = [
  {id:'STL-2026032001', room:'305', name:'孙九', checkin:'2026-03-18 14:00', checkout:'2026-03-20 10:30', nights:2, amount:256, deposit:100, status:'已结算', time:'2026-03-20 10:35'},
  {id:'STL-2026031901', room:'401', name:'郑十', checkin:'2026-03-17 15:00', checkout:'2026-03-19 11:00', nights:2, amount:216, deposit:100, status:'已结算', time:'2026-03-19 11:05'},
  {id:'STL-2026031801', room:'202', name:'吴一', checkin:'2026-03-16 16:00', checkout:'2026-03-18 09:30', nights:2, amount:216, deposit:100, status:'已结算', time:'2026-03-18 09:35'},
  {id:'STL-2026031501', room:'303', name:'周丽', checkin:'2026-03-13 14:00', checkout:'2026-03-15 10:00', nights:2, amount:216, deposit:100, status:'已结算', time:'2026-03-15 10:10'},
  {id:'STL-2026031001', room:'205', name:'王明', checkin:'2026-03-08 15:00', checkout:'2026-03-10 11:00', nights:2, amount:216, deposit:100, status:'已结算', time:'2026-03-10 11:05'}
];

function openSettlementHistoryModal() {
  var existing = document.getElementById('modal-settlement-history');
  if (existing) existing.remove();
  renderSettlementHistoryList(1);
}

function renderSettlementHistoryList(page) {
  _settlementHistoryPage = page;
  var pageSize = 5;
  var totalPages = Math.ceil(_settlementHistoryData.length / pageSize) || 1;
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  var pageData = _settlementHistoryData.slice(start, end);

  var rowsHtml = pageData.map(function(s) {
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;font-size:11px;color:var(--blue);">' + s.id + '</td>' +
      '<td style="padding:10px 8px;font-weight:600;">' + s.room + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;">' + s.name + '</td>' +
      '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + s.checkin + '</td>' +
      '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + s.checkout + '</td>' +
      '<td style="padding:10px 8px;"><span style="font-weight:600;color:var(--orange);">¥' + s.amount + '</span></td>' +
      '<td style="padding:10px 8px;"><span class="tbadge green">' + s.status + '</span></td>' +
      '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + s.time + '</td></tr>';
  }).join('');

  var paginationHtml = '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;">';
  if (page > 1) paginationHtml += '<button onclick="renderSettlementHistoryList(' + (page - 1) + ')" style="padding:4px 10px;border:1px solid var(--border);background:white;border-radius:4px;cursor:pointer;font-size:12px;">上一页</button>';
  paginationHtml += '<span style="padding:4px 10px;font-size:12px;color:var(--text-muted);">第 ' + page + ' / ' + totalPages + ' 页</span>';
  if (page < totalPages) paginationHtml += '<button onclick="renderSettlementHistoryList(' + (page + 1) + ')" style="padding:4px 10px;border:1px solid var(--border);background:white;border-radius:4px;cursor:pointer;font-size:12px;">下一页</button>';
  paginationHtml += '</div>';

  var totalSettlement = _settlementHistoryData.reduce(function(s, r) { return s + r.amount; }, 0);

  var html = '<div class="modal-overlay hidden" id="modal-settlement-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-settlement-history\').remove()">' +
    '<div style="background:white;border-radius:12px;width:720px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📋</div><div><div style="font-size:15px;font-weight:700;">结算历史记录</div><div style="font-size:11px;color:var(--text-muted);">共 ' + _settlementHistoryData.length + ' 条记录 · 累计 ¥' + totalSettlement + '</div></div></div>' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<button onclick="exportSettlementHistoryCSV()" style="padding:5px 12px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:6px;cursor:pointer;font-size:12px;">📤 导出CSV</button>' +
    '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" style="background:var(--bg);border:none;font-size:15px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div></div>' +
    '<div style="overflow-y:auto;flex:1;padding:0 16px;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px;">' +
    '<thead><tr style="background:var(--bg);border-bottom:2px solid var(--border);">' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">结算单号</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">房间</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">客户</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">入住时间</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">退房时间</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">结算金额</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">状态</th>' +
    '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">结算时间</th></tr></thead>' +
    '<tbody id="settlement-history-tbody">' + rowsHtml + '</tbody></table>' +
    paginationHtml + '</div>' +
    '<div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';

  var existingModal = document.getElementById('modal-settlement-history');
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', html);
}

function exportSettlementHistoryCSV() {
  var csv = '结算单号,房间,客户,入住时间,退房时间,结算金额,状态,结算时间\n';
  _settlementHistoryData.forEach(function(s) {
    csv += s.id + ',' + s.room + ',' + s.name + ',' + s.checkin + ',' + s.checkout + ',' + s.amount + ',' + s.status + ',' + s.time + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '结算历史_' + new Date().toISOString().slice(0,10) + '.csv';
  link.click();
  showToast('📤 结算历史已导出CSV（共' + _settlementHistoryData.length + '条）', 'success');
}

// ============================================================
// 改进5: 工单管理 - openSLAAlertModal（SLA超时告警弹窗）
// 理由：工单批量工具栏有"⏱️ SLA监控"按钮调用openSLAAlertModal，函数缺失
// 业务逻辑：显示当前SLA超时/即将超时的工单列表，支持一键处理
// ============================================================
function openSLAAlertModal() {
  var existing = document.getElementById('modal-sla-alert');
  if (existing) existing.remove();
  var now = new Date();
  var overdueList = [];
  var urgentList = [];

  // 从 workorderSLAStore 中筛选
  if (typeof workorderSLAStore !== 'undefined') {
    workorderSLAStore.forEach(function(wo) {
      if (wo.status === 'done') return;
      var createTime = new Date(wo.createTime);
      var elapsedMin = (now - createTime) / 60000;
      var remaining = wo.slaMinutes - elapsedMin;
      if (remaining < 0) {
        overdueList.push({ wo: wo, overdueMin: Math.abs(Math.round(remaining)) });
      } else if (remaining <= 30) {
        urgentList.push({ wo: wo, remainingMin: Math.round(remaining) });
      }
    });
  }

  var overdueRows = overdueList.map(function(item) {
    var wo = item.wo;
    var typeMap = {complaint:'🔴 投诉', repair:'🔧 报修', delivery:'📦 送物', invoice:'📄 发票', praise:'⭐ 表扬', other:'📋 其他'};
    return '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:8px;">' +
      '<div style="flex:1;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--red);">' + (typeMap[wo.type] || wo.type) + ' · 房间 ' + (wo.room || '--') + ' · ' + (wo.title || '工单#' + wo.id) + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">工单号：WO' + String(wo.id).padStart(4, '0') + ' · 已超时 ' + item.overdueMin + ' 分钟</div></div>' +
      '<button onclick="document.getElementById(\'modal-sla-alert\').remove();showPage(\'workorder\');" style="padding:4px 12px;background:var(--red);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">立即处理</button></div>';
  }).join('');

  var urgentRows = urgentList.map(function(item) {
    var wo = item.wo;
    var typeMap = {complaint:'🔴 投诉', repair:'🔧 报修', delivery:'📦 送物', invoice:'📄 发票', praise:'⭐ 表扬', other:'📋 其他'};
    return '<div style="display:flex;align-items:center;padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-bottom:8px;">' +
      '<div style="flex:1;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--orange);">' + (typeMap[wo.type] || wo.type) + ' · 房间 ' + (wo.room || '--') + ' · ' + (wo.title || '工单#' + wo.id) + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">工单号：WO' + String(wo.id).padStart(4, '0') + ' · 剩余 ' + item.remainingMin + ' 分钟即将超时</div></div>' +
      '<button onclick="document.getElementById(\'modal-sla-alert\').remove();showPage(\'workorder\');" style="padding:4px 12px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">处理</button></div>';
  }).join('');

  var allRows = overdueRows + urgentRows;
  if (!allRows) allRows = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;">🎉 当前没有超时或即将超时的工单，干得漂亮！</div>';

  var html = '<div class="modal-overlay hidden" id="modal-sla-alert" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-sla-alert\').remove()">' +
    '<div style="background:white;border-radius:12px;width:520px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">⏱️</div><div><div style="font-size:15px;font-weight:700;">SLA超时告警监控</div><div style="font-size:11px;color:var(--text-muted);">实时监控工单SLA状态</div></div></div>' +
    '<div style="display:flex;gap:10px;align-items:center;">' +
    (overdueList.length > 0 ? '<div style="padding:4px 12px;background:var(--red-bg);color:var(--red);border-radius:8px;font-size:12px;font-weight:700;">⚠️ 超时 ' + overdueList.length + ' 条</div>' : '') +
    (urgentList.length > 0 ? '<div style="padding:4px 12px;background:var(--orange-bg);color:var(--orange);border-radius:8px;font-size:12px;font-weight:700;">⏰ 即将超时 ' + urgentList.length + ' 条</div>' : '') +
    '<button onclick="document.getElementById(\'modal-sla-alert\').remove()" style="background:var(--bg);border:none;font-size:15px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div></div>' +
    '<div style="overflow-y:auto;flex:1;padding:16px 20px;">' +
    (overdueRows ? '<div style="margin-bottom:16px;"><div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:8px;">🚨 已超时工单（需立即处理）</div>' + overdueRows + '</div>' : '') +
    (urgentRows ? '<div><div style="font-size:11px;font-weight:700;color:var(--orange);margin-bottom:8px;">⏰ 即将超时工单（30分钟内）</div>' + urgentRows + '</div>' : '') +
    (!allRows || allRows.indexOf('🎉') >= 0 ? '' : '') +
    '</div>' +
    '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div style="font-size:11px;color:var(--text-muted);">🔄 数据每分钟自动刷新</div>' +
    '<button onclick="document.getElementById(\'modal-sla-alert\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【辅助函数】filterSettlement - 结算中心标签筛选
// 理由：结算中心三个tab调用filterSettlement但函数缺失
// ============================================================
function filterSettlement(tab, el) {
  // 高亮当前tab
  var tabs = document.querySelectorAll('#page-settlement .card-tabs .card-tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  // 筛选表格行
  var rows = document.querySelectorAll('#settlement-table-body tr');
  var count = 0;
  rows.forEach(function(tr) {
    if (tab === 'all') {
      tr.style.display = '';
      count++;
    } else {
      var match = tr.getAttribute('data-status') === tab;
      tr.style.display = match ? '' : 'none';
      if (match) count++;
    }
  });
  // 更新计数显示（如果有）
  var countEls = document.querySelectorAll('#page-settlement .card-tab');
  countEls.forEach(function(c) {
    if (c.textContent.indexOf(tab === 'all' ? '全部' : tab === 'normal' ? '普通退房' : '脏房') >= 0) {
      var numEl = c.querySelector('span');
      if (numEl) {
        var matchTab = tab === 'all' ? 3 : tab === 'normal' ? 2 : 1;
        numEl.textContent = tab === 'all' ? '全部 ' + count : tab === 'normal' ? '普通退房 ' + count : '脏房 ' + count;
      }
    }
  });
  showToast('已切换至' + (tab === 'all' ? '全部' : tab === 'normal' ? '普通退房' : '脏房') + '，共 ' + count + ' 条', 'info');
}
