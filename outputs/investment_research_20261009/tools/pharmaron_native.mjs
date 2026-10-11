// The annual operating and funding bridge is separate from the PE equity value.
// Native inputs remain unchanged on disk; this adapter lives in the research bundle.
export const segmentFields=['lab','cdmo','clinical','labGM','cdmoGM','clinicalGM','selling','admin','rd','impairment','fxloss','bankInterest','tax','minorityAdd','normalShares','DandA','capex','nwcCash','investment','SBCcashAdj','annualDividend','bankNetFunding'];
export const segmentLabels=['实验室收入','CDMO收入','临床收入','实验室毛利率','CDMO毛利率','临床毛利率','销售费用','行政费用','研发费用','减值','正常汇兑损失','银行利息','税率','少数亏损归属加回','正常摊薄股数','折旧摊销','年度资本开支','营运资金占用','年度股权投资','股酬现金流调节','年度每股分红CNY','银行净融资'];
export const segmentGlobalFields=['startCash','startBank','cbNetProceeds','cbFace','cbShares','convert','H1OCF','H1Interest','H1Capex','H1Investment','declaredDividendCash','firstLease','annualLease','otherRevenue','otherGM'];
export const segmentGlobalLabels=['六月末流动资产现金','六月末银行债','2026转债净募资','转债面额','转股增量十亿股','2027转股 1或0','已报H1经营现金','H1融资银行利息','H1资本开支','H1股权投资','2026已宣派分红现金','2026剩余租赁本金','以后年度租赁本金','其他收入','其他毛利率'];
const cases=['bear','base','bull'];
export function initializeSegmentCashBridge(m){
 if(m.issuerId!=='I022'||!m.annualInput||!m.annualForecast)return false;
 const cb=m.cashBridge,f=m.financialVerified,c=m.convertible;
 m.segmentCashBridge={years:m.annualForecast.base.map(x=>x.year),inputs:structuredClone(m.annualInput),globals:cases.map(label=>({startCash:cb.liquidCashCNYbn,startBank:cb.bankDebtCNYbn,cbNetProceeds:cb.CBnetCNYbn,cbFace:c.faceCNYbn,cbShares:c.underlyingShares/1e9,convert:m.annualInput[label].convert?1:0,H1OCF:cb.actualH1OCFBeforeFinancingInterestCNYbn,H1Interest:cb.actualH1FinancingBankInterestCNYbn,H1Capex:(f.PPECash+f.intangibleCash)/1000,H1Investment:cb.actualH1EquityAndAssociateInvestmentCashCNYbn,declaredDividendCash:cb.actualDeclaredFinalDividendCashCNYbn,firstLease:.1,annualLease:.2,otherRevenue:.02,otherGM:.1}))};
 for(let c=0;c<3;c++){
  const rows=calculateSegmentAnnual(m,c),native=m.annualForecast[cases[c]];
  for(let i=0;i<rows.length;i++)for(const key of ['revenueCNYbn','grossProfitCNYbn','parentNormalProfitCNYbn','dilutedSharesBn','EPS_CNY','annualOCF_CNYbn','forecastLiquidCashCNYbn','forecastBankDebtCNYbn','forecastNetDebtCNYbn'])if(Math.abs(rows[i][key]-native[i][key])>1e-9)throw Error('Native segment bridge mismatch '+m.code+' '+cases[c]+' '+rows[i].year+' '+key);
 }
 return true;
}
export function calculateSegmentAnnual(m,c){
 const b=m.segmentCashBridge,v=b.inputs[cases[c]],g=b.globals[c];
 if(![0,1].includes(g.convert))throw Error('Convertible settlement must be exactly 0 or 1');
 let cash=g.startCash,bank=g.startBank;
 return b.years.map((year,n)=>{
  const revenue=v.lab[n]+v.cdmo[n]+v.clinical[n]+g.otherRevenue;
  const gross=v.lab[n]*v.labGM[n]+v.cdmo[n]*v.cdmoGM[n]+v.clinical[n]*v.clinicalGM[n]+g.otherRevenue*g.otherGM;
  const pretax=gross-v.selling[n]-v.admin[n]-v.rd[n]-v.impairment[n]-v.fxloss[n]-v.bankInterest[n],consolidated=pretax*(1-v.tax[n]),parent=consolidated+v.minorityAdd[n];
  const shares=v.normalShares[n]+(g.convert===1&&year>=2027?g.cbShares:0);
  const ocf=consolidated+v.DandA[n]+v.SBCcashAdj[n]-v.nwcCash[n],remainingOCF=n===0?ocf-(g.H1OCF-g.H1Interest):ocf,capex=n===0?v.capex[n]-g.H1Capex:v.capex[n],lease=n===0?g.firstLease:g.annualLease,investment=n===0?v.investment[n]-g.H1Investment:v.investment[n],dividend=n===0?g.declaredDividendCash:v.annualDividend[n-1]*shares,proceeds=n===0?g.cbNetProceeds:0,repay=year===2027&&g.convert===0?g.cbFace:0,cashStart=cash;
  cash+=remainingOCF-capex-lease-investment-dividend+proceeds-repay+v.bankNetFunding[n];bank+=v.bankNetFunding[n];
  return {year,revenueCNYbn:revenue,grossProfitCNYbn:gross,pretaxCNYbn:pretax,consolidatedNormalProfitCNYbn:consolidated,parentNormalProfitCNYbn:parent,dilutedSharesBn:shares,EPS_CNY:parent/shares,annualOCF_CNYbn:ocf,annualFCFBeforeLeaseCNYbn:ocf-v.capex[n],cashStartCNYbn:cashStart,cashRemainingOperatingCNYbn:remainingOCF,capexRemainingCNYbn:capex,leasePrincipalCashCNYbn:lease,financialEquityInvestmentCashCNYbn:investment,dividendCashCNYbn:dividend,CBcashProceedsCNYbn:proceeds,CBcashRepaymentCNYbn:repay,bankNetFundingCNYbn:v.bankNetFunding[n],forecastLiquidCashCNYbn:cash,forecastBankDebtCNYbn:bank,CBfaceOutstandingCNYbn:year===2026?g.cbFace:0,forecastNetDebtCNYbn:bank+(year===2026?g.cbFace:0)-cash};
 });
}
export function calculateSegmentHorizon(m,h,c){
 const s=m.scenarios[h],rows=calculateSegmentAnnual(m,c),r=rows.find(r=>r.year===s.earningsYear);
 if(!r)throw Error('Missing target earnings year '+h);
 const fx=s.fxCases?.[c]??m.fxValue,count={yearEnd:0,halfYear:0,oneYear:1,threeYear:3,fiveYear:5}[h];
 return {eps:r.EPS_CNY,price:r.EPS_CNY*s.cases[c].PE*fx,dividend:m.segmentCashBridge.inputs[cases[c]].annualDividend.slice(0,count).reduce((a,z)=>a+z,0)*fx,rows};
}
