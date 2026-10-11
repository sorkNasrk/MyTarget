import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),raw=path.join(root,'data/tech_raw');
const active=await fetch('https://www1.hkexnews.hk/ncms/script/eds/activestock_sehk_e.json').then(r=>r.json()),stock=active.find(x=>x.c==='02015'),url=`https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=${stock.i}&documentType=&fromDate=20260101&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=300&lang=E`,r=await fetch(url).then(r=>r.json()),titles=JSON.parse(r.result);
await fs.writeFile(path.join(raw,'liauto_hkex_titles.json'),JSON.stringify({stock,searchURL:url,titles},null,2));
const wanted=[['annual','2026041000366'],['fyresults','2026031200310'],['interim','2026090800186'],['h1results','2026082600506'],['q2results','2026082600316'],['q1results','2026052800509'],['septdeliver','2026100100037'],['augdeliver','2026090100613'],['juldeliver','2026080200003'],['repurchase','2026032401608']];
const selected=wanted.map(([key,id])=>({key,...titles.find(x=>x.FILE_LINK.includes(id))}));
const month=titles.find(x=>/MONTHLY RETURN/i.test(x.TITLE));if(month)selected.push({key:'shares',...month});
for(const s of selected){if(!s.FILE_LINK)throw Error('Missing doc '+s.key);const uri='https://www1.hkexnews.hk'+s.FILE_LINK,fp=path.join(raw,'liauto_'+s.key+'.pdf');try{await fs.access(fp)}catch{const x=await fetch(uri);if(!x.ok)throw Error('HTTP '+x.status);await fs.writeFile(fp,Buffer.from(await x.arrayBuffer()));}execFileSync('C:/Users/happyelements/AppData/Local/Programs/MiKTeX/miktex/bin/x64/pdftotext.exe',['-q','-layout',fp,fp.replace(/\.pdf$/,'.txt')],{stdio:'ignore'});console.log(JSON.stringify({key:s.key,title:s.TITLE,date:s.DATE_TIME,url:uri}));}
