import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const urls=['https://ir.discmedicine.com/news-releases/news-release-details/disc-medicine-presents-initial-results-restore-pv-phase-2-trial'];
const rows=[];
for(const url of urls){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});const html=await r.text();const t=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');rows.push({url,status:r.status,retrievedAt:new Date().toISOString(),text:t,links:[...html.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]).filter(x=>/pdf|static-files/i.test(x)).slice(0,30)});}catch(e){rows.push({url,error:String(e)});}}
await fs.writeFile(new URL('data/mabwell_disc_primary.json',root),JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
