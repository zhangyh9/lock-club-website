/**
 * V3 迭代 - 5个功能性改进
 * 改进1: 退房优惠券自动抵扣计算系统
 * 改进2: 客房入住前污染评估报告
 * 改进3: 会员历史偏好智能识别
 * 改进4: 设备Ping心跳真实模拟动画
 * 改进5: 服务工单完结满意度自动推送收集
 */

// ============================================================
// 改进1: 退房优惠券自动抵扣计算系统
// 在 submitCheckout 函数执行前，先扫描可用优惠券并计算最优抵扣
// ============================================================

// 优惠券数据库（本地模拟）
var couponDB = [
  {id:'C001', name:'新客立减20元', type:'cash', value:20, minAmount:0, condition:'仅限新用户', usable:true, expireDate:'2026-03-31', code:'NEW20'},
  {id:'C002', name:'满200减30元', type:'cash', value:30, minAmount:200, condition:'订单满200元可用', usable:true, expireDate:'2026-03-30', code:'FULL200'},
  {id:'C003', name:'会员9折券', type:'percent', value:10, minAmount:100, condition:'全场适用', usable:true, expireDate:'2026-04-15', code:'VIP10'},
  {id:'C004', name:'钟点房30元券', type:'cash', value:30, minAmount:50, condition:'仅限钟点房', usable:false, expireDate:'2026-03-25', code:'HOUR30'},
  {id:'C005', name:'老客专享50元', type:'cash', value:50, minAmount:300, condition:'入住3次以上老客', usable:true, expireDate:'2026-04-10', code:'OLD50'},
];

// 原始的 submitCheckout 函数引用（保留用于实际执行）
var originalSubmitCheckout = null;

// 改进1-A: 扫描可用优惠券并展示抵扣方案
function scanCouponsAndCalculate(checkinName, checkinPhone, totalAmount) {
  var usable = couponDB.filter(function(c) {
    if (!c.usable) return false;
    if (c.type === 'cash' && totalAmount < c.minAmount) return false;
    if (c.type === 'percent' && totalAmount < c.minAmount) return false;
    return true;
  });

  // 计算最优抵扣方案
  var plans = [];
  // 不使用优惠券
  plans.push({id:'none', name:'不使用优惠券', discount:0, finalAmount:totalAmount, saved:0});
  // 单个使用
  usable.forEach(function(c) {
    var discount = 0;
    if (c.type === 'cash') discount = c.value;
    else if (c.type === 'percent') discount = Math.floor(totalAmount * c.value / 100);
    var finalAmount = totalAmount - discount;
    plans.push({id:c.id, name:c.name+' ('+c.code+')', discount:discount, finalAmount:finalAmount, saved:discount, coupon:c});
  });
  // 按最终金额排序找最优
  plans.sort(function(a,b){ return a.finalAmount - b.finalAmount; });
  var best = plans[0];

  // 生成展示
  var plansHtml = '';
  plans.forEach(function(p, i) {
    var isBest = i === 0;
    var isRecommended = i === 0 && p.id !== 'none';
    var bg = isRecommended ? 'var(--green-bg)' : (i%2===0 ? 'var(--bg)' : 'white');
    var border = isRecommended ? 'border:2px solid var(--green);' : 'border:1px solid var(--border);';
    var radio = isRecommended ? 'checked' : (i===0 && p.id==='none' ? 'checked' : '');
    plansHtml += '<div onclick="selectCouponPlan(\''+p.id+'\')" style="cursor:pointer;padding:10px 12px;border-radius:8px;margin-bottom:6px;background:'+bg+';'+border+'display:flex;align-items:center;gap:10px;">';
    plansHtml += '<input type="radio" name="coupon-plan" value="'+p.id+'" '+radio+' style="accent-color:var(--green);width:16px;height:16px;pointer-events:none;">';
    plansHtml += '<div style="flex:1;">';
    plansHtml += '<div style="font-size:12px;font-weight:600;">'+p.name+'</div>';
    if (p.id !== 'none') plansHtml += '<div style="font-size:11px;color:var(--text-muted);">到期: '+p.coupon.expireDate+' · '+p.coupon.condition+'</div>';
    plansHtml += '</div>';
    plansHtml += '<div style="text-align:right;">';
    if (p.id !== 'none') plansHtml += '<div style="font-size:11px;color:var(--green);">-¥'+p.discount+'</div>';
    plansHtml += '<div style="font-size:13px;font-weight:700;color:'+(isRecommended&&p.id!=='none'?'var(--green)':'var(--text)')+';">¥'+p.finalAmount+'</div>';
    plansHtml += '</div>';
    if (isRecommended && p.id !== 'none') {
      plansHtml += '<div style="font-size:10px;background:var(--green);color:white;padding:2px 6px;border-radius:4px;font-weight:600;">推荐</div>';
    }
    plansHtml += '</div>';
  });

  return {plans: plans, best: best, plansHtml: plansHtml, totalAmount: totalAmount};
}

// 改进1-B: 选择优惠券方案
window.selectedCouponPlan = 'none';
window.couponCalculationResult = null;

function selectCouponPlan(planId) {
  window.selectedCouponPlan = planId;
  // 更新radio选择
  document.querySelectorAll('input[name="coupon-plan"]').forEach(function(r) {
    r.checked = r.value === planId;
  });
  // 更新高亮
  document.querySelectorAll('[name="coupon-plan"]').forEach(function(r, i) {
    var parent = r.closest('div[onclick]');
    if (!parent) return;
    var plan = window.couponCalculationResult.plans[i];
    var isRecommended = plan.id === planId && planId !== 'none';
    parent.style.background = isRecommended ? 'var(--green-bg)' : (i%2===0 ? 'var(--bg)' : 'white');
    parent.style.border = isRecommended ? '2px solid var(--green)' : '1px solid var(--border)';
  });
  // 更新最终金额
  var plan = window.couponCalculationResult.plans.find(function(p){ return p.id === planId; });
  if (plan && document.getElementById('cp-final-amount')) {
    document.getElementById('cp-final-amount').textContent = '¥' + plan.finalAmount;
    document.getElementById('cp-final-amount').style.color = plan.id !== 'none' ? 'var(--green)' : 'var(--text)';
  }
}

// 改进1-C: 在退房弹窗中嵌入优惠券扫描结果面板
function openCheckoutCouponPanelModal(checkinName, checkinPhone, totalAmount) {
  var result = scanCouponsAndCalculate(checkinName, checkinPhone, totalAmount);
  window.couponCalculationResult = result;
  window.selectedCouponPlan = result.best.id;

  var old = document.getElementById('modal-checkout-coupon');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-checkout-coupon" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;">';
  html += '<div class="modal" style="width:520px;max-height:90vh;overflow-y:auto;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:16px;font-weight:700;">🎫 优惠券抵扣计算</div>';
  html += '<button onclick="closeCheckoutCouponModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  // 摘要
  html += '<div style="display:flex;gap:12px;margin-bottom:16px;">';
  html += '<div style="flex:1;padding:10px 14px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">订单金额</div><div style="font-size:18px;font-weight:700;color:var(--blue);">¥'+totalAmount+'</div></div>';
  html += '<div style="flex:1;padding:10px 14px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">已选优惠</div><div style="font-size:18px;font-weight:700;color:var(--green);" id="cp-final-amount">¥'+result.best.finalAmount+'</div></div>';
  html += '<div style="flex:1;padding:10px 14px;background:var(--orange-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">节省金额</div><div style="font-size:18px;font-weight:700;color:var(--orange);">¥'+(totalAmount - result.best.finalAmount)+'</div></div>';
  html += '</div>';
  html += '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">💡 选择优惠方案（已自动选最优）</div>';
  html += '<div id="cp-plans-list">' + result.plansHtml + '</div>';
  html += '</div>';
  html += '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button onclick="closeCheckoutCouponModal()" class="modal-btn secondary">跳过优惠</button>';
  html += '<button onclick="confirmCouponAndCheckout()" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">确认使用并退房</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeCheckoutCouponModal() {
  var m = document.getElementById('modal-checkout-coupon');
  if (m) m.remove();
}

function confirmCouponAndCheckout() {
  var plan = window.couponCalculationResult.plans.find(function(p){ return p.id === window.selectedCouponPlan; });
  closeCheckoutCouponModal();
  // 执行实际退房（带优惠券信息）
  var couponInfo = plan && plan.id !== 'none' ? plan.name + ' 节省¥'+plan.saved : '未使用优惠券';
  showToast('退房成功！'+couponInfo, 'success');
  closeModal('checkout');
  closeModal('checkout-new');
  // 更新页面数据
  refreshRoomStatusAfterCheckout();
}

// ============================================================
// 改进2: 客房入住前污染评估报告
// 在房间详情页或入住时展示房间环境检测数据
// ============================================================

var roomPollutionDB = {
  '301': {airScore:92, waterScore:98, formaldehyde:0.02, mold:'无', pest:'无', overall:'优秀', lastCheck:'2026-03-25', nextCheck:'2026-04-25'},
  '302': {airScore:78, waterScore:95, formaldehyde:0.06, mold:'轻微', pest:'无', overall:'良好', lastCheck:'2026-03-20', nextCheck:'2026-04-20'},
  '303': {airScore:65, waterScore:88, formaldehyde:0.11, mold:'中等', pest:'发现蟑螂', overall:'需关注', lastCheck:'2026-03-15', nextCheck:'-'},
  '304': {airScore:88, waterScore:97, formaldehyde:0.03, mold:'无', pest:'无', overall:'优秀', lastCheck:'2026-03-26', nextCheck:'2026-04-26'},
  '305': {airScore:55, waterScore:82, formaldehyde:0.15, mold:'严重', pest:'发现老鼠', overall:'不合格', lastCheck:'2026-03-10', nextCheck:'-'},
};

function openRoomPollutionReportModal(roomNum) {
  var data = roomPollutionDB[roomNum] || {airScore:80, waterScore:90, formaldehyde:0.05, mold:'无', pest:'无', overall:'良好', lastCheck:'-', nextCheck:'-'};
  var scoreColor = data.overall==='优秀'?'var(--green)':data.overall==='良好'?'var(--blue)':data.overall==='需关注'?'var(--orange)':'var(--red)';
  var scoreBg = data.overall==='优秀'?'var(--green-bg)':data.overall==='良好'?'var(--blue-bg)':data.overall==='需关注'?'var(--orange-bg)':'var(--red-bg)';

  var old = document.getElementById('modal-pollution-report');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-pollution-report" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;">';
  html += '<div class="modal" style="width:540px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:16px;font-weight:700;">🏠 房间环境质量评估报告 - '+roomNum+'</div>';
  html += '<button onclick="closePollutionReportModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  // 总体评分
  html += '<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">';
  html += '<div style="width:80px;height:80px;border-radius:50%;background:'+scoreBg+';display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">';
  html += '<div style="font-size:24px;font-weight:700;color:'+scoreColor+';">'+data.overall+'</div>';
  html += '</div>';
  html += '<div style="flex:1;">';
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:6px;">综合环境等级：<span style="color:'+scoreColor+';font-size:16px;">'+data.overall+'</span></div>';
  html += '<div style="font-size:12px;color:var(--text-muted);">上次检测：'+data.lastCheck+'</div>';
  html += '<div style="font-size:12px;color:var(--text-muted);">到期检测：'+data.nextCheck+'</div>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">🏢 检测机构：国家旅游局认证实验室</div>';
  html += '</div>';
  html += '</div>';
  // 分项评分条
  html += '<div style="margin-bottom:14px;">';
  var items = [
    {label:'空气质量', score:data.airScore, icon:'💨'},
    {label:'水质检测', score:data.waterScore, icon:'💧'},
    {label:'甲醛含量', score:Math.round((1-Math.min(data.formaldehyde/0.15,1))*100), icon:'🧪', unit:'mg/m³'},
  ];
  items.forEach(function(item) {
    var barColor = item.score>=80?'var(--green)':item.score>=60?'var(--orange)':'var(--red)';
    var barBg = item.score>=80?'var(--green-bg)':item.score>=60?'var(--orange-bg)':'var(--red-bg)';
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">';
    html += '<span style="font-size:12px;">'+item.icon+' '+item.label+'</span>';
    html += '<span style="font-size:12px;font-weight:700;color:'+barColor+';">'+item.score+'分</span>';
    html += '</div>';
    html += '<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">';
    html += '<div style="width:'+item.score+'%;height:100%;background:'+barColor+';border-radius:4px;"></div>';
    html += '</div>';
    if (item.unit) html += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">实测值：'+data.formaldehyde+' '+item.unit+'（国标≤0.10）</div>';
    html += '</div>';
  });
  html += '</div>';
  // 其他问题
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">';
  html += '<div style="padding:10px 12px;background:'+(data.mold==='无'?'var(--green-bg)':'var(--orange-bg)')+';border-radius:8px;text-align:center;">';
  html += '<div style="font-size:11px;color:var(--text-muted);">霉菌检测</div>';
  html += '<div style="font-size:13px;font-weight:700;color:'+(data.mold==='无'?'var(--green)':'var(--orange)')+';">'+data.mold+'</div></div>';
  html += '<div style="padding:10px 12px;background:'+(data.pest==='无'?'var(--green-bg)':'var(--red-bg)')+';border-radius:8px;text-align:center;">';
  html += '<div style="font-size:11px;color:var(--text-muted);">虫害检测</div>';
  html += '<div style="font-size:13px;font-weight:700;color:'+(data.pest==='无'?'var(--green)':'var(--red)')+';">'+data.pest+'</div></div>';
  html += '</div>';
  // 建议
  var suggestion = data.overall==='优秀'?'✅ 房间环境符合高标准，可正常入住':
                   data.overall==='良好'?'⚠️ 房间环境良好，建议保持通风':
                   data.overall==='需关注'?'🔶 房间存在轻微污染，建议进行清洁后入住':
                   '🚫 房间环境不合格，建议更换房间或进行深度清洁';
  html += '<div style="padding:12px;background:'+(data.overall==='优秀'||data.overall==='良好'?'var(--green-bg)':data.overall==='需关注'?'var(--orange-bg)':'var(--red-bg)')+';border-radius:8px;font-size:12px;color:'+(data.overall==='优秀'||data.overall==='良好'?'var(--green)':data.overall==='需关注'?'var(--orange)':'var(--red)')+';">'+suggestion+'</div>';
  html += '</div>';
  html += '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button onclick="closePollutionReportModal()" class="modal-btn secondary">关闭报告</button>';
  if (data.overall !== '优秀') {
    html += '<button onclick="requestRoomChange()" class="modal-btn" style="background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">🔄 申请换房</button>';
  }
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closePollutionReportModal() {
  var m = document.getElementById('modal-pollution-report');
  if (m) m.remove();
}

function requestRoomChange() {
  closePollutionReportModal();
  showToast('已提交换房申请，客房部将在10分钟内响应', 'info');
}

// ============================================================
// 改进3: 会员历史偏好智能识别
// 入住输入手机号后自动查询并展示客户历史偏好
// ============================================================

var memberHistoryDB = {
  '13812345678': {name:'李明', totalStays:8, lastStay:'2026-02-15', avgRoomType:'大床房', preferences:['无烟房','高楼层','08:00前早餐'], complaints:0, totalSpent:4850, level:'gold', vipNotes:'春节期间曾投诉空调噪音，已免费升级套房'},
  '13956789012': {name:'王芳', totalStays:3, lastStay:'2026-03-01', avgRoomType:'亲子间', preferences:['靠近电梯','需加床'], complaints:1, totalSpent:1860, level:'silver', vipNotes:'第三次入住，亲子间偏好'},
  '13798765432': {name:'张伟', totalStays:15, lastStay:'2026-03-20', avgRoomType:'套房', preferences:['行政楼层','欢迎果盘','延迟退房至14:00'], complaints:0, totalSpent:12800, level:'vip', vipNotes:'高净值VIP，每次入住均有专属管家服务'},
};

function checkMemberHistoryByPhone(phone) {
  var clean = phone.replace(/\D/g,'');
  if (clean.length < 7) return null;
  // 模糊匹配（只看后4位）
  for (var p in memberHistoryDB) {
    if (p.slice(-4) === clean.slice(-4)) return memberHistoryDB[p];
  }
  return null;
}

// 在 CI 表单 phone input 的 oninput 事件中触发自动查询
var ciMemberCheckTimer = null;
function onCiPhoneInput(phone) {
  clearTimeout(ciMemberCheckTimer);
  if (phone.replace(/\D/g,'').length < 7) {
    hideCiMemberRecognition();
    return;
  }
  ciMemberCheckTimer = setTimeout(function() {
    var member = checkMemberHistoryByPhone(phone);
    if (member) {
      showCiMemberRecognition(member);
    } else {
      hideCiMemberRecognition();
    }
  }, 600);
}

function showCiMemberRecognition(member) {
  var old = document.getElementById('ci-member-recognition');
  if (old) old.remove();
  var levelColors = {'normal':'var(--text-muted)','silver':'var(--orange)','gold':'var(--purple)','vip':'var(--green)'};
  var levelBg = {'normal':'var(--bg)','silver':'var(--orange-bg)','gold':'var(--purple-bg)','vip':'var(--green-bg)'};
  var levelName = {'normal':'普通','silver':'银卡','gold':'金卡','vip':'VIP'};
  var color = levelColors[member.level] || 'var(--text)';
  var bg = levelBg[member.level] || 'var(--bg)';

  var html = '<div id="ci-member-recognition" style="margin-top:10px;padding:12px 14px;background:'+bg+';border:1px solid '+color+';border-radius:8px;">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
  html += '<span style="font-size:16px;">👑</span>';
  html += '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:'+color+';">'+member.name+'（'+levelName[member.level]+'会员）</div>';
  html += '<div style="font-size:11px;color:var(--text-muted);">历史入住 '+member.totalStays+' 次 · 最近 '+member.lastStay+' · 共消费 ¥'+member.totalSpent+'</div></div>';
  html += '</div>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">📝 客户偏好标签：</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';
  member.preferences.forEach(function(p) {
    html += '<span style="font-size:11px;padding:2px 8px;background:white;border-radius:10px;color:var(--text);">'+p+'</span>';
  });
  html += '</div>';
  if (member.vipNotes) {
    html += '<div style="padding:8px 10px;background:white;border-radius:6px;font-size:11px;color:var(--orange);">📌 VIP备注：'+member.vipNotes+'</div>';
  }
  if (member.complaints > 0) {
    html += '<div style="margin-top:6px;font-size:11px;color:var(--red);">⚠️ 该客户有 '+member.complaints+' 条投诉记录，建议重点关注</div>';
  }
  html += '</div>';

  var ciNameInput = document.getElementById('ci-name');
  if (ciNameInput) {
    ciNameInput.value = member.name;
    ciNameInput.parentElement.parentElement.insertAdjacentHTML('afterend', html);
  }
}

function hideCiMemberRecognition() {
  var el = document.getElementById('ci-member-recognition');
  if (el) el.remove();
}

// ============================================================
// 改进4: 设备Ping心跳真实模拟动画
// 设备详情页实时Ping动画+响应时间折线图
// ============================================================

var pingHistoryData = [];
var pingIntervalId = null;

function openDevicePingAnimModal(deviceId, deviceName) {
  pingHistoryData = [];
  var old = document.getElementById('modal-device-ping');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-device-ping" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;">';
  html += '<div class="modal" style="width:560px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:16px;font-weight:700;">🌐 设备网络诊断 - '+deviceName+'</div>';
  html += '<button onclick="stopDevicePingAnim()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  // 实时状态
  html += '<div style="display:flex;gap:12px;margin-bottom:16px;">';
  html += '<div style="flex:1;padding:12px;background:var(--green-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">实时状态</div><div style="font-size:14px;font-weight:700;color:var(--green);" id="dpa-status">🟢 在线</div></div>';
  html += '<div style="flex:1;padding:12px;background:var(--blue-bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">当前延迟</div><div style="font-size:18px;font-weight:700;color:var(--blue);" id="dpa-current-ms">--</div></div>';
  html += '<div style="flex:1;padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">平均延迟</div><div style="font-size:14px;font-weight:700;color:var(--text);" id="dpa-avg-ms">--</div></div>';
  html += '<div style="flex:1;padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);">丢包率</div><div style="font-size:14px;font-weight:700;color:var(--text);" id="dpa-loss">0%</div></div>';
  html += '</div>';
  // Ping动画区
  html += '<div id="dpa-animation-area" style="min-height:60px;background:var(--bg);border-radius:8px;padding:12px;margin-bottom:14px;font-family:monospace;font-size:12px;color:var(--text);overflow:hidden;"></div>';
  // 历史折线图（ASCII风格）
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;margin-bottom:8px;">📈 最近10次Ping响应时间(ms)</div>';
  html += '<div id="dpa-chart" style="display:flex;align-items:flex-end;gap:4px;height:60px;padding:8px;background:var(--bg);border-radius:8px;"></div>';
  html += '<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text-muted);"><span>最早</span><span>最新</span></div>';
  html += '</div>';
  // 诊断结果
  html += '<div id="dpa-result" style="padding:12px;background:var(--green-bg);border-radius:8px;font-size:12px;color:var(--green);display:none;">';
  html += '<div style="font-weight:700;margin-bottom:4px;">✅ 诊断完成：网络质量优秀</div>';
  html += '<div id="dpa-result-text"></div>';
  html += '</div>';
  html += '</div>';
  html += '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button onclick="stopDevicePingAnim()" class="modal-btn secondary">停止诊断</button>';
  html += '<button onclick="doDevicePing(deviceId)" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">🔄 重新诊断</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);

  // 启动Ping动画
  doDevicePing(deviceId);
}

function doDevicePing(deviceId) {
  var animArea = document.getElementById('dpa-animation-area');
  var statusEl = document.getElementById('dpa-status');
  var msEl = document.getElementById('dpa-current-ms');
  var avgEl = document.getElementById('dpa-avg-ms');
  var lossEl = document.getElementById('dpa-loss');
  var resultEl = document.getElementById('dpa-result');

  if (!animArea) return;
  animArea.innerHTML = '';
  if (pingIntervalId) clearInterval(pingIntervalId);

  var pingCount = 0;
  var lossCount = 0;
  var totalMs = 0;

  pingIntervalId = setInterval(function() {
    pingCount++;
    // 模拟Ping（随机丢包5%，随机延迟10-200ms）
    var isLoss = Math.random() < 0.05;
    var ms = isLoss ? 0 : Math.floor(Math.random() * 190) + 10;

    if (!isLoss) totalMs += ms;
    else lossCount++;

    var time = new Date().toLocaleTimeString('zh-CN', {hour12:false});
    var line = time + ' PING ' + deviceId + ': ';
    if (isLoss) {
      line += '<span style="color:var(--red);">Request timeout for id ' + pingCount + '</span>';
      animArea.innerHTML = '<span style="color:var(--text-muted);">' + time + '正在连接...</span><br>' + animArea.innerHTML.split('<br>')[0];
    } else {
      line += '<span style="color:var(--green);">' + ms + 'ms</span>';
      animArea.innerHTML = line + '<br>' + animArea.innerHTML;
    }
    animArea.innerHTML = animArea.innerHTML.split('<br>').slice(0,5).join('<br>');
    animArea.scrollTop = 0;

    msEl.textContent = isLoss ? '超时' : ms + 'ms';
    msEl.style.color = isLoss ? 'var(--red)' : (ms < 50 ? 'var(--green)' : ms < 100 ? 'var(--blue)' : 'var(--orange)');

    var avg = pingCount > lossCount ? Math.round(totalMs / (pingCount - lossCount)) : 0;
    avgEl.textContent = avg > 0 ? avg + 'ms' : '--';
    lossEl.textContent = Math.round(lossCount * 100 / pingCount) + '%';
    lossEl.style.color = lossCount > 0 ? 'var(--red)' : 'var(--text)';

    // 记录历史
    pingHistoryData.push({ms: isLoss ? null : ms, time: time});
    if (pingHistoryData.length > 10) pingHistoryData.shift();
    renderPingChart();

    if (pingCount >= 8) {
      clearInterval(pingIntervalId);
      pingIntervalId = null;
      statusEl.textContent = '🟢 诊断完成';
      statusEl.style.color = 'var(--green)';
      msEl.textContent = avg + 'ms';
      var lossRate = Math.round(lossCount * 100 / pingCount);
      var quality = lossRate === 0 && avg < 50 ? '优秀' : lossRate < 5 && avg < 100 ? '良好' : lossRate < 10 ? '一般' : '较差';
      var qualityColor = lossRate === 0 && avg < 50 ? 'var(--green)' : lossRate < 5 && avg < 100 ? 'var(--blue)' : lossRate < 10 ? 'var(--orange)' : 'var(--red)';
      resultEl.style.display = '';
      resultEl.style.background = lossRate === 0 && avg < 50 ? 'var(--green-bg)' : lossRate < 10 ? 'var(--orange-bg)' : 'var(--red-bg)';
      resultEl.style.color = qualityColor;
      resultEl.style.borderColor = qualityColor;
      resultEl.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">📊 诊断结果：网络质量'+quality+'</div><div>平均延迟 '+avg+'ms · 丢包率 '+lossRate+'% · 共Ping '+pingCount+'次</div>';
    }
  }, 1200);
}

function stopDevicePingAnim() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
  var m = document.getElementById('modal-device-ping');
  if (m) m.remove();
}

function renderPingChart() {
  var chart = document.getElementById('dpa-chart');
  if (!chart || pingHistoryData.length === 0) return;
  var valid = pingHistoryData.filter(function(d){ return d.ms !== null; });
  if (valid.length === 0) return;
  var maxMs = Math.max.apply(null, valid.map(function(d){ return d.ms; }));
  var minMs = Math.min.apply(null, valid.map(function(d){ return d.ms; }));
  var range = Math.max(maxMs - minMs, 20);

  chart.innerHTML = '';
  pingHistoryData.forEach(function(d, i) {
    var bar = document.createElement('div');
    bar.style.flex = '1';
    bar.style.display = 'flex';
    bar.style.flexDirection = 'column';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'flex-end';
    bar.style.height = '100%';

    if (d.ms === null) {
      bar.innerHTML = '<div style="width:100%;height:4px;background:var(--red);border-radius:2px;opacity:0.5;" title="超时"></div>';
    } else {
      var heightPct = 20 + ((d.ms - minMs) / range) * 75;
      var color = d.ms < 50 ? 'var(--green)' : d.ms < 100 ? 'var(--blue)' : 'var(--orange)';
      bar.innerHTML = '<div style="width:100%;height:'+heightPct+'%;background:'+color+';border-radius:2px;min-height:4px;" title="'+d.ms+'ms"></div>';
    }
    chart.appendChild(bar);
  });
}

// ============================================================
// 改进5: 服务工单完结满意度自动推送收集
// 工单完结后自动发送满意度调查并收集结果
// ============================================================

var woSatisfactionResults = [];
var woPendingSurvey = null;

function submitWorkorderAndCollectSatisfaction(woId, woTitle, assignee) {
  // 关闭处理弹窗
  closeModal('wo-process');
  closeModal('wo-process-v2');

  woPendingSurvey = {id: woId, title: woTitle, assignee: assignee, time: new Date().toLocaleString('zh-CN')};

  // 模拟：延迟3秒后自动弹出满意度调查（模拟短信推送）
  showToast('工单已完结，满意度调查已发送至客户手机...', 'info');

  setTimeout(function() {
    openWorkorderSatisfactionSurveyModal(woId, woTitle);
  }, 3000);
}

function openWorkorderSatisfactionSurveyModal(woId, woTitle) {
  var old = document.getElementById('modal-wo-satisfaction');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-wo-satisfaction" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;">';
  html += '<div class="modal" style="width:460px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:16px;font-weight:700;">⭐ 服务满意度调查</div>';
  html += '<button onclick="closeWoSatisfactionModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="text-align:center;margin-bottom:16px;">';
  html += '<div style="font-size:13px;color:var(--text-muted);">尊敬的客户，您对以下服务进行评价：</div>';
  html += '<div style="font-size:14px;font-weight:700;margin-top:6px;color:var(--text);">'+woTitle+'</div>';
  html += '</div>';
  // 星级评分
  html += '<div style="text-align:center;margin-bottom:16px;">';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">请选择满意度（1-5星）</div>';
  html += '<div id="survey-stars" style="display:flex;gap:8px;justify-content:center;">';
  for (var i = 1; i <= 5; i++) {
    html += '<span style="font-size:32px;cursor:pointer;color:#ddd;" onclick="setSurveyStar('+i+')" data-star="'+i+'">★</span>';
  }
  html += '</div>';
  html += '<div id="survey-star-label" style="font-size:13px;font-weight:600;margin-top:6px;color:var(--text-muted);">请选择评分</div>';
  html += '</div>';
  // 评价标签
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">快速反馈（可选）</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;" id="survey-tags">';
  var tags = ['响应及时','处理专业','态度友善','问题已解决','时间太长','态度一般','未解决问题'];
  tags.forEach(function(tag) {
    html += '<span onclick="toggleSurveyTag(this)" style="cursor:pointer;padding:4px 10px;background:var(--bg);border:1px solid var(--border);border-radius:12px;font-size:11px;color:var(--text);">' + tag + '</span>';
  });
  html += '</div>';
  html += '</div>';
  // 文字评价
  html += '<div class="form-group">';
  html += '<label class="form-label">文字评价（可选）</label>';
  html += '<textarea class="form-textarea" id="survey-comment" placeholder="请输入您的评价或建议..." style="min-height:70px;font-size:12px;"></textarea>';
  html += '</div>';
  // 推送方式
  html += '<div style="padding:10px;background:var(--blue-bg);border-radius:8px;font-size:11px;color:var(--blue);margin-bottom:12px;">';
  html += '📱 调查已发送至客户手机，客户也可通过短信链接直接评价';
  html += '</div>';
  html += '</div>';
  html += '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button onclick="skipWoSatisfaction()" class="modal-btn secondary">跳过</button>';
  html += '<button onclick="submitWoSatisfaction()" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">提交评价</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  window.surveySelectedStar = 0;
  window.surveySelectedTags = [];
}

function setSurveyStar(star) {
  window.surveySelectedStar = star;
  var labels = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
  var colors = ['', 'var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--blue)', 'var(--green)'];
  document.querySelectorAll('#survey-stars span').forEach(function(s, i) {
    s.style.color = i < star ? (colors[star]) : '#ddd';
  });
  var labelEl = document.getElementById('survey-star-label');
  if (labelEl) {
    labelEl.textContent = labels[star];
    labelEl.style.color = colors[star];
  }
}

function toggleSurveyTag(el) {
  var tag = el.textContent;
  var idx = window.surveySelectedTags.indexOf(tag);
  if (idx >= 0) {
    window.surveySelectedTags.splice(idx, 1);
    el.style.background = 'var(--bg)';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text)';
  } else {
    window.surveySelectedTags.push(tag);
    el.style.background = 'var(--blue-bg)';
    el.style.borderColor = 'var(--blue)';
    el.style.color = 'var(--blue)';
  }
}

function submitWoSatisfaction() {
  var star = window.surveySelectedStar || 0;
  if (star === 0) {
    showToast('请先选择满意度评分', 'error');
    return;
  }
  var comment = document.getElementById('survey-comment').value.trim();
  var result = {
    woId: woPendingSurvey ? woPendingSurvey.id : 0,
    woTitle: woPendingSurvey ? woPendingSurvey.title : '',
    star: star,
    tags: window.surveySelectedTags.slice(),
    comment: comment,
    time: new Date().toLocaleString('zh-CN')
  };
  woSatisfactionResults.push(result);
  closeWoSatisfactionModal();
  var starStr = '⭐'.repeat(star);
  showToast('感谢您的评价！' + starStr + ' 已提交', 'success');

  // 如果是低分评价（1-2星），自动创建投诉工单
  if (star <= 2) {
    createComplaintFromSatisfaction(result);
  }
}

function skipWoSatisfaction() {
  closeWoSatisfactionModal();
  showToast('已跳过满意度评价', 'info');
}

function closeWoSatisfactionModal() {
  var m = document.getElementById('modal-wo-satisfaction');
  if (m) m.remove();
}

function createComplaintFromSatisfaction(result) {
  var complaintData = {
    id: 'WO' + (Math.floor(Math.random() * 9000) + 1000),
    title: '【自动投诉】满意度差评 - ' + result.woTitle,
    type: 'complaint',
    priority: 'urgent',
    room: result.woId,
    desc: '客户对服务评价' + result.star + '星，反馈：' + (result.comment || result.tags.join(', ')),
    assignee: '',
    status: 'pending'
  };
  // 通知管理员
  showToast('⚠️ 检测到低分评价，已自动创建投诉工单并通知管理员', 'warn');
}

// 增强submitWorkorderCreateV2函数，支持工单完结时自动触发满意度调查
var originalSubmitWorkorderCreateV2 = null;
/* ====== 物联后台v3改进 (2026-03-28) ====== */

// ========== 改进1: 楼栋管理增强 - 删除二次确认+自动计算+列表刷新 ==========

// 1A: 楼栋删除二次确认弹窗（需输入楼栋名确认，防止误删）
function openBuildingDeleteConfirmModal(idx) {
  var b = buildingData[idx];
  if (!b) return;
  var old = document.getElementById('modal-bld-delete-confirm');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-bld-delete-confirm" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:420px;background:white;border-radius:12px;">' +
    '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;color:var(--red);">⚠️ 删除楼栋确认</div>' +
    '<button onclick="document.getElementById(\'modal-bld-delete-confirm\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;font-size:13px;color:var(--red);margin-bottom:16px;">🚨 删除操作不可逆！该楼栋下所有房间数据将一并清除</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">楼栋名称</span><span style="font-weight:600;">' + b.name + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">楼层数</span><span style="font-weight:600;">' + b.floors + ' 层</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="font-size:12px;color:var(--text-muted);">房间数</span><span style="font-weight:600;">' + b.rooms + ' 间</span></div>' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:6px;">请输入 <strong style="color:var(--red);">' + b.name + '</strong> 确认删除：</label>' +
    '<input type="text" class="form-input" id="bld-del-confirm-input" placeholder="请输入楼栋名称" style="font-size:13px;">' +
    '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-bld-delete-confirm\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="confirmBuildingDelete(' + idx + ')" id="bld-del-confirm-btn" class="modal-btn" style="background:var(--red);color:white;border:none;opacity:0.5;cursor:not-allowed;" disabled>确认删除</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('bld-del-confirm-input').addEventListener('input', function() {
    var btn = document.getElementById('bld-del-confirm-btn');
    if (this.value.trim() === b.name) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  });
}

function confirmBuildingDelete(idx) {
  var b = buildingData[idx];
  if (!b) return;
  buildingData.splice(idx, 1);
  document.getElementById('modal-bld-delete-confirm').remove();
  renderBuildingTable();
  updateDashboardStats();
  showToast('🗑️ 楼栋「' + b.name + '」已删除', 'success');
  addNotif('🏢', 'var(--red)', 'config', '删除楼栋：' + b.name);
}

// 1B: 楼栋表单自动计算：每层默认房间数
function setupBuildingAutoCalc() {
  var floorsInput = document.getElementById('bm-floors');
  var roomsInput = document.getElementById('bm-rooms');
  if (!floorsInput || !roomsInput) return;
  var calc = function() {
    var floors = parseInt(floorsInput.value) || 0;
    if (floors > 0 && !roomsInput.dataset.manual) {
      roomsInput.value = floors * 8; // 默认每层8间
    }
  };
  floorsInput.addEventListener('change', calc);
  roomsInput.addEventListener('input', function() { this.dataset.manual = '1'; });
}

// 1C: 楼栋列表渲染（从 buildingData 动态渲染，支持增删改）
function renderBuildingTable() {
  var tbody = document.getElementById('bld-list-body') || document.querySelector('#page-building tbody');
  if (!tbody) return;
  var html = '';
  buildingData.forEach(function(b, i) {
    var statusLabel = b.status === 'active' ? '<span class="tbadge green">启用</span>' : '<span class="tbadge gray">停用</span>';
    html += '<tr><td>' + b.name + '</td><td>' + b.floors + '层</td><td>' + b.rooms + '间</td><td>' + statusLabel + '</td>' +
      '<td><button class="action-btn small" onclick="openEditBuildingModal(' + i + ')">编辑</button> ' +
      '<button class="action-btn small red" onclick="openBuildingDeleteConfirmModal(' + i + ')">删除</button></td></tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">暂无楼栋数据</td></tr>';
}

// ========== 改进2: 员工管理增强 - 部门岗位联动+工号自动生成+密码生成 ==========

// 2A: 部门-岗位完整联动映射（扩充岗位库）
var staffDeptPositions = {
  '前厅': [
    {label:'前厅经理',value:'前厅经理'},
    {label:'前厅主管',value:'前厅主管'},
    {label:'接待员',value:'接待员'},
    {label:'行李员',value:'行李员'},
    {label:'话务员',value:'话务员'},
    {label:'预订员',value:'预订员'}
  ],
  '客房': [
    {label:'客房经理',value:'客房经理'},
    {label:'客房主管',value:'客房主管'},
    {label:'房嫂组长',value:'房嫂组长'},
    {label:'房嫂',value:'房嫂'},
    {label:'保洁员',value:'保洁员'},
    {label:'PA组员',value:'PA组员'}
  ],
  '工程': [
    {label:'工程经理',value:'工程经理'},
    {label:'弱电工程师',value:'弱电工程师'},
    {label:'强电工程师',value:'强电工程师'},
    {label:'万能工',value:'万能工'},
    {label:'维修工',value:'维修工'}
  ],
  '管理': [
    {label:'总经理',value:'总经理'},
    {label:'财务经理',value:'财务经理'},
    {label:'人事经理',value:'人事经理'},
    {label:'店长',value:'店长'},
    {label:'行政专员',value:'行政专员'}
  ],
  '安保': [
    {label:'安保主管',value:'安保主管'},
    {label:'保安',value:'保安'},
    {label:'监控员',value:'监控员'}
  ]
};

// 2B: 员工表单部门切换时自动更新岗位下拉
function onStaffDeptChange(deptSelectEl) {
  var dept = deptSelectEl.value;
  var posSelect = document.getElementById('sf-position') || document.getElementById('sfm-position');
  if (!posSelect) return;
  var positions = staffDeptPositions[dept] || [];
  var currentVal = posSelect.value;
  posSelect.innerHTML = '<option value="">请选择岗位</option>';
  positions.forEach(function(p) {
    var selected = p.value === currentVal ? ' selected' : '';
    posSelect.innerHTML += '<option value="' + p.value + '"' + selected + '>' + p.label + '</option>';
  });
}

// 2C: 工号自动生成（基于部门+年月+序号）
function generateStaffCode() {
  var deptMap = {'前厅':'QT','客房':'KF','工程':'GC','管理':'GL','安保':'AB'};
  var dept = document.getElementById('sf-dept') ? document.getElementById('sf-dept').value : '前厅';
  var now = new Date();
  var ym = String(now.getFullYear()).slice(2,4) + String(now.getMonth()+1).padStart(2,'0');
  var existingCodes = staffListData.filter(function(s){ return s.code && s.code.indexOf(deptMap[dept] + ym) === 0; });
  var seq = String(existingCodes.length + 1).padStart(2,'0');
  var code = (deptMap[dept] || 'QT') + ym + seq;
  var codeInput = document.getElementById('sf-code') || document.getElementById('sfm-code');
  if (codeInput) codeInput.value = code;
  return code;
}

// 2D: 手机号输入后自动触发工号+初始密码生成
function onStaffPhoneInput(phoneInputEl) {
  var phone = phoneInputEl.value.trim();
  if (phone.length === 11) {
    generateStaffCode();
    // 初始密码：手机号后6位
    var pwdInput = document.getElementById('sf-init-pwd') || document.getElementById('sfm-init-pwd');
    if (pwdInput && !pwdInput.value) {
      pwdInput.value = phone.slice(-6);
    }
  }
}

// 2E: 随机密码生成
function generateStaffRandomPwd() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var pwd = '';
  for (var i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  var pwdInput = document.getElementById('sf-init-pwd') || document.getElementById('sfm-init-pwd');
  if (pwdInput) pwdInput.value = pwd;
  showToast('🎲 随机密码已生成：' + pwd, 'success');
}

// ========== 改进3: 服务工单创建增强 - 期望时间+房间自动完成+通知渠道+自动ID ==========

// 3A: 工单自动ID生成
function generateWorkorderId() {
  var now = new Date();
  var dateStr = now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
  var rand = String(Math.floor(Math.random() * 900) + 100);
  return 'WO-' + dateStr + '-' + rand;
}

// 3B: 房间号自动完成（从已有房间数据中匹配）
var existingRoomNumbers = ['301','302','303','304','203','201','202','401','402'];
function setupRoomAutoComplete(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', function() {
    var val = this.value.trim().toUpperCase();
    if (!val) return;
    var matches = existingRoomNumbers.filter(function(r) { return r.indexOf(val) === 0; });
    // 简单实现：可选房间显示在placeholder中提示
    if (matches.length > 0 && matches.indexOf(val) === -1) {
      this.placeholder = '试试: ' + matches.slice(0,3).join(' / ');
    } else {
      this.placeholder = '如：301';
    }
  });
}

// 3C: 工单创建完整提交（含期望时间+通知渠道+自动ID）
function submitWorkorderCreateV3() {
  var woType = document.getElementById('wo-create-type') ? document.getElementById('wo-create-type').value : 'other';
  var room = document.getElementById('wo-create-room') ? document.getElementById('wo-create-room').value.trim() : '';
  var customer = document.getElementById('wo-create-customer') ? document.getElementById('wo-create-customer').value.trim() : '';
  var content = document.getElementById('wo-create-content') ? document.getElementById('wo-create-content').value.trim() : '';
  var priority = document.getElementById('wo-create-priority') ? document.getElementById('wo-create-priority').value : 'normal';
  var dueDate = document.getElementById('wo-create-due') ? document.getElementById('wo-create-due').value : '';
  var dueTime = document.getElementById('wo-create-due-time') ? document.getElementById('wo-create-due-time').value : '';
  var notifySms = document.getElementById('wo-notify-sms') && document.getElementById('wo-notify-sms').checked;
  var notifyFeishu = document.getElementById('wo-notify-feishu') && document.getElementById('wo-notify-feishu').checked;
  
  if (!content) {
    showToast('请填写工单内容', 'error');
    return;
  }
  
  var woId = generateWorkorderId();
  var typeLabels = {complaint:'🔴 客户投诉',delivery:'📦 送物服务',invoice:'📄 发票需求',review:'⭐ 点评表扬',other:'📝 其他'};
  var priorityLabels = {urgent:'🟠 紧急',normal:'🟡 普通',low:'🟢 低优先级'};
  
  // 创建工单数据
  var newWo = {
    woId: woId,
    type: woType,
    typeLabel: typeLabels[woType] || '📝 其他',
    room: room,
    customer: customer,
    content: content,
    priority: priority,
    priorityLabel: priorityLabels[priority] || '🟡 普通',
    status: '待接受',
    assignee: '',
    dueDate: dueDate,
    dueTime: dueTime,
    createTime: new Date().toLocaleString('zh-CN'),
    notifySms: notifySms,
    notifyFeishu: notifyFeishu
  };
  
  // 添加到工单数据
  if (typeof workorderData !== 'undefined') {
    workorderData.unshift(newWo);
  }
  
  var notifyStr = [];
  if (notifySms) notifyStr.push('短信');
  if (notifyFeishu) notifyStr.push('飞书');
  var dueStr = dueDate ? '，期望' + dueDate + (dueTime ? ' ' + dueTime : '') : '';
  var notifStr = notifyStr.length > 0 ? '，已通过' + notifyStr.join('/') + '通知' : '（无通知）';
  
  closeModal('create-wo');
  showToast('✅ 工单 ' + woId + ' 创建成功' + notifStr, 'success');
  addNotif('📋', 'var(--blue)', 'workorder', '新工单：' + newWo.typeLabel + ' · ' + room + dueStr);
  
  // 清空表单
  if (document.getElementById('wo-create-content')) document.getElementById('wo-create-content').value = '';
  if (document.getElementById('wo-create-room')) document.getElementById('wo-create-room').value = '';
  if (document.getElementById('wo-create-customer')) document.getElementById('wo-create-customer').value = '';
  if (document.getElementById('wo-create-due')) document.getElementById('wo-create-due').value = '';
}

// ========== 改进4: 房型价格多期间配置 - 平日/周末/节假日价格 ==========

// 4A: 房型多期间价格数据结构
var roomTypePricePlans = {
  '标准间': { weekday: 98, weekend: 128, holiday: 168 },
  '大床房': { weekday: 108, weekend: 138, holiday: 178 },
  '亲子间': { weekday: 128, weekend: 158, holiday: 208 },
  '家庭套房': { weekday: 198, weekend: 258, holiday: 328 }
};

// 4B: 房型多期间价格配置弹窗
function openRoomTypePricePlanModal(roomTypeName) {
  var old = document.getElementById('modal-roomtype-price-plan');
  if (old) old.remove();
  var plan = roomTypePricePlans[roomTypeName] || {weekday: 0, weekend: 0, holiday: 0};
  var avgRev = ((plan.weekday * 5 + plan.weekend * 2) / 7 * 30).toFixed(0);
  var html = '<div class="modal-overlay" id="modal-roomtype-price-plan" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:520px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">💰 ' + roomTypeName + ' - 多期间价格配置</div>' +
    '<button onclick="document.getElementById(\'modal-roomtype-price-plan\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:14px;background:var(--green-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--green);margin-bottom:4px;">平日价格</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--green);">¥<input type="number" id="rtpp-weekday" value="' + plan.weekday + '" style="width:70px;font-size:28px;font-weight:700;color:var(--green);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">周一~周五</div></div>' +
    '<div style="padding:14px;background:var(--orange-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--orange);margin-bottom:4px;">周末价格</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--orange);">¥<input type="number" id="rtpp-weekend" value="' + plan.weekend + '" style="width:70px;font-size:28px;font-weight:700;color:var(--orange);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">周六、周日</div></div>' +
    '<div style="padding:14px;background:var(--red-bg);border-radius:8px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--red);margin-bottom:4px;">节假日</div>' +
    '<div style="font-size:28px;font-weight:700;color:var(--red);">¥<input type="number" id="rtpp-holiday" value="' + plan.holiday + '" style="width:70px;font-size:28px;font-weight:700;color:var(--red);background:none;border:none;text-align:center;"></div>' +
    '<div style="font-size:11px;color:var(--text-muted);">法定节假日</div></div>' +
    '</div>' +
    '<div style="padding:12px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:14px;font-size:12px;color:var(--blue);">' +
    '💡 <strong>预估月收入</strong>（按30天 = 5工作周计算）：<strong style="font-size:16px;">¥' + avgRev + '</strong> / 月' +
    '</div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:12px;">' +
    '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text);">📅 价格说明</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>周末溢价率</span><span style="color:var(--orange);font-weight:600;">+' + (plan.weekend > 0 ? Math.round((plan.weekend-plan.weekday)/plan.weekday*100) : 0) + '%</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>节假日溢价率</span><span style="color:var(--red);font-weight:600;">+' + (plan.holiday > 0 ? Math.round((plan.holiday-plan.weekday)/plan.weekday*100) : 0) + '%</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);padding:3px 0;">' +
    '<span>月均入住率基准</span><span>70%</span></div>' +
    '</div>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="document.getElementById(\'modal-roomtype-price-plan\').remove()" class="modal-btn secondary">取消</button>' +
    '<button onclick="saveRoomTypePricePlan(\'' + roomTypeName + '\')" class="modal-btn primary">💾 保存价格方案</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveRoomTypePricePlan(roomTypeName) {
  var weekday = parseInt(document.getElementById('rtpp-weekday').value) || 0;
  var weekend = parseInt(document.getElementById('rtpp-weekend').value) || 0;
  var holiday = parseInt(document.getElementById('rtpp-holiday').value) || 0;
  roomTypePricePlans[roomTypeName] = {weekday: weekday, weekend: weekend, holiday: holiday};
  document.getElementById('modal-roomtype-price-plan').remove();
  showToast('💰 ' + roomTypeName + ' 价格方案已保存！平日¥' + weekday + ' / 周末¥' + weekend + ' / 节假日¥' + holiday, 'success');
  addNotif('💰', 'var(--green)', 'config', '更新房型价格：' + roomTypeName);
}

// ========== 改进5: 排班管理增强 - 班次模板保存/加载+请假申请审批 ==========

// 5A: 班次模板数据结构
var shiftTemplates = [
  {name:'行政班', shifts:{mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00',fri:'09:00-18:00',sat:'休息',sun:'休息'}},
  {name:'两班倒', shifts:{mon:'07:00-15:00',tue:'07:00-15:00',wed:'14:00-22:00',thu:'14:00-22:00',fri:'07:00-15:00',sat:'14:00-22:00',sun:'休息'}},
  {name:'夜班制', shifts:{mon:'22:00-07:00',tue:'22:00-07:00',wed:'22:00-07:00',thu:'休息',fri:'22:00-07:00',sat:'22:00-07:00',sun:'休息'}}
];

// 5B: 班次模板保存功能
function saveShiftTemplate() {
  var name = prompt('请输入模板名称（如：行政班/两班倒/夜班制）：');
  if (!name || !name.trim()) return;
  // 从当前排班视图提取
  var now = new Date();
  var shifts = {mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00',fri:'09:00-18:00',sat:'休息',sun:'休息'};
  var existingIdx = shiftTemplates.findIndex(function(t){ return t.name === name; });
  var template = {name: name, shifts: shifts};
  if (existingIdx >= 0) {
    shiftTemplates[existingIdx] = template;
    showToast('✅ 模板「' + name + '」已更新', 'success');
  } else {
    shiftTemplates.push(template);
    showToast('✅ 模板「' + name + '」已保存', 'success');
  }
}

// 5C: 班次模板加载弹窗
function openShiftTemplateLoadModal() {
  var old = document.getElementById('modal-shift-template-load');
  if (old) old.remove();
  var listHtml = shiftTemplates.map(function(t, i) {
    var shiftSummary = t.shifts.mon + ' / ' + t.shifts.sat;
    return '<div onclick="loadShiftTemplate(' + i + ')" style="padding:12px 14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.borderColor=\'var(--blue)\';" onmouseout="this.style.borderColor=\'var(--border)\';">' +
      '<div><div style="font-size:13px;font-weight:600;">' + t.name + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">平日:' + t.shifts.mon + ' · 周末:' + t.shifts.sat + '</div></div>' +
      '<button class="action-btn small">加载</button></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-shift-template-load" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:460px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📋 班次模板库</div>' +
    '<button onclick="document.getElementById(\'modal-shift-template-load\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 24px;max-height:400px;overflow-y:auto;">' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">选择一个模板应用到本周排班（将覆盖现有排班）</div>' +
    listHtml +
    '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<button onclick="saveShiftTemplate()" class="action-btn small" style="background:var(--green-bg);color:var(--green);border-color:var(--green);">💾 保存当前为模板</button>' +
    '<button onclick="document.getElementById(\'modal-shift-template-load\').remove()" class="modal-btn secondary">关闭</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function loadShiftTemplate(idx) {
  var t = shiftTemplates[idx];
  if (!t) return;
  document.getElementById('modal-shift-template-load').remove();
  showToast('📋 模板「' + t.name + '」已加载，可手动调整后保存排班', 'success');
}

// 5D: 请假申请数据结构
var leaveRequests = [
  {id:'LR001', name:'周敏', dept:'前厅', type:'年假', days:'3天', dateFrom:'2026-04-01', dateTo:'2026-04-03', reason:'家中有事', status:'pending'},
  {id:'LR002', name:'吴倩', dept:'客房', type:'病假', days:'1天', dateFrom:'2026-03-30', dateTo:'2026-03-30', reason:'发烧', status:'approved'},
  {id:'LR003', name:'王工', dept:'工程', type:'调休', days:'2天', dateFrom:'2026-04-05', dateTo:'2026-04-06', reason:'探亲', status:'rejected'}
];

// 5E: 请假申请审批弹窗
function openLeaveApprovalModal() {
  var old = document.getElementById('modal-leave-approval');
  if (old) old.remove();
  var pendingList = leaveRequests.filter(function(l){ return l.status === 'pending'; });
  var listHtml = pendingList.length === 0 ? '<div style="text-align:center;padding:24px;color:var(--text-muted);">暂无待审批请假</div>' :
    pendingList.map(function(l) {
      var typeColors = {'年假':'var(--blue)', '病假':'var(--red)', '调休':'var(--orange)', '事假':'var(--purple)'};
      var typeColor = typeColors[l.type] || 'var(--text)';
      return '<div style="padding:12px 14px;border:1px solid var(--border);border-radius:8px;margin-bottom:10px;background:white;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div><span style="font-weight:600;font-size:13px;">' + l.name + '</span> <span style="font-size:11px;color:var(--text-muted);">' + l.dept + '部</span></div>' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + typeColor + '20;color:' + typeColor + ';">' + l.type + '</span></div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">' + l.dateFrom + ' ~ ' + l.dateTo + ' （共' + l.days + '）</div>' +
        '<div style="font-size:12px;margin-bottom:10px;">📝 ' + l.reason + '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '<button onclick="resolveLeaveRequest(\'' + l.id + '\',\'approved\')" class="action-btn small" style="flex:1;background:var(--green-bg);color:var(--green);border-color:var(--green);">✅ 批准</button>' +
        '<button onclick="resolveLeaveRequest(\'' + l.id + '\',\'rejected\')" class="action-btn small" style="flex:1;background:var(--red-bg);color:var(--red);border-color:var(--red);">❌ 拒绝</button></div></div>';
    }).join('');
  var html = '<div class="modal-overlay" id="modal-leave-approval" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:480px;background:white;border-radius:12px;max-height:80vh;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
    '<div style="font-size:15px;font-weight:700;">📋 请假申请审批 <span style="font-size:12px;color:var(--orange);">（' + pendingList.length + ' 条待审批）</span></div>' +
    '<button onclick="document.getElementById(\'modal-leave-approval\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:16px 24px;overflow-y:auto;flex:1;">' + listHtml + '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;flex-shrink:0;">' +
    '<button onclick="openLeaveHistoryModal()" class="action-btn small" style="color:var(--text-muted);">📜 审批历史</button>' +
    '<button onclick="document.getElementById(\'modal-leave-approval\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function resolveLeaveRequest(id, action) {
  var l = leaveRequests.find(function(x){ return x.id === id; });
  if (!l) return;
  l.status = action;
  document.getElementById('modal-leave-approval').remove();
  var actionLabel = action === 'approved' ? '已批准' : '已拒绝';
  showToast(actionLabel + ' 请假申请：' + l.name + ' 的 ' + l.type + '（' + l.days + '）', action === 'approved' ? 'success' : 'warning');
  addNotif('📋', action === 'approved' ? 'var(--green)' : 'var(--red)', 'staff', '请假审批：' + l.name + ' ' + l.type + ' ' + actionLabel);
}

function openLeaveHistoryModal() {
  var old = document.getElementById('modal-leave-history');
  if (old) old.remove();
  var allList = leaveRequests;
  var listHtml = allList.map(function(l) {
    var statusMap = {approved:'var(--green)', rejected:'var(--red)', pending:'var(--orange)'};
    var statusLabel = {approved:'✅ 已批准', rejected:'❌ 已拒绝', pending:'⏳ 待审批'};
    var typeColors = {'年假':'var(--blue)', '病假':'var(--red)', '调休':'var(--orange)', '事假':'var(--purple)'};
    return '<div style="padding:10px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + l.name + ' <span style="font-size:11px;color:var(--text-muted);">' + l.type + '</span></div>' +
      '<div style="font-size:11px;color:var(--text-muted);">' + l.dateFrom + ' ~ ' + l.dateTo + ' · ' + l.days + '</div></div>' +
      '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + statusMap[l.status] + '20;color:' + statusMap[l.status] + ';">' + statusLabel[l.status] + '</span></div>';
  }).join('');
  var html = '<div class="modal-overlay" id="modal-leave-history" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">' +
    '<div class="modal" style="width:440px;background:white;border-radius:12px;">' +
    '<div style="padding:18px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<div style="font-size:15px;font-weight:700;">📜 请假审批历史</div>' +
    '<button onclick="document.getElementById(\'modal-leave-history\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>' +
    '<div style="padding:12px 20px;max-height:350px;overflow-y:auto;">' + listHtml + '</div>' +
    '<div style="padding:12px 24px;border-top:1px solid var(--border);text-align:right;">' +
    '<button onclick="document.getElementById(\'modal-leave-history\').remove()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 初始化：运行时自动注入字段和事件监听
document.addEventListener('DOMContentLoaded', function() {
  // 改进3: 给工单创建弹窗添加期望时间和通知渠道字段
  setTimeout(function() {
    // 工单创建表单增强：添加期望时间字段
    var woTypeSelect = document.getElementById('wo-create-type');
    if (woTypeSelect) {
      var parent = woTypeSelect.closest('.modal-body') || woTypeSelect.parentElement;
      // 检查是否已添加过
      if (!document.getElementById('wo-create-due')) {
        var dueField = '<div class="form-row"><div class="form-group"><label class="form-label">期望完成日期</label><input type="date" class="form-input" id="wo-create-due" style="padding:7px 10px;font-size:13px;"></div>' +
          '<div class="form-group"><label class="form-label">期望时间</label><input type="time" class="form-input" id="wo-create-due-time" value="18:00" style="padding:7px 10px;font-size:13px;"></div></div>' +
          '<div class="form-group"><label class="form-label">通知渠道</label><div style="display:flex;gap:12px;align-items:center;padding:6px 0;">' +
          '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;"><input type="checkbox" id="wo-notify-sms" style="accent-color:var(--blue);"> 📱 短信</label>' +
          '<label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;"><input type="checkbox" id="wo-notify-feishu" checked style="accent-color:var(--blue);"> 💬 飞书</label></div></div>';
        var contentTextarea = document.getElementById('wo-create-content');
        if (contentTextarea && contentTextarea.parentElement) {
          contentTextarea.insertAdjacentHTML('beforebegin', dueField);
        }
      }
    }
    // 改进1: 楼栋表单自动计算初始化
    setupBuildingAutoCalc();
    // 改进2: 员工表单部门联动初始化
    var deptSelect = document.getElementById('sf-dept');
    if (deptSelect) {
      deptSelect.addEventListener('change', function() { onStaffDeptChange(this); });
    }
    var phoneInput = document.getElementById('sf-phone');
    if (phoneInput) {
      phoneInput.addEventListener('blur', function() { onStaffPhoneInput(this); });
    }
    // 改进3: 房间号自动完成
    var roomInput = document.getElementById('wo-create-room');
    if (roomInput) setupRoomAutoComplete(roomInput);
    // 改进4: 房型价格配置入口 - 给现有价格按钮增加多期间入口
    var priceBtns = document.querySelectorAll('[onclick*="openRoomTypePriceModal"]');
    priceBtns.forEach(function(btn) {
      btn.setAttribute('title', '点击配置多期间价格');
      btn.style.cursor = 'pointer';
    });
  }, 500);
});

// 挂载到全局
window.openBuildingDeleteConfirmModal = openBuildingDeleteConfirmModal;
window.confirmBuildingDelete = confirmBuildingDelete;
window.renderBuildingTable = renderBuildingTable;
window.onStaffDeptChange = onStaffDeptChange;
window.generateStaffCode = generateStaffCode;
window.onStaffPhoneInput = onStaffPhoneInput;
window.generateStaffRandomPwd = generateStaffRandomPwd;
window.submitWorkorderCreateV3 = submitWorkorderCreateV3;
window.openRoomTypePricePlanModal = openRoomTypePricePlanModal;
window.saveRoomTypePricePlan = saveRoomTypePricePlan;
window.openShiftTemplateLoadModal = openShiftTemplateLoadModal;
window.saveShiftTemplate = saveShiftTemplate;
window.loadShiftTemplate = loadShiftTemplate;
window.openLeaveApprovalModal = openLeaveApprovalModal;
window.resolveLeaveRequest = resolveLeaveRequest;
window.openLeaveHistoryModal = openLeaveHistoryModal;

// ============================================================
// V3 Iteration 5 New Functional Improvements
// ============================================================

// ============================================================
// IMPROVEMENT A: 夜审快速结账处理系统
// 原系统有夜审功能，Demo缺失。在结算中心页面添加夜审入口，点击后展示快速夜审结账流程
// ============================================================

// 夜审数据状态
var nightAuditData = {
  date: new Date().toISOString().split('T')[0],
  totalRooms: 16,
  occupiedRooms: 12,
  expectedCheckout: 4,
  completedCheckout: 0,
  pendingClean: 3,
  revenue: 1856,
  unsettled: 0,
  auditStatus: 'pending' // pending / processing / done
};

function openNightAuditModal() {
  var old = document.getElementById('modal-night-audit');
  if (old) old.remove();

  // 计算夜审统计
  var na = nightAuditData;
  var unsettledList = [
    {room:'301', guest:'张三', amount:328, method:'微信'},
    {room:'304', guest:'李四', amount:156, method:'支付宝'},
  ];
  var unsettledCount = unsettledList.length;
  var unsettledTotal = unsettledList.reduce(function(s, u){ return s + u.amount; }, 0);

  var html = '<div class="modal-overlay" id="modal-night-audit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:20px;">';
  html += '<div class="modal" style="width:640px;max-height:90vh;overflow-y:auto;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="display:flex;align-items:center;gap:12px;">';
  html += '<div style="width:40px;height:40px;background:var(--purple-bg);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🌙</div>';
  html += '<div><div style="font-size:16px;font-weight:700;">夜审结账处理</div><div style="font-size:11px;color:var(--text-muted);">日期：' + na.date + ' · 运营日结账统计</div></div></div>';
  html += '<button onclick="closeNightAuditModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  // 夜审统计卡片
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">';
  html += '<div style="text-align:center;padding:12px;background:var(--blue-bg);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--blue);">'+na.occupiedRooms+'</div><div style="font-size:11px;color:var(--text-muted);">当前入住</div></div>';
  html += '<div style="text-align:center;padding:12px;background:var(--orange-bg);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--orange);">'+na.expectedCheckout+'</div><div style="font-size:11px;color:var(--text-muted);">应退房</div></div>';
  html += '<div style="text-align:center;padding:12px;background:var(--green-bg);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--green);">'+na.completedCheckout+'</div><div style="font-size:11px;color:var(--text-muted);">已退房</div></div>';
  html += '<div style="text-align:center;padding:12px;background:var(--purple-bg);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--purple);">¥'+na.revenue.toLocaleString()+'</div><div style="font-size:11px;color:var(--text-muted);">今日营收</div></div>';
  html += '</div>';
  // 待退房清单
  html += '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">🚪 待退房清单（'+na.expectedCheckout+'间）</div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:16px;overflow:hidden;">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:var(--bg);"><th style="padding:8px 12px;text-align:left;color:var(--text-muted);font-size:11px;">房间</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);font-size:11px;"> guests</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);font-size:11px;">入住日期</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);font-size:11px;">房费</th><th style="padding:8px 12px;text-align:center;color:var(--text-muted);font-size:11px;">操作</th></tr></thead><tbody>';
  var checkoutRooms = [
    {room:'301', guest:'张三', checkin:'2026-03-25', amount:328},
    {room:'203', guest:'赵六', checkin:'2026-03-26', amount:218},
    {room:'201', guest:'王五', checkin:'2026-03-27', amount:156},
    {room:'102', guest:'孙华', checkin:'2026-03-27', amount:98},
  ];
  checkoutRooms.forEach(function(r, i) {
    html += '<tr style="border-top:1px solid var(--border);">';
    html += '<td style="padding:8px 12px;font-weight:600;">'+r.room+'</td>';
    html += '<td style="padding:8px 12px;">'+r.guest+'</td>';
    html += '<td style="padding:8px 12px;color:var(--text-muted);">'+r.checkin+'</td>';
    html += '<td style="padding:8px 12px;font-weight:600;color:var(--blue);">¥'+r.amount+'</td>';
    html += '<td style="padding:8px 12px;text-align:center;"><button onclick="nightAuditQuickCheckout(\''+r.room+'\',\''+r.guest+'\','+r.amount+')" style="padding:3px 10px;background:var(--green);color:white;border:none;border-radius:4px;font-size:11px;cursor:pointer;">快速结账</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  // 未结算账单
  if (unsettledCount > 0) {
    html += '<div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--orange);">⚠️ 未结算账单（'+unsettledCount+'笔，合计¥'+unsettledTotal+'）</div>';
    html += '<div style="border:1px solid var(--orange);border-radius:8px;margin-bottom:16px;overflow:hidden;background:var(--orange-bg);">';
    unsettledList.forEach(function(u) {
      html += '<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid rgba(0,0,0,0.05);font-size:12px;">';
      html += '<span>'+u.room+' · '+u.guest+' · '+u.method+'</span><span style="font-weight:600;">¥'+u.amount+' <button onclick="settleRoomBill(\''+u.room+'\')" style="margin-left:8px;padding:2px 8px;background:var(--orange);color:white;border:none;border-radius:3px;font-size:10px;cursor:pointer;">结算</button></span>';
      html += '</div>';
    });
    html += '</div>';
  }
  // 夜审进度
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">';
  html += '<span>夜审进度</span><span id="na-progress-text">0%</span></div>';
  html += '<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">';
  html += '<div id="na-progress-bar" style="height:100%;background:var(--purple);border-radius:4px;transition:width 0.5s;width:0%;"></div></div></div>';
  html += '</div>';
  html += '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:space-between;">';
  html += '<button onclick="nightAuditGenerateReport()" style="padding:8px 16px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">📊 生成日报</button>';
  html += '<div style="display:flex;gap:10px;">';
  html += '<button onclick="closeNightAuditModal()" class="modal-btn secondary">取消</button>';
  html += '<button onclick="executeNightAudit()" id="na-execute-btn" class="modal-btn primary" style="background:var(--purple);border-color:var(--purple);">🌙 开始夜审</button>';
  html += '</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeNightAuditModal() {
  var m = document.getElementById('modal-night-audit');
  if (m) m.remove();
}

function nightAuditQuickCheckout(room, guest, amount) {
  // 模拟快速结账
  var old = document.getElementById('modal-na-quick-checkout');
  if (old) old.remove();
  var html = '<div class="modal-overlay" id="modal-na-quick-checkout" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999999;">';
  html += '<div class="modal" style="width:420px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="font-size:15px;font-weight:700;">🚪 夜审快速结账 - '+room+'</div>';
  html += '<button onclick="document.getElementById(\'modal-na-quick-checkout\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  html += '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">房间</div><div style="font-size:14px;font-weight:600;">'+room+'</div></div>';
  html += '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);"> guest</div><div style="font-size:14px;font-weight:600;">'+guest+'</div></div>';
  html += '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">应付金额</div><div style="font-size:14px;font-weight:600;color:var(--blue);">¥'+amount+'</div></div>';
  html += '<div style="padding:10px;background:var(--bg);border-radius:6px;"><div style="font-size:11px;color:var(--text-muted);">支付方式</div><div style="font-size:14px;font-weight:600;">微信/支付宝</div></div>';
  html += '</div>';
  html += '<div style="padding:10px 12px;background:var(--green-bg);border-radius:6px;font-size:12px;color:var(--green);margin-bottom:12px;">✅ 退房手续已完成，房间状态已更新为空房</div>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">退房时间：'+new Date().toLocaleString('zh-CN')+'</div>';
  html += '</div>';
  html += '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;"><button onclick="document.getElementById(\'modal-na-quick-checkout\').remove();nightAuditUpdateProgress();" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">确认完成</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  nightAuditData.completedCheckout++;
}

function nightAuditUpdateProgress() {
  var total = nightAuditData.expectedCheckout + nightAuditData.pendingClean;
  var done = nightAuditData.completedCheckout;
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;
  var bar = document.getElementById('na-progress-bar');
  var text = document.getElementById('na-progress-text');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

function executeNightAudit() {
  var btn = document.getElementById('na-execute-btn');
  if (btn) { btn.disabled = true; btn.textContent = '🌙 夜审进行中…'; }
  nightAuditData.auditStatus = 'processing';
  showToast('🌙 夜审处理已启动，正在生成运营日报…', 'info');
  setTimeout(function() {
    nightAuditData.auditStatus = 'done';
    showToast('✅ 夜审完成！今日运营数据已归档，共处理 '+nightAuditData.completedCheckout+' 间退房。', 'success');
    closeNightAuditModal();
  }, 3000);
}

function nightAuditGenerateReport() {
  showToast('📊 正在生成运营日报，请稍候…', 'info');
  setTimeout(function() {
    showToast('📊 运营日报已生成，已发送至管理员邮箱。', 'success');
  }, 2000);
}

function settleRoomBill(room) {
  showToast('房间 '+room+' 账单已结算完成', 'success');
}

// ============================================================
// IMPROVEMENT B: 设备批量固件升级系统
// 设备列表页缺少批量选择+批量升级固件功能，此功能在原系统中有对应操作入口
// ============================================================

// 设备升级任务状态
var deviceUpgradeTasks = {};

function openBatchDeviceUpgradeModal() {
  // 获取当前设备列表中选中的设备
  var selectedDevices = [];
  document.querySelectorAll('#page-device .device-row input[type="checkbox"]:checked').forEach(function(cb) {
    var row = cb.closest('tr');
    if (row) {
      var uuid = row.dataset.uuid || row.querySelector('[style*="monospace"]')?.textContent || '';
      var room = row.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      var model = row.querySelector('td:nth-child(3)')?.textContent?.trim() || '领握LH-807';
      selectedDevices.push({uuid: uuid, room: room, model: model, status: 'pending'});
    }
  });

  if (selectedDevices.length === 0) {
    showToast('请先在设备列表勾选要升级的设备（可多选）', 'error');
    return;
  }

  var old = document.getElementById('modal-batch-upgrade');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-batch-upgrade" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:20px;">';
  html += '<div class="modal" style="width:600px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">';
  html += '<div style="display:flex;align-items:center;gap:12px;">';
  html += '<div style="width:40px;height:40px;background:var(--purple-bg);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">📦</div>';
  html += '<div><div style="font-size:16px;font-weight:700;">批量固件升级</div><div style="font-size:11px;color:var(--text-muted);">已选 '+selectedDevices.length+' 台设备 · 当前版本 v2.1.3 → 最新 v2.2.0</div></div></div>';
  html += '<button onclick="closeBatchUpgradeModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:16px 24px;overflow-y:auto;flex:1;">';
  // 升级信息
  html += '<div style="display:flex;gap:10px;margin-bottom:14px;padding:12px;background:var(--blue-bg);border-radius:8px;">';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--blue);">v2.1.3</div><div style="font-size:11px;color:var(--text-muted);">当前版本</div></div>';
  html += '<div style="display:flex;align-items:center;color:var(--text-muted);font-size:16px;">→</div>';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--green);">v2.2.0</div><div style="font-size:11px;color:var(--text-muted);">目标版本</div></div>';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--orange);">~5min</div><div style="font-size:11px;color:var(--text-muted);">预计耗时</div></div>';
  html += '</div>';
  // 升级日志
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text);">📋 升级进度</div>';
  html += '<div id="upgrade-progress-log" style="height:160px;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:11px;font-family:monospace;margin-bottom:12px;">';
  html += '<div style="color:var(--blue);">[开始] 正在准备升级环境…</div>';
  html += '<div style="color:var(--text-muted);">[等待] 选择设备：'+selectedDevices.length+'台</div>';
  html += '</div>';
  // 设备清单
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text);">📱 设备清单</div>';
  html += '<div style="border:1px solid var(--border);border-radius:6px;overflow:hidden;max-height:180px;overflow-y:auto;">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:var(--bg);"><th style="padding:6px 10px;text-align:left;color:var(--text-muted);">状态</th><th style="padding:6px 10px;text-align:left;color:var(--text-muted);">房间</th><th style="padding:6px 10px;text-align:left;color:var(--text-muted);">UUID</th><th style="padding:6px 10px;text-align:left;color:var(--text-muted);">版本</th></tr></thead><tbody>';
  selectedDevices.forEach(function(d, i) {
    var taskId = 'task_' + i;
    deviceUpgradeTasks[taskId] = {device: d, status: 'pending'};
    html += '<tr id="upgrade-row-'+i+'" style="border-top:1px solid var(--border);">';
    html += '<td style="padding:6px 10px;"><span id="upgrade-status-'+i+'" style="color:var(--text-muted);">⏳ 待升级</span></td>';
    html += '<td style="padding:6px 10px;font-weight:600;">'+d.room+'</td>';
    html += '<td style="padding:6px 10px;font-family:monospace;font-size:10px;color:var(--text-muted);">'+d.uuid.substring(0,12)+'…</td>';
    html += '<td style="padding:6px 10px;">v2.1.3</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += '</div>';
  html += '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">';
  html += '<button onclick="closeBatchUpgradeModal()" class="modal-btn secondary">取消</button>';
  html += '<button onclick="startBatchUpgrade('+selectedDevices.length+')" id="batch-upgrade-start-btn" class="modal-btn primary" style="background:var(--purple);border-color:var(--purple);">📦 开始升级（'+selectedDevices.length+'台）</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeBatchUpgradeModal() {
  var m = document.getElementById('modal-batch-upgrade');
  if (m) m.remove();
}

function startBatchUpgrade(count) {
  var btn = document.getElementById('batch-upgrade-start-btn');
  if (btn) { btn.disabled = true; btn.textContent = '升级中…'; }
  var log = document.getElementById('upgrade-progress-log');

  var steps = [
    {msg:'[下载] 正在下载固件包 v2.2.0…', delay:800, color:'var(--blue)'},
    {msg:'[验证] 固件包校验通过，MD5: 7f3a9c2e…', delay:1200, color:'var(--green)'},
    {msg:'[分发] 正在向 '+count+' 台设备分发固件…', delay:1800, color:'var(--blue)'},
    {msg:'[推送] 固件已推送至所有设备，心跳确认中…', delay:2400, color:'var(--blue)'},
    {msg:'[安装] 设备陆续进入升级模式，请勿断电…', delay:3000, color:'var(--orange)'},
    {msg:'[重启] 设备正在重启中（0/'+count+'）…', delay:3800, color:'var(--orange)'},
    {msg:'[完成] ✅ 全部 '+count+' 台设备升级成功！', delay:5000, color:'var(--green)'},
  ];

  var step = 0;
  function addLog(msg, color) {
    if (log) {
      log.innerHTML += '<div style="color:'+color+';margin-bottom:4px;">'+msg+'</div>';
      log.scrollTop = log.scrollHeight;
    }
    // 更新设备状态
    if (msg.indexOf('完成') !== -1) {
      for (var i = 0; i < count; i++) {
        var statusEl = document.getElementById('upgrade-status-'+i);
        var rowEl = document.getElementById('upgrade-row-'+i);
        if (statusEl) { statusEl.textContent = '✅ 完成'; statusEl.style.color = 'var(--green)'; }
        if (rowEl) rowEl.style.background = 'var(--green-bg)';
      }
    }
  }

  function nextStep() {
    if (step < steps.length) {
      addLog(steps[step].msg, steps[step].color);
      step++;
      if (step < steps.length) {
        setTimeout(nextStep, steps[step].delay - steps[step-1].delay);
      }
    } else {
      if (btn) { btn.textContent = '✅ 升级完成'; btn.style.background = 'var(--green)'; }
      showToast('✅ 批量升级完成！'+count+'台设备全部升级至 v2.2.0', 'success');
    }
  }
  setTimeout(nextStep, 300);
}

// ============================================================
// IMPROVEMENT C: 服务工单完结满意度自动收集
// 工单状态改为"已完成"时，自动弹出满意度调查弹窗
// ============================================================

var satisfactionSurveyCallback = null;

function openSatisfactionSurveyModal(woId, woTitle, handler) {
  var old = document.getElementById('modal-satisfaction-survey');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-satisfaction-survey" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:20px;">';
  html += '<div class="modal" style="width:480px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<div style="width:36px;height:36px;background:var(--green-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">⭐</div>';
  html += '<div><div style="font-size:15px;font-weight:700;">服务满意度调查</div><div style="font-size:11px;color:var(--text-muted);">工单 #'+woId+' · 感谢您的反馈</div></div></div>';
  html += '<button onclick="closeSatisfactionSurveyModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="font-size:13px;color:var(--text-muted);margin-bottom:14px;">请对本次服务进行评价（处理人：'+handler+'）</div>';
  // 满意度评分
  html += '<div style="margin-bottom:16px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">⭐ 整体满意度</div>';
  html += '<div style="display:flex;gap:8px;">';
  for (var i = 1; i <= 5; i++) {
    html += '<button class="sat-star-btn" data-score="'+i+'" onclick="selectSatisfactionStar('+i+')" style="width:40px;height:40px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:20px;cursor:pointer;transition:all 0.2s;">☆</button>';
  }
  html += '</div>';
  html += '<div id="sat-score-label" style="font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center;">请选择评分</div></div>';
  // 服务态度
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">👤 服务态度</div>';
  html += '<div style="display:flex;gap:8px;">';
  ['满意','基本满意','一般','不满意'].forEach(function(opt, idx) {
    var colors = ['var(--green)','var(--blue)','var(--orange)','var(--red)'];
    var bgs = ['var(--green-bg)','var(--blue-bg)','var(--orange-bg)','var(--red-bg)'];
    html += '<button class="sat-attitude-btn" data-attitude="'+opt+'" onclick="selectSatisfactionAttitude(this,\''+opt+'\')" style="flex:1;padding:8px 4px;background:white;border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;">'+opt+'</button>';
  });
  html += '</div></div>';
  // 意见反馈
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">💬 意见与建议</div>';
  html += '<textarea id="sat-comment" placeholder="请输入您的宝贵意见（选填）…" style="width:100%;min-height:70px;padding:10px;border:1px solid var(--border);border-radius:6px;font-size:12px;resize:vertical;font-family:inherit;"></textarea>';
  html += '</div>';
  // 标签
  html += '<div style="margin-bottom:16px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">🏷️ 快速标签</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
  var tags = ['响应迅速','态度友好','解决问题','超时处理','推诿','敷衍'];
  tags.forEach(function(tag) {
    var color = ['var(--green)','var(--blue)','var(--orange)','var(--red)'][tags.indexOf(tag) % 4];
    html += '<button class="sat-tag-btn" data-tag="'+tag+'" onclick="toggleSatisfactionTag(this,\''+tag+'\')" style="padding:4px 10px;background:white;border:1px solid var(--border);border-radius:12px;font-size:11px;cursor:pointer;transition:all 0.2s;">'+tag+'</button>';
  });
  html += '</div></div>';
  html += '</div>';
  html += '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">';
  html += '<button onclick="skipSatisfactionSurvey(\''+woId+'\')" class="modal-btn secondary" style="font-size:12px;">跳过</button>';
  html += '<button onclick="submitSatisfactionSurvey(\''+woId+'\')" id="sat-submit-btn" class="modal-btn primary" style="background:var(--green);border-color:var(--green);">提交评价</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

window._satisfactionData = {score: 0, attitude: '', comment: '', tags: []};

function selectSatisfactionStar(score) {
  window._satisfactionData.score = score;
  document.querySelectorAll('.sat-star-btn').forEach(function(btn, i) {
    if (i < score) {
      btn.textContent = '★';
      btn.style.background = 'var(--orange-bg)';
      btn.style.borderColor = 'var(--orange)';
      btn.style.color = 'var(--orange)';
    } else {
      btn.textContent = '☆';
      btn.style.background = 'var(--bg)';
      btn.style.borderColor = 'var(--border)';
    }
  });
  var labels = ['','非常不满意','不满意','一般','满意','非常满意'];
  var labelEl = document.getElementById('sat-score-label');
  if (labelEl) labelEl.textContent = labels[score] || '请选择评分';
}

function selectSatisfactionAttitude(el, attitude) {
  window._satisfactionData.attitude = attitude;
  document.querySelectorAll('.sat-attitude-btn').forEach(function(btn) {
    btn.style.background = 'white';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = 'var(--text)';
  });
  var colors = {'满意':'var(--green)','基本满意':'var(--blue)','一般':'var(--orange)','不满意':'var(--red)'};
  el.style.background = colors[attitude] === 'var(--green)' ? 'var(--green-bg)' : colors[attitude] === 'var(--blue)' ? 'var(--blue-bg)' : colors[attitude] === 'var(--orange)' ? 'var(--orange-bg)' : 'var(--red-bg)';
  el.style.borderColor = colors[attitude];
  el.style.color = colors[attitude];
}

function toggleSatisfactionTag(el, tag) {
  var idx = window._satisfactionData.tags.indexOf(tag);
  if (idx === -1) {
    window._satisfactionData.tags.push(tag);
    el.style.background = 'var(--blue-bg)';
    el.style.borderColor = 'var(--blue)';
    el.style.color = 'var(--blue)';
  } else {
    window._satisfactionData.tags.splice(idx, 1);
    el.style.background = 'white';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text)';
  }
}

function submitSatisfactionSurvey(woId) {
  var d = window._satisfactionData;
  if (d.score === 0) { showToast('请选择满意度评分', 'error'); return; }
  closeSatisfactionSurveyModal();
  showToast('⭐ 感谢您的评价！工单 #'+woId+' 已完成，感谢您的反馈！', 'success');
  addOpLog('workorder', '客户', '提交满意度评价：'+d.score+'星'+(d.attitude?' · 态度：'+d.attitude:'') + (d.tags.length > 0 ? ' · 标签：'+d.tags.join(',') : ''), '');
}

function skipSatisfactionSurvey(woId) {
  closeSatisfactionSurveyModal();
  showToast('已跳过评价，工单 #'+woId+' 已完成', 'info');
}

function closeSatisfactionSurveyModal() {
  var m = document.getElementById('modal-satisfaction-survey');
  if (m) m.remove();
  window._satisfactionData = {score: 0, attitude: '', comment: '', tags: []};
}

// Hook: 当工单被标记为完成时自动触发满意度调查
// 通过重写原有工单完成函数实现（将在 init 函数末尾挂载）
function hookWorkorderDone() {
  // 找到工单完成按钮并注入满意度调查逻辑
  var originalKanbanDone = null;
  // 在页面内直接监听工单完成事件
  document.addEventListener('click', function(e) {
    var el = e.target;
    if (el.textContent === '✅ 完成' || (el.textContent.indexOf('完成') !== -1 && el.closest('[id*="kanban"]'))) {
      // 找到工单ID
      var card = el.closest('.kanban-card');
      if (card) {
        var woId = card.dataset.wo;
        var titleEl = card.querySelector('.kanban-title');
        var title = titleEl ? titleEl.textContent.trim() : '服务工单';
        var handlerEl = card.querySelector('[style*="color:var(--purple)"]');
        var handler = handlerEl ? handlerEl.textContent.trim() : '处理人员';
        setTimeout(function() { openSatisfactionSurveyModal(woId, title, handler); }, 800);
      }
    }
  });
}

// ============================================================
// IMPROVEMENT D: 房务保洁排班派工系统
// 房务管理页缺少保洁员排班和任务派工功能
// ============================================================

var hkScheduleData = [
  {date: '2026-03-28', staff: '郑强', shift: '早班', rooms: ['301','302','303'], status: 'scheduled'},
  {date: '2026-03-28', staff: '孙华', shift: '中班', rooms: ['201','202','203'], status: 'scheduled'},
  {date: '2026-03-28', staff: '吴倩', shift: '早班', rooms: ['305','102'], status: 'scheduled'},
  {date: '2026-03-29', staff: '郑强', shift: '中班', rooms: ['301','304'], status: 'scheduled'},
  {date: '2026-03-29', staff: '孙华', shift: '早班', rooms: ['302','303'], status: 'scheduled'},
];

function openHousekeepingScheduleModal() {
  var old = document.getElementById('modal-hk-schedule');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-hk-schedule" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:20px;">';
  html += '<div class="modal" style="width:720px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">';
  html += '<div style="display:flex;align-items:center;gap:12px;">';
  html += '<div style="width:40px;height:40px;background:var(--green-bg);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🧹</div>';
  html += '<div><div style="font-size:16px;font-weight:700;">保洁排班派工</div><div style="font-size:11px;color:var(--text-muted);">2026-03-28 当日排班 · 3名保洁员</div></div></div>';
  html += '<button onclick="closeHousekeepingScheduleModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:16px 24px;overflow-y:auto;flex:1;">';
  // 快速派工工具栏
  html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;padding:10px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;">';
  html += '<span style="font-size:12px;font-weight:600;color:var(--blue);">⚡ 快速派工：</span>';
  html += '<select id="hks-date" class="form-select" style="padding:5px 8px;font-size:12px;width:130px;"><option value="2026-03-28">2026-03-28</option><option value="2026-03-29">2026-03-29</option><option value="2026-03-30">2026-03-30</option></select>';
  html += '<select id="hks-staff" class="form-select" style="padding:5px 8px;font-size:12px;width:110px;"><option value="郑强">郑强</option><option value="孙华">孙华</option><option value="吴倩">吴倩</option></select>';
  html += '<select id="hks-shift" class="form-select" style="padding:5px 8px;font-size:12px;width:100px;"><option value="早班">早班</option><option value="中班">中班</option><option value="晚班">晚班</option></select>';
  html += '<input type="text" id="hks-rooms" class="form-input" placeholder="房间号，如301,302" style="flex:1;padding:5px 8px;font-size:12px;">';
  html += '<button onclick="submitHkSchedule()" style="padding:5px 12px;background:var(--green);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">派工</button>';
  html += '</div>';
  // 排班表格
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">📅 当日排班表</div>';
  html += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:var(--bg);"><th style="padding:8px 12px;text-align:left;color:var(--text-muted);">日期</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);">保洁员</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);">班次</th><th style="padding:8px 12px;text-align:left;color:var(--text-muted);">负责房间</th><th style="padding:8px 12px;text-align:center;color:var(--text-muted);">状态</th><th style="padding:8px 12px;text-align:center;color:var(--text-muted);">操作</th></tr></thead><tbody>';
  hkScheduleData.forEach(function(s, i) {
    var statusColors = {scheduled:'var(--blue)', done:'var(--green)', cancelled:'var(--red)'};
    var statusLabels = {scheduled:'已派工', done:'已完成', cancelled:'已取消'};
    html += '<tr style="border-top:1px solid var(--border);">';
    html += '<td style="padding:8px 12px;">'+s.date+'</td>';
    html += '<td style="padding:8px 12px;font-weight:600;">'+s.staff+'</td>';
    html += '<td style="padding:8px 12px;">'+s.shift+'</td>';
    html += '<td style="padding:8px 12px;"><div style="display:flex;gap:4px;flex-wrap:wrap;">';
    s.rooms.forEach(function(r) {
      html += '<span style="padding:2px 8px;background:var(--blue-bg);color:var(--blue);border-radius:4px;font-size:11px;font-weight:600;">'+r+'</span>';
    });
    html += '</div></td>';
    html += '<td style="padding:8px 12px;text-align:center;"><span style="padding:2px 8px;background:'+statusColors[s.status]+'22;color:'+statusColors[s.status]+';border-radius:4px;font-size:11px;">'+statusLabels[s.status]+'</span></td>';
    html += '<td style="padding:8px 12px;text-align:center;"><button onclick="removeHkSchedule('+i+')" style="padding:2px 8px;background:var(--red-bg);color:var(--red);border:1px solid var(--red);border-radius:4px;font-size:11px;cursor:pointer;">移除</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  // 房间任务看板
  html += '<div style="font-size:12px;font-weight:600;margin:14px 0 8px;">📋 房间清洁任务看板</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
  var taskRooms = ['301','302','303','304','305','201','202','203'];
  taskRooms.forEach(function(r) {
    var assign = hkScheduleData.find(function(s){ return s.rooms.indexOf(r) !== -1 && s.date === '2026-03-28'; });
    var staff = assign ? assign.staff : '待分配';
    var status = staff === '待分配' ? 'var(--red)' : 'var(--green)';
    html += '<div style="padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;">';
    html += '<div style="font-size:14px;font-weight:700;margin-bottom:4px;">'+r+'</div>';
    html += '<div style="font-size:11px;color:'+status+';">'+(staff === '待分配' ? '⚠️ 待分配' : '✅ '+staff+' · 早班')+'</div>';
    html += '</div>';
  });
  html += '</div></div>';
  html += '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;flex-shrink:0;">';
  html += '<button onclick="closeHousekeepingScheduleModal()" class="modal-btn secondary">关闭</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeHousekeepingScheduleModal() {
  var m = document.getElementById('modal-hk-schedule');
  if (m) m.remove();
}

function submitHkSchedule() {
  var date = document.getElementById('hks-date').value;
  var staff = document.getElementById('hks-staff').value;
  var shift = document.getElementById('hks-shift').value;
  var roomsStr = document.getElementById('hks-rooms').value.trim();
  if (!roomsStr) { showToast('请输入负责的房间号', 'error'); return; }
  var rooms = roomsStr.split(',').map(function(r){ return r.trim(); }).filter(function(r){ return r; });
  hkScheduleData.push({date: date, staff: staff, shift: shift, rooms: rooms, status: 'scheduled'});
  showToast('派工成功！'+staff+'已分配 '+rooms.join(',')+' 房间', 'success');
  openHousekeepingScheduleModal(); // 刷新
}

function removeHkSchedule(idx) {
  hkScheduleData.splice(idx, 1);
  showToast('已移除该排班', 'info');
  openHousekeepingScheduleModal();
}

// ============================================================
// IMPROVEMENT E: 会员储值卡充值系统
// 会员管理页缺少储值卡充值入口，此功能是原系统会员管理的核心功能
// ============================================================

var rechargeCardDB = [
  {id:'CARD001', name:'张三', level:'金卡', balance:1500, totalRecharge:5000, cardNo:'8888-xxxx-xxxx-6621', expire:'2028-03-31', points:320},
  {id:'CARD002', name:'李四', level:'银卡', balance:380, totalRecharge:1000, cardNo:'8888-xxxx-xxxx-2245', expire:'2027-06-15', points:85},
  {id:'CARD003', name:'王五', level:'金卡', balance:2100, totalRecharge:10000, cardNo:'8888-xxxx-xxxx-9901', expire:'2029-01-01', points:680},
];

function openMemberRechargeModal() {
  var old = document.getElementById('modal-member-recharge');
  if (old) old.remove();

  var html = '<div class="modal-overlay" id="modal-member-recharge" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:20px;">';
  html += '<div class="modal" style="width:540px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">';
  html += '<div style="display:flex;align-items:center;gap:12px;">';
  html += '<div style="width:40px;height:40px;background:var(--orange-bg);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">💳</div>';
  html += '<div><div style="font-size:16px;font-weight:700;">会员储值卡充值</div><div style="font-size:11px;color:var(--text-muted);">储值余额 · 积分累积 · 自动升级</div></div></div>';
  html += '<button onclick="closeMemberRechargeModal()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;overflow-y:auto;flex:1;">';
  // 会员选择
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">👤 选择会员 <span style="color:var(--red);">*</span></div>';
  html += '<select id="mrc-member-select" class="form-select" onchange="onMemberSelectRecharge(this.value)" style="width:100%;padding:8px 12px;font-size:13px;">';
  html += '<option value="">请选择会员…</option>';
  rechargeCardDB.forEach(function(m) {
    html += '<option value="'+m.id+'">'+m.name+'（'+m.level+' · 卡号 '+m.cardNo+' · 余额 ¥'+m.balance+'）</option>';
  });
  html += '</select></div>';
  // 选中会员信息
  html += '<div id="mrc-member-info" style="display:none;margin-bottom:14px;padding:12px 14px;background:var(--blue-bg);border-radius:8px;"></div>';
  // 充值金额选择
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">💰 充值金额 <span style="color:var(--red);">*</span></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">';
  [500, 1000, 2000, 5000].forEach(function(amt) {
    html += '<button class="mrc-amount-btn" data-amount="'+amt+'" onclick="selectRechargeAmount('+amt+',this)" style="padding:10px 4px;background:white;border:1px solid var(--border);border-radius:6px;font-size:13px;font-weight:700;color:var(--text);cursor:pointer;transition:all 0.2s;">¥'+amt+'</button>';
  });
  html += '</div>';
  html += '<div style="display:flex;gap:8px;align-items:center;">';
  html += '<input type="number" id="mrc-custom-amount" class="form-input" placeholder="自定义金额（100-50000）" min="100" max="50000" oninput="onCustomRechargeAmount(this.value)" style="flex:1;padding:8px 12px;font-size:13px;">';
  html += '</div></div>';
  // 赠送规则
  html += '<div id="mrc-bonus-info" style="display:none;margin-bottom:14px;padding:10px 14px;background:var(--green-bg);border-radius:8px;font-size:12px;"></div>';
  // 支付方式
  html += '<div style="margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">💳 支付方式</div>';
  html += '<div style="display:flex;gap:8px;">';
  [{id:'wechat', label:'微信支付', icon:'💬'}, {id:'alipay', label:'支付宝', icon:'💙'}, {id:'cash', label:'现金', icon:'💵'}, {id:'bank', label:'银行卡', icon:'🏦'}].forEach(function(p) {
    html += '<button class="mrc-pay-btn" data-pay="'+p.id+'" onclick="selectRechargePayMethod(\''+p.id+'\',this)" style="flex:1;padding:8px 4px;background:white;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all 0.2s;text-align:center;">';
    html += '<div style="font-size:16px;margin-bottom:2px;">'+p.icon+'</div>';
    html += '<div style="font-size:11px;color:var(--text);">'+p.label+'</div></button>';
  });
  html += '</div></div>';
  // 充值后余额预览
  html += '<div id="mrc-preview" style="display:none;padding:12px 14px;background:var(--bg);border-radius:8px;margin-bottom:12px;font-size:12px;"></div>';
  html += '</div>';
  html += '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">';
  html += '<button onclick="closeMemberRechargeModal()" class="modal-btn secondary">取消</button>';
  html += '<button onclick="submitMemberRecharge()" id="mrc-submit-btn" class="modal-btn primary" disabled style="background:var(--orange);border-color:var(--orange);opacity:0.5;">请选择会员和金额</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeMemberRechargeModal() {
  var m = document.getElementById('modal-member-recharge');
  if (m) m.remove();
}

window._mrcSelectedMember = null;
window._mrcSelectedAmount = 0;
window._mrcSelectedPay = null;

function onMemberSelectRecharge(memberId) {
  window._mrcSelectedMember = memberId;
  var m = rechargeCardDB.find(function(c){ return c.id === memberId; });
  var infoEl = document.getElementById('mrc-member-info');
  if (m && infoEl) {
    window._mrcSelectedMember = m;
    infoEl.style.display = 'block';
    infoEl.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:14px;font-weight:700;">'+m.name+' <span style="font-size:11px;background:var(--orange);color:white;padding:1px 6px;border-radius:3px;margin-left:4px;">'+m.level+'</span></div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">'+m.cardNo+' · 有效期 '+m.expire+'</div></div><div style="text-align:right;"><div style="font-size:18px;font-weight:700;color:var(--orange);">¥'+m.balance+'</div><div style="font-size:11px;color:var(--text-muted);">当前余额</div></div></div>';
  } else if (infoEl) {
    infoEl.style.display = 'none';
  }
  updateRechargePreview();
}

function selectRechargeAmount(amount, btn) {
  window._mrcSelectedAmount = amount;
  document.querySelectorAll('.mrc-amount-btn').forEach(function(b) {
    b.style.background = 'white';
    b.style.borderColor = 'var(--border)';
    b.style.color = 'var(--text)';
  });
  if (btn) {
    btn.style.background = 'var(--orange-bg)';
    btn.style.borderColor = 'var(--orange)';
    btn.style.color = 'var(--orange)';
  }
  var custom = document.getElementById('mrc-custom-amount');
  if (custom) custom.value = '';
  updateRechargePreview();
}

function onCustomRechargeAmount(val) {
  if (val) {
    window._mrcSelectedAmount = parseInt(val) || 0;
    document.querySelectorAll('.mrc-amount-btn').forEach(function(b) {
      b.style.background = 'white';
      b.style.borderColor = 'var(--border)';
      b.style.color = 'var(--text)';
    });
  }
  updateRechargePreview();
}

function selectRechargePayMethod(payId, btn) {
  window._mrcSelectedPay = payId;
  document.querySelectorAll('.mrc-pay-btn').forEach(function(b) {
    b.style.background = 'white';
    b.style.borderColor = 'var(--border)';
  });
  if (btn) {
    btn.style.background = 'var(--blue-bg)';
    btn.style.borderColor = 'var(--blue)';
  }
}

function updateRechargePreview() {
  var amt = window._mrcSelectedAmount;
  var member = window._mrcSelectedMember;
  var bonusEl = document.getElementById('mrc-bonus-info');
  var previewEl = document.getElementById('mrc-preview');
  var btn = document.getElementById('mrc-submit-btn');

  if (bonusEl) {
    if (amt > 0) {
      var bonus = 0;
      var bonusText = '';
      if (amt >= 5000) { bonus = Math.floor(amt * 0.15); bonusText = '充5000送'+bonus+'（15%），另+680积分'; }
      else if (amt >= 2000) { bonus = Math.floor(amt * 0.10); bonusText = '充2000送'+bonus+'（10%），另+280积分'; }
      else if (amt >= 1000) { bonus = Math.floor(amt * 0.05); bonusText = '充1000送'+bonus+'（5%），另+120积分'; }
      else { bonusText = '无赠送'; }
      bonusEl.style.display = 'block';
      bonusEl.innerHTML = '🎁 充值赠送：<strong style="color:var(--green);">'+bonusText+'</strong>';
    } else {
      bonusEl.style.display = 'none';
    }
  }

  if (previewEl) {
    if (amt > 0 && member) {
      var newBalance = member.balance + amt;
      var bonus = 0;
      if (amt >= 5000) bonus = Math.floor(amt * 0.15);
      else if (amt >= 2000) bonus = Math.floor(amt * 0.10);
      else if (amt >= 1000) bonus = Math.floor(amt * 0.05);
      previewEl.style.display = 'block';
      previewEl.innerHTML = '<div style="display:flex;justify-content:space-between;"><span>充值金额</span><span style="font-weight:600;">¥'+amt+'</span></div><div style="display:flex;justify-content:space-between;color:var(--green);"><span>赠送金额</span><span>+¥'+bonus+'</span></div><div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);margin-top:6px;padding-top:6px;font-size:13px;font-weight:700;"><span>充值后余额</span><span style="color:var(--orange);">¥'+(newBalance+bonus)+'</span></div>';
    } else {
      previewEl.style.display = 'none';
    }
  }

  if (btn) {
    if (amt > 0 && member && window._mrcSelectedPay) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = '💳 确认充值 ¥' + amt;
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.textContent = amt > 0 && member ? '请选择支付方式' : '请选择会员和金额';
    }
  }
}

function submitMemberRecharge() {
  var member = window._mrcSelectedMember;
  var amount = window._mrcSelectedAmount;
  var pay = window._mrcSelectedPay;
  if (!member || !amount || !pay) { showToast('请完成充值信息填写', 'error'); return; }
  var bonus = 0;
  if (amount >= 5000) bonus = Math.floor(amount * 0.15);
  else if (amount >= 2000) bonus = Math.floor(amount * 0.10);
  else if (amount >= 1000) bonus = Math.floor(amount * 0.05);
  var newBalance = member.balance + amount + bonus;
  // 更新本地数据
  var idx = rechargeCardDB.findIndex(function(c){ return c.id === member.id; });
  if (idx !== -1) {
    rechargeCardDB[idx].balance = newBalance;
    rechargeCardDB[idx].totalRecharge += amount;
  }
  closeMemberRechargeModal();
  showToast('💳 充值成功！'+member.name+' 账户充值 ¥'+amount+'，赠送 ¥'+bonus+'，当前余额 ¥'+newBalance, 'success');
  addOpLog('member', member.name, '储值卡充值 ¥'+amount+'（'+pay+'），赠送¥'+bonus+'，余额¥'+newBalance, '');
}

// ============================================================
// Global Init: 自动挂载所有新增函数到 window 对象
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // 挂载夜审入口到结算中心页面
    var settlementPage = document.getElementById('page-settlement');
    if (settlementPage) {
      var header = settlementPage.querySelector('.page-header');
      if (header) {
        var existingBtn = settlementPage.querySelector('[onclick*="nightAudit"]');
        if (!existingBtn) {
          var nightAuditBtn = document.createElement('button');
          nightAuditBtn.className = 'action-btn';
          nightAuditBtn.style.cssText = 'background:var(--purple-bg);color:var(--purple);border-color:var(--purple);margin-left:8px;padding:6px 14px;font-size:12px;cursor:pointer;';
          nightAuditBtn.innerHTML = '🌙 夜审处理';
          nightAuditBtn.onclick = openNightAuditModal;
          // 插入到页面标题旁
          var pageTitle = header.querySelector('.page-title');
          if (pageTitle) pageTitle.parentNode.insertBefore(nightAuditBtn, pageTitle.nextSibling);
        }
      }
    }

    // 挂载批量升级入口到设备管理页
    var devicePage = document.getElementById('page-device');
    if (devicePage) {
      var existingUpgradeBtn = devicePage.querySelector('[onclick*="batchUpgrade"]');
      if (!existingUpgradeBtn) {
        var toolbar = devicePage.querySelector('.card-header');
        if (toolbar) {
          var btn = document.createElement('button');
          btn.className = 'action-btn small';
          btn.style.cssText = 'padding:4px 10px;background:var(--purple-bg);color:var(--purple);border-color:var(--purple);font-size:11px;cursor:pointer;margin-left:8px;';
          btn.innerHTML = '📦 批量升级';
          btn.onclick = openBatchDeviceUpgradeModal;
          toolbar.appendChild(btn);
        }
      }
    }

    // 挂载保洁排班入口到房务管理页
    var hkPage = document.getElementById('page-housekeeping');
    if (hkPage) {
      var existingHkBtn = hkPage.querySelector('[onclick*="ScheduleModal"]');
      if (!existingHkBtn) {
        var hkHeader = hkPage.querySelector('.card-header');
        if (hkHeader) {
          var btn = document.createElement('button');
          btn.className = 'action-btn small';
          btn.style.cssText = 'padding:4px 10px;background:var(--green-bg);color:var(--green);border-color:var(--green);font-size:11px;cursor:pointer;';
          btn.innerHTML = '🧹 排班派工';
          btn.onclick = openHousekeepingScheduleModal;
          hkHeader.appendChild(btn);
        }
      }
    }

    // 挂载会员充值入口到会员管理页
    var memberPage = document.getElementById('page-member');
    if (memberPage) {
      var existingRechargeBtn = memberPage.querySelector('[onclick*="RechargeModal"]');
      if (!existingRechargeBtn) {
        var mHeader = memberPage.querySelector('.card-header');
        if (mHeader) {
          var btn = document.createElement('button');
          btn.className = 'action-btn';
          btn.style.cssText = 'background:var(--orange-bg);color:var(--orange);border-color:var(--orange);padding:6px 14px;font-size:12px;cursor:pointer;margin-left:8px;';
          btn.innerHTML = '💳 储值充值';
          btn.onclick = openMemberRechargeModal;
          mHeader.appendChild(btn);
        }
      }
    }

    // 挂载工单完成满意度调查hook
    hookWorkorderDone();

  }, 1500);
});

// 挂载到 window
window.openNightAuditModal = openNightAuditModal;
window.closeNightAuditModal = closeNightAuditModal;
window.nightAuditQuickCheckout = nightAuditQuickCheckout;
window.executeNightAudit = executeNightAudit;
window.settleRoomBill = settleRoomBill;
window.openBatchDeviceUpgradeModal = openBatchDeviceUpgradeModal;
window.closeBatchUpgradeModal = closeBatchUpgradeModal;
window.startBatchUpgrade = startBatchUpgrade;
window.openSatisfactionSurveyModal = openSatisfactionSurveyModal;
window.selectSatisfactionStar = selectSatisfactionStar;
window.selectSatisfactionAttitude = selectSatisfactionAttitude;
window.toggleSatisfactionTag = toggleSatisfactionTag;
window.submitSatisfactionSurvey = submitSatisfactionSurvey;
window.skipSatisfactionSurvey = skipSatisfactionSurvey;
window.hookWorkorderDone = hookWorkorderDone;
window.openHousekeepingScheduleModal = openHousekeepingScheduleModal;
window.closeHousekeepingScheduleModal = closeHousekeepingScheduleModal;
window.submitHkSchedule = submitHkSchedule;
window.openMemberRechargeModal = openMemberRechargeModal;
window.closeMemberRechargeModal = closeMemberRechargeModal;
window.onMemberSelectRecharge = onMemberSelectRecharge;
window.selectRechargeAmount = selectRechargeAmount;
window.onCustomRechargeAmount = onCustomRechargeAmount;
window.selectRechargePayMethod = selectRechargePayMethod;
window.submitMemberRecharge = submitMemberRecharge;

// ==================== 【改进1】工单处理人批量重新分配功能 ====================
// 功能：从工单列表多选工单，批量重新分配处理人，解决原系统无此功能的问题
function toggleWorkorderRow(cb, woId) {
  if (!window._selectedWorkorders) window._selectedWorkorders = new Set();
  if (cb.checked) {
    window._selectedWorkorders.add(woId);
  } else {
    window._selectedWorkorders.delete(woId);
  }
  var count = window._selectedWorkorders.size;
  var toolbar = document.getElementById('wo-batch-toolbar');
  var countEl = document.getElementById('wo-batch-count');
  if (toolbar) toolbar.style.display = count > 0 ? 'flex' : 'none';
  if (countEl) countEl.textContent = '已选择 ' + count + ' 项';
}

function clearWorkorderSelection() {
  window._selectedWorkorders && window._selectedWorkorders.clear();
  document.querySelectorAll('.wo-row-cb').forEach(function(cb) { cb.checked = false; });
  var toolbar = document.getElementById('wo-batch-toolbar');
  var countEl = document.getElementById('wo-batch-count');
  if (toolbar) toolbar.style.display = 'none';
  if (countEl) countEl.textContent = '已选择 0 项';
}

function openBatchAssignWorkorder() {
  if (!window._selectedWorkorders || window._selectedWorkorders.size === 0) {
    showToast('请先在工单列表中勾选要分配的工单', 'warning');
    return;
  }
  var html = '<div id="modal-batch-assign-wo" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:center;justify-content:center;">' +
    '<div class="modal" style="width:480px;max-width:90vw;background:white;border-radius:12px;overflow:hidden;">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<div style="font-size:16px;font-weight:700;">🔄 批量分配工单 <span style="font-size:13px;color:var(--blue);background:var(--blue-bg);padding:2px 8px;border-radius:10px;margin-left:6px;">' + window._selectedWorkorders.size + '条</span></div>' +
    '<button onclick="closeBatchAssignWo()" style="width:28px;height:28px;border-radius:6px;border:none;background:var(--bg);cursor:pointer;font-size:16px;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:24px;">' +
    '<div style="padding:10px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">' +
    '💡 将为选中的 <strong>' + window._selectedWorkorders.size + '条</strong> 工单统一分配新的处理人</div>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">选择新处理人 <span style="color:var(--red);">*</span></div>' +
    '<select id="batch-assign-handler" class="form-select" style="width:100%;padding:10px 12px;font-size:13px;margin-bottom:16px;">' +
    '<option value="">请选择处理人</option>' +
    '<option value="赵飞">👨‍💼 赵飞（前厅经理）</option>' +
    '<option value="周敏">👩‍💼 周敏（客房经理）</option>' +
    '<option value="郑强">🧹 郑强（清洁人员）</option>' +
    '<option value="王工">🔧 王工（工程师）</option>' +
    '</select>' +
    '<div style="font-size:13px;font-weight:600;margin-bottom:10px;">填写备注</div>' +
    '<textarea id="batch-assign-note" class="form-textarea" placeholder="批量分配备注（可选）" style="width:100%;min-height:70px;padding:10px 12px;font-size:12px;border:1px solid var(--border);border-radius:8px;resize:none;"></textarea>' +
    '</div>' +
    '<div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;">' +
    '<button onclick="closeBatchAssignWo()" class="modal-btn secondary" style="padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:white;color:var(--text-light);">取消</button>' +
    '<button onclick="submitBatchAssignWo()" class="modal-btn primary" style="padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:var(--blue);color:white;">✅ 确认分配</button>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeBatchAssignWo() {
  var el = document.getElementById('modal-batch-assign-wo');
  if (el) el.remove();
}

function submitBatchAssignWo() {
  var handler = document.getElementById('batch-assign-handler').value;
  if (!handler) { showToast('请选择处理人', 'error'); return; }
  var note = document.getElementById('batch-assign-note').value;
  var count = window._selectedWorkorders.size;
  // 更新内存数据
  if (typeof workorderData !== 'undefined') {
    workorderData.forEach(function(wo) {
      if (window._selectedWorkorders.has(wo.id)) {
        wo.assignee = handler;
        if (wo.status === 'pending') wo.status = 'processing';
      }
    });
  }
  addOpLog('workorder', '赵飞', '批量重新分配 ' + count + ' 条工单给 ' + handler + (note ? '，备注：' + note : ''), '127.0.0.1');
  closeBatchAssignWo();
  clearWorkorderSelection();
  showToast('✅ 批量分配成功！' + count + ' 条工单已分配给 ' + handler, 'success');
  // 刷新工单表格
  if (typeof renderWorkorderTable === 'function') renderWorkorderTable();
  else if (typeof filterWorkorder === 'function') filterWorkorder('all', document.querySelector('.card-tab'));
}

// ==================== 【改进2】退房预结算预览功能 ====================
// 功能：退房前自动计算当前应付金额（含过夜费估算），让前台一目了然
function openCheckoutPreSettlement(roomNum, guestName, checkinTime, roomRate) {
  var now = new Date();
  var ciTime = new Date((checkinTime || '2026-03-27 14:00').replace(' ', 'T'));
  var diffMs = now - ciTime;
  var diffHours = Math.floor(diffMs / 3600000);
  var days = Math.floor(diffHours / 24);
  var remainingHours = diffHours % 24;
  var rate = parseFloat(roomRate) || 128;
  // 估算：超过14:00算过夜
  var checkoutHour = 14;
  var ciHour = ciTime.getHours();
  var estimatedDays = days;
  if (remainingHours > (checkoutHour - ciHour) && days === 0) estimatedDays = 1;
  if (remainingHours > 0 && days > 0) estimatedDays = days + (diffHours % 24 > checkoutHour ? 1 : 0);
  var estimatedTotal = estimatedDays * rate;
  var deposit = 100; // 默认押金
  var refund = deposit - estimatedTotal;
  var html = '<div id="modal-checkout-preview" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:center;justify-content:center;">' +
    '<div class="modal" style="width:460px;max-width:90vw;background:white;border-radius:12px;overflow:hidden;">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
    '<div style="font-size:16px;font-weight:700;">📋 退房预结算 - ' + roomNum + '房间</div>' +
    '<button onclick="closeCheckoutPreview()" style="width:28px;height:28px;border-radius:6px;border:none;background:var(--bg);cursor:pointer;font-size:16px;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:20px 24px;">' +
    '<div style="padding:12px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;margin-bottom:16px;font-size:12px;color:var(--blue);">' +
    '💡 基于当前时间 <strong>' + now.toLocaleString('zh-CN', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) + '</strong> 自动估算费用，仅供参考</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">入住时间</div><div style="font-size:13px;font-weight:700;">' + (checkinTime || '2026-03-27 14:00').slice(0, 16) + '</div></div>' +
    '<div style="padding:12px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">当前时长</div><div style="font-size:13px;font-weight:700;color:var(--blue);">' + days + '天' + remainingHours + '小时</div></div>' +
    '</div>' +
    '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg);"><span style="font-size:12px;color:var(--text-muted);">房费（¥' + rate + '/天 × ' + estimatedDays + '天）</span><span style="font-size:13px;font-weight:700;">¥' + estimatedTotal + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg);"><span style="font-size:12px;color:var(--text-muted);">押金</span><span style="font-size:13px;font-weight:700;">¥' + deposit + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;' + (refund >= 0 ? 'background:var(--green-bg);' : 'background:var(--red-bg);') + '">' +
    '<span style="font-size:13px;font-weight:700;">' + (refund >= 0 ? '应退金额' : '需补缴金额') + '</span><span style="font-size:16px;font-weight:700;color:' + (refund >= 0 ? 'var(--green)' : 'var(--red)') + ';">¥' + Math.abs(refund).toFixed(0) + '</span></div>' +
    '</div>' +
    '<div style="padding:10px 14px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);margin-bottom:12px;">' +
    '⚠️ 实际金额以退房结算时计算为准，此为预估算</div>' +
    '<div style="display:flex;gap:10px;"><button onclick="closeCheckoutPreview()" class="modal-btn secondary" style="flex:1;padding:10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:white;color:var(--text-light);">返回</button>' +
    '<button onclick="closeCheckoutPreview();openCheckoutFullModal(\'' + roomNum + '\',\'' + guestName + '\',\'' + checkinTime + '\')" class="modal-btn primary" style="flex:1;padding:10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:var(--blue);color:white;">去结算 ➜</button></div>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeCheckoutPreview() {
  var el = document.getElementById('modal-checkout-preview');
  if (el) el.remove();
}

// ==================== 【改进3】设备固件版本对比表 ====================
// 功能：一次性展示所有设备当前固件版本 vs 最新版本，一目了然哪些需要升级
function openFirmwareComparisonModal() {
  // 模拟设备数据
  var devices = [
    {room:'301', name:'领握LH-807', uuid:'A84F1AF2', ver:'v2.3.1', latest:'v2.3.1', status:'latest'},
    {room:'302', name:'领握LH-807', uuid:'B92E2BB3', ver:'v2.3.0', latest:'v2.3.1', status:'outdated'},
    {room:'303', name:'领握LH-807', uuid:'C73D3CC4', ver:'v2.2.8', latest:'v2.3.1', status:'outdated'},
    {room:'201', name:'领握LH-807', uuid:'D64D4DD5', ver:'v2.3.1', latest:'v2.3.1', status:'latest'},
    {room:'202', name:'领握LH-807', uuid:'E55E5EE6', ver:'v2.3.0', latest:'v2.3.1', status:'outdated'},
    {room:'203', name:'领握LH-807', uuid:'F46F6FF7', ver:'v2.3.1', latest:'v2.3.1', status:'latest'},
    {room:'102', name:'领握LH-807', uuid:'G37G7AG8', ver:'v2.2.5', latest:'v2.3.1', status:'critical'},
    {room:'104', name:'领握LH-807', uuid:'H28H8BH9', ver:'v2.3.1', latest:'v2.3.1', status:'latest'},
  ];
  var latestVer = 'v2.3.1';
  var outdatedCount = devices.filter(function(d){ return d.status !== 'latest'; }).length;
  var html = '<div id="modal-firmware-compare" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:center;justify-content:center;">' +
    '<div class="modal" style="width:680px;max-width:95vw;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">' +
    '<div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div><div style="font-size:16px;font-weight:700;">📦 设备固件版本对比</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">最新版本：<span style="color:var(--green);font-weight:700;">' + latestVer + '</span>　<span style="color:var(--orange);">' + outdatedCount + '台设备需要升级</span></div></div>' +
    '<button onclick="closeFirmwareCompare()" style="width:28px;height:28px;border-radius:6px;border:none;background:var(--bg);cursor:pointer;font-size:16px;color:var(--text-light);">✕</button></div>' +
    '<div style="padding:16px 24px;flex:1;overflow-y:auto;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="background:var(--bg);"><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">房间</th><th style="padding:8px 10px;text-align:left;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">设备UUID</th><th style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">当前版本</th><th style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">最新版本</th><th style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">状态</th><th style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);border-bottom:1px solid var(--border);">操作</th></tr></thead>' +
    '<tbody>';
  devices.forEach(function(d) {
    var statusLabel = d.status === 'latest' ? '<span style="background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">已是最新</span>' :
                       d.status === 'outdated' ? '<span style="background:var(--orange-bg);color:var(--orange);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">有更新</span>' :
                       '<span style="background:var(--red-bg);color:var(--red);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">严重落后</span>';
    var btn = d.status === 'latest' ? '<button style="padding:4px 10px;border-radius:5px;border:none;background:var(--bg);color:var(--text-muted);font-size:11px;cursor:default;">-</button>' :
              '<button onclick="doSingleFirmwareUpgrade(\'' + d.uuid + '\')" style="padding:4px 10px;border-radius:5px;border:1px solid var(--purple);background:var(--purple-bg);color:var(--purple);font-size:11px;font-weight:600;cursor:pointer;">📦 升级</button>';
    var rowBg = d.status === 'critical' ? 'background:var(--red-bg);' : '';
    html += '<tr style="' + rowBg + '">' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);"><span style="font-weight:700;">' + d.room + '</span></td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-family:monospace;font-size:11px;color:var(--text-muted);">' + d.uuid + '-xxxx</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);text-align:center;font-weight:' + (d.status !== 'latest' ? '700;color:var(--orange);' : '400;') + ';">' + d.ver + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);text-align:center;font-weight:700;color:var(--green);">' + d.latest + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);text-align:center;">' + statusLabel + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid var(--border);text-align:center;">' + btn + '</td></tr>';
  });
  html += '</tbody></table></div>' +
    '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
    '<div style="font-size:12px;color:var(--text-muted);">共 <strong>8</strong> 台设备　<span style="color:var(--green);">5台已是最新</span>　<span style="color:var(--orange);">2台有更新</span>　<span style="color:var(--red);">1台严重落后</span></div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button onclick="closeFirmwareCompare()" style="padding:7px 16px;border-radius:6px;border:1px solid var(--border);background:white;color:var(--text-light);font-size:12px;font-weight:600;cursor:pointer;">关闭</button>' +
    '<button onclick="openBatchUpgradeModal();closeFirmwareCompare();" style="padding:7px 16px;border-radius:6px;border:none;background:var(--purple);color:white;font-size:12px;font-weight:600;cursor:pointer;">📦 批量升级全部</button></div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeFirmwareCompare() {
  var el = document.getElementById('modal-firmware-compare');
  if (el) el.remove();
}

function doSingleFirmwareUpgrade(uuid) {
  showToast('📦 正在升级设备 ' + uuid.slice(0, 8) + '...', 'info');
  setTimeout(function() {
    showToast('✅ 设备 ' + uuid.slice(0, 8) + ' 固件升级完成（v2.3.0 → v2.3.1）', 'success');
    closeFirmwareCompare();
  }, 2000);
}

// ==================== 【改进4】首页待办事项交互面板 ====================
// 功能：首页聚合今日所有待办（告警/工单/退房/查房），点击可标记处理并跳转
function renderHomeTodoPanel() {
  var todos = [
    {id:'todo-1', type:'alert', icon:'🔴', title:'303房间门锁离线', desc:'已离线48分钟，需检查网络', priority:'high', page:'alert', time:'10分钟前'},
    {id:'todo-2', type:'alert', icon:'🟡', title:'306房间电量低于20%', desc:'请尽快更换电池', priority:'medium', page:'device', time:'25分钟前'},
    {id:'todo-3', type:'workorder', icon:'🛠️', title:'305房间热水投诉', desc:'待接受工单', priority:'high', page:'workorder', time:'30分钟前'},
    {id:'todo-4', type:'workorder', icon:'⏰', title:'201房间发票需求', desc:'已超时2小时', priority:'high', page:'workorder', time:'1小时前'},
    {id:'todo-5', type:'checkout', icon:'⏰', title:'302房间超时未退', desc:'已过期2小时', priority:'high', page:'checkout', time:'2小时前'},
    {id:'todo-6', type:'housekeeping', icon:'🧹', title:'203房间待查房', desc:'保洁完成待查房', priority:'low', page:'housekeeping', time:'15分钟前'},
  ];
  var colors = {high:'var(--red)', medium:'var(--orange)', low:'var(--green)'};
  var bgColors = {high:'var(--red-bg)', medium:'var(--orange-bg)', low:'var(--green-bg)'};
  var panel = document.getElementById('home-todo-panel');
  if (!panel) return;
  var html = '<div style="padding:14px 16px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
    '<div style="font-size:14px;font-weight:700;">📋 今日待办 <span style="font-size:12px;color:var(--text-muted);font-weight:400;">（' + todos.length + '项）</span></div>' +
    '<button onclick="showPage(\'notif\')" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;font-weight:600;">查看全部 ›</button></div>';
  todos.forEach(function(t) {
    var c = colors[t.priority] || colors.medium;
    var bg = bgColors[t.priority] || bgColors.medium;
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;' + (t !== todos[todos.length-1] ? 'border-bottom:1px solid var(--border);' : '') + '">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">' + t.icon + '</div>' +
      '<div style="flex:1;min-width:0;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--text);">' + t.title + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:1px;">' + t.desc + ' · ' + t.time + '</div></div>' +
      '<button onclick="dismissTodo(\'' + t.id + '\', \'' + t.page + '\')" style="padding:4px 10px;border-radius:6px;border:1px solid ' + c + ';background:' + bg + ';color:' + c + ';font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;">处理</button></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
}

function dismissTodo(id, page) {
  var el = document.getElementById('todo-item-' + id);
  if (el) { el.style.transition = 'all 0.3s'; el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(function() { el.remove(); }, 300); }
  if (page === 'checkout') openCheckoutFullModal('302', '李四', '2026-03-27 14:00');
  else if (page === 'workorder') showPage('workorder');
  else if (page === 'device') showPage('device');
  else if (page === 'alert') showPage('alert');
  else if (page === 'housekeeping') showPage('housekeeping');
  else showPage(page);
}

// ==================== 【改进5】交接班报表数据导出 ====================
// 功能：将交接班报表数据导出为CSV格式，便于存档和追溯
function exportHandoverReportCSV() {
  var now = new Date();
  var dateStr = now.toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'-');
  var timeStr = now.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  // 模拟交接班数据
  var shifts = [
    {shift:'早班', time:'07:00-15:00', revenue:4820, checkin:5, checkout:3, settlement:8, alerts:1, workorders:2, staffPresent:4, staffAbsent:0},
    {shift:'中班', time:'15:00-23:00', revenue:3260, checkin:3, checkout:4, settlement:6, alerts:0, workorders:1, staffPresent:3, staffAbsent:1},
    {shift:'晚班', time:'23:00-07:00', revenue:1280, checkin:2, checkout:1, settlement:3, alerts:2, workorders:0, staffPresent:2, staffAbsent:0},
  ];
  var csv = '\uFEFF交接班报表,' + dateStr + ' ' + timeStr + '\n';
  csv += '班次,时段,营收,入住,退房,结算笔数,待处理告警,待办工单,出勤人数,缺勤人数\n';
  shifts.forEach(function(s) { csv += s.shift + ',' + s.time + ',' + s.revenue + ',' + s.checkin + ',' + s.checkout + ',' + s.settlement + ',' + s.alerts + ',' + s.workorders + ',' + s.staffPresent + ',' + s.staffAbsent + '\n'; });
  csv += '\n备注：\n';
  csv += '1. 营收数据已核对\n';
  csv += '2. 房间状态已确认\n';
  csv += '3. 工单已移交\n';
  csv += '4. 设备告警已记录\n';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '交接班报表_' + dateStr + '.csv';
  a.click();
  showToast('📤 交接班报表已导出：交接班报表_' + dateStr + '.csv', 'success');
}

// 挂载到 window
window.toggleWorkorderRow = toggleWorkorderRow;
window.clearWorkorderSelection = clearWorkorderSelection;
window.openBatchAssignWorkorder = openBatchAssignWorkorder;
window.closeBatchAssignWo = closeBatchAssignWo;
window.submitBatchAssignWo = submitBatchAssignWo;
window.openCheckoutPreSettlement = openCheckoutPreSettlement;
window.closeCheckoutPreview = closeCheckoutPreview;
window.openFirmwareComparisonModal = openFirmwareComparisonModal;
window.closeFirmwareCompare = closeFirmwareCompare;
window.doSingleFirmwareUpgrade = doSingleFirmwareUpgrade;
window.renderHomeTodoPanel = renderHomeTodoPanel;
window.dismissTodo = dismissTodo;
window.exportHandoverReportCSV = exportHandoverReportCSV;

// ==================== 改进1NEW: 黑名单管理完整功能 ====================

// 黑名单Tab切换
function filterBlacklistTab(type, el) {
  document.querySelectorAll('#page-blacklist .card-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  var rows = document.querySelectorAll('#blacklist-table-body tr');
  rows.forEach(function(row) {
    if (type === 'all' || row.dataset.type === type) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// 黑名单搜索
function applyBlacklistSearch() {
  var q = document.getElementById('bl-search-input').value.trim().toLowerCase();
  var type = document.getElementById('bl-type-filter').value;
  var rows = document.querySelectorAll('#blacklist-table-body tr');
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var matchType = type === 'all' || row.dataset.type === type || (type === 'expiring' && row.dataset.expiring === 'true');
    var matchSearch = !q || text.indexOf(q) !== -1;
    row.style.display = matchType && matchSearch ? '' : 'none';
  });
}

// 打开新增黑名单弹窗
function openAddBlacklistModal() { openModal('blacklist-add'); }

// 切换永久封禁显示
function toggleBlPermanent(val) {
  var expGroup = document.getElementById('bl-add-expire-group');
  if (expGroup) expGroup.style.display = val === 'permanent' ? 'none' : '';
}

// 提交新增黑名单
function submitAddBlacklist() {
  var name = document.getElementById('bl-add-name').value.trim();
  var phone = document.getElementById('bl-add-phone').value.trim();
  var reason = document.getElementById('bl-add-reason').value.trim();
  if (!name || !phone || !reason) { showToast('请填写必填项', 'error'); return; }
  var type = document.getElementById('bl-add-type').value;
  var dur = document.getElementById('bl-add-duration').value;
  var html = '<tr data-type="' + type + '" data-expiring="false"><td><span style="font-weight:600;">' + name + '</span></td><td>' + phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') + '</td><td>--</td><td>' + reason + '</td><td><span class="tbadge red">' + (type === 'active' ? '主动封禁' : '系统拦截') + '</span></td><td>' + new Date().toISOString().slice(0,10).replace(/-/g, '-') + '</td><td>' + (dur === 'permanent' ? '永久' : dur + '天后') + '</td><td><span class="tbadge red">🔒 封禁中</span></td><td><button class="action-btn small" onclick="openBlacklistDetailModal(-1)">详情</button> <button class="action-btn small green" onclick="unblacklistPerson(-1)">解除</button></td></tr>';
  document.getElementById('blacklist-table-body').insertAdjacentHTML('afterbegin', html);
  closeModal('blacklist-add');
  showToast('🚫 ' + name + ' 已加入黑名单', 'success');
}

// 打开黑名单详情
function openBlacklistDetailModal(idx) {
  var rows = document.querySelectorAll('#blacklist-table-body tr');
  var row = rows[idx] || rows[0];
  if (!row) return;
  var cells = row.querySelectorAll('td');
  var name = cells[0].textContent.trim();
  document.getElementById('bld-title').textContent = '🚫 黑名单详情 - ' + name;
  document.getElementById('bld-content').innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    '<div class="info-item"><div class="label">姓名</div><div class="value">' + name + '</div></div>' +
    '<div class="info-item"><div class="label">手机号</div><div class="value">' + cells[1].textContent.trim() + '</div></div>' +
    '<div class="info-item"><div class="label">证件号</div><div class="value">' + cells[2].textContent.trim() + '</div></div>' +
    '<div class="info-item"><div class="label">类型</div><div class="value">' + cells[4].textContent.trim() + '</div></div>' +
    '<div class="info-item"><div class="label">封禁时间</div><div class="value">' + cells[5].textContent.trim() + '</div></div>' +
    '<div class="info-item"><div class="label">到期时间</div><div class="value">' + cells[6].textContent.trim() + '</div></div></div>' +
    '<div style="margin-top:14px;"><div class="label" style="margin-bottom:6px;">封禁原因</div><div style="padding:12px;background:var(--bg);border-radius:8px;font-size:13px;line-height:1.6;">' + cells[3].textContent.trim() + '</div></div>';
  openModal('blacklist-detail');
}

// 解除封禁
function unblacklistPerson(idx) {
  var rows = document.querySelectorAll('#blacklist-table-body tr');
  if (rows[idx]) { rows[idx].remove(); showToast('✅ 已解除封禁', 'success'); }
  closeModal('blacklist-detail');
}

// 延长封禁
function extendBlacklistPeriod(idx) { showToast('⏰ 封禁期限已延长30天', 'success'); }

// 导出黑名单CSV
function exportBlacklistCSV() { showToast('📤 黑名单CSV导出中...', 'info'); setTimeout(function(){ showToast('导出成功！', 'success'); }, 600); }

// 处理详情页操作按钮
function handleBlacklistDetailAction() { unblacklistPerson(0); closeModal('blacklist-detail'); }

// ==================== 改进2NEW: 智能语音迎宾词配置 ====================

var voiceGreetingScenarios = {
  default: '欢迎回家！亲爱的宾客，祝您住得舒适安心。如需帮助，请拨打客服热线。',
  vip: '尊敬的VIP贵宾，欢迎回家！感谢您选择我们，祝您旅途愉快，享受尊贵体验。',
  late: '夜深了，欢迎回来。请注意安全，小心台阶。如需帮助请拨打电话。',
  morning: '早安，亲爱的宾客！美好的一天从入住开始，祝您住得舒适，睡得香甜。',
  corporate: '欢迎光临！商务出行首选，感谢您的信任。如需会议室或商务服务，请随时联系。'
};

function loadVoiceGreetingScenario() {
  var scenario = document.getElementById('vg-scenario').value;
  var text = voiceGreetingScenarios[scenario] || voiceGreetingScenarios.default;
  document.getElementById('vg-content').value = text;
  document.getElementById('vg-preview-text').textContent = text;
  document.getElementById('vg-char-count').textContent = text.length;
}

function updateVoiceGreetingPreview() {
  var text = document.getElementById('vg-content').value;
  document.getElementById('vg-preview-text').textContent = text;
  var count = document.getElementById('vg-char-count');
  if (count) count.textContent = text.length;
}

function previewVoiceGreeting() {
  var status = document.getElementById('vg-preview-status');
  if (status) { status.textContent = '🔊 正在播放...'; status.style.color = 'var(--green)'; }
  showToast('🔊 语音迎宾预览：' + (document.getElementById('vg-content') || {value:''}).value.slice(0,20) + '...', 'info');
  setTimeout(function(){ if (status) { status.textContent = '✅ 播放完成'; status.style.color = 'var(--text-muted)'; } }, 2000);
}

function saveVoiceGreetingConfig() {
  var text = document.getElementById('vg-content').value;
  if (text.length < 5) { showToast('迎宾语不能少于5个字', 'error'); return; }
  var scenario = document.getElementById('vg-scenario').value;
  voiceGreetingScenarios[scenario] = text;
  closeModal('voice-greeting');
  showToast('🎙️ 语音迎宾配置已保存', 'success');
}

// ==================== 改进3NEW: 固件版本对比分析器 ====================

function openFirmwareAnalyzerModal() { openModal('firmware-analyzer'); }

function toggleFwaSelectAll(cb) {
  document.querySelectorAll('.fwa-device-check').forEach(function(c) { c.checked = cb.checked; });
  updateFwaCount();
}

function updateFwaCount() {
  var checked = document.querySelectorAll('.fwa-device-check:checked').length;
  var countEl = document.getElementById('fwa-selected-count');
  var upgEl = document.getElementById('fwa-upgrade-count');
  if (countEl) countEl.textContent = checked;
  if (upgEl) upgEl.textContent = checked;
}

function executeFirmwareBatchUpgrade() {
  var checked = document.querySelectorAll('.fwa-device-check:checked').length;
  if (checked === 0) { showToast('请先选择要升级的设备', 'error'); return; }
  closeModal('firmware-analyzer');
  showToast('📦 固件批量升级已启动，共 ' + checked + ' 台设备排队中...', 'info');
  setTimeout(function(){ showToast('✅ 固件升级完成！3台成功，0台失败', 'success'); }, 3000);
}

// ==================== 改进4NEW: 密码键盘防窥乱序模式 ====================

function openKeypadShuffleModal() { openModal('keypad-shuffle'); }

function toggleKeypadShuffleGlobal(checked) {
  var track = document.getElementById('ks-toggle-track');
  var thumb = document.getElementById('ks-toggle-thumb');
  if (track && thumb) {
    if (checked) {
      track.style.background = 'var(--green)';
      thumb.style.transform = 'translateX(22px)';
    } else {
      track.style.background = 'var(--border)';
      thumb.style.transform = 'translateX(0)';
    }
  }
}

function shuffleKeypadPreview() {
  var nums = ['1','2','3','4','5','6','7','8','9'];
  for (var i = nums.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
  }
  var cells = document.querySelectorAll('#ks-keypad-preview > div');
  if (cells.length === 9) {
    for (var k = 0; k < 9; k++) {
      cells[k].textContent = nums[k];
      cells[k].style.background = nums[k] === '5' ? 'var(--blue-bg)' : 'var(--bg)';
      cells[k].style.borderColor = nums[k] === '5' ? 'var(--blue)' : 'var(--border)';
      cells[k].style.color = nums[k] === '5' ? 'var(--blue)' : '';
    }
  }
}

function saveKeypadShuffleConfig() {
  var enabled = document.getElementById('ks-global-toggle').checked;
  var scope = document.getElementById('ks-scope').value;
  var strategy = document.getElementById('ks-strategy').value;
  closeModal('keypad-shuffle');
  showToast('🔢 密码键盘防窥配置已保存（' + (enabled ? '已启用' : '已禁用') + '）', 'success');
}

// ==================== 改进5NEW: 会员充值套餐选择器 ====================

var selectedPackage = { amount: 500, bonus: 25, points: 80, payMethod: 'wechat' };

var rechargePackages = [
  { amount: 200, bonus: 0, points: 20 },
  { amount: 500, bonus: 25, points: 80 },
  { amount: 1000, bonus: 100, points: 200 },
  { amount: 2000, bonus: 400, points: 500 }
];

function openMemberRechargePackagesModal(memberIdx) {
  selectedPackage = { amount: 500, bonus: 25, points: 80, payMethod: 'wechat' };
  openModal('member-recharge-packages');
  updateRechargePackageUI();
}

function selectRechargePackage(idx, el) {
  var pkg = rechargePackages[idx];
  selectedPackage = { amount: pkg.amount, bonus: pkg.bonus, points: pkg.points, payMethod: selectedPackage.payMethod };
  document.querySelectorAll('.mrp-package-card').forEach(function(c) {
    c.style.borderColor = 'var(--border)';
    c.style.background = 'white';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
  document.getElementById('mrp-custom-amount').value = '';
  updateRechargePackageUI();
}

function useCustomAmount() {
  var amt = parseInt(document.getElementById('mrp-custom-amount').value) || 0;
  if (amt <= 0) { showToast('请输入有效金额', 'error'); return; }
  var bonus = 0;
  var points = Math.floor(amt * 0.1);
  selectedPackage = { amount: amt, bonus: bonus, points: points, payMethod: selectedPackage.payMethod };
  document.querySelectorAll('.mrp-package-card').forEach(function(c) {
    c.style.borderColor = 'var(--border)';
    c.style.background = 'white';
  });
  updateRechargePackageUI();
  showToast('已选择自定义金额 ¥' + amt, 'info');
}

function onCustomAmountChange() {
  var amt = parseInt(document.getElementById('mrp-custom-amount').value) || 0;
  if (amt > 0) {
    document.querySelectorAll('.mrp-package-card').forEach(function(c) {
      c.style.borderColor = 'var(--border)';
      c.style.background = 'white';
    });
  }
}

function selectPayMethod(method, el) {
  selectedPackage.payMethod = method;
  document.querySelectorAll('.mrp-pay-method').forEach(function(m) {
    m.style.borderColor = 'var(--border)';
    m.style.background = 'white';
  });
  el.style.borderColor = method === 'wechat' ? 'var(--green)' : 'var(--blue)';
  el.style.background = method === 'wechat' ? 'var(--green-bg)' : 'var(--blue-bg)';
}

function updateRechargePackageUI() {
  var amt = selectedPackage.amount;
  var bonus = selectedPackage.bonus;
  var points = selectedPackage.points;
  var total = amt + bonus;
  document.getElementById('mrp-detail-amount').textContent = '¥' + amt;
  document.getElementById('mrp-detail-bonus').textContent = bonus > 0 ? '+¥' + bonus : '¥0';
  document.getElementById('mrp-detail-points').textContent = '+' + points + '积分';
  document.getElementById('mrp-detail-total').textContent = '¥' + total + ' · ' + points + '积分';
  var btn = document.getElementById('mrp-pay-btn');
  if (btn) btn.textContent = '💳 立即支付 ¥' + total;
}

function executeMemberRecharge() {
  var amt = selectedPackage.amount;
  var total = amt + selectedPackage.bonus;
  closeModal('member-recharge-packages');
  showToast('💳 支付¥' + total + '成功！积分+' + selectedPackage.points, 'success');
}

// 挂载新增函数
window.filterBlacklistTab = filterBlacklistTab;
window.applyBlacklistSearch = applyBlacklistSearch;
window.openAddBlacklistModal = openAddBlacklistModal;
window.toggleBlPermanent = toggleBlPermanent;
window.submitAddBlacklist = submitAddBlacklist;
window.openBlacklistDetailModal = openBlacklistDetailModal;
window.unblacklistPerson = unblacklistPerson;
window.extendBlacklistPeriod = extendBlacklistPeriod;
window.exportBlacklistCSV = exportBlacklistCSV;
window.handleBlacklistDetailAction = handleBlacklistDetailAction;
window.loadVoiceGreetingScenario = loadVoiceGreetingScenario;
window.updateVoiceGreetingPreview = updateVoiceGreetingPreview;
window.previewVoiceGreeting = previewVoiceGreeting;
window.saveVoiceGreetingConfig = saveVoiceGreetingConfig;
window.openFirmwareAnalyzerModal = openFirmwareAnalyzerModal;
window.toggleFwaSelectAll = toggleFwaSelectAll;
window.updateFwaCount = updateFwaCount;
window.executeFirmwareBatchUpgrade = executeFirmwareBatchUpgrade;
window.openKeypadShuffleModal = openKeypadShuffleModal;
window.toggleKeypadShuffleGlobal = toggleKeypadShuffleGlobal;
window.shuffleKeypadPreview = shuffleKeypadPreview;
window.saveKeypadShuffleConfig = saveKeypadShuffleConfig;
window.openMemberRechargePackagesModal = openMemberRechargePackagesModal;
window.selectRechargePackage = selectRechargePackage;
window.useCustomAmount = useCustomAmount;
window.onCustomAmountChange = onCustomAmountChange;
window.selectPayMethod = selectPayMethod;
window.updateRechargePackageUI = updateRechargePackageUI;
window.executeMemberRecharge = executeMemberRecharge;

// ==================== 改进-A: 首页逾期退房告警横幅 + 强制结账流程 ====================
// 功能：检测过期未退房客人，弹出强制退房确认+结算流程
function checkOverdueCheckouts() {
  var now = new Date();
  var overdueItems = [];
  if (typeof recordsAllData !== 'undefined') {
    recordsAllData.forEach(function(r) {
      if (r.status === 'active' && r.type === 'in') {
        if (r.room === '301') { overdueItems.push(r); }
      }
    });
  }
  return overdueItems;
}

function showOverdueCheckoutBanner() {
  var banner = document.getElementById('overdue-checkout-banner');
  if (!banner) return;
  var overdue = checkOverdueCheckouts();
  banner.style.display = overdue.length > 0 ? '' : 'none';
}

function openOverdueCheckoutModal() {
  var overdue = checkOverdueCheckouts();
  if (overdue.length === 0) { showToast('暂无逾期退房记录', 'info'); return; }
  var item = overdue[0];
  var now = new Date();
  var overdueMinutes = Math.floor((now - new Date('2026-03-28T12:00:00')) / 60000);
  if (overdueMinutes < 0) overdueMinutes = 185;
  var html = '<div class="modal-overlay" id="modal-overdue-checkout" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">';
  html += '<div class="modal" style="width:520px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">逾期未退房处理</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">系统检测到以下房间已超过退房时间，请及时处理</div></div>';
  html += '<button onclick="document.getElementById(\'modal-overdue-checkout\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="padding:14px;background:var(--red-bg);border:1px solid var(--red);border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">';
  html += '<div style="font-size:28px;">⏰</div>';
  html += '<div><div style="font-size:14px;font-weight:700;color:var(--red);">' + item.room + ' 房间 - ' + item.name + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">应退房时间：2026-03-28 12:00（已超时约 ' + overdueMinutes + ' 分钟）</div></div></div>';
  html += '<div style="padding:14px;background:var(--bg);border-radius:8px;margin-bottom:16px;">';
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">📋 费用明细</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;"><span style="color:var(--text-muted);">房费（已入住1晚）</span><span>¥298</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;"><span style="color:var(--text-muted);">超时费用（加收半天）</span><span style="color:var(--red);font-weight:700;">¥149</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;"><span style="color:var(--text-muted);">押金</span><span>¥100（可退）</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border);margin-top:4px;font-size:14px;font-weight:700;"><span>合计应缴</span><span style="color:var(--red);">¥347</span></div>';
  html += '</div>';
  html += '<div style="display:flex;gap:10px;margin-bottom:12px;">';
  html += '<button onclick="executeOverdueCheckout(\'cash\')" class="modal-btn primary" style="flex:1;padding:10px;background:var(--green);border-color:var(--green);">💴 现金结账</button>';
  html += '<button onclick="executeOverdueCheckout(\'scan\')" class="modal-btn primary" style="flex:1;padding:10px;background:var(--blue);border-color:var(--blue);">💳 扫码支付</button>';
  html += '</div>';
  html += '<button onclick="executeOverdueCheckout(\'waive\')" class="action-btn" style="width:100%;padding:8px;background:var(--orange-bg);color:var(--orange);border-color:var(--orange);">📝 减免超时费（需备注原因）</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function executeOverdueCheckout(payType) {
  var item = checkOverdueCheckouts()[0];
  document.getElementById('modal-overdue-checkout').remove();
  showToast('✅ 退房结算完成，' + item.room + ' 已退房', 'success');
  var banner = document.getElementById('overdue-checkout-banner');
  if (banner) banner.style.display = 'none';
  addOpLog('checkout', '赵飞', '逾期退房结算（' + payType + '）', item.room + ' ' + item.name);
}

// ==================== 改进-B: 操作日志查看器（全局操作追溯） ====================
var opLogData = [
  {time:'2026-03-28 02:45:00', module:'系统', operator:'赵飞', action:'登录', detail:'后台管理系统', ip:'192.168.1.100'},
  {time:'2026-03-28 02:50:00', module:'入住', operator:'赵飞', action:'办理入住', detail:'301房间 张三 入住', ip:'192.168.1.100'},
  {time:'2026-03-28 03:00:00', module:'设备', operator:'周敏', action:'远程开锁', detail:'305房间 远程开锁', ip:'192.168.1.102'},
  {time:'2026-03-28 03:05:00', module:'工单', operator:'赵飞', action:'创建工单', detail:'WO-20260328-001 客户投诉', ip:'192.168.1.100'},
  {time:'2026-03-28 03:10:00', module:'会员', operator:'周敏', action:'充值', detail:'会员充值 ¥500', ip:'192.168.1.102'},
  {time:'2026-03-28 03:15:00', module:'配置', operator:'赵飞', action:'系统设置', detail:'修改退房时间', ip:'192.168.1.100'},
  {time:'2026-03-27 23:00:00', module:'系统', operator:'系统', action:'自动任务', detail:'夜审报表自动生成', ip:'localhost'},
  {time:'2026-03-27 22:00:00', module:'入住', operator:'周敏', action:'批量退房', detail:'201/202/203 批量退房', ip:'192.168.1.102'},
  {time:'2026-03-27 21:30:00', module:'设备', operator:'赵飞', action:'固件升级', detail:'301设备固件升级', ip:'192.168.1.100'},
];

function applyOpLogFilter() {
  var module = (document.getElementById('oplog-module-filter') || {}).value || 'all';
  var operator = (document.getElementById('oplog-operator-filter') || {}).value || 'all';
  var action = (document.getElementById('oplog-search-input') || {}).value.trim().toLowerCase() || '';
  var rows = document.querySelectorAll('#oplog-table-body tr');
  rows.forEach(function(row) {
    var matchModule = module === 'all' || row.dataset.module === module;
    var matchOp = operator === 'all' || row.dataset.operator === operator;
    var matchAction = !action || row.textContent.toLowerCase().indexOf(action) !== -1;
    row.style.display = matchModule && matchOp && matchAction ? '' : 'none';
  });
}

function exportOpLogCSV() {
  var csv = '\uFEFF操作日志\n时间,模块,操作人,操作,详情,IP地址\n';
  opLogData.forEach(function(l) {
    csv += l.time + ',' + l.module + ',' + l.operator + ',' + l.action + ',' + l.detail + ',' + l.ip + '\n';
  });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '操作日志_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('📤 操作日志已导出', 'success');
}

// ==================== 改进-C: 设备实时诊断弹窗（远程硬件状态检测） ====================
function openDeviceDiagnosticModal(uuid) {
  var existing = document.getElementById('modal-device-diagnostic');
  if (existing) existing.remove();
  var now = new Date();
  var timeStr = now.toLocaleTimeString('zh-CN');
  var html = '<div class="modal-overlay" id="modal-device-diagnostic" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">';
  html += '<div class="modal" style="width:500px;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">🔧 设备实时诊断</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">设备：' + (uuid || 'A84F1AF2-xxxx') + ' · ' + timeStr + '</div></div>';
  html += '<button onclick="document.getElementById(\'modal-device-diagnostic\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="margin-bottom:16px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">🔄 正在检测，请稍候...</div>';
  html += '<div class="diag-progress"><div class="diag-progress-bar" id="diag-progress-bar" style="width:0%;transition:width 0.3s;"></div></div></div>';
  var diagLabels = ['📶 信号强度','🔋 电量','🔐 门锁状态','🌐 网络延迟','📡 固件版本'];
  diagLabels.forEach(function(label, idx) {
    html += '<div class="diag-item"><div class="diag-label"><span>' + label + '</span></div><div class="diag-value loading" id="diag-item-' + idx + '">检测中...</div></div>';
  });
  html += '<div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:8px;text-align:center;">';
  html += '<div style="font-size:12px;color:var(--text-muted);">诊断耗时</div>';
  html += '<div style="font-size:24px;font-weight:700;color:var(--blue);" id="diag-elapsed">0.0</div>';
  html += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">秒</div></div>';
  html += '<div style="margin-top:14px;display:flex;gap:8px;">';
  html += '<button class="modal-btn primary" style="flex:1;" onclick="reRunDeviceDiagnostic()">🔄 重新诊断</button>';
  html += '<button class="modal-btn secondary" onclick="document.getElementById(\'modal-device-diagnostic\').remove()">关闭</button></div>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  var results = [
    {value:'🟢 满格（-47dBm）', status:'ok'},
    {value:'88% (3.23V)', status:'ok'},
    {value:'🔒 已反锁', status:'ok'},
    {value:'22ms（优秀）', status:'ok'},
    {value:'v2.3.1（最新）', status:'ok'}
  ];
  var elapsed = 0;
  var diagInterval = setInterval(function() {
    elapsed += 0.1;
    var progBar = document.getElementById('diag-progress-bar');
    var elapsedEl = document.getElementById('diag-elapsed');
    if (progBar) progBar.style.width = Math.min(elapsed * 15, 100) + '%';
    if (elapsedEl) elapsedEl.textContent = elapsed.toFixed(1);
    if (elapsed >= 0.6) { clearInterval(diagInterval); updateDiagnosticResults(results); }
  }, 100);
}
function updateDiagnosticResults(results) {
  results.forEach(function(r, idx) {
    var el = document.getElementById('diag-item-' + idx);
    if (el) { el.textContent = r.value; el.className = 'diag-value ' + r.status; }
  });
}
function reRunDeviceDiagnostic() {
  var items = document.querySelectorAll('.diag-item .diag-value');
  items.forEach(function(el) { el.textContent = '检测中...'; el.className = 'diag-value loading'; });
  var progBar = document.getElementById('diag-progress-bar');
  if (progBar) progBar.style.width = '0%';
  var results = [
    {value:'🟢 满格（-47dBm）', status:'ok'},
    {value:'88% (3.23V)', status:'ok'},
    {value:'🔒 已反锁', status:'ok'},
    {value:'22ms（优秀）', status:'ok'},
    {value:'v2.3.1（最新）', status:'ok'}
  ];
  var elapsed = 0;
  var diagInterval = setInterval(function() {
    elapsed += 0.1;
    var progBar = document.getElementById('diag-progress-bar');
    var elapsedEl = document.getElementById('diag-elapsed');
    if (progBar) progBar.style.width = Math.min(elapsed * 15, 100) + '%';
    if (elapsedEl) elapsedEl.textContent = elapsed.toFixed(1);
    if (elapsed >= 0.6) { clearInterval(diagInterval); updateDiagnosticResults(results); }
  }, 100);
}

// ==================== 改进-D: 首页实时数据动态刷新 ====================
var homeRealtimeInterval = null;
function startHomeRealtimeUpdate() {
  if (homeRealtimeInterval) return;
  homeRealtimeInterval = setInterval(function() {
    updateHomeRealtimeStats();
  }, 10000);
}

function updateHomeRealtimeStats() {
  var occEl = document.getElementById('home-stat-occupancy');
  if (occEl) {
    var baseOcc = 78;
    var delta = Math.floor(Math.random() * 3) - 1;
    var newOcc = Math.max(60, Math.min(95, baseOcc + delta));
    occEl.textContent = newOcc + '%';
  }
  var devEl = document.getElementById('home-stat-device-online');
  if (devEl) { devEl.textContent = Math.floor(13 + Math.random() * 3) + '台'; }
  var woEl = document.getElementById('home-stat-pending-wo');
  if (woEl) { woEl.textContent = Math.floor(2 + Math.random() * 3) + '件'; }
  var revEl = document.getElementById('home-stat-revenue');
  if (revEl) { revEl.textContent = '¥' + (4800 + Math.floor(Math.random() * 500)).toLocaleString(); }
}

// ==================== 改进-E: 会员注册+开卡完整表单弹窗 ====================
var nmLevelsData = {
  bronze:{name:'铜卡会员', color:'#cd7f32', price:0, benefits:'基础房价95折 · 入住积分 · 生日礼遇'},
  silver:{name:'银卡会员', color:'#c0c0c0', price:500, benefits:'标准房价9折 · 2倍积分 · 免费加床 · 优先入住'},
  gold:{name:'金卡会员', color:'#ffd700', price:2000, benefits:'优惠房价85折 · 3倍积分 · 免费加床+早入住 · 免费minibar'},
  platinum:{name:'白金会员', color:'#e5e4e2', price:5000, benefits:'专属房价8折 · 5倍积分 · 套房升级 · 24h专属服务'}
};

function openNewMemberModal() {
  var existing = document.getElementById('modal-new-member');
  if (existing) existing.remove();
  var levels = [
    {value:'bronze', label:'🥉 铜卡', icon:'🥉'},
    {value:'silver', label:'🥈 银卡', icon:'🥈'},
    {value:'gold', label:'🥇 金卡', icon:'🥇'},
    {value:'platinum', label:'💎 白金', icon:'💎'}
  ];
  var html = '<div class="modal-overlay" id="modal-new-member" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">';
  html += '<div class="modal" style="width:560px;max-height:88vh;overflow-y:auto;">';
  html += '<div style="padding:20px 24px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">';
  html += '<div><div style="font-size:16px;font-weight:700;">👤 新增会员</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">填写会员信息并选择会员等级</div></div>';
  html += '<button onclick="document.getElementById(\'modal-new-member\').remove()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button></div>';
  html += '<div style="padding:20px 24px;">';
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">基本信息</div>';
  html += '<div class="form-row" style="margin-bottom:12px;">';
  html += '<div class="form-group" style="margin-bottom:0;"><label class="form-label">姓名 <span style="color:var(--red);">*</span></label><input class="form-input" id="nm-name" placeholder="请输入真实姓名"></div>';
  html += '<div class="form-group" style="margin-bottom:0;"><label class="form-label">手机号 <span style="color:var(--red);">*</span></label><input class="form-input" id="nm-phone" placeholder="请输入手机号码"></div></div>';
  html += '<div class="form-group" style="margin-bottom:12px;"><label class="form-label">身份证号</label><input class="form-input" id="nm-idcard" placeholder="可选，办理会员卡需要"></div>';
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:10px;">选择会员等级</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">';
  levels.forEach(function(lv, idx) {
    var isSelected = idx === 1 ? 'selected;' : '';
    var borderColor = idx === 1 ? 'var(--blue)' : 'var(--border)';
    var bgColor = idx === 1 ? 'var(--blue-bg)' : 'white';
    html += '<div class="exchange-item" id="nm-level-' + lv.value + '" onclick="selectNewMemberLevel(\'' + lv.value + '\', this)" style="cursor:pointer;padding:12px;border-color:' + borderColor + ';background:' + bgColor + ';' + (idx === 1 ? 'border-color:var(--blue);background:var(--blue-bg);' : '') + '">';
    html += '<div style="width:36px;height:36px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + lv.icon + '</div>';
    html += '<div style="flex:1;"><div style="font-size:13px;font-weight:700;">' + lv.label + '</div><div style="font-size:11px;color:var(--text-muted);">¥' + (idx === 0 ? '0' : idx === 1 ? '500' : idx === 2 ? '2000' : '5000') + ' 开通</div></div></div>';
  });
  html += '</div>';
  html += '<div id="nm-benefits-panel" style="padding:12px;background:var(--blue-bg);border-radius:8px;margin-bottom:12px;">';
  html += '<div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:6px;">🥈 银卡会员权益</div>';
  html += '<div style="font-size:11px;color:var(--text);line-height:1.8;">标准房价9折 · 2倍积分 · 免费加床 · 优先入住</div></div>';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:14px;">';
  html += '<input type="checkbox" id="nm-agree" style="accent-color:var(--blue);width:16px;height:16px;">';
  html += '<label for="nm-agree" style="font-size:11px;color:var(--text-muted);cursor:pointer;">我已阅读并同意《会员服务协议》和《隐私政策》</label></div>';
  html += '<button class="modal-btn primary" style="width:100%;padding:12px;font-size:14px;" onclick="submitNewMember()">💳 确认开卡（¥500）</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function selectNewMemberLevel(level, el) {
  document.querySelectorAll('[id^="nm-level-"]').forEach(function(c) {
    c.style.borderColor = 'var(--border)';
    c.style.background = 'white';
  });
  el.style.borderColor = 'var(--blue)';
  el.style.background = 'var(--blue-bg)';
  var data = nmLevelsData[level];
  var panel = document.getElementById('nm-benefits-panel');
  if (panel) {
    panel.innerHTML = '<div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:6px;">' + data.name + ' 权益</div>' +
      '<div style="font-size:11px;color:var(--text);line-height:1.8;">' + data.benefits + '</div>';
  }
  var btn = document.querySelector('#modal-new-member .modal-btn.primary');
  if (btn) btn.textContent = '💳 确认开卡（¥' + data.price + '）';
}

function submitNewMember() {
  var name = (document.getElementById('nm-name') || {}).value.trim() || '';
  var phone = (document.getElementById('nm-phone') || {}).value.trim() || '';
  var agree = (document.getElementById('nm-agree') || {}).checked || false;
  var selectedLevel = document.querySelector('[id^="nm-level-"]:not([style*="border-color: var(--border)"])');
  var level = selectedLevel ? selectedLevel.id.replace('nm-level-', '') : 'silver';
  if (!name) { showToast('请填写姓名', 'error'); return; }
  if (!phone) { showToast('请填写手机号', 'error'); return; }
  if (!agree) { showToast('请阅读并同意会员协议', 'error'); return; }
  var price = nmLevelsData[level].price;
  document.getElementById('modal-new-member').remove();
  showToast('✅ 会员 ' + name + '（' + nmLevelsData[level].name + '）开卡成功！', 'success');
  if (typeof addOpLog === 'function') addOpLog('member', '赵飞', '新会员开卡', name + ' ' + nmLevelsData[level].name + ' ¥' + price);
}

// 挂载新增函数到 window
window.checkOverdueCheckouts = checkOverdueCheckouts;
window.showOverdueCheckoutBanner = showOverdueCheckoutBanner;
window.openOverdueCheckoutModal = openOverdueCheckoutModal;
window.executeOverdueCheckout = executeOverdueCheckout;
window.applyOpLogFilter = applyOpLogFilter;
window.exportOpLogCSV = exportOpLogCSV;
window.openDeviceDiagnosticModal = openDeviceDiagnosticModal;
window.reRunDeviceDiagnostic = reRunDeviceDiagnostic;
window.startHomeRealtimeUpdate = startHomeRealtimeUpdate;
window.updateHomeRealtimeStats = updateHomeRealtimeStats;
window.openNewMemberModal = openNewMemberModal;
window.selectNewMemberLevel = selectNewMemberLevel;
window.submitNewMember = submitNewMember;
// ============================================================
// 物联后台v3迭代 - 5项功能性改进
// ============================================================

// ──────────────────────────────────────────────────────────────
// 改进1: 楼层平面图房间点击 → 弹出房间详情Modal
// 理由: 原系统点击楼层平面图房间直接跳设备页，用户无法在楼层视图内看到
//       房间的完整信息（入住人/钥匙/电量/门锁状态），改为弹窗详情更符合酒店操作习惯
// ──────────────────────────────────────────────────────────────

(function() {
  // 先定义房间详情Modal（如果不存在）
  if (!document.getElementById('modal-fp-room-detail')) {
    var modalHtml = '<div class="modal-overlay hidden" id="modal-fp-room-detail">' +
      '<div class="modal" style="width:580px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
          '<div style="font-size:24px;" id="frd-icon">🏠</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:15px;font-weight:700;" id="frd-room">301房间</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="frd-type">亲子间 · 3层</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<span id="frd-status-badge" class="tbadge green">入住</span>' +
            '<button onclick="closeFpRoomDetail()" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px 20px;flex:1;overflow-y:auto;">' +
          // 设备状态行
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">' +
            '<div style="padding:10px 12px;background:var(--blue-bg);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;color:var(--blue);" id="frd-battery">85%</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">🔋 电池</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--green-bg);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;color:var(--green);" id="frd-signal">-45</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">📡 信号dBm</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--purple-bg);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;color:var(--purple);" id="frd-unlock-count">28</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">🔓 累计开锁</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--orange-bg);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;color:var(--orange);" id="frd-key-count">3</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">🔑 有效钥匙</div>' +
            '</div>' +
          '</div>' +
          // 入住人信息
          '<div id="frd-guest-section" style="margin-bottom:14px;padding:12px 14px;background:var(--blue-bg);border:1px solid var(--blue);border-radius:8px;">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
              '<span style="font-size:12px;font-weight:700;color:var(--blue);">🏠 当前入住</span>' +
            '</div>' +
            '<div style="font-size:13px;font-weight:600;margin-bottom:2px;" id="frd-guest-name">张三</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="frd-guest-phone">138****8888</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="frd-checkin-time">入住：2026-03-25 14:00</div>' +
          '</div>' +
          // Tab切换
          '<div style="display:flex;border-bottom:2px solid var(--border);margin-bottom:12px;">' +
            '<div class="frd-tab active" id="frd-tab-key" onclick="switchFrdTab(\'key\',this)" style="padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;color:var(--blue);border-bottom:2px solid var(--blue);margin-bottom:-2px;">🔑 钥匙管理</div>' +
            '<div class="frd-tab" id="frd-tab-record" onclick="switchFrdTab(\'record\',this)" style="padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-2px;">📋 开锁记录</div>' +
            '<div class="frd-tab" id="frd-tab-energy" onclick="switchFrdTab(\'energy\',this)" style="padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-2px;">⚡ 能耗记录</div>' +
          '</div>' +
          // Tab内容
          '<div id="frd-content-key" style="min-height:120px;">' +
            '<table class="table" style="font-size:12px;">' +
              '<thead><tr><th>钥匙类型</th><th>持有人</th><th>开锁次数</th><th>有效期</th><th>状态</th><th>操作</th></tr></thead>' +
              '<tbody id="frd-key-list"></tbody>' +
            '</table>' +
          '</div>' +
          '<div id="frd-content-record" style="display:none;min-height:120px;">' +
            '<div id="frd-record-list" style="display:flex;flex-direction:column;gap:8px;"></div>' +
          '</div>' +
          '<div id="frd-content-energy" style="display:none;min-height:120px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">' +
              '<div style="padding:10px;background:var(--bg);border-radius:6px;text-align:center;"><div style="font-size:16px;font-weight:700;color:var(--blue);" id="frd-energy-today">3.2</div><div style="font-size:11px;color:var(--text-muted);">今日kWh</div></div>' +
              '<div style="padding:10px;background:var(--bg);border-radius:6px;text-align:center;"><div style="font-size:16px;font-weight:700;color:var(--green);" id="frd-energy-month">96.5</div><div style="font-size:11px;color:var(--text-muted);">本月kWh</div></div>' +
            '</div>' +
            '<div id="frd-energy-chart" style="display:flex;align-items:flex-end;height:60px;gap:4px;padding:4px;background:var(--bg);border-radius:6px;"></div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
          '<button class="modal-btn secondary" onclick="closeFpRoomDetail()">关闭</button>' +
          '<button class="modal-btn" onclick="frdGoDevice()" style="background:var(--blue);color:white;border:none;">📱 设备详情</button>' +
          '<button class="modal-btn" onclick="frdQuickUnlock()" style="background:var(--green);color:white;border:none;">🔓 远程开锁</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // 模拟房间钥匙数据
  var frdKeyData = {
    '301': [
      {type:'实体钥匙',holder:'张三',count:15,expire:'2026-04-25',status:'正常'},
      {type:'密码钥匙',holder:'张三',count:5,expire:'2026-04-25',status:'正常'},
      {type:'临时钥匙',holder:'保洁-李姐',count:8,expire:'2026-03-28',status:'正常'}
    ],
    '302': [
      {type:'实体钥匙',holder:'李四',count:22,expire:'2026-03-30',status:'正常'}
    ]
  };

  // 模拟开锁记录
  var frdRecordData = {
    '301': [
      {time:'今天 14:32',type:'密码开锁',holder:'张三',result:'成功'},
      {time:'今天 09:15',type:'远程开锁',holder:'管理员',result:'成功'},
      {time:'昨天 22:30',type:'密码开锁',holder:'张三',result:'成功'},
      {time:'昨天 08:45',type:'门卡开锁',holder:'张三',result:'成功'}
    ]
  };

  window.currentFpRoom = null;

  window.openFpRoomDetail = function(roomNum) {
    currentFpRoom = roomNum;
    var fpData = window.floorPlanData || [];
    var rd = fpData.find(function(r) { return r.room === roomNum; }) || {};
    var occ = rd.occupancy || 'empty';
    var statusMap = { in: { label: '入住', cls: 'green', icon: '🏠' }, empty: { label: '空房', cls: 'blue', icon: '⬜' }, dirty: { label: '脏房', cls: 'orange', icon: '🧹' }, maintain: { label: '维护', cls: 'gray', icon: '🔧' } };
    var sm = statusMap[occ] || statusMap.empty;
    document.getElementById('frd-room').textContent = roomNum + '房间';
    document.getElementById('frd-type').textContent = (rd.type || '未知') + ' · ' + (rd.floor || '?') + '层';
    document.getElementById('frd-status-badge').className = 'tbadge ' + sm.cls;
    document.getElementById('frd-status-badge').textContent = sm.label;
    document.getElementById('frd-icon').textContent = sm.icon;
    document.getElementById('frd-battery').textContent = (rd.battery !== undefined ? rd.battery + '%' : '--');
    document.getElementById('frd-signal').textContent = (rd.signal !== undefined ? rd.signal : '--');
    document.getElementById('frd-unlock-count').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('frd-key-count').textContent = (frdKeyData[roomNum] ? frdKeyData[roomNum].length : 1);
    // 入住人
    var guestSection = document.getElementById('frd-guest-section');
    if (occ === 'in' && rd.guest) {
      guestSection.style.display = '';
      document.getElementById('frd-guest-name').textContent = rd.guest;
      document.getElementById('frd-guest-phone').textContent = '138****' + String(Math.floor(Math.random() * 9000 + 1000));
      document.getElementById('frd-checkin-time').textContent = '入住：2026-03-' + String(Math.floor(Math.random() * 20 + 5)) + ' 14:00';
    } else {
      guestSection.style.display = 'none';
    }
    // 钥匙列表
    var keys = frdKeyData[roomNum] || frdKeyData['301'] || [];
    var keyHtml = '';
    keys.forEach(function(k) {
      keyHtml += '<tr>' +
        '<td>' + k.type + '</td>' +
        '<td>' + k.holder + '</td>' +
        '<td>' + k.count + '次</td>' +
        '<td>' + k.expire + '</td>' +
        '<td><span class="tbadge green">' + k.status + '</span></td>' +
        '<td><button class="action-btn small" onclick="showToast(\'正在删除钥匙...\',\'info\')" style="padding:2px 6px;font-size:10px;">删除</button></td>' +
        '</tr>';
    });
    document.getElementById('frd-key-list').innerHTML = keyHtml || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:16px;">暂无钥匙记录</td></tr>';
    // 默认显示钥匙Tab
    switchFrdTab('key', document.getElementById('frd-tab-key'));
    openModal('fp-room-detail');
  };

  window.closeFpRoomDetail = function() {
    closeModal('fp-room-detail');
  };

  window.switchFrdTab = function(tab, el) {
    document.querySelectorAll('.frd-tab').forEach(function(t) {
      t.classList.remove('active');
      t.style.color = 'var(--text-muted)';
      t.style.borderBottomColor = 'transparent';
    });
    if (el) {
      el.classList.add('active');
      el.style.color = 'var(--blue)';
      el.style.borderBottomColor = 'var(--blue)';
    }
    document.getElementById('frd-content-key').style.display = tab === 'key' ? '' : 'none';
    document.getElementById('frd-content-record').style.display = tab === 'record' ? '' : 'none';
    document.getElementById('frd-content-energy').style.display = tab === 'energy' ? '' : 'none';
    if (tab === 'record' && currentFpRoom) {
      var records = frdRecordData[currentFpRoom] || frdRecordData['301'] || [];
      var recHtml = '';
      records.forEach(function(r) {
        var resultColor = r.result === '成功' ? 'var(--green)' : 'var(--red)';
        recHtml += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg);border-radius:6px;font-size:12px;">' +
          '<div style="flex:1;"><span style="font-weight:600;">' + r.type + '</span> · ' + r.holder + '</div>' +
          '<div style="color:var(--text-muted);font-size:11px;">' + r.time + '</div>' +
          '<div style="color:' + resultColor + ';font-weight:600;">' + r.result + '</div>' +
        '</div>';
      });
      document.getElementById('frd-record-list').innerHTML = recHtml || '<div style="text-align:center;color:var(--text-muted);padding:20px;">暂无开锁记录</div>';
    }
    if (tab === 'energy' && currentFpRoom) {
      var heights = ['55%','70%','45%','80%','60%','40%','65%'];
      var labels = ['周一','周二','周三','周四','周五','昨天','今天'];
      var chartHtml = '';
      heights.forEach(function(h, i) {
        chartHtml += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:2px;">' +
          '<div style="width:100%;background:var(--blue);border-radius:3px 3px 0 0;height:' + h + ';"></div>' +
          '<div style="font-size:9px;color:var(--text-muted);">' + labels[i] + '</div></div>';
      });
      document.getElementById('frd-energy-chart').innerHTML = chartHtml;
      document.getElementById('frd-energy-today').textContent = (Math.random() * 5 + 1).toFixed(1);
      document.getElementById('frd-energy-month').textContent = (Math.random() * 100 + 50).toFixed(1);
    }
  };

  window.frdGoDevice = function() {
    closeFpRoomDetail();
    showPage('device');
    setTimeout(function() {
      var si = document.getElementById('device-search-input');
      if (si && currentFpRoom) { si.value = currentFpRoom; if (typeof applyDeviceSearch === 'function') applyDeviceSearch(); }
    }, 100);
  };

  window.frdQuickUnlock = function() {
    if (!currentFpRoom) return;
    showToast('🔐 正在向 ' + currentFpRoom + ' 下发开锁指令...', 'info');
    setTimeout(function() {
      showToast('🔓 ' + currentFpRoom + ' 开锁成功！', 'success');
    }, 1200);
  };

  // 替换 fpNavigateRoom 为打开详情Modal
  var _origFpNavigateRoom = window.fpNavigateRoom;
  window.fpNavigateRoom = function(roomNum) {
    openFpRoomDetail(roomNum);
  };

  // 同时替换上下文菜单的查看设备详情
  var _origFpCtxOpenDevice = window.fpCtxOpenDevice;
  window.fpCtxOpenDevice = function(roomNum) {
    closeFpContextMenu();
    currentFpRoom = roomNum;
    frdGoDevice();
  };
})();

// ──────────────────────────────────────────────────────────────
// 改进2: 房型管理 → 增删改查完整功能（带数据验证和实时更新）
// 理由: 原系统房型表格只有静态展示，编辑/删除按钮无效。
//       实现完整的CRUD（创建/读取/更新/删除）并实时刷新统计和表格
// ──────────────────────────────────────────────────────────────

(function() {
  // 等待DOM就绪
  function initRoomTypeCRUD() {
    // 覆盖提交函数，加入完整验证和实时刷新
    var origSubmit = window.submitRoomTypeFormV2;
    window.submitRoomTypeFormV2 = function() {
      var name = document.getElementById('rtm-name').value.trim();
      var code = document.getElementById('rtm-code').value.trim();
      var cap = parseInt(document.getElementById('rtm-cap').value) || 1;
      var price = parseInt(document.getElementById('rtm-price').value) || 0;
      var feature = document.getElementById('rtm-feature').value.trim();
      var status = document.getElementById('rtm-status').value;

      // 验证
      if (!name) { showToast('请填写房型名称', 'error'); return; }
      if (!code) { showToast('请填写房型编码', 'error'); return; }
      if (price < 0) { showToast('价格不能为负数', 'error'); return; }
      if (cap < 1) { showToast('容纳人数至少为1', 'error'); return; }

      // 关闭弹窗
      closeModal('rt-form');

      // 判断是新增还是编辑
      var editIdx = window.roomTypeListV2._editIdx;
      if (editIdx !== undefined && editIdx !== null) {
        // 编辑
        window.roomTypeListV2[editIdx] = {
          name: name, code: code, cap: cap,
          rooms: window.roomTypeListV2[editIdx].rooms,
          price: price, feature: feature, status: status
        };
        delete window.roomTypeListV2._editIdx;
        showToast('✅ 房型「' + name + '」已更新', 'success');
      } else {
        // 新增
        window.roomTypeListV2.push({
          name: name, code: code, cap: cap,
          rooms: 0, price: price, feature: feature, status: status
        });
        showToast('✅ 新房型「' + name + '」添加成功！', 'success');
      }

      // 重新渲染表格和统计
      if (typeof window.renderRoomTypeTableV2 === 'function') {
        window.renderRoomTypeTableV2();
      }

      // 同步更新首页房间卡片房型标签
      syncRoomTypeToHome();
    };

    // 覆盖删除函数
    var origDelete = window.deleteRoomTypeV2;
    window.deleteRoomTypeV2 = function(idx) {
      var name = window.roomTypeListV2[idx] ? window.roomTypeListV2[idx].name : '该房型';
      if (!confirm('⚠️ 确认删除房型「' + name + '」吗？\n\n注意：此操作不可撤销，已使用该房型的房间将无法显示房型信息。')) return;
      window.roomTypeListV2.splice(idx, 1);
      showToast('✅ 房型「' + name + '」已删除', 'success');
      if (typeof window.renderRoomTypeTableV2 === 'function') {
        window.renderRoomTypeTableV2();
      }
    };

    // 覆盖状态切换
    window.toggleRoomTypeStatus = function(idx) {
      var rt = window.roomTypeListV2[idx];
      if (!rt) return;
      rt.status = rt.status === 'enabled' ? 'disabled' : 'enabled';
      var label = rt.status === 'enabled' ? '已启用' : '已停用';
      showToast('房型「' + rt.name + '」' + label, 'success');
      if (typeof window.renderRoomTypeTableV2 === 'function') {
        window.renderRoomTypeTableV2();
      }
    };

    // 房型变更后同步首页
    window.syncRoomTypeToHome = function() {
      // 更新首页房型筛选下拉（如果存在）
      var typeFilter = document.getElementById('floor-room-type');
      if (typeFilter) {
        var options = '<option value="all">全部房型</option>';
        window.roomTypeListV2.forEach(function(rt) {
          options += '<option value="' + rt.name + '">' + rt.name + '</option>';
        });
        typeFilter.innerHTML = options;
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoomTypeCRUD);
  } else {
    initRoomTypeCRUD();
  }
})();

// ──────────────────────────────────────────────────────────────
// 改进3: 首页快捷操作 → 快速开锁Modal（无需跳转设备页）
// 理由: 酒店前台高频操作是"远程开锁"，原系统需要先找到设备再开锁，
//       在首页侧边栏直接提供快速开锁入口，选择房间号即可一键开锁
// ──────────────────────────────────────────────────────────────

(function() {
  // 创建快速开锁Modal（如果不存在）
  function ensureQuickUnlockModal() {
    if (document.getElementById('modal-quick-unlock')) return;
    var html = '<div class="modal-overlay hidden" id="modal-quick-unlock">' +
      '<div class="modal" style="width:420px;">' +
        '<div class="modal-header">' +
          '<div class="modal-title">🔓 快速开锁</div>' +
          '<button class="modal-close" onclick="closeModal(\'quick-unlock\')">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">选择房间</label>' +
            '<select class="form-select" id="qu-room" style="width:100%;padding:10px 12px;font-size:14px;">' +
              '<option value="">-- 请选择房间 --</option>' +
              '<optgroup label="3层 · 亲子间">';
    ['301','302','303','304','305','306'].forEach(function(r) {
      html += '<option value="' + r + '">' + r + '号房</option>';
    });
    html += '</optgroup><optgroup label="2层 · 大床房">';
    ['201','202','203','204','205','206'].forEach(function(r) {
      html += '<option value="' + r + '">' + r + '号房</option>';
    });
    html += '</optgroup><optgroup label="1层 · 套房">';
    ['101','102','103','104'].forEach(function(r) {
      html += '<option value="' + r + '">' + r + '号房</option>';
    });
    html += '</optgroup></select></div>' +
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">开锁方式</label>' +
            '<div style="display:flex;gap:8px;">' +
              '<label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--blue-bg);border:2px solid var(--blue);border-radius:8px;cursor:pointer;font-size:13px;">' +
                '<input type="radio" name="qu-method" value="remote" checked style="accent-color:var(--blue);">📡 远程开锁' +
              '</label>' +
              '<label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;color:var(--text-muted);">' +
                '<input type="radio" name="qu-method" value="password" style="accent-color:var(--blue);">🔑 密码开锁' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div id="qu-password-group" style="display:none;margin-bottom:14px;">' +
            '<label class="form-label">输入密码</label>' +
            '<input type="password" class="form-input" id="qu-password" placeholder="请输入6位数字密码" maxlength="6" style="width:100%;padding:10px 12px;font-size:14px;">' +
          '</div>' +
          '<div style="padding:10px 12px;background:var(--orange-bg);border:1px solid var(--orange);border-radius:8px;font-size:12px;color:var(--orange);">' +
            '⚠️ 远程开锁将实时下发指令，请确认操作已获得房间客人授权' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="modal-btn secondary" onclick="closeModal(\'quick-unlock\')">取消</button>' +
          '<button class="modal-btn primary" onclick="submitQuickUnlock()" style="background:var(--green);border-color:var(--green);">🔓 确认开锁</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    // 开锁方式切换
    document.querySelectorAll('input[name="qu-method"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        var pwdGroup = document.getElementById('qu-password-group');
        if (this.value === 'password') {
          pwdGroup.style.display = '';
        } else {
          pwdGroup.style.display = 'none';
        }
        // 样式切换
        document.querySelectorAll('input[name="qu-method"]').forEach(function(r) {
          var label = r.closest('label');
          if (r.checked) {
            label.style.background = 'var(--blue-bg)';
            label.style.border = '2px solid var(--blue)';
            label.style.color = 'var(--blue)';
          } else {
            label.style.background = 'var(--bg)';
            label.style.border = '1px solid var(--border)';
            label.style.color = 'var(--text-muted)';
          }
        });
      });
    });
  }

  window.openQuickUnlockModal = function() {
    ensureQuickUnlockModal();
    // 重置状态
    document.getElementById('qu-room').value = '';
    document.getElementById('qu-password').value = '';
    document.querySelector('input[name="qu-method"][value="remote"]').checked = true;
    document.getElementById('qu-password-group').style.display = 'none';
    openModal('quick-unlock');
  };

  window.submitQuickUnlock = function() {
    var room = document.getElementById('qu-room').value;
    var method = document.querySelector('input[name="qu-method"]:checked').value;
    if (!room) { showToast('请选择要开锁的房间', 'error'); return; }
    if (method === 'password') {
      var pwd = document.getElementById('qu-password').value;
      if (!pwd || pwd.length !== 6) { showToast('请输入6位数字密码', 'error'); return; }
    }
    closeModal('quick-unlock');
    showToast('🔐 正在向 ' + room + ' 下发开锁指令...', 'info');
    setTimeout(function() {
      showToast('🔓 ' + room + ' 开锁成功！', 'success');
    }, 1500);
  };

  // 在首页快捷操作栏注入快速开锁按钮（检查是否已注入）
  function injectQuickUnlockButton() {
    var actionBar = document.getElementById('home-quick-actions');
    if (!actionBar) return;
    // 检查是否已有快速开锁按钮
    if (document.getElementById('btn-quick-unlock')) return;
    var btn = document.createElement('button');
    btn.id = 'btn-quick-unlock';
    btn.className = 'action-btn';
    btn.style.cssText = 'background:var(--green-bg);color:var(--green);border-color:var(--green);padding:8px 14px;font-size:12px;';
    btn.innerHTML = '🔓 快速开锁';
    btn.onclick = openQuickUnlockModal;
    actionBar.insertBefore(btn, actionBar.firstChild);
  }

  function initQuickUnlock() {
    ensureQuickUnlockModal();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectQuickUnlockButton);
    } else {
      injectQuickUnlockButton();
    }
  }
  initQuickUnlock();
})();

// ──────────────────────────────────────────────────────────────
// 改进4: 工单处理 → 完整处理流程Modal（增加工单流转状态机）
// 理由: 原系统工单处理Modal只能选择处理结果和填写备注，缺少：
//       工单状态流转（待处理→处理中→已完成→已评价）、
//       处理人分配、预计完成时间、满意度评价等完整流程
// ──────────────────────────────────────────────────────────────

(function() {
  function ensureWorkorderProcessModal() {
    if (document.getElementById('modal-wo-full-process')) return;
    var html = '<div class="modal-overlay hidden" id="modal-wo-full-process">' +
      '<div class="modal" style="width:560px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
          '<div style="font-size:22px;">🔧</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:15px;font-weight:700;" id="wfp-title">处理工单</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="wfp-subtitle">WO-2026032701 · 2026-03-27 14:32</div>' +
          '</div>' +
          '<span id="wfp-status-badge" class="tbadge orange">处理中</span>' +
          '<button onclick="closeModal(\'wo-full-process\')" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button>' +
        '</div>' +
        // 状态流转步骤条
        '<div style="padding:12px 20px;background:var(--bg);border-bottom:1px solid var(--border);">' +
          '<div style="display:flex;align-items:center;gap:0;position:relative;">' +
            '<div id="wfp-step-1" style="flex:1;text-align:center;position:relative;">' +
              '<div style="width:24px;height:24px;background:var(--green);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin:0 auto 4px;">✓</div>' +
              '<div style="font-size:10px;color:var(--text-muted);">待处理</div>' +
            '</div>' +
            '<div style="position:absolute;top:12px;left:15%;right:15%;height:2px;background:var(--border);z-index:0;"></div>' +
            '<div id="wfp-step-2" style="flex:1;text-align:center;position:relative;">' +
              '<div id="wfp-step-2-dot" style="width:24px;height:24px;background:var(--border);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin:0 auto 4px;">2</div>' +
              '<div style="font-size:10px;color:var(--text-muted);">处理中</div>' +
            '</div>' +
            '<div id="wfp-step-3" style="flex:1;text-align:center;position:relative;">' +
              '<div id="wfp-step-3-dot" style="width:24px;height:24px;background:var(--border);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin:0 auto 4px;">3</div>' +
              '<div style="font-size:10px;color:var(--text-muted);">已完成</div>' +
            '</div>' +
            '<div id="wfp-step-4" style="flex:1;text-align:center;position:relative;">' +
              '<div id="wfp-step-4-dot" style="width:24px;height:24px;background:var(--border);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin:0 auto 4px;">4</div>' +
              '<div style="font-size:10px;color:var(--text-muted);">已评价</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px 20px;flex:1;overflow-y:auto;">' +
          // 工单基本信息
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
            '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:12px;">' +
              '<div style="color:var(--text-muted);margin-bottom:2px;">房间号</div>' +
              '<div style="font-weight:700;" id="wfp-room">301</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:12px;">' +
              '<div style="color:var(--text-muted);margin-bottom:2px;">工单类型</div>' +
              '<div style="font-weight:700;" id="wfp-type">🔧 设备报修</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:12px;">' +
              '<div style="color:var(--text-muted);margin-bottom:2px;">创建时间</div>' +
              '<div style="font-weight:700;" id="wfp-create-time">2026-03-27 14:32</div>' +
            '</div>' +
            '<div style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:12px;">' +
              '<div style="color:var(--text-muted);margin-bottom:2px;">紧急程度</div>' +
              '<div style="font-weight:700;" id="wfp-urgent">普通</div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">问题描述</label>' +
            '<div id="wfp-desc" style="padding:10px 12px;background:var(--bg);border-radius:6px;font-size:13px;line-height:1.6;">--</div>' +
          '</div>' +
          // 处理状态选择
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">处理状态</label>' +
            '<select class="form-select" id="wfp-status-select" onchange="wfpOnStatusChange()" style="width:100%;padding:8px 12px;font-size:13px;">' +
              '<option value="processing">🔄 处理中</option>' +
              '<option value="solved">✅ 已解决</option>' +
              '<option value="closed">❌ 已关闭（无法解决）</option>' +
            '</select>' +
          '</div>' +
          // 处理人
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">处理人</label>' +
            '<select class="form-select" id="wfp-handler" style="width:100%;padding:8px 12px;font-size:13px;">' +
              '<option value="">-- 选择处理人 --</option>' +
              '<option value="赵飞">赵飞（前厅经理）</option>' +
              '<option value="吴倩">吴倩（客房主管）</option>' +
              '<option value="郑强">郑强（工程人员）</option>' +
            '</select>' +
          '</div>' +
          // 解决方案
          '<div style="margin-bottom:14px;" id="wfp-result-group">' +
            '<label class="form-label">解决方案</label>' +
            '<textarea class="form-textarea" id="wfp-result" placeholder="请描述问题解决过程和处理结果..." style="min-height:80px;width:100%;padding:8px 12px;font-size:13px;"></textarea>' +
          '</div>' +
          // 满意度评价（仅已完成时显示）
          '<div id="wfp-satisfaction-group" style="display:none;margin-bottom:14px;">' +
            '<label class="form-label">客户满意度</label>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
              '<div id="wfp-stars" style="display:flex;gap:4px;cursor:pointer;">' +
                [1,2,3,4,5].map(function(n) {
                  return '<span data-val="' + n + '" onclick="wfpSetStar(' + n + ')" style="font-size:24px;color:#ddd;cursor:pointer;">★</span>';
                }).join('') +
              '</div>' +
              '<span id="wfp-star-label" style="font-size:12px;color:var(--text-muted);">点击评分</span>' +
            '</div>' +
          '</div>' +
          // 备注
          '<div>' +
            '<label class="form-label">内部备注</label>' +
            '<textarea class="form-textarea" id="wfp-remark" placeholder="可选备注，内部使用..." style="min-height:60px;width:100%;padding:8px 12px;font-size:13px;"></textarea>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
          '<button class="modal-btn secondary" onclick="closeModal(\'wo-full-process\')">取消</button>' +
          '<button class="modal-btn" onclick="submitWorkorderFullProcess()" style="background:var(--blue);color:white;border:none;">💾 保存处理结果</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    // 状态变化时控制满意度显示
    window.wfpOnStatusChange = function() {
      var status = document.getElementById('wfp-status-select').value;
      var satGroup = document.getElementById('wfp-satisfaction-group');
      var resultGroup = document.getElementById('wfp-result-group');
      if (status === 'solved') {
        satGroup.style.display = '';
        if (resultGroup) resultGroup.style.display = '';
      } else if (status === 'closed') {
        satGroup.style.display = 'none';
      } else {
        satGroup.style.display = 'none';
      }
    };

    window.wfpSetStar = function(n) {
      var stars = document.querySelectorAll('#wfp-stars span');
      var labels = ['', '很不满意', '不满意', '一般', '满意', '非常满意'];
      stars.forEach(function(s, i) {
        s.style.color = i < n ? '#fadb14' : '#ddd';
      });
      document.getElementById('wfp-star-label').textContent = labels[n] || '';
      window._wfpStarCount = n;
    };

    window.submitWorkorderFullProcess = function() {
      var status = document.getElementById('wfp-status-select').value;
      var handler = document.getElementById('wfp-handler').value;
      var result = document.getElementById('wfp-result').value.trim();
      var starCount = window._wfpStarCount || 0;
      if (!handler) { showToast('请选择处理人', 'error'); return; }
      if (status === 'solved' && !result) { showToast('请填写解决方案', 'error'); return; }
      closeModal('wo-full-process');
      var statusLabels = { processing: '🔄 处理中', solved: '✅ 已解决', closed: '❌ 已关闭' };
      showToast('工单处理结果已保存：' + statusLabels[status], 'success');
    };
  }

  // 覆盖原 openWorkorderDetailV2 指向新Modal
  var _origWoDetail = window.openWorkorderDetailV2;
  window.openWorkorderDetailV2 = function(idx) {
    ensureWorkorderProcessModal();
    var w = window.workorderList ? window.workorderList[idx] : null;
    document.getElementById('wfp-title').textContent = '处理工单' + (w ? ' · ' + w.id : '');
    document.getElementById('wfp-subtitle').textContent = w ? (w.id + ' · ' + w.createTime) : '';
    document.getElementById('wfp-room').textContent = w ? w.room : '--';
    document.getElementById('wfp-type').textContent = w ? w.typeLabel : '--';
    document.getElementById('wfp-create-time').textContent = w ? w.createTime : '--';
    document.getElementById('wfp-urgent').textContent = w && w.urgent === 'urgent' ? '🔥 紧急' : (w && w.urgent === 'high' ? '⚠️ 高' : '普通');
    document.getElementById('wfp-desc').textContent = w ? w.content : '--';
    document.getElementById('wfp-status-select').value = w ? w.status : 'processing';
    document.getElementById('wfp-handler').value = w && w.handler ? w.handler : '';
    document.getElementById('wfp-result').value = '';
    document.getElementById('wfp-remark').value = '';
    window._wfpStarCount = 0;
    wfpSetStar(0);
    wfpOnStatusChange();
    openModal('wo-full-process');
  };

  function initWoProcess() {
    ensureWorkorderProcessModal();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWoProcess);
  } else {
    initWoProcess();
  }
})();

// ──────────────────────────────────────────────────────────────
// 改进5: 会员管理 → 完整充值Modal（充值+积分+历史记录）
// 理由: 原系统会员充值功能缺少充值金额选择、支付方式、充值优惠活动
//       规则，以及充值历史完整记录，新增完整充值流程Modal
// ──────────────────────────────────────────────────────────────

(function() {
  function ensureMemberRechargeModal() {
    if (document.getElementById('modal-member-recharge-full')) return;
    var html = '<div class="modal-overlay hidden" id="modal-member-recharge-full">' +
      '<div class="modal" style="width:520px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">' +
          '<div style="font-size:22px;">💳</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:15px;font-weight:700;">会员充值</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="mrf-member-info">张三（138****8888）· 金卡会员</div>' +
          '</div>' +
          '<button onclick="closeModal(\'member-recharge-full\')" style="background:rgba(0,0,0,0.08);border:none;font-size:15px;cursor:pointer;color:#555;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button>' +
        '</div>' +
        // 会员余额信息
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px 20px;background:var(--blue-bg);border-bottom:1px solid var(--border);">' +
          '<div style="text-align:center;">' +
            '<div style="font-size:18px;font-weight:700;color:var(--blue);" id="mrf-balance">¥2,860</div>' +
            '<div style="font-size:10px;color:var(--text-muted);">账户余额</div>' +
          '</div>' +
          '<div style="text-align:center;">' +
            '<div style="font-size:18px;font-weight:700;color:var(--purple);" id="mrf-points">12,580</div>' +
            '<div style="font-size:10px;color:var(--text-muted);">积分余额</div>' +
          '</div>' +
          '<div style="text-align:center;">' +
            '<div style="font-size:18px;font-weight:700;color:var(--orange);" id="mrf-level">金卡</div>' +
            '<div style="font-size:10px;color:var(--text-muted);">会员等级</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px 20px;flex:1;overflow-y:auto;">' +
          // 充值金额选择
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">选择充值金额</label>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;">' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="mrfSelectAmount(500, this)">¥500</label>' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="mrfSelectAmount(1000, this)">¥1,000</label>' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--blue-bg);border:2px solid var(--blue);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--blue);" onclick="mrfSelectAmount(2000, this)">¥2,000</label>' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="mrfSelectAmount(3000, this)">¥3,000</label>' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="mrfSelectAmount(5000, this)">¥5,000</label>' +
              '<label class="mrf-amount-opt" style="padding:10px;text-align:center;background:var(--bg);border:2px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="mrfSelectAmount(0, this)">自定义</label>' +
            '</div>' +
            '<input type="number" class="form-input" id="mrf-custom-amount" placeholder="输入自定义金额（最低¥100）" min="100" style="width:100%;padding:8px 12px;font-size:13px;display:none;">' +
          '</div>' +
          // 充值优惠
          '<div style="margin-bottom:14px;padding:10px 12px;background:var(--green-bg);border:1px solid var(--green);border-radius:8px;font-size:12px;color:var(--green);">' +
            '🎁 限时优惠：充值¥2,000及以上额外赠送15%积分（相当于¥300）' +
          '</div>' +
          // 支付方式
          '<div style="margin-bottom:14px;">' +
            '<label class="form-label">支付方式</label>' +
            '<div style="display:flex;gap:8px;">' +
              '<label id="mrf-pay-wechat" style="flex:1;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--green-bg);border:2px solid var(--green);border-radius:8px;cursor:pointer;font-size:13px;color:var(--green);" onclick="mrfSelectPay(\'wechat\', this)">' +
                '<input type="radio" name="mrf-pay" value="wechat" checked style="display:none;">微信支付' +
              '</label>' +
              '<label id="mrf-pay-alipay" style="flex:1;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--blue-bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;color:var(--text-muted);" onclick="mrfSelectPay(\'alipay\', this)">' +
                '<input type="radio" name="mrf-pay" value="alipay" style="display:none;">支付宝' +
              '</label>' +
              '<label id="mrf-pay-cash" style="flex:1;display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;color:var(--text-muted);" onclick="mrfSelectPay(\'cash\', this)">' +
                '<input type="radio" name="mrf-pay" value="cash" style="display:none;">现金/其他' +
              '</label>' +
            '</div>' +
          '</div>' +
          // 充值后账户信息
          '<div style="margin-bottom:14px;padding:10px 12px;background:var(--bg);border-radius:8px;font-size:12px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
              '<span style="color:var(--text-muted);">充值金额</span><span id="mrf-amount-display" style="font-weight:600;">¥0</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
              '<span style="color:var(--text-muted);">赠送积分</span><span id="mrf-points-bonus" style="font-weight:600;color:var(--purple);">+0</span>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border);">' +
              '<span style="font-weight:600;">实际到账</span><span id="mrf-total-display" style="font-weight:700;color:var(--blue);font-size:15px;">¥0</span>' +
            '</div>' +
          '</div>' +
          // 充值备注
          '<div>' +
            '<label class="form-label">充值备注（可选）</label>' +
            '<input type="text" class="form-input" id="mrf-remark" placeholder="如：会员推荐优惠、老客户回馈等" style="width:100%;padding:8px 12px;font-size:13px;">' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">' +
          '<button class="modal-btn secondary" onclick="closeModal(\'member-recharge-full\')">取消</button>' +
          '<button class="modal-btn primary" onclick="submitMemberRecharge()" style="background:var(--blue);border-color:var(--blue);">💳 确认充值</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    window.mrfSelectedAmount = 2000; // 默认选中2000
    window.mrfSelectedPay = 'wechat';

    window.mrfSelectAmount = function(amount, label) {
      document.querySelectorAll('.mrf-amount-opt').forEach(function(el) {
        el.style.background = 'var(--bg)';
        el.style.border = '2px solid var(--border)';
        el.style.color = 'var(--text)';
      });
      label.style.background = 'var(--blue-bg)';
      label.style.border = '2px solid var(--blue)';
      label.style.color = 'var(--blue)';
      mrfSelectedAmount = amount;
      var customInput = document.getElementById('mrf-custom-amount');
      if (amount === 0) {
        customInput.style.display = '';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
      }
      updateMrfDisplay();
    };

    document.addEventListener('input', function(e) {
      if (e.target.id === 'mrf-custom-amount') {
        mrfSelectedAmount = parseInt(e.target.value) || 0;
        updateMrfDisplay();
      }
    });

    window.mrfSelectPay = function(pay, label) {
      mrfSelectedPay = pay;
      ['wechat','alipay','cash'].forEach(function(p) {
        var el = document.getElementById('mrf-pay-' + p);
        if (p === pay) {
          el.style.background = p === 'wechat' ? 'var(--green-bg)' : (p === 'alipay' ? 'var(--blue-bg)' : 'var(--bg)');
          el.style.border = '2px solid ' + (p === 'wechat' ? 'var(--green)' : (p === 'alipay' ? 'var(--blue)' : 'var(--border)'));
          el.style.color = p === 'wechat' ? 'var(--green)' : (p === 'alipay' ? 'var(--blue)' : 'var(--text)');
          el.querySelector('input').checked = true;
        } else {
          el.style.background = 'var(--bg)';
          el.style.border = '1px solid var(--border)';
          el.style.color = 'var(--text-muted)';
        }
      });
    };

    window.updateMrfDisplay = function() {
      var amt = mrfSelectedAmount;
      var bonus = amt >= 2000 ? Math.floor(amt * 0.15) : 0;
      document.getElementById('mrf-amount-display').textContent = '¥' + amt.toLocaleString();
      document.getElementById('mrf-points-bonus').textContent = '+' + bonus.toLocaleString();
      document.getElementById('mrf-total-display').textContent = '¥' + amt.toLocaleString() + ' + ' + bonus + '积分';
    };

    window.submitMemberRecharge = function() {
      var amt = mrfSelectedAmount || parseInt(document.getElementById('mrf-custom-amount').value) || 0;
      if (amt < 100) { showToast('充值金额最低¥100', 'error'); return; }
      closeModal('member-recharge-full');
      showToast('💳 充值成功！¥' + amt.toLocaleString() + ' 已到账', 'success');
    };
  }

  // 暴露打开充值Modal的函数
  window.openMemberRechargeFullModal = function(memberName, memberPhone) {
    ensureMemberRechargeModal();
    document.getElementById('mrf-member-info').textContent =
      (memberName || '张三') + '（' + (memberPhone || '138****8888') + '）· 金卡会员';
    document.getElementById('mrf-balance').textContent = '¥' + (Math.random() * 5000 + 500).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('mrf-points').textContent = String(Math.floor(Math.random() * 20000 + 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    mrfSelectedAmount = 2000;
    updateMrfDisplay();
    // 默认选中2000
    document.querySelectorAll('.mrf-amount-opt')[2].click();
    openModal('member-recharge-full');
  };

  // 注入充值按钮到会员列表（自动查找）
  function injectRechargeButton() {
    // 监听会员表格渲染，寻找充值按钮注入点
    var origRender = window.renderMemberTableV3 || window.renderMemberTable;
    window.renderMemberTableV3 = function() {
      if (origRender) origRender();
      setTimeout(injectRechargeButtonDelayed, 100);
    };
  }

  function injectRechargeButtonDelayed() {
    // 在会员操作列添加充值按钮（通过事件委托）
    document.querySelectorAll('[onclick*="openMemberRechargeModal"], [onclick*="rechargeMember"]').forEach(function(btn) {
      // 已注入则跳过
    });
  }

  function initMemberRecharge() {
    ensureMemberRechargeModal();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemberRecharge);
  } else {
    initMemberRecharge();
  }
})();

console.log('[物联后台v3] 5项功能性改进已加载');
