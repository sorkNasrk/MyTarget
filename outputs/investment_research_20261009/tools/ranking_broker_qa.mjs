import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const checks=[],errors=[];
function check(name,pass,detail){checks.push({name,passed:!!pass,detail});if(!pass)errors.push({name,detail});}
const all=[...b.models,...b.conditionedModels];
check('92 distinct issuers',new Set(all.map(m=>m.issuerId)).size===92);
check('96 distinct stock securities',new Set(all.map(m=>m.code)).size===96&&all.length===96);
check('Stock scope',b.universe.securities.length===96&&b.universe.securities.every(s=>s.type==='股票'));
for(const h of Object.keys(b.weights)){
 check(h+' score weights',b.weights[h].reduce((a,x)=>a+x,0)===100);
 const order=(a,z)=>{const d=z.scores[h].total-a.scores[h].total;return(Math.abs(d)<1e-9?0:d)||z.scenarios[h].cases[1].totalReturn-a.scenarios[h].cases[1].totalReturn||z.scenarios[h].cases[0].priceReturn-a.scenarios[h].cases[0].priceReturn||a.code.localeCompare(z.code);};
 const expected=b.models.filter(m=>m.rankEligible!==false&&m.scenarios[h]&&m.scores[h]).sort(order);
 check(h+' exact order and continuous ranks',expected.length===b.rankings[h].length&&expected.every((m,i)=>b.rankings[h][i].code===m.code&&b.rankings[h][i].rank===i+1));
 const leaders=b.rankings[h].filter(r=>r.topTenDistinct);
 check(h+' ten different issuer leaders',leaders.length===10&&new Set(leaders.map(r=>r.issuerId)).size===10);
 let tier=0,top=null;
 for(const [i,m]of expected.entries()){
  const s=m.scores[h],r=b.rankings[h][i];
  if(top===null||top-s.total>=3){tier++;top=s.total;}
  check(m.code+'/'+h+' tier',r.tier==='第'+tier+'梯队');
  check(m.code+'/'+h+' score',Math.abs(s.dimensions.reduce((a,x,j)=>a+x*b.weights[h][j]/5,0)-s.total)<1e-8&&s.dimensions.every(x=>x>=0&&x<=5));
 }
}
for(const m of b.models)for(const[h,s]of Object.entries(m.scenarios)){
 check(m.code+'/'+h+' three finite cases',s.cases.length===3&&s.cases.every(c=>Number.isFinite(c.price)&&c.price>=0&&Number.isFinite(c.dividend)));
 for(const c of s.cases){
  check(m.code+'/'+h+' capital return',Math.abs(c.priceReturn-(c.price/m.price-1))<1e-9);
  check(m.code+'/'+h+' total return',Math.abs(c.totalReturn-((c.price+c.dividend)/m.price-1))<1e-9);
  if(b.years[h]>=3)check(m.code+'/'+h+' annualized total return',Math.abs(c.annualized-(((c.price+c.dividend)/m.price)**(1/b.years[h])-1))<1e-9);
 }
 check(m.code+'/'+h+' weighted expectation',Math.abs(s.expectedPrice-(s.cases[0].price*.25+s.cases[1].price*.5+s.cases[2].price*.25))<1e-9);
}
for(const m of b.conditionedModels){
 check(m.code+' no formal scenarios, scores or ranking',m.rankEligible===false&&Object.keys(m.scenarios).length===0&&Object.keys(m.scores).length===0&&Object.values(b.rankings).every(rows=>!rows.some(r=>r.code===m.code)));
 check(m.code+' conditional five horizons',Object.keys(m.conditionalScenarios??{}).length===5);
}
const keys=new Set();
for(const x of b.brokers){
 const key=[x.code,x.institution,x.currency].join('|');
 check('Broker latest deduplicated '+key,!keys.has(key));keys.add(key);
 check('Broker target positive '+key,Number.isFinite(x.targetPrice)&&x.targetPrice>0);
 check('Broker dated by cutoff '+key,/^20\d{2}-\d{2}-\d{2}/.test(x.publicationDate??'')&&x.publicationDate.slice(0,10)<=b.asOf);
 const security=b.universe.securities.find(s=>s.code===x.code);
 const adrReference=x.currency==='USD'&&((x.code==='ONC.US (ADR)'&&x.ordinaryRatio===13)||(['JD.US','BIDU.US'].includes(x.code)&&x.ADSOrdinarySharesRatio>0&&/非机构港股目标/.test(x.conversionCaution??'')));
 check('Broker security currency '+key,security?x.currency===security.currency:adrReference);
 check('Broker linked source '+key,Boolean(x.sourceURL??x.url));
 if(x.code==='ONC.US (ADR)'&&x.derivedHKDPriceAssumption!=null)check('ADR target never relabelled original HK target '+key,x.ordinaryRatio===13&&/非机构港股目标/.test(x.securityMatch));
}
for(const m of b.conditionedModels)for(const x of m.brokerTargets??[])if(x.verified){
 const candidates=b.brokers.filter(z=>z.issuerId===m.issuerId&&z.institution===x.institution&&z.currency===x.currency);
 const alias={'花旗':'Citi','高盛':'Goldman Sachs','摩根大通':'JPMorgan','大和':'Daiwa','富瑞':'Jefferies','汇丰研究':'HSBC','美银证券':'Bank of America','BofA Securities':'Bank of America','摩根士丹利':'Morgan Stanley','野村':'Nomura','大华继显':'UOB Kay Hian','里昂':'CLSA','麦格理':'Macquarie','星展':'DBS'};
 check('Conditional broker remains visible '+m.code+'/'+x.institution,candidates.length>0||b.brokers.some(z=>z.issuerId===m.issuerId&&z.institution===(alias[x.institution]??x.institution)&&z.currency===x.currency));
}
check('No post-cutoff published financial input',b.sources.every(s=>s.cutoffStatus!=='晚于截止日，不作为截止日输入'));
check('No missing source units',b.sources.every(s=>s.currency&&s.currency!=='待核'&&s.unit&&s.unit!=='待核'));
check('No missing publication date',b.sources.every(s=>s.cutoffStatus!=='公开日期缺失待核'));
const report={fingerprint:b.fingerprint,asOf:b.asOf,checks:checks.length,ranked:b.models.length,conditional:b.conditionedModels.length,brokerRecords:b.brokers.length,passed:!errors.length,errors,details:checks};
await fs.writeFile(path.join(root,'qa/ranking_broker_qa.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({fingerprint:b.fingerprint,checks:report.checks,passed:report.passed,errors}));
if(errors.length)process.exitCode=1;
