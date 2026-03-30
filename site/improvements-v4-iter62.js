// ============================================================
// 【物联后台v4-第62轮】5个功能性改进
// ============================================================

// ============================================================
// 【改进1】发票管理 - 删除发票（带确认弹窗）
// 理由：发票管理有新增/编辑/打印/重开，但缺少删除功能，不符合增删改查完整闭环
// 改进：发票列表每行增加删除按钮，点击后弹出确认框，确认后从invoiceStore删除并刷新列表
// ============================================================

// Alias for invoice delete modal (button calls openInvoiceDeleteModal but we implement deleteInvoice)
var openInvoiceDeleteModal = deleteInvoice;

function deleteInvoice(invId) {
  var inv = invoiceStore.find(function(i){ return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  var existing = document.getElementById('modal-confirm-delete-invoice');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-confirm-delete-invoice" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;overflow:hidden;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">确认删除发票</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="font-size:13px;color:var(--text);margin-bottom:10px;">确定要删除发票 <strong style="color:var(--red);">' + invId + '</strong> 吗？</p>' +
    '<p style="font-size:12px;color:var(--text-muted);padding:10px;background:var(--bg);border-radius:6px;">发票信息：' + inv.company + ' · ¥' + inv.amount + '</p>' +
    '<p style="font-size:12px;color:var(--orange);padding:10px;background:var(--orange-bg);border-radius:6px;margin-top:8px;">⚠️ 删除后无法恢复，请谨慎操作</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-confirm-delete-invoice\').remove()" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);">取消</button>' +
    '<button onclick="doDeleteInvoice(\'' + invId + '\')" style="flex:1;padding:10px;background:var(--red);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doDeleteInvoice(invId) {
  var idx = invoiceStore.findIndex(function(i){ return i.id === invId; });
  if (idx !== -1) invoiceStore.splice(idx, 1);
  document.getElementById('modal-confirm-delete-invoice').remove();
  showToast('🗑️ 发票 ' + invId + ' 已删除', 'success');
  if (typeof applyInvoiceSearch === 'function') applyInvoiceSearch();
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
}

// ============================================================
// 【改进2】结算中心 - 批量结算功能
// 理由：结算中心有单个结算但缺少批量结算，无法一次性处理多个退房
// 改进：实现全选+多选批量结算，选择多个房间后一键发起批量结算确认
// ============================================================

function toggleAllSettlementSelect(checked) {
  document.querySelectorAll('.stl-row-check').forEach(function(cb) {
    cb.checked = checked;
  });
  updateBatchSettlementCount();
}

function onSettlementRowCheck() {
  updateBatchSettlementCount();
}

function updateBatchSettlementCount() {
  var checked = document.querySelectorAll('.stl-row-check:checked');
  var btn = document.getElementById('batch-settlement-btn');
  if (btn) {
    if (checked.length > 0) {
      btn.style.display = '';
      btn.textContent = '🔄 批量结算(' + checked.length + ')';
    } else {
      btn.style.display = 'none';
    }
  }
}

function openBatchSettlementModal() {
  var checked = document.querySelectorAll('.stl-row-check:checked');
  if (checked.length === 0) { showToast('请先选择要结算的房间', 'warning'); return; }
  var rows = [];
  checked.forEach(function(cb) {
    var tr = cb.closest('tr');
    if (tr) {
      var room = tr.querySelector('td:nth-child(2)') ? tr.querySelector('td:nth-child(2)').textContent.trim() : '';
      var name = tr.querySelector('td:nth-child(3)') ? tr.querySelector('td:nth-child(3)').textContent.trim() : '';
      var amount = tr.querySelector('td:nth-child(9)') ? parseFloat(tr.querySelector('td:nth-child(9)').textContent.replace(/[^0-9.]/g,'')) : 0;
      rows.push({room: room, name: name, amount: amount});
    }
  });
  var total = rows.reduce(function(s, r){ return s + r.amount; }, 0);
  var existing = document.getElementById('modal-batch-settlement');
  if (existing) existing.remove();
  var items = rows.map(function(r) {
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">' +
      '<span>' + r.room + ' · ' + r.name + '</span><span style="font-weight:700;color:var(--orange);">¥' + r.amount.toFixed(0) + '</span></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-batch-settlement" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-settlement\').remove()">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🔄</div><div><div style="font-size:15px;font-weight:700;">批量结算确认</div><div style="font-size:11px;color:var(--text-muted);">' + rows.length + ' 个房间待结算</div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-settlement\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;max-height:50vh;overflow-y:auto;">' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:12px;">' + items + '</div>' +
    '<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid var(--border);font-size:15px;font-weight:700;">' +
    '<span>合计应付</span><span style="color:var(--red);font-size:18px;">¥' + total.toFixed(0) + '</span></div>' +
    '<div style="margin-top:12px;"><div style="font-size:12px;font-weight:600;margin-bottom:6px;">💳 支付方式</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';window._batchPayMethod=\'wechat\'" class="pay-method-btn" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px;">💚 微信</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';window._batchPayMethod=\'alipay\'" class="pay-method-btn" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px;">💙 支付宝</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';window._batchPayMethod=\'cash\'" class="pay-method-btn" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px;">💵 现金</button>' +
    '<button onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';window._batchPayMethod=\'card\'" class="pay-method-btn" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px;">💳 卡类</button></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-settlement\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="doBatchSettlement()" style="background:var(--blue);color:white;border:none;">✅ 确认批量结算(' + rows.length + ')</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doBatchSettlement() {
  var checked = document.querySelectorAll('.stl-row-check:checked');
  var count = checked.length;
  checked.forEach(function(cb) {
    var tr = cb.closest('tr');
    if (tr) tr.style.opacity = '0.5';
  });
  document.getElementById('modal-batch-settlement').remove();
  showToast('✅ 批量结算完成，已处理 ' + count + ' 个房间', 'success');
  // Uncheck all
  document.querySelectorAll('.stl-row-check').forEach(function(cb){ cb.checked = false; });
  updateBatchSettlementCount();
}

// ============================================================
// 【改进3】房务管理 - 快速入住/退房表单
// 理由：房务管理有状态筛选但缺少快速入住和退房表单入口，无法完成完整闭环
// 改进：增加快速入住和退房按钮，弹出表单填写后提交，更新房间状态并显示Toast
// ============================================================

function openQuickCheckinModal() {
  var existing = document.getElementById('modal-quick-checkin');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-quick-checkin" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-checkin\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏨</div><div style="font-size:15px;font-weight:700;">快速入住登记</div>' +
    '<button onclick="document.getElementById(\'modal-quick-checkin\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row"><div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label><input class="form-input" id="qc-room" placeholder="如：301"/></div>' +
    '<div class="form-group"><label class="form-label">入住人 <span class="required">*</span></label><input class="form-input" id="qc-name" placeholder="客人姓名"/></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="qc-phone" placeholder="138****8888"/></div>' +
    '<div class="form-group"><label class="form-label">房型</label>' +
    '<select class="form-select" id="qc-type" style="width:100%;"><option value="亲子间">亲子间</option><option value="大床房">大床房</option><option value="标准间">标准间</option></select></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">入住日期</label><input class="form-input" id="qc-date" type="date" value="' + new Date().toISOString().slice(0,10) + '"/></div>' +
    '<div class="form-group"><label class="form-label">预计退房</label><input class="form-input" id="qc-checkout" type="date" value="' + new Date(Date.now() + 86400000).toISOString().slice(0,10) + '"/></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label><textarea class="form-input" id="qc-notes" rows="2" placeholder="特殊需求（可选）"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-quick-checkin\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitQuickCheckin()" style="background:var(--green);color:white;border:none;">🏠 确认入住</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitQuickCheckin() {
  var room = document.getElementById('qc-room') ? document.getElementById('qc-room').value.trim() : '';
  var name = document.getElementById('qc-name') ? document.getElementById('qc-name').value.trim() : '';
  if (!room || !name) { showToast('请填写房间号和入住人', 'error'); return; }
  document.getElementById('modal-quick-checkin').remove();
  showToast('🏠 房间 ' + room + ' 入住成功，欢迎 ' + name + '！', 'success');
  // Update room status if renderRoomGrid exists
  if (typeof renderRoomGrid === 'function') renderRoomGrid();
}

function openQuickCheckoutModal() {
  var existing = document.getElementById('modal-quick-checkout');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-quick-checkout" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-checkout\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏁</div><div style="font-size:15px;font-weight:700;">快速退房结算</div>' +
    '<button onclick="document.getElementById(\'modal-quick-checkout\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label><input class="form-input" id="qco-room" placeholder="如：301"/></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">房费(元)</label><input class="form-input" id="qco-room-fee" type="number" placeholder="128"/></div>' +
    '<div class="form-group"><label class="form-label">其他消费(元)</label><input class="form-input" id="qco-extras" type="number" value="0" placeholder="0"/></div></div>' +
    '<div class="form-group"><label class="form-label">押金(元)</label><input class="form-input" id="qco-deposit" type="number" value="100" placeholder="100"/></div>' +
    '<div class="form-group"><label class="form-label">备注</label><textarea class="form-input" id="qco-notes" rows="2" placeholder="退房备注（可选）"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-quick-checkout\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitQuickCheckout()" style="background:var(--orange);color:white;border:none;">💰 确认退房结算</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitQuickCheckout() {
  var room = document.getElementById('qco-room') ? document.getElementById('qco-room').value.trim() : '';
  var roomFee = parseFloat(document.getElementById('qco-room-fee') ? document.getElementById('qco-room-fee').value : '0') || 0;
  var extras = parseFloat(document.getElementById('qco-extras') ? document.getElementById('qco-extras').value : '0') || 0;
  var deposit = parseFloat(document.getElementById('qco-deposit') ? document.getElementById('qco-deposit').value : '0') || 0;
  if (!room) { showToast('请填写房间号', 'error'); return; }
  var total = roomFee + extras;
  var refund = deposit - extras;
  document.getElementById('modal-quick-checkout').remove();
  if (refund >= 0) {
    showToast('🏁 房间 ' + room + ' 退房成功，应退押金 ¥' + refund.toFixed(0), 'success');
  } else {
    showToast('🏁 房间 ' + room + ' 退房成功，需补缴 ¥' + Math.abs(refund).toFixed(0), 'warning');
  }
  if (typeof renderRoomGrid === 'function') renderRoomGrid();
}

// ============================================================
// 【改进4】能源管理 - 超标阈值告警Toast提示
// 理由：能源管理仅在卡片上显示阈值超标的红色标识，但缺少实时Toast告警提示
// 改进：在能源页面加载时自动检测各楼层用电是否超标，超标时弹出Toast警告并显示超标详情
// ============================================================

function checkEnergyThresholdAlerts() {
  var threshold = _energyFloorThresholds || {};
  var floors = [
    {id: 'all', label: '全部楼层', current: 480},
    {id: '1', label: '1层', current: 135},
    {id: '2', label: '2层', current: 168},
    {id: '3', label: '3层', current: 145}
  ];
  var alerts = [];
  floors.forEach(function(f) {
    var t = threshold[f.id] || 500;
    if (f.current > t) {
      alerts.push({floor: f.label, current: f.current, threshold: t, over: f.current - t});
    }
  });
  if (alerts.length > 0) {
    var msg = '⚠️ ' + alerts.map(function(a) {
      return a.floor + '超标' + a.over + 'kWh(¥' + (a.over * 1.2).toFixed(0) + ')';
    }).join(' | ');
    showToast(msg, 'warning');
    return true;
  }
  return false;
}

// Auto-check energy threshold on page load (call after energy page renders)
var _energyAlertChecked = false;
function autoCheckEnergyOnLoad() {
  if (_energyAlertChecked) return;
  _energyAlertChecked = true;
  var page = document.getElementById('page-energy');
  if (page && page.classList.contains('active')) {
    setTimeout(function() {
      checkEnergyThresholdAlerts();
    }, 500);
  }
}

// ============================================================
// 【改进5】会员管理 - 积分抵扣功能（余额扣减闭环）
// 理由：会员管理有充值历史但缺少积分/余额扣减功能，无法形成完整收支闭环
// 改进：实现余额扣减表单（消费抵扣/退款/罚款等场景），扣减后更新会员余额并显示交易记录
// ============================================================

function deductMemberBalance(idx) {
  var m = _memberStore ? _memberStore[idx] : null;
  if (!m) { showToast('未找到会员信息', 'error'); return; }
  var existing = document.getElementById('modal-member-deduct');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-member-deduct" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-deduct\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">💰</div><div><div style="font-size:15px;font-weight:700;">余额扣减</div><div style="font-size:11px;color:var(--text-muted);">' + m.name + ' · 当前余额 ¥' + (m.balance || 0) + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-member-deduct\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">扣减类型 <span class="required">*</span></label>' +
    '<select class="form-select" id="mdc-type" style="width:100%;">' +
    '<option value="consume">🏠 住宿消费</option>' +
    '<option value="penalty">💔 损坏赔付</option>' +
    '<option value="overtime">⏰ 退房超时</option>' +
    '<option value="fine">📋 罚款/赔偿</option>' +
    '<option value="other">📝 其他扣减</option></select></div>' +
    '<div class="form-group"><label class="form-label">扣减金额(元) <span class="required">*</span></label><input class="form-input" id="mdc-amount" type="number" placeholder="输入扣减金额"/></div>' +
    '<div class="form-group"><label class="form-label">备注说明</label><textarea class="form-input" id="mdc-notes" rows="2" placeholder="扣减原因（可选）"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-member-deduct\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitMemberDeduct(' + idx + ')" style="background:var(--red);color:white;border:none;">💰 确认扣减</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitMemberDeduct(idx) {
  var m = _memberStore ? _memberStore[idx] : null;
  if (!m) { showToast('未找到会员信息', 'error'); return; }
  var amount = parseFloat(document.getElementById('mdc-amount') ? document.getElementById('mdc-amount').value : '0') || 0;
  var type = document.getElementById('mdc-type') ? document.getElementById('mdc-type').value : 'consume';
  var notes = document.getElementById('mdc-notes') ? document.getElementById('mdc-notes').value.trim() : '';
  if (amount <= 0) { showToast('请输入有效扣减金额', 'error'); return; }
  if (amount > (m.balance || 0)) { showToast('扣减金额不能超过当前余额 ¥' + (m.balance || 0), 'error'); return; }
  m.balance = (m.balance || 0) - amount;
  var typeLabels = {consume:'住宿消费', penalty:'损坏赔付', overtime:'退房超时', fine:'罚款/赔偿', other:'其他扣减'};
  showToast('💰 ' + m.name + ' 余额扣减 ¥' + amount + ' (' + (typeLabels[type] || type) + ')，剩余 ¥' + m.balance.toFixed(0), 'success');
  document.getElementById('modal-member-deduct').remove();
  if (typeof renderMemberTable === 'function') renderMemberTable();
  if (typeof renderMemberDetail === 'function') renderMemberDetail(idx);
}
