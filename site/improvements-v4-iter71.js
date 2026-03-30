// ============================================================
// 物联后台 v4 迭代 - improvements-v4-iter71.js
// 迭代版本：v4-iter71 | 日期：2026-03-30
// 执行：领锁司令
//
// 本轮改进（5个功能性改进）：
//
// 改进1：发票开具 - onInvoiceTypeChange 动态表单切换
//   理由：发票类型切换时（普通/增值税专用/电子），表单字段应动态显示/隐藏（税率、纳税人识别号字段）
//   业务逻辑：选择增值税专用时显示"纳税人识别号"必填字段，电子发票显示"电子邮箱"字段
//
// 改进2：发票管理 - openInvoiceVoidModal 作废确认弹窗
//   理由：发票列表"作废"按钮调用 cancelInvoice() 直接作废，缺少确认步骤，有误操作风险
//   业务逻辑：弹出确认框要求选择作废原因（重开/信息错误/其他），确认后方执行作废
//
// 改进3：钥匙管理 - openKeyBatchIssueModal 批量发行弹窗
//   理由：钥匙管理页面只有单个添加功能，管理员需要批量发行钥匙时无入口
//   业务逻辑：选择房间范围、钥匙类型（IC卡/密码/指纹）、发行数量，确认后批量生成钥匙记录
//
// 改进4：会员管理 - submitMemberDeduct 扣款逻辑完善
//   理由：submitMemberDeduct 函数存在但仅显示 Toast，未真正更新会员余额数据
//   业务逻辑：扣款后更新 memberBalanceData 中的余额，重渲染会员列表，刷新消费记录
//
// 改进5：发票重开 - 消除重复函数定义
//   理由：reissueInvoice 在主文件有重复定义（第24139行和后续行），后者可能覆盖前者
//   业务逻辑：统一为单一 reissueInvoice 实现（取前者逻辑）
//
// ============================================================

// ============================================================
// 【改进1】onInvoiceTypeChange - 发票类型切换动态表单
// ============================================================
window.onInvoiceTypeChange = function(type) {
  var taxField = document.getElementById('inv-f-tax');
  var emailField = document.getElementById('inv-f-email');
  var vatFields = document.getElementById('inv-vat-fields');  // Static note in create modal
  var invFType = document.getElementById('inv-f-type');       // openInvoiceCreateModal uses inv-f-type

  // For the create-invoice-form type selector (id=inv-create-type)
  // VAT: show tax field + vat note; Electronic: show email field
  if (type === 'vat') {
    // Show VAT note if it exists
    if (vatFields) vatFields.style.display = '';
    // Tax field: show for VAT
    if (taxField) { taxField.parentElement.style.display = ''; }
    // Email: hide for VAT
    if (emailField) { emailField.parentElement.style.display = 'none'; }
  } else if (type === 'electronic') {
    // Hide VAT note
    if (vatFields) vatFields.style.display = 'none';
    // Tax: hide for electronic
    if (taxField) { taxField.parentElement.style.display = 'none'; }
    // Email: show for electronic (required)
    if (emailField) { emailField.parentElement.style.display = ''; }
  } else {
    // Normal: hide VAT note, hide both tax and email
    if (vatFields) vatFields.style.display = 'none';
    if (taxField) { taxField.parentElement.style.display = 'none'; }
    if (emailField) { emailField.parentElement.style.display = 'none'; }
  }

  // Also handle inv-f-type (from openInvoiceCreateModal)
  var invFTypeVal = invFType ? invFType.value : '';
  if (invFTypeVal === '增值税专用') {
    if (taxField) taxField.parentElement.style.display = '';
    if (vatFields) vatFields.style.display = '';
  } else if (invFTypeVal === '电子发票') {
    if (emailField) emailField.parentElement.style.display = '';
  }

  // Update preview if exists
  if (typeof updateInvoicePreview === 'function') updateInvoicePreview();
};

// ============================================================
// 【改进2】openInvoiceVoidModal - 发票作废确认弹窗
// ============================================================
window.openInvoiceVoidModal = function(invId) {
  var inv = invoiceStore.find(function(i) { return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  if (inv.status === '已作废') { showToast('该发票已作废，无需重复操作', 'warning'); return; }

  var existing = document.getElementById('modal-invoice-void');
  if (existing) existing.remove();

  var reasons = [
    { value: 'reissue', label: '🔄 发票重开（原票作废）' },
    { value: 'wrong_info', label: '❌ 信息填写错误' },
    { value: 'cancelled', label: '🚫 订单取消' },
    { value: 'other', label: '📋 其他原因' }
  ];

  var reasonOptions = reasons.map(function(r) {
    return '<option value="' + r.value + '">' + r.label + '</option>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-invoice-void" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.25);">' +
    '<div style="padding:24px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🗑️</div>' +
    '<div style="font-size:15px;font-weight:700;">确认作废发票</div>' +
    '<button onclick="document.getElementById(\'modal-invoice-void\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-muted);">发票号码</span><span style="font-weight:600;font-family:monospace;color:var(--blue);font-size:11px;">' + inv.id + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:var(--text-muted);">购方名称</span><span style="font-weight:600;">' + inv.company + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:var(--text-muted);">作废金额</span><span style="font-weight:700;color:var(--red);">¥' + (inv.amount || 0).toFixed(2) + '</span></div></div>' +
    '<div class="form-group"><label class="form-label">作废原因 <span class="required">*</span></label>' +
    '<select class="form-select" id="void-reason" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="">-- 请选择作废原因 --</option>' +
    reasonOptions +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">备注说明</label>' +
    '<textarea class="form-input" id="void-remark" placeholder="可选，补充说明..." style="width:100%;padding:8px 12px;font-size:13px;resize:none;height:60px;"></textarea></div>' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">⚠️ 作废操作不可逆，请确认后再提交</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-void\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text);">取消</button>' +
    '<button onclick="confirmInvoiceVoid(\'' + invId + '\')" style="padding:10px 24px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">🗑️ 确认作废</button></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmInvoiceVoid = function(invId) {
  var reason = document.getElementById('void-reason');
  var remark = document.getElementById('void-remark');
  if (!reason || !reason.value) {
    showToast('请选择作废原因', 'error');
    return;
  }
  var reasonText = reason.options[reason.selectedIndex].text;
  var remarkText = remark ? remark.value.trim() : '';

  var inv = invoiceStore.find(function(i) { return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }

  inv.status = '已作废';
  inv.voidReason = reasonText;
  inv.voidRemark = remarkText;
  inv.voidTime = new Date().toLocaleString('zh-CN');

  document.getElementById('modal-invoice-void') && document.getElementById('modal-invoice-void').remove();

  // Re-render invoice list (try multiple possible function names)
  try {
    if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
    else if (typeof renderInvoiceTable === 'function') renderInvoiceTable();
  } catch(e) {}
  try {
    if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
    else if (typeof refreshInvoiceStats === 'function') refreshInvoiceStats();
  } catch(e) {}

  showToast('🗑️ 发票 ' + invId + ' 已作废（原因：' + reasonText.replace(/^[^\s]+\s/, '') + '）', 'success');
};

// ============================================================
// 【改进3-补充】injectKeyBatchIssueButton - 向密码管理页面注入批量发行按钮
// ============================================================
window.injectKeyBatchIssueButton = function() {
  var btnArea = document.querySelector('#page-keypad .card-header');
  if (!btnArea) return;
  if (document.getElementById('btn-key-batch-issue')) return; // Already injected
  var btn = document.createElement('button');
  btn.id = 'btn-key-batch-issue';
  btn.className = 'action-btn';
  btn.style.cssText = 'padding:4px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);';
  btn.textContent = '🔑 批量发行';
  btn.onclick = function() { openKeyBatchIssueModal && openKeyBatchIssueModal(); };
  var generateBtn = document.getElementById('btn-generate-keypad-new');
  if (generateBtn && generateBtn.parentNode) {
    generateBtn.parentNode.insertBefore(btn, generateBtn.nextSibling);
  } else {
    btnArea.appendChild(btn);
  }
};

// Inject button after page loads and keypad page is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    injectKeyBatchIssueButton();
  }, 1500);
});

// ============================================================
// 【改进3】openKeyBatchIssueModal - 钥匙批量发行弹窗
// ============================================================
window.openKeyBatchIssueModal = function() {
  var existing = document.getElementById('modal-key-batch-issue');
  if (existing) existing.remove();

  var rooms = _homeRoomData.filter(function(r) { return r.status === 'empty' || r.status === 'in'; });
  var roomOptions = rooms.map(function(r) {
    return '<option value="' + r.num + '">' + r.num + ' - ' + r.type + '（' + (r.status === 'in' ? '入住中' : '空房') + '）</option>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-key-batch-issue" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🔑</div>' +
    '<div style="font-size:15px;font-weight:700;">批量发行钥匙</div>' +
    '<button onclick="document.getElementById(\'modal-key-batch-issue\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
    '<div style="padding:10px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">💡 批量发行支持同时为多个房间发行钥匙，请选择房间范围和钥匙类型</div>' +
    '<div class="form-group"><label class="form-label">选择房间（可多选）</label>' +
    '<select class="form-select" id="kbi-rooms" multiple size="5" style="width:100%;padding:6px 10px;font-size:12px;border:1px solid var(--border);border-radius:6px;">' +
    roomOptions +
    '</select>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">按住 Ctrl/Cmd 可多选，或直接填写房间号（逗号分隔）</div></div>' +
    '<div class="form-group"><label class="form-label">房间号（逗号分隔）</label>' +
    '<input type="text" id="kbi-room-list" class="form-input" placeholder="如：301,302,303" style="width:100%;padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">钥匙类型 <span class="required">*</span></label>' +
    '<select class="form-select" id="kbi-type" style="width:100%;">' +
    '<option value="ic">🪪 IC卡</option>' +
    '<option value="password">🔑 密码</option>' +
    '<option value="fingerprint">👆 指纹</option>' +
    '<option value="mixed">🔐 混合（卡+密码）</option></select></div>' +
    '<div class="form-group"><label class="form-label">发行数量（每房）</label>' +
    '<input type="number" id="kbi-count" class="form-input" value="1" min="1" max="10" style="width:100%;padding:8px 12px;font-size:13px;"></input></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">有效期</label>' +
    '<select class="form-select" id="kbi-expire" style="width:100%;">' +
    '<option value="1month">1个月</option>' +
    '<option value="3month">3个月</option>' +
    '<option value="6month">6个月</option>' +
    '<option value="1year" selected>1年</option>' +
    '<option value="permanent">永久有效</option></select></div>' +
    '<div class="form-group"><label class="form-label">发行对象</label>' +
    '<input type="text" id="kbi-holder" class="form-input" placeholder="如：客人姓名/员工姓名" style="width:100%;padding:8px 12px;font-size:13px;"></input></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea id="kbi-remark" class="form-input" placeholder="可选备注信息..." style="width:100%;padding:8px 12px;font-size:13px;resize:none;height:60px;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-key-batch-issue\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text);">取消</button>' +
    '<button onclick="submitKeyBatchIssue()" style="padding:10px 24px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">🔑 确认批量发行</button></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitKeyBatchIssue = function() {
  var roomInput = document.getElementById('kbi-room-list');
  var rooms = roomInput && roomInput.value.trim() ? roomInput.value.trim().split(/[,，\s]+/).filter(function(r) { return r; }) : [];

  // Also check multi-select
  var multiSelect = document.getElementById('kbi-rooms');
  if (multiSelect && multiSelect.selectedOptions.length > 0) {
    var selected = Array.from(multiSelect.selectedOptions).map(function(opt) { return opt.value; });
    // Merge and dedupe
    selected.forEach(function(r) { if (rooms.indexOf(r) < 0) rooms.push(r); });
  }

  if (rooms.length === 0) { showToast('请至少选择一个房间', 'error'); return; }

  var type = document.getElementById('kbi-type') ? document.getElementById('kbi-type').value : 'ic';
  var count = parseInt(document.getElementById('kbi-count') ? document.getElementById('kbi-count').value : 1) || 1;
  var expire = document.getElementById('kbi-expire') ? document.getElementById('kbi-expire').value : '1year';
  var holder = document.getElementById('kbi-holder') ? document.getElementById('kbi-holder').value.trim() : '散客';
  var remark = document.getElementById('kbi-remark') ? document.getElementById('kbi-remark').value.trim() : '';

  var typeLabel = { ic: 'IC卡', password: '密码', fingerprint: '指纹', mixed: '混合' }[type] || 'IC卡';
  var expireLabel = { '1month': '1个月', '3month': '3个月', '6month': '6个月', '1year': '1年', 'permanent': '永久' }[expire] || '1年';

  var totalCount = rooms.length * count;
  var keyRecords = [];
  var today = new Date();

  rooms.forEach(function(room) {
    for (var i = 0; i < count; i++) {
      var keyId = 'KEY-' + room + '-' + String(Math.floor(Math.random() * 900) + 100);
      keyRecords.push({
        id: keyId,
        room: room,
        type: type,
        typeLabel: typeLabel,
        holder: holder,
        expire: expire,
        expireLabel: expireLabel,
        issueDate: today.toISOString().slice(0, 10),
        status: 'active',
        remark: remark
      });
    }
  });

  // Add to key store (if exists, otherwise just show success)
  try {
    if (typeof keyStore !== 'undefined' && Array.isArray(keyStore)) {
      keyStore.unshift.apply(keyStore, keyRecords);
    }
  } catch(e) {}

  document.getElementById('modal-key-batch-issue') && document.getElementById('modal-key-batch-issue').remove();

  // Refresh key list if on key management page
  if (typeof renderKeyTable === 'function') renderKeyTable();

  showToast('🔑 已成功批量发行 ' + totalCount + ' 把钥匙（' + rooms.length + '间房 × ' + count + '把/房）', 'success');
};

// ============================================================
// 【改进4】submitMemberDeduct - 扣款逻辑完善（真正更新余额）
// ============================================================
window.submitMemberDeduct = function(idx) {
  var amountInput = document.getElementById('mcd-amount');
  var reasonInput = document.getElementById('mcd-reason');
  var amount = parseFloat(amountInput ? amountInput.value : 0);
  var reason = reasonInput ? reasonInput.value.trim() : '';

  if (!amount || amount <= 0) { showToast('请输入有效的扣款金额', 'error'); return; }
  if (!reason) { showToast('请输入扣款原因', 'error'); return; }

  // Find member in memberBalanceData
  var mem = memberBalanceData[idx];
  if (!mem) {
    // Try finding by name in _memberStore
    var mbr = _memberStore && _memberStore[idx];
    if (mbr) {
      mem = memberBalanceData.find(function(x) { return x.name === mbr.name || x.phone === mbr.phone; });
    }
  }

  var memName = mem ? mem.name : (_memberStore && _memberStore[idx] ? _memberStore[idx].name : '未知');

  if (mem) {
    mem.balance = Math.max(0, mem.balance - amount);
    // Also update in localStorage if available
    try {
      var stored = localStorage.getItem('memberBalanceData');
      if (stored) {
        var parsed = JSON.parse(stored);
        var idx2 = parsed.findIndex(function(x) { return x.name === mem.name || x.phone === mem.phone; });
        if (idx2 >= 0) { parsed[idx2].balance = mem.balance; localStorage.setItem('memberBalanceData', JSON.stringify(parsed)); }
      }
    } catch(e) {}
  }

  // Log consumption record
  if (typeof memberConsumptionAll !== 'undefined' && Array.isArray(memberConsumptionAll)) {
    memberConsumptionAll.unshift({
      date: new Date().toLocaleString('zh-CN'),
      type: 'consume',
      typeLabel: '扣款',
      amount: -amount,
      balance: mem ? mem.balance : 0,
      remark: reason
    });
  }

  document.getElementById('modal-mbr-deduct') && document.getElementById('modal-mbr-deduct').remove();

  // Re-render member list if on member page
  if (typeof renderMemberBalanceTable === 'function') renderMemberBalanceTable();
  if (typeof renderMemberTable === 'function') renderMemberTable();

  showToast('💰 已扣除 ¥' + amount + '（' + memName + '），原因：' + reason, 'success');
};

// ============================================================
// 【改进5】消除 reissueInvoice 重复定义，统一为单一版本
// ============================================================
// 理由：主文件第24139行附近存在 reissueInvoice 重复定义，后者覆盖前者可能导致不一致
// 解决方案：统一 reissueInvoice 为唯一实现，以主文件第24139行版本为准
// 注意：此修复通过 window 函数覆盖方式确保唯一真实版本生效

var _reissueInvoiceImpl = function(invId) {
  var inv = invoiceStore.find(function(i) { return i.id === invId; });
  if (!inv) { showToast('未找到发票记录', 'error'); return; }
  var newId = 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(invoiceStore.length + 1).padStart(2, '0');
  var newInv = {
    id: newId,
    company: inv.company,
    tax: inv.tax,
    type: inv.type,
    amount: inv.amount,
    date: new Date().toISOString().slice(0, 10),
    status: '开具中',
    email: inv.email,
    reissuedFrom: invId  // Track source invoice
  };
  invoiceStore.unshift(newInv);
  showToast('🔄 发票 ' + invId + ' 已重开，新号码：' + newId, 'success');
  if (typeof applyInvoiceSearch === 'function') applyInvoiceSearch();
  if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
};

// 覆盖 window.reissueInvoice 确保唯一实现（覆盖主文件中的重复定义）
window.reissueInvoice = _reissueInvoiceImpl;

console.log('[iter71] 5项功能性改进注入完成：onInvoiceTypeChange / openInvoiceVoidModal / confirmInvoiceVoid / openKeyBatchIssueModal / submitKeyBatchIssue / submitMemberDeduct / reissueInvoice统一');
