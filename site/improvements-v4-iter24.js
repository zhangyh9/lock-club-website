// ============================================================
// 物联后台迭代v4-iter24.js - 配置页楼栋管理CRUD闭环
// 修复：filterBuildingByStatus / showBuildingTreeInConfig / openEditBldgConfig / confirmDeleteBldgFromConfig / cancelAddBuildingForm / cancelAddFloorForm
// 完成时间：2026-03-30 04:45
// ============================================================

// -------- 改进1：filterBuildingByStatus - 楼栋配置状态筛选 --------
window.filterBuildingByStatus = function(status) {
  var rows = document.querySelectorAll('#cfg-bldg-list-body tr');
  rows.forEach(function(row) {
    var statusCell = row.querySelector('td:nth-child(7) .tbadge');
    if (!statusCell) return;
    var isMatch = status === 'all';
    if (!isMatch) {
      var text = statusCell.textContent || '';
      if (status === 'vacant' && text.indexOf('空房') >= 0) isMatch = true;
      if (status === 'occupied' && text.indexOf('入住') >= 0) isMatch = true;
      if (status === 'maintenance' && (text.indexOf('维修') >= 0 || text.indexOf('停用') >= 0)) isMatch = true;
    }
    row.style.display = isMatch ? '' : 'none';
  });
  // Highlight active stat card
  document.querySelectorAll('#cfg-content-building .stat-card').forEach(function(card) {
    card.style.border = '';
  });
  var targetCard = Array.from(document.querySelectorAll('#cfg-content-building .stat-card')).find(function(c) {
    return c.getAttribute('onclick') && c.getAttribute('onclick').indexOf("filterBuildingByStatus('" + status + "')") >= 0;
  });
  if (targetCard) targetCard.style.border = '2px solid var(--blue)';
  showToast('已筛选：' + (status === 'all' ? '全部' : status === 'vacant' ? '空房' : status === 'occupied' ? '入住' : '维修/其他'), 'info');
};

// -------- 改进2：showBuildingTreeInConfig - 楼栋树形总览 --------
window.showBuildingTreeInConfig = function() {
  var existing = document.getElementById('modal-bldg-tree');
  if (existing) existing.remove();
  var treeData = [
    {name: '主楼', floors: 3, rooms: 9, online: 8, offline: 1, occupancy: 67},
    {name: '东配楼', floors: 2, rooms: 4, online: 3, offline: 1, occupancy: 75}
  ];
  var treeHtml = treeData.map(function(bld) {
    return '<div style="margin-bottom:16px;padding:14px 16px;background:var(--bg);border-radius:10px;border:1px solid var(--border);">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">' +
        '<div style="font-size:22px;">🏢</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:700;">' + bld.name + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + bld.floors + '层 · ' + bld.rooms + '间 · 入住率 ' + bld.occupancy + '%</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;">' +
          '<span class="tbadge green" style="font-size:11px;">🟢 ' + bld.online + ' 在线</span>' +
          '<span class="tbadge red" style="font-size:11px;">⚫ ' + bld.offline + ' 离线</span>' +
        '</div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(' + bld.floors + ',1fr);gap:8px;">' +
        Array.from({length: bld.floors}, function(_, i) {
          var floor = i + 1;
          var rooms = [{num: floor + '01', status: '空房'}, {num: floor + '02', status: '入住'}, {num: floor + '03', status: '打扫中'}];
          return '<div style="background:white;border-radius:6px;padding:8px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-align:center;">' + floor + 'F</div>' +
            rooms.map(function(r) {
              var colorMap = {'空房': 'green', '入住': 'blue', '打扫中': 'orange', '维修': 'red'};
              return '<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid var(--border);">' +
                '<span style="font-weight:600;">' + r.num + '</span>' +
                '<span class="tbadge ' + (colorMap[r.status] || 'gray') + '" style="font-size:10px;">' + r.status + '</span></div>';
            }).join('') + '</div>';
        }).join('') + '</div></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-bldg-tree" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-bldg-tree\').remove()">' +
    '<div style="background:white;border-radius:12px;width:560px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div><div style="font-size:15px;font-weight:700;">📊 楼栋总览</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">树形结构 · 楼层房间状态一目了然</div></div>' +
        '<button onclick="document.getElementById(\'modal-bldg-tree\').remove()" style="background:var(--bg);border:none;font-size:16px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>' +
      '<div style="padding:16px 20px;overflow-y:auto;flex:1;">' + treeHtml + '</div>' +
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'modal-bldg-tree\').remove()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">确定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// -------- 改进3：openEditBldgConfig - 编辑楼栋配置 --------
window.openEditBldgConfig = function(bldId) {
  var bldNames = {main: '主楼', east: '东配楼'};
  var bldName = bldNames[bldId] || bldId;
  var existing = document.getElementById('modal-edit-bldg-config');
  if (existing) existing.remove();
  var floors = bldId === 'main' ? 3 : 2;
  var rooms = bldId === 'main' ? 9 : 4;
  var html = '<div class="modal-overlay" id="modal-edit-bldg-config" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-edit-bldg-config\').remove()">' +
    '<div style="background:white;border-radius:12px;width:480px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
        '<div style="font-size:15px;font-weight:700;">🏢 编辑楼栋 - ' + bldName + '</div>' +
        '<button onclick="document.getElementById(\'modal-edit-bldg-config\').remove()" style="background:var(--bg);border:none;font-size:16px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>' +
      '<div style="padding:20px;">' +
        '<div class="form-group"><label class="form-label">楼栋名称</label>' +
          '<input type="text" class="form-input" id="edit-bldg-name" value="' + bldName + '" style="width:100%;"></div>' +
        '<div class="form-row">' +
          '<div class="form-group"><label class="form-label">楼层数</label>' +
            '<input type="number" class="form-input" id="edit-bldg-floors" value="' + floors + '" min="1" max="20" style="width:100%;"></div>' +
          '<div class="form-group"><label class="form-label">房间数</label>' +
            '<input type="number" class="form-input" id="edit-bldg-rooms" value="' + rooms + '" min="1" max="200" style="width:100%;"></div></div>' +
        '<div class="form-group"><label class="form-label">备注</label>' +
          '<textarea class="form-textarea" id="edit-bldg-note" placeholder="可选备注信息..." style="min-height:60px;width:100%;"></textarea></div></div>' +
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'modal-edit-bldg-config\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">取消</button>' +
        '<button onclick="submitEditBldgConfig(\'' + bldId + '\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存修改</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

window.submitEditBldgConfig = function(bldId) {
  var bldNames = {main: '主楼', east: '东配楼'};
  var newName = document.getElementById('edit-bldg-name').value.trim();
  if (!newName) { showToast('请输入楼栋名称', 'error'); return; }
  document.getElementById('modal-edit-bldg-config').remove();
  // Update the table row
  var rows = document.querySelectorAll('#cfg-bldg-list-body tr');
  rows.forEach(function(row) {
    var nameCell = row.querySelector('td:first-child span');
    if (nameCell && (nameCell.textContent === bldNames[bldId] || nameCell.textContent === bldId)) {
      nameCell.textContent = newName;
    }
  });
  showToast('✅ 楼栋「' + newName + '」信息已更新', 'success');
};

// -------- 改进4：confirmDeleteBldgFromConfig - 删除楼栋（已有确认弹窗+doBuildingDelete）--------
window.confirmDeleteBldgFromConfig = function(bldId, bldName, roomCount) {
  var existing = document.getElementById('modal-confirm-delete-building');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-confirm-delete-building" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
    '<div style="background:white;border-radius:12px;width:420px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="padding:28px 24px 20px;text-align:center;">' +
        '<div style="font-size:52px;margin-bottom:14px;">⚠️</div>' +
        '<div style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--text);">确认删除楼栋</div>' +
        '<div style="font-size:13px;color:var(--text-light);line-height:1.7;">确定要删除 <strong style="color:var(--red);">' + bldName + '</strong> 吗？<br>该操作将同时删除 ' + roomCount + ' 间房间，且无法撤销。</div></div>' +
      '<div style="padding:0 24px 24px;display:flex;gap:10px;justify-content:center;">' +
        '<button onclick="document.getElementById(\'modal-confirm-delete-building\').remove()" style="flex:1;padding:11px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);">取消</button>' +
        '<button onclick="doBuildingDelete(\'' + bldId + '\')" style="flex:1;padding:11px;background:var(--red);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:white;">🗑️ 确认删除</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// doBuildingDelete - 执行楼栋删除（复用已有函数，如不存在则内联）
if (typeof doBuildingDelete !== 'function') {
  window.doBuildingDelete = function(bldId) {
    var bldNames = {main: '主楼', east: '东配楼'};
    var bldName = bldNames[bldId] || bldId;
    var modal = document.getElementById('modal-confirm-delete-building');
    if (modal) modal.remove();
    // Remove row from table
    var rows = document.querySelectorAll('#cfg-bldg-list-body tr');
    rows.forEach(function(row) {
      var nameCell = row.querySelector('td:first-child span');
      if (nameCell && (nameCell.textContent === bldName || nameCell.textContent === bldId)) {
        row.remove();
      }
    });
    showToast('🗑️ 楼栋「' + bldName + '」已删除', 'success');
    // Update stat
    var statEl = document.getElementById('bldg-stat-summary');
    if (statEl) {
      var current = statEl.textContent || '';
      var match = current.match(/共 (\d+) 栋/);
      if (match) {
        var newCount = parseInt(match[1]) - 1;
        statEl.textContent = current.replace(/共 \d+ 栋/, '共 ' + Math.max(0, newCount) + ' 栋');
      }
    }
  };
}

// -------- 改进5：cancelAddBuildingForm / cancelAddFloorForm - 取消新增表单 --------
window.cancelAddBuildingForm = function() {
  var modal = document.getElementById('modal-add-building');
  if (modal) modal.remove();
  showToast('已取消新增楼栋', 'info');
};

window.cancelAddFloorForm = function() {
  var modal = document.getElementById('modal-add-floor');
  if (modal) modal.remove();
  showToast('已取消新增楼层', 'info');
};
