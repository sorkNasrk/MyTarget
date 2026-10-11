import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const html=await fs.readFile(path.join(root,'data/product_raw/hstech_page.html'),'utf8');
const scripts=[...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(m=>new URL(m[1],'https://www.hsi.com.hk').href);
const records=await Promise.allSettled(scripts.map(async(url,i)=>{const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),body=await r.text();await fs.writeFile(path.join(root,'data/product_raw/hsi_script_'+i+'.js'),body);const contexts=[...body.matchAll(/.{0,120}(?:methodolog|api\/|\.json|factsheet|\.pdf|index-details|seriesCode).{0,180}/g)].map(m=>m[0]);return{url,status:r.status,bytes:body.length,contexts:contexts.slice(0,120)};}));
await fs.writeFile(path.join(root,'data/hsi_discovery.json'),JSON.stringify(records,null,2));for(const r of records)console.log(JSON.stringify(r));
