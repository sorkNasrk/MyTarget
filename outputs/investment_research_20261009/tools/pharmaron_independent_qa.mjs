import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const m=JSON.parse(await fs.readFile(root+'/data/pharmaron_model.json','utf8'));
const md=await fs.readFile(root+'/research/I022_deep.md','utf8');
const checks=[],failures=[];
const check=(label,pass)=>{checks.push({label,pass});if(!pass)failures.push(label);};
const near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8;
const labels=['bear','base','bull'],weights=[.25,.5,.25],f=m.financialVerified;
check('H1 revenue sum',near(f.revenue,f.labRevenue+f.cdmoRevenue+f.clinicalRevenue+f.otherRevenue));
check('H1 gross profit sum',near(f.grossProfit,f.labGrossProfit+f.cdmoGrossProfit+f.clinicalGrossProfit+f.otherGrossProfit));
check('H1 cost bridge',near(f.revenue-f.COGS,f.grossProfit));
check('H1 minority profit bridge',near(f.parentProfit,f.consolidatedProfit+f.minorityLoss));
check('H1 adjusted profit bridge',near(f.adjustedParentProfit,f.parentProfit+f.adjustStockCompParent+f.adjustFXlossParent+f.adjustAcquisitionAmort+f.adjustInvestmentGain+f.adjustRestructure));
check('H1 FCF before lease',near(f.FCFBeforeLease,f.OCF-f.PPECash-f.intangibleCash));
check('H1 FCF after financing interest and lease',near(f.FCFBeforeLease-f.paidBankInterest-f.paidLeasePrincipal,-479.860));
check('Sept A/H legal shares',f.SeptLegalShares===f.SeptHExTreasuryShares+f.SeptHTreasuryShares+f.SeptAShares);
check('Sept ex treasury shares',f.SeptLegalExTreasuryShares===f.SeptLegalShares-f.SeptHTreasuryShares);
check('cash anchor',near(m.cashBridge.liquidCashCNYbn,(f.cashBalance+f.wealthProducts+f.amortizedFinancialAsset)/1000));
check('CB net model cash fee bridge',near(m.cashBridge.CBnetCNYbn,2.18*1.02*(327.2/330.8)));
check('cash ending row neutral description',!('cashFlowNetOfOverdraft' in f)&&near(f.cashFlowReportedEndingCash,1457.336));
check('actual H1 OCF after bank interest',near(m.cashBridge.actualH1OCFAfterBankInterestCNYbn,1.084645-.102838));
check('actual H1 investments sum',near(m.cashBridge.actualH1EquityAndAssociateInvestmentCashCNYbn,.135723+.213696+.019173));
check('actual declared dividend cash',near(m.cashBridge.actualDeclaredFinalDividendCashCNYbn,.364962));
for(const label of labels){
  const a=m.annualInput[label],rows=m.annualForecast[label];
  for(let n=0;n<rows.length;n++){
    const r=rows[n],prefix=label+'/'+r.year;
    const rev=a.lab[n]+a.cdmo[n]+a.clinical[n]+.02;
    const gross=a.lab[n]*a.labGM[n]+a.cdmo[n]*a.cdmoGM[n]+a.clinical[n]*a.clinicalGM[n]+.02*.10;
    const costs=a.selling[n]+a.admin[n]+a.rd[n]+a.impairment[n]+a.fxloss[n]+a.bankInterest[n];
    const consolidated=(gross-costs)*(1-a.tax[n]),parent=consolidated+a.minorityAdd[n];
    const shares=a.normalShares[n]+(a.convert&&r.year>=2027?.070478579:0);
    const ocf=consolidated+a.DandA[n]+a.SBCcashAdj[n]-a.nwcCash[n];
    check(prefix+' revenue',near(r.revenueCNYbn,rev));
    check(prefix+' gross',near(r.grossProfitCNYbn,gross));
    check(prefix+' normal pretax',near(r.pretaxCNYbn,gross-costs));
    check(prefix+' tax/parent bridge',near(r.parentNormalProfitCNYbn,parent));
    check(prefix+' diluted shares',near(r.dilutedSharesBn,shares));
    check(prefix+' EPS',near(r.EPS_CNY,parent/shares));
    check(prefix+' normalized OCF',near(r.annualOCF_CNYbn,ocf));
    check(prefix+' remaining OCF convention',near(r.cashRemainingOperatingCNYbn,n===0?ocf-(1.084645-.102838):ocf));
    check(prefix+' remaining capex',near(r.capexRemainingCNYbn,n===0?a.capex[n]-1.368324:a.capex[n]));
    check(prefix+' CB proceeds once',near(r.CBcashProceedsCNYbn,n===0?m.cashBridge.CBnetCNYbn:0));
    check(prefix+' CB cash/dilution alternatives',near(r.CBcashRepaymentCNYbn,r.year===2027&&!a.convert?2.18:0)&&!(r.CBcashRepaymentCNYbn>0&&r.CBunderlyingIncrementBn>0));
    check(prefix+' cash roll',near(r.forecastLiquidCashCNYbn,r.cashStartCNYbn+r.cashRemainingOperatingCNYbn-r.capexRemainingCNYbn-r.leasePrincipalCashCNYbn-r.financialEquityInvestmentCashCNYbn-r.dividendCashCNYbn+r.CBcashProceedsCNYbn-r.CBcashRepaymentCNYbn+r.bankNetFundingCNYbn));
    check(prefix+' opening cash',near(r.cashStartCNYbn,n===0?m.cashBridge.liquidCashCNYbn:rows[n-1].forecastLiquidCashCNYbn));
    check(prefix+' bank roll',near(r.forecastBankDebtCNYbn,(n===0?m.cashBridge.bankDebtCNYbn:rows[n-1].forecastBankDebtCNYbn)+r.bankNetFundingCNYbn));
    check(prefix+' net debt',near(r.forecastNetDebtCNYbn,r.forecastBankDebtCNYbn+r.CBfaceOutstandingCNYbn-r.forecastLiquidCashCNYbn));
  }
}
for(const[k,s]of Object.entries(m.scenarios)){
  const h=m.horizons[k];
  check(k+' no separate cash debt PE',s.noSeparateCashDebtValuation===true);
  check(k+' weights sum',near(s.scenarioWeights.reduce((a,b)=>a+b,0),1));
  s.components.forEach((c,i)=>{
    const prefix=k+'/'+labels[i],annual=m.annualForecast[labels[i]].find(r=>r.year===s.earningsYear);
    check(prefix+' annual profit snapshot',near(c.parentNormalProfitCNYbn,annual.parentNormalProfitCNYbn));
    check(prefix+' PE target',near(c.targetPriceHKD,c.parentNormalProfitCNYbn/c.dilutedSharesBn*c.PE*m.fx.HKDperCNY));
    check(prefix+' shared target array',near(c.targetPriceHKD,s.priceHKD[i]));
    check(prefix+' capital return',near(h.scenarios[i].capitalReturnPct,(c.targetPriceHKD/m.price-1)*100));
    check(prefix+' total return',near(h.scenarios[i].totalReturnPct,((c.targetPriceHKD+c.dividendHKD)/m.price-1)*100));
    check(prefix+' table rounding',md.includes(c.targetPriceHKD.toFixed(3)));
    if(h.years>=3)check(prefix+' CAGR',near(h.scenarios[i].annualizedTotalReturnPct,(((c.targetPriceHKD+c.dividendHKD)/m.price)**(1/h.years)-1)*100));
    const divYears=k==='oneYear'?1:k==='threeYear'?3:k==='fiveYear'?5:0;
    const dividend=m.annualInput[labels[i]].annualDividend.slice(0,divYears).reduce((a,b)=>a+b,0)*m.fx.HKDperCNY;
    check(prefix+' dividend entitlement schedule',near(c.dividendHKD,dividend));
  });
  const expected=s.priceHKD.reduce((a,p,i)=>a+p*weights[i],0);
  check(k+' expected price',near(s.expectedPriceHKD,expected)&&near(h.expectedPriceHKD,expected));
  check(k+' expected capital return',near(h.expectedCapitalReturnPct,(expected/m.price-1)*100));
  for(const v of h.weightSensitivity){
    const target=s.priceHKD.reduce((a,p,i)=>a+p*v.weights[i],0);
    check(k+' sensitivity '+v.weights.join('/'),near(v.expectedPriceHKD,target)&&near(v.expectedReturnPct,(target/m.price-1)*100));
  }
}
for(const[k,s]of Object.entries(m.scores)){
  check(k+' score weight sum',near(s.weights.reduce((a,b)=>a+b,0),100));
  check(k+' score',near(s.total,s.dimensions.reduce((a,z,i)=>a+z*s.weights[i]/5,0)));
  check(k+' score bounds',s.dimensions.every(z=>z>=0&&z<=5));
}
for(const b of m.brokerTargets){
  const age=(Date.parse('2026-10-09')-Date.parse(b.publicationDate))/86400000;
  check('broker '+b.institution+' cutoff/date',age>=0&&age<=90&&b.currency==='HKD'&&b.securityId==='S027');
}
check('broker institutions latest unique',new Set(m.brokerTargets.map(x=>x.institution)).size===m.brokerTargets.length);
check('Oct9 shareholder transfer postclose',m.postCloseInformation[0].publication==='2026-10-09 21:24 Asia/Hong_Kong'&&md.includes('收盘后公告不能用来解释当天已经发生的跌幅'));
check('CXO matched benchmark unavailable',m.limitations.some(x=>x.includes('不以创新药指数冒充')));
check('future dividend August assumption',m.assumptions.dividend.includes('payablefollowingyearAugust'));
check('HK 2026 final dividend excluded',md.includes('0.2299274港元')&&md.includes('7月7日除净')&&md.includes('8月7日支付'));
check('adjusted FX prose unified CNY',md.includes('外汇1.03574亿元'));
const result={issuerId:'I022',checkedAt:new Date().toISOString(),modelVersion:m.modelVersion,passed:failures.length===0,checks,failures,manualReview:['中报 IFRS 与 A 股准则不拼接成本桥；2025H1 分部已重列','归母正常 PE 已扣普通融资成本，不额外加现金或扣同一净债','现金桥由扣息净利润起算，上半年 IFRS OCF 减融资银行息作残期锚；租赁本金独立扣现金','2027 悲观偿还 CB 与基准乐观转股互斥；年底和半年前瞻股数非当期已经去债','口服 GLP1 客户未披露名或合同额，不用药品全球销售替代服务收入','当日股东询价转让在 21:24 发布，属于旧股交易且不解释当日价格','日线两根 OHLC 已经独立来源修复；匹配 CXO 行业指数缺失','正文每节逐项阅读并统一亿元与十亿元表达'],remainingLimitations:m.limitations};
await fs.writeFile(root+'/data/I022_independent_qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failures}));
if(failures.length)process.exitCode=1;
