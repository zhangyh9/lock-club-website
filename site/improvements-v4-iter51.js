// ============================================================
// 【物联后台 v4 第51轮】5个功能性改进
// ============================================================
// 改进1: 首页添加入住办理+退房办理快捷按钮（对照截图：应有入住/退房/清洁三个按钮）
// 改进2: 会员管理充值弹窗完善（余额/积分联动计算）
// 改进3: 开锁记录按卡类型筛选（卡号精确搜索+卡类型联动）
// 改进4: 房间卡片快速操作：入住/退房/清洁一键触达
// 改进5: 楼层管理快捷工具栏（快速添房/批量操作）
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：首页添加入住办理+退房办理快捷按钮 ----------
  function addHomeQuickActionButtons() {
    var pageHome = document.getElementById('page-home');
    if (!pageHome) return;
    // Find the button container in page-home header
    var btnContainer = pageHome.querySelector('.page-header');
    if (!btnContainer) return;
    // Check if already added
    if (document.getElementById('home-btn-checkin')) return;
    // Add check-in button
    var checkinBtn = document.createElement('button');
    checkinBtn.id = 'home-btn-checkin';
    checkinBtn.onclick = function() {
      showPage('records');
      setTimeout(function() {
        openAddRecordModal && openAddRecordModal();
      }, 200);
    };
    checkinBtn.style.cssText = 'padding:6px 12px;background:var(--green);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;';
    checkinBtn.textContent = '🏨 入住办理';
    // Add check-out button
    var checkoutBtn = document.createElement('button');
    checkoutBtn.id = 'home-btn-checkout';
    checkoutBtn.onclick = function() {
      showPage('records');
      setTimeout(function() {
        openBatchCheckoutModal && openBatchCheckoutModal();
      }, 200);
    };
    checkoutBtn.style.cssText = 'padding:6px 12px;background:var(--orange);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;';
    checkoutBtn.textContent = '🚪 退房办理';
    // Insert before the existing refresh button
    var refreshBtn = pageHome.querySelector('button[onclick*="renderRoomGrid"]');
    if (refreshBtn && refreshBtn.parentNode) {
      refreshBtn.parentNode.insertBefore(checkoutBtn, refreshBtn);
      refreshBtn.parentNode.insertBefore(checkinBtn, checkoutBtn);
    }
  }

  // ---------- 改进2：会员管理充值弹窗完善（余额/积分联动计算） ----------
  function improveMemberRechargeModal() {
    // Patch openMemberRechargeModalV3 to add balance/points auto-calculate
    var originalFn = window.openMemberRechargeModalV3;
    window.openMemberRechargeModalV3 = function(idx) {
      // Call original
      if (originalFn) originalFn.apply(this, arguments);
      // After modal opens, enhance with auto-calculate
      setTimeout(function() {
        var modal = document.querySelector('#modal-member-recharge, .modal-overlay[id*="recharge"]');
        if (!modal) return;
        // Add amount input listener for auto-calculate
        var amountInput = modal.querySelector('input[id*="amount"], input[id*="recharge"]');
        if (amountInput && !amountInput.dataset.enhanced) {
          amountInput.dataset.enhanced = 'true';
          amountInput.addEventListener('input', function() {
            var amount = parseFloat(this.value) || 0;
            // Auto show points equivalent (1元=10积分)
            var pointsDisplay = modal.querySelector('.recharge-points-preview, #recharge-points-preview');
            if (pointsDisplay) {
              pointsDisplay.textContent = Math.floor(amount * 10) + ' 积分';
            }
          });
        }
        // Add preset amount buttons
        var formGroup = modal.querySelector('.form-group');
        if (formGroup && !modal.querySelector('.recharge-preset-btns')) {
          var presetDiv = document.createElement('div');
          presetDiv.className = 'recharge-preset-btns';
          presetDiv.style.cssText = 'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;';
          presetDiv.innerHTML = '' +
            '<button type="button" class="action-btn small" onclick="this.parentNode.previousElementSibling.value=100;this.parentNode.previousElementSibling.dispatchEvent(new Event(\'input\'))" style="padding:4px 10px;font-size:11px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);">+100元</button>' +
            '<button type="button" class="action-btn small" onclick="this.parentNode.previousElementSibling.value=500;this.parentNode.previousElementSibling.dispatchEvent(new Event(\'input\'))" style="padding:4px 10px;font-size:11px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);">+500元</button>' +
            '<button type="button" class="action-btn small" onclick="this.parentNode.previousElementSibling.value=1000;this.parentNode.previousElementSibling.dispatchEvent(new Event(\'input\'))" style="padding:4px 10px;font-size:11px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);">+1000元</button>' +
            '<span style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;">= <span id="recharge-points-preview" style="color:var(--blue);font-weight:700;margin-left:4px;">0 积分</span></span>';
          formGroup.appendChild(presetDiv);
        }
      }, 100);
    };
  }

  // ---------- 改进3：开锁记录按卡类型筛选（卡号精确搜索+卡类型联动） ----------
  function enhanceUnlockLogFilter() {
    // Override searchByCardNumber to auto-detect card type
    var originalSearch = window.searchByCardNumber;
    window.searchByCardNumber = function() {
      var cardNum = document.getElementById('log-card-number');
      var cardTypeFilter = document.getElementById('log-card-type-filter');
      if (!cardNum || !cardTypeFilter) {
        if (originalSearch) originalSearch();
        return;
      }
      var val = cardNum.value.trim();
      // Auto-detect card type based on card number prefix
      if (val) {
        if (val.indexOf('M') === 0 || val.indexOf('138') === 0 || val.indexOf('139') === 0 || val.indexOf('137') === 0) {
          cardTypeFilter.value = 'member';
        } else if (val.indexOf('E') === 0 || val.indexOf('EMP') === 0) {
          cardTypeFilter.value = 'staff';
        } else if (val.indexOf('TEMP') === 0 || val.indexOf('T') === 0) {
          cardTypeFilter.value = 'temp';
        } else if (val.indexOf('MASTER') === 0 || val.indexOf('MAS') === 0) {
          cardTypeFilter.value = 'master';
        }
      }
      if (originalSearch) originalSearch();
    };
  }

  // ---------- 改进4：房间卡片快速操作（入住/退房/清洁一键触达） ----------
  function addRoomCardQuickActions() {
    // Enhance room-card to show quick action buttons on hover
    var style = document.createElement('style');
    style.textContent = '' +
      '.room-card .room-quick-btns { display: none; position: absolute; top: 4px; right: 4px; gap: 3px; z-index: 20; flex-direction: column; } ' +
      '.room-card:hover .room-quick-btns { display: flex; } ' +
      '.room-qbtn { padding: 3px 6px; font-size: 10px; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; opacity: 0.9; } ' +
      '.room-qbtn:hover { opacity: 1; }';
    document.head.appendChild(style);
    
    // Patch renderRoomGrid to add quick action buttons
    var originalRender = window.renderRoomGrid;
    window.renderRoomGrid = function() {
      if (originalRender) originalRender();
      // Add quick action buttons to each room card after render
      setTimeout(function() {
        document.querySelectorAll('.room-card').forEach(function(card) {
          if (card.querySelector('.room-quick-btns')) return; // Already added
          var roomNum = card.querySelector('.room-num, .room-title');
          var roomNumText = roomNum ? roomNum.textContent.trim() : '';
          var status = 'empty';
          if (card.classList.contains('occupied') || card.classList.contains('checkin')) status = 'in';
          if (card.classList.contains('alert') || card.classList.contains('offline')) status = 'alert';
          
          var btnsDiv = document.createElement('div');
          btnsDiv.className = 'room-quick-btns';
          btnsDiv.innerHTML = '' +
            (status === 'empty' ? '<button class="room-qbtn" style="background:var(--green);color:white;" onclick="event.stopPropagation();showPage(\'records\');setTimeout(function(){openAddRecordModal && openAddRecordModal()},200);">入住</button>' : '') +
            (status === 'in' ? '<button class="room-qbtn" style="background:var(--orange);color:white;" onclick="event.stopPropagation();showPage(\'records\');setTimeout(function(){openBatchCheckoutModal && openBatchCheckoutModal()},200);">退房</button>' : '') +
            '<button class="room-qbtn" style="background:var(--blue);color:white;" onclick="event.stopPropagation();showPage(\'housekeeping\');">清洁</button>';
          card.style.position = 'relative';
          card.appendChild(btnsDiv);
        });
      }, 100);
    };
  }

  // ---------- 改进5：楼层管理快捷工具栏（快速添房/批量操作） ----------
  function addFloorManagementToolbar() {
    // Add quick add room button to floor management page
    var pageFloor = document.getElementById('page-floor');
    if (!pageFloor) return;
    // Check if already added
    if (document.getElementById('floor-quick-add-btn')) return;
    
    var header = pageFloor.querySelector('.page-header');
    if (!header) return;
    
    // Add quick add button
    var addBtn = document.createElement('button');
    addBtn.id = 'floor-quick-add-btn';
    addBtn.className = 'action-btn';
    addBtn.style.cssText = 'padding:5px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;';
    addBtn.textContent = '+ 快速添房';
    addBtn.onclick = function() {
      openAddFloorRoomModal && openAddFloorRoomModal();
    };
    
    // Add batch operation button
    var batchBtn = document.createElement('button');
    batchBtn.id = 'floor-batch-op-btn';
    batchBtn.className = 'action-btn';
    batchBtn.style.cssText = 'padding:5px 12px;background:var(--purple-bg);color:var(--purple);border:1px solid var(--purple);border-radius:6px;font-size:12px;cursor:pointer;';
    batchBtn.textContent = '📋 批量操作';
    batchBtn.onclick = function() {
      openFloorBatchModal && openFloorBatchModal();
    };
    
    // Find header action area
    var actionArea = header.querySelector('.page-header') || header;
    var titleEl = header.querySelector('.page-title');
    if (titleEl && titleEl.parentNode) {
      var toolDiv = document.createElement('div');
      toolDiv.style.cssText = 'display:flex;gap:8px;margin-top:8px;';
      toolDiv.appendChild(addBtn);
      toolDiv.appendChild(batchBtn);
      titleEl.parentNode.insertBefore(toolDiv, titleEl.nextSibling);
    }
  }

  // 楼层批量操作弹窗
  window.openFloorBatchModal = function() {
    var existing = document.getElementById('modal-floor-batch');
    if (existing) existing.remove();
    var html = '<div class="modal-overlay hidden" id="modal-floor-batch" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
      '<div class="modal" style="width:480px;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:28px;">📋</div><div style="font-size:15px;font-weight:700;">楼层批量操作</div>' +
      '<button onclick="closeModal(\'floor-batch\')" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px;">' +
      '<div onclick="closeModal(\'floor-batch\');showToast(\'🔄 批量设置房型功能开发中\',\'info\')" style="padding:14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;" onmouseover="this.style.borderColor=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
      '<span style="font-size:24px;">🏠</span><div><div style="font-weight:600;font-size:13px;">批量设置房型</div><div style="font-size:11px;color:var(--text-muted);">为多个房间统一设置房型分类</div></div></div>' +
      '<div onclick="closeModal(\'floor-batch\');showToast(\'🔄 批量设置房态功能开发中\',\'info\')" style="padding:14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;" onmouseover="this.style.borderColor=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
      '<span style="font-size:24px;">🚪</span><div><div style="font-weight:600;font-size:13px;">批量设置房态</div><div style="font-size:11px;color:var(--text-muted);">批量修改房间状态（空房/入住/维修）</div></div></div>' +
      '<div onclick="closeModal(\'floor-batch\');openBatchCleanModal();" style="padding:14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;" onmouseover="this.style.borderColor=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
      '<span style="font-size:24px;">🧹</span><div><div style="font-weight:600;font-size:13px;">批量清洁下发</div><div style="font-size:11px;color:var(--text-muted);">批量将房间标记为需要清洁</div></div></div>' +
      '<div onclick="closeModal(\'floor-batch\');exportFloorRoomList();" style="padding:14px;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;" onmouseover="this.style.borderColor=\'var(--green)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
      '<span style="font-size:24px;">📤</span><div><div style="font-weight:600;font-size:13px;">导出房间列表</div><div style="font-size:11px;color:var(--text-muted);">导出当前楼层房间为CSV文件</div></div></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;"><button class="modal-btn secondary" onclick="closeModal(\'floor-batch\')">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // 导出楼层房间列表
  window.exportFloorRoomList = function() {
    var rooms = document.querySelectorAll('#page-floor .room-card, #page-floor .fp-room');
    if (rooms.length === 0) { showToast('当前楼层没有房间数据', 'info'); return; }
    var csv = '\uFEFF房间号,房型,状态,电量,信号\n';
    rooms.forEach(function(r) {
      var num = r.querySelector('.room-num, .room-title') || {textContent: ''};
      var type = r.querySelector('.room-type, .room-info') || {textContent: ''};
      var status = '空房';
      if (r.classList.contains('occupied') || r.classList.contains('checkin')) status = '入住中';
      if (r.classList.contains('alert') || r.classList.contains('offline')) status = '离线';
      csv += num.textContent.trim() + ',' + type.textContent.trim() + ',' + status + ',,\n';
    });
    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '楼层房间列表_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.csv';
    link.click();
    showToast('📤 已导出 ' + rooms.length + ' 间房间', 'success');
  };

  // 初始化：自动执行增强
  function initEnhancements() {
    // Add home quick action buttons when page-home exists
    setTimeout(function() {
      addHomeQuickActionButtons();
      addRoomCardQuickActions();
      addFloorManagementToolbar();
      enhanceUnlockLogFilter();
    }, 1500);
  }

  // Listen for page changes
  document.addEventListener('DOMContentLoaded', initEnhancements);
  
  // Also try immediately if DOM already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initEnhancements, 500);
  }

})();