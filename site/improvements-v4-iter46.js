// improvements-v4-iter46.js - 物联后台v4第46轮（2026-03-30）
// 5个功能性断裂函数补全：openUnlockStrategyEngineModal + openPasswordSendLogModal + filterWoDispatchHistory + openInspectQualityModal + openSettlementHistoryModal

(function() {
  console.log('[iter46] 5个功能性断裂函数补全加载中');

  // ========== 改进1：openUnlockStrategyEngineModal - 智能开锁策略规则引擎 ==========
  // 理由：密码管理页"智能开锁策略"按钮调用此函数，但函数从未定义，点击无反应
  // 改进：打开策略规则引擎弹窗，支持配置开锁方式优先级、时段策略、异常告警规则
  window.openUnlockStrategyEngineModal = function() {
    var html = '<div class="modal-overlay" id="modal-unlock-strategy" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-unlock-strategy\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:720px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:15px;font-weight:700;">⚙️ 智能开锁策略规则引擎</div><span style="padding:3px 10px;background:var(--green-bg);border:1px solid var(--green);border-radius:12px;font-size:11px;color:var(--green);font-weight:600;">🟢 已启用</span></div>' +
      '<button onclick="document.getElementById(\'modal-unlock-strategy\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 20px 0;display:flex;gap:0;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);">' +
      '<div id="use-tab-main" onclick="switchUseTab && switchUseTab(\'main\', this)" style="padding:8px 16px;cursor:pointer;color:var(--blue);border-bottom:2px solid var(--blue);margin-bottom:-2px;">🔐 开锁优先级</div>' +
      '<div id="use-tab-time" onclick="switchUseTab && switchUseTab(\'time\', this)" style="padding:8px 16px;cursor:pointer;color:var(--text-muted);">⏰ 时段策略</div>' +
      '<div id="use-tab-alert" onclick="switchUseTab && switchUseTab(\'alert\', this)" style="padding:8px 16px;cursor:pointer;color:var(--text-muted);">🚨 异常告警</div>' +
      '<div id="use-tab-log" onclick="switchUseTab && switchUseTab(\'log\', this)" style="padding:8px 16px;cursor:pointer;color:var(--text-muted);">📜 策略日志</div></div>' +

      // Tab1: 开锁优先级
      '<div id="use-content-main" style="flex:1;overflow-y:auto;padding:16px 20px;">' +
      '<div style="margin-bottom:16px;padding:12px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">💡 开锁优先级决定多因素同时满足时的最终开锁方式，拖拽可调整优先级顺序</div>' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">🔐 开锁方式优先级排序（从高到低）</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;" id="unlock-priority-list">';

    var priorities = [
      { rank: 1, method: '🔑 卡片感应', status: 'enabled', ratio: '98%' },
      { rank: 2, method: '📱 APP蓝牙', status: 'enabled', ratio: '95%' },
      { rank: 3, method: '🔢 密码键盘', status: 'enabled', ratio: '92%' },
      { rank: 4, method: '👆 指纹识别', status: 'enabled', ratio: '99%' },
      { rank: 5, method: '🔑 钥匙机械', status: 'enabled', ratio: '100%' },
      { rank: 6, method: '☁️ 远程下发', status: 'disabled', ratio: '0%' }
    ];

    priorities.forEach(function(p, i) {
      var bg = p.status === 'enabled' ? 'var(--bg)' : 'var(--gray-bg, #f0f0f0)';
      var opacity = p.status === 'enabled' ? '1' : '0.5';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:' + bg + ';border:1px solid var(--border);border-radius:8px;opacity:' + opacity + ';cursor:' + (p.status === 'enabled' ? 'grab' : 'not-allowed') + ';" ' + (p.status === 'enabled' ? 'draggable="true" ondragstart="dragUnlockPriority(event)" ondrop="dropUnlockPriority(event)" ondragover="allowDrop(event)"' : '') + '>' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--blue);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">' + p.rank + '</div>' +
        '<div style="flex:1;font-size:13px;font-weight:600;">' + p.method + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + p.ratio + ' 成功率</div>' +
        '<button onclick="toggleUnlockPriority(' + i + ')" style="background:none;border:none;cursor:pointer;font-size:14px;">' + (p.status === 'enabled' ? '🔴' : '⚪') + '</button>' +
        '<button onclick="showToast(\'优先级' + p.rank + '已删除\', \'info\')" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--red);">🗑️</button></div>';
    });

    html += '</div>' +
      '<div style="margin-top:12px;display:flex;gap:10px;">' +
      '<button onclick="addUnlockPriority()" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">+ 添加开锁方式</button>' +
      '<button onclick="showToast(\'开锁优先级配置已保存\', \'success\')" style="padding:8px 16px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">💾 保存配置</button></div>' +

      // 紧急开门策略
      '<div style="margin-top:16px;padding:12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--orange);margin-bottom:8px;">🚨 紧急开门策略（强制配置）</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--text);">' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" checked style="accent-color:var(--green);">' +
      '火灾/燃气泄漏时：自动远程开门 + 声光报警</label>' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" checked style="accent-color:var(--green);">' +
      '医疗急救时：管理员APP一键强制开门</label>' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="accent-color:var(--green);">' +
      '门锁5次密码错误后：自动锁定3分钟并推送告警</label></div></div></div>' +

      // Tab2: 时段策略
      '<div id="use-content-time" style="flex:1;overflow-y:auto;padding:16px 20px;display:none;">' +
      '<div style="margin-bottom:16px;padding:12px;background:var(--purple-bg);border-radius:8px;font-size:12px;color:var(--purple);">💡 为不同时间段配置差异化的开锁方式，白天可关闭密码，夜间限制远程开门</div>' +
      '<div style="display:flex;flex-direction:column;gap:12px;">';

    var timeSlots = [
      { name: '🌅 白天常规', time: '06:00-18:00', methods: ['卡片', 'APP', '指纹', '密码'], default: true },
      { name: '🌙 夜间模式', time: '18:00-06:00', methods: ['卡片', '指纹'], default: false },
      { name: '🔒 深夜安保', time: '23:00-06:00', methods: ['卡片', '指纹', '钥匙'], default: false }
    ];

    timeSlots.forEach(function(s, i) {
      html += '<div style="border:1px solid var(--border);border-radius:8px;padding:14px;background:var(--bg);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
        '<div><div style="font-size:13px;font-weight:700;">' + s.name + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">⏰ ' + s.time + '</div></div>' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" ' + (s.default ? 'checked' : '') + ' style="accent-color:var(--blue);">' +
        '<span style="font-size:12px;">启用</span></label></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
      var allMethods = ['卡片感应', 'APP蓝牙', '密码键盘', '指纹识别', '钥匙机械', '远程下发'];
      allMethods.forEach(function(m) {
        var active = s.methods.some(function(sm) { return m.indexOf(sm) !== -1 || sm.indexOf(m[0]) !== -1; });
        html += '<button onclick="this.style.background=this.style.background===\'var(--blue-bg)\' ? \'var(--bg)\' : \'var(--blue-bg)\';this.style.borderColor=this.style.borderColor===\'var(--blue)\' ? \'var(--border)\' : \'var(--blue)\'" style="padding:4px 10px;font-size:11px;border:1px solid ' + (active ? 'var(--blue)' : 'var(--border)') + ';border-radius:20px;cursor:pointer;background:' + (active ? 'var(--blue-bg)' : 'var(--bg)') + ';color:' + (active ? 'var(--blue)' : 'var(--text-muted)') + ';font-weight:' + (active ? '600' : '400') + ';">' + m + '</button>';
      });
      html += '</div></div>';
    });

    html += '</div>' +
      '<div style="margin-top:12px;padding:10px 14px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">' +
      '💡 时段策略冲突时，按优先级高低生效（白天 > 夜间 > 深夜），支持跨天配置</div>' +
      '<div style="margin-top:12px;display:flex;gap:10px;"><button onclick="showToast(\'时段策略配置已保存\', \'success\')" style="padding:8px 16px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">💾 保存配置</button></div></div>' +

      // Tab3: 异常告警
      '<div id="use-content-alert" style="flex:1;overflow-y:auto;padding:16px 20px;display:none;">' +
      '<div style="margin-bottom:16px;padding:12px;background:var(--red-bg);border-radius:8px;font-size:12px;color:var(--red);">🚨 异常开锁行为将触发告警通知，管理员可及时处理</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">';

    var alertRules = [
      { rule: '🔴 暴力破解检测', desc: '5分钟内连续5次密码错误', action: '锁定3分钟 + 推送告警', enabled: true },
      { rule: '🟠 异常时段开门', desc: '凌晨2:00-5:00非授权人员开门', action: '推送告警 + 记录日志', enabled: true },
      { rule: '🟡 长时未关门', desc: '门打开超过3分钟未关闭', action: '推送提醒', enabled: true },
      { rule: '🔵 电量低告警', desc: '电量低于20%时', action: '推送提醒', enabled: true },
      { rule: '⚫ 设备离线告警', desc: '设备超过30分钟无心跳', action: '推送告警', enabled: false }
    ];

    alertRules.forEach(function(a) {
      var bg = a.enabled ? 'var(--bg)' : 'var(--gray-bg, #f5f5f5)';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:' + bg + ';border:1px solid var(--border);border-radius:8px;">' +
        '<div><div style="font-size:13px;font-weight:600;">' + a.rule + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + a.desc + '</div><div style="font-size:11px;color:var(--blue);margin-top:2px;">→ ' + a.action + '</div></div>' +
        '<label class="switch" style="position:relative;width:40px;height:22px;flex-shrink:0;"><input type="checkbox" ' + (a.enabled ? 'checked' : '') + ' onchange="this.previousElementSibling.style.background=this.checked ? \'var(--green)\' : \'var(--border)\'" style="opacity:0;width:0;height:0;"><span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:' + (a.enabled ? 'var(--green)' : 'var(--border)') + ';border-radius:22px;transition:0.3s;"></span></label></div>';
    });

    html += '</div>' +
      '<div style="margin-top:12px;display:flex;gap:10px;"><button onclick="showToast(\'告警规则配置已保存\', \'success\')" style="padding:8px 16px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">💾 保存配置</button></div></div>' +

      // Tab4: 策略日志
      '<div id="use-content-log" style="flex:1;overflow-y:auto;padding:16px 20px;display:none;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);">📜 策略执行日志（最近20条）</div>' +
      '<button onclick="showToast(\'策略日志已导出\', \'success\')" style="padding:6px 12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">📤 导出</button></div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' +
      '<table class="table" style="font-size:12px;"><thead><tr><th>时间</th><th>事件</th><th>房间</th><th>触发策略</th><th>结果</th></tr></thead><tbody>' +
      '<tr><td>03-30 09:12</td><td>密码开锁成功</td><td>301</td><td>白天常规策略</td><td><span class="tbadge green">✅ 通过</span></td></tr>' +
      '<tr><td>03-30 02:34</td><td>卡片开锁</td><td>203</td><td>深夜安保策略</td><td><span class="tbadge green">✅ 通过</span></td></tr>' +
      '<tr><td>03-29 23:56</td><td>密码连续错误</td><td>205</td><td>暴力破解检测</td><td><span class="tbadge red">🚨 锁定</span></td></tr>' +
      '<tr><td>03-29 18:05</td><td>远程开锁</td><td>302</td><td>夜间模式策略</td><td><span class="tbadge orange">⚠️ 受限</span></td></tr>' +
      '<tr><td>03-29 14:22</td><td>指纹开锁</td><td>101</td><td>白天常规策略</td><td><span class="tbadge green">✅ 通过</span></td></tr></tbody></table></div></div>' +

      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-unlock-strategy\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button></div></div></div>';
    var existing = document.getElementById('modal-unlock-strategy');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.switchUseTab = function(tab, el) {
    var tabs = ['main', 'time', 'alert', 'log'];
    tabs.forEach(function(t) {
      var tabEl = document.getElementById('use-tab-' + t);
      var contentEl = document.getElementById('use-content-' + t);
      if (tabEl) tabEl.style.color = t === tab ? 'var(--blue)' : 'var(--text-muted)';
      if (tabEl) tabEl.style.borderBottom = t === tab ? '2px solid var(--blue)' : 'none';
      if (contentEl) contentEl.style.display = t === tab ? 'block' : 'none';
    });
  };

  window.toggleUnlockPriority = function(idx) { showToast('优先级 #' + (idx + 1) + ' 已切换', 'info'); };
  window.addUnlockPriority = function() { showToast('添加开锁方式（功能演示）', 'info'); };
  window.dragUnlockPriority = function(e) { e.dataTransfer.setData('idx', e.target.getAttribute('data-idx') || ''); };
  window.dropUnlockPriority = function(e) { e.preventDefault(); showToast('优先级顺序已更新', 'success'); };
  window.allowDrop = function(e) { e.preventDefault(); };

  // ========== 改进2：openPasswordSendLogModal - 密码发送记录追踪 ==========
  // 理由：密码管理页"发送记录"按钮调用此函数，但函数从未定义
  // 改进：打开密码发送记录弹窗，显示密码发送时间、渠道、接收人、状态
  window.openPasswordSendLogModal = function() {
    var html = '<div class="modal-overlay" id="modal-password-send-log" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-password-send-log\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">📋 密码发送记录</div><span style="padding:3px 10px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:12px;font-size:11px;color:var(--blue);font-weight:600;">共 28 条</span></div>' +
      '<button onclick="document.getElementById(\'modal-password-send-log\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
      '<input type="text" id="psl-search" placeholder="🔍 搜索房间/住户/密码编号..." style="flex:1;min-width:200px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;" oninput="filterPasswordSendLog()">' +
      '<select id="psl-channel" onchange="filterPasswordSendLog()" style="padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="all">全部渠道</option><option value="sms">📱 短信</option><option value="wechat">💬 微信</option><option value="app">📲 APP</option><option value="copy">📋 复制</option></select>' +
      '<select id="psl-status" onchange="filterPasswordSendLog()" style="padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="all">全部状态</option><option value="delivered">✅ 已送达</option><option value="read">👁️ 已查看</option><option value="failed">❌ 发送失败</option></select>' +
      '<button onclick="document.getElementById(\'psl-search\').value=\'\';document.getElementById(\'psl-channel\').value=\'all\';document.getElementById(\'psl-status\').value=\'all\';renderPasswordSendLogTable()" style="padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;">重置</button>' +
      '<button onclick="showToast(\'发送记录已导出\', \'success\')" style="padding:8px 12px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">📤 导出</button></div>' +
      '<div id="psl-table-container" style="flex:1;overflow-y:auto;padding:0 20px 20px;">' +
      '<table class="table" style="font-size:12px;margin-top:12px;"><thead><tr><th>发送时间</th><th>密码编号</th><th>房间</th><th>住户</th><th>发送渠道</th><th>接收账号</th><th>状态</th><th>操作</th></tr></thead>' +
      '<tbody id="psl-tbody">' +
      '<tr><td>03-30 09:15</td><td style="font-family:monospace;">KP-2026033001</td><td>301</td><td>张三</td><td><span class="tbadge blue">📱 短信</span></td><td>138****8888</td><td><span class="tbadge green">✅ 已送达</span></td><td><button class="action-btn small" onclick="resendPasswordLog(\'KP-2026033001\')">重发</button></td></tr>' +
      '<tr><td>03-30 08:42</td><td style="font-family:monospace;">KP-2026033002</td><td>203</td><td>李四</td><td><span class="tbadge green">💬 微信</span></td><td>wx_***lisi</td><td><span class="tbadge blue">👁️ 已查看</span></td><td><button class="action-btn small" onclick="resendPasswordLog(\'KP-2026033002\')">重发</button></td></tr>' +
      '<tr><td>03-29 16:20</td><td style="font-family:monospace;">KP-2026032925</td><td>205</td><td>王五</td><td><span class="tbadge orange">📲 APP</span></td><td>app_user***</td><td><span class="tbadge green">✅ 已送达</span></td><td><button class="action-btn small" onclick="resendPasswordLog(\'KP-2026032925\')">重发</button></td></tr>' +
      '<tr><td>03-29 14:08</td><td style="font-family:monospace;">KP-2026032920</td><td>102</td><td>钱七</td><td><span class="tbadge gray">📋 复制</span></td><td>—</td><td><span class="tbadge gray">—</span></td><td><button class="action-btn small" onclick="resendPasswordLog(\'KP-2026032920\')">重发</button></td></tr>' +
      '<tr><td>03-29 11:33</td><td style="font-family:monospace;">KP-2026032915</td><td>304</td><td>赵六</td><td><span class="tbadge blue">📱 短信</span></td><td>139****6666</td><td><span class="tbadge red">❌ 发送失败</span></td><td><button class="action-btn small orange" onclick="resendPasswordLog(\'KP-2026032915\')">重发</button></td></tr>' +
      '<tr><td>03-28 18:45</td><td style="font-family:monospace;">KP-2026032810</td><td>201</td><td>孙九</td><td><span class="tbadge green">💬 微信</span></td><td>wx_***sun9</td><td><span class="tbadge green">✅ 已送达</span></td><td><button class="action-btn small" onclick="resendPasswordLog(\'KP-2026032810\')">重发</button></td></tr></tbody></table></div>' +
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:11px;color:var(--text-muted);">显示 1-6 条，共 28 条</div>' +
      '<div style="display:flex;gap:6px;"><button class="action-btn small" style="padding:5px 10px;font-size:11px;opacity:0.5;" disabled>上一页</button><button class="action-btn small" onclick="showToast(\'加载第2页\',\'info\')" style="padding:5px 10px;font-size:11px;background:var(--blue);color:white;border:none;">下一页</button></div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-password-send-log\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button></div></div></div>';
    var existing = document.getElementById('modal-password-send-log');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.filterPasswordSendLog = function() {
    var search = document.getElementById('psl-search');
    var channel = document.getElementById('psl-channel');
    var status = document.getElementById('psl-status');
    var keyword = search ? search.value.trim().toLowerCase() : '';
    var ch = channel ? channel.value : 'all';
    var st = status ? status.value : 'all';
    var rows = document.querySelectorAll('#psl-tbody tr');
    rows.forEach(function(row) {
      var text = row.textContent.toLowerCase();
      var show = text.indexOf(keyword) !== -1;
      row.style.display = show ? '' : 'none';
    });
    var visible = document.querySelectorAll('#psl-tbody tr:not([style*="display: none"])').length;
    var container = document.getElementById('psl-table-container');
    if (container) {
      var info = container.parentElement.querySelector('.page-sub, div[style*="font-size:11px;color:var(--text-muted)"]');
    }
    showToast('筛选结果：' + visible + ' 条记录', 'info');
  };

  window.resendPasswordLog = function(kpId) {
    showToast('密码 ' + kpId + ' 已重新发送', 'success');
  };

  // ========== 改进3：filterWoDispatchHistory - 工单派发历史筛选 ==========
  // 理由：工单列表页"派发历史"按钮调用此函数，但函数从未定义
  // 改进：筛选并显示工单的派发历史记录，包括派发时间、派发对象、状态变更
  window.filterWoDispatchHistory = function(woId) {
    woId = woId || 'WO-2026032801';
    var html = '<div class="modal-overlay" id="modal-wo-dispatch-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-dispatch-history\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:560px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">📜 工单派发历史</div><span style="padding:3px 10px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:12px;font-size:11px;color:var(--purple);font-weight:600;">' + woId + '</span></div>' +
      '<button onclick="document.getElementById(\'modal-wo-dispatch-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button onclick="renderDispatchHistory(\'' + woId + '\', \'all\')" style="padding:5px 12px;font-size:11px;background:var(--blue);color:white;border:none;border-radius:20px;cursor:pointer;font-weight:600;">全部</button>' +
      '<button onclick="renderDispatchHistory(\'' + woId + '\', \'accept\')" style="padding:5px 12px;font-size:11px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:20px;cursor:pointer;">接受</button>' +
      '<button onclick="renderDispatchHistory(\'' + woId + '\', \'transfer\')" style="padding:5px 12px;font-size:11px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:20px;cursor:pointer;">移交</button>' +
      '<button onclick="renderDispatchHistory(\'' + woId + '\', \'reject\')" style="padding:5px 12px;font-size:11px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:20px;cursor:pointer;">拒绝</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:12px 20px;" id="dispatch-history-list">' +
      '<div style="display:flex;flex-direction:column;gap:10px;">';

    var history = [
      { time: '03-30 09:12', action: '🟢 接受', from: '系统', to: '赵飞（前厅经理）', note: '工单已接受，开始处理' },
      { time: '03-30 09:05', action: '🔄 派发', from: '系统自动', to: '赵飞（前厅经理）', note: '根据投诉类型自动派发' },
      { time: '03-30 09:00', action: '🔴 创建', from: '客户', to: '系统', note: '客户投诉：房间空调不制冷' }
    ];

    history.forEach(function(h) {
      var actionColor = h.action.indexOf('创建') !== -1 ? 'var(--blue)' : h.action.indexOf('接受') !== -1 ? 'var(--green)' : h.action.indexOf('派发') !== -1 ? 'var(--orange)' : 'var(--purple)';
      var actionBg = h.action.indexOf('创建') !== -1 ? 'var(--blue-bg)' : h.action.indexOf('接受') !== -1 ? 'var(--green-bg)' : h.action.indexOf('派发') !== -1 ? 'var(--orange-bg)' : 'var(--purple-bg)';
      html += '<div style="display:flex;gap:12px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;">' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:2px;">' +
        '<div style="width:8px;height:8px;border-radius:50%;background:' + actionColor + ';"></div>' +
        '<div style="width:1px;flex:1;background:var(--border);min-height:20px;"></div></div>' +
        '<div style="flex:1;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
        '<span style="padding:2px 8px;background:' + actionBg + ';color:' + actionColor + ';border-radius:12px;font-size:10px;font-weight:700;">' + h.action + '</span>' +
        '<span style="font-size:11px;color:var(--text-muted);">' + h.time + '</span></div>' +
        '<div style="font-size:12px;"><span style="color:var(--text-muted);">从 </span><strong>' + h.from + '</strong><span style="color:var(--text-muted);"> → </span><strong>' + h.to + '</strong></div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + h.note + '</div></div></div>';
    });

    html += '</div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:11px;color:var(--text-muted);">共 3 条派发记录</div>' +
      '<button onclick="showToast(\'派发历史已导出\', \'success\')" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">📤 导出</button></div></div></div>';
    var existing = document.getElementById('modal-wo-dispatch-history');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.renderDispatchHistory = function(woId, filter) {
    showToast('筛选类型：' + filter, 'info');
  };

  // ========== 改进4：openInspectQualityModal - 查房质量检查弹窗 ==========
  // 理由：房务管理页面点击"查房质量"按钮调用此函数，但函数从未定义
  // 改进：打开查房质量检查弹窗，支持对每次查房任务进行质量评分、问题记录和通过/返工操作
  window.openInspectQualityModal = function(roomNum) {
    roomNum = roomNum || '102';
    var html = '<div class="modal-overlay" id="modal-inspect-quality" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-inspect-quality\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:600px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">🔍 查房质量检查</div><span style="padding:3px 10px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:12px;font-size:11px;color:var(--blue);font-weight:600;">房间 ' + roomNum + '</span></div>' +
      '<button onclick="document.getElementById(\'modal-inspect-quality\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 20px;">' +

      // 查房基本信息
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
      '<div style="padding:10px 12px;background:var(--blue-bg);border-radius:8px;font-size:12px;"><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">房型</div><div style="font-weight:700;color:var(--blue);">亲子间</div></div>' +
      '<div style="padding:10px 12px;background:var(--green-bg);border-radius:8px;font-size:12px;"><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">清洁人员</div><div style="font-weight:700;color:var(--green);">吴倩</div></div>' +
      '<div style="padding:10px 12px;background:var(--orange-bg);border-radius:8px;font-size:12px;"><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">查房时间</div><div style="font-weight:700;color:var(--orange);">03-30 10:15</div></div>' +
      '<div style="padding:10px 12px;background:var(--purple-bg);border-radius:8px;font-size:12px;"><div style="color:var(--text-muted);font-size:10px;margin-bottom:2px;">检查人</div><div style="font-weight:700;color:var(--purple);">周敏</div></div></div>' +

      // 质量评分
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">⭐ 整体质量评分</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<div id="iq-star-container" style="display:flex;gap:4px;">';
    for (var s = 1; s <= 5; s++) {
      html += '<span onclick="setInspectScore(' + s + ')" style="font-size:24px;cursor:pointer;color:' + (s <= 4 ? 'var(--gold,#faad14)' : 'var(--border)') + ';transition:color 0.2s;">★</span>';
    }
    html += '</div><span id="iq-score-label" style="font-size:13px;font-weight:700;color:var(--gold,#faad14);">4.0</span><span style="font-size:12px;color:var(--text-muted);">/ 5分</span></div></div>' +

      // 分项检查
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">✅ 分项检查项</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">';

    var checkItems = [
      { name: '🛏️ 床品更换', score: 5 },
      { name: '🧹 地面清洁', score: 4 },
      { name: '🚿 卫生间清洁', score: 4 },
      { name: '📺 设备检查', score: 3 },
      { name: '🧴 耗品补充', score: 5 }
    ];

    checkItems.forEach(function(item, i) {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg);border-radius:6px;">' +
        '<span style="font-size:12px;font-weight:600;">' + item.name + '</span>' +
        '<div style="display:flex;align-items:center;gap:4px;">' +
        '<span onclick="setSubScore(' + i + ', this)" style="cursor:pointer;font-size:14px;color:' + (item.score >= 1 ? 'var(--gold,#faad14)' : 'var(--border)') + ';">' + (item.score >= 1 ? '★' : '☆') + '</span>' +
        '<span onclick="setSubScore(' + i + ', this)" style="cursor:pointer;font-size:14px;color:' + (item.score >= 2 ? 'var(--gold,#faad14)' : 'var(--border)') + ';">' + (item.score >= 2 ? '★' : '☆') + '</span>' +
        '<span onclick="setSubScore(' + i + ', this)" style="cursor:pointer;font-size:14px;color:' + (item.score >= 3 ? 'var(--gold,#faad14)' : 'var(--border)') + ';">' + (item.score >= 3 ? '★' : '☆') + '</span>' +
        '<span onclick="setSubScore(' + i + ', this)" style="cursor:pointer;font-size:14px;color:' + (item.score >= 4 ? 'var(--gold,#faad14)' : 'var(--border)') + ';">' + (item.score >= 4 ? '★' : '☆') + '</span>' +
        '<span onclick="setSubScore(' + i + ', this)" style="cursor:pointer;font-size:14px;color:' + (item.score >= 5 ? 'var(--gold,#faad14)' : 'var(--border)') + ';">' + (item.score >= 5 ? '★' : '☆') + '</span></div></div>';
    });

    html += '</div></div>' +

      // 问题记录
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">📝 问题记录</div>' +
      '<textarea id="iq-problems" class="form-input" rows="3" placeholder="记录发现的问题（如：电视遥控器电池电量低、淋浴地漏排水慢）..." style="width:100%;padding:10px 12px;font-size:12px;resize:vertical;"></textarea></div>' +

      // 最终判定
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;">' +
      '<input type="radio" name="iq-result" value="pass" checked style="accent-color:var(--green);width:16px;height:16px;">' +
      '<span style="font-size:13px;font-weight:600;color:var(--green);">✅ 检查通过</span></label>' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;">' +
      '<input type="radio" name="iq-result" value="retry" style="accent-color:var(--orange);width:16px;height:16px;">' +
      '<span style="font-size:13px;font-weight:600;color:var(--orange);">🔄 要求返工</span></label>' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;">' +
      '<input type="radio" name="iq-result" value="fail" style="accent-color:var(--red);width:16px;height:16px;">' +
      '<span style="font-size:13px;font-weight:600;color:var(--red);">❌ 检查不通过，扣款处理</span></label></div></div>' +

      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-inspect-quality\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
      '<button onclick="submitInspectQuality(\'' + roomNum + '\')" style="padding:10px 24px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 提交检查结果</button></div></div></div>';
    var existing = document.getElementById('modal-inspect-quality');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.setInspectScore = function(score) {
    var label = document.getElementById('iq-score-label');
    if (label) label.textContent = score.toFixed(1);
    var stars = document.querySelectorAll('#iq-star-container span');
    stars.forEach(function(star, idx) {
      star.style.color = idx < score ? 'var(--gold,#faad14)' : 'var(--border)';
    });
    showToast('质量评分：' + score + ' 分', 'info');
  };

  window.setSubScore = function(idx, el) {
    showToast('分项 #' + (idx + 1) + ' 评分已更新', 'info');
  };

  window.submitInspectQuality = function(roomNum) {
    var result = document.querySelector('input[name="iq-result"]:checked');
    var resultVal = result ? result.value : 'pass';
    var resultText = resultVal === 'pass' ? '检查通过' : resultVal === 'retry' ? '要求返工' : '检查不通过';
    var toastMsg = resultVal === 'fail' ? '⚠️ 房间 ' + roomNum + ' 检查不通过，已记录扣款' : '✅ 房间 ' + roomNum + ' ' + resultText;
    var toastType = resultVal === 'fail' ? 'error' : resultVal === 'retry' ? 'warning' : 'success';
    document.getElementById('modal-inspect-quality').remove();
    showToast(toastMsg, toastType);
  };

  // ========== 改进5：openSettlementHistoryModal - 结账历史记录弹窗 ==========
  // 理由：结账页面点击"结账历史"按钮调用此函数，但函数从未定义
  // 改进：打开结账历史记录弹窗，显示所有结账记录的时间线、金额、支付方式、状态
  window.openSettlementHistoryModal = function() {
    var html = '<div class="modal-overlay" id="modal-settlement-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-settlement-history\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:680px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">📋 结账历史记录</div><span style="padding:3px 10px;background:var(--green-bg);border:1px solid var(--green);border-radius:12px;font-size:11px;color:var(--green);font-weight:600;">本月 36 笔</span></div>' +
      '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
      '<select id="sh-month" onchange="filterSettlementHistory()" style="padding:7px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="03">2026年3月</option><option value="02">2026年2月</option><option value="01">2026年1月</option></select>' +
      '<select id="sh-status" onchange="filterSettlementHistory()" style="padding:7px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="all">全部状态</option><option value="completed">✅ 已结清</option><option value="partial">⚠️ 部分付款</option><option value="overdue">🔴 逾期欠款</option></select>' +
      '<input type="text" id="sh-search" placeholder="🔍 搜索房间/姓名..." style="flex:1;min-width:160px;padding:7px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;" oninput="filterSettlementHistory()">' +
      '<button onclick="showToast(\'结账历史已导出\', \'success\')" style="padding:7px 14px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">📤 导出</button></div>' +

      // 汇总卡片
      '<div style="padding:12px 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-bottom:1px solid var(--border);">' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">¥28,450</div><div style="font-size:10px;color:var(--text-muted);">本月已结</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">¥3,200</div><div style="font-size:10px;color:var(--text-muted);">部分付款</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--red-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--red);">¥1,800</div><div style="font-size:10px;color:var(--text-muted);">逾期欠款</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">36</div><div style="font-size:10px;color:var(--text-muted);">结账笔数</div></div></div>' +

      '<div style="flex:1;overflow-y:auto;padding:12px 20px;">' +
      '<table class="table" style="font-size:12px;"><thead><tr><th>结账单号</th><th>房间</th><th>住户</th><th>结账日期</th><th>金额</th><th>支付方式</th><th>状态</th><th>操作</th></tr></thead><tbody id="sh-tbody">' +
      '<tr><td>STL-2026033001</td><td>301</td><td>张三</td><td>03-30</td><td style="font-weight:700;color:var(--green);">¥486</td><td><span class="tbadge blue">微信</span></td><td><span class="tbadge green">✅ 已结清</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026033001\')">详情</button></td></tr>' +
      '<tr><td>STL-2026032901</td><td>203</td><td>李四</td><td>03-29</td><td style="font-weight:700;color:var(--green);">¥320</td><td><span class="tbadge green">支付宝</span></td><td><span class="tbadge green">✅ 已结清</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026032901\')">详情</button></td></tr>' +
      '<tr><td>STL-2026032801</td><td>205</td><td>王五</td><td>03-28</td><td style="font-weight:700;color:var(--orange);">¥186</td><td><span class="tbadge gray">挂账</span></td><td><span class="tbadge orange">⚠️ 部分付款</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026032801\')">详情</button></td></tr>' +
      '<tr><td>STL-2026032501</td><td>102</td><td>钱七</td><td>03-25</td><td style="font-weight:700;color:var(--red);">¥600</td><td><span class="tbadge gray">挂账</span></td><td><span class="tbadge red">🔴 逾期</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026032501\')">详情</button></td></tr>' +
      '<tr><td>STL-2026032401</td><td>304</td><td>赵六</td><td>03-24</td><td style="font-weight:700;color:var(--green);">¥1,280</td><td><span class="tbadge purple">现金</span></td><td><span class="tbadge green">✅ 已结清</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026032401\')">详情</button></td></tr>' +
      '<tr><td>STL-2026032201</td><td>201</td><td>孙九</td><td>03-22</td><td style="font-weight:700;color:var(--green);">¥680</td><td><span class="tbadge blue">微信</span></td><td><span class="tbadge green">✅ 已结清</span></td><td><button class="action-btn small" onclick="openSettlementDetail(\'STL-2026032201\')">详情</button></td></tr></tbody></table></div>' +

      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:11px;color:var(--text-muted);">显示 1-6 条，共 36 条</div>' +
      '<div style="display:flex;gap:6px;"><button class="action-btn small" style="padding:5px 10px;font-size:11px;opacity:0.5;" disabled>上一页</button><button class="action-btn small" onclick="showToast(\'加载下一页\',\'info\')" style="padding:5px 10px;font-size:11px;background:var(--blue);color:white;border:none;">下一页</button></div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-settlement-history\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button></div></div></div>';
    var existing = document.getElementById('modal-settlement-history');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.filterSettlementHistory = function() {
    var month = document.getElementById('sh-month');
    var status = document.getElementById('sh-status');
    var search = document.getElementById('sh-search');
    var keyword = search ? search.value.trim().toLowerCase() : '';
    var rows = document.querySelectorAll('#sh-tbody tr');
    rows.forEach(function(row) {
      var text = row.textContent.toLowerCase();
      row.style.display = text.indexOf(keyword) !== -1 ? '' : 'none';
    });
    var visible = document.querySelectorAll('#sh-tbody tr:not([style*="display: none"])').length;
    showToast('筛选结果：' + visible + ' 条记录', 'info');
  };

  console.log('[iter46] 5个功能性断裂函数补全完成：openUnlockStrategyEngineModal / openPasswordSendLogModal / filterWoDispatchHistory / openInspectQualityModal / openSettlementHistoryModal');
})();
