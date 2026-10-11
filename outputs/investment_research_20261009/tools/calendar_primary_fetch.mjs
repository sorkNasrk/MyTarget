import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const seeds=[
 ['hkex_hours','https://www.hkex.com.hk/Services/Trading-hours-and-Severe-Weather-Arrangements/Trading-Hours/Securities-Market?sc_lang=en'],
 ['hkex_derivatives_calendar','https://www.hkex.com.hk/Services/Trading/Derivatives/Overview/Trading-Calendar-and-Holiday-Schedule?sc_lang=en'],
 ['hk_gov_2026','https://www.gov.hk/en/about/abouthk/holiday/2026.htm'],
 ['hk_gov_2027','https://www.gov.hk/en/about/abouthk/holiday/2027.htm'],
 ['sse_holidays','https://www.sse.com.cn/services/tradingservice/tradingcalendar/'],
 ['szse_holidays','https://www.szse.cn/marketServices/deal/tradeCalender/index.html']
];
const rows=await Promise.all(seeds.map(async([id,url])=>{const out={id,url,retrievedAt:new Date().toISOString(),publicationDate:null};try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});out.status=r.status;out.finalURL=r.url;const raw=await r.text();const file='data/calendar_raw/'+id+'.html';await fs.writeFile(path.join(root,file),raw);out.file=file;out.bytes=raw.length;out.text=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,22000);out.links=[...raw.matchAll(/(?:href|src)=['"]([^'"]+)['"]/g)].map(x=>x[1]).filter(x=>/holiday|calendar|calend|2026|2027/i.test(x));}catch(e){out.error=String(e);}return out;}));
await fs.writeFile(path.join(root,'data/calendar_primary_discovery.json'),JSON.stringify(rows,null,2));
for(const r of rows)console.log(JSON.stringify({id:r.id,status:r.status,bytes:r.bytes,text:r.text?.slice(-3500),links:r.links,error:r.error}));
