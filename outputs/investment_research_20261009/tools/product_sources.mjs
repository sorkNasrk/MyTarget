import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'data/product_raw');await fs.mkdir(dir,{recursive:true});
const items=[
 ['csop_3442','https://www.csopasset.com/tc/products/hk-chsu'],
 ['csop_7709','https://www.csopasset.com/tc/products/hk-skhy-2l'],
 ['harvest_159502','https://www.jsfund.cn/main/fundproduct/159502/index.shtml'],
 ['fullgoal_513290','https://www.99fund.com/main/products/pofund/513290/funddetail.shtml'],
 ['em_nav_159502','https://api.fund.eastmoney.com/f10/lsjz?fundCode=159502&pageIndex=1&pageSize=40&startDate=2026-09-01&endDate=2026-10-09'],
 ['em_nav_513290','https://api.fund.eastmoney.com/f10/lsjz?fundCode=513290&pageIndex=1&pageSize=40&startDate=2026-09-01&endDate=2026-10-09'],
 ['hstech','https://www.hsi.com.hk/eng/indexes/all-indexes/hstech'],
 ['cni_987018','https://www.cnindex.com.cn/module/index-detail.html?act_menu=1&indexCode=987018'],
 ['csi_931787','https://www.csindex.com.cn/#/indices/family/detail?indexCode=931787']
];
for(const code of ['159502','513290'])for(const page of ['jbgk','jjgg','ccmx','jdzf','fhsp'])items.push([page+'_'+code,`https://fundf10.eastmoney.com/${page}_${code}.html`]);
items.push(['cni_js','https://www.cnindex.com.cn/js/pages/entry-index-detail.js']);
items.push(['csop_en_3442','https://www.csopasset.com/en/products/hk-chsu']);
items.push(['csop_en_7709','https://www.csopasset.com/en/products/hk-skhy-2l']);
const output=[];for(const [id,url] of items){let record={id,url,retrieved:new Date().toISOString(),asOf:'2026-10-09',status:null,publicationDate:null};try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://fundf10.eastmoney.com/'},signal:AbortSignal.timeout(25000)});record.status=r.status;const body=await r.text();await fs.writeFile(path.join(dir,id+'.html'),body);record.length=body.length;record.localFile='data/product_raw/'+id+'.html';record.links=[...body.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(x=>x[1]).filter(x=>/pdf|2026|csv|json|factsheet|KFS/i.test(x)).slice(0,60);record.text=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,45000);if(id.startsWith('em_nav')){try{record.nav=JSON.parse(body).Data?.LSJZList??null;record.pointInTimeWarning='净值日期并非公布日期；10/8净值可在10/9收盘后公开，缺发布时间，不允许断言基准日已知溢价。';}catch{}}}catch(e){record.error=String(e);}output.push(record);console.log(id,record.status,record.length??record.error);}
await fs.writeFile(path.join(root,'data/product_sources.json'),JSON.stringify({asOf:'2026-10-09',records:output},null,2));
