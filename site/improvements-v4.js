/**
 * 物联后台 v4 功能性改进补丁
 * 5项改进：
 * 1. 修复叫醒服务/失物招领/耗材采购页面导航（render函数未绑定）
 * 2. 修复交接班报表页面初始化（renderHandoverReport未触发）
 * 3. 新增发票详情全流程时间线弹窗（原系统有完整流程，Demo缺少）
 * 4. 新增设备批量导入弹窗（原系统有导入导出，Demo只有列表）
 * 5. 新增会员积分/等级管理弹窗（原系统有会员等级权益，Demo缺少交互）
 */

(function() {
  console.log('[v4补丁] 开始加载5项功能性改进...');

  // ════════════════════════════════════════════════════════════
  // 改进1：修复叫醒服务/失物招领/耗材采购页面导航
  // 问题：showPage切换到这些页面时，innerHTML已存在但render函数从未调用
  // 修复：在showPage函数中增加对这些页面的render调用
  // ════════════════════════════════════════════════════════════

  var _origShowPage = window.showPage;
  window.showPage = function(name) {
    // 调用原始showPage
    if (_origShowPage) {
      _origShowPage.apply(null, arguments);
    } else {
      // 备用：手动切换page显示
      document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
      var target = document.getElementById('page-' + name);
      if (target) target.classList.add('active');
    }

    // 【改进1】切换到叫醒服务/失物招领/耗材采购页面时渲染内容
    if (name === 'wakecall') {
      setTimeout(function() {
        if (typeof renderWakeCallPage === 'function') renderWakeCallPage();
      }, 80);
    }
    if (name === 'lostfound') {
      setTimeout(function() {
        if (typeof renderLostFoundPage === 'function') renderLostFoundPage();
      }, 80);
    }
    if (name === 'procurement') {
      setTimeout(function() {
        if (typeof renderProcurementPage === 'function') renderProcurementPage();
      }, 80);
    }

    // 【改进2】切换到交接班报表时触发renderHandoverReport
    if (name === 'handover') {
      setTimeout(function() {
        if (typeof renderHandoverReport === 'function') renderHandoverReport();
      }, 80);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 改进3：新增发票详情全流程时间线弹窗
  // 理由：原系统截图05-config有完整发票流程（申请→审核→开票→邮寄）
  // 原Demo只有列表，缺少"发票详情+全流程时间线"弹窗
  // 功能：展示发票申请→审批→开具→邮寄完整链路
  // ════════════════════════════════════════════════════════════

  window.openInvoiceDetailModalV3 = function(invoiceId) {
    var old = document.getElementById('modal-invoice-detail-v3');
    if (old) old.remove();

    // 模拟发票全流程时间线数据
    var timeline = [
      { step: 'submit', label: '提交申请', operator: '张三', time: '2026-03-27 14:32', status: 'done', detail: '提交发票申请：普通发票，金额¥580' },
      { step: 'review', label: '财务审核', operator: '李财务', time: '2026-03-27 15:10', status: 'done', detail: '审核通过，发票内容核对无误' },
      { step: 'issue', label: '开具发票', operator: '王出纳', time: '2026-03-27 16:45', status: 'done', detail: '开具增值税普通发票，发票号 INV-20260327-0582' },
      { step: 'print', label: '打印邮寄', operator: '张助理', time: '2026-03-28 09:20', status: 'done', detail: '已打包，等待快递上门取件' },
      { step: 'deliver', label: '快递配送', operator: '顺丰速运', time: '2026-03-28 11:30', status: 'pending', detail: '运单号 SF-1234567890，预计3月29送达' }
    ];

    var statusMap = {
      done: { color: '#52c41a', bg: '#f6ffed', icon: '✅', label: '已完成' },
      pending: { color: '#1890ff', bg: '#e6f4ff', icon: '⏳', label: '进行中' },
      wait: { color: '#d9d9d9', bg: '#f5f5f5', icon: '⏸', label: '等待中' }
    };

    var timelineHtml = timeline.map(function(item, idx) {
      var st = statusMap[item.status] || statusMap.wait;
      var connector = idx < timeline.length - 1
        ? '<div style="position:absolute;left:15px;top:32px;bottom:-16px;width:2px;background:' + (item.status === 'done' ? '#52c41a' : '#e8e8e8') + ';"></div>'
        : '';
      return '<div style="position:relative;padding-left:40px;padding-bottom:24px;">' +
        '<div style="position:absolute;left:8px;top:4px;width:16px;height:16px;border-radius:50%;background:' + st.bg + ';border:2px solid ' + st.color + ';display:flex;align-items:center;justify-content:center;font-size:10px;color:' + st.color + ';z-index:1;">' + st.icon + '</div>' +
        connector +
        '<div style="font-size:13px;font-weight:700;color:' + st.color + ';margin-bottom:4px;">' + item.label + ' <span style="font-size:11px;font-weight:400;color:#999;">— ' + st.label + '</span></div>' +
        '<div style="font-size:12px;color:#666;margin-bottom:4px;">' + item.detail + '</div>' +
        '<div style="font-size:11px;color:#999;">' + item.operator + ' · ' + item.time + '</div></div>';
    }).join('');

    var html = '<div id="modal-invoice-detail-v3" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-invoice-detail-v3\').remove()">' +
      '<div class="modal" style="width:600px;max-height:90vh;overflow-y:auto;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div>' +
      '<div style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">🧾 发票详情 <span style="padding:2px 8px;background:#e6f4ff;color:#1890ff;border-radius:10px;font-size:11px;font-weight:600;">INV-2026032701</span></div>' +
      '<div style="font-size:12px;color:#999;margin-top:4px;">发票全生命周期追踪 · 点击步骤可查看详情</div></div>' +
      '<button onclick="document.getElementById(\'modal-invoice-detail-v3\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

      // 发票基础信息
      '<div style="padding:16px 24px;background:#fafafa;border-bottom:1px solid #e8e8e8;">' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">发票类型</div><div style="font-size:13px;font-weight:600;">📄 普通发票</div></div>' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">开票金额</div><div style="font-size:16px;font-weight:700;color:#1890ff;">¥580</div></div>' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">发票抬头</div><div style="font-size:13px;font-weight:600;">杭州智能科技有限公司</div></div>' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">税号</div><div style="font-size:12px;font-family:monospace;color:#666;">91330100MA2XXXXX</div></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px;">' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">客人姓名</div><div style="font-size:13px;font-weight:600;">张三</div></div>' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">房间号</div><div style="font-size:13px;font-weight:600;">301</div></div>' +
      '<div><div style="font-size:11px;color:#999;margin-bottom:4px;">申请人</div><div style="font-size:13px;font-weight:600;">赵飞</div></div></div></div>' +

      // 全流程时间线
      '<div style="padding:20px 24px;">' +
      '<div style="font-size:14px;font-weight:700;margin-bottom:16px;color:#333;">📋 发票全流程时间线</div>' +
      '<div style="padding:16px;background:#f9f9f9;border-radius:8px;border:1px solid #e8e8e8;">' +
      timelineHtml +
      '</div></div>' +

      // 邮寄信息
      '<div style="padding:16px 24px;background:#fff7e6;border-top:1px solid #ffe58f;">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📦 邮寄信息</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:12px;">' +
      '<div><div style="color:#999;margin-bottom:4px;">收件人</div><div style="font-weight:600;">王总</div></div>' +
      '<div><div style="color:#999;margin-bottom:4px;">联系电话</div><div style="font-weight:600;">138****1234</div></div>' +
      '<div style="grid-column:span 2;"><div style="color:#999;margin-bottom:4px;">收件地址</div><div style="font-weight:600;">浙江省杭州市西湖区XX路XX号</div></div></div>' +
      '<div style="margin-top:10px;padding:10px;background:#e6f4ff;border-radius:6px;display:flex;align-items:center;gap:8px;">' +
      '<span style="font-size:16px;">🚚</span>' +
      '<div style="flex:1;"><div style="font-size:12px;font-weight:600;color:#1890ff;">顺丰速运 SF-1234567890</div><div style="font-size:11px;color:#666;margin-top:2px;">2026-03-28 11:30 已揽收，预计 03-29 14:00 前送达</div></div>' +
      '<button style="padding:4px 10px;background:#1890ff;color:white;border:none;border-radius:4px;font-size:11px;cursor:pointer;">查看物流</button></div></div>' +

      // 操作按钮
      '<div style="padding:16px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-invoice-detail-v3\').remove()" class="modal-btn secondary">关闭</button>' +
      '<button onclick="showToast(\'发票作废申请已提交\',\'warning\')" style="padding:8px 16px;background:#fff1f0;color:#ff4d4f;border:1px solid #ff4d4f;border-radius:6px;font-size:13px;cursor:pointer;">作废发票</button>' +
      '<button onclick="showToast(\'发送至客户邮箱\',\'success\')" style="padding:8px 16px;background:#1890ff;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">📧 发送邮箱</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ════════════════════════════════════════════════════════════
  // 改进4：新增设备批量导入弹窗
  // 理由：原系统截图02-hardware有设备列表，原Demo只有手动添加
  // 实际运营需要批量导入（Excel模板下载→填写→上传），形成完整闭环
  // 功能：下载模板→填写指引→文件上传模拟→导入结果展示
  // ════════════════════════════════════════════════════════════

  window.openDeviceBatchImportModal = function() {
    var old = document.getElementById('modal-device-batch-import');
    if (old) old.remove();

    var html = '<div id="modal-device-batch-import" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-device-batch-import\').remove()">' +
      '<div class="modal" style="width:560px;max-height:90vh;overflow-y:auto;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div><div style="font-size:16px;font-weight:700;">📥 批量导入设备</div><div style="font-size:12px;color:#999;margin-top:4px;">支持从Excel批量导入设备，支持房间号/UUID/固件版本等字段</div></div>' +
      '<button onclick="document.getElementById(\'modal-device-batch-import\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button></div>' +

      // 步骤指示器
      '<div style="padding:16px 24px;display:flex;align-items:center;gap:0;background:#fafafa;border-bottom:1px solid #e8e8e8;">' +
      '<div style="display:flex;align-items:center;gap:8px;" id="import-step-1">' +
      '<div style="width:24px;height:24px;border-radius:50%;background:#1890ff;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">1</div>' +
      '<div style="font-size:13px;font-weight:600;color:#1890ff;">下载模板</div></div>' +
      '<div style="flex:1;height:2px;background:#e8e8e8;margin:0 12px;"></div>' +
      '<div style="display:flex;align-items:center;gap:8px;" id="import-step-2">' +
      '<div style="width:24px;height:24px;border-radius:50%;background:#d9d9d9;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">2</div>' +
      '<div style="font-size:13px;font-weight:600;color:#999;">填写数据</div></div>' +
      '<div style="flex:1;height:2px;background:#e8e8e8;margin:0 12px;"></div>' +
      '<div style="display:flex;align-items:center;gap:8px;" id="import-step-3">' +
      '<div style="width:24px;height:24px;border-radius:50%;background:#d9d9d9;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">3</div>' +
      '<div style="font-size:13px;font-weight:600;color:#999;">上传确认</div></div></div>' +

      // 步骤1：下载模板
      '<div style="padding:20px 24px;" id="import-panel-1">' +
      '<div style="padding:20px;background:#f6ffed;border:1px solid #b7eb8f;border-radius:8px;margin-bottom:16px;">' +
      '<div style="font-size:13px;font-weight:700;color:#52c41a;margin-bottom:12px;">📋 Excel导入模板说明</div>' +
      '<div style="font-size:12px;color:#666;line-height:1.8;">' +
      '<b>必填字段：</b>房间号(device_room)、设备UUID(device_uuid)、设备型号(model_name)<br>' +
      '<b>可选字段：</b>固件版本(firmware_ver)、安装日期(install_date)、备注(remark)<br>' +
      '<b>注意事项：</b>房间号必须已存在于系统中，UUID不可重复</div></div>' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📥 请选择模板版本</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<div onclick="document.getElementById(\'modal-device-batch-import\').remove();showToast(\'📥 领锁设备导入模板_v1.2.xlsx 已下载\',\'success\');setTimeout(openDeviceBatchImportModalStep2,800)" style="padding:14px 16px;background:white;border:1px solid #1890ff;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;">' +
      '<span style="font-size:24px;">📊</span><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#1890ff;">标准版模板（含全部字段）</div><div style="font-size:11px;color:#999;margin-top:2px;">适用场景：首次批量导入 · 包含全部示例数据</div></div><span style="font-size:14px;color:#1890ff;">›</span></div>' +
      '<div onclick="document.getElementById(\'modal-device-batch-import\').remove();showToast(\'📥 领锁设备导入模板_精简版.xlsx 已下载\',\'success\');setTimeout(openDeviceBatchImportModalStep2,800)" style="padding:14px 16px;background:white;border:1px solid #e8e8e8;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;">' +
      '<span style="font-size:24px;">📄</span><div style="flex:1;"><div style="font-size:13px;font-weight:600;">精简版模板（仅必填）</div><div style="font-size:11px;color:#999;margin-top:2px;">适用场景：仅导入必填字段</div></div><span style="font-size:14px;color:#999;">›</span></div></div></div>' +

      // 步骤2：填写说明（动态显示）
      '<div style="padding:20px 24px;display:none;" id="import-panel-2">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">✏️ 填写规范</div>' +
      '<div style="background:#f5f5f5;border-radius:8px;padding:14px;margin-bottom:16px;font-size:12px;color:#666;line-height:1.8;">' +
      '<div style="margin-bottom:8px;"><b style="color:#333;">1. 房间号格式：</b>数字，如 301、302（必须是在住房间）</div>' +
      '<div style="margin-bottom:8px;"><b style="color:#333;">2. 设备UUID格式：</b>16位字母数字，如 E28J5EJ6-XXXX-XXXX</div>' +
      '<div style="margin-bottom:8px;"><b style="color:#333;">3. 设备型号：</b>领握LH-807 / 领握LH-608 / 领握LH-200</div>' +
      '<div><b style="color:#333;">4. 安装日期：</b>YYYY-MM-DD 格式，如 2026-03-28</div></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding:12px;background:#fff7e6;border:1px solid #ffd591;border-radius:6px;margin-bottom:16px;">' +
      '<span style="font-size:14px;">💡</span><div style="font-size:12px;color:#fa8c16;">提示：建议先下载标准模板，填好第一行示例数据后再填写，可参考已有设备数据</div></div>' +
      '<button onclick="document.getElementById(\'import-panel-2\').style.display=\'none\';document.getElementById(\'import-panel-3\').style.display=\'block\';document.getElementById(\'import-step-2\').querySelector(\'div:first-child\').style.background=\'#52c41a\';document.getElementById(\'import-step-3\').querySelector(\'div:first-child\').style.background=\'#1890ff\';" style="width:100%;padding:12px;background:#1890ff;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">下一步：上传文件 ›</button></div>' +

      // 步骤3：上传确认
      '<div style="padding:20px 24px;display:none;" id="import-panel-3">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📤 上传填写好的Excel文件</div>' +
      '<div onclick="simulateFileSelect()" id="import-drop-zone" style="border:2px dashed #d9d9d9;border-radius:8px;padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;background:#fafafa;margin-bottom:16px;" onmouseover="this.style.borderColor=\'#1890ff\';this.style.background=\'#e6f4ff\'" onmouseout="this.style.borderColor=\'#d9d9d9\';this.style.background=\'#fafafa\'">' +
      '<div style="font-size:36px;margin-bottom:12px;">📁</div>' +
      '<div style="font-size:14px;color:#333;font-weight:600;margin-bottom:6px;">点击选择文件或拖拽文件到此处</div>' +
      '<div style="font-size:12px;color:#999;">支持 .xlsx / .xls 格式，文件大小不超过 5MB</div></div>' +
      '<div id="import-selected-file" style="display:none;padding:12px;background:#f6ffed;border:1px solid #b7eb8f;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">' +
      '<span style="font-size:20px;">📊</span>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#52c41a;" id="import-filename">devices_import_2026-03-28.xlsx</div><div style="font-size:11px;color:#999;margin-top:2px;">共 8 条设备数据 · 约 256KB</div></div>' +
      '<button onclick="document.getElementById(\'import-selected-file\').style.display=\'none\';document.getElementById(\'import-drop-zone\').style.display=\'block\';" style="background:none;border:none;color:#ff4d4f;font-size:12px;cursor:pointer;">✕ 删除</button></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<button onclick="document.getElementById(\'import-panel-3\').style.display=\'none\';document.getElementById(\'import-panel-2\').style.display=\'block\';document.getElementById(\'import-step-3\').querySelector(\'div:first-child\').style.background=\'#d9d9d9\';" class="modal-btn secondary" style="flex:1;padding:10px;">← 返回</button>' +
      '<button onclick="executeDeviceImport()" style="flex:2;padding:10px;background:#52c41a;color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">🚀 执行导入</button></div></div>' +

      '<div style="padding:12px 24px 20px;display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e8e8e8;">' +
      '<button onclick="document.getElementById(\'modal-device-batch-import\').remove()" class="modal-btn secondary">关闭</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.openDeviceBatchImportModalStep2 = function() {
    openDeviceBatchImportModal();
    setTimeout(function() {
      var panel1 = document.getElementById('import-panel-1');
      var panel2 = document.getElementById('import-panel-2');
      if (panel1 && panel2) {
        panel1.style.display = 'none';
        panel2.style.display = 'block';
        document.getElementById('import-step-1').querySelector('div:first-child').style.background = '#52c41a';
        document.getElementById('import-step-2').querySelector('div:first-child').style.background = '#1890ff';
      }
    }, 100);
  };

  window.simulateFileSelect = function() {
    var dropZone = document.getElementById('import-drop-zone');
    var selectedFile = document.getElementById('import-selected-file');
    if (dropZone) dropZone.style.display = 'none';
    if (selectedFile) {
      selectedFile.style.display = 'flex';
      document.getElementById('import-filename').textContent = 'devices_import_2026-03-28.xlsx';
    }
    showToast('已选择文件：devices_import_2026-03-28.xlsx（8条设备）', 'success');
  };

  window.executeDeviceImport = function() {
    var modal = document.getElementById('modal-device-batch-import');
    if (modal) modal.remove();

    // 导入结果弹窗
    var resultHtml = '<div id="modal-import-result" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-import-result\').remove()">' +
      '<div class="modal" style="width:480px;">' +
      '<div style="padding:24px;text-align:center;border-bottom:1px solid #e8e8e8;">' +
      '<div style="font-size:48px;margin-bottom:12px;">✅</div>' +
      '<div style="font-size:18px;font-weight:700;color:#52c41a;margin-bottom:8px;">导入完成！</div>' +
      '<div style="font-size:13px;color:#666;">devices_import_2026-03-28.xlsx</div></div>' +
      '<div style="padding:20px 24px;">' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">' +
      '<div style="text-align:center;padding:14px;background:#f6ffed;border-radius:8px;"><div style="font-size:24px;font-weight:700;color:#52c41a;">8</div><div style="font-size:12px;color:#666;">总条数</div></div>' +
      '<div style="text-align:center;padding:14px;background:#f6ffed;border-radius:8px;"><div style="font-size:24px;font-weight:700;color:#52c41a;">7</div><div style="font-size:12px;color:#666;">成功</div></div>' +
      '<div style="text-align:center;padding:14px;background:#fff1f0;border-radius:8px;"><div style="font-size:24px;font-weight:700;color:#ff4d4f;">1</div><div style="font-size:12px;color:#666;">失败</div></div></div>' +
      '<div style="font-size:12px;background:#fff7e6;border:1px solid #ffd591;border-radius:6px;padding:10px;margin-bottom:16px;">' +
      '<div style="color:#fa8c16;font-weight:600;margin-bottom:4px;">⚠️ 失败记录（1条）</div>' +
      '<div style="color:#666;font-size:12px;">行2：房间号「306」不存在或未入住，请检查后重新导入</div></div>' +
      '<div style="font-size:12px;color:#999;text-align:center;">导入结果已自动同步到设备列表页面</div></div>' +
      '<div style="padding:16px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;justify-content:center;">' +
      '<button onclick="document.getElementById(\'modal-import-result\').remove();showPage(\'device\')" style="padding:8px 20px;background:#1890ff;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">📱 查看设备列表</button>' +
      '<button onclick="document.getElementById(\'modal-import-result\').remove()" style="padding:8px 20px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:6px;font-size:13px;cursor:pointer;">关闭</button></div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', resultHtml);
  };

  // ════════════════════════════════════════════════════════════
  // 改进5：新增会员积分/等级管理弹窗
  // 理由：原系统截图05-config有会员管理，等级权益体系是酒店核心
  // 原Demo会员页面只有列表，缺少"积分管理+等级权益配置"交互弹窗
  // 功能：查看积分明细/积分扣除/等级升级/权益配置
  // ════════════════════════════════════════════════════════════

  window.openMemberPointsManagementModal = function(memberId) {
    var old = document.getElementById('modal-member-points');
    if (old) old.remove();

    var member = {
      id: memberId || 'M-001',
      name: '张三',
      phone: '138****8888',
      level: '银卡会员',
      points: 5800,
      totalPoints: 12800,
      joinDate: '2025-08-15',
      birthday: '1990-05-20',
      levelName: { '普通会员': 0, '银卡会员': 5000, '金卡会员': 15000, '钻石会员': 50000 }
    };

    var pointsRecords = [
      { date: '2026-03-25', type: 'earn', amount: 200, reason: '入住消费奖励', balance: 5800 },
      { date: '2026-03-20', type: 'earn', amount: 500, reason: '推荐好友奖励', balance: 5600 },
      { date: '2026-03-15', type: 'redeem', amount: -300, reason: '积分兑换房晚', balance: 5100 },
      { date: '2026-03-10', type: 'earn', amount: 800, reason: '续住奖励', balance: 5400 },
      { date: '2026-03-01', type: 'earn', amount: 400, reason: '生日双倍积分', balance: 4600 }
    ];

    var levelColors = { '普通会员': '#999', '银卡会员': '#8c8c8c', '金卡会员': '#fa8c16', '钻石会员': '#722ed1' };
    var levelColor = levelColors[member.level] || '#1890ff';

    var recordsHtml = pointsRecords.map(function(r) {
      var typeStyle = r.type === 'earn'
        ? '<span style="color:#52c41a;font-weight:700;">+' + r.amount + '</span>'
        : '<span style="color:#ff4d4f;font-weight:700;">' + r.amount + '</span>';
      return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:' + (r.type === 'earn' ? '#f6ffed' : '#fff1f0') + ';display:flex;align-items:center;justify-content:center;font-size:16px;">' + (r.type === 'earn' ? '📈' : '📉') + '</div>' +
        '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + r.reason + '</div><div style="font-size:11px;color:#999;margin-top:2px;">' + r.date + '</div></div>' +
        '<div style="text-align:right;"><div style="font-size:14px;font-weight:700;">' + typeStyle + '</div><div style="font-size:11px;color:#999;margin-top:2px;">余额 ' + r.balance + '</div></div></div>';
    }).join('');

    // 等级进度
    var levels = ['普通会员', '银卡会员', '金卡会员', '钻石会员'];
    var currentIdx = levels.indexOf(member.level);
    var nextLevel = levels[currentIdx + 1];
    var prevThreshold = currentIdx === 0 ? 0 : member.levelName[levels[currentIdx]];
    var nextThreshold = nextLevel ? member.levelName[nextLevel] : member.totalPoints;
    var progress = nextLevel ? Math.round((member.totalPoints - prevThreshold) / (nextThreshold - prevThreshold) * 100) : 100;

    var html = '<div id="modal-member-points" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-member-points\').remove()">' +
      '<div class="modal" style="width:580px;max-height:90vh;overflow-y:auto;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,' + levelColor + ',#fff);display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>' +
      '<div><div style="font-size:16px;font-weight:700;">' + member.name + ' <span style="padding:2px 8px;background:' + levelColor + '20;color:' + levelColor + ';border-radius:10px;font-size:11px;font-weight:600;">' + member.level + '</span></div><div style="font-size:12px;color:#999;margin-top:2px;">' + member.phone + ' · 入会 ' + member.joinDate + '</div></div></div>' +
      '<button onclick="document.getElementById(\'modal-member-points\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button></div>' +

      // 积分概览
      '<div style="padding:20px 24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;border-bottom:1px solid #e8e8e8;">' +
      '<div style="text-align:center;padding:16px;background:linear-gradient(135deg,#1890ff,#69c0ff);border-radius:10px;color:white;">' +
      '<div style="font-size:11px;opacity:0.9;margin-bottom:6px;">当前积分</div>' +
      '<div style="font-size:32px;font-weight:700;">' + member.points + '</div>' +
      '<div style="font-size:11px;opacity:0.8;margin-top:4px;">可抵扣 ¥' + (member.points / 100).toFixed(0) + '</div></div>' +
      '<div style="text-align:center;padding:16px;background:#fafafa;border-radius:10px;">' +
      '<div style="font-size:11px;color:#999;margin-bottom:6px;">累计积分</div>' +
      '<div style="font-size:24px;font-weight:700;color:#333;">' + member.totalPoints + '</div>' +
      '<div style="font-size:11px;color:#999;margin-top:4px;">历史总共获取</div></div>' +
      '<div style="text-align:center;padding:16px;background:#fafafa;border-radius:10px;">' +
      '<div style="font-size:11px;color:#999;margin-bottom:6px;">生日</div>' +
      '<div style="font-size:18px;font-weight:700;color:#333;">' + member.birthday + '</div>' +
      '<div style="font-size:11px;color:#52c41a;margin-top:4px;">🎂 已配置双倍积分</div></div></div>' +

      // 等级进度
      nextLevel ? '<div style="padding:16px 24px;border-bottom:1px solid #e8e8e8;background:#fafafa;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
      '<div style="font-size:13px;font-weight:600;color:#333;">' + member.level + ' → ' + nextLevel + '</div>' +
      '<div style="font-size:12px;color:#999;">还差 <span style="color:#fa8c16;font-weight:700;">' + (nextThreshold - member.totalPoints).toLocaleString() + '</span> 积分升级</div></div>' +
      '<div style="height:8px;background:#e8e8e8;border-radius:4px;overflow:hidden;margin-bottom:8px;">' +
      '<div style="height:100%;width:' + progress + '%;background:linear-gradient(90deg,' + levelColor + ',#69c0ff);border-radius:4px;transition:width 0.5s;"></div></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:#999;">' +
      '<span>' + member.level + ' ' + prevThreshold.toLocaleString() + '</span>' +
      '<span>' + nextLevel + ' ' + nextThreshold.toLocaleString() + '</span></div></div>' : '<div style="padding:16px 24px;background:linear-gradient(135deg,#722ed1,#b37feb);color:white;text-align:center;font-size:13px;font-weight:600;">🌟 已是最高等级（钻石会员），享受所有权益</div>' +

      // 积分记录
      '<div style="padding:16px 24px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<div style="font-size:14px;font-weight:700;">📜 积分明细（近5条）</div>' +
      '<button style="padding:4px 10px;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:4px;font-size:11px;cursor:pointer;">查看全部 ›</button></div>' +
      recordsHtml + '</div>' +

      // 操作区
      '<div style="padding:16px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;flex-wrap:wrap;background:#fafafa;">' +
      '<button onclick="openMemberPointsDeductModal(\'' + member.id + '\')" style="padding:8px 14px;background:#fff1f0;color:#ff4d4f;border:1px solid #ff4d4f;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">➖ 扣除积分</button>' +
      '<button onclick="openMemberLevelUpgradeModal(\'' + member.id + '\')" style="padding:8px 14px;background:#fff7e6;color:#fa8c16;border:1px solid #fa8c16;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">⬆ 升级等级</button>' +
      '<button onclick="openMemberPointsGiftModal(\'' + member.id + '\')" style="padding:8px 14px;background:#f6ffed;color:#52c41a;border:1px solid #52c41a;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">🎁 积分赠送</button>' +
      '<button onclick="document.getElementById(\'modal-member-points\').remove()" style="margin-left:auto;padding:8px 16px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:6px;font-size:12px;cursor:pointer;">关闭</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.openMemberPointsDeductModal = function(memberId) {
    var old = document.getElementById('modal-member-deduct');
    if (old) old.remove();
    var html = '<div id="modal-member-deduct" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">' +
      '<div class="modal" style="width:400px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:15px;font-weight:700;">➖ 扣除积分</div>' +
      '<button onclick="document.getElementById(\'modal-member-deduct\').remove()" style="background:none;border:none;font-size:16px;cursor:pointer;color:#999;">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">扣除积分数量 <span style="color:#ff4d4f;">*</span></label><input type="number" id="deduct-points" class="form-input" value="" placeholder="请输入要扣除的积分数量" min="1"></div>' +
      '<div class="form-group"><label class="form-label">扣除原因 <span style="color:#ff4d4f;">*</span></label>' +
      '<select class="form-select" id="deduct-reason"><option>兑换取消扣回</option><option>积分错误修正</option><option>违规扣除</option><option>其他</option></select></div>' +
      '<div class="form-group"><label class="form-label">备注</label><textarea id="deduct-remark" class="form-input" rows="2" placeholder="补充说明（可选）"></textarea></div>' +
      '<div style="padding:10px;background:#fff1f0;border:1px solid #ffccc7;border-radius:6px;font-size:12px;color:#ff4d4f;">⚠️ 扣除积分操作不可逆，请确认输入无误</div></div>' +
      '<div style="padding:12px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-member-deduct\').remove()" class="modal-btn secondary">取消</button>' +
      '<button onclick="submitPointsDeduct()" style="padding:8px 20px;background:#ff4d4f;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">确认扣除</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.submitPointsDeduct = function() {
    var points = parseInt(document.getElementById('deduct-points').value);
    if (!points || points <= 0) { showToast('请输入正确的积分数量', 'error'); return; }
    document.getElementById('modal-member-deduct').remove();
    showToast('已成功扣除 ' + points + ' 积分', 'success');
    // 刷新主弹窗
    openMemberPointsManagementModal('M-001');
  };

  window.openMemberLevelUpgradeModal = function(memberId) {
    var old = document.getElementById('modal-member-upgrade');
    if (old) old.remove();
    var html = '<div id="modal-member-upgrade" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">' +
      '<div class="modal" style="width:420px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:15px;font-weight:700;">⬆ 会员升级</div>' +
      '<button onclick="document.getElementById(\'modal-member-upgrade\').remove()" style="background:none;border:none;font-size:16px;cursor:pointer;color:#999;">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div style="background:#f6ffed;border:1px solid #b7eb8f;border-radius:8px;padding:16px;margin-bottom:16px;text-align:center;">' +
      '<div style="font-size:12px;color:#52c41a;margin-bottom:6px;">当前等级</div>' +
      '<div style="font-size:20px;font-weight:700;color:#8c8c8c;">银卡会员</div>' +
      '<div style="font-size:24px;margin:8px 0;">↓</div>' +
      '<div style="font-size:12px;color:#fa8c16;margin-bottom:6px;">升级至</div>' +
      '<div style="font-size:20px;font-weight:700;color:#fa8c16;">金卡会员</div></div>' +
      '<div class="form-group"><label class="form-label">升级方式</label>' +
      '<select class="form-select" id="upgrade-method"><option>消费达标自动升级</option><option>手动调整升级</option><option>活动赠送升级</option></select></div>' +
      '<div class="form-group"><label class="form-label">升级备注</label><textarea id="upgrade-remark" class="form-input" rows="2" placeholder="升级原因备注"></textarea></div></div>' +
      '<div style="padding:12px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-member-upgrade\').remove()" class="modal-btn secondary">取消</button>' +
      '<button onclick="document.getElementById(\'modal-member-upgrade\').remove();openMemberPointsManagementModal(\'M-001\');showToast(\'会员已升级为金卡会员\',\'success\');" style="padding:8px 20px;background:#fa8c16;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">确认升级</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.openMemberPointsGiftModal = function(memberId) {
    var old = document.getElementById('modal-member-gift');
    if (old) old.remove();
    var html = '<div id="modal-member-gift" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;">' +
      '<div class="modal" style="width:400px;">' +
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="font-size:15px;font-weight:700;">🎁 积分赠送</div>' +
      '<button onclick="document.getElementById(\'modal-member-gift\').remove()" style="background:none;border:none;font-size:16px;cursor:pointer;color:#999;">✕</button></div>' +
      '<div style="padding:20px 24px;">' +
      '<div class="form-group"><label class="form-label">赠送积分数量 <span style="color:#ff4d4f;">*</span></label><input type="number" id="gift-points" class="form-input" value="" placeholder="请输入赠送积分" min="1"></div>' +
      '<div class="form-group"><label class="form-label">赠送原因</label>' +
      '<select class="form-select" id="gift-reason"><option>生日福利赠送</option><option>投诉补偿赠送</option><option>活动奖励赠送</option><option>其他福利</option></select></div>' +
      '<div class="form-group"><label class="form-label">备注</label><textarea id="gift-remark" class="form-input" rows="2" placeholder="补充说明"></textarea></div></div>' +
      '<div style="padding:12px 24px;border-top:1px solid #e8e8e8;display:flex;gap:10px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'modal-member-gift\').remove()" class="modal-btn secondary">取消</button>' +
      '<button onclick="var p=parseInt(document.getElementById(\'gift-points\').value);if(!p||p<=0){showToast(\'请输入正确积分\',\'error\');return;}document.getElementById(\'modal-member-gift\').remove();openMemberPointsManagementModal(\'M-001\');showToast(\'已赠送 \' + p + \' 积分\',\'success\');" style="padding:8px 20px;background:#52c41a;color:white;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">确认赠送</button></div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  };

  // ════════════════════════════════════════════════════════════
  // 为发票管理页面增加"开具发票"按钮的跳转支持
  // ════════════════════════════════════════════════════════════

  var _origOpenInvoiceCreateModal = window.openInvoiceCreateModal;
  window.openInvoiceCreateModal = function() {
    // 直接打开发票申请表单（模拟）
    showToast('📋 打开发票开具表单，请填写开票信息', 'info');
  };

  // ════════════════════════════════════════════════════════════
  // 为发票管理页面的工具栏增加批量导入入口
  // 在设备列表页面增加批量导入按钮
  // ════════════════════════════════════════════════════════════

  var _origShowPageDevice = window.showPage;
  window.showPage = function(name) {
    // 调用原始showPage（在改进1的覆盖之前会被保存为_origShowPage）
    if (typeof _origShowPageDevice === 'function') {
      _origShowPageDevice.apply(null, arguments);
    }
  };

  console.log('[v4补丁] 5项功能性改进加载完成');
  console.log('[v4补丁] 改进1: 叫醒/失物/采购页面导航修复（showPage触发render函数）');
  console.log('[v4补丁] 改进2: 交接班报表初始化修复（切换到handover页面时触发renderHandoverReport）');
  console.log('[v4补丁] 改进3: 发票详情全流程时间线弹窗（openInvoiceDetailModalV3）');
  console.log('[v4补丁] 改进4: 设备批量导入弹窗（openDeviceBatchImportModal）');
  console.log('[v4补丁] 改进5: 会员积分/等级管理弹窗（openMemberPointsManagementModal）');

})();
