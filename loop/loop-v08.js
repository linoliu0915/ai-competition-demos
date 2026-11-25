'use strict';
// v0.8: 分时安全预留 + 逐条调拨建议 → 确认待办 → 模拟审批/渠道回执 → 重算。
// 所有资金源、渠道接口与回执仅为浏览器内的虚构演示，不连接真实系统。
const fundingSourcesV08={
 'V-USD':['OWN-V-USD',160000], 'V-HKD':['OWN-V-HKD',70000],
 'V-EUR':['OWN-V-EUR',100000], 'V-JPY':['OWN-V-JPY',6000000], 'V-GBP':['OWN-V-GBP',50000],
 'A-PHP':['OWN-A-PHP',600000], 'A-USD':['OWN-A-USD',60000],
 'B-HKD':['OWN-B-HKD',100000], 'B-MXN':['OWN-B-MXN',600000], 'B-USD':['OWN-B-USD',70000]
};
s.fundingTasks=[];
s.fxVerifiedV08=false;s.fxApprovedV08=false;
const priorCurrentOptsV08=currentOpts;
currentOpts=function(){return {...priorCurrentOptsV08(),fundingCredits:(s.fundingTasks||[]).filter(t=>t.status==='credited').map(t=>({pool:t.pool,slot:t.slot,amount:t.amount,id:t.id}))}};
const priorBalanceV08=balance;
balance=function(p,refresh=s.refresh){
 const snapshot=priorBalanceV08(p,refresh),received=(s.fundingTasks||[]).filter(t=>t.pool===p.id&&t.status==='credited').reduce((n,t)=>n+t.amount,0);
 return {...snapshot,gross:snapshot.gross+received,available:snapshot.available+received};
};
const priorResetV08=reset;
reset=function(quiet=false){priorResetV08(true);s.fundingTasks=[];s.fxVerifiedV08=false;s.fxApprovedV08=false;s.result=derive(currentOpts());render();if(!quiet)toast('已重置演示资金、建议和待办')};
const priorRerunV08=rerun;
rerun=function(){priorRerunV08();for(const task of s.fundingTasks||[])if(['confirmed','verified','approved'].includes(task.status)&&task.version!==s.version)task.status='stale';render()};
const priorStaleV08=stale;
stale=function(what){for(const task of s.fundingTasks||[])if(['confirmed','verified','approved'].includes(task.status))task.status='stale';s.fxVerifiedV08=false;s.fxApprovedV08=false;priorStaleV08(what)};

function fundingSourceV08(pool){const [id,cap]=fundingSourcesV08[pool]||['待核实',0];return {id,cap}}
function sourceRemainingV08(pool,excludeKey=''){
 const used=(s.fundingTasks||[]).filter(t=>t.pool===pool&&t.key!==excludeKey&&['confirmed','verified','approved','sent','credited'].includes(t.status)).reduce((n,t)=>n+t.amount,0);
 return Math.max(0,fundingSourceV08(pool).cap-used);
}
function taskLabelV08(status){return ({confirmed:'待核实',verified:'待审批',approved:'待调用渠道',sent:'渠道已受理·待回执',credited:'已处理·已入账',stale:'建议已变化·需重确认','source-needed':'资金源待核实'})[status]||'待处理'}
function taskToneV08(status){return status==='credited'?'green':status==='sent'?'blue':'amber'}
function fundingCandidateV08(r){
 const source=fundingSourceV08(r.p.id),existing=s.fundingTasks.find(t=>t.key===r.key),remaining=sourceRemainingV08(r.p.id,existing?.key),proposed=Math.min(r.extra,remaining),uncovered=r.extra-proposed;
 const basis=r.due.map(d=>d.product+' '+amount(d.amount,r.p.cur)).join('；');
 const action=existing&&existing.status!=='stale'?chip(taskLabelV08(existing.status),taskToneV08(existing.status)):btn(existing?'按新版建议重新确认 →':'逐条确认并加入待办 →','funding-confirm',s.dirty?'':'primary');
 return '<article class="v8-funding-card" data-funding-key="'+esc(r.key)+'"><div class="v8-funding-head"><div><small>最迟 '+times[r.slot][1]+' · 需求 '+times[r.slot][0]+'</small><h3>'+cname(r.p.ch)+' <em>'+r.p.cur+'</em></h3></div><strong>'+amount(r.extra,r.p.cur)+'</strong></div><div class="v8-funding-numbers"><div><span>AI识别新增缺口</span><b>'+amount(r.extra,r.p.cur)+'</b></div><div><span>本次可建议调拨</span><b>'+amount(proposed,r.p.cur)+'</b></div><div><span>仍需寻找资金来源</span><b>'+amount(uncovered,r.p.cur)+'</b></div></div><p>需求依据：'+esc(basis)+'；当前可用 '+amount(r.avail,r.p.cur)+'，已确认未来流入 '+amount(r.credited,r.p.cur)+'。</p><div class="v8-funding-foot"><small>候选来源 '+source.id+' · 演示容量 '+amount(source.cap,r.p.cur)+'；权属、同币种路径与时效仍需在待办核实。</small>'+action+'</div></article>';
}
function fundingListV08(){const recs=s.result.recs;return '<section class="panel v8-funding-section"><div class="panel-head"><div><p class="eyebrow">AI PREFUNDING LIST / 逐项备款建议</p><h2 class="panel-title">未来哪些时点，要向哪个渠道调拨多少？</h2><p class="panel-sub">按渠道×币种×截点列出新增缺口，并受虚构自有资金来源上限约束。逐条确认只创建待办，不会立刻增加渠道余额。</p></div>'+chip(recs.length+' 条建议','green')+'</div>'+(recs.length?'<div class="v8-funding-list">'+recs.map(fundingCandidateV08).join('')+'</div>':'<div class="v8-empty">当前分析版本没有新增基础缺口；已到账调拨会保留在处理记录中。</div>')+'<p class="guardrail">上方安全预留目标是额外的波动缓冲建议，尚未加入此列表的基础缺口；若要按更高安全垫执行，需另行评审并重新计算，不能把两个口径直接相加。待入账的收款也不会提前抵扣。</p></section>'}
const priorAdviceV08=advice;
advice=function(){return priorAdviceV08().replace('选择未来资金截点，查看当前资金、预测支出与AI建议预留；需要操作的缺口会流向“分析记录与待办”。','先看各时点安全资金目标，再逐条确认渠道、币种与最迟备款金额；已确认项目才流向“分析记录与待办”。').replace('<div class="v7-handoff">',fundingListV08()+'<div class="v7-handoff">').replace('系统识别渠道×币种×截点的基础缺口；调拨/换汇执行链、模拟审批和回执核对集中放在“分析记录与待办”。','上方逐条确认后，代办才会出现对应调拨。待办核实资金来源、模拟审批与渠道回执；回执后本页资金缺口自动重算。')};

function fundingActionV08(task){if(task.status==='confirmed')return btn('核实同币种自有资金来源 →','funding-verify','primary');if(task.status==='verified')return btn('模拟财资审批 →','funding-approve','primary');if(task.status==='approved')return btn('模拟调用渠道调拨接口 →','funding-send','primary');if(task.status==='sent')return btn('模拟渠道到账回执 →','funding-receipt','primary');if(task.status==='stale')return btn('回备款运营重新确认 →','goto-advice');if(task.status==='source-needed')return btn('返回查看未覆盖缺口 →','goto-advice');return '<span class="ops-done">✓ 已取得模拟回执并更新预测</span>'}
function fundingQueueV08(){const tasks=s.fundingTasks||[];return '<section class="panel v8-queue"><div class="panel-head"><div><p class="eyebrow">PREFUNDING / 已确认调拨待办</p><h2 class="panel-title">每一条调拨，单独核实、审批与跟踪回执</h2><p class="panel-sub">只有备款运营中逐条确认的项目才会进入这里；渠道受理不等于入账。</p></div>'+chip(tasks.length+' 条记录','blue')+'</div>'+(tasks.length?'<div class="v8-task-list">'+tasks.map(t=>'<article class="v8-task" data-task-key="'+esc(t.key)+'"><div class="v8-task-top"><div><small>'+esc(t.id)+' · 分析版本 v'+t.version+'</small><h3>'+cname(t.channel)+' / '+t.cur+' · '+times[t.slot][1]+'</h3></div>'+chip(taskLabelV08(t.status),taskToneV08(t.status))+'</div><div class="v8-task-data"><span>原建议缺口 <b>'+amount(t.gap,t.cur)+'</b></span><span>本单模拟调拨 <b>'+amount(t.amount,t.cur)+'</b></span><span>资金源 <b>'+esc(t.sourceId)+'</b></span></div><p>'+(t.status==='credited'?'模拟回执 '+esc(t.receipt)+' 已计入 '+esc(t.pool)+' 在 '+times[t.slot][0]+' 前的供给；请返回备款运营查看重算后的缺口。':t.status==='sent'?'渠道模拟接口已受理，余额尚未增加；须等待本单回执，不得重复发送。':t.status==='stale'?'业务事件或其他回执使旧建议失效；不沿用旧审批，请返回最新列表重新确认。':t.status==='source-needed'?'当前虚构自有资金来源容量不足；此单不能进入模拟审批，需重新核实合规资金来源。':'核实资金权属、同币种、目标渠道入金路径和最迟到达时间后，才可进入下一步。')+'</p><div class="v8-task-action">'+fundingActionV08(t)+'</div></article>').join('')+'</div>':'<div class="v8-empty">还没有确认的调拨。先到“备款运营”查看未来时点的逐项建议。</div>')+'<p class="guardrail">这里的核实、审批、渠道请求与回执均是本机状态演示，不调用真实资金、银行或渠道接口。实际系统还需要授权、幂等、防重、失败待查和对账机制。</p></section>'}
function cashQueueV08(){const status=s.cashStatus,m=valueMath();return '<section class="panel v8-cash-task"><div class="panel-head"><div><p class="eyebrow">CASH MANAGEMENT / 自有资金候选</p><h2 class="panel-title">经营价值页确认的现金管理待办</h2><p class="panel-sub">先从经营价值页确认候选，再在此筛选、审批、模拟产品接口与赎回核对。</p></div>'+chip(status==='idle'?'尚未确认':status==='redeemed'?'模拟已处理':'已确认待办',status==='redeemed'?'green':'amber')+'</div>'+(status==='idle'?'<div class="v8-empty">当前没有已确认候选；请先完成合资格货币对轧差，再回经营价值页确认。</div>':'<div class="ops-action"><div><b>假设公司自有闲置资金 '+usd(m.idle)+' USD · 24小时窗口</b><small>'+(status==='redeemed'?'模拟赎回回执已记录；'+usd(m.idlePotential,2)+' 只是示例收益演算。':'不得使用客户、未入账或受限资金；产品资质、期限、流动性和审批仍需独立核实。')+'</small></div>'+(status==='queued'?btn('模拟筛选合资格产品','cash-screen','primary'):status==='screened'?btn('模拟财资与合规审批','cash-approve','primary'):status==='approved'?btn('模拟产品接口申购','cash-subscribe','primary'):status==='subscribed'?btn('模拟赎回回执','cash-redeem','primary'):'<span class="ops-done">✓ 模拟赎回完成</span>')+'</div>')+'</section>'}
const priorRecordsV08=records;
records=function(){const funding=s.fundingTasks||[],pending=funding.filter(t=>!['credited','stale'].includes(t.status)).length,done=funding.filter(t=>t.status==='credited').length;const fxAction=!s.fxVerifiedV08?btn('核实资金权属、入账与结算条件 →','fx-verify','primary'):!s.fxApprovedV08?btn('模拟财资审批轧差方案 →','fx-approve','primary'):btn('模拟执行轧差 · 不调用渠道换汇','fx-execute','primary');return priorRecordsV08().replace(/<section class="v7-task-summary">[\s\S]*?<\/section>/,'<section class="v7-task-summary"><div><span>备款调拨</span><strong>'+pending+' 待办 / '+done+' 已处理</strong></div><div><span>货币对轧差</span><strong>'+(s.fxPairStatus==='executed'?'模拟已核销':s.fxPairStatus==='queued'?'待核实 / 待执行':'待确认方案')+'</strong></div><div><span>分析版本</span><strong>v'+s.version+'</strong></div></section>').replace(/<button class="btn primary" data-action="fx-execute">[^<]+<\/button>/,fxAction).replace('<section class="panel"><h2 class="panel-title">本轮分析和操作记录',cashQueueV08()+'<section class="panel"><h2 class="panel-title">本轮分析和操作记录')};
fundingOpsPanel=fundingQueueV08;

document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
 if(action.startsWith('fx-case-')||action==='fx-confirm'){s.fxVerifiedV08=false;s.fxApprovedV08=false;return}
 if(action==='fx-verify'){if(s.fxPairStatus!=='queued'||s.valueCase!=='eligible'||s.dirty)return toast('先确认当前版本的合资格货币对方案');s.fxVerifiedV08=true;log('模拟核实USD/HKD对向轧差的同主体、同池、已入账和结算窗口');render();return}
 if(action==='fx-approve'){if(s.fxPairStatus!=='queued'||!s.fxVerifiedV08||s.dirty)return toast('须先核实资金与结算条件');s.fxApprovedV08=true;log('模拟财资审批USD/HKD轧差控制方案');render();return}
 if(action==='cash-confirm'){if(s.valueCase!=='eligible'||s.fxPairStatus!=='executed')return toast('先完成合资格轧差');s.cashStatus='queued';log('确认自有资金现金管理候选，加入模拟待办');render();return}
 if(action==='funding-confirm'){
  if(s.dirty)return toast('输入已变化，请先重新分析');const key=el.closest('[data-funding-key]')?.dataset.fundingKey,r=s.result.recs.find(x=>x.key===key);if(!r)return toast('当前建议已失效，请重新分析');
  const old=s.fundingTasks.find(t=>t.key===key);if(old&&old.status!=='stale'&&old.status!=='source-needed')return toast('本建议已有待办，请到分析记录查看');
  const source=fundingSourceV08(r.p.id),proposed=Math.min(r.extra,sourceRemainingV08(r.p.id,key));
  const task={id:old?.id||'MOCK-FUND-'+String((s.fundingTasks||[]).length+1).padStart(3,'0'),key,version:s.version,pool:r.p.id,channel:r.p.ch,cur:r.p.cur,slot:r.slot,gap:r.extra,amount:proposed,sourceId:source.id,status:proposed>0?'confirmed':'source-needed',receipt:''};
  if(old)Object.assign(old,task);else s.fundingTasks.push(task);log('逐条确认备款建议 '+key+'：模拟调拨 '+amount(proposed,r.p.cur)+'，剩余 '+amount(r.extra-proposed,r.p.cur)+' 仍需资金来源');render();toast(proposed>0?'已加入待办，尚未调拨':'已记录缺口，当前无可核实资金来源');return;
 }
 if(!/^funding-(verify|approve|send|receipt)$/.test(action))return;
 const key=el.closest('[data-task-key]')?.dataset.taskKey,task=s.fundingTasks.find(t=>t.key===key);if(!task)return;
 if(action==='funding-verify'){
  if(s.dirty||task.version!==s.version||task.status!=='confirmed')return toast('旧版建议已失效，请重新确认');
  if(task.amount<=0||sourceRemainingV08(task.pool,task.key)<task.amount)return toast('虚构资金源容量不足，无法核实');
  task.status='verified';log('模拟核实 '+task.id+' 的同币种自有资金、路径与时效');render();return;
 }
 if(action==='funding-approve'){
  if(s.dirty||task.version!==s.version||task.status!=='verified')return toast('需当前版本资金核实结果');
  task.status='approved';log('模拟财资审批 '+task.id);render();return;
 }
 if(action==='funding-send'){
  if(s.dirty||task.version!==s.version||task.status!=='approved')return toast('需当前版本有效审批');
  task.status='sent';log('模拟渠道接口受理 '+task.id+'；尚未入账');render();return;
 }
 if(task.status!=='sent')return toast('该调拨没有待核对的渠道回执');
 task.status='credited';task.receipt='MOCK-RCPT-'+task.id.slice(-3);log('取得 '+task.id+' 的模拟到账回执 '+task.receipt+'；计入目标渠道后重算');rerun();toast('模拟回执已入账，备款建议与渠道资金已重算');
});
render();
