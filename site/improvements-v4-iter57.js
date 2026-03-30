// ============================================================
// 【物联后台v4-第57轮】修复排班/楼栋管理断裂函数
// ============================================================
// 修复清单（对照complete-app2.html onclick调用）：
// 改进1: openSwapShiftModal        - 排班视图"换班申请"按钮 (line ~10570)
// 改进2: openBuildingManagementModal - 楼栋管理"新增楼栋"按钮 (line ~13494)
// 改进3: openAddFloorForm          - 楼栋管理"新增楼层"按钮 (line ~13495)
// 改进4: openAddRoomForm           - 楼栋管理"新增房间"按钮 (line ~13496, 13559)
// 改进5: openAddBuildingForm       - 楼栋Tab"添加楼栋"按钮 (line ~13565)
// 改进6: openEditBldgConfig        - 楼栋Tab"编辑"按钮 (line ~13567)
// 改进7: confirmDeleteBldgFromConfig - 楼栋Tab"删除"按钮 (line ~13568)
// ============================================================

// -------- 改进1: openSwapShiftModal - 换班申请弹窗 --------
window.openSwapShiftModal = function() {
  var existing = document.getElementById('modal-swap-shift');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-swap-shift" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-swap-shift\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🔄</div><div style="font-size:15px;font-weight:700;">换班申请</div>' +
    '<button onclick="document.getElementById(\'modal-swap-shift\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="font-size:12px;color:var(--text-muted);margin:0 0 16px;">填写换班信息，双方确认后生效</p>' +
    '<div class="form-group"><label class="form-label">申请人</label>' +
    '<select class="form-select" id="swap-applicant" style="padding:8px 12px;font-size:13px;">' +
    '<option value="赵飞">赵飞（前厅经理）</option>' +
    '<option value="周敏">周敏（前厅接待）</option>' +
    '<option value="吴倩">吴倩（客房主管）</option>' +
    '<option value="郑强">郑强（清洁人员）</option>' +
    '<option value="王工">王工（弱电工程师）</option></select></div>' +
    '<div class="form-group"><label class="form-label">原班次</label>' +
    '<select class="form-select" id="swap-original-shift" style="padding:8px 12px;font-size:13px;">' +
    '<option value="早班">早班 08:00-17:00</option>' +
    '<option value="中班">中班 10:00-22:00</option>' +
    '<option value="晚班">晚班 14:00-23:00</option></select></div>' +
    '<div class="form-group"><label class="form-label">目标换班人</label>' +
    '<select class="form-select" id="swap-target" style="padding:8px 12px;font-size:13px;">' +
    '<option value="周敏">周敏（前厅接待）</option>' +
    '<option value="赵飞">赵飞（前厅经理）</option>' +
    '<option value="吴倩">吴倩（客房主管）</option>' +
    '<option value="郑强">郑强（清洁人员）</option>' +
    '<option value="王工">王工（弱电工程师）</option></select></div>' +
    '<div class="form-group"><label class="form-label">目标班次</label>' +
    '<select class="form-select" id="swap-target-shift" style="padding:8px 12px;font-size:13px;">' +
    '<option value="早班">早班 08:00-17:00</option>' +
    '<option value="中班">中班 10:00-22:00</option>' +
    '<option value="晚班">晚班 14:00-23:00</option></select></div>' +
    '<div class="form-group"><label class="form-label">换班日期</label>' +
    '<input type="date" class="form-input" id="swap-date" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">换班原因</label>' +
    '<textarea class="form-textarea" id="swap-reason" placeholder="请输入换班原因" style="min-height:60px;font-size:13px;padding:8px 12px;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-swap-shift\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitSwapShift()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">提交申请</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 设置默认日期为今天
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var dateInput = document.getElementById('swap-date');
  if (dateInput) dateInput.value = yyyy + '-' + mm + '-' + dd;
};

window.submitSwapShift = function() {
  var applicant = document.getElementById('swap-applicant');
  var target = document.getElementById('swap-target');
  var date = document.getElementById('swap-date');
  var reason = document.getElementById('swap-reason');
  if (!applicant || !target || !date || !reason) return;
  if (!reason.value.trim()) { showToast('请填写换班原因', 'warning'); return; }
  if (!date.value) { showToast('请选择换班日期', 'warning'); return; }
  showToast('✅ 换班申请已提交，等待对方确认', 'success');
  var m = document.getElementById('modal-swap-shift');
  if (m) m.remove();
};

// -------- 改进2: openBuildingManagementModal - 楼栋总览弹窗 --------
window.openBuildingManagementModal = function() {
  var existing = document.getElementById('modal-building-manage');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-building-manage" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-building-manage\').remove()">' +
    '<div class="modal" style="width:640px;background:white;border-radius:12px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🏢</div><div style="font-size:15px;font-weight:700;">楼栋管理</div>' +
    '<button onclick="document.getElementById(\'modal-building-manage\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">' +
    '<button onclick="openAddBuildingForm()" style="padding:6px 14px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">+ 新增楼栋</button>' +
    '<button onclick="openAddFloorForm()" style="padding:6px 14px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">+ 新增楼层</button>' +
    '<button onclick="openAddRoomForm()" style="padding:6px 14px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">+ 新增房间</button></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="text-align:center;padding:14px;background:var(--blue-bg);border-radius:8px;">' +
    '<div style="font-size:26px;font-weight:700;color:var(--blue);">2</div><div style="font-size:11px;color:var(--text-muted);">楼栋</div></div>' +
    '<div style="text-align:center;padding:14px;background:var(--green-bg);border-radius:8px;">' +
    '<div style="font-size:26px;font-weight:700;color:var(--green);">4</div><div style="font-size:11px;color:var(--text-muted);">楼层</div></div>' +
    '<div style="text-align:center;padding:14px;background:var(--purple-bg);border-radius:8px;">' +
    '<div style="font-size:26px;font-weight:700;color:var(--purple);">13</div><div style="font-size:11px;color:var(--text-muted);">房间</div></div></div>' +
    '<table class="table" style="font-size:12px;">' +
    '<thead><tr><th>楼栋</th><th>楼层</th><th>房间数</th><th>在线设备</th><th>入住率</th><th>状态</th><th>操作</th></tr></thead>' +
    '<tbody>' +
    '<tr><td style="font-weight:600;">主楼</td><td>3层</td><td>9间</td><td style="color:var(--green);">8台</td><td><span style="color:var(--blue);">67%</span></td><td><span class="tbadge green">启用</span></td>' +
    '<td><button class="action-btn small" onclick="openEditBldgConfig(\'main\')">编辑</button> <button class="action-btn small red" onclick="confirmDeleteBldgFromConfig(\'main\',\'主楼\',9)">删除</button></td></tr>' +
    '<tr><td style="font-weight:600;">东配楼</td><td>2层</td><td>4间</td><td style="color:var(--green);">3台</td><td><span style="color:var(--green);">75%</span></td><td><span class="tbadge green">启用</span></td>' +
    '<td><button class="action-btn small" onclick="openEditBldgConfig(\'east\')">编辑</button> <button class="action-btn small red" onclick="confirmDeleteBldgFromConfig(\'east\',\'东配楼\',4)">删除</button></td></tr>' +
    '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-building-manage\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进3: openAddFloorForm - 新增楼层表单 --------
window.openAddFloorForm = function() {
  var existing = document.getElementById('modal-add-floor-form');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-floor-form" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-floor-form\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🏗️</div><div style="font-size:15px;font-weight:700;">新增楼层</div>' +
    '<button onclick="document.getElementById(\'modal-add-floor-form\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">所属楼栋 <span class="required">*</span></label>' +
    '<select class="form-select" id="floor-building" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="main">主楼</option><option value="east">东配楼</option></select></div>' +
    '<div class="form-group"><label class="form-label">楼层名称/编号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="floor-name" placeholder="如：3层 / F3 / 三楼" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">楼层高度（层数）</label>' +
    '<input type="number" class="form-input" id="floor-level" value="3" min="1" max="99" style="padding:8px 12px;font-size:13px;width:100px;"></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="floor-remark" placeholder="可选备注" style="min-height:50px;font-size:13px;padding:8px 12px;width:100%;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-floor-form\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitAddFloor()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddFloor = function() {
  var name = document.getElementById('floor-name');
  if (!name || !name.value.trim()) { showToast('请填写楼层名称', 'warning'); return; }
  showToast('✅ 楼层 "' + name.value.trim() + '" 新增成功', 'success');
  var m = document.getElementById('modal-add-floor-form');
  if (m) m.remove();
};

// -------- 改进4: openAddRoomForm - 新增房间表单 --------
window.openAddRoomForm = function() {
  var existing = document.getElementById('modal-add-room-form');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-room-form" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-room-form\').remove()">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:85vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🚪</div><div style="font-size:15px;font-weight:700;">新增房间</div>' +
    '<button onclick="document.getElementById(\'modal-add-room-form\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房间号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="room-num" placeholder="如：301" style="padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">所属楼栋</label>' +
    '<select class="form-select" id="room-building" style="padding:8px 12px;font-size:13px;">' +
    '<option value="main">主楼</option><option value="east">东配楼</option></select></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">房型</label>' +
    '<select class="form-select" id="room-type" style="padding:8px 12px;font-size:13px;">' +
    '<option value="大床房">大床房</option><option value="双床房">双床房</option><option value="亲子间">亲子间</option><option value="套房">套房</option></select></div>' +
    '<div class="form-group"><label class="form-label">楼层</label>' +
    '<select class="form-select" id="room-floor" style="padding:8px 12px;font-size:13px;">' +
    '<option value="3">3层（主楼）</option><option value="2">2层（主楼）</option><option value="1">1层（主楼）</option><option value="B1">B1层（东配楼）</option><option value="B2">B2层（东配楼）</option></select></div></div>' +
    '<div class="form-group"><label class="form-label">房间状态</label>' +
    '<select class="form-select" id="room-status" style="padding:8px 12px;font-size:13px;">' +
    '<option value="vacant">🟢 空房</option><option value="occupied">🔵 入住</option><option value="maintenance">🔶 维修</option></select></div>' +
    '<div class="form-group"><label class="form-label">设备编号（可选）</label>' +
    '<input type="text" class="form-input" id="room-device" placeholder="如：DLD-301" style="padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="room-remark" placeholder="可选备注" style="min-height:50px;font-size:13px;padding:8px 12px;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-room-form\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitAddRoom()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddRoom = function() {
  var roomNum = document.getElementById('room-num');
  if (!roomNum || !roomNum.value.trim()) { showToast('请填写房间号', 'warning'); return; }
  showToast('✅ 房间 "' + roomNum.value.trim() + '" 新增成功', 'success');
  var m = document.getElementById('modal-add-room-form');
  if (m) m.remove();
};

// -------- 改进5: openAddBuildingForm - 添加楼栋表单 --------
window.openAddBuildingForm = function() {
  var existing = document.getElementById('modal-add-building-form');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-add-building-form" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-building-form\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">🏢</div><div style="font-size:15px;font-weight:700;">添加楼栋</div>' +
    '<button onclick="document.getElementById(\'modal-add-building-form\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">楼栋名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="bldg-name" placeholder="如：南楼 / 附楼" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">楼层数</label>' +
    '<input type="number" class="form-input" id="bldg-floors" value="1" min="1" max="50" style="padding:8px 12px;font-size:13px;width:100px;"></div>' +
    '<div class="form-group"><label class="form-label">楼栋类型</label>' +
    '<select class="form-select" id="bldg-type" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="main">主楼</option><option value="annex">配楼/附楼</option><option value="service">服务楼</option></select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="bldg-remark" placeholder="可选备注" style="min-height:50px;font-size:13px;padding:8px 12px;width:100%;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-building-form\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitAddBuilding()" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddBuilding = function() {
  var name = document.getElementById('bldg-name');
  if (!name || !name.value.trim()) { showToast('请填写楼栋名称', 'warning'); return; }
  showToast('✅ 楼栋 "' + name.value.trim() + '" 添加成功', 'success');
  var m = document.getElementById('modal-add-building-form');
  if (m) m.remove();
};

// -------- 改进6: openEditBldgConfig - 编辑楼栋 --------
window.openEditBldgConfig = function(bldgId) {
  var names = {'main': '主楼', 'east': '东配楼'};
  var name = names[bldgId] || bldgId;
  var existing = document.getElementById('modal-edit-bldg-config');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-edit-bldg-config" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-bldg-config\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:24px;">✏️</div><div style="font-size:15px;font-weight:700;">编辑楼栋</div>' +
    '<button onclick="document.getElementById(\'modal-edit-bldg-config\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">楼栋名称</label>' +
    '<input type="text" class="form-input" id="edit-bldg-name" value="' + name + '" style="padding:8px 12px;font-size:13px;width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">楼层数</label>' +
    '<input type="number" class="form-input" id="edit-bldg-floors" value="3" min="1" max="50" style="padding:8px 12px;font-size:13px;width:100px;"></div>' +
    '<div class="form-group"><label class="form-label">状态</label>' +
    '<select class="form-select" id="edit-bldg-status" style="padding:8px 12px;font-size:13px;width:100%;">' +
    '<option value="enabled" selected>启用</option><option value="disabled">禁用</option></select></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-edit-bldg-config\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitEditBldgConfig(\'' + bldgId + '\')" style="padding:8px 20px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitEditBldgConfig = function(bldgId) {
  var name = document.getElementById('edit-bldg-name');
  if (!name || !name.value.trim()) { showToast('请填写楼栋名称', 'warning'); return; }
  showToast('✅ 楼栋信息已更新', 'success');
  var m = document.getElementById('modal-edit-bldg-config');
  if (m) m.remove();
};

// -------- 改进7: confirmDeleteBldgFromConfig - 删除楼栋确认 --------
window.confirmDeleteBldgFromConfig = function(bldgId, bldgName, roomCount) {
  var existing = document.getElementById('modal-delete-bldg-confirm');
  if (existing) existing.remove();
  var roomCountStr = roomCount || 0;
  var html = '<div class="modal-overlay hidden" id="modal-delete-bldg-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-delete-bldg-confirm\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">删除楼栋确认</div>' +
    '<button onclick="document.getElementById(\'modal-delete-bldg-confirm\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<p style="margin:0 0 12px;font-size:13px;line-height:1.6;">确定要删除楼栋 <strong>"' + bldgName + '"</strong> 吗？</p>' +
    (roomCountStr > 0 ? '<p style="margin:0 0 12px;font-size:12px;color:var(--red);">⚠️ 该楼栋下有 <strong>' + roomCountStr + ' 间</strong>房间，删除后不可恢复！</p>' : '') +
    '<div class="form-group"><label class="form-label">输入 "DELETE" 确认</label>' +
    '<input type="text" class="form-input" id="delete-bldg-confirm-input" placeholder="DELETE" style="padding:8px 12px;font-size:13px;width:100%;border-color:var(--red);"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-delete-bldg-confirm\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="executeDeleteBldg(\'' + bldgId + '\', \'' + bldgName + '\')" style="padding:8px 20px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;color:white;font-weight:600;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.executeDeleteBldg = function(bldgId, bldgName) {
  var input = document.getElementById('delete-bldg-confirm-input');
  if (!input || input.value.trim() !== 'DELETE') { showToast('请输入 DELETE 确认删除', 'warning'); return; }
  showToast('✅ 楼栋 "' + bldgName + '" 已删除', 'success');
  var m = document.getElementById('modal-delete-bldg-confirm');
  if (m) m.remove();
};
