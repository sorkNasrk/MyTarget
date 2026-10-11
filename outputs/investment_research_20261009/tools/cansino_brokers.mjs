import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const clean=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const out={issuerId:'I042',code:'06185.HK',asOf:'2026-10-09',lists:[],articles:[],errors:[],retrievedAt:new Date().toISOString()};
for(const cat of ['research-report','result-announcement']){
 const url=`https://www.aastocks.com/tc/stocks/analysis/stock-aafn/06185/0/${cat}/1`;
 try{const resp=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});if(!resp.ok)throw Error(resp.status);const html=await resp.text(),links=[],seen=new Set();
 for(const m of html.matchAll(/<a\b([^>]+)>[\s\S]*?<\/a>/gi)){const href=m[1].match(/href=["']([^"']+)["']/)?.[1],title=m[1].match(/title=["']([^"']+)["']/)?.[1];if(href&&title&&/stock-aafn-con|iis\.aastocks/.test(href)&&!seen.has(href)){seen.add(href);links.push({url:new URL(href,'https://www.aastocks.com').href,title:clean(title)});}}
 for(const link of links){const id=link.url.match(/(?:NOW\.\d+|IC\d+)/)?.[0];if(id){const at=html.indexOf(`ref="${id}"`),fragment=at<0?'':html.slice(at,at+4500),dt=fragment.match(/data-nt=["'](\d{12})["']/)?.[1];if(dt){link.listDate=`${dt.slice(0,4)}-${dt.slice(4,6)}-${dt.slice(6,8)} ${dt.slice(8,10)}:${dt.slice(10,12)}`;link.dateProvenance={listURL:url,articleId:id,rawTimestamp:dt,fragment};}}}
 out.lists.push({url,cat,links});
 for(const link of links.slice(0,20)){try{const response=await fetch(link.url,{signal:AbortSignal.timeout(30000)}),html=await response.text(),dt=html.match(/data-nt=["'](\d{12})["']/)?.[1],date=dt?`${dt.slice(0,4)}-${dt.slice(4,6)}-${dt.slice(6,8)} ${dt.slice(8,10)}:${dt.slice(10,12)}`:link.listDate??null,start=html.search(/<div[^>]+id=["']spanContent["']/i),end=start<0?-1:html.indexOf('</p>',start);out.articles.push({...link,date,dateBasis:dt?'article':link.listDate?'list-only':null,eligible:!!date&&date.slice(0,10)<=out.asOf,fullArticleAvailable:start>=0,text:clean(start<0?html:html.slice(start,end<0?start+22000:end+4))});}catch(e){out.errors.push({url:link.url,error:String(e)});}}
 }catch(e){out.errors.push({url,error:String(e)});}
}
await fs.writeFile(root+'/data/cansino_brokers.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({lists:out.lists.map(x=>({url:x.url,count:x.links.length})),articles:out.articles.map(x=>({title:x.title,date:x.date,eligible:x.eligible,text:x.text.slice(0,1000)})),errors:out.errors}));
