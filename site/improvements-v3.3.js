// ============================================================
// 物联后台 v3.3 功能性改进脚本
// 5个功能性改进（非样式）
// ============================================================

// ============================================================
// 改进1：设备登记注册弹窗（新增设备 → 填写信息 → 绑定房间）
// 理由：原系统截图02硬件物联有设备管理但缺少新增设备入口，Demo也没有设备注册功能
// 位置：page-device 工具栏 + 新增 openDeviceRegisterModal 函数
// ============================================================

function openDeviceRegisterModal() {
  var existing = document.getElementById('modal-device-register');
  if (existing) existing.remove();

  var html = '<div id="modal-device-register" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-device-register\').remove()">' +
    '<div class="modal" style="width:540px;max-height:88vh;overflow-y:auto;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">📱 新增设备登记</div>' +
    '<button class="modal-close" onclick="document.getElementById(\'modal-device-register\').remove()">✕</button>' +
    '</div>' +
    '<div class="modal-body">' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;">' +
    '<span style="font-size:20px;">💡</span>' +
    '<div style="font-size:12px;color:var(--text-light);">设备登记后需进行"绑定房间"才能正常使用，请提前准备好设备序列号（UUID）</div></div>' +

    '<div style="margin-bottom:14px;font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;">📋 设备基本信息</div>' +

    '<div class="form-group">' +
    '<label class="form-label">设备类型 <span style="color:var(--red);">*</span></label>' +
    '<select class="form-select" id="dr-device-type" onchange="updateDrModelOptions()">' +
    '<option value="">请选择设备类型</option>' +
    '<option value="lock">🔒 智能门锁</option>' +
    '<option value="keypad">🔢 密码门锁</option>' +
    '<option value="card">💳 门卡一体机</option>' +
    '<option value="gateway">📡 通信网关</option>' +
    '</select></div>' +

    '<div class="form-group">' +
    '<label class="form-label">设备型号 <span style="color:var(--red);">*</span></label>' +
    '<select class="form-select" id="dr-device-model">' +
    '<option value="">请先选择设备类型</option>' +
    '</select></div>' +

    '<div class="form-group">' +
    '<label class="form-label">设备序列号 UUID <span style="color:var(--red);">*</span></label>' +
    '<input type="text" class="form-input" id="dr-uuid" placeholder="例：A84F1AF2-xxxx-xxxx-xxxx-xxxx" maxlength="36" style="font-family:monospace;">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">' +
    '<button onclick="scanDrUuid()" style="padding:5px 12px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;font-size:12px;cursor:pointer;">📷 扫描条码</button>' +
    '<button onclick="generateDrUuid()" style="padding:5px 12px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:6px;font-size:12px;cursor:pointer;">🎲 自动生成</button>' +
    '<span id="dr-uuid-status" style="font-size:11px;color:var(--text-muted);"></span></div></div>' +

    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">固件版本</label>' +
    '<input type="text" class="form-input" id="dr-firmware" placeholder="如：v2.1.4" value="v2.1.0"></div>' +
    '<div class="form-group">' +
    '<label class="form-label">初始电量</label>' +
    '<input type="number" class="form-input" id="dr-battery" placeholder="0-100" value="100" min="0" max="100"></div></div>' +

    '<div style="margin-top:16px;margin-bottom:14px;font-size:12px;font-weight:600;color:var(--text);">🔗 绑定设置</div>' +

    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">所在楼栋 <span style="color:var(--red);">*</span></label>' +
    '<select class="form-select" id="dr-building" onchange="updateDrFloorOptions()">' +
    '<option value="">请选择楼栋</option>' +
    '<option value="MAIN">主楼</option>' +
    '<option value="EAST">东配楼</option>' +
    '</select></div>' +
    '<div class="form-group">' +
    '<label class="form-label">绑定楼层</label>' +
    '<select class="form-select" id="dr-floor">' +
    '<option value="">请先选择楼栋</option>' +
    '</select></div></div>' +

    '<div class="form-group">' +
    '<label class="form-label">绑定房间</label>' +
    '<select class="form-select" id="dr-room">' +
    '<option value="">不绑定（作为备件库存）</option>' +
    '<option value="301">301房间</option>' +
    '<option value="302">302房间</option>' +
    '<option value="303">303房间</option>' +
    '<option value="304">304房间</option>' +
    '<option value="305">305房间</option>' +
    '<option value="201">201房间</option>' +
    '<option value="202">202房间</option>' +
    '<option value="203">203房间</option>' +
    '<option value="204">204房间</option>' +
    '<option value="205">205房间</option>' +
    '<option value="101">101房间</option>' +
    '<option value="102">102房间</option>' +
    '<option value="103">103房间</option>' +
    '<option value="104">104房间</option>' +
    '<option value="105">105房间</option>' +
    '<option value="106">106房间</option>' +
    '</select></div>' +

    '<div class="form-group">' +
    '<label class="form-label">安装备注</label>' +
    '<textarea class="form-textarea" id="dr-note" placeholder="备注信息，如：门左侧安装，门框有缝隙需特殊处理..." style="min-height:60px;"></textarea></div>' +

    '<div id="dr-validation-msg" style="display:none;padding:8px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:6px;font-size:12px;color:var(--red);margin-bottom:10px;"></div>' +

    '</div>' +
    '<div class="modal-footer">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-device-register\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="saveDeviceRegister()" style="background:var(--green-bg);color:var(--green);border-color:var(--green);">📋 保存草稿</button>' +
    '<button class="modal-btn primary" onclick="submitDeviceRegister()">✅ 确认登记</button>' +
    '</div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

function updateDrModelOptions() {
  var type = document.getElementById('dr-device-type').value;
  var modelSelect = document.getElementById('dr-device-model');
  var models = {
    lock: [
      {value:'LH-807', label:'领握 LH-807（旗舰款）'},
      {value:'LH-606', label:'领握 LH-606（标准款）'},
      {value:'LH-303', label:'领握 LH-303（入门款）'}
    ],
    keypad: [
      {value:'LK-200', label:'领控 LK-200 密码锁'},
      {value:'LK-100', label:'领控 LK-100 密码版'}
    ],
    card: [
      {value:'LC-500', label:'领智 LC-500 门卡一体机'}
    ],
    gateway: [
      {value:'GW-100', label:'领联 GW-100 通信网关'}
    ]
  };

  if (!type) {
    modelSelect.innerHTML = '<option value="">请先选择设备类型</option>';
    return;
  }

  var opts = '<option value="">请选择型号</option>';
  (models[type] || []).forEach(function(m) {
    opts += '<option value="' + m.value + '">' + m.label + '</option>';
  });
  modelSelect.innerHTML = opts;
}

function updateDrFloorOptions() {
  var bld = document.getElementById('dr-building').value;
  var floorSelect = document.getElementById('dr-floor');
  var floors = {
    MAIN: [
      {value:'3', label:'3层'},
      {value:'2', label:'2层'},
      {value:'1', label:'1层'}
    ],
    EAST: [
      {value:'2', label:'2层'},
      {value:'1', label:'1层'}
    ]
  };

  if (!bld) {
    floorSelect.innerHTML = '<option value="">请先选择楼栋</option>';
    return;
  }

  var opts = '<option value="">不指定楼层</option>';
  (floors[bld] || []).forEach(function(f) {
    opts += '<option value="' + f.value + '">' + f.label + '</option>';
  });
  floorSelect.innerHTML = opts;
}

function scanDrUuid() {
  showToast('📷 正在调用摄像头扫描条码...', 'info');
  setTimeout(function() {
    showToast('⚠️ 条码扫描需要摄像头权限，请在移动设备上使用', 'warning');
  }, 800);
}

function generateDrUuid() {
  var uuid = 'A' + Math.random().toString(16).substring(2,10).toUpperCase() + '-' +
    Math.random().toString(16).substring(2,6).toUpperCase() + '-' +
    Math.random().toString(16).substring(2,6).toUpperCase() + '-' +
    Math.random().toString(16).substring(2,6).toUpperCase() + '-' +
    Math.random().toString(16).substring(2,14).toUpperCase();
  document.getElementById('dr-uuid').value = uuid;
  document.getElementById('dr-uuid-status').textContent = '✅ 已生成模拟UUID';
  document.getElementById('dr-uuid-status').style.color = 'var(--green)';
}

function validateDeviceRegister() {
  var type = document.getElementById('dr-device-type').value;
  var model = document.getElementById('dr-device-model').value;
  var uuid = document.getElementById('dr-uuid').value.trim();
  var bld = document.getElementById('dr-building').value;

  if (!type) return '请选择设备类型';
  if (!model) return '请选择设备型号';
  if (!uuid) return '请输入设备序列号（UUID）';
  if (uuid.length < 20) return 'UUID格式不正确，长度不足';
  if (!bld) return '请选择所在楼栋';
  return null;
}

function saveDeviceRegister() {
  var err = validateDeviceRegister();
  if (err) {
    showToast('⚠️ ' + err, 'warning');
    return;
  }
  var d = {
    type: document.getElementById('dr-device-type').value,
    model: document.getElementById('dr-device-model').value,
    uuid: document.getElementById('dr-uuid').value.trim(),
    firmware: document.getElementById('dr-firmware').value,
    battery: document.getElementById('dr-battery').value,
    building: document.getElementById('dr-building').value,
    floor: document.getElementById('dr-floor').value,
    room: document.getElementById('dr-room').value,
    note: document.getElementById('dr-note').value
  };
  var draft = JSON.parse(localStorage.getItem('deviceRegisterDraft') || '[]');
  draft.unshift(Object.assign({}, d, {savedAt: new Date().toISOString()}));
  localStorage.setItem('deviceRegisterDraft', JSON.stringify(draft.slice(0, 5)));
  showToast('💾 草稿已保存（可保存最近5条）', 'success');
}

function submitDeviceRegister() {
  var err = validateDeviceRegister();
  var msgEl = document.getElementById('dr-validation-msg');
  if (err) {
    msgEl.textContent = '⚠️ ' + err;
    msgEl.style.display = 'block';
    return;
  }
  msgEl.style.display = 'none';

  var d = {
    type: document.getElementById('dr-device-type').value,
    model: document.getElementById('dr-device-model').value,
    uuid: document.getElementById('dr-uuid').value.trim(),
    firmware: document.getElementById('dr-firmware').value,
    battery: parseInt(document.getElementById('dr-battery').value) || 100,
    building: document.getElementById('dr-building').value,
    floor: document.getElementById('dr-floor').value,
    room: document.getElementById('dr-room').value,
    note: document.getElementById('dr-note').value
  };

  var typeLabels = {lock:'智能门锁',keypad:'密码门锁',card:'门卡一体机',gateway:'通信网关'};
  var modelLabel = document.getElementById('dr-device-model').options[document.getElementById('dr-device-model').selectedIndex].text;
  var bldLabel = document.getElementById('dr-building').value === 'MAIN' ? '主楼' : '东配楼';

  showToast('⏳ 正在注册设备...', 'info');
  setTimeout(function() {
    // Add to device table
    if (typeof deviceRawData !== 'undefined') {
      var newDevice = {
        uuid: d.uuid,
        room: d.room || '--',
        type: typeLabels[d.type] || d.type,
        model: d.model,
        status: 'online',
        battery: d.battery,
        signal: Math.floor(Math.random() * 30) + 70,
        lastSync: new Date().toLocaleString('zh-CN')
      };
      deviceRawData.push(newDevice);
      if (typeof initDevicePage === 'function') initDevicePage();
    }
    document.getElementById('modal-device-register').remove();
    showToast('✅ 设备 ' + d.uuid.substring(0,8) + '... 登记成功！' + (d.room ? '已绑定' + d.room + '房间' : '已入库作为备件'), 'success');
  }, 1200);
}

// ============================================================
// 改进2：能耗规则预览确认弹窗（saveEnergyRules 显示变更预览再确认）
// 理由：saveEnergyRules 直接保存没有预览，管理员无法确认变更内容
// ============================================================

function openEnergyRulesPreviewModal() {
  var cooling = document.getElementById('er-cooling') ? document.getElementById('er-cooling').value : (energyRules.temp_threshold.cooling);
  var heating = document.getElementById('er-heating') ? document.getElementById('er-heating').value : (energyRules.temp_threshold.heating);
  var morningStart = document.getElementById('er-morning-start') ? document.getElementById('er-morning-start').value : energyRules.power_schedule.morning_start;
  var morningEnd = document.getElementById('er-morning-end') ? document.getElementById('er-morning-end').value : energyRules.power_schedule.morning_end;
  var nightReduce = document.getElementById('er-night-reduction') ? document.getElementById('er-night-reduction').checked : energyRules.power_schedule.night_reduction;
  var acTimeout = document.getElementById('er-ac-timeout') ? document.getElementById('er-ac-timeout').value : energyRules.ac_auto_off.timeout_minutes;

  var changes = [];
  if (parseInt(cooling) !== energyRules.temp_threshold.cooling) changes.push({label:'制冷温度阈值', from: energyRules.temp_threshold.cooling + '℃', to: cooling + '℃'});
  if (parseInt(heating) !== energyRules.temp_threshold.heating) changes.push({label:'制热温度阈值', from: energyRules.temp_threshold.heating + '℃', to: heating + '℃'});
  if (morningStart !== energyRules.power_schedule.morning_start) changes.push({label:'早间通电开始', from: energyRules.power_schedule.morning_start, to: morningStart});
  if (morningEnd !== energyRules.power_schedule.morning_end) changes.push({label:'早间通电结束', from: energyRules.power_schedule.morning_end, to: morningEnd});
  if (nightReduce !== energyRules.power_schedule.night_reduction) changes.push({label:'夜间降低功率', from: energyRules.power_schedule.night_reduction ? '开启' : '关闭', to: nightReduce ? '开启' : '关闭'});
  if (parseInt(acTimeout) !== energyRules.ac_auto_off.timeout_minutes) changes.push({label:'空调无人超时', from: energyRules.ac_auto_off.timeout_minutes + '分钟', to: acTimeout + '分钟'});

  var existing = document.getElementById('modal-energy-rules-preview');
  if (existing) existing.remove();

  var changeRows = changes.length > 0 ? changes.map(function(c) {
    return '<tr><td style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px;">' + c.label + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-muted);text-decoration:line-through;">' + c.from + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--green);font-weight:600;">→ ' + c.to + '</td></tr>';
  }).join('') : '<tr><td colspan="3" style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">当前配置无变更</td></tr>';

  var html = '<div id="modal-energy-rules-preview" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:500px;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">📋 节能规则变更预览</div>' +
    '<button class="modal-close" onclick="document.getElementById(\'modal-energy-rules-preview\').remove()">✕</button>' +
    '</div>' +
    '<div class="modal-body" style="padding:0;">' +
    '<div style="padding:12px 16px;background:var(--blue-bg);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;">' +
    '<span style="font-size:16px;">ℹ️</span>' +
    '<span style="font-size:12px;color:var(--text-light);">以下是即将生效的规则变更，请确认无误后点击"确认保存"</span></div>' +
    '<table style="width:100%;">' +
    '<thead><tr style="background:var(--bg);">' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">配置项</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">原值</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted);">新值</th></tr></thead>' +
    '<tbody>' + changeRows + '</tbody></table>' +
    '<div style="padding:12px 16px;background:var(--green-bg);border-radius:0 0 8px 8px;border-top:1px solid var(--border);margin-top:0;">' +
    '<div style="font-size:12px;color:var(--green);display:flex;align-items:center;gap:6px;">' +
    '<span>📅 规则生效时间：立即生效</span>' +
    '<span style="margin-left:12px;">📅 变更记录：自动保存到操作日志</span></div></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-energy-rules-preview\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="document.getElementById(\'modal-energy-rules-preview\').remove();openEnergyRulesConfigModal()" style="background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">✏️ 返回修改</button>' +
    '<button class="modal-btn primary" onclick="confirmEnergyRulesSave()" style="background:var(--green);border-color:var(--green);">✅ 确认保存</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function confirmEnergyRulesSave() {
  document.getElementById('modal-energy-rules-preview').remove();
  saveEnergyRules();
}

// ============================================================
// 改进3：交接班完整流程弹窗（交班人→接班人→数据核对→签字确认→打印）
// 理由：现有交接班只有简单的确认弹窗，缺少数据核对和签字确认的完整流程
// ============================================================

function openFullShiftHandoverModal() {
  var existing = document.getElementById('modal-full-shift-handover');
  if (existing) existing.remove();

  var now = new Date();
  var dateStr = now.toLocaleDateString('zh-CN');
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});

  // Simulate handover data
  var handoverData = {
    shift: 'morning',
    handoverName: '赵飞',
    receiverName: '周敏',
    date: dateStr,
    checkinCount: 5,
    checkoutCount: 3,
    revenue: 3860,
    pendingWo: 2,
    alertCount: 1,
    roomStatus: {occupied: 12, empty: 8, maintenance: 2, total: 22},
    notes: ''
  };

  var html = '<div id="modal-full-shift-handover" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:640px;max-height:90vh;overflow-y:auto;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">🔄 交接班完整流程</div>' +
    '<button class="modal-close" onclick="closeFullShiftHandover()">✕</button>' +
    '</div>' +
    '<div class="modal-body" style="padding:0;">' +

    // Step indicator
    '<div style="display:flex;align-items:center;padding:12px 20px;background:var(--bg);border-bottom:1px solid var(--border);gap:0;">' +
    '<div id="hh-step-1" style="flex:1;text-align:center;padding:6px 0;border-bottom:2px solid var(--blue);color:var(--blue);font-size:12px;font-weight:600;">① 交接人确认</div>' +
    '<div style="width:20px;height:1px;background:var(--border);flex-shrink:0;"></div>' +
    '<div id="hh-step-2" style="flex:1;text-align:center;padding:6px 0;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:12px;">② 数据核对</div>' +
    '<div style="width:20px;height:1px;background:var(--border);flex-shrink:0;"></div>' +
    '<div id="hh-step-3" style="flex:1;text-align:center;padding:6px 0;border-bottom:2px solid var(--border);color:var(--text-muted);font-size:12px;">③ 签字确认</div>' +
    '</div>' +

    // Step 1: Person confirmation
    '<div id="hh-content-1" style="padding:20px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">交班人</div>' +
    '<div style="font-size:16px;font-weight:700;color:var(--blue);">赵飞</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">前厅 · 早班</div></div>' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">接班人</div>' +
    '<select class="form-select" id="hh-receiver" style="font-size:14px;padding:6px 10px;">' +
    '<option value="周敏" selected>周敏</option>' +
    '<option value="王丽">王丽</option>' +
    '<option value="李强">李强</option></select>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">请选择接班员工</div></div></div>' +

    '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="font-size:12px;color:var(--orange);font-weight:600;margin-bottom:6px;">⚠️ 交接班须知</div>' +
    '<div style="font-size:12px;color:var(--text-light);line-height:1.6;">' +
    '• 交班前须完成所有在住客人费用结算<br>' +
    '• 重要物品（遗失物品/客人寄存）需当面交接<br>' +
    '• 当班未完成工单需移交至下一班</div></div>' +

    '<div style="display:flex;justify-content:flex-end;gap:8px;">' +
    '<button class="modal-btn secondary" onclick="closeFullShiftHandover()">取消</button>' +
    '<button class="modal-btn primary" onclick="showHhStep(2)">下一步 →</button></div></div>' +

    // Step 2: Data verification
    '<div id="hh-content-2" style="padding:20px;display:none;">' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:22px;font-weight:700;color:var(--blue);">5</div><div style="font-size:11px;color:var(--text-muted);">入住</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:22px;font-weight:700;color:var(--green);">3</div><div style="font-size:11px;color:var(--text-muted);">退房</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:22px;font-weight:700;color:var(--orange);">¥3860</div><div style="font-size:11px;color:var(--text-muted);">当班营收</div></div></div>' +

    '<div style="margin-bottom:12px;font-size:12px;font-weight:600;">📊 当班房态变化</div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">' +
    '<div style="padding:10px;background:var(--blue-bg);border-radius:6px;text-align:center;">' +
    '<div style="font-size:18px;font-weight:700;color:var(--blue);">12</div><div style="font-size:10px;color:var(--text-muted);">在住房</div></div>' +
    '<div style="padding:10px;background:var(--green-bg);border-radius:6px;text-align:center;">' +
    '<div style="font-size:18px;font-weight:700;color:var(--green);">8</div><div style="font-size:10px;color:var(--text-muted);">空房</div></div>' +
    '<div style="padding:10px;background:var(--orange-bg);border-radius:6px;text-align:center;">' +
    '<div style="font-size:18px;font-weight:700;color:var(--orange);">2</div><div style="font-size:10px;color:var(--text-muted);">维护房</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;text-align:center;">' +
    '<div style="font-size:18px;font-weight:700;">22</div><div style="font-size:10px;color:var(--text-muted);">总房间</div></div></div>' +

    '<div style="margin-bottom:8px;font-size:12px;font-weight:600;">📋 待移交事项 <span style="font-size:11px;color:var(--orange);font-weight:400;">（2项）</span></div>' +
    '<div style="margin-bottom:16px;">' +
    '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--orange-bg);border-radius:6px;margin-bottom:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--green);"><span style="font-size:12px;">301房间 客户投诉（待处理）</span></div>' +
    '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--orange-bg);border-radius:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--green);"><span style="font-size:12px;">305门锁低电量（需换电池）</span></div></div>' +

    '<div class="form-group">' +
    '<label class="form-label">交班备注</label>' +
    '<textarea class="form-textarea" id="hh-notes" placeholder="填写需要接班人注意的事项..." style="min-height:60px;font-size:13px;"></textarea></div>' +

    '<div style="display:flex;justify-content:space-between;">' +
    '<button class="modal-btn secondary" onclick="showHhStep(1)">← 上一步</button>' +
    '<button class="modal-btn primary" onclick="showHhStep(3)">下一步 →</button></div></div>' +

    // Step 3: Sign and confirm
    '<div id="hh-content-3" style="padding:20px;display:none;">' +
    '<div style="text-align:center;margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">请双方签字确认交接</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">签字即表示确认当班数据无误，工作已完整交接</div></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
    '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">交班人签字（赵飞）</div>' +
    '<div id="hh-sig-handover" onclick="addHhSignature(\'handover\')" style="height:60px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--blue);font-size:12px;border:1px dashed var(--blue);border-radius:6px;background:var(--blue-bg);">' +
    '<span>✍️ 点击签字</span></div></div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">接班人签字（<span id="hh-receiver-name-display">周敏</span>）</div>' +
    '<div id="hh-sig-receiver" onclick="addHhSignature(\'receiver\')" style="height:60px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--green);font-size:12px;border:1px dashed var(--green);border-radius:6px;background:var(--green-bg);">' +
    '<span>✍️ 点击签字</span></div></div>' +

    '<div style="padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--text-muted);line-height:1.7;">' +
    '<b>交接班时间：</b>' + dateStr + ' ' + timeStr + '<br>' +
    '<b>当班营收：</b>¥3,860 &nbsp;&nbsp; <b>入住/退房：</b>5/3 &nbsp;&nbsp; <b>待处理工单：</b>2项<br>' +
    '<b>房态：</b>在住12间 / 空房8间 / 维护2间 / 总计22间</div>' +

    '<div style="display:flex;gap:8px;">' +
    '<button class="modal-btn" onclick="printHandoverReport()" style="background:var(--blue-bg);color:var(--blue);border-color:var(--blue);flex:1;">🖨️ 打印交接单</button>' +
    '<button class="modal-btn secondary" onclick="showHhStep(2)">← 返回</button>' +
    '<button class="modal-btn primary" id="hh-confirm-btn" onclick="confirmFullShiftHandover()" disabled style="opacity:0.5;cursor:not-allowed;flex:1;">✅ 确认交接</button></div></div>' +

    '</div><div class="modal-footer" style="display:none;"></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

var hhSigs = {handover: false, receiver: false};

function showHhStep(n) {
  [1,2,3].forEach(function(i) {
    var stepEl = document.getElementById('hh-step-' + i);
    var contentEl = document.getElementById('hh-content-' + i);
    if (i === n) {
      stepEl.style.borderBottomColor = 'var(--blue)';
      stepEl.style.color = 'var(--blue)';
      if (contentEl) contentEl.style.display = '';
    } else {
      stepEl.style.borderBottomColor = 'var(--border)';
      stepEl.style.color = 'var(--text-muted)';
      if (contentEl) contentEl.style.display = 'none';
    }
  });
  if (n === 2) {
    var receiver = document.getElementById('hh-receiver');
    if (receiver) document.getElementById('hh-receiver-name-display').textContent = receiver.value;
  }
  if (n === 3) updateHhConfirmBtn();
}

function addHhSignature(who) {
  var sigEl = document.getElementById('hh-sig-' + who);
  if (who === 'receiver') {
    var receiverName = document.getElementById('hh-receiver').value;
    sigEl.innerHTML = '<div style="font-size:18px;font-weight:700;color:var(--green);">' + receiverName + '</div><div style="font-size:10px;color:var(--green);">已签字</div>';
  } else {
    sigEl.innerHTML = '<div style="font-size:18px;font-weight:700;color:var(--blue);">赵飞</div><div style="font-size:10px;color:var(--blue);">已签字</div>';
  }
  sigEl.style.borderStyle = 'solid';
  sigEl.style.cursor = 'default';
  hhSigs[who] = true;
  updateHhConfirmBtn();
}

function updateHhConfirmBtn() {
  var btn = document.getElementById('hh-confirm-btn');
  if (hhSigs.handover && hhSigs.receiver) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
}

function printHandoverReport() {
  showToast('🖨️ 正在准备打印...', 'info');
  setTimeout(function() { showToast('🖨️ 交接单已发送到打印机', 'success'); }, 800);
}

function confirmFullShiftHandover() {
  if (!hhSigs.handover || !hhSigs.receiver) {
    showToast('⚠️ 请双方签字后再确认', 'warning');
    return;
  }
  var receiver = document.getElementById('hh-receiver').value;
  var notes = document.getElementById('hh-notes').value;
  document.getElementById('modal-full-shift-handover').remove();
  showToast('✅ 交接班完成！接班人：' + receiver, 'success');
  hhSigs = {handover: false, receiver: false};
}

function closeFullShiftHandover() {
  var el = document.getElementById('modal-full-shift-handover');
  if (el) el.remove();
  hhSigs = {handover: false, receiver: false};
}

// ============================================================
// 改进4：备份恢复二次确认详细弹窗（显示备份内容+风险提示+环境选择）
// 理由：restoreBackup 只有简单 confirm，缺乏详细的恢复确认和信息展示
// ============================================================

function openBackupRestoreConfirmModal(idx) {
  var b = backupHistory[idx];
  if (!b) return;

  var existing = document.getElementById('modal-backup-restore-confirm');
  if (existing) existing.remove();

  var riskLevel = b.type === '自动' ? 'low' : 'medium';
  var riskLabels = {
    low: {label:'⚪ 低风险', color:'var(--green)', desc:'系统将在恢复前自动创建一次备份'},
    medium: {label:'🟡 中风险', color:'var(--orange)', desc:'建议在非高峰期操作'},
    high: {label:'🔴 高风险', color:'var(--red)', desc:'恢复将覆盖所有配置，可能影响在线设备'}
  };
  var risk = riskLabels[riskLevel];

  var html = '<div id="modal-backup-restore-confirm" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:560px;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">🔄 备份恢复确认</div>' +
    '<button class="modal-close" onclick="document.getElementById(\'modal-backup-restore-confirm\').remove()">✕</button>' +
    '</div>' +
    '<div class="modal-body" style="padding:0;">' +

    // Risk banner
    '<div style="padding:14px 16px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:44px;height:44px;border-radius:50%;background:' + risk.color + ';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;opacity:0.9;">⚠️</div>' +
    '<div style="flex:1;">' +
    '<div style="font-size:13px;font-weight:700;color:' + risk.color + ';margin-bottom:2px;">风险等级：' + risk.label + '</div>' +
    '<div style="font-size:12px;color:var(--text-light);">' + risk.desc + '</div></div></div>' +

    // Backup details
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📦 备份详情</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">备份时间</div><div style="font-size:13px;font-weight:500;">' + b.time + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">备份类型</div><div style="font-size:13px;font-weight:500;">' + b.type + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">文件大小</div><div style="font-size:13px;font-weight:500;">' + b.size + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">包含内容</div><div style="font-size:13px;font-weight:500;">' + b.items + '</div></div></div></div>' +

    // Contents checklist
    '<div style="padding:14px 20px;border-bottom:1px solid var(--border);">' +
    '<div style="font-size:12px;font-weight:700;margin-bottom:10px;">☑️ 将恢复的内容</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 10px;background:var(--bg);border-radius:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--blue);"><span>房间配置（24间）</span></div>' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 10px;background:var(--bg);border-radius:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--blue);"><span>设备列表（16台）</span></div>' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 10px;background:var(--bg);border-radius:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--blue);"><span>员工账户（8个）</span></div>' +
    '<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 10px;background:var(--bg);border-radius:6px;">' +
    '<input type="checkbox" checked style="accent-color:var(--blue);"><span>系统参数</span></div></div></div>' +

    // Environment note
    '<div style="padding:12px 20px;border-bottom:1px solid var(--border);background:var(--orange-bg);">' +
    '<div style="font-size:12px;color:var(--orange);line-height:1.6;">' +
    '<b>⚠️ 注意事项：</b><br>' +
    '• 恢复操作不可中断，请保持网络连接<br>' +
    '• 当前配置将自动备份后再覆盖<br>' +
    '• 恢复后需重新登录系统</div></div>' +

    // Confirm checkbox
    '<div style="padding:14px 20px;">' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="br-confirm-check" onchange="updateBrRestoreBtn()" style="accent-color:var(--blue);width:16px;height:16px;">' +
    '<span>我已了解恢复风险，确认将此备份恢复到当前系统</span></label></div>' +

    '</div>' +
    '<div class="modal-footer">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-backup-restore-confirm\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="downloadBackup(' + idx + ')" style="background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">📥 重新下载</button>' +
    '<button class="modal-btn primary" id="br-restore-btn" onclick="doBackupRestoreConfirm(' + idx + ')" disabled style="opacity:0.4;cursor:not-allowed;">🔄 确认恢复</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function updateBrRestoreBtn() {
  var checked = document.getElementById('br-confirm-check').checked;
  var btn = document.getElementById('br-restore-btn');
  if (btn) {
    btn.disabled = !checked;
    btn.style.opacity = checked ? '1' : '0.4';
    btn.style.cursor = checked ? 'pointer' : 'not-allowed';
  }
}

function doBackupRestoreConfirm(idx) {
  if (!document.getElementById('br-confirm-check').checked) {
    showToast('⚠️ 请勾选确认框', 'warning');
    return;
  }
  document.getElementById('modal-backup-restore-confirm').remove();
  showToast('⏳ 正在创建当前配置备份...', 'info');
  setTimeout(function() {
    showToast('⏳ 正在恢复备份数据...', 'info');
    setTimeout(function() {
      showToast('✅ 备份恢复成功！系统配置已更新', 'success');
    }, 2000);
  }, 1000);
}

// ============================================================
// 改进5：房间维护状态设置弹窗（含维护原因/预计恢复时间/通知客人选项）
// 理由：现有批量维护只是简单设置状态，缺少维护原因和预计恢复时间的管理逻辑
// ============================================================

function openRoomMaintenanceSetModal() {
  var existing = document.getElementById('modal-room-maintenance-set');
  if (existing) existing.remove();

  var html = '<div id="modal-room-maintenance-set" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:560px;">' +
    '<div class="modal-header">' +
    '<div class="modal-title">🔧 设置房间维护状态</div>' +
    '<button class="modal-close" onclick="document.getElementById(\'modal-room-maintenance-set\').remove()">✕</button>' +
    '</div>' +
    '<div class="modal-body">' +

    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--orange-bg);border-radius:8px;margin-bottom:16px;">' +
    '<span style="font-size:18px;">💡</span>' +
    '<div style="font-size:12px;color:var(--text-light);">维护房将无法办理入住入住，请确认选择的房间已全部退房</div></div>' +

    '<div class="form-group">' +
    '<label class="form-label">维护原因 <span style="color:var(--red);">*</span></label>' +
    '<select class="form-select" id="rms-reason">' +
    '<option value="">请选择维护原因</option>' +
    '<option value="cleaning">🧹 深度清洁</option>' +
    '<option value="repair">🔧 设施维修</option>' +
    '<option value="renovation">🏗️ 装修翻新</option>' +
    '<option value="inspection">🔍 例行检查</option>' +
    '<option value="other">📋 其他原因</option>' +
    '</select></div>' +

    '<div class="form-group" id="rms-other-reason-group" style="display:none;">' +
    '<label class="form-label">其他原因说明</label>' +
    '<input type="text" class="form-input" id="rms-other-reason" placeholder="请输入维护原因"></div>' +

    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">预计恢复时间</label>' +
    '<input type="date" class="form-input" id="rms-recover-date"></input></div>' +
    '<div class="form-group">' +
    '<label class="form-label">预计完成时间</label>' +
    '<select class="form-select" id="rms-recover-time">' +
    '<option value="">请选择</option>' +
    '<option value="09:00">09:00</option>' +
    '<option value="10:00">10:00</option>' +
    '<option value="11:00">11:00</option>' +
    '<option value="12:00">12:00</option>' +
    '<option value="14:00">14:00</option>' +
    '<option value="16:00">16:00</option>' +
    '<option value="18:00">18:00</option>' +
    '<option value="20:00">20:00</option>' +
    '</select></div></div>' +

    '<div class="form-group">' +
    '<label class="form-label">指派工程师</label>' +
    '<select class="form-select" id="rms-engineer">' +
    '<option value="">不指派</option>' +
    '<option value="李强">李强（工程部）</option>' +
    '<option value="王工">王工（外协）</option>' +
    '</select></div>' +

    '<div class="form-group">' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="rms-notify-guest" style="accent-color:var(--blue);">' +
    '<span>☎️ 通知在住客人（发送短信告知房间维护安排）</span></label></div>' +

    '<div class="form-group">' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="rms-block-booking" checked style="accent-color:var(--blue);">' +
    '<span>🚪 自动屏蔽预订（OTA和前台均不可预订该房间）</span></label></div>' +

    '<div class="form-group">' +
    '<label class="form-label">备注信息</label>' +
    '<textarea class="form-textarea" id="rms-notes" placeholder="维护详细说明..." style="min-height:60px;"></textarea></div>' +

    '<div id="rms-selected-rooms" style="margin-bottom:12px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">🚪 已选择的房间（<span id="rms-room-count">0</span>间）</div>' +
    '<div id="rms-room-chips" style="display:flex;flex-wrap:wrap;gap:6px;"></div></div>' +

    '</div>' +
    '<div class="modal-footer">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-room-maintenance-set\').remove()">取消</button>' +
    '<button class="modal-btn primary" id="rms-submit-btn" onclick="submitRoomMaintenanceSet()" disabled style="opacity:0.5;cursor:not-allowed;">🔧 确认设置维护</button>' +
    '</div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);

  // Show/hide other reason
  document.getElementById('rms-reason').addEventListener('change', function() {
    var otherGroup = document.getElementById('rms-other-reason-group');
    otherGroup.style.display = this.value === 'other' ? '' : 'none';
    validateRmsForm();
  });

  // Pre-fill selected rooms from floor page
  var selectedRooms = window._selectedMaintenanceRooms || [];
  renderRmsRoomChips(selectedRooms);
  validateRmsForm();
}

function renderRmsRoomChips(rooms) {
  var chipsEl = document.getElementById('rms-room-chips');
  var countEl = document.getElementById('rms-room-count');
  if (!chipsEl) return;
  countEl.textContent = rooms.length;
  chipsEl.innerHTML = rooms.map(function(r) {
    return '<span style="padding:4px 10px;background:var(--orange-bg);color:var(--orange);border-radius:12px;font-size:12px;font-weight:600;">' + r + '</span>';
  }).join('');
}

function validateRmsForm() {
  var reason = document.getElementById('rms-reason').value;
  var rooms = window._selectedMaintenanceRooms || [];
  var valid = reason && reason.length > 0 && rooms.length > 0;
  var btn = document.getElementById('rms-submit-btn');
  if (btn) {
    btn.disabled = !valid;
    btn.style.opacity = valid ? '1' : '0.5';
    btn.style.cursor = valid ? 'pointer' : 'not-allowed';
  }
}

function submitRoomMaintenanceSet() {
  var reason = document.getElementById('rms-reason').value;
  var otherReason = document.getElementById('rms-other-reason').value;
  var recoverDate = document.getElementById('rms-recover-date').value;
  var recoverTime = document.getElementById('rms-recover-time').value;
  var engineer = document.getElementById('rms-engineer').value;
  var notifyGuest = document.getElementById('rms-notify-guest').checked;
  var blockBooking = document.getElementById('rms-block-booking').checked;
  var notes = document.getElementById('rms-notes').value;
  var rooms = window._selectedMaintenanceRooms || [];

  if (!reason) {
    showToast('⚠️ 请选择维护原因', 'warning');
    return;
  }
  if (rooms.length === 0) {
    showToast('⚠️ 请选择要维护的房间', 'warning');
    return;
  }

  var reasonLabels = {cleaning:'深度清洁',repair:'设施维修',renovation:'装修翻新',inspection:'例行检查',other:'其他'};
  var reasonText = reason === 'other' ? otherReason : reasonLabels[reason];
  var recoverStr = recoverDate ? (recoverDate + (recoverTime ? ' ' + recoverTime : '')) : '未指定';

  document.getElementById('modal-room-maintenance-set').remove();
  showToast('⏳ 正在设置房间维护状态...', 'info');
  setTimeout(function() {
    showToast('✅ ' + rooms.join('、') + ' 已设为"' + reasonText + '"维护，预计 ' + recoverStr + ' 恢复', 'success');
    if (notifyGuest) showToast('📱 已通知在住客人', 'info');
    window._selectedMaintenanceRooms = [];
  }, 1000);
}

// Hook into floor page bulk maintenance button
var _origOpenFloorBulkMaintenanceModal = openFloorBulkMaintenanceModal;
function openFloorBulkMaintenanceModal() {
  // Capture selected rooms before showing modal
  var selected = [];
  var checkboxes = document.querySelectorAll('#page-floor .room-card input[type="checkbox"]:checked');
  checkboxes.forEach(function(cb) {
    var card = cb.closest('.room-card');
    if (card) {
      var roomNum = card.querySelector('.room-num');
      if (roomNum) selected.push(roomNum.textContent.trim());
    }
  });
  window._selectedMaintenanceRooms = selected;
  _origOpenFloorBulkMaintenanceModal();
}
