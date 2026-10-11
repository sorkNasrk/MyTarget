// Native USD SOTP. The Legend stake is separate from consolidated operating businesses.
export const sotpFields=['lsgRevenue','lsgEBITmargin','lsgMultiple','probioRevenue','probioSalesMultiple','bestRevenue','bestSalesMultiple','corporateCost','corporateMultiple','tax','legendRevenue','legendGM','legendRD','legendSGA','legendTax','legendMultiple','legendExcessCash','legendShare','holdingFactor','groupResidualCash','preferredExternal','shares'];
export const sotpFieldLabels=['LSG收入USD十亿','LSG经营利润率','LSG税后经营倍数','ProBio外部收入USD十亿','ProBio销售倍数','Bestzyme外部收入USD十亿','Bestzyme销售倍数','总部年费用USD十亿','总部费用倍数','集团正常税率','传奇确认合作收入USD十亿','传奇毛利率','传奇研发USD十亿','传奇销售管理USD十亿','传奇正常税率','传奇经营倍数','传奇超额现金USD十亿','母公司持传奇比例','控股价值因子','集团金融余值USD十亿','未来外部优先义务USD十亿','母公司摊薄股数十亿'];
export function initializeSOTP(m){
 if(!m.cashBridgeAnchor||!m.legendAnchor||!m.scenarios?.yearEnd?.inputs?.lsgRevenue)return false;
 m.sotpBridge=true;
 for(const s of Object.values(m.scenarios)){
  s.sotpPipeline=s.components.map(p=>structuredClone(p.legendPipeline));
  for(let g=0;g<s.sotpPipeline[0].groups.length;g++){
   const dates=[...new Set(s.sotpPipeline.flatMap(p=>p.groups[g].annualCashflows.map(f=>f.cashDate)))].sort();
   for(const p of s.sotpPipeline){const group=p.groups[g];group.annualCashflows=dates.map(date=>group.annualCashflows.find(f=>f.cashDate===date)??{cashDate:date,yearsACT36525:(Date.parse(date)-Date.parse(s.target))/86400000/365.25,grossDrugSalesUSDbn:0,included:date>s.target,forecastZeroBeforeLaunch:true});}
  }
 }
 return true;
}
export function calculateSOTP(m,h,c){
 const s=m.scenarios[h],v=s.inputs,p=s.sotpPipeline[c];let gross=0;
 for(const g of p.groups){let pv=0;for(const f of g.annualCashflows){f.riskAdjustedNetCashUSDbn=f.grossDrugSalesUSDbn*g.royaltyRate*g.success*g.netCashMargin;f.presentValueUSDbn=f.included?f.riskAdjustedNetCashUSDbn/(1+p.discountRate)**f.yearsACT36525:0;pv+=f.presentValueUSDbn;}g.PV_USDbn=pv;gross+=pv;}
 p.grossPV_USDbn=gross;p.netPV_USDbn=gross-p.futureDirectDevelopmentReserveUSDbn;
 const lsg=v.lsgRevenue[c]*v.lsgEBITmargin[c]*(1-v.tax[c])*v.lsgMultiple[c];
 const probio=v.probioRevenue[c]*v.probioSalesMultiple[c],best=v.bestRevenue[c]*v.bestSalesMultiple[c];
 const headquarters=v.corporateCost[c]*(1-v.tax[c])*v.corporateMultiple[c];
 const legendNOPAT=(v.legendRevenue[c]*v.legendGM[c]-v.legendRD[c]-v.legendSGA[c])*(1-v.legendTax[c]);
 const legendOperating=Math.max(0,legendNOPAT)*v.legendMultiple[c];
 const legendEquity=Math.max(0,legendOperating+p.netPV_USDbn+v.legendExcessCash[c]);
 const stake=legendEquity*v.legendShare[c]*v.holdingFactor[c];
 const openingPreferred=m.cashBridgeAnchor.CpreferredExternal+m.cashBridgeAnchor.otherPreferredExternal;
 const residual=v.groupResidualCash[c]-(v.preferredExternal[c]-openingPreferred);
 const equity=Math.max(0,lsg+probio+best-headquarters+stake+residual);
 const fx=s.fxCases?.[c]??m.fxValue??m.fx.HKDperUSD;
 return {price:equity/v.shares[c]*fx,lsg,probio,best,headquarters,legendNOPAT,legendOperating,legendEquity,stake,residual,equity,pipelinePV:p.netPV_USDbn};
}
