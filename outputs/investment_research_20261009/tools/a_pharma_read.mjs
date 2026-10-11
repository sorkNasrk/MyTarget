import fs from 'node:fs';
const base='G:/MyTarget/outputs/investment_research_20261009/data/a_pharma_raw/';
const file=process.argv[2];
const text=fs.readFileSync(base+file,'utf8');
const pages=text.split(/\[PDF PAGE (\d+)\]/);
const wanted=process.argv.slice(3).map(Number);
for(let i=1;i<pages.length;i+=2)if(wanted.includes(Number(pages[i])))console.log(`PDF PAGE ${pages[i]}\n${pages[i+1]}`);
