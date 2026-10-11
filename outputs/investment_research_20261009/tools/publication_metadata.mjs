// Normalize explicitly recorded disclosure dates. A date inside a URL is not
// sufficient evidence, and an approval/signature date is not publication.
const months={january:'01',jan:'01',february:'02',feb:'02',march:'03',mar:'03',april:'04',apr:'04',may:'05',june:'06',jun:'06',july:'07',jul:'07',august:'08',aug:'08',september:'09',sep:'09',sept:'09',october:'10',oct:'10',november:'11',nov:'11',december:'12',dec:'12'};
const validDate=value=>/^20\d{2}-\d{2}-\d{2}$/.test(value??'')&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
function explicitDates(value){
 const text=String(value??''),found=[];
 for(const match of text.matchAll(/20\d{2}-\d{2}-\d{2}/g))if(validDate(match[0]))found.push({date:match[0],index:match.index,end:match.index+match[0].length});
 for(const match of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/g)){
  const date=match[3]+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0');
  if(validDate(date))found.push({date,index:match.index,end:match.index+match[0].length});
 }
 for(const match of text.matchAll(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(20\d{2})\b/gi)){
  const date=match[3]+'-'+months[match[2].toLowerCase()]+'-'+match[1].padStart(2,'0');
  if(validDate(date))found.push({date,index:match.index,end:match.index+match[0].length});
 }
 return found.sort((a,b)=>a.index-b.index);
}
function oneDate(value){const dates=[...new Set(explicitDates(value).map(d=>d.date))];return dates.length===1?dates[0]:null;}
function sourceClause(value){
 const clauses=String(value??'').split(/[;；,，]/),matches=clauses.filter(c=>/(?:官网年报|年报(?:文件|官网)?|20-F官网|H股年报|官网中报|中报|annual report|interim report|US date)/i.test(c)&&oneDate(c));
 const dates=[...new Set(matches.map(oneDate))];
 return dates.length===1?{date:dates[0],text:matches.find(c=>oneDate(c)===dates[0])}:null;
}
function clockFor(value,date){
 const text=String(value??'');
 for(const entry of explicitDates(text).filter(d=>d.date===date)){
  const clock=text.slice(entry.end).match(/^[T\s]+(\d{2}:\d{2})(?::\d{2})?\b/)?.[1];
  if(clock&&Number(clock.slice(0,2))<24&&Number(clock.slice(3))<60)return clock;
 }
 return null;
}
export function normalizePublication(record,cutoff='2026-10-09'){
 if(record.code==='09961.HK'&&record.sourceURL==='https://investors.trip.com/system/files-encrypted/nasdaq_kms/assets/2026/02/25/18-33-13/Trip.com%20Group%20Limited%20Reports%20Unaudited%20Fourth%20Quarter%20and%20Full%20Year%20of%202025%20Financial%20Results.pdf'&&!/^20\d{2}-\d{2}-\d{2}/.test(record.publicationDate??'')){
  record.publicationDate='2026-02-25';record.publicationTimeStatus='官方财务稿首页明确02/25/2026；准确发布时间未核';record.publicationEvidenceLocal='data/tech_raw/trip_2025fy.txt:1';
 }
 const original=record.publicationDate??'',dates=[...new Set(explicitDates(original).map(d=>d.date))];
 const selected=sourceClause(original),sourceDate=selected?.date;
 const resultsClauses=String(original).split(/[;；,，]/).filter(c=>/(?:FY业绩|结果|业绩稿|季度业绩)/i.test(c));
 const resultDates=[...new Set(resultsClauses.map(oneDate).filter(Boolean))],firstDate=resultDates.length===1?resultDates[0]:null;
 if(dates.length&&!validDate(original)){
  record.publicationDateOriginal??=original;
  // With multiple unexplained dates, preserve the text instead of choosing.
  if(sourceDate||dates.length===1)record.publicationDate=sourceDate??dates[0];
  // The earlier results release need not contain this particular annual-note
  // input; do not assign its date as every metric's first public date.
  if(firstDate&&firstDate!==record.publicationDate){
   record.earlierResultsReleaseDate=firstDate;
   const earlierClock=clockFor(resultsClauses.find(c=>oneDate(c)===firstDate),firstDate);
   if(earlierClock)record.earlierResultsReleaseTime=firstDate+' '+earlierClock;
  }
 }
 const chosen=validDate(record.publicationDate)?record.publicationDate:null;
 if(chosen){
  const chosenClause=selected?.date===chosen?selected.text:String(original).split(/[;；,，]/).find(c=>oneDate(c)===chosen)??original;
  const clock=clockFor(chosenClause,chosen)??(/^\d{2}:\d{2}$/.test(record.publicationTime??'')?record.publicationTime:null);
  const timeZone=record.publicationTimeZone??record.sourcePublicationTimeZone??(record.code?.endsWith('.HK')?'Asia/Hong_Kong':null);
  if(clock){
   record.sourcePublicationTime??=`${chosen} ${clock}${timeZone?' '+timeZone:''}`;
   record.publicationTimeStatus='原核验说明记录源文件'+(timeZone==='Asia/Hong_Kong'?'香港时间 ': '时间 ')+clock+'；完整原文保留';
  }else if(/收盘后|闭市后/.test(chosenClause))record.publicationTimeStatus='原核验说明标记源文件收盘后；完整原文保留';
 }
 if(record.firstPublicDate&&!validDate(record.firstPublicDate)){
  const normalizedFirst=oneDate(record.firstPublicDate);
  if(normalizedFirst){record.firstPublicDateOriginal??=record.firstPublicDate;record.firstPublicDate=normalizedFirst;}
 }
 const first=record.firstPublicDate,publication=record.publicationDate;
 const date=validDate(first)?first:validDate(publication)?publication:null;
 record.cutoffStatus=!date?'公开日期缺失待核':date>cutoff?'晚于截止日，不作为截止日输入':date===cutoff?'截止日公开，需结合发布时间判断收盘前后':record.sourcePublicationTime?'截止日前已公开；源文件时分已记录':'截止日前已公开；准确时分未核';
 if(record.publicationDateOriginal&&!String(record.note??'').includes('公开日期原文 '+record.publicationDateOriginal))record.note=[record.note,'公开日期原文 '+record.publicationDateOriginal].filter(Boolean).join('；');
 return record;
}
