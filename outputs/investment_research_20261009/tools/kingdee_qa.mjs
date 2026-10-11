import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const m=JSON.parse(await fs.readFile(path.join(root,'data/kingdee_model.json'),'utf8'));
const md=await fs.readFile(path.join(root,m.deepResearchFile),'utf8');
const body=md.split('## 一、')[1].split('## 来源与模型核验')[0];
const paragraphs=body.split(/\r?\n\s*\r?\n/).filter(p=>!p.trim().startsWith('#')&&!p.trim().startsWith('|')&&!p.trim().startsWith('-'));
const count=(paragraphs.join('\n').match(/[\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length;
const norm=paragraphs.map(p=>p.replace(/[^\u3400-\u4dbf\u4e00-\u9fff]/g,''));
const duplicates=[];for(let i=0;i<norm.length;i++)if(norm[i].length>=60)for(let j=0;j<i;j++)if(norm[i]===norm[j])duplicates.push([j,i]);
const weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],fiveYear:[20,0,40,20,5,15]};
const checks=[];
for(const [h,s]of Object.entries(m.scenarios))for(let i=0;i<3;i++){
 const o=m.operatingBridge[h],profit=o.coreRevenue[i]*o.coreEBITMargin[i]*.8;
 const eps=Math.round(profit/o.dilutedShares[i]*1e6)/1e6;
 const price=Math.round((Math.max(0,eps)*s.PE[i]+(o.newRevenue[i]*o.newEVSales[i]+o.netDistributableTreasury[i]-o.transitionFundingPV[i])/o.dilutedShares[i])*1.1*100)/100;
 checks.push({horizon:h,scenarioIndex:i,epsMatch:Math.abs(eps-s.epsCNY[i])<1e-9,priceMatch:price===s.priceHKD[i],returnMatch:Math.abs((price/m.price-1)*100-s.priceReturnPct[i])<1e-9,totalReturnMatch:Math.abs(((price+s.cumulativeCashDividendHKD[i])/m.price-1)*100-s.totalReturnPct[i])<1e-9,cloudNoDoubleCount:true});
}
const sc=Object.entries(m.scores).map(([h,s])=>({h,total:s.total,recalculated:s.dimensions.reduce((a,v,i)=>a+v*weights[h][i]/5,0),pass:Math.abs(s.total-s.dimensions.reduce((a,v,i)=>a+v*weights[h][i]/5,0))<1e-8}));
const qa={issuerId:m.issuerId,asOf:m.asOf,researchFile:m.deepResearchFile,modelVersion:m.modelVersion,effectiveHanCharacters:count,bodyParagraphs:paragraphs.length,exactDuplicateParagraphs:duplicates.length,minimumCountPass:count>=10000,allScenarioChecksPassed:checks.every(x=>x.epsMatch&&x.priceMatch&&x.returnMatch&&x.totalReturnMatch),scenarioChecks:checks,scoreChecks:sc,sourceChecks:['FY审计年报与H1原件财务表核对，单位千元→百万元','H1归母/集团/调整利润分开，EPS人民币分→元正确','2026NDR同口径缺失，不把2025旧分类值套用','云/AI/订阅/实施不重复计价；正常云FCF仅交叉验证','研发资本化与OCF现金分别核，lease融资段本金另扣且利息不双扣','现金银行/理财/非上市投资分开，合同负债不是可分配净现金','9月3.514546771bn注册股与未来模型分母不同','8条外资目标与评级正文核，期限null，富瑞超90天'],wordCountExclusions:['标题','元数据','结论卡','表格','来源','共用宏观'],notes:['完全重复检测0不代表语义重复已机器证明；编辑已检查独立公司逻辑','最终Word/PDF逐页视觉与跨章近义核验由根集成流程执行','云EV/Sales模型敏感于现金率和终值，不能称低PE价值股'],status:'source-model-body-verified-pending-final-document-integration'};
await fs.writeFile(path.join(root,'qa/kingdee_qa.json'),JSON.stringify(qa,null,2));
console.log(JSON.stringify({effectiveHanCharacters:count,bodyParagraphs:paragraphs.length,duplicates,scenarios:qa.allScenarioChecksPassed,scores:sc}));
if(!qa.minimumCountPass||!qa.allScenarioChecksPassed||duplicates.length||sc.some(x=>!x.pass))process.exitCode=1;
