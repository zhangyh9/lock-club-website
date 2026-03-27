/**
 * V3 迭代新增功能 (2026-03-28)
 * 5个功能性改进
 */

// ========== 改进1: 楼栋管理增强 - 删除二次确认+自动计算+列表刷新 ==========

var buildingData = [
  {id:'B01',name:'1号楼',floors:3,rooms:24,status:'active',desc:'主楼，标准间/大床房'},
  {id:'B02',name:'2号楼',floors:2,rooms:16,status:'active',desc:'副楼，亲子间为主'},
  {id:'B03',name:'3号楼',floors:4,rooms:32,status:'inactive',desc:'新楼，套房/家庭房'},
];

function openBuildingDeleteConfirmModal(idx) {
  var b = buildingData[idx];
  if (!b) return;
  var old = document.getElementById('modal-bld-delete-confirm');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-bld-delete-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;color:var(--red);">⚠️ 删除楼栋确认</div>' +
    '<button onclick="document.getElementById(\'modal-bld-delete-confirm\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:13px;color:var(--red);margin-bottom:16px;">🚨 删除操作不可逆！该楼栋下所有房间数据将一并清除</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">楼栋名称</span><span style="font-weight:600;">' + b.name + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">楼层数</span><span style="font-weight:600;">' + b.floors + ' 层</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">房间数</span><span style="font-weight:600;">' + b.rooms + ' 间</span></div>' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:6px;">请输入 <strong style="color:var(--red);">' + b.name + '</strong> 确认删除：</label>' +
    '<input type="text" class="form-input" id="bld-del-confirm-input" placeholder="请输入楼栋名称" style="font-size:13px;">' +
    '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-bld-delete-confirm\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="confirmBuildingDelete(' + idx + ')" id="bld-del-confirm-btn" class="modal-btn" style="background:var(--red);color:white;border:none;opacity:0.5;cursor:not-allowed;" disabled>确认删除</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('bld-del-confirm-input').addEventListener('input', function() {
    var btn = document.getElementById('bld-del-confirm-btn');
    if (this.value.trim() === b.name) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  });
}

function confirmBuildingDelete(idx) {
  var b = buildingData[idx];
  if (!b) return;
  buildingData.splice(idx, 1);
  document.getElementById('modal-bld-delete-confirm').remove();
  renderBuildingTable();
  showToast('🗑️ 楼栋「' + b.name + '」已删除', 'success');
  addNotif('🏢', 'var(--red)', 'config', '删除楼栋：' + b.name);
}

function renderBuildingTable() {
  var tbody = document.getElementById('bld-list-body');
  if (!tbody) return;
  var html = '';
  buildingData.forEach(function(b, i) {
    var statusLabel = b.status === 'active' ? '<span class="tbadge green">启用</span>' : '<span class="tbadge gray">停用</span>';
    html += '<tr><td>' + b.name + '</td><td>' + b.floors + '层</td><td>' + b.rooms + '间</td><td>' + statusLabel + '</td>' +
      '<td><button class="action-btn small" onclick="openEditBuildingModal(' + i + ')">编辑</button> ' +
      '<button class="action-btn small red" onclick="openBuildingDeleteConfirmModal(' + i + ')">删除</button></td></tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">暂无楼栋数据</td></tr>';
}

// ========== 改进2: 员工管理增强 - 部门岗位联动+工号自动生成+密码生成 ==========

var staffDeptPositions = {
  '前厅': [{label:'前厅经理',value:'前厅经理'},{label:'前厅主管',value:'前厅主管'},{label:'接待员',value:'接待员'},{label:'行李员',value:'行李员'},{label:'话务员',value:'话务员'},{label:'预订员',value:'预订员'}],
  '客房': [{label:'客房经理',value:'客房经理'},{label:'客房主管',value:'客房主管'},{label:'房嫂组长',value:'房嫂组长'},{label:'房嫂',value:'房嫂'},{label:'保洁员',value:'保洁员'},{label:'PA组员',value:'PA组员'}],
  '工程': [{label:'工程经理',value:'工程经理'},{label:'弱电工程师',value:'弱电工程师'},{label:'强电工程师',value:'强电工程师'},{label:'万能工',value:'万能工'},{label:'维修工',value:'维修工'}],
  '管理': [{label:'总经理',value:'总经理'},{label:'财务经理',value:'财务经理'},{label:'人事经理',value:'人事经理'},{label:'店长',value:'店长'},{label:'行政专员',value:'行政专员'}],
  '安保': [{label:'安保主管',value:'安保主管'},{label:'保安',value:'保安'},{label:'监控员',value:'监控员'}]
};

function onStaffDeptChange(deptSelectEl) {
  var dept = deptSelectEl.value;
  var posSelect = document.getElementById('sf-position') || document.getElementById('sfm-position');
  if (!posSelect) return;
  var positions = staffDeptPositions[dept] || [];
  var currentVal = posSelect.value;
  posSelect.innerHTML = '<option value="">请选择岗位</option>';
  positions.forEach(function(p) {
    var selected = p.value === currentVal ? ' selected' : '';
    posSelect.innerHTML += '<option value="' + p.value + '"' + selected + '>' + p.label + '</option>';
  });
}

function generateStaffCode() {
  var deptMap = {'前厅':'QT','客房':'KF','工程':'GC','管理':'GL','安保':'AB'};
  var dept = document.getElementById('sf-dept') ? document.getElementById('sf-dept').value : '前厅';
  var now = new Date();
  var ym = String(now.getFullYear()).slice(2,4) + String(now.getMonth()+1).padStart(2,'0');
  var existingCodes = (typeof staffListData !== 'undefined' ? staffListData : []).filter(function(s){ return s.code && s.code.indexOf((deptMap[dept]||'QT') + ym) === 0; });
  var seq = String(existingCodes.length + 1).padStart(2,'0');
  var code = (deptMap[dept] || 'QT') + ym + seq;
  var codeInput = document.getElementById('sf-code') || document.getElementById('sfm-code');
  if (codeInput) codeInput.value = code;
  return code;
}

function onStaffPhoneInput(phoneInputEl) {
  var phone = phoneInputEl.value.trim();
  if (phone.length === 11) {
    generateStaffCode();
    var pwdInput = document.getElementById('sf-init-pwd') || document.getElementById('sfm-init-pwd');
    if (pwdInput && !pwdInput.value) {
      pwdInput.value = phone.slice(-6);
    }
  }
}

function generateStaffRandomPwd() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var pwd = '';
  for (var i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  var pwdInput = document.getElementById('sf-init-pwd') || document.getElementById('sfm-init-pwd');
  if (pwdInput) pwdInput.value = pwd;
  showToast('🎲 随机密码已生成：' + pwd, 'success');
}

// ========== 改进3: 服务工单创建增强 - 期望时间+房间自动完成+通知渠道+自动ID ==========

function generateWorkorderId() {
  var now = new Date();
  var dateStr = now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
  var rand = String(Math.floor(Math.random() * 900) + 100);
  return 'WO-' + dateStr + '-' + rand;
}

var existingRoomNumbers = ['301','302','303','304','203','201','202','401','402'];

function setupRoomAutoComplete(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', function() {
    var val = this.value.trim().toUpperCase();
    if (!val) return;
    var matches = existingRoomNumbers.filter(function(r) { return r.indexOf(val) === 0; });
    if (matches.length > 0 && matches.indexOf(val) === -1) {
      this.placeholder = '试试: ' + matches.slice(0,3).join(' / ');
    } else {
      this.placeholder = '如：301';
    }
  });
}

function submitWorkorderCreateV3() {
  var woType = (document.getElementById('wo-create-type') || {}).value || 'other';
  var room = (document.getElementById('wo-create-room') || {}).value.trim() || '';
  var customer = (document.getElementById('wo-create-customer') || {}).value.trim() || '';
  var content = (document.getElementById('wo-create-content') || {}).value.trim() || '';
  var priority = (document.getElementById('wo-create-priority') || {}).value || 'normal';
  var dueDate = (document.getElementById('wo-create-due') || {}).value || '';
  var dueTime = (document.getElementById('wo-create-due-time') || {}).value || '';
  var notifySms = (document.getElementById('wo-notify-sms') || {}).checked || false;
  var notifyFeishu = (document.getElementById('wo-notify-feishu') || {}).checked || false;

  if (!content) {
    showToast('请填写工单内容', 'error');
    return;
  }

  var woId = generateWorkorderId();
  var typeLabels = {complaint:'🔴 客户投诉',delivery:'📦 送物服务',invoice:'📄 发票需求',review:'⭐ 点评表扬',other:'📝 其他'};
  var priorityLabels = {urgent:'🟠 紧急',normal:'🟡 普通',low:'🟢 低优先级'};

  var newWo = {
    woId: woId,
    type: woType,
    typeLabel: typeLabels[woType] || '📝 其他',
    room: room,
    customer: customer,
    content: content,
    priority: priority,
    priorityLabel: priorityLabels[priority] || '🟡 普通',
    status: '待接受',
    assignee: '',
    dueDate: dueDate,
    dueTime: dueTime,
    createTime: new Date().toLocaleString('zh-CN'),
    notifySms: notifySms,
    notifyFeishu: notifyFeishu
  };

  if (typeof workorderData !== 'undefined') {
    workorderData.unshift(newWo);
  }

  var notifyStr = [];
  if (notifySms) notifyStr.push('短信');
  if (notifyFeishu) notifyStr.push('飞书');
  var dueStr = dueDate ? '，期望' + dueDate + (dueTime ? ' ' + dueTime : '') : '';
  var notifStr = notifyStr.length > 0 ? '，已通过' + notifyStr.join('/') + '通知' : '（无通知）';

  closeModal('create-wo');
  showToast('✅ 工单 ' + woId + ' 创建成功' + notifStr, 'success');
  addNotif('📋', 'var(--blue)', 'workorder', '新工单：' + newWo.typeLabel + ' · ' + room + dueStr);

  if (document.getElementById('wo-create-content')) document.getElementById('wo-create-content').value = '';
  if (document.getElementById('wo-create-room')) document.getElementById('wo-create-room').value = '';
  if (document.getElementById('wo-create-customer')) document.getElementById('wo-create-customer').value = '';
  if (document.getElementById('wo-create-due')) document.getElementById('wo-create-due').value = '';
}

// ========== 改进4: 房型价格多期间配置 - 平日/周末/节假日价格 ==========

var roomTypePricePlans = {
  '标准间': { weekday: 98, weekend: 128, holiday: 168 },
  '大床房': { weekday: 108, weekend: 138, holiday: 178 },
  '亲子间': { weekday: 128, weekend: 158, holiday: 208 },
  '家庭套房': { weekday: 198, weekend: 258, holiday: 328 }
};

function openRoomTypePricePlanModal(roomTypeName) {
  var old = document.getElementById('modal-roomtype-price-plan');
  if (old) old.remove();
  var plan = roomTypePricePlans[roomTypeName] || {weekday: 0, weekend: 0, holiday: 0};
  var avgRev = plan.weekday > 0 ? ((plan.weekday * 5 + plan.weekend * 2) / 7 * 30).toFixed(0) : 0;
  var wknPct = plan.weekday > 0 ? Math.round((plan.weekend - plan.weekday) / plan.weekday * 100) : 0;
  var holPct = plan.weekday > 0 ? Math.round((plan.holiday - plan.weekday) / plan.weekday * 100) : 0;
  var html = '<div class="modal-overlay" id="modal-roomtype-price-plan" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">💰 ' + roomTypeName + ' - 多期间价格配置</div>' +
    '<button onclick="document.getElementById(\'modal-roomtype-price-plan\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--green);margin-bottom:4px;">平日价格</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--green);">¥<input type="number" id="rtpp-weekday" value="' + plan.weekday + '" style="width:70px;font-size:28px;font-weight:700;color:var(--green);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">周一~周五</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--orange);margin-bottom:4px;">周末价格</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--orange);">¥<input type="number" id="rtpp-weekend" value="' + plan.weekend + '" style="width:70px;font-size:28px;font-weight:700;color:var(--orange);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">周六、周日</div></div>' +
    '<div style="padding:14px;background:var(--red-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--red);margin-bottom:4px;">节假日</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--red);">¥<input type="number" id="rtpp-holiday" value="' + plan.holiday + '" style="width:70px;font-size:28px;font-weight:700;color:var(--red);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">法定节假日</div></div>' +
    '</div>' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:14px;font-size:12px;color:var(--blue);">' +
    '💡 <strong>预估月收入</strong>（按30天=5工作周计算）：<strong style="font-size:16px;">¥' + avgRev + '</strong> / 月' +
    '</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:12px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text);">📅 价格说明</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>周末溢价率</span><span style="color:var(--orange);font-weight:600;">+' + wknPct + '%</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>节假日溢价率</span><span style="color:var(--red);font-weight:600;">+' + holPct + '%</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>月均入住率基准</span><span>70%</span></div>' +
    '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-roomtype-price-plan\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="saveRoomTypePricePlan(\'' + roomTypeName + '\')" class="modal-btn primary">💾 保存价格方案</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveRoomTypePricePlan(roomTypeName) {
  var weekday = parseInt(document.getElementById('rtpp-weekday').value) || 0;
  var weekend = parseInt(document.getElementById('rtpp-weekend').value) || 0;
  var holiday = parseInt(document.getElementById('rtpp-holiday').value) || 0;
  roomTypePricePlans[roomTypeName] = {weekday: weekday, weekend: weekend, holiday: holiday};
  document.getElementById('modal-roomtype-price-plan').remove();
  showToast('💰 ' + roomTypeName + ' 价格方案已保存！平日¥' + weekday + ' / 周末¥' + weekend + ' / 节假日¥' + holiday, 'success');
  addNotif('💰', 'var(--green)', 'config', '更新房型价格：' + roomTypeName);
}

// ========== 改进5: 排班管理增强 - 班次模板保存/加载+请假申请审批 ==========

var shiftTemplates = [
  {name:'行政班', shifts:{mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00',fri:'09:00-18:00',sat:'休息',sun:'休息'}},
  {name:'两班倒', shifts:{mon:'07:00-15:00',tue:'07:00-15:00',wed:'14:00-22:00',thu:'14:00-22:00',fri:'07:00-15:00',sat:'14:00-22:00',sun:'休息'}},
  {name:'夜班制', shifts:{mon:'22:00-07:00',tue:'22:00-07:00',wed:'22:00-07:00',thu:'休息',fri:'22:00-07:00',sat:'22:00-07:00',sun:'休息'}}
];

function saveShiftTemplate() {
  var name = prompt('请输入模板名称（如：行政班/两班倒/夜班制）：');
  if (!name || !name.trim()) return;
  var shifts = {mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00',fri:'09:00-18:00',sat:'休息',sun:'休息'};
  var existingIdx = shiftTemplates.findIndex(function(t){ return t.name === name; });
  var template = {name: name, shifts: shifts};
  if (existingIdx >= 0) {
    shiftTemplates[existingIdx] = template;
    showToast('✅ 模板「' + name + '」已更新', 'success');
  } else {
    shiftTemplates.push(template);
    showToast('✅ 模板「' + name + '」已保存', 'success');
  }
}

function openShiftTemplateLoadModal() {
  var old = document.getElementById('modal-shift-template-load');
  if (old) old.remove();
  var listHtml = shiftTemplates.map(function(t, i) {
    return '<div onclick="loadShiftTemplate(' + i + ')" style="padding:12px 14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.borderColor=\'var(--blue)\';" onmouseout="this.style.borderColor=\'var(--border)\';">' +
      '<div><div style="font-size:13px;font-weight:600;">' + t.name + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">平日:' + t.shifts.mon + ' · 周末:' + t.shifts.sat + '</div></div>' +
      '<button class="action-btn small">加载</button></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-shift-template-load" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📋 班次模板库</div>' +
    '<button onclick="document.getElementById(\'modal-shift-template-load\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:16px 24px;max-height:400px;overflow-y:auto;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">选择一个模板应用到本周排班（将覆盖现有排班）</div>' +
    listHtml +
    '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<button onclick="saveShiftTemplate()" class="action-btn small" style="background:var(--green-bg);color:var(--green);border-color:var(--green);">💾 保存当前为模板</button>' +
    '<button onclick="document.getElementById(\'modal-shift-template-load\').remove()" class="modal-btn secondary">关闭</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function loadShiftTemplate(idx) {
  var t = shiftTemplates[idx];
  if (!t) return;
  document.getElementById('modal-shift-template-load').remove();
  showToast('📋 模板「' + t.name + '」已加载，可手动调整后保存排班', 'success');
}

var leaveRequests = [
  {id:'LR001', name:'周敏', dept:'前厅', type:'年假', days:'3天', dateFrom:'2026-04-01', dateTo:'2026-04-03', reason:'家中有事', status:'pending'},
  {id:'LR002', name:'吴倩', dept:'客房', type:'病假', days:'1天', dateFrom:'2026-03-30', dateTo:'2026-03-30', reason:'发烧', status:'approved'},
  {id:'LR003', name:'王工', dept:'工程', type:'调休', days:'2天', dateFrom:'2026-04-05', dateTo:'2026-04-06', reason:'探亲', status:'rejected'}
];

function openLeaveApprovalModal() {
  var old = document.getElementById('modal-leave-approval');
  if (old) old.remove();
  var pendingList = leaveRequests.filter(function(l){ return l.status === 'pending'; });
  var listHtml = pendingList.length === 0 ? '<div style="text-align:center;padding:24px;color:var(--text-muted);">暂无待审批请假</div>' :
    pendingList.map(function(l) {
      var typeColors = {'年假':'var(--blue)', '病假':'var(--red)', '调休':'var(--orange)', '事假':'var(--purple)'};
      var typeColor = typeColors[l.type] || 'var(--text)';
      return '<div style="padding:12px 14px;border:1px solid var(--border);border-radius:8px;margin-bottom:10px;background:white;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div><span style="font-weight:600;font-size:13px;">' + l.name + '</span> <span style="font-size:11px;color:var(--text-muted);">' + l.dept + '部</span></div>' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + typeColor + '20;color:' + typeColor + ';">' + l.type + '</span></div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">' + l.dateFrom + ' ~ ' + l.dateTo + ' （共' + l.days + '）</div>' +
        '<div style="font-size:12px;margin-bottom:10px;">📝 ' + l.reason + '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '<button onclick="resolveLeaveRequest(\'' + l.id + '\',\'approved\')" class="action-btn small" style="flex:1;background:var(--green-bg);color:var(--green);border-color:var(--green);">✅ 批准</button>' +
        '<button onclick="resolveLeaveRequest(\'' + l.id + '\',\'rejected\')" class="action-btn small" style="flex:1;background:var(--red-bg);color:var(--red);border-color:var(--red);">❌ 拒绝</button></div></div>';
    }).join('');
  var html = '<div class="modal-overlay" id="modal-leave-approval" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:80vh;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div style="font-size:15px;font-weight:700;">📋 请假申请审批 <span style="font-size:12px;color:var(--orange);">（' + pendingList.length + ' 条待审批）</span></div>' +
    '<button onclick="document.getElementById(\'modal-leave-approval\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:16px 24px;overflow-y:auto;flex:1;">' + listHtml + '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;flex-shrink:0;">' +
    '<button onclick="openLeaveHistoryModal()" class="action-btn small" style="color:var(--text-muted);">📜 审批历史</button>' +
    '<button onclick="document.getElementById(\'modal-leave-approval\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function resolveLeaveRequest(id, action) {
  var l = leaveRequests.find(function(x){ return x.id === id; });
  if (!l) return;
  l.status = action;
  document.getElementById('modal-leave-approval').remove();
  var actionLabel = action === 'approved' ? '已批准' : '已拒绝';
  showToast(actionLabel + ' 请假申请：' + l.name + ' 的 ' + l.type + '（' + l.days + '）', action === 'approved' ? 'success' : 'warning');
  addNotif('📋', action === 'approved' ? 'var(--green)' : 'var(--red)', 'staff', '请假审批：' + l.name + ' ' + l.type + ' ' + actionLabel);
}

function openLeaveHistoryModal() {
  var old = document.getElementById('modal-leave-history');
  if (old) old.remove();
  var allList = leaveRequests;
  var listHtml = allList.map(function(l) {
    var statusMap = {approved:'var(--green)', rejected:'var(--red)', pending:'var(--orange)'};
    var statusLabel = {approved:'✅ 已批准', rejected:'❌ 已拒绝', pending:'⏳ 待审批'};
    var typeColors = {'年假':'var(--blue)', '病假':'var(--red)', '调休':'var(--orange)', '事假':'var(--purple)'};
    return '<div style="padding:10px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + l.name + ' <span style="font-size:11px;color:var(--text-muted);">' + l.type + '</span></div>' +
      '<div style="font-size:11px;color:var(--text-muted);">' + l.dateFrom + ' ~ ' + l.dateTo + ' · ' + l.days + '</div></div>' +
      '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + statusMap[l.status] + '20;color:' + statusMap[l.status] + ';">' + statusLabel[l.status] + '</span></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-leave-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📜 请假审批历史</div>' +
    '<button onclick="document.getElementById(\'modal-leave-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>' +
    '<div style="padding:12px 20px;max-height:350px;overflow-y:auto;">' + listHtml + '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);text-align:right;">' +
    '<button onclick="document.getElementById(\'modal-leave-history\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 初始化：运行时自动注入增强字段
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // 改进3: 给工单创建弹窗添加期望时间和通知渠道字段
    var woTypeSelect = document.getElementById('wo-create-type');
    if (woTypeSelect) {
      var parent = woTypeSelect.closest('.modal-body');
      if (parent && !document.getElementById('wo-create-due')) {
        var priorityRow = document.getElementById('wo-create-priority');
        if (priorityRow && priorityRow.parentElement) {
          var dueField = '<div class="form-row"><div class="form-group"><label class="form-label">期望完成日期</label><input type="date" class="form-input" id="wo-create-due" style="padding:7px 10px;font-size:13px;"></div>' +
            '<div class="form-group"><label class="form-label">期望时间</label><input type="time" class="form-input" id="wo-create-due-time" value="18:00" style="padding:7px 10px;font-size:13px;"></div></div>' +
            '<div class="form-group"><label class="form-label">通知渠道</label><div style="display:flex;gap:12px;align-items:center;padding:6px 0;">' +
            '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;"><input type="checkbox" id="wo-notify-sms" style="accent-color:var(--blue);"> 📱 短信</label>' +
            '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;"><input type="checkbox" id="wo-notify-feishu" checked style="accent-color:var(--blue);"> 💬 飞书</label></div></div>';
          priorityRow.insertAdjacentHTML('afterend', dueField);
        }
      }
    }
    // 改进2: 员工表单部门联动
    var deptSelect = document.getElementById('sf-dept');
    if (deptSelect) {
      deptSelect.addEventListener('change', function() { onStaffDeptChange(this); });
    }
    var phoneInput = document.getElementById('sf-phone');
    if (phoneInput) {
      phoneInput.addEventListener('blur', function() { onStaffPhoneInput(this); });
    }
    // 改进3: 房间号自动完成
    var roomInput = document.getElementById('wo-create-room');
    if (roomInput) setupRoomAutoComplete(roomInput);
  }, 800);
});
