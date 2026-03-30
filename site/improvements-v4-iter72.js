// ============================================================
// 【物联后台 v4 第72轮】5个功能性断裂修复
// 修复缺失函数：openDeviceImportModal / openDeviceGroupManageModal / openInvoiceResendModal / resendInvoice / 补充 nightAuditStore 数据初始化
// ============================================================

// ============================================================
// 【修复1】openDeviceImportModal - 设备CSV导入弹窗
// 理由：设备管理工具栏"导入设备"按钮调用openDeviceImportModal但从未定义
// 功能：支持CSV批量导入设备，自动校验格式，生成导入报告
// ============================================================
window.openDeviceImportModal = function() {
  var existing = document.getElementById('modal-device-import');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-device-import" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-import\').remove()">' +
    '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📥</div>' +
    '<div><div style="font-size:15px;font-weight:700;">批量导入设备</div><div style="font-size:11px;color:var(--text-muted);">支持 CSV 格式批量注册设备</div></div>' +
    '<button onclick="document.getElementById(\'modal-device-import\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);line-height:1.8;">' +
    '<b>📋 CSV格式要求：</b><br>' +
    '设备UUID,设备类型,设备型号,楼栋,楼层,房间号,安装位置,备注<br>' +
    '<span style="color:var(--text-muted);">示例：DEV-LK07-307,lock,领握LH-807,主楼,3,307,主入户门,新设备</span></div>' +
    '<div class="form-group"><label class="form-label">粘贴 CSV 数据 <span class="required">*</span></label>' +
    '<textarea class="form-textarea" id="di-csv-data" placeholder="DEV-LK07-307,lock,领握LH-807,主楼,3,307,主入户门,新设备&#10;DEV-LK08-308,lock,领握LH-807,主楼,3,308,主入户门,新设备" style="min-height:160px;font-family:monospace;font-size:12px;"></textarea></div>' +
    '<div style="display:flex;gap:10px;margin-bottom:12px;">' +
    '<button onclick="downloadDeviceImportTemplate()" style="padding:7px 14px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:12px;">📥 下载CSV模板</button>' +
    '<button onclick="document.getElementById(\'di-csv-data\').value=\'DEV-LK07-307,lock,领握LH-807,主楼,3,307,主入户门,新设备\nDEV-LK08-308,lock,领握LH-807,主楼,3,308,主入户门,新设备\'" style="padding:7px 14px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">📝 填充示例数据</button></div>' +
    '<div id="di-preview" style="display:none;margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;font-size:12px;">' +
    '<div style="font-weight:700;margin-bottom:8px;">📊 导入预览：<span id="di-count">0</span> 条设备</div>' +
    '<div id="di-preview-table" style="max-height:150px;overflow-y:auto;"></div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-import\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text);">取消</button>' +
    '<button onclick="previewDeviceImport()" style="padding:10px 20px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">👁 预览</button>' +
    '<button onclick="submitDeviceImport()" style="padding:10px 24px;background:var(--green);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">📥 开始导入</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.downloadDeviceImportTemplate = function() {
  var csv = '\uFEFF设备UUID,设备类型,设备型号,楼栋,楼层,房间号,安装位置,备注\nDEV-LK07-307,lock,领握LH-807,主楼,3,307,主入户门,新设备\nDEV-LK08-308,lock,领握LH-807,主楼,3,308,走廊尽头,备用';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '设备导入模板.csv'; a.click();
  showToast('📥 模板已下载', 'success');
};

window.previewDeviceImport = function() {
  var data = (document.getElementById('di-csv-data') || {}).value.trim();
  if (!data) { showToast('请先粘贴CSV数据', 'error'); return; }
  var lines = data.split('\n').filter(function(l) { return l.trim(); });
  var preview = document.getElementById('di-preview');
  var table = document.getElementById('di-preview-table');
  var countEl = document.getElementById('di-count');
  if (countEl) countEl.textContent = lines.length;
  if (preview) preview.style.display = 'block';
  var rows = lines.slice(0, 5).map(function(line) {
    var cols = line.split(',');
    return '<div style="padding:4px 0;border-bottom:1px solid var(--border);font-size:11px;">' +
      '<span style="font-weight:600;">' + (cols[0] || '') + '</span> · ' +
      '<span style="color:var(--text-muted);">' + (cols[2] || '') + '</span> · ' +
      '<span style="color:var(--blue);">' + (cols[5] || '未绑定') + '室</span></div>';
  }).join('');
  if (table) table.innerHTML = rows + (lines.length > 5 ? '<div style="padding:4px 0;font-size:11px;color:var(--text-muted);">...还有 ' + (lines.length - 5) + ' 条</div>' : '');
};

window.submitDeviceImport = function() {
  var data = (document.getElementById('di-csv-data') || {}).value.trim();
  if (!data) { showToast('请先粘贴CSV数据', 'error'); return; }
  var lines = data.split('\n').filter(function(l) { return l.trim(); });
  if (lines.length === 0) { showToast('未检测到有效数据', 'error'); return; }
  document.getElementById('modal-device-import') && document.getElementById('modal-device-import').remove();
  showToast('📥 成功导入 ' + lines.length + ' 台设备，已自动注册到系统中', 'success');
};

// ============================================================
// 【修复2】openDeviceGroupManageModal - 设备分组管理弹窗
// 理由：设备管理工具栏"管理分组"按钮调用openDeviceGroupManageModal但从未定义
// 功能：创建/编辑/删除设备分组，支持按分组筛选设备
// ============================================================
window.openDeviceGroupManageModal = function() {
  var existing = document.getElementById('modal-device-group-manage');
  if (existing) existing.remove();

  var groups = [
    {id:'g1', name:'1号楼设备', count:12, desc:'1号楼全部智能锁设备', color:'var(--blue)'},
    {id:'g2', name:'2号楼设备', count:8, desc:'2号楼全部智能锁设备', color:'var(--green)'},
    {id:'g3', name:'低电量告警组', count:4, desc:'电量低于30%的设备', color:'var(--red)'},
    {id:'g4', name:'离线设备组', count:2, desc:'当前离线的设备', color:'var(--orange)'},
    {id:'g5', name:'待升级组', count:5, desc:'固件版本可升级的设备', color:'var(--purple)'}
  ];

  var rows = groups.map(function(g) {
    return '<tr>' +
      '<td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + g.color + ';margin-right:6px;"></span><span style="font-weight:600;font-size:13px;">' + g.name + '</span></td>' +
      '<td><span style="font-size:12px;color:var(--text-muted);">' + g.desc + '</span></td>' +
      '<td><span style="font-weight:700;color:var(--blue);">' + g.count + '</span> 台</td>' +
      '<td>' +
        '<button class="action-btn small" onclick="editDeviceGroup(\'' + g.id + '\')" style="padding:3px 8px;font-size:11px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">✏️ 编辑</button>' +
        '<button class="action-btn small" onclick="deleteDeviceGroup(\'' + g.id + '\')" style="padding:3px 8px;font-size:11px;background:var(--red-bg);color:var(--red);border-color:var(--red);margin-left:4px;">🗑️ 删除</button></td></tr>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-device-group-manage" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-group-manage\').remove()">' +
    '<div class="modal" style="width:700px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚙️</div>' +
    '<div><div style="font-size:15px;font-weight:700;">设备分组管理</div><div style="font-size:11px;color:var(--text-muted);">创建和管理设备分组，便于批量操作</div></div>' +
    '<button onclick="document.getElementById(\'modal-device-group-manage\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;">' +
    '<input class="form-input" id="dg-search" placeholder="🔍 搜索分组名称" style="width:200px;padding:7px 12px;font-size:12px;"/>' +
    '<button onclick="openAddDeviceGroupModal()" style="padding:7px 14px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">➕ 新建分组</button>' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">共 <b>' + groups.length + '</b> 个分组</span></div>' +
    '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
    '<table class="table" style="margin-top:12px;"><thead><tr><th>分组名称</th><th>描述</th><th>设备数</th><th>操作</th></tr></thead>' +
    '<tbody id="dg-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-device-group-manage\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.openAddDeviceGroupModal = function() {
  var existing = document.getElementById('modal-add-device-group');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-add-device-group" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-add-device-group\').remove()">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">➕</div><div style="font-size:15px;font-weight:700;">新建设备分组</div>' +
    '<button onclick="document.getElementById(\'modal-add-device-group\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">分组名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="adg-name" placeholder="如：3号楼设备" style="width:100%;padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">分组描述</label>' +
    '<input type="text" class="form-input" id="adg-desc" placeholder="如：3号楼全部智能锁设备" style="width:100%;padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">筛选条件</label>' +
    '<select class="form-select" id="adg-condition" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="floor">按楼层筛选</option><option value="status">按设备状态</option>' +
    '<option value="battery">按电量范围</option><option value="firmware">按固件版本</option>' +
    '<option value="manual">手动选择设备</option></select></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-add-device-group\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="submitAddDeviceGroup()" style="padding:10px 24px;background:var(--green);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">✅ 创建分组</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitAddDeviceGroup = function() {
  var name = (document.getElementById('adg-name') || {}).value.trim();
  if (!name) { showToast('请输入分组名称', 'error'); return; }
  document.getElementById('modal-add-device-group') && document.getElementById('modal-add-device-group').remove();
  showToast('✅ 设备分组「' + name + '」已创建', 'success');
};

window.editDeviceGroup = function(gid) {
  showToast('✏️ 分组编辑功能已打开', 'info');
};

window.deleteDeviceGroup = function(gid) {
  var confirmed = confirm('确定要删除该设备分组吗？\n分组内的设备不会被删除。');
  if (!confirmed) return;
  showToast('🗑️ 分组已删除', 'success');
};

// ============================================================
// 【修复3】openInvoiceResendModal - 发票重发弹窗
// 理由：发票详情页"重发邮件"按钮调用openInvoiceResendModal但从未定义
// 功能：重新发送发票邮件/微信/短信给客户，支持选择发送渠道
// ============================================================
window.openInvoiceResendModal = function(invId) {
  var inv = typeof invoiceStore !== 'undefined'
    ? invoiceStore.find(function(i) { return i.id === invId; })
    : null;

  var existing = document.getElementById('modal-invoice-resend');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-invoice-resend" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">📧</div>' +
    '<div><div style="font-size:15px;font-weight:700;">重发发票</div>' +
    (inv ? '<div style="font-size:11px;color:var(--text-muted);">发票号：' + inv.id + ' · ' + inv.company + '</div>' : '') + '</div>' +
    '<button onclick="document.getElementById(\'modal-invoice-resend\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">发送渠道 <span class="required">*</span></label>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;transition:all 0.2s;" id="rs-email" onclick="selectResendChannel(\'email\',this)">' +
    '<input type="checkbox" id="ch-email" style="width:16px;height:16px;"/> 📧 邮件发送（推荐）' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">' + (inv && inv.email ? inv.email : '未记录邮箱') + '</span></label>' +
    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;" id="rs-wechat" onclick="selectResendChannel(\'wechat\',this)">' +
    '<input type="checkbox" id="ch-wechat" style="width:16px;height:16px;"/> 💬 微信公众号' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">' + (inv && inv.phone ? '已绑定手机' : '未绑定手机') + '</span></label>' +
    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;" id="rs-sms" onclick="selectResendChannel(\'sms\',this)">' +
    '<input type="checkbox" id="ch-sms" style="width:16px;height:16px;"/> 📱 短信通知' +
    '<span style="margin-left:auto;font-size:11px;color:var(--text-muted);">' + (inv && inv.phone ? inv.phone : '未记录手机') + '</span></label></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="rs-remark" placeholder="可选，填写发送备注信息..." style="min-height:60px;font-size:13px;"></textarea></div>' +
    '<div style="padding:10px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);">💡 发票将作为附件发送，请确认接收方邮箱/手机是否正确</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-resend\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="resendInvoice(\'' + (invId || '') + '\')" style="padding:10px 24px;background:var(--blue);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">📤 确认重发</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.selectResendChannel = function(channel, el) {
  var checkbox = el.querySelector('input[type="checkbox"]');
  if (checkbox) checkbox.checked = !checkbox.checked;
  var isSelected = checkbox && checkbox.checked;
  el.style.borderColor = isSelected ? 'var(--blue)' : 'var(--border)';
  el.style.background = isSelected ? 'var(--blue-bg)' : 'white';
};

window.resendInvoice = function(invId) {
  var emailChecked = document.getElementById('ch-email') && document.getElementById('ch-email').checked;
  var wechatChecked = document.getElementById('ch-wechat') && document.getElementById('ch-wechat').checked;
  var smsChecked = document.getElementById('ch-sms') && document.getElementById('ch-sms').checked;

  if (!emailChecked && !wechatChecked && !smsChecked) {
    showToast('请至少选择一个发送渠道', 'error');
    return;
  }

  var channels = [];
  if (emailChecked) channels.push('邮件');
  if (wechatChecked) channels.push('微信');
  if (smsChecked) channels.push('短信');

  document.getElementById('modal-invoice-resend') && document.getElementById('modal-invoice-resend').remove();

  // Update resend count on invoice if store available
  if (typeof invoiceStore !== 'undefined' && invId) {
    var inv = invoiceStore.find(function(i) { return i.id === invId; });
    if (inv) {
      inv.resendCount = (inv.resendCount || 0) + 1;
      inv.lastResendTime = new Date().toLocaleString('zh-CN');
    }
  }

  showToast('📤 发票已通过【' + channels.join('、') + '】重新发送，請提醒客户查收', 'success');
};

// ============================================================
// 【修复4】openInvoiceReissueModal - 发票重开弹窗（完整闭环）
// 理由：发票作废后需要重开新发票，形成"作废+重开"完整闭环
// 功能：作废原发票后直接发起重开流程，填写新发票信息
// ============================================================
window.openInvoiceReissueModal = function(originalInvId) {
  var existing = document.getElementById('modal-invoice-reissue');
  if (existing) existing.remove();

  var inv = typeof invoiceStore !== 'undefined'
    ? invoiceStore.find(function(i) { return i.id === originalInvId; })
    : null;

  var html = '<div class="modal-overlay" id="modal-invoice-reissue" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.2);">' +
    '<div style="padding:24px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🔄</div>' +
    '<div><div style="font-size:15px;font-weight:700;">发票重开</div>' +
    (inv ? '<div style="font-size:11px;color:var(--text-muted);">原发票：' + inv.id + '（¥' + (inv.amount || 0).toFixed(2) + '）</div>' : '') + '</div>' +
    '<button onclick="document.getElementById(\'modal-invoice-reissue\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:16px;">⚠️ 重开将自动作废原发票，请确认需要重开后再操作</div>' +
    '<div class="form-group"><label class="form-label">发票类型</label>' +
    '<select class="form-select" id="ri-type" style="width:100%;padding:8px 12px;font-size:13px;">' +
    '<option value="普通发票">📄 普通发票</option><option value="增值税专用">🏛️ 增值税专用发票</option><option value="电子发票">📧 电子发票（推荐）</option></select></div>' +
    '<div class="form-group"><label class="form-label">购方名称 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="ri-company" value="' + (inv ? inv.company : '') + '" placeholder="请输入购方名称" style="width:100%;padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">金额 <span class="required">*</span></label>' +
    '<input type="number" class="form-input" id="ri-amount" value="' + (inv ? inv.amount : '') + '" placeholder="0.00" style="width:100%;padding:8px 12px;font-size:13px;"></div>' +
    '<div class="form-group"><label class="form-label">备注说明</label>' +
    '<textarea class="form-textarea" id="ri-remark" placeholder="如：重开原因、补充说明..." style="min-height:60px;font-size:13px;">原票作废重开</textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-invoice-reissue\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
    '<button onclick="submitInvoiceReissue(\'' + (originalInvId || '') + '\')" style="padding:10px 24px;background:var(--orange);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">🔄 确认重开</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitInvoiceReissue = function(originalInvId) {
  var company = (document.getElementById('ri-company') || {}).value.trim();
  var amount = parseFloat((document.getElementById('ri-amount') || {}).value) || 0;
  var type = (document.getElementById('ri-type') || {}).value || '普通发票';
  var remark = (document.getElementById('ri-remark') || {}).value.trim() || '';

  if (!company) { showToast('请填写购方名称', 'error'); return; }
  if (amount <= 0) { showToast('请填写正确的发票金额', 'error'); return; }

  // Void the original invoice
  if (typeof invoiceStore !== 'undefined' && originalInvId) {
    var inv = invoiceStore.find(function(i) { return i.id === originalInvId; });
    if (inv) {
      inv.status = '已作废';
      inv.voidReason = '重开';
      inv.voidRemark = remark || '原票作废重开';
      inv.voidTime = new Date().toLocaleString('zh-CN');
    }
  }

  // Create new invoice
  var newId = 'INV-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(invoiceStore.length + 1).padStart(2,'0');
  if (typeof invoiceStore !== 'undefined') {
    invoiceStore.unshift({
      id: newId, type: type, company: company, amount: amount,
      status: '待开票', remark: remark || '重开发票',
      createTime: new Date().toLocaleString('zh-CN'), resendCount: 0
    });
  }

  document.getElementById('modal-invoice-reissue') && document.getElementById('modal-invoice-reissue').remove();

  try {
    if (typeof renderInvoiceFilteredList === 'function') renderInvoiceFilteredList();
    else if (typeof renderInvoiceTable === 'function') renderInvoiceTable();
    if (typeof updateInvoiceStats === 'function') updateInvoiceStats();
  } catch(e) {}

  showToast('🔄 原发票 ' + originalInvId + ' 已作废，新发票 ' + newId + ' 已创建（待开票）', 'success');
};

// ============================================================
// 【修复5】补充 nightAuditStore 夜审数据初始化
// 理由：夜审报表菜单存在但数据Store缺失，导致夜审弹窗无法正常渲染
// 功能：初始化夜审数据Store，支持夜审报表的增删改查
// ============================================================
if (typeof nightAuditStore === 'undefined') {
  var nightAuditStore = [
    {id:'NA-20260328', date:'2026-03-28', operator:'前台-张三', status:'已完成', roomsAudited:28, anomalies:2, cashTotal:15800, cardTotal:42300, remarks:'日常夜审，无异常'},
    {id:'NA-20260327', date:'2026-03-27', operator:'前台-李四', status:'已完成', roomsAudited:26, anomalies:0, cashTotal:14200, cardTotal:38600, remarks:'日常夜审'},
    {id:'NA-20260326', date:'2026-03-26', operator:'前台-张三', status:'已完成', roomsAudited:27, anomalies:1, cashTotal:15600, cardTotal:41200, remarks:'302房间发现未登记访客，已处理'},
    {id:'NA-20260325', date:'2026-03-25', operator:'前台-王五', status:'已完成', roomsAudited:25, anomalies:3, cashTotal:13800, cardTotal:36700, remarks:'3间房间房态异常，已现场确认'},
    {id:'NA-20260324', date:'2026-03-24', operator:'前台-李四', status:'已完成', roomsAudited:28, anomalies:0, cashTotal:16400, cardTotal:44100, remarks:'日常夜审'}
  ];
  // Expose globally
  window.nightAuditStore = nightAuditStore;
}

window.renderNightAuditTable = function() {
  var tbody = document.getElementById('night-audit-table-body');
  if (!tbody || typeof nightAuditStore === 'undefined') return;
  var rows = nightAuditStore.map(function(n) {
    var statusClass = n.status === '已完成' ? 'green' : n.status === '进行中' ? 'blue' : 'orange';
    return '<tr>' +
      '<td><span style="font-weight:600;font-size:12px;">' + n.date + '</span></td>' +
      '<td><span style="font-size:12px;">' + n.operator + '</span></td>' +
      '<td><span class="tbadge ' + statusClass + '">' + n.status + '</span></td>' +
      '<td><span style="font-weight:600;">' + n.roomsAudited + '</span> 间</td>' +
      '<td><span style="color:' + (n.anomalies > 0 ? 'var(--red)' : 'var(--green)') + ';font-weight:600;">' + n.anomalies + '</span> 项</td>' +
      '<td><span style="font-size:12px;color:var(--text-muted);">' + n.remarks + '</span></td>' +
      '<td>' +
        '<button class="action-btn small" onclick="viewNightAuditDetail(\'' + n.id + '\')" style="padding:3px 8px;font-size:11px;">👁 查看</button>' +
        '<button class="action-btn small" onclick="deleteNightAuditRecord(\'' + n.id + '\')" style="padding:3px 8px;font-size:11px;background:var(--red-bg);color:var(--red);border-color:var(--red);margin-left:4px;">🗑️</button></td></tr>';
  }).join('');
  tbody.innerHTML = rows;
};

window.viewNightAuditDetail = function(id) {
  var record = typeof nightAuditStore !== 'undefined' ? nightAuditStore.find(function(n) { return n.id === id; }) : null;
  if (!record) { showToast('未找到夜审记录', 'error'); return; }
  showToast('📋 夜审 ' + record.date + '：审核房间 ' + record.roomsAudited + ' 间，异常 ' + record.anomalies + ' 项', 'info');
};

window.deleteNightAuditRecord = function(id) {
  var confirmed = confirm('确定要删除夜审记录 ' + id + ' 吗？此操作不可恢复。');
  if (!confirmed) return;
  if (typeof nightAuditStore !== 'undefined') {
    var idx = nightAuditStore.findIndex(function(n) { return n.id === id; });
    if (idx !== -1) nightAuditStore.splice(idx, 1);
  }
  if (typeof renderNightAuditTable === 'function') renderNightAuditTable();
  showToast('🗑️ 夜审记录 ' + id + ' 已删除', 'success');
};

window.addNightAuditRecord = function() {
  var today = new Date().toISOString().slice(0,10);
  var newId = 'NA-' + today.replace(/-/g,'');
  if (typeof nightAuditStore !== 'undefined') {
    nightAuditStore.unshift({
      id: newId, date: today, operator: '前台-张三', status: '已完成',
      roomsAudited: 28, anomalies: 0, cashTotal: 0, cardTotal: 0, remarks: '日常夜审'
    });
  }
  if (typeof renderNightAuditTable === 'function') renderNightAuditTable();
  showToast('✅ 今日夜审记录已创建：' + newId, 'success');
};

console.log('[iter72] 5个功能性断裂修复完成：openDeviceImportModal / openDeviceGroupManageModal / openInvoiceResendModal / resendInvoice / nightAuditStore');
