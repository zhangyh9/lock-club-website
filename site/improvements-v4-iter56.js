// ============================================================
// 【物联后台v4-第56轮】5个功能性断裂修复
// 修复：onclick调用的函数存在但函数体缺失
// 完成时间：2026-03-30
// ============================================================

// ========== 改进1：toggleBatchRoom - 批量入住房间选择 ==========
// 理由：批量入住页面房间Chip点击调用 toggleBatchRoom() 但函数从未定义
// 改进：点击Chip切换选中状态，更新已选房间计数，同步确认按钮状态
window.toggleBatchRoom = function(el, roomId) {
  if (!el) return;
  var isSelected = el.classList.contains('selected');
  if (isSelected) {
    el.classList.remove('selected');
    el.style.background = '';
    el.style.color = '';
    el.style.borderColor = '';
  } else {
    el.classList.add('selected');
    el.style.background = 'var(--blue)';
    el.style.color = 'white';
    el.style.borderColor = 'var(--blue)';
  }
  // 更新计数
  var selected = document.querySelectorAll('.batch-room-chip.selected');
  var countEl = document.getElementById('batch-room-count');
  if (countEl) countEl.textContent = selected.length;
  // 同步确认按钮状态
  var nextBtn = document.getElementById('btn-batch-step1-next');
  if (nextBtn) {
    if (selected.length > 0) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    } else {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.5';
      nextBtn.style.cursor = 'not-allowed';
    }
  }
  showToast((isSelected ? '已取消' : '已选择') + '房间 ' + roomId, 'info');
};

// ========== 改进2：showLogDetailModal - 开门记录详情弹窗 ==========
// 理由：开门记录列表"详情"按钮调用 showLogDetailModal() 但函数从未定义
// 改进：弹出详情弹窗，展示开门方式/时间/卡号/操作人信息，支持复制
window.showLogDetailModal = function(type, idx) {
  var existing = document.getElementById('modal-log-detail');
  if (existing) existing.remove();

  // 从表格行中提取数据
  var tbody = document.getElementById('log-table-body');
  if (!tbody) { showToast('未找到记录数据', 'error'); return; }
  var rows = tbody.querySelectorAll('tr');
  var row = rows[idx];
  if (!row) { showToast('未找到第 ' + idx + ' 条记录', 'error'); return; }

  var cells = row.querySelectorAll('td');
  var time = cells[0] ? cells[0].textContent.trim() : '--';
  var room = cells[1] ? cells[1].textContent.trim() : '--';
  var unlockType = cells[2] ? cells[2].textContent.trim() : '--';
  var cardNum = cells[3] ? cells[3].textContent.trim() : '--';
  var operator = cells[4] ? cells[4].textContent.trim() : '--';
  var date = row.getAttribute('data-date') || new Date().toLocaleDateString('zh-CN');
  var cardtype = row.getAttribute('data-cardtype') || 'unknown';

  var typeIcon = {phone:'📱', card:'💳', master:'🔑', password:'🔐', finger:'👆'}[type] || '🔐';
  var typeName = {phone:'手机开锁', card:'门卡开锁', master:'通卡开锁', password:'密码开锁', finger:'指纹开锁'}[type] || '开锁';
  var cardtypeName = {member:'会员', staff:'员工', master:'通卡', guest:'访客'}[cardtype] || '未知';

  var html = '<div class="modal-overlay" id="modal-log-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-log-detail\').remove()">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">' + typeIcon + '</div><div><div style="font-size:15px;font-weight:700;">开门记录详情</div><div style="font-size:11px;color:var(--text-muted);">' + date + ' ' + time + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-log-detail\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">开锁方式</div><div style="font-size:13px;font-weight:700;">' + typeIcon + ' ' + typeName + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">房间号</div><div style="font-size:15px;font-weight:700;color:var(--blue);">' + room + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">卡号/编号</div><div style="font-size:12px;font-weight:600;font-family:monospace;">' + cardNum + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">操作人</div><div style="font-size:13px;font-weight:700;">' + operator + '</div></div></div>' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);display:flex;align-items:center;gap:8px;">' +
    '<span>👤</span><span>身份类型：<strong>' + cardtypeName + '</strong></span></div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="action-btn" onclick="copyToClipboard(\'' + cardNum + '\')" style="flex:1;padding:8px;">📋 复制卡号</button>' +
    '<button class="action-btn" onclick="document.getElementById(\'modal-log-detail\').remove()" style="flex:1;padding:8px;background:var(--bg);color:var(--text);">关闭</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('已复制：' + text, 'success');
    }).catch(function() {
      showToast('复制失败，请手动复制', 'error');
    });
  } else {
    showToast('浏览器不支持剪贴板功能', 'error');
  }
}

// ========== 改进3：openMemberLevelBenefitModal - 会员等级权益弹窗 ==========
// 理由：会员等级卡片点击调用 openMemberLevelBenefitModal() 但函数从未定义
// 改进：弹出权益配置弹窗，展示各等级特权和权益说明
window.openMemberLevelBenefitModal = function(level) {
  var existing = document.getElementById('modal-member-benefit');
  if (existing) existing.remove();

  var levels = {
    normal: { name: '普通会员', icon: '♟', color: 'var(--text-muted)', bg: 'var(--bg)', discount: '无', points: '1倍', free: '无', priority: '低' },
    silver: { name: '银卡会员', icon: '🥈', color: 'var(--text-secondary)', bg: 'var(--bg)', discount: '9.5折', points: '1.2倍', free: '免费早餐', priority: '中' },
    gold: { name: '金卡会员', icon: '🥇', color: 'var(--orange)', bg: 'var(--orange-bg)', discount: '9折', points: '1.5倍', free: '免费早餐+下午茶', priority: '高' },
    vip: { name: 'VIP会员', icon: '👑', color: 'var(--red)', bg: 'var(--red-bg)', discount: '8折', points: '2倍', free: '全部免费+免费停车', priority: '最高' }
  };
  var current = levels[level] || levels.normal;

  var allLevels = Object.entries(levels).map(function(kv) {
    var l = kv[1];
    var isActive = kv[0] === level;
    return '<div style="padding:14px;background:' + (isActive ? l.bg : 'var(--bg)') + ';border:2px solid ' + (isActive ? l.color : 'var(--border)') + ';border-radius:10px;' + (isActive ? '' : 'opacity:0.7;') + '">' +
      '<div style="font-size:18px;margin-bottom:4px;">' + l.icon + '</div>' +
      '<div style="font-size:13px;font-weight:700;color:' + l.color + ';">' + l.name + (isActive ? ' ★' : '') + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">折扣: ' + l.discount + ' | 积分: ' + l.points + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);">免费权益: ' + l.free + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);">优先级: ' + l.priority + '</div></div>';
  }).join('');

  var html = '<div class="modal-overlay" id="modal-member-benefit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-benefit\').remove()">' +
    '<div class="modal" style="width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">' + current.icon + '</div><div><div style="font-size:15px;font-weight:700;">会员权益体系</div><div style="font-size:11px;color:var(--text-muted);">当前选中：' + current.name + '</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-member-benefit\').remove();" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">' + allLevels + '</div>' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;font-size:12px;color:var(--blue);">' +
    '💡 会员权益说明：权益体系由系统自动管理，等级根据累计消费金额自动升降。详细规则可在"配置-会员规则"中修改。</div>' +
    '<div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;">' +
    '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-member-benefit\').remove()">关闭</button>' +
    '<button class="modal-btn" onclick="showToast(\'请在\"配置-会员规则\"中修改权益策略\', \'info\')" style="background:var(--blue);color:white;border:none;">⚙️ 配置权益规则</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};

// ========== 改进4：setRating - 评分组件 ==========
// 理由：退房评价组件调用 setRating() 但函数从未定义
// 改进：点击星星切换评分，更新UI并记录评分值，支持1-5星
window.setRating = function(stars) {
  window._currentRating = stars;
  // 更新星星显示
  var container = document.getElementById('rating-stars');
  if (!container) {
    container = document.getElementById('checkout-rating-stars') || document.querySelector('.rating-stars');
  }
  if (container) {
    var spans = container.querySelectorAll('span');
    spans.forEach(function(span, i) {
      if (i < stars) {
        span.textContent = '★';
        span.style.color = 'var(--orange)';
        span.style.fontSize = '24px';
      } else {
        span.textContent = '☆';
        span.style.color = 'var(--border)';
        span.style.fontSize = '24px';
      }
    });
  }
  // 更新隐藏字段
  var ratingInput = document.getElementById('rating-value');
  if (ratingInput) ratingInput.value = stars;
  // 提示
  var labels = ['', '很差', '较差', '一般', '满意', '非常满意'];
  showToast('您给出了 ' + stars + ' 星评价：' + (labels[stars] || ''), 'info');
};

// ========== 改进5：toggleFacility - 设施配置切换 ==========
// 理由：楼栋/房间配置页设施复选框调用 toggleFacility() 但函数从未定义
// 改进：点击切换设施启用状态，更新UI反馈
window.toggleFacility = function(el, facility) {
  if (!el) return;
  var isActive = el.classList.contains('active');
  if (isActive) {
    el.classList.remove('active');
    el.style.background = 'var(--bg)';
    el.style.borderColor = 'var(--border)';
    el.style.color = '';
  } else {
    el.classList.add('active');
    el.style.background = 'var(--blue-bg)';
    el.style.borderColor = 'var(--blue)';
    el.style.color = 'var(--blue)';
  }
  var facilityNames = {wifi:'WiFi', parking:'停车位', elevator:'电梯', breakfast:'早餐', gym:'健身房', pool:'游泳池', spa:'SPA', restaurant:'餐厅'};
  var name = facilityNames[facility] || facility;
  showToast((isActive ? '已关闭' : '已启用') + ' ' + name, 'info');
};

console.log('[iter56] 5个功能性断裂修复完成：toggleBatchRoom / showLogDetailModal / openMemberLevelBenefitModal / setRating / toggleFacility');
