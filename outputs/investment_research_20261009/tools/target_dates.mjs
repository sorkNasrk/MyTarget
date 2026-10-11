export const nominalTargets={yearEnd:'2026-12-31',halfYear:'2027-04-09',oneYear:'2027-10-09',threeYear:'2029-10-09',fiveYear:'2031-10-09'};
// GovHK's gazetted 2026/2027 lists were published before the research cutoff.
// HKEX's securities-market rule excludes those public holidays. Unpublished
// future calendars remain unresolved; half-day sessions are trading days.
export const hkCalendarSources={
 rule:{url:'https://www.hkex.com.hk/Services/Trading-hours-and-Severe-Weather-Arrangements/Trading-Hours/Securities-Market?sc_lang=en',publicationDate:'2017-09-16'},
 2026:{url:'https://www.gov.hk/en/about/abouthk/holiday/2026.htm',publicationMonth:'2025-05'},
 2027:{url:'https://www.gov.hk/en/about/abouthk/holiday/2027.htm',publicationMonth:'2026-05'}
};
const hkHolidays={
 2026:new Set(['2026-01-01','2026-02-17','2026-02-18','2026-02-19','2026-04-03','2026-04-04','2026-04-06','2026-04-07','2026-05-01','2026-05-25','2026-06-19','2026-07-01','2026-09-26','2026-10-01','2026-10-19','2026-12-25','2026-12-26']),
 2027:new Set(['2027-01-01','2027-02-06','2027-02-08','2027-02-09','2027-03-26','2027-03-27','2027-03-29','2027-04-05','2027-05-01','2027-05-13','2027-06-09','2027-07-01','2027-09-16','2027-10-01','2027-10-08','2027-12-25','2027-12-27'])
};
export function resolveTargetDate(nominalDate,market){
 const nominal=new Date(nominalDate+'T00:00:00Z'),date=new Date(nominal);
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(nominalDate)||!Number.isFinite(+date)||date.toISOString().slice(0,10)!==nominalDate)throw Error('Invalid target date '+nominalDate);
 while([0,6].includes(date.getUTCDay()))date.setUTCDate(date.getUTCDate()-1);
 const previousWeekdayDate=date.toISOString().slice(0,10),year=date.getUTCFullYear();
 if(market==='HKEX'&&hkHolidays[year]){
  while([0,6].includes(date.getUTCDay())||hkHolidays[date.getUTCFullYear()]?.has(date.toISOString().slice(0,10)))date.setUTCDate(date.getUTCDate()-1);
  const actualDate=date.toISOString().slice(0,10),halfDay=actualDate==='2026-12-31'||actualDate==='2026-12-24'||actualDate==='2027-12-24'||actualDate==='2027-12-31'||actualDate==='2027-02-05'||actualDate==='2026-02-16';
  return {nominalDate,previousWeekdayDate,actualDate,market,session:halfDay?'half-day':'full-day',calendarStatus:'已按香港政府公布假期及HKEX证券交易规则核验'+(halfDay?'；半日市仍为有效交易日':''),sources:[hkCalendarSources.rule,hkCalendarSources[year]],unscheduledClosureAssumption:'按截止日已公开日历；未来临时停市未预测'};
 }
 return {nominalDate,previousWeekdayDate,actualDate:null,market,calendarStatus:'周末已解析；对应年度交易所节假日日历尚未核验，实际交易日待核'};
}
