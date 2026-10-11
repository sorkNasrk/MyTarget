import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const d=JSON.parse(await fs.readFile(root+'/data/remegen_external_discovery.json','utf8'));
const urls=[...new Set(d.flatMap(x=>x.links||[]).filter(x=>/news-release-details/.test(x.url)).map(x=>x.url))];
const out=[];for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const html=await r.text(),t=html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();const date=html.match(/<time[^>]*>([^<]+)<\/time>/)?.[1]||html.match(/datetime="([^"]+)"/)?.[1]||t.match(/(?:January|February|March|April|May|June|July|August|September|October) \d{1,2},? 2026/)?.[0];out.push({url,status:r.status,date,text:t});console.log(JSON.stringify({url,date,text:t.slice(t.search(/PDF Version/),t.search(/PDF Version/)+9000)}));}
await fs.writeFile(root+'/data/remegen_partner_sources.json',JSON.stringify(out,null,2));
