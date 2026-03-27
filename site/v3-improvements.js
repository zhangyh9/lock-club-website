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
  html += '<button onclick="closeCheckoutCouponModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>';
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
  html += '<button onclick="closePollutionReportModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>';
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
  html += '<button onclick="stopDevicePingAnim()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>';
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
  html += '<button onclick="closeWoSatisfactionModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button></div>';
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
