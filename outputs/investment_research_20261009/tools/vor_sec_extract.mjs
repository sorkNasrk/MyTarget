import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const url='https://www.sec.gov/Archives/edgar/data/1817229/000119312526343607/vor-20260630.htm';
const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);const html=await r.text(),text=html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#160;|&nbsp;/g,' ').replace(/&#8217;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
await fs.writeFile(root+'/data/vor_sec_source.json',JSON.stringify({url,publicationDate:'2026-08-11',period:'2026H1',sourceType:'SEC_filing_primary',text},null,2));
for(const q of ['split','RemeGen','Pre-Funded','pre-funded','320,','800,','June 30, 2026','4.105','royalt']){let n=0;for(const m of text.matchAll(new RegExp(q,'gi'))){if(n++>5)break;console.log(q+': '+text.slice(Math.max(0,m.index-180),m.index+1000));}}
