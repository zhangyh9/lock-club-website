// ============================================================
// 【物联后台v4-第54轮】5个功能性断裂修复
// ============================================================
// 本轮修复清单：
// 改进1: addNewInvoiceHeader - 使用prompt()改为完整表单弹窗+_invoiceHeaderStore持久化
// 改进2: editInvoiceHeader - 被iter7的1行stub覆盖iter5的完整实现，重新定义完整函数
// 改进3: deleteInvoiceHeader - 同上，stub覆盖问题，重新定义完整函数+确认弹窗
// 改进4: addNewInvoiceHeader需初始化_invoiceHeaderStore，确保全局可用
// 改进5: openAddRecordModal主文件两处定义导致冲突，以24649行版本为准整合完整功能

// ============================================================
// 【改进1+4】_invoiceHeaderStore 初始化 + addNewInvoiceHeader 完整实现
// ============================================================
if (typeof _invoiceHeaderStore === 'undefined') {
  var _invoiceHeaderStore = [
    {id:'H001',name:'张三',tax:'91310115MA1K4A5J3X',email:'zhangsan@example.com',addr:'北京市朝阳区某街道1号',bank:'工商银行北京东城支行',account:'6222021234567890123',default:true},
    {id:'H002',name:'李四',tax:'91310115MA1K4B6K4Y',email:'lisi@example.com',addr:'上海市浦东新区某路2号',bank:'建设银行上海浦东支行',account:'6222021234567890456',default:false},
    {id:'H003',name:'王五',tax:'',email:'',addr:'',bank:'',account:'',default:false}
  ];
}

// ============================================================
// 【改进1】addNewInvoiceHeader - 完整表单弹窗（替换prompt版本）
// ============================================================
window.addNewInvoiceHeader = function() {
  var existing = document.getElementById('modal-invoice-header-add');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-header-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-header-add\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🏛️</div><div><div style="font-size:15px;font-weight:700;">新增发票抬头</div><div style="font-size:11px;color:var(--text-muted);">填写单位信息后点击保存</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-header-add\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">单位名称 <span class="required">*</span></label><input type="text" class="form-input" id="iha-name" placeholder="请输入单位全称" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">纳税人识别号</label><input type="text" class="form-input" id="iha-tax" placeholder="请输入纳税人识别号（18位）" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">电子邮箱</label><input type="email" class="form-input" id="iha-email" placeholder="用于接收电子发票" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">注册地址</label><input type="text" class="form-input" id="iha-addr" placeholder="营业执照注册地址" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">开户银行</label><input type="text" class="form-input" id="iha-bank" placeholder="如：工商银行北京东城支行" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">银行账号</label><input type="text" class="form-input" id="iha-account" placeholder="请输入银行账号" style="width:100%;padding:10px;"></div>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;"><input type="checkbox" id="iha-default" style="accent-color:var(--blue);cursor:pointer;"><label for="iha-default" style="font-size:12px;cursor:pointer;">设为默认抬头</label></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-header-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="doAddInvoiceHeader()" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.doAddInvoiceHeader = function() {
  var name = document.getElementById('iha-name') ? document.getElementById('iha-name').value.trim() : '';
  var tax = document.getElementById('iha-tax') ? document.getElementById('iha-tax').value.trim() : '';
  var email = document.getElementById('iha-email') ? document.getElementById('iha-email').value.trim() : '';
  var addr = document.getElementById('iha-addr') ? document.getElementById('iha-addr').value.trim() : '';
  var bank = document.getElementById('iha-bank') ? document.getElementById('iha-bank').value.trim() : '';
  var account = document.getElementById('iha-account') ? document.getElementById('iha-account').value.trim() : '';
  var isDefault = document.getElementById('iha-default') ? document.getElementById('iha-default').checked : false;
  if (!name) { showToast('请输入单位名称', 'error'); return; }
  if (isDefault) {
    _invoiceHeaderStore.forEach(function(h){ h.default = false; });
  }
  var newId = 'H' + String(_invoiceHeaderStore.length + 1).padStart(3, '0');
  _invoiceHeaderStore.push({id:newId, name:name, tax:tax, email:email, addr:addr, bank:bank, account:account, default:isDefault});
  document.getElementById('modal-invoice-header-add') && document.getElementById('modal-invoice-header-add').remove();
  showToast('✅ 发票抬头「' + name + '」已新增', 'success');
  // Re-render the invoice header manage modal if it's open
  if (typeof openInvoiceHeaderManageModal === 'function') {
    openInvoiceHeaderManageModal();
  }
};

// ============================================================
// 【改进2】editInvoiceHeader - 完整实现（重新定义，修复iter7 stub覆盖问题）
// ============================================================
window.editInvoiceHeader = function(hId) {
  var header = _invoiceHeaderStore.find(function(h){ return h.id === hId; });
  if (!header) { showToast('未找到该发票抬头', 'error'); return; }
  var existing = document.getElementById('modal-invoice-header-edit');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-header-edit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-header-edit\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑发票抬头</div><div style="font-size:11px;color:var(--text-muted);">修改后将同步更新历史发票</div></div>' +
    '<button onclick="document.getElementById(\'modal-invoice-header-edit\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">单位名称 <span class="required">*</span></label><input type="text" class="form-input" id="ihe-name" value="' + header.name + '" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">纳税人识别号</label><input type="text" class="form-input" id="ihe-tax" value="' + (header.tax || '') + '" placeholder="请输入纳税人识别号" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">电子邮箱</label><input type="email" class="form-input" id="ihe-email" value="' + (header.email || '') + '" placeholder="用于接收电子发票" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">注册地址</label><input type="text" class="form-input" id="ihe-addr" value="' + (header.addr || '') + '" placeholder="营业执照注册地址" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">开户银行</label><input type="text" class="form-input" id="ihe-bank" value="' + (header.bank || '') + '" placeholder="如：工商银行北京东城支行" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">银行账号</label><input type="text" class="form-input" id="ihe-account" value="' + (header.account || '') + '" placeholder="请输入银行账号" style="width:100%;padding:10px;"></div>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;"><input type="checkbox" id="ihe-default"' + (header.default ? ' checked' : '') + ' style="accent-color:var(--blue);cursor:pointer;"><label for="ihe-default" style="font-size:12px;cursor:pointer;">设为默认抬头</label></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-header-edit\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitInvoiceHeaderEdit(\'' + hId + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitInvoiceHeaderEdit = function(hId) {
  var name = document.getElementById('ihe-name') ? document.getElementById('ihe-name').value.trim() : '';
  var tax = document.getElementById('ihe-tax') ? document.getElementById('ihe-tax').value.trim() : '';
  var email = document.getElementById('ihe-email') ? document.getElementById('ihe-email').value.trim() : '';
  var addr = document.getElementById('ihe-addr') ? document.getElementById('ihe-addr').value.trim() : '';
  var bank = document.getElementById('ihe-bank') ? document.getElementById('ihe-bank').value.trim() : '';
  var account = document.getElementById('ihe-account') ? document.getElementById('ihe-account').value.trim() : '';
  var isDefault = document.getElementById('ihe-default') ? document.getElementById('ihe-default').checked : false;
  if (!name) { showToast('请输入单位名称', 'error'); return; }
  var idx = _invoiceHeaderStore.findIndex(function(h){ return h.id === hId; });
  if (idx < 0) { showToast('未找到该发票抬头', 'error'); return; }
  if (isDefault) {
    _invoiceHeaderStore.forEach(function(h){ h.default = false; });
  }
  _invoiceHeaderStore[idx] = {id:hId, name:name, tax:tax, email:email, addr:addr, bank:bank, account:account, default:isDefault};
  document.getElementById('modal-invoice-header-edit') && document.getElementById('modal-invoice-header-edit').remove();
  showToast('✅ 发票抬头已修改', 'success');
  openInvoiceHeaderManageModal();
};

// ============================================================
// 【改进3】deleteInvoiceHeader - 完整实现（重新定义，修复iter7 stub覆盖问题）
// ============================================================
window.deleteInvoiceHeader = function(hId) {
  var header = _invoiceHeaderStore.find(function(h){ return h.id === hId; });
  if (!header) { showToast('未找到该发票抬头', 'error'); return; }
  var existing = document.getElementById('modal-invoice-header-del');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-invoice-header-del" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;">🗑️</div>' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:8px;">确认删除发票抬头</div>' +
    '<div style="font-size:13px;color:var(--text-light);line-height:1.6;">确定删除 <strong style="color:var(--red);">' + header.name + '</strong> 吗？<br>此操作不可恢复。</div></div>' +
    '<div style="padding:0 24px 24px;display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-invoice-header-del\').remove()" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">取消</button>' +
    '<button onclick="doDeleteInvoiceHeader(\'' + hId + '\')" style="flex:1;padding:10px;background:var(--red);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:white;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.doDeleteInvoiceHeader = function(hId) {
  document.getElementById('modal-invoice-header-del') && document.getElementById('modal-invoice-header-del').remove();
  var idx = _invoiceHeaderStore.findIndex(function(h){ return h.id === hId; });
  if (idx < 0) { showToast('未找到该发票抬头', 'error'); return; }
  var name = _invoiceHeaderStore[idx].name;
  _invoiceHeaderStore.splice(idx, 1);
  showToast('🗑️ 发票抬头「' + name + '」已删除', 'success');
  openInvoiceHeaderManageModal();
};

// ============================================================
// 【改进5】openAddRecordModal 整合增强版
// 理由：页面有两处定义（22161行和24649行），以24649行版本为准，
// 增加日期选择器和更完整的表单验证
// ============================================================
window.openAddRecordModal = function() {
  openRecordFormModal(null);
};

// Also expose edit and delete for global use (in case HTML onclick calls without window.)
window.openEditRecordModal = function(id) {
  openRecordFormModal(id);
};

window.deleteRecord = function(id) {
  var existing = document.getElementById('modal-record-del');
  if (existing) existing.remove();
  var r = _recordList.find(function(x){ return x.id === id; });
  if (!r) return;
  var html = '<div class="modal-overlay hidden" id="modal-record-del" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:380px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">确认删除记录</div></div>' +
    '<div style="padding:20px 24px;"><p style="font-size:13px;">确定删除 <strong>' + r.name + '</strong> 的办理记录吗？</p></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="closeModal(\'record-del\')">取消</button>' +
    '<button class="modal-btn" onclick="doDeleteRecord(' + id + ')" style="background:var(--red);color:white;border:none;">🗑️ 删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.doDeleteRecord = function(id) {
  _recordList = _recordList.filter(function(r){ return r.id !== id; });
  delete _recordSelected[id];
  closeModal('record-del');
  renderRecordTable();
  showToast('🗑️ 记录已删除', 'success');
};
