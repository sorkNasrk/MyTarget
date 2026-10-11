import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const c=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(x=>x.issuerId==='I030');
const wanted=process.argv.slice(2).length?process.argv.slice(2):['12351613','12307394','12365029','12136784','12235098','12198644','12199773','12188352','11954686','11967724','12001718','12001714','11966903'];
const list=c.lists.find(x=>x.category==='company-announcement').links.filter(x=>wanted.some(id=>x.url.includes(id)));
let out=[];try{out=JSON.parse(await fs.readFile(root+'/data/luye_sources.json','utf8'));}catch{}
for(const l of list){
 const name='02186_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 try{await fs.access(file);}catch{const r=await fetch(l.url,{signal:AbortSignal.timeout(60000)});if(!r.ok){console.log(l.url+' HTTP '+r.status);continue;}await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));}
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out=out.filter(x=>x.url!==l.url);out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/luye_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
