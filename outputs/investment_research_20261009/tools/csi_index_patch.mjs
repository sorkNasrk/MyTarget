import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const original=await fs.readFile(new URL('data/market_snapshot_locked.json',root),'utf8');
const locked=JSON.parse(original);
if(locked.lockedMethodVersion!=='market-v1.4')throw Error('Expected market-v1.4; newer lock requires review');
const read=async p=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'));
const raw=await read('data/product_raw/csi_perf_compact.json'),identity=await read('data/product_raw/csi_basic.json');
if(raw.code!=='200'||identity.data?.indexCode!=='931787'||raw.data.some(b=>b.indexCode!=='931787'))throw Error('Official identity mismatch');
const sourceURL='https://www.csindex.com.cn/csindex-home/perf/index-perf?indexCode=931787&startDate=20231009&endDate=20261009';
const comparison=await Promise.all(['data/history/benchmark_HK_MARKET.json','data/history/S021.json','data/history/S083.json'].map(read));
const dateSets=comparison.map(h=>new Set(h.bars.map(b=>b.date.replaceAll('-',''))));
const exclusions=raw.data.filter(b=>!dateSets[0].has(b.tradeDate));
if(exclusions.length!==1||exclusions[0].tradeDate!=='20240906'||dateSets.some(s=>s.has('20240906')))throw Error('Unreviewed market calendar discrepancy');
const extra=exclusions[0],previous=raw.data.find(b=>b.tradeDate==='20240905');
if(!['open','high','low','close'].every(k=>extra[k]===previous.close))throw Error('Expected flat carried-forward quote');
const bars=raw.data.filter(b=>b.tradeDate!=='20240906').map(b=>({date:b.tradeDate.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'),timestamp:Date.parse(b.tradeDate.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3')+'T08:00:00+08:00')/1000,open:b.open,high:b.high,low:b.low,close:b.close,adjclose:b.close,adjustmentFactor:1,adjusted:{open:b.open,high:b.high,low:b.low,close:b.close},volume:null,indexVolumeRaw:b.tradingVol,indexAmountRaw:b.tradingValue,source:'CSI official daily performance compact-date API'})).sort((a,b)=>a.date.localeCompare(b.date));
const errors=[];for(let i=0;i<bars.length;i++){const b=bars[i];if(![b.open,b.high,b.low,b.close].every(Number.isFinite)||b.low>Math.min(b.open,b.close)||b.high<Math.max(b.open,b.close)||b.high<b.low)errors.push(b.date);if(i&&b.date===bars[i-1].date)errors.push('duplicate '+b.date);}
if(errors.length||bars.length!==739||bars.at(-1).date!=='2026-10-09'||bars.at(-1).close!==1450.66)throw Error('CSI data audit failed');
const market=await fs.readFile(new URL('tools/market_data.mjs',root),'utf8');
const implementation=market.slice(market.indexOf('function calcWeekly('),market.indexOf('let completed=0;'));
const helpers='const mean=a=>a.length&&a.every(Number.isFinite)?a.reduce((x,y)=>x+y,0)/a.length:null;const round=(v,p=6)=>Number.isFinite(v)?Number(v.toFixed(p)):null;';
const ctx=vm.createContext({});vm.runInContext(helpers+implementation+'globalThis.compute={technical,calcWeekly};',ctx);
const weekly=ctx.compute.calcWeekly(bars),technical=ctx.compute.technical(bars),weeklyTechnical=ctx.compute.technical(weekly.map(w=>({...w,adjusted:{open:w.open,high:w.high,low:w.low,close:w.close}})),'weeks');
for(const t of [technical,weeklyTechnical])Object.assign(t,{basis:'中证官方港元价格指数OHLC，无股票分红复权；按核验交易日剔除一条复制点位',volumeMean:{5:null,20:null,60:null},volumeRatio20:null,previous20MeanVolume:null,upDownVolume20:null,volumeUnit:'官方指数汇总量单位未核，禁用量能'});
const item=locked.securities.find(s=>s.code==='931787.CSI'),prior=structuredClone(item);if(!item)throw Error('Index absent');
Object.assign(item,{price:1450.66,priceDate:'2026-10-09',priceUnit:'index_points',status:'official-index-history-computed',historyCount:739,historyStart:bars[0].date,historyEnd:bars.at(-1).date,historySource:'CSI official daily performance',technical,weeklyTechnical,historyFile:'data/history/'+item.securityId+'.json',priceDataQuality:'official-single-source',historyDataQuality:'official-single-source-calendar-checked',dataQuality:'medium',tradableOnAsOf:false,lastPrice:{value:1450.66,currency:'HKD',unit:'index_points',date:'2026-10-09',referenceOnly:true,source:'CSI official daily performance'},warnings:['官方行情单来源；官方盘后16:29:58显示相同收盘点位仍不是独立第二源。','全区间紧凑日期API剔除2024-09-06复制点位：恒指、国证指数及腾讯历史均无该日，原数据保留；未取得独立交易所日历文件。','2026单年API把1月2日复制为1月1日，全区间API无此异常；仅使用核验后的全区间序列。'],officialIdentity:identity.data});
item.sources.push({source:'CSI official daily performance',url:sourceURL,status:200,retrievedAt:new Date().toISOString(),calendarExclusion:'2024-09-06'});
const changedBenchmarks=[];
for(const s of locked.securities.filter(s=>s.type==='股票'&&s.currency==='HKD'&&s.sector==='综合药企')){
 const old=s.relativeStrength?.industryBenchmark;
 if(old?.startsWith('恒生科技')){Object.assign(s.relativeStrength,{industryBenchmark:null,industryBenchmarkId:null,industryExcess20Pct:null,industryExcess60Pct:null,industryMissingReason:'综合药企不适用恒生科技；专属医药行业指数尚待核验'});changedBenchmarks.push({code:s.code,old,new:null});}
}
locked.summary={...locked.summary,anchored:locked.securities.filter(s=>s.priceDate==='2026-10-09'&&Number.isFinite(s.price)&&!s.suspension).length,withHistory:locked.securities.filter(s=>s.historyCount>0).length,fullHistory:locked.securities.filter(s=>s.historyCount>=700).length};locked.summary.incomplete=locked.summary.total-locked.summary.anchored;
locked.lockedMethodVersion='market-v1.5';locked.lockedAt=new Date().toISOString();locked.lockedNotes=locked.lockedNotes.map(n=>n.includes('931787')?'987018及931787补入官方日线；指数量单位未核禁用，官方指数单源限制保留。':n);locked.revisionHistory=[...(locked.revisionHistory??[]),{version:'market-v1.5',priorVersion:'market-v1.4',date:locked.lockedAt,changes:'CSI 931787官方身份/日周技术；6家综合药企剔除错误恒科行业映射；所有股票价格与技术不变',archive:'data/market_snapshot_locked_v1.4.json'}];
await fs.writeFile(new URL('data/market_snapshot_locked_v1.4.json',root),original,{flag:'wx'});
const oldHistory=await fs.readFile(new URL('data/history/'+item.securityId+'.json',root),'utf8');await fs.writeFile(new URL('data/history/'+item.securityId+'_v1.4.json',root),oldHistory,{flag:'wx'});
await fs.writeFile(new URL('data/history/'+item.securityId+'.json',root),JSON.stringify({security:item,asOf:'2026-10-09',historySource:'CSI official daily performance',sourceURL,barValidation:{count:739,errors,excluded:exclusions,calendarComparison:['Yahoo ^HSI','CNI 987018 official','Yahoo Tencent 00700'],limitation:'Exchange calendar original not yet obtained'},bars,weekly,previous:prior},null,2));
await fs.writeFile(new URL('data/market_snapshot_locked.json',root),JSON.stringify(locked,null,2));
await fs.writeFile(new URL('qa/csi_index_v1.5_qa.json',root),JSON.stringify({version:'market-v1.5',asOf:'2026-10-09',indexCode:'931787',officialIdentity:identity.data,rawRows:740,retainedRows:739,excluded:exclusions,anchor:bars.at(-1),OHLC:true,noDuplicate:true,independentSecondSource:false,volumeDisabled:true,stockPricesAndTechnicalUnchanged:true,changedBenchmarks,summary:locked.summary},null,2));
console.log(JSON.stringify({version:locked.lockedMethodVersion,summary:locked.summary,returns:technical.returnPct,MA:technical.MA,changedBenchmarks}));
