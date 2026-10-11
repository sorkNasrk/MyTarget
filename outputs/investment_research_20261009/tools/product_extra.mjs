import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'data/product_raw');
const items=[
 ['cni_app','https://www.cnindex.com.cn/js/app/index-detail.js'],
 ['cni_common','https://www.cnindex.com.cn/js/common.js'],
 ['em_notices_159502','https://api.fund.eastmoney.com/f10/JJGG?fundcode=159502&pageIndex=1&pageSize=100&type=0'],
 ['em_notices_513290','https://api.fund.eastmoney.com/f10/JJGG?fundcode=513290&pageIndex=1&pageSize=100&type=0'],
 ['em_basic_513290','https://fundf10.eastmoney.com/jbgk_513290.html?research=20261009'],
 ['csop_search_3442','https://www.aastocks.com/sc/ltp/rtquote.aspx?symbol=03442'],
 ['csop_search_7709','https://www.aastocks.com/sc/ltp/rtquote.aspx?symbol=07709'],
 ['search_3442','https://www.bing.com/search?q='+encodeURIComponent('3442 CSOP Hang Seng HK US technology ETF factsheet pdf')],
 ['search_7709','https://www.bing.com/search?q='+encodeURIComponent('7709 CSOP SK hynix August 3 2026 flexible leverage pdf')],
 ['search_513290','https://www.bing.com/search?q='+encodeURIComponent('汇添富纳斯达克生物科技ETF 513290 2026 中期报告 pdf')],
 ['search_159502','https://www.bing.com/search?q='+encodeURIComponent('嘉实标普生物科技 159502 2026 中期报告 pdf')]
];
const results=await Promise.allSettled(items.map(async([id,url])=>{
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://fundf10.eastmoney.com/'},signal:AbortSignal.timeout(25000)});
 const buffer=Buffer.from(await r.arrayBuffer());let text=buffer.toString('utf8');if(text.includes('charset=gb'))text=new TextDecoder('gb18030').decode(buffer);
 await fs.writeFile(path.join(dir,id+'.html'),text);
 const links=[...text.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(m=>m[1]).filter(x=>/pdf|js\/|99fund|jsfund|csop|hkex/i.test(x));
 return {id,url,status:r.status,length:text.length,links,text:text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,20000)};
}));
await fs.writeFile(path.join(root,'data/product_extra_sources.json'),JSON.stringify(results,null,2));
for(let i=0;i<results.length;i++){const r=results[i];console.log(JSON.stringify({id:items[i][0],...(r.status==='fulfilled'?{status:r.value.status,length:r.value.length,links:r.value.links.slice(0,15),tail:r.value.text.slice(-1800)}:{error:String(r.reason)})}));}
