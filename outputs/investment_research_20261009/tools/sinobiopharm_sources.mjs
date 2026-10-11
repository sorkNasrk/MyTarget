import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const c=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(c=>c.issuerId==='I031');
const ids=['12344918','12328899','12348346','12289832','12237532','12367210','12323522','12237204'];
const out=[];
for(const l of c.lists.find(x=>x.category==='company-announcement').links.filter(l=>ids.some(id=>l.url.includes(id)))){
 const name='01177_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 const r=await fetch(l.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);
 await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const t=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text:t,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});console.log(l.title+' '+t.length);
}
await fs.writeFile(root+'/data/sinobiopharm_sources.json',JSON.stringify(out,null,2));
