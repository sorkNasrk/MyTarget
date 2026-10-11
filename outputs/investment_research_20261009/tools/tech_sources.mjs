import fs from 'node:fs/promises';
import path from 'node:path';
const root='G:/MyTarget/outputs/investment_research_20261009';
const out=path.join(root,'data','tech_raw');
await fs.mkdir(out,{recursive:true});
export const clean=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
export function article(h){let i=h.indexOf('id="spanContent"');if(i<0)return null;let b=h.slice(h.indexOf('>',i)+1);let j=b.indexOf('</span> </div> <div class="clear">');if(j>=0)b=b.slice(0,j);let k=b.indexOf('<div id="newsDividendHistory"');if(k>=0)b=b.slice(0,k);return clean(b.replace(/<a\b[^>]*class=["'][^"']*(?:jsStock|jsSS)[^"']*["'][^>]*>[\s\S]*?<\/a>/g,''));}
export async function get(url,name){let r=await fetch(url,{signal:AbortSignal.timeout(30000)}); if(!r.ok) throw new Error(`${r.status} ${url}`);let h=await r.text(); if(name)await fs.writeFile(path.join(out,name+'.html'),h); return h;}
const mode=process.argv[2]||'inspect';
if(mode==='inspect'){
for(const url of ['https://www.tencent.com/en-us/investors.html','https://www.tencent.com/investors/financial-reports/']){try{let h=await get(url,'tencent_'+(url.includes('financial')?'financial':'ir')); console.log(url,h.length);console.log([...h.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]{0,220})/g)].filter(m=>/2026|2025|\.pdf|financial/i.test(m[0])).map(m=>m[0].slice(0,400)).slice(-100).join('\n'));}catch(e){console.log(String(e));}}
}
if(mode==='tencentpdf'){
const h=await get('https://www.tencent.com/investors/financial-reports/','tencent_financial');
const urls=[...new Set([...h.matchAll(/(?:href|data-src)=["']([^"']+\.pdf)["']/g)].map(m=>m[1]))];
console.log(urls.join('\n'));
for(const [name,url] of [['tencent_2026q2','https://www.tencent.com/wp-content/uploads/2026/08/Tencent-Announces-2026-Second-Quarter-Results.pdf'],['tencent_2026interim','https://www.tencent.com/wp-content/uploads/2026/08/E700_IR.pdf'],['tencent_2025annual','https://static.www.tencent.com/uploads/2026/04/09/62d786fcf3d3c8cb7e54791ee95439ac.pdf']]){let r=await fetch(url);await fs.writeFile(path.join(out,name+'.pdf'),Buffer.from(await r.arrayBuffer()));console.log(name,r.status);}
}
if(mode==='aafn'){
const universe=JSON.parse(await fs.readFile(path.join(root,'data/universe.json'),'utf8'));
const securities=universe.securities.filter(s=>s.issuerId&&Number(s.issuerId.slice(1))>=54);
const evidence={asOf:'2026-10-09',retrievedAt:new Date().toISOString(),issuers:[]};
const max=process.argv[3]?Number(process.argv[3]):securities.length;
let ix=0;
async function worker(){while(ix<Math.min(max,securities.length)){const s=securities[ix++];const code=s.code.slice(0,5);const item={...s,news:[],targets:[],financialNews:[],errors:[]};
for(const [cat,key]of [['research-report',''],['hk-stock-news','业绩'],['hk-stock-news','']]){const url=`https://www.aastocks.com/sc/stocks/analysis/stock-aafn/${code}/0/${cat}/1`+(key?'?key='+encodeURIComponent(key):'');try{let h=await get(url,code+'_'+cat+(key?'_results':''));
const blocks=[...h.matchAll(/<div ref=["']([^"']+)["']>([\s\S]*?)(?=<div ref=["']|<div class=["']clear mar20B)/g)];
for(const b of blocks){let m=b[2].match(/<a[^>]+title=["']([^"']+)["'][^>]+href=["']([^"']+)["']/),d=b[2].match(/dt:'([^']+)'/);if(!m)continue;let date=d?.[1]?.replaceAll('/','-')||null; if(date&&date.slice(0,10)>'2026-10-09')continue;if(item.news.some(n=>n.id===b[1]))continue;let n={id:b[1],title:clean(m[1]),url:new URL(m[2],'https://www.aastocks.com').href,date,category:cat};item.news.push(n);}
}catch(e){item.errors.push({url,error:String(e)})}}
for(const n of item.news.filter(n=>/目标价|目标|业绩|收入|盈利|亏损|中期|上半年|全年|财报/.test(n.title)).slice(0,15)){try{let h=await get(n.url,code+'_'+n.id.replaceAll('.','_'));n.text=article(h);if(/目标价/.test(n.title))item.targets.push(n);if(/业绩|收入|盈利|亏损|中期|上半年|全年|财报/.test(n.title))item.financialNews.push(n);}catch(e){item.errors.push({url:n.url,error:String(e)})}}
evidence.issuers.push(item);console.log(s.name,item.news.length,item.targets.length,item.financialNews.length);await fs.writeFile(path.join(root,'data/tech_evidence.json'),JSON.stringify(evidence,null,2));}}
await Promise.all(Array.from({length:5},worker));}
if(mode==='repair'){
const e=JSON.parse(await fs.readFile(path.join(root,'data/tech_evidence.json'),'utf8'));
for(const s of e.issuers){for(const n of s.news){try{let h=await fs.readFile(path.join(out,s.code.slice(0,5)+'_'+n.id.replaceAll('.','_')+'.html'),'utf8');n.text=article(h);if(/目标价/.test(n.title)){n.institution=n.title.match(/(?:《[^》]*》)?(?:大行|大行报告|大行评级)?(?:｜|：)?(高盛|摩通|大摩|摩根士丹利|摩根大通|花旗|瑞银|富瑞|里昂|汇丰|美银|德银|野村|瑞信|麦格理|杰富瑞|星展)/)?.[1]||null;n.currency='HKD';n.targetHorizon='未在公开转载中明确';n.rating=n.title.match(/(?:维持|重申|上调|下调|给予|予)?[「“"]?(买入|增持|中性|持有|跑赢大市|跑输大市|卖出|减持|与大市同步)/)?.[1]||null;n.targetPriceFromTitle=n.title.match(/(?:目标价|目标)(?:升至|降至|下调至|上调至|上调|下调|从[\d.]+\S{0,5}至|至|为|\s)*\s*([\d.]+)(?:港元|元)/)?.[1]||null;n.sourceType='新闻转述';}}catch{}}
s.targets=s.news.filter(n=>/目标价/.test(n.title)&&n.text);s.financialNews=s.news.filter(n=>/业绩|收入|盈利|亏损|中期|上半年|全年|财报/.test(n.title)&&n.text);}
await fs.writeFile(path.join(root,'data/tech_evidence.json'),JSON.stringify(e,null,2));console.log(e.issuers.length,e.issuers.reduce((a,s)=>a+s.targets.length,0));
console.log(e.issuers.filter(s=>/腾讯|阿里巴巴|小米|网易|携程|宁德|美团|中芯|MINIMAX|智谱/.test(s.name)).map(s=>({name:s.name,targets:s.targets.map(n=>({title:n.title,date:n.date,url:n.url,text:n.text})),financial:s.financialNews.map(n=>({title:n.title,date:n.date,text:n.text}))})).map(v=>JSON.stringify(v)).join('\n'));
}
if(mode==='primaryinspect'){
const urls=[['tencent_news','https://www.tencent.com/investors/investor-news/'],['alibaba','https://www.alibabagroup.com/en-US/ir-financial-reports-financial-results'],['netease','https://ir.netease.com/news-and-events/press-releases'],['meituan','https://about.meituan.com/en/investor'],['trip','https://investors.trip.com/news-and-events/news-releases'],['xiaomi','https://ir.mi.com/financial-information/interim-reports'],['catl','https://www.catl.com/en/investor/reports/'],['byd','https://www.bydglobal.com/en/investorRelations.html'],['smic','https://www.smics.com/en/site/company_financialSummary'],['popmart','https://www.popmart.com/investorRelations'],['minimax','https://www.minimaxi.com/en/investor-relations']];
await Promise.all(urls.map(async([name,url])=>{try{let h=await get(url,name+'_ir');console.log(name,url,h.length);console.log([...new Set([...h.matchAll(/(?:href|src)=["']([^"']+)["'][^>]*>([\s\S]{0,160})/g)].filter(m=>/2026|2025|\.pdf|results|report|api/i.test(m[0])).map(m=>m[0].slice(0,350)))].slice(-25).join('\n'));}catch(e){console.log(name,String(e))}}));}
if(mode==='primaryfetch'){
const pages=[['tencent_results','https://www.tencent.com/investors/results/'],['alibaba_quarter','https://www.alibabagroup.com/en-US/ir-financial-reports-quarterly-results'],['netease','https://ir.netease.com/'],['trip','https://investors.trip.com/'],['xiaomi','https://ir.mi.com/'],['meituan','https://about.meituan.com/en-EN/investor']];
for(const[name,url]of pages){try{let h=await get(url,name+'_root');console.log(name,h.length,[...new Set([...h.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]{0,150})/g)].filter(m=>/2026|2025|\.pdf|results|news|reports|financial/i.test(m[0])).map(m=>m[0].slice(0,300)))].slice(0,60).join('\n'));}catch(e){console.log(name,String(e));}}
for(const[name,url]of [['tencent_2025release','https://static.www.tencent.com/uploads/2026/03/18/e6a646796d0d869acc76271c9ee1a6a5.pdf'],['smic_2026q2','https://smic.cdn.shwebspace.com/uploads/6a7d7c4f/ER_EN.pdf'],['smic_2026interim','https://smic.cdn.shwebspace.com/uploads/6a9a8a01/AR_EN.pdf']]){try{let r=await fetch(url);await fs.writeFile(path.join(out,name+'.pdf'),Buffer.from(await r.arrayBuffer()));console.log(name,r.status)}catch(e){console.log(name,String(e));}}
}
if(mode==='download2'){
const urls=[['tencent_2026q1','https://static.www.tencent.com/uploads/2026/05/13/47382ae415a209fd161bc19a1f9b3704.pdf'],['netease_2026q2','https://ir.netease.com/static-files/6848caa4-627a-474c-9fce-934334ba3976'],['trip_2026q2','https://investors.trip.com/static-files/2f337a9d-0a49-4c46-8764-bce15cc9e3f0'],['xiaomi_2026q2','https://ir.mi.com/static-files/4a85fc36-8a6d-4c24-b45b-b18d5d162e6c']];
for(const[name,url]of urls){try{let r=await fetch(url);await fs.writeFile(path.join(out,name+'.pdf'),Buffer.from(await r.arrayBuffer()));console.log(name,r.status)}catch(e){console.log(name,String(e));}}
for(const[name,url]of [['alibaba_2026q1','https://www.alibabagroup.com/en-US/document-2026456290057781248'],['meituan_root','https://about.meituan.com/'],['byd_report','https://www.bydglobal.com/cn/investor-relations'],['popmart_root','https://ir.popmart.com/']]){try{let h=await get(url,name);console.log(name,h.length,clean(h).slice(-5000));console.log([...h.matchAll(/href=["']([^"']+\.pdf)["']/g)].map(m=>m[1]).join('\n'));}catch(e){console.log(name,String(e))}}
}
if(mode==='extra'){
for(const[name,url]of [['alibaba_2026q1','https://data.alibabagroup.com/ecms-files/1532295521/fa5d65fc-9b3e-4e82-a8fc-4ce1c3e2c407/Alibaba%20Group%20Announces%20June%20Quarter%202026%20Results.pdf']]){let r=await fetch(url);await fs.writeFile(path.join(out,name+'.pdf'),Buffer.from(await r.arrayBuffer()));console.log(name,r.status)}
const e=JSON.parse(await fs.readFile(path.join(root,'data/tech_evidence.json'),'utf8'));
const s=e.issuers.find(s=>s.code==='00700.HK');for(const [id,date,title]of [['NOW.1544986','2026-09-17 10:57','《大行》高盛：中国互联网年底前偏好游戏及娱乐 降腾讯阿里目标价'],['GLH2702288L','2026-10-09 07:35','富瑞：将腾讯目标价降至711港元 维持“买入”评级']]){let url=`https://www.aastocks.com/sc/stocks/analysis/stock-aafn-con/00700/${id.startsWith('NOW')?'AAFN':'GLH'}/${id}/hk-stock-news`;let h=await get(url,'00700_'+id.replaceAll('.','_'));s.news.push({id,date,title,url,text:article(h),sourceType:'新闻转述'});}
await fs.writeFile(path.join(root,'data/tech_evidence.json'),JSON.stringify(e,null,2));
for(const n of s.news.slice(-2))console.log(JSON.stringify(n));
}
if(mode==='netease'){
let h=await get('https://ir.netease.com/financial-information/quarterly-results','netease_quarterly');console.log([...h.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]{0,180})/g)].filter(m=>/2025|2026|2024|Annual|Results|Earnings/i.test(m[0])).map(m=>m[0].slice(0,350)).join('\n'));
}
if(mode==='brokers'){
const e=JSON.parse(await fs.readFile(path.join(root,'data/tech_evidence.json'),'utf8'));
const verified=JSON.parse(await fs.readFile(path.join(root,'data/tech_broker_verified.json'),'utf8'));
const specs=[
['I056','汇丰研究',136.5,'持有','NOW.1539885'],['I056','美银证券',153,'中性','NOW.1539857'],['I056','摩根士丹利',203,'增持','NOW.1539842'],['I056','富瑞',146,'持有','NOW.1539829'],['I056','摩根大通',120,'减持','NOW.1539806'],
['I061','大华继显',150,'买入','NOW.1547727'],['I061','里昂',120,'高度确信跑赢大市','NOW.1546646'],['I061','摩根士丹利',114,'增持','NOW.1544829'],
['I063','里昂',670,'高度确信跑赢大市','NOW.1548483'],
['I075','富瑞',186,'买入','NOW.1548528'],['I075','高盛',172,'买入','NOW.1544986','12个月'],['I075','大华继显',188,'买入','NOW.1547727'],
['I077','高盛',536,'买入','NOW.1545319'],['I077','大华继显',508,'买入','NOW.1547727'],
['I078','摩根士丹利',110,'增持','NOW.1542154'],['I078','花旗',120,'买入','NOW.1542098'],['I078','里昂',115,'跑赢大市','NOW.1542097'],['I078','野村',118,'买入','NOW.1542087'],['I078','麦格理',107,'跑赢大市','NOW.1542039'],['I078','摩根大通',100,'增持','NOW.1542038'],['I078','高盛',123,'买入','NOW.1537376'],
['I087','花旗',34,'买入','NOW.1547472'],['I087','汇丰研究',33.2,'买入','NOW.1547181'],
['I092','星展',96,'买入','NOW.1539222'],['I092','花旗',100,'买入','NOW.1538751'],['I092','摩根大通',78,'中性','NOW.1538713'],['I092','大和',40,'沽售','NOW.1538613'],['I092','高盛',153,'买入','NOW.1538600'],['I092','里昂',97.5,'跑赢大市','NOW.1538577'],
['I071','花旗',175,'买入','NOW.1538751'],
['I084','摩根士丹利',68.5,'增持','NOW.1544829'],['I085','摩根士丹利',70,'增持','NOW.1544829'],['I088','摩根士丹利',68.5,'增持','NOW.1544829'],
['I059','摩根大通',74,'中性','NOW.1546879','2027年12月'],
];
for(const[issuerId,institution,targetPrice,rating,id,horizon]of specs){let s=e.issuers.find(s=>s.issuerId===issuerId);let n=s?.news.find(n=>n.id===id&&n.text);if(!n){n=e.issuers.flatMap(s=>s.news).find(n=>n.id===id&&n.text);if(!n){console.log('MISSING',issuerId,id);continue;}}if(!n.text.includes(String(targetPrice))&&!(targetPrice===153&&n.text.includes('153元'))){console.log('PRICE MISMATCH',issuerId,id);continue;}
if(verified.records.some(r=>r.issuerId===issuerId&&r.institution===institution))continue;
verified.records.push({issuerId,code:s.code,name:s.name,institution,targetPrice,currency:'HKD',publicationDate:n.date.slice(0,10),targetHorizon:horizon||null,rating,sourceURL:n.url,sourceType:'公开新闻转述，主体及新目标已人工核对',verified:true,institutionOwnership:'外资',notes:issuerId==='I092'&&institution==='大和'?'原文业绩及Q3毛利指引与公司主源冲突；仅保留明确目标和评级，不用转述经营数字':null});}
await fs.writeFile(path.join(root,'data/tech_broker_verified.json'),JSON.stringify(verified,null,2));console.log('Verified target records',verified.records.length);
}
