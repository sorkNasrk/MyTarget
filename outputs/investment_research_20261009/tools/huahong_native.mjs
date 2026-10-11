export const huahongCases=['bear','base','bull'];
export const huahongHorizons=['yearEnd','halfYear','oneYear','threeYear','fiveYear'];
export const huahongYears={yearEnd:83/365,halfYear:.5,oneYear:1,threeYear:3,fiveYear:5};
export const huahongGlobalFields=['openingOwnerEquityUSD','acquisitionNetAdjustmentUSD','postInterimRetainedUSD','initialShares','initialAnnualOwnerProfitUSD','taxRate','JVParentShare','FX'];
export const huahongGlobalLabels=['六月归母权益USD十亿','同控收购净调整USD十亿','截止日前未披露留存估计USD十亿','截止日总经济股数十亿','初始正常归母利润年率USD十亿','正利润税率','合并工厂归母份额','HKD每USD研究假设'];
export const huahongHorizonFields=['legacyRevenue','targetRevenue','JVRevenue','wholeGross','JVGross','allCosts','JVCosts','afterTaxFinanceOther','capitalCash','depreciation','netEquityFinance','equityIssuePriceUSD','normalOptionsDilution','OCIChange','impairment','PB','dividend'];
export const huahongHorizonLabels=['原组合收入','收购工厂收入','51%工厂收入','全资桶毛利率','51%桶毛利率','全部运营费用含研发','51%桶分配费用','集团税后财资等净项','年度资本现金','年度折旧','累计净股权融资','发行美元价每股','常态新增期权股十亿','累计归母OCI变化','累计权益减值','目标PB倍','累计现金息HKD每股'];
const round=(v,n)=>Math.round(v*10**n)/10**n;
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8;
export function initializeHuahongBridge(m){
 if(m.issuerId!=='I071'||!m.bookEquityBridge||!m.businessRevenueAssumptions)return false;
 const z=m.bookEquityBridge;
 m.huahongBridge={years:structuredClone(huahongYears),globals:huahongCases.map((_,c)=>({openingOwnerEquityUSD:z.openingOwnerEquityUSD,acquisitionNetAdjustmentUSD:z.acquisitionNetAdjustmentUSD[c],postInterimRetainedUSD:z.postInterimPreAsOfRetainedEstimateUSD[c],initialShares:z.initialShares,initialAnnualOwnerProfitUSD:z.initialAnnualOwnerProfitUSD,taxRate:m.operatingBridge.effectiveTaxRate,JVParentShare:m.operatingBridge.JVParentShare,FX:m.fx.HKDperUSD})),inputs:Object.fromEntries(huahongHorizons.map(h=>[h,huahongCases.map((_,c)=>Object.fromEntries(huahongHorizonFields.map(f=>[f,f==='PB'?m.scenarios[h].PB[c]:f==='dividend'?m.scenarios[h].cumulativeCashDividendHKD[c]:['capitalCash','depreciation'].includes(f)?m.operatingBridge[h][f][c]:m.businessRevenueAssumptions[h][f]?.[c]??z[h][f]?.[c]])))]))};
 for(let c=0;c<3;c++)for(const h of huahongHorizons){const v=calculateHuahongHorizon(m,h,c),s=m.scenarios[h],op=m.operatingBridge[h],book=z[h];for(const[k,expected]of Object.entries({price:s.priceHKD[c],eps:s.epsUSD[c],dividend:s.cumulativeCashDividendHKD[c],revenueUSDbn:op.revenue[c],parentNormalProfitUSDbn:op.normalOwnerProfit[c],normalProfitIntegral:book.normalProfitIntegral[c],ownerEquityUSD:book.ownerEquity[c],dilutedSharesBn:book.dilutedShares[c],BVPSUSD:book.BVPSUSD[c],afterCapexOperatingProxy:op.afterCapexOperatingProxy[c]}))if(!close(v[k],expected))throw Error('Huahong native mismatch '+h+'/'+c+'/'+k+' '+v[k]+' != '+expected);}
 for(const h of huahongHorizons){const s=m.scenarios[h],vals=huahongCases.map((_,c)=>calculateHuahongHorizon(m,h,c));s.dilutedSharesBn=vals.map(v=>v.dilutedSharesBn);s.huahongBookPB=true;s.cases??=vals.map(v=>({price:v.price,dividend:v.dividend,eps:v.eps,PE:null}));s.cases.forEach((v,c)=>{v.eps=vals[c].eps;v.PE=null;});}
 return true;
}
export function setHuahongAtomic(m,record){
 const z=m.huahongBridge,c=record.caseIndex,v=record.value;if(!z||!Number.isFinite(v)||!Number.isInteger(c)||c<0||c>2)throw Error('Invalid Huahong atom');
 if(record.kind==='huahongGlobal'&&huahongGlobalFields.includes(record.field))z.globals[c][record.field]=v;
 else if(record.kind==='huahongHorizon'&&huahongHorizonFields.includes(record.field)&&z.inputs[record.horizon])z.inputs[record.horizon][c][record.field]=v;
 else throw Error('Unknown Huahong atom '+JSON.stringify(record));
}
export function calculateHuahongOperating(m,c){
 const z=m.huahongBridge,g=z.globals[c];let priorTime=0,priorProfit=g.initialAnnualOwnerProfitUSD,integral=0;
 return huahongHorizons.map(h=>{
  const a=z.inputs[h][c],whole=a.legacyRevenue-a.JVRevenue+a.targetRevenue,revenue=whole+a.JVRevenue,wholeGross=whole*a.wholeGross,JVGross=a.JVRevenue*a.JVGross,gross=wholeGross+JVGross,EBIT=gross-a.allCosts,groupTax=Math.max(0,EBIT)*g.taxRate,groupNet=EBIT-groupTax,JVEBIT=JVGross-a.JVCosts,JVTax=Math.max(0,JVEBIT)*g.taxRate,NCI=(JVEBIT-JVTax)*(1-g.JVParentShare),owner=groupNet+a.afterTaxFinanceOther-NCI,t=z.years[h],segment=(t-priorTime)*(priorProfit+owner)/2;
  integral+=segment;const v={h,time:t,priorTime,priorAnnualProfit:priorProfit,wholeRevenue:whole,JVRevenue:a.JVRevenue,revenueUSDbn:revenue,wholeGrossProfit:wholeGross,JVGrossProfit:JVGross,grossProfitUSDbn:gross,coreEBIT:EBIT,groupTax,groupAfterTaxCore:groupNet,JVEBIT,JVTax,NCIProfit:NCI,afterTaxFinanceOther:a.afterTaxFinanceOther,parentNormalProfitUSDbn:owner,profitSegmentIntegral:segment,normalProfitIntegral:integral,capitalCash:a.capitalCash,depreciation:a.depreciation,afterCapexOperatingProxy:groupNet+a.depreciation-a.capitalCash};priorTime=t;priorProfit=owner;return v;
 });
}
export function calculateHuahongHorizon(m,h,c){
 const z=m.huahongBridge,g=z.globals[c],a=z.inputs[h][c],rows=calculateHuahongOperating(m,c),op=rows.find(v=>v.h===h);if(!op)throw Error('Invalid Huahong horizon '+h);
 const financingShares=a.netEquityFinance/a.equityIssuePriceUSD,shares=g.initialShares+financingShares+a.normalOptionsDilution,divCash=a.dividend*shares/g.FX,equity=g.openingOwnerEquityUSD+g.acquisitionNetAdjustmentUSD+g.postInterimRetainedUSD+op.normalProfitIntegral-divCash+a.netEquityFinance+a.OCIChange-a.impairment,BV=round(equity/shares,6),eps=round(op.parentNormalProfitUSDbn/shares,6),price=round(BV*a.PB*g.FX,m.targetPriceRoundingDecimals??2);
 return{...op,rows,financingShares,dilutedSharesBn:shares,cumulativeCashDividendUSD:divCash,ownerEquityUSD:equity,BVPSUSD:BV,PB:a.PB,eps,price,dividend:a.dividend,FX:g.FX,normalROEPct:op.parentNormalProfitUSDbn/equity*100,priceReturn:price/m.price-1,totalReturn:(price+a.dividend)/m.price-1};
}
