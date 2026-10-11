import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const company=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(c=>c.issuerId==='I023');
const ids=['12135986','12079052','12359712','12368677','12079042'];
const links=company.lists.find(x=>x.category==='company-announcement').links.filter(l=>ids.some(id=>l.url.includes(id)));
const out=[];
for(const l of links){
 const name='01530_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 const r=await fetch(l.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);
 await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const t=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');
 out.push({...l,text:t,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});
 console.log(l.title+' '+t.length);
}
await fs.writeFile(root+'/data/3sbio_extra_sources.json',JSON.stringify(out,null,2));
