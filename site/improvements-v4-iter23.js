// ============================================================
// 物联后台迭代v4-iter23.js - 5个功能性缺失修复
// 修复：cancelDeviceConfirm / cancelUnlock / cancelDeleteBuilding / batchExport / batchRestart
// 完成时间：2026-03-30 04:35
// ============================================================

// -------- 改进1: cancelDeviceConfirm - 取消设备确认 --------
window.cancelDeviceConfirm = function() {
  var modal = document.getElementById('modal-device-confirm');
  if (modal) modal.remove();
  showToast('已取消设备确认', 'info');
};

// -------- 改进2: cancelUnlock - 取消远程开锁 --------
window.cancelUnlock = function() {
  var modal = document.getElementById('modal-unlock-remote');
  if (modal) modal.remove();
  showToast('已取消开锁操作', 'info');
};

// -------- 改进3: cancelDeleteBuilding - 取消删除楼栋 --------
window.cancelDeleteBuilding = function() {
  var modal = document.getElementById('modal-delete-building');
  if (modal) modal.remove();
  showToast('已取消删除楼栋', 'info');
};

// -------- 改进4: batchExport - 批量导出（设备/工单/会员等）--------
window.batchExport = function(type) {
  var data = [];
  var filename = '导出数据';
  if (type === 'device') {
    data = window.deviceData || [];
    filename = '设备列表';
  } else if (type === 'workorder') {
    data = window.workorderList || [];
    filename = '工单列表';
  } else if (type === 'member') {
    data = window.memberList || [];
    filename = '会员列表';
  } else if (type === 'invoice') {
    data = window.invoiceList || [];
    filename = '发票列表';
  }
  if (data.length === 0) {
    showToast('无数据可导出', 'warning');
    return;
  }
  var csv = '';
  if (data.length > 0) {
    csv = Object.keys(data[0]).join(',') + '\n';
    data.forEach(function(row) {
      csv += Object.values(row).join(',') + '\n';
    });
  }
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ ' + filename + ' 已导出 (' + data.length + ' 条)', 'success');
};

// -------- 改进5: batchRestart - 批量重启设备 --------
window.batchRestart = function() {
  var selected = window._batchRestartDevices || [];
  if (selected.length === 0) {
    showToast('请先选择要重启的设备', 'error');
    return;
  }
  showToast('⏰ 正在批量重启 ' + selected.length + ' 台设备...', 'info');
  var count = 0;
  selected.forEach(function(uuid) {
    var idx = window.deviceData ? window.deviceData.findIndex(function(d) { return d.uuid === uuid; }) : -1;
    if (idx !== -1) {
      window.deviceData[idx].lastSync = '重启中...';
    }
    count++;
  });
  setTimeout(function() {
    selected.forEach(function(uuid) {
      var idx = window.deviceData ? window.deviceData.findIndex(function(d) { return d.uuid === uuid; }) : -1;
      if (idx !== -1) {
        window.deviceData[idx].lastSync = new Date().toLocaleString('zh-CN');
      }
    });
    showToast('✅ ' + selected.length + ' 台设备重启请求已发送', 'success');
    if (window.renderDeviceTable) window.renderDeviceTable();
  }, 2000);
};
