import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const py='C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const stocks=await(await fetch('https://www1.hkexnews.hk/ncms/script/eds/activestock_sehk_e.json')).json();
const stock=stocks.find(x=>String(x.c).replace(/^0+/,'')==='6185');
const query='https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId='+stock.i+'&documentType=&fromDate=20240101&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=1000&lang=E';
const response=await(await fetch(query)).json(),titles=JSON.parse(response.result);
await fs.writeFile(root+'/data/cansino_hkex_titles.json',JSON.stringify({stock,query,titles,retrievedAt:new Date().toISOString()},null,2));
let out=[];try{out=JSON.parse(await fs.readFile(root+'/data/cansino_sources.json','utf8'));}catch{}
const selected=titles.filter(x=>/\.pdf$/i.test(x.FILE_LINK)&&(/INTERIM REPORT.*2026|2026.*INTERIM REPORT|ANNUAL REPORT.*2025|2025.*ANNUAL REPORT|2024.*ANNUAL REPORT|ANNUAL REPORT.*2024|SIX MONTHS ENDED JUNE 30, 2026|CLINICAL|APPROVAL|VACCINE|LICEN|RESEARCH|PLACING|SUBSCRIPTION|FINANCIAL|PROPOSED.*ISSUANCE|SANOFI|DIVIDEND|REPURCHASE|RESTRICTED.*SHARE|mRNA|FIRST QUARTERLY REPORT/i.test(x.TITLE)||x.FILE_LINK.endsWith('2026100700856.pdf')));
for(const x of selected){
 const url='https://www1.hkexnews.hk'+x.FILE_LINK,file=root+'/data/pharma_raw/06185_'+x.FILE_LINK.split('/').at(-1);
 if(out.some(y=>y.url===url))continue;
 try{await fs.access(file);}catch{const resp=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!resp.ok)throw Error(resp.status+' '+url);await fs.writeFile(file,Buffer.from(await resp.arrayBuffer()));}
 execFileSync(py,[root+'/tools/extract_one_pdf.py',file]);
 out=out.filter(y=>y.url!==url);out.push({url,title:x.TITLE,publicationDate:x.DATE_TIME,sourceType:'HKEX_issuer_primary',rawFile:file,text:await fs.readFile(file.replace(/\.pdf$/i,'.pdfium.txt'),'utf8')});
 await fs.writeFile(root+'/data/cansino_sources.json',JSON.stringify(out,null,2));console.log(x.DATE_TIME+' '+x.TITLE);
}
console.log(JSON.stringify({titles:titles.length,selected:out.length}));
