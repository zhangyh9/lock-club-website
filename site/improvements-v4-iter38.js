// ============================================================
// 【物联后台 v4 第38轮】设备详情页功能闭环 + 设备列表导出
// 5个断裂修复，全部基于真实UI onclick调用分析
// ============================================================

// ============================================================
// 【改进1】confirmUnlock / cancelUnlock / retryUnlock - 远程开锁完整闭环
// 理由：modal-unlock 弹窗的"立即开锁"调用confirmUnlock()，"取消开锁"调用cancelUnlock()，
//       开锁失败后"重试"调用retryUnlock()，但3个函数全部缺失
// 业务闭环：点击开锁 → 5秒倒计时 → 发送指令 → 显示结果动画 → Toast通知
// ============================================================
var _unlockCountdownTimer = null;
var _unlockTargetRoom = null;
var _unlockRetryCount = 0;

function confirmUnlock() {
  // 清除倒计时
  if (_unlockCountdownTimer) {
    clearInterval(_unlockCountdownTimer);
    _unlockCountdownTimer = null;
  }
  // 隐藏取消按钮
  var cancelBtn = document.getElementById('unlock-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';
  var confirmBtn = document.getElementById('unlock-confirm-btn');
  if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = '开锁中...'; }
  // 模拟发送开锁指令
  showToast('🔓 正在向设备发送开锁指令...', 'info');
  setTimeout(function() {
    // 模拟90%成功率
    var success = Math.random() > 0.1;
    if (success) {
      _showUnlockSuccess();
    } else {
      _showUnlockFail('设备未响应，开锁指令发送失败');
    }
    // 恢复按钮
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = '立即开锁'; }
  }, 1500);
}

function _showUnlockSuccess() {
  var resultDiv = document.getElementById('unlock-result-feedback');
  var failDiv = document.getElementById('unlock-fail-feedback');
  var countdownBox = document.getElementById('unlock-countdown-box');
  if (countdownBox) countdownBox.style.display = 'none';
  if (resultDiv) resultDiv.style.display = '';
  if (failDiv) failDiv.style.display = 'none';
  // 更新同步时间
  var syncTime = document.getElementById('unlock-sync-time');
  if (syncTime) syncTime.textContent = new Date().toLocaleTimeString('zh-CN');
  // 添加通知记录
  if (typeof addNotif === 'function') {
    addNotif('🔓', 'var(--green)', '设备', '远程开锁成功：301房间');
  }
  showToast('✅ 远程开锁成功！', 'success');
}

function _showUnlockFail(reason) {
  var resultDiv = document.getElementById('unlock-result-feedback');
  var failDiv = document.getElementById('unlock-fail-feedback');
  var countdownBox = document.getElementById('unlock-countdown-box');
  if (countdownBox) countdownBox.style.display = 'none';
  if (resultDiv) resultDiv.style.display = 'none';
  if (failDiv) failDiv.style.display = '';
  var reasonEl = document.getElementById('unlock-fail-reason');
  if (reasonEl) reasonEl.textContent = reason || '设备离线，开锁指令无法送达';
  if (typeof addNotif === 'function') {
    addNotif('❌', 'var(--red)', '设备', '远程开锁失败：301 - ' + (reason || '设备离线'));
  }
  showToast('❌ 开锁失败：' + (reason || '设备离线'), 'error');
}

function cancelUnlock() {
  if (_unlockCountdownTimer) {
    clearInterval(_unlockCountdownTimer);
    _unlockCountdownTimer = null;
  }
  closeModal('unlock');
  showToast('已取消远程开锁', 'info');
}

function retryUnlock() {
  _unlockRetryCount++;
  // 重置UI状态
  var resultDiv = document.getElementById('unlock-result-feedback');
  var failDiv = document.getElementById('unlock-fail-feedback');
  var countdownBox = document.getElementById('unlock-countdown-box');
  if (countdownBox) countdownBox.style.display = '';
  if (resultDiv) resultDiv.style.display = 'none';
  if (failDiv) failDiv.style.display = 'none';
  // 重置倒计时显示
  var countdownEl = document.getElementById('unlock-countdown');
  if (countdownEl) countdownEl.textContent = '5';
  var cancelBtn = document.getElementById('unlock-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = '';
  showToast('🔄 正在重新发送开锁指令（第' + _unlockRetryCount + '次重试）...', 'info');
  // 自动开始倒计时
  _startUnlockCountdown();
}

function contactMaintenance() {
  showToast('📞 已通知维修人员，维修工单创建中...', 'info');
  setTimeout(function() {
    showToast('✅ 维修工单已创建：房间301门锁故障，请等待维修员接单', 'success');
  }, 1200);
  closeModal('unlock');
  // 跳转到工单页面
  if (typeof showPage === 'function') showPage('workorder');
}

// 开锁弹窗打开时自动启动倒计时
(function() {
  var unlockModal = document.getElementById('modal-unlock');
  if (unlockModal) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName === 'class') {
          var modal = document.getElementById('modal-unlock');
          if (modal && !modal.classList.contains('hidden')) {
            _unlockRetryCount = 0;
            _startUnlockCountdown();
          } else {
            if (_unlockCountdownTimer) {
              clearInterval(_unlockCountdownTimer);
              _unlockCountdownTimer = null;
            }
          }
        }
      });
    });
    observer.observe(unlockModal, { attributes: true });
  }
})();

function _startUnlockCountdown() {
  if (_unlockCountdownTimer) clearInterval(_unlockCountdownTimer);
  var countdown = 5;
  var countdownEl = document.getElementById('unlock-countdown');
  var countdownBox = document.getElementById('unlock-countdown-box');
  if (countdownBox) countdownBox.style.display = '';
  if (countdownEl) countdownEl.textContent = countdown;
  // 重置结果/失败区域
  var resultDiv = document.getElementById('unlock-result-feedback');
  var failDiv = document.getElementById('unlock-fail-feedback');
  if (resultDiv) resultDiv.style.display = 'none';
  if (failDiv) failDiv.style.display = 'none';
  var cancelBtn = document.getElementById('unlock-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = '';
  _unlockCountdownTimer = setInterval(function() {
    countdown--;
    if (countdownEl) countdownEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(_unlockCountdownTimer);
      _unlockCountdownTimer = null;
      confirmUnlock();
    }
  }, 1000);
}

// ============================================================
// 【改进2】filterDevUnlockLog - 设备详情页开锁记录筛选
// 理由：设备详情页的开锁记录工具有onchange="filterDevUnlockLog()"
//       筛选条件：日期范围(from/to) + 开锁方式(method)
// 业务闭环：选择筛选条件 → 过滤tbody rows → 更新计数 → Toast提示
// ============================================================
function filterDevUnlockLog() {
  var dateFrom = document.getElementById('dev-ulog-date-from');
  var dateTo = document.getElementById('dev-ulog-date-to');
  var methodFilter = document.getElementById('dev-ulog-method-filter');
  var fromVal = dateFrom ? dateFrom.value : '';
  var toVal = dateTo ? dateTo.value : '';
  var methodVal = methodFilter ? methodFilter.value : 'all';
  var tbody = document.getElementById('dev-unlock-log-body');
  if (!tbody) {
    showToast('开锁记录表格未找到', 'error');
    return;
  }
  var rows = tbody.querySelectorAll('tr');
  var shown = 0;
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 2) { row.style.display = ''; shown++; return; }
    var dateCell = cells[0] ? cells[0].textContent.trim() : '';
    var rowDate = dateCell.slice(0, 10);
    var methodCell = cells[1] ? cells[1].textContent.trim() : '';
    var rowMethod = row.getAttribute('data-method') || '';
    // 匹配日期
    var matchDate = true;
    if (fromVal && rowDate < fromVal) matchDate = false;
    if (toVal && rowDate > toVal) matchDate = false;
    // 匹配方式
    var matchMethod = methodVal === 'all' || rowMethod === methodVal;
    var show = matchDate && matchMethod;
    row.style.display = show ? '' : 'none';
    if (show) shown++;
  });
  var countEl = document.getElementById('dev-ulog-count');
  if (countEl) countEl.textContent = '共 ' + shown + ' 条记录（已筛选）';
  showToast('🔍 筛选完成，显示 ' + shown + ' 条记录', 'info');
}

// ============================================================
// 【改进3】exportDevUnlockLog - 设备详情页开锁记录CSV导出
// 理由：设备详情页开锁记录工具栏有onclick="exportDevUnlockLog()"
// 业务闭环：点击导出 → 收集可见记录 → 生成CSV → 浏览器下载 → Toast提示
// ============================================================
function exportDevUnlockLog() {
  var tbody = document.getElementById('dev-unlock-log-body');
  if (!tbody) { showToast('开锁记录表格未找到', 'error'); return; }
  var rows = tbody.querySelectorAll('tr');
  var headers = ['开锁时间', '开锁方式', '开锁人', '设备响应', '剩余电量'];
  var csvRows = [headers.join(',')];
  rows.forEach(function(row) {
    if (row.style.display === 'none') return;
    var cells = row.querySelectorAll('td');
    if (cells.length < 5) return;
    var rowData = [
      cells[0].textContent.trim().replace(/,/g, '，'),
      cells[1].textContent.trim().replace(/,/g, '，'),
      cells[2].textContent.trim().replace(/,/g, '，'),
      cells[3].textContent.trim().replace(/,/g, '，'),
      cells[4].textContent.trim().replace(/,/g, '，')
    ];
    csvRows.push(rowData.join(','));
  });
  if (csvRows.length <= 1) { showToast('没有可导出的记录', 'warning'); return; }
  var csvContent = '\uFEFF' + csvRows.join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '设备开锁记录_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📤 已导出 ' + (csvRows.length - 1) + ' 条开锁记录', 'success');
}

// ============================================================
// 【改进4】filterRuntimeLog - 设备运行日志筛选
// 理由：设备详情页运行日志工具有onchange="filterRuntimeLog()"
//       筛选条件：日志类型(type) + 结果(result)
// 业务闭环：选择筛选条件 → 过滤显示 → 更新计数标签
// ============================================================
function filterRuntimeLog() {
  var typeFilter = document.getElementById('rt-log-type-filter');
  var resultFilter = document.getElementById('rt-log-result-filter');
  var typeVal = typeFilter ? typeFilter.value : 'all';
  var resultVal = resultFilter ? resultFilter.value : 'all';
  // 尝试查找运行日志表格
  var tables = document.querySelectorAll('#page-device-detail table');
  var logTable = null;
  tables.forEach(function(t) {
    var header = t.querySelector('thead');
    if (header && header.textContent.indexOf('运行日志') >= 0) logTable = t;
  });
  if (!logTable) {
    showToast('设备运行日志表格未找到', 'info');
    return;
  }
  var rows = logTable.querySelectorAll('tbody tr');
  var shown = 0;
  rows.forEach(function(row) {
    var show = true;
    // 根据行数据属性筛选（如果有）
    var typeAttr = row.getAttribute('data-type') || '';
    var resultAttr = row.getAttribute('data-result') || '';
    if (typeVal !== 'all' && typeAttr !== typeVal) show = false;
    if (resultVal !== 'all') {
      var expectedResult = resultVal === 'success' ? '成功' : '失败';
      if (row.textContent.indexOf(expectedResult) < 0) show = false;
    }
    row.style.display = show ? '' : 'none';
    if (show) shown++;
  });
  var countEl = document.getElementById('rt-log-count');
  if (countEl) countEl.textContent = '共 ' + shown + ' 条记录';
  showToast('🔍 运行日志筛选完成，显示 ' + shown + ' 条', 'info');
}

// ============================================================
// 【改进5】exportDeviceCSV + openDeviceConfigModal + openBatchDeviceDiagnosticModal - 设备列表功能
// 理由：设备列表页工具栏有onclick="exportDeviceCSV()"（导出CSV）、
//       onclick="openDeviceConfigModal()"（参数配置）、
//       onclick="openBatchDeviceDiagnosticModal()"（多设备同时Ping）
// 业务闭环：导出CSV → 收集设备表格数据 → 生成下载；参数配置 → 打开弹窗 → 表单保存；多设备Ping → 打开弹窗 → 执行批量Ping
// ============================================================
function exportDeviceCSV() {
  var tbody = document.querySelector('#page-device table tbody');
  if (!tbody) { showToast('设备列表表格未找到', 'error'); return; }
  var rows = tbody.querySelectorAll('tr');
  var headers = ['房间号', '设备UUID', '设备类型', '状态', '电量', '信号', '最后同步'];
  var csvRows = [headers.join(',')];
  rows.forEach(function(row) {
    if (row.style.display === 'none') return;
    var cells = row.querySelectorAll('td');
    if (cells.length < 4) return;
    var rowData = Array.from(cells).slice(0, 6).map(function(c) {
      return c.textContent.trim().replace(/,/g, '，').replace(/\n/g, ' ');
    });
    if (rowData.length >= 6) csvRows.push(rowData.join(','));
  });
  if (csvRows.length <= 1) { showToast('没有可导出的设备记录', 'warning'); return; }
  var csvContent = '\uFEFF' + csvRows.join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '设备列表_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📤 已导出 ' + (csvRows.length - 1) + ' 条设备记录', 'success');
}

function openDeviceConfigModal() {
  var existing = document.getElementById('modal-device-config');
  if (existing) { existing.classList.remove('hidden'); return; }
  var html = '<div class="modal-overlay" id="modal-device-config" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)closeFirmwareUpgradeModal()">' +
    '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">⚙️</div><div><div style="font-size:15px;font-weight:700;">设备参数配置</div><div style="font-size:11px;color:var(--text-muted);">批量配置设备运行参数</div></div></div>' +
    '<button onclick="closeFirmwareUpgradeModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">选择设备范围</label>' +
    '<select class="form-select" style="width:100%;">' +
    '<option value="all">全部设备（27台）</option>' +
    '<option value="online">仅在线设备</option>' +
    '<option value="offline">仅离线设备</option>' +
    '<option value="lowbat">仅低电量设备</option></select></div>' +
    '<div class="form-group"><label class="form-label">开锁灵敏度</label>' +
    '<select class="form-select" style="width:100%;">' +
    '<option value="high">高（推荐酒店场景）</option>' +
    '<option value="medium">中</option>' +
    '<option value="low">低</option></select></div>' +
    '<div class="form-group"><label class="form-label">离线存储策略</label>' +
    '<select class="form-select" style="width:100%;">' +
    '<option value="queue">离线队列存储（推荐）</option>' +
    '<option value="drop">离线时丢弃指令</option></select></div>' +
    '<div class="form-group"><label class="form-label">心跳间隔（秒）</label>' +
    '<input type="number" class="form-input" value="30" min="10" max="300" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">低电量阈值（%）</label>' +
    '<input type="number" class="form-input" value="20" min="5" max="50" style="width:100%;"></div>' +
    '<div class="form-group"><label class="form-label">告警策略</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 低电量告警</label>' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" checked style="accent-color:var(--blue);"> 设备离线告警</label>' +
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;"><input type="checkbox" style="accent-color:var(--blue);"> 暴力破门告警</label></div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="closeFirmwareUpgradeModal()" class="modal-btn secondary">取消</button>' +
    '<button onclick="doSaveDeviceConfig()" class="modal-btn" style="background:var(--blue);color:white;border:none;">💾 保存配置</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doSaveDeviceConfig() {
  closeFirmwareUpgradeModal();
  showToast('✅ 设备参数配置已保存，将在新心跳周期生效', 'success');
}

function openBatchDeviceDiagnosticModal() {
  var existing = document.getElementById('modal-device-diag');
  if (existing) { existing.classList.remove('hidden'); return; }
  var html = '<div class="modal-overlay" id="modal-device-diag" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🌐</div><div><div style="font-size:15px;font-weight:700;">多设备同时Ping检测</div><div style="font-size:11px;color:var(--text-muted);">批量检测设备网络连通性</div></div></div>' +
    '<button onclick="this.closest(\'.modal-overlay\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">🌐 Ping检测将向选中设备发送ICMP请求，测量网络延迟和丢包率</div>' +
    '<div class="form-group"><label class="form-label">选择检测范围</label>' +
    '<select class="form-select" id="diag-target" style="width:100%;">' +
    '<option value="all">全部设备（27台）</option>' +
    '<option value="online">仅在线设备</option>' +
    '<option value="floor3">3层设备（8台）</option>' +
    '<option value="floor2">2层设备（7台）</option>' +
    '<option value="floor1">1层设备（5台）</option></select></div>' +
    '<div class="form-group"><label class="form-label">检测参数</label>' +
    '<div style="display:flex;gap:12px;">' +
    '<div style="flex:1;"><label style="font-size:11px;color:var(--text-muted);">超时(ms)</label>' +
    '<input type="number" class="form-input" id="diag-timeout" value="3000" min="1000" max="10000" style="width:100%;margin-top:4px;"></div>' +
    '<div style="flex:1;"><label style="font-size:11px;color:var(--text-muted);">重试次数</label>' +
    '<input type="number" class="form-input" id="diag-retry" value="3" min="1" max="5" style="width:100%;margin-top:4px;"></div></div></div>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:8px;margin-top:8px;font-size:12px;color:var(--text-muted);">' +
    '<div style="margin-bottom:6px;font-weight:600;">📋 检测结果将显示：</div>' +
    '<div>• 设备UUID / IP地址</div><div>• 平均延迟（ms）</div><div>• 丢包率（%）</div><div>• 在线/离线状态</div></div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="this.closest(\'.modal-overlay\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="doBatchDevicePing()" class="modal-btn" style="background:var(--blue);color:white;border:none;">🌐 开始Ping检测</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function doBatchDevicePing() {
  var target = document.getElementById('diag-target') ? document.getElementById('diag-target').value : 'all';
  var timeout = document.getElementById('diag-timeout') ? parseInt(document.getElementById('diag-timeout').value) : 3000;
  var modal = document.getElementById('modal-device-diag');
  if (modal) modal.remove();
  showToast('🌐 正在Ping检测中...（超时' + timeout + 'ms，重试3次）', 'info');
  setTimeout(function() {
    // 模拟检测结果
    var deviceCount = target === 'all' ? 27 : target === 'online' ? 23 : 8;
    var success = Math.floor(deviceCount * 0.9);
    var failed = deviceCount - success;
    var avgLatency = Math.floor(15 + Math.random() * 20);
    showToast('🌐 Ping检测完成：' + success + '台在线，平均延迟' + avgLatency + 'ms，' + failed + '台离线', 'success');
    // 添加通知
    if (typeof addNotif === 'function') {
      addNotif('🌐', 'var(--blue)', '设备', '批量Ping检测完成：' + success + '台在线/' + failed + '台离线');
    }
  }, 3000);
}

// ============================================================
// 初始化：确保页面加载后自动绑定
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // 当设备详情页的运行日志筛选器存在时，初始化计数
  setTimeout(function() {
    var rtFilter = document.getElementById('rt-log-type-filter');
    if (rtFilter) {
      var rtCount = document.getElementById('rt-log-count');
      if (rtCount) rtCount.textContent = '共 10 条记录';
    }
    // 设备列表页的dev-ulog-date-from/to 初始化
    var devUlogDateFrom = document.getElementById('dev-ulog-date-from');
    var devUlogDateTo = document.getElementById('dev-ulog-date-to');
    if (devUlogDateFrom && !devUlogDateFrom.value) devUlogDateFrom.value = '2026-03-20';
    if (devUlogDateTo && !devUlogDateTo.value) devUlogDateTo.value = new Date().toISOString().slice(0,10);
  }, 500);
});
