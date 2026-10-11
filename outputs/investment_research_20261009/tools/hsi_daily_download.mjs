import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),base='https://www.hsi.com.hk';
const raw=JSON.parse(await fs.readFile(new URL('data/product_raw/hsi_daily_reports.json',root),'utf8'));
const series=raw.find(x=>x.seriesCode==='hstech');
const files=series.reportList.flatMap(r=>r.reportDate.filter(d=>d.date==='2026-10-09').map(d=>({...d,reportType:r.reportType})));
const records=await Promise.all(files.map(async f=>{
 const url=base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/content/gcs/download?resource='+encodeURIComponent(f.url),r=await fetch(url,{signal:AbortSignal.timeout(25000)}),buf=Buffer.from(await r.arrayBuffer()),pdf=buf.subarray(0,5).toString()==='%PDF-';
 const file='data/product_raw/hsi_20261009_'+f.reportType+(pdf?'.pdf':'.txt');await fs.writeFile(new URL(file,root),buf);
 return{...f,url,status:r.status,file,bytes:buf.length,pdf};
}));
await fs.writeFile(new URL('data/hsi_daily_download.json',root),JSON.stringify(records,null,2));console.log(JSON.stringify(records));
