// ============================================================
// 【物联后台v4-第69轮】5个功能性断裂修复
// 修复日期：2026-03-30
// 本轮修复：executeBatchDeleteRecords | executeDeleteBuilding | applyLogFilter | addNewInvoiceHeader完整持久化 | submitInvoiceHeaderEdit重绑定
// ============================================================

// ============================================================
// 【修复1】executeBatchDeleteRecords - 批量删除记录确认按钮断裂
// 理由：modal-batch-delete-record-confirm 中"确认删除"按钮 onclick="executeBatchDeleteRecords()" 从未定义
// 业务逻辑：与 doBatchDeleteRecords 功能相同，执行后将 modal 关闭、刷新列表、Toast 反馈
// ============================================================
window.executeBatchDeleteRecords = function() {
  var ids = Object.keys(_recordSelected).filter(function(k){ return _recordSelected[k]; });
  if (ids.length === 0) { showToast('请先选择要删除的记录', 'error'); return; }
  _recordList = _recordList.filter(function(r){ return !_recordSelected[r.id]; });
  _recordSelected = {};
  closeModal('batch-delete-record-confirm');
  renderRecordTable();
  showToast('🗑️ 已删除 ' + ids.length + ' 条办理记录', 'success');
};

// ============================================================
// 【修复2】executeDeleteBuilding - 楼栋删除确认按钮断裂
// 理由：openBuildingEditModal 中"确认删除"按钮 onclick="executeDeleteBuilding()" 从未定义
// 业务逻辑：删除指定楼栋数据，关闭弹窗，刷新楼栋列表，Toast反馈
// ============================================================
window.executeDeleteBuilding = function() {
  var bldId = window._currentEditBuildingId || '';
  if (!bldId) { showToast('未指定要删除的楼栋', 'error'); return; }
  var bldName = {main:'主楼', east:'东配楼', vip:'贵宾楼'}[bldId] || bldId;
  // Remove from buildingData
  buildingData = buildingData.filter(function(b){ return b.id !== bldId; });
  // Remove related floors
  if (typeof floorData !== 'undefined') {
    floorData = floorData.filter(function(f){ return f.building !== bldId; });
  }
  closeModal('modal-building-edit');
  delete window._currentEditBuildingId;
  showToast('🏢 ' + bldName + ' 已删除', 'success');
  // Refresh building list if renderBldBuildingList exists
  if (typeof renderBldBuildingList === 'function') renderBldBuildingList();
  if (typeof renderBuildingRoomsGrid === 'function') renderBuildingRoomsGrid();
};

// ============================================================
// 【修复3】applyLogFilter - 开锁记录筛选按钮断裂
// 理由：开锁记录页面"应用筛选"按钮 onclick="applyLogFilter()" 从未定义，导致筛选无效
// 业务逻辑：读取页面上的日期范围/开锁方式/关键词筛选条件，重新渲染记录列表
// ============================================================
window.applyLogFilter = function() {
  var dateStart = document.getElementById('log-date-start') ? document.getElementById('log-date-start').value : '';
  var dateEnd = document.getElementById('log-date-end') ? document.getElementById('log-date-end').value : '';
  var method = document.getElementById('log-method-filter') ? document.getElementById('log-method-filter').value : 'all';
  var searchKw = document.getElementById('log-search-kw') ? document.getElementById('log-search-kw').value.trim().toLowerCase() : '';

  if (typeof renderUnlockLogTable === 'function') {
    renderUnlockLogTable({ dateStart: dateStart, dateEnd: dateEnd, method: method, search: searchKw });
  }
  var resultEl = document.getElementById('log-filter-result');
  if (resultEl) {
    resultEl.textContent = '已按条件筛选';
    resultEl.style.color = 'var(--blue)';
  }
  showToast('🔍 筛选条件已应用', 'info');
};

// ============================================================
// 【修复4】addNewInvoiceHeader - 发票新增只prompt不持久化
// 理由：发票抬头管理弹窗中"新增抬头"只调用 prompt()，新增后不写入 store 且列表不刷新
// 业务逻辑：用表单弹窗替代 prompt，完整收集（名称/税号/邮箱/地址/银行/账号），写入 _invoiceHeaderStore，刷新弹窗
// ============================================================
window.addNewInvoiceHeader = function() {
  var existing = document.getElementById('modal-invoice-header-add');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-invoice-header-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-header-add\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏛️</div><div><div style="font-size:15px;font-weight:700;">新增发票抬头</div><div style="font-size:11px;color:var(--text-muted);">填写企业信息用于开具发票</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-header-add\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">单位名称 <span class="required">*</span></label><input type="text" class="form-input" id="iha-name" placeholder="请输入单位名称（购方名称）" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">纳税人识别号</label><input type="text" class="form-input" id="iha-tax" placeholder="请输入纳税人识别号（可为空）" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">电子邮箱</label><input type="email" class="form-input" id="iha-email" placeholder="用于接收电子发票" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">注册地址</label><input type="text" class="form-input" id="iha-addr" placeholder="营业执照注册地址" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">开户银行</label><input type="text" class="form-input" id="iha-bank" placeholder="如：工商银行北京东城支行" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">银行账号</label><input type="text" class="form-input" id="iha-account" placeholder="请输入银行账号" style="width:100%;padding:10px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-header-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitNewInvoiceHeader()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存抬头</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitNewInvoiceHeader = function() {
  var name = document.getElementById('iha-name') ? document.getElementById('iha-name').value.trim() : '';
  var tax = document.getElementById('iha-tax') ? document.getElementById('iha-tax').value.trim() : '';
  var email = document.getElementById('iha-email') ? document.getElementById('iha-email').value.trim() : '';
  var addr = document.getElementById('iha-addr') ? document.getElementById('iha-addr').value.trim() : '';
  var bank = document.getElementById('iha-bank') ? document.getElementById('iha-bank').value.trim() : '';
  var account = document.getElementById('iha-account') ? document.getElementById('iha-account').value.trim() : '';
  if (!name) { showToast('单位名称不能为空', 'error'); return; }
  var newId = 'H' + String(Date.now()).slice(-6);
  if (typeof _invoiceHeaderStore === 'undefined') {
    window._invoiceHeaderStore = [];
  }
  _invoiceHeaderStore.push({id: newId, name: name, tax: tax, email: email, addr: addr, bank: bank, account: account, default: false});
  document.getElementById('modal-invoice-header-add') && document.getElementById('modal-invoice-header-add').remove();
  showToast('✅ 发票抬头「' + name + '」新增成功', 'success');
  if (typeof openInvoiceHeaderManageModal === 'function') openInvoiceHeaderManageModal();
};

// ============================================================
// 【修复5】submitInvoiceHeaderEdit - iter5/iter7 中定义但未在主文件绑定
// 理由：主文件 openInvoiceHeaderManageModal 的编辑按钮调用 editInvoiceHeader，
//       editInvoiceHeader 的"保存修改"按钮调用 submitInvoiceHeaderEdit，
//       但该函数虽在 iter5 中定义，主文件中的调用可能因 script 加载顺序无法访问
// 改进：在此明确重绑定，确保保存修改功能可用
// ============================================================
window.submitInvoiceHeaderEdit = function(hId) {
  var name = document.getElementById('ihe-name') ? document.getElementById('ihe-name').value.trim() : '';
  var tax = document.getElementById('ihe-tax') ? document.getElementById('ihe-tax').value.trim() : '';
  var email = document.getElementById('ihe-email') ? document.getElementById('ihe-email').value.trim() : '';
  var addr = document.getElementById('ihe-addr') ? document.getElementById('ihe-addr').value.trim() : '';
  var bank = document.getElementById('ihe-bank') ? document.getElementById('ihe-bank').value.trim() : '';
  var account = document.getElementById('ihe-account') ? document.getElementById('ihe-account').value.trim() : '';
  if (!name) { showToast('单位名称不能为空', 'error'); return; }
  if (typeof _invoiceHeaderStore === 'undefined') {
    window._invoiceHeaderStore = [];
  }
  var idx = _invoiceHeaderStore.findIndex(function(h){ return h.id === hId; });
  if (idx >= 0) {
    _invoiceHeaderStore[idx] = {id: hId, name: name, tax: tax, email: email, addr: addr, bank: bank, account: account, default: _invoiceHeaderStore[idx].default || false};
  }
  document.getElementById('modal-invoice-header-edit') && document.getElementById('modal-invoice-header-edit').remove();
  showToast('✅ 发票抬头已更新', 'success');
  if (typeof openInvoiceHeaderManageModal === 'function') openInvoiceHeaderManageModal();
};
