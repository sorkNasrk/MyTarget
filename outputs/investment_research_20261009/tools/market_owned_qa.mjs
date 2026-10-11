import fs from 'node:fs';
import path from 'node:path';
const base='G:/MyTarget/outputs/investment_research_20261009';
const name=process.argv[2]||'wuxi_apptec';
const body=fs.readFileSync(path.join(base,'research',`${name}_deep.md`),'utf8');
const model=JSON.parse(fs.readFileSync(path.join(base,'data',`${name}_model.json`),'utf8'));
const sourcePos=body.indexOf('## 来源');
let counted=sourcePos>=0?body.slice(0,sourcePos):body;
const start=counted.indexOf('## 投资结论');
if(start>=0)counted=counted.slice(start);
counted=counted.split(/\r?\n/).filter(x=>!/^\s*(#|\|)/.test(x)).join('\n');
const paragraphs=counted.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
const duplicate=paragraphs.filter((p,i)=>paragraphs.indexOf(p)!==i);
const hanzi=(counted.match(/[\p{Script=Han}]/gu)||[]).length;
const errors=[];
const near=(a,b,label)=>{if(Math.abs(a-b)>1e-6)errors.push(`${label}: ${a} != ${b}`);};
if(!model.scores.A){
 for(const [period,s]of Object.entries(model.scenarios)){
  for(let i=0;i<3;i++){
   const p=s.epsCNY[i]*s.PE[i];
   near(s.priceCNY[i],p,`${period}.price.${i}`);
   near(s.priceReturnPct[i],100*(p/model.price-1),`${period}.return.${i}`);
   near(s.totalReturnPct[i],100*((p+s.cumulativeCashDividendCNY[i])/model.price-1),`${period}.total.${i}`);
  }
  const years={threeYear:3,fiveYear:5}[period];if(years)near(s.baseAnnualizedTotalReturnPct,100*((1+s.totalReturnPct[1]/100)**(1/years)-1),`${period}.annual`);
  if(period==='yearEnd'){
   near(s.weights.reduce((a,b)=>a+b,0),1,'weights');
   near(s.expectedPriceCNY,s.priceCNY.reduce((a,v,i)=>a+v*s.weights[i],0),'expected');
   near(s.weightSensitivity.defensivePrice,s.priceCNY.reduce((a,v,i)=>a+v*s.weightSensitivity.defensiveWeights[i],0),'defensive');
   near(s.weightSensitivity.positivePrice,s.priceCNY.reduce((a,v,i)=>a+v*s.weightSensitivity.positiveWeights[i],0),'positive');
  }
 }
 for(const [h,s]of Object.entries(model.scores)){
  near(s.weights.reduce((a,b)=>a+b,0),100,`${h}.weights`);
  near(s.total,s.dimensions.reduce((a,v,i)=>a+v/5*s.weights[i],0),`${h}.score`);
 }
 if(duplicate.length)errors.push(`${duplicate.length} duplicate paragraphs`);
 console.log(JSON.stringify({issuerId:model.issuerId,name:model.name,asOf:model.asOf,effectiveHanzi:hanzi,threshold:10000,countMethod:'正文剔除标题、基准头、表格及来源区后Unicode Han字符；无长引文',paragraphs:paragraphs.length,exactDuplicateParagraphs:duplicate.length,formulaChecks:errors.length===0,errors,passed:hanzi>=10000&&errors.length===0},null,2));
 process.exit(errors.length?1:0);
}
for(const [period,s] of Object.entries(model.scenarios)){
 for(let i=0;i<3;i++){
  const a=s.eps[i]*s.PEA[i],h=s.eps[i]*s.PEH[i]*model.fx.HKDperCNY;
  near(s.A[i],a,`${period}.A.${i}`);near(s.H[i],h,`${period}.H.${i}`);
  near(s.Areturn[i],100*(a/model.securities[0].price-1),`${period}.Areturn.${i}`);
  near(s.Hreturn[i],100*(h/model.securities[1].price-1),`${period}.Hreturn.${i}`);
  near(s.Atotal[i],100*((a+s.div[i])/model.securities[0].price-1),`${period}.Atotal.${i}`);
  near(s.Htotal[i],100*((h+s.div[i]*model.fx.HKDperCNY)/model.securities[1].price-1),`${period}.Htotal.${i}`);
 }
 const years={threeYear:3,fiveYear:5}[period];
 if(years){for(const sec of ['A','H'])near(s[`${sec}baseAnnualizedTotalReturnPct`],100*((1+s[`${sec}total`][1]/100)**(1/years)-1),`${period}.${sec}.annual`);}
}
for(const [sec,periods] of Object.entries(model.scores))for(const [period,s]of Object.entries(periods)){
 near(s.weights.reduce((a,b)=>a+b,0),100,`${sec}.${period}.weights`);
 near(s.total,s.dimensions.reduce((a,v,i)=>a+v/5*s.weights[i],0),`${sec}.${period}.score`);
}
for(const sec of ['A','H']){
 const vals=model.scenarios.yearEnd[sec];
 for(const [tag,weight,key]of[['default','weights',`expectedYearEnd${sec}`],['defensive','defensiveWeights',`defensiveYearEnd${sec}`],['positive','positiveWeights',`positiveYearEnd${sec}`]]){
  near(model.probability[weight].reduce((a,b)=>a+b,0),1,`${tag}.weights`);
  near(model.probability[key],vals.reduce((a,v,i)=>a+v*model.probability[weight][i],0),`${tag}.${sec}`);
 }
}
const late=(model.brokerTargets||[]).filter(x=>x.date>model.asOf);
if(late.length)errors.push('Broker after asOf');
if(duplicate.length)errors.push(`${duplicate.length} duplicate paragraphs`);
const brokerH=(model.brokerTargets||[]).filter(x=>x.currency==='HKD').map(x=>x.target).sort((a,b)=>a-b);
console.log(JSON.stringify({issuerId:model.issuerId,name:model.name,asOf:model.asOf,effectiveHanzi:hanzi,threshold:10000,countMethod:'正文剔除标题、基准头、表格及来源区后Unicode Han字符；无长引文',paragraphs:paragraphs.length,exactDuplicateParagraphs:duplicate.length,formulaChecks:errors.length===0,errors,brokerHMean:brokerH.reduce((a,b)=>a+b,0)/brokerH.length,brokerHMedian:brokerH[Math.floor(brokerH.length/2)],passed:hanzi>=10000&&errors.length===0},null,2));
