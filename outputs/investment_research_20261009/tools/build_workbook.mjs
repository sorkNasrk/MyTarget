import fs from 'node:fs/promises';
import { applyCoreLayoutFormat } from './core_layout_format.mjs';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
import {sotpFields,sotpFieldLabels} from './genscript_sotp.mjs';
import {buildSegmentWorkbook} from './segment_workbook.mjs';
import {buildSimcereWorkbook,simcereSheets} from './simcere_workbook.mjs';
import {buildFosunWorkbook} from './fosun_bridge.mjs';
import {buildLuyeWorkbook,luyeSheets} from './luye_workbook.mjs';
import {buildTigermedWorkbook} from './tigermed_bridge.mjs';
import {buildNormalProfitWorkbook} from './normal_profit_workbook.mjs';
import {normalConfigs} from './normal_profit_native.mjs';
import {buildHutchmedWorkbook,hutchmedSheets} from './hutchmed_workbook.mjs';
import {buildInnocareWorkbook,innocareSheets} from './innocare_workbook.mjs';
import {buildHuahongWorkbook,huahongSheets} from './huahong_workbook.mjs';
import {buildEverestWorkbook,everestSheets} from './everest_workbook.mjs';
import {buildXDWorkbook,xdSheets} from './xd_workbook.mjs';
import {buildKingsoftWorkbook,kingsoftSheets} from './kingsoft_workbook.mjs';
import {buildAscentageWorkbook,ascentageSheets} from './ascentage_workbook.mjs';
import {buildYuewenWorkbook,yuewenSheets} from './yuewen_workbook.mjs';
import {buildHightideWorkbook,hightideSheets} from './hightide_workbook.mjs';
import {buildTongchengWorkbook,tongchengSheets} from './tongcheng_workbook.mjs';
import {buildDualityWorkbook,dualitySheets,dualityGlobalFields} from './duality_workbook.mjs';
import {buildLiautoWorkbook,liautoSheets} from './liauto_workbook.mjs';
import {buildZaiWorkbook,zaiSheets,zaiGlobalFields} from './zai_workbook.mjs';
import {buildXpengWorkbook,xpengSheets} from './xpeng_workbook.mjs';
import {buildHaierSmartWorkbook,haierSmartSheets,haierSmartGlobals} from './haier_smart_workbook.mjs';
import {buildNioWorkbook,nioSheets} from './nio_workbook.mjs';
import {buildBydeWorkbook,bydeSheets} from './byde_workbook.mjs';
import {bydeGlobals} from './byde_native.mjs';
import {buildLepuWorkbook,lepuSheets,lepuGlobalFields} from './lepu_workbook.mjs';
import {buildMinimaxWorkbook,minimaxSheets} from './minimax_workbook.mjs';
import {buildCgnWorkbook,cgnSheets} from './cgn_workbook.mjs';
import {cgnGlobals} from './cgn_native.mjs';
import {buildJunshiWorkbook,junshiSheets,junshiGlobalFields} from './junshi_workbook.mjs';
import {buildZhipuWorkbook,zhipuSheets} from './zhipu_workbook.mjs';
import {buildEastbuyWorkbook,eastbuySheets} from './eastbuy_workbook.mjs';
import {buildUbtechWorkbook,ubtechSheets} from './ubtech_workbook.mjs';
import {buildSensetimeWorkbook,sensetimeSheets} from './sensetime_workbook.mjs';
import {sensetimeGlobals} from './sensetime_native.mjs';
import {buildCansinoWorkbook,cansinoSheets,cansinoGlobalFields} from './cansino_workbook.mjs';
import {buildHorizonWorkbook,horizonSheets} from './horizon_workbook.mjs';
import {buildGrandPharmaWorkbook,grandPharmaSheets} from './grand_pharma_workbook.mjs';
import {grandPharmaGlobals} from './grand_pharma_native.mjs';
import {buildZhonganWorkbook,zhonganSheets} from './zhongan_workbook.mjs';
import {buildInsilicoWorkbook,insilicoSheets,insilicoGlobalFields} from './insilico_workbook.mjs';
import {buildXtalpiWorkbook,xtalpiSheets,xtalpiGlobalFields} from './xtalpi_workbook.mjs';
import {eastbuyGlobals} from './eastbuy_native.mjs';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const scorePresentation=JSON.parse(await fs.readFile(path.join(root,'data/score_presentation.json'),'utf8'));
if(scorePresentation.fingerprint!==b.fingerprint)throw Error('Score presentation metadata requires refresh for current research version');
const wb=Workbook.create();
const names=['总览','四期限排名','年底情景','汇率敏感性','活动估值','经营桥','产品经营桥','地域经营桥','业务分拆桥','零售物流桥','零售物流假设','AI经营桥','AI经营假设','内容经营桥','内容经营假设','SOTP估值桥','SOTP假设','SOTP管线参数','SOTP管线现金流','风险净现值','管线假设','管线现金流','许可受让方假设','许可受让方现金流','许可受让方权益','假设','经营假设','产品经营假设','地域经营假设','业务分拆假设','药物假设','情景快照','评分','数据 >>','行情与技术','发行人','财务原值','机构目标','验收','说明'];
const sh=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
names.push('条件估值参考');sh['条件估值参考']=wb.worksheets.add('条件估值参考');
for(const n of ['转债资金假设','年度分部假设','年度经营资金桥']){names.push(n);sh[n]=wb.worksheets.add(n);}
for(const n of simcereSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
for(const n of ['复星经营假设','复星经营桥']){names.push(n);sh[n]=wb.worksheets.add(n);}
for(const n of luyeSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
for(const n of ['泰格经营假设','泰格经营桥']){names.push(n);sh[n]=wb.worksheets.add(n);}
for(const [iid,cfg]of Object.entries(normalConfigs))if(b.models.some(m=>m.issuerId===iid&&m.normalProfitBridge))for(const n of [cfg.prefix+'经营假设',cfg.prefix+'经营桥']){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.hutchmedBridge))for(const n of hutchmedSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.innocareBridge))for(const n of innocareSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.huahongBridge))for(const n of huahongSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.everestBridge))for(const n of everestSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.xdBridge))for(const n of xdSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.kingsoftBridge))for(const n of kingsoftSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.ascentageBridge))for(const n of ascentageSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.yuewenBridge))for(const n of yuewenSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.hightideBridge))for(const n of hightideSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.tongchengBridge))for(const n of tongchengSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.dualityBridge))for(const n of dualitySheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.liautoBridge))for(const n of liautoSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.zaiBridge))for(const n of zaiSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.xpengBridge))for(const n of xpengSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.haierSmartBridge))for(const n of haierSmartSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.nioBridge))for(const n of nioSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.bydeBridge))for(const n of bydeSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.lepuBridge))for(const n of lepuSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.minimaxBridge))for(const n of minimaxSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.cgnBridge))for(const n of cgnSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.junshiBridge))for(const n of junshiSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.zhipuBridge))for(const n of zhipuSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.eastbuyBridge))for(const n of eastbuySheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.ubtechBridge))for(const n of ubtechSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.sensetimeBridge))for(const n of sensetimeSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.cansinoBridge))for(const n of cansinoSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.horizonBridge))for(const n of horizonSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.grandPharmaBridge))for(const n of grandPharmaSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.zhonganBridge))for(const n of zhonganSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.insilicoBridge))for(const n of insilicoSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
if(b.models.some(m=>m.xtalpiBridge))for(const n of xtalpiSheets){names.push(n);sh[n]=wb.worksheets.add(n);}
const colors={navy:'#24364B',blue:'#225BA1',green:'#247257',amber:'#FFF0BC',red:'#A63232'};
const col=n=>{let x=n+1,s='';while(x){x--;s=String.fromCharCode(65+x%26)+s;x=Math.floor(x/26);}return s;};
function setup(name,title,headers,rows,start=6){
 const s=sh[name],width=headers.length,last=start+Math.max(1,rows.length);
 s.showGridLines=false;s.getRange(`A1:${col(width-1)}${last}`).format.font.name='Microsoft YaHei';s.getRange(`A1:${col(width-1)}${last}`).format.font.size=10;
 s.getRange('A2').values=[[title]];s.getRange('A2').format.font.size=15;s.getRange('A2').format.font.bold=true;
 s.getRange('A3').values=[['活动情景']];if(name!=='假设')s.getRange('B3').formulas=[["='假设'!B3"]];
 s.getRange(`A${start}:${col(width-1)}${start}`).values=[headers];
 s.getRange(`A${start}:${col(width-1)}${start}`).format.fill=colors.navy;s.getRange(`A${start}:${col(width-1)}${start}`).format.font.color='#FFFFFF';s.getRange(`A${start}:${col(width-1)}${start}`).format.font.bold=true;
 s.getRange(`A${start}:${col(width-1)}${last}`).format.rowHeight=23;s.getRange(`A${start}:${col(width-1)}${last}`).format.verticalAlignment='center';s.getRange(`A${start}:${col(width-1)}${last}`).format.wrapText=false;
 s.getRange(`A${start}:${col(width-1)}${start}`).format.rowHeight=52;s.getRange(`A${start}:${col(width-1)}${start}`).format.wrapText=true;
 s.getRange(`A1:${col(width-1)}${last}`).format.columnWidth=16;
 if(rows.length)s.getRange(`A${start+1}:${col(width-1)}${last}`).values=rows;
 if(rows.length>15)s.freezePanes.freezeRows(start);
 if(width>12)s.freezePanes.freezeColumns(3);
 return s;
}
const horizonKeys=['yearEnd','halfYear','oneYear','threeYear','fiveYear'];
const modelRows=[];const assumptions=[];const scoreRows=[];const snapshots=[];
for(const m of b.models){for(const h of horizonKeys){const sc=m.scenarios[h];if(!sc)continue;
 const ar=7+assumptions.length,br=7+modelRows.length;
 const base={m,h,sc,ar,br};modelRows.push(base);
 const fromRev=Array.isArray(sc.coreRevenueCNYbn)&&Array.isArray(sc.coreNetMargin)&&Array.isArray(sc.dilutedSharesBn);
 assumptions.push([m.code,b.labels[h],'活动输入',fromRev?'收入利润率':'EPS',null,null,null,null,null,null,null,m.modelVersion,sc.target]);
 for(let c=0;c<3;c++)assumptions.push([m.code,b.labels[h],['悲观','基准','乐观'][c],fromRev?'收入利润率':'EPS',sc.cases[c].eps,sc.cases[c].PE,sc.fxCases?.[c]??m.fxValue,sc.cases[c].dividend,sc.coreRevenueCNYbn?.[c]??null,sc.coreNetMargin?.[c]??null,sc.dilutedSharesBn?.[c]??null,m.modelVersion,sc.target]);
 for(let c=0;c<3;c++)snapshots.push({m,h,sc,c,ar,br,sr:7+snapshots.length});
 if(h!=='yearEnd')scoreRows.push({m,h,rr:7+scoreRows.length,br});
}}
const a=setup('假设','唯一活动情景与经营假设',['代码','期限','输入层','EPS方法','EPS 盈利币种','PE倍','本币/盈利币种','累计分红本币','核心收入盈利币种十亿','核心净利率','摊薄股数十亿','模型版本','名义目标日'],assumptions);
a.getRange('B3').values=[[2]];a.getRange('C3').values=[['1悲观 / 2基准 / 3乐观；币种见O列，汇率均为研究假设']];a.getRange('B3').format.fill=colors.amber;a.getRange('B3').format.font.color=colors.blue;
a.getRange('B3').dataValidation={rule:{type:'list',values:['1','2','3']}};
for(const {ar} of modelRows){for(let i=4;i<=10;i++)a.getRange(`${col(i)}${ar}`).formulas=[[`=CHOOSE($B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];a.getRange(`A${ar}:M${ar}`).format.fill='#E7EDF3';a.getRange(`E${ar+1}:K${ar+3}`).format.font.color=colors.blue;}
const sharedEconomicFields={E:'eps',I:'coreRevenueCNYbn',J:'coreNetMargin',K:'dilutedSharesBn'};
function economicMaster(x){return modelRows.find(y=>y.m.issuerId===x.m.issuerId&&y.h===x.h&&y.m.earningsCurrency===x.m.earningsCurrency);}
for(const x of modelRows){const master=economicMaster(x);if(master===x)continue;for(let c=0;c<3;c++)for(const k of Object.keys(sharedEconomicFields)){const value=a.getRange(k+(x.ar+c+1)).values[0][0],common=a.getRange(k+(master.ar+c+1)).values[0][0];if(value!==common)throw Error('A/H economics diverged '+x.m.code+' '+k+' '+x.h);a.getRange(k+(x.ar+c+1)).formulas=[[`=${k}${master.ar+c+1}`]];}}
a.getRange('A:A').format.columnWidth=14;a.getRange('C:D').format.columnWidth=18;a.getRange('L:M').format.columnWidth=34;a.getRange(`E7:I${6+assumptions.length}`).setNumberFormat('0.00');a.getRange(`J7:J${6+assumptions.length}`).setNumberFormat('0.00%');a.getRange(`K7:K${6+assumptions.length}`).setNumberFormat('0.000');
const build=setup('活动估值','单套估值计算 · 情景切换后重新计算',['代码','名称','期限','现价本币','EPS方法','核心收入十亿','净利率','摊薄股数十亿','EPS 盈利币种','PE倍','本币/盈利币种','目标价本币','累计分红','股价回报','含分红回报','年化总回报','年数','输入行'],modelRows.map(({m,h,sc,ar})=>[m.code,m.name,b.labels[h],m.price,Array.isArray(sc.coreRevenueCNYbn)?'收入利润率':'EPS',null,null,null,null,null,null,null,null,null,null,null,b.years[h],ar]));
for(const {br,ar} of modelRows){
 const f={F:`='假设'!I${ar}`,G:`='假设'!J${ar}`,H:`='假设'!K${ar}`,I:`=IF(E${br}="收入利润率",F${br}*G${br}/H${br},'假设'!E${ar})`,J:`='假设'!F${ar}`,K:`='假设'!G${ar}`,L:`=I${br}*J${br}*K${br}`,M:`='假设'!H${ar}`,N:`=L${br}/D${br}-1`,O:`=(L${br}+M${br})/D${br}-1`,P:`=IF(Q${br}>=3,(1+O${br})^(1/Q${br})-1,"")`};
 for(const [c,formula]of Object.entries(f))build.getRange(c+br).formulas=[[formula]];
}
build.getRange('B:B').format.columnWidth=22;build.getRange(`F7:M${6+modelRows.length}`).setNumberFormat('0.00');build.getRange(`G7:G${6+modelRows.length}`).setNumberFormat('0.00%');build.getRange(`N7:P${6+modelRows.length}`).setNumberFormat('+0.00%;-0.00%;—');
a.getRange('N6').values=[['超额净现金CNY十亿']];build.getRange('S6').values=[['超额净现金CNY十亿']];
for(const x of modelRows.filter(x=>x.sc.excessNetCashCNYbn)){
 for(let c=0;c<3;c++)a.getRange('N'+(x.ar+c+1)).values=[[x.sc.excessNetCashCNYbn[c]]];
 a.getRange('N'+x.ar).formulas=[[`=CHOOSE($B$3,N${x.ar+1},N${x.ar+2},N${x.ar+3})`]];
 build.getRange('S'+x.br).formulas=[[`='假设'!N${x.ar}`]];
 build.getRange('L'+x.br).formulas=[[`=(I${x.br}*J${x.br}+S${x.br}/H${x.br})*K${x.br}`]];
}
a.getRange('R6:S6').values=[['超额净现金USD十亿','A股现金溢价因子']];
for(const x of modelRows.filter(x=>x.sc.excessNetCashUSDbn)){
 const shared=x.m.productOperatingBridge?modelRows.find(y=>y.m.issuerId===x.m.issuerId&&y.h===x.h&&y.m.productOperatingBridge):x;
 for(let c=0;c<3;c++){a.getRange('R'+(x.ar+c+1)+':S'+(x.ar+c+1)).values=[[x.sc.excessNetCashUSDbn[c],x.sc.cashPremiumApplies?x.sc.AsharePremiumAssumption[c]:1]];if(shared!==x)a.getRange('R'+(x.ar+c+1)).formulas=[[`=R${shared.ar+c+1}`]];}
 for(const k of ['R','S'])a.getRange(k+x.ar).formulas=[[`=CHOOSE($B$3,${k}${x.ar+1},${k}${x.ar+2},${k}${x.ar+3})`]];
 build.getRange('H'+x.br).formulas=[[`='假设'!K${x.ar}`]];
 build.getRange('L'+x.br).formulas=[[`=(I${x.br}*J${x.br}+'假设'!R${x.ar}*'假设'!S${x.ar}/H${x.br})*K${x.br}`]];
}
a.getRange('P6').values=[['战略投资折扣CNY十亿']];
a.getRange('Q6').values=[['开发总部储备CNY十亿']];
for(const x of modelRows.filter(x=>x.sc.futureResearchReserveCNYbn)){
 for(let c=0;c<3;c++)a.getRange('Q'+(x.ar+c+1)).values=[[x.sc.futureResearchReserveCNYbn[c]]];
 a.getRange('Q'+x.ar).formulas=[[`=CHOOSE($B$3,Q${x.ar+1},Q${x.ar+2},Q${x.ar+3})`]];
}
for(const x of modelRows.filter(x=>x.sc.strategyInvestmentValueCNYbn)){
 for(let c=0;c<3;c++)a.getRange('P'+(x.ar+c+1)).values=[[x.sc.strategyInvestmentValueCNYbn[c]]];
 a.getRange('P'+x.ar).formulas=[[`=CHOOSE($B$3,P${x.ar+1},P${x.ar+2},P${x.ar+3})`]];
 build.getRange('L'+x.br).formulas=[[`=(I${x.br}*J${x.br}+(S${x.br}+'假设'!P${x.ar})/H${x.br})*K${x.br}`]];
}
// Additional business schedules use the same authoritative case selector.
const bridges=modelRows.filter(x=>{const op=x.m.operatingBridge?.[x.h];return op&&!x.m.normalProfitBridge&&!x.m.huahongBridge&&!x.m.xdBridge&&!op.ownerProfitShare&&!op.domesticUnits&&!op.adRevenue;});
const bridgeAssumptions=[],bridgeMetadata=[];
for(const x of bridges){const {m,h}=x;const op=m.operatingBridge[h],ar=7+bridgeAssumptions.length,rr=7+bridgeMetadata.length;
 bridgeAssumptions.push([m.code,b.labels[h],'活动输入',null,null,null,null,null,null,null,null,null,null]);
 for(let c=0;c<3;c++)bridgeAssumptions.push([m.code,b.labels[h],['悲观','基准','乐观'][c],op.commerceEBITA?.[c]??null,op.cloudComputeEBITA?.[c]??null,op.labsEBITA?.[c]??null,op.otherCorporateEliminationEBITA?.[c]??null,x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??m.operatingBridge.effectiveTaxRate,op.afterTaxInterestAssociatesNet[c],op.dilutedShares[c],op.revenue?.[c]??null,(op.adjustedEBITMargin??op.EBITMargin)?.[c]??null,x.sc.bridgeOverrides?.[c]?.oneTimePenaltyReserveCNYbillion??m.operatingBridge.oneTimePenaltyReserveCNYbillion??0]);
 bridgeMetadata.push({...x,ar,rr});
}
const bridgeA=setup('经营假设','分部盈利与股本输入 · CNY十亿',['代码','期限','输入层','电商EBITA','云EBITA','Labs EBITA','其他EBITA','研究税率','税后利息联营净贡献','摊薄股数十亿','收入CNY十亿','经营利润率','单次罚款储备'],bridgeAssumptions);
for(const x of bridgeMetadata)for(let i=3;i<=12;i++)bridgeA.getRange(col(i)+x.ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${x.ar+1},${col(i)}${x.ar+2},${col(i)}${x.ar+3})`]];
const bridge=setup('经营桥','经营盈利桥 税后利润及摊薄EPS 币种逐行列明',['代码','期限','电商EBITA','云EBITA','Labs EBITA','其他EBITA','合计经营盈利','税率','税后经营盈利','税后其他贡献','税后归母盈利','摊薄股数十亿','EPS盈利币种','原EPS快照','股本及资本支出限制'],bridgeMetadata.map(x=>[x.m.code,b.labels[x.h],null,null,null,null,null,null,null,null,null,null,null,x.sc.cases[1].eps,x.m.operatingBridge.normalization??'EBITA已含折旧，剔SBC；非FCF。净现金不额外加值']));
for(const x of bridgeMetadata){const r=x.rr,ar=x.ar;const f={C:`='经营假设'!D${ar}`,D:`='经营假设'!E${ar}`,E:`='经营假设'!F${ar}`,F:`='经营假设'!G${ar}`,G:`=SUM(C${r}:F${r})`,H:`='经营假设'!H${ar}`,I:`=G${r}*(1-H${r})`,J:`='经营假设'!I${ar}`,K:`=I${r}+J${r}`,L:`='经营假设'!J${ar}`,M:`=ROUND(K${r}/L${r},${x.m.operatingBridge.epsRoundingDecimals??2})`};for(const[c,ff]of Object.entries(f))bridge.getRange(c+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['经营盈利桥']];build.getRange('I'+x.br).formulas=[[`='经营桥'!M${r}`]];bridge.getRange('P'+r).values=[[x.m.earningsCurrency]];for(let i=0;i<4;i++)bridgeA.getRange('N'+(ar+i)).values=[[x.m.earningsCurrency]];}
bridge.getRange('P6').values=[['盈利币种']];bridgeA.getRange('N6').values=[['收入和盈利币种']];bridgeA.getRange('K6').values=[['收入盈利币种十亿']];
for(const x of bridgeMetadata.filter(x=>x.m.operatingBridge[x.h].revenue)){
 const r=x.rr,ar=x.ar;bridge.getRange('G'+r).formulas=[[`='经营假设'!K${ar}*'经营假设'!L${ar}`]];
 bridge.getRange('O'+r).values=[['收入×含折旧经营利润率；单次罚款资本储备，不逐年扣利润']];
 build.getRange('L'+x.br).formulas=[[`=ROUND(I${x.br}*J${x.br}*K${x.br}-'经营假设'!M${ar}/'经营假设'!J${ar}*K${x.br},2)`]];
}
for(const x of bridgeMetadata.filter(x=>x.m.operatingBridge.columnLabels)){
 bridgeA.getRange('C'+x.ar).values=[['活动输入·手机/汽车两分部']];
 bridge.getRange('M'+x.rr).formulas=[[`=ROUND(K${x.rr}/L${x.rr},${x.m.operatingBridge.epsRoundingDecimals??2})`]];
 bridge.getRange('O'+x.rr).values=[['C手机AIoT正常EBIT；D汽车AI正常EBIT；已含研发和股权成本；其他贡献不含非经常公允价值收益']];
}
for(const x of bridgeMetadata.filter(x=>!x.m.operatingBridge[x.h].revenue))build.getRange('L'+x.br).formulas=[[`=ROUND(I${x.br}*J${x.br}*K${x.br},2)`]];
bridge.getRange('O:O').format.columnWidth=85;bridgeA.getRange('I:I').format.columnWidth=32;
const drugModels=modelRows.filter(x=>x.m.globalRoyaltyModel);
const drugInputs=[],drugMeta=[];
for(const x of drugModels){const {m,h,sc}=x,g=m.globalRoyaltyModel,ar=7+drugInputs.length;
 drugInputs.push([m.code,b.labels[h],'活动输入',null,null,null,null,null,null,null,null,null,null,null,null,null]);
 for(let c=0;c<3;c++){const k=sc.components[c],o=sc.drugOverrides?.[c]??{};drugInputs.push([m.code,b.labels[h],['悲观','基准','乐观'][c],k.domesticCoreProfitCNYbn,k.domesticPE,k.netCashCNYbn,k.futureCentralResearchCostReserveCNYbn,k.dilutedSharesBn,k.lungApprovalAndCommercialSuccess,k.nonLungApprovalAndCommercialSuccess,o.royaltyRate??g.royaltyRate[c],o.royaltyTax??g.royaltyTax[c],o.WACC??g.WACC[c],o.CNYperUSD??sc.CNYperUSD,sc.targetValuationYear,o.fx??m.fxValue]);}
 drugMeta.push({...x,ar});
}
const drugA=setup('药物假设','风险调整估值输入 · 商业/成功率为研究假设',['代码','期限','输入层','本土核心利润CNY十亿','本土PE','净现金CNY十亿','未来研发储备CNY十亿','稀释股数十亿','肺癌成功因子','非肺癌成功因子','版税率','税率','折现率','CNY/USD','估值年时点','HKD/CNY'],drugInputs);
drugA.getRange('Q6').values=[['归母经济比例']];
for(const x of drugMeta){for(let c=0;c<3;c++)drugA.getRange('Q'+(x.ar+c+1)).values=[[x.sc.drugOverrides?.[c]?.parentEconomicShare??x.m.globalRoyaltyModel.parentEconomicShare?.[c]??1]];drugA.getRange('Q'+x.ar).formulas=[[`=CHOOSE('假设'!$B$3,Q${x.ar+1},Q${x.ar+2},Q${x.ar+3})`]];}
for(const x of drugMeta)for(let i=3;i<=15;i++)drugA.getRange(col(i)+x.ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${x.ar+1},${col(i)}${x.ar+2},${col(i)}${x.ar+3})`]];
const flowRows=[],flowMeta=[];
for(const x of drugMeta){const g=x.m.globalRoyaltyModel;for(const type of ['lung','nonLung'])for(let i=0;i<g.salesYears.length;i++){const row=7+flowRows.length;flowRows.push([x.m.code,b.labels[x.h],type==='lung'?'肺癌':'其他适应症',g.salesYears[i],null,null,null,null,null,x.sc.targetValuationDate,x.sc.discountExponentsACT36525[i],null,null,null,x.sc.cashFlowsIncluded[i],null,...(x.sc.salesOverrides?.[type]??g.salesUSDbn[type]).map(v=>v[i])]);flowMeta.push({x,type,i,row});}}
const flow=setup('风险净现值','授权产品逐年现金流 · USD十亿 · 简化模型',['代码','期限','适应症组','销售年','活动销售','版税率','税后率','成功因子','税后风险现金','估值年','折现间隔','折现率','现值','现值CNY','目标日后现金','输入行','悲观销售','基准销售','乐观销售'],flowRows);
for(const {x,type,row:r} of flowMeta){const ar=x.ar;const f={E:`=CHOOSE('假设'!$B$3,Q${r},R${r},S${r})`,F:`='药物假设'!K${ar}`,G:`=1-'药物假设'!L${ar}`,H:`='药物假设'!${type==='lung'?'I':'J'}${ar}`,I:`=E${r}*F${r}*G${r}*H${r}`,L:`='药物假设'!M${ar}`,M:`=IF(O${r},I${r}/(1+L${r})^K${r},0)`,N:`=M${r}*'药物假设'!N${ar}`,P:`=${ar}`};for(const[c,ff]of Object.entries(f))flow.getRange(c+r).formulas=[[ff]];}
for(const {x,row:r} of flowMeta)flow.getRange('I'+r).formulas=[[`=E${r}*F${r}*G${r}*H${r}*'药物假设'!Q${x.ar}`]];
const milestoneMeta=[];
flow.getRange('AF6:AO6').values=[['代码','期限','现金日期','折现间隔','活动USD金额','成功因子','税后比例','归母比例','计入','PV CNY十亿']];
let milestoneRow=7;
for(const x of drugMeta.filter(x=>x.sc.milestones))for(let i=0;i<x.sc.milestones[0].length;i++){
 const r=milestoneRow++,ar=x.ar,items=x.sc.milestones.map(v=>v[i]);
 flow.getRange('AF'+r+':AN'+r).values=[[x.m.code,b.labels[x.h],items[0].cashDate,items[0].yearsACT36525,null,null,.8,null,items[0].included]];
 flow.getRange('AP'+r+':AU'+r).values=[[...items.map(v=>v.grossUSDbn),...items.map(v=>v.successWeight)]];
 const f={AJ:`=CHOOSE('假设'!$B$3,AP${r},AQ${r},AR${r})`,AK:`=CHOOSE('假设'!$B$3,AS${r},AT${r},AU${r})`,AM:`='药物假设'!Q${ar}`,AO:`=IF(AN${r},AJ${r}*AK${r}*AL${r}*AM${r}*'药物假设'!N${ar}/(1+'药物假设'!M${ar})^AI${r},0)`};for(const[c,ff]of Object.entries(f))flow.getRange(c+r).formulas=[[ff]];
 milestoneMeta.push({x,row:r,index:i});
}
// Risk-adjusted valuation summary sits beside the cashflow schedule.
flow.getRange('U6:AD6').values=[['代码/期限','本土盈利价值','肺癌PV CNY','其他PV CNY','净现金','研发储备','股东价值CNY','稀释股数','换算率','目标价HKD']];
for(let i=0;i<drugMeta.length;i++){const x=drugMeta[i],r=7+i,ar=x.ar,own=flowMeta.filter(f=>f.x===x);const lung=own.filter(f=>f.type==='lung'),other=own.filter(f=>f.type==='nonLung');flow.getRange('U'+r).values=[[x.m.code+' '+b.labels[x.h]]];const f={V:`='药物假设'!D${ar}*'药物假设'!E${ar}`,W:`=SUM(N${lung[0].row}:N${lung.at(-1).row})`,X:`=SUM(N${other[0].row}:N${other.at(-1).row})`,Y:`='药物假设'!F${ar}`,Z:`='药物假设'!G${ar}`,AA:`=SUM(V${r}:Y${r})-Z${r}`,AB:`='药物假设'!H${ar}`,AC:`='药物假设'!P${ar}`,AD:`=AA${r}/AB${r}*AC${r}`};for(const[c,ff]of Object.entries(f))flow.getRange(c+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['风险调整PV']];build.getRange('L'+x.br).formulas=[[`='风险净现值'!AD${r}`]];build.getRange('I'+x.br).values=[[null]];}
flow.getRange('AE6').values=[['里程碑PV CNY']];
for(let i=0;i<drugMeta.length;i++){const x=drugMeta[i],own=milestoneMeta.filter(v=>v.x===x),r=7+i;if(own.length){flow.getRange('AE'+r).formulas=[[`=SUM(AO${own[0].row}:AO${own.at(-1).row})`]];flow.getRange('AA'+r).formulas=[[`=SUM(V${r}:Y${r})-Z${r}+AE${r}`]];}}
// Owner-profit manufacturing bridge, preserving USD instead of relabeling it CNY.
const ownerMeta=[];let ownerRow=7;
bridgeA.getRange('O6:AB6').values=[['代码','期限','输入层','收入USD十亿','EBIT率','税前金融联营','税率','归母比例','摊薄股数十亿','税后归母','EPS USD','PE','HKD/USD','目标HKD']];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.ownerProfitShare&&x.m.operatingBridge[x.h].revenue)){
 const ar=ownerRow;ownerRow+=4;const op=x.m.operatingBridge[x.h];
 bridgeA.getRange('O'+ar+':Q'+ar).values=[[x.m.code,b.labels[x.h],'活动输入']];
 for(let c=0;c<3;c++)bridgeA.getRange('O'+(ar+c+1)+':W'+(ar+c+1)).values=[[x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],op.revenue[c],op.EBITMargin[c],op.netFinancialAssociates[c],x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate,op.ownerProfitShare[c],op.dilutedShares[c]]];
 for(const column of ['R','S','T','U','V','W'])bridgeA.getRange(column+ar).formulas=[[`=CHOOSE('假设'!$B$3,${column}${ar+1},${column}${ar+2},${column}${ar+3})`]];
 const f={X:`=(R${ar}*S${ar}+T${ar})*(1-U${ar})*V${ar}`,Y:`=ROUND(X${ar}/W${ar},${x.m.operatingBridge.epsRoundingDecimals??4})`,Z:`='假设'!F${x.ar}`,AA:`='假设'!G${x.ar}`,AB:`=ROUND(Y${ar}*Z${ar}*AA${ar},2)`};for(const[c,ff]of Object.entries(f))bridgeA.getRange(c+ar).formulas=[[ff]];
 build.getRange('E'+x.br).values=[['USD归母桥']];build.getRange('I'+x.br).formulas=[[`='经营假设'!Y${ar}`]];build.getRange('L'+x.br).formulas=[[`='经营假设'!AB${ar}`]];ownerMeta.push({...x,ar});
}
const segmentMeta=[];let segmentRow=7;
bridgeA.getRange('AR6:BH6').values=[['代码','期限','输入层','动力收入CNY十亿','动力EBIT率','储能收入CNY十亿','储能EBIT率','材料收入CNY十亿','材料EBIT率','其他收入CNY十亿','其他EBIT率','正常金融联营CNY十亿','税率','归母比例','摊薄股数十亿','归母利润CNY十亿','EPS CNY']];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.powerRevenue)){
 const ar=segmentRow;segmentRow+=4;const op=x.m.operatingBridge[x.h];
 bridgeA.getRange('AR'+ar+':AT'+ar).values=[[x.m.code,b.labels[x.h],'活动输入']];
 for(let c=0;c<3;c++)bridgeA.getRange('AR'+(ar+c+1)+':BF'+(ar+c+1)).values=[[x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],op.powerRevenue[c],op.powerEBITMargin[c],op.storageRevenue[c],op.storageEBITMargin[c],op.materialsRevenue[c],op.materialsEBITMargin[c],op.otherRevenue[c],op.otherEBITMargin[c],op.normalNetFinanceAssociates[c],x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate,op.ownerProfitShare[c],op.dilutedShares[c]]];
 for(const column of ['AU','AV','AW','AX','AY','AZ','BA','BB','BC','BD','BE','BF'])bridgeA.getRange(column+ar).formulas=[[`=CHOOSE('假设'!$B$3,${column}${ar+1},${column}${ar+2},${column}${ar+3})`]];
 const f={BG:`=(AU${ar}*AV${ar}+AW${ar}*AX${ar}+AY${ar}*AZ${ar}+BA${ar}*BB${ar}+BC${ar})*(1-BD${ar})*BE${ar}`,BH:`=ROUND(BG${ar}/BF${ar},${x.m.operatingBridge.epsRoundingDecimals??3})`};for(const[c,ff]of Object.entries(f))bridgeA.getRange(c+ar).formulas=[[ff]];
 build.getRange('E'+x.br).values=[['四分部归母桥']];build.getRange('I'+x.br).formulas=[[`='经营假设'!BH${ar}`]];build.getRange('L'+x.br).formulas=[[`=ROUND(I${x.br}*J${x.br}*K${x.br},2)`]];segmentMeta.push({...x,ar});
}
// Units in million vehicles × CNY profit/vehicle /1000 = CNY billion owner profit.
const vehicleMeta=[];let vehicleRow=7;
bridgeA.getRange('AD6:AP6').values=[['代码','期限','输入层','国内销量百万','海外销量百万','国内归母CNY/车','海外归母CNY/车','其他归母CNY十亿','摊薄股数十亿','归母利润CNY十亿','EPS CNY','PE','目标HKD']];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.domesticUnits)){
 const ar=vehicleRow;vehicleRow+=4;const op=x.m.operatingBridge[x.h];
 bridgeA.getRange('AD'+ar+':AF'+ar).values=[[x.m.code,b.labels[x.h],'活动输入']];
 for(let c=0;c<3;c++)bridgeA.getRange('AD'+(ar+c+1)+':AL'+(ar+c+1)).values=[[x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],op.domesticUnits[c],op.overseasUnits[c],op.domesticProfitPerVehicle[c],op.overseasProfitPerVehicle[c],op.otherOwnerProfit[c],op.dilutedShares[c]]];
 for(const column of ['AG','AH','AI','AJ','AK','AL'])bridgeA.getRange(column+ar).formulas=[[`=CHOOSE('假设'!$B$3,${column}${ar+1},${column}${ar+2},${column}${ar+3})`]];
 const f={AM:`=(AG${ar}*AI${ar}+AH${ar}*AJ${ar})/1000+AK${ar}`,AN:`=ROUND(AM${ar}/AL${ar},${x.m.operatingBridge.epsRoundingDecimals??3})`,AO:`='假设'!F${x.ar}`,AP:`=ROUND(AN${ar}*AO${ar}*'假设'!G${x.ar},2)`};for(const[c,ff]of Object.entries(f))bridgeA.getRange(c+ar).formulas=[[ff]];
 build.getRange('E'+x.br).values=[['销量单车归母桥']];build.getRange('I'+x.br).formulas=[[`='经营假设'!AN${ar}`]];build.getRange('L'+x.br).formulas=[[`='经营假设'!AP${ar}`]];vehicleMeta.push({...x,ar});
}
// Region segment bridge retains economic SBC cost and owner fraction.
const geographyMeta=[],geographyRows=[];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.PRCRevenue)){
 const ar=7+geographyRows.length,op=x.m.operatingBridge[x.h];geographyRows.push([x.m.code,b.labels[x.h],'活动输入',...Array(9).fill(null)]);
 for(let c=0;c<3;c++)geographyRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],op.PRCRevenue[c],op.PRCEBITMargin[c],op.overseasRevenue[c],op.overseasEBITMargin[c],op.corporateCost[c],op.normalOther[c],x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate,op.ownerProfitShare[c],op.dilutedShares[c]]);
 geographyMeta.push({...x,assumptionRow:x.ar,ar,r:7+geographyMeta.length});
}
const geographyA=setup('地域经营假设','地区收入与经营利润率 · CNY十亿',['代码','期限','情景','中国含港澳台收入','中国EBIT率','海外收入','海外EBIT率','企业中心成本','正常其他税前','税率','归母比例','摊薄股数十亿'],geographyRows);
const geographyB=setup('地域经营桥','地区盈利 → 税后归母 → 摊薄EPS',['代码','期限','中国EBIT','海外EBIT','中心成本','正常其他','正常税前','税率','归母比例','归母利润CNY十亿','稀释股数十亿','EPS CNY','PE','HKD/CNY','目标价HKD'],geographyMeta.map(x=>[x.m.code,b.labels[x.h],...Array(13).fill(null)]));
for(const x of geographyMeta){
 for(const k of ['D','E','F','G','H','I','J','K','L'])geographyA.getRange(k+x.ar).formulas=[[`=CHOOSE('假设'!$B$3,${k}${x.ar+1},${k}${x.ar+2},${k}${x.ar+3})`]];
 const r=x.r,ar=x.ar,f={C:`='地域经营假设'!D${ar}*'地域经营假设'!E${ar}`,D:`='地域经营假设'!F${ar}*'地域经营假设'!G${ar}`,E:`='地域经营假设'!H${ar}`,F:`='地域经营假设'!I${ar}`,G:`=C${r}+D${r}-E${r}+F${r}`,H:`='地域经营假设'!J${ar}`,I:`='地域经营假设'!K${ar}`,J:`=G${r}*(1-H${r})*I${r}`,K:`='地域经营假设'!L${ar}`,L:`=ROUND(J${r}/K${r},${x.m.operatingBridge.epsRoundingDecimals??3})`,M:`='假设'!F${x.assumptionRow}`,N:`='假设'!G${x.assumptionRow}`,O:`=ROUND(L${r}*M${r}*N${r},2)`};
 for(const[k,v]of Object.entries(f))geographyB.getRange(k+r).formulas=[[v]];
 build.getRange('E'+x.br).values=[['地域经营桥']];build.getRange('I'+x.br).formulas=[[`='地域经营桥'!L${r}`]];build.getRange('L'+x.br).formulas=[[`='地域经营桥'!O${r}`]];
}
const products=['brukinsa','tislelizumab','sonrotoclax','tacabrutideg','solidTumor','otherRetainedEconomic'];
const productMeta=[],productBridgeRows=[];
for(const x of modelRows.filter(x=>x.m.productOperatingBridge)){
 const shared=productMeta.find(y=>y.m.issuerId===x.m.issuerId&&y.h===x.h),ar=shared?.ar??7+productBridgeRows.length,op=x.m.productOperatingBridge[x.h];
 if(!shared){productBridgeRows.push([x.m.code,b.labels[x.h],'活动输入',...Array(11).fill(null)]);for(let c=0;c<3;c++)productBridgeRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...products.map(p=>op.productRevenueUSDbn[p][c]),op.grossMargin[c],op.researchCostUSDbn[c],op.sellingAdminUSDbn[c],op.taxRate[c],op.dilutedSharesBn[c]]);}
 productMeta.push({...x,assumptionRow:x.ar,ar,r:7+productMeta.length,sharedInput:!!shared});
}
const productA=setup('产品经营假设','共享产品经营收入 · USD十亿 · A/H分别估值',['代码','期限','情景','Brukinsa','替雷利珠','BCL2','BTK CDAC','实瘤','其他保留经济','毛利率','研发USD十亿','销售管理USD十亿','正常税率','普通股十亿'],productBridgeRows);
const productB=setup('产品经营桥','保留经济收益 → 正常经营盈利 → 普通股价值',['代码','期限','收入USD十亿','毛利率','毛利USD十亿','研发','销售管理','正常经营利润','税率','税后经营利润','稀释普通股十亿','EPS USD','超额现金USD十亿','A股现金溢价因子','上市PE','本币/USD','目标价本币'],productMeta.map(x=>[x.m.code,b.labels[x.h],...Array(15).fill(null)]));
for(const x of productMeta){
 const ar=x.ar,r=x.r;for(let i=3;i<14;i++)productA.getRange(col(i)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];
 const f={C:`=SUM('产品经营假设'!D${ar}:I${ar})`,D:`='产品经营假设'!J${ar}`,E:`=C${r}*D${r}`,F:`='产品经营假设'!K${ar}`,G:`='产品经营假设'!L${ar}`,H:`=E${r}-F${r}-G${r}`,I:`='产品经营假设'!M${ar}`,J:`=H${r}*(1-I${r})`,K:`='产品经营假设'!N${ar}`,L:`=J${r}/K${r}`,M:`='假设'!R${x.assumptionRow}`,N:`='假设'!S${x.assumptionRow}`,O:`='假设'!F${x.assumptionRow}`,P:`='假设'!G${x.assumptionRow}`,Q:`=(L${r}*O${r}+M${r}*N${r}/K${r})*P${r}`};
 for(const[k,v]of Object.entries(f))productB.getRange(k+r).formulas=[[v]];
 build.getRange('E'+x.br).values=[['USD产品经营桥']];build.getRange('I'+x.br).formulas=[[`='产品经营桥'!L${r}`]];build.getRange('H'+x.br).formulas=[[`='产品经营桥'!K${r}`]];build.getRange('L'+x.br).formulas=[[`='产品经营桥'!Q${r}`]];
}
const sotpMeta=[],sotpRows=[];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.coreRevenue)){
 const ar=7+sotpRows.length,op=x.m.operatingBridge[x.h];sotpRows.push([x.m.code,b.labels[x.h],'活动输入',...Array(10).fill(null)]);
 for(let c=0;c<3;c++)sotpRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],op.coreRevenue[c],op.coreEBITMargin[c],op.corporateCost[c],x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate,op.ownerProfitShare[c],op.dilutedShares[c],op.newRevenue[c],op.newEVSales[c],op.netDistributableTreasury[c],op.transitionFundingPV[c]]);
 sotpMeta.push({...x,assumptionRow:x.ar,ar,r:7+sotpMeta.length});
}
const sotpA=setup('业务分拆假设','核心盈利与新业务价值 · CNY十亿',['代码','期限','情景','核心收入','核心EBIT率','企业中心成本','税率','归母比例','稀释股数十亿','新业务收入','新业务EV销售倍数','可分配净资金','过渡融资现值'],sotpRows);
const sotpB=setup('业务分拆桥','核心PE + 新业务EV + 净资金 − 过渡融资',['代码','期限','核心EBIT','中心成本','税率','归母比例','核心归母利润','股数十亿','核心EPS CNY','PE','核心经营价值','新业务EV','可分配资金','过渡融资PV','本币/CNY','目标价本币'],sotpMeta.map(x=>[x.m.code,b.labels[x.h],...Array(14).fill(null)]));
for(const x of sotpMeta){
 const ar=x.ar,r=x.r;for(let i=3;i<13;i++)sotpA.getRange(col(i)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];
 const f={C:`='业务分拆假设'!D${ar}*'业务分拆假设'!E${ar}`,D:`='业务分拆假设'!F${ar}`,E:`='业务分拆假设'!G${ar}`,F:`='业务分拆假设'!H${ar}`,G:`=(C${r}-D${r})*(1-E${r})*F${r}`,H:`='业务分拆假设'!I${ar}`,I:`=ROUND(G${r}/H${r},${x.m.operatingBridge.epsRoundingDecimals??3})`,J:`='假设'!F${x.assumptionRow}`,K:`=MAX(0,I${r})*J${r}*H${r}`,L:`='业务分拆假设'!J${ar}*'业务分拆假设'!K${ar}`,M:`='业务分拆假设'!L${ar}`,N:`='业务分拆假设'!M${ar}`,O:`='假设'!G${x.assumptionRow}`,P:`=ROUND((K${r}+L${r}+M${r}-N${r})/H${r}*O${r},2)`};
 for(const[k,v]of Object.entries(f))sotpB.getRange(k+r).formulas=[[v]];
 build.getRange('E'+x.br).values=[['业务分拆桥']];build.getRange('I'+x.br).formulas=[[`='业务分拆桥'!I${r}`]];build.getRange('L'+x.br).formulas=[[`='业务分拆桥'!P${r}`]];
}
flow.getRange('U:U').format.columnWidth=28;flow.getRange('V:AD').format.columnWidth=20;
// Asset-group rNPV uses explicit per-year schedules, separate from mature-product PE.
const pipelineMeta=[],pipelineInputs=[];
for(const x of modelRows.filter(x=>x.sc.pipelineRNpv))for(let g=0;g<x.sc.pipelineRNpv[0].groups.length;g++){
 const ar=7+pipelineInputs.length,groups=x.sc.pipelineRNpv.map(p=>p.groups[g]);
 pipelineInputs.push([x.m.code,b.labels[x.h],groups[0].id,'活动输入',null,null,null,null,null]);
 for(let c=0;c<3;c++){const p=x.sc.pipelineRNpv[c],group=groups[c];pipelineInputs.push([x.m.code,b.labels[x.h],group.id,['悲观','基准','乐观'][c],group.successAssumption,group.netEconomicCashMarginAssumption,group.parentEconomicShareAssumption,p.overrides?.discountRate??p.discountRate,p.overrides?.CNYperUSD??x.sc.cashBridgeAnchor.USDCNYAssumption]);}
 pipelineMeta.push({x,g,ar,groups});
}
const pipelineA=setup('管线假设','分资产组净经济现金流假设 · 非完整逐适应症DCF',['代码','期限','资产组','情景','成功因子','净经济现金率','归母比例','折现率','CNY/USD'],pipelineInputs);
for(const p of pipelineMeta){
 const first=pipelineMeta.find(f=>f.x===p.x);
 if(p.g>0)for(let c=0;c<3;c++)for(const k of ['H','I'])pipelineA.getRange(k+(p.ar+c+1)).formulas=[[`=${k}${first.ar+c+1}`]];
 for(const c of ['E','F','G','H','I'])pipelineA.getRange(c+p.ar).formulas=[[`=CHOOSE('假设'!$B$3,${c}${p.ar+1},${c}${p.ar+2},${c}${p.ar+3})`]];
}
const pipelineFlowRows=[],pipelineFlowMeta=[];
for(const p of pipelineMeta)for(let i=0;i<p.groups[0].annualCashflows.length;i++){
 const f=p.groups[0].annualCashflows[i],r=7+pipelineFlowRows.length;
 pipelineFlowRows.push([p.x.m.code,b.labels[p.x.h],p.groups[0].id,f.cashDate,p.groups[0].currency,f.yearsACT36525,!f.pastAtTarget,...p.groups.map(g=>g.annualCashflows[i].salesBn),null,null,null,null,...p.groups.map(g=>g.annualCashflows[i].directCostCNYbn??0),f.targetYearRemainingFraction??1]);pipelineFlowMeta.push({p,i,r});
}
const pipelineFlow=setup('管线现金流','逐年销售 → 净经济现金 → 风险折现CNY十亿',['代码','期限','资产组','现金日','销售币种','折现间隔','目标日后','悲观销售十亿','基准销售十亿','乐观销售十亿','活动销售','风险归母净现金CNY十亿','折现率','PV CNY十亿'],pipelineFlowRows.map(r=>r.slice(0,14)));
pipelineFlow.getRange('AJ6:AN6').values=[['悲观开发成本CNY十亿','基准开发成本CNY十亿','乐观开发成本CNY十亿','活动开发成本','目标年剩余比例']];
for(let i=0;i<pipelineFlowRows.length;i++)pipelineFlow.getRange('AJ'+(7+i)+':AL'+(7+i)).values=[pipelineFlowRows[i].slice(14,17)];
for(const {p,r} of pipelineFlowMeta){const ar=p.ar;pipelineFlow.getRange('AM'+r).formulas=[[`=CHOOSE('假设'!$B$3,AJ${r},AK${r},AL${r})`]];pipelineFlow.getRange('AN'+r).values=[[pipelineFlowRows[r-7][17]]];const f={K:`=CHOOSE('假设'!$B$3,H${r},I${r},J${r})`,L:`=K${r}*'管线假设'!E${ar}*'管线假设'!F${ar}*'管线假设'!G${ar}*IF(E${r}="USD",'管线假设'!I${ar},1)-AM${r}`,M:`='管线假设'!H${ar}`,N:`=IF(G${r},L${r}*AN${r}/(1+M${r})^F${r},0)`};for(const[c,ff]of Object.entries(f))pipelineFlow.getRange(c+r).formulas=[[ff]];}
const pipelineMilestones=[];let pipelineMilestoneRow=7;
pipelineFlow.getRange('P6:AA6').values=[['代码','期限','现金日','折现间隔','目标日后','悲观金额十亿','基准金额十亿','乐观金额十亿','悲观成功','基准成功','乐观成功','PV CNY十亿']];
pipelineFlow.getRange('AO6:AV6').values=[['悲观税后比例','基准税后比例','乐观税后比例','悲观归属率','基准归属率','乐观归属率','金额币种','合同标识']];
pipelineFlow.getRange('AB6').values=[['活动税后归属现金CNY十亿']];
for(const x of modelRows.filter(x=>x.sc.pipelineRNpv))for(let i=0;i<x.sc.pipelineRNpv[0].milestones.length;i++){
 const r=pipelineMilestoneRow++,f=x.sc.pipelineRNpv.map(p=>p.milestones[i]),ar=pipelineMeta.find(p=>p.x===x).ar;
 pipelineFlow.getRange('P'+r+':Z'+r).values=[[x.m.code,b.labels[x.h],f[0].cashDate,f[0].yearsACT36525,!f[0].alreadyPastAtTarget,...f.map(v=>v.grossAmount),...f.map(v=>v.success)]];
 if(f.some(v=>v.currency!==f[0].currency))throw Error('Milestone currency mismatch '+x.m.code);
 pipelineFlow.getRange('AO'+r+':AV'+r).values=[[...f.map(v=>v.taxFactor),...f.map(v=>v.parentFactor),f[0].currency,f[0].id??'未设独立合同名']];
 pipelineFlow.getRange('AB'+r).formulas=[[`=IF(T${r},CHOOSE('假设'!$B$3,U${r},V${r},W${r})*CHOOSE('假设'!$B$3,X${r},Y${r},Z${r})*CHOOSE('假设'!$B$3,AO${r},AP${r},AQ${r})*CHOOSE('假设'!$B$3,AR${r},AS${r},AT${r})*IF(AU${r}="USD",'管线假设'!I${ar},1),0)`]];
 pipelineFlow.getRange('AA'+r).formulas=[[`=AB${r}/(1+'管线假设'!H${ar})^S${r}`]];pipelineMilestones.push({x,i,r});
}
pipelineFlow.getRange('AC6:AH6').values=[['代码/期限','资产组PV','里程碑PV','合计PV CNY十亿','稀释股数','每股管线本币值']];
const pipelineSummary=[];
for(const x of modelRows.filter(x=>x.sc.pipelineRNpv)){
 const r=7+pipelineSummary.length,own=pipelineFlowMeta.filter(f=>f.p.x===x),milestones=pipelineMilestones.filter(f=>f.x===x);
 pipelineFlow.getRange('AC'+r).values=[[x.m.code+' '+b.labels[x.h]]];pipelineFlow.getRange('AD'+r).formulas=[[`=SUM(N${own[0].r}:N${own.at(-1).r})`]];pipelineFlow.getRange('AE'+r).formulas=[[milestones.length?`=SUM(AA${milestones[0].r}:AA${milestones.at(-1).r})`:'=0']];pipelineFlow.getRange('AF'+r).formulas=[[`=AD${r}+AE${r}`]];pipelineFlow.getRange('AG'+r).formulas=[[`='假设'!K${x.ar}`]];pipelineFlow.getRange('AH'+r).formulas=[[`=AF${r}/AG${r}*'假设'!G${x.ar}`]];
 build.getRange('L'+x.br).formulas=[[`=(I${x.br}*J${x.br}+S${x.br}/H${x.br})*K${x.br}+'管线现金流'!AH${r}`]];pipelineSummary.push({x,r});
 if(x.sc.purePipeline){build.getRange('E'+x.br).values=[['分资产rNPV']];let price=`(S${x.br}-'假设'!Q${x.ar})/H${x.br}*K${x.br}+'管线现金流'!AH${r}`;if(x.sc.equityFloorZero)price=`MAX(0,${price})`;build.getRange('L'+x.br).formulas=[['='+price]];}
}
// Licensed recipient equity is valued after paying the same contractual royalties and milestones.
const recipientFields=['cashMarginBeforeRoyalty','royaltyTaxDeductionFactor','licensorPostTaxAndServicingFactor','futureNetCashUSDbn','recipientDilutedSharesBn','warrantUnderlyingBn','exercisePriceUSD','holdingFactor'];
const recipientRows=[],recipientMeta=[];
for(const x of modelRows.filter(x=>x.sc.recipientResidual)){
 const ar=7+recipientRows.length,r=7+recipientMeta.length;
 recipientRows.push([x.m.code,b.labels[x.h],'活动输入',...recipientFields.map(()=>null)]);
 for(let c=0;c<3;c++)recipientRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...recipientFields.map(k=>x.sc.recipientResidual[c][k])]);
 recipientMeta.push({...x,sourceRow:x,recipientAr:ar,recipientRow:r});
}
const recipientA=setup('许可受让方假设','Vor剩余权益假设 先扣版税和里程碑 不加六月账面权证',['代码','期限','情景','版税前现金率','版税税抵扣率','许可方净现金系数','Vor未来现金USD十亿','Vor稀释股数十亿','权证标的股数十亿','行权USD每股','持股折扣'],recipientRows);
for(const x of recipientMeta)for(let i=0;i<recipientFields.length;i++)recipientA.getRange(col(3+i)+x.recipientAr).formulas=[[`=CHOOSE('假设'!$B$3,${col(3+i)}${x.recipientAr+1},${col(3+i)}${x.recipientAr+2},${col(3+i)}${x.recipientAr+3})`]];
const recipientFlowRows=[],recipientFlowMeta=[];
for(const x of recipientMeta)for(let i=0;i<x.sc.recipientResidual[0].annualCashflows.length;i++){
 const v=x.sc.recipientResidual,f=v[0].annualCashflows[i],r=7+recipientFlowRows.length;
 recipientFlowRows.push([x.m.code,b.labels[x.h],f.cashDate,Math.max(0,f.yearsACT36525),f.targetYearRemainingFraction,...Array(9).fill(null),...v.map(c=>c.annualCashflows[i].recipientResearchCNYbn),null]);
 recipientFlowMeta.push({x,i,r});
}
const recipientFlow=setup('许可受让方现金流','Vor销售扣版税 研发和里程碑 有限现金流 不设终值',['代码','期限','现金日','折现年数','当年剩余比例','关联销售USD十亿','关联成功因子','合同版税率','版税前现金率','版税抵扣率','版税后经营现金CNY','活动研发CNY','里程碑支付CNY','净现值CNY','悲观研发CNY','基准研发CNY','乐观研发CNY','CNY/USD'],recipientFlowRows);
for(const {x,i,r} of recipientFlowMeta){
 const v=x.sc.recipientResidual[0],date=v.annualCashflows[i].cashDate,pg=pipelineMeta.find(p=>p.x===x.sourceRow&&p.groups[0].id===v.sourceGroupId),licensed=pipelineFlowMeta.find(f=>f.p===pg&&f.p.groups[0].annualCashflows[f.i].cashDate===date),ra=x.recipientAr;
 const milestones=pipelineMilestones.filter(f=>f.x===x.sourceRow&&f.x.sc.pipelineRNpv[0].milestones[f.i].cashDate===date&&v.sourceMilestoneIds.includes(f.x.sc.pipelineRNpv[0].milestones[f.i].id));
 const ff={F:`='管线现金流'!K${licensed.r}`,G:`='管线假设'!E${pg.ar}`,H:`='管线假设'!F${pg.ar}/'许可受让方假设'!F${ra}`,I:`='许可受让方假设'!D${ra}`,J:`='许可受让方假设'!E${ra}`,K:`=F${r}*G${r}*(I${r}-H${r}*J${r})*R${r}`,L:`=CHOOSE('假设'!$B$3,O${r},P${r},Q${r})`,M:milestones.length?'='+milestones.map(f=>`'管线现金流'!AB${f.r}`).join('+'):'=0',N:`=((K${r}-L${r})*E${r}-M${r})/(1+'管线假设'!H${pg.ar})^D${r}`,R:`='管线假设'!I${pg.ar}`};
 for(const[k,f]of Object.entries(ff))recipientFlow.getRange(k+r).formulas=[[f]];
}
const recipientB=setup('许可受让方权益','Vor剩余股权到荣昌权证价值 双层稀释与零下限',['代码','期限','未来经营PV CNY十亿','Vor现金USD十亿','CNY/USD','Vor股权CNY十亿','标的股数十亿','Vor稀释股数十亿','经济持股率','行权USD每股','行权现金CNY十亿','持股折扣','母公司权证值CNY十亿'],recipientMeta.map(x=>[x.m.code,b.labels[x.h],...Array(11).fill(null)]));
for(const x of recipientMeta){
 const r=x.recipientRow,ra=x.recipientAr,own=recipientFlowMeta.filter(f=>f.x===x),pa=pipelineMeta.find(p=>p.x===x.sourceRow).ar;
 const f={C:`=SUM('许可受让方现金流'!N${own[0].r}:N${own.at(-1).r})`,D:`='许可受让方假设'!G${ra}`,E:`='管线假设'!I${pa}`,F:`=MAX(0,C${r}+D${r}*E${r})`,G:`='许可受让方假设'!I${ra}`,H:`='许可受让方假设'!H${ra}`,I:`=G${r}/H${r}`,J:`='许可受让方假设'!J${ra}`,K:`=G${r}*J${r}*E${r}`,L:`='许可受让方假设'!K${ra}`,M:`=MAX(0,F${r}*I${r}-K${r})*L${r}`};
 for(const[k,ff]of Object.entries(f))recipientB.getRange(k+r).formulas=[[ff]];
 const summary=pipelineSummary.find(p=>p.x===x.sourceRow);
 build.getRange('L'+x.br).formulas=[[`=MAX(0,(S${x.br}-'假设'!Q${x.ar}+'许可受让方权益'!M${r}+'管线现金流'!AF${summary.r})/H${x.br}*K${x.br})`]];
}
// AI revenue categories are mutually exclusive; the numerator reserve is after tax.
const aiPrefixes=['infra','applications','aiNativeMarketing','legacy','other'],aiFields=[...aiPrefixes.flatMap(p=>[p+'Revenue',p+'ContributionMargin']),'corporateCost','iqiyiOwnerOperatingContribution','normalNetFinanceAssociates','effectiveTaxRate','ownerProfitShare','epsNumeratorReserve','dilutedShares'],aiRows=[],aiMeta=[];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.infraRevenue)){const ar=7+aiRows.length,r=7+aiMeta.length,op=x.m.operatingBridge[x.h];aiRows.push([x.m.code,b.labels[x.h],'活动输入',...aiFields.map(()=>null)]);for(let c=0;c<3;c++)aiRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...aiFields.map(f=>f==='effectiveTaxRate'?x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate:op[f][c])]);aiMeta.push({...x,ar,r,assumptionRow:x.ar});}
const aiA=setup('AI经营假设','互斥五块收入及贡献率 · CNY十亿 · 正常成本与融资权益储备',['代码','期限','情景','Infra收入','Infra贡献率','应用收入','应用贡献率','AI营销收入','AI营销贡献率','传统收入','传统贡献率','其他收入','其他贡献率','总部费用','爱奇艺归属贡献','常态财资联营','税率','归属率','EPS分子储备','普通股十亿'],aiRows);
const aiB=setup('AI经营桥','互斥业务贡献 → 税后归属 → 股权分子储备 → 每股港元估值',['代码','期限','五块贡献','总部费用','爱奇艺贡献','税前利润','税率','归属率','分子储备','EPS分子','股数','EPS CNY','PE倍','HKD/CNY','目标HKD'],aiMeta.map(x=>[x.m.code,b.labels[x.h],...Array(13).fill(null)]));
for(const x of aiMeta){const ar=x.ar,r=x.r;for(let i=3;i<20;i++)aiA.getRange(col(i)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];const f={C:`='AI经营假设'!D${ar}*'AI经营假设'!E${ar}+'AI经营假设'!F${ar}*'AI经营假设'!G${ar}+'AI经营假设'!H${ar}*'AI经营假设'!I${ar}+'AI经营假设'!J${ar}*'AI经营假设'!K${ar}+'AI经营假设'!L${ar}*'AI经营假设'!M${ar}`,D:`='AI经营假设'!N${ar}`,E:`='AI经营假设'!O${ar}`,F:`=C${r}-D${r}+E${r}+'AI经营假设'!P${ar}`,G:`='AI经营假设'!Q${ar}`,H:`='AI经营假设'!R${ar}`,I:`='AI经营假设'!S${ar}`,J:`=F${r}*(1-G${r})*H${r}-I${r}`,K:`='AI经营假设'!T${ar}`,L:`=ROUND(J${r}/K${r},${x.m.operatingBridge.epsRoundingDecimals??3})`,M:`='假设'!F${x.assumptionRow}`,N:`='假设'!G${x.assumptionRow}`,O:`=ROUND(L${r}*M${r}*N${r},2)`};for(const[k,ff]of Object.entries(f))aiB.getRange(k+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['互斥AI经营桥']];build.getRange('I'+x.br).formulas=[[`='AI经营桥'!L${r}`]];build.getRange('L'+x.br).formulas=[[`='AI经营桥'!O${r}`]];}
// Core content profits and Kling's retained economics have distinct ownership boundaries.
const contentFields=['adRevenue','adContributionMargin','liveRevenue','liveContributionMargin','otherExKlingRevenue','otherContributionMargin','corporateCost','klingRevenue','klingContributionMargin','klingFixedRD','klingOwnerShare','normalNetFinanceAssociates','effectiveTaxRate','epsNumeratorReserve','dilutedShares'],contentRows=[],contentMeta=[];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.adRevenue)){
 const ar=7+contentRows.length,r=7+contentMeta.length,op=x.m.operatingBridge[x.h];contentRows.push([x.m.code,b.labels[x.h],'活动输入',...contentFields.map(()=>null)]);
 for(let c=0;c<3;c++)contentRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...contentFields.map(f=>f==='effectiveTaxRate'?x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate:op[f][c])]);contentMeta.push({...x,ar,r,assumptionRow:x.ar});
}
const contentA=setup('内容经营假设','广告直播与电商核心盈利 + 可灵保留经济 · CNY十亿',['代码','期限','情景','广告收入','广告贡献率','直播收入','直播贡献率','Other剔可灵收入','Other贡献率','核心共享成本','可灵收入','可灵贡献率','可灵固定研发','可灵归属比例','常态财资联营','税率','税后分子储备','普通股十亿'],contentRows);
const contentB=setup('内容经营桥','核心盈利与可灵归属 → 税后分子 → EPS → 目标港元价',['代码','期限','核心业务贡献','核心共享成本','核心EBIT','可灵直接贡献','可灵固定研发','可灵EBIT','可灵归属率','可灵归属贡献','常态财资联营','税前归属盈利','税率','税后分子储备','EPS分子','普通股十亿','EPS CNY','PE倍','HKD/CNY','目标HKD'],contentMeta.map(x=>[x.m.code,b.labels[x.h],...Array(18).fill(null)]));
for(const x of contentMeta){const ar=x.ar,r=x.r;for(let i=3;i<18;i++)contentA.getRange(col(i)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];
 const f={C:`='内容经营假设'!D${ar}*'内容经营假设'!E${ar}+'内容经营假设'!F${ar}*'内容经营假设'!G${ar}+'内容经营假设'!H${ar}*'内容经营假设'!I${ar}`,D:`='内容经营假设'!J${ar}`,E:`=C${r}-D${r}`,F:`='内容经营假设'!K${ar}*'内容经营假设'!L${ar}`,G:`='内容经营假设'!M${ar}`,H:`=F${r}-G${r}`,I:`='内容经营假设'!N${ar}`,J:`=H${r}*I${r}`,K:`='内容经营假设'!O${ar}`,L:`=E${r}+J${r}+K${r}`,M:`='内容经营假设'!P${ar}`,N:`='内容经营假设'!Q${ar}`,O:`=L${r}*(1-M${r})-N${r}`,P:`='内容经营假设'!R${ar}`,Q:`=ROUND(O${r}/P${r},${x.m.operatingBridge.epsRoundingDecimals??3})`,R:`='假设'!F${x.assumptionRow}`,S:`='假设'!G${x.assumptionRow}`,T:`=ROUND(Q${r}*R${r}*S${r},2)`};
 for(const[k,ff]of Object.entries(f))contentB.getRange(k+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['内容可灵经营桥']];build.getRange('I'+x.br).formulas=[[`='内容经营桥'!Q${r}`]];build.getRange('L'+x.br).formulas=[[`='内容经营桥'!T${r}`]];
}
// Retail/logistics forecast avoids adding subsidiary market values to consolidated profits.
const retailFields=['retailRevenue','retailEBITMargin','logisticsRevenue','logisticsEBITMargin','newBusinessLoss','corporateCost','normalNetFinanceAssociates','effectiveTaxRate','ownerProfitShare','dilutedShares'],retailRows=[],retailMeta=[];
for(const x of modelRows.filter(x=>x.m.operatingBridge?.[x.h]?.retailRevenue)){
 const ar=7+retailRows.length,r=7+retailMeta.length,op=x.m.operatingBridge[x.h];retailRows.push([x.m.code,b.labels[x.h],'活动输入',...retailFields.map(()=>null)]);
 for(let c=0;c<3;c++)retailRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...retailFields.map(f=>f==='effectiveTaxRate'?x.sc.bridgeOverrides?.[c]?.effectiveTaxRate??x.m.operatingBridge.effectiveTaxRate:op[f][c])]);retailMeta.push({...x,ar,r,assumptionRow:x.ar});
}
const retailA=setup('零售物流假设','正常经营CNY十亿 · 新业务亏损含补贴 · 子公司不另加市值',['代码','期限','情景','零售收入','零售EBIT率','物流收入','物流EBIT率','新业务亏损','总部费用','常态财务联营收益','税率','利润归属率','普通股十亿'],retailRows);
const retailB=setup('零售物流桥','分部经营利润 → 正常归母利润 → EPS → 港股估值',['代码','期限','零售EBIT','物流EBIT','新业务亏损','总部费用','税前利润','税率','归属率','正常归母利润','股数十亿','EPS CNY','PE倍','HKD/CNY','目标HKD'],retailMeta.map(x=>[x.m.code,b.labels[x.h],...Array(13).fill(null)]));
for(const x of retailMeta){const ar=x.ar,r=x.r;for(let i=3;i<13;i++)retailA.getRange(col(i)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${ar+1},${col(i)}${ar+2},${col(i)}${ar+3})`]];const f={C:`='零售物流假设'!D${ar}*'零售物流假设'!E${ar}`,D:`='零售物流假设'!F${ar}*'零售物流假设'!G${ar}`,E:`='零售物流假设'!H${ar}`,F:`='零售物流假设'!I${ar}`,G:`=C${r}+D${r}-E${r}-F${r}+'零售物流假设'!J${ar}`,H:`='零售物流假设'!K${ar}`,I:`='零售物流假设'!L${ar}`,J:`=G${r}*(1-H${r})*I${r}`,K:`='零售物流假设'!M${ar}`,L:`=ROUND(J${r}/K${r},${x.m.operatingBridge.epsRoundingDecimals??3})`,M:`='假设'!F${x.assumptionRow}`,N:`='假设'!G${x.assumptionRow}`,O:`=ROUND(L${r}*M${r}*N${r},2)`};for(const[k,ff]of Object.entries(f))retailB.getRange(k+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['零售物流桥']];build.getRange('I'+x.br).formulas=[[`='零售物流桥'!L${r}`]];build.getRange('L'+x.br).formulas=[[`='零售物流桥'!O${r}`]];}
// GenScript uses native component SOTP, with a separate Legend pipeline schedule.
const nativeSOTPMeta=[],nativeSOTPRows=[],nativePipelineMeta=[],nativePipelineRows=[];
for(const x of modelRows.filter(x=>x.m.sotpBridge)){
 const ar=7+nativeSOTPRows.length,r=7+nativeSOTPMeta.length;
 nativeSOTPRows.push([x.m.code,b.labels[x.h],'活动输入',...sotpFields.map(()=>null)]);
 for(let c=0;c<3;c++)nativeSOTPRows.push([x.m.code,b.labels[x.h],['悲观','基准','乐观'][c],...sotpFields.map(f=>x.sc.inputs[f][c])]);
 nativeSOTPMeta.push({...x,ar,r,assumptionRow:x.ar});
 for(let g=0;g<x.sc.sotpPipeline[0].groups.length;g++){
  const pr=7+nativePipelineRows.length,groups=x.sc.sotpPipeline.map(p=>p.groups[g]);
  nativePipelineRows.push([x.m.code,b.labels[x.h],groups[0].id,'活动输入',...Array(5).fill(null)]);
  for(let c=0;c<3;c++)nativePipelineRows.push([x.m.code,b.labels[x.h],groups[c].id,['悲观','基准','乐观'][c],groups[c].success,groups[c].netCashMargin,groups[c].royaltyRate,x.sc.sotpPipeline[c].discountRate,x.sc.sotpPipeline[c].futureDirectDevelopmentReserveUSDbn]);
  nativePipelineMeta.push({x,g,ar:pr,groups});
 }
}
const nativeA=setup('SOTP假设','各业务USD十亿 · 传奇归属单列 · 外部优先义务仅扣一次',['代码','期限','情景',...sotpFieldLabels],nativeSOTPRows);
for(const x of nativeSOTPMeta)for(let i=3;i<3+sotpFields.length;i++)nativeA.getRange(col(i)+x.ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(i)}${x.ar+1},${col(i)}${x.ar+2},${col(i)}${x.ar+3})`]];
const nativeP=setup('SOTP管线参数','传奇两资产聚合组 · USD现金流 · 全部未来参数为研究假设',['代码','期限','资产组','情景','成功因子','净现金率','授权提成率','折现率','专项研发储备USD十亿'],nativePipelineRows);
for(const p of nativePipelineMeta){const first=nativePipelineMeta.find(f=>f.x===p.x);if(p.g>0)for(let c=0;c<3;c++)for(const k of ['H','I'])nativeP.getRange(k+(p.ar+c+1)).formulas=[[`=${k}${first.ar+c+1}`]];for(const k of ['E','F','G','H','I'])nativeP.getRange(k+p.ar).formulas=[[`=CHOOSE('假设'!$B$3,${k}${p.ar+1},${k}${p.ar+2},${k}${p.ar+3})`]];}
const nativeCashRows=[],nativeCashMeta=[];
for(const p of nativePipelineMeta)for(let i=0;i<p.groups[0].annualCashflows.length;i++){
 const f=p.groups[0].annualCashflows[i],r=7+nativeCashRows.length;
 nativeCashRows.push([p.x.m.code,b.labels[p.x.h],p.groups[0].id,f.cashDate,f.yearsACT36525,f.included,...p.groups.map(g=>g.annualCashflows[i].grossDrugSalesUSDbn),null,null,null]);nativeCashMeta.push({p,i,r});
}
const nativeCF=setup('SOTP管线现金流','销售 → 成功与净现金率 → USD风险现值；目标日已过去现金不重复计值',['代码','期限','资产组','现金日','折现间隔ACT365.25','目标日后','悲观销售USD十亿','基准销售USD十亿','乐观销售USD十亿','活动销售','风险净现金USD十亿','PV USD十亿'],nativeCashRows);
for(const{p,r}of nativeCashMeta){nativeCF.getRange('J'+r).formulas=[[`=CHOOSE('假设'!$B$3,G${r},H${r},I${r})`]];nativeCF.getRange('K'+r).formulas=[[`=J${r}*'SOTP管线参数'!E${p.ar}*'SOTP管线参数'!F${p.ar}*'SOTP管线参数'!G${p.ar}`]];nativeCF.getRange('L'+r).formulas=[[`=IF(F${r},K${r}/(1+'SOTP管线参数'!H${p.ar})^E${r},0)`]];}
const nativeB=setup('SOTP估值桥','全企业价值与持股价值 → 母公司股权 → HKD每股；普通EPS/PE不适用',['代码','期限','LSG企业USD十亿','ProBio企业USD十亿','Bestzyme企业USD十亿','总部费用PV','传奇正常NOPAT','传奇经营值','传奇管线净PV','传奇超额现金','传奇全股权值','传奇归属持股值','集团金融余值','母公司股权USD十亿','母公司股数十亿','HKD/USD假设','目标价HKD'],nativeSOTPMeta.map(x=>[x.m.code,b.labels[x.h],...Array(15).fill(null)]));
for(const x of nativeSOTPMeta){
 const ar=x.ar,r=x.r,inp=f=>`'SOTP假设'!${col(3+sotpFields.indexOf(f))}${ar}`,own=nativeCashMeta.filter(f=>f.p.x===modelRows.find(y=>y.m.code===x.m.code&&y.h===x.h)),pr=nativePipelineMeta.find(p=>p.x.m.code===x.m.code&&p.x.h===x.h).ar;
 const opening=x.m.cashBridgeAnchor.CpreferredExternal+x.m.cashBridgeAnchor.otherPreferredExternal;
 const f={C:`=${inp('lsgRevenue')}*${inp('lsgEBITmargin')}*(1-${inp('tax')})*${inp('lsgMultiple')}`,D:`=${inp('probioRevenue')}*${inp('probioSalesMultiple')}`,E:`=${inp('bestRevenue')}*${inp('bestSalesMultiple')}`,F:`=${inp('corporateCost')}*(1-${inp('tax')})*${inp('corporateMultiple')}`,G:`=(${inp('legendRevenue')}*${inp('legendGM')}-${inp('legendRD')}-${inp('legendSGA')})*(1-${inp('legendTax')})`,H:`=MAX(0,G${r})*${inp('legendMultiple')}`,I:`=SUM('SOTP管线现金流'!L${own[0].r}:L${own.at(-1).r})-'SOTP管线参数'!I${pr}`,J:`=${inp('legendExcessCash')}`,K:`=MAX(0,H${r}+I${r}+J${r})`,L:`=K${r}*${inp('legendShare')}*${inp('holdingFactor')}`,M:`=${inp('groupResidualCash')}-(${inp('preferredExternal')}-${opening})`,N:`=MAX(0,C${r}+D${r}+E${r}-F${r}+L${r}+M${r})`,O:`=${inp('shares')}`,P:`='假设'!G${x.assumptionRow}`,Q:`=N${r}/O${r}*P${r}`};
 for(const[k,ff]of Object.entries(f))nativeB.getRange(k+r).formulas=[[ff]];
 build.getRange('E'+x.br).values=[['分部SOTP']];build.getRange('I'+x.br+':J'+x.br).values=[['不适用','不适用']];build.getRange('L'+x.br).formulas=[[`='SOTP估值桥'!Q${r}`]];
}
const annualSegment=buildSegmentWorkbook({b,wb,sh,setup,col,modelRows,build,a});
const annualSimcere=buildSimcereWorkbook({b,sh,setup,col,modelRows,build});
const fosunNative=buildFosunWorkbook({setup,col,modelRows,build});
const annualLuye=buildLuyeWorkbook({b,setup,col,modelRows,build,a});
const tigerNative=buildTigermedWorkbook({setup,col,modelRows,build});
const normalNative=buildNormalProfitWorkbook({setup,col,modelRows,build});
const hutchmedNative=buildHutchmedWorkbook({b,setup,col,modelRows,build,a});
const innocareNative=buildInnocareWorkbook({b,setup,col,modelRows,build,a});
const huahongNative=buildHuahongWorkbook({b,setup,col,modelRows,build,a});
const everestNative=buildEverestWorkbook({b,setup,col,modelRows,build,a});
const xdNative=buildXDWorkbook({b,setup,col,modelRows,build,a});
const kingsoftNative=buildKingsoftWorkbook({b,setup,col,modelRows,build,a});
const ascentageNative=b.models.some(m=>m.ascentageBridge)?buildAscentageWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const yuewenNative=buildYuewenWorkbook({b,setup,col,modelRows,build,a});
const hightideNative=b.models.some(m=>m.hightideBridge)?buildHightideWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const tongchengNative=buildTongchengWorkbook({b,setup,col,modelRows,build,a});
const liautoNative=buildLiautoWorkbook({b,setup,col,modelRows,build,a});
const dualityNative=b.models.some(m=>m.dualityBridge)?buildDualityWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const zaiNative=b.models.some(m=>m.zaiBridge)?buildZaiWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const xpengNative=b.models.some(m=>m.xpengBridge)?buildXpengWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const haierSmartNative=b.models.some(m=>m.haierSmartBridge)?buildHaierSmartWorkbook({b,setup,col,modelRows,build,a,assumptionColumns:{PE:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
const nioNative=b.models.some(m=>m.nioBridge)?buildNioWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const bydeNative=b.models.some(m=>m.bydeBridge)?buildBydeWorkbook({b,setup,col,modelRows,build,a,assumptionColumns:{PE:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
const lepuNative=b.models.some(m=>m.lepuBridge)?buildLepuWorkbook({b,setup,col,modelRows,build,a,recognitionColumn:'U'}):{manifest:[],signatures:()=>[]};
const minimaxNative=b.models.some(m=>m.minimaxBridge)?buildMinimaxWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const cgnNative=b.models.some(m=>m.cgnBridge)?buildCgnWorkbook({b,setup,col,modelRows,build,assumptionColumns:{PE:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
const junshiNative=b.models.some(m=>m.junshiBridge)?buildJunshiWorkbook({b,setup,col,modelRows,build,a,recognitionColumn:'U'}):{manifest:[],signatures:()=>[]};
const zhipuNative=b.models.some(m=>m.zhipuBridge)?buildZhipuWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const ubtechNative=b.models.some(m=>m.ubtechBridge)?buildUbtechWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const sensetimeNative=b.models.some(m=>m.sensetimeBridge)?buildSensetimeWorkbook({b,setup,col,modelRows,build,assumptionColumns:{PS:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
const cansinoNative=b.models.some(m=>m.cansinoBridge)?buildCansinoWorkbook({b,setup,col,modelRows,build,a,recognitionColumn:'U'}):{manifest:[],signatures:()=>[]};
const horizonNative=b.models.some(m=>m.horizonBridge)?buildHorizonWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const grandPharmaNative=b.models.some(m=>m.grandPharmaBridge)?buildGrandPharmaWorkbook({b,setup,col,modelRows,build,assumptionColumns:{PE:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
const zhonganNative=b.models.some(m=>m.zhonganBridge)?buildZhonganWorkbook({b,setup,col,modelRows,build,a}):{manifest:[],signatures:()=>[]};
const insilicoNative=b.models.some(m=>m.insilicoBridge)?buildInsilicoWorkbook({b,setup,col,modelRows,build,a,recognitionColumn:'U'}):{manifest:[],signatures:()=>[]};
const xtalpiNative=b.models.some(m=>m.xtalpiBridge)?buildXtalpiWorkbook({b,setup,col,modelRows,build,a,recognitionColumn:'U'}):{manifest:[],signatures:()=>[]};
for(const p of xtalpiNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='晶泰资金假设'!${col(2+xtalpiGlobalFields.indexOf('FX'))}${p.gr}`]];
 for(let c=0;c<3;c++){
  const row=x.ar+c+1;a.getRange('D'+row+':F'+row).values=[['有限股东分配','见晶泰专表','不适用PE']];
  a.getRange('G'+row).formulas=[[`='晶泰资金假设'!${col(2+xtalpiGlobalFields.indexOf('FX'))}${p.gr+c+1}`]];
  for(const k of ['I','J','K'])a.getRange(k+row).values=[['见晶泰专表']];
 }
}
for(const p of insilicoNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='英矽资金假设'!${col(2+insilicoGlobalFields.indexOf('FX'))}${p.gr}`]];
 for(let c=0;c<3;c++){
  const row=x.ar+c+1;a.getRange('D'+row+':F'+row).values=[['有限股东分配','见英矽专表','不适用PE']];
  a.getRange('G'+row).formulas=[[`='英矽资金假设'!${col(2+insilicoGlobalFields.indexOf('FX'))}${p.gr+c+1}`]];
  for(const k of ['I','J','K'])a.getRange(k+row).values=[['见英矽专表']];
 }
}
for(const p of grandPharmaNative.meta??[])for(const x of p.horizons)for(let c=0;c<3;c++){
 const row=x.ar+c+1;a.getRange('D'+row+':E'+row).values=[['港币NTM正常集团联营PE','见远大专表']];
 for(const k of ['H','I','J','K'])a.getRange(k+row).values=[['见远大专表']];
 a.getRange('G'+row).formulas=[[`='远大资金假设'!${col(2+grandPharmaGlobals.indexOf('FX'))}${p.gr+c+1}`]];
}
for(const p of cansinoNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='康希诺资金假设'!${col(2+cansinoGlobalFields.indexOf('FX'))}${p.gr}`]];
 for(let c=0;c<3;c++){
  const row=x.ar+c+1;a.getRange('D'+row+':F'+row).values=[['有限股东分配','见康希诺专表','不适用PE']];
  a.getRange('G'+row).formulas=[[`='康希诺资金假设'!${col(2+cansinoGlobalFields.indexOf('FX'))}${p.gr+c+1}`]];
  for(const k of ['I','J','K'])a.getRange(k+row).values=[['见康希诺专表']];
 }
}
for(const p of sensetimeNative.meta??[])for(const x of p.horizons)for(let c=0;c<3;c++){
 const row=x.ar+c+1;a.getRange('D'+row+':F'+row).values=[['商汤NTM正常EV收入','见商汤专表',x.sc.cases[c].PS]];
 for(const k of ['H','I','J','K'])a.getRange(k+row).values=[['见商汤专表']];
 a.getRange('G'+row).formulas=[[`='商汤资产假设'!${col(2+sensetimeGlobals.indexOf('FX'))}${p.gr+c+1}`]];
}
const eastbuyNative=b.models.some(m=>m.eastbuyBridge)?buildEastbuyWorkbook({b,setup,col,modelRows,build,assumptionColumns:{PE:'F',recognition:'U'}}):{manifest:[],signatures:()=>[]};
for(const p of eastbuyNative.meta??[])for(const x of p.horizons)for(let c=0;c<3;c++){
 const row=x.ar+c+1;a.getRange('D'+row+':E'+row).values=[['财年NTM正常归母PE','见甄选专表']];
 for(const k of ['I','J','K'])a.getRange(k+row).values=[['见甄选专表']];
 a.getRange('G'+row).formulas=[[`='甄选资金假设'!${col(2+eastbuyGlobals.indexOf('FX'))}${p.gr+c+1}`]];
 a.getRange('H'+row).values=[['见甄选专表']];
}
for(const p of junshiNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='君实估值桥'!L${x.r}`]];
 for(let c=0;c<3;c++){
  const row=x.ar+c+1;a.getRange('D'+row+':F'+row).values=[['有限股东分配','见君实专表','不适用PE']];
  a.getRange('G'+row).formulas=[[`='君实资金假设'!${col(2+junshiGlobalFields.indexOf('FX'))}${p.gr+c+1}`]];
  for(const k of ['I','J','K'])a.getRange(k+row).values=[['见君实专表']];
 }
}
for(const p of cgnNative.meta??[])for(const x of p.horizons)for(let c=0;c<3;c++){
 const row=x.ar+c+1;a.getRange('D'+row+':E'+row).values=[['广核量价完整融资PE','见广核专表']];
 for(const k of ['I','J','K'])a.getRange(k+row).values=[['见广核专表']];
 a.getRange('G'+row).formulas=[[`='广核资金假设'!${col(2+cgnGlobals.indexOf('FX'))}${p.gr+c+1}`]];
 a.getRange('H'+row).values=[['见广核专表']];
}
for(const p of bydeNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='比电子期限估值桥'!K${x.r}`]];
 for(let c=0;c<3;c++){
  a.getRange('D'+(x.ar+c+1)+':E'+(x.ar+c+1)).values=[['NTM正常归母PE','见比电子专表']];
  a.getRange('G'+(x.ar+c+1)).formulas=[[`='比电子资金假设'!${col(2+bydeGlobals.indexOf('FX'))}${p.gr+c+1}`]];
  a.getRange('I'+(x.ar+c+1)+':K'+(x.ar+c+1)).values=[['见比电子专表','见比电子专表','见比电子专表']];
 }
}
for(const p of lepuNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='乐普估值桥'!L${x.r}`]];
 for(let c=0;c<3;c++){
  a.getRange('D'+(x.ar+c+1)+':F'+(x.ar+c+1)).values=[['有限股东分配','见乐普专表','不适用PE']];
  a.getRange('G'+(x.ar+c+1)).formulas=[[`='乐普资金假设'!${col(2+lepuGlobalFields.indexOf('FX'))}${p.gr+c+1}`]];
  a.getRange('I'+(x.ar+c+1)+':K'+(x.ar+c+1)).values=[['见乐普专表','见乐普专表','见乐普专表']];
 }
}
for(const p of haierSmartNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='海尔期限估值桥'!K${x.r}`]];
 for(let c=0;c<3;c++){
  a.getRange('D'+(x.ar+c+1)+':E'+(x.ar+c+1)).values=[['NTM正常归母PE','见海尔专表']];
  a.getRange('G'+(x.ar+c+1)).formulas=[[`='海尔资金假设'!${col(2+haierSmartGlobals.indexOf('FX'))}${p.gr+c+1}`]];
  a.getRange('I'+(x.ar+c+1)+':K'+(x.ar+c+1)).values=[['见海尔专表','见海尔专表','见海尔专表']];
 }
}
for(const p of zaiNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='再鼎估值桥'!L${x.r}`]];
 for(let c=0;c<3;c++){
  const gr=p.gr+c+1;
  a.getRange('D'+(x.ar+c+1)+':F'+(x.ar+c+1)).values=[['有限股东分配','见再鼎专表','不适用PE']];
  a.getRange('G'+(x.ar+c+1)).formulas=[[`='再鼎资金假设'!${col(2+zaiGlobalFields.indexOf('FX'))}${gr}`]];
  a.getRange('I'+(x.ar+c+1)+':K'+(x.ar+c+1)).values=[['见再鼎专表','见再鼎专表','见再鼎专表']];
 }
}
for(const p of dualityNative.meta??[])for(const x of p.horizons){
 build.getRange('K'+x.br).formulas=[[`='映恩估值桥'!N${x.r}`]];
 for(let c=0;c<3;c++){
  const gr=p.gr+c+1;
  a.getRange('D'+(x.ar+c+1)+':F'+(x.ar+c+1)).values=[['有限股东分配','见映恩专表','不适用PE']];
  a.getRange('G'+(x.ar+c+1)).formulas=[[`='映恩资金假设'!${col(2+dualityGlobalFields.indexOf('FX'))}${gr}`]];
  a.getRange('I'+(x.ar+c+1)+':K'+(x.ar+c+1)).values=[['见映恩专表','见映恩专表','见映恩专表']];
 }
}
a.getRange('U6').values=[['市场确认系数研究假设']];build.getRange('U6').values=[['内在估值目标本币']];
for(const x of modelRows.filter(x=>Number.isInteger(x.m.targetPriceRoundingDecimals))){const old=build.getRange('L'+x.br).formulas[0][0];build.getRange('L'+x.br).formulas=[[`=ROUND(${old.slice(1)},${x.m.targetPriceRoundingDecimals})`]];}
for(const x of modelRows.filter(x=>x.sc.marketRecognitionFactor??x.sc.recognitionFactor)){
 const factors=x.sc.marketRecognitionFactor??x.sc.recognitionFactor;for(let c=0;c<3;c++)a.getRange('U'+(x.ar+c+1)).values=[[factors[c]]];a.getRange('U'+x.ar).formulas=[[`=CHOOSE($B$3,U${x.ar+1},U${x.ar+2},U${x.ar+3})`]];
 const old=build.getRange('L'+x.br).formulas[0][0];build.getRange('U'+x.br).formulas=[[old]];build.getRange('L'+x.br).formulas=[[`=D${x.br}+(U${x.br}-D${x.br})*'假设'!U${x.ar}`]];
}
const snap=setup('情景快照','同一活动模型依次计算的三情景快照',['代码','名称','期限','情景','现价','目标价','累计分红','股价回报','总回报','年化','EPS输入','PE输入','汇率输入','分红输入','收入输入','利润率输入','股数输入','模型版本','快照日','刷新状态'],snapshots.map(({m,h,c})=>[m.code,m.name,b.labels[h],['悲观','基准','乐观'][c],m.price,null,null,null,null,null,null,null,null,null,null,null,null,m.modelVersion,b.createdAt.slice(0,10),null]));
snap.getRange('U6:V6').values=[['经营输入快照差异数','经营输入当前差异数']];
for(let c=0;c<3;c++){
 a.getRange('B3').values=[[c+1]];wb.recalculate();
 const signatureCopies=[];
 for(const s of snapshots.filter(x=>x.c===c)){
  const values=build.getRange(`L${s.br}:P${s.br}`).values[0];
  if(typeof values[0]!=='number'||Math.abs(values[0]-s.sc.cases[c].price)>0.011){if(s.m.productOperatingBridge){const p=productMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);console.log(JSON.stringify({input:productA.getRange('A'+p.ar+':N'+(p.ar+3)).values,bridge:productB.getRange('A'+p.r+':Q'+p.r).values,assumptions:a.getRange('E'+s.ar+':S'+s.ar).values}));}throw new Error('Workbook model mismatch '+s.m.code+' '+s.h+' '+c+': '+values[0]+' expected '+s.sc.cases[c].price);}
  snap.getRange(`F${s.sr}:J${s.sr}`).values=[values];
  snap.getRange(`K${s.sr}:Q${s.sr}`).values=[a.getRange(`E${s.ar}:K${s.ar}`).values[0]];
  const sourceRow=s.ar+c+1;const checks=Array.from({length:7},(_,i)=>`IF(${col(10+i)}${s.sr}='假设'!${col(4+i)}${sourceRow},0,1)`).join(',');
  let signatures=[...annualSegment.signatures(s,c),...annualSimcere.signatures(s,c),...fosunNative.signatures(s,c),...annualLuye.signatures(s,c),...tigerNative.signatures(s,c),...normalNative.signatures(s,c),...hutchmedNative.signatures(s,c),...innocareNative.signatures(s,c),...huahongNative.signatures(s,c),...everestNative.signatures(s,c),...xdNative.signatures(s,c),...kingsoftNative.signatures(s,c),...ascentageNative.signatures(s,c),...yuewenNative.signatures(s,c),...hightideNative.signatures(s,c),...tongchengNative.signatures(s,c),...dualityNative.signatures(s,c),...liautoNative.signatures(s,c),...zaiNative.signatures(s,c),...xpengNative.signatures(s,c),...haierSmartNative.signatures(s,c),...nioNative.signatures(s,c),...bydeNative.signatures(s,c),...lepuNative.signatures(s,c),...minimaxNative.signatures(s,c),...cgnNative.signatures(s,c),...junshiNative.signatures(s,c),...zhipuNative.signatures(s,c),...eastbuyNative.signatures(s,c)];
  signatures.push(...ubtechNative.signatures(s,c));
  signatures.push(...sensetimeNative.signatures(s,c));
  signatures.push(...cansinoNative.signatures(s,c),...horizonNative.signatures(s,c));
  signatures.push(...grandPharmaNative.signatures(s,c));
  signatures.push(...zhonganNative.signatures(s,c),...insilicoNative.signatures(s,c));
  signatures.push(...xtalpiNative.signatures(s,c));
  const op=bridgeMetadata.find(x=>x.m.code===s.m.code&&x.h===s.h);
  if(op)signatures.push(...Array.from({length:10},(_,i)=>`'经营假设'!${col(3+i)}${op.ar+c+1}`));
  const owner=ownerMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(owner)signatures.push(...['R','S','T','U','V','W'].map(k=>`'经营假设'!${k}${owner.ar+c+1}`));
  const vehicle=vehicleMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(vehicle)signatures.push(...['AG','AH','AI','AJ','AK','AL'].map(k=>`'经营假设'!${k}${vehicle.ar+c+1}`));
  const segment=segmentMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(segment)signatures.push(...['AU','AV','AW','AX','AY','AZ','BA','BB','BC','BD','BE','BF'].map(k=>`'经营假设'!${k}${segment.ar+c+1}`));
  const geographic=geographyMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(geographic)signatures.push(...Array.from({length:9},(_,i)=>`'地域经营假设'!${col(3+i)}${geographic.ar+c+1}`));
  const product=productMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(product)signatures.push(...Array.from({length:11},(_,i)=>`'产品经营假设'!${col(3+i)}${product.ar+c+1}`));
  const sotp=sotpMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(sotp)signatures.push(...Array.from({length:10},(_,i)=>`'业务分拆假设'!${col(3+i)}${sotp.ar+c+1}`));
  const retail=retailMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(retail)signatures.push(...retailFields.map((_,i)=>`'零售物流假设'!${col(3+i)}${retail.ar+c+1}`));
  const ai=aiMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(ai)signatures.push(...aiFields.map((_,i)=>`'AI经营假设'!${col(3+i)}${ai.ar+c+1}`));
  const content=contentMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(content)signatures.push(...contentFields.map((_,i)=>`'内容经营假设'!${col(3+i)}${content.ar+c+1}`));
  if(s.sc.marketRecognitionFactor??s.sc.recognitionFactor)signatures.push(`'假设'!U${sourceRow}`);
  const native=nativeSOTPMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(native){signatures.push(...sotpFields.map((_,i)=>`'SOTP假设'!${col(3+i)}${native.ar+c+1}`));for(const p of nativePipelineMeta.filter(p=>p.x.m.code===s.m.code&&p.x.h===s.h))signatures.push(...['E','F','G','H','I'].map(k=>`'SOTP管线参数'!${k}${p.ar+c+1}`));signatures.push(...nativeCashMeta.filter(f=>f.p.x.m.code===s.m.code&&f.p.x.h===s.h).map(f=>`'SOTP管线现金流'!${col(6+c)}${f.r}`));}
  if(s.sc.excessNetCashCNYbn)signatures.push(`'假设'!N${sourceRow}`);
  if(s.sc.excessNetCashUSDbn)signatures.push(...['R','S'].map(k=>`'假设'!${k}${sourceRow}`));
  if(s.sc.strategyInvestmentValueCNYbn)signatures.push(`'假设'!P${sourceRow}`);
  if(s.sc.futureResearchReserveCNYbn)signatures.push(`'假设'!Q${sourceRow}`);
  if(s.sc.pipelineRNpv){for(const p of pipelineMeta.filter(p=>p.x.m.code===s.m.code&&p.x.h===s.h))signatures.push(...['E','F','G','H','I'].map(k=>`'管线假设'!${k}${p.ar+c+1}`));signatures.push(...pipelineFlowMeta.filter(f=>f.p.x.m.code===s.m.code&&f.p.x.h===s.h).flatMap(f=>[`'管线现金流'!${col(7+c)}${f.r}`,`'管线现金流'!${col(35+c)}${f.r}`]));signatures.push(...pipelineMilestones.filter(f=>f.x.m.code===s.m.code&&f.x.h===s.h).flatMap(f=>[20,23,40,43].map(j=>`'管线现金流'!${col(j+c)}${f.r}`)));}
  const recipient=recipientMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);if(recipient){signatures.push(...recipientFields.map((_,i)=>`'许可受让方假设'!${col(3+i)}${recipient.recipientAr+c+1}`));signatures.push(...recipientFlowMeta.filter(f=>f.x===recipient).map(f=>`'许可受让方现金流'!${col(14+c)}${f.r}`));}
  const drug=drugMeta.find(x=>x.m.code===s.m.code&&x.h===s.h);
  if(drug){signatures.push(...Array.from({length:14},(_,i)=>`'药物假设'!${col(3+i)}${drug.ar+c+1}`));signatures.push(...flowMeta.filter(f=>f.x===drug).flatMap(f=>[`'风险净现值'!${col(16+c)}${f.row}`,`'风险净现值'!K${f.row}`]));signatures.push(...milestoneMeta.filter(f=>f.x===drug).flatMap(f=>[`'风险净现值'!${col(41+c)}${f.row}`,`'风险净现值'!${col(44+c)}${f.row}`]));}
  if(signatures.length){
   // Bound both Excel's 8,192-character formulas and its 32,767-character cell text.
   // Compare each exact saved/current segment independently; never join the full signature.
   const chunks=[];let current=[];
   for(const ref of signatures){if(current.length&&current.join('&"|"&').length+ref.length+6>2000){chunks.push(current);current=[];}current.push(ref);}if(current.length)chunks.push(current);
   const comparisons=[];
   for(let j=0;j<chunks.length;j++){
    const cc=col(22+j*2),saved=col(23+j*2);
    snap.getRange(cc+'6').values=[['当前输入分段'+(j+1)]];snap.getRange(saved+'6').values=[['快照输入分段'+(j+1)]];
    snap.getRange(cc+s.sr).formulas=[['='+chunks[j].join('&"|"&')]];
    comparisons.push(`IF(${cc}${s.sr}=${saved}${s.sr},0,1)`);
   }
   for(let j=0;j<chunks.length;j++)signatureCopies.push({current:col(22+j*2)+s.sr,saved:col(23+j*2)+s.sr,label:s.m.code+'/'+s.h+'/'+c});
   snap.getRange('U'+s.sr).values=[[0]];snap.getRange('V'+s.sr).formulas=[['=SUM('+comparisons.join(',')+')']];
  }
  snap.getRange('T'+s.sr).formulas=[[`=IF(AND(SUM(${checks})=0,U${s.sr}=V${s.sr}),"已刷新","待刷新")`]];
 }
 wb.recalculate();
 for(const item of signatureCopies){
  const value=snap.getRange(item.current).values[0][0];
  if(typeof value==='string'&&value.length>32767)throw Error('Excel signature segment exceeds cell text limit '+item.label);
  snap.getRange(item.saved).values=[[value]];
 }
}
a.getRange('B3').values=[[2]];snap.getRange(`H7:J${6+snapshots.length}`).setNumberFormat('+0.00%;-0.00%;—');snap.getRange('B:B').format.columnWidth=20;snap.getRange('R:S').format.columnWidth=25;
snap.getRange(`T7:T${6+snapshots.length}`).conditionalFormats.add('containsText',{text:'待刷新',format:{fill:colors.amber,font:{color:colors.red,bold:true}}});
const score=setup('评分','各期限证据维度评分 · 分数不是获利概率',['代码','公司','期限','估值','技术','经营','行业','催化','风险','总分','权重估值','权重技术','权重经营','权重行业','权重催化','权重风险','估值依据','量价依据','经营依据','行业依据','催化依据','风险依据','正文依据'],scoreRows.map(({m,h})=>{
 const row=scorePresentation.rows.find(r=>r.code===m.code&&r.horizon===h);
 if(!row||row.rows.length!==6||row.rows.some(d=>!d.reason))throw Error('Missing six-dimensional score evidence '+m.code+'/'+h);
 const basis=[...new Set(row.rows.map(d=>d.sourceBasis).filter(Boolean))].join('；');
 return [m.code,m.name,b.labels[h],...m.scores[h].dimensions,null,...b.weights[h],...row.rows.map(d=>d.reason),basis||'该公司独立深研正文及估值模型评分依据'];
}));
for(const {rr} of scoreRows)score.getRange('J'+rr).formulas=[[`=SUMPRODUCT(D${rr}:I${rr},K${rr}:P${rr})/5`]];
score.getRange(`D7:I${6+scoreRows.length}`).format.font.color=colors.blue;score.getRange('Q:W').format.columnWidth=64;score.getRange('B:B').format.columnWidth=20;score.getRange(`D7:J${6+scoreRows.length}`).setNumberFormat('0.0');
score.getRange(`Q7:W${6+scoreRows.length}`).format.wrapText=true;
score.getRange(`A7:W${6+scoreRows.length}`).format.autofitRows();
const ranks=[];const rankRecords=[];
for(const h of ['halfYear','oneYear','threeYear','fiveYear'])for(const r of b.rankings[h]){const sr=scoreRows.find(x=>x.m.code===r.code&&x.h===h).rr;const sn=snapshots.find(x=>x.m.code===r.code&&x.h===h&&x.c===1).sr;const bear=snapshots.find(x=>x.m.code===r.code&&x.h===h&&x.c===0).sr;ranks.push([b.labels[h],r.rank,r.name,r.code,r.issuerId,null,r.tier,r.topTenDistinct?'前十不同公司':'同公司其他代码',null,null,null,null,b.status.summary.remainingDeepResearch?'阶段研究样本':'全部可评估股票；条件公司除外']);rankRecords.push({row:6+ranks.length,sr,sn,bear});}
const rank=setup('四期限排名',b.status.summary.remainingDeepResearch?'阶段研究排名':'四期限完整股票排名',['期限','名次','公司','优先/上市代码','发行人ID','得分','梯队','不同公司标记','基准价','基准目标','基准总回报','悲观跌幅','排名边界'],ranks);
// Any participant's input change invalidates the whole horizon's stored order.
// Per-row flags keep formulas bounded when the full 96-security universe is modeled.
rank.getRange('O6').values=[['本行输入状态']];
const horizonRankRows={};for(const h of ['halfYear','oneYear','threeYear','fiveYear']){const own=rankRecords.filter((x,i)=>ranks[i][0]===b.labels[h]);horizonRankRows[h]=[own[0].row,own.at(-1).row];}
for(const {row,sr,sn,bear}of rankRecords){for(const[c,f]of Object.entries({F:`='评分'!J${sr}`,I:`='情景快照'!E${sn}`,J:`='情景快照'!F${sn}`,K:`='情景快照'!I${sn}`,L:`='情景快照'!H${bear}`}))rank.getRange(c+row).formulas=[[f]];}
rank.getRange('C:C').format.columnWidth=22;rank.getRange('M:M').format.columnWidth=40;rank.getRange(`K7:L${6+ranks.length}`).setNumberFormat('+0.00%;-0.00%;—');
rank.getRange(`I7:J${6+ranks.length}`).setNumberFormat('0.00');
rank.getRange('N6').values=[['排名刷新状态']];rank.getRange('N:O').format.columnWidth=26;
rank.getRange('N6:O6').format.fill=colors.navy;rank.getRange('N6:O6').format.font.color='#FFFFFF';rank.getRange('N6:O6').format.font.bold=true;rank.getRange('N6:O6').format.font.name='Microsoft YaHei';rank.getRange('N6:O6').format.font.size=10;rank.getRange('N6:O6').format.wrapText=true;rank.getRange('N6:O6').format.verticalAlignment='center';rank.getRange('N6:O6').format.rowHeight=52;
for(let i=0;i<rankRecords.length;i++){
 const {row,sn,bear}=rankRecords[i],original=ranks[i],r=b.rankings[['halfYear','oneYear','threeYear','fiveYear'].find(h=>b.labels[h]===original[0])].find(x=>x.code===original[3]);
 const h=['halfYear','oneYear','threeYear','fiveYear'].find(h=>b.labels[h]===original[0]),[first,last]=horizonRankRows[h];
 rank.getRange('O'+row).formulas=[[`=IF(AND(F${row}=${r.score},K${row}=${r.baseTotalReturn},L${row}=${r.bearReturn},'情景快照'!T${sn}="已刷新",'情景快照'!T${bear}="已刷新"),"已刷新","排名待刷新")`]];
 rank.getRange('N'+row).formulas=[[`=IF(COUNTIF($O$${first}:$O$${last},"排名待刷新")=0,"已刷新","排名待刷新")`]];
}
rank.getRange(`N7:N${6+ranks.length}`).conditionalFormats.add('containsText',{text:'待刷新',format:{fill:colors.amber,font:{color:colors.red,bold:true}}});
const yr=setup('年底情景','2026年底全名单 · 尚未建模及条件估值留空',['证券ID','代码','名称','类别','币种','有效基准价','悲观价','悲观回报','基准价情景','基准回报','乐观价','乐观回报','期望价','期望回报','防御权重期望','积极权重期望','快照状态','模型状态'],b.universe.securities.map(s=>{const m=b.models.find(x=>x.code===s.code),q=b.market.securities.find(x=>x.code===s.code),cm=(b.conditionedModels??[]).find(x=>x.code===s.code);return[s.securityId,s.code,s.name,s.type,s.currency,q.tradableOnAsOf===false?null:q.price,null,null,null,null,null,null,null,null,null,null,null,m?'模型初版':cm?'暂不排名；条件参考另表':s.type==='股票'?(q.tradableOnAsOf===false?'停牌暂不排名':'公司模型待完成'):'产品/指数单列'];}));
const conditionalRows=(b.conditionedModels??[]).flatMap(m=>Object.entries(m.conditionalScenarios??{}).map(([h,s])=>[m.securityId,m.issuerId,m.code,m.name,m.currency,m.referencePrice,m.referencePriceDate,m.basePriceValid?'真实报价；无正式推荐':'停牌前历史报价',b.labels[h],s.target,...(s.priceHKD??s.priceCNY??s.priceTargets??[null,null,null]),m.rankingExclusionReason,(s.conditions??[]).join('；'),m.modelVersion,m.modelFile,'源模型条件快照；无判断权重或期望价；须重新核验融资/复牌条件']));
const conditional=setup('条件估值参考','融资 存续 复牌条件参考 · 不进入正式排名或回报',['证券ID','发行人ID','代码','名称','币种','参考报价','报价日期','报价性质','期限','条件目标日','悲观参考','基准参考','乐观参考','排除原因','三种条件','模型版本','源模型','状态与限制'],conditionalRows);
for(let i=0;i<conditionalRows.length;i++)if(conditionalRows[i][1]==='I008')conditional.getRange('R'+(7+i)).values=[['未融资完整计划现金压力参考；未来资金缺口触发的0不是近期公允价、清算价或正式目标；无正式判断权重、期望价或回报']];
conditional.getRange('D:D').format.columnWidth=26;conditional.getRange('H:J').format.columnWidth=28;conditional.getRange('N:O').format.columnWidth=80;conditional.getRange('P:R').format.columnWidth=55;
if(conditionalRows.length){conditional.getRange('F7:F'+(6+conditionalRows.length)).setNumberFormat('0.000');conditional.getRange('K7:M'+(6+conditionalRows.length)).setNumberFormat('0.000');}
yr.getRange('T3:V4').values=[['悲观','基准','乐观'],[.25,.5,.25]];yr.getRange('T6:V7').values=[['防御悲观','防御基准','防御乐观'],[.4,.5,.1]];yr.getRange('T9:V10').values=[['积极悲观','积极基准','积极乐观'],[.1,.5,.4]];yr.getRange('T4:V10').setNumberFormat('0%');yr.getRange('T4:V4').format.font.color=colors.blue;yr.getRange('T7:V7').format.font.color=colors.blue;yr.getRange('T10:V10').format.font.color=colors.blue;
for(const s of b.universe.securities){const m=b.models.find(x=>x.code===s.code);if(!m)continue;const row=7+b.universe.securities.indexOf(s);const ss=[0,1,2].map(c=>snapshots.find(x=>x.m.code===s.code&&x.h==='yearEnd'&&x.c===c).sr);const f={G:`='情景快照'!F${ss[0]}`,H:`='情景快照'!H${ss[0]}`,I:`='情景快照'!F${ss[1]}`,J:`='情景快照'!H${ss[1]}`,K:`='情景快照'!F${ss[2]}`,L:`='情景快照'!H${ss[2]}`,M:`=G${row}*$T$4+I${row}*$U$4+K${row}*$V$4`,N:`=M${row}/F${row}-1`,O:`=G${row}*$T$7+I${row}*$U$7+K${row}*$V$7`,P:`=G${row}*$T$10+I${row}*$U$10+K${row}*$V$10`,Q:`=IF(AND('情景快照'!T${ss[0]}="已刷新",'情景快照'!T${ss[1]}="已刷新",'情景快照'!T${ss[2]}="已刷新"),"已刷新","待刷新")`};for(const[c,formula]of Object.entries(f))yr.getRange(c+row).formulas=[[formula]];}
yr.getRange('C:C').format.columnWidth=30;yr.getRange('R:R').format.columnWidth=26;for(const c of ['H','J','L','N'])yr.getRange(`${c}7:${c}109`).setNumberFormat('+0.00%;-0.00%;—');yr.getRange(`Q7:Q109`).conditionalFormats.add('containsText',{text:'待刷新',format:{fill:colors.amber,font:{color:colors.red,bold:true}}});
for(const c of ['F','G','I','K','M','O','P'])yr.getRange(`${c}7:${c}109`).setNumberFormat('0.00');
const fxRows=[];for(const s of snapshots.filter(x=>x.c===1))fxRows.push([s.m.code,s.m.name,b.labels[s.h],s.m.currency,null,null,null,null,null,null,'仅投资者换汇；目标价固定，不再次改变盈利换算率']);
const fxSensitivity=setup('汇率敏感性','港币相对人民币±5% · 基准价格情景含分红',['代码','公司','期限','证券币种','本币总回报','港币贬值5%人民币回报','汇率不变人民币回报','港币升值5%人民币回报','年化人民币回报-5%','年化人民币回报+5%','计算边界'],fxRows);
fxSensitivity.getRange('J:J').format.columnWidth=28;
let fxRow=7;for(const s of snapshots.filter(x=>x.c===1)){
 const r=fxRow++,factor=s.m.currency==='HKD';const f={E:`='情景快照'!I${s.sr}`,F:`=(1+E${r})*${factor?.95:1}-1`,G:`=E${r}`,H:`=(1+E${r})*${factor?1.05:1}-1`,I:b.years[s.h]>=3?`=(1+F${r})^(1/${b.years[s.h]})-1`:'=""',J:b.years[s.h]>=3?`=(1+H${r})^(1/${b.years[s.h]})-1`:'=""'};for(const[c,formula]of Object.entries(f))fxSensitivity.getRange(c+r).formulas=[[formula]];
}
fxSensitivity.getRange('E7:J'+(6+fxRows.length)).setNumberFormat('+0.00%;-0.00%;—');fxSensitivity.getRange('K:K').format.columnWidth=95;fxSensitivity.getRange('B:B').format.columnWidth=25;
const marketRows=b.market.securities.map(s=>{const t=s.technical??{},r=s.relativeStrength??{};return[s.securityId,s.issuerId,s.code,s.name,s.currency,s.price,s.priceDate,s.lastPrice?.price??null,s.lastPrice?.date??null,s.tradableOnAsOf??null,s.historyCount??0,s.historySource??'',s.dataQuality,t.trend??'',...['20','60','120','250'].map(n=>t.MA?.[n]??null),...['20','60'].map(n=>t.maSlope5Pct?.[n]??null),t.returnPct?.['20']??null,t.returnPct?.['60']??null,s.lastVolumeShares??null,...['5','20','60'].map(n=>t.volumeMean?.[n]??null),t.volumeRatio20??null,t.upDownVolume20?.ratio??null,t.RSI14??null,t.ATR14??null,t.MACD?.DIF??null,t.MACD?.DEA??null,t.ranges?.['20']?.support??null,t.ranges?.['20']?.resistance??null,t.high52w??null,t.low52w??null,t.maxDrawdown52wPct??null,JSON.stringify(r),s.warnings?.join('；')??'',s.sources?.filter(x=>x.url).map(x=>x.url).join('\n')??''];});
const mk=setup('行情与技术','行情锁版 market-v1.3 · 原始单位与修复留档',['证券ID','发行人ID','代码','名称','币种','10/9价格','价格日','最后参考价','参考价日','可交易','日线数','历史来源','可信度','趋势','MA20','MA60','MA120','MA250','MA20斜率%','MA60斜率%','20日回报%','60日回报%','当日股数','5日均股数','20日均股数','60日均股数','量比20','涨跌量比','RSI14','ATR14','MACD DIF','MACD DEA','20日低位','20日高位','52周高','52周低','回撤%','相对强弱JSON','质量限制','来源URL'],marketRows);mk.getRange('D:D').format.columnWidth=31;mk.getRange('L:N').format.columnWidth=30;mk.getRange('AL:AN').format.columnWidth=100;mk.getRange('F7:AK109').setNumberFormat('0.00');mk.getRange('W7:Z109').setNumberFormat('#,##0');
const issuers=setup('发行人','92家公司 · A/H证券共享公司ID',['发行人ID','名称','行业','上市代码','正文状态','有效汉字','估值状态','版本','更新时间'],b.status.companies.map(c=>[c.issuerId,c.name,c.sector,b.universe.securities.filter(s=>s.issuerId===c.issuerId).map(s=>s.code).join(' / '),c.status,c.effectiveHanCharacters,c.valuationStatus,c.modelVersion??'',c.updatedAt??'']));issuers.getRange('B:E').format.columnWidth=30;issuers.getRange('G:I').format.columnWidth=36;
const actual=setup('财务原值','已核验原始财务 · 单位/期间/公开时点逐项标注',['发行人ID','代码','指标','数值','币种','单位','期间','文件公开日期','来源','口径备注','首次公开日期','发布时间状态','截止日可用性'],b.sources.map(s=>[s.issuerId,s.code,s.metric,s.value,s.currency,s.unit,s.period,s.publicationDate,s.sourceURL,s.note??'',s.firstPublicDate??'待核',s.publicationTimeStatus??'精确发布时间未核验',s.cutoffStatus??'待核']));actual.getRange('C:C').format.columnWidth=38;actual.getRange('I:J').format.columnWidth=110;actual.getRange('K:K').format.columnWidth=20;actual.getRange('L:M').format.columnWidth=46;actual.getRange('D7:D'+(6+b.sources.length)).setNumberFormat('#,##0.000');
const broker=setup('机构目标','公开可核验机构目标 · 同机构最新有效记录',['发行人ID','代码','公司','机构','报告日','目标价','币种','目标期限','评级','来源类型','所有权','来源URL','时效','证券映射限制'],b.brokers.map(x=>[x.issuerId,x.code,x.name,x.institution,x.publicationDate,x.targetPrice,x.currency,x.targetHorizon??'公开转述未明确',x.rating??'未明确',x.sourceType,x.institutionOwnership??'未核验',x.sourceURL,x.recency,x.securityMatch??'']));broker.getRange('C:D').format.columnWidth=28;broker.getRange('H:H').format.columnWidth=50;broker.getRange('L:L').format.columnWidth=110;broker.getRange('N:N').format.columnWidth=75;
const summary=setup('总览','医药与科技证券研究 · 初版',['范围/进度','已完成','总数','说明'],[['股票身份与行情',96,96,'93当日锚；3停牌最后参考价'],['公司模型',b.status.summary.issuerModels,92,'未建模不打分、不填目标价'],['证券估值模型',b.models.length+(b.conditionedModels??[]).length,96,'A/H共享经营模型、独立估值'],['万字正文',b.status.summary.deepResearchPassed,92,'标题、来源、表格和共用内容不计'],['研究基准','2026-10-09','',b.version],['当前活动模型','基准','','请在假设B3切换1/2/3'],['快照工作流','输入修改须刷新','','情景快照显示待刷新；重新运行脚本']]);summary.getRange('A:A').format.columnWidth=25;summary.getRange('D:D').format.columnWidth=68;summary.getRange('B12').formulas=[["=CHOOSE('假设'!B3,\"悲观\",\"基准\",\"乐观\")"]];
summary.getRange('A17:D17').values=[['期限','当前最高分公司','优先代码','得分']];summary.getRange('A17:D17').format.fill=colors.navy;summary.getRange('A17:D17').format.font.color='#FFFFFF';for(let i=0;i<4;i++){const h=['halfYear','oneYear','threeYear','fiveYear'][i],r=b.rankings[h][0];summary.getRange(`A${18+i}:D${18+i}`).values=[[b.labels[h],r?.name??'待建模',r?.code??'',r?.score??null]];}
summary.getRange('A24').values=[[b.status.summary.remainingDeepResearch?'当前为阶段排名；剩余公司接入后重排。':`四期限全榜完成；${(b.conditionedModels??[]).length}个条件研究证券暂不排名。`]];summary.getRange('A25').values=[['悲观情景和技术支撑都不是最大损失边界；评分不是概率。']];summary.getRange('A26').values=[['以Excel模型、Word/PDF同源JSON同步更新。']];
summary.getRange('D9').values=[[`${b.models.length}个正式估值证券；${(b.conditionedModels??[]).length}个暂不排名条件参考另表`]];
const audit=setup('验收','核算与刷新核验',['检查','结果','要求/说明'],[['覆盖股票',b.universe.securities.length,'96'],['发行人数',b.universe.issuers.length,'92'],['股票证券',b.universe.securities.filter(s=>s.type==='股票').length,'96'],['模型算术',b.audits.every(x=>['pass','conditional model independent QA only'].includes(x.formulaCheck))?'通过':'失败','正式目标价及评分复算；条件模型独立核验且不排名'],['正文完成',b.status.summary.deepResearchPassed,'92'],['未完成深研',b.status.summary.remainingDeepResearch,'0才全交付'],['文件验收','进行中','仅Word及同源PDF实际渲染后通过'],['权重总和',null,'年底判断权重应等于1'],['输入快照状态',null,'输入改变后待刷新，旧结果不可作新预测'],['完整交付','未完成','27文件及92万字正文需同时通过']]);audit.getRange('A:A').format.columnWidth=25;audit.getRange('C:C').format.columnWidth=85;audit.getRange('B14').formulas=[["=SUM('年底情景'!T4:V4)"]];audit.getRange('B15').formulas=[[`=IF(COUNTIF('情景快照'!T7:T${6+snapshots.length},"待刷新")=0,"已刷新","待刷新")`]];
const explanation=[['价格口径','2026-10-09收盘，本币；停牌保留最后交易参考价，不可与有效当日价混用'],['信息截止','只接纳不晚于2026-10-09已公开信息；公告发布时间单独记录'],['期限','港股半年2027-04-09；一年实际2027-10-07（10/8重阳节，名义10/9）；年底12/31半日市；港股2029/2031及内地远期日历待核'],['模型','单套活动估值依次选择悲观、基准、乐观，保存输入和结果快照；不构造并行隐藏模型'],['输入修改','假设输入改变时快照T列自动标待刷新；重新运行assemble.mjs和build_workbook.mjs刷新三个快照，更新所有Word/PDF'],['排名刷新','评分输入变化时旧静态顺序不再有效；重新运行统一汇总排序与文件管线'],['排名范围',`全部可评估股票；${(b.conditionedModels??[]).length}个条件研究证券保留独立研究并明确暂不排名`],['评分','0-5各维度按证据判断，加权100；同分按基准总回报、悲观损失；不足3分同梯队'],['汇率','币种与换算率逐模型列明，属于研究假设；±5%敏感性另做，未冒充核验即期汇率'],['机构目标','只用正文公司/代码匹配、同机构最新有效目标；转述非原研报，缺目标期限保留未明确'],['行情','Yahoo/Tencent日线与Sina最新独立报价；复权adjclose/close归一基准价；单位、缺口及179条异常修复留档'],['风险情景','25/50/25是主观判断权重，不是统计置信区间或损失上限'],['本轮边界','研究覆盖92家公司96股票；公开缺失资料逐项保留限制。内容、模型、27文件及逐页视觉验收须同时通过']];
const doc=setup('说明','研究与刷新方法',['项目','说明'],explanation);doc.getRange('A:A').format.columnWidth=22;doc.getRange('B:B').format.columnWidth=125;
for(const n of ['总览','四期限排名','年底情景'])sh[n].tabColor=colors.navy;sh['假设'].tabColor='#52718D';sh['数据 >>'].tabColor='#8F9CAB';sh['说明'].tabColor='#95949B';
wb.recalculate();
const inputs=[];
build.getRange('T6').values=[['盈利币种']];a.getRange('O6').values=[['盈利币种']];
for(const x of modelRows){build.getRange('T'+x.br).values=[[x.m.earningsCurrency??'CNY']];for(let i=0;i<4;i++)a.getRange('O'+(x.ar+i)).values=[[x.m.earningsCurrency??'CNY']];}
a.getRange('V6:X6').values=[['前一工作日 周末已解析','已核实际交易日','交易所日历状态']];
for(const x of modelRows)for(let i=0;i<4;i++)a.getRange('V'+(x.ar+i)+':X'+(x.ar+i)).values=[[x.sc.targetDateResolution?.previousWeekdayDate??null,x.sc.targetDateResolution?.actualDate??'待核',x.sc.targetDateResolution?.calendarStatus??'待核']];
function recordInput(x,sheet,cell,kind,field,caseIndex,extra={}){
 const originalValue=sh[sheet].getRange(cell).values[0][0];
 inputs.push({code:x.m.code,horizon:x.h,sourceModelVersion:x.m.modelVersion,sheet,cell,kind,field,caseIndex,originalValue,...extra});
}
for(const x of modelRows)for(let c=0;c<3;c++){
 const row=x.ar+c+1,fields={E:'eps',F:'PE',G:'fx',H:'dividend',I:'coreRevenueCNYbn',J:'coreNetMargin',K:'dilutedSharesBn'};
 for(const [column,field] of Object.entries(fields)){
  if(x.m.ubtechBridge)continue;
  if(x.m.sensetimeBridge)continue;
  if(x.m.cansinoBridge||x.m.horizonBridge||x.m.zhonganBridge||x.m.insilicoBridge||x.m.xtalpiBridge)continue;
  if((x.m.haierSmartBridge||x.m.bydeBridge||x.m.cgnBridge||x.m.eastbuyBridge||x.m.grandPharmaBridge)&&field!=='PE')continue;
  if(x.m.hutchmedBridge||x.m.innocareBridge||x.m.huahongBridge||x.m.everestBridge||x.m.xdBridge||x.m.kingsoftBridge||x.m.ascentageBridge||x.m.yuewenBridge||x.m.hightideBridge||x.m.tongchengBridge||x.m.dualityBridge||x.m.liautoBridge||x.m.zaiBridge||x.m.xpengBridge||x.m.nioBridge||x.m.lepuBridge||x.m.minimaxBridge||x.m.junshiBridge||x.m.zhipuBridge)continue;
  if(x.m.globalRoyaltyModel&&field!=='dividend')continue;
  if(x.m.sotpBridge&&!['fx','dividend'].includes(field))continue;
  if(x.sc.purePipeline&&['eps','PE','coreRevenueCNYbn','coreNetMargin'].includes(field))continue;
  if((x.m.operatingBridge||x.m.productOperatingBridge||x.m.segmentCashBridge||x.m.simcereBridge||x.m.fosunBridge||x.m.luyeBridge||x.m.tigermedBridge||x.m.normalProfitBridge)&&['eps','coreRevenueCNYbn','coreNetMargin','dilutedSharesBn'].includes(field))continue;
  if((x.m.segmentCashBridge||x.m.simcereBridge||x.m.luyeBridge)&&field==='dividend')continue;
  if(x.m.luyeBridge&&field==='PE'&&c===0)continue;
  if(Object.values(sharedEconomicFields).includes(field)&&economicMaster(x)!==x)continue;
  if(!x.sc.coreRevenueCNYbn&&['coreRevenueCNYbn','coreNetMargin','dilutedSharesBn'].includes(field))continue;
  if(x.sc.coreRevenueCNYbn&&field==='eps')continue;
  recordInput(x,'假设',column+row,'assumption',field,c,field==='coreNetMargin'?{min:0,max:1}:field==='fx'||field==='dilutedSharesBn'?{min:.000001}:field==='eps'?{}:{min:0});
 }
 if(x.sc.excessNetCashCNYbn)recordInput(x,'假设','N'+row,'assumption','excessNetCashCNYbn',c);
 if(x.sc.strategyInvestmentValueCNYbn)recordInput(x,'假设','P'+row,'assumption','strategyInvestmentValueCNYbn',c,{min:0});
 if(x.sc.futureResearchReserveCNYbn)recordInput(x,'假设','Q'+row,'assumption','futureResearchReserveCNYbn',c,{min:0});
 if(x.sc.excessNetCashUSDbn&&(!x.m.productOperatingBridge||modelRows.find(y=>y.m.issuerId===x.m.issuerId&&y.h===x.h&&y.m.productOperatingBridge)===x))recordInput(x,'假设','R'+row,'assumption','excessNetCashUSDbn',c);
 if(x.sc.cashPremiumApplies)recordInput(x,'假设','S'+row,'assumption','AsharePremiumAssumption',c,{min:0});
 if(x.sc.marketRecognitionFactor??x.sc.recognitionFactor)recordInput(x,'假设','U'+row,'assumption',x.sc.marketRecognitionFactor?'marketRecognitionFactor':'recognitionFactor',c,{min:0,max:1});
}
for(const x of bridgeMetadata)for(let c=0;c<3;c++){
 const fields={D:'commerceEBITA',E:'cloudComputeEBITA',F:'labsEBITA',G:'otherCorporateEliminationEBITA',H:'effectiveTaxRate',I:'afterTaxInterestAssociatesNet',J:'dilutedShares',K:'revenue',L:'adjustedEBITMargin',M:'oneTimePenaltyReserveCNYbillion'};
 for(const [column,field] of Object.entries(fields)){
  const actualField=field==='adjustedEBITMargin'&&!x.m.operatingBridge[x.h].adjustedEBITMargin?'EBITMargin':field;
  if(x.m.operatingBridge[x.h][actualField]==null&&!['effectiveTaxRate','oneTimePenaltyReserveCNYbillion'].includes(field))continue;
  recordInput(x,'经营假设',column+(x.ar+c+1),'bridge',actualField,c,field==='effectiveTaxRate'?{min:0,max:1}:field==='dilutedShares'?{min:.000001}:{});
 }
}
for(const x of ownerMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({R:'revenue',S:'EBITMargin',T:'netFinancialAssociates',U:'effectiveTaxRate',V:'ownerProfitShare',W:'dilutedShares'}))recordInput(x,'经营假设',column+(x.ar+c+1),'bridge',field,c,['effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:field==='dilutedShares'?{min:.000001}:{});
for(const x of vehicleMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({AG:'domesticUnits',AH:'overseasUnits',AI:'domesticProfitPerVehicle',AJ:'overseasProfitPerVehicle',AK:'otherOwnerProfit',AL:'dilutedShares'}))recordInput(x,'经营假设',column+(x.ar+c+1),'bridge',field,c,field==='dilutedShares'?{min:.000001}:['domesticUnits','overseasUnits'].includes(field)?{min:0}:{});
for(const x of segmentMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({AU:'powerRevenue',AV:'powerEBITMargin',AW:'storageRevenue',AX:'storageEBITMargin',AY:'materialsRevenue',AZ:'materialsEBITMargin',BA:'otherRevenue',BB:'otherEBITMargin',BC:'normalNetFinanceAssociates',BD:'effectiveTaxRate',BE:'ownerProfitShare',BF:'dilutedShares'}))recordInput(x,'经营假设',column+(x.ar+c+1),'bridge',field,c,field==='dilutedShares'?{min:.000001}:['effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:{});
for(const x of geographyMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({D:'PRCRevenue',E:'PRCEBITMargin',F:'overseasRevenue',G:'overseasEBITMargin',H:'corporateCost',I:'normalOther',J:'effectiveTaxRate',K:'ownerProfitShare',L:'dilutedShares'}))recordInput(x,'地域经营假设',column+(x.ar+c+1),'bridge',field,c,field==='dilutedShares'?{min:.000001}:['PRCEBITMargin','overseasEBITMargin','effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:{});
for(const x of productMeta.filter(x=>!x.sharedInput))for(let c=0;c<3;c++){
 for(let i=0;i<products.length;i++)recordInput(x,'产品经营假设',col(3+i)+(x.ar+c+1),'productBridge','productRevenueUSDbn',c,{product:products[i],min:0});
 for(const[column,field]of Object.entries({J:'grossMargin',K:'researchCostUSDbn',L:'sellingAdminUSDbn',M:'taxRate',N:'dilutedSharesBn'}))recordInput(x,'产品经营假设',column+(x.ar+c+1),'productBridge',field,c,field==='dilutedSharesBn'?{min:.000001}:['taxRate','grossMargin'].includes(field)?{min:0,max:1}:{min:0});
}
for(const x of sotpMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({D:'coreRevenue',E:'coreEBITMargin',F:'corporateCost',G:'effectiveTaxRate',H:'ownerProfitShare',I:'dilutedShares',J:'newRevenue',K:'newEVSales',L:'netDistributableTreasury',M:'transitionFundingPV'}))recordInput(x,'业务分拆假设',column+(x.ar+c+1),'bridge',field,c,field==='dilutedShares'?{min:.000001}:['coreEBITMargin','effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:{});
for(const x of drugMeta)for(let c=0;c<3;c++){
 const fields={D:'domesticCoreProfitCNYbn',E:'domesticPE',F:'netCashCNYbn',G:'futureCentralResearchCostReserveCNYbn',H:'dilutedSharesBn',I:'lungApprovalAndCommercialSuccess',J:'nonLungApprovalAndCommercialSuccess',K:'royaltyRate',L:'royaltyTax',M:'WACC',N:'CNYperUSD',P:'fx'};
 for(const [column,field] of Object.entries(fields))recordInput(x,'药物假设',column+(x.ar+c+1),'drug',field,c,{component:'DEFGHIJ'.includes(column),...(['lungApprovalAndCommercialSuccess','nonLungApprovalAndCommercialSuccess','royaltyRate','royaltyTax'].includes(field)?{min:0,max:1}:['WACC','CNYperUSD','fx','dilutedSharesBn'].includes(field)?{min:.000001}:{})});
 recordInput(x,'药物假设','Q'+(x.ar+c+1),'drug','parentEconomicShare',c,{component:false,min:0,max:1});
}
for(const f of flowMeta)for(let c=0;c<3;c++)recordInput(f.x,'风险净现值',col(16+c)+f.row,'sales','annualSales',c,{type:f.type,index:f.i,min:0});
for(const f of milestoneMeta)for(let c=0;c<3;c++){
 recordInput(f.x,'风险净现值',col(41+c)+f.row,'milestone','grossUSDbn',c,{index:f.index,min:0});
 recordInput(f.x,'风险净现值',col(44+c)+f.row,'milestone','successWeight',c,{index:f.index,min:0,max:1});
}
for(const p of pipelineMeta)for(let c=0;c<3;c++)for(const[column,field]of Object.entries({E:'successAssumption',F:'netEconomicCashMarginAssumption',G:'parentEconomicShareAssumption',H:'discountRate',I:'CNYperUSD'})){if(p.g>0&&'HI'.includes(column))continue;recordInput(p.x,'管线假设',column+(p.ar+c+1),'pipelineParameter',field,c,{...('EFG'.includes(column)?{groupIndex:p.g,min:0,max:1}:{min:.000001})});}
for(const f of pipelineFlowMeta)for(let c=0;c<3;c++)recordInput(f.p.x,'管线现金流',col(7+c)+f.r,'pipelineSales','salesBn',c,{groupIndex:f.p.g,index:f.i,min:0});
for(const f of pipelineFlowMeta)for(let c=0;c<3;c++)if(f.p.groups[c].annualCashflows[f.i].directCostCNYbn!=null)recordInput(f.p.x,'管线现金流',col(35+c)+f.r,'pipelineCost','directCostCNYbn',c,{groupIndex:f.p.g,index:f.i,min:0});
for(const x of aiMeta)for(let c=0;c<3;c++)for(let i=0;i<aiFields.length;i++){const field=aiFields[i];recordInput(x,'AI经营假设',col(3+i)+(x.ar+c+1),'bridge',field,c,['effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:field==='dilutedShares'?{min:.000001}:{});}
for(const x of contentMeta)for(let c=0;c<3;c++)for(let i=0;i<contentFields.length;i++){const field=contentFields[i];recordInput(x,'内容经营假设',col(3+i)+(x.ar+c+1),'bridge',field,c,['effectiveTaxRate','klingOwnerShare'].includes(field)?{min:0,max:1}:field==='dilutedShares'?{min:.000001}:{});}
for(const f of pipelineMilestones)for(let c=0;c<3;c++){recordInput(f.x,'管线现金流',col(20+c)+f.r,'pipelineMilestone','grossAmount',c,{index:f.i,min:0});recordInput(f.x,'管线现金流',col(23+c)+f.r,'pipelineMilestone','success',c,{index:f.i,min:0,max:1});recordInput(f.x,'管线现金流',col(40+c)+f.r,'pipelineMilestone','taxFactor',c,{index:f.i,min:0,max:1});recordInput(f.x,'管线现金流',col(43+c)+f.r,'pipelineMilestone','parentFactor',c,{index:f.i,min:0,max:1});}
for(const x of recipientMeta)for(let c=0;c<3;c++)for(let i=0;i<recipientFields.length;i++){const field=recipientFields[i];recordInput(x,'许可受让方假设',col(3+i)+(x.recipientAr+c+1),'recipientParameter',field,c,['cashMarginBeforeRoyalty','royaltyTaxDeductionFactor','licensorPostTaxAndServicingFactor','holdingFactor'].includes(field)?{min:.000001,max:1}:['recipientDilutedSharesBn','warrantUnderlyingBn'].includes(field)?{min:.000001}:{min:0});}
for(const f of recipientFlowMeta)for(let c=0;c<3;c++)recordInput(f.x,'许可受让方现金流',col(14+c)+f.r,'recipientCost','recipientResearchCNYbn',c,{index:f.i,min:0});
for(const x of scoreRows)for(let i=0;i<6;i++)recordInput(x,'评分',col(3+i)+x.rr,'score','dimension',null,{index:i,min:0,max:5});
for(const x of nativeSOTPMeta)for(let c=0;c<3;c++)for(let i=0;i<sotpFields.length;i++){const field=sotpFields[i];recordInput(x,'SOTP假设',col(3+i)+(x.ar+c+1),'sotp',field,c,['lsgEBITmargin','tax','legendGM','legendTax','legendShare','holdingFactor'].includes(field)?{min:0,max:1}:field==='shares'?{min:.000001}:{});}
for(const x of retailMeta)for(let c=0;c<3;c++)for(let i=0;i<retailFields.length;i++){const field=retailFields[i];recordInput(x,'零售物流假设',col(3+i)+(x.ar+c+1),'bridge',field,c,['retailEBITMargin','logisticsEBITMargin','effectiveTaxRate','ownerProfitShare'].includes(field)?{min:0,max:1}:field==='dilutedShares'?{min:.000001}:{});}
for(const p of nativePipelineMeta)for(let c=0;c<3;c++)for(const[k,field]of Object.entries({E:'success',F:'netCashMargin',G:'royaltyRate',H:'discountRate',I:'futureDirectDevelopmentReserveUSDbn'})){if(p.g>0&&['H','I'].includes(k))continue;recordInput(p.x,'SOTP管线参数',k+(p.ar+c+1),'sotpPipelineParameter',field,c,['E','F','G'].includes(k)?{groupIndex:p.g,min:0,max:1}:field==='discountRate'?{min:.000001}:{min:0});}
for(const f of nativeCashMeta)for(let c=0;c<3;c++)recordInput(f.p.x,'SOTP管线现金流',col(6+c)+f.r,'sotpPipelineSales','grossDrugSalesUSDbn',c,{groupIndex:f.p.g,index:f.i,min:0});
for(const item of [...annualSegment.manifest,...annualSimcere.manifest,...fosunNative.manifest,...annualLuye.manifest,...tigerNative.manifest,...normalNative.manifest,...hutchmedNative.manifest,...innocareNative.manifest,...huahongNative.manifest,...everestNative.manifest,...xdNative.manifest,...kingsoftNative.manifest,...ascentageNative.manifest,...yuewenNative.manifest,...hightideNative.manifest,...tongchengNative.manifest,...dualityNative.manifest,...liautoNative.manifest,...zaiNative.manifest,...xpengNative.manifest,...haierSmartNative.manifest,...nioNative.manifest,...bydeNative.manifest,...lepuNative.manifest,...minimaxNative.manifest,...cgnNative.manifest,...junshiNative.manifest,...zhipuNative.manifest,...eastbuyNative.manifest]){const{x,sheet,cell,kind,field,caseIndex,...extra}=item;recordInput(x,sheet,cell,kind,field,caseIndex,extra);}
for(const item of ubtechNative.manifest){const{x,sheet,cell,kind,field,caseIndex,...extra}=item;recordInput(x,sheet,cell,kind,field,caseIndex,extra);}
for(const item of sensetimeNative.manifest){const{x,sheet,cell,kind,field,caseIndex,...extra}=item;recordInput(x,sheet,cell,kind,field,caseIndex,extra);}
for(const item of [...cansinoNative.manifest,...horizonNative.manifest]){const{x,sheet,cell,kind,field,caseIndex,...extra}=item;recordInput(x,sheet,cell,kind,field,caseIndex,extra);}
for(const item of [...grandPharmaNative.manifest,...zhonganNative.manifest,...insilicoNative.manifest,...xtalpiNative.manifest]){const{x,sheet,cell,kind,field,caseIndex,...extra}=item;recordInput(x,sheet,cell,kind,field,caseIndex,extra);}
for(const x of modelRows.filter(x=>x.m.sensetimeBridge))for(let c=0;c<3;c++)recordInput(x,'假设','F'+(x.ar+c+1),'assumption','PS',c,{min:0});
for(const input of inputs)sh[input.sheet].getRange(input.cell).format.font.color=colors.blue;
await fs.writeFile(path.join(root,'data/workbook_input_manifest.json'),JSON.stringify({createdAt:b.createdAt,bundleVersion:b.version,inputs},null,2));
doc.getRange('B11').values=[['在Excel保存后运行 tools/refresh_workbook.mjs（可传已编辑文件路径）。输入逐项读取到独立覆写JSON并备份，随后同一活动模型依次重算三情景与排名；原始披露不改写。模型版本改变须审核旧覆写。']];
doc.getRange('B12').values=[['四期限排名N列随评分、回报或快照输入变化标记排名待刷新；运行refresh_workbook.mjs重建顺序。正文和PDF再由同源bundle重建、渲染与验收。']];
doc.getRange('A21:B22').values=[['可编辑范围','仅蓝字且登记在workbook_input_manifest.json中的数值支持持久刷新；目标日期、年度、成功阶段、纳入标记、评分权重和披露来源需修改源模型后重建，不能只改可见标签。'],['里程碑输入','管线现金流中的金额、成功、税后比例及归属率支持分情景刷新；现金日期及折现间隔来自源模型。Vor版税和里程碑与许可资产关联，受让方自身现金及股数另列，六月账面权证不重复加值。']];
summary.getRange('D13').values=[['保存Excel后运行refresh_workbook.mjs；输入持久保存并依次刷新三情景']];
summary.getRange('D7').values=[[`${b.market.securities.filter(s=>s.tradableOnAsOf!==false).length}项基准日价格锚；3停牌参考价；${b.market.securities.filter(s=>s.historyCount>0).length}项历史数据`]];
mk.getRange('A2').values=[['行情锁版 '+(b.market.lockedMethodVersion??b.market.methodVersion)+' · 原始单位与修复留档']];
for(let i=0;i<b.market.securities.length;i++)mk.getRange('H'+(7+i)).values=[[b.market.securities[i].lastPrice?.value??null]];
summary.getRange('D7').values=[[`${b.market.securities.filter(s=>s.tradableOnAsOf!==false).length}项基准日价格锚；3停牌参考价；${b.market.securities.filter(s=>s.historyCount>0).length}项历史数据`]];
doc.getRange('A24:B24').values=[['研究数据版本',b.fingerprint??'未登记']];
// Fields added after setup retain the same legible header styling.
for(const [name,column]of [['比电子期限估值桥','T'],['乐普风险收入桥','O'],['乐普年度经营桥','AS'],['广核期限估值桥','T']])if(sh[name]){
 const sheet=sh[name];sheet.getRange(column+':'+column).format.columnWidth=68;sheet.getRange(column+'7:'+column+'50').format.wrapText=true;sheet.getRange(column+'7:'+column+'50').format.rowHeight=72;
}
if(sh['MiniMax每股估值桥']){
 const sheet=sh['MiniMax每股估值桥'];sheet.getRange('Z:AC').format.columnWidth=22;sheet.getRange('Z7:AB50').setNumberFormat('0.00');sheet.getRange('AC7:AC50').setNumberFormat('0.00');
}
if(sh['甄选资金假设'])sh['甄选资金假设'].getRange('A2').values=[['人民币十亿和十亿股 现金与激励输入 详情见正文']];
for(const name of names){
 const sheet=sh[name],header=sheet.getRange('A6:ZZ6').values[0];
 for(let j=0;j<header.length;j++)if(header[j]!==null&&header[j]!==''){
  const cell=sheet.getRange(col(j)+'6');cell.format.fill=colors.navy;cell.format.font.color='#FFFFFF';cell.format.font.bold=true;cell.format.font.name='Microsoft YaHei';cell.format.font.size=10;cell.format.wrapText=true;cell.format.verticalAlignment='center';cell.format.rowHeight=52;
 }
}
doc.getRange('B7:B24').format.wrapText=true;doc.getRange('A7:B24').format.autofitRows();
applyCoreLayoutFormat(wb);
wb.recalculate();
const inspection=await wb.inspect({kind:'region',sheetId:'活动估值',range:'A7:P12',maxChars:2500,tableMaxCols:16});
await fs.writeFile(path.join(root,'qa/workbook_inspection.json'),JSON.stringify(inspection));
const result=await SpreadsheetFile.exportXlsx(wb);await result.save(path.join(root,'deliverables/证券研究总表_初版.xlsx'));
await fs.writeFile(path.join(root,'qa/workbook_manifest.json'),JSON.stringify({fingerprint:b.fingerprint,createdAt:b.createdAt,modelCount:b.models.length,completedIssuers:b.status.summary.deepResearchPassed,file:'deliverables/证券研究总表_初版.xlsx'},null,2));
const preview=await wb.render({sheetName:'总览',range:'A1:D26',scale:1.6,format:'png'});await fs.writeFile(path.join(root,'qa/workbook_overview.png'),new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({sheets:names.length,modelRows:modelRows.length,snapshots:snapshots.length,output:'证券研究总表_初版.xlsx'}));
