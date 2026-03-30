// ============================================================
// 【物联后台 v4 第48轮】5个缺失功能闭环
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：openMemberHistoryPanel - 会员入住历史面板 ----------
  window.openMemberHistoryPanel = function() {
    var existing = document.getElementById('modal-member-history');
    if (existing) existing.remove();
    var history = [
      {room:'301', type:'亲子间', checkin:'2026-03-26 14:00', checkout:'2026-03-29 12:00', nights:3, amount:384, points:38, staff:'前台-李婷'},
      {room:'201', type:'标准间', checkin:'2026-03-10 15:30', checkout:'2026-03-12 11:00', nights:2, amount:196, points:20, staff:'前台-王芳'},
      {room:'302', type:'大床房', checkin:'2026-02-14 16:00', checkout:'2026-02-16 10:00', nights:2, amount:216, points:22, staff:'前台-李婷'},
      {room:'303', type:'标准间', checkin:'2026-01-28 14:00', checkout:'2026-01-29 12:00', nights:1, amount:98, points:10, staff:'前台-王芳'}
    ];
    var totalNights = history.reduce(function(s, h){ return s + h.nights; }, 0);
    var totalAmount = history.reduce(function(s, h){ return s + h.amount; }, 0);
    var totalPoints = history.reduce(function(s, h){ return s + h.points; }, 0);
    var rows = history.map(function(h, i) {
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 8px;"><div style="font-weight:700;color:var(--blue);">' + h.room + '</div><div style="font-size:10px;color:var(--text-muted);">' + h.type + '</div></td>' +
        '<td style="padding:10px 8px;font-size:12px;">' + h.checkin + '<br><span style="color:var(--text-muted);font-size:10px;">至 ' + h.checkout + '</span></td>' +
        '<td style="padding:10px 8px;text-align:center;"><span style="font-weight:700;color:var(--orange);">' + h.nights + '</span><div style="font-size:10px;color:var(--text-muted);">晚</div></td>' +
        '<td style="padding:10px 8px;text-align:right;"><span style="color:var(--green);font-weight:600;">¥' + h.amount + '</span></td>' +
        '<td style="padding:10px 8px;text-align:center;"><span style="color:var(--purple);font-weight:600;">+' + h.points + '</span></td>' +
        '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + h.staff + '</td></tr>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-member-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-history\').remove()">' +
      '<div class="modal" style="width:640px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📋</div><div><div style="font-size:15px;font-weight:700;">会员入住历史查询</div><div style="font-size:11px;color:var(--text-muted);">累计消费 · 积分变动 · 入住偏好</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-member-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + history.length + '</div><div style="font-size:11px;color:var(--text-muted);">入住次数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">' + totalNights + '</div><div style="font-size:11px;color:var(--text-muted);">累计入住(晚)</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">¥' + totalAmount + '</div><div style="font-size:11px;color:var(--text-muted);">累计消费(¥)</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--purple);">' + totalPoints + '</div><div style="font-size:11px;color:var(--text-muted);">累计积分</div></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">房间</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">入住时间</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">入住晚数</th><th style="padding:8px 8px;text-align:right;font-weight:600;color:var(--text-muted);">消费金额</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">积分</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">接待员</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:12px;color:var(--text-muted);">近12个月内记录 · <span style="color:var(--blue);">查看全部历史</span></div>' +
      '<button onclick="document.getElementById(\'modal-member-history\').remove()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进2：openDoorUnlockHistoryModal - 房间开锁记录 ----------
  window.openDoorUnlockHistoryModal = function(room) {
    var existing = document.getElementById('modal-door-history');
    if (existing) existing.remove();
    var logs = [
      {time:'2026-03-30 09:41', way:'📱 APP蓝牙', user:'张三 138****8888', result:'成功', duration:'0.8s'},
      {time:'2026-03-30 08:15', way:'🔢 密码键盘', user:'住户-301', result:'成功', duration:'1.2s'},
      {time:'2026-03-29 22:30', way:'🔑 卡片感应', user:'住户-301', result:'成功', duration:'0.5s'},
      {time:'2026-03-29 14:20', way:'🔑 钥匙机械', user:'前台-李婷', result:'成功', duration:'3.1s'},
      {time:'2026-03-29 11:05', way:'👆 指纹识别', user:'张三 138****8888', result:'成功', duration:'0.6s'},
      {time:'2026-03-28 23:10', way:'☁️ 远程下发', user:'前台-王芳', result:'失败', duration:'--', reason:'网络超时'},
      {time:'2026-03-28 18:45', way:'📱 APP蓝牙', user:'住户-301', result:'成功', duration:'0.9s'}
    ];
    var successCount = logs.filter(function(l){ return l.result === '成功'; }).length;
    var rows = logs.map(function(l) {
      var resultColor = l.result === '成功' ? 'var(--green)' : 'var(--red)';
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 8px;font-size:12px;">' + l.time + '</td>' +
        '<td style="padding:10px 8px;"><span style="font-size:14px;">' + l.way + '</span></td>' +
        '<td style="padding:10px 8px;font-size:12px;">' + l.user + '</td>' +
        '<td style="padding:10px 8px;"><span style="color:' + resultColor + ';font-weight:600;">' + l.result + '</span>' + (l.reason ? '<div style="font-size:10px;color:var(--red);">' + l.reason + '</div>' : '') + '</td>' +
        '<td style="padding:10px 8px;font-size:12px;color:var(--text-muted);">' + l.duration + '</td></tr>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-door-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-door-history\').remove()">' +
      '<div class="modal" style="width:600px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🔐</div><div><div style="font-size:15px;font-weight:700;">开锁记录 - ' + (room || '未知') + '</div><div style="font-size:11px;color:var(--text-muted);">最近7天 · 开锁方式 · 开门结果</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-door-history\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + logs.length + '</div><div style="font-size:11px;color:var(--text-muted);">总开锁次数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">' + successCount + '</div><div style="font-size:11px;color:var(--text-muted);">成功次数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--red-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--red);">' + (logs.length - successCount) + '</div><div style="font-size:11px;color:var(--text-muted);">失败次数</div></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">时间</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">开锁方式</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">用户</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">结果</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">耗时</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="exportDoorUnlockHistory && exportDoorUnlockHistory()" style="padding:8px 16px;background:var(--green-bg);color:var(--green);border:1px solid var(--green);border-radius:8px;font-size:12px;cursor:pointer;">📤 导出记录</button>' +
      '<button onclick="document.getElementById(\'modal-door-history\').remove()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进3：openAttendanceRecordsModal - 员工考勤记录 ----------
  window.openAttendanceRecordsModal = function(staffName, idx) {
    var existing = document.getElementById('modal-attendance');
    if (existing) existing.remove();
    var records = [
      {date:'2026-03-29', checkin:'08:55', checkout:'18:05', workHours:9.2, status:'正常', late:0},
      {date:'2026-03-28', checkin:'09:10', checkout:'18:00', workHours:8.8, status:'迟到', late:10},
      {date:'2026-03-27', checkin:'08:48', checkout:'18:12', workHours:9.4, status:'正常', late:0},
      {date:'2026-03-26', checkin:'--', checkout:'--', workHours:0, status:'休息', late:0},
      {date:'2026-03-25', checkin:'08:52', checkout:'18:08', workHours:9.3, status:'正常', late:0},
      {date:'2026-03-24', checkin:'09:02', checkout:'17:55', workHours:8.9, status:'正常', late:2}
    ];
    var totalWork = records.filter(function(r){ return r.status !== '休息'; }).reduce(function(s, r){ return s + r.workHours; }, 0);
    var lateDays = records.filter(function(r){ return r.late > 0; }).length;
    var rows = records.map(function(r) {
      var statusColor = r.status === '正常' ? 'var(--green)' : r.status === '休息' ? 'var(--text-muted)' : 'var(--orange)';
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 8px;font-weight:600;">' + r.date + '</td>' +
        '<td style="padding:10px 8px;font-size:12px;">' + r.checkin + '</td>' +
        '<td style="padding:10px 8px;font-size:12px;">' + r.checkout + '</td>' +
        '<td style="padding:10px 8px;text-align:center;"><span style="font-weight:600;color:var(--blue);">' + r.workHours + 'h</span></td>' +
        '<td style="padding:10px 8px;text-align:center;"><span style="color:' + statusColor + ';font-weight:600;">' + r.status + '</span>' + (r.late > 0 ? '<div style="font-size:10px;color:var(--orange);">迟到' + r.late + 'min</div>' : '') + '</td></tr>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-attendance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-attendance\').remove()">' +
      '<div class="modal" style="width:540px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">📅</div><div><div style="font-size:15px;font-weight:700;">考勤记录 - ' + (staffName || '员工') + '</div><div style="font-size:11px;color:var(--text-muted);">近30天 · 出勤统计 · 迟到统计</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-attendance\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + records.filter(function(r){ return r.status !== '休息'; }).length + '</div><div style="font-size:11px;color:var(--text-muted);">出勤天数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">' + lateDays + '</div><div style="font-size:11px;color:var(--text-muted);">迟到天数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">' + totalWork.toFixed(1) + 'h</div><div style="font-size:11px;color:var(--text-muted);">累计工时</div></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">日期</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">签到</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">签退</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">工时</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">状态</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-attendance\').remove()" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进4：openMemberUpgradeRuleModal - 会员升级规则配置 ----------
  window.openMemberUpgradeRuleModal = function() {
    var existing = document.getElementById('modal-member-upgrade');
    if (existing) existing.remove();
    var rules = [
      {from:'普卡', to:'银卡', threshold:'累计消费满¥2000', current:'¥384', pct:19},
      {from:'银卡', to:'金卡', threshold:'累计消费满¥5000', current:'¥384', pct:8},
      {from:'金卡', to:'铂金卡', threshold:'累计消费满¥10000', current:'¥384', pct:4}
    ];
    var ruleRows = rules.map(function(r, i) {
      var barColor = r.pct >= 50 ? 'var(--green)' : r.pct >= 20 ? 'var(--orange)' : 'var(--red)';
      return '<div style="padding:14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:10px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="padding:3px 10px;background:var(--blue-bg);color:var(--blue);border-radius:12px;font-size:11px;font-weight:600;">' + r.from + '</span>' +
        '<span style="color:var(--text-muted);font-size:14px;">➜</span>' +
        '<span style="padding:3px 10px;background:var(--orange-bg);color:var(--orange);border-radius:12px;font-size:11px;font-weight:600;">' + r.to + '</span></div>' +
        '<div style="font-size:12px;color:var(--text-light);margin-bottom:6px;">升级条件：' + r.threshold + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + r.pct + '%;background:' + barColor + ';border-radius:3px;"></div></div>' +
        '<span style="font-size:11px;font-weight:600;color:' + barColor + ';">' + r.pct + '%</span></div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">当前累计：' + r.current + ' · 距离升级还需 ¥' + (parseInt(r.threshold.match(/¥(\d+)/)[1]) - 384) + '</div></div>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-member-upgrade" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-member-upgrade\').remove()">' +
      '<div class="modal" style="width:520px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">⬆️</div><div><div style="font-size:15px;font-weight:700;">会员升级规则配置</div><div style="font-size:11px;color:var(--text-muted);">等级权益 · 升级条件 · 进度追踪</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-member-upgrade\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);background:var(--blue-bg);font-size:12px;color:var(--blue);">💡 会员等级由累计消费金额决定，达到升级阈值自动晋升，无需手动操作</div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 24px;">' + ruleRows + '</div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="showToast(\'升级规则已保存\',\'success\')" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">💾 保存配置</button>' +
      '<button onclick="document.getElementById(\'modal-member-upgrade\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer;">关闭</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进5：openBatchFirmwareCheck - 批量固件检测 ----------
  window.openBatchFirmwareCheck = function() {
    var existing = document.getElementById('modal-firmware-check');
    if (existing) existing.remove();
    var devices = [
      {room:'301', uuid:'LK-A8F3-2C1D', model:'LK-Pro2024', version:'v2.3.1', latest:'v2.4.0', status:'可升级'},
      {room:'201', uuid:'LK-B7E2-3F4A', model:'LK-Pro2024', version:'v2.4.0', latest:'v2.4.0', status:'最新'},
      {room:'302', uuid:'LK-C5D1-1B8E', model:'LK-Air2023', version:'v1.8.2', latest:'v2.0.0', status:'可升级'},
      {room:'304', uuid:'LK-D9A7-4C2F', model:'LK-Pro2024', version:'v2.4.0', latest:'v2.4.0', status:'最新'},
      {room:'203', uuid:'LK-E1B6-5D3C', model:'LK-Air2023', version:'v1.9.0', latest:'v2.0.0', status:'可升级'}
    ];
    var upgradable = devices.filter(function(d){ return d.status === '可升级'; }).length;
    var statusColor = {最新:'var(--green)', 可升级:'var(--orange)'};
    var rows = devices.map(function(d) {
      var sc = statusColor[d.status] || 'var(--text-muted)';
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:10px 8px;font-weight:600;">' + d.room + '</td>' +
        '<td style="padding:10px 8px;font-size:11px;color:var(--text-muted);">' + d.uuid + '</td>' +
        '<td style="padding:10px 8px;font-size:12px;">' + d.model + '</td>' +
        '<td style="padding:10px 8px;"><span style="font-size:11px;padding:2px 8px;background:var(--bg);border-radius:10px;">' + d.version + '</span></td>' +
        '<td style="padding:10px 8px;"><span style="font-size:11px;padding:2px 8px;background:var(--blue-bg);color:var(--blue);border-radius:10px;">' + d.latest + '</span></td>' +
        '<td style="padding:10px 8px;"><span style="color:' + sc + ';font-weight:600;font-size:12px;">' + d.status + '</span></td></tr>';
    }).join('');
    var html = '<div class="modal-overlay hidden" id="modal-firmware-check" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-check\').remove()">' +
      '<div class="modal" style="width:620px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:28px;">🔍</div><div><div style="font-size:15px;font-weight:700;">批量固件版本检测</div><div style="font-size:11px;color:var(--text-muted);">设备型号 · 当前版本 · 最新版本</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-firmware-check\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
      '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--blue);">' + devices.length + '</div><div style="font-size:11px;color:var(--text-muted);">检测设备数</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--orange);">' + upgradable + '</div><div style="font-size:11px;color:var(--text-muted);">可升级设备</div></div>' +
      '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:var(--green);">' + (devices.length - upgradable) + '</div><div style="font-size:11px;color:var(--text-muted);">已是最新版本</div></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:0 24px;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
      '<thead><tr style="background:var(--bg);"><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">房间</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">设备UUID</th><th style="padding:8px 8px;text-align:left;font-weight:600;color:var(--text-muted);">型号</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">当前版本</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">最新版本</th><th style="padding:8px 8px;text-align:center;font-weight:600;color:var(--text-muted);">状态</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-firmware-check\').remove()" style="padding:8px 16px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer;">关闭</button>' +
      '<button onclick="if(' + upgradable + '>0){document.getElementById(\'modal-firmware-check\').remove();showToast(\'📦 已选中' + upgradable + '个设备，开始批量升级\',\'success\');}else{showToast(\'所有设备已是最新版本\',\'info\');}" style="padding:8px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">📦 批量升级(' + upgradable + ')</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  console.log('[iter48] 5个功能闭环完成：openMemberHistoryPanel / openDoorUnlockHistoryModal / openAttendanceRecordsModal / openMemberUpgradeRuleModal / openBatchFirmwareCheck');
})();
