import fs from 'node:fs';
const root='G:/MyTarget/outputs/investment_research_20261009',m=JSON.parse(fs.readFileSync(root+'/data/dizal_model.json','utf8')),txt=fs.readFileSync(root+'/research/dizal_deep.md','utf8');
const body=txt.slice(txt.indexOf('## 投资结论'),txt.indexOf('## 来源')).split(/\r?\n/).filter(l=>!/^\s*(#|\|)/.test(l)).join('\n'),paragraphs=body.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean),hanzi=(body.match(/[\p{Script=Han}]/gu)||[]).length;
const errors=[],near=(a,b,k)=>{if(Math.abs(a-b)>1e-6)errors.push(k+': '+a+' != '+b);};
for(const[h,s]of Object.entries(m.scenarios)){
 for(let i=0;i<3;i++){
  const r=s.components[i];let assetSum=0;
  for(const a of r.components){let pv=0;for(const f of a.cashFlows){const exponent=(Date.parse(f.cashDate)-Date.parse(s.target))/86400000/365.25;near(f.discountExponent,exponent,h+'.exponent');if(f.included!==(exponent>0))errors.push(h+'.pastCash');const cash=f.salesBn*a.royaltyOrFCFMargin*(a.kind==='royalty'?1-a.royaltyTaxRate:1)*a.successJudgment*(a.salesCurrency==='USD'?m.rNPVAssumptions.CNYperUSD:1);near(f.afterTaxCashCNYbn,cash,h+'.cash');const p=exponent>0?cash/(1+m.rNPVAssumptions.discountRate[i])**exponent:0;near(f.pvCNYbn,p,h+'.PV');pv+=p;}near(a.rNPVCNYbn,pv,h+'.assetPV');assetSum+=pv;}
  near(r.assetPVCNYbn,assetSum,h+'.assetSum');const t=(Date.parse('2030-12-31')-Date.parse(s.target))/86400000/365.25;const mp=t>0?r.milestoneExpectedUSDbn*6.8/(1+m.rNPVAssumptions.discountRate[i])**t:0;near(r.milestonePVCNYbn,mp,h+'.milestone');
  const equity=assetSum+mp+r.netCashCNYbn-r.futureDevelopmentAndCorporateReserveCNYbn,p=equity/r.dilutedSharesBn;near(r.totalEquityValueCNYbn,equity,h+'.equity');near(s.priceCNY[i],p,h+'.price');near(s.priceReturnPct[i],100*(p/m.price-1),h+'.return');near(s.totalReturnPct[i],100*((p+s.cumulativeCashDividendCNY[i])/m.price-1),h+'.total');
 }
 if(h==='yearEnd'){near(s.weights.reduce((a,b)=>a+b,0),1,'weights');near(s.expectedPriceCNY,s.priceCNY.reduce((a,p,i)=>a+p*s.weights[i],0),'expected');for(const tag of ['defensive','positive'])near(s.weightSensitivity[tag+'Price'],s.priceCNY.reduce((a,p,i)=>a+p*s.weightSensitivity[tag+'Weights'][i],0),tag);}
 const y={threeYear:3,fiveYear:5}[h];if(y)near(s.baseAnnualizedTotalReturnPct,100*((s.priceCNY[1]/m.price)**(1/y)-1),h+'.annual');
}
for(const[h,s]of Object.entries(m.scores)){near(s.weights.reduce((a,b)=>a+b,0),100,h+'.weights');near(s.total,s.dimensions.reduce((a,v,i)=>a+v*s.weights[i]/5,0),h+'.score');}
near(m.cashBridge.JuneBroadCashCNYbn-m.cashBridge.JuneDebtIncludingLeasesCNYbn,m.cashBridge.JuneBroadNetCashCNYbn,'netCash');near(m.cashBridge.JuneBroadNetCashCNYbn+m.upfront.convertedCNYbn,m.cashBridge.proFormaBeforeTaxAndH2CNYbn,'upfrontOnce');
const duplicate=paragraphs.filter((p,i)=>paragraphs.indexOf(p)!==i);if(duplicate.length)errors.push('Duplicate '+duplicate.length);
console.log(JSON.stringify({issuerId:m.issuerId,name:m.name,asOf:m.asOf,effectiveHanzi:hanzi,threshold:10000,paragraphs:paragraphs.length,exactDuplicateParagraphs:duplicate.length,formulaChecks:errors.length===0,checks:'各年现金流、美元换算、成功率、折现指数、目标日筛选、rNPV加总、里程碑过去现金剔除、净现金与一次首付款、股数、回报、年化、情景/评分权重',errors,passed:hanzi>=10000&&errors.length===0,yearEndSensitivity:m.scenarios.yearEnd.weightSensitivity},null,2));process.exit(errors.length?1:0);
