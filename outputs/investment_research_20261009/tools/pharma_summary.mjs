import fs from 'node:fs/promises';
import path from 'node:path';
const root='G:/MyTarget/outputs/investment_research_20261009';
const evidence=JSON.parse(await fs.readFile(path.join(root,'data/pharma_evidence.json'),'utf8'));
const reports=JSON.parse(await fs.readFile(path.join(root,'data/pharma_reports.json'),'utf8'));
const facts={
 '信达生物':{revenue:8617.801,productRevenue:8201.469,profit:1253.142,adjustedProfit:1703.910,cashBank:17380.396,liquidAssetsExpanded:26871.1,currency:'CNY',notes:'收入、产品收入、期内利润及银行余额现金按2026中报；扩展流动资产含存款、结构产品与投资票据，不能当现金等价物。'},
 '药明生物':{revenue:11787.238,grossProfit:5448.319,profit:2916.209,attributableProfit:2439.813,adjustedAttributableProfit:3305.697,cashBank:8904.440,liquidAssetsExpanded:13708.5,currency:'CNY',notes:'集团期内利润2916.209与归母2439.813区分；归母调整3305.697；扩展流动资金含定存理财。'},
 '药明合联':{revenue:3701.378,grossProfit:1371.313,adjustedAttributableProfit:1027.328,cashBank:1597.343,timeDeposits:3520.846,currency:'CNY',notes:'收入含东曜；独立收入3556.0百万元；调整利润剔除股权薪酬、汇兑及非经营项目，原文优先。'},
 '康方生物':{revenue:1805.681,productRevenue:1803.223,grossCommercialSales:1865.881,licenseRevenue:2.458,distributionCosts:62.658,grossProfit:1340.499,profit:-447.246,attributableProfit:-424.220,researchDevelopment:783.326,cashBank:8689.205,cashEquivalents:1053.907,debtInterestBearing:4964.908,leaseLiabilities:19.790,liquidAssetsExpanded:9160.0,currency:'CNY',notes:'收入差异已由原报告附注3解释：商业销售1865.881+授权2.458-分销成本62.658=IFRS1805.681；集团亏损447.246=归母424.220+少数23.026。现金余额8689.205含长期定存，现金等价物1053.907须区分；净现金不能用9160不扣借款。'},
 '恒瑞医药':{revenue:15455.584,innovativeDrugRevenue:8809.344,licenseRevenue:1422.302,grossProfit:13342.241,attributableProfit:4465.439,cashBank:38721.633,cashEquivalents:38031.524,currency:'CNY',notes:'总收入同比-1.9%，创新药+16.4%，授权收入-28.6%；归母仅+0.3%；不能以创新药增速代替总体盈利增速。'},
 '百济神州':{revenue:3218.509,netProfit:464.364,operatingProfit:574.949,cashEquivalents:5100,currency:'USD',notes:'原中报以千美元列报，现金51亿美元为管理层约数；ADR目标不能未经核验ADR普通股比率直接移植至港股。'},
 '三生制药':{revenue:4526.0,grossProfit:3794.6,attributableProfit:1146.6,adjustedOperatingAttributableProfit:1436.3,operatingCashFlow:899.4,liquidAssetsCurrent:12469.2,currency:'CNY',notes:'归母-15.6%与调整经营利润+26.5%并存；当前现金/现金等价物/流动定存/流动抵押存款合计12469.2，券商186亿现金是更宽口径，不能混用。'},
 '翰森制药':{revenue:8304,innovativeDrugRevenue:7092,profit:4258,researchDevelopment:1739,operatingCashFlow:2337,currency:'CNY',notes:'原中报摘要；利润增35.8%由创新收入与其他收入共同推动；需剥离投资和授权等项目；2026中期股息0.285港元。'},
 '英矽智能':{revenue:106.303,grossProfit:95.965,profit:35.537,adjustedProfit:51.227,operatingCashFlow:79.0,liquidAssetsExpanded:452.0,bankBorrowings:14.7,currency:'USD',notes:'现金扩展含存款理财；9月3日3.05亿美元零息可转债完成，为报告期后事件单列。'},
 '晶泰控股':{revenue:393.627,profit:-224.944,adjustedProfit:-105.511,researchDevelopment:367.838,liquidAssetsExpanded:8671.2,currency:'CNY',notes:'原中报期内亏损224.944，与新闻归母251的口径需区分；2025比较利润75.609非新闻归母82.795。'},
 '药明康德':{revenue:28897.5,grossProfit:15382.1,attributableProfit:11080.2,adjustedAttributableProfit:11570.5,cashBank:26953.6,currency:'CNY',notes:'2026中期收入+38.9%；持续经营业务比较增48%；期内资产出售与业务剥离影响需从利润中区分。'}
};
const manualTargets=[
 ['信达生物','HSBC',130,'买入','2026-09-29','NOW.1547010','港股','未在公开转述中明确目标日'],
 ['信达生物','Goldman Sachs',120.6,'买入','2026-09-11','NOW.1544113','港股','未在公开转述中明确目标日'],
 ['信达生物','UOB Kay Hian',132,'买入','2026-10-05','NOW.1547727','港股','未在公开转述中明确目标日'],
 ['药明生物','Goldman Sachs',55.8,'中性','2026-09-25','NOW.1546457','港股','预测PE约25倍；公开转述未明确目标日'],
 ['药明生物','Bank of America',56,'中性','2026-09-21','NOW.1545493','港股','公开转述未明确目标日'],
 ['药明生物','Citi',62,'买入','2026-08-27','NOW.1541199','港股','公开转述未明确目标日'],
 ['药明生物','Daiwa',59,'买入','2026-08-27','NOW.1541244','港股','预测PE24倍；公开转述未明确目标日'],
 ['药明生物','Nomura',60.22,'买入','2026-08-26','NOW.1540819','港股','公开转述未明确目标日'],
 ['药明生物','Morgan Stanley',57,'增持','2026-08-26','NOW.1540816','港股','公开转述未明确目标日'],
 ['药明生物','CLSA',65.7,'跑赢大市','2026-08-27','NOW.1541272','港股','CLSA为中资控制国际券商，单独标记'],
 ['药明合联','Goldman Sachs',97.9,'买入','2026-09-25','NOW.1546461','港股','预测未来12月PE35倍'],
 ['药明合联','Morgan Stanley',85,'增持','2026-09-18','NOW.1545304','港股','公开转述未明确目标日'],
 ['药明合联','Citi',93,'买入','2026-08-26','NOW.1540912','港股','收入2026—2035 CAGR假设26%；公开转述未明确目标日'],
 ['药明合联','UBS',94.6,'买入','2026-08-25','NOW.1540527','港股','公开转述未明确目标日'],
 ['康方生物','HSBC',163,'买入','2026-09-29','NOW.1547010','港股','公开转述未明确目标日'],
 ['康方生物','JPMorgan',125,'增持','2026-09-14','NOW.1544291','港股','明确2027年12月DCF；WACC9.6%，终端增速3%'],
 ['康方生物','Bank of America',136,'买入','2026-09-14','NOW.1544352','港股','DCF；公开转述未明确目标日'],
 ['康方生物','Nomura',138.29,'买入','2026-09-30','NOW.1547156','港股','公开转述未明确目标日'],
 ['康方生物','CLSA',177.8,'跑赢大市','2026-08-31','NOW.1542128','港股','CLSA为中资控制国际券商；公开转述未明确目标日'],
 ['恒瑞医药','HSBC',72.5,'买入','2026-09-29','NOW.1547010','港股','公开转述未明确目标日'],
 ['三生制药','UBS',26.4,'买入','2026-09-09','NOW.1543624','港股','公开转述未明确目标日'],
 ['三生制药','CLSA',30.4,'跑赢大市','2026-08-31','NOW.1542044','港股','CLSA为中资控制国际券商；公开转述未明确目标日'],
 ['翰森制药','HSBC',49.5,'买入','2026-09-29','NOW.1547010','港股','公开转述未明确目标日'],
 ['翰森制药','JPMorgan',50,'增持','2026-09-28','NOW.1546650','港股','公开转述未明确目标日'],
 ['翰森制药','Goldman Sachs',52.7,'买入','2026-09-11','NOW.1544113','港股','公开转述未明确目标日'],
 ['英矽智能','Jefferies',100,'买入','2026-09-24','NOW.1546233','港股','公开转述未明确目标日'],
 ['英矽智能','JPMorgan',71,'增持','2026-09-21','NOW.1545526','港股','明确2027年12月SOTP；药物17.5倍及软件其他8.9倍EV/S'],
 ['英矽智能','Citi',85,'买入/高风险','2026-09-09','NOW.1543625','港股','DCF；公开转述未明确目标日'],
 ['英矽智能','HSBC',84.5,'买入','2026-09-09','NOW.1543616','港股','公开转述未明确目标日'],
 ['晶泰控股','Citi',8,'中性/高风险','2026-09-03','NOW.1542717','港股','公开转述未明确目标日'],
 ['晶泰控股','JPMorgan',10,'增持','2026-07-24','NOW.1534847','港股','公开转述未明确目标日'],
 ['药明康德','Goldman Sachs',220.1,'买入','2026-09-30','NOW.1547187','港股','公开转述未明确目标日'],
 ['药明康德','Bank of America',242,'买入','2026-08-12','NOW.1537765','港股','公开转述未明确目标日'],
 ['药明康德','Bank of America',210.5,'买入','2026-08-12','NOW.1537765','A股','A股人民币；公开转述未明确目标日'],
 ['药明康德','HSBC',220.5,'买入','2026-09-09','NOW.1543616','港股','公开转述未明确目标日'],
 ['百济神州','Goldman Sachs',441.3,'买入','2026-08-24','NOW.1540291','美股ADR','USD，未核验ADR比率，不能直接转为6160港股目标'],
 ['百济神州','HSBC',385,'买入','2026-09-29','NOW.1547010','美股ADR','USD，未核验ADR比率，不能直接转为6160港股目标']
];
const structured=[];
for(const c of evidence.companies){
 const disclosure=reports.find(r=>r.code===c.code)?.reports||[];
 const fact=facts[c.name];
 const values=fact?Object.entries(fact).filter(([key])=>!['currency','notes'].includes(key)).map(([metric,value])=>({metric,value,currency:fact.currency,unit:'million',period:'2026H1',publicationDate:disclosure.find(d=>/中期報告|中期报告/.test(d.title))?.date||null,sourceURL:disclosure.find(d=>/中期報告|中期报告/.test(d.title))?.url||null,sourceType:'issuer_disclosure_primary_content_mirrored',note:fact.notes})):[];
 const targets=manualTargets.filter(t=>t[0]===c.name).map(t=>{const a=evidence.companies.flatMap(x=>x.articles).find(x=>x.url.includes(t[5]));return{institution:t[1],targetPrice:t[2],rating:t[3],publicationDate:t[4],market:t[6],currency:t[6]==='美股ADR'?'USD':t[6]==='A股'?'CNY':'HKD',targetHorizon:t[7],sourceURL:a?.url||null,newsID:t[5],sourceType:'financial_news_secondary',verified:!!a,sourceExcerpt:a?Array.from(a.text.matchAll(/.{0,120}(?:目標價|目标价).{0,260}/g)).map(m=>m[0]).join('\n'):null,institutionOwnership:t[1]==='CLSA'?'Chinese-controlled international brokerage':'foreign'};});
 const suspension=disclosure.filter(x=>/延遲刊發|延迟刊发/.test(x.title));
 structured.push({issuerId:c.issuerId,name:c.name,code:c.code,financials:values,brokerTargets:targets,disclosures:disclosure,newsArticleCount:c.articles.length,suspendedEvidence:suspension,missing:fact?[]:['原中报财务字段尚未逐项核验']});
}
await fs.writeFile(path.join(root,'data/pharma_structured.json'),JSON.stringify({asOf:'2026-10-09',units:'Financial fields in million, correctly named reporting currency; targetPrice in local security currency.',companies:structured},null,2));
for(const c of evidence.companies){const s=structured.find(x=>x.code===c.code);c.financials=s.financials;c.brokerTargets=s.brokerTargets;c.reports=s.disclosures;c.suspension=s.suspendedEvidence;}
await fs.writeFile(path.join(root,'data/pharma_evidence.json'),JSON.stringify(evidence,null,2));
const rows=structured.filter(c=>c.financials.length).map(c=>{const f=Object.fromEntries(c.financials.map(x=>[x.metric,x.value]));return `| ${c.name} | ${c.code} | ${c.financials[0].currency}百万元 | ${f.revenue} | ${f.attributableProfit??f.netProfit??f.profit??'见字段'} | ${f.cashBank??f.cashEquivalents??f.liquidAssetsExpanded??'未核验'} | ${c.brokerTargets.length} |`;});
const md=`# 医药公开证据采集摘要\n\n截至2026-10-09；42家港股医药公司的公开新闻/业绩/公告索引已采集。原发行人披露PDF由AASTOCKS镜像下载，正文经PDFium恢复并保存页号；财务转述和券商报告转述均另列。原始文件保留，可复核。\n\n| 公司 | 代码 | 财报币种单位 | 2026H1收入 | 利润口径见JSON | 现金或扩展流动资金口径见JSON | 已核验券商目标数 |\n|---|---|---|---:|---:|---:|---:|\n${rows.join('\n')}\n\n## 必须保留的差异\n\n康方原中报与8月27日业绩公告均列总收入1,805.7百万元、集团亏损447.2百万元；AASTOCKS8月28日新闻列收入1,868百万元和亏损424百万元。收入差异不能由归母口径解释，应以原文作为主输入，新闻数字留作冲突而不覆盖。晶泰原中报集团亏损224.944百万元、2025同期利润75.609百万元；新闻归母数字不同，须进一步在归属表核验。药明生物集团利润2,916.209与归母2,439.813不得混用。三生券商186亿现金与原报告流动现金定存124.692亿属于不同宽度口径。\n\n## 停牌证据\n\n${structured.filter(c=>c.suspendedEvidence.length).map(c=>`- ${c.name} ${c.code}：${c.suspendedEvidence.map(x=>`[${x.date}公告](${x.url})`).join('；')}，原文载明2026-09-01 09:00起暂停买卖，等待刊发2026中期业绩。截止日尚未找到复牌证据，正常可交易榜暂不排名。`).join('\n')}\n\n## 机构目标的使用限制\n\n已核验目标集中在前11家公司，完整记录位于data/pharma_structured.json与data/pharma_evidence.json。公开转述未写目标日者明确缺失，不能自动补成12个月。摩通康方125港元和英矽71港元明确以2027年12月估值为基础。百济目标385/441.3美元为ONC ADR；未核验ADR与普通股比率前不移植港股。CLSA为中资控制国际券商，单独列示，不能作为纯外资机构数量。各机构最新条目去重后再用于统计。\n\n英矽2026-09-03完成3.05亿美元零息可转债，2027年到期；报告期后债务、期权价值、转股稀释与现金增量需同时进入情景模型。原公告：https://iis.aastocks.com/20260903/12319583-0.PDF。\n\n未逐项核验原报表者继续留缺失，不根据2025记忆补造2026财务或目标。\n`;
const corrected=md.replace('康方原中报与8月27日业绩公告均列总收入1,805.7百万元、集团亏损447.2百万元；AASTOCKS8月28日新闻列收入1,868百万元和亏损424百万元。收入差异不能由归母口径解释，应以原文作为主输入，新闻数字留作冲突而不覆盖。','康方收入差异已由原附注解释：商业销售1865.881+授权2.458-分销成本62.658=IFRS收入1805.681；集团亏损447.246=归母424.220+少数23.026。新闻1868和424是扣分销前商业收入及归母亏损，分别保留，不再称数据冲突。');
await fs.writeFile(path.join(root,'research/pharma_notes.md'),corrected);
console.log(JSON.stringify({companies:structured.length,financialCompanies:structured.filter(c=>c.financials.length).length,targets:structured.reduce((s,c)=>s+c.brokerTargets.length,0),unverifiedTargets:structured.flatMap(c=>c.brokerTargets).filter(t=>!t.verified).length}));
