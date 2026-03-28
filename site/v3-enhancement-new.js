<script src="v3-enhancement-new.js?v=202603281605"></script>
// ============================================================
// 【改进v3-New-1】押金缴纳记录与退款跟踪页面
// 理由：原系统没有独立的押金管理页面，押金记录散落在入住记录中，
//       财务对账时难以快速汇总。本功能提供押金全局视图、状态流转跟踪、退款管理。
// ============================================================

var depositRecords = [
  {id:'DP-001', room:'301', guest:'张三', idNo:'310***********1234', amount:500, payMethod:'微信', status:'held', checkinTime:'2026-03-25 14:30', checkoutTime:'-', refunded:0, remark:'正常入住押金'},
  {id:'DP-002', room:'302', guest:'李四', idNo:'320***********5678', amount:500, payMethod:'支付宝', status:'partial_refund', checkinTime:'2026-03-20 15:00', checkoutTime:'2026-03-22 11:00', refunded:200, remark:'换房，部分退款200'},
  {id:'DP-003', room:'303', guest:'王五', idNo:'330***********9012', amount:500, payMethod:'现金', status:'refunded', checkinTime:'2026-03-18 10:00', checkoutTime:'2026-03-19 12:30', refunded:500, remark:'正常退房退款'},
  {id:'DP-004', room:'201', guest:'赵六', idNo:'340***********3456', amount:300, payMethod:'微信', status:'held', checkinTime:'2026-03-27 16:00', checkoutTime:'-', refunded:0, remark:'正常入住押金'},
  {id:'DP-005', room:'401', guest:'孙七', idNo:'350***********7890', amount:500, payMethod:'信用卡', status:'held', checkinTime:'2026-03-26 09:00', checkoutTime:'-', refunded:0, remark:'正常入住押金'},
  {id:'DP-006', room:'202', guest:'周八', idNo:'360***********2345', amount:300, payMethod:'支付宝', status:'partial_refund', checkinTime:'2026-03-15 14:00', checkoutTime:'2026-03-17 10:00', refunded:150, remark:'提前退房，扣违约金150'},
  {id:'DP-007', room:'205', guest:'吴九', idNo:'370***********6789', amount:500, payMethod:'微信', status:'refunded', checkinTime:'2026-03-10 11:00', checkoutTime:'2026-03-12 13:00', refunded:500, remark:'正常退房退款'},
];

// 注入押金管理页面
function injectDepositRecordsPage() {
  var pageHtml = '<div id="page-deposit" class="page">' +
    '<div class="page-header">' +
    '<div class="page-title">💳 押金管理</div>' +
    '<div class="page-sub">押金缴纳记录 · 退款跟踪 · 财务对账</div>' +
    '<button class="action-btn small" onclick="openDepositRefundModal()" style="padding:4px 10px;background:var(--blue);color:white;border-color:var(--blue);margin-left:auto;">💰 办理退款</button>' +
    '</div>' +
    '<div class="stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px;">' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--blue-bg);">💰</div><div><div class="stat-num" id="dep-stat-total">' + depositRecords.length + '</div><div class="stat-label">押金记录</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--orange-bg);">🔒</div><div><div class="stat-num" id="dep-stat-held">' + depositRecords.filter(function(d){return d.status==='held'||d.status==='partial_refund';}).length + '</div><div class="stat-label">待退款</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--green-bg);">✅</div><div><div class="stat-num" id="dep-stat-refunded">' + depositRecords.filter(function(d){return d.status==='refunded';}).length + '</div><div class="stat-label">已退清</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--red-bg);">⚠️</div><div><div class="stat-num" id="dep-stat-amount">¥' + depositRecords.reduce(function(s,d){return s+(d.amount-d.refunded);},0) + '</div><div class="stat-label">待退总额</div></div></div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:12px;">' +
    '<div class="card-body" style="padding:12px 20px;">' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
    '<input type="text" class="form-input" id="dep-search-input" placeholder="🔍 搜索姓名/房间/押金单号" style="width:220px;padding:7px 12px;font-size:12px;" onkeydown="if(event.key===\'Enter\')applyDepositSearch()">' +
    '<select class="form-select" id="dep-status-filter" style="padding:7px 10px;font-size:12px;width:130px;" onchange="applyDepositSearch()">' +
    '<option value="all">全部状态</option><option value="held">🔒 待退款</option><option value="partial_refund">⏳ 部分退款</option><option value="refunded">✅ 已退清</option></select>' +
    '<select class="form-select" id="dep-pay-filter" style="padding:7px 10px;font-size:12px;width:130px;" onchange="applyDepositSearch()">' +
    '<option value="all">全部支付方式</option><option value="微信">💚 微信</option><option value="支付宝">🔵 支付宝</option><option value="现金">💵 现金</option><option value="信用卡">💳 信用卡</option></select>' +
    '<input type="date" class="form-input" id="dep-date-from" style="width:140px;padding:6px 10px;font-size:12px;" value="2026-03-01">' +
    '<span style="color:var(--text-muted);font-size:12px;">至</span>' +
    '<input type="date" class="form-input" id="dep-date-to" style="width:140px;padding:6px 10px;font-size:12px;" value="2026-03-28">' +
    '<button class="action-btn small" onclick="applyDepositSearch()" style="padding:6px 12px;">🔍</button>' +
    '<button class="action-btn small" onclick="resetDepositSearch()" style="padding:6px 12px;">重置</button>' +
    '<button class="action-btn small" onclick="exportDepositCSV()" style="padding:6px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);">📤 导出</button>' +
    '</div></div></div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="card-title">💳 押金记录列表</div></div>' +
    '<div class="card-body"><table class="table"><thead><tr><th>押金单号</th><th>房间</th><th>客人</th><th>身份证</th><th>押金金额</th><th>支付方式</th><th>状态</th><th>入住时间</th><th>退款金额</th><th>操作</th></tr></thead>' +
    '<tbody id="deposit-table-body"></tbody></table></div></div></div>';

  // 注入到 page-blacklist 之后
  var blacklistPage = document.getElementById('page-blacklist');
  if (blacklistPage) {
    blacklistPage.insertAdjacentHTML('afterend', pageHtml);
  }
}

function renderDepositTable(records) {
  var tbody = document.getElementById('deposit-table-body');
  if (!tbody) return;
  var statusMap = {
    held:{label:'🔒 待退款', bg:'var(--orange-bg)', color:'var(--orange)'},
    partial_refund:{label:'⏳ 部分退款', bg:'var(--blue-bg)', color:'var(--blue)'},
    refunded:{label:'✅ 已退清', bg:'var(--green-bg)', color:'var(--green)'}
  };
  var html = '';
  records.forEach(function(d, i) {
    var st = statusMap[d.status] || statusMap.held;
    html += '<tr>' +
      '<td><span style="font-size:11px;font-family:monospace;color:var(--blue);">' + d.id + '</span></td>' +
      '<td><b>' + d.room + '</b></td>' +
      '<td>' + d.guest + '</td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + d.idNo + '</span></td>' +
      '<td><b style="color:var(--green);">¥' + d.amount + '</b></td>' +
      '<td>' + d.payMethod + '</td>' +
      '<td><span class="tbadge" style="background:' + st.bg + ';color:' + st.color + ';">' + st.label + '</span></td>' +
      '<td><span style="font-size:11px;">' + d.checkinTime + '</span></td>' +
      '<td><b style="color:' + (d.refunded > 0 ? 'var(--blue)' : 'var(--text-muted)') + ';">¥' + d.refunded + '</b></td>' +
      '<td><button class="action-btn small" onclick="openDepositDetailModal(\'' + d.id + '\')">详情</button> ' +
      (d.status !== 'refunded' ? '<button class="action-btn small green" onclick="openDepositRefundModal(\'' + d.id + '\')">退款</button>' : '') +
      '</td></tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-muted);">暂无押金记录</td></tr>';
}

function applyDepositSearch() {
  var keyword = document.getElementById('dep-search-input').value.trim().toLowerCase();
  var status = document.getElementById('dep-status-filter').value;
  var payMethod = document.getElementById('dep-pay-filter').value;
  var dateFrom = document.getElementById('dep-date-from').value;
  var dateTo = document.getElementById('dep-date-to').value;

  var filtered = depositRecords.filter(function(d) {
    if (keyword && d.guest.toLowerCase().indexOf(keyword) === -1 && d.room.indexOf(keyword) === -1 && d.id.toLowerCase().indexOf(keyword) === -1) return false;
    if (status !== 'all' && d.status !== status) return false;
    if (payMethod !== 'all' && d.payMethod !== payMethod) return false;
    if (dateFrom && d.checkinTime < dateFrom) return false;
    if (dateTo && d.checkinTime > dateTo + ' 23:59:59') return false;
    return true;
  });
  renderDepositTable(filtered);
}

function resetDepositSearch() {
  document.getElementById('dep-search-input').value = '';
  document.getElementById('dep-status-filter').value = 'all';
  document.getElementById('dep-pay-filter').value = 'all';
  renderDepositTable(depositRecords);
}

function openDepositDetailModal(id) {
  var d = depositRecords.find(function(x){ return x.id === id; });
  if (!d) return;
  var old = document.getElementById('modal-deposit-detail');
  if (old) old.remove();
  var statusMap = {held:'🔒 待退款', partial_refund:'⏳ 部分退款', refunded:'✅ 已退清'};
  var html = '<div class="modal-overlay" id="modal-deposit-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:520px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">💳 押金详情 - ' + d.id + '</div>' +
    '<button onclick="document.getElementById(\'modal-deposit-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房间</div><div style="font-size:16px;font-weight:700;">' + d.room + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">客人</div><div style="font-size:16px;font-weight:700;">' + d.guest + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">押金金额</div><div style="font-size:20px;font-weight:700;color:var(--green);">¥' + d.amount + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">状态</div><div style="font-size:16px;font-weight:700;color:var(--orange);">' + statusMap[d.status] + '</div></div>' +
    '</div>' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:14px;font-size:13px;">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--text-muted);">已退金额</span><b style="color:var(--blue);">¥' + d.refunded + '</b></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--text-muted);">待退金额</span><b style="color:var(--orange);">¥' + (d.amount - d.refunded) + '</b></div>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);line-height:2;">' +
    '<div><b>身份证：</b>' + d.idNo + '</div>' +
    '<div><b>支付方式：</b>' + d.payMethod + '</div>' +
    '<div><b>入住时间：</b>' + d.checkinTime + '</div>' +
    '<div><b>退房时间：</b>' + d.checkoutTime + '</div>' +
    '<div><b>备注：</b>' + d.remark + '</div>' +
    '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    (d.status !== 'refunded' ? '<button onclick="openDepositRefundModal(\'' + d.id + '\')" class="modal-btn primary" style="background:var(--orange);border-color:var(--orange);">💰 办理退款</button>' : '') +
    '<button onclick="document.getElementById(\'modal-deposit-detail\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function openDepositRefundModal(id) {
  var d = id ? depositRecords.find(function(x){ return x.id === id; }) : null;
  var old = document.getElementById('modal-deposit-refund');
  if (old) old.remove();
  var refundable = d ? d.amount - d.refunded : 0;
  var html = '<div class="modal-overlay" id="modal-deposit-refund" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:460px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">💰 押金退款办理</div>' +
    '<button onclick="document.getElementById(\'modal-deposit-refund\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    (d ? '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;font-size:13px;display:flex;justify-content:space-between;"><span>' + d.guest + ' · 房间' + d.room + '</span><b style="color:var(--orange);">可退 ¥' + refundable + '</b></div>' : '') +
    '<div class="form-group"><label class="form-label">退款金额 <span style="color:var(--red);">*</span></label>' +
    '<input type="number" class="form-input" id="dr-amount" value="' + (d ? refundable : '') + '" style="font-size:16px;font-weight:700;color:var(--blue);" placeholder="输入退款金额">' +
    '</div>' +
    '<div class="form-group"><label class="form-label">退款方式</label>' +
    '<select class="form-select" id="dr-method" style="width:100%;padding:8px 10px;font-size:13px;">' +
    '<option value="原路返回">💚 原路返回（微信/支付宝）</option><option value="现金">💵 现金退款</option><option value="银行卡">💳 银行卡转账</option></select>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">退款原因</label>' +
    '<select class="form-select" id="dr-reason" style="width:100%;padding:8px 10px;font-size:13px;">' +
    '<option value="normal_checkout">✅ 正常退房</option><option value="early_checkout">⏰ 提前退房</option><option value="room_change">🔄 换房</option><option value="complaint">⚠️ 投诉减免</option><option value="other">📝 其他</option></select>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="dr-remark" placeholder="输入退款备注..." style="min-height:60px;font-size:12px;"></textarea>' +
    '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-deposit-refund\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="submitDepositRefund(\'' + (d ? d.id : '') + '\')" class="modal-btn primary" style="background:var(--orange);border-color:var(--orange);">确认退款</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitDepositRefund(id) {
  var amount = parseFloat(document.getElementById('dr-amount').value) || 0;
  if (amount <= 0) { showToast('请输入正确的退款金额', 'error'); return; }
  var method = document.getElementById('dr-method').value;
  var reason = document.getElementById('dr-reason').value;
  var remark = document.getElementById('dr-remark').value.trim();
  if (id) {
    var d = depositRecords.find(function(x){ return x.id === id; });
    if (d) {
      d.refunded += amount;
      if (d.refunded >= d.amount) { d.status = 'refunded'; }
      else if (d.refunded > 0) { d.status = 'partial_refund'; }
      d.remark = (d.remark || '') + ' | 退款' + amount + '元(' + method + ')';
    }
  }
  document.getElementById('modal-deposit-refund').remove();
  showToast('✅ 退款成功：¥' + amount + '，退款方式：' + method, 'success');
  renderDepositTable(depositRecords);
}

function exportDepositCSV() {
  var csv = '押金单号,房间,客人,押金金额,支付方式,状态,入住时间,已退金额\n';
  depositRecords.forEach(function(d) {
    var statusMap = {held:'待退款', partial_refund:'部分退款', refunded:'已退清'};
    csv += d.id + ',' + d.room + ',' + d.guest + ',' + d.amount + ',' + d.payMethod + ',' + statusMap[d.status] + ',' + d.checkinTime + ',' + d.refunded + '\n';
  });
  var blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '押金记录_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('押金记录已导出', 'success');
}

// ============================================================
// 【改进v3-New-2】入住登记快速预填写弹窗（历史记录+模拟身份证读取）
// 理由：前台办理入住时反复输入相同信息效率低，本功能通过手机号/姓名
//       快速匹配历史入住记录，一键填充入住表单，同时模拟身份证读取功能。
// ============================================================

var checkinHistoryDB = [
  {name:'张三', phone:'138****1234', idNo:'310***********1234', idType:'身份证', lastRoom:'301', lastDate:'2026-03-20', visitCount:3, preference:'无烟房'},
  {name:'李四', phone:'139****2345', idNo:'320***********5678', idType:'身份证', lastRoom:'302', lastDate:'2026-03-15', visitCount:5, preference:'高楼层'},
  {name:'王五', phone:'137****3456', idNo:'330***********9012', idType:'身份证', lastRoom:'303', lastDate:'2026-03-10', visitCount:2, preference:'安静'},
  {name:'赵六', phone:'136****4567', idNo:'340***********3456', idType:'身份证', lastRoom:'201', lastDate:'2026-03-05', visitCount:1, preference:'大床'},
  {name:'孙七', phone:'135****5678', idNo:'350***********7890', idType:'身份证', lastRoom:'401', lastDate:'2026-02-28', visitCount:4, preference:'无烟房'},
];

function openCheckinQuickFillModal() {
  var old = document.getElementById('modal-checkin-quickfill');
  if (old) old.remove();
  var historyOptions = checkinHistoryDB.map(function(h) {
    return '<option value="' + h.phone + '">' + h.name + ' (' + h.phone + ') - ' + h.lastRoom + '房</option>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-checkin-quickfill" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:560px;max-height:90vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📋 入住快速登记</div>' +
    '<button onclick="document.getElementById(\'modal-checkin-quickfill\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +

    // 方式选择Tab
    '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
    '<button id="qft-tab-idcard" onclick="switchQuickFillTab(\'idcard\')" class="action-btn primary" style="flex:1;padding:8px;">🪪 身份证读取</button>' +
    '<button id="qft-tab-history" onclick="switchQuickFillTab(\'history\')" class="action-btn" style="flex:1;padding:8px;">📜 历史记录</button>' +
    '<button id="qft-tab-manual" onclick="switchQuickFillTab(\'manual\')" class="action-btn" style="flex:1;padding:8px;">✏️ 手动输入</button>' +
    '</div>' +

    // 身份证读取区
    '<div id="qft-idcard-panel">' +
    '<div style="padding:20px;background:var(--blue-bg);border:2px dashed var(--blue);border-radius:12px;text-align:center;margin-bottom:14px;cursor:pointer;" onclick="simulateIdCardRead()" id="idcard-read-area">' +
    '<div style="font-size:36px;margin-bottom:8px;">🪪</div>' +
    '<div style="font-size:14px;font-weight:700;color:var(--blue);margin-bottom:4px;">点击模拟读取身份证</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">将身份证放入感应区，自动读取身份信息</div>' +
    '</div>' +
    '<div id="idcard-read-result" style="display:none;padding:14px;background:var(--green-bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">✅ 身份证读取成功</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
    '<div><span style="color:var(--text-muted);">姓名：</span><b id="qfr-name">--</b></div>' +
    '<div><span style="color:var(--text-muted);">性别：</span><b id="qfr-gender">--</b></div>' +
    '<div><span style="color:var(--text-muted);">民族：</span><b id="qfr-nation">汉</b></div>' +
    '<div><span style="color:var(--text-muted);">生日：</span><b id="qfr-birth">--</b></div>' +
    '<div><span style="color:var(--text-muted);">身份证号：</span><b id="qfr-idno">--</b></div>' +
    '<div><span style="color:var(--text-muted);">地址：</span><b id="qfr-addr">--</b></div>' +
    '</div></div></div>' +

    // 历史记录区
    '<div id="qft-history-panel" style="display:none;">' +
    '<div class="form-group" style="margin-bottom:14px;">' +
    '<label class="form-label">选择历史入住记录</label>' +
    '<select class="form-select" id="qft-history-select" onchange="loadCheckinHistoryRecord()" style="width:100%;padding:8px 10px;font-size:13px;">' +
    '<option value="">-- 请选择 --</option>' + historyOptions + '</select>' +
    '</div>' +
    '<div id="qft-history-info" style="display:none;padding:14px;background:var(--bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">📋 历史入住信息</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
    '<div><span style="color:var(--text-muted);">姓名：</span><b id="qfh-name">--</b></div>' +
    '<div><span style="color:var(--text-muted);">手机：</span><b id="qfh-phone">--</b></div>' +
    '<div><span style="color:var(--text-muted);">上次房间：</span><b id="qfh-room">--</b></div>' +
    '<div><span style="color:var(--text-muted);">入住次数：</span><b id="qfh-visits">--</b></div>' +
    '<div><span style="color:var(--text-muted);">上次入住：</span><b id="qfh-date">--</b></div>' +
    '<div><span style="color:var(--text-muted);">偏好：</span><b id="qfh-pref">--</b></div>' +
    '</div></div></div>' +

    // 手动输入区
    '<div id="qft-manual-panel" style="display:none;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">' +
    '<div class="form-group"><label class="form-label">姓名 <span style="color:var(--red);">*</span></label><input type="text" class="form-input" id="qfm-name" placeholder="输入姓名"></div>' +
    '<div class="form-group"><label class="form-label">手机号 <span style="color:var(--red);">*</span></label><input type="text" class="form-input" id="qfm-phone" placeholder="输入手机号" onblur="lookupCheckinHistoryByPhone(this.value)"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">身份证号</label><input type="text" class="form-input" id="qfm-idno" placeholder="输入身份证号"></div>' +
    '</div>' +

    // 公共表单区（房间选择+入住日期）
    '<div style="border-top:1px solid var(--border);padding-top:16px;margin-top:4px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">' +
    '<div class="form-group"><label class="form-label">选择房间 <span style="color:var(--red);">*</span></label>' +
    '<select class="form-select" id="qfm-room" style="width:100%;padding:8px 10px;font-size:13px;">' +
    '<option value="">-- 房间 --</option>' +
    '<option value="301">301 - 标准间</option><option value="302">302 - 标准间</option>' +
    '<option value="303">303 - 大床房</option><option value="304">304 - 亲子间</option>' +
    '<option value="201">201 - 大床房</option><option value="202">202 - 标准间</option>' +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">入住日期</label><input type="date" class="form-input" id="qfm-date" value="' + new Date().toISOString().slice(0,10) + '" style="width:100%;padding:8px 10px;"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">备注/偏好</label><input type="text" class="form-input" id="qfm-pref" placeholder="如：无烟房/高楼层/安静等" style="width:100%;padding:8px 10px;font-size:13px;"></div>' +
    '</div></div>' +

    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-checkin-quickfill\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="confirmCheckinQuickFill()" class="modal-btn primary">✅ 确认登记</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function switchQuickFillTab(tab) {
  ['idcard','history','manual'].forEach(function(t) {
    var btn = document.getElementById('qft-tab-' + t);
    if (btn) { btn.className = 'action-btn' + (t === tab ? ' primary' : ''); }
    var panel = document.getElementById('qft-' + t + '-panel');
    if (panel) { panel.style.display = t === tab ? '' : 'none'; }
  });
}

function simulateIdCardRead() {
  var names = ['赵敏', '钱凤', '周莉', '吴婷', '郑华'];
  var name = names[Math.floor(Math.random() * names.length)];
  var idNo = '3' + Math.floor(Math.random() * 10) + '1' + String(Math.floor(Math.random() * 1e10)).padStart(10, '0').slice(0,10) + String(Math.floor(Math.random() * 10));
  var gender = Math.random() > 0.5 ? '男' : '女';
  var birth = '19' + String(Math.floor(Math.random() * 60) + 60) + '-' + String(Math.floor(Math.random() * 12) + 1).padStart(2,'0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2,'0');
  var provinces = ['上海市', '北京市', '浙江省', '江苏省', '广东省'];
  var addr = provinces[Math.floor(Math.random() * provinces.length)] + ['浦东新区', '海淀区', '西湖区', '玄武区', '天河区'][Math.floor(Math.random() * 5)];

  document.getElementById('qfr-name').textContent = name;
  document.getElementById('qfr-gender').textContent = gender;
  document.getElementById('qfr-birth').textContent = birth;
  document.getElementById('qfr-idno').textContent = idNo;
  document.getElementById('qfr-addr').textContent = addr;
  document.getElementById('qfr-nation').textContent = '汉';

  document.getElementById('idcard-read-result').style.display = '';
  document.getElementById('qfm-name').value = name;
  document.getElementById('qfm-idno').value = idNo;

  // 动画效果
  var area = document.getElementById('idcard-read-area');
  area.style.background = 'var(--green-bg)';
  area.style.borderColor = 'var(--green)';
  showToast('🪪 身份证读取成功：' + name, 'success');
}

function loadCheckinHistoryRecord() {
  var phone = document.getElementById('qft-history-select').value;
  if (!phone) {
    document.getElementById('qft-history-info').style.display = 'none';
    return;
  }
  var h = checkinHistoryDB.find(function(x){ return x.phone === phone; });
  if (!h) return;
  document.getElementById('qfh-name').textContent = h.name;
  document.getElementById('qfh-phone').textContent = h.phone;
  document.getElementById('qfh-room').textContent = h.lastRoom;
  document.getElementById('qfh-visits').textContent = h.visitCount + '次';
  document.getElementById('qfh-date').textContent = h.lastDate;
  document.getElementById('qfh-pref').textContent = h.preference;
  document.getElementById('qft-history-info').style.display = '';

  // 自动填入手动区
  document.getElementById('qfm-name').value = h.name;
  document.getElementById('qfm-phone').value = h.phone;
  document.getElementById('qfm-idno').value = h.idNo;
  document.getElementById('qfm-pref').value = h.preference;
}

function lookupCheckinHistoryByPhone(phone) {
  if (!phone || phone.length < 4) return;
  var h = checkinHistoryDB.find(function(x){ return x.phone.indexOf(phone.replace(/\*/g, '')) >= 0 || phone.indexOf(x.phone.replace(/\*/g, '')) >= 0; });
  if (h) {
    document.getElementById('qfm-name').value = h.name;
    document.getElementById('qfm-idno').value = h.idNo;
    document.getElementById('qfm-pref').value = h.preference;
    showToast('📋 找到历史记录：' + h.name + '（' + h.visitCount + '次入住）', 'info');
  }
}

function confirmCheckinQuickFill() {
  var name = document.getElementById('qfm-name').value.trim();
  var phone = document.getElementById('qfm-phone').value.trim();
  var room = document.getElementById('qfm-room').value;
  var date = document.getElementById('qfm-date').value;
  var pref = document.getElementById('qfm-pref').value.trim();
  if (!name) { showToast('请输入姓名', 'error'); return; }
  if (!room) { showToast('请选择房间', 'error'); return; }
  document.getElementById('modal-checkin-quickfill').remove();
  showToast('✅ 登记成功：' + name + ' 入住 ' + room + '，入住日期：' + date, 'success');
}

// ============================================================
// 【改进v3-New-3】房态实时热力图（楼层×状态双维度视图）
// 理由：原有楼层视图只能按房间号查看，无法快速发现异常状态房间，
//       热力图用颜色直观展示所有房间状态分布，一眼识别脏房/维护/故障。
// ============================================================

var heatmapFloors = ['4F', '3F', '2F', '1F'];
var heatmapRooms = {
  '4F': ['401', '402', '403', '404'],
  '3F': ['301', '302', '303', '304'],
  '2F': ['201', '202', '203', '204'],
  '1F': ['101', '102', '103', '104']
};
var heatmapStatus = {
  '401':'occupied', '402':'vacant', '403':'dirty', '404':'maintenance',
  '301':'occupied', '302':'occupied', '303':'vacant', '304':'dirty',
  '201':'vacant', '202':'occupied', '203':'maintenance', '204':'vacant',
  '101':'occupied', '102':'occupied', '103':'dirty', '104':'vacant'
};

function injectRoomHeatmapPage() {
  var pageHtml = '<div id="page-heatmap" class="page">' +
    '<div class="page-header">' +
    '<div class="page-title">🔥 房态热力图</div>' +
    '<div class="page-sub">楼层×状态双维度热力图 · 快速定位异常房间</div>' +
    '<button class="action-btn small" onclick="openHeatmapFilterModal()" style="padding:4px 10px;background:var(--blue);color:white;border-color:var(--blue);margin-left:auto;">⚙️ 图例配置</button>' +
    '</div>' +
    '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
    '<div style="flex:1;padding:12px 16px;background:var(--green-bg);border-radius:10px;display:flex;align-items:center;gap:8px;">' +
    '<div style="width:16px;height:16px;background:var(--green);border-radius:3px;"></div><span style="font-size:13px;font-weight:600;">空房 <b>' + Object.values(heatmapStatus).filter(function(s){return s==='vacant';}).length + '</b> 间</span></div>' +
    '<div style="flex:1;padding:12px 16px;background:var(--blue-bg);border-radius:10px;display:flex;align-items:center;gap:8px;">' +
    '<div style="width:16px;height:16px;background:var(--blue);border-radius:3px;"></div><span style="font-size:13px;font-weight:600;">在住 <b>' + Object.values(heatmapStatus).filter(function(s){return s==='occupied';}).length + '</b> 间</span></div>' +
    '<div style="flex:1;padding:12px 16px;background:var(--orange-bg);border-radius:10px;display:flex;align-items:center;gap:8px;">' +
    '<div style="width:16px;height:16px;background:var(--orange);border-radius:3px;"></div><span style="font-size:13px;font-weight:600;">脏房 <b>' + Object.values(heatmapStatus).filter(function(s){return s==='dirty';}).length + '</b> 间</span></div>' +
    '<div style="flex:1;padding:12px 16px;background:var(--red-bg);border-radius:10px;display:flex;align-items:center;gap:8px;">' +
    '<div style="width:16px;height:16px;background:var(--red);border-radius:3px;"></div><span style="font-size:13px;font-weight:600;">维护 <b>' + Object.values(heatmapStatus).filter(function(s){return s==='maintenance';}).length + '</b> 间</span></div>' +
    '</div>' +
    '<div class="card">' +
    '<div class="card-header"><div class="card-title">📊 房态热力图（点击房间查看详情）</div></div>' +
    '<div class="card-body" style="padding:20px;">' +
    '<div id="heatmap-container"></div>' +
    '</div></div></div>';
  var floorPage = document.getElementById('page-floor');
  if (floorPage) floorPage.insertAdjacentHTML('afterend', pageHtml);
  renderHeatmap();
}

var heatmapColorMap = {vacant:'var(--green)', occupied:'var(--blue)', dirty:'var(--orange)', maintenance:'var(--red)', offline:'var(--gray-bg)'};

function renderHeatmap() {
  var container = document.getElementById('heatmap-container');
  if (!container) return;
  var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:separate;border-spacing:6px;">';
  // Header
  html += '<thead><tr><th style="width:50px;"></th>';
  var allRooms = [];
  Object.values(heatmapRooms).forEach(function(rooms){ allRooms = allRooms.concat(rooms); });
  var roomTypeMap = {'401':'亲子','402':'大床','403':'标准','404':'套房','301':'标准','302':'大床','303':'亲子','304':'标准','201':'大床','202':'标准','203':'标准','204':'大床','101':'标准','102':'大床','103':'亲子','104':'标准'};
  allRooms.slice(0,8).forEach(function(room) {
    html += '<th style="padding:6px;text-align:center;font-size:11px;color:var(--text-muted);font-weight:600;">' + room + '<br><span style="font-size:10px;color:var(--text-muted);">' + roomTypeMap[room] + '</span></th>';
  });
  html += '</tr></thead><tbody>';
  heatmapFloors.forEach(function(floor) {
    var rooms = (heatmapRooms[floor] || []).slice(0,8);
    html += '<tr>';
    html += '<td style="padding:8px;font-weight:700;font-size:13px;color:var(--text);text-align:center;background:var(--bg);border-radius:6px;">' + floor + '</td>';
    rooms.forEach(function(room) {
      var status = heatmapStatus[room] || 'vacant';
      var color = heatmapColorMap[status] || 'var(--gray-bg)';
      var label = {vacant:'空', occupied:'住', dirty:'脏', maintenance:'维', offline:'离'}[status] || '空';
      html += '<td style="padding:0;text-align:center;">' +
        '<div onclick="openHeatmapRoomDetail(\'' + room + '\', \'' + status + '\')" style="height:52px;background:' + color + ';border-radius:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 0.15s;box-shadow:0 2px 6px rgba(0,0,0,0.08);" ' +
        'onmouseover="this.style.transform=\'scale(1.05)\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.15)\'" ' +
        'onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'0 2px 6px rgba(0,0,0,0.08)\'">' +
        '<span style="font-size:18px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.2);">' + room + '</span>' +
        '<span style="font-size:11px;color:white;opacity:0.9;">' + label + '</span></div></td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function openHeatmapRoomDetail(room, status) {
  var statusLabels = {vacant:'🟢 空房', occupied:'🔵 在住', dirty:'🟠 脏房', maintenance:'🔴 维护中', offline:'⚫ 离线'};
  var guestNames = {occupied:'张三', vacant:'-', dirty:'李四', maintenance:'-', offline:'-'};
  var old = document.getElementById('modal-heatmap-detail');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-heatmap-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:380px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">🚪 房间 ' + room + '</div>' +
    '<button onclick="document.getElementById(\'modal-heatmap-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:14px;background:' + heatmapColorMap[status] + ';border-radius:10px;text-align:center;margin-bottom:14px;">' +
    '<div style="font-size:24px;font-weight:700;color:white;">' + statusLabels[status] + '</div></div>' +
    '<div style="font-size:13px;line-height:2.2;">' +
    '<div><b>房间号：</b>' + room + '</div>' +
    '<div><b>房间类型：</b>标准间</div>' +
    '<div><b>当前状态：</b>' + statusLabels[status] + '</div>' +
    '<div><b>在住客人：</b>' + guestNames[status] + '</div>' +
    '<div><b>入住时间：</b>' + (status === 'occupied' ? '2026-03-27 14:30' : '--') + '</div>' +
    '<div><b>预计退房：</b>' + (status === 'occupied' ? '2026-03-29 12:00' : '--') + '</div>' +
    '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-heatmap-detail\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="showPage(\'room-detail\');document.getElementById(\'modal-heatmap-detail\').remove();" class="modal-btn primary">查看详情</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function openHeatmapFilterModal() {
  showToast('图例配置：🟢空房 🔵在住 🟠脏房 🔴维护', 'info');
}

// ============================================================
// 【改进v3-New-4】设备批量固件升级向导（多选+版本对比+进度跟踪）
// 理由：原系统单设备固件升级效率低，批量升级时可同时选择多台设备、
//       对比固件版本差异、跟踪升级进度，大幅提升工程效率。
// ============================================================

var firmwarePool = [
  {id:'FW-2.1.0', version:'2.1.0', date:'2026-03-01', desc:'修复电池异常掉电问题', compatible:'全部'},
  {id:'FW-2.0.8', version:'2.0.8', date:'2026-02-15', desc:'优化联网握手机制', compatible:'全部'},
  {id:'FW-2.0.5', version:'2.0.5', date:'2026-01-20', desc:'基础锁控功能稳定版', compatible:'全部'},
];

var batchUpgradeDevices = [
  {id:'DEV-001', room:'301', model:'智能门锁A1', currentFw:'2.0.5', selected:false},
  {id:'DEV-002', room:'302', model:'智能门锁A1', currentFw:'2.0.5', selected:false},
  {id:'DEV-003', room:'303', model:'智能门锁A1', currentFw:'2.0.8', selected:false},
  {id:'DEV-004', room:'201', model:'智能门锁A1', currentFw:'2.0.5', selected:false},
  {id:'DEV-005', room:'202', model:'智能门锁A1', currentFw:'2.0.5', selected:false},
  {id:'DEV-006', room:'305', model:'智能门锁A1', currentFw:'2.0.8', selected:false},
];

function openBatchFirmwareUpgradeWizard() {
  var old = document.getElementById('modal-batch-fw-wizard');
  if (old) old.remove();
  window._fwStep = 1;
  renderFwWizardStep();
}

function renderFwWizardStep() {
  var m = document.getElementById('modal-batch-fw-wizard');
  if (m) m.remove();
  var step = window._fwStep || 1;
  var overlay = document.createElement('div');
  overlay.id = 'modal-batch-fw-wizard';
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
  var content = document.createElement('div');
  content.style = 'width:580px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;';
  if (step === 1) content.innerHTML = renderFwStep1();
  else if (step === 2) content.innerHTML = renderFwStep2();
  else if (step === 3) content.innerHTML = renderFwStep3();
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function renderFwStep1() {
  var selectedCount = batchUpgradeDevices.filter(function(d){ return d.selected; }).length;
  var deviceRows = batchUpgradeDevices.map(function(d, i) {
    var needsUpgrade = d.currentFw !== '2.1.0';
    var checked = d.selected ? 'checked' : '';
    var bg = needsUpgrade ? '' : 'background:var(--gray-bg);';
    return '<tr style="' + bg + '">' +
      '<td><input type="checkbox" ' + checked + ' onchange="toggleFwDevice(' + i + ', this.checked)" style="accent-color:var(--blue);width:16px;height:16px);cursor:pointer;"></td>' +
      '<td><b>' + d.room + '</b></td><td>' + d.model + '</td>' +
      '<td><span style="font-size:11px;padding:2px 6px;background:' + (needsUpgrade ? 'var(--orange-bg)' : 'var(--green-bg)') + ';color:' + (needsUpgrade ? 'var(--orange)' : 'var(--green)') + ';border-radius:4px;">v' + d.currentFw + '</span></td>' +
      '<td>' + (needsUpgrade ? '<span style="color:var(--green);">→ v2.1.0</span>' : '<span style="color:var(--text-muted);">已是最新</span>') + '</td></tr>';
  }).join('');
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📦</div>' +
    '<div><div style="font-size:15px;font-weight:700;">批量固件升级 - 选择设备</div><div style="font-size:11px;color:var(--text-muted);">第1步 / 共3步 · 已选 <b id="fw-selected-count">' + selectedCount + '</b> 台设备</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-fw-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
    '<div style="flex:1;padding:8px 12px;background:var(--green-bg);border-radius:6px;font-size:12px;"><b>固件版本：</b>v2.1.0（最新）· 2026-03-01 · 修复电池异常掉电</div>' +
    '</div>' +
    '<table class="table" style="font-size:12px;"><thead><tr><th style="width:40px;"></th><th>房间</th><th>型号</th><th>当前版本</th><th>升级目标</th></tr></thead><tbody>' + deviceRows + '</tbody></table>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-fw-wizard\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="window._fwStep=2;renderFwWizardStep()" class="modal-btn primary" ' + (selectedCount === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '') + '>下一步 →</button></div></div>';
}

function renderFwStep2() {
  var selected = batchUpgradeDevices.filter(function(d){ return d.selected; });
  var compRows = firmwarePool.map(function(fw) {
    return '<tr><td><b>v' + fw.version + '</b></td><td style="font-size:11px;color:var(--text-muted);">' + fw.date + '</td><td style="font-size:11px;">' + fw.desc + '</td></tr>';
  }).join('');
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📊</div>' +
    '<div><div style="font-size:15px;font-weight:700;">版本对比与说明</div><div style="font-size:11px;color:var(--text-muted);">第2步 / 共3步 · 升级至 <b>v2.1.0</b></div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-fw-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📋 固件版本历史</div>' +
    '<table class="table" style="font-size:12px;"><thead><tr><th>版本</th><th>发布日期</th><th>更新说明</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
    '<div style="margin-top:14px;padding:12px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">' +
    '<b>⚠️ 升级须知：</b>升级过程中设备将短暂离线（约30秒），请确保无客人在房间内或提前通知。升级完成后设备将自动重启。</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="window._fwStep=1;renderFwWizardStep()" class="modal-btn secondary">← 上一步</button>' +
    '<button onclick="window._fwStep=3;renderFwWizardStep()" class="modal-btn primary">开始升级 →</button></div></div>';
}

function renderFwStep3() {
  var selected = batchUpgradeDevices.filter(function(d){ return d.selected; });
  var deviceList = selected.map(function(d) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);">' +
      '<div><b>' + d.room + '</b> <span style="font-size:11px;color:var(--text-muted);">' + d.model + '</span></div>' +
      '<div id="fw-upgrade-status-' + d.id + '" style="font-size:12px;color:var(--blue);">⏳ 准备中...</div></div>';
  }).join('');
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🚀</div>' +
    '<div><div style="font-size:15px;font-weight:700;">升级进度</div><div style="font-size:11px;color:var(--text-muted);">第3步 / 共3步 · 共 ' + selected.length + ' 台设备</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-fw-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 20px;max-height:350px;overflow-y:auto;">' +
    '<div id="fw-progress-bar" style="height:8px;background:var(--border);border-radius:4px;margin-bottom:16px;overflow:hidden;">' +
    '<div id="fw-progress-fill" style="height:100%;width:0%;background:var(--blue);border-radius:4px;transition:width 0.3s;"></div></div>' +
    '<div style="margin-bottom:12px;display:flex;justify-content:space-between;font-size:12px;"><span>已升级：<b id="fw-upgraded-count">0</b> / ' + selected.length + '</span><span id="fw-progress-pct">0%</span></div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' + deviceList + '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="startFwBatchUpgrade()" id="fw-start-btn" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">🚀 开始批量升级</button></div></div>';
}

function toggleFwDevice(idx, checked) {
  batchUpgradeDevices[idx].selected = checked;
  var count = batchUpgradeDevices.filter(function(d){ return d.selected; }).length;
  var el = document.getElementById('fw-selected-count');
  if (el) el.textContent = count;
  var btn = document.querySelector('[onclick*="_fwStep=2"]');
  if (btn) { btn.disabled = count === 0; btn.style.opacity = count === 0 ? '0.5' : '1'; btn.style.cursor = count === 0 ? 'not-allowed' : ''; }
}

function startFwBatchUpgrade() {
  var selected = batchUpgradeDevices.filter(function(d){ return d.selected; });
  if (selected.length === 0) return;
  document.getElementById('fw-start-btn').disabled = true;
  document.getElementById('fw-start-btn').textContent = '升级中...';
  var upgraded = 0;
  selected.forEach(function(d, i) {
    setTimeout(function() {
      document.getElementById('fw-upgrade-status-' + d.id).textContent = '✅ 升级成功';
      document.getElementById('fw-upgrade-status-' + d.id).style.color = 'var(--green)';
      upgraded++;
      var pct = Math.round(upgraded / selected.length * 100);
      document.getElementById('fw-progress-fill').style.width = pct + '%';
      document.getElementById('fw-progress-pct').textContent = pct + '%';
      document.getElementById('fw-upgraded-count').textContent = upgraded;
      if (upgraded === selected.length) {
        document.getElementById('fw-start-btn').textContent = '✅ 全部完成';
        document.getElementById('fw-start-btn').style.background = 'var(--green)';
        showToast('✅ 批量固件升级完成！' + upgraded + ' 台设备全部升级至 v2.1.0', 'success');
      }
    }, i * 1500);
  });
}

// ============================================================
// 【改进v3-New-5】交接班日志模板生成器（从运营数据自动生成交接内容）
// 理由：交接班时员工需要手动整理当日运营数据，效率低且容易遗漏，
//       本功能自动汇总告警/入住/工单/能耗等数据，一键生成标准交接模板。
// ============================================================

var handoverTodayStats = {
  date: new Date().toISOString().slice(0,10),
  checkins: 8,
  checkouts: 5,
  occupancy: '78%',
  alerts: 3,
  alertTypes: ['门锁低电量×2', '告警设备×1'],
  workorders: {pending: 2, processing: 1, done: 4},
  energyKwh: 245,
  energyChange: '+5%',
  nightGuests: 12,
  specialNotes: []
};

function openHandoverTemplateGenerator() {
  var old = document.getElementById('modal-handover-generator');
  if (old) old.remove();
  var t = handoverTodayStats;
  var template = generateHandoverTemplate();
  var html = '<div class="modal-overlay" id="modal-handover-generator" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:600px;max-height:88vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📝 交接班日志生成器</div>' +
    '<button onclick="document.getElementById(\'modal-handover-generator\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +

    // 运营数据卡片
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:10px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + t.checkins + '</div><div style="font-size:11px;color:var(--text-muted);">今日入住</div></div>' +
    '<div style="padding:10px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + t.checkouts + '</div><div style="font-size:11px;color:var(--text-muted);">今日退房</div></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + t.alerts + '</div><div style="font-size:11px;color:var(--text-muted);">待处理告警</div></div>' +
    '<div style="padding:10px;background:var(--purple-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--purple);">' + t.occupancy + '</div><div style="font-size:11px;color:var(--text-muted);">入住率</div></div>' +
    '</div>' +

    '<div class="form-group"><label class="form-label">交接班类型</label>' +
    '<select class="form-select" id="hg-shift-type" onchange="regenerateHandoverTemplate()" style="width:100%;padding:8px 10px;font-size:13px;">' +
    '<option value="morning">🌅 早班 → 中班</option><option value="afternoon">☀️ 中班 → 晚班</option><option value="night">🌙 晚班 → 早班</option></select>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">交接内容模板（可直接复制）</label>' +
    '<textarea class="form-textarea" id="hg-template" style="min-height:280px;font-size:12px;font-family:monospace;line-height:1.8;white-space:pre-wrap;">' + template + '</textarea>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
    '<button onclick="copyHandoverTemplate()" class="action-btn small" style="padding:6px 12px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">📋 复制全文</button>' +
    '<button onclick="regenerateHandoverTemplate()" class="action-btn small" style="padding:6px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);">🔄 重新生成</button>' +
    '</div>' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:6px;font-size:11px;color:var(--orange);">' +
    '💡 提示：复制后可粘贴至企业微信/飞书群发送给接班同事</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-handover-generator\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="confirmHandoverTemplate()" class="modal-btn primary">✅ 确认并发送</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function generateHandoverTemplate() {
  var t = handoverTodayStats;
  var now = new Date();
  var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
  var shiftType = document.getElementById('hg-shift-type') ? document.getElementById('hg-shift-type').value : 'morning';
  var shiftLabels = {morning:'早班→中班', afternoon:'中班→晚班', night:'晚班→早班'};
  var alertList = t.alertTypes.length > 0 ? t.alertTypes.map(function(a){ return '  ⚠️ ' + a; }).join('\n') : '  ✅ 无';
  return '═'.repeat(28) + '\n' +
    '  📋 交接班记录 | ' + dateStr + ' ' + shiftLabels[shiftType] + '\n' +
    '═'.repeat(28) + '\n' +
    '【📊 今日运营概况】\n' +
    '  入住 ' + t.checkins + ' 间 | 退房 ' + t.checkouts + ' 间 | 入住率 ' + t.occupancy + '\n' +
    '  在住客人 ' + t.nightGuests + ' 人 | 能耗 ' + t.energyKwh + ' kWh (' + t.energyChange + ')\n\n' +
    '【⚠️ 待处理事项】\n' +
    alertList + '\n' +
    '  📋 今日工单：待处理 ' + t.workorders.pending + ' | 处理中 ' + t.workorders.processing + ' | 已完成 ' + t.workorders.done + '\n\n' +
    '【📝 特别备注】\n' +
    '  （请接班同事补充）\n\n' +
    '【🔜 交班人】________ 【🔜 接班人】________\n' +
    '  交接时间：' + timeStr + '\n' +
    '═'.repeat(28);
}

function regenerateHandoverTemplate() {
  var ta = document.getElementById('hg-template');
  if (ta) ta.value = generateHandoverTemplate();
}

function copyHandoverTemplate() {
  var ta = document.getElementById('hg-template');
  if (!ta) return;
  ta.select();
  document.execCommand('copy');
  showToast('📋 交接班模板已复制到剪贴板！', 'success');
}

function confirmHandoverTemplate() {
  var template = document.getElementById('hg-template').value;
  document.getElementById('modal-handover-generator').remove();
  showToast('✅ 交接班日志已确认！请粘贴至企业微信/飞书发送', 'success');
}

// ============================================================
// 初始化：注入页面 + 挂载到侧边栏
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // 注入押金管理页面
    if (!document.getElementById('page-deposit')) {
      injectDepositRecordsPage();
      renderDepositTable(depositRecords);
    }
    // 注入热力图页面
    if (!document.getElementById('page-heatmap')) {
      injectRoomHeatmapPage();
    }
    // 【改进v3-New-6】注入入住记录管理页面
    if (!document.getElementById('page-checkin-records')) {
      injectCheckinRecordsPage();
      renderCheckinRecordsTable(checkinRecordsDB);
    }
    // 挂载到侧边栏
    var sidebarMenu = document.querySelector('.sidebar .menu');
    if (sidebarMenu) {
      // 押金管理入口
      var depLink = sidebarMenu.querySelector('[onclick*="page-deposit"]');
      if (!depLink) {
        var depItem = document.createElement('div');
        depItem.className = 'menu-item';
        depItem.innerHTML = '<span class="icon">💳</span><span>押金管理</span>';
        depItem.onclick = function() { showPage('deposit'); };
        depItem.style.cursor = 'pointer';
        sidebarMenu.appendChild(depItem);
      }
      // 热力图入口
      var hmLink = sidebarMenu.querySelector('[onclick*="page-heatmap"]');
      if (!hmLink) {
        var hmItem = document.createElement('div');
        hmItem.className = 'menu-item';
        hmItem.innerHTML = '<span class="icon">🔥</span><span>房态热力图</span>';
        hmItem.onclick = function() { showPage('heatmap'); };
        hmItem.style.cursor = 'pointer';
        sidebarMenu.appendChild(hmItem);
      }
      // 入住记录入口
      var crLink = sidebarMenu.querySelector('[onclick*="page-checkin-records"]');
      if (!crLink) {
        var crItem = document.createElement('div');
        crItem.className = 'menu-item';
        crItem.innerHTML = '<span class="icon">📋</span><span>入住记录</span>';
        crItem.onclick = function() { showPage('checkin-records'); };
        crItem.style.cursor = 'pointer';
        sidebarMenu.appendChild(crItem);
      }
    }
    // 首页添加入口按钮
    var homeContent = document.getElementById('home-content') || document.querySelector('#page-home .page-body');
    if (homeContent) {
      var homeBtns = homeContent.querySelector('.action-buttons');
      if (homeBtns && !homeBtns.querySelector('[onclick*="openBatchFirmwareUpgradeWizard"]')) {
        var fwBtn = document.createElement('button');
        fwBtn.className = 'action-btn';
        fwBtn.style.cssText = 'padding:8px 14px;background:var(--purple-bg);color:var(--purple);border-color:var(--purple);font-size:12px;';
        fwBtn.innerHTML = '📦 批量升级';
        fwBtn.onclick = openBatchFirmwareUpgradeWizard;
        homeBtns.appendChild(fwBtn);
      }
      if (homeBtns && !homeBtns.querySelector('[onclick*="openCheckinQuickFillModal"]')) {
        var cfBtn = document.createElement('button');
        cfBtn.className = 'action-btn';
        cfBtn.style.cssText = 'padding:8px 14px;background:var(--green-bg);color:var(--green);border-color:var(--green);font-size:12px;';
        cfBtn.innerHTML = '📋 快速登记';
        cfBtn.onclick = openCheckinQuickFillModal;
        homeBtns.appendChild(cfBtn);
      }
      if (homeBtns && !homeBtns.querySelector('[onclick*="openHandoverTemplateGenerator"]')) {
        var hgBtn = document.createElement('button');
        hgBtn.className = 'action-btn';
        hgBtn.style.cssText = 'padding:8px 14px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);font-size:12px;';
        hgBtn.innerHTML = '📝 交接模板';
        hgBtn.onclick = openHandoverTemplateGenerator;
        homeBtns.appendChild(hgBtn);
      }
      if (homeBtns && !homeBtns.querySelector('[onclick*="openDepositRefundModal"]')) {
        var dpBtn = document.createElement('button');
        dpBtn.className = 'action-btn';
        dpBtn.style.cssText = 'padding:8px 14px;background:var(--orange-bg);color:var(--orange);border-color:var(--orange);font-size:12px;';
        dpBtn.innerHTML = '💳 押金退款';
        dpBtn.onclick = openDepositRefundModal;
        homeBtns.appendChild(dpBtn);
      }
    }
  }, 1200);
});

// ============================================================
// 【改进v3-New-6】入住记录管理页面（完整CRUD：搜索/筛选/导出/详情/删除）
// 理由：原系统入住记录散落在首页，缺乏独立管理页面，财务和运营无法
//       系统性查询历史入住数据。本次新增独立页面，支持按姓名/房间/日期
//       搜索、入住/退房状态筛选、详情弹窗、导出CSV，形成完整入住管理闭环。
// ============================================================

var checkinRecordsDB = [
  {id:'CR-001', room:'301', name:'张三', phone:'138****1234', idNo:'310***********1234', type:'入住', roomType:'亲子间', method:'手机开锁', checkin:'2026-03-25 14:30', checkout:'-', nights:2, deposit:500, status:'在住', operator:'赵飞'},
  {id:'CR-002', room:'302', name:'李四', phone:'139****5678', idNo:'320***********5678', type:'入住', roomType:'标准间', method:'钥匙卡', checkin:'2026-03-20 15:00', checkout:'2026-03-22 11:00', nights:2, deposit:500, status:'已退房', operator:'周敏'},
  {id:'CR-003', room:'303', name:'王五', phone:'137****3456', idNo:'330***********9012', type:'入住', roomType:'大床房', method:'通卡', checkin:'2026-03-18 10:00', checkout:'2026-03-19 12:30', nights:1, deposit:300, status:'已退房', operator:'赵飞'},
  {id:'CR-004', room:'201', name:'赵六', phone:'136****4567', idNo:'340***********3456', type:'入住', roomType:'大床房', method:'手机开锁', checkin:'2026-03-27 16:00', checkout:'-', nights:3, deposit:500, status:'在住', operator:'周敏'},
  {id:'CR-005', room:'401', name:'孙七', phone:'135****5678', idNo:'350***********7890', type:'入住', roomType:'亲子间', method:'身份证', checkin:'2026-03-26 09:00', checkout:'-', nights:2, deposit:500, status:'在住', operator:'赵飞'},
  {id:'CR-006', room:'202', name:'周八', phone:'133****6789', idNo:'360***********2345', type:'入住', roomType:'标准间', method:'手机开锁', checkin:'2026-03-15 14:00', checkout:'2026-03-17 10:00', nights:2, deposit:300, status:'已退房', operator:'周敏'},
  {id:'CR-007', room:'205', name:'吴九', phone:'132****7890', idNo:'370***********6789', type:'入住', roomType:'大床房', method:'钥匙卡', checkin:'2026-03-10 11:00', checkout:'2026-03-12 13:00', nights:2, deposit:500, status:'已退房', operator:'赵飞'},
  {id:'CR-008', room:'303', name:'钱十', phone:'131****8901', idNo:'380***********3456', type:'换房', roomType:'大床房', method:'-', checkin:'2026-03-08 15:00', checkout:'-', nights:0, deposit:0, status:'已退房', operator:'周敏'},
];

function injectCheckinRecordsPage() {
  var pageHtml = '<div id="page-checkin-records" class="page">' +
    '<div class="page-header">' +
    '<div class="page-title">📋 入住记录管理</div>' +
    '<div class="page-sub">入住/退房/换房记录查询 · 支持搜索、筛选、导出</div>' +
    '</div>' +
    // 统计卡片
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--blue-bg);">📋</div><div><div class="stat-num" id="cr-stat-total">' + checkinRecordsDB.length + '</div><div class="stat-label">总记录</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--green-bg);">🟢</div><div><div class="stat-num" id="cr-stat-checkin">' + checkinRecordsDB.filter(function(r){return r.status==='在住';}).length + '</div><div class="stat-label">在住</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--orange-bg);">🟠</div><div><div class="stat-num" id="cr-stat-checkout">' + checkinRecordsDB.filter(function(r){return r.status==='已退房';}).length + '</div><div class="stat-label">已退房</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon" style="background:var(--purple-bg);">🔄</div><div><div class="stat-num" id="cr-stat-change">' + checkinRecordsDB.filter(function(r){return r.type==='换房';}).length + '</div><div class="stat-label">换房</div></div></div>' +
    '</div>' +
    // 搜索筛选栏
    '<div class="card" style="margin-bottom:12px;">' +
    '<div class="card-body" style="padding:12px 20px;">' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
    '<input type="text" class="form-input" id="cr-search-input" placeholder="🔍 搜索姓名/房间/手机号" style="width:220px;padding:7px 12px;font-size:12px;" onkeydown="if(event.key===\'Enter\')applyCheckinRecordSearch()">' +
    '<select class="form-select" id="cr-type-filter" style="padding:7px 10px;font-size:12px;width:120px;" onchange="applyCheckinRecordSearch()">' +
    '<option value="all">全部类型</option><option value="入住">🏨 入住</option><option value="退房">🚪 退房</option><option value="换房">🔄 换房</option></select>' +
    '<select class="form-select" id="cr-status-filter" style="padding:7px 10px;font-size:12px;width:120px;" onchange="applyCheckinRecordSearch()">' +
    '<option value="all">全部状态</option><option value="在住">🟢 在住</option><option value="已退房">🟠 已退房</option></select>' +
    '<select class="form-select" id="cr-operator-filter" style="padding:7px 10px;font-size:12px;width:110px;" onchange="applyCheckinRecordSearch()">' +
    '<option value="all">全部操作员</option><option value="赵飞">赵飞</option><option value="周敏">周敏</option></select>' +
    '<input type="date" class="form-input" id="cr-date-from" style="width:140px;padding:6px 10px;font-size:12px;" value="2026-03-01">' +
    '<span style="color:var(--text-muted);font-size:12px;">至</span>' +
    '<input type="date" class="form-input" id="cr-date-to" style="width:140px;padding:6px 10px;font-size:12px;" value="2026-03-28">' +
    '<button class="action-btn small" onclick="applyCheckinRecordSearch()" style="padding:6px 12px;">🔍</button>' +
    '<button class="action-btn small" onclick="resetCheckinRecordSearch()" style="padding:6px 12px;">重置</button>' +
    '<button class="action-btn small" onclick="exportCheckinRecordsCSV()" style="padding:6px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);">📤 导出</button>' +
    '</div></div></div>' +
    // 记录列表
    '<div class="card">' +
    '<div class="card-header"><div class="card-title">📋 入住记录（<span id="cr-list-count">' + checkinRecordsDB.length + '</span> 条）</div></div>' +
    '<div class="card-body"><table class="table"><thead><tr><th>记录编号</th><th>房间</th><th>姓名</th><th>手机号</th><th>类型</th><th>房型</th><th>入住时间</th><th>退房时间</th><th>状态</th><th>操作员</th><th>操作</th></tr></thead>' +
    '<tbody id="cr-table-body"></tbody></table></div></div></div>';
  var depositPage = document.getElementById('page-deposit');
  if (depositPage) depositPage.insertAdjacentHTML('afterend', pageHtml);
}

function renderCheckinRecordsTable(records) {
  var tbody = document.getElementById('cr-table-body');
  if (!tbody) return;
  var typeMap = {入住:{bg:'var(--green-bg)',color:'var(--green)'}, 退房:{bg:'var(--orange-bg)',color:'var(--orange)'}, 换房:{bg:'var(--purple-bg)',color:'var(--purple)'}};
  var statusMap = {在住:{bg:'var(--green-bg)',color:'var(--green)'}, 已退房:{bg:'var(--orange-bg)',color:'var(--orange)'}};
  var html = '';
  records.forEach(function(r) {
    var t = typeMap[r.type] || typeMap['入住'];
    var s = statusMap[r.status] || statusMap['已退房'];
    html += '<tr>' +
      '<td><span style="font-size:11px;color:var(--blue);font-family:monospace;">' + r.id + '</span></td>' +
      '<td><b>' + r.room + '</b></td>' +
      '<td>' + r.name + '</td>' +
      '<td><span style="font-size:11px;color:var(--text-muted);">' + r.phone + '</span></td>' +
      '<td><span class="tbadge" style="background:' + t.bg + ';color:' + t.color + ';">' + r.type + '</span></td>' +
      '<td>' + r.roomType + '</td>' +
      '<td><span style="font-size:11px;">' + r.checkin + '</span></td>' +
      '<td><span style="font-size:11px;color:' + (r.checkout === '-' ? 'var(--text-muted)' : 'var(--text)') + ';">' + r.checkout + '</span></td>' +
      '<td><span class="tbadge" style="background:' + s.bg + ';color:' + s.color + ';">' + r.status + '</span></td>' +
      '<td>' + r.operator + '</td>' +
      '<td><button class="action-btn small" onclick="openCheckinRecordDetailModal(\'' + r.id + '\')">详情</button> ' +
      (r.status === '在住' ? '<button class="action-btn small orange" onclick="openCrCheckoutModal(\'' + r.id + '\')">退房</button>' : '') +
      '</td></tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="11" style="text-align:center;padding:24px;color:var(--text-muted);">暂无记录</td></tr>';
  var countEl = document.getElementById('cr-list-count');
  if (countEl) countEl.textContent = records.length;
}

function applyCheckinRecordSearch() {
  var keyword = document.getElementById('cr-search-input').value.trim().toLowerCase();
  var type = document.getElementById('cr-type-filter').value;
  var status = document.getElementById('cr-status-filter').value;
  var operator = document.getElementById('cr-operator-filter').value;
  var dateFrom = document.getElementById('cr-date-from').value;
  var dateTo = document.getElementById('cr-date-to').value;
  var filtered = checkinRecordsDB.filter(function(r) {
    if (keyword && r.name.toLowerCase().indexOf(keyword) === -1 && r.room.indexOf(keyword) === -1 && r.phone.indexOf(keyword) === -1) return false;
    if (type !== 'all' && r.type !== type) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (operator !== 'all' && r.operator !== operator) return false;
    if (dateFrom && r.checkin < dateFrom) return false;
    if (dateTo && r.checkin > dateTo + ' 23:59:59') return false;
    return true;
  });
  renderCheckinRecordsTable(filtered);
}

function resetCheckinRecordSearch() {
  document.getElementById('cr-search-input').value = '';
  document.getElementById('cr-type-filter').value = 'all';
  document.getElementById('cr-status-filter').value = 'all';
  document.getElementById('cr-operator-filter').value = 'all';
  renderCheckinRecordsTable(checkinRecordsDB);
}

function openCheckinRecordDetailModal(id) {
  var r = checkinRecordsDB.find(function(x){ return x.id === id; });
  if (!r) return;
  var old = document.getElementById('modal-cr-detail');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-cr-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:520px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">📋 入住记录详情 - ' + r.id + '</div>' +
    '<button onclick="document.getElementById(\'modal-cr-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房间</div><div style="font-size:20px;font-weight:700;">' + r.room + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">状态</div><div style="font-size:16px;font-weight:700;color:var(--green);">' + r.status + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">入住类型</div><div style="font-size:14px;font-weight:600;">' + r.type + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">押金</div><div style="font-size:16px;font-weight:700;color:var(--blue);">¥' + r.deposit + '</div></div>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);line-height:2.2;">' +
    '<div><b>客人姓名：</b>' + r.name + '</div>' +
    '<div><b>手机号码：</b>' + r.phone + '</div>' +
    '<div><b>身份证号：</b>' + r.idNo + '</div>' +
    '<div><b>房间类型：</b>' + r.roomType + '</div>' +
    '<div><b>入住方式：</b>' + r.method + '</div>' +
    '<div><b>入住时间：</b>' + r.checkin + '</div>' +
    '<div><b>退房时间：</b>' + (r.checkout === '-' ? '未退房' : r.checkout) + '</div>' +
    '<div><b>入住天数：</b>' + (r.nights > 0 ? r.nights + '晚' : '-') + '</div>' +
    '<div><b>操作员：</b>' + r.operator + '</div>' +
    '</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-cr-detail\').remove()" class="modal-btn secondary">关闭</button>' +
    (r.status === '在住' ? '<button onclick="openCrCheckoutModal(\'' + r.id + '\');document.getElementById(\'modal-cr-detail\').remove();" class="modal-btn primary" style="background:var(--orange);border-color:var(--orange);">🚪 办理退房</button>' : '') +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function openCrCheckoutModal(id) {
  var r = checkinRecordsDB.find(function(x){ return x.id === id; });
  if (!r) return;
  var old = document.getElementById('modal-cr-checkout');
  if (old) old.remove();
  var roomFee = r.nights > 0 ? r.nights * 128 : 0;
  var html = '<div class="modal-overlay" id="modal-cr-checkout" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:420px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">🚪 退房办理 - ' + r.room + '房间</div>' +
    '<button onclick="document.getElementById(\'modal-cr-checkout').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;text-align:center;">' +
    '<div style="font-size:14px;color:var(--text-muted);margin-bottom:4px;">客人</div><div style="font-size:18px;font-weight:700;">' + r.name + '</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">入住天数</div><div style="font-size:20px;font-weight:700;color:var(--blue);">' + r.nights + '晚</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">房费合计</div><div style="font-size:20px;font-weight:700;color:var(--green);">¥' + roomFee + '</div></div>' +
    '</div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;margin-bottom:14px;font-size:12px;display:flex;justify-content:space-between;"><span>押金（已付）</span><b style="color:var(--blue);">¥' + r.deposit + '</b></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="cr-co-remark" style="min-height:60px;font-size:12px;" placeholder="退房备注，如：房间有损坏"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-cr-checkout\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="submitCrCheckout(\'' + r.id + '\')" class="modal-btn primary" style="background:var(--orange);border-color:var(--orange);">✅ 确认退房</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitCrCheckout(id) {
  var r = checkinRecordsDB.find(function(x){ return x.id === id; });
  if (!r) return;
  var remark = document.getElementById('cr-co-remark').value.trim();
  r.status = '已退房';
  r.checkout = new Date().toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g,'-');
  document.getElementById('modal-cr-checkout').remove();
  renderCheckinRecordsTable(checkinRecordsDB);
  updateCrStats();
  showToast('✅ 退房成功！' + r.name + ' 已退房', 'success');
}

function updateCrStats() {
  var totalEl = document.getElementById('cr-stat-total');
  if (totalEl) totalEl.textContent = checkinRecordsDB.length;
  var checkinEl = document.getElementById('cr-stat-checkin');
  if (checkinEl) checkinEl.textContent = checkinRecordsDB.filter(function(r){return r.status==='在住';}).length;
  var checkoutEl = document.getElementById('cr-stat-checkout');
  if (checkoutEl) checkoutEl.textContent = checkinRecordsDB.filter(function(r){return r.status==='已退房';}).length;
  var changeEl = document.getElementById('cr-stat-change');
  if (changeEl) changeEl.textContent = checkinRecordsDB.filter(function(r){return r.type==='换房';}).length;
}

function exportCheckinRecordsCSV() {
  var csv = '\uFEFF记录编号,房间,姓名,手机号,身份证,类型,房型,入住时间,退房时间,天数,押金,状态,操作员\n';
  checkinRecordsDB.forEach(function(r) {
    csv += r.id + ',' + r.room + ',' + r.name + ',' + r.phone + ',' + r.idNo + ',' + r.type + ',' + r.roomType + ',' + r.checkin + ',' + r.checkout + ',' + r.nights + ',' + r.deposit + ',' + r.status + ',' + r.operator + '\n';
  });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '入住记录_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('入住记录已导出（' + checkinRecordsDB.length + ' 条）', 'success');
}

// ============================================================
// 【改进v3-New-7】员工绩效评估弹窗（KPI雷达图+评分+评语）
// 理由：员工管理仅有增删改查，缺少绩效评估功能。本次新增绩效评估弹窗，
//       支持选择考核维度（服务态度/业务能力/出勤/协作），输入评分（1-5星）
//       和评语，自动计算综合评分并生成评估报告。
// ============================================================

var staffPerformanceDB = [
  {staffId:'SP-001', name:'赵飞', dept:'前厅', position:'主管', period:'2026-03', scores:{service:4.5, skill:4.2, attendance:5.0, teamwork:4.0}, overall:4.4, comment:'工作认真负责，服务态度好，出勤率100%。', evaluator:'店长', date:'2026-03-25'},
  {staffId:'SP-002', name:'周敏', dept:'前厅', position:'接待员', period:'2026-03', scores:{service:4.8, skill:4.0, attendance:4.5, teamwork:4.5}, overall:4.5, comment:'微笑服务突出，业务学习积极，与团队协作良好。', evaluator:'店长', date:'2026-03-25'},
];

function openStaffPerformanceModal(idx) {
  var staff = staffListData[idx];
  if (!staff) return;
  var old = document.getElementById('modal-staff-performance');
  if (old) old.remove();
  var existing = staffPerformanceDB.find(function(p){ return p.name === staff.name && p.period === '2026-03'; });
  var existingScores = existing ? existing.scores : {service:0, skill:0, attendance:0, teamwork:0};
  var existingComment = existing ? existing.comment : '';

  var html = '<div class="modal-overlay" id="modal-staff-performance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:540px;max-height:88vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📊</div><div><div style="font-size:15px;font-weight:700;">员工绩效评估</div><div style="font-size:11px;color:var(--text-muted);">' + staff.name + ' · ' + staff.dept + '部 · ' + staff.position + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-staff-performance\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px;background:var(--blue-bg);border-radius:10px;">' +
    '<div style="font-size:32px;">👤</div>' +
    '<div><div style="font-size:15px;font-weight:700;">' + staff.name + '</div><div style="font-size:12px;color:var(--text-muted);">' + staff.dept + '部 · ' + staff.position + ' · 入职 ' + staff.join + '</div></div>' +
    '</div>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📋 考核周期：2026年3月</div>' +
    '<div style="margin-bottom:16px;">';

  var dims = [
    {key:'service', label:'服务态度', icon:'😊', desc:'客户满意度、微笑服务、沟通能力'},
    {key:'skill', label:'业务能力', icon:'💼', desc:'业务操作熟练度、问题解决能力'},
    {key:'attendance', label:'出勤表现', icon:'⏰', desc:'出勤率、迟到早退、守时情况'},
    {key:'teamwork', label:'团队协作', icon:'🤝', desc:'配合度、跨部门协作、积极性'}
  ];

  dims.forEach(function(d) {
    var savedVal = existingScores[d.key] || 0;
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">' +
      '<div style="font-size:20px;width:28px;text-align:center;">' + d.icon + '</div>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + d.label + '</div><div style="font-size:11px;color:var(--text-muted);">' + d.desc + '</div></div>' +
      '<div style="display:flex;gap:4px;" id="sp-stars-' + d.key + '">';
    for (var i = 1; i <= 5; i++) {
      html += '<span onclick="setSpScore(\'' + d.key + '\', ' + i + ')" style="font-size:20px;cursor:pointer;color:' + (i <= savedVal ? 'var(--orange)' : 'var(--border)') + ';">★</span>';
    }
    html += '</div><div style="width:40px;text-align:right;font-size:13px;font-weight:700;color:var(--blue);" id="sp-score-val-' + d.key + '">' + (savedVal > 0 ? savedVal.toFixed(1) : '-') + '</div></div>';
  });

  html += '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--purple-bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--purple);">📊 综合评分</div>' +
    '<div style="font-size:28px;font-weight:900;color:var(--purple);" id="sp-overall-score">-</div></div>' +
    '<div class="form-group"><label class="form-label">评估评语</label>' +
    '<textarea class="form-textarea" id="sp-comment" style="min-height:80px;font-size:12px;" placeholder="输入对该员工本月工作的评价...">' + existingComment + '</textarea></div>' +
    '<div class="form-group"><label class="form-label">评估人</label>' +
    '<input type="text" class="form-input" id="sp-evaluator" value="店长" style="width:200px;padding:8px 10px;font-size:13px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-staff-performance\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="submitStaffPerformance(\'' + staff.name + '\')" class="modal-btn primary" style="background:var(--purple);border-color:var(--purple);">✅ 提交评估</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window._spScores = {service: existingScores.service, skill: existingScores.skill, attendance: existingScores.attendance, teamwork: existingScores.teamwork};
  updateSpOverall();
}

function setSpScore(key, val) {
  window._spScores[key] = val;
  var stars = document.querySelectorAll('#sp-stars-' + key + ' span');
  stars.forEach(function(s, i) {
    s.style.color = i < val ? 'var(--orange)' : 'var(--border)';
  });
  document.getElementById('sp-score-val-' + key).textContent = val + '.0';
  updateSpOverall();
}

function updateSpOverall() {
  var s = window._spScores || {};
  var scores = [s.service, s.skill, s.attendance, s.teamwork].filter(function(v){ return v > 0; });
  if (scores.length === 0) return;
  var avg = scores.reduce(function(a, b){ return a + b; }, 0) / scores.length;
  document.getElementById('sp-overall-score').textContent = avg.toFixed(1);
}

function submitStaffPerformance(name) {
  var s = window._spScores || {};
  var scores = [s.service, s.skill, s.attendance, s.teamwork].filter(function(v){ return v > 0; });
  if (scores.length < 4) { showToast('请为所有考核维度评分', 'error'); return; }
  var overall = scores.reduce(function(a, b){ return a + b; }, 0) / scores.length;
  var comment = document.getElementById('sp-comment').value.trim();
  var evaluator = document.getElementById('sp-evaluator').value.trim() || '店长';
  var existing = staffPerformanceDB.findIndex(function(p){ return p.name === name && p.period === '2026-03'; });
  var record = {staffId:'SP-' + Date.now(), name:name, dept:'', position:'', period:'2026-03', scores:JSON.parse(JSON.stringify(s)), overall:overall, comment:comment, evaluator:evaluator, date:new Date().toISOString().slice(0,10)};
  if (existing >= 0) {
    staffPerformanceDB[existing] = record;
  } else {
    staffPerformanceDB.push(record);
  }
  document.getElementById('modal-staff-performance').remove();
  showToast('✅ 绩效评估已提交：' + name + '，综合评分 ' + overall.toFixed(1), 'success');
}

// ============================================================
// 【改进v3-New-8】能耗异常告警配置弹窗（房间阈值+告警规则+历史记录）
// 理由：能耗管理仅有数据展示，缺少用户自定义阈值和告警规则配置。
//       本功能支持按房间设置日/月能耗阈值、异常告警开关、告警接收人配置，
//       并展示该房间历史告警记录，形成完整的能耗风控闭环。
// ============================================================

var energyAlertConfig = {
  '301': {dayThreshold:12, monthThreshold:280, enabled:true, notifyPhone:'138****1234'},
  '302': {dayThreshold:8, monthThreshold:200, enabled:true, notifyPhone:'139****5678'},
  '304': {dayThreshold:10, monthThreshold:250, enabled:false, notifyPhone:''},
  '201': {dayThreshold:10, monthThreshold:220, enabled:true, notifyPhone:'136****4567'},
};

var energyAlertHistory = [
  {id:'EA-001', room:'301', type:'日超限', threshold:12, actual:14.2, time:'2026-03-27 23:30', handled:false, handler:'', result:''},
  {id:'EA-002', room:'304', type:'月超限', threshold:250, actual:278.5, time:'2026-03-26 18:00', handled:true, handler:'王工', result:'已上门检查，租客使用大功率电器，已告知注意'},
  {id:'EA-003', room:'201', type:'日超限', threshold:10, actual:11.8, time:'2026-03-25 22:00', handled:true, handler:'王工', result:'空调温度设置过低，已调整为合理范围'},
];

function openEnergyAlertConfigModal(room) {
  var cfg = energyAlertConfig[room] || {dayThreshold:10, monthThreshold:250, enabled:true, notifyPhone:''};
  var old = document.getElementById('modal-energy-alert-config');
  if (old) old.remove();
  var roomHistory = energyAlertHistory.filter(function(h){ return h.room === room; });
  var historyRows = roomHistory.map(function(h) {
    var statusBg = h.handled ? 'var(--green-bg)' : 'var(--orange-bg)';
    var statusColor = h.handled ? 'var(--green)' : 'var(--orange)';
    return '<div style="padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
      '<span style="font-weight:700;">' + h.id + ' · ' + h.type + '</span>' +
      '<span style="padding:2px 8px;background:' + statusBg + ';color:' + statusColor + ';border-radius:10px;font-size:11px;">' + (h.handled ? '已处理' : '待处理') + '</span></div>' +
      '<div style="color:var(--text-muted);font-size:11px;">阈值：' + h.threshold + ' | 实际：' + h.actual + ' | ' + h.time + '</div>' +
      (h.handled ? '<div style="color:var(--green);font-size:11px;margin-top:2px;">处理：' + h.handler + ' → ' + h.result + '</div>' : '') +
      '</div>';
  }).join('') || '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">暂无告警记录</div>';

  var html = '<div class="modal-overlay" id="modal-energy-alert-config" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">⚡</div><div><div style="font-size:15px;font-weight:700;">能耗告警配置</div><div style="font-size:11px;color:var(--text-muted);">' + room + ' 房间 · 阈值设置与告警规则</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-energy-alert-config\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 启用开关
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;">' +
    '<div><div style="font-size:13px;font-weight:700;">🔔 能耗告警总开关</div><div style="font-size:11px;color:var(--text-muted);">关闭后该房间将不触发任何能耗告警</div></div>' +
    '<label style="position:relative;width:44px;height:24px;cursor:pointer;">' +
    '<input type="checkbox" id="eac-enabled" ' + (cfg.enabled ? 'checked' : '') + ' onchange="toggleEacEnabled(this.checked)" style="opacity:0;width:0;height:0;">' +
    '<span id="eac-toggle-track" style="position:absolute;top:0;left:0;right:0;bottom:0;background:' + (cfg.enabled ? 'var(--green)' : 'var(--border)') + ';border-radius:12px;transition:all 0.2s;"></span>' +
    '<span id="eac-toggle-thumb" style="position:absolute;top:2px;left:' + (cfg.enabled ? '22px' : '2px') + ';width:20px;height:20px;background:white;border-radius:50%;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>' +
    '</label></div>' +
    // 阈值配置
    '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📊 告警阈值</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div class="form-group"><label class="form-label">日用量阈值（kWh）</label>' +
    '<input type="number" class="form-input" id="eac-day-threshold" value="' + cfg.dayThreshold + '" style="font-size:16px;font-weight:700;color:var(--blue);"></div>' +
    '<div class="form-group"><label class="form-label">月用量阈值（kWh）</label>' +
    '<input type="number" class="form-input" id="eac-month-threshold" value="' + cfg.monthThreshold + '" style="font-size:16px;font-weight:700;color:var(--blue);"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">告警通知手机号</label>' +
    '<input type="text" class="form-input" id="eac-phone" value="' + cfg.notifyPhone + '" placeholder="输入接收告警的手机号" style="width:100%;padding:8px 10px;font-size:13px;"></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border-radius:6px;font-size:12px;color:var(--orange);margin-bottom:14px;">💡 告警触发条件：日用量超过阈值 或 月用量超过阈值均会触发</div>' +
    // 历史告警
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">📋 告警历史记录</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;">' + historyRows + '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-energy-alert-config\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="saveEnergyAlertConfig(\'' + room + '\')" class="modal-btn primary">✅ 保存配置</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function toggleEacEnabled(enabled) {
  var track = document.getElementById('eac-toggle-track');
  var thumb = document.getElementById('eac-toggle-thumb');
  if (track) track.style.background = enabled ? 'var(--green)' : 'var(--border)';
  if (thumb) thumb.style.left = enabled ? '22px' : '2px';
}

function saveEnergyAlertConfig(room) {
  var dayThreshold = parseFloat(document.getElementById('eac-day-threshold').value) || 10;
  var monthThreshold = parseFloat(document.getElementById('eac-month-threshold').value) || 250;
  var notifyPhone = document.getElementById('eac-phone').value.trim();
  var enabled = document.getElementById('eac-enabled').checked;
  energyAlertConfig[room] = {dayThreshold:dayThreshold, monthThreshold:monthThreshold, enabled:enabled, notifyPhone:notifyPhone};
  document.getElementById('modal-energy-alert-config').remove();
  showToast('✅ 能耗告警配置已保存：' + room + ' 房间', 'success');
}

// ============================================================
// 【改进v3-New-9】客房生命周期历程弹窗（入住→退房的完整时间线）
// 理由：房间详情页缺少从入住到退房的完整生命周期视图。本次新增历程弹窗，
//       展示房间在当前在住客人的完整时间线：入住登记→门卡制作→钥匙发放→
//       日常服务→退房结算→卫生检查，形成可追溯的服务闭环。
// ============================================================

var roomLifecycleDB = {
  '301': {
    guest:'张三', checkinTime:'2026-03-25 14:30', checkoutPlan:'2026-03-27 12:00',
    events:[
      {time:'2026-03-25 14:30', label:'🏨 入住登记', desc:'办理入住，押金¥500，2晚', icon:'📋', color:'var(--green)'},
      {time:'2026-03-25 14:45', label:'💳 门卡制作', desc:'制作门卡2张，有效期至03-27 12:00', icon:'💳', color:'var(--blue)'},
      {time:'2026-03-25 14:50', label:'🔑 钥匙发放', desc:'发放房间钥匙1把', icon:'🔑', color:'var(--blue)'},
      {time:'2026-03-25 15:10', label:'🧹 入住卫生', desc:'客房已完成清洁检查', icon:'✅', color:'var(--green)'},
      {time:'2026-03-26 09:30', label:'📞 叫醒服务', desc:'客人要求07:00叫醒，已设置', icon:'⏰', color:'var(--orange)'},
      {time:'2026-03-26 20:15', label:'🔧 客房报修', desc:'房门有异响，工程部已接单', icon:'🔧', color:'var(--orange)'},
      {time:'2026-03-27 10:00', label:'📦 退房准备', desc:'提醒客人12:00前退房', icon:'📦', color:'var(--purple)'},
    ]
  }
};

function openRoomLifecycleModal(room) {
  var data = roomLifecycleDB[room] || null;
  var old = document.getElementById('modal-room-lifecycle');
  if (old) old.remove();
  if (!data) {
    showToast(room + ' 房间暂无在住客人历程数据', 'info');
    return;
  }
  var timeline = data.events.map(function(e, i) {
    var isLast = i === data.events.length - 1;
    return '<div style="display:flex;gap:12px;margin-bottom:' + (isLast ? '0' : '16px') + ';">' +
      '<div style="display:flex;flex-direction:column;align-items:center;">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:' + e.color + ';display:flex;align-items:center;justify-content:center;font-size:16px;color:white;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.15);">' + e.icon + '</div>' +
      (!isLast ? '<div style="width:2px;flex:1;background:var(--border);margin-top:4px;min-height:20px;"></div>' : '') +
      '</div>' +
      '<div style="flex:1;padding-bottom:' + (isLast ? '0' : '4px') + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">' +
      '<span style="font-size:13px;font-weight:700;">' + e.label + '</span>' +
      '<span style="font-size:11px;color:var(--text-muted);">' + e.time + '</span></div>' +
      '<div style="font-size:12px;color:var(--text-light);">' + e.desc + '</div></div></div>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-room-lifecycle" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:540px;max-height:88vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🕐</div><div><div style="font-size:15px;font-weight:700;">客房生命周期</div><div style="font-size:11px;color:var(--text-muted);">' + room + ' 房间 · ' + data.guest + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-room-lifecycle\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 住客概览
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">在住客人</div><div style="font-size:14px;font-weight:700;color:var(--blue);">' + data.guest + '</div></div>' +
    '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">入住时间</div><div style="font-size:12px;font-weight:700;color:var(--green);">' + data.checkinTime + '</div></div>' +
    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">计划退房</div><div style="font-size:12px;font-weight:700;color:var(--orange);">' + data.checkoutPlan + '</div></div>' +
    '</div>' +
    // 时间线
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📍 服务历程时间线</div>' +
    '<div style="padding:14px;background:var(--bg);border-radius:10px;">' + timeline + '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-room-lifecycle\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="openDeviceDetailModal(\'' + room + '\')" class="modal-btn primary" style="background:var(--blue);border-color:var(--blue);">📱 设备详情</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【改进v3-New-10】设备远程诊断弹窗（电池历史曲线+信号分析+固件更新检测）
// 理由：设备详情页仅有基础信息，缺少远程诊断能力。本次新增诊断弹窗，
//       展示设备电池历史曲线、信号强度分析、固件更新检测（与最新版本对比），
//       远程执行一键诊断并实时显示结果，形成完整的设备健康管理体系。
// ============================================================

var deviceDiagnosisData = {};

function openDeviceDiagnosisModal(roomNum) {
  var old = document.getElementById('modal-device-diagnosis');
  if (old) old.remove();
  var d = deviceDetailModalData[roomNum] || deviceDetailModalData['301'];
  // Simulate battery history
  var batteryHistory = [92, 88, 85, 82, 78, 75, 72, 68, 65, 62, 58, 55, 52, 48, 45, 42, 38, 35, 32, 28, 25, 22, 18, 15];
  var signalHistory = [85, 82, 88, 80, 83, 78, 85, 75, 82, 79, 83, 77, 80, 76, 82, 78, 83, 75, 80, 77, 82, 78, 75, 72];
  var days = ['27', '26', '25', '24', '23', '22', '21', '20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '09', '08', '07', '06', '05', '04'];

  var batMax = Math.max.apply(null, batteryHistory);
  var batMin = Math.min.apply(null, batteryHistory);
  var sigAvg = Math.round(signalHistory.reduce(function(a,b){return a+b;},0)/signalHistory.length);
  var currentFw = d.firmware || '2.1.0';
  var latestFw = '2.4.1';
  var fwNeedsUpdate = currentFw !== latestFw;

  var html = '<div class="modal-overlay" id="modal-device-diagnosis" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🔬</div><div><div style="font-size:15px;font-weight:700;">设备远程诊断</div><div style="font-size:11px;color:var(--text-muted);">' + roomNum + ' · ' + d.model + ' · ' + d.uuid.slice(0,17) + '...</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-device-diagnosis\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 诊断概览卡片
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="text-align:center;padding:12px;background:var(--green-bg);border-radius:8px;"><div style="font-size:22px;font-weight:900;color:var(--green);">' + d.battery + '%</div><div style="font-size:11px;color:var(--text-muted);">当前电量</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:22px;font-weight:900;color:var(--blue);">' + sigAvg + '%</div><div style="font-size:11px;color:var(--text-muted);">信号均值</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:22px;font-weight:900;color:var(--purple);">v' + currentFw + '</div><div style="font-size:11px;color:var(--text-muted);">当前固件</div></div>' +
    '<div style="text-align:center;padding:12px;background:' + (fwNeedsUpdate ? 'var(--orange-bg)' : 'var(--green-bg)') + ';border-radius:8px;"><div style="font-size:22px;font-weight:900;color:' + (fwNeedsUpdate ? 'var(--orange)' : 'var(--green)') + ';">v' + latestFw + '</div><div style="font-size:11px;color:var(--text-muted);">最新固件</div></div>' +
    '</div>' +
    // 电池历史曲线
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">🔋 电池历史（近30天）</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="height:60px;display:flex;align-items:flex-end;gap:2px;">';
  batteryHistory.forEach(function(v, i) {
    var h = Math.round((v / batMax) * 50) + 10;
    var color = v > 50 ? 'var(--green)' : v > 20 ? 'var(--orange)' : 'var(--red)';
    html += '<div style="flex:1;height:' + h + 'px;background:' + color + ';border-radius:2px 2px 0 0;cursor:pointer;" title="' + days[i] + '日: ' + v + '%"></div>';
  });
  html += '</div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px;">' +
    '<span>04日 ' + batteryHistory[batteryHistory.length-1] + '%</span><span>今天 ' + batteryHistory[0] + '%（↓' + (batMax - batteryHistory[0]) + '%）</span></div></div>' +
    // 信号强度曲线
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">📶 信号强度分析（近30天）</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="height:60px;display:flex;align-items:flex-end;gap:2px;">';
  signalHistory.forEach(function(v, i) {
    var h = Math.round((v / 100) * 50) + 10;
    var color = v > 75 ? 'var(--green)' : v > 50 ? 'var(--orange)' : 'var(--red)';
    html += '<div style="flex:1;height:' + h + 'px;background:' + color + ';border-radius:2px 2px 0 0;cursor:pointer;" title="' + days[i] + '日: ' + v + '%"></div>';
  });
  html += '</div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px;">' +
    '<span>平均信号强度：' + sigAvg + '%</span><span style="color:' + (sigAvg > 75 ? 'var(--green)' : 'var(--orange)') + ';">' + (sigAvg > 75 ? '信号良好' : '信号偏弱，建议检查') + '</span></div></div>' +
    // 固件版本检测
    '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">📡 固件更新检测</div>' +
    '<div style="padding:12px;background:' + (fwNeedsUpdate ? 'var(--orange-bg)' : 'var(--green-bg)') + ';border:1px solid ' + (fwNeedsUpdate ? 'var(--orange)' : 'var(--green)') + ';border-radius:8px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:13px;font-weight:700;color:' + (fwNeedsUpdate ? 'var(--orange)' : 'var(--green)') + ';">' + (fwNeedsUpdate ? '⚠️ 发现新版本' : '✅ 已是最新版本') + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">当前：v' + currentFw + ' | 最新：v' + latestFw + (fwNeedsUpdate ? ' | 包含安全补丁和功能优化' : '') + '</div></div>' +
    (fwNeedsUpdate ? '<button onclick="showToast(\'已向 ' + roomNum + ' 发送远程升级请求...\',\'info\')" style="padding:8px 14px;background:var(--orange);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">📦 立即升级</button>' : '<span style="font-size:24px;">✅</span>') +
    '</div>' +
    // 一键诊断
    '<div id="ddiagnosis-progress" style="display:none;margin-bottom:14px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--blue);">🔄 诊断进度：<span id="ddiagnosis-step-text">准备中...</span></div>' +
    '<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div id="ddiagnosis-bar" style="height:100%;width:0%;background:var(--blue);border-radius:3px;transition:width 0.3s;"></div></div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="document.getElementById(\'modal-device-diagnosis\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="runDeviceDiagnosis(\'' + roomNum + '\')" id="ddiagnosis-run-btn" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">🔬 一键诊断</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function runDeviceDiagnosis(roomNum) {
  var progress = document.getElementById('ddiagnosis-progress');
  var bar = document.getElementById('ddiagnosis-bar');
  var stepText = document.getElementById('ddiagnosis-step-text');
  var btn = document.getElementById('ddiagnosis-run-btn');
  if (!progress || !bar || !stepText) return;
  progress.style.display = 'block';
  btn.disabled = true;
  btn.textContent = '诊断中...';

  var steps = ['连接设备...', '检测电池模块...', '分析信号强度...', '检查固件版本...', '验证通信加密...', '生成诊断报告...'];
  var current = 0;
  function tick() {
    if (current < steps.length) {
      var pct = Math.round((current / steps.length) * 100);
      bar.style.width = pct + '%';
      stepText.textContent = steps[current];
      current++;
      setTimeout(tick, 600);
    } else {
      bar.style.width = '100%';
      stepText.textContent = '诊断完成！';
      btn.textContent = '✅ 诊断完成';
      btn.style.background = 'var(--green)';
      showToast('🔬 ' + roomNum + ' 设备诊断完成：电池健康、信号正常、固件可升级', 'success');
    }
  }
  setTimeout(tick, 300);
}
