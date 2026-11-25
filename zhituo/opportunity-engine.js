/* Cross-border Growth Workbench v5.8. Local synthetic inputs only. */
(function(root,build){if(typeof module==='object'&&module.exports)module.exports=build;else root.OpportunityEngine=build(root.GrowthData);})(typeof window==='undefined'?globalThis:window,function(D){
'use strict';
const key='paygent-opportunity-v5-8';
const sources={history:'存量交易',visit:'销售拜访',branch:'分公司需求',external:'外部数据导入'};
const statuses={ready:'可推荐',missing:'待补证',blocked:'能力缺口',keep:'沿用原方案'};
const stages={draft:'待确认并模拟发送',blocked:'待产品升级',sent:'跟进中',won:'模拟已成单',lost:'未成单关闭'};
const bases=['新客户','存量新增业务','内部迁移','原有存量'];
const cardCurrencies=['HKD','USD','EUR','JPY','GBP'];
const upgradeSample={capability:'platform-split',version:'v2',country:'墨西哥',currency:'MXN',mode:'synthetic-pilot',scope:'经核验的平台服务费扣留、底层商户结算和原路退款回退，仅限本演示样例。'};
const receiptUpgrade={capability:'payout-receipt-api',version:'v2',country:'中国香港',currency:'HKD',mode:'synthetic-pilot',scope:'按客户订单号回传单笔付款状态、到账凭证及失败原因。'};
const receiptLead={id:'R01',name:'澜桥供应链',country:'中国香港',currency:'HKD',source:'branch',type:'auto',material:'分公司需求纪要',
 notes:'虚构分公司纪要：潜客计划新增香港仓配付款，要求按客户订单号回传单笔付款状态、到账凭证及失败原因，接回内部订单系统。分公司已在访谈中确认香港受益人、HKD 付款依据、回执字段、签名校验与失败重试要求。',
 communication:'',frequency:'预计每月24笔',files:[],verified:true,proof:'虚构核验：香港受益人和仓配发票一致，客户 IT 已确认订单号、回执字段、回调签名和重试要求。',basis:'新客户',volume:0,bps:12,ops:100};
const splitLead={id:'R02',name:'远汐仓配平台',country:'墨西哥',currency:'MXN',source:'branch',type:'auto',material:'分公司需求纪要',
 notes:'虚构分公司纪要：墨西哥仓配平台统一向买家收款，希望逐笔扣留平台服务费，将余额按结算日分账给入驻服务商，退款时按原分配比例回退。',
 communication:'',frequency:'预计每月120笔',files:[],verified:true,proof:'虚构核验：平台与入驻服务商协议、收款主体、服务费公式、结算时点和退款回退规则均已核对。',basis:'新客户',volume:0,bps:12,ops:100,
 baseline:{mode:'人工计算服务费并逐家核对结算',count:120,oldFee:null,newFee:null,oldMin:8,newMin:3}};
const idrLead={
 id:'R03',name:'南屿商贸',country:'印度尼西亚',currency:'IDR',source:'branch',type:'auto',material:'虚构分公司走访纪要',
 notes:'客户需要印尼 IDR 本地银行下发，向 BCA、BRI、Mandiri 账户支付供应商货款。样例每月 300 笔、合计 IDR 12 亿；要求周末也能付款，目标 15 分钟内到账，并逐笔返回状态及退回原因。',
 communication:'',frequency:'每月约300笔',files:[],verified:true,proof:'样例走访已确认收款银行、供应商货款用途、付款节奏和状态要求。',
 basis:'新客户',volume:0,bps:12,ops:100,baseline:{mode:'按工作日安排境外付款',count:300,oldFee:null,newFee:null,oldMin:null,newMin:null}
};
const capabilityInfo={
 'platform-split':{title:'平台服务费扣留与底层商户结算',detail:'需要服务费扣留、底层商户结算与退款回退；先核对资金归属与主体关系。'},
 'payout-receipt-api':{title:'订单级付款回执 API',detail:'将客户订单号和单笔付款关联，回传状态、到账凭证及失败原因；产品需明确支持的字段、鉴权、重试和渠道范围。'},
 'idr-local-payout':{title:'印尼 IDR 本地银行下发渠道',detail:'补齐印尼盾供应商付款的本地银行路径。优先验证周末到账、目标银行覆盖、逐笔状态与退回对账。'}
};
const sampleIntakes={
 visit:{name:'澄川家居',country:'墨西哥',currency:'MXN',material:'微信聊天记录',notes:'客户：新经销商希望用墨西哥比索付款，目前只支持美元。销售：可否提供买方主体和真实采购依据？客户：希望每周回人民币，相关资料还需核对。'},
 branch:{name:'岚际仓配',country:'中国香港',currency:'HKD',material:'需求文档',notes:'分公司记录：新增香港供应商每周结算，逐笔海外付款不便；希望批量处理、跟踪到账并统一核对费用。受益人资料待确认。'},
 external:{name:'沿湾软件（待访谈）',country:'中国香港',currency:'HKD',material:'截图或外部文档',notes:'外部导入的虚构展会需求：企业为多个项目购买软件订阅，共用卡预算容易超支，希望限额、限次。当前仅行业线索，受理与客户意愿待核实。'}
};
const benchmarks={
 H01:{mode:'逐笔美元电汇（费用按MXN等值）',count:16,oldFee:320,newFee:250,oldMin:12,newMin:6},
 H05:{mode:'逐笔电汇并人工对账',count:8,oldFee:null,newFee:null,oldMin:15,newMin:8},
 H07:{mode:'逐笔银行付款与分散查账',count:48,oldFee:80,newFee:45,oldMin:9,newMin:3},
 H11:{mode:'多个项目共用一张公司卡',count:20,oldFee:20,newFee:22.5,oldMin:12,newMin:4},
 H14:{mode:'人工扣留服务费、逐个核对后结算',count:120,oldFee:null,newFee:null,oldMin:8,newMin:3},
 H17:{mode:'原银行路径与专人对账',count:16,oldFee:null,newFee:null,oldMin:null,newMin:null},
 H21:{mode:'下载批次回执后手工逐单核对',count:32,oldFee:null,newFee:null,oldMin:12,newMin:5}
};
const steps={
 collection:['核验买方、订单与贸易依据','确认本币受理与回款周期','对齐换汇及人民币结算的费用和对账字段'],
 payout:['核验受益人和付款依据','同一时效条件下比价，确认币种与费用','小批量模拟核对状态和到账'],
 localIdrPayout:['确认合作准入与 IDR 备付路径','验证目标银行、周末时效、状态和退回','形成可核验的商务报价与试点验收记录'],
 card:['核实供应商受理、企业自用与拟用币种','确认卡总限额、单笔限额、次数及使用期限','核对授权、退款和对账，不将MCC当作订单限制'],
 receiptApi:['核验主体、受益人与付款依据','确认客户订单号、付款状态和回执字段映射','核对回调鉴权、失败重试和目标时效后做小批量测试'],
 platform:['核验平台、底层商户与资金归属','确认扣费和结算时点、退款退费逻辑','仅在获批演示能力范围内复核路径'],
 mature:['沿用现有渠道，保留后续触发条件'],review:['确认主体、最终收款方和实际业务用途']
};
const text=(v,n=3000)=>String(v??'').trim().slice(0,n),clone=v=>JSON.parse(JSON.stringify(v));
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const assert=(v,m)=>{if(!v)throw Error(m);};
const incremental=p=>bases.slice(0,2).includes(p.basis);
const capabilityKey=type=>({platform:'platform-split',receiptApi:'payout-receipt-api',localIdrPayout:'idr-local-payout'})[type]||'';
const getCapability=(s,key)=>key==='platform-split'?s.cap:key==='payout-receipt-api'?s.receiptCap:null;
const capabilityMatch=(cap,c)=>!!cap&&c.country===cap.country&&c.currency===cap.currency;
const money=v=>Number.isFinite(v)&&v>=0&&v<=1e10;
const findCase=(s,id)=>s.cases.find(c=>c.id===id);
const findPlan=(s,id)=>s.plans.find(p=>p.id===id);
const planFor=(s,id)=>s.plans.find(p=>p.caseId===id);
const eligiblePlan=(s,p)=>{
 const cap=getCapability(s,capabilityKey(p.analysis.type));
 return !p.capVersion||(p.capVersion===cap?.version&&capabilityMatch(cap,findCase(s,p.caseId)));
};
function log(s,c,note,at){s.log.unshift({at,caseId:c?.id||'',note});s.log=s.log.slice(0,150);}
function fromHistory(h){
 return {id:h.id,name:h.name,country:h.country,currency:h.currency,historyCurrency:h.currency,source:'history',type:'auto',priorType:h.type==='receiptApi'?'payout':h.type,priorDemand:h.type,
 notes:h.notes,historyNotes:h.notes,frequency:h.frequency,communication:'',files:[],material:'历史交易画像',
 verified:h.evidence,proof:h.evidence?'虚构历史样例的主体、用途与关键路径已在演示中核对。':'',
 volume:h.volume,basis:h.basis,bps:h.bps,ops:h.ops,baseline:benchmarks[h.id]||{mode:'沿用当前付款 / 回款路径',count:null,oldFee:null,newFee:null,oldMin:null,newMin:null}};
}
const historySampleId='H21';
const historyBatch=()=>D.history().filter(h=>h.id!==historySampleId);
function beforeDemand(h){
 const c=fromHistory(h);
 c.priorDemand='review';
 c.verified=false;c.proof='';
 c.baseline={...c.baseline,newFee:null,newMin:null};
 if(h.id==='H01'||h.id==='H03')c.historyCurrency='USD';
 if(h.id==='H19'){
  c.historyCountry='中国香港';c.historyCurrency='HKD';c.frequency='每月5笔';c.priorType='payout';
 }
 c.notes=c.historyNotes='仅载入历史交易。客户的新需求由运营补录。';
 return c;
}
function fresh(at=new Date().toISOString()){
 const s={version:5,cases:[],plans:[],requirements:[],cap:null,log:[],seq:{case:0,plan:0,req:0,receipt:0}};
 s.cases=historyBatch().map(beforeDemand);
 log(s,null,'载入20条虚构存量商户及交易画像，等待需求录入。',at);
 return s;
}
function migrate(state){
 const s=clone(state);
 const batchImported=s.cases.filter(c=>c.source==='history').length>=D.history().length-1;
 const used=new Set([...s.plans.map(p=>p.caseId),...s.requirements.flatMap(r=>r.caseIds||[]),...s.log.map(x=>x.caseId)]);
 const defaults=new Set(['H14','H21','R01']);
 s.cases=s.cases.filter(c=>!defaults.has(c.id)||used.has(c.id)||c.communication||c.proofFiles?.length||(c.id==='H14'&&batchImported));
 for(const h of historyBatch()){
  const index=s.cases.findIndex(c=>c.id===h.id);
  if(index<0)s.cases.push(beforeDemand(h));
  else{
   const c=s.cases[index],seed=fromHistory(h);
   const edited=c.communication||c.communicationFiles?.length||c.proofFiles?.length||c.type!==seed.type||
    c.proof!==seed.proof||JSON.stringify(c.baseline)!==JSON.stringify(seed.baseline);
   if(!used.has(h.id)&&!edited)s.cases[index]=beforeDemand(h);
  }
 }
 s.cases.sort((a,b)=>(a.source==='history'&&b.source==='history')?a.id.localeCompare(b.id):Number(b.source==='history')-Number(a.source==='history'));
 const originalCurrencies=new Map(D.history().map(c=>[c.id,c.currency]));
 for(const c of s.cases){
  if(c.id===receiptLead.id&&!c.verified&&!c.proof&&c.notes.endsWith('客户订单号、失败重试规则和安全接入要求仍待核验。')){
   Object.assign(c,clone(receiptLead),{baseline:clone(radarBench.receiptApi)});
  }
  if(c.source==='history')c.historyCurrency??=originalCurrencies.get(c.id)||c.currency;
  if(c.analysis)c.analysis=analyze(s,c);
 }
 return s;
}
function detect(n){
 if(/(?:印尼|印度尼西亚|IDR).{0,24}本地(?:银行)?(?:出款|下发|付款)/i.test(n))return 'localIdrPayout';
 if(/逐单回执|订单级.{0,6}回执|回执.{0,8}API|API.{0,8}回执|回传单笔/.test(n))return 'receiptApi';
 if(/分账|底层商户|扣.{0,10}服务费/.test(n))return 'platform';
 if(/订阅|限额|限次|超支|卡控/.test(n))return 'card';
 if(/供应商|批量付款|加工|仓配/.test(n))return 'payout';
 if(/本地币|本币|买方|回人民币|收款/.test(n))return 'collection';
 return '';
}
function infer(c){
 if(c.type!=='auto')return c.type;
 return detect(c.communication)||c.priorDemand||c.priorType||detect(c.notes)||'review';
}
const estimateFields={
 mode:{label:'现有交易方式',owner:'客户财务 / 销售',hint:'说明当前怎么收付或对账，例如逐笔电汇、共用卡或手工对账。'},
 count:{label:'用于比较的月笔数',owner:'客户运营 / 财务',hint:'确认新旧路径都承接的同一批业务笔数；历史流水可作参考，不能直接当新增量。'},
 oldFee:{label:'现有单笔费用',owner:'客户财务',hint:'从现有账单提取同币种、同范围的每笔费用；确认确无费用才填 0。'},
 newFee:{label:'拟议单笔费用',owner:'产品运营 / 渠道',hint:'取同币种、同业务量和时效的拟议报价；未知不要填 0。'},
 oldMin:{label:'现有单笔处理分钟',owner:'客户业务运营',hint:'估计提交、查账或对账所需的人工分钟，不是到账时长。'},
 newMin:{label:'拟议单笔处理分钟',owner:'销售 / 产品运营',hint:'按相同工作范围试跑新流程，记录每笔人工分钟。'}
};
const knownMode=x=>!!x&&!/^待核实|^沿用当前付款 \/ 回款路径$/.test(x);
function comparison(c){
 const b=c.baseline,countOK=Number.isInteger(b.count)&&b.count>0,currencyOK=/^[A-Z]{3}$/.test(c.currency);
 const compare=(a,z)=>({old:round(a*b.count),next:round(z*b.count),delta:round((a-z)*b.count)});
 const common=[...(!knownMode(b.mode)?['mode']:[]),...(!countOK?['count']:[])];
 const feeMissing=[...common,...(!money(b.oldFee)?['oldFee']:[]),...(!money(b.newFee)?['newFee']:[])];
 const timeMissing=[...common,...(!money(b.oldMin)?['oldMin']:[]),...(!money(b.newMin)?['newMin']:[])];
 return {fees:!feeMissing.length&&currencyOK?compare(b.oldFee,b.newFee):null,minutes:!timeMissing.length?compare(b.oldMin,b.newMin):null,
  needed:{fees:feeMissing,minutes:timeMissing},currencyOK,count:b.count,mode:b.mode||'待核实现有方式',currency:c.currency};
}
const opportunity={
 collection:'本币收款＋换汇＋跨境人民币结算',
 payout:'批量海外付款＋按需换汇',
 localIdrPayout:'印尼盾供应商付款＋本地银行出款',
 card:'分项目VCC＋限额、限次和对账',
 receiptApi:'批量海外付款＋订单级回执 API',
 platform:'平台分账＋底层商户结算',
 mature:'保留现有交易安排',review:'补齐主体与用途后再判断'
};
const proofQuestion={
 collection:'买方是谁、如何付款？订单依据、回款周期及对账方式是否确认？',
 payout:'受益人与付款依据是否齐全？币种、时效及同条件报价如何？',
 localIdrPayout:'目标收款银行、周末到账时限和退回要求分别是什么？',
 card:'供应商是否受理？项目预算、单笔额度及频次分别是多少？',
 receiptApi:'客户订单号、回执字段、回调鉴权和失败重试要求分别是什么？',
 platform:'谁持有资金？哪些主体收款、如何扣费、结算及退款？',
 mature:'是否出现新国家、新买方或原流程无法满足的控制需求？',
 review:'实际交易用途、主体和最终收款方分别是什么？'
};
// The 28-day transaction fixtures are independent of the CNY opportunity estimate.
const historyWindow='2026-10-05 至 11-01 · 28天';
// Fixed demonstration factors for bucketing only, not live or historical FX quotes.
const demoUnitsPerUsd={USD:1,HKD:8,MXN:20,IDR:16000,VND:25000,BRL:5,THB:35,MYR:4,PHP:60,ZAR:20,KES:130,EUR:0.9,GBP:0.8};
function historySize(count,total,currency){
 if(!count)return null;
 const units=demoUnitsPerUsd[currency],usd=units?total/units:null;
 const tier=count>=40||usd>=40000?'较大交易规模':count>=12||usd>=10000?'中等交易规模':'小量交易客户';
 return {tier,usd};
}
function historyProfile(c){
 if(c.source!=='history')return null;
 const type=c.priorType,frequency=c.frequency.match(/每([周月日])(\d+)笔/),cur=c.historyCurrency||c.currency;
 const count=/^[A-Z]{3}$/.test(cur)&&frequency?Number(frequency[2])*({周:4,月:1,日:28}[frequency[1]]):0;
 const main={payout:'海外付款',card:'公司卡支出',collection:'海外收款',platform:'平台回款',mature:'银行跨境结算',review:'待核实'}[type];
 const unit={HKD:1000,MXN:4500,IDR:700000,JPY:12000,VND:800000,BRL:800,THB:2000,MYR:600,PHP:3000,ZAR:500,KES:3500,EUR:300,GBP:260,USD:350}[cur]||100;
 const by=new Map(),weeks=[0,0,0,0],related=new Set();
 const entries=Array.from({length:count},(_,i)=>{
  const offset=Math.floor(i*28/count),day=new Date(Date.UTC(2026,9,5+offset)).toISOString().slice(0,10);
  const product=main;
  // Related services are tagged, not added as a second transaction.
  const amount=unit*(2+(i*7+Number(c.id.slice(1)))%9);
  weeks[Math.floor(offset/7)]++;
  if(['payout','collection'].includes(type)&&i%4===0)related.add('换汇');
  if(type==='collection'&&i%5===0)related.add('跨境人民币结算');
  const p=by.get(product)||{product,count:0,amount:0};p.count++;p.amount+=amount;by.set(product,p);
  return {id:'DEMO-'+c.id+'-'+String(i+1).padStart(3,'0'),day,product,amount,cur};
 });
 const products=[...by.values()],total=products.reduce((n,x)=>n+x.amount,0);
 const [business,service,external]=D.historicalUsage[c.id]||[];
 return {entries,products,related:[...related],weeks,count,total,perWeek:count/4,currency:cur,window:historyWindow,
  market:c.historyCountry||D.historyMarket[c.id]||'待核实',transactionType:business||main,
  companyProducts:count&&service?[service,...related]:[],external,scale:historySize(count,total,cur),
  portrait:count?count>=40?'高频重复交易商户':count>=12?'周期性交易商户':'低频跨境商户':'交易画像待补充'};
}
// Each row tells the operator who to contact, what to obtain, and how to check it.
const evidenceLists={
 localIdrPayout:[
  ['收款银行与用途','客户财务','目标银行、受益人账户及供应商交易依据','银行与真实付款用途对应'],
  ['时效与结果要求','客户运营','月量、单笔分布、周末时效和回执要求','可建立测试场景和通过标准']
 ],
 collection:[
  ['买方与收款主体','客户财务 / 销售','买方公司名称与国家、收款主体证明或已核验的客户档案','合同、付款人与收款人关系一致'],
  ['订单及贸易依据','客户销售 / 贸易运营','采购合同、发票或订单摘录，含付款方式和币种','真实业务用途、金额和币种可对应'],
  ['回款与报价口径','客户财务 / 产品运营','到账周期、目标回款币种、月笔数及两条路径的可比费用','本币受理与结算路径已核对；未报价不宣称省钱']
 ],
 payout:[
  ['受益人与收款资料','客户财务','供应商清单、国家/币种及已核验的收款信息','收款主体和付款对象一致'],
  ['付款依据与节奏','客户采购 / 运营','采购合同或发票、每周付款批次、目标到账时间','用途、币种、付款频次和时效可核对'],
  ['渠道与费用条件','产品运营 / 渠道同事','支持币种、到账时效、现有费用与拟议报价','同币同量同条件比较，不把未知费用算零']
 ],
 card:[
  ['企业用途与受理','客户财务 / 商户对接人','订阅/经营支出说明、供应商受理币种和授权方式','企业自用且演示卡范围覆盖'],
  ['项目预算与控制','客户项目负责人','项目名单、月预算、单笔上限、交易次数及有效期','总额、单笔和次数均有客户依据'],
  ['对账与费用','客户财务 / 产品运营','账单摘录、退款及对账要求、可比费用','确认控制范围，不能把MCC当成订单限制']
 ],
 receiptApi:[
  ['主体与付款依据','客户财务 / 采购','香港受益人、HKD付款合同或发票、计划批次','付款关系、用途和币种可对应'],
  ['逐单回执字段','客户运营 / IT','客户订单号、付款状态、到账凭证及失败原因的字段样例','按客户订单号能查到对应单笔状态'],
  ['安全接入与渠道条件','客户 IT / 产品运营','回调鉴权、重试策略、目标时效及演示目录范围','未核验或目录不覆盖时不发方案']
 ],
 platform:[
  ['主体关系与资金归属','客户合规 / 财务','平台与底层商户协议、买方和最终收款方关系','谁持有资金、谁承担退款义务均明确'],
  ['扣费、结算与退款','客户运营','订单拆分、服务费公式、结算日、退款回退样例','一笔资金从收款到结算能够核对'],
  ['演示能力范围','产品运营 / 风控','产品目录版本、国家和币种、拟用路径及边界','缺少覆盖时登记产品需求，不发送方案']
 ],
 mature:[['确认是否有新需求','客户财务 / 销售','现有渠道反馈或新增业务线索','没有新增价值时不强推']],
 review:[['澄清真实用途','销售 / 客户联系人','付款人、最终收款人、国家、币种和交易用途','先识别具体业务类型，再核对专属清单']]
};
const proofSamples={
 collection:'虚构主体：经销商在墨西哥，出口企业为收款方；订单 X-41 标明买方主体、MXN 币种与货款用途。客户财务确认按周回人民币，已按演示目录核对受理与可比费用。',
 payout:'虚构材料：供应商 R-16 已核验主体及收款资料；采购发票 P-91 对应 HKD 货款。财务确认每周分批付款，运营核对拟议渠道与可比报价。',
 card:'虚构材料：企业自用软件订阅，供应商受理 HKD；每月20次，累计预算 HKD 30,000、单笔 HKD 3,000。财务核对月度对账和退款条件。',
 receiptApi:'虚构核验：香港受益人和 HKD 仓配发票已对应；客户 IT 提供订单号、状态、凭证、失败原因四项字段，并确认签名验签、重复通知幂等及重试要求。产品运营按演示目录检查渠道范围。',
 platform:'虚构材料：平台协议 T-18 标明最终收款商户、资金权属和退款责任；服务费、结算周期及退费规则已记录；产品运营仍需按目录判断国家和币种覆盖。'
};
const radarBench={
 collection:{mode:'虚构访谈：原路径为逐笔电汇，折同币种比较',count:12,oldFee:320,newFee:250,oldMin:12,newMin:6},
 payout:{mode:'虚构访谈：逐笔付款、分散核对',count:32,oldFee:80,newFee:45,oldMin:9,newMin:3},
 card:{mode:'虚构访谈：项目共用卡',count:20,oldFee:20,newFee:22.5,oldMin:12,newMin:4},
 receiptApi:{mode:'虚构访谈：下载回执后按订单人工核对',count:24,oldFee:null,newFee:null,oldMin:12,newMin:5}
};
const historySpecific={
 H05:{type:'collection',rows:[
  ['巴西买方及收款主体','客户财务','买方名称、注册地区及收款主体档案','买方、实际付款人和合同关系可对应'],
  ['BRL 贸易订单依据','客户销售 / 贸易运营','采购合同、发票或订单摘录，标注 BRL 货款和用途','能对应付款用途、币种与金额'],
  ['巴西本币受理与回款条件','产品运营','核对 BRL 收款、回款币种和周期','确认演示目录适用范围，不等于实际准入']
 ],sample:'虚构核验：巴西买方 B-05 与收款主体已对应；BRL 采购订单 EX-05 对应设备货款；已按演示目录核对本币收款与周度回款。'},
 H10:{type:'payout',rows:[
  ['肯尼亚供应商主体及银行资料','客户财务','供应商名单、开户主体、收款账户核验结果','账户名与实际供应商一致'],
  ['KES 付款依据与到款要求','客户采购','合同或发票、付款用途、周期及目标到款时间','每笔付款能对应依据，币种为 KES'],
  ['肯尼亚付款路径','产品运营','核对 KES 受理、时效和报价范围','覆盖本例用途；价格未齐时不做省钱承诺']
 ],sample:'虚构核验：肯尼亚供应商 K-10 主体与银行账户已对应，采购发票说明 KES 服务费，每月9笔；产品运营已核对演示付款路径。'},
 H12:{type:'card',rows:[
  ['USD 订阅商户受理','客户财务 / 供应商','确认供应商是否接受企业虚拟卡、USD扣款及授权方式','不能只依据口头说法或卡标'],
  ['项目预算及扣款节奏','客户项目负责人','项目名称、预算上限、单笔限额及月度次数','能解释为什么需要分项目控额'],
  ['实际支出类别及对账','客户财务 / 产品运营','账单或类别摘录、退款及对账条件','类别和场景核对，不把MCC当作订单限制']
 ],sample:'虚构核验：订阅商户确认接受 USD 虚拟卡；按项目设置月预算与单笔上限，预计每周15笔；已核对经营支出类别、账单和退款要求。'},
 H19:{type:'review',rows:[
  ['谁付款、谁最终收款','销售 / 客户财务','合同参与方、最终收款人及是否代收的说明','区分企业自用和为第三方代收转付'],
  ['真实用途及交易依据','客户采购 / 运营','合同、发票或能证明实际服务的摘录','金额用途可追溯；不清楚则继续补证'],
  ['国家、币种与路径','客户财务 / 产品运营','补齐新增业务的国家/地区、付款币种并核对拟用产品','新增条件与演示目录匹配，原有交易画像独立保留']
 ],sample:'虚构核验：不是为第三方代收，是企业向香港自有业务供应商支付 HKD 服务费；采购合同与收款人一致，已核对演示付款目录。'}
};
function historyEvidence(c,type=infer(c)){
 const specific=historySpecific[c.id],has=specific?.type===type;
 const resolve=type==='review'||!c.country||c.country==='待补充'||!/^[A-Z]{3}$/.test(c.currency);
 const unsupported=type==='card'&&!cardCurrencies.includes(c.currency)&&!resolve;
 const rows=(has?specific.rows:evidenceLists[type]||evidenceLists.review).slice();
 if(unsupported)rows.push(['当前币种不在卡目录','产品运营','核对供应商是否明确支持另一个目录内币种，否则登记产品需求','不能仅为通过核验而更改币种；补证不会自动开放新币种']);
 return {rows,resolve,unsupported,sample:has?specific.sample:(type==='review'?'':proofSamples[type]?'虚构核验：'+c.country+' / '+c.currency+' 的主体关系、业务依据及上方逐项条件已按本案例核对。':'')};
}
function estimateExample(c,type=infer(c)){
 const profile=historyProfile(c),b=radarBench[type]||{mode:'虚构对照：现有逐笔操作',count:12,oldFee:80,newFee:45,oldMin:12,newMin:6};
 return {...b,count:profile?.count||b.count};
}
function analyze(s,c){
 const type=infer(c),p=D.profiles[type]||D.profiles.review,v=comparison(c),profile=historyProfile(c);
 const gapKey=capabilityKey(type),cap=getCapability(s,gapKey),scope=capabilityMatch(cap,c),gap=capabilityInfo[gapKey];
 const status=gapKey&&!scope?'blocked':type==='mature'?'keep':!c.verified||type==='review'||(type==='card'&&!cardCurrencies.includes(c.currency))?'missing':'ready';
 const rationale={ready:scope?'演示目录 '+cap.version+' 已覆盖'+gap.title+'，且样例证据齐全；可形成待确认方案。':'本案例已核验关键事实，可按演示目录形成客户方案。',missing:type==='card'&&!cardCurrencies.includes(c.currency)?'币种不在演示卡范围；不可输出可执行VCC方案。':scope?'演示目录已覆盖，但客户证据仍未齐；先完成取证清单。':'证据未齐或业务关系尚未识别；先补证，不猜测准入。',blocked:'当前演示目录未覆盖本案例的「'+(gap?.title||'所需能力')+'」；不能对客户承诺。',keep:'当前方式已满足需求，未发现充分切换理由。'}[status];
 const benefit=[];
 if(v.fees?.delta>0)benefit.push('同量假设下，直接费用预计少 '+v.currency+' '+v.fees.delta+' / 月');
 if(v.fees?.delta<0)benefit.push('直接费用预计多 '+v.currency+' '+Math.abs(v.fees.delta)+' / 月，不作省钱承诺');
 if(v.minutes?.delta>0)benefit.push('核对或操作预计少 '+v.minutes.delta+' 分钟 / 月');
 if(!benefit.length)benefit.push('暂未量化改善，先确认客户目标与可比报价');
 const title=opportunity[type]||opportunity.review;
 const proposed=scope?'按演示目录 '+cap.version+' 的限定地区及币种复核。'+cap.scope:p.solution;
 const script=status==='ready'?'您好，结合您目前的「'+v.mode+'」和已核验的业务情况，我们建议先试「'+title+'」。'+benefit.join('；')+'。能否一起对照同一业务量、时效和完整费用确认是否值得试点？':
 status==='blocked'?'您提出的「'+gap.title+'」暂不在当前支持范围内。我们先记录适用范围和规则；能力确认后再联系复核，不提前承诺交付。':
 status==='keep'?'目前建议保留现有安排。如果新增国家、买方或出现新的对账要求，我们再一起评估。':'想先与您确认：'+proofQuestion[type]+'核实前不承诺路径或报价。';
 const signal=profile?.count?(profile.portrait+'：近28天 '+profile.count+' 笔，周均 '+profile.perWeek+' 笔；主用 '+profile.products.map(x=>x.product).join('、')+
  (type==='payout'&&profile.perWeek>=6?'，重复付款值得评估批量处理':type==='card'?'，已有卡支出，重点核实分项目控制而非新增一个支付动作':'')):'';
 return {type,status,title,rationale,profile:p,signal,scope,gapKey,capVersion:scope?cap.version:'',proposed,steps:steps[type],question:proofQuestion[type],comparison:v,benefit,script,
   evidence:[...(signal?[{source:'近28天逐笔虚构交易汇总',text:signal+'；交易量 '+profile.currency+' '+profile.total+'。'}]:[]),
    {source:c.source==='history'?'历史交易 / 沟通原文':sources[c.source]+' · '+c.material,text:c.notes},
    ...(c.communication?[{source:'日常沟通补录 · '+(c.communicationSource||'手工纪要'),text:c.communication}]:[]),...(c.proof?[{source:'人工核验',text:c.proof}]:[])]};
}
function command(state,act,p={},at=new Date().toISOString()){
 const s=clone(state),c=findCase(s,p.id),plan=findPlan(s,p.id);let id=p.id||'',message='';
 if(act==='channel-sample'){
  if(!findCase(s,idrLead.id)){
   const x=clone(idrLead);x.analysis=analyze(s,x);s.cases.unshift(x);
  }
  return command(s,'request',{id:idrLead.id},at);
 }else if(act==='history'){
  const batch=historyBatch();
  let added=0;
  for(const h of batch){
   const x=findCase(s,h.id);
   if(!x.communication&&!x.analysis){
    const seed=fromHistory(h);
    Object.assign(x,{communication:h.notes,communicationSource:'演示走访纪要',priorDemand:h.type,
     verified:seed.verified,proof:seed.proof,baseline:seed.baseline});
    added++;
   }
   x.analysis=analyze(s,x);
  }
  message='已录入 '+added+' 条演示需求，并完成 '+batch.length+' 条案例分析。';
 }else if(act==='history-capability-sample'){
  id=historySampleId;
  if(findCase(s,id))return {s,id,message:''};
  const x=fromHistory(D.history().find(h=>h.id===id));
  x.analysis=analyze(s,x);s.cases.unshift(x);
  message='已载入历史能力更新样例';
 }else if(act==='radar-samples'){
  let next=s;
  const featured=[idrLead,splitLead].map(sample=>{
   const x=findCase(next,sample.id)||clone(sample);
   x.analysis=analyze(next,x);
   return x;
  });
  const featuredIds=featured.map(x=>x.id);
  next.cases=[...featured,...next.cases.filter(x=>!featuredIds.includes(x.id))];
  for(const [source,sample] of Object.entries(sampleIntakes)){
   if(!next.cases.some(x=>x.source===source&&x.name===sample.name&&x.notes===sample.notes)){
    next=command(next,'new',{...sample,source,mock:true},at).s;
   }
  }
  message='5 条演示样例已就绪，包含南屿商贸和远汐仓配平台。';
  log(next,null,message,at);
  return {s:next,featuredIds,message};
 }else if(act==='new'){
  const name=text(p.name,60),country=text(p.country,40),currency=text(p.currency,3).toUpperCase(),notes=text(p.notes);
  assert(p.mock&&['visit','branch','external'].includes(p.source)&&name&&country&&/^[A-Z]{3}$/.test(currency)&&notes,'请填写虚构客户、地区、三位币种和可读材料，并确认仅用于演示。');
  assert(!s.cases.some(x=>x.name===name&&x.country===country&&x.currency===currency&&x.notes===notes),'已有相同记录，请在原案例补充。');
  id='S'+String(++s.seq.case).padStart(3,'0');
  const x={id,name,country,currency,notes,source:p.source,type:'auto',communication:'',frequency:'待核实',material:text(p.material,30),files:(p.files||[]).map(x=>text(x,120)).slice(0,5),
   verified:false,proof:'',basis:'新客户',volume:0,bps:12,ops:100,baseline:{mode:text(p.mode,120)||'待核实',count:null,oldFee:null,newFee:null,oldMin:null,newMin:null}};
  x.analysis=analyze(s,x);s.cases.push(x);message='已登记 '+id+' 并模拟分析，不把行业线索当成已核验需求';
 }else if(act==='catalog-upgrade'){
  const isHistory=p.scope==='history';
  assert(isHistory||p.scope==='radar','请选择要更新的演示能力。');
  const field=isHistory?'receiptCap':'cap';
  assert(!s[field],'该项演示能力已载入，可查看更新前后对照。');
  s[field]=clone(isHistory?receiptUpgrade:upgradeSample);
  for(const r of s.requirements){const cap=getCapability(s,r.key);if(cap){r.status='已导入演示能力';r.version=cap.version;}}
  for(const x of s.cases)if(x.analysis)x.analysis=analyze(s,x);
  message='演示目录已更新：'+(isHistory?'香港 HKD 逐单付款回执 API':'墨西哥 MXN 平台分账')+'。相关案例已复算，原方案仍可单独复评。';
 }else if(act==='history-verify'){
  assert(c?.source==='history'&&p.mock&&text(p.proof),'请填写本案例的虚构核验依据。');
  const guide=historyEvidence(c),checks=new Set(p.checks||[]);
  assert(guide.rows.every((_,i)=>checks.has(String(i))),'请逐项确认清单中的所需材料。');
  if(guide.resolve){
   const country=text(p.country,40),currency=text(p.currency,3).toUpperCase();
   assert(country&&/^[A-Z]{3}$/.test(currency)&&Object.hasOwn(D.profiles,p.type)&&p.type!=='review','请补齐国家/地区、币种和经核实的用途。');
   c.historyCurrency??=c.currency;c.country=country;c.currency=currency;c.type=p.type;
  }
  c.verified=true;c.proof=text(p.proof);c.proofFiles=[...new Set([...(c.proofFiles||[]),...(p.files||[]).map(x=>text(x,120))])].slice(0,10);
  c.analysis=analyze(s,c);
  message='已补齐业务材料，重新判断：'+statuses[c.analysis.status];
 }else if(act==='economics'){
  assert(c&&c.analysis,'请先完成案例分析。');
  const a=analyze(s,c);
  assert(['ready','missing'].includes(a.status),'当前没有可比较的拟议路径。');
  assert(Object.keys(estimateFields).some(k=>Object.hasOwn(p,k)&&text(p[k])),'请至少填一项可核实的数据；未知请留空。');
  const b={...c.baseline};
  for(const k of Object.keys(estimateFields)){
   if(!Object.hasOwn(p,k))continue;
   if(k==='mode'){b.mode=text(p.mode,120);continue;}
   b[k]=p[k]===''||p[k]==null?null:Number(p[k]);assert(b[k]===null||money(b[k]),'请输入有效非负数；未知请留空。');
  }
  assert(b.count===null||(Number.isInteger(b.count)&&b.count>0&&b.count<=1000000),'月笔数应为正整数。');
  c.baseline=b;c.analysis=analyze(s,c);
  message='测算已更新；未填写的项目不按零计算';
  if(p.planId){
   const old=planFor(s,c.id);
   assert(old?.id===p.planId&&old.stage==='draft'&&c.analysis.status==='ready','仅当前可推荐的未发送草稿可以更新。');
   const revised=command(s,'generate',{id:c.id},at);
   return {...revised,kind:'plan',message:'已复算并更新原草稿 R'+findPlan(revised.s,old.id).rev};
  }
 }else if(act==='radar-verify'){
  assert(c&&c.source!=='history'&&p.mock&&Object.hasOwn(evidenceLists,p.type),'请选择有效的线索场景并确认资料为虚构。');
  assert(p.type!=='review','先明确实际用途与主体，再选择具体场景补证。');
  const list=evidenceLists[p.type],checks=new Set(p.checks||[]);
  assert(list.every((_,i)=>checks.has(String(i)))&&text(p.proof),'请逐项核对材料，并记录可读的核验依据。');
  c.type=p.type;c.verified=true;c.proof=text(p.proof);c.proofFiles=(p.files||[]).map(x=>text(x,120)).slice(0,5);
  if(p.sample&&radarBench[p.type])c.baseline=clone(radarBench[p.type]);
  c.analysis=analyze(s,c);
  message='已核验 '+list.length+' 项材料：'+statuses[c.analysis.status];
  log(s,c,message,at);
  const old=planFor(s,c.id);
  if(c.analysis.status==='ready'&&(!old||['draft','blocked'].includes(old.stage))){
   const r=command(s,'generate',{id:c.id},at);
   return {...r,kind:'plan',message:message+'，已生成详细方案'};
  }
  return {s,id:c.id,message,kind:'case'};
 }else if(act==='analyze'||act==='facts'){
  assert(c,'案例不存在。');
  if(act==='facts'){
   const b={mode:text(p.mode,120)};
   for(const k of ['count','oldFee','newFee','oldMin','newMin']){b[k]=p[k]===''||p[k]==null?null:Number(p[k]);assert(b[k]===null||money(b[k]),'请填写有效的非负数字。');}
   assert(b.count===null||(Number.isInteger(b.count)&&b.count>0&&b.count<=1000000),'月笔数应为正整数。');
   assert(p.type==='auto'||Object.hasOwn(D.profiles,p.type),'无效的需求类型。');
   if(p.verified)assert(text(p.proof),'确认核验前需写明虚构依据。');
   const next={baseline:b,communication:text(p.communication),communicationSource:text(p.communicationSource,40),type:p.type,verified:!!p.verified,proof:text(p.proof),
    communicationFiles:[...new Set([...(c.communicationFiles||[]),...(p.files||[]).map(x=>text(x,120))])].slice(0,10)};
   if(!c.analysis)assert(next.communication,'请填写客户新需求或可读沟通纪要。');
   if(infer({...c,...next})!==infer(c)){
    if(next.proof===c.proof){next.verified=false;next.proof='';}
    if(b.newFee===c.baseline.newFee)b.newFee=null;
    if(b.newMin===c.baseline.newMin)b.newMin=null;
   }
   Object.assign(c,next);
   if(!c.analysis){
    message='客户需求已保存，可单独分析或随 20 条案例批量分析。';
    log(s,c,message,at);
    return {s,id,message,kind:'case'};
   }
  }
  assert(c.source!=='history'||c.analysis||c.communication,'请先录入客户需求，再分析。');
  c.analysis=analyze(s,c);message='已重新分析 '+c.id+'：'+statuses[c.analysis.status];
 }else if(act==='generate'){
  assert(c?.analysis,'先分析客户案例。');
  const a=analyze(s,c),old=planFor(s,c.id);
  assert(['ready','blocked'].includes(a.status),'证据不足或应沿用原方案，不能生成可提交方案。');
  assert(!old||['draft','blocked'].includes(old.stage),'此方案已进入跟进流程，不能覆盖已确认版本。');
  if(old){
   old.previous=[...(old.previous||[]),{rev:old.rev,status:old.stage,analysis:old.analysis}].slice(-8);
   Object.assign(old,{analysis:a,stage:a.status==='ready'?'draft':'blocked',rev:old.rev+1,capVersion:a.capVersion,script:'',card:null});id=old.id;
  }else{
   id='SOL-'+String(++s.seq.plan).padStart(3,'0');
   s.plans.unshift({id,caseId:c.id,rev:1,stage:a.status==='ready'?'draft':'blocked',analysis:a,capVersion:a.capVersion,
    basis:c.basis,volume:c.volume,bps:c.bps,ops:c.ops,followups:[],previous:[],sentAt:'',receipt:null,card:null,at});
  }
  c.analysis=a;message=id+' 已'+(old?'复评为新版本':'生成')+'，'+(a.status==='blocked'?'待能力升级':'待确认并模拟发送');
 }else if(act==='request'){
  const a=c&&analyze(s,c),k=a?.gapKey,info=capabilityInfo[k];
  assert(a?.status==='blocked'&&info,'当前没有可登记的产品能力缺口。');
  const old=s.requirements.find(r=>r.key===k&&r.caseIds.includes(c.id));
  if(old){id=old.id;message='已关联既有需求 '+id;}
  else{
   const common=s.requirements.find(r=>r.key===k);
   if(common){common.caseIds.push(c.id);id=common.id;}else{
    id='REQ-'+String(++s.seq.req).padStart(3,'0');
    s.requirements.unshift({id,key:k,...info,caseIds:[c.id],at,status:k==='idr-local-payout'?'待渠道评估':'待评估'});
   }
   message='已单独登记产品需求 '+id;
  }
 }else if(act==='custom-request'){
  const title=text(p.title,100),detail=text(p.detail);
  assert(c?.analysis&&title&&detail,'请先分析案例，并填写需求名称与证据。');
  const old=s.requirements.find(r=>r.key==='custom'&&r.title===title&&r.caseIds.includes(c.id));
  if(old){id=old.id;message='已保留既有需求 '+id;}
  else{
   id='REQ-'+String(++s.seq.req).padStart(3,'0');
   s.requirements.unshift({id,key:'custom',title,detail,caseIds:[c.id],at,status:'待评估'});
   message='已登记独立产品需求 '+id+'，不改变现有客户方案';
  }
 }else{
  assert(plan,'方案不存在。');
  const owner=findCase(s,plan.caseId);
  const current=()=>{const a=analyze(s,owner);return eligiblePlan(s,plan)&&a.status==='ready'&&JSON.stringify(a)===JSON.stringify(plan.analysis);};
  if(act==='tune'){
   assert(plan.stage==='draft'&&current(),'证据或能力已变化，请重新生成方案后再保存。');
   const nums=[p.volume,p.bps,p.ops].map(Number);
   assert(nums.every(money)&&nums[1]<=10000&&bases.includes(p.basis)&&text(p.script),'请检查归因、月量、费率、月成本及沟通稿。');
   [plan.volume,plan.bps,plan.ops]=nums;plan.basis=p.basis;plan.script=text(p.script);message='已保存调整，仍未发送';
  }else if(act==='start'){
   assert(plan.stage==='draft'&&current()&&p.mock,'仅当前有效方案可确认并模拟发送；证据或能力变化时需复评。');
   plan.stage='sent';plan.sentAt=at;plan.script||=plan.analysis.script;
   message='已确认方案并模拟发送，未对外联系';
  }else if(act==='follow'){
   assert(plan.stage==='sent'&&text(p.note),'请填写跟进纪要。');message='已记录跟进：'+text(p.note);
  }else if(act==='close'){
   assert(plan.stage==='sent'&&text(p.note),'需记录关闭原因。');plan.stage='lost';message='未成单关闭：'+text(p.note);
  }else if(act==='finish'){
   assert(plan.stage==='sent'&&!plan.receipt&&p.mock&&money(p.volume)&&p.volume>0&&text(p.note),'需先发送方案，填写客户确认依据和有效月量；每份方案只能模拟成单一次。');
   plan.confirmedAt=at;
   plan.receipt={id:'MOCK-WIN-'+String(++s.seq.receipt).padStart(3,'0'),at,volume:p.volume,net:incremental(plan)?round(p.volume*plan.bps/10000-plan.ops):0,note:text(p.note)};plan.stage='won';message='已登记 '+plan.receipt.id+'，看板已更新';
  }else if(act==='card'){
   assert(plan.analysis.type==='card'&&current()&&!plan.card&&plan.stage!=='lost'&&cardCurrencies.includes(owner.currency)&&p.mock,'仅证据齐全且未过期的方案可生成一次模拟卡。');
   const {limit,single,count}=p;
   assert([limit,single,count].every(Number.isSafeInteger)&&limit>0&&limit<=1000000&&single>0&&single<=limit&&count>0&&count<=100,'请核对总限额、单笔限额及次数。');
   plan.card={id:'MOCK-VCC-'+plan.id,cur:owner.currency,limit,single,count,at};message='已生成 '+plan.card.id+' 配置预览；不发卡、不计成单';
  }else throw Error('不支持该操作。');
  plan.followups.unshift({at,note:text(p.note)||message,nextDate:text(p.nextDate,10),stage:plan.stage});
  log(s,owner,message,at);return {s,id,message};
 }
 log(s,c||findCase(s,id),message,at);return {s,id,message};
}
function metrics(s,source=''){
 const cases=s.cases.filter(c=>!source||c.source===source),ids=new Set(cases.map(c=>c.id)),plans=s.plans.filter(p=>ids.has(p.caseId));
 const sent=plans.filter(p=>p.sentAt),accepted=sent.filter(p=>p.confirmedAt),won=sent.filter(p=>p.stage==='won'&&p.receipt),newWins=won.filter(incremental);
 return {cases:cases.length,analyzed:cases.filter(c=>c.analysis).length,plans:plans.length,sent:sent.length,accepted:accepted.length,won:won.length,newWins:newWins.length,
  rate:sent.length?won.length/sent.length:null,volume:round(newWins.reduce((n,p)=>n+p.receipt.volume,0)),net:round(newWins.reduce((n,p)=>n+p.receipt.net,0))};
}
return {key,sources,statuses,stages,bases,cardCurrencies,capabilityKey,capabilityInfo,upgradeSample,sampleIntakes,opportunity,steps,historyBatch,historyProfile,historyEvidence,evidenceLists,proofSamples,estimateFields,estimateExample,fresh,migrate,getCapability,analyze,command,metrics,findCase,findPlan,planFor,eligiblePlan};
});
