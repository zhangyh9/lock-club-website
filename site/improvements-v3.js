
// ============================================================
// 【改进v3-A】退房超时自动转全天计费确认弹窗（多步流程）
// 理由：原系统对超时退房只做简单提示，迭代指南要求"超时自动转全天计费需用户确认"。
// 新增多步确认弹窗：Step1展示超时详情和费用计算 → Step2选择处理方式 → Step3确认提交。
// 功能完整闭环：费用预览 → 客人沟通记录 → 确认执行。
// ============================================================
var checkoutOvertimeCache = [
  {id:'COT-001', room:'302', guest:'李四', type:'亲子间', shouldTime:'12:00', actualTime:'14:30', overdueHours:2.5, roomRate:128, electricFee:8.5, fullDayRate:128, total:136.5, status:'pending'},
  {id:'COT-002', room:'205', guest:'赵六', type:'大床房', shouldTime:'12:00', actualTime:'13:00', overdueHours:1, roomRate:108, electricFee:3.2, fullDayRate:108, total:111.2, status:'pending'},
  {id:'COT-003', room:'106', guest:'吴十', type:'标准间', shouldTime:'12:00', actualTime:'16:45', overdueHours:4.75, roomRate:98, electricFee:15.0, fullDayRate:98, total:113.0, status:'pending'}
];

function openCheckoutOvertimeModal(idx) {
  var existing = document.getElementById('modal-checkout-overtime');
  if (existing) existing.remove();
  var item = checkoutOvertimeCache[idx !== undefined ? idx : 0];
  if (!item) return;

  var step = 1;
  renderOvertimeStep(item, step);

  window._cotItem = item;
  window._cotStep = 1;
}

function renderOvertimeStep(item, step) {
  var m = document.getElementById('modal-checkout-overtime');
  if (m) m.remove();

  var overlay = document.createElement('div');
  overlay.id = 'modal-checkout-overtime';
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';

  var content = document.createElement('div');
  content.style = 'width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;';

  if (step === 1) {
    content.innerHTML = renderOvertimeStep1(item);
  } else if (step === 2) {
    content.innerHTML = renderOvertimeStep2(item);
  } else if (step === 3) {
    content.innerHTML = renderOvertimeStep3(item);
  }

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

function renderOvertimeStep1(item) {
  var badge = item.overdueHours >= 4 ? '🔴 严重超时' : item.overdueHours >= 2 ? '🟡 超时较长' : '🟠 超时';
  var badgeColor = item.overdueHours >= 4 ? 'var(--red)' : item.overdueHours >= 2 ? 'var(--orange)' : 'var(--orange)';
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:22px;">⏰</div>' +
    '<div><div style="font-size:15px;font-weight:700;">退房超时费用确认</div><div style="font-size:11px;color:var(--text-muted);">第1步 / 共3步</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-checkout-overtime\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +
    // 告警横幅
    '<div style="padding:12px 14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:20px;">⚠️</div>' +
    '<div><div style="font-size:13px;font-weight:700;color:var(--red);">' + badge + '</div>' +
    '<div style="font-size:12px;color:var(--red);">房间 ' + item.room + ' 退房超时 <b>' + item.overdueHours.toFixed(1) + '</b> 小时</div></div></div>' +

    // 客人信息卡
    '<div style="padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:14px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">' +
    '<div><span style="color:var(--text-muted);">房间：</span><b>' + item.room + ' · ' + item.type + '</b></div>' +
    '<div><span style="color:var(--text-muted);">客人：</span><b>' + item.guest + '</b></div>' +
    '<div><span style="color:var(--text-muted);">应退时间：</span><b style="color:var(--red);">' + item.shouldTime + '</b></div>' +
    '<div><span style="color:var(--text-muted);">实际时间：</span><b style="color:var(--orange);">' + item.actualTime + '</b></div></div></div>' +

    // 费用明细
    '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">💰 超时费用计算</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">' +
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:10px 12px;background:var(--bg);font-size:11px;font-weight:600;color:var(--text-muted);">' +
    '<div>费用项</div><div style="text-align:right;">单价</div><div style="text-align:right;">小计</div></div>' +
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;">' +
    '<div>基本超时费（≤2h）</div><div style="text-align:right;color:var(--text-muted);">¥' + (item.roomRate * 0.5).toFixed(0) + '/h</div><div style="text-align:right;font-weight:600;">¥' + (Math.min(item.overdueHours, 2) * item.roomRate * 0.5).toFixed(1) + '</div></div>' +
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;">' +
    '<div>超出部分（>2h）</div><div style="text-align:right;color:var(--text-muted);">¥' + item.fullDayRate + '/h</div><div style="text-align:right;font-weight:600;color:var(--orange);">¥' + (Math.max(0, item.overdueHours - 2) * item.fullDayRate).toFixed(1) + '</div></div>' +
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;">' +
    '<div>加收电费</div><div style="text-align:right;color:var(--text-muted);">实际</div><div style="text-align:right;font-weight:600;">¥' + item.electricFee.toFixed(1) + '</div></div>' +
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:10px 12px;background:var(--blue-bg);font-size:13px;font-weight:700;">' +
    '<div>合计应收</div><div style="text-align:right;"></div><div style="text-align:right;color:var(--blue);">¥' + item.total.toFixed(1) + '</div></div></div>' +

    // 温馨提示
    '<div style="padding:10px 12px;background:var(--orange-bg);border-radius:6px;font-size:12px;color:var(--orange);margin-bottom:16px;">' +
    '💡 根据酒店规定：超时 2 小时以内按半天房价计费，超出 2 小时按全天房价计费。电费另计。</div>' +

    // 按钮
    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-checkout-overtime\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="window._cotStep=2;renderOvertimeStep(window._cotItem,2)" class="modal-btn primary" style="padding:8px 20px;background:var(--orange);border-color:var(--orange);color:white;">下一步 →</button></div>' +
    '</div></div>';
}

function renderOvertimeStep2(item) {
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:22px;">📋</div>' +
    '<div><div style="font-size:15px;font-weight:700;">选择处理方式</div><div style="font-size:11px;color:var(--text-muted);">第2步 / 共3步</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-checkout-overtime\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">请选择对房间 ' + item.room + ' (' + item.guest + ') 的处理方式</div>' +

    '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">' +

    '<div onclick="selectOvertimeOption(this,\'full\')" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;transition:0.2s;" data-option="full">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
    '<div style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;" id="opt-full-radio"></div>' +
    '<div style="font-size:14px;font-weight:700;">🏠 按全天房价计费</div>' +
    '<div style="margin-left:auto;font-size:14px;font-weight:700;color:var(--blue);">¥' + item.total.toFixed(1) + '</div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);padding-left:28px;">适用于超时 2 小时以上的住客，系统将自动加收全天房费</div></div>' +

    '<div onclick="selectOvertimeOption(this,\'half\')" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;transition:0.2s;" data-option="half">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
    '<div style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;" id="opt-half-radio"></div>' +
    '<div style="font-size:14px;font-weight:700;">⏳ 按半天房价计费</div>' +
    '<div style="margin-left:auto;font-size:14px;font-weight:700;color:var(--orange);">¥' + (item.roomRate * 0.5 + item.electricFee).toFixed(1) + '</div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);padding-left:28px;">特殊情况减免，经经理授权后可执行</div></div>' +

    '<div onclick="selectOvertimeOption(this,\'free\')" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;transition:0.2s;" data-option="free">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
    '<div style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;" id="opt-free-radio"></div>' +
    '<div style="font-size:14px;font-weight:700;">🎁 免收超时费</div>' +
    '<div style="margin-left:auto;font-size:14px;font-weight:700;color:var(--green);">¥0</div></div>' +
    '<div style="font-size:12px;color:var(--text-muted);padding-left:28px;">VIP客人/会员权益/酒店责任等原因，需填写备注</div></div>' +

    '</div>' +

    '<div class="form-group" style="margin-bottom:16px;">' +
    '<label class="form-label">备注说明 <span style="color:var(--red);">*</span></label>' +
    '<textarea class="form-textarea" id="cot-reason" placeholder="请输入处理原因备注（如：客人钻石会员，享受免费延迟退房权益）" style="font-size:12px;min-height:60px;"></textarea></div>' +

    '<div class="form-group" style="margin-bottom:16px;">' +
    '<label class="form-label">客人沟通记录</label>' +
    '<textarea class="form-textarea" id="cot-communication" placeholder="记录与客人沟通情况（选填）" style="font-size:12px;min-height:40px;"></textarea></div>' +

    '<div style="display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="window._cotStep=1;renderOvertimeStep(window._cotItem,1)" class="modal-btn secondary" style="padding:8px 16px;">← 上一步</button>' +
    '<div style="display:flex;gap:10px;">' +
    '<button onclick="document.getElementById(\'modal-checkout-overtime\').remove()" class="modal-btn secondary" style="padding:8px 16px;">取消</button>' +
    '<button onclick="window._cotStep=3;renderOvertimeStep(window._cotItem,3)" class="modal-btn primary" style="padding:8px 20px;background:var(--orange);border-color:var(--orange);color:white;">下一步 →</button></div></div>' +
    '</div></div>';
}

function renderOvertimeStep3(item) {
  var reason = document.getElementById('cot-reason') ? document.getElementById('cot-reason').value : '';
  return '<div style="padding:0;">' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div style="font-size:22px;">✅</div>' +
    '<div><div style="font-size:15px;font-weight:700;">确认提交</div><div style="font-size:11px;color:var(--text-muted);">第3步 / 共3步</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-checkout-overtime\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +

    // 确认汇总
    '<div style="padding:14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:10px;margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--blue);margin-bottom:10px;">📋 提交确认</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
    '<div><span style="color:var(--text-muted);">房间：</span><b>' + item.room + '</b></div>' +
    '<div><span style="color:var(--text-muted);">客人：</span><b>' + item.guest + '</b></div>' +
    '<div><span style="color:var(--text-muted);">超时时长：</span><b style="color:var(--orange);">' + item.overdueHours.toFixed(1) + ' 小时</b></div>' +
    '<div><span style="color:var(--text-muted);">处理方式：</span><b style="color:var(--blue);">按全天房价计费</b></div></div>' +
    '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--blue);font-size:12px;"><span style="color:var(--text-muted);">应付金额：</span><b style="font-size:16px;color:var(--blue);">¥' + item.total.toFixed(1) + '</b></div></div>' +

    // 备注预览
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;font-size:12px;">' +
    '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">📝 备注说明</div>' +
    '<div style="color:var(--text);">' + (reason || '<span style="color:var(--text-muted);">（无备注）</span>') + '</div></div>' +

    // 打印小票预览
    '<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:16px;font-size:11px;font-family:monospace;color:var(--text-muted);">' +
    '<div style="text-align:center;font-weight:700;font-size:13px;color:var(--text);margin-bottom:6px;">===== 退房超时通知单 =====</div>' +
    '<div>房间号：' + item.room + ' &nbsp; 客人：' + item.guest + '</div>' +
    '<div>应退时间：' + item.shouldTime + ' &nbsp; 实际：' + item.actualTime + '</div>' +
    '<div>超时费：¥' + item.total.toFixed(1) + ' &nbsp; 操作人：当前员工</div>' +
    '<div>时间：' + new Date().toLocaleString('zh-CN') + '</div>' +
    '<div style="text-align:center;margin-top:4px;">============================</div></div>' +

    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">' +
    '<input type="checkbox" id="cot-confirm-check" style="accent-color:var(--blue);width:16px;height:16px;">' +
    '<label for="cot-confirm-check" style="font-size:12px;cursor:pointer;">我确认已与客人沟通并达成一致，提交此超时费用</label></div>' +

    '<div style="display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="window._cotStep=2;renderOvertimeStep(window._cotItem,2)" class="modal-btn secondary" style="padding:8px 16px;">← 上一步</button>' +
    '<div style="display:flex;gap:10px;">' +
    '<button onclick="printOvertimeNotice()" style="padding:8px 14px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;">🖨️ 打印</button>' +
    '<button onclick="submitOvertimeCheckout()" class="modal-btn primary" style="padding:8px 20px;background:var(--blue);border-color:var(--blue);color:white;">✅ 确认提交</button></div></div>' +
    '</div></div>';
}

function selectOvertimeOption(el, option) {
  document.querySelectorAll('[data-option]').forEach(function(d) {
    d.style.borderColor = 'var(--border)';
    d.querySelector('div > div:first-child').style.borderColor = 'var(--border)';
    d.querySelector('div > div:first-child').innerHTML = '';
  });
  el.style.borderColor = 'var(--blue)';
  var radio = el.querySelector('div > div:first-child');
  radio.style.borderColor = 'var(--blue)';
  radio.style.background = 'var(--blue)';
  radio.innerHTML = '<div style="width:8px;height:8px;background:white;border-radius:50%;margin:3px;"></div>';
  window._cotSelectedOption = option;
}

function printOvertimeNotice() {
  var item = window._cotItem;
  var reason = document.getElementById('cot-reason') ? document.getElementById('cot-reason').value : '';
  var printContent = '===== 领锁智慧酒店 退房超时通知单 =====\n' +
    '房间号：' + item.room + '\n' +
    '客人姓名：' + item.guest + '\n' +
    '应退时间：' + item.shouldTime + '\n' +
    '实际退房：' + item.actualTime + '\n' +
    '超时时长：' + item.overdueHours.toFixed(1) + ' 小时\n' +
    '超时费用：¥' + item.total.toFixed(1) + '\n' +
    '备注：' + (reason || '无') + '\n' +
    '操作人：当前员工\n' +
    '打印时间：' + new Date().toLocaleString('zh-CN') + '\n' +
    '======================================';
  var pw = window.open('', '_blank', 'width=380,height=500');
  pw.document.write('<html><head><title>退房超时通知单</title></head><body style="font-family:monospace;font-size:12px;padding:16px;">' +
    '<pre>' + printContent + '</pre></body></html>');
  pw.document.close();
  showToast('正在打印...', 'info');
}

function submitOvertimeCheckout() {
  var confirmed = document.getElementById('cot-confirm-check');
  if (!confirmed || !confirmed.checked) {
    showToast('请勾选确认框', 'error');
    return;
  }
  var item = window._cotItem;
  if (item) item.status = 'done';
  var m = document.getElementById('modal-checkout-overtime');
  if (m) m.remove();
  showToast('✅ 退房超时费用已确认收取 ¥' + (item ? item.total.toFixed(1) : '0') + '，打印小票已弹出', 'success');
}

// ============================================================
// 【改进v3-B】押金退款多步流程弹窗
// 理由：原系统押金退款操作过于简单，迭代指南要求完整的押金退款流程。
// 新增押金退款多步流程：Step1选择退款方式 → Step2确认金额和账户信息 → Step3处理中动画 → Step4成功。
// 完整闭环：退款方式选择 → 账户确认 → 密码验证 → 处理中 → 完成。
// ============================================================
function openDepositRefundWizardModal(idx) {
  var existing = document.getElementById('modal-deposit-refund-wizard');
  if (existing) existing.remove();
  window._drIdx = idx;
  window._drStep = 1;
  renderDepositRefundStep(1);
}

function renderDepositRefundStep(step) {
  var m = document.getElementById('modal-deposit-refund-wizard');
  if (m) m.remove();

  var overlay = document.createElement('div');
  overlay.id = 'modal-deposit-refund-wizard';
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';

  var content = document.createElement('div');
  content.style = 'width:480px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;';

  if (step === 1) content.innerHTML = getDepositRefundStep1();
  else if (step === 2) content.innerHTML = getDepositRefundStep2();
  else if (step === 3) content.innerHTML = getDepositRefundStep3();
  else if (step === 4) content.innerHTML = getDepositRefundStep4();

  overlay.appendChild(content);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function getDepositRefundStep1() {
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">💳</div>' +
    '<div><div style="font-size:15px;font-weight:700;">押金退款</div><div style="font-size:11px;color:var(--text-muted);">第1步：选择退款方式</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-deposit-refund-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);">退款金额</div>' +
    '<div style="font-size:28px;font-weight:800;color:var(--blue);">¥100</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">房间 301 · 张三</div></div>' +

    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">请选择退款方式</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' +

    '<div onclick="selectRefundMethod(this,\'wechat\')" class="refund-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div class="refund-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">💚 微信退款</div>' +
    '<div style="margin-left:auto;font-size:11px;color:var(--text-muted);">1-3个工作日到账</div></div></div>' +

    '<div onclick="selectRefundMethod(this,\'alipay\')" class="refund-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div class="refund-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">🔵 支付宝退款</div>' +
    '<div style="margin-left:auto;font-size:11px;color:var(--text-muted);">即时到账</div></div></div>' +

    '<div onclick="selectRefundMethod(this,\'cash\')" class="refund-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div class="refund-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">💵 现金退款</div>' +
    '<div style="margin-left:auto;font-size:11px;color:var(--text-muted);">前台直接退还</div></div></div>' +

    '<div onclick="selectRefundMethod(this,\'card\')" class="refund-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div class="refund-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">💳 原卡退款</div>' +
    '<div style="margin-left:auto;font-size:11px;color:var(--text-muted);">3-7个工作日到账</div></div></div>' +
    '</div>' +

    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-deposit-refund-wizard\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="renderDepositRefundStep(2)" class="modal-btn primary" style="padding:8px 24px;background:var(--blue);border-color:var(--blue);color:white;">下一步 →</button></div>' +
    '</div></div>';
}

function getDepositRefundStep2() {
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🔐</div>' +
    '<div><div style="font-size:15px;font-weight:700;">押金退款</div><div style="font-size:11px;color:var(--text-muted);">第2步：确认账户信息</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-deposit-refund-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);">确认退款金额</div>' +
    '<div style="font-size:28px;font-weight:800;color:var(--green);">¥100.00</div></div>' +

    '<div class="form-group" style="margin-bottom:12px;">' +
    '<label class="form-label">退款方式</label>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:13px;font-weight:600;" id="dr-method-display">💚 微信退款</div></div>' +

    '<div class="form-group" style="margin-bottom:12px;">' +
    '<label class="form-label">账户信息</label>' +
    '<input type="text" class="form-input" id="dr-account" placeholder="请输入微信号/支付宝账号/银行卡号" value="138****8888" style="font-size:13px;"></input></div>' +

    '<div class="form-group" style="margin-bottom:12px;">' +
    '<label class="form-label">户名（收款人）</label>' +
    '<input type="text" class="form-input" id="dr-account-name" placeholder="请输入户名" value="张三" style="font-size:13px;"></input></div>' +

    '<div class="form-group" style="margin-bottom:16px;">' +
    '<label class="form-label">操作密码 <span style="color:var(--red);">*</span></label>' +
    '<input type="password" class="form-input" id="dr-password" placeholder="请输入操作密码确认身份" style="font-size:13px;"></input>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">💡 测试密码：123456</div></div>' +

    '<div style="display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="renderDepositRefundStep(1)" class="modal-btn secondary" style="padding:8px 16px;">← 上一步</button>' +
    '<div style="display:flex;gap:10px;">' +
    '<button onclick="document.getElementById(\'modal-deposit-refund-wizard\').remove()" class="modal-btn secondary" style="padding:8px 16px;">取消</button>' +
    '<button onclick="verifyDepositRefundPassword()" class="modal-btn primary" style="padding:8px 24px;background:var(--green);border-color:var(--green);color:white;">确认退款 →</button></div></div>' +
    '</div></div>';
}

function getDepositRefundStep3() {
  return '<div>' +
    '<div style="padding:40px 20px;text-align:center;">' +
    '<div id="dr-processing-animation" style="font-size:48px;margin-bottom:16px;">⏳</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px;">正在处理退款...</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">预计 3-5 秒完成</div>' +
    '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--bg);border-radius:20px;font-size:12px;color:var(--text-muted);">' +
    '<div style="width:8px;height:8px;background:var(--blue);border-radius:50%;animation:onlinePulse 1s ease-in-out infinite;"></div>' +
    '连接支付通道中</div></div>' +
    '</div>';
}

function getDepositRefundStep4() {
  return '<div style="padding:40px 20px;text-align:center;">' +
    '<div style="font-size:56px;margin-bottom:16px;">✅</div>' +
    '<div style="font-size:18px;font-weight:800;color:var(--green);margin-bottom:8px;">退款成功！</div>' +
    '<div style="font-size:14px;color:var(--text-muted);margin-bottom:20px;">¥100.00 已退回至您的账户</div>' +

    '<div style="display:inline-block;padding:16px 24px;background:var(--green-bg);border-radius:10px;text-align:left;margin-bottom:20px;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">退款明细</div>' +
    '<div style="font-size:13px;">💚 退款方式：微信</div>' +
    '<div style="font-size:13px;">📱 账户：138****8888</div>' +
    '<div style="font-size:13px;">⏰ 到账时间：1-3个工作日</div>' +
    '<div style="font-size:13px;">🆔 流水号：REF' + Math.floor(100000 + Math.random() * 900000) + '</div></div>' +

    '<div style="display:flex;gap:10px;justify-content:center;">' +
    '<button onclick="printDepositReceipt()" style="padding:8px 16px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:13px;cursor:pointer;">🖨️ 打印凭证</button>' +
    '<button onclick="document.getElementById(\'modal-deposit-refund-wizard\').remove();showToast(\'💳 退款完成，已通知财务系统\',\'success\')" class="modal-btn primary" style="padding:8px 24px;background:var(--green);border-color:var(--green);color:white;">完成</button></div>' +
    '</div>';
}

function selectRefundMethod(el, method) {
  document.querySelectorAll('.refund-method-option').forEach(function(d) {
    d.style.borderColor = 'var(--border)';
    d.querySelector('.refund-radio').style.cssText = 'width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;background:transparent;';
    d.querySelector('.refund-radio').innerHTML = '';
  });
  el.style.borderColor = 'var(--blue)';
  var radio = el.querySelector('.refund-radio');
  radio.style.borderColor = 'var(--blue)';
  radio.style.background = 'var(--blue)';
  radio.innerHTML = '<div style="width:8px;height:8px;background:white;border-radius:50%;margin:3px;"></div>';
  window._drMethod = method;
  var methodNames = {wechat:'💚 微信退款', alipay:'🔵 支付宝退款', cash:'💵 现金退款', card:'💳 原卡退款'};
  var display = document.getElementById('dr-method-display');
  if (display) display.textContent = methodNames[method] || method;
}

function verifyDepositRefundPassword() {
  var pwd = document.getElementById('dr-password');
  if (!pwd || pwd.value !== '123456') {
    showToast('⚠️ 操作密码错误（测试密码：123456）', 'error');
    return;
  }
  renderDepositRefundStep(3);
  setTimeout(function() { renderDepositRefundStep(4); }, 3500);
}

function printDepositReceipt() {
  var printContent = '===== 领锁智慧酒店 押金退款凭证 =====\n' +
    '退款金额：¥100.00\n' +
    '退款方式：微信\n' +
    '账户：138****8888\n' +
    '户名：张三\n' +
    '流水号：REF' + Math.floor(100000 + Math.random() * 900000) + '\n' +
    '操作人：当前员工\n' +
    '时间：' + new Date().toLocaleString('zh-CN') + '\n' +
    '======================================';
  var pw = window.open('', '_blank', 'width=380,height=400');
  pw.document.write('<html><head><title>押金退款凭证</title></head><body style="font-family:monospace;font-size:12px;padding:16px;"><pre>' + printContent + '</pre></body></html>');
  pw.document.close();
}

// ============================================================
// 【改进v3-C】交接班报表生成并发送弹窗
// 理由：原系统交接班报表只有查看功能，缺少生成、导出、发送给负责人的完整流程。
// 新增多步流程：选择班次和时间 → 生成报表预览 → 选择发送方式 → 发送确认 → 完成。
// 让交接班流程完整闭环，确保信息传达到位。
// ============================================================
function openHandoverWizardModal() {
  var existing = document.getElementById('modal-handover-wizard');
  if (existing) existing.remove();
  window._hwStep = 1;
  renderHandoverWizard(1);
}

function renderHandoverWizard(step) {
  var m = document.getElementById('modal-handover-wizard');
  if (m) m.remove();
  var overlay = document.createElement('div');
  overlay.id = 'modal-handover-wizard';
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
  var content = document.createElement('div');
  content.style = 'width:560px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;';
  if (step === 1) content.innerHTML = getHandoverWizardStep1();
  else if (step === 2) content.innerHTML = getHandoverWizardStep2();
  else if (step === 3) content.innerHTML = getHandoverWizardStep3();
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function getHandoverWizardStep1() {
  var today = new Date().toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'-');
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📊</div>' +
    '<div><div style="font-size:15px;font-weight:700;">交接班报表</div><div style="font-size:11px;color:var(--text-muted);">第1步：选择班次</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-handover-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div class="form-group"><label class="form-label">报表日期</label>' +
    '<input type="date" class="form-input" id="hw-date" value="' + today + '" style="font-size:13px;"></input></div>' +
    '<div class="form-group"><label class="form-label">班次</label>' +
    '<select class="form-select" id="hw-shift" style="font-size:13px;">' +
    '<option value="morning">早班 07:00-15:00</option>' +
    '<option value="afternoon">中班 15:00-23:00</option>' +
    '<option value="night">夜班 23:00-07:00</option></select></div></div>' +

    '<div class="form-group" style="margin-bottom:16px;"><label class="form-label">交班人</label>' +
    '<input type="text" class="form-input" id="hw-from-op" value="张丽" style="font-size:13px;"></input></div>' +

    '<div class="form-group" style="margin-bottom:16px;"><label class="form-label">接班人</label>' +
    '<input type="text" class="form-input" id="hw-to-op" placeholder="输入接班人姓名" style="font-size:13px;"></input></div>' +

    '<div style="padding:12px 14px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);margin-bottom:16px;">' +
    '💡 选择班次后，系统将自动汇总该班次内的入住/退房/工单/营收数据生成报表</div>' +

    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-handover-wizard\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="generateHandoverPreview()" class="modal-btn primary" style="padding:8px 24px;background:var(--blue);border-color:var(--blue);color:white;">📊 生成报表 →</button></div>' +
    '</div></div>';
}

function generateHandoverPreview() {
  var toOp = document.getElementById('hw-to-op');
  if (!toOp || !toOp.value.trim()) {
    showToast('请输入接班人姓名', 'error');
    return;
  }
  window._hwToOperator = toOp.value.trim();
  renderHandoverWizard(2);
}

function getHandoverWizardStep2() {
  var toOp = window._hwToOperator || '李明';
  var today = new Date().toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'-');
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📋</div>' +
    '<div><div style="font-size:15px;font-weight:700;">报表预览</div><div style="font-size:11px;color:var(--text-muted);">第2步：确认内容</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-handover-wizard\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +

    '<div style="padding:16px 20px;max-height:60vh;overflow-y:auto;">' +

    // 报表预览卡片
    '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px;">' +
    '<div style="padding:12px 14px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<div style="font-size:13px;font-weight:700;">📊 领锁智慧酒店 · 交接班报表</div>' +
    '<div style="font-size:11px;color:var(--text-muted);">' + today + ' 14:00</div></div>' +

    '<div style="padding:12px 14px;">' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;">' +
    '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:20px;font-weight:800;color:var(--blue);">5</div><div style="font-size:11px;color:var(--text-muted);">🏨 入住</div></div>' +
    '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:20px;font-weight:800;color:var(--green);">3</div><div style="font-size:11px;color:var(--text-muted);">🚪 退房</div></div>' +
    '<div style="text-align:center;padding:10px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:20px;font-weight:800;color:var(--orange);">2</div><div style="font-size:11px;color:var(--text-muted);">🛠️ 待办工单</div></div>' +
    '<div style="text-align:center;padding:10px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:20px;font-weight:800;color:var(--purple);">¥2,840</div><div style="font-size:11px;color:var(--text-muted);">💰 营收</div></div></div>' +

    '<div style="font-size:12px;font-weight:600;margin-bottom:6px;">📝 交接备注</div>' +
    '<div style="padding:10px;background:var(--bg);border-radius:6px;font-size:12px;margin-bottom:10px;min-height:40px;">305房间客人反映热水问题，已派工单；303设备离线持续工作中</div>' +

    '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">' +
    '<span>交班人：张丽</span><span>接班人：' + toOp + '</span></div></div></div>' +

    // 发送选项
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📨 发送方式</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">' +

    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="hw-send-feishu" checked style="accent-color:var(--blue);">💬 飞书消息通知接班人</label>' +

    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="hw-send-print" checked style="accent-color:var(--blue);">🖨️ 打印纸质报表</label>' +

    '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;">' +
    '<input type="checkbox" id="hw-send-email" style="accent-color:var(--blue);">📧 抄送管理员邮箱</label>' +
    '</div>' +

    '<div style="display:flex;gap:10px;justify-content:space-between;">' +
    '<button onclick="renderHandoverWizard(1)" class="modal-btn secondary" style="padding:8px 16px;">← 上一步</button>' +
    '<div style="display:flex;gap:10px;">' +
    '<button onclick="document.getElementById(\'modal-handover-wizard\').remove()" class="modal-btn secondary" style="padding:8px 16px;">取消</button>' +
    '<button onclick="sendHandoverReport()" class="modal-btn primary" style="padding:8px 24px;background:var(--blue);border-color:var(--blue);color:white;">📤 发送报表 →</button></div></div>' +
    '</div></div>';
}

function sendHandoverReport() {
  var sendFeishu = document.getElementById('hw-send-feishu') && document.getElementById('hw-send-feishu').checked;
  var sendPrint = document.getElementById('hw-send-print') && document.getElementById('hw-send-print').checked;
  var sendEmail = document.getElementById('hw-send-email') && document.getElementById('hw-send-email').checked;
  window._hwSendOptions = {feishu: sendFeishu, print: sendPrint, email: sendEmail};
  renderHandoverWizard(3);
}

function getHandoverWizardStep3() {
  var opts = window._hwSendOptions || {};
  return '<div style="padding:40px 20px;text-align:center;">' +
    '<div style="font-size:48px;margin-bottom:16px;">📤</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:8px;">正在发送交接班报表...</div>' +
    '<div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">正在处理各渠道发送</div>' +

    '<div style="display:flex;flex-direction:column;gap:8px;max-width:300px;margin:0 auto 20px;text-align:left;">' +
    '<div style="display:flex;align-items:center;gap:8px;font-size:12px;">' +
    '<div style="width:16px;height:16px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;">✓</div>' +
    '<span>生成报表PDF</span></div>' +
    (opts.feishu ? '<div style="display:flex;align-items:center;gap:8px;font-size:12px;">' +
    '<div style="width:16px;height:16px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;">✓</div>' +
    '<span>飞书消息通知接班人</span></div>' : '') +
    (opts.print ? '<div style="display:flex;align-items:center;gap:8px;font-size:12px;">' +
    '<div style="width:16px;height:16px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;">✓</div>' +
    '<span>打印纸质报表</span></div>' : '') +
    (opts.email ? '<div style="display:flex;align-items:center;gap:8px;font-size:12px;">' +
    '<div style="width:16px;height:16px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;">✓</div>' +
    '<span>抄送管理员邮箱</span></div>' : '') +
    '</div>' +

    '<div style="font-size:14px;font-weight:700;color:var(--green);">✅ 交接班报表已发送完成！</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;margin-bottom:20px;">接班人已收到飞书通知，请确认纸质签字交接</div>' +

    '<button onclick="document.getElementById(\'modal-handover-wizard\').remove();showToast(\'📊 交接完成！\',\'success\')" class="modal-btn primary" style="padding:10px 30px;background:var(--green);border-color:var(--green);color:white;">完成交接</button>' +
    '</div>';
}

// ============================================================
// 【改进v3-D】会员余额预警完整配置弹窗V3
// 理由：原系统余额预警只有简单开关，缺少实时文案预览、测试通知、预警历史查看等核心功能。
// 新增：实时文案预览（根据阈值实时显示预警短信样式）+ 预警规则测试功能 + 最近预警会员列表。
// 实现预警配置完整闭环：设置阈值 → 实时预览效果 → 发送测试 → 保存生效。
// ============================================================
function openMemberBalanceAlertConfigV3() {
  var existing = document.getElementById('modal-mb-config-v3');
  if (existing) existing.remove();
  var cfg = {threshold: 50, notifySms: true, notifyFeishu: true, notifyApp: false};
  try { var stored = localStorage.getItem('member_balance_alert_config'); if (stored) cfg = Object.assign(cfg, JSON.parse(stored)); } catch(e) {}
  window._mbCfg = cfg;

  var html = '<div class="modal-overlay" id="modal-mb-config-v3" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)this.remove()">';
  html += '<div style="width:580px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;">';

  // Header
  html += '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🔔</div>';
  html += '<div><div style="font-size:15px;font-weight:700;">会员余额预警配置 V3</div><div style="font-size:11px;color:var(--text-muted);">实时预览 · 测试通知 · 预警历史</div></div></div>';
  html += '<button onclick="document.getElementById(\'modal-mb-config-v3\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';

  html += '<div style="padding:16px 20px;">';

  // 实时预警开关
  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:14px;">';
  html += '<div><div style="font-size:13px;font-weight:600;">🔔 余额预警引擎</div><div style="font-size:11px;color:var(--text-muted);">关闭后所有余额预警暂停触发</div></div>';
  html += '<div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="toggleMbEngineV3(this)">';
  html += '<span id="mb-engine-label" style="font-size:12px;color:var(--green);font-weight:600;">已开启</span>';
  html += '<div style="width:40px;height:22px;background:var(--green);border-radius:11px;position:relative;">';
  html += '<div style="position:absolute;width:18px;height:18px;background:white;border-radius:50%;top:2px;right:2px;transition:0.3s;" id="mb-engine-knob"></div></div></div></div>';

  // 阈值设置
  html += '<div class="form-group" style="margin-bottom:14px;">';
  html += '<label class="form-label">预警余额阈值 <span style="color:var(--red);">*</span></label>';
  html += '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<input type="number" class="form-input" id="mb-threshold-v3" value="' + cfg.threshold + '" min="0" max="1000" style="font-size:14px;width:120px;" oninput="updateMbPreviewV3()">';
  html += '<span style="font-size:13px;color:var(--text-muted);">元（余额低于此值触发预警）</span></div></div>';

  // 通知方式
  html += '<div class="form-group" style="margin-bottom:14px;">';
  html += '<label class="form-label">通知方式</label>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:10px;">';
  html += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;"><input type="checkbox" id="mb-notify-sms-v3" ' + (cfg.notifySms ? 'checked' : '') + ' style="accent-color:var(--blue);">📱 短信通知</label>';
  html += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;"><input type="checkbox" id="mb-notify-feishu-v3" ' + (cfg.notifyFeishu ? 'checked' : '') + ' style="accent-color:var(--blue);">💬 飞书通知</label>';
  html += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;"><input type="checkbox" id="mb-notify-app-v3" ' + (cfg.notifyApp ? 'checked' : '') + ' style="accent-color:var(--blue);">📲 APP推送</label></div></div>';

  // 实时预览
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
  html += '<label class="form-label" style="margin:0;">📝 短信预览（实时）</label>';
  html += '<button onclick="sendMbTestNotificationV3()" style="padding:4px 10px;background:var(--orange-bg);color:var(--orange);border:1px solid var(--orange);border-radius:6px;font-size:11px;cursor:pointer;">🧪 发送测试</button></div>';
  html += '<div id="mb-preview-box" style="padding:12px;background:#f0f9eb;border:1px solid #b7eb8f;border-radius:8px;font-size:12px;color:#52c41a;line-height:1.7;min-height:60px;">';
  html += '【领锁智慧酒店】亲爱的会员，您的账户余额已低于 <b>50</b> 元，为避免影响入住体验，请及时充值。退订回T。</div></div>';

  // 最近预警列表
  html += '<div style="margin-bottom:14px;">';
  html += '<label class="form-label" style="margin-bottom:8px;display:block;">🚨 最近触发预警的会员</label>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  var recentAlerts = [
    {name:'张三', phone:'138****8888', level:'银卡会员', balance:28, alertTime:'今天 10:32', status:'已预警'},
    {name:'李四', phone:'137****5555', level:'金卡会员', balance:45, alertTime:'今天 09:15', status:'已预警'},
    {name:'王五', phone:'136****4444', level:'普通会员', balance:12, alertTime:'昨天 18:20', status:'余额不足'}
  ];
  recentAlerts.forEach(function(a) {
    var badgeColor = a.status === '余额不足' ? 'var(--red)' : 'var(--orange)';
    var badgeBg = a.status === '余额不足' ? 'var(--red-bg)' : 'var(--orange-bg)';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;">';
    html += '<span style="font-weight:600;width:50px;">' + a.name + '</span>';
    html += '<span style="font-size:11px;color:var(--text-muted);flex:1;">' + a.level + ' · 余额 ¥' + a.balance + '</span>';
    html += '<span style="font-size:11px;color:var(--text-muted);">' + a.alertTime + '</span>';
    html += '<span style="font-size:10px;padding:2px 6px;background:' + badgeBg + ';color:' + badgeColor + ';border-radius:4px;">' + a.status + '</span>';
    html += '<button onclick="openMemberRechargeModalV3(0)" style="padding:3px 8px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:4px;font-size:10px;cursor:pointer;">充值</button></div>';
  });
  html += '</div></div>';

  // Footer
  html += '<div style="display:flex;gap:10px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border);">';
  html += '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-mb-config-v3\').remove()">取消</button>';
  html += '<button class="modal-btn primary" onclick="saveMemberBalanceAlertConfigV3()">💾 保存配置</button></div>';

  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function updateMbPreviewV3() {
  var threshold = document.getElementById('mb-threshold-v3') ? document.getElementById('mb-threshold-v3').value : 50;
  var preview = document.getElementById('mb-preview-box');
  if (preview) {
    preview.innerHTML = '【领锁智慧酒店】亲爱的会员，您的账户余额已低于 <b>' + threshold + '</b> 元，为避免影响入住体验，请及时充值。退订回T。';
  }
}

function toggleMbEngineV3(el) {
  var label = document.getElementById('mb-engine-label');
  var knob = document.getElementById('mb-engine-knob');
  var isOn = label && label.textContent === '已开启';
  if (isOn) {
    if (label) { label.textContent = '已关闭'; label.style.color = 'var(--text-muted)'; }
    if (knob) { knob.style.right = 'auto'; knob.style.left = '2px'; knob.parentElement.style.background = 'var(--text-muted)'; }
  } else {
    if (label) { label.textContent = '已开启'; label.style.color = 'var(--green)'; }
    if (knob) { knob.style.left = 'auto'; knob.style.right = '2px'; knob.parentElement.style.background = 'var(--green)'; }
  }
}

function sendMbTestNotificationV3() {
  var threshold = document.getElementById('mb-threshold-v3') ? document.getElementById('mb-threshold-v3').value : 50;
  var notifySms = document.getElementById('mb-notify-sms-v3') && document.getElementById('mb-notify-sms-v3').checked;
  var notifyFeishu = document.getElementById('mb-notify-feishu-v3') && document.getElementById('mb-notify-feishu-v3').checked;
  var notifyApp = document.getElementById('mb-notify-app-v3') && document.getElementById('mb-notify-app-v3').checked;
  var methods = [];
  if (notifySms) methods.push('📱短信');
  if (notifyFeishu) methods.push('💬飞书');
  if (notifyApp) methods.push('📲APP');
  showToast('🧪 测试通知已发送！阈值：¥' + threshold + '，方式：' + (methods.length ? methods.join('+') : '未选择'), 'success');
}

function saveMemberBalanceAlertConfigV3() {
  var threshold = document.getElementById('mb-threshold-v3') ? document.getElementById('mb-threshold-v3').value : 50;
  var notifySms = document.getElementById('mb-notify-sms-v3') && document.getElementById('mb-notify-sms-v3').checked;
  var notifyFeishu = document.getElementById('mb-notify-feishu-v3') && document.getElementById('mb-notify-feishu-v3').checked;
  var notifyApp = document.getElementById('mb-notify-app-v3') && document.getElementById('mb-notify-app-v3').checked;
  try {
    localStorage.setItem('member_balance_alert_config', JSON.stringify({threshold: threshold, notifySms: notifySms, notifyFeishu: notifyFeishu, notifyApp: notifyApp}));
  } catch(e) {}
  document.getElementById('modal-mb-config-v3') && document.getElementById('modal-mb-config-v3').remove();
  showToast('🔔 余额预警配置已保存！阈值：¥' + threshold, 'success');
}

// ============================================================
// 【改进v3-E】楼栋房间数批量分配弹窗
// 理由：原系统楼栋管理缺少批量分配房间的功能，迭代指南要求"楼栋→楼层→房间"级联管理。
// 新增楼栋房间数批量分配弹窗：选择一个楼栋，自动按楼层均分房间数，支持自定义调整每层房间数。
// 功能：楼栋选择 → 房间数设置 → 楼层预览 → 确认分配 → 同步到房间列表。
// ============================================================
var buildingRoomAllocationData = [
  {id:'B01', name:'1号楼', floors:3, totalRooms:24, allocations:[{floor:1, rooms:8},{floor:2, rooms:8},{floor:3, rooms:8}]},
  {id:'B02', name:'2号楼', floors:2, totalRooms:16, allocations:[{floor:1, rooms:8},{floor:2, rooms:8}]}
];

function openBatchRoomAllocationModal() {
  var existing = document.getElementById('modal-batch-room-alloc');
  if (existing) existing.remove();

  var html = '<div class="modal-overlay" id="modal-batch-room-alloc" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)this.remove()">';
  html += '<div style="width:560px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;">';

  // Header
  html += '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🏢</div>';
  html += '<div><div style="font-size:15px;font-weight:700;">楼栋房间批量分配</div><div style="font-size:11px;color:var(--text-muted);">按楼层均分房间 · 支持自定义调整</div></div></div>';
  html += '<button onclick="document.getElementById(\'modal-batch-room-alloc\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';

  html += '<div style="padding:16px 20px;">';

  // Step 1: 选择楼栋
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">🏢 选择楼栋</div>';
  html += '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">';
  buildingRoomAllocationData.forEach(function(b, i) {
    html += '<div onclick="selectBuildingForAlloc(this,' + i + ')" class="alloc-building-option" style="padding:12px 16px;border:2px solid var(--border);border-radius:8px;cursor:pointer;min-width:120px;text-align:center;transition:0.2s;">';
    html += '<div style="font-size:14px;font-weight:700;">' + b.name + '</div>';
    html += '<div style="font-size:11px;color:var(--text-muted);">' + b.floors + '层 · ' + b.totalRooms + '间</div></div>';
  });
  html += '</div>';

  // Step 2: 总房间数
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📊 房间总数设置</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">';
  html += '<div class="form-group"><label class="form-label">总房间数</label>';
  html += '<input type="number" class="form-input" id="alloc-total-rooms" value="24" min="1" max="200" style="font-size:14px;" oninput="recalcFloorAllocationV2()"></div>';
  html += '<div class="form-group"><label class="form-label">楼层数</label>';
  html += '<input type="number" class="form-input" id="alloc-total-floors" value="3" min="1" max="20" style="font-size:14px;" oninput="recalcFloorAllocationV2()"></div></div>';

  // 楼层分配预览
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📋 楼层分配预览（均分）</div>';
  html += '<div id="alloc-floor-preview" style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;"></div>';

  // 生成按钮
  html += '<button onclick="generateFloorAllocationV2()" class="action-btn" style="width:100%;padding:10px;background:var(--blue-bg);color:var(--blue);border-color:var(--blue);border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:12px;">🔄 重新生成均分方案</button>';

  // 分配规则
  html += '<div class="form-group" style="margin-bottom:16px;">';
  html += '<label class="form-label">分配规则</label>';
  html += '<select class="form-select" id="alloc-rule" style="font-size:13px;">';
  html += '<option value="equal">均分（每层房间数相等）</option>';
  html += '<option value="first-larger">首层优先（首层房间数更多）</option>';
  html += '<option value="top-larger">顶层优先（顶层房间数更多）</option></select></div>';

  // Footer
  html += '<div style="display:flex;gap:10px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border);">';
  html += '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-batch-room-alloc\').remove()">取消</button>';
  html += '<button class="modal-btn primary" onclick="confirmBatchRoomAllocation()" style="background:var(--blue);border-color:var(--blue);color:white;">✅ 确认分配</button></div>';

  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);

  generateFloorAllocationV2();
}

function selectBuildingForAlloc(el, idx) {
  document.querySelectorAll('.alloc-building-option').forEach(function(d) {
    d.style.borderColor = 'var(--border)';
    d.style.background = 'white';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
  window._selectedAllocBuilding = idx;

  var b = buildingRoomAllocationData[idx];
  if (b) {
    var totalInput = document.getElementById('alloc-total-rooms');
    var floorsInput = document.getElementById('alloc-total-floors');
    if (totalInput) totalInput.value = b.totalRooms;
    if (floorsInput) floorsInput.value = b.floors;
    generateFloorAllocationV2();
  }
}

function generateFloorAllocationV2() {
  var totalRooms = parseInt(document.getElementById('alloc-total-rooms') ? document.getElementById('alloc-total-rooms').value : 24);
  var totalFloors = parseInt(document.getElementById('alloc-total-floors') ? document.getElementById('alloc-total-floors').value : 3);
  var rule = document.getElementById('alloc-rule') ? document.getElementById('alloc-rule').value : 'equal';

  var preview = document.getElementById('alloc-floor-preview');
  if (!preview) return;

  var base = Math.floor(totalRooms / totalFloors);
  var remainder = totalRooms % totalFloors;
  var allocations = [];

  for (var i = 0; i < totalFloors; i++) {
    var rooms = base + (i < remainder ? 1 : 0);
    if (rule === 'first-larger' && i === 0) rooms += Math.ceil(remainder / 2);
    if (rule === 'top-larger' && i === totalFloors - 1) rooms += Math.ceil(remainder / 2);
    allocations.push({floor: i + 1, rooms: rooms});
  }

  var html = '';
  allocations.forEach(function(a, i) {
    var bg = i % 2 === 0 ? 'var(--bg)' : 'white';
    html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:' + bg + ';border-bottom:1px solid var(--border);">';
    html += '<div style="width:60px;font-size:13px;font-weight:600;">' + a.floor + '层</div>';
    html += '<div style="flex:1;"><div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">';
    html += '<div style="height:100%;width:' + (a.rooms / totalRooms * 100) + '%;background:var(--blue);border-radius:3px;transition:0.3s;"></div></div></div>';
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<button onclick="adjustFloorRoom(' + i + ',-1)" style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:white;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">−</button>';
    html += '<span id="alloc-floor-' + i + '" style="font-size:14px;font-weight:700;min-width:30px;text-align:center;">' + a.rooms + '</span>';
    html += '<button onclick="adjustFloorRoom(' + i + ',1)" style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:white;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">+</button></div>';
    html += '<div style="font-size:11px;color:var(--text-muted);min-width:50px;">' + Math.round(a.rooms / totalRooms * 100) + '%</div></div>';
  });

  var totalAssigned = allocations.reduce(function(s, a) { return s + a.rooms; }, 0);
  var remaining = totalRooms - totalAssigned;
  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:' + (remaining !== 0 ? 'var(--orange-bg)' : 'var(--green-bg)') + ';font-size:12px;">' +
    '<span>已分配房间：<b>' + totalAssigned + '</b> 间</span>' +
    '<span style="color:' + (remaining !== 0 ? 'var(--orange)' : 'var(--green)') + ';">' + (remaining !== 0 ? '⚠️ 还有 ' + remaining + ' 间未分配' : '✅ 已全部分配') + '</span></div>';

  preview.innerHTML = html;
  window._floorAllocations = allocations;
  window._allocTotalRooms = totalRooms;
}

function adjustFloorRoom(idx, delta) {
  if (!window._floorAllocations) return;
  var a = window._floorAllocations[idx];
  if (!a) return;
  var newRooms = Math.max(0, a.rooms + delta);
  var totalAssigned = window._floorAllocations.reduce(function(s, x) { return s + (x === a ? newRooms : x.rooms); }, 0);
  if (totalAssigned > window._allocTotalRooms && delta > 0) {
    showToast('已超过总房间数上限', 'warn');
    return;
  }
  a.rooms = newRooms;
  var el = document.getElementById('alloc-floor-' + idx);
  if (el) el.textContent = newRooms;
  // Recalculate percentages
  var preview = document.getElementById('alloc-floor-preview');
  if (preview) {
    var rows = preview.querySelectorAll('div[style*="height:6px"]');
    rows.forEach(function(row, i) {
      var alloc = window._floorAllocations[i];
      if (alloc) {
        var bar = row.querySelector('div');
        if (bar) bar.style.width = (alloc.rooms / window._allocTotalRooms * 100) + '%';
      }
    });
  }
  // Update total
  var total = window._floorAllocations.reduce(function(s, x) { return s + x.rooms; }, 0);
  var statusBar = preview.querySelector('div[style*="已分配"]');
  if (statusBar) {
    var remaining = window._allocTotalRooms - total;
    statusBar.innerHTML = '<span>已分配房间：<b>' + total + '</b> 间</span>' +
      '<span style="color:' + (remaining !== 0 ? 'var(--orange)' : 'var(--green)') + ';">' + (remaining !== 0 ? '⚠️ 还有 ' + remaining + ' 间未分配' : '✅ 已全部分配') + '</span>';
  }
}

function recalcFloorAllocationV2() {
  generateFloorAllocationV2();
}

function confirmBatchRoomAllocation() {
  if (!window._floorAllocations) return;
  var total = window._floorAllocations.reduce(function(s, a) { return s + a.rooms; }, 0);
  if (total !== window._allocTotalRooms) {
    showToast('请先分配完所有房间（剩余 ' + (window._allocTotalRooms - total) + ' 间）', 'error');
    return;
  }
  var building = window._selectedAllocBuilding !== undefined ? buildingRoomAllocationData[window._selectedAllocBuilding] : null;
  var buildingName = building ? building.name : '楼栋';
  var detail = window._floorAllocations.map(function(a) { return a.floor + '层:' + a.rooms + '间'; }).join('，');
  document.getElementById('modal-batch-room-alloc') && document.getElementById('modal-batch-room-alloc').remove();
  showToast('✅ ' + buildingName + ' 房间分配已确认：' + detail, 'success');
}

// ═══════════════════════════════════════════════════════
// 【物联后台 v3 迭代 - 5项新增功能性改进】
// 时间：2026-03-28
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// 【改进1】房务清洁任务创建完整表单弹窗
// 理由：原系统有完整清洁任务创建流程（任务类型/房间/保洁员/优先级/截止时间），
// Demo现有派工功能为批量派工，缺少单个任务创建表单。
// 新增：任务类型选择（含说明）、房间选择（含入住时间）、优先级设置、
// 保洁员分配（含当前任务量显示）、截止时间设定、特殊要求备注、短信通知选项。
// ═══════════════════════════════════════════════════════
function openHousekeepingTaskCreateModal() {
  var old = document.getElementById('modal-hk-task-create');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-hk-task-create" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">';
  html += '<div class="modal" style="width:580px;max-height:85vh;overflow-y:auto;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:16px;font-weight:700;">🧹 创建房务清洁任务</div>';
  html += '<button onclick="document.getElementById(\'modal-hk-task-create\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:10px 14px;background:var(--blue-bg);border-radius:8px;font-size:12px;color:var(--blue);">💡 填写任务信息后，系统将自动派发给对应保洁人员，可实时跟踪任务状态并记录清洁质量评分</div>';
  html += '<div class="form-group"><label class="form-label">任务类型 <span class="required">*</span></label>';
  html += '<select class="form-select" id="hkt-type" onchange="updateHKTaskTypeHint()" style="padding:8px 12px;font-size:13px;">';
  html += '<option value="checkin_clean">🏠 入店清洁（新客人入住前）</option>';
  html += '<option value="checkout_clean">🚪 退房清洁（客人退房后）</option>';
  html += '<option value="routine_clean">🔄 例行清洁（在住房日常维护）</option>';
  html += '<option value="deep_clean">✨ 深度清洁（大扫除/特殊清洁）</option>';
  html += '<option value="emergency_clean">🚨 紧急清洁（投诉/突发脏乱）</option>';
  html += '<option value="inspect">🔍 查房检查（退房后质量验收）</option>';
  html += '</select></div>';
  html += '<div id="hkt-type-hint" style="font-size:11px;color:var(--text-muted);margin-bottom:12px;padding:6px 10px;background:var(--bg);border-radius:6px;">🏠 入店清洁：客人在入住时间前2小时完成，准备好全部客用品</div>';
  html += '<div class="form-row"><div class="form-group"><label class="form-label">目标房间 <span class="required">*</span></label>';
  html += '<select class="form-select" id="hkt-room" style="padding:8px 12px;font-size:13px;">';
  html += '<option value="">请选择房间</option>';
  html += '<option value="301">301 · 亲子间 · 入住：14:00</option>';
  html += '<option value="302">302 · 亲子间 · 入住：15:00</option>';
  html += '<option value="303">303 · 亲子间 · 入住：16:00</option>';
  html += '<option value="201">201 · 大床房 · 入住：14:00</option>';
  html += '<option value="202">202 · 大床房 · 入住：15:00</option>';
  html += '<option value="205">205 · 大床房 · 入住：12:00</option>';
  html += '</select></div>';
  html += '<div class="form-group"><label class="form-label">优先级 <span class="required">*</span></label>';
  html += '<select class="form-select" id="hkt-priority" style="padding:8px 12px;font-size:13px;">';
  html += '<option value="normal">🟡 普通（2小时内完成）</option>';
  html += '<option value="high">🟠 高（1小时内完成）</option>';
  html += '<option value="urgent">🔴 紧急（30分钟内完成）</option>';
  html += '</select></div></div>';
  html += '<div class="form-row"><div class="form-group"><label class="form-label">派给保洁员 <span class="required">*</span></label>';
  html += '<select class="form-select" id="hkt-staff" style="padding:8px 12px;font-size:13px;">';
  html += '<option value="">请选择保洁员</option>';
  html += '<option value="zheng">👤 郑强（当前任务：2个，空闲）</option>';
  html += '<option value="sun">👤 孙华（当前任务：1个，空闲）</option>';
  html += '<option value="wu">👤 吴倩（当前任务：3个，较忙）</option>';
  html += '</select></div>';
  html += '<div class="form-group"><label class="form-label">要求完成时间</label>';
  html += '<input type="time" class="form-input" id="hkt-deadline" value="14:00" style="padding:8px 12px;font-size:13px;"></div></div>';
  html += '<div class="form-group"><label class="form-label">特殊要求</label>';
  html += '<textarea class="form-input" id="hkt-notes" rows="3" placeholder="如有特殊清洁要求请在此说明，如：需使用除螨仪、禁止使用某化学清洁剂等" style="padding:8px 12px;font-size:13px;resize:vertical;"></textarea></div>';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-top:4px;">';
  html += '<input type="checkbox" id="hkt-sms-notify" style="accent-color:var(--blue);width:16px;height:16px;">';
  html += '<label for="hkt-sms-notify" style="font-size:12px;cursor:pointer;color:var(--text-muted);">📲 创建后短信通知保洁员</label></div>';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-top:8px;">';
  html += '<input type="checkbox" id="hkt-auto-assign" checked style="accent-color:var(--blue);width:16px;height:16px;">';
  html += '<label for="hkt-auto-assign" style="font-size:12px;cursor:pointer;color:var(--text-muted);">🤖 自动分配至最近空闲的保洁员</label></div>';
  html += '</div>';
  html += '<div style="padding:14px 24px 18px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-hk-task-create\').remove()" style="padding:8px 20px;font-size:13px;">取消</button>';
  html += '<button class="action-btn" onclick="submitHousekeepingTaskCreate()" style="padding:8px 20px;font-size:13px;background:var(--green);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">✅ 创建任务</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function updateHKTaskTypeHint() {
  var type = document.getElementById('hkt-type').value;
  var hints = {
    checkin_clean: '🏠 入店清洁：客人在入住时间前2小时完成，准备好全部客用品',
    checkout_clean: '🚪 退房清洁：收到退房通知后立即清洁，重点消毒卫生间',
    routine_clean: '🔄 例行清洁：在住房日常维护，勿移动客人私人物品',
    deep_clean: '✨ 深度清洁：全屋彻底打扫，包括窗帘、空调滤网等',
    emergency_clean: '🚨 紧急清洁：优先处理，需立即响应',
    inspect: '🔍 查房检查：按检查清单逐项验收，记录清洁质量评分'
  };
  var el = document.getElementById('hkt-type-hint');
  if (el) el.textContent = hints[type] || '';
}

function submitHousekeepingTaskCreate() {
  var type = document.getElementById('hkt-type').value;
  var room = document.getElementById('hkt-room').value;
  var priority = document.getElementById('hkt-priority').value;
  var staff = document.getElementById('hkt-staff').value;
  var deadline = document.getElementById('hkt-deadline').value;
  var notes = document.getElementById('hkt-notes').value.trim();
  if (!room) { showToast('请选择目标房间', 'error'); return; }
  if (!staff && !document.getElementById('hkt-auto-assign').checked) { showToast('请选择保洁员或开启自动分配', 'error'); return; }
  var taskId = 'TASK-' + Date.now().toString().slice(-6);
  var typeNames = {checkin_clean:'入店清洁',checkout_clean:'退房清洁',routine_clean:'例行清洁',deep_clean:'深度清洁',emergency_clean:'紧急清洁',inspect:'查房检查'};
  var staffNames = {zheng:'郑强',sun:'孙华',wu:'吴倩'};
  var assignedStaff = document.getElementById('hkt-auto-assign').checked ? '系统自动分配' : staffNames[staff] || staff;
  showToast('🧹 房务任务[' + taskId + ']已创建，已派给' + assignedStaff, 'success');
  if (document.getElementById('hkt-sms-notify').checked) {
    setTimeout(function() { showToast('📲 已短信通知保洁员[' + assignedStaff + ']', 'info'); }, 500);
  }
  addOpLog('housekeeping', '赵飞', '创建房务任务：' + taskId + ' ' + typeNames[type] + ' ' + room + '房间', '');
  document.getElementById('modal-hk-task-create').remove();
}

// ═══════════════════════════════════════════════════════
// 【改进2】退房结算清单明细弹窗
// 理由：原系统退房有完整结算清单（房费明细/其他消费/服务费/押金抵扣/实付金额），
// Demo现有退房弹窗缺少逐项费用明细展示。
// 新增：房费明细表格、其他消费逐行列项（含时间/数量/单价/小计）、
// 服务费项、费用汇总（含押金抵扣计算）、"确认并结算"跳转按钮。
// ═══════════════════════════════════════════════════════
function openCheckoutSettlementDetailModal(room, guestName, checkinDate) {
  var old = document.getElementById('modal-checkout-settlement');
  if (old) old.remove();
  var roomFee = room === '302' ? 128 : room === '205' ? 108 : room === '301' ? 158 : 98;
  var consumeData = [
    {item:'早餐 × 2份', qty:2, price:28, total:56, time:'今天 08:30'},
    {item:'客房加床', qty:1, price:80, total:80, time:'昨天 20:00'},
    {item:'迷你吧 - 可乐', qty:2, price:8, total:16, time:'昨天 22:15'},
    {item:'迷你吧 - 啤酒', qty:1, price:15, total:15, time:'昨天 22:15'},
    {item:'赔偿-床单污渍', qty:1, price:50, total:50, time:'今天 11:00'}
  ];
  var serviceFee = 15;
  var consumeTotal = consumeData.reduce(function(s,i){return s+i.total;},0);
  var total = roomFee + consumeTotal + serviceFee;
  var deposit = 200;
  var html = '<div class="modal-overlay" id="modal-checkout-settlement" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;" onclick="if(event.target===this)">';
  html += '<div class="modal" style="width:600px;max-height:88vh;overflow-y:auto;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">📋 退房结算清单 - ' + room + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">入住人：' + guestName + ' | 入住日期：' + checkinDate + '</div></div>';
  html += '<button onclick="document.getElementById(\'modal-checkout-settlement\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:16px 24px;">';
  // 房费
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;">🏠 房费明细</div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:8px 12px;background:var(--bg);font-size:11px;font-weight:600;color:var(--text-muted);">';
  html += '<div>房型</div><div>入住日期</div><div>退房日期</div><div style="text-align:right;">房费</div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:10px 12px;font-size:13px;border-top:1px solid var(--border);">';
  html += '<div>亲子间</div><div>' + checkinDate + '</div><div>2026-03-28</div><div style="text-align:right;font-weight:700;color:var(--blue);">¥' + roomFee + '</div></div></div></div>';
  // 消费明细
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;">🍜 其他消费明细 <span style="font-size:11px;font-weight:400;color:var(--text-muted);">（' + consumeData.length + '项，共 ¥' + consumeTotal + '）</span></div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<div style="display:grid;grid-template-columns:2fr 60px 70px 70px 100px;padding:8px 12px;background:var(--bg);font-size:11px;font-weight:600;color:var(--text-muted);">';
  html += '<div>项目</div><div style="text-align:center;">数量</div><div style="text-align:right;">单价</div><div style="text-align:right;">小计</div><div style="text-align:right;">时间</div></div>';
  consumeData.forEach(function(item) {
    html += '<div style="display:grid;grid-template-columns:2fr 60px 70px 70px 100px;padding:9px 12px;font-size:12px;border-top:1px solid var(--border);align-items:center;">';
    html += '<div>' + item.item + '</div><div style="text-align:center;">' + item.qty + '</div><div style="text-align:right;">¥' + item.price + '</div><div style="text-align:right;font-weight:600;">¥' + item.total + '</div><div style="text-align:right;font-size:11px;color:var(--text-muted);">' + item.time + '</div></div>';
  });
  html += '</div></div>';
  // 服务费
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;">🔧 服务费</div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">';
  html += '<div><div style="font-size:12px;">加急服务费（快速查房）</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">要求15分钟内完成查房</div></div>';
  html += '<div style="font-weight:700;color:var(--orange);">¥' + serviceFee + '</div></div></div>';
  // 费用汇总
  var finalAmount = total - deposit;
  html += '<div style="border:2px solid var(--blue);border-radius:10px;overflow:hidden;margin-bottom:14px;">';
  html += '<div style="display:flex;justify-content:space-between;padding:12px 16px;background:var(--blue-bg);font-size:12px;color:var(--blue);font-weight:600;">';
  html += '<span>费用汇总</span><span>共 ' + (consumeData.length + 2) + ' 项</span></div>';
  html += '<div style="padding:12px 16px;">';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">房费</span><span>¥' + roomFee + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">其他消费</span><span>¥' + consumeTotal + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">服务费</span><span>¥' + serviceFee + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px dashed var(--border);font-size:14px;font-weight:700;">';
  html += '<span>应付总额</span><span style="color:var(--red);font-size:18px;">¥' + total + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:8px;color:var(--green);font-weight:600;">';
  html += '<span>已付押金（已抵扣）</span><span>- ¥' + deposit + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid var(--green);font-size:16px;font-weight:800;color:' + (finalAmount > 0 ? 'var(--red)' : 'var(--green)') + ';">';
  html += '<span>' + (finalAmount > 0 ? '需补缴' : '可退') + '</span><span>' + (finalAmount > 0 ? '¥' + finalAmount : '¥' + Math.abs(finalAmount)) + '</span></div></div></div>';
  // 操作
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-checkout-settlement\').remove()" style="padding:10px;font-size:13px;">返回修改</button>';
  html += '<button class="action-btn" onclick="document.getElementById(\'modal-checkout-settlement\').remove();openCheckoutFullModal(\'' + room + '\',\'' + guestName + '\',\'' + checkinDate + '\')" style="padding:10px;font-size:13px;background:var(--green);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">💰 确认并结算</button></div>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ═══════════════════════════════════════════════════════
// 【改进3】设备批量解绑管理弹窗
// 理由：原系统硬件管理有设备绑定关系管理（查看/解绑/重新绑定），
// Demo现有设备绑定功能可批量绑定，但缺少独立解绑管理入口和可视化绑定关系表。
// 新增：设备绑定关系列表（含UUID/设备ID/绑定房间/绑定日期/状态/操作），
// 解绑确认弹窗、重新绑定向导入口，冲突检测说明。
// ═══════════════════════════════════════════════════════
function openDeviceUnbindModal() {
  var old = document.getElementById('modal-device-unbind');
  if (old) old.remove();
  var boundDevices = [
    {uuid:'A84F1AF2-0001-4B2C-8A3D-E5F6G7H8', devId:'DEV-LK01', room:'301', bindDate:'2026-01-15', lastSeen:'今天 09:30', status:'online'},
    {uuid:'A84F1AF2-0002-4B2C-8A3D-E5F6G7H8', devId:'DEV-LK02', room:'302', bindDate:'2026-01-15', lastSeen:'今天 09:28', status:'online'},
    {uuid:'A84F1AF2-0003-4B2C-8A3D-E5F6G7H8', devId:'DEV-LK03', room:'303', bindDate:'2026-01-20', lastSeen:'昨天 22:10', status:'offline'},
    {uuid:'A84F1AF2-0004-4B2C-8A3D-E5F6G7H8', devId:'DEV-LK05', room:'305', bindDate:'2026-01-22', lastSeen:'昨天 18:00', status:'lowbat'},
    {uuid:'A84F1AF2-0005-4B2C-8A3D-E5F6G7H8', devId:'DEV-LK07', room:'(未分配)', bindDate:'2026-02-01', lastSeen:'--', status:'unbound'}
  ];
  var onlineCount = boundDevices.filter(function(d){return d.status==='online'}).length;
  var offlineCount = boundDevices.filter(function(d){return d.status==='offline'}).length;
  var unboundCount = boundDevices.filter(function(d){return d.status==='unbound'}).length;
  var html = '<div class="modal-overlay" id="modal-device-unbind" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">';
  html += '<div class="modal" style="width:700px;max-height:88vh;overflow-y:auto;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">📡 设备绑定管理</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">查看/解绑/重新绑定设备与房间的关系</div></div>';
  html += '<button onclick="document.getElementById(\'modal-device-unbind\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:16px 20px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">';
  html += '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html += '<div style="padding:8px 12px;background:var(--green-bg);border-radius:6px;text-align:center;font-size:11px;"><div style="font-size:20px;font-weight:800;color:var(--green);">' + onlineCount + '</div><div style="color:var(--text-muted);">🟢 在线</div></div>';
  html += '<div style="padding:8px 12px;background:var(--red-bg);border-radius:6px;text-align:center;font-size:11px;"><div style="font-size:20px;font-weight:800;color:var(--red);">' + offlineCount + '</div><div style="color:var(--text-muted);">🔴 离线</div></div>';
  html += '<div style="padding:8px 12px;background:var(--orange-bg);border-radius:6px;text-align:center;font-size:11px;"><div style="font-size:20px;font-weight:800;color:var(--orange);">' + unboundCount + '</div><div style="color:var(--text-muted);">⚪ 未分配</div></div></div>';
  html += '<button class="action-btn" onclick="openDeviceRebindWizard()" style="padding:7px 14px;font-size:12px;background:var(--blue);color:white;border:none;border-radius:8px;cursor:pointer;">📡 快速重新绑定</button></div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<table class="table" style="font-size:12px;">';
  html += '<thead><tr><th>设备UUID</th><th>设备ID</th><th>绑定房间</th><th>绑定日期</th><th>最后在线</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  boundDevices.forEach(function(d) {
    var statusCfg = {
      online:{bg:'var(--green-bg)',color:'var(--green)',text:'🟢 在线'},
      offline:{bg:'var(--red-bg)',color:'var(--red)',text:'🔴 离线'},
      lowbat:{bg:'var(--orange-bg)',color:'var(--orange)',text:'🟡 低电量'},
      unbound:{bg:'var(--bg)',color:'var(--text-muted)',text:'⚪ 未分配'}
    }[d.status];
    var isUnbound = d.status === 'unbound';
    html += '<tr>';
    html += '<td><code style="font-size:10px;background:var(--bg);padding:2px 4px;border-radius:3px;">' + d.uuid.substring(0,18) + '...</code></td>';
    html += '<td style="font-weight:600;">' + d.devId + '</td>';
    html += '<td>' + d.room + '</td>';
    html += '<td style="font-size:11px;color:var(--text-muted);">' + d.bindDate + '</td>';
    html += '<td style="font-size:11px;color:var(--text-muted);">' + d.lastSeen + '</td>';
    html += '<td><span class="tbadge" style="background:' + statusCfg.bg + ';color:' + statusCfg.color + ';font-size:10px;padding:2px 6px;">' + statusCfg.text + '</span></td>';
    html += '<td><button class="action-btn small" onclick="openDeviceUnbindConfirm(\'' + d.devId + '\',\'' + d.room + '\')" style="padding:3px 8px;font-size:11px;background:' + (isUnbound ? 'var(--blue-bg)' : 'var(--red-bg)') + ';color:' + (isUnbound ? 'var(--blue)' : 'var(--red)') + ';border-color:' + (isUnbound ? 'var(--blue)' : 'var(--red)') + ';">' + (isUnbound ? '绑定' : '解绑') + '</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:12px;padding:10px 14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">';
  html += '⚠️ 解绑后设备将进入"未分配"状态，可重新绑定至其他房间。原绑定记录可在操作日志中查看。</div>';
  html += '</div>';
  html += '<div style="padding:14px 20px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-device-unbind\').remove()" style="padding:8px 20px;font-size:13px;">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function openDeviceUnbindConfirm(devId, room) {
  if (room === '(未分配)') {
    var newRoom = prompt('请输入要绑定到的房间号：');
    if (!newRoom) return;
    showToast('设备 ' + devId + ' 已绑定至房间 ' + newRoom, 'success');
    addOpLog('device', '赵飞', '设备绑定：' + devId + ' → ' + newRoom, '');
    openDeviceUnbindModal();
  } else {
    if (!confirm('确定要解绑设备 ' + devId + ' 与房间 ' + room + ' 的绑定关系吗？解绑后设备将进入未分配状态。')) return;
    showToast('设备 ' + devId + ' 已从房间 ' + room + ' 解绑，现为"未分配"状态', 'success');
    addOpLog('device', '赵飞', '设备解绑：' + devId + ' ← ' + room, '');
    openDeviceUnbindModal();
  }
}

function openDeviceRebindWizard() {
  showToast('📡 重新绑定向导：请在设备列表选择需要重新分配的设备', 'info');
  document.getElementById('modal-device-unbind') && document.getElementById('modal-device-unbind').remove();
}

// ═══════════════════════════════════════════════════════
// 【改进4】夜审报表增强版（含完整营收数据）
// 理由：原系统夜审报表包含完整财务数据（营收明细/房晚统计/OCC/RevPAR/ADR/AR账务），
// Demo现有夜审弹窗缺少房晚统计（OCC/RevPAR/ADR）和AR（应收账款）概念，
// 不足以支撑酒店管理层做经营决策。
// 新增：核心运营指标卡（OCC/RevPAR/ADR）、营收明细表、房晚统计表、
// AR账务核对表、待处理事项清单、确认夜审功能。
// ═══════════════════════════════════════════════════════
function openNightAuditEnhancedModal() {
  var old = document.getElementById('modal-night-audit-enhanced');
  if (old) old.remove();
  var occ = 12, total = 16, revenue = 1856, revpar = Math.round(revenue / total), adr = Math.round(revenue / occ);
  var html = '<div class="modal-overlay" id="modal-night-audit-enhanced" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">';
  html += '<div class="modal" style="width:700px;max-height:88vh;overflow-y:auto;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">🌙 夜审报表（增强版）</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">2026-03-27 夜间审计 · 数据自动汇总</div></div>';
  html += '<button onclick="document.getElementById(\'modal-night-audit-enhanced\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:16px 24px;">';
  // 核心指标
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">';
  html += '<div style="padding:12px 14px;background:linear-gradient(135deg,#1890ff,#69c0ff);border-radius:8px;color:white;text-align:center;"><div style="font-size:11px;opacity:0.9;">🏠 入住率 (OCC)</div><div style="font-size:24px;font-weight:800;margin:4px 0;">' + Math.round(occ/total*100) + '%</div><div style="font-size:11px;opacity:0.8;">' + occ + '/' + total + ' 房晚</div></div>';
  html += '<div style="padding:12px 14px;background:linear-gradient(135deg,#52c41a,#73d13d);border-radius:8px;color:white;text-align:center;"><div style="font-size:11px;opacity:0.9;">💰 总营收</div><div style="font-size:24px;font-weight:800;margin:4px 0;">¥' + revenue + '</div><div style="font-size:11px;opacity:0.8;">今日收入</div></div>';
  html += '<div style="padding:12px 14px;background:linear-gradient(135deg,#722ed1,#b37feb);border-radius:8px;color:white;text-align:center;"><div style="font-size:11px;opacity:0.9;">📊 RevPAR</div><div style="font-size:24px;font-weight:800;margin:4px 0;">¥' + revpar + '</div><div style="font-size:11px;opacity:0.8;">每可用房收益</div></div>';
  html += '<div style="padding:12px 14px;background:linear-gradient(135deg,#fa8c16,#ffc53d);border-radius:8px;color:white;text-align:center;"><div style="font-size:11px;opacity:0.9;">🏷️ ADR</div><div style="font-size:24px;font-weight:800;margin:4px 0;">¥' + adr + '</div><div style="font-size:11px;opacity:0.8;">已售房均价</div></div></div>';
  // 明细
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<div style="padding:10px 14px;background:var(--blue-bg);font-size:12px;font-weight:700;color:var(--blue);">💵 营收明细</div>';
  html += '<div style="padding:12px 14px;">';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">房费收入</span><span style="font-weight:600;">¥1,536</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">其他消费</span><span style="font-weight:600;">¥217</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">服务费</span><span style="font-weight:600;">¥103</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:8px;border-top:1px dashed var(--border);font-weight:700;"><span>合计</span><span style="color:var(--blue);">¥1,856</span></div></div></div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<div style="padding:10px 14px;background:var(--green-bg);font-size:12px;font-weight:700;color:var(--green);">📈 房晚统计 (Night Stats)</div>';
  html += '<div style="padding:12px 14px;">';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">已售房晚 (Sold)</span><span style="font-weight:600;">12 房晚</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">可用房晚 (Available)</span><span style="font-weight:600;">16 房晚</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;"><span style="color:var(--text-muted);">平均房价 (ADR)</span><span style="font-weight:600;">¥' + adr + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;padding-top:8px;border-top:1px dashed var(--border);font-weight:700;"><span>入住率</span><span style="color:var(--green);">' + Math.round(occ/total*100) + '%</span></div></div></div></div>';
  // AR
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;">';
  html += '<div style="padding:10px 14px;background:var(--orange-bg);font-size:12px;font-weight:700;color:var(--orange);">🏦 应收账款 (AR) & 账务核对</div>';
  html += '<div style="padding:12px 14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">';
  html += '<div style="text-align:center;padding:8px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">总应收账款</div><div style="font-size:18px;font-weight:800;color:var(--orange);">¥0</div></div>';
  html += '<div style="text-align:center;padding:8px;background:var(--green-bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">已结清</div><div style="font-size:18px;font-weight:800;color:var(--green);">¥1,856</div></div>';
  html += '<div style="text-align:center;padding:8px;background:var(--blue-bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">在账余额</div><div style="font-size:18px;font-weight:800;color:var(--blue);">¥0</div></div>';
  html += '</div></div>';
  // 待处理
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:14px;">';
  html += '<div style="padding:10px 14px;background:var(--red-bg);font-size:12px;font-weight:700;color:var(--red);">⚠️ 夜审待处理事项</div>';
  html += '<div style="padding:10px 14px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">';
  html += '<span style="color:var(--red);font-weight:700;">1.</span><div style="flex:1;"><div style="font-weight:600;color:var(--red);">302房间 超时退房2.5小时</div><div style="font-size:11px;color:var(--text-muted);">应退时间 12:00 · 当前 14:30</div></div>';
  html += '<button class="action-btn small" onclick="openCheckoutFullModal(\'302\',\'李四\',\'2026-03-27 14:00\')" style="padding:3px 8px;font-size:11px;background:var(--red);color:white;border:none;">立即处理</button></div>';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">';
  html += '<span style="color:var(--orange);font-weight:700;">2.</span><div style="flex:1;"><div style="font-weight:600;color:var(--orange);">303设备离线超过12小时</div><div style="font-size:11px;color:var(--text-muted);">需现场检查网络或重启设备</div></div>';
  html += '<button class="action-btn small" onclick="showPage(\'device\')" style="padding:3px 8px;font-size:11px;background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">查看设备</button></div>';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:12px;">';
  html += '<span style="color:var(--green);font-weight:700;">3.</span><div style="flex:1;"><div style="font-weight:600;color:var(--green);">今日入住 4人 / 退房 3人，全部处理完毕</div><div style="font-size:11px;color:var(--text-muted);">夜审自动核对，无需人工介入</div></div><span style="color:var(--green);font-size:11px;">✅ 完成</span></div></div></div>';
  // 操作
  html += '<div style="display:flex;gap:10px;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-night-audit-enhanced\').remove()" style="flex:1;padding:10px;font-size:13px;">取消</button>';
  html += '<button class="action-btn" onclick="showToast(\'📊 夜审报表已导出\',\'success\')" style="flex:1;padding:10px;font-size:13px;background:var(--blue);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">📊 导出报表</button>';
  html += '<button class="action-btn" onclick="confirmNightAudit()" style="flex:1;padding:10px;font-size:13px;background:var(--green);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">✅ 确认夜审</button></div>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function confirmNightAudit() {
  showToast('🌙 夜审已确认，所有数据已锁定归档', 'success');
  addOpLog('system', '赵飞', '执行夜审增强版：数据已锁定，确认日期 2026-03-27', '');
  document.getElementById('modal-night-audit-enhanced') && document.getElementById('modal-night-audit-enhanced').remove();
}

// ═══════════════════════════════════════════════════════
// 【改进5】员工排班日历详细视图（含换班申请）
// 理由：原系统员工排班有日历视图（按人查看一周班次）和换班申请流程，
// Demo现有排班入口在员工管理页，但缺少日历视图和换班申请功能。
// 新增：按人员/按日期两种视角的排班日历，班次色彩图例，
// 调班按钮，换班申请弹窗（含申请人/原班次/顶班人/原因）。
// ═══════════════════════════════════════════════════════
function openStaffScheduleCalendarView() {
  var old = document.getElementById('modal-schedule-calendar');
  if (old) old.remove();
  var scheduleData = [
    {name:'赵飞', dept:'前厅', schedule:[{d:'03-22',shift:'早'},{d:'03-23',shift:'早'},{d:'03-24',shift:'休'},{d:'03-25',shift:'中'},{d:'03-26',shift:'早'},{d:'03-27',shift:'早'},{d:'03-28',shift:'休'}]},
    {name:'周敏', dept:'前厅', schedule:[{d:'03-22',shift:'中'},{d:'03-23',shift:'中'},{d:'03-24',shift:'早'},{d:'03-25',shift:'早'},{d:'03-26',shift:'休'},{d:'03-27',shift:'中'},{d:'03-28',shift:'中'}]},
    {name:'吴倩', dept:'客房', schedule:[{d:'03-22',shift:'早'},{d:'03-23',shift:'休'},{d:'03-24',shift:'早'},{d:'03-25',shift:'早'},{d:'03-26',shift:'中'},{d:'03-27',shift:'休'},{d:'03-28',shift:'早'}]},
    {name:'郑强', dept:'客房', schedule:[{d:'03-22',shift:'休'},{d:'03-23',shift:'早'},{d:'03-24',shift:'早'},{d:'03-25',shift:'休'},{d:'03-26',shift:'早'},{d:'03-27',shift:'早'},{d:'03-28',shift:'中'}]},
    {name:'王工', dept:'工程', schedule:[{d:'03-22',shift:'早'},{d:'03-23',shift:'早'},{d:'03-24',shift:'早'},{d:'03-25',shift:'早'},{d:'03-26',shift:'早'},{d:'03-27',shift:'休'},{d:'03-28',shift:'休'}]}
  ];
  var shiftBg = {'早':'var(--blue-bg)', '中':'var(--orange-bg)', '晚':'var(--purple-bg)', '休':'var(--green-bg)'};
  var shiftColor = {'早':'var(--blue)', '中':'var(--orange)', '晚':'var(--purple)', '休':'var(--green)'};
  var days = ['03-22\n周一','03-23\n周二','03-24\n周三','03-25\n周四','03-26\n周五','03-27\n周六','03-28\n周日'];
  var html = '<div class="modal-overlay" id="modal-schedule-calendar" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">';
  html += '<div class="modal" style="width:720px;max-height:88vh;overflow-y:auto;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">📅 员工排班日历视图</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">2026年3月 第4周（03-22 ~ 03-28）</div></div>';
  html += '<button onclick="document.getElementById(\'modal-schedule-calendar\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:16px 20px;">';
  html += '<div style="display:flex;gap:16px;margin-bottom:14px;font-size:12px;flex-wrap:wrap;">';
  html += '<div style="display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:4px;"></div><span>早班 08:00-16:00</span></div>';
  html += '<div style="display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:4px;"></div><span>中班 16:00-24:00</span></div>';
  html += '<div style="display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:var(--purple-bg);border:1px solid var(--purple);border-radius:4px;"></div><span>晚班 24:00-08:00</span></div>';
  html += '<div style="display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:var(--green-bg);border:1px solid var(--green);border-radius:4px;"></div><span>休息</span></div></div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;overflow-x:auto;">';
  html += '<table class="table" style="font-size:12px;text-align:center;min-width:650px;">';
  html += '<thead><tr><th style="background:var(--bg);width:70px;">员工</th>';
  days.forEach(function(d) {
    var isWeekend = d.indexOf('周六') !== -1 || d.indexOf('周日') !== -1;
    html += '<th style="background:var(--bg);' + (isWeekend ? 'color:var(--red);' : '') + '">' + d.replace('\n','<br>') + '</th>';
  });
  html += '<th style="background:var(--bg);">操作</th></tr></thead><tbody>';
  scheduleData.forEach(function(person) {
    html += '<tr>';
    html += '<td style="text-align:left;font-weight:600;">' + person.name + '<div style="font-size:10px;color:var(--text-muted);">' + person.dept + '</div></td>';
    person.schedule.forEach(function(s, di) {
      var isWeekend = di >= 5;
      var bg = shiftBg[s.shift] || 'var(--bg)';
      var color = shiftColor[s.shift] || '';
      html += '<td style="padding:4px;"><div style="padding:6px 4px;background:' + bg + ';border-radius:6px;font-size:11px;font-weight:600;' + (isWeekend ? 'color:var(--red);' : color ? 'color:' + color : '') + 'border:1px solid ' + (isWeekend ? 'var(--red)' : 'var(--border)') + '">' + s.shift + '</div></td>';
    });
    html += '<td><button class="action-btn small" onclick="openShiftSwapModal(\'' + person.name + '\')" style="padding:2px 6px;font-size:10px;">换班</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  html += '<div style="padding:10px 14px;background:var(--blue-bg);border-radius:8px;font-size:12px;"><div style="font-weight:700;color:var(--blue);margin-bottom:4px;">📊 本周排班统计</div>';
  html += '<div>早班：<strong>3人</strong>　中班：<strong>2人</strong>　休息：<strong>2人</strong></div></div>';
  html += '<div style="padding:10px 14px;background:var(--orange-bg);border-radius:8px;font-size:12px;"><div style="font-weight:700;color:var(--orange);margin-bottom:4px;">⚠️ 周末值班提醒</div>';
  html += '<div>周六：赵飞/郑强　周日：周敏/王工</div></div></div>';
  html += '</div>';
  html += '<div style="padding:14px 20px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-schedule-calendar\').remove()" style="padding:8px 20px;font-size:13px;">关闭</button>';
  html += '<button class="action-btn" onclick="showToast(\'📅 排班表已导出\',\'success\')" style="padding:8px 16px;font-size:13px;background:var(--blue);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">📤 导出排班</button>';
  html += '<button class="action-btn" onclick="openShiftSwapModal()" style="padding:8px 16px;font-size:13px;background:var(--purple);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 换班申请</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function openShiftSwapModal(name) {
  var old = document.getElementById('modal-shift-swap');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-shift-swap" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;">';
  html += '<div class="modal" style="width:480px;">';
  html += '<div class="modal-header" style="padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:15px;font-weight:700;">🔄 换班申请</div>';
  html += '<button onclick="document.getElementById(\'modal-shift-swap\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:16px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div class="form-group"><label class="form-label">申请人</label><select class="form-select" style="padding:8px 12px;font-size:13px;">' + (name ? '<option>' + name + '</option>' : '<option>赵飞（前厅）</option><option>周敏（前厅）</option><option>吴倩（客房）</option><option>郑强（客房）</option>') + '</select></div>';
  html += '<div class="form-row"><div class="form-group"><label class="form-label">原班次</label><select class="form-select" style="padding:8px 12px;font-size:13px;"><option>03-28（周日）早班</option><option>03-28（周日）中班</option></select></div>';
  html += '<div class="form-group"><label class="form-label">顶班人</label><select class="form-select" style="padding:8px 12px;font-size:13px;"><option>周敏（前厅）</option><option>吴倩（客房）</option><option>郑强（客房）</option></select></div></div>';
  html += '<div class="form-group"><label class="form-label">换班原因</label><textarea class="form-input" rows="2" placeholder="请输入换班原因" style="padding:8px 12px;font-size:13px;resize:none;"></textarea></div>';
  html += '<div style="display:flex;gap:10px;margin-top:16px;">';
  html += '<button class="action-btn secondary" onclick="document.getElementById(\'modal-shift-swap\').remove()" style="flex:1;padding:9px;font-size:13px;">取消</button>';
  html += '<button class="action-btn" onclick="showToast(\'✅ 换班申请已提交，等待审批\',\'success\');document.getElementById(\'modal-shift-swap\').remove()" style="flex:1;padding:9px;font-size:13px;background:var(--purple);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">提交申请</button></div>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【改进v3-新增1】能耗多时间维度对比分析弹窗
// 理由：原系统能耗只有单维度图表，缺少本周vs上周、本月vs上月等多时间维度对比分析。
// 新增多 Tab 对比视图：本周趋势/上周对比/月度趋势/自定义时间段。
// ============================================================
var energyCompareData = {
  thisWeek: [18, 22, 15, 28, 19, 21, 14],
  lastWeek: [21, 19, 23, 16, 24, 18, 26],
  thisMonth: [142, 156, 138, 162, 148, 155, 140],
  lastMonth: [156, 148, 162, 155, 168, 172, 158]
};
var energyCompareLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function openEnergyPeriodCompareModal() {
  var old = document.getElementById('modal-energy-compare');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-energy-compare" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-energy-compare\').remove()">'+
    '<div class="modal" style="width:780px;max-height:88vh;overflow-y:auto;">'+
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">'+
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">⚡</div><div><div style="font-size:17px;font-weight:700;">能耗多时间维度对比分析</div><div style="font-size:12px;color:var(--text-muted);">本周 vs 上周 · 同比 · 环比分析</div></div></div>'+
    '<button onclick="document.getElementById(\'modal-energy-compare\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>'+
    '<div style="padding:16px 24px;">'+
    '<div style="display:flex;gap:8px;margin-bottom:16px;" id="ec-tabs">'+
      '<button class="ec-tab active" onclick="switchEcTab(\'week\',this)" style="padding:7px 16px;border-radius:6px;font-size:13px;cursor:pointer;border:none;font-weight:600;background:var(--blue);color:white;">本周 vs 上周</button>'+
      '<button class="ec-tab" onclick="switchEcTab(\'month\',this)" style="padding:7px 16px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid var(--border);background:white;color:var(--text);font-weight:600;">本月 vs 上月</button>'+
      '<button class="ec-tab" onclick="switchEcTab(\'trend\',this)" style="padding:7px 16px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid var(--border);background:white;color:var(--text);font-weight:600;">月趋势</button>'+
      '<button class="ec-tab" onclick="switchEcTab(\'custom\',this)" style="padding:7px 16px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid var(--border);background:white;color:var(--text);font-weight:600;">自定义对比</button>'+
    '</div>'+
    '<div id="ec-panel-week">'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">'+
        '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--blue);margin-bottom:4px;">本周总能耗</div><div style="font-size:22px;font-weight:700;color:var(--blue);" id="ec-this-week-total">137</div><div style="font-size:11px;color:var(--text-muted);">kWh</div></div>'+
        '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--green);margin-bottom:4px;">上周总能耗</div><div style="font-size:22px;font-weight:700;color:var(--green);" id="ec-last-week-total">167</div><div style="font-size:11px;color:var(--text-muted);">kWh</div></div>'+
        '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--orange);margin-bottom:4px;">同比变化</div><div style="font-size:22px;font-weight:700;color:var(--orange);" id="ec-week-change">-18%</div><div style="font-size:11px;color:var(--text-muted);">↓ 节省30kWh</div></div>'+
        '<div style="padding:12px;background:var(--purple-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--purple);margin-bottom:4px;">预估电费节省</div><div style="font-size:22px;font-weight:700;color:var(--purple);">¥18</div><div style="font-size:11px;color:var(--text-muted);">约9元</div></div>'+
      '</div>'+
      '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:13px;font-weight:700;">📊 本周 vs 上周 逐日对比</div><div style="display:flex;gap:12px;font-size:11px;"><span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:var(--blue);border-radius:50%;"></span>本周</span><span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:var(--green);border-radius:50%;opacity:0.5;"></span>上周</span></div></div>'+
        '<div style="display:flex;align-items:flex-end;gap:10px;height:140px;padding:0 4px;" id="ec-week-chart"></div>'+
        '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text-muted);">'+
          '<span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div id="ec-panel-month" style="display:none;">'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">'+
        '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--blue);margin-bottom:4px;">本月累计</div><div style="font-size:22px;font-weight:700;color:var(--blue);">1,042</div><div style="font-size:11px;color:var(--text-muted);">kWh</div></div>'+
        '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--green);margin-bottom:4px;">上月同期</div><div style="font-size:22px;font-weight:700;color:var(--green);">1,168</div><div style="font-size:11px;color:var(--text-muted);">kWh</div></div>'+
        '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--orange);margin-bottom:4px;">环比变化</div><div style="font-size:22px;font-weight:700;color:var(--orange);">-10.8%</div><div style="font-size:11px;color:var(--text-muted);">↓ 节省126kWh</div></div>'+
        '<div style="padding:12px;background:var(--purple-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--purple);margin-bottom:4px;">日均能耗</div><div style="font-size:22px;font-weight:700;color:var(--purple);">37.2</div><div style="font-size:11px;color:var(--text-muted);">kWh/天</div></div>'+
      '</div>'+
      '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
        '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📊 本月 vs 上月 日均趋势（按日）</div>'+
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">'+
          '<div style="text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第1周</div><div style="padding:8px;background:var(--blue-bg);border-radius:6px;"><div style="font-size:18px;font-weight:700;color:var(--blue);">38</div><div style="font-size:10px;color:var(--text-muted);">kWh</div></div><div style="margin-top:4px;font-size:10px;color:var(--green);">上月:42</div></div>'+
          '<div style="text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第2周</div><div style="padding:8px;background:var(--blue-bg);border-radius:6px;"><div style="font-size:18px;font-weight:700;color:var(--blue);">36</div><div style="font-size:10px;color:var(--text-muted);">kWh</div></div><div style="margin-top:4px;font-size:10px;color:var(--green);">上月:40</div></div>'+
          '<div style="text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第3周</div><div style="padding:8px;background:var(--orange-bg);border-radius:6px;"><div style="font-size:18px;font-weight:700;color:var(--orange);">40</div><div style="font-size:10px;color:var(--text-muted);">kWh</div></div><div style="margin-top:4px;font-size:10px;color:var(--red);">上月:38↑</div></div>'+
          '<div style="text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第4周</div><div style="padding:8px;background:var(--green-bg);border-radius:6px;"><div style="font-size:18px;font-weight:700;color:var(--green);">35</div><div style="font-size:10px;color:var(--text-muted);">kWh</div></div><div style="margin-top:4px;font-size:10px;color:var(--green);">上月:41</div></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div id="ec-panel-trend" style="display:none;">'+
      '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
        '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📈 近30天能耗日趋势</div>'+
        '<div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding:0 4px;" id="ec-trend-chart"></div>'+
        '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:var(--text-muted);"><span>1日</span><span>8日</span><span>15日</span><span>22日</span><span>28日</span></div>'+
        '<div style="margin-top:12px;padding:12px;background:var(--blue-bg);border-radius:8px;font-size:12px;"><b style="color:var(--blue);">📊 分析结论：</b>近30天能耗呈下降趋势，周末能耗明显高于工作日，峰值出现在周六（均 值42kWh）。建议关注周六设备运行策略。</div>'+
      '</div>'+
    '</div>'+
    '<div id="ec-panel-custom" style="display:none;">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">'+
        '<div class="form-group"><label class="form-label">时间段A</label><div style="display:flex;gap:8px;align-items:center;"><input type="date" class="form-input" id="ec-custom-start-a" value="2026-03-01" style="flex:1;padding:6px 8px;font-size:12px;"><span style="color:var(--text-muted);">至</span><input type="date" class="form-input" id="ec-custom-end-a" value="2026-03-14" style="flex:1;padding:6px 8px;font-size:12px;"></div></div>'+
        '<div class="form-group"><label class="form-label">时间段B</label><div style="display:flex;gap:8px;align-items:center;"><input type="date" class="form-input" id="ec-custom-start-b" value="2026-03-15" style="flex:1;padding:6px 8px;font-size:12px;"><span style="color:var(--text-muted);">至</span><input type="date" class="form-input" id="ec-custom-end-b" value="2026-03-28" style="flex:1;padding:6px 8px;font-size:12px;"></div></div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">'+
        '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--blue);margin-bottom:4px;">时间段A总能耗</div><div style="font-size:20px;font-weight:700;color:var(--blue);">518 kWh</div></div>'+
        '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--green);margin-bottom:4px;">时间段B总能耗</div><div style="font-size:20px;font-weight:700;color:var(--green);">486 kWh</div></div>'+
        '<div style="padding:12px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--orange);margin-bottom:4px;">变化率</div><div style="font-size:20px;font-weight:700;color:var(--orange);">-6.2%</div></div>'+
      '</div>'+
      '<button class="action-btn" onclick="showToast(\'📊 自定义对比分析已更新\',\'success\')" style="padding:8px 20px;background:var(--blue);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 更新对比</button>'+
    '</div>'+
    '</div>'+
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">'+
      '<button onclick="document.getElementById(\'modal-energy-compare\').remove()" class="modal-btn secondary" style="padding:8px 20px;">关闭</button>'+
      '<button onclick="showToast(\'📊 能耗对比报告已导出\',\'success\')" class="modal-btn primary" style="background:var(--green);border-color:var(--green);padding:8px 20px;">📤 导出报告</button>'+
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  renderEcWeekChart();
  renderEcTrendChart();
}

function switchEcTab(tab, btn) {
  document.querySelectorAll('.ec-tab').forEach(function(t) {
    t.classList.remove('active');
    t.style.background = 'white';
    t.style.color = 'var(--text)';
    t.style.border = '1px solid var(--border)';
  });
  btn.classList.add('active');
  btn.style.background = 'var(--blue)';
  btn.style.color = 'white';
  btn.style.border = 'none';
  document.getElementById('ec-panel-week').style.display = tab === 'week' ? 'block' : 'none';
  document.getElementById('ec-panel-month').style.display = tab === 'month' ? 'block' : 'none';
  document.getElementById('ec-panel-trend').style.display = tab === 'trend' ? 'block' : 'none';
  document.getElementById('ec-panel-custom').style.display = tab === 'custom' ? 'block' : 'none';
}

function renderEcWeekChart() {
  var container = document.getElementById('ec-week-chart');
  if (!container) return;
  var thisW = energyCompareData.thisWeek;
  var lastW = energyCompareData.lastWeek;
  var maxVal = Math.max.apply(null, thisW.concat(lastW));
  var html = '';
  for (var i = 0; i < 7; i++) {
    var thisH = (thisW[i] / maxVal * 120).toFixed(1);
    var lastH = (lastW[i] / maxVal * 120).toFixed(1);
    html += '<div style="flex:1;display:flex;align-items:flex-end;gap:2px;height:100%;">'+
      '<div style="flex:1;background:var(--green);opacity:0.4;border-radius:3px 3px 0 0;height:' + lastH + 'px;min-height:4px;"></div>'+
      '<div style="flex:1;background:var(--blue);border-radius:3px 3px 0 0;height:' + thisH + 'px;min-height:4px;"></div></div>';
  }
  container.innerHTML = html;
}

function renderEcTrendChart() {
  var container = document.getElementById('ec-trend-chart');
  if (!container) return;
  var days = 28;
  var data = [];
  for (var i = 0; i < days; i++) {
    data.push(30 + Math.random() * 20 + (i % 7 === 5 || i % 7 === 6 ? 10 : 0));
  }
  var maxVal = Math.max.apply(null, data);
  var html = '';
  for (var i = 0; i < days; i++) {
    var h = (data[i] / maxVal * 90).toFixed(1);
    html += '<div style="flex:1;background:var(--blue);border-radius:2px 2px 0 0;height:' + h + 'px;min-height:3px;cursor:pointer;" title="03-' + (i+1) + ': ' + data[i].toFixed(1) + 'kWh"></div>';
  }
  container.innerHTML = html;
}

// ============================================================
// 【改进v3-新增2】夜审月度报告弹窗
// 理由：原系统夜审只有核查清单，缺少月度夜审汇总报告功能。
// 新增月度夜审报告：营收汇总/入住率分析/工单统计/设备状态/财务核对。
// ============================================================
var nightAuditMonthlyData = {
  month: '2026年3月',
  totalRooms: 16,
  occupancyRate: 78.5,
  totalRevenue: 28600,
  totalDeposit: 4200,
  totalRefund: 3850,
  netRevenue: 24850,
  avgRoomRate: 118,
  revpar: 92.6,
  checkinCount: 42,
  checkoutCount: 38,
  overtimeCount: 5,
  workorderTotal: 12,
  workorderPending: 2,
  workorderDone: 10,
  deviceOnline: 14,
  deviceOffline: 2,
  alertCount: 3
};

function openNightAuditMonthlyReportModal() {
  var old = document.getElementById('modal-night-audit-monthly-report');
  if (old) old.remove();
  var d = nightAuditMonthlyData;
  var html = '<div class="modal-overlay" id="modal-night-audit-monthly-report" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-night-audit-monthly-report\').remove()">'+
    '<div class="modal" style="width:720px;max-height:88vh;overflow-y:auto;">'+
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">'+
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🌙</div><div><div style="font-size:17px;font-weight:700;">月度夜审汇总报告</div><div style="font-size:12px;color:var(--text-muted);">' + d.month + ' · 数据起止：03-01 至 03-28</div></div></div>'+
    '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:11px;padding:3px 10px;background:var(--green-bg);color:var(--green);border-radius:12px;font-weight:600;">✅ 数据已核对</span>'+
    '<button onclick="document.getElementById(\'modal-night-audit-monthly-report\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div></div>'+
    '<div style="padding:20px 24px;">'+
    // 核心指标
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px;">'+
      '<div style="padding:14px;background:linear-gradient(135deg,#1890ff,#69c0ff);border-radius:10px;text-align:center;color:white;"><div style="font-size:11px;opacity:0.9;margin-bottom:4px;">入住率</div><div style="font-size:26px;font-weight:700;">' + d.occupancyRate + '%</div><div style="font-size:10px;opacity:0.8;">较上月 +3.2%</div></div>'+
      '<div style="padding:14px;background:linear-gradient(135deg,#52c41a,#73d13d);border-radius:10px;text-align:center;color:white;"><div style="font-size:11px;opacity:0.9;margin-bottom:4px;">月营收</div><div style="font-size:22px;font-weight:700;">¥' + (d.totalRevenue / 1000).toFixed(1) + 'k</div><div style="font-size:10px;opacity:0.8;">不含押金</div></div>'+
      '<div style="padding:14px;background:linear-gradient(135deg,#fa8c16,#ffc53d);border-radius:10px;text-align:center;color:white;"><div style="font-size:11px;opacity:0.9;margin-bottom:4px;">RevPAR</div><div style="font-size:26px;font-weight:700;">¥' + d.revpar + '</div><div style="font-size:10px;opacity:0.8;">每房收益</div></div>'+
      '<div style="padding:14px;background:linear-gradient(135deg,#722ed1,#b37feb);border-radius:10px;text-align:center;color:white;"><div style="font-size:11px;opacity:0.9;margin-bottom:4px;">入住/退房</div><div style="font-size:22px;font-weight:700;">' + d.checkinCount + '/' + d.checkoutCount + '</div><div style="font-size:10px;opacity:0.8;">共' + (d.checkinCount + d.checkoutCount) + '间次</div></div>'+
      '<div style="padding:14px;background:linear-gradient(135deg,#ff4d4f,#ff7875);border-radius:10px;text-align:center;color:white;"><div style="font-size:11px;opacity:0.9;margin-bottom:4px;">超时退房</div><div style="font-size:26px;font-weight:700;">' + d.overtimeCount + '次</div><div style="font-size:10px;opacity:0.8;">产生额外收入</div></div>'+
    '</div>'+
    // 营收明细
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">'+
      '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
        '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">💰 营收构成</div>'+
        '<div style="display:flex;flex-direction:column;gap:8px;">'+
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:8px;height:8px;background:var(--blue);border-radius:50%;flex-shrink:0;"></span><span style="flex:1;">房费收入</span><span style="font-weight:700;color:var(--blue);">¥24,200</span></div>'+
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:8px;height:8px;background:var(--green);border-radius:50%;flex-shrink:0;"></span><span style="flex:1;">押金收取</span><span style="font-weight:700;color:var(--green);">¥4,200</span></div>'+
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:8px;height:8px;background:var(--orange);border-radius:50%;flex-shrink:0;"></span><span style="flex:1;">押金退款</span><span style="font-weight:700;color:var(--orange);">-¥3,850</span></div>'+
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:8px;height:8px;background:var(--purple);border-radius:50%;flex-shrink:0;"></span><span style="flex:1;">超时费</span><span style="font-weight:700;color:var(--purple);">¥580</span></div>'+
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:8px;height:8px;background:var(--red);border-radius:50%;flex-shrink:0;"></span><span style="flex:1;">其他收入</span><span style="font-weight:700;color:var(--red);">¥220</span></div>'+
          '<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px;display:flex;justify-content:space-between;font-size:13px;font-weight:700;"><span>净收入</span><span style="color:var(--blue);">¥24,850</span></div>'+
        '</div>'+
      '</div>'+
      '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
        '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📊 工单与设备状态</div>'+
        '<div style="display:flex;flex-direction:column;gap:8px;">'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;"><span>本月工单总数</span><span style="font-weight:700;">' + d.workorderTotal + '条</span></div>'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;"><span>其中待处理</span><span style="font-weight:700;color:var(--orange);">' + d.workorderPending + '条</span></div>'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;"><span>已完成</span><span style="font-weight:700;color:var(--green);">' + d.workorderDone + '条</span></div>'+
          '<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px;display:flex;justify-content:space-between;font-size:12px;"><span>设备在线率</span><span style="font-weight:700;color:var(--green);">' + Math.round(d.deviceOnline / (d.deviceOnline + d.deviceOffline) * 100) + '% (' + d.deviceOnline + '台)</span></div>'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;"><span>离线设备</span><span style="font-weight:700;color:var(--red);">' + d.deviceOffline + '台</span></div>'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;"><span>本月告警总数</span><span style="font-weight:700;color:var(--orange);">' + d.alertCount + '条</span></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    // 入住率趋势
    '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px;">'+
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">📈 本月入住率趋势（每7天）</div>'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">'+
        '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第1周</div><div style="font-size:22px;font-weight:700;color:var(--blue);">72%</div><div style="font-size:10px;color:var(--text-muted);">03/01-03/07</div></div>'+
        '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第2周</div><div style="font-size:22px;font-weight:700;color:var(--blue);">78%</div><div style="font-size:10px;color:var(--text-muted);">03/08-03/14</div></div>'+
        '<div style="text-align:center;padding:10px;background:var(--green-bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第3周</div><div style="font-size:22px;font-weight:700;color:var(--green);">85%</div><div style="font-size:10px;color:var(--text-muted);">03/15-03/21</div></div>'+
        '<div style="text-align:center;padding:10px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">第4周</div><div style="font-size:22px;font-weight:700;color:var(--blue);">80%</div><div style="font-size:10px;color:var(--text-muted);">03/22-03/28</div></div>'+
      '</div>'+
      '<div style="margin-top:12px;padding:10px;background:var(--green-bg);border-radius:8px;font-size:12px;"><b style="color:var(--green);">📊 月度小结：</b>本月整体运营良好，入住率均值78.5%，较上月提升3.2%。周末入住率持续高于工作日，建议针对性推出工作日促销活动提升平日入住。</div>'+
    '</div>'+
    // 财务核对
    '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:16px;">'+
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">🔍 财务核对清单</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">'+
        '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--green-bg);border-radius:6px;"><span style="color:var(--green);font-size:16px;">✅</span><div><div style="font-size:12px;font-weight:600;color:var(--green);">押金账实相符</div><div style="font-size:11px;color:var(--text-muted);">账面¥4,200，实收¥4,200</div></div></div>'+
        '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--green-bg);border-radius:6px;"><span style="color:var(--green);font-size:16px;">✅</span><div><div style="font-size:12px;font-weight:600;color:var(--green);">退房账单一致</div><div style="font-size:11px;color:var(--text-muted);">核对38间退房记录</div></div></div>'+
        '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--orange-bg);border-radius:6px;"><span style="color:var(--orange);font-size:16px;">⚠️</span><div><div style="font-size:12px;font-weight:600;color:var(--orange);">超时费待收</div><div style="font-size:11px;color:var(--text-muted);">5间共¥580未到账</div></div></div>'+
      '</div>'+
    '</div>'+
    '</div>'+
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">'+
      '<button onclick="showToast(\'📊 月度夜审报告已归档\',\'success\')" class="modal-btn" style="background:var(--bg);border-color:var(--border);padding:8px 16px;font-size:13px;">�归档</button>'+
      '<button onclick="showToast(\'📋 正在生成Excel报表...\',\'info\')" class="modal-btn" style="background:var(--blue-bg);color:var(--blue);border-color:var(--blue);padding:8px 16px;font-size:13px;">📊 导出Excel</button>'+
      '<button onclick="showToast(\'✅ 月度夜审报告已同步至PMS\',\'success\')" class="modal-btn primary" style="background:var(--green);border-color:var(--green);padding:8px 20px;">✅ 完成月度夜审</button>'+
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================
// 【改进v3-新增3】批量固件升级进度追踪弹窗
// 理由：原系统只有发起升级功能，缺少升级进度、状态、结果统计的完整跟踪。
// 新增进度条、状态标签、失败重试、结果统计全流程。
// ============================================================
var firmwareUpgradeJobs = [
  {room:'301', uuid:'A84F1AF2', fromVer:'v2.1.0', toVer:'v2.2.1', status:'done', progress:100, duration:'45s'},
  {room:'302', uuid:'B95G2BG3', fromVer:'v2.1.0', toVer:'v2.2.1', status:'done', progress:100, duration:'52s'},
  {room:'303', uuid:'C06H3CH4', fromVer:'v2.0.8', toVer:'v2.2.1', status:'done', progress:100, duration:'48s'},
  {room:'304', uuid:'D17I4DI5', fromVer:'v2.1.0', toVer:'v2.2.1', status:'upgrading', progress:68, duration:'--'},
  {room:'305', uuid:'E28J5EJ6', fromVer:'v2.0.5', toVer:'v2.2.1', status:'upgrading', progress:35, duration:'--'},
  {room:'306', uuid:'F39K6FK7', fromVer:'v2.1.0', toVer:'v2.2.1', status:'pending', progress:0, duration:'--'},
  {room:'307', uuid:'G40L7GL8', fromVer:'v2.1.0', toVer:'v2.2.1', status:'pending', progress:0, duration:'--'},
  {room:'308', uuid:'H51M8HM9', fromVer:'v2.0.2', toVer:'v2.2.1', status:'failed', progress:42, duration:'--'}
];

function openBatchFirmwareUpgradeProgressModal() {
  var old = document.getElementById('modal-firmware-progress');
  if (old) old.remove();
  var doneCount = firmwareUpgradeJobs.filter(function(j){ return j.status === 'done'; }).length;
  var upgradingCount = firmwareUpgradeJobs.filter(function(j){ return j.status === 'upgrading'; }).length;
  var failedCount = firmwareUpgradeJobs.filter(function(j){ return j.status === 'failed'; }).length;
  var pendingCount = firmwareUpgradeJobs.filter(function(j){ return j.status === 'pending'; }).length;
  var totalCount = firmwareUpgradeJobs.length;
  var html = '<div class="modal-overlay" id="modal-firmware-progress" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-firmware-progress\').remove()">'+
    '<div class="modal" style="width:700px;max-height:88vh;overflow-y:auto;">'+
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">'+
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📦</div><div><div style="font-size:17px;font-weight:700;">批量固件升级进度追踪</div><div style="font-size:12px;color:var(--text-muted);">目标版本 v2.2.1 · 共 ' + totalCount + ' 台设备</div></div></div>'+
    '<button onclick="document.getElementById(\'modal-firmware-progress\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div>'+
    '<div style="padding:20px 24px;">'+
    // 总体进度条
    '<div style="margin-bottom:16px;">'+
      '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:8px;">'+
        '<span>总体进度</span><span id="fw-progress-text">' + doneCount + '/' + totalCount + ' 已完成</span></div>'+
      '<div style="height:16px;background:var(--border);border-radius:8px;overflow:hidden;">'+
        '<div id="fw-progress-bar" style="height:100%;background:linear-gradient(90deg,var(--green),#52c41a);border-radius:8px;transition:width 0.5s;width:' + (doneCount / totalCount * 100) + '%;"></div></div>'+
    '</div>'+
    // 统计卡片
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">'+
      '<div style="padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--green);">' + doneCount + '</div><div style="font-size:11px;color:var(--text-muted);">✅ 已完成</div></div>'+
      '<div style="padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--blue);">' + upgradingCount + '</div><div style="font-size:11px;color:var(--text-muted);">🔄 升级中</div></div>'+
      '<div style="padding:12px;background:var(--red-bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--red);">' + failedCount + '</div><div style="font-size:11px;color:var(--text-muted);">❌ 失败</div></div>'+
      '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--text-muted);">' + pendingCount + '</div><div style="font-size:11px;color:var(--text-muted);">⏳ 等待中</div></div>'+
    '</div>'+
    // 升级详情列表
    '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;overflow:hidden;">'+
      '<div style="padding:10px 16px;background:var(--bg);border-bottom:1px solid var(--border);display:grid;grid-template-columns:60px 1fr 80px 80px 100px 80px;gap:8px;font-size:11px;font-weight:700;color:var(--text-muted);">'+
        '<span>房间</span><span>设备UUID</span><span>当前版本</span><span>目标版本</span><span>状态</span><span>操作</span></div>'+
      '<div id="fw-jobs-list"></div></div>'+
    '</div>'+
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">'+
      '<button onclick="retryAllFailedFirmwareUpgrade()" class="modal-btn" style="background:var(--red-bg);color:var(--red);border-color:var(--red);padding:8px 16px;font-size:13px;">🔄 重试失败设备</button>'+
      '<button onclick="showToast(\'📦 升级日志已导出\',\'success\')" class="modal-btn secondary" style="padding:8px 16px;font-size:13px;">📤 导出日志</button>'+
      '<button onclick="showToast(\'📦 批量固件升级已全部完成！\',\'success\');document.getElementById(\'modal-firmware-progress\').remove()" class="modal-btn primary" style="background:var(--green);border-color:var(--green);padding:8px 20px;">✅ 关闭</button>'+
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  renderFwJobsList();
  simulateFwProgress();
}

function renderFwJobsList() {
  var container = document.getElementById('fw-jobs-list');
  if (!container) return;
  var statusMap = {done:'✅ 已完成', upgrading:'🔄 升级中', pending:'⏳ 等待', failed:'❌ 失败'};
  var statusColor = {done:'var(--green)', upgrading:'var(--blue)', pending:'var(--text-muted)', failed:'var(--red)'};
  var html = '';
  firmwareUpgradeJobs.forEach(function(job) {
    var progressWidth = job.status === 'upgrading' ? job.progress + '%' : job.status === 'done' ? '100%' : job.status === 'failed' ? job.progress + '%' : '0%';
    var progressBg = job.status === 'upgrading' ? 'var(--blue)' : job.status === 'done' ? 'var(--green)' : job.status === 'failed' ? 'var(--red)' : 'var(--border)';
    html += '<div style="padding:10px 16px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:60px 1fr 80px 80px 100px 80px;gap:8px;align-items:center;font-size:12px;">'+
      '<span style="font-weight:700;">' + job.room + '</span>'+
      '<span style="font-size:10px;color:var(--text-muted);font-family:monospace;">' + job.uuid + '</span>'+
      '<span style="font-size:11px;">' + job.fromVer + '</span>'+
      '<span style="font-size:11px;color:var(--green);font-weight:600;">' + job.toVer + '</span>'+
      '<div><div style="display:flex;align-items:center;gap:6px;"><span style="color:' + statusColor[job.status] + ';font-weight:600;">' + statusMap[job.status] + '</span></div>'+
      (job.status === 'upgrading' ? '<div style="height:4px;background:var(--border);border-radius:2px;margin-top:4px;overflow:hidden;"><div style="height:100%;width:' + job.progress + '%;background:var(--blue);border-radius:2px;"></div></div>' : '') +
      (job.status === 'failed' ? '<div style="height:4px;background:var(--border);border-radius:2px;margin-top:4px;overflow:hidden;"><div style="height:100%;width:' + job.progress + '%;background:var(--red);border-radius:2px;"></div></div>' : '') +
      '</div>'+
      '<div style="display:flex;gap:4px;">'+
      (job.status === 'upgrading' ? '<button onclick="showToast(\'⏳ 升级中无法操作\',\'info\')" style="padding:2px 8px;font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:4px;cursor:pointer;">暂停</button>' : '') +
      (job.status === 'failed' ? '<button onclick="retrySingleFirmwareUpgrade(\'' + job.room + '\')" style="padding:2px 8px;font-size:10px;background:var(--red-bg);color:var(--red);border:1px solid var(--red);border-radius:4px;cursor:pointer;">重试</button>' : '') +
      (job.status === 'pending' ? '<button onclick="showToast(\'⏳ 设备在队列中\',\'info\')" style="padding:2px 8px;font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:4px;cursor:pointer;">取消</button>' : '') +
      (job.status === 'done' ? '<span style="font-size:10px;color:var(--green);">' + job.duration + '</span>' : '') +
      '</div></div>';
  });
  container.innerHTML = html;
}

function simulateFwProgress() {
  var interval = setInterval(function() {
    var upgradingJobs = firmwareUpgradeJobs.filter(function(j){ return j.status === 'upgrading'; });
    if (upgradingJobs.length === 0) { clearInterval(interval); return; }
    upgradingJobs.forEach(function(job) {
      job.progress = Math.min(100, job.progress + Math.floor(Math.random() * 8) + 3);
      if (job.progress >= 100) {
        job.status = 'done';
        job.progress = 100;
        job.duration = Math.floor(Math.random() * 20 + 40) + 's';
      }
    });
    // 启动pending的job
    var pendingJobs = firmwareUpgradeJobs.filter(function(j){ return j.status === 'pending'; });
    if (pendingJobs.length > 0 && upgradingJobs.length < 2) {
      var pj = pendingJobs[0];
      pj.status = 'upgrading';
      pj.progress = 0;
    }
    var doneCount = firmwareUpgradeJobs.filter(function(j){ return j.status === 'done'; }).length;
    var totalCount = firmwareUpgradeJobs.length;
    var progressBar = document.getElementById('fw-progress-bar');
    var progressText = document.getElementById('fw-progress-text');
    if (progressBar) progressBar.style.width = (doneCount / totalCount * 100) + '%';
    if (progressText) progressText.textContent = doneCount + '/' + totalCount + ' 已完成';
    renderFwJobsList();
  }, 1500);
}

function retryAllFailedFirmwareUpgrade() {
  firmwareUpgradeJobs.forEach(function(job) {
    if (job.status === 'failed') {
      job.status = 'upgrading';
      job.progress = 0;
    }
  });
  showToast('🔄 已重新提交所有失败设备', 'success');
  renderFwJobsList();
  simulateFwProgress();
}

function retrySingleFirmwareUpgrade(room) {
  var job = firmwareUpgradeJobs.find(function(j){ return j.room === room; });
  if (job) {
    job.status = 'upgrading';
    job.progress = 0;
    showToast('🔄 正在重试 ' + room + '...', 'success');
    renderFwJobsList();
  }
}

// ============================================================
// 【改进v3-新增4】宾客投诉满意度回访弹窗（完整流程）
// 理由：投诉管理已有页面，但完整的回访流程（发送回访→评分→记录）未闭环。
// 新增：选择回访方式 → 发送回访 → 接收评分 → 保存回访记录。
// ============================================================
var complaintSurveyCache = {};

function openComplaintSurveyModal(cpId) {
  var old = document.getElementById('modal-complaint-survey');
  if (old) old.remove();
  var db = {
    'CP-2026032601': {guest:'张先生', phone:'137****9012', room:'201', type:'设施故障', handler:'王工', score:3},
    'CP-2026032501': {guest:'李先生', phone:'138****1234', room:'301', type:'噪音问题', handler:'周敏', score:null}
  };
  var d = db[cpId] || {guest:'张先生', phone:'137****9012', room:'201', type:'设施故障', handler:'王工', score:null};
  var step = d.score ? 2 : 1;
  renderComplaintSurveyStep(cpId, d, step);
}

function renderComplaintSurveyStep(cpId, d, step) {
  var old = document.getElementById('modal-complaint-survey');
  if (old) old.remove();
  var overlay = document.createElement('div');
  overlay.id = 'modal-complaint-survey';
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
  var content = document.createElement('div');
  content.style = 'width:520px;max-height:88vh;overflow-y:auto;background:white;border-radius:14px;';
  if (step === 1) {
    content.innerHTML = getSurveyStep1(cpId, d);
  } else if (step === 2) {
    content.innerHTML = getSurveyStep2(cpId, d);
  }
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function getSurveyStep1(cpId, d) {
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">📞</div><div><div style="font-size:15px;font-weight:700;">回访客户</div><div style="font-size:11px;color:var(--text-muted);">第1步：选择回访方式</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-complaint-survey\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:12px;color:var(--text-muted);">回访对象</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--blue);">' + d.guest + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">📱 ' + d.phone + ' · ' + d.room + '房 · ' + d.type + '</div></div>' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:12px;">请选择回访方式</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' +
    '<div onclick="selectSurveyMethod(this,\'phone\')" class="survey-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div class="survey-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">📞 电话回访</div><div style="margin-left:auto;font-size:11px;color:var(--text-muted);">推荐</div></div></div>' +
    '<div onclick="selectSurveyMethod(this,\'sms\')" class="survey-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div class="survey-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">💬 短信回访</div><div style="margin-left:auto;font-size:11px;color:var(--text-muted);">发送评价链接</div></div></div>' +
    '<div onclick="selectSurveyMethod(this,\'wechat\')" class="survey-method-option" style="padding:14px;border:2px solid var(--border);border-radius:8px;cursor:pointer;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div class="survey-radio" style="width:18px;height:18px;border:2px solid var(--border);border-radius:50%;flex-shrink:0;"></div>' +
    '<div style="font-size:15px;">💚 微信回访</div><div style="margin-left:auto;font-size:11px;color:var(--text-muted);">发送服务评价表单</div></div></div>' +
    '</div>' +
    '<div class="form-group" style="margin-bottom:16px;">' +
    '<label class="form-label">回访备注</label>' +
    '<textarea class="form-textarea" id="survey-note" placeholder="记录回访前沟通要点（选填）" style="font-size:12px;min-height:50px;"></textarea></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-complaint-survey\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="sendComplaintSurvey(\'' + cpId + '\', \'' + d.guest + '\', \'' + d.phone + '\')" class="modal-btn primary" style="padding:8px 24px;background:var(--blue);border-color:var(--blue);color:white;">发送回访 →</button></div>' +
    '</div></div>';
}

function getSurveyStep2(cpId, d) {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span onclick="setSurveyScore(' + i + ', this)" class="survey-star" style="font-size:32px;cursor:pointer;color:var(--border);transition:color 0.2s;" data-score="' + i + '">★</span>';
  }
  return '<div>' +
    '<div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">⭐</div><div><div style="font-size:15px;font-weight:700;">满意度评分</div><div style="font-size:11px;color:var(--text-muted);">请选择客人满意度（1-5星）</div></div></div>' +
    '<button onclick="document.getElementById(\'modal-complaint-survey\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 20px;">' +
    '<div style="padding:14px;background:var(--blue-bg);border-radius:8px;margin-bottom:16px;text-align:center;">' +
    '<div style="font-size:12px;color:var(--text-muted);">客人评分</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--blue);">' + d.guest + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">投诉编号：' + cpId + '</div></div>' +
    '<div style="text-align:center;margin-bottom:16px;">' +
    '<div id="survey-stars-container" style="margin-bottom:8px;">' + stars + '</div>' +
    '<div style="font-size:13px;color:var(--text-muted);" id="survey-score-label">点击星星评分</div></div>' +
    '<div class="form-group" style="margin-bottom:16px;">' +
    '<label class="form-label">回访备注</label>' +
    '<textarea class="form-textarea" id="survey-final-note" placeholder="记录客人反馈和改进建议..." style="font-size:12px;min-height:60px;"></textarea></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-complaint-survey\').remove()" class="modal-btn secondary" style="padding:8px 20px;">取消</button>' +
    '<button onclick="submitComplaintSurvey(\'' + cpId + '\')" id="survey-submit-btn" class="modal-btn primary" style="padding:8px 24px;background:var(--blue);border-color:var(--blue);color:white;" disabled>请先评分</button></div>' +
    '</div></div>';
}

function selectSurveyMethod(el, method) {
  document.querySelectorAll('.survey-method-option').forEach(function(o) {
    o.style.borderColor = 'var(--border)';
    o.querySelector('.survey-radio').style.background = 'white';
  });
  el.style.borderColor = 'var(--blue)';
  el.querySelector('.survey-radio').style.background = 'var(--blue)';
  el.querySelector('.survey-radio').style.borderColor = 'var(--blue)';
}

function sendComplaintSurvey(cpId, guest, phone) {
  showToast('📞 回访请求已发送至 ' + phone, 'success');
  var d = {guest: guest, phone: phone, room: '201', type:'设施故障', score: null};
  setTimeout(function() { renderComplaintSurveyStep(cpId, d, 2); }, 1000);
}

function setSurveyScore(score, el) {
  document.querySelectorAll('.survey-star').forEach(function(s) {
    s.style.color = parseInt(s.dataset.score) <= score ? 'var(--orange)' : 'var(--border)';
  });
  var labels = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
  document.getElementById('survey-score-label').textContent = labels[score];
  document.getElementById('survey-submit-btn').disabled = false;
  document.getElementById('survey-submit-btn').textContent = '⭐ 提交 ' + score + '星评价';
  window._surveyScore = score;
}

function submitComplaintSurvey(cpId) {
  var score = window._surveyScore || 3;
  var note = document.getElementById('survey-final-note') ? document.getElementById('survey-final-note').value : '';
  showToast('✅ 投诉 ' + cpId + ' 满意度评分 ' + score + '星，已记录回访结果', 'success');
  document.getElementById('modal-complaint-survey').remove();
}

// ============================================================
// 【改进v3-新增5】会员余额预警配置增强版V3
// 理由：原系统会员余额预警配置入口较深，且缺少测试通知功能。
// 新增余额阈值配置 + 多通道预警开关 + 测试通知 + 规则启用/停用。
// ============================================================
var mbAlertConfigV3 = {
  enabled: true,
  threshold: 50,
  channels: { sms: true, wechat: true, phone: false },
  advanceHours: 24,
  repeatInterval: 12,
  repeatEnabled: true
};

function openMemberBalanceAlertConfigV3FromMenu() {
  openMemberBalanceAlertConfigV3();
}

function openMemberBalanceAlertConfigV3() {
  var old = document.getElementById('modal-mb-alert-v3');
  if (old) old.remove();
  var c = mbAlertConfigV3;
  var html = '<div class="modal-overlay" id="modal-mb-alert-v3" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;" onclick="if(event.target===this)document.getElementById(\'modal-mb-alert-v3\').remove()">'+
    '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;">'+
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">'+
    '<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">🔔</div><div><div style="font-size:17px;font-weight:700;">会员余额预警配置 V3</div><div style="font-size:12px;color:var(--text-muted);">余额不足提醒 · 多通道通知 · 智能重复</div></div></div>'+
    '<div style="display:flex;align-items:center;gap:8px;"><div id="mb-v3-status-badge" style="padding:3px 10px;background:' + (c.enabled ? 'var(--green-bg)' : 'var(--bg)') + ';color:' + (c.enabled ? 'var(--green)' : 'var(--text-muted)') + ';border-radius:12px;font-size:11px;font-weight:600;">' + (c.enabled ? '✅ 已启用' : '⛔ 已停用') + '</div>'+
    '<button onclick="document.getElementById(\'modal-mb-alert-v3\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button></div></div>'+
    '<div style="padding:20px 24px;">'+
    // 启用开关
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg);border-radius:8px;margin-bottom:16px;">'+
      '<div><div style="font-size:14px;font-weight:700;">余额预警总开关</div><div style="font-size:12px;color:var(--text-muted);">关闭后不会发送任何预警通知</div></div>'+
      '<label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer;">'+
        '<input type="checkbox" id="mb-v3-enabled" ' + (c.enabled ? 'checked' : '') + ' onchange="toggleMbV3Enabled(this.checked)" style="opacity:0;width:0;height:0;position:absolute;">'+
        '<span id="mb-v3-toggle-track" style="position:absolute;top:0;left:0;right:0;bottom:0;background:' + (c.enabled ? 'var(--green)' : 'var(--border)') + ';border-radius:13px;transition:0.3s;"></span>'+
        '<span id="mb-v3-toggle-thumb" style="position:absolute;top:3px;left:' + (c.enabled ? '25px' : '3px') + ';width:20px;height:20px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>'+
      '</label></div>'+
    // 余额阈值
    '<div class="form-group" style="margin-bottom:16px;">'+
      '<label class="form-label">余额预警阈值</label>'+
      '<div style="display:flex;align-items:center;gap:10px;">'+
        '<input type="number" id="mb-v3-threshold" class="form-input" value="' + c.threshold + '" min="0" max="1000" style="width:120px;padding:8px 12px;font-size:14px;">'+
        '<span style="font-size:13px;color:var(--text-muted);">元（余额低于此值时触发预警）</span></div></div>'+
    // 提前通知时间
    '<div class="form-group" style="margin-bottom:16px;">'+
      '<label class="form-label">提前通知时间</label>'+
      '<div style="display:flex;align-items:center;gap:10px;">'+
        '<input type="number" id="mb-v3-advance" class="form-input" value="' + c.advanceHours + '" min="1" max="72" style="width:100px;padding:8px 12px;font-size:14px;">'+
        '<span style="font-size:13px;color:var(--text-muted);">小时（在余额预计耗尽前N小时提醒）</span></div></div>'+
    // 重复提醒
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:16px;">'+
      '<div><div style="font-size:13px;font-weight:600;">重复提醒</div><div style="font-size:11px;color:var(--text-muted);">未充值时每隔N小时重复提醒</div></div>'+
      '<div style="display:flex;align-items:center;gap:8px;">'+
        '<input type="checkbox" id="mb-v3-repeat" ' + (c.repeatEnabled ? 'checked' : '') + ' onchange="toggleMbV3Repeat(this.checked)" style="accent-color:var(--blue);width:16px;height:16px;">'+
        '<span style="font-size:12px;color:var(--text-muted);">每</span>'+
        '<input type="number" id="mb-v3-interval" class="form-input" value="' + c.repeatInterval + '" min="1" max="48" ' + (c.repeatEnabled ? '' : 'disabled') + ' style="width:60px;padding:4px 8px;font-size:12px;">'+
        '<span style="font-size:12px;color:var(--text-muted);">小时</span></div></div>'+
    // 通知渠道
    '<div class="form-group" style="margin-bottom:16px;">'+
      '<label class="form-label">通知渠道（可多选）</label>'+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">'+
        '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border-radius:8px;cursor:pointer;">'+
          '<input type="checkbox" id="mb-v3-sms" ' + (c.channels.sms ? 'checked' : '') + ' onchange="updateMbV3Channels()" style="accent-color:var(--blue);width:16px;height:16px;">'+
          '<span style="font-size:14px;">📱 短信通知</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">¥0.1/条</span></label>'+
        '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border-radius:8px;cursor:pointer;">'+
          '<input type="checkbox" id="mb-v3-wechat" ' + (c.channels.wechat ? 'checked' : '') + ' onchange="updateMbV3Channels()" style="accent-color:var(--green);width:16px;height:16px;">'+
          '<span style="font-size:14px;">💚 微信公众号推送</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">免费</span></label>'+
        '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border-radius:8px;cursor:pointer;">'+
          '<input type="checkbox" id="mb-v3-phone" ' + (c.channels.phone ? 'checked' : '') + ' onchange="updateMbV3Channels()" style="accent-color:var(--orange);width:16px;height:16px;">'+
          '<span style="font-size:14px;">📞 电话回访</span><span style="margin-left:auto;font-size:11px;color:var(--text-muted);">¥1.0/次</span></label>'+
      '</div></div>'+
    // 模拟预览
    '<div style="padding:12px 14px;background:var(--orange-bg);border-radius:8px;margin-bottom:16px;">'+
      '<div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:8px;">📋 预警触发预览（余额 ¥' + c.threshold + ' 时）</div>'+
      '<div style="font-size:11px;color:var(--text);line-height:1.6;">'+
        '<b>尊敬的会员您好，您的账户余额即将耗尽。当前余额 ¥' + c.threshold + '，预计在 ' + c.advanceHours + ' 小时后用尽。为不影响您的入住体验，请及时充值。酒店前台：400-xxx-xxxx</b>'+
      '</div></div>'+
    '</div>'+
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;">'+
      '<button onclick="testMbV3Notification()" class="modal-btn secondary" style="padding:8px 16px;font-size:13px;">🧪 发送测试通知</button>'+
      '<div style="display:flex;gap:10px;">'+
        '<button onclick="document.getElementById(\'modal-mb-alert-v3\').remove()" class="modal-btn secondary" style="padding:8px 16px;font-size:13px;">取消</button>'+
        '<button onclick="saveMbV3Config()" class="modal-btn primary" style="background:var(--blue);border-color:var(--blue);padding:8px 20px;font-size:13px;color:white;">💾 保存配置</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function toggleMbV3Enabled(checked) {
  var track = document.getElementById('mb-v3-toggle-track');
  var thumb = document.getElementById('mb-v3-toggle-thumb');
  var badge = document.getElementById('mb-v3-status-badge');
  if (checked) {
    track.style.background = 'var(--green)';
    thumb.style.left = '25px';
    badge.style.background = 'var(--green-bg)';
    badge.style.color = 'var(--green)';
    badge.textContent = '✅ 已启用';
  } else {
    track.style.background = 'var(--border)';
    thumb.style.left = '3px';
    badge.style.background = 'var(--bg)';
    badge.style.color = 'var(--text-muted)';
    badge.textContent = '⛔ 已停用';
  }
}

function toggleMbV3Repeat(checked) {
  var interval = document.getElementById('mb-v3-interval');
  if (interval) interval.disabled = !checked;
}

function updateMbV3Channels() {}

function testMbV3Notification() {
  showToast('🧪 测试通知已发送至当前账号（短信+微信），请注意查收', 'success');
}

function saveMbV3Config() {
  mbAlertConfigV3.enabled = document.getElementById('mb-v3-enabled').checked;
  mbAlertConfigV3.threshold = parseInt(document.getElementById('mb-v3-threshold').value) || 50;
  mbAlertConfigV3.advanceHours = parseInt(document.getElementById('mb-v3-advance').value) || 24;
  mbAlertConfigV3.repeatEnabled = document.getElementById('mb-v3-repeat').checked;
  mbAlertConfigV3.repeatInterval = parseInt(document.getElementById('mb-v3-interval').value) || 12;
  mbAlertConfigV3.channels.sms = document.getElementById('mb-v3-sms').checked;
  mbAlertConfigV3.channels.wechat = document.getElementById('mb-v3-wechat').checked;
  mbAlertConfigV3.channels.phone = document.getElementById('mb-v3-phone').checked;
  showToast('✅ 余额预警配置 V3 已保存（阈值：¥' + mbAlertConfigV3.threshold + '）', 'success');
  document.getElementById('modal-mb-alert-v3').remove();
}
