import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const links=JSON.parse(await fs.readFile(root+'/data/remegen_extra_links.json','utf8'));
const wanted=['12127780','12106173','12102455','12063373','11988236'];
const out=[];for(const l of links.filter(x=>wanted.some(id=>x.url.includes(id)))){
 const name='09995_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 const r=await fetch(l.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/remegen_historical_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
