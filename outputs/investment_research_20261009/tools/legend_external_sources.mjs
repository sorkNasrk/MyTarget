import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const urls=['https://www.sec.gov/Archives/edgar/data/1801198/000180119826000022/0001801198-26-000022-index.html','https://investors.legendbiotech.com/press-releases','https://investors.legendbiotech.com/news-releases'];
const out=[];for(const url of urls){try{const r=await fetch(url,{headers:{'User-Agent':'Research contact research@example.com'},signal:AbortSignal.timeout(45000)});const html=await r.text();if(!r.ok){console.log(r.status+' '+url);continue;}const links=[...html.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);out.push({url,html,links});console.log(JSON.stringify({url,len:html.length,links:links.filter(x=>/2026|clinical|quarter|first|2501|2102|.htm|.pdf/i.test(x)).slice(0,100)}));}catch(e){console.log(e.message);}}
await fs.writeFile(root+'/data/legend_discovery.json',JSON.stringify(out,null,2));
