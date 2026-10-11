import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root='G:/MyTarget/outputs/investment_research_20261009';
const source=JSON.parse(await fs.readFile(path.join(root,'data/pharma_evidence.json'),'utf8'));
const first=source.companies.filter(x=>['信达生物','康方生物','药明生物','药明合联','恒瑞医药','三生制药','百济神州','翰森制药','英矽智能','晶泰控股','微创医疗','微创机器人-B','微创脑科学','药明康德'].includes(x.name));
const output=[];
for(const c of first){
 const links=c.lists.find(x=>x.category==='company-announcement')?.links.filter(x=>/中期報告|中期报告|中期業績公告|中期业绩公告|延遲刊發|延迟刊发|可換股債券|可换股债券/i.test(x.title)).slice(0,4)||[];
 const reports=[];
 for(const link of links){
  try{
   const res=await fetch(link.url,{signal:AbortSignal.timeout(45000)});if(!res.ok)throw Error('HTTP '+res.status);
   const name=c.code.split('.')[0].padStart(5,'0')+'_'+link.url.split('/').at(-1),pdf=path.join(root,'data/pharma_raw',name),txt=pdf.replace(/\.pdf$/i,'.txt');
   await fs.writeFile(pdf,Buffer.from(await res.arrayBuffer()));execFileSync('pdftotext',['-q','-layout','-enc','UTF-8',pdf,txt],{timeout:45000,stdio:'pipe'});
   const text=await fs.readFile(txt,'utf8'),d=link.url.match(/\/(202\d)(\d{2})(\d{2})\//);
   reports.push({...link,date:d?`${d[1]}-${d[2]}-${d[3]}`:null,sourceType:'issuer_disclosure_pdf_mirrored_by_aastocks',rawFile:`data/pharma_raw/${name}`,textFile:`data/pharma_raw/${path.basename(txt)}`,textLength:text.length});
   console.log(c.name+' '+link.title+' '+text.length);
  }catch(e){reports.push({...link,error:String(e)});console.log(c.name+' error '+e);}
 }
 output.push({issuerId:c.issuerId,name:c.name,code:c.code,reports});await fs.writeFile(path.join(root,'data/pharma_reports.json'),JSON.stringify(output,null,2));
}
