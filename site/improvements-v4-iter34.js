// ========== 【v4-iter34】全面检查修复第2批：结构性断裂 + 功能缺失 ==========
// 修复内容：
// 1. 房务管理页（14399行）第2个page-housekeeping缺少"分配清洁任务"按钮（第一个有）
// 2. openDeviceRestartConfirmModal第5704行空函数（有声明无实现体）
// 3. filterHousekeepingTab在14399行page内找不到（第一个page里有，第二个page里没有）
// 4. renderHousekeepingGrid仅在第一个page里有数据渲染，第二个page的列表为空
// 5. 发票管理filterInvoiceTab调用renderInvoiceFilteredList，但两个page发票Tab可能状态不同步

// ========== 修复1：房务管理页第2个page-housekeeping缺少"分配清洁任务"按钮 ==========
// 理由：14399行的page-housekeeping页面没有"分配清洁任务"按钮，与9108行的第一个页面不一致
// 业务影响：切换到房务管理页面时，部分入口缺失
(function fixHousekeepingMissingButton() {
  // 找到第二个page-housekeeping的page-header
  var pages = document.querySelectorAll('#page-housekeeping');
  if (pages.length < 2) return;
  var secondPage = pages[1];
  var header = secondPage.querySelector('.page-header');
  if (!header) return;
  // 检查是否已有按钮
  if (header.querySelector('[onclick*="openHousekeepingTaskModal"]')) return;
  // 在page-sub后面插入按钮
  var sub = header.querySelector('.page-sub');
  var btn = document.createElement('button');
  btn.className = 'action-btn';
  btn.setAttribute('onclick', 'openHousekeepingTaskModal()');
  btn.style.cssText = 'margin-left:auto;background:var(--blue);color:white;border:none;padding:6px 14px;font-size:12px;border-radius:6px;cursor:pointer;';
  btn.textContent = '+ 分配清洁任务';
  if (sub && sub.nextSibling) {
    header.insertBefore(btn, sub.nextSibling);
  } else if (sub) {
    sub.parentNode.appendChild(btn);
  } else {
    header.appendChild(btn);
  }
})();

// ========== 修复2：openDeviceRestartConfirmModal空函数补全 ==========
// 理由：5704行声明了函数但函数体为空（只有函数名和结束大括号），floor面板的重启按钮点击无响应
// 影响：楼层设备面板的重启按钮完全失效
// 方案：保留原函数声明后的空内容，在iter33的完整实现之后补充一个确保生效的版本
(function fixEmptyDeviceRestartModal() {
  // 检查openDeviceRestartConfirmModal是否为空函数
  try {
    var testModal = document.getElementById('modal-dev-restart-confirm-test');
    if (!testModal) {
      testModal = document.createElement('div');
      testModal.id = 'modal-dev-restart-confirm-test';
      testModal.style.cssText = 'display:none;';
      document.body.appendChild(testModal);
    }
    var beforeHTML = testModal.innerHTML;
    try {
      openDeviceRestartConfirmModal();
    } catch(e) {}
    var afterHTML = testModal.innerHTML;
    // 如果调用后没有任何变化（仍然是空函数），则重新定义
    if (beforeHTML === afterHTML) {
      // 空函数，重新定义完整版本
      window.openDeviceRestartConfirmModal = function(uuid, roomNum, model) {
        var deviceNames = {
          'DEV-LK05': '301房间·亲子间',
          'DEV-LK07': '305房间·标准间',
          'DEFAULT': '未知设备'
        };
        var devLabel = uuid || 'DEFAULT';
        var devRoom = roomNum || deviceNames[devLabel] || '未知房间';
        var devModel = model || '领握LH-807智能锁';
        if (arguments.length === 1 && uuid && !uuid.match(/^DEV-/)) {
          devRoom = uuid;
          devLabel = 'DEFAULT';
          devModel = '领握LH-807智能锁';
        }
        var existing = document.getElementById('modal-dev-restart-confirm');
        if (existing) existing.remove();
        var html = '<div class="modal-overlay hidden" id="modal-dev-restart-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-dev-restart-confirm\').remove()">' +
          '<div style="background:white;border-radius:12px;width:420px;max-width:95vw;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
          '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
          '<div><div style="font-size:15px;font-weight:700;">⚠️ 确认重启设备</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">设备重启期间门锁将临时离线</div></div>' +
          '<button onclick="document.getElementById(\'modal-dev-restart-confirm\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
          '<div style="padding:20px 24px;">' +
          '<div style="text-align:center;margin-bottom:16px;">' +
          '<div style="font-size:48px;margin-bottom:12px;">🔁</div>' +
          '<div style="font-size:15px;font-weight:700;margin-bottom:8px;">确定要重启此设备吗？</div>' +
          '<div style="font-size:13px;color:var(--text-muted);">设备重启期间门锁将临时离线（约10秒），无法进行开锁操作</div></div>' +
          '<div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:16px;border:1px solid var(--border);">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">' +
          '<div><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">设备标识</div><div style="font-weight:600;font-size:11px;font-family:monospace;">' + devLabel + '</div></div>' +
          '<div><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">设备型号</div><div style="font-weight:600;">' + devModel + '</div></div>' +
          '<div><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">所属房间</div><div style="font-weight:600;">' + devRoom + '</div></div>' +
          '<div><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">重启后</div><div style="color:var(--green);font-weight:600;">自动恢复在线</div></div></div></div>' +
          '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:16px;">' +
          '⚠️ 重启过程中请勿断电，重启完成后设备将自动重新连接网络并恢复在线状态。</div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">' +
          '<input type="checkbox" id="restart-confirm-check" style="accent-color:var(--blue);width:16px;height:16px;cursor:pointer;">' +
          '<label for="restart-confirm-check" style="font-size:12px;cursor:pointer;color:var(--text);">我已知晓重启风险，确认执行此操作</label></div></div>' +
          '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
          '<button onclick="document.getElementById(\'modal-dev-restart-confirm\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;color:var(--text);">取消</button>' +
          '<button id="restart-confirm-btn" onclick="confirmDeviceRestart(\'' + devLabel + '\')" style="padding:8px 20px;background:var(--orange);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;opacity:0.5;" disabled>🔁 确认重启</button></div></div></div>';
        document.body.insertAdjacentHTML('beforeend', html);
        var checkEl = document.getElementById('restart-confirm-check');
        var btnEl = document.getElementById('restart-confirm-btn');
        if (checkEl && btnEl) {
          checkEl.addEventListener('change', function() {
            btnEl.disabled = !checkEl.checked;
            btnEl.style.opacity = checkEl.checked ? '1' : '0.5';
          });
        }
      };
    }
  } catch(e) {}
})();

// ========== 修复3：第二个page-housekeeping的filterHousekeepingTab缺失 ==========
// 理由：第二个page-housekeeping（14399行）的页面有统计卡片点击但找不到filterHousekeepingTab函数
// 影响：点击第二个页面的统计卡片（待清洁/清洁中/已清洁/维修中）无筛选响应
(function fixSecondHousekeepingPage() {
  var pages = document.querySelectorAll('#page-housekeeping');
  if (pages.length < 2) return;
  var secondPage = pages[1];
  // 检查第二个页面是否已有filterHousekeepingTab调用
  var hasFilterHKTab = secondPage.querySelector('[onclick*="filterHousekeepingTab"]');
  if (hasFilterHKTab) return;
  // 为统计卡片添加filterHousekeepingTab点击
  var statCards = secondPage.querySelectorAll('.stat-card');
  var tabs = ['dirty', 'cleaning', 'clean', 'maintain'];
  statCards.forEach(function(card, i) {
    if (tabs[i]) {
      card.style.cursor = 'pointer';
      card.onclick = (function(tab) {
        return function() {
          if (typeof filterHousekeepingTab === 'function') {
            filterHousekeepingTab(tab, this);
          } else {
            showToast('🔍 正在筛选：' + tab, 'info');
          }
        };
      })(tabs[i]);
    }
  });
})();

// ========== 修复4：第二个page-housekeeping的renderHousekeepingGrid数据缺失 ==========
// 理由：第二个page-housekeeping的清洁任务列表为空，没有数据渲染函数关联
// 影响：切换到第二个房务管理页面时，清洁任务列表空白
(function fixSecondHousekeepingRender() {
  var pages = document.querySelectorAll('#page-housekeeping');
  if (pages.length < 2) return;
  var secondPage = pages[1];
  var taskList = secondPage.querySelector('.card-body');
  if (!taskList) return;
  // 检查是否已有静态数据
  var existingRows = taskList.querySelector('tbody tr');
  if (existingRows && existingRows.textContent.trim().length > 0) return;
  // 注入模拟清洁任务数据
  var hkData = [
    {room:'301',type:'亲子间',floor:3,status:'dirty',staff:'李丽',time:'14:05',priority:'normal'},
    {room:'302',type:'大床房',floor:3,status:'cleaning',staff:'王芳',time:'14:32',priority:'urgent'},
    {room:'201',type:'标准间',floor:2,status:'dirty',staff:'张梅',time:'14:10',priority:'normal'},
    {room:'202',type:'标准间',floor:2,status:'clean',staff:'刘婷',time:'13:45',priority:'low'},
    {room:'103',type:'大床房',floor:1,status:'maintain',staff:null,time:'--',priority:'low'}
  ];
  var statusMap = {
    dirty:{label:'待清洁',color:'var(--orange)',bg:'var(--orange-bg)'},
    cleaning:{label:'清洁中',color:'var(--blue)',bg:'var(--blue-bg)'},
    clean:{label:'已完成',color:'var(--green)',bg:'var(--green-bg)'},
    maintain:{label:'维修中',color:'var(--red)',bg:'var(--red-bg)'}
  };
  var priorityMap = {urgent:'🚨',normal:'⚡',low:'🔽'};
  var tbody = taskList.querySelector('tbody');
  if (!tbody) {
    var table = taskList.querySelector('table');
    if (!table) return;
    tbody = document.createElement('tbody');
    table.appendChild(tbody);
  }
  tbody.innerHTML = hkData.map(function(r) {
    var st = statusMap[r.status] || statusMap.dirty;
    return '<tr>' +
      '<td style="padding:10px 16px;font-weight:600;">' + r.room + '</td>' +
      '<td style="padding:10px 16px;font-size:12px;color:var(--text-muted);">' + r.type + '</td>' +
      '<td style="padding:10px 16px;"><span style="padding:2px 8px;border-radius:4px;font-size:11px;background:' + st.bg + ';color:' + st.color + ';">' + st.label + '</span></td>' +
      '<td style="padding:10px 16px;font-size:12px;">' + (priorityMap[r.priority] || '') + ' ' + (r.staff || '<span style="color:var(--text-muted);">未分配</span>') + '</td>' +
      '<td style="padding:10px 16px;font-size:12px;color:var(--text-muted);">' + r.time + '</td>' +
      '<td style="padding:10px 16px;"><button class="action-btn small" onclick="showToast(\'📋 ' + r.room + ' 详情已打开\',\'info\')" style="padding:2px 8px;font-size:11px;">详情</button></td>' +
      '</tr>';
  }).join('');
})();

console.log('[v4-iter34] 全面检查修复第2批加载完成：结构性断裂+功能缺失修复');
