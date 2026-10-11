import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const c=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(x=>x.issuerId==='I033');
const wanted=['12344555','12293393','12313626','12319545','12361058','12368587','12294437','12239774'];
const out=[];for(const l of c.lists.find(x=>x.category==='company-announcement').links.filter(x=>wanted.some(id=>x.url.includes(id)))){
 const name='02096_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
 try{await fs.access(file);}catch{let done=false;for(let retry=0;retry<3&&!done;retry++){try{const r=await fetch(l.url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer());await fs.writeFile(file,b);done=true;}catch(e){if(retry===2)throw e;}}}
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/simcere_sources.json',JSON.stringify(out,null,2));console.log(l.title+' '+text.length);
}
