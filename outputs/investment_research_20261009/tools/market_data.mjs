import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ASOF = '2026-10-09';
const START = '2023-10-09';
const p1 = Math.floor(Date.parse(`${START}T00:00:00+08:00`) / 1000);
const p2 = Math.floor(Date.parse('2026-10-10T00:00:00+08:00') / 1000);
const historyDir = path.join(ROOT, 'data', 'history');
await fs.mkdir(historyDir, {recursive:true});
const universe = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'universe.json'), 'utf8'));
const snapshotPath = path.join(ROOT, 'data', 'market_snapshot.json');
const byId = new Map();
const fetchedAt = new Date().toISOString();
const forceRefresh=process.argv.includes('--refresh');
const suspended = new Map([
  ['S007',{since:'2026-09-01',lastTradeDate:'2026-08-31',url:'https://iis.aastocks.com/20260901/12310149-0.HTM'}],
  ['S010',{since:'2026-09-01',lastTradeDate:'2026-08-31',url:'https://iis.aastocks.com/20260901/12310210-0.HTM'}],
  ['S018',{since:'2026-09-01',lastTradeDate:'2026-08-31',url:'https://iis.aastocks.com/20260901/12310086-0.HTM'}]
]);
const sinaFile = path.join(ROOT,'data','sina_quotes.json');
let sinaRecords=[];
try{sinaRecords=JSON.parse(await fs.readFile(sinaFile,'utf8')).records||[];}catch{}
const sinaById=new Map(sinaRecords.map(r=>[r.securityId,r]));
const listingFloors = new Map([
  ['S009',{date:'2024-01-10',basis:'159502上市日（腾讯真实日线首日，基金成立日不作为可交易上市日）'}],
  ['S093',{date:'2024-09-17',basis:'美的集团H股公开上市日，旧代码/上市前Yahoo记录排除'}]
]);

const num = v => v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v);
const round = (v, places=6) => Number.isFinite(v) ? Number(v.toFixed(places)) : null;
const mean = arr => arr.length && arr.every(Number.isFinite) ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
const dateOf = t => new Date((t + 8*3600)*1000).toISOString().slice(0,10);
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function get(url, encoding='utf-8') {
  let err;
  for(let attempt=1; attempt<=2; attempt++) {
    try {
      const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*'}, signal:AbortSignal.timeout(25000)});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const body = new TextDecoder(encoding).decode(buffer);
      return {url, retrievedAt:new Date().toISOString(), status:response.status, attempts:attempt, body};
    } catch(e) {err=String(e); if(attempt===1) await sleep(600);}
  }
  return {url, retrievedAt:new Date().toISOString(), status:null, attempts:2, error:err};
}

async function cachedHistory(id){try{return JSON.parse(await fs.readFile(path.join(historyDir,`${id}.json`),'utf8'));}catch{return null;}}

async function pool(items, limit, fn) {
  let index=0;
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
    while(index<items.length) {const item=items[index++]; await fn(item);}
  }));
}

function tencentCode(s) {return s.code==='HSTECH.HK' ? 'hkHSTECH' : s.tencent;}

function parseTencentQuote(fields, source, s) {
  const isHK=s.currency==='HKD';
  const rawDate=fields[30] || '';
  const digits=rawDate.replace(/\D/g,'');
  const date=digits.length>=8 ? `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}` : null;
  const triple=(fields[35]||'').split('/');
  const amount=isHK ? num(fields[37]) : triple.length>=3 ? num(triple[2]) : num(fields[57])!==null ? num(fields[57])*10000 : num(fields[37])*10000;
  const volume=num(fields[6]);
  // Units are empirically checked against independently retrieved daily bars. Do not blindly multiply A-share qt field 6 by 100.
  return {source:'Tencent qt', sourceUrl:source.url, retrievedAt:source.retrievedAt,
    name:fields[1], date, timestamp:rawDate, currency:s.currency,
    close:num(fields[3]), previousClose:num(fields[4]), open:num(fields[5]), high:num(fields[33]), low:num(fields[34]),
    change:num(fields[31]), changePct:num(fields[32]), volumeRaw:volume,
    volumeUnit:s.type==='指数' ? 'provider-index-field-unverified' : 'pending-independent-validation',
    volumeShares:null, turnoverAmount:amount, turnoverCurrency:s.currency,
    turnoverPct:s.type==='股票' && !isHK ? num(fields[38]) : null,
    marketCap:isHK ? num(fields[44])*1e8 : num(fields[44])*1e8,
    providerPE:s.type==='股票' ? num(fields[39]) : null,
    providerPB:s.type==='股票' ? num(fields[isHK?43:46]) : null,
    PEStatus:'第三方行情字段，财报口径和期间未核验；仅用于筛查，不作为最终估值输入',
    amountUnit:isHK ? '本币元，字段37' : triple.length>=3 ? '人民币元，字段35三元组' : '人民币元，字段57×10000',
    rawFields:fields};
}

async function saveSnapshot(phase) {
  const securities=universe.securities.map(s=>byId.get(s.securityId) || {...s, asOf:ASOF,status:'pending'});
  const report={asOf:ASOF, historyStart:START, createdAt:fetchedAt, updatedAt:new Date().toISOString(),phase,
    methodVersion:'market-v1.2', priceBasis:'本币未复权10月9日收盘；技术OHLC按Yahoo adjclose/close归一到10月9日名义价格',
    summary:{total:securities.length,anchored:securities.filter(s=>s.priceDate===ASOF&&Number.isFinite(s.price)&&!s.suspension).length,
      withHistory:securities.filter(s=>s.historyCount>0).length,fullHistory:securities.filter(s=>s.historyCount>=700).length,
      incomplete:securities.filter(s=>s.dataQuality==='low').length},securities};
  await fs.writeFile(snapshotPath,JSON.stringify(report,null,2));
}

const qtCodes=universe.securities.map(tencentCode).filter(Boolean);
await pool(Array.from({length:Math.ceil(qtCodes.length/25)},(_,i)=>qtCodes.slice(i*25,(i+1)*25)),2,async codes=>{
  const response=await get(`https://qt.gtimg.cn/q=${codes.join(',')}`,'gb18030');
  const parsed=new Map();
  for(const match of (response.body||'').matchAll(/v_([^=]+)="([^"]*)";/g)) parsed.set(match[1],match[2].split('~'));
  for(const s of universe.securities.filter(s=>codes.includes(tencentCode(s)))) {
    const f=parsed.get(tencentCode(s));
    const quote=f&&f.length>30 ? parseTencentQuote(f,response,s) : null;
    const item={...s,asOf:ASOF, price:quote?.date===ASOF ? quote.close : null, priceDate:quote?.date||null,
      quote, sources:[{source:'Tencent qt',url:response.url,retrievedAt:response.retrievedAt,status:response.status,error:response.error||null}],
      status:'quote-collected',dataQuality:quote?.date===ASOF?'medium':'low',warnings:[]};
    if(!quote) item.warnings.push('腾讯报价未返回有效证券字段');
    else if(quote.date!==ASOF) item.warnings.push(`报价日${quote.date}不是统一基准日，暂不作为基准价`);
    const sina=sinaById.get(s.securityId);
    if(sina){item.sinaQuote=sina;item.sources.push({source:'Sina quotes',url:sina.url,retrievedAt:sina.retrievedAt||null,status:sina.status});}
    if(suspended.has(s.securityId)){item.suspension=suspended.get(s.securityId);item.priceDate=item.suspension.lastTradeDate;item.staleReferencePrice=quote?.close||null;item.warnings.push(`自${item.suspension.since}停牌；行情自动刷新时间不代表当日可交易收盘。当前价仅为${item.priceDate}参考价。`);}
    byId.set(s.securityId,item);
    await fs.writeFile(path.join(historyDir,`${s.securityId}_quote.json`),JSON.stringify({securityId:s.securityId,response,parsed:quote},null,2));
  }
});
await saveSnapshot('quotes');
console.log(`QUOTES ${[...byId.values()].filter(s=>s.price!==null).length}/${universe.securities.length}`);

function readYahoo(response,s) {
  if(!response.body) return {error:response.error||'no-body',bars:[]};
  let obj;
  try{obj=JSON.parse(response.body);}catch(e){return {error:'invalid-json',bars:[]};}
  const r=obj.chart?.result?.[0];
  if(!r) return {error:JSON.stringify(obj.chart?.error||obj),bars:[]};
  const q=r.indicators?.quote?.[0]||{};
  const adj=r.indicators?.adjclose?.[0]?.adjclose||[];
  const lastAllowed=suspended.get(s?.securityId)?.lastTradeDate||ASOF;
  const bars=(r.timestamp||[]).map((t,i)=>({date:dateOf(t),timestamp:t,open:num(q.open?.[i]),high:num(q.high?.[i]),low:num(q.low?.[i]),close:num(q.close?.[i]),adjclose:num(adj[i]),volume:num(q.volume?.[i])})).filter(b=>b.date>=START&&b.date<=lastAllowed&&b.close!==null&&b.open!==null&&b.high!==null&&b.low!==null).sort((a,b)=>a.date.localeCompare(b.date));
  const anchor=bars.at(-1);
  const anchorFactor=anchor?.adjclose&&anchor.close ? anchor.adjclose/anchor.close : 1;
  for(const b of bars) {
    const factor=b.adjclose!==null&&b.close ? b.adjclose/b.close/anchorFactor : 1;
    b.adjustmentFactor=round(factor,10);
    b.adjusted={open:round(b.open*factor),high:round(b.high*factor),low:round(b.low*factor),close:round(b.close*factor)};
  }
  const events=[];
  for(const [kind,vals] of Object.entries(r.events||{})) for(const event of Object.values(vals)) {
    const date=dateOf(event.date);
    if(date<=ASOF) events.push({kind,date,...event});
  }
  return {bars,meta:r.meta,events,anchorFactor,adjcloseAvailable:adj.length>0,error:null};
}

function readTencentHistory(response,s) {
  if(!response.body) return {bars:[],error:response.error||'no-body'};
  let obj;
  try{obj=JSON.parse(response.body);}catch(e){return {bars:[],error:'invalid-json'};}
  const root=obj.data?.[tencentCode(s)] || {};
  const key=root.qfqday?'qfqday':root.day?'day':null;
  const bars=(root[key]||[]).map(a=>({date:a[0],open:num(a[1]),close:num(a[2]),high:num(a[3]),low:num(a[4]),volume:num(a[5]),corporateAction:a[6]||null})).filter(b=>b.date>=START&&b.date<=ASOF&&b.close!==null);
  return {bars,key,error:bars.length?null:JSON.stringify(obj.msg||obj.code||'no bars')};
}

function calcWeekly(bars) {
  const weeks=new Map();
  for(const b of bars) {
    const d=new Date(`${b.date}T12:00:00Z`);
    const day=d.getUTCDay(); d.setUTCDate(d.getUTCDate()-(day===0?6:day-1));
    const key=d.toISOString().slice(0,10),p=b.adjusted;
    if(!weeks.has(key)) weeks.set(key,{weekStart:key,date:b.date,open:p.open,high:p.high,low:p.low,close:p.close,volume:b.volume,tradingDays:1});
    else {const w=weeks.get(key);w.date=b.date;w.high=Math.max(w.high,p.high);w.low=Math.min(w.low,p.low);w.close=p.close;w.volume+=b.volume||0;w.tradingDays++;}
  }
  return [...weeks.values()];
}

function ema(values,n) {
  if(values.length<n) return null;
  const result=Array(values.length).fill(null),alpha=2/(n+1);
  result[n-1]=mean(values.slice(0,n));
  for(let i=n;i<values.length;i++) result[i]=values[i]*alpha+result[i-1]*(1-alpha);
  return result;
}

function technical(bars,periodUnit='days') {
  if(!bars.length) return null;
  const prices=bars.map(b=>b.adjusted.close),volumes=bars.map(b=>b.volume),last=bars.at(-1),n=bars.length;
  const ma={},maSlope5Pct={},priceVsMAPct={};
  for(const period of [20,60,120,250]) {
    const now=n>=period?mean(prices.slice(-period)):null;
    const prior=n>=period+5?mean(prices.slice(n-period-5,n-5)):null;
    ma[period]=round(now);maSlope5Pct[period]=prior?round((now/prior-1)*100):null;
    priceVsMAPct[period]=now?round((last.adjusted.close/now-1)*100):null;
  }
  const returns={}; for(const period of [20,60,120,250]) returns[period]=n>period?round((prices.at(-1)/prices[n-1-period]-1)*100):null;
  const yearLength=periodUnit==='weeks'?52:252;
  const recent=bars.slice(-yearLength),yearHigh=Math.max(...recent.map(b=>b.adjusted.high)),yearLow=Math.min(...recent.map(b=>b.adjusted.low));
  let peak=0,maxDrawdown=0;
  for(const b of recent) {peak=Math.max(peak,b.adjusted.close);maxDrawdown=Math.min(maxDrawdown,b.adjusted.close/peak-1);}
  let rsi=null,atr=null;
  if(n>=15) {
    const changes=prices.slice(1).map((p,i)=>p-prices[i]);
    let gain=mean(changes.slice(0,14).map(v=>Math.max(v,0))),loss=mean(changes.slice(0,14).map(v=>Math.max(-v,0)));
    for(const c of changes.slice(14)){gain=(gain*13+Math.max(c,0))/14;loss=(loss*13+Math.max(-c,0))/14;}
    rsi=loss===0?gain===0?50:100:100-100/(1+gain/loss);
    const tr=bars.slice(1).map((b,i)=>Math.max(b.adjusted.high-b.adjusted.low,Math.abs(b.adjusted.high-prices[i]),Math.abs(b.adjusted.low-prices[i])));
    atr=mean(tr.slice(0,14));for(const t of tr.slice(14))atr=(atr*13+t)/14;
  }
  let macd=null;
  if(n>=34) {
    const e12=ema(prices,12),e26=ema(prices,26),diff=e26.map((v,i)=>v===null?null:e12[i]-v),valid=diff.filter(v=>v!==null),sig=ema(valid,9);
    macd={DIF:round(valid.at(-1)),DEA:round(sig.at(-1)),histogram:round(2*(valid.at(-1)-sig.at(-1))),convention:'MACD柱=2×(DIF−DEA)'};
  }
  const volumeMean={};for(const p of [5,20,60])volumeMean[p]=n>=p?round(mean(volumes.slice(-p)),3):null;
  const previous20=n>=21?mean(volumes.slice(n-21,n-1)):null;
  let upVolume=0,downVolume=0,flatVolume=0,upDays=0,downDays=0;
  for(let i=Math.max(1,n-20);i<n;i++){if(prices[i]>prices[i-1]){upVolume+=volumes[i]||0;upDays++;}else if(prices[i]<prices[i-1]){downVolume+=volumes[i]||0;downDays++;}else flatVolume+=volumes[i]||0;}
  const ranges={};
  for(const p of [20,60])if(n>=p){const r=bars.slice(-p),support=Math.min(...r.map(b=>b.adjusted.low)),resistance=Math.max(...r.map(b=>b.adjusted.high));ranges[p]={support:round(support),resistance:round(resistance),toSupportPct:round((support/last.adjusted.close-1)*100),toResistancePct:round((resistance/last.adjusted.close-1)*100),basis:'最近区间最低/最高价，属于观察位，未经触碰次数筛选'};}else ranges[p]=null;
  const above20=ma[20]!==null&&prices.at(-1)>ma[20],above60=ma[60]!==null&&prices.at(-1)>ma[60];
  const trend=ma[60]===null?'历史不足':above20&&above60&&maSlope5Pct[20]>0&&maSlope5Pct[60]>0?'中短期上升':!above20&&!above60&&maSlope5Pct[20]<0&&maSlope5Pct[60]<0?'中短期下降':above20&&!above60?'短期反弹，仍低于60日线':!above20&&above60?'回调，仍高于60日线':'趋势交错/震荡';
  return {basis:'以基准日名义价格归一的复权OHLC',periodUnit,count:n,MA:ma,maSlope5Pct,priceVsMAPct,returnPct:returns,
    yearWindow:recent.length,yearWindowExpected:yearLength,yearWindowComplete:n>=yearLength,high52w:round(yearHigh),low52w:round(yearLow),distanceFrom52wHighPct:round((prices.at(-1)/yearHigh-1)*100),distanceFrom52wLowPct:round((prices.at(-1)/yearLow-1)*100),maxDrawdown52wPct:round(maxDrawdown*100),
    RSI14:round(rsi),ATR14:round(atr),ATR14Pct:atr?round(atr/prices.at(-1)*100):null,MACD:macd,
    volumeMean,volumeUnit:'shares_as_provider_reported',volumeRatio20:previous20?round(volumes.at(-1)/previous20):null,previous20MeanVolume:round(previous20,3),
    upDownVolume20:{upVolume,downVolume,flatVolume,upDays,downDays,ratio:downVolume?round(upVolume/downVolume):null},ranges,trend,
    maxLossBoundary:false};
}

let completed=0;
await pool(universe.securities,6,async s=>{
  const item=byId.get(s.securityId)||{...s,asOf:ASOF,price:null,priceDate:null,quote:null,sources:[],warnings:[]};
  if(s.yahoo||tencentCode(s)) {
    const cached=forceRefresh?null:await cachedHistory(s.securityId);
    const yahooURL=s.yahoo?`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.yahoo)}?range=3y&interval=1d&events=div%2Csplits`:null;
    const tencentURL=tencentCode(s)?`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param=${tencentCode(s)},day,${START},${ASOF},1000,qfq`:null;
    // Keep total active requests <= 6 by fetching a security's two endpoints sequentially.
    let yahooResponse=yahooURL?(cached?.yahooResponse?.status===200?{...cached.yahooResponse,cacheReusedAt:new Date().toISOString()}:await get(yahooURL)):null;
    if(yahooURL&&yahooResponse?.status!==200){
      const alternate=yahooURL.replace('query2.finance','query1.finance');
      const response=await get(alternate);if(response.status===200)yahooResponse=response;
    }
    let tencentResponse=tencentURL?(cached?.tencentResponse?.status===200?{...cached.tencentResponse,cacheReusedAt:new Date().toISOString()}:await get(tencentURL,'utf-8')):null;
    const yahoo=yahooResponse?readYahoo(yahooResponse,s):{bars:[],error:'no-yahoo-symbol'};
    let tencent=tencentResponse?readTencentHistory(tencentResponse,s):{bars:[],error:'no-tencent-symbol'};
    const tencentAttempts=tencentResponse?[tencentResponse]:[];
    if(!tencent.bars.length&&tencentCode(s)){
      const fallbackURL=`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param=${tencentCode(s)},day,,,1000,qfq`;
      const response=await get(fallbackURL,'utf-8');tencentAttempts.push(response);
      const parsed=readTencentHistory(response,s);
      if(parsed.bars.length){tencentResponse=response;tencent=parsed;}
    }
    const tencentSupplemental=[];
    if(tencent.bars.length&&tencent.bars[0].date>'2023-10-15'&&s.currency==='CNY'&&!/159502/.test(s.code)){
      const end=new Date(`${tencent.bars[0].date}T12:00:00Z`);end.setUTCDate(end.getUTCDate()-1);
      const url=`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param=${tencentCode(s)},day,${START},${end.toISOString().slice(0,10)},640,qfq`;
      const prior=cached?.tencentSupplemental?.find(r=>r.status===200&&r.url===url);
      const response=prior?{...prior,cacheReusedAt:new Date().toISOString()}:await get(url),parsed=readTencentHistory(response,s);
      tencentSupplemental.push(response);
      tencent.bars=[...new Map([...parsed.bars,...tencent.bars].map(b=>[b.date,b])).values()].sort((a,b)=>a.date.localeCompare(b.date));
    }
    for(const [source,response] of [['Yahoo Finance chart',yahooResponse],['Tencent fqkline',tencentResponse]])if(response)item.sources.push({source,url:response.url,retrievedAt:response.retrievedAt,status:response.status,error:response.error||null});
    let tencentVolumeFactor=s.currency==='HKD'?1:null;
    const yahooMap=new Map(yahoo.bars.map(b=>[b.date,b]));
    const ratios=tencent.bars.slice(-60).filter(b=>b.volume&&yahooMap.get(b.date)?.volume).map(b=>yahooMap.get(b.date).volume/b.volume);
    const sortedRatios=ratios.sort((a,b)=>a-b),medianRatio=sortedRatios.length?sortedRatios[Math.floor(sortedRatios.length/2)]:null;
    if(medianRatio!==null){if(Math.abs(medianRatio-1)<0.02)tencentVolumeFactor=1;else if(Math.abs(medianRatio-100)<2)tencentVolumeFactor=100;}
    if(tencentVolumeFactor===null){const sina=sinaById.get(s.securityId),lastT=tencent.bars.at(-1);const ratio=lastT?.date===ASOF&&lastT.volume&&sina?.date===ASOF&&sina.volumeShares?sina.volumeShares/lastT.volume:null;if(ratio!==null){if(Math.abs(ratio-1)<0.02)tencentVolumeFactor=1;else if(Math.abs(ratio-100)<2)tencentVolumeFactor=100;}}
    if(tencentVolumeFactor)for(const b of tencent.bars){b.volumeRaw=b.volume;b.volume=round(b.volume*tencentVolumeFactor,3);b.volumeUnit=tencentVolumeFactor===100?'hand-converted-to-shares':'shares';}
    else if(tencent.bars.length)item.warnings.push('腾讯历史成交量单位缺少独立对应日线，成交量仅为原字段');
    let bars=yahoo.bars,historySource='Yahoo Finance chart';
    if(!bars.length&&tencent.bars.length){bars=tencent.bars.map(b=>({...b,adjclose:null,adjustmentFactor:1,adjusted:{open:b.open,high:b.high,low:b.low,close:b.close}}));historySource=`Tencent ${tencent.key}`;item.warnings.push('Yahoo日线不可用；使用腾讯日线，复权因子无法与adjclose核对');}
    // Some current Yahoo ETF bars have a null open although close/high/low/volume exist. Use the complete Tencent bar, never synthesize an open.
    const yahooLatestDate=yahoo.bars.at(-1)?.date;
    if(!item.suspension&&yahoo.bars.length&&yahooLatestDate!==ASOF&&tencent.bars.at(-1)?.date===ASOF){
      const tail=tencent.bars.filter(b=>b.date>yahooLatestDate).map(b=>({...b,adjclose:null,adjustmentFactor:1,adjusted:{open:b.open,high:b.high,low:b.low,close:b.close},source:'Tencent complete OHLC'}));
      bars=[...yahoo.bars,...tail];historySource='Yahoo Finance chart + Tencent latest complete OHLC';
      item.warnings.push('Yahoo最新完整OHLC缺失，追加腾讯完整最新bar；最新成交量用独立Sina/Yahoo metadata股数核验');
    }
    if(listingFloors.has(s.securityId)){
      const floor=listingFloors.get(s.securityId),excluded=bars.filter(b=>b.date<floor.date).length;
      bars=bars.filter(b=>b.date>=floor.date);item.listingFloor=floor;
      if(excluded)item.warnings.push(`排除${excluded}根早于可交易上市日${floor.date}的来源记录`);
    }
    const barCorrections=[],unresolved=[];
    const tcMap=new Map(tencent.bars.map(b=>[b.date,b]));
    const inconsistent=b=>b.low>b.high+0.001||b.open<b.low-0.001||b.open>b.high+0.001||b.close<b.low-0.001||b.close>b.high+0.001;
    for(const b of bars)if(inconsistent(b)){
      const t=tcMap.get(b.date);
      if(t&&!inconsistent(t)&&(Math.abs(t.close-b.adjusted.close)/b.adjusted.close<0.02||Math.abs(t.close-b.close)/b.close<0.02)){
        const scale=b.adjusted.close/t.close;
        const correction={date:b.date,reason:'Yahoo OHLC逻辑不一致（开盘/收盘在日高低区间外），腾讯同日bar合理',original:{open:b.open,high:b.high,low:b.low,close:b.close,volume:b.volume},replacementSource:'Tencent fqkline',replacementAdjusted:{open:round(t.open*scale),high:round(t.high*scale),low:round(t.low*scale),close:b.adjusted.close},tencentCloseNormalization:round(scale,10)};
        b.originalYahooOHLC=correction.original;b.adjusted=correction.replacementAdjusted;
        b.open=round(b.adjusted.open/b.adjustmentFactor);b.high=round(b.adjusted.high/b.adjustmentFactor);b.low=round(b.adjusted.low/b.adjustmentFactor);
        b.OHLCSource='Tencent logical-bar replacement, normalized to Yahoo adjusted close';barCorrections.push(correction);
      }else unresolved.push({date:b.date,reason:'逻辑不一致且缺乏可核验替代bar'});
    }
    item.barValidation={repairedCount:barCorrections.length,unresolvedCount:unresolved.length,unresolvedDates:unresolved.map(b=>b.date),replacementBasis:'仅修复明确OHLC逻辑不一致，保留Yahoo复权收盘锚；不按主观异常涨跌清洗'};
    if(barCorrections.length)item.warnings.push(`${barCorrections.length}根Yahoo OHLC逻辑不一致，按腾讯同日完整bar修复，原字段及修复记录在历史文件`);
    if(unresolved.length)item.warnings.push(`${unresolved.length}根OHLC逻辑不一致未获可核验替代，技术高低/ATR可靠性受限`);
    const last=bars.at(-1),tLast=tencent.bars.at(-1);
    const quote=item.quote;
    if(last?.date===ASOF&&!item.price){item.price=last.close;item.priceDate=last.date;}
    item.historyCount=bars.length;item.historyStart=bars[0]?.date||null;item.historyEnd=last?.date||null;
    item.historySource=historySource;item.currencyReported=yahoo.meta?.currency||s.currency;
    item.technical=technical(bars);item.weeklyTechnical=technical(calcWeekly(bars).map(w=>({...w,adjusted:{open:w.open,high:w.high,low:w.low,close:w.close}})),'weeks');
    item.corporateActions=yahoo.events||[];item.adjcloseAvailable=!!yahoo.adjcloseAvailable;
    item.metadata=yahoo.meta||null;
    const pDiff=quote?.date===ASOF&&last?.date===ASOF?Math.abs(quote.close-last.close)/last.close*100:null;
    const tqDiff=tLast?.date===ASOF&&last?.date===ASOF?Math.abs(tLast.close-last.adjusted.close)/last.adjusted.close*100:null;
    const sina=sinaById.get(s.securityId);
    const independentBar=historySource==='Yahoo Finance chart'?last:null;
    const independentVolume=independentBar?.volume||sina?.volumeShares||null;
    const rawVolumeRatio=quote?.volumeRaw&&independentVolume&&!item.suspension?quote.volumeRaw/independentVolume:null;
    let volumeFactor=null;
    if(rawVolumeRatio!==null){if(Math.abs(rawVolumeRatio-1)<0.02)volumeFactor=1;else if(Math.abs(rawVolumeRatio-0.01)<0.0002)volumeFactor=100;}
    if(quote&&s.type!=='指数'){
      quote.volumeShares=volumeFactor?round(quote.volumeRaw*volumeFactor,3):null;
      quote.volumeUnit=volumeFactor===1?'股（独立日线核对）':volumeFactor===100?'手（×100转股，独立日线核对）':'未核验';
    }
    if(last&&last.source==='Tencent complete OHLC'&&sina?.date===ASOF&&sina.volumeShares){last.volume=sina.volumeShares;last.volumeSource='Sina quotes';}
    const validPairs=yahoo.bars.filter(b=>tencent.bars.some(t=>t.date===b.date));
    const tmap=new Map(tencent.bars.map(b=>[b.date,b]));
    const pairErrors=validPairs.slice(-60).map(b=>Math.abs(b.adjusted.close-tmap.get(b.date).close)/b.adjusted.close*100);
    const independentPrice=independentBar?.date===ASOF?independentBar.close:sina?.date===ASOF?sina.close:null;
    const independentDiff=quote?.date===ASOF&&independentPrice&&!item.suspension?Math.abs(quote.close-independentPrice)/independentPrice*100:null;
    item.crossValidation={priceDifferencePct:round(independentDiff),primaryVsTencentDailyDifferencePct:round(pDiff),tencentHistoryAnchorDifferencePct:round(tqDiff),volumeRawToIndependentRatio:round(rawVolumeRatio),quoteVolumeConversionFactor:volumeFactor,
      recent60AdjustedHistoryMeanDifferencePct:round(mean(pairErrors)),recent60AdjustedHistoryMaxDifferencePct:pairErrors.length?round(Math.max(...pairErrors)):null,
      independentPriceSource:independentBar?.date===ASOF?'Yahoo Finance chart':sina?.date===ASOF?'Sina quotes':null,
      historicalProviders:yahoo.bars.length&&tencent.bars.length?['Yahoo','Tencent']:tencent.bars.length?['Tencent']:[],
      pairedDays:validPairs.length,status:item.suspension?'suspended-stale-reference':independentDiff!==null&&independentDiff<0.05?'two-provider-price-agrees':independentDiff!==null?'two-provider-price-disagrees':'single-provider'};
    item.lastVolumeShares=last?.volume||null;item.lastTurnoverAmount=quote?.date===ASOF?quote.turnoverAmount:null;
    if(last?.date!==ASOF)item.warnings.push(`历史最后交易日${last?.date||'缺失'}，不具备10月9日完整交易日锚`);
    if(bars.length<250)item.warnings.push(`真实历史仅${bars.length}根日线，250日均线或一年统计不足`);
    if(!yahoo.adjcloseAvailable&&s.type!=='指数')item.warnings.push('adjclose未开放，复权OHLC口径仅按来源原字段');
    if(pDiff!==null&&pDiff>=0.05)item.warnings.push(`跨来源收盘价差${round(pDiff,4)}%，需要复核`);
    if(volumeFactor===null&&quote&&s.type!=='指数')item.warnings.push('成交量单位未完成跨源核验，报价股数留空');
    if(pairErrors.length&&Math.max(...pairErrors)>1)item.warnings.push('近60日复权口径有超过1%的跨源差异，可能与分红复权算法或数据修订有关');
    const recentDate=bars[Math.max(0,bars.length-60)]?.date;
    if((yahoo.events||[]).some(e=>e.kind==='splits'&&e.date>=recentDate))item.warnings.push('最近60交易日存在拆股/合股，成交股数量趋势受股本基准变化影响，量能判断须复核');
    item.dataQuality=item.suspension||last?.date!==ASOF||independentDiff!==null&&independentDiff>=0.05?'low':independentDiff!==null&&volumeFactor!==null&&bars.length>=250&&yahoo.bars.length?'high':'medium';
    item.priceDataQuality=item.suspension?'stale-reference':independentDiff!==null&&independentDiff<0.05?'two-provider-agrees':'single-or-unverified';
    item.historyDataQuality=yahoo.bars.length&&tencent.bars.length?'two-provider-daily':tencent.bars.length?'single-provider-daily':'missing';
    if(!yahoo.bars.length)item.warnings.push('历史日线仅腾讯提供；新浪独立校验只覆盖最新报价，不代表三年历史已二源验证');
    if(s.type==='指数'&&item.technical){item.technical.volumeRatio20=null;item.technical.volumeMean={5:null,20:null,60:null};item.technical.upDownVolume20=null;item.technical.volumeUnit='指数成交字段未核验，量能指标禁用';}
    if(last&&last.source==='Tencent complete OHLC'){item.technical=technical(bars);item.weeklyTechnical=technical(calcWeekly(bars).map(w=>({...w,adjusted:{open:w.open,high:w.high,low:w.low,close:w.close}})),'weeks');}
    if(s.type==='指数')for(const stats of [item.technical,item.weeklyTechnical])if(stats){stats.volumeRatio20=null;stats.volumeMean={5:null,20:null,60:null};stats.previous20MeanVolume=null;stats.upDownVolume20=null;stats.volumeUnit='指数成交字段未核验，量能指标禁用';}
    if(unresolved.length&&item.dataQuality==='high')item.dataQuality='medium';
    item.tencentHistoryVolumeConversionFactor=tencentVolumeFactor;
    item.status='history-computed';item.historyFile=`data/history/${s.securityId}.json`;
    await fs.writeFile(path.join(historyDir,`${s.securityId}.json`),JSON.stringify({security:s,asOf:ASOF,retrievedAt:new Date().toISOString(),historySource,yahooResponse,tencentResponse,tencentAttempts,tencentSupplemental,tencentHistoryVolumeConversionFactor:tencentVolumeFactor,yahooMeta:yahoo.meta||null,yahooError:yahoo.error||null,tencentError:tencent.error||null,corporateActions:yahoo.events||[],barCorrections,unresolvedBarIssues:unresolved,bars,weekly:calcWeekly(bars),tencentBars:tencent.bars},null,2));
  } else {
    const url=s.code.startsWith('931787')?'https://www.csindex.com.cn/csindex-home/perf/index-perf-oneday?indexCode=931787':'https://www.cnindex.com.cn/module/index-detail.html?act_menu=1&indexCode=987018';
    const response=await get(url);
    item.sources.push({source:'official-index-page-or-endpoint',url,retrievedAt:response.retrievedAt,status:response.status,error:response.error||null});
    item.status='official-index-data-unparsed';item.dataQuality='low';item.historyCount=0;item.technical=null;item.price=null;
    item.warnings.push('官方链接已尝试，未取得可核验基准日数值和可用三年OHLC，不用近似指数补造');
    await fs.writeFile(path.join(historyDir,`${s.securityId}.json`),JSON.stringify({security:s,asOf:ASOF,response,bars:[],weekly:[]},null,2));
  }
  byId.set(s.securityId,item);completed++;
  if(completed%10===0||completed===universe.securities.length){await saveSnapshot(`history ${completed}/${universe.securities.length}`);console.log(`HISTORY ${completed}/${universe.securities.length}`);}
});

// Market benchmarks are separate from the user's 103-security coverage count.
const benchmarks=[];
for(const benchmark of [{id:'HK_MARKET',symbol:'^HSI',name:'恒生指数',currency:'HKD'},{id:'A_MARKET',symbol:'000300.SS',name:'沪深300',currency:'CNY'}]) {
  const url=`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(benchmark.symbol)}?range=3y&interval=1d&events=div%2Csplits`;
  let cachedBenchmark=null;
  if(!forceRefresh)try{cachedBenchmark=JSON.parse(await fs.readFile(path.join(historyDir,`benchmark_${benchmark.id}.json`),'utf8'));}catch{}
  const response=cachedBenchmark?.response?.status===200?cachedBenchmark.response:await get(url),parsed=readYahoo(response),stats=technical(parsed.bars);
  let benchmarkBars=parsed.bars,benchmarkStats=stats,fallbackResponse=null,source='Yahoo Finance chart';
  if(benchmark.id==='A_MARKET'&&benchmarkBars.length<250){
    const fallbackURL=`https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param=sh000300,day,${START},${ASOF},1000,qfq`;
    fallbackResponse=cachedBenchmark?.fallbackResponse?.status===200?cachedBenchmark.fallbackResponse:await get(fallbackURL);
    const tb=readTencentHistory(fallbackResponse,{code:'000300.SH',tencent:'sh000300'}).bars;
    if(tb.length>benchmarkBars.length){benchmarkBars=tb.map(b=>({...b,adjusted:{open:b.open,high:b.high,low:b.low,close:b.close}}));benchmarkStats=technical(benchmarkBars);source='Tencent fqkline';}
  }
  benchmarks.push({...benchmark,url,source,fallbackURL:fallbackResponse?.url||null,price:benchmarkBars.at(-1)?.close||null,date:benchmarkBars.at(-1)?.date||null,technical:benchmarkStats,error:benchmarkBars.length?null:parsed.error});
  await fs.writeFile(path.join(historyDir,`benchmark_${benchmark.id}.json`),JSON.stringify({benchmark,response,fallbackResponse,source,bars:benchmarkBars,weekly:calcWeekly(benchmarkBars)},null,2));
}
const tech=universe.securities.find(s=>s.code==='HSTECH.HK');
const techStats=tech?byId.get(tech.securityId)?.technical:null;
for(const item of byId.values()) {
  const market=benchmarks.find(b=>b.id===(item.currency==='HKD'?'HK_MARKET':'A_MARKET'));
  const useTech=item.currency==='HKD'&&!/医药|创新药|CXO|疫苗|生物|核医/.test(item.sector)&&item.type==='股票';
  const relative={market:market?.name||null,marketSymbol:market?.symbol||null,marketReturn20Pct:market?.technical?.returnPct?.[20]??null,marketReturn60Pct:market?.technical?.returnPct?.[60]??null};
  for(const n of [20,60])relative[`excess${n}Pct`]=item.technical?.returnPct?.[n]!=null&&market?.technical?.returnPct?.[n]!=null?round(item.technical.returnPct[n]-market.technical.returnPct[n]):null;
  relative.industryBenchmark=useTech?'恒生科技（科技/互联网/硬件相关粗粒度参考，不代表专属行业）':null;
  for(const n of [20,60])relative[`industryExcess${n}Pct`]=useTech&&item.technical?.returnPct?.[n]!=null&&techStats?.returnPct?.[n]!=null?round(item.technical.returnPct[n]-techStats.returnPct[n]):null;
  if(!useTech&&item.type==='股票')relative.industryMissingReason='创新药/医药细分基准三年可核验数据未取得，行业相对强弱留空';
  item.relativeStrength=relative;
  if(item.securityId==='S001'){item.historyMissingDates=['2024-12-23','2024-12-24','2024-12-25','2024-12-26','2024-12-27','2024-12-30','2024-12-31','2025-01-02','2025-01-03','2025-01-06'];item.warnings.push('腾讯海尔生物历史中间缺10个市场交易日；2024-12-23至2025-01-06补查询仍未返回。近期250日以上指标不受这段早期缺口影响；三年逐日路径不完整。');}
  item.lastPrice={value:item.price,currency:item.currency,date:item.priceDate,referenceOnly:!!item.suspension,source:item.quote?'Tencent qt + independent latest quote check':item.historySource||null};
  item.tradableOnAsOf=!!item.price&&item.priceDate===ASOF&&!item.suspension&&item.type!=='指数';
}
await saveSnapshot('complete');
const current=JSON.parse(await fs.readFile(snapshotPath,'utf8'));current.benchmarks=benchmarks;
await fs.writeFile(snapshotPath,JSON.stringify(current,null,2));
current.lockedAt=new Date().toISOString();current.lockedMethodVersion='market-v1.3';
current.lockedNotes=['价格与最新成交量采用腾讯/新浪独立报价核验；三年历史provider数量逐证券明示。','三只微创9月1日起停牌，报价日期自动刷新已改为8月31参考价。','无可核验指数987018/931787行情时留空。','海尔生物早期历史缺10日，近期技术窗口具备真实数据；其他新股上市前历史不补造。'];
await fs.writeFile(path.join(ROOT,'data','market_snapshot_locked.json'),JSON.stringify(current,null,2));
console.log(JSON.stringify(current.summary));

