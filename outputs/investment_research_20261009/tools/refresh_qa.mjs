import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
import {spawnSync} from 'node:child_process';
import {applyWorkbookInputs} from './workbook_inputs.mjs';
const root=path.resolve(import.meta.dirname,'..'),sandbox=path.join(root,'qa/refresh_test');await fs.mkdir(path.join(sandbox,'data'),{recursive:true});
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx')));
const snapshotRange='T7:T'+(6+b.models.length*15),rankingRange='N7:N'+(6+b.models.length*4);
const snapshotStates=()=>wb.worksheets.getItem('情景快照').getRange(snapshotRange).values.flat();
const rankingStates=()=>wb.worksheets.getItem('四期限排名').getRange(rankingRange).values.flat();
const baselineSnapshots=snapshotStates(),baselineRankings=rankingStates();
if(baselineSnapshots.some(v=>v!=='已刷新')||baselineRankings.some(v=>v!=='已刷新'))throw new Error('Delivered workbook must begin fully refreshed');
const candidates=[
 ['00700.HK','oneYear','assumption','PE'],
 ['01810.HK','oneYear','bridge','smartphoneAIoTEBIT'],
 ['01810.HK','oneYear','bridge','commerceEBITA'],
 ['03692.HK','yearEnd','assumption','excessNetCashCNYbn'],
 ['09926.HK','yearEnd','drug','WACC'],
 ['01530.HK','yearEnd','milestone','grossUSDbn'],
 ['01211.HK','oneYear','bridge','domesticProfitPerVehicle'],
 ['01093.HK','yearEnd','pipelineParameter','successAssumption'],
 ['09992.HK','oneYear','bridge','overseasEBITMargin'],
 ['688235.SH','oneYear','productBridge','productRevenueUSDbn'],
 ['03690.HK','oneYear','bridge','newEVSales'],
 ['09618.HK','oneYear','bridge','retailEBITMargin'],
 ['01548.HK','oneYear','sotp','lsgRevenue'],
 ['01548.HK','threeYear','sotpPipelineParameter','success'],
 ['002821.SZ','oneYear','assumption','eps'],
 ['09888.HK','oneYear','bridge','infraRevenue'],
 ['01024.HK','oneYear','bridge','klingOwnerShare'],
 ['02162.HK','halfYear','assumption','marketRecognitionFactor'],
 ['02162.HK','threeYear','pipelineCost','directCostCNYbn'],
 ['688062.SH','yearEnd','pipelineMilestone','grossAmount'],
 ['09995.HK','yearEnd','recipientParameter','futureNetCashUSDbn'],
 ['09995.HK','halfYear','recipientCost','recipientResearchCNYbn'],
 ['688382.SH','oneYear','pipelineParameter','netEconomicCashMarginAssumption'],
 ['00992.HK','oneYear','bridge','EBITMargin'],
 ['00268.HK','oneYear','bridge','newEVSales'],
 ['03759.HK','yearEnd','segmentAnnual','cdmoGM'],
 ['03759.HK','yearEnd','segmentGlobal','convert'],
 ['00700.HK','oneYear','score','dimension']
];
const edits=[];
for(const [code,horizon,kind,field] of candidates){
 const item=manifest.inputs.find(x=>x.code===code&&x.horizon===horizon&&x.kind===kind&&x.field===field&&(x.caseIndex===1||kind==='score')&&(kind!=='recipientCost'||x.index===2)&&(kind!=='segmentAnnual'||x.index===1)&&(kind!=='pipelineCost'||!b.models.find(m=>m.code===code).scenarios[horizon].pipelineRNpv[x.caseIndex].groups[x.groupIndex].annualCashflows[x.index].pastAtTarget));
 if(!item)continue;
 const value=field==='convert'?0:item.originalValue+(field==='domesticProfitPerVehicle'?100:['EBITMargin','cdmoGM','klingOwnerShare','marketRecognitionFactor','directCostCNYbn','recipientResearchCNYbn','netEconomicCashMarginAssumption','success','successAssumption','retailEBITMargin','overseasEBITMargin','WACC'].includes(field)?.01:kind==='score'?.1:1);
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[value]];edits.push({...item,value});
}
wb.recalculate();
const stale=snapshotStates().filter(v=>v==='待刷新').length;
if(stale<4)throw new Error('Edited inputs failed to mark snapshots stale');
const rankSheet=wb.worksheets.getItem('四期限排名');const rankFlags=rankSheet.getRange('A7:N'+(6+b.models.length*4)).values;
if(rankFlags.some(r=>r[0]===b.labels.oneYear&&r[13]!=='排名待刷新'))throw new Error('One changed score must invalidate the whole horizon ranking');
const output=path.join(sandbox,'edited_inputs.xlsx');await(await SpreadsheetFile.exportXlsx(wb)).save(output);
const diff=spawnSync(process.execPath,[path.join(root,'tools/refresh_workbook.mjs'),output,'--dry-run'],{encoding:'utf8'});if(diff.status!==0)throw new Error(diff.stderr);
const report=JSON.parse(diff.stdout.trim());if(report.changedInputs!==edits.length)throw new Error('Workbook input change count mismatch');
await fs.writeFile(path.join(sandbox,'data/workbook_overrides.json'),JSON.stringify({records:report.records},null,2));
const cloned=structuredClone(b.models);await applyWorkbookInputs(sandbox,cloned,b.years);
for(const edit of edits.filter(x=>x.kind!=='score')){
 const before=b.models.find(x=>x.code===edit.code).scenarios[edit.horizon].cases[1].price;
 const after=cloned.find(x=>x.code===edit.code).scenarios[edit.horizon].cases[1].price;
 if(before===after)throw new Error('Edited valuation input did not alter output '+edit.field);
}
const sharedEdit=edits.find(e=>e.kind==='productBridge');
if(sharedEdit){const a=cloned.find(m=>m.code==='688235.SH'),h=cloned.find(m=>m.code==='06160.HK');if(a.productOperatingBridge.oneYear.productRevenueUSDbn[sharedEdit.product][1]!==h.productOperatingBridge.oneYear.productRevenueUSDbn[sharedEdit.product][1])throw Error('Shared A/H product input diverged');if(h.scenarios.oneYear.cases[1].price===b.models.find(m=>m.code===h.code).scenarios.oneYear.cases[1].price)throw Error('A input edit did not update H equity value');}
const sharedEPS=edits.find(e=>e.code==='002821.SZ'&&e.field==='eps');if(sharedEPS){const a=cloned.find(m=>m.code===sharedEPS.code),h=cloned.find(m=>m.code==='06821.HK');if(a.scenarios.oneYear.cases[1].eps!==h.scenarios.oneYear.cases[1].eps)throw Error('A/H EPS input diverged');if(h.scenarios.oneYear.cases[1].price===b.models.find(m=>m.code===h.code).scenarios.oneYear.cases[1].price)throw Error('A EPS edit did not update H value');}
for(const edit of edits)wb.worksheets.getItem(edit.sheet).getRange(edit.cell).values=[[edit.originalValue]];
wb.recalculate();
const restoredSnapshots=snapshotStates(),restoredRankings=rankingStates();
if(restoredSnapshots.some((v,i)=>v!==baselineSnapshots[i]))throw new Error('Restoring inputs failed to restore every snapshot state');
if(restoredRankings.some((v,i)=>v!==baselineRankings[i]))throw new Error('Restoring inputs failed to restore every horizon ranking state');
if(wb.worksheets.getItem('验收').getRange('B15').values[0][0]!=='已刷新')throw new Error('Restoring inputs failed to clear the workbook stale audit');
await fs.writeFile(path.join(root,'qa/workbook_refresh_qa.json'),JSON.stringify({passed:true,fingerprint:b.fingerprint,staleSnapshots:stale,detectedChanges:report.changedInputs,restoredSnapshots:restoredSnapshots.length,restoredRankingRows:restoredRankings.length,restoredAuditState:'已刷新',inputPreservation:'QA only; authoritative source and delivered workbook untouched',edits:edits.map(x=>({code:x.code,kind:x.kind,field:x.field}))},null,2));
console.log(JSON.stringify({passed:true,fingerprint:b.fingerprint,staleSnapshots:stale,detectedChanges:report.changedInputs,restoredSnapshots:restoredSnapshots.length,restoredRankingRows:restoredRankings.length}));
