import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
import {calculateSimcereAnnual,calculateSimcereHorizon} from './simcere_native.mjs';
import {calculateFosun} from './fosun_bridge.mjs';
import {applyWorkbookInputs} from './workbook_inputs.mjs';
const root=path.resolve(import.meta.dirname,'..'),b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx'))),manifest=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8')).inputs;
const sm=b.models.find(m=>m.simcereBridge),fm=b.models.find(m=>m.fosunBridge);if(!sm||!fm)throw Error('New models absent');
const checks=[];function eq(label,actual,expected,tol=1e-8){if(typeof actual!=='number'||Math.abs(actual-expected)>tol)throw Error(label+': '+actual+' expected '+expected);checks.push(label);}
const out=wb.worksheets.getItem('先声年度经营桥'),fo=wb.worksheets.getItem('复星经营桥'),active=wb.worksheets.getItem('活动估值');
for(let c=0;c<3;c++){
 wb.worksheets.getItem('假设').getRange('B3').values=[[c+1]];wb.recalculate();
 const annual=calculateSimcereAnnual(sm,c),actual=out.getRange('A7:AD13').values;
 for(let i=0;i<annual.length;i++)for(const[key,j]of Object.entries({coreRevenueCNYbn:2,coreGrossProfitCNYbn:3,oncologyAllocatedCostCNYbn:5,oncologyNormalPretaxCNYbn:6,corePretaxCNYbn:7,consolidatedCoreProfitCNYbn:9,oncologyEconomicParentShare:10,oncologyMinorityProfitCNYbn:11,coreNetProfitCNYbn:12,dilutedSharesBn:13,epsCNY:14,normalizedOCFCNYbn:15,cashStartCNYbn:16,remainingOperatingCashCNYbn:17,remainingCapexCNYbn:18,remainingLicensePurchaseCNYbn:19,RocheNetCashCNYbn:21,selectedMilestoneNetCashCNYbn:22,dividendCashCNYbn:23,redemptionSettlementCashCNYbn:25,forecastLiquidCashCNYbn:27,forecastBankDebtCNYbn:28,forecastRedemptionLiabilityCNYbn:29}))eq('Simcere '+c+' '+annual[i].year+' '+key,actual[i][j],annual[i][key]);
 const builds=active.getRange('A7:U'+(6+b.models.length*5)).values;
 for(const[h,s]of Object.entries(sm.scenarios)){const row=builds.find(r=>r[0]===sm.code&&r[2]===s.label),v=calculateSimcereHorizon(sm,h,c);eq('recognition exactly once '+h+' '+c,row[11],sm.price+(v.intrinsicPrice-sm.price)*s.marketRecognitionFactor[c]);eq('intrinsic value '+h+' '+c,row[20],v.intrinsicPrice);eq('future dividend once '+h+' '+c,row[12],v.dividend);}
 for(const[h,s]of Object.entries(fm.scenarios)){const row=fo.getRange('A7:L11').values.find(r=>r[1]===s.label),v=calculateFosun(fm,h,c);eq('Fosun revenue '+h+' '+c,row[2],v.revenue);eq('Fosun pretax '+h+' '+c,row[5],v.pretax);eq('Fosun parent '+h+' '+c,row[9],v.parent);eq('Fosun EPS '+h+' '+c,row[11],v.eps);}
}
wb.worksheets.getItem('假设').getRange('B3').values=[[2]];wb.recalculate();
const tests=[
 {code:sm.code,kind:'simcereDomestic',field:'success',groupIndex:0,caseIndex:1,delta:.1},
 {code:sm.code,kind:'simcereDomestic',field:'start',groupIndex:0,caseIndex:1,value:2028},
 {code:sm.code,kind:'simcereRoyalty',field:'royalty',groupIndex:0,caseIndex:1,delta:.02},
 {code:sm.code,kind:'simcereAnnual',field:'capex',index:1,caseIndex:1,delta:1},
 {code:sm.code,kind:'simcereGlobal',field:'redemptionFlag',caseIndex:1,value:1},
 {code:fm.code,horizon:'oneYear',kind:'fosunPrimitive',field:'RD',caseIndex:1,delta:.5},
 {code:fm.code,horizon:'oneYear',kind:'fosunPrimitive',field:'license',caseIndex:1,delta:.5},
 {code:'06618.HK',horizon:'oneYear',kind:'bridge',field:'EBITMargin',caseIndex:1,delta:.01}
];
const sandbox=path.join(root,'qa/native_new_test');await fs.mkdir(path.join(sandbox,'data'),{recursive:true});
for(const test of tests){
 const item=manifest.find(x=>Object.entries(test).filter(([k])=>!['delta','value'].includes(k)).every(([k,v])=>x[k]===v));if(!item)throw Error('Missing native editable input '+JSON.stringify(test));const value=test.value??item.originalValue+test.delta;
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[value]];wb.recalculate();
 const cloned=structuredClone(b.models);await fs.writeFile(path.join(sandbox,'data/workbook_overrides.json'),JSON.stringify({records:[{...item,value}]}));await applyWorkbookInputs(sandbox,cloned,b.years);
 const expected=cloned.find(m=>m.code===test.code),rows=active.getRange('A7:U'+(6+b.models.length*5)).values;
 for(const[h,s]of Object.entries(expected.scenarios)){const r=rows.find(r=>r[0]===test.code&&r[2]===s.label);eq('editable propagation '+test.kind+' '+test.field+' '+h,r[11],s.cases[1].price,.011);}
 if(test.code===sm.code){const annual=calculateSimcereAnnual(expected,1),sheet=out.getRange('A7:AD13').values;for(let i=0;i<annual.length;i++){eq('cash propagation '+test.field+' '+annual[i].year,sheet[i][27],annual[i].forecastLiquidCashCNYbn);eq('minority branch '+test.field+' '+annual[i].year,sheet[i][10],annual[i].oncologyEconomicParentShare);}}
 const flags=wb.worksheets.getItem('情景快照').getRange('A7:T'+(6+b.models.length*15)).values.filter(r=>r[0]===test.code&&r[3]==='基准'&&(!test.horizon||r[2]===b.labels[test.horizon]));if(flags.some(r=>r[19]!=='待刷新'))throw Error('Native inputs must invalidate relevant snapshots '+test.field);
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[item.originalValue]];wb.recalculate();
}
await fs.writeFile(path.join(root,'qa/native_new_workbook_qa.json'),JSON.stringify({passed:true,checks:checks.length,scope:'Three scenarios, seven Simcere annual rows, five horizons, clinical success and timing, royalty, capex cash roll, redemption/ownership branch, Fosun component costs and licence subset, JD Health margin; independent persistent input recalculation',fingerprint:b.fingerprint,sourceWorkbookUnchanged:true},null,2));console.log(JSON.stringify({passed:true,checks:checks.length}));
