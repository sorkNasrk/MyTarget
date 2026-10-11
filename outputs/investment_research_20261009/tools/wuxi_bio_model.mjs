import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const evidence=JSON.parse(await fs.readFile(root+'/data/pharma_structured.json','utf8')).companies.find(c=>c.name==='药明生物');
const market=JSON.parse(await fs.readFile(root+'/data/market_snapshot.json','utf8')).securities.find(c=>c.code==='02269.HK');
const price=market.price;
const weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],longTerm:[20,0,40,20,5,15]};
const scenarioInput={
 yearEnd:{date:'2026-12-31',earningsYear:2027,eps:[1.85,2.30,2.65],pe:[18,22,25],reason:['订单/客户预算受压，估值风险折价扩大','已公开增长路径基本兑现，按2027盈利22倍消化','商业化和订单上修，经营效率改善并获得25倍估值']},
 halfYear:{date:'2027-04-09',earningsYear:2027,eps:[1.85,2.30,2.65],pe:[18,24,28],reason:['全年利润/新订单逊预期，估值回归18倍','全年经营表现支持2027EPS2.30，合理24倍','新订单、毛利率超预期并获28倍估值']},
 oneYear:{date:'2027-10-09',earningsYear:2028,eps:[2.20,2.75,3.40],pe:[18,24,28],reason:['扩产及汇兑压力，EPS低于主情景','后期项目及商业化转化推动2028EPS2.75','全球产能有效爬坡、CMO需求和毛利超预期']},
 threeYear:{date:'2029-10-09',earningsYear:2029,eps:[2.40,3.50,5.00],pe:[17,22,27],reason:['订单取消/低效资本投入，利润增长偏低','后期项目池转化及规模效率支持EPS3.50','商业化显著放量、平台份额提高，EPS5.00']},
 longTerm:{date:'2031-10-09',earningsYear:2031,eps:[2.60,4.60,7.30],pe:[15,20,25],reason:['全球竞争/政策风险压低回报及终端倍数','客户黏性、全球产能及持续现金回报兑现','复杂生物药平台成功、份额和商业化规模显著扩大']}
};
const labels=['bear','base','bull'],probabilities=[0.25,0.50,0.25],fx=1.10;
const horizons={};
for(const [name,input] of Object.entries(scenarioInput)){
 const years=name==='yearEnd'?83/365:name==='halfYear'?0.5:name==='oneYear'?1:name==='threeYear'?3:5;
 const scenarios=labels.map((label,i)=>{const targetPrice=input.eps[i]*input.pe[i]*fx;const dividendHKD=0;const capitalReturn=targetPrice/price-1,totalReturn=(targetPrice+dividendHKD)/price-1;return{scenario:label,probability:probabilities[i],epsCNY:input.eps[i],earningsYear:input.earningsYear,pe:input.pe[i],cnyToHkd:fx,targetPriceHKD:targetPrice,dividendHKD,capitalReturnPct:capitalReturn*100,totalReturnPct:totalReturn*100,annualizedTotalReturnPct:years>=3?(Math.pow(1+totalReturn,1/years)-1)*100:null,condition:input.reason[i],assumptionType:'research_judgment_not_consensus'};});
 const expected=scenarios.reduce((s,x)=>s+x.targetPriceHKD*x.probability,0);
 horizons[name]={targetDate:input.date,nonTradingDayRule:'此前最后交易日；本模型保留目标日标签，交易日对齐由总表',years,scenarios,expectedPriceHKD:expected,expectedCapitalReturnPct:(expected/price-1)*100,weightSensitivity:[{weights:[0.4,0.4,0.2],expectedPriceHKD:scenarios.reduce((s,x,i)=>s+x.targetPriceHKD*[0.4,0.4,0.2][i],0)},{weights:[0.2,0.4,0.4],expectedPriceHKD:scenarios.reduce((s,x,i)=>s+x.targetPriceHKD*[0.2,0.4,0.4][i],0)}]};
}
const dimensions=['valuation','technical','business','cycle','catalysts','risk'];
const scoreInputs={halfYear:[3.0,3.2,4.2,4.0,3.5,3.0],oneYear:[3.5,3.2,4.3,4.0,3.7,3.2],threeYear:[3.8,3.2,4.3,4.0,3.8,3.2],longTerm:[3.6,null,4.0,3.8,3.5,3.0]};
const reasons={valuation:'现价已反映部分增长；机构最新目标仅3.6%—22%潜在涨幅，较远盈利增长提供更大空间',technical:'四日均线向上与强超额收益，但周RSI71.5、前高近、单日下跌巨量和近期均量偏离削弱入场优势',business:'CRDMO平台、1,064项目与后期/商业化管线，毛利及现金改善；资本回报和客户稳定须持续验证',cycle:'生物药研发融资和复杂模态需求改善；融资向订单、订单向商业化的转换有时滞',catalysts:'全年业绩及下一年度指引，订单兑现、商业化项目与海外产能爬坡',risk:'海外客户、政策、监管质量、外币资产、公允投资、资本开支及股权激励稀释风险'};
const scoring={};for(const [h,values] of Object.entries(scoreInputs))scoring[h]={score:values.reduce((s,x,i)=>s+(x??0)*weights[h][i]/5,0),dimensionScores:Object.fromEntries(dimensions.map((d,i)=>[d,{value:values[i],weightPct:weights[h][i],reason:reasons[d],evidenceConfidence:d==='technical'?'medium-high':'medium'}])),method:'主观证据评分，不是盈利概率；量价行业基准缺失；价格模型不冒充完整DCF'};
const result={issuerId:'I034',securityId:'S040',name:'药明生物',code:'02269.HK',asOf:'2026-10-09',modelVersion:'wuxi-bio-v1',priceHKD:price,priceEvidence:market.sources,financialEvidence:evidence.financials,brokerTargets:evidence.brokerTargets,modelType:'归母经营EPS × 合理PE × 人民币港币换算；单套假设模型三情景快照',assumptions:{eps:'全部预测EPS为研究假设；不代表管理层指引或投行一致预期，采用归母经营盈利并保留未来稀释影响',fx:'1人民币=1.10港元为估值敏感性假设，非声称基准日实测汇率',dividend:'各期限股息默认0；公司最新中报未派息，未知未来政策不补造分红',cash:'不额外加现金价值，避免含利息盈利与现金重复计价；详细DCF/净债务尚未完成',earningsHorizon:'半年用2027EPS；一年用2028前瞻EPS；三年与五年用目标年度EPS，均显式标记',probability:'25/50/25主观情景权重；非真实市场概率或置信区间',terminalRisk:'三五年PE逐步正常化；悲观不是最大损失边界',updatePolicy:'输入修改须重新运行工具以刷新所有场景，未执行不视为更新'},horizons,scoring,confidence:'medium',limitations:['完整DCF、逐客户取消率与资本回报模型待核验','公司资料财务口径与股权结构已有原中报基础，但预测盈利为独立假设','同行业指数相对强弱缺失，市场超额不能替代行业超额']};
result.price=price;result.currency='HKD';result.method=result.modelType;result.deepResearchFile='research/I034_deep.md';
result.scenarios={};result.scores={};
for(const [h,v] of Object.entries(horizons)){const key=h==='longTerm'?'fiveYear':h;result.scenarios[key]={target:v.targetDate,epsCNY:v.scenarios.map(s=>s.epsCNY),PE:v.scenarios.map(s=>s.pe),cumulativeCashDividendHKD:v.scenarios.map(s=>s.dividendHKD),priceHKD:v.scenarios.map(s=>s.targetPriceHKD),conditions:v.scenarios.map(s=>s.condition),earningsYear:v.scenarios[0].earningsYear,scenarioWeights:probabilities,expectedPriceHKD:v.expectedPriceHKD};}
for(const [h,v] of Object.entries(scoring)){const key=h==='longTerm'?'fiveYear':h;result.scores[key]={dimensions:scoreInputs[h].map(x=>x??0),weights:weights[h],total:v.score,explanations:v.dimensionScores};}
result.sources=[...evidence.financials.map(x=>({url:x.sourceURL,date:x.publicationDate,type:x.sourceType})),...evidence.brokerTargets.map(x=>({url:x.sourceURL,date:x.date,type:'broker_news_transcription'}))].filter((x,i,a)=>x.url&&a.findIndex(y=>y.url===x.url)===i);
await fs.writeFile(root+'/data/wuxi_bio_model.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(scoring).map(([k,v])=>[k,v.score])),yearEndExpected:horizons.yearEnd.expectedPriceHKD,yearEndReturn:horizons.yearEnd.expectedCapitalReturnPct}));
