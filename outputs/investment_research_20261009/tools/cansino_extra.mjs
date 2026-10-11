import fs from 'node:fs/promises';import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009',py='C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const old=JSON.parse(await fs.readFile(root+'/data/cansino_hkex_titles.json','utf8'));
const response=await(await fetch(old.query.replace('lang=E','lang=ZH'))).json(),zh=JSON.parse(response.result);
const en=old.titles.filter(x=>/2026081600001|2026071900005|2026062500764|2025092602942|2026033003432/.test(x.FILE_LINK));
const selected=[...en,...zh.filter(x=>/2026091700455|2026082701309|2026093002185|2026090400834|2026091600805/.test(x.FILE_LINK))];
let sources=JSON.parse(await fs.readFile(root+'/data/cansino_sources.json','utf8'));
for(const x of selected){const url='https://www1.hkexnews.hk'+x.FILE_LINK;if(sources.some(y=>y.url===url))continue;const file=root+'/data/pharma_raw/06185_'+x.FILE_LINK.split('/').at(-1);try{await fs.access(file);}catch{const resp=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!resp.ok)throw Error(resp.status);await fs.writeFile(file,Buffer.from(await resp.arrayBuffer()));}execFileSync(py,[root+'/tools/extract_one_pdf.py',file]);sources.push({url,title:x.TITLE,publicationDate:x.DATE_TIME,sourceType:'HKEX_issuer_primary',rawFile:file,text:await fs.readFile(file.replace(/\.pdf$/i,'.pdfium.txt'),'utf8')});await fs.writeFile(root+'/data/cansino_sources.json',JSON.stringify(sources,null,2));console.log(x.DATE_TIME+' '+x.TITLE);}
console.log('total '+sources.length);
