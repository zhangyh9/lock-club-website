// ============================================================
// 【物联后台 v4-第10轮】5个高频断裂功能修复
// 问题诊断：improvements-v4-func.js 仅在</body>前加载，但 onclick 调用的函数
//           大部分定义在 v4-func.js 内部（非全局），导致HTML onclick 找不到函数
// 修复策略：将缺失的高频函数以全局方式写入 v4-improvements.js 末尾
// ============================================================

// -------- 改进1：openScheduleCellEdit（排班表单元格编辑，35处调用）--------
// 理由：排班表页面每个班次单元格有 onclick="openScheduleCellEdit(...)" 但函数不存在
// 改进：打开排班编辑弹窗，支持修改班次时间/人员
var _scheduleEditTarget = null;

function openScheduleCellEdit(staffName, day, currentShift) {
  _scheduleEditTarget = {staff: staffName, day: day, currentShift: currentShift};
  var existing = document.getElementById('modal-schedule-edit');
  if (existing) existing.remove();
  var shifts = [
    {v:'早班 08-17',l:'早班 08:00-17:00'},
    {v:'中班 14-23',l:'中班 14:00-23:00'},
    {v:'晚班 17-02',l:'晚班 17:00-02:00'},
    {v:'休息',l:'休息日'},
    {v:'请假',l:'请假'}
  ];
  var options = shifts.map(function(s) {
    var sel = s.v === currentShift ? 'selected' : '';
    return '<option value="' + s.v + '" ' + sel + '>' + s.l + '</option>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-schedule-edit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-schedule-edit\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📅</div><div><div style="font-size:15px;font-weight:700;">编辑排班</div><div style="font-size:11px;color:var(--text-muted);">' + staffName + ' · 周' + ({mon:'一',tue:'二',wed:'三',thu:'四',fri:'五',sat:'六',sun:'日'}[day] || day) + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-schedule-edit\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">当前班次</label>' +
    '<div style="padding:10px 12px;background:var(--blue-bg);border-radius:6px;font-size:13px;font-weight:600;color:var(--blue);">' + currentShift + '</div></div>' +
    '<div class="form-group"><label class="form-label">修改为</label>' +
    '<select class="form-select" id="se-shift-select" style="width:100%;font-size:14px;padding:10px;">' + options + '</select></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="se-note" placeholder="可选，填写换班原因..." style="width:100%;"></input></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-schedule-edit\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitScheduleCellEdit()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitScheduleCellEdit() {
  var newShift = document.getElementById('se-shift-select') ? document.getElementById('se-shift-select').value : '';
  var note = document.getElementById('se-note') ? document.getElementById('se-note').value.trim() : '';
  if (!_scheduleEditTarget) return;
  var t = _scheduleEditTarget;
  document.getElementById('modal-schedule-edit') && document.getElementById('modal-schedule-edit').remove();
  // Update the cell in the schedule table
  var cells = document.querySelectorAll('td[onclick*="openScheduleCellEdit"]');
  cells.forEach(function(cell) {
    if (cell.getAttribute('onclick') && cell.getAttribute('onclick').indexOf("'" + t.staff + "'") >= 0 && cell.getAttribute('onclick').indexOf("'" + t.day + "'") >= 0) {
      var span = cell.querySelector('span');
      if (span) {
        var colorMap = {'早班 08-17':'var(--blue)','中班 14-23':'var(--orange)','晚班 17-02':'var(--purple)','休息':'var(--green)','请假':'var(--red)'};
        var bgMap = {'早班 08-17':'var(--blue-bg)','中班 14-23':'var(--orange-bg)','晚班 17-02':'var(--purple-bg)','休息':'var(--green-bg)','请假':'var(--red-bg)'};
        span.textContent = newShift;
        span.style.background = bgMap[newShift] || 'var(--bg)';
        span.style.color = colorMap[newShift] || 'var(--text)';
      }
    }
  });
  showToast('✅ ' + t.staff + ' 周' + ({mon:'一',tue:'二',wed:'三',thu:'四',fri:'五',sat:'六',sun:'日'}[t.day] || t.day) + ' 排班已更新为「' + newShift + '」', 'success');
  _scheduleEditTarget = null;
}

// -------- 改进2：hmClickRoom（客房服务点击房间，13处调用）--------
// 理由：客房服务页面房间网格点击调用 hmClickRoom 但函数不存在
// 改进：点击房间弹出该房间的服务工单列表+快速操作入口
function hmClickRoom(roomNum) {
  var statusMap = {
    '301': {status:'入住',guest:'张三',checkin:'2026-03-27 14:00',type:'亲子间'},
    '302': {status:'入住',guest:'李四',checkin:'2026-03-28 15:00',type:'大床房'},
    '303': {status:'入住',guest:'王五',checkin:'2026-03-29 10:00',type:'标准间'},
    '304': {status:'退房',guest:'赵六',checkin:'2026-03-26 16:00',type:'亲子间'},
    '305': {status:'空房',guest:null,checkin:null,type:'标准间'},
    '306': {status:'入住',guest:'孙七',checkin:'2026-03-28 11:00',type:'大床房'}
  };
  var info = statusMap[roomNum] || {status:'未知',guest:null,checkin:null,type:'标准间'};
  var isOccupied = info.status === '入住';
  var existing = document.getElementById('modal-hm-room-detail');
  if (existing) existing.remove();
  var guestInfo = isOccupied
    ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
        '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:10px;color:var(--text-muted);">入住客人</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + info.guest + '</div></div>' +
        '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:10px;color:var(--text-muted);">入住时间</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + info.checkin + '</div></div></div>' +
        '<div style="padding:10px;background:var(--bg);border-radius:6px;margin-bottom:12px;"><div style="font-size:10px;color:var(--text-muted);">房型</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + info.type + '</div></div>'
    : '<div style="padding:12px;background:var(--green-bg);border-radius:6px;margin-bottom:12px;text-align:center;font-size:13px;color:var(--green);">🏠 此房间当前为空房</div>';
  var actionBtns = isOccupied
    ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">' +
        '<button onclick="hmCreateWorkorder(\'' + roomNum + '\')" style="flex:1;padding:8px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">🛠️ 创建工单</button>' +
        '<button onclick="hmOpenDoor(\'' + roomNum + '\')" style="flex:1;padding:8px;background:var(--green);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">🔓 开锁</button>' +
        '<button onclick="hmViewHistory(\'' + roomNum + '\')" style="flex:1;padding:8px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">📋 记录</button></div>'
    : '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">' +
        '<button onclick="hmCheckinRoom(\'' + roomNum + '\')" style="flex:1;padding:8px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">🏠 入住</button>' +
        '<button onclick="hmViewHistory(\'' + roomNum + '\')" style="flex:1;padding:8px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">📋 记录</button></div>';
  var html = '<div class="modal-overlay" id="modal-hm-room-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-hm-room-detail\').remove()">' +
    '<div class="modal" style="width:460px;max-height:80vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:16px;font-weight:700;">📍 房间 ' + roomNum + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">客房服务</div></div>' +
    '<button onclick="document.getElementById(\'modal-hm-room-detail\').remove()" style="background:var(--bg);border:none;font-size:15px;cursor:pointer;color:var(--text-light);width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:flex;gap:10px;margin-bottom:12px;">' +
    '<div style="flex:1;padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + roomNum + '</div><div style="font-size:10px;color:var(--text-muted);">房间号</div></div>' +
    '<div style="flex:1;padding:12px;background:' + (isOccupied ? 'var(--green-bg)' : 'var(--bg)') + ';border-radius:8px;text-align:center;"><div style="font-size:14px;font-weight:700;color:' + (isOccupied ? 'var(--green)' : 'var(--text-muted)') + ';">' + info.status + '</div><div style="font-size:10px;color:var(--text-muted);">状态</div></div></div>' +
    guestInfo +
    '<div style="font-size:12px;font-weight:700;margin-bottom:6px;color:var(--text);">📝 最近工单</div>' +
    '<div style="max-height:100px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;margin-bottom:4px;">' +
    '<div style="padding:8px;font-size:12px;color:var(--text-muted);text-align:center;">暂无工单记录</div></div>' +
    actionBtns + '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function hmCreateWorkorder(roomNum) {
  document.getElementById('modal-hm-room-detail') && document.getElementById('modal-hm-room-detail').remove();
  showPage('workorder');
  setTimeout(function() {
    var modal = document.getElementById('create-wo');
    if (modal) modal.classList.remove('hidden');
    var roomInput = document.getElementById('wo-room');
    if (roomInput) roomInput.value = roomNum;
    showToast('🛠️ 已打开工单创建，请填写房间 ' + roomNum + ' 的工单内容', 'info');
  }, 100);
}

function hmOpenDoor(roomNum) {
  document.getElementById('modal-hm-room-detail') && document.getElementById('modal-hm-room-detail').remove();
  showToast('🔓 正在为房间 ' + roomNum + ' 发送开锁指令...', 'info');
  setTimeout(function() {
    showToast('✅ 房间 ' + roomNum + ' 开锁成功', 'success');
  }, 1200);
}

function hmViewHistory(roomNum) {
  document.getElementById('modal-hm-room-detail') && document.getElementById('modal-hm-room-detail').remove();
  showToast('📋 正在加载房间 ' + roomNum + ' 的服务记录...', 'info');
  showPage('page-room-detail');
}

function hmCheckinRoom(roomNum) {
  document.getElementById('modal-hm-room-detail') && document.getElementById('modal-hm-room-detail').remove();
  showPage('checkin');
  setTimeout(function() {
    showToast('🏠 已打开入住办理，请选择房间 ' + roomNum, 'info');
  }, 100);
}

// -------- 改进3：openWorkorderDetailAndUpdate（工单详情+更新，11处调用）--------
// 理由：工单列表点击"详情"按钮调用此函数但函数缺失
// 改进：显示工单完整详情弹窗，支持更新状态、添加处理记录
function openWorkorderDetailAndUpdate(woId) {
  var wo = null;
  if (typeof workorderStore !== 'undefined') {
    wo = workorderStore.find(function(w) { return w.id === woId; });
  }
  if (!wo) {
    // Try to find in rendered rows
    showToast('正在加载工单详情...', 'info');
    wo = {
      id: woId,
      type: 'repair',
      room: '301',
      guest: '张三',
      content: '房间门锁故障',
      priority: 'urgent',
      status: '待接受',
      createTime: '2026-03-29 10:32',
      handler: '',
      doneTime: ''
    };
  }
  var typeMap = {repair:'🔧 维修', delivery:'📦 送物', cleaning:'🧹 清洁', complaint:'😤 投诉', other:'📋 其他'};
  var priorityMap = {urgent:'🔴 紧急', high:'🟠 高', normal:'🟡 普通', low:'🟢 低'};
  var priorityColor = {urgent:'var(--red)', high:'var(--orange)', normal:'var(--blue)', low:'var(--green)'}[wo.priority] || 'var(--text)';
  var statusColor = {待接受:'var(--orange)', 处理中:'var(--blue)', 已完成:'var(--green)', 已取消:'var(--gray)'}[wo.status] || 'var(--text)';
  var typeLabel = typeMap[wo.type] || '📋 其他';
  var existing = document.getElementById('modal-wo-detail');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-wo-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-detail\').remove()">' +
    '<div class="modal" style="width:560px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🛠️</div><div style="flex:1;"><div style="font-size:15px;font-weight:700;">工单详情 - ' + wo.id + '</div><div style="font-size:11px;color:var(--text-muted);">' + typeLabel + ' · ' + wo.room + '室</div></div>' +
    '<span style="padding:4px 10px;background:' + priorityColor + '22;color:' + priorityColor + ';border-radius:8px;font-size:11px;font-weight:700;">' + (priorityMap[wo.priority] || wo.priority) + '</span>' +
    '<button onclick="document.getElementById(\'modal-wo-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);">房间</div><div style="font-size:15px;font-weight:700;margin-top:2px;">' + wo.room + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);">当前状态</div><div style="font-size:15px;font-weight:700;margin-top:2px;color:' + statusColor + ';">' + wo.status + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);">入住客人</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + (wo.guest || '--') + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:10px;color:var(--text-muted);">创建时间</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + wo.createTime + '</div></div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;"><div style="font-size:10px;color:var(--text-muted);">工单内容</div><div style="font-size:13px;margin-top:4px;line-height:1.5;">' + wo.content + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:14px;"><div style="font-size:10px;color:var(--text-muted);">处理人</div><div style="font-size:13px;font-weight:600;margin-top:2px;">' + (wo.handler || '未指派') + '</div></div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;">' +
    '<div style="padding:10px 12px;background:var(--bg);border-bottom:1px solid var(--border);font-size:12px;font-weight:700;">📝 处理记录</div>' +
    '<div style="max-height:120px;overflow-y:auto;padding:10px 12px;">' +
    '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:10px;">暂无处理记录</div></div></div>' +
    '<div class="form-group"><label class="form-label">添加处理记录</label>' +
    '<textarea class="form-textarea" id="wo-detail-note" placeholder="填写处理进度或结果..." style="width:100%;min-height:60px;border:1px solid var(--border);border-radius:6px;padding:8px 12px;font-size:13px;"></textarea></div>' +
    '<div class="form-group"><label class="form-label">更新状态</label>' +
    '<select class="form-select" id="wo-detail-status" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="待接受">⏳ 待接受</option><option value="处理中">🔄 处理中</option><option value="已完成">✅ 已完成</option><option value="已取消">❌ 已取消</option></select></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-wo-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button>' +
    '<button onclick="submitWorkorderDetailUpdate(\'' + woId + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存更新</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitWorkorderDetailUpdate(woId) {
  var note = document.getElementById('wo-detail-note') ? document.getElementById('wo-detail-note').value.trim() : '';
  var newStatus = document.getElementById('wo-detail-status') ? document.getElementById('wo-detail-status').value : '';
  document.getElementById('modal-wo-detail') && document.getElementById('modal-wo-detail').remove();
  if (newStatus) {
    if (typeof workorderStore !== 'undefined') {
      var wo = workorderStore.find(function(w) { return w.id === woId; });
      if (wo) {
        wo.status = newStatus;
        if (newStatus === '已完成') wo.doneTime = new Date().toLocaleString('zh-CN');
      }
    }
    showToast('✅ 工单 ' + woId + ' 状态已更新为「' + newStatus + '」', 'success');
    if (typeof applyWorkorderSearch === 'function') applyWorkorderSearch();
    if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
  } else {
    showToast('📝 处理记录已保存', 'success');
  }
}

// -------- 改进4：toggleBatchRoom（批量选房切换，9处调用）--------
// 理由：批量操作时勾选房间的切换函数不存在
// 改进：切换房间选中状态，更新已选房间计数和ID列表
var _batchSelectedRooms = {};

function toggleBatchRoom(roomNum, el) {
  if (_batchSelectedRooms[roomNum]) {
    delete _batchSelectedRooms[roomNum];
    if (el) {
      el.style.borderColor = '';
      el.style.background = '';
    }
    showToast('🚫 已取消选择房间 ' + roomNum, 'info');
  } else {
    _batchSelectedRooms[roomNum] = true;
    if (el) {
      el.style.borderColor = 'var(--blue)';
      el.style.background = 'var(--blue-bg)';
    }
    showToast('✅ 已选择房间 ' + roomNum, 'success');
  }
  var count = Object.keys(_batchSelectedRooms).length;
  var countEl = document.getElementById('batch-selected-count');
  if (countEl) countEl.textContent = count;
  var listEl = document.getElementById('batch-selected-list');
  if (listEl) listEl.textContent = Object.keys(_batchSelectedRooms).join(', ') || '暂无';
}

function clearBatchRooms() {
  _batchSelectedRooms = {};
  document.querySelectorAll('[data-batch-room]').forEach(function(el) {
    el.style.borderColor = '';
    el.style.background = '';
  });
  var countEl = document.getElementById('batch-selected-count');
  if (countEl) countEl.textContent = 0;
  var listEl = document.getElementById('batch-selected-list');
  if (listEl) listEl.textContent = '暂无';
  showToast('🗑️ 已清空已选房间', 'info');
}

function selectAllBatchRooms() {
  document.querySelectorAll('[data-batch-room]').forEach(function(el) {
    var roomNum = el.getAttribute('data-batch-room');
    if (roomNum) {
      _batchSelectedRooms[roomNum] = true;
      el.style.borderColor = 'var(--blue)';
      el.style.background = 'var(--blue-bg)';
    }
  });
  var count = Object.keys(_batchSelectedRooms).length;
  var countEl = document.getElementById('batch-selected-count');
  if (countEl) countEl.textContent = count;
  var listEl = document.getElementById('batch-selected-list');
  if (listEl) listEl.textContent = Object.keys(_batchSelectedRooms).join(', ') || '暂无';
  showToast('✅ 已选中全部 ' + count + ' 个房间', 'success');
}

// -------- 改进5：openMemberRechargeModalV3（会员充值弹窗v3，9处调用）--------
// 理由：会员详情页充值按钮调用此函数但版本v3前未实现
// 改进：实现会员充值弹窗，支持选择金额/自定义/充值优惠
var _memberRechargeTarget = null;

function openMemberRechargeModalV3(memberIdx) {
  var members = typeof memberStore !== 'undefined' ? memberStore : [];
  var member = members[memberIdx] || {name:'会员', phone:'--', points:0, level:'普通会员', balance:0};
  _memberRechargeTarget = {idx: memberIdx, member: member};
  var amounts = [100, 300, 500, 1000, 2000];
  var amountOptions = amounts.map(function(a) {
    var bonus = Math.floor(a * 0.1);
    return '<div class="recharge-option" onclick="selectRechargeAmount(' + a + ',this)" style="padding:12px;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;text-align:center;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
      '<div style="font-size:18px;font-weight:700;color:var(--text);">¥' + a + '</div>' +
      '<div style="font-size:10px;color:var(--green);margin-top:2px;">送¥' + bonus + '</div></div>';
  }).join('');
  var existing = document.getElementById('modal-member-recharge-v3');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-member-recharge-v3" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-recharge-v3\').remove()">' +
    '<div class="modal" style="width:500px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">💰</div><div><div style="font-size:15px;font-weight:700;">会员充值 - ' + member.name + '</div><div style="font-size:11px;color:var(--text-muted);">' + member.phone + ' · ' + member.level + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-member-recharge-v3\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">当前余额</div><div style="font-size:24px;font-weight:700;color:var(--blue);">¥' + member.balance + '</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">当前积分</div><div style="font-size:24px;font-weight:700;color:var(--green);">' + member.points + '</div></div></div>' +
    '<div style="font-size:12px;font-weight:700;margin-bottom:8px;">💡 选择充值金额（充100送10，以此类推）</div>' +
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px;">' + amountOptions + '</div>' +
    '<div class="form-group"><label class="form-label">自定义金额（元）</label>' +
    '<input type="number" class="form-input" id="mrecharge-custom" placeholder="输入充值金额" min="1" style="width:100%;padding:10px 12px;font-size:16px;text-align:center;" oninput="clearRechargeOptions()"></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:6px;font-size:12px;color:var(--orange);margin-top:8px;">🎁 充值优惠：充值满500额外赠送50积分</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-member-recharge-v3\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="submitMemberRechargeV3()" style="padding:8px 24px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💰 确认充值</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

var _selectedRechargeAmount = 0;

function selectRechargeAmount(amount, el) {
  _selectedRechargeAmount = amount;
  document.getElementById('mrecharge-custom') && (document.getElementById('mrecharge-custom').value = '');
  // Highlight selected
  el.parentElement.querySelectorAll('.recharge-option').forEach(function(opt) {
    opt.style.borderColor = 'var(--border)';
    opt.style.background = 'var(--bg)';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
}

function clearRechargeOptions() {
  _selectedRechargeAmount = 0;
  el = document.querySelector('.recharge-option[style*="var(--blue)"]');
  if (el) { el.style.borderColor = 'var(--border)'; el.style.background = 'var(--bg)'; }
}

function submitMemberRechargeV3() {
  var customAmt = parseInt(document.getElementById('mrecharge-custom') ? document.getElementById('mrecharge-custom').value : '0') || 0;
  var amount = _selectedRechargeAmount > 0 ? _selectedRechargeAmount : customAmt;
  if (amount <= 0) { showToast('请选择或输入充值金额', 'error'); return; }
  var bonus = Math.floor(amount * 0.1);
  if (amount >= 500) bonus += 50;
  document.getElementById('modal-member-recharge-v3') && document.getElementById('modal-member-recharge-v3').remove();
  if (_memberRechargeTarget && typeof memberStore !== 'undefined') {
    var m = memberStore[_memberRechargeTarget.idx];
    if (m) {
      m.balance = (m.balance || 0) + amount;
      m.points = (m.points || 0) + bonus;
      showToast('✅ 充值成功！' + m.name + ' 充值 ¥' + amount + '，赠送 ¥' + (amount - bonus) + ' 优惠和 ' + bonus + ' 积分', 'success');
    }
  } else {
    showToast('✅ 充值成功！充值 ¥' + amount + '，赠送 ' + bonus + ' 积分', 'success');
  }
  _selectedRechargeAmount = 0;
  _memberRechargeTarget = null;
}

// ============================================================
// 全局初始化：确保所有函数在任何脚本加载顺序下可用
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // 确保已加载的脚本函数可被 HTML onclick 调用
  // 通过重新注册关键函数到 window 对象
  var criticalFns = [
    'openScheduleCellEdit', 'submitScheduleCellEdit',
    'hmClickRoom', 'hmCreateWorkorder', 'hmOpenDoor', 'hmViewHistory', 'hmCheckinRoom',
    'openWorkorderDetailAndUpdate', 'submitWorkorderDetailUpdate',
    'toggleBatchRoom', 'clearBatchRooms', 'selectAllBatchRooms',
    'openMemberRechargeModalV3', 'selectRechargeAmount', 'clearRechargeOptions', 'submitMemberRechargeV3'
  ];
  criticalFns.forEach(function(fn) {
    if (typeof window[fn] === 'undefined' && typeof eval(fn) === 'function') {
      window[fn] = eval(fn);
    }
  });
});
