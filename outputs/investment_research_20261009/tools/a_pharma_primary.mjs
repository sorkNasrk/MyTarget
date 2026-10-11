import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const name=process.argv[2]||'迈瑞医疗';
const types=process.argv[3]??'category_bndbg_szsh';
const start=process.argv[4]||'2026-01-01';
const end=process.argv[5]||'2026-10-09';
const query='https://www.cninfo.com.cn/new/hisAnnouncement/query';
const post=new URLSearchParams({pageNum:'1',pageSize:'30',column:'szse',tabName:'fulltext',searchkey:name,category:types,seDate:`${start}~${end}`,isHLtitle:'true',sortName:'time',sortType:'desc'});
const r=await fetch(query,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0','Referer':'https://www.cninfo.com.cn'},body:post,signal:AbortSignal.timeout(30000)});
if(!r.ok)throw Error('HTTP '+r.status);
const j=await r.json();const records=[];
await fs.mkdir(new URL('data/a_pharma_raw/',root),{recursive:true});
for(const a of j.announcements||[]){
 const title=a.announcementTitle.replace(/<[^>]*>/g,'');
 if(/摘要|英文/.test(title))continue;
 const url='https://static.cninfo.com.cn/'+a.adjunctUrl;
 const rawFile=`data/a_pharma_raw/${a.secCode}_${a.announcementId}.PDF`;
 try{await fs.access(new URL(rawFile,root));}catch{const pdf=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(45000)});if(!pdf.ok)throw Error('PDFHTTP '+pdf.status);await fs.writeFile(new URL(rawFile,root),new Uint8Array(await pdf.arrayBuffer()));}
 records.push({name,code:a.secCode,title,publicationDate:a.adjunctUrl.split('/')[1],url,rawFile,noticeTimestamp:a.announcementTime,query});
}
await fs.writeFile(new URL(`data/a_pharma_raw/${records[0]?.code||'none'}_${types}_sources.json`,root),JSON.stringify(records,null,2));
console.log(JSON.stringify(records,null,2));
