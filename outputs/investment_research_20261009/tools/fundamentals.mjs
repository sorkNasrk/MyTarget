import fs from 'node:fs/promises';
const base=new URL('../',import.meta.url);
const {issuers,securities}=JSON.parse(await fs.readFile(new URL('data/universe.json',base),'utf8'));
await fs.mkdir(new URL('data/fundamentals_raw/',base),{recursive:true});
const fields=['TotalRevenue','NetIncome','OperatingIncome','FreeCashFlow','OperatingCashFlow','CapitalExpenditure','CashCashEquivalentsAndShortTermInvestments','TotalDebt','StockholdersEquity','OrdinarySharesNumber','DilutedEPS','StockBasedCompensation','ResearchAndDevelopment','GrossProfit'];
const types=fields.flatMap(x=>['annual'+x,'quarterly'+x]);
const records=[];
let done=0;
async function collect(issuer){
 const security=securities.find(x=>x.issuerId===issuer.issuerId&&x.code.endsWith('.HK'))||securities.find(x=>x.issuerId===issuer.issuerId);
 const url=`https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${security.yahoo}?type=${types.join(',')}&merge=false&period1=1672531200&period2=1791590400`;
 let record={...issuer,symbol:security.yahoo,url,source:'Yahoo Finance fundamentals-timeseries（待原始公告复核）',fetchedAt:new Date().toISOString(),publicationDateVerified:false,series:{}};
 try{
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`HTTP ${response.status}`);
 const data=await response.json();await fs.writeFile(new URL(`data/fundamentals_raw/${issuer.issuerId}.json`,base),JSON.stringify(data));
 for(const item of data.timeseries?.result||[])for(const key of item.meta?.type||[])record.series[key]=(item[key]||[]).filter(x=>x.asOfDate<='2026-10-09').map(x=>({date:x.asOfDate,period:x.periodType,currency:x.currencyCode,value:x.reportedValue?.raw}));
 const rev=record.series.annualTotalRevenue||[],net=record.series.annualNetIncome||[],fcf=record.series.annualFreeCashFlow||[];
 record.latestAnnual={revenue:rev.at(-1)||null,netIncome:net.at(-1)||null,freeCashFlow:fcf.at(-1)||null};
 record.status=Object.keys(record.series).length?'available_unverified':'missing';
 }catch(e){record.status='error';record.error=e.message;}
 records.push(record);done++;console.log(`${done}/${issuers.length} ${issuer.name} ${record.status}`);
}
const queue=[...issuers];await Promise.all(Array.from({length:5},async()=>{while(queue.length)await collect(queue.shift());}));
records.sort((a,b)=>a.issuerId.localeCompare(b.issuerId));
await fs.writeFile(new URL('data/fundamentals.json',base),JSON.stringify({asOf:'2026-10-09',limitation:'Period end date is not publication date. No point-in-time guarantee until original filings are verified; do not use unverified records for final recommendation.',records},null,2));
console.log(JSON.stringify({available:records.filter(x=>x.status==='available_unverified').length,missing:records.filter(x=>x.status!=='available_unverified').length}));
