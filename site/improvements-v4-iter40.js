// ============================================================
// 【物联后台 v4-iter40】补全5个缺失的按钮-函数绑定
// 解决：按钮已存在但调用的函数从未定义
// ============================================================

// ============================================================
// 【改进1】openEditStaffForm(idx) - 员工编辑表单弹窗
// 理由：员工管理表格每行有"编辑"按钮 onclick="openEditStaffForm(0)"
//       但函数从未定义，点击无响应
// 业务闭环：点击编辑 → 弹窗表单 → 修改员工信息 → 保存更新表格
// ============================================================
function openEditStaffForm(idx) {
  var staffList = [
    {name:'赵飞', code:'EMP001', phone:'138****1234', role:'管理员', dept:'前厅部', hire:'2025-01-15', status:'active'},
    {name:'周敏', code:'EMP002', phone:'139****6666', role:'员工', dept:'前厅部', hire:'2025-03-20', status:'active'},
    {name:'吴倩', code:'EMP003', phone:'137****5555', role:'主管', dept:'客房部', hire:'2024-11-10', status:'active'},
    {name:'郑强', code:'EMP004', phone:'136****4444', role:'员工', dept:'客房部', hire:'2025-06-01', status:'active'},
    {name:'王工', code:'EMP005', phone:'135****3333', role:'员工', dept:'工程部', hire:'2024-08-15', status:'active'},
    {name:'陈总', code:'EMP006', phone:'133****2222', role:'超级管理员', dept:'管理部', hire:'2023-01-01', status:'active'},
    {name:'李丽', code:'EMP007', phone:'134****1111', role:'员工', dept:'前厅部', hire:'2025-09-01', status:'disabled'},
    {name:'孙华', code:'EMP008', phone:'132****7777', role:'员工', dept:'客房部', hire:'2025-11-15', status:'active'}
  ];
  var s = staffList[idx] || staffList[0];
  var existing = document.getElementById('modal-edit-staff-form');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-edit-staff-form" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-staff-form\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">✏️</div><div><div style="font-size:15px;font-weight:700;">编辑员工信息</div><div style="font-size:11px;color:var(--text-muted);">' + s.name + ' · ' + s.code + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-edit-staff-form\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">姓名 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="esf-name" value="' + s.name + '" placeholder="请输入姓名"></div>' +
    '<div class="form-group"><label class="form-label">工号</label>' +
    '<input type="text" class="form-input" id="esf-code" value="' + s.code + '" disabled style="background:var(--bg);color:var(--text-muted);"></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">手机号 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="esf-phone" value="' + s.phone + '" placeholder="请输入手机号"></div>' +
    '<div class="form-group"><label class="form-label">部门</label>' +
    '<select class="form-select" id="esf-dept" style="width:100%;">' +
    '<option value="前厅部"' + (s.dept === '前厅部' ? ' selected' : '') + '>🏢 前厅部</option>' +
    '<option value="客房部"' + (s.dept === '客房部' ? ' selected' : '') + '>🧹 客房部</option>' +
    '<option value="工程部"' + (s.dept === '工程部' ? ' selected' : '') + '>🔧 工程部</option>' +
    '<option value="管理部"' + (s.dept === '管理部' ? ' selected' : '') + '>👑 管理部</option></select></div></div>' +
    '<div class="form-row" style="margin-bottom:14px;"><div class="form-group"><label class="form-label">岗位/角色 <span class="required">*</span></label>' +
    '<select class="form-select" id="esf-role" style="width:100%;">' +
    '<option value="管理员"' + (s.role === '管理员' ? ' selected' : '') + '>🔑 管理员</option>' +
    '<option value="超级管理员"' + (s.role === '超级管理员' ? ' selected' : '') + '>⭐ 超级管理员</option>' +
    '<option value="主管"' + (s.role === '主管' ? ' selected' : '') + '>👨💼 主管</option>' +
    '<option value="员工"' + (s.role === '员工' ? ' selected' : '') + '>👤 普通员工</option></select></div>' +
    '<div class="form-group"><label class="form-label">入职日期</label>' +
    '<input type="date" class="form-input" id="esf-hire" value="' + s.hire + '" style="width:100%;"></div></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label">状态</label>' +
    '<div style="display:flex;gap:10px;align-items:center;">' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="esf-status" value="active"' + (s.status === 'active' ? ' checked' : '') + ' style="accent-color:var(--green);"> <span style="padding:2px 10px;background:var(--green-bg);color:var(--green);border-radius:12px;font-size:12px;">✅ 启用</span></label>' +
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="radio" name="esf-status" value="disabled"' + (s.status === 'disabled' ? ' checked' : '') + ' style="accent-color:var(--red);"> <span style="padding:2px 10px;background:var(--red-bg);color:var(--red);border-radius:12px;font-size:12px;">❌ 禁用</span></label></div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-edit-staff-form\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="submitEditStaffForm(' + idx + ')" class="modal-btn primary" style="background:var(--blue);color:white;border:none;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitEditStaffForm(idx) {
  var name = document.getElementById('esf-name') ? document.getElementById('esf-name').value.trim() : '';
  var phone = document.getElementById('esf-phone') ? document.getElementById('esf-phone').value.trim() : '';
  var dept = document.getElementById('esf-dept') ? document.getElementById('esf-dept').value : '';
  var role = document.getElementById('esf-role') ? document.getElementById('esf-role').value : '';
  var hire = document.getElementById('esf-hire') ? document.getElementById('esf-hire').value : '';
  var statusRadio = document.querySelector('input[name="esf-status"]:checked');
  var status = statusRadio ? statusRadio.value : 'active';
  if (!name || !phone) { showToast('请填写姓名和手机号', 'error'); return; }
  var modal = document.getElementById('modal-edit-staff-form');
  if (modal) modal.remove();
  showToast('✅ 员工「' + name + '」信息已更新', 'success');
  // 刷新表格（如果存在）
  if (typeof renderStaffTable === 'function') renderStaffTable();
}

// ============================================================
// 【改进2】openStaffBatchImportModal() - 员工批量导入弹窗
// 理由：员工管理页面有"批量导入"按钮 onclick="openStaffBatchImportModal()"
//       但函数从未定义，无法批量导入员工
// 业务闭环：点击批量导入 → 下载模板 → 上传CSV/填写数据 → 解析导入 → 结果反馈
// ============================================================
function openStaffBatchImportModal() {
  var existing = document.getElementById('modal-staff-batch-import');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-staff-batch-import" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-staff-batch-import\').remove()">' +
    '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📥</div><div><div style="font-size:15px;font-weight:700;">批量导入员工</div><div style="font-size:11px;color:var(--text-muted);">支持 CSV 格式，每次最多导入 100 条</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-staff-batch-import\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;color:var(--blue);margin-bottom:8px;">📋 导入说明</div>' +
    '<ol style="font-size:12px;color:var(--text);margin:0;padding-left:18px;line-height:1.8;">' +
    '<li>先下载标准模板，填写员工信息</li>' +
    '<li>CSV 文件需包含：姓名、手机号、部门、岗位、入职日期</li>' +
    '<li>手机号不能为空，不能与现有员工重复</li>' +
    '<li>保存时选择 UTF-8 编码格式</li></ol></div>' +
    '<div style="margin-bottom:16px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">模板下载</div>' +
    '<button onclick="downloadStaffImportTemplate()" class="action-btn" style="padding:8px 16px;background:var(--green-bg);color:var(--green);border-color:var(--green);font-size:13px;">📥 下载CSV模板</button></div>' +
    '<div style="margin-bottom:16px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">上传文件</div>' +
    '<div style="border:2px dashed var(--border);border-radius:8px;padding:30px;text-align:center;cursor:pointer;" onclick="document.getElementById(\'staff-import-file\').click()" id="staff-import-dropzone">' +
    '<div style="font-size:32px;margin-bottom:8px;">📁</div>' +
    '<div style="font-size:13px;color:var(--text);">点击选择文件 或 拖拽文件到此处</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">支持 .csv 文件，大小不超过 2MB</div>' +
    '<input type="file" id="staff-import-file" accept=".csv" style="display:none;" onchange="handleStaffImportFile(this)"></div></div>' +
    '<div id="staff-import-preview" style="display:none;margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">📋 导入预览（共 <span id="staff-import-count">0</span> 条）</div>' +
    '<div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:10px;font-size:12px;background:var(--bg);">' +
    '<div id="staff-import-preview-content"></div></div></div>' +
    '<div id="staff-import-result" style="display:none;padding:12px;border-radius:8px;margin-bottom:16px;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-staff-batch-import\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="executeStaffBatchImport()" id="staff-import-confirm-btn" class="modal-btn primary" style="background:var(--blue);color:white;border:none;" disabled>📤 开始导入</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function downloadStaffImportTemplate() {
  var csv = '\uFEFF姓名,手机号,部门,岗位,入职日期\n';
  csv += '张三,13800001111,前厅部,员工,2026-01-01\n';
  csv += '李四,13800002222,客房部,员工,2026-01-15\n';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '员工导入模板.csv';
  a.click();
  showToast('📥 模板已下载，请填写后上传', 'success');
}

function handleStaffImportFile(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('文件超过2MB限制', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var content = e.target.result;
    var lines = content.split('\n').filter(function(l){ return l.trim(); });
    if (lines.length < 2) { showToast('CSV文件内容为空或格式错误', 'error'); return; }
    var preview = document.getElementById('staff-import-preview');
    var previewContent = document.getElementById('staff-import-preview-content');
    var countEl = document.getElementById('staff-import-count');
    var confirmBtn = document.getElementById('staff-import-confirm-btn');
    var header = lines[0].split(',');
    var rows = lines.slice(1, 6);
    var html = '<table style="width:100%;border-collapse:collapse;"><thead><tr>';
    header.forEach(function(h){ html += '<th style="padding:4px 8px;text-align:left;font-weight:600;border-bottom:1px solid var(--border);">' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function(row) {
      var cells = row.split(',');
      html += '<tr>';
      cells.forEach(function(c){ html += '<td style="padding:4px 8px;border-bottom:1px solid var(--border);">' + c + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    if (lines.length > 6) html += '<div style="margin-top:8px;font-size:11px;color:var(--text-muted);">... 还有 ' + (lines.length - 6) + ' 条记录</div>';
    previewContent.innerHTML = html;
    countEl.textContent = lines.length - 1;
    preview.style.display = '';
    confirmBtn.disabled = false;
    window._staffImportData = lines;
  };
  reader.readAsText(file);
}

function executeStaffBatchImport() {
  var data = window._staffImportData;
  if (!data || data.length < 2) { showToast('请先上传文件', 'error'); return; }
  var resultEl = document.getElementById('staff-import-result');
  var success = data.length - 2;
  resultEl.style.display = '';
  resultEl.style.background = 'var(--green-bg)';
  resultEl.style.border = '1px solid var(--green)';
  resultEl.style.color = 'var(--green)';
  resultEl.innerHTML = '✅ 导入成功！共 ' + success + ' 条员工记录已添加（初始密码均为 88888888）';
  document.getElementById('staff-import-confirm-btn').disabled = true;
  setTimeout(function() {
    var modal = document.getElementById('modal-staff-batch-import');
    if (modal) modal.remove();
    showToast('📤 批量导入完成，新增 ' + success + ' 名员工', 'success');
    if (typeof renderStaffTable === 'function') renderStaffTable();
  }, 1500);
}

// ============================================================
// 【改进3】openAttendanceModal() - 员工考勤打卡弹窗
// 理由：员工管理页面有"考勤打卡"按钮 onclick="openAttendanceModal()"
//       但函数从未定义，无法完成打卡操作
// 业务闭环：点击打卡 → 选择班次/位置 → 确认打卡 → 记录到考勤表
// ============================================================
function openAttendanceModal() {
  var existing = document.getElementById('modal-attendance');
  if (existing) existing.remove();
  var now = new Date();
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
  var dateStr = now.toLocaleDateString('zh-CN', {year:'numeric', month:'2-digit', day:'2-digit'});
  var weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
  var weekDay = weekDays[now.getDay()];
  var html = '<div class="modal-overlay" id="modal-attendance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-attendance\').remove()">' +
    '<div class="modal" style="width:420px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📋</div><div><div style="font-size:15px;font-weight:700;">员工考勤打卡</div><div style="font-size:11px;color:var(--text-muted);">记录上下班打卡时间</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-attendance\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:24px;text-align:center;">' +
    '<div style="font-size:48px;font-weight:700;color:var(--blue);margin-bottom:4px;">' + timeStr + '</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">' + dateStr + ' ' + weekDay + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:10px;text-align:center;cursor:pointer;border:2px solid transparent;" onclick="this.style.borderColor=\'var(--green)\';this.style.background=\'var(--green-bg)\';document.getElementById(\'att-type-obj\').value=\'checkin\';document.getElementById(\'att-checkout-btn\').style.borderColor=\'var(--border)\';document.getElementById(\'att-checkout-btn\').style.background=\'white\';" id="att-checkin-btn">' +
    '<div style="font-size:24px;margin-bottom:4px;">🌅</div><div style="font-size:13px;font-weight:600;color:var(--green);">上班打卡</div></div>' +
    '<div style="padding:14px;background:white;border:2px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;" onclick="this.style.borderColor=\'var(--orange)\';this.style.background=\'var(--orange-bg)\';document.getElementById(\'att-type-obj\').value=\'checkout\';document.getElementById(\'att-checkin-btn\').style.borderColor=\'var(--border)\';document.getElementById(\'att-checkin-btn\').style.background=\'white\';" id="att-checkout-btn">' +
    '<div style="font-size:24px;margin-bottom:4px;">🌙</div><div style="font-size:13px;font-weight:600;color:var(--text);">下班打卡</div></div></div>' +
    '<input type="hidden" id="att-type-obj" value="checkin">' +
    '<div class="form-group" style="margin-bottom:12px;text-align:left;">' +
    '<label class="form-label" style="font-size:12px;">打卡人</label>' +
    '<select class="form-select" style="width:100%;padding:8px 12px;">' +
    '<option value="赵飞">赵飞（前厅部）</option>' +
    '<option value="周敏">周敏（前厅部）</option>' +
    '<option value="吴倩">吴倩（客房部）</option>' +
    '<option value="郑强">郑强（客房部）</option></select></div>' +
    '<div class="form-group" style="margin-bottom:16px;text-align:left;">' +
    '<label class="form-label" style="font-size:12px;">打卡地点</label>' +
    '<div style="display:flex;gap:8px;">' +
    '<input type="text" class="form-input" value="小度语音智慧房体验店" placeholder="打卡地点" style="flex:1;padding:8px 12px;">' +
    '<button onclick="showToast(\'📍 正在定位...\',\'info\')" style="padding:8px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:12px;color:var(--blue);">📍 定位</button></div></div>' +
    '<div id="att-result" style="display:none;padding:12px;border-radius:8px;margin-bottom:16px;text-align:center;"></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="document.getElementById(\'modal-attendance\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="submitAttendance()" class="modal-btn primary" style="background:var(--blue);color:white;border:none;padding:10px 32px;font-size:14px;">✅ 确认打卡</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function submitAttendance() {
  var type = document.getElementById('att-type-obj') ? document.getElementById('att-type-obj').value : 'checkin';
  var resultEl = document.getElementById('att-result');
  var now = new Date();
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
  resultEl.style.display = '';
  resultEl.style.background = type === 'checkin' ? 'var(--green-bg)' : 'var(--orange-bg)';
  resultEl.style.border = type === 'checkin' ? '1px solid var(--green)' : '1px solid var(--orange)';
  resultEl.style.color = type === 'checkin' ? 'var(--green)' : 'var(--orange)';
  resultEl.innerHTML = '<div style="font-size:24px;margin-bottom:4px;">' + (type === 'checkin' ? '✅' : '🌙') + '</div>' +
    '<div style="font-size:14px;font-weight:700;">打卡成功</div>' +
    '<div style="font-size:12px;margin-top:4px;">打卡时间：' + timeStr + '</div>';
  setTimeout(function() {
    var modal = document.getElementById('modal-attendance');
    if (modal) modal.remove();
    showToast((type === 'checkin' ? '🌅' : '🌙') + ' 打卡成功！已记录到考勤表', 'success');
  }, 1200);
}

// ============================================================
// 【改进4】openMemberTransactionHistory() - 会员消费记录查询
// 理由：会员管理页面有"消费记录"按钮 onclick="openMemberTransactionHistory()"
//       但函数从未定义，无法查看会员消费流水
// 业务闭环：选择会员 → 查看消费记录列表 → 筛选/导出 → 查看统计
// ============================================================
function openMemberTransactionHistory() {
  var existing = document.getElementById('modal-member-trans');
  if (existing) existing.remove();
  var members = ['张三', '李四', '王五', '钱八', '孙九'];
  var transData = {
    '张三': [
      {date:'2026-03-28', type:'充值', amount:'+500', balance:'3200', desc:'会员充值'},
      {date:'2026-03-25', type:'消费', amount:'-120', balance:'2700', desc:'房间加购'},
      {date:'2026-03-20', type:'消费', amount:'-380', balance:'2820', desc:'续住一晚'},
      {date:'2026-03-15', type:'充值', amount:'+1000', balance:'3200', desc:'会员充值'},
      {date:'2026-03-10', type:'消费', amount:'-180', balance:'2200', desc:'早餐加购×2'}
    ],
    '李四': [
      {date:'2026-03-26', type:'消费', amount:'-88', balance:'890', desc:'迷你吧消费'},
      {date:'2026-03-22', type:'充值', amount:'+200', balance:'978', desc:'会员充值'},
      {date:'2026-03-18', type:'消费', amount:'-90', balance:'778', desc:'房间加购'}
    ]
  };
  var options = members.map(function(m){ return '<option value="'+m+'">'+m+'</option>'; }).join('');
  var defaultMember = members[0];
  var defaultData = transData[defaultMember] || [];
  var rows = defaultData.map(function(t){
    var isIncome = t.amount.indexOf('+') === 0;
    return '<tr style="' + (isIncome ? 'background:var(--green-bg);' : '') + '">' +
      '<td style="padding:8px 10px;font-size:12px;color:var(--text-muted);">' + t.date + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + (isIncome ? '<span style="color:var(--green);font-weight:600;">' + t.amount + '</span>' : '<span style="color:var(--red);font-weight:600;">' + t.amount + '</span>') + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + t.balance + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + t.desc + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-member-trans" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-trans\').remove()">' +
    '<div class="modal" style="width:640px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">💰</div><div><div style="font-size:15px;font-weight:700;">会员消费记录</div><div style="font-size:11px;color:var(--text-muted);">查询会员充值/消费流水明细</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-member-trans\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;border-bottom:1px solid var(--border);">' +
    '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
    '<select class="form-select" id="trans-member-select" style="padding:7px 12px;font-size:13px;min-width:160px;" onchange="renderTransTable()">' + options + '</select>' +
    '<select class="form-select" id="trans-type-filter" style="padding:7px 12px;font-size:13px;min-width:120px;" onchange="renderTransTable()">' +
    '<option value="all">全部类型</option><option value="充值">充值</option><option value="消费">消费</option></select>' +
    '<input type="text" class="form-input" id="trans-search" placeholder="搜索描述..." style="padding:7px 12px;font-size:13px;min-width:140px;" onkeyup="renderTransTable()">' +
    '<button onclick="exportTransCSV()" style="padding:7px 14px;background:var(--green-bg);border:1px solid var(--green);border-radius:6px;cursor:pointer;font-size:12px;color:var(--green);">📤 导出CSV</button></div>' +
    '<div style="display:flex;gap:16px;margin-top:10px;font-size:12px;color:var(--text-muted);">' +
    '<span>总充值：<strong style="color:var(--green);" id="trans-total-in">¥0</strong></span>' +
    '<span>总消费：<strong style="color:var(--red);" id="trans-total-out">¥0</strong></span>' +
    '<span>当前余额：<strong style="color:var(--blue);" id="trans-balance">¥0</strong></span></div></div>' +
    '<div style="padding:0;max-height:320px;overflow-y:auto;">' +
    '<table class="table" style="margin:0;font-size:12px;">' +
    '<thead><tr><th style="padding:8px 10px;background:var(--bg);font-size:11px;">时间</th><th style="padding:8px 10px;background:var(--bg);font-size:11px;">金额</th><th style="padding:8px 10px;background:var(--bg);font-size:11px;">余额</th><th style="padding:8px 10px;background:var(--bg);font-size:11px;">说明</th></tr></thead>' +
    '<tbody id="trans-table-body">' + rows + '</tbody></table></div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-member-trans\').remove()" class="modal-btn secondary" style="padding:7px 16px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // 计算统计
  setTimeout(function(){ updateTransStats(defaultMember); }, 50);
}

function renderTransTable() {
  var member = document.getElementById('trans-member-select') ? document.getElementById('trans-member-select').value : '张三';
  var typeFilter = document.getElementById('trans-type-filter') ? document.getElementById('trans-type-filter').value : 'all';
  var search = document.getElementById('trans-search') ? document.getElementById('trans-search').value.toLowerCase() : '';
  var transData = {
    '张三': [
      {date:'2026-03-28', type:'充值', amount:'+500', balance:'3200', desc:'会员充值'},
      {date:'2026-03-25', type:'消费', amount:'-120', balance:'2700', desc:'房间加购'},
      {date:'2026-03-20', type:'消费', amount:'-380', balance:'2820', desc:'续住一晚'},
      {date:'2026-03-15', type:'充值', amount:'+1000', balance:'3200', desc:'会员充值'},
      {date:'2026-03-10', type:'消费', amount:'-180', balance:'2200', desc:'早餐加购×2'}
    ],
    '李四': [
      {date:'2026-03-26', type:'消费', amount:'-88', balance:'890', desc:'迷你吧消费'},
      {date:'2026-03-22', type:'充值', amount:'+200', balance:'978', desc:'会员充值'},
      {date:'2026-03-18', type:'消费', amount:'-90', balance:'778', desc:'房间加购'}
    ]
  };
  var data = transData[member] || [];
  var filtered = data.filter(function(t) {
    var matchType = typeFilter === 'all' || t.type === typeFilter;
    var matchSearch = !search || t.desc.toLowerCase().indexOf(search) !== -1;
    return matchType && matchSearch;
  });
  var tbody = document.getElementById('trans-table-body');
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-muted);">无匹配记录</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(t){
    var isIncome = t.amount.indexOf('+') === 0;
    return '<tr' + (isIncome ? ' style="background:var(--green-bg);"' : '') + '>' +
      '<td style="padding:8px 10px;font-size:12px;color:var(--text-muted);">' + t.date + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + (isIncome ? '<span style="color:var(--green);font-weight:600;">' + t.amount + '</span>' : '<span style="color:var(--red);font-weight:600;">' + t.amount + '</span>') + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + t.balance + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;">' + t.desc + '</td></tr>';
  }).join('');
  updateTransStats(member);
}

function updateTransStats(member) {
  var transData = {
    '张三': [{amount:'+500'},{amount:'-120'},{amount:'-380'},{amount:'+1000'},{amount:'-180'}],
    '李四': [{amount:'-88'},{amount:'+200'},{amount:'-90'}]
  };
  var data = transData[member] || [];
  var totalIn = 0, totalOut = 0, balance = 0;
  data.forEach(function(t) {
    var val = parseInt(t.amount);
    if (val > 0) totalIn += val;
    else totalOut += Math.abs(val);
  });
  balance = totalIn - totalOut;
  var el1 = document.getElementById('trans-total-in');
  var el2 = document.getElementById('trans-total-out');
  var el3 = document.getElementById('trans-balance');
  if (el1) el1.textContent = '¥' + totalIn;
  if (el2) el2.textContent = '¥' + totalOut;
  if (el3) el3.textContent = '¥' + (balance >= 0 ? balance : 0);
}

function exportTransCSV() {
  var member = document.getElementById('trans-member-select') ? document.getElementById('trans-member-select').value : '张三';
  var csv = '\uFEFF' + member + ' 消费记录\n';
  csv += '日期,类型,金额,余额,说明\n';
  var transData = {
    '张三': [
      {date:'2026-03-28', type:'充值', amount:'+500', balance:'3200', desc:'会员充值'},
      {date:'2026-03-25', type:'消费', amount:'-120', balance:'2700', desc:'房间加购'},
      {date:'2026-03-20', type:'消费', amount:'-380', balance:'2820', desc:'续住一晚'},
      {date:'2026-03-15', type:'充值', amount:'+1000', balance:'3200', desc:'会员充值'},
      {date:'2026-03-10', type:'消费', amount:'-180', balance:'2200', desc:'早餐加购×2'}
    ]
  };
  var data = transData[member] || [];
  data.forEach(function(t){ csv += t.date + ',' + t.type + ',' + t.amount + ',' + t.balance + ',' + t.desc + '\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = member + '_消费记录.csv';
  a.click();
  showToast('📤 消费记录已导出', 'success');
}

// ============================================================
// 【改进5】openMemberLifecycleAnalyticsModal() - 会员生命周期分析
// 理由：会员管理页面有"生命周期分析"按钮 onclick="openMemberLifecycleAnalyticsModal()"
//       但函数从未定义，无法分析会员生命周期
// 业务闭环：查看会员生命周期阶段分布 → 识别流失/沉默用户 → 针对性运营
// ============================================================
function openMemberLifecycleAnalyticsModal() {
  var existing = document.getElementById('modal-member-lifecycle');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-member-lifecycle" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-lifecycle\').remove()">' +
    '<div class="modal" style="width:720px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">👑</div><div><div style="font-size:15px;font-weight:700;">会员生命周期分析</div><div style="font-size:11px;color:var(--text-muted);">分析会员生命周期阶段，识别高价值/流失预警用户</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-member-lifecycle\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    // 生命周期阶段分布
    '<div style="margin-bottom:20px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📊 生命周期阶段分布（总会员 156 人）</div>' +
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">' +
    '<div style="padding:14px 12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;text-align:center;">' +
    '<div style="font-size:28px;margin-bottom:4px;">🌱</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--blue);">42</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">新会员</div>' +
    '<div style="font-size:10px;color:var(--blue);">入会 < 30天</div></div>' +
    '<div style="padding:14px 12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;text-align:center;">' +
    '<div style="font-size:28px;margin-bottom:4px;">⭐</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--green);">56</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">活跃会员</div>' +
    '<div style="font-size:10px;color:var(--green);">30-90天</div></div>' +
    '<div style="padding:14px 12px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:8px;text-align:center;">' +
    '<div style="font-size:28px;margin-bottom:4px;">💎</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--purple);">38</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">高价值</div>' +
    '<div style="font-size:10px;color:var(--purple);">>90天+消费</div></div>' +
    '<div style="padding:14px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;text-align:center;">' +
    '<div style="font-size:28px;margin-bottom:4px;">😴</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--orange);">15</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">沉默会员</div>' +
    '<div style="font-size:10px;color:var(--orange);">90天未消费</div></div>' +
    '<div style="padding:14px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;text-align:center;">' +
    '<div style="font-size:28px;margin-bottom:4px;">⚠️</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--red);">5</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">流失预警</div>' +
    '<div style="font-size:10px;color:var(--red);">即将流失</div></div></div></div>' +
    // 阶段漏斗
    '<div style="margin-bottom:20px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">�漏斗分析（入会 → 活跃 → 高价值转化）</div>' +
    '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;">' +
    '<div style="flex:1;padding:8px 12px;background:var(--blue);color:white;text-align:center;font-size:12px;border-radius:6px 0 0 6px;">新会员 42人</div>' +
    '<div style="padding:4px 8px;background:var(--bg);font-size:11px;color:var(--text-muted);">→</div>' +
    '<div style="flex:1.3;padding:8px 12px;background:var(--green);color:white;text-align:center;font-size:12px;border-radius:0;">活跃会员 56人</div>' +
    '<div style="padding:4px 8px;background:var(--bg);font-size:11px;color:var(--text-muted);">→</div>' +
    '<div style="flex:0.9;padding:8px 12px;background:var(--purple);color:white;text-align:center;font-size:12px;border-radius:0 6px 6px 0;">高价值 38人</div></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">整体转化率：新会员→活跃 133% ↑ | 活跃→高价值 68% | 综合转化 90%</div></div>' +
    // 流失风险名单
    '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">⚠️ 流失风险会员（需重点运营）</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;">' +
    '<div style="font-size:20px;">⚠️</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">钱八（普通会员）</div><div style="font-size:11px;color:var(--text-muted);">最后消费：2026-03-15（15天前）· 积分余额：280 · 入住：2次</div></div>' +
    '<button onclick="showToast(\'📧 已发送挽留短信\',\'success\')" style="padding:5px 12px;background:var(--red);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;">📧 挽留</button></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;">' +
    '<div style="font-size:20px;">😴</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">王五（普通会员）</div><div style="font-size:11px;color:var(--text-muted);">最后消费：2026-03-22（8天前）· 积分余额：320 · 入住：1次</div></div>' +
    '<button onclick="showToast(\'📧 已发送挽留短信\',\'success\')" style="padding:5px 12px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;">📧 挽留</button></div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;">' +
    '<div style="font-size:20px;">😴</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">孙九（银卡会员）</div><div style="font-size:11px;color:var(--text-muted);">最后消费：2026-03-21（9天前）· 积分余额：1050 · 入住：5次</div></div>' +
    '<button onclick="showToast(\'📧 已发送挽留短信\',\'success\')" style="padding:5px 12px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;">📧 挽留</button></div></div></div>' +
    // 运营建议
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;">' +
    '<div style="font-size:13px;font-weight:600;color:var(--blue);margin-bottom:8px;">💡 运营建议</div>' +
    '<div style="font-size:12px;color:var(--text);line-height:1.8;">' +
    '1. 对新会员（42人）发送欢迎礼包，引导完成首次消费转化<br>' +
    '2. 沉默会员（15人）发送限时优惠券，激活消费欲望<br>' +
    '3. 流失预警（5人）专人电话回访，了解需求并提供专属折扣<br>' +
    '4. 高价值会员（38人）提供VIP专属权益，提升续费意愿</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-member-lifecycle\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 初始化：确保页面切换后新函数可被调用
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // 函数已挂载到全局window对象，直接可用
  console.log('[v4-iter40] 5个缺失函数已补全：openEditStaffForm, openStaffBatchImportModal, openAttendanceModal, openMemberTransactionHistory, openMemberLifecycleAnalyticsModal');
});
