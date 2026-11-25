/* Local operator workspace. Synthetic files are read only in this browser. */
(()=>{
'use strict';
const E=window.OpportunityEngine,D=window.GrowthData,$=q=>document.querySelector(q);
const nav={overview:['⌂','增长看板'],history:['▤','历史洞察'],radar:['✳','跨源雷达'],plans:['◇','客户方案'],requirements:['◷','产品需求'],ledger:['▥','成单台账']};
const tone={ready:'green',blocked:'rose',missing:'amber',keep:'gray',draft:'blue',review:'amber',send:'blue',sent:'blue',accepted:'green',won:'green',lost:'gray'};
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const n=(v,d=0)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:2});
const fmtDate=v=>new Date(v).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
const btn=(a,t,id='',style='')=>'<button type="button" class="btn '+style+'" data-action="'+a+'" data-id="'+esc(id)+'">'+t+'</button>';
const badge=(t,k='gray')=>'<span class="badge '+(tone[k]||k)+'">'+esc(t)+'</span>';
const heading=(t,d,act='')=>'<div class="page-head"><div><h1>'+t+'</h1><p>'+d+'</p></div><div class="actions">'+act+'</div></div>';
const section=(t,body,act='',sub='')=>'<section class="panel"><div class="section-head"><div><h2>'+t+'</h2>'+(sub?'<small>'+sub+'</small>':'')+'</div><div class="actions">'+act+'</div></div>'+body+'</section>';
const table=(headers,rows)=>'<div class="table-wrap"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const metric=(label,value,note,highlight=false)=>'<article class="metric '+(highlight?'highlight':'')+'"><span>'+label+'</span><strong>'+value+'</strong><small>'+note+'</small></article>';
const empty=(t,p)=>'<div class="empty"><b>'+t+'</b><p>'+p+'</p></div>';
const field=(k,l,v='',attrs='')=>'<label>'+l+'<input name="'+k+'" value="'+esc(v)+'" '+attrs+'></label>';
const area=(k,l,v='',attrs='')=>'<label>'+l+'<textarea name="'+k+'" rows="4" maxlength="3000" '+attrs+'>'+esc(v)+'</textarea></label>';
const select=(k,l,list,v='')=>'<label>'+l+'<select name="'+k+'">'+list.map(([id,t])=>'<option value="'+esc(id)+'" '+(v===id?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>';
const ack=t=>'<label class="check"><input type="checkbox" name="mock" required>'+t+'</label>';
const numeric=(k,l,v,attr='')=>field(k,l,v,'type="number" min="0" max="10000000000" step="0.01" '+attr);
const callout=(t,d)=>'<div class="pg4-note"><b>'+t+'</b><p>'+d+'</p></div>';
const fold=(t,x)=>'<details class="fold"><summary>'+t+'</summary>'+x+'</details>';
const doc=t=>'<div class="doc-copy">'+esc(t)+'</div>';
const amount=(cur,value)=>esc(cur)+' '+n(value,2);
const form=(act,id,body,label)=>'<form data-command="'+act+'" data-id="'+esc(id)+'">'+body+'<div class="form-actions">'+btn('close','取消')+'<button type="submit" class="btn primary">'+label+'</button></div></form>';
const rate=m=>m.rate===null?'—':n(m.rate*100,m.rate*100%1?1:0)+'%';
const allSources=Object.entries(E.sources);
const resultsLabels=Object.entries(E.statuses);
const capName=()=>state.cap?.version||state.receiptCap?.version||'v1';
const gapKey=a=>a?.gapKey||E.capabilityKey(a?.type);
let state,screen='overview',filter={},sourceFilter='',historyStage='',page=1,toastTimer,modalView=null,attachments=[],previews=[];
try{
 const current=localStorage.getItem(E.key)||localStorage.getItem('paygent-opportunity-v5-7')||localStorage.getItem('paygent-opportunity-v5-6');
 const stored=JSON.parse(current||localStorage.getItem('paygent-opportunity-v5-5')||localStorage.getItem('paygent-opportunity-v5-4')||localStorage.getItem('paygent-opportunity-v5-3')||localStorage.getItem('paygent-opportunity-v5-2')||localStorage.getItem('paygent-opportunity-v5-1')||localStorage.getItem('paygent-opportunity-v5')||'null');
 state=stored?.version===5&&Array.isArray(stored.cases)&&Array.isArray(stored.plans)&&Array.isArray(stored.requirements)?(current?stored:E.migrate(stored)):E.fresh();
}catch{state=E.fresh();}
function toast(s){
 const d=$('#dialog'),el=d.open?d.querySelector('.dialog-status'):$('#toast');
 el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500);
}
function persist(){try{localStorage.setItem(E.key,JSON.stringify(state));return true;}catch{return false;}}
function apply(act,data={}){
 const r=E.command(state,act,data);state=r.s;render();
 const saved=persist();r.message+=saved?'':'；浏览器未能持久化，刷新可能丢失';
 return r;
}
function route(k){
 if(!Object.hasOwn(nav,k))return;
 if(screen!==k){filter={};page=1;}
 screen=k;if(location.hash!=='#'+k)location.hash=k;
 render();window.scrollTo(0,0);
}
function sync(){
 const k=location.hash.slice(1),dest=Object.hasOwn(nav,k)?k:'overview';
 if(dest!==screen){filter={};page=1;screen=dest;}
 render();
}
window.addEventListener('hashchange',sync);
function release(){previews.forEach(u=>URL.revokeObjectURL(u));previews=[];attachments=[];}
function close(){
 modalView=null;release();if($('#dialog').open)$('#dialog').close();
}
$('#dialog').addEventListener('cancel',()=>{modalView=null;release();});
function show(title,k,body,view=null){
 release();modalView=view;
 const d=$('#dialog');
 d.innerHTML='<div class="dialog-head"><div><small>'+esc(k)+'</small><h2 id="dialog-title">'+esc(title)+'</h2></div>'+btn('close','关闭')+'</div><div class="dialog-content">'+body+'<div class="dialog-status" role="status" aria-live="polite"></div></div>';
 if(!d.open)d.showModal();d.scrollTop=0;
}
function render(){
 $('#crumb').textContent=nav[screen][1];
 $('#nav').innerHTML=Object.entries(nav).map(([id,[icon,t]],i)=>'<a href="#'+id+'" '+(screen===id?'aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+icon+'</span><span>'+t+'</span><small>0'+(i+1)+'</small></a>').join('');
 $('#main').innerHTML=({overview,history,radar,plans,requirements,ledger})[screen]();
}
function howTo(){
 return '<div class="pg4-quick">'+[
  ['H07','历史洞察 · 存量商户画像','启洲贸易：查看近28天 48 笔交易，再补录客户需求。','查看启洲贸易'],
  ['H11','客户方案 · 用VCC更便利','录入云禾软件的项目控额诉求后，可分析并生成模拟卡方案。','查看云禾软件']
 ].map(([id,k,d,act])=>'<article><b>'+k+'</b><p>'+d+'</p>'+btn('case',act,id,'subtle')+'</article>').join('')+'</div>';
}
function overview(){
 const m=E.metrics(state,sourceFilter),funnel=[['案例',m.cases],['已分析',m.analyzed],['方案',m.plans],['已发送',m.sent],['登记成单',m.won]];
 const max=Math.max(1,...funnel.map(([,v])=>v));
 const board='<form data-command="source-filter" class="filter">'+select('source','线索来源',[['','全部来源'],...allSources],sourceFilter)+'<button type="submit" class="btn">应用</button></form>';
 return heading('增长看板','查看机会从哪里来、多少方案推进到成单',btn('go-history','分析存量商户')+btn('go-radar','录入新需求','','primary'))+
 '<div class="pg4-board-caption"><span>本机虚构演示 · '+esc(E.sources[sourceFilter]||'全部来源')+'</span>'+board+'</div>'+
 '<div class="metrics">'+metric('模拟已成单',m.won+' <em>笔</em>','其中模拟新增 '+m.newWins+' 笔',true)+metric('方案成单率',rate(m),m.sent?m.won+' 笔成单 ÷ '+m.sent+' 份已发送方案':'尚无已发送方案，不按 0% 展示',true)+metric('模拟新增月量','<em>CNY</em> '+n(m.volume),'回执登记的月量等值；不含迁移')+metric('模拟月净贡献','<em>CNY</em> '+n(m.net,2),'新增回执按费率减月成本演算')+'</div>'+
 '<div class="split">'+section('机会进展','<div class="bars pg4-bars">'+funnel.map(([k,v])=>'<div class="bar-row"><span>'+k+'</span><span class="track" aria-hidden="true"><i style="width:'+v/max*100+'%"></i></span><b>'+v+'</b></div>').join('')+'</div>',btn('go-plans','查看客户方案'),'登记需填写客户确认依据，才计入模拟成单')+
 section('各来源成交','<div class="pg4-source-summary">'+(sourceFilter?allSources.filter(([id])=>id===sourceFilter):allSources).map(([id,t])=>{const x=E.metrics(state,id);return '<div><b>'+t+'</b><span>'+x.won+' / '+x.sent+' <small>成单 / 已发送</small></span><strong>'+rate(x)+'</strong></div>';}).join('')+'</div>',btn('go-ledger','查看回执'))+'</div>'+
 section('快速体验',howTo())+
 '<p class="footnote">按不同来源分开计数；同一客户案例仅保留一份主方案，修订版本不增加分母。成单率为本轮累计成单 ÷ 已模拟发送方案，含仍在跟进的方案，不代表上线后的增长率。</p>';
}
const progressFilters=[
 ['','全部跟进状态'],['none','尚未生成或登记'],['plan','已生成客户方案'],
 ['requirement','已登记产品需求'],['both','方案和需求均已记录']
];
function caseProgress(id){
 return {plan:E.planFor(state,id),requirements:state.requirements.filter(r=>r.caseIds.includes(id))};
}
function matchesProgress(id,key){
 const {plan,requirements}=caseProgress(id);
 const hasPlan=!!plan,hasRequirement=requirements.length>0;
 return {none:!hasPlan&&!hasRequirement,plan:hasPlan,requirement:hasRequirement,both:hasPlan&&hasRequirement}[key];
}
function progressLinks(id){
 const {plan,requirements}=caseProgress(id);
 if(!plan&&!requirements.length)return badge('尚未生成或登记','gray');
 return '<div class="pg58-progress">'+
  (plan?'<div>'+btn('plan','已生成客户方案',plan.id,'subtle')+'<small>'+esc(plan.id)+' · '+esc(E.stages[plan.stage])+'</small></div>':'')+
  requirements.map(r=>'<div>'+btn('req','已登记产品需求',r.id,'subtle')+'<small>'+esc(r.id)+' · '+esc(r.status)+'</small></div>').join('')+'</div>';
}
function findRows(list,kind){
 const q=(filter.q||'').toLowerCase();
 return list.filter(c=>(!filter.status||(kind==='plan'?c.stage:c.analysis?.status)===filter.status)&&(!filter.source||(kind==='plan'?E.findCase(state,c.caseId)?.source:c.source)===filter.source)&&
  (kind==='plan'||!filter.progress||matchesProgress(c.id,filter.progress))&&
  (!q||(kind==='plan'?[c.id,E.findCase(state,c.caseId)?.name,c.analysis.title]:
   [c.id,c.name,c.notes,c.communication,c.currency,c.country,c.historyCurrency,c.historyCountry,...(D.historicalUsage[c.id]||[])]).some(x=>String(x||'').toLowerCase().includes(q))));
}
function filters(statuses,source=false,progress=false){
 return '<form data-command="filter" class="filter">'+field('q','搜索',filter.q||'','placeholder="客户、编号或场景"')+
 (statuses.length?select('status',progress?'机会判断':'状态',[['','全部状态'],...statuses],filter.status||''):'')+
 (source?select('source','来源',[['','全部来源'],...allSources],filter.source||''):'')+
 (progress?select('progress','跟进状态',progressFilters,filter.progress||''):'')+
 '<div class="actions"><button type="submit" class="btn primary">筛选</button>'+btn('clear','清除')+'</div></form>';
}
function paginate(rows,make,size=8){
 const total=Math.max(1,Math.ceil(rows.length/size));page=Math.min(total,page);
 return make(rows.slice((page-1)*size,page*size))+'<div class="pagination"><span>共 '+rows.length+' 条 · '+page+' / '+total+' 页</span><div class="actions">'+(page>1?btn('page','上一页',page-1):'')+(page<total?btn('page','下一页',page+1):'')+'</div></div>';
}
function casesTable(rows){
 if(!rows.length)return empty('暂无匹配案例','调整筛选，或录入一条虚构线索。');
 return table(['客户 / 案例','交易画像 / 线索材料','机会判断','跟进状态','客户价值（演算）','下一步'],rows.map(c=>{
  const a=c.analysis,b=a?.comparison,h=E.historyProfile(c),need=h&&a?.status==='missing'?E.historyEvidence(c,a.type):null;
  const fieldList=b?.needed?[...new Set([...b.needed.fees,...b.needed.minutes])]:[];
  const headline=!a?(c.communication?'需求已录入，可开始分析':'录入后分析') :a.status==='blocked'?'缺'+esc(E.capabilityInfo[gapKey(a)]?.title||'适用的产品能力'):need?'先补：'+esc(need.rows[0][0]):a.status==='missing'?'先按取证清单收集材料':
   a.status==='keep'?'沿用原方案，不测算切换收益':b.fees?.delta>0?'预计省 '+amount(b.currency,b.fees.delta)+' / 月':b.minutes?.delta>0?'预计少 '+n(b.minutes.delta)+' 分钟 / 月':
   fieldList.length?'需补：'+esc(E.estimateFields[fieldList[0]].label):'对照结果见详情';
  return ['<b>'+esc(c.name)+'</b><small>'+c.id+' · '+esc(h?.market||c.country)+' / '+esc(h?.currency||c.currency)+'</small>',
   h?'<b>'+esc(h.transactionType)+'</b><small>'+(h.count?n(h.count)+' 笔 · '+amount(h.currency,h.total)+' · '+esc(h.scale.tier):'暂无可汇总的交易流水')+'</small>'+
    '<small>我司产品 · '+esc(h.companyProducts.join('、')||'未记录')+(c.communication?' · 已补录沟通':'')+'</small>':
    esc(c.material)+'<small>'+esc(E.sources[c.source])+(c.communication?' · 已补录沟通':'')+'</small>',
   a?badge(E.statuses[a.status],a.status)+'<small>'+esc(a.title)+'</small>':badge('待分析','gray'),
   progressLinks(c.id),
   headline,need?btn('history-proof','补证（'+need.rows.length+'项）',c.id,'subtle')+btn('case','看画像',c.id):
   btn('case',a?.status==='blocked'?'查看能力缺口':h?(a?'查看分析结果':'查看画像 / 录入需求'):a?.status==='missing'?'查看取证清单':'查看分析',c.id,'subtle')];
 }));
}
function capabilityToolbar(scope){
 const history=scope==='history',cap=history?state.receiptCap:state.cap;
 const help=history?'查看新能力如何解决存量商户的实际问题。':
  cap?'已载入墨西哥 MXN 平台分账，可回原线索查看方案。':'新能力启用后，可回原线索复评。';
 return '<div class="pg5-history-actions">'+callout('演示产品目录 '+(cap?.version||'v1'),help)+
  '<div class="actions">'+(history||!cap?btn('catalog-upgrade','一键更新产品能力',scope,'subtle'):btn('cap-view','查看能力范围'))+'</div></div>';
}
function history(){
 const rows=E.historyBatch().map(h=>E.findCase(state,h.id));
 const pending=rows.filter(c=>!c.analysis),results=rows.filter(c=>c.analysis),active=historyStage||(pending.length?'pending':'results');
 const tabs=btn('history-stage','待分析 '+pending.length,'pending',active==='pending'?'primary':'')+
  btn('history-stage','分析结果 '+results.length,'results',active==='results'?'primary':'');
 return heading('历史洞察','① 查看交易画像　② 录入客户新需求　③ 查看分析结果',
  btn('history-batch','一键录入演示需求并分析','','primary'))+
 capabilityToolbar('history')+
 section('20 条存量客户案例',filters(active==='results'?resultsLabels:[],false,active==='results')+paginate(findRows(active==='pending'?pending:results,'case'),casesTable,20),tabs,
  '可逐条录入需求，也可一键补齐尚未录入的演示需求并分析全部 20 条。已录入的内容会保留。');
}
function radar(){
 const rows=state.cases.filter(c=>c.source!=='history');
 return heading('跨源雷达','分析潜客需求、核对产品能力，按需补齐业务材料',btn('radar-samples','导入演示样例','','primary'))+
 capabilityToolbar('radar')+
 '<div class="pg4-quick pg4-intakes">'+[['visit','销售拜访','客户访谈、微信聊天转写、现场截图'],['branch','分公司需求','需求文档、客户名单摘要、沟通纪要'],['external','外部数据导入','从零虚构的展会记录、CSV、外部资料摘要']].map(([id,t,d])=>'<article><b>'+t+'</b><p>'+d+'</p><div class="actions">'+btn('new',id==='external'?'导入线索材料':'录入需求',id,'primary')+btn('radar-demo','体验样例取证',id)+'</div></article>').join('')+'</div>'+
 section('潜客线索',filters(resultsLabels,true,true)+paginate(findRows(rows,'case'),casesTable),'','可分别按机会判断和跟进状态筛选，已登记的方案与需求可直接打开。');
}
function plans(){
 const rows=findRows(state.plans,'plan');
 return heading('客户方案','每个客户案例单独存档，方案修订与成单可追溯',btn('go-history','从历史洞察生成')+btn('go-radar','从新线索生成'))+
 section('方案与跟进',filters(Object.entries(E.stages),true)+paginate(rows,r=>r.length?table(['方案 / 客户','推荐组合','进展','操作'],r.map(p=>{
  const c=E.findCase(state,p.caseId);
  return ['<b>'+p.id+' · R'+p.rev+'</b><small>'+esc(c.name)+' · '+E.sources[c.source]+'</small>',esc(p.analysis.title),
   badge(E.stages[p.stage],p.stage==='blocked'?'blocked':p.stage)+(p.stage==='blocked'&&E.getCapability(state,gapKey(p.analysis))?'<small>有新目录 · 需复评适用范围</small>':''),btn('plan','打开方案',p.id,'subtle')];
 })):empty('尚无匹配的客户方案','先在案例分析中生成方案，或清除筛选。')),'','确认并模拟发送 → 登记模拟成单；跟进纪要可选，产品需求单独记录。');
}
const requirementKind=key=>key==='idr-local-payout'?'渠道拓展':key==='custom'?'自定义需求':'产品建设';
function requirements(){
 return heading('产品需求','把客户缺口转成产品立项或渠道拓展任务',btn('cap-view','查看当前能力目录')+btn('channel-sample','载入渠道拓展样例','','primary'))+
 section('需求池',state.requirements.length?table(['产品需求 / 编号','关联客户','处理状态','操作'],state.requirements.map(r=>[
  '<b>'+esc(r.title)+'</b><small>'+r.id+' · '+requirementKind(r.key)+'</small>',
  r.caseIds.length+' 条'+r.caseIds.map(id=>'<small>'+esc(E.findCase(state,id)?.name)+'</small>').join(''),
  badge(r.status,r.version?'green':'amber')+(r.version?'<small>演示目录 '+esc(r.version)+'</small>':''),
  btn('req','查看需求',r.id,'subtle')])):empty('尚无产品需求','可从历史洞察或跨源雷达登记，也可以载入渠道拓展样例。'),
  '', '需求可追溯到原客户；评估完成后回原案复评。');
}
function ledger(){
 const rows=state.plans.filter(p=>p.receipt),m=E.metrics(state);
 return heading('成单台账','只登记有模拟回执的方案，区分新增与内部迁移',btn('go-overview','返回增长看板'))+
 '<div class="metrics three">'+metric('模拟回执',m.won+' <em>笔</em>','客户确认后才能登记')+metric('其中新增',m.newWins+' <em>笔</em>','新客户或存量新增')+metric('模拟月净贡献','<em>CNY</em> '+n(m.net,2),'同一CNY等值口径，不执行换汇',true)+'</div>'+
 section('模拟成单回执',rows.length?table(['回执 / 客户','业务归因','模拟成交月量（CNY等值）','模拟月净贡献（CNY）','操作'],rows.map(p=>[
  '<b>'+p.receipt.id+'</b><small>'+esc(E.findCase(state,p.caseId).name)+' · '+fmtDate(p.receipt.at)+'</small>',esc(p.basis),n(p.receipt.volume,2),n(p.receipt.net,2),btn('plan','查看回执',p.id)
 ])):empty('暂无模拟回执','在客户方案中记录客户确认后，再登记成单。'))+
 '<p class="footnote">模拟月净贡献＝登记的月量 × 净费率 ÷ 10,000 − 月成本。内部迁移或原有存量的新增贡献记为 0；模拟结果不等于实际业绩。</p>';
}
function aiTrace(a){
 const next={ready:'可生成方案草稿。费用或耗时未齐时，先按下方清单补齐；不承诺未核实的节省。',
  missing:'先完成专属补证清单：'+a.question,blocked:'登记产品需求或更新产品目录后复评；现在不能发送方案。',keep:a.question}[a.status];
 return '<div class="pg4-ai"><span class="badge blue">AI分析 · 离线规则模拟</span>'+badge(E.statuses[a.status],a.status)+
 '<h3>'+esc(a.title)+'</h3><p>'+esc(a.rationale)+'</p></div>'+
 '<div class="pg4-analysis-grid"><div><h3>判断依据</h3><p>'+esc([a.signal,a.profile.pain].filter(Boolean).join('。'))+'</p></div><div><h3>接下来怎么做</h3><p>'+esc(next)+'</p></div></div>'+
 fold('查看原文证据',a.evidence.map(e=>'<h3>'+esc(e.source)+'</h3>'+doc(e.text)).join(''));
}
function valuePanel(a,customer,plan=null){
 const v=a.comparison,f=a.status==='blocked'?null:v.fees,t=v.minutes,sectionTitle='<h3>客户经济性与便利性</h3>';
 if(a.status==='keep')return sectionTitle+callout('本案不需要换方案','目前没有新增需求或切换理由，不展示空白测算。如客户提出新需求，可补录后重新分析。');
 const delta=(value,cur)=>value>0?'预计少 '+amount(cur,value):value<0?'预计多 '+amount(cur,-value):'无差异';
 const rows=[
  ...(f?[['直接费用',amount(v.currency,f.old),amount(v.currency,f.next),delta(f.delta,v.currency)]]:[]),
  ...(t?[['人工处理时间',n(t.old)+' 分钟',n(t.next)+' 分钟',t.delta===0?'无差异':(t.delta>0?'预计少 ':'预计多 ')+n(Math.abs(t.delta))+' 分钟']]:[])
 ];
 const comparison=rows.length?table(['同一月业务量','现有方式','建议方式','差额'],rows)+
 '<p class="footnote">比较基线：'+esc(v.mode)+' · '+(v.count?n(v.count)+' 笔/月':'笔数待核实')+'。同币、同量和同工作范围的演算，未列费用不在比较内。'+(a.status!=='ready'?'业务条件未核实，不能用作报价。':'')+'</p>':'';
 if(a.status==='blocked')return sectionTitle+
  callout('先确认能力，再补正式对照','当前产品不覆盖，不能提供拟议报价；先记录产品需求或等待目录更新。'+(t?'下方耗时仅是能力开通后的假设，不代表可交付。':''))+comparison;
 if(!v.needed&&plan&&plan.stage!=='draft')return sectionTitle+comparison+callout('方案测算已冻结','已发送或完结的方案保留当时记录。若需继续核实，请打开客户案例。');
 const current=v.needed?v:E.analyze(state,customer).comparison;
 const feeMissing=current.needed.fees,minutesMissing=current.needed.minutes;
 if(f&&t)return sectionTitle+comparison;
 const needed=(title,keys)=>keys.length?'<div><b>'+title+'</b><ul>'+keys.map(k=>'<li>'+E.estimateFields[k].label+' <small>· '+E.estimateFields[k].owner+'</small></li>').join('')+'</ul></div>':'';
 const canEdit=!plan||plan.stage==='draft';
 const requireCurrency=current.currencyOK===false;
 const shared=feeMissing.filter(k=>minutesMissing.includes(k));
 return sectionTitle+comparison+'<div class="pg51-missing"><b>'+(!rows.length?'还不能测算：需要以下数据':'已展示可计算项；还可补以下数据')+'</b>'+
 needed('两项测算都需要',shared)+'<div class="pg4-analysis-grid">'+needed('要比较费用',feeMissing.filter(k=>!shared.includes(k)))+needed('要比较便利性',minutesMissing.filter(k=>!shared.includes(k)))+'</div>'+
 (requireCurrency?'<p>费用还需要先核实交易币种。请在业务补证中填写，不要跨币种直接比价。</p>':'')+
 '<div class="actions">'+(canEdit&&!requireCurrency&&feeMissing.length+minutesMissing.length?btn(plan?'plan-economics':'economics',plan?'补齐数据并更新草稿':'补齐测算数据',plan?.id||customer.id,'primary'):'')+
 (requireCurrency&&customer.source==='history'?btn('history-proof','去补币种和业务信息',customer.id):'')+
 (!canEdit?btn('case','查看案例补充资料',customer.id):'')+'</div>'+
 '<p class="footnote">'+(canEdit?'未知项可留空；确认没有费用或耗时才填 0。':'该方案已发送或完结，不修改已确认版本。')+'</p></div>';
}
function profilePanel(c){
 const h=E.historyProfile(c);
 const products=h.companyProducts.map(x=>badge(x,'green')).join('')||'未记录使用我司产品';
 const scale=h.scale?esc(h.scale.tier):'待补交易流水';
 const stats=h.count?n(h.count)+' 笔 · 周均 '+n(h.perWeek)+' 笔 · '+amount(h.currency,h.total):'暂无可汇总的流水';
 const profile='<h3>客户画像</h3><p class="footnote">历史交易观察期 '+h.window+'</p><div class="metrics pg57-profile">'+
  metric('市场与币种',esc(h.market)+' · '+esc(h.currency),'历史交易市场与流水币种')+
  metric('交易类型',esc(h.transactionType),'按历史业务用途归类')+
  metric('客户交易规模',scale,stats,true)+
  metric('已用我司产品',products,h.external?esc(h.external):'按演示历史记录归属产品')+'</div>';
 if(!h.count)return profile;
 const recent=h.entries.slice(-12).reverse(),max=Math.max(1,...h.weeks);
 return profile+fold('查看规模口径、每周分布与逐笔流水',
 '<p class="footnote">规模按观察期内笔数、演示美元等值取较高档。达到 40 笔或 4 万美元等值为较大，达到 12 笔或 1 万美元等值为中等，其余为小量。'+
 (h.scale.usd===null?'本案例按笔数分档。':'本案例演示折合约 USD '+n(Math.round(h.scale.usd))+'。')+' 口径仅用于本页交易分档，企业总营收另行评估。</p>'+
 '<div class="bars pg4-bars">'+h.weeks.map((v,i)=>'<div class="bar-row"><span>第 '+(i+1)+' 周</span><span class="track" aria-hidden="true"><i style="width:'+v/max*100+'%"></i></span><b>'+v+'</b></div>').join('')+'</div>'+
 '<p class="footnote">显示最近 '+recent.length+' 笔，汇总使用观察期内全部 '+h.count+' 笔。关联服务按同一笔流水计一次。</p>'+
 table(['交易流水','日期','流水类别','原币金额'],recent.map(t=>[t.id,t.day,esc(t.product),amount(t.cur,t.amount)])));
}
function caseView(id){
 const c=E.findCase(state,id);if(!c)return;
 return c.source==='history'?historyCase(c):radarCase(c);
}
function historyCase(c){
 const id=c.id;
 const a=c.analysis,p=E.planFor(state,id),req=state.requirements.find(r=>r.key===gapKey(a)&&r.caseIds.includes(id));
 if(!a){
  return show(c.name,id+' · 存量客户画像',
   '<div class="detail-meta">'+badge('待分析','gray')+'</div>'+
   profilePanel(c)+
   '<h3>客户新需求</h3>'+(c.communication?doc(c.communication):empty('待录入客户新需求','可记录客户希望新增的业务、当前卡点及目标。'))+
   '<div class="actions mt">'+btn('facts',c.communication?'编辑客户新需求':'录入客户新需求',id,c.communication?'':'primary')+
   (c.communication?btn('analyze-case','分析这条需求',id,'primary'):'')+'</div>',{kind:'case',id});
 }
 const acts=btn('analyze-case','重新分析机会',id)+
  (a&&['ready','blocked'].includes(a.status)&&(!p||['draft','blocked'].includes(p.stage))?btn('generate',p?'复评并更新原方案':a.status==='blocked'?'保存待升级方案':'生成客户方案',id,'primary'):'')+
  (a?.status==='blocked'?btn('request',req?'查看关联产品需求':'登记产品需求',id,'subtle'):(a?btn('custom-request-form','记录产品需求',id):''))+
  (p?btn('plan','打开 '+p.id,p.id):'');
 show(c.name,id+' · '+E.sources[c.source],
  '<div class="detail-meta">'+badge('需求市场 · '+c.country+' / '+c.currency,'gray')+badge('能力目录 '+capName(),'blue')+'</div>'+
  '<h3>跟进状态</h3>'+progressLinks(id)+
  (a?.status==='missing'?'<div class="pg51-missing"><b>下一步：补齐业务材料</b><p>已有画像继续保留。请补：'+E.historyEvidence(c,a.type).rows.map(x=>esc(x[0])).join('、')+'。业务条件确认前不生成可发送方案。</p>'+
   btn('history-proof','打开本案例补证清单',id,'primary')+'</div>':'')+
  (a?.status==='blocked'?callout('缺产品能力，不是缺客户资料',esc(a.rationale)+' 可登记需求；在历史洞察列表顶部更新演示能力，再回来复评。'):'')+
  profilePanel(c)+
  '<div class="actions mt">'+btn('facts','补录客户需求',id,'subtle')+
  (a?.status==='ready'&&a.comparison.needed.fees.length+a.comparison.needed.minutes.length?btn('economics','查看并补齐测算缺项',id):'')+'</div>'+
  '<h3>交易方式与原始线索</h3>'+doc(c.baseline.mode+'\n'+c.notes+(c.communication?'\n补录（'+(c.communicationSource||'手工纪要')+'）：'+c.communication:''))+
  (c.proof?'<h3>当前业务核验</h3>'+doc(c.proof):'')+
  (c.communicationFiles?.length?'<p class="footnote">沟通材料：'+c.communicationFiles.map(esc).join('、')+'；原件不存储。</p>':'')+
  (c.proofFiles?.length?'<p class="footnote">补证材料：'+c.proofFiles.map(esc).join('、')+'</p>':'')+
  (a?aiTrace(a)+valuePanel(a,c)+'<h3>建议销售话术</h3>'+doc(a.script):empty('尚未分析','点击重新分析，生成基于样例证据的判断。'))+
  '<div class="actions mt">'+acts+'</div>',{kind:'case',id});
}
function radarCase(c,justImported=false){
 const id=c.id,a=c.analysis,p=E.planFor(state,id),list=E.evidenceLists[a?.type]||E.evidenceLists.review;
 const blocked=a?.status==='blocked',needsProof=a?.status==='missing'||!a;
 const channel=gapKey(a)==='idr-local-payout';
 const request=caseProgress(id).requirements.find(r=>r.key===gapKey(a));
 const next=p?btn('plan','打开 '+p.id,p.id,'primary'):a?.status==='ready'?btn('generate','生成详细方案',id,'primary'):'';
 show(c.name,id+' · '+E.sources[c.source]+' · 潜客', '<div class="detail-meta">'+badge(c.country+' / '+c.currency)+
  (blocked?badge('能力缺口','blocked'):badge(c.verified?'材料已核验':'材料待核验',c.verified?'green':'amber'))+'</div>'+
  (a?callout('初判方向 · '+esc(a.title),esc(a.rationale)):'')+
  (justImported&&gapKey(a)==='platform-split'&&a?.scope?callout('导入案例复盘 · 更新前的能力缺口','旧目录仅能处理常规收付款，无法自动扣留平台服务费并结算给入驻服务商。当前目录已覆盖该场景，可以直接生成客户方案。'):'')+
  (blocked?callout(request?'下一步：评估已登记需求':channel?'下一步：登记渠道拓展需求':'下一步：登记产品需求',
   (c.verified?'样例客户材料已核验。':'当前先解决产品覆盖问题。')+
   (channel?'渠道需求卡包含候选机构对比、商务核实与技术验收项。':request?'可打开需求查看范围，并在能力更新后回原案复评。':'可登记需求，并在能力更新后回原案复评。')):'')+
  '<h3>跟进状态</h3>'+progressLinks(id)+
  '<div class="actions mt">'+(needsProof?btn('guide','打开取证清单',id,'primary'):'')+next+
  (blocked?btn('request',(request?'查看':'登记')+(channel?'渠道需求':'产品需求'),id,'primary'):btn('custom-request-form','记录产品需求',id))+'</div>'+
  (needsProof?'<h3>取证清单</h3>'+table(['需核对','找谁','具体材料 / 信息','通过标准'],list.map(row=>row.map(esc))):'')+
  '<h3>已收到的材料</h3>'+doc(c.notes)+
  (c.files?.length?'<p class="footnote">线索材料：'+c.files.map(esc).join('、')+'</p>':'')+
  (c.proof?'<h3>核验结果</h3>'+doc(c.proof):'')+
  (c.proofFiles?.length?'<p class="footnote">补证材料：'+c.proofFiles.map(esc).join('、')+'</p>':'')+
  (needsProof?'<p class="footnote">模拟核验通过后才展开详细路径与客户价值。</p>':''),{kind:'case',id});
}
const attachField=()=>'<label>上传虚构截图 / 文档<input id="caseFilesV4" type="file" multiple accept=".txt,.md,.csv,.docx,.pdf,.png,.jpg,.jpeg,.webp"></label>'+
 '<p class="footnote">本机读入文本；截图仅预览，需补转写；PDF需粘贴摘录。不上传，不使用真实资料。</p><div id="caseFilesPreviewV4"></div>';
const evidenceCards=list=>'<div class="pg5-checklist">'+list.map(([title,owner,material,rule],i)=>'<article><label class="check"><input type="checkbox" name="checks" value="'+i+'" required>'+esc(title)+'</label>'+
  '<p><b>找谁：</b>'+esc(owner)+'</p><p><b>需要：</b>'+esc(material)+'</p><p><b>核验：</b>'+esc(rule)+'</p></article>').join('')+'</div>';
function historyProof(id){
 const c=E.findCase(state,id),g=E.historyEvidence(c),profile=E.historyProfile(c);
 show('存量商户补证',id+' · '+c.name,form('history-verify',id,
  callout('已有资料，不用重新录',profile.count?'已保留近28天 '+n(profile.count)+' 笔交易和原始沟通记录。这次只核对下方缺项。':'保留原始沟通记录；没有历史流水不按 0 笔处理，也不补造交易。')+
  evidenceCards(g.rows)+
  (g.resolve?'<div class="fields">'+select('type','核实后的业务用途',[['','请选择'],...Object.entries(D.profiles).filter(([k])=>k!=='review').map(([k,p])=>[k,p.label])])+
   field('country','国家 / 地区','','maxlength="40" required')+field('currency','交易币种','','maxlength="3" pattern="[A-Za-z]{3}" required')+'</div>':'')+
  (g.sample?'<div class="actions">'+btn('history-proof-sample','填入本案例的虚构材料',id,'subtle')+'</div>':'')+
  area('proof','核验依据 / 材料摘录',c.proof,'required')+ack('确认资料均为虚构，并已逐项核对。')+
  fold('附加虚构截图或文档（可选）',attachField())+'<p class="footnote">保存后只更新案例判断；不会改写已发送的方案，也不会自动开放产品能力。</p>','保存材料并重新判断'));
}
function economicsForm(c,plan){
 const v=E.analyze(state,c).comparison,keys=[...new Set([...v.needed.fees,...v.needed.minutes])];
 if(!keys.length)return toast('当前已具备费用与耗时的对照数据。');
 const h=E.historyProfile(c);
 show('补齐客户价值测算',c.id+' · '+c.name,form('economics',c.id,
  (plan?'<input type="hidden" name="planId" value="'+plan.id+'">':'')+
  callout('只补下面的缺项','当前已填数据会保留。'+(h?.count?'可参照近28天 '+h.count+' 笔流水，但用于比较的月笔数须是两种方式都处理的同一批业务。':'使用双方都可比较的同一批月度业务。'))+
  '<div class="pg51-value-form">'+keys.map(k=>{
   const x=E.estimateFields[k],unit=k.endsWith('Fee')?'（'+esc(c.currency)+' / 笔）':k.endsWith('Min')?'（分钟 / 笔）':'';
   return '<article>'+(k==='mode'?field(k,x.label,'','maxlength="120"'):k==='count'?field(k,x.label,'','type="number" min="1" max="1000000" step="1"'):numeric(k,x.label+unit,''))+
    '<small>找 '+esc(x.owner)+'。'+esc(x.hint)+'</small></article>';
  }).join('')+'</div>'+
  '<div class="actions">'+btn('economics-sample','填入虚构测算样例',c.id,'subtle')+'</div>'+
  '<p class="footnote">未知值可留空，不按 0 计算。示例不是实际产品价格、到账时效或成本。</p>',plan?'复算并更新原草稿':'保存并重新测算'));
}
function guide(id,type){
 const c=E.findCase(state,id);type=type||c.analysis?.type||'review';
 const list=E.evidenceLists[type]||E.evidenceLists.review,example=E.proofSamples[type];
 show('潜客取证清单',id+' · '+c.name,form('radar-verify',id,
  select('type','核验的场景',[['review','业务关系待厘清'],...Object.entries(D.profiles).filter(([k])=>k!=='review').map(([k,p])=>[k,p.label])],type)+
  evidenceCards(list)+
  (example?'<div class="actions">'+btn('proof-sample','填入模拟补齐材料',id,'subtle')+'</div>':'')+
  '<input type="hidden" name="sample" value="no">'+area('proof','核验依据 / 可读摘录',c.proof,'required')+
  ack('确认资料均为虚构，并已按上面清单核对。')+fold('附加虚构截图或文档（可选）',attachField())+
  '<p class="footnote">仅虚构样例会带入对照费用。能力缺口仍转产品需求，不会因为材料齐全自动放行。</p>','核验并查看方案'));
}
function facts(id){
 const c=E.findCase(state,id),b=c.baseline;
 show('补录客户需求',id+' · '+c.name,form('facts',id,
  select('communicationSource','沟通来源',['手工纪要','微信聊天转写','截图转写','文档摘录'].map(x=>[x,x]),c.communicationSource||'手工纪要')+
  area('communication','客户日常沟通 / 新需求',c.communication)+
  '<label class="check"><input type="checkbox" name="mock">如导入附件，确认材料全部为虚构</label>'+attachField()+
  fold('调整现有方式、比较口径或需求分类','<div class="fields">'+field('mode','现有交易方式',b.mode,'maxlength="120"')+
  select('type','需求归类',[['auto','根据纪要模拟识别'],...Object.entries(D.profiles).map(([k,p])=>[k,p.label])],c.type)+
  field('count','同场景预计月笔数',b.count,'type="number" min="1" max="1000000" step="1"')+
  numeric('oldFee','现有单笔费用（'+esc(c.currency)+'）',b.oldFee)+numeric('newFee','建议单笔费用（'+esc(c.currency)+'）',b.newFee)+
  numeric('oldMin','现有单笔处理分钟',b.oldMin)+numeric('newMin','建议单笔处理分钟',b.newMin)+'</div>'+
  '<input type="hidden" name="proof" value="'+esc(c.proof)+'">'+(c.verified?'<input type="hidden" name="verified" value="yes">':'')+
  '<p class="footnote">正式核验使用案例的专属补证清单，不在沟通录入中直接勾选通过。</p>')+
  '<p class="footnote">'+(c.analysis?'留空不会按零计算。自动识别优先参考补录沟通；需求变化后须重新核验。已提交的方案版本保留。':
   '保存后可分析这条需求，或回历史洞察和其他案例一起分析。')+'</p>',c.analysis?'保存并重新分析':'保存客户需求'));
}
function intake(source,sample=false){
 const s=sample?E.sampleIntakes[source]:{},label=E.sources[source];
 show(label, '新线索 · 多渠道录入',form('new',source,
  '<div class="actions">'+btn('fill-intake','填入虚构样例',source,'subtle')+'</div>'+
  '<div class="fields">'+field('name','客户名称',s.name,'maxlength="60" required')+field('country','国家 / 地区',s.country,'maxlength="40" required')+
  field('currency','币种',s.currency,'maxlength="3" pattern="[A-Za-z]{3}" required')+
  select('material','材料类型',['拜访纪要','微信聊天记录','需求文档','截图或外部文档'].map(x=>[x,x]),s.material)+'</div>'+
  area('notes','可读原文 / 微信转写 / 文档摘录',s.notes,'required placeholder="粘贴虚构聊天、访谈或文档原文；截图请补充可读转写"')+
  ack('确认所有文本和附件均为从零虚构，不含真实客户资料。')+
  '<label>导入文件（最多5个，每个不超过2 MB）<input id="caseFilesV4" type="file" multiple accept=".txt,.md,.csv,.docx,.pdf,.png,.jpg,.jpeg,.webp"></label>'+
  '<p class="footnote">TXT、MD、CSV、DOCX可本地读入文字；PDF和截图仅作为附件线索，截图可预览，请补充摘录或转写，无OCR、不上传。</p><div id="caseFilesPreviewV4"></div>',
  '保存并模拟分析'));
}
function offer(p){
 const c=E.findCase(state,p.caseId),a=p.analysis,r=p.receipt,card=p.card,req=state.requirements.find(x=>x.key===gapKey(a)&&x.caseIds.includes(c.id));
 const current=E.analyze(state,c),stale=p.stage==='draft'&&JSON.stringify(a)!==JSON.stringify(current);
 const canCard=a.type==='card'&&a.status==='ready'&&!card&&!stale&&p.stage!=='lost'&&E.cardCurrencies.includes(c.currency);
 const net=['新客户','存量新增业务'].includes(p.basis)&&p.volume>0?(p.volume*p.bps/10000-p.ops):0;
 const completion=p.stage==='sent'?'<form class="pg5-finish" data-command="finish" data-id="'+p.id+'"><h3>2 · 登记成单</h3>'+
  '<input type="hidden" name="mock" value="yes"><div class="fields">'+numeric('volume','成交月量（CNY等值）',p.volume||'','required')+
  field('note','客户确认依据','虚构记录：客户同意试点方案。','required maxlength="3000"')+'</div>'+
  '<div class="actions"><button type="submit" class="btn primary">确认客户同意并登记模拟成单</button>'+btn('follow-form','记跟进（可选）',p.id)+btn('close-form','未成单关闭',p.id)+'</div></form>':'';
 show(c.name+' · 客户方案',p.id+' / R'+p.rev+' · '+E.sources[c.source],
  '<div class="detail-meta">'+badge(E.stages[p.stage],p.stage==='blocked'?'blocked':p.stage)+badge(a.capVersion?'演示能力 '+a.capVersion:'演示目录常规能力','blue')+'</div>'+
  '<div class="pg4-ai"><span class="badge blue">AI分析 · 离线规则模拟</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.rationale)+'</p></div>'+
  (p.stage==='blocked'?callout('当前不可交付',req?'已关联 '+req.id+'。导入新能力后仍需回到该客户核验覆盖条件，再更新原方案。':'先单独登记产品需求，当前不能发送方案。'):'')+
  (stale?callout('草稿需更新','案例或产品条件已变化。确认当前依据后更新原方案，旧版本会保留。'):'')+
  '<div class="actions mt">'+(p.stage==='draft'?(stale?(current.status==='ready'?btn('generate','更新原草稿',c.id,'primary'):''):btn('start','1 · 确认并模拟发送',p.id,'primary')+btn('tune-form','编辑话术 / 测算（可选）',p.id)):'')+
  (canCard?btn('card-form','生成模拟VCC卡',p.id,'subtle'):'')+
  (p.stage==='blocked'?btn('analyze-case','按新能力复评案例',c.id,'subtle')+(req?btn('req','打开 '+req.id,req.id):btn('request','登记产品需求',c.id)):'')+
  btn('case','查看客户案例',c.id)+'</div>'+
  completion+
  (r?'<h3>模拟成单回执</h3><div class="receipt"><b>'+r.id+'</b><span>月量 CNY '+n(r.volume,2)+' · 净贡献 CNY '+n(r.net,2)+'</span><small>'+esc(r.note)+'</small></div>':'')+
  (card?'<h3>模拟VCC卡</h3>'+cardFace(card,c.name):'')+
  '<h3>拟议路径</h3>'+doc(a.proposed)+(stale?callout('暂不更新旧稿测算','请先更新原草稿，或打开客户案例核实。'):valuePanel(a,c,p))+
  fold('展开证据与落地检查',aiTrace(a)+'<ol>'+a.steps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>')+
  fold('展开销售话术与公司侧测算',doc(p.script||a.script)+
   '<div class="pg4-company"><b>公司侧增量测算</b><span>归因：'+esc(p.basis)+' · '+(p.volume?'月量等值 CNY '+n(p.volume)+' · '+n(p.bps)+' bp · 月成本 CNY '+n(p.ops,2):'月量待估算')+'</span>'+
   '<strong>'+(p.stage==='blocked'?'不计可承接贡献':!p.volume&&!r?'待估算':'CNY '+n(r?.net??net,2)+' / 月 · '+(r?'模拟回执':'假设'))+'</strong></div>')+
  fold('跟进轨迹（'+p.followups.length+'）',p.followups.length?'<ul class="logs">'+p.followups.map(x=>'<li><time>'+fmtDate(x.at)+'</time><span>'+esc(x.note)+(x.nextDate?'<small>计划回访 '+esc(x.nextDate)+'</small>':'')+'</span></li>').join('')+'</ul>':'<p class="muted">暂无跟进记录。</p>')+
  (p.previous.length?fold('历史版本',p.previous.map(x=>'<p>R'+x.rev+' · '+esc(E.stages[x.status])+' · '+esc(x.analysis.rationale)+'</p>').join('')):''),{kind:'plan',id:p.id});
}
function cardFace(card,name){
 return '<div class="card-preview"><small>跨境智拓 · 模拟卡</small><b>'+esc(name)+'</b><span>'+esc(card.cur)+' · '+esc(card.id||'未生成')+'</span>'+
 '<small>累计 '+n(card.limit)+' ／ 单笔 '+n(card.single)+' ／ '+n(card.count)+' 次 · 不含卡号或安全码</small></div>';
}
function cardForm(p){
 const c=E.findCase(state,p.caseId);
 show('生成模拟VCC卡',p.id+' · 方案内配置预览',form('card',p.id,cardFace({cur:c.currency,limit:30000,single:3000,count:20},c.name)+
 '<div class="fields">'+field('limit','总限额（'+esc(c.currency)+'）',30000,'type="number" min="1" max="1000000" step="1" required')+
 field('single','单笔限额',3000,'type="number" min="1" max="1000000" step="1" required')+field('count','使用次数',20,'type="number" min="1" max="100" step="1" required')+'</div>'+
 '<p class="footnote">仅生成配置和模拟卡面；不发卡、不扣款，不把MCC当作精确订单控制，也不计成单。</p>'+ack('确认仅生成虚构配置预览。'),'生成模拟卡'));
}
function workflow(kind,p){
 const id=p.id,c=E.findCase(state,p.caseId),label=id+' · '+c.name;
 const note=area('note','纪要 / 依据','','required');
 if(kind==='tune')return show('编辑客户沟通稿与测算',label,form('tune',id,
  area('script','销售话术',p.script||p.analysis.script,'required')+
  '<div class="fields">'+select('basis','业务归因',E.bases.map(x=>[x,x]),p.basis)+numeric('volume','预计月量（CNY等值）',p.volume,'required')+
  numeric('bps','净费率（bp）',p.bps,'required')+numeric('ops','月成本（CNY）',p.ops,'required')+'</div>','保存调整'));
 if(kind==='follow')return show('记录下一次跟进',label,form('follow',id,note+field('nextDate','下次跟进日期（可选）','','type="date"'),'保存跟进'));
 if(kind==='close')return show('关闭未成单',label,form(kind,id,note,'确认关闭'));
}
const productOutlines={
 'platform-split':[
  ['业务目标','墨西哥 MXN 平台收款后，可自动扣留约定服务费，并按期结算给入驻商户。'],
  ['首期范围','一个已核验的平台、一种币种和一类费率规则。梳理平台、商户、买方及退款责任。'],
  ['核心流程','订单到账 → 计算服务费和商户净额 → 记账与结算 → 处理退款回退 → 日终对账。'],
  ['关键规则','明确资金归属、服务费基数、舍入尾差、可退金额及失败处理。业务结构先经合规评估。'],
  ['验收与试点','核对分配合计与原单一致、重复请求仅入账一次、部分退款可回退、差错可追溯。试点记录可承接月量与人工耗时。']
 ],
 'payout-receipt-api':[
  ['业务目标','让企业财务按自己的订单号自动匹配单笔付款结果，减少下载和手工查账。'],
  ['首期范围','香港 HKD 付款。返回客户订单号、渠道单号、付款状态、到账凭证索引及失败原因。'],
  ['核心流程','发起付款时传订单号 → 对应渠道结果 → 回调推送 → 客户验签入账。未收到回调可主动查单。'],
  ['关键规则','统一状态及终态，约定鉴权、重试、去重、乱序和回执权限，保留追踪记录。'],
  ['验收与试点','正常、失败、重复、乱序、超时五类回调按单匹配；用同一批付款对比人工对账耗时。']
 ]
};
const sourceLink=(url,name)=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+name+'</a>';
function channelBrief(r){
 const providers=[
  ['Xendit · 首轮验证','公开 IDR 覆盖页给出 BI-FAST 预计 15 分钟，Payout API 支持状态订阅和查单。','先确认 BCA、BRI、Mandiri 的周末分银行表现、合作主体与备付方式，再拿沙箱和报价。',sourceLink('https://docs.xendit.co/docs/payout-coverage-indonesia','IDR 覆盖')+' · '+sourceLink('https://docs.xendit.co/docs/payouts-via-api','Payout API')],
  ['DOKU · 并行备选','公开支持 BI-FAST 等银行路由、收款账户校验和电子钱包。说明中明确下发受银行可用时间影响。','验证周末路由、逐笔退回通知及对账文件。若后续新增钱包需求，再复评优先级。',sourceLink('https://docs.doku.com/payouts/domestic-payouts','Domestic Payouts')],
  ['Bank Mandiri · 银行直连评估','Kopra Host to Host 公开支持跨行 BI-FAST、收款人姓名核验和交易查询，并要求活期账户及企业申请。','询问可签约主体、账户及备付要求、终态回传和商务条款。批量稳定后再对比直连总成本。',sourceLink('https://www.bankmandiri.co.id/en/variant-kopra-host-to-host','Kopra Host to Host')]
 ];
 return '<h3>建议补齐的渠道能力</h3>'+callout('印尼盾 B2B 本地银行下发','通过可签约的合作机构向印尼供应商银行账户付款，优先评估 BI-FAST 路径。周末到账、逐笔状态、失败退回和日终对账列为验收项。')+
 (r.caseIds.includes('R03')?'<p class="footnote">南屿商贸虚构样例 · 月约 300 笔 / IDR 12 亿 · 目标 BCA、BRI、Mandiri · 周末 15 分钟内到账为客户目标。</p>':'')+
 '<h3>AI 渠道推荐 <span class="badge blue">离线模拟 · 官方资料对比</span></h3>'+
 callout('先验证 Xendit，同时询问 DOKU','按本案的银行覆盖、周末时效和逐笔状态需求排序。Xendit 的公开文档最便于逐项验证；若备付、准入或周末测试不达标，再调整优先级。')+
 table(['候选机构','公开能力','优先核实','官方来源'],providers)+
 '<p class="footnote">BI-FAST 是印尼央行的实时零售支付基础设施。机构公开时效与底层能力用于筛选，签约后服务范围、SLA 和全包报价仍待核实。'+sourceLink('https://www.bi.go.id/en/fungsi-utama/sistem-pembayaran/ritel/infrastruktur/default.aspx','印尼央行 BI-FAST')+'</p>'+
 '<h3>渠道对接任务书</h3>'+table(['负责人','下一步与验收'],[
  ['商务与合规','发同口径询价：可签约主体、是否允许供应商货款、资金来源与账户要求、预存款、报价、税费与结算安排。'],
  ['产品与研发','拿沙箱、银行及限额清单，跑工作日与周末的 BCA、BRI、Mandiri。验证账户校验、幂等、防重复付款、超时查单、退回和日终对账。记录到账 P95、成功率及退回耗时。'],
  ['业务评估','用同一笔量比较每月总成本：下发费、换汇价差、备付成本和退回处理。核实实际可转化月量，达到试点标准后回原客户复评。']
 ]);
}
function reqView(r){
 const cap=E.getCapability(state,r.key);
 const outline=productOutlines[r.key];
 show(r.title,r.id+' · 独立产品需求',
  '<div class="detail-meta">'+badge(r.status,r.version?'green':'amber')+badge(requirementKind(r.key),'blue')+'</div>'+
  '<h3>需求范围</h3>'+doc(r.detail||r.title)+
  (cap?callout('已导入 '+esc(cap.version),esc(cap.country)+' / '+esc(cap.currency)+' · '+esc(cap.scope)):'')+
  (r.key==='idr-local-payout'?channelBrief(r):outline?'<h3>产品需求文档框架</h3>'+table(['章节','建议初稿'],outline):'')+
  '<h3>关联客户</h3>'+table(['客户','原方案','复评'],r.caseIds.map(id=>{
   const c=E.findCase(state,id),p=E.planFor(state,id);
   return [esc(c.name)+'<small>'+id+' · '+esc(c.country)+' / '+esc(c.currency)+'</small>',p?btn('plan',p.id,p.id):'未建立',btn('analyze-case','回原案例复评',id,'subtle')];
  }))+(outline?'<div class="actions mt">'+btn(r.key==='platform-split'?'go-radar':'go-history','前往列表查看演示能力更新入口')+'</div>':''),{kind:'req',id:r.id});
}
function capView(){
 show('演示能力目录','当前版本 '+capName(),table(['产品','当前演示范围'],[
  ['小币种收款＋换汇＋跨境人民币','按人工核验及方案审核条件'],['批量海外付款','按受益人、交易依据及渠道时效核验'],['VCC','演示币种 '+E.cardCurrencies.join(' / ')+'，仍需确认受理'],
  ['订单级付款回执 API',state.receiptCap?esc(state.receiptCap.version)+' · '+esc(state.receiptCap.country)+' / '+esc(state.receiptCap.currency):'当前未覆盖'],
  ['平台分账',state.cap?esc(state.cap.version)+' · '+esc(state.cap.country)+' / '+esc(state.cap.currency):'当前未覆盖'],
  ['印尼 IDR 本地银行下发','待渠道调研与准入验证']
 ])+'<p class="footnote">均为虚构目录，不表示已开放真实产品、渠道或资质。</p>');
}
function historyCapabilityPreview(c){
 const live=!!state.receiptCap,ready=c.analysis.status==='ready';
 show('产品能力更新 · '+c.name,c.id+' · 历史洞察',
  callout('更新前 · 能力缺口','客户原有 HKD 海外付款可以执行。每月约 32 笔付款的回执需人工逐单匹配，旧目录缺少按订单号回传状态、凭证和失败原因的接口。')+
  callout(live?(ready?'当前 · 可推荐':'当前 · '+E.statuses[c.analysis.status]):'本次更新 · 香港 HKD 逐单付款回执 API',
   live?esc(c.analysis.rationale):'启用后，系统按案例已有条件重新分析，判断能否生成自动回执方案。')+
  '<div class="actions mt">'+btn('case',live?'查看客户案例':'查看原案例并登记需求',c.id)+
  (live?'':btn('catalog-apply','确认更新产品能力','history','primary'))+'</div>');
}
function revealResult(r,kind){
 if(kind==='case')caseView(r.id);else if(kind==='plan')offer(E.findPlan(state,r.id));else if(kind==='req')reqView(state.requirements.find(x=>x.id===r.id));
 toast(r.message);
}
function radarImportSummary(r){
 const rows=r.featuredIds.map(id=>E.findCase(state,id));
 show('演示样例已导入','跨源雷达 · 5 条样例',
  '<p>本次导入包含以下两条能力场景。点开可查看需求及后续操作。</p>'+
  table(['客户','机会判断','跟进状态','操作'],rows.map(c=>[
   '<b>'+esc(c.name)+'</b><small>'+esc(c.country)+' / '+esc(c.currency)+'</small>',
   badge(E.statuses[c.analysis.status],c.analysis.status)+'<small>'+esc(c.analysis.title)+'</small>',
   progressLinks(c.id),btn('radar-imported-case','查看'+esc(c.name),c.id,'subtle')
  ]))+'<div class="actions mt">'+btn('close','查看全部线索','','primary')+'</div>');
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const a=b.dataset.action,id=b.dataset.id;
 try{
  if(a.startsWith('go-')){close();return route(a.slice(3));}
  if(a==='close')return close();
  if(a==='clear'){filter={};page=1;return render();}
  if(a==='page'){page=Number(id);return render();}
  if(a==='history-stage'){historyStage=id;filter={};page=1;return render();}
  if(a==='channel-sample')return revealResult(apply('channel-sample'),'req');
  if(a==='history-batch'||a==='radar-samples'){
   filter={};page=1;
   if(a==='history-batch'){historyStage='results';return toast(apply('history').message);}
   return radarImportSummary(apply('radar-samples'));
  }
  if(a==='radar-imported-case')return radarCase(E.findCase(state,id),true);
  if(a==='catalog-upgrade'){
   if(id==='history'){
    filter={};page=1;
    const r=apply('history-capability-sample');
    return historyCapabilityPreview(E.findCase(state,r.id));
   }
   return toast(apply('catalog-upgrade',{scope:id}).message);
  }
  if(a==='catalog-apply'){
   const result=apply('catalog-upgrade',{scope:id});
   const sample=state.cases.find(c=>c.id==='H21');
   historyCapabilityPreview(sample);
   return toast(result.message);
  }
  if(a==='new'||a==='fill-intake')return intake(id,a==='fill-intake');
  if(a==='radar-demo'){
   const sample=E.sampleIntakes[id];
   const previous=state.cases.find(c=>c.source===id&&c.name===sample.name&&c.notes===sample.notes);
   if(previous)return radarCase(previous);
   return revealResult(apply('new',{...sample,source:id,mock:true}),'case');
  }
  if(a==='case')return caseView(id);
  if(a==='facts')return facts(id);
  if(a==='history-proof')return historyProof(id);
  if(a==='history-proof-sample'){
   const c=E.findCase(state,id),g=E.historyEvidence(c),f=$('#dialog form[data-command=history-verify]');
   f.elements.proof.value=g.sample;f.elements.mock.checked=true;
   f.querySelectorAll('[name=checks]').forEach(x=>x.checked=true);
   if(g.resolve){f.elements.type.value='payout';f.elements.country.value='中国香港';f.elements.currency.value='HKD';}
   return toast('已填入该商户的虚构核验材料，可保存复判。');
  }
  if(a==='economics')return economicsForm(E.findCase(state,id));
  if(a==='plan-economics'){
   const plan=E.findPlan(state,id);return economicsForm(E.findCase(state,plan.caseId),plan);
  }
  if(a==='economics-sample'){
   const f=$('#dialog form[data-command=economics]'),sample=E.estimateExample(E.findCase(state,id));
   for(const [key,val] of Object.entries(sample))if(f.elements[key]&&!f.elements[key].value)f.elements[key].value=val;
   return toast('已填入虚构样例；原有数据未覆盖。');
  }
  if(a==='guide')return guide(id);
  if(a==='proof-sample'){
   const f=$('#dialog form[data-command=radar-verify]'),type=f.elements.type.value;
   f.elements.proof.value=E.proofSamples[type];f.elements.sample.value='yes';
   f.querySelectorAll('[name=checks]').forEach(x=>x.checked=true);
   f.elements.mock.checked=true;
   return toast('已填入虚构材料；核对后生成详细方案。');
  }
  if(a==='plan')return offer(E.findPlan(state,id));
  if(a==='req')return reqView(state.requirements.find(x=>x.id===id));
  if(a==='cap-view')return capView();
  if(a==='analyze-case')return revealResult(apply('analyze',{id}),'case');
  if(a==='generate')return revealResult(apply('generate',{id}),'plan');
  if(a==='start')return revealResult(apply('start',{id,mock:true}),'plan');
  if(a==='request'){
   const existing=state.requirements.find(x=>x.key===gapKey(E.findCase(state,id)?.analysis)&&x.caseIds.includes(id));
   if(existing)return reqView(existing);
   return revealResult(apply('request',{id}),'req');
  }
  if(a==='custom-request-form')return show('登记产品需求',id+' · 独立需求记录',form('custom-request',id,
   field('title','需求名称','','maxlength="100" required')+area('detail','业务痛点与证据','','required')+
   '<p class="footnote">需求登记不会开放任何产品能力，也不会改写现有方案。</p>','保存产品需求'));
  if(a==='reset')return show('重置当前演示','仅清除 v5.8 的本机状态',form('reset','',
   '<p>重新载入默认虚构案例，清空本机 v5.8 的方案、产品需求和成单回执；旧版本不受影响。</p>','确认重置'));
  if(a==='card-form')return cardForm(E.findPlan(state,id));
  if(a.endsWith('-form'))return workflow(a.slice(0,-5),E.findPlan(state,id));
 }catch(err){toast(err.message);}
});
document.addEventListener('submit',e=>{
 const f=e.target,act=f.dataset.command;if(!act)return;
 e.preventDefault();const fd=new FormData(f),p=Object.fromEntries(fd);p.id=f.dataset.id;
 try{
  if(act==='source-filter'){sourceFilter=p.source;return render();}
  if(act==='filter'){filter=p;page=1;return render();}
  if(act==='reset'){state=E.fresh();sourceFilter='';historyStage='';filter={};page=1;close();route('overview');return toast(persist()?'演示已重置':'重置完成，未能保存到浏览器');}
  p.mock=fd.has('mock');p.verified=fd.has('verified');
  if(['new','facts','radar-verify','history-verify'].includes(act)){
   if(f.dataset.reading==='yes')return toast('请等待文件读取完成');
   if(attachments.length&&!p.mock)return toast('请确认附件均为虚构。');
   p.files=attachments.map(x=>x.name);
  }
  if(act==='new')p.source=p.id;
  if(['radar-verify','history-verify'].includes(act)){p.checks=fd.getAll('checks');p.sample=p.sample==='yes';}
  for(const k of ['volume','bps','ops','limit','single','count'])if(!['facts','economics'].includes(act)&&fd.has(k))p[k]=Number(p[k]);
  const r=apply(act,p);
  if(act==='new'){close();route('radar');return revealResult(r,'case');}
  revealResult(r,r.kind||(['facts','history-verify','economics'].includes(act)?'case':act==='custom-request'?'req':'plan'));
  if(act==='card'||act==='finish')$('#dialog '+(act==='card'?'.card-preview':'.receipt'))?.scrollIntoView({block:'center'});
 }catch(err){toast(err.message);}
});
// Minimal offline DOCX document.xml reader; no document macros or linked objects are opened.
async function wordText(file){
 const bytes=new Uint8Array(await file.arrayBuffer()),dv=new DataView(bytes.buffer);
 let end=bytes.length-22;
 while(end>=Math.max(0,bytes.length-65557)&&dv.getUint32(end,true)!==0x06054b50)end--;
 if(end<Math.max(0,bytes.length-65557))throw Error('未找到DOCX目录');
 let pos=dv.getUint32(end+16,true);
 for(let i=0;i<dv.getUint16(end+10,true);i++){
  if(pos+46>bytes.length||dv.getUint32(pos,true)!==0x02014b50)break;
  const len=dv.getUint16(pos+28,true),ex=dv.getUint16(pos+30,true),comment=dv.getUint16(pos+32,true),name=new TextDecoder().decode(bytes.subarray(pos+46,pos+46+len));
  if(name==='word/document.xml'){
   const local=dv.getUint32(pos+42,true),size=dv.getUint32(pos+20,true),expanded=dv.getUint32(pos+24,true),method=dv.getUint16(pos+10,true);
   if(expanded>4000000||local+30>bytes.length||dv.getUint32(local,true)!==0x04034b50)break;
   const start=local+30+dv.getUint16(local+26,true)+dv.getUint16(local+28,true);
   if(start+size>bytes.length||![0,8].includes(method))break;
   let xml;
   if(method===0)xml=new TextDecoder().decode(bytes.subarray(start,start+size));
   else{
    const reader=new Blob([bytes.subarray(start,start+size)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    const dec=new TextDecoder();xml='';let read=0;
    for(;;){const {done,value}=await reader.read();if(done)break;read+=value.length;if(read>4000000){await reader.cancel();throw Error('DOCX正文超出大小限制');}xml+=dec.decode(value,{stream:true});}
    xml+=dec.decode();
   }
   const docx=new DOMParser().parseFromString(xml,'application/xml');
   const paragraphs=[...docx.getElementsByTagNameNS('*','p')];
   const result=paragraphs.map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).join('\n').trim();
   if(!result)throw Error('DOCX无可读取正文');return result;
  }
  pos+=46+len+ex+comment;
 }
 throw Error('无法读取该DOCX正文');
}
document.addEventListener('change',async e=>{
 const input=e.target,f=input.closest('form');if(!f)return;
 if(f.dataset.command==='radar-verify'&&input.name==='type')return guide(f.dataset.id,input.value);
 if(input.id!=='caseFilesV4')return;
 if(!f.elements.mock.checked){input.value='';return toast('请先确认材料均为虚构。');}
 const files=[...input.files];
 if(files.length>5||files.some(x=>x.size>2*1024*1024)){input.value='';return toast('最多5个文件，每个不超过2MB。');}
 release();f.dataset.reading='yes';input.disabled=true;
 const output=$('#caseFilesPreviewV4');output.replaceChildren();
 for(const file of files){
  const name=file.name,ext=name.split('.').pop().toLowerCase();
  if(!['txt','md','csv','docx','pdf','png','jpg','jpeg','webp'].includes(ext))continue;
  const line=document.createElement('div');line.className='pg4-file';output.append(line);line.textContent=name+' · ';
  try{
   if(['txt','md','csv','docx'].includes(ext)){
    const extracted=(ext==='docx'?await wordText(file):await file.text()).trim();
    if(!f.isConnected)return;
    const target=f.elements.communication||f.elements.proof||f.elements.notes;
    const combined=[target.value,'【'+name+'】'+extracted].filter(Boolean).join('\n');
    target.value=combined.slice(0,3000);line.textContent+='已读入文字'+(combined.length>3000?'（超出3000字的部分截断）':'');
   }else if(['png','jpg','jpeg','webp'].includes(ext)){
    const url=URL.createObjectURL(file);previews.push(url);
    const img=document.createElement('img');img.src=url;img.alt='虚构截图预览';line.textContent+='仅预览，请补文字转写';line.append(img);
   }else line.textContent+='已关联，需手动补充正文摘录';
  }catch{if(!f.isConnected)return;line.textContent+='无法提取，请手动粘贴摘录';}
  attachments.push({name});
 }
 input.disabled=false;f.dataset.reading='no';
});
sync();
})();
