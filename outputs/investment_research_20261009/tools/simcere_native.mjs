// Independent adapter: keeps the authored Simcere model and original evidence intact.
export const simcereCases=['bear','base','bull'];
export const simcereFields=['neuro','auto','onc','other','selling','admin','rd','impairment','interest','redemptionInterest','parentShare','shares','DA','SBC','capex','licensePurchase','NWC','milestoneCash','dividend','buyback','bankFunding'];
export const simcereLabels=['神经既有收入','免疫既有收入','肿瘤既有收入','其他既有收入','销售费用','行政费用','全集团研发费用','减值','银行租赁利息','赎回利息','未赎回分支肿瘤经济母份额','摊薄股数','折旧摊销','股酬现金调节','年度资本开支','年度许可购买现金','营运资金增加','所选里程碑税前现金','年度每股分红CNY','回购现金','银行净融资'];
export const simcereGlobalFields=['neuroGM','autoGM','oncGM','otherGM','tax','startCash','startBank','initialRedemptionLiability','redemptionFlag','redemptionYear','redemptionCash','postRedemptionParentShare','oncSellingFraction','oncAdminFraction','oncRDFraction','oncImpairmentFraction','H2CoreOCFFraction','H1Capex','H1LicensePurchase','firstDividendCash','annualLease','RocheGrossUSD','RocheNetFactor','milestoneNetFactor','CNYperUSD'];
export const simcereGlobalLabels=['神经毛利率','免疫毛利率','肿瘤毛利率','其他毛利率','税率','六月流动现金含定存','六月银行债','六月赎回负债','现金赎回分支1或0','赎回年度','赎回现金','赎回后经济母份额','肿瘤销售费用分配','肿瘤行政费用分配','肿瘤研发费用分配','肿瘤减值分配','2026剩余核心OCF占全年','实际H1资本开支','实际H1许可购买现金','2026已宣派分红现金','年度租赁本金','Roche首付USD十亿','Roche净现金比例','所选里程碑净现金比例','CNY每USD研究假设'];
export const simcereDomesticFields=['start','peak','success','GM'];
export const simcereRoyaltyFields=['start','peakUSD','success','royalty','costRate'];
export function initializeSimcereBridge(m){
 if(m.issuerId!=='I033'||!m.annualInput||!m.annualForecast)return false;
 const cb=m.cashBridge,f=m.financialVerified;
 m.simcereBridge={years:m.annualForecast.base.map(r=>r.year),inputs:structuredClone(m.annualInput),ramp:structuredClone(m.ramp),domestic:structuredClone(m.domesticRiskAssumptions),royalty:structuredClone(m.foreignRoyaltyAssumptions),globals:simcereCases.map((name,c)=>{
  const v=m.annualInput[name];return {neuroGM:v.neuroGM,autoGM:v.autoGM,oncGM:v.oncGM,otherGM:v.otherGM,tax:v.tax,startCash:cb.liquidCashCNYbn,startBank:cb.bankDebtCNYbn,initialRedemptionLiability:cb.redemptionLiabilityCNYbn,redemptionFlag:c===0?1:0,redemptionYear:2027,redemptionCash:1.32,postRedemptionParentShare:.98,oncSellingFraction:.26,oncAdminFraction:.32,oncRDFraction:.4,oncImpairmentFraction:.35,H2CoreOCFFraction:.5,H1Capex:f.PPEcash/1000,H1LicensePurchase:f.intangibleCash/1000,firstDividendCash:f.dividendDeclared/1000,annualLease:.04,RocheGrossUSD:.075,RocheNetFactor:.85,milestoneNetFactor:.85,CNYperUSD:m.fx.CNYperUSD};
 })};
 // Without redemption, the bearish ownership path keeps the disclosed 83.1% anchor.
 // The redemption branch supplies 98% separately, avoiding an ownership uplift
 // with no corresponding cash settlement when the editable switch is changed.
 m.simcereBridge.inputs.bear.parentShare=m.simcereBridge.inputs.bear.parentShare.map(()=>.831);
 for(let c=0;c<3;c++){
  const rows=calculateSimcereAnnual(m,c),native=m.annualForecast[simcereCases[c]];
  for(let n=0;n<rows.length;n++)for(const key of ['coreRevenueCNYbn','coreGrossProfitCNYbn','oncologyNormalPretaxCNYbn','corePretaxCNYbn','consolidatedCoreProfitCNYbn','coreNetProfitCNYbn','epsCNY','normalizedOCFCNYbn','remainingOperatingCashCNYbn','forecastLiquidCashCNYbn','forecastBankDebtCNYbn','forecastRedemptionLiabilityCNYbn'])if(Math.abs(rows[n][key]-native[n][key])>1e-9)throw Error('Simcere annual adapter mismatch '+simcereCases[c]+' '+rows[n].year+' '+key);
  for(const [h,s]of Object.entries(m.scenarios)){const r=calculateSimcereHorizon(m,h,c);if(Math.abs(r.intrinsicPrice-s.intrinsicPrices[c])>1e-9||Math.abs(m.price+(r.intrinsicPrice-m.price)*s.marketRecognitionFactor[c]-s.cases[c].price)>1e-9||Math.abs(r.dividend-s.cases[c].dividend)>1e-9)throw Error('Simcere horizon adapter mismatch '+h+' '+c);}
 }
 return true;
}
const selected=(value,c)=>Array.isArray(value)?value[c]:value;
const rampFor=(b,year,start)=>year<start?0:(b.ramp[year-start]??1);
export function calculateSimcereAnnual(m,c){
 const b=m.simcereBridge,v=b.inputs[simcereCases[c]],g=b.globals[c];
 if(![0,1].includes(g.redemptionFlag))throw Error('Simcere redemption flag must be 0 or 1');
 let cash=g.startCash,bank=g.startBank;
 return b.years.map((year,n)=>{
  const domestic=b.domestic.map(a=>{const nominal=a.peak[c]*rampFor(b,year,a.start[c]),income=nominal*a.success[c];return{id:a.id,segment:a.segment,nominalRevenueCNYbn:nominal,riskRevenueCNYbn:income,riskGrossProfitCNYbn:income*a.GM[c]};});
  const royalties=b.royalty.map(a=>{const sales=a.peakUSD[c]*rampFor(b,year,a.start[c]),income=sales*g.CNYperUSD*a.royalty[c]*a.success[c];return{id:a.id,segment:a.segment,partnerNominalSalesUSDbn:sales,riskRoyaltyRevenueCNYbn:income,riskRoyaltyGrossCNYbn:income*(1-selected(a.costRate,c))};});
  const segments=['neuro','auto','onc','other'].map(seg=>{const dr=domestic.filter(a=>a.segment===seg),rr=royalties.filter(a=>a.segment===seg);return{segment:seg,revenueCNYbn:v[seg][n]+dr.reduce((s,a)=>s+a.riskRevenueCNYbn,0)+rr.reduce((s,a)=>s+a.riskRoyaltyRevenueCNYbn,0),grossProfitCNYbn:v[seg][n]*g[seg+'GM']+dr.reduce((s,a)=>s+a.riskGrossProfitCNYbn,0)+rr.reduce((s,a)=>s+a.riskRoyaltyGrossCNYbn,0)};});
  const revenue=segments.reduce((s,a)=>s+a.revenueCNYbn,0),gross=segments.reduce((s,a)=>s+a.grossProfitCNYbn,0),oncGP=segments.find(a=>a.segment==='onc').grossProfitCNYbn;
  const cost=v.selling[n]+v.admin[n]+v.rd[n]+v.impairment[n],oncCost=v.selling[n]*g.oncSellingFraction+v.admin[n]*g.oncAdminFraction+v.rd[n]*g.oncRDFraction+v.impairment[n]*g.oncImpairmentFraction,oncPretax=oncGP-oncCost,pretax=gross-cost-v.interest[n]-v.redemptionInterest[n],consolidated=pretax*(1-g.tax);
  const redeemed=g.redemptionFlag===1&&year>=g.redemptionYear,parentShare=redeemed?g.postRedemptionParentShare:v.parentShare[n],minority=(1-parentShare)*oncPretax*(1-g.tax),parent=consolidated-minority,eps=Math.max(0,parent)/v.shares[n];
  const ocf=consolidated+v.DA[n]+v.SBC[n]-v.NWC[n],cashOperating=n===0?ocf*g.H2CoreOCFFraction:ocf,capex=n===0?Math.max(0,v.capex[n]-g.H1Capex):v.capex[n],license=n===0?Math.max(0,v.licensePurchase[n]-g.H1LicensePurchase):v.licensePurchase[n],roche=n===0?g.RocheGrossUSD*g.CNYperUSD*g.RocheNetFactor:0,milestone=v.milestoneCash[n]*g.milestoneNetFactor,dividend=n===0?g.firstDividendCash:v.dividend[n-1]*v.shares[n],redemption=g.redemptionFlag===1&&year===g.redemptionYear?g.redemptionCash:0,start=cash;
  cash+=cashOperating-capex-license-g.annualLease+roche+milestone-dividend-v.buyback[n]-redemption+v.bankFunding[n];bank+=v.bankFunding[n];
  return{year,segments,domesticRiskAssets:domestic,foreignRoyalties:royalties,coreRevenueCNYbn:revenue,coreGrossProfitCNYbn:gross,coreGrossMargin:gross/revenue,oncologyAllocatedCostCNYbn:oncCost,oncologyNormalPretaxCNYbn:oncPretax,otherNormalPretaxCNYbn:gross-oncGP-(cost-oncCost),corePretaxCNYbn:pretax,consolidatedCoreProfitCNYbn:consolidated,oncologyEconomicParentShare:parentShare,oncologyMinorityProfitCNYbn:minority,coreNetProfitCNYbn:parent,dilutedSharesBn:v.shares[n],epsCNY:eps,normalizedOCFCNYbn:ocf,remainingOperatingCashCNYbn:cashOperating,remainingCapexCNYbn:capex,remainingLicensePurchaseCNYbn:license,leasePrincipalCNYbn:g.annualLease,RocheNetCashCNYbn:roche,selectedMilestoneNetCashCNYbn:milestone,dividendCashCNYbn:dividend,buybackCashCNYbn:v.buyback[n],redemptionSettlementCashCNYbn:redemption,bankNetFundingCNYbn:v.bankFunding[n],cashStartCNYbn:start,forecastLiquidCashCNYbn:cash,forecastBankDebtCNYbn:bank,forecastRedemptionLiabilityCNYbn:year<g.redemptionYear?g.initialRedemptionLiability:0};
 });
}
export function calculateSimcereHorizon(m,h,c){
 const s=m.scenarios[h],rows=calculateSimcereAnnual(m,c),r=rows.find(r=>r.year===s.earningsYear),fx=s.fxCases?.[c]??m.fxValue,count={yearEnd:0,halfYear:0,oneYear:1,threeYear:3,fiveYear:5}[h];
 if(!r)throw Error('Missing Simcere earnings year');
 return{eps:r.epsCNY,intrinsicPrice:r.epsCNY*s.cases[c].PE*fx,dividend:m.simcereBridge.inputs[simcereCases[c]].dividend.slice(0,count).reduce((s,a)=>s+a,0)*fx,rows};
}
