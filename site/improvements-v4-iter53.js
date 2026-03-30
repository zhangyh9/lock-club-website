// ============================================================
// 【物联后台 v4 第53轮】5个功能性改进
// ============================================================
// 改进1: 修复日报表格 2026-03-25 行 HTML 结构错误（缺少 </span> 闭合标签）
// 改进2: 交接班完整交接流程弹窗函数缺失（openFullShiftHandoverModal）
// 改进3: 交接班导出CSV函数已存在但需增强（添加待退房/待清洁等完整数据）
// 改进4: 发票新增弹窗日期选择器默认值修正（显示当前日期）
// 改进5: 会员管理列表Tab切换功能断裂（点击Tab无响应）
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：修复日报表格 HTML 结构错误 ----------
  // 问题：2026-03-25 行入住率为 <span class="tbadge green">62.5%</td> 缺少 </span>
  // 修复：在 DOMContentLoaded 后自动修复，并增强导出逻辑容错
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var tbody = document.getElementById('rpt-daily-body');
      if (!tbody) return;
      var fixed = false;
      tbody.querySelectorAll('tr').forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        if (cells.length < 9) return;
        // Check cell 4 (occupancy rate) for missing </span>
        var occCell = cells[3]; // index 3 = 第4列 = 入住率
        if (occCell && occCell.innerHTML.indexOf('</span></td>') === -1 && occCell.innerHTML.indexOf('62.5%') !== -1) {
          occCell.innerHTML = '<span class="tbadge green">62.5%</span>';
          fixed = true;
        }
        // Check cell 5 (revenue) for missing </span>
        var revCell = cells[4];
        if (revCell && revCell.innerHTML.indexOf('</span></td>') === -1) {
          var m = revCell.innerHTML.match(/¥[\d,]+/);
          if (m) {
            revCell.innerHTML = '<span style="font-weight:600;color:var(--blue);">' + m[0] + '</span>';
            fixed = true;
          }
        }
      });
      if (fixed) console.log('[v4-iter53] 日报表格 HTML 修复完成');
    }, 600);
  });

  // ---------- 改进2：交接班完整交接流程弹窗函数 ----------
  window.openFullShiftHandoverModal = function() {
    var existing = document.getElementById('modal-full-handover');
    if (existing) existing.remove();
    var shiftLabels = {morning:'早班 07:00-15:00',afternoon:'中班 15:00-23:00',night:'晚班 23:00-07:00'};
    var shift = document.getElementById('handover-shift-select') ? document.getElementById('handover-shift-select').value : 'morning';
    var date = document.getElementById('handover-date') ? document.getElementById('handover-date').value : new Date().toISOString().slice(0,10);
    var html = '<div class="modal-overlay" id="modal-full-handover" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-full-handover\').remove()">' +
      '<div class="modal" style="width:720px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;background:white;border-radius:12px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:28px;">📨</div><div><div style="font-size:15px;font-weight:700;">完整交接流程</div><div style="font-size:11px;color:var(--text-muted);">' + date + ' ' + (shiftLabels[shift]||shiftLabels.morning) + '</div></div>' +
      '<button onclick="document.getElementById(\'modal-full-handover\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
      '<div style="padding:14px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--green);margin-bottom:4px;">本班营收</div><div style="font-size:22px;font-weight:700;color:var(--green);" id="ho-full-revenue">¥1,420</div></div>' +
      '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--blue);margin-bottom:4px;">入住/退房</div><div style="font-size:22px;font-weight:700;color:var(--blue);">5间/3间</div></div>' +
      '<div style="padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--red);margin-bottom:4px;">待退房</div><div style="font-size:22px;font-weight:700;color:var(--red);">2间</div></div></div>' +
      '<div style="margin-bottom:16px;"><div style="font-weight:600;font-size:13px;margin-bottom:8px;">🚨 本班紧急事项</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--red-bg);border:1px solid var(--red);border-radius:6px;font-size:12px;"><span style="font-size:16px;">🔴</span><span>301设备离线告警（已持续2小时）</span><button onclick="navigateToPage(\'page-device\')" style="margin-left:auto;background:var(--red);color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">处理</button></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:6px;font-size:12px;"><span style="font-size:16px;">🟠</span><span>205室空调故障报修（待接单）</span><button onclick="navigateToPage(\'page-workorder\');document.getElementById(\'wo-type-filter\').value=\'repair\';applyWorkorderSearch();" style="margin-left:auto;background:var(--orange);color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">处理</button></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--yellow-bg,#fff7e6);border:1px solid #faad14;border-radius:6px;font-size:12px;"><span style="font-size:16px;">🟡</span><span>302/305退房待清洁</span><button onclick="navigateToPage(\'page-housekeeping\')" style="margin-left:auto;background:#faad14;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">处理</button></div></div></div>' +
      '<div style="margin-bottom:16px;"><div style="font-weight:600;font-size:13px;margin-bottom:8px;">📋 待下班继续事项</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:12px;"><span>📝</span><span>VIP客户明日10:00入住，房间已预分配301</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">已确认</span></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:12px;"><span>📝</span><span>工程队明早09:00维修电梯，已通知安保</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">已确认</span></div></div></div>' +
      '<div><div style="font-weight:600;font-size:13px;margin-bottom:8px;">📊 营收明细</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;">' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-light);">房费收入</span><span style="font-weight:600;color:var(--green);">¥1,180</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-light);">加床/加物</span><span style="font-weight:600;">¥80</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-light);">迷你吧消费</span><span style="font-weight:600;">¥60</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-light);">押金退还</span><span style="font-weight:600;color:var(--orange);">-¥300</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:700;"><span>合计</span><span style="font-size:15px;color:var(--green);">¥1,020</span></div></div></div></div>' +
      '<div style="padding:16px 24px 18px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-full-handover\').remove()">取消</button>' +
      '<button class="modal-btn" onclick="document.getElementById(\'modal-full-handover\').remove();showToast(\'✅ 交接内容已确认，将通知接班人\',\'success\');" style="background:var(--green);color:white;border:none;">✅ 确认交接</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ---------- 改进3：交接班导出CSV增强 ----------
  // 增强 exportHandoverReportCSV，添加待退房/待清洁/告警明细等完整数据
  var originalExportHandoverCSV;
  try { originalExportHandoverCSV = window.exportHandoverReportCSV; } catch(e) {}
  window.exportHandoverReportCSV = function() {
    var shift = document.getElementById('handover-shift-select') ? document.getElementById('handover-shift-select').value : 'morning';
    var date = document.getElementById('handover-date') ? document.getElementById('handover-date').value : new Date().toISOString().slice(0,10);
    var shiftLabels = {morning:'早班',afternoon:'中班',night:'晚班'};
    var shiftTime = {morning:'07:00-15:00',afternoon:'15:00-23:00',night:'23:00-07:00'};
    // Collect all handover stats from the page
    var getText = function(id) {
      var el = document.getElementById(id);
      return el ? el.textContent.replace(/[^\d\.\¥\,\-\+]/g,'').trim() : '0';
    };
    var csv = '\uFEFF领锁物联 - 班次交接报表\n';
    csv += '交接日期,' + date + '\n';
    csv += '班次,' + (shiftLabels[shift]||'早班') + ' (' + (shiftTime[shift]||'') + ')\n';
    csv += '生成时间,' + new Date().toLocaleString('zh-CN') + '\n';
    csv += '\n';
    csv += '【营收统计】\n';
    csv += '项目,数值\n';
    csv += '本班营收,' + getText('ho-revenue') + '\n';
    csv += '入住/退房间数,' + getText('ho-checkin') + '\n';
    csv += '结算笔数,' + getText('ho-settlement') + '\n';
    csv += '\n';
    csv += '【紧急事项】\n';
    csv += '类型,详情,状态\n';
    csv += '设备离线,301设备离线告警,进行中\n';
    csv += '报修工单,205室空调故障,待接单\n';
    csv += '清洁任务,302/305退房待清洁,待处理\n';
    csv += '\n';
    csv += '【待下班继续事项】\n';
    csv += '事项,时间,状态\n';
    csv += 'VIP客户入住准备(301),明日10:00,已确认\n';
    csv += '电梯维修协调,明早09:00,已确认\n';
    csv += '\n';
    csv += '【交接签名】\n';
    csv += '交班人,赵飞\n';
    csv += '接班人,周敏\n';
    csv += '交班确认时间,待填写\n';
    csv += '系统版本,领锁物联后台 v4.0\n';
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '完整交接报表_' + date + '_' + (shiftLabels[shift]||'早班') + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('📊 完整交接报表已导出（CSV）', 'success');
  };

  // ---------- 改进4：发票新增弹窗日期选择器默认值修正 ----------
  // 问题：发票新增弹窗中默认入住日期/离店日期为空或旧日期
  // 修复：弹窗打开时自动设置为当天+明天
  var originalOpenInvoiceCreateModal;
  try { originalOpenInvoiceCreateModal = window.openInvoiceCreateModal; } catch(e) {}
  window.openInvoiceCreateModal = function() {
    if (originalOpenInvoiceCreateModal) {
      try { originalOpenInvoiceCreateModal.apply(this, arguments); } catch(e) {}
    }
    // Set default dates if fields exist
    setTimeout(function() {
      var today = new Date();
      var tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      var fmt = function(d) { return d.toISOString().slice(0,10); };
      var checkinDate = document.getElementById('inv-checkin-date');
      var checkoutDate = document.getElementById('inv-checkout-date');
      if (checkinDate && !checkinDate.value) checkinDate.value = fmt(today);
      if (checkoutDate && !checkoutDate.value) checkoutDate.value = fmt(tomorrow);
    }, 150);
  };

  // Also fix invoice create modal - ensure guest info fields exist
  var originalSubmitInvoiceCreate;
  try { originalSubmitInvoiceCreate = window.submitInvoiceCreate; } catch(e) {}
  window.submitInvoiceCreate = function() {
    // If the existing function exists, enhance it
    if (originalSubmitInvoiceCreate) {
      try { originalSubmitInvoiceCreate.apply(this, arguments); } catch(e) {}
      return;
    }
    // Fallback: basic validation and submission
    var modal = document.getElementById('modal-invoice-create');
    if (!modal) {
      showToast('发票创建弹窗未找到', 'error');
      return;
    }
    var nameEl = modal.querySelector('#inv-guest-name, input[id*="name"]');
    var phoneEl = modal.querySelector('#inv-guest-phone, input[id*="phone"]');
    var amountEl = modal.querySelector('#inv-amount, input[id*="amount"]');
    var typeEl = modal.querySelector('#inv-type, select[id*="type"]');
    if (!nameEl || !amountEl) {
      showToast('请填写完整发票信息', 'error');
      return;
    }
    var nameVal = nameEl.value.trim();
    var amountVal = amountEl.value.trim();
    if (!nameVal || !amountVal) {
      showToast('请填写姓名和发票金额', 'error');
      return;
    }
    if (isNaN(parseFloat(amountVal)) || parseFloat(amountVal) <= 0) {
      showToast('发票金额必须为正数', 'error');
      return;
    }
    var typeText = typeEl ? typeEl.options[typeEl.selectedIndex].text : '普通发票';
    modal.remove();
    showToast('🧾 发票申请已提交：' + nameVal + '，金额 ¥' + amountVal, 'success');
    if (window.renderInvoiceTable) renderInvoiceTable();
  };

  // ---------- 改进5：会员管理列表Tab切换功能 ----------
  // 问题：会员管理页面有Tab（全部/普通/银卡/金卡/钻石），点击无响应
  // 修复：实现 switchMemberTab 函数，切换时筛选并高亮Tab
  window.switchMemberTab = function(tab, el) {
    var validTabs = ['all','normal','silver','gold','diamond'];
    if (validTabs.indexOf(tab) === -1) tab = 'all';
    // Update tab UI
    if (el) {
      var tabContainer = el.parentElement;
      if (tabContainer) {
        tabContainer.querySelectorAll('.card-tab').forEach(function(t) {
          t.classList.remove('active');
          t.style.background = 'var(--bg)';
          t.style.color = 'var(--text-light)';
          t.style.borderColor = 'var(--border)';
        });
        el.classList.add('active');
        el.style.background = 'var(--blue-bg)';
        el.style.color = 'var(--blue)';
        el.style.borderColor = 'var(--blue)';
      }
    }
    // Filter member table rows
    var tbody = document.getElementById('member-table-body');
    if (!tbody) return;
    var rows = tbody.querySelectorAll('tr[data-level]');
    var visibleCount = 0;
    rows.forEach(function(row) {
      var level = row.getAttribute('data-level') || 'normal';
      var show = (tab === 'all' || level === tab);
      row.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    // Show empty state if no results
    var existingEmpty = tbody.parentElement.querySelector('.member-empty-state');
    if (visibleCount === 0) {
      if (!existingEmpty) {
        var emptyTr = document.createElement('tr');
        emptyTr.className = 'member-empty-state';
        emptyTr.innerHTML = '<td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">该等级暂无会员</td>';
        tbody.appendChild(emptyTr);
      }
    } else if (existingEmpty) {
      existingEmpty.remove();
    }
    // Update count display
    var countEl = document.getElementById('member-filter-count');
    if (countEl) countEl.textContent = '共 ' + visibleCount + ' 条';
    showToast('已筛选：' + (tab==='all'?'全部':tab) + '会员 ' + visibleCount + ' 人', 'info');
  };

  // Ensure member table rows have data-level attribute for filtering
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var tbody = document.getElementById('member-table-body');
      if (!tbody) return;
      // Add data-level to existing rows if missing
      tbody.querySelectorAll('tr').forEach(function(row) {
        if (!row.hasAttribute('data-level')) {
          // Infer level from the row content (gold/silver/etc badge text)
          var rowText = row.textContent || '';
          var level = 'normal';
          if (rowText.indexOf('钻石') !== -1) level = 'diamond';
          else if (rowText.indexOf('金卡') !== -1) level = 'gold';
          else if (rowText.indexOf('银卡') !== -1) level = 'silver';
          row.setAttribute('data-level', level);
        }
      });
    }, 800);
  });

  // 初始化
  function initEnhancements() {
    // Ensure handover shift selector triggers CSV export
    setTimeout(function() {
      var shiftSel = document.getElementById('handover-shift-select');
      if (shiftSel && !shiftSel.getAttribute('data-bound')) {
        shiftSel.setAttribute('data-bound', 'true');
        shiftSel.addEventListener('change', function() {
          // Update display when shift changes
          var revEl = document.getElementById('ho-revenue');
          if (revEl) {
            var shiftRevs = {'morning':'¥1,420','afternoon':'¥980','night':'¥1,830'};
            revEl.textContent = shiftRevs[this.value] || '¥1,420';
          }
        });
      }
    }, 600);
  }

  document.addEventListener('DOMContentLoaded', initEnhancements);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initEnhancements, 300);
  }

})();
