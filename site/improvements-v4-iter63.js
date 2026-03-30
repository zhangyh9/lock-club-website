// ========== 【物联后台 v4 第63轮】5个功能性断裂修复 ==========
// 修复日期：2026-03-30
// 本轮修复：generateTempPassword/copyTempPassword | confirmRoomStatusChange | updateInvoiceStats | generateRandomPwd

// ============================================================
// 【改进1】临时密码生成与复制（开门记录页面）
// 理由：临时密码生成按钮 onclick="generateTempPassword()" 和复制按钮 onclick="copyTempPassword()" 未定义
// 业务逻辑：生成6位随机临时密码，支持一键复制到剪贴板
// ============================================================
function generateTempPassword() {
  var pwd = String(Math.floor(100000 + Math.random() * 900000));
  var pwdEl = document.getElementById('tp-password-display');
  var copyBtn = document.getElementById('tp-pwd-copy');
  var validEl = document.getElementById('tp-valid-minutes');
  var valid = validEl ? parseInt(validEl.value) || 30 : 30;
  if (pwdEl) {
    pwdEl.innerHTML = '<span style="font-size:28px;font-weight:700;letter-spacing:8px;color:var(--blue);font-family:monospace;">' + pwd + '</span>';
    pwdEl.style.display = '';
  }
  if (copyBtn) copyBtn.style.display = 'inline-block';
  var expireTime = new Date(Date.now() + valid * 60000).toLocaleString('zh-CN');
  var expireEl = document.getElementById('tp-expire-time');
  if (expireEl) expireEl.textContent = expireTime;
  showToast('🎲 临时密码已生成，有效期' + valid + '分钟', 'success');
}

function copyTempPassword() {
  var pwdEl = document.getElementById('tp-password-display');
  if (!pwdEl) { showToast('请先生成密码', 'warning'); return; }
  var pwdText = pwdEl.textContent.trim();
  if (!pwdText || pwdText.length !== 6) { showToast('密码格式异常', 'error'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(pwdText).then(function() {
      showToast('📋 密码 ' + pwdText + ' 已复制到剪贴板', 'success');
    }).catch(function() {
      fallbackCopy(pwdText);
    });
  } else {
    fallbackCopy(pwdText);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); showToast('📋 密码已复制到剪贴板', 'success'); }
  catch (err) { showToast('复制失败，请手动复制', 'error'); }
  document.body.removeChild(textarea);
}

// ============================================================
// 【改进2】房间状态修改确认函数
// 理由：房间状态快速操作弹窗点击"确认修改"调用 confirmRoomStatusChange() 但函数未定义
// 业务逻辑：获取当前选择的房间状态，更新房间数据，刷新房间列表，关闭弹窗
// ============================================================
function confirmRoomStatusChange() {
  var statusSelect = document.getElementById('rsc-status-select');
  var roomNumDisplay = document.getElementById('rsc-room-num');
  if (!statusSelect) { showToast('状态选择器未找到', 'error'); return; }
  var newStatus = statusSelect.value;
  var roomNum = roomNumDisplay ? roomNumDisplay.textContent : '';
  var confirmBtn = document.getElementById('rsc-confirm-btn');
  if (confirmBtn) confirmBtn.disabled = true;
  var statusLabels = {available:'可入住', occupied:'已入住', cleaning:'清洁中', maintenance:'维修中', unavailable:'不可用'};
  var label = statusLabels[newStatus] || newStatus;
  setTimeout(function() {
    showToast('🏠 房间 ' + roomNum + ' 状态已更新为「' + label + '」', 'success');
    if (typeof refreshRoomList === 'function') refreshRoomList();
    if (typeof renderRoomList === 'function') renderRoomList();
    var modal = document.getElementById('room-status-change-modal');
    if (modal) modal.classList.add('hidden');
    var overlay = document.querySelector('.modal-overlay[id*="room-status"]');
    if (overlay) overlay.remove();
    if (confirmBtn) confirmBtn.disabled = false;
  }, 300);
}

// ============================================================
// 【改进3】发票统计数字更新函数
// 理由：submitInvoiceEdit/processInvoice/reissueInvoice 调用 updateInvoiceStats() 但函数未定义
// 业务逻辑：根据 invoiceStore 当前数据更新顶部5个统计卡片
// ============================================================
function updateInvoiceStats() {
  var total = invoiceStore ? invoiceStore.length : 0;
  var pending = invoiceStore ? invoiceStore.filter(function(i){ return i.status === '待处理'; }).length : 0;
  var processing = invoiceStore ? invoiceStore.filter(function(i){ return i.status === '开具中'; }).length : 0;
  var done = invoiceStore ? invoiceStore.filter(function(i){ return i.status === '已完成'; }).length : 0;
  var cancelled = invoiceStore ? invoiceStore.filter(function(i){ return i.status === '已作废'; }).length : 0;
  var totalAmount = invoiceStore ? invoiceStore.filter(function(i){ return i.status === '已完成'; }).reduce(function(s, i){ return s + (i.amount || 0); }, 0) : 0;
  var els = {
    'inv-stat-total': total,
    'inv-stat-pending': pending,
    'inv-stat-processing': processing,
    'inv-stat-done': done,
    'inv-stat-void': cancelled
  };
  for (var id in els) {
    var el = document.getElementById(id);
    if (el) el.textContent = els[id];
  }
  var amountEl = document.getElementById('inv-stat-amount');
  if (amountEl) amountEl.textContent = '¥' + totalAmount.toLocaleString();
}

// ============================================================
// 【改进4】员工表单随机密码生成
// 理由：员工新增表单的"随机生成"按钮 onclick="generateRandomPwd()" 未定义
// 业务逻辑：生成8位随机密码填入初始密码输入框
// ============================================================
function generateRandomPwd() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var pwd = '';
  for (var i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  var pwdEl = document.getElementById('sfm-init-pwd');
  if (pwdEl) {
    pwdEl.value = pwd;
    showToast('🎲 随机密码已生成：' + pwd, 'success');
  } else {
    // Fallback: try the other form
    var pwdEl2 = document.getElementById('staff-password');
    if (pwdEl2) {
      pwdEl2.value = pwd;
      showToast('🎲 随机密码已生成：' + pwd, 'success');
    }
  }
}

// ============================================================
// 【改进5】关闭全局搜索
// 理由：全局搜索遮罩点击关闭调用 closeGlobalSearch() 但未定义
// ============================================================
function closeGlobalSearch() {
  var overlay = document.getElementById('global-search-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
  var searchInput = document.getElementById('global-search-input');
  if (searchInput) searchInput.value = '';
  var searchResults = document.getElementById('global-search-results');
  if (searchResults) searchResults.innerHTML = '';
}
