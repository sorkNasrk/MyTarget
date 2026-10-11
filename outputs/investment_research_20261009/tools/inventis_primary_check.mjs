import fs from 'node:fs/promises';
const prev=JSON.parse(await fs.readFile(new URL('../data/inventis_primary_checks.json',import.meta.url),'utf8'));
const urls=[...new Set(prev[0].links.filter(x=>x.includes('/2026/08/11/')||x.includes('/2025/12/24/')))];
const root=new URL('../',import.meta.url),out=[];
for(const url of urls){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});if(url.endsWith('.pdf')){const bytes=new Uint8Array(await r.arrayBuffer());if(r.ok)await fs.writeFile(new URL('data/a_pharma_raw/inventis_20260821_hkex.pdf',root),bytes);out.push({url,status:r.status,bytes:bytes.length});}else{const html=await r.text(),text=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');out.push({url,status:r.status,text:text.slice(0,16000),links:[...html.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]).slice(0,100)});}}catch(e){out.push({url,error:String(e)});}}
await fs.writeFile(new URL('data/inventis_clinical_news.json',root),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
