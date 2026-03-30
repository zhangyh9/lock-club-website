// improvements-v4-iter45.js - 物联后台v4第45轮（2026-03-30）
// 5个功能性改进：openWorkorderTransferModal + openWorkorderAutoRuleModal + openWorkorderSLAModal + openWorkorderStatsDashboard + openDeviceBatchModal

(function() {
  console.log('[iter45] 5个功能性断裂函数补全加载中');

  // ========== 改进1：openWorkorderTransferModal - 工单移交弹窗 ==========
  // 理由：工单列表"移交"按钮调用此函数，但函数从未定义，导致点击无反应
  // 改进：打开移交弹窗，支持选择移交对象（员工），提交后更新工单状态
  window.openWorkorderTransferModal = function(woId) {
    var html = '<div class="modal-overlay" id="modal-wo-transfer" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-transfer\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:480px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="font-size:15px;font-weight:700;">🔄 工单移交</div>' +
      '<button onclick="document.getElementById(\'modal-wo-transfer\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px;">' +
      '<div style="margin-bottom:16px;padding:12px;background:var(--blue-bg);border-radius:8px;font-size:13px;">' +
      '<div style="color:var(--text-muted);font-size:11px;margin-bottom:4px;">工单编号</div>' +
      '<div style="font-weight:700;color:var(--blue);">' + woId + '</div></div>' +
      '<div style="margin-bottom:16px;">' +
      '<label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">👤 移交对象（必选）</label>' +
      '<select id="wo-transfer-staff" class="form-select" style="width:100%;padding:10px 12px;font-size:13px;">' +
      '<option value="">-- 请选择接收人 --</option>' +
      '<option value="赵飞">赵飞（前厅经理）</option>' +
      '<option value="周敏">周敏（前厅接待）</option>' +
      '<option value="吴倩">吴倩（客房主管）</option>' +
      '<option value="郑强">郑强（清洁人员）</option>' +
      '<option value="王工">王工（维修工程师）</option></select></div>' +
      '<div style="margin-bottom:16px;">' +
      '<label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">📝 移交原因</label>' +
      '<textarea id="wo-transfer-reason" class="form-input" rows="3" placeholder="请输入移交原因（选填）" style="width:100%;padding:10px 12px;font-size:13px;resize:vertical;"></textarea></div>' +
      '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);">' +
      '⚠️ 移交后，原处理人将不再接收该工单通知，请确认移交对象已确认接收</div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-wo-transfer\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
      '<button onclick="submitWorkorderTransfer(\'' + woId + '\')" style="padding:10px 24px;background:var(--purple);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">🔄 确认移交</button></div></div></div>';
    var existing = document.getElementById('modal-wo-transfer');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.submitWorkorderTransfer = function(woId) {
    var staff = document.getElementById('wo-transfer-staff');
    var staffVal = staff ? staff.value : '';
    if (!staffVal) {
      showToast('请选择移交对象', 'error');
      return;
    }
    document.getElementById('modal-wo-transfer').remove();
    showToast('✅ 工单 ' + woId + ' 已移交给 ' + staffVal, 'success');
    // 更新工单表格中对应行的处理人列（模拟）
    setTimeout(function() {
      var rows = document.querySelectorAll('#page-workorder tbody tr');
      rows.forEach(function(row) {
        if (row.innerHTML.indexOf(woId) !== -1) {
          var tds = row.querySelectorAll('td');
          if (tds.length >= 9) {
            tds[8].innerHTML = '<span class="tbadge purple">' + staffVal + '</span>';
            tds[7].innerHTML = '<span class="tbadge orange">移交中</span>';
          }
        }
      });
    }, 100);
  };

  // ========== 改进2：openWorkorderAutoRuleModal - 工单自动派发规则弹窗 ==========
  // 理由：工单工具栏有"自动派发"按钮调用此函数，但函数从未定义
  // 改进：打开自动派发规则配置弹窗，支持设置派发规则和查看派发历史
  window.openWorkorderAutoRuleModal = function() {
    var html = '<div class="modal-overlay" id="modal-wo-auto-rule" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-auto-rule\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:680px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:15px;font-weight:700;">⚙️ 工单自动派发规则</div><span style="padding:3px 10px;background:var(--green-bg);border:1px solid var(--green);border-radius:12px;font-size:11px;color:var(--green);font-weight:600;">🟢 已启用</span></div>' +
      '<button onclick="document.getElementById(\'modal-wo-auto-rule\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:14px 20px 0;display:flex;gap:0;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);">' +
      '<div id="woar-tab-rules" onclick="switchWoarTab && switchWoarTab(\'rules\', this)" style="padding:8px 16px;cursor:pointer;color:var(--blue);border-bottom:2px solid var(--blue);margin-bottom:-2px;">📋 派发规则</div>' +
      '<div id="woar-tab-history" onclick="switchWoarTab && switchWoarTab(\'history\', this)" style="padding:8px 16px;cursor:pointer;color:var(--text-muted);">📜 派发历史</div></div>' +
      '<div id="woar-content-rules" style="flex:1;overflow-y:auto;padding:16px 20px;">' +
      '<div style="margin-bottom:20px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">🔧 自动派发规则列表</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';

    var rules = [
      { type: '🔴 客户投诉', target: '赵飞（前厅经理）', condition: '投诉类型=紧急', status: '已启用' },
      { type: '🔧 设备报修', target: '王工（维修）', condition: '报修类型=门锁', status: '已启用' },
      { type: '📦 送物服务', target: '周敏（前厅）', condition: '时间 09:00-18:00', status: '已启用' },
      { type: '🧹 清洁请求', target: '吴倩（客房主管）', condition: '房型=亲子间', status: '已启用' }
    ];

    rules.forEach(function(r, i) {
      var statusBg = r.status === '已启用' ? 'var(--green-bg)' : 'var(--gray-bg)';
      var statusColor = r.status === '已启用' ? 'var(--green)' : 'var(--text-muted)';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);' + (i === rules.length - 1 ? 'border-bottom:none;' : '') + '">' +
        '<div style="flex:1;"><div style="font-weight:600;font-size:13px;">' + r.type + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">→ 派发给 <strong style="color:var(--purple);">' + r.target + '</strong> · ' + r.condition + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span style="padding:3px 10px;background:' + statusBg + ';color:' + statusColor + ';border-radius:12px;font-size:11px;font-weight:600;">' + r.status + '</span>' +
        '<button onclick="toggleWoRule(' + i + ')" style="background:none;border:none;cursor:pointer;font-size:14px;">' + (r.status === '已启用' ? '🔴' : '⚪') + '</button>' +
        '<button onclick="deleteWoRule(' + i + ')" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--red);">🗑️</button></div></div>';
    });

    html += '</div></div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
      '<button onclick="openAddWoRuleModal()" style="padding:10px 20px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">+ 新增规则</button>' +
      '<button onclick="showToast(\'所有规则已保存\',\'success\')" style="padding:10px 20px;background:var(--green);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存规则</button></div>' +
      '<div style="padding:10px 14px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">💡 自动派发规则按优先级匹配，精确匹配优先于模糊匹配，支持时间条件、房型条件、投诉等级等多维度配置。</div></div>' +
      '<div id="woar-content-history" style="flex:1;overflow-y:auto;padding:16px 20px;display:none;"></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-wo-auto-rule\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button></div></div></div>';
    var existing = document.getElementById('modal-wo-auto-rule');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.toggleWoRule = function(idx) { showToast('规则 #' + (idx + 1) + ' 已切换启用状态', 'info'); };
  window.deleteWoRule = function(idx) { showToast('规则 #' + (idx + 1) + ' 已删除', 'success'); };
  window.openAddWoRuleModal = function() { showToast('新增派发规则弹窗（功能演示）', 'info'); };

  // ========== 改进3：openWorkorderSLAModal - 工单SLA超时配置弹窗 ==========
  // 理由：工单工具栏有"SLA超时"按钮调用此函数，但函数从未定义
  // 改进：打开SLA超时规则配置弹窗，显示各工单类型的SLA时限
  window.openWorkorderSLAModal = function() {
    var html = '<div class="modal-overlay" id="modal-wo-sla" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-sla\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:560px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">⏰ SLA超时规则配置</div></div>' +
      '<button onclick="document.getElementById(\'modal-wo-sla\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 20px;">' +
      '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:16px;">' +
      '⚠️ SLA = Service Level Agreement，超时后工单将自动升级并推送告警通知</div>' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">📋 工单类型SLA时限配置</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">';

    var slaTypes = [
      { type: '🔴 客户投诉', time: '2', unit: '小时', color: 'var(--red)', bg: 'var(--red-bg)' },
      { type: '🔧 设备报修', time: '4', unit: '小时', color: 'var(--orange)', bg: 'var(--orange-bg)' },
      { type: '📦 送物服务', time: '30', unit: '分钟', color: 'var(--blue)', bg: 'var(--blue-bg)' },
      { type: '📄 发票需求', time: '24', unit: '小时', color: 'var(--purple)', bg: 'var(--purple-bg)' },
      { type: '⭐ 点评表扬', time: '48', unit: '小时', color: 'var(--green)', bg: 'var(--green-bg)' }
    ];

    slaTypes.forEach(function(s) {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:' + s.bg + ';border-radius:8px;border:1px solid ' + s.color + ';">' +
        '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">' + s.type.split(' ')[0] + '</span><span style="font-weight:600;font-size:13px;color:' + s.color + ';">' + s.type.split(' ')[1] + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<input type="number" value="' + s.time + '" min="1" max="999" style="width:60px;padding:6px 8px;font-size:13px;font-weight:700;text-align:center;border:1px solid ' + s.color + ';border-radius:6px;background:white;color:' + s.color + ';">' +
        '<span style="font-size:12px;color:' + s.color + ';font-weight:600;">' + s.unit + '</span>' +
        '<button onclick="showToast(\'' + s.type.split(' ')[1] + ' SLA已保存\',\'success\')" style="padding:4px 10px;background:' + s.color + ';color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">保存</button></div></div>';
    });

    html += '</div>' +
      '<div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">🚨 超时升级规则</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--text);">' +
      '<div>· <strong>第1次超时</strong>：自动发送站内提醒通知处理人</div>' +
      '<div>· <strong>第2次超时</strong>（SLA×1.5）：推送微信/短信给处理人+直属上级</div>' +
      '<div>· <strong>第3次超时</strong>（SLA×2）：工单标红升级，自动派发给部门负责人</div></div></div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-wo-sla\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">取消</button>' +
      '<button onclick="showToast(\'✅ SLA规则配置已保存！\',\'success\');document.getElementById(\'modal-wo-sla\').remove()" style="padding:10px 24px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">💾 保存全部配置</button></div></div></div>';
    var existing = document.getElementById('modal-wo-sla');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ========== 改进4：openWorkorderStatsDashboard - 工单统计看板弹窗 ==========
  // 理由：工单页面有"工单统计"按钮调用此函数，但函数从未定义
  // 改进：打开工单统计看板弹窗，显示各类型工单的数量、完成率、平均处理时长等统计
  window.openWorkorderStatsDashboard = function() {
    var html = '<div class="modal-overlay" id="modal-wo-stats" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-wo-stats\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:760px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">📊 工单统计看板</div><span style="padding:3px 10px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:12px;font-size:11px;color:var(--blue);font-weight:600;">本月统计</span></div>' +
      '<button onclick="document.getElementById(\'modal-wo-stats\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:16px 20px;">' +

      // 顶部汇总
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">' +
      '<div style="padding:16px;background:var(--blue-bg);border-radius:10px;text-align:center;"><div style="font-size:26px;font-weight:700;color:var(--blue);">48</div><div style="font-size:11px;color:var(--blue);margin-top:2px;">本月工单总数</div></div>' +
      '<div style="padding:16px;background:var(--green-bg);border-radius:10px;text-align:center;"><div style="font-size:26px;font-weight:700;color:var(--green);">35</div><div style="font-size:11px;color:var(--green);margin-top:2px;">已完成</div></div>' +
      '<div style="padding:16px;background:var(--orange-bg);border-radius:10px;text-align:center;"><div style="font-size:26px;font-weight:700;color:var(--orange);">8</div><div style="font-size:11px;color:var(--orange);margin-top:2px;">处理中</div></div>' +
      '<div style="padding:16px;background:var(--red-bg);border-radius:10px;text-align:center;"><div style="font-size:26px;font-weight:700;color:var(--red);">5</div><div style="font-size:11px;color:var(--red);margin-top:2px;">超时未处理</div></div></div>' +

      // 类型分布
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">📈 工单类型分布</div>' +
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">' +
      '<div style="padding:12px 8px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--red);">12</div><div style="font-size:10px;color:var(--red);margin-top:2px;">🔴投诉</div></div>' +
      '<div style="padding:12px 8px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--blue);">18</div><div style="font-size:10px;color:var(--blue);margin-top:2px;">📦送物</div></div>' +
      '<div style="padding:12px 8px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--orange);">8</div><div style="font-size:10px;color:var(--orange);margin-top:2px;">🔧报修</div></div>' +
      '<div style="padding:12px 8px;background:var(--purple-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--purple);">6</div><div style="font-size:10px;color:var(--purple);margin-top:2px;">📄发票</div></div>' +
      '<div style="padding:12px 8px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--green);">4</div><div style="font-size:10px;color:var(--green);margin-top:2px;">⭐表扬</div></div></div></div>' +

      // 绩效排名
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">🏆 员工处理绩效 TOP5</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">' +
      '<table class="table" style="font-size:12px;"><thead><tr><th>排名</th><th>员工</th><th>完成数</th><th>平均耗时</th><th>满意度</th></tr></thead>' +
      '<tbody>' +
      '<tr><td><span style="font-weight:700;color:var(--gold);">🥇</span></td><td style="font-weight:600;">赵飞</td><td>15</td><td style="color:var(--green);font-weight:600;">1.2h</td><td><span style="color:var(--green);">⭐ 4.9</span></td></tr>' +
      '<tr><td><span style="font-weight:700;color:var(--silver);">🥈</span></td><td style="font-weight:600;">周敏</td><td>12</td><td style="color:var(--green);font-weight:600;">1.5h</td><td><span style="color:var(--green);">⭐ 4.8</span></td></tr>' +
      '<tr><td><span style="font-weight:700;color:var(--bronze);">🥉</span></td><td style="font-weight:600;">王工</td><td>8</td><td style="color:var(--blue);font-weight:600;">2.1h</td><td><span style="color:var(--blue);">⭐ 4.7</span></td></tr>' +
      '<tr><td><span style="color:var(--text-muted);">4</span></td><td>吴倩</td><td>6</td><td style="color:var(--blue);font-weight:600;">2.8h</td><td><span style="color:var(--blue);">⭐ 4.6</span></td></tr>' +
      '<tr><td><span style="color:var(--text-muted);">5</span></td><td>郑强</td><td>5</td><td style="color:var(--orange);font-weight:600;">3.5h</td><td><span style="color:var(--orange);">⭐ 4.5</span></td></tr></tbody></table></div></div>' +

      // 趋势
      '<div>' +
      '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;">📉 近7天工单趋势</div>' +
      '<div style="display:flex;align-items:flex-end;gap:8px;height:80px;">' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;" title="03-24: 6个" onclick="showToast(\'03-24：6个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);">24</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;height:70%;" onclick="showToast(\'03-25：5个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);">25</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--orange);border-radius:4px 4px 0 0;height:100%;" onclick="showToast(\'03-26：8个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);font-weight:700;">26</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;height:60%;" onclick="showToast(\'03-27：5个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);">27</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;height:50%;" onclick="showToast(\'03-28：4个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);">28</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--red);border-radius:4px 4px 0 0;height:90%;" onclick="showToast(\'03-29：7个工单\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--text-muted);font-weight:700;">29</span></div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;height:40%;" onclick="showToast(\'03-30：3个工单（今日）\',\'info\')" style="cursor:pointer;"></div><span style="font-size:10px;color:var(--blue);font-weight:700;">30📌</span></div></div></div></div>' +

      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-wo-stats\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button>' +
      '<button onclick="showToast(\'工单统计数据已导出\',\'success\')" style="padding:10px 24px;background:var(--blue);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">📤 导出报表</button></div></div></div>';
    var existing = document.getElementById('modal-wo-stats');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ========== 改进5：openDeviceBatchModal - 设备批量操作弹窗 ==========
  // 理由：设备列表页顶部"批量操作"按钮和工单列表底部的批量勾选触发此函数，但函数从未定义
  // 改进：打开设备批量操作弹窗，支持批量开锁/重启/同步/电池检测等操作
  window.openDeviceBatchModal = function() {
    var checkedDevices = [];
    var checkboxes = document.querySelectorAll('.device-row-check:checked');
    checkboxes.forEach(function(cb) {
      checkedDevices.push(cb.getAttribute('data-device-id') || cb.getAttribute('data-uuid'));
    });

    var deviceCount = checkedDevices.length || 0;
    var html = '<div class="modal-overlay" id="modal-device-batch" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-device-batch\').remove()">' +
      '<div style="background:var(--card-bg);border-radius:12px;width:90%;max-width:520px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--header-bg);">' +
      '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:15px;font-weight:700;">📋 设备批量操作</div><span style="padding:3px 10px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:12px;font-size:11px;color:var(--blue);font-weight:600;">已选 ' + deviceCount + ' 台设备</span></div>' +
      '<button onclick="document.getElementById(\'modal-device-batch\').remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px;">' +
      '<div style="margin-bottom:16px;padding:12px;background:var(--orange-bg);border-radius:8px;font-size:12px;color:var(--orange);">' +
      '⚠️ 批量操作将同时对选中的 ' + deviceCount + ' 台设备执行，请谨慎操作</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
      '<button onclick="executeDeviceBatchAction(\'unlock\')" style="padding:16px;border:1px solid var(--green);border-radius:10px;background:var(--green-bg);cursor:pointer;text-align:center;transition:all 0.2s;">' +
      '<div style="font-size:24px;margin-bottom:6px;">🔓</div><div style="font-size:13px;font-weight:700;color:var(--green);">批量开锁</div><div style="font-size:11px;color:var(--green);margin-top:2px;">下发开锁指令</div></button>' +
      '<button onclick="executeDeviceBatchAction(\'restart\')" style="padding:16px;border:1px solid var(--orange);border-radius:10px;background:var(--orange-bg);cursor:pointer;text-align:center;transition:all 0.2s;">' +
      '<div style="font-size:24px;margin-bottom:6px;">🔄</div><div style="font-size:13px;font-weight:700;color:var(--orange);">批量重启</div><div style="font-size:11px;color:var(--orange);margin-top:2px;">重启设备</div></button>' +
      '<button onclick="executeDeviceBatchAction(\'sync\')" style="padding:16px;border:1px solid var(--blue);border-radius:10px;background:var(--blue-bg);cursor:pointer;text-align:center;transition:all 0.2s;">' +
      '<div style="font-size:24px;margin-bottom:6px;">📡</div><div style="font-size:13px;font-weight:700;color:var(--blue);">状态同步</div><div style="font-size:11px;color:var(--blue);margin-top:2px;">拉取最新状态</div></button>' +
      '<button onclick="executeDeviceBatchAction(\'battery\')" style="padding:16px;border:1px solid var(--purple);border-radius:10px;background:var(--purple-bg);cursor:pointer;text-align:center;transition:all 0.2s;">' +
      '<div style="font-size:24px;margin-bottom:6px;">🔋</div><div style="font-size:13px;font-weight:700;color:var(--purple);">电池检测</div><div style="font-size:11px;color:var(--purple);margin-top:2px;">查询电量</div></button></div>' +

      '<div style="padding:10px 14px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--text-muted);">' +
      '<div style="font-weight:600;margin-bottom:6px;">💡 操作说明</div>' +
      '<div>· 批量开锁：向选中设备下发开锁指令，适用于紧急开门场景</div>' +
      '<div>· 批量重启：重启选中设备，可能导致短暂离线（1-2分钟）</div>' +
      '<div>· 状态同步：强制拉取设备最新状态（电量、信号、门锁状态）</div>' +
      '<div>· 电池检测：查询设备当前电量，识别低电量设备</div></div></div>' +
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-device-batch\').remove()" style="padding:10px 24px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">关闭</button></div></div></div>';

    var existing = document.getElementById('modal-device-batch');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.executeDeviceBatchAction = function(action) {
    var actionNames = { unlock: '批量开锁', restart: '批量重启', sync: '状态同步', battery: '电池检测' };
    var actionColors = { unlock: 'var(--green)', restart: 'var(--orange)', sync: 'var(--blue)', battery: 'var(--purple)' };
    document.getElementById('modal-device-batch').remove();
    showToast('✅ ' + actionNames[action] + '指令已下发，设备处理中...', actionColors[action]);
  };

  console.log('[iter45] 5个功能性断裂函数补全完成：openWorkorderTransferModal / openWorkorderAutoRuleModal / openWorkorderSLAModal / openWorkorderStatsDashboard / openDeviceBatchModal');
})();
