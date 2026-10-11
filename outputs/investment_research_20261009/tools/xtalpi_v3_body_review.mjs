import fs from 'node:fs';
import crypto from 'node:crypto';
import{calculateXtalpiHorizon}from'./xtalpi_native.mjs';
const root='G:/MyTarget/outputs/investment_research_20261009',modelRaw=fs.readFileSync(root+'/data/xtalpi_model.pending.json'),bodyRaw=fs.readFileSync(root+'/research/I027_deep.md');
const m=JSON.parse(modelRaw),md=bodyRaw.toString('utf8').replace(/\r/g,''),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const checks=[],check=(name,x)=>checks.push({name,pass:!!x}),near=(x,y,t=1e-6)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=t;
const tableRows=md.split('\n').filter(x=>/^\|/.test(x)).map(x=>x.split('|').slice(1,-1).map(s=>s.trim()));
const labels={halfYear:'半年',oneYear:'一年',threeYear:'三年',fiveYear:'五年（长期）'},weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],fiveYear:[20,0,40,20,5,15]};
check('model version in opening',md.includes(m.modelVersion));check('price basis in opening',md.slice(0,1500).includes('6.985'));
for(const[h,label]of Object.entries(labels)){const row=tableRows.find(x=>x[0]===label),calc=[0,1,2].map(c=>calculateXtalpiHorizon(m,h,c));check(h+' table exists',!!row);if(!row)continue;check(h+' target matches model',row[1]===m.scenarios[h].target);check(h+' score weights match plan',JSON.stringify(m.scores[h].weights)===JSON.stringify(weights[h]));const total=m.scores[h].dimensions.reduce((s,v,i)=>s+v*weights[h][i]/5,0);check(h+' score recomputed',near(total,m.scores[h].total));check(h+' score opening display',near(+row[2],Math.round(total*10)/10));for(let c=0;c<3;c++)check(h+' scenario '+c+' native price',near(+row[4+c],calc[c].price));const ret=(calc[1].price/m.price-1)*100,totalRet=((calc[1].price+calc[1].dividend)/m.price-1)*100;check(h+' capital return',near(parseFloat(row[7]),ret));check(h+' dividend total return',near(parseFloat(row[8]),totalRet));if(h==='threeYear'||h==='fiveYear'){const years=(Date.parse(row[1])-Date.parse(m.asOf))/86400000/365.25;check(h+' annualized total return',near(parseFloat(row[9]),(((calc[1].price+calc[1].dividend)/m.price)**(1/years)-1)*100));}else check(h+' nonannualized short period label',row[9]==='不适用');}
const ye=[0,1,2].map(c=>calculateXtalpiHorizon(m,'yearEnd',c).price),yeLabels=['悲观','基准','乐观'];
ye.forEach((p,c)=>{const row=tableRows.find(x=>x[0]===yeLabels[c]&&x.length===5);check('YE '+yeLabels[c]+' price',near(+row[1],p));check('YE '+yeLabels[c]+' capital return',near(parseFloat(row[2]),(p/m.price-1)*100));});
for(const[label,w]of [['加权期望',[.25,.5,.25]],['40/40/20',[.4,.4,.2]],['20/40/40',[.2,.4,.4]]]){const row=tableRows.find(x=>x[0]===label),expected=ye.reduce((s,p,c)=>s+p*w[c],0);check(label+' expected price',near(+row[1],expected));check(label+' expected return',near(parseFloat(row[2]),(expected/m.price-1)*100));}
for(const[h,label]of [['yearEnd','年底'],['halfYear','半年']]){const row=tableRows.find(x=>x[0]===label&&x.length===4);check(h+' intrinsic recognition table exists',!!row);if(row)for(let c=0;c<3;c++){const cells=row[c+1].split('/').map(x=>+x.trim()),native=calculateXtalpiHorizon(m,h,c);check(h+' intrinsic bridge '+c,near(cells[0],native.intrinsicPrice));check(h+' recognition factor '+c,near(cells[1],m.scenarios[h].marketRecognitionFactor[c]));check(h+' market bridge '+c,near(cells[2],native.price));}}
check('full per-drug modeling acceptance boundary',md.includes('不等同')&&md.includes('逐药净现金rNPV验收'));
check('preIPO expiry span2026to2036 retained',md.includes('二零二六年至二零三六年')||md.includes('二零二六至二零三六年')||md.includes('2026至2036'));
const ranges=Object.values(m.marketMultipleCrossCheck||{});check('crosscheck table included',md.includes('20.039413')&&md.includes('7.242055'));
const narrative=md.slice(md.indexOf('## 一、'),md.indexOf('## 来源与核验附录')).split('\n').filter(x=>!/^\s*(#|\||-)/.test(x)).join('\n');
const han=x=>(x.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length,paragraphs=narrative.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>han(x)>0),norm=x=>x.replace(/[\s，。；：、？！“”‘’（）,.!?;:'"()\d]/g,''),seen=new Map(),duplicateParagraphs=[];
paragraphs.forEach((p,i)=>{const key=norm(p);if(seen.has(key))duplicateParagraphs.push([seen.get(key),i]);else seen.set(key,i);});check('effective issuer narrative >=10000 Han',han(narrative)>=10000);check('no duplicate normalized narrative paragraphs',duplicateParagraphs.length===0);
const sentences=narrative.split(/[。！？]/).map(x=>x.trim()).filter(x=>han(x)>=40),sentenceMap=new Map(),duplicateSentences=[];sentences.forEach((s,i)=>{const key=norm(s);if(sentenceMap.has(key))duplicateSentences.push([sentenceMap.get(key),i]);else sentenceMap.set(key,i);});check('no long duplicate normalized sentences',duplicateSentences.length===0);
const shingles=paragraphs.map(p=>{const s=norm(p),set=new Set();for(let i=0;i<s.length-3;i++)set.add(s.slice(i,i+4));return set;}),similarParagraphs=[];
for(let a=0;a<shingles.length;a++)for(let b=a+1;b<shingles.length;b++){const first=shingles[a],second=shingles[b],shared=[...first].filter(x=>second.has(x)).length,jaccard=shared/(first.size+second.size-shared);similarParagraphs.push({a,b,jaccard,shared});}
similarParagraphs.sort((a,b)=>b.jaccard-a.jaccard);check('four-Han-style substring near duplicate threshold',!similarParagraphs.some(x=>x.jaccard>=.45));
for(const phrase of ['不是获利概率','最大损失边界','原研报缺失','没有公开','匿名','肠易激综合征','不同企业','早于该年不加分红','不再增加公司股数','租赁总现金付款','准确自然一年'])check('retained boundary '+phrase,md.includes(phrase));
check('retained boundary revenue realization distinguishes licensing and net realization',md.includes('版税')&&md.includes('净实现率'));

check('43 asset rows listed in narrative table',m.assetRegister.rows.every(x=>tableRows.some(r=>r[0]===x.assetIndicationId||r[0]===x.id)));
check('separate observed null and research probability',md.includes('观察行p=0是占位而临床概率未知')&&md.includes('七项活动项目p为研究判断'));
check('unallocated clinical expense explained',md.includes('未分配临床预算')&&md.includes('不乘成功率'));
check('no old positive modeled milestone wording',!md.includes('本模型只对披露保留合同现金的合作设置净里程碑'));
check('unknown claims do not inflate number of independent drugs',md.includes('不声称公司有43个独立注册药物'));
check('closed gate prohibits arbitrary legacy peak allocation',md.includes('不将旧组合峰值、里程碑和平均成功率任意拆分到单药'));


const drugTable=tableRows.filter(x=>x.length===8&&m.xtalpiBridge.assets.some(a=>a.eligibleAtCutoff!==0&&x[0]===a.id));
const active=m.xtalpiBridge.assets.filter(a=>a.eligibleAtCutoff!==0),triple=s=>s.split('/').map(x=>Number(x.trim()));
check('7 active demand models each have a separate complete demand table row',active.length===7&&drugTable.length===7);
for(const a of active){
 const row=drugTable.find(x=>x[0]===a.id);
 check(a.id+' independent demand row',!!row);if(!row)continue;
 for(const[field,col]of [['patients',1],['priceCNY',2],['share',3],['peak',4],['p',5],['start',6]]){
  const actual=triple(row[col]),expected=field==='peak'?a.peak:a.valuationAssumptions[field];
  check(a.id+' demand table '+field+' all three scenarios',actual.length===3&&actual.every((v,c)=>near(v,expected[c])));
 }
 const netGM=triple(row[7]);check(a.id+' base net realization and GM',netGM.length===2&&near(netGM[0],a.netRate[1])&&near(netGM[1],a.GM[1]));
}
check('ownership100 is assumption not verified netright',md.includes('100%归属假设')&&md.includes('不能称无负担净销售权已证实'));
check('0 50 100 percent sensitivity disclosed',md.includes('0%、50%、100%')||md.includes('0%、50%和100%'));
check('population price share are research not source statistics',md.includes('患者')&&md.includes('年价格')&&md.includes('研究假设'));
check('no source-unsupported UC Crohn precision',md.includes('炎症性肠病（IBD）；未指定UC或Crohn'));
check('shared molecule development and safety acknowledged',md.includes('共享')&&md.includes('同一药物'));
check('issuer undisclosed actual clinical probability separated from research probability',md.includes('公司未披露的实际临床成功率保留未知')&&md.includes('七项活动项目另列研究概率'));
const patientParagraph=md.split(/\n\s*\n/).find(x=>x.startsWith('患者数为'))||'';
check('geographic demand assumption disclosed in demand paragraph',patientParagraph.includes('中国')&&patientParagraph.includes('海外')&&patientParagraph.includes('区域'));
check('clinical budget sensitivity disclosed from 2027',md.includes('未分配临床预算压力（2027年起）'));
for(const[label,factor]of [['原预算',1],['增加30%',1.3],['增加100%',2]]){
 const row=tableRows.find(x=>x[0]===label&&x.length===5),v=structuredClone(m);
 v.xtalpiBridge.inputs.base.clinicalUnallocated=v.xtalpiBridge.inputs.base.clinicalUnallocated.map((x,n)=>x*(n>0?factor:1));
 const one=calculateXtalpiHorizon(v,'oneYear',1),three=calculateXtalpiHorizon(v,'threeYear',1);
 check(label+' clinical cost table row exists',!!row);if(!row)continue;
 check(label+' independent one year value',near(+row[1],one.intrinsicPrice));
 check(label+' independent three year value',near(+row[2],three.intrinsicPrice));
 check(label+' independent minimum cash',near(+row[3],one.minimumCashCNYbn));
 check(label+' independent failure flag',row[4]===(one.fundingFailure?'是':'否'));
}

const out={nativeSHA256:sha(fs.readFileSync(root+'/tools/xtalpi_native.mjs')),issuerId:m.issuerId,securityId:m.securityId,reviewDate:'2026-10-11',modelVersion:m.modelVersion,modelSHA256:sha(modelRaw),bodySHA256:sha(bodyRaw),status:checks.every(x=>x.pass)?'PASS numerical consistency and nonduplicated narrative':'FAIL',effectiveHan:han(narrative),paragraphs:paragraphs.length,duplicateParagraphs,duplicateSentences,nearDuplicateParagraphPairs:similarParagraphs.slice(0,10),nearDuplicateThreshold:.45,checks,limits:['Counting excludes opening, tables, headings and source appendix; semantic originality remains human-reviewed and is not proven by string checks','This review does not confirm every clinical source, unreported net rights or full drug-by-indication economics','7 defined indication research models and36 zero observations retain source/assumption distinctions; missing legal holder/cost allocation limits remain','No Word/PDF render, integrated Excel consistency or 27-file acceptance is performed here']};
fs.writeFileSync(root+'/qa/xtalpi_v3_body_review.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,checks:checks.length,failures:checks.filter(x=>!x.pass)},null,2));
