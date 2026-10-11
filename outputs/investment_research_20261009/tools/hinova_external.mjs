import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),urls=[
'https://www.hinovapharma.com',
'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=HC-1119%20AND%20FIRST_PDATE%3A%5B2026-01-01%20TO%202026-10-09%5D&format=json&pageSize=30',
'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=%22deutenzalutamide%22%20AND%20FIRST_PDATE%3A%5B2026-01-01%20TO%202026-10-09%5D&format=json&pageSize=30'
];
const out=await Promise.all(urls.map(async url=>{try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)}),html=await r.text();return{url,status:r.status,text:html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,42000),links:[...html.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]).slice(0,140)};}catch(e){return{url,error:String(e)};}}));
await fs.writeFile(new URL('data/hinova_external_checks.json',root),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
