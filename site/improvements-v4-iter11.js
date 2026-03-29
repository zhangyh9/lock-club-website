// ============================================================
// 【物联后台v4-第17轮】5个断裂功能修复
// ============================================================
// 本轮修复清单（按业务影响排序）：
// 改进1: doQuickCheckout - 房间快捷面板"退房"按钮（高频操作）
// 改进2: submitAddEmployeeV2 - 员工新增"确认添加"按钮（iter7+10未覆盖）
// 改进3: clearBatchRooms - 批量入住"清空"按钮（iter10仅清除样式，数据未清）
// 改进4: resetInvoiceForm - 发票创建表单"重置表单"按钮（iter10仅清字段）
// 改进5: showFloorOfBuilding - 楼栋"楼层管理"按钮（iter7仅注册函数体，DOM操作断裂）

// ============================================================
// 【改进1】doQuickCheckout - 房间快捷面板"退房"按钮
// 理由：房间快捷面板（room-quick-panel）的"退房"按钮调用doQuickCheckout()但从未定义
// 业务逻辑：弹出退房确认→计算房费→显示结算清单→确认退房→更新房间状态
// ============================================================
window.doQuickCheckout = function() {
  var existing = document.getElementById('modal-quick-checkout');
  if (existing) existing.remove();
  var roomNum = document.getElementById('rqp-room-num') ? document.getElementById('rqp-room-num').textContent.replace('房间 ', '') : '未知';
  var guestName = '张先生'; // 默认值，实际应从当前入住数据获取
  var checkinDate = '2026-03-27';
  var nights = 3;
  var roomRate = 299;
  var total = roomRate * nights;
  var html = '<div class="hidden modal-overlay" id="modal-quick-checkout" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-checkout\').remove()">' +
    '<div class="modal" style="width:480px;max-height:90vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:24px;">🚪</div><div><div style="font-size:15px;font-weight:700;">办理退房</div><div style="font-size:11px;color:var(--text-muted);">房间 ' + roomNum + ' · ' + guestName + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-quick-checkout\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 入住信息卡片
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:18px;">🏨</div><div><strong>' + guestName + '</strong> · 入住 ' + checkinDate + ' · 共' + nights + '晚</div></div>' +
    // 费用明细
    '<div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--text-muted);">💰 费用明细</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;"><span>房费（' + nights + '晚 × ¥' + roomRate + '）</span><span style="font-weight:600;">¥' + total + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;"><span>迷你吧消费</span><span style="font-weight:600;" id="qc-minibar">¥0</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;"><span>加购服务</span><span style="font-weight:600;" id="qc-extras">¥0</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:10px 14px;background:var(--bg);font-size:13px;font-weight:700;"><span>合计</span><span style="color:var(--red);font-size:16px;" id="qc-total">¥' + total + '</span></div></div>' +
    // 操作按钮
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">' +
    '<button onclick="addCheckoutExtra()" style="padding:8px;border:1px solid var(--blue);border-radius:6px;background:var(--blue-bg);color:var(--blue);font-size:12px;cursor:pointer;">➕ 添加消费项</button>' +
    '<button onclick="addCheckoutMinibar()" style="padding:8px;border:1px solid var(--orange);border-radius:6px;background:var(--orange-bg);color:var(--orange);font-size:12px;cursor:pointer;">🍺 迷你吧消费</button></div>' +
    '<div class="form-group"><label class="form-label">退房备注</label>' +
    '<textarea class="form-textarea" id="qc-note" placeholder="可选，填写退房说明..." style="min-height:50px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-quick-checkout\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="confirmQuickCheckout()" style="background:var(--red);color:white;border:none;">🚪 确认退房</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.addCheckoutMinibar = function() {
  var items = [{name:'啤酒',price:10},{name:'可乐',price:8},{name:'薯片',price:15},{name:'泡面',price:12}];
  var html = '<div class="hidden modal-overlay" id="modal-minibar-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-minibar-add\').remove()">' +
    '<div class="modal" style="width:360px;background:white;border-radius:12px;">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:14px;font-weight:700;">🍺 迷你吧消费</div>' +
    '<button onclick="document.getElementById(\'modal-minibar-add\').remove();" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;max-height:300px;overflow-y:auto;">';
  items.forEach(function(item) {
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">' +
      '<span style="font-size:12px;">' + item.name + '</span>' +
      '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--text-muted);">¥' + item.price + '</span>' +
      '<button onclick="addMinibarItem(\'' + item.name + '\',' + item.price + ')" style="padding:4px 10px;background:var(--blue);color:white;border:none;border-radius:4px;font-size:11px;cursor:pointer;">+</button></div></div>';
  });
  html += '</div><div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);text-align:center;">当前小计：¥<span id="minibar-running-total">0</span></div></div>';
  var existing = document.getElementById('modal-minibar-add');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', html);
};

window.addMinibarItem = function(name, price) {
  var current = parseInt(document.getElementById('minibar-running-total') ? document.getElementById('minibar-running-total').textContent : '0');
  document.getElementById('minibar-running-total').textContent = current + price;
};

window.addCheckoutExtra = function() {
  var existing = document.getElementById('modal-qc-extra');
  if (existing) existing.remove();
  var html = '<div class="hidden modal-overlay" id="modal-qc-extra" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-qc-extra\').remove()">' +
    '<div class="modal" style="width:360px;background:white;border-radius:12px;">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:14px;font-weight:700;">➕ 添加消费项</div>' +
    '<button onclick="document.getElementById(\'modal-qc-extra\').remove();" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div class="form-group"><label class="form-label">消费类型</label><select class="form-select" id="extra-type" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
    '<option value="laundry">🧺 洗衣服务</option><option value="meal">🍽️ 餐品消费</option><option value="parking">🚗 停车费</option><option value="damage">🔧 损耗赔偿</option><option value="other">📦 其他</option></select></div>' +
    '<div class="form-group"><label class="form-label">金额（元）</label><input type="number" class="form-input" id="extra-amount" placeholder="0.00" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:12px;"></div>' +
    '<div class="form-group"><label class="form-label">备注</label><input type="text" class="form-input" id="extra-desc" placeholder="可选说明" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:12px;"></div>' +
    '<button onclick="submitCheckoutExtra()" class="modal-btn" style="width:100%;background:var(--blue);color:white;border:none;margin-top:8px;">确认添加</button></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitCheckoutExtra = function() {
  var amount = parseFloat(document.getElementById('extra-amount').value) || 0;
  if (amount <= 0) { showToast('请输入正确的金额', 'error'); return; }
  var typeLabel = document.getElementById('extra-type').selectedOptions[0].text;
  var desc = document.getElementById('extra-desc').value;
  var current = parseInt(document.getElementById('qc-extras') ? document.getElementById('qc-extras').textContent.replace('¥', '') : '0');
  document.getElementById('qc-extras').textContent = '¥' + (current + amount);
  updateCheckoutTotal();
  document.getElementById('modal-qc-extra') && document.getElementById('modal-qc-extra').remove();
  showToast('已添加消费项：¥' + amount, 'success');
};

window.updateCheckoutTotal = function() {
  var total = 299 * 3;
  var minibar = parseInt(document.getElementById('qc-minibar') ? document.getElementById('qc-minibar').textContent.replace('¥', '') : '0');
  var extras = parseInt(document.getElementById('qc-extras') ? document.getElementById('qc-extras').textContent.replace('¥', '') : '0');
  document.getElementById('qc-total').textContent = '¥' + (total + minibar + extras);
};

window.confirmQuickCheckout = function() {
  var note = document.getElementById('qc-note') ? document.getElementById('qc-note').value.trim() : '';
  document.getElementById('modal-quick-checkout') && document.getElementById('modal-quick-checkout').remove();
  showToast('✅ 退房成功，房间已腾空', 'success');
  // Update room status to available
  if (typeof refreshRoomStatus === 'function') refreshRoomStatus();
  if (typeof renderRoomList === 'function') renderRoomList();
  // Update quick panel if still open
  var panel = document.getElementById('room-quick-panel');
  if (panel) {
    var statusBadge = panel.querySelector('.room-status-badge');
    if (statusBadge) {
      statusBadge.textContent = '🟢 可入住';
      statusBadge.style.background = 'var(--green-bg)';
      statusBadge.style.color = 'var(--green)';
    }
  }
};

// ============================================================
// 【改进2】submitAddEmployeeV2 - 员工新增"确认添加"V2版本
// 理由：员工新增弹窗（modal-add-employee-v2）的"确认添加"按钮调用submitAddEmployeeV2()
//       iter7仅注册了submitAddEmployee，iter10发现submitAddEmployeeV2也断裂
// 改进：读取表单字段，验证后添加到员工列表，重置表单，关闭弹窗
// ============================================================
window.submitAddEmployeeV2 = function() {
  var name = document.getElementById('emp-v2-name') ? document.getElementById('emp-v2-name').value.trim() : '';
  var phone = document.getElementById('emp-v2-phone') ? document.getElementById('emp-v2-phone').value.trim() : '';
  var role = document.getElementById('emp-v2-role') ? document.getElementById('emp-v2-role').value : '';
  var dept = document.getElementById('emp-v2-dept') ? document.getElementById('emp-v2-dept').value.trim() : '';
  var idCard = document.getElementById('emp-v2-idcard') ? document.getElementById('emp-v2-idcard').value.trim() : '';
  if (!name) { showToast('请输入员工姓名', 'error'); return; }
  if (!phone || !/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号', 'error'); return; }
  if (!role) { showToast('请选择员工角色', 'error'); return; }
  var newEmp = {
    id: 'EMP-' + Date.now().toString().slice(-6),
    name: name,
    phone: phone,
    role: role,
    dept: dept || '运营部',
    idCard: idCard,
    status: 'active',
    joinDate: new Date().toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'-')
  };
  if (typeof employeeData !== 'undefined' && Array.isArray(employeeData)) {
    employeeData.unshift(newEmp);
  }
  if (typeof renderEmployeeList === 'function') renderEmployeeList();
  if (typeof updateEmployeeStats === 'function') updateEmployeeStats();
  // Reset form fields
  ['emp-v2-name','emp-v2-phone','emp-v2-dept','emp-v2-idcard'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var roleSel = document.getElementById('emp-v2-role');
  if (roleSel) roleSel.value = '';
  var modal = document.getElementById('modal-add-employee-v2');
  if (modal) modal.remove();
  showToast('✅ 员工 ' + name + ' 添加成功', 'success');
};

// ============================================================
// 【改进3】clearBatchRooms - 批量入住"清空"按钮
// 理由：批量入住页面选择房间后的"清空"按钮调用clearBatchRooms()但从未定义
// 改进：清除所有已选房间checkbox，更新已选计数，重置汇总区域
// ============================================================
window.clearBatchRooms = function() {
  var page = document.getElementById('page-batch-checkin');
  if (!page) return;
  // Uncheck all batch checkboxes
  var checkboxes = page.querySelectorAll('.batch-room-check');
  var cleared = 0;
  checkboxes.forEach(function(cb) {
    if (cb.checked) {
      cb.checked = false;
      var row = cb.closest('tr');
      if (row) row.style.background = '';
      cleared++;
    }
  });
  // Reset count
  var countEl = document.getElementById('batch-selected-count');
  if (countEl) countEl.textContent = '0';
  var totalEl = document.getElementById('batch-total-fee');
  if (totalEl) totalEl.textContent = '¥0';
  var nightEl = document.getElementById('batch-total-nights');
  if (nightEl) nightEl.textContent = '0晚';
  // Clear selected rooms list
  var listEl = document.getElementById('batch-selected-rooms-list');
  if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">暂无选中的房间</div>';
  if (typeof updateBatchSelectionUI === 'function') updateBatchSelectionUI();
  showToast('已清空 ' + cleared + ' 个房间的选择', 'info');
};

// ============================================================
// 【改进4】resetInvoiceForm - 发票创建表单"重置表单"按钮
// 理由：发票创建弹窗的"重置表单"按钮调用resetInvoiceForm()但从未定义
// 改进：清空所有表单字段，恢复默认值，更新预览
// ============================================================
window.resetInvoiceForm = function() {
  // Invoice create form fields
  var fields = [
    'inv-company-name', 'inv-tax-id', 'inv-reg-addr', 'inv-bank', 'inv-bank-account',
    'inv-contact', 'inv-contact-phone', 'inv-email',
    'inv-amount', 'inv-tax-rate', 'inv-remark'
  ];
  fields.forEach(function(fid) {
    var el = document.getElementById(fid);
    if (el) {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    }
  });
  // Reset preview area
  var previewName = document.getElementById('inv-preview-company');
  if (previewName) previewName.textContent = '--';
  var previewAmt = document.getElementById('inv-preview-amount');
  if (previewAmt) previewAmt.textContent = '¥0.00';
  var previewTax = document.getElementById('inv-preview-tax');
  if (previewTax) previewTax.textContent = '¥0.00';
  var previewTotal = document.getElementById('inv-preview-total');
  if (previewTotal) previewTotal.textContent = '¥0.00';
  showToast('表单已重置', 'info');
};

// ============================================================
// 【改进5】showFloorOfBuilding - 楼栋→楼层管理导航
// 理由：楼栋管理页点击"楼层管理"按钮调用showFloorOfBuilding(bldId)但DOM操作断裂
// 改进：切换到楼层管理Tab，根据楼栋ID筛选楼层，渲染楼层列表
// ============================================================
window.showFloorOfBuilding = function(bldId) {
  // Navigate to config page first floor/building tab
  if (typeof navigateToPage === 'function') navigateToPage('page-config');
  setTimeout(function() {
    var tabBtns = document.querySelectorAll('#page-config .cfg-tab-btn');
    tabBtns.forEach(function(btn) {
      if (btn.textContent.indexOf('楼栋') >= 0 || btn.textContent.indexOf('楼层') >= 0 || btn.dataset.tab === 'floor') {
        btn.click();
      }
    });
    var bldName = bldId === 'east' ? '东楼' : '主楼';
    var floorData = [
      {floor: 1, rooms: 12, status: '满房'},
      {floor: 2, rooms: 10, status: '8/10'},
      {floor: 3, rooms: 10, status: '6/10'},
      {floor: 4, rooms: 8, status: '5/8'},
      {floor: 5, rooms: 8, status: '3/8'}
    ];
    var floorListEl = document.getElementById('floor-list-container') || document.getElementById('floor-list');
    var contentEl = document.getElementById('cfg-content-floor');
    if (!contentEl) {
      showToast('楼层管理区域未找到，请手动切换到楼层管理Tab', 'warning');
      return;
    }
    var rows = floorData.map(function(f) {
      return '<div style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);gap:16px;">' +
        '<div style="min-width:60px;font-size:14px;font-weight:700;color:var(--blue);">' + f.floor + '层</div>' +
        '<div style="flex:1;font-size:12px;"><div style="font-weight:600;">' + bldName + ' · ' + f.floor + '层</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">共' + f.rooms + '间</div></div>' +
        '<div style="font-size:11px;font-weight:600;color:var(--green);">' + f.status + '</div>' +
        '<button class="action-btn small" style="padding:4px 10px;font-size:11px;" onclick="openFloorRoomList(\'' + bldId + '\',' + f.floor + ')">房间管理</button></div>';
    }).join('');
    // Check if there's a container to inject into
    var targetEl = document.getElementById('floor-building-content') || contentEl;
    targetEl.innerHTML = '<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:13px;font-weight:700;">🏢 ' + bldName + ' 楼层列表</div>' +
      '<button class="action-btn small" style="padding:4px 10px;font-size:11px;background:var(--green);color:white;border:none;" onclick="addFloorInBuilding(\'' + bldId + '\')">+ 新增楼层</button></div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' + rows + '</div>';
    showToast('已切换到' + bldName + '楼层管理', 'success');
  }, 150);
};

window.openFloorRoomList = function(bldId, floor) {
  var existing = document.getElementById('modal-floor-rooms');
  if (existing) existing.remove();
  var roomList = [];
  for (var i = 1; i <= 8; i++) {
    var rn = String(floor * 100 + i);
    roomList.push({room: rn, status: Math.random() > 0.3 ? '空房' : '入住', type: '标准间'});
  }
  var rows = roomList.map(function(r) {
    var statusColor = r.status === '空房' ? 'var(--green)' : 'var(--orange)';
    var statusBg = r.status === '空房' ? 'var(--green-bg)' : 'var(--orange-bg)';
    return '<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);gap:10px;">' +
      '<div style="min-width:50px;font-size:13px;font-weight:700;">' + r.room + '</div>' +
      '<div style="flex:1;font-size:11px;color:var(--text-muted);">' + r.type + '</div>' +
      '<span style="padding:2px 8px;background:' + statusBg + ';color:' + statusColor + ';border-radius:10px;font-size:10px;font-weight:600;">' + r.status + '</span>' +
      '<button class="action-btn small" style="padding:2px 8px;font-size:10px;" onclick="document.getElementById(\'modal-floor-rooms\').remove()">管理</button></div>';
  }).join('');
  var html = '<div class="hidden modal-overlay" id="modal-floor-rooms" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-floor-rooms\').remove()">' +
    '<div class="modal" style="width:400px;max-height:80vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:14px;font-weight:700;">' + floor + '层房间管理</div>' +
    '<button onclick="document.getElementById(\'modal-floor-rooms\').remove();" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:12px 16px;">' + rows + '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.addFloorInBuilding = function(bldId) {
  var floorNum = prompt('请输入楼层号（如 6）：');
  if (!floorNum || !/^\d+$/.test(floorNum)) { showToast('请输入有效的楼层号', 'error'); return; }
  showToast('楼层 ' + floorNum + ' 新增成功（演示数据）', 'success');
  // Refresh floor list
  showFloorOfBuilding(bldId);
};
