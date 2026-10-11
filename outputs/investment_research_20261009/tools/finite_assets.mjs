const years=(cashDate,target)=>(Date.parse(cashDate)-Date.parse(target))/86400000/365.25;
const close=(actual,expected,label)=>{if(!Number.isFinite(actual)||!Number.isFinite(expected)||Math.abs(actual-expected)>1e-7)throw Error(label+': '+actual+' vs '+expected);};

export function normalizeFiniteAssets(m,s){
 const assumptions=m.rNPVAssumptions;
 const usd=assumptions.CNYperUSD??assumptions.USDCNY;
 if(!Number.isFinite(usd))throw Error('Finite assets missing USD conversion '+m.code);
 s.purePipeline=true;s.equityFloorZero=true;s.coreRevenueCNYbn=[0,0,0];s.coreNetMargin=[0,0,0];
 s.dilutedSharesBn=s.components.map(v=>v.dilutedSharesBn);s.excessNetCashCNYbn=s.components.map(v=>v.netCashCNYbn);s.futureResearchReserveCNYbn=[0,0,0];s.cashBridgeAnchor={USDCNYAssumption:usd};
 if(s.components.every(p=>Number.isFinite(p.marketRecognitionFactor)))s.marketRecognitionFactor=s.components.map(p=>p.marketRecognitionFactor);
 s.pipelineRNpv=s.components.map(p=>{
  const a=p.assets;
  const groups=a.groups.map(g=>({id:g.id,name:g.name,currency:g.currency,successAssumption:g.success,netEconomicCashMarginAssumption:g.cashMargin*g.royaltyRate,parentEconomicShareAssumption:g.parentEconomicShare,stage:g.stage,PV_CNYbn:g.PV_CNYbn,annualCashflows:g.annualCashflows.map(f=>({cashDate:f.cashDate,yearsACT36525:f.yearsACT36525??years(f.cashDate,s.target),salesBn:f.grossSalesBn,currency:f.currency,directCostCNYbn:f.directDevelopmentCostCNYbn,targetYearRemainingFraction:f.targetYearRemainingFraction??1,riskAdjustedParentNetCashCNYbn:f.riskAdjustedOperatingCashCNYbn-f.directDevelopmentCostCNYbn,PV_CNYbn:f.netPV_CNYbn,pastAtTarget:!f.included}))}));
  groups.push({id:'centralCost',name:'其他项目中央研发及总部行政成本',currency:'CNY',successAssumption:1,netEconomicCashMarginAssumption:0,parentEconomicShareAssumption:1,stage:'cost reserve, not clinical asset',PV_CNYbn:-a.centralFutureCostPV_CNYbn,annualCashflows:a.central.map(f=>({cashDate:f.cashDate,yearsACT36525:f.yearsACT36525??years(f.cashDate,s.target),salesBn:0,currency:'CNY',directCostCNYbn:f.normalCentralResearchAdminCostCNYbn,targetYearRemainingFraction:f.targetYearRemainingFraction??1,riskAdjustedParentNetCashCNYbn:-f.normalCentralResearchAdminCostCNYbn,PV_CNYbn:-f.PV_CNYbn,pastAtTarget:!f.included}))});
  const milestones=a.milestones.map(f=>{
   const contract=assumptions.milestones?.find(c=>c.name===f.name);
   const taxFactor=f.taxFactor??contract?.tax,parentFactor=f.parentShare??contract?.share,success=f.success??f.p;
   if(![taxFactor,parentFactor,success].every(Number.isFinite))throw Error('Finite milestone missing explicit factors '+m.code+' '+f.name);
   return{id:f.name,cashDate:f.cashDate,yearsACT36525:f.yearsACT36525??years(f.cashDate,s.target),grossAmount:f.amount,currency:f.currency??contract?.currency??'USD',success,taxFactor,parentFactor,PV_CNYbn:f.PV_CNYbn,alreadyPastAtTarget:!f.included};
  });
  return{groups,milestones,totalPV_CNYbn:a.netAssetsBeforeCashCNYbn,discountRate:a.discountRate,limitation:assumptions.scope??m.method};
 });
 if(s.components.some(p=>p.vorResidual)){
  if(!s.components.every(p=>p.vorResidual))throw Error('Incomplete Vor residual scenarios '+m.code);
  s.recipientResidual=s.components.map((p,c)=>{
   const v=p.vorResidual,sourceGroupId='RC18_foreign',g=s.pipelineRNpv[c].groups.find(x=>x.id===sourceGroupId);
   if(!g)throw Error('Vor residual requires linked licensed sales '+m.code);
   return{sourceGroupId,sourceMilestoneIds:[...new Set(s.pipelineRNpv[c].milestones.filter(f=>f.id.startsWith('RC18 regulatory')).map(f=>f.id))],cashMarginBeforeRoyalty:v.annualCashflows[0].cashMarginBeforeRoyalty,royaltyTaxDeductionFactor:v.annualCashflows[0].royaltyTaxDeductionFactor,licensorPostTaxAndServicingFactor:p.assets.groups.find(x=>x.id===sourceGroupId).cashMargin,futureNetCashUSDbn:v.futureNetCashUSDbn,recipientDilutedSharesBn:v.recipientDilutedSharesBn,warrantUnderlyingBn:v.RemeGenWarrantUnderlyingBn,exercisePriceUSD:v.exercisePriceUSD,holdingFactor:v.holdingFactor,parentWarrantValueCNYbn:v.parentWarrantValueCNYbn,annualCashflows:v.annualCashflows.map(f=>({cashDate:f.cashDate,yearsACT36525:years(f.cashDate,s.target),recipientResearchCNYbn:f.recipientResearchCNYbn,targetYearRemainingFraction:f.targetYearRemainingFraction,PV_CNYbn:f.netPV_CNYbn}))};
  });
  for(let c=0;c<3;c++)close(calculateRecipientResidual(s,c),s.components[c].vorResidual.parentWarrantValueCNYbn,'Vor normalized equity '+m.code+' '+s.target+' '+c);
 }
 for(let c=0;c<3;c++){
  const pv=s.pipelineRNpv[c];
  for(const g of pv.groups){let sum=0;for(const f of g.annualCashflows){const calculated=f.pastAtTarget?0:(f.salesBn*g.successAssumption*g.netEconomicCashMarginAssumption*g.parentEconomicShareAssumption*(g.currency==='USD'?usd:1)-f.directCostCNYbn)*f.targetYearRemainingFraction/(1+pv.discountRate)**f.yearsACT36525;close(calculated,f.PV_CNYbn,'Finite asset row '+m.code+' '+g.id+' '+f.cashDate);sum+=calculated;}close(sum,g.PV_CNYbn,'Finite asset sum '+m.code+' '+g.id);}
  for(const f of pv.milestones)close(f.alreadyPastAtTarget?0:f.grossAmount*f.success*f.taxFactor*f.parentFactor*(f.currency==='USD'?usd:1)/(1+pv.discountRate)**f.yearsACT36525,f.PV_CNYbn,'Finite milestone '+m.code+' '+f.id+' '+f.cashDate);
  close(pv.groups.reduce((a,g)=>a+g.PV_CNYbn,0)+pv.milestones.reduce((a,f)=>a+f.PV_CNYbn,0),pv.totalPV_CNYbn,'Finite total '+m.code);
  s.cases[c].eps=0;s.cases[c].PE=0;
  const intrinsic=Math.max(0,pv.totalPV_CNYbn+s.excessNetCashCNYbn[c]+(s.recipientResidual?.[c].parentWarrantValueCNYbn??0))/s.dilutedSharesBn[c]*m.fxValue;
  const factor=s.marketRecognitionFactor?.[c]??s.recognitionFactor?.[c]??1;
  close(m.price+(intrinsic-m.price)*factor,s.cases[c].price,'Finite normalization price '+m.code+' '+s.target+' '+c);
 }
}

export function calculateRecipientResidual(s,c){
 const v=s.recipientResidual[c],pv=s.pipelineRNpv[c],g=pv.groups.find(g=>g.id===v.sourceGroupId),usd=pv.overrides?.CNYperUSD??s.cashBridgeAnchor.USDCNYAssumption,discount=pv.overrides?.discountRate??pv.discountRate;
 let total=0;
 for(const f of v.annualCashflows){
  const licensed=g.annualCashflows.find(x=>x.cashDate===f.cashDate);
  if(!licensed)throw Error('Missing recipient licensed cash date '+f.cashDate);
  const milestones=pv.milestones.filter(x=>v.sourceMilestoneIds.includes(x.id)&&x.cashDate===f.cashDate&&!x.alreadyPastAtTarget).reduce((sum,x)=>sum+x.grossAmount*x.success*x.taxFactor*x.parentFactor*(x.currency==='USD'?usd:1),0);
  const operating=licensed.salesBn*usd*g.successAssumption*(v.cashMarginBeforeRoyalty-g.netEconomicCashMarginAssumption/v.licensorPostTaxAndServicingFactor*v.royaltyTaxDeductionFactor);
  f.PV_CNYbn=((operating-f.recipientResearchCNYbn)*f.targetYearRemainingFraction-milestones)/(1+discount)**f.yearsACT36525;
  total+=f.PV_CNYbn;
 }
 v.netFutureRecipientValueCNYbn=total;v.recipientEquityCNYbn=Math.max(0,total+v.futureNetCashUSDbn*usd);
 v.exerciseCashCNYbn=v.warrantUnderlyingBn*v.exercisePriceUSD*usd;v.economicFraction=v.warrantUnderlyingBn/v.recipientDilutedSharesBn;
 v.parentWarrantValueCNYbn=Math.max(0,v.recipientEquityCNYbn*v.economicFraction-v.exerciseCashCNYbn)*v.holdingFactor;
 return v.parentWarrantValueCNYbn;
}
