// ============================================================
// 【物联后台 v4 第39轮】5个高频缺失onclick函数补全
// 基于HTML onclick引用分析 + 原系统业务逻辑
// ============================================================

// ============================================================
// 【改进1】openEditRoomTypeModalV2(idx) - 房型编辑弹窗（V2版本）
// 理由：房型管理表格每行有onclick="openEditRoomTypeModalV2(0)"，
//       传索引用于编辑已有房型。需加载当前房型数据到表单并支持保存
// 业务闭环：点击编辑 → 打开弹窗填充数据 → 修改表单 → 提交保存 → Toast反馈
// ============================================================
function openEditRoomTypeModalV2(idx) {
  var existing = document.getElementById('modal-edit-room-type-v2');
  if (existing) existing.remove();

  // 房型数据（与原系统一致）
  var roomTypes = [
    { id: 0, name: '1.8米大床房', bed: '1.8米大床+儿童床', price: 458, status: '启用' },
    { id: 1, name: '标准间', bed: '1.2米双床', price: 358, status: '启用' },
    { id: 2, name: '亲子间', bed: '1.5米大床+1.2米小床', price: 558, status: '启用' },
    { id: 3, name: '套房', bed: '2米大床+客厅', price: 758, status: '停用' }
  ];
  var rt = roomTypes[idx] || roomTypes[0];
  var isEdit = idx !== undefined;

  var html = '<div class="modal-overlay hidden" id="modal-edit-room-type-v2" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-room-type-v2\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🏠</div><div><div style="font-size:15px;font-weight:700;">' + (isEdit ? '编辑房型' : '新增房型') + '</div><div style="font-size:11px;color:var(--text-muted);">完善房型信息用于房间分配和定价</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-edit-room-type-v2\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">房型名称 <span style="color:red;">*</span></label>' +
    '<input type="text" class="form-input" id="rt2-name" value="' + (isEdit ? rt.name : '') + '" placeholder="如：1.8米大床房" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">床型描述 <span style="color:red;">*</span></label>' +
    '<input type="text" class="form-input" id="rt2-bed" value="' + (isEdit ? rt.bed : '') + '" placeholder="如：1.8米大床+儿童床" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">标准价格（元/晚）<span style="color:red;">*</span></label>' +
    '<input type="number" class="form-input" id="rt2-price" value="' + (isEdit ? rt.price : '') + '" placeholder="358" min="0" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">所属楼栋</label>' +
    '<select class="form-select" id="rt2-building" style="width:100%;">' +
    '<option value="0">全部楼栋</option>' +
    '<option value="1">1号楼</option>' +
    '<option value="2">2号楼</option>' +
    '<option value="3">3号楼</option></select></div>' +
    '<div class="form-group"><label class="form-label">楼层范围</label>' +
    '<div style="display:flex;gap:10px;align-items:center;">' +
    '<input type="number" class="form-input" id="rt2-floor-from" value="1" min="1" max="99" style="width:80px;" placeholder="起始层">' +
    '<span style="color:var(--text-muted);">至</span>' +
    '<input type="number" class="form-input" id="rt2-floor-to" value="6" min="1" max="99" style="width:80px;" placeholder="结束层"></div></div>' +
    '<div class="form-group"><label class="form-label">状态</label>' +
    '<div style="display:flex;gap:10px;">' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:white;" onclick="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-bg)\';this.parentElement.querySelectorAll(\'label\').forEach(function(l){if(l!==this.parentElement.querySelector(\'[for]\')||l.style.borderColor!==\'var(--blue)\'){}});"><input type="radio" name="rt2-status" value="启用" ' + (isEdit && rt.status === '启用' ? 'checked' : (!isEdit ? 'checked' : '')) + ' style="accent-color:var(--blue);"> 启用</label>' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:white;"><input type="radio" name="rt2-status" value="停用" ' + (isEdit && rt.status === '停用' ? 'checked' : '') + ' style="accent-color:var(--blue);"> 停用</label></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-input" id="rt2-note" rows="2" placeholder="可选：特殊说明、配套设施等" style="width:100%;resize:vertical;"></textarea></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-edit-room-type-v2\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="doSaveRoomTypeV2(' + (isEdit ? idx : -1) + ')" class="modal-btn" style="background:var(--blue);color:white;border:none;">💾 ' + (isEdit ? '保存修改' : '确认新增') + '</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doSaveRoomTypeV2(idx) {
  var name = document.getElementById('rt2-name').value.trim();
  var bed = document.getElementById('rt2-bed').value.trim();
  var price = document.getElementById('rt2-price').value;
  var statusRadio = document.querySelector('input[name="rt2-status"]:checked');
  var status = statusRadio ? statusRadio.value : '启用';

  if (!name) { showToast('请填写房型名称', 'warning'); return; }
  if (!bed) { showToast('请填写床型描述', 'warning'); return; }
  if (!price || parseInt(price) <= 0) { showToast('请填写正确的价格', 'warning'); return; }

  var modal = document.getElementById('modal-edit-room-type-v2');
  if (modal) modal.remove();

  if (idx >= 0) {
    showToast('✅ 房型「' + name + '」修改成功，已同步更新价格日历', 'success');
  } else {
    showToast('✅ 新增房型「' + name + '」成功，已添加到房型列表', 'success');
  }
}

// ============================================================
// 【改进2】deleteRoomTypeV2(idx) - 房型删除（带确认弹窗）
// 理由：房型管理每行有onclick="deleteRoomTypeV2(0)"，删除需二次确认
// 业务闭环：点击删除 → 确认弹窗 → 确认后删除 → 更新列表 → Toast反馈
// ============================================================
function deleteRoomTypeV2(idx) {
  var roomTypes = [
    { id: 0, name: '1.8米大床房', count: 12 },
    { id: 1, name: '标准间', count: 8 },
    { id: 2, name: '亲子间', count: 4 },
    { id: 3, name: '套房', count: 2 }
  ];
  var rt = roomTypes[idx] || { name: '该房型', count: 0 };

  var existing = document.getElementById('modal-confirm-delete-room-type');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay hidden" id="modal-confirm-delete-room-type" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-confirm-delete-room-type\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:24px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;">🗑️</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px;">确认删除房型？</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">即将删除：<strong style="color:var(--text);">' + rt.name + '</strong><br>该房型下有 <strong style="color:var(--orange);">' + rt.count + ' 间</strong>房间，删除后房间将变为「未分类」状态</div>' +
    '<div style="padding:10px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:12px;color:var(--red);margin-bottom:16px;">⚠️ 此操作不可逆，删除后房间仍保留但需重新分配房型</div>' +
    '</div>' +
    '<div style="padding:0 24px 24px;display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-confirm-delete-room-type\').remove()" class="modal-btn secondary" style="flex:1;">取消</button>' +
    '<button onclick="doConfirmDeleteRoomTypeV2(' + idx + ')" class="modal-btn" style="flex:1;background:var(--red);color:white;border:none;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doConfirmDeleteRoomTypeV2(idx) {
  var roomTypes = ['1.8米大床房', '标准间', '亲子间', '套房'];
  var name = roomTypes[idx] || '该房型';
  var modal = document.getElementById('modal-confirm-delete-room-type');
  if (modal) modal.remove();
  showToast('🗑️ 房型「' + name + '」已删除（房间保留待重新分配）', 'success');
}

// ============================================================
// 【改进3】showUnlockDetail(method, time, person, result) - 开锁记录详情
// 理由：设备详情页开锁记录表格每行有onclick="showUnlockDetail(...)"，
//       点击查看单条开锁的详细信息弹窗
// 业务闭环：点击详情 → 弹窗展示完整信息 → 可补充操作（联系维修/标记异常）
// ============================================================
function showUnlockDetail(method, time, person, result) {
  var existing = document.getElementById('modal-unlock-detail');
  if (existing) existing.remove();

  var methodMap = { phone: '📱 手机开锁', card: '💳 门卡开锁', pwd: '🔢 密码开锁', remote: '🔓 远程授权' };
  var methodName = methodMap[method] || method;
  var resultClass = result === '成功' ? 'var(--green)' : 'var(--red)';
  var resultBg = result === '成功' ? 'var(--green-bg)' : 'var(--red-bg)';

  var html = '<div class="modal-overlay hidden" id="modal-unlock-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-unlock-detail\').remove()">' +
    '<div class="modal" style="width:480px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🔓</div><div><div style="font-size:15px;font-weight:700;">开锁记录详情</div><div style="font-size:11px;color:var(--text-muted);">设备开锁行为追溯</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-unlock-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="text-align:center;padding:20px;background:' + resultBg + ';border-radius:12px;margin-bottom:16px;">' +
    '<div style="font-size:40px;margin-bottom:8px;">' + (result === '成功' ? '✅' : '❌') + '</div>' +
    '<div style="font-size:16px;font-weight:700;color:' + resultClass + ';">' + result + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">响应时间 23ms</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">开锁方式</div><div style="font-size:13px;font-weight:600;">' + methodName + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">开锁时间</div><div style="font-size:13px;font-weight:600;">' + time + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作人</div><div style="font-size:13px;font-weight:600;">' + person + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">设备电量</div><div style="font-size:13px;font-weight:600;">88%</div></div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">关联设备</div><div style="font-size:13px;font-weight:600;">LH-807智能锁 | UUID: a8f5f1e2-3c4b-...</div></div>';
  if (result !== '成功') {
    html += '<div style="padding:12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:12px;">⚠️ 开锁失败可能原因：设备离线 / 电量不足 / 权限异常</div>';
  }
  html += '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-unlock-detail\').remove()" class="modal-btn secondary">关闭</button>' +
    '<button onclick="showToast(\'📞 维修工单已创建：门锁异常排查\',\'success\');document.getElementById(\'modal-unlock-detail\').remove();" class="modal-btn" style="background:var(--orange);color:white;border:none;">📞 报修</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【改进4】fpNavigateRoom(roomNum) - 楼层平面图房间快速跳转
// 理由：房态地图（floor plan）的房间格子有onclick="fpNavigateRoom('301')"，
//       点击房间跳转到房间详情/快速操作面板
// 业务闭环：点击房间格子 → 打开房间快速操作面板 → 可做入住/开锁等快捷操作
// ============================================================
function fpNavigateRoom(roomNum) {
  // 房间数据
  var roomData = {
    '301': { type: '亲子间', status: '入住', guest: '王先生', checkin: '2026-03-28', checkout: '2026-03-31', days: 3 },
    '302': { type: '大床房', status: '空闲', guest: null, checkin: null, checkout: null, days: 0 },
    '303': { type: '标准间', status: '退房', guest: '李女士', checkin: '2026-03-25', checkout: '2026-03-29', days: 4 },
    '304': { type: '套房', status: '入住', guest: '赵总', checkin: '2026-03-27', checkout: '2026-04-02', days: 6 }
  };
  var rd = roomData[roomNum] || { type: '未知', status: '空闲', guest: null };

  var existing = document.getElementById('modal-fp-room-quick');
  if (existing) existing.remove();

  var statusColor = rd.status === '入住' ? 'var(--green)' : rd.status === '退房' ? 'var(--orange)' : 'var(--blue)';
  var statusBg = rd.status === '入住' ? 'var(--green-bg)' : rd.status === '退房' ? 'var(--orange-bg)' : 'var(--blue-bg)';

  var html = '<div class="modal-overlay hidden" id="modal-fp-room-quick" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-fp-room-quick\').remove()">' +
    '<div class="modal" style="width:460px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🚪</div><div><div style="font-size:15px;font-weight:700;">房间 ' + roomNum + '</div><div style="font-size:11px;color:var(--text-muted);">' + rd.type + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-fp-room-quick\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">' +
    '<span style="padding:4px 12px;background:' + statusBg + ';color:' + statusColor + ';border-radius:20px;font-size:12px;font-weight:600;">' + rd.status + '</span>';
  if (rd.guest) {
    html += '<span style="font-size:13px;color:var(--text);">👤 ' + rd.guest + '</span>';
  }
  html += '</div>';

  if (rd.status === '入住' && rd.guest) {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">' +
      '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">入住</span><br><b>' + rd.checkin + '</b></div>' +
      '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);">离店</span><br><b>' + rd.checkout + '</b></div></div>';
  }

  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
    '<button onclick="showToast(\'正在打开门锁...🔓\',\'info\');setTimeout(function(){showToast(\'✅ 门锁已开启\',\'success\');},1500);" style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;cursor:pointer;text-align:center;font-size:12px;color:var(--blue);">🔓 开锁</button>' +
    '<button onclick="showToast(\'正在发出清洁指令...🧹\',\'info\');" style="padding:12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;cursor:pointer;text-align:center;font-size:12px;color:var(--green);">🧹 清洁</button>' +
    '<button onclick="document.getElementById(\'modal-fp-room-quick\').remove();if(typeof navigateToRoom===\'function\')navigateToRoom(\'' + roomNum + '\');" style="padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;text-align:center;font-size:12px;color:var(--text);">📋 详情</button></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-fp-room-quick\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【改进5】openStaffDetailModal(idx) - 员工详情弹窗
// 理由：员工管理表格每行有onclick="openStaffDetailModal(0)"，
//       点击查看员工完整信息（账号/角色/权限/最近操作）
// 业务闭环：点击详情 → 弹窗展示员工档案 → 可编辑/重置密码/禁用账号
// ============================================================
function openStaffDetailModal(idx) {
  var existing = document.getElementById('modal-staff-detail');
  if (existing) existing.remove();

  var staffData = [
    { id: 0, name: '赵飞', dept: '前台', role: '管理员', phone: '138****1234', email: 'zhaofei@lock.club', status: '正常', lastLogin: '今天 09:30', joinDate: '2023-05-01' },
    { id: 1, name: '钱洁', dept: '客房', role: '服务员', phone: '139****5678', email: 'qianjie@lock.club', status: '正常', lastLogin: '今天 08:15', joinDate: '2023-08-15' },
    { id: 2, name: '孙丽', dept: '前台', role: '接待员', phone: '137****9012', email: 'sunli@lock.club', status: '正常', lastLogin: '昨天 18:42', joinDate: '2024-01-10' },
    { id: 3, name: '周明', dept: '工程', role: '维修员', phone: '136****3456', email: 'zhouming@lock.club', status: '正常', lastLogin: '昨天 17:20', joinDate: '2024-03-20' }
  ];
  var s = staffData[idx] || staffData[0];

  var html = '<div class="modal-overlay hidden" id="modal-staff-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-staff-detail\').remove()">' +
    '<div class="modal" style="width:540px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<div style="width:48px;height:48px;border-radius:50%;background:var(--blue-bg);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:var(--blue);">' + s.name.slice(0, 1) + '</div>' +
    '<div><div style="font-size:16px;font-weight:700;">' + s.name + '</div><div style="font-size:12px;color:var(--text-muted);">' + s.dept + ' · ' + s.role + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-staff-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">手机号</div><div style="font-size:13px;font-weight:600;">' + s.phone + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">邮箱</div><div style="font-size:13px;font-weight:600;">' + s.email + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">入职日期</div><div style="font-size:13px;font-weight:600;">' + s.joinDate + '</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">最后登录</div><div style="font-size:13px;font-weight:600;">' + s.lastLogin + '</div></div></div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">账号状态</div>' +
    '<div style="display:flex;align-items:center;gap:10px;"><span style="padding:4px 12px;background:var(--green-bg);color:var(--green);border-radius:20px;font-size:12px;font-weight:600;">🟢 正常</span>' +
    '<span style="font-size:12px;color:var(--text-muted);">账号创建于 ' + s.joinDate + '，共登录 328 次</span></div></div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">当前角色权限</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
    '<span style="padding:3px 10px;background:var(--blue-bg);color:var(--blue);border-radius:12px;font-size:11px;">办理入住</span>' +
    '<span style="padding:3px 10px;background:var(--blue-bg);color:var(--blue);border-radius:12px;font-size:11px;">办理退房</span>' +
    '<span style="padding:3px 10px;background:var(--blue-bg);color:var(--blue);border-radius:12px;font-size:11px;">钥匙管理</span>' +
    '<span style="padding:3px 10px;background:var(--green-bg);color:var(--green);border-radius:12px;font-size:11px;">房态查看</span>' +
    '<span style="padding:3px 10px;background:var(--green-bg);color:var(--green);border-radius:12px;font-size:11px;">工单处理</span>' +
    '<span style="padding:3px 10px;background:var(--orange-bg);color:var(--orange);border-radius:12px;font-size:11px;">数据统计</span></div></div>' +
    '<div style="margin-bottom:14px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">最近操作记录</div>' +
    '<div style="font-size:12px;color:var(--text-muted);padding:10px;background:var(--bg);border-radius:6px;">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span>今天 09:28</span><span style="color:var(--text);">为301房间远程开锁</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span>今天 09:15</span><span style="color:var(--text);">办理入住：302房间</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>昨天 18:30</span><span style="color:var(--text);">查看能耗报表</span></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="showToast(\'📞 密码重置链接已发送到 ' + s.email + '\',\'success\');" style="padding:8px 16px;background:var(--orange-bg);color:var(--orange);border:1px solid var(--orange);border-radius:6px;cursor:pointer;font-size:13px;">🔑 重置密码</button>' +
    '<button onclick="document.getElementById(\'modal-staff-detail\').remove();if(typeof openEditStaffForm===\'function\')openEditStaffForm(' + idx + ');" style="padding:8px 16px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:13px;">✏️ 编辑</button>' +
    '<button onclick="document.getElementById(\'modal-staff-detail\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 初始化：绑定事件
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // 给楼层平面图房间格子绑定悬浮样式
    var fpRooms = document.querySelectorAll('.fp-room');
    fpRooms.forEach(function(room) {
      room.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        this.style.transform = 'translateY(-2px)';
      });
      room.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
        this.style.transform = '';
      });
    });
  }, 800);
});
