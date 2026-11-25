'use strict';
// v0.6 演示控制层：仅浏览器内合成状态，不发起网络请求或真实资金/投资指令。
function outputDirections(){
 const moved=s.transfer?.status==='credited',matched=s.matchStatus==='executed';
 return '<div class="output-directions"><article><span>01 / 备款方向</span><h2>把缺口变成可追踪的调拨动作</h2><p>预测缺口 → 自有资金来源校验 → 模拟审批 → 渠道接口请求 → 到账回执 → 重算覆盖率。</p><strong>'+(moved?'已取得模拟回执':'等待模拟操作')+'</strong><button class="btn primary" data-action="goto-advice">进入备款运营 →</button></article><article><span>02 / 经营价值方向</span><h2>把省钱过程给评委看见</h2><p>先匹配同币种自有资金、减少中间换汇；剩余资金仅在独立资格审核后进入现金管理模拟。</p><strong>'+(matched?'已完成模拟匹配':'等待模拟操作')+'</strong><button class="btn" data-action="goto-value">进入经营价值 →</button></article></div>';
}
function fundingOpsPanel(){
 const row=s.result.rows.find(x=>x.pool==='B-HKD'&&x.slot===2);
 const transfer=s.transfer,credited=transfer?.status==='credited';
 const gap=row?.gap||0,amountToMove=transfer?.amount||Math.min(gap,100000);
 const initialGap=credited?transfer.gapAtCreation:gap;
 const due=row?.spent||180000,available=row?.avail||120000;
 const beforePct=Math.min(100,Math.round((Math.max(0,due-initialGap)/due)*100));
 const afterPct=Math.min(100,Math.round((Math.max(0,due-gap)/due)*100));
 const stage=transfer?.status||'idle';
 const step=(n,label,active)=>'<div class="ops-step '+(active?'done':'')+'"><b>'+n+'</b><span>'+label+'</span></div>';
 const action=stage==='idle'&&gap>0?'<button class="btn primary" data-action="transfer-draft">生成调拨草稿 →</button>':stage==='draft'?'<button class="btn primary" data-action="transfer-approve">模拟财资审批 →</button>':stage==='approved'?'<button class="btn primary" data-action="transfer-send">模拟自动调拨 · 调用渠道接口 →</button>':stage==='sent'?'<button class="btn primary" data-action="transfer-receipt">模拟渠道到账回执 →</button>':credited?'<button class="btn" data-action="rerun">重新分析全部资金格</button>':'<span class="ops-muted">当前无该示例缺口，或需先重新分析。</span>';
 const statusText={idle:'未生成调拨单',draft:'草稿已生成，待财资审批',approved:'演示审批通过，尚未向渠道提交',sent:'模拟接口已受理，资金尚未到账',credited:'模拟到账回执已入账，建议已重算'}[stage];
 return '<section class="panel ops-panel" id="fundingOps"><div class="panel-head"><div><p class="eyebrow">备款执行链 · 模拟待办</p><h2 class="panel-title">今日16:00 香港下发：让资金真正到位</h2><p class="panel-sub">演示通道 B / HKD；独立的虚构公司自有HKD备款账户有100,000 HKD可调，非客户备付金；是否可跨账户调拨仍需真实核验。</p></div>'+chip('SIM ONLY','amber')+'</div><div class="ops-before-after"><div><span>操作前 · 16:00缺口</span><strong>'+amount(initialGap,'HKD')+'</strong><div class="ops-meter"><i style="width:'+beforePct+'%"></i></div><small>目标资金覆盖 '+beforePct+'% · 可能影响该批次及时处理</small></div><b>→</b><div><span>取得回执后 · 16:00缺口</span><strong>'+amount(gap,'HKD')+'</strong><div class="ops-meter good"><i style="width:'+afterPct+'%"></i></div><small>目标资金覆盖 '+afterPct+'% · 仅说明资金条件，不保证最终到账</small></div></div><div class="ops-step-row">'+step('1','识别缺口',true)+step('2','生成草稿',stage!=='idle')+step('3','人工审批',['approved','sent','credited'].includes(stage))+step('4','模拟接口',['sent','credited'].includes(stage))+step('5','到账回执',credited)+'</div><div class="ops-action"><div><b>'+statusText+'</b><small>建议调拨 '+amount(amountToMove,'HKD')+'；资金源上限100,000 HKD。若录入HKD 500,000新增下发，只能先覆盖其中100,000，其余缺口继续预警。</small></div>'+action+'</div>'+(stage==='sent'?'<div class="decision-note warning">接口“受理”不是到账；若回执超时应进入待查，不可重复发送同一幂等单号，也不可提前计入渠道可用。</div>':'')+(transfer?'<div class="ops-receipt"><b>模拟操作凭证</b><span>单号 '+transfer.id+' · 资金源 OWN-HKD-01 → B-HKD · '+amount(transfer.amount,'HKD')+' · 状态 '+statusText+'</span><small>此编号只用于当前浏览器演示；无真实渠道请求、审批或资金划转。</small></div>':'')+'<p class="guardrail">交易成功率和客户实际到账时间并未被测量。这里可证明的是目标时点的资金覆盖率变化；正式参赛需再以真实可用数据或获批替代方案验证交易成功率、失败归因和到账时效。</p></section>';
}
function valueOpsPanel(){
 const m=valueMath(),eligible=s.valueCase==='eligible';
 const match=s.matchStatus,cash=s.cashStatus;
 const matchAction=match==='idle'?'<button class="btn primary" data-action="match-propose">AI提出同币种匹配方案</button>':match==='proposed'?'<button class="btn primary" data-action="match-approve">模拟财资审批</button>':match==='approved'?'<button class="btn primary" data-action="match-execute">模拟执行匹配与核销</button>':'<span class="ops-done">✓ 已形成模拟匹配回执</span>';
 const cashAction=cash==='idle'?'<button class="btn primary" data-action="cash-screen">筛选可用现金管理产品</button>':cash==='screened'?'<button class="btn primary" data-action="cash-approve">模拟财资与合规审批</button>':cash==='approved'?'<button class="btn primary" data-action="cash-subscribe">模拟产品接口申购</button>':cash==='subscribed'?'<button class="btn primary" data-action="cash-redeem">模拟24小时赎回回执</button>':'<span class="ops-done">✓ 已生成模拟赎回回执</span>';
 const saved=eligible&&match==='executed'?m.fxSaving:0;
 return '<div class="section-bar"><div><h2>经营价值操作台</h2><p>两个独立动作：减少不必要的换汇；合资格自有余额模拟现金管理。每次操作都有前后对照。</p></div>'+chip('全部为合成反事实','amber')+'</div><section class="panel ops-panel"><p class="eyebrow">ACTION 01 / 同币种匹配</p><h2 class="panel-title">点击后，看两次换汇成本如何被消去</h2><div class="ops-cost-bars"><div><span>孤立路径：卖出USD + 买回USD</span><div><i style="width:100%"></i></div><b>'+usd(m.baseline)+'</b></div><div><span>匹配路径：仅假设调拨/运营成本</span><div class="saving"><i style="width:4%"></i></div><b>'+usd(m.optimized)+'</b></div></div><div class="ops-action"><div><b>本轮模拟节省：<em>'+usd(saved)+'</em></b><small>计算：'+usd(m.baseline)+' 原路径假设成本 − '+usd(m.optimized)+' 优化路径假设成本 = '+usd(m.fxSaving)+'。只有执行模拟匹配后才把此值记入“本轮模拟节省”；不代表公司实际已省。</small></div>'+matchAction+'</div><div class="ops-mini-status">状态：'+({idle:'待提出方案',proposed:'方案已生成，待审批',approved:'演示审批通过，待模拟执行',executed:'模拟核销回执已生成'}[match])+'。原路径是否真实存在、账户主体与资金权属、通道结算规则及真实报价，正式落地前均须取证。</div></section><section class="panel ops-panel"><p class="eyebrow">ACTION 02 / 自有闲钱管理</p><h2 class="panel-title">剩余 '+usd(m.idle)+' USD：筛选、审批、模拟申购与赎回</h2><div class="ops-products"><div class="selected"><b>演示产品 A · 24小时可赎回</b><small>虚构现金管理工具；2%仅为计算假设，非收益承诺。赎回到账与本金风险待核验。</small></div><div class="disabled"><b>演示产品 B · 7天锁定</b><small>不匹配24小时资金需求，Agent排除。</small></div></div><div class="ops-action"><div><b>模拟申购金额 '+usd(m.idle)+' · 24小时收益演算 <em>'+(cash==='redeemed'?usd(m.idlePotential,2):usd(0,2))+'</em></b><small>筛选前须确认同一主体自有资金、无客户备付金、无受限余额、无短期支付义务、产品许可和可赎回时点。申购不是收益，只有模拟赎回回执后展示演算值。</small></div>'+cashAction+'</div><div class="ops-mini-status">状态：'+({idle:'尚未筛选',screened:'候选匹配，待独立审批',approved:'演示审批通过，待模拟产品接口',subscribed:'接口模拟受理，未赎回、收益未实现',redeemed:'模拟赎回回执已生成；收益仍为假设值'}[cash])+'。</div></section><div class="decision-note warning"><b>不可越过的边界：</b>未入账资金、客户备付金和受限资金不能进入匹配或理财。真实理财产品资质、资金来源、账户用途、币种、风险、流动性与审批规则必须由财资、法务/合规和渠道确认；本页面不发送任何真实指令。</div>';
}
function opsClick(action){
 const eligible=s.valueCase==='eligible';
 if(action==='transfer-draft'){
  if(s.dirty)return toast('请先重新分析最新业务与渠道数据');
  if(s.transfer)return toast('本轮已有调拨单');
  const row=s.result.rows.find(x=>x.pool==='B-HKD'&&x.slot===2);if(!row?.gap)return toast('本轮没有该时点缺口');
  s.transfer={id:'MOCK-TR-'+String(s.version).padStart(3,'0'),pool:'B-HKD',slot:2,amount:Math.min(row.gap,100000),gapAtCreation:row.gap,status:'draft',version:s.version};log('生成合成自有HKD调拨草稿 '+s.transfer.id);render();return;
 }
 if(action==='transfer-approve'){
  if(s.dirty||s.transfer?.status!=='draft'||s.transfer.version!==s.version)return toast('草稿已过期，请重新分析');
  s.transfer.status='approved';log('模拟财资审批通过 '+s.transfer.id);render();return;
 }
 if(action==='transfer-send'){
  if(s.dirty||s.transfer?.status!=='approved')return toast('须先取得当前版本模拟审批');
  s.transfer.status='sent';log('虚构渠道接口受理 '+s.transfer.id+'；尚未入账');render();return;
 }
 if(action==='transfer-receipt'){
  if(s.transfer?.status!=='sent')return toast('先提交模拟接口请求');
  s.transfer.status='credited';log('取得虚构渠道到账回执 '+s.transfer.id+'，从16:00前纳入B-HKD供给');rerun();return;
 }
 if(action==='match-propose'){
  if(!eligible)return toast('资金资格闸口未通过，不能提出匹配执行方案');
  s.matchStatus='proposed';log('生成同池同币种匹配的合成方案');render();return;
 }
 if(action==='match-approve'){
  if(!eligible||s.matchStatus!=='proposed')return toast('先生成合资格方案');
  s.matchStatus='approved';log('演示财资复核通过同币种匹配');render();return;
 }
 if(action==='match-execute'){
  if(!eligible||s.matchStatus!=='approved')return toast('须先完成演示审批');
  s.matchStatus='executed';log('模拟同币种匹配核销，假设净避免成本 USD 2,880');render();return;
 }
 if(action==='cash-screen'){
  if(!eligible||s.fxPairStatus!=='executed')return toast('先在模拟待办完成货币对轧差，并确认自有剩余资金');
  s.cashStatus='screened';log('演示筛选24小时可赎回候选，排除7天锁定产品');render();return;
 }
 if(action==='cash-approve'){
  if(!eligible||s.cashStatus!=='screened')return toast('先完成资格筛选');
  s.cashStatus='approved';log('演示财资与合规批准现金管理候选');render();return;
 }
 if(action==='cash-subscribe'){
  if(!eligible||s.cashStatus!=='approved')return toast('须先完成演示审批');
  s.cashStatus='subscribed';log('虚构产品接口受理申购 USD 200,000；无真实交易');render();return;
 }
 if(action==='cash-redeem'){
  if(!eligible||s.cashStatus!=='subscribed')return toast('先完成模拟申购');
  s.cashStatus='redeemed';log('虚构24小时赎回回执；USD 10.96为假设演算，不是已赚');render();return;
 }
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&/^(transfer-|match-|cash-)/.test(el.dataset.action))opsClick(el.dataset.action)});
