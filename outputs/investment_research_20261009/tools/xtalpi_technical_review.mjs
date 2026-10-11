import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/MyTarget/outputs/investment_research_20261009';
const lockedRaw=fs.readFileSync(root+'/data/market_snapshot_locked.json'),historyRaw=fs.readFileSync(root+'/data/history/S032.json');
const q=JSON.parse(lockedRaw).securities.find(x=>x.securityId==='S032'),h=JSON.parse(historyRaw),t=q.technical,w=q.weeklyTechnical;
const checks=[],add=(name,actual,expected,tolerance=1e-5)=>checks.push({name,actual,expected,pass:typeof expected==='number'?Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance:actual===expected});
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
add('locked cutoff','2026-10-09',q.asOf);add('locked nominal close',q.price,h.bars.at(-1).adjusted.close);add('Tencent and Sina close',q.quote.close,q.sinaQuote.close);add('quote and historical shares',q.quote.volumeShares,h.bars.at(-1).volume,0);add('Tencent and Sina volume shares',q.quote.volumeShares,q.sinaQuote.volumeShares,0);add('Tencent and Sina turnover HKD',q.quote.turnoverAmount,q.sinaQuote.turnoverAmount,1e-3);
add('history actual first day',h.bars[0].date,'2024-06-13');add('history cutoff last day',h.bars.at(-1).date,'2026-10-09');add('day count',h.bars.length,t.count,0);
const weeklyGroups=new Map();
for(const b of h.bars){const date=new Date(b.date+'T00:00:00Z');const monday=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()-(date.getUTCDay()+6)%7);const list=weeklyGroups.get(monday)||[];list.push(b);weeklyGroups.set(monday,list);}
const reconstructed=[...weeklyGroups.entries()].map(([monday,a])=>({weekStart:new Date(monday).toISOString().slice(0,10),date:a.at(-1).date,open:a[0].adjusted.open,high:Math.max(...a.map(x=>x.adjusted.high)),low:Math.min(...a.map(x=>x.adjusted.low)),close:a.at(-1).adjusted.close,volume:a.reduce((s,x)=>s+x.volume,0),tradingDays:a.length}));
add('all weekly OHLCV and trading day aggregation',JSON.stringify(h.weekly),JSON.stringify(reconstructed));
for(const [label,bars,stats] of [['daily',h.bars,t],['weekly',h.weekly.map(x=>({...x,adjusted:x})),w]]){
 const prices=bars.map(x=>x.adjusted.close);
 for(const period of [20,60,120,250]){if(bars.length>=period){const ma=avg(prices.slice(-period));add(`${label} MA${period}`,stats.MA[period],ma);add(`${label} price vs MA${period}`,stats.priceVsMAPct[period],(q.price/ma-1)*100);if(bars.length>=period+5)add(`${label} MA${period} five-period slope`,stats.maSlope5Pct[period],(ma/avg(prices.slice(-period-5,-5))-1)*100);else add(`${label} unavailable MA${period} slope`,stats.maSlope5Pct[period],null);}else add(`${label} unavailable MA${period}`,stats.MA[period],null);}
 for(const period of [5,20,60])if(bars.length>=period)add(`${label} ${period}-period average volume`,stats.volumeMean[period],avg(bars.slice(-period).map(x=>x.volume)),.001);
 const priorVolume=avg(bars.slice(-21,-1).map(x=>x.volume));add(`${label} last/prior20 volume ratio`,stats.volumeRatio20,bars.at(-1).volume/priorVolume);
 let up=0,down=0;for(let i=bars.length-20;i<bars.length;i++){if(prices[i]>prices[i-1])up+=bars[i].volume;else if(prices[i]<prices[i-1])down+=bars[i].volume;}
 add(`${label} 20-period up volume`,stats.upDownVolume20.upVolume,up,0);add(`${label} 20-period down volume`,stats.upDownVolume20.downVolume,down,0);
 for(const period of [20,60]){const subset=bars.slice(-period);add(`${label} ${period}-period low`,stats.ranges[period].support,Math.min(...subset.map(x=>x.adjusted.low)));add(`${label} ${period}-period high`,stats.ranges[period].resistance,Math.max(...subset.map(x=>x.adjusted.high)));}
}
const daily=h.bars.slice(-252),weekly=h.weekly.slice(-52),calendar=h.bars.filter(x=>x.date>'2025-10-09');
const range=a=>({first:a[0].date,last:a.at(-1).date,count:a.length,high:Math.max(...a.map(x=>x.adjusted?x.adjusted.high:x.high)),low:Math.min(...a.map(x=>x.adjusted?x.adjusted.low:x.low))});
add('252-day historical high',t.high52w,range(daily).high);add('52-week historical high',w.high52w,range(weekly).high);
const recent=h.bars.slice(-5).map(x=>({date:x.date,...x.adjusted,volume:x.volume})),peak=recent.find(x=>x.date==='2026-10-06'),last=recent.at(-1);
const review={issuerId:'I027',securityId:'S032',reviewDate:'2026-10-11',asOf:q.asOf,price:q.price,lockedSHA256:hash(lockedRaw),historySHA256:hash(historyRaw),status:checks.every(x=>x.pass)?'PASS numerical observations with window disclosure':'FAIL',checks,windows:{daily252:range(daily),weekly52:range(weekly),calendarYear:range(calendar)},observations:{recent,threeDaysFromOct6ClosePct:(last.close/peak.close-1)*100,lastVolumeVsOct6: last.volume/peak.volume,lastVolumeVsPrevious20:q.technical.volumeRatio20,dayATR: t.ATR14,dayATRPct:t.ATR14Pct,turnoverAllEconomicSharesPct:q.lastVolumeShares/4296294179*100,marketExcess20Pct:q.relativeStrength.excess20Pct,marketExcess60Pct:q.relativeStrength.excess60Pct,industryExcess20Pct:q.relativeStrength.industryExcess20Pct,industryExcess60Pct:q.relativeStrength.industryExcess60Pct},limits:['252 trading observations and 52 weekly observations have different calendar boundaries; neither is an exact common calendar-year high','All-share turnover is derived from economic total shares, not exchange free-float turnover','Recent reversal and volume increases do not identify holder motives, net institutional accumulation or future price direction','AI drug services and platform value have imperfect comparability to the innovation-drug benchmark','Both providers use shares; Yahoo float price representation may differ below rounding precision'],sourceURLs:q.sources.filter(x=>x.url).map(x=>x.url)};
fs.writeFileSync(root+'/qa/xtalpi_technical_review.json',JSON.stringify(review,null,2)+'\n');
console.log(JSON.stringify({status:review.status,checks:checks.length,failures:checks.filter(x=>!x.pass),windows:review.windows,observations:review.observations,signatures:{locked:review.lockedSHA256,history:review.historySHA256}},null,2));
