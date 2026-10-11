import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const active=await fetch('https://www1.hkexnews.hk/ncms/script/eds/activestock_sehk_e.json').then(x=>x.json());
const stock=active.find(x=>x.c==='00512');
const query=`https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=${stock.i}&documentType=&fromDate=20260101&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=1000&lang=E`;
const j=await fetch(query).then(x=>x.json()),results=JSON.parse(j.result);
await fs.writeFile(root+'/data/grand_pharma_hkex_titles.json',JSON.stringify({stock,query,results},null,2));
const selected=results.filter(x=>x.FILE_TYPE==='PDF'&&!/Notification|Notice of availability|Reply Form/i.test(x.TITLE)&&/ANNUAL REPORT|INTERIM REPORT|RESULTS ANNOUNCEMENT|INTERIM RESULTS|MONTHLY RETURN.*SEPTEMBER|PROFIT WARNING|PROFIT ALERT|ACQUISITION|DISPOSAL|TELIX|SIRTEX|RADIOACTIVE|RADIONUCLIDE|TLX591|TP-03|GPN0|RULE 13.18|Connected Transaction|SHARE.*AWARD|GRANT OF|PLACING|SUBSCRIPTION|DIVIDEND/i.test(x.TITLE)),documents=[];
for(const x of selected){
 const url='https://www1.hkexnews.hk'+x.FILE_LINK,file=root+'/data/grand_pharma_raw_'+x.NEWS_ID+'.PDF';
 try{await fs.access(file)}catch{await fs.writeFile(file,Buffer.from(await fetch(url).then(r=>r.arrayBuffer())))}
 try{await fs.access(file.replace(/\.PDF$/i,'.pdfium.txt'))}catch{execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file])}
 documents.push({title:x.TITLE,publicationTime:x.DATE_TIME,url,rawFile:file,text:await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8')});
 console.log(x.NEWS_ID+' '+x.DATE_TIME+' '+x.TITLE.replace(/\n/g,' '));
}
await fs.writeFile(root+'/data/grand_pharma_sources.json',JSON.stringify({documents},null,2));
