// improvements-v4-iter36.js
// 物联后台v4第36轮 - 5个功能性缺失修复
// 修复：submitWoPending/submitWoComplete/switchRptChart/submitInvoiceCreate/openInvoiceCreateModal

// 【改进1】submitWoPending - 工单处理"标记处理中"按钮
// 理由：modal-wo-handle 弹窗的"⏳ 标记处理中"按钮 onclick="submitWoPending()" 但函数从未定义
function submitWoPending() {
  var notes = document.getElementById('wo-handle-notes');
  var noteVal = notes ? notes.value.trim() : '';
  if (!noteVal) {
    showToast('请填写处理意见', 'error');
    return;
  }
  var title = document.getElementById('wo-handle-title');
  var titleVal = title ? title.textContent : 'WO';
  closeModal('wo-handle');
  showToast('⏳ 工单 ' + titleVal + ' 已标记为处理中', 'warning');
  if (typeof applyWorkorderSearch === 'function') applyWorkorderSearch();
}

// 【改进2】submitWoComplete - 工单处理"完成处理"按钮
// 理由：modal-wo-handle 弹窗的"✅ 完成处理"按钮 onclick="submitWoComplete()" 但函数从未定义
// 注意：已存在 submitWorkorderComplete()，此处作别名桥接
function submitWoComplete() {
  var notes = document.getElementById('wo-handle-notes');
  var noteVal = notes ? notes.value.trim() : '';
  var resultRadio = document.querySelector('input[name="wo-result"]:checked');
  if (!resultRadio) {
    showToast('请选择处理结果', 'error');
    return;
  }
  var resultVal = resultRadio.value;
  var resultLabel = {resolved:'已解决', pending:'处理中', escalate:'升级处理'}[resultVal] || '已完成';
  closeModal('wo-handle');
  showToast('✅ 工单处理完成：' + resultLabel + (noteVal ? '，备注：' + noteVal.substring(0, 15) : ''), 'success');
  if (typeof renderWorkorderSLATable === 'function') renderWorkorderSLATable();
  if (typeof applyWorkorderSearch === 'function') applyWorkorderSearch();
}

// 【改进3】switchRptChart - 报表页面图表Tab切换
// 理由：page-report 页面有营收/入住率/能耗三个Tab onclick="switchRptChart(...)" 但函数从未定义
function switchRptChart(type, el) {
  // 更新Tab高亮
  var chartArea = document.getElementById('rpt-chart-area');
  if (!chartArea) return;
  if (el) {
    var tabs = el.parentElement.querySelectorAll('.card-tab');
    tabs.forEach(function(t) {
      t.classList.remove('active');
      t.style.background = '';
      t.style.color = '';
      t.style.fontWeight = '';
    });
    el.classList.add('active');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
    el.style.fontWeight = '600';
  }
  // 更新图表数据提示
  var chartTitle = chartArea.querySelector('.card-title');
  var dataTips = {
    income: {label: '📈 营收趋势（近30天）', color: 'var(--blue)'},
    occupancy: {label: '📈 入住率趋势（近30天）', color: 'var(--green)'},
    energy: {label: '📈 能耗趋势（近30天）', color: 'var(--orange)'}
  };
  var tip = dataTips[type] || dataTips.income;
  if (chartTitle) chartTitle.textContent = tip.label;
  // 图表柱状图颜色切换
  var bars = chartArea.querySelectorAll('.report-bar.income');
  bars.forEach(function(bar) {
    bar.style.background = tip.color;
  });
  showToast('📊 已切换至' + (type === 'income' ? '营收' : type === 'occupancy' ? '入住率' : '能耗') + '视图', 'info');
}

// 【改进4】submitInvoiceCreate - 发票管理"确认开具"按钮
// 理由：发票管理页面 openInvoiceCreateModal 弹窗有"确认开具"按钮但 submitInvoiceCreate 函数缺失（与 submitInvoiceIssueV2 不同）
// 业务逻辑：开具正式发票，填写完整信息后写入 invoiceStore，显示成功 Toast
function submitInvoiceCreate() {
  var company = document.getElementById('inv-f-company');
  var amount = document.getElementById('inv-f-amount');
  var taxNo = document.getElementById('inv-f-tax');
  var invType = document.getElementById('inv-f-type');
  var email = document.getElementById('inv-f-email');
  var bank = document.getElementById('inv-f-bank');
  var account = document.getElementById('inv-f-account');
  if (!company || !company.value.trim()) { showToast('请填写购方名称', 'error'); return; }
  if (!amount || !parseFloat(amount.value) || parseFloat(amount.value) <= 0) { showToast('请填写正确的发票金额', 'error'); return; }
  var newInv = {
    id: 'INV-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(invoiceStore.length + 1).padStart(2,'0'),
    company: company.value.trim(),
    tax: taxNo ? taxNo.value.trim() : '--',
    type: invType ? invType.value : '普通发票',
    amount: parseFloat(amount.value),
    date: new Date().toISOString().slice(0,10),
    status: '开具中',
    email: email ? email.value.trim() : '',
    bank: bank ? bank.value.trim() : '',
    account: account ? account.value.trim() : ''
  };
  invoiceStore.unshift(newInv);
  try { localStorage.removeItem('inv_draft'); } catch(e) {}
  // 关闭弹窗（id='modal-invoice-create' 或 'invoice-create'）
  var m1 = document.getElementById('modal-invoice-create');
  var m2 = document.getElementById('invoice-create');
  if (m1) m1.remove();
  if (m2 && m2 !== m1) m2.remove();
  if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
  showToast('🧾 发票已开具：' + newInv.id + '（¥' + newInv.amount + '）', 'success');
}

// 【改进5】openInvoiceCreateModal - 发票管理"开具发票"按钮
// 理由：发票管理菜单项 onclick="openInvoiceManagementModal()" 但函数缺失；另一处发票工具栏 onclick="openInvoiceCreateModal()" 也缺失
// 业务逻辑：打开发票开具弹窗（填写公司名称/税号/金额/类型/邮箱），点击确认开具后写入 invoiceStore
function openInvoiceCreateModal() {
  var existing = document.getElementById('modal-invoice-create');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-invoice-create" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-create\').remove()">' +
    '<div class="modal" style="width:520px;max-height:90vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🧾</div><div style="font-size:15px;font-weight:700;">开具发票</div>' +
    '<button onclick="document.getElementById(\'modal-invoice-create\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">购方名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="inv-f-company" placeholder="请输入公司或个人名称"></div>' +
    '<div class="form-group"><label class="form-label">税号</label>' +
    '<input type="text" class="form-input" id="inv-f-tax" placeholder="请输入纳税人识别号（选填）"></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">发票类型 <span class="required">*</span></label>' +
    '<select class="form-select" id="inv-f-type" style="width:100%;">' +
    '<option value="普通发票">📄 普通发票</option>' +
    '<option value="增值税专用">🏛️ 增值税专用发票</option>' +
    '<option value="电子发票">📱 电子发票</option></select></div>' +
    '<div class="form-group"><label class="form-label">价税合计 <span class="required">*</span></label>' +
    '<input type="number" class="form-input" id="inv-f-amount" placeholder="¥0.00" min="0" step="0.01"></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">开户银行</label>' +
    '<input type="text" class="form-input" id="inv-f-bank" placeholder="如：中国银行"></div>' +
    '<div class="form-group"><label class="form-label">银行账号</label>' +
    '<input type="text" class="form-input" id="inv-f-account" placeholder="请输入账号"></div></div>' +
    '<div class="form-group"><label class="form-label">接收邮箱</label>' +
    '<input type="email" class="form-input" id="inv-f-email" placeholder="发票将发送至该邮箱"></div>' +
    '<div style="padding:10px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);margin-top:4px;">💡 发票开具后将通过邮件发送电子版，纸质发票可联系财务领取</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-create\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="submitInvoiceCreate()" style="padding:10px 24px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">🧾 确认开具</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 补充：openInvoiceManagementModal - 发票管理菜单入口（另一处缺失函数）
function openInvoiceManagementModal() {
  showPage('invoice');
  showToast('📋 已进入发票管理', 'info');
}
