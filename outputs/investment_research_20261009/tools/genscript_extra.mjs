import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const urls=['https://www.sec.gov/Archives/edgar/data/1801198/000117184326003825/exh_991.htm'];
const out=[];for(const url of urls){const r=await fetch(url,{headers:{'User-Agent':'Research research@example.com'},signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(String(r.status));const html=await r.text();const text=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ').replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ').replace(/<\/(?:p|div|tr|h\d)>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n');out.push({url,text,publicationDate:'2026-06-01',sourceType:'SEC_original'});}
await fs.writeFile(root+'/data/genscript_extra.json',JSON.stringify(out,null,2));
for(const x of out)console.log(x.text);
