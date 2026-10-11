import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const input=path.resolve(process.argv[2]??path.join(root,'deliverables/证券研究总表_初版.xlsx'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
let previous={records:[]};try{previous=JSON.parse(await fs.readFile(path.join(root,'data/workbook_overrides.json'),'utf8'));}catch{}
const key=r=>[r.code,r.horizon,r.caseIndex,r.kind,r.field,r.type,r.product,r.groupIndex,r.index].join('|');
const records=new Map(previous.records.map(r=>[key(r),r]));const changes=[];
for(const item of manifest.inputs){
 const value=wb.worksheets.getItem(item.sheet).getRange(item.cell).values[0][0];
 if(value===item.originalValue||value==null&&item.originalValue==null)continue;
 if(typeof value!=='number'||!Number.isFinite(value))throw new Error('Input must be a finite number: '+item.sheet+'!'+item.cell);
 if(item.min!=null&&value<item.min||item.max!=null&&value>item.max)throw new Error('Input out of range: '+item.sheet+'!'+item.cell);
 if(item.integer&&!Number.isInteger(value))throw new Error('Input must be an integer: '+item.sheet+'!'+item.cell);
 const {sheet,cell,originalValue,min,max,...record}=item;record.value=value;records.set(key(record),record);changes.push({sheet,cell,old:originalValue,value});
}
const saved={updatedAt:new Date().toISOString(),inputWorkbook:input,baselineCreatedAt:manifest.createdAt,records:[...records.values()]};
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({changedInputs:changes.length,changes,records:saved.records,status:'只读检查，未保存或刷新'}));process.exit(0);}
const backup=path.join(root,'qa/input_backups');await fs.mkdir(backup,{recursive:true});
await fs.copyFile(input,path.join(backup,'inputs_'+Date.now()+'.xlsx'));
await fs.writeFile(path.join(root,'data/workbook_overrides.json'),JSON.stringify(saved,null,2));
await fs.writeFile(path.join(root,'qa/workbook_refresh_changes.json'),JSON.stringify({updatedAt:saved.updatedAt,changes},null,2));
for(const script of ['assemble.mjs','build_workbook.mjs']){
 const r=spawnSync(process.execPath,[path.join(root,'tools',script)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
}
console.log(JSON.stringify({changedInputs:changes.length,persistedOverrides:saved.records.length,status:'Excel三情景与排名已重建；Word/PDF须按同一bundle重新生成并验收'}));
