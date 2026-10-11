import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const model=JSON.parse(await fs.readFile(root+'/data/remegen_model.json','utf8'));
const md=await fs.readFile(root+'/research/I051_deep.md','utf8');
const failures=[];const checks=[];
const check=(label,pass)=>{checks.push({label,pass});if(!pass)failures.push(label)};
const near=(a,b)=>Math.abs(a-b)<1e-8;
for(const[k,s]of Object.entries(model.scenarios)){
  s.components.forEach((c,i)=>{
    check(k+'/'+c.scenario+' parentequity',near(c.equityValueCNYbn,Math.max(0,c.assets.netAssetsBeforeCashCNYbn+c.netCashCNYbn+c.vorResidual.parentWarrantValueCNYbn)));
    check(k+'/'+c.scenario+' pershare',near(c.intrinsicPriceHKD,c.equityValueCNYbn/c.dilutedSharesBn*model.fx.HKDperCNY));
    check(k+'/'+c.scenario+' recognition',near(c.targetPriceHKD,model.price+c.marketRecognitionFactor*(c.intrinsicPriceHKD-model.price)));
    check(k+'/'+c.scenario+' recipient ownership',near(c.vorResidual.economicFraction,.016/c.vorResidual.recipientDilutedSharesBn));
    check(k+'/'+c.scenario+' target table rounding',md.includes(c.targetPriceHKD.toFixed(3)));
    check(k+'/'+c.scenario+' zero dividend',c.dividendHKD===0);
    check(k+'/'+c.scenario+' asset annual sum',near(c.assets.netAssetsBeforeCashCNYbn,c.assets.groups.reduce((a,g)=>a+g.PV_CNYbn,0)+c.assets.milestones.reduce((a,g)=>a+g.PV_CNYbn,0)-c.assets.central.reduce((a,g)=>a+g.PV_CNYbn,0)));
  });
  check(k+' expected',near(s.expectedPriceHKD,s.priceHKD.reduce((a,p,i)=>a+p*[.25,.5,.25][i],0)));
}
for(const[k,s]of Object.entries(model.scores))check(k+' score',near(s.total,s.dimensions.reduce((a,v,i)=>a+v*s.weights[i]/5,0)));
const f=model.financialVerified;
check('H1 revenue components',near(f.revenue,f.productRevenue+f.licenseRevenue+f.serviceRevenue));
check('H1 FCF including BD',near(f.FCF,f.OCF-f.PPECash-f.intangibleCash));
check('legal A/H shares',f.SeptTotalIssuedShares===f.SeptHissuedShares+f.SeptAissuedShares);
check('ex treasury shares',f.SeptIssuedExTreasuryShares===f.SeptTotalIssuedShares-f.SeptAtreasuryShares);
check('excesscash excludes Vor warrant',near(model.cashBridgeAnchor.initialExcessCNYbn,1.528895+.020+2.0513*.95-.173557-.60));
check('RC48 license geographic interpretation',md.includes('并包括亚洲中的日本和新加坡；亚洲其他地区由荣昌保留'));
const result={issuerId:'I051',checkedAt:new Date().toISOString(),modelVersion:model.modelVersion,checks,passed:failures.length===0,failures,manualReview:['核验8月24日原公告RC48许可为全球除亚洲但包含日本与新加坡','中国114例gMG事后及开放延长期与全球UPSTREAM MG未读出区分','IgAN蛋白尿附条件批准不当长期肾结局确证','Vor收款后权益扣母royalty及相同milestones，不另加账面权证或伙伴现金','香港IFRS与A股PRCGAAP独立，不拼接利润桥'],remainingLimitations:model.limitations};
await fs.writeFile(root+'/data/I051_independent_qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:result.passed,checks:checks.length,failures}));
if(failures.length)process.exitCode=1;
