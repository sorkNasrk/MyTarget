import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),active=await fetch('https://www1.hkexnews.hk/ncms/script/eds/activestock_sehk_e.json').then(r=>r.json()),stock=active.find(x=>x.c==='03347');
const url=`https://www1.hkexnews.hk/search/titleSearchServlet.do?sortDir=0&sortByOptions=DateTime&category=0&market=SEHK&stockId=${stock.i}&documentType=&fromDate=20260801&toDate=20261009&title=&searchType=0&t1code=-2&t2Gcode=-2&t2code=-2&rowRange=300&lang=E`,j=await fetch(url).then(r=>r.json()),results=JSON.parse(j.result);
await fs.writeFile(new URL('data/tigermed_hkex_titles.json',root),JSON.stringify({stock,searchURL:url,results},null,2));
console.log(results.filter(x=>['12369066','12365016','12304121','12330303','12306896','12306934'].includes(x.NEWS_ID)).map(x=>({title:x.TITLE,time:x.DATE_TIME,url:'https://www1.hkexnews.hk'+x.FILE_LINK})));
