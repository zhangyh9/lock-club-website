// ============================================================
// 【物联后台 v4 第37轮 - 全面检查版】5个功能性断裂修复
// 分析：对照截图 + 现有代码，找出了5个真实断裂点
// ============================================================

// 【修复1】switchDevTab - 设备详情页Tab切换（被调用7次，从未定义）
// 理由：page-device-detail 有6个Tab（设备信息/远程操作/开锁记录/运行日志/绑定历史/钥匙信息），
//       每个Tab的onclick都调用switchDevTab('xxx')，但函数从未定义，导致Tab点击无任何响应
// 业务闭环：Tab点击 → 切换active状态 → 显示/隐藏对应内容区 → Toast提示
function switchDevTab(tab) {
  var tabs = ['info', 'remote', 'unlock-log', 'runtime', 'binding', 'keys'];
  tabs.forEach(function(t) {
    var tabEl = document.getElementById('dev-tab-' + t);
    var contentEl = document.getElementById('dev-content-' + t);
    if (tabEl) {
      if (t === tab) {
        tabEl.classList.add('active');
        tabEl.style.background = 'var(--blue)';
        tabEl.style.color = 'white';
        tabEl.style.fontWeight = '600';
      } else {
        tabEl.classList.remove('active');
        tabEl.style.background = '';
        tabEl.style.color = '';
        tabEl.style.fontWeight = '';
      }
    }
    if (contentEl) {
      contentEl.style.display = t === tab ? 'block' : 'none';
    }
  });
  var labels = {info:'设备信息', remote:'远程操作', 'unlock-log':'开锁记录', runtime:'运行日志', binding:'绑定历史', keys:'钥匙信息'};
  showToast('📱 已切换至' + (labels[tab] || tab) + '标签', 'info');
}

// 【修复2】addNotif - 通知中心添加通知（被调用6次，从未定义）
// 理由：退房成功/钥匙禁用/钥匙续期/新钥匙发行/订阅成功等业务操作都调用addNotif()，
//       但函数从未定义，导致这些操作完成后通知中心没有记录
// 业务闭环：业务操作成功 → addNotif() → 通知卡片新增 → 通知数量+1 → localStorage持久化
function addNotif(icon, color, category, message) {
  var notifList = JSON.parse(localStorage.getItem('_notifList') || '[]');
  var notif = {
    id: Date.now(),
    icon: icon,
    color: color,
    category: category,
    message: message,
    time: new Date().toLocaleString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
    read: false
  };
  notifList.unshift(notif);
  if (notifList.length > 100) notifList = notifList.slice(0, 100);
  localStorage.setItem('_notifList', JSON.stringify(notifList));
  // 如果当前在通知页面，刷新通知列表
  if (typeof renderNotifList === 'function') renderNotifList();
  // 更新通知计数
  var badge = document.getElementById('notif-badge');
  if (badge) {
    var count = notifList.filter(function(n){ return !n.read; }).length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// 【修复3】renderHomeStats - 首页统计数字渲染（被调用2次，从未定义）
// 理由：办理入住/退房成功后调用 renderHomeStats() 刷新首页统计数据，但函数从未定义
// 业务闭环：入住/退房完成 → renderHomeStats() → 从_homeRoomData计算最新统计 → 更新DOM
function renderHomeStats() {
  // 确保数据源存在
  if (typeof _homeRoomData === 'undefined') return;
  var total = _homeRoomData.length;
  var occupied = _homeRoomData.filter(function(r){ return r.status === 'in'; }).length;
  var vacant = _homeRoomData.filter(function(r){ return r.status === 'vacant'; }).length;
  var maintenance = _homeRoomData.filter(function(r){ return r.status === 'maintenance'; }).length;
  var alert = _homeRoomData.filter(function(r){ return r.status === 'alert'; }).length;
  // 尝试更新首页统计卡
  var statNums = document.querySelectorAll('#page-home .stat-num');
  if (statNums && statNums.length >= 4) {
    statNums[0].textContent = total;
    statNums[1].textContent = occupied;
    statNums[2].textContent = vacant;
    statNums[3].textContent = maintenance;
  }
  // 更新房务统计
  var inCountEl = document.getElementById('h-room-in-count');
  var vacantCountEl = document.getElementById('h-room-vacant-count');
  var dirtyCountEl = document.getElementById('h-room-dirty-count');
  var maintenanceCountEl = document.getElementById('h-room-maintenance-count');
  if (inCountEl) inCountEl.textContent = occupied;
  if (vacantCountEl) vacantCountEl.textContent = vacant;
  if (dirtyCountEl) dirtyCountEl.textContent = alert;
  if (maintenanceCountEl) maintenanceCountEl.textContent = maintenance;
}

// 【修复4】openRoomPollutionReportModal - 房间详情页污染报告弹窗（被调用1次，从未定义）
// 理由：page-room-detail 页面中房间状态卡片有"污染报告"按钮，调用openRoomPollutionReportModal(roomNum)，
//       但函数从未定义，导致点击无任何响应
// 业务闭环：点击污染报告 → 打开弹窗显示该房间污染/维修记录列表 → 可打印或导出
function openRoomPollutionReportModal(roomNum) {
  var existing = document.getElementById('modal-pollution-report');
  if (existing) existing.remove();
  roomNum = roomNum || '301';
  // 模拟污染记录数据
  var records = [
    {date:'2026-03-28', type:'墙面污渍', desc:'床头背景墙有可乐渍', status:'待处理', handler:'--'},
    {date:'2026-03-25', type:'地毯烧洞', desc:'地毯被烟头烫出一个洞', status:'已报损', handler:'工程部-李明'},
    {date:'2026-03-20', type:'马桶堵塞', desc:'马桶排水不畅', status:'已修复', handler:'工程部-张强'},
    {date:'2026-03-15', type:'床品染色', desc:'白色床单被染色', status:'已赔付', handler:'客房部-小红'}
  ];
  var statusColors = {'待处理':'var(--orange)', '已报损':'var(--blue)', '已修复':'var(--green)', '已赔付':'var(--gray)'};
  var rows = records.map(function(r) {
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 8px;font-size:12px;">' + r.date + '</td>' +
      '<td style="padding:10px 8px;font-size:12px;font-weight:600;">' + r.type + '</td>' +
      '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + r.desc + '</td>' +
      '<td style="padding:10px 8px;"><span style="padding:2px 8px;background:' + statusColors[r.status].replace('var(--', 'var(--').replace(')', '-bg)') + ';color:' + statusColors[r.status] + ';border-radius:10px;font-size:11px;font-weight:600;">' + r.status + '</span></td>' +
      '<td style="padding:10px 8px;font-size:11px;">' + r.handler + '</td></tr>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-pollution-report" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-pollution-report\').remove()">' +
    '<div style="background:white;border-radius:12px;width:680px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🏠</div><div><div style="font-size:15px;font-weight:700;">房间 ' + roomNum + ' 污染报告</div><div style="font-size:11px;color:var(--text-muted);">历史污染/损坏记录一览</div></div></div>' +
        '<div style="display:flex;gap:8px;"><button onclick="printPollutionReport()" style="padding:5px 12px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;cursor:pointer;font-size:12px;">🖨️ 打印</button><button onclick="document.getElementById(\'modal-pollution-report\').remove()" style="background:var(--bg);border:none;font-size:15px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div></div>' +
      '<div style="overflow-y:auto;flex:1;padding:0 16px;">' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px 0;border-bottom:1px solid var(--border);margin-bottom:12px;">' +
          '<div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--text);">' + records.length + '</div><div style="font-size:11px;color:var(--text-muted);">历史记录</div></div>' +
          '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--orange);">' + records.filter(function(r){return r.status==='待处理';}).length + '</div><div style="font-size:11px;color:var(--text-muted);">待处理</div></div>' +
          '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--green);">' + records.filter(function(r){return r.status==='已修复'||r.status==='已赔付';}).length + '</div><div style="font-size:11px;color:var(--text-muted);">已完成</div></div>' +
          '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--blue);">¥280</div><div style="font-size:11px;color:var(--text-muted);">累计赔付</div></div></div>' +
        '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
          '<thead><tr style="background:var(--bg);border-bottom:2px solid var(--border);">' +
            '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">日期</th>' +
            '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">类型</th>' +
            '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">描述</th>' +
            '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">状态</th>' +
            '<th style="padding:8px 8px;text-align:left;font-weight:700;color:var(--text-muted);font-size:11px;">处理人</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'modal-pollution-report\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('🏠 正在生成房间 ' + roomNum + ' 的污染报告...', 'info');
}
function printPollutionReport() {
  window.print();
  showToast('🖨️ 正在打印污染报告...', 'info');
}

// 【修复5】openEnergyDetailPageEnhanced - 能耗详情增强弹窗（被调用1次，从未定义）
// 理由：侧边栏"能耗分析"菜单调用 openEnergyDetailPageEnhanced()，但函数从未定义
// 业务闭环：点击能耗菜单 → 打开增强版能耗详情弹窗（含AI建议+多维度分析）
function openEnergyDetailPageEnhanced() {
  var existing = document.getElementById('modal-energy-detail');
  if (existing) existing.remove();
  var html = '<div class="modal-overlay" id="modal-energy-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-energy-detail\').remove()">' +
    '<div style="background:white;border-radius:12px;width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">⚡</div><div><div style="font-size:15px;font-weight:700;">能耗详情分析</div><div style="font-size:11px;color:var(--text-muted);">AI智能节能建议 · 实时数据</div></div></div>' +
        '<button onclick="document.getElementById(\'modal-energy-detail\').remove()" style="background:var(--bg);border:none;font-size:15px;cursor:pointer;color:var(--text-light);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>' +
      '<div style="overflow-y:auto;flex:1;padding:16px 20px;">' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">' +
          '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;text-align:center;"><div style="font-size:10px;color:var(--blue);margin-bottom:4px;">今日用电</div><div style="font-size:24px;font-weight:800;color:var(--blue);">128<span style="font-size:13px;font-weight:400;">kWh</span></div></div>' +
          '<div style="padding:14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;text-align:center;"><div style="font-size:10px;color:var(--orange);margin-bottom:4px;">本月用电</div><div style="font-size:24px;font-weight:800;color:var(--orange);">3,842<span style="font-size:13px;font-weight:400;">kWh</span></div></div>' +
          '<div style="padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;text-align:center;"><div style="font-size:10px;color:var(--green);margin-bottom:4px;">节能率</div><div style="font-size:24px;font-weight:800;color:var(--green);">12.3<span style="font-size:13px;font-weight:400;">%</span></div></div></div>' +
        '<div style="padding:14px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:8px;margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="font-size:16px;">🤖</div><div style="font-size:13px;font-weight:700;color:var(--purple);">AI节能建议</div></div>' +
          '<div style="font-size:12px;color:var(--text);line-height:1.8;">' +
            '<div>• <b>301/302房间</b>空调温度建议调高2°C，当前设置24°C偏低，可节能约8%</div>' +
            '<div>• <b>公共区域</b>照明建议启用定时开关，高峰时段09:00-17:00可减少待机功耗30%</div>' +
            '<div>• <b>热水系统</b>建议安装定时控制器，每日23:00-06:00可节约保温电耗约15%</div></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div style="padding:14px;border:1px solid var(--border);border-radius:8px;"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">📊 近7日用电趋势</div>' +
            '<div style="display:flex;align-items:flex-end;gap:6px;height:60px;">' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:45px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:60px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:35px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:55px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:70px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:50px;"></div>' +
              '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:40px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text-muted);"><span>周一</span><span>周日</span></div></div>' +
          '<div style="padding:14px;border:1px solid var(--border);border-radius:8px;"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">🔋 各设备用电占比</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
              '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:11px;">空调</div><div style="flex:1;height:8px;background:var(--blue);border-radius:4px;"></div><div style="width:30px;font-size:11px;text-align:right;">45%</div></div>' +
              '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:11px;">照明</div><div style="flex:1;height:8px;background:var(--orange);border-radius:4px;"></div><div style="width:30px;font-size:11px;text-align:right;">22%</div></div>' +
              '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:11px;">热水</div><div style="flex:1;height:8px;background:var(--green);border-radius:4px;"></div><div style="width:30px;font-size:11px;text-align:right;">18%</div></div>' +
              '<div style="display:flex;align-items:center;gap:8px;"><div style="width:60px;font-size:11px;">其他</div><div style="flex:1;height:8px;background:var(--gray);border-radius:4px;"></div><div style="width:30px;font-size:11px;text-align:right;">15%</div></div></div></div></div></div>' +
      '<div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
        '<button onclick="document.getElementById(\'modal-energy-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  showToast('⚡ 正在加载能耗详情分析...', 'info');
}
