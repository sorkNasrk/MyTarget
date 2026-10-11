import fs from 'node:fs';
import crypto from 'node:crypto';
import {calculateInsilicoAnnual,calculateInsilicoHorizon} from './insilico_native.mjs';
const root='G:/MyTarget/outputs/investment_research_20261009';
const paths={pending:'data/insilico_model.pending.json',formal:'data/insilico_model.json',native:'tools/insilico_native.mjs',body:'research/I008_deep.md',assumptions:'data/insilico_per_drug_assumptions.json',evidence:'qa/insilico_per_asset_evidence.json'};
const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(root+'/'+p)]));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),signatures=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,sha(v)]));
const m=JSON.parse(raw.pending),z=m.insilicoBridge,ev=JSON.parse(raw.evidence),a=JSON.parse(raw.assumptions),cases=['bear','base','bull'],sc=m.conditionalScenarios??m.scenarios,hz=m.conditionalHorizons??m.horizons,hs=Object.keys(sc),checks=[];
if(!m.modelVersion.startsWith('insilico-v3-'))throw Error('Pending v3 not frozen: '+m.modelVersion);
const eq=(x,y,t=1e-9)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=t,sum=x=>x.reduce((s,v)=>s+v,0),check=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail});
const rows=cases.map((_,c)=>calculateInsilicoAnnual(m,c)),demand=[...a.rows,...(a.earlyRows||[])],active=z.assets.filter(x=>x.eligibleAtCutoff!==0),closed=z.assets.filter(x=>x.eligibleAtCutoff===0);
check('all five conditional horizons explicitly audited',hs.length===5&&['yearEnd','halfYear','oneYear','threeYear','fiveYear'].every(h=>hs.includes(h)));
check('official score scenario and horizon containers empty',Object.keys(m.scores).length===0&&Object.keys(m.scenarios).length===0&&Object.keys(m.horizons).length===0);
check('67 independent evidence IDs',z.assets.length===67&&new Set(z.assets.map(x=>x.id)).size===67);
check('all demand assumptions mapped once to named eligible assets',demand.length===active.length&&demand.every(x=>active.filter(y=>y.id===x.id).length===1));
check('all active and closed assets preserve evidence row IDs',z.assets.every(x=>ev.rows.some(y=>y.assetIndicationId===x.id)));
check('unknown success and closing reason retained',closed.every(x=>x.successProbability===null&&x.p.every(v=>v===0)&&typeof x.zeroReason==='string'&&x.zeroReason.length>10));
for(const r of ev.rows)for(const key of ['exactNetRoyaltyRate','exactNetAssetOwnership','currentDilutedEquityStake','successProbability','peakRevenue','commercialLaunchYear'])check(r.assetIndicationId+' source fact '+key+' remains unknown',r[key]===null);
for(const x of z.assets){
 const source=ev.rows.find(r=>r.assetIndicationId===x.id),mrow=m.assetRegister?.rows.find(r=>r.assetIndicationId===x.id||r.id===x.id);
 check(x.id+' primary source and qualitative clinical identity retained',source&&x.sourceURL===source.evidence[0].sourceURL&&x.drug===source.drugName&&x.indication===source.indication&&x.territory===source.territory);
 check(x.id+' future unknown milestone not created',x.milestone.every(v=>v===0));
 check(x.id+' cost allocation zero avoids duplicated clinical spending',x.clinical.every(v=>v.every(n=>n===0)));
 if(mrow)for(const key of ['exactNetRoyaltyRate','exactNetAssetOwnership','currentDilutedEquityStake','successProbability','peakRevenue','commercialLaunchYear'])check(x.id+' model evidence '+key+' remains fact unknown',mrow[key]===null);
 if(x.eligibleAtCutoff===0)check(x.id+' zero gate input arrays',x.peak.every(v=>v===0)&&x.netRate.every(v=>v===0)&&x.ownership.every(v=>v===0));
 else{
  const d=demand.find(y=>y.id===x.id);
  check(x.id+' research assumptions separately labeled',d&&x.researchAssumptions&&x.successProbabilityStatus.startsWith('research'));
  check(x.id+' finite cashEnd is research horizon not legal expiry',x.cashEnd?.length===3&&x.cashEnd.every(v=>v===2051)&&x.cashEndStatus.includes('not verified patent/royalty/exclusivity'));
  for(const[k,target]of [['p','p'],['start','start'],['netRate','netRate'],['GM','GM'],['ownership','ownership']])check(x.id+' '+k+' paired to independent assumptions',JSON.stringify(x[target])===JSON.stringify(d[k]));
  for(let c=0;c<3;c++){check(x.id+' '+cases[c]+' peak demand identity',eq(x.peak[c],d.patients[c]*d.priceUSD[c]*d.share[c]/1e9));check(x.id+' '+cases[c]+' bounded economic rates',x.p[c]>0&&x.p[c]<=1&&x.netRate[c]>0&&x.netRate[c]<=1&&x.GM[c]>0&&x.GM[c]<=1&&x.ownership[c]>=0&&x.ownership[c]<=1);}
 }
}
const snapshots=[],budgetTotals=[];
for(let c=0;c<3;c++){
 const label=cases[c],g=z.globals[c],input=z.inputs[label],ar=rows[c];
 check(label+' 26 annual forecasts ending2051',ar.length===26&&ar[0].year===2026&&ar.at(-1).year===2051);
 check(label+' verified liquidity anchors USDmillion to USDbn',eq(g.startCash,m.financialVerified.cash/1000)&&eq(g.startTerm,m.financialVerified.term/1000)&&eq(g.startMMF,m.financialVerified.MMF/1000)&&eq(g.bankAnchor,m.financialVerified.bankPrincipal/1000));
 check(label+' verified September shares and unissued award pools',eq(g.startShares,m.financialVerified.SeptShares/1e9)&&eq(g.knownOptions,m.financialVerified.SeptRemainingOptions/1e9)&&eq(g.knownRSUs,(m.financialVerified.SeptRemainingPreRSUs+m.financialVerified.SeptRemainingPostRSUs)/1e9));
 check(label+' H1 economic cash aggregation',eq(g.H1EconomicCash,(m.financialVerified.OCF+m.financialVerified.bankInterestCash+m.financialVerified.MMFYieldCash-m.financialVerified.interestCash)/1000));
 check(label+' gross CB305m net301.6m fixed FX7.8394',eq(g.CBPrincipal,.305)&&eq(g.CBNetCash,.3016)&&eq(g.CBPrincipal-g.CBNetCash,.0034)&&eq(g.CBContractFX,7.8394)&&eq(g.CBConversionPrice,58.07));
 check(label+' fixed CB conversion shares',eq(g.CBPrincipal*g.CBContractFX/g.CBConversionPrice,m.financialVerified.CBConversionShares/1e9));
 check(label+' known H2 option proceeds converted once',eq(g.knownH2OptionCash,m.financialVerified.H2IssuedOptionCashHKD/1000/g.FX));
 for(let n=0;n<ar.length;n++){
  const r=ar[n],year=r.year,j=Math.min(n,6),late=Math.max(0,n-6),tag=label+' '+year,decay=year>g.coreDecayAfterYear?g.coreDecay**(year-g.coreDecayAfterYear):1;
  const costScale=(1+g.lateCostGrowth)**late*decay,coreScale=(1+g.coreGrowth)**late*decay,core=sum(['Software','Services','SignedNear','NewDeals'].map(k=>input[k][j]*coreScale));
  let rr=0,rm=0,rg=0,cl=0;
  for(const x of z.assets){
   const o=r.riskAssets.find(v=>v.id===x.id),age=year-x.start[c],nom=x.eligibleAtCutoff===0||age<0||year>x.cashEnd[c]?0:x.peak[c]*(z.curve[age]??g.curveTail),rev=nom*x.netRate[c]*x.ownership[c]*x.p[c];
   const my=year-x.milestoneStart[c],milestone=x.eligibleAtCutoff!==0&&my>=0&&my<4?x.milestone[c]*x.milestoneP[c]/4:0,clinical=x.clinical[j][c]*(1+g.lateClinicalGrowth)**late*decay;
   rr+=rev;rm+=milestone;rg+=rev*x.GM[c]+milestone*g.milestoneGM;cl+=clinical;
   check(tag+' '+x.id+' demand and risk net income',eq(o.nominalRevenueUSDbn,nom)&&eq(o.riskRevenueUSDbn,rev));
   check(tag+' '+x.id+' clinical unweighted and milestone zero',eq(o.clinicalCostUSDbn,clinical)&&eq(o.milestoneRevenueUSDbn,milestone));
  }
  const unallocated=input.clinicalUnallocated[j]*(1+g.lateClinicalGrowth)**late*decay;cl+=unallocated;
  const gross=sum(['Software','Services','SignedNear','NewDeals'].map(k=>input[k][j]*coreScale*input.GM[k]))+rg,EBIT=gross-input.selling[j]*costScale-rr*g.riskSellingRate-input.admin[j]*costScale-input.platformRD[j]*costScale-cl-input.other[j]*costScale+(n<=6?input.grant[j]:0);
  const pre=EBIT+Math.max(0,r.cashStartUSDbn)*g.cashRate+r.termStartUSDbn*g.termRate+r.MMFStartUSDbn*g.MMFRate-r.bankStartUSDbn*g.bankRate-input.leaseInterest[j]*costScale,normal=pre-Math.max(0,pre)*g.tax;
  const OCF=normal+input.DA[j]*costScale+input.SBC[j]*costScale-input.NWC[j]*costScale-(n===0?g.H1EconomicCash:0),capex=n===0?Math.max(0,input.capex[j]-g.H1Capex):input.capex[j]*costScale,lease=input.leasePrincipal[j]*costScale-(n===0?g.H1LeasePrincipal:0);
  check(tag+' activity plus retained and licensed drug income',eq(r.revenueUSDbn,core+rr+rm)&&eq(r.coreRevenueUSDbn,core)&&eq(r.riskRevenueUSDbn,rr));
  check(tag+' full unallocated clinical expense without success scaling',eq(r.clinicalUnallocatedUSDbn,unallocated)&&eq(r.clinicalCostUSDbn,cl)&&eq(r.RAndDUSDbn,input.platformRD[j]*costScale+cl));
  check(tag+' gross profit EBIT and normal profit',eq(r.grossProfitUSDbn,gross)&&eq(r.EBIT_USDbn,EBIT)&&eq(r.parentNormalProfitUSDbn,normal));
  check(tag+' actualH1 cash capex lease removed once',eq(r.remainingOCF_USDbn,OCF)&&eq(r.remainingCapexUSDbn,capex)&&eq(r.leasePrincipalUSDbn,lease));
  const cash=r.cashStartUSDbn+OCF-capex-r.bankPaymentUSDbn-lease+r.termRedemptionUSDbn+r.MMFRedemptionUSDbn+r.CBIssueNetUSDbn-r.CBPaymentUSDbn+r.exerciseCashUSDbn+r.knownH2OptionCashUSDbn+r.issueNetUSDbn-r.fundContributionUSDbn-r.dividendCashUSDbn;
  check(tag+' complete cash movements',eq(r.forecastCashUSDbn,cash));
  check(tag+' term MMF bank balances',eq(r.forecastTermUSDbn,r.termStartUSDbn-r.termRedemptionUSDbn)&&eq(r.forecastMMFUSDbn,r.MMFStartUSDbn-r.MMFRedemptionUSDbn)&&eq(r.forecastBankUSDbn,r.bankStartUSDbn-r.bankPaymentUSDbn));
  check(tag+' CB repayment vs conversion paired',eq(r.bondStartUSDbn+r.CBIssuePrincipalUSDbn,r.CBPaymentUSDbn+r.CBConversionPrincipalUSDbn+r.forecastBondUSDbn)&&eq(r.CBConversionSharesBn,r.CBConversionPrincipalUSDbn*g.CBContractFX/g.CBConversionPrice));
  check(tag+' issue gross net and actual shares paired',eq(r.issueNetUSDbn,r.issueGrossUSDbn*g.issueNetFactor)&&eq(r.issueSharesBn,r.issueGrossUSDbn*g.FX/r.issuePriceHKD));
  check(tag+' shares and option cash bridge',eq(r.dilutedSharesBn,r.sharesStartBn+r.CBConversionSharesBn+r.optionsExerciseSharesBn+r.RSUvestSharesBn+r.employeeSharesBn+r.issueSharesBn)&&eq(r.exerciseCashUSDbn,r.optionsExerciseSharesBn*g.optionExerciseUSD));
  check(tag+' annualEPS uses annual shares',eq(r.EPS_USD,normal/r.dilutedSharesBn));
  check(tag+' dividends respect policy and reserve',r.dividendCashUSDbn>=0&&(r.dividendCashUSDbn===0||(year>=g.distributionStart&&normal>0&&r.forecastCashUSDbn>=g.distributionReserve-1e-10)));
  if(n>0)check(tag+' previous cash liabilities and shares carried',eq(r.cashStartUSDbn,ar[n-1].forecastCashUSDbn)&&eq(r.sharesStartBn,ar[n-1].dilutedSharesBn)&&eq(r.bondStartUSDbn,ar[n-1].forecastBondUSDbn));
 }
 const last=ar.at(-1),recovery=Math.max(0,last.forecastCashUSDbn+last.forecastTermUSDbn+last.forecastMMFUSDbn+last.financialStakeUSDbn+last.fundStakeUSDbn-last.forecastBankUSDbn-last.forecastBondUSDbn),maturity=ar.find(x=>x.year===g.CBMaturityYear),prior=ar.find(x=>x.year===g.CBMaturityYear-1),fraction=(Date.parse(g.CBMaturityYear+'-09-01')-Date.parse(g.CBMaturityYear+'-01-01'))/(Date.parse((g.CBMaturityYear+1)+'-01-01')-Date.parse(g.CBMaturityYear+'-01-01')),eventCash=prior.forecastCashUSDbn+(maturity.forecastCashUSDbn-prior.forecastCashUSDbn+maturity.CBPaymentUSDbn)*fraction-maturity.CBPaymentUSDbn,min=Math.min(...ar.map(x=>x.forecastCashUSDbn),...(maturity.CBPaymentUSDbn>0?[eventCash]:[]));
 for(const h of hs){
  const o=calculateInsilicoHorizon(m,h,c),target=Date.parse(sc[h].target),discount=sum(o.flows.map(f=>(f.dividendCashUSDbn+f.terminalRecoveryUSDbn)/f.distributionSharesBn*g.FX/(1+g.discount)**((Date.parse(f.year+'-12-31')-target)/86400000/365.25)));
  check(label+' '+h+' EPS uses target-date shares',eq(o.eps,o.normalProfit/o.dilutedSharesBn));
  check(label+' '+h+' terminal after dividends and no double cash',eq(o.terminalRecoveryUSDbn,recovery)&&o.flows.every(f=>f.terminalRecoveryUSDbn===(f.year===2051?recovery:0)));
  check(label+' '+h+' finite distributions discounted',o.fundingFailure?o.intrinsicPrice===0:eq(o.intrinsicPrice,discount));
  check(label+' '+h+' known September1 CB cash included minimum',eq(o.minimumCashUSDbn,min));
  check(label+' '+h+' transparent conditional market recognition',eq(o.price,Math.max(0,m.price+sc[h].marketRecognitionFactor[c]*(o.intrinsicPrice-m.price))));
  check(label+' '+h+' not legal liquidation flag',o.fundingFailureIsLegalLiquidation===false);
  check(label+' '+h+' conditional scenario snapshots match native',eq(sc[h].priceHKD[c],o.price)&&eq(sc[h].intrinsicPrices[c],o.intrinsicPrice)&&eq(sc[h].dividend[c],o.dividend)&&eq(sc[h].epsUSD[c],o.eps));
  check(label+' '+h+' conditional horizon snapshot matches native',eq(hz[h].scenarios[c].price,o.price)&&eq(hz[h].scenarios[c].intrinsicPrice,o.intrinsicPrice)&&eq(hz[h].scenarios[c].dividend,o.dividend)&&eq(hz[h].scenarios[c].cashAtTargetUSDbn,o.cashAtTargetUSDbn)&&eq(hz[h].scenarios[c].dilutedSharesBn,o.dilutedSharesBn));
  snapshots.push({scenario:label,horizon:h,target:sc[h].target,priceHKD:o.price,intrinsicHKD:o.intrinsicPrice,dividendHKD:o.dividend,cashAtTargetUSDbn:o.cashAtTargetUSDbn,bondAtTargetUSDbn:o.bondAtTargetUSDbn,sharesBn:o.dilutedSharesBn,minimumCashUSDbn:o.minimumCashUSDbn,fundingFailure:o.fundingFailure,terminalRecoveryUSDbn:o.terminalRecoveryUSDbn});
 }
 budgetTotals.push({scenario:label,clinical26yearUSDbn:sum(ar.map(x=>x.clinicalCostUSDbn)),clinical2026to2032USDbn:input.clinicalUnallocated,CBEventCashUSDbn:eventCash});
}
const formal=JSON.parse(raw.formal);if(formal.modelVersion.startsWith('insilico-v2-'))for(let c=0;c<3;c++){
 const oldAssets=formal.insilicoBridge.assets,gi=formal.insilicoBridge.globals[c];
 const expected=Array.from({length:26},(_,n)=>sum(oldAssets.map(x=>x.clinical[Math.min(n,6)][c]*(1+gi.lateClinicalGrowth)**Math.max(0,n-6)*(2026+n>gi.coreDecayAfterYear?gi.coreDecay**(2026+n-gi.coreDecayAfterYear):1))));
 check(cases[c]+' original v2 26year clinical total retained',expected.every((v,n)=>eq(v,rows[c][n].clinicalCostUSDbn)));
}
if(formal.modelVersion.startsWith('insilico-v3-')){
 const legacyClinical=[[.038,.070,.090,.083,.069,.045,.029],[.043,.088,.141,.172,.186,.166,.125],[.052,.120,.210,.288,.352,.364,.299]],legacy26Totals=[.585243406304334,2.422369262601715,6.985758917514223];
 for(let c=0;c<3;c++)check(cases[c]+' original audited v2 clinical annual budget retained after formal sync',legacyClinical[c].every((v,n)=>eq(v,rows[c][n].clinicalCostUSDbn))&&eq(legacy26Totals[c],sum(rows[c].map(r=>r.clinicalCostUSDbn))));
}
const metadata=m.financialEvidence||[],fxLoss=metadata.find(x=>x.metric==='FXLoss'),optionCash=metadata.find(x=>x.metric==='H2IssuedOptionCashHKD'),cbNet=metadata.find(x=>x.metric==='CBNetCash');
check('FXLoss source metadata USDmillion and original negative expense',fxLoss?.currency==='USD'&&fxLoss?.unit==='million'&&eq(fxLoss?.value,2.74)&&fxLoss?.reportedValue===-2740&&fxLoss?.normalizationDivisor===1000);
check('H2 option cash component values and dates retained',optionCash?.currency==='HKD'&&optionCash?.unit==='million'&&optionCash?.components?.length===3&&eq(optionCash.value,sum(optionCash.components.map(x=>x.valueHKD))/1e6)&&optionCash?.firstPublicDate==='2026-10-07 17:00'&&optionCash.components.every(x=>x.date<='2026-10-09'));
check('H2 option cash source page3 for all component monthly reports',optionCash?.sourcePDFPage===3&&optionCash?.components?.every(x=>x.sourcePDFPage===3));
check('CB initial expected net receipt and later completion separated',cbNet?.currency==='USD'&&eq(cbNet?.value,301.6)&&cbNet?.firstPublicDate==='2026-08-28 06:23'&&cbNet?.firstDisclosureStatus==='expected net proceeds before completion'&&cbNet?.completionDate==='2026-09-03 22:01'&&cbNet?.firstPublicSourcePDFPage===14&&cbNet?.sourcePDFPage===2);
const maturityDiagnostics=[];
for(const convert of [0,1])for(const date of ['2027-08-31','2027-09-01','2027-09-02']){
 const q=structuredClone(m);q.insilicoBridge.globals[1].CBConversionFraction=convert;(q.conditionalScenarios??q.scenarios).oneYear.target=date;const ar=calculateInsilicoAnnual(q,1),g=q.insilicoBridge.globals[1],r=ar[1],pr=ar[0],f=(Date.parse(date)-Date.parse('2027-01-01'))/365/86400000,resolved=date>='2027-09-01',o=calculateInsilicoHorizon(q,'oneYear',1),cash=pr.forecastCashUSDbn+(r.forecastCashUSDbn-pr.forecastCashUSDbn+r.CBPaymentUSDbn)*f-(resolved?r.CBPaymentUSDbn:0),shares=pr.dilutedSharesBn+(r.dilutedSharesBn-pr.dilutedSharesBn-r.CBConversionSharesBn)*f+(resolved?r.CBConversionSharesBn:0);
 check('CB '+convert+' '+date+' event date cash bond shares',eq(o.cashAtTargetUSDbn,cash)&&eq(o.bondAtTargetUSDbn,resolved?0:g.CBPrincipal)&&eq(o.dilutedSharesBn,shares));maturityDiagnostics.push({convert,date,cashUSDbn:o.cashAtTargetUSDbn,bondUSDbn:o.bondAtTargetUSDbn,sharesBn:o.dilutedSharesBn});
}
const sensitivity=[];
const test=(name,fn,verify)=>{const q=structuredClone(m);fn(q);const ar=calculateInsilicoAnnual(q,1);if(verify)check(name+' independent preservation',verify(ar));sensitivity.push({name,results:hs.map(h=>{const o=calculateInsilicoHorizon(q,h,1);return{h,priceHKD:o.price,intrinsicHKD:o.intrinsicPrice,minimumCashUSDbn:o.minimumCashUSDbn,fundingFailure:o.fundingFailure};})});};
const licensed=['ISM3091_HRD','ISM5043_ERPOS_HER2NEG','ISM9682_CIN_SOLID','ISM4808_CKD_GC'];
for(const category of ['retainedOwnership','licensedRoyalty'])for(const fraction of [0,.5,1])test(category+' '+fraction,q=>{for(const x of q.insilicoBridge.assets.filter(x=>x.eligibleAtCutoff!==0&&licensed.includes(x.id)===(category==='licensedRoyalty')))if(category==='licensedRoyalty')x.netRate=x.netRate.map(v=>v*fraction);else x.ownership=x.ownership.map(v=>v*fraction);},ar=>ar.every((r,n)=>eq(r.clinicalCostUSDbn,rows[1][n].clinicalCostUSDbn)));
for(const factor of [1,1.3,2])test('clinicalFrom2027 '+factor,q=>{q.insilicoBridge.inputs.base.clinicalUnallocated=q.insilicoBridge.inputs.base.clinicalUnallocated.map((v,n)=>v*(n>0?factor:1));},ar=>ar.every((r,n)=>eq(r.clinicalCostUSDbn,rows[1][n].clinicalCostUSDbn*(n>0?factor:1))&&eq(r.riskRevenueUSDbn,rows[1][n].riskRevenueUSDbn)));
test('no dividends',q=>q.insilicoBridge.globals[1].distributionRate=0);test('all CB converts',q=>q.insilicoBridge.globals[1].CBConversionFraction=1);test('discount10pct',q=>q.insilicoBridge.globals[1].discount=.10);test('discount18pct',q=>q.insilicoBridge.globals[1].discount=.18);
const conditionalFundingAudit=[];
for(const f of m.conditionalFundingSensitivity||[]){
 const q=structuredClone(m);for(const t of f.tranches){q.insilicoBridge.inputs.base.issueGross[t.year-2026]=t.grossUSDbn;q.insilicoBridge.inputs.base.issuePx[t.year-2026]=t.issuePriceHKD;}
 const ar=calculateInsilicoAnnual(q,1),gross=sum(f.tranches.map(x=>x.grossUSDbn)),net=sum(f.tranches.map(x=>x.grossUSDbn*z.globals[1].issueNetFactor)),shares=sum(f.tranches.map(x=>x.grossUSDbn*z.globals[1].FX/x.issuePriceHKD));
 check(f.id+' hypothetical funding gross net shares paired',eq(f.grossUSDbn,gross)&&eq(f.netUSDbn,net)&&eq(f.newSharesBn,shares));
 check(f.id+' conditional no automatic base case label',f.notFormalBaseCase===true&&f.unchangedClinicalBudget===true&&f.unchangedAssetsRights===true);
 check(f.id+' unchanged all clinical and asset income',ar.every((r,n)=>eq(r.clinicalCostUSDbn,rows[1][n].clinicalCostUSDbn)&&eq(r.riskRevenueUSDbn,rows[1][n].riskRevenueUSDbn)));
 check(f.id+' saved annual funding snapshots paired',JSON.stringify(ar)===JSON.stringify(f.annual));
 for(const h of hs){const o=calculateInsilicoHorizon(q,h,1),stored=f.horizons[h];for(const key of ['price','intrinsicPrice','minimumCashUSDbn','dilutedSharesBn','cashAtTargetUSDbn','terminalRecoveryUSDbn'])check(f.id+' '+h+' saved snapshot '+key,eq(o[key],stored[key]));}
 conditionalFundingAudit.push({id:f.id,grossUSDbn:gross,netUSDbn:net,newSharesBn:shares,newSharesToCurrentPct:shares/z.globals[1].startShares*100,oneIntrinsicHKD:calculateInsilicoHorizon(q,'oneYear',1).intrinsicPrice,minimumCashUSDbn:calculateInsilicoHorizon(q,'oneYear',1).minimumCashUSDbn});
}
const unfundedBaseHardGate=snapshots.filter(x=>x.scenario==='base'&&['oneYear','threeYear'].includes(x.horizon)).some(x=>x.intrinsicHKD===0&&x.cashAtTargetUSDbn>z.globals[1].minimumCashReserve)&&z.inputs.base.issueGross.every(x=>x===0);
const conditionalOnly=m.rankingEligible===false&&m.rankEligible===false&&m.assessmentStatus==='conditional_model_temporarily_unranked'&&m.formalTargetAvailable===false&&m.scoresAreDiagnosticOnly===true&&hs.every(h=>hz[h].officialTargetPricesHKD===null&&hz[h].officialExpectedPriceHKD===null&&hz[h].officialExpectedReturnPct===null&&hz[h].outputUse==='CONDITIONAL_STRESS_REFERENCE_NOT_RANKING'&&sc[h].outputUse==='CONDITIONAL_STRESS_REFERENCE_NOT_RANKING');
check('conditional research excludes official ranking targets and expectations',conditionalOnly);
for(const h of hs){const price=snapshots.filter(x=>x.horizon===h).sort((x,y)=>cases.indexOf(x.scenario)-cases.indexOf(y.scenario)).map(x=>x.priceHKD),weighted=sum(price.map((p,c)=>p*[.25,.5,.25][c]));check(h+' raw conditional weighting distinctly labeled',eq(hz[h].rawStressWeightedReferenceHKD,weighted)&&eq(hz[h].rawStressWeightedReturnPct,(weighted/m.price-1)*100)&&eq(sc[h].rawStressWeightedReferenceHKD,weighted));check(h+' ambiguous expected names absent from conditional containers',!Object.keys(hz[h]).some(k=>/expected/i.test(k)&&!k.startsWith('official'))&&!Object.keys(sc[h]).some(k=>/expected/i.test(k)));for(const w of hz[h].weightSensitivity)check(h+' raw sensitivity weights paired',eq(w.rawStressWeightedReferenceHKD,sum(price.map((p,c)=>p*w.weights[c])))&&eq(w.rawStressWeightedReturnPct,(w.rawStressWeightedReferenceHKD/m.price-1)*100));}
check('no financing condition preserved in base plan',z.inputs.base.issueGross.every(v=>v===0));
check('each funding sensitivity explicitly requires non-self-consistent market financing',m.conditionalFundingSensitivity.length===2&&m.conditionalFundingSensitivity.every(f=>f.conditions.includes('intrinsic')&&f.notFormalBaseCase));
const cashEndAudit=[];
for(const t of m.cashEndSensitivity??[]){
 const q=structuredClone(m);for(const x of q.insilicoBridge.assets)for(let c=0;c<3;c++)x.cashEnd[c]=t.calendarEnd??Math.min(2051,x.start[c]+t.launchYears-1);
 check(t.id+' tail sensitivity not legal expiry or formal target',t.notFormalTarget===true&&t.clinicalBudgetRetained===true&&t.label.includes('非'));
 for(let c=0;c<3;c++){
  const ar=calculateInsilicoAnnual(q,c);check(t.id+' '+cases[c]+' preserves full clinical budget',ar.every((r,n)=>eq(r.clinicalCostUSDbn,rows[c][n].clinicalCostUSDbn)));
  check(t.id+' '+cases[c]+' no drug revenue after selected end',ar.every(r=>r.riskAssets.every(x=>r.year<=x.cashEnd||x.nominalRevenueUSDbn===0)));
  for(const h of hs){const o=calculateInsilicoHorizon(q,h,c),stored=t.horizons[h][c];check(t.id+' '+cases[c]+' '+h+' end sensitivity snapshot',stored.scenario===cases[c]&&eq(stored.priceHKD,o.price)&&eq(stored.intrinsicPriceHKD,o.intrinsicPrice)&&eq(stored.minimumCashUSDbn,o.minimumCashUSDbn)&&stored.fundingFailure===o.fundingFailure);cashEndAudit.push({id:t.id,scenario:cases[c],horizon:h,intrinsicHKD:o.intrinsicPrice,conditionalPriceHKD:o.price,minimumCashUSDbn:o.minimumCashUSDbn});}
 }
}
check('two explicit commercial tail stress definitions',cashEndAudit.length===30);
const matchingBodyVersion=raw.body.toString('utf8').includes(m.modelVersion);
check('release body uses matching conditional model version',matchingBodyVersion);
const economicBlockers=unfundedBaseHardGate&&!conditionalOnly?['BASE_UNFUNDED_REMOTE_DEFICIT_HARD_GATE: future26year cash deficit with no financing strategy sets near-term assets0 although target liquidity positive; retain as no-financing stress and reassess explicit financing/project strategy with dilution and rights costs']:[];
const report={issuerId:'I008',securityId:'S008',asOf:'2026-10-09',reviewDate:'2026-10-11',modelVersion:m.modelVersion,signatures,status:checks.every(x=>x.pass)?'PASS arithmetic and research assumption structure; conditional display only':'FAIL',economicReleaseApproved:checks.every(x=>x.pass)&&conditionalOnly,economicApprovalScope:'Conditional stress and financing sensitivity disclosure only; no formally actionable target or official ranking',economicBlockers,checksCount:checks.length,activeAssets:active.map(x=>x.id),closedAssets:closed.map(x=>x.id),budgetTotals,snapshots,maturityDiagnostics,sensitivity,conditionalFundingAudit,cashEndAudit,failures:checks.filter(x=>!x.pass),limits:['Research selected patient counts, prices, shares, probabilities and net rates are not issuer facts or calibrated success estimates','Global selected market assumptions are not separately verified region-specific legal rights or reimbursement budgets','Clinical unallocated budget retained but adequate per-drug funding is unproven','Shared molecular and regional risks correlated; success-weighted income is not a discrete outcome or survival model','Annual interpolation plus known CB maturity cannot prove full intrayear liquidity minimum','Finite2051 recovery, distributions and long-term decay/dilution are transparent policy assumptions, not announced board decisions','Candidate pending approval is separate from formal release, integrated Excel recalc and document render QA'],checks};
fs.writeFileSync(root+'/qa/insilico_v3_economic_review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,checks:undefined,sensitivity:undefined},null,2));
