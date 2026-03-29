// ============================================================
// 物联后台迭代v4-iter21.js - 5个高频功能性断裂修复
// 修复：onclick调用的函数从未定义（存在于HTML但无函数体）
// 完成时间：2026-03-30 04:00
// ============================================================

// -------- 改进1：filterMember - 会员Tab切换过滤（5处调用）--------
window.filterMember = function(level, el) {
  // Update tab active state
  if (el && el.parentElement) {
    el.parentElement.querySelectorAll('.card-tab').forEach(function(t) {
      t.classList.remove('active');
    });
    el.classList.add('active');
  }
  // Get table body
  var tbody = document.getElementById('member-table-body');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr[data-level]');
  var count = 0;
  rows.forEach(function(row) {
    var rowLevel = row.getAttribute('data-level');
    if (level === 'all' || rowLevel === level) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });
  // Update count display
  var countEl = document.getElementById('member-filtered-count');
  if (countEl) countEl.textContent = count + ' 人';
  showToast('已筛选：' + (level === 'all' ? '全部会员' : level + '会员'), 'info');
};

// -------- 改进2：filterStaffTable - 员工Tab切换过滤（5处调用）--------
window.filterStaffTable = function(dept, el) {
  // Update tab active state
  if (el && el.parentElement) {
    el.parentElement.querySelectorAll('.card-tab').forEach(function(t) {
      t.classList.remove('active');
    });
    el.classList.add('active');
  }
  // Get table body
  var tbody = document.getElementById('staff-table-body');
  if (!tbody) tbody = document.querySelector('#page-staff .table tbody');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr[data-dept]');
  var count = 0;
  rows.forEach(function(row) {
    var rowDept = row.getAttribute('data-dept');
    if (dept === 'all' || rowDept === dept) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });
  showToast('已筛选：' + (dept === 'all' ? '全部员工' : dept + '部'), 'info');
};

// -------- 改进3：confirmConfigSave - 系统配置确认保存（3处调用）--------
window.confirmConfigSave = function() {
  // Collect all config values
  var hotelName = document.getElementById('config-hotel-name');
  var hotelAddress = document.getElementById('config-hotel-address');
  var hotelPhone = document.getElementById('config-hotel-phone');
  var checkinTime = document.getElementById('config-checkin-time');
  var checkoutTime = document.getElementById('config-checkout-time');
  var autoLock = document.getElementById('config-auto-lock');
  var节能模式 = document.getElementById('config-energy-mode');
  
  var name = hotelName ? hotelName.value.trim() : '';
  if (!name) {
    showToast('请填写酒店名称', 'error');
    return;
  }
  
  // Show success
  showToast('✅ 系统配置已保存', 'success');
  
  // Close modal if inside one
  var modal = document.querySelector('.modal');
  if (modal && modal.id && modal.id.indexOf('config') !== -1) {
    var overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    else modal.remove();
  }
};

// -------- 改进4：showUnlockDetail - 开锁记录详情弹窗（8处调用）--------
window.showUnlockDetail = function(method, time, person, result) {
  var existing = document.getElementById('modal-unlock-detail');
  if (existing) existing.remove();
  
  var methodIcon = {phone:'📱', card:'💳', remote:'🔓', pwd:'🔢', fingerprint:'👆'}[method] || '🔑';
  var methodLabel = {phone:'手机开锁', card:'门卡开锁', remote:'远程开锁', pwd:'密码开锁', fingerprint:'指纹开锁'}[method] || method;
  var statusColor = result === '成功' ? 'var(--green)' : 'var(--red)';
  var statusBg = result === '成功' ? 'var(--green-bg)' : 'var(--red-bg)';
  
  var html = '<div class="modal-overlay" id="modal-unlock-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-unlock-detail\').remove()">' +
    '<div class="modal" style="width:420px;max-height:80vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">' + methodIcon + '</div><div style="font-size:15px;font-weight:700;">开锁详情</div>' +
    '<button onclick="document.getElementById(\'modal-unlock-detail\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:14px;">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
    '<span style="font-size:24px;">' + methodIcon + '</span>' +
    '<div><div style="font-weight:700;font-size:15px;">' + methodLabel + '</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">' + time + '</div></div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<div><div style="font-size:11px;color:var(--text-muted);">开锁人</div><div style="font-weight:600;font-size:13px;">' + person + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);">开锁方式</div><div style="font-weight:600;font-size:13px;">' + methodLabel + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);">开锁时间</div><div style="font-weight:600;font-size:13px;">' + time + '</div></div>' +
    '<div><div style="font-size:11px;color:var(--text-muted);">开锁结果</div><div style="font-weight:600;font-size:13px;"><span style="padding:2px 8px;background:' + statusBg + ';color:' + statusColor + ';border-radius:4px;font-size:11px;">' + result + '</span></div></div></div></div>' +
    '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);margin-bottom:14px;">💡 如开锁失败，请检查门锁电量和网络信号</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-unlock-detail\').remove()">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进5：openStaffDetailModal - 员工详情弹窗（8处调用）--------
window.openStaffDetailModal = function(idx) {
  var existing = document.getElementById('modal-staff-detail');
  if (existing) existing.remove();
  
  // Staff data (index-based)
  var staffMembers = [
    {name:'赵敏', code:'EMP001', dept:'前厅', role:'前厅经理', phone:'138****0012', status:'在职', checkin:'2024-01-15', shifts:'早班/中班'},
    {name:'周强', code:'EMP002', dept:'前厅', role:'前台接待', phone:'138****0023', status:'在职', checkin:'2024-03-01', shifts:'中班/夜班'},
    {name:'吴静', code:'EMP003', dept:'客房', role:'客房主管', phone:'138****0034', status:'在职', checkin:'2023-11-20', shifts:'早班'},
    {name:'郑伟', code:'EMP004', dept:'客房', role:'保洁员', phone:'138****0045', status:'在职', checkin:'2024-02-10', shifts:'早班'},
    {name:'王工', code:'EMP005', dept:'工程', role:'工程师', phone:'138****0056', status:'在职', checkin:'2023-06-15', shifts:'待班'},
    {name:'刘芳', code:'EMP006', dept:'前厅', role:'前台接待', phone:'138****0067', status:'在职', checkin:'2024-05-01', shifts:'早班/中班'},
    {name:'陈刚', code:'EMP007', dept:'客房', role:'保洁员', phone:'138****0078', status:'在职', checkin:'2024-04-15', shifts:'中班'},
    {name:'林梅', code:'EMP008', dept:'管理', role:'店长', phone:'138****0089', status:'在职', checkin:'2023-01-01', shifts:'行政班'}
  ];
  
  var staff = staffMembers[idx] || staffMembers[0];
  var statusBg = staff.status === '在职' ? 'var(--green-bg)' : 'var(--red-bg)';
  var statusColor = staff.status === '在职' ? 'var(--green)' : 'var(--red)';
  
  var html = '<div class="modal-overlay" id="modal-staff-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-staff-detail\').remove()">' +
    '<div class="modal" style="width:500px;max-height:80vh;overflow-y:auto;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="width:44px;height:44px;background:var(--blue-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>' +
    '<div><div style="font-size:15px;font-weight:700;">' + staff.name + '</div><div style="font-size:11px;color:var(--text-muted);">工号：' + staff.code + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-staff-detail\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:14px;">' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">部门</div><div style="font-weight:600;font-size:13px;">' + staff.dept + '部</div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">职位</div><div style="font-weight:600;font-size:13px;">' + staff.role + '</div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">手机号</div><div style="font-weight:600;font-size:13px;">' + staff.phone + '</div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">在职状态</div><div style="font-weight:600;font-size:13px;"><span style="padding:2px 8px;background:' + statusBg + ';color:' + statusColor + ';border-radius:4px;font-size:11px;">' + staff.status + '</span></div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">入职日期</div><div style="font-weight:600;font-size:13px;">' + staff.checkin + '</div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">值班班次</div><div style="font-weight:600;font-size:13px;">' + staff.shifts + '</div></div></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
    '<button class="action-btn small" onclick="showToast(\'排班表已打开\',\'info\');" style="padding:6px 12px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);">📅 排班表</button>' +
    '<button class="action-btn small" onclick="showToast(\'考勤记录已打开\',\'info\');" style="padding:6px 12px;background:var(--purple-bg);color:var(--purple);border-color:var(--purple);">✅ 考勤记录</button>' +
    '<button class="action-btn small" onclick="showToast(\'发薪记录已打开\',\'info\');" style="padding:6px 12px;background:var(--green-bg);color:var(--green);border-color:var(--green);">💰 发薪记录</button></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-staff-detail\').remove()">关闭</button>' +
    '<button class="modal-btn" onclick="showToast(\'员工信息已修改\',\'success\');" style="background:var(--orange);color:white;border:none;">✏️ 编辑</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};
