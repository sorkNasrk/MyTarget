import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const urls=[
 ['hkex_yagi','https://www.hkex.com.hk/News/News-Release/2024/240906news?sc_lang=en'],
 ['hkex_yagi_2','https://www.hkex.com.hk/News/News-Release/2024/2409062news?sc_lang=en'],
 ['hkex_yagi_3','https://www.hkex.com.hk/News/News-Release/2024/2409063news?sc_lang=en'],
 ['hstech_page','https://www.hsi.com.hk/eng/indexes/all-indexes/hstech']
];
const results=await Promise.allSettled(urls.map(async([id,url])=>{
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});
 const body=await r.text();await fs.writeFile(path.join(root,'data/product_raw/'+id+'.html'),body);
 const text=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 return{id,url,finalURL:r.url,status:r.status,bytes:body.length,text,links:[...body.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m=>m[1]),retrievedAt:new Date().toISOString()};
}));
await fs.writeFile(path.join(root,'data/csi_calendar_evidence.json'),JSON.stringify(results,null,2));
for(const result of results)console.log(JSON.stringify(result.status==='fulfilled'?{...result.value,text:result.value.text.slice(-16000),links:result.value.links.filter(v=>/pdf|method|json|\.js/i.test(v)).slice(-30)}:result));
