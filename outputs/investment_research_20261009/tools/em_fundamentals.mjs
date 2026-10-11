import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const u=JSON.parse(await fs.readFile(new URL('data/universe.json',root),'utf8'));
const results=[];let done=0;
async function collect(issuer){
 const s=u.securities.find(s=>s.issuerId===issuer.issuerId&&s.code.endsWith('.HK'))||u.securities.find(s=>s.issuerId===issuer.issuerId);
 const hk=s.code.endsWith('.HK');
 const url=hk?`https://datacenter.eastmoney.com/securities/api/data/v1/get?reportName=RPT_HKF10_FN_MAININDICATOR&columns=ALL&filter=${encodeURIComponent(`(SECUCODE="${s.code}")`)}&pageNumber=1&pageSize=20&sortTypes=-1&sortColumns=REPORT_DATE`:`https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPT_DMSK_FN_INCOME&columns=ALL&filter=${encodeURIComponent(`(SECURITY_CODE="${s.code.split('.')[0]}")`)}&pageNumber=1&pageSize=20&sortTypes=-1&sortColumns=REPORT_DATE`;
 const r={issuerId:issuer.issuerId,name:issuer.name,symbol:s.code,url,source:'东方财富财务指标（待原始公告复核）',publicationDateVerified:false,status:'pending',reports:[]};
 try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);const json=await response.json();
 r.reports=(json.result?.data||[]).filter(x=>(x.REPORT_DATE||'').slice(0,10)<='2026-10-09'&&(!x.NOTICE_DATE||x.NOTICE_DATE.slice(0,10)<='2026-10-09'));
 r.status=r.reports.length?'available_unverified':'missing';r.latest=r.reports[0]||null;
 if(!hk&&r.latest?.NOTICE_DATE){r.publicationDateVerified=true;r.verifiedPublicationDate=r.latest.NOTICE_DATE.slice(0,10);}
 }catch(e){r.status='error';r.error=e.message;}results.push(r);done++;console.log(`${done}/${u.issuers.length} ${issuer.name} ${r.status}`);
}
const queue=[...u.issuers];await Promise.all(Array.from({length:4},async()=>{while(queue.length)await collect(queue.shift());}));
results.sort((a,b)=>a.issuerId.localeCompare(b.issuerId));
await fs.writeFile(new URL('data/em_fundamentals.json',root),JSON.stringify({asOf:'2026-10-09',fetchedAt:new Date().toISOString(),limitation:'HK indicator CURRENCY field may represent quote currency rather than financial statement currency. Do not use as statement unit or point-in-time publication verification. Current PE and shares are not historical proof.',records:results},null,2));
console.log(JSON.stringify({available:results.filter(x=>x.status==='available_unverified').length,missing:results.filter(x=>x.status!=='available_unverified').length}));
