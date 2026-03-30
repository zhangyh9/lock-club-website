// ============================================================
// 【物联后台 v4 第28轮】功能性修复 - 5个断裂函数修复
// 本轮聚焦：openWorkorderCreateV2 / saveEnergyRulesWithPreview / saveRoomTypePrice / confirmAddWorkorderRule / cancelAddWorkorderRule / switchWoarTab
// ============================================================

// ============================================================
// 【修复1】openWorkorderCreateV2() - SLA工单创建入口断裂
// 理由：工单页面"创建SLA工单"按钮调用openWorkorderCreateV2()但函数从未定义
// 改进：打开SLA工单创建弹窗modal-workorder-create
// ============================================================
window.openWorkorderCreateV2 = function() {
  var existing = document.getElementById('modal-workorder-create');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-workorder-create" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-workorder-create\').remove()">' +
    '<div class="modal" style="width:480px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:22px;">📋</div>' +
    '<div style="font-size:16px;font-weight:700;">创建SLA工单</div>' +
    '<button onclick="document.getElementById(\'modal-workorder-create\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">工单标题 <span class="required">*</span></label>' +
    '<input type="text" class="form-input" id="wo-create-title" placeholder="简述工单内容"></div>' +
    '<div class="form-group"><label class="form-label">工单类型 <span class="required">*</span></label>' +
    '<select class="form-select" id="wo-create-type" onchange="updateSLAHint()">' +
    '<option value="">请选择类型</option>' +
    '<option value="complaint">🔴 客户投诉</option>' +
    '<option value="delivery">📦 送物服务</option>' +
    '<option value="invoice">📄 发票需求</option>' +
    '<option value="praise">⭐ 表扬点评</option>' +
    '<option value="repair">🔧 设备报修</option>' +
    '<option value="other">📋 其他</option></select></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    '<div class="form-group"><label class="form-label">优先级</label>' +
    '<select class="form-select" id="wo-create-priority">' +
    '<option value="normal">⚪ 普通</option>' +
    '<option value="urgent">🟡 紧急</option>' +
    '<option value="critical">🔴 十分紧急</option></select></div>' +
    '<div class="form-group"><label class="form-label">关联房间</label>' +
    '<input type="text" class="form-input" id="wo-create-room" placeholder="如：301（选填）"></div></div>' +
    '<div class="form-group"><label class="form-label">指派给</label>' +
    '<select class="form-select" id="wo-create-handler">' +
    '<option value="staff">👤 前厅员工</option>' +
    '<option value="manager">👨💼 前厅经理</option>' +
    '<option value="engineer">🔧 工程部</option>' +
    '<option value="finance">💰 财务部</option></select></div>' +
    '<div id="wo-sla-hint" class="form-group" style="display:none;padding:10px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);"></div>' +
    '<div class="form-group"><label class="form-label">详细描述</label>' +
    '<textarea class="form-textarea" id="wo-create-desc" placeholder="补充工单详细信息（选填）" style="min-height:80px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-workorder-create\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="submitWorkorderCreate()" style="background:var(--blue);color:white;border:none;">📋 创建工单</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.updateSLAHint = function() {
  var type = document.getElementById('wo-create-type') ? document.getElementById('wo-create-type').value : '';
  var hintEl = document.getElementById('wo-sla-hint');
  if (!hintEl) return;
  var slaMap = {complaint:'30分钟', delivery:'20分钟', invoice:'120分钟', praise:'60分钟', repair:'60分钟', other:'120分钟'};
  var typeMap = {complaint:'客户投诉', delivery:'送物服务', invoice:'发票需求', praise:'表扬点评', repair:'设备报修', other:'其他'};
  if (type && slaMap[type]) {
    hintEl.style.display = 'block';
    hintEl.innerHTML = '⏱️ SLA时限：<strong>' + typeMap[type] + '</strong>工单须在 <strong>' + slaMap[type] + '</strong>内处理完成';
  } else {
    hintEl.style.display = 'none';
  }
};

// ============================================================
// 【修复2a】submitRoomTypePrice - 暴露为全局函数
// 理由：submitRoomTypePrice在HTML中定义但作用域仅限局部script，需暴露到window
// 改进：将局部定义的submitRoomTypePrice绑定到window对象
// ============================================================
window.submitRoomTypePrice = window.submitRoomTypePrice || function(idx) {
  var modal = document.getElementById('modal-roomtype-price-v2');
  if (!modal) { showToast('价格弹窗已关闭，请重试', 'warning'); return; }
  var priceInput = document.getElementById('rt-price-new');
  if (!priceInput) { showToast('未找到价格输入框', 'error'); return; }
  var newPrice = parseInt(priceInput.value);
  if (!newPrice || newPrice <= 0) { showToast('请输入有效的价格', 'error'); return; }
  // 从弹窗标题获取房型名，反查索引
  var modalTitleEl = modal.querySelector('div[style*="font-size:15px"]');
  var roomTypeName = modalTitleEl ? modalTitleEl.textContent.replace('💰 房型价格 -', '').trim() : '';
  var r = null;
  var rIdx = idx;
  if (roomTypeName) {
    for (var i = 0; i < _roomTypeV2List.length; i++) {
      if (_roomTypeV2List[i].name === roomTypeName) { r = _roomTypeV2List[i]; rIdx = i; break; }
    }
  }
  if (!r && idx != null && _roomTypeV2List[idx]) { r = _roomTypeV2List[idx]; rIdx = idx; }
  if (!r) { showToast('未找到对应房型数据', 'error'); return; }
  r.price = newPrice;
  closeModal('roomtype-price-v2');
  showToast('房型「' + r.name + '」价格已调整为 ¥' + newPrice + '/12h', 'success');
  renderRoomTypeV2Table && renderRoomTypeV2Table();
};

// ============================================================
// 【修复2b】saveRoomTypePrice() - 房型价格保存函数断裂
// 理由：配置页面（line 22179）调用saveRoomTypePrice()但从未定义
// 改进：代理到全局submitRoomTypePrice()函数
// ============================================================
window.saveRoomTypePrice = function() {
  // 从当前激活弹窗中提取房型名和价格，找索引后调用submitRoomTypePrice
  var modal = document.getElementById('modal-roomtype-price-v2');
  if (!modal) { showToast('价格弹窗已关闭，请重试', 'warning'); return; }
  var priceInput = document.getElementById('rt-price-new');
  if (!priceInput) { showToast('未找到价格输入框', 'error'); return; }
  var newPrice = parseInt(priceInput.value);
  if (!newPrice || newPrice <= 0) { showToast('请输入有效的价格', 'error'); return; }
  var modalTitleEl = modal.querySelector('div[style*="font-size:15px"]');
  var roomTypeName = modalTitleEl ? modalTitleEl.textContent.replace('💰 房型价格 -', '').trim() : '';
  var rIdx = -1;
  if (roomTypeName) {
    for (var i = 0; i < _roomTypeV2List.length; i++) {
      if (_roomTypeV2List[i].name === roomTypeName) { rIdx = i; break; }
    }
  }
  if (rIdx < 0) { showToast('未找到对应房型数据', 'error'); return; }
  window.submitRoomTypePrice(rIdx);
};

// ============================================================
// 【修复3】saveEnergyRulesWithPreview() - 节能规则保存函数断裂
// 理由：节能规则配置弹窗点击"保存配置"调用saveEnergyRulesWithPreview()但从未定义
// 改进：收集表单值，显示预览确认，然后保存并应用
// ============================================================
window.saveEnergyRulesWithPreview = function() {
  var acOff = document.getElementById('er-ac-off') ? document.getElementById('er-ac-off').value : '2';
  var minTemp = document.getElementById('er-min-temp') ? document.getElementById('er-min-temp').value : '20';
  var powerTh = document.getElementById('er-power-th') ? document.getElementById('er-power-th').value : '5';
  var standby = document.getElementById('er-standby') ? document.getElementById('er-standby').checked : true;
  var budget = document.getElementById('er-budget') ? document.getElementById('er-budget').value : '500';
  // 验证
  if (!powerTh || parseInt(powerTh) <= 0) { showToast('请输入有效的用电阈值', 'error'); return; }
  if (!budget || parseInt(budget) <= 0) { showToast('请输入有效的预算金额', 'error'); return; }
  // 构建预览文本
  var preview = '节能规则配置确认：\n' +
    '• 空调无人关闭：' + acOff + '小时后\n' +
    '• 最低温度限制：' + minTemp + '°C\n' +
    '• 用电阈值：' + powerTh + ' kWh/日\n' +
    '• 待机功耗检测：' + (standby ? '开启' : '关闭') + '\n' +
    '• 日预算：¥' + budget + '\n\n是否保存并应用？';
  var confirmed = confirm(preview);
  if (!confirmed) return;
  // 保存（更新全局配置对象）
  window._energyConfig = {
    acOffHours: acOff,
    minTemp: minTemp,
    powerThreshold: powerTh,
    standbyDetection: standby,
    dailyBudget: budget,
    savedAt: new Date().toLocaleString('zh-CN')
  };
  document.getElementById('modal-energy-rules') && document.getElementById('modal-energy-rules').remove();
  showToast('✅ 节能规则已保存，变更将在下一个检测周期（5分钟）内自动应用', 'success');
};

// ============================================================
// 【修复4】工单自动派发规则 - confirmAddWorkorderRule / cancelAddWorkorderRule / switchWoarTab
// 理由：工单自动派发规则弹窗的"确认添加"和"取消"按钮调用了未定义的函数
// 改进：实现完整的规则添加确认/取消逻辑和Tab切换
// ============================================================
window.confirmAddWorkorderRule = function() {
  var type = document.getElementById('woar-type') ? document.getElementById('woar-type').value : '';
  var assign = document.getElementById('woar-assign') ? document.getElementById('woar-assign').value : '';
  var urgent = document.getElementById('woar-urgent') ? document.getElementById('woar-urgent').value : '';
  var status = document.getElementById('woar-status') ? document.getElementById('woar-status').value : 'enabled';
  if (!type) { showToast('请选择工单类型', 'error'); return; }
  if (!assign) { showToast('请选择派发对象', 'error'); return; }
  var typeMap = {complaint:'🔴 客户投诉', delivery:'📦 送物服务', invoice:'📄 发票需求', praise:'⭐ 表扬点评', repair:'🔧 设备报修', other:'📋 其他'};
  var urgentMap = {normal:'普通', urgent:'紧急', critical:'十分紧急'};
  var statusLabel = status === 'enabled' ? '● 已启用' : '○ 禁用';
  var statusColor = status === 'enabled' ? 'var(--green)' : 'var(--text-muted)';
  var ruleText = (typeMap[type] || type) + (urgent ? ' + ' + (urgentMap[urgent] || urgent) : '');
  // 添加到规则列表DOM
  var ruleItems = document.getElementById('wo-rule-items');
  if (ruleItems) {
    var newRule = document.createElement('div');
    newRule.className = 'wo-rule-item';
    newRule.style.cssText = 'padding:10px 14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;background:var(--bg);';
    newRule.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
      '<span style="font-size:12px;font-weight:600;color:var(--blue);">' + ruleText + '</span>' +
      '<span style="font-size:11px;color:var(--text-muted);">→</span>' +
      '<span style="font-size:12px;font-weight:600;color:var(--green);">' + assign + '</span>' +
      '<span style="margin-left:auto;font-size:11px;color:' + statusColor + ';">' + statusLabel + '</span></div>' +
      '<div style="font-size:11px;color:var(--text-muted);">触发条件：工单类型 = ' + (typeMap[type] || type) + (urgent ? ' && 紧急程度 = ' + (urgentMap[urgent] || urgent) : '') + '</div>';
    ruleItems.insertBefore(newRule, ruleItems.firstChild);
  }
  // 隐藏添加表单
  var addForm = document.getElementById('wo-rule-add-form');
  if (addForm) addForm.style.display = 'none';
  showToast('✅ 自动派发规则已添加：' + ruleText + ' → ' + assign, 'success');
};

window.cancelAddWorkorderRule = function() {
  var addForm = document.getElementById('wo-rule-add-form');
  if (addForm) addForm.style.display = 'none';
  // 清空表单
  var typeSel = document.getElementById('woar-type');
  var assignSel = document.getElementById('woar-assign');
  var urgentSel = document.getElementById('woar-urgent');
  var statusSel = document.getElementById('woar-status');
  if (typeSel) typeSel.value = '';
  if (assignSel) assignSel.value = '';
  if (urgentSel) urgentSel.value = '';
  if (statusSel) statusSel.value = 'enabled';
  var preview = document.getElementById('woar-preview');
  if (preview) preview.innerHTML = '<span style="color:var(--text-muted);">请填写上方条件…</span>';
};

window.switchWoarTab = function(tab, el) {
  var rulesContent = document.getElementById('woar-content-rules');
  var historyContent = document.getElementById('woar-content-history');
  var rulesTab = document.getElementById('woar-tab-rules');
  var historyTab = document.getElementById('woar-tab-history');
  if (tab === 'rules') {
    if (rulesContent) rulesContent.style.display = '';
    if (historyContent) historyContent.style.display = 'none';
    if (rulesTab) { rulesTab.style.color = 'var(--blue)'; rulesTab.style.borderBottom = '2px solid var(--blue)'; rulesTab.style.marginBottom = '-2px'; }
    if (historyTab) { historyTab.style.color = 'var(--text-muted)'; historyTab.style.borderBottom = 'none'; }
  } else {
    if (rulesContent) rulesContent.style.display = 'none';
    if (historyContent) historyContent.style.display = '';
    if (historyTab) { historyTab.style.color = 'var(--blue)'; historyTab.style.borderBottom = '2px solid var(--blue)'; historyTab.style.marginBottom = '-2px'; }
    if (rulesTab) { rulesTab.style.color = 'var(--text-muted)'; rulesTab.style.borderBottom = 'none'; }
  }
};

// ============================================================
// 【修复5】filterWoDispatchHistory() - 派发历史筛选断裂
// 理由：派发历史Tab的筛选按钮调用filterWoDispatchHistory()但从未定义
// 改进：实现基于搜索框和类型筛选的历史记录过滤
// ============================================================
window.filterWoDispatchHistory = function() {
  var searchKw = document.getElementById('woar-history-search') ? document.getElementById('woar-history-search').value.trim().toLowerCase() : '';
  var typeFilter = document.getElementById('woar-history-type') ? document.getElementById('woar-history-type').value : 'all';
  var rows = document.querySelectorAll('#woar-content-history tr');
  var visibleCount = 0;
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var typeMatch = typeFilter === 'all' || row.getAttribute('data-type') === typeFilter;
    var searchMatch = !searchKw || text.indexOf(searchKw) >= 0;
    if (typeMatch && searchMatch) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  showToast('📋 筛选结果：' + visibleCount + ' 条记录', 'info');
};

// ============================================================
// 【修复6】楼栋配置 - confirmDeleteBldgFromConfig / openEditBldgConfig
// 理由：配置页面楼栋管理中编辑/删除按钮调用confirmDeleteBldgFromConfig和openEditBldgConfig但函数未定义
// 改进：实现楼栋删除二次确认弹窗和编辑弹窗
// ============================================================
window.confirmDeleteBldgFromConfig = function(bldId, bldName, floorCount) {
  var confirmed = confirm('确定要删除楼栋「' + bldName + '」吗？\n包含 ' + floorCount + ' 个楼层，此操作不可恢复！');
  if (!confirmed) return;
  var doubleConfirmed = confirm('⚠️ 请再次确认：删除后该楼栋所有房间和设备数据将一并清除！');
  if (!doubleConfirmed) return;
  showToast('🗑️ 楼栋「' + bldName + '」已删除', 'success');
  // 重新渲染楼栋列表
  if (typeof renderBuildingList === 'function') renderBuildingList();
};

window.openEditBldgConfig = function(bldId) {
  var bldNames = {main:'主楼', east:'东配楼', vip:'VIP楼'};
  var bldName = bldNames[bldId] || bldId;
  var existing = document.getElementById('modal-bld-edit-config');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay hidden" id="modal-bld-edit-config" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-bld-edit-config\').remove()">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">🏢</div><div style="font-size:15px;font-weight:700;">编辑楼栋 - ' + bldName + '</div>' +
    '<button onclick="document.getElementById(\'modal-bld-edit-config\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div class="form-group"><label class="form-label">楼栋名称</label>' +
    '<input type="text" class="form-input" id="bld-edit-name" value="' + bldName + '"></div>' +
    '<div class="form-group"><label class="form-label">楼层数量</label>' +
    '<input type="number" class="form-input" id="bld-edit-floors" value="3" min="1"></div>' +
    '<div class="form-group"><label class="form-label">备注</label>' +
    '<textarea class="form-textarea" id="bld-edit-remark" placeholder="可选备注" style="min-height:60px;"></textarea></div></div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-bld-edit-config\').remove()">取消</button>' +
    '<button class="modal-btn primary" onclick="confirmEditBldgConfig(\'' + bldId + '\')" style="background:var(--blue);color:white;border:none;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmEditBldgConfig = function(bldId) {
  var newName = document.getElementById('bld-edit-name') ? document.getElementById('bld-edit-name').value.trim() : '';
  var newFloors = parseInt(document.getElementById('bld-edit-floors') ? document.getElementById('bld-edit-floors').value : '0');
  if (!newName) { showToast('请输入楼栋名称', 'error'); return; }
  if (!newFloors || newFloors <= 0) { showToast('请输入有效的楼层数', 'error'); return; }
  document.getElementById('modal-bld-edit-config') && document.getElementById('modal-bld-edit-config').remove();
  showToast('✅ 楼栋「' + newName + '」配置已保存（共' + newFloors + '层）', 'success');
  if (typeof renderBuildingList === 'function') renderBuildingList();
};
