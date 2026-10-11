// Preserve disclosed units; never classify a count, ratio or per-share value as money.
// A comparative figure's observation period differs from the report containing it.
// Years used to name a bond maturity are identifiers, not observed financial years.
export function metricPeriodMetadata(metric,financial,explicit={},defaults={}){
 const reportPeriod=financial.reportPeriod??financial.period??defaults.reportPeriod??defaults.period??'待核';
 const originalPeriod=explicit.period??financial.period??defaults.period??'待核';
 const maturityIdentifier=/(?:convertible|bond|note)(?:20\d{2})/i.test(metric);
 let embedded=null;
 if(!maturityIdentifier){
  const yearThenPart=metric.match(/(20\d{2})(H[12]|Q[1-4])/i),partThenYear=metric.match(/(H[12]|Q[1-4])(20\d{2})/i);
  if(yearThenPart)embedded=yearThenPart[1]+yearThenPart[2].toUpperCase();
  else if(partThenYear)embedded=partThenYear[2]+partThenYear[1].toUpperCase();
  else {const year=metric.match(/20\d{2}/)?.[0];if(year)embedded='FY'+year;}
 }
 // Preserve an explicit finer period when it already refers to the same year.
 const explicitYears=[...String(explicit.period??'').matchAll(/20\d{2}/g)].map(match=>match[0]),explicitYear=explicitYears.at(-1);
 const embeddedYear=embedded?.match(/20\d{2}/)?.[0];
 const explicitIsFiner=explicit.period&&explicitYear===embeddedYear&&(/H[12]|Q[1-4]|\d{4}-\d{2}-\d{2}|months ended/i.test(explicit.period));
 const priorPeriod=/previous|priorYear|lastYear/.test(metric)&&/^2026H1$/.test(financial.period??'')?'2025H1':null;
 const period=maturityIdentifier?originalPeriod:explicitIsFiner?explicit.period:embedded??explicit.period??priorPeriod??financial.period??defaults.period??'待核';
 return {period,reportPeriod,periodOriginal:period!==originalPeriod?originalPeriod:undefined,periodBasis:maturityIdentifier?'字段年份为证券到期标识，数值观察期沿用原披露期间':embedded?'字段明确的数值期间；来源报告期间另列':explicit.period?'逐字段明确数值期间':'来源报告期间；无更细数值期证据',maturityIdentifier:maturityIdentifier?metric.match(/20\d{2}/)?.[0]:undefined};
}
export function financialRows(financial, issuer, defaults={}) {
 const rows=[];
 const sourceURL=financial.sourceURL??financial.source??defaults.sourceURL;
 if(!sourceURL)return rows;
 for(const [metric,value] of Object.entries(financial)){
  if(typeof value!=='number'||!Number.isFinite(value))continue;
  const explicit=financial.metricMetadata?.[metric]??financial.fieldMetadata?.[metric]??{};
  let currency=financial.currency??defaults.currency??null;
  let unit=financial.unit??defaults.unit??null;
  if(/USD/.test(metric))currency='USD';
  else if(/HKD/.test(metric))currency='HKD';
  else if(/CNY/.test(metric))currency='CNY';
  if(/ADS.*(?:Ratio|ratio)|(?:Ratio|ratio).*ADS/.test(metric)){
   currency='not monetary';unit='ordinary shares per ADS';
  }else if(/EPS|eps|ConversionPrice|conversionPrice|(?:Dividend|dividend).*?(?:PerShare|perShare|PerOrdinary|perOrdinary)|perShare(?:Dividend|dividend)/.test(metric)||/^(?:interim|final|annual|cash|cumulativeCash|prior|priorFinal)?Dividend(?:CNY|HKD|USD)?$/i.test(metric)){
   unit='per ordinary share';
  }else if(/Shares|shares/.test(metric)&&!/(?:consideration|Consideration).*Shares/.test(metric)){
   currency='not monetary';unit=/Billion|Bn|billion/.test(metric)?'billion shares':/SharesM|SharesExTreasury|WeightedShares|TotalSharesM|treasurySharesM/.test(metric)?'million shares':'shares';
  }else if(/Pct|Percent/.test(metric)){
   currency='not monetary';unit='percent';
  }else if(/Ratio|Fraction|Margin$|Share$|Factor$|Intensity$/.test(metric)){
   currency='not monetary';unit='fraction';
  }else if(/^(historicalPE|approxTTMPE|TTMPE)|PEResearch/.test(metric)){
   currency='not monetary';unit='multiple';
  }else if(/Days$|days$/.test(metric)){
   currency='not monetary';unit='days';
  }else if(/Molecules|molecules|Count$/.test(metric)){
   currency='not monetary';unit='count';
  }else if(/billion|bn/i.test(metric))unit='billion';
  else if(/million|HKDm/.test(metric))unit='million';
  const publicationDate=financial.publicationDate??financial.publication??financial.published??defaults.publicationDate??'精确公开日期待核';
  const fieldPublicationDate=explicit.publicationDate??publicationDate;
  const firstPublicDate=explicit.firstPublicDate??financial.firstPublicDate??defaults.firstPublicDate??null;
  const publicationTimeStatus=explicit.publicationTimeStatus??financial.publicationTimeStatus??defaults.publicationTimeStatus??'精确发布时间未核验';
  const cutoffDate=issuer.asOf??defaults.asOf??'2026-10-09';
  const availableDate=firstPublicDate??fieldPublicationDate;
  const cutoffStatus=/^20\d{2}-\d{2}-\d{2}/.test(availableDate)?(availableDate.slice(0,10)>cutoffDate?'晚于截止日，不作为截止日输入':availableDate.slice(0,10)===cutoffDate?'截止日公开，需结合发布时间判断收盘前后':'截止日前日期，盘中时分未核'):'公开日期缺失待核';
  const periodMeta=metricPeriodMetadata(metric,financial,explicit,defaults),period=periodMeta.period;
  const explicitUnit=explicit.unit;
  const normalizedExplicitUnit=explicitUnit==='CNYmillion'||explicitUnit==='USDmillion'?'million':explicitUnit==='CNYbillion'||explicitUnit==='USDbillion'?'billion':explicitUnit==='times'?'multiple':explicitUnit==='ratio'?'fraction':explicitUnit;
  const useExplicitUnit=normalizedExplicitUnit&&!/as field name|mixed/.test(normalizedExplicitUnit);
  const resolvedUnit=useExplicitUnit?normalizedExplicitUnit:unit??'待核';
  const nonMonetaryUnit=/^(?:GWh|vehicles|units|million units|count|days|percent|fraction|multiple|shares|million shares|billion shares|ordinary shares per ADS)$/.test(resolvedUnit);
  const resolvedCurrency=nonMonetaryUnit?'not monetary':explicit.currency??currency??'待核';
  rows.push({issuerId:issuer.issuerId,code:issuer.code,name:issuer.name,metric,value,
   currency:resolvedCurrency,unit:resolvedUnit,period,reportPeriod:periodMeta.reportPeriod,periodOriginal:periodMeta.periodOriginal,periodBasis:periodMeta.periodBasis,maturityIdentifier:periodMeta.maturityIdentifier,publicationDate:fieldPublicationDate,firstPublicDate,publicationTimeStatus,cutoffStatus,
   sourceURL:explicit.sourceURL??sourceURL,sourceType:financial.sourceType??defaults.sourceType??'issuer_disclosure_primary_content',
   note:[financial.note,financial.freeCashFlowBasis,financial.conflict,financial.dateStatus,
    /current.*Shares|treasuryShares/.test(metric)&&financial.currentSharesDisclosureAfterClose?'股数公告于基准日收盘后公开，不能冒充收盘前已知股本':null,
    explicit.status,periodMeta.periodOriginal?'数值期间 '+period+'；来源报告期间 '+periodMeta.reportPeriod+'；原period元数据 '+periodMeta.periodOriginal:null,resolvedUnit==='待核'?'原始字段单位尚待核，禁止直接用于估值':null].filter(Boolean).join('；')});
 }
 if(financial.historicalAnnual){
  const f=financial.historicalAnnual;
  for(let i=0;i<(f.periods?.length??0);i++){
   const raw={period:'FY'+f.periods[i],currency:f.currency,unit:f.unit,publicationDate:f.publicationDate,firstPublicDate:f.firstPublicDate,publicationTimeStatus:f.publicationTimeStatus,sourceURL:f.sourceURL,note:f.definitionWarning};
   for(const [k,v]of Object.entries(f))if(Array.isArray(v))raw[k]=v[i];
   delete raw.periods;
   rows.push(...financialRows(raw,issuer,defaults));
  }
 }
 return rows;
}
