import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const links=JSON.parse(await fs.readFile(root+'/data/simcere_extra_links.json','utf8'));
const wanted=['12130155','12067788','12201536','12011187','12055925','12182080'];
const out=[];for(const l of links.filter(x=>wanted.some(id=>x.url.includes(id)))){
 const name='02096_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 try{await fs.access(file);}catch{const r=await fetch(l.url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));}
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/simcere_historical_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
