import fs from 'node:fs/promises';
import path from 'node:path';
import {normalizePublication} from './publication_metadata.mjs';
import {financialRows,metricPeriodMetadata} from './financial_metadata.mjs';

const root=path.resolve(import.meta.dirname,'..');
const read=async name=>JSON.parse(await fs.readFile(path.join(root,name),'utf8'));
const bundle=await read('data/research_bundle.json');
const registry=await read('data/model_release_registry.json');
const models=await Promise.all((await fs.readdir(path.join(root,'data'))).filter(f=>f.endsWith('_model.json')).map(async file=>({file,model:await read('data/'+file)})));
const errors=[],tests=[];
function check(name,condition,details=null){tests.push({name,passed:!!condition,details});if(!condition)errors.push(name);}
const dateCases=[
 ['date before annual label','2026-04-24官网年报；董事会日期2026-03-26','2026-04-24',null],
 ['date before interim label','2026-09-24中报；2026-08-20结果公告','2026-09-24','2026-08-20'],
 ['source date after label','2026-08-28结果；中报2026-09-15；精确交易所发布时间未核验','2026-09-15','2026-08-28'],
 ['separate earlier clock','2026-09-29官网中报；Q2结果2026-08-28 17:31闭市后','2026-09-29','2026-08-28'],
 ['annual with comma','2026-04-09年报官网文件；FY业绩稿2026-03-18','2026-04-09','2026-03-18'],
 ['annual results before source','2026-03-30年度结果；H股年报2026-04-24，目录时区未独立核验','2026-04-24','2026-03-30'],
 ['annual date and comma','2026-04-21官网年报，全年结果2026-03-25','2026-04-21','2026-03-25'],
 ['US file date separate call','2026-09-15 US date; earnings call 2026-09-16 HK 08:00','2026-09-15',null],
 ['HKEX day month timestamp','31/08/2026 19:01','2026-08-31',null],
 ['recorded English date','15 September 2026','2026-09-15',null],
 ['date only ISO','2026-10-09','2026-10-09',null],
 ['ambiguous dates preserved','2026-08-28；2026-09-15','2026-08-28；2026-09-15',null],
 ['missing date preserved','精确公开日期待核','精确公开日期待核',null],
 ['invalid date preserved','2026-02-30','2026-02-30',null],
];
for(const [name,original,expected,earlier]of dateCases){
 const record={code:'03690.HK',publicationDate:original};normalizePublication(record);
 check(name,record.publicationDate===expected,{actual:record.publicationDate,expected});
 if(earlier)check(name+' earlier release',record.earlierResultsReleaseDate===earlier);
 if(name==='separate earlier clock')check('earlier clock not assigned to interim source',!record.sourcePublicationTime&&record.earlierResultsReleaseTime==='2026-08-28 17:31');
 if(name==='HKEX day month timestamp')check('explicit HKEX timestamp preserved',record.sourcePublicationTime==='2026-08-31 19:01 Asia/Hong_Kong');
 if(name==='US file date separate call')check('call time not assigned as publication',!record.sourcePublicationTime);
 if(name==='invalid date preserved')check('invalid date never treated as known cutoff',record.cutoffStatus==='公开日期缺失待核');
 const once=JSON.stringify(record);normalizePublication(record);check(name+' is idempotent',JSON.stringify(record)===once);
}
const urlOnly={publicationDate:'精确公开日期待核',sourceURL:'https://example.test/2026/1009/2026100900012.pdf'};
normalizePublication(urlOnly);check('URL never creates publication date',urlOnly.cutoffStatus==='公开日期缺失待核');
const nonMoney=financialRows({period:'H1 2026',sourceURL:'https://example.test/source.pdf',chipUnitsM:2.218,deliveries:191123,metricMetadata:{chipUnitsM:{unit:'million units',currency:null},deliveries:{unit:'vehicles',currency:null}}},{issuerId:'I062',code:'09660.HK'});
check('explicit nonmonetary fields retain nonmonetary currency',nonMoney.every(r=>r.currency==='not monetary'));
check('explicit nonmonetary units avoid false missing note',nonMoney.every(r=>!r.note.includes('原始字段单位尚待核')));
const unknown=financialRows({period:'FY2025',sourceURL:'https://example.test/source.pdf',cash:1},{issuerId:'I001',code:'688139.SH'});
check('genuinely missing units remain explicit',unknown[0].unit==='待核'&&unknown[0].currency==='待核'&&unknown[0].note.includes('原始字段单位尚待核'));
const periodCases=[
 ['comparative annual','revenue2024CNYmillion',{period:'FY2025'},{period:'FY2025'},'FY2024','FY2025'],
 ['comparative half year','capitalizedRD2025H1CNYmillion',{period:'2026H1'},{period:'2026H1'},'2025H1','2026H1'],
 ['half year before year','dividendH12026ProposedCNY',{period:'H1 2026'},{},'2026H1','H1 2026'],
 ['quarter token','revenue2025Q2CNYmillion',{period:'2026H1'},{},'2025Q2','2026H1'],
 ['finer explicit period','TTM2025Q2InventoryDays',{period:'2026H1'},{period:'12 months ended 2025-06-30'},'12 months ended 2025-06-30','2026H1'],
 ['maturity label','convertible2028PrincipalUSDmillion',{period:'2026H1'},{},'2026H1','2026H1'],
 ['fiscal comparator','revenue2025',{period:'FY2026 ended 2026-03-31'},{period:'FY2026 ended 2026-03-31'},'FY2025','FY2026 ended 2026-03-31'],
 ['fiscal ending-year explicit','revenue2025USDmillion',{period:'FY2025/26 ended2026-03-31'},{period:'FY2024/25 ended2025-03-31'},'FY2024/25 ended2025-03-31','FY2025/26 ended2026-03-31'],
];
for(const [name,metric,financial,explicit,expected,reportPeriod]of periodCases){
 const meta=metricPeriodMetadata(metric,financial,explicit);
 check(name+' value period preserved',meta.period===expected,{meta,expected});
 check(name+' source report period separate',meta.reportPeriod===reportPeriod);
}

const currentRows=bundle.sources;
const normalized=currentRows.map(row=>{
 const copy=structuredClone(row),issuerModels=models.filter(m=>m.model.issuerId===row.issuerId);
 const exact=issuerModels.flatMap(m=>(m.model.sources??[]).filter(s=>typeof s==='object'&&(s.sourceURL===copy.sourceURL||s.url===copy.sourceURL)));
 // Preview only. The production join is maintained in root assemble.mjs.
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(copy.publicationDate??'')){
  const candidates=exact.map(s=>s.publicationDateTimeHK??s.publicationDate??s.publicationTime).filter(Boolean);
  const normalizedCandidates=candidates.map(publicationDate=>normalizePublication({code:copy.code,publicationDate})).filter(s=>/^20\d{2}-\d{2}-\d{2}$/.test(s.publicationDate??''));
  const dates=[...new Set(normalizedCandidates.map(c=>c.publicationDate))];
  if(dates.length===1){
   copy.publicationDateOriginal??=copy.publicationDate;
   copy.publicationDate=normalizedCandidates[0].publicationDate;
   copy.sourcePublicationTime??=normalizedCandidates[0].sourcePublicationTime;
   copy.publicationTimeStatus=normalizedCandidates[0].publicationTimeStatus;
  }
 }
 return normalizePublication(copy,bundle.asOf);
});
const freshFinancial=[];
for(const {model}of models){
 const financial=model.financialVerified??model.anchor;
 const explicitMetrics=new Set((model.financialEvidence??[]).map(f=>f.metric));
 if(financial)freshFinancial.push(...financialRows(financial,model).filter(f=>!explicitMetrics.has(f.metric)));
 if(model.latestPeriod)freshFinancial.push(...financialRows(model.latestPeriod,model).filter(f=>!explicitMetrics.has(f.metric)));
 freshFinancial.push(...(model.financialEvidence??[]).filter(f=>typeof f.value==='number'&&f.sourceURL).map(f=>({...f,issuerId:model.issuerId,code:model.code})));
}
const missingUnit=rows=>rows.filter(r=>!r.currency||r.currency==='待核'||!r.unit||r.unit==='待核');
const corrected=Object.fromEntries(['I086','I079','I088','I062','I059'].map(id=>[id,freshFinancial.filter(r=>r.issuerId===id)]));
check('Tongcheng normalized anchor CNY million',corrected.I086.filter(r=>r.period==='FY2025'&&r.metric!=='dividendHKD').every(r=>r.currency==='CNY'&&r.unit==='million'));
check('Tongcheng per-share dividend separate',corrected.I086.find(r=>r.metric==='dividendHKD')?.currency==='HKD'&&corrected.I086.find(r=>r.metric==='dividendHKD')?.unit==='per ordinary share');
check('Yuewen normalized anchor CNY million',corrected.I079.filter(r=>r.period==='FY2025').every(r=>r.currency==='CNY'&&r.unit==='million'));
check('Corrected issuers have no missing source units',Object.values(corrected).flat().every(r=>!missingUnit([r]).length));
const bydPrimary=(await read('data/tech_primary_verified.json')).records.find(r=>r.issuerId==='I061');
const bydAnchor=models.find(m=>m.model.issuerId==='I061').model.anchor;
check('BYD four same-period inputs match saved primary anchor',bydPrimary.revenue===bydAnchor.revenueCNYmillion&&bydPrimary.profitAttributable===bydAnchor.profitAttributableCNYmillion&&bydPrimary.basicEPS===bydAnchor.EPSCNY&&bydPrimary.yearEndShares===bydAnchor.issuedSharesAtYearEnd);
check('BYD primary date and URL propagate recorded anchor',bydPrimary.source===bydAnchor.sourceURL&&bydPrimary.publicationDate===bydAnchor.publicationDate&&bydPrimary.originalSourceURL==='https://www.bydglobal.com/cn/investor-relations');
const bydRows=financialRows(bydPrimary,bydPrimary,{currency:'CNY',unit:'million'});
check('BYD mixed numeric units preserved',bydRows.find(r=>r.metric==='basicEPS')?.unit==='per ordinary share'&&bydRows.find(r=>r.metric==='yearEndShares')?.currency==='not monetary');
const periodCorrections=freshFinancial.filter(r=>r.periodOriginal).map(r=>({issuerId:r.issuerId,code:r.code,metric:r.metric,period:r.period,reportPeriod:r.reportPeriod,periodOriginal:r.periodOriginal,sourceURL:r.sourceURL,value:r.value}));
check('BYD FY2024 source row no longer mislabeled FY2025',freshFinancial.find(r=>r.issuerId==='I061'&&r.metric==='revenue2024CNYmillion')?.period==='FY2024');
check('BYD 2025H1 comparison no longer mislabeled 2026H1',freshFinancial.find(r=>r.issuerId==='I061'&&r.metric==='capitalizedRD2025H1CNYmillion')?.period==='2025H1');
check('Lenovo maturity identifier does not become future revenue period',freshFinancial.filter(r=>r.issuerId==='I065'&&r.metric.startsWith('convertible2028')).every(r=>r.period!=='FY2028'));
const releases=[];
for(const issuerId of ['I008','I027','I083','I032']){
 const entry=models.find(m=>m.model.issuerId===issuerId),model=entry?.model;
 const qaNames=issuerId==='I008'?['insilico_adapter_qa.json']:issuerId==='I027'?['xtalpi_adapter_qa.json']:issuerId==='I083'?['zhongan_qa.json','zhongan_native_workbook_qa.json']:['grand_pharma_qa.json','grand_pharma_workbook_qa.json'];
 const qa=[];for(const file of qaNames){try{const q=await read('qa/'+file);qa.push({file,modelVersion:q.modelVersion,passed:q.passed??q.pass,checks:q.checks??q.sourceBridgeChecks,characters:q.effectiveHanCharacters??q.effectiveHanzi});}catch{qa.push({file,missing:true});}}
 releases.push({issuerId,name:model?.name,modelFile:entry?.file,modelVersion:model?.modelVersion,approvedByRoot:registry.approvedIssuerIds.includes(issuerId),integratedInObservedBundle:[...bundle.models,...bundle.conditionedModels].some(m=>m.issuerId===issuerId),qa,limitation:'适配QA存在不代表根整合验收；发布确认和生产整合由根维护。'});
 check(issuerId+' dedicated QA version matches model',qa.every(q=>q.modelVersion===model?.modelVersion&&q.passed));
}
const report={createdAt:new Date().toISOString(),bundleFingerprintObserved:bundle.fingerprint,scope:'92 issuers / 96 stocks; products excluded. No bundle/build changes by this audit.',changedFiles:['tools/publication_metadata.mjs','tools/financial_metadata.mjs','data/tongcheng_model.json','data/yuewen_model.json','data/nio_model.json','data/horizon_model.json','data/ubtech_model.json','data/zhongan_model.json','data/tech_primary_verified.json'],releases,checks:tests.length,passed:errors.length===0,errors,tests,periodCorrections,publicationPreview:{sourceRows:currentRows.length,unknownBefore:currentRows.filter(r=>r.cutoffStatus==='公开日期缺失待核').length,unknownAfter:normalized.filter(r=>r.cutoffStatus==='公开日期缺失待核').length,afterCutoff:normalized.filter(r=>r.cutoffStatus==='晚于截止日，不作为截止日输入').length,remaining:normalized.filter(r=>r.cutoffStatus==='公开日期缺失待核').map(r=>({issuerId:r.issuerId,code:r.code,metric:r.metric,sourceURL:r.sourceURL,publicationDate:r.publicationDate}))},unitPreview:{missingObservedBundle:missingUnit(currentRows).length,missingFreshFinancialRows:missingUnit(freshFinancial).map(r=>({issuerId:r.issuerId,code:r.code,metric:r.metric,currency:r.currency,unit:r.unit,sourceURL:r.sourceURL}))},evidence:[{issuerId:'I086',local:'data/tech_raw/tongcheng_annual.txt:291',rawUnit:"RMB'000",rawRevenue:19395959,normalizedRevenue:19395.959,currency:'CNY',unit:'million'},{issuerId:'I079',local:'data/tech_raw/yuewen_annual.txt:137',rawUnit:"RMB'000",rawRevenue:7366176,normalizedRevenue:7366.176,currency:'CNY',unit:'million'}]};
await fs.writeFile(path.join(root,'qa/integration_metadata_audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({checks:report.checks,passed:report.passed,errors,publicationPreview:report.publicationPreview,unitPreview:report.unitPreview,releases}));
if(errors.length)process.exitCode=1;
