// ============================================================
// 【物联后台v4-第67轮】5个功能性断裂修复
// 修复日期：2026-03-30
// 本轮修复：confirmDeviceAction | deleteKey | kpBatch* | nextWizardStep | goCheckinStep
// ============================================================

// ============================================================
// 【改进1】设备操作确认（confirmDeviceAction）
// 理由：设备操作二次确认弹窗的确认按钮 onclick="confirmDeviceAction()" 未定义
// 业务逻辑：根据操作类型（重启/同步/固件升级/删除）执行对应操作，倒计时确认+Toast反馈
// ============================================================
window.confirmDeviceAction = function() {
  // Get action type from the modal context
  var modal = document.getElementById('modal-device-action-confirm');
  var title = document.getElementById('dac-title');
  var desc = document.getElementById('dac-desc');
  var actionType = window._pendingDeviceAction || 'restart';
  var deviceRoom = window._pendingDeviceRoom || '301';
  var deviceName = window._pendingDeviceName || '领握LH-807智能锁';
  
  if (modal) modal.classList.add('hidden');
  
  switch (actionType) {
    case 'restart':
      showToast('🔁 正在重启设备 ' + deviceRoom + '...', 'info');
      setTimeout(function() {
        showToast('✅ 设备 ' + deviceRoom + ' 已重启完成', 'success');
      }, 3000);
      break;
    case 'sync':
      showToast('🔄 正在同步设备 ' + deviceRoom + '...', 'info');
      setTimeout(function() {
        showToast('✅ 设备 ' + deviceRoom + ' 同步完成', 'success');
      }, 2000);
      break;
    case 'upgrade':
      showToast('📦 正在升级固件 ' + deviceRoom + '...', 'info');
      setTimeout(function() {
        showToast('✅ 固件升级完成，设备 ' + deviceRoom + ' 已更新', 'success');
      }, 5000);
      break;
    case 'delete':
      showToast('🗑️ 正在删除设备 ' + deviceRoom + '...', 'warning');
      setTimeout(function() {
        showToast('✅ 设备 ' + deviceRoom + ' 已从系统移除', 'success');
        if (typeof renderDeviceList === 'function') renderDeviceList();
      }, 1500);
      break;
    case 'unlock':
      // Special handling for unlock - countdown in modal
      var countEl = document.getElementById('dev-confirm-countdown');
      var btn = document.getElementById('dev-confirm-btn');
      if (btn) btn.disabled = true;
      var count = 5;
      var timer = setInterval(function() {
        count--;
        if (countEl) countEl.textContent = count;
        if (count <= 0) {
          clearInterval(timer);
          showToast('🔓 远程开锁指令已发送至 ' + deviceRoom, 'success');
          // Simulate unlock result
          setTimeout(function() {
            var resultEl = document.getElementById('unlock-result-feedback');
            if (resultEl) {
              resultEl.style.display = 'block';
              resultEl.innerHTML = '<div style="text-align:center;padding:16px;background:var(--green-bg);border:2px solid var(--green);border-radius:12px;"><div style="font-size:32px;margin-bottom:8px;">✅</div><div style="font-weight:700;color:var(--green);font-size:14px;">开锁成功</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">设备已响应，门锁已开启</div></div>';
            }
          }, 1500);
        }
      }, 1000);
      return; // Don't close modal here, countdown handles it
    default:
      showToast('⚠️ 设备操作完成', 'success');
  }
  
  // Close unlock modal if still open
  var unlockModal = document.getElementById('modal-unlock');
  if (unlockModal) unlockModal.classList.add('hidden');
};

// Helper to set pending device action (called before opening confirm modal)
window.setPendingDeviceAction = function(type, room, name) {
  window._pendingDeviceAction = type;
  window._pendingDeviceRoom = room || '301';
  window._pendingDeviceName = name || '设备';
};

// ============================================================
// 【改进2】钥匙删除（deleteKey）
// 理由：钥匙列表的删除按钮 onclick="deleteKey(0)" 未定义
// 业务逻辑：从钥匙列表删除记录，带二次确认，Toast反馈
// ============================================================
window.deleteKey = function(keyIdx) {
  var keyList = document.getElementById('key-list-body');
  if (!keyList) {
    showToast('钥匙列表不存在', 'error');
    return;
  }
  var rows = keyList.querySelectorAll('tr');
  if (keyIdx < 0 || keyIdx >= rows.length) {
    showToast('钥匙记录不存在', 'error');
    return;
  }
  var row = rows[keyIdx];
  var cells = row.querySelectorAll('td');
  var keyName = cells.length > 0 ? (cells[0].textContent.trim() + ' - ' + (cells[1].textContent.trim())) : '该钥匙';
  
  // Create confirmation modal
  var existing = document.getElementById('modal-key-delete-confirm');
  if (existing) existing.remove();
  
  var html = '<div class="modal-overlay" id="modal-key-delete-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div style="background:var(--card);border-radius:12px;width:90%;max-width:400px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">⚠️</div><div style="font-size:15px;font-weight:700;">确认删除钥匙</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:12px;font-size:13px;color:var(--red);">删除后该钥匙将无法使用，请谨慎操作</div>' +
    '<div style="font-size:13px;color:var(--text);line-height:1.6;">确定要删除 <strong style="color:var(--red);">' + keyName + '</strong> 吗？此操作不可撤回。</div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-key-delete-confirm\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="executeKeyDelete(' + keyIdx + ')" style="background:var(--red);color:white;border-color:var(--red);">🗑️ 确认删除</button></div></div></div>';
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

window.executeKeyDelete = function(keyIdx) {
  var keyList = document.getElementById('key-list-body');
  if (!keyList) return;
  var rows = keyList.querySelectorAll('tr');
  if (keyIdx >= 0 && keyIdx < rows.length) {
    rows[keyIdx].remove();
    showToast('✅ 钥匙已删除', 'success');
  }
  var modal = document.getElementById('modal-key-delete-confirm');
  if (modal) modal.remove();
};

// ============================================================
// 【改进3】密码批量操作（kpBatchCopy/kpBatchInvalidate/kpBatchDelete/kpBatchExport）
// 理由：密码列表页的批量操作按钮 onclick="kpBatchCopy()" 等未定义
// 业务逻辑：密码批量复制/作废/删除/导出，带选中状态管理
// ============================================================
window._kpSelectedPasswords = [];

window.kpBatchCopy = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  if (selected.length === 0) {
    showToast('请先选择要复制的密码', 'warning');
    return;
  }
  var passwords = [];
  selected.forEach(function(cb) {
    var row = cb.closest('tr');
    var pwdCell = row.querySelector('td:nth-child(2)');
    if (pwdCell) passwords.push(pwdCell.textContent.trim());
  });
  var text = passwords.join('\n');
  try {
    navigator.clipboard.writeText(text).then(function() {
      showToast('📋 已复制 ' + passwords.length + ' 个密码到剪贴板', 'success');
    }).catch(function() {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('📋 已复制 ' + passwords.length + ' 个密码到剪贴板', 'success');
    });
  } catch (e) {
    showToast('复制失败，请手动复制', 'error');
  }
};

window.kpBatchInvalidate = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  if (selected.length === 0) {
    showToast('请先选择要作废的密码', 'warning');
    return;
  }
  var existing = document.getElementById('modal-kp-batch-invalid');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-kp-batch-invalid" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div style="background:var(--card);border-radius:12px;width:90%;max-width:420px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">❌</div><div style="font-size:15px;font-weight:700;">批量作废密码</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-bottom:12px;font-size:13px;color:var(--orange);">⚠️ 确认要作废选中的 <strong>' + selected.length + '</strong> 个密码吗？作废后密码将立即失效。</div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-kp-batch-invalid\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="executeKpBatchInvalidate()" style="background:var(--orange);color:white;border-color:var(--orange);">❌ 确认作废</button></div></div></div>';
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

window.executeKpBatchInvalidate = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  var count = 0;
  selected.forEach(function(cb) {
    var row = cb.closest('tr');
    var statusCell = row.querySelector('td:nth-child(4)');
    if (statusCell) {
      statusCell.innerHTML = '<span class="tbadge red">已作废</span>';
      cb.checked = false;
      count++;
    }
  });
  document.getElementById('modal-kp-batch-invalid') && document.getElementById('modal-kp-batch-invalid').remove();
  document.getElementById('kp-batch-toolbar') && (document.getElementById('kp-batch-toolbar').style.display = 'none');
  showToast('❌ 已批量作废 ' + count + ' 个密码', 'success');
};

window.kpBatchDelete = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  if (selected.length === 0) {
    showToast('请先选择要删除的密码', 'warning');
    return;
  }
  var existing = document.getElementById('modal-kp-batch-delete');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-kp-batch-delete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)this.remove()">' +
    '<div style="background:var(--card);border-radius:12px;width:90%;max-width:420px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:28px;">🗑️</div><div style="font-size:15px;font-weight:700;">批量删除密码</div></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:12px;font-size:13px;color:var(--red);">⚠️ 确认要删除选中的 <strong>' + selected.length + '</strong> 个密码吗？此操作不可撤回！</div></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-kp-batch-delete\').remove()">取消</button>' +
    '<button class="modal-btn" onclick="executeKpBatchDelete()" style="background:var(--red);color:white;border-color:var(--red);">🗑️ 确认删除</button></div></div></div>';
  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

window.executeKpBatchDelete = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  var count = 0;
  selected.forEach(function(cb) {
    var row = cb.closest('tr');
    if (row) {
      row.remove();
      count++;
    }
  });
  document.getElementById('modal-kp-batch-delete') && document.getElementById('modal-kp-batch-delete').remove();
  document.getElementById('kp-batch-toolbar') && (document.getElementById('kp-batch-toolbar').style.display = 'none');
  showToast('🗑️ 已删除 ' + count + ' 个密码', 'success');
};

window.kpBatchExport = function() {
  var selected = document.querySelectorAll('.kp-row-check:checked');
  if (selected.length === 0) {
    showToast('请先选择要导出的密码', 'warning');
    return;
  }
  var rows = [];
  selected.forEach(function(cb) {
    var row = cb.closest('tr');
    var cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      rows.push({
        type: cells[0].textContent.trim(),
        password: cells[1].textContent.trim(),
        room: cells[2].textContent.trim(),
        status: cells[3].textContent.trim()
      });
    }
  });
  var csv = '密码类型,密码,房间,状态\n';
  rows.forEach(function(r) {
    csv += '"' + r.type + '","' + r.password + '","' + r.room + '","' + r.status + '"\n';
  });
  var blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '密码导出_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 已导出 ' + rows.length + ' 条密码记录', 'success');
};

// ============================================================
// 【改进4】楼栋初始化向导步骤导航（nextWizardStep）
// 理由：楼栋快速初始化向导的三步导航 onclick="nextWizardStep(1/2/3)" 未定义
// 业务逻辑：向导步骤切换，显示/隐藏对应步骤面板，数据校验
// ============================================================
window.wizardStep = 1;

window.nextWizardStep = function(step) {
  // Validate current step before proceeding
  if (step > wizardStep) {
    if (wizardStep === 1) {
      var bldName = document.getElementById('wiz-bld-name');
      if (bldName && !bldName.value.trim()) {
        showToast('请填写楼栋名称', 'warning');
        return;
      }
    }
  }
  
  wizardStep = step;
  
  // Update step indicators
  var tabs = document.querySelectorAll('.wiz-step-tab');
  tabs.forEach(function(tab, i) {
    var tabStep = i + 1;
    if (tabStep === wizardStep) {
      tab.style.fontWeight = '600';
      tab.style.color = 'var(--blue)';
    } else if (tabStep < wizardStep) {
      tab.style.fontWeight = '600';
      tab.style.color = 'var(--green)';
    } else {
      tab.style.fontWeight = '400';
      tab.style.color = 'var(--text-muted)';
    }
  });
  
  // Show/hide step content
  var step1 = document.getElementById('wiz-step-1');
  var step2 = document.getElementById('wiz-step-2');
  var step3 = document.getElementById('wiz-step-3');
  if (step1) step1.style.display = step === 1 ? 'block' : 'none';
  if (step2) step2.style.display = step === 2 ? 'block' : 'none';
  if (step3) step3.style.display = step === 3 ? 'block' : 'none';
  
  // Update next button
  var nextBtn = document.getElementById('wiz-next-btn');
  if (nextBtn) {
    if (step === 3) {
      nextBtn.textContent = '🏢 确认创建';
      nextBtn.style.background = 'var(--green)';
      nextBtn.onclick = function() { submitWizardFinal(); };
    } else {
      nextBtn.textContent = '下一步 →';
      nextBtn.style.background = 'var(--blue)';
      nextBtn.onclick = function() { nextWizardStep(wizardStep + 1); };
    }
  }
  
  // Update back button visibility
  var backBtn = document.getElementById('wiz-back-btn');
  if (backBtn) backBtn.style.display = step > 1 ? 'inline-block' : 'none';
};

window.submitWizardFinal = function() {
  var bldName = document.getElementById('wiz-bld-name');
  var bldCode = document.getElementById('wiz-bld-code');
  var floors = document.getElementById('wiz-floors');
  var name = bldName ? bldName.value.trim() : '';
  if (!name) {
    showToast('楼栋名称不能为空', 'error');
    return;
  }
  var code = bldCode ? bldCode.value.trim() : '';
  var floorCount = floors ? parseInt(floors.value) || 3 : 3;
  showToast('🏢 楼栋"' + name + '"创建成功（' + floorCount + '层）', 'success');
  closeModal('quick-setup-wizard');
  // Refresh building list if function exists
  if (typeof renderCfgBuildingList === 'function') renderCfgBuildingList();
  // Reset wizard
  wizardStep = 1;
};

// ============================================================
// 【改进5】入住办理向导步骤导航（goCheckinStep）
// 理由：入住办理三步向导 onclick="goCheckinStep(2/3)" 未定义
// 业务逻辑：入住办理向导步骤切换，数据传递，显示预览信息
// ============================================================
window.checkinStep = 1;

window.goCheckinStep = function(step) {
  var nextBtn = document.getElementById('checkin-step1-next');
  var nextBtn2 = document.getElementById('checkin-step2-next');
  
  // Validate current step
  if (step > checkinStep) {
    if (checkinStep === 1) {
      var nameEl = document.getElementById('checkin-name');
      var phoneEl = document.getElementById('checkin-phone');
      var roomEl = document.getElementById('checkin-room-select');
      if ((nameEl && !nameEl.value.trim()) || (phoneEl && !phoneEl.value.trim()) || (roomEl && !roomEl.value)) {
        showToast('请填写完整的入住信息', 'warning');
        if (nextBtn) nextBtn.disabled = true;
        return;
      }
    }
    if (checkinStep === 2) {
      var depositEl = document.getElementById('checkin-deposit');
      if (depositEl && !depositEl.value) {
        showToast('请填写押金金额', 'warning');
        if (nextBtn2) nextBtn2.disabled = true;
        return;
      }
    }
  }
  
  checkinStep = step;
  
  // Show/hide step panels
  var step1 = document.getElementById('checkin-step-1');
  var step2 = document.getElementById('checkin-step-2');
  var step3 = document.getElementById('checkin-step-3');
  if (step1) step1.style.display = step === 1 ? 'block' : 'none';
  if (step2) step2.style.display = step === 2 ? 'block' : 'none';
  if (step3) step3.style.display = step === 3 ? 'block' : 'none';
  
  // Update confirmation info if on step 2
  if (step >= 2) {
    var nameEl = document.getElementById('checkin-name');
    var phoneEl = document.getElementById('checkin-phone');
    var roomEl = document.getElementById('checkin-room-select');
    var dateIn = document.getElementById('checkin-date-in');
    var depositEl = document.getElementById('checkin-deposit');
    
    var name = nameEl ? nameEl.value : '';
    var phone = phoneEl ? phoneEl.value : '';
    var room = roomEl ? (roomEl.options[roomEl.selectedIndex] ? roomEl.options[roomEl.selectedIndex].text : '') : '';
    var dateStr = dateIn ? dateIn.value : new Date().toISOString().slice(0,10);
    var deposit = depositEl ? depositEl.value : '100';
    
    var nameC = document.getElementById('confirm-name');
    var phoneC = document.getElementById('confirm-phone');
    var roomC = document.getElementById('confirm-room');
    var dateC = document.getElementById('confirm-date-in');
    var depositC = document.getElementById('confirm-deposit');
    
    if (nameC) nameC.textContent = name;
    if (phoneC) phoneC.textContent = phone;
    if (roomC) roomC.textContent = room;
    if (dateC) dateC.textContent = dateStr;
    if (depositC) depositC.textContent = '¥' + deposit;
  }
  
  // Update navigation buttons
  if (step === 3) {
    // Final confirmation - disable next button
    if (nextBtn2) {
      nextBtn2.textContent = '✅ 确认入住 →';
      nextBtn2.disabled = false;
      nextBtn2.onclick = function() { submitCheckinFinal(); };
    }
  } else {
    if (nextBtn2) {
      nextBtn2.textContent = '下一步 →';
      nextBtn2.disabled = false;
      nextBtn2.onclick = function() { goCheckinStep(3); };
    }
  }
  
  var backBtn = document.getElementById('checkin-back-btn');
  if (backBtn) backBtn.style.display = step > 1 ? 'inline-block' : 'none';
};

window.submitCheckinFinal = function() {
  var nameEl = document.getElementById('checkin-name');
  var phoneEl = document.getElementById('checkin-phone');
  var roomEl = document.getElementById('checkin-room-select');
  var depositEl = document.getElementById('checkin-deposit');
  
  var name = nameEl ? nameEl.value.trim() : '';
  var phone = phoneEl ? phoneEl.value.trim() : '';
  var room = roomEl ? roomEl.value : '';
  var deposit = depositEl ? depositEl.value : '100';
  
  if (!name || !phone || !room) {
    showToast('入住信息不完整', 'error');
    return;
  }
  
  showToast('✅ 入住办理成功！房间：' + room + '，押金：¥' + deposit, 'success');
  closeModal('checkin');
  
  // Reset form
  checkinStep = 1;
  if (nameEl) nameEl.value = '';
  if (phoneEl) phoneEl.value = '';
  if (roomEl) roomEl.selectedIndex = 0;
  if (depositEl) depositEl.value = '100';
  
  // Refresh room status if function exists
  if (typeof renderRoomGrid === 'function') renderRoomGrid();
};

console.log('[iter67] 5个功能性断裂修复完成：confirmDeviceAction / deleteKey / kpBatch* / nextWizardStep / goCheckinStep');
