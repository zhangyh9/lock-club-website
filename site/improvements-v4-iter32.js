// ============================================================
// 【物联后台 v4 第32轮】5个功能性缺失修复
// 修复：toggleGroup / openWorkorderDetailAndUpdate / 4个缺失函数
// 时间：2026-03-30
// ============================================================

// ========== 修复1：toggleGroup（侧边栏分组折叠） ==========
// 理由：侧边栏菜单分组标题有 onclick="toggleGroup(this)" 但函数不存在
// 闭环：点击分组标题 → 展开/折叠子菜单 → 箭头方向切换
function toggleGroup(el) {
  var arrow = el.querySelector('.group-arrow');
  var isCollapsed = arrow && arrow.textContent === '▶';
  if (arrow) {
    arrow.textContent = isCollapsed ? '▼' : '▶';
  }
  var next = el.nextElementSibling;
  while (next && !next.classList.contains('menu-group-title')) {
    if (next.classList.contains('menu-item')) {
      next.style.display = isCollapsed ? '' : 'none';
    }
    next = next.nextElementSibling;
  }
}

// ========== 修复2：openWorkorderDetailAndUpdate（工单详情弹窗） ==========
// 理由：工单表格行 onclick="openWorkorderDetailAndUpdate('WO-xxx')" 但函数不存在
// 闭环：打开工单详情弹窗 → 填充工单数据 → 显示处理/查看按钮
function openWorkorderDetailAndUpdate(woId) {
  // 查找工单
  var wo = null;
  var woIdx = -1;
  if (typeof _woList !== 'undefined') {
    for (var i = 0; i < _woList.length; i++) {
      if (_woList[i] && _woList[i].id === woId) {
        wo = _woList[i];
        woIdx = i;
        break;
      }
    }
  }
  // 如果 _woList 中找不到，尝试从 DOM 表格行中提取数据
  var modal = document.getElementById('modal-workorder-detail');
  if (!modal) {
    showToast('工单详情组件未找到', 'error');
    return;
  }

  // 从表格行提取数据作为兜底
  var row = document.querySelector('[data-wo-id="' + woId + '"]');
  var rowData = {};
  if (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length >= 6) {
      rowData.id = woId;
      rowData.typeLabel = cells[2] ? cells[2].textContent.trim() : '';
      rowData.room = cells[3] ? cells[3].textContent.trim() : '';
      rowData.guest = cells[4] ? cells[4].textContent.trim() : '';
      rowData.content = cells[5] ? cells[5].textContent.trim() : '';
      rowData.priority = row.getAttribute('data-priority') || 'normal';
      rowData.status = row.getAttribute('data-status') || 'pending';
    }
  }

  var displayWo = wo || rowData;
  if (!displayWo || !displayWo.id) {
    showToast('未找到工单 ' + woId, 'error');
    return;
  }

  // 填充弹窗数据
  var setText = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '--';
  };

  setText('wd-wo-id', displayWo.id || woId);
  setText('wd-type', displayWo.typeLabel || displayWo.type_name || displayWo.desc || woId);
  setText('wd-room', (displayWo.room || '301') + '房间');
  setText('wd-guest', displayWo.guest || '访客');
  setText('wd-content', displayWo.content || displayWo.desc || '无描述');
  setText('wd-create-time', displayWo.createTime || displayWo.create_time || '今天');

  // 状态Badge
  var statusMap = {done: '已完成', processing: '处理中', pending: '待接受', cancelled: '已作废'};
  var statusEl = document.getElementById('wd-status');
  if (statusEl) {
    var st = displayWo.status || 'pending';
    var stLabel = statusMap[st] || st;
    var stColor = st === 'done' ? 'var(--green)' : st === 'processing' ? 'var(--purple)' : 'var(--orange)';
    statusEl.innerHTML = '<span style="padding:3px 8px;background:' + (st === 'done' ? 'var(--green-bg)' : st === 'processing' ? 'var(--purple-bg)' : 'var(--orange-bg)') + ';color:' + stColor + ';border-radius:6px;font-size:12px;font-weight:600;">' + stLabel + '</span>';
  }

  // 处理人
  var handlerEl = document.getElementById('wd-handler');
  if (handlerEl) {
    handlerEl.textContent = displayWo.assign || displayWo.handler || '未分配';
  }

  // 隐藏处理时间线（暂无数据）
  var timeline = document.getElementById('wd-processing-timeline');
  if (timeline) timeline.style.display = 'none';

  // 显示弹窗
  modal.classList.remove('hidden');
}

// ========== 修复3：openBuildingDetailModal（楼栋详情弹窗） ==========
// 理由：楼栋列表行 onclick="openBuildingDetailModal(idx)" 但函数缺失
// 闭环：打开楼栋详情弹窗 → 显示楼栋信息+设备统计+操作按钮
function openBuildingDetailModal(idx) {
  var existing = document.getElementById('modal-bld-detail');
  if (existing) existing.remove();

  var bldData = [
    {name: '1号楼', floors: 3, rooms: 24, devices: 22, online: 20, offline: 2, lowbat: 1, address: '酒店主楼1层'},
    {name: '2号楼', floors: 2, rooms: 16, devices: 15, online: 14, offline: 1, lowbat: 0, address: '酒店附楼1层'},
    {name: '3号楼', floors: 4, rooms: 32, devices: 30, online: 28, offline: 2, lowbat: 2, address: '酒店副楼1-4层'}
  ];

  var bld = bldData[idx] || bldData[0];
  var onlineRate = Math.round((bld.online / bld.devices) * 100);

  var html = '<div class="modal-overlay" id="modal-bld-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-bld-detail\').remove()">' +
    '<div style="background:white;border-radius:12px;width:520px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:15px;font-weight:700;">🏢 ' + bld.name + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + bld.address + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-bld-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">' +
    '<div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + bld.floors + '</div><div style="font-size:11px;color:var(--text-muted);">楼层</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--green-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + bld.rooms + '</div><div style="font-size:11px;color:var(--text-muted);">房间</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--purple);">' + bld.devices + '</div><div style="font-size:11px;color:var(--text-muted);">设备</div></div>' +
    '<div style="text-align:center;padding:12px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:22px;font-weight:700;color:var(--orange);">' + onlineRate + '%</div><div style="font-size:11px;color:var(--text-muted);">在线率</div></div>' +
    '</div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text);">设备状态明细</div>' +
    '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
    '<div style="flex:1;padding:10px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--green);">' + bld.online + '</div><div style="font-size:11px;color:var(--green);">🟢 在线</div></div>' +
    '<div style="flex:1;padding:10px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--red);">' + bld.offline + '</div><div style="font-size:11px;color:var(--red);">🔴 离线</div></div>' +
    '<div style="flex:1;padding:10px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--orange);">' + bld.lowbat + '</div><div style="font-size:11px;color:var(--orange);">🟡 低电量</div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
    '<button onclick="showToast(\'📡 ' + bld.name + ' 设备同步指令已发送\',\'info\');" style="padding:10px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📡 全量同步</button>' +
    '<button onclick="showToast(\'🔓 ' + bld.name + ' 批量开锁指令已发送\',\'info\');" style="padding:10px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🔓 批量开锁</button>' +
    '<button onclick="showToast(\'🔧 ' + bld.name + ' 批量维护模式已开启\',\'info\');" style="padding:10px;background:var(--orange-bg);color:var(--orange);border:1px solid var(--orange);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🔧 批量维护</button>' +
    '<button onclick="showToast(\'📊 ' + bld.name + ' 能耗报告生成中\',\'info\');" style="padding:10px;background:var(--purple-bg);color:var(--purple);border:1px solid var(--purple);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📊 能耗报告</button>' +
    '</div>' +
    '</div>' +
    '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-bld-detail\').remove()">关闭</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ========== 修复4：openNightAuditDetail（夜审详情弹窗） ==========
// 理由：夜审报表行 onclick="openNightAuditDetail(idx)" 但函数缺失
// 闭环：打开夜审详情弹窗 → 显示夜审统计数据+操作按钮
function openNightAuditDetail(idx) {
  var existing = document.getElementById('modal-night-audit-detail');
  if (existing) existing.remove();

  var auditData = [
    {date: '2026-03-29', checker: '赵飞', totalRooms: 72, occupied: 58, vacant: 14, complaints: 2, revenue: '¥28,640', status: '已完成'},
    {date: '2026-03-28', checker: '周敏', totalRooms: 72, occupied: 55, vacant: 17, complaints: 1, revenue: '¥26,320', status: '已完成'},
    {date: '2026-03-27', checker: '王工', totalRooms: 72, occupied: 60, vacant: 12, complaints: 0, revenue: '¥30,150', status: '已完成'}
  ];

  var audit = auditData[idx] || auditData[0];

  var html = '<div class="modal-overlay" id="modal-night-audit-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-night-audit-detail\').remove()">' +
    '<div style="background:white;border-radius:12px;width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:15px;font-weight:700;">🌙 夜审详情 - ' + audit.date + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">夜审员：' + audit.checker + '</div></div>' +
    '<button onclick="document.getElementById(\'modal-night-audit-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">' +
    '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + audit.totalRooms + '</div><div style="font-size:11px;color:var(--text-muted);">总房间</div></div>' +
    '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">' + audit.occupied + '</div><div style="font-size:11px;color:var(--text-muted);">入住</div></div>' +
    '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">' + audit.vacant + '</div><div style="font-size:11px;color:var(--text-muted);">空房</div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">投诉/异常</div><div style="font-size:16px;font-weight:700;color:var(--red);">' + audit.complaints + ' 件</div></div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">营业收入</div><div style="font-size:16px;font-weight:700;color:var(--green);">' + audit.revenue + '</div></div>' +
    '</div>' +
    '<div style="padding:10px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;text-align:center;font-size:13px;font-weight:600;color:var(--green);">✅ 夜审状态：' + audit.status + '</div>' +
    '</div>' +
    '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="showToast(\'📄 夜审报表导出中...\',\'info\');" style="padding:8px 16px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:12px;">📤 导出报表</button>' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-night-audit-detail\').remove()">关闭</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ========== 修复5：navigateToPage（首页统计卡片跳转） ==========
// 理由：首页统计卡片有 onclick="navigateToPage('page-xxx')" 但函数不存在
// 闭环：点击统计卡片 → 切换到对应页面
function navigateToPage(pageId) {
  // 提取页面名称
  var pageName = pageId.replace('page-', '');
  showPage(pageName);
  // 滚动到顶部
  var main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
}

console.log('[物联后台 v4-iter32] 5个功能性修复已加载');
