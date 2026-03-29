// ============================================================
// 物联后台迭代v4-iter25.js - 配置页楼栋管理增补 + 楼栋树形快速渲染
// 修复：openAddBuildingForm / openAddFloorForm / openAddRoomForm / openBuildingManagementModal / renderBldgTreeQuick
// 完成时间：2026-03-30 04:52
// ============================================================

// -------- 改进1：openAddBuildingForm - 配置页新增楼栋表单 --------
window.openAddBuildingForm = function() {
  var existing = document.getElementById('modal-bldg-config-add');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-bldg-config-add" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-bldg-config-add\').remove()">' +
    '<div style="background:white;border-radius:12px;width:460px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
        '<div style="font-size:15px;font-weight:700;">🏢 新增楼栋</div>' +
        '<button onclick="document.getElementById(\'modal-bldg-config-add\').remove()" style="background:var(--bg);border:none;font-size:16px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>' +
      '<div style="padding:20px;">' +
        '<div class="form-group"><label class="form-label">楼栋名称 <span style="color:var(--red);">*</span></label>' +
          '<input type="text" class="form-input" id="cfg-new-bldg-name" placeholder="如：主楼、东配楼、西楼" style="width:100%;"></div>' +
        '<div class="form-group"><label class="form-label">楼栋编号 <span style="color:var(--red);">*</span></label>' +
          '<input type="text" class="form-input" id="cfg-new-bldg-code" placeholder="如：MAIN、EAST、WEST" style="width:100%;text-transform:uppercase;"></div>' +
        '<div class="form-row">' +
          '<div class="form-group"><label class="form-label">楼层数 <span style="color:var(--red);">*</span></label>' +
            '<input type="number" class="form-input" id="cfg-new-bldg-floors" value="3" min="1" max="30" style="width:100%;"></div>' +
          '<div class="form-group"><label class="form-label">每层房间数</label>' +
            '<input type="number" class="form-input" id="cfg-new-bldg-rooms-per-floor" value="8" min="1" max="50" style="width:100%;"></div></div>' +
        '<div class="form-group"><label class="form-label">状态</label>' +
          '<select class="form-select" id="cfg-new-bldg-status" style="width:100%;">' +
            '<option value="enabled">🟢 启用</option>' +
            '<option value="disabled">🔴 停用</option></select></div>' +
        '<div class="form-group"><label class="form-label">备注</label>' +
          '<textarea class="form-textarea" id="cfg-new-bldg-note" placeholder="可选备注信息..." style="min-height:60px;width:100%;"></textarea></div></div>' +
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'modal-bldg-config-add\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
        '<button onclick="submitAddBuildingFromConfig()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进1补充：submitAddBuildingFromConfig - 保存新增楼栋 --------
window.submitAddBuildingFromConfig = function() {
  var name = (document.getElementById('cfg-new-bldg-name') || {}).value.trim();
  var code = (document.getElementById('cfg-new-bldg-code') || {}).value.trim().toUpperCase();
  var floors = parseInt((document.getElementById('cfg-new-bldg-floors') || {}).value) || 0;
  var roomsPerFloor = parseInt((document.getElementById('cfg-new-bldg-rooms-per-floor') || {}).value) || 0;
  var status = (document.getElementById('cfg-new-bldg-status') || {}).value || 'enabled';
  if (!name) { showToast('请输入楼栋名称', 'error'); return; }
  if (!code) { showToast('请输入楼栋编号', 'error'); return; }
  if (floors <= 0) { showToast('楼层数必须大于0', 'error'); return; }
  if (roomsPerFloor <= 0) { showToast('每层房间数必须大于0', 'error'); return; }
  var totalRooms = floors * roomsPerFloor;
  var statusBadge = status === 'enabled'
    ? '<span class="tbadge green">启用</span>'
    : '<span class="tbadge gray">停用</span>';
  var newRow = '<tr>' +
    '<td><span style="font-weight:600;">' + name + '</span></td>' +
    '<td>' + floors + '层</td>' +
    '<td>' + totalRooms + '间</td>' +
    '<td style="color:var(--green);">-</td>' +
    '<td style="color:var(--text-muted);">-</td>' +
    '<td><span style="color:var(--text-muted);">-</span></td>' +
    '<td>' + statusBadge + '</td>' +
    '<td>' +
      '<button class="action-btn small" onclick="openEditBldgConfig(\'' + code.toLowerCase() + '\')">编辑</button> ' +
      '<button class="action-btn small red" onclick="confirmDeleteBldgFromConfig(\'' + code.toLowerCase() + '\',\'' + name + '\',' + totalRooms + ')">删除</button>' +
    '</td></tr>';
  var tbody = document.getElementById('cfg-bldg-list-body');
  if (tbody) tbody.insertAdjacentHTML('beforeend', newRow);
  document.getElementById('modal-bldg-config-add').remove();
  showToast('✅ 楼栋「' + name + '」已添加（共' + floors + '层·' + totalRooms + '间）', 'success');
  // Update stat
  var statEl = document.getElementById('bldg-stat-summary');
  if (statEl) {
    var text = statEl.textContent || '';
    var bldMatch = text.match(/共 (\d+) 栋/);
    var floorMatch = text.match(/(\d+) 层/);
    var roomMatch = text.match(/(\d+) 间/);
    if (bldMatch && floorMatch && roomMatch) {
      statEl.textContent = '共 ' + (parseInt(bldMatch[1]) + 1) + ' 栋 · ' + (parseInt(floorMatch[1]) + floors) + ' 层 · ' + (parseInt(roomMatch[1]) + totalRooms) + ' 间';
    }
  }
  renderBldgTreeQuick();
};

// -------- 改进2：openAddFloorForm - 配置页新增楼层 --------
window.openAddFloorForm = function() {
  openModal('add-floor');
};

// -------- 改进2补充：submitAddFloor - 保存新增楼层 --------
if (typeof submitAddFloor !== 'function') {
  window.submitAddFloor = function() {
    var floorNum = parseInt((document.getElementById('floor-num') || {}).value) || 0;
    var roomsPerFloor = parseInt((document.getElementById('floor-rooms') || {}).value) || 8;
    var usage = (document.getElementById('floor-usage') || {}).value || 'guest';
    if (floorNum <= 0) { showToast('请输入有效的楼层号', 'error'); return; }
    closeModal('add-floor');
    showToast('✅ ' + floorNum + '层已创建（' + roomsPerFloor + '间/层）', 'success');
    // Update stat
    var statEl = document.getElementById('bldg-stat-summary');
    if (statEl) {
      var text = statEl.textContent || '';
      var floorMatch = text.match(/(\d+) 层/);
      if (floorMatch) {
        statEl.textContent = text.replace(/\d+ 层/, (parseInt(floorMatch[1]) + 1) + ' 层');
      }
    }
  };
}

// -------- 改进3：openAddRoomForm - 配置页新增房间 --------
window.openAddRoomForm = function() {
  openModal('add-floor-room');
};

// -------- 改进4：openBuildingManagementModal - 打开楼栋总览管理 --------
window.openBuildingManagementModal = function() {
  showBuildingTreeInConfig();
};

// -------- 改进5：renderBldgTreeQuick - 楼栋树形快速渲染（cfg页内嵌） --------
window.renderBldgTreeQuick = function() {
  var container = document.getElementById('bldg-tree-quick');
  if (!container) return;
  var rows = document.querySelectorAll('#cfg-bldg-list-body tr');
  if (rows.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">暂无楼栋数据，请先添加楼栋</div>';
    return;
  }
  var treeHtml = '<div style="display:flex;flex-direction:column;gap:10px;">';
  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7) return;
    var name = cells[0].textContent.trim();
    var floors = parseInt(cells[1].textContent) || 0;
    var totalRooms = parseInt(cells[2].textContent) || 0;
    var statusCell = cells[6].querySelector('.tbadge');
    var isEnabled = statusCell && statusCell.textContent.indexOf('启用') >= 0;
    treeHtml += '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">' +
      '<div style="font-size:20px;">🏢</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:13px;font-weight:600;">' + name + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + floors + '层 · ' + totalRooms + '间</div></div>' +
      '<div style="display:flex;gap:6px;align-items:center;">' +
        (isEnabled
          ? '<span class="tbadge green" style="font-size:10px;">🟢 启用</span>'
          : '<span class="tbadge gray" style="font-size:10px;">⚫ 停用</span>') +
      '</div></div>';
  });
  treeHtml += '</div>';
  container.innerHTML = treeHtml;
};

// Auto-render tree quick view when building tab is shown
var _origSwitchConfigTab = window.switchConfigTab || function() {};
window.switchConfigTab = function(tabName, el) {
  _origSwitchConfigTab(tabName, el);
  if (tabName === 'building') {
    setTimeout(function() { renderBldgTreeQuick && renderBldgTreeQuick(); }, 100);
  }
};
