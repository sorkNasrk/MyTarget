import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'data/product_raw');
const html=await fs.readFile(path.join(dir,'csi_931787.html'),'utf8');
const scripts=[...html.matchAll(/(?:src|href)="(\/static\/js\/app\.[^"]+\.js)"/g)].map(x=>x[1]);
for(const urlPath of [...new Set(scripts)]){
 const url='https://www.csindex.com.cn'+urlPath,r=await fetch(url,{signal:AbortSignal.timeout(25000)}),text=await r.text();
 await fs.writeFile(path.join(dir,'csi_main.js'),text);
 const paths=[...text.matchAll(/['"]([^'"\s]*(?:perf|indexInfo|index-detail|indexDetail|detail)[^'"\s]*)['"]/g)].map(x=>x[1]).filter(x=>x.length<300);
 await fs.writeFile(path.join(root,'data/csi_api_discovery.json'),JSON.stringify({url,status:r.status,bytes:text.length,paths:[...new Set(paths)]},null,2));
 console.log(JSON.stringify({status:r.status,bytes:text.length,paths:[...new Set(paths)].slice(0,160)}));
}
