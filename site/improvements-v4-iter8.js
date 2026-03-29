// ============================================================
// 【物联后台v4-第14轮】5个功能性断裂修复
// ============================================================
// 本轮修复清单：
// 改进1: goToRoomDetail - 房间快捷面板"记录"按钮调用但函数未定义
// 改进2: cycleHomeTab - 首页Tab轮播只有showToast，需要完整Tab切换
// 改进3: doQuickUnlock - 房间快捷面板"开锁"按钮调用但函数未定义
// 改进4: doQuickTempPwd - 房间快捷面板"密码"按钮调用但函数未定义
// 改进5: doQuickCheckin - 房间快捷面板"入住"按钮调用但函数未定义

// ============================================================
// 【改进1】goToRoomDetail - 房间快捷面板"记录"按钮
// 理由：page-room-quick（房间快捷面板）有"记录"按钮onclick="goToRoomDetail()"但函数未定义
// 改进：跳转到房间详情页的"办理记录"Tab，显示该房间的开锁/入住/换房历史
// ============================================================
window.goToRoomDetail = function() {
  // 获取当前快捷面板对应的房间号
  var roomNum = '301';
  var titleEl = document.getElementById('rqp-room-num');
  if (titleEl) {
    roomNum = titleEl.textContent.replace('房间快捷操作', '').trim() || roomNum;
  }
  // 尝试从当前面板数据获取
  var roomLabel = document.querySelector('#room-quick-panel .detail-title');
  if (roomLabel) {
    var match = roomLabel.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }
  // 导航到房间详情页
  showPage('room-detail');
  showToast('📋 正在加载房间 ' + roomNum + ' 的记录...', 'info');
  // 更新房间详情标题
  setTimeout(function() {
    var rdTitle = document.getElementById('rd-page-title');
    if (rdTitle) rdTitle.textContent = '🚪 房间详情 - ' + roomNum;
    var rdSub = document.getElementById('rd-page-sub');
    if (rdSub) rdSub.textContent = '快捷操作 · ' + roomNum;
    // 切换到办理记录Tab
    var recordTab = document.getElementById('rd-tab-records') || document.querySelector('#room-detail .tab[data-tab="records"]');
    if (recordTab) recordTab.click();
  }, 100);
};

// ============================================================
// 【改进2】cycleHomeTab - 首页Tab轮播/快捷切换
// 理由：首页有cycleHomeTab()调用但只有showToast提示，无实际切换功能
// 改进：实现完整首页Tab快速切换，支持参数方向，支持键盘快捷键Ctrl+左右
// ============================================================
window.cycleHomeTab = function(direction) {
  if (typeof direction === 'undefined') direction = 1;
  var tabs = ['home', 'checkin', 'key', 'hardware', 'workorder', 'energy', 'datacenter'];
  var tabNames = {'home':'首页', 'checkin':'入住', 'key':'钥匙', 'hardware':'硬件物联', 'workorder':'服务工单', 'energy':'能耗分析', 'datacenter':'数据中心'};
  var currentPage = typeof _currentPage !== 'undefined' ? _currentPage : 'home';
  var currentIdx = tabs.indexOf(currentPage);
  if (currentIdx < 0) currentIdx = 0;
  var newIdx = (currentIdx + direction + tabs.length) % tabs.length;
  var newPage = tabs[newIdx];
  showPage(newPage);
  showToast('📍 ' + tabNames[newPage], 'info');
};

// 键盘快捷键：Ctrl/Cmd + 左右方向键 切换首页Tab
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    var dir = e.key === 'ArrowRight' ? 1 : -1;
    cycleHomeTab(dir);
  }
});

// ============================================================
// 【改进3】doQuickUnlock - 房间快捷面板"开锁"按钮
// 理由：房间快捷面板"🔓 开锁"按钮onclick="doQuickUnlock()"但函数未定义
// 改进：弹出开锁确认，显示房间号+发送开锁指令+成功Toast+开锁记录
// ============================================================
window.doQuickUnlock = function() {
  var roomNum = '301';
  var titleEl = document.getElementById('rqp-room-num');
  if (titleEl) {
    var match = titleEl.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }
  var existing = document.getElementById('modal-quick-unlock');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-quick-unlock" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-unlock\').remove()">' +
    '<div class="modal" style="width:380px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:48px;height:48px;background:var(--green-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">🔓</div>' +
    '<div><div style="font-size:15px;font-weight:700;">远程开锁</div><div style="font-size:12px;color:var(--text-muted);">房间号：' + roomNum + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-quick-unlock\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:14px;font-size:12px;color:var(--blue);">📡 正在发送开锁指令到设备，请稍候...</div>' +
    '<div style="font-size:12px;color:var(--text-muted);line-height:1.8;">' +
    '<div>• 开锁指令将在3秒内送达设备</div>' +
    '<div>• 如门锁离线，指令将在设备上线后自动重试</div>' +
    '<div>• 开锁记录可在"钥匙管理"中查看</div></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-quick-unlock\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="executeQuickUnlock(\'' + roomNum + '\')" style="padding:8px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">🔓 确认开锁</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.executeQuickUnlock = function(roomNum) {
  document.getElementById('modal-quick-unlock') && document.getElementById('modal-quick-unlock').remove();
  showToast('🔓 开锁指令已发送给房间 ' + roomNum + '...', 'info');
  setTimeout(function() {
    showToast('✅ 房间 ' + roomNum + ' 已开锁！', 'success');
  }, 2000);
};

// ============================================================
// 【改进4】doQuickTempPwd - 房间快捷面板"密码"按钮
// 理由：房间快捷面板"🔢 密码"按钮onclick="doQuickTempPwd()"但函数未定义
// 改进：弹出临时密码生成弹窗，选择有效期，生成6位随机密码，显示并支持复制
// ============================================================
window.doQuickTempPwd = function() {
  var roomNum = '301';
  var titleEl = document.getElementById('rqp-room-num');
  if (titleEl) {
    var match = titleEl.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }
  var existing = document.getElementById('modal-quick-pwd');
  if (existing) existing.remove();
  // 生成6位随机密码
  var pwd = String(100000 + Math.floor(Math.random() * 900000));
  window._lastGeneratedPwd = pwd;
  window._lastGeneratedRoom = roomNum;
  var html = '<div class="modal-overlay" id="modal-quick-pwd" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-pwd\').remove()">' +
    '<div class="modal" style="width:400px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:48px;height:48px;background:var(--orange-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">🔢</div>' +
    '<div><div style="font-size:15px;font-weight:700;">生成临时密码</div><div style="font-size:12px;color:var(--text-muted);">房间号：' + roomNum + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-quick-pwd\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">密码有效期</label>' +
    '<select class="form-select" id="tmp-pwd-duration" style="width:100%;padding:10px;">' +
    '<option value="1">1小时</option><option value="4">4小时</option><option value="12" selected>12小时</option><option value="24">24小时</option><option value="72">3天</option></select></div>' +
    '<div class="form-group"><label class="form-label">临时密码</label>' +
    '<div style="display:flex;gap:8px;align-items:center;">' +
    '<input type="text" class="form-input" id="tmp-pwd-value" value="' + pwd + '" readonly style="width:120px;font-size:24px;letter-spacing:4px;text-align:center;font-weight:700;color:var(--blue);background:var(--blue-bg);">' +
    '<button onclick="copyTempPwd()" style="padding:8px 16px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">📋 复制</button>' +
    '<button onclick="regenerateTempPwd()" style="padding:8px 16px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">🔄</button></div></div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:8px;">密码有效期从现在起计算，超时后自动失效</div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-quick-pwd\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button>' +
    '<button onclick="confirmTempPwd(\'' + roomNum + '\')" style="padding:8px 20px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">✅ 确认发送</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.copyTempPwd = function() {
  var input = document.getElementById('tmp-pwd-value');
  if (input) {
    input.select();
    document.execCommand('copy');
    showToast('📋 密码已复制到剪贴板', 'success');
  }
};

window.regenerateTempPwd = function() {
  var pwd = String(100000 + Math.floor(Math.random() * 900000));
  window._lastGeneratedPwd = pwd;
  var input = document.getElementById('tmp-pwd-value');
  if (input) input.value = pwd;
  showToast('🔄 密码已重新生成', 'info');
};

window.confirmTempPwd = function(roomNum) {
  var pwd = window._lastGeneratedPwd || '------';
  var duration = document.getElementById('tmp-pwd-duration') ? document.getElementById('tmp-pwd-duration').value : '12';
  var durationLabel = {1:'1小时',4:'4小时',12:'12小时',24:'24小时',72:'3天'}[duration] || '12小时';
  document.getElementById('modal-quick-pwd') && document.getElementById('modal-quick-pwd').remove();
  showToast('🔢 临时密码 ' + pwd + '（有效期' + durationLabel + '）已发送给房间 ' + roomNum, 'success');
};

// ============================================================
// 【改进5】doQuickCheckin - 房间快捷面板"入住"按钮
// 理由：房间快捷面板"🏨 入住"按钮onclick="doQuickCheckin()"但函数未定义
// 改进：弹出快速入住表单，填写姓名/电话/证件号，选择入住天数，提交后更新房间状态
// ============================================================
window.doQuickCheckin = function() {
  var roomNum = '301';
  var titleEl = document.getElementById('rqp-room-num');
  if (titleEl) {
    var match = titleEl.textContent.match(/\d+/);
    if (match) roomNum = match[0];
  }
  var existing = document.getElementById('modal-quick-checkin');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-quick-checkin" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-quick-checkin\').remove()">' +
    '<div class="modal" style="width:420px;max-height:85vh;overflow-y:auto;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">' +
    '<div style="width:48px;height:48px;background:var(--blue-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">🏨</div>' +
    '<div><div style="font-size:15px;font-weight:700;">快速入住</div><div style="font-size:12px;color:var(--text-muted);">房间号：' + roomNum + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-quick-checkin\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">客人姓名 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="qc-name" placeholder="请输入客人姓名" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">手机号 <span class="required">*</span></label>' +
    '<input type="tel" class="form-input" id="qc-phone" placeholder="请输入手机号" style="width:100%;padding:10px;"></div>' +
    '<div class="form-group"><label class="form-label">证件号</label>' +
    '<input type="text" class="form-input" id="qc-idcard" placeholder="请输入身份证号（可选）" style="width:100%;padding:10px;"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    '<div class="form-group"><label class="form-label">入住天数</label>' +
    '<select class="form-select" id="qc-days" style="width:100%;padding:10px;">' +
    '<option value="1">1晚</option><option value="2" selected>2晚</option><option value="3">3晚</option><option value="5">5晚</option><option value="7">7晚</option></select></div>' +
    '<div class="form-group"><label class="form-label">入住人数</label>' +
    '<select class="form-select" id="qc-guests" style="width:100%;padding:10px;">' +
    '<option value="1" selected>1人</option><option value="2">2人</option><option value="3">3人</option><option value="4">4人</option></select></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<input type="text" class="form-input" id="qc-note" placeholder="可选，特殊要求..." style="width:100%;padding:10px;"></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-quick-checkin\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
    '<button onclick="confirmQuickCheckin(\'' + roomNum + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">🏨 确认入住</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmQuickCheckin = function(roomNum) {
  var name = document.getElementById('qc-name') ? document.getElementById('qc-name').value.trim() : '';
  var phone = document.getElementById('qc-phone') ? document.getElementById('qc-phone').value.trim() : '';
  var idcard = document.getElementById('qc-idcard') ? document.getElementById('qc-idcard').value.trim() : '';
  var days = document.getElementById('qc-days') ? document.getElementById('qc-days').value : '2';
  var guests = document.getElementById('qc-guests') ? document.getElementById('qc-guests').value : '1';
  var note = document.getElementById('qc-note') ? document.getElementById('qc-note').value.trim() : '';
  if (!name) { showToast('请输入客人姓名', 'error'); return; }
  if (!phone || !/^1\d{10}$/.test(phone)) { showToast('请输入正确的手机号', 'error'); return; }
  // 计算退房日期
  var checkinDate = new Date();
  var checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + parseInt(days));
  var fmt = function(d) { return (d.getMonth()+1) + '-' + d.getDate(); };
  document.getElementById('modal-quick-checkin') && document.getElementById('modal-quick-checkin').remove();
  showToast('🏨 房间 ' + roomNum + ' 已办理入住（' + name + '，住' + days + '晚）', 'success');
  // 更新按钮状态
  var checkinBtn = document.getElementById('rqp-checkin-btn');
  if (checkinBtn) {
    checkinBtn.textContent = '✅ 已入住';
    checkinBtn.style.background = 'var(--green-bg)';
    checkinBtn.style.color = 'var(--green)';
    checkinBtn.style.borderColor = 'var(--green)';
    checkinBtn.disabled = true;
  }
  var checkoutBtn = document.getElementById('rqp-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.background = 'var(--blue)';
    checkoutBtn.style.color = 'white';
  }
};
