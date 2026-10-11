import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const m=b.models.find(m=>m.segmentCashBridge);if(!m)throw Error('Segment model absent');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx')));
const input=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8')).inputs;
const out=wb.worksheets.getItem('年度经营资金桥'),checks=[];
function eq(label,actual,expected){if(typeof actual!=='number'||Math.abs(actual-expected)>1e-8)throw Error(label+': '+actual+' expected '+expected);checks.push(label);}
const annual=out.getRange('A7:Z13').values;
for(let i=0;i<annual.length;i++)for(const[k,index]of Object.entries({revenueCNYbn:2,grossProfitCNYbn:3,parentNormalProfitCNYbn:6,dilutedSharesBn:7,EPS_CNY:8,annualOCF_CNYbn:9,cashStartCNYbn:11,cashRemainingOperatingCNYbn:12,capexRemainingCNYbn:13,CBcashRepaymentCNYbn:18,forecastLiquidCashCNYbn:20,forecastBankDebtCNYbn:21,CBfaceOutstandingCNYbn:22,forecastNetDebtCNYbn:23}))eq(k+' '+(2026+i),annual[i][index],m.annualForecast.base[i][k]);
const x=input.find(x=>x.code===m.code&&x.kind==='segmentAnnual'&&x.field==='capex'&&x.caseIndex===1&&x.index===1);
wb.worksheets.getItem(x.sheet).getRange(x.cell).values=[[x.originalValue+1]];wb.recalculate();
eq('2027 capex cash decline',out.getRange('U8').values[0][0],annual[1][20]-1);
eq('2032 cash roll decline',out.getRange('U13').values[0][0],annual[6][20]-1);
eq('capital expenditure not duplicated in PE earnings',out.getRange('I8').values[0][0],annual[1][8]);
wb.worksheets.getItem(x.sheet).getRange(x.cell).values=[[x.originalValue]];
const cv=input.find(x=>x.code===m.code&&x.kind==='segmentGlobal'&&x.field==='convert'&&x.caseIndex===1);
wb.worksheets.getItem(cv.sheet).getRange(cv.cell).values=[[0]];wb.recalculate();
eq('cash redemption full face',out.getRange('S8').values[0][0],m.convertible.faceCNYbn);
eq('cash redemption removes conversion shares',out.getRange('Y8').values[0][0],0);
eq('normal shares without conversion',out.getRange('H8').values[0][0],m.annualInput.base.normalShares[1]);
// Cash dividends are denominated on actual modeled ordinary shares; removing
// conversion also removes the dividend cash otherwise paid to the new holders.
eq('redemption cash and share count mutual exclusion',out.getRange('U8').values[0][0],annual[1][20]-m.convertible.faceCNYbn+m.annualInput.base.annualDividend[0]*m.convertible.underlyingShares/1e9);
const flags=wb.worksheets.getItem('情景快照').getRange('A7:T'+(6+b.models.length*15)).values.filter(r=>r[0]===m.code&&r[3]==='基准');
if(flags.length!==5||flags.some(r=>r[19]!=='待刷新'))throw Error('Annual settlement change must invalidate all five horizon snapshots');
await fs.writeFile(path.join(root,'qa/segment_workbook_qa.json'),JSON.stringify({passed:true,checks:checks.length,coverage:'all 7 annual rows, capex cash roll, no duplicate PE cash adjustment, cash-redemption/conversion mutual exclusion, all 5 stale flags',sourceWorkbookUnchanged:true},null,2));
console.log(JSON.stringify({passed:true,checks:checks.length}));
