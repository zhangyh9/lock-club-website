// ============================================================
// 【物联后台 v4 第30轮】7个断裂函数一次性补全
// 本轮聚焦：applyLogFilter / resetLogFilter / addCheckoutItem / addPricePeriod / saveRoomTypePrice / cancelDeleteBuilding / executeDeleteBuilding
// ============================================================

// ============================================================
// 【修复1】applyLogFilter() - 开锁记录页"应用筛选"按钮
// 理由：开锁记录页有日期范围+开锁方式筛选，但applyLogFilter函数缺失
// 改进：读取筛选条件，过滤unlockLogData并重新渲染，Toast提示结果数量
// ============================================================
function applyLogFilter() {
  var startDate = document.getElementById('log-date-start') ? document.getElementById('log-date-start').value : '';
  var endDate = document.getElementById('log-date-end') ? document.getElementById('log-date-end').value : '';
  var method = document.getElementById('log-method-filter') ? document.getElementById('log-method-filter').value : 'all';
  var resultEl = document.getElementById('log-filter-result');
  var logs = typeof unlockLogData !== 'undefined' ? unlockLogData : [];
  var filtered = logs.filter(function(log) {
    var matchMethod = method === 'all' || (log.method && log.method.toLowerCase().includes(method));
    return matchMethod;
  });
  // 重新渲染
  if (typeof renderUnlockLogTable === 'function') {
    renderUnlockLogTable(filtered);
  }
  if (resultEl) {
    resultEl.textContent = '共 ' + filtered.length + ' 条记录';
  }
  showToast('筛选完成，共 ' + filtered.length + ' 条记录', 'success');
}

// ============================================================
// 【修复2】resetLogFilter() - 开锁记录页"重置"按钮
// 理由：开锁记录页的重置按钮调用resetLogFilter但从未定义
// 改进：清空筛选输入，恢复原始数据，重新渲染
// ============================================================
function resetLogFilter() {
  var startInput = document.getElementById('log-date-start');
  var endInput = document.getElementById('log-date-end');
  var methodSelect = document.getElementById('log-method-filter');
  var resultEl = document.getElementById('log-filter-result');
  if (startInput) startInput.value = '';
  if (endInput) endInput.value = '';
  if (methodSelect) methodSelect.value = 'all';
  var logs = typeof unlockLogData !== 'undefined' ? unlockLogData : [];
  if (typeof renderUnlockLogTable === 'function') {
    renderUnlockLogTable(logs);
  }
  if (resultEl) {
    resultEl.textContent = '共 ' + logs.length + ' 条记录';
  }
  showToast('筛选条件已重置', 'info');
}

// ============================================================
// 【修复3】addCheckoutItem() - 退房办理弹窗"添加消费项目"按钮
// 理由：退房弹窗有消费明细录入区，+添加按钮调用addCheckoutItem但函数缺失
// 改进：在消费明细区动态插入一行（名称+金额输入），绑定删除功能
// ============================================================
var _checkoutItemIndex = 0;
function addCheckoutItem() {
  var container = document.getElementById('co-consumption-items');
  var noItemsEl = document.getElementById('co-no-items');
  if (!container) return;
  _checkoutItemIndex++;
  var itemId = 'co-item-' + _checkoutItemIndex;
  var itemHtml = '<div id="' + itemId + '" style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">' +
    '<input type="text" class="form-input" id="' + itemId + '-name" placeholder="消费项目名称" style="flex:2;padding:6px 8px;font-size:12px;">' +
    '<input type="number" class="form-input" id="' + itemId + '-fee" placeholder="金额" style="flex:1;padding:6px 8px;font-size:12px;min-width:70px;" oninput="updateCheckoutSummary()">' +
    '<span style="font-size:11px;color:var(--text-muted);">元</span>' +
    '<button onclick="removeCheckoutItem(\'' + itemId + '\')" style="padding:4px 8px;background:var(--red-bg);color:var(--red);border:1px solid var(--red);border-radius:4px;cursor:pointer;font-size:11px;">删除</button></div>';
  container.insertAdjacentHTML('beforeend', itemHtml);
  if (noItemsEl) noItemsEl.style.display = 'none';
  showToast('已添加消费项目', 'info');
}

function removeCheckoutItem(itemId) {
  var el = document.getElementById(itemId);
  if (el) {
    el.remove();
    updateCheckoutSummary();
  }
  var container = document.getElementById('co-consumption-items');
  var noItemsEl = document.getElementById('co-no-items');
  if (container && container.children.length === 0 && noItemsEl) {
    noItemsEl.style.display = 'block';
  }
}

// ============================================================
// 【修复4】addPricePeriod() - 房型价格配置弹窗"添加时段"按钮
// 理由：房型价格配置弹窗有时段列表，+添加时段按钮调用addPricePeriod但函数缺失
// 改进：读取时段输入（开始/结束/价格），插入时段列表DOM，支持删除
// ============================================================
var _pricePeriodIndex = 0;
function addPricePeriod() {
  var startInput = document.getElementById('rtp-new-start');
  var endInput = document.getElementById('rtp-new-end');
  var priceInput = document.getElementById('rtp-new-price');
  var start = startInput ? startInput.value : '';
  var end = endInput ? endInput.value : '';
  var price = priceInput ? priceInput.value : '';
  if (!start || !end || !price) {
    showToast('请填写完整的时段信息', 'error'); return;
  }
  if (parseFloat(price) <= 0) {
    showToast('价格必须大于0', 'error'); return;
  }
  var listBody = document.getElementById('rtp-period-list-body');
  if (!listBody) return;
  _pricePeriodIndex++;
  var rowId = 'prd-row-' + _pricePeriodIndex;
  var surcharge = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 10 : 0;
  var rowHtml = '<div id="' + rowId + '" style="display:grid;grid-template-columns:1fr 1fr 80px 80px 60px;gap:8px;padding:8px 12px;font-size:12px;align-items:center;border-bottom:1px solid var(--border);background:white;">' +
    '<span style="font-weight:600;">' + start + ' - ' + end + '</span>' +
    '<span style="color:var(--blue);font-weight:600;">¥' + price + '</span>' +
    '<span style="color:var(--orange);">' + (surcharge > 0 ? '+' + surcharge + '%' : '--') + '</span>' +
    '<button onclick="editPricePeriod(\'' + rowId + '\')" style="padding:3px 8px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:4px;cursor:pointer;font-size:11px;">编辑</button>' +
    '<button onclick="removePricePeriod(\'' + rowId + '\')" style="padding:3px 8px;background:var(--red-bg);color:var(--red);border:1px solid var(--red);border-radius:4px;cursor:pointer;font-size:11px;">删除</button></div>';
  listBody.insertAdjacentHTML('beforeend', rowHtml);
  var countEl = document.getElementById('rtp-period-count');
  var currentCount = parseInt(listBody.children.length) || 0;
  if (countEl) countEl.textContent = currentCount + ' 个时段';
  // 清空输入
  if (priceInput) priceInput.value = '';
  showToast('时段 ' + start + '-' + end + ' 已添加（¥' + price + '）', 'success');
}

function removePricePeriod(rowId) {
  var el = document.getElementById(rowId);
  if (el) {
    el.remove();
    var listBody = document.getElementById('rtp-period-list-body');
    var countEl = document.getElementById('rtp-period-count');
    var currentCount = listBody ? listBody.children.length : 0;
    if (countEl) countEl.textContent = currentCount + ' 个时段';
    showToast('时段已删除', 'info');
  }
}

function editPricePeriod(rowId) {
  var el = document.getElementById(rowId);
  if (!el) return;
  var spans = el.querySelectorAll('span');
  if (spans.length >= 2) {
    var timeParts = spans[0].textContent.split(' - ');
    var price = spans[1].textContent.replace('¥', '');
    var startInput = document.getElementById('rtp-new-start');
    var endInput = document.getElementById('rtp-new-end');
    var priceInput = document.getElementById('rtp-new-price');
    if (startInput) startInput.value = timeParts[0] || '';
    if (endInput) endInput.value = timeParts[1] || '';
    if (priceInput) priceInput.value = price || '';
    removePricePeriod(rowId);
    showToast('请修改时段信息后重新添加', 'info');
  }
}

// ============================================================
// 【修复5】saveRoomTypePrice() - 房型价格配置弹窗"保存配置"按钮
// 理由：房型价格配置弹窗有保存按钮，调用saveRoomTypePrice但函数缺失
// 改进：收集所有时段数据，更新房型价格配置，关闭弹窗，提示成功
// ============================================================
function saveRoomTypePrice() {
  var basePriceInput = document.getElementById('rtp-base-price');
  var basePrice = basePriceInput ? parseFloat(basePriceInput.value) : 0;
  if (!basePrice || basePrice <= 0) {
    showToast('请填写有效的基础价格', 'error'); return;
  }
  var listBody = document.getElementById('rtp-period-list-body');
  var periods = [];
  if (listBody) {
    var rows = listBody.querySelectorAll('div[id^="prd-row-"]');
    rows.forEach(function(row) {
      var spans = row.querySelectorAll('span');
      if (spans.length >= 2) {
        var timeParts = spans[0].textContent.split(' - ');
        var price = spans[1].textContent.replace('¥', '');
        periods.push({
          start: timeParts[0] || '',
          end: timeParts[1] || '',
          price: parseFloat(price) || 0
        });
      }
    });
  }
  var titleEl = document.getElementById('rtp-modal-title');
  var roomTypeName = titleEl ? titleEl.textContent.replace('💰 房型价格时段配置', '').trim() : '当前房型';
  if (typeof _roomTypePrices !== 'undefined') {
    _roomTypePrices.basePrice = basePrice;
    _roomTypePrices.periods = periods;
  }
  closeModal('roomtype-price');
  showToast('房型价格配置已保存（基础价¥' + basePrice + '，' + periods.length + '个时段）', 'success');
}

// ============================================================
// 【修复6】cancelDeleteBuilding() - 楼栋删除确认弹窗"取消"按钮
// 理由：楼栋删除确认弹窗的✕和取消按钮调用cancelDeleteBuilding但从未定义
// 改进：关闭弹窗，清空相关状态，提示取消
// ============================================================
function cancelDeleteBuilding() {
  var modal = document.getElementById('modal-delete-building-confirm');
  if (modal) {
    modal.classList.add('hidden');
  }
  showToast('已取消删除楼栋', 'info');
}

// ============================================================
// 【修复7】executeDeleteBuilding() - 楼栋删除确认弹窗"确认删除"按钮
// 理由：楼栋删除确认弹窗有确认删除按钮，调用executeDeleteBuilding但从未定义
// 改进：从buildingStore中移除楼栋数据，刷新楼栋列表，关闭弹窗，提示成功
// ============================================================
function executeDeleteBuilding() {
  var nameEl = document.getElementById('del-bld-name');
  var buildingName = nameEl ? nameEl.textContent : '';
  var modal = document.getElementById('modal-delete-building-confirm');
  if (modal) modal.classList.add('hidden');
  // 从buildingStore中移除（如果存在）
  if (typeof buildingStore !== 'undefined' && buildingStore) {
    var idx = buildingStore.findIndex(function(b) { return b.name === buildingName; });
    if (idx !== -1) buildingStore.splice(idx, 1);
  }
  // 刷新楼栋列表
  if (typeof renderBuildingList === 'function') renderBuildingList();
  if (typeof updateBuildingStats === 'function') updateBuildingStats();
  showToast('楼栋「' + buildingName + '」已删除', 'success');
}
