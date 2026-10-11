import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const x=await (await fetch('https://data.sec.gov/submissions/CIK0001817229.json',{signal:AbortSignal.timeout(30000)})).json();
const a=x.filings.recent;
const f=a.form.map((form,i)=>({form,acc:a.accessionNumber[i],date:a.filingDate[i],report:a.reportDate[i],doc:a.primaryDocument[i]})).filter(v=>['10-Q','10-K','8-K'].includes(v.form)&&v.date>='2026-07-01'&&v.date<='2026-10-09');
await fs.writeFile(root+'/data/vor_sec_discovery.json',JSON.stringify(f,null,2));console.log(JSON.stringify(f));
