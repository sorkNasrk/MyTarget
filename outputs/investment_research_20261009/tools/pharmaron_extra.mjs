import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const seed=await fs.readFile(root+'/data/pharma_raw/03759_company-announcement.html','utf8');
let param;for(const m of seed.matchAll(/var param = (\{[^;]+\});/g)){try{const p=JSON.parse(m[1]);if(p.cat&&p.newsid)param=p;}catch{}}
if(!param)throw Error('no param');
const out=[];for(let page=0;page<12;page++){
 const url='https://www.aastocks.com/tc/resources/datafeed/getmorenews.ashx?'+new URLSearchParams(param);
 const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);const data=await r.json();if(!data.length)break;
 for(const n of data){const link={url:n.t==='2'?`https://iis.aastocks.com${n.u}`:`https://www.aastocks.com/tc/stocks/analysis/stock-aafn-con/03759/${n.s}/${n.id}/company-announcement`,title:n.h.replace(/<[^>]+>/g,''),date:n.dt.replaceAll('/','-')};if(!out.some(x=>x.url===link.url))out.push(link);}
 const last=data.at(-1);param.newsid=last.id;param.newstime=last.dtd;await fs.writeFile(root+'/data/pharmaron_extra_links.json',JSON.stringify(out,null,2));console.log(page+' '+last.dt+' '+out.length);if(last.dt<'2025/03/01')break;
}
