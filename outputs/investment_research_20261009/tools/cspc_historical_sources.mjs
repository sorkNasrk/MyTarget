import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const html=await fs.readFile(root+'/data/pharma_raw/01093_company-announcement.html','utf8');let param;
for(const m of html.matchAll(/var param = (\{[^;]+\});/g)){try{let p=JSON.parse(m[1]);if(p.cat&&p.newsid)param=p;}catch{}}
const out=[];
for(let n=0;n<24&&param;n++){
 const url='https://www.aastocks.com/tc/resources/datafeed/getmorenews.ashx?'+new URLSearchParams(param);
 const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);const a=await r.json();if(!a.length)break;
 for(const x of a)if(x.t==='2'&&/年度報告|年報|阿斯利康|重大合作|YS2302018|戰略合作/i.test(x.h)){
  const link='https://iis.aastocks.com'+x.u,name='01093_'+x.u.split('/').at(-1),file=root+'/data/pharma_raw/'+name;
  const rr=await fetch(link,{signal:AbortSignal.timeout(45000)});if(!rr.ok){console.log('unavailable '+rr.status+' '+link);continue;}await fs.writeFile(file,Buffer.from(await rr.arrayBuffer()));
  execFileSync('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[root+'/tools/extract_one_pdf.py',file]);
  const text=await fs.readFile(file.replace(/\.PDF$/i,'.pdfium.txt'),'utf8');out.push({url:link,title:x.h,date:x.dt,rawFile:'data/pharma_raw/'+name,text,sourceType:'issuer_disclosure_primary_mirrored'});await fs.writeFile(root+'/data/cspc_historical_sources.json',JSON.stringify(out,null,2));console.log(x.dt+' '+x.h+' '+text.length);
 }
 const last=a.at(-1);param.newsid=last.id;param.newstime=last.dtd;if(last.dt<'2025/05/01')break;
}
await fs.writeFile(root+'/data/cspc_historical_sources.json',JSON.stringify(out,null,2));
