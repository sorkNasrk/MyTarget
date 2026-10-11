import fs from 'node:fs';
import crypto from 'node:crypto';
import{calculateInsilicoAnnual,calculateInsilicoHorizon}from'./insilico_native.mjs';
const root='G:/MyTarget/outputs/investment_research_20261009';
const files={model:'data/insilico_model.pending.json',body:'research/I008_deep.md',native:'tools/insilico_native.mjs',assumptions:'data/insilico_per_drug_assumptions.json',evidence:'qa/insilico_per_asset_evidence.json'};
const raw=Object.fromEntries(Object.entries(files).map(([k,p])=>[k,fs.readFileSync(root+'/'+p)])),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),signatures=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,hash(v)]));
const m=JSON.parse(raw.model),md=raw.body.toString('utf8').replace(/\r/g,''),ev=JSON.parse(raw.evidence),a=JSON.parse(raw.assumptions),sc=m.conditionalScenarios??m.scenarios,ds=m.diagnosticScores??m.scores,checks=[],check=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail}),near=(x,y,t=1e-6)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=t;
const tableRows=md.split('\n').filter(x=>/^\|/.test(x)).map(x=>x.split('|').slice(1,-1).map(s=>s.trim())),horizons={halfYear:'半年',oneYear:'一年',threeYear:'三年',fiveYear:'五年'},weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],fiveYear:[20,0,40,20,5,15]},prices={};
check('matching model version opening',md.slice(0,2000).includes(m.modelVersion));
check('cutoff current price and currency explicit',md.slice(0,1000).includes('2026年10月9日')&&md.slice(0,1000).includes('49港元')&&md.slice(0,1000).includes('美元十亿'));
check('opening official all targets returns and expected prices empty',md.slice(0,2200).includes('暂不排名')&&md.slice(0,2200).includes('正式目标价')&&md.slice(0,2200).includes('期望价均为空'));
for(const[h,label]of Object.entries(horizons)){
 const scoreRow=tableRows.find(x=>x[0]===label+sc[h].target&&x.length===4),r=tableRows.find(x=>x[0]===label&&x.length===5);prices[h]=[0,1,2].map(c=>calculateInsilicoHorizon(m,h,c));
 check(h+' opening diagnostic score target row',!!scoreRow);if(scoreRow){check(h+' score does not present target',scoreRow[2]==='暂缺'&&scoreRow[3].includes('暂不排名'));const total=ds[h].dimensions.reduce((s,v,i)=>s+v*weights[h][i]/5,0);check(h+' diagnostic scoreweights recomputed',JSON.stringify(ds[h].weights)===JSON.stringify(weights[h])&&near(ds[h].total,total)&&near(+scoreRow[1],Math.round(total*10)/10));}
 check(h+' separate conditional pressure row',!!r);if(r){for(let c=0;c<3;c++)check(h+' pressure scenario '+c+' numerical value',near(+r[c+1],prices[h][c].price));check(h+' pressure mathematical return',near(parseFloat(r[4]),(prices[h][1].price/m.price-1)*100));}
 check(h+' diagnostic score not official',Object.keys(m.scores).length===0&&Object.keys(m.horizons).length===0&&Object.keys(m.scenarios).length===0);
}
prices.yearEnd=[0,1,2].map(c=>calculateInsilicoHorizon(m,'yearEnd',c));
const yearRow=tableRows.find(x=>x[0]==='年底'+sc.yearEnd.target);check('yearend conditional row exists',!!yearRow);if(yearRow)for(let c=0;c<3;c++)check('yearend pressure price '+c,near(+yearRow[c+1],prices.yearEnd[c].price));
const containsFixed=(name,value,digits=6)=>check(name,md.includes(value.toFixed(digits)),value.toFixed(digits));
for(const[w,label]of [[[.25,.5,.25],'default'],[[.4,.4,.2],'40/40/20'],[[.2,.4,.4],'20/40/40']]){const p=prices.yearEnd.reduce((s,r,c)=>s+r.price*w[c],0);containsFixed(label+' conditional weighted yearend value',p);containsFixed(label+' conditional weighted yearend math return',(p/m.price-1)*100);}
for(const[h,label]of Object.entries(horizons))containsFixed(label+' pressure weighted value',prices[h].reduce((s,r,c)=>s+r.price*[.25,.5,.25][c],0));
for(let c=0;c<3;c++)containsFixed('yearend scenario'+c+' return',(prices.yearEnd[c].price/m.price-1)*100);
const active=m.insilicoBridge.assets.filter(x=>x.eligibleAtCutoff!==0),demand=[...a.rows,...(a.earlyRows??[])];
check('all67 identities present in separate evidence table',ev.rows.every(x=>tableRows.some(r=>r[0]===x.assetIndicationId&&r.length===6)));
check('32 independent demand rows in numerical table',active.length===32&&tableRows.filter(x=>x.length===10&&active.some(a=>x[0]===a.id)).length===32);
for(const x of active){const row=tableRows.find(r=>r[0]===x.id&&r.length===10),d=demand.find(z=>z.id===x.id);check(x.id+' demand table identity',!!row);if(!row)continue;for(const[field,col]of [['patients',1],['priceUSD',2],['share',3],['peak',4],['p',5],['netRate',6],['ownership',7],['GM',8],['start',9]])check(x.id+' base '+field+' table equals assumption',near(+row[col],field==='peak'?x.peak[1]:d[field][1]));}
for(const phrase of ['单药clinical0','全成本','原九组全部临床费用','条件融资','不作正式','正式年底期望价为空','不代表法定清算','最大损失边界','研究假设','非法律到期','cashEnd2051','不是公司绝对全持股','未来融资'])check('required economic boundary '+phrase,md.includes(phrase));
check('clinical costs not weighted by success',md.includes('不乘成功率')||md.includes('费用乘成功率')&&md.includes('均不作为正式基准'));
check('old nine group narrative not falsely active',!md.includes('用九个有限净经济组容纳'));
check('H1 cash exact8525.5 no transposition8552.5',md.includes('8525.5万美元')&&!md.includes('8552.5万美元'));
check('UC peak denomination is9000mUSD or0.9 hundredmillionUSD',!md.includes('gross峰值0.09亿美元')&&(md.includes('9000万美元')||md.includes('gross峰值0.9亿美元')));
const annual=[0,1,2].map(c=>calculateInsilicoAnnual(m,c));
for(const [year,digits]of [[2026,8],[2027,8],[2028,8],[2029,8],[2031,8]])containsFixed('base'+year+' cashUSD hundredmillion narrative',Math.abs(annual[1].find(r=>r.year===year).forecastCashUSDbn)*10,digits);
containsFixed('base2030 cashUSDtenThousand narrative',Math.abs(annual[1].find(r=>r.year===2030).forecastCashUSDbn)*1e5,5);
containsFixed('base2036 revenue USDhundredmillion narrative',annual[1].find(r=>r.year===2036).revenueUSDbn*10);
containsFixed('base2036 loss USDtenThousand narrative',Math.abs(annual[1].find(r=>r.year===2036).parentNormalProfitUSDbn)*1e5,3);
for(const factor of [1,1.3,2]){const v=structuredClone(m);for(const l of ['bear','base','bull'])v.insilicoBridge.inputs[l].clinicalUnallocated=v.insilicoBridge.inputs[l].clinicalUnallocated.map((x,n)=>x*(n?factor:1));for(let c=0;c<3;c++)containsFixed('clinical'+factor+' '+c+' retained26year total',calculateInsilicoAnnual(v,c).reduce((s,r)=>s+r.clinicalCostUSDbn,0));if(factor!==1)containsFixed('clinical'+factor+' bull minimum stress',Math.abs(calculateInsilicoHorizon(v,'oneYear',2).minimumCashUSDbn));}
for(const f of m.conditionalFundingSensitivity){containsFixed(f.id+' conditional minimum cash',f.horizons.oneYear.minimumCashUSDbn);for(const h of ['oneYear','threeYear','fiveYear'])containsFixed(f.id+' '+h+' conditional intrinsic',f.horizons[h].intrinsicPrice);check(f.id+' financing not basecase flag',f.notFormalBaseCase&&f.conditions.includes('intrinsic'));}
for(const t of m.cashEndSensitivity)for(const h of ['oneYear','fiveYear'])containsFixed(t.id+' '+h+' bull cashEnd pressure',t.horizons[h][2].intrinsicPriceHKD);
const licenseIds=['ISM3091_HRD','ISM5043_ERPOS_HER2NEG','ISM9682_CIN_SOLID','ISM4808_CKD_GC'];
for(const type of ['retained','licensed'])for(const scale of [0,.5,1]){const v=structuredClone(m);for(const x of v.insilicoBridge.assets.filter(a=>a.eligibleAtCutoff!==0&&licenseIds.includes(a.id)===(type==='licensed'))){if(type==='licensed')x.netRate=x.netRate.map(x=>x*scale);else x.ownership=x.ownership.map(x=>x*scale);}for(const h of type==='retained'?['oneYear','fiveYear']:['oneYear']){const value=calculateInsilicoHorizon(v,h,2).intrinsicPrice;check(type+' '+scale+' '+h+' sensitivity represented',value===0?md.includes('三档0/'):md.includes(value.toFixed(6)),value);}}
for(const phrase of ['71','128','筛选','55','16','59','49','多重插补','缺失随机','2029-10-30','2026-09-09','12标RECRUITING','35标NOT_YET_RECRUITING','77.8%','29.4%','6/18','50%','USP1','royalty-free','7.9%','inactive','ESMO2026','非肥胖T2D','排除GBM'])check('critical source narrative '+phrase,md.includes(phrase));
check('128 screening correctly resolved no unsupported conflict',!md.includes('不足以解释128')&&/128[^。]*筛选|筛选[^。]*128/.test(md));
check('two FVC confidence intervals not claimed between-group interval',md.includes('组间')&&md.includes('区间'));
check('no formal power from phase2a exploratory signal',md.includes('power')||md.includes('样本量')&&md.includes('统计'));
check('treatment related serious events2of18 versus0of17',md.includes('2/18')&&md.includes('0/17'));
check('liver discontinuation7 and co-nintedanib4of7',md.includes('4/7')&&(md.includes('7例')||md.includes('7人')||md.includes('7项')||md.includes('7个')));
check('clinical late results not anticipated as achieved',md.includes('三年投资不能提前纳入')&&md.includes('预计日期本身可能延迟'));
check('33PCC identifies interim period or cutoff34',md.includes('34个PCC')||md.includes('34项PCC')||/33个PCC[^。]*中报|中报[^。]*33个PCC/.test(md));
const start=md.indexOf('## 一、'),end=md.indexOf('## 来源与核验附录');
check('issuer body narrative delimiters exist',start>=0&&end>start);
const narrative=md.slice(start,end).split('\n').filter(x=>!/^\s*(#|\||-)/.test(x)).join('\n'),han=x=>(x.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length,norm=x=>x.replace(/[\s，。；：、？！“”‘’（）,.!?;:'"()\d]/g,''),paragraphs=narrative.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>han(x)>0),seen=new Map(),dups=[];
paragraphs.forEach((p,i)=>{const s=norm(p);if(seen.has(s))dups.push([seen.get(s),i]);else seen.set(s,i);});check('effective issuer narrative>=10000 Han excluding openingtablesheadingssources',han(narrative)>=10000);check('no normalized duplicate paragraphs',dups.length===0);
const sentences=narrative.split(/[。！？]/).map(x=>x.trim()).filter(x=>han(x)>=40),map=new Map(),dupSent=[];sentences.forEach((s,i)=>{const n=norm(s);if(map.has(n))dupSent.push([map.get(n),i]);else map.set(n,i);});check('no long normalized duplicate sentences',dupSent.length===0);
const sets=paragraphs.map(p=>{const s=norm(p),z=new Set();for(let i=0;i<s.length-3;i++)z.add(s.slice(i,i+4));return z;}),similar=[];for(let i=0;i<sets.length;i++)for(let j=i+1;j<sets.length;j++){const shared=[...sets[i]].filter(x=>sets[j].has(x)).length;similar.push({i,j,jaccard:shared/(sets[i].size+sets[j].size-shared)});}similar.sort((a,b)=>b.jaccard-a.jaccard);check('fourcharacter substring near duplicate under45pct',!similar.some(x=>x.jaccard>=.45));
const report={issuerId:'I008',securityId:'S008',reviewDate:'2026-10-11',modelVersion:m.modelVersion,signatures,status:checks.every(x=>x.pass)?'PASS independent narrative and conditional numerical consistency':'FAIL',approvalScope:'Conditional research only; formal ranking targets and expected returns unavailable',effectiveHan:han(narrative),paragraphs:paragraphs.length,checksCount:checks.length,duplicateParagraphs:dups,duplicateSentences:dupSent,nearDuplicates:similar.slice(0,10),failures:checks.filter(x=>!x.pass),checks,limits:['Exact clinical source assertions also require independent fact supplement and primary-source review; automated phrase checks do not prove interpretation','Current32 demands are selected accessible research pools not fully region-specific reimbursement/rights valuation','Financing terms are unannounced conditionals and not an economically self-consistent basecase','Effective Han count excludes all openingtablesheaderssource appendix; semantic originality is human reviewed, not guaranteed by substring checks','No final Excel Word PDF cross-format or original-page render acceptance occurs in this report']};
fs.writeFileSync(root+'/qa/insilico_v3_body_review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,checks:undefined,nearDuplicates:undefined},null,2));
