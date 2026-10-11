import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),urls=[
'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13071078/fullTextXML',
'https://www.hinovapharma.com/news.html',
'https://www.hinovapharma.com/news',
'https://www.hinovapharma.com/zh/news'
];
const out=await Promise.all(urls.map(async url=>{try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)}),html=await r.text();return{url,status:r.status,text:html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,140000),links:[...html.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]).slice(0,240)};}catch(e){return{url,error:String(e)};}}));
await fs.writeFile(new URL('data/hinova_clinical_checks.json',root),JSON.stringify(out,null,2));for(const x of out)console.log(JSON.stringify({...x,text:x.text?.slice(0,22000)},null,2));
