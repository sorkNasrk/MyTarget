import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const c=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(x=>x.issuerId==='I022');
const wanted=['12369030','12365059','12343058','12337967','12316747','12301470','12293223','12293294','12222745'];
const links=c.lists.find(x=>x.category==='company-announcement').links;
const out=[];for(const l of links.filter(x=>wanted.some(id=>x.url.includes(id)))){
 const name='03759_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 try{await fs.access(file);}catch{const r=await fetch(l.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));}
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/pharmaron_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
