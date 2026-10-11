import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const c=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(x=>x.issuerId==='I035');
const wanted=['12333650','12285810','12280420','12245580','12328611','12333062','12319783','12339590','12201790','12182606','12103412'];
const links=c.lists.find(x=>x.category==='company-announcement').links;
const month=links.find(x=>/九月三十日/.test(x.title));if(month)wanted.push(month.url.split('/').at(-1).split('-')[0]);
const out=[];for(const l of links.filter(x=>wanted.some(id=>x.url.includes(id)))){
 const name='01548_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 const r=await fetch(l.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/genscript_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
