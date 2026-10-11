import fs from 'node:fs';
import crypto from 'node:crypto';
import {calculateXtalpiAnnual,calculateXtalpiHorizon} from './xtalpi_native.mjs';
const root='G:/MyTarget/outputs/investment_research_20261009';
const modelPath=root+'/data/xtalpi_model.pending.json',nativePath=root+'/tools/xtalpi_native.mjs';
const raw=fs.readFileSync(modelPath,'utf8'),m=JSON.parse(raw);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const cases=['bear','base','bull'],horizons=['yearEnd','half','one','three','long'];
const hs=Object.keys(m.scenarios);console.log('Horizon keys',hs);
const close=(x,y,t=1e-9)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=t;
const checks=[],check=(name,x)=>checks.push({name,pass:!!x});
const rows=cases.map((l,c)=>calculateXtalpiAnnual(m,c));
const totalLeaseCashModel='leasePaymentCNYbn' in rows[0][0];
const cashLease=r=>totalLeaseCashModel?r.leasePaymentCNYbn:r.leasePrincipalCNYbn;
const outputs=cases.map((l,c)=>({case:l,targets:hs.map(h=>{const z=calculateXtalpiHorizon(m,h,c);return{h,target:m.scenarios[h].target,marketPrice:z.price,intrinsic:z.intrinsicPrice,normalProfitCNYbn:z.normalProfit,cashCNYbn:z.cashAtTargetCNYbn,termCNYbn:z.termAtTargetCNYbn,MMFCNYbn:z.MMFAtTargetCNYbn,bankCNYbn:z.bankAtTargetCNYbn,bondCNYbn:z.bondAtTargetCNYbn,sharesBn:z.dilutedSharesBn,EPS_CNY:z.eps,minCash:z.minimumCashCNYbn,fundingFailure:z.fundingFailure,terminalRecovery:z.terminalRecoveryCNYbn};}),annual:rows[c].filter(x=>x.year<=2032||[2038,2051].includes(x.year)).map(x=>({year:x.year,revenues:x.revenueCNYbn,normalProfit:x.parentNormalProfitCNYbn,EBIT:x.EBIT_CNYbn,OCF:x.remainingOCF_CNYbn,capex:x.remainingCapexCNYbn,FCFbeforeDebtInvestment:x.remainingOCF_CNYbn-x.remainingCapexCNYbn-cashLease(x),cash:x.forecastCashCNYbn,term:x.forecastTermCNYbn,MMF:x.forecastMMFCNYbn,CBPay:x.CBPaymentCNYbn,CBConvert:x.CBConversionSharesBn,bankPay:x.bankPaymentCNYbn,financialRemaining:x.financialEndCNYbn,financialCash:x.financialRecoveryCashCNYbn,structuredRemaining:x.structuredEndCNYbn,associateRemaining:x.associateEndCNYbn,fundContribution:x.fundContributionCNYbn,fundStake:x.fundStakeCNYbn,dividend:x.dividendCashCNYbn,shares:x.dilutedSharesBn})),firstDividend:rows[c].find(x=>x.dividendCashCNYbn>0)?.year??null,minCashYear:rows[c].reduce((a,b)=>a.forecastCashCNYbn<b.forecastCashCNYbn?a:b).year}));
for(let c=0;c<3;c++){const g=m.xtalpiBridge.globals[c];for(let n=0;n<rows[c].length;n++){const r=rows[c][n],prev=rows[c][n-1],year=r.year;
check(`${cases[c]} ${year} normal profit to cash bridge`,close(r.remainingOCF_CNYbn,(r.parentNormalProfitCNYbn+r.DA_CNYbn+r.SBC_CNYbn+(totalLeaseCashModel?r.leaseInterestCNYbn:0)-r.NWC_CNYbn)*(n?1:g.H2ForecastFraction)));
const cash=r.cashStartCNYbn+r.preIssuedOptionCashCNYbn+r.structuredRecoveryCashCNYbn+r.financialRecoveryCashCNYbn+r.associateRecoveryCashCNYbn+r.remainingOCF_CNYbn-r.remainingCapexCNYbn-r.bankPaymentCNYbn-cashLease(r)+r.termRedemptionCNYbn+r.MMFRedemptionCNYbn+r.CBIssueNetCNYbn-r.CBPaymentCNYbn+r.exerciseCashCNYbn-r.knownH2BuybackCNYbn+r.issueNetCNYbn-r.fundContributionCNYbn-r.dividendCashCNYbn;
check(`${cases[c]} ${year} full cash arithmetic`,close(r.forecastCashCNYbn,cash));
check(`${cases[c]} ${year} debt repayment or conversion`,close(r.CBPaymentCNYbn/g.CBRedemptionFactor+r.CBConversionPrincipalCNYbn+(year===g.CBMaturityYear?0:r.forecastBondCNYbn),r.bondStartCNYbn));
check(`${cases[c]} ${year} net financial realised and left`,close(r.financialRecoveryCashCNYbn,r.financialRealiseCNYbn*g.financialRecovery*g.financialParentFraction));
check(`${cases[c]} ${year} financial residual NAV`,close(r.financialStakeCNYbn,r.financialEndCNYbn*g.financialRecovery*g.financialParentFraction+r.structuredEndCNYbn*g.structuredRecovery+r.associateEndCNYbn*g.associateRecovery));
check(`${cases[c]} ${year} issued cash and shares`,close(r.issueNetCNYbn,r.issueGrossCNYbn*g.issueNetFactor)&&close(r.issueSharesBn,r.issueGrossCNYbn*g.FX/r.issuePriceHKD));
check(`${cases[c]} ${year} shares bridge`,close(r.dilutedSharesBn,r.sharesStartBn+r.CBConversionSharesBn+r.optionsExerciseSharesBn+r.RSUvestSharesBn+r.employeeSharesBn+r.issueSharesBn));
if(prev)check(`${cases[c]} ${year} cash stock continuity`,close(r.cashStartCNYbn,prev.forecastCashCNYbn));
}
for(const h of hs){const z=calculateXtalpiHorizon(m,h,c),last=rows[c].at(-1),endValue=Math.max(0,last.forecastCashCNYbn+last.forecastTermCNYbn+last.forecastMMFCNYbn+last.financialStakeCNYbn+last.fundStakeCNYbn-last.forecastBankCNYbn-last.forecastBondCNYbn);check(`${cases[c]} ${h} post-dividend terminal recovery`,close(z.terminalRecoveryCNYbn,endValue));check(`${cases[c]} ${h} EPS target shares`,close(z.eps,z.normalProfit/z.dilutedSharesBn));check(`${cases[c]} ${h} discount flows`,z.fundingFailure?z.intrinsicPrice===0:close(z.intrinsicPrice,z.flows.reduce((s,x)=>s+x.presentValueHKD,0)));}}
for(let c=0;c<3;c++){
const g=m.xtalpiBridge.globals[c],a=m.xtalpiBridge.inputs[cases[c]],maturity=rows[c].find(x=>x.year===g.CBMaturityYear),prior=rows[c].find(x=>x.year===g.CBMaturityYear-1);
const frac=(Date.parse(g.CBMaturityYear+'-01-26')-Date.parse(g.CBMaturityYear+'-01-01'))/(Date.parse((g.CBMaturityYear+1)+'-01-01')-Date.parse(g.CBMaturityYear+'-01-01'));
const debtEventCash=prior.forecastCashCNYbn+(maturity.forecastCashCNYbn-prior.forecastCashCNYbn+maturity.CBPaymentCNYbn)*frac-maturity.CBPaymentCNYbn;
const expectedMinimum=Math.min(...rows[c].map(x=>x.forecastCashCNYbn),...(maturity.CBPaymentCNYbn>0?[debtEventCash]:[]));
check(`${cases[c]} H2 lease cash subtracts reported H1 once`,close(cashLease(rows[c][0]),a.leasePayment[0]-g.H1LeaseCash));
for(const h of hs)check(`${cases[c]} ${h} minimum includes known CB-event cash`,close(calculateXtalpiHorizon(m,h,c).minimumCashCNYbn,expectedMinimum));
}
const oneKey=hs.find(h=>m.scenarios[h].target.startsWith('2027-10'));
const threeKey=hs.find(h=>m.scenarios[h].target.startsWith('2029'));
const longKey=hs.find(h=>m.scenarios[h].target.startsWith('2031'));
const yearEndKey=hs.find(h=>m.scenarios[h].target.startsWith('2026'));
const summary=z=>({intrinsic:z.intrinsicPrice,market:z.price,minCash:z.minimumCashCNYbn,failure:z.fundingFailure,terminalRecovery:z.terminalRecoveryCNYbn});
const sensitivity=[];
const variant=(name,fn)=>{const v=structuredClone(m);fn(v);const vals=[oneKey,threeKey,longKey].map(h=>({h,...summary(calculateXtalpiHorizon(v,h,1))}));sensitivity.push({name,vals});};
variant('Base unmodified',v=>{});
variant('Discount 10% diagnostic',v=>v.xtalpiBridge.globals[1].discount=.10);
variant('Discount 16% diagnostic',v=>v.xtalpiBridge.globals[1].discount=.16);
variant('No dividends; retain cash until2051',v=>v.xtalpiBridge.globals[1].distributionRate=0);
variant('100% profit distribution reserve1bn',v=>v.xtalpiBridge.globals[1].distributionRate=1);
variant('All CB convert at Jan26, no repayment',v=>v.xtalpiBridge.globals[1].CBConversionFraction=1);
variant('NCI financial fraction87.69% proxy diagnostic',v=>v.xtalpiBridge.globals[1].financialParentFraction=.8769);
variant('H2 operating cash fraction35% diagnostic',v=>v.xtalpiBridge.globals[1].H2ForecastFraction=.35);
variant('H2 operating cash fraction65% diagnostic',v=>v.xtalpiBridge.globals[1].H2ForecastFraction=.65);
variant('No later equity investments and no fund NAV',v=>{v.xtalpiBridge.inputs.base.fundContribution.fill(0);});
const timings=[];
for(const target of ['2027-01-25','2027-01-26']){const v=structuredClone(m);v.scenarios[oneKey].target=target;const z=calculateXtalpiHorizon(v,oneKey,1);timings.push({target,cash:z.cashAtTargetCNYbn,bond:z.bondAtTargetCNYbn,shares:z.dilutedSharesBn});}
const vConvertible=structuredClone(m);vConvertible.xtalpiBridge.globals[1].CBConversionFraction=1;
for(const target of ['2027-01-25','2027-01-26']){const v=structuredClone(vConvertible);v.scenarios[oneKey].target=target;const z=calculateXtalpiHorizon(v,oneKey,1);timings.push({target,allConvert:true,cash:z.cashAtTargetCNYbn,bond:z.bondAtTargetCNYbn,shares:z.dilutedSharesBn});}
check('CB redemption event cash jump',close(timings[0].cash-timings[1].cash,rows[1][1].CBPaymentCNYbn-(rows[1][1].forecastCashCNYbn-rows[1][0].forecastCashCNYbn+rows[1][1].CBPaymentCNYbn)/365,1e-9));
check('CB event bond removed',timings[0].bond>0&&timings[1].bond===0&&timings[2].bond>0&&timings[3].bond===0);
check('CB event all-conversion share jump',timings[3].shares-timings[2].shares>.2068&&timings[3].shares-timings[2].shares<.2071);
const targetBase=calculateXtalpiHorizon(m,oneKey,1),positiveYear=rows[1].find(x=>x.EBIT_CNYbn>0)?.year??null;

const original=JSON.parse(fs.readFileSync(root+'/data/xtalpi_model.json','utf8'));
const originalIsV1=original.modelVersion.startsWith('xtalpi-v1-');
const budgetTransitions=[];
check('v2 43 unique per-asset IDs',m.xtalpiBridge.assets.length===43&&new Set(m.xtalpiBridge.assets.map(x=>x.id)).size===43);
check('36 observations retain closed gate, unknown success and missing reason',m.xtalpiBridge.assets.filter(x=>x.eligibleAtCutoff===0).length===36&&m.xtalpiBridge.assets.filter(x=>x.eligibleAtCutoff===0).every(x=>x.successProbability===null&&typeof x.zeroReason==='string'&&x.zeroReason.length>0));
check('closed observations benefit zero across26 years',rows.every(rr=>rr.every(r=>r.riskAssets.filter(x=>!x.valuationEligible).every(x=>x.riskRevenueCNYbn===0&&x.milestoneRevenueCNYbn===0))));
for(let c=0;c<3;c++){
 const a=m.xtalpiBridge.inputs[cases[c]], g=m.xtalpiBridge.globals[c];
 for(let n=0;n<26;n++){
  const j=Math.min(n,6),late=Math.max(0,n-6),yr=2026+n;
  const exp=a.clinicalUnallocated[j]*(1+g.lateClinicalGrowth)**late*(yr>g.coreDecayAfterYear?g.coreDecay**(yr-g.coreDecayAfterYear):1);
  check(cases[c]+' '+yr+' unallocated clinical expense retained without probability scaling',close(rows[c][n].clinicalCostCNYbn,exp)&&close(rows[c][n].clinicalUnallocatedCNYbn,exp));
  check(cases[c]+' '+yr+' zero-asset clinical allocation',rows[c][n].riskAssets.every(x=>x.clinicalCostCNYbn===0));
  const core=m.xtalpiBridge.inputs[cases[c]], coreScale=(1+g.coreGrowth)**late*(yr<=g.coreDecayAfterYear?1:g.coreDecay**(yr-g.coreDecayAfterYear));
  const revenue=['AI4S','DrugServices','SignedNear','NewDeals'].reduce((s,k)=>s+core[k][j]*coreScale,0);
  check(cases[c]+' '+yr+' activity and perdrug revenue additive',close(rows[c][n].revenueCNYbn,revenue+rows[c][n].riskRevenueCNYbn+rows[c][n].milestoneRevenueCNYbn));
 }
 if(originalIsV1){
  const old=calculateXtalpiAnnual(original,c);
  check(cases[c]+' full 26-year old clinical budget retained',old.every((r,n)=>close(r.clinicalCostCNYbn,rows[c][n].clinicalCostCNYbn)));
  check(cases[c]+' other activity/global inputs unchanged except clinical unallocated',Object.keys(original.xtalpiBridge.inputs[cases[c]]).every(k=>JSON.stringify(original.xtalpiBridge.inputs[cases[c]][k])===JSON.stringify(a[k])));
  budgetTransitions.push({scenario:cases[c],oldTotal26year:old.reduce((s,r)=>s+r.clinicalCostCNYbn,0),newTotal26year:rows[c].reduce((s,r)=>s+r.clinicalCostCNYbn,0),new2026to2032:a.clinicalUnallocated});
 }
}
const registerPath=root+'/qa/xtalpi_per_asset_evidence.json', registerRaw=fs.readFileSync(registerPath,'utf8');

const positive=zPositive(m);
function zPositive(v){return v.xtalpiBridge.assets.filter(x=>x.eligibleAtCutoff!==0);}
check('exact seven identified self-owned indication rows',positive.length===7&&['XTN004_IBS','XTN004_IBD','ALX001_IBD','ALX002_SLE','ALX002_RA','ALX005_MG','ALX005_ITP'].every(id=>positive.some(x=>x.id===id)));
const demandAudit=[];
for(const x of positive){
 const a=x.valuationAssumptions;
 check(x.id+' demand assumption has independent reason',a&&typeof a.reason==='string'&&a.reason.length>40);
 check(x.id+' success assumptions explicit and paired',Array.isArray(x.successProbability)&&x.successProbability.every((p,c)=>p===x.p[c])&&x.successProbabilityStatus?.startsWith('research assumption'));
 check(x.id+' future uncertain milestone not invented',x.milestone.every(v=>v===0));
 for(let c=0;c<3;c++){
  const peak=a.patients[c]*a.priceCNY[c]*a.share[c]/1e9;
  check(x.id+' '+cases[c]+' peak demand identity',close(x.peak[c],peak));
  check(x.id+' '+cases[c]+' assumptions copied into active bridge',a.start[c]===x.start[c]&&a.p[c]===x.p[c]&&a.netRate[c]===x.netRate[c]&&a.GM[c]===x.GM[c]&&a.ownership[c]===x.ownership[c]);
  check(x.id+' '+cases[c]+' bounded probabilities and economic rate',x.p[c]>0&&x.p[c]<=1&&x.netRate[c]>0&&x.netRate[c]<=1&&x.ownership[c]>=0&&x.ownership[c]<=1);
  for(const r of rows[c]){
    const v=r.riskAssets.find(q=>q.id===x.id),age=r.year-x.start[c],nom=age<0?0:peak*(m.xtalpiBridge.curve[age]??m.xtalpiBridge.globals[c].curveTail);
    check(x.id+' '+cases[c]+' '+r.year+' gross demand to risk net revenue',close(v.nominalRevenueCNYbn,nom)&&close(v.riskRevenueCNYbn,nom*x.p[c]*x.netRate[c]*x.ownership[c]));
  }
  demandAudit.push({id:x.id,scenario:cases[c],selectedPatients:a.patients[c],annualPriceCNY:a.priceCNY[c],achievableShare:a.share[c],peakGrossRevenueCNYbn:peak,netRate:x.netRate[c],ownership:x.ownership[c],successProbability:x.p[c],riskPeakRevenueCNYbn:peak*x.netRate[c]*x.ownership[c]*x.p[c],launchYear:x.start[c],reason:a.reason});
 }
}
const rightsDiagnostics=[];
for(const fraction of [0,.5,1]){
 const v=structuredClone(m);for(const x of zPositive(v))x.ownership.fill(fraction);
 const results=hs.map(h=>({h,...summary(calculateXtalpiHorizon(v,h,1))}));
 rightsDiagnostics.push({fraction,results});
 const rr=calculateXtalpiAnnual(v,1);
 check('ownership '+fraction+' preserves26year clinical spending',rr.every((r,n)=>close(r.clinicalCostCNYbn,rows[1][n].clinicalCostCNYbn)));
 if(fraction===0)check('ownership0 removes all drug income',rr.every(r=>r.riskRevenueCNYbn===0&&r.milestoneRevenueCNYbn===0));
}

const clinicalCostDiagnostics=[];
for(const startYear of [2026,2027])for(const factor of [1,1.3,2]){
 const v=structuredClone(m);
 for(const label of cases)v.xtalpiBridge.inputs[label].clinicalUnallocated=v.xtalpiBridge.inputs[label].clinicalUnallocated.map((x,n)=>x*(2026+n>=startYear?factor:1));
 const results=cases.map((label,c)=>{
  const annual=calculateXtalpiAnnual(v,c);
  check('clinical from'+startYear+' '+factor+' '+label+' independently increased selected annual cost',annual.every((r,n)=>close(r.clinicalCostCNYbn,rows[c][n].clinicalCostCNYbn*(r.year>=startYear?factor:1))));
  check('clinical from'+startYear+' '+factor+' '+label+' leaves gross drug income unchanged',annual.every((r,n)=>close(r.riskRevenueCNYbn,rows[c][n].riskRevenueCNYbn)&&close(r.milestoneRevenueCNYbn,rows[c][n].milestoneRevenueCNYbn)));
  return{scenario:label,totalClinical26yearCNYbn:annual.reduce((s,r)=>s+r.clinicalCostCNYbn,0),targets:hs.map(h=>({h,...summary(calculateXtalpiHorizon(v,h,c))}))};
 });clinicalCostDiagnostics.push({startYear,factor,results});
}

const releaseSignatures={pendingModel:hash(raw),formalModel:hash(fs.readFileSync(root+'/data/xtalpi_model.json')),native:hash(fs.readFileSync(nativePath)),body:hash(fs.readFileSync(root+'/research/I027_deep.md')),sourceRegister:hash(registerRaw)};

const frozen={releaseSignatures,budgetTransitions,demandAudit,rightsDiagnostics,clinicalCostDiagnostics,modelVersion:m.modelVersion,modelSHA256:hash(raw),nativeSHA256:hash(fs.readFileSync(nativePath)),reviewDate:'2026-10-11',leaseCashModel:totalLeaseCashModel?'add back accrued lease interest then subtract forecast total cash lease payment':'subtract principal with conditional H1 allocation',status:checks.every(x=>x.pass)?'PASS arithmetic; economic limitations retained':'FAIL arithmetic',price:m.price,outputs,sensitivity,timings,normalEBITPositiveYear:positiveYear,baseOneIntrinsicToCurrentPct:(targetBase.intrinsicPrice/m.price-1)*100,disclosureLimits:['All-asset financialParentFraction is an assumed NCI proxy; legal holders unmapped','H2ForecastFraction scales synthetic annual P&L/cash budget, not true H2 seasonal forecast','Zero intrinsic if any forecast funding deficit is conservative constraint, not insolvency probability or immediate cash-liquidation value','Annual plus known CB-event interpolation cannot establish full intrayear minimum cash or day-by-day liquidity','Terminal cash2051 and dividend policies are research assumptions, not forecast board resolutions','Expected success-weighted revenue is not a discrete failure/survival probability model','2026 one-year normal profits are modeled annual proxies; not actualH1 plus separately budgetedH2','Future exercise price and rights of preissued options are not fully reconciled by tranche'],checks};
fs.writeFileSync(root+'/qa/xtalpi_v3_economic_review.json',JSON.stringify(frozen,null,2)+'\n');
console.log(JSON.stringify({status:frozen.status,checks:checks.length,failures:checks.filter(x=>!x.pass),releaseSignatures,budgetTransitions,demandAudit,rightsDiagnostics,outputs:outputs.map(x=>({case:x.case,targets:x.targets,firstDividend:x.firstDividend,minCashYear:x.minCashYear})),timings},null,2));
