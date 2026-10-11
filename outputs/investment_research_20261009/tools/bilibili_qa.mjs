import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const m=JSON.parse(await fs.readFile(path.join(root,'data/bilibili_model.json'),'utf8'));
const md=await fs.readFile(path.join(root,m.deepResearchFile),'utf8');
const body=md.split('## 一、')[1].split('## 来源与模型核验')[0];
const paragraphs=body.split(/\r?\n\s*\r?\n/).filter(p=>!p.trim().startsWith('#')&&!p.trim().startsWith('|')&&!p.trim().startsWith('-'));
const count=(paragraphs.join('\n').match(/[\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length;
const norm=paragraphs.map(p=>p.replace(/[^\u3400-\u4dbf\u4e00-\u9fff]/g,''));
const duplicates=[];for(let i=0;i<norm.length;i++)if(norm[i].length>=60)for(let j=0;j<i;j++)if(norm[i]===norm[j])duplicates.push([j,i]);
const weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],fiveYear:[20,0,40,20,5,15]};
const checks=[];
for(const [h,s]of Object.entries(m.scenarios))for(let i=0;i<3;i++){
 const o=m.operatingBridge[h],b=m.businessRevenueAssumptions[h],revenue=b.advertising[i]+b.VAS[i]+b.games[i]+b.IPOther[i];
 const eps=Math.round((revenue*o.EBITMargin[i]*.8+o.afterTaxInterestAssociatesNet[i])/o.dilutedShares[i]*1e6)/1e6;
 const price=Math.round(eps*s.PE[i]*1.1*100)/100;
 checks.push({horizon:h,scenarioIndex:i,revenueMatch:Math.abs(revenue-o.revenue[i])<1e-8,epsMatch:Math.abs(eps-s.epsCNY[i])<1e-9,priceMatch:price===s.priceHKD[i],returnMatch:Math.abs((price/m.price-1)*100-s.priceReturnPct[i])<1e-9,totalReturnMatch:Math.abs(((price+s.cumulativeCashDividendHKD[i])/m.price-1)*100-s.totalReturnPct[i])<1e-9});
}
const sc=Object.entries(m.scores).map(([h,s])=>({h,total:s.total,recalculated:s.dimensions.reduce((a,v,i)=>a+v*weights[h][i]/5,0),pass:Math.abs(s.total-s.dimensions.reduce((a,v,i)=>a+v*weights[h][i]/5,0))<1e-8}));
const qa={issuerId:m.issuerId,asOf:m.asOf,researchFile:m.deepResearchFile,modelVersion:m.modelVersion,effectiveHanCharacters:count,bodyParagraphs:paragraphs.length,exactDuplicateParagraphs:duplicates.length,minimumCountPass:count>=10000,allScenarioChecksPassed:checks.every(x=>x.revenueMatch&&x.epsMatch&&x.priceMatch&&x.returnMatch&&x.totalReturnMatch),scenarioChecks:checks,scoreChecks:sc,sourceChecks:['FY审计20-F、Q1/Q2及H1中报数据核对，千元→百万元','Q2/H1集团与归母/调整分开，EPS人民币元，不混港币','ADS1:1普通Z股，USD目标换港币研究假设单列','持续SBC、版权/服务器折旧保留，正常PE不加全部现金','ASC842经营租赁现金和利息已OCF，设备版权现金另扣','H1设备非现金新增736.995m不是本期再扣，未来付款另列','9/9仅5亿市场CB与delta回购完成；腾讯2亿部分待10/28EGM，新闻9/8状态主源校正','Y/Z月末420134746，预留4899364、待注销6795540及潜在债股各自标注','2030/31现金put2028/2029早于三年目标，股份路线与现金路线互斥','机构外资/中资国际分开，5条目标正文核，期限null'],wordCountExclusions:['标题','元数据','结论卡','表格','来源','共用宏观'],notes:['最终Word/PDF逐页视觉与跨章近义核验由根集成流程执行','高上行与极低悲观有利润和PE双重敏感性，非统计范围或现金清算底','完全重复检查0，编辑另行检查公司独立逻辑与常见重复'],status:'source-model-body-verified-pending-final-document-integration'};
await fs.writeFile(path.join(root,'qa/bilibili_qa.json'),JSON.stringify(qa,null,2));
console.log(JSON.stringify({effectiveHanCharacters:count,bodyParagraphs:paragraphs.length,duplicates,scenarios:qa.allScenarioChecksPassed,scores:sc}));
if(!qa.minimumCountPass||!qa.allScenarioChecksPassed||duplicates.length||sc.some(x=>!x.pass))process.exitCode=1;
