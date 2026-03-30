// ============================================================
// 【物联后台 v4-iter41】修复5个缺失函数绑定
// 修复：按钮已存在但调用的函数从未定义
// ============================================================

// ============================================================
// 【改进1】editRoomRecord - 办理记录编辑功能
// 理由：房间详情页办理记录Tab有"编辑"按钮 onclick="editRoomRecord('rec-001')"
//       但函数从未定义，点击无响应
// 业务闭环：点击编辑 → 弹窗表单 → 修改记录信息 → 保存更新列表
// ============================================================
function editRoomRecord(recordId) {
  // 模拟数据（实际应从 recordsData 读取）
  var recordsMap = {
    'rec-001': {type:'in', name:'张三', room:'301', roomType:'亲子间', phone:'138****8888', method:'手机开锁', time:'今天 10:32', status:'active'},
    'rec-002': {type:'out', name:'李四', room:'203', roomType:'亲子间', phone:'139****6666', method:'客户卡', time:'昨天 14:20', status:'done'},
    'rec-003': {type:'change', name:'钱七', room:'301', roomType:'亲子间', phone:'137****7777', method:'', time:'03-25 16:00', status:'done', fromRoom:'203', changeReason:'房间噪音大'},
    'rec-004': {type:'out', name:'王五', room:'102', roomType:'标准间', phone:'137****5555', method:'手机开锁', time:'03-24 12:00', status:'done'}
  };
  var r = recordsMap[recordId] || recordsMap['rec-001'];
  var existing = document.getElementById('modal-edit-room-record');
  if (existing) existing.remove();

  var typeOptions = '<option value="in"' + (r.type === 'in' ? ' selected' : '') + '>🏨 入住</option>' +
    '<option value="out"' + (r.type === 'out' ? ' selected' : '') + '>🚪 退房</option>' +
    '<option value="change"' + (r.type === 'change' ? ' selected' : '') + '>🔄 换房</option>' +
    '<option value="cancel"' + (r.type === 'cancel' ? ' selected' : '') + '>❌ 取消</option>';

  var html = '<div class="modal-overlay" id="modal-edit-room-record" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-room-record\').remove()">' +
    '<div class="modal" style="width:500px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑办理记录</div><div style="font-size:11px;color:var(--text-muted);">' + r.name + ' · ' + r.room + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-edit-room-record\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">记录类型</label>' +
    '<select class="form-select" id="err-type" style="width:100%;">' + typeOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">房间号</label>' +
    '<input type="text" class="form-input" id="err-room" value="' + r.room + '" placeholder="如：301"></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">姓名 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="err-name" value="' + r.name + '" placeholder="请输入姓名"></div>' +
    '<div class="form-group"><label class="form-label">联系电话</label>' +
    '<input type="text" class="form-input" id="err-phone" value="' + r.phone + '" placeholder="请输入手机号"></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">入住方式</label>' +
    '<select class="form-select" id="err-method" style="width:100%;">' +
    '<option value="phone"' + (r.method === '手机开锁' ? ' selected' : '') + '>📱 手机开锁</option>' +
    '<option value="card"' + (r.method === '客户卡' ? ' selected' : '') + '>💳 客户卡</option>' +
    '<option value="master"' + (r.method === '通卡' ? ' selected' : '') + '>🔑 通卡/应急</option>' +
    '<option value="remote"' + (r.method === '远程开锁' ? ' selected' : '') + '>🌐 远程开锁</option></select></div>' +
    '<div class="form-group"><label class="form-label">办理时间</label>' +
    '<input type="text" class="form-input" id="err-time" value="' + r.time + '" placeholder="如：今天 10:32"></div></div>' +
    (r.type === 'change' ? '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">原房间</label>' +
    '<input type="text" class="form-input" id="err-from-room" value="' + (r.fromRoom || '') + '" placeholder="如：203"></div>' +
    '<div class="form-group"><label class="form-label">换房原因</label>' +
    '<input type="text" class="form-input" id="err-change-reason" value="' + (r.changeReason || '') + '" placeholder="请输入原因"></div></div>' : '') +
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">' +
    '<button onclick="document.getElementById(\'modal-edit-room-record\').remove()" class="action-btn" style="padding:8px 20px;">取消</button>' +
    '<button onclick="saveEditRoomRecord(\'' + recordId + '\')" class="action-btn" style="padding:8px 20px;background:var(--blue);color:white;border-color:var(--blue);">💾 保存修改</button></div></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

function saveEditRoomRecord(recordId) {
  var name = document.getElementById('err-name').value.trim();
  if (!name) { showToast('姓名不能为空', 'error'); return; }
  // 更新页面上的记录显示
  var el = document.querySelector('[data-record-id="' + recordId + '"]');
  if (el) {
    el.querySelector('.name').textContent = name;
    var room = document.getElementById('err-room').value.trim();
    var type = document.getElementById('err-type').value;
    el.querySelector('.meta').textContent = room + ' · ' + type;
  }
  document.getElementById('modal-edit-room-record').remove();
  showToast('✅ 记录已更新：' + name, 'success');
}

// ============================================================
// 【改进2】deleteRoomRecord - 办理记录删除功能
// 理由：退房记录有"删除"按钮 onclick="deleteRoomRecord('rec-002')"
//       但函数从未定义，点击无响应
// 业务闭环：点击删除 → 确认弹窗 → 确认后从列表移除 + Toast提示
// ============================================================
function deleteRoomRecord(recordId) {
  var existing = document.getElementById('modal-delete-room-record');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-delete-room-record" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-delete-room-record\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;">' +
    '<div style="padding:24px 24px 20px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:12px;">🗑️</div>' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:8px;">确认删除该记录？</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">删除后数据无法恢复，请确认是否继续</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-delete-room-record\').remove()" class="action-btn" style="padding:8px 24px;">取消</button>' +
    '<button onclick="confirmDeleteRoomRecord(\'' + recordId + '\')" class="action-btn" style="padding:8px 24px;background:var(--red);color:white;border-color:var(--red);">🗑️ 确认删除</button></div></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

function confirmDeleteRoomRecord(recordId) {
  var el = document.querySelector('[data-record-id="' + recordId + '"]');
  if (el) {
    el.style.transition = 'all 0.3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    setTimeout(function() { el.remove(); }, 300);
  }
  document.getElementById('modal-delete-room-record').remove();
  showToast('🗑️ 记录已删除', 'info');
}

// ============================================================
// 【改进3】searchByCardNumber + cardNumberSearchPreview - 开锁记录卡号搜索
// 理由：开锁记录页有卡号搜索框 onkeydown="searchByCardNumber()" oninput="cardNumberSearchPreview()"
//       但函数从未定义，搜索无响应
// 业务闭环：输入卡号 → 实时预览匹配结果 → 回车/点击搜索 → 过滤显示匹配记录 + Toast提示
// ============================================================
function cardNumberSearchPreview(keyword) {
  var preview = document.getElementById('log-card-preview');
  var hint = document.getElementById('log-card-search-hint');
  if (!keyword || keyword.length < 2) {
    if (preview) preview.style.display = 'none';
    return;
  }
  // 模拟卡号匹配预览
  var mockCards = [
    {num:'138****1234', name:'张三', type:'会员卡', count:3},
    {num:'139****5678', name:'李四', type:'会员卡', count:2},
    {num:'137****9012', name:'王五', type:'员工卡', count:1}
  ];
  var matches = mockCards.filter(function(c) {
    return c.num.includes(keyword) || c.name.includes(keyword);
  });
  if (matches.length > 0 && preview) {
    var items = matches.map(function(c) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">' +
        '<span style="color:var(--blue);font-weight:600;">' + c.num + '</span>' +
        '<span>' + c.name + '</span>' +
        '<span style="color:var(--text-muted);">' + c.type + '</span>' +
        '<span style="margin-left:auto;color:var(--text-muted);">' + c.count + '条记录</span></div>';
    }).join('');
    preview.innerHTML = '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">💡 搜索建议：</div>' + items;
    preview.style.display = 'block';
  } else if (preview) {
    preview.style.display = 'none';
  }
}

function searchByCardNumber() {
  var cardNum = document.getElementById('log-card-number').value.trim();
  var cardType = document.getElementById('log-card-type-filter') ? document.getElementById('log-card-type-filter').value : 'all';
  var hint = document.getElementById('log-card-search-hint');
  var resultCount = document.getElementById('log-card-result-count');

  if (!cardNum) {
    showToast('请输入卡号或会员号', 'warn');
    return;
  }

  // 模拟搜索结果
  var mockCount = Math.floor(Math.random() * 5) + 1;
  if (hint) hint.textContent = '共 ' + mockCount + ' 条记录';
  if (resultCount) resultCount.textContent = mockCount;

  // 显示结果面板
  var preview = document.getElementById('log-card-preview');
  if (preview) {
    preview.innerHTML = '<div style="padding:10px 0;font-size:12px;"><span style="color:var(--green);">✅ 找到</span> <b>' + mockCount + '</b> 条开锁记录（卡号：' + cardNum + '）</div>';
    preview.style.display = 'block';
  }

  showToast('🔍 搜索完成：找到 ' + mockCount + ' 条记录', 'success');
}

// ============================================================
// 【改进4】openBatchUpgradeModal - 设备批量升级弹窗
// 理由：设备管理页有"批量升级固件"按钮 onclick="window._userClickedBatchUpgrade=true;openBatchUpgradeModal()"
//       但 openBatchUpgradeModal 函数从未定义，点击无响应
// 业务闭环：点击批量升级 → 弹窗显示可升级设备列表 → 选择设备 → 确认升级 → Toast反馈
// ============================================================
function openBatchUpgradeModal() {
  var existing = document.getElementById('modal-batch-upgrade');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-batch-upgrade" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-batch-upgrade\').remove()">' +
    '<div class="modal" style="width:580px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📦</div><div><div style="font-size:15px;font-weight:700;">批量固件升级</div><div style="font-size:11px;color:var(--text-muted);">选择设备进行固件批量升级</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-batch-upgrade\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="margin-bottom:16px;padding:12px 14px;background:var(--blue-bg);border-radius:8px;font-size:13px;color:var(--blue);">📋 当前有 <b>3</b> 台设备可升级固件（当前版本低于最新版本）</div>' +
    '<div style="margin-bottom:12px;font-size:12px;color:var(--text-muted);">请勾选需要升级的设备：</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">' +
    '<div style="display:flex;align-items:center;padding:10px 14px;background:var(--bg);border-bottom:1px solid var(--border);font-size:12px;font-weight:600;">' +
    '<input type="checkbox" id="bu-all" onchange="toggleBuAll(this.checked)" style="accent-color:var(--blue);margin-right:10px;">' +
    '<span style="flex:1;">全选</span><span style="width:100px;text-align:center;">当前版本</span><span style="width:100px;text-align:center;">最新版本</span><span style="width:80px;text-align:center;">状态</span></div>' +
    '<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;">' +
    '<input type="checkbox" class="bu-device" style="accent-color:var(--blue);margin-right:10px;">' +
    '<span style="flex:1;">🔒 301室 · UUID: a1b2c3d4</span><span style="width:100px;text-align:center;color:var(--text-muted);">v1.2.1</span><span style="width:100px;text-align:center;color:var(--green);">v1.3.0</span><span style="width:80px;text-align:center;"><span style="color:var(--orange);">可升级</span></span></div>' +
    '<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;">' +
    '<input type="checkbox" class="bu-device" style="accent-color:var(--blue);margin-right:10px;">' +
    '<span style="flex:1;">🔒 203室 · UUID: e5f6g7h8</span><span style="width:100px;text-align:center;color:var(--text-muted);">v1.1.8</span><span style="width:100px;text-align:center;color:var(--green);">v1.3.0</span><span style="width:80px;text-align:center;"><span style="color:var(--orange);">可升级</span></span></div>' +
    '<div style="display:flex;align-items:center;padding:10px 14px;font-size:12px;">' +
    '<input type="checkbox" class="bu-device" style="accent-color:var(--blue);margin-right:10px;">' +
    '<span style="flex:1;">🔒 102室 · UUID: i9j0k1l2</span><span style="width:100px;text-align:center;color:var(--text-muted);">v1.2.5</span><span style="width:100px;text-align:center;color:var(--green);">v1.3.0</span><span style="width:80px;text-align:center;"><span style="color:var(--orange);">可升级</span></span></div></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">' +
    '<button onclick="document.getElementById(\'modal-batch-upgrade\').remove()" class="action-btn" style="padding:8px 20px;">取消</button>' +
    '<button onclick="startBatchFirmwareUpgrade()" class="action-btn" style="padding:8px 20px;background:var(--blue);color:white;border-color:var(--blue);">🚀 开始升级</button></div></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

function toggleBuAll(checked) {
  document.querySelectorAll('.bu-device').forEach(function(el) { el.checked = checked; });
}

function startBatchFirmwareUpgrade() {
  var selected = document.querySelectorAll('.bu-device:checked');
  if (selected.length === 0) { showToast('请至少选择一台设备', 'warn'); return; }
  document.getElementById('modal-batch-upgrade').remove();
  showToast('🚀 已提交 ' + selected.length + ' 台设备固件升级任务，约需3-5分钟', 'success');
}

// ============================================================
// 【改进5】openFirmwareAnalyzerModal - 固件版本分析器
// 理由：设备管理页有"📡 版本分析器"按钮 onclick="openFirmwareAnalyzerModal()"
//       但函数从未定义，点击无响应
// 业务闭环：点击分析 → 弹窗显示各设备版本分布 → 统计汇总 → Toast提示
// ============================================================
function openFirmwareAnalyzerModal() {
  var existing = document.getElementById('modal-firmware-analyzer');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-firmware-analyzer" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-analyzer\').remove()">' +
    '<div class="modal" style="width:520px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📡</div><div><div style="font-size:15px;font-weight:700;">固件版本分析器</div><div style="font-size:11px;color:var(--text-muted);">设备版本分布统计</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="margin-bottom:16px;font-size:13px;font-weight:600;color:var(--text);">📊 版本分布</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="padding:12px;border:1px solid var(--green);border-radius:8px;text-align:center;background:var(--green-bg);">' +
    '<div style="font-size:22px;font-weight:700;color:var(--green);">7台</div><div style="font-size:11px;color:var(--text-muted);">v1.3.0 (最新)</div></div>' +
    '<div style="padding:12px;border:1px solid var(--orange);border-radius:8px;text-align:center;background:var(--orange-bg);">' +
    '<div style="font-size:22px;font-weight:700;color:var(--orange);">4台</div><div style="font-size:11px;color:var(--text-muted);">v1.2.x</div></div>' +
    '<div style="padding:12px;border:1px solid var(--red);border-radius:8px;text-align:center;background:var(--red-bg);">' +
    '<div style="font-size:22px;font-weight:700;color:var(--red);">2台</div><div style="font-size:11px;color:var(--text-muted);">v1.1.x (过期)</div></div></div>' +
    '<div style="margin-bottom:12px;font-size:12px;color:var(--text-muted);">📋 设备详情：</div>' +
    '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;">' +
    '<div style="padding:8px 12px;font-size:11px;color:var(--text-muted);border-bottom:1px solid var(--border);display:flex;"><span style="flex:1;">设备</span><span style="width:80px;">版本</span><span style="width:60px;">状态</span></div>' +
    '<div style="padding:8px 12px;font-size:11px;display:flex;border-bottom:1px solid var(--border);"><span style="flex:1;">301室</span><span style="width:80px;color:var(--green);">v1.3.0</span><span style="width:60px;color:var(--green);">✅ 正常</span></div>' +
    '<div style="padding:8px 12px;font-size:11px;display:flex;border-bottom:1px solid var(--border);"><span style="flex:1;">203室</span><span style="width:80px;color:var(--green);">v1.3.0</span><span style="width:60px;color:var(--green);">✅ 正常</span></div>' +
    '<div style="padding:8px 12px;font-size:11px;display:flex;border-bottom:1px solid var(--border);"><span style="flex:1;">102室</span><span style="width:80px;color:var(--orange);">v1.2.5</span><span style="width:60px;color:var(--orange);">⚠️ 可升级</span></div>' +
    '<div style="padding:8px 12px;font-size:11px;display:flex;"><span style="flex:1;">202室</span><span style="width:80px;color:var(--red);">v1.1.8</span><span style="width:60px;color:var(--red);">❌ 过期</span></div></div>' +
    '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">' +
    '<button onclick="document.getElementById(\'modal-firmware-analyzer\').remove()" class="action-btn" style="padding:8px 20px;display:block;margin:0 auto;">关闭</button></div></div></div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
  showToast('📊 固件分析完成，共 13 台设备', 'info');
}
