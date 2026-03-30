// improvements-v4-iter43.js - 物联后台迭代v4第43轮（2026-03-30）
// 5个功能性改进：工单详情弹窗缺失函数补全（wdAccept/wdStartProcess/wdReject/wdCompleteShowRating/selectRatingStar/submitWorkorderRatingV2/openWorkorderDetailAndUpdate）

(function() {
  console.log('[iter43] 工单详情弹窗函数补全加载中');

  // ========== 改进1：openWorkorderDetailAndUpdate - 工单表格"处理"按钮缺失函数 ==========
  // 理由：工单表格（renderWorkorderTable）每行有"处理"按钮调用此函数，但函数从未定义
  // 改进：打开工单详情弹窗，根据状态显示对应操作按钮
  window.openWorkorderDetailAndUpdate = function(woId) {
    var wo = null;
    // 从 workorderSLAStore 查找
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    // 从 _woList 查找
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) {
      // 尝试从DOM表格行找
      showToast('工单 ' + woId + ' 未找到', 'error');
      return;
    }

    // 填充弹窗内容
    var detailMap = {
      'WO-2026032801': { guest: '张三', content: '房间空调噪音过大，无法休息', createTime: '今天 10:32', room: '301', type: '客户投诉', priority: '高' },
      'WO-2026032802': { guest: '李四', content: '需要添加矿泉水x2', createTime: '今天 10:15', room: '203', type: '送物服务', priority: '普通' },
      'WO-2026032803': { guest: '王五', content: '需要开具增值税普通发票，金额约2000元', createTime: '今天 09:48', room: '201', type: '发票需求', priority: '低' },
      'WO-2026032701': { guest: '钱七', content: '需要浴巾一套，指尖陀螺', createTime: '昨天 18:20', room: '304', type: '送物服务', priority: '普通' },
      'WO-2026032702': { guest: '赵六', content: '热水器故障，无热水供应', createTime: '昨天 17:05', room: '202', type: '客户投诉', priority: '高' }
    };
    var info = detailMap[woId] || { guest: wo.guest || '未知', content: wo.content || wo.desc || '--', createTime: wo.createTime || '--', room: wo.room || '--', type: wo.type || '一般', priority: wo.priority || '普通' };

    var el = document.getElementById('wd-guest');
    if (el) el.textContent = info.guest;
    el = document.getElementById('wd-content');
    if (el) el.textContent = info.content;
    el = document.getElementById('wd-create-time');
    if (el) el.textContent = info.createTime;

    // 重置操作按钮状态
    var acceptBtn = document.getElementById('wd-btn-accept');
    var processBtn = document.getElementById('wd-btn-process');
    var rejectBtn = document.getElementById('wd-btn-reject');
    var completeBtn = document.getElementById('wd-btn-complete');
    var ratingSection = document.getElementById('wd-rating-section');
    var timeline = document.getElementById('wd-processing-timeline');
    var notesSection = document.getElementById('wd-notes-section');

    if (acceptBtn) acceptBtn.style.display = 'none';
    if (processBtn) processBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'none';
    if (ratingSection) ratingSection.style.display = 'none';
    if (timeline) timeline.style.display = 'none';
    if (notesSection) notesSection.style.display = 'none';

    var status = wo.status || 'pending';
    if (status === 'pending') {
      if (acceptBtn) acceptBtn.style.display = '';
      if (rejectBtn) rejectBtn.style.display = '';
    } else if (status === 'processing') {
      if (processBtn) processBtn.style.display = 'none';
      if (rejectBtn) rejectBtn.style.display = '';
      if (completeBtn) completeBtn.style.display = '';
      if (timeline) timeline.style.display = '';
      if (notesSection) notesSection.style.display = '';
    } else if (status === 'done') {
      if (ratingSection) ratingSection.style.display = '';
    }

    // 打开弹窗
    openModal('workorder-detail');
    // 存储当前处理工单ID
    window._currentWoId = woId;
  };

  // ========== 改进2：wdAccept - 接受工单 ==========
  // 理由：工单详情弹窗"接受工单"按钮存在但wdAccept函数缺失
  // 改进：将工单状态从pending改为processing，显示后续操作按钮
  window.wdAccept = function() {
    var woId = window._currentWoId;
    if (!woId) return;
    var wo = null;
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) { showToast('工单未找到', 'error'); return; }

    wo.status = 'processing';
    wo.assign = '当前员工';
    wo.processTime = new Date().toLocaleString('zh-CN');

    // 更新按钮状态
    var acceptBtn = document.getElementById('wd-btn-accept');
    var processBtn = document.getElementById('wd-btn-process');
    var rejectBtn = document.getElementById('wd-btn-reject');
    var completeBtn = document.getElementById('wd-btn-complete');
    var timeline = document.getElementById('wd-processing-timeline');
    var notesSection = document.getElementById('wd-notes-section');

    if (acceptBtn) acceptBtn.style.display = 'none';
    if (processBtn) processBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = '';
    if (completeBtn) completeBtn.style.display = '';
    if (timeline) { timeline.style.display = ''; renderWDTimeline(woId); }
    if (notesSection) notesSection.style.display = '';

    // 添加时间线记录
    addWDTimelineEntry(woId, 'accept', '员工接受了工单');

    if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
    if (typeof updateWOSLAStats === 'function') updateWOSLAStats();
    showToast('✅ 工单 ' + woId + ' 已接受，开始处理中', 'success');
  };

  // ========== 改进3：wdStartProcess - 开始处理 ==========
  // 理由：工单详情弹窗"开始处理"按钮存在但函数缺失
  // 改进：更新工单状态，添加处理开始记录
  window.wdStartProcess = function() {
    var woId = window._currentWoId;
    if (!woId) return;
    var wo = null;
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) { showToast('工单未找到', 'error'); return; }

    wo.status = 'processing';
    wo.processTime = new Date().toLocaleString('zh-CN');
    addWDTimelineEntry(woId, 'process', '开始处理工单');

    if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
    showToast('🔄 工单 ' + woId + ' 开始处理中', 'info');
  };

  // ========== 改进4：wdReject - 拒绝工单 ==========
  // 理由：工单详情弹窗"拒绝"按钮存在但函数缺失
  // 改进：二次确认后将工单状态改为cancelled，刷新表格
  window.wdReject = function() {
    var woId = window._currentWoId;
    if (!woId) return;
    var reason = prompt('请输入拒绝原因（选填）：');
    var wo = null;
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) { showToast('工单未找到', 'error'); return; }

    wo.status = 'cancelled';
    wo.cancelTime = new Date().toLocaleString('zh-CN');
    wo.cancelReason = reason || '未说明';
    addWDTimelineEntry(woId, 'reject', '工单被拒绝' + (reason ? '，原因：' + reason : ''));

    closeModal('workorder-detail');
    if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
    if (typeof updateWOSLAStats === 'function') updateWOSLAStats();
    showToast('❌ 工单 ' + woId + ' 已拒绝', 'warning');
  };

  // ========== 改进5：wdCompleteShowRating - 完成工单并显示评分 ==========
  // 理由：工单详情弹窗"完成工单"按钮存在但函数缺失
  // 改进：完成工单，弹出评分界面让客户评价
  window.wdCompleteShowRating = function() {
    var woId = window._currentWoId;
    if (!woId) return;
    var wo = null;
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) { showToast('工单未找到', 'error'); return; }

    wo.status = 'done';
    wo.completeTime = new Date().toLocaleString('zh-CN');
    addWDTimelineEntry(woId, 'complete', '工单已完成，等待客户评价');

    // 隐藏所有操作按钮
    var acceptBtn = document.getElementById('wd-btn-accept');
    var processBtn = document.getElementById('wd-btn-process');
    var rejectBtn = document.getElementById('wd-btn-reject');
    var completeBtn = document.getElementById('wd-btn-complete');
    if (acceptBtn) acceptBtn.style.display = 'none';
    if (processBtn) processBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
    if (completeBtn) completeBtn.style.display = 'none';

    // 显示评分区
    var ratingSection = document.getElementById('wd-rating-section');
    if (ratingSection) {
      ratingSection.style.display = '';
      var ratingStatus = document.getElementById('wd-rating-status');
      if (ratingStatus) ratingStatus.textContent = '等待客户评价（可代填）';
      var ratingDisplay = document.getElementById('wd-rating-display');
      if (ratingDisplay) ratingDisplay.style.display = 'none';
      var ratingForm = document.getElementById('wd-rating-form');
      if (ratingForm) ratingForm.style.display = '';
    }

    if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
    if (typeof updateWOSLAStats === 'function') updateWOSLAStats();
    showToast('✅ 工单 ' + woId + ' 已完成，请填写客户评价', 'success');
  };

  // ========== 辅助函数：selectRatingStar - 星级选择 ==========
  // 理由：评分弹窗有5个⭐按钮调用此函数，但函数从未定义
  // 改进：选中对应星级，高亮显示已选按钮
  window.selectRatingStar = function(stars, btn) {
    window._selectedRating = stars;
    // 高亮当前按钮
    var container = document.getElementById('wd-stars-select');
    if (container) {
      var buttons = container.querySelectorAll('button');
      buttons.forEach(function(b, idx) {
        if (idx < stars) {
          b.style.background = 'var(--orange-bg)';
          b.style.borderColor = 'var(--orange)';
        } else {
          b.style.background = '';
          b.style.borderColor = '';
        }
      });
    }
  };

  // ========== 辅助函数：submitWorkorderRatingV2 - 提交评分 ==========
  // 理由：评分表单提交按钮调用此函数，但函数从未定义
  // 改进：保存评分到工单，关闭弹窗，刷新表格
  window.submitWorkorderRatingV2 = function() {
    var woId = window._currentWoId;
    var stars = window._selectedRating || 0;
    var comment = '';
    var commentInput = document.getElementById('wd-rating-comment-input');
    if (commentInput) comment = commentInput.value;

    if (stars === 0) {
      showToast('请先选择星级评分', 'error');
      return;
    }

    var wo = null;
    if (typeof workorderSLAStore !== 'undefined') {
      wo = workorderSLAStore.find(function(w) { return w.id === woId; });
    }
    if (!wo && typeof _woList !== 'undefined') {
      wo = _woList.find(function(w) { return w.id === woId; });
    }
    if (!wo) { showToast('工单未找到', 'error'); return; }

    wo.rating = stars;
    wo.ratingComment = comment;
    wo.ratingTime = new Date().toLocaleString('zh-CN');

    // 更新评分显示
    var ratingStatus = document.getElementById('wd-rating-status');
    if (ratingStatus) ratingStatus.textContent = '感谢您的评价！';
    var ratingDisplay = document.getElementById('wd-rating-display');
    if (ratingDisplay) {
      ratingDisplay.style.display = '';
      var starsEl = document.getElementById('wd-rating-stars');
      if (starsEl) starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
      var commentEl = document.getElementById('wd-rating-comment');
      if (commentEl) commentEl.textContent = comment ? '：' + comment : '';
    }
    var ratingForm = document.getElementById('wd-rating-form');
    if (ratingForm) ratingForm.style.display = 'none';

    addWDTimelineEntry(woId, 'rating', '客户提交评分：' + '⭐'.repeat(stars) + (comment ? '，备注：' + comment : ''));

    showToast('感谢您的评价！⭐'.repeat(stars), 'success');
  };

  // ========== 辅助函数：工单时间线 ==========
  window._wdTimelineCache = window._wdTimelineCache || {};

  function addWDTimelineEntry(woId, action, text) {
    if (!window._wdTimelineCache[woId]) {
      window._wdTimelineCache[woId] = [];
    }
    window._wdTimelineCache[woId].push({
      action: action,
      text: text,
      time: new Date().toLocaleString('zh-CN')
    });
  }

  function renderWDTimeline(woId) {
    var container = document.getElementById('wd-timeline-content');
    if (!container) return;
    var entries = window._wdTimelineCache[woId] || [];
    if (entries.length === 0) {
      container.innerHTML = '<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:8px;">暂无处理记录</div>';
      return;
    }
    var colorMap = {
      accept: 'var(--blue)',
      process: 'var(--purple)',
      reject: 'var(--red)',
      complete: 'var(--green)',
      rating: 'var(--orange)',
      note: 'var(--blue)'
    };
    container.innerHTML = entries.map(function(e) {
      return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;">' +
        '<div style="width:6px;height:6px;border-radius:50%;background:' + (colorMap[e.action] || 'var(--text-muted)') + ';margin-top:5px;flex-shrink:0;"></div>' +
        '<div style="flex:1;color:var(--text);">' + e.text + '</div>' +
        '<div style="color:var(--text-muted);white-space:nowrap;">' + e.time + '</div></div>';
    }).join('');
  }

  console.log('[iter43] 7个工单详情弹窗函数补全完成');
})();
