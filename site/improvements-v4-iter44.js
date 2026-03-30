// improvements-v4-iter44.js - 物联后台v4第44轮（2026-03-30）
// 5个功能性改进：showDoorLogDetail + openSettlementDetail + openPowerControlModal + switchWoarTab + filterBatchRooms

(function() {
  console.log('[iter44] 5个功能性断裂函数补全加载中');

  // ========== 改进1：showDoorLogDetail - 按门查开锁详情弹窗 ==========
  // 理由：开锁记录"按门查"视图每行有"详情"按钮调用此函数，但函数从未定义
  // 改进：打开弹窗显示指定房间的所有开锁记录，包括时间、方式、操作人
  var _doorLogData = {
    '301': [
      { time: '10:32:08', type: '手机开锁', method: '📱手机', card: 'M138****8888', person: '张三', result: '成功' },
      { time: '09:15:22', type: '客户卡', method: '💳客户卡', card: 'C2026***101', person: '张三', result: '成功' },
      { time: '08:45:01', type: '员工卡', method: '👤员工卡', card: 'E003', person: '周敏', result: '成功' },
      { time: '昨天 22:05', type: '手机开锁', method: '📱手机', card: 'M138****8888', person: '张三', result: '成功' },
      { time: '昨天 18:30', type: '通卡', method: '🔑通卡', card: 'MASTER001', person: '赵飞', result: '成功' }
    ],
    '203': [
      { time: '10:15:22', type: '客户卡', method: '💳客户卡', card: 'C2026***101', person: '李四', result: '成功' },
      { time: '09:00:15', type: '手机开锁', method: '📱手机', card: 'M139****6666', person: '李四', result: '成功' },
      { time: '昨天 20:10', type: '员工卡', method: '👤员工卡', card: 'E002', person: '王工', result: '成功' }
    ],
    '304': [
      { time: '09:48:05', type: '手机开锁', method: '📱手机', card: 'M137****5555', person: '王五', result: '成功' },
      { time: '08:20:33', type: '客户卡', method: '💳客户卡', card: 'C2026***204', person: '王五', result: '成功' },
      { time: '昨天 22:30', type: '手机开锁', method: '📱手机', card: 'M137****5555', person: '王五', result: '失败-电量低' }
    ],
    '102': [
      { time: '09:30:18', type: '通卡', method: '🔑通卡', card: 'MASTER001', person: '赵飞', result: '成功' },
      { time: '08:00:00', type: '员工卡', method: '👤员工卡', card: 'E001', person: '郑强', result: '成功' }
    ],
    '201': [
      { time: '09:12:44', type: '客户卡', method: '💳客户卡', card: 'C2026***301', person: '钱七', result: '成功' },
      { time: '08:45:30', type: '手机开锁', method: '📱手机', card: 'M136****4444', person: '钱七', result: '成功' },
      { time: '昨天 23:00', type: '手机开锁', method: '📱手机', card: 'M136****4444', person: '钱七', result: '成功' },
      { time: '昨天 19:00', type: '员工卡', method: '👤员工卡', card: 'E004', person: '孙工', result: '成功' },
      { time: '昨天 12:00', type: '客户卡', method: '💳客户卡', card: 'C2026***302', person: '钱七', result: '成功' },
      { time: '03-25 22:00', type: '通卡', method: '🔑通卡', card: 'MASTER001', person: '赵飞', result: '成功' }
    ],
    '202': [
      { time: '昨天 22:05', type: '手机开锁', method: '📱手机', card: 'M135****3333', person: '孙九', result: '成功' },
      { time: '昨天 14:20', type: '客户卡', method: '💳客户卡', card: 'C2026***401', person: '孙九', result: '成功' }
    ]
  };

  window.showDoorLogDetail = function(roomNum) {
    var records = _doorLogData[roomNum] || [];
    var totalCount = records.length;
    var successCount = records.filter(function(r) { return r.result === '成功'; }).length;

    var html = '<div class="modal-overlay" id="modal-door-log-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-door-log-detail\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:600px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="font-size:15px;font-weight:700;">🚪 房间 ' + roomNum + ' 开锁记录</div>' +
      '<button onclick="document.getElementById(\'modal-door-log-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 20px;display:flex;gap:16px;font-size:12px;color:var(--text-muted);border-bottom:1px solid var(--border);">' +
      '<span>📊 共 <strong style="color:var(--blue);">' + totalCount + '</strong> 条记录</span>' +
      '<span>✅ 成功 <strong style="color:var(--green);">' + successCount + '</strong> 条</span>' +
      '<span>❌ 失败 <strong style="color:var(--red);">' + (totalCount - successCount) + '</strong> 条</span></div>' +
      '<div style="flex:1;overflow-y:auto;padding:12px 20px;">';

    if (records.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px;">暂无开锁记录</div>';
    } else {
      html += '<table class="table" style="font-size:12px;">' +
        '<thead><tr><th>时间</th><th>方式</th><th>卡号/手机</th><th>操作人</th><th>结果</th></tr></thead>' +
        '<tbody>';
      records.forEach(function(r) {
        var resultColor = r.result === '成功' ? 'var(--green)' : 'var(--red)';
        html += '<tr>' +
          '<td style="white-space:nowrap;">' + r.time + '</td>' +
          '<td><span class="tbadge" style="font-size:11px;">' + r.method + '</span></td>' +
          '<td style="color:var(--blue);font-weight:600;">' + r.card + '</td>' +
          '<td>' + r.person + '</td>' +
          '<td style="color:' + resultColor + ';font-weight:600;">' + r.result + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    html += '</div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">' +
      '<button onclick="document.getElementById(\'modal-door-log-detail\').remove()" style="padding:8px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button>' +
      '<button onclick="showToast(\'已导出房间 ' + roomNum + ' 开锁记录\',\'success\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">📥 导出记录</button></div>' +
      '</div></div>';

    var existing = document.getElementById('modal-door-log-detail');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    showToast('🚪 已加载房间 ' + roomNum + ' 的 ' + totalCount + ' 条开锁记录', 'info');
  };

  // ========== 改进2：openSettlementDetail - 结算账单详情弹窗 ==========
  // 理由：结算中心待结算账单"结算"按钮调用此函数，但函数从未定义
  // 改进：打开结算详情弹窗，显示账单明细、费用明细，支持确认结算操作
  var _settlementData = {
    'BL-2026032701': {
      id: 'BL-2026032701', room: '301', guest: '张三', phone: '138****8888',
      checkin: '03-25 14:00', checkout: '03-28 12:00', nights: 3, roomType: '亲子间',
      amount: 328, status: 'pending',
      items: [
        { name: '房费（亲子间×3晚）', amount: 258 },
        { name: '加床费', amount: 30 },
        { name: '早餐×2', amount: 40 }
      ]
    },
    'BL-2026032702': {
      id: 'BL-2026032702', room: '203', guest: '李四', phone: '139****6666',
      checkin: '03-27 15:00', checkout: '03-28 11:00', nights: 1, roomType: '大床房',
      amount: 218, status: 'pending',
      items: [
        { name: '房费（大床房×1晚）', amount: 198 },
        { name: '鲜花布置', amount: 20 }
      ]
    },
    'BL-2026032503': {
      id: 'BL-2026032503', room: '202', guest: '钱七', phone: '136****4444',
      checkin: '03-23 14:00', checkout: '03-25 12:00', nights: 2, roomType: '标准间',
      amount: 198, status: 'overdue',
      items: [
        { name: '房费（标准间×2晚）', amount: 198 }
      ]
    },
    'STL-2026032701': {
      id: 'STL-2026032701', room: '305', guest: '孙九', phone: '135****3333',
      checkin: '03-20 14:00', checkout: '03-27 10:00', nights: 7, roomType: '亲子间',
      amount: 680, status: 'done', paidTime: '03-27 10:30',
      items: [
        { name: '房费（亲子间×7晚）', amount: 630 },
        { name: '加湿器使用费', amount: 50 }
      ]
    },
    'STL-2026032602': {
      id: 'STL-2026032602', room: '206', guest: '吴十', phone: '137****5555',
      checkin: '03-24 16:00', checkout: '03-26 11:00', nights: 2, roomType: '大床房',
      amount: 420, status: 'done', paidTime: '03-26 11:30',
      items: [
        { name: '房费（大床房×2晚）', amount: 396 },
        { name: '延迟退房费', amount: 24 }
      ]
    },
    'STL-2026032603': {
      id: 'STL-2026032603', room: '201', guest: '郑强', phone: '186****7777',
      checkin: '03-25 15:00', checkout: '03-26 14:00', nights: 1, roomType: '大床房',
      amount: 210, status: 'done', paidTime: '03-26 14:20',
      items: [
        { name: '房费（大床房×1晚）', amount: 198 },
        { name: '迷你吧消费', amount: 12 }
      ]
    }
  };

  window.openSettlementDetail = function(billId) {
    var bill = _settlementData[billId];
    if (!bill) {
      showToast('账单 ' + billId + ' 未找到', 'error');
      return;
    }

    var statusBadge = bill.status === 'pending' ? '<span class="tbadge orange">待结算</span>' :
                       bill.status === 'overdue' ? '<span class="tbadge red">已逾期</span>' :
                       '<span class="tbadge green">已结清</span>';

    var itemsHtml = bill.items.map(function(item) {
      return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">' +
        '<span style="color:var(--text);">' + item.name + '</span>' +
        '<span style="color:var(--blue);font-weight:600;">¥' + item.amount + '</span></div>';
    }).join('');

    var actionHtml = '';
    if (bill.status === 'pending' || bill.status === 'overdue') {
      actionHtml = '<button onclick="confirmSettlement(\'' + billId + '\')" style="padding:10px 24px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">💳 确认结算</button>';
    } else {
      actionHtml = '<button disabled style="padding:10px 24px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:6px;cursor:not-allowed;font-size:14px;font-weight:600;">✅ 已结清</button>';
    }

    var html = '<div class="modal-overlay" id="modal-settlement-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-settlement-detail\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:520px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="font-size:15px;font-weight:700;">💰 账单详情</div>' +
      '<button onclick="document.getElementById(\'modal-settlement-detail\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 20px;overflow-y:auto;flex:1;">' +

      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:12px 16px;background:var(--blue-bg);border-radius:8px;">' +
      '<div><div style="font-size:20px;font-weight:700;color:var(--blue);">¥' + bill.amount + '</div><div style="font-size:11px;color:var(--text-muted);">账单金额</div></div>' +
      '<div style="text-align:right;">' + statusBadge + '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">' + billId + '</div></div></div>' +

      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">📋 基本信息</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">房间：</span><strong>' + bill.room + '</strong></div>' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">房型：</span><strong>' + bill.roomType + '</strong></div>' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">入住：</span><strong>' + bill.checkin + '</strong></div>' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">退房：</span><strong>' + bill.checkout + '</strong></div>' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">客人：</span><strong>' + bill.guest + '</strong></div>' +
      '<div style="padding:8px 10px;background:var(--bg);border-radius:6px;"><span style="color:var(--text-muted);">电话：</span><strong>' + bill.phone + '</strong></div></div></div>' +

      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">📝 费用明细</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' + itemsHtml + '' +
      '<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:13px;font-weight:700;background:var(--bg);">' +
      '<span style="color:var(--text);">合计</span><span style="color:var(--blue);">¥' + bill.amount + '</span></div></div></div>';

    if (bill.paidTime) {
      html += '<div style="padding:10px 14px;background:var(--green-bg);border-radius:8px;font-size:12px;color:var(--green);text-align:center;">' +
        '✅ 已于 ' + bill.paidTime + ' 结清</div>';
    }

    html += '</div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;gap:10px;">' +
      '<button onclick="document.getElementById(\'modal-settlement-detail\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
      actionHtml + '</div>' +
      '</div></div>';

    var existing = document.getElementById('modal-settlement-detail');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // 辅助：确认结算
  window.confirmSettlement = function(billId) {
    var bill = _settlementData[billId];
    if (bill) {
      bill.status = 'done';
      bill.paidTime = new Date().toLocaleString('zh-CN');
    }
    document.getElementById('modal-settlement-detail').remove();
    showToast('✅ 账单 ' + billId + ' 已结清！', 'success');
    // 刷新结算表格（如果函数存在）
    if (typeof renderSettlementTable === 'function') renderSettlementTable();
  };

  // ========== 改进3：openPowerControlModal - 房间电源控制弹窗 ==========
  // 理由：节能风控页面每个房间卡片有"断电/通电"按钮调用此函数，但函数从未定义
  // 改进：打开电源控制确认弹窗，执行后显示成功/失败反馈
  window.openPowerControlModal = function(roomNum, action) {
    var actionText = action === 'on' ? '断电' : '通电';
    var actionColor = action === 'on' ? 'var(--red)' : 'var(--green)';
    var actionBg = action === 'on' ? 'var(--red-bg)' : 'var(--green-bg)';
    var confirmText = action === 'on' ? '确认断电' : '确认通电';
    var warnText = action === 'on' ? '断电后房间空调、照明将全部关闭' : '通电后房间电器将恢复正常使用';

    var html = '<div class="modal-overlay" id="modal-power-ctrl" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-power-ctrl\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="font-size:15px;font-weight:700;">⚡ 房间 ' + roomNum + ' 电源控制</div>' +
      '<button onclick="document.getElementById(\'modal-power-ctrl\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:24px 20px;text-align:center;">' +
      '<div style="width:60px;height:60px;border-radius:50%;background:' + actionBg + ';display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">' + (action === 'on' ? '🔌' : '⚡') + '</div>' +
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px;color:' + actionColor + ';">' + actionText + ' 房间 ' + roomNum + '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">' + warnText + '</div>' +
      '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);text-align:left;">' +
      '⚠️ 提示：频繁断电可能影响住客体验，建议优先使用空调调节功能</div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-power-ctrl\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
      '<button onclick="executePowerControl(\'' + roomNum + '\',\'' + action + '\')" style="padding:10px 24px;background:' + actionColor + ';color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">' + confirmText + '</button></div>' +
      '</div></div>';

    var existing = document.getElementById('modal-power-ctrl');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // 辅助：执行电源控制
  window.executePowerControl = function(roomNum, action) {
    document.getElementById('modal-power-ctrl').remove();
    showToast((action === 'on' ? '🔌' : '⚡') + ' 房间 ' + roomNum + ' 已' + (action === 'on' ? '断电' : '通电') + '！', action === 'on' ? 'warning' : 'success');
    // 更新房间卡片按钮状态（模拟）
    setTimeout(function() {
      var cards = document.querySelectorAll('.energy-card');
      cards.forEach(function(card) {
        var h4 = card.querySelector('h4');
        if (h4 && h4.textContent.indexOf(roomNum) !== -1) {
          var btn = card.querySelector('button[onclick*="openPowerControlModal"]');
          if (btn) {
            if (action === 'on') {
              btn.textContent = '⚡ 通电';
              btn.classList.remove('red');
              btn.classList.add('green');
              btn.setAttribute('onclick', "openPowerControlModal('" + roomNum + "','off')");
            } else {
              btn.textContent = '🔌 断电';
              btn.classList.remove('green');
              btn.classList.add('red');
              btn.setAttribute('onclick', "openPowerControlModal('" + roomNum + "','on')");
            }
          }
        }
      });
    }, 100);
  };

  // ========== 改进4：switchWoarTab - 工单自动派发规则Tab切换 ==========
  // 理由：工单自动派发规则弹窗有"派发规则"和"派发历史"两个Tab调用此函数，但函数从未定义
  // 改进：根据tab名称切换显示对应内容，高亮当前Tab
  window.switchWoarTab = function(tabName, el) {
    // 隐藏所有内容
    var rulesContent = document.getElementById('woar-content-rules');
    var historyContent = document.getElementById('woar-content-history');
    if (rulesContent) rulesContent.style.display = 'none';
    if (historyContent) historyContent.style.display = 'none';

    // 重置所有Tab样式
    var tabs = document.querySelectorAll('[id^="woar-tab-"]');
    tabs.forEach(function(tab) {
      tab.style.color = 'var(--text-muted)';
      tab.style.borderBottom = 'none';
      tab.style.marginBottom = '0';
    });

    // 高亮当前Tab并显示对应内容
    if (tabName === 'rules') {
      var rulesTab = document.getElementById('woar-tab-rules');
      if (rulesTab) {
        rulesTab.style.color = 'var(--blue)';
        rulesTab.style.borderBottom = '2px solid var(--blue)';
        rulesTab.style.marginBottom = '-2px';
      }
      if (rulesContent) rulesContent.style.display = '';
    } else if (tabName === 'history') {
      var historyTab = document.getElementById('woar-tab-history');
      if (historyTab) {
        historyTab.style.color = 'var(--blue)';
        historyTab.style.borderBottom = '2px solid var(--blue)';
        historyTab.style.marginBottom = '-2px';
      }
      if (historyContent) {
        historyContent.style.display = '';
        // 首次打开历史Tab时，渲染历史记录
        if (!historyContent.innerHTML.trim()) {
          renderWoarHistory();
        }
      }
    }
  };

  // 辅助：渲染派发历史
  function renderWoarHistory() {
    var container = document.getElementById('woar-content-history');
    if (!container) return;

    var historyData = [
      { time: '今天 10:32', type: '客户投诉', room: '301', guest: '张三', assignee: '赵飞（前厅经理）', action: '自动派发', result: '已接受' },
      { time: '今天 09:15', type: '设备报修', room: '305', guest: '孙九', assignee: '王工（维修）', action: '自动派发', result: '处理中' },
      { time: '昨天 18:20', type: '送物服务', room: '304', guest: '钱七', assignee: '周敏（前厅）', action: '手动分配', result: '已完成' },
      { time: '昨天 17:05', type: '客户投诉', room: '202', guest: '赵六', assignee: '赵飞（前厅经理）', action: '超时移交', result: '处理中' },
      { time: '03-26 15:30', type: '设备报修', room: '305', guest: '孙九', assignee: '王工（维修）', action: '自动派发', result: '已完成' }
    ];

    var html = '<div style="padding:0 4px;">' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">📜 最近 ' + historyData.length + ' 条派发记录</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">';
    historyData.forEach(function(item) {
      var resultColor = item.result === '已完成' ? 'var(--green)' : item.result === '处理中' ? 'var(--purple)' : 'var(--blue)';
      html += '<div style="padding:10px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg);font-size:12px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="font-weight:600;">' + item.type + '</span>' +
        '<span style="color:' + resultColor + ';font-weight:600;">' + item.result + '</span></div>' +
        '<div style="display:flex;gap:12px;color:var(--text-muted);">' +
        '<span>🏠 ' + item.room + '</span><span>👤 ' + item.guest + '</span><span>→ ' + item.assignee + '</span></div>' +
        '<div style="margin-top:4px;font-size:11px;color:var(--text-muted);">' + item.time + ' · ' + item.action + '</div></div>';
    });
    html += '</div></div>';

    container.innerHTML = html;
  }

  // ========== 改进5：filterBatchRooms - 批量入住房间筛选 ==========
  // 理由：批量入住页面有楼层和房型筛选下拉框（onchange调用filterBatchRooms），但函数从未定义
  // 改进：根据筛选条件显示/隐藏对应的批量入住房间chip
  window.filterBatchRooms = function() {
    var floorFilter = document.getElementById('batch-floor-filter');
    var typeFilter = document.getElementById('batch-type-filter');
    var floorVal = floorFilter ? floorFilter.value : 'all';
    var typeVal = typeFilter ? typeFilter.value : 'all';

    var chips = document.querySelectorAll('.batch-room-chip');
    var visibleCount = 0;

    chips.forEach(function(chip) {
      var chipFloor = chip.getAttribute('data-floor');
      var chipType = chip.getAttribute('data-type');

      var floorMatch = (floorVal === 'all') || (chipFloor === floorVal);
      var typeMatch = (typeVal === 'all') || (chipType === typeVal);

      if (floorMatch && typeMatch) {
        chip.style.display = '';
        visibleCount++;
      } else {
        chip.style.display = 'none';
      }
    });

    // 更新已选计数（只计算可见的）
    var selectedCount = 0;
    chips.forEach(function(chip) {
      if (chip.style.display !== 'none') {
        var room = chip.getAttribute('data-room');
        if (room && window._batchSelectedRooms && window._batchSelectedRooms[room]) {
          selectedCount++;
        }
      }
    });
    var countEl = document.getElementById('batch-room-count');
    if (countEl) countEl.textContent = selectedCount;

    showToast('筛选结果：' + visibleCount + ' 间房' + (selectedCount > 0 ? '（已选 ' + selectedCount + ' 间）' : ''), 'info');
  };

  // 初始化 _batchSelectedRooms
  window._batchSelectedRooms = window._batchSelectedRooms || {};

  console.log('[iter44] 5个功能性断裂函数补全完成：showDoorLogDetail / openSettlementDetail / openPowerControlModal / switchWoarTab / filterBatchRooms');
})();
