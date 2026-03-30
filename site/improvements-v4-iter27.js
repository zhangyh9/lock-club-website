// ============================================================
// 【物联后台 v4 第27轮 - 结算中心5个断裂函数补全】
// 理由：page-settlement页面的批量结算/结算历史/详情查看/Tab切换/全选按钮调用了5个缺失函数
// 改进：实现 openBatchSettlementModal / openSettlementHistoryModal / openSettlementDetail / filterSettlement / toggleAllSettlementSelect
// ============================================================

// -------- 改进1：批量结算弹窗 --------
window.openBatchSettlementModal = function() {
  var existing = document.getElementById('modal-batch-settlement');
  if (existing) existing.remove();
  var checked = document.querySelectorAll('.stl-row-check:checked');
  var count = checked.length;
  if (count === 0) { showToast('请先选择要结算的房间', 'warning'); return; }
  var totalAmount = 0;
  var rooms = [];
  checked.forEach(function(cb) {
    var tr = cb.closest('tr');
    if (tr) {
      var cells = tr.querySelectorAll('td');
      if (cells.length >= 9) {
        var room = cells[1] ? cells[1].textContent.trim() : '';
        var amount = cells[8] ? parseFloat(cells[8].textContent.replace(/[^0-9.]/g, '')) : 0;
        totalAmount += amount;
        rooms.push(room);
      }
    }
  });
  var html = '<div class="modal-overlay hidden" id="modal-batch-settlement" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-settlement\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🔄</div><div style="font-size:15px;font-weight:700;">批量结算确认</div>' +
    '<button onclick="document.getElementById(\'modal-batch-settlement\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:14px;font-size:12px;color:var(--blue);">' +
    '📋 将对 ' + count + ' 个房间进行批量结算</div>' +
    '<div style="margin-bottom:14px;font-size:13px;color:var(--text-muted);">房间号：' + rooms.join('、') + '</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:14px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;"><span>结算房间数</span><span style="font-weight:700;color:var(--blue);">' + count + ' 间</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:13px;"><span>应付总额</span><span style="font-weight:700;color:var(--orange);font-size:16px;">¥' + totalAmount.toFixed(0) + '</span></div></div>' +
    '<div class="form-group"><label class="form-label">统一支付方式</label>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';document.querySelectorAll(\'.bs-pay-btn\').forEach(function(b){if(b!==this){b.style.borderColor=\'var(--border)\';b.style.background=\'\';}},this);window._batchPayMethod=\'wechat\'" class="bs-pay-btn" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:13px;">💚 微信</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';document.querySelectorAll(\'.bs-pay-btn\').forEach(function(b){if(b!==this){b.style.borderColor=\'var(--border)\';b.style.background=\'\';}},this);window._batchPayMethod=\'alipay\'" class="bs-pay-btn" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:13px;">💙 支付宝</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';document.querySelectorAll(\'.bs-pay-btn\').forEach(function(b){if(b!==this){b.style.borderColor=\'var(--border)\';b.style.background=\'\';}},this);window._batchPayMethod=\'cash\'" class="bs-pay-btn" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:13px;">💵 现金</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';document.querySelectorAll(\'.bs-pay-btn\').forEach(function(b){if(b!==this){b.style.borderColor=\'var(--border)\';b.style.background=\'\';}},this);window._batchPayMethod=\'card\'" class="bs-pay-btn" style="padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:13px;">💳 卡类</button></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-settlement\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="doBatchSettlement(' + count + ')" style="padding:10px 24px;background:var(--green);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">✅ 确认结算（' + count + '间）</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window._batchPayMethod = 'wechat';
};

window.doBatchSettlement = function(count) {
  var method = window._batchPayMethod || 'wechat';
  var methodLabel = {wechat:'微信',alipay:'支付宝',cash:'现金',card:'卡类'}[method] || '微信';
  document.getElementById('modal-batch-settlement') && document.getElementById('modal-batch-settlement').remove();
  // Uncheck all
  document.querySelectorAll('.stl-row-check').forEach(function(cb) { cb.checked = false; });
  var allCheckbox = document.getElementById('stl-select-all');
  if (allCheckbox) allCheckbox.checked = false;
  // Update stats
  var pendingCount = document.getElementById('stl-pending-count');
  if (pendingCount) {
    var n = Math.max(0, parseInt(pendingCount.textContent) - count);
    pendingCount.textContent = n;
  }
  var pendingAmount = document.getElementById('stl-pending-amount');
  if (pendingAmount) {
    var a = Math.max(0, parseFloat(pendingAmount.textContent.replace('¥','')) - count * 128);
    pendingAmount.textContent = '¥' + Math.round(a);
  }
  showToast('✅ 批量结算完成！' + count + '间房已结算（' + methodLabel + '支付）', 'success');
};

// -------- 改进2：结算历史弹窗 --------
window.openSettlementHistoryModal = function() {
  var existing = document.getElementById('modal-settlement-history');
  if (existing) existing.remove();
  var historyData = [
    {id:'STL-2026032701',room:'301',name:'张三',time:'2026-03-27 10:30',nights:'1晚',amount:128,deposit:100,payMethod:'微信',status:'已完成'},
    {id:'STL-2026032702',room:'205',name:'赵七',time:'2026-03-27 09:15',nights:'2晚',amount:216,deposit:100,payMethod:'支付宝',status:'已完成'},
    {id:'STL-2026032601',room:'102',name:'周八',time:'2026-03-26 16:45',nights:'1晚',amount:138,deposit:100,payMethod:'现金',status:'已完成'},
    {id:'STL-2026032602',room:'303',name:'吴九',time:'2026-03-26 14:00',nights:'3晚',amount:324,deposit:100,payMethod:'微信',status:'已完成'},
    {id:'STL-2026032501',room:'202',name:'郑十',time:'2026-03-25 11:20',nights:'2晚',amount:236,deposit:100,payMethod:'卡类',status:'已完成'}
  ];
  var rows = historyData.map(function(d, i) {
    var methodIcon = {微信:'💚',支付宝:'💙',现金:'💵',卡类:'💳'}[d.payMethod] || '💚';
    return '<tr style="font-size:12px;">' +
      '<td style="padding:8px 6px;">' + d.id + '</td>' +
      '<td style="padding:8px 6px;font-weight:700;">' + d.room + '</td>' +
      '<td style="padding:8px 6px;">' + d.name + '</td>' +
      '<td style="padding:8px 6px;">' + d.time + '</td>' +
      '<td style="padding:8px 6px;">' + d.nights + '</td>' +
      '<td style="padding:8px 6px;font-weight:600;">¥' + d.amount + '</td>' +
      '<td style="padding:8px 6px;color:var(--text-muted);">' + methodIcon + ' ' + d.payMethod + '</td>' +
      '<td style="padding:8px 6px;"><span class="tbadge green" style="font-size:11px;padding:2px 6px;">' + d.status + '</span></td>' +
      '<td style="padding:8px 6px;"><button class="action-btn small" onclick="openSettlementDetail(\'' + d.id + '\')">详情</button></td></tr>';
  }).join('');
  var html = '<div class="modal-overlay hidden" id="modal-settlement-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-settlement-history\').remove()">' +
    '<div class="modal" style="width:800px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
    '<div style="font-size:22px;">📋</div><div style="font-size:15px;font-weight:700;">结算历史</div>' +
    '<div style="margin-left:auto;font-size:12px;color:var(--text-muted);">共 ' + historyData.length + ' 条记录</div>' +
    '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:16px 20px;">' +
    '<table class="table" style="font-size:12px;">' +
    '<thead><tr style="background:var(--bg);"><th style="padding:8px 6px;">结算单号</th><th style="padding:8px 6px;">房间</th><th style="padding:8px 6px;">客户</th><th style="padding:8px 6px;">结算时间</th><th style="padding:8px 6px;">入住天数</th><th style="padding:8px 6px;">结算金额</th><th style="padding:8px 6px;">支付方式</th><th style="padding:8px 6px;">状态</th><th style="padding:8px 6px;">操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">' +
    '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="exportSettlementHistory()" class="modal-btn" style="background:var(--green);border-color:var(--green);color:white;border:none;">📤 导出历史</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.exportSettlementHistory = function() {
  showToast('📤 结算历史正在导出...', 'success');
  setTimeout(function() { showToast('✅ 结算历史已导出至 Downloads/结算历史-' + new Date().toISOString().slice(0,10) + '.csv', 'success'); }, 800);
};

// -------- 改进3：结算详情弹窗 --------
window.openSettlementDetail = function(settlementId) {
  var existing = document.getElementById('modal-settlement-detail');
  if (existing) existing.remove();
  // Mock data based on settlement ID
  var mockData = {
    'STL-2026032701': {id:'STL-2026032701',room:'301',name:'张三',phone:'138****8888',idCard:'110101199001011234',type:'亲子间',checkinTime:'2026-03-26 14:00',checkoutTime:'2026-03-27 10:30',nights:1,roomFee:128,extraBed:0,miniBar:0,damage:0,total:128,deposit:100,depositStatus:'待退',payMethod:'微信',payTime:'2026-03-27 10:35'},
    'STL-2026032603': {id:'STL-2026032603',room:'203',name:'李四',phone:'139****6666',idCard:'110101199002022345',type:'标准间',checkinTime:'2026-03-24 16:00',checkoutTime:'2026-03-27 14:00',nights:3,roomFee:324,extraBed:0,miniBar:60,damage:60,total:384,deposit:100,depositStatus:'押金不足¥24',payMethod:'支付宝',payTime:'2026-03-27 14:15'},
    'STL-2026032602': {id:'STL-2026032602',room:'201',name:'王五',phone:'139****6666',idCard:'110101199003033456',type:'大床房',checkinTime:'2026-03-25 15:30',checkoutTime:'2026-03-27 11:00',nights:2,roomFee:216,extraBed:50,miniBar:20,damage:0,total:286,deposit:100,depositStatus:'待退',payMethod:'微信',payTime:'2026-03-27 11:05'},
    'BL-2026032701': {id:'BL-2026032701',room:'302',name:'孙一',phone:'137****7777',idCard:'110101199004044567',type:'大床房',checkinTime:'2026-03-25 15:00',checkoutTime:'2026-03-27 09:00',nights:2,roomFee:216,extraBed:0,miniBar:0,damage:0,total:216,deposit:100,depositStatus:'已退',payMethod:'现金',payTime:'2026-03-27 09:05'},
    'BL-2026032702': {id:'BL-2026032702',room:'105',name:'孙二',phone:'136****8888',idCard:'110101199005055678',type:'标准间',checkinTime:'2026-03-26 14:00',checkoutTime:'2026-03-27 10:00',nights:1,roomFee:138,extraBed:0,miniBar:0,damage:0,total:138,deposit:100,depositStatus:'已退',payMethod:'支付宝',payTime:'2026-03-27 10:05'},
    'BL-2026032503': {id:'BL-2026032503',room:'204',name:'孙三',phone:'135****9999',idCard:'110101199006066789',type:'亲子间',checkinTime:'2026-03-23 16:00',checkoutTime:'2026-03-25 12:00',nights:2,roomFee:256,extraBed:0,miniBar:30,damage:0,total:286,deposit:100,depositStatus:'已退',payMethod:'微信',payTime:'2026-03-25 12:10'}
  };
  var d = mockData[settlementId] || {
    id: settlementId, room: '301', name: '张三', phone: '138****8888', idCard: '110101199001011234',
    type: '标准间', checkinTime: '2026-03-27 09:00', checkoutTime: '2026-03-28 12:00', nights: 1,
    roomFee: 128, extraBed: 0, miniBar: 0, damage: 0, total: 128, deposit: 100, depositStatus: '待退',
    payMethod: '微信', payTime: '2026-03-28 12:05'
  };
  var depositColor = d.depositStatus.indexOf('不足') >= 0 ? 'var(--red)' : d.depositStatus === '已退' ? 'var(--green)' : 'var(--orange)';
  var html = '<div class="modal-overlay hidden" id="modal-settlement-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-settlement-detail\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">💰</div><div><div style="font-size:15px;font-weight:700;">结算详情</div><div style="font-size:11px;color:var(--text-muted);">' + d.id + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-settlement-detail\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 房间信息卡片
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">房间号</div><div style="font-size:15px;font-weight:700;color:var(--blue);">' + d.room + '</div></div>' +
    '<div style="padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">房型</div><div style="font-size:13px;font-weight:700;">' + d.type + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">客户姓名</div><div style="font-size:13px;font-weight:600;">' + d.name + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">联系电话</div><div style="font-size:12px;font-weight:600;">' + d.phone + '</div></div></div>' +
    // 入住信息
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">📅 入住信息</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-light);">入住时间</span><span>' + d.checkinTime + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-light);">退房时间</span><span>' + d.checkoutTime + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-light);">入住天数</span><span style="font-weight:700;color:var(--blue);">' + d.nights + '晚</span></div></div>' +
    // 费用明细
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">💰 费用明细</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:14px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-light);">房费</span><span>¥' + d.roomFee + '</span></div>' +
    (d.extraBed > 0 ? '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-light);">加床/加物</span><span>¥' + d.extraBed + '</span></div>' : '') +
    (d.miniBar > 0 ? '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-light);">迷你吧消费</span><span>¥' + d.miniBar + '</span></div>' : '') +
    (d.damage > 0 ? '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--red);">损坏赔偿</span><span style="color:var(--red);">¥' + d.damage + '</span></div>' : '') +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-light);">应付总额</span><span style="font-weight:700;color:var(--orange);font-size:14px;">¥' + d.total + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:var(--text-light);">押金（' + d.depositStatus + '）</span><span style="font-weight:600;color:' + depositColor + ';">¥' + d.deposit + '</span></div></div>' +
    // 支付信息
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">💳 支付信息</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-light);">支付方式</span><span>' + d.payMethod + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-light);">支付时间</span><span>' + d.payTime + '</span></div></div>' +
    // 身份证
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">🪪 证件信息</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--text-muted);">' + (d.idCard || '110101199001011234') + '</div></div>' +
    '<div style="padding:14px 24px 18px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-settlement-detail\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="printSettlementReceipt(\'' + d.id + '\')" class="modal-btn" style="background:var(--blue);border-color:var(--blue);color:white;border:none;">🖨️ 打印收据</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.printSettlementReceipt = function(id) {
  showToast('🖨️ 收据正在打印：' + id, 'success');
  setTimeout(function() { showToast('✅ 收据已发送至打印机', 'success'); }, 1000);
};

// -------- 改进4：结算Tab状态筛选 --------
window.filterSettlement = function(status, tabEl) {
  if (!tabEl) return;
  // Update active tab
  var parent = tabEl.parentElement;
  if (parent) {
    parent.querySelectorAll('.card-tab').forEach(function(t) {
      t.style.background = '';
      t.style.color = '';
      t.style.fontWeight = '';
    });
    tabEl.style.background = 'var(--blue-bg)';
    tabEl.style.color = 'var(--blue)';
    tabEl.style.fontWeight = '700';
  }
  var tbody = document.getElementById('settlement-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var visibleCount = 0;
  rows.forEach(function(row) {
    if (status === 'all') {
      row.style.display = '';
      visibleCount++;
    } else {
      var rowStatus = row.getAttribute('data-status');
      if (rowStatus === status) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    }
  });
  showToast('📋 已筛选：' + (status === 'all' ? '全部' : status === 'normal' ? '普通退房' : '脏房') + '（' + visibleCount + '条）', 'info');
};

// -------- 改进5：结算全选checkbox --------
window.toggleAllSettlementSelect = function(checked) {
  var tbody = document.getElementById('settlement-table-body');
  if (!tbody) return;
  tbody.querySelectorAll('.stl-row-check').forEach(function(cb) {
    cb.checked = checked;
  });
  var count = checked ? document.querySelectorAll('.stl-row-check').length : 0;
  if (count > 0) {
    showToast('已选中 ' + count + ' 个房间', 'info');
  }
};

window.onSettlementRowCheck = function() {
  var tbody = document.getElementById('settlement-table-body');
  if (!tbody) return;
  var total = tbody.querySelectorAll('.stl-row-check').length;
  var checked = tbody.querySelectorAll('.stl-row-check:checked').length;
  var allCheckbox = document.getElementById('stl-select-all');
  if (allCheckbox) allCheckbox.checked = checked > 0 && checked === total;
};
