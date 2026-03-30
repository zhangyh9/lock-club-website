// ============================================================
// 【物联后台 v4 第52轮】5个功能性改进
// ============================================================
// 改进1: filterKeysByType 钥匙类型筛选函数实现（钥匙信息Tab筛选功能）
// 改进2: 批量设备通断电弹窗完善（批量控制页面逻辑闭环）
// 改进3: 工单创建弹窗增加备注字段（服务工单完整记录）
// 改进4: 批量清洁提交后房间状态联动更新（清洁任务下发+房间状态变更）
// 改进5: 批量入住第2步信息填写校验+提交函数完善（闭环）
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：filterKeysByType 钥匙类型筛选函数 ----------
  window.filterKeysByType = function(type, el) {
    var tbody = document.getElementById('keys-table-body');
    if (!tbody) return;
    // Update tab active state
    el.parentElement.querySelectorAll('.card-tab').forEach(function(t) {
      t.classList.remove('active');
      t.style.background = 'var(--bg)';
      t.style.color = 'var(--text-light)';
      t.style.borderColor = 'var(--border)';
    });
    el.classList.add('active');
    el.style.background = 'var(--blue-bg)';
    el.style.color = 'var(--blue)';
    el.style.borderColor = 'var(--blue)';
    // Filter rows
    var rows = tbody.querySelectorAll('tr[data-type]');
    var visibleCount = 0;
    rows.forEach(function(row) {
      var rowType = row.getAttribute('data-type');
      var show = (type === 'all' || rowType === type);
      row.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    // Update empty state
    var existingEmpty = tbody.querySelector('.keys-empty-state');
    if (visibleCount === 0) {
      if (!existingEmpty) {
        var emptyTr = document.createElement('tr');
        emptyTr.className = 'keys-empty-state';
        emptyTr.innerHTML = '<td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;">暂无此类钥匙</td>';
        tbody.appendChild(emptyTr);
      }
    } else if (existingEmpty) {
      existingEmpty.remove();
    }
    showToast('已筛选：' + visibleCount + ' 条钥匙', 'info');
  };

  // ---------- 改进2：批量设备通断电弹窗完善 ----------
  window.openBatchDeviceControlModal = function() {
    var existing = document.getElementById('modal-batch-device-control');
    if (existing) existing.remove();
    var html = '<div class="modal-overlay" id="modal-batch-device-control" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
      '<div class="modal" style="width:500px;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:28px;">⚡</div><div style="font-size:15px;font-weight:700;">批量设备控制</div>' +
      '<button onclick="closeModal(\'batch-device-control\')" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;display:flex;flex-direction:column;gap:16px;">' +
      '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);">💡 当前有 <strong>3</strong> 个设备在线可控制</div>' +
      '<div class="form-group"><label class="form-label">控制指令</label>' +
      '<select class="form-select" id="bdc-action" style="width:100%;padding:8px 12px;">' +
      '<option value="power_on">⚡ 批量通电（开启所有设备）</option>' +
      '<option value="power_off">🔌 批量断电（关闭所有设备）</option>' +
      '<option value="reset">🔄 重启设备</option>' +
      '<option value="sync">📡 强制同步</option></select></div>' +
      '<div class="form-group"><label class="form-label">选择楼层</label>' +
      '<select class="form-select" id="bdc-floor" style="width:100%;padding:8px 12px;">' +
      '<option value="all">全部楼层</option>' +
      '<option value="3">3层</option>' +
      '<option value="2">2层</option>' +
      '<option value="1">1层</option></select></div>' +
      '<div class="form-group"><label class="form-label">设备筛选</label>' +
      '<select class="form-select" id="bdc-status" style="width:100%;padding:8px 12px;">' +
      '<option value="all">全部设备</option>' +
      '<option value="online">🟢 在线设备</option>' +
      '<option value="offline">🔴 离线设备</option>' +
      '<option value="lowbat">🟡 低电量设备</option></select></div>' +
      '<div class="form-group"><label class="form-label">执行时间</label>' +
      '<select class="form-select" id="bdc-delay" style="width:100%;padding:8px 12px;">' +
      '<option value="now">立即执行</option>' +
      '<option value="5min">5分钟后执行</option>' +
      '<option value="30min">30分钟后执行</option>' +
      '<option value="1hour">1小时后执行</option></select></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="closeModal(\'batch-device-control\')">取消</button>' +
      '<button class="modal-btn" onclick="submitBatchDeviceControl()" style="background:var(--purple);color:white;border:none;">⚡ 确认执行</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.submitBatchDeviceControl = function() {
    var action = document.getElementById('bdc-action');
    var floor = document.getElementById('bdc-floor');
    var status = document.getElementById('bdc-status');
    var delay = document.getElementById('bdc-delay');
    if (!action || !floor || !status || !delay) {
      showToast('参数读取错误', 'error');
      return;
    }
    var actionText = action.options[action.selectedIndex].text;
    var delayText = delay.options[delay.selectedIndex].text;
    var deviceCount = Math.floor(Math.random() * 5) + 3; // 3-7 devices
    closeModal('batch-device-control');
    if (delay.value === 'now') {
      showToast('⚡ ' + actionText + ' - ' + deviceCount + '台设备执行中…', 'success');
      setTimeout(function() {
        showToast('✅ ' + deviceCount + '台设备' + actionText.replace('批量', '') + '成功', 'success');
      }, 1500);
    } else {
      showToast('⏰ 已设置：' + delayText + '后执行「' + actionText + '」', 'info');
    }
  };

  // ---------- 改进3：工单创建弹窗增加备注字段 ----------
  // Patch openCreateWorkorderModal to add notes field
  var originalOpenCreateWO;
  try { originalOpenCreateWO = window.openCreateWorkorderModal; } catch(e) {}
  window.openCreateWorkorderModal = function() {
    // Find and enhance the existing modal if it has a textarea for notes
    setTimeout(function() {
      var modal = document.querySelector('#modal-wo-create');
      if (!modal) return;
      var existingNotes = modal.querySelector('#wo-notes');
      if (existingNotes) return; // Already enhanced
      // Find the form body
      var formBody = modal.querySelector('.modal-body');
      if (!formBody) return;
      // Add notes field before the footer buttons
      var notesDiv = document.createElement('div');
      notesDiv.className = 'form-group';
      notesDiv.innerHTML = '<label class="form-label">📝 备注说明</label>' +
        '<textarea id="wo-notes" class="form-input" placeholder="补充工单相关信息，如：具体位置、紧急程度、联系人电话等…" ' +
        'style="resize:vertical;min-height:60px;width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;"></textarea>';
      // Insert before the last form-group or at end of body
      var lastGroup = formBody.querySelector('.form-group:last-child');
      if (lastGroup && lastGroup.querySelector('select')) {
        formBody.insertBefore(notesDiv, lastGroup.nextSibling);
      } else {
        formBody.appendChild(notesDiv);
      }
    }, 100);
    // Call original if exists
    if (originalOpenCreateWO) {
      try { originalOpenCreateWO.apply(this, arguments); } catch(e) {}
    }
  };

  // Patch submitWorkorder to include notes
  var originalSubmitWorkorder;
  try { originalSubmitWorkorder = window.submitWorkorder; } catch(e) {}
  window.submitWorkorder = function() {
    var type = document.getElementById('wo-type');
    var priority = document.getElementById('wo-priority');
    var room = document.getElementById('wo-room');
    var desc = document.getElementById('wo-desc');
    var notes = document.getElementById('wo-notes');
    if (!type || !priority || !room || !desc) {
      showToast('请填写完整工单信息', 'error');
      return;
    }
    var typeVal = type.value;
    var typeText = type.options[type.selectedIndex].text;
    var priorityText = priority.options[priority.selectedIndex].text;
    var roomVal = room.value.trim();
    var descVal = desc.value.trim();
    var notesVal = notes ? notes.value.trim() : '';
    if (!descVal) {
      showToast('请填写工单描述', 'error');
      return;
    }
    // Build full description with notes
    var fullDesc = descVal + (notesVal ? '\n📝 备注：' + notesVal : '');
    // Close modal
    closeModal('wo-create');
    showToast('✅ 工单「' + typeText + '」已提交，等待员工接单', 'success');
    // Add to workorder list
    if (window._workorderList && typeof _workorderList !== 'undefined') {
      var newWo = {
        id: 'WO' + String(Date.now()).slice(-6),
        type: typeVal,
        typeText: typeText,
        priority: priority.value,
        priorityText: priorityText,
        room: roomVal,
        desc: fullDesc,
        status: 'pending',
        createTime: new Date().toLocaleString('zh-CN')
      };
      _workorderList.unshift(newWo);
      if (window.renderWorkorderTable) renderWorkorderTable();
    }
  };

  // ---------- 改进4：批量清洁提交后房间状态联动更新 ----------
  var originalSubmitBatchClean;
  try { originalSubmitBatchClean = window.submitBatchClean; } catch(e) {}
  window.submitBatchClean = function() {
    var checks = document.querySelectorAll('#modal-batch-clean input[type="checkbox"]:checked');
    if (checks.length === 0) {
      showToast('请至少选择一个房间', 'error');
      return;
    }
    var note = document.getElementById('clean-note');
    var noteVal = note ? note.value.trim() : '';
    var count = checks.length;
    var roomNums = [];
    checks.forEach(function(c) {
      var row = c.closest('tr');
      if (row) {
        var roomCell = row.querySelector('td:nth-child(2)');
        if (roomCell) roomNums.push(roomCell.textContent.trim());
      }
    });
    closeModal('batch-clean');
    // Update room cards status to "清洁中"
    roomNums.forEach(function(roomNum) {
      var card = document.querySelector('.room-card[data-room="' + roomNum + '"], .room-card');
      if (card && !card.classList.contains('occupied')) {
        card.classList.add('cleaning');
        card.classList.remove('empty');
      }
    });
    showToast('🧹 清洁任务已下发：' + count + '间房' + (noteVal ? '，备注：' + noteVal : ''), 'success');
    // Re-render room grid to reflect changes
    if (window.renderRoomGrid) renderRoomGrid();
  };

  // Ensure submitBatchClean is called properly by checking for it in the clean modal
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var cleanModal = document.getElementById('modal-batch-clean');
      if (cleanModal) {
        var submitBtn = cleanModal.querySelector('.modal-btn.primary');
        if (submitBtn && !submitBtn.getAttribute('onclick').includes('submitBatchClean')) {
          submitBtn.setAttribute('onclick', 'submitBatchClean()');
        }
      }
    }, 1000);
  });

  // ---------- 改进5：批量入住第2步信息填写校验+提交函数 ----------
  window.submitBatchCheckin = function() {
    var rooms = window._bciSelectedRooms || [];
    if (rooms.length === 0) {
      showToast('请至少选择一个房间', 'error');
      return;
    }
    var name = document.getElementById('bci-name');
    var phone = document.getElementById('bci-phone');
    var idCard = document.getElementById('bci-idcard');
    var checkinDate = document.getElementById('bci-date');
    var checkoutDate = document.getElementById('bci-checkout-date');
    if (!name || !phone || !idCard || !checkinDate || !checkoutDate) {
      showToast('表单读取错误，请重试', 'error');
      return;
    }
    var nameVal = name.value.trim();
    var phoneVal = phone.value.trim();
    var idCardVal = idCard.value.trim();
    var checkinDateVal = checkinDate.value;
    var checkoutDateVal = checkoutDate.value;
    // Validation
    if (!nameVal) {
      showToast('请输入入住人姓名', 'error');
      name.focus();
      return;
    }
    if (!phoneVal || !/^1[3-9]\d{9}$/.test(phoneVal)) {
      showToast('请输入正确的手机号', 'error');
      phone.focus();
      return;
    }
    if (!idCardVal || !/^\d{17}[\dXx]$/.test(idCardVal)) {
      showToast('请输入正确的身份证号（18位）', 'error');
      idCard.focus();
      return;
    }
    if (!checkinDateVal) {
      showToast('请选择入住日期', 'error');
      return;
    }
    if (!checkoutDateVal) {
      showToast('请选择退房日期', 'error');
      return;
    }
    if (checkoutDateVal <= checkinDateVal) {
      showToast('退房日期必须晚于入住日期', 'error');
      return;
    }
    // Submit
    closeModal('batch-checkin');
    showToast('🏨 批量入住成功：' + rooms.length + '间房，入住人：' + nameVal, 'success');
    // Update record list
    if (window._recordList && typeof _recordList !== 'undefined') {
      rooms.forEach(function(room) {
        _recordList.unshift({
          id: 'REC' + Date.now() + Math.random().toString(36).slice(2, 5),
          type: 'in',
          name: nameVal,
          phone: phoneVal,
          room: room,
          roomType: '标准间',
          time: new Date().toLocaleString('zh-CN'),
          status: 'active'
        });
      });
      if (window.renderRecordTable) renderRecordTable();
    }
    // Update room cards to occupied
    if (window.renderRoomGrid) renderRoomGrid();
    window._bciSelectedRooms = [];
  };

  // Inject validation into batch checkin modal on open
  var originalBciOpen = window.openBatchCheckinModal;
  window.openBatchCheckinModal = function() {
    var modal = document.getElementById('modal-batch-checkin');
    if (modal) {
      modal.classList.remove('hidden');
      var grid = document.getElementById('bci-room-grid');
      if (grid && !grid.innerHTML.trim()) {
        if (window.renderBciRoomGrid) renderBciRoomGrid();
      }
      if (window.goBciStep1) goBciStep1();
    }
    // Enhance step 2 form with validation
    setTimeout(function() {
      var step2Panel = document.getElementById('bci-step-2');
      if (step2Panel && !step2Panel.dataset.enhanced) {
        step2Panel.dataset.enhanced = 'true';
        var phoneInput = step2Panel.querySelector('input[id="bci-phone"]');
        if (phoneInput) {
          phoneInput.addEventListener('blur', function() {
            if (this.value && !/^1[3-9]\d{9}$/.test(this.value)) {
              this.style.borderColor = 'var(--red)';
              showToast('手机号格式不正确', 'error');
            } else {
              this.style.borderColor = '';
            }
          });
        }
        var idInput = step2Panel.querySelector('input[id="bci-idcard"]');
        if (idInput) {
          idInput.addEventListener('blur', function() {
            if (this.value && !/^\d{17}[\dXx]$/.test(this.value)) {
              this.style.borderColor = 'var(--red)';
              showToast('身份证号格式不正确', 'error');
            } else {
              this.style.borderColor = '';
            }
          });
        }
      }
    }, 200);
  };

  // 初始化
  function initEnhancements() {
    setTimeout(function() {
      // Ensure modal-wo-create has proper onclick for submit
      var woModal = document.getElementById('modal-wo-create');
      if (woModal) {
        var btn = woModal.querySelector('.modal-btn.primary');
        if (btn && !btn.getAttribute('onclick')) {
          btn.setAttribute('onclick', 'submitWorkorder()');
        }
      }
    }, 800);
  }

  document.addEventListener('DOMContentLoaded', initEnhancements);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initEnhancements, 300);
  }

})();
