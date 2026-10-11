import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const company=JSON.parse(await fs.readFile(root+'/data/pharma_evidence.json','utf8')).companies.find(c=>c.issuerId==='I029');
const ids=['12345893','12338832','12241528'];
const links=company.lists.find(x=>x.category==='company-announcement').links.filter(l=>ids.some(id=>l.url.includes(id)));
const out=[];
for(const l of links){const name='03692_'+l.url.split('/').at(-1),file=root+'/data/pharma_raw/'+name;const r=await fetch(l.url);if(!r.ok)throw Error(r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);const t=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({...l,text:t,rawFile:'data/pharma_raw/'+name,sourceType:'issuer_disclosure_primary_mirrored'});}
await fs.writeFile(root+'/data/hansoh_extra_sources.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
