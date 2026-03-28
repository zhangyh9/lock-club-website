
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
