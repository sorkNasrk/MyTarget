import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'data/product_raw');
const items=[
 ['cni_rules','https://www.cnindex.com.cn/docs/gz_987018.pdf'],
 ['cni_fact','https://www.cnindex.com.cn/docs/jj_987018.pdf'],
 ['cni_identity','https://www.cnindex.com.cn/index/selectIndexByCode?codeValue=987018'],
 ['cni_history','https://hq.cnindex.com.cn/market/market/getIndexDailyData?indexCode=987018&startDate=2023-10-09&endDate=2026-10-09']
];
for(const code of ['159502','513290']){
 const notices=JSON.parse(await fs.readFile(path.join(dir,'em_notices_'+code+'.html'),'utf8')).Data;
 const selected=notices.filter(n=>n.PUBLISHDATEDesc<='2026-10-09'&&/2026年中期报告|更新招募说明书/.test(n.TITLE)).slice(0,2).concat(notices.filter(n=>n.PUBLISHDATEDesc<='2026-10-09'&&/溢价风险/.test(n.TITLE)).slice(0,2));
 for(const n of selected)items.push([code+'_'+n.ID,'https://pdf.dfcfw.com/pdf/H2_'+n.ID+'_1.pdf',n]);
}
const records=await Promise.all(items.map(async([id,url,meta])=>{
 try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});const bytes=Buffer.from(await r.arrayBuffer());const ext=bytes.subarray(0,4).toString()==='%PDF'?'.pdf':'.txt';await fs.writeFile(path.join(dir,id+ext),bytes);return{id,url,status:r.status,bytes:bytes.length,file:'data/product_raw/'+id+ext,...meta};}catch(e){return{id,url,error:String(e)};}
}));
await fs.writeFile(path.join(root,'data/product_primary_sources.json'),JSON.stringify(records,null,2));
records.forEach(r=>console.log(JSON.stringify(r)));
