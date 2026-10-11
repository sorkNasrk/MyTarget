import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root = 'G:/MyTarget/outputs/investment_research_20261009';
const cutoff = '2026-10-09';
const rawDir = path.join(root, 'data/pharma_raw');
await fs.mkdir(rawDir, {recursive: true});
const universe = JSON.parse(await fs.readFile(path.join(root, 'data/universe.json'), 'utf8'));
const priority = ['信达生物','康方生物','药明生物','药明合联','恒瑞医药','三生制药','百济神州','翰森制药','英矽智能','晶泰控股'];
const securities = universe.securities.filter((s,i) => s.type === '股票' && (i < 60 || s.code === '1763.HK'));
const hk = securities.filter(s=>s.code.endsWith('.HK')).sort((a,b)=>(priority.indexOf(a.name)<0?99:priority.indexOf(a.name))-(priority.indexOf(b.name)<0?99:priority.indexOf(b.name)));
function clean(html) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim(); }
async function fetchText(url) { const res=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}}); if(!res.ok) throw Error(`HTTP ${res.status}`); return await res.text(); }
function listLinks(html) {
  const links=[]; const found=new Set();
  for(const m of html.matchAll(/<a\b([^>]+)>[\s\S]*?<\/a>/gi)) {
    const href=m[1].match(/href=["']([^"']+)["']/i)?.[1];
    const title=m[1].match(/title=["']([^"']+)["']/i)?.[1];
    if(href && /stock-aafn-con|iis\.aastocks\.com|newsdetail/i.test(href) && title && !found.has(href)) {found.add(href);links.push({url:new URL(href,'https://www.aastocks.com').href,title:clean(title)});}
  }
  return links;
}
function extractArticle(html) {
  const date = html.match(/data-nt=["'](\d{12})["']/)?.[1];
  const dt = date ? `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)} ${date.slice(8,10)}:${date.slice(10,12)}` : (html.match(/(?:發布|發放|發佈|公佈)?時間[^0-9]{0,60}(202[0-9][-/][01][0-9][-/][0-3][0-9][^<]{0,30})/)?.[1]||null);
  const start=html.search(/<div[^>]+id=["']spanContent["']/i);
  const end=start>=0?html.indexOf('</p>',start):-1;
  let body = clean(start>=0?html.slice(start,end>=0?end+4:start+22000):html);
  const title=clean(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
  const marker=body.indexOf(title.split('新聞')[0].trim());
  if(marker>=0 && marker>1000) body=body.slice(marker);
  return {date:dt,title,text:body.slice(0,18000)};
}
let evidence={asOf:cutoff,collectedAt:new Date().toISOString(),method:'公開財經轉述；財報原文另核驗。所有發布日期晚於截止日的材料排除。',companies:[],errors:[]};
if(process.argv.includes('--resume') || process.argv.includes('--reports') || process.argv.includes('--expand')) evidence=JSON.parse(await fs.readFile(path.join(root,'data/pharma_evidence.json'),'utf8'));
async function collect(s) {
  const symbol=s.code.split('.')[0].padStart(5,'0');
  const company={issuerId:s.issuerId,name:s.name,code:s.code,currency:s.currency,lists:[],articles:[],financials:[],brokerTargets:[]};
  for(const category of ['research-report','result-announcement','company-announcement']) {
    const url=`https://www.aastocks.com/tc/stocks/analysis/stock-aafn/${symbol}/0/${category}/1`;
    try {
      const html=await fetchText(url);await fs.writeFile(path.join(rawDir,`${symbol}_${category}.html`),html);
      const links=listLinks(html); company.lists.push({category,url,count:links.length,links});
      const take=category==='research-report'?links.slice(0,8):category==='result-announcement'?links.slice(0,4):links.filter(x=>/中期|年度|年報|年报|業績|业绩|INTERIM|ANNUAL|RESULT/i.test(x.title)).slice(0,5);
      for(const link of take) {
        try {
          const articleHtml=await fetchText(link.url); const article=extractArticle(articleHtml);
          const id=link.url.match(/(?:NOW\.|GLH|IC)[a-zA-Z0-9]+/)?.[0]||`${symbol}_${category}_${company.articles.length}`;
          await fs.writeFile(path.join(rawDir,`${symbol}_${id}.html`),articleHtml);
          company.articles.push({...link,...article,category,sourceType:'financial_news_secondary',eligible:article.date?article.date.slice(0,10)<=cutoff:null,rawFile:`data/pharma_raw/${symbol}_${id}.html`});
        } catch(error) {evidence.errors.push({code:s.code,url:link.url,error:String(error)});}
      }
    }catch(error){evidence.errors.push({code:s.code,url,error:String(error)});}
  }
  evidence.companies.push(company);
  await fs.writeFile(path.join(root,'data/pharma_evidence.json'),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify({name:s.name,code:s.code,articles:company.articles.length,lists:company.lists.map(x=>[x.category,x.count])}));
}
const count=Number(process.argv.find(x=>x.startsWith('--count='))?.split('=')[1]||hk.length);
if(process.argv.includes('--reparse')) {
  const current=JSON.parse(await fs.readFile(path.join(root,'data/pharma_evidence.json'),'utf8'));
  for(const c of current.companies) for(const a of c.articles) {
    const html=await fs.readFile(path.join(root,a.rawFile),'utf8'); Object.assign(a,extractArticle(html));
    a.eligible=a.date?a.date.slice(0,10)<=cutoff:null;
  }
  await fs.writeFile(path.join(root,'data/pharma_evidence.json'),JSON.stringify(current,null,2));
  console.log('Reparsed existing');process.exit(0);
}
if(process.argv.includes('--reports')) {
  for(const c of evidence.companies) {
    c.reports=[];
    const links=c.lists.find(x=>x.category==='company-announcement')?.links.filter(x=>/中期報告|中期报告|中期業績公告|中期业绩公告|2026.*半年度|延遲刊發|延迟刊发|可換股債券|可换股债券/i.test(x.title)).slice(0,4)||[];
    for(const link of links) {
      try {
        const res=await fetch(link.url,{signal:AbortSignal.timeout(45000)}); if(!res.ok)throw Error(`HTTP ${res.status}`);
        const name=c.code.split('.')[0].padStart(5,'0')+'_'+link.url.split('/').at(-1);
        const file=path.join(rawDir,name); await fs.writeFile(file,Buffer.from(await res.arrayBuffer()));
        const txtfile=file.replace(/\.pdf$/i,'.txt'); execFileSync('pdftotext',['-layout','-enc','UTF-8',file,txtfile],{timeout:45000});
        const text=await fs.readFile(txtfile,'utf8');
        const date=link.url.match(/\/(202\d)(\d{2})(\d{2})\//);
        c.reports.push({...link,date:date?`${date[1]}-${date[2]}-${date[3]}`:null,sourceType:'issuer_disclosure_pdf_mirrored_by_aastocks',rawFile:`data/pharma_raw/${name}`,textFile:`data/pharma_raw/${path.basename(txtfile)}`,textLength:text.length,preview:text.slice(0,2200)});
        console.log(JSON.stringify({name:c.name,report:link.title,chars:text.length}));
      }catch(error){evidence.errors.push({code:c.code,url:link.url,error:String(error)});}
    }
    await fs.writeFile(path.join(root,'data/pharma_evidence.json'),JSON.stringify(evidence,null,2));
  }
  process.exit(0);
}
if(process.argv.includes('--expand')) {
  for(const c of evidence.companies) {
    const symbol=c.code.split('.')[0].padStart(5,'0');
    for(const category of ['research-report','company-announcement']) {
      const html=await fs.readFile(path.join(rawDir,`${symbol}_${category}.html`),'utf8');
      let param;for(const match of html.matchAll(/var param = (\{[^;]+\});/g)){try{const parsed=JSON.parse(match[1]);if(parsed.cat && parsed.newsid)param=parsed;}catch{}}
      if(!param)continue;
      let list=c.lists.find(x=>x.category===category);
      for(let p=0;p<(category==='research-report'?2:2);p++){
        try{
          const moreUrl='https://www.aastocks.com/tc/resources/datafeed/getmorenews.ashx?'+new URLSearchParams(param);
          const text=await fetchText(moreUrl);const data=JSON.parse(text);if(!Array.isArray(data)||!data.length)break;
          await fs.writeFile(path.join(rawDir,`${symbol}_${category}_more${p}.json`),text);
          for(const n of data){const link={url:n.t==='2'?`https://iis.aastocks.com${n.u}`:`https://www.aastocks.com/tc/stocks/analysis/stock-aafn-con/${symbol}/${n.s}/${n.id}/${category}`,title:clean(n.h),date:n.dt.replaceAll('/','-')};if(!list.links.some(x=>x.url===link.url))list.links.push(link);}
          const last=data.at(-1);param.newsid=last.id;param.newstime=last.dtd;
          if(category==='research-report' && last.dt<'2026/07/01')break;
          if(category==='company-announcement' && list.links.some(x=>/2026.*中期報告|二零二六.*中期報告/.test(x.title)))break;
        }catch(error){evidence.errors.push({code:c.code,category,error:String(error)});break;}
      }
      if(category==='research-report'){
        const selected=list.links.filter(x=>/高盛|摩通|摩根|花旗|瑞銀|瑞银|滙豐|汇丰|美銀|美银|大摩|野村|大和|富瑞|里昂|大華|大华/.test(x.title) && /目標|目标|評級|评级|估值|盈利|利潤|利润|增長|增长/.test(x.title) && (!x.date||x.date.slice(0,10)>='2026-07-01')).filter(x=>!c.articles.some(a=>a.url===x.url));
        for(const link of selected){try{const ah=await fetchText(link.url);const id=link.url.match(/(?:NOW\.|GLH|IC)[a-zA-Z0-9]+/)?.[0]||`more${c.articles.length}`;await fs.writeFile(path.join(rawDir,`${symbol}_${id}.html`),ah);const a=extractArticle(ah);c.articles.push({...link,...a,category,eligible:a.date?a.date.slice(0,10)<=cutoff:null,sourceType:'financial_news_secondary',rawFile:`data/pharma_raw/${symbol}_${id}.html`});}catch(error){evidence.errors.push({code:c.code,url:link.url,error:String(error)});}}
      }
    }
    await fs.writeFile(path.join(root,'data/pharma_evidence.json'),JSON.stringify(evidence,null,2));
    console.log(JSON.stringify({expanded:c.name,articles:c.articles.length}));
  }
  process.exit(0);
}
const remaining=hk.filter(x=>!evidence.companies.some(c=>c.code===x.code)).slice(0,count);
for(let i=0;i<remaining.length;i+=4) await Promise.all(remaining.slice(i,i+4).map(collect));
console.log(`Collected ${evidence.companies.length} companies; errors ${evidence.errors.length}`);
