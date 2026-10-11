import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const u=JSON.parse(await fs.readFile(new URL('data/universe.json',root),'utf8'));
const records=[];
for(let i=0;i<u.securities.length;i+=25){
 const batch=u.securities.slice(i,i+25).filter(x=>x.type!=='指数');
 const symbols=batch.map(s=>s.code.endsWith('.HK')?'rt_hk'+s.code.split('.')[0]:s.code.endsWith('.SH')?'sh'+s.code.split('.')[0]:'sz'+s.code.split('.')[0]);
 const url='https://hq.sinajs.cn/list='+symbols.join(',');
 try{const response=await fetch(url,{headers:{Referer:'https://finance.sina.com.cn/'},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);
 const text=new TextDecoder('gb18030').decode(await response.arrayBuffer());
 for(let j=0;j<batch.length;j++){
 const match=text.match(new RegExp('var hq_str_'+symbols[j]+'="([^"]*)"'));
 const f=match?.[1]?.split(',')||[];const hk=batch[j].code.endsWith('.HK');
 records.push({securityId:batch[j].securityId,code:batch[j].code,url,rawFields:f,date:hk?f[17]?.replaceAll('/','-'):f[30],close:Number(hk?f[6]:f[3])||null,volumeShares:Number(hk?f[12]:f[8])||null,turnoverAmount:Number(hk?f[11]:f[9])||null,status:f.length?'available':'missing'});
 }
 }catch(e){for(const s of batch)records.push({securityId:s.securityId,code:s.code,url,status:'error',error:e.message});}
}
await fs.writeFile(new URL('data/sina_quotes.json',root),JSON.stringify({asOf:'2026-10-09',fetchedAt:new Date().toISOString(),records},null,2));
console.log(JSON.stringify({total:records.length,available:records.filter(x=>x.status==='available').length,current:records.filter(x=>x.date==='2026-10-09').length}));
