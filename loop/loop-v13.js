'use strict';
// Local treasury simulation. Financial products, channel data and receipts are fictional.
pages.ledger=['▤','收益台账','06'];
const demoDayV13='2026-11-08';
const cashFixturesV13={
 USD:[600000,400000,4,1,80000],
 HKD:[2000000,1300000,3,1,250000],
 CNH:[1400000,900000,2.2,2,120000],
 JPY:[65000000,45000000,0.4,3,5000000],
 EUR:[450000,280000,2.6,2,65000],
 GBP:[360000,220000,3.5,1,40000]
};
const typesV13={cash:'短期现金管理',fx:'换汇对向匹配',funding:'备款路径费用优化'};
const productsV13=['换汇','海外付款','VCC清算','跨产品财资'];
const cashActionsV14={queued:'查看产品并确认',subscribed:'模拟到期赎回'};
const cashStageV14=status=>status==='queued'?'待确认申购':stageNameV12(status);
const cashProductV14=(cur,tenor)=>cur+' '+tenor+'天'+(tenor===7?'锁定产品':'现金管理产品');
const cashReadyV14=c=>!s.dirty&&c.eligible&&c.net>0;
const curListV13=Object.keys(cashFixturesV13);
const digitsV13=cur=>cur==='JPY'?0:2;
const precisionV13=(n,cur)=>Number(n.toFixed(digitsV13(cur)));
const moneyV13=(n,cur,dec=digitsV13(cur))=>cur+' '+n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const dayV13=(days=0)=>new Date(Date.parse(demoDayV13+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
function cashStateV13(){
 return s.cashV13??=Object.fromEntries(Object.entries(cashFixturesV13).map(([cur,[balance,reserve,annual,days,event]])=>[cur,{balance,reserve,annual,days,event,extra:0,tenor:days,fee:0,status:'idle'}]));
}
function cashMathV13(cur){
 const p=cashStateV13()[cur],principal=Math.max(0,p.balance-p.reserve-p.extra),eligible=principal>0&&p.tenor<=p.days;
 const gross=eligible?principal*p.annual/100*p.tenor/365:0;
 return {...p,cur,principal,eligible,gross,net:eligible?precisionV13(gross-p.fee,cur):0,id:'MOCK-CASH-'+cur};
}
const cashCurV13=()=>s.cashCurV13??='USD';
const cashesV13=()=>curListV13.map(cashMathV13);
const previousPendingV13=pendingV10,previousEffortV13=effortV10;
pendingV10=function(){return previousPendingV13()+cashesV13().filter(c=>cashActionsV14[c.status]).length;};
effortV10=function(){
 const e=previousEffortV13(),count=cashesV13().filter(c=>c.status==='redeemed').length;
 e.counts.cash+=count;e.before+=count*s.effortV10.cash[0];e.after+=count*s.effortV10.cash[1];e.saved=e.before-e.after;return e;
};
function cashPageV13(){
 const cur=cashCurV13(),c=cashMathV13(cur),locked=c.status!=='idle',done=c.status==='redeemed',ready=cashReadyV14(c);
 const actions=locked?btn(done?'查看收益台账 →':'处理现金待办 →',done?'goto-ledger':'goto-records','primary'):ready?btn('确认安排 · 加入待办','l13-cash-queue','primary'):disabledV12(s.dirty?'请先更新预测':!c.eligible?'不满足资金窗口或本金要求':'无正向净收益');
 const params=locked?'<p>本币种已确认，方案参数锁定。仍可切换并管理其他币种。</p>':
 '<div class="l12-change-actions">'+btn('模拟新增用款 '+moneyV13(c.event,cur,0),'l13-cash-event')+btn('撤回用款变化','l13-cash-clear')+'</div><form id="cashFormV13"><div class="v11-fields">'+
 fieldV11('balance','自有余额 '+cur,c.balance,'min="0" max="1000000000" step="1"')+
 fieldV11('reserve','安全预留 '+cur,c.reserve,'min="0" max="1000000000" step="1"')+
 fieldV11('annual','假设年化 %',c.annual,'min="0" max="20" step="0.1"')+
 fieldV11('days','可用窗口 / 天',c.days,'min="1" max="30" step="1"')+
 fieldV11('tenor','产品期限 / 天',c.tenor,'min="1" max="30" step="1"')+
 fieldV11('fee','费用 '+cur,c.fee,'min="0" max="1000000" step="'+(cur==='JPY'?'1':'0.01')+'"')+
 '</div><button class="btn" type="submit">重新分析资金安排</button></form>';
 return '<div class="l13-currency-bar"><span>管理币种</span>'+tabsV12(curListV13.map(k=>[k,k]),cur,'l13-cur-')+'</div>'+
 '<section class="panel l12-operations"><div class="l12-section"><div><h2>'+cur+' 自有资金安排</h2><small>用款窗口 '+c.days+' 天 · 独立虚构资金池 · 无跨币种调剂</small></div>'+chip(cashStageV14(c.status),done?'green':'amber')+'</div>'+
 '<div class="l12-cash-balances">'+[['公司自有余额',c.balance],['安全预留与新增用款',c.reserve+c.extra],['可安排候选本金',c.principal]].map(([t,n],i)=>'<div class="'+(i===2?'l12-green':'')+'"><span>'+t+'</span><b>'+moneyV13(n,cur,0)+'</b></div>').join('')+'</div>'+
 '<div class="l12-section l12-product-title"><h3>可选产品</h3><small>虚构产品 · 非报价或收益承诺</small></div><div class="l12-products">'+[...new Set([cashFixturesV13[cur][3],7,c.tenor])].map(t=>'<button class="l12-product '+(t===c.tenor?'selected':'')+'" aria-pressed="'+(t===c.tenor)+'" data-action="l13-tenor-'+t+'" '+(locked?'disabled':'')+'><span>'+cashProductV14(cur,t)+'</span><b>'+t+' 天</b><small>'+(t<=c.days?'不超过用款窗口':'超出用款窗口')+' · 假设年化 '+c.annual+'%</small></button>').join('')+'</div>'+
 '<div class="l12-compare"><div><span>产品期限</span><b>'+c.tenor+' 天</b></div><div><span>模拟到期日</span><b>'+dayV13(c.tenor)+'</b></div><div class="l12-compare-result"><span>'+(done?'模拟赎回净收益':c.eligible?'预计净收益':'产品不适配')+'</span><strong id="l13-cash-net">'+moneyV13(c.net,cur)+'</strong></div></div>'+
 '<div class="l12-operation-footer"><span>仅在模拟到期赎回后计入收益台账</span>'+actions+'</div>'+
 noteV12('本金与净收益怎么计算？','<p>候选本金 = 自有余额 − 安全预留 − 新增用款；须大于零。产品期限不得超过用款窗口。预计净收益 = 候选本金 × 假设年化 × 实际模拟持有天数 ÷ 365 − 假设费用。客户、受限、未入账资金不参与。</p>')+
 detailV10('用款变化与演示参数',params)+'</section>';
}
valuePage=function(){
 return l12Head('资金经营','对向换汇匹配与多币种短期现金安排',btn('收益台账','goto-ledger')+btn('处理待办（'+pendingV10()+'）','goto-records','primary'))+
 warning()+tabsV12([['fx','换汇管理'],['cash','现金管理']],s.opsTabV12,'l12-tab-')+(s.opsTabV12==='cash'?cashPageV13():fxWorkV12());
};

function fundingProductsV13(t){
 const due=s.result.rows.find(r=>r.pool===t.pool&&r.slot===t.slot)?.due||[];
 const names=[...new Set(due.map(d=>d.product==='VCC发卡'?'VCC清算':d.product))];
 return names.length===1&&productsV13.includes(names[0])?names[0]:names.length?'跨产品财资':t.channel==='V'?'VCC清算':'海外付款';
}
function fundingEconomicsV13(t){
 // An obsolete plan may reuse its task ID; only the original complete 60k scenario qualifies.
 if(s.cheapPlanV11?.taskId!==t.id||t.pool!=='B-HKD'||t.slot!==2||t.amount!==60000||t.gap!==60000)return null;
 return cheapMathV11();
}
function earningsV13(){
 const f=fxMathV11(),rows=[];
 if(s.fxPairStatus==='executed')rows.push({id:'FX-NET-MOCK-001',receipt:'MOCK-FX-001',date:demoDayV13,type:'fx',product:'换汇',name:'USD/HKD 对向匹配',cur:'HKD',net:f.saving});
 for(const t of s.fundingTasks.filter(t=>t.status==='credited'&&t.economicsV13))
  rows.push({id:t.id,receipt:t.receipt,date:t.creditedAtV13.slice(0,10),type:'funding',product:t.productV13,name:cname(t.channel)+' · 提前备款',cur:t.cur,net:t.economicsV13.saving});
 for(const c of cashesV13().filter(c=>c.status==='redeemed'))
  rows.push({id:c.id,receipt:'MOCK-REDEEM-'+c.cur,date:dayV13(c.tenor),type:'cash',product:'跨产品财资',name:c.cur+' 短期现金管理',cur:c.cur,net:c.net});
 return rows.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
}
function groupedV13(rows,key){
 const groups=new Map();
 for(const row of rows){const label=typeof key==='function'?key(row):row[key];if(!groups.has(label))groups.set(label,[]);groups.get(label).push(row);}
 return groups;
}
function sumsV13(rows,key='net'){
 return [...groupedV13(rows,'cur')].map(([cur,list])=>[cur,precisionV13(list.reduce((n,r)=>n+r[key],0),cur)]);
}
function amountListV13(rows,key='net',empty='—'){
 return sumsV13(rows,key).map(([cur,n])=>'<span class="l13-sum">'+moneyV13(n,cur,key==='net'?digitsV13(cur):0)+'</span>').join('')||empty;
}
function metricsV13(rows=earningsV13()){
 const cost=rows.filter(r=>r.type!=='cash'),cash=rows.filter(r=>r.type==='cash'),e=effortV10();
 return '<section class="l12-metrics l13-metrics">'+[
 ['费用优化',amountListV13(cost,'net','HKD 0.00'),'换汇核销与备款回执确认后计入','fees'],
 ['现金管理收益',amountListV13(cash,'net','USD 0.00'),'模拟到期赎回后计入 · 按原币种','cash'],
 ['待处理事项',pendingV10()+' <small>项</small>','经营与调拨统一处理','pending'],
 ['释放处理时间',e.saved+' <small>分钟</small>','本轮假设估算 · 非实测','effort']
 ].map(([t,n,d,k])=>'<article class="l12-metric '+(k==='fees'||k==='cash'?'l12-profit':'')+'" data-metric="'+k+'"><span>'+t+'</span><strong>'+n+'</strong><small>'+d+'</small></article>').join('')+'</section>';
}
function earningsTableV13(rows){
 return rows.length?'<div class="table-wrap l12-table"><table class="l13-earnings-table"><thead><tr><th>确认日 / 单据</th><th>产品线</th><th>收益类型</th><th>模拟完成金额</th></tr></thead><tbody>'+rows.map(r=>'<tr data-earning="'+esc(r.id)+'"><td><b>'+esc(r.name)+'</b><small>'+r.date+' · '+esc(r.id)+'</small><small>回执 '+esc(r.receipt)+'</small></td><td>'+esc(r.product)+'</td><td>'+typesV13[r.type]+'</td><td class="amount l12-green">'+moneyV13(r.net,r.cur)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="l12-empty">该范围暂无已确认收益。完成模拟核销、到账或赎回后可查看。</div>';
}
const oldOverviewV13=overview;
overview=function(){
 const rows=earningsV13(),cash=cashMathV13(cashCurV13()),old=oldOverviewV13();
 // Reuse the established forecast and funding cards, but use one ledger source for confirmed amounts.
 const before=old.indexOf('<section class="l12-metrics">'),grid=old.indexOf('<div class="l12-home-grid">'),ledger=old.indexOf('<h2>收益台账</h2>');
 const endGrid=old.lastIndexOf('<section class="panel">',ledger);
 let cards=old.slice(grid,endGrid);
 cards=cards.replace(/USD [\d,]+ 自有资金空档/,moneyV13(cash.principal,cash.cur,0)+' 自有资金空档')
  .replace(/(<div class="l12-op-number"><b>)USD [\d.,]+(<\/b><small>)[^<]+/,(_,a,b)=>a+moneyV13(cash.net,cash.cur)+b+cashStageV14(cash.status))
  .replace(/\d+(?:\.\d+)?天窗口 · 匹配可及时赎回产品/,cash.days+'天窗口 · 匹配可及时赎回产品');
 if(rows.some(r=>r.type==='funding'))cards=cards.replace('路径优化预计增量','路径费用优化 · 模拟已确认');
 return old.slice(0,before)+metricsV13(rows)+cards+
 '<section class="panel"><div class="l12-section"><div><h2>最近确认收益</h2><small>仅展示本轮模拟完成记录 · 不跨币种合计</small></div>'+btn('打开收益台账 →','goto-ledger','primary')+'</div>'+earningsTableV13(rows.slice(0,4))+'</section>'+efficiencyV10();
};

function taskStepNewV13(t){
 if(t.status==='confirmed')return btn('查询渠道并确认','l13-fund-open','primary');
 if(t.status==='sent')return btn('接收模拟到账回执','l13-fund-receipt','primary');
 if(t.status==='credited')return '<span class="l12-green">✓ 已到账</span>';
 return btn('返回备款建议','goto-advice');
}
function tasksV13(){
 const tasks=taskRowsV12().map(row=>{
  if(!row.key)return row;
  const t=s.fundingTasks.find(x=>x.key===row.key),eco=t.economicsV13||fundingEconomicsV13(t);
  return {...row,action:taskStepNewV13(t),state:t.status==='confirmed'?'待渠道确认':row.state,
   contribution:eco?moneyV13(eco.saving,t.cur):'—',
   detail:'来源 '+esc(t.sourceId)+' → '+esc(cname(t.channel))+' · 最迟 '+times[t.slot][1]+
   (t.routeV13?' · 预计 '+t.routeV13.eta:'')+(t.receipt?' · 回执 '+esc(t.receipt):'')};
 });
 for(const c of cashesV13().filter(c=>c.status!=='idle')){
  const done=c.status==='redeemed';
  tasks.push({type:typesV13.cash,id:c.id,finished:done,title:cashProductV14(c.cur,c.tenor),amount:moneyV13(c.principal,c.cur,0),state:cashStageV14(c.status),
   action:done?'<span class="l12-green">✓ 已赎回</span>':btn(cashActionsV14[c.status],'l13-cash-step-'+c.cur,'primary'),
   detail:'模拟到期日 '+dayV13(c.tenor)+(c.subscription?' · 申购回执 '+c.subscription:'')+(done?' · 回执 MOCK-REDEEM-'+c.cur:''),contribution:moneyV13(c.net,c.cur)});
 }
 return tasks;
}
records=function(){
 const all=tasksV13(),filter=s.recordTabV12,rows=all.filter(t=>filter==='pending'?!t.finished:filter==='done'?t.finished:true);
 return l12Head('待办记录','集中处理核销、现金安排及调拨回执',btn('查看收益台账 →','goto-ledger'))+warning()+
 tabsV12([['all','全部（'+all.length+'）'],['pending','待处理（'+all.filter(t=>!t.finished).length+'）'],['done','已完成（'+all.filter(t=>t.finished).length+'）']],filter,'l12-record-')+
 '<section class="panel"><div class="l12-section"><h2>处理清单</h2><small>调拨确认渠道；现金管理确认产品后模拟申购</small></div>'+
 (rows.length?'<div class="table-wrap l12-table"><table><thead><tr><th>事项 / 单据</th><th>金额</th><th>预计增量</th><th>当前状态</th><th>下一步</th></tr></thead><tbody>'+rows.map(t=>'<tr '+(t.key?'data-task-key="'+esc(t.key)+'"':'')+'><td><b>'+t.title+'</b><small>'+t.type+' · '+esc(t.id)+'</small>'+noteV12('操作依据',t.detail)+'</td><td class="amount">'+t.amount+'</td><td class="amount">'+t.contribution+'</td><td>'+chip(t.state,t.finished?'green':'amber')+'</td><td>'+t.action+'</td></tr>').join('')+'</tbody></table></div>':
 '<div class="l12-empty">当前筛选下暂无事项。<div>'+btn('资金经营','goto-value')+btn('备款调拨','goto-advice')+'</div></div>')+'</section>'+
 detailV10('操作日志（'+s.logs.length+'条）','<div class="timeline">'+s.logs.map(x=>'<div class="log-item"><span class="log-time">'+x.at+'</span><span class="log-dot"></span><div class="log-copy"><b>'+esc(x.what)+'</b></div></div>').join('')+'</div>');
};

const filtersV13=()=>s.ledgerFiltersV13??={from:'',to:'',product:'',type:'',group:'date'};
const inDatesV13=(date,f)=>(!f.from||date>=f.from)&&(!f.to||date<=f.to);
const groupLabelsV13={date:'确认日期',product:'产品线',type:'收益类型'};
function selectV13(key,label,opts,active){
 return '<label>'+label+'<select name="'+key+'">'+opts.map(([id,text])=>'<option value="'+id+'" '+(id===active?'selected':'')+'>'+text+'</option>').join('')+'</select></label>';
}
function trendV13(rows){
 const currencies=[...groupedV13(rows,'cur').keys()],cur=currencies.includes(s.trendCurV13)?s.trendCurV13:currencies[0];
 if(!cur)return '<div class="l12-empty">完成模拟操作后，按确认日期查看分币种走势。</div>';
 const grouped=[...groupedV13(rows.filter(r=>r.cur===cur),'date')].reverse();
 const series=grouped.map(([date,list])=>[date,sumsV13(list)[0][1]]);
 const max=Math.max(1,...series.map(x=>x[1]));
 return '<div class="l13-trend-controls"><small>单币种比较 · '+cur+'</small>'+tabsV12(currencies.map(c=>[c,c]),cur,'l13-trend-')+'</div>'+
 '<div class="l13-series">'+series.map(([date,n])=>'<div class="l13-bar-row"><span>'+date+'</span><div class="l13-track" aria-hidden="true"><i style="width:'+n/max*100+'%"></i></div><b>'+moneyV13(n,cur)+'</b></div>').join('')+'</div>';
}
function transferBoardV13(f){
 const rows=s.fundingTasks.filter(t=>!['stale','source-needed'].includes(t.status)&&
  inDatesV13(t.creditedAtV13?.slice(0,10)||demoDayV13,f)&&(!f.product||f.product===(t.productV13||fundingProductsV13(t))));
 const credited=rows.filter(t=>t.status==='credited'),sent=rows.filter(t=>t.status==='sent');
 const byChannel=[...groupedV13(rows,t=>t.channel+' / '+t.cur)];
 return '<section class="panel"><div class="l12-section"><div><h2>备款调拨分析</h2><small>按日期区间和产品线筛选 · 已到账按回执日期，其余按演示发起日 · 不受收益类型筛选影响</small></div>'+btn('打开待办','goto-records')+'</div>'+
 '<div class="l13-transfer-summary"><div><span>已确认调拨</span><b>'+rows.length+' 笔</b></div><div><span>在途待回执</span><b>'+sent.length+' 笔</b></div><div><span>模拟已到账</span><b>'+credited.length+' 笔</b></div><div><span>到账本金 · 不计收益</span><b>'+amountListV13(credited,'amount')+'</b></div></div>'+
 (rows.length?'<div class="table-wrap l12-table"><table><thead><tr><th>目标渠道 / 币种</th><th>待确认渠道</th><th>在途</th><th>到账笔数</th><th>已到账本金</th><th>模拟路径节省</th></tr></thead><tbody>'+byChannel.map(([,list])=>{
  const t=list[0],arrived=list.filter(x=>x.status==='credited'),total=arrived.reduce((n,x)=>n+x.amount,0),net=arrived.reduce((n,x)=>n+(x.economicsV13?.saving||0),0);
  return '<tr><td><b>'+cname(t.channel)+'</b><small>'+t.cur+'</small></td><td>'+list.filter(x=>x.status==='confirmed').length+'</td><td>'+list.filter(x=>x.status==='sent').length+'</td><td>'+arrived.length+'</td><td class="amount">'+moneyV13(total,t.cur,0)+'</td><td class="amount">'+moneyV13(net,t.cur)+'</td></tr>';
 }).join('')+'</tbody></table></div>':'<div class="l12-empty">该范围暂无调拨记录。可在备款调拨中确认一笔建议。</div>')+'</section>';
}
function ledgerPageV13(){
 const f=filtersV13(),rows=earningsV13().filter(r=>inDatesV13(r.date,f)&&(!f.product||f.product===r.product)&&(!f.type||f.type===r.type));
 const groups=groupedV13(rows,r=>f.group==='type'?typesV13[r.type]:r[f.group]);
 const card=(title,value,sub)=>'<article class="l12-metric"><span>'+title+'</span><strong>'+value+'</strong><small>'+sub+'</small></article>';
 return l12Head('收益台账','按日期、产品线与收益类型逐层核对模拟经营结果',btn('资金总览','goto-overview')+btn('待办记录','goto-records'))+
 '<section class="panel l13-filters"><form id="ledgerFiltersV13"><label>开始日期<input type="date" name="from" value="'+esc(f.from)+'"></label><label>结束日期<input type="date" name="to" value="'+esc(f.to)+'"></label>'+
 selectV13('product','产品线',[['','全部产品线'],...productsV13.map(x=>[x,x])],f.product)+
 selectV13('type','收益类型',[['','全部收益类型'],...Object.entries(typesV13)],f.type)+
 selectV13('group','明细分组',Object.entries(groupLabelsV13),f.group)+
 '<div class="l13-filter-actions"><button type="submit" class="btn primary">应用</button>'+btn('清除','l13-filter-reset')+'</div></form></section>'+
 '<section class="l12-metrics l13-ledger-metrics">'+card('费用优化',amountListV13(rows.filter(r=>r.type!=='cash')),'换汇对向匹配 + 备款路径优化')+card('现金管理收益',amountListV13(rows.filter(r=>r.type==='cash')),'按模拟赎回日期确认')+card('已确认收益记录',rows.length+' <small>笔</small>','仅计入模拟完成事项')+'</section>'+
 '<section class="panel"><div class="l12-section"><div><h2>收益走势</h2><small>按确认日汇总，现金管理取模拟到期日；币种分别计量</small></div>'+chip('本轮模拟','blue')+'</div>'+trendV13(rows)+'</section>'+
 transferBoardV13(f)+
 '<section class="panel"><div class="l12-section"><div><h2>收益明细</h2><small>按'+groupLabelsV13[f.group]+'汇总 · 展开核对单据和回执</small></div></div>'+
 (groups.size?[...groups].map(([label,list])=>'<details class="l13-group"><summary><b>'+esc(label)+'</b><span>'+list.length+' 笔</span><span class="l13-group-amount">'+amountListV13(list)+'</span></summary>'+earningsTableV13(list)+'</details>').join(''):earningsTableV13([]))+
 '<p class="v10-footnote">换汇以模拟核销、调拨以模拟到账、现金管理以模拟赎回为确认节点。各币种不混加，调拨本金不计作收益；刷新或重置清空本轮记录。</p></section>';
}
const modalV13=document.createElement('dialog');
modalV13.className='l13-dialog';modalV13.id='channelLookupV13';modalV13.setAttribute('aria-labelledby','lookupTitleV13');
document.body.append(modalV13);
function fundCurrentV13(t){
 return t&&t.status==='confirmed'&&!s.dirty&&t.version===s.version&&t.amount>0&&sourceRemainingV08(t.pool,t.key)>=t.amount;
}
function fundingRouteV13(t){
 const day=dayV13(t.slot===3?1:0);
 return {source:t.sourceId,target:cname(t.channel),eta:day+' '+({1:'11:00',2:'15:00',3:'09:00'})[t.slot],version:s.version};
}
function showLookupV13(t,result){
 modalV13.dataset.key=t.key;
 modalV13.dataset.queried=result?'yes':'no';
 const route=fundingRouteV13(t),pool=pools.find(p=>p.id===t.pool);
 modalV13.innerHTML='<div class="l12-section"><div><h2 id="lookupTitleV13">渠道资金确认</h2><small>'+esc(t.id)+' · 模拟渠道查询</small></div><button class="btn" type="button" data-action="l13-fund-close" aria-label="关闭">关闭</button></div>'+
 '<div class="l13-direction"><div><small>调拨来源 · 同币种自有资金</small><b>'+esc(route.source)+'</b></div><span aria-hidden="true">→</span><div><small>目标渠道</small><b>'+esc(route.target)+' / '+t.cur+'</b></div></div>'+
 '<dl><div><dt>调拨金额</dt><dd>'+moneyV13(t.amount,t.cur,0)+'</dd></div><div><dt>最迟备款时间</dt><dd>'+times[t.slot][1]+'</dd></div>'+
 '<div><dt>来源可用（含本单预留）</dt><dd>'+(result?moneyV13(sourceRemainingV08(t.pool,t.key),t.cur,0):'待查询')+'</dd></div>'+
 '<div><dt>目标渠道当前可用</dt><dd>'+(result?moneyV13(balance(pool).available,t.cur,0):'待查询')+'</dd></div>'+
 '<div><dt>预计到账（UTC+8 · 模拟）</dt><dd id="l13-eta">'+(result?route.eta:'待查询')+'</dd></div></dl>'+
 '<p class="v10-footnote">确认后直接模拟提交渠道，不再经过单独的财务确认。渠道受理不等于到账。</p>'+
 '<div class="l13-dialog-actions">'+btn(result?'重新查询':'查询渠道资金','l13-fund-query',result?'':'primary')+
 (result?btn('确认方向并模拟提交','l13-fund-submit','primary'):disabledV12('请先查询渠道资金'))+'</div>';
 if(!modalV13.open)modalV13.showModal();
 if(result)modalV13.querySelector('[data-action="l13-fund-submit"]').focus();
}
const cashDialogV14=document.createElement('dialog');
cashDialogV14.className='l13-dialog';
cashDialogV14.id='cashPurchaseV14';
cashDialogV14.setAttribute('aria-labelledby','cashPurchaseTitleV14');
document.body.append(cashDialogV14);
let cashQuoteV14=null;
function showCashPurchaseV14(c){
 if(c.status!=='queued'||!cashReadyV14(c))return toast('当前方案不可申购，请先更新预测并核实资金窗口');
 cashQuoteV14={cur:c.cur,version:s.version,terms:JSON.stringify(c)};
 const fields=[
  ['申购本金',moneyV13(c.principal,c.cur,0)],['产品期限',c.tenor+' 天'],
  ['假设年化',c.annual+'%'],['模拟到期 / 赎回日',dayV13(c.tenor)],
  ['可用资金窗口',c.days+' 天'],['预计毛收益',moneyV13(c.gross,c.cur)],['假设费用',moneyV13(c.fee,c.cur)]
 ];
 cashDialogV14.innerHTML='<div class="l12-section"><div><h2 id="cashPurchaseTitleV14">确认现金理财申购</h2><small>'+c.id+' · 虚构产品</small></div>'+btn('取消','l13-cash-cancel')+'</div>'+
 '<div class="l14-cash-product"><div><small>拟申购产品</small><b>'+cashProductV14(c.cur,c.tenor)+'</b></div>'+chip(c.cur+' · 到期赎回','blue')+'</div>'+
 '<dl>'+fields.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('')+'</dl>'+
 '<div class="l14-cash-total"><span>预计净收益</span><strong id="cashExpectedNetV14">'+moneyV13(c.net,c.cur)+'</strong></div>'+
 '<p class="v10-footnote">确认后直接模拟申购，无单独财务确认。申购不计收益，模拟到期赎回后才更新资金总览及收益台账。以上为演示假设，非实际报价或收益承诺。</p>'+
 '<div class="l13-dialog-actions">'+btn('确认并模拟申购','l13-cash-submit','primary')+'</div>';
 if(!cashDialogV14.open)cashDialogV14.showModal();
}
const resetOldV13=reset;
reset=function(quiet=false){
 if(modalV13.open)modalV13.close();
 if(cashDialogV14.open)cashDialogV14.close();
 cashQuoteV14=null;resetOldV13(quiet);
};
document.addEventListener('submit',e=>{
 if(e.target.id==='cashFormV13'){
  e.preventDefault();const p=cashStateV13()[cashCurV13()];
  if(p.status!=='idle'||!e.target.reportValidity())return;
  const data=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,Number(v)]));
  if(Object.values(data).some(v=>!Number.isFinite(v)))return;
  Object.assign(p,data);log('重新计算 '+cashCurV13()+' 独立现金管理候选');render();
 }
 if(e.target.id==='ledgerFiltersV13'){
  e.preventDefault();const next=Object.fromEntries(new FormData(e.target));
  if(next.from&&next.to&&next.from>next.to)return toast('开始日期不能晚于结束日期');
  s.ledgerFiltersV13=next;render();
 }
});
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]'),a=el?.dataset.action;
 if(!a?.startsWith('l13-'))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(a.startsWith('l13-cur-')){const cur=a.slice(8);if(curListV13.includes(cur)){s.cashCurV13=cur;render();}return;}
 if(a.startsWith('l13-trend-')){s.trendCurV13=a.slice(10);render();return;}
 if(a==='l13-filter-reset'){s.ledgerFiltersV13=null;s.trendCurV13=null;render();return;}
 if(a==='l13-cash-cancel'){cashQuoteV14=null;cashDialogV14.close();return;}
 if(a==='l13-cash-submit'){
  if(!cashDialogV14.open||!cashQuoteV14)return;
  const {cur,version,terms}=cashQuoteV14,c=cashMathV13(cur);
  cashQuoteV14=null;cashDialogV14.close();
  if(c.status!=='queued'||!cashReadyV14(c)||s.version!==version||JSON.stringify(c)!==terms)return toast('申购条件已变化，请重新打开产品确认弹窗');
  const p=cashStateV13()[cur];
  p.status='subscribed';p.subscription='MOCK-SUB-'+cur;
  log('确认 '+cashProductV14(cur,c.tenor)+' 并取得模拟申购回执 '+p.subscription+'；尚未计入收益');
  render();toast('模拟申购完成，收益待到期赎回后计入');return;
 }
 if(a.startsWith('l13-cash-step-')){
  const cur=a.slice(14),p=cashStateV13()[cur];
  if(!p)return;
  if(p.status==='queued')return showCashPurchaseV14(cashMathV13(cur));
  if(p.status!=='subscribed')return;
  p.status='redeemed';log('模拟到期赎回：MOCK-REDEEM-'+cur+' · 模拟净收益 '+moneyV13(cashMathV13(cur).net,cur));
  render();toast('模拟赎回已确认，资金总览及收益台账已更新');return;
 }
 if(a.startsWith('l13-cash-')||a.startsWith('l13-tenor-')){
  const cur=cashCurV13(),p=cashStateV13()[cur],c=cashMathV13(cur);
  if(p.status!=='idle')return;
  if(a==='l13-cash-queue'){
   if(!cashReadyV14(c))return toast('当前方案不可确认');
   p.status='queued';log('确认 '+c.id+' 候选 '+moneyV13(c.principal,cur,0)+'；尚未计收益');
  }else if(a==='l13-cash-event')p.extra=p.event;
  else if(a==='l13-cash-clear')p.extra=0;
  else if(a.startsWith('l13-tenor-'))p.tenor=Number(a.slice(10));
  render();return;
 }
 if(a==='l13-fund-close'){modalV13.close();return;}
 const key=el.closest('[data-task-key]')?.dataset.taskKey||modalV13.dataset.key,t=s.fundingTasks.find(x=>x.key===key);
 if(a==='l13-fund-receipt'){
  if(t?.status!=='sent'||!t.routeV13)return toast('没有待核对的模拟回执');
  t.status='credited';t.receipt='MOCK-RCPT-'+t.id.slice(-3);t.creditedAtV13=t.routeV13.eta;
  log('模拟到账 '+t.receipt+' · '+t.creditedAtV13+' · 重算备款缺口');rerun();toast('模拟到账已确认，资金总览及收益台账已更新');return;
 }
 if(!fundCurrentV13(t)){if(modalV13.open)modalV13.close();return toast('建议已变化或来源不足，请返回备款调拨重新核实');}
 if(a==='l13-fund-open'||a==='l13-fund-query'){showLookupV13(t,a==='l13-fund-query');return;}
 if(a==='l13-fund-submit'&&modalV13.open&&modalV13.dataset.queried==='yes'){
  t.routeV13=fundingRouteV13(t);t.productV13=fundingProductsV13(t);t.economicsV13=fundingEconomicsV13(t);t.status='sent';
  modalV13.close();log('确认调拨方向并模拟提交 '+t.id+'；预计 '+t.routeV13.eta+' 到账，尚未入账');render();toast('渠道已模拟受理，等待到账回执');
 }
},true);
document.querySelector('.date-pill').textContent=demoDayV13+' · 演示日';
if(location.hash==='#ledger')route('ledger');else render();
