import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const url='https://www.sec.gov/Archives/edgar/data/1801198/000180119826000008/legn-20251231.htm';
const r=await fetch(url,{headers:{'User-Agent':'Research research@example.com'},signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(String(r.status));const html=await r.text();
const text=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ').replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ').replace(/<\/(?:p|div|tr|h\d)>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n');
await fs.writeFile(root+'/data/legend_annual_source.json',JSON.stringify({url,text,publicationDate:'2026-03-10',period:'FY2025',sourceType:'SEC_original'},null,2));
for(const re of [/50\s*%/ig,/70\s*%/ig,/30\s*%/ig,/profits and losses/ig,/profit and loss/ig,/financially responsible/ig,/sharing/ig]){let m,n=0;while((m=re.exec(text))&&n++<5)console.log(text.slice(Math.max(0,m.index-160),m.index+900));}
