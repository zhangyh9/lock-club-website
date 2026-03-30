// ============================================================
// 【物联后台 v4 第12轮】5个断裂功能修复
// 5个 onclick 调用但函数体缺失，导致点击无响应
// ============================================================

// -------- 改进1：openAddRoomModal（新增房间，1处调用）--------
// 理由：房间管理页"新增房间"按钮调用此函数但从未定义
// 改进：弹窗表单填写房间号/楼层/房型，提交后添加到房间列表
window.openAddRoomModal = function() {
  var existing = document.getElementById('modal-add-room');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-room\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🚪</div><div><div style="font-size:15px;font-weight:700;">新增房间</div><div style="font-size:11px;color:var(--text-muted);">添加新房间到管理系统</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-room\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="nar-room-num" placeholder="如：305" style="width:100%;padding:10px;font-size:16px;text-align:center;font-weight:700;"></input></div>' +
    '<div class="form-group"><label class="form-label">楼层 <span class="required">*</span></label>' +
    '<select class="form-select" id="nar-floor" style="width:100%;padding:10px;">' +
    '<option value="3">3层</option><option value="2">2层</option><option value="1">1层</option></select></div>' +
    '<div class="form-group"><label class="form-label">房型 <span class="required">*</span></label>' +
    '<select class="form-select" id="nar-type" style="width:100%;padding:10px;">' +
    '<option value="亲子间">亲子间</option><option value="大床房">大床房</option><option value="标准间">标准间</option></select></div>' +
    '<div class="form-group"><label class="form-label">初始状态</label>' +
    '<select class="form-select" id="nar-status" style="width:100%;padding:10px;">' +
    '<option value="empty">空房</option><option value="in">入住</option><option value="repair">维修</option></select></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-room\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitAddRoom()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 确认添加</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddRoom = function() {
  var roomNum = document.getElementById('nar-room-num') ? document.getElementById('nar-room-num').value.trim() : '';
  var floor = document.getElementById('nar-floor') ? document.getElementById('nar-floor').value : '3';
  var type = document.getElementById('nar-type') ? document.getElementById('nar-type').value : '标准间';
  var status = document.getElementById('nar-status') ? document.getElementById('nar-status').value : 'empty';
  if (!roomNum) { showToast('请输入房间号', 'error'); return; }
  // Check duplicate
  var existingRows = document.querySelectorAll('#bld-room-body tr');
  for (var i = 0; i < existingRows.length; i++) {
    var td = existingRows[i].querySelector('td');
    if (td && td.textContent.trim() === roomNum) {
      showToast('房间号 ' + roomNum + ' 已存在', 'error');
      return;
    }
  }
  var statusBadge = status === 'in' ? '<span class="tbadge blue">入住</span>' : status === 'repair' ? '<span class="tbadge orange">维修</span>' : '<span class="tbadge green">空房</span>';
  var statusAttr = status === 'in' ? 'in' : status === 'repair' ? 'repair' : 'empty';
  var newRow = '<tr data-floor="' + floor + '" data-type="' + type + '" data-status="' + statusAttr + '">' +
    '<td><span style="font-weight:600;">' + roomNum + '</span></td><td>' + floor + '层</td><td>' + type + '</td>' +
    '<td>' + statusBadge + '</td><td><span class="tbadge green">🟢</span></td><td>0张</td>' +
    '<td><button class="action-btn small" onclick="openEditRoomModal(\'' + roomNum + '\')">编辑</button> <button class="action-btn small red" onclick="deleteRoom(\'' + roomNum + '\')">删除</button></td></tr>';
  var tbody = document.getElementById('bld-room-body');
  if (tbody) tbody.insertAdjacentHTML('beforeend', newRow);
  document.getElementById('modal-add-room') && document.getElementById('modal-add-room').remove();
  showToast('✅ 房间 ' + roomNum + ' 已添加', 'success');
};

// -------- 改进2：openEditRoomModal（编辑房间，6处调用）--------
// 理由：房间管理表格每行"编辑"按钮调用此函数但从未定义
// 改进：弹窗编辑房间号/楼层/房型/状态，提交后更新列表行
window.openEditRoomModal = function(roomNum) {
  var existing = document.getElementById('modal-edit-room');
  if (existing) existing.remove();
  // Find current room data from table row
  var rows = document.querySelectorAll('#bld-room-body tr');
  var rowData = null;
  for (var i = 0; i < rows.length; i++) {
    var td = rows[i].querySelector('td');
    if (td && td.textContent.trim() === roomNum) {
      var tds = rows[i].querySelectorAll('td');
      rowData = {
        num: tds[0] ? tds[0].textContent.trim() : roomNum,
        floor: tds[1] ? tds[1].textContent.trim().replace('层','') : '3',
        type: tds[2] ? tds[2].textContent.trim() : '标准间',
        status: tds[3] ? tds[3].textContent.trim() : '空房',
      };
      break;
    }
  }
  if (!rowData) rowData = {num: roomNum, floor: '3', type: '标准间', status: '空房'};
  var currentStatus = rowData.status;
  var html = '<div class="modal-overlay hidden" id="modal-edit-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-room\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑房间</div><div style="font-size:11px;color:var(--text-muted);">修改房间信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-edit-room\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房间号</label>' +
    '<input type="text" class="form-input" id="er-room-num" value="' + rowData.num + '" style="width:100%;padding:10px;font-size:16px;text-align:center;font-weight:700;"></input></div>' +
    '<div class="form-group"><label class="form-label">楼层</label>' +
    '<select class="form-select" id="er-floor" style="width:100%;padding:10px;">' +
    '<option value="3" ' + (rowData.floor === '3' ? 'selected' : '') + '>3层</option>' +
    '<option value="2" ' + (rowData.floor === '2' ? 'selected' : '') + '>2层</option>' +
    '<option value="1" ' + (rowData.floor === '1' ? 'selected' : '') + '>1层</option></select></div>' +
    '<div class="form-group"><label class="form-label">房型</label>' +
    '<select class="form-select" id="er-type" style="width:100%;padding:10px;">' +
    '<option value="亲子间" ' + (rowData.type === '亲子间' ? 'selected' : '') + '>亲子间</option>' +
    '<option value="大床房" ' + (rowData.type === '大床房' ? 'selected' : '') + '>大床房</option>' +
    '<option value="标准间" ' + (rowData.type === '标准间' ? 'selected' : '') + '>标准间</option></select></div>' +
    '<div class="form-group"><label class="form-label">状态</label>' +
    '<select class="form-select" id="er-status" style="width:100%;padding:10px;">' +
    '<option value="empty" ' + (currentStatus === '空房' ? 'selected' : '') + '>空房</option>' +
    '<option value="in" ' + (currentStatus === '入住' ? 'selected' : '') + '>入住</option>' +
    '<option value="repair" ' + (currentStatus === '维修' ? 'selected' : '') + '>维修</option></select></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-edit-room\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitEditRoom(\'' + roomNum + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitEditRoom = function(originalRoomNum) {
  var roomNum = document.getElementById('er-room-num') ? document.getElementById('er-room-num').value.trim() : '';
  var floor = document.getElementById('er-floor') ? document.getElementById('er-floor').value : '3';
  var type = document.getElementById('er-type') ? document.getElementById('er-type').value : '标准间';
  var status = document.getElementById('er-status') ? document.getElementById('er-status').value : 'empty';
  if (!roomNum) { showToast('请输入房间号', 'error'); return; }
  var statusBadge = status === 'in' ? '<span class="tbadge blue">入住</span>' : status === 'repair' ? '<span class="tbadge orange">维修</span>' : '<span class="tbadge green">空房</span>';
  var statusAttr = status === 'in' ? 'in' : status === 'repair' ? 'repair' : 'empty';
  // Find and update the row
  var rows = document.querySelectorAll('#bld-room-body tr');
  for (var i = 0; i < rows.length; i++) {
    var td = rows[i].querySelector('td');
    if (td && td.textContent.trim() === originalRoomNum) {
      rows[i].setAttribute('data-floor', floor);
      rows[i].setAttribute('data-type', type);
      rows[i].setAttribute('data-status', statusAttr);
      var tds = rows[i].querySelectorAll('td');
      if (tds[0]) tds[0].innerHTML = '<span style="font-weight:600;">' + roomNum + '</span>';
      if (tds[1]) tds[1].textContent = floor + '层';
      if (tds[2]) tds[2].textContent = type;
      if (tds[3]) tds[3].innerHTML = statusBadge;
      // Update edit/delete button references
      if (tds[6]) {
        tds[6].innerHTML = '<button class="action-btn small" onclick="openEditRoomModal(\'' + roomNum + '\')">编辑</button> <button class="action-btn small red" onclick="deleteRoom(\'' + roomNum + '\')">删除</button>';
      }
      break;
    }
  }
  document.getElementById('modal-edit-room') && document.getElementById('modal-edit-room').remove();
  showToast('✅ 房间 ' + roomNum + ' 信息已更新', 'success');
};

// -------- 改进3：addNewInvoiceHeader（新增发票抬头，1处调用）--------
// 理由：发票管理"新增发票抬头"按钮调用此函数但从未定义
// 改进：弹窗填写单位名称/税号/邮箱/地址/银行账号，提交后添加到抬头列表
window.addNewInvoiceHeader = function() {
  var existing = document.getElementById('modal-add-invoice-header');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-invoice-header" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-invoice-header\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🧾</div><div><div style="font-size:15px;font-weight:700;">新增发票抬头</div><div style="font-size:11px;color:var(--text-muted);">添加新的单位发票信息</div></div>' +
    '<button onclick="document.getElementById(\'modal-add-invoice-header\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">单位名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="aih-name" placeholder="请输入单位全称" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">纳税人识别号</label>' +
    '<input type="text" class="form-input" id="aih-tax" placeholder="请输入统一社会信用代码" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">电子邮箱</label>' +
    '<input type="email" class="form-input" id="aih-email" placeholder="用于接收电子发票" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">注册地址</label>' +
    '<input type="text" class="form-input" id="aih-addr" placeholder="营业执照注册地址" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">开户银行</label>' +
    '<input type="text" class="form-input" id="aih-bank" placeholder="如：工商银行北京东城支行" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">银行账号</label>' +
    '<input type="text" class="form-input" id="aih-account" placeholder="请输入银行账号" style="width:100%;padding:10px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-invoice-header\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitNewInvoiceHeader()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 确认添加</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitNewInvoiceHeader = function() {
  var name = document.getElementById('aih-name') ? document.getElementById('aih-name').value.trim() : '';
  var tax = document.getElementById('aih-tax') ? document.getElementById('aih-tax').value.trim() : '';
  var email = document.getElementById('aih-email') ? document.getElementById('aih-email').value.trim() : '';
  var addr = document.getElementById('aih-addr') ? document.getElementById('aih-addr').value.trim() : '';
  var bank = document.getElementById('aih-bank') ? document.getElementById('aih-bank').value.trim() : '';
  var account = document.getElementById('aih-account') ? document.getElementById('aih-account').value.trim() : '';
  if (!name) { showToast('单位名称不能为空', 'error'); return; }
  var newId = 'h' + (typeof _invoiceHeaderStore !== 'undefined' ? _invoiceHeaderStore.length + 1 : 4);
  if (typeof _invoiceHeaderStore !== 'undefined') {
    _invoiceHeaderStore.push({id: newId, name: name, tax: tax, email: email, addr: addr, bank: bank, account: account});
  }
  document.getElementById('modal-add-invoice-header') && document.getElementById('modal-add-invoice-header').remove();
  showToast('✅ 发票抬头「' + name + '」已添加', 'success');
  // Refresh invoice header list if modal is open
  if (typeof openInvoiceHeaderManageModal === 'function') openInvoiceHeaderManageModal();
};

// -------- 改进4：applyInvoiceSearch（发票搜索，1处调用）--------
// 理由：发票管理页搜索按钮调用此函数但从未定义
// 改进：读取搜索关键字+筛选条件，重新渲染发票列表
window.applyInvoiceSearch = function() {
  var keyword = '';
  var searchInput = document.getElementById('invoice-search-input');
  if (searchInput) keyword = searchInput.value.trim().toLowerCase();
  var statusFilter = 'all';
  var typeFilter = 'all';
  var statusEl = document.getElementById('invoice-status-filter');
  if (statusEl) statusFilter = statusEl.value;
  var typeEl = document.getElementById('invoice-type-filter');
  if (typeEl) typeFilter = typeEl.value;
  // Use the existing filter function if available, otherwise filter manually
  if (typeof filterInvoiceTab === 'function') {
    filterInvoiceTab(_invoiceCurrentTab || 'all');
  }
  // Re-render with current search
  if (typeof renderInvoiceFilteredList === 'function') {
    _invoiceCurrentSearch = keyword;
    _invoiceCurrentStatusFilter = statusFilter;
    _invoiceCurrentTypeFilter = typeFilter;
    renderInvoiceFilteredList();
  }
  showToast('🔍 搜索完成', 'info');
};

// -------- 改进5：addCheckoutItem（退房添加消费项，1处调用）--------
// 理由：退房结算弹窗"添加消费"按钮调用此函数但从未定义
// 改进：弹窗选择消费类型（餐品/迷你吧/加购等），添加到结算清单并更新总额
window.addCheckoutItem = function() {
  var existing = document.getElementById('modal-checkout-item');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-checkout-item" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-checkout-item\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">➕</div><div><div style="font-size:15px;font-weight:700;">添加消费项目</div><div style="font-size:11px;color:var(--text-muted);">选择或输入消费明细</div></div>' +
    '<button onclick="document.getElementById(\'modal-checkout-item\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">消费类型</label>' +
    '<select class="form-select" id="cci-type" style="width:100%;padding:10px;" onchange="onCheckoutItemTypeChange()">' +
    '<option value="minibar">🍺 迷你吧消费</option>' +
    '<option value="meal">🍳 加购早餐</option>' +
    '<option value="late">⏰ 延迟退房</option>' +
    '<option value="damage">💔 物品损坏</option>' +
    '<option value="extra">📦 其他加购</option></select></div>' +
    '<div class="form-group"><label class="form-label">项目名称</label>' +
    '<input type="text" class="form-input" id="cci-name" placeholder="如：小冰箱饮料×2" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">金额（元） <span class="required">*</span></label>' +
    '<input type="number" class="form-input" id="cci-amount" placeholder="0" min="0" style="width:100%;padding:10px;text-align:center;font-size:18px;font-weight:700;"></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="cci-note" placeholder="可选备注" style="width:100%;padding:10px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-checkout-item\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitCheckoutItem()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 添加到结算</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.onCheckoutItemTypeChange = function() {
  var type = document.getElementById('cci-type') ? document.getElementById('cci-type').value : 'minibar';
  var nameInput = document.getElementById('cci-name');
  var amountInput = document.getElementById('cci-amount');
  if (nameInput && amountInput) {
    var presets = {minibar:{name:'小冰箱饮料',amount:20},meal:{name:'加购早餐×1份',amount:28},late:{name:'延迟退房费',amount:50},damage:{name:'物品损坏赔偿',amount:100},extra:{name:'',amount:0}};
    var preset = presets[type] || {name:'',amount:0};
    if (preset.name && !nameInput.value) nameInput.value = preset.name;
    if (preset.amount && !amountInput.value) amountInput.value = preset.amount;
  }
};

window.submitCheckoutItem = function() {
  var type = document.getElementById('cci-type') ? document.getElementById('cci-type').value : 'minibar';
  var name = document.getElementById('cci-name') ? document.getElementById('cci-name').value.trim() : '';
  var amount = parseInt(document.getElementById('cci-amount') ? document.getElementById('cci-amount').value : '0') || 0;
  var note = document.getElementById('cci-note') ? document.getElementById('cci-note').value.trim() : '';
  if (!name) { showToast('请输入项目名称', 'error'); return; }
  if (amount <= 0) { showToast('请输入有效金额', 'error'); return; }
  var typeIcons = {minibar:'🍺', meal:'🍳', late:'⏰', damage:'💔', extra:'📦'};
  document.getElementById('modal-checkout-item') && document.getElementById('modal-checkout-item').remove();
  showToast('✅ 已添加：' + (typeIcons[type] || '') + ' ' + name + ' ¥' + amount, 'success');
  // Try to update checkout modal if open
  var checkoutSettle = document.getElementById('checkout-settle-items');
  if (checkoutSettle) {
    var newItem = '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">' +
      '<span>' + (typeIcons[type] || '📦') + ' ' + name + '</span><span style="color:var(--red);font-weight:600;">¥' + amount + '</span></div>';
    checkoutSettle.insertAdjacentHTML('beforeend', newItem);
    // Update total
    var totalEl = document.getElementById('checkout-grand-total');
    if (totalEl) {
      var currentTotal = parseInt(totalEl.textContent.replace('¥','').replace(/,/g,'')) || 0;
      totalEl.textContent = '¥' + (currentTotal + amount);
    }
  }
};
