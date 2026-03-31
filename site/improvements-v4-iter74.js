// ============================================================
// 【物联后台 v4 - iter74】Phase 2 精简优化 - 第30轮
// 执行时间：2026-03-31 21:45
// 本轮任务：P37(按钮样式CSS类化) + P30(renderUnlockLogStats拆分) + P46(设备列表最近告警排序)
// ============================================================

// ============================================================
// 【P37优化】通用按钮样式CSS类化
// 理由：原代码33处+12处+10处btn-primary/orange/red等inline class，提取为标准CSS类
// 改进：添加 .btn-primary / .btn-secondary / .btn-warning / .btn-danger 系列CSS类
// ============================================================

// P37-1: 添加通用按钮CSS类（在现有样式表末尾追加）
(function addP37ButtonStyles() {
  var style = document.createElement('style');
  style.id = 'p37-btn-styles';
  style.textContent = `
    /* 【P37优化】通用按钮样式类 */
    .btn { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
    .btn-primary { background: var(--blue); color: white; border-color: var(--blue); }
    .btn-primary:hover { background: #096dd9; border-color: #096dd9; }
    .btn-secondary { background: var(--white); color: var(--text); border-color: var(--border); }
    .btn-secondary:hover { border-color: var(--blue); color: var(--blue); }
    .btn-warning { background: var(--orange); color: white; border-color: var(--orange); }
    .btn-warning:hover { opacity: 0.85; }
    .btn-danger { background: var(--red); color: white; border-color: var(--red); }
    .btn-danger:hover { opacity: 0.85; }
    .btn-success { background: var(--green); color: white; border-color: var(--green); }
    .btn-success:hover { opacity: 0.85; }
    .btn-sm { padding: 3px 8px; font-size: 11px; }
    .btn-lg { padding: 9px 20px; font-size: 14px; }
    .btn-block { display: block; width: 100%; text-align: center; }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// 【P30优化】renderUnlockLogStats 拆分重构
// 理由：原函数11888行开始，约224行，包含统计数字+开锁方式+电量预警三个区块
// 改进：拆分为3个子函数，提高可维护性
// ============================================================

/**
 * @description 开锁统计面板主入口
 * @returns {void}
 */
function renderUnlockLogStats() {
  var panel = document.getElementById('unlock-log-stats-panel');
  if (!panel) return;
  var statsHtml = renderUnlockStatsNumbers() + renderUnlockMethodBreakdown() + renderBatteryWarning();
  panel.innerHTML = '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">' + renderUnlockStatsCards() + '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;">' + renderUnlockMethodSection() + renderBatteryWarningSection() + '</div>';
}

/**
 * @description 渲染开锁统计数字卡片
 * @returns {string} HTML字符串
 */
function renderUnlockStatsCards() {
  var today = Math.floor(80 + Math.random() * 40);
  var week = Math.floor(400 + Math.random() * 100);
  var month = Math.floor(1600 + Math.random() * 300);
  var total = Math.floor(12000 + Math.random() * 2000);
  var cardStyle = 'padding:16px;background:white;border:1px solid var(--border);border-radius:10px;flex:1;text-align:center;';
  return '<div ' + cardStyle.replace('flex:1','') + ' style="flex:1;min-width:120px;">' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">📅 今日开锁</div>' +
      '<div style="font-size:22px;font-weight:800;color:var(--blue);">' + today + '</div>' +
      '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">次</div></div>' +
    '<div ' + cardStyle + '><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">📆 本周开锁</div><div style="font-size:20px;font-weight:700;color:var(--green);">' + week + '</div></div>' +
    '<div ' + cardStyle + '><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">📆 本月开锁</div><div style="font-size:20px;font-weight:700;color:var(--orange);">' + month + '</div></div>' +
    '<div ' + cardStyle + '><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">📊 累计开锁</div><div style="font-size:20px;font-weight:700;color:var(--purple);">' + total + '</div></div>';
}

/**
 * @description 渲染开锁方式占比区块
 * @returns {string} HTML字符串
 */
function renderUnlockMethodSection() {
  var cardStyle = 'padding:16px;background:white;border:1px solid var(--border);border-radius:10px;flex:1;text-align:center;';
  return '<div ' + cardStyle + '><div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">🔑 开锁方式占比</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
      '<div style="flex:1;min-width:60px;padding:6px;background:var(--blue-bg);border-radius:6px;text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--blue);">APP</div><div style="font-size:10px;color:var(--text-muted);">45%</div></div>' +
      '<div style="flex:1;min-width:60px;padding:6px;background:var(--green-bg);border-radius:6px;text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--green);">卡片</div><div style="font-size:10px;color:var(--text-muted);">30%</div></div>' +
      '<div style="flex:1;min-width:60px;padding:6px;background:var(--orange-bg);border-radius:6px;text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--orange);">密码</div><div style="font-size:10px;color:var(--text-muted);">15%</div></div>' +
      '<div style="flex:1;min-width:60px;padding:6px;background:var(--purple-bg);border-radius:6px;text-align:center;"><div style="font-size:11px;font-weight:700;color:var(--purple);">其他</div><div style="font-size:10px;color:var(--text-muted);">10%</div></div></div></div>';
}

/**
 * @description 渲染电量预警区块
 * @returns {string} HTML字符串
 */
function renderBatteryWarningSection() {
  var cardStyle = 'padding:16px;background:white;border:1px solid var(--border);border-radius:10px;flex:1;text-align:center;';
  return '<div ' + cardStyle + '><div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">🔋 设备电量预警</div>' +
    '<div style="font-size:12px;color:var(--red);font-weight:600;">⚠️ 3台设备电量低于20%</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">房间：201/305/402</div></div>';
}

// ============================================================
// 【P46优化】设备列表增加"最近告警"排序
// 理由：设备列表缺少按最近告警时间排序的功能，运维人员需要优先关注高风险设备
// 改进：在设备列表筛选器增加"最近告警"排序选项，按最后告警时间倒序
// ============================================================

// P46-1: 添加"最近告警"排序状态变量
var _deviceAlertSort = false; // false=默认顺序, true=按最近告警排序

// P46-2: 修改 getFilteredDeviceList 支持按告警排序
var _originalGetFilteredDeviceList = getFilteredDeviceList;

function getFilteredDeviceList() {
  var result = _originalGetFilteredDeviceList.call(this);
  // 如果启用了最近告警排序，对结果按最后告警时间排序
  if (_deviceAlertSort && result && result.length > 0) {
    result.sort(function(a, b) {
      var aAlertTime = a.lastAlertTime || '1970-01-01';
      var bAlertTime = b.lastAlertTime || '1970-01-01';
      return bAlertTime.localeCompare(aAlertTime);
    });
  }
  return result;
}

// P46-3: 添加"最近告警"排序切换函数
function toggleDeviceAlertSort(el) {
  _deviceAlertSort = !_deviceAlertSort;
  // 更新按钮样式
  if (el) {
    if (_deviceAlertSort) {
      el.style.background = 'var(--red-bg)';
      el.style.color = 'var(--red)';
      el.style.borderColor = 'var(--red)';
      el.style.fontWeight = '600';
    } else {
      el.style.background = 'var(--bg)';
      el.style.color = 'var(--text)';
      el.style.borderColor = 'var(--border)';
      el.style.fontWeight = 'normal';
    }
  }
  _devicePage = 1;
  renderDeviceFilteredTable();
}

// P46-4: 在设备筛选栏注入"最近告警"排序按钮（查找筛选栏容器）
(function injectAlertSortButton() {
  // 等待DOM就绪后注入
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInject);
  } else {
    setTimeout(doInject, 500);
  }
  function doInject() {
    var filterBar = document.querySelector('#device-page .card-tabs, #device-table-body');
    if (!filterBar) return;
    // 查找是否有"筛选"文字的容器
    var tabsContainer = document.querySelector('#device-page .filter-bar, #device-page .card-tabs');
    if (tabsContainer && !document.getElementById('dev-alert-sort-btn')) {
      var sortBtn = document.createElement('button');
      sortBtn.id = 'dev-alert-sort-btn';
      sortBtn.className = 'dg-tag-btn';
      sortBtn.style.cssText = 'padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;background:var(--bg);color:var(--text);border:1px solid var(--border);transition:all 0.2s;';
      sortBtn.textContent = '🔔 最近告警';
      sortBtn.onclick = function() { toggleDeviceAlertSort(sortBtn); };
      tabsContainer.appendChild(sortBtn);
    }
  }
})();

// ============================================================
// 【P37+P30+P46完成】本轮改进总结
// - P37: 新增 .btn/.btn-primary/.btn-secondary/.btn-warning/.btn-danger/.btn-success 系列CSS类
// - P30: renderUnlockLogStats 拆分为 renderUnlockStatsCards + renderUnlockMethodSection + renderBatteryWarningSection
// - P46: 设备列表增加"最近告警"排序功能和切换按钮
// ============================================================
console.log('[iter74] P37+P30+P46 优化完成');
