// ============================================================
// 【物联后台 v4 第50轮】5个功能性断裂函数补全
// ============================================================
// 改进1: smartRoomSearch() - 楼层页面智能搜索筛选（搜索框+3个下拉联动）
// 改进2: switchFloorView() - 楼层视图切换（网格视图/平面图视图）
// 改进3: filterFloorShow() - 楼层房间筛选（全部/仅入住/仅空房/仅告警）
// 改进4: openAddFloorRoomModal() - 快速添房间弹窗（楼层管理新增房间）
// 改进5: showFloorRoomCards() - 楼层房间卡片动态渲染（支持筛选+搜索）
// ============================================================
(function() {
  'use strict';

  // ---------- 改进1：smartRoomSearch - 智能找房搜索筛选 ----------
  window.smartRoomSearch = function(keyword) {
    var searchInput = document.getElementById('smart-room-search');
    var floorFilter = document.getElementById('smart-floor-filter');
    var typeFilter = document.getElementById('smart-type-filter');
    var availFilter = document.getElementById('smart-avail-filter');
    var resultSpan = document.getElementById('smart-search-result');
    
    var kw = (searchInput ? searchInput.value : '') || keyword || '';
    var floor = floorFilter ? floorFilter.value : 'all';
    var type = typeFilter ? typeFilter.value : 'all';
    var avail = availFilter ? availFilter.value : 'all';
    
    // Get current floor tab
    var currentFloor = 3;
    var tabs = document.querySelectorAll('.card-tabs .card-tab');
    tabs.forEach(function(tab) {
      if (tab.classList.contains('active')) {
        var match = tab.textContent.match(/\d+/);
        if (match) currentFloor = parseInt(match[0]);
      }
    });
    
    // Find all room cards on current floor
    var floorContainer = document.getElementById('floor-rooms-container');
    if (!floorContainer) {
      // Try grid view container
      floorContainer = document.querySelector('#page-floor .card-body');
    }
    
    var roomCards = floorContainer ? floorContainer.querySelectorAll('.room-card, .fp-room') : document.querySelectorAll('#page-floor .room-card, #page-floor .fp-room');
    var visibleCount = 0;
    var totalCount = 0;
    
    roomCards.forEach(function(card) {
      totalCount++;
      var roomNum = '';
      var roomType = '';
      var roomStatus = '';
      var occupant = '';
      
      // Extract room number
      var numEl = card.querySelector('.room-num, .room-title, [style*="font-weight:700"]');
      if (numEl) roomNum = numEl.textContent.trim();
      
      // Try to get room type
      var typeEl = card.querySelector('.room-type, .room-info');
      if (typeEl) roomType = typeEl.textContent.trim();
      
      // Get status from badge classes
      if (card.classList.contains('occupied') || card.classList.contains('checkin')) roomStatus = 'in';
      if (card.classList.contains('empty') || card.classList.contains('available')) roomStatus = 'empty';
      if (card.classList.contains('alert') || card.classList.contains('offline')) roomStatus = 'alert';
      
      // Check for specific status text
      var cardHTML = card.innerHTML;
      if (cardHTML.indexOf('入住中') !== -1 || cardHTML.indexOf('已入住') !== -1) roomStatus = 'in';
      if (cardHTML.indexOf('空房') !== -1 || cardHTML.indexOf('可入住') !== -1) roomStatus = 'empty';
      if (cardHTML.indexOf('离线') !== -1 || cardHTML.indexOf('告警') !== -1 || cardHTML.indexOf('低电量') !== -1) roomStatus = 'alert';
      
      // Check text content
      var text = card.textContent || '';
      if (text.indexOf('空房') !== -1 && roomStatus === '') roomStatus = 'empty';
      if (text.indexOf('入住') !== -1 && roomStatus === '') roomStatus = 'in';
      if ((text.indexOf('离线') !== -1 || text.indexOf('低电') !== -1) && roomStatus === '') roomStatus = 'alert';
      
      // Get occupant
      var occupantMatch = text.match(/(?:入住中[· ]|客人[：:])?([^\s]+)/);
      if (occupantMatch && occupantMatch[1]) occupant = occupantMatch[1];
      
      // Apply filters
      var show = true;
      
      // Keyword filter
      if (kw) {
        var lckw = kw.toLowerCase();
        var match = roomNum.toLowerCase().indexOf(lckw) !== -1 ||
                    roomType.toLowerCase().indexOf(lckw) !== -1 ||
                    occupant.toLowerCase().indexOf(lckw) !== -1;
        show = show && match;
      }
      
      // Floor filter (based on current tab context)
      if (floor !== 'all') {
        var floorMatch = roomNum.charAt(0) === floor;
        show = show && floorMatch;
      }
      
      // Type filter
      if (type !== 'all') {
        var typeMatch = roomType.indexOf(type) !== -1;
        show = show && typeMatch;
      }
      
      // Availability filter
      if (avail !== 'all') {
        show = show && roomStatus === avail;
      }
      
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    
    // Update result count
    if (resultSpan) {
      if (kw || floor !== 'all' || type !== 'all' || avail !== 'all') {
        resultSpan.style.display = '';
        resultSpan.textContent = '找到 ' + visibleCount + ' 间';
      } else {
        resultSpan.style.display = 'none';
      }
    }
  };

  // ---------- 改进2：switchFloorView - 楼层视图切换 ----------
  window.switchFloorView = function(view, btn) {
    var gridView = document.getElementById('floor-grid-view') || document.querySelector('#page-floor .floor-grid');
    var planView = document.getElementById('floor-plan-view');
    var gridBtn = document.getElementById('floor-view-grid');
    var planBtn = document.getElementById('floor-view-plan');
    
    // Toggle active button style
    if (gridBtn) {
      gridBtn.style.fontWeight = view === 'grid' ? '700' : '400';
      gridBtn.style.background = view === 'grid' ? 'var(--blue)' : 'var(--blue-bg)';
      gridBtn.style.color = view === 'grid' ? 'white' : 'var(--blue)';
    }
    if (planBtn) {
      planBtn.style.fontWeight = view === 'plan' ? '700' : '400';
      planBtn.style.background = view === 'plan' ? 'var(--green)' : 'var(--green-bg)';
      planBtn.style.color = view === 'plan' ? 'white' : 'var(--green)';
    }
    
    // Show/hide views
    if (view === 'plan') {
      if (gridView) gridView.style.display = 'none';
      if (planView) {
        planView.style.display = '';
        // Render floor plan if empty
        renderFloorPlanView();
      }
    } else {
      if (planView) planView.style.display = 'none';
      if (gridView) gridView.style.display = '';
    }
    
    showToast('已切换到' + (view === 'plan' ? '平面图' : '网格视图') + '视图', 'info');
  };

  // 渲染楼层平面图视图
  function renderFloorPlanView() {
    var planView = document.getElementById('floor-plan-view');
    if (!planView) return;
    
    // Get current floor
    var currentFloor = 3;
    var tabs = document.querySelectorAll('.card-tabs .card-tab');
    tabs.forEach(function(tab) {
      if (tab.classList.contains('active')) {
        var match = tab.textContent.match(/\d+/);
        if (match) currentFloor = parseInt(match[0]);
      }
    });
    
    // Check if already rendered
    if (planView.querySelector('#fp-room-grid')) return;
    
    // Sample room data for the floor
    var rooms = [
      {num:'301', type:'亲子间', status:'online', occupant:'张三', power:88, signal:'满格', uuid:'A84F1AF2', state:'in'},
      {num:'302', type:'大床房', status:'offline', occupant:'', power:0, signal:'离线', uuid:'A84F1AF3', state:'empty'},
      {num:'303', type:'标准间', status:'lowbat', occupant:'李四', power:18, signal:'正常', uuid:'A84F1AF4', state:'in'},
      {num:'304', type:'亲子间', status:'online', occupant:'', power:95, signal:'满格', uuid:'A84F1AF5', state:'empty'},
      {num:'305', type:'大床房', status:'online', occupant:'王五', power:72, signal:'满格', uuid:'A84F1AF6', state:'in'},
      {num:'306', type:'标准间', status:'lowbat', occupant:'', power:22, signal:'正常', uuid:'A84F1AF7', state:'empty'},
      {num:'307', type:'大床房', status:'online', occupant:'赵六', power:85, signal:'满格', uuid:'A84F1AF8', state:'in'},
      {num:'308', type:'亲子间', status:'offline', occupant:'', power:0, signal:'离线', uuid:'A84F1AF9', state:'empty'}
    ];
    
    var statusMap = {
      online: {color:'var(--green)', bg:'rgba(82,196,26,0.08)', icon:'🟢', label:'在线'},
      offline: {color:'var(--red)', bg:'rgba(255,77,79,0.08)', icon:'🔴', label:'离线'},
      lowbat: {color:'var(--orange)', bg:'rgba(250,140,22,0.08)', icon:'🟡', label:'低电量'}
    };
    
    var roomHTML = rooms.map(function(r) {
      var st = statusMap[r.status] || statusMap.online;
      var stateText = r.state === 'in' ? '入住中 · ' + r.occupant : '空房';
      var stateColor = r.state === 'in' ? 'var(--blue)' : 'var(--green)';
      var powerText = r.status === 'offline' ? '设备离线' : '🔋 ' + r.power + '% · 📶 ' + r.signal;
      var powerColor = r.status === 'offline' ? 'var(--red)' : (r.status === 'lowbat' ? 'var(--orange)' : 'var(--green)');
      
      return '<div class="fp-room fp-' + r.status + '" onclick="fpNavigateRoom(\'' + r.num + '\')" style="padding:12px;border-radius:8px;border:2px solid ' + st.color + ';background:' + st.bg + ';cursor:pointer;transition:all 0.2s;" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.15)\'" onmouseout="this.style.boxShadow=\'\'">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="font-size:14px;font-weight:700;">' + r.num + '</span>' +
        '<span style="font-size:10px;background:' + st.color + ';color:white;padding:1px 6px;border-radius:8px;">' + st.icon + '</span></div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">' + r.type + '</div>' +
        '<div style="font-size:11px;font-weight:600;color:' + stateColor + ';margin-bottom:2px;">' + stateText + '</div>' +
        '<div style="font-size:10px;color:' + powerColor + ';">' + powerText + '</div>' +
        '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">' + r.uuid + '</div></div>';
    }).join('');
    
    var container = planView.querySelector('#fp-room-grid-container') || planView;
    // Only add if not already there
    if (!planView.querySelector('.corridor-div')) {
      planView.insertAdjacentHTML('afterbegin', 
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<div style="font-size:13px;font-weight:700;color:var(--text);">📐 楼层设备状态平面图</div>' +
        '<div style="display:flex;gap:12px;font-size:11px;">' +
        '<span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;background:var(--green);border-radius:2px;"></span>🟢 在线</span>' +
        '<span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;background:var(--red);border-radius:2px;"></span>🔴 离线</span>' +
        '<span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:12px;background:var(--orange);border-radius:2px;"></span>🟡 低电量</span></div></div>' +
        '<div style="background:white;border:1px solid var(--border);border-radius:12px;padding:20px;max-width:800px;margin:0 auto;">' +
        '<div class="corridor-div" style="background:linear-gradient(90deg,#e8e8e8,#f5f5f5);border-radius:6px;padding:8px 16px;margin-bottom:16px;text-align:center;font-size:12px;color:var(--text-muted);font-weight:600;border:1px dashed #ccc;">🚶 走廊 CORRIDOR</div>' +
        '<div id="fp-room-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">' + roomHTML + '</div></div>'
      );
    }
  }

  // Navigate to room detail from floor plan
  window.fpNavigateRoom = function(roomNum) {
    showToast('正在打开 ' + roomNum + ' 房间详情…', 'info');
    setTimeout(function() {
      showPage('room-detail');
      // Trigger room detail load
      if (window.loadRoomDetail) loadRoomDetail(roomNum);
    }, 300);
  };

  // ---------- 改进3：filterFloorShow - 楼层房间筛选 ----------
  window.filterFloorShow = function(filter) {
    var floorContainer = document.querySelector('#page-floor .card-body');
    if (!floorContainer) return;
    
    var roomCards = floorContainer.querySelectorAll('.room-card');
    var visibleCount = 0;
    var totalCount = 0;
    
    roomCards.forEach(function(card) {
      totalCount++;
      var text = card.textContent || '';
      var show = true;
      
      if (filter === 'in') {
        show = text.indexOf('入住') !== -1;
      } else if (filter === 'empty') {
        show = text.indexOf('空房') !== -1 || text.indexOf('可入住') !== -1;
      } else if (filter === 'alert') {
        show = text.indexOf('离线') !== -1 || text.indexOf('告警') !== -1 || text.indexOf('低电') !== -1 || text.indexOf('异常') !== -1;
      }
      // 'all' shows everything
      
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    
    // Update floor tab badge counts
    var filterSelect = document.querySelector('#page-floor select[onchange*="filterFloorShow"]');
    if (filter !== 'all' && filterSelect) {
      var countSpan = filterSelect.nextElementSibling;
      if (countSpan && countSpan.classList.contains('filter-count')) {
        countSpan.textContent = '(' + visibleCount + ')';
      }
    }
    
    if (filter !== 'all') {
      showToast('筛选显示 ' + visibleCount + ' 间房', 'info');
    }
  };

  // ---------- 改进4：openAddFloorRoomModal - 快速添房间 ----------
  window.openAddFloorRoomModal = function() {
    var existing = document.getElementById('modal-add-floor-room');
    if (existing) existing.remove();
    
    var roomTypes = [
      {name:'亲子间', code:'QZ'}, {name:'大床房', code:'DC'},
      {name:'标准间', code:'BZ'}, {name:'家庭套房', code:'TF'}
    ];
    
    var typeOptions = roomTypes.map(function(t) {
      return '<option value="' + t.code + '">' + t.name + '</option>';
    }).join('');
    
    var html = '<div class="modal-overlay" id="modal-add-floor-room" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)document.getElementById(\'modal-add-floor-room\').remove()">' +
      '<div class="modal" style="width:420px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="font-size:24px;">🏠</div><div><div style="font-size:15px;font-weight:700;">快速添加房间</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">在当前楼层添加新房间</div></div>' +
      '<button onclick="document.getElementById(\'modal-add-floor-room\').remove()" style="margin-left:auto;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-light);">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">房间号 <span style="color:var(--red);">*</span></label>' +
      '<input type="text" id="afr-room-num" class="form-input" placeholder="如：309" maxlength="5" style="width:100%;"></div>' +
      '<div class="form-group"><label class="form-label">所属楼层</label>' +
      '<select id="afr-floor" class="form-select" style="width:100%;">' +
      '<option value="3">3层</option><option value="2">2层</option><option value="1">1层</option></select></div>' +
      '<div class="form-group"><label class="form-label">房间类型</label>' +
      '<select id="afr-type" class="form-select" style="width:100%;">' + typeOptions + '</select></div>' +
      '<div class="form-group"><label class="form-label">设备UUID（可选）</label>' +
      '<input type="text" id="afr-uuid" class="form-input" placeholder="选填，绑定门锁设备" maxlength="20" style="width:100%;"></div>' +
      '<div class="form-group"><label class="form-label">备注</label>' +
      '<textarea id="afr-remark" class="form-input" placeholder="选填备注信息…" style="resize:vertical;min-height:60px;width:100%;"></textarea></div>' +
      '</div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
      '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-add-floor-room\').remove()">取消</button>' +
      '<button class="modal-btn primary" onclick="submitAddFloorRoom()">✅ 确认添加</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.submitAddFloorRoom = function() {
    var roomNum = document.getElementById('afr-room-num') ? document.getElementById('afr-room-num').value.trim() : '';
    var floor = document.getElementById('afr-floor') ? document.getElementById('afr-floor').value : '3';
    var type = document.getElementById('afr-type') ? document.getElementById('afr-type').options[document.getElementById('afr-type').selectedIndex].text : '';
    
    if (!roomNum) {
      showToast('请输入房间号', 'error');
      return;
    }
    if (!/^\d{3,4}$/.test(roomNum)) {
      showToast('房间号格式错误，请输入3-4位数字', 'error');
      return;
    }
    
    document.getElementById('modal-add-floor-room').remove();
    showToast('✅ 房间 ' + roomNum + ' (' + floor + '层·' + type + ') 添加成功', 'success');
    
    // Refresh floor list (trigger tab switch)
    if (window.switchFloorTab) switchFloorTab(parseInt(floor));
  };

  // ---------- 改进5：showFloorRoomCards - 楼层房间卡片渲染 ----------
  // This ensures the floor grid view dynamically renders based on data
  window.showFloorRoomCards = function(floor) {
    var container = document.getElementById('floor-rooms-container');
    if (!container) {
      // Find or create container
      var cardBody = document.querySelector('#page-floor .card-body');
      if (cardBody) {
        container = document.createElement('div');
        container.id = 'floor-rooms-container';
        cardBody.appendChild(container);
      }
    }
    if (!container) return;
    
    // Floor room data
    var floorData = {
      3: [
        {num:'301', type:'亲子间', status:'occupied', occupant:'张三', power:88, signal:'满格', uuid:'A84F1AF2', temp:24},
        {num:'302', type:'大床房', status:'empty', occupant:'', power:0, signal:'离线', uuid:'A84F1AF3', temp:0},
        {num:'303', type:'标准间', status:'occupied', occupant:'李四', power:18, signal:'正常', uuid:'A84F1AF4', temp:22},
        {num:'304', type:'亲子间', status:'empty', occupant:'', power:95, signal:'满格', uuid:'A84F1AF5', temp:0}
      ],
      2: [
        {num:'201', type:'大床房', status:'occupied', occupant:'王五', power:75, signal:'满格', uuid:'B84F1AF2', temp:23},
        {num:'202', type:'标准间', status:'empty', occupant:'', power:92, signal:'满格', uuid:'B84F1AF3', temp:0},
        {num:'203', type:'家庭套房', status:'occupied', occupant:'赵六', power:65, signal:'正常', uuid:'B84F1AF4', temp:25}
      ],
      1: [
        {num:'101', type:'大床房', status:'empty', occupant:'', power:88, signal:'满格', uuid:'C84F1AF2', temp:0},
        {num:'102', type:'标准间', status:'occupied', occupant:'孙七', power:72, signal:'满格', uuid:'C84F1AF3', temp:24}
      ]
    };
    
    var rooms = floorData[floor] || floorData[3];
    
    var html = rooms.map(function(r) {
      var statusBadge = r.status === 'occupied' ? 
        '<span class="tbadge blue">入住中</span>' : 
        '<span class="tbadge green">空房</span>';
      var infoLine = r.status === 'occupied' ? 
        '<div style="font-size:11px;font-weight:600;color:var(--blue);">入住中 · ' + r.occupant + '</div>' :
        '<div style="font-size:11px;color:var(--green);">空房</div>';
      var powerInfo = r.power > 0 ? 
        '<div style="font-size:10px;color:' + (r.power < 20 ? 'var(--orange)' : 'var(--green)') + ';">🔋 ' + r.power + '% · 📶 ' + r.signal + '</div>' :
        '<div style="font-size:10px;color:var(--red);">⚠️ 设备离线</div>';
      
      return '<div class="room-card ' + (r.status === 'occupied' ? 'occupied' : 'empty') + '" onclick="showRoomDetail(\'' + r.num + '\')" style="cursor:pointer;padding:12px;border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;gap:6px;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div style="font-size:14px;font-weight:700;color:var(--blue);">' + r.num + '</div>' +
        statusBadge + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + r.type + '</div>' +
        infoLine +
        powerInfo +
        '<div style="font-size:10px;color:var(--text-muted);">' + r.uuid + '</div></div>';
    }).join('');
    
    container.innerHTML = html;
  };

})();
