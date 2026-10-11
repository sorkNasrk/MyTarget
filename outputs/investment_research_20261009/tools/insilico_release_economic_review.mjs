import fs from 'node:fs';
import crypto from 'node:crypto';
import { calculateInsilicoAnnual, calculateInsilicoHorizon } from './insilico_native.mjs';

const root='G:/MyTarget/outputs/investment_research_20261009';
const files={model:'data/insilico_model.json',pending:'data/insilico_model.pending.json',native:'tools/insilico_native.mjs',body:'research/I008_deep.md',sources:'data/insilico_sources.json',nature:'data/pharma_raw/insilico_nature_20250603.html'};
const raw=Object.fromEntries(Object.entries(files).map(([k,f])=>[k,fs.readFileSync(root+'/'+f,'utf8')]));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const signatures=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,hash(v)]));
const m=JSON.parse(raw.model),z=m.insilicoBridge,cases=['bear','base','bull'],hs=Object.keys(m.scenarios);
const checks=[];
const check=(name,pass,category='arithmetic',detail=null)=>checks.push({name,category,pass:!!pass,detail});
const eq=(x,y,t=1e-9)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=t;
const sum=xs=>xs.reduce((s,x)=>s+x,0);
const annual=cases.map((_,c)=>calculateInsilicoAnnual(m,c));
const snapshots=[];
check('formal and pending bytes paired',raw.model===raw.pending,'release');
for(let c=0;c<3;c++){
 const label=cases[c],a=z.inputs[label],g=z.globals[c],rows=annual[c];
 check(label+' uses 26 real forecast years ending2051',rows.length===26&&rows[0].year===2026&&rows.at(-1).year===2051);
 check(label+' H1 anchors from verified USD million to USD billion',eq(g.startCash,m.financialVerified.cash/1000)&&eq(g.startTerm,m.financialVerified.term/1000)&&eq(g.startMMF,m.financialVerified.MMF/1000)&&eq(g.bankAnchor,m.financialVerified.bankPrincipal/1000),'financialEvidence');
 check(label+' actual September shares anchor',eq(g.startShares,m.financialVerified.SeptShares/1e9),'financialEvidence');
 check(label+' future options and RSU pools distinct from actual shares',eq(g.knownOptions,m.financialVerified.SeptRemainingOptions/1e9)&&eq(g.knownRSUs,(m.financialVerified.SeptRemainingPreRSUs+m.financialVerified.SeptRemainingPostRSUs)/1e9),'financialEvidence');
 check(label+' actual H1 economic cash aggregation',eq(g.H1EconomicCash,(m.financialVerified.OCF+m.financialVerified.bankInterestCash+m.financialVerified.MMFYieldCash-m.financialVerified.interestCash)/1000),'financialEvidence');
 check(label+' CB gross principal net receipt and contract FX',eq(g.CBPrincipal,.305)&&eq(g.CBNetCash,.3016)&&eq(g.CBPrincipal-g.CBNetCash,.0034)&&eq(g.CBContractFX,7.8394)&&eq(g.CBConversionPrice,58.07),'financialEvidence');
 check(label+' fixed contract conversion shares',eq(g.CBPrincipal*g.CBContractFX/g.CBConversionPrice,m.financialVerified.CBConversionShares/1e9,1e-9),'financialEvidence');
 check(label+' known H2 actual option cash uses research conversion only once',eq(g.knownH2OptionCash,m.financialVerified.H2IssuedOptionCashHKD/1000/g.FX),'financialEvidence');
 for(let n=0;n<rows.length;n++){
  const r=rows[n],year=2026+n,j=Math.min(n,6),late=Math.max(0,n-6),tag=label+' '+year;
  const cs=(1+g.lateCostGrowth)**late*(year>g.coreDecayAfterYear?g.coreDecay**(year-g.coreDecayAfterYear):1);
  const coreScale=(1+g.coreGrowth)**late*(year>g.coreDecayAfterYear?g.coreDecay**(year-g.coreDecayAfterYear):1);
  const core=sum(['Software','Services','SignedNear','NewDeals'].map(k=>a[k][j]*coreScale));
  let rr=0,rm=0,rg=0,cl=0;
  for(let p=0;p<z.assets.length;p++){
   const x=z.assets[p],o=r.riskAssets[p],age=year-x.start[c],grossSales=age<0?0:x.peak[c]*(z.curve[age]??g.curveTail);
   const riskRevenue=grossSales*x.netRate[c]*x.ownership[c]*x.p[c];
   const my=year-x.milestoneStart[c],milestone=my>=0&&my<4?x.milestone[c]*x.milestoneP[c]/4:0;
   const clinical=n<=6?x.clinical[n][c]:x.clinical[6][c]*(1+g.lateClinicalGrowth)**late*(year>g.coreDecayAfterYear?g.coreDecay**(year-g.coreDecayAfterYear):1);
   rr+=riskRevenue;rm+=milestone;rg+=riskRevenue*x.GM[c]+milestone*g.milestoneGM;cl+=clinical;
   check(tag+' '+x.id+' risk net rights revenue',eq(o.riskRevenueUSDbn,riskRevenue));
   check(tag+' '+x.id+' clinical cost unweighted',eq(o.clinicalCostUSDbn,clinical));
   check(tag+' '+x.id+' future milestone separate',eq(o.milestoneRevenueUSDbn,milestone));
  }
  const gross=sum(['Software','Services','SignedNear','NewDeals'].map(k=>a[k][j]*coreScale*a.GM[k]))+rg;
  const EBIT=gross-(a.selling[j]*cs+rr*g.riskSellingRate)-a.admin[j]*cs-a.platformRD[j]*cs-cl-a.other[j]*cs+(n<=6?a.grant[j]:0);
  const pre=EBIT+Math.max(0,r.cashStartUSDbn)*g.cashRate+r.termStartUSDbn*g.termRate+r.MMFStartUSDbn*g.MMFRate-r.bankStartUSDbn*g.bankRate-a.leaseInterest[j]*cs;
  const normal=pre-Math.max(0,pre)*g.tax;
  const OCF=normal+a.DA[j]*cs+a.SBC[j]*cs-a.NWC[j]*cs-(n===0?g.H1EconomicCash:0);
  const remainCapex=n===0?Math.max(0,a.capex[j]-g.H1Capex):a.capex[j]*cs;
  const leasePrincipal=a.leasePrincipal[j]*cs-(n===0?g.H1LeasePrincipal:0);
  check(tag+' segment and risk revenue add',eq(r.revenueUSDbn,core+rr+rm)&&eq(r.coreRevenueUSDbn,core)&&eq(r.riskRevenueUSDbn,rr));
  check(tag+' gross margin to EBIT',eq(r.grossProfitUSDbn,gross)&&eq(r.EBIT_USDbn,EBIT));
  check(tag+' all clinical costs retained',eq(r.clinicalCostUSDbn,cl)&&eq(r.RAndDUSDbn,a.platformRD[j]*cs+cl));
  check(tag+' normal profit and cash bridge',eq(r.parentNormalProfitUSDbn,normal)&&eq(r.remainingOCF_USDbn,OCF));
  check(tag+' actual capex and lease remainder once',eq(r.remainingCapexUSDbn,remainCapex)&&eq(r.leasePrincipalUSDbn,leasePrincipal));
  const cash=r.cashStartUSDbn+OCF-remainCapex-r.bankPaymentUSDbn-leasePrincipal+r.termRedemptionUSDbn+r.MMFRedemptionUSDbn+r.CBIssueNetUSDbn-r.CBPaymentUSDbn+r.exerciseCashUSDbn+r.knownH2OptionCashUSDbn+r.issueNetUSDbn-r.fundContributionUSDbn-r.dividendCashUSDbn;
  check(tag+' complete cash movement',eq(r.forecastCashUSDbn,cash));
  check(tag+' term and MMF movement',eq(r.forecastTermUSDbn,r.termStartUSDbn-r.termRedemptionUSDbn)&&eq(r.forecastMMFUSDbn,r.MMFStartUSDbn-r.MMFRedemptionUSDbn));
  check(tag+' CB liability resolves principal or conversion',eq(r.bondStartUSDbn+r.CBIssuePrincipalUSDbn,r.CBPaymentUSDbn+r.CBConversionPrincipalUSDbn+r.forecastBondUSDbn));
  check(tag+' conversion uses fixed contract FX',eq(r.CBConversionSharesBn,r.CBConversionPrincipalUSDbn*g.CBContractFX/g.CBConversionPrice));
  check(tag+' issue proceeds paired to shares and fee',eq(r.issueNetUSDbn,r.issueGrossUSDbn*g.issueNetFactor)&&eq(r.issueSharesBn,r.issueGrossUSDbn*g.FX/r.issuePriceHKD));
  check(tag+' share pool movement',eq(r.dilutedSharesBn,r.sharesStartBn+r.CBConversionSharesBn+r.optionsExerciseSharesBn+r.RSUvestSharesBn+r.employeeSharesBn+r.issueSharesBn));
  check(tag+' option cash paired to exercise',eq(r.exerciseCashUSDbn,r.optionsExerciseSharesBn*g.optionExerciseUSD));
  if(n>0)check(tag+' previous balances carried',eq(r.cashStartUSDbn,rows[n-1].forecastCashUSDbn)&&eq(r.sharesStartBn,rows[n-1].dilutedSharesBn)&&eq(r.bondStartUSDbn,rows[n-1].forecastBondUSDbn));
  check(tag+' annual EPS uses current annual shares',eq(r.EPS_USD,normal/r.dilutedSharesBn));
  check(tag+' distributions only allowed profit/reserve',r.dividendCashUSDbn>=0&&(r.dividendCashUSDbn===0||(year>=g.distributionStart&&normal>0&&r.forecastCashUSDbn>=g.distributionReserve-1e-10)));
 }
 const last=rows.at(-1),recovery=Math.max(0,last.forecastCashUSDbn+last.forecastTermUSDbn+last.forecastMMFUSDbn+last.financialStakeUSDbn+last.fundStakeUSDbn-last.forecastBankUSDbn-last.forecastBondUSDbn);
 for(const h of hs){
  const v=calculateInsilicoHorizon(m,h,c),target=Date.parse(m.scenarios[h].target);
  const discount=sum(v.flows.map(f=>(f.dividendCashUSDbn+f.terminalRecoveryUSDbn)/f.distributionSharesBn*g.FX/(1+g.discount)**((Date.parse(f.year+'-12-31')-target)/86400000/365.25)));
  check(label+' '+h+' target EPS shares',eq(v.eps,v.normalProfit/v.dilutedSharesBn));
  check(label+' '+h+' postdividend terminal only',eq(v.terminalRecoveryUSDbn,recovery)&&v.flows.every(f=>f.terminalRecoveryUSDbn===(f.year===2051?recovery:0)));
  check(label+' '+h+' flow valuation no extra target cash',v.fundingFailure?v.intrinsicPrice===0:eq(v.intrinsicPrice,discount));
  check(label+' '+h+' price recognition equation',eq(v.price,Math.max(0,m.price+m.scenarios[h].marketRecognitionFactor[c]*(v.intrinsicPrice-m.price))));
  snapshots.push({scenario:label,horizon:h,target:m.scenarios[h].target,priceHKD:v.price,intrinsicHKD:v.intrinsicPrice,totalDividendHKD:v.dividend,cashAtTargetUSDbn:v.cashAtTargetUSDbn,bondAtTargetUSDbn:v.bondAtTargetUSDbn,sharesBn:v.dilutedSharesBn,minimumCashUSDbn:v.minimumCashUSDbn,fundingFailure:v.fundingFailure,terminalRecoveryUSDbn:v.terminalRecoveryUSDbn});
 }
}

const maturityDiagnostics=[];
for(const convert of [0,1]){
 const q=structuredClone(m);q.insilicoBridge.globals[1].CBConversionFraction=convert;
 const ar=calculateInsilicoAnnual(q,1),pr=ar[0],r=ar[1],g=q.insilicoBridge.globals[1];
 for(const date of ['2027-08-31','2027-09-01','2027-09-02']){
  q.scenarios.oneYear.target=date;const v=calculateInsilicoHorizon(q,'oneYear',1);
  const fraction=(Date.parse(date)-Date.parse('2027-01-01'))/(Date.parse('2028-01-01')-Date.parse('2027-01-01'));
  const resolved=date>='2027-09-01',cash=pr.forecastCashUSDbn+(r.forecastCashUSDbn-pr.forecastCashUSDbn+r.CBPaymentUSDbn)*fraction-(resolved?r.CBPaymentUSDbn:0);
  const shares=pr.dilutedSharesBn+(r.dilutedSharesBn-pr.dilutedSharesBn-r.CBConversionSharesBn)*fraction+(resolved?r.CBConversionSharesBn:0);
  check('CB event '+convert+' '+date,eq(v.cashAtTargetUSDbn,cash)&&eq(v.dilutedSharesBn,shares)&&eq(v.bondAtTargetUSDbn,resolved?0:.305));
  maturityDiagnostics.push({conversionFraction:convert,date,cashUSDbn:v.cashAtTargetUSDbn,bondUSDbn:v.bondAtTargetUSDbn,sharesBn:v.dilutedSharesBn});
 }
}
const experiments=[];
for(const [name,fn] of [
 ['no_dividend',v=>v.insilicoBridge.globals[1].distributionRate=0],
 ['all_profit_distribution',v=>{v.insilicoBridge.globals[1].distributionRate=1;v.insilicoBridge.globals[1].distributionReserve=.025;}],
 ['all_CB_convert',v=>v.insilicoBridge.globals[1].CBConversionFraction=1],
 ['no_CB_receipt_or_principal',v=>{v.insilicoBridge.globals[1].CBPrincipal=0;v.insilicoBridge.globals[1].CBNetCash=0;}],
 ['legacy_partner_retained_benefits_removed_costs_kept',v=>{for(const x of v.insilicoBridge.assets.filter(x=>['LicensedLegacy','PartnerNew','RetainedPCC'].includes(x.id))){x.peak=[0,0,0];x.milestone=[0,0,0];}}],
 ['all_ambiguous_benefits_removed_costs_kept',v=>{for(const x of v.insilicoBridge.assets.filter(x=>x.id!=='RentChina')){x.peak=[0,0,0];x.milestone=[0,0,0];}}]
 ]){
  const q=structuredClone(m);fn(q);
  experiments.push({name,results:['yearEnd','oneYear','threeYear','fiveYear'].map(h=>{const o=calculateInsilicoHorizon(q,h,1);return{h,priceHKD:o.price,intrinsicHKD:o.intrinsicPrice,minimumCashUSDbn:o.minimumCashUSDbn,fundingFailure:o.fundingFailure};})});
}

const nature=raw.nature.replace(/<[^>]*>/g,' ').replace(/&#8201;|&thinsp;/g,' ').replace(/\s+/g,' ');
check('IIa primary endpoint is TEAE incidence',nature.includes('The primary endpoint was the percentage of patients who have at least one treatment-emergent adverse event'),'clinical');
check('IIa ITT population71 and treatment12 weeks',nature.includes('population included 71 patients')&&nature.includes('12-week placebo-controlled period'),'clinical');
check('IIa attrition55/71 completed and16 stopped',nature.includes('55 (77%) completed')&&nature.includes('Sixteen patients discontinued treatment'),'clinical');
check('body distinguishes FVC secondary and71/12week',raw.body.includes('总71人，治疗12周')&&raw.body.includes('FVC结果属于次要终点'),'clinical');
check('body does not use public JPM128 denominator',raw.body.includes('不以128作为随机疗效分母'),'clinical');

const fxLoss=m.financialEvidence.find(x=>x.metric==='FXLoss');
check('FXLoss source metadata million USD',fxLoss?.unit==='million'&&fxLoss?.currency==='USD','sourceMetadata',fxLoss);
const optionCash=m.financialEvidence.find(x=>x.metric==='H2IssuedOptionCashHKD');
check('H2 cumulative option cash latest public date is final monthly report',optionCash?.firstPublicDate?.startsWith('2026-10-07'),'sourceMetadata',optionCash);
const cbNet=m.financialEvidence.find(x=>x.metric==='CBNetCash');
check('CB net receipt first public date supported by completion source',cbNet?.firstPublicDate?.startsWith('2026-09-03'),'sourceMetadata',cbNet);
const acceptanceBlockers=[
 {code:'AGGREGATE_LEGACY',assets:['LicensedLegacy'],reason:'five drugs one common peak/rate/probability/milestone; ISM8207 co-development50/50 is not plain royalty and ISM5939 license missing'},
 {code:'AGGREGATE_PARTNER',assets:['PartnerNew'],reason:'multiple partners and unnamed assets without per-drug/indication mapping'},
 {code:'AGGREGATE_RETAINED',assets:['RetainedPCC'],reason:'eight early drug IDs share one gross peak/probability/net economic rate'},
 {code:'MIXED_FORMULATION_TERRITORY',assets:['RentROW'],reason:'oral outsideChina plus inhaled outsideChina and China combined; no evidence-based peak and clinical cost allocation'},
 {code:'MIXED_DISEASE',assets:['IBD','TEAD','NLRP3'],reason:'UC/CD, mesothelioma/other solid tumors and brainNLRP3 do not provide individual disease cashflows'},
 {code:'PROBABILITY_AND_NET_RIGHTS_UNVERIFIED',assets:z.assets.map(x=>x.id),reason:'research probabilities and realization rates have not been tied to per-indication staged evidence, legal rights and market cashflow assumptions'},
 {code:'INTRAYEAR_LIQUIDITY_PROXY',reason:'annual interpolation and scheduledCB event do not establish actual quarterly cash minima'},
 {code:'LONG_TERM_POLICY_PROXY',reason:'distribution/survival, terminal2051, late investment/clinical decay and dilution are research assumptions'}
];
const record={issuerId:'I008',asOf:'2026-10-09',reviewDate:'2026-10-11',modelVersion:m.modelVersion,signatures,arithmeticPass:checks.filter(x=>x.category==='arithmetic').every(x=>x.pass),clinicalPass:checks.filter(x=>x.category==='clinical').every(x=>x.pass),sourceMetadataPass:checks.filter(x=>x.category==='sourceMetadata').every(x=>x.pass),fullPerDrugAcceptance:false,checksCount:checks.length,failures:checks.filter(x=>!x.pass),acceptanceBlockers,snapshots,maturityDiagnostics,experiments,checks};
fs.writeFileSync(root+'/qa/insilico_release_economic_review.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({modelVersion:record.modelVersion,signatures,checks:checks.length,arithmeticPass:record.arithmeticPass,clinicalPass:record.clinicalPass,sourceMetadataPass:record.sourceMetadataPass,failures:record.failures,fullPerDrugAcceptance:false,baseSnapshots:snapshots.filter(x=>x.scenario==='base'),experiments,maturityDiagnostics},null,2));
