import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const m=JSON.parse(await fs.readFile(root+'/data/simcere_model.pending.json','utf8'));
const md=await fs.readFile(root+'/research/I033_deep.md','utf8');
const q=[],failures=[];const check=(label,pass)=>{q.push({label,pass});if(!pass)failures.push(label);};
const eq=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<1e-8;
const sum=a=>a.reduce((x,y)=>x+y,0),labels=['bear','base','bull'],w=[.25,.5,.25],f=m.financialVerified;
check('reported revenue six categories',eq(f.revenue,sum([f.productRevenue,f.commercialization,f.collaboration,f.licenseRevenue,f.RDservice,f.otherRevenue])));
check('reported gross bridge',eq(f.revenue-f.COGS,f.grossProfit));
check('reported net parent bridge',eq(f.consolidatedProfit+f.minorityLoss,f.parentProfit));
check('reported adjusted parent bridge',eq(f.parentProfit+f.FVloss+f.redemptionInterest+f.adjustTax,f.adjustedParent));
check('reported consolidated pretax after tax',eq(f.pretax-f.tax,f.consolidatedProfit));
check('reported segment pretax after exclusions',eq(f.oncAdjustedPretax+f.otherAdjustedPretax-1.936-f.FVloss-f.redemptionInterest-1.282-1.273,f.pretax));
check('reported operating to pretax',eq(f.operatingProfit-.832-1.282-1.273,f.pretax));
check('reported research investment different from total intangibles',eq(f.RDexpense+f.licensedIntangibleAdd,f.totalRDInvestment)&&f.actualIntangibleAdd>f.licensedIntangibleAdd);
check('reported liquid cash only unrestricted plus TD',eq((f.cash+f.TDcurrent+f.TDnoncurrent)/1000,m.cashBridge.liquidCashCNYbn));
check('reported debt current and noncurrent',eq((f.bankCurrent+f.bankNoncurrent)/1000,m.cashBridge.bankDebtCNYbn));
check('reported redeemable capital anchor',eq(f.redemptionLiability/1000,m.cashBridge.redemptionLiabilityCNYbn));
check('reported group shares expense',eq((f.RSUexpense+f.ZaimingSBCexpense)/1000,.088004));
check('reported H1 basic and diluted different',f.H1basicShares<f.H1dilutedShares&&f.H1dilutedShares<f.legalShares);
check('reported legal shares monthly source',m.financialEvidence.find(x=>x.metric==='legalShares').sourceURL.includes('12361058'));
check('reported basic shares unit',m.financialEvidence.find(x=>x.metric==='H1basicShares').unit==='shares');
check('reported H1 buybacks monetary unit',m.financialEvidence.find(x=>x.metric==='H1buyback').unit==='million CNY');
check('reported Oct9 buybacks shares',m.financialEvidence.find(x=>x.metric==='Oct9buyback').unit==='shares');
check('reported Oct9 buyback payment HKD',m.financialEvidence.find(x=>x.metric==='Oct9buybackHKDmillion').unit==='million HKD');
check('reported receivable comparator yearend',m.financialEvidence.find(x=>x.metric==='previousReceivables').period==='2025-12-31');
for(let si=0;si<3;si++){
 const label=labels[si],a=m.annualInput[label],rows=m.annualForecast[label];
 for(let n=0;n<rows.length;n++){
  const r=rows[n],p=label+'/'+r.year,segments={};
  for(const seg of ['neuro','auto','onc','other'])segments[seg]={rev:a[seg][n],gp:a[seg][n]*a[seg+'GM']};
  for(const asset of m.domesticRiskAssumptions){
   const age=r.year-asset.start[si],curve=[.08,.2,.4,.65,.85,1,1,.95,.85,.7],nominal=age<0?0:asset.peak[si]*(curve[age]??1),risk=nominal*asset.success[si],actual=r.domesticRiskAssets.find(x=>x.id===asset.id);
   check(p+'/'+asset.id+' nominal revenue',eq(actual.nominalRevenueCNYbn,nominal));
   check(p+'/'+asset.id+' independent risk revenue',eq(actual.riskRevenueCNYbn,risk));
   check(p+'/'+asset.id+' independent GP',eq(actual.riskGrossProfitCNYbn,risk*asset.GM[si]));
   segments[asset.segment].rev+=risk;segments[asset.segment].gp+=risk*asset.GM[si];
  }
  for(const asset of m.foreignRoyaltyAssumptions){
   const age=r.year-asset.start[si],curve=[.08,.2,.4,.65,.85,1,1,.95,.85,.7],nominal=age<0?0:asset.peakUSD[si]*(curve[age]??1),risk=nominal*7*asset.royalty[si]*asset.success[si],actual=r.foreignRoyalties.find(x=>x.id===asset.id);
   check(p+'/'+asset.id+' foreign nominal partner sales',eq(actual.partnerNominalSalesUSDbn,nominal));
   check(p+'/'+asset.id+' foreign royalty FX risk',eq(actual.riskRoyaltyRevenueCNYbn,risk));
   check(p+'/'+asset.id+' foreign ongoing gross',eq(actual.riskRoyaltyGrossCNYbn,risk*(1-asset.costRate)));
   segments[asset.segment].rev+=risk;segments[asset.segment].gp+=risk*(1-asset.costRate);
  }
  for(const[seg,v]of Object.entries(segments)){
   const actual=r.segments.find(x=>x.segment===seg);check(p+'/'+seg+' reconstructed revenue',eq(actual.revenueCNYbn,v.rev));check(p+'/'+seg+' reconstructed gross',eq(actual.grossProfitCNYbn,v.gp));
  }
  const revenue=sum(Object.values(segments).map(x=>x.rev)),gross=sum(Object.values(segments).map(x=>x.gp)),expenses=a.selling[n]+a.admin[n]+a.rd[n]+a.impairment[n],oncCost=a.selling[n]*.26+a.admin[n]*.32+a.rd[n]*.40+a.impairment[n]*.35;
  const oncPretax=segments.onc.gp-oncCost,otherPretax=gross-segments.onc.gp-(expenses-oncCost),pretax=gross-expenses-a.interest[n]-a.redemptionInterest[n],consolidated=pretax*(1-a.tax),minority=oncPretax*(1-a.tax)*(1-a.parentShare[n]),parent=consolidated-minority,EPS=Math.max(0,parent)/a.shares[n],ocf=consolidated+a.DA[n]+a.SBC[n]-a.NWC[n];
  check(p+' all revenue independent',eq(r.coreRevenueCNYbn,revenue));check(p+' all GP independent',eq(r.coreGrossProfitCNYbn,gross));
  check(p+' separate selling admin full RD',eq(r.sellingCNYbn,a.selling[n])&&eq(r.adminCNYbn,a.admin[n])&&eq(r.RAndDCNYbn,a.rd[n]));
  check(p+' gross margin',eq(r.coreGrossMargin,gross/revenue));check(p+' oncology cost allocation',eq(r.oncologyAllocatedCostCNYbn,oncCost));
  check(p+' oncology normal pretax',eq(r.oncologyNormalPretaxCNYbn,oncPretax));check(p+' other normal pretax',eq(r.otherNormalPretaxCNYbn,otherPretax));
  check(p+' core financing after operating bridge',eq(r.corePretaxCNYbn,pretax));check(p+' tax/consolidated',eq(r.consolidatedCoreProfitCNYbn,consolidated));
  check(p+' economic minority distinct accounting',eq(r.oncologyMinorityProfitCNYbn,minority));check(p+' parent net economic',eq(r.coreNetProfitCNYbn,parent));check(p+' EPS full diluted shares',eq(r.epsCNY,EPS));
  check(p+' core cash shares expense not stripped profit',eq(r.normalizedOCFCNYbn,ocf));
  const remain=n===0?ocf*.5:ocf,capex=n===0?Math.max(0,a.capex[n]-.252953):a.capex[n],lic=n===0?Math.max(0,a.licensePurchase[n]-.113705):a.licensePurchase[n],roche=n===0?.075*7*.85:0,milestone=a.milestoneCash[n]*.85,div=n===0?.457268:a.dividend[n-1]*a.shares[n];
  const open=n===0?5.197607:rows[n-1].forecastLiquidCashCNYbn,cash=open+remain-capex-lic-.04+roche+milestone-div-a.buyback[n]-a.redeemCash[n]+a.bankFunding[n];
  check(p+' H2 cash simplified half explicit',eq(r.remainingOperatingCashCNYbn,remain)&&r.cashLimitation.includes('halfyear'));
  check(p+' capex excludes paid H1',eq(r.remainingCapexCNYbn,capex));check(p+' intangibles excludes paid H1',eq(r.remainingLicensePurchaseCNYbn,lic));
  check(p+' Roche cash only H2 once',eq(r.RocheNetCashCNYbn,roche));check(p+' selected milestones not total maximum',eq(r.selectedMilestoneNetCashCNYbn,milestone));
  check(p+' declared old dividend and later lag',eq(r.dividendCashCNYbn,div));check(p+' cash opening independent',eq(r.cashStartCNYbn,open));check(p+' cash full roll independent',eq(r.forecastLiquidCashCNYbn,cash));
  check(p+' bank roll',eq(r.forecastBankDebtCNYbn,(n===0?1.05799:rows[n-1].forecastBankDebtCNYbn)+a.bankFunding[n]));
  check(p+' redemption and economic share alternatives',n!==1||label==='bear'?(n!==1||eq(r.redemptionSettlementCashCNYbn,1.32)&&eq(r.oncologyEconomicParentShare,.98)):(eq(r.redemptionSettlementCashCNYbn,0)&&r.oncologyEconomicParentShare<.831));
  check(p+' no unverified IPO proceeds',!('IPOcash' in r));
 }
}
const years={yearEnd:2027,halfYear:2027,oneYear:2028,threeYear:2029,fiveYear:2031};
const PE={yearEnd:[20,22,26],halfYear:[18,24,29],oneYear:[17,23,28],threeYear:[15,22,27],fiveYear:[13,20,25]},recognition={yearEnd:[1,.5,.35],halfYear:[1,.75,.6],oneYear:[1,1,1],threeYear:[1,1,1],fiveYear:[1,1,1]};
for(const[k,s]of Object.entries(m.scenarios)){
 const h=m.horizons[k],expectedPrices=[];check(k+' weights',eq(sum(s.scenarioWeights),1));check(k+' no duplicate cash debt value',s.noSeparateCashDebtValuation===true);
 for(let i=0;i<3;i++){
  const r=m.annualForecast[labels[i]].find(x=>x.year===years[k]),c=s.components[i],intrinsic=r.coreNetProfitCNYbn/r.dilutedSharesBn*PE[k][i]*1.1,target=10.89+recognition[k][i]*(intrinsic-10.89);expectedPrices.push(target);
  check(k+'/'+labels[i]+' intrinsic normal profit PE FX',eq(c.fullRecognitionFairPriceHKD,intrinsic)&&eq(s.intrinsicPrices[i],intrinsic));
  check(k+'/'+labels[i]+' separate market recognition',eq(s.marketRecognitionFactor[i],recognition[k][i])&&eq(c.targetPriceHKD,target));
  check(k+'/'+labels[i]+' final target array',eq(s.priceHKD[i],target));check(k+'/'+labels[i]+' price return',eq(h.scenarios[i].capitalReturnPct,(target/10.89-1)*100));
  const divYears=k==='oneYear'?1:k==='threeYear'?3:k==='fiveYear'?5:0,div=sum(m.annualInput[labels[i]].dividend.slice(0,divYears))*1.1;
  check(k+'/'+labels[i]+' future dividend excludes old payment',eq(c.dividendHKD,div));check(k+'/'+labels[i]+' total return',eq(h.scenarios[i].totalReturnPct,((target+div)/10.89-1)*100));
  if(h.years>=3)check(k+'/'+labels[i]+' full return annualization',eq(h.scenarios[i].annualizedTotalReturnPct,(((target+div)/10.89)**(1/h.years)-1)*100));
  check(k+'/'+labels[i]+' rounded prose table',md.includes(target.toFixed(3)));
 }
 const expected=sum(expectedPrices.map((p,i)=>p*w[i]));check(k+' independent expectation',eq(s.expectedPriceHKD,expected)&&eq(h.expectedPriceHKD,expected));check(k+' independent expected return',eq(h.expectedCapitalReturnPct,(expected/10.89-1)*100));
 for(const sens of h.weightSensitivity){const e=sum(expectedPrices.map((p,i)=>p*sens.weights[i]));check(k+' sensitivity '+sens.weights.join('/'),eq(sens.expectedPriceHKD,e)&&eq(sens.expectedReturnPct,(e/10.89-1)*100));}
}
for(const[k,s]of Object.entries(m.scores)){check(k+' score weights sum',eq(sum(s.weights),100));check(k+' score normal 0..5',s.dimensions.every(x=>x>=0&&x<=5));check(k+' weighted total independent',eq(s.total,sum(s.dimensions.map((x,i)=>x/5*s.weights[i]))));}
for(const b of m.brokerTargets){const age=(Date.parse('2026-10-09')-Date.parse(b.publicationDate))/86400000;check('broker latest foreign within90',b.institution==='UBS'&&b.targetPrice===16.6&&age>=0&&age<=90&&b.currency==='HKD'&&b.sourceType==='financial_news_secondary');}
check('public first H1 after close explicit',m.firstPublicInformation.afterClose&&m.firstPublicInformation.time.startsWith('22:49'));
check('Oct9 after close not public before move',m.postCloseInformation[0].publication==='2026-10-09 18:12 Asia/Hong_Kong'&&md.includes('不能说市场早晨已经知道'));
check('old dividend timing and exclusion prose',md.includes('六月十七日除净')&&md.includes('七月十三日支付')&&md.includes('不能再获得旧股息'));
check('Roche global rights no China separate assets',m.foreignRoyaltyAssumptions.find(x=>x.id==='SIM0660').rights.includes('no China direct')&&!m.domesticRiskAssumptions.some(x=>x.id==='SIM0660'));
check('prior AbbVie4000萬 not readd',md.includes('二〇二五年十二月又收四千万美元')&&md.includes('不能再在下半年增加一次'));
check('all important inputs before cutoff',m.financialEvidence.every(x=>x.firstPublicDate<='2026-10-09'));
check('market 7 OHLC repairs explicit',md.includes('七根')&&m.limitations.some(x=>x.includes('7根OHLC')));
check('no false tier contract guarantee',md.includes('不是公开合同确切商业预测')||md.includes('均非公开合同确切商业预测'));
check('short recognition no clinical probability',md.includes('不是把外资十二个月目标按剩余月份线性缩放'));
check('normal profit PE no separate cash subtraction',md.includes('不再在每股目标加全部现金、扣全部净债'));
const out={issuerId:'I033',checkedAt:new Date().toISOString(),modelVersion:m.modelVersion,passed:!failures.length,checks:q,failures,manualReview:['逐段审阅有效正文16122汉字，无完全重复；同义重复与通用宏观未用于凑字','中报重列比较数、研发投资和实际无形资产增加范围分开','正常利润剔除BD、投资收益，不等于公司调整净利；销售行政全研发税息全部扣','经济再明份额与IFRS赎回少数账法有区别，未核最新拟上市完整结构，必须保留限制','悲观现金赎回后98%与基准/乐观上市稀释互斥，未加未知IPO资金','所有授权maximum非已收现金，AbbVie旧首付不重加，BI欧元非美元，Roche全球授权不重加中国权益','六月流动性为合并范围，H2核心OCF半年度简化，非真实季度预算','版税率、药物成功识别、收入峰值和PE是研究输入，不声称监管或机构共识','年底和半年市场识别桥与药物成功识别/情景权重分开','RSV预防、RSV治疗、不同ALK与推广权/完整权利分开；临床亚组不跨试验头对头','日上涨总量低主要与下跌日更多有关，平均上涨日量略高，不能说平均跌量更大','Word/PDF与全名单集成由父代理执行，名义目标日休市按各市场此前交易日处理'],remainingLimitations:m.limitations};
await fs.writeFile(root+'/data/I033_independent_qa.json',JSON.stringify(out,null,2));console.log(JSON.stringify({passed:out.passed,checks:q.length,failures}));if(failures.length)process.exitCode=1;
