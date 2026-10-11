import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const query='https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=107833&documentType=&fromDate=20260101&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=300&lang=E';
const r=await fetch(query),j=await r.json(),titles=JSON.parse(j.result);
await fs.writeFile(root+'/data/luye_hkex_titles.json',JSON.stringify({issuerId:'I030',query,retrievedAt:new Date().toISOString(),titles},null,2));
let sources=JSON.parse(await fs.readFile(root+'/data/luye_sources.json','utf8'));
for(const t of titles.filter(x=>/GENERALIZED ANXIETY|ANNUAL RESULTS/.test(x.TITLE))){
 const url='https://www1.hkexnews.hk'+t.FILE_LINK,file=root+'/data/pharma_raw/02186_hkex_'+url.split('/').at(-1);
 const r=await fetch(url);if(!r.ok)throw new Error(url+' '+r.status);await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
 const text=await fs.readFile(file.replace(/\.pdf$/i,'.pdfium.txt'),'utf8');sources=sources.filter(x=>x.url!==url);sources.push({url,title:t.TITLE,date:t.DATE_TIME,text,rawFile:'data/pharma_raw/'+file.split('/').at(-1),sourceType:'issuer_disclosure_primary_hkex'});console.log(t.DATE_TIME+' '+t.TITLE+' '+text.length);
}
await fs.writeFile(root+'/data/luye_sources.json',JSON.stringify(sources,null,2));
