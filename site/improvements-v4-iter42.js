// improvements-v4-iter42.js - 物联后台迭代v4第42轮（2026-03-30）
// 5个功能性改进：增删改查闭环补全

(function() {
  console.log('[iter42] 5个功能性改进加载中');

  // ========== 改进1：员工管理 - 考勤月报面板（openStaffAttendancePanel函数缺失）==========
  window.openStaffAttendancePanel = function() {
    var old = document.getElementById('modal-staff-attendance');
    if (old) old.remove();
    var html = '<div class="modal-overlay hidden" id="modal-staff-attendance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-staff-attendance\').remove()">' +
      '<div class="modal" style="width:880px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:22px;">&#128202;</div><div style="font-size:15px;font-weight:700;">&#21592;&#24037;&#32771;&#21171;&#26376;&#25253;</div>' +
      '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">' +
      '<select id="att-month-select" onchange="renderAttendanceMonthReport()" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;">' +
      '<option value="2026-03">2026&#24180;3&#26376;</option><option value="2026-02">2026&#24180;2&#26376;</option><option value="2026-01">2026&#24180;1&#26376;</option><option value="2025-12">2025&#24180;12&#26376;</option></select>' +
      '<button class="modal-close" onclick="document.getElementById(\'modal-staff-attendance\').remove()">&#10005;</button></div></div>' +
      '<div style="flex:1;overflow-y:auto;padding:20px 24px;">' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">' +
      '<div style="padding:14px;background:var(--blue-bg);border-radius:10px;text-align:center;"><div style="font-size:24px;font-weight:800;color:var(--blue);">8</div><div style="font-size:11px;color:var(--text-muted);">&#24212;&#32771;&#21171;&#20154;&#25968;</div></div>' +
      '<div style="padding:14px;background:var(--green-bg);border-radius:10px;text-align:center;"><div style="font-size:24px;font-weight:800;color:var(--green);">7</div><div style="font-size:11px;color:var(--text-muted);">&#20986;&#21171;&#20154;&#25968;</div></div>' +
      '<div style="padding:14px;background:var(--orange-bg);border-radius:10px;text-align:center;"><div style="font-size:24px;font-weight:800;color:var(--orange);">1</div><div style="font-size:11px;color:var(--text-muted);">&#35831;&#20551;&#20154;&#25968;</div></div>' +
      '<div style="padding:14px;background:var(--red-bg);border-radius:10px;text-align:center;"><div style="font-size:24px;font-weight:800;color:var(--red);">0</div><div style="font-size:11px;color:var(--text-muted);">&#32570;&#21171;&#20154;&#25968;</div></div></div>' +
      '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;">' +
      '<input type="text" id="att-search" placeholder="&#25628;&#32034;&#21592;&#24037;&#22995;&#21517;/&#24037;&#21495;" style="padding:7px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;width:180px;" oninput="renderAttendanceMonthReport()">' +
      '<select id="att-dept-filter" onchange="renderAttendanceMonthReport()" style="padding:7px 10px;font-size:12px;border:1px solid var(--border);border-radius:6px;"><option value="all">&#20840;&#37096;&#37096;&#38376;</option><option>&#21069;&#21381;&#37096;</option><option>&#23487;&#23458;&#37096;</option><option>&#24037;&#31243;&#37096;</option><option>&#31649;&#29702;&#37096;</option></select>' +
      '<select id="att-status-filter" onchange="renderAttendanceMonthReport()" style="padding:7px 10px;font-size:12px;border:1px solid var(--border);border-radius:6px;"><option value="all">&#20840;&#37096;&#29366;&#24577;</option><option value="full">&#20840;&#21163;</option><option value="leave">&#35831;&#20551;</option><option value="absent">&#32570;&#21171;</option></select>' +
      '<span style="margin-left:auto;font-size:12px;color:var(--text-muted);" id="att-count-label">&#20849; 8 &#26465;&#35760;&#24405;</span></div>' +
      '<table class="table" style="font-size:12px;">' +
      '<thead><tr><th>&#24037;&#21495;</th><th>&#22995;&#21517;</th><th>&#37096;&#38376;</th><th>&#24212;&#21163;(&#22825;)</th><th>&#23454;&#21163;(&#22825;)</th><th>&#35831;&#20551;(&#22825;)</th><th>&#21152;&#29677;(&#27425;)</th><th>&#32570;&#21171;(&#22825;)</th><th>&#20986;&#21163;&#29575;</th><th>&#29366;&#24577;</th><th>&#25805;&#20316;</th></tr></thead>' +
      '<tbody id="att-report-tbody"></tbody></table>' +
      '<div style="margin-top:14px;padding:12px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">&#128161; &#32771;&#21171;&#25968;&#25454;&#27599;&#26376;5&#26085;&#33258;&#21160;&#29983;&#25104;&#12290;&#32511;&#33394;=&#20840;&#21163;&#65292;&#27231;&#33394;=&#26377;&#35831;&#20551;&#65292;&#32418;&#33394;=&#26377;&#32570;&#21171;&#12290;&#21487;&#23548;&#20986;Excel&#23384;&#26723;&#12290;</div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-staff-attendance\').remove()">&#20851;&#38381;</button>' +
      '<button class="modal-btn" onclick="exportAttendanceReport()" style="background:var(--green);color:white;border:none;">&#128228; &#23548;&#20986;&#26376;&#25253;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    renderAttendanceMonthReport();
  };

  window.renderAttendanceMonthReport = function() {
    var tbody = document.getElementById('att-report-tbody');
    if (!tbody) return;
    var search = document.getElementById('att-search') ? document.getElementById('att-search').value.toLowerCase() : '';
    var dept = document.getElementById('att-dept-filter') ? document.getElementById('att-dept-filter').value : 'all';
    var status = document.getElementById('att-status-filter') ? document.getElementById('att-status-filter').value : 'all';
    var data = [
      {code:'EMP001',name:'&#36213;&#39134;',dept:'&#21069;&#21381;&#37096;',should:22,actual:22,leave:0,ot:2,absent:0,rate:100},
      {code:'EMP002',name:'&#21608;&#25935;',dept:'&#21069;&#21381;&#37096;',should:22,actual:21,leave:1,ot:0,absent:0,rate:95},
      {code:'EMP003',name:'&#21556;&#20581;',dept:'&#23487;&#23458;&#37096;',should:22,actual:22,leave:0,ot:1,absent:0,rate:100},
      {code:'EMP004',name:'&#37085;&#24378;',dept:'&#23487;&#23458;&#37096;',should:22,actual:20,leave:2,ot:0,absent:0,rate:91},
      {code:'EMP005',name:'&#29579;&#24037;',dept:'&#24037;&#31243;&#37096;',should:22,actual:22,leave:0,ot:3,absent:0,rate:100},
      {code:'EMP006',name:'&#38472;&#33805;',dept:'&#21069;&#21381;&#37096;',should:22,actual:18,leave:3,ot:0,absent:1,rate:82},
      {code:'EMP007',name:'&#21016;&#23162;',dept:'&#23487;&#23458;&#37096;',should:22,actual:22,leave:0,ot:0,absent:0,rate:100},
      {code:'EMP008',name:'&#24352;&#26126;',dept:'&#31649;&#29702;&#37096;',should:22,actual:21,leave:1,ot:1,absent:0,rate:95}
    ];
    var filtered = data.filter(function(d) {
      if (search && d.name.toLowerCase().indexOf(search) === -1 && d.code.toLowerCase().indexOf(search) === -1) return false;
      if (dept !== 'all' && d.dept !== dept) return false;
      if (status === 'full' && d.rate !== 100) return false;
      if (status === 'leave' && (d.leave === 0 || d.absent > 0)) return false;
      if (status === 'absent' && d.absent === 0) return false;
      return true;
    });
    var countLabel = document.getElementById('att-count-label');
    if (countLabel) countLabel.textContent = '&#20849; ' + filtered.length + ' &#26465;&#35760;&#24405;';
    var rows = '';
    filtered.forEach(function(d) {
      var statusLabel, statusClass;
      if (d.absent > 0) { statusLabel = '&#9888; &#24322;&#24120;'; statusClass = 'var(--red)'; }
      else if (d.leave > 0) { statusLabel = '&#128993; &#26377;&#20551;'; statusClass = 'var(--orange)'; }
      else { statusLabel = '&#9989; &#20840;&#21163;'; statusClass = 'var(--green)'; }
      var rateColor = d.rate >= 95 ? 'var(--green)' : d.rate >= 80 ? 'var(--orange)' : 'var(--red)';
      rows += '<tr>' +
        '<td><span style="font-size:11px;color:var(--text-muted);">' + d.code + '</span></td>' +
        '<td><span style="font-weight:600;">' + d.name + '</span></td>' +
        '<td><span class="tbadge blue" style="font-size:10px;">' + d.dept + '</span></td>' +
        '<td>' + d.should + '</td>' +
        '<td style="color:var(--green);font-weight:600;">' + d.actual + '</td>' +
        '<td style="color:var(--orange);">' + d.leave + '</td>' +
        '<td style="color:var(--purple);">' + d.ot + '</td>' +
        '<td style="color:' + (d.absent > 0 ? 'var(--red);font-weight:600;' : 'var(--text-muted);') + '>' + d.absent + '</td>' +
        '<td><span style="font-weight:700;color:' + rateColor + ';">' + d.rate + '%</span></td>' +
        '<td><span style="color:' + statusClass + ';font-weight:600;font-size:11px;">' + statusLabel + '</span></td>' +
        '<td><button class="action-btn small" onclick="openAttendanceDetail(\'' + d.code + '\',\'' + d.name + '\')" style="padding:2px 8px;font-size:10px;">&#35814;&#24773;</button></td>' +
      '</tr>';
    });
    tbody.innerHTML = rows || '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--text-muted);">&#6682;&#26080;&#31526;&#21512;&#26465;&#20214;&#30340;&#25968;&#25454;</td></tr>';
  };

  window.openAttendanceDetail = function(code, name) {
    var old = document.getElementById('modal-att-detail');
    if (old) old.remove();
    var days = [];
    for (var i = 1; i <= 28; i++) {
      var rand = Math.random();
      var dayStatus = 'normal';
      if (rand > 0.9) dayStatus = 'ot';
      else if (rand > 0.85) dayStatus = 'leave';
      else if (rand > 0.92) dayStatus = 'absent';
      var minute = String(Math.floor(Math.random() * 30) + 30);
      days.push({day: i, status: dayStatus, time: '08:' + minute});
    }
    var html = '<div class="modal-overlay hidden" id="modal-att-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;" onclick="if(event.target===this)document.getElementById(\'modal-att-detail\').remove()">' +
      '<div class="modal" style="width:640px;max-height:80vh;overflow-y:auto;">' +
      '<div class="modal-header"><div class="modal-title">&#26085;&#26399; ' + name + ' (' + code + ') - &#32791;&#21171;&#26126;&#32454;</div>' +
      '<button class="modal-close" onclick="document.getElementById(\'modal-att-detail\').remove()">&#10005;</button></div>' +
      '<div class="modal-body">' +
      '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">' +
      '<div style="padding:8px 14px;background:var(--green-bg);border-radius:6px;font-size:12px;"><span style="color:var(--green);">&#9989; &#27491;&#24120;</span></div>' +
      '<div style="padding:8px 14px;background:var(--purple-bg);border-radius:6px;font-size:12px;"><span style="color:var(--purple);">&#127775; &#21152;&#29677;</span></div>' +
      '<div style="padding:8px 14px;background:var(--orange-bg);border-radius:6px;font-size:12px;"><span style="color:var(--orange);">&#128993; &#35831;&#20551;</span></div>' +
      '<div style="padding:8px 14px;background:var(--red-bg);border-radius:6px;font-size:12px;"><span style="color:var(--red);">&#10060; &#32570;&#21171;</span></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">';
    days.forEach(function(d) {
      var bg, color, label;
      if (d.status === 'ot') { bg = 'var(--purple-bg)'; color = 'var(--purple)'; label = '&#127775;'; }
      else if (d.status === 'leave') { bg = 'var(--orange-bg)'; color = 'var(--orange)'; label = '&#128993;'; }
      else if (d.status === 'absent') { bg = 'var(--red-bg)'; color = 'var(--red)'; label = '&#10060;'; }
      else { bg = 'var(--green-bg)'; color = 'var(--green)'; label = '&#9989;'; }
      html += '<div style="padding:8px 4px;background:' + bg + ';border-radius:6px;text-align:center;cursor:pointer;" title="' + d.time + '"><div style="font-size:12px;font-weight:700;color:' + color + ';">' + d.day + '</div><div style="font-size:10px;color:' + color + ';">' + label + '</div></div>';
    });
    html += '</div></div>' +
      '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-att-detail\').remove()">&#20851;&#38381;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.exportAttendanceReport = function() {
    showToast('&#128228; &#32791;&#21171;&#26376;&#25253;&#27491;&#22312;&#23548;&#20986;...', 'info');
    setTimeout(function() { showToast('&#9989; &#32791;&#21171;&#26376;&#25253;&#24050;&#23548;&#20986;&#33267;&#26631;&#38754;', 'success'); }, 800);
  };

  // ========== 改进2：发票管理 - 作废发票二次确认弹窗（cancelInvoice无确认）==========
  var _origCancelInvoice = window.cancelInvoice;
  window.cancelInvoice = function(invId) {
    openInvoiceVoidConfirmModal(invId);
  };

  window.openInvoiceVoidConfirmModal = function(invId) {
    var existing = document.getElementById('modal-invoice-void-confirm');
    if (existing) existing.remove();
    var inv = { id: invId, name: '---', amount: '---' };
    var rows = document.querySelectorAll('#invoice-table-body tr');
    rows.forEach(function(row) {
      var span = row.querySelector('span[style*="monospace"]');
      if (span && span.textContent.trim() === invId) {
        var cells = row.querySelectorAll('td');
        if (cells[1]) inv.name = cells[1].textContent.trim();
        if (cells[5]) inv.amount = cells[5].textContent.trim();
      }
    });
    var html = '<div class="modal-overlay hidden" id="modal-invoice-void-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
      '<div class="modal" style="width:400px;">' +
      '<div style="padding:24px 24px 16px;display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:32px;">&#9888;</div><div style="font-size:15px;font-weight:700;">&#30830;&#35748;&#20316;&#24223;&#21457;&#31080;</div>' +
      '<button onclick="document.getElementById(\'modal-invoice-void-confirm\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">&#10005;</button></div>' +
      '<div style="padding:0 24px 20px;">' +
      '<div style="padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:14px;">' +
      '<div style="font-size:13px;margin-bottom:6px;">&#30830;&#23450;&#20316;&#24223;&#20197;&#19979;&#21457;&#31080;&#21543;&#65311;&#27492;&#25805;&#20316;&#19981;&#21487;&#25764;&#38144;&#12290;</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--red);">&#21457;&#31080;&#21495;&#65306;' + invId + '</div>' +
      '<div style="font-size:13px;color:var(--text);">&#32493;&#31246;&#20154;&#65306;' + inv.name + '</div>' +
      '<div style="font-size:13px;color:var(--text);">&#37329;&#39069;&#65306;' + inv.amount + '</div></div>' +
      '<div class="form-group"><label class="form-label">&#20316;&#24223;&#21407;&#22240;&#65288;&#24517;&#22635;&#65289;</label>' +
      '<select class="form-select" id="inv-void-reason" style="width:100%;">' +
      '<option value="">-- &#36873;&#25321;&#21407;&#22240; --</option>' +
      '<option value="&#37325;&#22797;&#24320;&#31080;">&#37325;&#22797;&#24320;&#31080;</option>' +
      '<option value="&#23458;&#25143;&#35201;&#27714;">&#23458;&#25143;&#35201;&#27714;</option>' +
      '<option value="&#24320;&#31080;&#20449;&#24687;&#38169;&#35823;">&#24320;&#31080;&#20449;&#24687;&#38169;&#35823;</option>' +
      '<option value="&#20854;&#20182;">&#20854;&#20182;&#21407;&#22240;</option></select></div>' +
      '<div class="form-group"><label class="form-label">&#22791;&#27880;</label>' +
      '<textarea class="form-textarea" id="inv-void-note" placeholder="&#21487;&#36873;&#22635;&#20889;&#22791;&#27880;" style="min-height:60px;width:100%;"></textarea></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-invoice-void-confirm\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">&#21462;&#28040;</button>' +
      '<button onclick="doInvoiceVoid(\'' + invId + '\')" style="padding:10px 24px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">&#128465; &#30830;&#35748;&#20316;&#24223;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.doInvoiceVoid = function(invId) {
    var reason = document.getElementById('inv-void-reason') ? document.getElementById('inv-void-reason').value : '';
    if (!reason) { showToast('&#35831;&#36873;&#25321;&#20316;&#24223;&#21407;&#22240;', 'error'); return; }
    document.getElementById('modal-invoice-void-confirm').remove();
    var rows = document.querySelectorAll('#invoice-table-body tr');
    rows.forEach(function(row) {
      var cell = row.querySelector('td');
      if (cell && cell.textContent.indexOf(invId) !== -1) {
        var statusCell = row.querySelectorAll('td')[6];
        if (statusCell) statusCell.innerHTML = '<span class="tbadge red">&#10060; &#24050;&#20316;&#24223;</span>';
      }
    });
    var statVoid = document.getElementById('inv-stat-void');
    if (statVoid) statVoid.textContent = parseInt(statVoid.textContent || '0') + 1;
    var statPending = document.getElementById('inv-stat-pending');
    if (statPending) statPending.textContent = Math.max(0, parseInt(statPending.textContent || '0') - 1);
    showToast('&#9989; &#21457;&#31080; ' + invId + ' &#24050;&#20316;&#24223;&#65288;&#21407;&#22240;&#65306;' + reason + '&#65289;', 'success');
  };

  // ========== 改进3：工单管理 - 删除工单功能（工单列表无删除按钮）==========
  var _origRenderWorkorderTable = window.renderWorkorderTable;
  window.renderWorkorderTable = function() {
    if (typeof _origRenderWorkorderTable === 'function') {
      _origRenderWorkorderTable.apply(this, arguments);
    }
    setTimeout(function() {
      var tbodies = document.querySelectorAll('#wo-list-body, #wo-table-body, .wo-table-body');
      tbodies.forEach(function(tbody) {
        var rows = tbody.querySelectorAll('tr');
        rows.forEach(function(row) {
          var cells = row.querySelectorAll('td');
          if (cells.length < 3) return;
          var statusText = '';
          for (var k = 0; k < cells.length; k++) {
            if (cells[k].textContent.indexOf('&#24050;&#23436;&#25104;') !== -1 || cells[k].textContent.indexOf('已完成') !== -1 ||
                cells[k].textContent.indexOf('&#24050;&#21462;&#28040;') !== -1 || cells[k].textContent.indexOf('已取消') !== -1) {
              statusText = cells[k].textContent;
              break;
            }
          }
          if (!statusText) return;
          var actionCell = row.querySelector('td:last-child');
          if (!actionCell || actionCell.innerHTML.indexOf('&#20998;&#21024;&#38500;') !== -1 || actionCell.innerHTML.indexOf('删除') !== -1) return;
          var woIdCell = cells[0].querySelector('span');
          var woId = woIdCell ? woIdCell.textContent.trim() : '';
          if (woId) {
            actionCell.innerHTML += ' <button class="action-btn small red" onclick="openWorkorderDeleteModal(\'' + woId.replace(/'/g, "\\'") + '\')" style="padding:2px 8px;font-size:10px;">&#128465; &#20998;&#21024;&#38500;</button>';
          }
        });
      });
    }, 150);
  };

  window.openWorkorderDeleteModal = function(woId) {
    var existing = document.getElementById('modal-wo-delete');
    if (existing) existing.remove();
    var html = '<div class="modal-overlay hidden" id="modal-wo-delete" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
      '<div class="modal" style="width:380px;">' +
      '<div style="padding:24px 24px 16px;display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:28px;">&#128465;</div><div style="font-size:15px;font-weight:700;">&#21024;&#38500;&#24037;&#21333;</div>' +
      '<button onclick="document.getElementById(\'modal-wo-delete\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">&#10005;</button></div>' +
      '<div style="padding:0 24px 20px;">' +
      '<div style="padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:13px;color:var(--red);margin-bottom:14px;">&#9888; &#30830;&#23450;&#21024;&#38500;&#24037;&#21333; <strong>' + woId + '</strong> &#21543;&#65311;&#21024;&#38500;&#21518;&#26080;&#27861;&#24674;&#22797;&#12290;</div>' +
      '<div class="form-group"><label class="form-label">&#21024;&#38500;&#21407;&#22240;&#65288;&#24517;&#22635;&#65289;</label>' +
      '<select class="form-select" id="wo-delete-reason" style="width:100%;">' +
      '<option value="">-- &#36873;&#25321;&#21407;&#22240; --</option>' +
      '<option value="&#37325;&#22797;&#21021;&#24314;">&#37325;&#22797;&#21021;&#24314;</option>' +
      '<option value="&#20449;&#24687;&#38169;&#35823;">&#20449;&#24687;&#38169;&#35823;</option>' +
      '<option value="&#23458;&#25143;&#21462;&#28040;">&#23458;&#25143;&#21462;&#28040;</option>' +
      '<option value="&#20854;&#20182;">&#20854;&#20182;&#21407;&#22240;</option></select></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-wo-delete\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">&#21462;&#28040;</button>' +
      '<button onclick="doDeleteWorkorder(\'' + woId.replace(/'/g, "\\'") + '\')" style="padding:10px 24px;background:var(--red);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">&#128465; &#30830;&#35748;&#21024;&#38500;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.doDeleteWorkorder = function(woId) {
    var reason = document.getElementById('wo-delete-reason') ? document.getElementById('wo-delete-reason').value : '';
    if (!reason) { showToast('&#35831;&#36873;&#25321;&#21024;&#38500;&#21407;&#22240;', 'error'); return; }
    document.getElementById('modal-wo-delete').remove();
    var tbodies = document.querySelectorAll('#wo-list-body, #wo-table-body, .wo-table-body');
    tbodies.forEach(function(tbody) {
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function(row) {
        var cell = row.querySelector('td:first-child');
        if (cell && cell.textContent.indexOf(woId) !== -1) {
          row.style.transition = 'opacity 0.3s';
          row.style.opacity = '0';
          setTimeout(function() { row.remove(); }, 300);
        }
      });
    });
    showToast('&#9989; &#24037;&#21333; ' + woId + ' &#24050;&#21024;&#38500;&#65288;&#21407;&#22240;&#65306;' + reason + '&#65289;', 'success');
  };

  // ========== 改进4：员工管理 - 离职改为软删除（保留历史记录）==========
  var _origOpenDeleteStaffModal = window.openDeleteStaffModal;
  window.openDeleteStaffModal = function(idx) {
    var staff = window._staffList ? window._staffList[idx] : null;
    if (staff) {
      openStaffLeaveConfirmModal(idx, staff.name, staff.code);
    }
  };

  window.openStaffLeaveConfirmModal = function(idx, name, code) {
    var existing = document.getElementById('modal-staff-leave');
    if (existing) existing.remove();
    var today = new Date().toISOString().slice(0, 10);
    var html = '<div class="modal-overlay hidden" id="modal-staff-leave" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">' +
      '<div class="modal" style="width:420px;">' +
      '<div style="padding:24px 24px 16px;display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:28px;">&#128579;</div><div style="font-size:15px;font-weight:700;">&#21592;&#24037;&#31163;&#32844;</div>' +
      '<button onclick="document.getElementById(\'modal-staff-leave\').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-light);">&#10005;</button></div>' +
      '<div style="padding:0 24px 20px;">' +
      '<div style="padding:14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;margin-bottom:14px;">' +
      '<div style="font-size:13px;margin-bottom:4px;">&#30830;&#23450;&#23558;&#20197;&#19979;&#21592;&#24037;&#26631;&#35760;&#20026;<strong>&#31163;&#32844;</strong>&#21543;&#65311;</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--orange);">' + name + ' <span style="font-size:12px;font-weight:400;">(' + code + ')</span></div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">&#9888; &#31163;&#32844;&#21518;&#21592;&#24037;&#36134;&#21495;&#23558;&#31105;&#29992;&#65292;&#20294;&#21382;&#21490;&#24037;&#20316;&#35760;&#24405;&#23558;&#20445;&#30041;</div></div>' +
      '<div class="form-group"><label class="form-label">&#31163;&#32844;&#26085;&#26399;</label>' +
      '<input type="date" class="form-input" id="staff-leave-date" value="' + today + '" style="width:100%;"></div>' +
      '<div class="form-group"><label class="form-label">&#31163;&#32844;&#21407;&#22240;</label>' +
      '<select class="form-select" id="staff-leave-reason" style="width:100%;">' +
      '<option value="">-- &#36873;&#25321;&#21407;&#22240; --</option>' +
      '<option value="&#20010;&#20154;&#21457;&#23637;">&#20010;&#20154;&#21457;&#23637;</option>' +
      '<option value="&#23478;&#24237;&#21407;&#22240;">&#23478;&#24237;&#21407;&#22240;</option>' +
      '<option value="&#34256;&#37228;&#19981;&#28385;&#24847;">&#34256;&#37228;&#19981;&#28385;&#24847;</option>' +
      '<option value="&#21512;&#21516;&#21040;&#26399;">&#21512;&#21516;&#21040;&#26399;</option>' +
      '<option value="&#20854;&#20182;">&#20854;&#20182;</option></select></div>' +
      '<div class="form-group"><label class="form-label">&#22791;&#27880;</label>' +
      '<textarea class="form-textarea" id="staff-leave-note" placeholder="&#21487;&#36873;&#22791;&#27880;" style="min-height:60px;width:100%;"></textarea></div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-staff-leave\').remove()" style="padding:10px 20px;background:var(--bg);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">&#21462;&#28040;</button>' +
      '<button onclick="doStaffLeave(' + idx + ')" style="padding:10px 24px;background:var(--orange);border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:white;">&#128579; &#30830;&#35748;&#31163;&#32844;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.doStaffLeave = function(idx) {
    var staff = window._staffList ? window._staffList[idx] : null;
    if (!staff) return;
    var reason = document.getElementById('staff-leave-reason') ? document.getElementById('staff-leave-reason').value : '';
    if (!reason) { showToast('&#35831;&#36873;&#25321;&#31163;&#32844;&#21407;&#22240;', 'error'); return; }
    document.getElementById('modal-staff-leave').remove();
    staff.status = 'inactive';
    staff.leaveDate = new Date().toISOString().slice(0, 10);
    staff.leaveReason = reason;
    if (typeof renderStaffTable === 'function') renderStaffTable();
    showToast('&#128579; &#21592;&#24037; ' + staff.name + ' &#24050;&#26631;&#35760;&#20026;&#31163;&#32844;&#65292;&#21382;&#21490;&#35760;&#24405;&#24050;&#20445;&#30041;', 'success');
  };

  // ========== 改进5：系统设置 - 操作日志Tab查看详情功能 ==========
  window.openOperationLogDetail = function(logId) {
    var existing = document.getElementById('modal-oplog-detail');
    if (existing) existing.remove();
    var logMap = {
      'LOG-001': { time: '2026-03-30 09:15:22', user: '&#36213;&#39134;', module: '&#21592;&#24037;&#31649;&#29702;', action: '&#26032;&#22686;&#21592;&#24037;', detail: '&#26032;&#22686;&#21592;&#24037;&#65306;&#38472;&#33805;&#65288;&#21069;&#21381;&#25509;&#24453;&#65289;', ip: '192.168.1.101', result: '&#25104;&#21151;' },
      'LOG-002': { time: '2026-03-30 08:45:10', user: '&#36213;&#39134;', module: '&#31995;&#32479;&#35774;&#32622;', action: '&#20462;&#25913;&#37197;&#32622;', detail: '&#20462;&#25913;&#31995;&#32479;&#37197;&#32622;&#65306;&#36864;&#25151;&#26102;&#38388; 12:00&#8594;14:00', ip: '192.168.1.101', result: '&#25104;&#21151;' },
      'LOG-003': { time: '2026-03-29 17:30:05', user: '&#21608;&#25935;', module: '&#25151;&#38388;&#31649;&#29702;', action: '&#20837;&#20303;&#21150;&#29702;', detail: '&#20026;&#24352;&#19977;&#21150;&#29702;301&#25151;&#38388;&#20837;&#20303;&#65292;&#26041;&#24335;&#65306;&#25163;&#26426;&#24320;&#38145;', ip: '192.168.1.102', result: '&#25104;&#21151;' }
    };
    var log = logMap[logId] || { time: '--', user: '--', module: '--', action: '--', detail: '--', ip: '--', result: '&#25104;&#21151;' };
    var resultColor = log.result === '&#25104;&#21151;' ? 'var(--green)' : 'var(--red)';
    var resultBg = log.result === '&#25104;&#21151;' ? 'var(--green-bg)' : 'var(--red-bg)';
    var html = '<div class="modal-overlay hidden" id="modal-oplog-detail" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-oplog-detail\').remove()">' +
      '<div class="modal" style="width:520px;">' +
      '<div class="modal-header"><div class="modal-title">&#128203; &#25805;&#20316;&#26085;&#24535;&#35814;&#24773; - ' + logId + '</div>' +
      '<button class="modal-close" onclick="document.getElementById(\'modal-oplog-detail\').remove()">&#10005;</button></div>' +
      '<div class="modal-body">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">&#25805;&#20316;&#26102;&#38388;</div><div style="font-size:13px;font-weight:600;">' + log.time + '</div></div>' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">&#25805;&#20316;&#29992;&#25143;</div><div style="font-size:13px;font-weight:600;">' + log.user + '</div></div>' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">&#25805;&#20316;&#27169;&#22359;</div><div style="font-size:13px;font-weight:600;">' + log.module + '</div></div>' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">&#25805;&#20316;&#31867;&#22411;</div><div style="font-size:13px;font-weight:600;">' + log.action + '</div></div></div>' +
      '<div style="margin-bottom:14px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">&#25805;&#20316;&#35814;&#24773;</div>' +
      '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;font-size:13px;color:var(--blue);">' + log.detail + '</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
      '<div style="padding:12px;background:var(--bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">IP&#22320;&#22336;</div><div style="font-size:13px;font-family:monospace;">' + log.ip + '</div></div>' +
      '<div style="padding:12px;background:' + resultBg + ';border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">&#25805;&#20316;&#32467;&#26524;</div><div style="font-size:13px;font-weight:700;color:' + resultColor + ';">' + log.result + '</div></div></div></div>' +
      '<div class="modal-footer"><button class="modal-btn secondary" onclick="document.getElementById(\'modal-oplog-detail\').remove()">&#20851;&#38381;</button>' +
      '<button class="modal-btn" onclick="exportSingleOpLog(\'' + logId + '\')" style="background:var(--green);color:white;border:none;">&#128228; &#23548;&#20986;&#27492;&#26465;</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.exportSingleOpLog = function(logId) {
    showToast('&#128228; &#26085;&#24535; ' + logId + ' &#24050;&#23548;&#20986;', 'success');
  };

  console.log('[iter42] 5&#20010;&#21151;&#33021;&#24615;&#25913;&#36827;&#21152;&#36733;&#23436;&#25104;');
})();
