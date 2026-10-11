import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const active=await fetch('https://www1.hkexnews.hk/ncms/script/eds/activestock_sehk_e.json').then(r=>r.json());
const stock=active.find(x=>x.c==='06690');
const query=`https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=${stock.i}&documentType=&fromDate=20260101&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=1000&lang=E`;
const j=await fetch(query).then(r=>r.json()),results=JSON.parse(j.result);
await fs.writeFile(root+'/data/haier_smart_hkex_titles.json',JSON.stringify({stock,query,results,retrievedAt:new Date().toISOString()},null,2));
if(process.argv.includes('--titles')){console.log(results.filter(x=>/ANNUAL|INTERIM|DIVIDEND|SEPTEMBER|REPURCHASE|D SHARES|D-SHARES|CANCELLATION|PROFIT/i.test(x.TITLE)).map(x=>({id:x.NEWS_ID,time:x.DATE_TIME,title:x.TITLE,url:x.FILE_LINK})));process.exit(0)}
const cj=await fetch(query.replace('lang=E','lang=ZH')).then(r=>r.json()),chinese=JSON.parse(cj.result);
await fs.writeFile(root+'/data/haier_smart_hkex_titles_cn.json',JSON.stringify({query:query.replace('lang=E','lang=ZH'),results:chinese},null,2));
const selected=[...results.filter(x=>x.FILE_TYPE==='PDF'&&(/ANNUAL REPORT|INTERIM REPORT|ANNUAL RESULTS|INTERIM RESULTS|MONTHLY RETURN.*SEPTEMBER|FINAL DIVIDEND|INTERIM DIVIDEND|D SHARES|D-SHARES/i.test(x.TITLE)||x.NEWS_ID==='12359845')),...chinese.filter(x=>x.FILE_TYPE==='PDF'&&/10\/2026|09\/2026/.test(x.DATE_TIME)&&/回購|回购|D股|D 股|關聯|关联|股本/.test(x.TITLE))];
const documents=[];
for(const x of selected){const url='https://www1.hkexnews.hk'+x.FILE_LINK,file=root+'/data/tech_raw/06690_'+x.NEWS_ID+'.PDF';try{await fs.access(file)}catch{const resp=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!resp.ok)throw Error(resp.status);await fs.writeFile(file,Buffer.from(await resp.arrayBuffer()))}try{await fs.access(file.replace(/\.PDF$/i,'.pdfium.txt'))}catch{execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file])}documents.push({title:x.TITLE,publicationTime:x.DATE_TIME,url,rawFile:file,text:await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8')});console.log(x.DATE_TIME+' '+x.TITLE.replace(/\n/g,' '))}
await fs.writeFile(root+'/data/haier_smart_sources.json',JSON.stringify({documents},null,2));
