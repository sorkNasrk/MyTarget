import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/MyTarget/outputs/investment_research_20261009';
const lockRaw=fs.readFileSync(root+'/data/market_snapshot_locked.json'),histRaw=fs.readFileSync(root+'/data/history/S008.json');
const q=JSON.parse(lockRaw).securities.find(x=>x.securityId==='S008'),hist=JSON.parse(histRaw);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),avg=x=>x.reduce((s,y)=>s+y,0)/x.length;
const checks=[],add=(name,actual,expected,tolerance=1e-5)=>checks.push({name,actual,expected,pass:typeof expected==='number'?Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance:actual===expected});
add('cutoff',q.asOf,'2026-10-09');add('close pair',q.quote.close,q.sinaQuote.close);add('volume in shares pair',q.quote.volumeShares,q.sinaQuote.volumeShares,0);add('turnover HKD pair',q.quote.turnoverAmount,q.sinaQuote.turnoverAmount,.001);add('nominal cutoff price to historical normalization',q.price,hist.bars.at(-1).adjusted.close);add('first listed day',hist.bars[0].date,'2025-12-30');add('192 real daily bars',hist.bars.length,192,0);
const groups=new Map();
for(const b of hist.bars){const d=new Date(b.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);const k=d.toISOString().slice(0,10),a=groups.get(k)||[];a.push(b);groups.set(k,a);}
const weekly=[...groups.entries()].map(([key,a])=>({weekStart:key,date:a.at(-1).date,open:a[0].adjusted.open,high:Math.max(...a.map(x=>x.adjusted.high)),low:Math.min(...a.map(x=>x.adjusted.low)),close:a.at(-1).adjusted.close,volume:a.reduce((s,x)=>s+x.volume,0),tradingDays:a.length}));
add('41 weekly bars from actual days',weekly.length,41,0);add('weekly OHLCV grouping',JSON.stringify(hist.weekly),JSON.stringify(weekly));
function ema(p,n){const a=Array(p.length).fill(null),k=2/(n+1);a[n-1]=avg(p.slice(0,n));for(let i=n;i<p.length;i++)a[i]=p[i]*k+a[i-1]*(1-k);return a;}
for(const [label,bars,t] of [['daily',hist.bars,q.technical],['weekly',weekly.map(x=>({...x,adjusted:x})),q.weeklyTechnical]]){
 const p=bars.map(x=>x.adjusted.close),vol=bars.map(x=>x.volume),n=p.length;
 for(const per of [20,60,120,250]){
  const v=n>=per?avg(p.slice(-per)):null;add(label+' MA'+per,t.MA[per],v);
  add(label+' MA distance'+per,t.priceVsMAPct[per],v===null?null:(q.price/v-1)*100);
  add(label+' MA slope'+per,t.maSlope5Pct[per],n>=per+5?(v/avg(p.slice(-per-5,-5))-1)*100:null);
  add(label+' return'+per,t.returnPct[per],n>per?(p.at(-1)/p[n-per-1]-1)*100:null);
 }
 for(const per of [5,20,60])add(label+' mean volume'+per,t.volumeMean[per],n>=per?avg(vol.slice(-per)):null,.001);
 add(label+' last volume vs previous20',t.volumeRatio20,vol.at(-1)/avg(vol.slice(-21,-1)));
 let up=0,down=0,upDays=0,downDays=0;for(let i=n-20;i<n;i++){if(p[i]>p[i-1]){up+=vol[i];upDays++;}else if(p[i]<p[i-1]){down+=vol[i];downDays++;}}
 add(label+' up volume',t.upDownVolume20.upVolume,up,0);add(label+' down volume',t.upDownVolume20.downVolume,down,0);add(label+' up days',t.upDownVolume20.upDays,upDays,0);add(label+' down days',t.upDownVolume20.downDays,downDays,0);add(label+' up down volume ratio',t.upDownVolume20.ratio,up/down);
 for(const per of [20,60]){const range=n>=per?bars.slice(-per):null;add(label+' low'+per,t.ranges[per]?.support??null,range?Math.min(...range.map(x=>x.adjusted.low)):null);add(label+' high'+per,t.ranges[per]?.resistance??null,range?Math.max(...range.map(x=>x.adjusted.high)):null);}
 const changes=p.slice(1).map((x,i)=>x-p[i]);let gain=avg(changes.slice(0,14).map(x=>Math.max(0,x))),loss=avg(changes.slice(0,14).map(x=>Math.max(0,-x)));
 for(const x of changes.slice(14)){gain=(gain*13+Math.max(0,x))/14;loss=(loss*13+Math.max(0,-x))/14;}
 const rsi=loss===0?gain===0?50:100:100-100/(1+gain/loss);
 const tr=bars.slice(1).map((x,i)=>Math.max(x.adjusted.high-x.adjusted.low,Math.abs(x.adjusted.high-p[i]),Math.abs(x.adjusted.low-p[i])));let atr=avg(tr.slice(0,14));for(const x of tr.slice(14))atr=(atr*13+x)/14;
 add(label+' RSI Wilder14',t.RSI14,rsi);add(label+' ATR Wilder14',t.ATR14,atr);add(label+' ATR fraction price',t.ATR14Pct,atr/q.price*100);
 const e12=ema(p,12),e26=ema(p,26),d=e26.map((x,i)=>x===null?null:e12[i]-x).filter(x=>x!==null),sig=ema(d,9);
 add(label+' MACD DIF',t.MACD.DIF,d.at(-1));add(label+' MACD DEA',t.MACD.DEA,sig.at(-1));add(label+' MACD 2x histogram',t.MACD.histogram,2*(d.at(-1)-sig.at(-1)));
 const window=bars.slice(-(label==='daily'?252:52));let peak=0,draw=0;for(const x of window){peak=Math.max(peak,x.adjusted.close);draw=Math.min(draw,x.adjusted.close/peak-1);}
 add(label+' real window count',t.yearWindow,window.length,0);add(label+' incomplete year flag',t.yearWindowComplete,false);add(label+' real-history high',t.high52w,Math.max(...window.map(x=>x.adjusted.high)));add(label+' real-history low',t.low52w,Math.min(...window.map(x=>x.adjusted.low)));add(label+' close based drawdown',t.maxDrawdown52wPct,draw*100);
}
const report={issuerId:'I008',securityId:'S008',asOf:q.asOf,price:q.price,lockedSHA256:hash(lockRaw),historySHA256:hash(histRaw),status:checks.every(x=>x.pass)?'PASS frozen market technical arithmetic':'FAIL',checksCount:checks.length,checks,limits:['192days/41weeks are all listed history, not a complete year or three years','No 250day/60week MA synthesized','Volume uses shares; no free-float turnover or intraday volume distribution is implied','Relative strength follows locked market and coarse innovation-drug benchmark; no new live quotes used','Indicators have overlapping price information and do not prove accumulation or future price']};
fs.writeFileSync(root+'/qa/insilico_locked_technical_review.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks:checks.length,failures:checks.filter(x=>!x.pass),lockedSHA256:report.lockedSHA256,historySHA256:report.historySHA256},null,2));
