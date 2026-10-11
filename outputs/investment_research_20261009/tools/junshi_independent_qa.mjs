import fs from 'node:fs/promises';
import {calculateJunshiAnnual,calculateJunshiHorizon,setJunshiAtomic} from './junshi_native.mjs';
const root='G:/MyTarget/outputs/investment_research_20261009';
const m=JSON.parse(await fs.readFile(root+'/data/junshi_model.pending.json','utf8'));
const sources=JSON.parse(await fs.readFile(root+'/data/junshi_sources.json','utf8'));
const labels=['bear','base','bull'];
let checks=0;
const sum=a=>a.reduce((v,x)=>v+x,0);
const eq=(label,actual,expected)=>{if(!Number.isFinite(actual)||Math.abs(actual-expected)>1e-8)throw Error(`${label}: ${actual} != ${expected}`);checks++;};
const ok=(label,condition)=>{if(!condition)throw Error(label);checks++;};

// This implementation reads only atomic inputs. It does not use the native
// annual schedule or cached scenario output in its calculations.
function independentlyCalculate(mm,caseIndex){
 const z=mm.junshiBridge,g=z.globals[caseIndex],a=z.inputs[labels[caseIndex]],out=[];
 let cash=g.startCash,products=g.startProducts,restricted=g.restricted;
 let bank=g.bankAnchor,bonds=g.bondAnchor,shares=g.startShares,reserve=-g.lossAnchor;
 for(let n=0;n<16;n++){
  const year=2026+n,inputYear=Math.min(n,6),post=Math.max(n-6,0);
  const costs=Math.pow(1+g.lateCostGrowth,post);
  const coreGrowth=Math.pow(1+g.coreGrowth,post)*Math.pow(g.coreDecay,Math.max(0,year-g.coreDecayAfterYear));
  const coreKeys=['ToripChina','OtherPharma','MarketedRoyalties','Services'];
  const core=coreKeys.map(k=>a[k][inputYear]*coreGrowth);
  const risk=z.assets.map(x=>{
   const age=year-x.start[caseIndex];
   const gross=age<0?0:x.peak[caseIndex]*(z.curve[age]??g.curveTail);
   const company=gross*x.netRate[caseIndex]*x.ownership[caseIndex];
   return {gross,company,risk:company*x.p[caseIndex]};
  });
  const riskRevenue=sum(risk.map(x=>x.risk));
  const revenue=sum(core)+riskRevenue;
  const gp=sum(core.map((v,i)=>v*a.GM[coreKeys[i]]))+sum(risk.map((v,i)=>v.risk*z.assets[i].GM[caseIndex]));
  const selling=a.selling[inputYear]*costs+riskRevenue*g.riskSellingRate;
  const admin=a.admin[inputYear]*costs,RD=a.RD[inputYear]*costs,other=a.other[inputYear]*costs;
  const ebit=gp-selling-admin-RD-other;
  const da=a.DA[inputYear]*costs,capex=a.capex[inputYear]*costs,nwc=a.NWC[inputYear]*costs;
  const sbc=a.SBC[inputYear]*costs,rent=a.leaseRent[inputYear]*costs,bd=n<7?a.BD[inputYear]:0;
  const portion=n===0?g.H2Fraction:1;
  const open={cash,products,restricted,bank,bonds,shares};
  const cashInterest=Math.max(cash,0)*g.cashRate+products*g.productRate;
  const bankInterest=(bank+(n===0?g.bankOtherPayable:0))*g.bankRate;
  const firstBondInterest=Math.min(bonds,g.bondAnchor)*g.bondFirstRate;
  let subsequentBondInterest;
  if(n===0)subsequentBondInterest=(g.newBond2*g.bond2Rate*g.bond2Fraction+g.newBond3*g.bond3Rate*g.bond3Fraction)/portion;
  else subsequentBondInterest=Math.max(0,Math.min(g.newBond2,bonds-g.bondAnchor))*g.bond2Rate+Math.max(0,bonds-g.bondAnchor-g.newBond2)*g.bond3Rate;
  const bondInterest=firstBondInterest+subsequentBondInterest;
  const beforeTax=ebit+cashInterest-bankInterest-bondInterest;
  const normal=beforeTax-Math.max(beforeTax,0)*g.tax;
  const ocf=(normal+da+sbc-nwc-rent)*portion;
  const capCash=n===0?Math.max(0,capex-g.H1Capex):capex;
  const bankPay=Math.min(bank,n<7?a.bankPay[inputYear]:g.lateBankPay);
  const bondPay=Math.min(bonds,n<7?a.bondPay[inputYear]:0);
  const bondIssue=n===0?g.newBond2+g.newBond3:0;
  const productRedeem=Math.min(products,n<7?a.productRedeem[inputYear]:products);
  const restrictedRelease=n===1?restricted:0;
  const collect=n===1?g.associateReceivable*g.receivableRecovery:0;
  const issue=n<7?a.issueGross[inputYear]:0,issueNet=issue*g.issueNetFactor;
  const issueShares=issue*g.FX/a.issuePx[inputYear];
  const aOptions=n<7?a.Aoptions[inputYear]:0,hOptions=n<7?a.Hoptions[inputYear]:0;
  const optionCash=aOptions*g.AoptionPrice+hOptions*g.HoptionPrice/g.FX;
  const employee=n<7?a.employeeShares[inputYear]:shares*g.lateSharesGrowth;
  const investment=n<7?a.investment[inputYear]:0,reward=sbc*portion*g.rewardBudgetFactor;
  const bdTax=(Math.max(0,beforeTax+bd)-Math.max(0,beforeTax))*g.tax;
  shares+=issueShares+aOptions+hOptions+employee;
  products-=productRedeem;restricted-=restrictedRelease;
  cash+=ocf-capCash-bankPay-bondPay+bondIssue*g.newBondNetFactor+productRedeem+restrictedRelease+collect+bd-bdTax+issueNet+optionCash-investment-reward-(n===0?g.bankOtherPayable:0);
  bank=Math.max(0,bank-bankPay);bonds=Math.max(0,bonds+bondIssue-bondPay);
  if(bank<1e-12)bank=0;if(bonds<1e-12)bonds=0;
  reserve+=(normal*portion+bd-bdTax)*.9;
  const div=year>=g.distributionStart&&bank===0&&bonds===0?Math.min(Math.max(0,reserve),Math.max(0,cash-g.distributionReserve)*g.distributionRate):0;
  cash-=div;reserve-=div;
  out.push({year,coreRevenueCNYbn:sum(core),riskRevenueCNYbn:riskRevenue,revenueCNYbn:revenue,grossProfitCNYbn:gp,sellingCNYbn:selling,adminCNYbn:admin,RAndDCNYbn:RD,otherCNYbn:other,EBIT_CNYbn:ebit,DA_CNYbn:da,capitalExpenditureCNYbn:capex,NWC_CNYbn:nwc,SBC_CNYbn:sbc,BDCashCNYbn:bd,FCFF_CNYbn:ebit-Math.max(0,ebit)*g.tax+da+sbc-capex-nwc-rent,cashStartCNYbn:open.cash,productsStartCNYbn:open.products,bankStartCNYbn:open.bank,bondStartCNYbn:open.bonds,cashInterestCNYbn:cashInterest,bankInterestCNYbn:bankInterest,bondInterestCNYbn:bondInterest,parentNormalProfitCNYbn:normal,remainingOCF_CNYbn:ocf,remainingCapexCNYbn:capCash,capitalizedInterestCNYbn:0,bankPaymentCNYbn:bankPay,bondPaymentCNYbn:bondPay,newBondCNYbn:bondIssue,productRedemptionCNYbn:productRedeem,restrictedReleaseCNYbn:restrictedRelease,associateCollectionCNYbn:collect,issueGrossCNYbn:issue,issueNetCNYbn:issueNet,issuePriceHKD:a.issuePx[inputYear],issueSharesBn:issueShares,AoptionSharesBn:aOptions,HoptionSharesBn:hOptions,optionCashCNYbn:optionCash,employeeSharesBn:employee,rewardBudgetCashCNYbn:reward,investmentCashCNYbn:investment,leaseRentCNYbn:rent,dividendCashCNYbn:div,perShareDividendHKD:div/shares*g.FX,forecastCashCNYbn:cash,forecastProductsCNYbn:products,forecastRestrictedCNYbn:restricted,forecastBankCNYbn:bank,forecastBondCNYbn:bonds,sharesStartBn:open.shares,dilutedSharesBn:shares,EPS_CNY:normal/shares,financialStakeCNYbn:g.financialAnchor*g.financialRecovery*Math.pow(1+g.financialGrowth,n),LPliabilityCNYbn:g.LPliability,NCI_CNYbn:g.NCI,distributableReserveCNYbn:reserve,_risk:risk,_core:core});
 }
 return out;
}
function independentlyValue(mm,h,c,rows){
 const g=mm.junshiBridge.globals[c],sc=mm.scenarios[h],date=Date.parse(sc.target),year=+sc.target.slice(0,4);
 const fraction=(date-Date.parse(`${year}-01-01`))/(Date.parse(`${year+1}-01-01`)-Date.parse(`${year}-01-01`));
 const now=rows.find(x=>x.year===year),prev=rows.find(x=>x.year===year-1);
 const interpolate=k=>year===2026?now[k]:prev[k]+(now[k]-prev[k])*fraction;
 const final=rows.at(-1);
 const recovery=Math.max(0,final.forecastCashCNYbn+final.forecastProductsCNYbn+final.forecastRestrictedCNYbn-final.forecastBankCNYbn-final.forecastBondCNYbn+final.financialStakeCNYbn-final.LPliabilityCNYbn-final.NCI_CNYbn);
 const flows=rows.filter(x=>Date.parse(`${x.year}-12-31`)>date);
 const pv=sum(flows.map(x=>(x.dividendCashCNYbn+(x.year===2041?recovery:0))/x.dilutedSharesBn*g.FX/Math.pow(1+g.discount,(Date.parse(`${x.year}-12-31`)-date)/86400000/365.25)));
 const min=Math.min(...rows.map(x=>x.forecastCashCNYbn));
 const intrinsic=min<g.minimumCashReserve?0:pv;
 const shares=interpolate('dilutedSharesBn');
 return {intrinsicPrice:intrinsic,price:mm.price+sc.marketRecognitionFactor[c]*(intrinsic-mm.price),dividend:sum(rows.filter(x=>Date.parse(`${x.year}-12-31`)<=date).map(x=>x.perShareDividendHKD)),eps:now.EPS_CNY,revenue:now.revenueCNYbn,normalProfit:now.parentNormalProfitCNYbn,businessValueCNYbn:pv/g.FX*shares,equityValueCNYbn:pv/g.FX*shares,cashAtTargetCNYbn:interpolate('forecastCashCNYbn'),productsAtTargetCNYbn:interpolate('forecastProductsCNYbn'),bankAtTargetCNYbn:interpolate('forecastBankCNYbn'),bondAtTargetCNYbn:year===2029&&date>=Date.parse('2029-08-21')?now.forecastBondCNYbn:interpolate('forecastBondCNYbn'),financialStakeCNYbn:interpolate('financialStakeCNYbn'),dilutedSharesBn:shares,minimumCashCNYbn:min,terminalRecoveryCNYbn:recovery,fundingFailure:min<g.minimumCashReserve};
}
function check(mm,c,cached=false){
 const own=independentlyCalculate(mm,c),native=calculateJunshiAnnual(mm,c);
 for(let n=0;n<16;n++){
  for(const[k,v]of Object.entries(own[n]))if(typeof v==='number'){eq(`${c}/${n}/${k}`,native[n][k],v);if(cached)eq(`cached/${c}/${n}/${k}`,mm.annualForecast[labels[c]][n][k],v);}
  own[n]._risk.forEach((r,i)=>{eq('assetgross',native[n].riskAssets[i].nominalRevenueCNYbn,r.gross);eq('assetcompany',native[n].riskAssets[i].companyNominalRevenueCNYbn,r.company);eq('assetrisk',native[n].riskAssets[i].riskRevenueCNYbn,r.risk);});
 }
 for(const h of Object.keys(mm.scenarios)){
  const value=independentlyValue(mm,h,c,own),nativeValue=calculateJunshiHorizon(mm,h,c);
  for(const[k,v]of Object.entries(value))if(typeof v==='number'){eq(`${h}/${c}/${k}`,nativeValue[k],v);if(cached)eq(`cached/${h}/${c}/${k}`,mm.horizons[h].scenarios[c][k],v);}
  ok('failureflag',value.fundingFailure===nativeValue.fundingFailure);
 }
}
for(let c=0;c<3;c++)check(m,c,true);
const edits=[
 {kind:'junshiAnnual',field:'issueGross',index:3,value:2},
 {kind:'junshiAnnual',field:'issuePx',index:3,value:10},
 {kind:'junshiAnnual',field:'employeeShares',index:3,value:.05},
 {kind:'junshiAnnual',field:'RD',index:2,value:1.9},
 {kind:'junshiAnnual',field:'bondPay',index:3,value:1},
 {kind:'junshiAnnual',field:'Aoptions',index:2,value:.01},
 {kind:'junshiGlobal',field:'bankAnchor',value:5.5},
 {kind:'junshiGlobal',field:'newBond2',value:.5},
 {kind:'junshiGlobal',field:'newBond3',value:.9},
 {kind:'junshiGlobal',field:'startCash',value:2},
 {kind:'junshiGlobal',field:'startProducts',value:.8},
 {kind:'junshiGlobal',field:'discount',value:.16},
 {kind:'junshiGlobal',field:'distributionRate',value:.4},
 {kind:'junshiGlobal',field:'lossAnchor',value:0},
 {kind:'junshiGlobal',field:'financialRecovery',value:0},
 {kind:'junshiAsset',field:'p',groupIndex:4,value:.2},
 {kind:'junshiAsset',field:'netRate',groupIndex:4,value:.08},
 {kind:'junshiAsset',field:'start',groupIndex:4,value:2035},
 {kind:'junshiCurve',index:3,value:.45}
];
for(const edit of edits){const mm=structuredClone(m);setJunshiAtomic(mm,{...edit,caseIndex:1});check(mm,1);}

const f=m.financialVerified;
eq('revenueidentity',f.revenue,f.productRevenue+f.licenseRevenue+f.serviceRevenue+f.otherRevenue);
eq('licenseidentity',f.licenseRevenue,f.upfrontRecognized+f.royaltiesRecognized+f.licenseAmortization);
eq('grossprofit',f.grossProfit,f.revenue-f.COGS);
eq('parentNCI',f.parentProfit,f.groupProfit-f.NCIProfit);
eq('cashcapex',f.totalCapex,f.PPEcapex+f.intangCapex);
eq('borrowings',f.totalBorrowings,f.bank+f.bonds);
eq('legalshareclasses',f.SeptLegalShares,f.SeptHshares+f.SeptAshares);
eq('treasuryexcluded',f.SeptEconomicShares,f.SeptLegalShares-f.SeptTreasuryShares);
for(const r of m.historicalFinancial.rows)eq('historyGP',r.grossProfit,r.revenue-r.COGS);
eq('2025IFRSparent',m.historicalFinancial.rows.find(x=>x.year===2025).parentProfit,-840.910);
const annual=sources.find(x=>x.url.endsWith('2026042701561.pdf')).text;
ok('primary2025parent',/purpose of basic loss per share\s*\(840,910\)/.test(annual));
const half=sources.find(x=>x.url.endsWith('2026092400305.pdf')).text;
ok('primarylossreserve',half.includes('(11,138,589)'));
ok('primarybankandbonds',half.includes('5,817,876')&&half.includes('4,808,773')&&half.includes('1,009,103'));
eq('borrowingsmaturity',f.totalBorrowings,1398.507+1625.880+1799.245+994.244);
for(const source of sources){const match=source.publicationDate.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);ok('sourceDateParsed',!!match);const[,d,mo,y,hr,mi]=match;ok('cutoffEligible',Date.parse(`${y}-${mo}-${d}T${hr}:${mi}:00+08:00`)<=Date.parse('2026-10-09T16:00:00+08:00'));}
for(const s of Object.values(m.scores)){eq('scoreweights',sum(s.weights),100);eq('score',s.total,sum(s.dimensions.map((v,i)=>v*s.weights[i]/5)));}
for(const h of Object.values(m.horizons)){
 eq('scenarioweights',sum(h.scenarios.map(x=>x.probability)),1);
 eq('expected',h.expectedPriceHKD,sum(h.scenarios.map(x=>x.price*x.probability)));
 eq('expectedreturn',h.expectedCapitalReturnPct,(h.expectedPriceHKD/m.price-1)*100);
 for(const v of h.scenarios){eq('capitalreturn',v.capitalReturnPct,(v.price/m.price-1)*100);eq('totalreturn',v.totalReturnPct,((v.price+v.dividend)/m.price-1)*100);if(h.years>=2.9)eq('CAGR',v.annualizedTotalReturnPct,(Math.pow((v.price+v.dividend)/m.price,1/h.years)-1)*100);}
 for(const w of h.weightSensitivity){eq('sensitivityweights',sum(w.weights),1);eq('sensitivityprice',w.expectedPriceHKD,sum(h.scenarios.map((v,i)=>v.price*w.weights[i])));eq('sensitivityreturn',w.expectedReturnPct,(w.expectedPriceHKD/m.price-1)*100);}
}
eq('HKactualYear',Date.parse(m.scenarios.oneYear.target),Date.parse('2027-10-07'));
for(let c=0;c<3;c++){
 const g=m.junshiBridge.globals[c],a=m.junshiBridge.inputs[labels[c]],rows=independentlyCalculate(m,c);
 eq('cashanchor',g.startCash,f.cash/1000);eq('productsSeparate',g.startProducts,f.currentFinancialProducts/1000);
 eq('economicShares',g.startShares,f.SeptEconomicShares/1e9);eq('capitalInterestNoDouble',rows[0].capitalizedInterestCNYbn,0);
 eq('newBondsOnlyAfterJune',rows[0].newBondCNYbn,1);eq('newBondsNetCashAndDebt',rows[0].forecastBondCNYbn,2.009103);
 eq('2029allBondsRepaid',rows[3].bondPaymentCNYbn,2.009103);eq('2029bondZero',rows[3].forecastBondCNYbn,0);
 eq('threeYearBondZero',independentlyValue(m,'threeYear',c,rows).bondAtTargetCNYbn,0);
 eq('SBCnotcashsubstitute',g.rewardBudgetFactor,0);eq('DAexcludeROUanchor',f.PPE_DAinPL+f.intangDAinPL,119.381);
 eq('baseRentCashIncrement',m.junshiBridge.inputs.base.leaseRent[0],.038);
 eq('firstBondNotDoubleAdd',g.bondAnchor,1.009103);
 for(const r of rows){ok('dividendSubjectToLoss',r.dividendCashCNYbn===0||r.distributableReserveCNYbn>=-1e-10);ok('noDividendUntilDebtRepaid',r.dividendCashCNYbn===0||(r.forecastBankCNYbn===0&&r.forecastBondCNYbn===0));if(r.year<=2031)eq('noDividendAtCoveredHorizons',r.perShareDividendHKD,0);}
 eq('oldInterestAnchorOnly',g.oldInterestCapitalized,.04204);
}
ok('bearFundingFails',calculateJunshiHorizon(m,'oneYear',0).fundingFailure);
ok('baseFundingSolvent',!calculateJunshiHorizon(m,'oneYear',1).fundingFailure);
const noIssue=structuredClone(m);noIssue.junshiBridge.inputs.base.issueGross.fill(0);
ok('noMarketEquityFails',calculateJunshiHorizon(noIssue,'oneYear',1).fundingFailure);
eq('base3bnissue',m.annualForecast.base[3].issueGrossCNYbn,3);
eq('base150mnewshares',m.annualForecast.base[3].issueSharesBn,.15);
eq('bullAoptionsTotal',sum(m.annualForecast.bull.map(x=>x.AoptionSharesBn)),.023675);
eq('bullHoptionsTotal',sum(m.annualForecast.bull.map(x=>x.HoptionSharesBn)),.01321);

// Cash-only/fair issuance/employee dilution boundaries expose additive cash
// and debt errors even where two implementations share ordinary arithmetic.
const cashOnly=structuredClone(m),z=cashOnly.junshiBridge,a=z.inputs.base,g=z.globals[1];
z.assets.forEach(x=>x.peak=[0,0,0]);
for(const[k,v]of Object.entries(a))if(Array.isArray(v))v.fill(0);
a.issuePx.fill(100);a.GM={ToripChina:0,OtherPharma:0,MarketedRoyalties:0,Services:0};
Object.assign(g,{startCash:100,startProducts:0,restricted:0,bankAnchor:0,bondAnchor:0,startShares:1,FX:1,cashRate:0,productRate:0,bankRate:0,discount:0,lateCostGrowth:0,lateSharesGrowth:0,financialAnchor:0,LPliability:0,NCI:0,newBond2:0,newBond3:0,bankOtherPayable:0,associateReceivable:0,H1Capex:0,minimumCashReserve:0,distributionStart:2041,distributionReserve:1e9,distributionRate:0,issueNetFactor:1,lossAnchor:0});
eq('cashonly100',calculateJunshiHorizon(cashOnly,'oneYear',1).intrinsicPrice,100);
a.issueGross[2]=100;eq('fairIssueValueUnchanged',calculateJunshiHorizon(cashOnly,'oneYear',1).intrinsicPrice,100);
a.issuePx[2]=50;eq('discountedIssueDilution',calculateJunshiHorizon(cashOnly,'oneYear',1).intrinsicPrice,200/3);
a.issueGross.fill(0);a.employeeShares[2]=1;a.admin[2]=10;a.SBC[2]=10;
eq('equitySBCAddBackAndDilution',calculateJunshiHorizon(cashOnly,'oneYear',1).intrinsicPrice,50);
a.employeeShares.fill(0);a.admin.fill(0);a.SBC.fill(0);a.Aoptions[2]=1;g.AoptionPrice=100;
eq('fairOptionCashAndShares',calculateJunshiHorizon(cashOnly,'oneYear',1).intrinsicPrice,100);
const qa={passed:true,checks,modelVersion:m.modelVersion,scope:'independent atomic calculation: 3 scenarios x16 annual periods x11 risk assets x5 horizons; 19 edits; cached results; financial identities; known2026bonds/2029put; optioncash/shares; loss-constrained distributions; source cutoff; fair issuance and SBC boundaries'};
await fs.writeFile(root+'/data/I046_independent_qa.json',JSON.stringify(qa,null,2));
console.log(JSON.stringify(qa));
