import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
import {applyWorkbookInputs} from './workbook_inputs.mjs';
import {calculateHutchmedHorizon} from './hutchmed_native.mjs';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx')));
const inputs=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8')).inputs;
const m=b.models.find(m=>m.issuerId==='I024');if(!m?.hutchmedBridge)throw Error('Hutchmed bridge missing');
const checks=[],eq=(label,actual,expected)=>{if(!Number.isFinite(actual)||Math.abs(actual-expected)>1e-7)throw Error(label+': '+actual+' expected '+expected);checks.push(label);};
const active=wb.worksheets.getItem('活动估值'),selector=wb.worksheets.getItem('假设').getRange('B3');
const activeRow=(h)=>active.getRange('A7:U'+(6+b.models.length*5)).values.find(r=>r[0]===m.code&&r[2]===b.labels[h]);
for(let c=0;c<3;c++){
 selector.values=[[c+1]];wb.recalculate();
 for(const[h,s]of Object.entries(m.scenarios)){
  const v=calculateHutchmedHorizon(m,h,c),a=activeRow(h);
  eq('Integrated price '+h+'/'+c,a[11],v.price);eq('Integrated dividend '+h+'/'+c,a[12],v.dividend);eq('Integrated FX '+h+'/'+c,a[10],m.hutchmedBridge.globals[c].FX);
  eq('Price return '+h+'/'+c,a[13],v.price/m.price-1);eq('Total return '+h+'/'+c,a[14],(v.price+v.dividend)/m.price-1);
  if(a[9]!=='不适用PE')throw Error('DCF incorrectly uses PE');checks.push('PE inapplicable '+h+'/'+c);
 }
}
selector.values=[[2]];wb.recalculate();
const cases=[
 {kind:'hutchmedAsset',field:'p',groupIndex:0,value:.70},
 {kind:'hutchmedAsset',field:'start',groupIndex:0,value:2028},
 {kind:'hutchmedAnnual',field:'RD',index:4,value:.30},
 {kind:'hutchmedAnnual',field:'GM.fruChina',index:0,value:.38},
 {kind:'hutchmedAnnual',field:'oldReceivableCash',index:2,value:.02},
 {kind:'hutchmedAnnual',field:'dividend',index:0,value:.20},
 {kind:'hutchmedGlobal',field:'rewardPurchaseFactor',value:.90},
 {kind:'hutchmedGlobal',field:'guaranteePayment',value:.1035},
 {kind:'hutchmedGlobal',field:'GSKupfrontYear',value:2027},
 {kind:'hutchmedGlobal',field:'discount',value:.135},
 {kind:'hutchmedGlobal',field:'FX',value:7.30},
 {kind:'hutchmedRamp',field:'ramp',index:3,value:.55},
 {kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',value:.63}
];
const sandbox=path.join(root,'qa/hutchmed_persistent_test');await fs.mkdir(path.join(sandbox,'data'),{recursive:true});
for(const test of cases){
 const item=inputs.find(x=>x.code===m.code&&x.caseIndex===1&&Object.entries(test).filter(([k])=>k!=='value').every(([k,v])=>x[k]===v));
 if(!item)throw Error('Missing edit atom '+JSON.stringify(test));
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[test.value]];wb.recalculate();
 const clone=structuredClone(b.models);await fs.writeFile(path.join(sandbox,'data/workbook_overrides.json'),JSON.stringify({records:[{...item,value:test.value}]}));await applyWorkbookInputs(sandbox,clone,b.years);
 const changed=clone.find(x=>x.code===m.code);
 for(const[h,s]of Object.entries(changed.scenarios)){
  const v=calculateHutchmedHorizon(changed,h,1),a=activeRow(h);
  eq('Edited price '+test.field+'/'+h,a[11],v.price);eq('Persistent price '+test.field+'/'+h,a[11],s.cases[1].price);
  eq('Persistent dividend '+test.field+'/'+h,a[12],s.cases[1].dividend);eq('Edited total return '+test.field+'/'+h,a[14],s.cases[1].totalReturn);
  eq('Editable FX '+test.field+'/'+h,a[10],changed.hutchmedBridge.globals[1].FX);
  const snap=wb.worksheets.getItem('情景快照').getRange('A7:T'+(6+b.models.length*15)).values.find(r=>r[0]===m.code&&r[2]===b.labels[h]&&r[3]==='基准');
  if((test.horizon==null||test.horizon===h)&&snap[19]!=='待刷新')throw Error('Missing stale flag '+test.field+'/'+h);
 }
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[item.originalValue]];wb.recalculate();
}
const forbidden=inputs.filter(x=>x.code===m.code&&x.kind==='assumption'&&x.field!=='marketRecognitionFactor');if(forbidden.length)throw Error('Alternate generic DCF edit path '+JSON.stringify(forbidden));
const restored=wb.worksheets.getItem('情景快照').getRange('A7:T'+(6+b.models.length*15)).values.filter(r=>r[0]===m.code);if(restored.some(r=>r[19]!=='已刷新'))throw Error('Snapshot signature restoration failed');
await fs.writeFile(path.join(root,'qa/hutchmed_workbook_qa.json'),JSON.stringify({passed:true,fingerprint:b.fingerprint,checks:checks.length,atomicEdits:cases.length,sourceWorkbookUnchanged:true,scope:'Integrated DCF activity output and cash dividend; 3 scenarios and 5 horizons; persistent atomic edits; FX unique native source; once-only market recognition; stale and restored snapshot flags; no generic EPS/PE/cash edit bypass. Separate independent annual/native QA retained.'},null,2));
console.log(JSON.stringify({passed:true,checks:checks.length,atomicEdits:cases.length}));
