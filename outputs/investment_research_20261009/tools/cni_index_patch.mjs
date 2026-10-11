import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const original=await fs.readFile(new URL('data/market_snapshot_locked.json',root),'utf8');
const locked=JSON.parse(original);
if(locked.lockedMethodVersion!=='market-v1.3')throw Error('Expected v1.3; inspect newer lock before mutation');
const source=JSON.parse(await fs.readFile(new URL('data/product_raw/cni_history.txt',root),'utf8'));
const id=JSON.parse(await fs.readFile(new URL('data/product_raw/cni_identity.txt',root),'utf8'));
if(source.code!==200||source.data.indexCode!=='987018'||id.data.indexcode!=='987018')throw Error('Identity failure');
const expected=['timestamp','current','high','open','low','close','chg','percent','amount','volume','avg'];
if(JSON.stringify(source.data.item)!==JSON.stringify(expected))throw Error('Column mapping changed');
const bars=source.data.data.map(a=>({date:new Date(a[0]+8*3600000).toISOString().slice(0,10),timestamp:a[0]/1000,open:a[3],high:a[2],low:a[4],close:a[5],adjclose:a[5],adjustmentFactor:1,adjusted:{open:a[3],high:a[2],low:a[4],close:a[5]},volume:null,indexAmountRaw:a[8],indexVolumeRaw:a[9],source:'CNI official index daily'})).filter(b=>b.date>='2023-10-09'&&b.date<='2026-10-09').sort((a,b)=>a.date.localeCompare(b.date));
const errors=[];for(let i=0;i<bars.length;i++){const b=bars[i];if(![b.open,b.high,b.low,b.close].every(Number.isFinite)||b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close)||b.high<b.low)errors.push(b.date);if(i&&b.date===bars[i-1].date)errors.push('duplicate '+b.date);}
if(errors.length||bars.at(-1)?.date!=='2026-10-09')throw Error('OHLC/anchor failure: '+errors.join(','));
const market=await fs.readFile(new URL('tools/market_data.mjs',root),'utf8');
const implementation=market.slice(market.indexOf('function calcWeekly('),market.indexOf('let completed=0;'));
const helpers='const mean=a=>a.length&&a.every(Number.isFinite)?a.reduce((x,y)=>x+y,0)/a.length:null;const round=(v,p=6)=>Number.isFinite(v)?Number(v.toFixed(p)):null;';
const context=vm.createContext({});vm.runInContext(helpers+implementation+'globalThis.compute={technical,calcWeekly};',context);
const weekly=context.compute.calcWeekly(bars),stats=context.compute.technical(bars),wstats=context.compute.technical(weekly.map(w=>({...w,adjusted:{open:w.open,high:w.high,low:w.low,close:w.close}})),'weeks');
for(const t of [stats,wstats]){t.basis='国证官方价格指数OHLC，无股票分红复权；指数点位非币种股价';t.volumeMean={5:null,20:null,60:null};t.volumeRatio20=null;t.previous20MeanVolume=null;t.upDownVolume20=null;t.volumeUnit='官方指数汇总量字段未核验单位，禁用量能信号';}
const item=locked.securities.find(x=>x.securityId==='S021');if(!item)throw Error('Missing S021');
const prior=JSON.parse(JSON.stringify(item));
Object.assign(item,{price:bars.at(-1).close,priceDate:'2026-10-09',priceUnit:'index_points',status:'official-index-history-computed',historyCount:bars.length,historyStart:bars[0].date,historyEnd:bars.at(-1).date,historySource:'CNI official index daily',technical:stats,weeklyTechnical:wstats,historyFile:'data/history/S021.json',priceDataQuality:'official-single-source',historyDataQuality:'official-single-source',dataQuality:'medium',tradableOnAsOf:false,lastPrice:{value:bars.at(-1).close,currency:null,unit:'index_points',date:'2026-10-09',referenceOnly:true,source:'CNI official index daily'},warnings:['官方指数单来源；尚无独立第二行情源验证。指数点位不作为股票可交易价格，量字段禁用。'],relativeStrength:{...item.relativeStrength,industryBenchmark:null}});
const url='https://hq.cnindex.com.cn/market/market/getIndexDailyData?indexCode=987018&startDate=2023-10-09&endDate=2026-10-09';
item.sources.push({source:'CNI official index daily',url,retrievedAt:new Date().toISOString(),status:200,columns:expected});
let supplemented=0;for(const s of locked.securities){if(s.type==='股票'&&s.currency==='HKD'&&/^创新药/.test(s.sector)&&s.technical){s.relativeStrength.industryBenchmark='国证港股通创新药987018（粗粒度参考，非每公司专属行业）';s.relativeStrength.industryBenchmarkId='S021';for(const n of [20,60])s.relativeStrength[`industryExcess${n}Pct`]=s.technical.returnPct[n]!=null?Number((s.technical.returnPct[n]-stats.returnPct[n]).toFixed(6)):null;s.relativeStrength.industryMissingReason=null;s.relativeStrength.industryBenchmarkQuality='官方单来源指数；价回报非含分红，量禁用';supplemented++;}}
locked.summary={...locked.summary,anchored:locked.securities.filter(s=>s.priceDate==='2026-10-09'&&Number.isFinite(s.price)&&!s.suspension).length,withHistory:locked.securities.filter(s=>s.historyCount>0).length,fullHistory:locked.securities.filter(s=>s.historyCount>=700).length};
locked.summary.incomplete=locked.summary.total-locked.summary.anchored;
locked.lockedMethodVersion='market-v1.4';locked.lockedAt=new Date().toISOString();locked.lockedNotes=locked.lockedNotes.map(n=>n.includes('987018/931787')?'987018补入国证官方日线；931787仍缺，指数量字段禁用。':n);locked.revisionHistory=[...(locked.revisionHistory||[]),{version:'market-v1.4',date:locked.lockedAt,priorVersion:'market-v1.3',changes:'S021官方指数价格/日周技术，HK创新药股票粗粒度行业超额；已有股票技术与价格不变',archive:'data/market_snapshot_locked_v1.3.json'}];
await fs.writeFile(new URL('data/market_snapshot_locked_v1.3.json',root),original,{flag:'wx'});
const oldHistory=await fs.readFile(new URL('data/history/S021.json',root),'utf8');await fs.writeFile(new URL('data/history/S021_v1.3.json',root),oldHistory,{flag:'wx'});
await fs.writeFile(new URL('data/history/S021.json',root),JSON.stringify({security:item,asOf:'2026-10-09',historySource:'CNI official index daily',sourceURL:url,columns:expected,barValidation:{count:bars.length,errors},bars,weekly,previous:prior},null,2));
await fs.writeFile(new URL('data/market_snapshot_locked.json',root),JSON.stringify(locked,null,2));
await fs.writeFile(new URL('qa/cni_index_v1.4_qa.json',root),JSON.stringify({version:'market-v1.4',asOf:'2026-10-09',securityId:'S021',officialIdentity:id.data,indexName:source.data.indexName,count:bars.length,first:bars[0].date,last:bars.at(-1).date,lastClose:bars.at(-1).close,columns:expected,OHLC:true,noDuplicate:true,existingStockTechnicalUnchanged:true,supplementedHKInnovativeDrugStocks:supplemented,independentSecondSource:false,volumeDisabled:true,summary:locked.summary},null,2));
console.log(JSON.stringify({summary:locked.summary,indexClose:item.price,count:bars.length,returnPct:stats.returnPct,MA:stats.MA,supplementedHKInnovativeDrugStocks:supplemented}));
