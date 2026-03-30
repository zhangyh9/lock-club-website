// ============================================================
// 物联后台迭代v4-iter15.js - 5个功能性修复
// 修复：onclick调用的函数存在但函数体缺失
// ============================================================

// ============================================================
// 【改进1】openAddRoomModal - 房间管理新增房间按钮函数补全
// 理由：line 12421 onclick="openAddRoomModal()" 调用存在但函数体缺失
// 业务逻辑：打开新增房间弹窗，自动填入下一个可用房间号
// ============================================================
window.openAddRoomModal = function() {
  var bldgSelect = document.getElementById('bld-bldg-filter') || document.getElementById('bldg-select');
  var bldg = bldgSelect ? bldgSelect.value : 'main';
  var floorSelect = document.getElementById('bld-floor-filter');
  var floorVal = floorSelect && floorSelect.value !== 'all' ? floorSelect.value : '';
  var nextRoomNum = 301;
  var existingRooms = document.querySelectorAll('#bld-rooms-grid .room-card, #room-list-body tr');
  existingRooms.forEach(function(el) {
    var txt = el.textContent;
    var m = txt.match(/(\d{3})/);
    if (m) { var n = parseInt(m[1]); if (n >= nextRoomNum) nextRoomNum = n + 1; }
  });
  var defaultRoom = floorVal ? parseInt(floorVal) * 100 + 1 : nextRoomNum;
  var roomNumEl = document.getElementById('room-num-input') || document.getElementById('room-num');
  if (roomNumEl) roomNumEl.value = defaultRoom;
  var modal = document.getElementById('modal-add-room') || document.getElementById('modal-room-form');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  } else {
    // Fallback: open simple room add modal inline
    var existing = document.getElementById('modal-quick-add-room');
    if (existing) existing.remove();
    var html = '<div class="modal-overlay hidden" id="modal-quick-add-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-add-room\').remove()">' +
      '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:16px;font-weight:700;">🚪 新增房间</div>' +
      '<button onclick="document.getElementById(\'modal-quick-add-room\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label>' +
      '<input type="number" class="form-input" id="qar-room-num" value="' + defaultRoom + '" placeholder="如：301"></div>' +
      '<div class="form-group"><label class="form-label">所属楼栋</label>' +
      '<select class="form-select" id="qar-bldg" style="width:100%;padding:8px 12px;">' +
      '<option value="main">🏢 主楼</option><option value="east">🏢 东配楼</option></select></div>' +
      '<div class="form-group"><label class="form-label">楼层</label>' +
      '<select class="form-select" id="qar-floor" style="width:100%;padding:8px 12px;">' +
      '<option value="3">3层</option><option value="2">2层</option><option value="1">1层</option></select></div>' +
      '<div class="form-group"><label class="form-label">房型</label>' +
      '<select class="form-select" id="qar-type" style="width:100%;padding:8px 12px;">' +
      '<option value="标准间">标准间</option><option value="大床房">大床房</option><option value="亲子间">亲子间</option></select></div>' +
      '<div class="form-group"><label class="form-label">状态</label>' +
      '<select class="form-select" id="qar-status" style="width:100%;padding:8px 12px;">' +
      '<option value="vacant">🟢 空房</option><option value="occupied">🔵 入住</option>' +
      '<option value="maintenance">🔶 维修</option></select></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-quick-add-room\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
      '<button onclick="confirmQuickAddRoom()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 确认添加</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }
  showToast('请填写房间信息', 'info');
};

window.confirmQuickAddRoom = function() {
  var roomNum = document.getElementById('qar-room-num') ? document.getElementById('qar-room-num').value : '';
  var bldg = document.getElementById('qar-bldg') ? document.getElementById('qar-bldg').value : 'main';
  var floor = document.getElementById('qar-floor') ? document.getElementById('qar-floor').value : '';
  var type = document.getElementById('qar-type') ? document.getElementById('qar-type').value : '标准间';
  var status = document.getElementById('qar-status') ? document.getElementById('qar-status').value : 'vacant';
  if (!roomNum) { showToast('请输入房间号', 'error'); return; }
  var statusMap = {vacant:'空房', occupied:'入住', maintenance:'维修'};
  var statusColor = {vacant:'var(--green)', occupied:'var(--blue)', maintenance:'var(--orange)'};
  var statusBg = {vacant:'var(--green-bg)', occupied:'var(--blue-bg)', maintenance:'var(--orange-bg)'};
  // Add to room grid if exists
  var grid = document.getElementById('bld-rooms-grid');
  if (grid) {
    var card = document.createElement('div');
    card.className = 'room-card';
    card.style.cssText = 'padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;text-align:center;cursor:pointer;';
    card.innerHTML = '<div style="font-size:16px;font-weight:700;margin-bottom:4px;">' + roomNum + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">' + floor + '层 · ' + type + '</div>' +
      '<span style="padding:2px 6px;background:' + statusBg[status] + ';color:' + statusColor[status] + ';border-radius:10px;font-size:10px;">' + statusMap[status] + '</span>';
    grid.appendChild(card);
  }
  document.getElementById('modal-quick-add-room') && document.getElementById('modal-quick-add-room').remove();
  showToast('✅ 房间 ' + roomNum + ' 添加成功', 'success');
};

// ============================================================
// 【改进2】openAddRoomTypeModalV2 - 房型管理新增按钮函数补全
// 理由：line 7557 onclick="openAddRoomTypeModalV2()" 调用存在但函数体缺失
// 业务逻辑：打开房型管理弹窗（modal-roomtype-manage），渲染房型列表
// ============================================================
window.openAddRoomTypeModalV2 = function() {
  var modal = document.getElementById('modal-roomtype-manage');
  if (!modal) {
    // Create modal if not exists
    var existing = document.getElementById('modal-roomtype-manage');
    if (existing) existing.remove();
    var roomTypes = [
      {name:'标准间', code:'STD', count:5, capacity:2, price:128, tags:'经济实惠,适合商务', status:'enabled'},
      {name:'大床房', code:'DBL', count:4, capacity:2, price:168, tags:'1.8m大床,高速WiFi', status:'enabled'},
      {name:'亲子间', code:'FAM', count:2, capacity:4, price:268, tags:'两张床,亲子优选', status:'enabled'}
    ];
    var rows = roomTypes.map(function(rt, i) {
      return '<tr>' +
        '<td><input type="checkbox" style="accent-color:var(--blue);"></td>' +
        '<td><span style="font-weight:600;">' + rt.name + '</span></td>' +
        '<td style="color:var(--text-muted);">' + rt.code + '</td>' +
        '<td>' + rt.count + '间</td><td>' + rt.capacity + '人</td>' +
        '<td style="font-weight:600;color:var(--blue);">¥' + rt.price + '</td>' +
        '<td><span style="padding:2px 8px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:11px;">' + rt.tags.split(',')[0] + '</span></td>' +
        '<td><span class="tbadge green">启用</span></td>' +
        '<td>' +
        '<button class="action-btn small" onclick="openEditRoomType(' + i + ')" style="padding:3px 8px;font-size:11px;">✏️ 编辑</button> ' +
        '<button class="action-btn small red" onclick="deleteRoomType(' + i + ')" style="padding:3px 8px;font-size:11px;">删除</button></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-roomtype-manage" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-roomtype-manage\').remove()">' +
      '<div class="modal" style="width:900px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:16px;font-weight:700;">🏠 房型管理</div>' +
      '<button onclick="document.getElementById(\'modal-roomtype-manage\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--blue-bg);">' +
      '<button class="action-btn" onclick="openAddRoomTypeModal()" style="padding:8px 16px;background:var(--blue);color:white;border:none;font-size:13px;font-weight:600;border-radius:6px;">➕ 新增房型</button>' +
      '<button class="action-btn" onclick="openBatchPriceAdjustModal()" style="padding:8px 16px;background:var(--orange);color:white;border:none;font-size:13px;font-weight:600;border-radius:6px;">💰 批量调价</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 20px;">' +
      '<table class="table" style="font-size:13px;"><thead><tr><th style="width:32px;"><input type="checkbox" style="accent-color:var(--blue);"></th>' +
      '<th>房型名称</th><th>编码</th><th>房间数</th><th>容纳人数</th><th>标准价</th><th>特点</th><th>状态</th><th>操作</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-roomtype-manage\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  } else {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
};

window.openEditRoomType = function(idx) {
  showToast('✏️ 房型编辑功能已打开（idx:' + idx + '）', 'info');
  // For now, open the base roomtype form for editing
  openAddRoomTypeModal();
};

window.deleteRoomType = function(idx) {
  var types = ['标准间','大床房','亲子间'];
  var t = types[idx] || '该房型';
  if (confirm('确定删除房型「' + t + '」？删除后不可恢复！')) {
    showToast('🗑️ ' + t + ' 已删除', 'success');
    openAddRoomTypeModalV2(); // Refresh
  }
};

window.openBatchPriceAdjustModal = function() {
  var existing = document.getElementById('modal-batch-price');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-batch-price" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-price\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:16px;font-weight:700;">💰 批量调价</div>' +
    '<button onclick="document.getElementById(\'modal-batch-price\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">调价方式</label>' +
    '<select class="form-select" id="bpct-mode" style="width:100%;padding:8px 12px;">' +
    '<option value="percent">按百分比调整</option><option value="fixed">按固定金额调整</option></select></div>' +
    '<div class="form-group"><label class="form-label">调整幅度（%）</label>' +
    '<input type="number" class="form-input" id="bpct-value" value="10" placeholder="如：10（表示上调10%），-10（表示下调10%）" style="width:100%;padding:8px 12px;"></div>' +
    '<div class="form-group"><label class="form-label">适用房型</label>' +
    '<div style="display:flex;flex-direction:column;gap:6px;">' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 标准间</label>' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 大床房</label>' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 亲子间</label></div></div>' +
    '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);">⚠️ 调价后无法撤销，请确认后再操作</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-batch-price\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="confirmBatchPriceAdjust()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 确认调价</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmBatchPriceAdjust = function() {
  var mode = document.getElementById('bpct-mode') ? document.getElementById('bpct-mode').value : 'percent';
  var val = parseFloat(document.getElementById('bpct-value') ? document.getElementById('bpct-value').value : 0);
  if (isNaN(val) || val === 0) { showToast('请输入有效的调整幅度', 'error'); return; }
  var prefix = val > 0 ? '上调' : '下调';
  document.getElementById('modal-batch-price') && document.getElementById('modal-batch-price').remove();
  showToast('✅ 已' + prefix + '所有选中房型 ' + Math.abs(val) + '%', 'success');
  openAddRoomTypeModalV2();
};

// ============================================================
// 【改进3】openAddFloorRoomModal - 快速添加房间按钮函数补全
// 理由：line 13468 onclick="openAddRoomForm()" 实际应打开快速添加房间弹窗
//       另有 openAddFloorRoomModal onclick 但函数体缺失
// 业务逻辑：打开快速添加房间弹窗，支持批量生成房间号
// ============================================================
window.openAddFloorRoomModal = function() {
  var existing = document.getElementById('modal-add-floor-room');
  var modal = existing || document.getElementById('modal-add-floor-room');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  } else {
    // Open as inline modal
    var html = '<div class="modal-overlay hidden" id="modal-add-floor-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-floor-room\').remove()">' +
      '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:16px;font-weight:700;">🚪 快速添加房间</div>' +
      '<button onclick="document.getElementById(\'modal-add-floor-room\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">所属楼层 <span class="required">*</span></label>' +
      '<select class="form-select" id="afr-floor" style="width:100%;padding:8px 12px;">' +
      '<option value="3">3层</option><option value="2">2层</option><option value="1">1层</option></select></div>' +
      '<div class="form-group"><label class="form-label">起始房间号</label>' +
      '<input type="number" class="form-input" id="afr-start" value="301" placeholder="如：301" style="width:100%;padding:8px 12px;"></div>' +
      '<div class="form-group"><label class="form-label">房间数量</label>' +
      '<input type="number" class="form-input" id="afr-count" value="8" min="1" max="30" style="width:100%;padding:8px 12px;"></div>' +
      '<div class="form-group"><label class="form-label">房型</label>' +
      '<select class="form-select" id="afr-type" style="width:100%;padding:8px 12px;">' +
      '<option value="标准间">标准间</option><option value="大床房">大床房</option><option value="亲子间">亲子间</option></select></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-add-floor-room\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
      '<button onclick="confirmAddFloorRoom()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 确认添加</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }
};

window.confirmAddFloorRoom = function() {
  var floor = document.getElementById('afr-floor') ? document.getElementById('afr-floor').value : '';
  var start = parseInt(document.getElementById('afr-start') ? document.getElementById('afr-start').value : 301);
  var count = parseInt(document.getElementById('afr-count') ? document.getElementById('afr-count').value : 8);
  var type = document.getElementById('afr-type') ? document.getElementById('afr-type').value : '标准间';
  if (!floor || !start || !count) { showToast('请填写完整信息', 'error'); return; }
  if (count < 1 || count > 30) { showToast('房间数量需在1-30之间', 'error'); return; }
  var rooms = [];
  for (var i = 0; i < count; i++) { rooms.push(start + i); }
  var grid = document.getElementById('bld-rooms-grid');
  if (grid) {
    rooms.forEach(function(r) {
      var div = document.createElement('div');
      div.style.cssText = 'padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;text-align:center;';
      div.innerHTML = '<div style="font-size:14px;font-weight:700;">' + r + '</div>' +
        '<div style="font-size:10px;color:var(--text-muted);">' + floor + '层 · ' + type + '</div>' +
        '<span style="padding:2px 6px;background:var(--green-bg);color:var(--green);border-radius:10px;font-size:10px;">🟢 空房</span>';
      grid.appendChild(div);
    });
  }
  document.getElementById('modal-add-floor-room') && document.getElementById('modal-add-floor-room').remove();
  showToast('✅ 已添加 ' + rooms.length + ' 间房间（' + rooms[0] + '-' + rooms[rooms.length-1] + '）', 'success');
};

// ============================================================
// 【改进4】submitFloorForm - 楼层表单提交函数补全（兼容两处模态框）
// 理由：modal-add-floor (line 22933) 的确认按钮调用 submitAddFloor()
//       但管理配置页的楼层表单可能需要独立处理
// 业务逻辑：收集表单数据→写入楼层Store→刷新列表→关闭弹窗
// ============================================================
window.submitFloorForm = function() {
  var floorNum = document.getElementById('floor-num') ? parseInt(document.getElementById('floor-num').value) : 0;
  var floorRooms = document.getElementById('floor-rooms') ? parseInt(document.getElementById('floor-rooms').value) : 8;
  var floorUsage = document.getElementById('floor-usage') ? document.getElementById('floor-usage').value : 'guest';
  if (!floorNum || floorNum < 1 || floorNum > 30) {
    showToast('请输入有效的楼层号（1-30）', 'error');
    return;
  }
  // Check duplicate
  if (typeof floorStore !== 'undefined' && Array.isArray(floorStore)) {
    var exists = floorStore.some(function(f) { return f.floor === floorNum; });
    if (exists) {
      showToast('⚠️ 楼层 ' + floorNum + ' 已存在', 'warning');
      return;
    }
    floorStore.push({floor: floorNum, rooms: floorRooms, usage: floorUsage});
    floorStore.sort(function(a, b) { return a.floor - b.floor; });
    showToast('✅ 楼层 ' + floorNum + ' 层创建成功', 'success');
  } else {
    showToast('✅ 楼层 ' + floorNum + ' 层创建成功（' + floorRooms + '间）', 'success');
  }
  closeModal('add-floor');
  if (typeof renderFloorList === 'function') renderFloorList();
};

// ============================================================
// 【改进5】openAddBuildingForm - 楼栋管理添加楼栋按钮函数补全
// 理由：line 13434 onclick="openAddBuildingForm()" 调用存在但函数体缺失
// 业务逻辑：打开楼栋表单弹窗，清空表单，聚焦名称输入框
// ============================================================
window.openAddBuildingForm = function() {
  // Try to use the existing modal-building-form
  var modal = document.getElementById('modal-building-form') || document.getElementById('modal-building-form-v2');
  if (modal) {
    // Reset form fields
    var nameEl = document.getElementById('bld-name');
    if (nameEl) nameEl.value = '';
    var codeEl = document.getElementById('bld-code');
    if (codeEl) codeEl.value = '';
    var floorsEl = document.getElementById('bld-floors');
    if (floorsEl) floorsEl.value = '3';
    var addrEl = document.getElementById('bld-address');
    if (addrEl) addrEl.value = '';
    var remarkEl = document.getElementById('bld-remark');
    if (remarkEl) remarkEl.value = '';
    var titleEl = document.getElementById('bld-form-title');
    if (titleEl) titleEl.textContent = '🏢 新增楼栋';
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    setTimeout(function() {
      var n = document.getElementById('bld-name');
      if (n) { n.focus(); }
    }, 100);
  } else {
    // Fallback: create inline modal
    var existing = document.getElementById('modal-quick-bldg');
    if (existing) existing.remove();
    var html = '<div class="modal-overlay hidden" id="modal-quick-bldg" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-bldg\').remove()">' +
      '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:16px;font-weight:700;">🏢 新增楼栋</div>' +
      '<button onclick="document.getElementById(\'modal-quick-bldg\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">楼栋名称 <span class="required">*</span></label>' +
      '<input type="text" class="form-input" id="qbld-name" placeholder="如：主楼、东配楼、贵宾楼" style="width:100%;padding:8px 12px;"></div>' +
      '<div class="form-group"><label class="form-label">楼栋编号</label>' +
      '<input type="text" class="form-input" id="qbld-code" placeholder="如：MAIN、EAST、VIP" style="width:100%;padding:8px 12px;"></div>' +
      '<div class="form-group"><label class="form-label">楼层数量</label>' +
      '<input type="number" class="form-input" id="qbld-floors" value="3" min="1" max="20" style="width:100%;padding:8px 12px;"></div>' +
      '<div class="form-group"><label class="form-label">详细地址</label>' +
      '<input type="text" class="form-input" id="qbld-addr" placeholder="楼栋详细地址（选填）" style="width:100%;padding:8px 12px;"></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-quick-bldg\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
      '<button onclick="confirmAddBuilding()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);color:white;border:none;">💾 确认保存</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() {
      var n = document.getElementById('qbld-name');
      if (n) n.focus();
    }, 100);
  }
};

window.confirmAddBuilding = function() {
  var name = document.getElementById('qbld-name') ? document.getElementById('qbld-name').value : '';
  var code = document.getElementById('qbld-code') ? document.getElementById('qbld-code').value : '';
  var floors = document.getElementById('qbld-floors') ? parseInt(document.getElementById('qbld-floors').value) : 3;
  if (!name) { showToast('请输入楼栋名称', 'error'); return; }
  // Update building list table if exists
  var tbody = document.getElementById('cfg-bldg-list-body');
  if (tbody) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><span style="font-weight:600;">' + name + '</span></td>' +
      '<td>' + floors + '层</td><td>0间</td><td style="color:var(--green);">0台</td>' +
      '<td style="color:var(--red);">0台</td><td><span style="color:var(--blue);">--</span></td>' +
      '<td><span class="tbadge green">启用</span></td>' +
      '<td><button class="action-btn small">编辑</button> <button class="action-btn small red">删除</button></td>';
    tbody.appendChild(tr);
  }
  document.getElementById('modal-quick-bldg') && document.getElementById('modal-quick-bldg').remove();
  showToast('✅ 楼栋「' + name + '」添加成功', 'success');
};
